/**
 * @jest-environment jsdom
 */
/**
 * AppUnified 통합 레이아웃 테스트
 * - 사이드바·스킵 링크·검색 입력
 * - 404 라우트 (MemoryRouter로 /unknown 접근)
 *
 * `frontend/tsconfig.json`이 `*.test.tsx`를 제외해도, `@jest/globals`의 `expect`를 쓰면 jest-dom 매처와
 * 전역 `jest.mock` 타입이 어긋난다. 여기서는 `/// <reference types="jest" />`로 전역 API·`jest` 값을 쓴다.
 */
/// <reference types="jest" />
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppUnifiedRoutes } from './AppUnified';
import {
  AGENTS_PATH,
  AGENTS_QUERY_PARAM_ID,
  AGENTS_QUERY_PARAM_TYPE,
  GENSPARK_AGENTS_TYPE_SUPER_AGENT,
  NOT_FOUND_PAGE_HEADING,
} from './config/routes';
import { GENSPARK_REFERENCE_AGENT_ID } from './services/gensparkReferenceAgentPreset';
import { setupCommonMocks } from './test-utils/testHelpers';

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
jest.mock('./views/GensparkAgentsHubView', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement('div', { 'data-testid': 'mock-genspark-agents-hub' }, 'AgentsHub'),
}));
jest.mock('./components/BackupRecoveryManager', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement('div', { 'data-testid': 'mock-backup-recovery' }, 'Backup'),
}));

beforeAll(() => {
  setupCommonMocks();
  Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
});

describe('AppUnified', () => {
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
        const mobileTitle = document.querySelector('.brainwave-mobile-title');
        expect(mobileTitle).toBeTruthy();
        expect(mobileTitle).toHaveTextContent(NOT_FOUND_PAGE_HEADING);
      });
    } finally {
      window.innerWidth = prevW;
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

  it('루트(/)는 기본 젠스파이크 모드에서 에이전트 허브로 리다이렉트된다', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppUnifiedRoutes />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('mock-genspark-agents-hub')).toBeInTheDocument();
    });
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

  it('REACT_APP_UI_PROJECTS_ENABLED=true 일 때 /projects 는 프로젝트 페이지를 렌더한다', async () => {
    const prev = process.env.REACT_APP_UI_PROJECTS_ENABLED;
    process.env.REACT_APP_UI_PROJECTS_ENABLED = 'true';
    try {
      render(
        <MemoryRouter initialEntries={['/projects']}>
          <AppUnifiedRoutes />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByTestId('mock-projects')).toBeInTheDocument();
      });
      expect(screen.getByText('Projects')).toBeInTheDocument();
    } finally {
      process.env.REACT_APP_UI_PROJECTS_ENABLED = prev;
    }
  });

  it('REACT_APP_UI_PROJECTS_ENABLED=true 일 때 /projects/:id 는 대화 인터페이스를 렌더한다', async () => {
    const prev = process.env.REACT_APP_UI_PROJECTS_ENABLED;
    process.env.REACT_APP_UI_PROJECTS_ENABLED = 'true';
    try {
      render(
        <MemoryRouter initialEntries={['/projects/proj-123']}>
          <AppUnifiedRoutes />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByTestId('mock-chat')).toBeInTheDocument();
      });
    } finally {
      process.env.REACT_APP_UI_PROJECTS_ENABLED = prev;
    }
  });

  it('/voice-generation 접근 시 목소리 생성 뷰를 렌더한다', async () => {
    render(
      <MemoryRouter initialEntries={['/voice-generation']}>
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

  it('/agents?type=super_agent 접근 시 대화 인터페이스를 렌더한다 (Genspark Super Agent)', async () => {
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
    expect(screen.getByRole('menuitem', { name: '목소리 생성' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '에이전트' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '설정' })).toBeInTheDocument();
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

  it('REACT_APP_UI_PROJECTS_ENABLED=true 이면 더보기 메뉴에 프로젝트가 있다', async () => {
    const prev = process.env.REACT_APP_UI_PROJECTS_ENABLED;
    process.env.REACT_APP_UI_PROJECTS_ENABLED = 'true';
    try {
      render(
        <MemoryRouter initialEntries={['/']}>
          <AppUnifiedRoutes />
        </MemoryRouter>
      );
      await userEvent.click(await screen.findByTestId('sidebar-brand-more-btn'));
      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: '프로젝트' })).toBeInTheDocument();
      });
    } finally {
      process.env.REACT_APP_UI_PROJECTS_ENABLED = prev;
    }
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
});
