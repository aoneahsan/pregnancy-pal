import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'

// Import translations
import enTranslations from './locales/en.json'
import esTranslations from './locales/es.json'
import frTranslations from './locales/fr.json'
import deTranslations from './locales/de.json'
import hiTranslations from './locales/hi.json'
import arTranslations from './locales/ar.json'
import zhTranslations from './locales/zh.json'
import ptTranslations from './locales/pt.json'
import ruTranslations from './locales/ru.json'
import jaTranslations from './locales/ja.json'

export const supportedLanguages = {
  en: { name: 'English', flag: '🇬🇧' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  hi: { name: 'हिंदी', flag: '🇮🇳' },
  ar: { name: 'العربية', flag: '🇸🇦', rtl: true },
  zh: { name: '中文', flag: '🇨🇳' },
  pt: { name: 'Português', flag: '🇵🇹' },
  ru: { name: 'Русский', flag: '🇷🇺' },
  ja: { name: '日本語', flag: '🇯🇵' },
}

const resources = {
  en: { translation: enTranslations },
  es: { translation: esTranslations },
  fr: { translation: frTranslations },
  de: { translation: deTranslations },
  hi: { translation: hiTranslations },
  ar: { translation: arTranslations },
  zh: { translation: zhTranslations },
  pt: { translation: ptTranslations },
  ru: { translation: ruTranslations },
  ja: { translation: jaTranslations },
}

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    react: {
      useSuspense: false,
    },
  })

export default i18n