// CORBU.AI 통합 시스템 API 서비스
// 모든 백엔드 시스템을 통합하여 관리하는 중앙 API 서비스

import axios, { AxiosInstance, AxiosResponse } from 'axios';

import {
  API_BASE_URL,
  API_FORM_FIELD_FILE,
  API_HEALTH_PATH,
  API_PROJECTS_LIST_PATH,
  API_QUERY_PARAM_PROJECT_ID,
  COMPREHENSIVE_ANALYSIS_PATH,
  DATA_ANALYTICS_SOURCES_PATH,
  EMOTION_RECOGNITION_ANALYZE_PATH,
  FALLBACK_API_ORIGIN,
  FILES_COLLECTION_PATH,
  INTEGRATED_FILE_UPLOAD_PATH,
  PERFORMANCE_OPTIMIZATION_HEALTH_PATH,
  PERFORMANCE_OPTIMIZATION_METRICS_PATH,
  QUALITY_ASSURANCE_AUTOMATED_EXECUTION_PATH,
  QUALITY_ASSURANCE_TEST_SUITES_PATH,
  QUALITY_ASSURANCE_TESTS_PATH,
  REAL_TIME_METRICS_PATH,
  SYSTEM_CONFIG_PATH,
  joinApiHealthCheckUrl,
  resolveAxiosHttpOriginBaseUrl,
} from '../config/api';
import { errorLogger, toError } from '../utils/errorLogger';
import {
    DEFAULT_CHAT_POST_AXIOS_OPTIONS,
    DEFAULT_CHAT_POST_FALLBACK_OPTIONS,
    postChatAxiosWithFallback,
} from '../utils/apiClient';
import { DEFAULT_CHAT_PERSPECTIVE, DEFAULT_CHAT_RESPONSE_STYLE } from '../utils/modernChatUrlStyle';
import {
    mergeApiChatContextPayload,
    normalizeChatTurnsForApiMerge,
    resolveMergeOptionsFromHistoryAndExplicit,
    type ChatTurn,
    type MergeApiChatContextPayloadOptions,
} from './modernChatContextBuilder';
import { enrichChatContextRecordWithOptionalMultilayerStyleHint } from './multiLayerStyleAnalysisSystem';

/** `sendMessage` 3번째 인자 — 파이프라인 히스토리·시나리오 상속용 (본문에 그대로 노출되지 않음) */
export interface IntegratedSystemChatSendOptions {
    conversationHistory?: ChatTurn[];
    /** 미지정 시 `conversationHistory`로 `scenarioInheritMergeOptionsFromMessages` 유도 */
    mergeApiChatContextOptions?: MergeApiChatContextPayloadOptions;
}

// ===== 기본 인터페이스 =====
export interface APIResponse<T = unknown> {
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
        this.baseURL = resolveAxiosHttpOriginBaseUrl((API_BASE_URL || FALLBACK_API_ORIGIN).trim());
        this.api = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const origin = API_BASE_URL || FALLBACK_API_ORIGIN;
        // 통합 main_server(5002) 기준 — 레거시 다중 포트는 환경별로 덮어쓰기
        this.services = {
            main: { url: origin, status: 'unknown', lastCheck: 0 },
            ai: { url: origin, status: 'unknown', lastCheck: 0 },
            unified: { url: origin, status: 'unknown', lastCheck: 0 },
            ultimate: { url: origin, status: 'unknown', lastCheck: 0 },
        };

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // 요청 인터셉터
        this.api.interceptors.request.use(
            (config) => {
                errorLogger.info('[Integrated API] Request', {
                    component: 'integratedSystemAPI',
                    action: 'request',
                    method: config.method?.toUpperCase(),
                    url: config.url,
                });
                return config;
            },
            (error) => {
                const err = toError(error);
                errorLogger.error('[Integrated API] Request Error', err, {
                    component: 'integratedSystemAPI',
                    action: 'request',
                });
                return Promise.reject(error);
            }
        );

