/**
 * EnhancedResponseProcessor 테스트
 */
/* eslint-disable jest/no-conditional-expect */

/// <reference types="jest" />

import type { ChatResponse, ChatRequest } from '../unifiedAPI';
import type { QualityDimension, ResponseAnalysis } from '../advancedQualityEvaluator';

const MOCK_MSG_TS = '2024-01-01T00:00:00.000Z';

// 의존성 모킹 (jest.mock는 호이스팅됨 — 팩토리는 외부 const보다 먼저 실행될 수 있음)
const mockSendChatMessage = jest.fn(async (): Promise<ChatResponse> => ({
  success: true,
  message: {
    content: '모킹된 응답',
    timestamp: MOCK_MSG_TS,
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
  sendChatMessage: (...args: unknown[]) =>
    (mockSendChatMessage as (...a: unknown[]) => ReturnType<typeof mockSendChatMessage>)(...args),
}));

jest.mock('../enhancedBackendAPI', () => ({
  default: {
    generateHighQualityResponse: (...args: unknown[]) =>
      (mockGenerateHighQualityResponse as (...a: unknown[]) => ReturnType<typeof mockGenerateHighQualityResponse>)(...args),
  },
}));

jest.mock('../advancedQualityEvaluator', () => {
  const evaluateResponseQuality = jest.fn();
  return {
    __esModule: true,
    default: {
      evaluateResponseQuality,
    },
  };
});

import {
  EnhancedResponseProcessor,
  enhancedResponseProcessor,
  EnhancedResponseContext,
} from '../enhancedResponseProcessor';
import advancedQualityEvaluator from '../advancedQualityEvaluator';

const mockEvaluateResponseQuality: jest.MockedFunction<typeof advancedQualityEvaluator.evaluateResponseQuality> =
  jest.mocked(advancedQualityEvaluator.evaluateResponseQuality);

function qualityDim(name: string, score: number): QualityDimension {
  return {
    name,
    score,
    weight: 0.1,
    description: 'test',
    suggestions: [],
  };
}

const defaultResponseAnalysis: ResponseAnalysis = {
  qualityMetrics: {
    overall: 0.85,
    confidence: 0.9,
    relevance: qualityDim('relevance', 0.9),
    accuracy: qualityDim('accuracy', 0.85),
    completeness: qualityDim('completeness', 0.8),
    clarity: qualityDim('clarity', 0.85),
    helpfulness: qualityDim('helpfulness', 0.9),
    coherence: qualityDim('coherence', 0.85),
    creativity: qualityDim('creativity', 0.7),
    technicalDepth: qualityDim('technicalDepth', 0.8),
  },
  strengths: ['명확한 설명', '구체적인 예시'],
  weaknesses: ['추가 정보 필요'],
  improvements: [
    {
      dimension: 'completeness',
      currentScore: 0.8,
      targetScore: 0.9,
      suggestions: ['더 많은 예시 추가'],
      priority: 'high',
    },
  ],
  recommendations: ['더 구체적인 설명 추가'],
};

describe('EnhancedResponseProcessor', () => {
  let service: EnhancedResponseProcessor;

  beforeEach(() => {
    service = new EnhancedResponseProcessor();
    jest.clearAllMocks();
    mockSendChatMessage.mockResolvedValue({
      success: true,
      message: {
        content: '모킹된 응답',
        timestamp: MOCK_MSG_TS,
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
    mockEvaluateResponseQuality.mockResolvedValue(defaultResponseAnalysis);
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

    it('processEnhancedResponse: sendChatMessage rawResponse의 generation_phase가 결과 pipelineExtras로 전달된다(백엔드 실패 시)', async () => {
      mockGenerateHighQualityResponse.mockRejectedValueOnce(new Error('backend down'));
      mockSendChatMessage.mockResolvedValue({
        success: true,
        message: { content: '통합 API 본문', timestamp: new Date().toISOString() },
        rawResponse: {
          success: true,
          response: '통합 API 본문',
          metadata: { generation_phase: 'draft' },
        },
      });

      const result = await service.processEnhancedResponse('테스트', createTestContext());

      expect(result.pipelineExtras?.pipelineGenerationPhase).toBe('draft');
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
            timestamp: new Date().toISOString(),
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

    it('대화 히스토리의 pipelineExtras가 sendChatMessage conversation_history로 전달된다', async () => {
      const context: EnhancedResponseContext = {
        userInput: '후속',
        conversationHistory: [
          {
            id: 'a1',
            content: '이전 답변',
            sender: 'ai',
            timestamp: new Date().toISOString(),
            pipelineExtras: { generationScenarioMarkdown: '## ERPProc\n시나리오' },
          },
        ],
        currentTime: new Date(),
      };
      await service.processEnhancedResponse('질문: X\n요구사항: Y', context);
      const hitPipeline = (mockSendChatMessage.mock.calls as unknown[][]).some((call) => {
        const raw = call[0];
        if (raw == null) return false;
        const req = raw as ChatRequest;
        const hist = req.conversation_history;
        if (!hist || !hist.length) return false;
        return hist.some((t) => {
          const ex = t.pipelineExtras?.generationScenarioMarkdown;
          return String(ex).indexOf('ERPProc') >= 0;
        });
      });
      expect(hitPipeline).toBe(true);
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
            timestamp: new Date().toISOString(),
          },
          {
            id: 'msg-2',
            content: '이전 메시지 2',
            sender: 'assistant',
            timestamp: new Date().toISOString(),
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

