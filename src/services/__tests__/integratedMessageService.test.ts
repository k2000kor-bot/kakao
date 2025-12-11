/**
 * IntegratedMessageService 테스트
 */

import {
  IntegratedMessageService,
  integratedMessageService,
} from '../integratedMessageService';

// fetch 모킹
global.fetch = jest.fn();
global.console.error = jest.fn();
global.console.log = jest.fn();

// AbortSignal.timeout 모킹
global.AbortSignal = {
  timeout: jest.fn((ms: number) => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  }),
} as any;

// FormData 모킹
class MockFormData {
  private data: Map<string, any> = new Map();
  
  append(key: string, value: any) {
    this.data.set(key, value);
  }
  
  get(key: string) {
    return this.data.get(key);
  }
  
  has(key: string) {
    return this.data.has(key);
  }
  
  delete(key: string) {
    this.data.delete(key);
  }
  
  getAll(key: string) {
    return this.data.has(key) ? [this.data.get(key)] : [];
  }
  
  entries() {
    return this.data.entries();
  }
  
  keys() {
    return this.data.keys();
  }
  
  values() {
    return this.data.values();
  }
}

global.FormData = MockFormData as any;

describe('IntegratedMessageService', () => {
  let service: IntegratedMessageService;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(1000000);
    service = new IntegratedMessageService();
    mockFetch = global.fetch as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(IntegratedMessageService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(integratedMessageService).toBeDefined();
      expect(integratedMessageService).toBeInstanceOf(IntegratedMessageService);
    });

    it('시스템 초기화 확인', async () => {
      const systems = await service.getSystemStatus();
      expect(systems.length).toBeGreaterThan(0);
      systems.forEach(system => {
        expect(system).toHaveProperty('id');
        expect(system).toHaveProperty('name');
        expect(system).toHaveProperty('isActive');
      });
    });
  });

  describe('메시지 전송', () => {
    it('기본 메시지 전송', async () => {
      const mockResponse = {
        response: '응답 내용',
        type: 'text',
        confidence: 0.9,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.sendMessage({
        content: '테스트 메시지',
      });

      expect(result).toHaveProperty('id');
      expect(result.content).toBe('응답 내용');
      expect(result.type).toBe('text');
      expect(result.confidence).toBe(0.9);
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });

    it('분석 시스템 타입 자동 감지', async () => {
      const mockResponse = {
        response: '분석 결과',
        type: 'analysis',
        confidence: 0.85,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.sendMessage({
        content: '데이터를 분석해줘',
      });

      expect(result.metadata?.usedSystems).toContain('analysis');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8003/api/analyze',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('가이드 시스템 타입 자동 감지', async () => {
      const mockResponse = {
        response: '가이드 내용',
        type: 'text',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.sendMessage({
        content: '메시지 가이드를 제공해줘',
      });

      expect(result.metadata?.usedSystems).toContain('guidance');
    });

    it('프로젝트 시스템 타입 자동 감지', async () => {
      const mockResponse = {
        response: '프로젝트 정보',
        type: 'text',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.sendMessage({
        content: '프로젝트 상태를 알려줘',
      });

      expect(result.metadata?.usedSystems).toContain('project');
    });

    it('파일 시스템 타입 자동 감지', async () => {
      const mockResponse = {
        response: '파일 정보',
        type: 'text',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.sendMessage({
        content: '파일을 업로드해줘',
      });

      expect(result.metadata?.usedSystems).toContain('file');
    });

    it('컨텍스트 포함 메시지 전송', async () => {
      const mockResponse = {
        response: '컨텍스트 기반 응답',
        type: 'text',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.sendMessage({
        content: '테스트',
        context: '프로젝트 컨텍스트',
        projectId: 'project-1',
      });

      expect(result.content).toBe('컨텍스트 기반 응답');
    });

    it('사용자 선호도 포함 메시지 전송', async () => {
      const mockResponse = {
        response: '맞춤 응답',
        type: 'text',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.sendMessage({
        content: '테스트',
        userPreferences: {
          tone: 'formal',
          style: 'professional',
          length: 'medium',
        },
      });

      expect(result.content).toBe('맞춤 응답');
    });

    it('에러 시 폴백 응답 반환', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.sendMessage({
        content: '테스트',
      });

      expect(result.content).toContain('죄송합니다');
      expect(result.confidence).toBe(0.5);
      expect(result.metadata?.usedSystems).toContain('fallback');
      expect(result.metadata?.suggestions).toBeDefined();
    });

    it('HTTP 에러 시 폴백 응답 반환', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await service.sendMessage({
        content: '테스트',
      });

      expect(result.content).toContain('죄송합니다');
      expect(result.metadata?.usedSystems).toContain('fallback');
    });
  });

  describe('시스템 상태 조회', () => {
    it('시스템 상태 조회 성공', async () => {
      const mockSystems = [
        {
          id: 'test-system',
          name: '테스트 시스템',
          isActive: true,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ systems: mockSystems }),
      });

      const result = await service.getSystemStatus();

      expect(result).toEqual(mockSystems);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8003/api/systems/status');
    });

    it('시스템 상태 조회 실패 시 기본 시스템 반환', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      const result = await service.getSystemStatus();

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
    });

    it('네트워크 에러 시 기본 시스템 반환', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.getSystemStatus();

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('파일 업로드', () => {
    it('파일 업로드 성공', async () => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      const mockResponse = {
        fileId: 'file-123',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.uploadFile(mockFile);

      expect(result.success).toBe(true);
      expect(result.fileId).toBe('file-123');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8003/api/upload',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('파일 업로드 실패 처리', async () => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });

      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      const result = await service.uploadFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('파일 업로드 실패');
    });

    it('네트워크 에러 처리', async () => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.uploadFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('네트워크 오류');
    });
  });

  describe('프로젝트 정보 조회', () => {
    it('프로젝트 정보 조회 성공', async () => {
      const mockProject = {
        id: 'project-1',
        name: '테스트 프로젝트',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProject,
      });

      const result = await service.getProjectInfo('project-1');

      expect(result).toEqual(mockProject);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8003/api/project/project-1');
    });

    it('프로젝트 정보 조회 실패 시 null 반환', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      const result = await service.getProjectInfo('project-1');

      expect(result).toBeNull();
    });

    it('네트워크 에러 시 null 반환', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.getProjectInfo('project-1');

      expect(result).toBeNull();
    });
  });

  describe('파일 목록 조회', () => {
    it('파일 목록 조회 성공', async () => {
      const mockFiles = [
        { id: 'file-1', name: 'file1.txt' },
        { id: 'file-2', name: 'file2.txt' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ files: mockFiles }),
      });

      const result = await service.getFileList();

      expect(result).toEqual(mockFiles);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8003/api/files');
    });

    it('파일 목록 조회 실패 시 빈 배열 반환', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      const result = await service.getFileList();

      expect(result).toEqual([]);
    });

    it('네트워크 에러 시 빈 배열 반환', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.getFileList();

      expect(result).toEqual([]);
    });
  });

  describe('가이드 생성', () => {
    it('가이드 생성 성공', async () => {
      const mockGuidance = {
        id: 'guide-1',
        content: '가이드 내용',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGuidance,
      });

      const result = await service.generateGuidance('컨텍스트', {
        tone: 'formal',
      });

      expect(result).toEqual(mockGuidance);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8003/api/guidance/generate',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            context: '컨텍스트',
            preferences: { tone: 'formal' },
          }),
        })
      );
    });

    it('가이드 생성 실패 시 null 반환', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      const result = await service.generateGuidance('컨텍스트', {});

      expect(result).toBeNull();
    });

    it('네트워크 에러 시 null 반환', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.generateGuidance('컨텍스트', {});

      expect(result).toBeNull();
    });
  });

  describe('연결 확인', () => {
    it('연결 성공', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      const result = await service.checkConnection();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8003/health',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('연결 실패', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      const result = await service.checkConnection();

      expect(result).toBe(false);
    });

    it('네트워크 에러 시 false 반환', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.checkConnection();

      expect(result).toBe(false);
    });
  });

  describe('학습 데이터 업데이트', () => {
    it('학습 데이터 업데이트 성공', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await service.updateLearningData('message-1', 'positive');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8003/api/learning/feedback',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messageId: 'message-1',
            feedback: 'positive',
          }),
        })
      );
    });

    it('네트워크 에러 처리', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await service.updateLearningData('message-1', 'negative');

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('에지 케이스', () => {
    it('빈 메시지 전송', async () => {
      const mockResponse = {
        response: '응답',
        type: 'text',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.sendMessage({
        content: '',
      });

      expect(result.content).toBe('응답');
    });

    it('긴 메시지 전송', async () => {
      const longMessage = 'a'.repeat(10000);
      const mockResponse = {
        response: '응답',
        type: 'text',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.sendMessage({
        content: longMessage,
      });

      expect(result.content).toBe('응답');
    });
  });
});

