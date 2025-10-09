// backend/index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

// Middleware
app.use(express.static('./'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // redundant with bodyParser.json(), but safe

// Import routes
import widgetRoute from './routes/widget.js';
import submitQuestionnaire from './routes/submitQuestionnaire.js';
import uploadRoutes from './routes/upload.js';
import queryRoute from './routes/query.js';
import whatsappRoute from './routes/whatsapp.js';
import generateTokenRouter from './routes/generateWidgetToken.js';
import widgetDomainRoute from './routes/widgetDomain.js';
import scrapeWebsiteRoute from './routes/scrapeWebsite.js';
import whatsappRoutes from "./routes/whatsapp.js";

// Register routes
app.use('/', widgetRoute);
app.use('/api/submit-questionnaire', submitQuestionnaire);
app.use('/api/upload', uploadRoutes);
app.use('/query', queryRoute);
app.use('/whatsapp', whatsappRoute);
app.use('/generate-widget-token', generateTokenRouter);
app.use('/api/widget-domain', widgetDomainRoute);
app.use('/api/scrape-website', scrapeWebsiteRoute);
app.use("/api/whatsapp", whatsappRoutes);
// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running ✅' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   POST /api/upload - Upload documents`);
  console.log(`   POST /query - Query documents`);
  console.log(`   GET /whatsapp/webhook - Webhook verification`);
  console.log(`   POST /whatsapp/webhook - Handle WhatsApp messages`);
  console.log(`   POST /api/submit-questionnaire - Submit questionnaire`);
});
