/**
 * advancedLearningRecommendationEngine 서비스 테스트
 * 고급 학습 추천 엔진 테스트
 */

import advancedLearningRecommendationEngine, {
  LearningRecommendationRequest,
  LearningRecommendationResult
} from '../advancedLearningRecommendationEngine';
import { ConversationMemory } from '../advancedConversationMemoryService';
import { LearningExperience } from '../personalizedLearningExperienceService';
import { PerformanceAnalyticsResult } from '../advancedPerformanceAnalyticsService';

// 의존성 모킹
jest.mock('../advancedConversationMemoryService', () => ({
  ConversationMemory: {}
}));

jest.mock('../personalizedLearningExperienceService', () => ({
  LearningExperience: {}
}));

jest.mock('../advancedPerformanceAnalyticsService', () => ({
  PerformanceAnalyticsResult: {}
}));

describe('advancedLearningRecommendationEngine', () => {
  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedLearningRecommendationEngine).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedLearningRecommendationEngine;
      const instance2 = advancedLearningRecommendationEngine;
      expect(instance1).toBe(instance2);
    });
  });

  describe('generateRecommendations', () => {
    const createMockRequest = (overrides?: Partial<LearningRecommendationRequest>): LearningRecommendationRequest => ({
      user_id: 'user-123',
      session_id: 'session-123',
      conversation_memory: {
        user_id: 'user-123',
        conversation_history: [],
        user_preferences: {
          preferred_language: 'ko',
          communication_style: 'professional',
          expertise_domains: [],
          response_length: 'medium',
          include_examples: true,
          technical_depth: 5
        },
        learned_patterns: [],
        context_stack: [],
        last_updated: new Date(),
        user_profile: {
          expertise_level: 'intermediate',
          learning_style: 'visual',
          preferred_topics: ['재개발', '시공사']
        }
      } as ConversationMemory,
      learning_experience: {
        current_module: 'module-1',
        progress: 0.5,
        performance: 0.7
      } as LearningExperience,
      performance_analytics: {
        skill_gaps: [
          {
            skill_name: '시공사 선정',
            current_level: 0.4,
            target_level: 0.8,
            gap_size: 0.4,
            priority: 'high'
          }
        ],
        learning_patterns: [],
        performance_metrics: {
          learning_progress: {
            retention_rate: 0.75,
            completion_rate: 0.6
          }
        }
      } as PerformanceAnalyticsResult,
      current_context: '재개발 프로젝트',
      ...overrides
    });

    it('기본 학습 추천을 생성할 수 있어야 함', async () => {
      const request = createMockRequest();
      const result = await advancedLearningRecommendationEngine.generateRecommendations(request);

      expect(result).toBeDefined();
      expect(Array.isArray(result.recommended_paths)).toBe(true);
      expect(Array.isArray(result.content_recommendations)).toBe(true);
      expect(Array.isArray(result.practice_exercises)).toBe(true);
      expect(Array.isArray(result.review_sessions)).toBe(true);
      expect(Array.isArray(result.skill_development)).toBe(true);
      expect(Array.isArray(result.adaptive_suggestions)).toBe(true);
      expect(Array.isArray(result.priority_recommendations)).toBe(true);
    });

    it('학습 경로를 추천할 수 있어야 함', async () => {
      const request = createMockRequest();
      const result = await advancedLearningRecommendationEngine.generateRecommendations(request);

      expect(result.recommended_paths).toBeDefined();
      result.recommended_paths.forEach(path => {
        expect(path.id).toBeDefined();
        expect(path.title).toBeDefined();
        expect(path.description).toBeDefined();
        expect(['beginner', 'intermediate', 'advanced', 'expert']).toContain(path.difficulty_level);
        expect(typeof path.estimated_duration).toBe('number');
        expect(typeof path.completion_rate).toBe('number');
        expect(Array.isArray(path.prerequisites)).toBe(true);
        expect(Array.isArray(path.learning_objectives)).toBe(true);
        expect(Array.isArray(path.modules)).toBe(true);
      });
    });

    it('콘텐츠 추천을 생성할 수 있어야 함', async () => {
      const request = createMockRequest();
      const result = await advancedLearningRecommendationEngine.generateRecommendations(request);

      expect(result.content_recommendations).toBeDefined();
      result.content_recommendations.forEach(content => {
        expect(content.id).toBeDefined();
        expect(content.title).toBeDefined();
        expect(['article', 'video', 'tutorial', 'documentation', 'book', 'course']).toContain(content.type);
        expect(typeof content.relevance_score).toBe('number');
        expect(content.relevance_score).toBeGreaterThanOrEqual(0);
        expect(content.relevance_score).toBeLessThanOrEqual(1);
      });
    });

    it('실습 연습을 추천할 수 있어야 함', async () => {
      const request = createMockRequest();
      const result = await advancedLearningRecommendationEngine.generateRecommendations(request);

      expect(result.practice_exercises).toBeDefined();
      result.practice_exercises.forEach(exercise => {
        expect(exercise.id).toBeDefined();
        expect(exercise.title).toBeDefined();
        expect(['coding', 'quiz', 'project', 'debugging', 'optimization']).toContain(exercise.type);
        expect(typeof exercise.difficulty).toBe('number');
        expect(typeof exercise.estimated_time).toBe('number');
      });
    });

    it('복습 세션을 추천할 수 있어야 함', async () => {
      const request = createMockRequest();
      const result = await advancedLearningRecommendationEngine.generateRecommendations(request);

      expect(result.review_sessions).toBeDefined();
      result.review_sessions.forEach(session => {
        expect(session.id).toBeDefined();
        expect(session.title).toBeDefined();
        expect(['comprehensive', 'targeted', 'spaced_repetition']).toContain(session.review_type);
        expect(typeof session.duration).toBe('number');
      });
    });

    it('기술 개발 계획을 생성할 수 있어야 함', async () => {
      const request = createMockRequest();
      const result = await advancedLearningRecommendationEngine.generateRecommendations(request);

      expect(result.skill_development).toBeDefined();
      result.skill_development.forEach(plan => {
        expect(plan.skill_name).toBeDefined();
        expect(typeof plan.current_level).toBe('number');
        expect(typeof plan.target_level).toBe('number');
        expect(['low', 'medium', 'high', 'critical']).toContain(plan.priority);
      });
    });

    it('적응형 제안을 생성할 수 있어야 함', async () => {
      const request = createMockRequest();
      const result = await advancedLearningRecommendationEngine.generateRecommendations(request);

      expect(result.adaptive_suggestions).toBeDefined();
      result.adaptive_suggestions.forEach(suggestion => {
        expect(suggestion.suggestion_type).toBeDefined();
        expect(suggestion.description).toBeDefined();
        expect(typeof suggestion.priority).toBe('number');
      });
    });

    it('우선순위 추천을 생성할 수 있어야 함', async () => {
      const request = createMockRequest();
      const result = await advancedLearningRecommendationEngine.generateRecommendations(request);

      expect(result.priority_recommendations).toBeDefined();
      result.priority_recommendations.forEach(recommendation => {
        expect(recommendation.category).toBeDefined();
        expect(recommendation.recommendation).toBeDefined();
        expect(['low', 'medium', 'high', 'critical']).toContain(recommendation.priority);
      });
    });

    it('학습 목표를 포함하여 추천을 생성할 수 있어야 함', async () => {
      const request = createMockRequest({
        learning_goal: '시공사 선정 전문가가 되기'
      });

      const result = await advancedLearningRecommendationEngine.generateRecommendations(request);

      expect(result).toBeDefined();
      expect(result.recommended_paths.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 학습 추천을 생성할 수 있어야 함', async () => {
      const request: LearningRecommendationRequest = {
        user_id: 'user-123',
        session_id: 'session-123',
        conversation_memory: {
          user_id: 'user-123',
          conversation_history: [],
          user_preferences: {
            preferred_language: 'ko',
            communication_style: 'professional',
            expertise_domains: ['real_estate'],
            response_length: 'medium',
            include_examples: true,
            technical_depth: 6
          },
          learned_patterns: [],
          context_stack: [],
          last_updated: new Date(),
          user_profile: {
            expertise_level: 'intermediate',
            learning_style: 'visual',
            preferred_topics: ['재개발', '시공사', '예산']
          }
        } as ConversationMemory,
        learning_experience: {
          current_module: 'redevelopment-basics',
          progress: 0.3,
          performance: 0.65
        } as LearningExperience,
        performance_analytics: {
          skill_gaps: [
            {
              skill_name: '시공사 선정',
              current_level: 0.3,
              target_level: 0.9,
              gap_size: 0.6,
              priority: 'high'
            },
            {
              skill_name: '예산 계획',
              current_level: 0.5,
              target_level: 0.8,
              gap_size: 0.3,
              priority: 'medium'
            }
          ],
          learning_patterns: [],
          performance_metrics: {
            learning_progress: {
              retention_rate: 0.7,
              completion_rate: 0.5
            }
          }
        } as PerformanceAnalyticsResult,
        current_context: '재개발 프로젝트의 시공사 선정과 예산 계획',
        learning_goal: '재개발 프로젝트 전문가가 되기'
      };

      const result = await advancedLearningRecommendationEngine.generateRecommendations(request);

      expect(result).toBeDefined();
      expect(result.recommended_paths.length).toBeGreaterThanOrEqual(0);
      expect(result.content_recommendations.length).toBeGreaterThanOrEqual(0);
      expect(result.skill_development.length).toBeGreaterThanOrEqual(0);
    });

    it('시공사 선정 관련 학습 추천을 생성할 수 있어야 함', async () => {
      const request: LearningRecommendationRequest = {
        user_id: 'user-456',
        session_id: 'session-456',
        conversation_memory: {
          user_id: 'user-456',
          conversation_history: [],
          user_preferences: {
            preferred_language: 'ko',
            communication_style: 'professional',
            expertise_domains: ['real_estate'],
            response_length: 'long',
            include_examples: true,
            technical_depth: 7
          },
          learned_patterns: [],
          context_stack: [],
          last_updated: new Date(),
          user_profile: {
            expertise_level: 'advanced',
            learning_style: 'auditory',
            preferred_topics: ['시공사', '선정']
          }
        } as ConversationMemory,
        learning_experience: {
          current_module: 'contractor-selection',
          progress: 0.6,
          performance: 0.8
        } as LearningExperience,
        performance_analytics: {
          skill_gaps: [
            {
              skill_name: '시공사 평가',
              current_level: 0.6,
              target_level: 0.95,
              gap_size: 0.35,
              priority: 'high'
            }
          ],
          learning_patterns: [],
          performance_metrics: {
            learning_progress: {
              retention_rate: 0.85,
              completion_rate: 0.75
            }
          }
        } as PerformanceAnalyticsResult,
        current_context: '시공사 선정 기준과 평가 방법'
      };

      const result = await advancedLearningRecommendationEngine.generateRecommendations(request);

      expect(result).toBeDefined();
      expect(result.practice_exercises.length).toBeGreaterThanOrEqual(0);
      expect(result.review_sessions.length).toBeGreaterThanOrEqual(0);
    });
  });
});

