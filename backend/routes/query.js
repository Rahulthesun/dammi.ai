// routes/query.js
import express from 'express';
import queryPinecone from '../services/queryPinecone.js';
import { generateAnswer } from '../services/llmService.js';

const router = express.Router();

/**
 * POST /query
 * Handle user questions and return AI-generated answers
 */
router.post('/', async (req, res) => {
  try {
    const { question, businessId, topK = 3 } = req.body;

    // Validation
    if (!question || !businessId) {
      return res.status(400).json({
        error: 'Missing required fields: question and businessId'
      });
    }

    console.log(`Processing query: "${question}" for business: ${businessId}`);

    // Query Pinecone for relevant chunks
    const relevantChunks = await queryPinecone(question, businessId, topK);

    if (relevantChunks.length === 0) {
      return res.json({
        answer: "I don't have enough information to answer that question. Please make sure your documents have been uploaded and processed.",
        sources: [],
        confidence: 0
      });
    }

    // Filter out chunks without text and create context for LLM
    const validChunks = relevantChunks.filter(chunk => chunk && chunk.text && typeof chunk.text === 'string');
    
    if (validChunks.length === 0) {
      return res.json({
        answer: "I found relevant documents but couldn't extract readable content. Please check your document format.",
        sources: [],
        confidence: 0
      });
    }

    const context = validChunks
      .map((chunk, index) => `Context ${index + 1}:\n${chunk.text}`)
      .join('\n\n');

    // Generate answer using LLM
    const answer = await generateAnswer(question, context);

    // Return structured response
    res.json({
      answer,
      sources: validChunks.map(chunk => ({
        text: (chunk.text && chunk.text.length > 200) 
          ? chunk.text.substring(0, 200) + '...' 
          : chunk.text || 'No text available',
        score: chunk.score
      })),
      confidence: validChunks[0]?.score || 0,
      businessId
    });

  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({
      error: 'Failed to process query',
      details: error.message
    });
  }
});

export default router;