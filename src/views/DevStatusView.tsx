/**
 * 개발 현황 뷰 — 지금까지 개발·반영된 기능을 프론트에서 확인
 * docs/FRONTEND_CHANGES.md, docs/WHAT_IS_THIS.md 내용을 화면에 출력
 */
import React from 'react';

const SUMMARY = {
  title: '이걸 뭐 하려는 거야?',
  oneLiner: 'CORBU.AI는 ChatGPT처럼 대화하고, 프로젝트별로 정리하고, 목소리 생성 같은 도구까지 쓰는 AI 어시스턴트 웹앱입니다.',
  features: [
    { name: '일반 대화', desc: '홈(/)에서 프로젝트와 분리된 질문·답변. 여러 대화 생성, 사이드바에서 이전 대화로 이동.' },
    { name: '프로젝트', desc: '주제별로 대화를 묶음. 프로젝트를 선택하면 프로젝트 · 대화(/projects/:id)에서 대화·소스·자료를 관리합니다.' },
    { name: '목소리 생성', desc: '텍스트를 음성으로 변환(TTS). 사이드바 도구 → 목소리 생성.' },
    { name: '설정·분석·도움말', desc: '사이드바 "더 보기" 또는 라우트로 설정, 분석, 도움말 등 접근.' },
  ],
  layout: '왼쪽 사이드바: 로고, 새 대화, 대화 검색, 프로젝트 목록, 도구(목소리), 대화 목록. 접기/펼치기·모바일에서는 메뉴 버튼으로 열기. 가운데 메인: 일반 대화(/)·프로젝트(/projects)·프로젝트 · 대화(/projects/:id)·목소리 생성·설정 등.',
};

const CHANGES: { category: string; items: { file: string; desc: string }[] }[] = [
  {
    category: '통합 레이아웃 (AppUnified)',
    items: [
      { file: 'src/index.tsx', desc: '앱 진입점을 AppUnified로 사용 (2단: 사이드바 + 메인)' },
      { file: 'src/AppUnified.tsx', desc: '좌측 사이드바 + 메인. 로고·토글·더보기·새 대화·대화 검색·프로젝트·도구·대화 목록' },
      { file: 'src/App.css', desc: '사이드바 스타일, 모바일 .mobile-open, 브레이크포인트 var(--breakpoint-md)' },
    ],
  },
  {
    category: '사이드바 동작',
    items: [
      { file: 'src/AppUnified.tsx', desc: '대화 목록에서 항목 선택 시 해당 항목만 active 표시 (conversationId 기준)' },
      { file: 'src/utils/chatInputUtils.ts', desc: '대화 목록 제목: conversationListTitleFromUserMessage, 첫 답변 후 resolveListTitleAfterAssistantReply(명시 제목·API 생성·빈 답 시 유지)' },
      { file: 'src/components/ChatGPTInterface.tsx', desc: '사이드바 ↔ 대화 동기화·목록 제목 갱신 경로 통일(스트리밍·비스트리밍·재생성·편집). 새 대화 클릭 시 선택 해제, 대화 변경 시 location.state 동기화' },
    ],
  },
  {
    category: '아이콘',
    items: [
      { file: 'src/components/Icons/BrainwaveIcons.tsx', desc: 'Figma 스타일 24×24 아이콘 (로고·편집·검색·폴더·목소리·메시지 등)' },
      { file: 'src/AppUnified.tsx', desc: '새 대화(IconEdit), 대화 검색, 프로젝트(IconFolder+Plus), 목소리(IconVolume), 대화(IconMessage)' },
    ],
  },
  {
    category: '반응형·접근성',
    items: [
      { file: 'src/App.css', desc: '모바일 미디어 쿼리 var(--breakpoint-md) 통일' },
      { file: 'src/styles/responsive.css', desc: '모바일 메뉴 버튼 터치 타겟, :focus-visible 포커스 링' },
    ],
  },
  {
    category: '에러 처리',
    items: [
      { file: 'src/components/ErrorBoundary.tsx', desc: '홈으로 돌아가기 버튼 추가 (다시 시도·새로고침과 함께)' },
      { file: 'src/components/ErrorBoundary.css', desc: '에러 액션 영역 flex-wrap' },
    ],
  },
  {
    category: '린트·테스트',
    items: [
      { file: '.eslintrc.js', desc: 'setupTests·*.test·__tests__에서 import/first off (jest.mock·installJestFetchMock·소스맵 순서)' },
      { file: 'src/services/websocket.ts', desc: 'import 순서 정리(errorLogger를 상단으로)' },
      { file: 'package.json', desc: 'Jest는 CRA 허용 옵션만 유지(watchPathIgnorePatterns·moduleNameMapper·testMatch); react-scripts가 setupTests 자동 로드' },
    ],
  },
  {
    category: '파이프라인 튜닝·내부 보안 (관리)',
    items: [
      { file: 'src/views/PipelineTuningView.tsx', desc: '/pipeline-tuning — GET /api/pipeline-tuning·/api/llm-internal-security 조회 UI' },
      { file: 'src/services/pipelineTuningService.ts', desc: '튜닝 설정·LLM 내부 보안 상태 fetch 헬퍼' },
      { file: 'src/AppUnified.tsx', desc: 'PIPELINE_TUNING_PATH 라우트·lazy 로드' },
    ],
  },
  {
    category: '문서·배포',
    items: [
      { file: 'docs/WHAT_IS_THIS.md', desc: '이걸 뭐 하려는 거야? 한눈에 보기' },
      { file: 'docs/FRONTEND_CHANGES.md', desc: '프론트엔드 변경 사항 요약' },
      { file: 'docs/guides/CHAT_ANSWER_FLOW_VERIFICATION.md', desc: '대화 입력→질문 표시→답변 생성·품질 흐름 검증' },
      { file: 'docs/guides/CHAT_UI_TEST_SCENARIOS.md', desc: '대화 UI·접근성·품질 수동 확인 시나리오' },
      { file: 'docs/guides/ANSWER_QUALITY_AND_SEARCH.md', desc: '답변 품질·검색·자료 활용·생성 능력 최대 활용' },
      { file: 'docs/DEEPSEEK_SETUP.md', desc: '딥시크 설치형/API·동작 체크리스트' },
      { file: 'docs/DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md', desc: '딥시크 설치→구동→개발→학습 한 흐름' },
      { file: 'package.json', desc: 'deploy:server 스크립트 (deploy:check + deploy:dev)' },
    ],
  },
];

