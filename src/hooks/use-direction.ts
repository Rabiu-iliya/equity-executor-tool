import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { rtlLanguages } from '@/i18n';

export function useDirection() {
  const { i18n } = useTranslation();
  const isRtl = rtlLanguages.includes(i18n.language);

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language, isRtl]);

  return isRtl;
}
