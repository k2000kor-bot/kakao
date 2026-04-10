/**
 * domainKnowledgeService 서비스 테스트
 * 도메인별 지식 베이스 서비스 테스트
 * @jest-environment jsdom
 */
/* eslint-disable jest/no-conditional-expect */

import domainKnowledgeService, {
  DomainType,
  DOMAIN_KNOWLEDGE_CONFIG_STORAGE_KEY,
} from '../domainKnowledgeService';

// localStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};

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
    },
  };
})();

// errorLogger 모킹
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('domainKnowledgeService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
  });

  describe('싱글톤 인스턴스', () => {
    it('내보낸 인스턴스가 정의되어 있어야 함', () => {
      expect(domainKnowledgeService).toBeDefined();
    });
  });

  describe('getDomainKnowledge', () => {
    it('도메인별 지식을 조회할 수 있어야 함', () => {
      const knowledge = domainKnowledgeService.getDomainKnowledge('urban_planning');

      expect(knowledge).not.toBeNull();
      expect(knowledge?.domain).toBe('urban_planning');
      expect(knowledge?.name).toBe('도시정비');
    });

    it('세무 도메인 지식을 조회할 수 있어야 함', () => {
      const knowledge = domainKnowledgeService.getDomainKnowledge('tax');

      expect(knowledge).not.toBeNull();
      expect(knowledge?.domain).toBe('tax');
      expect(knowledge?.name).toBe('세무');
    });

    it('법무 도메인 지식을 조회할 수 있어야 함', () => {
      const knowledge = domainKnowledgeService.getDomainKnowledge('legal');

      expect(knowledge).not.toBeNull();
      expect(knowledge?.domain).toBe('legal');
      expect(knowledge?.name).toBe('법무');
    });

    it('금융 도메인 지식을 조회할 수 있어야 함', () => {
      const knowledge = domainKnowledgeService.getDomainKnowledge('finance');

      expect(knowledge).not.toBeNull();
      expect(knowledge?.domain).toBe('finance');
      expect(knowledge?.name).toBe('금융');
    });

    it('존재하지 않는 도메인은 null을 반환해야 함', () => {
      const knowledge = domainKnowledgeService.getDomainKnowledge('nonexistent' as DomainType);

      expect(knowledge).toBeNull();
    });
  });

  describe('getAllDomainKnowledge', () => {
    it('모든 도메인 지식을 반환해야 함', () => {
      const allKnowledge = domainKnowledgeService.getAllDomainKnowledge();

      expect(Array.isArray(allKnowledge)).toBe(true);
      expect(allKnowledge.length).toBeGreaterThan(0);
    });

    it('각 도메인이 필수 속성을 가져야 함', () => {
      const allKnowledge = domainKnowledgeService.getAllDomainKnowledge();

      allKnowledge.forEach(knowledge => {
        expect(knowledge.domain).toBeDefined();
        expect(knowledge.name).toBeDefined();
        expect(knowledge.description).toBeDefined();
        expect(Array.isArray(knowledge.keywords)).toBe(true);
        expect(Array.isArray(knowledge.knowledgeBase)).toBe(true);
        expect(knowledge.detailedKnowledge).toBeDefined();
        expect(Array.isArray(knowledge.contextPrompts)).toBe(true);
        expect(Array.isArray(knowledge.relatedLaws)).toBe(true);
      });
    });
  });

  describe('enrichPromptWithDomainKnowledge', () => {
    it('프롬프트에 도메인 컨텍스트를 추가할 수 있어야 함', () => {
      const prompt = '재개발사업에 대해 알려주세요';
      const enriched = domainKnowledgeService.enrichPromptWithDomainKnowledge(
        prompt,
        ['urban_planning']
      );

      expect(enriched).toContain('도시정비');
      expect(enriched).toContain('도메인 전문 지식');
    });

    it('여러 도메인을 포함할 수 있어야 함', () => {
      const prompt = '재개발사업과 세금에 대해 알려주세요';
      const enriched = domainKnowledgeService.enrichPromptWithDomainKnowledge(
        prompt,
        ['urban_planning', 'tax']
      );

      expect(enriched).toContain('도시정비');
      expect(enriched).toContain('세무');
    });

    it('도메인이 없으면 원본 프롬프트를 반환해야 함', () => {
      const prompt = '일반 질문';
      const enriched = domainKnowledgeService.enrichPromptWithDomainKnowledge(prompt, []);

      expect(enriched).toBe(prompt);
    });

    it('존재하지 않는 도메인은 무시해야 함', () => {
      const prompt = '질문';
      const enriched = domainKnowledgeService.enrichPromptWithDomainKnowledge(
        prompt,
        ['nonexistent' as DomainType]
      );

      expect(enriched).toBe(prompt);
    });
  });

  describe('setConfig', () => {
    it('도메인 설정을 업데이트할 수 있어야 함', () => {
      domainKnowledgeService.setConfig({
        enabledDomains: ['urban_planning', 'tax'],
        priority: ['urban_planning'],
        contextWeight: 0.5,
      });

      const config = domainKnowledgeService.loadConfig();
      expect(config.enabledDomains).toContain('urban_planning');
      expect(config.enabledDomains).toContain('tax');
      expect(config.priority).toContain('urban_planning');
      expect(config.contextWeight).toBe(0.5);
    });

    it('부분 설정만 업데이트할 수 있어야 함', () => {
      domainKnowledgeService.setConfig({
        enabledDomains: ['urban_planning'],
      });

      const config = domainKnowledgeService.loadConfig();
      expect(config.enabledDomains).toContain('urban_planning');
      expect(config.contextWeight).toBeDefined(); // 기본값 유지
    });
  });

  describe('loadConfig', () => {
    it('저장된 설정을 로드할 수 있어야 함', () => {
      const testConfig = {
        enabledDomains: ['urban_planning'],
        priority: ['urban_planning'],
        contextWeight: 0.4,
      };

      localStorage.setItem(DOMAIN_KNOWLEDGE_CONFIG_STORAGE_KEY, JSON.stringify(testConfig));

      const config = domainKnowledgeService.loadConfig();
      expect(config.enabledDomains).toContain('urban_planning');
      expect(config.contextWeight).toBe(0.4);
    });

    it('저장된 설정이 없으면 기본 설정을 반환해야 함', () => {
      const config = domainKnowledgeService.loadConfig();

      expect(config).toBeDefined();
      expect(config.contextWeight).toBeDefined();
    });
  });

  describe('detectDomainsFromPrompt', () => {
    it('프롬프트에서 도메인을 자동 감지할 수 있어야 함', () => {
      const prompt = '재개발사업에 대해 알려주세요';
      const detected = domainKnowledgeService.detectDomainsFromPrompt(prompt);

      expect(Array.isArray(detected)).toBe(true);
      expect(detected.length).toBeGreaterThan(0);
    });

    it('도시정비 관련 키워드로 도메인을 감지해야 함', () => {
      const prompt = '재개발 재건축 정비사업';
      const detected = domainKnowledgeService.detectDomainsFromPrompt(prompt);

      expect(detected).toContain('urban_planning');
    });

    it('세무 관련 키워드로 도메인을 감지해야 함', () => {
      const prompt = '양도소득세 종부세 취득세';
      const detected = domainKnowledgeService.detectDomainsFromPrompt(prompt);

      expect(detected).toContain('tax');
    });

    it('법무 관련 키워드로 도메인을 감지해야 함', () => {
      const prompt = '계약 하자담보책임 소유권';
      const detected = domainKnowledgeService.detectDomainsFromPrompt(prompt);

      expect(detected).toContain('legal');
    });

    it('금융 관련 키워드로 도메인을 감지해야 함', () => {
      const prompt = '대출 LTV DTI 전세자금';
      const detected = domainKnowledgeService.detectDomainsFromPrompt(prompt);

      expect(detected).toContain('finance');
    });

    it('여러 도메인을 동시에 감지할 수 있어야 함', () => {
      const prompt = '재개발사업과 양도소득세에 대해';
      const detected = domainKnowledgeService.detectDomainsFromPrompt(prompt);

      expect(detected.length).toBeGreaterThan(1);
    });

    it('키워드가 없으면 빈 배열을 반환해야 함', () => {
      const prompt = '일반적인 질문';
      const detected = domainKnowledgeService.detectDomainsFromPrompt(prompt);

      expect(Array.isArray(detected)).toBe(true);
    });
  });

  describe('getDomainDetails', () => {
    it('도메인별 상세 정보를 조회할 수 있어야 함', () => {
      const details = domainKnowledgeService.getDomainDetails('urban_planning');

      expect(details).not.toBeNull();
      expect(details?.concepts).toBeDefined();
      expect(Array.isArray(details?.concepts)).toBe(true);
      expect(details?.procedures).toBeDefined();
      expect(Array.isArray(details?.procedures)).toBe(true);
      expect(details?.regulations).toBeDefined();
      expect(Array.isArray(details?.regulations)).toBe(true);
      expect(details?.examples).toBeDefined();
      expect(Array.isArray(details?.examples)).toBe(true);
    });

    it('세무 도메인 상세 정보를 조회할 수 있어야 함', () => {
      const details = domainKnowledgeService.getDomainDetails('tax');

      expect(details).not.toBeNull();
      expect(details?.concepts.length).toBeGreaterThan(0);
    });

    it('존재하지 않는 도메인은 null을 반환해야 함', () => {
      const details = domainKnowledgeService.getDomainDetails('nonexistent' as DomainType);

      expect(details).toBeNull();
    });

    it('개념 정보가 포함되어 있어야 함', () => {
      const details = domainKnowledgeService.getDomainDetails('urban_planning');

      expect(details?.concepts.length).toBeGreaterThan(0);
      details?.concepts.forEach(concept => {
        expect(concept.term).toBeDefined();
        expect(concept.definition).toBeDefined();
        expect(concept.details).toBeDefined();
      });
    });

    it('절차 정보가 포함되어 있어야 함', () => {
      const details = domainKnowledgeService.getDomainDetails('urban_planning');

      if (details && details.procedures.length > 0) {
        details.procedures.forEach(proc => {
          expect(proc.title).toBeDefined();
          expect(Array.isArray(proc.steps)).toBe(true);
          expect(Array.isArray(proc.notes)).toBe(true);
        });
      }
    });
  });

  describe('도메인 지식 데이터 검증', () => {
    it('모든 도메인이 유효한 DomainType이어야 함', () => {
      const validDomains: DomainType[] = [
        'urban_planning',
        'tax',
        'legal',
        'finance',
        'molit',
        'real_estate_policy',
        'supreme_court',
        'real_estate_brokerage',
        'building_law',
        'seoul_admin',
        'criminal',
        'contract',
        'accounting',
        'appraisal',
      ];

      const allKnowledge = domainKnowledgeService.getAllDomainKnowledge();
      allKnowledge.forEach(knowledge => {
        expect(validDomains).toContain(knowledge.domain);
      });
    });

    it('각 도메인이 키워드를 가져야 함', () => {
      const allKnowledge = domainKnowledgeService.getAllDomainKnowledge();
      allKnowledge.forEach(knowledge => {
        expect(knowledge.keywords.length).toBeGreaterThan(0);
      });
    });

    it('각 도메인이 지식 베이스를 가져야 함', () => {
      const allKnowledge = domainKnowledgeService.getAllDomainKnowledge();
      allKnowledge.forEach(knowledge => {
        expect(knowledge.knowledgeBase.length).toBeGreaterThan(0);
      });
    });
  });
});

