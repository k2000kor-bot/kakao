/**
 * newsService 서비스 테스트
 * 뉴스 검색 및 댓글 분석 서비스 테스트
 * @jest-environment jsdom
 */
/* eslint-disable jest/no-conditional-expect */

import { newsService, NEWS_API_KEY_STORAGE_KEY } from '../newsService';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';

// fetch 모킹
installJestFetchMock();

function partialFetchResponse(init: Record<string, unknown>): Response {
  return init as unknown as Response;
}

// localStorage 모킹
const mockLocalStorage: { [key: string]: string } = {};

beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        mockLocalStorage[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete mockLocalStorage[key];
      }),
      clear: jest.fn(() => {
        Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
      }),
    },
    writable: true,
    configurable: true,
  });
});

describe('newsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(global.fetch).mockClear();
    Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
    
    // API 키 설정
    newsService.setAPIKey('test-api-key');
  });

  describe('setAPIKey', () => {
    it('API 키를 설정할 수 있어야 함', () => {
      newsService.setAPIKey('new-api-key');
      
      expect(localStorage.setItem).toHaveBeenCalledWith(NEWS_API_KEY_STORAGE_KEY, 'new-api-key');
    });
  });

  describe('searchNews', () => {
    it('뉴스를 검색할 수 있어야 함', async () => {
      const mockResponse = {
        articles: [
          {
            title: '테스트 기사',
            content: '테스트 내용입니다.',
            description: '테스트 설명',
            url: 'https://example.com/article1',
            source: { name: 'Test Source' },
            publishedAt: '2025-01-27T10:00:00Z',
            author: 'Test Author',
          },
        ],
        totalResults: 1,
      };

      jest.mocked(global.fetch).mockResolvedValueOnce(partialFetchResponse({
        ok: true,
        json: async () => mockResponse,
      }));

      const result = await newsService.searchNews('테스트');

      expect(result).toHaveProperty('articles');
      expect(result).toHaveProperty('totalResults');
      expect(result).toHaveProperty('query');
      expect(result).toHaveProperty('searchTime');
      expect(result.articles).toHaveLength(1);
      expect(result.articles[0].title).toBe('테스트 기사');
    });

    it('API 키가 없으면 에러를 던져야 함', async () => {
      // API 키 제거
      const serviceWithoutKey = new (newsService.constructor as new () => typeof newsService)();
      (serviceWithoutKey as unknown as { apiKey: string }).apiKey = '';

      await expect(serviceWithoutKey.searchNews('테스트')).rejects.toThrow(
        '뉴스 API 키가 설정되지 않았습니다.'
      );
    });

    it('HTTP 에러 응답을 처리해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce(partialFetchResponse({
        ok: false,
        status: 404,
      }));

      await expect(newsService.searchNews('테스트')).rejects.toThrow(
        '뉴스 검색 실패: 404'
      );
    });

    it('언어와 정렬 옵션을 사용할 수 있어야 함', async () => {
      const mockResponse = {
        articles: [],
        totalResults: 0,
      };

      jest.mocked(global.fetch).mockResolvedValueOnce(partialFetchResponse({
        ok: true,
        json: async () => mockResponse,
      }));

      await newsService.searchNews('테스트', 'en', 'popularity');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('language=en')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('sortBy=popularity')
      );
    });

    it('기사의 요약과 감정을 생성해야 함', async () => {
      const mockResponse = {
        articles: [
          {
            title: '좋은 기사',
            content: '정말 좋은 내용입니다. 훌륭한 정보가 많습니다.',
            url: 'https://example.com/article1',
            source: { name: 'Test Source' },
            publishedAt: '2025-01-27T10:00:00Z',
          },
        ],
        totalResults: 1,
      };

      jest.mocked(global.fetch).mockResolvedValueOnce(partialFetchResponse({
        ok: true,
        json: async () => mockResponse,
      }));

      const result = await newsService.searchNews('테스트');

      expect(result.articles[0].summary).toBeDefined();
      expect(result.articles[0].sentiment).toBeDefined();
      expect(['positive', 'negative', 'neutral']).toContain(result.articles[0].sentiment);
    });
  });

  describe('analyzeComments', () => {
    it('댓글을 분석할 수 있어야 함', async () => {
      const analysis = await newsService.analyzeComments('article-1');

      expect(analysis).toHaveProperty('totalComments');
      expect(analysis).toHaveProperty('sentimentDistribution');
      expect(analysis).toHaveProperty('topKeywords');
      expect(analysis).toHaveProperty('trendingTopics');
      expect(analysis).toHaveProperty('averageSentiment');
      expect(analysis).toHaveProperty('engagementMetrics');
    });

    it('감정 분포를 올바르게 계산해야 함', async () => {
      const analysis = await newsService.analyzeComments('article-1');

      expect(analysis.sentimentDistribution).toHaveProperty('positive');
      expect(analysis.sentimentDistribution).toHaveProperty('negative');
      expect(analysis.sentimentDistribution).toHaveProperty('neutral');
      
      const total = analysis.sentimentDistribution.positive +
                   analysis.sentimentDistribution.negative +
                   analysis.sentimentDistribution.neutral;
      expect(total).toBe(analysis.totalComments);
    });

    it('키워드를 추출해야 함', async () => {
      const analysis = await newsService.analyzeComments('article-1');

      expect(Array.isArray(analysis.topKeywords)).toBe(true);
      analysis.topKeywords.forEach(keyword => {
        expect(keyword).toHaveProperty('keyword');
        expect(keyword).toHaveProperty('frequency');
      });
    });

    it('참여 메트릭을 계산해야 함', async () => {
      const analysis = await newsService.analyzeComments('article-1');

      expect(analysis.engagementMetrics).toHaveProperty('totalLikes');
      expect(analysis.engagementMetrics).toHaveProperty('averageLikes');
      expect(analysis.engagementMetrics).toHaveProperty('totalReplies');
      
      expect(analysis.engagementMetrics.totalLikes).toBeGreaterThanOrEqual(0);
      expect(analysis.engagementMetrics.averageLikes).toBeGreaterThanOrEqual(0);
    });

    it('평균 감정 점수를 계산해야 함', async () => {
      const analysis = await newsService.analyzeComments('article-1');

      expect(typeof analysis.averageSentiment).toBe('number');
      expect(analysis.averageSentiment).toBeGreaterThanOrEqual(-100);
      expect(analysis.averageSentiment).toBeLessThanOrEqual(100);
    });
  });

  describe('getTrendingNews', () => {
    it('트렌딩 뉴스를 가져올 수 있어야 함', async () => {
      const mockResponse = {
        articles: [
          {
            title: '트렌딩 기사',
            content: '트렌딩 내용',
            url: 'https://example.com/trending1',
            source: { name: 'Trending Source' },
            publishedAt: '2025-01-27T10:00:00Z',
            author: 'Trending Author',
          },
        ],
      };

      jest.mocked(global.fetch).mockResolvedValueOnce(partialFetchResponse({
        ok: true,
        json: async () => mockResponse,
      }));

      const result = await newsService.getTrendingNews('technology');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('트렌딩 기사');
    });

    it('카테고리를 지정할 수 있어야 함', async () => {
      const mockResponse = { articles: [] };

      jest.mocked(global.fetch).mockResolvedValueOnce(partialFetchResponse({
        ok: true,
        json: async () => mockResponse,
      }));

      await newsService.getTrendingNews('business');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('category=business')
      );
    });

    it('API 키가 없으면 에러를 던져야 함', async () => {
      const serviceWithoutKey = new (newsService.constructor as new () => typeof newsService)();
      (serviceWithoutKey as unknown as { apiKey: string }).apiKey = '';

      await expect(serviceWithoutKey.getTrendingNews()).rejects.toThrow(
        '뉴스 API 키가 설정되지 않았습니다.'
      );
    });

    it('HTTP 에러 응답을 처리해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce(partialFetchResponse({
        ok: false,
        status: 500,
      }));

      await expect(newsService.getTrendingNews()).rejects.toThrow(
        '트렌딩 뉴스 가져오기 실패: 500'
      );
    });
  });

  describe('private 메서드 테스트 (public 메서드를 통한 간접 테스트)', () => {
    it('generateSummary가 요약을 생성해야 함', async () => {
      const mockResponse = {
        articles: [
          {
            title: '긴 기사',
            content: '첫 번째 문장입니다. 두 번째 문장입니다. 세 번째 문장입니다.',
            url: 'https://example.com/article1',
            source: { name: 'Test Source' },
            publishedAt: '2025-01-27T10:00:00Z',
          },
        ],
        totalResults: 1,
      };

      jest.mocked(global.fetch).mockResolvedValueOnce(partialFetchResponse({
        ok: true,
        json: async () => mockResponse,
      }));

      const result = await newsService.searchNews('테스트');

      expect(result.articles[0].summary).toBeDefined();
      expect(result.articles[0].summary?.length).toBeLessThanOrEqual(
        result.articles[0].content.length
      );
    });

    it('analyzeSentiment가 감정을 분석해야 함', async () => {
      const positiveMockResponse = {
        articles: [
          {
            title: '좋은 뉴스',
            content: '성공적인 혁신이 있었습니다.',
            url: 'https://example.com/article1',
            source: { name: 'Test Source' },
            publishedAt: '2025-01-27T10:00:00Z',
          },
        ],
        totalResults: 1,
      };

      jest.mocked(global.fetch).mockResolvedValueOnce(partialFetchResponse({
        ok: true,
        json: async () => positiveMockResponse,
      }));

      const result = await newsService.searchNews('테스트');

      expect(result.articles[0].sentiment).toBeDefined();
      expect(['positive', 'negative', 'neutral']).toContain(
        result.articles[0].sentiment
      );
    });

    it('extractKeywords가 키워드를 추출해야 함', async () => {
      const analysis = await newsService.analyzeComments('article-1');

      expect(Array.isArray(analysis.topKeywords)).toBe(true);
      if (analysis.topKeywords.length > 0) {
        expect(analysis.topKeywords[0].keyword).toBeDefined();
        expect(analysis.topKeywords[0].frequency).toBeGreaterThan(0);
      }
    });
  });
});

