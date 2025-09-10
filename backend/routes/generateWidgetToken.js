import express from 'express';
import { generateWidgetToken } from '../utils/tokenUtils.js';

const router = express.Router();

/**
 * POST /generate-widget-token
 * Generate a secure widget token for a given businessId
 */
router.post('/', (req, res) => {
  const { businessId } = req.body;
  console.log("business id is: ",businessId)

  if (!businessId) {
    return res.status(400).json({ error: 'Missing businessId' });
  }

  try {
    const token = generateWidgetToken(businessId);
    res.json({ token });
  } catch (error) {
    console.error('Error generating widget token:', error);
    res.status(500).json({ error: 'Failed to generate widget token' });
  }
});

export default router;
