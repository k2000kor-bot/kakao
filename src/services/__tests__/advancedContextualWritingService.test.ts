/**
 * advancedContextualWritingService 서비스 테스트
 * 고급 문맥 글쓰기 서비스 테스트
 */

import advancedContextualWritingService, {
  AdvancedWritingRequest
} from '../advancedContextualWritingService';

// fetch 모킹
global.fetch = jest.fn();

describe('advancedContextualWritingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAdvancedContextualWriting', () => {
    it('고급 문맥 글쓰기를 생성할 수 있어야 함', async () => {
      const mockResponse = {
        success: true,
        content: '생성된 글쓰기 내용',
        confidence: 0.9,
        persuasionScore: 0.85,
        readability: 0.8,
        emotionalImpact: 0.75,
        contextRelevance: 0.9,
        knowledgeIntegration: 0.85,
        semanticCoherence: 0.9,
        suggestions: ['제안 1', '제안 2'],
        usedContexts: ['context-1'],
        generatedInsights: ['인사이트 1'],
        semanticConnections: ['연결 1']
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const request: AdvancedWritingRequest = {
        writingType: 'contextual',
        targetAudience: 'expert',
        writingGoal: 'educate',
        tone: 'analytical',
        length: 'medium',
        keywords: ['재개발', '프로젝트'],
        context: '재개발 프로젝트 관련',
        fileContexts: []
      };

      const result = await advancedContextualWritingService.generateAdvancedContextualWriting(
        'session-1',
        request
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
      expect(typeof result.confidence).toBe('number');
      expect(typeof result.persuasionScore).toBe('number');
      expect(typeof result.readability).toBe('number');
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(Array.isArray(result.usedContexts)).toBe(true);
    });

    it('API 호출 실패 시 실패 응답을 반환해야 함', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const request: AdvancedWritingRequest = {
        writingType: 'contextual',
        targetAudience: 'expert',
        writingGoal: 'educate',
        tone: 'analytical',
        length: 'medium',
        keywords: [],
        context: '',
        fileContexts: []
      };

      const result = await advancedContextualWritingService.generateAdvancedContextualWriting(
        'session-1',
        request
      );

      expect(result.success).toBe(false);
      expect(result.content).toBe('');
      expect(result.error).toBeDefined();
    });

    it('네트워크 오류 시 실패 응답을 반환해야 함', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const request: AdvancedWritingRequest = {
        writingType: 'contextual',
        targetAudience: 'expert',
        writingGoal: 'educate',
        tone: 'analytical',
        length: 'medium',
        keywords: [],
        context: '',
        fileContexts: []
      };

      const result = await advancedContextualWritingService.generateAdvancedContextualWriting(
        'session-1',
        request
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('analyzeDeepContext', () => {
    it('심층 문맥 분석을 수행할 수 있어야 함', async () => {
      const mockResponse = {
        success: true,
        deepAnalysis: [
          {
            fileId: 'file-1',
            fileName: 'test.pdf',
            semanticAnalysis: {
              topics: ['재개발', '프로젝트'],
              entities: ['대우건설'],
              relationships: ['관계1'],
              themes: ['테마1'],
              tone: 'professional',
              complexity: 0.7
            },
            knowledgeGraph: {
              concepts: ['개념1'],
              connections: ['연결1'],
              insights: ['인사이트1']
            }
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await advancedContextualWritingService.analyzeDeepContext(
        'session-1',
        [{ fileId: 'file-1', fileName: 'test.pdf' }]
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.deepAnalysis).toBeDefined();
    });

    it('오류 발생 시 실패 응답을 반환해야 함', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await advancedContextualWritingService.analyzeDeepContext(
        'session-1',
        []
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('calculateContextRelevance', () => {
    it('문맥 관련성을 계산할 수 있어야 함', () => {
      const fileContexts = [
        { keywords: ['재개발', '프로젝트'] },
        { keywords: ['시공사', '선정'] }
      ];

      const relevance = advancedContextualWritingService.calculateContextRelevance(
        fileContexts,
        '재개발 프로젝트 시공사 선정'
      );

      expect(typeof relevance).toBe('number');
      expect(relevance).toBeGreaterThanOrEqual(0);
      expect(relevance).toBeLessThanOrEqual(1);
    });

    it('빈 파일 컨텍스트에 대해 0을 반환해야 함', () => {
      const relevance = advancedContextualWritingService.calculateContextRelevance(
        [],
        '재개발 프로젝트'
      );

      expect(relevance).toBe(0);
    });
  });

  describe('calculateKnowledgeIntegration', () => {
    it('지식 통합도를 계산할 수 있어야 함', () => {
      const fileContexts = [
        {
          knowledgeGraph: {
            concepts: ['개념1', '개념2'],
            connections: ['연결1']
          }
        },
        {
          knowledgeGraph: {
            concepts: ['개념3'],
            connections: ['연결2', '연결3']
          }
        }
      ];

      const integration = advancedContextualWritingService.calculateKnowledgeIntegration(fileContexts);

      expect(typeof integration).toBe('number');
      expect(integration).toBeGreaterThanOrEqual(0);
      expect(integration).toBeLessThanOrEqual(1);
    });

    it('빈 파일 컨텍스트에 대해 0을 반환해야 함', () => {
      const integration = advancedContextualWritingService.calculateKnowledgeIntegration([]);

      expect(integration).toBe(0);
    });
  });

  describe('calculateSemanticCoherence', () => {
    it('시맨틱 일관성을 계산할 수 있어야 함', () => {
      const fileContexts = [
        {
          semanticAnalysis: {
            tone: 'professional',
            themes: ['테마1'],
            topics: ['토픽1']
          }
        },
        {
          semanticAnalysis: {
            tone: 'professional',
            themes: ['테마1'],
            topics: ['토픽2']
          }
        }
      ];

      const coherence = advancedContextualWritingService.calculateSemanticCoherence(fileContexts);

      expect(typeof coherence).toBe('number');
      expect(coherence).toBeGreaterThanOrEqual(0);
      expect(coherence).toBeLessThanOrEqual(1);
    });

    it('빈 파일 컨텍스트에 대해 0을 반환해야 함', () => {
      const coherence = advancedContextualWritingService.calculateSemanticCoherence([]);

      expect(coherence).toBe(0);
    });
  });

  describe('analyzeAdvancedWritingQuality', () => {
    it('글쓰기 품질을 분석할 수 있어야 함', () => {
      const result = advancedContextualWritingService.analyzeAdvancedWritingQuality(
        '테스트 콘텐츠',
        0.8,
        0.75,
        0.9
      );

      expect(result).toBeDefined();
      expect(typeof result.overallScore).toBe('number');
      expect(Array.isArray(result.strengths)).toBe(true);
      expect(Array.isArray(result.weaknesses)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('높은 관련성일 때 강점을 인식해야 함', () => {
      const result = advancedContextualWritingService.analyzeAdvancedWritingQuality(
        '콘텐츠',
        0.8,
        0.6,
        0.7
      );

      expect(result.strengths.length).toBeGreaterThan(0);
      expect(result.strengths.some(s => s.includes('문맥'))).toBe(true);
    });

    it('낮은 통합도일 때 약점을 인식해야 함', () => {
      const result = advancedContextualWritingService.analyzeAdvancedWritingQuality(
        '콘텐츠',
        0.6,
        0.5,
        0.7
      );

      expect(result.weaknesses.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('generateContextualInsights', () => {
    it('문맥 인사이트를 생성할 수 있어야 함', () => {
      const fileContexts = [
        {
          semanticAnalysis: {
            topics: ['재개발'],
            entities: ['대우건설']
          },
          knowledgeGraph: {
            insights: ['인사이트1']
          }
        }
      ];

      const insights = advancedContextualWritingService.generateContextualInsights(fileContexts);

      expect(Array.isArray(insights)).toBe(true);
    });

    it('빈 파일 컨텍스트에 대해 안내 메시지를 반환해야 함', () => {
      const insights = advancedContextualWritingService.generateContextualInsights([]);

      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
      expect(insights.some(insight => insight.includes('분석할 파일'))).toBe(true);
    });
  });

  describe('getAdvancedWritingTemplates', () => {
    it('고급 글쓰기 템플릿을 가져올 수 있어야 함', () => {
      const templates = advancedContextualWritingService.getAdvancedWritingTemplates();

      expect(templates).toBeDefined();
      expect(typeof templates).toBe('object');
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 문맥 글쓰기를 생성할 수 있어야 함', async () => {
      const mockResponse = {
        success: true,
        content: '재개발 프로젝트 관련 글쓰기 내용',
        confidence: 0.9,
        persuasionScore: 0.85,
        readability: 0.8,
        emotionalImpact: 0.75,
        contextRelevance: 0.9,
        knowledgeIntegration: 0.85,
        semanticCoherence: 0.9,
        suggestions: [],
        usedContexts: [],
        generatedInsights: [],
        semanticConnections: []
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const request: AdvancedWritingRequest = {
        writingType: 'contextual',
        targetAudience: 'expert',
        writingGoal: 'analyze',
        tone: 'analytical',
        length: 'long',
        keywords: ['재개발', '프로젝트', '시공사', '선정'],
        context: '개포우성7차 재개발 프로젝트 시공사 선정',
        fileContexts: [
          {
            fileId: 'file-1',
            fileName: 'redevelopment-project.pdf',
            keywords: ['재개발', '프로젝트']
          }
        ]
      };

      const result = await advancedContextualWritingService.generateAdvancedContextualWriting(
        'session-1',
        request
      );

      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
      expect(result.contextRelevance).toBeGreaterThan(0);
    });
  });
});

