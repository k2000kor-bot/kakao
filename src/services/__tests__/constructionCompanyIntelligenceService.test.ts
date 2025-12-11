/**
 * ConstructionCompanyIntelligenceService 테스트
 */

import {
  ConstructionCompanyIntelligenceService,
  constructionCompanyIntelligenceService,
} from '../constructionCompanyIntelligenceService';

describe('ConstructionCompanyIntelligenceService', () => {
  let service: ConstructionCompanyIntelligenceService;

  beforeEach(() => {
    service = new ConstructionCompanyIntelligenceService();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(ConstructionCompanyIntelligenceService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(constructionCompanyIntelligenceService).toBeDefined();
    });

    it('초기 데이터 확인', () => {
      const defects = service.getDefectIssues();
      const companies = service.getCompanyPerformances();
      const criteria = service.getSelectionCriteria();

      expect(Array.isArray(defects)).toBe(true);
      expect(Array.isArray(companies)).toBe(true);
      expect(Array.isArray(criteria)).toBe(true);
    });
  });

  describe('하자 이슈 분석', () => {
    it('전체 하자 이슈 분석', () => {
      const analytics = service.analyzeDefectIssues();

      expect(analytics).toBeDefined();
      expect(typeof analytics.totalDefects).toBe('number');
      expect(typeof analytics.defectsByCategory).toBe('object');
      expect(typeof analytics.defectsBySeverity).toBe('object');
      expect(typeof analytics.defectsByCompany).toBe('object');
      expect(typeof analytics.averageResolutionTime).toBe('number');
      expect(typeof analytics.totalDefectCost).toBe('number');
      expect(Array.isArray(analytics.defectTrends)).toBe(true);
      expect(Array.isArray(analytics.topDefectTypes)).toBe(true);
      expect(Array.isArray(analytics.resolutionEfficiency)).toBe(true);
    });

    it('특정 회사 하자 이슈 분석', () => {
      const companies = service.getCompanyPerformances();
      if (companies.length > 0) {
        const companyId = companies[0].companyId;
        const analytics = service.analyzeDefectIssues(companyId);

        expect(analytics).toBeDefined();
        expect(typeof analytics.totalDefects).toBe('number');
      }
    });

    it('하자 이슈 추가', () => {
      const newDefect = {
        companyId: 'company-test',
        projectId: 'project-test',
        category: 'structural' as const,
        severity: 'major' as const,
        description: '테스트 하자',
        location: '테스트 위치',
        reportedDate: new Date(),
        cost: 1000000,
        responsibleParty: 'contractor' as const,
        status: 'reported' as const,
      };

      const result = service.addDefectIssue(newDefect);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.companyId).toBe(newDefect.companyId);
      expect(result.description).toBe(newDefect.description);
    });
  });

  describe('회사 성과 분석', () => {
    it('회사 성과 조회', () => {
      const performances = service.getCompanyPerformances();

      expect(Array.isArray(performances)).toBe(true);
      if (performances.length > 0) {
        const performance = performances[0];
        expect(performance.companyId).toBeDefined();
        expect(typeof performance.totalProjects).toBe('number');
        expect(typeof performance.qualityScore).toBe('number');
      }
    });

    it('특정 회사 성과 평가', () => {
      const companies = service.getCompanyPerformances();
      if (companies.length > 0) {
        const companyId = companies[0].companyId;
        const performance = service.evaluateCompanyPerformance(companyId);

        expect(performance).toBeDefined();
        if (performance) {
          expect(performance.companyId).toBe(companyId);
        }
      }
    });
  });

  describe('선정 기준 관리', () => {
    it('선정 기준 조회', () => {
      const criteria = service.getSelectionCriteria();

      expect(Array.isArray(criteria)).toBe(true);
      if (criteria.length > 0) {
        const criterion = criteria[0];
        expect(criterion.id).toBeDefined();
        expect(typeof criterion.weight).toBe('number');
        expect(criterion.category).toBeDefined();
      }
    });

    it('선정 기준 분석', () => {
      const criteria = service.analyzeSelectionCriteria();

      expect(Array.isArray(criteria)).toBe(true);
    });
  });

  describe('회사 평가', () => {
    it('회사 평가 생성', () => {
      const companies = service.getCompanyPerformances();

      if (companies.length > 0) {
        const companyId = companies[0].companyId;
        const evaluation = service.evaluateCompany(companyId);

        expect(evaluation).toBeDefined();
        expect(evaluation.companyId).toBe(companyId);
        expect(typeof evaluation.totalScore).toBe('number');
        expect(Array.isArray(evaluation.criteriaScores)).toBe(true);
        expect(evaluation.recommendation).toBeDefined();
      }
    });

    it('가중치를 포함한 회사 평가', () => {
      const companies = service.getCompanyPerformances();
      const criteria = service.getSelectionCriteria();

      if (companies.length > 0 && criteria.length > 0) {
        const companyId = companies[0].companyId;
        const weights: { [criteriaId: string]: number } = {};
        criteria.forEach(c => {
          weights[c.id] = c.weight;
        });

        const evaluation = service.evaluateCompany(companyId, weights);

        expect(evaluation).toBeDefined();
        expect(evaluation.companyId).toBe(companyId);
      }
    });
  });

  describe('대응 전략', () => {
    it('하자 이슈 기반 대응 전략 생성', () => {
      const defect: any = {
        id: 'defect-1',
        companyId: 'company-1',
        projectId: 'project-1',
        category: 'structural',
        severity: 'critical',
        description: '테스트 하자',
        location: '테스트 위치',
        reportedDate: new Date(),
        cost: 1000000,
        responsibleParty: 'contractor',
        status: 'reported',
      };

      const strategy = service.generateResponseStrategy(defect);

      expect(strategy).toBeDefined();
      expect(strategy.defectCategory).toBe('structural');
      expect(strategy.severity).toBe('critical');
      expect(strategy.recommendedActions).toBeDefined();
    });

    it('예방 조치 조회', () => {
      const measures = service.getPreventiveMeasures('structural');

      expect(Array.isArray(measures)).toBe(true);
      expect(measures.length).toBeGreaterThan(0);
    });
  });

  describe('비교 분석', () => {
    it('회사 비교 분석', () => {
      const companies = service.getCompanyPerformances();
      if (companies.length >= 2) {
        const companyIds = companies.slice(0, 2).map(c => c.companyId);
        const comparison = service.compareCompanies(companyIds);

        expect(comparison).toBeDefined();
        expect(Array.isArray(comparison.comparison)).toBe(true);
        expect(Array.isArray(comparison.ranking)).toBe(true);
        expect(Array.isArray(comparison.recommendations)).toBe(true);
      }
    });
  });

  describe('품질 개선 계획', () => {
    it('품질 개선 계획 생성', () => {
      const companies = service.getCompanyPerformances();
      if (companies.length > 0) {
        const companyId = companies[0].companyId;
        const plan = service.generateQualityImprovementPlan(companyId);

        expect(plan).toBeDefined();
        expect(Array.isArray(plan.currentIssues)).toBe(true);
        expect(Array.isArray(plan.improvementActions)).toBe(true);
        expect(Array.isArray(plan.kpis)).toBe(true);
      }
    });
  });
});

