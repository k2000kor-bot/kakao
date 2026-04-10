/**
 * @jest-environment jsdom
 */
/* eslint-disable testing-library/no-wait-for-side-effects */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotebookLLM from '../NotebookLLM';
import notebookLLMService from '../../services/notebookLLMService';
import notebookLLMStreamingService from '../../services/notebookLLMStreamingService';
import notebookLLMDeepLearningIntegration from '../../services/notebookLLMDeepLearningIntegration';
import conversationHistoryService from '../../services/conversationHistoryService';
import promptTemplateService from '../../services/promptTemplateService';
import writingStyleService from '../../services/writingStyleService';
import toneService from '../../services/toneService';
import domainKnowledgeService from '../../services/domainKnowledgeService';
import { projectService } from '../../services/projectService';

jest.mock('react-markdown', () => {
  const R = require('react');
  function MockReactMarkdown(props) {
    return R.createElement('div', { 'data-testid': 'react-markdown' }, props.children);
  }
  return MockReactMarkdown;
});
jest.mock('remark-gfm', () => () => ({}));
jest.mock('../../utils/rehypeHighlightSearch', () => ({
  rehypeHighlightSearch: () => () => {},
}));
jest.mock('../../hooks/useOfflineStatus', () => ({ useOfflineStatus: () => ({ isOffline: false }) }));
jest.mock('../../services/notebookLLMService');
jest.mock('../../services/notebookLLMStreamingService');
jest.mock('../../services/projectService', () => ({
  projectService: {
    getNotebookStudioOutputs: jest.fn().mockResolvedValue({ outputs: [], count: 0 }),
    generateNotebookStudioOutput: jest.fn().mockResolvedValue(null),
    deleteNotebookStudioOutput: jest.fn().mockResolvedValue(true),
    getNotebookContext: jest.fn().mockResolvedValue({ context: '', has_context: false, source_count: 0 }),
    addNotebookSource: jest.fn().mockResolvedValue({ source: { id: 'k1', title: '지식', type: 'knowledge' }, source_count: 1 }),
  },
}));
jest.mock('../../services/notebookLLMDeepLearningIntegration', () => {
  const buildMessageToSendForChatMock = jest.fn((msg: string) =>
    Promise.resolve({ messageToSend: msg, promptAnalysis: { sentiment: 'neutral' as const, keyTopics: [], complexity: 0.5, urgency: 0.5 } })
  );
  return {
    __esModule: true,
    default: {
      analyzePromptWithDL: jest.fn(),
      analyzeResponseWithDL: jest.fn().mockResolvedValue({
        sentiment: 'neutral',
        keyTopics: [],
        engagement: 0.5,
        conversationPhase: 'discussion',
        confidence: 0.5,
      }),
      buildMessageToSendForChat: buildMessageToSendForChatMock,
    },
    buildMessageToSendForChat: buildMessageToSendForChatMock,
  };
});
jest.mock('../../services/conversationHistoryService');
jest.mock('../../services/promptTemplateService');
jest.mock('../../services/writingStyleService');
jest.mock('../../services/toneService');
jest.mock('../../services/domainKnowledgeService', () => ({
  __esModule: true,
  default: {
    getAvailableDomains: jest.fn().mockReturnValue([]),
    enrichPromptWithDomainKnowledge: jest.fn().mockImplementation((p: string) => p),
    detectDomainsFromPrompt: jest.fn().mockReturnValue([]),
  },
}));
jest.mock('../../services/associationBylawsService', () => ({
  associationBylawsService: {
    formatBylawsContextForPrompt: jest.fn().mockReturnValue(''),
    getBylawsContextForMentionedSites: jest.fn().mockReturnValue(''),
    hasBylaws: jest.fn().mockReturnValue(false),
    getBylawsAnalysis: jest.fn().mockReturnValue(null),
    getBylawsBaseKnowledge: jest.fn().mockReturnValue(''),
    removeBylaws: jest.fn(),
    analyzeAndSaveFromText: jest.fn(),
    extractProjectType: jest.fn().mockReturnValue(null),
  },
}));
jest.mock('../WebResearchModal', () => ({
  __esModule: true,
  default: ({ open, onClose, projectId }: { open: boolean; onClose: () => void; projectId: string }) =>
    open ? (
      <div data-testid="web-research-modal">
        <span>WebResearchModal</span>
        <button type="button" onClick={onClose} data-testid="web-research-close">닫기</button>
        <span data-testid="web-research-project-id">{projectId}</span>
      </div>
    ) : null,
}));
jest.mock('../DeepResearchModal', () => ({
  __esModule: true,
  default: ({ open, onClose, projectId }: { open: boolean; onClose: () => void; projectId: string }) =>
    open ? (
      <div data-testid="deep-research-modal">
        <span>DeepResearchModal</span>
        <button type="button" onClick={onClose} data-testid="deep-research-close">닫기</button>
        <span data-testid="deep-research-project-id">{projectId}</span>
      </div>
    ) : null,
}));

