/**
 * 통합 API 클라이언트
 * 프론트엔드에서 사용할 수 있는 TypeScript 클라이언트
 * 메인 백엔드(main_server.py, 포트 5002)에 통합된 /api/integrated 엔드포인트 사용
 */
const INTEGRATED_API_BASE_URL =
  process.env.REACT_APP_INTEGRATED_API_URL || "http://localhost:5002/api/integrated";

export interface AnalyzeRequest {
  message: string;
}

export interface AnalyzeResponse {
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

export interface StoryRequest {
  genre?: string;
  theme?: string;
  length?: string;
}

export interface PoemRequest {
  type?: string;
  theme?: string;
}

export interface EssayRequest {
  type?: string;
  topic?: string;
}

export interface WritingAnalyzeRequest {
  text: string;
}

export interface ConstructionPersuasionRequest {
  company_name?: string;
  project_type?: string;
  persuasion_level?: string;
}

export interface SocialMediaRequest {
  platform?: string;
  content_type?: string;
  industry?: string;
  company_name?: string;
  tone?: string;
}

export interface EmailMarketingRequest {
  email_type?: string;
  industry?: string;
  company_name?: string;
  urgency_level?: string;
}

export interface AdvancedAnalyticsRequest {
  analysis_type?: string;
  time_range?: string;
  filters?: Record<string, any>;
}

export interface PredictionRequest {
  prediction_type?: string;
  prediction_horizon?: string;
}

export interface InsightsRequest {
  insight_type?: string;
  focus_area?: string;
}

export interface AIOptimizeRequest {
  optimization_type?: string;
  target_metric?: string;
}

export interface AIBenchmarkRequest {
  benchmark_type?: string;
  test_data_size?: string;
}

export interface AIFeedbackRequest {
  feedback_type?: string;
  content?: string;
  rating?: number;
  correction?: string;
  context?: Record<string, any>;
}

class IntegratedAPIClient {
  private baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || INTEGRATED_API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.error || "API 요청 실패");
    }

    return response.json();
  }

  // 기본 기능
  async analyzeMessage(request: AnalyzeRequest): Promise<AnalyzeResponse> {
    return this.request<AnalyzeResponse>("/analyze", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getStatus() {
    return this.request("/status", { method: "GET" });
  }

  async getHealth() {
    return this.request("/health", { method: "GET" });
  }

  async getMetrics() {
    return this.request("/metrics", { method: "GET" });
  }

  async getAnalytics() {
    return this.request("/analytics", { method: "GET" });
  }

  async getLogs() {
    return this.request("/logs", { method: "GET" });
  }

  // 창작 콘텐츠
  async generateStory(request: StoryRequest) {
    return this.request("/creative/story", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async generatePoem(request: PoemRequest) {
    return this.request("/creative/poem", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async generateEssay(request: EssayRequest) {
    return this.request("/creative/essay", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async analyzeWriting(request: WritingAnalyzeRequest) {
    return this.request("/creative/analyze", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // 설득 콘텐츠
  async generateConstructionPersuasion(
    request: ConstructionPersuasionRequest
  ) {
    return this.request("/persuasion/construction", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async generateContractorPersuasion(request: ConstructionPersuasionRequest) {
    return this.request("/persuasion/contractor", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async analyzePersuasion(content: string) {
    return this.request("/persuasion/analyze", {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  }

  // 마케팅 콘텐츠
  async generateSocialMediaContent(request: SocialMediaRequest) {
    return this.request("/marketing/social", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async generateEmailMarketing(request: EmailMarketingRequest) {
    return this.request("/marketing/email", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async analyzeMarketingContent(content: string, contentType?: string) {
    return this.request("/marketing/analyze", {
      method: "POST",
      body: JSON.stringify({ content, content_type: contentType || "social" }),
    });
  }

  // 고급 분석
  async getAdvancedAnalytics(request: AdvancedAnalyticsRequest) {
    return this.request("/analytics/advanced", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getPredictions(request: PredictionRequest) {
    return this.request("/analytics/predictions", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getInsights(request: InsightsRequest) {
    return this.request("/analytics/insights", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // AI 최적화
  async optimizeAI(request: AIOptimizeRequest) {
    return this.request("/ai/optimize", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async benchmarkAI(request: AIBenchmarkRequest) {
    return this.request("/ai/benchmark", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async submitFeedback(request: AIFeedbackRequest) {
    return this.request("/ai/feedback", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }
}

// 싱글톤 인스턴스 export
export const integratedAPI = new IntegratedAPIClient();

// 기본 export
export default IntegratedAPIClient;
