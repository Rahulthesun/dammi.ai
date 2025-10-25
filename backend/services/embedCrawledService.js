import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100; // For context continuity

export async function embedAndStoreCrawledData(text, sourceUrl, businessId) {
  const cleanText = cleanWebText(text);
  
  if (!cleanText || cleanText.length < 50) {
    console.log(`⚠️  Content too short to embed from ${sourceUrl}`);
    return;
  }

  const chunks = chunkTextSmart(cleanText, CHUNK_SIZE, CHUNK_OVERLAP);
  const vectors = [];
  try {
    for (const chunk of chunks) {
      console.log("Chunk : "+chunk+"\n")
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
      });
      

      vectors.push({
        id: `${businessId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        values: embedding.data[0].embedding,
        metadata: {
          businessId,
          source: sourceUrl,
          type: "web",
          text: chunk,
          createdAt: new Date().toISOString(),
          chunkLength: chunk.length,
        },
      });
    }

    // Batch upsert for efficiency
    if (vectors.length > 0) {
      await index.upsert(vectors);
      console.log(`🌐 Embedded ${vectors.length} chunks from ${sourceUrl} for business ${businessId}`);
    }
  } catch (error) {
    console.error(`❌ Error embedding/storing data from ${sourceUrl}:`, error.message);
    throw error;
  }
}

/**
 * Smart chunking: splits on sentence boundaries to avoid mid-sentence cuts
 */
function chunkTextSmart(text, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + sentence).length > size) {
      if (current) chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }

  if (current) chunks.push(current.trim());

  // Add overlap between chunks for context
  if (overlap > 0) {
    const overlappedChunks = [];
    for (let i = 0; i < chunks.length; i++) {
      let chunk = chunks[i];
      
      if (i > 0) {
        const prevChunk = chunks[i - 1];
        const overlapText = prevChunk.slice(-overlap);
        chunk = overlapText + ' ' + chunk;
      }
      
      overlappedChunks.push(chunk);
    }
    return overlappedChunks;
  }

  return chunks;
}

/**
 * Clean web text: remove scripts, styles, and boilerplate
 */
function cleanWebText(text) {
  if (!text) return '';

  return text
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove common boilerplate keywords (optional, be selective)
    .replace(/subscribe|newsletter|follow us|contact us/gi, '')
    // Final trim
    .trim()
    // Remove if result is too short
    .slice(0, 50000); // Cap at 50k chars to avoid huge embeddings
}