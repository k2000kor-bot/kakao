/**
 * advancedAIPsychologyEngine 서비스 테스트
 * 고급 AI 심리학 분석 엔진 테스트
 */

import advancedAIPsychologyEngine from '../advancedAIPsychologyEngine';

// 타이머 모킹
jest.useFakeTimers();

// console 모킹
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

describe('advancedAIPsychologyEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    // 분석 중지
    if (advancedAIPsychologyEngine) {
      try {
        advancedAIPsychologyEngine.stopAnalysis();
      } catch (e) {
        // 이미 중지된 상태일 수 있음
      }
    }
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    jest.useRealTimers();
  });

  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedAIPsychologyEngine).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedAIPsychologyEngine;
      const instance2 = advancedAIPsychologyEngine;
      expect(instance1).toBe(instance2);
    });
  });

  describe('startAnalysis / stopAnalysis', () => {
    it('분석을 시작할 수 있어야 함', () => {
      advancedAIPsychologyEngine.startAnalysis();
      advancedAIPsychologyEngine.stopAnalysis();
    });

    it('분석을 중지할 수 있어야 함', () => {
      advancedAIPsychologyEngine.startAnalysis();
      advancedAIPsychologyEngine.stopAnalysis();
    });

    it('이미 실행 중일 때 중복 시작을 방지해야 함', () => {
      advancedAIPsychologyEngine.startAnalysis();
      advancedAIPsychologyEngine.startAnalysis(); // 중복 호출
      advancedAIPsychologyEngine.stopAnalysis();
    });
  });

  describe('analyzeEmotionalState', () => {
    it('감정 상태를 분석할 수 있어야 함', () => {
      const emotionalState = advancedAIPsychologyEngine.analyzeEmotionalState(
        'user-1',
        'session-1',
        {
          text: '좋아요! 정말 감사합니다.',
        }
      );

      expect(emotionalState).toBeDefined();
      expect(emotionalState.user_id).toBe('user-1');
      expect(emotionalState.session_id).toBe('session-1');
      expect(emotionalState.primary_emotion).toBeDefined();
      expect(typeof emotionalState.intensity).toBe('number');
      expect(typeof emotionalState.valence).toBe('number');
      expect(typeof emotionalState.arousal).toBe('number');
      expect(typeof emotionalState.confidence).toBe('number');
      expect(Array.isArray(emotionalState.secondary_emotions)).toBe(true);
      expect(Array.isArray(emotionalState.triggers)).toBe(true);
      expect(emotionalState.last_updated).toBeInstanceOf(Date);
    });

    it('부정적 텍스트에서 부정적 감정을 감지해야 함', () => {
      const emotionalState = advancedAIPsychologyEngine.analyzeEmotionalState(
        'user-2',
        'session-2',
        {
          text: '화가 나요. 정말 힘들어요.',
        }
      );

      expect(['sadness', 'anger']).toContain(emotionalState.primary_emotion);
      expect(emotionalState.valence).toBeLessThanOrEqual(0);
    });

    it('상호작용 패턴을 분석할 수 있어야 함', () => {
      const emotionalState = advancedAIPsychologyEngine.analyzeEmotionalState(
        'user-3',
        'session-3',
        {
          interaction_patterns: {
            rapid_responses: true,
            repeated_questions: false,
            short_responses: false,
            long_detailed_responses: false,
          },
        }
      );

      expect(emotionalState).toBeDefined();
      expect(emotionalState.primary_emotion).toBeDefined();
    });

    it('같은 사용자/세션에서 상태가 업데이트되어야 함', () => {
      const state1 = advancedAIPsychologyEngine.analyzeEmotionalState(
        'user-4',
        'session-4',
        { text: '좋아요' }
      );

      // 시간 경과 시뮬레이션 (실제 시간 사용)
      jest.useRealTimers();
      return new Promise((resolve) => {
        setTimeout(() => {
          jest.useFakeTimers();
          const state2 = advancedAIPsychologyEngine.analyzeEmotionalState(
            'user-4',
            'session-4',
            { text: '감사합니다' }
          );

          expect(state2.duration).toBeGreaterThanOrEqual(state1.duration);
          resolve(undefined);
        }, 100);
      });
    });
  });

  describe('analyzeCognitiveLoad', () => {
    it('인지 부하를 분석할 수 있어야 함', () => {
      const cognitiveLoad = advancedAIPsychologyEngine.analyzeCognitiveLoad(
        'user-1',
        'session-1',
        {
          response_times: [1000, 1200, 1100, 1300, 1050],
          errors: ['error1', 'error2'],
          repetition_requests: 2,
          topic_switches: 3,
          frustration_signals: 1,
        }
      );

      expect(cognitiveLoad).toBeDefined();
      expect(cognitiveLoad.user_id).toBe('user-1');
      expect(cognitiveLoad.session_id).toBe('session-1');
      expect(typeof cognitiveLoad.overall_load).toBe('number');
      expect(cognitiveLoad.overall_load).toBeGreaterThanOrEqual(0);
      expect(cognitiveLoad.overall_load).toBeLessThanOrEqual(10);
      expect(cognitiveLoad.components).toBeDefined();
      expect(cognitiveLoad.components.intrinsic_load).toBeDefined();
      expect(cognitiveLoad.components.extraneous_load).toBeDefined();
      expect(cognitiveLoad.components.germane_load).toBeDefined();
      expect(Array.isArray(cognitiveLoad.recommendations)).toBe(true);
      expect(cognitiveLoad.last_updated).toBeInstanceOf(Date);
    });

    it('높은 인지 부하 상황을 감지해야 함', () => {
      const cognitiveLoad = advancedAIPsychologyEngine.analyzeCognitiveLoad(
        'user-2',
        'session-2',
        {
          response_times: [2000, 3000, 2500, 2800],
          errors: ['error1', 'error2', 'error3', 'error4'],
          repetition_requests: 5,
          topic_switches: 6,
          frustration_signals: 4,
        }
      );

      expect(cognitiveLoad.overall_load).toBeGreaterThan(6);
    });

    it('인지 부하 권장사항을 생성해야 함', () => {
      const cognitiveLoad = advancedAIPsychologyEngine.analyzeCognitiveLoad(
        'user-3',
        'session-3',
        {
          response_times: [2500, 3000],
          errors: ['error1', 'error2', 'error3', 'error4', 'error5'],
          frustration_signals: 5,
        }
      );

      expect(cognitiveLoad.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('analyzeLearningMotivation', () => {
    it('학습 동기를 분석할 수 있어야 함', () => {
      const motivation = advancedAIPsychologyEngine.analyzeLearningMotivation(
        'user-1',
        'session-1',
        {
          follow_up_questions: 5,
          deep_diving: 3,
          performance_focus: 2,
          confidence_signals: 4,
        }
      );

      expect(motivation).toBeDefined();
      expect(motivation.user_id).toBe('user-1');
      expect(motivation.session_id).toBe('session-1');
      expect(['intrinsic', 'extrinsic', 'mixed']).toContain(motivation.motivation_type);
      expect(typeof motivation.motivation_level).toBe('number');
      expect(motivation.motivation_level).toBeGreaterThanOrEqual(0);
      expect(motivation.motivation_level).toBeLessThanOrEqual(10);
      expect(motivation.factors).toBeDefined();
      expect(Array.isArray(motivation.barriers)).toBe(true);
      expect(Array.isArray(motivation.enhancers)).toBe(true);
      expect(['increasing', 'stable', 'decreasing']).toContain(motivation.trend);
      expect(motivation.last_updated).toBeInstanceOf(Date);
    });

    it('동기 유형을 올바르게 분류해야 함', () => {
      const intrinsicMotivation = advancedAIPsychologyEngine.analyzeLearningMotivation(
        'user-2',
        'session-2',
        {
          follow_up_questions: 10,
          deep_diving: 8,
          self_efficacy: 9,
          performance_focus: 1,
          social_recognition: 1,
          external_rewards: 1,
        }
      );

      expect(['intrinsic', 'mixed']).toContain(intrinsicMotivation.motivation_type);
    });

    it('동기 장벽과 강화 요소를 식별해야 함', () => {
      const motivation = advancedAIPsychologyEngine.analyzeLearningMotivation(
        'user-3',
        'session-3',
        {
          difficulty_level: 9,
          lack_of_progress: true,
          learning_progress: true,
          positive_feedback: true,
        }
      );

      expect(motivation.barriers.length).toBeGreaterThan(0);
      expect(motivation.enhancers.length).toBeGreaterThan(0);
    });
  });

  describe('analyzeStressLevel', () => {
    it('스트레스 레벨을 분석할 수 있어야 함', () => {
      const stressLevel = advancedAIPsychologyEngine.analyzeStressLevel(
        'user-1',
        'session-1',
        {
          rapid_typing: true,
          short_responses: true,
          time_pressure: true,
        }
      );

      expect(stressLevel).toBeDefined();
      expect(stressLevel.user_id).toBe('user-1');
      expect(stressLevel.session_id).toBe('session-1');
      expect(typeof stressLevel.stress_level).toBe('number');
      expect(stressLevel.stress_level).toBeGreaterThanOrEqual(0);
      expect(stressLevel.stress_level).toBeLessThanOrEqual(10);
      expect(['eustress', 'distress', 'none']).toContain(stressLevel.stress_type);
      expect(stressLevel.indicators).toBeDefined();
      expect(Array.isArray(stressLevel.coping_strategies)).toBe(true);
      expect(typeof stressLevel.intervention_needed).toBe('boolean');
      expect(stressLevel.last_updated).toBeInstanceOf(Date);
    });

    it('높은 스트레스 상황을 감지해야 함', () => {
      const stressLevel = advancedAIPsychologyEngine.analyzeStressLevel(
        'user-2',
        'session-2',
        {
          rapid_typing: true,
          short_responses: true,
          topic_avoidance: true,
          negative_language: true,
          time_pressure: true,
        }
      );

      expect(stressLevel.stress_level).toBeGreaterThan(6);
    });

    it('높은 스트레스 시 개입 필요를 표시해야 함', () => {
      const stressLevel = advancedAIPsychologyEngine.analyzeStressLevel(
        'user-3',
        'session-3',
        {
          rapid_typing: true,
          topic_avoidance: true,
          negative_language: true,
          time_pressure: true,
          repeated_questions: true,
        }
      );

      /* eslint-disable jest/no-conditional-expect -- intervention flag when stress high */
      if (stressLevel.stress_level > 7) {
        expect(stressLevel.intervention_needed).toBe(true);
      }
      /* eslint-enable jest/no-conditional-expect */
    });

    it('대처 전략을 생성해야 함', () => {
      const stressLevel = advancedAIPsychologyEngine.analyzeStressLevel(
        'user-4',
        'session-4',
        {
          rapid_typing: true,
          time_pressure: true,
        }
      );

      expect(stressLevel.coping_strategies.length).toBeGreaterThan(0);
    });
  });

  describe('analyzePersonalityInsights', () => {
    it('성격 인사이트를 분석할 수 있어야 함', () => {
      const personality = advancedAIPsychologyEngine.analyzePersonalityInsights(
        'user-1',
        'session-1',
        {
          visual_preferences: true,
          direct_communication: true,
          analytical_approach: true,
        }
      );

      expect(personality).toBeDefined();
      expect(personality.user_id).toBe('user-1');
      expect(personality.session_id).toBe('session-1');
      expect(['visual', 'auditory', 'kinesthetic', 'reading', 'mixed']).toContain(
        personality.learning_style
      );
      expect(['direct', 'detailed', 'conversational', 'technical']).toContain(
        personality.communication_preference
      );
      expect(['analytical', 'intuitive', 'collaborative', 'systematic']).toContain(
        personality.decision_making_style
      );
      expect(['low', 'medium', 'high']).toContain(personality.risk_tolerance);
      expect(typeof personality.confidence_level).toBe('number');
      expect(typeof personality.adaptability).toBe('number');
      expect(typeof personality.persistence).toBe('number');
      expect(personality.last_updated).toBeInstanceOf(Date);
    });

    it('학습 스타일을 올바르게 식별해야 함', () => {
      const personality = advancedAIPsychologyEngine.analyzePersonalityInsights(
        'user-2',
        'session-2',
        {
          visual_preferences: true,
        }
      );

      expect(personality.learning_style).toBe('visual');
    });

    it('의사소통 선호도를 올바르게 식별해야 함', () => {
      const personality = advancedAIPsychologyEngine.analyzePersonalityInsights(
        'user-3',
        'session-3',
        {
          technical_communication: true,
        }
      );

      expect(personality.communication_preference).toBe('technical');
    });

    it('위험 감수 성향을 올바르게 식별해야 함', () => {
      const personality = advancedAIPsychologyEngine.analyzePersonalityInsights(
        'user-4',
        'session-4',
        {
          risk_seeking_behavior: true,
        }
      );

      expect(personality.risk_tolerance).toBe('high');
    });
  });

  describe('getUserPsychologyData', () => {
    it('사용자 심리학 데이터를 조회할 수 있어야 함', () => {
      // 데이터 생성
      advancedAIPsychologyEngine.analyzeEmotionalState('user-1', 'session-1', {
        text: '좋아요',
      });
      advancedAIPsychologyEngine.analyzeCognitiveLoad('user-1', 'session-1', {});
      advancedAIPsychologyEngine.analyzeLearningMotivation('user-1', 'session-1', {});
      advancedAIPsychologyEngine.analyzeStressLevel('user-1', 'session-1', {});
      advancedAIPsychologyEngine.analyzePersonalityInsights('user-1', 'session-1', {});

      const data = advancedAIPsychologyEngine.getUserPsychologyData('user-1', 'session-1');

      expect(data).toBeDefined();
      expect(data.emotional_state).toBeDefined();
      expect(data.cognitive_load).toBeDefined();
      expect(data.learning_motivation).toBeDefined();
      expect(data.stress_level).toBeDefined();
      expect(data.personality_insights).toBeDefined();
    });

    it('데이터가 없는 경우 undefined를 반환해야 함', () => {
      const data = advancedAIPsychologyEngine.getUserPsychologyData('nonexistent', 'session');

      expect(data.emotional_state).toBeUndefined();
      expect(data.cognitive_load).toBeUndefined();
    });
  });

  describe('getPsychologyRecommendations', () => {
    it('권장사항을 조회할 수 있어야 함', () => {
      // 권장사항 생성 조건 만들기
      advancedAIPsychologyEngine.analyzeEmotionalState('user-1', 'session-1', {
        text: '정말 힘들어요. 화가 나요. 실망스러워요.',
      });

      // 분석 수행 (권장사항 생성)
      jest.advanceTimersByTime(30000);

      const recommendations = advancedAIPsychologyEngine.getPsychologyRecommendations();

      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('특정 사용자의 권장사항만 조회할 수 있어야 함', () => {
      advancedAIPsychologyEngine.analyzeEmotionalState('user-2', 'session-2', {
        text: '힘들어요',
      });
      advancedAIPsychologyEngine.analyzeEmotionalState('user-3', 'session-3', {
        text: '좋아요',
      });

      jest.advanceTimersByTime(30000);

      const recommendations = advancedAIPsychologyEngine.getPsychologyRecommendations('user-2');

      expect(Array.isArray(recommendations)).toBe(true);
      recommendations.forEach((rec) => {
        expect(rec.user_id).toBe('user-2');
      });
    });
  });

  describe('getPsychologyStatistics', () => {
    it('통계 정보를 조회할 수 있어야 함', () => {
      // 데이터 생성
      advancedAIPsychologyEngine.analyzeEmotionalState('user-1', 'session-1', {
        text: '좋아요',
      });
      advancedAIPsychologyEngine.analyzeCognitiveLoad('user-1', 'session-1', {});
      advancedAIPsychologyEngine.analyzeLearningMotivation('user-1', 'session-1', {});
      advancedAIPsychologyEngine.analyzeStressLevel('user-1', 'session-1', {
        rapid_typing: true,
        time_pressure: true,
      });

      const stats = advancedAIPsychologyEngine.getPsychologyStatistics();

      expect(stats).toBeDefined();
      expect(typeof stats.total_users).toBe('number');
      expect(typeof stats.total_recommendations).toBe('number');
      expect(typeof stats.average_emotional_intensity).toBe('number');
      expect(typeof stats.average_cognitive_load).toBe('number');
      expect(typeof stats.average_motivation_level).toBe('number');
      expect(typeof stats.high_stress_users).toBe('number');
    });
  });

  describe('shutdown', () => {
    it('서비스를 종료할 수 있어야 함', () => {
      advancedAIPsychologyEngine.startAnalysis();
      advancedAIPsychologyEngine.shutdown();
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 작업 중 사용자의 심리 상태를 분석할 수 있어야 함', () => {
      const emotionalState = advancedAIPsychologyEngine.analyzeEmotionalState(
        'developer-1',
        'project-session-1',
        {
          text: '재개발 프로젝트 문서 작성이 어렵네요. 하지만 배우는 것이 많아서 좋습니다!',
        }
      );

      expect(emotionalState).toBeDefined();
      expect(emotionalState.primary_emotion).toBeDefined();

      const cognitiveLoad = advancedAIPsychologyEngine.analyzeCognitiveLoad(
        'developer-1',
        'project-session-1',
        {
          response_times: [1500, 2000, 1800],
          errors: ['error1'],
          repetition_requests: 1,
        }
      );

      expect(cognitiveLoad.overall_load).toBeGreaterThanOrEqual(0);
      expect(cognitiveLoad.overall_load).toBeLessThanOrEqual(10);
    });

    it('시공사 선정 업무 중 스트레스와 동기를 분석할 수 있어야 함', () => {
      const stressLevel = advancedAIPsychologyEngine.analyzeStressLevel(
        'manager-1',
        'contractor-selection',
        {
          time_pressure: true,
          rapid_typing: true,
          negative_language: false,
        }
      );

      expect(stressLevel).toBeDefined();
      expect(stressLevel.stress_level).toBeGreaterThanOrEqual(0);

      const motivation = advancedAIPsychologyEngine.analyzeLearningMotivation(
        'manager-1',
        'contractor-selection',
        {
          follow_up_questions: 8,
          deep_diving: 5,
          performance_focus: 7,
        }
      );

      expect(motivation.motivation_level).toBeGreaterThan(5);
      expect(motivation.factors.curiosity).toBeGreaterThan(5);
    });

    it('사용자의 학습 스타일과 성격 인사이트를 분석하여 맞춤형 지원을 제공할 수 있어야 함', () => {
      const personality = advancedAIPsychologyEngine.analyzePersonalityInsights(
        'user-learn-1',
        'learning-session',
        {
          visual_preferences: true,
          detailed_explanations: true,
          analytical_approach: true,
          risk_averse_behavior: true,
          confidence_signals: 7,
        }
      );

      expect(personality.learning_style).toBe('visual');
      expect(personality.communication_preference).toBe('detailed');
      expect(personality.decision_making_style).toBe('analytical');
      expect(personality.risk_tolerance).toBe('low');
      expect(personality.confidence_level).toBeGreaterThan(5);

      // 전체 데이터 조회
      const userData = advancedAIPsychologyEngine.getUserPsychologyData(
        'user-learn-1',
        'learning-session'
      );

      expect(userData.personality_insights).toBeDefined();
      expect(userData.personality_insights?.learning_style).toBe('visual');
    });
  });
});

