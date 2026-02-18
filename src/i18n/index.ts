import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en.json';
import zh from './zh.json';
import es from './es.json';
import hi from './hi.json';
import ar from './ar.json';
import fr from './fr.json';
import bn from './bn.json';
import ru from './ru.json';
import pt from './pt.json';
import ur from './ur.json';
import id from './id.json';
import ja from './ja.json';
import de from './de.json';
import sw from './sw.json';
import tr from './tr.json';
import ta from './ta.json';
import vi from './vi.json';
import ko from './ko.json';
import it from './it.json';
import th from './th.json';

export const languages = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'zh', name: '中文', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'bn', name: 'বাংলা', dir: 'ltr' },
  { code: 'ru', name: 'Русский', dir: 'ltr' },
  { code: 'pt', name: 'Português', dir: 'ltr' },
  { code: 'ur', name: 'اردو', dir: 'rtl' },
  { code: 'id', name: 'Indonesia', dir: 'ltr' },
  { code: 'ja', name: '日本語', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', dir: 'ltr' },
  { code: 'sw', name: 'Kiswahili', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', dir: 'ltr' },
  { code: 'ta', name: 'தமிழ்', dir: 'ltr' },
  { code: 'vi', name: 'Tiếng Việt', dir: 'ltr' },
  { code: 'ko', name: '한국어', dir: 'ltr' },
  { code: 'it', name: 'Italiano', dir: 'ltr' },
  { code: 'th', name: 'ไทย', dir: 'ltr' },
];

export const rtlLanguages = ['ar', 'ur'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
      es: { translation: es },
      hi: { translation: hi },
      ar: { translation: ar },
      fr: { translation: fr },
      bn: { translation: bn },
      ru: { translation: ru },
      pt: { translation: pt },
      ur: { translation: ur },
      id: { translation: id },
      ja: { translation: ja },
      de: { translation: de },
      sw: { translation: sw },
      tr: { translation: tr },
      ta: { translation: ta },
      vi: { translation: vi },
      ko: { translation: ko },
      it: { translation: it },
      th: { translation: th },
    },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
