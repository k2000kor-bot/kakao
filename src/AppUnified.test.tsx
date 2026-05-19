/**
 * @jest-environment jsdom
 */
/**
 * AppUnified 통합 레이아웃 테스트
 * - 사이드바·스킵 링크·검색 입력
 * - 404 라우트 (MemoryRouter로 /unknown 접근)
 *
 * Jest 전역(`describe`·`it`·`expect`·`beforeAll`·`jest`)과 jest-dom은 `/// <reference types="jest" />`와
 * `import '@testing-library/jest-dom'`으로 맞춘다. `@jest/globals`의 expect는 jest-dom 매처와 타입이 충돌한다.
 */
/// <reference types="jest" />
import '@testing-library/jest-dom';
import React from 'react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppUnifiedRoutes } from './AppUnified';
import {
  AGENTS_PATH,
  AGENTS_QUERY_PARAM_ID,
  AGENTS_QUERY_PARAM_TYPE,
  ANALYTICS_PATH,
  AUTOMATION_PATH,
  BACKUP_PATH,
  BILLING_PATH,
  COMMUNITY_PATH,
  CONVERSATION_GRAPH_PATH,
  DASHBOARD_PATH,
  DEV_STATUS_PATH,
  DOCS_PATH,
  GENSPARK_AGENTS_TYPE_SUPER_AGENT,
  INTEGRATIONS_PATH,
  LEARN_PATH,
  MARKETING_HOME_COMPOSER_DRAFT_STATE_KEY,
  NOT_FOUND_PAGE_HEADING,
  PIPELINE_TUNING_PATH,
  SEARCH_PATH,
  SETTINGS_PATH,
  TEAM_PATH,
  TEMPLATES_PATH,
  VOICE_GENERATION_PATH,
  WORKSPACE_PATH,
} from './config/routes';
import { STANDALONE_CHAT_PATH } from './config/uiPreferences';
import { TEST_IDS } from './constants/testIds';
import { GENSPARK_REFERENCE_AGENT_ID } from './services/gensparkReferenceAgentPreset';
import { CHATGPT_CONVERSATIONS_STORAGE_KEY, SIDEBAR_CHATS_UPDATED_EVENT } from './services/chatGptUiStorageKeys';
import { installJestDomQuietNetworkForTests, setupCommonMocks, withProcessEnvAsync } from './test-utils/testHelpers';

jest.mock('./components/ThemeProvider', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useTheme: () => ({ isDarkMode: false, setMode: () => {} }),
}));

jest.mock('./components/ChatGPTInterface', () => ({
  __esModule: true,
  default: (props: { gensparkRouteAgentId?: string }) =>
    require('react').createElement('div', {
      'data-testid': 'mock-chat',
      'data-genspark-route-agent-id': props.gensparkRouteAgentId ?? '',
    }, 'Chat'),
}));
jest.mock('./views/ProjectsPage', () => ({
  __esModule: true,
  default: () => require('react').createElement('div', { 'data-testid': 'mock-projects' }, 'Projects'),
}));
jest.mock('./views/VoiceGenerationView', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement('div', { 'data-testid': 'mock-voice-generation' }, 'Voice'),
}));
jest.mock('./views/AnalyticsView', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement(
      'div',
      { 'data-testid': 'analytics-view', role: 'main', 'aria-label': '분석' },
      'Analytics',
    ),
}));
/** 도구 라우트는 `AppUnified`에서 lazy — 라우트 테스트만 할 때 본문·차트·API 이펙트로 `waitFor` 플레이키 방지 (jest.mock 팩토리는 인라인만 사용) */
jest.mock('./views/BillingView', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement('div', {
      'data-testid': 'billing-view',
      role: 'main',
      'aria-label': '결제',
    }, 'Billing'),
}));
jest.mock('./views/SettingsView', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement('div', {
      'data-testid': 'settings-view',
      role: 'main',
      'aria-label': '설정',
    }, 'Settings'),
}));
jest.mock('./views/IntegrationsView', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement('div', {
      'data-testid': 'integrations-view',
      role: 'main',
      'aria-label': '연동',
    }, 'Integrations'),
}));
jest.mock('./views/DocsView', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement('div', {
      'data-testid': 'docs-view',
      role: 'main',
      'aria-label': '문서',
    }, 'Docs'),
}));
jest.mock('./views/TemplatesView', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement('div', {
      'data-testid': 'templates-view',
      role: 'main',
      'aria-label': '템플릿',
    }, 'Templates'),
}));
jest.mock('./views/SearchView', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement('div', {
      'data-testid': 'search-view',
      role: 'main',
      'aria-label': '검색',
    }, 'Search'),
}));
jest.mock('./views/TeamView', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement('div', {
      'data-testid': 'team-view',
      role: 'main',
      'aria-label': '팀',
    }, 'Team'),
}));
jest.mock('./views/LearnView', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement('div', {
      'data-testid': 'learn-view',
      role: 'main',
      'aria-label': '학습',
    }, 'Learn'),
}));
jest.mock('./views/AutomationView', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement('div', {
      'data-testid': 'automation-view',
      role: 'main',
      'aria-label': '자동화',
    }, 'Automation'),
}));
jest.mock('./views/WorkspaceView', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement('div', {
      'data-testid': 'workspace-view',
      role: 'main',
      'aria-label': '워크스페이스',
    }, 'Workspace'),
}));
jest.mock('./views/CommunityView', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement('div', {
      'data-testid': 'community-view',
      role: 'main',
      'aria-label': '커뮤니티',
    }, 'Community'),
}));
jest.mock('./views/DevStatusView', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement('div', {
      'data-testid': 'dev-status-view',
      role: 'main',
      'aria-label': '개발 상태',
    }, 'DevStatus'),
}));
jest.mock('./views/PipelineTuningView', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement('div', {
      'data-testid': 'pipeline-tuning-view',
      role: 'main',
      'aria-label': '파이프라인 튜닝',
    }, 'PipelineTuning'),
}));
jest.mock('./views/GensparkAgentsHubView', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement('div', { 'data-testid': 'mock-genspark-agents-hub' }, 'AgentsHub'),
}));
jest.mock('./views/GensparkMarketingHomeView', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement('div', { 'data-testid': 'mock-genspark-marketing-home' }, 'MarketingHome'),
}));
jest.mock('./components/BackupRecoveryManager', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement('div', { 'data-testid': 'mock-backup-recovery' }, 'Backup'),
}));
jest.mock('./views/ConversationGraphView', () => {
  const { TEST_IDS } = require('./constants/testIds');
  return {
    __esModule: true,
    default: () =>
      require('react').createElement('div', { 'data-testid': TEST_IDS.CONVERSATION_GRAPH_VIEW }, 'ConversationGraph'),
  };
});
jest.mock('./components/UltimateChatGPTInterface', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement('div', { 'data-testid': 'mock-ultimate-chat' }, 'Ultimate'),
}));
jest.mock('./components/IntegratedMasterInterface', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement('div', { 'data-testid': 'mock-integrated-master' }, 'Integrated'),
}));
jest.mock('./components/IntegratedDashboard', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement('div', { 'data-testid': 'mock-integrated-dashboard' }, 'Dashboard'),
}));

let teardownAppUnifiedNetworkQuiet: (() => void) | undefined;

beforeAll(() => {
  setupCommonMocks();
  teardownAppUnifiedNetworkQuiet = installJestDomQuietNetworkForTests({ label: 'AppUnified.test' });
  Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
});

afterAll(() => {
  teardownAppUnifiedNetworkQuiet?.();
});

