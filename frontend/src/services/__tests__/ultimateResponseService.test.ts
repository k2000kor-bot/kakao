/**
 * UltimateResponseService 테스트
 */
import { installJestFetchMock, restoreGlobalFetch } from '../../test-utils/installJestFetchMock';
import ultimateResponseService from '../ultimateResponseService';

const originalFetch = globalThis.fetch;

describe('UltimateResponseService', () => {
  beforeEach(() => {
    installJestFetchMock();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    restoreGlobalFetch(originalFetch);
    jest.restoreAllMocks();
  });

  describe('processUltimateRequest', () => {
    it('요청 처리 성공', async () => {
      const mockResult = {
        success: true,
        result: {
          content: '응답 내용',
          confidence: 0.9,
          quality_score: 0.85,
          reasoning: '추론',
          improvements: [],
          metadata: {},
          processing_time: 100,
          stages_completed: []
        }
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await ultimateResponseService.processUltimateRequest({
        user_input: '테스트 질문'
      });

      expect(result.success).toBe(true);
      expect(result.result?.content).toBe('응답 내용');
    });

    it('요청 실패 시 success false', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await ultimateResponseService.processUltimateRequest({
        user_input: '테스트'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getUltimateSystemStatus', () => {
    it('시스템 상태 조회 성공', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, status: 'healthy' })
      });

      const result = await ultimateResponseService.getUltimateSystemStatus();

      expect(result.success).toBe(true);
    });

    it('조회 실패 시 success false', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('offline'));

      const result = await ultimateResponseService.getUltimateSystemStatus();

      expect(result.success).toBe(false);
    });
  });

  describe('getSystemPerformanceStats', () => {
    it('성능 통계 반환', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          status: { processing_history_count: 100 }
        })
      });

      const result = await ultimateResponseService.getSystemPerformanceStats();

      expect(result).toBeDefined();
      expect(typeof result.success_rate).toBe('number');
      expect(typeof result.average_confidence).toBe('number');
      expect(['excellent', 'good', 'fair', 'poor']).toContain(result.system_health);
    });

    it('상태 확인 실패 시 fallback 반환', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('offline'));

      const result = await ultimateResponseService.getSystemPerformanceStats();

      expect(result.system_health).toBe('poor');
      expect(result.success_rate).toBe(0);
    });
  });

  describe('monitorProcessingProgress', () => {
    it('진행 콜백 호출', async () => {
      const callback = jest.fn();
      await ultimateResponseService.monitorProcessingProgress('req-1', callback);

      await new Promise(resolve => setTimeout(resolve, 1500));

      expect(callback).toHaveBeenCalled();
      const lastCall = callback.mock.calls[callback.mock.calls.length - 1];
      expect(lastCall[0]).toHaveProperty('progress_percentage');
      expect(lastCall[0]).toHaveProperty('current_stage');
    }, 5000);
  });
});
