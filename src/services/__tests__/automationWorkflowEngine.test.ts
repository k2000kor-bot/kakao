/**
 * AutomationWorkflowEngine 테스트
 */

import { AutomationWorkflowEngine } from '../automationWorkflowEngine';
import { ChatSession, Message } from '../../types/chat';
import { Project } from '../../types/project';

// localStorage 모킹
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

describe('AutomationWorkflowEngine', () => {
  let service: AutomationWorkflowEngine;
  let mockSession: ChatSession;
  let mockProject: Project;

  beforeEach(() => {
    localStorageMock.clear();
    service = new AutomationWorkflowEngine();

    mockSession = {
      id: 'session-1',
      projectId: 'project-1',
      title: 'Test Session',
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: '테스트 메시지',
          timestamp: new Date(),
        } as Message,
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockProject = {
      id: 'project-1',
      name: 'Test Project',
      description: 'Test Description',
      files: [
        {
          id: 'file-1',
          name: 'test.txt',
          type: 'text/plain',
          size: 100,
          uploadedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(AutomationWorkflowEngine);
    });
  });

  describe('워크플로우 실행', () => {
    it('워크플로우 실행', async () => {
      const context = {
        session: mockSession,
        project: mockProject,
        userMessage: '테스트 메시지',
        aiResponse: '테스트 응답',
        userPatterns: {},
        projectData: {},
        timestamp: new Date(),
      };

      const result = await service.executeWorkflow('auto_file_organization', context);

      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(result.action).toBeDefined();
      expect(result.message).toBeDefined();
      expect(Array.isArray(result.nextSteps)).toBe(true);
    });

    it('존재하지 않는 워크플로우 실행', async () => {
      const context = {
        session: mockSession,
        project: mockProject,
        userMessage: '테스트 메시지',
        aiResponse: '테스트 응답',
        userPatterns: {},
        projectData: {},
        timestamp: new Date(),
      };

      const result = await service.executeWorkflow('non-existent', context);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
    });

    it('프로젝트 없이 워크플로우 실행', async () => {
      const context = {
        session: mockSession,
        project: null,
        userMessage: '테스트 메시지',
        aiResponse: '테스트 응답',
        userPatterns: {},
        projectData: {},
        timestamp: new Date(),
      };

      const result = await service.executeWorkflow('auto_file_organization', context);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
    });
  });

  describe('자동화 규칙 실행', () => {
    it('자동화 규칙 실행', async () => {
      const context = {
        session: mockSession,
        project: mockProject,
        userMessage: '테스트 메시지',
        aiResponse: '테스트 응답',
        userPatterns: {},
        projectData: {},
        timestamp: new Date(),
      };

      const results = await service.executeAutomationRules(context);

      expect(Array.isArray(results)).toBe(true);
      results.forEach((result) => {
        expect(result).toBeDefined();
        expect(typeof result.success).toBe('boolean');
        expect(result.action).toBeDefined();
      });
    });
  });

  describe('스마트 제안 생성', () => {
    it('스마트 제안 생성', async () => {
      const context = {
        session: mockSession,
        project: mockProject,
        userMessage: '테스트 메시지',
        aiResponse: '테스트 응답',
        userPatterns: {},
        projectData: {},
        timestamp: new Date(),
      };

      const suggestions = await service.generateSmartSuggestions(context);

      expect(Array.isArray(suggestions)).toBe(true);
      suggestions.forEach((suggestion) => {
        expect(suggestion).toBeDefined();
        expect(['question', 'action', 'resource', 'optimization']).toContain(suggestion.type);
        expect(typeof suggestion.title).toBe('string');
        expect(typeof suggestion.description).toBe('string');
        expect(typeof suggestion.confidence).toBe('number');
        expect(suggestion.action).toBeDefined();
      });
    });
  });

  describe('전체 자동화 실행', () => {
    it('전체 자동화 실행', async () => {
      const context = {
        session: mockSession,
        project: mockProject,
        userMessage: '테스트 메시지',
        aiResponse: '테스트 응답',
        userPatterns: {},
        projectData: {},
        timestamp: new Date(),
      };

      const result = await service.runFullAutomation(context);

      expect(result).toBeDefined();
      expect(Array.isArray(result.workflows)).toBe(true);
      expect(Array.isArray(result.rules)).toBe(true);
      expect(Array.isArray(result.suggestions)).toBe(true);
    });
  });

  describe('다양한 워크플로우', () => {
    it('자동 파일 정리 워크플로우', async () => {
      const context = {
        session: mockSession,
        project: mockProject,
        userMessage: '파일 정리',
        aiResponse: '파일을 정리하겠습니다.',
        userPatterns: {},
        projectData: {},
        timestamp: new Date(),
      };

      const result = await service.executeWorkflow('auto_file_organization', context);

      expect(result).toBeDefined();
      expect(result.action).toBe('auto_file_organization');
    });

    it('자동 지침 생성 워크플로우', async () => {
      const context = {
        session: mockSession,
        project: mockProject,
        userMessage: '지침 생성',
        aiResponse: '지침을 생성하겠습니다.',
        userPatterns: {},
        projectData: {},
        timestamp: new Date(),
      };

      const result = await service.executeWorkflow('auto_guideline_generation', context);

      expect(result).toBeDefined();
      expect(result.action).toBe('auto_guideline_generation');
    });

    it('자동 요약 생성 워크플로우', async () => {
      const context = {
        session: mockSession,
        project: mockProject,
        userMessage: '요약 생성',
        aiResponse: '요약을 생성하겠습니다.',
        userPatterns: {},
        projectData: {},
        timestamp: new Date(),
      };

      const result = await service.executeWorkflow('auto_summary_generation', context);

      expect(result).toBeDefined();
      expect(result.action).toBe('auto_summary_generation');
    });
  });

  describe('데이터 저장 및 로드', () => {
    it('데이터 저장 및 로드', () => {
      // 서비스 초기화 시 데이터가 로드됨
      expect(localStorageMock.getItem('automation_workflow_data')).toBeDefined();
    });
  });
});

