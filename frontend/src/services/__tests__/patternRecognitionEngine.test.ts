/**
 * PatternRecognitionEngine 테스트
 * @jest-environment jsdom
 */
import patternRecognitionEngine from '../patternRecognitionEngine';
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
    createMessage('환경 보호는 무엇인가요?', '2025-01-01T10:00:00Z'),
    createMessage('환경 보호 방법은 어떻게 되나요?', '2025-01-01T10:01:00Z'),
    createMessage('환경 정책은 왜 필요한가요?', '2025-01-01T10:02:00Z'),
    createMessage('환경 보호는 지속가능성을 위한 것입니다.', '2025-01-01T10:03:00Z', false)
  ],
  createdAt: '2025-01-01T10:00:00Z',
  updatedAt: '2025-01-01T10:05:00Z',
  projectId: 'proj-1',
  participants: ['user-1'],
  isActive: true,
  messageCount: 4,
  totalMessages: 4,
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
  files: [{ id: 'f1', name: 'doc.pdf', type: 'document', size: 100, uploadedAt: new Date(), tags: [] }],
  instructions: '환경 지침',
  tags: [],
  isActive: true,
  type: 'research',
  status: 'active',
  ...overrides
});

describe('PatternRecognitionEngine', () => {
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

  describe('recognizeConversationPatterns', () => {
    it('대화 패턴 인식', async () => {
      const sessions = [createSession()];
      const result = await patternRecognitionEngine.recognizeConversationPatterns(sessions);

      expect(Array.isArray(result)).toBe(true);
      result.forEach(p => {
        expect(p).toHaveProperty('type');
        expect(p).toHaveProperty('pattern');
        expect(p).toHaveProperty('confidence');
        expect(typeof p.confidence).toBe('number');
      });
    });

    it('빈 세션으로 대화 패턴 인식', async () => {
      const result = await patternRecognitionEngine.recognizeConversationPatterns([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('recognizeBehavioralPatterns', () => {
    it('행동 패턴 인식', async () => {
      const sessions = [createSession()];
      const result = await patternRecognitionEngine.recognizeBehavioralPatterns(sessions);

      expect(Array.isArray(result)).toBe(true);
      result.forEach(p => {
        expect(p).toHaveProperty('type');
        expect(p).toHaveProperty('pattern');
        expect(p).toHaveProperty('confidence');
        expect(['positive', 'negative', 'neutral']).toContain(p.impact);
      });
    });
  });

  describe('recognizeProjectPatterns', () => {
    it('프로젝트 패턴 인식', async () => {
      const project = createProject();
      const sessions = [createSession({ projectId: project.id })];
      const result = await patternRecognitionEngine.recognizeProjectPatterns(project, sessions);

      expect(Array.isArray(result)).toBe(true);
      result.forEach(p => {
        expect(p).toHaveProperty('type');
        expect(p).toHaveProperty('confidence');
        expect(typeof p.efficiency).toBe('number');
      });
    });
  });

  describe('recognizeTemporalPatterns', () => {
    it('시간적 패턴 인식', async () => {
      const sessions = [createSession()];
      const result = await patternRecognitionEngine.recognizeTemporalPatterns(sessions);

      expect(Array.isArray(result)).toBe(true);
      result.forEach(p => {
        expect(p).toHaveProperty('type');
        expect(p).toHaveProperty('confidence');
        expect(typeof p.predictability).toBe('number');
      });
    });
  });

  describe('recognizeSemanticPatterns', () => {
    it('의미적 패턴 인식', async () => {
      const sessions = [createSession()];
      const result = await patternRecognitionEngine.recognizeSemanticPatterns(sessions);

      expect(Array.isArray(result)).toBe(true);
      result.forEach(p => {
        expect(p).toHaveProperty('type');
        expect(p).toHaveProperty('confidence');
        expect(Array.isArray(p.insights)).toBe(true);
      });
    });
  });

  describe('runFullPatternAnalysis', () => {
    it('전체 패턴 분석 - 프로젝트 포함', async () => {
      const project = createProject();
      const sessions = [createSession({ projectId: project.id })];

      const result = await patternRecognitionEngine.runFullPatternAnalysis(sessions, project);

      expect(result).toBeDefined();
      expect(Array.isArray(result.conversation)).toBe(true);
      expect(Array.isArray(result.behavioral)).toBe(true);
      expect(Array.isArray(result.project)).toBe(true);
      expect(Array.isArray(result.temporal)).toBe(true);
      expect(Array.isArray(result.semantic)).toBe(true);
    });

    it('전체 패턴 분석 - 프로젝트 없음', async () => {
      const sessions = [createSession()];
      const result = await patternRecognitionEngine.runFullPatternAnalysis(sessions, null);

      expect(result).toBeDefined();
      expect(Array.isArray(result.conversation)).toBe(true);
      expect(Array.isArray(result.behavioral)).toBe(true);
      expect(result.project).toEqual([]);
      expect(Array.isArray(result.temporal)).toBe(true);
      expect(Array.isArray(result.semantic)).toBe(true);
    });

    it('전체 패턴 분석 - 빈 세션 배열', async () => {
      const result = await patternRecognitionEngine.runFullPatternAnalysis([], null);

      expect(result).toBeDefined();
      expect(Array.isArray(result.conversation)).toBe(true);
      expect(Array.isArray(result.behavioral)).toBe(true);
      expect(result.project).toEqual([]);
    });
  });
});
