/**
 * advancedAnalysisEngine 서비스 테스트
 * 고급 분석 엔진 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import advancedAnalysisEngine from '../advancedAnalysisEngine';
import { ChatSession, Message } from '../../types/chat';
import { Project } from '../../types/project';

describe('advancedAnalysisEngine', () => {
  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedAnalysisEngine).toBeDefined();
    });
  });

  describe('analyzeSentiment', () => {
    it('긍정적인 텍스트를 분석할 수 있어야 함', async () => {
      const text = '좋다 성공 훌륭하다 만족 향상';
      
      const result = await advancedAnalysisEngine.analyzeSentiment(text);
      
      expect(result).toBeDefined();
      expect(['positive', 'negative', 'neutral']).toContain(result.sentiment);
      expect(result.confidence).toBeGreaterThanOrEqual(0.5);
      expect(Array.isArray(result.keywords)).toBe(true);
      expect(Array.isArray(result.topics)).toBe(true);
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(Array.isArray(result.relatedQuestions)).toBe(true);
    });

    it('부정적인 텍스트를 분석할 수 있어야 함', async () => {
      const text = '문제 실패 어려움 불만 부정적 위험';
      
      const result = await advancedAnalysisEngine.analyzeSentiment(text);
      
      expect(result).toBeDefined();
      expect(['positive', 'negative', 'neutral']).toContain(result.sentiment);
      expect(result.confidence).toBeGreaterThanOrEqual(0.5);
    });

    it('중립적인 텍스트를 분석할 수 있어야 함', async () => {
      const text = '프로젝트에 대해 설명하겠습니다. 데이터를 분석하고 결과를 확인합니다.';
      
      const result = await advancedAnalysisEngine.analyzeSentiment(text);
      
      expect(result).toBeDefined();
      expect(['positive', 'negative', 'neutral']).toContain(result.sentiment);
    });

    it('키워드를 추출할 수 있어야 함', async () => {
      const text = '재개발 프로젝트 시공사 선정 분석 데이터';
      
      const result = await advancedAnalysisEngine.analyzeSentiment(text);
      
      expect(result.keywords.length).toBeGreaterThan(0);
      expect(result.keywords.length).toBeLessThanOrEqual(5);
    });

    it('주제를 식별할 수 있어야 함', async () => {
      const text = '프로젝트 계획을 세우고 분석 데이터를 확인합니다.';
      
      const result = await advancedAnalysisEngine.analyzeSentiment(text);
      
      expect(result.topics.length).toBeGreaterThan(0);
    });
  });

  describe('generateContextualInsights', () => {
    const createMockMessage = (content: string, isUser: boolean = true): Message => ({
      id: `msg_${Date.now()}_${Math.random()}`,
      role: isUser ? 'user' : 'assistant',
      sender: isUser ? 'user' : 'assistant',
      content,
      timestamp: new Date().toISOString(),
      isUser
    });

    const createMockProject = (): Project => ({
      id: 'proj_123',
      name: '샘플 재개발',
      description: '재개발 프로젝트 시공사 선정',
      createdAt: new Date(),
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation',
      status: 'active',
      chats: []
    });

    it('컨텍스트 인사이트를 생성할 수 있어야 함', async () => {
      const currentMessage = '프로젝트 진행 상황은 어떤가요?';
      const conversationHistory: Message[] = [
        createMockMessage('재개발 프로젝트에 대해 알고 싶습니다.'),
        createMockMessage('프로젝트 계획을 세워보겠습니다.', false)
      ];
      const project = createMockProject();

      const insights = await advancedAnalysisEngine.generateContextualInsights(
        currentMessage,
        conversationHistory,
        project
      );

      expect(Array.isArray(insights)).toBe(true);
    });

    it('프로젝트 없이도 인사이트를 생성할 수 있어야 함', async () => {
      const currentMessage = '프로젝트 진행 상황은?';
      const conversationHistory: Message[] = [
        createMockMessage('질문 1'),
        createMockMessage('답변 1', false)
      ];

      const insights = await advancedAnalysisEngine.generateContextualInsights(
        currentMessage,
        conversationHistory,
        null
      );

      expect(Array.isArray(insights)).toBe(true);
    });

    it('빈 대화 기록으로도 작동해야 함', async () => {
      const currentMessage = '첫 질문입니다.';
      const conversationHistory: Message[] = [];

      const insights = await advancedAnalysisEngine.generateContextualInsights(
        currentMessage,
        conversationHistory,
        null
      );

      expect(Array.isArray(insights)).toBe(true);
    });

    it('인사이트가 올바른 구조를 가져야 함', async () => {
      const currentMessage = '프로젝트 분석';
      const conversationHistory: Message[] = [
        createMockMessage('질문?'),
        createMockMessage('답변', false)
      ];
      const project = createMockProject();

      const insights = await advancedAnalysisEngine.generateContextualInsights(
        currentMessage,
        conversationHistory,
        project
      );

      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
      const insight = insights[0];
      expect(insight).toHaveProperty('type');
      expect(insight).toHaveProperty('title');
      expect(insight).toHaveProperty('description');
      expect(insight).toHaveProperty('confidence');
      expect(insight).toHaveProperty('actionable');
      expect(insight).toHaveProperty('priority');
    });
  });

  describe('generateAdvancedResponse', () => {
    const createMockMessage = (content: string, isUser: boolean = true): Message => ({
      id: `msg_${Date.now()}_${Math.random()}`,
      role: isUser ? 'user' : 'assistant',
      sender: isUser ? 'user' : 'assistant',
      content,
      timestamp: new Date().toISOString(),
      isUser
    });

    const createMockChatSession = (messages: Message[]): ChatSession => ({
      id: 'session_123',
      projectId: 'proj_123',
      title: '테스트 세션',
      messages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      messageCount: messages.length,
      participants: [],
      tags: [],
      status: 'active',
      lastActivity: '',
      totalMessages: messages.length,
      isPersistent: false,
    });

    const createMockProject = (): Project => ({
      id: 'proj_123',
      name: '샘플 재개발',
      description: '재개발 프로젝트',
      createdAt: new Date(),
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation',
      status: 'active',
      chats: []
    });

    it('고급 답변을 생성할 수 있어야 함', async () => {
      const userMessage = '재개발 프로젝트 진행 상황이 좋습니다. 성공적으로 진행되고 있어요.';
      const chatSession = createMockChatSession([
        createMockMessage('프로젝트에 대해 알고 싶습니다.')
      ]);
      const project = createMockProject();

      const response = await advancedAnalysisEngine.generateAdvancedResponse(
        userMessage,
        chatSession,
        project
      );

      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });

    it('프로젝트 없이도 답변을 생성할 수 있어야 함', async () => {
      const userMessage = '프로젝트에 대해 설명해주세요.';
      const chatSession = createMockChatSession([]);

      const response = await advancedAnalysisEngine.generateAdvancedResponse(
        userMessage,
        chatSession,
        null
      );

      expect(response).toBeDefined();
      expect(response.length).toBeGreaterThan(0);
    });

    it('답변에 감정 분석 결과가 포함되어야 함', async () => {
      const userMessage = '이 프로젝트는 매우 좋습니다. 성공적입니다.';
      const chatSession = createMockChatSession([]);

      const response = await advancedAnalysisEngine.generateAdvancedResponse(
        userMessage,
        chatSession,
        null
      );

      expect(response).toContain('감정');
      expect(response).toContain('분석');
    });

    it('답변에 키워드가 포함되어야 함', async () => {
      const userMessage = '재개발 프로젝트 시공사 선정';
      const chatSession = createMockChatSession([]);

      const response = await advancedAnalysisEngine.generateAdvancedResponse(
        userMessage,
        chatSession,
        null
      );

      expect(response).toContain('키워드');
    });

    it('답변에 주제가 포함되어야 함', async () => {
      const userMessage = '프로젝트 계획을 분석해보겠습니다.';
      const chatSession = createMockChatSession([]);

      const response = await advancedAnalysisEngine.generateAdvancedResponse(
        userMessage,
        chatSession,
        null
      );

      expect(response).toContain('주제');
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 텍스트를 분석할 수 있어야 함', async () => {
      const text = '샘플 재개발 프로젝트 시공사 선정이 성공적으로 이루어졌습니다. 매우 만족스러운 결과입니다.';
      
      const result = await advancedAnalysisEngine.analyzeSentiment(text);
      
      expect(result).toBeDefined();
      expect(['positive', 'negative', 'neutral']).toContain(result.sentiment);
      expect(result.keywords.length).toBeGreaterThan(0);
      expect(result.topics.length).toBeGreaterThan(0);
    });

    it('시공사 선정 관련 컨텍스트 인사이트를 생성할 수 있어야 함', async () => {
      const currentMessage = '시공사 선정 기준은 무엇인가요?';
      const conversationHistory: Message[] = [
        {
          id: 'msg1',
          role: 'user',
          sender: 'user',
          content: '재개발 프로젝트에 대해 알고 싶습니다.',
          timestamp: new Date().toISOString(),
          isUser: true
        },
        {
          id: 'msg2',
          role: 'assistant',
          sender: 'assistant',
          content: '재개발 프로젝트는...',
          timestamp: new Date().toISOString(),
          isUser: false
        }
      ];
      const project: Project = {
        id: 'proj1',
        name: '샘플 재개발',
        description: '시공사 선정 프로젝트',
        createdAt: new Date(),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: []
      };

      const insights = await advancedAnalysisEngine.generateContextualInsights(
        currentMessage,
        conversationHistory,
        project
      );

      expect(Array.isArray(insights)).toBe(true);
    });

    it('복합적인 질문에 대해 고급 답변을 생성할 수 있어야 함', async () => {
      const userMessage = '재개발 프로젝트 시공사 선정 과정과 평가 기준을 분석해주세요.';
      const chatSession: ChatSession = {
        id: 'session1',
        projectId: 'proj1',
        title: '세션1',
        messages: [
          {
            id: 'msg1',
            role: 'user',
            sender: 'user',
            content: '재개발 프로젝트',
            timestamp: new Date().toISOString(),
            isUser: true
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        messageCount: 1,
        participants: [],
        tags: [],
        status: 'active',
        lastActivity: '',
        totalMessages: 1,
        isPersistent: false,
      };
      const project: Project = {
        id: 'proj1',
        name: '샘플 재개발',
        description: '시공사 선정',
        createdAt: new Date(),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: []
      };

      const response = await advancedAnalysisEngine.generateAdvancedResponse(
        userMessage,
        chatSession,
        project
      );

      expect(response).toBeDefined();
      expect(response.length).toBeGreaterThan(0);
      expect(response).toContain('분석');
    });
  });
});

