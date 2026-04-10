/**
 * Genspark식 `/agents` 허브 — `?id=` 없이 들어온 경우 등록 에이전트 목록·직접 링크 안내
 */
import React from 'react';
import { Link } from 'react-router-dom';
import {
  AGENTS_PATH,
  AGENTS_QUERY_PARAM_ID,
  AGENTS_QUERY_PARAM_TYPE,
  GENSPARK_AGENTS_TYPE_SUPER_AGENT,
} from '../config/routes';
import {
  listRegisteredGensparkAgents,
  PUBLIC_GENSPARK_AGENTS_ORIGIN,
  PUBLIC_GENSPARK_AGENTS_SUPER_AGENT_TYPE_URL,
} from '../services/gensparkAgentRegistry';
import {
  GENSPARK_REFERENCE_AGENT_ID,
  GENSPARK_REFERENCE_AGENT_URL,
} from '../services/gensparkReferenceAgentPreset';

export default function GensparkAgentsHubView() {
  const agents = listRegisteredGensparkAgents();

  return (
    <main
      id="chat-main-content"
      className="main-content bw-detail-scroll"
      tabIndex={-1}
      role="main"
      aria-labelledby="genspark-agents-hub-heading"
      data-testid="genspark-agents-hub"
    >
      <div className="bw-detail-section" style={{ maxWidth: '40rem', margin: '0 auto', padding: '24px 16px' }}>
        <h2 id="genspark-agents-hub-heading" className="bw-detail-section-title">
          에이전트 (Genspark 링크)
        </h2>
        <p className="bw-text-secondary" style={{ marginTop: 8, lineHeight: 1.6 }}>
          Genspark의{' '}
          <code style={{ fontSize: '0.9em' }}>
            {PUBLIC_GENSPARK_AGENTS_ORIGIN}?{AGENTS_QUERY_PARAM_ID}=…
          </code>{' '}
          와 같이, 이 앱에서는{' '}
          <strong>
            {AGENTS_PATH}?{AGENTS_QUERY_PARAM_ID}=&lt;uuid&gt;
          </strong>
          로 세션을 열 수 있습니다. 해당 ID는 API context에 전달되어 젠스파이크형 파이프라인·프로필과 맞춥니다.
        </p>

        <section
          className="bw-detail-section"
          style={{
            marginTop: 20,
            padding: '14px 16px',
            borderRadius: 10,
            border: '1px solid var(--border-color, #e5e7eb)',
            background: 'var(--bg-secondary, #f9fafb)',
          }}
          aria-labelledby="genspark-ref-agent-heading"
        >
          <h2 id="genspark-ref-agent-heading" className="bw-detail-section-title" style={{ fontSize: '1.05rem' }}>
            참조 에이전트 (고정 ID)
          </h2>
          <p className="bw-text-secondary" style={{ marginTop: 8, lineHeight: 1.6 }}>
            Genspark 공식 링크와 동일한 세션을 이 앱에서 열려면 아래를 사용하세요.
          </p>
          <p style={{ marginTop: 8, fontSize: 12, wordBreak: 'break-all', color: 'var(--text-secondary)' }}>
            <a href={GENSPARK_REFERENCE_AGENT_URL} target="_blank" rel="noopener noreferrer">
              {GENSPARK_REFERENCE_AGENT_URL}
            </a>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            <Link
              to={`${AGENTS_PATH}?${AGENTS_QUERY_PARAM_ID}=${encodeURIComponent(GENSPARK_REFERENCE_AGENT_ID)}`}
              className="brainwave-404-btn-primary"
            >
              이 앱에서 열기 ({GENSPARK_REFERENCE_AGENT_ID.slice(0, 8)}…)
            </Link>
          </div>
        </section>

        <section
          className="bw-detail-section"
          style={{
            marginTop: 24,
            padding: '14px 16px',
            borderRadius: 10,
            border: '1px solid var(--border-color, #e5e7eb)',
            background: 'var(--bg-secondary, #f9fafb)',
          }}
          aria-labelledby="genspark-super-agent-heading"
        >
          <h2 id="genspark-super-agent-heading" className="bw-detail-section-title" style={{ fontSize: '1.05rem' }}>
            Super Agent (Genspark{' '}
            <code style={{ fontSize: '0.85em' }}>
              ?{AGENTS_QUERY_PARAM_TYPE}={GENSPARK_AGENTS_TYPE_SUPER_AGENT}
            </code>
            )
          </h2>
          <p className="bw-text-secondary" style={{ marginTop: 8, lineHeight: 1.6 }}>
            공개 페이지{' '}
            <a href={PUBLIC_GENSPARK_AGENTS_SUPER_AGENT_TYPE_URL} target="_blank" rel="noopener noreferrer">
              {PUBLIC_GENSPARK_AGENTS_SUPER_AGENT_TYPE_URL}
            </a>
            와 동일한 쿼리로, 이 앱에서는{' '}
            <Link
              to={`${AGENTS_PATH}?${AGENTS_QUERY_PARAM_TYPE}=${GENSPARK_AGENTS_TYPE_SUPER_AGENT}`}
              className="brainwave-404-btn-primary"
            >
              {AGENTS_PATH}?{AGENTS_QUERY_PARAM_TYPE}={GENSPARK_AGENTS_TYPE_SUPER_AGENT}
            </Link>
            로 참조 Super Agent 세션을 바로 엽니다.
          </p>
        </section>

        <h2 className="bw-detail-section-title" style={{ marginTop: 28, fontSize: '1.05rem' }}>
          등록된 에이전트
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0' }}>
          {agents.map((a) => (
            <li
              key={a.id}
              style={{
                marginBottom: 12,
                padding: '12px 14px',
                border: '1px solid var(--border-color, #e5e7eb)',
                borderRadius: 8,
                background: 'var(--bg-secondary, #f9fafb)',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{a.displayName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', wordBreak: 'break-all', marginBottom: 8 }}>
                {a.id}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <Link
                  to={`${AGENTS_PATH}?${AGENTS_QUERY_PARAM_ID}=${encodeURIComponent(a.id)}`}
                  className="brainwave-404-btn-primary"
                >
                  이 앱에서 열기
                </Link>
                <a
                  href={a.url}
                  className="brainwave-404-btn-secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Genspark에서 열기
                </a>
              </div>
            </li>
          ))}
        </ul>

        <h2 className="bw-detail-section-title" style={{ marginTop: 28, fontSize: '1.05rem' }}>
          임의 ID로 열기
        </h2>
        <p className="bw-text-secondary" style={{ lineHeight: 1.6 }}>
          주소창에{' '}
          <code style={{ fontSize: '0.9em' }}>
            {AGENTS_PATH}?{AGENTS_QUERY_PARAM_ID}=당신의-uuid
          </code>
          를 입력하세요. 레포에 없는 ID는 기본 과업 완결형 지시가 적용됩니다. 고정 프로필을 쓰려면{' '}
          <code style={{ fontSize: '0.9em' }}>src/services/gensparkAgentRegistry.ts</code>의{' '}
          <code style={{ fontSize: '0.9em' }}>REGISTERED</code>에 추가하세요.
        </p>
      </div>
    </main>
  );
}
