/**
 * CORBU.AI 통합 API 서비스
 * - 간단한 통합 API 서버와의 통신
 * - 종합적인 AI 분석 기능 제공
 */

import {
    INTEGRATED_API_ANALYZE_PATH,
    INTEGRATED_API_HEALTH_PATH,
    INTEGRATED_API_METRICS_PATH,
    INTEGRATED_API_STATUS_PATH,
    joinApiHealthCheckUrl,
    resolveApiBaseUrl,
} from '../config/api';
import { errorLogger } from '../utils/errorLogger';

interface IntegratedAnalysisRequest {
    message: string;
}

interface IntegratedAnalysisResponse {
    success: boolean;
    response: string;
    analysis: {
        emotion: {
            sentiment: string;
            confidence: number;
            positive_score: number;
            negative_score: number;
        };
        keywords: string[];
        intent: {
            type: string;
            confidence: number;
        };
        response_time: number;
    };
    timestamp: string;
}

interface SystemStatus {
    status: string;
    version: string;
    metrics: {
        total_requests: number;
        successful_requests: number;
        failed_requests: number;
        average_response_time: number;
        last_updated: string;
    };
    timestamp: string;
}

export class IntegratedAPIService {
    private baseURL: string;
    private timeout: number;

    constructor() {
        this.baseURL = (process.env.REACT_APP_INTEGRATED_API_URL || resolveApiBaseUrl());
        this.timeout = 30000;
    }

    /**
     * 통합 메시지 분석
     */
    async analyzeMessage(message: string): Promise<IntegratedAnalysisResponse> {
        try {
            const response = await fetch(joinApiHealthCheckUrl(this.baseURL, INTEGRATED_API_ANALYZE_PATH), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            // 백엔드가 create_success_response로 감싸므로 data.data가 실제 분석 결과
            if (data.success && data.data != null) {
                return data.data as IntegratedAnalysisResponse;
            }
            return data as IntegratedAnalysisResponse;
        } catch (error) {
            errorLogger.error('통합 분석 API 오류', error instanceof Error ? error : new Error(String(error)), { component: 'IntegratedAPIService', action: 'analyzeMessage' });
            throw error;
        }
    }

    /**
     * 시스템 상태 조회
     */
    async getSystemStatus(): Promise<SystemStatus> {
        try {
            const response = await fetch(joinApiHealthCheckUrl(this.baseURL, INTEGRATED_API_STATUS_PATH), {
                method: 'GET',
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.success && data.data != null) return data.data as SystemStatus;
            return data as SystemStatus;
        } catch (error) {
            errorLogger.error('시스템 상태 조회 오류', error instanceof Error ? error : new Error(String(error)), { component: 'IntegratedAPIService', action: 'getSystemStatus' });
            throw error;
        }
    }

    /**
     * 헬스 체크
     */
    async healthCheck(): Promise<{ status: string; service: string; timestamp: string }> {
        try {
            const response = await fetch(joinApiHealthCheckUrl(this.baseURL, INTEGRATED_API_HEALTH_PATH), {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.success && data.data != null) {
                return { ...data.data, timestamp: data.timestamp } as { status: string; service: string; timestamp: string };
            }
            return data;
        } catch (error) {
            errorLogger.error('헬스 체크 오류', error instanceof Error ? error : new Error(String(error)), { component: 'IntegratedAPIService', action: 'healthCheck' });
            throw error;
        }
    }

    /**
     * 성능 메트릭 조회
     */
    async getMetrics(): Promise<{
        success: boolean; metrics: {
            total_requests: number;
            successful_requests: number;
            failed_requests: number;
            average_response_time: number;
            last_updated: string;
        }; timestamp: string
    }> {
        try {
            const response = await fetch(joinApiHealthCheckUrl(this.baseURL, INTEGRATED_API_METRICS_PATH), {
                method: 'GET',
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.success && data.data != null) {
                return { success: true, metrics: data.data.metrics ?? data.data, timestamp: data.timestamp };
            }
            return data;
        } catch (error) {
            errorLogger.error('메트릭 조회 오류', error instanceof Error ? error : new Error(String(error)), { component: 'IntegratedAPIService', action: 'getMetrics' });
            throw error;
        }
    }

    /**
     * 서버 연결 테스트
     */
    async testConnection(): Promise<boolean> {
        try {
            await this.healthCheck();
            return true;
        } catch (error) {
            errorLogger.error('서버 연결 실패', error instanceof Error ? error : new Error(String(error)), { component: 'IntegratedAPIService', action: 'testConnection' });
            return false;
        }
    }
}

// 싱글톤 인스턴스 생성
export const integratedAPIService = new IntegratedAPIService();

// 타입들도 export
export type {
    IntegratedAnalysisRequest,
    IntegratedAnalysisResponse,
    SystemStatus
};

export default integratedAPIService;
