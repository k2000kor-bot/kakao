/**
 * EnhancedWritingService 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import { installJestFetchMock } from '../../test-utils/installJestFetchMock';
import {
  EnhancedWritingService,
  enhancedWritingService,
  WritingRequest,
} from '../enhancedWritingService';

installJestFetchMock();

describe('EnhancedWritingService', () => {
  let service: EnhancedWritingService;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    service = new EnhancedWritingService();
    mockFetch = jest.mocked(global.fetch);
    jest.clearAllMocks();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(EnhancedWritingService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(enhancedWritingService).toBeDefined();
    });
  });

  describe('고도화된 글쓰기 생성', () => {
    const createTestRequest = (): WritingRequest => ({
      writingType: 'persuasive',
      targetAudience: 'general',
      writingGoal: 'inform',
      tone: 'friendly',
      length: 'medium',
      keywords: ['테스트', '키워드'],
      context: '테스트 컨텍스트',
      fileContexts: [],
    });

    it('기본 글쓰기 생성', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          content: '생성된 글쓰기 내용입니다.',
          confidence: 0.9,
          persuasionScore: 0.85,
          readability: 0.88,
          emotionalImpact: 0.75,
          suggestions: ['더 구체적인 예시 추가'],
          usedContexts: ['context1'],
          generatedInsights: ['인사이트 1'],
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request = createTestRequest();
      const result = await service.generateEnhancedWriting('session-123', request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
      expect(typeof result.confidence).toBe('number');
      expect(typeof result.persuasionScore).toBe('number');
      expect(typeof result.readability).toBe('number');
      expect(typeof result.emotionalImpact).toBe('number');
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(Array.isArray(result.usedContexts)).toBe(true);
      expect(Array.isArray(result.generatedInsights)).toBe(true);
    });

    it('파일 컨텍스트 포함 글쓰기', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          content: '파일 컨텍스트 기반 글쓰기',
          confidence: 0.95,
          persuasionScore: 0.9,
          readability: 0.9,
          emotionalImpact: 0.8,
          suggestions: [],
          usedContexts: ['file1', 'file2'],
          generatedInsights: ['파일 기반 인사이트'],
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: WritingRequest = {
        writingType: 'informative',
        targetAudience: 'professionals',
        writingGoal: 'educate',
        tone: 'professional',
        length: 'long',
        keywords: ['전문', '정보'],
        context: '파일 컨텍스트',
        fileContexts: [
          {
            id: 'file1',
            name: 'test1.txt',
            type: 'text',
            extractedText: '추출된 텍스트',
          },
        ],
      };

      const result = await service.generateEnhancedWriting('session-456', request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.usedContexts.length).toBeGreaterThan(0);
    });

    it('다양한 글쓰기 타입', async () => {
      const writingTypes = [
        'persuasive',
        'informative',
        'emotional',
        'logical',
        'storytelling',
      ];

      for (const writingType of writingTypes) {
        const mockResponse = {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            content: `${writingType} 타입 글쓰기`,
            confidence: 0.9,
            persuasionScore: 0.8,
            readability: 0.85,
            emotionalImpact: 0.75,
            suggestions: [],
            usedContexts: [],
            generatedInsights: [],
          }),
        };

        mockFetch.mockResolvedValue(mockResponse);

        const request = { ...createTestRequest(), writingType };
        const result = await service.generateEnhancedWriting('session-789', request);

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
      }
    });

    it('다양한 톤', async () => {
      const tones = ['friendly', 'professional', 'formal', 'casual'];

      for (const tone of tones) {
        const mockResponse = {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            content: `${tone} 톤 글쓰기`,
            confidence: 0.9,
            persuasionScore: 0.8,
            readability: 0.85,
            emotionalImpact: 0.75,
            suggestions: [],
            usedContexts: [],
            generatedInsights: [],
          }),
        };

        mockFetch.mockResolvedValue(mockResponse);

        const request = { ...createTestRequest(), tone };
        const result = await service.generateEnhancedWriting('session-tone', request);

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
      }
    });

    it('API 실패 시 에러 처리', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const request = createTestRequest();
      const result = await service.generateEnhancedWriting('session-error', request);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.content).toBe('');
      expect(result.confidence).toBe(0);
    });

    it('HTTP 에러 처리', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request = createTestRequest();
      const result = await service.generateEnhancedWriting('session-http-error', request);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('글쓰기 품질 분석', () => {
    it('기본 품질 분석', () => {
      const content = '테스트 내용입니다. 이것은 두 번째 문장입니다.';

      const result = service.analyzeWritingQuality(content);

      expect(result).toBeDefined();
      expect(typeof result.readability).toBe('number');
      expect(result.readability).toBeGreaterThanOrEqual(0);
      expect(result.readability).toBeLessThanOrEqual(1);
      expect(typeof result.persuasionScore).toBe('number');
      expect(result.persuasionScore).toBeGreaterThanOrEqual(0);
      expect(result.persuasionScore).toBeLessThanOrEqual(1);
      expect(typeof result.emotionalImpact).toBe('number');
      expect(result.emotionalImpact).toBeGreaterThanOrEqual(0);
      expect(result.emotionalImpact).toBeLessThanOrEqual(1);
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('설득력 있는 단어 포함 텍스트', () => {
      const content = '이것은 중요한 내용입니다. 확실한 효과가 있을 것입니다. 성공적인 결과를 기대합니다.';

      const result = service.analyzeWritingQuality(content);

      expect(result).toBeDefined();
      expect(result.persuasionScore).toBeGreaterThan(0.8);
    });

    it('감정적 단어 포함 텍스트', () => {
      const content = '이것은 감동적인 내용입니다. 희망을 주는 메시지입니다. 행복한 결과를 기대합니다.';

      const result = service.analyzeWritingQuality(content);

      expect(result).toBeDefined();
      expect(result.emotionalImpact).toBeGreaterThan(0.7);
    });

    it('짧은 문장 텍스트', () => {
      const content = '짧은 문장. 또 다른 짧은 문장.';

      const result = service.analyzeWritingQuality(content);

      expect(result).toBeDefined();
      expect(result.readability).toBeGreaterThan(0.85);
    });

    it('긴 문장 텍스트', () => {
      const content =
        '이것은 매우 긴 문장입니다. 여러 개의 단어들이 포함되어 있고, 복잡한 구조를 가지고 있으며, 읽기 어려울 수 있습니다.';

      const result = service.analyzeWritingQuality(content);

      expect(result).toBeDefined();
      expect(result.readability).toBeLessThanOrEqual(1.0);
      // 긴 문장은 가독성이 낮아질 수 있음
      expect(result.readability).toBeGreaterThanOrEqual(0);
    });

    it('빈 텍스트 처리', () => {
      const result = service.analyzeWritingQuality('');

      expect(result).toBeDefined();
      expect(typeof result.readability).toBe('number');
      expect(Array.isArray(result.suggestions)).toBe(true);
    });
  });

  describe('파일 문맥 분석', () => {
    it('기본 파일 문맥 분석', () => {
      const files = [
        {
          id: 'file1',
          name: 'test1.txt',
          type: 'text',
          extractedText: '추출된 텍스트',
          summary: '요약',
          keywords: ['키워드1', '키워드2'],
          sentiment: 'positive',
          confidence: 0.9,
        },
      ];

      const result = service.analyzeFileContexts(files);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].fileId).toBe('file1');
      expect(result[0].fileName).toBe('test1.txt');
      expect(result[0].fileType).toBe('text');
      expect(result[0].extractedText).toBe('추출된 텍스트');
      expect(result[0].summary).toBe('요약');
      expect(Array.isArray(result[0].keywords)).toBe(true);
      expect(result[0].sentiment).toBe('positive');
      expect(typeof result[0].confidence).toBe('number');
      expect(typeof result[0].relevance).toBe('number');
    });

    it('여러 파일 문맥 분석', () => {
      const files = [
        {
          id: 'file1',
          name: 'test1.txt',
          type: 'text',
        },
        {
          id: 'file2',
          name: 'test2.pdf',
          type: 'pdf',
          keywords: ['키워드1'],
          confidence: 0.8,
        },
      ];

      const result = service.analyzeFileContexts(files);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    it('기본값이 없는 파일 처리', () => {
      const files = [
        {
          id: 'file1',
          name: 'test1.txt',
          type: 'text',
        },
      ];

      const result = service.analyzeFileContexts(files);

      expect(result[0].summary).toBe('파일 분석 완료');
      expect(Array.isArray(result[0].keywords)).toBe(true);
      expect(result[0].sentiment).toBe('neutral');
      expect(result[0].confidence).toBe(0.8);
    });

    it('빈 파일 배열 처리', () => {
      const result = service.analyzeFileContexts([]);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('문맥 기반 인사이트 생성', () => {
    it('기본 인사이트 생성', () => {
      const fileContexts = [
        {
          fileName: 'test1.txt',
          keywords: ['키워드1', '키워드2', '키워드3'],
          sentiment: 'positive',
          confidence: 0.9,
          summary: '테스트 요약입니다.',
          relevance: 0.85,
        },
      ];

      const result = service.generateContextualInsights(fileContexts);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(typeof result[0]).toBe('string');
    });

    it('여러 파일 컨텍스트 인사이트', () => {
      const fileContexts = [
        {
          fileName: 'test1.txt',
          keywords: ['키워드1'],
          sentiment: 'positive',
          confidence: 0.9,
          summary: '요약1',
          relevance: 0.8,
        },
        {
          fileName: 'test2.txt',
          keywords: ['키워드2'],
          sentiment: 'neutral',
          confidence: 0.85,
          summary: '요약2',
          relevance: 0.75,
        },
      ];

      const result = service.generateContextualInsights(fileContexts);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    it('빈 컨텍스트 배열 처리', () => {
      const result = service.generateContextualInsights([]);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('글쓰기 템플릿', () => {
    it('템플릿 조회', () => {
      const templates = service.getWritingTemplates();

      expect(templates).toBeDefined();
      expect(typeof templates).toBe('object');
      expect(templates.persuasive).toBeDefined();
      expect(templates.informative).toBeDefined();
      expect(templates.emotional).toBeDefined();
      expect(templates.logical).toBeDefined();
      expect(templates.storytelling).toBeDefined();
    });

    it('persuasive 템플릿 확인', () => {
      const templates = service.getWritingTemplates();

      expect(templates.persuasive).toBeDefined();
      expect(templates.persuasive.formal).toBeDefined();
      expect(templates.persuasive.friendly).toBeDefined();
      expect(templates.persuasive.authoritative).toBeDefined();
    });

    it('informative 템플릿 확인', () => {
      const templates = service.getWritingTemplates();

      expect(templates.informative).toBeDefined();
      expect(templates.informative.formal).toBeDefined();
      expect(templates.informative.friendly).toBeDefined();
      expect(templates.informative.authoritative).toBeDefined();
    });

    it('모든 템플릿 타입 확인', () => {
      const templates = service.getWritingTemplates();

      const expectedTypes = [
        'persuasive',
        'informative',
        'emotional',
        'logical',
        'storytelling',
      ];

      expectedTypes.forEach((type) => {
        expect(templates[type]).toBeDefined();
        expect(templates[type].formal).toBeDefined();
        expect(templates[type].friendly).toBeDefined();
        expect(templates[type].authoritative).toBeDefined();
      });
    });
  });
});

