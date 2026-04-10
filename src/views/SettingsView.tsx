/**
 * 설정 뷰 — 테마·알림·API 등 (확장 범위)
 * DEVELOPMENT_SCOPE_MASTER: /settings
 */
import React, { useState, useEffect } from 'react';
import { useTheme } from '../components/ThemeProvider';
import { API_ENDPOINTS } from '../config/api';

const LLM_PROVIDER_LABELS: Record<string, string> = {
  'deepseek': 'DeepSeek (API)',
  'deepseek-local': 'DeepSeek (로컬)',
  'notebook': '노트북 LLM',
  'openai': 'OpenAI',
  'anthropic': 'Anthropic',
  'fallback': '폴백',
};

const NOTIFY_KEYS = {
  email: 'corbu.settings.notify.email',
  push: 'corbu.settings.notify.push',
  product: 'corbu.settings.notify.product',
} as const;

function readBool(key: string, defaultVal: boolean): boolean {
  try {
    const s = localStorage.getItem(key);
    if (s === null) return defaultVal;
    return s === '1';
  } catch {
    return defaultVal;
  }
}

function writeBool(key: string, value: boolean) {
  try {
    localStorage.setItem(key, value ? '1' : '0');
  } catch {
    /* ignore */
  }
}

function SettingsView() {
  const { isDarkMode, setMode } = useTheme();
  const [llmProvider, setLlmProvider] = useState<string | null>(null);
  const [emailOn, setEmailOn] = useState(() => readBool(NOTIFY_KEYS.email, true));
  const [pushOn, setPushOn] = useState(() => readBool(NOTIFY_KEYS.push, false));
  const [productOn, setProductOn] = useState(() => readBool(NOTIFY_KEYS.product, true));

  useEffect(() => {
    let cancelled = false;
    fetch(API_ENDPOINTS.HEALTH, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.statusText))))
      .then((data) => {
        if (!cancelled && data?.llm_provider) setLlmProvider(data.llm_provider);
      })
      .catch(() => { if (!cancelled) setLlmProvider(null); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="main-content bw-detail-root bw-detail-root--centered bw-tool-view" role="main" aria-label="설정" data-testid="settings-view">
      <header className="bw-detail-header-left">
        <p className="bw-detail-desc">앱 테마와 기본 옵션을 변경할 수 있습니다.</p>
      </header>
      <div className="bw-tool-view-body">
      <section className="bw-detail-section" aria-labelledby="settings-theme-heading">
        <h2 id="settings-theme-heading" className="bw-detail-section-title">테마</h2>
        <div className="bw-features-card bw-detail-scroll">
          <div className="bw-flex-between bw-flex-gap-8">
            <span className="bw-label-block">다크 모드</span>
            <div className="bw-flex-gap-8" role="group" aria-label="테마 선택">
              <button
                type="button"
                className={!isDarkMode ? 'bw-btn-primary' : 'bw-btn-secondary'}
                onClick={() => setMode('light')}
                aria-pressed={!isDarkMode}
                aria-label="라이트 모드"
              >
                라이트
              </button>
              <button
                type="button"
                className={isDarkMode ? 'bw-btn-primary' : 'bw-btn-secondary'}
                onClick={() => setMode('dark')}
                aria-pressed={isDarkMode}
                aria-label="다크 모드"
              >
                다크
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bw-detail-section" aria-labelledby="settings-notifications-heading">
        <h2 id="settings-notifications-heading" className="bw-detail-section-title">알림</h2>
        <div className="bw-features-card bw-detail-scroll">
          <p className="bw-features-card-desc">
            브라우저에 저장되며, 실제 발송은 백엔드·푸시 연동 후 적용됩니다.
          </p>
          <div className="bw-mt-sm" role="group" aria-label="알림 종류">
            <div className="bw-toggle-row">
              <span className="bw-label-block" id="settings-notify-email-label">
                이메일 요약
              </span>
              <button
                type="button"
                className="bw-switch"
                role="switch"
                aria-checked={emailOn}
                aria-labelledby="settings-notify-email-label"
                onClick={() => {
                  const next = !emailOn;
                  setEmailOn(next);
                  writeBool(NOTIFY_KEYS.email, next);
                }}
              />
            </div>
            <div className="bw-toggle-row">
              <span className="bw-label-block" id="settings-notify-push-label">
                브라우저 푸시
              </span>
              <button
                type="button"
                className="bw-switch"
                role="switch"
                aria-checked={pushOn}
                aria-labelledby="settings-notify-push-label"
                onClick={() => {
                  const next = !pushOn;
                  setPushOn(next);
                  writeBool(NOTIFY_KEYS.push, next);
                }}
              />
            </div>
            <div className="bw-toggle-row">
              <span className="bw-label-block" id="settings-notify-product-label">
                제품 공지
              </span>
              <button
                type="button"
                className="bw-switch"
                role="switch"
                aria-checked={productOn}
                aria-labelledby="settings-notify-product-label"
                onClick={() => {
                  const next = !productOn;
                  setProductOn(next);
                  writeBool(NOTIFY_KEYS.product, next);
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bw-detail-section" aria-labelledby="settings-llm-heading">
        <h2 id="settings-llm-heading" className="bw-detail-section-title">LLM 엔진</h2>
        <div className="bw-features-card bw-detail-scroll">
          <p className="bw-features-card-desc">
            현재 대화·노트북에 사용 중인 LLM: <strong>{llmProvider != null ? (LLM_PROVIDER_LABELS[llmProvider] ?? llmProvider) : '—'}</strong>
            {llmProvider === 'notebook' && ' (노트북 화면의 답변도 백엔드에서 딥시크 등 동일 엔진 사용)'}
          </p>
          <a href="/docs" className="bw-link" aria-label="DeepSeek 설정 가이드 참고">딥시크(DeepSeek) 설정 가이드 (도움말)</a>
        </div>
      </section>

      <section className="bw-detail-section" aria-labelledby="settings-info-heading">
        <h2 id="settings-info-heading" className="bw-detail-section-title">정보</h2>
        <div className="bw-features-card bw-detail-scroll">
          <p className="bw-features-card-desc">
            CORBU.AI — AI 기반 통합 플랫폼. 대화·프로젝트·노트북(딥시크 기반)·목소리 생성.
          </p>
          <a href="/docs" className="bw-link" aria-label="사용 가이드로 이동">사용 가이드 보기</a>
        </div>
      </section>
      </div>
    </div>
  );
}

export default SettingsView;
