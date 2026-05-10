/**
 * E2E 테스트용 경로 상수
 * src/config/routes allAppPaths·VOICE_GENERATION_PATH와 동기화 유지
 * 검증 가이드: `e2e/README.md` · `../TESTING_GUIDE.md`(`routes.test`·`npm run test:sidebar-context`)
 */
export const PATHS = {
  /** 브라우저 루트 — 젠스파이크 우선 빌드에서는 /agents 로 리다이렉트될 수 있음 */
  HOME: '/',
  /** 독립 일반 대화(ChatGPT 본문) — 기본 빌드에서 스모크용으로 사용 */
  CHAT: '/chat',
  PROJECTS: '/projects',
  /** Genspark식 에이전트 허브 — `?id=`·`?type=super_agent` 세션 (`src/config/routes.ts`와 동기) */
  AGENTS: '/agents',
  VOICE_GENERATION: '/voice-generation',
  SETTINGS: '/settings',
  ANALYTICS: '/analytics',
  DOCS: '/docs',
  TEMPLATES: '/templates',
  SEARCH: '/search',
  INTEGRATIONS: '/integrations',
  TEAM: '/team',
  LEARN: '/learn',
  BILLING: '/billing',
  WORKSPACE: '/workspace',
  AUTOMATION: '/automation',
  COMMUNITY: '/community',
} as const;

/** 구버전 경로 — 리다이렉트 검증용 (/notebook·/file-analysis 는 프로젝트 UI 켤 때 /projects, 아니면 /chat) */
export const LEGACY_REDIRECT_PATHS = {
  FEATURES: '/features',
  NOTEBOOK: '/notebook',
  FILE_ANALYSIS: '/file-analysis',
  FEATURES_MAP: '/features-map',
} as const;

/** 404 검증용 경로 */
export const NOT_FOUND_PATH = '/nonexistent-page-404';
