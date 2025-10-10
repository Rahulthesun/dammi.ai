// routes/whatsappOAuth.js
import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const router = express.Router();

const META_APP_ID = process.env.META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;
const REDIRECT_URI = process.env.APP_URL + '/api/whatsapp/oauth/callback';

// 🔄 OAuth Callback - Meta redirects here after business authorizes
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).send('Authorization code missing');
    }

    // Decode state to get businessId
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    const { businessId } = stateData;

    console.log(`🔐 OAuth callback for business: ${businessId}`);

    // Step 1: Exchange code for access token
    const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: META_APP_ID,
        client_secret: META_APP_SECRET,
        code: code,
        redirect_uri: REDIRECT_URI
      }
    });

    const accessToken = tokenResponse.data.access_token;
    console.log('✅ Access token received');

    // Step 2: Get WhatsApp Business Account ID (WABA ID)
    const wabaResponse = await axios.get('https://graph.facebook.com/v18.0/debug_token', {
      params: {
        input_token: accessToken,
        access_token: `${META_APP_ID}|${META_APP_SECRET}`
      }
    });

    const wabaId = wabaResponse.data.data.granular_scopes?.find(
      s => s.scope === 'whatsapp_business_management'
    )?.target_ids?.[0];

    if (!wabaId) {
      throw new Error('Could not retrieve WhatsApp Business Account ID');
    }

    console.log(`✅ WABA ID: ${wabaId}`);

    // Step 3: Get Phone Number ID
    const phoneResponse = await axios.get(`https://graph.facebook.com/v18.0/${wabaId}/phone_numbers`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const phoneNumberData = phoneResponse.data.data[0]; // Get first phone number
    const phoneNumberId = phoneNumberData.id;
    const phoneNumber = phoneNumberData.display_phone_number;

    console.log(`✅ Phone Number: ${phoneNumber} (ID: ${phoneNumberId})`);

    // Step 4: Subscribe to webhooks for this phone number
    await axios.post(
      `https://graph.facebook.com/v18.0/${META_APP_ID}/subscriptions`,
      {
        object: 'whatsapp_business_account',
        callback_url: `${process.env.APP_URL}/api/whatsapp/webhook`,
        verify_token: process.env.WHATSAPP_VERIFY_TOKEN,
        fields: 'messages',
        access_token: accessToken
      }
    );

    console.log('✅ Webhook subscribed');

    // Step 5: Store everything in your database
    await saveWhatsAppConnection({
      businessId,
      wabaId,
      phoneNumberId,
      phoneNumber,
      accessToken: encrypt(accessToken), // Encrypt before storing!
      connectedAt: new Date()
    });

    console.log('✅ WhatsApp connection saved to database');

    // Step 6: Redirect back to your app with success
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?whatsapp=connected`);

  } catch (error) {
    console.error('❌ OAuth error:', error.response?.data || error.message);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?whatsapp=error`);
  }
});

// Helper: Encrypt access token before storing
function encrypt(text) {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

// Helper: Decrypt access token when using
function decrypt(encryptedData) {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(encryptedData.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Helper: Save to database
async function saveWhatsAppConnection(data) {
  const { error } = await supabase
    .from('whatsapp_connections')
    .upsert({
      business_id: data.businessId,
      waba_id: data.wabaId,
      phone_number_id: data.phoneNumberId,
      phone_number: data.phoneNumber,
      access_token: data.accessToken.encrypted,
      iv: data.accessToken.iv,
      auth_tag: data.accessToken.authTag,
      connected_at: data.connectedAt
    });
    if (error) throw error;
  
  console.log('Saved to database:', { ...data, accessToken: '[ENCRYPTED]' });
}

export default router;