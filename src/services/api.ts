import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API 응답 타입 정의
interface ApiResponse<T = any> {
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
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
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
        (config as any).startTime = performance.now();
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // 응답 시간 계산 및 로깅
        const startTime = (response.config as any).startTime;
        if (startTime) {
          const responseTime = performance.now() - startTime;
          console.log(
            `API Response: ${response.status} ${response.config.url} (${responseTime.toFixed(2)}ms)`
          );
          
          // 느린 응답 경고 (1초 이상)
          if (responseTime > 1000) {
            console.warn(
              `⚠️ 느린 API 응답: ${response.config.url} (${responseTime.toFixed(2)}ms)`
            );
          }
        } else {
          console.log(`API Response: ${response.status} ${response.config.url}`);
        }
        return response;
      },
      (error) => {
        // 에러 발생 시에도 응답 시간 기록
        const startTime = (error.config as any)?.startTime;
        if (startTime) {
          const responseTime = performance.now() - startTime;
          console.error(
            `API Response Error: ${error.config?.url} (${responseTime.toFixed(2)}ms)`,
            error
          );
        } else {
          console.error('API Response Error:', error);
        }
        return Promise.reject(error);
      }
    );
  }

  // 시스템 초기화
  async initialize(): Promise<void> {
    try {
      const response = await this.api.get<ApiResponse>('/api/health');
      if (!response.data.success) {
        throw new Error('System health check failed');
      }
      console.log('API Service initialized successfully');
    } catch (error) {
      console.error('API Service initialization failed:', error);
      throw error;
    }
  }

  // 시스템 상태 확인
  async getSystemStatus(): Promise<any> {
    try {
      const response = await this.api.get<ApiResponse>('/api/system/status');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get system status:', error);
      throw error;
    }
  }

  // 프로젝트 관련 API
  async getProjects(): Promise<Project[]> {
    try {
      const response = await this.api.get<ApiResponse<Project[]>>('/api/projects');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      throw error;
    }
  }

  async getProject(projectId: string): Promise<Project | null> {
    try {
      const response = await this.api.get<ApiResponse<Project>>(`/api/projects/${projectId}`);
      return response.data.data || null;
    } catch (error) {
      console.error('Failed to fetch project:', error);
      throw error;
    }
  }

  async createProject(projectData: {
    name: string;
    description: string;
    tags?: string[];
    settings?: any;
  }): Promise<Project> {
    try {
      const response = await this.api.post<ApiResponse<Project>>('/api/projects', projectData);
      return response.data.data!;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      const response = await this.api.put<ApiResponse<Project>>(`/api/projects/${projectId}`, updates);
      return response.data.data || null;
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  }

  async deleteProject(projectId: string): Promise<boolean> {
    try {
      const response = await this.api.delete<ApiResponse>(`/api/projects/${projectId}`);
      return response.data.success;
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  }

  // 세션 관련 API
  async getSessions(projectId: string): Promise<Session[]> {
    try {
      const response = await this.api.get<ApiResponse<Session[]>>(`/api/projects/${projectId}/sessions`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      throw error;
    }
  }

  async getSession(sessionId: string): Promise<Session | null> {
    try {
      const response = await this.api.get<ApiResponse<Session>>(`/api/sessions/${sessionId}`);
      return response.data.data || null;
    } catch (error) {
      console.error('Failed to fetch session:', error);
      throw error;
    }
  }

  async createSession(sessionData: {
    projectId: string;
    name?: string;
  }): Promise<Session> {
    try {
      const response = await this.api.post<ApiResponse<Session>>('/api/sessions', sessionData);
      return response.data.data!;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }

  async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session | null> {
    try {
      const response = await this.api.put<ApiResponse<Session>>(`/api/sessions/${sessionId}`, updates);
      return response.data.data || null;
    } catch (error) {
      console.error('Failed to update session:', error);
      throw error;
    }
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const response = await this.api.delete<ApiResponse>(`/api/sessions/${sessionId}`);
      return response.data.success;
    } catch (error) {
      console.error('Failed to delete session:', error);
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
      }>>(`/api/sessions/${messageData.sessionId}/messages`, {
        content: messageData.content,
        role: messageData.role || 'user',
        projectId: messageData.projectId,
      });
      return response.data.data!;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    try {
      const response = await this.api.get<ApiResponse<Message[]>>(`/api/sessions/${sessionId}/messages`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch messages:', error);
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
      if (params?.projectId) queryParams.append('projectId', params.projectId);
      if (params?.timeRange) queryParams.append('timeRange', params.timeRange);

      const response = await this.api.get<ApiResponse<AnalyticsData>>(`/api/analytics?${queryParams}`);
      return response.data.data!;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
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
      formData.append('file', file);
      if (projectId) {
        formData.append('projectId', projectId);
      }

      const response = await this.api.post<ApiResponse<{
        id: string;
        filename: string;
        url: string;
        size: number;
        type: string;
      }>>('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data!;
    } catch (error) {
      console.error('Failed to upload file:', error);
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
      const response = await this.api.put<ApiResponse<Project>>(`/api/projects/${projectId}/ai-settings`, settings);
      return response.data.data!;
    } catch (error) {
      console.error('Failed to update AI settings:', error);
      throw error;
    }
  }

  // 사용자 설정 API
  async getUserSettings(): Promise<any> {
    try {
      const response = await this.api.get<ApiResponse>('/api/user/settings');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch user settings:', error);
      throw error;
    }
  }

  async updateUserSettings(settings: any): Promise<any> {
    try {
      const response = await this.api.put<ApiResponse>('/api/user/settings', settings);
      return response.data.data;
    } catch (error) {
      console.error('Failed to update user settings:', error);
      throw error;
    }
  }

  // 에러 처리 헬퍼
  handleError(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return '알 수 없는 오류가 발생했습니다.';
  }

  // 연결 상태 확인
  async checkConnection(): Promise<boolean> {
    try {
      await this.api.get('/api/health');
      return true;
    } catch (error) {
      return false;
    }
  }

  // 고급 AI 엔진 API 메서드들
  async initializeAIEngine(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post('/ai/initialize');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async switchAIModel(modelName: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post('/ai/switch-model', { model: modelName });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async startRealtimeAnalysis(config?: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post('/ai/realtime-analysis/start', config);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async analyzeSentiment(text: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post('/ai/sentiment-analysis', { text });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async detectIntent(text: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post('/ai/intent-detection', { text });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getAIEngineStatus(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get('/ai/status');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getModelPerformance(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get('/ai/model-performance');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // AI Analytics API 메서드들
  async getAIAnalyticsMetrics(): Promise<any> {
    try {
      const response = await this.api.get('/ai-analytics/metrics');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getAIAnalyticsRecent(): Promise<any> {
    try {
      const response = await this.api.get('/ai-analytics/recent');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getAIAnalyticsPerformance(): Promise<any> {
    try {
      const response = await this.api.get('/ai-analytics/performance');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async analyzeText(text: string): Promise<any> {
    try {
      const response = await this.api.post('/ai-analytics/analyze', { text });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async startAIMonitoring(): Promise<any> {
    try {
      const response = await this.api.post('/ai-analytics/start');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async stopAIMonitoring(): Promise<any> {
    try {
      const response = await this.api.post('/ai-analytics/stop');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async exportAIData(): Promise<any> {
    try {
      const response = await this.api.get('/ai-analytics/export');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getAIInsights(): Promise<any> {
    try {
      const response = await this.api.get('/ai-analytics/insights');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getAIAnalyticsHealth(): Promise<any> {
    try {
      const response = await this.api.get('/ai-analytics/health');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Performance Monitor API 메서드들
  async getPerformanceMetrics(): Promise<any> {
    try {
      const response = await this.api.get('/api/performance/metrics');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getPerformanceAnalysis(): Promise<any> {
    try {
      const response = await this.api.get('/api/performance/analysis');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async runPerformanceOptimization(optimizationType: string, mode: string = 'auto'): Promise<any> {
    try {
      const response = await this.api.post('/api/performance/optimize', {
        optimization_type: optimizationType,
        mode: mode
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getOptimizationHistory(): Promise<any> {
    try {
      const response = await this.api.get('/api/performance/optimization/history');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getPerformanceConfig(): Promise<any> {
    try {
      const response = await this.api.get('/api/performance/config');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async updatePerformanceConfig(config: any): Promise<any> {
    try {
      const response = await this.api.put('/api/performance/config', config);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getPerformanceHealth(): Promise<any> {
    try {
      const response = await this.api.get('/performance/health');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }
}

// 싱글톤 인스턴스 생성
const apiService = new ApiService();

// AI Analytics API 서비스
export const aiAnalyticsApi = {
  // 실시간 메트릭 조회
  getMetrics: async (): Promise<any> => {
    try {
      return await apiService.getAIAnalyticsMetrics();
    } catch (error) {
      console.error('AI Analytics 메트릭 조회 실패:', error);
      throw error;
    }
  },

  // 최근 분석 데이터 조회
  getRecentAnalysis: async (): Promise<any> => {
    try {
      return await apiService.getAIAnalyticsRecent();
    } catch (error) {
      console.error('최근 분석 데이터 조회 실패:', error);
      throw error;
    }
  },

  // 모델 성능 조회
  getModelPerformance: async (): Promise<any> => {
    try {
      return await apiService.getAIAnalyticsPerformance();
    } catch (error) {
      console.error('모델 성능 조회 실패:', error);
      throw error;
    }
  },

  // 텍스트 분석
  analyzeText: async (text: string): Promise<any> => {
    try {
      return await apiService.analyzeText(text);
    } catch (error) {
      console.error('텍스트 분석 실패:', error);
      throw error;
    }
  },

  // 모니터링 시작
  startMonitoring: async (): Promise<any> => {
    try {
      return await apiService.startAIMonitoring();
    } catch (error) {
      console.error('모니터링 시작 실패:', error);
      throw error;
    }
  },

  // 모니터링 중지
  stopMonitoring: async (): Promise<any> => {
    try {
      return await apiService.stopAIMonitoring();
    } catch (error) {
      console.error('모니터링 중지 실패:', error);
      throw error;
    }
  },

  // 데이터 내보내기
  exportData: async (): Promise<any> => {
    try {
      return await apiService.exportAIData();
    } catch (error) {
      console.error('데이터 내보내기 실패:', error);
      throw error;
    }
  },

  // AI 인사이트 조회
  getInsights: async (): Promise<any> => {
    try {
      return await apiService.getAIInsights();
    } catch (error) {
      console.error('AI 인사이트 조회 실패:', error);
      throw error;
    }
  },

  // 헬스 체크
  healthCheck: async (): Promise<any> => {
    try {
      return await apiService.getAIAnalyticsHealth();
    } catch (error) {
      console.error('AI Analytics 헬스 체크 실패:', error);
      throw error;
    }
  }
};

// Performance Monitor API 서비스
export const performanceMonitorApi = {
  // 시스템 메트릭 조회
  getSystemMetrics: async (): Promise<any> => {
    try {
      return await apiService.getPerformanceMetrics();
    } catch (error) {
      console.error('시스템 메트릭 조회 실패:', error);
      throw error;
    }
  },

  // 성능 분석 조회
  getPerformanceAnalysis: async (): Promise<any> => {
    try {
      return await apiService.getPerformanceAnalysis();
    } catch (error) {
      console.error('성능 분석 조회 실패:', error);
      throw error;
    }
  },

  // 최적화 실행
  runOptimization: async (optimizationType: string, mode: string = 'auto'): Promise<any> => {
    try {
      return await apiService.runPerformanceOptimization(optimizationType, mode);
    } catch (error) {
      console.error('최적화 실행 실패:', error);
      throw error;
    }
  },

  // 최적화 히스토리 조회
  getOptimizationHistory: async (): Promise<any> => {
    try {
      return await apiService.getOptimizationHistory();
    } catch (error) {
      console.error('최적화 히스토리 조회 실패:', error);
      throw error;
    }
  },

  // 설정 조회
  getConfig: async (): Promise<any> => {
    try {
      return await apiService.getPerformanceConfig();
    } catch (error) {
      console.error('설정 조회 실패:', error);
      throw error;
    }
  },

  // 설정 업데이트
  updateConfig: async (config: any): Promise<any> => {
    try {
      return await apiService.updatePerformanceConfig(config);
    } catch (error) {
      console.error('설정 업데이트 실패:', error);
      throw error;
    }
  },

  // 헬스 체크
  healthCheck: async (): Promise<any> => {
    try {
      return await apiService.getPerformanceHealth();
    } catch (error) {
      console.error('Performance Monitor 헬스 체크 실패:', error);
      throw error;
    }
  }
};

export default apiService; 