/**
 * advancedUserExperienceAnalytics 서비스 테스트
 * 고급 사용자 경험 분석 서비스 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import advancedUserExperienceAnalytics from '../advancedUserExperienceAnalytics';
import type {
  UserExperienceInsight,
  UXOptimizationRecommendation,
} from '../advancedUserExperienceAnalytics';

// console 모킹
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

describe('advancedUserExperienceAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // 서비스를 중지하고 다시 시작하여 깨끗한 상태로 만들기
    advancedUserExperienceAnalytics.stopAnalysis();
    advancedUserExperienceAnalytics.shutdown();
    // 새 인스턴스를 만들 수 없으므로 shutdown 후 다시 시작
    (advancedUserExperienceAnalytics as unknown as { startAnalysis: () => void }).startAnalysis();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  describe('싱글톤 인스턴스', () => {
    it('advancedUserExperienceAnalytics가 정의되어 있어야 함', () => {
      expect(advancedUserExperienceAnalytics).toBeDefined();
    });
  });

  describe('분석 시작/중지', () => {
    it('분석을 시작할 수 있어야 함', () => {
      advancedUserExperienceAnalytics.startAnalysis();
      // startAnalysis는 중복 호출해도 문제없어야 함
      advancedUserExperienceAnalytics.startAnalysis();
      
      expect(advancedUserExperienceAnalytics).toBeDefined();
    });

    it('분석을 중지할 수 있어야 함', () => {
      advancedUserExperienceAnalytics.startAnalysis();
      advancedUserExperienceAnalytics.stopAnalysis();
      
      expect(advancedUserExperienceAnalytics).toBeDefined();
    });
  });

  describe('사용자 행동 패턴 분석', () => {
    it('사용자 행동 패턴을 분석할 수 있어야 함', () => {
      const interactionData = {
        session_duration: 30,
        interaction_count: 15,
        response_times: [1.5, 2.0, 1.8],
        complexity_scores: [7, 8, 9],
        topics: ['시공사', '재개발', '프로젝트'],
      };

      const pattern = advancedUserExperienceAnalytics.analyzeUserBehavior(
        'user-1',
        'session-1',
        interactionData
      );

      expect(pattern).toBeDefined();
      expect(pattern.user_id).toBe('user-1');
      expect(pattern.session_id).toBe('session-1');
      expect(['learning', 'exploration', 'problem_solving', 'social', 'efficiency', 'casual']).toContain(
        pattern.pattern_type
      );
      expect(typeof pattern.confidence).toBe('number');
      expect(pattern.confidence).toBeGreaterThanOrEqual(0);
      expect(pattern.confidence).toBeLessThanOrEqual(1);
    });

    it('행동 패턴의 구조가 올바른 형식을 가져야 함', () => {
      const interactionData = {
        session_duration: 20,
        interaction_count: 10,
        topics: ['재개발'],
      };

      const pattern = advancedUserExperienceAnalytics.analyzeUserBehavior(
        'user-1',
        'session-1',
        interactionData
      );

      expect(pattern.characteristics).toBeDefined();
      expect(typeof pattern.characteristics.session_duration).toBe('number');
      expect(typeof pattern.characteristics.interaction_frequency).toBe('number');
      expect(typeof pattern.characteristics.response_time_preference).toBe('number');
      expect(typeof pattern.characteristics.complexity_preference).toBe('number');
      expect(typeof pattern.characteristics.topic_diversity).toBe('number');
      expect(typeof pattern.characteristics.repetition_tolerance).toBe('number');

      expect(pattern.preferences).toBeDefined();
      expect(Array.isArray(pattern.preferences.preferred_topics)).toBe(true);
      expect(typeof pattern.preferences.preferred_interaction_style).toBe('string');
      expect(['short', 'medium', 'long']).toContain(pattern.preferences.preferred_response_length);
      expect(['slow', 'moderate', 'fast']).toContain(pattern.preferences.preferred_learning_pace);
      expect(['immediate', 'delayed', 'summary']).toContain(
        pattern.preferences.preferred_feedback_type
      );

      expect(pattern.last_updated).toBeInstanceOf(Date);
    });

    it('다양한 상호작용 데이터로 패턴을 업데이트할 수 있어야 함', () => {
      const interactionData1 = {
        session_duration: 25,
        interaction_count: 12,
        topics: ['시공사', '선정'],
      };

      const pattern1 = advancedUserExperienceAnalytics.analyzeUserBehavior(
        'user-1',
        'session-1',
        interactionData1
      );

      const interactionData2 = {
        session_duration: 35,
        interaction_count: 18,
        topics: ['시공사', '선정', '비교'],
      };

      const pattern2 = advancedUserExperienceAnalytics.analyzeUserBehavior(
        'user-1',
        'session-1',
        interactionData2
      );

      expect(pattern2.user_id).toBe(pattern1.user_id);
      expect(pattern2.session_id).toBe(pattern1.session_id);
    });
  });

  describe('사용자 참여도 분석', () => {
    it('사용자 참여도를 분석할 수 있어야 함', () => {
      const engagementData = {
        session_duration: 30,
        interaction_count: 15,
        response_time: 2.0,
        topic_switches: 5,
        satisfaction_score: 4.5,
      };

      const engagement = advancedUserExperienceAnalytics.analyzeUserEngagement(
        'user-1',
        'session-1',
        engagementData
      );

      expect(engagement).toBeDefined();
      expect(engagement.user_id).toBe('user-1');
      expect(engagement.session_id).toBe('session-1');
      expect(engagement.metrics).toBeDefined();
      expect(typeof engagement.metrics.session_duration).toBe('number');
      expect(typeof engagement.metrics.interaction_count).toBe('number');
      expect(typeof engagement.metrics.satisfaction_score).toBe('number');
    });

    it('참여도 메트릭의 구조가 올바른 형식을 가져야 함', () => {
      const engagementData = {
        session_duration: 25,
        interaction_count: 10,
      };

      const engagement = advancedUserExperienceAnalytics.analyzeUserEngagement(
        'user-1',
        'session-1',
        engagementData
      );

      expect(engagement.metrics.session_duration).toBeDefined();
      expect(engagement.metrics.interaction_count).toBeDefined();
      expect(typeof engagement.metrics.response_time).toBe('number');
      expect(typeof engagement.metrics.topic_switches).toBe('number');
      expect(typeof engagement.metrics.depth_of_exploration).toBe('number');
      expect(typeof engagement.metrics.return_frequency).toBe('number');
      expect(typeof engagement.metrics.completion_rate).toBe('number');
      expect(typeof engagement.metrics.satisfaction_score).toBe('number');
      expect(typeof engagement.metrics.frustration_signals).toBe('number');
      expect(typeof engagement.metrics.learning_progress).toBe('number');

      expect(engagement.patterns).toBeDefined();
      expect(Array.isArray(engagement.patterns.peak_activity_hours)).toBe(true);
      expect(typeof engagement.patterns.preferred_session_length).toBe('number');
      expect(Array.isArray(engagement.patterns.common_use_cases)).toBe(true);
      expect(Array.isArray(engagement.patterns.drop_off_points)).toBe(true);
      expect(Array.isArray(engagement.patterns.re_engagement_triggers)).toBe(true);

      expect(engagement.last_updated).toBeInstanceOf(Date);
    });
  });

  describe('사용자 만족도 분석', () => {
    it('사용자 만족도를 분석할 수 있어야 함', () => {
      const satisfactionData = {
        overall_satisfaction: 4.5,
        satisfaction_factors: {
          response_quality: 4.5,
          response_speed: 4.0,
          personalization: 4.5,
        },
      };

      const satisfaction = advancedUserExperienceAnalytics.analyzeUserSatisfaction(
        'user-1',
        'session-1',
        satisfactionData
      );

      expect(satisfaction).toBeDefined();
      expect(satisfaction.user_id).toBe('user-1');
      expect(satisfaction.session_id).toBe('session-1');
      expect(typeof satisfaction.overall_satisfaction).toBe('number');
      expect(['improving', 'stable', 'declining']).toContain(satisfaction.satisfaction_trend);
    });

    it('만족도 분석의 구조가 올바른 형식을 가져야 함', () => {
      const satisfactionData = {
        overall_satisfaction: 4.0,
      };

      const satisfaction = advancedUserExperienceAnalytics.analyzeUserSatisfaction(
        'user-1',
        'session-1',
        satisfactionData
      );

      expect(satisfaction.satisfaction_factors).toBeDefined();
      expect(typeof satisfaction.satisfaction_factors.response_quality).toBe('number');
      expect(typeof satisfaction.satisfaction_factors.response_speed).toBe('number');
      expect(typeof satisfaction.satisfaction_factors.personalization).toBe('number');
      expect(typeof satisfaction.satisfaction_factors.learning_effectiveness).toBe('number');
      expect(typeof satisfaction.satisfaction_factors.interface_usability).toBe('number');
      expect(typeof satisfaction.satisfaction_factors.content_relevance).toBe('number');

      expect(Array.isArray(satisfaction.pain_points)).toBe(true);
      expect(Array.isArray(satisfaction.positive_experiences)).toBe(true);
      expect(Array.isArray(satisfaction.recommendations)).toBe(true);
      expect(satisfaction.last_updated).toBeInstanceOf(Date);
    });
  });

  describe('학습 효과성 분석', () => {
    it('학습 효과성을 분석할 수 있어야 함', () => {
      const learningData = {
        knowledge_retention: 0.85,
        skill_improvement: 0.8,
        confidence_level: 0.9,
      };

      const learning = advancedUserExperienceAnalytics.analyzeLearningEffectiveness(
        'user-1',
        'session-1',
        learningData
      );

      expect(learning).toBeDefined();
      expect(learning.user_id).toBe('user-1');
      expect(learning.session_id).toBe('session-1');
      expect(learning.learning_outcomes).toBeDefined();
      expect(typeof learning.learning_outcomes.knowledge_retention).toBe('number');
    });

    it('학습 효과성 메트릭의 구조가 올바른 형식을 가져야 함', () => {
      const learningData = {
        knowledge_retention: 0.8,
      };

      const learning = advancedUserExperienceAnalytics.analyzeLearningEffectiveness(
        'user-1',
        'session-1',
        learningData
      );

      expect(learning.learning_outcomes).toBeDefined();
      expect(typeof learning.learning_outcomes.knowledge_retention).toBe('number');
      expect(typeof learning.learning_outcomes.skill_improvement).toBe('number');
      expect(typeof learning.learning_outcomes.concept_understanding).toBe('number');
      expect(typeof learning.learning_outcomes.problem_solving_ability).toBe('number');
      expect(typeof learning.learning_outcomes.confidence_level).toBe('number');
      expect(typeof learning.learning_outcomes.motivation_level).toBe('number');

      expect(learning.learning_patterns).toBeDefined();
      expect(typeof learning.learning_patterns.optimal_learning_time).toBe('number');
      expect(Array.isArray(learning.learning_patterns.preferred_learning_methods)).toBe(true);
      expect(Array.isArray(learning.learning_patterns.effective_feedback_types)).toBe(true);
      expect(Array.isArray(learning.learning_patterns.knowledge_gaps)).toBe(true);
      expect(Array.isArray(learning.learning_patterns.strengths)).toBe(true);

      expect(learning.progress_tracking).toBeDefined();
      expect(typeof learning.progress_tracking.current_level).toBe('number');
      expect(typeof learning.progress_tracking.target_level).toBe('number');
      expect(typeof learning.progress_tracking.progress_rate).toBe('number');
      expect(learning.progress_tracking.estimated_completion).toBeInstanceOf(Date);
      expect(typeof learning.progress_tracking.milestones_achieved).toBe('number');
      expect(typeof learning.progress_tracking.total_milestones).toBe('number');

      expect(learning.last_updated).toBeInstanceOf(Date);
    });
  });

  describe('사용자 데이터 조회', () => {
    it('사용자 데이터를 조회할 수 있어야 함', () => {
      const interactionData = { session_duration: 20, interaction_count: 10 };
      const engagementData = { session_duration: 20, interaction_count: 10 };
      const satisfactionData = { overall_satisfaction: 4.0 };
      const learningData = { knowledge_retention: 0.8 };

      advancedUserExperienceAnalytics.analyzeUserBehavior('user-1', 'session-1', interactionData);
      advancedUserExperienceAnalytics.analyzeUserEngagement('user-1', 'session-1', engagementData);
      advancedUserExperienceAnalytics.analyzeUserSatisfaction('user-1', 'session-1', satisfactionData);
      advancedUserExperienceAnalytics.analyzeLearningEffectiveness('user-1', 'session-1', learningData);

      const userData = advancedUserExperienceAnalytics.getUserData('user-1', 'session-1');

      expect(userData).toBeDefined();
      expect(userData.behavior_pattern).toBeDefined();
      expect(userData.engagement).toBeDefined();
      expect(userData.satisfaction).toBeDefined();
      expect(userData.learning_effectiveness).toBeDefined();
    });
  });

  describe('인사이트 조회', () => {
    it('인사이트를 조회할 수 있어야 함', () => {
      const insights = advancedUserExperienceAnalytics.getInsights();

      expect(Array.isArray(insights)).toBe(true);
    });

    it('특정 사용자의 인사이트를 조회할 수 있어야 함', () => {
      const interactionData = {
        session_duration: 40,
        interaction_count: 20,
        complexity_scores: [9, 9, 9],
      };
      advancedUserExperienceAnalytics.analyzeUserBehavior('user-1', 'session-1', interactionData);

      // 인사이트 생성 대기
      jest.advanceTimersByTime(35000);

      const insights = advancedUserExperienceAnalytics.getInsights('user-1');

      expect(Array.isArray(insights)).toBe(true);
    });

    it('인사이트 구조가 올바른 형식을 가져야 함', () => {
      const interactionData = {
        session_duration: 35,
        interaction_count: 18,
        complexity_scores: [8, 9, 9],
      };
      advancedUserExperienceAnalytics.analyzeUserBehavior('user-1', 'session-1', interactionData);

      jest.advanceTimersByTime(35000);

      const insights = advancedUserExperienceAnalytics.getInsights();

      if (insights.length > 0) {
        insights.forEach((insight: UserExperienceInsight) => {
          expect(insight.insight_id).toBeDefined();
          expect(insight.user_id).toBeDefined();
          expect(['behavior', 'engagement', 'satisfaction', 'learning', 'optimization']).toContain(
            insight.insight_type
          );
          expect(insight.title).toBeDefined();
          expect(insight.description).toBeDefined();
          expect(typeof insight.confidence).toBe('number');
          expect(['low', 'medium', 'high', 'critical']).toContain(insight.priority);
          expect(typeof insight.actionable).toBe('boolean');
          expect(Array.isArray(insight.recommendations)).toBe(true);
          expect(Array.isArray(insight.data_points)).toBe(true);
          expect(insight.generated_at).toBeInstanceOf(Date);
        });
      }
    });
  });

  describe('최적화 권장사항 조회', () => {
    it('최적화 권장사항을 조회할 수 있어야 함', () => {
      const recommendations = advancedUserExperienceAnalytics.getOptimizationRecommendations();

      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('특정 사용자의 최적화 권장사항을 조회할 수 있어야 함', () => {
      jest.advanceTimersByTime(35000);

      const recommendations = advancedUserExperienceAnalytics.getOptimizationRecommendations('user-1');

      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('최적화 권장사항 구조가 올바른 형식을 가져야 함', () => {
      jest.advanceTimersByTime(35000);

      const recommendations = advancedUserExperienceAnalytics.getOptimizationRecommendations();

      if (recommendations.length > 0) {
        recommendations.forEach((rec: UXOptimizationRecommendation) => {
          expect(rec.recommendation_id).toBeDefined();
          expect(rec.user_id).toBeDefined();
          expect(['interface', 'content', 'interaction', 'personalization', 'performance']).toContain(
            rec.category
          );
          expect(rec.title).toBeDefined();
          expect(rec.description).toBeDefined();
          expect(typeof rec.impact_score).toBe('number');
          expect(['low', 'medium', 'high']).toContain(rec.implementation_effort);
          expect(rec.expected_improvement).toBeDefined();
          expect(typeof rec.expected_improvement.satisfaction).toBe('number');
          expect(typeof rec.expected_improvement.engagement).toBe('number');
          expect(typeof rec.expected_improvement.learning_effectiveness).toBe('number');
          expect(typeof rec.expected_improvement.retention).toBe('number');
          expect(Array.isArray(rec.implementation_steps)).toBe(true);
          expect(Array.isArray(rec.metrics_to_track)).toBe(true);
          expect(rec.generated_at).toBeInstanceOf(Date);
        });
      }
    });
  });

  describe('통계 정보 조회', () => {
    it('통계 정보를 조회할 수 있어야 함', () => {
      const stats = advancedUserExperienceAnalytics.getStatistics();

      expect(stats).toBeDefined();
      expect(typeof stats.total_users).toBe('number');
      expect(typeof stats.total_insights).toBe('number');
      expect(typeof stats.total_recommendations).toBe('number');
      expect(typeof stats.average_satisfaction).toBe('number');
      expect(typeof stats.average_engagement).toBe('number');
      expect(Array.isArray(stats.common_patterns)).toBe(true);
    });
  });

  describe('이벤트 발생', () => {
    it('행동 패턴 업데이트 시 이벤트를 발생시켜야 함', (done) => {
      const interactionData = { session_duration: 20, interaction_count: 10 };

      advancedUserExperienceAnalytics.once('behavior_pattern_updated', (pattern) => {
        expect(pattern).toBeDefined();
        expect(pattern.user_id).toBe('user-1');
        done();
      });

      advancedUserExperienceAnalytics.analyzeUserBehavior('user-1', 'session-1', interactionData);
    });

    it('참여도 업데이트 시 이벤트를 발생시켜야 함', (done) => {
      const engagementData = { session_duration: 25, interaction_count: 12 };

      advancedUserExperienceAnalytics.once('engagement_updated', (engagement) => {
        expect(engagement).toBeDefined();
        expect(engagement.user_id).toBe('user-1');
        done();
      });

      advancedUserExperienceAnalytics.analyzeUserEngagement('user-1', 'session-1', engagementData);
    });

    it('만족도 업데이트 시 이벤트를 발생시켜야 함', (done) => {
      const satisfactionData = { overall_satisfaction: 4.5 };

      advancedUserExperienceAnalytics.once('satisfaction_updated', (satisfaction) => {
        expect(satisfaction).toBeDefined();
        expect(satisfaction.user_id).toBe('user-1');
        done();
      });

      advancedUserExperienceAnalytics.analyzeUserSatisfaction('user-1', 'session-1', satisfactionData);
    });

    it('학습 효과성 업데이트 시 이벤트를 발생시켜야 함', (done) => {
      const learningData = { knowledge_retention: 0.8 };

      advancedUserExperienceAnalytics.once('learning_effectiveness_updated', (learning) => {
        expect(learning).toBeDefined();
        expect(learning.user_id).toBe('user-1');
        done();
      });

      advancedUserExperienceAnalytics.analyzeLearningEffectiveness('user-1', 'session-1', learningData);
    });

    it('종합 분석 완료 시 이벤트를 발생시켜야 함', (done) => {
      advancedUserExperienceAnalytics.once('analysis_completed', (data) => {
        expect(data).toBeDefined();
        expect(data.insights).toBeDefined();
        expect(data.recommendations).toBeDefined();
        done();
      });

      jest.advanceTimersByTime(35000);
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 사용자 행동을 분석할 수 있어야 함', () => {
      const interactionData = {
        session_duration: 45,
        interaction_count: 25,
        response_times: [2.0, 1.8, 2.2],
        complexity_scores: [8, 9, 8],
        topics: ['재개발', '시공사', '선정', '삼성물산', '대우건설', '비교'],
      };

      const pattern = advancedUserExperienceAnalytics.analyzeUserBehavior(
        'redev-user-1',
        'redev-session-1',
        interactionData
      );

      expect(pattern).toBeDefined();
      expect(pattern.pattern_type).toBeDefined();
      expect(pattern.preferences.preferred_topics.length).toBeGreaterThan(0);
    });

    it('시공사 선정 대화의 참여도를 분석할 수 있어야 함', () => {
      const engagementData = {
        session_duration: 60,
        interaction_count: 30,
        response_time: 2.0,
        topic_switches: 8,
        satisfaction_score: 4.5,
        follow_up_questions: 10,
        detailed_responses: 5,
      };

      const engagement = advancedUserExperienceAnalytics.analyzeUserEngagement(
        'contractor-user-1',
        'contractor-session-1',
        engagementData
      );

      expect(engagement).toBeDefined();
      expect(engagement.metrics.depth_of_exploration).toBeGreaterThan(0);
      expect(engagement.metrics.satisfaction_score).toBe(4.5);
    });

    it('복합적인 사용자 경험 분석을 수행할 수 있어야 함', () => {
      const interactionData = {
        session_duration: 40,
        interaction_count: 20,
        complexity_scores: [9, 9, 9],
        topics: ['재개발', '시공사'],
      };

      const engagementData = {
        session_duration: 40,
        interaction_count: 20,
        satisfaction_score: 4.5,
      };

      const satisfactionData = {
        overall_satisfaction: 4.5,
        satisfaction_factors: {
          response_quality: 4.5,
          response_speed: 4.0,
        },
      };

      const learningData = {
        knowledge_retention: 0.85,
        skill_improvement: 0.8,
      };

      advancedUserExperienceAnalytics.analyzeUserBehavior('user-1', 'session-1', interactionData);
      advancedUserExperienceAnalytics.analyzeUserEngagement('user-1', 'session-1', engagementData);
      advancedUserExperienceAnalytics.analyzeUserSatisfaction('user-1', 'session-1', satisfactionData);
      advancedUserExperienceAnalytics.analyzeLearningEffectiveness('user-1', 'session-1', learningData);

      const userData = advancedUserExperienceAnalytics.getUserData('user-1', 'session-1');

      expect(userData.behavior_pattern).toBeDefined();
      expect(userData.engagement).toBeDefined();
      expect(userData.satisfaction).toBeDefined();
      expect(userData.learning_effectiveness).toBeDefined();

      jest.advanceTimersByTime(35000);

      const insights = advancedUserExperienceAnalytics.getInsights('user-1');
      const recommendations = advancedUserExperienceAnalytics.getOptimizationRecommendations('user-1');

      expect(Array.isArray(insights)).toBe(true);
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('여러 사용자의 데이터를 동시에 관리할 수 있어야 함', () => {
      const interactionData1 = { session_duration: 20, interaction_count: 10 };
      const interactionData2 = { session_duration: 30, interaction_count: 15 };

      advancedUserExperienceAnalytics.analyzeUserBehavior('user-1', 'session-1', interactionData1);
      advancedUserExperienceAnalytics.analyzeUserBehavior('user-2', 'session-1', interactionData2);

      const stats = advancedUserExperienceAnalytics.getStatistics();
      expect(stats.total_users).toBeGreaterThanOrEqual(2);
    });
  });

  describe('서비스 종료', () => {
    it('shutdown을 수행할 수 있어야 함', () => {
      expect(() => {
        advancedUserExperienceAnalytics.shutdown();
      }).not.toThrow();

      // shutdown 후 다시 시작
      (advancedUserExperienceAnalytics as unknown as { startAnalysis: () => void }).startAnalysis();
    });
  });
});

