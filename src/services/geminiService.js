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
  // Using gemini-2.0-flash for latest features, fallback handles quotas
  model = getGenerativeModel(ai, {
    model: 'gemini-2.0-flash',
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.7,
    },
  });
} catch (err) {
  console.error('[Firebase AI] Initialization failed:', err);
}

// ─── Local Knowledge Base (Fallback for 429) ───
const LOCAL_KNOWLEDGE_BASE = {
  'what is udaan-sme': 'UDAAN-SME is a comprehensive business management platform designed for small and medium enterprises. It helps you manage sales, inventory, customers, and analytics in one place.',
  'how to add a product': 'To add a product, go to the "Inventory" section from the sidebar and click on "Add Product". Fill in the details like name, price, and stock levels.',
  'how to create an invoice': 'You can create an invoice by navigating to the "Sales" page and clicking "New Invoice". Select a customer, add products, and click "Generate".',
  'how to manage staff': 'The "Staff" section in the dashboard allows you to add employees, assign roles (Admin, Manager, Staff), and track their tasks.',
  'is my data secure': 'Yes, UDAAN-SME uses Firebase security rules and authentication to ensure that your business data is only accessible to authorized users.',
  'hello': 'Hello! I am your UDAAN-SME assistant. How can I help you manage your business today?',
  'hi': 'Hi there! I am your UDAAN-SME assistant. How can I help you today?',
  'help': 'I can help with sales, invoices, inventory, and staff tasks. Try asking "How to add a product" or "What is UDAAN-SME?".',
};

const getLocalResponse = (message) => {
  const query = message.toLowerCase().trim();
  // Simple keyword matching for common questions
  for (const [key, value] of Object.entries(LOCAL_KNOWLEDGE_BASE)) {
    if (query.includes(key)) return value;
  }
  return null;
};

// ─── Retry Helper with Exponential Backoff ───
const fetchWithRetry = async (fn, maxRetries = 3, initialDelay = 1000) => {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const errorStr = (error.message || '').toLowerCase();
      // Only retry on 429 (Rate Limit) or 503 (Unavailable)
      const isRateLimited = errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('resource_exhausted');
      const isUnavailable = errorStr.includes('503') || errorStr.includes('unavailable');
      
      if (attempt < maxRetries - 1 && (isRateLimited || isUnavailable)) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.warn(`[Firebase AI] Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

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
    const responseText = await fetchWithRetry(async () => {
      const result = await chatSession.sendMessage(messageToSend);
      return result.response.text();
    });
    return responseText;
  } catch (error) {
    console.error('[Firebase AI] sendMessage error:', error);
    
    // Check for local fallback if API is unavailable or rate limited
    const errorStr = (error.message || '').toLowerCase();
    const isRateLimited = 
      errorStr.includes('429') || 
      errorStr.includes('quota') || 
      errorStr.includes('limit') || 
      errorStr.includes('resource_exhausted');

    if (isRateLimited) {
      console.warn('[Firebase AI] Rate limit or quota exceeded detected.');
      const localResponse = getLocalResponse(userMessage);
      if (localResponse) return `${localResponse} (Note: Running in offline mode due to high service load.)`;
      throw new Error('AI assistant is under high load (Quota Exceeded). Please try again in a moment.');
    }
    
    throw new Error('AI assistant is temporarily unavailable. Please try again.');
  }
};
