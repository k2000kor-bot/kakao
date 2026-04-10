/**
 * ConversationalAnalysisService 테스트
 */
/// <reference types="jest" />
/* eslint-disable jest/no-conditional-expect */

import {
  ConversationalAnalysisService,
  conversationalAnalysisService,
} from '../conversationalAnalysisService';

// 의존성 모킹
jest.mock('../advancedTextAnalysisService', () => ({
  advancedTextAnalysisService: {
    analyzeText: jest.fn(),
    analyzeAndManipulateText: jest.fn(),
  },
}));

jest.mock('../integratedWritingService', () => ({
  integratedWritingService: {
    processUnifiedWritingRequest: jest.fn(),
  },
}));

jest.mock('../masterWritingEngine', () => ({
  masterWritingEngine: {
    generateContent: jest.fn(),
  },
}));

jest.mock('../politicalWritingEngine', () => ({
  politicalWritingEngine: {
    generateContent: jest.fn(),
  },
}));

jest.mock('../generationWritingEngine', () => ({
  generationWritingEngine: {
    generateContent: jest.fn(),
  },
}));

jest.mock('../stanceWritingEngine', () => ({
  stanceWritingEngine: {
    generateContent: jest.fn(),
  },
}));

jest.mock('../ultimateStyleCloningService', () => ({
  ultimateStyleCloningService: {
    cloneStyle: jest.fn(),
  },
}));

const originalFetch = globalThis.fetch;

/** v1 분석 API POST에 대한 스텁 — Jest 환경에서 실 네트워크·console.error 방지 */
function installAnalysisFetchStub(): void {
  const tendencyPayload = {
    success: true,
    results: {
      participants_analysis: {
        total_participants: 10,
        active_participants: 8,
        tendency_distribution: { positive: 40, neutral: 35, negative: 25 },
        key_participants: [{ name: '참가자A', tendency: '긍정', influence_score: 7 }],
      },
      message_patterns: { question_ratio: 15, opinion_ratio: 45, fact_sharing_ratio: 40 },
      communication_style: { formal_ratio: 25, informal_ratio: 75, emoji_usage: 12 },
    },
  };
  const biasPayload = {
    success: true,
    results: {
      overall_bias: { bias_score: 4, bias_direction: 'slightly_positive', confidence: 0.82 },
      company_analysis: {
        bias_scores: { 시공사A: { score: 5, mentions: 2, sentiment: '중립' } },
      },
      promotional_content: {
        detected_promotions: 0,
        promotional_ratio: 2,
        common_themes: ['품질'],
      },
      opposition_analysis: { opposition_messages: 1, common_concerns: ['일정'] },
    },
  };
  const opinionPayload = {
    success: true,
    results: {
      trend_overview: {
        overall_sentiment: 'positive',
        sentiment_score: 7,
        trend_direction: 'improving',
      },
      timeline_analysis: {
        periods: [{ period: '최근', sentiment: 6, key_events: ['안내'] }],
      },
      influential_factors: [{ factor: '소통', impact: 7, type: 'positive' }],
    },
  };
  const integratedPayload = {
    success: true,
    confidence_score: 0.84,
    results: {
      cross_analysis: {
        key_insights: ['종합 인사이트'],
        risk_factors: [{ factor: '일정', level: '중', probability: 0.25 }],
        correlation_analysis: {
          tendency_bias_correlation: 0.42,
          participant_influence_correlation: 0.55,
        },
      },
    },
    recommendations: ['권장 조치'],
  };
  const analysisStatusPayload = {
    room_id: 'default',
    status: 'active',
    last_analysis: Date.now(),
    total_messages: 120,
    analyzed_messages: 90,
    analysis_progress: 75,
  };

  globalThis.fetch = jest.fn((input: RequestInfo | URL) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof Request
          ? input.url
          : String(input);
    let payload: unknown = { success: false };
    if (url.includes('kakao-tendency')) payload = tendencyPayload;
    else if (url.includes('construction-bias')) payload = biasPayload;
    else if (url.includes('opinion-trend')) payload = opinionPayload;
    else if (url.includes('integrated-analysis')) payload = integratedPayload;
    else if (url.includes('analysis-status')) payload = analysisStatusPayload;
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => payload,
    } as Response);
  }) as unknown as typeof fetch;
}

