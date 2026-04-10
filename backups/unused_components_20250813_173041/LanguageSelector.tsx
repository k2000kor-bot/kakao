import React, { useState, useEffect } from 'react';
import {
    GlobeAltIcon,
    ChevronDownIcon,
    ArrowsRightLeftIcon,
    CheckIcon
} from '@heroicons/react/24/outline';

interface Language {
    code: string;
    name: string;
    native_name: string;
}

interface TranslationResult {
    original_text: string;
    translated_text: string;
    source_language: string;
    target_language: string;
    confidence: number;
    method: string;
}

interface LanguageSelectorProps {
    onLanguageChange?: (language: string) => void;
    onTranslationRequest?: (text: string, targetLang: string) => void;
    currentLanguage?: string;
    showTranslationUI?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
    onLanguageChange,
    onTranslationRequest,
    currentLanguage = 'ko',
    showTranslationUI = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
    const [supportedLanguages, setSupportedLanguages] = useState<Language[]>([]);
    const [translationText, setTranslationText] = useState('');
    const [targetLanguage, setTargetLanguage] = useState('en');
    const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [showTranslationDialog, setShowTranslationDialog] = useState(false);

    // 지원 언어 목록 로드
    useEffect(() => {
        const languages: Language[] = [
            { code: 'ko', name: '한국어', native_name: '한국어' },
            { code: 'en', name: '영어', native_name: 'English' },
            { code: 'ja', name: '일본어', native_name: '日本語' },
            { code: 'zh-cn', name: '중국어(간체)', native_name: '简体中文' },
            { code: 'zh-tw', name: '중국어(번체)', native_name: '繁體中文' },
            { code: 'es', name: '스페인어', native_name: 'Español' },
            { code: 'fr', name: '프랑스어', native_name: 'Français' },
            { code: 'de', name: '독일어', native_name: 'Deutsch' },
            { code: 'ru', name: '러시아어', native_name: 'Русский' },
            { code: 'pt', name: '포르투갈어', native_name: 'Português' }
        ];
        setSupportedLanguages(languages);
    }, []);

    // 언어 변경 처리
    const handleLanguageChange = (langCode: string) => {
        setSelectedLanguage(langCode);
        setIsOpen(false);
        if (onLanguageChange) {
            onLanguageChange(langCode);
        }
    };

    // 번역 요청 처리
    const handleTranslationRequest = async () => {
        if (!translationText.trim()) {
            alert('번역할 텍스트를 입력해주세요.');
            return;
        }

        setIsTranslating(true);

        try {
            const response = await fetch('http://localhost:8003/api/v8/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: translationText,
                    target_language: targetLanguage,
                    source_language: 'auto' // 자동 감지
                })
            });

            if (!response.ok) {
                throw new Error('번역 요청 실패');
            }

            const result = await response.json();

            if (result.success) {
                setTranslationResult(result.data);
                setShowTranslationDialog(true);
            } else {
                alert('번역에 실패했습니다: ' + result.message);
            }
        } catch (error) {
            console.error('번역 오류:', error);
            alert('번역 중 오류가 발생했습니다.');
        } finally {
            setIsTranslating(false);
        }
    };

    const getSelectedLanguageInfo = () => {
        return supportedLanguages.find(lang => lang.code === selectedLanguage) || supportedLanguages[0];
    };

    const getLanguageFlag = (code: string) => {
        const flags: { [key: string]: string } = {
            'ko': '🇰🇷',
            'en': '🇺🇸',
            'ja': '🇯🇵',
            'zh-cn': '🇨🇳',
            'zh-tw': '🇹🇼',
            'es': '🇪🇸',
            'fr': '🇫🇷',
            'de': '🇩🇪',
            'ru': '🇷🇺',
            'pt': '🇵🇹'
        };
        return flags[code] || '🌐';
    };

    return (
        <div className="language-selector-container">
            <h3 className="language-selector-title">
                <GlobeAltIcon className="title-icon" />
                언어 설정
            </h3>
            
            <div className="language-selector-main">
                <div className="language-dropdown">
                    <button
                        className="language-selector-btn"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="언어 선택"
                    >
                        <span className="selected-language">
                            <span className="language-flag">{getLanguageFlag(selectedLanguage)}</span>
                            <span className="language-name">{getSelectedLanguageInfo()?.native_name}</span>
                        </span>
                        <ChevronDownIcon className={`dropdown-icon ${isOpen ? 'open' : ''}`} />
                    </button>

                    {isOpen && (
                        <div className="language-dropdown-menu">
                            {supportedLanguages.map((language) => (
                                <button
                                    key={language.code}
                                    className={`language-option ${language.code === selectedLanguage ? 'selected' : ''}`}
                                    onClick={() => handleLanguageChange(language.code)}
                                >
                                    <span className="language-flag">{getLanguageFlag(language.code)}</span>
                                    <span className="language-info">
                                        <span className="language-native">{language.native_name}</span>
                                        <span className="language-english">{language.name}</span>
                                    </span>
                                    {language.code === selectedLanguage && (
                                        <CheckIcon className="check-icon" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {showTranslationUI && (
                    <div className="translation-section">
                        <h4 className="translation-title">
                            <ArrowsRightLeftIcon className="translation-icon" />
                            CORBU.AI 번역
                        </h4>
                        
                        <div className="translation-input-group">
                            <textarea
                                className="translation-textarea"
                                placeholder="번역할 텍스트를 입력하세요..."
                                value={translationText}
                                onChange={(e) => setTranslationText(e.target.value)}
                                rows={3}
                            />
                            
                            <div className="translation-controls">
                                <select
                                    className="target-language-select"
                                    value={targetLanguage}
                                    onChange={(e) => setTargetLanguage(e.target.value)}
                                    aria-label="번역 대상 언어 선택"
                                >
                                    {supportedLanguages.map((language) => (
                                        <option key={language.code} value={language.code}>
                                            {language.native_name}
                                        </option>
                                    ))}
                                </select>
                                
                                <button
                                    className="translate-btn"
                                    onClick={handleTranslationRequest}
                                    disabled={!translationText.trim() || isTranslating}
                                >
                                    {isTranslating ? '번역 중...' : '번역'}
                                </button>
                            </div>
                        </div>

                        {translationResult && (
                            <div className="translation-result">
                                <h5 className="result-title">번역 결과</h5>
                                <div className="result-content">
                                    <div className="original-text">
                                        <span className="text-label">원문:</span>
                                        <span className="text-content">{translationResult.original_text}</span>
                                    </div>
                                    <div className="translated-text">
                                        <span className="text-label">번역:</span>
                                        <span className="text-content">{translationResult.translated_text}</span>
                                    </div>
                                    <div className="translation-meta">
                                        <span className="confidence">신뢰도: {translationResult.confidence}%</span>
                                        <span className="method">방법: {translationResult.method}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LanguageSelector; 