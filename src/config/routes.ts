// 목소리 생성 등 유틸 라우트 경로 (단일 소스, E2E·문서 참조)
export const VOICE_GENERATION_PATH = '/voice-generation';
/** Genspark `agents?id=` · `agents?type=super_agent` 와 맞춘 쿼리 — `/agents?id=<uuid>` | `/agents?type=super_agent` */
export const AGENTS_PATH = '/agents';

/** Genspark식 `/agents`·외부 `genspark.ai/agents` 쿼리 키 (`gensparkAgentRegistry`, 네비게이션). */
export const AGENTS_QUERY_PARAM_ID = 'id';
export const AGENTS_QUERY_PARAM_TYPE = 'type';
/** Genspark `?type=` 값 — Super Agent 진입. */
export const GENSPARK_AGENTS_TYPE_SUPER_AGENT = 'super_agent';

/** 확장 범위 라우트 (DEVELOPMENT_SCOPE_MASTER·BACKLOG) */
export const SETTINGS_PATH = '/settings';
export const ANALYTICS_PATH = '/analytics';
export const DOCS_PATH = '/docs';
export const TEMPLATES_PATH = '/templates';
export const SEARCH_PATH = '/search';
export const INTEGRATIONS_PATH = '/integrations';
export const TEAM_PATH = '/team';
export const LEARN_PATH = '/learn';
export const BILLING_PATH = '/billing';
export const WORKSPACE_PATH = '/workspace';
export const AUTOMATION_PATH = '/automation';
export const COMMUNITY_PATH = '/community';
export const PIPELINE_TUNING_PATH = '/pipeline-tuning';
export const CONVERSATION_GRAPH_PATH = '/conversation-graph';
/** React Router `location.state` — 다른 화면→관계도 붙여넣기 handoff */
export const CONVERSATION_GRAPH_PASTE_STATE_KEY = 'corbu.conversationGraph.pasteText';
export const CONVERSATION_GRAPH_AUTO_CREATE_STATE_KEY = 'corbu.conversationGraph.autoCreateGraph';
/** React Router `location.state` — 관계도→`/chat` 초안·맥락·자동 전송 */
export const CONVERSATION_GRAPH_CHAT_CONTEXT_STATE_KEY = 'corbu.conversationGraph.chatContext';
export const CONVERSATION_GRAPH_CHAT_DRAFT_STATE_KEY = 'corbu.conversationGraph.chatDraft';
export const CONVERSATION_GRAPH_CHAT_AUTOSEND_STATE_KEY = 'corbu.conversationGraph.chatAutosend';
export const BACKUP_PATH = '/backup';
/** 개발 현황 (지금까지 반영된 기능·변경 사항) — 프론트에서 확인용 */
export const DEV_STATUS_PATH = '/dev-status';

/** 앱 전체 공개 경로 (리다이렉트 제외) — E2E·문서 동기화용 */
export const allAppPaths = [
  '/', '/chat', '/projects', '/ultimate', '/integrated', VOICE_GENERATION_PATH, AGENTS_PATH,
  SETTINGS_PATH, ANALYTICS_PATH, DOCS_PATH, TEMPLATES_PATH, SEARCH_PATH, INTEGRATIONS_PATH, TEAM_PATH, LEARN_PATH, BILLING_PATH,
  WORKSPACE_PATH, AUTOMATION_PATH, COMMUNITY_PATH, PIPELINE_TUNING_PATH, CONVERSATION_GRAPH_PATH, BACKUP_PATH,
  DEV_STATUS_PATH,
] as const;

// 기본 라우트 설정 (사이드 메뉴·라우팅 단일 소스)
// ChatGPT·Gemini처럼 3개로 단순화: 일반 대화 | 프로젝트 | 프로젝트 · 대화(/projects/:id)
export const defaultRoutes = [
  {
    path: AGENTS_PATH,
    name: '에이전트',
    description: 'Genspark식 agents?id= · agents?type=super_agent 링크로 에이전트 세션 열기',
    icon: '✨',
    category: 'main',
    isActive: true,
  },
  {
    path: '/',
    name: '일반 대화',
    description: '프로젝트와 분리된 독립 대화·질의응답',
    icon: '💬',
    category: 'main',
    isActive: true,
  },
  {
    path: '/projects',
    name: '프로젝트',
    description: '프로젝트 목록·생성·관리',
    icon: '📁',
    category: 'main',
    isActive: true,
  },
  {
    path: '/projects/:id',
    name: '프로젝트 · 대화',
    description: '특정 프로젝트 하위 작업 영역(대화·소스·노트북)',
    icon: '📓',
    category: 'main',
    isActive: true,
    hideFromNav: true, // 사이드바에 직접 노출하지 않음 (프로젝트 클릭 시 진입)
  },
];

