/**
 * advancedBrainwashAPI 서비스 테스트
 * 고도화된 브레인워시 API 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import { advancedBrainwashAPI } from '../advancedBrainwashAPI';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';
import type {
  BrainwashRequest,
  PsychologicalProfile,
} from '../advancedBrainwashAPI';

// fetch 모킹
installJestFetchMock();

// console 모킹
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('advancedBrainwashAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(global.fetch).mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  const createMockRequest = (): BrainwashRequest => ({
    target_message: {
      id: 'msg-1',
      content: '시공사 선정에 대해 논의합시다',
      sender: 'user1',
      timestamp: new Date().toISOString(),
    },
    target_intent: '시공사 선정 추진',
    personality_setting: '신중한',
    construction_preference: '강삼성',
    influence_level: 'moderate',
    active_engines: ['neural'],
    ethical_constraints: true,
    strategy_type: 'collaborative',
  });

  describe('generateNeuralBrainwash', () => {
    it('신경망 기반 메시지를 생성할 수 있어야 함', async () => {
      const mockResponse = {
        neural_message: { full_message: '신경망 기반 생성 메시지' },
        effectiveness_prediction: 85,
        generation_metadata: {
          persuasion_potential: 0.8,
          emotional_impact: 0.7,
          cognitive_load_estimate: 0.6,
          neural_confidence: 0.75,
        },
        manipulation_analysis: { total_score: 0.65 },
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request = createMockRequest();
      const result = await advancedBrainwashAPI.generateNeuralBrainwash(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.generated_messages)).toBe(true);
      expect(result.generated_messages.length).toBeGreaterThan(0);
      expect(result.psychological_analysis).toBeDefined();
      expect(Array.isArray(result.safety_warnings)).toBe(true);
      expect(result.generation_metadata).toBeDefined();
    });

    it('API 오류 시 폴백 응답을 반환해야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const request = createMockRequest();
      const result = await advancedBrainwashAPI.generateNeuralBrainwash(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.generated_messages.length).toBeGreaterThan(0);
    });

    it('HTTP 오류 시 폴백 응답을 반환해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const request = createMockRequest();
      const result = await advancedBrainwashAPI.generateNeuralBrainwash(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('윤리적 제약이 있을 때 적절한 응답을 생성해야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const request = createMockRequest();
      request.ethical_constraints = true;
      const result = await advancedBrainwashAPI.generateNeuralBrainwash(request);

      expect(result.generated_messages[0].safety_score).toBeGreaterThan(0.5);
    });

    it('생성된 메시지가 올바른 구조를 가져야 함', async () => {
      const mockResponse = {
        neural_message: { full_message: '테스트 메시지' },
        effectiveness_prediction: 80,
        generation_metadata: {},
        manipulation_analysis: {},
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request = createMockRequest();
      const result = await advancedBrainwashAPI.generateNeuralBrainwash(request);

      const message = result.generated_messages[0];
      expect(message.id).toBeDefined();
      expect(message.content).toBeDefined();
      expect(typeof message.confidence).toBe('number');
      expect(message.type).toBe('neural');
      expect(message.psychological_metrics).toBeDefined();
      expect(typeof message.psychological_metrics.persuasion_potential).toBe('number');
      expect(typeof message.psychological_metrics.emotional_impact).toBe('number');
      expect(typeof message.psychological_metrics.cognitive_load).toBe('number');
      expect(typeof message.psychological_metrics.neural_activation).toBe('number');
      expect(typeof message.psychological_metrics.manipulation_score).toBe('number');
      expect(typeof message.safety_score).toBe('number');
      expect(message.generation_engine).toBeDefined();
    });
  });

  describe('generateExtremePressure', () => {
    it('윤리적 제약이 있을 때 에러를 발생시켜야 함', async () => {
      const request = createMockRequest();
      request.ethical_constraints = true;

      await expect(
        advancedBrainwashAPI.generateExtremePressure(request)
      ).rejects.toThrow('윤리적 제약');
    });

    it('윤리적 제약이 없을 때 극도 설득 메시지를 생성할 수 있어야 함', async () => {
      const mockResponse = {
        extreme_message: '극도 설득 메시지',
        effectiveness_analysis: { predicted_success_rate: 95 },
        manipulation_score: 0.9,
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request = createMockRequest();
      request.ethical_constraints = false;
      const result = await advancedBrainwashAPI.generateExtremePressure(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.generated_messages[0].type).toBe('extreme');
      expect(result.generated_messages[0].safety_score).toBeLessThan(0.5);
      expect(result.safety_warnings.length).toBeGreaterThan(0);
    });

    it('API 오류 시 에러를 전파해야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('API error'));

      const request = createMockRequest();
      request.ethical_constraints = false;

      await expect(
        advancedBrainwashAPI.generateExtremePressure(request)
      ).rejects.toThrow();
    });
  });

  describe('generateQuantumManipulation', () => {
    it('양자 조작 메시지를 생성할 수 있어야 함', async () => {
      const mockResponse = {
        response_text: '양자 기반 메시지',
        quantum_confidence: 0.88,
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request = createMockRequest();
      const result = await advancedBrainwashAPI.generateQuantumManipulation(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.generated_messages[0].type).toBe('quantum');
      expect(result.generated_messages[0].generation_engine).toBe('quantum_conversation');
    });

    it('API 오류 시 폴백 응답을 반환해야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const request = createMockRequest();
      const result = await advancedBrainwashAPI.generateQuantumManipulation(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('generateHybridBrainwash', () => {
    it('하이브리드 메시지를 생성할 수 있어야 함', async () => {
      const mockResponse = {
        hybrid_message: '하이브리드 메시지',
        hybrid_effectiveness: 92,
        manipulation_analysis: { total_score: 0.8 },
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request = createMockRequest();
      const result = await advancedBrainwashAPI.generateHybridBrainwash(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.generated_messages[0].generation_engine).toBe('hybrid_neural_assertive');
    });

    it('API 오류 시 폴백 응답을 반환해야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const request = createMockRequest();
      const result = await advancedBrainwashAPI.generateHybridBrainwash(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('analyzePsychologicalProfile', () => {
    it('심리 프로파일을 분석할 수 있어야 함', async () => {
      const mockProfile: PsychologicalProfile = {
        emotional_state: '불안',
        cognitive_biases: ['확증 편향'],
        vulnerability_factors: ['경제적 압박'],
        resistance_level: 0.6,
        optimal_approach: '공감적 접근',
        manipulation_susceptibility: 0.7,
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ psychological_profile: mockProfile }),
      });

      const result = await advancedBrainwashAPI.analyzePsychologicalProfile(
        '테스트 메시지',
        ['대화 기록 1', '대화 기록 2']
      );

      expect(result).toBeDefined();
      expect(result.emotional_state).toBeDefined();
      expect(Array.isArray(result.cognitive_biases)).toBe(true);
      expect(Array.isArray(result.vulnerability_factors)).toBe(true);
      expect(typeof result.resistance_level).toBe('number');
      expect(result.optimal_approach).toBeDefined();
      expect(typeof result.manipulation_susceptibility).toBe('number');
    });

    it('API 오류 시 폴백 프로파일을 반환해야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await advancedBrainwashAPI.analyzePsychologicalProfile(
        '테스트 메시지',
        []
      );

      expect(result).toBeDefined();
      expect(result.emotional_state).toBeDefined();
      expect(Array.isArray(result.cognitive_biases)).toBe(true);
    });

    it('HTTP 오류 시 폴백 프로파일을 반환해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await advancedBrainwashAPI.analyzePsychologicalProfile(
        '테스트 메시지',
        []
      );

      expect(result).toBeDefined();
      expect(result.emotional_state).toBeDefined();
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 설득 메시지를 생성할 수 있어야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const request: BrainwashRequest = {
        target_message: {
          id: 'redev-msg-1',
          content: '재개발 프로젝트 진행에 대한 의견을 나눕시다',
          sender: '관리자',
          timestamp: new Date().toISOString(),
        },
        target_intent: '재개발 프로젝트 찬성',
        personality_setting: '신중한',
        construction_preference: '강삼성',
        influence_level: 'moderate',
        active_engines: ['neural'],
        ethical_constraints: true,
        strategy_type: 'collaborative',
      };

      const result = await advancedBrainwashAPI.generateNeuralBrainwash(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.generated_messages.length).toBeGreaterThan(0);
      expect(result.psychological_analysis).toBeDefined();
      expect(result.generation_metadata).toBeDefined();
    });

    it('시공사 선정 관련 극도 설득 메시지를 생성할 수 있어야 함', async () => {
      const mockResponse = {
        extreme_message: '시공사 선정은 시급합니다',
        effectiveness_analysis: { predicted_success_rate: 95 },
        manipulation_score: 0.9,
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request: BrainwashRequest = {
        target_message: {
          id: 'contractor-msg-1',
          content: '시공사 선정에 대해 논의합시다',
          sender: '위원장',
          timestamp: new Date().toISOString(),
        },
        target_intent: '시공사 즉시 선정',
        personality_setting: '결단력 있는',
        construction_preference: '대우건설',
        influence_level: 'intensive',
        active_engines: ['extreme', 'neural'],
        ethical_constraints: false,
        strategy_type: 'aggressive',
      };

      const result = await advancedBrainwashAPI.generateExtremePressure(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.generated_messages[0].type).toBe('extreme');
      expect(result.safety_warnings.length).toBeGreaterThan(0);
    });

    it('다양한 영향 수준으로 메시지를 생성할 수 있어야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      const influenceLevels: Array<'gentle' | 'moderate' | 'assertive' | 'intensive'> = [
        'gentle',
        'moderate',
        'assertive',
        'intensive',
      ];

      for (const level of influenceLevels) {
        const request = createMockRequest();
        request.influence_level = level;

        const result = await advancedBrainwashAPI.generateNeuralBrainwash(request);

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
      }
    });

    it('심리 프로파일 분석을 통해 최적 접근법을 찾을 수 있어야 함', async () => {
      const mockProfile: PsychologicalProfile = {
        emotional_state: '신중한',
        cognitive_biases: ['확증 편향', '손실 회피'],
        vulnerability_factors: ['경제적 우려', '미래 불확실성'],
        resistance_level: 0.7,
        optimal_approach: '정보 제공 및 공감',
        manipulation_susceptibility: 0.5,
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ psychological_profile: mockProfile }),
      });

      const conversationHistory = [
        '재개발에 대해 생각해봐야 할 것 같습니다',
        '비용이 부담스럽습니다',
        '장기적으로는 유리할 수도 있습니다',
      ];

      const result = await advancedBrainwashAPI.analyzePsychologicalProfile(
        '재개발 프로젝트 진행 제안',
        conversationHistory
      );

      expect(result).toBeDefined();
      expect(result.optimal_approach).toBeDefined();
      expect(result.resistance_level).toBeGreaterThanOrEqual(0);
      expect(result.resistance_level).toBeLessThanOrEqual(1);
      expect(result.manipulation_susceptibility).toBeGreaterThanOrEqual(0);
      expect(result.manipulation_susceptibility).toBeLessThanOrEqual(1);
    });
  });
});

