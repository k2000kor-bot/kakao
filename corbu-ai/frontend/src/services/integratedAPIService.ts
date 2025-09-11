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
        this.baseURL = process.env.REACT_APP_INTEGRATED_API_URL || 'http://localhost:5005';
        this.timeout = 30000;
    }

    /**
     * 통합 메시지 분석 (ChatGPT 연동)
     */
    async analyzeMessage(message: string): Promise<IntegratedAnalysisResponse> {
        try {
            const response = await fetch(`${this.baseURL}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: message,
                    analysis_type: 'emotion'
                }),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // ChatGPT 응답을 기존 형식으로 변환
            return {
                success: data.success,
                response: data.data?.details || message,
                analysis: {
                    emotion: {
                        sentiment: data.data?.emotion || 'neutral',
                        confidence: data.data?.confidence || 0.5,
                        positive_score: data.data?.score || 50,
                        negative_score: 100 - (data.data?.score || 50)
                    },
                    keywords: this.extractKeywords(message),
                    intent: {
                        type: 'general',
                        confidence: data.data?.confidence || 0.5
                    },
                    response_time: 0
                },
                timestamp: data.timestamp
            };
        } catch (error) {
            console.error('통합 분석 API 오류:', error);
            throw error;
        }
    }

    /**
     * 키워드 추출 (간단한 구현)
     */
    private extractKeywords(text: string): string[] {
        const words = text.split(' ').filter(word => word.length > 2);
        return words.slice(0, 5); // 최대 5개 키워드
    }

    /**
     * 시스템 상태 조회
     */
    async getSystemStatus(): Promise<SystemStatus> {
        try {
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                status: data.status,
                version: data.version,
                metrics: {
                    total_requests: 0,
                    successful_requests: 0,
                    failed_requests: 0,
                    average_response_time: 0,
                    last_updated: data.timestamp
                },
                timestamp: data.timestamp
            };
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
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                status: data.status,
                service: 'CORBU AI Enhanced',
                timestamp: data.timestamp
            };
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
            const response = await fetch(`${this.baseURL}/metrics`, {
                method: 'GET',
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                success: data.success,
                metrics: {
                    total_requests: data.metrics.total_requests,
                    successful_requests: data.metrics.successful_requests,
                    failed_requests: data.metrics.failed_requests,
                    average_response_time: data.metrics.average_response_time,
                    last_updated: data.timestamp
                },
                timestamp: data.timestamp
            };
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
