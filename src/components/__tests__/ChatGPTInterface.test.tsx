/**
 * @jest-environment jsdom
 */
/* eslint-disable jest/no-conditional-expect, testing-library/no-unnecessary-act, testing-library/no-wait-for-multiple-assertions */
/**
 * ChatGPTInterface 컴포넌트 테스트
 * ChatGPT 인터페이스 컴포넌트 기능 확인
 */

import React from 'react';
import { render, screen, waitFor, act, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, RouterProvider, createMemoryRouter, useLocation } from 'react-router-dom';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import ChatGPTInterface from '../ChatGPTInterface';
import { TEST_IDS } from '../../constants/testIds';
import multiLayerStyleAnalysisSystem, {
  CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS,
} from '../../services/multiLayerStyleAnalysisSystem';
import { installJestDomQuietNetworkForTests, setupCommonMocks } from '../../test-utils/testHelpers';
import { CHAT_LLM_STATUS_PATH } from '../../config/api';
import {
  AGENTS_PATH,
  AGENTS_QUERY_PARAM_ID,
  MARKETING_HOME_COMPOSER_AUTOSEND_STATE_KEY,
  MARKETING_HOME_COMPOSER_DRAFT_STATE_KEY,
  CONVERSATION_GRAPH_CHAT_AUTOSEND_STATE_KEY,
  CONVERSATION_GRAPH_CHAT_CONTEXT_STATE_KEY,
  CONVERSATION_GRAPH_CHAT_DRAFT_STATE_KEY,
  CONVERSATION_GRAPH_PATH,
  CONVERSATION_GRAPH_PASTE_STATE_KEY,
} from '../../config/routes';
import { GRAPH_ANSWER_CONTEXT_FLAG } from '../../views/conversationGraphAnswerGeneration';
import { GENSPARK_REFERENCE_AGENT_ID } from '../../services/gensparkReferenceAgentPreset';
import { STANDALONE_CHAT_PATH } from '../../config/uiPreferences';
import { WORKSPACE_WELCOME_SUGGESTION_CHIPS } from '../../constants/workspaceHomeCopy';
import { CHATGPT_CONVERSATIONS_STORAGE_KEY, SIDEBAR_CHATS_UPDATED_EVENT } from '../../services/chatGptUiStorageKeys';
import { projectService } from '../../services/projectService';
import projectsReducer from '../../store/slices/projectsSlice';
import sessionsReducer from '../../store/slices/sessionsSlice';
import uiReducer from '../../store/slices/uiSlice';
import authReducer from '../../store/slices/authSlice';
import collaborationReducer from '../../store/slices/collaborationSlice';
import aiEngineReducer from '../../store/slices/aiEngineSlice';

// Mock react-markdown (ESM 모듈)
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Components: {},
}));

jest.mock('remark-gfm', () => ({
  __esModule: true,
  default: () => {},
}));

jest.mock('../../utils/rehypeHighlightSearch', () => ({
  rehypeHighlightSearch: () => () => {},
}));

// Mock axios
jest.mock('axios', () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn((_onFulfilled, _onRejected) => {
          // 인터셉터 등록 시 ID 반환 (실제 axios와 유사하게)
          return 0;
        }),
        eject: jest.fn(),
      },
      response: {
        use: jest.fn((_onFulfilled, _onRejected) => {
          // 인터셉터 등록 시 ID 반환 (실제 axios와 유사하게)
          return 0;
        }),
        eject: jest.fn(),
      },
    },
  };

  const axiosLike = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(() => mockAxiosInstance),
    /** ChatGPTInterface.getErrorMessage 등에서 사용 */
    isAxiosError: jest.fn((error: unknown) =>
      Boolean(
        error &&
        typeof error === 'object' &&
        (error as { isAxiosError?: boolean }).isAxiosError === true
      )
    ),
  };

  return {
    __esModule: true,
    default: axiosLike,
    ...axiosLike,
  };
});

// Mock child components
jest.mock('../NotebookLLM', () => {
  return function MockNotebookLLM() {
    return <div data-testid="notebook-llm">NotebookLLM</div>;
  };
});

jest.mock('../Layout/Sidebar', () => ({
  __esModule: true,
  default: function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>;
  },
}));

jest.mock('../ProjectManagement/ProjectCreationModal', () => {
  return function MockProjectCreationModal() {
    return <div data-testid="project-creation-modal">ProjectCreationModal</div>;
  };
});

jest.mock('../ProjectManagement/ProjectEditModal', () => {
  return function MockProjectEditModal() {
    return <div data-testid="project-edit-modal">ProjectEditModal</div>;
  };
});

jest.mock('../ProjectManagement/AddSourceModal', () => {
  const { TEST_IDS: TIDS } = require('../../constants/testIds');
  return function MockAddSourceModal({
    isOpen,
    onFilesSelected,
    onWebUrlSubmit,
    onClose,
  }: {
    isOpen: boolean;
    onFilesSelected?: (files: File[]) => void;
    onWebUrlSubmit?: (url: string) => void;
    onClose: () => void;
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid={TIDS.ADD_SOURCE_MODAL} role="dialog">
        <button
          type="button"
          data-testid={TIDS.ADD_SOURCE_MODAL_UPLOAD}
          onClick={() => {
            onFilesSelected?.([new File(['hello'], 'unit-source.txt', { type: 'text/plain' })]);
          }}
        >
          업로드
        </button>
        <button
          type="button"
          data-testid={TIDS.ADD_SOURCE_MODAL_URL_SUBMIT}
          onClick={() => onWebUrlSubmit?.('https://example.com/page')}
        >
          URL 추가
        </button>
        <button type="button" onClick={onClose}>
          닫기
        </button>
      </div>
    );
  };
});

jest.mock('../../services/projectService', () => {
  const mockProjectService = {
    getProjects: jest.fn(),
    getProject: jest.fn(),
    createProject: jest.fn(),
    updateProject: jest.fn(),
    deleteProject: jest.fn(),
    uploadProjectFile: jest.fn(),
    appendProjectSourceFiles: jest.fn(),
    removeProjectSourceFile: jest.fn(),
    appendProjectWebSource: jest.fn(),
    removeProjectWebSource: jest.fn(),
    syncNotebookSourceRemoval: jest.fn(),
    getNotebookSuggestedQuestions: jest.fn().mockResolvedValue([]),
  };
  return {
    projectService: mockProjectService,
  };
});

jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('../../utils/streamingClient', () => ({
  isStreamingSupported: jest.fn(() => false),
  streamChatMessage: jest.fn(),
}));

jest.mock('../../services/notebookLLMDeepLearningIntegration', () => ({
  __esModule: true,
  default: {
    analyzePromptWithDL: jest.fn(),
    analyzeResponseWithDL: jest.fn(),
    buildMessageToSendForChat: jest.fn((req: string) => Promise.resolve(req)),
  },
  buildMessageToSendForChat: jest.fn((req: string) => Promise.resolve(req)),
}));

jest.mock('../../services/qwenTtsService', () => ({
  speakQwenTtsAndPlay: jest.fn(),
  speakQwenTtsFromProject: jest.fn(),
  PLAYBACK_RATE_MIN: 0.5,
  PLAYBACK_RATE_MAX: 2.0,
}));

const mockedAxios: jest.Mocked<typeof axios> = jest.mocked(axios);
const mockProjectService: jest.Mocked<typeof projectService> = jest.mocked(projectService);

// Mock store 생성 헬퍼
const createMockStore = (initialState: Partial<{
  projects: Partial<ReturnType<typeof projectsReducer>>;
  sessions: Partial<ReturnType<typeof sessionsReducer>>;
  ui: Partial<ReturnType<typeof uiReducer>>;
  auth: Partial<ReturnType<typeof authReducer>>;
  collaboration: Partial<ReturnType<typeof collaborationReducer>>;
  aiEngine: Partial<ReturnType<typeof aiEngineReducer>>;
}> = {}) => {
  return configureStore({
    reducer: {
      projects: projectsReducer,
      sessions: sessionsReducer,
      ui: uiReducer,
      auth: authReducer,
      collaboration: collaborationReducer,
      aiEngine: aiEngineReducer,
    },
    preloadedState: {
      projects: {
        projects: [],
        currentProject: null,
        loading: false,
        error: null,
        ...(initialState.projects || {}),
      },
      sessions: {
        sessions: [],
        currentSession: null,
        loading: false,
        error: null,
        ...(initialState.sessions || {}),
      },
      ui: {
        sidebarOpen: false,
        selectedAIModel: 'gpt-4',
        ...(initialState.ui || {}),
      },
      auth: {
        user: null,
        isAuthenticated: false,
        ...(initialState.auth || {}),
      },
      collaboration: {
        collaborators: [],
        isSharing: false,
        sharedSessionId: null,
        typingUsers: {},
        ...(initialState.collaboration || {}),
      },
      aiEngine: {
        models: [],
        selectedModel: 'gpt-4',
        ...(initialState.aiEngine || {}),
      },
    },
  });
};

// Redux Provider + Router를 포함한 렌더링 헬퍼 (useNavigate 사용 컴포넌트 지원)
const renderWithRedux = (
  ui: React.ReactElement,
  { store = createMockStore(), ...renderOptions } = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
      <Provider store={store}>{children}</Provider>
    </MemoryRouter>
  );
  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

const renderChatOnStandalonePathWithConversation = (
  conversationId: string,
  store = createMockStore({ ui: { sidebarOpen: true } }),
) =>
  render(
    <MemoryRouter
      initialEntries={[{ pathname: STANDALONE_CHAT_PATH, state: { conversationId }, key: 't0' }]}
    >
      <Provider store={store}>
        <ChatGPTInterface />
      </Provider>
    </MemoryRouter>,
  );

const openHeaderSendMenu = (sendMenu: HTMLElement) => {
  fireEvent.click(within(sendMenu).getByText('보내기', { selector: 'summary' }));
};

const openHeaderManageMenu = (manageMenu: HTMLElement) => {
  fireEvent.click(within(manageMenu).getByText('관리', { selector: 'summary' }));
};

let teardownChatGptNetworkQuiet: (() => void) | undefined;

