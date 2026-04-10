/**
 * adaptiveLearningEngine 서비스 테스트
 * 적응형 학습 엔진 테스트
 */

import adaptiveLearningEngine, {
  AdaptiveLearningEngine,
  OptimizationResult,
  ADAPTIVE_LEARNING_STORAGE_KEYS,
  MESSAGE_PATTERN_METRICS,
  PROJECT_CREATION_PATTERN_METRICS,
  CHAT_ACTIVITY_PATTERN_METRICS,
} from '../adaptiveLearningEngine';
import { ADAPTIVE_LEARNING_STORAGE_KEYS as STORAGE_KEYS_MODULE } from '../adaptiveLearningStorageKeys';
import { Project, Chat, Message } from '../../types/project';
import { errorLogger } from '../../utils/errorLogger';

const MP = MESSAGE_PATTERN_METRICS;
const PCP = PROJECT_CREATION_PATTERN_METRICS;
const CAP = CHAT_ACTIVITY_PATTERN_METRICS;

describe('ADAPTIVE_LEARNING_STORAGE_KEYS', () => {
  it('adaptiveLearningEngine 재보내기가 키 전용 모듈과 동일 참조다', () => {
    expect(ADAPTIVE_LEARNING_STORAGE_KEYS).toBe(STORAGE_KEYS_MODULE);
  });

  it('세 저장 키 문자열이 비어 있지 않고 서로 다르다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const keys = [K.patterns, K.optimizationResults, K.predictiveInsights];

    expect(keys.every((s) => typeof s === 'string' && s.length > 0)).toBe(true);
    expect(new Set(keys).size).toBe(3);
  });
});

describe('MESSAGE_PATTERN_METRICS', () => {
  it('windowHours와 recentWindowMs가 동일한 시간 창을 가리킨다', () => {
    const msPerHour = 60 * 60 * 1000;
    expect(MP.windowHours * msPerHour).toBe(MP.recentWindowMs);
  });

  it('confidence 샘플 목표는 message-pattern 최소 메시지 수 이상이다', () => {
    expect(MP.confidenceSampleTarget).toBeGreaterThanOrEqual(MP.minMessages);
  });

  it('confidenceCap은 impact와 함께 0~1 구간에 있다', () => {
    expect(MP.confidenceCap).toBeGreaterThan(0);
    expect(MP.confidenceCap).toBeLessThanOrEqual(1);
    expect(MP.impact).toBeGreaterThanOrEqual(0);
    expect(MP.impact).toBeLessThanOrEqual(1);
  });
});

describe('PROJECT_CREATION_PATTERN_METRICS', () => {
  it('confidence 샘플 목표는 최소 프로젝트 수 이상이다', () => {
    expect(PCP.confidenceSampleTarget).toBeGreaterThanOrEqual(PCP.minProjects);
  });

  it('frequency 분모 일수가 양수다', () => {
    expect(PCP.frequencyWindowDays).toBeGreaterThan(0);
  });
});

describe('CHAT_ACTIVITY_PATTERN_METRICS', () => {
  it('confidenceCap와 impact가 0~1 구간에 있다', () => {
    expect(CAP.confidenceCap).toBeGreaterThan(0);
    expect(CAP.confidenceCap).toBeLessThanOrEqual(1);
    expect(CAP.impact).toBeGreaterThanOrEqual(0);
    expect(CAP.impact).toBeLessThanOrEqual(1);
  });

  it('confidence 샘플 목표가 양수다', () => {
    expect(CAP.confidenceSampleTarget).toBeGreaterThan(0);
  });
});

