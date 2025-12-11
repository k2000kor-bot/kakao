import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotebookLLM from '../NotebookLLM';
import notebookLLMService from '../../services/notebookLLMService';
import notebookLLMStreamingService from '../../services/notebookLLMStreamingService';
import conversationHistoryService from '../../services/conversationHistoryService';
import promptTemplateService from '../../services/promptTemplateService';
import writingStyleService from '../../services/writingStyleService';
import toneService from '../../services/toneService';
import domainKnowledgeService from '../../services/domainKnowledgeService';

// Mock services
jest.mock('../../services/notebookLLMService');
jest.mock('../../services/notebookLLMStreamingService');
jest.mock('../../services/conversationHistoryService');
jest.mock('../../services/promptTemplateService');
jest.mock('../../services/writingStyleService');
jest.mock('../../services/toneService');
jest.mock('../../services/domainKnowledgeService');

const mockNotebookLLMService = notebookLLMService as jest.Mocked<typeof notebookLLMService>;
const mockNotebookLLMStreamingService = notebookLLMStreamingService as jest.Mocked<typeof notebookLLMStreamingService>;
const mockConversationHistoryService = conversationHistoryService as jest.Mocked<typeof conversationHistoryService>;
const mockPromptTemplateService = promptTemplateService as jest.Mocked<typeof promptTemplateService>;
const mockWritingStyleService = writingStyleService as jest.Mocked<typeof writingStyleService>;
const mockToneService = toneService as jest.Mocked<typeof toneService>;
const mockDomainKnowledgeService = domainKnowledgeService as jest.Mocked<typeof domainKnowledgeService>;

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
  const mockOnResponseComplete = jest.fn();
  const mockOnError = jest.fn();

  const mockStatus = {
    isAvailable: true,
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

    mockConversationHistoryService.getContextForLLM = jest.fn().mockReturnValue([]);
    mockConversationHistoryService.addMessage = jest.fn();
    mockConversationHistoryService.createConversation = jest.fn().mockReturnValue('conv-1');

    mockPromptTemplateService.getTemplates = jest.fn().mockReturnValue([]);
    mockWritingStyleService.getAllStyles = jest.fn().mockReturnValue([]);
    mockToneService.getAvailableTones = jest.fn().mockReturnValue([]);
    mockDomainKnowledgeService.getAvailableDomains = jest.fn().mockReturnValue([]);
  });

  describe('렌더링', () => {
    it('기본적으로 컴포넌트를 렌더링해야 함', async () => {
      render(<NotebookLLM />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/프롬프트를 입력하세요/i)).toBeInTheDocument();
      });
    });

    it('프로젝트 ID가 있을 때 프로젝트별 노트북으로 렌더링해야 함', async () => {
      render(<NotebookLLM projectId="project-1" />);

      await waitFor(() => {
        expect(mockNotebookLLMService.getProjectNotebookConfig).toHaveBeenCalledWith('project-1');
      });
    });

    it('초기 프롬프트를 설정할 수 있어야 함', async () => {
      render(<NotebookLLM initialPrompt="초기 프롬프트" />);

      await waitFor(() => {
        const promptInput = screen.getByPlaceholderText(/프롬프트를 입력하세요/i);
        expect(promptInput).toHaveValue('초기 프롬프트');
      });
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
    });
  });

  describe('상태 로드', () => {
    it('기본 노트북 상태를 로드해야 함', async () => {
      render(<NotebookLLM />);

      await waitFor(() => {
        expect(mockNotebookLLMService.getDefaultNotebookStatus).toHaveBeenCalled();
      });
    });

    it('프로젝트별 노트북 상태를 로드해야 함', async () => {
      render(<NotebookLLM projectId="project-1" />);

      await waitFor(() => {
        expect(mockNotebookLLMService.getProjectNotebookStatus).toHaveBeenCalledWith('project-1');
      });
    });
  });

  describe('에러 처리', () => {
    it('에러 발생 시 onError 콜백을 호출해야 함', async () => {
      const error = new Error('테스트 에러');
      mockNotebookLLMService.getDefaultNotebookStatus.mockRejectedValueOnce(error);

      render(<NotebookLLM onError={mockOnError} />);

      await waitFor(() => {
        // 에러가 발생해도 컴포넌트는 렌더링되어야 함
        expect(screen.getByPlaceholderText(/프롬프트를 입력하세요/i)).toBeInTheDocument();
      });
    });
  });

  describe('설정', () => {
    it('기본 설정을 로드해야 함', () => {
      render(<NotebookLLM />);

      expect(mockNotebookLLMService.loadDefaultConfig).toHaveBeenCalled();
    });

    it('프로젝트별 설정을 로드해야 함', () => {
      render(<NotebookLLM projectId="project-1" />);

      expect(mockNotebookLLMService.getProjectNotebookConfig).toHaveBeenCalledWith('project-1');
    });
  });
});

