/**
 * chatGPTProjectService 테스트
 * 프로젝트 관리 서비스의 주요 기능 테스트
 */

import ChatGPTProjectService from '../chatGPTProjectService';
import { errorLogger } from '../../utils/errorLogger';
import * as errorHandlerModule from '../../utils/errorHandler';

// errorLogger 모킹
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    error: jest.fn(),
  },
}));

// errorHandler 모킹
jest.mock('../../utils/errorHandler', () => ({
  errorHandler: {
    safeApiCall: jest.fn(),
    logError: jest.fn(),
  },
}));

// fetch 모킹
global.fetch = jest.fn();

describe('ChatGPTProjectService', () => {
  let service: ChatGPTProjectService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = ChatGPTProjectService.getInstance();
    // @ts-ignore - 테스트를 위한 baseUrl 설정
    service.baseUrl = 'http://localhost:5001';
    // errorHandler.safeApiCall 모킹 초기화
    (errorHandlerModule.errorHandler.safeApiCall as jest.Mock).mockClear();
  });

  describe('getInstance', () => {
    it('싱글톤 인스턴스를 반환해야 함', () => {
      const instance1 = ChatGPTProjectService.getInstance();
      const instance2 = ChatGPTProjectService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('createProject', () => {
    it('프로젝트를 성공적으로 생성해야 함', async () => {
      const mockResponse = {
        id: 'project-1',
        title: 'Test Project',
        description: 'Test Description',
        created_at: '2025-01-27T00:00:00Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const projectData = {
        name: 'Test Project',
        category: 'test',
        memoryType: 'default' as const,
        description: 'Test Description',
      };

      const result = await service.createProject(projectData);

      expect(result.id).toBe('project-1');
      expect(result.name).toBe('Test Project');
      expect(result.category).toBe('test');
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/persistent-sessions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('프로젝트 생성 실패 시 에러를 로깅해야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      const projectData = {
        name: 'Test Project',
        category: 'test',
        memoryType: 'default' as const,
      };

      await expect(service.createProject(projectData)).rejects.toThrow();
      expect(errorLogger.error).toHaveBeenCalled();
    });
  });

  describe('getProjects', () => {
    it('프로젝트 목록을 성공적으로 조회해야 함', async () => {
      const mockBackendSessions = [
        {
          id: 'project-1',
          title: 'Project 1',
          description: 'Description 1',
          created_at: '2025-01-27T00:00:00Z',
          total_messages: 0,
          metadata: {
            type: 'project',
            category: 'test',
            memoryType: 'default',
          },
        },
      ];

      const mockProjects = [
        {
          id: 'project-1',
          name: 'Project 1',
          category: 'test',
          memoryType: 'default' as const,
          description: 'Description 1',
          createdAt: '2025-01-27T00:00:00Z',
          fileCount: 0,
          sessionCount: 0,
        },
      ];

      // safeApiCall이 성공 응답을 반환하도록 모킹
      (errorHandlerModule.errorHandler.safeApiCall as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: mockProjects,
      });

      const result = await service.getProjects();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('project-1');
      expect(result[0].name).toBe('Project 1');
      expect(result[0].category).toBe('test');
      expect(result[0].memoryType).toBe('default');
    });

    it('프로젝트 목록 조회 실패 시 빈 배열을 반환해야 함', async () => {
      // safeApiCall이 실패 응답을 반환하도록 모킹
      (errorHandlerModule.errorHandler.safeApiCall as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: {
          message: '프로젝트 목록 조회 실패: Internal Server Error',
          details: 'Error details',
        },
      });

      const result = await service.getProjects();

      expect(result).toHaveLength(0);
      expect(errorLogger.error).toHaveBeenCalled();
    });

    it('safeApiCall이 null을 반환하면 빈 배열을 반환해야 함', async () => {
      // safeApiCall이 null을 반환하도록 모킹
      (errorHandlerModule.errorHandler.safeApiCall as jest.Mock).mockResolvedValueOnce(null);

      const result = await service.getProjects();

      expect(result).toHaveLength(0);
      expect(errorLogger.error).toHaveBeenCalled();
    });
  });

  describe('createSession', () => {
    it('세션을 성공적으로 생성해야 함', async () => {
      const mockResponse = {
        id: 'session-1',
        title: 'Test Session',
        description: 'Test Description',
        created_at: '2025-01-27T00:00:00Z',
        last_activity: '2025-01-27T00:00:00Z',
        total_messages: 0,
        metadata: {},
        is_archived: false,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.createSession('project-1', 'Test Session');

      expect(result.id).toBe('session-1');
      expect(result.title).toBe('Test Session');
    });
  });

  describe('sendMessage', () => {
    it('메시지를 성공적으로 전송해야 함', async () => {
      const mockResponse = {
        id: 'message-1',
        session_id: 'session-1',
        content: 'Test message',
        role: 'user',
        timestamp: '2025-01-27T00:00:00Z',
        metadata: {},
        is_bookmarked: false,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.sendMessage('session-1', 'Test message');

      expect(result.id).toBe('message-1');
      expect(result.content).toBe('Test message');
      expect(result.role).toBe('user');
    });
  });

  describe('getSessionMessages', () => {
    it('세션 메시지 목록을 성공적으로 조회해야 함', async () => {
      const mockResponse = [
        {
          id: 'message-1',
          session_id: 'session-1',
          content: 'Message 1',
          role: 'user',
          timestamp: '2025-01-27T00:00:00Z',
          metadata: {},
          is_bookmarked: false,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.getSessionMessages('session-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('message-1');
      expect(result[0].content).toBe('Message 1');
    });
  });
});

