import {
  API_HEALTH_PATH,
  API_PROJECTS_LIST_PATH,
  API_SESSIONS_LIST_PATH,
  CHAT_POST_PATH,
  DATA_ANALYTICS_SOURCES_PATH,
  EMOTION_RECOGNITION_ANALYZE_PATH,
} from '../config/api';

interface CacheConfig {
    ttl: number; // Time to live in seconds
    maxSize: number; // Maximum cache size
    strategy: 'lru' | 'fifo' | 'ttl';
}

interface ApiMetrics {
    endpoint: string;
    responseTime: number;
    successRate: number;
    errorRate: number;
    cacheHitRate: number;
    lastUpdated: Date;
}

interface OptimizationSuggestion {
    id: string;
    type: 'caching' | 'compression' | 'pagination' | 'batching' | 'preloading';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'easy' | 'medium' | 'hard';
    estimatedImprovement: string;
}

export class ApiOptimizationService {
    private cache: Map<string, { data: unknown; timestamp: number; ttl: number }> = new Map();
    private metrics: Map<string, ApiMetrics> = new Map();
    private cacheConfig: CacheConfig = {
        ttl: 300, // 5 minutes
        maxSize: 1000,
        strategy: 'lru'
    };

    constructor() {
        this.initializeMetrics();
        this.startMetricsCollection();
    }

    private initializeMetrics(): void {
        const endpoints = [
            CHAT_POST_PATH,
            EMOTION_RECOGNITION_ANALYZE_PATH,
            DATA_ANALYTICS_SOURCES_PATH,
            API_HEALTH_PATH,
            API_PROJECTS_LIST_PATH,
            API_SESSIONS_LIST_PATH,
        ];

        endpoints.forEach(endpoint => {
            this.metrics.set(endpoint, {
                endpoint,
                responseTime: 0,
                successRate: 100,
                errorRate: 0,
                cacheHitRate: 0,
                lastUpdated: new Date()
            });
        });
    }

    private startMetricsCollection(): void {
        // 실시간 메트릭 수집 시뮬레이션
        setInterval(() => {
            this.updateMetrics();
        }, 10000); // 10초마다 업데이트
    }

    private updateMetrics(): void {
        this.metrics.forEach((metric, _endpoint) => {
            // 시뮬레이션된 메트릭 업데이트
            metric.responseTime = Math.random() * 100 + 50; // 50-150ms
            metric.successRate = Math.max(95, 100 - Math.random() * 5);
            metric.errorRate = Math.min(5, Math.random() * 5);
            metric.cacheHitRate = Math.random() * 30 + 20; // 20-50%
            metric.lastUpdated = new Date();
        });
    }

