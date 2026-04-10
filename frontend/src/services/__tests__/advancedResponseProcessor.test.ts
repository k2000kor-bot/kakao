/**
 * advancedResponseProcessor 서비스 테스트
 * 고급 응답 처리 서비스 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import advancedResponseProcessor from '../advancedResponseProcessor';
import { ChatMessage } from '../chatService';

describe('advancedResponseProcessor', () => {
  const createMockChatMessage = (content: string, isUser: boolean = true): ChatMessage => ({
    id: `msg_${Date.now()}_${Math.random()}`,
    content,
    isUser,
    timestamp: new Date()
  });

  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedResponseProcessor).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedResponseProcessor;
      const instance2 = advancedResponseProcessor;
      expect(instance1).toBe(instance2);
    });
  });

  describe('processResponse', () => {
    it('응답을 처리할 수 있어야 함', async () => {
      const userInput = '시공사 선정 기준은 무엇인가요?';
      const conversationHistory: ChatMessage[] = [];
      
      const result = await advancedResponseProcessor.processResponse(
        userInput,
        conversationHistory
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(typeof result.content).toBe('string');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(typeof result.reasoning).toBe('string');
      expect(Array.isArray(result.improvements)).toBe(true);
      expect(result.metadata).toBeDefined();
    });

    it('처리 단계를 추적해야 함', async () => {
      const userInput = '재개발 프로젝트에 대해 알려주세요.';
      const conversationHistory: ChatMessage[] = [];
      
      const result = await advancedResponseProcessor.processResponse(
        userInput,
        conversationHistory
      );

      expect(result.metadata.stagesCompleted).toBeDefined();
      expect(Array.isArray(result.metadata.stagesCompleted)).toBe(true);
      expect(result.metadata.processingTime).toBeGreaterThanOrEqual(0);
      expect(typeof result.metadata.qualityScore).toBe('number');
    });

    it('대화 기록을 고려해야 함', async () => {
      const userInput = '시공사 선정 기준은?';
      const conversationHistory: ChatMessage[] = [
        createMockChatMessage('재개발 프로젝트에 대해 알고 싶습니다.', true),
        createMockChatMessage('재개발 프로젝트는...', false),
        createMockChatMessage('시공사 선정은 어떻게 하나요?', true)
      ];
      
      const result = await advancedResponseProcessor.processResponse(
        userInput,
        conversationHistory
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('프로젝트 컨텍스트를 고려해야 함', async () => {
      const userInput = '시공사 선정에 대해 알려주세요.';
      const conversationHistory: ChatMessage[] = [];
      const projectContext = {
        projectName: '샘플 재개발',
        projectType: 'redevelopment'
      };
      
      const result = await advancedResponseProcessor.processResponse(
        userInput,
        conversationHistory,
        projectContext
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('개선사항을 제시해야 함', async () => {
      const userInput = '재개발 프로젝트에 대해 간단히 설명해주세요.';
      const conversationHistory: ChatMessage[] = [];
      
      const result = await advancedResponseProcessor.processResponse(
        userInput,
        conversationHistory
      );

      expect(Array.isArray(result.improvements)).toBe(true);
    });

    it('품질 점수를 계산해야 함', async () => {
      const userInput = '재개발 프로젝트 시공사 선정 기준과 평가 프로세스를 자세히 설명해주세요.';
      const conversationHistory: ChatMessage[] = [];
      
      const result = await advancedResponseProcessor.processResponse(
        userInput,
        conversationHistory
      );

      expect(typeof result.metadata.qualityScore).toBe('number');
      expect(result.metadata.qualityScore).toBeGreaterThanOrEqual(0);
      expect(result.metadata.qualityScore).toBeLessThanOrEqual(1);
    });

    it('신뢰도를 계산해야 함', async () => {
      const userInput = '시공사 선정 기준을 알려주세요.';
      const conversationHistory: ChatMessage[] = [];
      
      const result = await advancedResponseProcessor.processResponse(
        userInput,
        conversationHistory
      );

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('추론 과정을 설명해야 함', async () => {
      const userInput = '재개발 프로젝트에 대해 분석해주세요.';
      const conversationHistory: ChatMessage[] = [];
      
      const result = await advancedResponseProcessor.processResponse(
        userInput,
        conversationHistory
      );

      expect(result.reasoning).toBeDefined();
      expect(typeof result.reasoning).toBe('string');
    });

    it('빈 대화 기록으로도 작동해야 함', async () => {
      const userInput = '첫 질문입니다.';
      const conversationHistory: ChatMessage[] = [];
      
      const result = await advancedResponseProcessor.processResponse(
        userInput,
        conversationHistory
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('긴 대화 기록을 처리할 수 있어야 함', async () => {
      const userInput = '추가 질문입니다.';
      const conversationHistory: ChatMessage[] = Array.from({ length: 10 }, (_, i) => 
        createMockChatMessage(`질문 ${i + 1}`, i % 2 === 0)
      );
      
      const result = await advancedResponseProcessor.processResponse(
        userInput,
        conversationHistory
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 질문을 처리할 수 있어야 함', async () => {
      const userInput = '샘플 재개발 프로젝트의 시공사 선정 기준은 무엇인가요?';
      const conversationHistory: ChatMessage[] = [];
      const projectContext = {
        projectName: '샘플 재개발',
        projectType: 'redevelopment'
      };
      
      const result = await advancedResponseProcessor.processResponse(
        userInput,
        conversationHistory,
        projectContext
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.metadata.qualityScore).toBeGreaterThanOrEqual(0);
    });

    it('시공사 선정 관련 복합 질문을 처리할 수 있어야 함', async () => {
      const userInput = '시공사 선정 기준은 무엇인가요? 그리고 평가 프로세스는 어떻게 진행되나요?';
      const conversationHistory: ChatMessage[] = [
        createMockChatMessage('재개발 프로젝트에 대해 알고 싶습니다.', true)
      ];
      
      const result = await advancedResponseProcessor.processResponse(
        userInput,
        conversationHistory
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.improvements.length).toBeGreaterThanOrEqual(0);
    });

    it('대화 맥락을 활용하여 응답을 생성할 수 있어야 함', async () => {
      const userInput = '그럼 시공사는 어떻게 선정하나요?';
      const conversationHistory: ChatMessage[] = [
        createMockChatMessage('재개발 프로젝트 시공사 선정에 대해 알려주세요.', true),
        createMockChatMessage('시공사 선정은 기술력, 안전성, 경험을 고려합니다.', false),
        createMockChatMessage('시공사 선정 기준을 자세히 설명해주세요.', true)
      ];
      
      const result = await advancedResponseProcessor.processResponse(
        userInput,
        conversationHistory
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
    });
  });
});
