/**
 * CORBU AI 통합 API 서비스
 * - 간단한 통합 API 서버와의 통신
 * - 종합적인 AI 분석 기능 제공
 */

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

class IntegratedAPIService {
    private baseURL: string;
    private timeout: number;

    constructor() {
        this.baseURL = process.env.REACT_APP_INTEGRATED_API_URL || 'http://localhost:5002';
        this.timeout = 30000;
    }

    /**
     * 통합 메시지 분석
     */
    async analyzeMessage(message: string): Promise<IntegratedAnalysisResponse> {
        try {
            const response = await fetch(`${this.baseURL}/api/integrated/analyze`, {
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
            return data;
        } catch (error) {
            console.error('통합 분석 API 오류:', error);
            throw error;
        }
    }

    /**
     * 시스템 상태 조회
     */
    async getSystemStatus(): Promise<SystemStatus> {
        try {
            const response = await fetch(`${this.baseURL}/api/integrated/status`, {
                method: 'GET',
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('시스템 상태 조회 오류:', error);
            throw error;
        }
    }

    /**
     * 헬스 체크
     */
    async healthCheck(): Promise<{ status: string; service: string; timestamp: string }> {
        try {
            const response = await fetch(`${this.baseURL}/api/integrated/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('헬스 체크 오류:', error);
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
            const response = await fetch(`${this.baseURL}/api/integrated/metrics`, {
                method: 'GET',
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('메트릭 조회 오류:', error);
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
            console.error('서버 연결 실패:', error);
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

export default IntegratedAPIService;
