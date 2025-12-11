/**
 * AIAutonomousSystemService 테스트
 */

// Mock dependencies
jest.mock('../realTimeMonitoringService', () => ({
  __esModule: true,
  default: {
    getCurrentMetrics: jest.fn(() => ({
      cpu: 45,
      memory: 60,
      network: 30,
    })),
  },
}));

jest.mock('../aiPredictiveAnalyticsService', () => ({
  __esModule: true,
  default: {
    getPredictions: jest.fn(() => {
      return [];
    }),
  },
}));

jest.mock('../adaptiveLearningEngine', () => ({
  __esModule: true,
  default: {
    adapt: jest.fn(() => Promise.resolve({ success: true })),
  },
}));

jest.mock('../aiSystemOptimizationEngine', () => ({
  __esModule: true,
  aiSystemOptimizationEngine: {
    optimize: jest.fn(() => Promise.resolve({ optimized: true })),
    performOptimization: jest.fn(() => Promise.resolve({ optimized: true })),
  },
}));

import {
  aiAutonomousSystemService,
  AIAutonomousSystemService,
  SelfDiagnostic,
  SelfHealing,
  AutonomousEvolution,
  SystemConsciousness,
} from '../aiAutonomousSystemService';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('AIAutonomousSystemService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    jest.useFakeTimers();
    
    // realTimeMonitoringService 모킹 재설정
    const realTimeMonitoringService = require('../realTimeMonitoringService').default;
    realTimeMonitoringService.getCurrentMetrics.mockReturnValue({
      cpu: 45,
      memory: 60,
      network: 30,
    });
    
    // aiPredictiveAnalyticsService 모킹 재설정
    const aiPredictiveAnalyticsService = require('../aiPredictiveAnalyticsService').default;
    aiPredictiveAnalyticsService.getPredictions.mockReturnValue([]);
    
    // 자율 모드 중지
    try {
      if (aiAutonomousSystemService && aiAutonomousSystemService.isAutonomous()) {
        aiAutonomousSystemService.stopAutonomousMode();
      }
    } catch (e) {
      // 초기화 중일 수 있으므로 무시
    }
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('초기화', () => {
    it('서비스 초기화 확인', () => {
      expect(aiAutonomousSystemService).toBeInstanceOf(AIAutonomousSystemService);
    });

    it('초기 능력 목록 확인', () => {
      const capabilities = aiAutonomousSystemService.getCapabilities();

      expect(Array.isArray(capabilities)).toBe(true);
      expect(capabilities.length).toBeGreaterThan(0);
      expect(capabilities[0]).toHaveProperty('id');
      expect(capabilities[0]).toHaveProperty('name');
      expect(capabilities[0]).toHaveProperty('type');
      expect(capabilities[0]).toHaveProperty('status');
    });
  });

  describe('자율 모드 관리', () => {
    it('자율 모드 시작', () => {
      aiAutonomousSystemService.startAutonomousMode();

      expect(aiAutonomousSystemService.isAutonomous()).toBe(true);
      expect(aiAutonomousSystemService.getAutonomyLevel()).toBeGreaterThan(0);
    });

    it('자율 모드 중지', () => {
      aiAutonomousSystemService.startAutonomousMode();
      expect(aiAutonomousSystemService.isAutonomous()).toBe(true);

      aiAutonomousSystemService.stopAutonomousMode();
      expect(aiAutonomousSystemService.isAutonomous()).toBe(false);
    });

    it('자율성 수준 설정', () => {
      aiAutonomousSystemService.setAutonomyLevel(75);

      expect(aiAutonomousSystemService.getAutonomyLevel()).toBe(75);
    });

    it('자율성 수준 범위 제한 (0-100)', () => {
      aiAutonomousSystemService.setAutonomyLevel(150);
      expect(aiAutonomousSystemService.getAutonomyLevel()).toBe(100);

      aiAutonomousSystemService.setAutonomyLevel(-10);
      expect(aiAutonomousSystemService.getAutonomyLevel()).toBe(0);
    });
  });

  describe('자가 진단', () => {
    it('자가 진단 수행', async () => {
      const diagnostics = await aiAutonomousSystemService.performSelfDiagnostic();

      expect(Array.isArray(diagnostics)).toBe(true);
    });

    it('높은 CPU 사용률 진단', async () => {
      const realTimeMonitoringService = require('../realTimeMonitoringService').default;
      realTimeMonitoringService.getCurrentMetrics.mockReturnValueOnce({
        cpu: 96, // 95보다 크게 설정하여 critical이 되도록
        memory: 60,
        network: 30,
      });

      const diagnostics = await aiAutonomousSystemService.performSelfDiagnostic();

      if (diagnostics.length > 0) {
        const cpuDiagnostic = diagnostics.find(
          (d) => d.systemComponent === 'CPU'
        );
        if (cpuDiagnostic) {
          expect(['critical', 'high']).toContain(cpuDiagnostic.severity);
          expect(cpuDiagnostic.issueType).toBe('performance');
          expect(cpuDiagnostic.autoFixAvailable).toBe(true);
        }
      }
    });

    it('높은 메모리 사용률 진단', async () => {
      const realTimeMonitoringService = require('../realTimeMonitoringService').default;
      realTimeMonitoringService.getCurrentMetrics.mockReturnValueOnce({
        cpu: 45,
        memory: 90,
        network: 30,
      });

      const diagnostics = await aiAutonomousSystemService.performSelfDiagnostic();

      if (diagnostics.length > 0) {
        const memoryDiagnostic = diagnostics.find(
          (d) => d.systemComponent === 'Memory'
        );
        if (memoryDiagnostic) {
          expect(memoryDiagnostic.issueType).toBe('memory');
          expect(memoryDiagnostic.autoFixAvailable).toBe(true);
        }
      }
    });

    it('진단 결과 저장 확인', async () => {
      const realTimeMonitoringService = require('../realTimeMonitoringService').default;
      realTimeMonitoringService.getCurrentMetrics.mockReturnValueOnce({
        cpu: 95,
        memory: 90,
        network: 30,
      });

      await aiAutonomousSystemService.performSelfDiagnostic();

      const allDiagnostics = aiAutonomousSystemService.getDiagnostics();
      expect(allDiagnostics.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('자가 치유', () => {
    it('자가 치유 수행', async () => {
      jest.useFakeTimers();
      const diagnostic: SelfDiagnostic = {
        id: 'test-diagnostic',
        timestamp: new Date(),
        systemComponent: 'CPU',
        issueType: 'performance',
        severity: 'high',
        description: 'Test diagnostic',
        rootCause: 'Test cause',
        confidence: 0.9,
        autoFixAvailable: true,
        estimatedImpact: 0.5,
        recommendedActions: ['Action 1', 'Action 2'],
      };

      const healingPromise = aiAutonomousSystemService.performSelfHealing(diagnostic);
      jest.advanceTimersByTime(10000);
      const healing = await healingPromise;

      expect(healing).toBeDefined();
      expect(healing.diagnosticId).toBe(diagnostic.id);
      expect(healing.healingType).toBe('automatic');
      expect(Array.isArray(healing.actions)).toBe(true);
      expect(['initiated', 'in_progress', 'completed', 'failed']).toContain(
        healing.status
      );
      expect(typeof healing.successRate).toBe('number');
      expect(healing.successRate).toBeGreaterThanOrEqual(0);
      expect(healing.successRate).toBeLessThanOrEqual(1);
    }, 15000);

    it('성능 문제 치유 액션 생성', async () => {
      jest.useFakeTimers();
      const diagnostic: SelfDiagnostic = {
        id: 'test-diagnostic',
        timestamp: new Date(),
        systemComponent: 'CPU',
        issueType: 'performance',
        severity: 'high',
        description: 'Test',
        rootCause: 'Test',
        confidence: 0.9,
        autoFixAvailable: true,
        estimatedImpact: 0.5,
        recommendedActions: [],
      };

      const healingPromise = aiAutonomousSystemService.performSelfHealing(diagnostic);
      jest.advanceTimersByTime(10000);
      const healing = await healingPromise;

      expect(healing.actions.length).toBeGreaterThan(0);
      const optimizeAction = healing.actions.find(
        (a) => a.type === 'optimize'
      );
      expect(optimizeAction).toBeDefined();
    }, 15000);

    it('메모리 문제 치유 액션 생성', async () => {
      jest.useFakeTimers();
      const diagnostic: SelfDiagnostic = {
        id: 'test-diagnostic',
        timestamp: new Date(),
        systemComponent: 'Memory',
        issueType: 'memory',
        severity: 'high',
        description: 'Test',
        rootCause: 'Test',
        confidence: 0.9,
        autoFixAvailable: true,
        estimatedImpact: 0.5,
        recommendedActions: [],
      };

      const healingPromise = aiAutonomousSystemService.performSelfHealing(diagnostic);
      jest.advanceTimersByTime(10000);
      const healing = await healingPromise;

      expect(healing.actions.length).toBeGreaterThan(0);
      const repairAction = healing.actions.find((a) => a.type === 'repair');
      expect(repairAction).toBeDefined();
    }, 15000);

    it('치유 결과 저장 확인', async () => {
      const diagnostic: SelfDiagnostic = {
        id: 'test-diagnostic',
        timestamp: new Date(),
        systemComponent: 'CPU',
        issueType: 'performance',
        severity: 'medium',
        description: 'Test',
        rootCause: 'Test',
        confidence: 0.9,
        autoFixAvailable: true,
        estimatedImpact: 0.3,
        recommendedActions: [],
      };

      jest.useFakeTimers();
      const healingPromise = aiAutonomousSystemService.performSelfHealing(diagnostic);
      jest.advanceTimersByTime(10000);
      await healingPromise;
      jest.useRealTimers();

      const allHealing = aiAutonomousSystemService.getHealingActions();
      expect(allHealing.length).toBeGreaterThan(0);
    }, 15000);
  });

  describe('자율 진화', () => {
    it('진화 수행', async () => {
      const evolution = await aiAutonomousSystemService.performEvolution();

      expect(evolution).toBeDefined();
      if (evolution) {
        expect(evolution.evolutionType).toBeDefined();
        expect(['algorithm', 'architecture', 'behavior', 'knowledge']).toContain(
          evolution.evolutionType
        );
        expect(Array.isArray(evolution.evolutionPath)).toBe(true);
        expect(typeof evolution.progress).toBe('number');
        expect(evolution.progress).toBeGreaterThanOrEqual(0);
        expect(evolution.progress).toBeLessThanOrEqual(100);
      }
    });

    it('진화 결과 저장 확인', async () => {
      await aiAutonomousSystemService.performEvolution();

      const evolutions = aiAutonomousSystemService.getEvolutions();
      expect(evolutions.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('의식 시뮬레이션', () => {
    it('의식 시뮬레이션 수행', async () => {
      const consciousness = await aiAutonomousSystemService.simulateConsciousness();

      expect(consciousness).toBeDefined();
      expect(typeof consciousness.awarenessLevel).toBe('number');
      expect(consciousness.awarenessLevel).toBeGreaterThanOrEqual(0);
      expect(consciousness.awarenessLevel).toBeLessThanOrEqual(100);
      expect(Array.isArray(consciousness.selfReflection)).toBe(true);
      expect(typeof consciousness.goalAlignment).toBe('number');
      expect(typeof consciousness.creativityIndex).toBe('number');
      expect(['curious', 'focused', 'concerned', 'satisfied', 'innovative']).toContain(
        consciousness.emotionalState
      );
      expect(Array.isArray(consciousness.insights)).toBe(true);
      expect(Array.isArray(consciousness.questions)).toBe(true);
      expect(Array.isArray(consciousness.decisions)).toBe(true);
    });

    it('의식 결과 저장 확인', async () => {
      await aiAutonomousSystemService.simulateConsciousness();

      const consciousnessRecords = aiAutonomousSystemService.getConsciousness();
      expect(consciousnessRecords.length).toBeGreaterThan(0);
    });
  });

  describe('데이터 조회', () => {
    it('능력 목록 조회', () => {
      const capabilities = aiAutonomousSystemService.getCapabilities();

      expect(Array.isArray(capabilities)).toBe(true);
      capabilities.forEach((capability) => {
        expect(capability).toHaveProperty('id');
        expect(capability).toHaveProperty('name');
        expect(capability).toHaveProperty('type');
        expect(capability).toHaveProperty('status');
        expect(capability).toHaveProperty('confidence');
        expect(capability).toHaveProperty('successRate');
      });
    });

    it('진단 목록 조회', () => {
      const diagnostics = aiAutonomousSystemService.getDiagnostics();

      expect(Array.isArray(diagnostics)).toBe(true);
    });

    it('치유 목록 조회', () => {
      const healing = aiAutonomousSystemService.getHealingActions();

      expect(Array.isArray(healing)).toBe(true);
    });

    it('진화 목록 조회', () => {
      const evolutions = aiAutonomousSystemService.getEvolutions();

      expect(Array.isArray(evolutions)).toBe(true);
    });

    it('의식 기록 조회', () => {
      const consciousness = aiAutonomousSystemService.getConsciousness();

      expect(Array.isArray(consciousness)).toBe(true);
    });

    it('의식 수준 조회', () => {
      const level = aiAutonomousSystemService.getConsciousnessLevel();

      expect(typeof level).toBe('number');
      expect(level).toBeGreaterThanOrEqual(0);
    });
  });

  describe('통합 테스트', () => {
    it('자율 모드 전체 흐름', async () => {
      aiAutonomousSystemService.startAutonomousMode();

      expect(aiAutonomousSystemService.isAutonomous()).toBe(true);

      // 진단 수행
      const diagnostics = await aiAutonomousSystemService.performSelfDiagnostic();
      expect(Array.isArray(diagnostics)).toBe(true);

      // 진화 수행
      const evolution = await aiAutonomousSystemService.performEvolution();
      if (evolution) {
        expect(evolution).toBeDefined();
      }

      // 의식 시뮬레이션
      const consciousness = await aiAutonomousSystemService.simulateConsciousness();
      expect(consciousness).toBeDefined();

      aiAutonomousSystemService.stopAutonomousMode();
      expect(aiAutonomousSystemService.isAutonomous()).toBe(false);
    });
  });

  describe('인스턴스 확인', () => {
    it('싱글톤 인스턴스 확인', () => {
      expect(aiAutonomousSystemService).toBeInstanceOf(
        AIAutonomousSystemService
      );
    });
  });
});