describe('AdaptiveLearningEngine (storage 주입)', () => {
  it('setItem 실패 시 errorLogger.error(saveData) 호출·호출부로 예외 전파하지 않음', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceeded');
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const errSpy = jest.spyOn(errorLogger, 'error').mockImplementation(() => {});

    expect(() =>
      engine.learnFromOptimizationResult({
        id: 'opt_injected',
        optimizationId: 'x',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0.15,
        userSatisfaction: 0.8,
        learningInsights: [],
        appliedAt: new Date(),
      }),
    ).not.toThrow();

    const saveCalls = errSpy.mock.calls.filter(
      (c) =>
        typeof c[2] === 'object' &&
        c[2] !== null &&
        (c[2] as { action?: string }).action === 'saveData',
    );
    expect(saveCalls.length).toBeGreaterThanOrEqual(1);
    expect(String(saveCalls[0][0])).toContain('저장');

    errSpy.mockRestore();
  });

  it('learnUserBehavior 호출 시 setItem 실패해도 errorLogger.error(saveData)가 호출되고 예외는 전파되지 않는다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceeded');
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const errSpy = jest.spyOn(errorLogger, 'error').mockImplementation(() => {});

    expect(() => engine.learnUserBehavior([], [], [])).not.toThrow();

    const saveCalls = errSpy.mock.calls.filter(
      (c) =>
        typeof c[2] === 'object' &&
        c[2] !== null &&
        (c[2] as { action?: string }).action === 'saveData',
    );
    expect(saveCalls.length).toBeGreaterThanOrEqual(1);
    expect(String(saveCalls[0][0])).toContain('저장');

    errSpy.mockRestore();
  });

  it('retrainModels 호출 시 setItem 실패해도 errorLogger.error(saveData)가 호출되고 예외는 전파되지 않는다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceeded');
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const errSpy = jest.spyOn(errorLogger, 'error').mockImplementation(() => {});
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.02);

    expect(() => engine.retrainModels()).not.toThrow();

    const saveCalls = errSpy.mock.calls.filter(
      (c) =>
        typeof c[2] === 'object' &&
        c[2] !== null &&
        (c[2] as { action?: string }).action === 'saveData',
    );
    expect(saveCalls.length).toBeGreaterThanOrEqual(1);
    expect(String(saveCalls[0][0])).toContain('저장');

    errSpy.mockRestore();
    randomSpy.mockRestore();
  });

  it('generatePredictiveInsights 호출 시 setItem 실패해도 errorLogger.error(saveData)가 호출되고 예외는 전파되지 않는다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceeded');
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const errSpy = jest.spyOn(errorLogger, 'error').mockImplementation(() => {});

    expect(() => engine.generatePredictiveInsights()).not.toThrow();

    const saveCalls = errSpy.mock.calls.filter(
      (c) =>
        typeof c[2] === 'object' &&
        c[2] !== null &&
        (c[2] as { action?: string }).action === 'saveData',
    );
    expect(saveCalls.length).toBeGreaterThanOrEqual(1);
    expect(String(saveCalls[0][0])).toContain('저장');

    errSpy.mockRestore();
  });

  it('saveData에서 첫 번째 setItem(patterns)만 실패하면 optimizationResults·predictiveInsights 키는 setItem이 호출되지 않는다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const calls: string[] = [];
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: (key) => {
        calls.push(key);
        if (key === K.patterns) throw new Error('fail');
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const errSpy = jest.spyOn(errorLogger, 'error').mockImplementation(() => {});

    expect(() => engine.learnUserBehavior([], [], [])).not.toThrow();

    expect(calls).toEqual([K.patterns]);
    expect(calls.some((k) => k === K.optimizationResults)).toBe(false);
    expect(calls.some((k) => k === K.predictiveInsights)).toBe(false);

    errSpy.mockRestore();
  });

  it('saveData에서 두 번째 setItem(optimizationResults)만 실패하면 predictiveInsights 키는 setItem이 호출되지 않는다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const calls: string[] = [];
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: (key) => {
        calls.push(key);
        if (key === K.optimizationResults) throw new Error('fail');
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const errSpy = jest.spyOn(errorLogger, 'error').mockImplementation(() => {});

    expect(() => engine.learnUserBehavior([], [], [])).not.toThrow();

    expect(calls).toEqual([K.patterns, K.optimizationResults]);
    expect(calls.some((k) => k === K.predictiveInsights)).toBe(false);

    errSpy.mockRestore();
  });

  it('saveData에서 세 번째 setItem(predictiveInsights)만 실패하면 세 키 모두 setItem이 호출된다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const calls: string[] = [];
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: (key) => {
        calls.push(key);
        if (key === K.predictiveInsights) throw new Error('fail');
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const errSpy = jest.spyOn(errorLogger, 'error').mockImplementation(() => {});

    expect(() => engine.learnUserBehavior([], [], [])).not.toThrow();

    expect(calls).toEqual([K.patterns, K.optimizationResults, K.predictiveInsights]);

    errSpy.mockRestore();
  });

  it('주입한 storage에 세 키로 JSON이 저장된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;

    engine.learnFromOptimizationResult({
      id: 'opt_ok',
      optimizationId: 'y',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.15,
      userSatisfaction: 0.8,
      learningInsights: [],
      appliedAt: new Date(),
    });

    expect(store.has(K.patterns)).toBe(true);
    expect(store.has(K.optimizationResults)).toBe(true);
    expect(store.has(K.predictiveInsights)).toBe(true);
    const optRaw = store.get(K.optimizationResults);
    expect(optRaw).toBeDefined();
    const opt = JSON.parse(optRaw as string) as { id?: string }[];
    expect(Array.isArray(opt)).toBe(true);
    expect(opt.some((o) => o.id === 'opt_ok')).toBe(true);
  });

  it('learnFromOptimizationResult 후 saveData에 기록된 optimizationResults JSON에 learningInsights·appliedAt 문자열이 포함된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const appliedAt = new Date('2024-03-15T09:30:00.000Z');
    engine.learnFromOptimizationResult({
      id: 'opt-json',
      optimizationId: 'y',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.12,
      userSatisfaction: 0.85,
      learningInsights: ['x', 'y'],
      appliedAt,
    });
    const raw = store.get(K.optimizationResults);
    expect(raw).toBeDefined();
    const rows = JSON.parse(raw as string) as {
      id?: string;
      learningInsights?: string[];
      appliedAt?: string;
    }[];
    const row = rows.find((r) => r.id === 'opt-json');
    expect(row?.learningInsights).toEqual(['x', 'y']);
    expect(typeof row?.appliedAt).toBe('string');
    expect(row?.appliedAt).toBe(appliedAt.toISOString());
  });

  it('learnFromOptimizationResult 후 saveData에 기록된 optimizationResults JSON에 beforeMetrics·afterMetrics·userSatisfaction이 포함된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.learnFromOptimizationResult({
      id: 'opt-meta-json',
      optimizationId: 'z',
      beforeMetrics: { latency: 200 },
      afterMetrics: { latency: 120 },
      improvement: 0.1,
      userSatisfaction: 0.77,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const raw = store.get(K.optimizationResults);
    expect(raw).toBeDefined();
    const rows = JSON.parse(raw as string) as {
      id?: string;
      optimizationId?: string;
      beforeMetrics?: Record<string, unknown>;
      afterMetrics?: Record<string, unknown>;
      userSatisfaction?: number;
    }[];
    const row = rows.find((r) => r.id === 'opt-meta-json');
    expect(row?.optimizationId).toBe('z');
    expect(row?.beforeMetrics).toEqual({ latency: 200 });
    expect(row?.afterMetrics).toEqual({ latency: 120 });
    expect(row?.userSatisfaction).toBe(0.77);
  });

  it('learnFromOptimizationResult 후 saveData의 optimizationResults JSON에 중첩 beforeMetrics·배열 afterMetrics가 보존된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.learnFromOptimizationResult({
      id: 'opt-nested-json',
      optimizationId: 'nested',
      beforeMetrics: { outer: { inner: 1 } },
      afterMetrics: { items: [1, 2] },
      improvement: 0.1,
      userSatisfaction: 0.8,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const raw = store.get(K.optimizationResults);
    expect(raw).toBeDefined();
    const rows = JSON.parse(raw as string) as {
      id?: string;
      beforeMetrics?: Record<string, unknown>;
      afterMetrics?: Record<string, unknown>;
    }[];
    const row = rows.find((r) => r.id === 'opt-nested-json');
    expect(row?.beforeMetrics).toEqual({ outer: { inner: 1 } });
    expect(row?.afterMetrics).toEqual({ items: [1, 2] });
  });

  it('learnFromOptimizationResult 후 saveData의 optimizationResults JSON에 learningInsights 문자열 3개 배열이 보존된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.learnFromOptimizationResult({
      id: 'opt-li3',
      optimizationId: 'li',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.05,
      userSatisfaction: 0.9,
      learningInsights: ['a', 'b', 'c'],
      appliedAt: new Date(),
    });
    const raw = store.get(K.optimizationResults);
    expect(raw).toBeDefined();
    const rows = JSON.parse(raw as string) as { id?: string; learningInsights?: string[] }[];
    const row = rows.find((r) => r.id === 'opt-li3');
    expect(row?.learningInsights).toEqual(['a', 'b', 'c']);
  });

  it('learnFromOptimizationResult 후 saveData의 optimizationResults JSON에 learningInsights 단일 요소 배열이 보존된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.learnFromOptimizationResult({
      id: 'opt-li1',
      optimizationId: 'li',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.05,
      userSatisfaction: 0.9,
      learningInsights: ['only'],
      appliedAt: new Date(),
    });
    const raw = store.get(K.optimizationResults);
    expect(raw).toBeDefined();
    const rows = JSON.parse(raw as string) as { id?: string; learningInsights?: string[] }[];
    expect(rows.find((r) => r.id === 'opt-li1')?.learningInsights).toEqual(['only']);
  });

  it('learnFromOptimizationResult 후 saveData의 optimizationResults JSON에 beforeMetrics null 값이 보존된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.learnFromOptimizationResult({
      id: 'opt-null-meta',
      optimizationId: 'x',
      beforeMetrics: { absent: null },
      afterMetrics: {},
      improvement: 0.01,
      userSatisfaction: 0.5,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const raw = store.get(K.optimizationResults);
    expect(raw).toBeDefined();
    const rows = JSON.parse(raw as string) as { id?: string; beforeMetrics?: Record<string, unknown> | null }[];
    expect(rows.find((r) => r.id === 'opt-null-meta')?.beforeMetrics).toEqual({ absent: null });
  });

  it('learnFromOptimizationResult 후 saveData의 optimizationResults JSON에 afterMetrics null 값이 보존된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.learnFromOptimizationResult({
      id: 'opt-null-after',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: { ok: null },
      improvement: 0.01,
      userSatisfaction: 0.5,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const raw = store.get(K.optimizationResults);
    expect(raw).toBeDefined();
    const rows = JSON.parse(raw as string) as { id?: string; afterMetrics?: Record<string, unknown> | null }[];
    expect(rows.find((r) => r.id === 'opt-null-after')?.afterMetrics).toEqual({ ok: null });
  });

  it('learnFromOptimizationResult 후 saveData의 optimizationResults JSON에 userSatisfaction 0이 보존된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.learnFromOptimizationResult({
      id: 'opt-us0',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0,
      userSatisfaction: 0,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const raw = store.get(K.optimizationResults);
    expect(raw).toBeDefined();
    const rows = JSON.parse(raw as string) as { id?: string; userSatisfaction?: number }[];
    expect(rows.find((r) => r.id === 'opt-us0')?.userSatisfaction).toBe(0);
  });

  it('learnFromOptimizationResult 후 saveData의 optimizationResults JSON에 userSatisfaction 1이 보존된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.learnFromOptimizationResult({
      id: 'opt-us1',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.2,
      userSatisfaction: 1,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const raw = store.get(K.optimizationResults);
    expect(raw).toBeDefined();
    const rows = JSON.parse(raw as string) as { id?: string; userSatisfaction?: number }[];
    expect(rows.find((r) => r.id === 'opt-us1')?.userSatisfaction).toBe(1);
  });

  it('learnFromOptimizationResult 후 saveData의 optimizationResults JSON에 improvement가 1보다 큰 값도 보존된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.learnFromOptimizationResult({
      id: 'opt-imp-big',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 1.25,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const raw = store.get(K.optimizationResults);
    expect(raw).toBeDefined();
    const rows = JSON.parse(raw as string) as { id?: string; improvement?: number }[];
    expect(rows.find((r) => r.id === 'opt-imp-big')?.improvement).toBe(1.25);
  });

  it('learnFromOptimizationResult를 동일 id로 두 번 호출하면 optimizationResults에 같은 id가 두 건 쌓인다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base: OptimizationResult = {
      id: 'dup-opt',
      optimizationId: 'opt-a',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    };
    engine.learnFromOptimizationResult(base);
    engine.learnFromOptimizationResult({ ...base, optimizationId: 'opt-b' });
    const rows = engine.getOptimizationResults();
    expect(rows).toHaveLength(2);
    expect(rows.every((r) => r.id === 'dup-opt')).toBe(true);
  });

  it('learnFromOptimizationResult를 두 번 호출하면 saveData의 optimizationResults JSON에 두 건·optimizationId·appliedAt ISO가 기록된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const t1 = new Date('2025-06-01T12:00:00.000Z');
    const t2 = new Date('2025-06-01T13:00:00.000Z');
    engine.learnFromOptimizationResult({
      id: 'o-seq-1',
      optimizationId: 'seq-a',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: t1,
    });
    engine.learnFromOptimizationResult({
      id: 'o-seq-2',
      optimizationId: 'seq-b',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.05,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: t2,
    });
    const raw = store.get(K.optimizationResults);
    expect(raw).toBeDefined();
    const rows = JSON.parse(raw as string) as {
      id?: string;
      optimizationId?: string;
      appliedAt?: string;
    }[];
    expect(rows).toHaveLength(2);
    expect(rows.find((r) => r.id === 'o-seq-1')?.optimizationId).toBe('seq-a');
    expect(rows.find((r) => r.id === 'o-seq-2')?.optimizationId).toBe('seq-b');
    expect(rows.find((r) => r.id === 'o-seq-1')?.appliedAt).toBe(t1.toISOString());
    expect(rows.find((r) => r.id === 'o-seq-2')?.appliedAt).toBe(t2.toISOString());
  });

  it('learnFromOptimizationResult 후 saveData의 predictiveInsights JSON에 performance 인사이트의 insight가 비어 있지 않은 문자열로 기록된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.learnFromOptimizationResult({
      id: 'o-ins-str',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const raw = store.get(K.predictiveInsights);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as Array<{ category?: string; insight?: string }>;
    const perf = parsed.find((i) => i.category === 'performance');
    expect(perf).toBeDefined();
    expect(typeof perf?.insight).toBe('string');
    expect(perf!.insight!.length).toBeGreaterThan(0);
  });

  it('learnFromOptimizationResult 후 saveData의 predictiveInsights JSON에 performance 인사이트의 timeframe·dataPoints·confidence가 기록된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.learnFromOptimizationResult({
      id: 'o-pi-meta',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const raw = store.get(K.predictiveInsights);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as Array<{
      category?: string;
      timeframe?: string;
      dataPoints?: number;
      confidence?: number;
    }>;
    const perf = parsed.find((i) => i.category === 'performance');
    expect(perf?.timeframe).toBe('medium_term');
    expect(typeof perf?.dataPoints).toBe('number');
    expect(perf!.dataPoints!).toBeGreaterThanOrEqual(1);
    expect(typeof perf?.confidence).toBe('number');
    expect(perf!.confidence!).toBeGreaterThanOrEqual(0);
    expect(perf!.confidence!).toBeLessThanOrEqual(1);
  });

  it('learnFromOptimizationResult 후 saveData의 predictiveInsights JSON에 performance 인사이트의 lastUpdated ISO 문자열이 있다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.learnFromOptimizationResult({
      id: 'o-pi-lu',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const raw = store.get(K.predictiveInsights);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as Array<{ category?: string; lastUpdated?: string }>;
    const perf = parsed.find((i) => i.category === 'performance');
    expect(typeof perf?.lastUpdated).toBe('string');
    expect(Number.isNaN(Date.parse(perf!.lastUpdated!))).toBe(false);
  });

  it('learnFromOptimizationResult 후 saveData의 predictiveInsights JSON에 performance 인사이트의 dataPoints가 1이다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.learnFromOptimizationResult({
      id: 'o-dp-perf',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const raw = store.get(K.predictiveInsights);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as Array<{ category?: string; dataPoints?: number }>;
    const perf = parsed.find((i) => i.category === 'performance');
    expect(perf?.dataPoints).toBe(1);
  });

  it('learnFromOptimizationResult(improvement>0) 후 saveData의 predictiveInsights JSON에 performance 인사이트와 recommendations가 기록된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.learnFromOptimizationResult({
      id: 'o-pi-json',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const raw = store.get(K.predictiveInsights);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as Array<{
      category?: string;
      recommendations?: string[];
    }>;
    const perf = parsed.find((i) => i.category === 'performance');
    expect(perf).toBeDefined();
    expect(Array.isArray(perf?.recommendations)).toBe(true);
    expect(perf!.recommendations!.length).toBeGreaterThan(0);
    expect(perf!.recommendations!.every((r) => typeof r === 'string')).toBe(true);
  });

  it('learnFromOptimizationResult(improvement=0) 후에도 saveData의 predictiveInsights JSON에 performance 인사이트가 기록된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.learnFromOptimizationResult({
      id: 'o-imp0-json',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const raw = store.get(K.predictiveInsights);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as Array<{ category?: string }>;
    expect(parsed.some((i) => i.category === 'performance')).toBe(true);
  });

  it('learnFromOptimizationResult(improvement<0) 후에도 saveData의 predictiveInsights JSON에 performance 인사이트가 기록된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.learnFromOptimizationResult({
      id: 'o-imp-neg-pi',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: -0.07,
      userSatisfaction: 0.8,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const raw = store.get(K.predictiveInsights);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as Array<{ category?: string }>;
    expect(parsed.some((i) => i.category === 'performance')).toBe(true);
  });

  it('learnFromOptimizationResult(improvement<0) 후 saveData의 optimizationResults JSON에 음수 improvement가 기록된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.learnFromOptimizationResult({
      id: 'o-or-neg-json',
      optimizationId: 'opt-neg',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: -0.07,
      userSatisfaction: 0.8,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const raw = store.get(K.optimizationResults);
    expect(raw).toBeDefined();
    const rows = JSON.parse(raw as string) as { id?: string; improvement?: number }[];
    const row = rows.find((r) => r.id === 'o-or-neg-json');
    expect(row?.improvement).toBe(-0.07);
  });

  it('learnFromOptimizationResult(improvement 0.05) 후 saveData의 optimizationResults JSON에 improvement가 0.05로 기록된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.learnFromOptimizationResult({
      id: 'o-imp-pos-json',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.05,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const raw = store.get(K.optimizationResults);
    expect(raw).toBeDefined();
    const rows = JSON.parse(raw as string) as { id?: string; improvement?: number }[];
    expect(rows.find((r) => r.id === 'o-imp-pos-json')?.improvement).toBe(0.05);
  });

  it('주입 patterns에 system_performance가 있으면 generatePredictiveInsights 후 saveData의 predictiveInsights JSON에 resource_usage와 recommendations가 기록된다', () => {
    const store = new Map<string, string>();
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const row = {
      id: 'sys-perf-json',
      pattern: '리소스',
      frequency: 0.5,
      impact: 0.75,
      confidence: 0.6,
      lastObserved: new Date().toISOString(),
      category: 'system_performance' as const,
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify([row]) : null),
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const raw = store.get(K.predictiveInsights);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as Array<{
      category?: string;
      recommendations?: string[];
    }>;
    const ru = parsed.find((i) => i.category === 'resource_usage');
    expect(ru).toBeDefined();
    expect(Array.isArray(ru?.recommendations)).toBe(true);
    expect(ru!.recommendations!.length).toBeGreaterThan(0);
    expect(ru!.recommendations!.every((r) => typeof r === 'string')).toBe(true);
  });

  it('주입 patterns에 system_performance가 있으면 generatePredictiveInsights 후 saveData의 predictiveInsights JSON에 resource_usage의 timeframe·lastUpdated가 기록된다', () => {
    const store = new Map<string, string>();
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const row = {
      id: 'sys-perf-tf',
      pattern: '리소스',
      frequency: 0.5,
      impact: 0.75,
      confidence: 0.6,
      lastObserved: new Date().toISOString(),
      category: 'system_performance' as const,
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify([row]) : null),
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const raw = store.get(K.predictiveInsights);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as Array<{
      category?: string;
      timeframe?: string;
      lastUpdated?: string;
    }>;
    const ru = parsed.find((i) => i.category === 'resource_usage');
    expect(ru?.timeframe).toBe('short_term');
    expect(typeof ru?.lastUpdated).toBe('string');
    expect(Number.isNaN(Date.parse(ru!.lastUpdated!))).toBe(false);
  });

  it('주입 patterns에 system_performance가 있으면 generatePredictiveInsights 후 saveData의 predictiveInsights JSON에 resource_usage 인사이트의 id가 resource- 접두 문자열이다', () => {
    const store = new Map<string, string>();
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const row = {
      id: 'sys-perf-id',
      pattern: '리소스',
      frequency: 0.5,
      impact: 0.75,
      confidence: 0.6,
      lastObserved: new Date().toISOString(),
      category: 'system_performance' as const,
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify([row]) : null),
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const raw = store.get(K.predictiveInsights);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as Array<{ category?: string; id?: string }>;
    const ru = parsed.find((i) => i.category === 'resource_usage');
    expect(typeof ru?.id).toBe('string');
    expect(ru!.id!.startsWith('resource-')).toBe(true);
  });

  it('주입 patterns에 system_performance 2건이 있으면 generatePredictiveInsights 후 saveData의 predictiveInsights JSON에 resource_usage 인사이트의 dataPoints가 2이다', () => {
    const store = new Map<string, string>();
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const mk = (id: string) => ({
      id,
      pattern: '리소스',
      frequency: 0.5,
      impact: 0.75,
      confidence: 0.6,
      lastObserved: new Date().toISOString(),
      category: 'system_performance' as const,
    });
    const rows = [mk('sys-dp-a'), mk('sys-dp-b')];
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify(rows) : null),
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const raw = store.get(K.predictiveInsights);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as Array<{ category?: string; dataPoints?: number }>;
    const ru = parsed.find((i) => i.category === 'resource_usage');
    expect(ru?.dataPoints).toBe(2);
  });

  it('learnFromOptimizationResult 후 saveData가 두 번 호출되어 setItem은 총 6회·세 키 각 2회다', () => {
    const setItem = jest.fn();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem,
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.learnFromOptimizationResult({
      id: 'o-save',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });

    expect(setItem).toHaveBeenCalledTimes(6);
    const keys = setItem.mock.calls.map((c) => c[0]);
    expect(keys.filter((k) => k === K.patterns).length).toBe(2);
    expect(keys.filter((k) => k === K.optimizationResults).length).toBe(2);
    expect(keys.filter((k) => k === K.predictiveInsights).length).toBe(2);
  });

  it('learnFromOptimizationResult 후 두 번의 saveData가 각각 patterns → optimizationResults → predictiveInsights 순으로 setItem한다', () => {
    const setItem = jest.fn();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem,
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.learnFromOptimizationResult({
      id: 'o-order',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });

    expect(setItem.mock.calls.map((c) => c[0])).toEqual([
      K.patterns,
      K.optimizationResults,
      K.predictiveInsights,
      K.patterns,
      K.optimizationResults,
      K.predictiveInsights,
    ]);
  });

  it('주입 storage에서 patterns JSON이 깨져 있으면 로드 오류를 기록하고 빈 패턴·기본 모델을 유지한다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === ADAPTIVE_LEARNING_STORAGE_KEYS.patterns ? '{' : null),
      setItem: jest.fn(),
    };
    const errSpy = jest.spyOn(errorLogger, 'error').mockImplementation(() => {});
    const engine = new AdaptiveLearningEngine({ storage });

    expect(engine.getLearningPatterns()).toEqual([]);
    expect(engine.getAdaptiveModels().length).toBeGreaterThanOrEqual(3);
    expect(errSpy.mock.calls.some((c) => String(c[0]).includes('adaptiveLearningPatterns'))).toBe(true);

    errSpy.mockRestore();
  });

  it('주입 storage에서 optimizationResults JSON이 깨져 있으면 로드 오류를 기록하고 빈 결과를 유지한다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.optimizationResults ? '{' : null),
      setItem: jest.fn(),
    };
    const errSpy = jest.spyOn(errorLogger, 'error').mockImplementation(() => {});
    const engine = new AdaptiveLearningEngine({ storage });

    expect(engine.getOptimizationResults()).toEqual([]);
    expect(engine.getPredictiveInsights()).toEqual([]);
    expect(errSpy.mock.calls.some((c) => String(c[0]).includes('optimizationResults'))).toBe(true);

    errSpy.mockRestore();
  });

  it('주입 storage에서 predictiveInsights JSON이 깨져 있으면 로드 오류를 기록하고 빈 인사이트를 유지한다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.predictiveInsights ? '{' : null),
      setItem: jest.fn(),
    };
    const errSpy = jest.spyOn(errorLogger, 'error').mockImplementation(() => {});
    const engine = new AdaptiveLearningEngine({ storage });

    expect(engine.getPredictiveInsights()).toEqual([]);
    expect(errSpy.mock.calls.some((c) => String(c[0]).includes('predictiveInsights'))).toBe(true);

    errSpy.mockRestore();
  });

  it('주입 storage에서 patterns가 유효 JSON이지만 배열이 아니면 조용히 무시하고 errorLogger를 호출하지 않는다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? '{}' : null),
      setItem: jest.fn(),
    };
    const errSpy = jest.spyOn(errorLogger, 'error').mockImplementation(() => {});
    const engine = new AdaptiveLearningEngine({ storage });

    expect(engine.getLearningPatterns()).toEqual([]);
    expect(errSpy).not.toHaveBeenCalled();

    errSpy.mockRestore();
  });

  it('주입 storage에서 patterns·optimizationResults·predictiveInsights가 빈 배열 JSON이면 해당 내부 배열은 모두 비어 있다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => {
        if (key === K.patterns || key === K.optimizationResults || key === K.predictiveInsights) return '[]';
        return null;
      },
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    expect(engine.getLearningPatterns()).toEqual([]);
    expect(engine.getOptimizationResults()).toEqual([]);
    expect(engine.getPredictiveInsights()).toEqual([]);
  });

  it('retrainModels 후 주입 storage에 세 persistence 키가 기록되고 modelVersion이 증가한다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const v0 = engine.getModelVersion();

    engine.retrainModels();

    expect(engine.getModelVersion()).toBeCloseTo(v0 + 0.1, 5);
    expect(store.has(K.patterns)).toBe(true);
    expect(store.has(K.optimizationResults)).toBe(true);
    expect(store.has(K.predictiveInsights)).toBe(true);
  });

  it('retrainModels 후 saveData는 세 persistence 키에 setItem을 각각 한 번씩 호출한다', () => {
    const setItem = jest.fn();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem,
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.retrainModels();

    expect(setItem).toHaveBeenCalledTimes(3);
    const keys = setItem.mock.calls.map((c) => c[0]);
    expect(keys.filter((k) => k === K.patterns).length).toBe(1);
    expect(keys.filter((k) => k === K.optimizationResults).length).toBe(1);
    expect(keys.filter((k) => k === K.predictiveInsights).length).toBe(1);
  });

  it('retrainModels 후 saveData의 setItem 호출 순서는 patterns → optimizationResults → predictiveInsights이다', () => {
    const setItem = jest.fn();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem,
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.02);
    engine.retrainModels();

    expect(setItem.mock.calls.map((c) => c[0])).toEqual([
      K.patterns,
      K.optimizationResults,
      K.predictiveInsights,
    ]);

    randomSpy.mockRestore();
  });

  it('retrainModels를 두 번 호출하면 setItem이 총 6회·세 키 각 2회다', () => {
    const setItem = jest.fn();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem,
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.retrainModels();
    engine.retrainModels();

    expect(setItem).toHaveBeenCalledTimes(6);
    const keys = setItem.mock.calls.map((c) => c[0]);
    expect(keys.filter((k) => k === K.patterns).length).toBe(2);
    expect(keys.filter((k) => k === K.optimizationResults).length).toBe(2);
    expect(keys.filter((k) => k === K.predictiveInsights).length).toBe(2);
  });

  it('retrainModels를 두 번 호출하면 각 saveData가 patterns → optimizationResults → predictiveInsights 순으로 setItem한다', () => {
    const setItem = jest.fn();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem,
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.02);
    engine.retrainModels();
    engine.retrainModels();

    expect(setItem.mock.calls.map((c) => c[0])).toEqual([
      K.patterns,
      K.optimizationResults,
      K.predictiveInsights,
      K.patterns,
      K.optimizationResults,
      K.predictiveInsights,
    ]);

    randomSpy.mockRestore();
  });

  it('주입 storage에서 optimizationResults가 유효 JSON이지만 배열이 아니면 조용히 무시한다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.optimizationResults ? '{}' : null),
      setItem: jest.fn(),
    };
    const errSpy = jest.spyOn(errorLogger, 'error').mockImplementation(() => {});
    const engine = new AdaptiveLearningEngine({ storage });

    expect(engine.getOptimizationResults()).toEqual([]);
    expect(errSpy).not.toHaveBeenCalled();

    errSpy.mockRestore();
  });

  it('주입 storage에서 predictiveInsights가 유효 JSON이지만 배열이 아니면 조용히 무시한다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.predictiveInsights ? '{}' : null),
      setItem: jest.fn(),
    };
    const errSpy = jest.spyOn(errorLogger, 'error').mockImplementation(() => {});
    const engine = new AdaptiveLearningEngine({ storage });

    expect(engine.getPredictiveInsights()).toEqual([]);
    expect(errSpy).not.toHaveBeenCalled();

    errSpy.mockRestore();
  });

  it('learnUserBehavior(빈 입력) 후 주입 storage에 세 키가 빈 배열 JSON으로 저장된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;

    engine.learnUserBehavior([], [], []);

    expect(JSON.parse(store.get(K.patterns) ?? 'null')).toEqual([]);
    expect(JSON.parse(store.get(K.optimizationResults) ?? 'null')).toEqual([]);
    expect(JSON.parse(store.get(K.predictiveInsights) ?? 'null')).toEqual([]);
  });

  it('learnUserBehavior(빈 입력) 후 saveData는 세 persistence 키에 setItem을 각각 한 번씩 호출한다', () => {
    const setItem = jest.fn();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem,
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.learnUserBehavior([], [], []);

    expect(setItem).toHaveBeenCalledTimes(3);
    const keys = setItem.mock.calls.map((c) => c[0]);
    expect(keys.filter((k) => k === K.patterns).length).toBe(1);
    expect(keys.filter((k) => k === K.optimizationResults).length).toBe(1);
    expect(keys.filter((k) => k === K.predictiveInsights).length).toBe(1);
  });

  it('learnUserBehavior(빈 입력) 후 saveData의 setItem 호출 순서는 patterns → optimizationResults → predictiveInsights이다', () => {
    const setItem = jest.fn();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem,
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.learnUserBehavior([], [], []);

    expect(setItem.mock.calls.map((c) => c[0])).toEqual([
      K.patterns,
      K.optimizationResults,
      K.predictiveInsights,
    ]);
  });

  it('learnUserBehavior(빈 입력)를 두 번 호출하면 setItem이 총 6회·세 키 각 2회다', () => {
    const setItem = jest.fn();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem,
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.learnUserBehavior([], [], []);
    engine.learnUserBehavior([], [], []);

    expect(setItem).toHaveBeenCalledTimes(6);
    const keys = setItem.mock.calls.map((c) => c[0]);
    expect(keys.filter((k) => k === K.patterns).length).toBe(2);
    expect(keys.filter((k) => k === K.optimizationResults).length).toBe(2);
    expect(keys.filter((k) => k === K.predictiveInsights).length).toBe(2);
  });

  it('learnUserBehavior(최근 프로젝트 3건) 후 saveData에 기록된 patterns JSON에 project-creation-pattern id가 포함된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = [
      {
        id: 'pa',
        name: 'a',
        description: '',
        createdAt: daysAgo(5),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
      {
        id: 'pb',
        name: 'b',
        description: '',
        createdAt: daysAgo(4),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
      {
        id: 'pc',
        name: 'c',
        description: '',
        createdAt: daysAgo(3),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
    ];
    engine.learnUserBehavior(projects, [], []);
    const raw = store.get(K.patterns);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as { id?: string }[];
    expect(parsed.some((p) => p.id === 'project-creation-pattern')).toBe(true);
  });

  it('learnUserBehavior(최근 프로젝트 3건) 후 saveData에 기록된 patterns JSON의 project-creation-pattern에 lastObserved ISO 문자열이 있다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = [
      {
        id: 'pla',
        name: 'a',
        description: '',
        createdAt: daysAgo(5),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
      {
        id: 'plb',
        name: 'b',
        description: '',
        createdAt: daysAgo(4),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
      {
        id: 'plc',
        name: 'c',
        description: '',
        createdAt: daysAgo(3),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
    ];
    engine.learnUserBehavior(projects, [], []);
    const raw = store.get(K.patterns);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as { id?: string; lastObserved?: string }[];
    const row = parsed.find((p) => p.id === 'project-creation-pattern');
    expect(row).toBeDefined();
    expect(typeof row?.lastObserved).toBe('string');
    expect(Number.isNaN(Date.parse(row!.lastObserved!))).toBe(false);
  });

  it('learnUserBehavior(최근 프로젝트 3건) 후 saveData에 기록된 patterns JSON의 project-creation-pattern에 pattern·impact가 기록된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = [
      {
        id: 'pca',
        name: 'a',
        description: '',
        createdAt: daysAgo(5),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
      {
        id: 'pcb',
        name: 'b',
        description: '',
        createdAt: daysAgo(4),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
      {
        id: 'pcc',
        name: 'c',
        description: '',
        createdAt: daysAgo(3),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
    ];
    engine.learnUserBehavior(projects, [], []);
    const raw = store.get(K.patterns);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as { id?: string; pattern?: string; impact?: number }[];
    const row = parsed.find((p) => p.id === 'project-creation-pattern');
    expect(row?.impact).toBe(PCP.impact);
    expect(typeof row?.pattern).toBe('string');
    expect(row!.pattern!.includes('프로젝트 생성')).toBe(true);
  });

  it(`learnUserBehavior(프로젝트 3건·7일 대화·24시간 메시지 ${MP.minMessages}건) 후 saveData의 patterns JSON에 세 패턴 id가 모두 기록된다`, () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = ['tri-pa', 'tri-pb', 'tri-pc'].map((id, i) => ({
      id,
      name: id,
      description: '',
      createdAt: daysAgo(6 - i),
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation' as const,
      status: 'active' as const,
      chats: [],
    }));
    const recentChatAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const msgInChat: Message = {
      id: 'tri-inchat',
      chatId: 'tri-c1',
      role: 'user',
      content: 'hi',
      timestamp: new Date(),
    };
    const chat: Chat = {
      id: 'tri-c1',
      projectId: 'tri-pa',
      name: 'c',
      createdAt: recentChatAt,
      updatedAt: new Date(),
      messages: [msgInChat],
    };
    const base = Date.now();
    const globalMessages: Message[] = Array.from({ length: MP.minMessages }, (_, i) => ({
      id: `tri-g${i}`,
      chatId: 'tri-c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'z'.repeat(15),
      timestamp: new Date(base - (MP.minMessages - i) * 60 * 1000),
    }));
    engine.learnUserBehavior(projects, [chat], globalMessages);
    const raw = store.get(K.patterns);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as { id?: string }[];
    expect(parsed).toHaveLength(3);
    expect(parsed.map((p) => p.id).sort()).toEqual(
      ['chat-activity-pattern', 'message-pattern', 'project-creation-pattern'].sort(),
    );
  });

  it(`learnUserBehavior(메시지 timestamp가 ISO 문자열) 24시간 이내 ${MP.minMessages}건이면 patterns JSON에 message-pattern이 기록된다`, () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const base = Date.now();
    const messages: Message[] = Array.from({ length: MP.minMessages }, (_, i) => ({
      id: `jmsg-iso-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(24),
      timestamp: new Date(base - (MP.minMessages - i) * 60 * 1000).toISOString() as unknown as Date,
    }));
    engine.learnUserBehavior([], [], messages);
    const raw = store.get(K.patterns);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as { id?: string }[];
    expect(parsed.some((p) => p.id === 'message-pattern')).toBe(true);
  });

  it(`learnUserBehavior(메시지 timestamp가 epoch ms 숫자) 24시간 이내 ${MP.minMessages}건이면 patterns JSON에 message-pattern이 기록된다`, () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const base = Date.now();
    const messages: Message[] = Array.from({ length: MP.minMessages }, (_, i) => ({
      id: `jmsg-ep-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(24),
      timestamp: (base - (MP.minMessages - i) * 60 * 1000) as unknown as Date,
    }));
    engine.learnUserBehavior([], [], messages);
    const raw = store.get(K.patterns);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as { id?: string }[];
    expect(parsed.some((p) => p.id === 'message-pattern')).toBe(true);
  });

  it('메시지 timestamp가 new Date으로 변환할 수 없으면 Invalid timestamp in message로 warn한다', () => {
    const warnSpy = jest.spyOn(errorLogger, 'warn').mockImplementation(() => {});
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = Date.now();
    const messages: Message[] = [
      {
        id: 'm-sym',
        chatId: 'c1',
        role: 'user',
        content: 'x',
        timestamp: Symbol('t') as unknown as Date,
      },
      ...Array.from({ length: MP.minMessages }, (_, i) => ({
        id: `m-sym-${i}`,
        chatId: 'c1',
        role: (i % 2 === 0 ? 'assistant' : 'user') as 'assistant' | 'user',
        content: 'y'.repeat(20),
        timestamp: new Date(base - (MP.minMessages - i) * 60 * 1000),
      })),
    ];

    engine.learnUserBehavior([], [], messages);

    expect(
      warnSpy.mock.calls.some(
        (c) =>
          c[0] === 'Invalid timestamp in message' &&
          typeof c[1] === 'object' &&
          c[1] !== null &&
          (c[1] as { action?: string }).action === 'analyzeMessagePattern',
      ),
    ).toBe(true);
    warnSpy.mockRestore();
  });

  it('calculateAverageResponseTime: user→assistant 쌍에서 timestamp가 Invalid Date면 warn하고 평균 0으로 처리한다', () => {
    const warnSpy = jest.spyOn(errorLogger, 'warn').mockImplementation(() => {});
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const messages: Message[] = [
      {
        id: 'u-na',
        chatId: 'c1',
        role: 'user',
        content: 'q',
        timestamp: new Date(NaN),
      },
      {
        id: 'a-ok',
        chatId: 'c1',
        role: 'assistant',
        content: 'a',
        timestamp: new Date(),
      },
    ];
    const calc = (
      engine as unknown as { calculateAverageResponseTime(m: Message[]): number }
    ).calculateAverageResponseTime.bind(engine);

    expect(calc(messages)).toBe(0);
    expect(
      warnSpy.mock.calls.some(
        (c) =>
          c[0] === 'Invalid timestamp in responseTime pair' &&
          typeof c[1] === 'object' &&
          c[1] !== null &&
          (c[1] as { action?: string }).action === 'calculateAverageResponseTime',
      ),
    ).toBe(true);
    warnSpy.mockRestore();
  });

  it('calculateAverageResponseTime: user timestamp의 getTime이 throw하면 warn하고 평균 0으로 처리한다', () => {
    const warnSpy = jest.spyOn(errorLogger, 'warn').mockImplementation(() => {});
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const UserTsThrows = class extends Date {
      constructor() {
        super(Date.now());
      }
      override getTime(): number {
        throw new Error('user-getTime-boom');
      }
    };
    const messages: Message[] = [
      {
        id: 'u-throw',
        chatId: 'c1',
        role: 'user',
        content: 'q',
        timestamp: new UserTsThrows() as Date,
      },
      {
        id: 'a-ok',
        chatId: 'c1',
        role: 'assistant',
        content: 'a',
        timestamp: new Date(),
      },
    ];
    const calc = (
      engine as unknown as { calculateAverageResponseTime(m: Message[]): number }
    ).calculateAverageResponseTime.bind(engine);

    expect(calc(messages)).toBe(0);
    expect(
      warnSpy.mock.calls.some(
        (c) =>
          c[0] === 'Invalid timestamp in responseTime pair' &&
          typeof c[1] === 'object' &&
          c[1] !== null &&
          (c[1] as { action?: string }).action === 'calculateAverageResponseTime',
      ),
    ).toBe(true);
    warnSpy.mockRestore();
  });

  it('calculateAverageResponseTime: assistant timestamp의 getTime이 throw하면 warn하고 평균 0으로 처리한다', () => {
    const warnSpy = jest.spyOn(errorLogger, 'warn').mockImplementation(() => {});
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const AsstTsThrows = class extends Date {
      constructor() {
        super(Date.now());
      }
      override getTime(): number {
        throw new Error('asst-getTime-boom');
      }
    };
    const messages: Message[] = [
      {
        id: 'u-ok',
        chatId: 'c1',
        role: 'user',
        content: 'q',
        timestamp: new Date(),
      },
      {
        id: 'a-throw',
        chatId: 'c1',
        role: 'assistant',
        content: 'a',
        timestamp: new AsstTsThrows() as Date,
      },
    ];
    const calc = (
      engine as unknown as { calculateAverageResponseTime(m: Message[]): number }
    ).calculateAverageResponseTime.bind(engine);

    expect(calc(messages)).toBe(0);
    expect(
      warnSpy.mock.calls.some(
        (c) =>
          c[0] === 'Invalid timestamp in responseTime pair' &&
          typeof c[1] === 'object' &&
          c[1] !== null &&
          (c[1] as { action?: string }).action === 'calculateAverageResponseTime',
      ),
    ).toBe(true);
    warnSpy.mockRestore();
  });

  it('calculateAverageResponseTime: timestamp가 Date가 아닌 ISO 문자열이면 new Date로 파싱해 분 단위 평균을 반환한다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const userIso = '2024-06-01T12:00:00.000Z';
    const asstIso = '2024-06-01T12:03:00.000Z';
    const messages: Message[] = [
      {
        id: 'u-iso',
        chatId: 'c1',
        role: 'user',
        content: 'q',
        timestamp: userIso as unknown as Date,
      },
      {
        id: 'a-iso',
        chatId: 'c1',
        role: 'assistant',
        content: 'a',
        timestamp: asstIso as unknown as Date,
      },
    ];
    const calc = (
      engine as unknown as { calculateAverageResponseTime(m: Message[]): number }
    ).calculateAverageResponseTime.bind(engine);

    expect(calc(messages)).toBeCloseTo(3, 5);
  });

  it('calculateAverageResponseTime: 연속하지 않은 user→assistant 쌍만 반영해 평균을 낸다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const t0 = new Date('2024-01-01T12:00:00.000Z');
    const t1 = new Date('2024-01-01T12:02:00.000Z');
    const t2 = new Date('2024-01-01T12:03:00.000Z');
    const t3 = new Date('2024-01-01T12:04:00.000Z');
    const t4 = new Date('2024-01-01T12:09:00.000Z');
    const messages: Message[] = [
      { id: 'm0', chatId: 'c1', role: 'user', content: 'a', timestamp: t0 },
      { id: 'm1', chatId: 'c1', role: 'assistant', content: 'b', timestamp: t1 },
      { id: 'm2', chatId: 'c1', role: 'assistant', content: 'c', timestamp: t2 },
      { id: 'm3', chatId: 'c1', role: 'user', content: 'd', timestamp: t3 },
      { id: 'm4', chatId: 'c1', role: 'assistant', content: 'e', timestamp: t4 },
    ];
    const calc = (
      engine as unknown as { calculateAverageResponseTime(m: Message[]): number }
    ).calculateAverageResponseTime.bind(engine);

    expect(calc(messages)).toBeCloseTo((2 + 5) / 2, 5);
  });

  it('calculateAverageResponseTime: 빈 배열이면 0', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const calc = (
      engine as unknown as { calculateAverageResponseTime(m: Message[]): number }
    ).calculateAverageResponseTime.bind(engine);
    expect(calc([])).toBe(0);
  });

  it('calculateAverageResponseTime: user→assistant 쌍이 없으면 0', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const t = new Date();
    const messages: Message[] = [
      { id: 'u1', chatId: 'c1', role: 'user', content: 'a', timestamp: t },
      { id: 'u2', chatId: 'c1', role: 'user', content: 'b', timestamp: t },
    ];
    const calc = (
      engine as unknown as { calculateAverageResponseTime(m: Message[]): number }
    ).calculateAverageResponseTime.bind(engine);
    expect(calc(messages)).toBe(0);
  });

  it('calculateAverageResponseTime: assistant만 연속이면 0', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const t = new Date();
    const messages: Message[] = [
      { id: 'a1', chatId: 'c1', role: 'assistant', content: 'a', timestamp: t },
      { id: 'a2', chatId: 'c1', role: 'assistant', content: 'b', timestamp: t },
    ];
    const calc = (
      engine as unknown as { calculateAverageResponseTime(m: Message[]): number }
    ).calculateAverageResponseTime.bind(engine);
    expect(calc(messages)).toBe(0);
  });

  it('calculateAverageResponseTime: 선행 assistant는 무시하고 이후 user→assistant만 반영한다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const t0 = new Date('2024-01-01T12:00:00.000Z');
    const t1 = new Date('2024-01-01T12:01:00.000Z');
    const t2 = new Date('2024-01-01T12:04:00.000Z');
    const messages: Message[] = [
      { id: 'lead', chatId: 'c1', role: 'assistant', content: 'sys', timestamp: t0 },
      { id: 'u1', chatId: 'c1', role: 'user', content: 'q', timestamp: t1 },
      { id: 'a1', chatId: 'c1', role: 'assistant', content: 'a', timestamp: t2 },
    ];
    const calc = (
      engine as unknown as { calculateAverageResponseTime(m: Message[]): number }
    ).calculateAverageResponseTime.bind(engine);
    expect(calc(messages)).toBeCloseTo(3, 5);
  });

  it('calculateAverageResponseTime: user 메시지 한 건뿐이면 0', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const calc = (
      engine as unknown as { calculateAverageResponseTime(m: Message[]): number }
    ).calculateAverageResponseTime.bind(engine);
    expect(
      calc([
        { id: 'u0', chatId: 'c1', role: 'user', content: 'a', timestamp: new Date() },
      ]),
    ).toBe(0);
  });

  it('calculateAverageResponseTime: user→assistant 한 쌍만 있으면 그 간격(분)을 반환한다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const tu = new Date('2024-03-10T08:00:00.000Z');
    const ta = new Date('2024-03-10T08:06:30.000Z');
    const messages: Message[] = [
      { id: 'u', chatId: 'c1', role: 'user', content: 'q', timestamp: tu },
      { id: 'a', chatId: 'c1', role: 'assistant', content: 'r', timestamp: ta },
    ];
    const calc = (
      engine as unknown as { calculateAverageResponseTime(m: Message[]): number }
    ).calculateAverageResponseTime.bind(engine);
    expect(calc(messages)).toBeCloseTo(6.5, 5);
  });

  it('calculateAverageResponseTime: user·assistant 시각이 같으면 0분으로 계산한다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const t = new Date('2024-04-20T09:00:00.000Z');
    const messages: Message[] = [
      { id: 'u', chatId: 'c1', role: 'user', content: 'q', timestamp: t },
      { id: 'a', chatId: 'c1', role: 'assistant', content: 'r', timestamp: t },
    ];
    const calc = (
      engine as unknown as { calculateAverageResponseTime(m: Message[]): number }
    ).calculateAverageResponseTime.bind(engine);
    expect(calc(messages)).toBe(0);
  });

  it('calculateAverageResponseTime: 0분 쌍과 양수 분 쌍이 섞이면 산술 평균이다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const tSame = new Date('2024-01-01T12:00:00.000Z');
    const tU1 = new Date('2024-01-01T13:00:00.000Z');
    const tA1 = new Date('2024-01-01T13:10:00.000Z');
    const messages: Message[] = [
      { id: 'mix-u0', chatId: 'c1', role: 'user', content: 'a', timestamp: tSame },
      { id: 'mix-a0', chatId: 'c1', role: 'assistant', content: 'b', timestamp: tSame },
      { id: 'mix-u1', chatId: 'c1', role: 'user', content: 'c', timestamp: tU1 },
      { id: 'mix-a1', chatId: 'c1', role: 'assistant', content: 'd', timestamp: tA1 },
    ];
    const calc = (
      engine as unknown as { calculateAverageResponseTime(m: Message[]): number }
    ).calculateAverageResponseTime.bind(engine);
    expect(calc(messages)).toBeCloseTo(5, 5);
  });

  it('calculateAverageResponseTime: 세 쌍의 간격이 2·4·6분이면 평균 4분이다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = new Date('2024-06-15T10:00:00.000Z').getTime();
    const gapMinBetweenPairs = 20;
    const deltasMin = [2, 4, 6];
    const messages: Message[] = [];
    for (let i = 0; i < 3; i += 1) {
      const uMs = base + i * gapMinBetweenPairs * 60 * 1000;
      const userT = new Date(uMs);
      const asstT = new Date(uMs + deltasMin[i] * 60 * 1000);
      messages.push(
        { id: `tri-u${i}`, chatId: 'c1', role: 'user', content: 'q', timestamp: userT },
        { id: `tri-a${i}`, chatId: 'c1', role: 'assistant', content: 'a', timestamp: asstT },
      );
    }
    const calc = (
      engine as unknown as { calculateAverageResponseTime(m: Message[]): number }
    ).calculateAverageResponseTime.bind(engine);
    expect(calc(messages)).toBeCloseTo(4, 5);
  });

  it('calculateAverageResponseTime: 마지막이 user면 직전 user→assistant 쌍만 반영한다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const t0 = new Date('2024-02-01T10:00:00.000Z');
    const t1 = new Date('2024-02-01T10:10:00.000Z');
    const t2 = new Date('2024-02-01T10:11:00.000Z');
    const messages: Message[] = [
      { id: 'u0', chatId: 'c1', role: 'user', content: 'a', timestamp: t0 },
      { id: 'a0', chatId: 'c1', role: 'assistant', content: 'b', timestamp: t1 },
      { id: 'u1', chatId: 'c1', role: 'user', content: 'c', timestamp: t2 },
    ];
    const calc = (
      engine as unknown as { calculateAverageResponseTime(m: Message[]): number }
    ).calculateAverageResponseTime.bind(engine);
    expect(calc(messages)).toBeCloseTo(10, 5);
  });

  it('calculateAverageResponseTime: assistant 메시지 한 건뿐이면 0', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const calc = (
      engine as unknown as { calculateAverageResponseTime(m: Message[]): number }
    ).calculateAverageResponseTime.bind(engine);
    expect(
      calc([
        { id: 'a0', chatId: 'c1', role: 'assistant', content: 'a', timestamp: new Date() },
      ]),
    ).toBe(0);
  });

  it('calculateAverageResponseTime: assistant 시각이 user보다 이르면 warn하고 해당 쌍은 건너뛰어 평균 0이다', () => {
    const warnSpy = jest.spyOn(errorLogger, 'warn').mockImplementation(() => {});
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const tu = new Date('2024-05-01T14:10:00.000Z');
    const ta = new Date('2024-05-01T14:00:00.000Z');
    const messages: Message[] = [
      { id: 'u', chatId: 'c1', role: 'user', content: 'q', timestamp: tu },
      { id: 'a', chatId: 'c1', role: 'assistant', content: 'r', timestamp: ta },
    ];
    const calc = (
      engine as unknown as { calculateAverageResponseTime(m: Message[]): number }
    ).calculateAverageResponseTime.bind(engine);
    expect(calc(messages)).toBe(0);
    expect(
      warnSpy.mock.calls.some(
        (c) =>
          c[0] === 'Invalid timestamp in responseTime pair' &&
          typeof c[1] === 'object' &&
          c[1] !== null &&
          (c[1] as { action?: string; reason?: string }).action === 'calculateAverageResponseTime' &&
          (c[1] as { reason?: string }).reason === 'assistantTimestampBeforeUser',
      ),
    ).toBe(true);
    warnSpy.mockRestore();
  });

  it('calculateAverageResponseTime: 역전 쌍은 제외하고 유효 user→assistant 쌍만 평균낸다', () => {
    const warnSpy = jest.spyOn(errorLogger, 'warn').mockImplementation(() => {});
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const tU0 = new Date('2024-01-01T12:00:00.000Z');
    const tA0 = new Date('2024-01-01T12:05:00.000Z');
    const tU1 = new Date('2024-01-01T12:20:00.000Z');
    const tA1 = new Date('2024-01-01T12:15:00.000Z');
    const messages: Message[] = [
      { id: 'u0', chatId: 'c1', role: 'user', content: 'a', timestamp: tU0 },
      { id: 'a0', chatId: 'c1', role: 'assistant', content: 'b', timestamp: tA0 },
      { id: 'u1', chatId: 'c1', role: 'user', content: 'c', timestamp: tU1 },
      { id: 'a1', chatId: 'c1', role: 'assistant', content: 'd', timestamp: tA1 },
    ];
    const calc = (
      engine as unknown as { calculateAverageResponseTime(m: Message[]): number }
    ).calculateAverageResponseTime.bind(engine);
    expect(calc(messages)).toBeCloseTo(5, 5);
    expect(
      warnSpy.mock.calls.filter(
        (c) =>
          (c[1] as { reason?: string } | undefined)?.reason === 'assistantTimestampBeforeUser',
      ).length,
    ).toBe(1);
    warnSpy.mockRestore();
  });

  it(`learnUserBehavior(24시간 이내 메시지 ${MP.minMessages}건) 후 saveData에 기록된 patterns JSON에 message-pattern id가 포함된다`, () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const base = Date.now();
    const messages: Message[] = Array.from({ length: MP.minMessages }, (_, i) => ({
      id: `jmsg-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(24),
      timestamp: new Date(base - (MP.minMessages - i) * 60 * 1000),
    }));
    engine.learnUserBehavior([], [], messages);
    const raw = store.get(K.patterns);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as { id?: string }[];
    expect(parsed.some((p) => p.id === 'message-pattern')).toBe(true);
  });

  it(`learnUserBehavior(24시간 이내 메시지 ${MP.minMessages}건) 후 saveData에 기록된 patterns JSON의 message-pattern에 lastObserved ISO 문자열이 있다`, () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const base = Date.now();
    const messages: Message[] = Array.from({ length: MP.minMessages }, (_, i) => ({
      id: `lo-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(24),
      timestamp: new Date(base - (MP.minMessages - i) * 60 * 1000),
    }));
    engine.learnUserBehavior([], [], messages);
    const raw = store.get(K.patterns);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as { id?: string; lastObserved?: string }[];
    const row = parsed.find((p) => p.id === 'message-pattern');
    expect(row).toBeDefined();
    expect(typeof row?.lastObserved).toBe('string');
    expect(Number.isNaN(Date.parse(row!.lastObserved!))).toBe(false);
  });

  it(`learnUserBehavior(24시간 이내 메시지 ${MP.minMessages}건) 후 saveData에 기록된 patterns JSON의 message-pattern에 pattern·impact가 기록된다`, () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const base = Date.now();
    const messages: Message[] = Array.from({ length: MP.minMessages }, (_, i) => ({
      id: `mp-meta-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(24),
      timestamp: new Date(base - (MP.minMessages - i) * 60 * 1000),
    }));
    engine.learnUserBehavior([], [], messages);
    const raw = store.get(K.patterns);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as { id?: string; pattern?: string; impact?: number }[];
    const row = parsed.find((p) => p.id === 'message-pattern');
    expect(row?.impact).toBe(MP.impact);
    expect(typeof row?.pattern).toBe('string');
    expect(row!.pattern!.length).toBeGreaterThan(0);
    expect(row!.pattern!.includes('메시지 패턴')).toBe(true);
  });

  it('learnUserBehavior로 user_behavior 패턴이 생긴 뒤 generatePredictiveInsights 하면 saveData의 predictiveInsights JSON에 user_behavior와 recommendations가 기록된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const base = Date.now();
    const messages: Message[] = Array.from({ length: MP.minMessages }, (_, i) => ({
      id: `ub-json-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(24),
      timestamp: new Date(base - (MP.minMessages - i) * 60 * 1000),
    }));
    engine.learnUserBehavior([], [], messages);
    engine.generatePredictiveInsights();
    const raw = store.get(K.predictiveInsights);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as Array<{
      category?: string;
      recommendations?: string[];
    }>;
    const ub = parsed.find((i) => i.category === 'user_behavior');
    expect(ub).toBeDefined();
    expect(Array.isArray(ub?.recommendations)).toBe(true);
    expect(ub!.recommendations!.length).toBeGreaterThan(0);
    expect(ub!.recommendations!.every((r) => typeof r === 'string')).toBe(true);
  });

  it('learnUserBehavior로 user_behavior 패턴이 생긴 뒤 generatePredictiveInsights 하면 saveData의 predictiveInsights JSON에 user_behavior의 timeframe·lastUpdated ISO가 기록된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const base = Date.now();
    const messages: Message[] = Array.from({ length: MP.minMessages }, (_, i) => ({
      id: `ub-tf-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(24),
      timestamp: new Date(base - (MP.minMessages - i) * 60 * 1000),
    }));
    engine.learnUserBehavior([], [], messages);
    engine.generatePredictiveInsights();
    const raw = store.get(K.predictiveInsights);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as Array<{
      category?: string;
      timeframe?: string;
      lastUpdated?: string;
    }>;
    const ub = parsed.find((i) => i.category === 'user_behavior');
    expect(ub?.timeframe).toBe('short_term');
    expect(typeof ub?.lastUpdated).toBe('string');
    expect(Number.isNaN(Date.parse(ub!.lastUpdated!))).toBe(false);
  });

  it('learnUserBehavior로 user_behavior 패턴이 생긴 뒤 generatePredictiveInsights 하면 saveData의 predictiveInsights JSON에 user_behavior 인사이트의 id가 user-behavior- 접두 문자열이다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const base = Date.now();
    const messages: Message[] = Array.from({ length: MP.minMessages }, (_, i) => ({
      id: `ub-id-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(24),
      timestamp: new Date(base - (MP.minMessages - i) * 60 * 1000),
    }));
    engine.learnUserBehavior([], [], messages);
    engine.generatePredictiveInsights();
    const raw = store.get(K.predictiveInsights);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as Array<{ category?: string; id?: string }>;
    const ub = parsed.find((i) => i.category === 'user_behavior');
    expect(typeof ub?.id).toBe('string');
    expect(ub!.id!.startsWith('user-behavior-')).toBe(true);
  });

  it('learnUserBehavior로 user_behavior 패턴이 생긴 뒤 generatePredictiveInsights 하면 saveData의 predictiveInsights JSON에 user_behavior 인사이트의 dataPoints가 1이다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const base = Date.now();
    const messages: Message[] = Array.from({ length: MP.minMessages }, (_, i) => ({
      id: `ub-dp-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(24),
      timestamp: new Date(base - (MP.minMessages - i) * 60 * 1000),
    }));
    engine.learnUserBehavior([], [], messages);
    engine.generatePredictiveInsights();
    const raw = store.get(K.predictiveInsights);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as Array<{ category?: string; dataPoints?: number }>;
    const ub = parsed.find((i) => i.category === 'user_behavior');
    expect(ub?.dataPoints).toBe(1);
  });

  it('learnUserBehavior(7일 이내 대화·메시지 있음) 후 saveData에 기록된 patterns JSON에 chat-activity-pattern id가 포함된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const msg: Message = {
      id: 'm1',
      chatId: 'c1',
      role: 'user',
      content: 'hello',
      timestamp: new Date(),
    };
    const chat: Chat = {
      id: 'c1',
      projectId: 'p1',
      name: '대화',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      messages: [msg],
    };
    engine.learnUserBehavior([], [chat], []);
    const raw = store.get(K.patterns);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as { id?: string }[];
    expect(parsed.some((p) => p.id === 'chat-activity-pattern')).toBe(true);
  });

  it('learnUserBehavior(7일 이내 대화·메시지 있음) 후 saveData에 기록된 patterns JSON의 chat-activity-pattern에 lastObserved ISO·category·frequency·confidence가 기록된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const msg: Message = {
      id: 'm-cap-json',
      chatId: 'c-cap',
      role: 'user',
      content: 'hello',
      timestamp: new Date(),
    };
    const chat: Chat = {
      id: 'c-cap',
      projectId: 'p1',
      name: '대화',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      messages: [msg],
    };
    engine.learnUserBehavior([], [chat], []);
    const raw = store.get(K.patterns);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as {
      id?: string;
      lastObserved?: string;
      category?: string;
      frequency?: number;
      confidence?: number;
    }[];
    const row = parsed.find((p) => p.id === 'chat-activity-pattern');
    expect(row).toBeDefined();
    expect(typeof row?.lastObserved).toBe('string');
    expect(Number.isNaN(Date.parse(row!.lastObserved!))).toBe(false);
    expect(row?.category).toBe('user_behavior');
    expect(typeof row?.frequency).toBe('number');
    expect(typeof row?.confidence).toBe('number');
  });

  it('learnUserBehavior(7일 이내 대화·메시지 있음) 후 saveData에 기록된 patterns JSON의 chat-activity-pattern에 pattern·impact가 기록된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const msg: Message = {
      id: 'm-cap-pi',
      chatId: 'c-cap-pi',
      role: 'user',
      content: 'hello',
      timestamp: new Date(),
    };
    const chat: Chat = {
      id: 'c-cap-pi',
      projectId: 'p1',
      name: '대화',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      messages: [msg],
    };
    engine.learnUserBehavior([], [chat], []);
    const raw = store.get(K.patterns);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as { id?: string; pattern?: string; impact?: number }[];
    const row = parsed.find((p) => p.id === 'chat-activity-pattern');
    expect(row?.impact).toBe(CAP.impact);
    expect(typeof row?.pattern).toBe('string');
    expect(row!.pattern!.includes('대화 활동')).toBe(true);
  });

  it('learnFromOptimizationResult 후 saveData의 predictiveInsights JSON에 performance 인사이트의 id가 performance- 접두 문자열이다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.learnFromOptimizationResult({
      id: 'o-pi-id',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const raw = store.get(K.predictiveInsights);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as Array<{ category?: string; id?: string }>;
    const perf = parsed.find((i) => i.category === 'performance');
    expect(typeof perf?.id).toBe('string');
    expect(perf!.id!.startsWith('performance-')).toBe(true);
  });

  it('주입 storage의 유효 patterns 배열을 로드하고 lastObserved를 Date로 복원한다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const row = {
      id: 'loaded-p1',
      pattern: '테스트 패턴',
      frequency: 0.5,
      impact: 0.6,
      confidence: 0.7,
      lastObserved: '2020-06-15T12:00:00.000Z',
      category: 'user_behavior' as const,
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify([row]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const patterns = engine.getLearningPatterns();

    expect(patterns).toHaveLength(1);
    expect(patterns[0].id).toBe('loaded-p1');
    expect(patterns[0].pattern).toBe('테스트 패턴');
    expect(patterns[0].frequency).toBe(0.5);
    expect(patterns[0].impact).toBe(0.6);
    expect(patterns[0].confidence).toBe(0.7);
    expect(patterns[0].category).toBe('user_behavior');
    expect(patterns[0].lastObserved).toBeInstanceOf(Date);
    expect(patterns[0].lastObserved.toISOString()).toBe('2020-06-15T12:00:00.000Z');
  });

  it('주입 storage patterns의 lastObserved가 숫자(ms)여도 Date로 복원한다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const ms = new Date('2021-03-10T08:00:00.000Z').getTime();
    const row = {
      id: 'loaded-p-ms',
      pattern: 'p',
      frequency: 0.2,
      impact: 0.5,
      confidence: 0.5,
      lastObserved: ms,
      category: 'user_behavior' as const,
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify([row]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const patterns = engine.getLearningPatterns();

    expect(patterns[0].lastObserved).toBeInstanceOf(Date);
    expect(patterns[0].lastObserved.toISOString()).toBe('2021-03-10T08:00:00.000Z');
  });

  it('generatePredictiveInsights 호출 후 주입 storage에 predictiveInsights JSON 배열이 기록된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;

    engine.generatePredictiveInsights();

    const raw = store.get(K.predictiveInsights);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as unknown;
    expect(Array.isArray(parsed)).toBe(true);
  });

  it('generatePredictiveInsights 호출 후 saveData는 세 persistence 키에 setItem을 각각 한 번씩 호출한다', () => {
    const setItem = jest.fn();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem,
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.generatePredictiveInsights();

    expect(setItem).toHaveBeenCalledTimes(3);
    const keys = setItem.mock.calls.map((c) => c[0]);
    expect(keys.filter((k) => k === K.patterns).length).toBe(1);
    expect(keys.filter((k) => k === K.optimizationResults).length).toBe(1);
    expect(keys.filter((k) => k === K.predictiveInsights).length).toBe(1);
  });

  it('generatePredictiveInsights 호출 후 saveData의 setItem 호출 순서는 patterns → optimizationResults → predictiveInsights이다', () => {
    const setItem = jest.fn();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem,
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.generatePredictiveInsights();

    expect(setItem.mock.calls.map((c) => c[0])).toEqual([
      K.patterns,
      K.optimizationResults,
      K.predictiveInsights,
    ]);
  });

  it('generatePredictiveInsights를 두 번 호출하면 setItem이 총 6회·세 키 각 2회다', () => {
    const setItem = jest.fn();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem,
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.generatePredictiveInsights();
    engine.generatePredictiveInsights();

    expect(setItem).toHaveBeenCalledTimes(6);
    const keys = setItem.mock.calls.map((c) => c[0]);
    expect(keys.filter((k) => k === K.patterns).length).toBe(2);
    expect(keys.filter((k) => k === K.optimizationResults).length).toBe(2);
    expect(keys.filter((k) => k === K.predictiveInsights).length).toBe(2);
  });

  it('generatePredictiveInsights를 두 번 호출하면 각 saveData가 patterns → optimizationResults → predictiveInsights 순으로 setItem한다', () => {
    const setItem = jest.fn();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem,
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    engine.generatePredictiveInsights();
    engine.generatePredictiveInsights();

    expect(setItem.mock.calls.map((c) => c[0])).toEqual([
      K.patterns,
      K.optimizationResults,
      K.predictiveInsights,
      K.patterns,
      K.optimizationResults,
      K.predictiveInsights,
    ]);
  });

  it('주입 storage의 유효 optimizationResults 배열을 로드하고 appliedAt을 Date로 복원한다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const row = {
      id: 'or-loaded',
      optimizationId: 'oid',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.12,
      userSatisfaction: 0.88,
      learningInsights: ['a'],
      appliedAt: '2019-06-01T00:00:00.000Z',
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.optimizationResults ? JSON.stringify([row]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const results = engine.getOptimizationResults();

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('or-loaded');
    expect(results[0].appliedAt).toBeInstanceOf(Date);
    expect(results[0].appliedAt.toISOString()).toBe('2019-06-01T00:00:00.000Z');
    expect(results[0].optimizationId).toBe('oid');
    expect(results[0].userSatisfaction).toBe(0.88);
    expect(results[0].learningInsights).toEqual(['a']);
    expect(results[0].improvement).toBe(0.12);
  });

  it('주입 storage optimizationResults의 beforeMetrics·afterMetrics가 로드 후 객체로 보존된다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const row = {
      id: 'or-meta',
      optimizationId: 'oid',
      beforeMetrics: { latency: 100 },
      afterMetrics: { latency: 80 },
      improvement: 0.12,
      userSatisfaction: 0.88,
      learningInsights: [] as string[],
      appliedAt: new Date().toISOString(),
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.optimizationResults ? JSON.stringify([row]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const r = engine.getOptimizationResults()[0];

    expect(r.beforeMetrics).toEqual({ latency: 100 });
    expect(r.afterMetrics).toEqual({ latency: 80 });
  });

  it('주입 storage optimizationResults의 improvement이 음수여도 로드 후 숫자로 보존된다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const row = {
      id: 'or-neg',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: -0.05,
      userSatisfaction: 0.5,
      learningInsights: [],
      appliedAt: new Date().toISOString(),
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.optimizationResults ? JSON.stringify([row]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });

    expect(engine.getOptimizationResults()[0].improvement).toBe(-0.05);
  });

  it('주입 storage optimizationResults의 appliedAt이 숫자(ms)여도 Date로 복원한다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const ms = new Date('2018-04-05T12:30:00.000Z').getTime();
    const row = {
      id: 'or-ms',
      optimizationId: 'oid',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.08,
      userSatisfaction: 0.85,
      learningInsights: [] as string[],
      appliedAt: ms,
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.optimizationResults ? JSON.stringify([row]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const results = engine.getOptimizationResults();

    expect(results[0].appliedAt).toBeInstanceOf(Date);
    expect(results[0].appliedAt.toISOString()).toBe('2018-04-05T12:30:00.000Z');
  });

  it('주입 storage의 유효 predictiveInsights 배열을 로드하고 lastUpdated를 Date로 복원한다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const row = {
      id: 'pi-loaded',
      insight: '테스트',
      confidence: 0.85,
      timeframe: 'medium_term' as const,
      category: 'user_behavior' as const,
      recommendations: ['r'],
      dataPoints: 2,
      lastUpdated: '2019-07-01T00:00:00.000Z',
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.predictiveInsights ? JSON.stringify([row]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const ins = engine.getPredictiveInsights();

    expect(ins).toHaveLength(1);
    expect(ins[0].id).toBe('pi-loaded');
    expect(ins[0].insight).toBe('테스트');
    expect(ins[0].confidence).toBe(0.85);
    expect(ins[0].timeframe).toBe('medium_term');
    expect(ins[0].category).toBe('user_behavior');
    expect(ins[0].recommendations).toEqual(['r']);
    expect(ins[0].dataPoints).toBe(2);
    expect(ins[0].lastUpdated).toBeInstanceOf(Date);
    expect(ins[0].lastUpdated.toISOString()).toBe('2019-07-01T00:00:00.000Z');
  });

  it('주입 storage predictiveInsights의 lastUpdated가 숫자(ms)여도 Date로 복원한다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const ms = new Date('2022-11-20T15:45:30.000Z').getTime();
    const row = {
      id: 'pi-ms',
      insight: 'x',
      confidence: 0.7,
      timeframe: 'long_term' as const,
      category: 'system_health' as const,
      recommendations: [] as string[],
      dataPoints: 1,
      lastUpdated: ms,
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.predictiveInsights ? JSON.stringify([row]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const ins = engine.getPredictiveInsights();

    expect(ins[0].lastUpdated).toBeInstanceOf(Date);
    expect(ins[0].lastUpdated.toISOString()).toBe('2022-11-20T15:45:30.000Z');
  });

  it('generateLearningReport는 summary·recentActivity·recommendations를 반환한다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as {
      summary: { totalPatterns: number; modelVersion: string };
      recentActivity: { activeModels: number };
      recommendations: string[];
    };

    expect(report.summary).toBeDefined();
    expect(typeof report.summary.totalPatterns).toBe('number');
    expect(typeof report.summary.modelVersion).toBe('string');
    expect(report.recentActivity.activeModels).toBeGreaterThanOrEqual(3);
    expect(Array.isArray(report.recommendations)).toBe(true);
  });

  it('generateLearningReport.recommendations의 항목은 모두 문자열이다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as { recommendations: unknown[] };

    expect(report.recommendations.every((x) => typeof x === 'string')).toBe(true);
  });

  it('getAdaptiveModels()의 id는 서로 중복되지 않는다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const ids = engine.getAdaptiveModels().map((m) => m.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('learnFromOptimizationResult는 최적화 결과를 추가한 순서를 유지한다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = {
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [] as string[],
      appliedAt: new Date(),
    };
    engine.learnFromOptimizationResult({ id: 'o-order-1', ...base });
    engine.learnFromOptimizationResult({ id: 'o-order-2', ...base });
    const r = engine.getOptimizationResults();

    expect(r.map((x) => x.id)).toEqual(['o-order-1', 'o-order-2']);
  });

  it('retrainModels() 반환 배열 길이는 getAdaptiveModels().length와 같다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    try {
      const ret = engine.retrainModels();
      expect(ret.length).toBe(engine.getAdaptiveModels().length);
      expect(ret.length).toBe(3);
    } finally {
      randomSpy.mockRestore();
    }
  });

  it('getOptimizationResults()의 항목 id는 모두 비어 있지 않은 문자열이다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.learnFromOptimizationResult({
      id: 'o-id-str',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });

    expect(engine.getOptimizationResults().every((r) => typeof r.id === 'string' && r.id.length > 0)).toBe(true);
  });

  it('getAdaptiveModels()의 modelType은 classification·regression·clustering·recommendation 중 하나다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const allowed = new Set(['classification', 'regression', 'clustering', 'recommendation']);

    expect(engine.getAdaptiveModels().every((m) => allowed.has(m.modelType))).toBe(true);
  });

  it('getPredictiveInsights()의 category는 performance·user_behavior·system_health·resource_usage 중 하나다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const allowed = new Set(['performance', 'user_behavior', 'system_health', 'resource_usage']);
    engine.learnFromOptimizationResult({
      id: 'cat-ins',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.15,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });

    expect(engine.getPredictiveInsights().every((i) => allowed.has(i.category))).toBe(true);
  });

  it('getPredictiveInsights()의 timeframe은 short_term·medium_term·long_term 중 하나다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const allowed = new Set(['short_term', 'medium_term', 'long_term']);
    engine.learnFromOptimizationResult({
      id: 'tf-ins',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.15,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });

    expect(engine.getPredictiveInsights().every((i) => allowed.has(i.timeframe))).toBe(true);
  });

  it('getLearningPatterns()의 category는 user_behavior·system_performance·optimization_effect·error_pattern 중 하나다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const allowed = new Set([
      'user_behavior',
      'system_performance',
      'optimization_effect',
      'error_pattern',
    ]);
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = [
      {
        id: 'pa',
        name: 'a',
        description: '',
        createdAt: daysAgo(5),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
      {
        id: 'pb',
        name: 'b',
        description: '',
        createdAt: daysAgo(4),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
      {
        id: 'pc',
        name: 'c',
        description: '',
        createdAt: daysAgo(3),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
    ];
    engine.learnUserBehavior(projects, [], []);

    expect(engine.getLearningPatterns().every((p) => allowed.has(p.category))).toBe(true);
  });

  it('로드된 패턴이 없으면 generateLearningReport.categoryBreakdown은 빈 객체다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as { categoryBreakdown: Record<string, number> };

    expect(report.categoryBreakdown).toEqual({});
  });

  it('generateLearningReport를 연속 호출하면 반환 최상위·summary·recentActivity·recommendations 참조는 서로 다르다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const r1 = engine.generateLearningReport() as {
      summary: object;
      recentActivity: object;
      recommendations: unknown[];
    };
    const r2 = engine.generateLearningReport() as {
      summary: object;
      recentActivity: object;
      recommendations: unknown[];
    };

    expect(r1).not.toBe(r2);
    expect(r1.summary).not.toBe(r2.summary);
    expect(r1.recentActivity).not.toBe(r2.recentActivity);
    expect(r1.recommendations).not.toBe(r2.recommendations);
  });

  it('generateLearningReport summary·categoryBreakdown이 스토리지에서 로드한 데이터를 반영한다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const pattern = {
      id: 'p-report',
      pattern: 'r',
      frequency: 1,
      impact: 0.5,
      confidence: 0.5,
      lastObserved: '2020-01-01T00:00:00.000Z',
      category: 'optimization_effect' as const,
    };
    const opt = {
      id: 'o-report',
      optimizationId: 'oid',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [] as string[],
      appliedAt: '2020-01-02T00:00:00.000Z',
    };
    const insight = {
      id: 'i-report',
      insight: 'x',
      confidence: 0.8,
      timeframe: 'short_term' as const,
      category: 'performance' as const,
      recommendations: [] as string[],
      dataPoints: 1,
      lastUpdated: '2020-01-03T00:00:00.000Z',
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => {
        if (key === K.patterns) return JSON.stringify([pattern]);
        if (key === K.optimizationResults) return JSON.stringify([opt]);
        if (key === K.predictiveInsights) return JSON.stringify([insight]);
        return null;
      },
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as {
      summary: { totalPatterns: number; totalOptimizations: number; totalInsights: number };
      categoryBreakdown: Record<string, number>;
    };

    expect(report.summary.totalPatterns).toBe(1);
    expect(report.summary.totalOptimizations).toBe(1);
    expect(report.summary.totalInsights).toBe(1);
    expect(report.categoryBreakdown.optimization_effect).toBe(1);
  });

  it('learnFromOptimizationResult(최근·improvement>0) 후 performance 예측 인사이트가 포함된다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.learnFromOptimizationResult({
      id: 'o-perf-path',
      optimizationId: 'xid',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.2,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });

    expect(engine.getPredictiveInsights().some((i) => i.category === 'performance')).toBe(true);
  });

  it('learnFromOptimizationResult(improvement>0) 한 건 후 summary.totalOptimizations는 1·totalInsights는 1이다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.learnFromOptimizationResult({
      id: 'o-sum',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.15,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const report = engine.generateLearningReport() as {
      summary: { totalOptimizations: number; totalInsights: number };
    };

    expect(report.summary.totalOptimizations).toBe(1);
    expect(report.summary.totalInsights).toBe(1);
  });

  it('로드된 user_behavior 패턴이 있으면 generatePredictiveInsights에 user_behavior 인사이트가 포함된다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const row = {
      id: 'ub-ins',
      pattern: 'p',
      frequency: 0.6,
      impact: 0.5,
      confidence: 0.55,
      lastObserved: '2020-01-01T00:00:00.000Z',
      category: 'user_behavior' as const,
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify([row]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();

    expect(engine.getPredictiveInsights().some((i) => i.category === 'user_behavior')).toBe(true);
  });

  it('learnFromOptimizationResult에서 improvement이 0이면 optimization-recommendation-model accuracy가 그대로다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const before = engine.getAdaptiveModels().find((m) => m.id === 'optimization-recommendation-model')!.accuracy;
    engine.learnFromOptimizationResult({
      id: 'o-zero',
      optimizationId: 'z',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0,
      userSatisfaction: 0.5,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const after = engine.getAdaptiveModels().find((m) => m.id === 'optimization-recommendation-model')!.accuracy;

    expect(after).toBe(before);
  });

  it('learnFromOptimizationResult에서 improvement이 0이면 optimization-recommendation-model trainingDataSize는 변하지 않는다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const model = engine.getAdaptiveModels().find((m) => m.id === 'optimization-recommendation-model')!;
    const beforeSize = model.trainingDataSize;
    engine.learnFromOptimizationResult({
      id: 'o-zero-ts',
      optimizationId: 'z',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0,
      userSatisfaction: 0.5,
      learningInsights: [],
      appliedAt: new Date(),
    });

    expect(
      engine.getAdaptiveModels().find((m) => m.id === 'optimization-recommendation-model')!.trainingDataSize,
    ).toBe(beforeSize);
  });

  it('learnFromOptimizationResult에서 improvement이 0이면 optimization-recommendation-model lastUpdated는 변하지 않는다', () => {
    jest.useFakeTimers();
    try {
      jest.setSystemTime(new Date('2024-06-01T12:00:00.000Z'));
      const storage: Pick<Storage, 'getItem' | 'setItem'> = {
        getItem: () => null,
        setItem: jest.fn(),
      };
      const engine = new AdaptiveLearningEngine({ storage });
      const before = engine.getAdaptiveModels().find((m) => m.id === 'optimization-recommendation-model')!.lastUpdated.getTime();
      jest.advanceTimersByTime(60_000);
      engine.learnFromOptimizationResult({
        id: 'o-zero-lu',
        optimizationId: 'z',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0,
        userSatisfaction: 0.5,
        learningInsights: [],
        appliedAt: new Date(),
      });
      const after = engine.getAdaptiveModels().find((m) => m.id === 'optimization-recommendation-model')!.lastUpdated.getTime();

      expect(after).toBe(before);
    } finally {
      jest.useRealTimers();
    }
  });

  it('learnFromOptimizationResult에서 improvement>0이어도 optimization-recommendation-model performanceMetrics.auc는 변하지 않는다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const aucBefore = engine.getAdaptiveModels().find((m) => m.id === 'optimization-recommendation-model')!
      .performanceMetrics.auc;
    engine.learnFromOptimizationResult({
      id: 'o-auc',
      optimizationId: 'z',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.12,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const aucAfter = engine.getAdaptiveModels().find((m) => m.id === 'optimization-recommendation-model')!
      .performanceMetrics.auc;

    expect(aucAfter).toBe(aucBefore);
  });

  it('learnFromOptimizationResult(improvement>0) 후 optimization-recommendation-model의 id·name·modelType은 변하지 않는다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.learnFromOptimizationResult({
      id: 'o-idnm',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const m = engine.getAdaptiveModels().find((x) => x.id === 'optimization-recommendation-model')!;

    expect(m.id).toBe('optimization-recommendation-model');
    expect(m.name).toBe('최적화 권장 모델');
    expect(m.modelType).toBe('recommendation');
  });

  it('learnFromOptimizationResult 후 generatePredictiveInsights를 한 번 더 호출하면 performance 인사이트가 id가 달라 별도로 누적된다', () => {
    let tick = 1_700_000_000_000;
    const nowSpy = jest.spyOn(Date, 'now').mockImplementation(() => {
      tick += 1;
      return tick;
    });
    try {
      const storage: Pick<Storage, 'getItem' | 'setItem'> = {
        getItem: () => null,
        setItem: jest.fn(),
      };
      const engine = new AdaptiveLearningEngine({ storage });
      engine.learnFromOptimizationResult({
        id: 'o-dup-ins',
        optimizationId: 'd',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0.12,
        userSatisfaction: 0.9,
        learningInsights: [],
        appliedAt: new Date(),
      });
      expect(engine.getPredictiveInsights().filter((i) => i.category === 'performance')).toHaveLength(1);

      engine.generatePredictiveInsights();

      expect(engine.getPredictiveInsights().filter((i) => i.category === 'performance')).toHaveLength(2);
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('getPredictiveInsights() 반환 배열을 직접 변경하면 이후 getter에서도 반영된다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.learnFromOptimizationResult({
      id: 'o-ins-mut',
      optimizationId: 'm',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.15,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const ref = engine.getPredictiveInsights();
    const n0 = ref.length;
    ref.pop();

    expect(engine.getPredictiveInsights().length).toBe(n0 - 1);
  });

  it('getOptimizationResults() 반환 배열을 직접 변경하면 이후 getter에서도 반영된다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.learnFromOptimizationResult({
      id: 'o-res-mut',
      optimizationId: 'm',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const ref = engine.getOptimizationResults();
    const n0 = ref.length;
    ref.pop();

    expect(engine.getOptimizationResults().length).toBe(n0 - 1);
  });

  it('getAdaptiveModels() 반환 배열의 항목을 수정하면 이후 getter에서도 반영된다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const m0 = engine.getAdaptiveModels()[0];
    const prev = m0.accuracy;
    m0.accuracy = 0.11;

    expect(engine.getAdaptiveModels()[0].accuracy).toBe(0.11);

    m0.accuracy = prev;
  });

  it('로드된 system_performance 패턴이 있으면 generatePredictiveInsights에 resource_usage 인사이트가 포함된다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const row = {
      id: 'sp-ins',
      pattern: 'p',
      frequency: 0.5,
      impact: 0.75,
      confidence: 0.5,
      lastObserved: '2020-01-01T00:00:00.000Z',
      category: 'system_performance' as const,
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify([row]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();

    expect(engine.getPredictiveInsights().some((i) => i.category === 'resource_usage')).toBe(true);
  });

  it('learnFromOptimizationResult에서 improvement>0이면 optimization-recommendation-model accuracy가 증가한다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const before = engine.getAdaptiveModels().find((m) => m.id === 'optimization-recommendation-model')!.accuracy;
    engine.learnFromOptimizationResult({
      id: 'o-up',
      optimizationId: 'u',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.05,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const after = engine.getAdaptiveModels().find((m) => m.id === 'optimization-recommendation-model')!.accuracy;

    expect(after).toBeGreaterThan(before);
  });

  it('최근 최적화 improvement≤0.1이면 performance 인사이트에 저하 추세가 반영된다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.learnFromOptimizationResult({
      id: 'o-trend-low',
      optimizationId: 'tl',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.05,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const perf = engine.getPredictiveInsights().find((i) => i.category === 'performance');

    expect(perf).toBeDefined();
    expect(perf!.insight).toContain('저하');
  });

  it('retrainModels 호출 후 적응형 모델 version 문자열이 0.1씩 증가한다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    try {
      const m0 = engine.getAdaptiveModels()[0];
      const vBefore = parseFloat(m0.version);
      engine.retrainModels();
      expect(parseFloat(engine.getAdaptiveModels()[0].version)).toBeCloseTo(vBefore + 0.1, 5);
    } finally {
      randomSpy.mockRestore();
    }
  });

  it('최근 최적화 improvement>0.1이면 performance 인사이트에 개선 추세가 반영된다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.learnFromOptimizationResult({
      id: 'o-trend-up',
      optimizationId: 'tu',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.15,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const perf = engine.getPredictiveInsights().find((i) => i.category === 'performance');

    expect(perf).toBeDefined();
    expect(perf!.insight).toContain('개선');
  });

  it('learnUserBehavior(최근 프로젝트 3건) 후 주입 storage에 project-creation 패턴이 저장된다', () => {
    const store = new Map<string, string>();
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, value);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = [
      {
        id: 'pa',
        name: 'a',
        description: '',
        createdAt: daysAgo(5),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
      {
        id: 'pb',
        name: 'b',
        description: '',
        createdAt: daysAgo(4),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
      {
        id: 'pc',
        name: 'c',
        description: '',
        createdAt: daysAgo(3),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
    ];

    const patterns = engine.learnUserBehavior(projects, [], []);
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;

    expect(patterns.some((p) => p.id === 'project-creation-pattern')).toBe(true);
    const raw = store.get(K.patterns);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw as string) as { id?: string }[];
    expect(parsed.some((p) => p.id === 'project-creation-pattern')).toBe(true);
  });

  it('learnUserBehavior(7일 이내 대화·메시지 있음) 시 chat-activity-pattern이 포함된다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const msg: Message = {
      id: 'm1',
      chatId: 'c1',
      role: 'user',
      content: 'hello',
      timestamp: new Date(),
    };
    const chat: Chat = {
      id: 'c1',
      projectId: 'p1',
      name: '대화',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      messages: [msg],
    };
    const patterns = engine.learnUserBehavior([], [chat], []);

    expect(patterns.some((p) => p.id === 'chat-activity-pattern')).toBe(true);
  });

  it(`learnUserBehavior(24시간 이내 메시지 ${MP.minMessages}건 이상) 시 message-pattern이 포함된다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = Date.now();
    const messages: Message[] = Array.from({ length: MP.minMessages }, (_, i) => ({
      id: `m${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(24),
      timestamp: new Date(base - (MP.minMessages - i) * 60 * 1000),
    }));
    const patterns = engine.learnUserBehavior([], [], messages);

    expect(patterns.some((p) => p.id === 'message-pattern')).toBe(true);
  });

  it('대화(chats) 배열이 비어 있고 메시지만 있으면 message-pattern만 생기고 chat-activity-pattern은 없다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = Date.now();
    const messages: Message[] = Array.from({ length: MP.minMessages }, (_, i) => ({
      id: `solo-m${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'y'.repeat(20),
      timestamp: new Date(base - (MP.minMessages - i) * 60 * 1000),
    }));
    const patterns = engine.learnUserBehavior([], [], messages);

    expect(patterns.some((p) => p.id === 'message-pattern')).toBe(true);
    expect(patterns.some((p) => p.id === 'chat-activity-pattern')).toBe(false);
  });

  it('프로젝트 3건만 있고 대화·전달 메시지가 비어 있으면 project-creation-pattern만 생긴다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = ['pa', 'pb', 'pc'].map((id, i) => ({
      id,
      name: id,
      description: '',
      createdAt: daysAgo(5 - i),
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation' as const,
      status: 'active' as const,
      chats: [],
    }));
    const patterns = engine.learnUserBehavior(projects, [], []);

    expect(patterns.map((p) => p.id).sort()).toEqual(['project-creation-pattern']);
  });

  it(`프로젝트·최근 대화·24시간 메시지 ${MP.minMessages}건을 한 번에 넣으면 세 패턴이 모두 user_behavior로 집계된다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = ['p1', 'p2', 'p3'].map((id, i) => ({
      id,
      name: id,
      description: '',
      createdAt: daysAgo(6 - i),
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation' as const,
      status: 'active' as const,
      chats: [],
    }));
    const recentChatAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const msgInChat: Message = {
      id: 'inchat',
      chatId: 'c1',
      role: 'user',
      content: 'hi',
      timestamp: new Date(),
    };
    const chat: Chat = {
      id: 'c1',
      projectId: 'p1',
      name: 'c',
      createdAt: recentChatAt,
      updatedAt: new Date(),
      messages: [msgInChat],
    };
    const base = Date.now();
    const globalMessages: Message[] = Array.from({ length: MP.minMessages }, (_, i) => ({
      id: `g${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'z'.repeat(15),
      timestamp: new Date(base - (MP.minMessages - i) * 60 * 1000),
    }));

    engine.learnUserBehavior(projects, [chat], globalMessages);
    const report = engine.generateLearningReport() as {
      summary: { totalPatterns: number };
      categoryBreakdown: Record<string, number>;
    };

    expect(report.summary.totalPatterns).toBe(3);
    expect(report.categoryBreakdown.user_behavior).toBe(3);
    expect(engine.getLearningPatterns().map((p) => p.id).sort()).toEqual(
      ['chat-activity-pattern', 'message-pattern', 'project-creation-pattern'].sort(),
    );
  });

  it('generateLearningReport는 패턴·최적화가 적을 때 수집 권장 문구를 포함한다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as { recommendations: string[] };
    const joined = report.recommendations.join(' ');

    expect(joined).toContain('학습 데이터');
    expect(joined).toContain('최적화 결과');
  });

  it('모델 lastUpdated가 7일 초과이면 리포트에 재훈련 권장이 포함된다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.getAdaptiveModels().forEach((m) => {
      m.lastUpdated = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    });
    const report = engine.generateLearningReport() as { recommendations: string[] };

    expect(report.recommendations.some((r) => r.includes('재훈련'))).toBe(true);
  });

  it('모델 lastUpdated가 정확히 7일 전이면 리포트에 재훈련 권장(오래된 모델)이 포함되지 않는다', () => {
    const fixed = new Date('2025-06-01T12:00:00.000Z');
    jest.useFakeTimers();
    jest.setSystemTime(fixed);
    try {
      const storage: Pick<Storage, 'getItem' | 'setItem'> = {
        getItem: () => null,
        setItem: jest.fn(),
      };
      const engine = new AdaptiveLearningEngine({ storage });
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      engine.getAdaptiveModels().forEach((m) => {
        m.lastUpdated = new Date(fixed.getTime() - sevenDaysMs);
      });
      const report = engine.generateLearningReport() as { recommendations: string[] };

      expect(report.recommendations.some((r) => r.includes('재훈련'))).toBe(false);
    } finally {
      jest.useRealTimers();
    }
  });

  it('모델 lastUpdated가 정확히 7일+1ms보다 오래되면 리포트에 재훈련 권장이 포함된다', () => {
    const fixed = new Date('2025-06-01T12:00:00.000Z');
    jest.useFakeTimers();
    jest.setSystemTime(fixed);
    try {
      const storage: Pick<Storage, 'getItem' | 'setItem'> = {
        getItem: () => null,
        setItem: jest.fn(),
      };
      const engine = new AdaptiveLearningEngine({ storage });
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      engine.getAdaptiveModels().forEach((m) => {
        m.lastUpdated = new Date(fixed.getTime() - sevenDaysMs - 1);
      });
      const report = engine.generateLearningReport() as { recommendations: string[] };

      expect(report.recommendations.some((r) => r.includes('재훈련'))).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });

  it('user_behavior 패턴 frequency>0.5이면 user_behavior 인사이트에 증가 추세가 반영된다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const row = {
      id: 'ub-high',
      pattern: 'p',
      frequency: 0.7,
      impact: 0.5,
      confidence: 0.6,
      lastObserved: '2020-01-01T00:00:00.000Z',
      category: 'user_behavior' as const,
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify([row]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const ub = engine.getPredictiveInsights().find((i) => i.category === 'user_behavior');

    expect(ub?.insight).toContain('증가');
  });

  it('user_behavior 패턴 frequency≤0.5이면 user_behavior 인사이트에 감소 추세가 반영된다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const row = {
      id: 'ub-low',
      pattern: 'p',
      frequency: 0.35,
      impact: 0.5,
      confidence: 0.6,
      lastObserved: '2020-01-01T00:00:00.000Z',
      category: 'user_behavior' as const,
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify([row]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const ub = engine.getPredictiveInsights().find((i) => i.category === 'user_behavior');

    expect(ub?.insight).toContain('감소');
  });

  it.each([
    [0.75, '높음'],
    [0.71, '높음'],
    [0.7, '보통'],
    [0.5, '보통'],
    [0.41, '보통'],
    [0.4, '낮음'],
    [0.25, '낮음'],
  ] as const)('system_performance impact %s이면 resource 인사이트에 %s 수준이 반영된다', (impact, token) => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const row = {
      id: `sp-risk-${impact}`,
      pattern: 'p',
      frequency: 0.5,
      impact,
      confidence: 0.6,
      lastObserved: '2020-01-01T00:00:00.000Z',
      category: 'system_performance' as const,
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify([row]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const res = engine.getPredictiveInsights().find((i) => i.category === 'resource_usage');

    expect(res?.insight).toContain(token);
  });

  it('learnUserBehavior가 동일 id 패턴이 있으면 frequency·confidence를 병합한다', () => {
    const store = new Map<string, string>();
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const existing = {
      id: 'project-creation-pattern',
      pattern: 'old',
      frequency: 0.2,
      impact: PCP.impact,
      confidence: 0.5,
      lastObserved: new Date().toISOString(),
      category: 'user_behavior' as const,
    };
    store.set(K.patterns, JSON.stringify([existing]));
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, v) => {
        store.set(key, v);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = [
      {
        id: 'pa',
        name: 'a',
        description: '',
        createdAt: daysAgo(5),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
      {
        id: 'pb',
        name: 'b',
        description: '',
        createdAt: daysAgo(4),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
      {
        id: 'pc',
        name: 'c',
        description: '',
        createdAt: daysAgo(3),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
    ];
    engine.learnUserBehavior(projects, [], []);
    const p = engine.getLearningPatterns().find((x) => x.id === 'project-creation-pattern');

    expect(p).toBeDefined();
    const expectedNewFreq = 3 / PCP.frequencyWindowDays;
    expect(p!.frequency).toBeCloseTo((0.2 + expectedNewFreq) / 2, 5);
    expect(p!.confidence).toBeCloseTo(Math.min(0.95, 0.5 + 0.1), 5);
  });

  it('learnUserBehavior 병합 시 기존 패턴 confidence가 0.9이면 병합 후 confidence는 0.95를 넘지 않는다', () => {
    const store = new Map<string, string>();
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const existing = {
      id: 'project-creation-pattern',
      pattern: 'old',
      frequency: 0.2,
      impact: PCP.impact,
      confidence: 0.9,
      lastObserved: new Date().toISOString(),
      category: 'user_behavior' as const,
    };
    store.set(K.patterns, JSON.stringify([existing]));
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, v) => {
        store.set(key, v);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = [
      {
        id: 'pa',
        name: 'a',
        description: '',
        createdAt: daysAgo(5),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
      {
        id: 'pb',
        name: 'b',
        description: '',
        createdAt: daysAgo(4),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
      {
        id: 'pc',
        name: 'c',
        description: '',
        createdAt: daysAgo(3),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
    ];
    engine.learnUserBehavior(projects, [], []);
    const p = engine.getLearningPatterns().find((x) => x.id === 'project-creation-pattern');

    expect(p?.confidence).toBe(0.95);
  });

  it('generatePredictiveInsights는 lastUpdated가 30일을 넘긴 인사이트를 제거한다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const oldDate = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);
    const insight = {
      id: 'old-insight-prune',
      insight: 'x',
      confidence: 0.5,
      timeframe: 'short_term' as const,
      category: 'performance' as const,
      recommendations: [] as string[],
      dataPoints: 1,
      lastUpdated: oldDate.toISOString(),
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.predictiveInsights ? JSON.stringify([insight]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });

    expect(engine.getPredictiveInsights().some((i) => i.id === 'old-insight-prune')).toBe(true);
    engine.generatePredictiveInsights();
    expect(engine.getPredictiveInsights().some((i) => i.id === 'old-insight-prune')).toBe(false);
  });

  it('generatePredictiveInsights는 lastUpdated가 엔진 thirtyDaysAgo와 같으면 인사이트를 제거한다(엄격 >)', () => {
    const fixed = new Date('2025-06-15T12:00:00.000Z');
    jest.useFakeTimers();
    jest.setSystemTime(fixed);
    try {
      const thirtyDaysAgo = new Date(fixed.getTime());
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
      const insight = {
        id: 'edge-prune-eq',
        insight: 'x',
        confidence: 0.5,
        timeframe: 'short_term' as const,
        category: 'performance' as const,
        recommendations: [] as string[],
        dataPoints: 1,
        lastUpdated: thirtyDaysAgo.toISOString(),
      };
      const storage: Pick<Storage, 'getItem' | 'setItem'> = {
        getItem: (key) => (key === K.predictiveInsights ? JSON.stringify([insight]) : null),
        setItem: jest.fn(),
      };
      const engine = new AdaptiveLearningEngine({ storage });

      expect(engine.getPredictiveInsights().some((i) => i.id === 'edge-prune-eq')).toBe(true);
      engine.generatePredictiveInsights();
      expect(engine.getPredictiveInsights().some((i) => i.id === 'edge-prune-eq')).toBe(false);
    } finally {
      jest.useRealTimers();
    }
  });

  it('generatePredictiveInsights는 lastUpdated가 thirtyDaysAgo보다 1ms 크면 인사이트를 유지한다', () => {
    const fixed = new Date('2025-06-15T12:00:00.000Z');
    jest.useFakeTimers();
    jest.setSystemTime(fixed);
    try {
      const thirtyDaysAgo = new Date(fixed.getTime());
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const keptDate = new Date(thirtyDaysAgo.getTime() + 1);

      const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
      const insight = {
        id: 'edge-keep-1ms',
        insight: 'x',
        confidence: 0.5,
        timeframe: 'short_term' as const,
        category: 'performance' as const,
        recommendations: [] as string[],
        dataPoints: 1,
        lastUpdated: keptDate.toISOString(),
      };
      const storage: Pick<Storage, 'getItem' | 'setItem'> = {
        getItem: (key) => (key === K.predictiveInsights ? JSON.stringify([insight]) : null),
        setItem: jest.fn(),
      };
      const engine = new AdaptiveLearningEngine({ storage });

      expect(engine.getPredictiveInsights().some((i) => i.id === 'edge-keep-1ms')).toBe(true);
      engine.generatePredictiveInsights();
      expect(engine.getPredictiveInsights().some((i) => i.id === 'edge-keep-1ms')).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });

  it('신뢰도 0.5 미만 패턴이 있으면 리포트에 재분석 권장이 포함된다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const row = {
      id: 'low-conf-pat',
      pattern: 'p',
      frequency: 0.3,
      impact: 0.5,
      confidence: 0.4,
      lastObserved: '2020-01-01T00:00:00.000Z',
      category: 'user_behavior' as const,
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify([row]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as { recommendations: string[] };

    expect(report.recommendations.some((r) => r.includes('신뢰도'))).toBe(true);
  });

  it('패턴 신뢰도가 정확히 0.5이면 리포트에 신뢰도 낮음 재분석 권장이 포함되지 않는다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const patterns = Array.from({ length: 10 }, (_, i) => ({
      id: `cf-edge-${i}`,
      pattern: 'x',
      frequency: 0.3,
      impact: 0.5,
      confidence: 0.5,
      lastObserved: '2020-01-01T00:00:00.000Z',
      category: 'user_behavior' as const,
    }));
    const opts = Array.from({ length: 5 }, (_, i) => ({
      id: `cf-edge-o-${i}`,
      optimizationId: `ox-${i}`,
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.05,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date().toISOString(),
    }));
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => {
        if (key === K.patterns) return JSON.stringify(patterns);
        if (key === K.optimizationResults) return JSON.stringify(opts);
        return null;
      },
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as { recommendations: string[] };

    expect(report.recommendations.some((r) => r.includes('신뢰도'))).toBe(false);
  });

  const dateWhoseGetTimeThrows = (): Date =>
    new Proxy(new Date(), {
      get(target, prop, receiver) {
        if (prop === 'getTime') {
          return () => {
            throw new Error('bad');
          };
        }
        return Reflect.get(target, prop, receiver);
      },
    }) as Date;

  it.each([
    ['patterns', 'loadData:adaptiveLearningPatterns'] as const,
    ['optimizationResults', 'loadData:optimizationResults'] as const,
    ['predictiveInsights', 'loadData:predictiveInsights'] as const,
  ])('getItem(%s)이 던지면 action=%s로 오류를 기록한다', (label, expectedAction) => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const storageKey =
      label === 'patterns'
        ? K.patterns
        : label === 'optimizationResults'
          ? K.optimizationResults
          : K.predictiveInsights;
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => {
        if (key === storageKey) throw new Error(`read fail ${label}`);
        return null;
      },
      setItem: jest.fn(),
    };
    const errSpy = jest.spyOn(errorLogger, 'error').mockImplementation(() => {});
    new AdaptiveLearningEngine({ storage });

    expect(
      errSpy.mock.calls.some(
        (c) => typeof c[2] === 'object' && c[2] !== null && (c[2] as { action?: string }).action === expectedAction,
      ),
    ).toBe(true);

    errSpy.mockRestore();
  });

  it('프로젝트 createdAt.getTime이 던지면 warn 후 나머지로 project-creation-pattern을 만든다', () => {
    const warnSpy = jest.spyOn(errorLogger, 'warn').mockImplementation(() => {});
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const badDate = dateWhoseGetTimeThrows();
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const base = (id: string, createdAt: Date): Project => ({
      id,
      name: id,
      description: '',
      createdAt,
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation',
      status: 'active',
      chats: [],
    });
    const projects: Project[] = [
      base('bad', badDate),
      base('pa', daysAgo(5)),
      base('pb', daysAgo(4)),
      base('pc', daysAgo(3)),
    ];

    const patterns = engine.learnUserBehavior(projects, [], []);

    expect(
      warnSpy.mock.calls.some(
        (c) =>
          c[1] &&
          typeof c[1] === 'object' &&
          (c[1] as { action?: string }).action === 'analyzeProjectCreationPattern',
      ),
    ).toBe(true);
    expect(
      warnSpy.mock.calls.some(
        (c) =>
          c[0] === 'Invalid createdAt in project' &&
          typeof c[1] === 'object' &&
          c[1] !== null &&
          (c[1] as { action?: string }).action === 'analyzeProjectCreationPattern',
      ),
    ).toBe(true);
    expect(patterns.some((p) => p.id === 'project-creation-pattern')).toBe(true);
    warnSpy.mockRestore();
  });

  it('대화 createdAt.getTime이 던지면 analyzeChatActivityPattern에서 warn한다', () => {
    const warnSpy = jest.spyOn(errorLogger, 'warn').mockImplementation(() => {});
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const badDate = dateWhoseGetTimeThrows();
    const chat: Chat = {
      id: 'c1',
      projectId: 'p1',
      name: 'c',
      createdAt: badDate,
      updatedAt: new Date(),
      messages: [],
    };

    engine.learnUserBehavior([], [chat], []);

    expect(
      warnSpy.mock.calls.some(
        (c) =>
          c[1] &&
          typeof c[1] === 'object' &&
          (c[1] as { action?: string }).action === 'analyzeChatActivityPattern',
      ),
    ).toBe(true);
    expect(
      warnSpy.mock.calls.some(
        (c) =>
          c[0] === 'Invalid createdAt in chat' &&
          typeof c[1] === 'object' &&
          c[1] !== null &&
          (c[1] as { action?: string }).action === 'analyzeChatActivityPattern',
      ),
    ).toBe(true);
    warnSpy.mockRestore();
  });

  it('메시지 timestamp가 던지면 analyzeMessagePattern에서 warn한다', () => {
    const warnSpy = jest.spyOn(errorLogger, 'warn').mockImplementation(() => {});
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const badTs = dateWhoseGetTimeThrows();
    const base = Date.now();
    const messages: Message[] = [
      {
        id: 'm0',
        chatId: 'c1',
        role: 'user',
        content: 'x',
        timestamp: badTs,
      },
      ...Array.from({ length: MP.minMessages - 1 }, (_, i) => ({
        id: `m${i + 1}`,
        chatId: 'c1',
        role: (i % 2 === 0 ? 'assistant' : 'user') as 'assistant' | 'user',
        content: 'y'.repeat(20),
        timestamp: new Date(base - (MP.minMessages - 1 - i) * 60 * 1000),
      })),
    ];

    engine.learnUserBehavior([], [], messages);

    expect(
      warnSpy.mock.calls.some(
        (c) =>
          c[1] &&
          typeof c[1] === 'object' &&
          (c[1] as { action?: string }).action === 'analyzeMessagePattern',
      ),
    ).toBe(true);
    expect(
      warnSpy.mock.calls.some(
        (c) =>
          c[0] === 'Invalid timestamp in message' &&
          typeof c[1] === 'object' &&
          c[1] !== null &&
          (c[1] as { action?: string }).action === 'analyzeMessagePattern',
      ),
    ).toBe(true);
    warnSpy.mockRestore();
  });

  it('7일 초과 최적화만 있으면 performance 인사이트는 생기지 않고 user_behavior는 생길 수 있다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const pattern = {
      id: 'ub-only',
      pattern: 'p',
      frequency: 0.6,
      impact: 0.5,
      confidence: 0.6,
      lastObserved: '2020-01-01T00:00:00.000Z',
      category: 'user_behavior' as const,
    };
    const opt = {
      id: 'opt-old',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.2,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => {
        if (key === K.patterns) return JSON.stringify([pattern]);
        if (key === K.optimizationResults) return JSON.stringify([opt]);
        return null;
      },
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();

    expect(engine.getPredictiveInsights().some((i) => i.category === 'performance')).toBe(false);
    expect(engine.getPredictiveInsights().some((i) => i.category === 'user_behavior')).toBe(true);
  });

  it('generateLearningReport.recentActivity.recentOptimizations는 7일 초과 항목을 세지 않는다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const opt = {
      id: 'rep-old',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.2,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.optimizationResults ? JSON.stringify([opt]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as {
      summary: { totalOptimizations: number };
      recentActivity: { recentOptimizations: number };
    };

    expect(report.summary.totalOptimizations).toBe(1);
    expect(report.recentActivity.recentOptimizations).toBe(0);
  });

  it('generateLearningReport.recentActivity.recentOptimizations는 appliedAt이 정확히 7일 전인 최적화를 세지 않는다', () => {
    const fixed = new Date('2025-06-01T12:00:00.000Z');
    jest.useFakeTimers();
    jest.setSystemTime(fixed);
    try {
      const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      const appliedAt = new Date(fixed.getTime() - sevenDaysMs);
      const opt = {
        id: 'rep-7d',
        optimizationId: 'x',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0.2,
        userSatisfaction: 0.9,
        learningInsights: [],
        appliedAt: appliedAt.toISOString(),
      };
      const storage: Pick<Storage, 'getItem' | 'setItem'> = {
        getItem: (key) => (key === K.optimizationResults ? JSON.stringify([opt]) : null),
        setItem: jest.fn(),
      };
      const engine = new AdaptiveLearningEngine({ storage });
      const report = engine.generateLearningReport() as {
        summary: { totalOptimizations: number };
        recentActivity: { recentOptimizations: number };
      };

      expect(report.summary.totalOptimizations).toBe(1);
      expect(report.recentActivity.recentOptimizations).toBe(0);
    } finally {
      jest.useRealTimers();
    }
  });

  it('generateLearningReport.recentActivity.recentOptimizations는 appliedAt이 7일 미만 1ms 전인 최적화를 1건으로 센다', () => {
    const fixed = new Date('2025-06-01T12:00:00.000Z');
    jest.useFakeTimers();
    jest.setSystemTime(fixed);
    try {
      const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      const appliedAt = new Date(fixed.getTime() - sevenDaysMs + 1);
      const opt = {
        id: 'rep-7d-minus-1ms',
        optimizationId: 'x',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0.2,
        userSatisfaction: 0.9,
        learningInsights: [],
        appliedAt: appliedAt.toISOString(),
      };
      const storage: Pick<Storage, 'getItem' | 'setItem'> = {
        getItem: (key) => (key === K.optimizationResults ? JSON.stringify([opt]) : null),
        setItem: jest.fn(),
      };
      const engine = new AdaptiveLearningEngine({ storage });
      const report = engine.generateLearningReport() as {
        summary: { totalOptimizations: number };
        recentActivity: { recentOptimizations: number };
      };

      expect(report.summary.totalOptimizations).toBe(1);
      expect(report.recentActivity.recentOptimizations).toBe(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it('최적화 appliedAt이 정확히 7일 전이면 recent 최적화에 포함되지 않아 performance 인사이트가 생기지 않는다', () => {
    const fixed = new Date('2025-06-01T12:00:00.000Z');
    jest.useFakeTimers();
    jest.setSystemTime(fixed);
    try {
      const storage: Pick<Storage, 'getItem' | 'setItem'> = {
        getItem: () => null,
        setItem: jest.fn(),
      };
      const engine = new AdaptiveLearningEngine({ storage });
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      const appliedAt = new Date(fixed.getTime() - sevenDaysMs);
      engine.learnFromOptimizationResult({
        id: 'opt-ap-7d',
        optimizationId: 'x',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0.2,
        userSatisfaction: 0.9,
        learningInsights: [],
        appliedAt,
      });

      expect(engine.getPredictiveInsights().some((i) => i.category === 'performance')).toBe(false);
    } finally {
      jest.useRealTimers();
    }
  });

  it('고정 시각에서 generatePredictiveInsights를 연속 호출하면 동일 id performance 인사이트 confidence가 누적된다', () => {
    const fixed = new Date('2024-06-01T12:00:00.000Z');
    jest.useFakeTimers();
    jest.setSystemTime(fixed);
    try {
      const storage: Pick<Storage, 'getItem' | 'setItem'> = {
        getItem: () => null,
        setItem: jest.fn(),
      };
      const engine = new AdaptiveLearningEngine({ storage });
      const perfId = `performance-${fixed.getTime()}`;
      engine.learnFromOptimizationResult({
        id: 'o-merge',
        optimizationId: 'x',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0.2,
        userSatisfaction: 0.9,
        learningInsights: [],
        appliedAt: new Date(),
      });
      const c1 = engine.getPredictiveInsights().find((i) => i.id === perfId)?.confidence;
      expect(c1).toBe(0.8);
      engine.generatePredictiveInsights();
      const c2 = engine.getPredictiveInsights().find((i) => i.id === perfId)?.confidence;
      expect(c2).toBeCloseTo(0.85, 5);
    } finally {
      jest.useRealTimers();
    }
  });

  it('고정 시각에서 generatePredictiveInsights를 반복 호출하면 performance 인사이트 confidence는 0.95를 넘지 않는다', () => {
    const fixed = new Date('2024-06-01T12:00:00.000Z');
    jest.useFakeTimers();
    jest.setSystemTime(fixed);
    try {
      const storage: Pick<Storage, 'getItem' | 'setItem'> = {
        getItem: () => null,
        setItem: jest.fn(),
      };
      const engine = new AdaptiveLearningEngine({ storage });
      const perfId = `performance-${fixed.getTime()}`;
      engine.learnFromOptimizationResult({
        id: 'o-conf-cap',
        optimizationId: 'x',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0.2,
        userSatisfaction: 0.9,
        learningInsights: [],
        appliedAt: new Date(),
      });
      for (let i = 0; i < 20; i++) {
        engine.generatePredictiveInsights();
      }
      const perf = engine.getPredictiveInsights().find((i) => i.id === perfId);
      expect(perf?.confidence).toBe(0.95);
    } finally {
      jest.useRealTimers();
    }
  });

  it('고정 시각에서 generatePredictiveInsights를 반복 호출하면 resource_usage 인사이트 confidence는 0.95를 넘지 않는다', () => {
    const fixed = new Date('2024-06-01T12:00:00.000Z');
    jest.useFakeTimers();
    jest.setSystemTime(fixed);
    try {
      const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
      const row = {
        id: 'sp-cap',
        pattern: 'p',
        frequency: 0.5,
        impact: 0.75,
        confidence: 0.6,
        lastObserved: '2020-01-01T00:00:00.000Z',
        category: 'system_performance' as const,
      };
      const storage: Pick<Storage, 'getItem' | 'setItem'> = {
        getItem: (key) => (key === K.patterns ? JSON.stringify([row]) : null),
        setItem: jest.fn(),
      };
      const engine = new AdaptiveLearningEngine({ storage });
      const resId = `resource-${fixed.getTime()}`;
      for (let i = 0; i < 25; i++) {
        engine.generatePredictiveInsights();
      }
      const res = engine.getPredictiveInsights().find((i) => i.id === resId);
      expect(res?.confidence).toBe(0.95);
    } finally {
      jest.useRealTimers();
    }
  });

  it('고정 시각에서 generatePredictiveInsights를 반복 호출하면 user_behavior 인사이트 confidence는 0.95를 넘지 않는다', () => {
    const fixed = new Date('2024-06-01T12:00:00.000Z');
    jest.useFakeTimers();
    jest.setSystemTime(fixed);
    try {
      const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
      const row = {
        id: 'ub-cap',
        pattern: 'p',
        frequency: 0.6,
        impact: 0.5,
        confidence: 0.6,
        lastObserved: '2020-01-01T00:00:00.000Z',
        category: 'user_behavior' as const,
      };
      const storage: Pick<Storage, 'getItem' | 'setItem'> = {
        getItem: (key) => (key === K.patterns ? JSON.stringify([row]) : null),
        setItem: jest.fn(),
      };
      const engine = new AdaptiveLearningEngine({ storage });
      const ubId = `user-behavior-${fixed.getTime()}`;
      for (let i = 0; i < 25; i++) {
        engine.generatePredictiveInsights();
      }
      const ub = engine.getPredictiveInsights().find((i) => i.id === ubId);
      expect(ub?.confidence).toBe(0.95);
    } finally {
      jest.useRealTimers();
    }
  });

  it('대화가 모두 7일보다 오래되면 chat-activity-pattern이 생기지 않는다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const chat: Chat = {
      id: 'c-old',
      projectId: 'p1',
      name: 'n',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      messages: [
        {
          id: 'm1',
          chatId: 'c-old',
          role: 'user',
          content: 'x',
          timestamp: new Date(),
        },
      ],
    };
    const patterns = engine.learnUserBehavior([], [chat], []);

    expect(patterns.some((p) => p.id === 'chat-activity-pattern')).toBe(false);
  });

  it('대화 createdAt이 Date가 아닌 문자열이면 recent 필터에서 제외되어 chat-activity-pattern이 생기지 않는다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const chat: Chat = {
      id: 'c-str',
      projectId: 'p1',
      name: 'n',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() as unknown as Date,
      updatedAt: new Date(),
      messages: [
        {
          id: 'm1',
          chatId: 'c-str',
          role: 'user',
          content: 'x',
          timestamp: new Date(),
        },
      ],
    };
    const patterns = engine.learnUserBehavior([], [chat], []);

    expect(patterns.some((p) => p.id === 'chat-activity-pattern')).toBe(false);
  });

  it('대화 createdAt이 정확히 7일 전이면 recent 필터에서 제외되어 chat-activity-pattern이 생기지 않는다', () => {
    const fixed = new Date('2025-06-01T12:00:00.000Z');
    jest.useFakeTimers();
    jest.setSystemTime(fixed);
    try {
      const storage: Pick<Storage, 'getItem' | 'setItem'> = {
        getItem: () => null,
        setItem: jest.fn(),
      };
      const engine = new AdaptiveLearningEngine({ storage });
      const createdAt = new Date(fixed.getTime() - CAP.recentWindowMs);
      const chat: Chat = {
        id: 'c-7d',
        projectId: 'p1',
        name: 'n',
        createdAt,
        updatedAt: new Date(),
        messages: [
          {
            id: 'm1',
            chatId: 'c-7d',
            role: 'user',
            content: 'x',
            timestamp: new Date(),
          },
        ],
      };
      const patterns = engine.learnUserBehavior([], [chat], []);

      expect(patterns.some((p) => p.id === 'chat-activity-pattern')).toBe(false);
    } finally {
      jest.useRealTimers();
    }
  });

  it(`24시간 이내 메시지가 ${MP.minMessages - 1}건이면 message-pattern이 생기지 않는다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = Date.now();
    const messages: Message[] = Array.from({ length: MP.minMessages - 1 }, (_, i) => ({
      id: `m${i}`,
      chatId: 'c1',
      role: 'user',
      content: 'x'.repeat(20),
      timestamp: new Date(base - i * 60 * 1000),
    }));
    const patterns = engine.learnUserBehavior([], [], messages);

    expect(patterns.some((p) => p.id === 'message-pattern')).toBe(false);
  });

  it(`메시지 ${MP.minMessages + 2}건이지만 24시간 이내는 ${MP.minMessages - 1}건이면 message-pattern이 생기지 않는다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = Date.now();
    const within24h: Message[] = Array.from({ length: MP.minMessages - 1 }, (_, i) => ({
      id: `recent-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(12),
      timestamp: new Date(base - i * 60 * 1000),
    }));
    const older: Message[] = Array.from({ length: 3 }, (_, i) => ({
      id: `old-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'y'.repeat(12),
      timestamp: new Date(base - (MP.recentWindowMs + 2 * 60 * 60 * 1000) - i * 60 * 1000),
    }));
    const patterns = engine.learnUserBehavior([], [], [...within24h, ...older]);

    expect(patterns.some((p) => p.id === 'message-pattern')).toBe(false);
  });

  it(`메시지 ${MP.minMessages + 1}건 중 24시간 이내 ${MP.minMessages}건이면 message-pattern이 생긴다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = Date.now();
    const within24h: Message[] = Array.from({ length: MP.minMessages }, (_, i) => ({
      id: `r10-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(12),
      timestamp: new Date(base - i * 60 * 1000),
    }));
    const older: Message[] = [
      {
        id: 'old-boundary',
        chatId: 'c1',
        role: 'user' as const,
        content: 'z',
        timestamp: new Date(base - (MP.recentWindowMs + 2 * 60 * 60 * 1000)),
      },
    ];
    const patterns = engine.learnUserBehavior([], [], [...within24h, ...older]);

    expect(patterns.some((p) => p.id === 'message-pattern')).toBe(true);
  });

  it(`메시지 ${2 * MP.minMessages}건 중 24시간 이내 ${MP.minMessages}건이면 message-pattern이 생긴다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = Date.now();
    const within24h: Message[] = Array.from({ length: MP.minMessages }, (_, i) => ({
      id: `mix20-r-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(12),
      timestamp: new Date(base - i * 60 * 1000),
    }));
    const outside24h: Message[] = Array.from({ length: MP.minMessages }, (_, i) => ({
      id: `mix20-o-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'y'.repeat(12),
      timestamp: new Date(base - (MP.recentWindowMs + 6 * 60 * 60 * 1000) - i * 60 * 1000),
    }));
    const patterns = engine.learnUserBehavior([], [], [...within24h, ...outside24h]);

    expect(patterns.some((p) => p.id === 'message-pattern')).toBe(true);
  });

  it(`메시지 ${2 * MP.minMessages}건 중 24시간 이내 ${MP.minMessages - 1}건이면 message-pattern이 생기지 않는다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = Date.now();
    const within24h: Message[] = Array.from({ length: MP.minMessages - 1 }, (_, i) => ({
      id: `mix20n-r-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(12),
      timestamp: new Date(base - i * 60 * 1000),
    }));
    const outside24h: Message[] = Array.from({ length: MP.minMessages + 1 }, (_, i) => ({
      id: `mix20n-o-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'y'.repeat(12),
      timestamp: new Date(base - (MP.recentWindowMs + 6 * 60 * 60 * 1000) - i * 60 * 1000),
    }));
    const patterns = engine.learnUserBehavior([], [], [...within24h, ...outside24h]);

    expect(patterns.some((p) => p.id === 'message-pattern')).toBe(false);
  });

  it(`메시지 ${MP.minMessages}건이지만 24시간 이내·유효한 것은 ${MP.minMessages - 1}건이면 message-pattern이 생기지 않는다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = Date.now();
    const validRecent: Message[] = Array.from({ length: MP.minMessages - 1 }, (_, i) => ({
      id: `v9-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(12),
      timestamp: new Date(base - i * 60 * 1000),
    }));
    const invalidOne: Message = {
      id: 'v9-invalid',
      chatId: 'c1',
      role: 'user',
      content: 'x',
      timestamp: 'not-a-date' as unknown as Date,
    };
    const patterns = engine.learnUserBehavior([], [], [...validRecent, invalidOne]);

    expect(patterns.some((p) => p.id === 'message-pattern')).toBe(false);
  });

  it(`메시지 ${MP.minMessages}건이지만 timestamp가 Invalid Date인 1건이 있으면 message-pattern이 생기지 않는다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = Date.now();
    const validRecent: Message[] = Array.from({ length: MP.minMessages - 1 }, (_, i) => ({
      id: `id9-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(12),
      timestamp: new Date(base - i * 60 * 1000),
    }));
    const invalidDate: Message = {
      id: 'id9-invalid-date',
      chatId: 'c1',
      role: 'user',
      content: 'x',
      timestamp: new Date(NaN),
    };
    const patterns = engine.learnUserBehavior([], [], [...validRecent, invalidDate]);

    expect(patterns.some((p) => p.id === 'message-pattern')).toBe(false);
  });

  it(`메시지 ${MP.minMessages}건의 timestamp가 모두 유효하지 않은 문자열이면 recent 필터에서 제외되어 message-pattern이 생기지 않는다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const messages: Message[] = Array.from({ length: MP.minMessages }, (_, i) => ({
      id: `inv-ts-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(12),
      timestamp: 'not-a-date' as unknown as Date,
    }));
    const patterns = engine.learnUserBehavior([], [], messages);

    expect(patterns.some((p) => p.id === 'message-pattern')).toBe(false);
  });

  it(`메시지 ${MP.minMessages}건의 timestamp가 정확히 24시간 전이면 recent 필터에서 제외되어 message-pattern이 생기지 않는다`, () => {
    const fixed = new Date('2025-06-01T12:00:00.000Z');
    jest.useFakeTimers();
    jest.setSystemTime(fixed);
    try {
      const storage: Pick<Storage, 'getItem' | 'setItem'> = {
        getItem: () => null,
        setItem: jest.fn(),
      };
      const engine = new AdaptiveLearningEngine({ storage });
      const ts = new Date(fixed.getTime() - MP.recentWindowMs);
      const messages: Message[] = Array.from({ length: MP.minMessages }, (_, i) => ({
        id: `m-24h-${i}`,
        chatId: 'c1',
        role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
        content: 'x'.repeat(10),
        timestamp: ts,
      }));
      const patterns = engine.learnUserBehavior([], [], messages);

      expect(patterns.some((p) => p.id === 'message-pattern')).toBe(false);
    } finally {
      jest.useRealTimers();
    }
  });

  it('패턴 10건·최적화 5건·신뢰도 충분·모델 최신이면 리포트 권장 배열이 비어 있다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const patterns = Array.from({ length: 10 }, (_, i) => ({
      id: `bulk-p-${i}`,
      pattern: 'x',
      frequency: 0.3,
      impact: 0.5,
      confidence: 0.6,
      lastObserved: '2020-01-01T00:00:00.000Z',
      category: 'user_behavior' as const,
    }));
    const opts = Array.from({ length: 5 }, (_, i) => ({
      id: `bulk-o-${i}`,
      optimizationId: `ox-${i}`,
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.05,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date().toISOString(),
    }));
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => {
        if (key === K.patterns) return JSON.stringify(patterns);
        if (key === K.optimizationResults) return JSON.stringify(opts);
        return null;
      },
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as { recommendations: string[] };

    expect(report.recommendations).toEqual([]);
  });

  it('패턴 9건·최적화 5건·신뢰도·모델 최신이면 학습 데이터 권장만 있고 최적화 수집 권장은 없다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const patterns = Array.from({ length: 9 }, (_, i) => ({
      id: `nine-p-${i}`,
      pattern: 'x',
      frequency: 0.3,
      impact: 0.5,
      confidence: 0.6,
      lastObserved: '2020-01-01T00:00:00.000Z',
      category: 'user_behavior' as const,
    }));
    const opts = Array.from({ length: 5 }, (_, i) => ({
      id: `five-o-${i}`,
      optimizationId: `ox-${i}`,
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.05,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date().toISOString(),
    }));
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => {
        if (key === K.patterns) return JSON.stringify(patterns);
        if (key === K.optimizationResults) return JSON.stringify(opts);
        return null;
      },
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as { recommendations: string[] };

    expect(report.recommendations.some((r) => r.includes('학습 데이터'))).toBe(true);
    expect(report.recommendations.some((r) => r.includes('최적화 결과를 더 많이'))).toBe(false);
  });

  it('패턴 10건·최적화 4건·신뢰도·모델 최신이면 최적화 수집 권장만 있고 학습 데이터 권장은 없다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const patterns = Array.from({ length: 10 }, (_, i) => ({
      id: `ten-p-${i}`,
      pattern: 'x',
      frequency: 0.3,
      impact: 0.5,
      confidence: 0.6,
      lastObserved: '2020-01-01T00:00:00.000Z',
      category: 'user_behavior' as const,
    }));
    const opts = Array.from({ length: 4 }, (_, i) => ({
      id: `four-o-${i}`,
      optimizationId: `ox-${i}`,
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.05,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date().toISOString(),
    }));
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => {
        if (key === K.patterns) return JSON.stringify(patterns);
        if (key === K.optimizationResults) return JSON.stringify(opts);
        return null;
      },
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as { recommendations: string[] };

    expect(report.recommendations.some((r) => r.includes('최적화 결과를 더 많이'))).toBe(true);
    expect(report.recommendations.some((r) => r.includes('학습 데이터'))).toBe(false);
  });

  it(`24시간 이내 메시지 ${MP.minMessages}건이 모두 user이면 message-pattern에 응답시간 0.0분이 포함된다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = Date.now();
    const messages: Message[] = Array.from({ length: MP.minMessages }, (_, i) => ({
      id: `mu${i}`,
      chatId: 'c1',
      role: 'user',
      content: 'x'.repeat(15),
      timestamp: new Date(base - (MP.minMessages - i) * 60 * 1000),
    }));
    const patterns = engine.learnUserBehavior([], [], messages);
    const mp = patterns.find((p) => p.id === 'message-pattern');

    expect(mp).toBeDefined();
    expect(mp!.pattern).toContain('0.0분');
  });

  it(`24시간 이내 메시지 ${MP.minMessages}건의 content가 모두 빈 문자열이면 message-pattern에 평균 길이 0자가 포함된다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = Date.now();
    const messages: Message[] = Array.from({ length: MP.minMessages }, (_, i) => ({
      id: `mt-empty-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: '',
      timestamp: new Date(base - (MP.minMessages - i) * 60 * 1000),
    }));
    const patterns = engine.learnUserBehavior([], [], messages);
    const mp = patterns.find((p) => p.id === 'message-pattern');

    expect(mp).toBeDefined();
    expect(mp!.pattern).toContain('0자');
  });

  it('최근 프로젝트가 2건이면 project-creation-pattern이 생기지 않는다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = [
      {
        id: 'p1',
        name: 'a',
        description: '',
        createdAt: daysAgo(5),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
      {
        id: 'p2',
        name: 'b',
        description: '',
        createdAt: daysAgo(3),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
    ];
    const patterns = engine.learnUserBehavior(projects, [], []);

    expect(patterns.some((p) => p.id === 'project-creation-pattern')).toBe(false);
  });

  it('7일 이내 대화이지만 messages가 비어 있으면 chat-activity-pattern에 활동률 0.0%가 포함된다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const chat: Chat = {
      id: 'c-empty',
      projectId: 'p1',
      name: 'n',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      messages: [],
    };
    const patterns = engine.learnUserBehavior([], [chat], []);
    const cap = patterns.find((p) => p.id === 'chat-activity-pattern');

    expect(cap).toBeDefined();
    expect(cap!.pattern).toContain('0.0%');
  });

  it('7일 이내 대화에 chat.messages만 있고 전역 messages가 비어 있으면 chat-activity-pattern에 대화당 평균 0.0개 메시지가 포함된다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const recent = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const embedded: Message = {
      id: 'emb1',
      chatId: 'c1',
      role: 'user',
      content: 'x',
      timestamp: new Date(),
    };
    const chat: Chat = {
      id: 'c1',
      projectId: 'p1',
      name: 'n',
      createdAt: recent,
      updatedAt: new Date(),
      messages: [embedded],
    };
    const patterns = engine.learnUserBehavior([], [chat], []);
    const cap = patterns.find((p) => p.id === 'chat-activity-pattern');

    expect(cap).toBeDefined();
    expect(cap!.pattern).toContain('0.0개');
  });

  it('7일 이내 대화 2건·전역 messages 4건이면 chat-activity-pattern에 대화당 평균 2.0개 메시지가 포함된다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const recent = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const mkMsg = (id: string, chatId: string): Message => ({
      id,
      chatId,
      role: 'user',
      content: 'hi',
      timestamp: new Date(),
    });
    const chats: Chat[] = [
      {
        id: 'ca',
        projectId: 'p1',
        name: 'a',
        createdAt: recent,
        updatedAt: new Date(),
        messages: [],
      },
      {
        id: 'cb',
        projectId: 'p1',
        name: 'b',
        createdAt: recent,
        updatedAt: new Date(),
        messages: [],
      },
    ];
    const messages: Message[] = [
      mkMsg('g1', 'ca'),
      mkMsg('g2', 'ca'),
      mkMsg('g3', 'cb'),
      mkMsg('g4', 'cb'),
    ];
    const patterns = engine.learnUserBehavior([], chats, messages);
    const cap = patterns.find((p) => p.id === 'chat-activity-pattern');

    expect(cap).toBeDefined();
    expect(cap!.pattern).toContain('2.0개');
  });

  it('retrainModels를 두 번 호출하면 modelVersion이 0.2 증가한다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    try {
      const v0 = engine.getModelVersion();
      engine.retrainModels();
      engine.retrainModels();
      expect(engine.getModelVersion()).toBeCloseTo(v0 + 0.2, 5);
    } finally {
      randomSpy.mockRestore();
    }
  });

  it('retrainModels에서 Math.random이 0이면 accuracy·performanceMetrics 수치는 변하지 않는다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const before = engine.getAdaptiveModels().map((m) => ({
      accuracy: m.accuracy,
      precision: m.performanceMetrics.precision,
      recall: m.performanceMetrics.recall,
      f1Score: m.performanceMetrics.f1Score,
    }));
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    try {
      engine.retrainModels();
    } finally {
      randomSpy.mockRestore();
    }
    const after = engine.getAdaptiveModels();
    before.forEach((b, i) => {
      expect(after[i].accuracy).toBe(b.accuracy);
      expect(after[i].performanceMetrics.precision).toBe(b.precision);
      expect(after[i].performanceMetrics.recall).toBe(b.recall);
      expect(after[i].performanceMetrics.f1Score).toBe(b.f1Score);
    });
  });

  it('retrainModels 후 각 모델 performanceMetrics.auc는 재훈련 전과 같다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const beforeAuc = engine.getAdaptiveModels().map((m) => m.performanceMetrics.auc);
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.4);
    try {
      engine.retrainModels();
    } finally {
      randomSpy.mockRestore();
    }
    expect(engine.getAdaptiveModels().map((m) => m.performanceMetrics.auc)).toEqual(beforeAuc);
  });

  it('retrainModels 한 번(Math.random 0) 후 generateLearningReport.summary.modelVersion은 1.1이다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    try {
      engine.retrainModels();
    } finally {
      randomSpy.mockRestore();
    }
    const report = engine.generateLearningReport() as { summary: { modelVersion: string } };

    expect(report.summary.modelVersion).toBe('1.1');
  });

  it('retrainModels를 두 번(Math.random 0) 호출 후 generateLearningReport.summary.modelVersion은 1.2다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    try {
      engine.retrainModels();
      engine.retrainModels();
    } finally {
      randomSpy.mockRestore();
    }
    const report = engine.generateLearningReport() as { summary: { modelVersion: string } };

    expect(report.summary.modelVersion).toBe('1.2');
  });

  it('retrainModels에서 Math.random이 1이면 improvement가 0.05로 accuracy·precision·recall·f1에 반영된다(상한 적용)', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(1);
    try {
      engine.retrainModels();
    } finally {
      randomSpy.mockRestore();
    }
    const models = engine.getAdaptiveModels();
    expect(models[0].accuracy).toBeCloseTo(0.9, 5);
    expect(models[0].performanceMetrics.precision).toBeCloseTo(0.87, 5);
    expect(models[0].performanceMetrics.recall).toBeCloseTo(0.93, 5);
    expect(models[0].performanceMetrics.f1Score).toBeCloseTo(0.9, 5);

    expect(models[1].accuracy).toBeCloseTo(0.83, 5);
    expect(models[1].performanceMetrics.precision).toBeCloseTo(0.8, 5);
    expect(models[1].performanceMetrics.recall).toBeCloseTo(0.86, 5);
    expect(models[1].performanceMetrics.f1Score).toBeCloseTo(0.83, 5);

    expect(models[2].accuracy).toBeCloseTo(0.97, 5);
    expect(models[2].performanceMetrics.precision).toBe(0.95);
    expect(models[2].performanceMetrics.recall).toBe(0.95);
    expect(models[2].performanceMetrics.f1Score).toBe(0.95);
  });

  it('retrainModels 한 번(Math.random 1) 후 generateLearningReport.summary.avgModelAccuracy는 0.9다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(1);
    try {
      engine.retrainModels();
    } finally {
      randomSpy.mockRestore();
    }
    const report = engine.generateLearningReport() as { summary: { avgModelAccuracy: number } };

    expect(report.summary.avgModelAccuracy).toBe(0.9);
  });

  it('learnFromOptimizationResult(improvement>0)를 반복하면 optimization-recommendation-model trainingDataSize가 누적된다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const model = engine.getAdaptiveModels().find((m) => m.id === 'optimization-recommendation-model');
    expect(model).toBeDefined();
    const t0 = model!.trainingDataSize;
    for (let i = 0; i < 3; i += 1) {
      engine.learnFromOptimizationResult({
        id: `o-ts-${i}`,
        optimizationId: 'x',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0.02,
        userSatisfaction: 0.9,
        learningInsights: [],
        appliedAt: new Date(),
      });
    }
    expect(model!.trainingDataSize).toBe(t0 + 3);
  });

  it('optimization-recommendation-model은 accuracy·precision이 상한에 도달하면 learn해도 더 오르지 않는다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const model = engine.getAdaptiveModels().find((m) => m.id === 'optimization-recommendation-model');
    expect(model).toBeDefined();
    model!.accuracy = 0.98;
    model!.performanceMetrics.precision = 0.95;
    model!.performanceMetrics.recall = 0.95;
    model!.performanceMetrics.f1Score = 0.95;

    engine.learnFromOptimizationResult({
      id: 'o-cap',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });

    expect(model!.accuracy).toBe(0.98);
    expect(model!.performanceMetrics.precision).toBe(0.95);
    expect(model!.performanceMetrics.recall).toBe(0.95);
    expect(model!.performanceMetrics.f1Score).toBe(0.95);
  });

  it('learnFromOptimizationResult(improvement>0)를 초기 상태에서 6회 반복하면 optimization-recommendation-model accuracy는 0.98이다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    for (let i = 0; i < 6; i++) {
      engine.learnFromOptimizationResult({
        id: `o-acc6-${i}`,
        optimizationId: 'x',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0.1,
        userSatisfaction: 0.9,
        learningInsights: [],
        appliedAt: new Date(),
      });
    }
    const m = engine.getAdaptiveModels().find((x) => x.id === 'optimization-recommendation-model')!;

    expect(m.accuracy).toBe(0.98);
    expect(m.trainingDataSize).toBe(1206);
    expect(engine.getOptimizationResults()).toHaveLength(6);
  });

  it('learnFromOptimizationResult(improvement>0)를 초기 상태에서 10회 반복하면 optimization-recommendation-model precision·recall·f1Score는 0.95다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    for (let i = 0; i < 10; i++) {
      engine.learnFromOptimizationResult({
        id: `o-m10-${i}`,
        optimizationId: 'x',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0.1,
        userSatisfaction: 0.9,
        learningInsights: [],
        appliedAt: new Date(),
      });
    }
    const m = engine.getAdaptiveModels().find((x) => x.id === 'optimization-recommendation-model')!;

    expect(m.performanceMetrics.precision).toBe(0.95);
    expect(m.performanceMetrics.recall).toBe(0.95);
    expect(m.performanceMetrics.f1Score).toBe(0.95);
    expect(m.trainingDataSize).toBe(1210);
    expect(engine.getOptimizationResults()).toHaveLength(10);
    expect(
      (engine.generateLearningReport() as { summary: { totalOptimizations: number } }).summary.totalOptimizations,
    ).toBe(10);
  });

  it('프로젝트 3건이 모두 30일보다 오래되면 project-creation-pattern이 생기지 않는다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const mk = (id: string, d: number): Project => ({
      id,
      name: id,
      description: '',
      createdAt: daysAgo(d),
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation',
      status: 'active',
      chats: [],
    });
    const patterns = engine.learnUserBehavior([mk('a', 40), mk('b', 35), mk('c', 32)], [], []);

    expect(patterns.some((p) => p.id === 'project-creation-pattern')).toBe(false);
  });

  it('프로젝트 3건의 createdAt이 모두 정확히 30일 전이면 recent 필터에서 모두 제외되어 project-creation-pattern이 생기지 않는다', () => {
    const fixed = new Date('2025-06-01T12:00:00.000Z');
    jest.useFakeTimers();
    jest.setSystemTime(fixed);
    try {
      const storage: Pick<Storage, 'getItem' | 'setItem'> = {
        getItem: () => null,
        setItem: jest.fn(),
      };
      const engine = new AdaptiveLearningEngine({ storage });
      const createdAt = new Date(fixed.getTime() - PCP.recentWindowMs);
      const mk = (id: string): Project => ({
        id,
        name: id,
        description: '',
        createdAt,
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      });
      const patterns = engine.learnUserBehavior([mk('a'), mk('b'), mk('c')], [], []);

      expect(patterns.some((p) => p.id === 'project-creation-pattern')).toBe(false);
    } finally {
      jest.useRealTimers();
    }
  });

  it('프로젝트 3건 중 1건만 30일을 넘기면 project-creation-pattern frequency는 30일 이내 2건만 반영한다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const mk = (id: string, createdAt: Date): Project => ({
      id,
      name: id,
      description: '',
      createdAt,
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation',
      status: 'active',
      chats: [],
    });
    const patterns = engine.learnUserBehavior(
      [mk('old', daysAgo(40)), mk('r1', daysAgo(5)), mk('r2', daysAgo(3))],
      [],
      [],
    );
    const p = patterns.find((x) => x.id === 'project-creation-pattern');

    expect(p).toBeDefined();
    expect(p!.frequency).toBeCloseTo(2 / PCP.frequencyWindowDays, 5);
  });

  it('프로젝트 createdAt이 Date가 아닌 문자열이면 recent 필터에서 제외되고 project-creation-pattern frequency는 2/30이다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const mk = (id: string, createdAt: Date): Project => ({
      id,
      name: id,
      description: '',
      createdAt,
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation',
      status: 'active',
      chats: [],
    });
    const patterns = engine.learnUserBehavior(
      [
        {
          id: 'str',
          name: 'str',
          description: '',
          createdAt: daysAgo(5).toISOString() as unknown as Date,
          updatedAt: new Date(),
          files: [],
          instructions: '',
          tags: [],
          isActive: true,
          type: 'conversation',
          status: 'active',
          chats: [],
        },
        mk('r1', daysAgo(5)),
        mk('r2', daysAgo(3)),
      ],
      [],
      [],
    );
    const p = patterns.find((x) => x.id === 'project-creation-pattern');

    expect(p).toBeDefined();
    expect(p!.frequency).toBeCloseTo(2 / PCP.frequencyWindowDays, 5);
  });

  it('generateLearningReport.recentActivity.avgImprovement는 저장된 최적화 improvement 평균을 반영한다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const opts = [
      {
        id: 'avg-a',
        optimizationId: 'x',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0.2,
        userSatisfaction: 0.9,
        learningInsights: [],
        appliedAt: new Date().toISOString(),
      },
      {
        id: 'avg-b',
        optimizationId: 'y',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0.4,
        userSatisfaction: 0.9,
        learningInsights: [],
        appliedAt: new Date().toISOString(),
      },
    ];
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.optimizationResults ? JSON.stringify(opts) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as {
      recentActivity: { avgImprovement: number };
    };

    expect(report.recentActivity.avgImprovement).toBe(0.3);
  });

  it('generateLearningReport.recentActivity.avgImprovement는 음수 improvement만 있을 때 평균을 반영한다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const opts = [
      {
        id: 'avg-neg',
        optimizationId: 'x',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: -0.15,
        userSatisfaction: 0.5,
        learningInsights: [],
        appliedAt: new Date().toISOString(),
      },
    ];
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.optimizationResults ? JSON.stringify(opts) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as {
      recentActivity: { avgImprovement: number };
    };

    expect(report.recentActivity.avgImprovement).toBe(-0.15);
  });

  it('generateLearningReport.recentActivity.avgImprovement는 양수·음수 improvement 혼합의 평균을 반영한다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const opts = [
      {
        id: 'avg-m1',
        optimizationId: 'a',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0.12,
        userSatisfaction: 0.9,
        learningInsights: [],
        appliedAt: new Date().toISOString(),
      },
      {
        id: 'avg-m2',
        optimizationId: 'b',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: -0.08,
        userSatisfaction: 0.5,
        learningInsights: [],
        appliedAt: new Date().toISOString(),
      },
    ];
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.optimizationResults ? JSON.stringify(opts) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as {
      recentActivity: { avgImprovement: number };
    };

    expect(report.recentActivity.avgImprovement).toBe(0.02);
  });

  it('generateLearningReport.categoryBreakdown이 서로 다른 category 패턴을 각각 센다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const rows = [
      {
        id: 'ub1',
        pattern: 'a',
        frequency: 0.3,
        impact: 0.5,
        confidence: 0.6,
        lastObserved: '2020-01-01T00:00:00.000Z',
        category: 'user_behavior' as const,
      },
      {
        id: 'sp1',
        pattern: 'b',
        frequency: 0.3,
        impact: 0.5,
        confidence: 0.6,
        lastObserved: '2020-01-01T00:00:00.000Z',
        category: 'system_performance' as const,
      },
    ];
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify(rows) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as {
      categoryBreakdown: Record<string, number>;
    };

    expect(report.categoryBreakdown.user_behavior).toBe(1);
    expect(report.categoryBreakdown.system_performance).toBe(1);
  });

  it('user→assistant 쌍마다 2분 간격이면 message-pattern 응답시간 평균이 2.0분이다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = Date.now();
    const messages: Message[] = [];
    for (let i = 0; i < 5; i += 1) {
      const userT = new Date(base - (20 - 2 * i) * 60 * 1000);
      const asstT = new Date(userT.getTime() + 2 * 60 * 1000);
      messages.push({
        id: `u${i}`,
        chatId: 'c1',
        role: 'user',
        content: '질문',
        timestamp: userT,
      });
      messages.push({
        id: `a${i}`,
        chatId: 'c1',
        role: 'assistant',
        content: '답변',
        timestamp: asstT,
      });
    }
    const patterns = engine.learnUserBehavior([], [], messages);
    const mp = patterns.find((p) => p.id === 'message-pattern');

    expect(mp).toBeDefined();
    expect(mp!.pattern).toContain('2.0분');
  });

  it('learnUserBehavior: 배열이 최신 대화부터 나열되어도 message-pattern 응답시간은 타임스탬프 기준 시간순 평균이다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = Date.now();
    const forward: Message[] = [];
    for (let i = 0; i < 5; i += 1) {
      const userT = new Date(base - (50 - 10 * i) * 60 * 1000);
      const asstT = new Date(userT.getTime() + 3 * 60 * 1000);
      forward.push(
        { id: `ord-u${i}`, chatId: 'c1', role: 'user', content: 'q', timestamp: userT },
        { id: `ord-a${i}`, chatId: 'c1', role: 'assistant', content: 'a', timestamp: asstT },
      );
    }
    const messages = forward.slice().reverse();
    const patterns = engine.learnUserBehavior([], [], messages);
    const mp = patterns.find((p) => p.id === 'message-pattern');

    expect(mp).toBeDefined();
    expect(mp!.pattern).toContain('3.0분');
  });

  it(`메시지 ${MP.minMessages}건의 timestamp가 ISO 문자열이어도 message-pattern을 만든다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = Date.now();
    const messages: Message[] = Array.from({ length: MP.minMessages }, (_, i) => ({
      id: `iso${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(12),
      timestamp: new Date(base - (MP.minMessages - i) * 60 * 1000).toISOString() as unknown as Date,
    }));
    const patterns = engine.learnUserBehavior([], [], messages);

    expect(patterns.some((p) => p.id === 'message-pattern')).toBe(true);
  });

  it('빈 저장소 엔진의 generateLearningReport는 totalOptimizations 0·avgImprovement 0·modelVersion 1.0이다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as {
      summary: {
        totalPatterns: number;
        totalOptimizations: number;
        totalInsights: number;
        modelVersion: string;
        avgModelAccuracy: number;
      };
      recentActivity: { avgImprovement: number; activeModels: number };
    };

    expect(report.summary.totalPatterns).toBe(0);
    expect(report.summary.totalOptimizations).toBe(0);
    expect(report.summary.totalInsights).toBe(0);
    expect(report.summary.modelVersion).toBe('1.0');
    expect(typeof report.summary.avgModelAccuracy).toBe('number');
    expect(report.recentActivity.avgImprovement).toBe(0);
    expect(report.recentActivity.activeModels).toBe(3);
  });

  it('대화 2건·전달 messages 4건이면 chat-activity-pattern에 대화당 평균 2.0개 메시지가 포함된다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const recent = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const chats: Chat[] = [
      { id: 'c1', projectId: 'p1', name: 'a', createdAt: recent, updatedAt: new Date(), messages: [] },
      { id: 'c2', projectId: 'p1', name: 'b', createdAt: recent, updatedAt: new Date(), messages: [] },
    ];
    const messages: Message[] = Array.from({ length: 4 }, (_, i) => ({
      id: `mm${i}`,
      chatId: 'c1',
      role: 'user',
      content: 'x',
      timestamp: new Date(),
    }));
    const patterns = engine.learnUserBehavior([], chats, messages);
    const cap = patterns.find((p) => p.id === 'chat-activity-pattern');

    expect(cap).toBeDefined();
    expect(cap!.pattern).toContain('2.0개 메시지');
  });

  it(`메시지 ${MP.minMessages}건이 모두 24시간보다 오래되면 message-pattern이 생기지 않는다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const oldBase = Date.now() - (MP.recentWindowMs + 2 * 60 * 60 * 1000);
    const messages: Message[] = Array.from({ length: MP.minMessages }, (_, i) => ({
      id: `oldm${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(10),
      timestamp: new Date(oldBase - i * 60 * 1000),
    }));
    const patterns = engine.learnUserBehavior([], [], messages);

    expect(patterns.some((p) => p.id === 'message-pattern')).toBe(false);
  });

  it('learnFromOptimizationResult를 연속 호출하면 getOptimizationResults 길이가 누적된다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const mk = (id: string) => ({
      id,
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [] as string[],
      appliedAt: new Date(),
    });
    expect(engine.getOptimizationResults()).toHaveLength(0);
    engine.learnFromOptimizationResult(mk('o1'));
    engine.learnFromOptimizationResult(mk('o2'));
    engine.learnFromOptimizationResult(mk('o3'));
    expect(engine.getOptimizationResults()).toHaveLength(3);
    expect(engine.getOptimizationResults().map((r) => r.id)).toEqual(['o1', 'o2', 'o3']);
  });

  it('generateLearningReport.categoryBreakdown에 optimization_effect 패턴이 반영된다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const row = {
      id: 'opt-eff',
      pattern: 'o',
      frequency: 0.2,
      impact: 0.5,
      confidence: 0.6,
      lastObserved: '2020-01-01T00:00:00.000Z',
      category: 'optimization_effect' as const,
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify([row]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as { categoryBreakdown: Record<string, number> };

    expect(report.categoryBreakdown.optimization_effect).toBe(1);
  });

  it('user_behavior 패턴 평균 frequency가 정확히 0.5이면 인사이트는 감소 추세다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const rows = [
      {
        id: 'ub-a',
        pattern: 'a',
        frequency: 0.25,
        impact: 0.5,
        confidence: 0.6,
        lastObserved: '2020-01-01T00:00:00.000Z',
        category: 'user_behavior' as const,
      },
      {
        id: 'ub-b',
        pattern: 'b',
        frequency: 0.75,
        impact: 0.5,
        confidence: 0.6,
        lastObserved: '2020-01-01T00:00:00.000Z',
        category: 'user_behavior' as const,
      },
    ];
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify(rows) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const ub = engine.getPredictiveInsights().find((i) => i.category === 'user_behavior');

    expect(ub?.insight).toContain('감소');
    expect(ub?.dataPoints).toBe(2);
  });

  it('generateLearningReport.categoryBreakdown에 error_pattern 패턴이 반영된다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const row = {
      id: 'err-pat',
      pattern: 'e',
      frequency: 0.1,
      impact: 0.3,
      confidence: 0.55,
      lastObserved: '2020-01-01T00:00:00.000Z',
      category: 'error_pattern' as const,
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify([row]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as { categoryBreakdown: Record<string, number> };

    expect(report.categoryBreakdown.error_pattern).toBe(1);
  });

  it('최근 최적화 improvement 평균이 정확히 0.1이면 performance 인사이트는 저하 추세다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const opts = [
      {
        id: 'b1',
        optimizationId: 'x',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0.1,
        userSatisfaction: 0.9,
        learningInsights: [],
        appliedAt: new Date().toISOString(),
      },
      {
        id: 'b2',
        optimizationId: 'y',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0.1,
        userSatisfaction: 0.9,
        learningInsights: [],
        appliedAt: new Date().toISOString(),
      },
    ];
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.optimizationResults ? JSON.stringify(opts) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const perf = engine.getPredictiveInsights().find((i) => i.category === 'performance');

    expect(perf?.insight).toContain('저하');
  });

  it('최근 최적화 improvement 평균이 0.1을 넘으면 performance 인사이트는 개선 추세다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const opts = [
      {
        id: 'c1',
        optimizationId: 'x',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0.11,
        userSatisfaction: 0.9,
        learningInsights: [],
        appliedAt: new Date().toISOString(),
      },
      {
        id: 'c2',
        optimizationId: 'y',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0.11,
        userSatisfaction: 0.9,
        learningInsights: [],
        appliedAt: new Date().toISOString(),
      },
    ];
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.optimizationResults ? JSON.stringify(opts) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const perf = engine.getPredictiveInsights().find((i) => i.category === 'performance');

    expect(perf?.insight).toContain('개선');
  });

  it('generateLearningReport.recentOptimizations는 7일 이내 항목만 센다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const opts = [
      {
        id: 'r1',
        optimizationId: 'x',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0.05,
        userSatisfaction: 0.9,
        learningInsights: [],
        appliedAt: new Date().toISOString(),
      },
      {
        id: 'r2',
        optimizationId: 'y',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0.05,
        userSatisfaction: 0.9,
        learningInsights: [],
        appliedAt: new Date().toISOString(),
      },
      {
        id: 'r-old',
        optimizationId: 'z',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0.2,
        userSatisfaction: 0.9,
        learningInsights: [],
        appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.optimizationResults ? JSON.stringify(opts) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as {
      summary: { totalOptimizations: number };
      recentActivity: { recentOptimizations: number };
    };

    expect(report.summary.totalOptimizations).toBe(3);
    expect(report.recentActivity.recentOptimizations).toBe(2);
  });

  it('user_behavior 패턴 평균 frequency가 0.5보다 크면 인사이트는 증가 추세다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const rows = [
      {
        id: 'ub-h1',
        pattern: 'a',
        frequency: 0.55,
        impact: 0.5,
        confidence: 0.6,
        lastObserved: '2020-01-01T00:00:00.000Z',
        category: 'user_behavior' as const,
      },
      {
        id: 'ub-h2',
        pattern: 'b',
        frequency: 0.65,
        impact: 0.5,
        confidence: 0.6,
        lastObserved: '2020-01-01T00:00:00.000Z',
        category: 'user_behavior' as const,
      },
    ];
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify(rows) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const ub = engine.getPredictiveInsights().find((i) => i.category === 'user_behavior');

    expect(ub?.insight).toContain('증가');
  });

  it('learnUserBehavior 한 호출로 project·chat·message 패턴을 동시에 만들 수 있다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = [
      {
        id: 'cpa',
        name: 'a',
        description: '',
        createdAt: daysAgo(5),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
      {
        id: 'cpb',
        name: 'b',
        description: '',
        createdAt: daysAgo(4),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
      {
        id: 'cpc',
        name: 'c',
        description: '',
        createdAt: daysAgo(3),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
    ];
    const recentChat = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const msgInChat: Message = {
      id: 'm-in-chat',
      chatId: 'c-comb',
      role: 'user',
      content: 'hi',
      timestamp: new Date(),
    };
    const chats: Chat[] = [
      {
        id: 'c-comb',
        projectId: 'cpa',
        name: 'n',
        createdAt: recentChat,
        updatedAt: new Date(),
        messages: [msgInChat],
      },
    ];
    const base = Date.now();
    const messages: Message[] = Array.from({ length: MP.minMessages }, (_, i) => ({
      id: `comb${i}`,
      chatId: 'c-comb',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(20),
      timestamp: new Date(base - (MP.minMessages - i) * 60 * 1000),
    }));
    const patterns = engine.learnUserBehavior(projects, chats, messages);
    const ids = patterns.map((p) => p.id);

    expect(ids).toContain('project-creation-pattern');
    expect(ids).toContain('chat-activity-pattern');
    expect(ids).toContain('message-pattern');
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('performance 인사이트 문구에 평균 개선도 퍼센트가 포함된다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const opts = [
      {
        id: 'pct1',
        optimizationId: 'x',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0.15,
        userSatisfaction: 0.9,
        learningInsights: [],
        appliedAt: new Date().toISOString(),
      },
    ];
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.optimizationResults ? JSON.stringify(opts) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const perf = engine.getPredictiveInsights().find((i) => i.category === 'performance');

    expect(perf?.insight).toContain('15.0%');
  });

  it('retrainModels 한 번 호출 후 모든 모델 version 문자열이 1.1이다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    try {
      engine.retrainModels();
      expect(engine.getAdaptiveModels().every((m) => m.version === '1.1')).toBe(true);
    } finally {
      randomSpy.mockRestore();
    }
  });

  it('같은 category 패턴이 2건이면 categoryBreakdown에 누적된다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const rows = [
      {
        id: 'ub-x1',
        pattern: 'a',
        frequency: 0.3,
        impact: 0.5,
        confidence: 0.6,
        lastObserved: '2020-01-01T00:00:00.000Z',
        category: 'user_behavior' as const,
      },
      {
        id: 'ub-x2',
        pattern: 'b',
        frequency: 0.4,
        impact: 0.5,
        confidence: 0.6,
        lastObserved: '2020-01-01T00:00:00.000Z',
        category: 'user_behavior' as const,
      },
    ];
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify(rows) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as { categoryBreakdown: Record<string, number> };

    expect(report.categoryBreakdown.user_behavior).toBe(2);
  });

  it('user_behavior 증가 추세 인사이트의 첫 권장은 서버 리소스 사전 확장이다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const row = {
      id: 'ub-rec-up',
      pattern: 'p',
      frequency: 0.8,
      impact: 0.5,
      confidence: 0.6,
      lastObserved: '2020-01-01T00:00:00.000Z',
      category: 'user_behavior' as const,
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify([row]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const ub = engine.getPredictiveInsights().find((i) => i.category === 'user_behavior');

    expect(ub?.recommendations[0]).toBe('서버 리소스 사전 확장');
  });

  it('user_behavior 감소 추세 인사이트의 첫 권장은 불필요한 리소스 정리다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const row = {
      id: 'ub-rec-down',
      pattern: 'p',
      frequency: 0.2,
      impact: 0.5,
      confidence: 0.6,
      lastObserved: '2020-01-01T00:00:00.000Z',
      category: 'user_behavior' as const,
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify([row]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const ub = engine.getPredictiveInsights().find((i) => i.category === 'user_behavior');

    expect(ub?.recommendations[0]).toBe('불필요한 리소스 정리');
  });

  it('generateLearningReport.summary.lastUpdated는 Date 인스턴스다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as { summary: { lastUpdated: unknown } };

    expect(report.summary.lastUpdated).toBeInstanceOf(Date);
  });

  it('project-creation-pattern confidence가 0.95일 때 병합해도 confidence는 0.95를 넘지 않는다', () => {
    const store = new Map<string, string>();
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const existing = {
      id: 'project-creation-pattern',
      pattern: 'old',
      frequency: 0.15,
      impact: PCP.impact,
      confidence: 0.95,
      lastObserved: new Date().toISOString(),
      category: 'user_behavior' as const,
    };
    store.set(K.patterns, JSON.stringify([existing]));
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, v) => {
        store.set(key, v);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = [
      {
        id: 'm1',
        name: 'a',
        description: '',
        createdAt: daysAgo(5),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
      {
        id: 'm2',
        name: 'b',
        description: '',
        createdAt: daysAgo(4),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
      {
        id: 'm3',
        name: 'c',
        description: '',
        createdAt: daysAgo(3),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      },
    ];
    engine.learnUserBehavior(projects, [], []);
    const p = engine.getLearningPatterns().find((x) => x.id === 'project-creation-pattern');

    expect(p?.confidence).toBe(0.95);
  });

  it('resource_usage 인사이트의 첫 권장은 리소스 사용량 실시간 모니터링이다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const row = {
      id: 'sp-rec',
      pattern: 'p',
      frequency: 0.5,
      impact: 0.75,
      confidence: 0.6,
      lastObserved: '2020-01-01T00:00:00.000Z',
      category: 'system_performance' as const,
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify([row]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const res = engine.getPredictiveInsights().find((i) => i.category === 'resource_usage');

    expect(res?.recommendations[0]).toBe('리소스 사용량 실시간 모니터링');
  });

  it('performance 인사이트의 첫 권장은 성능 병목 지점 분석이다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const opts = [
      {
        id: 'pr1',
        optimizationId: 'x',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0.12,
        userSatisfaction: 0.9,
        learningInsights: [],
        appliedAt: new Date().toISOString(),
      },
    ];
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.optimizationResults ? JSON.stringify(opts) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const perf = engine.getPredictiveInsights().find((i) => i.category === 'performance');

    expect(perf?.recommendations[0]).toBe('성능 병목 지점 분석');
  });

  it('generateLearningReport.summary.totalInsights는 로드된 predictiveInsights 개수와 같다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const rows = [
      {
        id: 'ins-a',
        insight: 'a',
        confidence: 0.5,
        timeframe: 'short_term' as const,
        category: 'performance' as const,
        recommendations: [] as string[],
        dataPoints: 1,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'ins-b',
        insight: 'b',
        confidence: 0.5,
        timeframe: 'short_term' as const,
        category: 'performance' as const,
        recommendations: [] as string[],
        dataPoints: 1,
        lastUpdated: new Date().toISOString(),
      },
    ];
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.predictiveInsights ? JSON.stringify(rows) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as { summary: { totalInsights: number } };

    expect(engine.getPredictiveInsights()).toHaveLength(2);
    expect(report.summary.totalInsights).toBe(2);
  });

  it('최근 최적화 improvement 평균이 0.075이면 performance 인사이트에 7.5%가 포함된다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const opts = [
      {
        id: 'mix1',
        optimizationId: 'x',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0.05,
        userSatisfaction: 0.9,
        learningInsights: [],
        appliedAt: new Date().toISOString(),
      },
      {
        id: 'mix2',
        optimizationId: 'y',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0.1,
        userSatisfaction: 0.9,
        learningInsights: [],
        appliedAt: new Date().toISOString(),
      },
    ];
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.optimizationResults ? JSON.stringify(opts) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const perf = engine.getPredictiveInsights().find((i) => i.category === 'performance');

    expect(perf?.insight).toContain('7.5%');
  });

  it('learnFromOptimizationResult에 넣은 learningInsights가 getOptimizationResults에 보존된다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const insights = ['인사이트 A', '인사이트 B'];
    engine.learnFromOptimizationResult({
      id: 'o-li',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: insights,
      appliedAt: new Date(),
    });
    const stored = engine.getOptimizationResults().find((r) => r.id === 'o-li');

    expect(stored?.learningInsights).toEqual(insights);
  });

  it('learnFromOptimizationResult는 optimizationId·userSatisfaction·before/afterMetrics를 보존한다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const beforeMetrics = { latency: 200 };
    const afterMetrics = { latency: 120 };
    engine.learnFromOptimizationResult({
      id: 'o-meta',
      optimizationId: 'opt-xyz',
      beforeMetrics,
      afterMetrics,
      improvement: 0.12,
      userSatisfaction: 0.88,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const r = engine.getOptimizationResults().find((x) => x.id === 'o-meta');

    expect(r?.optimizationId).toBe('opt-xyz');
    expect(r?.userSatisfaction).toBe(0.88);
    expect(r?.beforeMetrics).toEqual(beforeMetrics);
    expect(r?.afterMetrics).toEqual(afterMetrics);
  });

  it('learnFromOptimizationResult의 appliedAt이 Date로 보존된다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const appliedAt = new Date('2024-06-01T12:30:00.000Z');
    engine.learnFromOptimizationResult({
      id: 'o-at',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt,
    });
    const r = engine.getOptimizationResults().find((x) => x.id === 'o-at');

    expect(r?.appliedAt).toBeInstanceOf(Date);
    expect(r?.appliedAt.getTime()).toBe(appliedAt.getTime());
  });

  it('learnFromOptimizationResult 후 improvement 값은 입력과 같다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.learnFromOptimizationResult({
      id: 'o-imp-keep',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.123,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });

    expect(engine.getOptimizationResults()[0].improvement).toBe(0.123);
  });

  it('learnFromOptimizationResult 후 performance 인사이트의 lastUpdated는 Date 인스턴스다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.learnFromOptimizationResult({
      id: 'o-perf-lu',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.15,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const perf = engine.getPredictiveInsights().find((i) => i.category === 'performance');

    expect(perf).toBeDefined();
    expect(perf!.lastUpdated).toBeInstanceOf(Date);
  });

  it('learnUserBehavior(최근 프로젝트 3건) 후 project-creation-pattern의 lastObserved는 Date 인스턴스다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = ['p1', 'p2', 'p3'].map((id, i) => ({
      id,
      name: id,
      description: '',
      createdAt: daysAgo(5 - i),
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation' as const,
      status: 'active' as const,
      chats: [],
    }));
    engine.learnUserBehavior(projects, [], []);
    const p = engine.getLearningPatterns().find((x) => x.id === 'project-creation-pattern');

    expect(p?.lastObserved).toBeInstanceOf(Date);
  });

  it('performance 인사이트 dataPoints는 최근 최적화 결과 개수와 같다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const mk = (id: string) => ({
      id,
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.15,
      userSatisfaction: 0.9,
      learningInsights: [] as string[],
      appliedAt: new Date().toISOString(),
    });
    const opts = [mk('dp1'), mk('dp2'), mk('dp3')];
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.optimizationResults ? JSON.stringify(opts) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const perf = engine.getPredictiveInsights().find((i) => i.category === 'performance');

    expect(perf?.dataPoints).toBe(3);
  });

  it('resource_usage 인사이트 dataPoints는 system_performance 패턴 개수와 같다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const rows = [
      {
        id: 'sp-d1',
        pattern: 'a',
        frequency: 0.5,
        impact: 0.75,
        confidence: 0.6,
        lastObserved: '2020-01-01T00:00:00.000Z',
        category: 'system_performance' as const,
      },
      {
        id: 'sp-d2',
        pattern: 'b',
        frequency: 0.5,
        impact: 0.72,
        confidence: 0.6,
        lastObserved: '2020-01-01T00:00:00.000Z',
        category: 'system_performance' as const,
      },
    ];
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify(rows) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const res = engine.getPredictiveInsights().find((i) => i.category === 'resource_usage');

    expect(res?.dataPoints).toBe(2);
  });

  it('기본 모델 3개만 있을 때 summary.avgModelAccuracy는 0.85다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as { summary: { avgModelAccuracy: number } };

    expect(report.summary.avgModelAccuracy).toBe(0.85);
  });

  it('로드된 패턴이 user_behavior·system_performance면 categoryBreakdown이 각각 1이다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const rows = [
      {
        id: 'mix-ub',
        pattern: 'a',
        frequency: 0.4,
        impact: 0.5,
        confidence: 0.6,
        lastObserved: '2020-01-01T00:00:00.000Z',
        category: 'user_behavior' as const,
      },
      {
        id: 'mix-sp',
        pattern: 'b',
        frequency: 0.3,
        impact: 0.75,
        confidence: 0.55,
        lastObserved: '2020-01-02T00:00:00.000Z',
        category: 'system_performance' as const,
      },
    ];
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify(rows) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as { categoryBreakdown: Record<string, number> };

    expect(report.categoryBreakdown.user_behavior).toBe(1);
    expect(report.categoryBreakdown.system_performance).toBe(1);
  });

  it('로드된 패턴 2개가 모두 user_behavior면 categoryBreakdown.user_behavior는 2다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const rows = [
      {
        id: 'dup-ub-a',
        pattern: 'a',
        frequency: 0.4,
        impact: 0.5,
        confidence: 0.6,
        lastObserved: '2020-01-01T00:00:00.000Z',
        category: 'user_behavior' as const,
      },
      {
        id: 'dup-ub-b',
        pattern: 'b',
        frequency: 0.35,
        impact: 0.45,
        confidence: 0.55,
        lastObserved: '2020-01-02T00:00:00.000Z',
        category: 'user_behavior' as const,
      },
    ];
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify(rows) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as { categoryBreakdown: Record<string, number> };

    expect(report.categoryBreakdown.user_behavior).toBe(2);
  });

  it('generatePredictiveInsights 반환 배열은 getPredictiveInsights와 동일 참조다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const a = engine.generatePredictiveInsights();
    const b = engine.getPredictiveInsights();

    expect(a).toBe(b);
  });

  it('예측 인사이트 timeframe은 user_behavior short_term·performance medium_term·resource_usage short_term이다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const patterns = [
      {
        id: 'ub-tf',
        pattern: 'u',
        frequency: 0.7,
        impact: 0.5,
        confidence: 0.6,
        lastObserved: '2020-01-01T00:00:00.000Z',
        category: 'user_behavior' as const,
      },
      {
        id: 'sp-tf',
        pattern: 's',
        frequency: 0.5,
        impact: 0.75,
        confidence: 0.6,
        lastObserved: '2020-01-01T00:00:00.000Z',
        category: 'system_performance' as const,
      },
    ];
    const opt = {
      id: 'o-tf',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.15,
      userSatisfaction: 0.9,
      learningInsights: [] as string[],
      appliedAt: new Date().toISOString(),
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => {
        if (key === K.patterns) return JSON.stringify(patterns);
        if (key === K.optimizationResults) return JSON.stringify([opt]);
        return null;
      },
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const list = engine.getPredictiveInsights();

    expect(list.find((i) => i.category === 'user_behavior')?.timeframe).toBe('short_term');
    expect(list.find((i) => i.category === 'performance')?.timeframe).toBe('medium_term');
    expect(list.find((i) => i.category === 'resource_usage')?.timeframe).toBe('short_term');
  });

  it('user_behavior 패턴과 최근 최적화를 함께 로드하면 user_behavior·performance 인사이트가 모두 생긴다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const row = {
      id: 'ub-both',
      pattern: 'p',
      frequency: 0.55,
      impact: 0.5,
      confidence: 0.6,
      lastObserved: '2020-01-01T00:00:00.000Z',
      category: 'user_behavior' as const,
    };
    const opt = {
      id: 'o-both',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.2,
      userSatisfaction: 0.9,
      learningInsights: [] as string[],
      appliedAt: new Date().toISOString(),
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => {
        if (key === K.patterns) return JSON.stringify([row]);
        if (key === K.optimizationResults) return JSON.stringify([opt]);
        return null;
      },
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const cats = engine.getPredictiveInsights().map((i) => i.category);

    expect(cats).toContain('user_behavior');
    expect(cats).toContain('performance');
  });

  it('getLearningPatterns는 learnUserBehavior 이후 갱신된 패턴 배열을 반환한다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = ['pa', 'pb', 'pc'].map((id, i) => ({
      id,
      name: id,
      description: '',
      createdAt: daysAgo(5 - i),
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation' as const,
      status: 'active' as const,
      chats: [],
    }));
    engine.learnUserBehavior(projects, [], []);
    const fromGetter = engine.getLearningPatterns();

    expect(fromGetter.some((p) => p.id === 'project-creation-pattern')).toBe(true);
  });

  it('retrainModels 반환 배열은 getAdaptiveModels와 동일 참조다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    try {
      const ret = engine.retrainModels();
      expect(ret).toBe(engine.getAdaptiveModels());
    } finally {
      randomSpy.mockRestore();
    }
  });

  it('신규 user_behavior 예측 인사이트 confidence는 0.75다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const row = {
      id: 'ub-conf',
      pattern: 'p',
      frequency: 0.6,
      impact: 0.5,
      confidence: 0.6,
      lastObserved: '2020-01-01T00:00:00.000Z',
      category: 'user_behavior' as const,
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify([row]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const ub = engine.getPredictiveInsights().find((i) => i.category === 'user_behavior');

    expect(ub?.confidence).toBe(0.75);
  });

  it('신규 performance 예측 인사이트 confidence는 0.8이다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const opt = {
      id: 'o-pconf',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.2,
      userSatisfaction: 0.9,
      learningInsights: [] as string[],
      appliedAt: new Date().toISOString(),
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.optimizationResults ? JSON.stringify([opt]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const perf = engine.getPredictiveInsights().find((i) => i.category === 'performance');

    expect(perf?.confidence).toBe(0.8);
  });

  it('신규 resource_usage 예측 인사이트 confidence는 0.7이다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const row = {
      id: 'sp-conf',
      pattern: 'p',
      frequency: 0.5,
      impact: 0.75,
      confidence: 0.6,
      lastObserved: '2020-01-01T00:00:00.000Z',
      category: 'system_performance' as const,
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify([row]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const res = engine.getPredictiveInsights().find((i) => i.category === 'resource_usage');

    expect(res?.confidence).toBe(0.7);
  });

  it('learnFromOptimizationResult improvement이 음수면 optimization-recommendation-model accuracy는 변하지 않는다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const model = engine.getAdaptiveModels().find((m) => m.id === 'optimization-recommendation-model');
    expect(model).toBeDefined();
    const accBefore = model!.accuracy;
    engine.learnFromOptimizationResult({
      id: 'o-neg',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: -0.05,
      userSatisfaction: 0.5,
      learningInsights: [],
      appliedAt: new Date(),
    });

    expect(model!.accuracy).toBe(accBefore);
    expect(engine.getOptimizationResults().some((r) => r.id === 'o-neg')).toBe(true);
  });

  it('learnFromOptimizationResult improvement이 음수면 optimization-recommendation-model trainingDataSize는 변하지 않는다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const before = engine.getAdaptiveModels().find((m) => m.id === 'optimization-recommendation-model')!.trainingDataSize;
    engine.learnFromOptimizationResult({
      id: 'o-neg-ts',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: -0.05,
      userSatisfaction: 0.5,
      learningInsights: [],
      appliedAt: new Date(),
    });

    expect(engine.getAdaptiveModels().find((m) => m.id === 'optimization-recommendation-model')!.trainingDataSize).toBe(before);
  });

  it('learnFromOptimizationResult improvement이 음수면 optimization-recommendation-model lastUpdated는 변하지 않는다', () => {
    jest.useFakeTimers();
    try {
      jest.setSystemTime(new Date('2024-06-01T12:00:00.000Z'));
      const storage: Pick<Storage, 'getItem' | 'setItem'> = {
        getItem: () => null,
        setItem: jest.fn(),
      };
      const engine = new AdaptiveLearningEngine({ storage });
      const before = engine.getAdaptiveModels().find((m) => m.id === 'optimization-recommendation-model')!.lastUpdated.getTime();
      jest.advanceTimersByTime(60_000);
      engine.learnFromOptimizationResult({
        id: 'o-neg-lu',
        optimizationId: 'z',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: -0.05,
        userSatisfaction: 0.5,
        learningInsights: [],
        appliedAt: new Date(),
      });
      const after = engine.getAdaptiveModels().find((m) => m.id === 'optimization-recommendation-model')!.lastUpdated.getTime();

      expect(after).toBe(before);
    } finally {
      jest.useRealTimers();
    }
  });

  it('learnUserBehavior 반환 배열은 getLearningPatterns와 동일 참조다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const ret = engine.learnUserBehavior([], [], []);

    expect(ret).toBe(engine.getLearningPatterns());
  });

  it('getLearningPatterns() 반환 배열을 직접 변경하면 이후 getter에서도 반영된다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const row = {
      id: 'mut-push',
      pattern: 'p',
      frequency: 0.5,
      impact: 0.5,
      confidence: 0.5,
      lastObserved: new Date(),
      category: 'user_behavior' as const,
    };
    const ref = engine.getLearningPatterns();
    const n0 = ref.length;
    ref.push(row);

    expect(engine.getLearningPatterns().length).toBe(n0 + 1);
    expect(engine.getLearningPatterns().some((p) => p.id === 'mut-push')).toBe(true);
  });

  it('learnFromOptimizationResult 후에도 getOptimizationResults는 동일 배열 참조다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const refBefore = engine.getOptimizationResults();
    engine.learnFromOptimizationResult({
      id: 'o-ref',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });

    expect(engine.getOptimizationResults()).toBe(refBefore);
    expect(refBefore.some((r) => r.id === 'o-ref')).toBe(true);
  });

  it('generateLearningReport.summary.avgModelAccuracy는 getAdaptiveModels() accuracy 평균의 반올림(소수 둘째)과 같다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const expectAvgFromModels = () => {
      const models = engine.getAdaptiveModels();
      const raw = models.reduce((s, m) => s + m.accuracy, 0) / models.length;
      const rounded = Math.round(raw * 100) / 100;
      const report = engine.generateLearningReport() as { summary: { avgModelAccuracy: number } };
      expect(report.summary.avgModelAccuracy).toBe(rounded);
    };
    expectAvgFromModels();
    engine.learnFromOptimizationResult({
      id: 'o-avg-acc',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    expectAvgFromModels();
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    try {
      engine.retrainModels();
      expectAvgFromModels();
    } finally {
      randomSpy.mockRestore();
    }
  });

  it('retrainModels 후에도 getAdaptiveModels는 동일 배열 참조다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const ref = engine.getAdaptiveModels();
    engine.retrainModels();

    expect(engine.getAdaptiveModels()).toBe(ref);
  });

  it('기본 적응형 모델은 id·modelType·trainingDataSize가 초기화 스펙과 같다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const models = engine.getAdaptiveModels();

    expect(models.map((m) => m.id)).toEqual([
      'user-behavior-model',
      'performance-prediction-model',
      'optimization-recommendation-model',
    ]);
    expect(models.map((m) => m.modelType)).toEqual(['classification', 'regression', 'recommendation']);
    expect(models.map((m) => m.trainingDataSize)).toEqual([1000, 800, 1200]);
  });

  it('신규 performance 예측 인사이트 category는 performance다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const opt = {
      id: 'o-cat',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.2,
      userSatisfaction: 0.9,
      learningInsights: [] as string[],
      appliedAt: new Date().toISOString(),
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.optimizationResults ? JSON.stringify([opt]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const perf = engine.getPredictiveInsights().find((i) => i.category === 'performance');

    expect(perf).toBeDefined();
    expect(perf!.category).toBe('performance');
  });

  it('기본 적응형 모델 name·accuracy가 초기화 스펙과 같다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const models = engine.getAdaptiveModels();

    expect(models.map((m) => m.name)).toEqual([
      '사용자 행동 분석 모델',
      '성능 예측 모델',
      '최적화 권장 모델',
    ]);
    expect(models.map((m) => m.accuracy)).toEqual([0.85, 0.78, 0.92]);
  });

  it('신규 user_behavior 예측 인사이트 category는 user_behavior다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const row = {
      id: 'ub-cat',
      pattern: 'p',
      frequency: 0.55,
      impact: 0.5,
      confidence: 0.6,
      lastObserved: '2020-01-01T00:00:00.000Z',
      category: 'user_behavior' as const,
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify([row]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const ub = engine.getPredictiveInsights().find((i) => i.category === 'user_behavior');

    expect(ub).toBeDefined();
    expect(ub!.category).toBe('user_behavior');
  });

  it('신규 resource_usage 예측 인사이트 category는 resource_usage다', () => {
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const row = {
      id: 'sp-cat',
      pattern: 'p',
      frequency: 0.5,
      impact: 0.72,
      confidence: 0.6,
      lastObserved: '2020-01-01T00:00:00.000Z',
      category: 'system_performance' as const,
    };
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => (key === K.patterns ? JSON.stringify([row]) : null),
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.generatePredictiveInsights();
    const res = engine.getPredictiveInsights().find((i) => i.category === 'resource_usage');

    expect(res).toBeDefined();
    expect(res!.category).toBe('resource_usage');
  });

  it('learnFromOptimizationResult improvement이 0이어도 최적화 결과는 추가된다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.learnFromOptimizationResult({
      id: 'o-imp0',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0,
      userSatisfaction: 0.7,
      learningInsights: [],
      appliedAt: new Date(),
    });

    expect(engine.getOptimizationResults().some((r) => r.id === 'o-imp0')).toBe(true);
  });

  it('기본 적응형 모델 performanceMetrics가 초기화 스펙과 같다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const [m0, m1, m2] = engine.getAdaptiveModels();

    expect(m0.performanceMetrics).toEqual({
      precision: 0.82,
      recall: 0.88,
      f1Score: 0.85,
      auc: 0.87,
    });
    expect(m1.performanceMetrics).toEqual({
      precision: 0.75,
      recall: 0.81,
      f1Score: 0.78,
      auc: 0.8,
    });
    expect(m2.performanceMetrics).toEqual({
      precision: 0.9,
      recall: 0.94,
      f1Score: 0.92,
      auc: 0.93,
    });
  });

  it('기본 적응형 모델 version 문자열은 모두 1.0이다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });

    expect(engine.getAdaptiveModels().every((m) => m.version === '1.0')).toBe(true);
  });

  it('주입 엔진의 getModelVersion 초기값은 1이다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });

    expect(engine.getModelVersion()).toBe(1);
  });

  it('learnUserBehavior(빈 입력)만 호출해도 getModelVersion은 변하지 않는다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const v = engine.getModelVersion();
    engine.learnUserBehavior([], [], []);

    expect(engine.getModelVersion()).toBe(v);
  });

  it('learnFromOptimizationResult 한 건만 호출해도 getModelVersion은 변하지 않는다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const v = engine.getModelVersion();
    engine.learnFromOptimizationResult({
      id: 'o-mv',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });

    expect(engine.getModelVersion()).toBe(v);
  });

  it('learnFromOptimizationResult(improvement>0)는 user-behavior-model·performance-prediction-model의 accuracy·lastUpdated를 바꾸지 않는다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const u = engine.getAdaptiveModels().find((m) => m.id === 'user-behavior-model')!;
    const p = engine.getAdaptiveModels().find((m) => m.id === 'performance-prediction-model')!;
    const snap = (m: (typeof u)[]) => ({
      ua: m[0].accuracy,
      ut: m[0].lastUpdated.getTime(),
      pa: m[1].accuracy,
      pt: m[1].lastUpdated.getTime(),
    });
    const before = snap([u, p]);
    engine.learnFromOptimizationResult({
      id: 'o-other-ok',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.2,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const u2 = engine.getAdaptiveModels().find((m) => m.id === 'user-behavior-model')!;
    const p2 = engine.getAdaptiveModels().find((m) => m.id === 'performance-prediction-model')!;
    const after = snap([u2, p2]);

    expect(after.ua).toBe(before.ua);
    expect(after.ut).toBe(before.ut);
    expect(after.pa).toBe(before.pa);
    expect(after.pt).toBe(before.pt);
  });

  it('learnFromOptimizationResult(improvement>0) 후 세 적응형 모델의 version 문자열은 모두 1.0이다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.learnFromOptimizationResult({
      id: 'o-ver',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.15,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });

    expect(engine.getAdaptiveModels().every((m) => m.version === '1.0')).toBe(true);
  });

  it('learnFromOptimizationResult(improvement>0) 후 optimization-recommendation-model lastUpdated가 갱신된다', () => {
    jest.useFakeTimers();
    try {
      jest.setSystemTime(new Date('2024-06-01T12:00:00.000Z'));
      const storage: Pick<Storage, 'getItem' | 'setItem'> = {
        getItem: () => null,
        setItem: jest.fn(),
      };
      const engine = new AdaptiveLearningEngine({ storage });
      const before = engine.getAdaptiveModels().find((m) => m.id === 'optimization-recommendation-model')!.lastUpdated.getTime();
      jest.advanceTimersByTime(60_000);
      engine.learnFromOptimizationResult({
        id: 'o-lu',
        optimizationId: 'x',
        beforeMetrics: {},
        afterMetrics: {},
        improvement: 0.1,
        userSatisfaction: 0.9,
        learningInsights: [],
        appliedAt: new Date(),
      });
      const after = engine.getAdaptiveModels().find((m) => m.id === 'optimization-recommendation-model')!.lastUpdated.getTime();

      expect(after).toBeGreaterThan(before);
    } finally {
      jest.useRealTimers();
    }
  });

  it('generateLearningReport.summary.modelVersion 문자열은 getModelVersion().toFixed(1)과 같다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const report = engine.generateLearningReport() as { summary: { modelVersion: string } };

    expect(report.summary.modelVersion).toBe(engine.getModelVersion().toFixed(1));
  });

  it('generateLearningReport.summary.totalPatterns는 getLearningPatterns().length와 항상 같다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const syncCheck = () => {
      const r = engine.generateLearningReport() as { summary: { totalPatterns: number } };
      expect(r.summary.totalPatterns).toBe(engine.getLearningPatterns().length);
    };
    syncCheck();
    engine.learnFromOptimizationResult({
      id: 'o-sync-tp',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    syncCheck();
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = ['p1', 'p2', 'p3'].map((id, i) => ({
      id,
      name: id,
      description: '',
      createdAt: daysAgo(5 - i),
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation' as const,
      status: 'active' as const,
      chats: [],
    }));
    engine.learnUserBehavior(projects, [], []);
    syncCheck();
  });

  it('generateLearningReport.summary.totalOptimizations는 getOptimizationResults().length와 항상 같다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const syncCheck = () => {
      const r = engine.generateLearningReport() as { summary: { totalOptimizations: number } };
      expect(r.summary.totalOptimizations).toBe(engine.getOptimizationResults().length);
    };
    syncCheck();
    engine.learnFromOptimizationResult({
      id: 'o-sync-to-1',
      optimizationId: 'a',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.05,
      userSatisfaction: 0.8,
      learningInsights: [],
      appliedAt: new Date(),
    });
    syncCheck();
    engine.learnFromOptimizationResult({
      id: 'o-sync-to-2',
      optimizationId: 'b',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.05,
      userSatisfaction: 0.8,
      learningInsights: [],
      appliedAt: new Date(),
    });
    syncCheck();
  });

  it('learnUserBehavior는 getOptimizationResults 길이를 바꾸지 않는다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = ['p1', 'p2', 'p3'].map((id, i) => ({
      id,
      name: id,
      description: '',
      createdAt: daysAgo(5 - i),
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation' as const,
      status: 'active' as const,
      chats: [],
    }));

    expect(engine.getOptimizationResults().length).toBe(0);
    engine.learnUserBehavior([], [], []);
    expect(engine.getOptimizationResults().length).toBe(0);
    engine.learnUserBehavior(projects, [], []);
    expect(engine.getOptimizationResults().length).toBe(0);
  });

  it('generateLearningReport.summary.totalInsights는 getPredictiveInsights().length와 항상 같다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const syncCheck = () => {
      const r = engine.generateLearningReport() as { summary: { totalInsights: number } };
      expect(r.summary.totalInsights).toBe(engine.getPredictiveInsights().length);
    };
    syncCheck();
    engine.learnFromOptimizationResult({
      id: 'o-sync-ti',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.12,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    syncCheck();
  });

  it('learnUserBehavior만으로는 getPredictiveInsights 길이가 늘지 않는다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = ['p1', 'p2', 'p3'].map((id, i) => ({
      id,
      name: id,
      description: '',
      createdAt: daysAgo(5 - i),
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation' as const,
      status: 'active' as const,
      chats: [],
    }));

    expect(engine.getPredictiveInsights().length).toBe(0);
    engine.learnUserBehavior(projects, [], []);
    expect(engine.getPredictiveInsights().length).toBe(0);
  });

  it('learnFromOptimizationResult는 getLearningPatterns 길이를 바꾸지 않는다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = ['p1', 'p2', 'p3'].map((id, i) => ({
      id,
      name: id,
      description: '',
      createdAt: daysAgo(5 - i),
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation' as const,
      status: 'active' as const,
      chats: [],
    }));
    engine.learnUserBehavior(projects, [], []);
    const n = engine.getLearningPatterns().length;
    expect(n).toBeGreaterThan(0);
    engine.learnFromOptimizationResult({
      id: 'o-lp-same',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });

    expect(engine.getLearningPatterns().length).toBe(n);
  });

  it('generateLearningReport.recentActivity.activeModels는 getAdaptiveModels().length와 항상 같다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const syncCheck = () => {
      const r = engine.generateLearningReport() as { recentActivity: { activeModels: number } };
      expect(r.recentActivity.activeModels).toBe(engine.getAdaptiveModels().length);
    };
    syncCheck();
    engine.learnFromOptimizationResult({
      id: 'o-sync-am',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    syncCheck();
    engine.retrainModels();
    syncCheck();
  });

  it('learnUserBehavior와 learnFromOptimizationResult는 getAdaptiveModels().length를 바꾸지 않는다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = ['p1', 'p2', 'p3'].map((id, i) => ({
      id,
      name: id,
      description: '',
      createdAt: daysAgo(5 - i),
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation' as const,
      status: 'active' as const,
      chats: [],
    }));
    const n = engine.getAdaptiveModels().length;
    engine.learnUserBehavior(projects, [], []);
    expect(engine.getAdaptiveModels().length).toBe(n);
    engine.learnFromOptimizationResult({
      id: 'o-adapt-same',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    expect(engine.getAdaptiveModels().length).toBe(n);
  });

  it('retrainModels는 getOptimizationResults().length와 getLearningPatterns().length를 바꾸지 않는다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = ['p1', 'p2', 'p3'].map((id, i) => ({
      id,
      name: id,
      description: '',
      createdAt: daysAgo(5 - i),
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation' as const,
      status: 'active' as const,
      chats: [],
    }));
    engine.learnUserBehavior(projects, [], []);
    engine.learnFromOptimizationResult({
      id: 'o-rt-keep',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const no = engine.getOptimizationResults().length;
    const np = engine.getLearningPatterns().length;
    engine.retrainModels();
    expect(engine.getOptimizationResults().length).toBe(no);
    expect(engine.getLearningPatterns().length).toBe(np);
  });

  it('generateLearningReport.categoryBreakdown 카운트 합은 getLearningPatterns().length와 같다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const sumBreakdown = (bd: Record<string, number>) =>
      Object.values(bd).reduce((a, v) => a + v, 0);
    const syncCheck = () => {
      const r = engine.generateLearningReport() as { categoryBreakdown: Record<string, number> };
      expect(sumBreakdown(r.categoryBreakdown)).toBe(engine.getLearningPatterns().length);
    };
    syncCheck();
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = ['p1', 'p2', 'p3'].map((id, i) => ({
      id,
      name: id,
      description: '',
      createdAt: daysAgo(5 - i),
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation' as const,
      status: 'active' as const,
      chats: [],
    }));
    engine.learnUserBehavior(projects, [], []);
    syncCheck();
  });

  it('retrainModels는 getPredictiveInsights().length를 바꾸지 않는다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.learnFromOptimizationResult({
      id: 'o-rt-ins',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.15,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const n = engine.getPredictiveInsights().length;
    expect(n).toBeGreaterThan(0);
    engine.retrainModels();
    expect(engine.getPredictiveInsights().length).toBe(n);
  });

  it('generateLearningReport.recentActivity.recentOptimizations는 summary.totalOptimizations 이하다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const check = () => {
      const r = engine.generateLearningReport() as {
        summary: { totalOptimizations: number };
        recentActivity: { recentOptimizations: number };
      };
      expect(r.recentActivity.recentOptimizations).toBeLessThanOrEqual(r.summary.totalOptimizations);
    };
    check();
    engine.learnFromOptimizationResult({
      id: 'o-old',
      optimizationId: 'a',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.8,
      learningInsights: [],
      appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    });
    check();
    engine.learnFromOptimizationResult({
      id: 'o-new',
      optimizationId: 'b',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.1,
      userSatisfaction: 0.8,
      learningInsights: [],
      appliedAt: new Date(),
    });
    check();
  });

  it(`최근 프로젝트 ${PCP.minProjects}건의 project-creation-pattern은 confidence·impact가 PCP와 같다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = ['p1', 'p2', 'p3'].map((id, i) => ({
      id,
      name: id,
      description: '',
      createdAt: daysAgo(5 - i),
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation' as const,
      status: 'active' as const,
      chats: [],
    }));
    engine.learnUserBehavior(projects, [], []);
    const p = engine.getLearningPatterns().find((x) => x.id === 'project-creation-pattern');

    expect(p).toBeDefined();
    expect(p!.category).toBe('user_behavior');
    expect(p!.frequency).toBeCloseTo(PCP.minProjects / PCP.frequencyWindowDays, 5);
    expect(p!.confidence).toBe(PCP.minProjects / PCP.confidenceSampleTarget);
    expect(p!.impact).toBe(PCP.impact);
  });

  it(`최근 프로젝트 10건의 project-creation-pattern confidence는 Math.min(${PCP.confidenceCap}, n/${PCP.confidenceSampleTarget}) 상한 ${PCP.confidenceCap}다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = Array.from({ length: 10 }, (_, i) => ({
      id: `p${i}`,
      name: `p${i}`,
      description: '',
      createdAt: daysAgo(15 - i),
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation' as const,
      status: 'active' as const,
      chats: [],
    }));
    engine.learnUserBehavior(projects, [], []);
    const p = engine.getLearningPatterns().find((x) => x.id === 'project-creation-pattern');

    expect(p).toBeDefined();
    expect(p!.confidence).toBe(PCP.confidenceCap);
    expect(p!.frequency).toBeCloseTo(10 / PCP.frequencyWindowDays, 5);
  });

  it(`최근 프로젝트 11건이어도 project-creation-pattern confidence는 Math.min(${PCP.confidenceCap}, n/${PCP.confidenceSampleTarget})를 넘지 않는다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = Array.from({ length: 11 }, (_, i) => ({
      id: `p11-${i}`,
      name: `p11-${i}`,
      description: '',
      createdAt: daysAgo(20 - i),
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation' as const,
      status: 'active' as const,
      chats: [],
    }));
    engine.learnUserBehavior(projects, [], []);
    const p = engine.getLearningPatterns().find((x) => x.id === 'project-creation-pattern');

    expect(p).toBeDefined();
    expect(p!.confidence).toBe(PCP.confidenceCap);
    expect(p!.frequency).toBeCloseTo(11 / PCP.frequencyWindowDays, 5);
  });

  it(`최근 프로젝트 7건의 project-creation-pattern confidence는 Math.min(${PCP.confidenceCap}, 7/${PCP.confidenceSampleTarget})다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = Array.from({ length: 7 }, (_, i) => ({
      id: `p7-${i}`,
      name: `p7-${i}`,
      description: '',
      createdAt: daysAgo(11 - i),
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation' as const,
      status: 'active' as const,
      chats: [],
    }));
    engine.learnUserBehavior(projects, [], []);
    const p = engine.getLearningPatterns().find((x) => x.id === 'project-creation-pattern');

    expect(p).toBeDefined();
    expect(p!.confidence).toBe(7 / PCP.confidenceSampleTarget);
    expect(p!.frequency).toBeCloseTo(7 / PCP.frequencyWindowDays, 5);
  });

  it(`최근 프로젝트 8건의 project-creation-pattern confidence는 Math.min(${PCP.confidenceCap}, 8/${PCP.confidenceSampleTarget})다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = Array.from({ length: 8 }, (_, i) => ({
      id: `p8-${i}`,
      name: `p8-${i}`,
      description: '',
      createdAt: daysAgo(12 - i),
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation' as const,
      status: 'active' as const,
      chats: [],
    }));
    engine.learnUserBehavior(projects, [], []);
    const p = engine.getLearningPatterns().find((x) => x.id === 'project-creation-pattern');

    expect(p).toBeDefined();
    expect(p!.confidence).toBe(8 / PCP.confidenceSampleTarget);
    expect(p!.frequency).toBeCloseTo(8 / PCP.frequencyWindowDays, 5);
  });

  it(`최근 프로젝트 9건의 project-creation-pattern confidence는 Math.min(${PCP.confidenceCap}, 9/${PCP.confidenceSampleTarget})다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const projects: Project[] = Array.from({ length: 9 }, (_, i) => ({
      id: `p9-${i}`,
      name: `p9-${i}`,
      description: '',
      createdAt: daysAgo(14 - i),
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation' as const,
      status: 'active' as const,
      chats: [],
    }));
    engine.learnUserBehavior(projects, [], []);
    const p = engine.getLearningPatterns().find((x) => x.id === 'project-creation-pattern');

    expect(p).toBeDefined();
    expect(p!.confidence).toBe(PCP.confidenceCap);
    expect(p!.frequency).toBeCloseTo(9 / PCP.frequencyWindowDays, 5);
  });

  it(`chat-activity-pattern은 user_behavior이고 confidence는 recentChats/${CAP.confidenceSampleTarget}과 같다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const recent = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const msg: Message = {
      id: 'cm1',
      chatId: 'c1',
      role: 'user',
      content: 'x',
      timestamp: new Date(),
    };
    const chat: Chat = {
      id: 'c1',
      projectId: 'p1',
      name: 'n',
      createdAt: recent,
      updatedAt: new Date(),
      messages: [msg],
    };
    engine.learnUserBehavior([], [chat], []);
    const cap = engine.getLearningPatterns().find((x) => x.id === 'chat-activity-pattern');

    expect(cap).toBeDefined();
    expect(cap!.category).toBe('user_behavior');
    expect(cap!.confidence).toBeCloseTo(1 / CAP.confidenceSampleTarget, 5);
    expect(cap!.frequency).toBe(1);
    expect(cap!.impact).toBe(CAP.impact);
  });

  it(`7일 이내 대화 20건이면 chat-activity-pattern confidence는 Math.min(${CAP.confidenceCap}, n/${CAP.confidenceSampleTarget}) 상한 ${CAP.confidenceCap}다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const recent = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    const chats: Chat[] = Array.from({ length: 20 }, (_, i) => {
      const chatId = `cb${i}`;
      return {
        id: chatId,
        projectId: 'p1',
        name: `n${i}`,
        createdAt: recent,
        updatedAt: new Date(),
        messages: [
          {
            id: `wm${i}`,
            chatId,
            role: 'user' as const,
            content: 'x',
            timestamp: new Date(),
          },
        ],
      };
    });
    engine.learnUserBehavior([], chats, []);
    const cap = engine.getLearningPatterns().find((x) => x.id === 'chat-activity-pattern');

    expect(cap).toBeDefined();
    expect(cap!.confidence).toBe(CAP.confidenceCap);
    expect(cap!.frequency).toBe(1);
  });

  it(`7일 이내 대화 5건이면 chat-activity-pattern confidence는 Math.min(${CAP.confidenceCap}, 5/${CAP.confidenceSampleTarget})다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const recent = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    const chats: Chat[] = Array.from({ length: 5 }, (_, i) => {
      const chatId = `cb5-${i}`;
      return {
        id: chatId,
        projectId: 'p1',
        name: `n${i}`,
        createdAt: recent,
        updatedAt: new Date(),
        messages: [
          {
            id: `wm5-${i}`,
            chatId,
            role: 'user' as const,
            content: 'x',
            timestamp: new Date(),
          },
        ],
      };
    });
    engine.learnUserBehavior([], chats, []);
    const cap = engine.getLearningPatterns().find((x) => x.id === 'chat-activity-pattern');

    expect(cap).toBeDefined();
    expect(cap!.confidence).toBeCloseTo(0.25, 5);
    expect(cap!.frequency).toBe(1);
  });

  it(`7일 이내 대화 7건이면 chat-activity-pattern confidence는 Math.min(${CAP.confidenceCap}, 7/${CAP.confidenceSampleTarget})다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const recent = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    const chats: Chat[] = Array.from({ length: 7 }, (_, i) => {
      const chatId = `cb7-${i}`;
      return {
        id: chatId,
        projectId: 'p1',
        name: `n${i}`,
        createdAt: recent,
        updatedAt: new Date(),
        messages: [
          {
            id: `wm7-${i}`,
            chatId,
            role: 'user' as const,
            content: 'x',
            timestamp: new Date(),
          },
        ],
      };
    });
    engine.learnUserBehavior([], chats, []);
    const cap = engine.getLearningPatterns().find((x) => x.id === 'chat-activity-pattern');

    expect(cap).toBeDefined();
    expect(cap!.confidence).toBeCloseTo(0.35, 5);
    expect(cap!.frequency).toBe(1);
  });

  it(`7일 이내 대화 10건이면 chat-activity-pattern confidence는 Math.min(${CAP.confidenceCap}, n/${CAP.confidenceSampleTarget})다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const recent = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    const chats: Chat[] = Array.from({ length: 10 }, (_, i) => {
      const chatId = `cb10-${i}`;
      return {
        id: chatId,
        projectId: 'p1',
        name: `n${i}`,
        createdAt: recent,
        updatedAt: new Date(),
        messages: [
          {
            id: `wm10-${i}`,
            chatId,
            role: 'user' as const,
            content: 'x',
            timestamp: new Date(),
          },
        ],
      };
    });
    engine.learnUserBehavior([], chats, []);
    const cap = engine.getLearningPatterns().find((x) => x.id === 'chat-activity-pattern');

    expect(cap).toBeDefined();
    expect(cap!.confidence).toBeCloseTo(0.5, 5);
    expect(cap!.frequency).toBe(1);
  });

  it(`7일 이내 대화 15건이면 chat-activity-pattern confidence는 Math.min(${CAP.confidenceCap}, 15/${CAP.confidenceSampleTarget})다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const recent = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    const chats: Chat[] = Array.from({ length: 15 }, (_, i) => {
      const chatId = `cb15-${i}`;
      return {
        id: chatId,
        projectId: 'p1',
        name: `n${i}`,
        createdAt: recent,
        updatedAt: new Date(),
        messages: [
          {
            id: `wm15-${i}`,
            chatId,
            role: 'user' as const,
            content: 'x',
            timestamp: new Date(),
          },
        ],
      };
    });
    engine.learnUserBehavior([], chats, []);
    const cap = engine.getLearningPatterns().find((x) => x.id === 'chat-activity-pattern');

    expect(cap).toBeDefined();
    expect(cap!.confidence).toBeCloseTo(0.75, 5);
    expect(cap!.frequency).toBe(1);
  });

  it('7일 이내 대화 4건 중 메시지 있는 대화 2건면 chat-activity-pattern frequency(활동률)는 0.5다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const recent = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    const withMsg = (id: string): Chat => ({
      id,
      projectId: 'p1',
      name: id,
      createdAt: recent,
      updatedAt: new Date(),
      messages: [
        {
          id: `m-${id}`,
          chatId: id,
          role: 'user' as const,
          content: 'x',
          timestamp: new Date(),
        },
      ],
    });
    const empty = (id: string): Chat => ({
      id,
      projectId: 'p1',
      name: id,
      createdAt: recent,
      updatedAt: new Date(),
      messages: [],
    });
    const chats: Chat[] = [withMsg('c-a'), withMsg('c-b'), empty('c-c'), empty('c-d')];
    engine.learnUserBehavior([], chats, []);
    const cap = engine.getLearningPatterns().find((x) => x.id === 'chat-activity-pattern');

    expect(cap).toBeDefined();
    expect(cap!.frequency).toBe(0.5);
    expect(cap!.pattern).toContain('50.0%');
  });

  it('message-pattern은 user_behavior이고 frequency·confidence·impact가 MESSAGE_PATTERN_METRICS와 일치한다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = Date.now();
    const messages: Message[] = Array.from({ length: MP.minMessages }, (_, i) => ({
      id: `mf${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(20),
      timestamp: new Date(base - (MP.minMessages - i) * 60 * 1000),
    }));
    engine.learnUserBehavior([], [], messages);
    const mp = engine.getLearningPatterns().find((x) => x.id === 'message-pattern');

    expect(mp).toBeDefined();
    expect(mp!.category).toBe('user_behavior');
    expect(mp!.frequency).toBeCloseTo(MP.minMessages / MP.windowHours, 5);
    expect(mp!.confidence).toBe(MP.minMessages / MP.confidenceSampleTarget);
    expect(mp!.impact).toBe(MP.impact);
  });

  it(`24시간 이내 메시지 50건이면 message-pattern confidence는 Math.min(${MP.confidenceCap}, n/${MP.confidenceSampleTarget}) 상한 ${MP.confidenceCap}이다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = Date.now();
    const messages: Message[] = Array.from({ length: 50 }, (_, i) => ({
      id: `mf50-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(12),
      timestamp: new Date(base - (50 - i) * 30 * 1000),
    }));
    engine.learnUserBehavior([], [], messages);
    const mp = engine.getLearningPatterns().find((x) => x.id === 'message-pattern');

    expect(mp).toBeDefined();
    expect(mp!.confidence).toBe(MP.confidenceCap);
    expect(mp!.frequency).toBeCloseTo(50 / MP.windowHours, 5);
  });

  it(`24시간 이내 메시지 40건이면 message-pattern confidence는 Math.min(${MP.confidenceCap}, 40/${MP.confidenceSampleTarget})=${MP.confidenceCap}이다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = Date.now();
    const messages: Message[] = Array.from({ length: 40 }, (_, i) => ({
      id: `mf40-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(12),
      timestamp: new Date(base - (40 - i) * 45 * 1000),
    }));
    engine.learnUserBehavior([], [], messages);
    const mp = engine.getLearningPatterns().find((x) => x.id === 'message-pattern');

    expect(mp).toBeDefined();
    expect(mp!.confidence).toBe(MP.confidenceCap);
    expect(mp!.frequency).toBeCloseTo(40 / MP.windowHours, 5);
  });

  it(`24시간 이내 메시지 49건이면 message-pattern confidence는 Math.min(${MP.confidenceCap}, 49/${MP.confidenceSampleTarget})=${MP.confidenceCap}이다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = Date.now();
    const messages: Message[] = Array.from({ length: 49 }, (_, i) => ({
      id: `mf49-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(12),
      timestamp: new Date(base - (49 - i) * 30 * 1000),
    }));
    engine.learnUserBehavior([], [], messages);
    const mp = engine.getLearningPatterns().find((x) => x.id === 'message-pattern');

    expect(mp).toBeDefined();
    expect(mp!.confidence).toBe(MP.confidenceCap);
    expect(mp!.frequency).toBeCloseTo(49 / MP.windowHours, 5);
  });

  it(`24시간 이내 메시지 25건이면 message-pattern confidence는 Math.min(${MP.confidenceCap}, 25/${MP.confidenceSampleTarget})다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = Date.now();
    const messages: Message[] = Array.from({ length: 25 }, (_, i) => ({
      id: `mf25-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(12),
      timestamp: new Date(base - (25 - i) * 60 * 1000),
    }));
    engine.learnUserBehavior([], [], messages);
    const mp = engine.getLearningPatterns().find((x) => x.id === 'message-pattern');

    expect(mp).toBeDefined();
    expect(mp!.confidence).toBe(25 / MP.confidenceSampleTarget);
    expect(mp!.frequency).toBeCloseTo(25 / MP.windowHours, 5);
  });

  it(`24시간 이내 메시지 35건이면 message-pattern confidence는 Math.min(${MP.confidenceCap}, 35/${MP.confidenceSampleTarget})다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = Date.now();
    const messages: Message[] = Array.from({ length: 35 }, (_, i) => ({
      id: `mf35-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(12),
      timestamp: new Date(base - (35 - i) * 55 * 1000),
    }));
    engine.learnUserBehavior([], [], messages);
    const mp = engine.getLearningPatterns().find((x) => x.id === 'message-pattern');

    expect(mp).toBeDefined();
    expect(mp!.confidence).toBe(35 / MP.confidenceSampleTarget);
    expect(mp!.frequency).toBeCloseTo(35 / MP.windowHours, 5);
  });

  it(`24시간 이내 메시지 39건이면 message-pattern confidence는 Math.min(${MP.confidenceCap}, 39/${MP.confidenceSampleTarget})다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = Date.now();
    const messages: Message[] = Array.from({ length: 39 }, (_, i) => ({
      id: `mf39-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(12),
      timestamp: new Date(base - (39 - i) * 50 * 1000),
    }));
    engine.learnUserBehavior([], [], messages);
    const mp = engine.getLearningPatterns().find((x) => x.id === 'message-pattern');

    expect(mp).toBeDefined();
    expect(mp!.confidence).toBeCloseTo(39 / MP.confidenceSampleTarget, 5);
    expect(mp!.frequency).toBeCloseTo(39 / MP.windowHours, 5);
  });

  it('storage에 message-pattern이 있을 때 learnUserBehavior가 같은 id 패턴을 내면 confidence는 +0.1 병합(상한 0.95)된다', () => {
    const store = new Map<string, string>();
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const existing = {
      id: 'message-pattern',
      pattern: 'old',
      frequency: MP.minMessages / MP.windowHours,
      impact: MP.impact,
      confidence: MP.minMessages / MP.confidenceSampleTarget,
      lastObserved: new Date().toISOString(),
      category: 'user_behavior' as const,
    };
    store.set(K.patterns, JSON.stringify([existing]));
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, v) => {
        store.set(key, v);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = Date.now();
    const messages: Message[] = Array.from({ length: MP.minMessages }, (_, i) => ({
      id: `mf-merge-${i}`,
      chatId: 'c1',
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: 'x'.repeat(20),
      timestamp: new Date(base - (MP.minMessages - i) * 60 * 1000),
    }));
    engine.learnUserBehavior([], [], messages);
    const mp = engine.getLearningPatterns().find((x) => x.id === 'message-pattern');

    expect(mp).toBeDefined();
    expect(mp!.confidence).toBeCloseTo(
      Math.min(0.95, MP.minMessages / MP.confidenceSampleTarget + 0.1),
      5,
    );
    expect(mp!.frequency).toBeCloseTo(MP.minMessages / MP.windowHours, 5);
  });

  it('storage에 chat-activity-pattern이 있을 때 learnUserBehavior가 같은 id 패턴을 내면 confidence는 +0.1 병합된다', () => {
    const store = new Map<string, string>();
    const K = ADAPTIVE_LEARNING_STORAGE_KEYS;
    const existing = {
      id: 'chat-activity-pattern',
      pattern: 'old',
      frequency: 0.5,
      impact: CAP.impact,
      confidence: 0.25,
      lastObserved: new Date().toISOString(),
      category: 'user_behavior' as const,
    };
    store.set(K.patterns, JSON.stringify([existing]));
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, v) => {
        store.set(key, v);
      },
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const recent = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    const withMsg = (id: string): Chat => ({
      id,
      projectId: 'p1',
      name: id,
      createdAt: recent,
      updatedAt: new Date(),
      messages: [
        {
          id: `m-${id}`,
          chatId: id,
          role: 'user' as const,
          content: 'x',
          timestamp: new Date(),
        },
      ],
    });
    const empty = (id: string): Chat => ({
      id,
      projectId: 'p1',
      name: id,
      createdAt: recent,
      updatedAt: new Date(),
      messages: [],
    });
    engine.learnUserBehavior([], [withMsg('c-a'), withMsg('c-b'), empty('c-c'), empty('c-d')], []);
    const cap = engine.getLearningPatterns().find((x) => x.id === 'chat-activity-pattern');

    expect(cap).toBeDefined();
    expect(cap!.confidence).toBeCloseTo(Math.min(0.95, 0.25 + 0.1), 5);
    expect(cap!.frequency).toBeCloseTo(0.5, 5);
  });

  it(`7일 이내 대화 21건이면 chat-activity-pattern confidence는 Math.min(${CAP.confidenceCap}, n/${CAP.confidenceSampleTarget})로 여전히 ${CAP.confidenceCap}다`, () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const recent = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    const chats: Chat[] = Array.from({ length: 21 }, (_, i) => {
      const chatId = `cb21-${i}`;
      return {
        id: chatId,
        projectId: 'p1',
        name: `n${i}`,
        createdAt: recent,
        updatedAt: new Date(),
        messages: [
          {
            id: `wm21-${i}`,
            chatId,
            role: 'user' as const,
            content: 'x',
            timestamp: new Date(),
          },
        ],
      };
    });
    engine.learnUserBehavior([], chats, []);
    const cap = engine.getLearningPatterns().find((x) => x.id === 'chat-activity-pattern');

    expect(cap).toBeDefined();
    expect(cap!.confidence).toBe(CAP.confidenceCap);
  });

  it('learnFromOptimizationResult에 넣은 id가 getOptimizationResults 항목 id와 같다', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    engine.learnFromOptimizationResult({
      id: 'o-id-preserve',
      optimizationId: 'x',
      beforeMetrics: {},
      afterMetrics: {},
      improvement: 0.05,
      userSatisfaction: 0.9,
      learningInsights: [],
      appliedAt: new Date(),
    });
    const last = engine.getOptimizationResults().at(-1);

    expect(last?.id).toBe('o-id-preserve');
  });

  it('프로젝트 정렬 중 getTime이 추가로 던지면 Invalid createdAt in sort로 warn한다', () => {
    const warnSpy = jest.spyOn(errorLogger, 'warn').mockImplementation(() => {});
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    let gtCalls = 0;
    const flakyCreatedAt = {
      getTime: () => {
        gtCalls += 1;
        if (gtCalls === 1) return Date.now() - 5 * 24 * 60 * 60 * 1000;
        throw new Error('flaky-sort');
      },
    } as unknown as Date;

    const base = (id: string, createdAt: Date): Project => ({
      id,
      name: id,
      description: '',
      createdAt,
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation',
      status: 'active',
      chats: [],
    });

    const projects: Project[] = [
      base('flaky', flakyCreatedAt),
      base('p2', daysAgo(4)),
      base('p3', daysAgo(3)),
    ];

    engine.learnUserBehavior(projects, [], []);

    expect(
      warnSpy.mock.calls.some(
        (c) =>
          c[0] === 'Invalid createdAt in sort' &&
          typeof c[1] === 'object' &&
          c[1] !== null &&
          (c[1] as { action?: string }).action === 'analyzeProjectCreationPattern',
      ),
    ).toBe(true);
    warnSpy.mockRestore();
  });

  it('프로젝트 reduce 중 getTime이 던지면 Invalid createdAt in reduce로 warn하고 project-creation-pattern은 생성된다', () => {
    const warnSpy = jest.spyOn(errorLogger, 'warn').mockImplementation(() => {});
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    let gtCalls = 0;
    const flakyCreatedAt = {
      getTime: () => {
        gtCalls += 1;
        if (gtCalls < 3) return Date.now() - 5 * 24 * 60 * 60 * 1000;
        throw new Error('flaky-reduce');
      },
    } as unknown as Date;

    const base = (id: string, createdAt: Date): Project => ({
      id,
      name: id,
      description: '',
      createdAt,
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation',
      status: 'active',
      chats: [],
    });

    const projects: Project[] = [
      base('flaky', flakyCreatedAt),
      base('p2', daysAgo(4)),
      base('p3', daysAgo(3)),
    ];

    engine.learnUserBehavior(projects, [], []);

    expect(
      warnSpy.mock.calls.some(
        (c) =>
          c[0] === 'Invalid createdAt in reduce' &&
          typeof c[1] === 'object' &&
          c[1] !== null &&
          (c[1] as { action?: string }).action === 'analyzeProjectCreationPattern',
      ),
    ).toBe(true);
    expect(engine.getLearningPatterns().some((p) => p.id === 'project-creation-pattern')).toBe(true);
    warnSpy.mockRestore();
  });

  it('대화 정렬 중 getTime이 추가로 던지면 Invalid createdAt in chat sort로 warn한다', () => {
    const warnSpy = jest.spyOn(errorLogger, 'warn').mockImplementation(() => {});
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    let gtCalls = 0;
    const flakyCreatedAt = {
      getTime: () => {
        gtCalls += 1;
        if (gtCalls === 1) return Date.now() - 2 * 24 * 60 * 60 * 1000;
        throw new Error('flaky-chat-sort');
      },
    } as unknown as Date;

    const chatA: Chat = {
      id: 'ca',
      projectId: 'p1',
      name: 'a',
      createdAt: flakyCreatedAt,
      updatedAt: new Date(),
      messages: [],
    };
    const chatB: Chat = {
      id: 'cb',
      projectId: 'p1',
      name: 'b',
      createdAt: daysAgo(1),
      updatedAt: new Date(),
      messages: [],
    };

    engine.learnUserBehavior([], [chatA, chatB], []);

    expect(
      warnSpy.mock.calls.some(
        (c) =>
          c[0] === 'Invalid createdAt in chat sort' &&
          typeof c[1] === 'object' &&
          c[1] !== null &&
          (c[1] as { action?: string }).action === 'analyzeChatActivityPattern',
      ),
    ).toBe(true);
    warnSpy.mockRestore();
  });

  it('메시지 정렬 중 getTime이 추가로 던지면 Invalid timestamp in sort로 warn한다', () => {
    const warnSpy = jest.spyOn(errorLogger, 'warn').mockImplementation(() => {});
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: jest.fn(),
    };
    const engine = new AdaptiveLearningEngine({ storage });
    const base = Date.now();
    let flakyCalls = 0;
    const flakyTs = new Proxy(new Date(base - 3 * 60 * 60 * 1000), {
      get(target, prop, receiver) {
        if (prop === 'getTime') {
          return () => {
            flakyCalls += 1;
            if (flakyCalls === 1) {
              return Reflect.get(target, prop, receiver).call(target);
            }
            throw new Error('flaky-msg-sort');
          };
        }
        return Reflect.get(target, prop, receiver);
      },
    }) as Date;

    const messages: Message[] = [
      ...Array.from({ length: MP.minMessages - 1 }, (_, i) => ({
        id: `m${i}`,
        chatId: 'c1',
        role: (i % 2 === 0 ? 'assistant' : 'user') as 'assistant' | 'user',
        content: 'b'.repeat(15),
        timestamp: new Date(base - (MP.minMessages - 1 - i) * 60 * 1000),
      })),
      {
        id: 'm-flaky',
        chatId: 'c1',
        role: 'user',
        content: 'a'.repeat(15),
        timestamp: flakyTs,
      },
    ];

    engine.learnUserBehavior([], [], messages);

    expect(
      warnSpy.mock.calls.some(
        (c) =>
          c[0] === 'Invalid timestamp in sort' &&
          typeof c[1] === 'object' &&
          c[1] !== null &&
          (c[1] as { action?: string }).action === 'analyzeMessagePattern',
      ),
    ).toBe(true);
    warnSpy.mockRestore();
  });
});