function DevStatusView() {
  return (
    <div className="main-content bw-detail-root bw-detail-root--centered bw-tool-view" role="main" aria-label="개발 상태" data-testid="dev-status-view">
      <header className="bw-detail-header-left">
        <p className="bw-detail-desc">지금까지 프론트엔드에 반영된 기능과 변경 사항을 확인할 수 있습니다.</p>
      </header>
      <div className="bw-tool-view-body">
        <section className="bw-detail-section" aria-labelledby="dev-summary-heading">
          <h2 id="dev-summary-heading" className="bw-detail-section-title">{SUMMARY.title}</h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc" style={{ fontWeight: 600, marginBottom: '1rem' }}>
              {SUMMARY.oneLiner}
            </p>
            <ul className="bw-detail-list bw-list-unstyled">
              {SUMMARY.features.map((f) => (
                <li key={f.name} className="bw-list-item-spaced">
                  <strong>{f.name}</strong>
                  <p className="bw-detail-desc bw-desc-tight">{f.desc}</p>
                </li>
              ))}
            </ul>
            <p className="bw-detail-desc bw-desc-tight" style={{ marginTop: '1rem' }}>
              <strong>화면 구성:</strong> {SUMMARY.layout}
            </p>
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="dev-changes-heading">
          <h2 id="dev-changes-heading" className="bw-detail-section-title">프론트엔드 변경 사항</h2>
          <div className="bw-features-card bw-detail-scroll">
            {CHANGES.map((group) => (
              <div key={group.category} style={{ marginBottom: '1.5rem' }}>
                <h3 className="bw-detail-section-title" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                  {group.category}
                </h3>
                <ul className="bw-detail-list bw-list-unstyled">
                  {group.items.map((item) => (
                    <li key={item.file} className="bw-list-item-spaced" style={{ marginBottom: '0.5rem' }}>
                      <code style={{ fontSize: '0.85em', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4 }}>
                        {item.file}
                      </code>
                      <span style={{ marginLeft: '0.5rem' }}>{item.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="dev-verify-heading">
          <h2 id="dev-verify-heading" className="bw-detail-section-title">검증·배포</h2>
          <div className="bw-features-card bw-detail-scroll">
            <ul className="bw-features-card-desc">
              <li><code>npm run verify:completion</code> — 타입·린트·P4 148 tests</li>
              <li><code>npm run test:views</code> — 뷰·라우트 20 suites, 105 tests</li>
              <li><code>npm run deploy:check</code> — 검증 + 빌드 → build/ 생성</li>
              <li><code>npm run restart:backend</code> — 백엔드 재시작 (기본 포트 5002, 프록시와 동일)</li>
              <li><code>npm run deploy:server</code> — .env에 DEPLOY_DEV_HOST, DEPLOY_DEV_PATH 설정 후 서버 반영</li>
              <li>
                상세 표: <code>docs/guides/ANSWER_QUALITY_AND_SEARCH.md</code> §8 검증·배포(로컬)
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

export default DevStatusView;
