import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { createChatSession, sendChatMessage } from '../../services/geminiService';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hi! I am your AI assistant. How can I help you today?' },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceResponseEnabled, setVoiceResponseEnabled] = useState(false);
  const { language, changeLanguage } = useLanguage();

  const chatHistoryRef = useRef(null);
  const chatSessionRef = useRef(null); // Holds the multi-turn Firebase AI chat session

  // Speech Recognition Setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognitionRef = useRef(null);

  // Initialize (or reset) the chat session
  const initChatSession = useCallback(() => {
    chatSessionRef.current = createChatSession(language);
  }, [language]);

  // Create chat session when chatbot opens
  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
      initChatSession();
    }
    // Destroy session when closed so next open is fresh
    if (!isOpen) {
      chatSessionRef.current = null;
    }
  }, [isOpen, initChatSession]);

  // Reset chat session when language changes — old session has the previous language baked in
  const prevLanguageRef = useRef(language);
  useEffect(() => {
    if (isOpen && prevLanguageRef.current !== language) {
      prevLanguageRef.current = language;
      chatSessionRef.current = null; // discard old session
      initChatSession();             // start fresh with new language
      const langLabel = language === 'hi' ? 'Hindi' : language === 'ta' ? 'Tamil' : 'English';
      setMessages(prev => [...prev, { role: 'ai', content: `Language switched to ${langLabel}. How can I help you?` }]);
    }
  }, [language, isOpen, initChatSession]);

  // Speech recognition setup
  useEffect(() => {
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onresult = (event) => {
        setInputMessage(event.results[0][0].transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [SpeechRecognition]);

  // Update recognition language when language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang =
        language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : 'en-US';
    }
  }, [language]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  const toggleChatbot = () => setIsOpen(!isOpen);

  const handleSendMessage = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputMessage('');
    setIsLoading(true);

    // Lazily create session if not yet created
    if (!chatSessionRef.current) {
      initChatSession();
    }

    try {
      const response = await sendChatMessage(chatSessionRef.current, userMessage, language);
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
      if (voiceResponseEnabled) speakText(response);
    } catch (error) {
      const errMsg = error.message || 'AI assistant is temporarily unavailable.';
      setMessages(prev => [...prev, { role: 'ai', content: errMsg }]);
      if (voiceResponseEnabled) speakText('AI assistant is temporarily unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else if (recognitionRef.current) {
      try { recognitionRef.current.start(); } catch (e) { /* already started */ }
    } else {
      alert('Your browser does not support Speech Recognition.');
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">

      {/* Chat Panel */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-surface-200 w-80 sm:w-96 mb-4 flex flex-col overflow-hidden pointer-events-auto transition-all duration-300 transform origin-bottom-right drop-shadow-lg">

          {/* Header */}
          <div className="bg-primary-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              <div>
                <h3 className="font-bold text-lg leading-tight">AI Assistant</h3>
                <p className="text-primary-200 text-xs">Powered by Firebase AI</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-primary-700 text-white text-xs rounded border-none focus:ring-0 cursor-pointer p-1"
              >
                <option value="en">EN</option>
                <option value="hi">HI</option>
                <option value="ta">TA</option>
              </select>

              <button onClick={toggleChatbot} className="text-primary-100 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          {/* Voice Toggle Bar */}
          <div className="bg-surface-50 px-4 py-2 flex justify-between items-center border-b border-surface-200 text-xs">
            <span className="text-surface-600 font-medium">Voice Response</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={voiceResponseEnabled} onChange={() => setVoiceResponseEnabled(!voiceResponseEnabled)} />
              <div className="w-9 h-5 bg-surface-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>

          {/* Chat History */}
          <div className="flex-1 p-4 overflow-y-auto bg-surface-50/50 h-80 space-y-4" ref={chatHistoryRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-none'
                    : 'bg-white text-surface-800 border border-surface-200 shadow-sm rounded-tl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-surface-400 border border-surface-200 shadow-sm rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center">
                  <div className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-surface-200 flex items-center gap-2">
            <button
              type="button"
              onClick={handleMicClick}
              className={`p-2 rounded-full transition-colors flex-shrink-0 ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-surface-100 text-surface-500 hover:bg-surface-200'}`}
              title="Voice Input"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isListening ? 'Listening...' : 'Type your message...'}
              className="flex-1 bg-surface-50 border border-surface-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-sm"
              title="Send Message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>

        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleChatbot}
        className={`${isOpen ? 'bg-surface-800 text-white hover:bg-surface-900' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-xl drop-shadow-xl hover:-translate-y-1'} pointer-events-auto p-4 rounded-full transition-all duration-300 flex items-center justify-center`}
        title="Open AI Assistant"
      >
        {isOpen ? (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        )}
      </button>

    </div>
  );
};

export default FloatingChatbot;
