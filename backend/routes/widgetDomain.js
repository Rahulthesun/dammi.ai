// backend/routes/widgetDomain.js
import express from 'express';
import { supabase } from '../lib/supabaseClient.js';

const router = express.Router();

// Upsert widget domain (replace if exists, else insert new)
router.post('/update-domain', async (req, res) => {
  try {
    const { businessId, newDomain } = req.body;

    if (!businessId || !newDomain) {
      return res.status(400).json({ error: 'Missing businessId or newDomain' });
    }

    console.log(`Updating domain for businessId: ${businessId} to newDomain: ${newDomain}`);

    const {user} = await supabase.auth.getUser(
      id = user_id
    );
    // Upsert domain for this business
    const { data, error } = await supabase
      .from('widget_domains')
      .upsert(
        { business_id: businessId, domain: newDomain },
        { onConflict: 'business_id' } // ensures only 1 row per business
      )
      .select();

    if (error) throw error;
    console.log(data);

    res.json({ message: '✅ Domain updated successfully', data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
