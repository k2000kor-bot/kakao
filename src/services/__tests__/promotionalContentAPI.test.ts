/**
 * PromotionalContentAPI 테스트
 */
import { PromotionalContentAPI, promotionalContentAPI } from '../promotionalContentAPI';
import type { PromotionalMaterialCreate, DeliveryPlanCreate, MarketingCampaignCreate } from '../promotionalContentAPI';
import { installJestFetchMock, restoreGlobalFetch } from '../../test-utils/installJestFetchMock';
import {
  API_BASE_URL,
  API_STATUS_PATH,
  FALLBACK_API_ORIGIN,
  joinApiHealthCheckUrl,
} from '../../config/api';

const promotionalApiBase = () => API_BASE_URL || FALLBACK_API_ORIGIN;

const originalFetch = globalThis.fetch;

describe('PromotionalContentAPI', () => {
  beforeEach(() => {
    installJestFetchMock();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    restoreGlobalFetch(originalFetch);
    jest.restoreAllMocks();
  });

  describe('getStatus', () => {
    it('시스템 상태 확인', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'ok' })
      });

      const result = await PromotionalContentAPI.getStatus();

      expect(result).toEqual({ status: 'ok' });
      expect(global.fetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(promotionalApiBase(), API_STATUS_PATH),
        expect.any(Object)
      );
    });
  });

  describe('createPromotionalMaterial', () => {
    it('홍보물 생성', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          material_id: 'mat-123',
          message: '생성 완료'
        })
      });

      const material: PromotionalMaterialCreate = {
        project_id: 'proj-1',
        title: '테스트 홍보물',
        content: '내용',
        material_type: 'brochure'
      };

      const result = await PromotionalContentAPI.createPromotionalMaterial(material);

      expect(result.success).toBe(true);
      expect(result.material_id).toBe('mat-123');
    });
  });

  describe('createDeliveryPlan', () => {
    it('전달 계획 생성', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          plan_id: 'plan-456',
          message: '생성 완료'
        })
      });

      const plan: DeliveryPlanCreate = {
        material_id: 'mat-123',
        delivery_type: 'email'
      };

      const result = await PromotionalContentAPI.createDeliveryPlan(plan);

      expect(result.success).toBe(true);
      expect(result.plan_id).toBe('plan-456');
    });
  });

  describe('createMarketingCampaign', () => {
    it('마케팅 캠페인 생성', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          campaign_id: 'camp-789',
          message: '생성 완료'
        })
      });

      const campaign: MarketingCampaignCreate = {
        project_id: 'proj-1',
        campaign_name: '테스트 캠페인'
      };

      const result = await PromotionalContentAPI.createMarketingCampaign(campaign);

      expect(result.success).toBe(true);
      expect(result.campaign_id).toBe('camp-789');
    });
  });

  describe('getProjectMaterials', () => {
    it('프로젝트 홍보물 목록 조회', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          materials: []
        })
      });

      const result = await PromotionalContentAPI.getProjectMaterials('proj-1');

      expect(result.success).toBe(true);
      expect(Array.isArray(result.materials)).toBe(true);
    });
  });

  describe('getContentTemplates', () => {
    it('콘텐츠 템플릿 목록 조회', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          templates: []
        })
      });

      const result = await PromotionalContentAPI.getContentTemplates();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.templates)).toBe(true);
    });
  });

  describe('testConnection', () => {
    it('연결 성공', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      const result = await PromotionalContentAPI.testConnection();

      expect(result).toBe(true);
    });

    it('연결 실패', async () => {
      jest.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      const result = await PromotionalContentAPI.testConnection();

      expect(result).toBe(false);
    });
  });
});

describe('promotionalContentAPI (편의 함수)', () => {
  beforeEach(() => {
    installJestFetchMock();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    restoreGlobalFetch(originalFetch);
    jest.restoreAllMocks();
  });

  it('createMaterial - material_id 반환', async () => {
    jest.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        material_id: 'mat-abc',
        message: 'ok'
      })
    });

    const id = await promotionalContentAPI.createMaterial({
      project_id: 'p1',
      title: 'T',
      content: 'C',
      material_type: 'brochure'
    });

    expect(id).toBe('mat-abc');
  });
});
