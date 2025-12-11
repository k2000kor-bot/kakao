import intelligentContextManager, { IntelligentContextManager } from '../intelligentContextManager';
import { Project } from '../../types/project';

describe('IntelligentContextManager', () => {
  let manager: IntelligentContextManager;

  beforeEach(() => {
    manager = new IntelligentContextManager();
    jest.spyOn(Date, 'now').mockReturnValue(1000000000000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(intelligentContextManager).toBeDefined();
      expect(intelligentContextManager).toBeInstanceOf(IntelligentContextManager);
    });

    it('새 인스턴스 생성', () => {
      expect(manager).toBeInstanceOf(IntelligentContextManager);
    });
  });

  describe('initializeContext', () => {
    it('기본 컨텍스트를 초기화해야 함', () => {
      const context = manager.initializeContext('session-1');

      expect(context.sessionId).toBe('session-1');
      expect(context.currentTopic).toBe('general');
      expect(context.entities.size).toBe(0);
      expect(context.topics.size).toBe(0);
      expect(context.actions.size).toBe(0);
      expect(context.emotions.size).toBe(0);
      expect(context.temporalContext).toBeDefined();
      expect(context.userPreferences).toEqual({});
    });

    it('프로젝트와 함께 컨텍스트를 초기화해야 함', () => {
      const project: Project = {
        id: 'project-1',
        name: '테스트 프로젝트',
        description: '설명',
        createdAt: new Date().toISOString(),
      };

      const context = manager.initializeContext('session-1', project);

      expect(context.currentTopic).toBe('테스트 프로젝트');
      expect(context.entities.size).toBe(1);
      expect(context.entities.has('project_project-1')).toBe(true);
    });

    it('여러 세션의 컨텍스트를 독립적으로 관리해야 함', () => {
      const context1 = manager.initializeContext('session-1');
      const context2 = manager.initializeContext('session-2');

      expect(context1.sessionId).toBe('session-1');
      expect(context2.sessionId).toBe('session-2');
      expect(context1).not.toBe(context2);
    });
  });

  describe('analyzeMessageContext', () => {
    beforeEach(() => {
      manager.initializeContext('session-1');
    });

    it('메시지에서 토픽을 추출해야 함', async () => {
      const nodes = await manager.analyzeMessageContext('건설 공사에 대해 분석해주세요', 'session-1');

      const topicNodes = nodes.filter(n => n.type === 'topic');
      expect(topicNodes.length).toBeGreaterThan(0);
      expect(topicNodes.some(n => n.value === '건설')).toBe(true);
    });

    it('메시지에서 엔티티를 추출해야 함', async () => {
      const nodes = await manager.analyzeMessageContext('삼성건설이 100억원을 투자했습니다', 'session-1');

      const entityNodes = nodes.filter(n => n.type === 'entity');
      expect(entityNodes.length).toBeGreaterThan(0);
    });

    it('메시지에서 액션을 추출해야 함', async () => {
      const nodes = await manager.analyzeMessageContext('이 데이터를 분석해주세요', 'session-1');

      const actionNodes = nodes.filter(n => n.type === 'action');
      expect(actionNodes.length).toBeGreaterThan(0);
      expect(actionNodes.some(n => n.value === '분석')).toBe(true);
    });

    it('메시지에서 감정을 추출해야 함', async () => {
      const nodes = await manager.analyzeMessageContext('이 결과가 좋다', 'session-1');

      const emotionNodes = nodes.filter(n => n.type === 'emotion');
      expect(emotionNodes.length).toBeGreaterThan(0);
      expect(emotionNodes.some(n => n.value === '긍정')).toBe(true);
    });

    it('존재하지 않는 세션에 대해 빈 배열을 반환해야 함', async () => {
      const nodes = await manager.analyzeMessageContext('테스트 메시지', 'nonexistent');

      expect(nodes).toEqual([]);
    });

    it('추출된 노드가 컨텍스트에 저장되어야 함', async () => {
      await manager.analyzeMessageContext('건설 공사를 분석해주세요', 'session-1');

      const context = manager.getContext('session-1');
      expect(context).toBeDefined();
      expect(context!.topics.size).toBeGreaterThan(0);
      expect(context!.actions.size).toBeGreaterThan(0);
    });

    it('여러 토픽을 추출해야 함', async () => {
      const nodes = await manager.analyzeMessageContext('건설과 부동산 투자에 대해 분석해주세요', 'session-1');

      const topicNodes = nodes.filter(n => n.type === 'topic');
      expect(topicNodes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('generateContextualResponse', () => {
    beforeEach(() => {
      manager.initializeContext('session-1');
    });

    it('컨텍스트 기반 응답을 생성해야 함', async () => {
      const response = await manager.generateContextualResponse('건설 공사 분석', 'session-1');

      expect(response).toBeDefined();
      expect(response.length).toBeGreaterThan(0);
    });

    it('토픽 기반으로 응답을 조정해야 함', async () => {
      await manager.analyzeMessageContext('건설 공사 분석', 'session-1');
      const response = await manager.generateContextualResponse('분석 요청', 'session-1');

      expect(response).toBeDefined();
      expect(response.length).toBeGreaterThan(0);
    });

    it('감정 기반으로 응답을 조정해야 함', async () => {
      const response = await manager.generateContextualResponse('좋은 결과입니다', 'session-1');

      expect(response).toBeDefined();
    });

    it('존재하지 않는 세션에 대해 원본 메시지를 반환해야 함', async () => {
      const response = await manager.generateContextualResponse('테스트 메시지', 'nonexistent');

      expect(response).toBe('테스트 메시지');
    });
  });

  describe('generateContextSummary', () => {
    beforeEach(() => {
      manager.initializeContext('session-1');
    });

    it('컨텍스트 요약을 생성해야 함', () => {
      const summary = manager.generateContextSummary('session-1');

      expect(summary).toContain('대화 컨텍스트 요약');
      expect(summary).toContain('현재 토픽');
      expect(summary).toContain('general');
    });

    it('분석된 컨텍스트 정보를 포함해야 함', async () => {
      await manager.analyzeMessageContext('건설 공사를 분석해주세요', 'session-1');
      const summary = manager.generateContextSummary('session-1');

      expect(summary).toContain('건설');
    });

    it('존재하지 않는 세션에 대해 기본 메시지를 반환해야 함', () => {
      const summary = manager.generateContextSummary('nonexistent');

      expect(summary).toBe('컨텍스트 정보가 없습니다.');
    });

    it('엔티티 정보를 포함해야 함', async () => {
      await manager.analyzeMessageContext('삼성건설이 100억원을 투자했습니다', 'session-1');
      const summary = manager.generateContextSummary('session-1');

      expect(summary).toContain('주요 엔티티');
    });
  });

  describe('getContext', () => {
    it('컨텍스트를 조회해야 함', () => {
      manager.initializeContext('session-1');
      const context = manager.getContext('session-1');

      expect(context).toBeDefined();
      expect(context?.sessionId).toBe('session-1');
    });

    it('존재하지 않는 세션에 대해 null을 반환해야 함', () => {
      const context = manager.getContext('nonexistent');

      expect(context).toBeNull();
    });
  });

  describe('전역 컨텍스트', () => {
    it('전역 컨텍스트를 설정해야 함', () => {
      manager.setGlobalContext('key1', 'value1');

      expect(manager.getGlobalContext('key1')).toBe('value1');
    });

    it('전역 컨텍스트를 조회해야 함', () => {
      manager.setGlobalContext('key2', { data: 'test' });

      const value = manager.getGlobalContext('key2');
      expect(value).toEqual({ data: 'test' });
    });

    it('존재하지 않는 전역 컨텍스트에 대해 undefined를 반환해야 함', () => {
      const value = manager.getGlobalContext('nonexistent');

      expect(value).toBeUndefined();
    });
  });

  describe('clearContext', () => {
    it('컨텍스트를 삭제해야 함', () => {
      manager.initializeContext('session-1');
      manager.clearContext('session-1');

      const context = manager.getContext('session-1');
      expect(context).toBeNull();
    });

    it('다른 세션의 컨텍스트는 유지되어야 함', () => {
      manager.initializeContext('session-1');
      manager.initializeContext('session-2');
      manager.clearContext('session-1');

      expect(manager.getContext('session-1')).toBeNull();
      expect(manager.getContext('session-2')).toBeDefined();
    });
  });

  describe('통합 테스트', () => {
    it('전체 워크플로우를 테스트해야 함', async () => {
      const project: Project = {
        id: 'project-1',
        name: '테스트 프로젝트',
        description: '설명',
        createdAt: new Date().toISOString(),
      };

      // 1. 컨텍스트 초기화
      manager.initializeContext('session-1', project);

      // 2. 메시지 분석
      const nodes = await manager.analyzeMessageContext('건설 공사를 분석해주세요', 'session-1');
      expect(nodes.length).toBeGreaterThan(0);

      // 3. 컨텍스트 기반 응답 생성
      const response = await manager.generateContextualResponse('분석 결과', 'session-1');
      expect(response).toBeDefined();

      // 4. 컨텍스트 요약 생성
      const summary = manager.generateContextSummary('session-1');
      expect(summary).toContain('테스트 프로젝트');

      // 5. 컨텍스트 조회
      const context = manager.getContext('session-1');
      expect(context).toBeDefined();
      expect(context!.topics.size).toBeGreaterThan(0);
    });

    it('여러 메시지 분석 후 컨텍스트가 누적되어야 함', async () => {
      manager.initializeContext('session-1');

      await manager.analyzeMessageContext('건설 공사', 'session-1');
      await manager.analyzeMessageContext('부동산 투자', 'session-1');

      const context = manager.getContext('session-1');
      expect(context!.topics.size).toBeGreaterThan(0);
    });

    it('시간 컨텍스트가 업데이트되어야 함', async () => {
      jest.useFakeTimers();
      const startTime = 1000000000000;
      jest.spyOn(Date, 'now').mockReturnValue(startTime);

      manager.initializeContext('session-1');
      const initialContext = manager.getContext('session-1');

      jest.spyOn(Date, 'now').mockReturnValue(startTime + 60000); // 1분 경과
      jest.spyOn(Date.prototype, 'getTime').mockReturnValue(startTime + 60000);

      await manager.analyzeMessageContext('테스트 메시지', 'session-1');
      const updatedContext = manager.getContext('session-1');

      expect(updatedContext!.temporalContext.duration).toBeGreaterThanOrEqual(initialContext!.temporalContext.duration);
      
      jest.useRealTimers();
    });
  });
});

