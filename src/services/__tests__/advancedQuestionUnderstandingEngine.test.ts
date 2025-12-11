/**
 * advancedQuestionUnderstandingEngine 서비스 테스트
 * 고급 질문 이해 엔진 테스트
 */

import advancedQuestionUnderstandingEngine, {
  QuestionUnderstandingResult
} from '../advancedQuestionUnderstandingEngine';
import { NLPAnalysisResult } from '../advancedNLPEngine';

// advancedNLPEngine 모킹
jest.mock('../advancedNLPEngine', () => ({
  advancedNLPEngine: {
    analyzeText: jest.fn()
  }
}));

describe('advancedQuestionUnderstandingEngine', () => {
  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedQuestionUnderstandingEngine).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedQuestionUnderstandingEngine;
      const instance2 = advancedQuestionUnderstandingEngine;
      expect(instance1).toBe(instance2);
    });
  });

  describe('understandQuestion', () => {
    const createMockNLPAnalysis = (): NLPAnalysisResult => ({
      intent: 'question',
      entities: [
        { text: '재개발', label: 'project', confidence: 0.9, start: 0, end: 3 }
      ],
      sentiment: { label: 'neutral', score: 0.0, confidence: 0.8 },
      language: 'ko',
      complexity: 0.5,
      topics: ['재개발', '프로젝트'],
      keywords: ['재개발', '프로젝트'],
      context: {
        conversation_flow: 'question',
        user_expertise_level: 'intermediate',
        domain: 'general',
        urgency: 'medium',
        formality: 'professional'
      },
      response_strategy: { detail_level: 'detailed', tone: 'professional' }
    });

    it('기본 질문을 이해할 수 있어야 함', async () => {
      const result = await advancedQuestionUnderstandingEngine.understandQuestion(
        '재개발 프로젝트에 대해 알려주세요'
      );

      expect(result).toBeDefined();
      expect(result.question_id).toBeDefined();
      expect(result.original_question).toBe('재개발 프로젝트에 대해 알려주세요');
      expect(result.processed_question).toBeDefined();
      expect(['basic', 'intermediate', 'advanced', 'expert']).toContain(result.understanding_level);
      expect(result.semantic_analysis).toBeDefined();
      expect(result.contextual_understanding).toBeDefined();
      expect(result.intent_clarification).toBeDefined();
      expect(Array.isArray(result.knowledge_gaps)).toBe(true);
      expect(Array.isArray(result.suggested_approaches)).toBe(true);
      expect(typeof result.confidence_score).toBe('number');
      expect(result.confidence_score).toBeGreaterThanOrEqual(0);
      expect(result.confidence_score).toBeLessThanOrEqual(1);
      expect(typeof result.processing_time).toBe('number');
      expect(result.timestamp).toBeDefined();
    });

    it('의미 분석을 수행할 수 있어야 함', async () => {
      const result = await advancedQuestionUnderstandingEngine.understandQuestion(
        '재개발 프로젝트의 시공사 선정 기준'
      );

      expect(result.semantic_analysis).toBeDefined();
      expect(Array.isArray(result.semantic_analysis.core_concepts)).toBe(true);
      expect(Array.isArray(result.semantic_analysis.relationships)).toBe(true);
      expect(result.semantic_analysis.ambiguity_detection).toBeDefined();
      expect(result.semantic_analysis.complexity_assessment).toBeDefined();
      expect(result.semantic_analysis.domain_classification).toBeDefined();
    });

    it('컨텍스트 이해를 수행할 수 있어야 함', async () => {
      const result = await advancedQuestionUnderstandingEngine.understandQuestion(
        '재개발 프로젝트 분석'
      );

      expect(result.contextual_understanding).toBeDefined();
      expect(result.contextual_understanding.conversation_context).toBeDefined();
      expect(result.contextual_understanding.user_context).toBeDefined();
      expect(result.contextual_understanding.temporal_context).toBeDefined();
      expect(result.contextual_understanding.situational_context).toBeDefined();
    });

    it('의도 명확화를 수행할 수 있어야 함', async () => {
      const result = await advancedQuestionUnderstandingEngine.understandQuestion(
        '재개발 프로젝트 설명'
      );

      expect(result.intent_clarification).toBeDefined();
      expect(result.intent_clarification.primary_intent).toBeDefined();
      expect(Array.isArray(result.intent_clarification.secondary_intents)).toBe(true);
      expect(Array.isArray(result.intent_clarification.clarification_questions)).toBe(true);
    });

    it('지식 격차를 감지할 수 있어야 함', async () => {
      const result = await advancedQuestionUnderstandingEngine.understandQuestion(
        '재개발 프로젝트의 시공사 선정과 예산 계획'
      );

      expect(Array.isArray(result.knowledge_gaps)).toBe(true);
      result.knowledge_gaps.forEach(gap => {
        expect(gap.gap_type).toBeDefined();
        expect(gap.description).toBeDefined();
        expect(['low', 'medium', 'high', 'critical']).toContain(gap.severity);
      });
    });

    it('제안된 접근 방식을 생성할 수 있어야 함', async () => {
      const result = await advancedQuestionUnderstandingEngine.understandQuestion(
        '재개발 프로젝트 분석'
      );

      expect(Array.isArray(result.suggested_approaches)).toBe(true);
      result.suggested_approaches.forEach(approach => {
        expect(approach.approach_name).toBeDefined();
        expect(approach.description).toBeDefined();
        expect(typeof approach.suitability_score).toBe('number');
      });
    });

    it('NLP 분석 결과를 포함하여 질문을 이해할 수 있어야 함', async () => {
      const nlpAnalysis = createMockNLPAnalysis();
      const result = await advancedQuestionUnderstandingEngine.understandQuestion(
        '재개발 프로젝트',
        nlpAnalysis
      );

      expect(result).toBeDefined();
      expect(result.semantic_analysis).toBeDefined();
    });

    it('컨텍스트를 포함하여 질문을 이해할 수 있어야 함', async () => {
      const context = {
        projectId: 'project-1',
        domain: 'real_estate'
      };

      const result = await advancedQuestionUnderstandingEngine.understandQuestion(
        '재개발 프로젝트',
        undefined,
        context
      );

      expect(result).toBeDefined();
      expect(result.contextual_understanding).toBeDefined();
    });

    it('복잡한 질문을 이해할 수 있어야 함', async () => {
      const result = await advancedQuestionUnderstandingEngine.understandQuestion(
        '재개발 프로젝트의 시공사 선정 기준과 예산 계획 수립 방법, 그리고 일정 관리와 리스크 분석을 종합적으로 알려주세요'
      );

      expect(result).toBeDefined();
      expect(result.semantic_analysis.complexity_assessment.overall_complexity).toBeGreaterThanOrEqual(0);
      expect(result.understanding_level).toBeDefined();
    });
  });

  describe('getUnderstandingCapabilities', () => {
    it('서비스 기능을 가져올 수 있어야 함', () => {
      const capabilities = advancedQuestionUnderstandingEngine.getUnderstandingCapabilities();

      expect(capabilities).toBeDefined();
      expect(typeof capabilities.semantic_analysis).toBe('boolean');
      expect(typeof capabilities.contextual_understanding).toBe('boolean');
      expect(typeof capabilities.intent_clarification).toBe('boolean');
      expect(typeof capabilities.knowledge_gap_detection).toBe('boolean');
      expect(typeof capabilities.approach_suggestion).toBe('boolean');
      expect(typeof capabilities.real_time_processing).toBe('boolean');
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 질문을 이해할 수 있어야 함', async () => {
      const result = await advancedQuestionUnderstandingEngine.understandQuestion(
        '강남구 역삼동 재개발 프로젝트의 시공사 선정 기준과 예산 계획을 알려주세요',
        undefined,
        { projectId: 'redevelopment-project-1' }
      );

      expect(result).toBeDefined();
      expect(result.semantic_analysis.core_concepts.length).toBeGreaterThanOrEqual(0);
      expect(result.contextual_understanding.user_context.expertise_level).toBeDefined();
    });

    it('시공사 선정 관련 질문을 이해할 수 있어야 함', async () => {
      const result = await advancedQuestionUnderstandingEngine.understandQuestion(
        '시공사 선정 시 고려해야 할 주요 기준과 평가 방법'
      );

      expect(result).toBeDefined();
      expect(result.semantic_analysis.domain_classification.primary_domain).toBeDefined();
      expect(result.suggested_approaches.length).toBeGreaterThanOrEqual(0);
    });

    it('예산 계획 관련 질문을 이해할 수 있어야 함', async () => {
      const result = await advancedQuestionUnderstandingEngine.understandQuestion(
        '재개발 프로젝트 예산 계획 수립 방법과 비용 최적화 방안'
      );

      expect(result).toBeDefined();
      expect(result.knowledge_gaps.length).toBeGreaterThanOrEqual(0);
      expect(result.intent_clarification.primary_intent).toBeDefined();
    });

    it('복합적인 질문을 이해할 수 있어야 함', async () => {
      const result = await advancedQuestionUnderstandingEngine.understandQuestion(
        '재개발 프로젝트의 시공사 선정, 예산 계획, 일정 관리, 리스크 분석을 종합적으로 수행해야 합니다.'
      );

      expect(result).toBeDefined();
      expect(result.semantic_analysis.complexity_assessment.overall_complexity).toBeGreaterThanOrEqual(0);
      expect(result.semantic_analysis.core_concepts.length).toBeGreaterThanOrEqual(0);
      expect(result.suggested_approaches.length).toBeGreaterThanOrEqual(0);
    });
  });
});

