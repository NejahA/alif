import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // existing English strings can be added here or imported
    },
  },
  de: {
    translation: {
      // German translations (placeholder)
      "welcome": "Willkommen",
      "export": "Exportieren",
      "import": "Importieren",
      // add more keys as needed
    },
  },
  fr: {
    translation: {
      // French translations (placeholder)
      "welcome": "Bienvenue",
      "export": "Exporter",
      "import": "Importer",
      // add more keys as needed
    },
  },
};

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
