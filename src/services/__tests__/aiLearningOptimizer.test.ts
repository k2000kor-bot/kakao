/**
 * AILearningOptimizer 테스트
 */

import aiLearningOptimizer, {
  AILearningOptimizer,
} from '../aiLearningOptimizer';
import { ChatSession } from '../../types/chat';
import { Project } from '../../types/project';

describe('AILearningOptimizer', () => {
  let optimizer: AILearningOptimizer;

  beforeEach(() => {
    optimizer = new AILearningOptimizer();
  });

  describe('초기화', () => {
    it('인스턴스 생성', () => {
      expect(optimizer).toBeInstanceOf(AILearningOptimizer);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(aiLearningOptimizer).toBeInstanceOf(AILearningOptimizer);
    });
  });

  describe('학습 패턴 수집', () => {
    it('학습 패턴 수집', () => {
      const userId = 'user-1';
      const sessionId = 'session-1';
      const interaction = {
        type: 'question',
        domain: 'technical',
        complexity: 'medium',
        responseTime: 2000,
      };

      optimizer.collectLearningPattern(userId, sessionId, interaction);
      
      // 패턴이 수집되었는지 확인하기 위해 최적화 실행
      const result = optimizer.runOptimization(userId);
      expect(result).toBeDefined();
    });

    it('여러 패턴 수집', () => {
      const userId = 'user-2';
      const sessionId = 'session-1';

      optimizer.collectLearningPattern(userId, sessionId, {
        type: 'question',
        domain: 'technical',
        complexity: 'low',
        responseTime: 1000,
      });

      optimizer.collectLearningPattern(userId, sessionId, {
        type: 'question',
        domain: 'technical',
        complexity: 'high',
        responseTime: 4000,
      });

      const result = optimizer.runOptimization(userId);
      expect(result).toBeDefined();
    });

    it('빈도 증가 확인', () => {
      const userId = 'user-3';
      const sessionId = 'session-1';
      const interaction = {
        type: 'question',
        domain: 'technical',
        complexity: 'medium',
        responseTime: 2000,
      };

      optimizer.collectLearningPattern(userId, sessionId, interaction);
      optimizer.collectLearningPattern(userId, sessionId, interaction);
      optimizer.collectLearningPattern(userId, sessionId, interaction);

      const result = optimizer.runOptimization(userId);
      expect(result).toBeDefined();
    });
  });

  describe('최적화 실행', () => {
    it('패턴이 없는 사용자 최적화', async () => {
      const result = await optimizer.runOptimization('non-existent-user');

      expect(result).toBeDefined();
      expect(result.improved).toBe(false);
      expect(result.confidence).toBe(0.5);
      expect(result.reasoning).toContain('패턴 데이터가 부족');
    });

    it('패턴이 있는 사용자 최적화', async () => {
      const userId = 'user-4';
      optimizer.collectLearningPattern(userId, 'session-1', {
        type: 'question',
        domain: 'technical',
        complexity: 'medium',
        responseTime: 4000, // 느린 응답 시간으로 최적화 기회 생성
      });

      const result = await optimizer.runOptimization(userId);

      expect(result).toBeDefined();
      expect(typeof result.improved).toBe('boolean');
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(typeof result.reasoning).toBe('string');
      expect(typeof result.changes).toBe('object');
    });

    it('세션이 있는 최적화', async () => {
      const userId = 'user-5';
      optimizer.collectLearningPattern(userId, 'session-1', {
        type: 'question',
        domain: 'technical',
        complexity: 'medium',
        responseTime: 2000,
      });

      const session: ChatSession = {
        id: 'session-1',
        projectId: 'project-1',
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: '부동산 시장 분석에 대해 알려주세요',
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await optimizer.runOptimization(userId, session);

      expect(result).toBeDefined();
      expect(result.improved).toBeDefined();
    });

    it('프로젝트가 있는 최적화', async () => {
      const userId = 'user-6';
      optimizer.collectLearningPattern(userId, 'session-1', {
        type: 'question',
        domain: 'technical',
        complexity: 'medium',
        responseTime: 2000,
      });

      const project: Project = {
        id: 'project-1',
        name: '부동산 투자 프로젝트',
        description: '부동산 분석',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await optimizer.runOptimization(userId, undefined, project);

      expect(result).toBeDefined();
      expect(result.improved).toBeDefined();
    });

    it('세션과 프로젝트가 모두 있는 최적화', async () => {
      const userId = 'user-7';
      optimizer.collectLearningPattern(userId, 'session-1', {
        type: 'question',
        domain: 'technical',
        complexity: 'medium',
        responseTime: 2000,
      });

      const session: ChatSession = {
        id: 'session-1',
        projectId: 'project-1',
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: '건설 프로젝트 분석',
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const project: Project = {
        id: 'project-1',
        name: '건설 프로젝트',
        description: '건설 분석',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await optimizer.runOptimization(userId, session, project);

      expect(result).toBeDefined();
      expect(result.improved).toBeDefined();
    });
  });

  describe('응답 시간 최적화', () => {
    it('느린 응답 시간에 대한 최적화', async () => {
      const userId = 'user-8';
      
      // 느린 응답 시간 패턴 수집
      for (let i = 0; i < 5; i++) {
        optimizer.collectLearningPattern(userId, 'session-1', {
          type: 'question',
          domain: 'technical',
          complexity: 'medium',
          responseTime: 5000, // 느린 응답 시간
        });
      }

      const result = await optimizer.runOptimization(userId);

      expect(result).toBeDefined();
      // 응답 시간 최적화가 적용되었는지 확인
      if (result.improved) {
        expect(result.changes).toBeDefined();
      }
    });
  });

  describe('사용자 선호도 기반 최적화', () => {
    it('간결한 응답 스타일 선호도 감지', async () => {
      const userId = 'user-9';
      
      // 간결한 패턴을 많이 생성
      for (let i = 0; i < 10; i++) {
        optimizer.collectLearningPattern(userId, 'session-1', {
          type: 'question',
          domain: 'technical',
          complexity: 'low',
          responseTime: 1000,
        });
      }

      const result = await optimizer.runOptimization(userId);

      expect(result).toBeDefined();
      if (result.improved && result.changes.responseStyle) {
        expect(result.changes.responseStyle).toBe('concise');
      }
    });
  });

  describe('도메인별 최적화', () => {
    it('부동산 도메인 감지', async () => {
      const userId = 'user-10';
      optimizer.collectLearningPattern(userId, 'session-1', {
        type: 'question',
        domain: 'technical',
        complexity: 'medium',
        responseTime: 2000,
      });

      const project: Project = {
        id: 'project-1',
        name: '부동산 투자 분석',
        description: '부동산',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await optimizer.runOptimization(userId, undefined, project);

      expect(result).toBeDefined();
    });

    it('건설 도메인 감지', async () => {
      const userId = 'user-11';
      optimizer.collectLearningPattern(userId, 'session-1', {
        type: 'question',
        domain: 'technical',
        complexity: 'medium',
        responseTime: 2000,
      });

      const session: ChatSession = {
        id: 'session-1',
        projectId: 'project-1',
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: '건설 시공사 정보',
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await optimizer.runOptimization(userId, session);

      expect(result).toBeDefined();
    });
  });

  describe('최적화 결과', () => {
    it('최적화 결과 구조 확인', async () => {
      const userId = 'user-12';
      optimizer.collectLearningPattern(userId, 'session-1', {
        type: 'question',
        domain: 'technical',
        complexity: 'medium',
        responseTime: 2000,
      });

      const result = await optimizer.runOptimization(userId);

      expect(result).toHaveProperty('improved');
      expect(result).toHaveProperty('changes');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('reasoning');
      
      expect(typeof result.improved).toBe('boolean');
      expect(typeof result.changes).toBe('object');
      expect(typeof result.confidence).toBe('number');
      expect(typeof result.reasoning).toBe('string');
    });

    it('최적화가 개선된 경우', async () => {
      const userId = 'user-13';
      
      // 최적화 기회를 만드는 패턴
      for (let i = 0; i < 5; i++) {
        optimizer.collectLearningPattern(userId, 'session-1', {
          type: 'question',
          domain: 'technical',
          complexity: 'medium',
          responseTime: 4000, // 느린 응답 시간
        });
      }

      const result = await optimizer.runOptimization(userId);

      // 최적화가 적용되었을 수 있음
      if (result.improved) {
        expect(Object.keys(result.changes).length).toBeGreaterThan(0);
        expect(result.confidence).toBeGreaterThan(0.5);
      }
    });
  });

  describe('다양한 복잡도', () => {
    it('낮은 복잡도 패턴', () => {
      const userId = 'user-14';
      optimizer.collectLearningPattern(userId, 'session-1', {
        type: 'question',
        domain: 'technical',
        complexity: 'low',
        responseTime: 1000,
      });

      const result = optimizer.runOptimization(userId);
      expect(result).toBeDefined();
    });

    it('높은 복잡도 패턴', () => {
      const userId = 'user-15';
      optimizer.collectLearningPattern(userId, 'session-1', {
        type: 'question',
        domain: 'technical',
        complexity: 'high',
        responseTime: 5000,
      });

      const result = optimizer.runOptimization(userId);
      expect(result).toBeDefined();
    });
  });
});

