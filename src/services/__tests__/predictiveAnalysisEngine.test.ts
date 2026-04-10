/**
 * PredictiveAnalysisEngine 테스트
 * @jest-environment jsdom
 */
import predictiveAnalysisEngine from '../predictiveAnalysisEngine';
import type { ChatSession } from '../../types/chat';
import type { Project } from '../../types/project';

const createMessage = (content: string, timestamp: string, isUser = true) => ({
  id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  content,
  sender: isUser ? 'user' : 'assistant',
  timestamp,
  role: (isUser ? 'user' : 'assistant') as const,
  isUser
});

const createSession = (overrides: Partial<ChatSession> = {}): ChatSession => ({
  id: `session-${Date.now()}`,
  title: '테스트 세션',
  messages: [
    createMessage('환경 보호에 대해 어떻게 생각하시나요?', '2025-01-01T10:00:00Z'),
    createMessage('환경 정책은 중요합니다.', '2025-01-01T10:01:00Z', false)
  ],
  createdAt: '2025-01-01T10:00:00Z',
  updatedAt: '2025-01-01T10:05:00Z',
  projectId: 'proj-1',
  participants: ['user-1'],
  isActive: true,
  messageCount: 2,
  totalMessages: 2,
  isPersistent: false,
  tags: [],
  status: 'active',
  lastActivity: '2025-01-01T10:05:00Z',
  ...overrides
});

const createProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'proj-1',
  name: '환경 프로젝트',
  description: '환경 보호 관련 프로젝트',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  files: [],
  instructions: '',
  tags: [],
  isActive: true,
  type: 'research',
  status: 'active',
  ...overrides
});

describe('PredictiveAnalysisEngine', () => {
  const originalLocalStorage = window.localStorage;

  beforeEach(() => {
    const mockStorage: { [key: string]: string } = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => mockStorage[key] || null,
        setItem: (key: string, val: string) => { mockStorage[key] = val; },
        removeItem: (key: string) => { delete mockStorage[key]; },
        clear: () => Object.keys(mockStorage).forEach(k => delete mockStorage[k]),
        key: (i: number) => Object.keys(mockStorage)[i] || null,
        get length() { return Object.keys(mockStorage).length; }
      },
      writable: true
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', { value: originalLocalStorage });
  });

  describe('predictConversationTrend', () => {
    it('대화 트렌드 예측', async () => {
      const sessions: ChatSession[] = [
        createSession({ messages: Array.from({ length: 3 }, (_, i) => createMessage(`msg ${i}`, `2025-01-0${i + 1}T10:00:00Z`)) }),
        createSession({ messages: Array.from({ length: 5 }, (_, i) => createMessage(`msg ${i}`, `2025-01-0${i + 2}T10:00:00Z`)) }),
        createSession({ messages: Array.from({ length: 7 }, (_, i) => createMessage(`msg ${i}`, `2025-01-0${i + 3}T10:00:00Z`)) })
      ];

      const result = await predictiveAnalysisEngine.predictConversationTrend(sessions);

      expect(result).toBeDefined();
      expect(['increasing', 'decreasing', 'stable', 'fluctuating']).toContain(result.trend);
      expect(typeof result.slope).toBe('number');
      expect(typeof result.confidence).toBe('number');
      expect(typeof result.prediction).toBe('number');
      expect(typeof result.timeframe).toBe('string');
    });

    it('빈 세션으로 트렌드 예측', async () => {
      const result = await predictiveAnalysisEngine.predictConversationTrend([]);
      expect(result).toBeDefined();
      expect(result.trend).toBe('stable');
    });
  });

  describe('analyzeUserBehavior', () => {
    it('사용자 행동 패턴 분석', async () => {
      const sessions = [
        createSession({ participants: ['user-1'], messages: [
          createMessage('환경 정책 질문', '2025-01-01T10:00:00Z'),
          createMessage('응답 내용', '2025-01-01T10:01:00Z', false)
        ]})
      ];

      const result = await predictiveAnalysisEngine.analyzeUserBehavior('user-1', sessions);

      expect(result.userId).toBe('user-1');
      expect(Array.isArray(result.preferredTopics)).toBe(true);
      expect(typeof result.responseTime).toBe('number');
      expect(typeof result.messageLength).toBe('number');
      expect(typeof result.interactionFrequency).toBe('number');
      expect(typeof result.sessionDuration).toBe('number');
      expect(Array.isArray(result.commonQuestions)).toBe(true);
      expect(['positive', 'negative', 'neutral']).toContain(result.sentimentTrend);
    });
  });

  describe('predictProjectSuccess', () => {
    it('프로젝트 성공률 예측', async () => {
      const project = createProject({ files: [{ id: 'f1', name: 'doc.pdf', type: 'document', size: 100, uploadedAt: new Date(), tags: [] }], guidelines: '가이드라인' });
      const sessions = [createSession({ projectId: project.id })];

      const result = await predictiveAnalysisEngine.predictProjectSuccess(project, sessions);

      expect(result.type).toBe('recommendation');
      expect(typeof result.confidence).toBe('number');
      expect(typeof result.value).toBe('number');
      expect(typeof result.description).toBe('string');
      expect(typeof result.actionable).toBe('boolean');
      expect(['high', 'medium', 'low']).toContain(result.priority);
    });
  });

  describe('assessRisk', () => {
    it('리스크 평가 - 세션만', async () => {
      const sessions = [createSession()];
      const result = await predictiveAnalysisEngine.assessRisk(sessions, null);

      expect(Array.isArray(result)).toBe(true);
    });

    it('리스크 평가 - 프로젝트 포함', async () => {
      const project = createProject();
      const sessions = [createSession({ projectId: project.id })];
      const result = await predictiveAnalysisEngine.assessRisk(sessions, project);

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('generateIntelligentRecommendations', () => {
    it('추천 생성 - 프로젝트 없음', async () => {
      const result = await predictiveAnalysisEngine.generateIntelligentRecommendations('user-1', [], null);
      expect(Array.isArray(result)).toBe(true);
    });

    it('추천 생성 - 프로젝트 포함', async () => {
      const project = createProject();
      const sessions = [createSession({ projectId: project.id })];
      const result = await predictiveAnalysisEngine.generateIntelligentRecommendations('user-1', sessions, project);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('runFullAnalysis', () => {
    it('전체 분석 실행', async () => {
      const project = createProject();
      const sessions = [createSession({ projectId: project.id })];

      const result = await predictiveAnalysisEngine.runFullAnalysis('user-1', sessions, project);

      expect(result.trends).toBeDefined();
      expect(result.behavior).toBeDefined();
      expect(Array.isArray(result.predictions)).toBe(true);
      expect(Array.isArray(result.risks)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('전체 분석 - 프로젝트 없음', async () => {
      const sessions = [createSession()];
      const result = await predictiveAnalysisEngine.runFullAnalysis('user-1', sessions, null);

      expect(result.trends).toBeDefined();
      expect(result.behavior).toBeDefined();
      expect(result.predictions).toEqual([]);
      expect(Array.isArray(result.risks)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });
});
