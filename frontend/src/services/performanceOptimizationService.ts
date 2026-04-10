import axios from 'axios';
import {
  API_BASE_URL,
  API_PERFORMANCE_HEALTH_PATH,
  API_PERFORMANCE_METRICS_PATH,
  API_PERFORMANCE_OPTIMIZE_PATH,
  API_PERFORMANCE_RECOMMENDATIONS_PATH,
  FALLBACK_API_ORIGIN,
  joinApiHealthCheckUrl,
} from '../config/api';

// 성능 메트릭 인터페이스
export interface PerformanceMetrics {
  timestamp: number;
  cpu: {
    usage_percent: number;
    count: number;
    frequency?: {
      current: number;
      min: number;
      max: number;
    };
  };
  memory: {
    total: number;
    available: number;
    used: number;
    percent: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    percent: number;
  };
  network: {
    bytes_sent: number;
    bytes_recv: number;
    packets_sent: number;
    packets_recv: number;
  };
  system: {
    processes: number;
    boot_time: number;
  };
}

// 시스템 건강도 인터페이스
export interface SystemHealth {
  overall: number;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  security: number;
  last_check: number;
}

// 최적화 권장사항 인터페이스
export interface OptimizationRecommendation {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: number;
  estimated_time: number;
}

// 최적화 결과 인터페이스
export interface OptimizationResult {
  id: string;
  type: string;
  status: 'completed' | 'failed' | 'running';
  applied_at: number;
  impact: {
    cpu_improvement: number;
    memory_improvement: number;
    response_time_improvement: number;
  };
  message: string;
}

export class PerformanceOptimizationService {
  private readonly origin = API_BASE_URL || FALLBACK_API_ORIGIN;
  private metricsCache: PerformanceMetrics | null = null;
  private healthCache: SystemHealth | null = null;
  private recommendationsCache: OptimizationRecommendation[] = [];
  private cacheTimeout = 30000; // 30초