// 확장 범위 라우트 (설정·분석·도움말·템플릿·검색·연동)
export const extendedRoutes = [
  { path: SETTINGS_PATH, name: '설정', description: '테마·알림·정보', icon: '⚙️', category: 'tools', isActive: true },
  { path: ANALYTICS_PATH, name: '분석', description: '사용 통계·대시보드', icon: '📊', category: 'tools', isActive: true },
  { path: DOCS_PATH, name: '도움말', description: '사용 가이드·문서', icon: '📖', category: 'tools', isActive: true },
  { path: TEMPLATES_PATH, name: '템플릿', description: '프롬프트·템플릿 라이브러리', icon: '📋', category: 'tools', isActive: true },
  { path: SEARCH_PATH, name: '검색', description: '전역 검색·디스커버리', icon: '🔍', category: 'tools', isActive: true },
  { path: INTEGRATIONS_PATH, name: '연동', description: '외부 API·웹훅·연동', icon: '🔗', category: 'tools', isActive: true },
  { path: TEAM_PATH, name: '팀', description: '팀·멤버·권한', icon: '👥', category: 'tools', isActive: true },
  { path: LEARN_PATH, name: '학습', description: '학습 경로·코스·튜토리얼', icon: '🎓', category: 'tools', isActive: true },
  { path: BILLING_PATH, name: '구독', description: '구독·플랜·결제', icon: '💳', category: 'tools', isActive: true },
  { path: WORKSPACE_PATH, name: '워크스페이스', description: '워크스페이스·조직', icon: '🏢', category: 'tools', isActive: true },
  { path: AUTOMATION_PATH, name: '자동화', description: '워크플로우·자동화 빌더', icon: '⚡', category: 'tools', isActive: true },
  { path: COMMUNITY_PATH, name: '커뮤니티', description: '포럼·지식 공유', icon: '💬', category: 'tools', isActive: true },
  { path: PIPELINE_TUNING_PATH, name: '파이프라인 튜닝', description: '응답 품질·타임아웃·파이프라인 단계 (관리자)', icon: '🔧', category: 'tools', isActive: true },
  { path: CONVERSATION_GRAPH_PATH, name: '대화 관계도', description: '대화 업로드·기간별 참여자 관계도', icon: '🕸️', category: 'tools', isActive: true },
  { path: BACKUP_PATH, name: '백업 및 복구', description: '백업 작업·기록·복구 관리', icon: '💾', category: 'tools', isActive: true },
];

// 카테고리별 라우트 그룹화 (사이드바 메뉴용)
export const routeCategories = [
  {
    id: 'main',
    name: 'CORBU.AI',
    description: '대화·프로젝트 통합',
    routes: defaultRoutes.filter((route) => route.category === 'main' && !(route as { hideFromNav?: boolean }).hideFromNav),
  },
  {
    id: 'tools',
    name: '도구',
    description: '설정·분석·도움말',
    routes: extendedRoutes.filter((r) => r.isActive !== false),
  },
];

/** React Router `pathname` 후행 슬래시 제거(루트는 `/` 유지). 빈 문자열은 그대로. */
export function normalizeRouterPathname(pathname: string): string {
  if (!pathname) return '';
  if (pathname === '/') return '/';
  return pathname.replace(/\/+$/, '');
}

/** pathname에 해당하는 페이지 제목 반환 (document title·모바일 헤더 단일 소스) */
export function getPageTitle(pathname: string): string {
  const path = normalizeRouterPathname(pathname);
  if (!path) return 'CORBU.AI';
  const route = defaultRoutes.find((r) => r.path === path) ?? extendedRoutes.find((r) => r.path === path);
  if (route) return route.name;
  if (path === '/chat') return '일반 대화';
  if (/^\/projects\/[^/]+$/.test(path)) return '프로젝트 · 대화';
  if (path === '/features-map') return '전체 기능';
  if (path === VOICE_GENERATION_PATH) return '목소리 생성';
  if (path === SETTINGS_PATH) return '설정';
  if (path === ANALYTICS_PATH) return '분석';
  if (path === DOCS_PATH) return '도움말';
  if (path === TEMPLATES_PATH) return '템플릿';
  if (path === SEARCH_PATH) return '검색';
  if (path === INTEGRATIONS_PATH) return '연동';
  if (path === TEAM_PATH) return '팀';
  if (path === LEARN_PATH) return '학습';
  if (path === BILLING_PATH) return '구독';
  if (path === WORKSPACE_PATH) return '워크스페이스';
  if (path === AUTOMATION_PATH) return '자동화';
  if (path === COMMUNITY_PATH) return '커뮤니티';
  if (path === DEV_STATUS_PATH) return '개발 현황';
  if (path === AGENTS_PATH) return '에이전트';
  if (path === '/ultimate') return 'Ultimate 대화';
  if (path === '/integrated') return '통합 마스터';
  return 'CORBU.AI';
}

/**
 * `ChatGPTInterface`가 `document.title`을 대화 제목·프로젝트명 등으로 직접 맞추는 경로.
 * `AppUnified`의 `DocumentTitle`은 이 경로에서 제목을 덮어쓰지 않음(엔터 직후 타이틀 유지).
 */
export function isDocumentTitleOwnedByChatGPTInterface(pathname: string): boolean {
  const p = normalizeRouterPathname(pathname);
  if (!p) return false;
  return p === '/' || p === '/chat' || p === AGENTS_PATH || /^\/projects\/[^/]+$/.test(p);
}

/**
 * `getPageTitle`이 알 수 없는 경로로 분류할 때(반환값 `CORBU.AI`) 탭 제목을 404 문구로 맞춤.
 * `MemoryRouter` 등에서 `useMatches`를 쓰지 않고도 `path="*"` 404와 동일한 타이틀을 유지하기 위함.
 */
export function shouldUseNotFoundDocumentTitle(pathname: string): boolean {
  if (isDocumentTitleOwnedByChatGPTInterface(pathname)) return false;
  return getPageTitle(pathname) === 'CORBU.AI';
}

/** 404 본문 제목·모바일 헤더·접근성에 공통 사용 */
export const NOT_FOUND_PAGE_HEADING = '페이지를 찾을 수 없습니다';

// 네비게이션 설정
export const navigationConfig = {
  title: 'CORBU.AI',
  logo: '🤖',
  theme: 'light' as const,
  showSearch: false,
  showNotifications: false,
  userMenu: {
    show: false,
    items: [],
  },
};

export const NOT_FOUND_DOCUMENT_TITLE = `${NOT_FOUND_PAGE_HEADING} - ${navigationConfig.title}`;

export default defaultRoutes;
