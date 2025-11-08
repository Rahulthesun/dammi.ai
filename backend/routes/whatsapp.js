// routes/whatsapp.js (updated)
import express, { response } from 'express';
import axios from 'axios';
import queryPinecone from '../services/queryPinecone.js';
import { generateAnswer } from '../services/llmService.js';
import { getBusinessByPhoneNumberId, decryptToken, fetchBusinessData, generateb2bresponse, formatbusinessData } from '../services/businessService.js';
import { config } from 'dotenv';
import { chatHistory , addMessage } from '../services/chatHistory.js';
import { generateSignupResponse } from "../services/signupflow.js";

const router = express.Router();

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// ✅ Webhook verification
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully!');
    return res.status(200).send(challenge);
  }
  res.status(403).send('Verification failed');
});

// ✅ Handle incoming webhook
router.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  

  try {
    const body = req.body;
    const {entry} = body;
    entry.forEach(e => {
    e.changes.forEach(change => {
      const messageObj = change.value.messages?.[0];
      if (!messageObj) return;

      const from = messageObj.from; // sender's WhatsApp number
      const text = messageObj.text?.body || "";

      // Add user message
      addMessage(from, "user", text);

      console.log("Updated chat session:", chatHistory[from]);
      });
    });

    if (body.object !== 'whatsapp_business_account') {
      console.log('Ignored non-whatsapp_business_account object');
      return;
    }
    

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'messages' && change.value?.messages) {
          for (const message of change.value.messages) {
            console.log(message)
            await handleIncomingMessage(message, change.value);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
  }
});

// ✅ Handle incoming message
async function handleIncomingMessage(message, messageData) {
  try {
    const customerPhone = message.from;
    const messageText = message.text?.body;
    
    if (!messageText) return;

    // Get which business's phone number received this message
    const phoneNumberId = messageData.metadata?.phone_number_id;
    console.log(phoneNumberId)
    
    // Look up business from database
    const business = await getBusinessByPhoneNumberId(phoneNumberId);
    console.log(business);
    
    //Tests if Whatsapp Was connected or Whatsapp Account Exists
    if (!business || !business.wbaId) {
      console.error('❌ Business not found or WhatsApp not connected');
      return;
    }

    const accessTokenData = {
      encrypted : business.accessToken,
      iv:business.iv,
      authTag:business.authTag,
    };
    const accessToken = decryptToken(accessTokenData);//decryptToken(business.whatsapp.accessToken);

    const intent= await detectIntent(messageText)
    if (intent === "book") {
      
    await bookFunction(customerPhone, messageText, business, phoneNumberId, accessToken);
    return;
  }


   

    console.log(`📩 Message from ${customerPhone} to ${business.businessName} - ${business.adminPhone}: ${messageText}`);

    // Query this business's data
    const relevantChunks = await queryPinecone(messageText, business.businessId, 3);

    let responseText;
    if (!relevantChunks.length) {
      if (customerPhone === business.adminPhone && !business.confirmed) {
        const potential_businesses = await fetchBusinessData(business.businessName , business.businessLocation , business.phoneNumber);
        console.log(potential_businesses)
        const formattedBusinessData = potential_businesses.map(formatbusinessData).join("\n\n") 
        // null,2 formats nicely with indentation
        if (potential_businesses.length) {
          responseText = await generateSignupResponse(formattedBusinessData, "business_not_confirmed" , customerPhone , phoneNumberId);        
        }
      } else {
          responseText = "I don't have enough information to answer that question.";
      };      
      
    } else {
      console.log("Relevant Chunks Found:", relevantChunks);
      const context = relevantChunks
        .map((c, i) => `Context ${i + 1}:\n${c.text}`)
        .join('\n\n');
      responseText = await generateAnswer(messageText, context , business?.businessName , customerPhone);
    }

    console.log(responseText);

    // Decrypt the access token
    console.log(business.accessToken);
    
    // Send message using THEIR authorized token
    await sendMessage(
      customerPhone,
      responseText,
      business.phoneNumberId,
      accessToken
    );

    addMessage(business.phoneNumber, "AI" , responseText);

  } catch (error) {
    console.error('❌ Error handling message:', error);
  }
}
async function detectIntent(message) {
  const bookingKeywords = ["book", "reserve", "schedule", "appointment", "slot"];
  const lower = message.toLowerCase();
  const intent=await generateAnswer(`Analyze this user message: "${message}".
     Does the user want to book, reserve, schedule, or make an appointment 
    for a service? Reply with only "book" if yes, or "none" if no.`)
  return intent;

}
 const bookingSessions = new Map(); //need to switch this to a db storing sessions in the future

async function bookFunction(userPhone, messageText, business, phoneNumberId, accessToken) {
  try {
    // Check if we already have an ongoing booking session for this user
    let session = bookingSessions.get(userPhone);

    if (!session) {
      // Start a new booking conversation
      session = {
        messages: [],
        isComplete: false,
      };
      bookingSessions.set(userPhone, session);

      // AI asks the first booking-related question
      const firstQuestion = await generateAnswer(`
        You are a helpful booking assistant. The user said: "${messageText}".
        Start a booking conversation by asking your first question to gather booking details 
        (like service type, date/time, number of people, etc).
        Ask naturally and conversationally, one question at a time.
      `);

      session.messages.push({ role: "assistant", content: firstQuestion });
      await sendMessage(userPhone, firstQuestion, phoneNumberId, accessToken);
      return;
    }

    // Continue existing conversation
    session.messages.push({ role: "user", content: messageText });

    // Ask the AI whether it now has enough info
    const intentCheck = await generateAnswer(`
      Given the conversation so far:
      ${JSON.stringify(session.messages, null, 2)}

      Have you gathered enough information to confirm the booking?
      Reply with only "yes" or "no".
    `);

    if (intentCheck.toLowerCase().includes("no")) {
      // Continue asking follow-up questions
      const nextQuestion = await generateAnswer(`
        Based on the conversation so far:
        ${JSON.stringify(session.messages, null, 2)}

        Ask the next most relevant question to complete the booking details.
        Keep it short and conversational.
      `);

      session.messages.push({ role: "assistant", content: nextQuestion });
      await sendMessage(userPhone, nextQuestion, phoneNumberId, accessToken);
    } else {
      // Booking info is complete — summarize and notify admin
      const summary = await generateAnswer(`
        Summarize the booking conversation below into a neat, structured booking summary:
        ${JSON.stringify(session.messages, null, 2)}
      `);

      const adminMessage = `
📅 *New Booking Request*
-------------------------
👤 From: ${userPhone}
${summary}
-------------------------
⏰ Received: ${new Date().toLocaleString()}
      `;

      // Send to admin
      await sendMessage(business.whatsapp.adminPhone, adminMessage, phoneNumberId, accessToken);

      // Confirm with user
      await sendMessage(
        userPhone,
        " Thank you! Your booking has been confirmed and sent to our admin. We'll contact you soon!",
        phoneNumberId,
        accessToken
      );

      // End the session
      bookingSessions.delete(userPhone);
    }
  } catch (error) {
    console.error("❌ Error in bookFunction:", error.response?.data || error.message);
  }
}

// ✅ Send message
async function sendMessage(to, text, phoneNumberId, accessToken) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, //This is business phone number id
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('✅ Message sent');
    
  } catch (error) {
    console.error('❌ Error sending message:', error.response?.data || error.message);
  }
}

export default router;