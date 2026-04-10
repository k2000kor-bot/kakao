/**
 * fileLearningService 테스트
 * 파일 학습 서비스 API 호출 검증
 */

import { installJestFetchMock } from '../../test-utils/installJestFetchMock';

installJestFetchMock();
const mockFetch: jest.MockedFunction<typeof fetch> = jest.mocked(global.fetch);

jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    error: jest.fn(),
  },
  toError: jest.fn((e: unknown) => (e instanceof Error ? e : new Error(String(e)))),
}));

import { API_BASE_URL, API_QUERY_PARAM_PROJECT_ID, joinApiHealthCheckUrl } from '../../config/api';
import { FileLearningService } from '../fileLearningService';

function fileLearningUrl(pathAfterApi: string): string {
  const p = pathAfterApi.startsWith('/') ? pathAfterApi : `/${pathAfterApi}`;
  return joinApiHealthCheckUrl(API_BASE_URL, `/api${p}`);
}

describe('FileLearningService', () => {
  let service: FileLearningService;

  beforeEach(() => {
    service = new FileLearningService();
    jest.clearAllMocks();
  });

  describe('startLearning', () => {
    it('성공 시 LearningSession을 반환해야 함', async () => {
      const session = { id: 's1', status: 'running', fileIds: ['f1'] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => session,
      });

      const result = await service.startLearning(['f1']);

      expect(result).toEqual(session);
      expect(mockFetch).toHaveBeenCalledWith(
        fileLearningUrl('/learning/start'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            fileIds: ['f1'],
            modelVersion: 'v2.1.0',
            learningType: 'comprehensive',
          }),
        })
      );
    });

    it('response.ok가 false이면 에러를 던져야 함', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(service.startLearning(['f1'])).rejects.toThrow('학습 시작에 실패했습니다.');
    });

    it('fetch가 reject되면 에러를 전파해야 함', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.startLearning(['f1'])).rejects.toThrow('Network error');
    });
  });

  describe('getLearningStatus', () => {
    it('성공 시 세션 객체를 반환해야 함', async () => {
      const session = { id: 's1', status: 'completed' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => session,
      });

      const result = await service.getLearningStatus('s1');

      expect(result).toEqual(session);
      expect(mockFetch).toHaveBeenCalledWith(fileLearningUrl('/learning/status/s1'));
    });

    it('response.ok가 false이면 에러를 던져야 함', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(service.getLearningStatus('s1')).rejects.toThrow('학습 상태 확인에 실패했습니다.');
    });
  });

  describe('stopLearning', () => {
    it('성공 시 완료되어야 함', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      await service.stopLearning('s1');

      expect(mockFetch).toHaveBeenCalledWith(
        fileLearningUrl('/learning/stop/s1'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('response.ok가 false이면 에러를 던져야 함', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(service.stopLearning('s1')).rejects.toThrow('학습 중지에 실패했습니다.');
    });
  });

  describe('extractInsights', () => {
    it('성공 시 AIInsight 배열을 반환해야 함', async () => {
      const insights = [{ id: 'i1', type: 'summary', content: '요약' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => insights,
      });

      const result = await service.extractInsights('f1');

      expect(result).toEqual(insights);
      expect(mockFetch).toHaveBeenCalledWith(fileLearningUrl('/files/f1/insights'));
    });

    it('response.ok가 false이면 에러를 던져야 함', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(service.extractInsights('f1')).rejects.toThrow('인사이트 추출에 실패했습니다.');
    });
  });

  describe('extractContent', () => {
    it('성공 시 content 문자열을 반환해야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: '파일 내용' }),
      });

      const result = await service.extractContent('f1');

      expect(result).toBe('파일 내용');
    });

    it('response.ok가 false이면 에러를 던져야 함', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(service.extractContent('f1')).rejects.toThrow('파일 내용 추출에 실패했습니다.');
    });
  });

  describe('getLearningMetrics', () => {
    it('성공 시 메트릭 객체를 반환해야 함', async () => {
      const metrics = { processedFiles: 5, accuracy: 0.9 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => metrics,
      });

      const result = await service.getLearningMetrics('s1');

      expect(result).toEqual(metrics);
      expect(mockFetch).toHaveBeenCalledWith(fileLearningUrl('/learning/metrics/s1'));
    });

    it('response.ok가 false이면 에러를 던져야 함', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(service.getLearningMetrics('s1')).rejects.toThrow('학습 메트릭 조회에 실패했습니다.');
    });
  });

  describe('predictClassification', () => {
    it('성공 시 FileClassification을 반환해야 함', async () => {
      const classification = {
        category: 'document',
        subcategory: 'report',
        confidence: 0.95,
        keywords: ['요약'],
        topics: ['업무'],
        sentiment: 'neutral' as const,
        language: 'ko',
        documentType: 'report',
        priority: 'medium' as const,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => classification,
      });

      const result = await service.predictClassification('파일 내용 텍스트');

      expect(result).toEqual(classification);
      expect(mockFetch).toHaveBeenCalledWith(
        fileLearningUrl('/learning/predict'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ content: '파일 내용 텍스트', modelVersion: 'v2.1.0' }),
        })
      );
    });

    it('response.ok가 false이면 에러를 던져야 함', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(service.predictClassification('content')).rejects.toThrow('분류 예측에 실패했습니다.');
    });
  });

  describe('updateFileClassification', () => {
    it('성공 시 완료되어야 함', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      const classification = {
        category: 'document',
        subcategory: 'report',
        confidence: 0.9,
        keywords: ['report'],
        topics: ['업무'],
        sentiment: 'neutral' as const,
        language: 'ko',
        documentType: 'report',
        priority: 'medium' as const,
      };

      await service.updateFileClassification('f1', classification);

      expect(mockFetch).toHaveBeenCalledWith(
        fileLearningUrl('/files/f1/classification'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(classification),
        })
      );
    });

    it('response.ok가 false이면 에러를 던져야 함', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      const classification = {
        category: 'document',
        subcategory: 'report',
        confidence: 0.9,
        keywords: [],
        topics: [],
        sentiment: 'neutral' as const,
        language: 'ko',
        documentType: 'report',
        priority: 'medium' as const,
      };

      await expect(service.updateFileClassification('f1', classification)).rejects.toThrow(
        '파일 분류 업데이트에 실패했습니다.'
      );
    });
  });

  describe('getModelVersions', () => {
    it('성공 시 버전 문자열 배열을 반환해야 함', async () => {
      const versions = ['v2.1.0', 'v2.0.0'];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => versions,
      });

      const result = await service.getModelVersions();

      expect(result).toEqual(versions);
      expect(mockFetch).toHaveBeenCalledWith(fileLearningUrl('/learning/models'));
    });

    it('response.ok가 false이면 에러를 던져야 함', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(service.getModelVersions()).rejects.toThrow('모델 버전 조회에 실패했습니다.');
    });
  });

  describe('getLearningSessions', () => {
    it('성공 시 LearningSession 배열을 반환해야 함', async () => {
      const sessions = [{ id: 's1', status: 'completed' }, { id: 's2', status: 'running' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => sessions,
      });

      const result = await service.getLearningSessions('proj-1');

      expect(result).toEqual(sessions);
      expect(mockFetch).toHaveBeenCalledWith(
        fileLearningUrl(`/learning/sessions?${API_QUERY_PARAM_PROJECT_ID}=proj-1`)
      );
    });

    it('response.ok가 false이면 에러를 던져야 함', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(service.getLearningSessions('proj-1')).rejects.toThrow('학습 세션 조회에 실패했습니다.');
    });
  });

  describe('updateFileLearningStatus', () => {
    it('성공 시 완료되어야 함', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      await service.updateFileLearningStatus('f1', 'completed', 100);

      expect(mockFetch).toHaveBeenCalledWith(
        fileLearningUrl('/files/f1/learning-status'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ status: 'completed', progress: 100 }),
        })
      );
    });

    it('response.ok가 false이면 에러를 던져야 함', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(service.updateFileLearningStatus('f1', 'processing', 50)).rejects.toThrow(
        '파일 학습 상태 업데이트에 실패했습니다.'
      );
    });
  });
});
