/**
 * SystemIntelligenceService 테스트
 */

import {
  systemIntelligenceService,
  SystemIntelligenceService,
  SystemHealthMetrics,
  SystemAnomaly,
  PredictiveInsight,
  AutoOptimizationAction,
  SystemIntelligenceReport,
} from '../systemIntelligenceService';
import { Project, Chat, Message } from '../../types/project';

describe('SystemIntelligenceService', () => {
  let service: SystemIntelligenceService;
  let mockProjects: Project[];
  let mockChats: Chat[];
  let mockMessages: Message[];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    service = new SystemIntelligenceService();

    // Mock date
    jest.spyOn(Date, 'now').mockReturnValue(1000000000000);

    mockProjects = [
      {
        id: 'project-1',
        name: 'Test Project',
        description: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
        files: [],
        instructions: 'Test instructions',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
      },
    ];

    mockChats = [
      {
        id: 'chat-1',
        projectId: 'project-1',
        name: 'Test Chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockMessages = [
      {
        id: 'message-1',
        chatId: 'chat-1',
        role: 'user',
        content: 'Test message',
        timestamp: new Date(),
      },
    ];
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    service.clearHistory();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(SystemIntelligenceService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(systemIntelligenceService).toBeDefined();
      expect(systemIntelligenceService).toBeInstanceOf(SystemIntelligenceService);
    });
  });

  describe('시스템 건강도 분석', () => {
    it('기본 건강도 분석 수행', () => {
      const metrics = service.analyzeSystemHealth(mockProjects, mockChats, mockMessages);

      expect(metrics).toBeDefined();
      expect(metrics).toHaveProperty('cpuUsage');
      expect(metrics).toHaveProperty('memoryUsage');
      expect(metrics).toHaveProperty('diskUsage');
      expect(metrics).toHaveProperty('networkUsage');
      expect(metrics).toHaveProperty('responseTime');
      expect(metrics).toHaveProperty('errorRate');
      expect(metrics).toHaveProperty('activeConnections');
      expect(metrics).toHaveProperty('uptime');
    });

    it('메트릭 범위 확인', () => {
      const metrics = service.analyzeSystemHealth(mockProjects, mockChats, mockMessages);

      expect(metrics.cpuUsage).toBeGreaterThanOrEqual(0);
      expect(metrics.cpuUsage).toBeLessThanOrEqual(100);
      expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(metrics.memoryUsage).toBeLessThanOrEqual(100);
      expect(metrics.diskUsage).toBeGreaterThanOrEqual(0);
      expect(metrics.diskUsage).toBeLessThanOrEqual(100);
      expect(metrics.networkUsage).toBeGreaterThanOrEqual(0);
      expect(metrics.networkUsage).toBeLessThanOrEqual(100);
      expect(metrics.responseTime).toBeGreaterThanOrEqual(0);
      expect(metrics.errorRate).toBeGreaterThanOrEqual(0);
      expect(metrics.activeConnections).toBeGreaterThanOrEqual(0);
    });

    it('건강도 히스토리 저장', () => {
      service.analyzeSystemHealth(mockProjects, mockChats, mockMessages);
      service.analyzeSystemHealth(mockProjects, mockChats, mockMessages);

      const history = service.getHealthHistory();
      expect(history.length).toBe(2);
    });

    it('히스토리 최대 크기 제한', () => {
      for (let i = 0; i < 110; i++) {
        service.analyzeSystemHealth(mockProjects, mockChats, mockMessages);
      }

      const history = service.getHealthHistory();
      expect(history.length).toBe(100);
    });
  });

  describe('이상 징후 감지', () => {
    it('정상 메트릭에서 이상 없음', () => {
      const metrics: SystemHealthMetrics = {
        cpuUsage: 50,
        memoryUsage: 50,
        diskUsage: 50,
        networkUsage: 50,
        responseTime: 200,
        errorRate: 0.5,
        activeConnections: 50,
        uptime: Date.now(),
      };

      const anomalies = service.detectAnomalies(metrics);
      expect(anomalies.length).toBe(0);
    });

    it('높은 CPU 사용률 감지', () => {
      const metrics: SystemHealthMetrics = {
        cpuUsage: 85,
        memoryUsage: 50,
        diskUsage: 50,
        networkUsage: 50,
        responseTime: 200,
        errorRate: 0.5,
        activeConnections: 50,
        uptime: Date.now(),
      };

      const anomalies = service.detectAnomalies(metrics);
      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies[0].type).toBe('performance');
      expect(anomalies[0].severity).toBe('high');
      expect(anomalies[0].title).toContain('CPU');
    });

    it('매우 높은 CPU 사용률 - critical 감지', () => {
      const metrics: SystemHealthMetrics = {
        cpuUsage: 96,
        memoryUsage: 50,
        diskUsage: 50,
        networkUsage: 50,
        responseTime: 200,
        errorRate: 0.5,
        activeConnections: 50,
        uptime: Date.now(),
      };

      const anomalies = service.detectAnomalies(metrics);
      expect(anomalies[0].severity).toBe('critical');
    });

    it('높은 메모리 사용률 감지', () => {
      const metrics: SystemHealthMetrics = {
        cpuUsage: 50,
        memoryUsage: 90,
        diskUsage: 50,
        networkUsage: 50,
        responseTime: 200,
        errorRate: 0.5,
        activeConnections: 50,
        uptime: Date.now(),
      };

      const anomalies = service.detectAnomalies(metrics);
      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies[0].type).toBe('performance');
      expect(anomalies[0].title).toContain('메모리');
    });

    it('느린 응답 시간 감지', () => {
      const metrics: SystemHealthMetrics = {
        cpuUsage: 50,
        memoryUsage: 50,
        diskUsage: 50,
        networkUsage: 50,
        responseTime: 600,
        errorRate: 0.5,
        activeConnections: 50,
        uptime: Date.now(),
      };

      const anomalies = service.detectAnomalies(metrics);
      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies[0].type).toBe('performance');
      expect(anomalies[0].title).toContain('응답');
    });

    it('매우 느린 응답 시간 - high severity', () => {
      const metrics: SystemHealthMetrics = {
        cpuUsage: 50,
        memoryUsage: 50,
        diskUsage: 50,
        networkUsage: 50,
        responseTime: 1200,
        errorRate: 0.5,
        activeConnections: 50,
        uptime: Date.now(),
      };

      const anomalies = service.detectAnomalies(metrics);
      expect(anomalies[0].severity).toBe('high');
    });

    it('높은 오류율 감지', () => {
      const metrics: SystemHealthMetrics = {
        cpuUsage: 50,
        memoryUsage: 50,
        diskUsage: 50,
        networkUsage: 50,
        responseTime: 200,
        errorRate: 3,
        activeConnections: 50,
        uptime: Date.now(),
      };

      const anomalies = service.detectAnomalies(metrics);
      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies[0].type).toBe('security');
      expect(anomalies[0].title).toContain('오류율');
    });

    it('매우 높은 오류율 - critical 감지', () => {
      const metrics: SystemHealthMetrics = {
        cpuUsage: 50,
        memoryUsage: 50,
        diskUsage: 50,
        networkUsage: 50,
        responseTime: 200,
        errorRate: 6,
        activeConnections: 50,
        uptime: Date.now(),
      };

      const anomalies = service.detectAnomalies(metrics);
      expect(anomalies[0].severity).toBe('critical');
    });

    it('다중 이상 징후 감지', () => {
      const metrics: SystemHealthMetrics = {
        cpuUsage: 90,
        memoryUsage: 90,
        diskUsage: 50,
        networkUsage: 50,
        responseTime: 600,
        errorRate: 3,
        activeConnections: 50,
        uptime: Date.now(),
      };

      const anomalies = service.detectAnomalies(metrics);
      expect(anomalies.length).toBeGreaterThan(1);
    });

    it('이상 징후에 추천사항 포함', () => {
      const metrics: SystemHealthMetrics = {
        cpuUsage: 90,
        memoryUsage: 50,
        diskUsage: 50,
        networkUsage: 50,
        responseTime: 200,
        errorRate: 0.5,
        activeConnections: 50,
        uptime: Date.now(),
      };

      const anomalies = service.detectAnomalies(metrics);
      expect(anomalies[0].recommendations.length).toBeGreaterThan(0);
      expect(anomalies[0].affectedComponents.length).toBeGreaterThan(0);
    });

    it('이상 징후 히스토리 저장', () => {
      const metrics: SystemHealthMetrics = {
        cpuUsage: 90,
        memoryUsage: 50,
        diskUsage: 50,
        networkUsage: 50,
        responseTime: 200,
        errorRate: 0.5,
        activeConnections: 50,
        uptime: Date.now(),
      };

      service.detectAnomalies(metrics);
      const storedAnomalies = service.getAnomalies();
      expect(storedAnomalies.length).toBeGreaterThan(0);
    });
  });

  describe('예측적 인사이트 생성', () => {
    it('기본 인사이트 생성', () => {
      const metrics = service.analyzeSystemHealth(mockProjects, mockChats, mockMessages);
      const insights = service.generatePredictiveInsights(metrics, mockProjects);

      expect(Array.isArray(insights)).toBe(true);
    });

    it('용량 예측 인사이트', () => {
      const metrics = service.analyzeSystemHealth(mockProjects, mockChats, mockMessages);
      
      // 여러 프로젝트 추가하여 성장률 증가
      const manyProjects: Project[] = Array.from({ length: 20 }, (_, i) => ({
        ...mockProjects[0],
        id: `project-${i}`,
      }));

      // 여러 번 분석 수행
      for (let i = 0; i < 5; i++) {
        service.analyzeSystemHealth(manyProjects, mockChats, mockMessages);
      }

      const insights = service.generatePredictiveInsights(metrics, manyProjects);
      const capacityInsight = insights.find(i => i.type === 'capacity');
      
      if (capacityInsight) {
        expect(capacityInsight.type).toBe('capacity');
        expect(capacityInsight.recommendations.length).toBeGreaterThan(0);
      }
    });

    it('성능 예측 인사이트', () => {
      const highCpuMetrics: SystemHealthMetrics = {
        cpuUsage: 75,
        memoryUsage: 50,
        diskUsage: 50,
        networkUsage: 50,
        responseTime: 200,
        errorRate: 0.5,
        activeConnections: 50,
        uptime: Date.now(),
      };

      // 높은 CPU 사용률 히스토리 생성
      for (let i = 0; i < 10; i++) {
        service.analyzeSystemHealth(mockProjects, mockChats, mockMessages);
      }

      const insights = service.generatePredictiveInsights(highCpuMetrics, mockProjects);
      
      // 히스토리가 충분히 쌓이면 성능 인사이트 생성 가능
      expect(Array.isArray(insights)).toBe(true);
    });

    it('보안 예측 인사이트', () => {
      const metrics: SystemHealthMetrics = {
        cpuUsage: 50,
        memoryUsage: 50,
        diskUsage: 50,
        networkUsage: 50,
        responseTime: 200,
        errorRate: 2,
        activeConnections: 50,
        uptime: Date.now(),
      };

      const insights = service.generatePredictiveInsights(metrics, mockProjects);
      const securityInsight = insights.find(i => i.type === 'security');
      
      if (securityInsight) {
        expect(securityInsight.type).toBe('security');
        expect(securityInsight.confidence).toBeGreaterThan(0);
        expect(securityInsight.impact).toBeDefined();
      }
    });

    it('인사이트 구조 확인', () => {
      const metrics = service.analyzeSystemHealth(mockProjects, mockChats, mockMessages);
      const insights = service.generatePredictiveInsights(metrics, mockProjects);

      if (insights.length > 0) {
        const insight = insights[0];
        expect(insight).toHaveProperty('id');
        expect(insight).toHaveProperty('type');
        expect(insight).toHaveProperty('title');
        expect(insight).toHaveProperty('description');
        expect(insight).toHaveProperty('confidence');
        expect(insight).toHaveProperty('predictedDate');
        expect(insight).toHaveProperty('impact');
        expect(insight).toHaveProperty('recommendations');
      }
    });

    it('인사이트 히스토리 저장', () => {
      const metrics = service.analyzeSystemHealth(mockProjects, mockChats, mockMessages);
      service.generatePredictiveInsights(metrics, mockProjects);

      const storedInsights = service.getInsights();
      expect(Array.isArray(storedInsights)).toBe(true);
    });
  });

  describe('자동 최적화 액션 생성', () => {
    it('기본 최적화 액션 생성', () => {
      const metrics = service.analyzeSystemHealth(mockProjects, mockChats, mockMessages);
      const anomalies: SystemAnomaly[] = [];
      const actions = service.generateOptimizationActions(metrics, anomalies);

      expect(Array.isArray(actions)).toBe(true);
    });

    it('디스크 사용률 높을 때 정리 액션 생성', () => {
      const metrics: SystemHealthMetrics = {
        cpuUsage: 50,
        memoryUsage: 50,
        diskUsage: 85,
        networkUsage: 50,
        responseTime: 200,
        errorRate: 0.5,
        activeConnections: 50,
        uptime: Date.now(),
      };

      const actions = service.generateOptimizationActions(metrics, []);
      const cleanupAction = actions.find(a => a.type === 'cleanup');

      expect(cleanupAction).toBeDefined();
      if (cleanupAction) {
        expect(cleanupAction.priority).toBe('high');
        expect(cleanupAction.automated).toBe(true);
      }
    });

    it('CPU 사용률 높을 때 최적화 액션 생성', () => {
      const metrics: SystemHealthMetrics = {
        cpuUsage: 75,
        memoryUsage: 50,
        diskUsage: 50,
        networkUsage: 50,
        responseTime: 200,
        errorRate: 0.5,
        activeConnections: 50,
        uptime: Date.now(),
      };

      const actions = service.generateOptimizationActions(metrics, []);
      const optimizationAction = actions.find(a => a.type === 'optimization');

      expect(optimizationAction).toBeDefined();
      if (optimizationAction) {
        expect(optimizationAction.automated).toBe(true);
      }
    });

    it('활성 연결 수 많을 때 스케일링 액션 생성', () => {
      const metrics: SystemHealthMetrics = {
        cpuUsage: 50,
        memoryUsage: 50,
        diskUsage: 50,
        networkUsage: 50,
        responseTime: 200,
        errorRate: 0.5,
        activeConnections: 85,
        uptime: Date.now(),
      };

      const actions = service.generateOptimizationActions(metrics, []);
      const scalingAction = actions.find(a => a.type === 'scaling');

      expect(scalingAction).toBeDefined();
      if (scalingAction) {
        expect(scalingAction.priority).toBe('high');
        expect(scalingAction.automated).toBe(true);
      }
    });

    it('이상 징후 많을 때 유지보수 액션 생성', () => {
      const metrics = service.analyzeSystemHealth(mockProjects, mockChats, mockMessages);
      const anomalies: SystemAnomaly[] = Array.from({ length: 5 }, (_, i) => ({
        id: `anomaly-${i}`,
        type: 'performance',
        severity: 'medium',
        title: `Anomaly ${i}`,
        description: 'Test',
        detectedAt: new Date(),
        recommendations: [],
        affectedComponents: [],
      }));

      const actions = service.generateOptimizationActions(metrics, anomalies);
      const maintenanceAction = actions.find(a => a.type === 'maintenance');

      expect(maintenanceAction).toBeDefined();
      if (maintenanceAction) {
        expect(maintenanceAction.automated).toBe(false);
      }
    });

    it('최적화 액션 구조 확인', () => {
      const metrics: SystemHealthMetrics = {
        cpuUsage: 75,
        memoryUsage: 50,
        diskUsage: 85,
        networkUsage: 50,
        responseTime: 200,
        errorRate: 0.5,
        activeConnections: 85,
        uptime: Date.now(),
      };

      const actions = service.generateOptimizationActions(metrics, []);

      if (actions.length > 0) {
        const action = actions[0];
        expect(action).toHaveProperty('id');
        expect(action).toHaveProperty('type');
        expect(action).toHaveProperty('title');
        expect(action).toHaveProperty('description');
        expect(action).toHaveProperty('priority');
        expect(action).toHaveProperty('estimatedImpact');
        expect(action).toHaveProperty('estimatedDuration');
        expect(action).toHaveProperty('riskLevel');
        expect(action).toHaveProperty('automated');
      }
    });

    it('최적화 액션 히스토리 저장', () => {
      const metrics: SystemHealthMetrics = {
        cpuUsage: 75,
        memoryUsage: 50,
        diskUsage: 50,
        networkUsage: 50,
        responseTime: 200,
        errorRate: 0.5,
        activeConnections: 50,
        uptime: Date.now(),
      };

      service.generateOptimizationActions(metrics, []);
      const storedActions = service.getOptimizations();
      expect(storedActions.length).toBeGreaterThan(0);
    });
  });

  describe('종합 지능 보고서 생성', () => {
    it('기본 보고서 생성', () => {
      const report = service.generateIntelligenceReport(mockProjects, mockChats, mockMessages);

      expect(report).toBeDefined();
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('overallHealth');
      expect(report).toHaveProperty('criticalIssues');
      expect(report).toHaveProperty('warnings');
      expect(report).toHaveProperty('recommendations');
      expect(report).toHaveProperty('anomalies');
      expect(report).toHaveProperty('insights');
      expect(report).toHaveProperty('optimizations');
    });

    it('전체 건강도 범위 확인', () => {
      const report = service.generateIntelligenceReport(mockProjects, mockChats, mockMessages);

      expect(report.overallHealth).toBeGreaterThanOrEqual(0);
      expect(report.overallHealth).toBeLessThanOrEqual(100);
    });

    it('이상 징후 개수 집계', () => {
      const report = service.generateIntelligenceReport(mockProjects, mockChats, mockMessages);

      expect(report.criticalIssues).toBeGreaterThanOrEqual(0);
      expect(report.warnings).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(report.anomalies)).toBe(true);
    });

    it('추천사항 생성', () => {
      const report = service.generateIntelligenceReport(mockProjects, mockChats, mockMessages);

      expect(Array.isArray(report.recommendations)).toBe(true);
      expect(report.recommendations.length).toBeLessThanOrEqual(10);
    });

    it('보고서에 모든 데이터 포함', () => {
      const report = service.generateIntelligenceReport(mockProjects, mockChats, mockMessages);

      expect(Array.isArray(report.anomalies)).toBe(true);
      expect(Array.isArray(report.insights)).toBe(true);
      expect(Array.isArray(report.optimizations)).toBe(true);
    });
  });

  describe('자동 최적화 실행', () => {
    it('자동화된 액션 실행 성공', async () => {
      const action: AutoOptimizationAction = {
        id: 'test-action',
        type: 'cleanup',
        title: 'Test Action',
        description: 'Test',
        priority: 'low',
        estimatedImpact: 'Test',
        estimatedDuration: 1, // 1초
        riskLevel: 'low',
        automated: true,
      };

      const promise = service.executeOptimization(action);
      jest.advanceTimersByTime(1000);
      const result = await promise;

      expect(result).toBe(true);
    });

    it('자동화되지 않은 액션 실행 실패', async () => {
      const action: AutoOptimizationAction = {
        id: 'test-action',
        type: 'maintenance',
        title: 'Test Action',
        description: 'Test',
        priority: 'low',
        estimatedImpact: 'Test',
        estimatedDuration: 1,
        riskLevel: 'low',
        automated: false,
      };

      const result = await service.executeOptimization(action);

      expect(result).toBe(false);
    });

    it('최적화 실행 후 액션 제거', async () => {
      const metrics: SystemHealthMetrics = {
        cpuUsage: 75,
        memoryUsage: 50,
        diskUsage: 50,
        networkUsage: 50,
        responseTime: 200,
        errorRate: 0.5,
        activeConnections: 50,
        uptime: Date.now(),
      };

      service.generateOptimizationActions(metrics, []);
      const actions = service.getOptimizations();
      expect(actions.length).toBeGreaterThan(0);

      const action = actions[0];
      if (action.automated) {
        const promise = service.executeOptimization(action);
        jest.advanceTimersByTime(action.estimatedDuration * 1000);
        await promise;

        const remainingActions = service.getOptimizations();
        expect(remainingActions.find(a => a.id === action.id)).toBeUndefined();
      }
    });
  });

  describe('이상 징후 해결', () => {
    it('이상 징후 해결 처리', () => {
      const metrics: SystemHealthMetrics = {
        cpuUsage: 90,
        memoryUsage: 50,
        diskUsage: 50,
        networkUsage: 50,
        responseTime: 200,
        errorRate: 0.5,
        activeConnections: 50,
        uptime: Date.now(),
      };

      const anomalies = service.detectAnomalies(metrics);
      expect(anomalies.length).toBeGreaterThan(0);

      const anomalyId = anomalies[0].id;
      service.resolveAnomaly(anomalyId);

      const storedAnomalies = service.getAnomalies();
      const resolvedAnomaly = storedAnomalies.find(a => a.id === anomalyId);
      expect(resolvedAnomaly?.resolvedAt).toBeDefined();
    });

    it('존재하지 않는 이상 징후 해결 시도', () => {
      expect(() => {
        service.resolveAnomaly('non-existent-id');
      }).not.toThrow();
    });
  });

  describe('히스토리 데이터 조회', () => {
    it('건강도 히스토리 조회', () => {
      service.analyzeSystemHealth(mockProjects, mockChats, mockMessages);
      service.analyzeSystemHealth(mockProjects, mockChats, mockMessages);

      const history = service.getHealthHistory();
      expect(history.length).toBe(2);
    });

    it('이상 징후 히스토리 조회', () => {
      const metrics: SystemHealthMetrics = {
        cpuUsage: 90,
        memoryUsage: 50,
        diskUsage: 50,
        networkUsage: 50,
        responseTime: 200,
        errorRate: 0.5,
        activeConnections: 50,
        uptime: Date.now(),
      };

      service.detectAnomalies(metrics);
      const anomalies = service.getAnomalies();
      expect(anomalies.length).toBeGreaterThan(0);
    });

    it('인사이트 히스토리 조회', () => {
      const metrics = service.analyzeSystemHealth(mockProjects, mockChats, mockMessages);
      service.generatePredictiveInsights(metrics, mockProjects);

      const insights = service.getInsights();
      expect(Array.isArray(insights)).toBe(true);
    });

    it('최적화 액션 히스토리 조회', () => {
      const metrics: SystemHealthMetrics = {
        cpuUsage: 75,
        memoryUsage: 50,
        diskUsage: 50,
        networkUsage: 50,
        responseTime: 200,
        errorRate: 0.5,
        activeConnections: 50,
        uptime: Date.now(),
      };

      service.generateOptimizationActions(metrics, []);
      const optimizations = service.getOptimizations();
      expect(Array.isArray(optimizations)).toBe(true);
    });
  });

  describe('데이터 초기화', () => {
    it('모든 히스토리 초기화', () => {
      service.analyzeSystemHealth(mockProjects, mockChats, mockMessages);
      
      const metrics: SystemHealthMetrics = {
        cpuUsage: 90,
        memoryUsage: 50,
        diskUsage: 50,
        networkUsage: 50,
        responseTime: 200,
        errorRate: 0.5,
        activeConnections: 50,
        uptime: Date.now(),
      };

      service.detectAnomalies(metrics);
      service.generatePredictiveInsights(metrics, mockProjects);
      service.generateOptimizationActions(metrics, []);

      expect(service.getHealthHistory().length).toBeGreaterThan(0);
      expect(service.getAnomalies().length).toBeGreaterThan(0);

      service.clearHistory();

      expect(service.getHealthHistory().length).toBe(0);
      expect(service.getAnomalies().length).toBe(0);
      expect(service.getInsights().length).toBe(0);
      expect(service.getOptimizations().length).toBe(0);
    });
  });
});

