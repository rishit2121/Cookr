import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translation files
import enTranslations from './translations/en';
import esTranslations from './translations/es';
import frTranslations from './translations/fr';
import deTranslations from './translations/de';
import itTranslations from './translations/it';
import ptTranslations from './translations/pt';
import ruTranslations from './translations/ru';
import zhTranslations from './translations/zh-Hans';
import jaTranslations from './translations/ja';
import koTranslations from './translations/ko';

// Get language from localStorage or default to 'en'
const savedLanguage = localStorage.getItem('language') || 'en';

// Initialize i18next
i18n
  // Use language detector
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Define all resources (translations)
    resources: {
      en: { translation: enTranslations },
      es: { translation: esTranslations },
      fr: { translation: frTranslations },
      de: { translation: deTranslations },
      it: { translation: itTranslations },
      pt: { translation: ptTranslations },
      ru: { translation: ruTranslations },
      'zh-Hans': { translation: zhTranslations },
      ja: { translation: jaTranslations },
      ko: { translation: koTranslations }
    },
    // Set the initial language
    lng: savedLanguage,
    // Fallback language if a translation is missing
    fallbackLng: 'en',
    // Don't escape special characters
    interpolation: {
      escapeValue: false
    },
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: ['localStorage']
    },
  });

// Add a listener to save language changes to localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

// Log initialization
console.log("i18n initialized with language:", i18n.language);

export default i18n;
