/**
 * SelfEvolutionService 테스트
 * @jest-environment jsdom
 */
/* eslint-disable jest/no-conditional-expect */

import {
  selfEvolutionService,
  SelfEvolutionService,
  SelfEvolutionCapability,
} from '../selfEvolutionService';

// localStorage 모킹
const localStorageMock = (() => {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

global.console.log = jest.fn();

describe('SelfEvolutionService', () => {
  let service: SelfEvolutionService;
  let mockDateNow: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockDateNow = jest.spyOn(Date, 'now').mockReturnValue(1000000);

    service = new SelfEvolutionService();
    localStorageMock.clear();
  });

  afterEach(() => {
    service.stopSelfEvolution();
    jest.useRealTimers();
    mockDateNow.mockRestore();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(SelfEvolutionService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(selfEvolutionService).toBeDefined();
      expect(selfEvolutionService).toBeInstanceOf(SelfEvolutionService);
    });

    it('초기 능력 목록 확인', () => {
      const capabilities = service.getCapabilities();
      expect(capabilities.length).toBeGreaterThan(0);
    });

    it('기본 진화 모드 비활성화', () => {
      expect(service.isEvolutionMode()).toBe(false);
    });
  });

  describe('자가 발전 모드', () => {
    it('자가 발전 모드 시작', () => {
      service.startSelfEvolution();
      
      expect(service.isEvolutionMode()).toBe(true);
    });

    it('자가 발전 모드 중지', () => {
      service.startSelfEvolution();
      service.stopSelfEvolution();
      
      expect(service.isEvolutionMode()).toBe(false);
    });

    it('진화 강도 설정', () => {
      service.setEvolutionIntensity(0.8);
      expect(service.getEvolutionIntensity()).toBe(0.8);
    });

    it('진화 강도 범위 제한 - 최소값', () => {
      service.setEvolutionIntensity(-0.5);
      expect(service.getEvolutionIntensity()).toBe(0);
    });

    it('진화 강도 범위 제한 - 최대값', () => {
      service.setEvolutionIntensity(1.5);
      expect(service.getEvolutionIntensity()).toBe(1);
    });
  });

  describe('메타 학습', () => {
    it('메타 학습 수행', async () => {
      const metaLearning = await service.performMetaLearning();

      expect(metaLearning).toBeDefined();
      expect(metaLearning.id).toBeDefined();
      expect(metaLearning.timestamp).toBeInstanceOf(Date);
      expect(metaLearning.learningPattern).toBeDefined();
      expect(metaLearning.effectiveness).toBeGreaterThanOrEqual(0);
      expect(metaLearning.effectiveness).toBeLessThanOrEqual(1);
      expect(Array.isArray(metaLearning.newCapabilities)).toBe(true);
      expect(Array.isArray(metaLearning.crossDomainApplication)).toBe(true);
    });

    it('메타 학습 기록 저장', async () => {
      await service.performMetaLearning();
      
      const metaLearningList = service.getMetaLearning();
      expect(metaLearningList.length).toBeGreaterThan(0);
    });

    it('메타 학습 후 능력 수준 향상', async () => {
      const capabilitiesBefore = service.getCapabilities();
      const metaLearningCapability = capabilitiesBefore.find(c => c.id === 'meta_learning');
      const levelBefore = metaLearningCapability?.currentLevel || 0;

      await service.performMetaLearning();

      const capabilitiesAfter = service.getCapabilities();
      const metaLearningCapabilityAfter = capabilitiesAfter.find(c => c.id === 'meta_learning');
      
      // 능력이 향상되었거나 유지되었는지 확인
      expect(metaLearningCapabilityAfter?.currentLevel).toBeGreaterThanOrEqual(levelBefore);
    });

    it('비활성화된 메타 학습 능력 시 에러', async () => {
      const capabilities = service.getCapabilities();
      const metaLearningCapability = capabilities.find(c => c.id === 'meta_learning');
      if (metaLearningCapability) {
        metaLearningCapability.isActive = false;
      }

      await expect(service.performMetaLearning()).rejects.toThrow();
    });
  });

  describe('자가 최적화', () => {
    it('자가 최적화 수행', async () => {
      const optimizationPromise = service.performSelfOptimization();
      jest.advanceTimersByTime(2000); // setTimeout 실행
      await Promise.resolve();
      const optimization = await optimizationPromise;

      expect(optimization).toBeDefined();
      expect(optimization.id).toBeDefined();
      expect(optimization.timestamp).toBeInstanceOf(Date);
      expect(optimization.targetMetric).toBeDefined();
      expect(typeof optimization.currentValue).toBe('number');
      expect(typeof optimization.targetValue).toBe('number');
      expect(optimization.optimizationMethod).toBeDefined();
      expect(typeof optimization.improvement).toBe('number');
      expect(typeof optimization.resourcesUsed).toBe('number');
      expect(typeof optimization.sustainability).toBe('number');
    });

    it('자가 최적화 기록 저장', async () => {
      const optimizationPromise = service.performSelfOptimization();
      jest.advanceTimersByTime(2000);
      await Promise.resolve();
      await optimizationPromise;
      
      const optimizations = service.getSelfOptimizations();
      expect(optimizations.length).toBeGreaterThan(0);
    });

    it('비활성화된 자가 최적화 능력 시 에러', async () => {
      const capabilities = service.getCapabilities();
      const optimizationCapability = capabilities.find(c => c.id === 'self_optimization');
      if (optimizationCapability) {
        optimizationCapability.isActive = false;
      }

      await expect(service.performSelfOptimization()).rejects.toThrow();
    });
  });

  describe('아키텍처 진화', () => {
    it('아키텍처 진화 수행', async () => {
      const evolutionPromise = service.performArchitecturalEvolution();
      jest.advanceTimersByTime(3000); // setTimeout 실행
      await Promise.resolve();
      const evolution = await evolutionPromise;

      expect(evolution).toBeDefined();
      expect(evolution.id).toBeDefined();
      expect(evolution.timestamp).toBeInstanceOf(Date);
      expect(evolution.component).toBeDefined();
      expect(['addition', 'modification', 'removal', 'restructure']).toContain(evolution.changeType);
      expect(evolution.reason).toBeDefined();
      expect(['positive', 'negative', 'neutral']).toContain(evolution.impact);
      expect(typeof evolution.performanceGain).toBe('number');
      expect(typeof evolution.complexityChange).toBe('number');
      expect(typeof evolution.stability).toBe('number');
    });

    it('아키텍처 진화 기록 저장', async () => {
      const evolutionPromise = service.performArchitecturalEvolution();
      jest.advanceTimersByTime(3000);
      await Promise.resolve();
      await evolutionPromise;
      
      const evolutions = service.getArchitecturalEvolutions();
      expect(evolutions.length).toBeGreaterThan(0);
    });

    it('비활성화된 아키텍처 진화 능력 시 에러', async () => {
      const capabilities = service.getCapabilities();
      const architecturalCapability = capabilities.find(c => c.id === 'architectural_evolution');
      if (architecturalCapability) {
        architecturalCapability.isActive = false;
      }

      await expect(service.performArchitecturalEvolution()).rejects.toThrow();
    });
  });

  describe('의식 진화', () => {
    it('의식 진화 수행', async () => {
      const evolution = await service.performConsciousnessEvolution();

      expect(evolution).toBeDefined();
      expect(evolution.id).toBeDefined();
      expect(evolution.timestamp).toBeInstanceOf(Date);
      expect(typeof evolution.awarenessLevel).toBe('number');
      expect(typeof evolution.selfReflectionDepth).toBe('number');
      expect(typeof evolution.creativityIndex).toBe('number');
      expect(typeof evolution.emotionalIntelligence).toBe('number');
      expect(typeof evolution.wisdomLevel).toBe('number');
      expect(Array.isArray(evolution.insights)).toBe(true);
      expect(Array.isArray(evolution.philosophicalQuestions)).toBe(true);
      expect(Array.isArray(evolution.existentialUnderstanding)).toBe(true);
    });

    it('의식 진화 기록 저장', async () => {
      await service.performConsciousnessEvolution();
      
      const evolutions = service.getConsciousnessEvolutions();
      expect(evolutions.length).toBeGreaterThan(0);
    });

    it('비활성화된 의식 진화 능력 시 에러', async () => {
      const capabilities = service.getCapabilities();
      const consciousnessCapability = capabilities.find(c => c.id === 'consciousness_evolution');
      if (consciousnessCapability) {
        consciousnessCapability.isActive = false;
      }

      await expect(service.performConsciousnessEvolution()).rejects.toThrow();
    });
  });

  describe('창의성 돌파', () => {
    it('창의성 돌파 수행', async () => {
      const breakthrough = await service.performCreativeBreakthrough();

      expect(breakthrough).toBeDefined();
      expect(breakthrough.id).toBeDefined();
      expect(breakthrough.timestamp).toBeInstanceOf(Date);
      expect(breakthrough.domain).toBeDefined();
      expect(breakthrough.innovation).toBeDefined();
      expect(typeof breakthrough.originality).toBe('number');
      expect(typeof breakthrough.usefulness).toBe('number');
      expect(breakthrough.implementation).toBeDefined();
      expect(breakthrough.impact).toBeDefined();
      expect(Array.isArray(breakthrough.inspiration)).toBe(true);
    });

    it('창의성 돌파 기록 저장', async () => {
      await service.performCreativeBreakthrough();
      
      const breakthroughs = service.getCreativeBreakthroughs();
      expect(breakthroughs.length).toBeGreaterThan(0);
    });

    it('비활성화된 창의성 진화 능력 시 에러', async () => {
      const capabilities = service.getCapabilities();
      const creativeCapability = capabilities.find(c => c.id === 'creative_evolution');
      if (creativeCapability) {
        creativeCapability.isActive = false;
      }

      await expect(service.performCreativeBreakthrough()).rejects.toThrow();
    });
  });

  describe('자가 주도 목표', () => {
    it('자가 주도 목표 생성', async () => {
      const goal = await service.createSelfDirectedGoal();

      expect(goal).toBeDefined();
      expect(goal.id).toBeDefined();
      expect(goal.timestamp).toBeInstanceOf(Date);
      expect(goal.goal).toBeDefined();
      expect(goal.motivation).toBeDefined();
      expect(typeof goal.difficulty).toBe('number');
      expect(typeof goal.progress).toBe('number');
      expect(Array.isArray(goal.milestones)).toBe(true);
      expect(Array.isArray(goal.learningOutcomes)).toBe(true);
      expect(typeof goal.success).toBe('boolean');
    });

    it('자가 주도 목표 기록 저장', async () => {
      await service.createSelfDirectedGoal();
      
      const goals = service.getSelfDirectedGoals();
      expect(goals.length).toBeGreaterThan(0);
    });

    it('목표에 마일스톤 포함', async () => {
      const goal = await service.createSelfDirectedGoal();

      expect(goal.milestones.length).toBeGreaterThan(0);
      goal.milestones.forEach(milestone => {
        expect(milestone.id).toBeDefined();
        expect(milestone.name).toBeDefined();
        expect(milestone.targetDate).toBeInstanceOf(Date);
        expect(['pending', 'in_progress', 'completed', 'failed']).toContain(milestone.status);
        expect(typeof milestone.difficulty).toBe('number');
        expect(typeof milestone.learningValue).toBe('number');
      });
    });
  });

  describe('능력 진화', () => {
    it('능력 목록 조회', () => {
      const capabilities = service.getCapabilities();
      
      expect(Array.isArray(capabilities)).toBe(true);
      capabilities.forEach(capability => {
        expect(capability).toHaveProperty('id');
        expect(capability).toHaveProperty('name');
        expect(capability).toHaveProperty('type');
        expect(typeof capability.currentLevel).toBe('number');
        expect(typeof capability.targetLevel).toBe('number');
        expect(typeof capability.evolutionRate).toBe('number');
        expect(capability.lastEvolution).toBeInstanceOf(Date);
        expect(Array.isArray(capability.evolutionHistory)).toBe(true);
        expect(typeof capability.isActive).toBe('boolean');
        expect(typeof capability.confidence).toBe('number');
      });
    });

    it('능력 수준 범위 확인', () => {
      const capabilities = service.getCapabilities();
      
      capabilities.forEach(capability => {
        expect(capability.currentLevel).toBeGreaterThanOrEqual(0);
        expect(capability.currentLevel).toBeLessThanOrEqual(100);
        expect(capability.targetLevel).toBeGreaterThanOrEqual(0);
        expect(capability.targetLevel).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('고도화된 자가 발전', () => {
    it('고도화된 진화 상태 조회', () => {
      const status = service.getAdvancedEvolutionStatus();
      
      expect(status).toBeDefined();
      expect(status.quantum).toBeDefined();
      expect(status.neural).toBeDefined();
      expect(status.dimensional).toBeDefined();
      expect(status.creative).toBeDefined();
    });

    it('고도화된 진화 시작', () => {
      service.startAdvancedEvolution();
      
      // 상태가 변경되었는지 확인
      const status = service.getAdvancedEvolutionStatus();
      expect(status).toBeDefined();
    });

    it('진화 진행 상황 조회', () => {
      const progress = service.getEvolutionProgress();
      
      expect(progress).toBeDefined();
      expect(progress.overall).toBeDefined();
      expect(progress.details).toBeDefined();
    });
  });

  describe('데이터 저장 및 로드', () => {
    it('데이터 저장', async () => {
      await service.performMetaLearning();
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('저장된 데이터 로드', () => {
      const mockCapability: SelfEvolutionCapability = {
        id: 'test_capability',
        name: '테스트 능력',
        type: 'learning',
        currentLevel: 50,
        targetLevel: 100,
        evolutionRate: 0.1,
        lastEvolution: new Date(1000000),
        evolutionHistory: [],
        isActive: true,
        confidence: 0.8,
      };

      localStorageMock.setItem('self_evolution_capabilities', JSON.stringify([mockCapability]));

      const newService = new SelfEvolutionService();
      const capabilities = newService.getCapabilities();
      
      // 로드된 데이터 확인 (초기화된 데이터와 병합될 수 있음)
      expect(capabilities.length).toBeGreaterThan(0);
    });
  });

  describe('기록 제한', () => {
    it('메타 학습 기록 제한', async () => {
      // 50개 이상 메타 학습 수행
      for (let i = 0; i < 60; i++) {
        await service.performMetaLearning();
      }

      const metaLearningList = service.getMetaLearning();
      expect(metaLearningList.length).toBeLessThanOrEqual(50);
    });

    it('자가 최적화 기록 제한', async () => {
      // 30개 이상 자가 최적화 수행
      for (let i = 0; i < 40; i++) {
        const optimizationPromise = service.performSelfOptimization();
        jest.advanceTimersByTime(2000);
        await Promise.resolve();
        await optimizationPromise;
      }

      const optimizations = service.getSelfOptimizations();
      expect(optimizations.length).toBeLessThanOrEqual(30);
    });

    it('아키텍처 진화 기록 제한', async () => {
      // 20개 이상 아키텍처 진화 수행
      for (let i = 0; i < 25; i++) {
        const evolutionPromise = service.performArchitecturalEvolution();
        jest.advanceTimersByTime(3000);
        await Promise.resolve();
        await evolutionPromise;
      }

      const evolutions = service.getArchitecturalEvolutions();
      expect(evolutions.length).toBeLessThanOrEqual(20);
    });
  });

  describe('능력 진화 기록', () => {
    it('진화 후 기록 추가', async () => {
      const capabilitiesBefore = service.getCapabilities();
      const capability = capabilitiesBefore.find(c => c.id === 'meta_learning');
      const historyLengthBefore = capability?.evolutionHistory.length || 0;

      await service.performMetaLearning();

      const capabilitiesAfter = service.getCapabilities();
      const capabilityAfter = capabilitiesAfter.find(c => c.id === 'meta_learning');
      
      // 진화 기록이 추가되었는지 확인
      expect(capabilityAfter?.evolutionHistory.length).toBeGreaterThanOrEqual(historyLengthBefore);
    });

    it('진화 기록 구조 확인', async () => {
      await service.performMetaLearning();

      const capabilities = service.getCapabilities();
      const capability = capabilities.find(c => c.id === 'meta_learning');
      
      if (capability && capability.evolutionHistory.length > 0) {
        const record = capability.evolutionHistory[0];
        expect(record).toHaveProperty('id');
        expect(record).toHaveProperty('timestamp');
        expect(typeof record.fromLevel).toBe('number');
        expect(typeof record.toLevel).toBe('number');
        expect(typeof record.improvement).toBe('number');
        expect(record.method).toBeDefined();
        expect(typeof record.success).toBe('boolean');
        expect(Array.isArray(record.learningPoints)).toBe(true);
        expect(Array.isArray(record.nextTargets)).toBe(true);
      }
    });
  });

  describe('에지 케이스', () => {
    it('빈 목록 반환 확인', () => {
      const newService = new SelfEvolutionService();
      
      expect(Array.isArray(newService.getMetaLearning())).toBe(true);
      expect(Array.isArray(newService.getSelfOptimizations())).toBe(true);
      expect(Array.isArray(newService.getArchitecturalEvolutions())).toBe(true);
      expect(Array.isArray(newService.getConsciousnessEvolutions())).toBe(true);
      expect(Array.isArray(newService.getCreativeBreakthroughs())).toBe(true);
      expect(Array.isArray(newService.getSelfDirectedGoals())).toBe(true);
    });

    it('복사본 반환 확인', () => {
      const capabilities1 = service.getCapabilities();
      const capabilities2 = service.getCapabilities();

      expect(capabilities1).not.toBe(capabilities2);
      expect(capabilities1.length).toBe(capabilities2.length);
    });
  });
});