describe('adaptiveLearningEngine', () => {
  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(adaptiveLearningEngine).toBeDefined();
    });

    it('싱글톤은 AdaptiveLearningEngine 인스턴스다', () => {
      expect(adaptiveLearningEngine).toBeInstanceOf(AdaptiveLearningEngine);
    });
  });

  describe('getModelVersion', () => {
    it('모델 버전을 반환해야 함', () => {
      const version = adaptiveLearningEngine.getModelVersion();
      expect(typeof version).toBe('number');
      expect(version).toBeGreaterThan(0);
    });
  });

  describe('getLearningPatterns', () => {
    it('학습 패턴을 조회할 수 있어야 함', () => {
      const patterns = adaptiveLearningEngine.getLearningPatterns();
      expect(Array.isArray(patterns)).toBe(true);
    });

    it('학습 패턴이 올바른 구조를 가져야 함', () => {
      const patterns = adaptiveLearningEngine.getLearningPatterns();
      expect(Array.isArray(patterns)).toBe(true);
      /* eslint-disable jest/no-conditional-expect -- API may return empty; structure checked when present */
      if (patterns.length > 0) {
        const pattern = patterns[0];
        expect(pattern).toHaveProperty('id');
        expect(pattern).toHaveProperty('pattern');
        expect(pattern).toHaveProperty('frequency');
        expect(pattern).toHaveProperty('confidence');
        expect(pattern).toHaveProperty('category');
      }
      /* eslint-enable jest/no-conditional-expect */
    });
  });

  describe('getAdaptiveModels', () => {
    it('적응형 모델을 조회할 수 있어야 함', () => {
      const models = adaptiveLearningEngine.getAdaptiveModels();
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
    });

    it('적응형 모델이 올바른 구조를 가져야 함', () => {
      const models = adaptiveLearningEngine.getAdaptiveModels();
      expect(models.length).toBeGreaterThan(0);
      const model = models[0];
      expect(model).toHaveProperty('id');
      expect(model).toHaveProperty('name');
      expect(model).toHaveProperty('version');
      expect(model).toHaveProperty('accuracy');
      expect(model).toHaveProperty('performanceMetrics');
    });
  });

  describe('getOptimizationResults', () => {
    it('최적화 결과를 조회할 수 있어야 함', () => {
      const results = adaptiveLearningEngine.getOptimizationResults();
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('getPredictiveInsights', () => {
    it('예측 인사이트를 조회할 수 있어야 함', () => {
      const insights = adaptiveLearningEngine.getPredictiveInsights();
      expect(Array.isArray(insights)).toBe(true);
    });
  });

  describe('learnUserBehavior', () => {
    const createMockProject = (id: string, createdAt?: Date): Project => ({
      id,
      name: `프로젝트 ${id}`,
      description: '테스트 프로젝트',
      createdAt: createdAt || new Date(),
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation',
      status: 'active',
      chats: []
    });

    const createMockChat = (id: string, projectId: string, createdAt?: Date): Chat => ({
      id,
      projectId,
      name: `대화 ${id}`,
      createdAt: createdAt || new Date(),
      updatedAt: new Date(),
      messages: []
    });

    const createMockMessage = (role: 'user' | 'assistant', content: string, timestamp?: Date, chatId = 'chat1'): Message => ({
      id: `msg_${Date.now()}_${Math.random()}`,
      chatId,
      role,
      content,
      timestamp: timestamp || new Date()
    });

    it('사용자 행동을 학습할 수 있어야 함', () => {
      const projects: Project[] = [
        createMockProject('proj1', new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
        createMockProject('proj2', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000))
      ];

      const chats: Chat[] = [
        createMockChat('chat1', 'proj1', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
        createMockChat('chat2', 'proj2', new Date(Date.now() - 1 * 24 * 60 * 60 * 1000))
      ];

      const messages: Message[] = [
        createMockMessage('user', '재개발 프로젝트에 대해 알려주세요'),
        createMockMessage('assistant', '재개발 프로젝트는...')
      ];

      const patterns = adaptiveLearningEngine.learnUserBehavior(projects, chats, messages);
      
      expect(Array.isArray(patterns)).toBe(true);
    });

    it('빈 데이터로도 작동해야 함', () => {
      const patterns = adaptiveLearningEngine.learnUserBehavior([], [], []);
      expect(Array.isArray(patterns)).toBe(true);
    });
  });

  describe('learnFromOptimizationResult', () => {
    const createMockOptimizationResult = (): OptimizationResult => ({
      id: `opt_${Date.now()}`,
      optimizationId: 'test_optimization',
      beforeMetrics: { performance: 0.7 },
      afterMetrics: { performance: 0.9 },
      improvement: 0.2,
      userSatisfaction: 0.85,
      learningInsights: ['성능이 향상되었습니다'],
      appliedAt: new Date()
    });

    it('최적화 결과로부터 학습할 수 있어야 함', () => {
      const result = createMockOptimizationResult();
      
      expect(() => {
        adaptiveLearningEngine.learnFromOptimizationResult(result);
      }).not.toThrow();

      const results = adaptiveLearningEngine.getOptimizationResults();
      expect(results.length).toBeGreaterThan(0);
    });

    it('여러 최적화 결과를 학습할 수 있어야 함', () => {
      const result1 = createMockOptimizationResult();
      const result2 = createMockOptimizationResult();
      
      adaptiveLearningEngine.learnFromOptimizationResult(result1);
      adaptiveLearningEngine.learnFromOptimizationResult(result2);

      const results = adaptiveLearningEngine.getOptimizationResults();
      expect(results.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('generatePredictiveInsights', () => {
    it('예측 인사이트를 생성할 수 있어야 함', () => {
      const insights = adaptiveLearningEngine.generatePredictiveInsights();
      
      expect(Array.isArray(insights)).toBe(true);
    });

    it('생성된 인사이트가 올바른 구조를 가져야 함', () => {
      const insights = adaptiveLearningEngine.generatePredictiveInsights();
      expect(insights.length).toBeGreaterThan(0);
      const insight = insights[0];
      expect(insight).toHaveProperty('id');
      expect(insight).toHaveProperty('insight');
      expect(insight).toHaveProperty('confidence');
      expect(insight).toHaveProperty('timeframe');
      expect(insight).toHaveProperty('category');
    });
  });

  describe('generateLearningReport', () => {
    it('학습 리포트를 생성할 수 있어야 함', () => {
      const report = adaptiveLearningEngine.generateLearningReport();
      
      expect(report).toBeDefined();
      expect(typeof report).toBe('object');
    });

    it('학습 리포트에 필수 정보가 포함되어야 함', () => {
      const report = adaptiveLearningEngine.generateLearningReport();
      
      // 리포트 구조 확인
      expect(report).toBeDefined();
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 사용자 행동을 학습할 수 있어야 함', () => {
      const projects: Project[] = [
        {
          id: 'proj1',
          name: '샘플 재개발',
          description: '재개발 프로젝트',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
          files: [],
          instructions: '',
          tags: [],
          isActive: true,
          type: 'conversation',
          status: 'active',
          chats: []
        }
      ];

      const chats: Chat[] = [
        {
          id: 'chat1',
          projectId: 'proj1',
          name: '시공사 선정',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
          messages: []
        }
      ];

      const messages: Message[] = [
        {
          id: 'msg1',
          chatId: 'chat1',
          role: 'user',
          content: '시공사 선정 기준은 무엇인가요?',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'msg2',
          chatId: 'chat1',
          role: 'assistant',
          content: '시공사 선정 기준은 기술력, 안전성, 경험 등을 고려합니다.',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 60000)
        }
      ];

      const patterns = adaptiveLearningEngine.learnUserBehavior(projects, chats, messages);
      
      expect(Array.isArray(patterns)).toBe(true);
    });

    it('최적화 결과를 학습하고 예측 인사이트를 생성할 수 있어야 함', () => {
      const result: OptimizationResult = {
        id: 'opt1',
        optimizationId: 'performance_optimization',
        beforeMetrics: { responseTime: 2000, accuracy: 0.75 },
        afterMetrics: { responseTime: 1200, accuracy: 0.85 },
        improvement: 0.1,
        userSatisfaction: 0.9,
        learningInsights: ['응답 시간이 크게 개선되었습니다'],
        appliedAt: new Date()
      };

      adaptiveLearningEngine.learnFromOptimizationResult(result);
      
      const insights = adaptiveLearningEngine.generatePredictiveInsights();
      expect(Array.isArray(insights)).toBe(true);
    });
  });
});

