/**
 * advancedAnalytics 서비스 테스트
 * 고도화된 분석 서비스 테스트
 */

import { advancedAnalyticsService } from '../advancedAnalytics';
import type {
  AdvancedAnalysisResult,
  PredictiveInsight,
  OptimizationStrategy,
} from '../advancedAnalytics';

// console 모킹
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('advancedAnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedAnalyticsService).toBeDefined();
    });
  });

  describe('analyzeAdvancedContext', () => {
    it('빈 메시지 배열로 분석할 수 있어야 함', async () => {
      const result = await advancedAnalyticsService.analyzeAdvancedContext([], []);

      expect(result).toBeDefined();
      expect(result.temporal_intelligence).toBeDefined();
      expect(result.emotional_intelligence).toBeDefined();
      expect(result.social_intelligence).toBeDefined();
      expect(result.cultural_intelligence).toBeDefined();
      expect(result.strategic_intelligence).toBeDefined();
      expect(typeof result.overall_confidence).toBe('number');
      expect(result.analysis_depth).toBeDefined();
      expect(typeof result.processing_time).toBe('number');
    });

    it('기본 분석 깊이로 분석할 수 있어야 함', async () => {
      const messages = [
        {
          content: '안녕하세요',
          sender: 'user1',
          timestamp: new Date().toISOString(),
        },
      ];

      const result = await advancedAnalyticsService.analyzeAdvancedContext(
        messages,
        ['user1']
      );

      expect(result.analysis_depth).toBe('expert');
      expect(result.overall_confidence).toBeGreaterThanOrEqual(0);
      expect(result.overall_confidence).toBeLessThanOrEqual(1);
    });

    it('다양한 분석 깊이로 분석할 수 있어야 함', async () => {
      const messages = [
        {
          content: '재개발 프로젝트에 대해 논의하고 싶습니다',
          sender: 'user1',
          timestamp: new Date().toISOString(),
        },
        {
          content: '네, 좋은 아이디어입니다',
          sender: 'user2',
          timestamp: new Date(Date.now() + 1000).toISOString(),
        },
      ];

      const depths = ['basic', 'expert', 'genius'];
      for (const depth of depths) {
        const result = await advancedAnalyticsService.analyzeAdvancedContext(
          messages,
          ['user1', 'user2'],
          depth
        );

        expect(result.analysis_depth).toBe(depth);
        expect(result.overall_confidence).toBeGreaterThanOrEqual(0);
      }
    });

    it('시간적 지능 분석 결과가 올바른 구조를 가져야 함', async () => {
      const now = Date.now();
      const messages = [
        {
          content: '메시지 1',
          sender: 'user1',
          timestamp: new Date(now).toISOString(),
        },
        {
          content: '메시지 2',
          sender: 'user2',
          timestamp: new Date(now + 60000).toISOString(),
        },
        {
          content: '메시지 3',
          sender: 'user1',
          timestamp: new Date(now + 120000).toISOString(),
        },
      ];

      const result = await advancedAnalyticsService.analyzeAdvancedContext(
        messages,
        ['user1', 'user2']
      );

      expect(result.temporal_intelligence.confidence).toBeGreaterThanOrEqual(0);
      expect(result.temporal_intelligence.patterns.rhythm).toBeDefined();
      expect(typeof result.temporal_intelligence.patterns.avg_interval_seconds).toBe('number');
      expect(typeof result.temporal_intelligence.patterns.urgency_score).toBe('number');
      expect(typeof result.temporal_intelligence.patterns.consistency_score).toBe('number');
      expect(Array.isArray(result.temporal_intelligence.insights)).toBe(true);
      expect(result.temporal_intelligence.metrics.total_messages).toBe(3);
      expect(typeof result.temporal_intelligence.metrics.time_span_hours).toBe('number');
      expect(typeof result.temporal_intelligence.metrics.messages_per_hour).toBe('number');
    });

    it('감정적 지능 분석 결과가 올바른 구조를 가져야 함', async () => {
      const messages = [
        {
          content: '정말 좋은 결과입니다!',
          sender: 'user1',
          timestamp: new Date().toISOString(),
        },
        {
          content: '만족스럽습니다',
          sender: 'user2',
          timestamp: new Date(Date.now() + 1000).toISOString(),
        },
      ];

      const result = await advancedAnalyticsService.analyzeAdvancedContext(
        messages,
        ['user1', 'user2']
      );

      expect(result.emotional_intelligence.confidence).toBeGreaterThanOrEqual(0);
      expect(typeof result.emotional_intelligence.emotions.positive).toBe('number');
      expect(typeof result.emotional_intelligence.emotions.negative).toBe('number');
      expect(typeof result.emotional_intelligence.emotions.neutral).toBe('number');
      expect(typeof result.emotional_intelligence.detailed_emotions.joy).toBe('number');
      expect(typeof result.emotional_intelligence.detailed_emotions.satisfaction).toBe('number');
      expect(typeof result.emotional_intelligence.detailed_emotions.concern).toBe('number');
      expect(typeof result.emotional_intelligence.detailed_emotions.frustration).toBe('number');
      expect(typeof result.emotional_intelligence.detailed_emotions.professional).toBe('number');
      expect(Array.isArray(result.emotional_intelligence.insights)).toBe(true);
      expect(result.emotional_intelligence.metrics.dominant_emotion).toBeDefined();
      expect(typeof result.emotional_intelligence.metrics.emotion_strength).toBe('number');
      expect(typeof result.emotional_intelligence.metrics.emotion_volatility).toBe('number');
    });

    it('사회적 지능 분석 결과가 올바른 구조를 가져야 함', async () => {
      const messages = [
        {
          content: '안녕하세요. 회의를 시작하겠습니다',
          sender: 'user1',
          timestamp: new Date().toISOString(),
        },
        {
          content: '네, 알겠습니다',
          sender: 'user2',
          timestamp: new Date(Date.now() + 1000).toISOString(),
        },
      ];

      const result = await advancedAnalyticsService.analyzeAdvancedContext(
        messages,
        ['user1', 'user2']
      );

      expect(result.social_intelligence.confidence).toBeGreaterThanOrEqual(0);
      expect(typeof result.social_intelligence.dynamics.participation_balance).toBe('number');
      expect(typeof result.social_intelligence.dynamics.hierarchy_detected).toBe('boolean');
      expect(result.social_intelligence.dynamics.interaction_patterns.pattern_type).toBeDefined();
      expect(typeof result.social_intelligence.dynamics.interaction_patterns.turn_taking_balance).toBe('number');
      expect(Array.isArray(result.social_intelligence.insights)).toBe(true);
    });

    it('문화적 지능 분석 결과가 올바른 구조를 가져야 함', async () => {
      const messages = [
        {
          content: '우리 모두 함께 노력해야 합니다',
          sender: 'user1',
          timestamp: new Date().toISOString(),
        },
        {
          content: '선배님께서 좋은 의견을 주셨습니다',
          sender: 'user2',
          timestamp: new Date(Date.now() + 1000).toISOString(),
        },
      ];

      const result = await advancedAnalyticsService.analyzeAdvancedContext(
        messages,
        ['user1', 'user2']
      );

      expect(result.cultural_intelligence.confidence).toBeGreaterThanOrEqual(0);
      expect(typeof result.cultural_intelligence.cultural_markers.collectivism).toBe('number');
      expect(typeof result.cultural_intelligence.cultural_markers.hierarchy).toBe('number');
      expect(typeof result.cultural_intelligence.cultural_markers.harmony).toBe('number');
      expect(typeof result.cultural_intelligence.cultural_markers.indirect_communication).toBe('number');
      expect(Array.isArray(result.cultural_intelligence.insights)).toBe(true);
    });

    it('전략적 지능 분석 결과가 올바른 구조를 가져야 함', async () => {
      const messages = [
        {
          content: '이 문제를 해결하기 위해 방법을 찾아봅시다',
          sender: 'user1',
          timestamp: new Date().toISOString(),
        },
        {
          content: '합의를 이뤄야 합니다',
          sender: 'user2',
          timestamp: new Date(Date.now() + 1000).toISOString(),
        },
      ];

      const result = await advancedAnalyticsService.analyzeAdvancedContext(
        messages,
        ['user1', 'user2']
      );

      expect(result.strategic_intelligence.confidence).toBeGreaterThanOrEqual(0);
      expect(typeof result.strategic_intelligence.strategies.persuasion).toBe('number');
      expect(typeof result.strategic_intelligence.strategies.information_seeking).toBe('number');
      expect(typeof result.strategic_intelligence.strategies.consensus_building).toBe('number');
      expect(typeof result.strategic_intelligence.strategies.problem_solving).toBe('number');
      expect(Array.isArray(result.strategic_intelligence.insights)).toBe(true);
      expect(typeof result.strategic_intelligence.complexity).toBe('number');
    });
  });

  describe('generateConversationPredictions', () => {
    it('빈 대화 기록으로 예측할 수 있어야 함', async () => {
      const predictions = await advancedAnalyticsService.generateConversationPredictions([]);

      expect(Array.isArray(predictions)).toBe(true);
      if (predictions.length > 0) {
        expect(predictions[0].prediction_type).toBe('insufficient_data');
      }
    });

    it('대화 기록으로 예측을 생성할 수 있어야 함', async () => {
      const conversationHistory = [
        {
          content: '시공사 선정에 대해 논의합시다',
          sender: 'user1',
          timestamp: new Date().toISOString(),
        },
        {
          content: '좋은 제안입니다',
          sender: 'user2',
          timestamp: new Date(Date.now() + 1000).toISOString(),
        },
      ];

      const predictions = await advancedAnalyticsService.generateConversationPredictions(
        conversationHistory,
        5
      );

      expect(Array.isArray(predictions)).toBe(true);
      expect(predictions.length).toBeLessThanOrEqual(5);

      predictions.forEach((prediction) => {
        expect(prediction.prediction_type).toBeDefined();
        expect(prediction.prediction_content).toBeDefined();
        expect(typeof prediction.confidence).toBe('number');
        expect(prediction.time_horizon).toBeDefined();
        expect(Array.isArray(prediction.supporting_evidence)).toBe(true);
        expect(Array.isArray(prediction.risk_factors)).toBe(true);
      });
    });

    it('예측 지평선을 지정할 수 있어야 함', async () => {
      const conversationHistory = [
        {
          content: '재개발 프로젝트 진행 상황',
          sender: 'user1',
          timestamp: new Date().toISOString(),
        },
      ];

      const predictions = await advancedAnalyticsService.generateConversationPredictions(
        conversationHistory,
        3
      );

      expect(predictions.length).toBeLessThanOrEqual(3);
    });
  });

  describe('optimizeConversationRealTime', () => {
    it('현재 메시지와 컨텍스트로 최적화할 수 있어야 함', async () => {
      const currentMessage = {
        content: '시공사 선정 기준을 논의합시다',
        sender: 'user1',
        timestamp: new Date().toISOString(),
      };

      const conversationContext = {
        messages: [
          {
            content: '안녕하세요',
            sender: 'user2',
            timestamp: new Date(Date.now() - 1000).toISOString(),
          },
        ],
        participants: ['user1', 'user2'],
      };

      const result = await advancedAnalyticsService.optimizeConversationRealTime(
        currentMessage,
        conversationContext,
        ['harmony', 'efficiency']
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.strategies)).toBe(true);
      expect(result.recommendations).toBeDefined();
      expect(result.metrics).toBeDefined();

      result.strategies.forEach((strategy) => {
        expect(strategy.goal).toBeDefined();
        expect(Array.isArray(strategy.tactics)).toBe(true);
        expect(['low', 'medium', 'high']).toContain(strategy.priority);
        expect(typeof strategy.context_alignment).toBe('number');
        expect(typeof strategy.success_probability).toBe('number');
      });

      expect(result.recommendations.immediate_actions).toBeDefined();
      expect(result.recommendations.tone_adjustments).toBeDefined();
      expect(result.recommendations.content_suggestions).toBeDefined();
      expect(result.recommendations.strategic_pivots).toBeDefined();

      expect(typeof result.metrics.context_coherence).toBe('number');
      expect(typeof result.metrics.optimization_urgency).toBe('number');
      expect(typeof result.metrics.success_probability).toBe('number');
    });

    it('최적화 목표를 지정할 수 있어야 함', async () => {
      const currentMessage = {
        content: '문제 해결 방안을 찾아봅시다',
        sender: 'user1',
        timestamp: new Date().toISOString(),
      };

      const conversationContext = {
        messages: [],
        participants: ['user1', 'user2'],
      };

      const goals = ['harmony', 'efficiency', 'resolution'];
      const result = await advancedAnalyticsService.optimizeConversationRealTime(
        currentMessage,
        conversationContext,
        goals
      );

      expect(result.strategies.length).toBe(goals.length);
    });

    it('현재 메시지 없이도 최적화할 수 있어야 함', async () => {
      const conversationContext = {
        messages: [
          {
            content: '대화 시작',
            sender: 'user1',
            timestamp: new Date().toISOString(),
          },
        ],
        participants: ['user1'],
      };

      const result = await advancedAnalyticsService.optimizeConversationRealTime(
        null,
        conversationContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.strategies)).toBe(true);
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 대화를 분석할 수 있어야 함', async () => {
      const messages = [
        {
          content: '재개발 프로젝트를 진행하려고 합니다',
          sender: '관리자',
          timestamp: new Date().toISOString(),
        },
        {
          content: '좋은 계획입니다. 우리 모두 함께 노력하겠습니다',
          sender: '주민1',
          timestamp: new Date(Date.now() + 60000).toISOString(),
        },
        {
          content: '분담금에 대해 걱정이 있습니다',
          sender: '주민2',
          timestamp: new Date(Date.now() + 120000).toISOString(),
        },
        {
          content: '문제를 해결하는 방법을 찾아봅시다',
          sender: '관리자',
          timestamp: new Date(Date.now() + 180000).toISOString(),
        },
      ];

      const result = await advancedAnalyticsService.analyzeAdvancedContext(
        messages,
        ['관리자', '주민1', '주민2'],
        'expert'
      );

      expect(result.overall_confidence).toBeGreaterThanOrEqual(0);
      expect(result.temporal_intelligence.metrics.total_messages).toBe(4);
      expect(result.emotional_intelligence.emotions).toBeDefined();
      expect(result.social_intelligence.dynamics.participation_balance).toBeGreaterThanOrEqual(0);
      expect(result.strategic_intelligence.strategies.problem_solving).toBeGreaterThanOrEqual(0);
    });

    it('시공사 선정 관련 예측을 생성할 수 있어야 함', async () => {
      const conversationHistory = [
        {
          content: '시공사 선정이 긴급합니다',
          sender: '관리자',
          timestamp: new Date().toISOString(),
        },
        {
          content: '여러 업체를 검토해봅시다',
          sender: '위원1',
          timestamp: new Date(Date.now() + 1000).toISOString(),
        },
        {
          content: '비용과 품질을 모두 고려해야 합니다',
          sender: '위원2',
          timestamp: new Date(Date.now() + 2000).toISOString(),
        },
      ];

      const predictions = await advancedAnalyticsService.generateConversationPredictions(
        conversationHistory,
        5
      );

      expect(predictions.length).toBeGreaterThan(0);
      expect(predictions.some((p) => p.prediction_type === 'topic_evolution')).toBe(true);
      expect(predictions.some((p) => p.prediction_type === 'emotional_trajectory')).toBe(true);
    });

    it('실시간 대화 최적화를 통해 권장사항을 받을 수 있어야 함', async () => {
      const currentMessage = {
        content: '모든 의견을 수렴하여 합의를 이뤄야 합니다',
        sender: '관리자',
        timestamp: new Date().toISOString(),
      };

      const conversationContext = {
        messages: [
          {
            content: '시공사 선정 기준 논의',
            sender: '위원1',
            timestamp: new Date(Date.now() - 1000).toISOString(),
          },
        ],
        participants: ['관리자', '위원1', '위원2'],
      };

      const result = await advancedAnalyticsService.optimizeConversationRealTime(
        currentMessage,
        conversationContext,
        ['harmony', 'efficiency', 'resolution']
      );

      expect(result.strategies.length).toBe(3);
      expect(result.recommendations.immediate_actions.length).toBeGreaterThanOrEqual(0);
      expect(result.recommendations.tone_adjustments.length).toBeGreaterThanOrEqual(0);
      expect(result.recommendations.content_suggestions.length).toBeGreaterThanOrEqual(0);
      expect(result.metrics.success_probability).toBeGreaterThanOrEqual(0);
      expect(result.metrics.success_probability).toBeLessThanOrEqual(1);
    });

    it('복잡한 다차원 분석을 수행할 수 있어야 함', async () => {
      const now = Date.now();
      const messages = Array.from({ length: 10 }, (_, i) => ({
        content: `메시지 ${i + 1}: 재개발 프로젝트 ${i % 2 === 0 ? '좋은' : '어려운'} 상황입니다`,
        sender: i % 2 === 0 ? 'user1' : 'user2',
        timestamp: new Date(now + i * 60000).toISOString(),
      }));

      const result = await advancedAnalyticsService.analyzeAdvancedContext(
        messages,
        ['user1', 'user2'],
        'genius'
      );

      expect(result.analysis_depth).toBe('genius');
      expect(result.temporal_intelligence.metrics.total_messages).toBe(10);
      expect(result.overall_confidence).toBeGreaterThan(0);
      expect(result.processing_time).toBeGreaterThan(0);

      // 고급 분석 결과 확인
      expect(result.strategic_intelligence.complexity).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.strategic_intelligence.insights)).toBe(true);
      // 인사이트가 있거나 복잡도가 0 이상이면 정상
      expect(
        result.strategic_intelligence.insights.length > 0 || 
        result.strategic_intelligence.complexity >= 0
      ).toBe(true);
    });
  });
});

