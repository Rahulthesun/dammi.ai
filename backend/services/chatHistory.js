export const chatHistory = {};

export function addMessage(userPhone, role, text, N = 10) {
  if (!chatHistory[userPhone]) chatHistory[userPhone] = [];
  
  chatHistory[userPhone].push({ role, content: text });
  
  // Keep only last N messages
  chatHistory[userPhone] = chatHistory[userPhone].slice(-N);
}
