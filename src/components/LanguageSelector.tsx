/**
 * 언어 선택 컴포넌트
 */

import React, { useCallback } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import './LanguageSelector.css';

const LanguageSelector: React.FC = () => {
  const { language, changeLanguage, availableLanguages } = useTranslation();

  const handleLanguageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(e.target.value as 'ko' | 'en');
  }, [changeLanguage]);

  return (
    <div className="language-selector" role="region" aria-label="언어 선택">
      <label htmlFor="language-select" className="sr-only">언어 선택</label>
      <select
        id="language-select"
        value={language}
        onChange={handleLanguageChange}
        className="language-select"
        aria-label="언어 선택"
      >
        {availableLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;

