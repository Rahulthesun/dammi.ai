// routes/whatsapp.js
import express from 'express';
import axios from 'axios';
import queryPinecone from '../services/queryPinecone.js';
import { generateAnswer } from '../services/llmService.js';

const router = express.Router();

// WhatsApp API configuration
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

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
  res.sendStatus(200); // immediately acknowledge to Meta

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
            await handleIncomingMessage(message, change.value);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
  }
});

// ✅ Handle a received WhatsApp message
async function handleIncomingMessage(message, messageData) {
  try {
    const from = message.from;
    const messageText = message.text?.body;

    if (!messageText) return console.log('Non-text message received, skipping...');
    console.log(`📩 Message from ${from}: ${messageText}`);

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const businessId = process.env.DEFAULT_BUSINESS_ID || 'a4823868-b57d-4f27-b715-a1b93ce8308d';
    console.log('Using business ID:', businessId);
    const relevantChunks = await queryPinecone(messageText, businessId, 3);

    let responseText;
    if (!relevantChunks.length) {
      responseText =
        "I don't have enough information to answer that question. Please make sure your documents are uploaded.";
    } else {
      const context = relevantChunks
        .map((c, i) => `Context ${i + 1}:\n${c.text}`)
        .join('\n\n');
      responseText = await generateAnswer(messageText, context);
    }

    await sendMessage(from, responseText);
  } catch (error) {
    console.error('❌ Error handling message:', error);
    await sendMessage(
      message.from,
      "Sorry, I encountered an error while processing your message. Please try again."
    );
  }
}

// ✅ Send message
async function sendMessage(to, text) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('✅ Message sent:', response.data);
  } catch (error) {
    console.error('❌ Error sending message:', error.response?.data?.error || error.message);
  }
}

export default router;
