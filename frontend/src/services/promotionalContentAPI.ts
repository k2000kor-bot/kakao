// 홍보물 및 전달 시스템 API 서비스
import {
  API_BASE_URL,
  API_FORM_FIELD_TEMPLATE_TYPE,
  API_FORM_FIELD_VARIABLES,
  API_PROJECT_PROMOTIONAL_CAMPAIGNS_SEGMENT,
  API_PROJECT_PROMOTIONAL_MATERIALS_SEGMENT,
  API_PROJECTS_LIST_PATH,
  API_SMOKE_TEST_PATH,
  API_STATUS_PATH,
  CONTENT_TEMPLATES_PATH,
  DELIVERY_PLANS_PATH,
  FALLBACK_API_ORIGIN,
  MARKETING_CAMPAIGNS_PATH,
  MATERIALS_BASE_PATH,
  PROMOTIONAL_GENERATE_CONTENT_PATH,
  PROMOTIONAL_MATERIALS_PATH,
  joinApiHealthCheckUrl,
} from '../config/api';

const PROMOTIONAL_CONTENT_API_BASE = API_BASE_URL || FALLBACK_API_ORIGIN;

export interface PromotionalMaterialCreate {
  project_id: string;
  title: string;
  content: string;
  material_type: string;
  target_audience?: string;
  delivery_channels?: string[];
}

export interface DeliveryPlanCreate {
  material_id: string;
  delivery_type: string;
  target_audience?: string;
  schedule_date?: string;
  delivery_channels?: string[];
}

export interface MarketingCampaignCreate {
  project_id: string;
  campaign_name: string;
  description?: string;
  campaign_type?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
}

export interface ContentTemplateCreate {
  template_name: string;
  template_type: string;
  content_structure: string;
  variables?: string[];
}