        // 응답 인터셉터
        this.api.interceptors.response.use(
            (response: AxiosResponse) => {
                errorLogger.info('[Integrated API] Response', {
                    component: 'integratedSystemAPI',
                    action: 'response',
                    status: response.status,
                    url: response.config.url,
                });
                return response;
            },
            (error) => {
                const err = toError(error);
                errorLogger.error('[Integrated API] Response Error', err, {
                    component: 'integratedSystemAPI',
                    action: 'response',
                });
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
            const _response = await axios.get(joinApiHealthCheckUrl(service.url), { timeout: 5000 });
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

    // ===== 통합 대화 API =====
    async sendMessage(
        message: string,
        context?: Record<string, unknown>,
        chatOptions?: IntegratedSystemChatSendOptions
    ): Promise<APIResponse> {
        try {
            const optHist = chatOptions?.conversationHistory;
            const rawHist = Array.isArray(optHist) ? optHist : [];
            const history = normalizeChatTurnsForApiMerge(rawHist);
            const mergeForPayload = resolveMergeOptionsFromHistoryAndExplicit(
                history,
                chatOptions?.mergeApiChatContextOptions
            );
            const enrichedContext = await enrichChatContextRecordWithOptionalMultilayerStyleHint(
                message,
                context
            );
            const { quality, contextForBody } = mergeApiChatContextPayload(
                message,
                enrichedContext,
                history.length > 0 ? history : undefined,
                mergeForPayload
            );
            const body: Record<string, unknown> = {
                message,
                quality,
                response_style: DEFAULT_CHAT_RESPONSE_STYLE,
                perspective: DEFAULT_CHAT_PERSPECTIVE,
                ...(contextForBody ? { context: contextForBody } : {}),
            };
            const response = (await postChatAxiosWithFallback(
                this.baseURL,
                body,
                DEFAULT_CHAT_POST_AXIOS_OPTIONS,
                { ...DEFAULT_CHAT_POST_FALLBACK_OPTIONS, axiosInstance: this.api }
            )) as AxiosResponse<APIResponse>;
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('대화 메시지 전송 실패', err, {
                component: 'integratedSystemAPI',
                action: 'sendMessage',
                messagePreview: message,
            });
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
            const response = await this.api.post(EMOTION_RECOGNITION_ANALYZE_PATH, {
                content,
                type,
            });
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('감정 분석 실패', err, {
                component: 'integratedSystemAPI',
                action: 'analyzeEmotion',
                contentType: type,
            });
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
            const response = await this.api.get(DATA_ANALYTICS_SOURCES_PATH);
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('데이터 소스 조회 실패', err, {
                component: 'integratedSystemAPI',
                action: 'getDataSources',
            });
            return {
                success: false,
                error: '데이터 소스 조회에 실패했습니다.',
                timestamp: new Date().toISOString(),
            };
        }
    }

    async createDataSource(sourceData: Record<string, unknown>): Promise<APIResponse> {
        try {
            const response = await this.api.post(DATA_ANALYTICS_SOURCES_PATH, sourceData);
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('데이터 소스 생성 실패', err, {
                component: 'integratedSystemAPI',
                action: 'createDataSource',
            });
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
            const response = await this.api.get(QUALITY_ASSURANCE_TESTS_PATH);
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('품질 테스트 조회 실패', err, {
                component: 'integratedSystemAPI',
                action: 'getQualityTests',
            });
            return {
                success: false,
                error: '품질 테스트 조회에 실패했습니다.',
                timestamp: new Date().toISOString(),
            };
        }
    }

    async getQualityTestSuites(): Promise<APIResponse> {
        try {
            const response = await this.api.get(QUALITY_ASSURANCE_TEST_SUITES_PATH);
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('테스트 스위트 조회 실패', err, {
                component: 'integratedSystemAPI',
                action: 'getQualityTestSuites',
            });
            return {
                success: false,
                error: '테스트 스위트 조회에 실패했습니다.',
                timestamp: new Date().toISOString(),
            };
        }
    }

    async startQualityTest(testSuiteId: string): Promise<APIResponse> {
        try {
            const response = await this.api.post(QUALITY_ASSURANCE_AUTOMATED_EXECUTION_PATH, {
                test_suite_id: testSuiteId,
            });
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('품질 테스트 시작 실패', err, {
                component: 'integratedSystemAPI',
                action: 'startQualityTest',
                testSuiteId,
            });
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
            const response = await this.api.get(PERFORMANCE_OPTIMIZATION_METRICS_PATH);
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('성능 메트릭 조회 실패', err, {
                component: 'integratedSystemAPI',
                action: 'getPerformanceMetrics',
            });
            return {
                success: false,
                error: '성능 메트릭 조회에 실패했습니다.',
                timestamp: new Date().toISOString(),
            };
        }
    }

    async getSystemHealth(): Promise<APIResponse> {
        try {
            const response = await this.api.get(PERFORMANCE_OPTIMIZATION_HEALTH_PATH);
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('시스템 상태 조회 실패', err, {
                component: 'integratedSystemAPI',
                action: 'getSystemHealth',
            });
            return {
                success: false,
                error: '시스템 상태 조회에 실패했습니다.',
                timestamp: new Date().toISOString(),
            };
        }
    }

    // ===== 통합 분석 API =====
    async performComprehensiveAnalysis(data: Record<string, unknown>): Promise<APIResponse> {
        try {
            const response = await this.api.post(COMPREHENSIVE_ANALYSIS_PATH, data);
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('종합 분석 실패', err, {
                component: 'integratedSystemAPI',
                action: 'performComprehensiveAnalysis',
            });
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
            formData.append(API_FORM_FIELD_FILE, file);
            if (projectId) {
                formData.append(API_QUERY_PARAM_PROJECT_ID, projectId);
            }

            const response = await this.api.post(INTEGRATED_FILE_UPLOAD_PATH, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('파일 업로드 실패', err, {
                component: 'integratedSystemAPI',
                action: 'uploadFile',
                fileName: file.name,
                fileSize: file.size,
                projectId,
            });
            return {
                success: false,
                error: '파일 업로드에 실패했습니다.',
                timestamp: new Date().toISOString(),
            };
        }
    }

    async getFileList(): Promise<APIResponse> {
        try {
            const response = await this.api.get(FILES_COLLECTION_PATH);
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('파일 목록 조회 실패', err, {
                component: 'integratedSystemAPI',
                action: 'getFileList',
            });
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
            const response = await this.api.get(API_PROJECTS_LIST_PATH);
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('프로젝트 목록 조회 실패', err, {
                component: 'integratedSystemAPI',
                action: 'getProjects',
            });
            return {
                success: false,
                error: '프로젝트 목록 조회에 실패했습니다.',
                timestamp: new Date().toISOString(),
            };
        }
    }

    async createProject(projectData: Record<string, unknown>): Promise<APIResponse> {
        try {
            const response = await this.api.post(API_PROJECTS_LIST_PATH, projectData);
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('프로젝트 생성 실패', err, {
                component: 'integratedSystemAPI',
                action: 'createProject',
            });
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
            const response = await this.api.get(REAL_TIME_METRICS_PATH);
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('실시간 메트릭 조회 실패', err, {
                component: 'integratedSystemAPI',
                action: 'getRealTimeMetrics',
            });
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
            const response = await this.api.get(SYSTEM_CONFIG_PATH);
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('시스템 설정 조회 실패', err, {
                component: 'integratedSystemAPI',
                action: 'getSystemConfig',
            });
            return {
                success: false,
                error: '시스템 설정 조회에 실패했습니다.',
                timestamp: new Date().toISOString(),
            };
        }
    }

    async updateSystemConfig(config: Record<string, unknown>): Promise<APIResponse> {
        try {
            const response = await this.api.put(SYSTEM_CONFIG_PATH, config);
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('시스템 설정 업데이트 실패', err, {
                component: 'integratedSystemAPI',
                action: 'updateSystemConfig',
            });
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
            const response = await this.api.get(API_HEALTH_PATH);
            return response.status === 200;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('연결 테스트 실패', err, {
                component: 'integratedSystemAPI',
                action: 'testConnection',
            });
            return false;
        }
    }
}

// 싱글톤 인스턴스 생성
const integratedSystemAPI = new IntegratedSystemAPI();

export default integratedSystemAPI;
export { IntegratedSystemAPI };
