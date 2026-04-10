/**
 * config/routes 테스트
 */
import defaultRoutes, {
  routeCategories,
  navigationConfig,
  getPageTitle,
  normalizeRouterPathname,
  isDocumentTitleOwnedByChatGPTInterface,
  shouldUseNotFoundDocumentTitle,
  NOT_FOUND_PAGE_HEADING,
  NOT_FOUND_DOCUMENT_TITLE,
  VOICE_GENERATION_PATH,
  allAppPaths,
  SETTINGS_PATH,
  ANALYTICS_PATH,
  DOCS_PATH,
  TEMPLATES_PATH,
  SEARCH_PATH,
  INTEGRATIONS_PATH,
  TEAM_PATH,
  LEARN_PATH,
  BILLING_PATH,
  WORKSPACE_PATH,
  AUTOMATION_PATH,
  COMMUNITY_PATH,
  CONVERSATION_GRAPH_PATH,
  BACKUP_PATH,
  DEV_STATUS_PATH,
  AGENTS_PATH,
  AGENTS_QUERY_PARAM_ID,
  AGENTS_QUERY_PARAM_TYPE,
  GENSPARK_AGENTS_TYPE_SUPER_AGENT,
} from '../routes';

describe('config/routes', () => {
  describe('defaultRoutes', () => {
    it('기본 라우트가 정의되어 있음', () => {
      expect(defaultRoutes).toBeDefined();
      expect(Array.isArray(defaultRoutes)).toBe(true);
      expect(defaultRoutes.length).toBeGreaterThan(0);
    });

    it('홈(/) 라우트 구조 검증', () => {
      const home = defaultRoutes.find((r) => r.path === '/');
      expect(home).toBeDefined();
      expect(home?.name).toBe('일반 대화');
      expect(home?.description).toMatch(/독립|프로젝트/);
      expect(home?.category).toBe('main');
      expect(home?.isActive).toBe(true);
    });

    it('각 라우트에 path, name, category가 있어야 함', () => {
      defaultRoutes.forEach((route) => {
        expect(route).toHaveProperty('path');
        expect(route).toHaveProperty('name');
        expect(route).toHaveProperty('category');
        expect(typeof route.path).toBe('string');
        expect(typeof route.name).toBe('string');
      });
    });

    it('홈(/) 라우트가 정확히 하나 존재함', () => {
      const homeRoutes = defaultRoutes.filter((r) => r.path === '/');
      expect(homeRoutes).toHaveLength(1);
    });

    it('프로젝트 · 대화(/projects/:id) 라우트가 정의되어 있음', () => {
      const projectChat = defaultRoutes.find((r) => r.path === '/projects/:id');
      expect(projectChat).toBeDefined();
      expect(projectChat?.name).toBe('프로젝트 · 대화');
      expect(projectChat?.category).toBe('main');
      expect(projectChat).toEqual(expect.objectContaining({ hideFromNav: true }));
    });

    it('에이전트(/agents) 라우트가 정의되어 있음', () => {
      const agentsRoute = defaultRoutes.find((r) => r.path === AGENTS_PATH);
      expect(agentsRoute).toBeDefined();
      expect(agentsRoute?.name).toBe('에이전트');
      expect(agentsRoute?.category).toBe('main');
      expect(String(agentsRoute?.description ?? '')).toMatch(/super_agent/);
    });

    it('defaultRoutes의 path가 중복되지 않아야 함', () => {
      const paths = defaultRoutes.map((r) => r.path);
      const uniquePaths = [...new Set(paths)];
      expect(paths).toHaveLength(uniquePaths.length);
    });

    it('모든 라우트의 path가 비어 있지 않은 문자열이어야 함', () => {
      defaultRoutes.forEach((route) => {
        expect(typeof route.path).toBe('string');
        expect(route.path.length).toBeGreaterThan(0);
      });
    });
  });

  describe('routeCategories', () => {
    it('라우트 카테고리가 정의되어 있음', () => {
      expect(routeCategories).toBeDefined();
      expect(Array.isArray(routeCategories)).toBe(true);
    });

    it('main 카테고리가 존재함', () => {
      const main = routeCategories.find((c) => c.id === 'main');
      expect(main).toBeDefined();
      expect(main?.name).toBe('CORBU.AI');
      expect(main?.routes).toBeDefined();
      expect(Array.isArray(main?.routes)).toBe(true);
    });

    it('main 카테고리에는 hideFromNav가 아닌 라우트만 포함', () => {
      const main = routeCategories.find((c) => c.id === 'main');
      const navRoutes = defaultRoutes.filter((r) => {
        if (r.category !== 'main') return false;
        if ('hideFromNav' in r && r.hideFromNav === true) return false;
        return true;
      });
      expect(main?.routes).toEqual(navRoutes);
    });
  });

  describe('normalizeRouterPathname', () => {
    it('후행 슬래시를 제거하고 루트는 유지', () => {
      expect(normalizeRouterPathname('')).toBe('');
      expect(normalizeRouterPathname('/')).toBe('/');
      expect(normalizeRouterPathname('/settings/')).toBe('/settings');
      expect(normalizeRouterPathname('/projects/p1/')).toBe('/projects/p1');
    });
  });

  describe('getPageTitle', () => {
    it('pathname에 해당하는 라우트 이름을 반환함', () => {
      expect(getPageTitle('/')).toBe('일반 대화');
      expect(getPageTitle('/chat')).toBe('일반 대화');
      expect(getPageTitle('/projects')).toBe('프로젝트');
      expect(getPageTitle('/projects/abc-123')).toBe('프로젝트 · 대화');
      expect(getPageTitle('/projects/abc-123/')).toBe('프로젝트 · 대화');
      expect(getPageTitle(VOICE_GENERATION_PATH)).toBe('목소리 생성');
      expect(getPageTitle(AGENTS_PATH)).toBe('에이전트');
      expect(getPageTitle(`${AGENTS_PATH}/`)).toBe('에이전트');
    });

    it('확장 경로(도구 메뉴)에 해당하는 제목을 반환함', () => {
      expect(getPageTitle(SETTINGS_PATH)).toBe('설정');
      expect(getPageTitle(ANALYTICS_PATH)).toBe('분석');
      expect(getPageTitle(DOCS_PATH)).toBe('도움말');
      expect(getPageTitle(TEMPLATES_PATH)).toBe('템플릿');
      expect(getPageTitle(SEARCH_PATH)).toBe('검색');
      expect(getPageTitle(INTEGRATIONS_PATH)).toBe('연동');
      expect(getPageTitle(TEAM_PATH)).toBe('팀');
      expect(getPageTitle(LEARN_PATH)).toBe('학습');
      expect(getPageTitle(BILLING_PATH)).toBe('구독');
      expect(getPageTitle(WORKSPACE_PATH)).toBe('워크스페이스');
      expect(getPageTitle(AUTOMATION_PATH)).toBe('자동화');
      expect(getPageTitle(COMMUNITY_PATH)).toBe('커뮤니티');
      expect(getPageTitle(BACKUP_PATH)).toBe('백업 및 복구');
      expect(getPageTitle(DEV_STATUS_PATH)).toBe('개발 현황');
    });

    it('알 수 없는 pathname은 CORBU.AI를 반환함', () => {
      expect(getPageTitle('/unknown')).toBe('CORBU.AI');
      expect(getPageTitle('')).toBe('CORBU.AI');
    });
  });

  describe('isDocumentTitleOwnedByChatGPTInterface', () => {
    it('ChatGPTInterface가 제목을 소유하는 경로만 true', () => {
      expect(isDocumentTitleOwnedByChatGPTInterface('/')).toBe(true);
      expect(isDocumentTitleOwnedByChatGPTInterface('/chat')).toBe(true);
      expect(isDocumentTitleOwnedByChatGPTInterface(AGENTS_PATH)).toBe(true);
      expect(isDocumentTitleOwnedByChatGPTInterface('/projects/p1')).toBe(true);
      expect(isDocumentTitleOwnedByChatGPTInterface('/projects/p1/')).toBe(true);
      expect(isDocumentTitleOwnedByChatGPTInterface('/projects')).toBe(false);
      expect(isDocumentTitleOwnedByChatGPTInterface(SETTINGS_PATH)).toBe(false);
      expect(isDocumentTitleOwnedByChatGPTInterface('/projects/p1/extra')).toBe(false);
      expect(isDocumentTitleOwnedByChatGPTInterface('')).toBe(false);
    });
  });

  describe('shouldUseNotFoundDocumentTitle', () => {
    it('알 수 없는 경로이면서 Chat 소유 경로가 아닐 때만 true', () => {
      expect(shouldUseNotFoundDocumentTitle('/no-such-page')).toBe(true);
      expect(shouldUseNotFoundDocumentTitle('/no-such-page/')).toBe(true);
      expect(shouldUseNotFoundDocumentTitle('/')).toBe(false);
      expect(shouldUseNotFoundDocumentTitle('/chat')).toBe(false);
      expect(shouldUseNotFoundDocumentTitle(AGENTS_PATH)).toBe(false);
      expect(shouldUseNotFoundDocumentTitle('/projects/x')).toBe(false);
      expect(shouldUseNotFoundDocumentTitle(SETTINGS_PATH)).toBe(false);
    });

    it('등록된 페이지(getPageTitle이 CORBU.AI가 아님)는 false', () => {
      expect(shouldUseNotFoundDocumentTitle('/projects')).toBe(false);
      expect(shouldUseNotFoundDocumentTitle('/features-map')).toBe(false);
    });
  });

  describe('NOT_FOUND_PAGE_HEADING·NOT_FOUND_DOCUMENT_TITLE', () => {
    it('브라우저 탭 제목이 브랜드 접미사와 일치함', () => {
      expect(NOT_FOUND_PAGE_HEADING).toBe('페이지를 찾을 수 없습니다');
      expect(NOT_FOUND_DOCUMENT_TITLE).toBe(`${NOT_FOUND_PAGE_HEADING} - ${navigationConfig.title}`);
    });
  });

  describe('Genspark agents 쿼리 상수(merge·레지스트리와 동일 계약)', () => {
    it('에이전트 id·type 쿼리 키가 Genspark agents URL과 맞는다', () => {
      expect(AGENTS_QUERY_PARAM_ID).toBe('id');
      expect(AGENTS_QUERY_PARAM_TYPE).toBe('type');
      expect(GENSPARK_AGENTS_TYPE_SUPER_AGENT).toBe('super_agent');
    });

    it('에이전트 경로에 쿼리를 붙인 예시 URL 형태가 안정적이다', () => {
      const sampleId = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
      expect(`${AGENTS_PATH}?${AGENTS_QUERY_PARAM_ID}=${sampleId}`).toBe(
        `/agents?${AGENTS_QUERY_PARAM_ID}=${sampleId}`,
      );
      expect(`${AGENTS_PATH}?${AGENTS_QUERY_PARAM_TYPE}=${GENSPARK_AGENTS_TYPE_SUPER_AGENT}`).toBe(
        '/agents?type=super_agent',
      );
    });
  });

  describe('VOICE_GENERATION_PATH·allAppPaths', () => {
    it('VOICE_GENERATION_PATH가 /voice-generation임', () => {
      expect(VOICE_GENERATION_PATH).toBe('/voice-generation');
    });

    it('allAppPaths에 대화·프로젝트·목소리 생성·에이전트 경로가 포함됨', () => {
      expect(allAppPaths).toContain('/');
      expect(allAppPaths).toContain('/projects');
      expect(allAppPaths).toContain(VOICE_GENERATION_PATH);
      expect(allAppPaths).toContain(AGENTS_PATH);
    });

    it('allAppPaths에 확장 경로(도구 메뉴) 전부가 포함됨', () => {
      expect(allAppPaths).toContain(SETTINGS_PATH);
      expect(allAppPaths).toContain(ANALYTICS_PATH);
      expect(allAppPaths).toContain(DOCS_PATH);
      expect(allAppPaths).toContain(TEMPLATES_PATH);
      expect(allAppPaths).toContain(SEARCH_PATH);
      expect(allAppPaths).toContain(INTEGRATIONS_PATH);
      expect(allAppPaths).toContain(TEAM_PATH);
      expect(allAppPaths).toContain(LEARN_PATH);
      expect(allAppPaths).toContain(BILLING_PATH);
      expect(allAppPaths).toContain(WORKSPACE_PATH);
      expect(allAppPaths).toContain(AUTOMATION_PATH);
      expect(allAppPaths).toContain(COMMUNITY_PATH);
      expect(allAppPaths).toContain(CONVERSATION_GRAPH_PATH);
      expect(allAppPaths).toContain(BACKUP_PATH);
      expect(allAppPaths).toContain(DEV_STATUS_PATH);
    });
  });

  describe('navigationConfig', () => {
    it('네비게이션 설정 구조 검증', () => {
      expect(navigationConfig).toBeDefined();
      expect(navigationConfig.title).toBe('CORBU.AI');
      expect(navigationConfig.logo).toBeDefined();
      expect(navigationConfig.theme).toBe('light');
      expect(typeof navigationConfig.showSearch).toBe('boolean');
      expect(typeof navigationConfig.showNotifications).toBe('boolean');
    });

    it('userMenu 설정 검증', () => {
      expect(navigationConfig.userMenu).toBeDefined();
      expect(typeof navigationConfig.userMenu.show).toBe('boolean');
      expect(Array.isArray(navigationConfig.userMenu.items)).toBe(true);
    });
  });
});
