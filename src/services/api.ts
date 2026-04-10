import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  AI_ANALYTICS_ROUTER_ANALYZE_PATH,
  AI_ANALYTICS_ROUTER_EXPORT_PATH,
  AI_ANALYTICS_ROUTER_HEALTH_PATH,
  AI_ANALYTICS_ROUTER_INSIGHTS_PATH,
  AI_ANALYTICS_ROUTER_METRICS_PATH,
  AI_ANALYTICS_ROUTER_PERFORMANCE_PATH,
  AI_ANALYTICS_ROUTER_RECENT_PATH,
  AI_ANALYTICS_ROUTER_START_PATH,
  AI_ANALYTICS_ROUTER_STOP_PATH,
  API_ANALYTICS_PATH,
  API_FORM_FIELD_FILE,
  API_HEALTH_PATH,
  API_QUERY_PARAM_PROJECT_ID_CAMEL,
  API_QUERY_PARAM_TIME_RANGE,
  API_PERFORMANCE_ANALYSIS_PATH,
  API_PERFORMANCE_CONFIG_PATH,
  API_PERFORMANCE_METRICS_PATH,
  API_PERFORMANCE_OPTIMIZATION_HISTORY_PATH,
  API_PERFORMANCE_OPTIMIZE_PATH,
  API_PROJECT_AI_SETTINGS_SEGMENT,
  API_PROJECT_SESSIONS_SEGMENT,
  API_PROJECTS_LIST_PATH,
  API_SERVICE_LEGACY_AI_INITIALIZE_PATH,
  API_SERVICE_LEGACY_AI_INTENT_PATH,
  API_SERVICE_LEGACY_AI_MODEL_PERFORMANCE_PATH,
  API_SERVICE_LEGACY_AI_REALTIME_ANALYSIS_START_PATH,
  API_SERVICE_LEGACY_AI_SENTIMENT_PATH,
  API_SERVICE_LEGACY_AI_STATUS_PATH,
  API_SERVICE_LEGACY_AI_SWITCH_MODEL_PATH,
  API_SESSION_MESSAGES_SEGMENT,
  API_SESSIONS_LIST_PATH,
  API_SYSTEM_STATUS_PATH,
  API_USER_SETTINGS_PATH,
  FILE_UPLOAD_PATH,
  PERFORMANCE_MONITOR_HEALTH_PATH,
  resolveApiBaseUrl,
  resolveAxiosHttpOriginBaseUrl,
} from '../config/api';
import { errorLogger } from '../utils/errorLogger';
import { toError } from '../utils/errorLogger';

/** 요청 config에 타이밍 정보를 붙일 때 사용 */
interface ConfigWithTiming {
  startTime?: number;
  url?: string;
}

// API 응답 타입 정의
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  tags: string[];
  status: string;
  messageCount: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  settings: {
    aiModel: string;
    temperature: number;
    maxTokens: number;
  };
  /** 노트북 LLM 소스 개수 (Google NotebookLM 스타일) */
  source_count?: number;
}

interface Session {
  id: string;
  projectId: string;
  name: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  metadata: {
    totalTokens: number;
    avgResponseTime: number;
  };
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  metadata?: {
    model?: string;
    tokens?: number;
    responseTime?: number;
    confidence?: number;
  };
}

