/**
 * 워크스페이스 랜딩·대화 웰컴 공통 카피
 * — 부제(`WORKSPACE_TAGLINE_*`)는 히어로 제목과 문구가 겹치지 않게 구성합니다.
 * — 에이전트 허브·세션 상세 등 UI에 `code`로 노출할 때도 `WORKSPACE_TAGLINE_QUERY_SNIPPET`을 씁니다.
 */

/** 루트 워크스페이스 랜딩·대화 빈 화면 공통 히어로 제목 */
export const WORKSPACE_HOME_HEADLINE = 'CORBU.AI 워크스페이스';

/** 루트(/) 워크스페이스 홈 `document.title` */
export const WORKSPACE_MARKETING_DOCUMENT_TITLE = 'CORBU.AI — 워크스페이스';

/** `WorkspaceQueryComposer` 폼 기본 접근성 라벨 */
export const WORKSPACE_COMPOSER_FORM_ARIA_LABEL = '워크스페이스 질의';

/** 대화 빈 화면 `WelcomeWorkspacePanel` 도구 스트립 `nav` 접근성 라벨 */
export const WORKSPACE_WELCOME_AGENT_STRIP_ARIA_LABEL = '워크스페이스 도구 바로가기';

/** @deprecated 더 이상 사용하지 않음 — GensparkMarketingHomeView 에서 직접 텍스트로 대체 */
export const WORKSPACE_TAGLINE_QUERY_SNIPPET = '';
export const WORKSPACE_TAGLINE_AFTER_QUERY = '';

/** 워크스페이스 홈·`WorkspaceQueryComposer` textarea 기본 placeholder */
export const WORKSPACE_COMPOSER_PLACEHOLDER = '무엇이든 물어보고 만들어보세요';

/** 빈 일반 대화 스레드일 때 하단 입력창 placeholder (`ChatGPTInterface` 등) */
export const WORKSPACE_CHAT_EMPTY_THREAD_PLACEHOLDER = `CORBU.AI에게 ${WORKSPACE_COMPOSER_PLACEHOLDER}`;

/** 웰컴(대화 없음) 입력창 위 추천 칩 — 소스·후속 질문이 없을 때 */
export const WORKSPACE_WELCOME_SUGGESTION_CHIPS = [
  '오늘 할 일을 정리해줘',
  '문서를 요약해줘',
  '아이디어를 정리해줘',
] as const;
