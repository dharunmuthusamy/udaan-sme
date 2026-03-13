import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { app } from '../firebase/firebaseConfig';

// ─── Firebase AI Logic ───
// Uses Firebase's built-in AI integration — no API key exposed in the browser.
// Authentication is handled automatically by Firebase via the app instance.
// Requires "Firebase AI Logic" to be enabled in the Firebase Console.

let ai = null;
let model = null;

try {
  ai = getAI(app, { backend: new GoogleAIBackend() });
  model = getGenerativeModel(ai, {
    model: 'gemini-2.5-flash-lite',
    generationConfig: {
      maxOutputTokens: 600,
      temperature: 0.7,
    },
  });
} catch (err) {
  console.error('[Firebase AI] Initialization failed:', err);
}

// System persona injected at the start of every chat session
const SYSTEM_CONTEXT = `You are a friendly and concise AI assistant for UDAAN-SME, an all-in-one business management platform for small and medium enterprises. You help users with: sales, invoices, quotations, purchase orders, inventory, CRM/customers, staff tasks, and analytics. Keep replies short and practical — 2 to 3 sentences max. Never mention competitor products.`;

/**
 * Creates a new multi-turn chat session.
 * Call this once per chatbot open, then reuse the session for all messages.
 * @param {string} language - Initial language ('en', 'hi', 'ta')
 * @returns {ChatSession | null}
 */
export const createChatSession = (language = 'en') => {
  if (!model) return null;

  let languageInstruction = 'Respond in English.';
  if (language === 'hi') languageInstruction = 'Respond in Hindi (हिंदी).';
  else if (language === 'ta') languageInstruction = 'Respond in Tamil (தமிழ்).';

  return model.startChat({
    history: [
      {
        role: 'user',
        parts: [{ text: `${SYSTEM_CONTEXT} ${languageInstruction}` }],
      },
      {
        role: 'model',
        parts: [{ text: 'Understood! I\'m your UDAAN-SME assistant. How can I help you today?' }],
      },
    ],
  });
};

/**
 * Sends a message to an existing chat session and returns the AI response.
 * @param {ChatSession} chatSession - The active chat session from createChatSession()
 * @param {string} userMessage - The user's message
 * @param {string} language - The current language ('en', 'hi', 'ta')
 * @returns {Promise<string>} - The AI's text response
 */
export const sendChatMessage = async (chatSession, userMessage, language = 'en') => {
  if (!chatSession) {
    throw new Error('AI assistant is unavailable. Please check Firebase AI Logic is enabled in your Firebase Console.');
  }

  // Append a language reminder for non-English
  let messageToSend = userMessage;
  if (language === 'hi') messageToSend += ' (Please reply in Hindi)';
  else if (language === 'ta') messageToSend += ' (Please reply in Tamil)';

  try {
    const result = await chatSession.sendMessage(messageToSend);
    return result.response.text();
  } catch (error) {
    console.error('[Firebase AI] sendMessage error:', error);
    throw new Error('AI assistant is temporarily unavailable. Please try again.');
  }
};
