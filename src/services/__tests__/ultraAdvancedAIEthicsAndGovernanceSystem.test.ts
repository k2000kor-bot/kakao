/**
 * UltraAdvancedAIEthicsAndGovernanceSystem 테스트
 */
import ultraAdvancedAIEthicsAndGovernanceSystem from '../ultraAdvancedAIEthicsAndGovernanceSystem';
import type { EthicsPolicy, GovernanceFramework } from '../ultraAdvancedAIEthicsAndGovernanceSystem';

const minimalPolicy: EthicsPolicy = {
  id: 'policy-test',
  name: '테스트 정책',
  description: '테스트',
  category: 'privacy',
  priority: 'medium',
  status: 'active',
  rules: [],
  compliance_threshold: 0.9,
  created_at: new Date(),
  updated_at: new Date(),
  metadata: {
    author: 'test',
    version: '1.0',
    tags: [],
    review_cycle: 30,
    last_review: null
  }
};

const minimalFramework: GovernanceFramework = {
  id: 'fw-test',
  name: '테스트 프레임워크',
  description: '테스트',
  version: '1.0',
  status: 'active',
  policies: [],
  compliance_requirements: [],
  audit_schedule: {
    frequency: 'monthly',
    next_audit: new Date(),
    last_audit: null
  },
  created_at: new Date(),
  updated_at: new Date(),
  metadata: {
    owner: 'test',
    stakeholders: [],
    regulatory_compliance: [],
    risk_level: 'low'
  }
};

describe('UltraAdvancedAIEthicsAndGovernanceSystem', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getInitializationStatus', () => {
    it('초기화 완료 시 true', () => {
      expect(ultraAdvancedAIEthicsAndGovernanceSystem.getInitializationStatus()).toBe(true);
    });
  });

  describe('getConfig', () => {
    it('설정 반환', () => {
      const config = ultraAdvancedAIEthicsAndGovernanceSystem.getConfig();
      expect(config).toBeDefined();
    });
  });

  describe('updateConfig', () => {
    it('설정 업데이트', () => {
      ultraAdvancedAIEthicsAndGovernanceSystem.updateConfig({ auto_monitoring: false });
      const config = ultraAdvancedAIEthicsAndGovernanceSystem.getConfig();
      expect(config.auto_monitoring).toBe(false);
    });
  });

  describe('getMetrics', () => {
    it('메트릭 반환', () => {
      const metrics = ultraAdvancedAIEthicsAndGovernanceSystem.getMetrics();
      expect(metrics).toBeDefined();
      expect(typeof metrics.total_policies).toBe('number');
    });
  });

  describe('createPolicy / getPolicies / getPolicy', () => {
    it('정책 생성 및 조회', async () => {
      await ultraAdvancedAIEthicsAndGovernanceSystem.createPolicy(minimalPolicy);

      const found = ultraAdvancedAIEthicsAndGovernanceSystem.getPolicy('policy-test');

      expect(found).toBeDefined();
      expect(found?.name).toBe('테스트 정책');
    });
  });

  describe('createFramework / getFrameworks / getFramework', () => {
    it('프레임워크 생성 및 조회', async () => {
      await ultraAdvancedAIEthicsAndGovernanceSystem.createFramework(minimalFramework);

      const fw = ultraAdvancedAIEthicsAndGovernanceSystem.getFramework('fw-test');
      expect(fw).toBeDefined();
      expect(fw?.name).toBe('테스트 프레임워크');
    });
  });

  describe('validateData', () => {
    it('데이터 검증', async () => {
      const result = await ultraAdvancedAIEthicsAndGovernanceSystem.validateData({ key: 'value' });

      expect(result).toBeDefined();
      expect(typeof result.is_valid).toBe('boolean');
      expect(Array.isArray(result.violations)).toBe(true);
      expect(typeof result.compliance_score).toBe('number');
    });
  });

  describe('getViolations', () => {
    it('위반 목록 반환', () => {
      const violations = ultraAdvancedAIEthicsAndGovernanceSystem.getViolations(10);
      expect(Array.isArray(violations)).toBe(true);
    });
  });

  describe('deletePolicy', () => {
    it('존재하지 않는 정책 삭제 시 에러', async () => {
      await expect(
        ultraAdvancedAIEthicsAndGovernanceSystem.deletePolicy('nonexistent')
      ).rejects.toThrow('찾을 수 없습니다');
    });
  });

  describe('deleteFramework', () => {
    it('존재하지 않는 프레임워크 삭제 시 에러', async () => {
      await expect(
        ultraAdvancedAIEthicsAndGovernanceSystem.deleteFramework('nonexistent')
      ).rejects.toThrow('찾을 수 없습니다');
    });
  });
});
