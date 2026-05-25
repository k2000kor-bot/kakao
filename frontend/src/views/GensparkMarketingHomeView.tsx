/**
 * 루트(/) 홈 포털
 * 웰컴: 히어로+입력창 세로 중앙 · 대화(/chat) 시작 후 입력 하단 고정
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ChatInputDock } from '../components/ChatInputDock';
import { WorkspaceQueryComposer } from '../components/WorkspaceQueryComposer';
import {
  MARKETING_HOME_COMPOSER_AUTOSEND_STATE_KEY,
  MARKETING_HOME_COMPOSER_DRAFT_STATE_KEY,
} from '../config/routes';
import { getStandaloneChatPath } from '../config/uiPreferences';
import { TEST_IDS } from '../constants/testIds';
import {
  WORKSPACE_COMPOSER_FORM_ARIA_LABEL,
  WORKSPACE_HOME_HEADLINE,
  WORKSPACE_MARKETING_DOCUMENT_TITLE,
} from '../constants/workspaceHomeCopy';
import { coerceTrimmedString } from '../utils/chatInputUtils';
import './GensparkMarketingHomeView.css';

export const OFFICIAL_GENSPARK_HOME_URL = 'https://www.genspark.ai/';

/** 홈 히어로 부제 — 한 줄로 유지 */
export const WORKSPACE_MARKETING_HOME_SUBTITLE = '입력하고 바로 대화를 시작하세요.';

export default function GensparkMarketingHomeView() {
  const chatPath = getStandaloneChatPath();
  const navigate = useNavigate();

  /* 입력 임시저장(draft) — 새로고침해도 유지 */
  const DRAFT_KEY = 'corbu.home.inputDraft';
  const PENDING_PROMPT_KEY = 'corbu.pendingPrompt';
  const loadDraft = () => {
    try {
      const pending = sessionStorage.getItem(PENDING_PROMPT_KEY);
      if (pending) {
        sessionStorage.removeItem(PENDING_PROMPT_KEY);
        return pending;
      }
      return localStorage.getItem(DRAFT_KEY) ?? '';
    } catch { return ''; }
  };
  const [prompt, setPrompt] = useState<string>(loadDraft);

  const handlePromptChange = useCallback((v: string) => {
    setPrompt(v);
    try {
      if (v.trim()) localStorage.setItem(DRAFT_KEY, v);
      else localStorage.removeItem(DRAFT_KEY);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const prev = document.title;
    document.title = WORKSPACE_MARKETING_DOCUMENT_TITLE;
    return () => { document.title = prev; };
  }, []);

  /* sessionStorage pendingPrompt 감지 — 다른 탭에서 홈으로 이동 시 */
  useEffect(() => {
    const checkPending = () => {
      try {
        const pending = sessionStorage.getItem(PENDING_PROMPT_KEY);
        if (pending) {
          sessionStorage.removeItem(PENDING_PROMPT_KEY);
          setPrompt(pending);
          setTimeout(() => {
            const ta = document.querySelector<HTMLTextAreaElement>('.wq-composer__input');
            ta?.focus();
          }, 100);
        }
      } catch { /* ignore */ }
    };
    checkPending();
    window.addEventListener('focus', checkPending);
    return () => window.removeEventListener('focus', checkPending);
  }, []);

  const chatNavState = useMemo(() => {
    const t = coerceTrimmedString(prompt, '');
    if (!t) return undefined;
    return {
      [MARKETING_HOME_COMPOSER_DRAFT_STATE_KEY]: t,
      [MARKETING_HOME_COMPOSER_AUTOSEND_STATE_KEY]: true,
    };
  }, [prompt]);

  const goChat = useCallback(() => {
    const t = coerceTrimmedString(prompt, '');
    navigate(chatPath, t ? {
      state: {
        [MARKETING_HOME_COMPOSER_DRAFT_STATE_KEY]: t,
        [MARKETING_HOME_COMPOSER_AUTOSEND_STATE_KEY]: true,
      },
    } : undefined);
  }, [prompt, chatPath, navigate]);

  const composer = (
    <WorkspaceQueryComposer
      value={prompt}
      onChange={handlePromptChange}
      onCommit={() => {
        try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
        goChat();
      }}
      textareaId="gs-home-prompt"
      formAriaLabel={WORKSPACE_COMPOSER_FORM_ARIA_LABEL}
      dataTestId={TEST_IDS.GENSPARK_MARKETING_COMPOSER}
      primaryAction={
        <NavLink to={chatPath} state={chatNavState} className="wq-composer__chat-cta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <rect x="2" y="8" width="3" height="8" rx="1" />
            <rect x="8" y="4" width="3" height="16" rx="1" />
            <rect x="14" y="6" width="3" height="12" rx="1" />
            <rect x="20" y="9" width="3" height="6" rx="1" />
          </svg>
          대화
        </NavLink>
      }
    />
  );

  return (
    <main
      className="gs-home chat-main-stage chat-main-stage--welcome"
      id="chat-main-content"
      tabIndex={-1}
      role="main"
      aria-labelledby="gs-home-heading"
      data-testid={TEST_IDS.GENSPARK_MARKETING_HOME}
    >
      <div className="chat-main-stage__scroll genspark-chat-messages-wrap chat-welcome-scroll">
        <div className="chat-welcome-center">
          <header className="gs-home__masthead welcome-content brainwave-welcome-content">
            <div className="brainwave-welcome-inner brainwave-welcome-inner--workspace">
              <h1 id="gs-home-heading" className="gs-home__title brainwave-welcome-headline">
                {WORKSPACE_HOME_HEADLINE}
              </h1>
              <p className="gs-home__subtitle brainwave-welcome-sub">{WORKSPACE_MARKETING_HOME_SUBTITLE}</p>
            </div>
          </header>

          <ChatInputDock
            placement="inline"
            variant="welcome"
            showDisclaimer={false}
            composer={composer}
          >
            {prompt.trim().length > 0 ? (
              <p className="gs-home__draft-hint" aria-live="polite">
                임시저장된 내용이 복원되었습니다.{' '}
                <button
                  type="button"
                  className="gs-home__draft-clear"
                  onClick={() => { handlePromptChange(''); }}
                  aria-label="임시저장 삭제"
                >
                  지우기
                </button>
              </p>
            ) : null}
          </ChatInputDock>
        </div>
      </div>
    </main>
  );
}