export interface PromotionalMaterial {
  id: string;
  project_id: string;
  title: string;
  content: string;
  material_type: string;
  target_audience: string;
  delivery_channels: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryPlan {
  id: string;
  material_id: string;
  delivery_type: string;
  target_audience: string;
  schedule_date: string;
  delivery_channels: string[];
  status: string;
  created_at: string;
}

export interface MarketingCampaign {
  id: string;
  project_id: string;
  campaign_name: string;
  description: string;
  campaign_type: string;
  start_date: string;
  end_date: string;
  budget: number;
  status: string;
  created_at: string;
}

export interface ContentTemplate {
  id: string;
  template_name: string;
  template_type: string;
  content_structure: string;
  variables: string[];
  created_at: string;
}

export interface DeliveryPerformance {
  reach_count: number;
  engagement_rate: number;
  conversion_rate: number;
  click_through_rate: number;
  bounce_rate: number;
  average_session_duration: number;
  social_shares: number;
  comments: number;
  likes: number;
}

// API 호출 헬퍼 함수
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(joinApiHealthCheckUrl(PROMOTIONAL_CONTENT_API_BASE, endpoint), {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API 호출 오류:', error);
    throw error;
  }
};

// 폼 데이터 API 호출 헬퍼 함수
const formApiCall = async (endpoint: string, formData: FormData) => {
  try {
    const response = await fetch(joinApiHealthCheckUrl(PROMOTIONAL_CONTENT_API_BASE, endpoint), {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('폼 API 호출 오류:', error);
    throw error;
  }
};

// 홍보물 및 전달 시스템 API 클래스
export class PromotionalContentAPI {
  // 시스템 상태 확인
  static async getStatus() {
    return apiCall(API_STATUS_PATH);
  }

  // 홍보물 생성
  static async createPromotionalMaterial(material: PromotionalMaterialCreate): Promise<{ success: boolean; material_id: string; message: string }> {
    return apiCall(PROMOTIONAL_MATERIALS_PATH, {
      method: 'POST',
      body: JSON.stringify(material),
    });
  }

  // 전달 계획 생성
  static async createDeliveryPlan(plan: DeliveryPlanCreate): Promise<{ success: boolean; plan_id: string; message: string }> {
    return apiCall(DELIVERY_PLANS_PATH, {
      method: 'POST',
      body: JSON.stringify(plan),
    });
  }

  // 마케팅 캠페인 생성
  static async createMarketingCampaign(campaign: MarketingCampaignCreate): Promise<{ success: boolean; campaign_id: string; message: string }> {
    return apiCall(MARKETING_CAMPAIGNS_PATH, {
      method: 'POST',
      body: JSON.stringify(campaign),
    });
  }

  // 콘텐츠 템플릿 생성
  static async createContentTemplate(template: ContentTemplateCreate): Promise<{ success: boolean; template_id: string; message: string }> {
    return apiCall(CONTENT_TEMPLATES_PATH, {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  // 프로젝트 홍보물 목록 조회
  static async getProjectMaterials(projectId: string): Promise<{ success: boolean; materials: PromotionalMaterial[] }> {
    return apiCall(
      `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}${API_PROJECT_PROMOTIONAL_MATERIALS_SEGMENT}`,
    );
  }

  // 홍보물 전달 계획 조회
  static async getMaterialDeliveryPlans(materialId: string): Promise<{ success: boolean; plans: DeliveryPlan[] }> {
    return apiCall(
      `${MATERIALS_BASE_PATH}/${encodeURIComponent(materialId)}/delivery-plans`,
    );
  }

  // 프로젝트 마케팅 캠페인 조회
  static async getProjectCampaigns(projectId: string): Promise<{ success: boolean; campaigns: MarketingCampaign[] }> {
    return apiCall(
      `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}${API_PROJECT_PROMOTIONAL_CAMPAIGNS_SEGMENT}`,
    );
  }

  // 콘텐츠 템플릿 목록 조회
  static async getContentTemplates(): Promise<{ success: boolean; templates: ContentTemplate[] }> {
    return apiCall(CONTENT_TEMPLATES_PATH);
  }

  // 템플릿을 사용한 콘텐츠 생성
  static async generateContentFromTemplate(templateType: string, variables: Record<string, string>): Promise<{ success: boolean; content: string; template_type: string }> {
    const formData = new FormData();
    formData.append(API_FORM_FIELD_TEMPLATE_TYPE, templateType);
    formData.append(API_FORM_FIELD_VARIABLES, JSON.stringify(variables));
    
    return formApiCall(PROMOTIONAL_GENERATE_CONTENT_PATH, formData);
  }

  // 전달 성과 분석
  static async getDeliveryPerformance(planId: string): Promise<{ success: boolean; performance: DeliveryPerformance }> {
    return apiCall(`${DELIVERY_PLANS_PATH}/${encodeURIComponent(planId)}/performance`);
  }

  // 서버 연결 테스트
  static async testConnection(): Promise<boolean> {
    try {
      await this.getStatus();
      return true;
    } catch (error) {
      console.error('서버 연결 실패:', error);
      return false;
    }
  }
}

// 편의 함수들
export const promotionalContentAPI = {
  // 홍보물 생성
  createMaterial: async (material: PromotionalMaterialCreate) => {
    try {
      const response = await PromotionalContentAPI.createPromotionalMaterial(material);
      return response.material_id;
    } catch (error) {
      console.error('홍보물 생성 실패:', error);
      throw error;
    }
  },

  // 전달 계획 생성
  createDeliveryPlan: async (plan: DeliveryPlanCreate) => {
    try {
      const response = await PromotionalContentAPI.createDeliveryPlan(plan);
      return response.plan_id;
    } catch (error) {
      console.error('전달 계획 생성 실패:', error);
      throw error;
    }
  },

  // 마케팅 캠페인 생성
  createCampaign: async (campaign: MarketingCampaignCreate) => {
    try {
      const response = await PromotionalContentAPI.createMarketingCampaign(campaign);
      return response.campaign_id;
    } catch (error) {
      console.error('마케팅 캠페인 생성 실패:', error);
      throw error;
    }
  },

  // 콘텐츠 템플릿 생성
  createTemplate: async (template: ContentTemplateCreate) => {
    try {
      const response = await PromotionalContentAPI.createContentTemplate(template);
      return response.template_id;
    } catch (error) {
      console.error('콘텐츠 템플릿 생성 실패:', error);
      throw error;
    }
  },

  // 프로젝트 홍보물 목록 조회
  getProjectMaterials: async (projectId: string) => {
    try {
      const response = await PromotionalContentAPI.getProjectMaterials(projectId);
      return response.materials;
    } catch (error) {
      console.error('홍보물 목록 조회 실패:', error);
      throw error;
    }
  },

  // 홍보물 전달 계획 조회
  getMaterialDeliveryPlans: async (materialId: string) => {
    try {
      const response = await PromotionalContentAPI.getMaterialDeliveryPlans(materialId);
      return response.plans;
    } catch (error) {
      console.error('전달 계획 조회 실패:', error);
      throw error;
    }
  },

  // 프로젝트 마케팅 캠페인 조회
  getProjectCampaigns: async (projectId: string) => {
    try {
      const response = await PromotionalContentAPI.getProjectCampaigns(projectId);
      return response.campaigns;
    } catch (error) {
      console.error('마케팅 캠페인 조회 실패:', error);
      throw error;
    }
  },

  // 콘텐츠 템플릿 목록 조회
  getContentTemplates: async () => {
    try {
      const response = await PromotionalContentAPI.getContentTemplates();
      return response.templates;
    } catch (error) {
      console.error('콘텐츠 템플릿 조회 실패:', error);
      throw error;
    }
  },

  // 템플릿을 사용한 콘텐츠 생성
  generateContent: async (templateType: string, variables: Record<string, string>) => {
    try {
      const response = await PromotionalContentAPI.generateContentFromTemplate(templateType, variables);
      return response.content;
    } catch (error) {
      console.error('콘텐츠 생성 실패:', error);
      throw error;
    }
  },

  // 전달 성과 분석
  getDeliveryPerformance: async (planId: string) => {
    try {
      const response = await PromotionalContentAPI.getDeliveryPerformance(planId);
      return response.performance;
    } catch (error) {
      console.error('성과 분석 실패:', error);
      throw error;
    }
  },

  // 서버 상태 확인
  checkStatus: async () => {
    try {
      const response = await PromotionalContentAPI.getStatus();
      return response.status === 'healthy';
    } catch (error) {
      console.error('서버 상태 확인 실패:', error);
      return false;
    }
  },

  // 테스트 엔드포인트
  testEndpoint: async () => {
    try {
      const response = await apiCall(API_SMOKE_TEST_PATH);
      return response;
    } catch (error) {
      console.error('테스트 엔드포인트 실패:', error);
      throw error;
    }
  },
};

export default PromotionalContentAPI; 