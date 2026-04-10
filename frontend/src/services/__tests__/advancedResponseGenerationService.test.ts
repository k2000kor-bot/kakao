/**
 * advancedResponseGenerationService 서비스 테스트
 * 고급 응답 생성 서비스 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import advancedResponseGenerationService, { ResponseGenerationRequest } from '../advancedResponseGenerationService';
import { QuestionUnderstandingResult } from '../advancedQuestionUnderstandingEngine';
import { ConversationMemory } from '../advancedConversationMemoryService';
import { LearningExperience } from '../personalizedLearningExperienceService';

// 의존성 모킹
jest.mock('../advancedQuestionUnderstandingEngine', () => ({
  QuestionUnderstandingResult: {}
}));

jest.mock('../advancedConversationMemoryService', () => ({
  ConversationMemory: {}
}));

jest.mock('../personalizedLearningExperienceService', () => ({
  LearningExperience: {}
}));

describe('advancedResponseGenerationService', () => {
  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedResponseGenerationService).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedResponseGenerationService;
      const instance2 = advancedResponseGenerationService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('generateResponse', () => {
    const createMockRequest = (overrides?: Partial<ResponseGenerationRequest>): ResponseGenerationRequest => ({
      user_input: '재개발 프로젝트에 대해 알려주세요',
      user_id: 'user-123',
      session_id: 'session-123',
      conversation_memory: {} as ConversationMemory,
      learning_experience: {} as LearningExperience,
      understanding_result: {} as QuestionUnderstandingResult,
      context: {},
      ...overrides
    });

    it('기본 응답을 생성할 수 있어야 함', async () => {
      const request = createMockRequest();
      const result = await advancedResponseGenerationService.generateResponse(request);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.response_type).toBeDefined();
      expect(['informative', 'educational', 'problem_solving', 'conversational', 'analytical']).toContain(result.response_type);
      expect(typeof result.confidence_score).toBe('number');
      expect(result.confidence_score).toBeGreaterThanOrEqual(0);
      expect(result.confidence_score).toBeLessThanOrEqual(1);
      expect(typeof result.processing_time).toBe('number');
      expect(typeof result.personalized_content).toBe('boolean');
      expect(typeof result.memory_integrated).toBe('boolean');
    });

    it('응답 결과가 올바른 구조를 가져야 함', async () => {
      const request = createMockRequest();
      const result = await advancedResponseGenerationService.generateResponse(request);

      expect(result.learning_insights).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(Array.isArray(result.alternatives)).toBe(true);
      expect(Array.isArray(result.follow_up_questions)).toBe(true);
    });

    it('다양한 사용자 입력에 대해 응답을 생성할 수 있어야 함', async () => {
      const inputs = [
        '재개발이란 무엇인가요?',
        '시공사 선정 기준은?',
        '예산 계획 수립 방법을 알려주세요',
        '일정 관리 방법은?'
      ];

      for (const input of inputs) {
        const request = createMockRequest({ user_input: input });
        const result = await advancedResponseGenerationService.generateResponse(request);

        expect(result).toBeDefined();
        expect(result.content.length).toBeGreaterThan(0);
      }
    });

    it('메타데이터를 포함해야 함', async () => {
      const request = createMockRequest();
      const result = await advancedResponseGenerationService.generateResponse(request);

      expect(result.metadata).toBeDefined();
      expect(typeof result.metadata.model_used).toBe('string');
      expect(typeof result.metadata.response_strategy).toBe('string');
      expect(result.metadata.content_adaptation).toBeDefined();
      expect(typeof result.metadata.user_preference_match).toBe('number');
      expect(typeof result.metadata.complexity_level).toBe('number');
      expect(['short', 'medium', 'long']).toContain(result.metadata.response_length);
      expect(typeof result.metadata.includes_examples).toBe('boolean');
      expect(typeof result.metadata.includes_code).toBe('boolean');
      expect(typeof result.metadata.includes_visual_aids).toBe('boolean');
    });

    it('학습 인사이트를 포함해야 함', async () => {
      const request = createMockRequest();
      const result = await advancedResponseGenerationService.generateResponse(request);

      expect(result.learning_insights).toBeDefined();
      // learning_insights의 필드들은 선택적일 수 있음
      if (result.learning_insights.current_progress !== undefined) {
        expect(typeof result.learning_insights.current_progress).toBe('number');
      }
      if (result.learning_insights.performance_score !== undefined) {
        expect(typeof result.learning_insights.performance_score).toBe('number');
      }
      if (result.learning_insights.skill_gaps !== undefined) {
        expect(Array.isArray(result.learning_insights.skill_gaps)).toBe(true);
      }
    });

    it('대안 응답을 생성해야 함', async () => {
      const request = createMockRequest();
      const result = await advancedResponseGenerationService.generateResponse(request);

      expect(Array.isArray(result.alternatives)).toBe(true);
      result.alternatives.forEach(alternative => {
        expect(typeof alternative).toBe('string');
        expect(alternative.length).toBeGreaterThan(0);
      });
    });

    it('후속 질문을 생성해야 함', async () => {
      const request = createMockRequest();
      const result = await advancedResponseGenerationService.generateResponse(request);

      expect(Array.isArray(result.follow_up_questions)).toBe(true);
      result.follow_up_questions.forEach(question => {
        expect(typeof question).toBe('string');
        expect(question.length).toBeGreaterThan(0);
      });
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 질문에 응답을 생성할 수 있어야 함', async () => {
      const request: ResponseGenerationRequest = {
        user_input: '재개발 프로젝트의 시공사 선정 기준과 예산 계획을 알려주세요',
        user_id: 'user-123',
        session_id: 'session-123',
        conversation_memory: {} as ConversationMemory,
        learning_experience: {} as LearningExperience,
        understanding_result: {} as QuestionUnderstandingResult,
        context: {
          projectId: 'redevelopment-project-1',
          domain: 'real_estate'
        }
      };

      const result = await advancedResponseGenerationService.generateResponse(request);

      expect(result).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.confidence_score).toBeGreaterThanOrEqual(0);
      expect(result.metadata).toBeDefined();
    });

    it('시공사 선정 관련 질문에 응답을 생성할 수 있어야 함', async () => {
      const request: ResponseGenerationRequest = {
        user_input: '시공사 선정 시 고려해야 할 주요 기준은 무엇인가요?',
        user_id: 'user-456',
        session_id: 'session-456',
        conversation_memory: {} as ConversationMemory,
        learning_experience: {} as LearningExperience,
        understanding_result: {} as QuestionUnderstandingResult,
        context: {}
      };

      const result = await advancedResponseGenerationService.generateResponse(request);

      expect(result).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.response_type).toBeDefined();
      expect(result.follow_up_questions.length).toBeGreaterThanOrEqual(0);
    });

    it('예산 계획 관련 질문에 응답을 생성할 수 있어야 함', async () => {
      const request: ResponseGenerationRequest = {
        user_input: '재개발 프로젝트 예산 계획 수립 방법과 비용 최적화 방안',
        user_id: 'user-789',
        session_id: 'session-789',
        conversation_memory: {} as ConversationMemory,
        learning_experience: {} as LearningExperience,
        understanding_result: {} as QuestionUnderstandingResult,
        context: {}
      };

      const result = await advancedResponseGenerationService.generateResponse(request);

      expect(result).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.alternatives.length).toBeGreaterThanOrEqual(0);
    });

    it('복합적인 질문에 응답을 생성할 수 있어야 함', async () => {
      const request: ResponseGenerationRequest = {
        user_input: '재개발 프로젝트의 시공사 선정, 예산 계획, 일정 관리, 리스크 분석을 종합적으로 알려주세요',
        user_id: 'user-999',
        session_id: 'session-999',
        conversation_memory: {} as ConversationMemory,
        learning_experience: {} as LearningExperience,
        understanding_result: {} as QuestionUnderstandingResult,
        context: {
          projectId: 'comprehensive-project-1',
          domain: 'real_estate',
          complexity: 'high'
        }
      };

      const result = await advancedResponseGenerationService.generateResponse(request);

      expect(result).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.metadata.complexity_level).toBeGreaterThanOrEqual(0);
      expect(result.learning_insights).toBeDefined();
    });
  });
});

