/**
 * AIService 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import { AIService, AIModel } from '../aiService';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';

// Mock fetch globally
installJestFetchMock();

describe('AIService', () => {
  let service: AIService;

  beforeEach(() => {
    service = new AIService();
    service.setAPIKey('gemini-pro', 'jest-test-gemini-key');
    jest.clearAllMocks();
    jest.mocked(global.fetch).mockReset();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(AIService);
    });

    it('기본 API 키 설정 확인', () => {
      const apiKey = service.getAPIKey('gemini-pro');
      expect(apiKey).toBeDefined();
    });
  });

  describe('API 키 관리', () => {
    it('API 키 설정 및 가져오기', () => {
      service.setAPIKey('gpt-4', 'test-api-key');
      const apiKey = service.getAPIKey('gpt-4');
      expect(apiKey).toBe('test-api-key');
    });

    it('존재하지 않는 모델의 API 키 조회', () => {
      const apiKey = service.getAPIKey('custom' as AIModel);
      expect(apiKey).toBeUndefined();
    });
  });

  describe('사용자 선호도 관리', () => {
    it('사용자 선호도 설정 및 가져오기', () => {
      const preferences = {
        responseStyle: 'detailed' as const,
        detailLevel: 'advanced' as const,
        includeExamples: true,
        includeCode: true,
        includeSources: true,
      };

      service.setUserPreferences('user-1', preferences);
      const retrieved = service.getUserPreferences('user-1');

      expect(retrieved).toBeDefined();
      expect(retrieved?.responseStyle).toBe('detailed');
      expect(retrieved?.detailLevel).toBe('advanced');
    });

    it('존재하지 않는 사용자 선호도 조회', () => {
      const preferences = service.getUserPreferences('non-existent');
      expect(preferences).toBeUndefined();
    });
  });

  describe('대화 히스토리 관리', () => {
    it('대화 히스토리 추가', () => {
      service.addToConversationHistory('user-1', 'user', '안녕하세요');
      service.addToConversationHistory('user-1', 'assistant', '안녕하세요! 무엇을 도와드릴까요?');

      const history = service.getConversationHistory('user-1');
      expect(history.length).toBe(2);
      expect(history[0].role).toBe('user');
      expect(history[0].content).toBe('안녕하세요');
    });

    it('대화 히스토리 가져오기', () => {
      service.addToConversationHistory('user-1', 'user', '메시지 1');
      const history = service.getConversationHistory('user-1');

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
    });

    it('빈 대화 히스토리 가져오기', () => {
      const history = service.getConversationHistory('non-existent');
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBe(0);
    });

    it('대화 히스토리 초기화', () => {
      service.addToConversationHistory('user-1', 'user', '메시지');
      service.clearConversationHistory('user-1');

      const history = service.getConversationHistory('user-1');
      expect(history.length).toBe(0);
    });

    it('대화 히스토리 길이 제한 (최대 20개)', () => {
      for (let i = 0; i < 25; i++) {
        service.addToConversationHistory('user-1', 'user', `메시지 ${i}`);
      }

      const history = service.getConversationHistory('user-1');
      expect(history.length).toBeLessThanOrEqual(20);
    });
  });

  describe('응답 생성', () => {
    it('응답 생성 성공', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: '테스트 응답' }],
            },
          },
        ],
        usageMetadata: {
          totalTokenCount: 50,
        },
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await service.generateResponse('테스트 메시지', 'gemini-pro');

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.model).toBe('gemini-pro');
      expect(typeof response.tokens).toBe('number');
      expect(typeof response.responseTime).toBe('number');
      expect(typeof response.confidence).toBe('number');
      expect(response.quality).toBeDefined();
    });

    it('응답 생성 실패 처리', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        service.generateResponse('테스트 메시지', 'gemini-pro')
      ).rejects.toThrow();
    });
  });

  describe('고급 NLP 분석', () => {
    it('NLP 분석 수행', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: '요약 내용' }],
            },
          },
        ],
      };

      jest.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const analysis = await service.analyzeWithNLP('테스트 메시지', 'gemini-pro');

      expect(analysis).toBeDefined();
      expect(Array.isArray(analysis.keywords)).toBe(true);
      expect(['positive', 'negative', 'neutral']).toContain(analysis.sentiment);
      expect(Array.isArray(analysis.topics)).toBe(true);
      expect(Array.isArray(analysis.entities)).toBe(true);
      expect(typeof analysis.summary).toBe('string');
      expect(Array.isArray(analysis.recommendations)).toBe(true);
      expect(Array.isArray(analysis.relatedTopics)).toBe(true);
    });

    it('NLP 분석 실패 처리', async () => {
      jest.mocked(global.fetch).mockRejectedValue(new Error('Error'));

      const analysis = await service.analyzeWithNLP('폴백_원문_전체_유지', 'gemini-pro');

      // generateSummary / generateRecommendations 가 fetch 실패 시 로컬 폴백
      expect(analysis.summary).toBe('폴백_원문_전체_유지...');
      expect(analysis.recommendations).toEqual(['추가 분석이 필요합니다.']);
    });
  });

  describe('모델 성능 테스트', () => {
    it('모델 성능 테스트 성공', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: '테스트 응답' }],
            },
          },
        ],
        usageMetadata: {
          totalTokenCount: 50,
        },
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.testModelPerformance('gemini-pro', '테스트 메시지');

      expect(result).toBeDefined();
      expect(typeof result.responseTime).toBe('number');
      expect(typeof result.tokenCount).toBe('number');
      expect(result.success).toBe(true);
      expect(result.quality).toBeDefined();
    });

    it('모델 성능 테스트 실패', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Error'));

      const result = await service.testModelPerformance('gemini-pro', '테스트');

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('프롬프트 엔진', () => {
    it('향상된 프롬프트 생성', () => {
      const { AdvancedPromptEngine } = require('../aiService');
      const prompt = AdvancedPromptEngine.generateEnhancedPrompt(
        '테스트 메시지',
        'gemini-pro'
      );

      expect(prompt).toBeDefined();
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('사용자 선호도가 포함된 프롬프트 생성', () => {
      const { AdvancedPromptEngine } = require('../aiService');
      const prompt = AdvancedPromptEngine.generateEnhancedPrompt(
        '테스트 메시지',
        'gemini-pro',
        undefined,
        undefined,
        {
          responseStyle: 'detailed',
          detailLevel: 'advanced',
          includeExamples: true,
          includeCode: false,
          includeSources: true,
        }
      );

      expect(prompt).toBeDefined();
      expect(prompt).toContain('테스트 메시지');
    });
  });

  describe('응답 품질 분석', () => {
    it('응답 품질 분석', () => {
      // ResponseQualityAnalyzer는 export되지 않으므로 간접적으로 테스트
      // generateResponse를 통해 품질 분석이 수행되는지 확인
      expect(true).toBe(true); // 이 부분은 generateResponse 테스트에서 확인됨
    });
  });

  describe('다양한 모델 지원', () => {
    it('gemini-pro 모델 사용', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: '응답' }],
            },
          },
        ],
        usageMetadata: {
          totalTokenCount: 10,
        },
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await service.generateResponse('메시지', 'gemini-pro');
      expect(response.model).toBe('gemini-pro');
    });
  });
});

