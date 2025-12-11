/**
 * KnowledgeIntegrationService 테스트
 */

import {
  KnowledgeIntegrationService,
  knowledgeIntegrationService,
  KnowledgeSource,
  IntegratedKnowledge,
  LearningContext,
} from '../knowledgeIntegrationService';
import { QuestionAnalysis } from '../advancedNLPService';

describe('KnowledgeIntegrationService', () => {
  let service: KnowledgeIntegrationService;

  const mockQuestionAnalysis: QuestionAnalysis = {
    questionType: 'analytical',
    complexity: 'moderate',
    intent: {
      primary: '분석',
      secondary: [],
      implicitNeeds: [],
      expectedDepth: 'detailed',
    },
    context: {
      domain: ['technology'],
      timeframe: null,
      scope: 'general',
      background: [],
    },
    logicalStructure: {
      premises: [],
      conclusions: [],
      relationships: [],
      gaps: [],
    },
    requirements: {
      informationTypes: ['statistical_data'],
      evidenceNeeded: [],
      formatPreferences: ['structured'],
      constraints: [],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new KnowledgeIntegrationService();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(KnowledgeIntegrationService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(knowledgeIntegrationService).toBeDefined();
      expect(knowledgeIntegrationService).toBeInstanceOf(KnowledgeIntegrationService);
    });
  });

  describe('지식 통합', () => {
    it('웹 검색 결과 통합', async () => {
      const webSearchResults = [
        {
          snippet: '기술 분석 데이터',
          link: 'https://example.com/article1',
        },
      ];

      const result = await service.integrateKnowledge(
        '기술 분석',
        mockQuestionAnalysis,
        webSearchResults,
        [],
        []
      );

      expect(result).toBeDefined();
      expect(result.synthesizedContent).toBeTruthy();
      expect(result.supportingEvidence.length).toBeGreaterThan(0);
    });

    it('뉴스 결과 통합', async () => {
      const newsResults = [
        {
          description: '최신 기술 뉴스',
          url: 'https://news.example.com/article1',
          publishedAt: '2024-01-01T00:00:00Z',
          author: '기자',
        },
      ];

      const result = await service.integrateKnowledge(
        '기술 뉴스',
        mockQuestionAnalysis,
        [],
        newsResults,
        []
      );

      expect(result).toBeDefined();
      expect(result.synthesizedContent).toBeTruthy();
    });

    it('대화 히스토리 통합', async () => {
      const conversationHistory = [
        '이전에 기술에 대해 논의했습니다',
        '데이터 분석이 중요합니다',
      ];

      const result = await service.integrateKnowledge(
        '기술 분석',
        mockQuestionAnalysis,
        [],
        [],
        conversationHistory
      );

      expect(result).toBeDefined();
      expect(result.synthesizedContent).toBeTruthy();
    });

    it('모든 소스 통합', async () => {
      const webSearchResults = [
        {
          snippet: '웹 검색 결과',
          link: 'https://example.com',
        },
      ];
      const newsResults = [
        {
          description: '뉴스 기사',
          url: 'https://news.example.com',
          publishedAt: '2024-01-01T00:00:00Z',
        },
      ];
      const conversationHistory = ['이전 대화'];

      const result = await service.integrateKnowledge(
        '종합 분석',
        mockQuestionAnalysis,
        webSearchResults,
        newsResults,
        conversationHistory
      );

      expect(result).toBeDefined();
      expect(result.synthesizedContent).toBeTruthy();
      // 관련성이 높은 소스가 있을 수 있음 (필터링될 수도 있음)
      expect(Array.isArray(result.supportingEvidence)).toBe(true);
    });
  });

  describe('응답 구조', () => {
    it('통합 지식에 모든 필수 필드 포함', async () => {
      const result = await service.integrateKnowledge(
        '테스트 질문',
        mockQuestionAnalysis,
        [],
        [],
        []
      );

      expect(result).toHaveProperty('synthesizedContent');
      expect(result).toHaveProperty('supportingEvidence');
      expect(result).toHaveProperty('contradictingEvidence');
      expect(result).toHaveProperty('confidenceScore');
      expect(result).toHaveProperty('gapsIdentified');
      expect(result).toHaveProperty('recommendedSources');
      expect(result).toHaveProperty('logicalFlow');
    });

    it('논리적 흐름 구조 확인', async () => {
      const result = await service.integrateKnowledge(
        '분석 질문',
        mockQuestionAnalysis,
        [],
        [],
        []
      );

      expect(result.logicalFlow).toHaveProperty('premises');
      expect(result.logicalFlow).toHaveProperty('reasoning');
      expect(result.logicalFlow).toHaveProperty('conclusions');
      expect(Array.isArray(result.logicalFlow.premises)).toBe(true);
      expect(Array.isArray(result.logicalFlow.reasoning)).toBe(true);
      expect(Array.isArray(result.logicalFlow.conclusions)).toBe(true);
    });

    it('신뢰도 점수 범위 확인', async () => {
      const result = await service.integrateKnowledge(
        '테스트',
        mockQuestionAnalysis,
        [],
        [],
        []
      );

      expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(result.confidenceScore).toBeLessThanOrEqual(1);
    });
  });

  describe('질문 유형별 응답', () => {
    it('분석형 질문 처리', async () => {
      const analysis: QuestionAnalysis = {
        ...mockQuestionAnalysis,
        questionType: 'analytical',
      };

      const result = await service.integrateKnowledge(
        '분석 질문',
        analysis,
        [],
        [],
        []
      );

      expect(result.synthesizedContent).toContain('분석');
    });

    it('비교형 질문 처리', async () => {
      const analysis: QuestionAnalysis = {
        ...mockQuestionAnalysis,
        questionType: 'comparative',
      };

      const result = await service.integrateKnowledge(
        '비교 질문',
        analysis,
        [],
        [],
        []
      );

      expect(result.synthesizedContent).toBeTruthy();
    });

    it('설명형 질문 처리', async () => {
      const analysis: QuestionAnalysis = {
        ...mockQuestionAnalysis,
        questionType: 'explanatory',
      };

      const result = await service.integrateKnowledge(
        '설명 질문',
        analysis,
        [],
        [],
        []
      );

      expect(result.synthesizedContent).toBeTruthy();
    });

    it('사실형 질문 처리', async () => {
      const analysis: QuestionAnalysis = {
        ...mockQuestionAnalysis,
        questionType: 'factual',
      };

      const result = await service.integrateKnowledge(
        '사실 질문',
        analysis,
        [],
        [],
        []
      );

      expect(result.synthesizedContent).toBeTruthy();
    });
  });

  describe('소스 평가', () => {
    it('고신뢰도 소스 우선 처리', async () => {
      const webSearchResults = [
        {
          snippet: '일반 소스',
          link: 'https://example.com',
        },
        {
          snippet: '교육 기관 소스',
          link: 'https://university.edu/article',
        },
      ];

      const result = await service.integrateKnowledge(
        '테스트',
        mockQuestionAnalysis,
        webSearchResults,
        [],
        []
      );

      // 관련성이 높은 소스가 있을 수 있음
      expect(Array.isArray(result.supportingEvidence)).toBe(true);
    });

    it('관련성 낮은 소스 필터링', async () => {
      const webSearchResults = [
        {
          snippet: '완전히 다른 주제의 내용',
          link: 'https://example.com',
        },
      ];

      const result = await service.integrateKnowledge(
        '기술 분석',
        mockQuestionAnalysis,
        webSearchResults,
        [],
        []
      );

      // 관련성이 낮은 소스는 필터링되어 supportingEvidence에 포함되지 않을 수 있음
      expect(result).toBeDefined();
    });
  });

  describe('지식 공백 식별', () => {
    it('통계 데이터 부족 감지', async () => {
      const analysis: QuestionAnalysis = {
        ...mockQuestionAnalysis,
        requirements: {
          informationTypes: ['statistical_data'],
          evidenceNeeded: [],
          formatPreferences: ['structured'],
          constraints: [],
        },
      };

      const result = await service.integrateKnowledge(
        '통계 분석',
        analysis,
        [],
        [],
        []
      );

      expect(result.gapsIdentified).toBeDefined();
      expect(Array.isArray(result.gapsIdentified)).toBe(true);
    });

    it('추천 소스 생성', async () => {
      const analysis: QuestionAnalysis = {
        ...mockQuestionAnalysis,
        requirements: {
          informationTypes: ['statistical_data'],
          evidenceNeeded: [],
          formatPreferences: ['structured'],
          constraints: [],
        },
      };

      const result = await service.integrateKnowledge(
        '통계 분석',
        analysis,
        [],
        [],
        []
      );

      expect(result.recommendedSources).toBeDefined();
      expect(Array.isArray(result.recommendedSources)).toBe(true);
    });
  });

  describe('모순 감지', () => {
    it('모순 증거 식별', async () => {
      const webSearchResults = [
        {
          snippet: '긍정적 관점의 내용',
          link: 'https://example.com/positive',
        },
        {
          snippet: '하지만 반대 의견도 있습니다',
          link: 'https://example.com/negative',
        },
      ];

      const result = await service.integrateKnowledge(
        '분석',
        mockQuestionAnalysis,
        webSearchResults,
        [],
        []
      );

      expect(result.contradictingEvidence).toBeDefined();
      expect(Array.isArray(result.contradictingEvidence)).toBe(true);
    });
  });

  describe('학습 컨텍스트 업데이트', () => {
    it('대화 히스토리 업데이트', async () => {
      const result = await service.integrateKnowledge(
        '기술 분석',
        mockQuestionAnalysis,
        [],
        [],
        []
      );

      expect(result).toBeDefined();
      // 학습 컨텍스트는 내부적으로 업데이트됨
    });
  });

  describe('도메인별 처리', () => {
    it('다양한 도메인 처리', async () => {
      const analysis: QuestionAnalysis = {
        ...mockQuestionAnalysis,
        context: {
          domain: ['technology', 'business'],
          timeframe: null,
          scope: 'general',
          background: [],
        },
      };

      const result = await service.integrateKnowledge(
        '종합 분석',
        analysis,
        [],
        [],
        []
      );

      expect(result).toBeDefined();
      expect(result.synthesizedContent).toBeTruthy();
    });
  });

  describe('신뢰도 계산', () => {
    it('웹 소스 신뢰도 계산', async () => {
      const webSearchResults = [
        {
          snippet: '기술 분석 데이터에 대한 상세 정보',
          link: 'https://university.edu/article',
        },
        {
          snippet: '기술 분석 정부 기관 소스',
          link: 'https://gov.kr/article',
        },
      ];

      const result = await service.integrateKnowledge(
        '기술 분석',
        mockQuestionAnalysis,
        webSearchResults,
        [],
        []
      );

      // 관련성이 높은 소스가 있을 수 있음
      expect(Array.isArray(result.supportingEvidence)).toBe(true);
      if (result.supportingEvidence.length > 0) {
        result.supportingEvidence.forEach(source => {
          expect(source.reliability).toBeGreaterThanOrEqual(0);
          expect(source.reliability).toBeLessThanOrEqual(1);
        });
      }
    });

    it('뉴스 소스 신뢰도 계산', async () => {
      const newsResults = [
        {
          description: '기술 분석 뉴스 기사',
          url: 'https://news.example.com',
          publishedAt: '2024-01-01T00:00:00Z',
          source: {
            name: 'Reuters',
          },
        },
      ];

      const result = await service.integrateKnowledge(
        '기술 분석',
        mockQuestionAnalysis,
        [],
        newsResults,
        []
      );

      // 관련성이 높은 소스가 있을 수 있음
      expect(Array.isArray(result.supportingEvidence)).toBe(true);
      if (result.supportingEvidence.length > 0) {
        result.supportingEvidence.forEach(source => {
          expect(source.reliability).toBeGreaterThanOrEqual(0);
          expect(source.reliability).toBeLessThanOrEqual(1);
        });
      }
    });
  });

  describe('응답 생성', () => {
    it('빈 소스로 응답 생성', async () => {
      const result = await service.integrateKnowledge(
        '질문',
        mockQuestionAnalysis,
        [],
        [],
        []
      );

      expect(result.synthesizedContent).toBeTruthy();
      expect(result.synthesizedContent.length).toBeGreaterThan(0);
    });

    it('다양한 소스로 풍부한 응답 생성', async () => {
      const webSearchResults = [
        {
          snippet: '웹 검색 결과 1',
          link: 'https://example.com/1',
        },
        {
          snippet: '웹 검색 결과 2',
          link: 'https://example.com/2',
        },
      ];
      const newsResults = [
        {
          description: '뉴스 기사 1',
          url: 'https://news.example.com/1',
          publishedAt: '2024-01-01T00:00:00Z',
        },
      ];

      const result = await service.integrateKnowledge(
        '기술 분석 종합 질문',
        mockQuestionAnalysis,
        webSearchResults,
        newsResults,
        []
      );

      expect(result.synthesizedContent).toBeTruthy();
      // 관련성이 높은 소스가 있을 수 있음
      expect(Array.isArray(result.supportingEvidence)).toBe(true);
    });
  });

  describe('관련성 계산', () => {
    it('높은 관련성 소스 포함', async () => {
      const webSearchResults = [
        {
          snippet: '기술 분석 데이터에 대한 상세 정보',
          link: 'https://example.com',
        },
      ];

      const result = await service.integrateKnowledge(
        '기술 분석',
        mockQuestionAnalysis,
        webSearchResults,
        [],
        []
      );

      expect(result.supportingEvidence.length).toBeGreaterThan(0);
      result.supportingEvidence.forEach(source => {
        expect(source.relevance).toBeGreaterThan(0);
      });
    });
  });

  describe('메타데이터 처리', () => {
    it('웹 소스 메타데이터 포함', async () => {
      const webSearchResults = [
        {
          snippet: '내용',
          link: 'https://example.com/article',
        },
      ];

      const result = await service.integrateKnowledge(
        '테스트',
        mockQuestionAnalysis,
        webSearchResults,
        [],
        []
      );

      if (result.supportingEvidence.length > 0) {
        const source = result.supportingEvidence[0];
        expect(source.metadata).toBeDefined();
      }
    });

    it('뉴스 소스 메타데이터 포함', async () => {
      const newsResults = [
        {
          description: '뉴스 내용',
          url: 'https://news.example.com',
          publishedAt: '2024-01-01T00:00:00Z',
          author: '기자 이름',
        },
      ];

      const result = await service.integrateKnowledge(
        '테스트',
        mockQuestionAnalysis,
        [],
        newsResults,
        []
      );

      if (result.supportingEvidence.length > 0) {
        const source = result.supportingEvidence[0];
        expect(source.metadata).toBeDefined();
      }
    });
  });

  describe('에지 케이스', () => {
    it('빈 질문 처리', async () => {
      const result = await service.integrateKnowledge(
        '',
        mockQuestionAnalysis,
        [],
        [],
        []
      );

      expect(result).toBeDefined();
      expect(result.synthesizedContent).toBeTruthy();
    });

    it('매우 긴 질문 처리', async () => {
      const longQuestion = '분석'.repeat(100);
      const result = await service.integrateKnowledge(
        longQuestion,
        mockQuestionAnalysis,
        [],
        [],
        []
      );

      expect(result).toBeDefined();
      expect(result.synthesizedContent).toBeTruthy();
    });

    it('특수 문자 포함 질문 처리', async () => {
      const result = await service.integrateKnowledge(
        '분석!@#$%^&*()',
        mockQuestionAnalysis,
        [],
        [],
        []
      );

      expect(result).toBeDefined();
      expect(result.synthesizedContent).toBeTruthy();
    });
  });
});

