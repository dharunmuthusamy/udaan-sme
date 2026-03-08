import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { updateUserProfile } from '../services/dbService';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const { userData, user } = useAuth();
  const [language, setLanguage] = useState('en');

  // Load user preference on mount/auth change
  useEffect(() => {
    if (userData?.preferredLanguage) {
      if (['en', 'ta', 'hi'].includes(userData.preferredLanguage)) {
        setLanguage(userData.preferredLanguage);
      }
    }
  }, [userData]);

  const changeLanguage = async (newLang) => {
    setLanguage(newLang);
    if (user && user.uid) {
      try {
        await updateUserProfile(user.uid, { preferredLanguage: newLang });
      } catch (error) {
        console.error('Failed to save language preference:', error);
      }
    }
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
