// CORBU AI 통합 시스템 API 서비스
// 모든 백엔드 시스템을 통합하여 관리하는 중앙 API 서비스

import axios, { AxiosInstance, AxiosResponse } from 'axios';

// ===== 기본 인터페이스 =====
export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp?: string;
}

export interface SystemStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: {
        [key: string]: {
            status: 'up' | 'down' | 'degraded';
            responseTime?: number;
            lastCheck?: string;
        };
    };
    uptime: number;
    version: string;
}

// ===== 통합 시스템 API 클래스 =====
class IntegratedSystemAPI {
    private api: AxiosInstance;
    private baseURL: string;
    private services: {
        [key: string]: {
            url: string;
            status: 'up' | 'down' | 'unknown';
            lastCheck: number;
        };
    };

    constructor() {
        this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        this.api = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // 서비스 엔드포인트 정의
        this.services = {
            main: { url: 'http://localhost:5001', status: 'unknown', lastCheck: 0 },
            ai: { url: 'http://localhost:8002', status: 'unknown', lastCheck: 0 },
            unified: { url: 'http://localhost:8003', status: 'unknown', lastCheck: 0 },
            ultimate: { url: 'http://localhost:8004', status: 'unknown', lastCheck: 0 },
        };

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // 요청 인터셉터
        this.api.interceptors.request.use(
            (config) => {
                console.log(`[Integrated API] ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                console.error('[Integrated API] Request Error:', error);
                return Promise.reject(error);
            }
        );

        // 응답 인터셉터
        this.api.interceptors.response.use(
            (response: AxiosResponse) => {
                console.log(`[Integrated API] Response: ${response.status} ${response.config.url}`);
                return response;
            },
            (error) => {
                console.error('[Integrated API] Response Error:', error);
                return Promise.reject(error);
            }
        );
    }

    // ===== 시스템 상태 관리 =====
    async checkSystemHealth(): Promise<SystemStatus> {
        const healthChecks = await Promise.allSettled([
            this.checkServiceHealth('main'),
            this.checkServiceHealth('ai'),
            this.checkServiceHealth('unified'),
            this.checkServiceHealth('ultimate'),
        ]);

        const services: SystemStatus['services'] = {};
        let overallStatus: SystemStatus['status'] = 'healthy';

        healthChecks.forEach((result, index) => {
            const serviceName = Object.keys(this.services)[index];
            if (result.status === 'fulfilled') {
                services[serviceName] = {
                    status: 'up',
                    responseTime: result.value.responseTime,
                    lastCheck: new Date().toISOString(),
                };
            } else {
                services[serviceName] = {
                    status: 'down',
                    lastCheck: new Date().toISOString(),
                };
                overallStatus = 'degraded';
            }
        });

        return {
            status: overallStatus,
            services,
            uptime: Date.now(),
            version: '1.0.0',
        };
    }

    private async checkServiceHealth(serviceName: string): Promise<{ responseTime: number }> {
        const startTime = Date.now();
        const service = this.services[serviceName];

        try {
            const response = await axios.get(`${service.url}/api/health`, { timeout: 5000 });
            const responseTime = Date.now() - startTime;

            this.services[serviceName].status = 'up';
            this.services[serviceName].lastCheck = Date.now();

            return { responseTime };
        } catch (error) {
            this.services[serviceName].status = 'down';
            this.services[serviceName].lastCheck = Date.now();
            throw error;
        }
    }

    // ===== 통합 채팅 API =====
    async sendMessage(message: string, context?: any): Promise<APIResponse> {
        try {
            const response = await this.api.post('/api/chat', {
                message,
                context,
            });
            return response.data;
        } catch (error) {
            console.error('채팅 메시지 전송 실패:', error);
            return {
                success: false,
                error: '메시지 전송에 실패했습니다.',
                timestamp: new Date().toISOString(),
            };
        }
    }

    // ===== 감정 분석 API =====
    async analyzeEmotion(content: string, type: string = 'text'): Promise<APIResponse> {
        try {
            const response = await this.api.post('/api/emotion-recognition/analyze', {
                content,
                type,
            });
            return response.data;
        } catch (error) {
            console.error('감정 분석 실패:', error);
            return {
                success: false,
                error: '감정 분석에 실패했습니다.',
                timestamp: new Date().toISOString(),
            };
        }
    }

    // ===== 데이터 분석 API =====
    async getDataSources(): Promise<APIResponse> {
        try {
            const response = await this.api.get('/api/data-analytics/sources');
            return response.data;
        } catch (error) {
            console.error('데이터 소스 조회 실패:', error);
            return {
                success: false,
                error: '데이터 소스 조회에 실패했습니다.',
                timestamp: new Date().toISOString(),
            };
        }
    }

    async createDataSource(sourceData: any): Promise<APIResponse> {
        try {
            const response = await this.api.post('/api/data-analytics/sources', sourceData);
            return response.data;
        } catch (error) {
            console.error('데이터 소스 생성 실패:', error);
            return {
                success: false,
                error: '데이터 소스 생성에 실패했습니다.',
                timestamp: new Date().toISOString(),
            };
        }
    }

    // ===== 품질 보증 API =====
    async getQualityTests(): Promise<APIResponse> {
        try {
            const response = await this.api.get('/api/quality-assurance/tests');
            return response.data;
        } catch (error) {
            console.error('품질 테스트 조회 실패:', error);
            return {
                success: false,
                error: '품질 테스트 조회에 실패했습니다.',
                timestamp: new Date().toISOString(),
            };
        }
    }

    async getQualityTestSuites(): Promise<APIResponse> {
        try {
            const response = await this.api.get('/api/quality-assurance/test-suites');
            return response.data;
        } catch (error) {
            console.error('테스트 스위트 조회 실패:', error);
            return {
                success: false,
                error: '테스트 스위트 조회에 실패했습니다.',
                timestamp: new Date().toISOString(),
            };
        }
    }

    async startQualityTest(testSuiteId: string): Promise<APIResponse> {
        try {
            const response = await this.api.post('/api/quality-assurance/automated-execution', {
                test_suite_id: testSuiteId,
            });
            return response.data;
        } catch (error) {
            console.error('품질 테스트 시작 실패:', error);
            return {
                success: false,
                error: '품질 테스트 시작에 실패했습니다.',
                timestamp: new Date().toISOString(),
            };
        }
    }

    // ===== 성능 최적화 API =====
    async getPerformanceMetrics(): Promise<APIResponse> {
        try {
            const response = await this.api.get('/api/performance-optimization/metrics');
            return response.data;
        } catch (error) {
            console.error('성능 메트릭 조회 실패:', error);
            return {
                success: false,
                error: '성능 메트릭 조회에 실패했습니다.',
                timestamp: new Date().toISOString(),
            };
        }
    }

    async getSystemHealth(): Promise<APIResponse> {
        try {
            const response = await this.api.get('/api/performance-optimization/health');
            return response.data;
        } catch (error) {
            console.error('시스템 상태 조회 실패:', error);
            return {
                success: false,
                error: '시스템 상태 조회에 실패했습니다.',
                timestamp: new Date().toISOString(),
            };
        }
    }

    // ===== 통합 분석 API =====
    async performComprehensiveAnalysis(data: any): Promise<APIResponse> {
        try {
            const response = await this.api.post('/api/comprehensive-analysis', data);
            return response.data;
        } catch (error) {
            console.error('종합 분석 실패:', error);
            return {
                success: false,
                error: '종합 분석에 실패했습니다.',
                timestamp: new Date().toISOString(),
            };
        }
    }

    // ===== 파일 처리 API =====
    async uploadFile(file: File, projectId?: string): Promise<APIResponse> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (projectId) {
                formData.append('project_id', projectId);
            }

            const response = await this.api.post('/api/file/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('파일 업로드 실패:', error);
            return {
                success: false,
                error: '파일 업로드에 실패했습니다.',
                timestamp: new Date().toISOString(),
            };
        }
    }

    async getFileList(): Promise<APIResponse> {
        try {
            const response = await this.api.get('/api/files');
            return response.data;
        } catch (error) {
            console.error('파일 목록 조회 실패:', error);
            return {
                success: false,
                error: '파일 목록 조회에 실패했습니다.',
                timestamp: new Date().toISOString(),
            };
        }
    }

    // ===== 프로젝트 관리 API =====
    async getProjects(): Promise<APIResponse> {
        try {
            const response = await this.api.get('/api/projects');
            return response.data;
        } catch (error) {
            console.error('프로젝트 목록 조회 실패:', error);
            return {
                success: false,
                error: '프로젝트 목록 조회에 실패했습니다.',
                timestamp: new Date().toISOString(),
            };
        }
    }

    async createProject(projectData: any): Promise<APIResponse> {
        try {
            const response = await this.api.post('/api/projects', projectData);
            return response.data;
        } catch (error) {
            console.error('프로젝트 생성 실패:', error);
            return {
                success: false,
                error: '프로젝트 생성에 실패했습니다.',
                timestamp: new Date().toISOString(),
            };
        }
    }

    // ===== 실시간 모니터링 =====
    async getRealTimeMetrics(): Promise<APIResponse> {
        try {
            const response = await this.api.get('/api/real-time/metrics');
            return response.data;
        } catch (error) {
            console.error('실시간 메트릭 조회 실패:', error);
            return {
                success: false,
                error: '실시간 메트릭 조회에 실패했습니다.',
                timestamp: new Date().toISOString(),
            };
        }
    }

    // ===== 시스템 설정 =====
    async getSystemConfig(): Promise<APIResponse> {
        try {
            const response = await this.api.get('/api/system/config');
            return response.data;
        } catch (error) {
            console.error('시스템 설정 조회 실패:', error);
            return {
                success: false,
                error: '시스템 설정 조회에 실패했습니다.',
                timestamp: new Date().toISOString(),
            };
        }
    }

    async updateSystemConfig(config: any): Promise<APIResponse> {
        try {
            const response = await this.api.put('/api/system/config', config);
            return response.data;
        } catch (error) {
            console.error('시스템 설정 업데이트 실패:', error);
            return {
                success: false,
                error: '시스템 설정 업데이트에 실패했습니다.',
                timestamp: new Date().toISOString(),
            };
        }
    }

    // ===== 유틸리티 메서드 =====
    getServiceStatus(serviceName: string): { status: string; lastCheck: number } {
        const service = this.services[serviceName];
        return {
            status: service?.status || 'unknown',
            lastCheck: service?.lastCheck || 0,
        };
    }

    getAllServices(): { [key: string]: { status: string; lastCheck: number } } {
        const result: { [key: string]: { status: string; lastCheck: number } } = {};
        Object.keys(this.services).forEach(key => {
            result[key] = this.getServiceStatus(key);
        });
        return result;
    }

    // ===== 연결 테스트 =====
    async testConnection(): Promise<boolean> {
        try {
            const response = await this.api.get('/api/health');
            return response.status === 200;
        } catch (error) {
            console.error('연결 테스트 실패:', error);
            return false;
        }
    }
}

// 싱글톤 인스턴스 생성
const integratedSystemAPI = new IntegratedSystemAPI();

export default integratedSystemAPI;
export { IntegratedSystemAPI };
