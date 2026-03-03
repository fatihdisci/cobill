import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import trTranslation from './locales/tr/translation.json';
import enTranslation from './locales/en/translation.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            tr: { translation: trTranslation },
            en: { translation: enTranslation },
        },
        fallbackLng: 'tr',
        interpolation: {
            escapeValue: false, // React zaten XSS koruması sağlıyor
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'cobill_language',
        },
    });

export default i18n;
