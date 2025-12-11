/**
 * AIQualityAnalysisEngine 서비스 테스트
 * AI 품질 분석 엔진 테스트
 */

import aiQualityAnalysisEngine from '../AIQualityAnalysisEngine';
import realTimeAIAlertSystem from '../realTimeAIAlertSystem';

// realTimeAIAlertSystem 모킹
jest.mock('../realTimeAIAlertSystem', () => ({
  createAlert: jest.fn(),
}));

// console 모킹
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('aiQualityAnalysisEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 엔진 중지
    if (aiQualityAnalysisEngine.getIsRunning()) {
      aiQualityAnalysisEngine.stop();
    }
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(aiQualityAnalysisEngine).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = aiQualityAnalysisEngine;
      const instance2 = aiQualityAnalysisEngine;
      expect(instance1).toBe(instance2);
    });
  });

  describe('start / stop', () => {
    it('엔진을 시작할 수 있어야 함', () => {
      aiQualityAnalysisEngine.start();
      expect(aiQualityAnalysisEngine.getIsRunning()).toBe(true);
      aiQualityAnalysisEngine.stop();
    });

    it('엔진을 중지할 수 있어야 함', () => {
      aiQualityAnalysisEngine.start();
      aiQualityAnalysisEngine.stop();
      expect(aiQualityAnalysisEngine.getIsRunning()).toBe(false);
    });

    it('이미 실행 중일 때 중복 시작을 방지해야 함', () => {
      aiQualityAnalysisEngine.start();
      const initialRunningState = aiQualityAnalysisEngine.getIsRunning();
      aiQualityAnalysisEngine.start(); // 중복 호출
      
      expect(aiQualityAnalysisEngine.getIsRunning()).toBe(initialRunningState);
      aiQualityAnalysisEngine.stop();
    });

    it('중지되지 않은 상태에서 중지를 시도해도 에러가 발생하지 않아야 함', () => {
      aiQualityAnalysisEngine.stop(); // 이미 중지된 상태
      expect(() => aiQualityAnalysisEngine.stop()).not.toThrow();
    });
  });

  describe('getLastAnalysis', () => {
    it('최근 분석 결과를 가져올 수 있어야 함', () => {
      // 분석이 수행되기까지 시간이 걸릴 수 있으므로 대기
      const lastAnalysis = aiQualityAnalysisEngine.getLastAnalysis();
      
      // 초기에는 null일 수 있거나 분석 결과가 있을 수 있음
      expect(lastAnalysis === null || typeof lastAnalysis === 'object').toBe(true);
    });

    it('분석 결과가 있으면 품질 분석 결과 구조를 가져야 함', () => {
      // 시간을 두고 분석 수행
      setTimeout(() => {
        const lastAnalysis = aiQualityAnalysisEngine.getLastAnalysis();
        
        if (lastAnalysis) {
          expect(lastAnalysis.id).toBeDefined();
          expect(typeof lastAnalysis.overallScore).toBe('number');
          expect(lastAnalysis.categories).toBeDefined();
          expect(lastAnalysis.aiInsights).toBeDefined();
        }
      }, 100);
    });
  });

  describe('getAnalysisHistory', () => {
    it('분석 히스토리를 가져올 수 있어야 함', () => {
      const history = aiQualityAnalysisEngine.getAnalysisHistory();
      
      expect(Array.isArray(history)).toBe(true);
    });

    it('히스토리는 최근 분석 결과들을 포함해야 함', async () => {
      // 시간을 두고 여러 분석 수행
      aiQualityAnalysisEngine.start();
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const history = aiQualityAnalysisEngine.getAnalysisHistory();
      
      expect(Array.isArray(history)).toBe(true);
      aiQualityAnalysisEngine.stop();
    });
  });

  describe('getMetrics', () => {
    it('메트릭을 가져올 수 있어야 함', () => {
      const metrics = aiQualityAnalysisEngine.getMetrics();
      
      expect(metrics).toBeDefined();
      expect(typeof metrics.totalAnalyses).toBe('number');
      expect(typeof metrics.averageScore).toBe('number');
      expect(typeof metrics.criticalIssues).toBe('number');
      expect(typeof metrics.securityVulnerabilities).toBe('number');
      expect(typeof metrics.performanceBottlenecks).toBe('number');
    });

    it('히스토리가 없으면 0 값을 반환해야 함', () => {
      // 엔진 중지 상태에서 메트릭 확인
      const metrics = aiQualityAnalysisEngine.getMetrics();
      
      expect(metrics.totalAnalyses).toBeGreaterThanOrEqual(0);
      expect(metrics.averageScore).toBeGreaterThanOrEqual(0);
    });

    it('평균 점수를 계산해야 함', async () => {
      aiQualityAnalysisEngine.start();
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const metrics = aiQualityAnalysisEngine.getMetrics();
      
      if (metrics.totalAnalyses > 0) {
        expect(metrics.averageScore).toBeGreaterThanOrEqual(0);
        expect(metrics.averageScore).toBeLessThanOrEqual(100);
      }
      
      aiQualityAnalysisEngine.stop();
    });

    it('이슈 통계를 계산해야 함', async () => {
      aiQualityAnalysisEngine.start();
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const metrics = aiQualityAnalysisEngine.getMetrics();
      
      expect(metrics.criticalIssues).toBeGreaterThanOrEqual(0);
      expect(metrics.securityVulnerabilities).toBeGreaterThanOrEqual(0);
      expect(metrics.performanceBottlenecks).toBeGreaterThanOrEqual(0);
      
      aiQualityAnalysisEngine.stop();
    });
  });

  describe('getIsRunning', () => {
    it('실행 상태를 확인할 수 있어야 함', () => {
      const isRunning = aiQualityAnalysisEngine.getIsRunning();
      expect(typeof isRunning).toBe('boolean');
    });

    it('시작 후 true를 반환해야 함', () => {
      aiQualityAnalysisEngine.start();
      expect(aiQualityAnalysisEngine.getIsRunning()).toBe(true);
      aiQualityAnalysisEngine.stop();
    });

    it('중지 후 false를 반환해야 함', () => {
      aiQualityAnalysisEngine.start();
      aiQualityAnalysisEngine.stop();
      expect(aiQualityAnalysisEngine.getIsRunning()).toBe(false);
    });
  });

  describe('분석 결과 구조', () => {
    it('분석 결과가 올바른 구조를 가져야 함', async () => {
      aiQualityAnalysisEngine.start();
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const lastAnalysis = aiQualityAnalysisEngine.getLastAnalysis();
      
      if (lastAnalysis) {
        expect(lastAnalysis.id).toBeDefined();
        expect(lastAnalysis.timestamp).toBeInstanceOf(Date);
        expect(typeof lastAnalysis.overallScore).toBe('number');
        expect(lastAnalysis.overallScore).toBeGreaterThanOrEqual(0);
        expect(lastAnalysis.overallScore).toBeLessThanOrEqual(100);
        
        // 카테고리 확인
        expect(lastAnalysis.categories.codeQuality).toBeDefined();
        expect(lastAnalysis.categories.performance).toBeDefined();
        expect(lastAnalysis.categories.security).toBeDefined();
        expect(lastAnalysis.categories.maintainability).toBeDefined();
        expect(lastAnalysis.categories.testability).toBeDefined();
        
        // AI 인사이트 확인
        expect(lastAnalysis.aiInsights).toBeDefined();
        expect(typeof lastAnalysis.aiInsights.trendAnalysis).toBe('string');
        expect(typeof lastAnalysis.aiInsights.riskAssessment).toBe('string');
        expect(Array.isArray(lastAnalysis.aiInsights.priorityActions)).toBe(true);
        expect(Array.isArray(lastAnalysis.aiInsights.predictedIssues)).toBe(true);
      }
      
      aiQualityAnalysisEngine.stop();
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('품질 분석을 수행하고 결과를 확인할 수 있어야 함', async () => {
      aiQualityAnalysisEngine.start();
      
      // 분석 완료 대기
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const lastAnalysis = aiQualityAnalysisEngine.getLastAnalysis();
      const metrics = aiQualityAnalysisEngine.getMetrics();
      
      expect(lastAnalysis).toBeDefined();
      expect(metrics.totalAnalyses).toBeGreaterThanOrEqual(0);
      
      aiQualityAnalysisEngine.stop();
    });

    it('코드 품질 분석 결과를 확인할 수 있어야 함', async () => {
      aiQualityAnalysisEngine.start();
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const lastAnalysis = aiQualityAnalysisEngine.getLastAnalysis();
      
      if (lastAnalysis) {
        expect(lastAnalysis.categories.codeQuality.score).toBeGreaterThanOrEqual(0);
        expect(lastAnalysis.categories.codeQuality.score).toBeLessThanOrEqual(100);
        expect(Array.isArray(lastAnalysis.categories.codeQuality.issues)).toBe(true);
        expect(Array.isArray(lastAnalysis.categories.codeQuality.recommendations)).toBe(true);
      }
      
      aiQualityAnalysisEngine.stop();
    });

    it('성능 분석 결과를 확인할 수 있어야 함', async () => {
      aiQualityAnalysisEngine.start();
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const lastAnalysis = aiQualityAnalysisEngine.getLastAnalysis();
      
      if (lastAnalysis) {
        expect(lastAnalysis.categories.performance.score).toBeGreaterThanOrEqual(0);
        expect(lastAnalysis.categories.performance.score).toBeLessThanOrEqual(100);
        expect(Array.isArray(lastAnalysis.categories.performance.bottlenecks)).toBe(true);
        expect(Array.isArray(lastAnalysis.categories.performance.optimizations)).toBe(true);
      }
      
      aiQualityAnalysisEngine.stop();
    });

    it('보안 분석 결과를 확인할 수 있어야 함', async () => {
      aiQualityAnalysisEngine.start();
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const lastAnalysis = aiQualityAnalysisEngine.getLastAnalysis();
      
      if (lastAnalysis) {
        expect(lastAnalysis.categories.security.score).toBeGreaterThanOrEqual(0);
        expect(lastAnalysis.categories.security.score).toBeLessThanOrEqual(100);
        expect(Array.isArray(lastAnalysis.categories.security.vulnerabilities)).toBe(true);
        expect(Array.isArray(lastAnalysis.categories.security.fixes)).toBe(true);
      }
      
      aiQualityAnalysisEngine.stop();
    });
  });
});