  // 실시간 성능 메트릭 조회
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      const response = await axios.get(joinApiHealthCheckUrl(this.origin, API_PERFORMANCE_METRICS_PATH));
      this.metricsCache = response.data;
      return response.data;
    } catch (error) {
      console.error('성능 메트릭 조회 실패:', error);
      throw error;
    }
  }

  // 시스템 건강도 조회
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      const response = await axios.get(joinApiHealthCheckUrl(this.origin, API_PERFORMANCE_HEALTH_PATH));
      this.healthCache = response.data;
      return response.data;
    } catch (error) {
      console.error('시스템 건강도 조회 실패:', error);
      throw error;
    }
  }

  // 최적화 권장사항 조회
  async getOptimizationRecommendations(): Promise<OptimizationRecommendation[]> {
    try {
      const response = await axios.get(joinApiHealthCheckUrl(this.origin, API_PERFORMANCE_RECOMMENDATIONS_PATH));
      this.recommendationsCache = response.data.recommendations;
      return response.data.recommendations;
    } catch (error) {
      console.error('최적화 권장사항 조회 실패:', error);
      throw error;
    }
  }

  // 최적화 적용
  async applyOptimization(optimization: {
    id: string;
    type: string;
  }): Promise<OptimizationResult> {
    try {
      const response = await axios.post(joinApiHealthCheckUrl(this.origin, API_PERFORMANCE_OPTIMIZE_PATH), optimization);
      return response.data;
    } catch (error) {
      console.error('최적화 적용 실패:', error);
      throw error;
    }
  }

  // 캐시된 메트릭 반환
  getCachedMetrics(): PerformanceMetrics | null {
    if (this.metricsCache && Date.now() - this.metricsCache.timestamp < this.cacheTimeout) {
      return this.metricsCache;
    }
    return null;
  }

  // 캐시된 건강도 반환
  getCachedHealth(): SystemHealth | null {
    if (this.healthCache && Date.now() - this.healthCache.last_check < this.cacheTimeout) {
      return this.healthCache;
    }
    return null;
  }

  // 캐시된 권장사항 반환
  getCachedRecommendations(): OptimizationRecommendation[] {
    return this.recommendationsCache;
  }

  // 메모리 사용량을 사람이 읽기 쉬운 형태로 변환
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // CPU 사용률 상태 평가
  getCPUStatus(usage: number): 'excellent' | 'good' | 'warning' | 'critical' {
    if (usage < 30) return 'excellent';
    if (usage < 60) return 'good';
    if (usage < 80) return 'warning';
    return 'critical';
  }

  // 메모리 사용률 상태 평가
  getMemoryStatus(usage: number): 'excellent' | 'good' | 'warning' | 'critical' {
    if (usage < 50) return 'excellent';
    if (usage < 70) return 'good';
    if (usage < 85) return 'warning';
    return 'critical';
  }

  // 디스크 사용률 상태 평가
  getDiskStatus(usage: number): 'excellent' | 'good' | 'warning' | 'critical' {
    if (usage < 60) return 'excellent';
    if (usage < 80) return 'good';
    if (usage < 90) return 'warning';
    return 'critical';
  }

  // 성능 점수 계산
  calculatePerformanceScore(metrics: PerformanceMetrics): number {
    const cpuScore = Math.max(0, 100 - metrics.cpu.usage_percent);
    const memoryScore = Math.max(0, 100 - metrics.memory.percent);
    const diskScore = Math.max(0, 100 - metrics.disk.percent);
    
    return Math.round((cpuScore + memoryScore + diskScore) / 3);
  }

  // 실시간 모니터링 시작
  startRealTimeMonitoring(callback: (metrics: PerformanceMetrics) => void): NodeJS.Timeout {
    return setInterval(async () => {
      try {
        const metrics = await this.getPerformanceMetrics();
        callback(metrics);
      } catch (error) {
        console.error('실시간 모니터링 오류:', error);
      }
    }, 10000); // 10초마다 업데이트
  }

  // 실시간 모니터링 중지
  stopRealTimeMonitoring(intervalId: NodeJS.Timeout): void {
    clearInterval(intervalId);
  }

  // 자동 최적화 실행
  async runAutoOptimization(): Promise<OptimizationResult[]> {
    try {
      const recommendations = await this.getOptimizationRecommendations();
      const criticalRecommendations = recommendations.filter(
        rec => rec.priority === 'critical' || rec.priority === 'high'
      );

      const results: OptimizationResult[] = [];
      
      for (const recommendation of criticalRecommendations) {
        try {
          const result = await this.applyOptimization({
            id: recommendation.id,
            type: recommendation.type
          });
          results.push(result);
          
          // 최적화 간 간격
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`최적화 ${recommendation.id} 실패:`, error);
        }
      }

      return results;
    } catch (error) {
      console.error('자동 최적화 실행 실패:', error);
      throw error;
    }
  }

  // 성능 리포트 생성
  async generatePerformanceReport(): Promise<{
    timestamp: number;
    metrics: PerformanceMetrics;
    health: SystemHealth;
    recommendations: OptimizationRecommendation[];
    score: number;
    summary: string;
  }> {
    try {
      const [metrics, health, recommendations] = await Promise.all([
        this.getPerformanceMetrics(),
        this.getSystemHealth(),
        this.getOptimizationRecommendations()
      ]);

      const score = this.calculatePerformanceScore(metrics);
      
      let summary = '';
      if (score >= 90) {
        summary = '시스템 성능이 매우 우수합니다.';
      } else if (score >= 70) {
        summary = '시스템 성능이 양호합니다.';
      } else if (score >= 50) {
        summary = '시스템 성능이 보통입니다. 최적화를 고려해보세요.';
      } else {
        summary = '시스템 성능이 저조합니다. 즉시 최적화가 필요합니다.';
      }

      return {
        timestamp: Date.now(),
        metrics,
        health,
        recommendations,
        score,
        summary
      };
    } catch (error) {
      console.error('성능 리포트 생성 실패:', error);
      throw error;
    }
  }
}

export const performanceOptimizationService = new PerformanceOptimizationService();
export default performanceOptimizationService;
