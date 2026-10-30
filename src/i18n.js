import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import sr from './locales/sr.json'

/**
 * Supported languages. To add Serbian Cyrillic:
 *  1. create /src/locales/sr-Cyrl.json (copy sr.json and transliterate)
 *  2. add it to RESOURCES + LANGUAGES below (code: 'sr-Cyrl', label: 'СР')
 * Routes (/sr-Cyrl/...), the switcher and <html lang> pick it up automatically.
 */
export const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'sr', label: 'SR', name: 'Srpski' },
]
export const LANG_CODES = LANGUAGES.map((l) => l.code)
export const DEFAULT_LANG = 'en'
export const LANG_STORAGE_KEY = 'aura:lang'

const RESOURCES = {
  en: { translation: en },
  sr: { translation: sr },
}

/** Stored preference → browser language → default */
export function detectLanguage() {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY)
    if (stored && LANG_CODES.includes(stored)) return stored
  } catch {
    /* private mode */
  }
  const nav = (navigator.languages?.[0] || navigator.language || '').toLowerCase()
  if (nav.startsWith('sr') || nav.startsWith('hr') || nav.startsWith('bs')) return 'sr'
  return DEFAULT_LANG
}

export function persistLanguage(code) {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, code)
  } catch {
    /* ignore */
  }
}

i18n.use(initReactI18next).init({
  resources: RESOURCES,
  lng: detectLanguage(),
  fallbackLng: DEFAULT_LANG,
  supportedLngs: LANG_CODES,
  interpolation: { escapeValue: false },
  returnObjects: true,
  react: { useSuspense: false },
})

export default i18n
