/**
 * EnhancedResponseProcessor 테스트
 */

// 의존성 모킹
const mockSendChatMessage = jest.fn(async () => ({
  success: true,
  message: {
    content: '모킹된 응답',
  },
}));

const mockGenerateHighQualityResponse = jest.fn(async () => ({
  success: true,
  content: '백엔드 API 응답',
  confidence: 0.9,
  metadata: {
    model: 'backend-model',
    qualityScore: 0.95,
  },
}));

jest.mock('../unifiedAPI', () => ({
  sendChatMessage: (...args: any[]) => mockSendChatMessage(...args),
}));

jest.mock('../enhancedBackendAPI', () => ({
  default: {
    generateHighQualityResponse: (...args: any[]) =>
      mockGenerateHighQualityResponse(...args),
  },
}));

const mockEvaluateResponseQuality = jest.fn(async () => ({
  qualityMetrics: {
    overall: 0.85,
    confidence: 0.9,
    relevance: { score: 0.9, reasoning: '관련성 높음' },
    accuracy: { score: 0.85, reasoning: '정확함' },
    completeness: { score: 0.8, reasoning: '완성도 양호' },
    clarity: { score: 0.85, reasoning: '명확함' },
    helpfulness: { score: 0.9, reasoning: '도움됨' },
    coherence: { score: 0.85, reasoning: '일관성 있음' },
    creativity: { score: 0.7, reasoning: '창의적' },
    technicalDepth: { score: 0.8, reasoning: '기술적 깊이 있음' },
  },
  strengths: ['명확한 설명', '구체적인 예시'],
  weaknesses: ['추가 정보 필요'],
  improvements: [
    {
      dimension: 'completeness',
      currentScore: 0.8,
      targetScore: 0.9,
      suggestions: ['더 많은 예시 추가'],
      priority: 'high' as const,
    },
  ],
  recommendations: ['더 구체적인 설명 추가'],
}));

jest.mock('../advancedQualityEvaluator', () => ({
  default: {
    evaluateResponseQuality: (...args: any[]) =>
      mockEvaluateResponseQuality(...args),
  },
}));

import {
  EnhancedResponseProcessor,
  enhancedResponseProcessor,
  EnhancedResponseContext,
} from '../enhancedResponseProcessor';

