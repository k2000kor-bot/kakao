/**
 * 사용 가이드·문서 뷰 — 사용법·API 문서 링크 (확장 범위)
 * DEVELOPMENT_SCOPE_MASTER: /docs
 */
import React from 'react';

const DOC_LINKS = [
  { label: '빠른 시작', path: '/docs/guides/QUICK_START.md', desc: '실행·의존성·기본 사용' },
  { label: '사용 가이드', path: '/docs/guides/USAGE_GUIDE.md', desc: '화면 구성·시나리오·FAQ' },
  { label: 'TTS·대본 스타일', path: '/docs/guides/TTS_AND_SCRIPT_STYLE_GUIDE.md', desc: '목소리 생성·감정 프리셋' },
  { label: '노트북 LLM', path: '/docs/NOTEBOOKLM_FEATURE_AND_KNOWLEDGE_CHECKLIST.md', desc: '프로젝트별 학습·답변' },
  { label: '개발 가이드', path: '/DEVELOPMENT.md', desc: '구조·실행·테스트' },
];

function DocsView() {
  return (
    <div className="main-content bw-detail-root bw-detail-root--centered bw-tool-view" role="main" aria-label="문서" data-testid="docs-view">
      <header className="bw-detail-header-left">
        <p className="bw-detail-desc">사용 방법과 개발 문서를 확인할 수 있습니다.</p>
      </header>
      <div className="bw-tool-view-body">
      <section className="bw-detail-section" aria-labelledby="docs-guide-heading">
        <h2 id="docs-guide-heading" className="bw-detail-section-title">가이드·문서</h2>
        <div className="bw-features-card bw-detail-scroll">
          <ul className="bw-detail-list bw-list-unstyled">
            {DOC_LINKS.map((item) => (
              <li key={item.path} className="bw-list-item-spaced">
                <a
                  href={item.path}
                  className="bw-link bw-link-strong"
                  aria-label={`${item.label} 문서 보기`}
                >
                  {item.label}
                </a>
                <p className="bw-detail-desc bw-desc-tight">
                  {item.desc}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bw-detail-section" aria-labelledby="docs-shortcuts-heading">
        <h2 id="docs-shortcuts-heading" className="bw-detail-section-title">단축키</h2>
        <div className="bw-features-card bw-detail-scroll">
          <ul className="bw-features-card-desc bw-docs-shortcuts-list">
            <li>Enter — 메시지 전송</li>
            <li>Shift+Enter — 줄바꿈</li>
            <li>⌘? (Mac) / Ctrl? (Win) — 기능 안내</li>
          </ul>
        </div>
      </section>

      <section className="bw-detail-section" aria-labelledby="docs-troubleshooting-heading">
        <h2 id="docs-troubleshooting-heading" className="bw-detail-section-title">문제 해결</h2>
        <div className="bw-features-card bw-detail-scroll">
          <p className="bw-features-card-desc">
            오류·연결 실패·창 종료 등 문제 발생 시 해결 단계를 안내합니다.
          </p>
          <a href="/docs/guides/TROUBLESHOOTING_GUIDE.md" className="bw-link" aria-label="문제 해결 가이드">
            문제 해결 가이드
          </a>
        </div>
      </section>
      </div>
    </div>
  );
}

export default DocsView;
