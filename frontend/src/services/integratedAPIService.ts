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
        this.baseURL = process.env.REACT_APP_INTEGRATED_API_URL || 'http://localhost:8000/api/integrated';
        this.timeout = 30000;
    }

    /**
     * 통합 메시지 분석
     */
    async analyzeMessage(message: string): Promise<IntegratedAnalysisResponse> {
        try {
            const response = await fetch(`${this.baseURL}/analyze`, {
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
            const response = await fetch(`${this.baseURL}/status`, {
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
            const response = await fetch(`${this.baseURL}/health`, {
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
            const response = await fetch(`${this.baseURL}/metrics`, {
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
     * 분석 대시보드 조회
     */
    async getAnalytics(): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/analytics`, {
                method: 'GET',
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('분석 대시보드 조회 오류:', error);
            throw error;
        }
    }

    /**
     * 시스템 로그 조회
     */
    async getLogs(): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/logs`, {
                method: 'GET',
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('로그 조회 오류:', error);
            throw error;
        }
    }

    /**
     * 창작 콘텐츠 - 스토리 생성
     */
    async generateStory(params: { genre?: string; theme?: string; length?: string }): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/creative/story`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('스토리 생성 오류:', error);
            throw error;
        }
    }

    /**
     * 창작 콘텐츠 - 시 생성
     */
    async generatePoem(params: { type?: string; theme?: string }): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/creative/poem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('시 생성 오류:', error);
            throw error;
        }
    }

    /**
     * 창작 콘텐츠 - 에세이 생성
     */
    async generateEssay(params: { type?: string; topic?: string }): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/creative/essay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('에세이 생성 오류:', error);
            throw error;
        }
    }

    /**
     * 창작 콘텐츠 - 글쓰기 분석
     */
    async analyzeWriting(text: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/creative/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('글쓰기 분석 오류:', error);
            throw error;
        }
    }

    /**
     * 설득 콘텐츠 - 건설사 설득 콘텐츠 생성
     */
    async generateConstructionPersuasion(params: {
        company_name?: string;
        project_type?: string;
        persuasion_level?: string;
    }): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/persuasion/construction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('건설사 설득 콘텐츠 생성 오류:', error);
            throw error;
        }
    }

    /**
     * 설득 콘텐츠 - 시공사 긍정 콘텐츠 생성
     */
    async generateContractorPersuasion(params: {
        company_name?: string;
        service_type?: string;
        persuasion_level?: string;
    }): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/persuasion/contractor`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('시공사 긍정 콘텐츠 생성 오류:', error);
            throw error;
        }
    }

    /**
     * 설득 콘텐츠 분석
     */
    async analyzePersuasion(content: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/persuasion/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('설득 콘텐츠 분석 오류:', error);
            throw error;
        }
    }

    /**
     * 마케팅 콘텐츠 - 소셜미디어 콘텐츠 생성
     */
    async generateSocialMediaContent(params: {
        platform?: string;
        content_type?: string;
        industry?: string;
        company_name?: string;
        tone?: string;
    }): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/marketing/social`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('소셜미디어 콘텐츠 생성 오류:', error);
            throw error;
        }
    }

    /**
     * 마케팅 콘텐츠 - 이메일 마케팅 생성
     */
    async generateEmailMarketing(params: {
        email_type?: string;
        industry?: string;
        company_name?: string;
        urgency_level?: string;
    }): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/marketing/email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('이메일 마케팅 생성 오류:', error);
            throw error;
        }
    }

    /**
     * 마케팅 콘텐츠 분석
     */
    async analyzeMarketingContent(content: string, contentType: string = 'social'): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/marketing/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, content_type: contentType }),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('마케팅 콘텐츠 분석 오류:', error);
            throw error;
        }
    }

    /**
     * 고급 분석 - 고급 데이터 분석
     */
    async getAdvancedAnalytics(params: {
        analysis_type?: string;
        time_range?: string;
        filters?: Record<string, any>;
    }): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/analytics/advanced`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('고급 분석 오류:', error);
            throw error;
        }
    }

    /**
     * 고급 분석 - 예측 분석
     */
    async getPredictions(params: {
        prediction_type?: string;
        prediction_horizon?: string;
    }): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/analytics/predictions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('예측 분석 오류:', error);
            throw error;
        }
    }

    /**
     * 고급 분석 - 인사이트 생성
     */
    async getInsights(params: {
        insight_type?: string;
        focus_area?: string;
    }): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/analytics/insights`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('인사이트 생성 오류:', error);
            throw error;
        }
    }

    /**
     * AI 최적화 - AI 모델 최적화
     */
    async optimizeAI(params: {
        optimization_type?: string;
        target_metric?: string;
    }): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/ai/optimize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('AI 최적화 오류:', error);
            throw error;
        }
    }

    /**
     * AI 최적화 - AI 모델 벤치마크
     */
    async benchmarkAI(params: {
        benchmark_type?: string;
        test_data_size?: string;
    }): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/ai/benchmark`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('AI 벤치마크 오류:', error);
            throw error;
        }
    }

    /**
     * AI 최적화 - AI 피드백 처리
     */
    async submitFeedback(params: {
        feedback_type?: string;
        content?: string;
        rating?: number;
        correction?: string;
        context?: Record<string, any>;
    }): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/ai/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('AI 피드백 처리 오류:', error);
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