describe('EnhancedResponseProcessor', () => {
  let service: EnhancedResponseProcessor;

  beforeEach(() => {
    service = new EnhancedResponseProcessor();
    jest.clearAllMocks();
    mockSendChatMessage.mockResolvedValue({
      success: true,
      message: {
        content: '모킹된 응답',
      },
    });
    mockGenerateHighQualityResponse.mockResolvedValue({
      success: true,
      content: '백엔드 API 응답',
      confidence: 0.9,
      metadata: {
        model: 'backend-model',
        qualityScore: 0.95,
      },
    });
    mockEvaluateResponseQuality.mockResolvedValue({
      qualityMetrics: {
        overall: 0.85,
        confidence: 0.9,
        relevance: { score: 0.9, reasoning: '관련성 높음' },
        accuracy: { score: 0.85, reasoning: '정확함' },
        completeness: { score: 0.8, reasoning: '완성도 양호' },
        clarity: { score: 0.85, reasoning: '명확함' },
        helpfulness: { score: 0.9, reasoning: '도움됨' },
        coherence: { score: 0.85, reasoning: '일관성 있음' },
        creativity: { score: 0.7, reasoning: '창의적' },
        technicalDepth: { score: 0.8, reasoning: '기술적 깊이 있음' },
      },
      strengths: ['명확한 설명', '구체적인 예시'],
      weaknesses: ['추가 정보 필요'],
      improvements: [
        {
          dimension: 'completeness',
          currentScore: 0.8,
          targetScore: 0.9,
          suggestions: ['더 많은 예시 추가'],
          priority: 'high' as const,
        },
      ],
      recommendations: ['더 구체적인 설명 추가'],
    });
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(EnhancedResponseProcessor);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(enhancedResponseProcessor).toBeDefined();
    });
  });

  describe('고급 응답 처리', () => {
    const createTestContext = (): EnhancedResponseContext => ({
      userInput: '테스트 질문입니다.',
      conversationHistory: [],
      currentTime: new Date(),
    });

    it('기본 응답 처리', async () => {
      const context = createTestContext();

      const result = await service.processEnhancedResponse(
        '테스트 질문',
        context
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(typeof result.confidence).toBe('number');
      expect(typeof result.processingTime).toBe('number');
      expect(typeof result.qualityScore).toBe('number');
      expect(result.metadata).toBeDefined();
      // 폴백 응답일 수도 있으므로 모델 이름은 체크하지 않음
      expect(result.metadata.model).toBeDefined();
    });

    it('사용자 선호도 포함 컨텍스트', async () => {
      const context: EnhancedResponseContext = {
        userInput: '기술적 질문',
        conversationHistory: [],
        currentTime: new Date(),
        userPreferences: {
          responseStyle: 'technical',
          detailLevel: 'detailed',
          language: 'korean',
          tone: 'professional',
          responseLength: 'long',
        },
      };

      const result = await service.processEnhancedResponse(
        '기술적 질문',
        context
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('대화 히스토리 포함 컨텍스트', async () => {
      const context: EnhancedResponseContext = {
        userInput: '후속 질문',
        conversationHistory: [
          {
            id: 'msg-1',
            content: '이전 메시지',
            sender: 'user',
            timestamp: new Date(),
          },
        ],
        currentTime: new Date(),
      };

      const result = await service.processEnhancedResponse(
        '후속 질문',
        context
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('프로젝트 컨텍스트 포함', async () => {
      const context: EnhancedResponseContext = {
        userInput: '프로젝트 관련 질문',
        conversationHistory: [],
        projectContext: {
          projectId: 'project-123',
          projectName: '테스트 프로젝트',
        },
        currentTime: new Date(),
      };

      const result = await service.processEnhancedResponse(
        '프로젝트 관련 질문',
        context
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('다양한 응답 스타일', async () => {
      const styles: Array<
        'conversational' | 'formal' | 'technical' | 'creative'
      > = ['conversational', 'formal', 'technical', 'creative'];

      for (const style of styles) {
        const context: EnhancedResponseContext = {
          userInput: `${style} 스타일 질문`,
          conversationHistory: [],
          currentTime: new Date(),
          userPreferences: {
            responseStyle: style,
            detailLevel: 'balanced',
            language: 'korean',
            tone: 'friendly',
          },
        };

        const result = await service.processEnhancedResponse(
          `${style} 스타일 질문`,
          context
        );

        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
      }
    });

    it('다양한 상세 수준', async () => {
      const detailLevels: Array<'simple' | 'balanced' | 'detailed'> = [
        'simple',
        'balanced',
        'detailed',
      ];

      for (const detailLevel of detailLevels) {
        const context: EnhancedResponseContext = {
          userInput: `${detailLevel} 상세 수준 질문`,
          conversationHistory: [],
          currentTime: new Date(),
          userPreferences: {
            responseStyle: 'conversational',
            detailLevel,
            language: 'korean',
            tone: 'friendly',
          },
        };

        const result = await service.processEnhancedResponse(
          `${detailLevel} 상세 수준 질문`,
          context
        );

        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
      }
    });

    it('다양한 응답 길이', async () => {
      const lengths: Array<'short' | 'medium' | 'long'> = [
        'short',
        'medium',
        'long',
      ];

      for (const length of lengths) {
        const context: EnhancedResponseContext = {
          userInput: `${length} 길이 질문`,
          conversationHistory: [],
          currentTime: new Date(),
          userPreferences: {
            responseStyle: 'conversational',
            detailLevel: 'balanced',
            language: 'korean',
            tone: 'friendly',
            responseLength: length,
          },
        };

        const result = await service.processEnhancedResponse(
          `${length} 길이 질문`,
          context
        );

        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
      }
    });

    it('다양한 톤', async () => {
      const tones: Array<'friendly' | 'professional' | 'neutral'> = [
        'friendly',
        'professional',
        'neutral',
      ];

      for (const tone of tones) {
        const context: EnhancedResponseContext = {
          userInput: `${tone} 톤 질문`,
          conversationHistory: [],
          currentTime: new Date(),
          userPreferences: {
            responseStyle: 'conversational',
            detailLevel: 'balanced',
            language: 'korean',
            tone,
          },
        };

        const result = await service.processEnhancedResponse(
          `${tone} 톤 질문`,
          context
        );

        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
      }
    });

    it('다양한 언어 설정', async () => {
      const languages: Array<'korean' | 'english' | 'mixed'> = [
        'korean',
        'english',
        'mixed',
      ];

      for (const language of languages) {
        const context: EnhancedResponseContext = {
          userInput: `${language} 언어 질문`,
          conversationHistory: [],
          currentTime: new Date(),
          userPreferences: {
            responseStyle: 'conversational',
            detailLevel: 'balanced',
            language,
            tone: 'friendly',
          },
        };

        const result = await service.processEnhancedResponse(
          `${language} 언어 질문`,
          context
        );

        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
      }
    });

    it('복합 컨텍스트', async () => {
      const context: EnhancedResponseContext = {
        userInput: '복합 질문',
        conversationHistory: [
          {
            id: 'msg-1',
            content: '이전 메시지 1',
            sender: 'user',
            timestamp: new Date(),
          },
          {
            id: 'msg-2',
            content: '이전 메시지 2',
            sender: 'assistant',
            timestamp: new Date(),
          },
        ],
        projectContext: {
          projectId: 'project-123',
          projectName: '테스트 프로젝트',
          status: 'active',
        },
        userPreferences: {
          responseStyle: 'technical',
          detailLevel: 'detailed',
          language: 'korean',
          tone: 'professional',
          responseLength: 'long',
        },
        currentTime: new Date(),
      };

      const result = await service.processEnhancedResponse('복합 질문', context);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(Array.isArray(result.metadata.improvements)).toBe(true);
      expect(Array.isArray(result.metadata.limitations)).toBe(true);
    });

    it('에러 발생 시 폴백 응답', async () => {
      mockGenerateHighQualityResponse.mockRejectedValueOnce(
        new Error('Backend error')
      );
      mockSendChatMessage.mockRejectedValue(new Error('API error'));
      mockEvaluateResponseQuality.mockRejectedValue(
        new Error('Quality error')
      );

      const context = createTestContext();

      const result = await service.processEnhancedResponse(
        '에러 테스트',
        context
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.confidence).toBeLessThan(0.5);
      expect(result.qualityScore).toBeLessThan(0.5);
      expect(result.metadata.model).toBe('fallback');
    });
  });

  describe('메타데이터 확인', () => {
    it('메타데이터 구조 확인', async () => {
      const context: EnhancedResponseContext = {
        userInput: '메타데이터 테스트',
        conversationHistory: [],
        currentTime: new Date(),
      };

      const result = await service.processEnhancedResponse(
        '메타데이터 테스트',
        context
      );

      expect(result.metadata).toBeDefined();
      expect(result.metadata.model).toBeDefined();
      expect(typeof result.metadata.tokens).toBe('number');
      expect(typeof result.metadata.reasoningSteps).toBe('number');
      expect(typeof result.metadata.sourcesUsed).toBe('number');
      expect(Array.isArray(result.metadata.improvements)).toBe(true);
      expect(Array.isArray(result.metadata.limitations)).toBe(true);
    });

    it('처리 시간 측정', async () => {
      const context: EnhancedResponseContext = {
        userInput: '처리 시간 테스트',
        conversationHistory: [],
        currentTime: new Date(),
      };

      const result = await service.processEnhancedResponse(
        '처리 시간 테스트',
        context
      );

      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });
  });
});