describe('AppUnified', () => {
  /** 사이드바 긴 대화: `<a title=…>`와 내부 `.sidebar-chat-title`에 전체 제목이 보이는지 검증 */
  async function assertSidebarLongChatTitle(longTitle: string): Promise<void> {
    const titleLink = await screen.findByTitle(longTitle);
    expect(titleLink).toBeInstanceOf(HTMLAnchorElement);
    expect(within(titleLink).getByText(longTitle)).toHaveClass('sidebar-chat-title');
  }

  it('렌더 시 본문으로 건너뛰기 링크와 사이드바 타이틀을 보여준다', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    expect(await screen.findByText('본문으로 건너뛰기')).toBeInTheDocument();
    const root = screen.getByTestId('app-unified-root');
    expect(root).toHaveTextContent(/CORBU|대화|에이전트/);
  });

  it('사이드바 더보기 메뉴에 시스템 대시보드 링크가 있다', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await userEvent.click(await screen.findByTestId('sidebar-brand-more-btn'));
    const dashboardLink = await screen.findByRole('menuitem', { name: '시스템 대시보드' });
    expect(dashboardLink).toHaveAttribute('href', DASHBOARD_PATH);
  });

  it('사이드바 더보기 메뉴에 대화 관계도·구독 링크가 있다', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await userEvent.click(await screen.findByTestId('sidebar-brand-more-btn'));
    expect(screen.getByRole('menuitem', { name: '대화 관계도' })).toHaveAttribute(
      'href',
      CONVERSATION_GRAPH_PATH,
    );
    expect(screen.getByRole('menuitem', { name: '구독·플랜' })).toHaveAttribute('href', BILLING_PATH);
  });

  it('404 경로에서 "페이지를 찾을 수 없습니다"와 홈 링크를 보여준다', async () => {
    render(
      <MemoryRouter initialEntries={['/unknown-path']}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(NOT_FOUND_PAGE_HEADING)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(document.title).toContain(NOT_FOUND_PAGE_HEADING);
    });
    await waitFor(() => {
      expect(document.title).toMatch(/CORBU\.AI/);
    });
    expect(screen.getByText('홈으로 돌아가기')).toBeInTheDocument();
    expect(screen.getByText('이전 페이지')).toBeInTheDocument();
    expect(screen.getByText(/Esc 키를 누르면 홈으로 이동합니다/)).toBeInTheDocument();
  });

  it('404 경로에서 모바일 뷰 헤더 제목도 404 문구를 쓴다', async () => {
    const prevW = window.innerWidth;
    window.innerWidth = 400;
    try {
      render(
        <MemoryRouter initialEntries={['/unknown-mobile-404']}>
          <AppUnifiedRoutes />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByTestId('brainwave-mobile-title')).toHaveTextContent(NOT_FOUND_PAGE_HEADING);
      });
    } finally {
      window.innerWidth = prevW;
    }
  });

  it('404 경로에서도 사이드바 긴 대화 제목 전체가 DOM에 있다', async () => {
    const longTitle = `${'찾'.repeat(37)}끝표시`;
    localStorage.setItem(
      CHATGPT_CONVERSATIONS_STORAGE_KEY,
      JSON.stringify([
        { id: 'not-found-long', title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
      ]),
    );
    try {
      render(
        <MemoryRouter initialEntries={['/no-such-route-sidebar-long']}>
          <AppUnifiedRoutes />
        </MemoryRouter>,
      );
      await waitFor(() => {
        expect(screen.getByText(NOT_FOUND_PAGE_HEADING)).toBeInTheDocument();
      });
      await assertSidebarLongChatTitle(longTitle);
    } finally {
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    }
  });

  it('통합 루트에 brainwave-unified 클래스와 data-brainwave-figma가 있다', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    const root = await screen.findByTestId('app-unified-root');
    expect(root).toHaveClass('brainwave-unified');
    expect(root).toHaveAttribute('data-brainwave-figma');
    expect(root).toHaveTextContent(/CORBU|대화|에이전트/);
  });

  it('/projects 접근 시 에이전트 허브로 리다이렉트된다 (기본: 프로젝트 UI 끔)', async () => {
    render(
      <MemoryRouter initialEntries={['/projects']}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('mock-genspark-agents-hub')).toBeInTheDocument();
    });
  });

  it('REACT_APP_UI_PROJECTS_ENABLED만 true(레거시 플래그 없음)여도 /projects 는 에이전트 허브로 리다이렉트된다', async () => {
    await withProcessEnvAsync({ REACT_APP_UI_PROJECTS_ENABLED: 'true' }, async () => {
      render(
        <MemoryRouter initialEntries={['/projects']}>
          <AppUnifiedRoutes />
        </MemoryRouter>,
      );
      await waitFor(() => {
        expect(screen.getByTestId('mock-genspark-agents-hub')).toBeInTheDocument();
      });
    });
  });

  it('/projects 로 진입해 에이전트 허브로 모일 때도 사이드바 긴 대화 제목 전체가 DOM에 있다', async () => {
    const longTitle = `${'목'.repeat(36)}끝표시`;
    localStorage.setItem(
      CHATGPT_CONVERSATIONS_STORAGE_KEY,
      JSON.stringify([
        { id: 'projects-to-hub-long', title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
      ]),
    );
    try {
      render(
        <MemoryRouter initialEntries={['/projects']}>
          <AppUnifiedRoutes />
        </MemoryRouter>,
      );
      await waitFor(() => {
        expect(screen.getByTestId('mock-genspark-agents-hub')).toBeInTheDocument();
      });
      await assertSidebarLongChatTitle(longTitle);
    } finally {
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    }
  });

  it('루트(/)는 기본 워크스페이스 우선 모드에서 워크스페이스 홈(마케팅 랜딩)을 렌더한다', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('mock-genspark-marketing-home')).toBeInTheDocument();
    });
  });

  it('루트(/)에서 워크스페이스 홈일 때도 사이드바 긴 대화 제목 전체가 DOM에 있다', async () => {
    const longTitle = `${'집'.repeat(38)}끝표시`;
    localStorage.setItem(
      CHATGPT_CONVERSATIONS_STORAGE_KEY,
      JSON.stringify([
        { id: 'index-to-hub-long', title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
      ]),
    );
    try {
      render(
        <MemoryRouter initialEntries={['/']}>
          <AppUnifiedRoutes />
        </MemoryRouter>,
      );
      await waitFor(() => {
        expect(screen.getByTestId('mock-genspark-marketing-home')).toBeInTheDocument();
      });
      await assertSidebarLongChatTitle(longTitle);
    } finally {
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    }
  });

  it(`${STANDALONE_CHAT_PATH} 접근 시 독립 대화(ChatGPTInterface)를 렌더한다`, async () => {
    render(
      <MemoryRouter initialEntries={[STANDALONE_CHAT_PATH]}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
    });
  });

  it(`${STANDALONE_CHAT_PATH} 접근 시 앱 셸 상단 브레드크럼은 숨긴다(입력 도크 위 경로 크롬과 중복 방지)`, async () => {
    render(
      <MemoryRouter initialEntries={[STANDALONE_CHAT_PATH]}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
    });
    expect(screen.queryByRole('navigation', { name: '현재 위치' })).not.toBeInTheDocument();
  });

  it('설정 접근 시 상단 브레드크럼이 한 줄(flex)로 표시된다', async () => {
    render(
      <MemoryRouter initialEntries={[SETTINGS_PATH]}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: '현재 위치' })).toBeInTheDocument();
    });
    const nav = screen.getByRole('navigation', { name: '현재 위치' });
    expect(within(nav).getByRole('list')).toBeInTheDocument();
    expect(within(nav).getAllByRole('listitem')).toHaveLength(2);
    expect(within(nav).getByRole('button', { name: '홈으로 이동' })).toBeInTheDocument();
    expect(within(nav).getByText('설정')).toHaveAttribute('aria-current', 'page');
  });

  it(`${STANDALONE_CHAT_PATH} + location.state.conversationId 로 진입해도 독립 대화를 렌더한다`, async () => {
    const convId = 'route-state-conv-1';
    render(
      <MemoryRouter
        initialEntries={[
          { pathname: STANDALONE_CHAT_PATH, state: { conversationId: convId }, key: 't-chat-state' },
        ]}
      >
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
    });
  });

  it(`${STANDALONE_CHAT_PATH} + 워크스페이스 홈에서 넘긴 질의 초안(location.state)로 진입해도 독립 대화를 렌더한다`, async () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: STANDALONE_CHAT_PATH,
            state: { [MARKETING_HOME_COMPOSER_DRAFT_STATE_KEY]: '루트 질의 초안' },
            key: 't-chat-mkt-draft',
          },
        ]}
      >
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
    });
  });

  it(`${STANDALONE_CHAT_PATH}/ + 워크스페이스 홈에서 넘긴 질의 초안(location.state)로 진입해도 독립 대화를 렌더한다`, async () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: `${STANDALONE_CHAT_PATH}/`,
            state: { [MARKETING_HOME_COMPOSER_DRAFT_STATE_KEY]: '후행 슬래시 초안' },
            key: 't-chat-mkt-draft-trailing',
          },
        ]}
      >
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
    });
  });

  it(`${STANDALONE_CHAT_PATH} + conversationId와 워크스페이스 질의 초안이 함께 있어도 독립 대화를 렌더한다`, async () => {
    const convId = 'route-state-conv-with-draft';
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: STANDALONE_CHAT_PATH,
            state: {
              conversationId: convId,
              [MARKETING_HOME_COMPOSER_DRAFT_STATE_KEY]: '함께 넘긴 초안',
            },
            key: 't-chat-both-state',
          },
        ]}
      >
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
    });
  });

  it(`${STANDALONE_CHAT_PATH} 접근 시에도 사이드바 대화 제목 전체 문자열이 DOM에 있다`, async () => {
    const longTitle = `${'다'.repeat(45)}끝표시`;
    localStorage.setItem(
      CHATGPT_CONVERSATIONS_STORAGE_KEY,
      JSON.stringify([
        { id: 'e2e-long-title-on-chat', title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
      ]),
    );
    try {
      render(
        <MemoryRouter initialEntries={[STANDALONE_CHAT_PATH]}>
          <AppUnifiedRoutes />
        </MemoryRouter>,
      );
      await waitFor(() => {
        expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
      });
      await assertSidebarLongChatTitle(longTitle);
    } finally {
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    }
  });

  it(`${STANDALONE_CHAT_PATH} + location.state.conversationId 로 진입해도 사이드바 긴 제목 전체가 DOM에 있다`, async () => {
    const convId = 'route-state-long-title';
    const longTitle = `${'라'.repeat(42)}끝표시`;
    localStorage.setItem(
      CHATGPT_CONVERSATIONS_STORAGE_KEY,
      JSON.stringify([
        { id: convId, title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
      ]),
    );
    try {
      render(
        <MemoryRouter
          initialEntries={[
            { pathname: STANDALONE_CHAT_PATH, state: { conversationId: convId }, key: 't-chat-long-title' },
          ]}
        >
          <AppUnifiedRoutes />
        </MemoryRouter>,
      );
      await waitFor(() => {
        expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
      });
      await assertSidebarLongChatTitle(longTitle);
    } finally {
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    }
  });

  it(`${STANDALONE_CHAT_PATH}/ 후행 슬래시로 접근해도 독립 대화(ChatGPTInterface)를 렌더한다`, async () => {
    render(
      <MemoryRouter initialEntries={[`${STANDALONE_CHAT_PATH}/`]}>
        <AppUnifiedRoutes />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
    });
  });

  it(`${STANDALONE_CHAT_PATH}/ 후행 슬래시로 접근해도 사이드바 긴 대화 제목 전체가 DOM에 있다`, async () => {
    const longTitle = `${'슬'.repeat(37)}끝표시`;
    localStorage.setItem(
      CHATGPT_CONVERSATIONS_STORAGE_KEY,
      JSON.stringify([
        { id: 'chat-trailing-slash-long', title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
      ]),
    );
    try {
      render(
        <MemoryRouter initialEntries={[`${STANDALONE_CHAT_PATH}/`]}>
          <AppUnifiedRoutes />
        </MemoryRouter>,
      );
      await waitFor(() => {
        expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
      });
      await assertSidebarLongChatTitle(longTitle);
    } finally {
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    }
  });

  it.each(
    [
      [`${AGENTS_PATH}/`, 'mock-genspark-agents-hub', '에', 'trail-slash-agents'] as const,
      [`${SETTINGS_PATH}/`, 'settings-view', '정', 'trail-slash-settings'] as const,
      ['/projects/', 'mock-genspark-agents-hub', '프', 'trail-slash-projects-hub'] as const,
      [`${VOICE_GENERATION_PATH}/`, 'mock-voice-generation', '음', 'trail-slash-voice'] as const,
      ['/ultimate/', 'mock-ultimate-chat', '말', 'trail-slash-ultimate'] as const,
      ['/integrated/', 'mock-integrated-master', '터', 'trail-slash-integrated'] as const,
      [`${DASHBOARD_PATH}/`, 'mock-integrated-dashboard', '시', 'trail-slash-dashboard'] as const,
      [`${CONVERSATION_GRAPH_PATH}/`, TEST_IDS.CONVERSATION_GRAPH_VIEW, '그', 'trail-slash-conv-graph'] as const,
      [`${BACKUP_PATH}/`, 'mock-backup-recovery', '복', 'trail-slash-backup'] as const,
      [`${DEV_STATUS_PATH}/`, 'dev-status-view', '발', 'trail-slash-dev-status'] as const,
      [`${PIPELINE_TUNING_PATH}/`, 'pipeline-tuning-view', '튜', 'trail-slash-pipeline'] as const,
      [`${BILLING_PATH}/`, 'billing-view', '료', 'trail-slash-billing'] as const,
    ],
  )(
    '%s 후행 슬래시로 접근해도 대상 뷰가 뜨고 사이드바 긴 대화 제목 전체가 DOM에 있다',
    async (path, readyTestId, prefix, convStorageId) => {
      const longTitle = `${prefix}${'·'.repeat(36)}끝표시`;
      localStorage.setItem(
        CHATGPT_CONVERSATIONS_STORAGE_KEY,
        JSON.stringify([
          { id: convStorageId, title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
        ]),
      );
      try {
        render(
          <MemoryRouter initialEntries={[path]}>
            <AppUnifiedRoutes />
          </MemoryRouter>,
        );
        await waitFor(() => {
          expect(screen.getByTestId(readyTestId)).toBeInTheDocument();
        });
        await assertSidebarLongChatTitle(longTitle);
      } finally {
        localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
      }
    },
  );

  it('REACT_APP_UI_GENSPARK_PRIMARY=false 일 때 루트(/)는 독립 대화를 렌더한다 (에이전트 허브 아님)', async () => {
    await withProcessEnvAsync({ REACT_APP_UI_GENSPARK_PRIMARY: 'false' }, async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <AppUnifiedRoutes />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('mock-genspark-marketing-home')).not.toBeInTheDocument();
    });
  });

  it('REACT_APP_UI_GENSPARK_PRIMARY=false 일 때 루트(/)에서도 사이드바 긴 대화 제목 전체가 DOM에 있다', async () => {
    const longTitle = `${'타'.repeat(44)}끝표시`;
    localStorage.setItem(
      CHATGPT_CONVERSATIONS_STORAGE_KEY,
      JSON.stringify([
        { id: 'root-no-genspark-long', title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
      ]),
    );
    try {
      await withProcessEnvAsync({ REACT_APP_UI_GENSPARK_PRIMARY: 'false' }, async () => {
        render(
          <MemoryRouter initialEntries={['/']}>
            <AppUnifiedRoutes />
          </MemoryRouter>,
        );
        await waitFor(() => {
          expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
        });
        await assertSidebarLongChatTitle(longTitle);
      });
    } finally {
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    }
  });

  it('REACT_APP_UI_PROJECTS_ENABLED=true 이고 워크스페이스 우선 미설정이면 루트(/)는 독립 대화를 렌더한다', async () => {
    await withProcessEnvAsync(
      {
        REACT_APP_UI_PROJECTS_LEGACY: 'true', REACT_APP_UI_PROJECTS_ENABLED: 'true',
        REACT_APP_UI_GENSPARK_PRIMARY: undefined,
      },
      async () => {
        render(
          <MemoryRouter initialEntries={['/']}>
            <AppUnifiedRoutes />
          </MemoryRouter>
        );
        await waitFor(() => {
          expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
        });
        expect(screen.queryByTestId('mock-genspark-marketing-home')).not.toBeInTheDocument();
      }
    );
  });

  it('REACT_APP_UI_PROJECTS_ENABLED=true 이고 워크스페이스 우선 미설정이면 루트(/)에서도 사이드바 긴 대화 제목 전체가 DOM에 있다', async () => {
    const longTitle = `${'겨'.repeat(42)}끝표시`;
    localStorage.setItem(
      CHATGPT_CONVERSATIONS_STORAGE_KEY,
      JSON.stringify([
        { id: 'root-projects-no-genspark-long', title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
      ]),
    );
    try {
      await withProcessEnvAsync(
        {
          REACT_APP_UI_PROJECTS_LEGACY: 'true', REACT_APP_UI_PROJECTS_ENABLED: 'true',
          REACT_APP_UI_GENSPARK_PRIMARY: undefined,
        },
        async () => {
          render(
            <MemoryRouter initialEntries={['/']}>
              <AppUnifiedRoutes />
            </MemoryRouter>,
          );
          await waitFor(() => {
            expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
          });
          await assertSidebarLongChatTitle(longTitle);
        },
      );
    } finally {
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    }
  });

  it.each([
    ['true'],
    ['1'],
  ])(
    'REACT_APP_UI_PROJECTS_ENABLED=true 이고 REACT_APP_UI_GENSPARK_PRIMARY=%s 면 루트(/)는 워크스페이스 홈을 렌더한다',
    async (gensparkVal) => {
      await withProcessEnvAsync(
        {
          REACT_APP_UI_PROJECTS_LEGACY: 'true', REACT_APP_UI_PROJECTS_ENABLED: 'true',
          REACT_APP_UI_GENSPARK_PRIMARY: gensparkVal,
        },
        async () => {
          render(
            <MemoryRouter initialEntries={['/']}>
              <AppUnifiedRoutes />
            </MemoryRouter>
          );
          await waitFor(() => {
            expect(screen.getByTestId('mock-genspark-marketing-home')).toBeInTheDocument();
          });
          expect(screen.queryByTestId('mock-chat')).not.toBeInTheDocument();
        }
      );
    }
  );

  it.each([
    ['true', 'hub-long-title-t', `${'햐'.repeat(40)}끝표시`],
    ['1', 'hub-long-title-1', `${'햐'.repeat(41)}끝표시`],
  ] as const)(
    'REACT_APP_UI_PROJECTS_ENABLED=true 이고 REACT_APP_UI_GENSPARK_PRIMARY=%s 일 때 루트(/) 워크스페이스 홈에서도 사이드바 긴 대화 제목 전체가 DOM에 있다',
    async (gensparkVal, storageId, longTitle) => {
      localStorage.setItem(
        CHATGPT_CONVERSATIONS_STORAGE_KEY,
        JSON.stringify([
          { id: storageId, title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
        ]),
      );
      try {
        await withProcessEnvAsync(
          {
            REACT_APP_UI_PROJECTS_LEGACY: 'true', REACT_APP_UI_PROJECTS_ENABLED: 'true',
            REACT_APP_UI_GENSPARK_PRIMARY: gensparkVal,
          },
          async () => {
            render(
              <MemoryRouter initialEntries={['/']}>
                <AppUnifiedRoutes />
              </MemoryRouter>,
            );
            await waitFor(() => {
              expect(screen.getByTestId('mock-genspark-marketing-home')).toBeInTheDocument();
            });
            await assertSidebarLongChatTitle(longTitle);
          },
        );
      } finally {
        localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
      }
    },
  );

  it('REACT_APP_UI_PROJECTS_ENABLED=true 이고 REACT_APP_UI_GENSPARK_PRIMARY=0 면 루트(/)는 독립 대화를 렌더한다', async () => {
    await withProcessEnvAsync(
      {
        REACT_APP_UI_PROJECTS_LEGACY: 'true', REACT_APP_UI_PROJECTS_ENABLED: 'true',
        REACT_APP_UI_GENSPARK_PRIMARY: '0',
      },
      async () => {
        render(
          <MemoryRouter initialEntries={['/']}>
            <AppUnifiedRoutes />
          </MemoryRouter>
        );
        await waitFor(() => {
          expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
        });
        expect(screen.queryByTestId('mock-genspark-marketing-home')).not.toBeInTheDocument();
      }
    );
  });

  it('REACT_APP_UI_PROJECTS_ENABLED=true 이고 REACT_APP_UI_GENSPARK_PRIMARY=0 일 때 루트(/)에서도 사이드바 긴 대화 제목 전체가 DOM에 있다', async () => {
    const longTitle = `${'페'.repeat(43)}끝표시`;
    localStorage.setItem(
      CHATGPT_CONVERSATIONS_STORAGE_KEY,
      JSON.stringify([
        { id: 'root-genspark-zero-long', title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
      ]),
    );
    try {
      await withProcessEnvAsync(
        {
          REACT_APP_UI_PROJECTS_LEGACY: 'true', REACT_APP_UI_PROJECTS_ENABLED: 'true',
          REACT_APP_UI_GENSPARK_PRIMARY: '0',
        },
        async () => {
          render(
            <MemoryRouter initialEntries={['/']}>
              <AppUnifiedRoutes />
            </MemoryRouter>,
          );
          await waitFor(() => {
            expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
          });
          await assertSidebarLongChatTitle(longTitle);
        },
      );
    } finally {
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    }
  });

  it('/projects/:id 접근 시 독립 대화(/chat)로 리다이렉트된다 (기본: 프로젝트 UI 끔)', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/proj-123']}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
    });
  });

  it('/projects/:id 로 리다이렉트된 뒤에도 사이드바 긴 대화 제목 전체가 DOM에 있다', async () => {
    const longTitle = `${'파'.repeat(41)}끝표시`;
    localStorage.setItem(
      CHATGPT_CONVERSATIONS_STORAGE_KEY,
      JSON.stringify([
        { id: 'projects-redirect-long', title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
      ]),
    );
    try {
      render(
        <MemoryRouter initialEntries={['/projects/proj-xyz']}>
          <AppUnifiedRoutes />
        </MemoryRouter>,
      );
      await waitFor(() => {
        expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
      });
      await assertSidebarLongChatTitle(longTitle);
    } finally {
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    }
  });

  it('REACT_APP_UI_PROJECTS_ENABLED=true 일 때 /projects 는 프로젝트 페이지를 렌더한다', async () => {
    await withProcessEnvAsync({ REACT_APP_UI_PROJECTS_LEGACY: 'true', REACT_APP_UI_PROJECTS_ENABLED: 'true' }, async () => {
      render(
        <MemoryRouter initialEntries={['/projects']}>
          <AppUnifiedRoutes />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByTestId('mock-projects')).toBeInTheDocument();
      });
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });
  });

  it('REACT_APP_UI_PROJECTS_ENABLED=true 일 때 /projects 프로젝트 목록에서도 사이드바 긴 대화 제목 전체가 DOM에 있다', async () => {
    const longTitle = `${'목'.repeat(38)}끝표시`;
    localStorage.setItem(
      CHATGPT_CONVERSATIONS_STORAGE_KEY,
      JSON.stringify([
        { id: 'projects-list-long', title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
      ]),
    );
    try {
      await withProcessEnvAsync({ REACT_APP_UI_PROJECTS_LEGACY: 'true', REACT_APP_UI_PROJECTS_ENABLED: 'true' }, async () => {
        render(
          <MemoryRouter initialEntries={['/projects']}>
            <AppUnifiedRoutes />
          </MemoryRouter>,
        );
        await waitFor(() => {
          expect(screen.getByTestId('mock-projects')).toBeInTheDocument();
        });
        await assertSidebarLongChatTitle(longTitle);
      });
    } finally {
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    }
  });

  it('REACT_APP_UI_PROJECTS_ENABLED=true 일 때 /projects/:id 는 대화 인터페이스를 렌더한다', async () => {
    await withProcessEnvAsync({ REACT_APP_UI_PROJECTS_LEGACY: 'true', REACT_APP_UI_PROJECTS_ENABLED: 'true' }, async () => {
      render(
        <MemoryRouter initialEntries={['/projects/proj-123']}>
          <AppUnifiedRoutes />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
      });
    });
  });

  it('REACT_APP_UI_PROJECTS_ENABLED=true 일 때 /projects/:id 진입 후에도 사이드바 긴 대화 제목 전체가 DOM에 있다', async () => {
    const longTitle = `${'차'.repeat(37)}끝표시`;
    localStorage.setItem(
      CHATGPT_CONVERSATIONS_STORAGE_KEY,
      JSON.stringify([
        { id: 'proj-enabled-long', title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
      ]),
    );
    try {
      await withProcessEnvAsync({ REACT_APP_UI_PROJECTS_LEGACY: 'true', REACT_APP_UI_PROJECTS_ENABLED: 'true' }, async () => {
        render(
          <MemoryRouter initialEntries={['/projects/proj-sidebar-long']}>
            <AppUnifiedRoutes />
          </MemoryRouter>,
        );
        await waitFor(() => {
          expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
        });
        await assertSidebarLongChatTitle(longTitle);
      });
    } finally {
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    }
  });

  describe('구버전 경로 리다이렉트 (북마크 호환)', () => {
    it.each([
      ['/simple'],
      ['/features'],
      ['/features-map'],
      ['/documents'],
    ])('%s 접근 시 독립 대화 경로로 리다이렉트되어 Chat이 렌더된다', async (path) => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <AppUnifiedRoutes />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
      });
    });

    it('구버전 /simple 로 진입해 Chat이 뜬 뒤에도 사이드바 긴 대화 제목 전체가 DOM에 있다', async () => {
      const longTitle = `${'마'.repeat(38)}끝표시`;
      localStorage.setItem(
        CHATGPT_CONVERSATIONS_STORAGE_KEY,
        JSON.stringify([
          { id: 'legacy-simple-long', title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
        ]),
      );
      try {
        render(
          <MemoryRouter initialEntries={['/simple']}>
            <AppUnifiedRoutes />
          </MemoryRouter>,
        );
        await waitFor(() => {
          expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
        });
        await assertSidebarLongChatTitle(longTitle);
      } finally {
        localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
      }
    });

    it.each([
      ['/features', 'legacy-features-long', `${'거'.repeat(33)}끝표시`],
      ['/features-map', 'legacy-features-map-long', `${'너'.repeat(32)}끝표시`],
      ['/documents', 'legacy-documents-long', `${'더'.repeat(31)}끝표시`],
    ] as const)(
      '구버전 %s 로 진입해 Chat이 뜬 뒤에도 사이드바 긴 대화 제목 전체가 DOM에 있다',
      async (path, storageId, longTitle) => {
        localStorage.setItem(
          CHATGPT_CONVERSATIONS_STORAGE_KEY,
          JSON.stringify([
            { id: storageId, title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
          ]),
        );
        try {
          render(
            <MemoryRouter initialEntries={[path]}>
              <AppUnifiedRoutes />
            </MemoryRouter>,
          );
          await waitFor(() => {
            expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
          });
          await assertSidebarLongChatTitle(longTitle);
        } finally {
          localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
        }
      },
    );

    it('REACT_APP_UI_GENSPARK_PRIMARY=false 일 때 /simple 은 / 로 모여 독립 대화(Chat)가 렌더된다', async () => {
      await withProcessEnvAsync({ REACT_APP_UI_GENSPARK_PRIMARY: 'false' }, async () => {
        render(
          <MemoryRouter initialEntries={['/simple']}>
            <AppUnifiedRoutes />
          </MemoryRouter>
        );
        await waitFor(() => {
          expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
        });
      });
    });

    it('REACT_APP_UI_GENSPARK_PRIMARY=false 일 때 /simple 로 진입해도 사이드바 긴 대화 제목 전체가 DOM에 있다', async () => {
      const longTitle = `${'섬'.repeat(37)}끝표시`;
      localStorage.setItem(
        CHATGPT_CONVERSATIONS_STORAGE_KEY,
        JSON.stringify([
          { id: 'legacy-simple-genspark-false-long', title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
        ]),
      );
      try {
        await withProcessEnvAsync({ REACT_APP_UI_GENSPARK_PRIMARY: 'false' }, async () => {
          render(
            <MemoryRouter initialEntries={['/simple']}>
              <AppUnifiedRoutes />
            </MemoryRouter>,
          );
          await waitFor(() => {
            expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
          });
          await assertSidebarLongChatTitle(longTitle);
        });
      } finally {
        localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
      }
    });

    it('/notebook 과 /file-analysis 는 프로젝트 UI가 꺼져 있으면 독립 대화로 리다이렉트된다', async () => {
      for (const path of ['/notebook', '/file-analysis']) {
        const { unmount } = render(
          <MemoryRouter initialEntries={[path]}>
            <AppUnifiedRoutes />
          </MemoryRouter>
        );
        await waitFor(() => {
          expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
        });
        unmount();
      }
    });

    it('/notebook 으로 리다이렉트된 뒤에도 사이드바 긴 대화 제목 전체가 DOM에 있다', async () => {
      const longTitle = `${'카'.repeat(35)}끝표시`;
      localStorage.setItem(
        CHATGPT_CONVERSATIONS_STORAGE_KEY,
        JSON.stringify([
          { id: 'notebook-redirect-long', title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
        ]),
      );
      try {
        render(
          <MemoryRouter initialEntries={['/notebook']}>
            <AppUnifiedRoutes />
          </MemoryRouter>,
        );
        await waitFor(() => {
          expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
        });
        await assertSidebarLongChatTitle(longTitle);
      } finally {
        localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
      }
    });

    it('/file-analysis 로 리다이렉트된 뒤에도 사이드바 긴 대화 제목 전체가 DOM에 있다', async () => {
      const longTitle = `${'하'.repeat(34)}끝표시`;
      localStorage.setItem(
        CHATGPT_CONVERSATIONS_STORAGE_KEY,
        JSON.stringify([
          { id: 'file-analysis-redirect-long', title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
        ]),
      );
      try {
        render(
          <MemoryRouter initialEntries={['/file-analysis']}>
            <AppUnifiedRoutes />
          </MemoryRouter>,
        );
        await waitFor(() => {
          expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
        });
        await assertSidebarLongChatTitle(longTitle);
      } finally {
        localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
      }
    });

    it('REACT_APP_UI_PROJECTS_ENABLED=true 일 때 /notebook 과 /file-analysis 는 프로젝트 목록으로 리다이렉트된다', async () => {
      await withProcessEnvAsync({ REACT_APP_UI_PROJECTS_LEGACY: 'true', REACT_APP_UI_PROJECTS_ENABLED: 'true' }, async () => {
        for (const path of ['/notebook', '/file-analysis']) {
          const { unmount } = render(
            <MemoryRouter initialEntries={[path]}>
              <AppUnifiedRoutes />
            </MemoryRouter>
          );
          await waitFor(() => {
            expect(screen.getByTestId('mock-projects')).toBeInTheDocument();
          });
          unmount();
        }
      });
    });

    it('REACT_APP_UI_PROJECTS_ENABLED=true 일 때 /notebook 으로 프로젝트 목록이 뜬 뒤에도 사이드바 긴 대화 제목 전체가 DOM에 있다', async () => {
      const longTitle = `${'노'.repeat(36)}끝표시`;
      localStorage.setItem(
        CHATGPT_CONVERSATIONS_STORAGE_KEY,
        JSON.stringify([
          { id: 'notebook-projects-long', title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
        ]),
      );
      try {
        await withProcessEnvAsync({ REACT_APP_UI_PROJECTS_LEGACY: 'true', REACT_APP_UI_PROJECTS_ENABLED: 'true' }, async () => {
          render(
            <MemoryRouter initialEntries={['/notebook']}>
              <AppUnifiedRoutes />
            </MemoryRouter>,
          );
          await waitFor(() => {
            expect(screen.getByTestId('mock-projects')).toBeInTheDocument();
          });
          await assertSidebarLongChatTitle(longTitle);
        });
      } finally {
        localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
      }
    });

    it('REACT_APP_UI_PROJECTS_ENABLED=true 일 때 /file-analysis 로 프로젝트 목록이 뜬 뒤에도 사이드바 긴 대화 제목 전체가 DOM에 있다', async () => {
      const longTitle = `${'애'.repeat(35)}끝표시`;
      localStorage.setItem(
        CHATGPT_CONVERSATIONS_STORAGE_KEY,
        JSON.stringify([
          { id: 'file-analysis-projects-long', title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
        ]),
      );
      try {
        await withProcessEnvAsync({ REACT_APP_UI_PROJECTS_LEGACY: 'true', REACT_APP_UI_PROJECTS_ENABLED: 'true' }, async () => {
          render(
            <MemoryRouter initialEntries={['/file-analysis']}>
              <AppUnifiedRoutes />
            </MemoryRouter>,
          );
          await waitFor(() => {
            expect(screen.getByTestId('mock-projects')).toBeInTheDocument();
          });
          await assertSidebarLongChatTitle(longTitle);
        });
      } finally {
        localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
      }
    });
  });

  it('/voice-generation 접근 시 목소리 생성 뷰를 렌더한다', async () => {
    render(
      <MemoryRouter initialEntries={[VOICE_GENERATION_PATH]}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('mock-voice-generation')).toBeInTheDocument();
    });
    expect(screen.getByText('Voice')).toBeInTheDocument();
  });

  it('/agents 접근 시 에이전트 허브를 렌더한다', async () => {
    render(
      <MemoryRouter initialEntries={['/agents']}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('mock-genspark-agents-hub')).toBeInTheDocument();
    });
    expect(screen.getByText('AgentsHub')).toBeInTheDocument();
  });

  it(`${AGENTS_PATH} 접근 시(에이전트 허브)에도 사이드바 긴 대화 제목 전체가 DOM에 있다`, async () => {
    const longTitle = `${'허'.repeat(38)}끝표시`;
    localStorage.setItem(
      CHATGPT_CONVERSATIONS_STORAGE_KEY,
      JSON.stringify([
        { id: 'agents-hub-long', title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
      ]),
    );
    try {
      render(
        <MemoryRouter initialEntries={[AGENTS_PATH]}>
          <AppUnifiedRoutes />
        </MemoryRouter>,
      );
      await waitFor(() => {
        expect(screen.getByTestId('mock-genspark-agents-hub')).toBeInTheDocument();
      });
      await assertSidebarLongChatTitle(longTitle);
    } finally {
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    }
  });

  it('/agents?id=… 접근 시 대화 인터페이스를 렌더한다', async () => {
    const routeId = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
    render(
      <MemoryRouter
        initialEntries={[`${AGENTS_PATH}?${AGENTS_QUERY_PARAM_ID}=${routeId}`]}
      >
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
    });
    expect(screen.getByTestId('mock-chat')).toHaveAttribute('data-genspark-route-agent-id', routeId);
  });

  it('/agents?id=… 로 진입해도 사이드바 긴 대화 제목 전체가 DOM에 있다', async () => {
    const routeId = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
    const longTitle = `${'바'.repeat(40)}끝표시`;
    localStorage.setItem(
      CHATGPT_CONVERSATIONS_STORAGE_KEY,
      JSON.stringify([
        { id: 'agents-sidebar-long', title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
      ]),
    );
    try {
      render(
        <MemoryRouter
          initialEntries={[`${AGENTS_PATH}?${AGENTS_QUERY_PARAM_ID}=${routeId}`]}
        >
          <AppUnifiedRoutes />
        </MemoryRouter>,
      );
      await waitFor(() => {
        expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
      });
      expect(screen.getByTestId('mock-chat')).toHaveAttribute('data-genspark-route-agent-id', routeId);
      await assertSidebarLongChatTitle(longTitle);
    } finally {
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    }
  });

  it('/agents?type=super_agent 접근 시 대화 인터페이스를 렌더한다 (참조 Super Agent)', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          `${AGENTS_PATH}?${AGENTS_QUERY_PARAM_TYPE}=${GENSPARK_AGENTS_TYPE_SUPER_AGENT}`,
        ]}
      >
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
    });
    expect(screen.getByTestId('mock-chat')).toHaveAttribute(
      'data-genspark-route-agent-id',
      GENSPARK_REFERENCE_AGENT_ID,
    );
  });

  it('/agents?type=super_agent 로 진입해도 사이드바 긴 대화 제목 전체가 DOM에 있다', async () => {
    const longTitle = `${'사'.repeat(39)}끝표시`;
    localStorage.setItem(
      CHATGPT_CONVERSATIONS_STORAGE_KEY,
      JSON.stringify([
        { id: 'agents-super-long', title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
      ]),
    );
    try {
      render(
        <MemoryRouter
          initialEntries={[
            `${AGENTS_PATH}?${AGENTS_QUERY_PARAM_TYPE}=${GENSPARK_AGENTS_TYPE_SUPER_AGENT}`,
          ]}
        >
          <AppUnifiedRoutes />
        </MemoryRouter>,
      );
      await waitFor(() => {
        expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
      });
      expect(screen.getByTestId('mock-chat')).toHaveAttribute(
        'data-genspark-route-agent-id',
        GENSPARK_REFERENCE_AGENT_ID,
      );
      await assertSidebarLongChatTitle(longTitle);
    } finally {
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    }
  });

  it('/agents에 id와 type=super_agent가 함께 있으면 id가 ChatGPTInterface에 우선 전달된다', async () => {
    const routeId = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
    render(
      <MemoryRouter
        initialEntries={[
          `${AGENTS_PATH}?${AGENTS_QUERY_PARAM_TYPE}=${GENSPARK_AGENTS_TYPE_SUPER_AGENT}&${AGENTS_QUERY_PARAM_ID}=${routeId}`,
        ]}
      >
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
    });
    expect(screen.getByTestId('mock-chat')).toHaveAttribute('data-genspark-route-agent-id', routeId);
  });

  it('/agents에 id+type=super_agent로 진입해도 사이드바 긴 대화 제목 전체가 DOM에 있다', async () => {
    const routeId = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
    const longTitle = `${'자'.repeat(36)}끝표시`;
    localStorage.setItem(
      CHATGPT_CONVERSATIONS_STORAGE_KEY,
      JSON.stringify([
        { id: 'agents-combo-long', title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
      ]),
    );
    try {
      render(
        <MemoryRouter
          initialEntries={[
            `${AGENTS_PATH}?${AGENTS_QUERY_PARAM_TYPE}=${GENSPARK_AGENTS_TYPE_SUPER_AGENT}&${AGENTS_QUERY_PARAM_ID}=${routeId}`,
          ]}
        >
          <AppUnifiedRoutes />
        </MemoryRouter>,
      );
      await waitFor(() => {
        expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
      });
      expect(screen.getByTestId('mock-chat')).toHaveAttribute('data-genspark-route-agent-id', routeId);
      await assertSidebarLongChatTitle(longTitle);
    } finally {
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    }
  });

  it('사이드바 상단에 로고 옆 더보기 버튼이 있고, 클릭 시 메뉴가 열린다', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    const moreBtn = await screen.findByTestId('sidebar-brand-more-btn');
    expect(moreBtn).toHaveAttribute('aria-label', '더 보기');
    expect(moreBtn).toHaveAttribute('aria-haspopup', 'true');
    await userEvent.click(moreBtn);
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    expect(screen.getByRole('menuitem', { name: '일반 대화' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: '프로젝트' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '에이전트' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '목소리 생성' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '설정' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '분석' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '시스템 대시보드' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '도움말' })).toBeInTheDocument();
  });

  it('Q 검색에 입력 시 지우기 버튼이 보이고, 클릭하면 검색어가 비워진다', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    const searchInput = await screen.findByLabelText('대화 검색');
    expect(searchInput).toHaveAttribute('placeholder', '대화 검색');
    await userEvent.type(searchInput, 'LLM');
    expect(screen.getByLabelText('검색어 지우기')).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('검색어 지우기'));
    await waitFor(() => {
      expect(searchInput).toHaveValue('');
    });
    expect(screen.queryByLabelText('검색어 지우기')).not.toBeInTheDocument();
  });

  it('Q 검색 입력 중 Escape 키로 검색어가 지워진다', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    const searchInput = await screen.findByLabelText('대화 검색');
    await userEvent.type(searchInput, '테스트');
    expect(searchInput).toHaveValue('테스트');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(searchInput).toHaveValue('');
    });
  });

  it('사이드바 일반 대화 제목은 DOM에 전체 문자열을 유지한다 (말줄임은 CSS)', async () => {
    const longTitle = `${'가'.repeat(50)}끝표시`;
    localStorage.setItem(
      CHATGPT_CONVERSATIONS_STORAGE_KEY,
      JSON.stringify([
        { id: 'e2e-long-title', title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
      ]),
    );
    try {
      render(
        <MemoryRouter initialEntries={['/']}>
          <AppUnifiedRoutes />
        </MemoryRouter>,
      );
      await assertSidebarLongChatTitle(longTitle);
    } finally {
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    }
  });

  it('sidebar-chats-updated 이벤트가 오면 기존 이력에 새 대화가 누적 반영된다', async () => {
    const existingTitle = '기존 누적 이력 대화';
    const appendedTitle = '새로 누적된 대화';
    localStorage.setItem(
      CHATGPT_CONVERSATIONS_STORAGE_KEY,
      JSON.stringify([
        { id: 'conv-existing', title: existingTitle, updatedAt: '2026-01-01T00:00:00.000Z' },
      ]),
    );
    try {
      render(
        <MemoryRouter initialEntries={['/']}>
          <AppUnifiedRoutes />
        </MemoryRouter>,
      );

      expect(await screen.findByText(existingTitle)).toBeInTheDocument();
      expect(screen.queryByText(appendedTitle)).not.toBeInTheDocument();

      localStorage.setItem(
        CHATGPT_CONVERSATIONS_STORAGE_KEY,
        JSON.stringify([
          { id: 'conv-new', title: appendedTitle, updatedAt: '2026-02-01T00:00:00.000Z' },
          { id: 'conv-existing', title: existingTitle, updatedAt: '2026-01-01T00:00:00.000Z' },
        ]),
      );
      act(() => {
        window.dispatchEvent(new CustomEvent(SIDEBAR_CHATS_UPDATED_EVENT));
      });

      await waitFor(() => {
        expect(screen.getByText(existingTitle)).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText(appendedTitle)).toBeInTheDocument();
      });
    } finally {
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    }
  });

  it('깨진 대화 저장값이어도 렌더 후 sidebar-chats-updated로 정상 목록을 복구한다', async () => {
    const recoveredTitle = '복구된 대화 이력';
    localStorage.setItem(CHATGPT_CONVERSATIONS_STORAGE_KEY, '{invalid-json');
    try {
      render(
        <MemoryRouter initialEntries={['/']}>
          <AppUnifiedRoutes />
        </MemoryRouter>,
      );
      expect(await screen.findByLabelText('대화 검색')).toBeInTheDocument();
      expect(screen.queryByText(recoveredTitle)).not.toBeInTheDocument();

      localStorage.setItem(
        CHATGPT_CONVERSATIONS_STORAGE_KEY,
        JSON.stringify([
          { id: 'conv-recovered', title: recoveredTitle, updatedAt: '2026-03-01T00:00:00.000Z' },
        ]),
      );
      act(() => {
        window.dispatchEvent(new CustomEvent(SIDEBAR_CHATS_UPDATED_EVENT));
      });

      await waitFor(() => {
        expect(screen.getByText(recoveredTitle)).toBeInTheDocument();
      });
    } finally {
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    }
  });

  it('사이드바 검색 입력창에 placeholder와 Escape 안내 툴팁이 있다', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    const searchInput = await screen.findByLabelText('대화 검색');
    expect(searchInput).toHaveAttribute('placeholder', '대화 검색');
    expect(searchInput).toHaveAttribute('title', '대화 검색 (Escape로 지우기)');
  });

  it('사이드바 접기 버튼이 동작하고 접힘 상태를 저장한다', async () => {
    localStorage.removeItem('sidebarCollapsed');
    try {
      render(
        <MemoryRouter initialEntries={['/']}>
          <AppUnifiedRoutes />
        </MemoryRouter>
      );
      const collapseBtn = await screen.findByRole('button', { name: '사이드바 접기' });
      await userEvent.click(collapseBtn);
      expect(localStorage.getItem('sidebarCollapsed')).toBe('true');
      const expandBtn = await screen.findByRole('button', { name: '사이드바 펼치기' });
      await userEvent.click(expandBtn);
      expect(localStorage.getItem('sidebarCollapsed')).toBe('false');
    } finally {
      localStorage.removeItem('sidebarCollapsed');
    }
  });

  it('REACT_APP_UI_PROJECTS_ENABLED=true 이면 더보기 메뉴에 프로젝트가 있다', async () => {
    await withProcessEnvAsync({ REACT_APP_UI_PROJECTS_LEGACY: 'true', REACT_APP_UI_PROJECTS_ENABLED: 'true' }, async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <AppUnifiedRoutes />
        </MemoryRouter>
      );
      await userEvent.click(await screen.findByTestId('sidebar-brand-more-btn'));
      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: '프로젝트' })).toBeInTheDocument();
      });
    });
  });

  it('/backup 접근 시 백업 및 복구 뷰를 렌더한다', async () => {
    render(
      <MemoryRouter initialEntries={['/backup']}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('mock-backup-recovery')).toBeInTheDocument();
    });
    expect(screen.getByText('Backup')).toBeInTheDocument();
  });

  it(`${BILLING_PATH} 접근 시 결제 뷰를 렌더한다`, async () => {
    render(
      <MemoryRouter initialEntries={[BILLING_PATH]}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('billing-view')).toBeInTheDocument();
    });
    expect(screen.getByRole('main', { name: '결제' })).toBeInTheDocument();
  });

  it(`${SETTINGS_PATH} 접근 시 설정 뷰를 렌더한다`, async () => {
    render(
      <MemoryRouter initialEntries={[SETTINGS_PATH]}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('settings-view')).toBeInTheDocument();
    });
    expect(screen.getByRole('main', { name: '설정' })).toBeInTheDocument();
  });

  it(`${INTEGRATIONS_PATH} 접근 시 연동 뷰를 렌더한다`, async () => {
    render(
      <MemoryRouter initialEntries={[INTEGRATIONS_PATH]}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('integrations-view')).toBeInTheDocument();
    });
    expect(screen.getByRole('main', { name: '연동' })).toBeInTheDocument();
  });

  it(`${DOCS_PATH} 접근 시 문서 뷰를 렌더한다`, async () => {
    render(
      <MemoryRouter initialEntries={[DOCS_PATH]}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('docs-view')).toBeInTheDocument();
    });
    expect(screen.getByRole('main', { name: '문서' })).toBeInTheDocument();
  });

  it(`${TEMPLATES_PATH} 접근 시 템플릿 뷰를 렌더한다`, async () => {
    render(
      <MemoryRouter initialEntries={[TEMPLATES_PATH]}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('templates-view')).toBeInTheDocument();
    });
    expect(screen.getByRole('main', { name: '템플릿' })).toBeInTheDocument();
  });

  it(`${SEARCH_PATH} 접근 시 검색 뷰를 렌더한다`, async () => {
    render(
      <MemoryRouter initialEntries={[SEARCH_PATH]}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('search-view')).toBeInTheDocument();
    });
    expect(screen.getByRole('main', { name: '검색' })).toBeInTheDocument();
  });

  it(`${TEAM_PATH} 접근 시 팀 뷰를 렌더한다`, async () => {
    render(
      <MemoryRouter initialEntries={[TEAM_PATH]}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('team-view')).toBeInTheDocument();
    });
    expect(screen.getByRole('main', { name: '팀' })).toBeInTheDocument();
  });

  it(`${LEARN_PATH} 접근 시 학습 뷰를 렌더한다`, async () => {
    render(
      <MemoryRouter initialEntries={[LEARN_PATH]}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('learn-view')).toBeInTheDocument();
    });
    expect(screen.getByRole('main', { name: '학습' })).toBeInTheDocument();
  });

  it(`${ANALYTICS_PATH} 접근 시 분석 뷰를 렌더한다`, async () => {
    render(
      <MemoryRouter initialEntries={[ANALYTICS_PATH]}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('analytics-view')).toBeInTheDocument();
    });
    expect(screen.getByRole('main', { name: '분석' })).toBeInTheDocument();
  });

  it(`${AUTOMATION_PATH} 접근 시 자동화 뷰를 렌더한다`, async () => {
    render(
      <MemoryRouter initialEntries={[AUTOMATION_PATH]}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('automation-view')).toBeInTheDocument();
    });
    expect(screen.getByRole('main', { name: '자동화' })).toBeInTheDocument();
  });

  it(`${WORKSPACE_PATH} 접근 시 워크스페이스 뷰를 렌더한다`, async () => {
    render(
      <MemoryRouter initialEntries={[WORKSPACE_PATH]}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('workspace-view')).toBeInTheDocument();
    });
    expect(screen.getByRole('main', { name: '워크스페이스' })).toBeInTheDocument();
  });

  it(`${COMMUNITY_PATH} 접근 시 커뮤니티 뷰를 렌더한다`, async () => {
    render(
      <MemoryRouter initialEntries={[COMMUNITY_PATH]}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('community-view')).toBeInTheDocument();
    });
    expect(screen.getByRole('main', { name: '커뮤니티' })).toBeInTheDocument();
  });

  it(`${PIPELINE_TUNING_PATH} 접근 시 파이프라인 튜닝 뷰를 렌더한다`, async () => {
    render(
      <MemoryRouter initialEntries={[PIPELINE_TUNING_PATH]}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('pipeline-tuning-view')).toBeInTheDocument();
    });
    expect(screen.getByRole('main', { name: '파이프라인 튜닝' })).toBeInTheDocument();
  });

  it(`${CONVERSATION_GRAPH_PATH} 접근 시 대화 관계도 뷰를 렌더한다`, async () => {
    render(
      <MemoryRouter initialEntries={[CONVERSATION_GRAPH_PATH]}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.CONVERSATION_GRAPH_VIEW)).toBeInTheDocument();
    });
  });

  it(`${DEV_STATUS_PATH} 접근 시 개발 상태 뷰를 렌더한다`, async () => {
    render(
      <MemoryRouter initialEntries={[DEV_STATUS_PATH]}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('dev-status-view')).toBeInTheDocument();
    });
    expect(screen.getByRole('main', { name: '개발 상태' })).toBeInTheDocument();
  });

  it.each(
    [
      [BACKUP_PATH, 'mock-backup-recovery', '백'],
      [BILLING_PATH, 'billing-view', '결'],
      [SETTINGS_PATH, 'settings-view', '설'],
      [INTEGRATIONS_PATH, 'integrations-view', '연'],
      [DOCS_PATH, 'docs-view', '문'],
      [TEMPLATES_PATH, 'templates-view', '템'],
      [SEARCH_PATH, 'search-view', '검'],
      [TEAM_PATH, 'team-view', '팀'],
      [LEARN_PATH, 'learn-view', '학'],
      [ANALYTICS_PATH, 'analytics-view', '분'],
      [AUTOMATION_PATH, 'automation-view', '자'],
      [WORKSPACE_PATH, 'workspace-view', '워'],
      [COMMUNITY_PATH, 'community-view', '커'],
      [CONVERSATION_GRAPH_PATH, TEST_IDS.CONVERSATION_GRAPH_VIEW, '관'],
      [PIPELINE_TUNING_PATH, 'pipeline-tuning-view', '파'],
      [DEV_STATUS_PATH, 'dev-status-view', '개'],
      [VOICE_GENERATION_PATH, 'mock-voice-generation', '성'],
      ['/ultimate', 'mock-ultimate-chat', '얼'],
      ['/integrated', 'mock-integrated-master', '합'],
      ['/dashboard', 'mock-integrated-dashboard', '보'],
    ] as const,
  )(
    '%s 접근 시에도 사이드바 긴 대화 제목 전체가 DOM에 있다',
    async (path, readyTestId, prefix) => {
      const longTitle = `${prefix}${'·'.repeat(36)}끝표시`;
      localStorage.setItem(
        CHATGPT_CONVERSATIONS_STORAGE_KEY,
        JSON.stringify([
          { id: `shell-long-${readyTestId}`, title: longTitle, updatedAt: '2099-01-01T00:00:00.000Z' },
        ]),
      );
      try {
        render(
          <MemoryRouter initialEntries={[path]}>
            <AppUnifiedRoutes />
          </MemoryRouter>,
        );
        await waitFor(() => {
          expect(screen.getByTestId(readyTestId)).toBeInTheDocument();
        });
        await assertSidebarLongChatTitle(longTitle);
      } finally {
        localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
      }
    },
  );

  it('/ultimate 접근 시 Ultimate 인터페이스를 렌더한다', async () => {
    render(
      <MemoryRouter initialEntries={['/ultimate']}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('mock-ultimate-chat')).toBeInTheDocument();
    });
  });

  it('/integrated 접근 시 통합 마스터 인터페이스를 렌더한다', async () => {
    render(
      <MemoryRouter initialEntries={['/integrated']}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('mock-integrated-master')).toBeInTheDocument();
    });
  });

  it('/dashboard 접근 시 시스템 대시보드를 렌더한다', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('mock-integrated-dashboard')).toBeInTheDocument();
    });
  });
});
