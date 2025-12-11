/**
 * webSearchIntegrationService 서비스 테스트
 * 웹 검색 통합 서비스 테스트
 */

import webSearchIntegrationService, { IntegratedResponse } from '../webSearchIntegrationService';
import { NLPAnalysisResult } from '../advancedNLPEngine';

// errorLogger 모킹
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('webSearchIntegrationService', () => {
  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(webSearchIntegrationService).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = webSearchIntegrationService;
      const instance2 = webSearchIntegrationService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('searchAndSynthesize', () => {
    it('기본 검색 쿼리로 통합 응답을 생성할 수 있어야 함', async () => {
      const nlpAnalysis: NLPAnalysisResult = {
        intent: 'question',
        topics: ['재개발'],
        sentiment: { label: 'neutral', score: 0.0, confidence: 0.8 },
        entities: [],
        language: 'ko',
        complexity: 0.5,
        keywords: ['재개발', '프로젝트'],
        context: {
          conversation_flow: 'question',
          user_expertise_level: 'intermediate',
          domain: 'general',
          urgency: 'medium',
          formality: 'professional'
        },
        response_strategy: { detail_level: 'detailed', tone: 'professional' }
      };

      const response = await webSearchIntegrationService.searchAndSynthesize(
        '재개발 프로젝트 절차',
        nlpAnalysis
      );

      expect(response).toBeDefined();
      expect(response.primary_answer).toBeDefined();
      expect(response.confidence_score).toBeGreaterThanOrEqual(0);
      expect(response.sources_used).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(response.supporting_evidence)).toBe(true);
      expect(Array.isArray(response.related_topics)).toBe(true);
      expect(Array.isArray(response.follow_up_questions)).toBe(true);
    });

    it('컨텍스트가 포함된 검색을 수행할 수 있어야 함', async () => {
      const nlpAnalysis: NLPAnalysisResult = {
        intent: 'question',
        topics: ['시공사'],
        sentiment: { label: 'neutral', score: 0.0, confidence: 0.8 },
        entities: [],
        language: 'ko',
        complexity: 0.5,
        keywords: ['시공사', '선정'],
        context: {
          conversation_flow: 'question',
          user_expertise_level: 'intermediate',
          domain: 'general',
          urgency: 'medium',
          formality: 'professional'
        },
        response_strategy: { detail_level: 'detailed', tone: 'professional' }
      };

      const context = {
        domain: '부동산',
        user_expertise: 'intermediate'
      };

      const response = await webSearchIntegrationService.searchAndSynthesize(
        '시공사 선정 기준',
        nlpAnalysis,
        context
      );

      expect(response).toBeDefined();
      expect(response.primary_answer).toBeDefined();
    });

    it('다양한 의도에 대해 검색을 수행할 수 있어야 함', async () => {
      const nlpAnalysis: NLPAnalysisResult = {
        intent: 'analysis',
        topics: ['예산'],
        sentiment: { label: 'neutral', score: 0.0, confidence: 0.8 },
        entities: [],
        language: 'ko',
        complexity: 0.5,
        keywords: ['예산', '계획'],
        context: {
          conversation_flow: 'analysis',
          user_expertise_level: 'intermediate',
          domain: 'general',
          urgency: 'medium',
          formality: 'professional'
        },
        response_strategy: { detail_level: 'detailed', tone: 'professional' }
      };

      const response = await webSearchIntegrationService.searchAndSynthesize(
        '예산 계획 분석',
        nlpAnalysis
      );

      expect(response).toBeDefined();
      expect(response.primary_answer).toBeDefined();
    });

    it('복잡한 쿼리에 대해 검색을 수행할 수 있어야 함', async () => {
      const nlpAnalysis: NLPAnalysisResult = {
        intent: 'question',
        topics: ['재개발', '시공사', '예산'],
        sentiment: { label: 'neutral', score: 0.0, confidence: 0.8 },
        entities: [],
        language: 'ko',
        complexity: 0.7,
        keywords: ['재개발', '시공사', '예산', '프로젝트'],
        context: {
          conversation_flow: 'question',
          user_expertise_level: 'advanced',
          domain: 'general',
          urgency: 'medium',
          formality: 'professional'
        },
        response_strategy: { detail_level: 'detailed', tone: 'professional' }
      };

      const response = await webSearchIntegrationService.searchAndSynthesize(
        '재개발 프로젝트의 시공사 선정 기준과 예산 계획 수립 방법을 종합적으로 알려주세요',
        nlpAnalysis
      );

      expect(response).toBeDefined();
      expect(response.primary_answer.length).toBeGreaterThan(0);
      expect(response.synthesis_quality).toBeGreaterThanOrEqual(0);
    });

    it('기술적 쿼리에 대해 검색을 수행할 수 있어야 함', async () => {
      const nlpAnalysis: NLPAnalysisResult = {
        intent: 'question',
        topics: ['기술'],
        sentiment: { label: 'neutral', score: 0.0, confidence: 0.8 },
        entities: [],
        language: 'ko',
        complexity: 0.5,
        keywords: ['React', 'hooks'],
        context: {
          conversation_flow: 'question',
          user_expertise_level: 'intermediate',
          domain: 'web_development',
          urgency: 'low',
          formality: 'professional'
        },
        response_strategy: { detail_level: 'detailed', tone: 'technical' }
      };

      const response = await webSearchIntegrationService.searchAndSynthesize(
        'React hooks 사용법',
        nlpAnalysis
      );

      expect(response).toBeDefined();
      expect(response.primary_answer).toBeDefined();
    });

    it('뉴스 관련 쿼리에 대해 검색을 수행할 수 있어야 함', async () => {
      const nlpAnalysis: NLPAnalysisResult = {
        intent: 'question',
        topics: ['뉴스'],
        sentiment: { label: 'neutral', score: 0.0, confidence: 0.8 },
        entities: [],
        language: 'ko',
        complexity: 0.5,
        keywords: ['부동산', '뉴스'],
        context: {
          conversation_flow: 'question',
          user_expertise_level: 'intermediate',
          domain: 'general',
          urgency: 'medium',
          formality: 'professional'
        },
        response_strategy: { detail_level: 'detailed', tone: 'professional' }
      };

      const response = await webSearchIntegrationService.searchAndSynthesize(
        '최신 부동산 뉴스',
        nlpAnalysis
      );

      expect(response).toBeDefined();
      expect(response.primary_answer).toBeDefined();
    });

    it('빈 쿼리에 대해 기본 응답을 반환해야 함', async () => {
      const nlpAnalysis: NLPAnalysisResult = {
        intent: 'question',
        topics: [],
        sentiment: { label: 'neutral', score: 0.0, confidence: 0.8 },
        entities: [],
        language: 'ko',
        complexity: 0.3,
        keywords: [],
        context: {
          conversation_flow: 'question',
          user_expertise_level: 'beginner',
          domain: 'general',
          urgency: 'low',
          formality: 'casual'
        },
        response_strategy: { detail_level: 'brief', tone: 'friendly' }
      };

      const response = await webSearchIntegrationService.searchAndSynthesize(
        '',
        nlpAnalysis
      );

      expect(response).toBeDefined();
      expect(response.primary_answer).toBeDefined();
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 종합 검색을 수행할 수 있어야 함', async () => {
      const nlpAnalysis: NLPAnalysisResult = {
        intent: 'question',
        topics: ['재개발', '프로젝트'],
        sentiment: { label: 'neutral', score: 0.0, confidence: 0.8 },
        entities: [{ text: '재개발', label: 'project', confidence: 0.9, start: 0, end: 3 }],
        language: 'ko',
        complexity: 0.7,
        keywords: ['재개발', '프로젝트', '시공사', '예산'],
        context: {
          conversation_flow: 'question',
          user_expertise_level: 'advanced',
          domain: 'general',
          urgency: 'medium',
          formality: 'professional'
        },
        response_strategy: { detail_level: 'detailed', tone: 'professional' }
      };

      const context = {
        domain: '부동산 개발',
        user_expertise: 'advanced'
      };

      const response = await webSearchIntegrationService.searchAndSynthesize(
        '재개발 프로젝트의 전체적인 절차와 시공사 선정 기준, 예산 계획 수립 방법을 종합적으로 알려주세요',
        nlpAnalysis,
        context
      );

      expect(response).toBeDefined();
      expect(response.primary_answer.length).toBeGreaterThan(0);
      expect(response.confidence_score).toBeGreaterThanOrEqual(0);
      expect(response.sources_used).toBeGreaterThanOrEqual(0);
      expect(response.supporting_evidence.length).toBeGreaterThanOrEqual(0);
      expect(response.related_topics.length).toBeGreaterThanOrEqual(0);
    });

    it('시공사 선정 관련 전문 검색을 수행할 수 있어야 함', async () => {
      const nlpAnalysis: NLPAnalysisResult = {
        intent: 'analysis',
        topics: ['시공사', '선정'],
        sentiment: { label: 'neutral', score: 0.0, confidence: 0.8 },
        entities: [],
        language: 'ko',
        complexity: 0.6,
        keywords: ['시공사', '선정', '기준'],
        context: {
          conversation_flow: 'analysis',
          user_expertise_level: 'advanced',
          domain: 'general',
          urgency: 'medium',
          formality: 'professional'
        },
        response_strategy: { detail_level: 'detailed', tone: 'professional' }
      };

      const response = await webSearchIntegrationService.searchAndSynthesize(
        '시공사 선정 시 고려해야 할 주요 기준과 평가 방법',
        nlpAnalysis
      );

      expect(response).toBeDefined();
      expect(response.primary_answer.length).toBeGreaterThan(0);
      expect(response.synthesis_quality).toBeGreaterThanOrEqual(0);
    });

    it('예산 계획 관련 실용적 검색을 수행할 수 있어야 함', async () => {
      const nlpAnalysis: NLPAnalysisResult = {
        intent: 'question',
        topics: ['예산', '계획'],
        sentiment: { label: 'neutral', score: 0.0, confidence: 0.8 },
        entities: [],
        language: 'ko',
        complexity: 0.6,
        keywords: ['예산', '계획', '비용'],
        context: {
          conversation_flow: 'question',
          user_expertise_level: 'intermediate',
          domain: 'general',
          urgency: 'medium',
          formality: 'professional'
        },
        response_strategy: { detail_level: 'detailed', tone: 'professional' }
      };

      const response = await webSearchIntegrationService.searchAndSynthesize(
        '재개발 프로젝트 예산 계획 수립 방법과 비용 최적화 방안',
        nlpAnalysis
      );

      expect(response).toBeDefined();
      expect(response.primary_answer.length).toBeGreaterThan(0);
      expect(response.follow_up_questions.length).toBeGreaterThanOrEqual(0);
    });
  });
});

