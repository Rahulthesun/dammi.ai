// services/queryPinecone.js
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
import getEmbedding from "./getEmbedding.js";

dotenv.config();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

/**
 * Query Pinecone with a user query and return top matches
 * @param {string} query - The user input
 * @param {string} businessId - The business ID to filter results
 * @param {number} topK - Number of top matches to return
 */
async function queryPinecone(query, businessId, topK = 3) {
  const queryEmbedding = await getEmbedding(query);

  const result = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
    filter: {
      businessId: businessId, // optional: to restrict search to a business
    },
  });

  const matches = result.matches || [];
  const relevantChunks = matches.map((match) => ({
    text: match.metadata.text,
    score: match.score,
  }));

  return relevantChunks;
}

export default queryPinecone;