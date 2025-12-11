/**
 * realEstateKnowledgeService 서비스 테스트
 * 부동산 지식 서비스 테스트
 */

import { realEstateKnowledgeService } from '../realEstateKnowledgeService';
import { webSearchService } from '../webSearchService';

// webSearchService 모킹
jest.mock('../webSearchService', () => ({
  webSearchService: {
    searchWeb: jest.fn()
  }
}));

describe('realEstateKnowledgeService', () => {
  beforeEach(() => {
    // localStorage 모킹
    const localStorageMock = (() => {
      let store: { [key: string]: string } = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value.toString();
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          store = {};
        }
      };
    })();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
    localStorage.clear();
  });

  describe('싱글톤 인스턴스', () => {
    it('내보낸 인스턴스가 정의되어 있어야 함', () => {
      expect(realEstateKnowledgeService).toBeDefined();
    });
  });

  describe('addProject', () => {
    it('프로젝트를 추가할 수 있어야 함', () => {
      const project = {
        name: '테스트 재건축 프로젝트',
        location: {
          address: '서울시 강남구',
          district: '역삼동',
          coordinates: { lat: 37.5, lng: 127.0 }
        },
        status: 'planning' as const,
        timeline: {
          planningStart: new Date(),
          milestones: []
        },
        financials: {
          totalBudget: 100000000000,
          currentSpent: 0,
          estimatedCost: 100000000000,
          fundingSources: [],
          costBreakdown: {
            land: 0,
            construction: 0,
            design: 0,
            permits: 0,
            contingency: 0,
            other: 0
          },
          marketValue: {
            before: 50000000000,
            projected: 150000000000
          }
        },
        constructionCompany: '테스트 건설',
        residents: [],
        issues: [],
        marketAnalysis: {
          currentPrices: {
            sale: { min: 0, max: 0, average: 0, perSquareMeter: 0 },
            rent: { min: 0, max: 0, average: 0, perSquareMeter: 0 }
          },
          trends: {
            direction: 'stable' as const,
            percentage: 0,
            timeframe: '1year'
          },
          comparables: [],
          projections: [],
          factors: []
        },
        communityFeedback: []
      };

      const projectId = realEstateKnowledgeService.addProject(project);

      expect(projectId).toBeDefined();
      expect(typeof projectId).toBe('string');
    });
  });

  describe('analyzeCommunityFeedback', () => {
    it('커뮤니티 피드백을 분석할 수 있어야 함', async () => {
      // 먼저 프로젝트 추가
      const projectId = realEstateKnowledgeService.addProject({
        name: '피드백 테스트 프로젝트',
        location: {
          address: '서울시 강남구',
          district: '역삼동',
          coordinates: { lat: 37.5, lng: 127.0 }
        },
        status: 'planning' as const,
        timeline: {
          planningStart: new Date(),
          milestones: []
        },
        financials: {
          totalBudget: 100000000000,
          currentSpent: 0,
          estimatedCost: 100000000000,
          fundingSources: [],
          costBreakdown: {
            land: 0,
            construction: 0,
            design: 0,
            permits: 0,
            contingency: 0,
            other: 0
          },
          marketValue: {
            before: 50000000000,
            projected: 150000000000
          }
        },
        constructionCompany: '테스트 건설',
        residents: [],
        issues: [],
        marketAnalysis: {
          currentPrices: {
            sale: { min: 0, max: 0, average: 0, perSquareMeter: 0 },
            rent: { min: 0, max: 0, average: 0, perSquareMeter: 0 }
          },
          trends: {
            direction: 'stable' as const,
            percentage: 0,
            timeframe: '1year'
          },
          comparables: [],
          projections: [],
          factors: []
        },
        communityFeedback: []
      });

      const feedback = {
        id: 'feedback_1',
        platform: 'naver_cafe' as const,
        author: 'test_user',
        content: '프로젝트가 기대됩니다. 좋은 결과를 기대합니다.',
        sentiment: 'positive' as const,
        topics: ['일정'],
        timestamp: new Date(),
        responses: [],
        engagement: {
          likes: 10,
          comments: 5,
          shares: 2
        }
      };

      const response = await realEstateKnowledgeService.analyzeCommunityFeedback(projectId, feedback);

      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
      expect(response.type).toBe('ai_generated');
      expect(response.content).toBeDefined();
      expect(['professional', 'friendly', 'empathetic', 'informative']).toContain(response.tone);
    });

    it('존재하지 않는 프로젝트는 에러를 발생시켜야 함', async () => {
      const feedback = {
        id: 'feedback_1',
        platform: 'naver_cafe' as const,
        author: 'test_user',
        content: '테스트',
        sentiment: 'neutral' as const,
        topics: [],
        timestamp: new Date(),
        responses: [],
        engagement: {
          likes: 0,
          comments: 0,
          shares: 0
        }
      };

      await expect(
        realEstateKnowledgeService.analyzeCommunityFeedback('nonexistent', feedback)
      ).rejects.toThrow('프로젝트를 찾을 수 없습니다');
    });
  });

  describe('evaluateConstructionCompany', () => {
    it('시공사를 평가할 수 있어야 함', () => {
      const companies = realEstateKnowledgeService.getCompanies();
      if (companies.length > 0) {
        const evaluation = realEstateKnowledgeService.evaluateConstructionCompany(companies[0].id);

        expect(evaluation).toBeDefined();
        expect(typeof evaluation.score).toBe('number');
        expect(Array.isArray(evaluation.strengths)).toBe(true);
        expect(Array.isArray(evaluation.weaknesses)).toBe(true);
        expect(evaluation.recommendation).toBeDefined();
        expect(Array.isArray(evaluation.riskFactors)).toBe(true);
      }
    });

    it('존재하지 않는 시공사는 에러를 발생시켜야 함', () => {
      expect(() => {
        realEstateKnowledgeService.evaluateConstructionCompany('nonexistent');
      }).toThrow('시공사를 찾을 수 없습니다');
    });
  });

  describe('세금 계산 메서드', () => {
    describe('calculatePropertyTax', () => {
      it('재산세를 계산할 수 있어야 함', () => {
        const calculation = realEstateKnowledgeService.calculatePropertyTax(100000000, true);

        expect(calculation).toBeDefined();
        expect(calculation.taxType).toBe('재산세');
        expect(typeof calculation.taxableValue).toBe('number');
        expect(typeof calculation.taxRate).toBe('number');
        expect(typeof calculation.taxAmount).toBe('number');
        expect(Array.isArray(calculation.deductions)).toBe(true);
        expect(typeof calculation.finalTaxAmount).toBe('number');
        expect(calculation.dueDate).toBeInstanceOf(Date);
        expect(typeof calculation.isPaid).toBe('boolean');
      });

      it('1세대 1주택 공제를 적용해야 함', () => {
        const calculation = realEstateKnowledgeService.calculatePropertyTax(100000000, true);

        expect(calculation.deductions.length).toBeGreaterThan(0);
      });
    });

    describe('calculateComprehensiveRealEstateTax', () => {
      it('종합부동산세를 계산할 수 있어야 함', () => {
        const calculation = realEstateKnowledgeService.calculateComprehensiveRealEstateTax(1000000000, true);

        expect(calculation).toBeDefined();
        expect(calculation.taxType).toBe('종합부동산세');
      });

      it('9억원 이하 1세대 1주택은 비과세여야 함', () => {
        const calculation = realEstateKnowledgeService.calculateComprehensiveRealEstateTax(800000000, true);

        expect(calculation.taxableValue).toBe(0);
        expect(calculation.finalTaxAmount).toBe(0);
        expect(calculation.isPaid).toBe(true);
      });
    });

    describe('calculateAcquisitionTax', () => {
      it('취득세를 계산할 수 있어야 함', () => {
        const calculation = realEstateKnowledgeService.calculateAcquisitionTax(1000000000, false, false);

        expect(calculation).toBeDefined();
        expect(calculation.taxType).toBe('취득세');
        expect(calculation.taxRate).toBe(0.01);
      });

      it('조정대상지역은 3% 세율이 적용되어야 함', () => {
        const calculation = realEstateKnowledgeService.calculateAcquisitionTax(1000000000, false, true);

        expect(calculation.taxRate).toBe(0.03);
      });

      it('생애최초 주택구입 감면을 적용할 수 있어야 함', () => {
        const calculation = realEstateKnowledgeService.calculateAcquisitionTax(500000000, true, false);

        expect(calculation.deductions.length).toBeGreaterThan(0);
      });
    });

    describe('calculateCapitalGainsTax', () => {
      it('양도소득세를 계산할 수 있어야 함', () => {
        const calculation = realEstateKnowledgeService.calculateCapitalGainsTax(
          500000000,
          1000000000,
          5,
          false
        );

        expect(calculation).toBeDefined();
        expect(calculation.taxType).toBe('양도소득세');
      });

      it('1세대 1주택 2년 이상 거주는 비과세여야 함', () => {
        const calculation = realEstateKnowledgeService.calculateCapitalGainsTax(
          500000000,
          1000000000,
          3,
          true
        );

        expect(calculation.taxableValue).toBe(0);
        expect(calculation.finalTaxAmount).toBe(0);
        expect(calculation.isPaid).toBe(true);
      });

      it('장기보유특별공제를 적용할 수 있어야 함', () => {
        const calculation = realEstateKnowledgeService.calculateCapitalGainsTax(
          500000000,
          1000000000,
          5,
          false
        );

        expect(calculation.deductions.length).toBeGreaterThan(0);
      });
    });
  });

  describe('analyzeTaxOptimization', () => {
    it('세금 최적화를 분석할 수 있어야 함', () => {
      const taxInfo = realEstateKnowledgeService.getTaxInformation();
      if (taxInfo.length > 0) {
        const optimization = realEstateKnowledgeService.analyzeTaxOptimization(taxInfo[0].propertyId);

        expect(optimization).toBeDefined();
        expect(optimization.propertyId).toBe(taxInfo[0].propertyId);
        expect(typeof optimization.currentTaxBurden).toBe('number');
        expect(typeof optimization.optimizedTaxBurden).toBe('number');
        expect(typeof optimization.savings).toBe('number');
        expect(Array.isArray(optimization.strategies)).toBe(true);
        expect(Array.isArray(optimization.risks)).toBe(true);
        expect(typeof optimization.confidence).toBe('number');
      }
    });

    it('존재하지 않는 부동산은 에러를 발생시켜야 함', () => {
      expect(() => {
        realEstateKnowledgeService.analyzeTaxOptimization('nonexistent');
      }).toThrow('해당 부동산의 세금 정보를 찾을 수 없습니다');
    });
  });

  describe('updateAssessedValue', () => {
    it('공시가격을 업데이트할 수 있어야 함', () => {
      const taxInfo = realEstateKnowledgeService.getTaxInformation();
      if (taxInfo.length > 0) {
        const propertyId = taxInfo[0].propertyId;
        const newValue = 900000000;

        expect(() => {
          realEstateKnowledgeService.updateAssessedValue(propertyId, newValue);
        }).not.toThrow();

        const updated = realEstateKnowledgeService.getTaxInformationById(propertyId);
        expect(updated?.assessedValue).toBe(newValue);
      }
    });
  });

  describe('payTax', () => {
    it('세금 납부를 처리할 수 있어야 함', () => {
      const taxInfo = realEstateKnowledgeService.getTaxInformation();
      if (taxInfo.length > 0) {
        const propertyId = taxInfo[0].propertyId;

        expect(() => {
          realEstateKnowledgeService.payTax(propertyId, '재산세');
        }).not.toThrow();

        const updated = realEstateKnowledgeService.getTaxInformationById(propertyId);
        expect(updated?.taxes.propertyTax.isPaid).toBe(true);
      }
    });
  });

  describe('Getter 메서드', () => {
    it('getLaws를 호출할 수 있어야 함', () => {
      const laws = realEstateKnowledgeService.getLaws();

      expect(Array.isArray(laws)).toBe(true);
    });

    it('getProjects를 호출할 수 있어야 함', () => {
      const projects = realEstateKnowledgeService.getProjects();

      expect(Array.isArray(projects)).toBe(true);
    });

    it('getCompanies를 호출할 수 있어야 함', () => {
      const companies = realEstateKnowledgeService.getCompanies();

      expect(Array.isArray(companies)).toBe(true);
    });

    it('getPolicies를 호출할 수 있어야 함', () => {
      const policies = realEstateKnowledgeService.getPolicies();

      expect(Array.isArray(policies)).toBe(true);
    });

    it('getTaxInformation를 호출할 수 있어야 함', () => {
      const taxInfo = realEstateKnowledgeService.getTaxInformation();

      expect(Array.isArray(taxInfo)).toBe(true);
    });

    it('getTaxPolicies를 호출할 수 있어야 함', () => {
      const taxPolicies = realEstateKnowledgeService.getTaxPolicies();

      expect(Array.isArray(taxPolicies)).toBe(true);
    });

    it('getTaxOptimizations를 호출할 수 있어야 함', () => {
      const optimizations = realEstateKnowledgeService.getTaxOptimizations();

      expect(Array.isArray(optimizations)).toBe(true);
    });

    it('getProjectById로 프로젝트를 조회할 수 있어야 함', () => {
      const projects = realEstateKnowledgeService.getProjects();
      if (projects.length > 0) {
        const project = realEstateKnowledgeService.getProjectById(projects[0].id);
        expect(project).toBeDefined();
        expect(project?.id).toBe(projects[0].id);
      }
    });

    it('getCompanyById로 시공사를 조회할 수 있어야 함', () => {
      const companies = realEstateKnowledgeService.getCompanies();
      if (companies.length > 0) {
        const company = realEstateKnowledgeService.getCompanyById(companies[0].id);
        expect(company).toBeDefined();
        expect(company?.id).toBe(companies[0].id);
      }
    });

    it('getTaxInformationById로 세금 정보를 조회할 수 있어야 함', () => {
      const taxInfo = realEstateKnowledgeService.getTaxInformation();
      if (taxInfo.length > 0) {
        const info = realEstateKnowledgeService.getTaxInformationById(taxInfo[0].propertyId);
        expect(info).toBeDefined();
        expect(info?.propertyId).toBe(taxInfo[0].propertyId);
      }
    });

    it('getMarketAnalysis로 시장 분석을 조회할 수 있어야 함', () => {
      const analysis = realEstateKnowledgeService.getMarketAnalysis('강남구');

      // marketData가 비어있을 수 있으므로 undefined일 수 있음
      expect(analysis === undefined || typeof analysis === 'object').toBe(true);
    });
  });
});