interface AnalyticsData {
  totalMessages: number;
  totalSessions: number;
  totalProjects: number;
  avgResponseTime: number;
  messagesByDay: Array<{
    date: string;
    messages: number;
    responses: number;
  }>;
  topProjects: Array<{
    id: string;
    name: string;
    messageCount: number;
    lastActivity: string;
  }>;
  userActivity: {
    activeUsers: number;
    totalSessions: number;
    avgSessionDuration: string;
    peakHours: string[];
  };
}

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = resolveAxiosHttpOriginBaseUrl(resolveApiBaseUrl().trim());
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 요청 인터셉터
    this.api.interceptors.request.use(
      (config) => {
        // 요청 시작 시간 기록
        (config as ConfigWithTiming).startTime = performance.now();
        errorLogger.info('API Request', {
          component: 'api',
          action: 'request',
          method: config.method?.toUpperCase(),
          url: config.url,
        });
        return config;
      },
      (error) => {
        const err = toError(error);
        errorLogger.error('API Request Error', err, {
          component: 'api',
          action: 'request',
        });
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // 응답 시간 계산 및 로깅
        const startTime = (response.config as ConfigWithTiming).startTime;
        if (startTime) {
          const responseTime = performance.now() - startTime;
          errorLogger.info('API Response', {
            component: 'api',
            action: 'response',
            status: response.status,
            url: response.config.url,
            responseTime: responseTime.toFixed(2),
          });
          
          // 느린 응답 경고 (1초 이상)
          if (responseTime > 1000) {
            errorLogger.warn('느린 API 응답', {
              component: 'api',
              action: 'response',
              url: response.config.url,
              responseTime: responseTime.toFixed(2),
            });
          }
        } else {
          errorLogger.info('API Response', {
            component: 'api',
            action: 'response',
            status: response.status,
            url: response.config.url,
          });
        }
        return response;
      },
      (error: unknown) => {
        // 에러 발생 시에도 응답 시간 기록
        const startTime = (error && typeof error === 'object' && 'config' in error)
          ? (error.config as ConfigWithTiming)?.startTime
          : undefined;
        if (startTime) {
          const responseTime = performance.now() - startTime;
          const config = (error as { config?: { url?: string } }).config;
          const err = toError(error);
          errorLogger.error('API Response Error', err, {
            component: 'api',
            action: 'response',
            url: config?.url,
            responseTime: responseTime.toFixed(2),
          });
        } else {
          const err = toError(error);
          errorLogger.error('API Response Error', err, {
            component: 'api',
            action: 'response',
          });
        }
        return Promise.reject(error);
      }
    );
  }

  // 시스템 초기화
  async initialize(): Promise<void> {
    try {
      const response = await this.api.get<ApiResponse>(API_HEALTH_PATH);
      if (!response.data.success) {
        throw new Error('System health check failed');
      }
      errorLogger.info('API Service initialized successfully', {
        component: 'api',
        action: 'initialize',
      });
    } catch (error) {
      const err = toError(error);
      errorLogger.error('API Service initialization failed', err, {
        component: 'api',
        action: 'initialize',
      });
      throw error;
    }
  }

  // 시스템 상태 확인
  async getSystemStatus(): Promise<unknown> {
    try {
      const response = await this.api.get<ApiResponse>(API_SYSTEM_STATUS_PATH);
      return response.data.data;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('Failed to get system status', err, {
        component: 'api',
        action: 'getSystemStatus',
      });
      throw error;
    }
  }

  // 프로젝트 관련 API
  async getProjects(): Promise<Project[]> {
    try {
      const response = await this.api.get<ApiResponse<Project[]>>(API_PROJECTS_LIST_PATH);
      return response.data.data || [];
    } catch (error) {
      errorLogger.error('Failed to fetch projects', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'getProjects' });
      throw error;
    }
  }

  async getProject(projectId: string): Promise<Project | null> {
    try {
      const response = await this.api.get<ApiResponse<Project>>(
        `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}`,
      );
      return response.data.data || null;
    } catch (error) {
      errorLogger.error('Failed to fetch project', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'getProject', projectId });
      throw error;
    }
  }

  async createProject(projectData: {
    name: string;
    description: string;
    tags?: string[];
    settings?: Record<string, unknown>;
  }): Promise<Project> {
    try {
      const response = await this.api.post<ApiResponse<Project>>(API_PROJECTS_LIST_PATH, projectData);
      return response.data.data!;
    } catch (error) {
      errorLogger.error('Failed to create project', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'createProject' });
      throw error;
    }
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      const response = await this.api.put<ApiResponse<Project>>(
        `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}`,
        updates,
      );
      return response.data.data || null;
    } catch (error) {
      errorLogger.error('Failed to update project', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'updateProject', projectId });
      throw error;
    }
  }

  async deleteProject(projectId: string): Promise<boolean> {
    try {
      const response = await this.api.delete<ApiResponse>(
        `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}`,
      );
      return response.data.success;
    } catch (error) {
      errorLogger.error('Failed to delete project', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'deleteProject', projectId });
      throw error;
    }
  }

  // 세션 관련 API
  async getSessions(projectId: string): Promise<Session[]> {
    try {
      const response = await this.api.get<ApiResponse<Session[]>>(
        `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}${API_PROJECT_SESSIONS_SEGMENT}`,
      );
      return response.data.data || [];
    } catch (error) {
      errorLogger.error('Failed to fetch sessions', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'getSessions', projectId });
      throw error;
    }
  }

  async getSession(sessionId: string): Promise<Session | null> {
    try {
      const response = await this.api.get<ApiResponse<Session>>(
        `${API_SESSIONS_LIST_PATH}/${encodeURIComponent(sessionId)}`,
      );
      return response.data.data || null;
    } catch (error) {
      errorLogger.error('Failed to fetch session', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'getSession', sessionId });
      throw error;
    }
  }

  async createSession(sessionData: {
    projectId: string;
    name?: string;
  }): Promise<Session> {
    try {
      const response = await this.api.post<ApiResponse<Session>>(API_SESSIONS_LIST_PATH, sessionData);
      return response.data.data!;
    } catch (error) {
      errorLogger.error('Failed to create session', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'createSession' });
      throw error;
    }
  }

  async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session | null> {
    try {
      const response = await this.api.put<ApiResponse<Session>>(
        `${API_SESSIONS_LIST_PATH}/${encodeURIComponent(sessionId)}`,
        updates,
      );
      return response.data.data || null;
    } catch (error) {
      errorLogger.error('Failed to update session', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'updateSession', sessionId });
      throw error;
    }
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const response = await this.api.delete<ApiResponse>(
        `${API_SESSIONS_LIST_PATH}/${encodeURIComponent(sessionId)}`,
      );
      return response.data.success;
    } catch (error) {
      errorLogger.error('Failed to delete session', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'deleteSession', sessionId });
      throw error;
    }
  }

  // 메시지 관련 API
  async sendMessage(messageData: {
    sessionId: string;
    content: string;
    role?: 'user' | 'assistant';
    projectId?: string;
  }): Promise<{
    userMessage: Message;
    aiResponse: Message;
  }> {
    try {
      const response = await this.api.post<ApiResponse<{
        userMessage: Message;
        aiResponse: Message;
      }>>(
        `${API_SESSIONS_LIST_PATH}/${encodeURIComponent(messageData.sessionId)}${API_SESSION_MESSAGES_SEGMENT}`,
        {
          content: messageData.content,
          role: messageData.role || 'user',
          projectId: messageData.projectId,
        },
      );
      return response.data.data!;
    } catch (error) {
      errorLogger.error('Failed to send message', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'sendMessage', sessionId: messageData.sessionId });
      throw error;
    }
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    try {
      const response = await this.api.get<ApiResponse<Message[]>>(
        `${API_SESSIONS_LIST_PATH}/${encodeURIComponent(sessionId)}${API_SESSION_MESSAGES_SEGMENT}`,
      );
      return response.data.data || [];
    } catch (error) {
      errorLogger.error('Failed to fetch messages', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'getMessages', sessionId });
      throw error;
    }
  }

  // 분석 데이터 API
  async getAnalytics(params?: {
    projectId?: string;
    timeRange?: string;
  }): Promise<AnalyticsData> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.projectId) queryParams.append(API_QUERY_PARAM_PROJECT_ID_CAMEL, params.projectId);
      if (params?.timeRange) queryParams.append(API_QUERY_PARAM_TIME_RANGE, params.timeRange);

      const qs = queryParams.toString();
      const analyticsUrl = qs ? `${API_ANALYTICS_PATH}?${qs}` : API_ANALYTICS_PATH;
      const response = await this.api.get<ApiResponse<AnalyticsData>>(analyticsUrl);
      return response.data.data!;
    } catch (error) {
      errorLogger.error('Failed to fetch analytics', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'getAnalytics' });
      throw error;
    }
  }

  // 파일 업로드 API
  async uploadFile(file: File, projectId?: string): Promise<{
    id: string;
    filename: string;
    url: string;
    size: number;
    type: string;
  }> {
    try {
      const formData = new FormData();
      formData.append(API_FORM_FIELD_FILE, file);
      if (projectId) {
        formData.append(API_QUERY_PARAM_PROJECT_ID_CAMEL, projectId);
      }

      const response = await this.api.post<ApiResponse<{
        id: string;
        filename: string;
        url: string;
        size: number;
        type: string;
      }>>(FILE_UPLOAD_PATH, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data!;
    } catch (error) {
      errorLogger.error('Failed to upload file', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'uploadFile' });
      throw error;
    }
  }

  // AI 모델 설정 API
  async updateAISettings(projectId: string, settings: {
    aiModel: string;
    temperature: number;
    maxTokens: number;
  }): Promise<Project> {
    try {
      const response = await this.api.put<ApiResponse<Project>>(
        `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}${API_PROJECT_AI_SETTINGS_SEGMENT}`,
        settings,
      );
      return response.data.data!;
    } catch (error) {
      errorLogger.error('Failed to update AI settings', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'updateAISettings' });
      throw error;
    }
  }

  // 사용자 설정 API
  async getUserSettings(): Promise<unknown> {
    try {
      const response = await this.api.get<ApiResponse>(API_USER_SETTINGS_PATH);
      return response.data.data;
    } catch (error) {
      errorLogger.error('Failed to fetch user settings', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'getUserSettings' });
      throw error;
    }
  }

  async updateUserSettings(settings: Record<string, unknown>): Promise<unknown> {
    try {
      const response = await this.api.put<ApiResponse>(API_USER_SETTINGS_PATH, settings);
      return response.data.data;
    } catch (error) {
      errorLogger.error('Failed to update user settings', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'updateUserSettings' });
      throw error;
    }
  }

  // 에러 처리 헬퍼
  handleError(error: unknown): string {
    const e = error as { response?: { data?: { message?: string } }; message?: string };
    if (e?.response?.data?.message) {
      return e.response.data.message;
    }
    if (e?.message) {
      return e.message;
    }
    return '알 수 없는 오류가 발생했습니다.';
  }

  // 연결 상태 확인
  async checkConnection(): Promise<boolean> {
    try {
      await this.api.get(API_HEALTH_PATH);
      return true;
    } catch (error) {
      return false;
    }
  }

  // 고급 AI 엔진 API 메서드들
  async initializeAIEngine(): Promise<ApiResponse<unknown>> {
    try {
      const response = await this.api.post(API_SERVICE_LEGACY_AI_INITIALIZE_PATH);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async switchAIModel(modelName: string): Promise<ApiResponse<unknown>> {
    try {
      const response = await this.api.post(API_SERVICE_LEGACY_AI_SWITCH_MODEL_PATH, { model: modelName });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async startRealtimeAnalysis(config?: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    try {
      const response = await this.api.post(API_SERVICE_LEGACY_AI_REALTIME_ANALYSIS_START_PATH, config);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async analyzeSentiment(text: string): Promise<ApiResponse<unknown>> {
    try {
      const response = await this.api.post(API_SERVICE_LEGACY_AI_SENTIMENT_PATH, { text });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async detectIntent(text: string): Promise<ApiResponse<unknown>> {
    try {
      const response = await this.api.post(API_SERVICE_LEGACY_AI_INTENT_PATH, { text });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async getAIEngineStatus(): Promise<ApiResponse<unknown>> {
    try {
      const response = await this.api.get(API_SERVICE_LEGACY_AI_STATUS_PATH);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async getModelPerformance(): Promise<ApiResponse<unknown>> {
    try {
      const response = await this.api.get(API_SERVICE_LEGACY_AI_MODEL_PERFORMANCE_PATH);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  // AI Analytics API 메서드들
  async getAIAnalyticsMetrics(): Promise<unknown> {
    try {
      const response = await this.api.get(AI_ANALYTICS_ROUTER_METRICS_PATH);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async getAIAnalyticsRecent(): Promise<unknown> {
    try {
      const response = await this.api.get(AI_ANALYTICS_ROUTER_RECENT_PATH);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async getAIAnalyticsPerformance(): Promise<unknown> {
    try {
      const response = await this.api.get(AI_ANALYTICS_ROUTER_PERFORMANCE_PATH);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async analyzeText(text: string): Promise<unknown> {
    try {
      const response = await this.api.post(AI_ANALYTICS_ROUTER_ANALYZE_PATH, { text });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async startAIMonitoring(): Promise<unknown> {
    try {
      const response = await this.api.post(AI_ANALYTICS_ROUTER_START_PATH);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async stopAIMonitoring(): Promise<unknown> {
    try {
      const response = await this.api.post(AI_ANALYTICS_ROUTER_STOP_PATH);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async exportAIData(): Promise<unknown> {
    try {
      const response = await this.api.get(AI_ANALYTICS_ROUTER_EXPORT_PATH);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async getAIInsights(): Promise<unknown> {
    try {
      const response = await this.api.get(AI_ANALYTICS_ROUTER_INSIGHTS_PATH);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async getAIAnalyticsHealth(): Promise<unknown> {
    try {
      const response = await this.api.get(AI_ANALYTICS_ROUTER_HEALTH_PATH);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  // Performance Monitor API 메서드들
  async getPerformanceMetrics(): Promise<unknown> {
    try {
      const response = await this.api.get(API_PERFORMANCE_METRICS_PATH);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async getPerformanceAnalysis(): Promise<unknown> {
    try {
      const response = await this.api.get(API_PERFORMANCE_ANALYSIS_PATH);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async runPerformanceOptimization(optimizationType: string, mode: string = 'auto'): Promise<unknown> {
    try {
      const response = await this.api.post(API_PERFORMANCE_OPTIMIZE_PATH, {
        optimization_type: optimizationType,
        mode: mode
      });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async getOptimizationHistory(): Promise<unknown> {
    try {
      const response = await this.api.get(API_PERFORMANCE_OPTIMIZATION_HISTORY_PATH);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async getPerformanceConfig(): Promise<unknown> {
    try {
      const response = await this.api.get(API_PERFORMANCE_CONFIG_PATH);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async updatePerformanceConfig(config: Record<string, unknown>): Promise<unknown> {
    try {
      const response = await this.api.put(API_PERFORMANCE_CONFIG_PATH, config);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async getPerformanceHealth(): Promise<unknown> {
    try {
      const response = await this.api.get(PERFORMANCE_MONITOR_HEALTH_PATH);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }
}

// 싱글톤 인스턴스 생성
const apiService = new ApiService();

// AI Analytics API 서비스
export const aiAnalyticsApi = {
  // 실시간 메트릭 조회
  getMetrics: async (): Promise<unknown> => {
    try {
      return await apiService.getAIAnalyticsMetrics();
    } catch (error) {
      errorLogger.error('AI Analytics 메트릭 조회 실패', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'getAIAnalyticsMetrics' });
      throw error;
    }
  },

  // 최근 분석 데이터 조회
  getRecentAnalysis: async (): Promise<unknown> => {
    try {
      return await apiService.getAIAnalyticsRecent();
    } catch (error) {
      errorLogger.error('최근 분석 데이터 조회 실패', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'getRecentAnalysisData' });
      throw error;
    }
  },

  // 모델 성능 조회
  getModelPerformance: async (): Promise<unknown> => {
    try {
      return await apiService.getAIAnalyticsPerformance();
    } catch (error) {
      errorLogger.error('모델 성능 조회 실패', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'getModelPerformance' });
      throw error;
    }
  },

  // 텍스트 분석
  analyzeText: async (text: string): Promise<unknown> => {
    try {
      return await apiService.analyzeText(text);
    } catch (error) {
      errorLogger.error('텍스트 분석 실패', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'analyzeText' });
      throw error;
    }
  },

  // 모니터링 시작
  startMonitoring: async (): Promise<unknown> => {
    try {
      return await apiService.startAIMonitoring();
    } catch (error) {
      errorLogger.error('모니터링 시작 실패', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'startMonitoring' });
      throw error;
    }
  },

  // 모니터링 중지
  stopMonitoring: async (): Promise<unknown> => {
    try {
      return await apiService.stopAIMonitoring();
    } catch (error) {
      errorLogger.error('모니터링 중지 실패', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'stopMonitoring' });
      throw error;
    }
  },

  // 데이터 내보내기
  exportData: async (): Promise<unknown> => {
    try {
      return await apiService.exportAIData();
    } catch (error) {
      errorLogger.error('데이터 내보내기 실패', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'exportData' });
      throw error;
    }
  },

  // AI 인사이트 조회
  getInsights: async (): Promise<unknown> => {
    try {
      return await apiService.getAIInsights();
    } catch (error) {
      errorLogger.error('AI 인사이트 조회 실패', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'getAIInsights' });
      throw error;
    }
  },

  // 헬스 체크
  healthCheck: async (): Promise<unknown> => {
    try {
      return await apiService.getAIAnalyticsHealth();
    } catch (error) {
      errorLogger.error('AI Analytics 헬스 체크 실패', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'aiAnalyticsHealthCheck' });
      throw error;
    }
  }
};

// Performance Monitor API 서비스
export const performanceMonitorApi = {
  // 시스템 메트릭 조회
  getSystemMetrics: async (): Promise<unknown> => {
    try {
      return await apiService.getPerformanceMetrics();
    } catch (error) {
      errorLogger.error('시스템 메트릭 조회 실패', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'getSystemMetrics' });
      throw error;
    }
  },

  // 성능 분석 조회
  getPerformanceAnalysis: async (): Promise<unknown> => {
    try {
      return await apiService.getPerformanceAnalysis();
    } catch (error) {
      errorLogger.error('성능 분석 조회 실패', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'getPerformanceAnalysis' });
      throw error;
    }
  },

  // 최적화 실행
  runOptimization: async (optimizationType: string, mode: string = 'auto'): Promise<unknown> => {
    try {
      return await apiService.runPerformanceOptimization(optimizationType, mode);
    } catch (error) {
      errorLogger.error('최적화 실행 실패', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'runOptimization' });
      throw error;
    }
  },

  // 최적화 히스토리 조회
  getOptimizationHistory: async (): Promise<unknown> => {
    try {
      return await apiService.getOptimizationHistory();
    } catch (error) {
      errorLogger.error('최적화 히스토리 조회 실패', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'getOptimizationHistory' });
      throw error;
    }
  },

  // 설정 조회
  getConfig: async (): Promise<unknown> => {
    try {
      return await apiService.getPerformanceConfig();
    } catch (error) {
      errorLogger.error('설정 조회 실패', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'getPerformanceMonitorSettings' });
      throw error;
    }
  },

  // 설정 업데이트
  updateConfig: async (config: Record<string, unknown>): Promise<unknown> => {
    try {
      return await apiService.updatePerformanceConfig(config);
    } catch (error) {
      errorLogger.error('설정 업데이트 실패', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'updatePerformanceMonitorSettings' });
      throw error;
    }
  },

  // 헬스 체크
  healthCheck: async (): Promise<unknown> => {
    try {
      return await apiService.getPerformanceHealth();
    } catch (error) {
      errorLogger.error('Performance Monitor 헬스 체크 실패', error instanceof Error ? error : new Error(String(error)), { component: 'ApiService', action: 'performanceMonitorHealthCheck' });
      throw error;
    }
  }
};

export default apiService; 