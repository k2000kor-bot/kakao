/**
 * ConstructionCompanyService 테스트
 */
import constructionCompanyService from '../constructionCompanyService';
import axios from 'axios';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn()
  }
}));

jest.mock('../../utils/errorLogger', () => ({
  errorLogger: { error: jest.fn(), warn: jest.fn() }
}));

describe('ConstructionCompanyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCompanies', () => {
    it('API 성공 시 시공사 목록 반환', async () => {
      jest.mocked(axios.get).mockResolvedValue({
        data: {
          companies: [
            { id: 'c1', name: '테스트 시공사', rating: 4.5 }
          ]
        }
      });

      const result = await constructionCompanyService.getCompanies();

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].name).toBe('테스트 시공사');
    });

    it('API 실패 시 샘플 데이터 반환', async () => {
      jest.mocked(axios.get).mockRejectedValue(new Error('Network error'));

      const result = await constructionCompanyService.getCompanies();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
    });
  });

  describe('getCompany', () => {
    it('API 성공 시 시공사 상세 반환', async () => {
      jest.mocked(axios.get).mockResolvedValue({
        data: {
          company: {
            id: 'api-1',
            name: 'API 시공사',
            rating: 4.8,
            headquarters: '부산'
          }
        }
      });

      const result = await constructionCompanyService.getCompany('api-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('api-1');
      expect(result?.name).toBe('API 시공사');
      expect(result?.rating).toBe(4.8);
    });

    it('API 실패 시 샘플에서 company-1 조회', async () => {
      jest.mocked(axios.get).mockRejectedValue(new Error('Network error'));

      const result = await constructionCompanyService.getCompany('company-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('company-1');
      expect(result?.name).toBeDefined();
    });

    it('존재하지 않는 ID는 null 반환', async () => {
      jest.mocked(axios.get).mockRejectedValue(new Error('Network error'));

      const result = await constructionCompanyService.getCompany('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getDefectIssues', () => {
    it('API 실패 시 샘플 하자 이슈 반환', async () => {
      jest.mocked(axios.get).mockRejectedValue(new Error('Network error'));

      const result = await constructionCompanyService.getDefectIssues();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('severity');
    });
  });

  describe('generateResponsePlan', () => {
    it('API 실패 시 샘플 대응 방안 반환', async () => {
      jest.mocked(axios.post).mockRejectedValue(new Error('Network error'));

      const result = await constructionCompanyService.generateResponsePlan(
        'issue-1',
        'company-1'
      );

      expect(result).toBeDefined();
      expect(result.issue_id).toBe('issue-1');
      expect(result.company_id).toBe('company-1');
      expect(Array.isArray(result.steps)).toBe(true);
    });
  });

  describe('analyzeSelectionCriteria', () => {
    it('API 실패 시 샘플 분석 반환', async () => {
      jest.mocked(axios.post).mockRejectedValue(new Error('Network error'));

      const result = await constructionCompanyService.analyzeSelectionCriteria(
        ['company-1']
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty('company_id');
      expect(result[0]).toHaveProperty('criteria_scores');
    });
  });

  describe('compareCompanies', () => {
    it('API 실패 시 샘플 비교 결과 반환', async () => {
      jest.mocked(axios.post).mockRejectedValue(new Error('Network error'));

      const result = await constructionCompanyService.compareCompanies([
        'company-1',
        'company-2'
      ]);

      expect(result).toBeDefined();
      expect(Array.isArray(result.companies)).toBe(true);
      expect(result).toHaveProperty('summary');
    });

    it('비교 결과에 companies 배열과 summary 포함', async () => {
      jest.mocked(axios.post).mockRejectedValue(new Error('Network error'));

      const result = await constructionCompanyService.compareCompanies([
        'company-1',
        'company-2'
      ]);

      expect(result.companies.length).toBeGreaterThanOrEqual(2);
      expect(typeof result.summary).toBe('string');
      expect(result.companies[0]).toHaveProperty('company_id');
      expect(result.companies[0]).toHaveProperty('company_name');
    });
  });
});