describe('ConversationalAnalysisService', () => {
  let service: ConversationalAnalysisService;

  beforeEach(() => {
    installAnalysisFetchStub();
    const analyzeStub = {
      generatedTexts: {
        descriptiveAnalysis: '스텁 분석 본문입니다.',
        researchSummary: '스텁 연구 요약입니다.',
        alternatives: {},
      },
      analysisResult: {
        methodology: '질적 분석',
        findings: ['발견 A'],
        insights: ['통찰 A'],
        limitations: ['한계 A'],
        recommendations: ['권장 A'],
      },
      expertAssessment: { credibility: 0.9 },
      contextualFactors: {},
    };
    const adv = require('../advancedTextAnalysisService').advancedTextAnalysisService;
    adv.analyzeAndManipulateText.mockImplementation(async (req: { outputType?: string }) => {
      if (req.outputType === 'analysis') return null;
      return analyzeStub;
    });
    service = new ConversationalAnalysisService();
    const iws = require('../integratedWritingService').integratedWritingService;
    iws.processUnifiedWritingRequest.mockClear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(ConversationalAnalysisService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(conversationalAnalysisService).toBeDefined();
    });
  });

  describe('메시지 처리', () => {
    it('성향 분석 요청 처리', async () => {
      const request = {
        message: '참여자들의 성향을 분석해주세요',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      expect(response.type).toBeDefined();
      expect(response.content).toBeDefined();
    });

    it('편향 분석 요청 처리', async () => {
      const request = {
        message: '시공사에 대한 편향을 분석해주세요',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      expect(response.type).toBeDefined();
    });

    it('의견 분석 요청 처리', async () => {
      const request = {
        message: '의견을 분석해주세요',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      expect(response.type).toBeDefined();
    });

    it('통합 분석 요청 처리', async () => {
      const request = {
        message: '통합적으로 분석해주세요',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      expect(response.type).toBeDefined();
    });

    it('상태 조회 요청 처리', async () => {
      const response = await service.processMessage({
        message: '현재 분석 상태 어때?',
      });
      expect(response).toBeDefined();
      expect(response.type).toBe('information');
      expect(response.content).toContain('분석 상태');
    });

    it('요약 요청 처리', async () => {
      const request = {
        message: '요약해주세요',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      expect(response.type).toBeDefined();
    });

    it('텍스트 조작 요청 처리', async () => {
      const request = {
        message: '텍스트를 수정해주세요',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      expect(response.type).toBeDefined();
    });

    it('서술적 분석 요청 처리', async () => {
      const request = {
        message: '서술적으로 분석해주세요',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      expect(response.type).toBeDefined();
    });

    it('연구 분석 요청 처리', async () => {
      const request = {
        message: '연구자 관점에서 분석해주세요',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      expect(response.type).toBeDefined();
    });

    it('일반 질문 처리', async () => {
      const request = {
        message: '안녕하세요',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      expect(response.type).toBeDefined();
      expect(response.content).toBeDefined();
    });

    it('컨텍스트 포함 요청 처리', async () => {
      const request = {
        message: '분석해주세요',
        roomId: 'room-1',
        context: {
          previousMessages: ['이전 메시지'],
        },
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      expect(response.type).toBeDefined();
    });

    it('글쓰기 요청에서 context.pipelineExtras를 통합 글쓰기로 넘기고 응답에 에코한다', async () => {
      const integratedWritingService =
        require('../integratedWritingService').integratedWritingService;
      const pe = { qaPipelineTraceId: 't-conv' };
      integratedWritingService.processUnifiedWritingRequest.mockResolvedValue({
        primary_content: {
          title: '제목',
          content: '본문',
          word_count: 1,
          character_count: 2,
          estimated_reading_time: 1,
        },
        quality_analysis: {
          style_compliance: 0.8,
          readability_score: 0.8,
          engagement_level: 0.8,
          professional_quality: 0.8,
          target_audience_fit: 0.8,
        },
        metadata: {
          processing_time: 1,
          engines_used: ['adaptiveWritingEngine'],
          confidence_score: 0.85,
          revision_recommendations: [],
          pipelineExtras: pe,
        },
      });

      const response = await service.processMessage({
        message: '재개발 보고서 써줘',
        context: { pipelineExtras: pe },
      });

      expect(integratedWritingService.processUnifiedWritingRequest).toHaveBeenCalled();
      const writingReq = integratedWritingService.processUnifiedWritingRequest.mock.calls[0][0];
      expect(writingReq.pipelineExtras).toBe(pe);
      expect(response.pipelineExtras).toBe(pe);
    });

    it('글쓰기 요청에서 최상위 pipelineExtras가 context와 병합되며 요청 쪽 필드가 우선한다', async () => {
      const integratedWritingService =
        require('../integratedWritingService').integratedWritingService;
      integratedWritingService.processUnifiedWritingRequest.mockResolvedValue({
        primary_content: {
          title: '제목',
          content: '본문',
          word_count: 1,
          character_count: 2,
          estimated_reading_time: 1,
        },
        quality_analysis: {
          style_compliance: 0.8,
          readability_score: 0.8,
          engagement_level: 0.8,
          professional_quality: 0.8,
          target_audience_fit: 0.8,
        },
        metadata: {
          processing_time: 1,
          engines_used: ['adaptiveWritingEngine'],
          confidence_score: 0.85,
          revision_recommendations: [],
          pipelineExtras: {
            qaPipelineTraceId: 'from-request',
            pipelineGenerationPhase: 'draft',
          },
        },
      });

      await service.processMessage({
        message: '재개발 보고서 써줘',
        pipelineExtras: { qaPipelineTraceId: 'from-request' },
        context: {
          pipelineExtras: {
            qaPipelineTraceId: 'from-context',
            pipelineGenerationPhase: 'draft',
          },
        },
      });

      const writingReq = integratedWritingService.processUnifiedWritingRequest.mock.calls[0][0];
      expect(writingReq.pipelineExtras?.qaPipelineTraceId).toBe('from-request');
      expect(writingReq.pipelineExtras?.pipelineGenerationPhase).toBe('draft');
    });
  });

  describe('응답 구조', () => {
    it('응답에 필수 필드 포함', async () => {
      const request = {
        message: '분석해주세요',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      expect(response.type).toBeDefined();
      expect(response.content).toBeDefined();
      expect(typeof response.content).toBe('string');
    });

    it('제안사항 포함 가능', async () => {
      const request = {
        message: '분석해주세요',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      if (response.suggestions) {
        expect(Array.isArray(response.suggestions)).toBe(true);
      }
    });

    it('후속 질문 포함 가능', async () => {
      const request = {
        message: '분석해주세요',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      if (response.followUpQuestions) {
        expect(Array.isArray(response.followUpQuestions)).toBe(true);
      }
    });
  });
});

