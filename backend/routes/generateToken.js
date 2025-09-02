// routes/generateToken.js
import express from 'express';
import { generateWidgetToken } from '../utils/tokenUtils.js';

const router = express.Router();

// POST /api/generate-token
router.post('/generate-token', (req, res) => {
  const { businessId } = req.body || {};

  if (!businessId || typeof businessId !== 'string' || businessId.trim().length === 0) {
    return res.status(400).json({ error: 'Business ID is required' });
  }

  try {
    const token = generateWidgetToken(businessId.trim());
    const embedCode = `<script src="${req.protocol}://${req.get('host')}/widget.js?token=${token}"></script>`;

    return res.status(200).json({ token, businessId: businessId.trim(), embedCode });
  } catch (error) {
    console.error('Error generating widget token:', error);
    return res.status(500).json({ error: 'Failed to generate token' });
  }
});

export default router;


