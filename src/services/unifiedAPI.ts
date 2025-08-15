// 통합 API 서비스
// 모든 백엔드 API 호출을 중앙에서 관리

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: string;
}

export interface ConversationalQARequest {
    question: string;
    context?: string;
}

export interface ConversationalQAResponse {
    answer: string;
    confidence: number;
    follow_up_questions: string[];
    question_analysis: {
        confidence: number;
        question_type: string;
        intent: string;
        keywords: string[];
        entities: string[];
    };
    sources: Array<{
        content: string;
        confidence: number;
        relevance_score: number;
        source_id: string;
        source_type: string;
    }>;
    related_topics: string[];
    timestamp: string;
}

class UnifiedAPI {
    private baseURL: string;

    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // 헬스 체크
    async healthCheck(): Promise<APIResponse> {
        try {
            const response = await fetch(`${this.baseURL}/api/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Health check failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            };
        }
    }

    // 대화형 QA
    async conversationalQA(request: ConversationalQARequest): Promise<APIResponse<ConversationalQAResponse>> {
        try {
            const response = await fetch(`${this.baseURL}/api/conversational/qa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                return {
                    success: true,
                    data: data.result,
                    timestamp: new Date().toISOString(),
                };
            } else {
                throw new Error(data.error || 'API request failed');
            }
        } catch (error) {
            console.error('Conversational QA failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            };
        }
    }

    // 파일 업로드
    async uploadFile(file: File, projectId?: string): Promise<APIResponse> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (projectId) {
                formData.append('project_id', projectId);
            }

            const response = await fetch(`${this.baseURL}/api/files/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error('File upload failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            };
        }
    }

    // 파일 목록 조회
    async getFiles(projectId?: string): Promise<APIResponse> {
        try {
            const url = projectId
                ? `${this.baseURL}/api/files?project_id=${projectId}`
                : `${this.baseURL}/api/files`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Get files failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            };
        }
    }

    // 종합 분석
    async comprehensiveAnalysis(request: any): Promise<APIResponse> {
        try {
            const response = await fetch(`${this.baseURL}/api/analysis/comprehensive`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Comprehensive analysis failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            };
        }
    }

    // 시스템 정보
    async getSystemInfo(): Promise<APIResponse> {
        try {
            const response = await fetch(`${this.baseURL}/api/system/info`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Get system info failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            };
        }
    }

    // 연결 테스트
    async testConnection(): Promise<boolean> {
        try {
            const healthResponse = await this.healthCheck();
            return healthResponse.success;
        } catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }
}

const unifiedAPI = new UnifiedAPI();
export default unifiedAPI;