    // 캐시 관리
    public setCache(key: string, data: unknown, ttl?: number): void {
        const cacheTTL = ttl || this.cacheConfig.ttl;

        // 캐시 크기 제한 확인
        if (this.cache.size >= this.cacheConfig.maxSize) {
            this.evictCache();
        }

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: cacheTTL * 1000 // Convert to milliseconds
        });
    }

    public getCache(key: string): unknown | null {
        const cached = this.cache.get(key);

        if (!cached) {
            return null;
        }

        // TTL 확인
        if (Date.now() - cached.timestamp > cached.ttl) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    private evictCache(): void {
        if (this.cacheConfig.strategy === 'lru') {
            // LRU 전략: 가장 오래된 항목 제거
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        } else if (this.cacheConfig.strategy === 'fifo') {
            // FIFO 전략: 첫 번째 항목 제거
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        } else if (this.cacheConfig.strategy === 'ttl') {
            // TTL 전략: 만료된 항목들 제거
            const now = Date.now();
            for (const [key, value] of this.cache.entries()) {
                if (now - value.timestamp > value.ttl) {
                    this.cache.delete(key);
                }
            }
        }
    }

    // API 요청 최적화
    public async optimizedRequest<T>(
        url: string,
        options: RequestInit = {},
        useCache: boolean = true
    ): Promise<T> {
        const cacheKey = this.generateCacheKey(url, options);

        // 캐시 확인
        if (useCache) {
            const cachedData = this.getCache(cacheKey);
            if (cachedData) {
                this.updateCacheHitRate(url);
                return cachedData as T;
            }
        }

        const startTime = Date.now();

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...options.headers
                }
            });

            const responseTime = Date.now() - startTime;
            this.updateResponseTime(url, responseTime);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // 성공적인 응답 캐시
            if (useCache && response.ok) {
                this.setCache(cacheKey, data);
            }

            this.updateSuccessRate(url, true);
            return data;

        } catch (error) {
            this.updateSuccessRate(url, false);
            throw error;
        }
    }

    private generateCacheKey(url: string, options: RequestInit): string {
        const method = options.method || 'GET';
        const body = options.body ? JSON.stringify(options.body) : '';
        return `${method}:${url}:${body}`;
    }

    private updateResponseTime(endpoint: string, responseTime: number): void {
        const metric = this.metrics.get(endpoint);
        if (metric) {
            metric.responseTime = responseTime;
            metric.lastUpdated = new Date();
        }
    }

    private updateSuccessRate(endpoint: string, success: boolean): void {
        const metric = this.metrics.get(endpoint);
        if (metric) {
            if (success) {
                metric.successRate = Math.min(100, metric.successRate + 0.1);
                metric.errorRate = Math.max(0, metric.errorRate - 0.1);
            } else {
                metric.successRate = Math.max(0, metric.successRate - 1);
                metric.errorRate = Math.min(100, metric.errorRate + 1);
            }
            metric.lastUpdated = new Date();
        }
    }

    private updateCacheHitRate(endpoint: string): void {
        const metric = this.metrics.get(endpoint);
        if (metric) {
            metric.cacheHitRate = Math.min(100, metric.cacheHitRate + 0.5);
            metric.lastUpdated = new Date();
        }
    }

    // 메트릭 조회
    public getMetrics(): ApiMetrics[] {
        return Array.from(this.metrics.values());
    }

    public getMetric(endpoint: string): ApiMetrics | undefined {
        return this.metrics.get(endpoint);
    }

    // 최적화 제안
    public getOptimizationSuggestions(): OptimizationSuggestion[] {
        const suggestions: OptimizationSuggestion[] = [];
        const metrics = this.getMetrics();

        metrics.forEach(metric => {
            // 응답 시간이 느린 경우
            if (metric.responseTime > 200) {
                suggestions.push({
                    id: `caching-${metric.endpoint}`,
                    type: 'caching',
                    title: `${metric.endpoint} 캐싱 개선`,
                    description: `응답 시간이 ${metric.responseTime.toFixed(0)}ms로 느립니다. 캐싱을 통해 성능을 개선할 수 있습니다.`,
                    impact: 'high',
                    effort: 'easy',
                    estimatedImprovement: '50-70% 응답 시간 단축'
                });
            }

            // 에러율이 높은 경우
            if (metric.errorRate > 5) {
                suggestions.push({
                    id: `error-handling-${metric.endpoint}`,
                    type: 'compression',
                    title: `${metric.endpoint} 에러 처리 개선`,
                    description: `에러율이 ${metric.errorRate.toFixed(1)}%로 높습니다. 에러 처리 로직을 개선해야 합니다.`,
                    impact: 'high',
                    effort: 'medium',
                    estimatedImprovement: '에러율 80% 감소'
                });
            }

            // 캐시 히트율이 낮은 경우
            if (metric.cacheHitRate < 30) {
                suggestions.push({
                    id: `cache-strategy-${metric.endpoint}`,
                    type: 'caching',
                    title: `${metric.endpoint} 캐시 전략 개선`,
                    description: `캐시 히트율이 ${metric.cacheHitRate.toFixed(1)}%로 낮습니다. 캐시 전략을 재검토해야 합니다.`,
                    impact: 'medium',
                    effort: 'medium',
                    estimatedImprovement: '캐시 히트율 40% 향상'
                });
            }
        });

        // 일반적인 최적화 제안
        suggestions.push(
            {
                id: 'response-compression',
                type: 'compression',
                title: '응답 압축 활성화',
                description: 'Gzip 압축을 통해 네트워크 전송량을 줄일 수 있습니다.',
                impact: 'medium',
                effort: 'easy',
                estimatedImprovement: '30-50% 전송량 감소'
            },
            {
                id: 'request-batching',
                type: 'batching',
                title: '요청 배치 처리',
                description: '여러 API 요청을 배치로 처리하여 네트워크 오버헤드를 줄입니다.',
                impact: 'high',
                effort: 'hard',
                estimatedImprovement: '60-80% 네트워크 요청 감소'
            },
            {
                id: 'data-preloading',
                type: 'preloading',
                title: '데이터 사전 로딩',
                description: '사용자가 필요로 할 데이터를 미리 로딩하여 사용자 경험을 개선합니다.',
                impact: 'medium',
                effort: 'medium',
                estimatedImprovement: '40-60% 로딩 시간 단축'
            }
        );

        return suggestions;
    }

    // 캐시 통계
    public getCacheStats(): {
        size: number;
        hitRate: number;
        missRate: number;
        totalRequests: number;
    } {
        const totalRequests = this.cache.size * 2; // 시뮬레이션
        const hitRate = this.cache.size > 0 ? (this.cache.size / totalRequests) * 100 : 0;

        return {
            size: this.cache.size,
            hitRate: Math.min(100, hitRate),
            missRate: Math.max(0, 100 - hitRate),
            totalRequests
        };
    }

    // 캐시 클리어
    public clearCache(): void {
        this.cache.clear();
    }

    // 캐시 설정 업데이트
    public updateCacheConfig(config: Partial<CacheConfig>): void {
        this.cacheConfig = { ...this.cacheConfig, ...config };
    }
}

// 싱글톤 인스턴스
export const apiOptimizationService = new ApiOptimizationService();

export default apiOptimizationService;
export type { CacheConfig, ApiMetrics, OptimizationSuggestion };
