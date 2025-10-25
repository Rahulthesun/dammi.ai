// routes/whatsapp.js (updated)
import express from 'express';
import axios from 'axios';
import queryPinecone from '../services/queryPinecone.js';
import { generateAnswer } from '../services/llmService.js';
import { getBusinessByPhoneNumberId, decryptToken } from '../services/businessService.js';

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
    
    // Look up business from database
    const business = await getBusinessByPhoneNumberId(phoneNumberId);
    
    if (!business || !business.whatsapp?.isActive) {
      console.error('❌ Business not found or WhatsApp not connected');
      return;
    }
    const intent= await detectIntent(messageText)
    if (intent === "book") {
    await bookFunction(customerPhone, messageText,business);
  }


    console.log(`📩 Message from ${customerPhone} to ${business.businessName}: ${messageText}`);

    // Query this business's data
    const relevantChunks = await queryPinecone(messageText, business.businessId, 3);

    let responseText;
    if (!relevantChunks.length) {
      responseText = "I don't have enough information to answer that question.";
    } else {
      const context = relevantChunks
        .map((c, i) => `Context ${i + 1}:\n${c.text}`)
        .join('\n\n');
      responseText = await generateAnswer(messageText, context);
    }

    // Decrypt the access token
    const accessToken = decryptToken(business.whatsapp.accessToken);

    // Send message using THEIR authorized token
    await sendMessage(
      customerPhone,
      responseText,
      business.whatsapp.phoneNumberId,
      accessToken
    );

  } catch (error) {
    console.error('❌ Error handling message:', error);
  }
}
async function detectIntent(message) {
  const bookingKeywords = ["book", "reserve", "schedule", "appointment", "slot"];
  const lower = message.toLowerCase();

  if (bookingKeywords.some(word => lower.includes(word))) {
    return "book";
  }
  return "other";
}
 async function bookFunction(userPhone, messageText) {
  try {
    const summary = `
📅 *New Booking Request*
-------------------------
👤 From: ${userPhone}
💬 Message: "${messageText}"
⏰ Received: ${new Date().toLocaleString()}
-------------------------
`;

    // Send message to Admin
    await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: business.whatsapp.adminPhone,
        text: { body: summary },
      },
      { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
    );

    //confirmation to user
    await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: userPhone,
        text: { body: "✅ Your booking request has been sent to the admin. We’ll contact you shortly!" },
      },
      { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
    );
  } catch (error) {
    console.error("Error in bookFunction:", error.response?.data || error);
  }
}

// ✅ Send message
async function sendMessage(to, text, phoneNumberId, accessToken) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
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