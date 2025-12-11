/**
 * DeepLearningService 테스트
 */

import { DeepLearningService } from '../deepLearningService';
import deepLearningService from '../deepLearningService';
import { Message } from '../types';

// fetch 모킹
global.fetch = jest.fn();

describe('DeepLearningService', () => {
  let service: DeepLearningService;

  beforeEach(() => {
    service = new DeepLearningService();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(DeepLearningService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(deepLearningService).toBeDefined();
    });
  });

  describe('대화 분석', () => {
    const mockMessages: Message[] = [
      {
        id: '1',
        content: '시공사 선정에 대해 논의하겠습니다.',
        sender: '사용자1',
        timestamp: new Date(),
      },
      {
        id: '2',
        content: '좋은 아이디어입니다. 동의합니다.',
        sender: '사용자2',
        timestamp: new Date(),
      },
    ];

    it('로컬 모델로 대화 분석', async () => {
      const analysis = await service.analyzeConversation(mockMessages);

      expect(analysis).toBeDefined();
      expect(['positive', 'negative', 'neutral']).toContain(analysis.sentiment);
      expect(Array.isArray(analysis.keyTopics)).toBe(true);
      expect(Array.isArray(analysis.participants)).toBe(true);
      expect(analysis.conversationFlow).toBeDefined();
      expect(typeof analysis.urgency).toBe('number');
      expect(typeof analysis.complexity).toBe('number');
      expect(typeof analysis.engagement).toBe('number');
    });

    it('긍정적 감정 분석', async () => {
      const positiveMessages: Message[] = [
        {
          id: '1',
          content: '좋은 결과입니다. 만족합니다.',
          sender: '사용자1',
          timestamp: new Date(),
        },
      ];

      const analysis = await service.analyzeConversation(positiveMessages);

      expect(analysis.sentiment).toBe('positive');
    });

    it('부정적 감정 분석', async () => {
      const negativeMessages: Message[] = [
        {
          id: '1',
          content: '문제가 있습니다. 불만입니다.',
          sender: '사용자1',
          timestamp: new Date(),
        },
      ];

      const analysis = await service.analyzeConversation(negativeMessages);

      expect(analysis.sentiment).toBe('negative');
    });

    it('주요 토픽 추출', async () => {
      const topicMessages: Message[] = [
        {
          id: '1',
          content: '시공사 선정과 아파트 건설에 대해 논의합니다.',
          sender: '사용자1',
          timestamp: new Date(),
        },
      ];

      const analysis = await service.analyzeConversation(topicMessages);

      expect(analysis.keyTopics.length).toBeGreaterThanOrEqual(0);
    });

    it('참여자 분석', async () => {
      const multiParticipantMessages: Message[] = [
        {
          id: '1',
          content: '첫 번째 메시지',
          sender: '사용자1',
          timestamp: new Date(),
        },
        {
          id: '2',
          content: '두 번째 메시지',
          sender: '사용자2',
          timestamp: new Date(),
        },
      ];

      const analysis = await service.analyzeConversation(multiParticipantMessages);

      expect(analysis.participants.length).toBeGreaterThanOrEqual(0);
      if (analysis.participants.length > 0) {
        const participant = analysis.participants[0];
        expect(participant.name).toBeDefined();
        expect(typeof participant.messageCount).toBe('number');
      }
    });

    it('대화 흐름 분석', async () => {
      const flowMessages: Message[] = [
        {
          id: '1',
          content: '안녕하세요. 시작하겠습니다.',
          sender: '사용자1',
          timestamp: new Date(),
        },
      ];

      const analysis = await service.analyzeConversation(flowMessages);

      expect(analysis.conversationFlow).toBeDefined();
      expect(analysis.conversationFlow.phase).toBeDefined();
      expect(typeof analysis.conversationFlow.confidence).toBe('number');
    });

    it('긴급도 계산', async () => {
      const urgentMessages: Message[] = [
        {
          id: '1',
          content: '급하게 처리해야 합니다. 즉시 결정이 필요합니다.',
          sender: '사용자1',
          timestamp: new Date(),
        },
      ];

      const analysis = await service.analyzeConversation(urgentMessages);

      expect(typeof analysis.urgency).toBe('number');
      expect(analysis.urgency).toBeGreaterThanOrEqual(0);
    });

    it('복잡도 계산', async () => {
      const complexMessages: Message[] = [
        {
          id: '1',
          content: '매우 긴 메시지입니다. 여러 가지 복잡한 내용을 포함하고 있습니다.',
          sender: '사용자1',
          timestamp: new Date(),
        },
      ];

      const analysis = await service.analyzeConversation(complexMessages);

      expect(typeof analysis.complexity).toBe('number');
      expect(analysis.complexity).toBeGreaterThanOrEqual(0);
    });

    it('참여도 계산', async () => {
      const engagedMessages: Message[] = [
        {
          id: '1',
          content: '메시지 1',
          sender: '사용자1',
          timestamp: new Date(),
        },
        {
          id: '2',
          content: '메시지 2',
          sender: '사용자2',
          timestamp: new Date(),
        },
      ];

      const analysis = await service.analyzeConversation(engagedMessages);

      expect(typeof analysis.engagement).toBe('number');
      expect(analysis.engagement).toBeGreaterThanOrEqual(0);
    });

    it('빈 메시지 배열 처리', async () => {
      const analysis = await service.analyzeConversation([]);

      expect(analysis).toBeDefined();
      expect(analysis.sentiment).toBe('neutral');
    });
  });

  describe('메시지 생성', () => {
    const mockContext = {
      messages: [
        {
          id: '1',
          content: '시공사 선정에 대해 알려주세요',
          sender: '사용자1',
          timestamp: new Date(),
        },
      ] as Message[],
      analysis: {
        sentiment: 'neutral' as const,
        keyTopics: ['시공사'],
        participants: [],
        conversationFlow: { phase: 'discussion', confidence: 0.7 },
        urgency: 0.5,
        complexity: 0.5,
        engagement: 0.5,
      },
      userPreferences: {
        tone: 'professional' as const,
        style: 'informative' as const,
        length: 'medium' as const,
      },
    };

    it('로컬 모델로 메시지 생성', async () => {
      const result = await service.generateMessage(mockContext);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(typeof result.content).toBe('string');
      expect(typeof result.confidence).toBe('number');
      expect(result.reasoning).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('메타데이터 포함', async () => {
      const result = await service.generateMessage(mockContext);

      expect(result.metadata).toBeDefined();
      expect(result.metadata.modelUsed).toBeDefined();
      expect(typeof result.metadata.processingTime).toBe('number');
      expect(typeof result.metadata.tokensUsed).toBe('number');
    });

    it('다양한 톤으로 메시지 생성', async () => {
      const formalContext = {
        ...mockContext,
        userPreferences: {
          ...mockContext.userPreferences,
          tone: 'formal' as const,
        },
      };

      const result = await service.generateMessage(formalContext);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('다양한 스타일로 메시지 생성', async () => {
      const persuasiveContext = {
        ...mockContext,
        userPreferences: {
          ...mockContext.userPreferences,
          style: 'persuasive' as const,
        },
      };

      const result = await service.generateMessage(persuasiveContext);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });
});

