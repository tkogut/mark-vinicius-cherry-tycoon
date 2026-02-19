import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import pl from './locales/pl.json';
import de from './locales/de.json';
import es from './locales/es.json';
import vi from './locales/vi.json';
import th from './locales/th.json';
import id from './locales/id.json';
import kr from './locales/kr.json';
import ja from './locales/ja.json';
import zh from './locales/zh.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            pl: { translation: pl },
            de: { translation: de },
            es: { translation: es },
            vi: { translation: vi },
            th: { translation: th },
            id: { translation: id },
            kr: { translation: kr },
            ja: { translation: ja },
            zh: { translation: zh },
        },
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

export default i18n;
