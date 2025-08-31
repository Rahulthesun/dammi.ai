// scripts/generateToken.js
import dotenv from 'dotenv';
dotenv.config();

import { generateWidgetToken } from '../utils/tokenUtils.js';
// Get business ID from command line argument or use default
const businessId = process.argv[2] || 'abc123';
const token = generateWidgetToken(businessId);

console.log(`Generated token for ${businessId}:`);
console.log(token);
