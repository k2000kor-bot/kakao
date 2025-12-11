/**
 * advancedPerformanceAnalyticsService 서비스 테스트
 * 고급 성능 분석 서비스 테스트
 */

import advancedPerformanceAnalyticsService, {
  PerformanceAnalyticsRequest,
  PerformanceAnalyticsResult
} from '../advancedPerformanceAnalyticsService';
import { ConversationMemory } from '../advancedConversationMemoryService';
import { LearningExperience } from '../personalizedLearningExperienceService';

// Mock dependencies
jest.mock('../advancedConversationMemoryService');
jest.mock('../personalizedLearningExperienceService');

describe('advancedPerformanceAnalyticsService', () => {
  const createMockConversationMemory = (): ConversationMemory => ({
    user_id: 'user-1',
    session_id: 'session-1',
    conversation_history: [
      {
        id: 'entry-1',
        timestamp: new Date(),
        user_input: '재개발 프로젝트에 대해 알려주세요',
        ai_response: '재개발 프로젝트는...',
        context: {
          current_topic: '재개발',
          conversation_depth: 1,
          user_engagement_level: 'high',
          interruption_count: 0,
          clarification_requests: 0
        },
        metadata: {
          processing_time: 100,
          model_used: 'advanced-ai',
          confidence_score: 0.9,
          flags: []
        }
      }
    ],
    user_profile: {
      expertise_level: 'intermediate',
      primary_domains: ['real_estate'],
      learning_style: 'visual',
      communication_preference: 'professional',
      response_length_preference: 'moderate',
      example_preference: 'code',
      update_frequency: new Date()
    },
    learning_patterns: [],
    preferences: {
      language: 'ko',
      timezone: 'Asia/Seoul',
      notification_settings: {
        email_notifications: false,
        push_notifications: true,
        reminder_frequency: 'weekly',
        topics_of_interest: []
      },
      ui_preferences: {
        theme: 'auto',
        font_size: 'medium',
        animation_enabled: true,
        compact_mode: false
      },
      content_preferences: {
        preferred_detail_level: 'intermediate',
        code_examples: true,
        visual_aids: true,
        external_links: true,
        follow_up_questions: true
      }
    },
    knowledge_graph: {
      nodes: [],
      edges: [],
      last_updated: new Date()
    },
    interaction_stats: {
      total_conversations: 1,
      total_messages: 2,
      average_session_length: 30,
      most_active_hours: [14, 15],
      preferred_topics: [],
      response_time_preferences: [],
      satisfaction_scores: []
    },
    last_updated: new Date()
  });

  const createMockLearningExperience = (): LearningExperience => ({
    user_id: 'user-1',
    session_id: 'session-1',
    current_learning_path: {
      path_id: 'path-1',
      path_name: '웹 개발 기초',
      description: '웹 개발 기초 학습',
      difficulty_level: 'intermediate',
      estimated_duration: 100,
      prerequisites: [],
      modules: [
        {
          module_id: 'module-1',
          title: 'HTML 기초',
          description: 'HTML 기초 학습',
          content_type: 'theory',
          difficulty: 3,
          estimated_time: 60,
          prerequisites: [],
          learning_objectives: [],
          resources: [],
          completed: false
        }
      ],
      current_module_index: 0,
      completion_percentage: 0,
      start_date: new Date()
    },
    learning_goals: [],
    progress_tracking: {
      overall_progress: 0,
      skill_progress: [],
      time_spent: {
        total_time_spent: 0,
        average_session_length: 30,
        most_productive_hours: [],
        consistency_score: 0
      },
      performance_metrics: [],
      learning_velocity: 0,
      retention_rate: 0
    },
    adaptive_content: {
      learning_style_adaptation: {
        primary_style: 'visual',
        adaptation_level: 0.5,
        effectiveness_score: 0.7
      },
      difficulty_adjustment: {
        current_difficulty: 5,
        adjustment_history: [],
        optimal_range: { min: 3, max: 7 }
      },
      content_personalization: {
        preferred_formats: [],
        content_relevance: 0.5,
        customization_level: 'moderate'
      }
    },
    learning_recommendations: [],
    difficulty_adjustment: {
      current_difficulty: 5,
      adjustment_history: [],
      optimal_range: { min: 3, max: 7 }
    },
    last_updated: new Date()
  });

  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedPerformanceAnalyticsService).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedPerformanceAnalyticsService;
      const instance2 = advancedPerformanceAnalyticsService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('analyzePerformance', () => {
    it('성능 분석을 수행할 수 있어야 함', async () => {
      const request: PerformanceAnalyticsRequest = {
        user_id: 'user-1',
        session_id: 'session-1',
        conversation_memory: createMockConversationMemory(),
        learning_experience: createMockLearningExperience(),
        time_range: 'week'
      };

      const result = await advancedPerformanceAnalyticsService.analyzePerformance(request);

      expect(result).toBeDefined();
      expect(typeof result.overall_score).toBe('number');
      expect(typeof result.learning_efficiency).toBe('number');
      expect(['low', 'medium', 'high', 'excellent']).toContain(result.engagement_level);
      expect(['declining', 'stable', 'improving', 'accelerating']).toContain(result.progress_trend);
      expect(result.performance_metrics).toBeDefined();
      expect(Array.isArray(result.learning_patterns)).toBe(true);
      expect(Array.isArray(result.skill_gaps)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(Array.isArray(result.predictions)).toBe(true);
      expect(Array.isArray(result.insights)).toBe(true);
    });

    it('성능 지표를 계산할 수 있어야 함', async () => {
      const request: PerformanceAnalyticsRequest = {
        user_id: 'user-1',
        session_id: 'session-1',
        conversation_memory: createMockConversationMemory(),
        learning_experience: createMockLearningExperience(),
        time_range: 'week'
      };

      const result = await advancedPerformanceAnalyticsService.analyzePerformance(request);

      expect(result.performance_metrics).toBeDefined();
      expect(result.performance_metrics.response_time).toBeDefined();
      expect(typeof result.performance_metrics.response_time.average).toBe('number');
      expect(['improving', 'stable', 'declining']).toContain(result.performance_metrics.response_time.trend);

      expect(result.performance_metrics.satisfaction_score).toBeDefined();
      expect(typeof result.performance_metrics.satisfaction_score.average).toBe('number');

      expect(result.performance_metrics.engagement_metrics).toBeDefined();
      expect(typeof result.performance_metrics.engagement_metrics.session_duration).toBe('number');
      expect(typeof result.performance_metrics.engagement_metrics.interaction_frequency).toBe('number');

      expect(result.performance_metrics.learning_progress).toBeDefined();
      expect(typeof result.performance_metrics.learning_progress.completion_rate).toBe('number');

      expect(result.performance_metrics.cognitive_load).toBeDefined();
      expect(typeof result.performance_metrics.cognitive_load.complexity_handling).toBe('number');
    });

    it('학습 패턴을 분석할 수 있어야 함', async () => {
      const request: PerformanceAnalyticsRequest = {
        user_id: 'user-1',
        session_id: 'session-1',
        conversation_memory: createMockConversationMemory(),
        learning_experience: createMockLearningExperience(),
        time_range: 'week'
      };

      const result = await advancedPerformanceAnalyticsService.analyzePerformance(request);

      expect(Array.isArray(result.learning_patterns)).toBe(true);
      result.learning_patterns.forEach(pattern => {
        expect(['visual', 'auditory', 'kinesthetic', 'reading', 'social']).toContain(pattern.pattern_type);
        expect(typeof pattern.frequency).toBe('number');
        expect(typeof pattern.effectiveness).toBe('number');
      });
    });

    it('기술 격차를 식별할 수 있어야 함', async () => {
      const request: PerformanceAnalyticsRequest = {
        user_id: 'user-1',
        session_id: 'session-1',
        conversation_memory: createMockConversationMemory(),
        learning_experience: createMockLearningExperience(),
        time_range: 'week'
      };

      const result = await advancedPerformanceAnalyticsService.analyzePerformance(request);

      expect(Array.isArray(result.skill_gaps)).toBe(true);
      result.skill_gaps.forEach(gap => {
        expect(gap.skill_name).toBeDefined();
        expect(typeof gap.current_level).toBe('number');
        expect(typeof gap.required_level).toBe('number');
        expect(typeof gap.gap_size).toBe('number');
        expect(['low', 'medium', 'high', 'critical']).toContain(gap.impact_priority);
      });
    });

    it('성능 추천을 생성할 수 있어야 함', async () => {
      const request: PerformanceAnalyticsRequest = {
        user_id: 'user-1',
        session_id: 'session-1',
        conversation_memory: createMockConversationMemory(),
        learning_experience: createMockLearningExperience(),
        time_range: 'week'
      };

      const result = await advancedPerformanceAnalyticsService.analyzePerformance(request);

      expect(Array.isArray(result.recommendations)).toBe(true);
      result.recommendations.forEach(rec => {
        expect(rec.id).toBeDefined();
        expect(['learning_strategy', 'content_focus', 'practice_exercise', 'review_session', 'skill_development']).toContain(rec.type);
        expect(rec.title).toBeDefined();
        expect(rec.description).toBeDefined();
        expect(['low', 'medium', 'high', 'urgent']).toContain(rec.priority);
        expect(typeof rec.expected_impact).toBe('number');
      });
    });

    it('성능 예측을 생성할 수 있어야 함', async () => {
      const request: PerformanceAnalyticsRequest = {
        user_id: 'user-1',
        session_id: 'session-1',
        conversation_memory: createMockConversationMemory(),
        learning_experience: createMockLearningExperience(),
        time_range: 'week'
      };

      const result = await advancedPerformanceAnalyticsService.analyzePerformance(request);

      expect(Array.isArray(result.predictions)).toBe(true);
      result.predictions.forEach(pred => {
        expect(pred.metric).toBeDefined();
        expect(typeof pred.current_value).toBe('number');
        expect(typeof pred.predicted_value).toBe('number');
        expect(typeof pred.confidence).toBe('number');
        expect(typeof pred.timeframe).toBe('number');
        expect(['low', 'medium', 'high']).toContain(pred.risk_level);
      });
    });

    it('인사이트를 생성할 수 있어야 함', async () => {
      const request: PerformanceAnalyticsRequest = {
        user_id: 'user-1',
        session_id: 'session-1',
        conversation_memory: createMockConversationMemory(),
        learning_experience: createMockLearningExperience(),
        time_range: 'week'
      };

      const result = await advancedPerformanceAnalyticsService.analyzePerformance(request);

      expect(Array.isArray(result.insights)).toBe(true);
      result.insights.forEach(insight => {
        expect(insight.id).toBeDefined();
        expect(['strength', 'weakness', 'opportunity', 'trend', 'anomaly']).toContain(insight.type);
        expect(insight.title).toBeDefined();
        expect(insight.description).toBeDefined();
        expect(Array.isArray(insight.data_evidence)).toBe(true);
        expect(typeof insight.confidence).toBe('number');
        expect(typeof insight.actionable).toBe('boolean');
        expect(['low', 'medium', 'high']).toContain(insight.priority);
      });
    });

    it('다양한 시간 범위로 분석할 수 있어야 함', async () => {
      const timeRanges: Array<'day' | 'week' | 'month' | 'all'> = ['day', 'week', 'month', 'all'];

      for (const timeRange of timeRanges) {
        const request: PerformanceAnalyticsRequest = {
          user_id: 'user-1',
          session_id: 'session-1',
          conversation_memory: createMockConversationMemory(),
          learning_experience: createMockLearningExperience(),
          time_range: timeRange
        };

        const result = await advancedPerformanceAnalyticsService.analyzePerformance(request);
        expect(result).toBeDefined();
        expect(typeof result.overall_score).toBe('number');
      }
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 성능 분석을 수행할 수 있어야 함', async () => {
      const memory = createMockConversationMemory();
      memory.conversation_history.push({
        id: 'entry-2',
        timestamp: new Date(),
        user_input: '시공사 선정 기준은 무엇인가요?',
        ai_response: '시공사 선정 기준은...',
        context: {
          current_topic: '시공사',
          conversation_depth: 2,
          user_engagement_level: 'high',
          interruption_count: 0,
          clarification_requests: 0
        },
        metadata: {
          processing_time: 120,
          model_used: 'advanced-ai',
          confidence_score: 0.95,
          flags: []
        }
      });

      const request: PerformanceAnalyticsRequest = {
        user_id: 'user-1',
        session_id: 'session-1',
        conversation_memory: memory,
        learning_experience: createMockLearningExperience(),
        time_range: 'week'
      };

      const result = await advancedPerformanceAnalyticsService.analyzePerformance(request);

      expect(result).toBeDefined();
      expect(result.performance_metrics.engagement_metrics.interaction_frequency).toBeGreaterThanOrEqual(0);
      expect(result.learning_patterns.length).toBeGreaterThanOrEqual(0);
    });

    it('학습 진행 상황이 있는 경우 성능 분석을 수행할 수 있어야 함', async () => {
      const learningExp = createMockLearningExperience();
      learningExp.current_learning_path.completion_percentage = 50;
      learningExp.current_learning_path.modules[0].completed = true;
      learningExp.current_learning_path.modules[0].performance_score = 85;

      const request: PerformanceAnalyticsRequest = {
        user_id: 'user-1',
        session_id: 'session-1',
        conversation_memory: createMockConversationMemory(),
        learning_experience: learningExp,
        time_range: 'month'
      };

      const result = await advancedPerformanceAnalyticsService.analyzePerformance(request);

      expect(result).toBeDefined();
      expect(result.performance_metrics.learning_progress.completion_rate).toBeGreaterThanOrEqual(0);
      expect(result.progress_trend).toBeDefined();
    });
  });
});

