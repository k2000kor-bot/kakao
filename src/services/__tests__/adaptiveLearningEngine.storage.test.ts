/** @jest-environment jsdom */
/**
 * adaptiveLearningEngine — localStorage 손상 시 복원력 (별도 파일: jest.resetModules 격리)
 */
import { ADAPTIVE_LEARNING_STORAGE_KEYS } from '../adaptiveLearningStorageKeys';

const K = ADAPTIVE_LEARNING_STORAGE_KEYS;

describe('adaptiveLearningEngine localStorage 복원력', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetModules();
  });

  it('adaptiveLearningPatterns JSON이 깨져 있어도 새 인스턴스는 기본 모델을 유지한다', () => {
    jest.resetModules();

    const getItemSpy = jest.spyOn(window.localStorage, 'getItem').mockImplementation((key: string) => {
      if (key === K.patterns) return '{';
      return null;
    });
    const consoleErr = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const mod = require('../adaptiveLearningEngine');
      const fresh = mod.default ?? mod;

      expect(getItemSpy).toHaveBeenCalledWith(K.patterns);
      expect(fresh.getAdaptiveModels().length).toBeGreaterThanOrEqual(3);
    } finally {
      consoleErr.mockRestore();
      getItemSpy.mockRestore();
    }
  });

  it('optimizationResults JSON이 깨져 있어도 기본 모델을 유지하고 이전 키까지 로드된 상태는 롤백되지 않는다', () => {
    jest.resetModules();

    const getItemSpy = jest.spyOn(window.localStorage, 'getItem').mockImplementation((key: string) => {
      if (key === K.patterns) return '[]';
      if (key === K.optimizationResults) return '{';
      if (key === K.predictiveInsights) return null;
      return null;
    });
    const consoleErr = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const mod = require('../adaptiveLearningEngine');
      const fresh = mod.default ?? mod;

      expect(getItemSpy).toHaveBeenCalledWith(K.optimizationResults);
      expect(fresh.getAdaptiveModels().length).toBeGreaterThanOrEqual(3);
      expect(fresh.getLearningPatterns()).toEqual([]);
      expect(fresh.getOptimizationResults()).toEqual([]);
      expect(fresh.getPredictiveInsights()).toEqual([]);
    } finally {
      consoleErr.mockRestore();
      getItemSpy.mockRestore();
    }
  });

  it('optimizationResults만 깨져 있어도 predictiveInsights는 이후 키로 계속 로드된다', () => {
    jest.resetModules();

    const validInsight = JSON.stringify([
      {
        id: 'ins-1',
        insight: 'ok',
        confidence: 0.9,
        timeframe: 'short_term',
        category: 'performance',
        recommendations: [],
        dataPoints: 1,
        lastUpdated: '2020-01-01T00:00:00.000Z',
      },
    ]);

    const getItemSpy = jest.spyOn(window.localStorage, 'getItem').mockImplementation((key: string) => {
      if (key === K.patterns) return '[]';
      if (key === K.optimizationResults) return '{';
      if (key === K.predictiveInsights) return validInsight;
      return null;
    });
    const consoleErr = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const mod = require('../adaptiveLearningEngine');
      const fresh = mod.default ?? mod;

      expect(fresh.getLearningPatterns()).toEqual([]);
      expect(fresh.getOptimizationResults()).toEqual([]);
      expect(fresh.getPredictiveInsights()).toHaveLength(1);
      expect(fresh.getPredictiveInsights()[0].id).toBe('ins-1');
      expect(fresh.getAdaptiveModels().length).toBeGreaterThanOrEqual(3);
    } finally {
      consoleErr.mockRestore();
      getItemSpy.mockRestore();
    }
  });

  it('저장 값이 유효 JSON이지만 배열이 아니면 해당 필드는 초기 빈 배열을 유지한다', () => {
    jest.resetModules();

    const getItemSpy = jest.spyOn(window.localStorage, 'getItem').mockImplementation((key: string) => {
      if (key === K.patterns) return '{}';
      if (key === K.optimizationResults) return '{}';
      if (key === K.predictiveInsights) return '{}';
      return null;
    });
    const consoleErr = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const mod = require('../adaptiveLearningEngine');
      const fresh = mod.default ?? mod;

      expect(fresh.getAdaptiveModels().length).toBeGreaterThanOrEqual(3);
      expect(fresh.getLearningPatterns()).toEqual([]);
      expect(fresh.getOptimizationResults()).toEqual([]);
      expect(fresh.getPredictiveInsights()).toEqual([]);
    } finally {
      consoleErr.mockRestore();
      getItemSpy.mockRestore();
    }
  });

  it('predictiveInsights JSON이 깨져 있어도 기본 모델을 유지한다', () => {
    jest.resetModules();

    const getItemSpy = jest.spyOn(window.localStorage, 'getItem').mockImplementation((key: string) => {
      if (key === K.patterns) return '[]';
      if (key === K.optimizationResults) return '[]';
      if (key === K.predictiveInsights) return '{';
      return null;
    });
    const consoleErr = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const mod = require('../adaptiveLearningEngine');
      const fresh = mod.default ?? mod;

      expect(getItemSpy).toHaveBeenCalledWith(K.predictiveInsights);
      expect(fresh.getAdaptiveModels().length).toBeGreaterThanOrEqual(3);
      expect(fresh.getLearningPatterns()).toEqual([]);
      expect(fresh.getOptimizationResults()).toEqual([]);
      expect(fresh.getPredictiveInsights()).toEqual([]);
    } finally {
      consoleErr.mockRestore();
      getItemSpy.mockRestore();
    }
  });
});
