/**
 * intentApi 서비스 테스트
 * 의도·키워드 분석 API (POST /api/intent/analyze) 테스트
 */

import { analyzeIntent, type IntentResult, type IntentAnalyzeResponse } from '../intentApi';
import { API_BASE_URL, API_JSON_FIELD_MESSAGE, INTENT_ANALYZE_PATH, joinApiHealthCheckUrl } from '../../config/api';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';

installJestFetchMock();
const mockFetch: jest.MockedFunction<typeof fetch> = jest.mocked(global.fetch);

describe('intentApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeIntent', () => {
    it('성공 시 IntentResult를 반환해야 함', async () => {
      const result: IntentResult = {
        intent: { type: 'greeting', confidence: 0.95 },
        keywords: ['안녕', '하세요'],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async (): Promise<IntentAnalyzeResponse> => ({
          success: true,
          data: result,
        }),
      });

      const got = await analyzeIntent('안녕하세요');

      expect(got).toEqual(result);
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(API_BASE_URL, INTENT_ANALYZE_PATH),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [API_JSON_FIELD_MESSAGE]: '안녕하세요' }),
        })
      );
    });

    it('메시지 앞뒤 공백은 trim 되어 전달되어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async (): Promise<IntentAnalyzeResponse> => ({
          success: true,
          data: { intent: { type: 'question', confidence: 0.8 }, keywords: [] },
        }),
      });

      await analyzeIntent('  질문입니다  ');

      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(API_BASE_URL, INTENT_ANALYZE_PATH),
        expect.objectContaining({
          body: JSON.stringify({ [API_JSON_FIELD_MESSAGE]: '질문입니다' }),
        })
      );
    });

    it('빈 메시지이면 "메시지가 비어있습니다." 에러를 던져야 함', async () => {
      await expect(analyzeIntent('')).rejects.toThrow('메시지가 비어있습니다.');
      await expect(analyzeIntent('   ')).rejects.toThrow('메시지가 비어있습니다.');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('res.ok가 false이면 data.error 또는 상태 메시지로 에러를 던져야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async (): Promise<IntentAnalyzeResponse> => ({
          success: false,
          error: '메시지 길이 초과',
        }),
      });

      await expect(analyzeIntent('테스트')).rejects.toThrow('메시지 길이 초과');
    });

    it('res.ok가 false이고 error가 없으면 상태 메시지로 에러를 던져야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async (): Promise<IntentAnalyzeResponse> => ({}),
      });

      await expect(analyzeIntent('테스트')).rejects.toThrow('의도 분석 실패: 500');
    });

    it('success가 false이면 에러를 던져야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async (): Promise<IntentAnalyzeResponse> => ({
          success: false,
          error: '의도 분석 결과 없음',
        }),
      });

      await expect(analyzeIntent('테스트')).rejects.toThrow('의도 분석 결과 없음');
    });

    it('data가 없으면 에러를 던져야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async (): Promise<IntentAnalyzeResponse> => ({
          success: true,
        }),
      });

      await expect(analyzeIntent('테스트')).rejects.toThrow();
    });

    it('fetch가 실패하면 해당 에러를 던져야 함', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(analyzeIntent('테스트')).rejects.toThrow('Network error');
    });

    it('response.json()이 실패하면 에러를 전파해야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async (): Promise<IntentAnalyzeResponse> => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(analyzeIntent('테스트')).rejects.toThrow('Invalid JSON');
    });
  });

  describe('모듈 export', () => {
    it('analyzeIntent 함수가 export 되어 있어야 함', () => {
      expect(typeof analyzeIntent).toBe('function');
    });
  });
});
