import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './translations/en';
import esTranslations from './translations/es';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      es: {
        translation: esTranslations
      }
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 