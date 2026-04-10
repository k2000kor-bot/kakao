/**
 * 번역 훅
 */

import { useState, useEffect, useCallback } from 'react';
import { i18n, Language } from '../i18n/i18n';

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(i18n.getLanguage());

  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent<Language>) => {
      setLanguage(event.detail);
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return i18n.t(key, params);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language]
  );

  const changeLanguage = useCallback((lang: Language) => {
    i18n.setLanguage(lang);
    setLanguage(lang);
  }, []);

  return {
    t,
    language,
    changeLanguage,
    availableLanguages: i18n.getAvailableLanguages(),
  };
}

export default useTranslation;

