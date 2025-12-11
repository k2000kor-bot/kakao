/**
 * 사용자 설정 컴포넌트
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useDarkMode } from '../hooks/useDarkMode';
import { useTranslation } from '../hooks/useTranslation';
import { errorLogger } from '../utils/errorLogger';
import './UserSettings.css';

interface UserSettingsProps {
  onClose?: () => void;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    enabled: boolean;
    sound: boolean;
    browser: boolean;
  };
  writing: {
    autoSave: boolean;
    defaultTone: string;
    defaultStyle: string;
  };
  chat: {
    maxMessages: number;
    autoScroll: boolean;
    showTimestamps: boolean;
  };
}

const UserSettings: React.FC<UserSettingsProps> = ({ onClose }) => {
  const darkMode = useDarkMode();
  const { t, changeLanguage } = useTranslation();
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'auto',
    language: 'ko',
    notifications: {
      enabled: true,
      sound: true,
      browser: true,
    },
    writing: {
      autoSave: true,
      defaultTone: 'neutral',
      defaultStyle: 'essay',
    },
    chat: {
      maxMessages: 50,
      autoScroll: true,
      showTimestamps: true,
    },
  });

  useEffect(() => {
    // 로컬 스토리지에서 설정 로드
    const saved = localStorage.getItem('userPreferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences((prev) => ({ ...prev, ...parsed }));
      } catch (error) {
        errorLogger.error('설정 로드 오류', error instanceof Error ? error : new Error(String(error)), {
          component: 'UserSettings',
          action: 'loadPreferences',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 설정 저장
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    
    // 테마 적용
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (preferences.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // auto 모드 - 시스템 설정 따름
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // 언어 변경
    if (preferences.language === 'ko' || preferences.language === 'en') {
      changeLanguage(preferences.language as 'ko' | 'en');
    }
  }, [preferences, changeLanguage]);

  const handlePreferenceChange = useCallback((section: keyof UserPreferences, key: string, value: any) => {
    setPreferences((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [key]: value,
      },
    }));
  }, []);

  const handleReset = useCallback(() => {
    if (globalThis.window?.confirm?.('모든 설정을 초기화하시겠습니까?')) {
      localStorage.removeItem('userPreferences');
      globalThis.window?.location?.reload();
    }
  }, []);

  return (
    <div 
      className="user-settings-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="사용자 설정"
    >
      <div 
        className="user-settings-modal" 
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="settings-header">
          <h2>설정</h2>
          <button 
            className="close-btn" 
            onClick={onClose}
            aria-label="설정 닫기"
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="settings-content" role="main">
          {/* 테마 설정 */}
          <div className="settings-section" role="group" aria-labelledby="theme-heading">
            <h3 id="theme-heading">테마</h3>
            <div className="settings-options" role="radiogroup" aria-labelledby="theme-heading">
              <label>
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={preferences.theme === 'light'}
                  onChange={(e) => handlePreferenceChange('theme', 'theme', e.target.value)}
                  aria-label="라이트 모드"
                />
                라이트 모드
              </label>
              <label>
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={preferences.theme === 'dark'}
                  onChange={(e) => handlePreferenceChange('theme', 'theme', e.target.value)}
                  aria-label="다크 모드"
                />
                다크 모드
              </label>
              <label>
                <input
                  type="radio"
                  name="theme"
                  value="auto"
                  checked={preferences.theme === 'auto'}
                  onChange={(e) => handlePreferenceChange('theme', 'theme', e.target.value)}
                  aria-label="시스템 설정 따르기"
                />
                시스템 설정 따르기
              </label>
            </div>
          </div>

          {/* 언어 설정 */}
          <div className="settings-section" role="group" aria-labelledby="language-heading">
            <h3 id="language-heading">언어</h3>
            <select
              value={preferences.language}
              onChange={(e) => handlePreferenceChange('language', 'language', e.target.value)}
              className="settings-select"
              aria-label="언어 선택"
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* 알림 설정 */}
          <div className="settings-section" role="group" aria-labelledby="notifications-heading">
            <h3 id="notifications-heading">알림</h3>
            <div className="settings-options">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.notifications.enabled}
                  onChange={(e) =>
                    handlePreferenceChange('notifications', 'enabled', e.target.checked)
                  }
                  aria-label="알림 활성화"
                />
                알림 활성화
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={preferences.notifications.sound}
                  onChange={(e) =>
                    handlePreferenceChange('notifications', 'sound', e.target.checked)
                  }
                  disabled={!preferences.notifications.enabled}
                  aria-label="소리 재생"
                  aria-disabled={!preferences.notifications.enabled}
                />
                소리 재생
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={preferences.notifications.browser}
                  onChange={(e) =>
                    handlePreferenceChange('notifications', 'browser', e.target.checked)
                  }
                  disabled={!preferences.notifications.enabled}
                  aria-label="브라우저 알림"
                  aria-disabled={!preferences.notifications.enabled}
                />
                브라우저 알림
              </label>
            </div>
          </div>

          {/* 글쓰기 설정 */}
          <div className="settings-section" role="group" aria-labelledby="writing-heading">
            <h3 id="writing-heading">글쓰기</h3>
            <div className="settings-options">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.writing.autoSave}
                  onChange={(e) =>
                    handlePreferenceChange('writing', 'autoSave', e.target.checked)
                  }
                  aria-label="자동 저장"
                />
                자동 저장
              </label>
            </div>
            <div className="settings-row">
              <label>
                기본 어투:
                <select
                  value={preferences.writing.defaultTone}
                  onChange={(e) =>
                    handlePreferenceChange('writing', 'defaultTone', e.target.value)
                  }
                  className="settings-select"
                  aria-label="기본 어투 선택"
                >
                  <option value="neutral">중립적</option>
                  <option value="formal">격식있는</option>
                  <option value="casual">캐주얼</option>
                  <option value="friendly">친근한</option>
                </select>
              </label>
            </div>
            <div className="settings-row">
              <label>
                기본 스타일:
                <select
                  value={preferences.writing.defaultStyle}
                  onChange={(e) =>
                    handlePreferenceChange('writing', 'defaultStyle', e.target.value)
                  }
                  className="settings-select"
                  aria-label="기본 스타일 선택"
                >
                  <option value="essay">수필</option>
                  <option value="article">기사</option>
                  <option value="report">보고서</option>
                  <option value="letter">편지</option>
                </select>
              </label>
            </div>
          </div>

          {/* 채팅 설정 */}
          <div className="settings-section" role="group" aria-labelledby="chat-heading">
            <h3 id="chat-heading">채팅</h3>
            <div className="settings-row">
              <label>
                최대 메시지 수:
                <input
                  type="number"
                  min="10"
                  max="200"
                  value={preferences.chat.maxMessages}
                  onChange={(e) =>
                    handlePreferenceChange('chat', 'maxMessages', parseInt(e.target.value))
                  }
                  className="settings-input"
                  aria-label="최대 메시지 수"
                  aria-valuemin={10}
                  aria-valuemax={200}
                  aria-valuenow={preferences.chat.maxMessages}
                />
              </label>
            </div>
            <div className="settings-options">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.chat.autoScroll}
                  onChange={(e) =>
                    handlePreferenceChange('chat', 'autoScroll', e.target.checked)
                  }
                  aria-label="자동 스크롤"
                />
                자동 스크롤
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={preferences.chat.showTimestamps}
                  onChange={(e) =>
                    handlePreferenceChange('chat', 'showTimestamps', e.target.checked)
                  }
                  aria-label="타임스탬프 표시"
                />
                타임스탬프 표시
              </label>
            </div>
          </div>
        </div>

        <div className="settings-footer" role="group" aria-label="설정 액션">
          <button 
            className="reset-btn" 
            onClick={handleReset}
            type="button"
            aria-label="모든 설정 초기화"
          >
            초기화
          </button>
          <button 
            className="save-btn" 
            onClick={onClose}
            type="button"
            aria-label="설정 저장 및 닫기"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;

