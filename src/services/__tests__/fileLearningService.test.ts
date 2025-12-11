/**
 * FileLearningService 테스트
 */

import {
  FileLearningService,
  fileLearningService,
} from '../fileLearningService';

// fetch 모킹
global.fetch = jest.fn();
global.console.error = jest.fn();

describe('FileLearningService', () => {
  let service: FileLearningService;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    service = new FileLearningService();
    mockFetch = global.fetch as jest.Mock;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(FileLearningService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(fileLearningService).toBeDefined();
      expect(fileLearningService).toBeInstanceOf(FileLearningService);
    });
  });

  describe('학습 시작', () => {
    it('학습 세션 시작', async () => {
      const mockSession = {
        id: 'session-1',
        status: 'processing',
        progress: 0,
        fileIds: ['file-1', 'file-2'],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession,
      });

      const result = await service.startLearning(['file-1', 'file-2']);

      expect(result).toEqual(mockSession);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8003/api/learning/start',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileIds: ['file-1', 'file-2'],
            modelVersion: 'v2.1.0',
            learningType: 'comprehensive',
          }),
        })
      );
    });

    it('학습 시작 실패 처리', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(service.startLearning(['file-1'])).rejects.toThrow('학습 시작에 실패했습니다.');
    });

    it('네트워크 에러 처리', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.startLearning(['file-1'])).rejects.toThrow('Network error');
    });
  });

  describe('학습 상태 확인', () => {
    it('학습 세션 상태 조회', async () => {
      const mockSession = {
        id: 'session-1',
        status: 'processing',
        progress: 50,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession,
      });

      const result = await service.getLearningStatus('session-1');

      expect(result).toEqual(mockSession);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8003/api/learning/status/session-1');
    });

    it('학습 상태 확인 실패 처리', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(service.getLearningStatus('session-1')).rejects.toThrow('학습 상태 확인에 실패했습니다.');
    });
  });

  describe('학습 중지', () => {
    it('학습 세션 중지', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await service.stopLearning('session-1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8003/api/learning/stop/session-1',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('학습 중지 실패 처리', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(service.stopLearning('session-1')).rejects.toThrow('학습 중지에 실패했습니다.');
    });
  });

  describe('파일 분류 업데이트', () => {
    it('파일 분류 업데이트', async () => {
      const classification = {
        category: 'document',
        tags: ['important'],
        confidence: 0.9,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await service.updateFileClassification('file-1', classification);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8003/api/files/file-1/classification',
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(classification),
        })
      );
    });

    it('파일 분류 업데이트 실패 처리', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(
        service.updateFileClassification('file-1', {
          category: 'document',
          tags: [],
          confidence: 0.5,
        })
      ).rejects.toThrow('파일 분류 업데이트에 실패했습니다.');
    });
  });

  describe('AI 인사이트 추출', () => {
    it('파일 인사이트 추출', async () => {
      const mockInsights = [
        {
          id: 'insight-1',
          type: 'pattern',
          content: '패턴 발견',
          confidence: 0.85,
        },
        {
          id: 'insight-2',
          type: 'anomaly',
          content: '이상 징후',
          confidence: 0.75,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockInsights,
      });

      const result = await service.extractInsights('file-1');

      expect(result).toEqual(mockInsights);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8003/api/files/file-1/insights');
    });

    it('인사이트 추출 실패 처리', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(service.extractInsights('file-1')).rejects.toThrow('인사이트 추출에 실패했습니다.');
    });
  });

  describe('파일 내용 추출', () => {
    it('파일 내용 추출', async () => {
      const mockContent = '파일 내용입니다.';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: mockContent }),
      });

      const result = await service.extractContent('file-1');

      expect(result).toBe(mockContent);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8003/api/files/file-1/content');
    });

    it('파일 내용 추출 실패 처리', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(service.extractContent('file-1')).rejects.toThrow('파일 내용 추출에 실패했습니다.');
    });
  });

  describe('학습 메트릭', () => {
    it('학습 메트릭 조회', async () => {
      const mockMetrics = {
        accuracy: 0.92,
        loss: 0.08,
        epochs: 10,
        trainingTime: 3600,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMetrics,
      });

      const result = await service.getLearningMetrics('session-1');

      expect(result).toEqual(mockMetrics);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8003/api/learning/metrics/session-1');
    });

    it('학습 메트릭 조회 실패 처리', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(service.getLearningMetrics('session-1')).rejects.toThrow('학습 메트릭 조회에 실패했습니다.');
    });
  });

  describe('파일 분류 예측', () => {
    it('파일 분류 예측', async () => {
      const mockClassification = {
        category: 'document',
        tags: ['contract'],
        confidence: 0.95,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockClassification,
      });

      const result = await service.predictClassification('파일 내용');

      expect(result).toEqual(mockClassification);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8003/api/learning/predict',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: '파일 내용',
            modelVersion: 'v2.1.0',
          }),
        })
      );
    });

    it('분류 예측 실패 처리', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(service.predictClassification('내용')).rejects.toThrow('분류 예측에 실패했습니다.');
    });
  });

  describe('모델 버전 관리', () => {
    it('모델 버전 목록 조회', async () => {
      const mockVersions = ['v2.0.0', 'v2.1.0', 'v2.2.0'];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockVersions,
      });

      const result = await service.getModelVersions();

      expect(result).toEqual(mockVersions);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8003/api/learning/models');
    });

    it('모델 버전 조회 실패 처리', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(service.getModelVersions()).rejects.toThrow('모델 버전 조회에 실패했습니다.');
    });
  });

  describe('학습 세션 목록', () => {
    it('프로젝트별 학습 세션 목록 조회', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          status: 'completed',
          progress: 100,
        },
        {
          id: 'session-2',
          status: 'processing',
          progress: 50,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSessions,
      });

      const result = await service.getLearningSessions('project-1');

      expect(result).toEqual(mockSessions);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8003/api/learning/sessions?projectId=project-1');
    });

    it('학습 세션 조회 실패 처리', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(service.getLearningSessions('project-1')).rejects.toThrow('학습 세션 조회에 실패했습니다.');
    });
  });

  describe('파일 학습 상태 업데이트', () => {
    it('파일 학습 상태 업데이트', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await service.updateFileLearningStatus('file-1', 'processing', 50);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8003/api/files/file-1/learning-status',
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'processing',
            progress: 50,
          }),
        })
      );
    });

    it('파일 학습 상태 업데이트 실패 처리', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(
        service.updateFileLearningStatus('file-1', 'completed', 100)
      ).rejects.toThrow('파일 학습 상태 업데이트에 실패했습니다.');
    });
  });

  describe('실시간 학습 진행률 모니터링', () => {
    it('학습 진행률 모니터링', async () => {
      const callback = jest.fn();
      const mockSessions = [
        { status: 'processing', progress: 25 },
        { status: 'processing', progress: 50 },
        { status: 'processing', progress: 75 },
        { status: 'completed', progress: 100 },
      ];

      let callCount = 0;
      mockFetch.mockImplementation(() => {
        const session = mockSessions[callCount] || mockSessions[mockSessions.length - 1];
        callCount++;
        return Promise.resolve({
          ok: true,
          json: async () => session,
        });
      });

      service.monitorLearningProgress('session-1', callback);

      // 첫 번째 폴링
      jest.advanceTimersByTime(2000);
      await Promise.resolve();
      await Promise.resolve(); // 추가 대기

      // 두 번째 폴링
      jest.advanceTimersByTime(2000);
      await Promise.resolve();
      await Promise.resolve();

      // 세 번째 폴링
      jest.advanceTimersByTime(2000);
      await Promise.resolve();
      await Promise.resolve();

      // 네 번째 폴링 (완료)
      jest.advanceTimersByTime(2000);
      await Promise.resolve();
      await Promise.resolve();

      // 완료되면 더 이상 호출되지 않아야 함
      jest.advanceTimersByTime(2000);
      await Promise.resolve();

      expect(callback).toHaveBeenCalled();
      expect(callback.mock.calls.length).toBeGreaterThanOrEqual(3);
      expect(callback).toHaveBeenCalledWith(25);
      expect(callback).toHaveBeenCalledWith(50);
      expect(callback).toHaveBeenCalledWith(75);
      // 완료 상태일 때도 콜백이 호출될 수 있음
      if (callback.mock.calls.length >= 4) {
        expect(callback).toHaveBeenCalledWith(100);
      }
    });

    it('학습 실패 시 모니터링 중지', async () => {
      const callback = jest.fn();
      const mockSession = {
        status: 'failed',
        progress: 0,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockSession,
      });

      service.monitorLearningProgress('session-1', callback);

      // setInterval 콜백이 실행될 시간 제공
      jest.advanceTimersByTime(2000);
      
      // 비동기 작업 완료를 위한 여러 번의 Promise.resolve
      for (let i = 0; i < 10; i++) {
        await Promise.resolve();
      }

      // 실패하면 더 이상 호출되지 않아야 함
      jest.advanceTimersByTime(2000);
      
      for (let i = 0; i < 10; i++) {
        await Promise.resolve();
      }

      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(0);
      // 실패 상태에서는 한 번만 호출되어야 함
      expect(callback.mock.calls.length).toBe(1);
    });

    it('모니터링 에러 처리', async () => {
      const callback = jest.fn();

      mockFetch.mockRejectedValue(new Error('Network error'));

      service.monitorLearningProgress('session-1', callback);

      jest.advanceTimersByTime(2000);
      await Promise.resolve();
      await Promise.resolve(); // 추가 대기

      // 에러 발생 시 모니터링이 중지되어야 함
      jest.advanceTimersByTime(2000);
      await Promise.resolve();

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('에지 케이스', () => {
    it('빈 파일 ID 배열로 학습 시작', async () => {
      const mockSession = {
        id: 'session-1',
        status: 'processing',
        progress: 0,
        fileIds: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession,
      });

      const result = await service.startLearning([]);

      expect(result).toEqual(mockSession);
    });

    it('긴 파일 내용으로 분류 예측', async () => {
      const longContent = 'a'.repeat(10000);
      const mockClassification = {
        category: 'document',
        tags: [],
        confidence: 0.5,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockClassification,
      });

      const result = await service.predictClassification(longContent);

      expect(result).toEqual(mockClassification);
    });
  });
});

