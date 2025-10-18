// services/llmService.js
import Groq from 'groq-sdk';
import dotenv from 'dotenv';dotenv.config();

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const steps = {
  business_not_confirmed: {
    value: "not_confirmed",
    description: "User has not confirmed which business is theirs yet.",
  },
  business_confirmed: {
    value: "confirmed",
    description: "User confirmed their business identity.",
  },
  business_details_pending: {
    value: "details_pending",
    description: "Collect or verify missing business details (hours, website, phone, etc.).",
  },
  ready: {
    value: "ready",
    description: "All business details are confirmed and setup is complete.",
  },
  question_answer: {
    value: "qa",
    description: "User asks a question; AI should answer based only on context.",
  },
};


/**
 * Generate an answer using retrieved context and user question
 * @param {string} question - The user's question
 * @param {string} context - Retrieved relevant chunks from Pinecone
 * @returns {Promise<string>} - Generated answer
 * 
 * 
 * 
 */
function createPrompt({ step, context, question }) {
  const dammiIntro = `
You are Dammi.ai — a B2B conversational WhatsApp agent that helps other businesses create and manage their own WhatsApp-based agents.
You speak casually, like a real person chatting on WhatsApp — short, friendly, and direct.
You’re currently guiding an admin through their business setup flow.
`;

  // Helper to include question only if it exists
  const questionSection = question ? `\nQuestion: ${question}\n` : '';

  switch (step) {
    case steps.business_not_confirmed.value:
      return `
${dammiIntro}

Context:
${context}
${questionSection}

Instructions:
- You’ve found some possible business matches online.
- Ask the user to confirm which one is theirs.
- Be chill and conversational (like “Hey, found a few matches. Which one’s yours?”).
- Keep it short and natural.
- Never mention “context” or “AI.”

Answer:
`;

    case steps.business_confirmed.value:
    case steps.business_details_pending.value:
      // combined step
      return `
${dammiIntro}

Context:
${context}
${questionSection}

Instructions:
- The user has not confirmed their business and you are collecting details (hours, website, phone, etc.).
- Ask naturally for missing information or acknowledge what’s already confirmed.
- Keep it short, friendly, and casual.
- Never mention “AI” or “context.”

Answer:
`;

    case steps.ready.value:
      return `
${dammiIntro}

Context:
${context}
${questionSection}

Instructions:
- The business setup is complete.
- Respond normally to the admin’s messages.
- Be short, confident, and conversational.
- Avoid filler or robotic phrasing.

Answer:
`;

    case steps.question_answer.value:
    default:
      return `
${dammiIntro}

Context:
${context}
${questionSection}

Instructions:
- Answer based ONLY on what’s in the context.
- If you don’t have the info, say: “Hmm, I don’t have that info yet.”
- Keep replies short, human, and clear (like WhatsApp messages).
- Stay under 200 words.
- Never mention “context” or “AI.”

Answer:
`;
  }
}


export async function generateConfigResponse(businessData , step) {
  try {
    const prompt = createPrompt({
      step: step,
      context: businessData,
      question: ""
    });
 


  const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant", // Fast and good quality
      temperature: 0.1, // Low temperature for factual responses
      max_tokens: 300,
    });

    console.log(completion.choices[0]?.message?.content || "I couldn't generate an answer at the moment.");
    return completion.choices[0]?.message?.content || "I couldn't generate an answer at the moment.";
    
  } catch (error) {
    console.error('Error generating answer with Groq:', error);
    throw new Error('Failed to generate answer');
  }
  
}

async function generateAnswer(question, context) {
  try {
    const prompt = `You are a helpful AI assistant that answers questions based on the provided context. 
    
Context:
${context}

Question: ${question}

Instructions:
- Answer the question based ONLY on the provided context
- Provide a direct, helpful answer without mentioning the words "context", "context 1", etc.
- Do NOT say phrases like "based on the context" or "according to the context"
- If the context doesn't contain enough information, say "I don't have enough information to answer that question"
- Be concise and helpful
- If relevant, reference specific details from the context
- Keep your answer under 200 words

Answer:`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant", // Fast and good quality
      temperature: 0.1, // Low temperature for factual responses
      max_tokens: 300,
    });

    return completion.choices[0]?.message?.content || "I couldn't generate an answer at the moment.";
    
  } catch (error) {
    console.error('Error generating answer with Groq:', error);
    throw new Error('Failed to generate answer');
  }
}

export {generateAnswer};