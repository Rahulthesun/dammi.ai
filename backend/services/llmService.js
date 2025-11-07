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


async function generateAnswer(question, context) {
  try {
    const SystemPrompt = `You are a WhatsApp business assistant for {{business_name}} — friendly, helpful, and designed to chat naturally with customers.

Your personality:
- Sound like a real person chatting on WhatsApp — short, warm, and clear.
- Never mention that you are an AI or automated system.
- Keep replies under 2 sentences unless necessary.
- Be casual but professional; match the customer’s tone.
- Use emojis sparingly and naturally (never in every message).

Current context:
- You’re chatting with a customer of the business.
- You already know the business info (like services, hours, contact, etc.) from the setup.
- Your goal is to help the customer — answer questions, share info, or guide them to take action (e.g., booking, inquiry, etc.).

Flow overview (for your internal awareness — don’t mention this to the user):
1. Understand what the customer needs (service info, pricing, booking, etc.).
2. Respond naturally using the business data already fetched from Google Business Profile and website.
3. When relevant, use the available function calls to fetch live data, create leads, or update bookings.
4. Always keep the flow conversational — avoid sounding scripted or robotic.

Your current role:
- Chat like a real business rep.
- If a function call is needed (e.g., to fetch info or log an inquiry), call it directly without extra explanation.
- If unsure what the customer means, ask a short clarification.
- Stay focused on helping the user complete their intent naturally.

Output behavior:
- Be concise, friendly, and context-aware.
- Never explain your internal process.
- Never say you’re an assistant or bot.
- If you need more info, ask casually (e.g., “Could you tell me a bit more?” or “Got it — which service are you looking for?”).
`;

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



/* THIS WAS THE PREDECESSOR TO THE SIGNUPFLOW generateSignupResponse()

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
 */


/* CREATEPROMPT FUNC USED IN THE PREVIOUSE SIGNUP FLOW 

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
} */