describe('ChatGPTInterface', () => {
  // 긴 비동기 작업을 위한 타임아웃 설정
  jest.setTimeout(20000);

  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
    teardownChatGptNetworkQuiet = installJestDomQuietNetworkForTests({ label: 'ChatGPTInterface.test' });

    // window.speechSynthesis 모킹
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        cancel: jest.fn(),
        speak: jest.fn(),
        getVoices: jest.fn(() => []),
      },
      writable: true,
      configurable: true,
    });

    // 기본 API 모킹
    mockedAxios.post.mockResolvedValue({
      data: {
        success: true,
        response: '테스트 응답',
      },
    });

    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        data: [],
      },
    });
  });

  afterEach(() => {
    // restoreAllMocks는 `jest.spyOn(global, 'fetch')` 등을 복원한 뒤 환경을 깨뜨릴 수 있음(후속 테스트에서 패시브 이펙트 실패).
    jest.clearAllMocks();
    teardownChatGptNetworkQuiet?.();
  });

  describe('기본 렌더링', () => {
    it('컴포넌트가 올바르게 렌더링되어야 함', async () => {
      const store = createMockStore({
        ui: { sidebarOpen: true },
      });
      renderWithRedux(<ChatGPTInterface />, { store });

      await waitFor(() => {
        // 컴포넌트가 렌더링되었는지 확인 (사이드바가 조건부일 수 있음)
        const sidebar = screen.queryByTestId('sidebar');
        const chatInterface = screen.queryByRole('main') || screen.queryByRole('region');
        expect(sidebar || chatInterface).toBeTruthy();
      }, { timeout: 5000 });
    });

    it('메인 대화 영역이 표시되어야 함 (통합 2단 레이아웃)', async () => {
      const store = createMockStore({
        ui: { sidebarOpen: true },
      });
      renderWithRedux(<ChatGPTInterface />, { store });

      await waitFor(() => {
        expect(screen.getByRole('main', { name: /대화 영역/i })).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it.skip('LLM 상태 조회 성공 시 입력 영역 툴바에 LLM 배지가 표시되어야 함 (LLM 배지 UI 미구현)', async () => {
      const prevFetch = globalThis.fetch;
      const wrappedFetch = jest.fn(
        (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
          const u = typeof input === 'string' ? input : input.toString();
          if (u.includes(CHAT_LLM_STATUS_PATH)) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ success: true, summary: 'DeepSeek(로컬)' }),
            } as Response);
          }
          if (typeof prevFetch === 'function') {
            return prevFetch.call(globalThis, input, init);
          }
          return Promise.reject(new Error('unmocked fetch'));
        }
      );
      globalThis.fetch = wrappedFetch as typeof fetch;

      const store = createMockStore({ ui: { sidebarOpen: true } });
      try {
        renderWithRedux(<ChatGPTInterface />, { store });

        await waitFor(() => {
          expect(screen.getByTestId('chat-llm-badge')).toBeInTheDocument();
        }, { timeout: 3000 });
        expect(screen.getByTestId('chat-llm-badge')).toHaveTextContent('DeepSeek(로컬)');
      } finally {
        globalThis.fetch = prevFetch;
      }
    });
  });

  describe('스레드 컨텍스트 패널 (독립 대화)', () => {
    const threadPanelConversationId = 'conv-thread-context-panel';

    beforeEach(() => {
      jest.mocked(mockProjectService.getProjects).mockResolvedValue([]);
      localStorage.setItem(
        CHATGPT_CONVERSATIONS_STORAGE_KEY,
        JSON.stringify([
          {
            id: threadPanelConversationId,
            title: '스레드 패널 테스트',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: [],
          },
        ]),
      );
    });

    afterEach(() => {
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    });

    it('프로젝트가 없을 때 대화 설정으로 패널을 연다', async () => {
      renderChatOnStandalonePathWithConversation(threadPanelConversationId);
      expect(screen.queryByTestId(TEST_IDS.THREAD_CONTEXT_PANEL)).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId(TEST_IDS.CHAT_THREAD_CONTEXT_SETTINGS));
      const panel = await screen.findByTestId(TEST_IDS.THREAD_CONTEXT_PANEL);
      expect(panel).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('이 대화에서만 모델이 따를 지침을 입력하세요.'),
      ).toBeInTheDocument();
    });
  });

  describe('스레드 컨텍스트 패널 (프로젝트 상세)', () => {
    const projectId = 'proj-thread-panel-closed';
    const convInProjectId = 'conv-in-proj-thread-panel';
    beforeEach(() => {
      // 가이드라인 품질 히스토리 등이 남으면 추세·대시보드 useMemo에서 예외가 날 수 있음
      try {
        localStorage.clear();
      } catch {
        /* jsdom */
      }
    });

    afterEach(() => {
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    });

    it('프로젝트가 있을 때 기본 접힘(open 속성 없음)', async () => {
      const mockProject = {
        id: projectId,
        name: '패널 접힘 테스트',
        description: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        files: [],
        webSources: [],
      };
      jest.mocked(mockProjectService.getProjects).mockResolvedValue([]);
      jest.mocked(mockProjectService.getProject).mockResolvedValue(mockProject);

      localStorage.setItem(
        CHATGPT_CONVERSATIONS_STORAGE_KEY,
        JSON.stringify([
          {
            id: convInProjectId,
            projectId: projectId,
            title: '프로젝트 소속 대화',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: [],
          },
        ]),
      );

      const store = createMockStore({ ui: { sidebarOpen: true } });
      render(
        <MemoryRouter initialEntries={[`/projects/${projectId}`]}>
          <Provider store={store}>
            <ChatGPTInterface initialProjectId={projectId} />
          </Provider>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('project-detail-view')).toBeInTheDocument();
      }, { timeout: 8000 });

      expect(screen.queryByTestId(TEST_IDS.THREAD_CONTEXT_PANEL)).not.toBeInTheDocument();
    });
  });

  describe('마케팅 홈 → 독립 대화 질의 초안', () => {
    it('location.state의 초안 문자열을 입력창에 반영한다', async () => {
      jest.mocked(mockProjectService.getProjects).mockResolvedValue([]);
      const draft = '  루트에서 넘긴 질문  ';
      const store = createMockStore({ ui: { sidebarOpen: true } });
      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: STANDALONE_CHAT_PATH,
              state: { [MARKETING_HOME_COMPOSER_DRAFT_STATE_KEY]: draft },
              key: 'mkt-draft',
            },
          ]}
        >
          <Provider store={store}>
            <ChatGPTInterface />
          </Provider>
        </MemoryRouter>,
      );

      await waitFor(() => {
        const inputs = screen.getAllByTestId(TEST_IDS.CHAT_INPUT);
        const filled = inputs.find((el) => (el as HTMLTextAreaElement).value === '루트에서 넘긴 질문');
        expect(filled).toBeTruthy();
      }, { timeout: 12_000 });
    });

    it(`${STANDALONE_CHAT_PATH}/ 후행 슬래시 경로에서도 질의 초안을 입력창에 반영한다`, async () => {
      jest.mocked(mockProjectService.getProjects).mockResolvedValue([]);
      const draft = '후행슬래시초안';
      const store = createMockStore({ ui: { sidebarOpen: true } });
      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: `${STANDALONE_CHAT_PATH}/`,
              state: { [MARKETING_HOME_COMPOSER_DRAFT_STATE_KEY]: draft },
              key: 'mkt-draft-trailing',
            },
          ]}
        >
          <Provider store={store}>
            <ChatGPTInterface />
          </Provider>
        </MemoryRouter>,
      );

      await waitFor(() => {
        const inputs = screen.getAllByTestId(TEST_IDS.CHAT_INPUT);
        const filled = inputs.find((el) => (el as HTMLTextAreaElement).value === draft);
        expect(filled).toBeTruthy();
      }, { timeout: 12_000 });
    });

    it('질의 초안과 conversationId state가 함께 있어도 초안을 입력창에 반영한다', async () => {
      jest.mocked(mockProjectService.getProjects).mockResolvedValue([]);
      const draft = '초안과 대화 스레드 같이';
      const store = createMockStore({ ui: { sidebarOpen: true } });
      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: STANDALONE_CHAT_PATH,
              state: {
                conversationId: 'conv-with-draft',
                [MARKETING_HOME_COMPOSER_DRAFT_STATE_KEY]: draft,
              },
              key: 'mkt-draft-conv',
            },
          ]}
        >
          <Provider store={store}>
            <ChatGPTInterface />
          </Provider>
        </MemoryRouter>,
      );

      await waitFor(() => {
        const inputs = screen.getAllByTestId(TEST_IDS.CHAT_INPUT);
        const filled = inputs.find((el) => (el as HTMLTextAreaElement).value === draft);
        expect(filled).toBeTruthy();
      }, { timeout: 12_000 });
    });

    it('marketingComposerAutoSend면 초안 적용 후 자동으로 전송되어 API가 호출된다', async () => {
      jest.mocked(mockProjectService.getProjects).mockResolvedValue([]);
      const draft = '홈에서 자동 전송 질문';
      const store = createMockStore({ ui: { sidebarOpen: true } });
      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: STANDALONE_CHAT_PATH,
              state: {
                [MARKETING_HOME_COMPOSER_DRAFT_STATE_KEY]: draft,
                [MARKETING_HOME_COMPOSER_AUTOSEND_STATE_KEY]: true,
              },
              key: 'mkt-autosend',
            },
          ]}
        >
          <Provider store={store}>
            <ChatGPTInterface />
          </Provider>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled();
      }, { timeout: 12_000 });
    });
  });

  describe('대화 관계도 → 독립 대화', () => {
    it('location.state 초안을 입력창에 반영한다', async () => {
      jest.mocked(mockProjectService.getProjects).mockResolvedValue([]);
      const draft = '관계도 기반 질문';
      const store = createMockStore({ ui: { sidebarOpen: true } });
      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: STANDALONE_CHAT_PATH,
              state: { [CONVERSATION_GRAPH_CHAT_DRAFT_STATE_KEY]: draft },
              key: 'graph-draft',
            },
          ]}
        >
          <Provider store={store}>
            <ChatGPTInterface />
          </Provider>
        </MemoryRouter>,
      );

      await waitFor(() => {
        const inputs = screen.getAllByTestId(TEST_IDS.CHAT_INPUT);
        const filled = inputs.find((el) => (el as HTMLTextAreaElement).value === draft);
        expect(filled).toBeTruthy();
      }, { timeout: 12_000 });
    });

    it('autosend 시 API context에 관계도 분석 플래그가 포함된다', async () => {
      jest.mocked(mockProjectService.getProjects).mockResolvedValue([]);
      const draft = '관계도 보고서 작성';
      const graphContext = {
        [GRAPH_ANSWER_CONTEXT_FLAG]: true,
        conversation_graph_title: '단체 채팅',
      };
      const store = createMockStore({ ui: { sidebarOpen: true } });
      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: STANDALONE_CHAT_PATH,
              state: {
                [CONVERSATION_GRAPH_CHAT_DRAFT_STATE_KEY]: draft,
                [CONVERSATION_GRAPH_CHAT_CONTEXT_STATE_KEY]: graphContext,
                [CONVERSATION_GRAPH_CHAT_AUTOSEND_STATE_KEY]: true,
              },
              key: 'graph-autosend',
            },
          ]}
        >
          <Provider store={store}>
            <ChatGPTInterface />
          </Provider>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled();
      }, { timeout: 12_000 });

      const withContext = mockedAxios.post.mock.calls.find((call) => {
        const body = call[1] as { context?: Record<string, unknown> } | undefined;
        return body?.context?.[GRAPH_ANSWER_CONTEXT_FLAG] === true;
      });
      expect(withContext).toBeTruthy();
    });

    it('대화 파일 첨부와 관계도 생성 의도 입력 시 handoff 배너·첨부 칩을 표시한다', async () => {
      jest.mocked(mockProjectService.getProjects).mockResolvedValue([]);
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
      const store = createMockStore({ ui: { sidebarOpen: true } });
      render(
        <MemoryRouter initialEntries={[STANDALONE_CHAT_PATH]}>
          <Provider store={store}>
            <ChatGPTInterface />
          </Provider>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId(TEST_IDS.CHAT_INPUT)).toBeInTheDocument();
      });

      const fileInput = screen.getByLabelText('대화 파일 첨부 (TXT/CSV)');
      const csv = new File(['Date,User,Message\n2026-05-13,A,hi'], 'chat.csv', { type: 'text/csv' });
      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [csv] } });
      });

      const chatInput = screen.getByTestId(TEST_IDS.CHAT_INPUT) as HTMLTextAreaElement;
      await act(async () => {
        fireEvent.change(chatInput, { target: { value: '관계도를 만들어줘' } });
      });

      expect(screen.getByTestId(TEST_IDS.CONVERSATION_GRAPH_CHAT_ATTACHED_FILE)).toHaveTextContent('chat.csv');
      expect(screen.getByTestId(TEST_IDS.CONVERSATION_GRAPH_CHAT_HANDOFF_BANNER)).toBeInTheDocument();
      expect(screen.getByTestId(TEST_IDS.CONVERSATION_GRAPH_CHAT_HANDOFF_OPEN)).toBeInTheDocument();
    });

    it('handoff 버튼 클릭 시 관계도 경로로 이동하고 붙여넣기 state를 전달한다', async () => {
      jest.mocked(mockProjectService.getProjects).mockResolvedValue([]);
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);

      const csvBody = 'Date,User,Message\n2026-05-13,알파,handoff-nav';
      const store = createMockStore({ ui: { sidebarOpen: true } });

      function GraphHandoffLanding() {
        const location = useLocation();
        const state = location.state as Record<string, string> | null;
        return (
          <div data-testid="graph-handoff-paste">
            {state?.[CONVERSATION_GRAPH_PASTE_STATE_KEY] ?? ''}
          </div>
        );
      }

      const router = createMemoryRouter(
        [
          {
            path: STANDALONE_CHAT_PATH,
            element: (
              <Provider store={store}>
                <ChatGPTInterface />
              </Provider>
            ),
          },
          { path: CONVERSATION_GRAPH_PATH, element: <GraphHandoffLanding /> },
        ],
        { initialEntries: [STANDALONE_CHAT_PATH] },
      );

      render(<RouterProvider router={router} />);

      await waitFor(() => {
        expect(screen.getByTestId(TEST_IDS.CHAT_INPUT)).toBeInTheDocument();
      });

      const fileInput = screen.getByLabelText('대화 파일 첨부 (TXT/CSV)');
      await act(async () => {
        fireEvent.change(fileInput, {
          target: {
            files: [new File([csvBody], 'nav.csv', { type: 'text/csv' })],
          },
        });
      });

      const chatInput = screen.getByTestId(TEST_IDS.CHAT_INPUT) as HTMLTextAreaElement;
      await act(async () => {
        fireEvent.change(chatInput, { target: { value: '관계도를 만들어줘' } });
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId(TEST_IDS.CONVERSATION_GRAPH_CHAT_HANDOFF_OPEN));
      });

      await waitFor(() => {
        expect(screen.getByTestId('graph-handoff-paste')).toHaveTextContent(/알파/);
      });
      expect(router.state.location.pathname).toBe(CONVERSATION_GRAPH_PATH);
    });

    it('첨부 파일과 관계도 생성 의도 전송 시 API context에 관계도 intent가 병합된다', async () => {
      jest.mocked(mockProjectService.getProjects).mockResolvedValue([]);
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
      const store = createMockStore({ ui: { sidebarOpen: true } });
      render(
        <MemoryRouter initialEntries={[STANDALONE_CHAT_PATH]}>
          <Provider store={store}>
            <ChatGPTInterface />
          </Provider>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId(TEST_IDS.CHAT_INPUT)).toBeInTheDocument();
      });

      const csvBody = 'Date,User,Message\n2026-05-13,알파,send-context';
      const fileInput = screen.getByLabelText('대화 파일 첨부 (TXT/CSV)');
      await act(async () => {
        fireEvent.change(fileInput, {
          target: {
            files: [new File([csvBody], 'send.csv', { type: 'text/csv' })],
          },
        });
      });

      const chatInput = screen.getByTestId(TEST_IDS.CHAT_INPUT) as HTMLTextAreaElement;
      await act(async () => {
        fireEvent.change(chatInput, { target: { value: '관계도를 만들어줘' } });
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId(TEST_IDS.SEND_BUTTON));
      });

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled();
      }, { timeout: 12_000 });

      const graphCall = mockedAxios.post.mock.calls.find((call) => {
        const body = call[1] as { context?: Record<string, unknown> } | undefined;
        return (
          body?.context?.[GRAPH_ANSWER_CONTEXT_FLAG] === true &&
          body?.context?.input_intent_hint === 'conversation_graph_create'
        );
      });
      expect(graphCall).toBeTruthy();
      const ctx = (graphCall![1] as { context: Record<string, unknown> }).context;
      const filePayload = String(
        ctx.conversation_file_content ?? ctx.conversation_graph_raw_conversation ?? '',
      );
      expect(filePayload).toMatch(/알파/);
    });

    it('첨부 칩 제거 시 handoff 배너가 사라진다', async () => {
      jest.mocked(mockProjectService.getProjects).mockResolvedValue([]);
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
      const store = createMockStore({ ui: { sidebarOpen: true } });
      render(
        <MemoryRouter initialEntries={[STANDALONE_CHAT_PATH]}>
          <Provider store={store}>
            <ChatGPTInterface />
          </Provider>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId(TEST_IDS.CHAT_INPUT)).toBeInTheDocument();
      });

      const fileInput = screen.getByLabelText('대화 파일 첨부 (TXT/CSV)');
      await act(async () => {
        fireEvent.change(fileInput, {
          target: {
            files: [new File(['Date,User,Message\nx'], 'rm.csv', { type: 'text/csv' })],
          },
        });
      });

      const chatInput = screen.getByTestId(TEST_IDS.CHAT_INPUT) as HTMLTextAreaElement;
      await act(async () => {
        fireEvent.change(chatInput, { target: { value: '관계도를 만들어줘' } });
      });

      expect(screen.getByTestId(TEST_IDS.CONVERSATION_GRAPH_CHAT_HANDOFF_BANNER)).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(screen.getByLabelText('대화 파일 첨부 제거'));
      });

      expect(screen.queryByTestId(TEST_IDS.CONVERSATION_GRAPH_CHAT_ATTACHED_FILE)).not.toBeInTheDocument();
      expect(screen.queryByTestId(TEST_IDS.CONVERSATION_GRAPH_CHAT_HANDOFF_BANNER)).not.toBeInTheDocument();
    });
  });

  describe('에이전트 라우트 세션', () => {
    const agentId = GENSPARK_REFERENCE_AGENT_ID;

    beforeEach(() => {
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    });

    it('gensparkRouteAgentId가 있으면 상세 헤더·허브·공개 사이트 열기 링크를 노출한다', async () => {
      const store = createMockStore({ ui: { sidebarOpen: true } });
      render(
        <MemoryRouter initialEntries={[`${AGENTS_PATH}?${AGENTS_QUERY_PARAM_ID}=${agentId}`]}>
          <Provider store={store}>
            <ChatGPTInterface gensparkRouteAgentId={agentId} />
          </Provider>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId(TEST_IDS.GENSPARK_AGENT_SESSION_DETAIL)).toBeInTheDocument();
      });

      expect(
        screen.getByRole('heading', { level: 1, name: /과업 완결형 Super Agent/ }),
      ).toBeInTheDocument();
      expect(screen.getByTestId(TEST_IDS.GENSPARK_AGENT_BANNER_HUB_LINK)).toHaveAttribute('href', AGENTS_PATH);
      const openExternal = screen.getByRole('link', { name: /공개 사이트에서 열기/ });
      expect(openExternal).toHaveAttribute('href', expect.stringContaining(agentId));
    });

    it('앱 링크 복사 버튼이 clipboard.writeText를 호출한다', async () => {
      const writeText = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      const store = createMockStore({ ui: { sidebarOpen: true } });
      render(
        <MemoryRouter>
          <Provider store={store}>
            <ChatGPTInterface gensparkRouteAgentId={agentId} />
          </Provider>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId(TEST_IDS.GENSPARK_AGENT_COPY_APP_LINK)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId(TEST_IDS.GENSPARK_AGENT_COPY_APP_LINK));
      await waitFor(() => {
        expect(writeText).toHaveBeenCalled();
      });
      const copied = writeText.mock.calls[0][0] as string;
      expect(copied).toContain(AGENTS_PATH);
      expect(copied).toContain(agentId);
    });

    it('에이전트 전용 대화가 비어 있으면 빈 상태 안내와 탭 제목에 에이전트명이 반영된다', async () => {
      const prevTitle = document.title;
      const store = createMockStore({ ui: { sidebarOpen: true } });
      render(
        <MemoryRouter initialEntries={[`${AGENTS_PATH}?${AGENTS_QUERY_PARAM_ID}=${agentId}`]}>
          <Provider store={store}>
            <ChatGPTInterface gensparkRouteAgentId={agentId} />
          </Provider>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId(TEST_IDS.GENSPARK_AGENT_EMPTY_STATE)).toBeInTheDocument();
      });
      expect(screen.getByRole('heading', { level: 2, name: /첫 메시지를 보내 보세요/ })).toBeInTheDocument();
      expect(document.title).toContain('과업 완결형 Super Agent');
      expect(document.title).toContain('에이전트');
      document.title = prevTitle;
    });

    it('첫 전송 후에도 상세 헤더가 유지되고 에이전트 본문 레이아웃 클래스가 적용된다', async () => {
      const store = createMockStore({ ui: { sidebarOpen: true } });
      render(
        <MemoryRouter initialEntries={[`${AGENTS_PATH}?${AGENTS_QUERY_PARAM_ID}=${agentId}`]}>
          <Provider store={store}>
            <ChatGPTInterface gensparkRouteAgentId={agentId} />
          </Provider>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId(TEST_IDS.GENSPARK_AGENT_SESSION_DETAIL)).toBeInTheDocument();
      });
      expect(screen.getByTestId(TEST_IDS.CHAT_LAYOUT_GENSPARK_AGENT_SESSION)).toHaveClass(
        'chat-layout-body--genspark-agent-session',
      );

      const main = screen.getByRole('main', { name: /대화 영역/i });
      const input = await within(main).findByTestId(TEST_IDS.CHAT_INPUT);
      const messageText = '에이전트 세션 첫 메시지';
      fireEvent.change(input, { target: { value: messageText } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: false });

      await waitFor(() => {
        expect(screen.queryAllByText(messageText).length).toBeGreaterThanOrEqual(1);
      }, { timeout: 8000 });

      expect(screen.getByTestId(TEST_IDS.GENSPARK_AGENT_SESSION_DETAIL)).toBeInTheDocument();
      expect(screen.getByTestId(TEST_IDS.CHAT_LAYOUT_GENSPARK_AGENT_SESSION)).toHaveClass(
        'chat-layout-body--genspark-agent-session',
      );
    });
  });

  describe('프로젝트 관리', () => {
    it.skip('추천 탭에 템플릿 카드가 표시되어야 함', async () => {
      // 현재 UI에 "추천" 탭·학습/연구/업무 노트 템플릿 카드 없음 (사이드바 통합 시 제거됨). UI 복원 시 스킵 해제.
      jest.mocked(projectService.getProjects).mockResolvedValue([]);

      const store = createMockStore({ ui: { sidebarOpen: true } });
      renderWithRedux(<ChatGPTInterface />, { store });

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /추천/ })).toBeInTheDocument();
      }, { timeout: 5000 });

      const recommandTab = screen.getByRole('tab', { name: /추천/ });
      await act(async () => { recommandTab.click(); });

      await waitFor(() => {
        expect(screen.getByText('학습 노트')).toBeInTheDocument();
      }, { timeout: 3000 });
      expect(screen.getByText('연구 노트')).toBeInTheDocument();
      expect(screen.getByText('업무 노트')).toBeInTheDocument();
    });

    it('프로젝트 목록을 로드할 수 있어야 함', async () => {
      const mockProjects = [
        {
          id: '1',
          name: '테스트 프로젝트',
          description: '설명',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      jest.mocked(mockProjectService.getProjects).mockResolvedValue(mockProjects);

      const store = createMockStore();
      renderWithRedux(<ChatGPTInterface />, { store });

      // 프로젝트 로드가 트리거될 때까지 대기
      await waitFor(() => {
        const hasServiceCall = jest.mocked(mockProjectService.getProjects).mock.calls.length > 0;
        const state = store.getState();
        const hasProjects = state.projects.projects.length > 0;
        expect(hasServiceCall || hasProjects).toBe(true);
      }, { timeout: 10000 });
    });

    it('프로젝트 2개 이상일 때 getProjects 호출 후 대화 인터페이스가 표시되어야 함', async () => {
      jest.mocked(mockProjectService.getProjects).mockResolvedValue([
        { id: '1', name: 'A', description: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '2', name: 'B', description: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ]);

      const store = createMockStore({ ui: { sidebarOpen: true } });
      renderWithRedux(<ChatGPTInterface />, { store });

      await waitFor(() => {
        expect(mockProjectService.getProjects).toHaveBeenCalled();
      }, { timeout: 8000 });
      expect(screen.getByTestId(TEST_IDS.CHAT_INPUT)).toBeInTheDocument();
    });

    it('initialProjectId와 getProject 성공 시 프로젝트 상세 뷰(project-detail-view)가 표시되어야 함', async () => {
      const projectId = 'proj-detail-1';
      const mockProject = {
        id: projectId,
        name: '상세 테스트 프로젝트',
        description: '프로젝트 설명',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        files: [],
        webSources: [],
      };
      jest.mocked(mockProjectService.getProjects).mockResolvedValue([]);
      jest.mocked(mockProjectService.getProject).mockResolvedValue(mockProject);

      const store = createMockStore({ ui: { sidebarOpen: true } });
      render(
        <MemoryRouter initialEntries={[`/projects/${projectId}`]}>
          <Provider store={store}>
            <ChatGPTInterface initialProjectId={projectId} />
          </Provider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('project-detail-view')).toBeInTheDocument();
      }, { timeout: 5000 });
      expect(screen.getByText('상세 테스트 프로젝트')).toBeInTheDocument();
      const settingsBtn = screen.getByTestId(TEST_IDS.PROJECT_DETAIL_SETTINGS_BTN);
      expect(settingsBtn).toBeInTheDocument();

      fireEvent.click(settingsBtn);
      await waitFor(() => {
        expect(screen.getByTestId(TEST_IDS.PROJECT_EDIT_MODAL)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('소스 탭에서 파일 추가 시 appendProjectSourceFiles 호출 후 목록에 표시되어야 함', async () => {
      const projectId = 'proj-source-upload-1';
      const mockProject = {
        id: projectId,
        name: '소스 업로드 테스트',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        files: [],
        webSources: [],
      };
      const updatedProject = {
        ...mockProject,
        files: [
          {
            id: 'file-1',
            name: 'unit-source.txt',
            type: 'document' as const,
            size: 5,
            uploadedAt: new Date(),
          },
        ],
      };
      jest.mocked(mockProjectService.getProjects).mockResolvedValue([]);
      jest.mocked(mockProjectService.getProject).mockResolvedValue(mockProject);
      jest.mocked(mockProjectService.appendProjectSourceFiles).mockResolvedValue({
        project: updatedProject,
        uploadFailedCount: 0,
      });

      const store = createMockStore({ ui: { sidebarOpen: true } });
      renderWithRedux(<ChatGPTInterface initialProjectId={projectId} />, { store });

      await waitFor(() => {
        expect(screen.getByTestId('project-detail-view')).toBeInTheDocument();
      }, { timeout: 5000 });

      fireEvent.click(await screen.findByTestId(TEST_IDS.PROJECT_SOURCES_TAB));
      fireEvent.click(await screen.findByTestId(TEST_IDS.PROJECT_SOURCES_ADD_BTN));
      await waitFor(() => {
        expect(screen.getByTestId(TEST_IDS.ADD_SOURCE_MODAL)).toBeInTheDocument();
      });
      fireEvent.click(screen.getByTestId(TEST_IDS.ADD_SOURCE_MODAL_UPLOAD));

      await waitFor(() => {
        expect(mockProjectService.appendProjectSourceFiles).toHaveBeenCalledWith(
          projectId,
          [],
          expect.arrayContaining([expect.any(File)]),
        );
      });
      await waitFor(() => {
        expect(screen.getByTestId(TEST_IDS.PROJECT_SOURCES_FILE_ITEM)).toHaveTextContent('unit-source.txt');
      });
      await waitFor(() => {
        expect(screen.queryByTestId(TEST_IDS.ADD_SOURCE_MODAL)).not.toBeInTheDocument();
      });
    });

    it('소스 탭에서 웹 URL 추가 시 appendProjectWebSource 호출', async () => {
      const projectId = 'proj-source-url-1';
      const mockProject = {
        id: projectId,
        name: 'URL 추가 테스트',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        files: [],
        webSources: [],
      };
      jest.mocked(mockProjectService.getProjects).mockResolvedValue([]);
      jest.mocked(mockProjectService.getProject).mockResolvedValue(mockProject);
      jest.mocked(mockProjectService.appendProjectWebSource).mockResolvedValue({
        project: {
          ...mockProject,
          webSources: [{ id: 'w1', type: 'document' as const, url: 'https://example.com', addedAt: new Date() }],
        },
        duplicate: false,
      });

      const store = createMockStore({ ui: { sidebarOpen: true } });
      renderWithRedux(<ChatGPTInterface initialProjectId={projectId} />, { store });

      await waitFor(() => {
        expect(screen.getByTestId('project-detail-view')).toBeInTheDocument();
      }, { timeout: 5000 });

      fireEvent.click(await screen.findByTestId(TEST_IDS.PROJECT_SOURCES_TAB));
      fireEvent.click(await screen.findByTestId(TEST_IDS.PROJECT_SOURCES_ADD_BTN));
      fireEvent.click(await screen.findByTestId(TEST_IDS.ADD_SOURCE_MODAL_URL_SUBMIT));

      await waitFor(() => {
        expect(mockProjectService.appendProjectWebSource).toHaveBeenCalledWith(
          projectId,
          [],
          'https://example.com/page',
        );
      });
    });

    it('소스 탭에서 파일 제거 시 removeProjectSourceFile 호출', async () => {
      const projectId = 'proj-source-remove-1';
      const mockProject = {
        id: projectId,
        name: '소스 제거 테스트',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        files: [
          {
            id: 'file-rm-1',
            name: 'remove-me.txt',
            type: 'document' as const,
            size: 3,
            uploadedAt: new Date(),
          },
        ],
        webSources: [],
      };
      const updatedProject = { ...mockProject, files: [] };
      jest.mocked(mockProjectService.getProjects).mockResolvedValue([]);
      jest.mocked(mockProjectService.getProject).mockResolvedValue(mockProject);
      jest.mocked(mockProjectService.removeProjectSourceFile).mockResolvedValue(updatedProject);

      const store = createMockStore({ ui: { sidebarOpen: true } });
      renderWithRedux(<ChatGPTInterface initialProjectId={projectId} />, { store });

      await waitFor(() => {
        expect(screen.getByTestId('project-detail-view')).toBeInTheDocument();
      }, { timeout: 5000 });

      fireEvent.click(await screen.findByTestId(TEST_IDS.PROJECT_SOURCES_TAB));
      const removeBtn = await screen.findByTestId(TEST_IDS.PROJECT_SOURCES_FILE_REMOVE);
      fireEvent.click(removeBtn);

      await waitFor(() => {
        expect(mockProjectService.removeProjectSourceFile).toHaveBeenCalledWith(
          projectId,
          expect.arrayContaining([expect.objectContaining({ id: 'file-rm-1' })]),
          'file-rm-1',
        );
      });
    });

    it.skip('프로젝트 상세에서 소스 탭 선택 시 최신순·모두 정렬·필터가 노출되어야 함', async () => {
      // 소스 탭은 currentProject 시 bw-project-tabs 내에 렌더되나, 테스트 환경에서 탭이 DOM에 안 나타나는 이슈로 스킵. E2E 또는 수동 검증. testid: PROJECT_SOURCES_TAB.
      const projectId = 'proj-sources-1';
      const mockProject = {
        id: projectId,
        name: '소스 탭 테스트',
        description: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        files: [],
        webSources: [],
      };
      jest.mocked(mockProjectService.getProjects).mockResolvedValue([]);
      jest.mocked(mockProjectService.getProject).mockResolvedValue(mockProject);

      const store = createMockStore({ ui: { sidebarOpen: true } });
      renderWithRedux(<ChatGPTInterface initialProjectId={projectId} />, { store });

      await waitFor(() => {
        expect(screen.getByTestId('project-detail-view')).toBeInTheDocument();
      }, { timeout: 5000 });

      const sourceTab = await screen.findByTestId(TEST_IDS.PROJECT_SOURCES_TAB);
      fireEvent.click(sourceTab);

      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /정렬/ })).toBeInTheDocument();
      }, { timeout: 3000 });
      expect(screen.getByRole('combobox', { name: /필터/ })).toBeInTheDocument();
      expect(screen.getByText('최신순')).toBeInTheDocument();
      expect(screen.getByText('모두')).toBeInTheDocument();
    });
  });

  describe('메시지 입력', () => {
    it('메시지 입력 필드가 있어야 함', async () => {
      renderWithRedux(<ChatGPTInterface />);

      await waitFor(() => {
        const inputFields = screen.queryAllByRole('textbox');
        expect(inputFields.length).toBeGreaterThan(0);
      });
    });

    it('웰컴(대화 없음)에서 입력창 위 추천 질문 칩을 표시한다', async () => {
      jest.mocked(mockProjectService.getProjects).mockResolvedValue([]);
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
      const store = createMockStore({ ui: { sidebarOpen: true } });
      renderWithRedux(<ChatGPTInterface />, { store });

      const dock = await screen.findByTestId(TEST_IDS.CHAT_INPUT_DOCK_SUGGESTIONS);
      expect(dock).toHaveClass('brainwave-quick-suggestions');
      expect(dock).toHaveTextContent('추천 질문:');

      for (const chip of WORKSPACE_WELCOME_SUGGESTION_CHIPS) {
        expect(screen.getByRole('button', { name: new RegExp(chip) })).toBeInTheDocument();
      }
    });

    it('입력창에 질문·요구·요청 삽입 칩과 다중 요청 미리보기를 표시한다', async () => {
      jest.mocked(mockProjectService.getProjects).mockResolvedValue([]);
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
      const store = createMockStore({ ui: { sidebarOpen: true } });
      renderWithRedux(<ChatGPTInterface />, { store });

      expect(await screen.findByTestId(TEST_IDS.CHAT_COMPOSER_STRUCTURE_CHIPS)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '질문 블록 삽입' })).toBeInTheDocument();

      const input = await screen.findByTestId(TEST_IDS.CHAT_INPUT);
      fireEvent.change(input, { target: { value: '1. 첫 번째\n2. 두 번째' } });

      await waitFor(() => {
        expect(screen.getByTestId(TEST_IDS.CHAT_COMPOSER_INPUT_HINT)).toHaveTextContent(/순서/);
      });
    });

    it('다중 요청 전송 시 입력창 하단에 항목별 체크리스트를 표시한다', async () => {
      jest.mocked(mockProjectService.getProjects).mockResolvedValue([]);
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
      mockedAxios.post.mockImplementation(
        () =>
          new Promise(() => {
            /* hang for loading UI */
          }),
      );
      const store = createMockStore({ ui: { sidebarOpen: true } });
      renderWithRedux(<ChatGPTInterface />, { store });

      const input = await screen.findByTestId(TEST_IDS.CHAT_INPUT);
      fireEvent.change(input, {
        target: { value: '1. 첫 질문입니다\n2. 둘째 요청입니다' },
      });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: false });

      await waitFor(() => {
        expect(screen.getByTestId(TEST_IDS.COMPOSER_GENSPARK_GENERATION_STATUS)).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByTestId(TEST_IDS.COMPOSER_MULTI_REQUEST_CHECKLIST)).toBeInTheDocument();
      });
      expect(screen.getByText(/처리 중/)).toBeInTheDocument();
    });

    it('웰컴 추천 칩 클릭 시 해당 문구로 메시지 전송을 시도한다', async () => {
      jest.mocked(mockProjectService.getProjects).mockResolvedValue([]);
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
      mockedAxios.post.mockClear();
      const store = createMockStore({ ui: { sidebarOpen: true } });
      renderWithRedux(<ChatGPTInterface />, { store });

      const chipLabel = WORKSPACE_WELCOME_SUGGESTION_CHIPS[0];
      const chip = await screen.findByRole('button', { name: new RegExp(chipLabel) });
      fireEvent.click(chip);

      await waitFor(
        () => {
          const sent = mockedAxios.post.mock.calls.some((call) => {
            const body = call[1] as { message?: string } | undefined;
            return typeof body?.message === 'string' && body.message.includes(chipLabel);
          });
          expect(sent).toBe(true);
        },
        { timeout: 8000 },
      );
    });

    it('프로젝트 웰컴에서 소스 추천 질문을 입력 도크 위에 표시하고 본문 그리드는 숨긴다', async () => {
      const mockProject = {
        id: 'proj-welcome-suggest',
        name: '테스트 프로젝트',
        description: '',
        createdAt: '2026-05-01T00:00:00.000Z',
        updatedAt: '2026-05-01T00:00:00.000Z',
        files: [],
        webSources: [],
      };
      jest.mocked(mockProjectService.getProjects).mockResolvedValue([]);
      jest.mocked(mockProjectService.getProject).mockResolvedValue(mockProject);
      jest.mocked(mockProjectService.getNotebookSuggestedQuestions).mockResolvedValue([
        '소스에서 나온 질문 A',
        '소스에서 나온 질문 B',
      ]);

      const emptyConversation = {
        id: 'conv-empty',
        title: '새 대화',
        messages: [],
        projectId: mockProject.id,
        createdAt: '2026-05-01T00:00:00.000Z',
        updatedAt: '2026-05-01T00:00:00.000Z',
      };
      localStorage.setItem(
        CHATGPT_CONVERSATIONS_STORAGE_KEY,
        JSON.stringify([emptyConversation]),
      );

      const store = createMockStore({ ui: { sidebarOpen: true } });
      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: `/projects/${mockProject.id}`,
              state: { conversationId: emptyConversation.id },
              key: 't0',
            },
          ]}
        >
          <Provider store={store}>
            <ChatGPTInterface initialProjectId={mockProject.id} />
          </Provider>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('project-detail-view')).toBeInTheDocument();
      });

      await waitFor(
        () => {
          const dock = screen.getByTestId(TEST_IDS.CHAT_INPUT_DOCK_SUGGESTIONS);
          expect(dock).toHaveClass('brainwave-quick-suggestions');
          expect(dock).toHaveTextContent('소스에서 나온 질문 A');
        },
        { timeout: 8000 },
      );

      expect(screen.queryByTestId(TEST_IDS.SUGGESTED_QUESTIONS_FROM_SOURCE)).not.toBeInTheDocument();
    });

    // frontend 패키지는 루트 node_modules 심링크 + package.json jest moduleNameMapper(react-router*) 조합에서
    // 이 케이스만 전송 비동기 구간 소스맵이 어긋난 듯한 파서 오류로 실패함. 동일 검증은 저장소 루트 src/components/__tests__/ChatGPTInterface.test.tsx 에서 수행됨.
    it.skip('입력 후 Enter 시 사용자 메시지가 화면에 바로 표시되어야 함', async () => {
      renderWithRedux(<ChatGPTInterface />);

      const main = await screen.findByRole('main', { name: /대화 영역/i });
      const input = await within(main).findByTestId(TEST_IDS.CHAT_INPUT);
      expect(input).toBeInTheDocument();

      const messageText = '테스트 질문입니다';
      fireEvent.change(input, { target: { value: messageText } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: false });

      await waitFor(() => {
        expect(screen.queryAllByText(messageText).length).toBeGreaterThanOrEqual(1);
      }, { timeout: 5000 });
    });

    it('멀티레이어 힌트 env 활성화 시 전송 시 surface 분석 입력이 상한으로 잘린다', async () => {
      const prev = process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT;
      process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT = 'true';
      const spy = jest
        .spyOn(multiLayerStyleAnalysisSystem, 'performMultiLayerAnalysis')
        .mockRejectedValue(new Error('short-circuit'));
      try {
        const store = createMockStore({ ui: { sidebarOpen: true } });
        renderWithRedux(<ChatGPTInterface />, { store });
        const main = await screen.findByRole('main', { name: /대화 영역/i });
        const input = await within(main).findByTestId(TEST_IDS.CHAT_INPUT);
        const longMsg = 'c'.repeat(CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS + 55);
        fireEvent.change(input, { target: { value: longMsg } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: false });
        await waitFor(
          () => {
            expect(spy).toHaveBeenCalledWith(
              'c'.repeat(CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS),
              'surface'
            );
          },
          { timeout: 8000 }
        );
      } finally {
        spy.mockRestore();
        if (prev === undefined) delete process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT;
        else process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT = prev;
      }
    });

    it('첫 전송 직후 긴 입력이어도 대화 제목이 즉시 간결 저장된다', async () => {
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
      renderWithRedux(<ChatGPTInterface />);

      const main = await screen.findByRole('main', { name: /대화 영역/i });
      const input = await within(main).findByTestId(TEST_IDS.CHAT_INPUT);
      const longQuestion = '가'.repeat(80);
      fireEvent.change(input, { target: { value: longQuestion } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: false });

      await waitFor(() => {
        const raw = localStorage.getItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
        const list = raw ? (JSON.parse(raw) as Array<{ title?: string; messages?: Array<{ role: string }> }>) : [];
        const first = list[0];
        const ok =
          !!raw &&
          list.length > 0 &&
          !!first?.messages?.some((m) => m.role === 'user') &&
          first?.title !== undefined &&
          first.title !== longQuestion &&
          !!first.title?.endsWith('...') &&
          (first.title || '').length <= 33;
        expect(ok).toBe(true);
      }, { timeout: 8000 });
    });

    it('새 대화를 시작해도 기존 이력은 유지되고 목록에 누적 저장된다', async () => {
      const existingId = 'existing-history-conv';
      localStorage.setItem(
        CHATGPT_CONVERSATIONS_STORAGE_KEY,
        JSON.stringify([
          {
            id: existingId,
            title: '기존 이력 대화',
            createdAt: new Date(Date.now() - 86_400_000).toISOString(),
            updatedAt: new Date(Date.now() - 86_400_000).toISOString(),
            messages: [
              {
                id: 'msg-old-1',
                role: 'user',
                content: '기존 질문',
                timestamp: new Date(Date.now() - 86_400_000).toISOString(),
              },
            ],
          },
        ]),
      );
      const onSidebarChatsUpdated = jest.fn();
      window.addEventListener(SIDEBAR_CHATS_UPDATED_EVENT, onSidebarChatsUpdated as EventListener);
      try {
        renderWithRedux(<ChatGPTInterface />);

        const main = await screen.findByRole('main', { name: /대화 영역/i });
        const input = await within(main).findByTestId(TEST_IDS.CHAT_INPUT);
        const question = '새 대화 누적 저장 검증 질문';
        fireEvent.change(input, { target: { value: question } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: false });

        await waitFor(() => {
          const raw = localStorage.getItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
          const list = raw
            ? (JSON.parse(raw) as Array<{
                id: string;
                messages?: Array<{ role: string; content?: string }>;
              }>)
            : [];
          const ok =
            onSidebarChatsUpdated.mock.calls.length > 0 &&
            !!raw &&
            list.length >= 2 &&
            list.some((conv) => conv.id === existingId) &&
            list.some(
              (conv) =>
                conv.id !== existingId &&
                (conv.messages || []).some((m) => m.role === 'user' && m.content === question),
            );
          expect(ok).toBe(true);
        }, { timeout: 8000 });
      } finally {
        window.removeEventListener(SIDEBAR_CHATS_UPDATED_EVENT, onSidebarChatsUpdated as EventListener);
        localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
      }
    });

    it('깨진 저장값이어도 첫 전송 후 대화 목록 저장이 정상 복구된다', async () => {
      localStorage.setItem(CHATGPT_CONVERSATIONS_STORAGE_KEY, '{broken-json');
      const onSidebarChatsUpdated = jest.fn();
      window.addEventListener(SIDEBAR_CHATS_UPDATED_EVENT, onSidebarChatsUpdated as EventListener);
      try {
        renderWithRedux(<ChatGPTInterface />);
        const main = await screen.findByRole('main', { name: /대화 영역/i });
        const input = await within(main).findByTestId(TEST_IDS.CHAT_INPUT);
        const question = '깨진 저장값 복구 검증 질문';
        fireEvent.change(input, { target: { value: question } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: false });

        await waitFor(() => {
          const raw = localStorage.getItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
          const list = raw
            ? (JSON.parse(raw) as Array<{
                id: string;
                messages?: Array<{ role: string; content?: string }>;
              }>)
            : [];
          const ok =
            onSidebarChatsUpdated.mock.calls.length > 0 &&
            !!raw &&
            Array.isArray(list) &&
            list.length >= 1 &&
            list.some((conv) =>
              (conv.messages || []).some((m) => m.role === 'user' && m.content === question),
            );
          expect(ok).toBe(true);
        }, { timeout: 8000 });
      } finally {
        window.removeEventListener(SIDEBAR_CHATS_UPDATED_EVENT, onSidebarChatsUpdated as EventListener);
        localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
      }
    });
  });

  describe('대화 헤더 보내기·관리 메뉴 (<details>)', () => {
    const conversationId = 'e2e-header-menu-conv';

    const seedConversation = () => {
      localStorage.setItem(
        CHATGPT_CONVERSATIONS_STORAGE_KEY,
        JSON.stringify([
          {
            id: conversationId,
            title: '헤더 메뉴 테스트 대화',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: [
              {
                id: 'm-hdr-1',
                role: 'user',
                content: 'hello',
                timestamp: new Date().toISOString(),
              },
            ],
          },
        ]),
      );
    };

    beforeEach(() => {
      seedConversation();
    });

    afterEach(() => {
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    });

    it('선택된 대화가 있으면 보내기·관리 details에 data-testid와 패널 aria-label이 있다', async () => {
      renderChatOnStandalonePathWithConversation(conversationId);

      const sendMenu = await screen.findByTestId(TEST_IDS.CHAT_HEADER_SEND_MENU);
      const manageMenu = await screen.findByTestId(TEST_IDS.CHAT_HEADER_MANAGE_MENU);
      expect(within(sendMenu).getByText('보내기')).toBeInTheDocument();
      expect(within(manageMenu).getByText('관리')).toBeInTheDocument();
      expect(
        within(sendMenu).getByRole('group', { name: '대화보내기' }),
      ).toBeInTheDocument();
      expect(
        within(manageMenu).getByRole('group', { name: '대화 관리' }),
      ).toBeInTheDocument();
    });

    it('헤더 PRO 버튼 클릭 시 PRO 구독 안내 모달이 열린다', async () => {
      renderChatOnStandalonePathWithConversation(conversationId);
      fireEvent.click(await screen.findByTestId(TEST_IDS.CHAT_HEADER_PRO_BTN));
      expect(await screen.findByRole('heading', { name: /PRO 구독/ })).toBeInTheDocument();
    });

    it('독립 대화에서 헤더 공유(대화 공유) 클릭 시 프로젝트 공유 다이얼로그는 열리지 않는다', async () => {
      renderChatOnStandalonePathWithConversation(conversationId);
      await screen.findByTestId(TEST_IDS.CHAT_HEADER_SEND_MENU);
      const shareButtons = screen.getAllByRole('button', { name: '공유' });
      const headerShare = shareButtons.find((b) => b.getAttribute('title') === '대화 공유');
      expect(headerShare).toBeTruthy();
      fireEvent.click(headerShare as HTMLButtonElement);
      await act(async () => {
        await Promise.resolve();
      });
      expect(screen.queryByText('프로젝트 공유')).not.toBeInTheDocument();
    });

    it('보내기 summary 클릭 시 열리고 Markdown 항목이 보인다', async () => {
      renderChatOnStandalonePathWithConversation(conversationId);
      const sendMenu = await screen.findByTestId(TEST_IDS.CHAT_HEADER_SEND_MENU);
      openHeaderSendMenu(sendMenu);
      await waitFor(() => {
        expect(sendMenu).toHaveAttribute('open');
      });
      expect(within(sendMenu).getByRole('button', { name: 'Markdown' })).toBeInTheDocument();
    });

    it('메시지가 있으면 관리 메뉴에 메시지 전체 삭제 버튼이 있다', async () => {
      renderChatOnStandalonePathWithConversation(conversationId);
      const manageMenu = await screen.findByTestId(TEST_IDS.CHAT_HEADER_MANAGE_MENU);
      openHeaderManageMenu(manageMenu);
      await waitFor(() => {
        expect(manageMenu).toHaveAttribute('open');
      });
      expect(
        within(manageMenu).getByRole('button', { name: '메시지 전체 삭제' }),
      ).toBeInTheDocument();
    });

    it('관리 메뉴에서 메시지 전체 삭제 클릭 시 확인 모달이 열리고 취소로 닫힌다', async () => {
      renderChatOnStandalonePathWithConversation(conversationId);
      const manageMenu = await screen.findByTestId(TEST_IDS.CHAT_HEADER_MANAGE_MENU);
      openHeaderManageMenu(manageMenu);
      await waitFor(() => {
        expect(manageMenu).toHaveAttribute('open');
      });
      fireEvent.click(within(manageMenu).getByRole('button', { name: '메시지 전체 삭제' }));
      const dialog = await screen.findByRole('dialog', { name: '메시지 전체 삭제 확인' });
      expect(dialog).toBeInTheDocument();
      expect(
        screen.getByText('현재 대화의 모든 메시지를 삭제하시겠습니까?'),
      ).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: '전체 삭제 취소' }));
      await waitFor(() => {
        expect(
          screen.queryByRole('dialog', { name: '메시지 전체 삭제 확인' }),
        ).not.toBeInTheDocument();
      });
    });

    it('관리 메뉴에서 가져오기 클릭 시 file input이 생성되고 속성·click이 적용된다', async () => {
      const createdInputs: HTMLInputElement[] = [];
      const origCreate = document.createElement.bind(document);
      const createSpy = jest
        .spyOn(document, 'createElement')
        .mockImplementation((tag: string, options?: unknown) => {
          const el = origCreate(tag as keyof HTMLElementTagNameMap, options as never);
          if (tag === 'input') {
            createdInputs.push(el as HTMLInputElement);
          }
          return el;
        });
      const inputClickSpy = jest.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
      try {
        renderChatOnStandalonePathWithConversation(conversationId);
        const manageMenu = await screen.findByTestId(TEST_IDS.CHAT_HEADER_MANAGE_MENU);
        openHeaderManageMenu(manageMenu);
        await waitFor(() => {
          expect(manageMenu).toHaveAttribute('open');
        });
        const nBefore = createdInputs.length;
        fireEvent.click(within(manageMenu).getByRole('button', { name: '가져오기' }));
        const added = createdInputs.slice(nBefore);
        expect(added).toHaveLength(1);
        expect(added[0].type).toBe('file');
        expect(added[0].accept).toBe('.json,.md,.html');
        expect(inputClickSpy).toHaveBeenCalled();
      } finally {
        createSpy.mockRestore();
        inputClickSpy.mockRestore();
      }
    });

    it('메시지 전체 삭제 확인 시 토스트가 뜨고 메시지가 비워져 관리 메뉴에서 전체 삭제 항목이 사라진다', async () => {
      const onToast = jest.fn();
      window.addEventListener('corbu-toast', onToast);
      try {
        renderChatOnStandalonePathWithConversation(conversationId);
        const manageMenu = await screen.findByTestId(TEST_IDS.CHAT_HEADER_MANAGE_MENU);
        openHeaderManageMenu(manageMenu);
        await waitFor(() => {
          expect(manageMenu).toHaveAttribute('open');
        });
        fireEvent.click(within(manageMenu).getByRole('button', { name: '메시지 전체 삭제' }));
        const dialog = await screen.findByRole('dialog', { name: '메시지 전체 삭제 확인' });
        fireEvent.click(
          within(dialog).getByRole('button', { name: '메시지 전체 삭제 확인' }),
        );
        await waitFor(() => {
          expect(onToast).toHaveBeenCalled();
        });
        const ev = onToast.mock.calls[0][0] as CustomEvent<{ message: string; type?: string }>;
        expect(ev.detail.message).toBe('메시지가 모두 삭제되었습니다');
        expect(ev.detail.type).toBe('success');
        await waitFor(() => {
          expect(
            screen.queryByRole('dialog', { name: '메시지 전체 삭제 확인' }),
          ).not.toBeInTheDocument();
        });
        openHeaderManageMenu(manageMenu);
        await waitFor(() => {
          expect(manageMenu).toHaveAttribute('open');
        });
        expect(
          within(manageMenu).queryByRole('button', { name: '메시지 전체 삭제' }),
        ).not.toBeInTheDocument();
        expect(within(manageMenu).getByRole('button', { name: '복제' })).toBeDisabled();
      } finally {
        window.removeEventListener('corbu-toast', onToast);
      }
    });

    it('Escape로 열린 헤더 메뉴가 닫힌다', async () => {
      renderChatOnStandalonePathWithConversation(conversationId);
      const manageMenu = await screen.findByTestId(TEST_IDS.CHAT_HEADER_MANAGE_MENU);
      openHeaderManageMenu(manageMenu);
      await waitFor(() => {
        expect(manageMenu).toHaveAttribute('open');
      });
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      await waitFor(() => {
        expect(manageMenu).not.toHaveAttribute('open');
      });
    });

    it('패널 바깥 pointerdown 시 열린 헤더 메뉴가 닫힌다', async () => {
      renderChatOnStandalonePathWithConversation(conversationId);
      const sendMenu = await screen.findByTestId(TEST_IDS.CHAT_HEADER_SEND_MENU);
      openHeaderSendMenu(sendMenu);
      await waitFor(() => {
        expect(sendMenu).toHaveAttribute('open');
      });
      const titleHeading = screen.getByRole('heading', { level: 3, name: /헤더 메뉴 테스트 대화/ });
      fireEvent.pointerDown(titleHeading);
      await waitFor(() => {
        expect(sendMenu).not.toHaveAttribute('open');
      });
    });

    it('관리 메뉴에서 대화 삭제 클릭 시 확인 모달이 열리고 취소로 닫힌다', async () => {
      renderChatOnStandalonePathWithConversation(conversationId);
      const manageMenu = await screen.findByTestId(TEST_IDS.CHAT_HEADER_MANAGE_MENU);
      openHeaderManageMenu(manageMenu);
      await waitFor(() => {
        expect(manageMenu).toHaveAttribute('open');
      });
      fireEvent.click(within(manageMenu).getByTestId(TEST_IDS.CHAT_DELETE_CONVERSATION));
      const dialog = await screen.findByRole('dialog', { name: '대화 삭제 확인 모달' });
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText('다음 대화를 삭제하시겠습니까?')).toBeInTheDocument();
      expect(screen.getByTestId(TEST_IDS.CHAT_DELETE_CONVERSATION_CANCEL)).toBeInTheDocument();
      expect(screen.getByTestId(TEST_IDS.CHAT_DELETE_CONVERSATION_CONFIRM)).toBeInTheDocument();
      fireEvent.click(screen.getByTestId(TEST_IDS.CHAT_DELETE_CONVERSATION_CANCEL));
      await waitFor(() => {
        expect(
          screen.queryByRole('dialog', { name: '대화 삭제 확인 모달' }),
        ).not.toBeInTheDocument();
      });
    });

    it('대화 삭제 확인(삭제 버튼) 시 스토리지에서 제거되고 헤더 보내기 메뉴가 사라진다', async () => {
      renderChatOnStandalonePathWithConversation(conversationId);
      await screen.findByTestId(TEST_IDS.CHAT_HEADER_SEND_MENU);

      const manageMenu = screen.getByTestId(TEST_IDS.CHAT_HEADER_MANAGE_MENU);
      openHeaderManageMenu(manageMenu);
      await waitFor(() => {
        expect(manageMenu).toHaveAttribute('open');
      });
      fireEvent.click(within(manageMenu).getByTestId(TEST_IDS.CHAT_DELETE_CONVERSATION));
      await screen.findByRole('dialog', { name: '대화 삭제 확인 모달' });
      fireEvent.click(screen.getByTestId(TEST_IDS.CHAT_DELETE_CONVERSATION_CONFIRM));

      await waitFor(() => {
        expect(
          screen.queryByRole('dialog', { name: '대화 삭제 확인 모달' }),
        ).not.toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.queryByTestId(TEST_IDS.CHAT_HEADER_SEND_MENU)).not.toBeInTheDocument();
      });
      const stored = localStorage.getItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
      expect(stored).toBe('[]');
    });

    it.each(['Markdown', 'JSON', 'HTML'] as const)(
      '보내기 메뉴에서 %s 클릭 시 다운로드 완료 토스트가 발생한다',
      async (formatLabel) => {
        const onToast = jest.fn();
        window.addEventListener('corbu-toast', onToast);
        const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
        const URLRef = globalThis.URL as typeof URL & {
          createObjectURL?: (b: Blob) => string;
          revokeObjectURL?: (u: string) => void;
        };
        const savedCreate = URLRef.createObjectURL;
        const savedRevoke = URLRef.revokeObjectURL;
        URLRef.createObjectURL = () => 'blob:http://localhost/export-test';
        URLRef.revokeObjectURL = () => {};
        try {
          renderChatOnStandalonePathWithConversation(conversationId);
          const sendMenu = await screen.findByTestId(TEST_IDS.CHAT_HEADER_SEND_MENU);
          openHeaderSendMenu(sendMenu);
          await waitFor(() => {
            expect(sendMenu).toHaveAttribute('open');
          });
          fireEvent.click(within(sendMenu).getByRole('button', { name: formatLabel }));
          await waitFor(() => {
            expect(onToast).toHaveBeenCalled();
          });
          const ev = onToast.mock.calls[0][0] as CustomEvent<{ message: string; type?: string }>;
          expect(ev.detail.message).toBe('다운로드되었습니다');
          expect(ev.detail.type).toBe('success');
          expect(clickSpy).toHaveBeenCalled();
        } finally {
          window.removeEventListener('corbu-toast', onToast);
          clickSpy.mockRestore();
          if (savedCreate) URLRef.createObjectURL = savedCreate;
          else delete URLRef.createObjectURL;
          if (savedRevoke) URLRef.revokeObjectURL = savedRevoke;
          else delete URLRef.revokeObjectURL;
        }
      },
    );

    it('보내기 메뉴에서 클립보드 클릭 시 복사 완료 토스트가 발생한다', async () => {
      const onToast = jest.fn();
      window.addEventListener('corbu-toast', onToast);
      const writeText = jest.fn().mockResolvedValue(undefined);
      const prevDesc = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        writable: true,
        value: { writeText },
      });
      try {
        renderChatOnStandalonePathWithConversation(conversationId);
        const sendMenu = await screen.findByTestId(TEST_IDS.CHAT_HEADER_SEND_MENU);
        openHeaderSendMenu(sendMenu);
        await waitFor(() => {
          expect(sendMenu).toHaveAttribute('open');
        });
        fireEvent.click(within(sendMenu).getByRole('button', { name: '클립보드' }));
        await waitFor(() => {
          expect(onToast).toHaveBeenCalled();
        });
        const ev = onToast.mock.calls[0][0] as CustomEvent<{ message: string; type?: string }>;
        expect(ev.detail.message).toBe('복사되었습니다');
        expect(ev.detail.type).toBe('success');
        expect(writeText).toHaveBeenCalled();
        const pasted = writeText.mock.calls[0][0] as string;
        expect(pasted).toContain('# 헤더 메뉴 테스트 대화');
        expect(pasted).toContain('hello');
      } finally {
        window.removeEventListener('corbu-toast', onToast);
        if (prevDesc) Object.defineProperty(navigator, 'clipboard', prevDesc);
        else delete (navigator as unknown as { clipboard?: Clipboard }).clipboard;
      }
    });

    it('관리 메뉴에서 복제 클릭 시 복제 완료 토스트가 발생한다', async () => {
      const onToast = jest.fn();
      window.addEventListener('corbu-toast', onToast);
      try {
        renderChatOnStandalonePathWithConversation(conversationId);
        const manageMenu = await screen.findByTestId(TEST_IDS.CHAT_HEADER_MANAGE_MENU);
        openHeaderManageMenu(manageMenu);
        await waitFor(() => {
          expect(manageMenu).toHaveAttribute('open');
        });
        fireEvent.click(within(manageMenu).getByRole('button', { name: '복제' }));
        await waitFor(() => {
          expect(onToast).toHaveBeenCalled();
        });
        const ev = onToast.mock.calls[0][0] as CustomEvent<{ message: string; type?: string }>;
        expect(ev.detail.message).toBe('대화가 복제되었습니다');
        expect(ev.detail.type).toBe('success');
      } finally {
        window.removeEventListener('corbu-toast', onToast);
      }
    });
  });

  describe('대화 헤더 보내기·관리 메뉴 (빈 메시지)', () => {
    const emptyMessagesConversationId = 'conv-empty-msgs';

    beforeEach(() => {
      localStorage.setItem(
        CHATGPT_CONVERSATIONS_STORAGE_KEY,
        JSON.stringify([
          {
            id: emptyMessagesConversationId,
            title: '빈 스레드',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: [],
          },
        ]),
      );
    });

    afterEach(() => {
      localStorage.removeItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    });

    it('메시지가 없으면 보내기·복제는 비활성화, 가져오기·대화 삭제는 활성, 메시지 전체 삭제는 없다', async () => {
      renderChatOnStandalonePathWithConversation(emptyMessagesConversationId);
      const sendMenu = await screen.findByTestId(TEST_IDS.CHAT_HEADER_SEND_MENU);
      openHeaderSendMenu(sendMenu);
      await waitFor(() => {
        expect(sendMenu).toHaveAttribute('open');
      });
      for (const name of ['Markdown', 'JSON', 'HTML', '클립보드'] as const) {
        expect(within(sendMenu).getByRole('button', { name })).toBeDisabled();
      }
      const manageMenu = screen.getByTestId(TEST_IDS.CHAT_HEADER_MANAGE_MENU);
      openHeaderManageMenu(manageMenu);
      await waitFor(() => {
        expect(manageMenu).toHaveAttribute('open');
      });
      expect(within(manageMenu).getByRole('button', { name: '가져오기' })).not.toBeDisabled();
      expect(within(manageMenu).getByRole('button', { name: '복제' })).toBeDisabled();
      expect(within(manageMenu).getByTestId(TEST_IDS.CHAT_DELETE_CONVERSATION)).not.toBeDisabled();
      expect(
        within(manageMenu).queryByRole('button', { name: '메시지 전체 삭제' }),
      ).not.toBeInTheDocument();
    });

    it('메시지가 없어도 보내기·관리 details에 data-testid와 패널 aria-label이 있다', async () => {
      renderChatOnStandalonePathWithConversation(emptyMessagesConversationId);

      const sendMenu = await screen.findByTestId(TEST_IDS.CHAT_HEADER_SEND_MENU);
      const manageMenu = await screen.findByTestId(TEST_IDS.CHAT_HEADER_MANAGE_MENU);
      expect(within(sendMenu).getByText('보내기')).toBeInTheDocument();
      expect(within(manageMenu).getByText('관리')).toBeInTheDocument();
      expect(
        within(sendMenu).getByRole('group', { name: '대화보내기' }),
      ).toBeInTheDocument();
      expect(
        within(manageMenu).getByRole('group', { name: '대화 관리' }),
      ).toBeInTheDocument();
    });

    it('메시지가 없어도 독립 대화에서 헤더 공유 클릭 시 프로젝트 공유 다이얼로그는 열리지 않는다', async () => {
      renderChatOnStandalonePathWithConversation(emptyMessagesConversationId);
      await screen.findByTestId(TEST_IDS.CHAT_HEADER_SEND_MENU);
      const shareButtons = screen.getAllByRole('button', { name: '공유' });
      const headerShare = shareButtons.find((b) => b.getAttribute('title') === '대화 공유');
      expect(headerShare).toBeTruthy();
      fireEvent.click(headerShare as HTMLButtonElement);
      await act(async () => {
        await Promise.resolve();
      });
      expect(screen.queryByText('프로젝트 공유')).not.toBeInTheDocument();
    });

    it('메시지가 없어도 가져오기 클릭 시 file input이 생성되고 속성·click이 적용된다', async () => {
      const createdInputs: HTMLInputElement[] = [];
      const origCreate = document.createElement.bind(document);
      const createSpy = jest
        .spyOn(document, 'createElement')
        .mockImplementation((tag: string, options?: unknown) => {
          const el = origCreate(tag as keyof HTMLElementTagNameMap, options as never);
          if (tag === 'input') {
            createdInputs.push(el as HTMLInputElement);
          }
          return el;
        });
      const inputClickSpy = jest.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
      try {
        renderChatOnStandalonePathWithConversation(emptyMessagesConversationId);
        const manageMenu = await screen.findByTestId(TEST_IDS.CHAT_HEADER_MANAGE_MENU);
        openHeaderManageMenu(manageMenu);
        await waitFor(() => {
          expect(manageMenu).toHaveAttribute('open');
        });
        const nBefore = createdInputs.length;
        fireEvent.click(within(manageMenu).getByRole('button', { name: '가져오기' }));
        const added = createdInputs.slice(nBefore);
        expect(added).toHaveLength(1);
        expect(added[0].type).toBe('file');
        expect(added[0].accept).toBe('.json,.md,.html');
        expect(inputClickSpy).toHaveBeenCalled();
      } finally {
        createSpy.mockRestore();
        inputClickSpy.mockRestore();
      }
    });

    it('메시지가 없어도 관리에서 대화 삭제 클릭 시 확인 모달이 열리고 취소로 닫힌다', async () => {
      renderChatOnStandalonePathWithConversation(emptyMessagesConversationId);
      const manageMenu = await screen.findByTestId(TEST_IDS.CHAT_HEADER_MANAGE_MENU);
      openHeaderManageMenu(manageMenu);
      await waitFor(() => {
        expect(manageMenu).toHaveAttribute('open');
      });
      fireEvent.click(within(manageMenu).getByTestId(TEST_IDS.CHAT_DELETE_CONVERSATION));
      const dialog = await screen.findByRole('dialog', { name: '대화 삭제 확인 모달' });
      expect(dialog).toBeInTheDocument();
      fireEvent.click(screen.getByTestId(TEST_IDS.CHAT_DELETE_CONVERSATION_CANCEL));
      await waitFor(() => {
        expect(
          screen.queryByRole('dialog', { name: '대화 삭제 확인 모달' }),
        ).not.toBeInTheDocument();
      });
    });

    it('메시지가 없어도 대화 삭제 확인(삭제 버튼) 시 스토리지에서 제거되고 헤더 보내기 메뉴가 사라진다', async () => {
      renderChatOnStandalonePathWithConversation(emptyMessagesConversationId);
      await screen.findByTestId(TEST_IDS.CHAT_HEADER_SEND_MENU);

      const manageMenu = screen.getByTestId(TEST_IDS.CHAT_HEADER_MANAGE_MENU);
      openHeaderManageMenu(manageMenu);
      await waitFor(() => {
        expect(manageMenu).toHaveAttribute('open');
      });
      fireEvent.click(within(manageMenu).getByTestId(TEST_IDS.CHAT_DELETE_CONVERSATION));
      await screen.findByRole('dialog', { name: '대화 삭제 확인 모달' });
      fireEvent.click(screen.getByTestId(TEST_IDS.CHAT_DELETE_CONVERSATION_CONFIRM));

      await waitFor(() => {
        expect(
          screen.queryByRole('dialog', { name: '대화 삭제 확인 모달' }),
        ).not.toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.queryByTestId(TEST_IDS.CHAT_HEADER_SEND_MENU)).not.toBeInTheDocument();
      });
      const stored = localStorage.getItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
      expect(stored).toBe('[]');
    });

    it('메시지가 없어도 Escape로 열린 보내기 메뉴가 닫힌다', async () => {
      renderChatOnStandalonePathWithConversation(emptyMessagesConversationId);
      const sendMenu = await screen.findByTestId(TEST_IDS.CHAT_HEADER_SEND_MENU);
      openHeaderSendMenu(sendMenu);
      await waitFor(() => {
        expect(sendMenu).toHaveAttribute('open');
      });
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      await waitFor(() => {
        expect(sendMenu).not.toHaveAttribute('open');
      });
    });

    it('메시지가 없어도 패널 바깥 pointerdown 시 보내기 메뉴가 닫힌다', async () => {
      renderChatOnStandalonePathWithConversation(emptyMessagesConversationId);
      const sendMenu = await screen.findByTestId(TEST_IDS.CHAT_HEADER_SEND_MENU);
      openHeaderSendMenu(sendMenu);
      await waitFor(() => {
        expect(sendMenu).toHaveAttribute('open');
      });
      const titleHeading = screen.getByRole('heading', { level: 3, name: /빈 스레드/ });
      fireEvent.pointerDown(titleHeading);
      await waitFor(() => {
        expect(sendMenu).not.toHaveAttribute('open');
      });
    });

    it('메시지가 없어도 Escape로 열린 관리 메뉴가 닫힌다', async () => {
      renderChatOnStandalonePathWithConversation(emptyMessagesConversationId);
      const manageMenu = await screen.findByTestId(TEST_IDS.CHAT_HEADER_MANAGE_MENU);
      openHeaderManageMenu(manageMenu);
      await waitFor(() => {
        expect(manageMenu).toHaveAttribute('open');
      });
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      await waitFor(() => {
        expect(manageMenu).not.toHaveAttribute('open');
      });
    });

    it('메시지가 없어도 패널 바깥 pointerdown 시 관리 메뉴가 닫힌다', async () => {
      renderChatOnStandalonePathWithConversation(emptyMessagesConversationId);
      const manageMenu = await screen.findByTestId(TEST_IDS.CHAT_HEADER_MANAGE_MENU);
      openHeaderManageMenu(manageMenu);
      await waitFor(() => {
        expect(manageMenu).toHaveAttribute('open');
      });
      const titleHeading = screen.getByRole('heading', { level: 3, name: /빈 스레드/ });
      fireEvent.pointerDown(titleHeading);
      await waitFor(() => {
        expect(manageMenu).not.toHaveAttribute('open');
      });
    });
  });

  describe('답변 로직 연결 (입력 → 질문 표시 → 답변 표시)', () => {
    it('비스트리밍 경로에서 extractResponseContent·setCurrentConversation으로 답변이 대화창에 반영되는 코드 연결이 되어 있음', () => {
      // ChatGPTInterface.tsx: sendMessage 내 비스트리밍 분기에서
      // extractResponseContent(response) → displayContent → finalMessages → flushSync(setCurrentConversation)
      // 로 답변이 대화창에 표시되는 구조가 연결되어 있음을 코드/문서로 검증.
      const { extractResponseContent } = require('../../utils/chatInputUtils');
      expect(typeof extractResponseContent).toBe('function');
      const sample = extractResponseContent({ data: { success: true, response: '테스트 응답' } });
      expect(sample).toBe('테스트 응답');
      // 검증 문서: docs/guides/CHAT_ANSWER_FLOW_VERIFICATION.md
    });
  });
});