const mockNotebookLLMService: jest.Mocked<typeof notebookLLMService> = jest.mocked(notebookLLMService);
const mockNotebookLLMStreamingService: jest.Mocked<typeof notebookLLMStreamingService> = jest.mocked(notebookLLMStreamingService);
const mockNotebookLLMDeepLearningIntegration: jest.Mocked<typeof notebookLLMDeepLearningIntegration> = jest.mocked(notebookLLMDeepLearningIntegration);
const mockConversationHistoryService: jest.Mocked<typeof conversationHistoryService> = jest.mocked(conversationHistoryService);
const mockPromptTemplateService: jest.Mocked<typeof promptTemplateService> = jest.mocked(promptTemplateService);
const mockWritingStyleService: jest.Mocked<typeof writingStyleService> = jest.mocked(writingStyleService);
const mockToneService: jest.Mocked<typeof toneService> = jest.mocked(toneService);
const mockDomainKnowledgeService: jest.Mocked<typeof domainKnowledgeService> = jest.mocked(domainKnowledgeService);

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('NotebookLLM', () => {
  const _mockOnResponseComplete = jest.fn();
  const mockOnError = jest.fn();

  const mockStatus = {
    available: true,
    modelType: 'gpt-4',
    lastUsed: new Date().toISOString(),
    usageCount: 10,
  };

  const mockResponse = {
    content: '테스트 응답',
    modelUsed: 'gpt-4',
    tokensUsed: 100,
    processingTime: 1.5,
    confidence: 0.9,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();

    mockNotebookLLMService.loadDefaultConfig = jest.fn().mockReturnValue({
      modelType: 'auto',
      processingMode: 'auto',
      temperature: 0.7,
      maxTokens: 2000,
    });

    mockNotebookLLMService.getProjectNotebookConfig = jest.fn().mockReturnValue(null);
    mockNotebookLLMService.getDefaultNotebookStatus = jest.fn().mockResolvedValue(mockStatus);
    mockNotebookLLMService.getProjectNotebookStatus = jest.fn().mockResolvedValue(mockStatus);
    mockNotebookLLMService.generateWithDefaultNotebook = jest.fn().mockResolvedValue(mockResponse);
    mockNotebookLLMService.generateWithProjectNotebook = jest.fn().mockResolvedValue(mockResponse);

    mockNotebookLLMStreamingService.streamResponse = jest.fn().mockReturnValue({
      subscribe: jest.fn((callback) => {
        callback({ content: '스트리밍', done: false });
        callback({ content: ' 응답', done: true });
        return { unsubscribe: jest.fn() };
      }),
    });

    (mockNotebookLLMService as unknown as {
      buildResponseFormatInstructions: jest.Mock;
      buildIntelligentContext: jest.Mock;
    }).buildResponseFormatInstructions = jest.fn().mockReturnValue('');
    (mockNotebookLLMService as unknown as {
      buildResponseFormatInstructions: jest.Mock;
      buildIntelligentContext: jest.Mock;
    }).buildIntelligentContext = jest.fn().mockReturnValue('');
    jest.mocked(mockNotebookLLMDeepLearningIntegration.buildMessageToSendForChat).mockImplementation((msg: string) =>
      Promise.resolve({ messageToSend: msg, promptAnalysis: { sentiment: 'neutral' as const, keyTopics: [], complexity: 0.5, urgency: 0.5 } })
    );
    mockNotebookLLMDeepLearningIntegration.analyzeResponseWithDL = jest.fn().mockResolvedValue({
      sentiment: 'neutral',
      keyTopics: [],
      engagement: 0.5,
      conversationPhase: 'discussion',
      confidence: 0.5,
    });

    mockConversationHistoryService.getContextForLLM = jest.fn().mockReturnValue([]);
    mockConversationHistoryService.addMessage = jest.fn();
    mockConversationHistoryService.createConversation = jest.fn().mockReturnValue('conv-1');

    mockPromptTemplateService.getTemplates = jest.fn().mockReturnValue([]);
    mockWritingStyleService.getAllStyles = jest.fn().mockReturnValue([]);
    mockToneService.getAvailableTones = jest.fn().mockReturnValue([]);
    mockDomainKnowledgeService.getAvailableDomains = jest.fn().mockReturnValue([]);
    mockDomainKnowledgeService.enrichPromptWithDomainKnowledge = jest
      .fn()
      .mockImplementation((prompt: string) => prompt);
    mockDomainKnowledgeService.detectDomainsFromPrompt = jest
      .fn()
      .mockReturnValue([]);
  });

  const waitForStatusLoaded = async () => {
    await waitFor(
      () => {
        expect(screen.getByText(/사용 가능|사용 불가/)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  };

  describe('렌더링', () => {
    it('기본적으로 컴포넌트를 렌더링해야 함', async () => {
      render(<NotebookLLM />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/프롬프트를 입력하세요/i)).toBeInTheDocument();
      });
      await waitForStatusLoaded();
    });

    it('프로젝트 ID가 있을 때 프로젝트별 노트북으로 렌더링해야 함', async () => {
      render(<NotebookLLM projectId="project-1" />);

      await waitFor(() => {
        expect(mockNotebookLLMService.getProjectNotebookConfig).toHaveBeenCalledWith('project-1');
      });
      await waitForStatusLoaded();
    });

    it('초기 프롬프트를 설정할 수 있어야 함', async () => {
      render(<NotebookLLM initialPrompt="초기 프롬프트" />);

      await waitFor(() => {
        const promptInput = screen.getByPlaceholderText(/프롬프트를 입력하세요/i);
        expect(promptInput).toHaveValue('초기 프롬프트');
      });
      await waitForStatusLoaded();
    });
  });

  describe('프롬프트 입력', () => {
    it('프롬프트를 입력할 수 있어야 함', async () => {
      render(<NotebookLLM />);

      await waitFor(() => {
        const promptInput = screen.getByPlaceholderText(/프롬프트를 입력하세요/i);
        fireEvent.change(promptInput, { target: { value: '테스트 프롬프트' } });
        expect(promptInput).toHaveValue('테스트 프롬프트');
      });
      await waitForStatusLoaded();
    });
  });

  describe('상태 로드', () => {
    it('기본 노트북 상태를 로드해야 함', async () => {
      render(<NotebookLLM />);

      await waitFor(() => {
        expect(mockNotebookLLMService.getDefaultNotebookStatus).toHaveBeenCalled();
      });
      await waitForStatusLoaded();
    });

    it('프로젝트별 노트북 상태를 로드해야 함', async () => {
      render(<NotebookLLM projectId="project-1" />);

      await waitFor(() => {
        expect(mockNotebookLLMService.getProjectNotebookStatus).toHaveBeenCalledWith('project-1');
      });
      await waitForStatusLoaded();
    });
  });

  describe('에러 처리', () => {
    it('에러 발생 시 onError 콜백을 호출해야 함', async () => {
      const error = new Error('테스트 에러');
      mockNotebookLLMService.getDefaultNotebookStatus.mockRejectedValueOnce(error);

      render(<NotebookLLM onError={mockOnError} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/프롬프트를 입력하세요/i)).toBeInTheDocument();
      });
      await new Promise((r) => setTimeout(r, 50));
    });
  });

  describe('설정', () => {
    it('기본 설정을 로드해야 함', async () => {
      render(<NotebookLLM />);

      expect(mockNotebookLLMService.loadDefaultConfig).toHaveBeenCalled();
      await waitForStatusLoaded();
    });

    it('프로젝트별 설정을 로드해야 함', async () => {
      render(<NotebookLLM projectId="project-1" />);

      expect(mockNotebookLLMService.getProjectNotebookConfig).toHaveBeenCalledWith('project-1');
      await waitForStatusLoaded();
    });

    it('딥러닝 연동 체크박스가 표시되어야 함', async () => {
      render(<NotebookLLM />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/프롬프트를 입력하세요/i)).toBeInTheDocument();
      });
      await waitForStatusLoaded();
      expect(screen.getByLabelText(/딥러닝 연동/i)).toBeInTheDocument();
    });

    it('localStorage에 딥러닝 연동이 true이면 체크된 상태로 복원되어야 함', async () => {
      localStorageMock.setItem('notebook-llm-dl-integration', 'true');

      render(<NotebookLLM />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/프롬프트를 입력하세요/i)).toBeInTheDocument();
      });
      await waitForStatusLoaded();
      await waitFor(() => {
        const checkbox = screen.getByLabelText(/딥러닝 연동/i) as HTMLInputElement;
        expect(checkbox.checked).toBe(true);
      });
    });

    it('프로젝트별 딥러닝 연동 설정이 복원되어야 함', async () => {
      localStorageMock.setItem('notebook-llm-dl-integration-project-1', 'true');

      render(<NotebookLLM projectId="project-1" />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/프롬프트를 입력하세요/i)).toBeInTheDocument();
      });
      await waitForStatusLoaded();
      await waitFor(() => {
        const checkbox = screen.getByLabelText(/딥러닝 연동/i) as HTMLInputElement;
        expect(checkbox.checked).toBe(true);
      });
    });

    it('프로젝트 ID가 있을 때 스튜디오 패널(오른쪽)이 표시되어야 함', async () => {
      render(<NotebookLLM projectId="project-1" />);

      await waitForStatusLoaded();
      const studioRegions = screen.getAllByRole('region', { name: /스튜디오/ });
      expect(studioRegions.length).toBeGreaterThanOrEqual(1);
    });

    it('프로젝트 ID가 있을 때 분석 버튼이 표시되어야 함', async () => {
      render(<NotebookLLM projectId="project-1" />);

      await waitForStatusLoaded();
      const analysisButtons = screen.getAllByRole('button', { name: /분석/ });
      expect(analysisButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('프로젝트 ID가 있을 때 지식 추가 버튼이 표시되어야 함', async () => {
      render(<NotebookLLM projectId="project-1" />);
      await waitForStatusLoaded();
      const addKnowledgeBtn = screen.getByRole('button', { name: /지식 추가/ });
      expect(addKnowledgeBtn).toBeInTheDocument();
    });

    it('지식 추가 폼에서 제목·내용 입력 후 지식 저장 시 projectService.addNotebookSource가 호출되어야 함', async () => {
      const addNotebookSourceMock = jest.mocked(projectService.addNotebookSource);
      addNotebookSourceMock.mockResolvedValueOnce({ source: { id: 'k1', title: '지식', type: 'knowledge' }, source_count: 1 });
      render(<NotebookLLM projectId="project-1" />);
      await waitForStatusLoaded();
      const addBtn = screen.getByRole('button', { name: /지식 추가/ });
      await userEvent.click(addBtn);
      await userEvent.type(screen.getByLabelText(/지식 제목/), '시공사 선정 절차');
      await userEvent.type(screen.getByLabelText(/지식 내용/), '입찰 및 심사 기준입니다.');
      const saveBtn = screen.getByRole('button', { name: '지식 저장' });
      await userEvent.click(saveBtn);
      await waitFor(() => {
        expect(addNotebookSourceMock).toHaveBeenCalledWith('project-1', {
          title: '시공사 선정 절차',
          content: '입찰 및 심사 기준입니다.',
          type: 'knowledge',
        });
      });
      // 저장 성공 시 폼이 닫히므로 지식 저장 버튼이 사라질 때까지 대기 (act 경고 방지)
      await waitFor(
        () => {
          expect(screen.queryByRole('button', { name: '지식 저장' })).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('웹 검색 버튼 클릭 시 WebResearchModal이 열려야 함', async () => {
      render(<NotebookLLM projectId="project-1" />);
      await waitForStatusLoaded();

      const webSearchBtn = screen.getByRole('button', { name: /웹\/Fast Research/ });
      expect(webSearchBtn).toBeInTheDocument();
      fireEvent.click(webSearchBtn);

      await waitFor(() => {
        expect(screen.getByTestId('web-research-modal')).toBeInTheDocument();
      });
      expect(screen.getByTestId('web-research-project-id')).toHaveTextContent('project-1');
    });

    it('Deep Research 버튼 클릭 시 DeepResearchModal이 열려야 함', async () => {
      render(<NotebookLLM projectId="project-1" />);
      await waitForStatusLoaded();

      const deepResearchBtn = screen.getByRole('button', { name: /Deep Research/ });
      expect(deepResearchBtn).toBeInTheDocument();
      fireEvent.click(deepResearchBtn);

      await waitFor(() => {
        expect(screen.getByTestId('deep-research-modal')).toBeInTheDocument();
      });
      expect(screen.getByTestId('deep-research-project-id')).toHaveTextContent('project-1');
    });

    it('분석 모달에서 소스 선택 체크박스가 동작해야 함', async () => {
      const mockCtx = {
        context: '테스트 컨텍스트',
        has_context: true,
        source_count: 2,
        sources: [
          { id: 'src-1', type: 'text', title: '소스 1' },
          { id: 'src-2', type: 'text', title: '소스 2' },
        ],
      };
      jest.mocked(projectService.getNotebookContext).mockResolvedValue(mockCtx);

      render(<NotebookLLM projectId="project-1" />);
      await waitForStatusLoaded();
      const analysisButtons = screen.getAllByRole('button', { name: /분석/ });
      fireEvent.click(analysisButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('source-checkbox-src-1')).toBeInTheDocument();
      });

      const cb1 = screen.getByTestId('source-checkbox-src-1') as HTMLInputElement;
      expect(cb1.checked).toBe(true);
      fireEvent.click(cb1);
      expect(localStorageMock.getItem('notebook-selected-sources-project-1')).toContain('src-2');
    });

    it('분석 버튼 클릭 시 getNotebookContext가 호출되고 분석 모달이 열려야 함', async () => {
      jest.mocked(projectService.getNotebookContext).mockResolvedValue({
        context: '테스트 콘텐츠 내용',
        has_context: true,
        source_count: 1,
      });

      render(<NotebookLLM projectId="project-1" />);
      await waitForStatusLoaded();

      const analysisButtons = screen.getAllByRole('button', { name: /분석/ });
      fireEvent.click(analysisButtons[0]);

      await waitFor(() => {
        expect(projectService.getNotebookContext).toHaveBeenCalledWith('project-1');
      });
      await waitFor(() => {
        expect(screen.getByText(/노트북 소스 분석/)).toBeInTheDocument();
      });
    });

    it('스튜디오 패널에 생성 이력이 표시되어야 함', async () => {
      const mockOutputs = [
        { id: 'out-1', type: 'summary', content: '요약 내용', created_at: new Date().toISOString() },
      ];
      jest.mocked(projectService.getNotebookStudioOutputs).mockResolvedValueOnce({ outputs: mockOutputs, count: 1 });

      render(<NotebookLLM projectId="project-1" />);

      await waitForStatusLoaded();

      await waitFor(() => {
        expect(screen.getByText(/생성 이력/)).toBeInTheDocument();
      });
      expect(projectService.getNotebookStudioOutputs).toHaveBeenCalledWith('project-1');
    });

    it('스튜디오 패널에 메모 입력·저장이 되어야 함', async () => {
      jest.mocked(projectService.getNotebookStudioOutputs).mockResolvedValue({ outputs: [], count: 0 });

      render(<NotebookLLM projectId="project-1" />);
      await waitForStatusLoaded();

      await waitFor(() => {
        expect(screen.getByTestId('studio-memo')).toBeInTheDocument();
      });

      const memoTextarea = screen.getByTestId('studio-memo');
      fireEvent.change(memoTextarea, { target: { value: '테스트 메모 내용' } });
      expect((memoTextarea as HTMLTextAreaElement).value).toBe('테스트 메모 내용');

      fireEvent.blur(memoTextarea);
      expect(localStorageMock.getItem('notebook-studio-memo-project-1')).toBe('테스트 메모 내용');
    });

    it('프롬프트 입력 시 질문·요구 확장 버튼 클릭 후 패널이 표시되어야 함', async () => {
      render(<NotebookLLM />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/프롬프트를 입력하세요/i)).toBeInTheDocument();
      });
      await waitForStatusLoaded();

      const promptInput = screen.getByPlaceholderText(/프롬프트를 입력하세요/i);
      fireEvent.change(promptInput, { target: { value: '재개발 시공사 선정' } });

      expect(screen.getByTestId('expand-questions-requirements-btn')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('expand-questions-requirements-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('expanded-suggestions-panel')).toBeInTheDocument();
      });
      expect(screen.getByText('긴 질문')).toBeInTheDocument();
      expect(screen.getByText('긴 요구')).toBeInTheDocument();
      expect(screen.getByText('여러 가지 질문')).toBeInTheDocument();
      expect(screen.getByText('여러 가지 요구')).toBeInTheDocument();
    });

    it('Drive 스텁 버튼 클릭 시 준비 중 모달이 표시되어야 함', async () => {
      render(<NotebookLLM projectId="project-1" />);
      await waitForStatusLoaded();

      const driveBtn = screen.getByTestId('drive-stub-btn');
      fireEvent.click(driveBtn);

      await waitFor(() => {
        expect(screen.getByTestId('drive-stub-modal')).toBeInTheDocument();
      });
      expect(screen.getByText(/Google Drive 연동/)).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('drive-stub-modal-close'));
      await waitFor(() => {
        expect(screen.queryByTestId('drive-stub-modal')).not.toBeInTheDocument();
      });
    });

    it('딥러닝 연동 체크 후 생성 시 buildMessageToSendForChat이 호출되어야 함', async () => {
      render(<NotebookLLM />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/프롬프트를 입력하세요/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(/사용 가능/)).toBeInTheDocument();
      }, { timeout: 3000 });

      const streamingCheckbox = screen.getByLabelText(/스트리밍 모드/i) as HTMLInputElement;
      fireEvent.click(streamingCheckbox);
      expect(streamingCheckbox.checked).toBe(false);

      const dlCheckbox = screen.getByLabelText(/딥러닝 연동/i) as HTMLInputElement;
      fireEvent.click(dlCheckbox);
      expect(dlCheckbox.checked).toBe(true);

      const textarea = screen.getByPlaceholderText(/프롬프트를 입력하세요/i);
      fireEvent.change(textarea, { target: { value: '재개발 시공사 선정 기준을 알려주세요.' } });

      const generateBtn = screen.getByTestId('notebook-llm-generate-btn');
      await waitFor(() => {
        expect(generateBtn).not.toBeDisabled();
      }, { timeout: 2000 });
      fireEvent.click(generateBtn);

      // 딥러닝 연동 시 생성 시작 직후 buildMessageToSendForChat 호출 (딥시크 호출 전 보강)
      await waitFor(() => {
        expect(mockNotebookLLMDeepLearningIntegration.buildMessageToSendForChat).toHaveBeenCalledTimes(1);
      }, { timeout: 8000 });
      const callArgs = jest.mocked(mockNotebookLLMDeepLearningIntegration.buildMessageToSendForChat).mock.calls[0];
      expect(callArgs[0]).toContain('재개발');
      expect(callArgs[3]).toEqual({ includeAnalysis: true });
    });
  });
});

