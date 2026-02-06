/**
 * 노트북 LLM 서비스
 * 프로젝트별 및 기본 노트북 LLM 관리
 */

import { errorReportingService } from './errorReportingService';
import { errorLogger } from '../utils/errorLogger';

/**
 * 부동산 관련 도메인 지식 베이스
 * 도시정비, 세무, 법무, 금융, 국토부, 부동산정책, 대법원판례, 부동산중개
 */
export interface DomainKnowledge {
  domain: string;
  laws: string[];
  concepts: string[];
  procedures?: string[];
  calculations?: string[];
  policies?: string[];
  cases?: string[];
}

export const DOMAIN_KNOWLEDGE_BASE: Record<string, DomainKnowledge> = {
  도시정비: {
    domain: '도시정비',
    laws: [
      '도시 및 주거환경정비법',
      '도시재생 활성화 및 지원에 관한 특별법',
      '건축법',
      '국토의 계획 및 이용에 관한 법률'
    ],
    concepts: [
      '재개발',
      '재건축',
      '도시환경정비사업',
      '주거환경개선사업',
      '정비구역',
      '조합설립',
      '관리처분계획',
      '분양',
      '이주대책',
      '감정평가',
      '감정평가사',
      '시가산정'
    ],
    procedures: [
      '정비구역 지정',
      '조합설립 인가',
      '사업시행계획 수립',
      '관리처분계획 수립 및 인가',
      '시공사 선정',
      '착공',
      '준공',
      '분양'
    ]
  },
  세무: {
    domain: '세무',
    laws: [
      '소득세법',
      '부가가치세법',
      '종합부동산세법',
      '상속세 및 증여세법',
      '국세기본법'
    ],
    concepts: [
      '양도소득세',
      '취득세',
      '종합부동산세',
      '상속세',
      '증여세',
      '부가가치세',
      '세액공제',
      '세액감면',
      '양도소득공제',
      '세무사'
    ],
    calculations: [
      '양도소득세 = (양도가액 - 취득가액 - 필요경비) × 세율',
      '1세대 1주택 비과세 요건',
      '장기보유특별공제',
      '취득세 = 취득가액 × 세율'
    ]
  },
  법무: {
    domain: '법무',
    laws: [
      '민법',
      '부동산등기법',
      '집행법',
      '경매법',
      '가등기담보 등에 관한 법률'
    ],
    concepts: [
      '소유권',
      '등기',
      '전세권',
      '저당권',
      '지상권',
      '임대차',
      '계약',
      '불법행위',
      '손해배상',
      '변호사',
      '법무사'
    ],
    procedures: [
      '계약서 작성',
      '등기',
      '인도',
      '대금지급',
      '소유권 이전'
    ]
  },
  금융: {
    domain: '금융',
    laws: [],
    concepts: [
      'LTV(담보인정비율)',
      'DTI(총부채상환비율)',
      '금리',
      '대출한도',
      '상환방식',
      '중도상환',
      '연체이자',
      '주택담보대출',
      '전세자금대출',
      '부동산펀드',
      '리츠(REITs)',
      '부동산투자회사',
      '회계사'
    ],
    policies: [
      '주택담보대출 규제',
      'DSR 규제',
      'LTV 규제',
      '금리인상'
    ]
  },
  국토부: {
    domain: '국토부',
    laws: [
      '국토의 계획 및 이용에 관한 법률',
      '주택법',
      '택지개발촉진법',
      '도시개발법'
    ],
    concepts: [
      '주택공급계획',
      '택지개발',
      '신도시 개발',
      '도시계획',
      '용도지역',
      '건폐율',
      '용적률'
    ],
    policies: [
      '주택공급 확대',
      '주택가격 안정',
      '도시재생',
      '국토계획',
      '교통망 구축'
    ]
  },
  부동산정책: {
    domain: '부동산정책',
    laws: [],
    concepts: [
      '분양가상한제',
      '재개발 규제',
      '재건축 규제',
      '전세보증금 상한',
      '임대차 3법',
      '투기지역',
      '투기과열지구'
    ],
    policies: [
      '2020년 7.10 대책',
      '2021년 2.4 대책',
      '2022년 3.23 대책',
      '임대차 3법 시행',
      '주택가격 안정 대책',
      '전세시장 안정화',
      '임대차 보호',
      '재개발·재건축 규제',
      '투기억제'
    ]
  },
  대법원판례: {
    domain: '대법원판례',
    laws: [],
    concepts: [
      '전세권 우선변제권',
      '임대차 보호',
      '계약해제',
      '하자담보책임',
      '부당이득',
      '명의신탁',
      '변호사',
      '법무사'
    ],
    cases: [
      '신의성실의 원칙',
      '계약자유의 원칙',
      '소유권 이전',
      '등기의 공신력'
    ]
  },
  부동산중개: {
    domain: '부동산중개',
    laws: [
      '부동산중개업법',
      '공인중개사법'
    ],
    concepts: [
      '중개수수료',
      '중개계약',
      '중개대상물 확인·설명의무',
      '중개보수',
      '손해배상책임',
      '부동산중개사',
      '공인중개사'
    ],
    procedures: [
      '중개의뢰',
      '중개대상물 조사',
      '계약체결 알선',
      '계약서 작성',
      '중개보수 수령'
    ]
  }
};

// buildIntelligentContextSimple 함수는 더 이상 사용되지 않으므로 제거됨
// 대신 buildIntelligentContext(prompt, selectedDomains, includeRelated) 사용

/**
 * 도메인 지식 검색
 */
export interface DomainSearchResult {
  domain: string;
  matches: {
    type: 'law' | 'concept' | 'procedure' | 'calculation' | 'policy' | 'case';
    content: string;
    relevance: number;
  }[];
  totalMatches: number;
}

export function searchDomainKnowledge(query: string, domainFilter?: string[]): DomainSearchResult[] {
  const queryLower = query.toLowerCase();
  const results: DomainSearchResult[] = [];
  const domainsToSearch = domainFilter || Object.keys(DOMAIN_KNOWLEDGE_BASE);

  for (const domainKey of domainsToSearch) {
    const domain = DOMAIN_KNOWLEDGE_BASE[domainKey];
    if (!domain) continue;

    const matches: DomainSearchResult['matches'] = [];

    // 법령 검색
    for (const law of domain.laws) {
      if (law.toLowerCase().includes(queryLower)) {
        matches.push({
          type: 'law',
          content: law,
          relevance: 3,
        });
      }
    }

    // 개념 검색
    for (const concept of domain.concepts) {
      if (concept.toLowerCase().includes(queryLower)) {
        matches.push({
          type: 'concept',
          content: concept,
          relevance: 2,
        });
      }
    }

    // 절차 검색
    if (domain.procedures) {
      for (const procedure of domain.procedures) {
        if (procedure.toLowerCase().includes(queryLower)) {
          matches.push({
            type: 'procedure',
            content: procedure,
            relevance: 1.5,
          });
        }
      }
    }

    // 계산방법 검색
    if (domain.calculations) {
      for (const calc of domain.calculations) {
        if (calc.toLowerCase().includes(queryLower)) {
          matches.push({
            type: 'calculation',
            content: calc,
            relevance: 2.5,
          });
        }
      }
    }

    // 정책 검색
    if (domain.policies) {
      for (const policy of domain.policies) {
        if (policy.toLowerCase().includes(queryLower)) {
          matches.push({
            type: 'policy',
            content: policy,
            relevance: 2,
          });
        }
      }
    }

    // 판례 검색
    if (domain.cases) {
      for (const case_principle of domain.cases) {
        if (case_principle.toLowerCase().includes(queryLower)) {
          matches.push({
            type: 'case',
            content: case_principle,
            relevance: 2.5,
          });
        }
      }
    }

    if (matches.length > 0) {
      // 관련도 순으로 정렬
      matches.sort((a, b) => b.relevance - a.relevance);

      results.push({
        domain: domainKey,
        matches,
        totalMatches: matches.length,
      });
    }
  }

  // 매칭 수가 많은 순으로 정렬
  results.sort((a, b) => b.totalMatches - a.totalMatches);

  return results;
}

/**
 * 도메인별 상세 정보 가져오기
 */
export interface DomainDetail {
  domain: string;
  summary: string;
  laws: string[];
  concepts: string[];
  procedures?: string[];
  calculations?: string[];
  policies?: string[];
  cases?: string[];
  relatedDomains: string[];
  examples?: string[];
}

export function getDomainDetail(domainKey: string): DomainDetail | null {
  const domain = DOMAIN_KNOWLEDGE_BASE[domainKey];
  if (!domain) return null;

  // 관련 도메인 찾기
  const domainRelations: Record<string, string[]> = {
    '도시정비': ['국토부', '부동산정책', '법무'],
    '세무': ['법무', '부동산정책'],
    '법무': ['세무', '부동산중개', '대법원판례'],
    '금융': ['부동산정책', '세무'],
    '국토부': ['도시정비', '부동산정책'],
    '부동산정책': ['국토부', '세무', '금융'],
    '대법원판례': ['법무', '부동산중개'],
    '부동산중개': ['법무', '대법원판례']
  };

  // 예시 케이스 생성
  const examples: string[] = [];
  if (domainKey === '도시정비') {
    examples.push('재개발 조합 설립 절차', '정비구역 지정 요건', '관리처분계획 수립');
  } else if (domainKey === '세무') {
    examples.push('양도소득세 계산 예시', '1세대 1주택 비과세 확인', '장기보유특별공제 적용');
  } else if (domainKey === '법무') {
    examples.push('부동산 등기 절차', '임대차 계약서 작성', '전세권 설정');
  }

  return {
    domain: domainKey,
    summary: `${domainKey} 관련 전문 지식입니다.`,
    laws: domain.laws,
    concepts: domain.concepts,
    procedures: domain.procedures,
    calculations: domain.calculations,
    policies: domain.policies,
    cases: domain.cases,
    relatedDomains: domainRelations[domainKey] || [],
    examples,
  };
}

/**
 * 전문 용어 사전
 */
export interface TermDefinition {
  term: string;
  domain: string;
  definition: string;
  relatedTerms: string[];
  examples?: string[];
}

export function getTermDefinition(term: string): TermDefinition[] {
  const results: TermDefinition[] = [];
  const termLower = term.toLowerCase();

  for (const [domainKey, domain] of Object.entries(DOMAIN_KNOWLEDGE_BASE)) {
    // 개념에서 검색
    for (const concept of domain.concepts) {
      if (concept.toLowerCase().includes(termLower) || termLower.includes(concept.toLowerCase())) {
        results.push({
          term: concept,
          domain: domainKey,
          definition: `${concept}은(는) ${domainKey} 도메인의 핵심 개념입니다.`,
          relatedTerms: domain.concepts.filter(c => c !== concept).slice(0, 5),
        });
      }
    }
  }

  return results;
}

/**
 * 도메인 지식 통계
 */
export interface DomainStatistics {
  totalDomains: number;
  totalLaws: number;
  totalConcepts: number;
  totalProcedures: number;
  totalCalculations: number;
  totalPolicies: number;
  totalCases: number;
  domainBreakdown: {
    domain: string;
    laws: number;
    concepts: number;
    procedures?: number;
    calculations?: number;
    policies?: number;
    cases?: number;
  }[];
}

export function getDomainStatistics(): DomainStatistics {
  const domainBreakdown = Object.entries(DOMAIN_KNOWLEDGE_BASE).map(([key, domain]) => ({
    domain: key,
    laws: domain.laws.length,
    concepts: domain.concepts.length,
    procedures: domain.procedures?.length || 0,
    calculations: domain.calculations?.length || 0,
    policies: domain.policies?.length || 0,
    cases: domain.cases?.length || 0,
  }));

  const totalLaws = domainBreakdown.reduce((sum, d) => sum + d.laws, 0);
  const totalConcepts = domainBreakdown.reduce((sum, d) => sum + d.concepts, 0);
  const totalProcedures = domainBreakdown.reduce((sum, d) => sum + (d.procedures || 0), 0);
  const totalCalculations = domainBreakdown.reduce((sum, d) => sum + (d.calculations || 0), 0);
  const totalPolicies = domainBreakdown.reduce((sum, d) => sum + (d.policies || 0), 0);
  const totalCases = domainBreakdown.reduce((sum, d) => sum + (d.cases || 0), 0);

  return {
    totalDomains: Object.keys(DOMAIN_KNOWLEDGE_BASE).length,
    totalLaws,
    totalConcepts,
    totalProcedures,
    totalCalculations,
    totalPolicies,
    totalCases,
    domainBreakdown,
  };
}

/**
 * 도메인별 FAQ 및 예시 케이스
 */
export interface DomainFAQ {
  question: string;
  answer: string;
  relatedConcepts: string[];
  examples?: string[];
}

export interface DomainExample {
  scenario: string;
  solution: string;
  applicableLaws: string[];
  keyPoints: string[];
}

export const DOMAIN_FAQS: Record<string, DomainFAQ[]> = {
  도시정비: [
    {
      question: '재개발과 재건축의 차이는?',
      answer: '재개발은 기존 건물을 철거하고 새로 건설하는 사업이고, 재건축은 노후 건물을 철거하고 같은 부지에 새 건물을 건설하는 사업입니다.',
      relatedConcepts: ['재개발', '재건축', '정비구역'],
      examples: ['재개발: 주거환경개선사업', '재건축: 노후 아파트 재건축']
    },
    {
      question: '정비구역 지정 절차는?',
      answer: '시장·군수·구청장이 정비구역 지정안을 수립하고, 주민공람 및 의견청취 후 시·도지사 승인을 받아 지정합니다.',
      relatedConcepts: ['정비구역', '조합설립', '사업시행계획'],
    }
  ],
  세무: [
    {
      question: '양도소득세는 어떻게 계산하나요?',
      answer: '양도소득세 = (양도가액 - 취득가액 - 필요경비) × 세율입니다. 1세대 1주택의 경우 일정 요건을 충족하면 비과세됩니다.',
      relatedConcepts: ['양도소득세', '취득가액', '비과세'],
      examples: ['1세대 1주택 비과세 요건', '장기보유특별공제']
    },
    {
      question: '종합부동산세는 언제 납부하나요?',
      answer: '종합부동산세는 매년 6월 1일 현재 기준으로 산정하여 9월 말까지 납부합니다.',
      relatedConcepts: ['종합부동산세', '납부기한'],
    }
  ],
  법무: [
    {
      question: '부동산 등기는 왜 중요한가요?',
      answer: '부동산 등기는 소유권을 공시하는 절차로, 등기를 하지 않으면 제3자에게 대항할 수 없습니다.',
      relatedConcepts: ['등기', '소유권', '공시'],
    },
    {
      question: '전세권과 임대차의 차이는?',
      answer: '전세권은 물권으로 전세금 반환청구권이 우선변제권을 가지지만, 임대차는 채권으로 우선변제권이 제한적입니다.',
      relatedConcepts: ['전세권', '임대차', '우선변제권'],
    }
  ]
};

export const DOMAIN_EXAMPLES: Record<string, DomainExample[]> = {
  도시정비: [
    {
      scenario: '재개발 조합 설립',
      solution: '1. 정비구역 지정 2. 조합설립 추진위원회 구성 3. 조합설립 인가 신청 4. 조합설립 인가 5. 조합 운영',
      applicableLaws: ['도시 및 주거환경정비법'],
      keyPoints: ['조합원 자격', '조합설립 인가 요건', '조합 운영 규정']
    }
  ],
  세무: [
    {
      scenario: '아파트 양도 시 양도소득세 계산',
      solution: '양도가액에서 취득가액과 필요경비를 차감한 금액에 세율을 적용합니다. 1세대 1주택이고 보유기간이 2년 이상이면 비과세됩니다.',
      applicableLaws: ['소득세법'],
      keyPoints: ['1세대 1주택 비과세', '장기보유특별공제', '양도소득공제']
    }
  ],
  법무: [
    {
      scenario: '부동산 매매 계약 체결',
      solution: '1. 계약서 작성 2. 계약금 지급 3. 잔금 지급 4. 소유권 이전 등기 5. 인도',
      applicableLaws: ['민법', '부동산등기법'],
      keyPoints: ['계약서 필수사항', '등기 절차', '인도 시점']
    }
  ]
};

/**
 * 도메인별 FAQ 가져오기
 */
export function getDomainFAQs(domainKey: string): DomainFAQ[] {
  return DOMAIN_FAQS[domainKey] || [];
}

/**
 * 도메인별 예시 케이스 가져오기
 */
export function getDomainExamples(domainKey: string): DomainExample[] {
  return DOMAIN_EXAMPLES[domainKey] || [];
}

/**
 * 도메인 간 관계 그래프 데이터
 */
export interface DomainRelationGraph {
  nodes: {
    id: string;
    label: string;
    group: string;
    value: number;
  }[];
  links: {
    source: string;
    target: string;
    value: number;
    label?: string;
  }[];
}

export function getDomainRelationGraph(): DomainRelationGraph {
  const nodes = Object.keys(DOMAIN_KNOWLEDGE_BASE).map(domainKey => ({
    id: domainKey,
    label: domainKey,
    group: domainKey,
    value: DOMAIN_KNOWLEDGE_BASE[domainKey].concepts.length,
  }));

  const domainRelations: Record<string, string[]> = {
    '도시정비': ['국토부', '부동산정책', '법무'],
    '세무': ['법무', '부동산정책'],
    '법무': ['세무', '부동산중개', '대법원판례'],
    '금융': ['부동산정책', '세무'],
    '국토부': ['도시정비', '부동산정책'],
    '부동산정책': ['국토부', '세무', '금융'],
    '대법원판례': ['법무', '부동산중개'],
    '부동산중개': ['법무', '대법원판례']
  };

  const links: DomainRelationGraph['links'] = [];
  for (const [source, targets] of Object.entries(domainRelations)) {
    for (const target of targets) {
      links.push({
        source,
        target,
        value: 1,
        label: '관련',
      });
    }
  }

  return { nodes, links };
}

/**
 * 도메인별 맞춤형 프롬프트 템플릿
 */
export interface PromptTemplate {
  id: string;
  name: string;
  domain: string;
  template: string;
  variables: string[];
  description: string;
}

export const DOMAIN_PROMPT_TEMPLATES: Record<string, PromptTemplate[]> = {
  도시정비: [
    {
      id: 'redevelopment-consultation',
      name: '재개발 상담',
      domain: '도시정비',
      template: '{사용자_상황}에 대한 재개발 절차와 주의사항을 알려주세요. 특히 {관심사항}에 대해 자세히 설명해주세요.',
      variables: ['사용자_상황', '관심사항'],
      description: '재개발 관련 상담을 위한 템플릿'
    }
  ],
  세무: [
    {
      id: 'tax-calculation',
      name: '세금 계산',
      domain: '세무',
      template: '{부동산_유형}을 {보유기간} 동안 보유한 후 {양도가액}에 양도할 때 발생하는 세금을 계산해주세요.',
      variables: ['부동산_유형', '보유기간', '양도가액'],
      description: '양도소득세 계산을 위한 템플릿'
    }
  ],
  법무: [
    {
      id: 'contract-review',
      name: '계약서 검토',
      domain: '법무',
      template: '{계약_유형} 계약서를 검토하고 주요 조항과 주의사항을 알려주세요.',
      variables: ['계약_유형'],
      description: '계약서 검토를 위한 템플릿'
    }
  ]
};

/**
 * 도메인별 프롬프트 템플릿 가져오기
 */
export function getDomainPromptTemplates(domainKey: string): PromptTemplate[] {
  return DOMAIN_PROMPT_TEMPLATES[domainKey] || [];
}

/**
 * 도메인 지식 분석 및 인사이트
 */
export interface DomainInsight {
  type: 'trend' | 'warning' | 'opportunity' | 'requirement';
  title: string;
  description: string;
  relatedDomains: string[];
  priority: 'high' | 'medium' | 'low';
}

export function generateDomainInsights(selectedDomains: string[]): DomainInsight[] {
  const insights: DomainInsight[] = [];

  // 도메인 조합별 인사이트 생성
  if (selectedDomains.includes('도시정비') && selectedDomains.includes('세무')) {
    insights.push({
      type: 'warning',
      title: '재개발 시 세무 고려사항',
      description: '재개발 사업 시 양도소득세, 종합부동산세 등 세무 문제를 반드시 고려해야 합니다.',
      relatedDomains: ['도시정비', '세무'],
      priority: 'high'
    });
  }

  if (selectedDomains.includes('법무') && selectedDomains.includes('부동산중개')) {
    insights.push({
      type: 'requirement',
      title: '중개계약 시 법적 요건',
      description: '부동산 중개 시 중개대상물 확인·설명의무 등 법적 요건을 준수해야 합니다.',
      relatedDomains: ['법무', '부동산중개'],
      priority: 'high'
    });
  }

  if (selectedDomains.includes('금융') && selectedDomains.includes('부동산정책')) {
    insights.push({
      type: 'trend',
      title: '주택담보대출 규제 동향',
      description: '최근 부동산 정책 변화에 따라 주택담보대출 규제가 강화되고 있습니다.',
      relatedDomains: ['금융', '부동산정책'],
      priority: 'medium'
    });
  }

  return insights;
}

/**
 * 도메인 지식 검증 및 품질 관리
 */
export interface KnowledgeQuality {
  domain: string;
  completeness: number; // 0-100
  accuracy: number; // 0-100
  relevance: number; // 0-100
  lastUpdated: string;
  issues: string[];
}

export function validateDomainKnowledge(domainKey: string): KnowledgeQuality {
  const domain = DOMAIN_KNOWLEDGE_BASE[domainKey];
  if (!domain) {
    return {
      domain: domainKey,
      completeness: 0,
      accuracy: 100,
      relevance: 0,
      lastUpdated: new Date().toISOString(),
      issues: ['도메인을 찾을 수 없습니다']
    };
  }

  const issues: string[] = [];
  let completeness = 100;

  // 완전성 검증
  if (domain.laws.length === 0) {
    issues.push('주요 법령이 없습니다');
    completeness -= 20;
  }
  if (domain.concepts.length < 5) {
    issues.push('핵심 개념이 부족합니다');
    completeness -= 10;
  }
  if (!domain.procedures || domain.procedures.length === 0) {
    issues.push('절차 정보가 없습니다');
    completeness -= 15;
  }

  return {
    domain: domainKey,
    completeness: Math.max(0, completeness),
    accuracy: 95, // 기본값
    relevance: 90, // 기본값
    lastUpdated: new Date().toISOString(),
    issues
  };
}

/**
 * 도메인 지식 사용 통계 및 학습
 */
export interface DomainUsageStats {
  domain: string;
  usageCount: number;
  lastUsed: string;
  successRate: number;
  userFeedback: {
    positive: number;
    negative: number;
  };
}

const domainUsageStats: Map<string, DomainUsageStats> = new Map();

export function recordDomainUsage(domain: string, success: boolean): void {
  const stats = domainUsageStats.get(domain) || {
    domain,
    usageCount: 0,
    lastUsed: new Date().toISOString(),
    successRate: 0,
    userFeedback: { positive: 0, negative: 0 }
  };

  stats.usageCount++;
  stats.lastUsed = new Date().toISOString();

  if (success) {
    stats.userFeedback.positive++;
  } else {
    stats.userFeedback.negative++;
  }

  const total = stats.userFeedback.positive + stats.userFeedback.negative;
  stats.successRate = total > 0 ? (stats.userFeedback.positive / total) * 100 : 0;

  domainUsageStats.set(domain, stats);

  // 로컬 스토리지에 저장
  try {
    const stored = localStorage.getItem('domainUsageStats');
    const allStats = stored ? JSON.parse(stored) : {};
    allStats[domain] = stats;
    localStorage.setItem('domainUsageStats', JSON.stringify(allStats));
  } catch (error) {
    errorLogger.error('사용 통계 저장 실패', error instanceof Error ? error : new Error(String(error)), {
      component: 'notebookLLMService',
      action: 'saveDomainUsageStats',
      domain,
    });
  }
}

export function getDomainUsageStats(domain?: string): DomainUsageStats[] {
  if (domain) {
    const stats = domainUsageStats.get(domain);
    return stats ? [stats] : [];
  }

  return Array.from(domainUsageStats.values()).sort((a, b) => b.usageCount - a.usageCount);
}

/**
 * 도메인 지식 히스토리 관리
 */
export interface KnowledgeHistory {
  domain: string;
  timestamp: string;
  action: 'added' | 'updated' | 'removed';
  details: string;
  version: number;
}

const knowledgeHistory: KnowledgeHistory[] = [];

export function addKnowledgeHistory(domain: string, action: KnowledgeHistory['action'], details: string): void {
  const history: KnowledgeHistory = {
    domain,
    timestamp: new Date().toISOString(),
    action,
    details,
    version: knowledgeHistory.filter(h => h.domain === domain).length + 1
  };

  knowledgeHistory.push(history);

  // 최근 100개만 유지
  if (knowledgeHistory.length > 100) {
    knowledgeHistory.shift();
  }

  // 로컬 스토리지에 저장
  try {
    localStorage.setItem('knowledgeHistory', JSON.stringify(knowledgeHistory.slice(-50)));
  } catch (error) {
    errorLogger.error('히스토리 저장 실패', error instanceof Error ? error : new Error(String(error)), {
      component: 'notebookLLMService',
      action: 'addKnowledgeHistory',
    });
  }
}

export function getKnowledgeHistory(domain?: string): KnowledgeHistory[] {
  if (domain) {
    return knowledgeHistory.filter(h => h.domain === domain);
  }
  return [...knowledgeHistory].reverse();
}

/**
 * 도메인별 전문가 모드 설정
 */
export interface ExpertModeConfig {
  domain: string;
  enabled: boolean;
  depth: 'basic' | 'intermediate' | 'advanced' | 'expert';
  includeCaseStudies: boolean;
  includeCalculations: boolean;
  includeLatestPolicies: boolean;
}

const expertModeConfigs: Map<string, ExpertModeConfig> = new Map();

export function setExpertModeConfig(config: ExpertModeConfig): void {
  expertModeConfigs.set(config.domain, config);

  try {
    const stored = localStorage.getItem('expertModeConfigs');
    const configs = stored ? JSON.parse(stored) : {};
    configs[config.domain] = config;
    localStorage.setItem('expertModeConfigs', JSON.stringify(configs));
  } catch (error) {
    errorLogger.error('전문가 모드 설정 저장 실패', error instanceof Error ? error : new Error(String(error)), {
      component: 'notebookLLMService',
      action: 'saveExpertModeConfig',
      domain: config.domain,
    });
  }
}

export function getExpertModeConfig(domain: string): ExpertModeConfig | null {
  if (expertModeConfigs.has(domain)) {
    return expertModeConfigs.get(domain)!;
  }

  try {
    const stored = localStorage.getItem('expertModeConfigs');
    if (stored) {
      const configs = JSON.parse(stored);
      if (configs[domain]) {
        const config = configs[domain];
        expertModeConfigs.set(domain, config);
        return config;
      }
    }
  } catch (error) {
    errorLogger.error('전문가 모드 설정 로드 실패', error instanceof Error ? error : new Error(String(error)), {
      component: 'notebookLLMService',
      action: 'getExpertModeConfig',
      domain,
    });
  }

  return null;
}

/**
 * 전문가 모드 기반 고급 컨텍스트 생성
 */
export function buildExpertContext(
  prompt: string,
  domains: string[],
  expertConfigs: ExpertModeConfig[]
): string {
  let context = buildIntelligentContext(prompt, domains, true);

  // 전문가 모드 설정 적용
  for (const config of expertConfigs) {
    if (!config.enabled) continue;

    const domain = DOMAIN_KNOWLEDGE_BASE[config.domain];
    if (!domain) continue;

    context += `

## ${config.domain} 전문가 모드 정보
`;

    if (config.depth === 'expert' || config.depth === 'advanced') {
      // 고급 정보 포함
      if (config.includeCaseStudies) {
        const examples = getDomainExamples(config.domain);
        if (examples.length > 0) {
          context += `
### 실제 사례
`;
          for (const example of examples) {
            context += `- 시나리오: ${example.scenario}
`;
            context += `  해결방법: ${example.solution}
`;
          }
        }
      }

      if (config.includeCalculations && domain.calculations) {
        context += `
### 계산 방법
`;
        for (const calc of domain.calculations) {
          context += `- ${calc}
`;
        }
      }

      if (config.includeLatestPolicies && domain.policies) {
        context += `
### 최신 정책
`;
        for (const policy of domain.policies.slice(-5)) {
          context += `- ${policy}
`;
        }
      }
    }
  }

  return context;
}

/**
 * 도메인 지식 자동 감지 및 추천
 */
export interface DomainRecommendation {
  domain: string;
  confidence: number;
  reason: string;
  relevantConcepts: string[];
}

export function detectRelevantDomains(prompt: string): DomainRecommendation[] {
  const promptLower = prompt.toLowerCase();
  const recommendations: DomainRecommendation[] = [];

  for (const [domainKey, domain] of Object.entries(DOMAIN_KNOWLEDGE_BASE)) {
    let score = 0;
    const matchedConcepts: string[] = [];

    // 법령 키워드 매칭
    for (const law of domain.laws) {
      if (promptLower.includes(law.toLowerCase())) {
        score += 3;
        matchedConcepts.push(law);
      }
    }

    // 개념 키워드 매칭
    for (const concept of domain.concepts) {
      if (promptLower.includes(concept.toLowerCase())) {
        score += 2;
        matchedConcepts.push(concept);
      }
    }

    // 절차 키워드 매칭
    if (domain.procedures) {
      for (const procedure of domain.procedures) {
        if (promptLower.includes(procedure.toLowerCase())) {
          score += 1.5;
          matchedConcepts.push(procedure);
        }
      }
    }

    // 정책 키워드 매칭
    if (domain.policies) {
      for (const policy of domain.policies) {
        if (promptLower.includes(policy.toLowerCase())) {
          score += 1.5;
          matchedConcepts.push(policy);
        }
      }
    }

    if (score > 0) {
      const confidence = Math.min(score / 10, 1); // 0-1 사이로 정규화
      recommendations.push({
        domain: domainKey,
        confidence,
        reason: `${matchedConcepts.length}개의 관련 개념이 발견되었습니다.`,
        relevantConcepts: matchedConcepts.slice(0, 5) // 상위 5개만
      });
    }
  }

  // 신뢰도 순으로 정렬
  return recommendations.sort((a, b) => b.confidence - a.confidence);
}

/**
 * 지능형 컨텍스트 생성 (도메인 간 연관성 고려)
 */
export function buildIntelligentContext(
  prompt: string,
  selectedDomains: string[] = [],
  includeRelated: boolean = true
): string {
  // 자동 감지된 도메인
  const detectedDomains = detectRelevantDomains(prompt);
  const autoDetected = detectedDomains
    .filter(d => d.confidence > 0.3)
    .map(d => d.domain);

  // 선택된 도메인과 자동 감지된 도메인 결합
  const allDomains = [...new Set([...selectedDomains, ...autoDetected])];

  // 관련 도메인 찾기 (도메인 간 연관성)
  const relatedDomains: string[] = [];
  if (includeRelated) {
    const domainRelations: Record<string, string[]> = {
      '도시정비': ['국토부', '부동산정책', '법무'],
      '세무': ['법무', '부동산정책'],
      '법무': ['세무', '부동산중개', '대법원판례'],
      '금융': ['부동산정책', '세무'],
      '국토부': ['도시정비', '부동산정책'],
      '부동산정책': ['국토부', '세무', '금융'],
      '대법원판례': ['법무', '부동산중개'],
      '부동산중개': ['법무', '대법원판례']
    };

    for (const domain of allDomains) {
      if (domainRelations[domain]) {
        relatedDomains.push(...domainRelations[domain]);
      }
    }
  }

  // 모든 도메인 결합
  const finalDomains = [...new Set([...allDomains, ...relatedDomains])];

  // 컨텍스트 생성
  let context = '\n\n[도메인 전문 지식]\n';
  for (const domainKey of finalDomains) {
    const domain = DOMAIN_KNOWLEDGE_BASE[domainKey];
    if (!domain) continue;

    context += `\n## ${domain.domain}\n`;
    if (domain.laws.length > 0) {
      context += `### 관련 법령: ${domain.laws.slice(0, 3).join(', ')}\n`;
    }
    if (domain.concepts.length > 0) {
      context += `### 핵심 개념: ${domain.concepts.slice(0, 5).join(', ')}\n`;
    }
  }

  return context;
}

/**
 * 도메인 지식 검색
 */
// 중복된 함수 제거 - 위에 이미 정의됨
// export interface DomainSearchResult {
//   domain: string;
//   matches: {
//     type: 'law' | 'concept' | 'procedure' | 'calculation' | 'policy' | 'case';
//     content: string;
//     relevance: number;
//   }[];
//   totalMatches: number;
// }

// 중복된 함수 블록 제거됨 - 위에 이미 정의됨

export interface NotebookLLMConfig {
  /**
   * 사용할 모델 타입
   */
  modelType: 'llama3.1:8b' | 'qwen2.5:7b' | 'gemma2:9b' | 'kullm:12.8b' | 'polyglot-ko:12.8b' | 'auto';

  /**
   * 처리 모드
   */
  processingMode: 'auto' | 'local_only' | 'cloud_only' | 'hybrid';

  /**
   * 프로젝트 ID (프로젝트별 노트북인 경우)
   */
  projectId?: string;

  /**
   * 컨텍스트 메모리 크기
   */
  contextSize?: number;

  /**
   * 온도 설정 (0-2)
   */
  temperature?: number;

  /**
   * 최대 토큰 수
   */
  maxTokens?: number;
}

export interface NotebookLLMResponse {
  content: string;
  modelUsed: string;
  processingTime: number;
  confidence: number;
  tokensUsed: number;
  mode: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface NotebookLLMStatus {
  available: boolean;
  models: string[];
  currentModel?: string;
  memoryUsage?: number;
  performanceMetrics?: {
    totalRequests: number;
    localRequests: number;
    cloudRequests: number;
    averageResponseTime: number;
    successRate: number;
  };
}

export class NotebookLLMService {
  private static instance: NotebookLLMService;
  private readonly baseUrl: string;
  private readonly projectConfigs: Map<string, NotebookLLMConfig> = new Map();
  private defaultConfig: NotebookLLMConfig = {
    modelType: 'auto',
    processingMode: 'auto',
    temperature: 0.7,
    maxTokens: 2000,
    contextSize: 4096,
  };
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000;

  constructor() {
    // 환경 변수 우선, 없으면 메인 백엔드(8000) 사용 (프로젝트 노트북 LLM은 동일 서버)
    this.baseUrl = process.env.REACT_APP_NOTEBOOK_LLM_URL
      || process.env.REACT_APP_API_URL
      || 'http://localhost:8000';
  }

  public static getInstance(): NotebookLLMService {
    if (!NotebookLLMService.instance) {
      NotebookLLMService.instance = new NotebookLLMService();
    }
    return NotebookLLMService.instance;
  }

  /**
   * API 호출 재시도 헬퍼
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries: number = this.maxRetries
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);

        // 성공적인 응답이거나 재시도 불가능한 오류인 경우
        if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 408)) {
          return response;
        }

        // 재시도 가능한 오류 (5xx, 408 timeout)
        if (attempt < maxRetries) {
          const delay = this.retryDelay * attempt;
          errorLogger.info(`API 호출 실패 (시도 ${attempt}/${maxRetries}), ${delay}ms 후 재시도...`, {
            component: 'notebookLLMService',
            action: 'fetchWithRetry',
            attempt,
            maxRetries,
            delay,
          });
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // 네트워크 오류인 경우 재시도
        if (attempt < maxRetries && (lastError.message.includes('Failed to fetch') || lastError.message.includes('NetworkError'))) {
          const delay = this.retryDelay * attempt;
          errorLogger.info(`[NotebookLLM] 네트워크 오류 (시도 ${attempt}/${maxRetries}), ${delay}ms 후 재시도...`, {
            component: 'notebookLLMService',
            action: 'fetchWithRetry',
            attempt,
            maxRetries,
            delay,
            errorType: 'network',
          });
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        throw lastError;
      }
    }

    throw lastError || new Error('API 호출 실패');
  }

  /**
   * 기본 노트북 LLM 상태 확인
   */
  async getDefaultNotebookStatus(): Promise<NotebookLLMStatus> {
    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/api/v7/notebook-llm/status`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        2 // 상태 조회는 재시도 횟수 적게
      );

      if (!response.ok) {
        throw new Error(`상태 조회 실패: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      errorLogger.error('노트북 LLM 상태 조회 실패', errorObj, {
        component: 'notebookLLMService',
        action: 'getDefaultNotebookStatus',
      });

      // 에러 리포팅 서비스에 보고
      await errorReportingService.reportError(errorObj, {
        componentStack: 'NotebookLLMService.getStatus',
        severity: 'medium',
        additionalContext: { action: 'status_check' }
      });

      return {
        available: false,
        models: [],
      };
    }
  }

  /**
   * 프로젝트별 노트북 LLM 상태 확인 (백엔드 /api/projects/{id}/notebook-llm/status)
   */
  async getProjectNotebookStatus(projectId: string): Promise<NotebookLLMStatus> {
    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/api/projects/${projectId}/notebook-llm/status`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        2 // 상태 조회는 재시도 횟수 적게
      );

      if (!response.ok) {
        throw new Error(`프로젝트 노트북 상태 조회 실패: ${response.statusText}`);
      }

      const json = await response.json();
      return (json.data != null ? json.data : json) as NotebookLLMStatus;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      errorLogger.error('프로젝트 노트북 상태 조회 실패', errorObj, {
        component: 'notebookLLMService',
        action: 'getProjectNotebookStatus',
        projectId,
      });

      // 에러 리포팅 서비스에 보고
      await errorReportingService.reportError(errorObj, {
        componentStack: 'NotebookLLMService.getProjectStatus',
        severity: 'medium',
        additionalContext: { action: 'project_status_check', projectId }
      });

      return {
        available: false,
        models: [],
      };
    }
  }

  /**
   * 기본 노트북 LLM으로 응답 생성
   */
  async generateWithDefaultNotebook(
    prompt: string,
    context?: Record<string, unknown>,
    config?: Partial<NotebookLLMConfig>,
    domains?: string[]
  ): Promise<NotebookLLMResponse> {
    // 도메인 지식 컨텍스트 추가
    const domainContext = buildIntelligentContext(prompt, domains || [], true);
    const enhancedPrompt = prompt + domainContext;
    const finalConfig = { ...this.defaultConfig, ...config };

    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/api/v7/notebook-llm/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: enhancedPrompt,
            context,
            config: finalConfig,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `응답 생성 실패: ${response.statusText}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      errorLogger.error('기본 노트북 LLM 응답 생성 실패', errorObj, {
        component: 'notebookLLMService',
        action: 'generateWithDefaultNotebook',
      });

      // 에러 리포팅 서비스에 보고
      await errorReportingService.reportError(errorObj, {
        componentStack: 'NotebookLLMService.generateResponse',
        severity: 'high',
        additionalContext: { action: 'generate_response', config: finalConfig }
      });
      throw error;
    }
  }

  /**
   * 프로젝트별 노트북 LLM으로 응답 생성
   */
  async generateWithProjectNotebook(
    projectId: string,
    prompt: string,
    context?: Record<string, unknown>,
    config?: Partial<NotebookLLMConfig>,
    domains?: string[]
  ): Promise<NotebookLLMResponse> {
    // 도메인 지식 컨텍스트 추가
    const domainContext = buildIntelligentContext(prompt, domains || [], true);
    const enhancedPrompt = prompt + domainContext;
    const projectConfig = this.projectConfigs.get(projectId) || this.defaultConfig;
    const finalConfig = { ...projectConfig, ...config, projectId };

    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/api/projects/${projectId}/notebook-llm/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: enhancedPrompt,
            context,
            config: finalConfig,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `프로젝트 노트북 응답 생성 실패: ${response.statusText}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = (errorData.detail?.message ?? errorData.detail?.error ?? errorData.message ?? errorData.error) || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const json = await response.json();
      return (json.data != null ? json.data : json) as NotebookLLMResponse;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      errorLogger.error('프로젝트 노트북 LLM 응답 생성 실패', errorObj, {
        component: 'notebookLLMService',
        action: 'generateWithProjectNotebook',
        projectId,
      });

      // 에러 리포팅 서비스에 보고
      await errorReportingService.reportError(errorObj, {
        componentStack: 'NotebookLLMService.generateProjectResponse',
        severity: 'high',
        additionalContext: { action: 'generate_project_response', projectId, config: finalConfig }
      });
      throw error;
    }
  }

  /**
   * 프로젝트별 노트북 LLM 설정 저장
   */
  setProjectNotebookConfig(projectId: string, config: NotebookLLMConfig): void {
    this.projectConfigs.set(projectId, { ...config, projectId });

    // 로컬 스토리지에 저장
    try {
      const stored = localStorage.getItem('notebookLLMConfigs');
      const configs = stored ? JSON.parse(stored) : {};
      configs[projectId] = config;
      localStorage.setItem('notebookLLMConfigs', JSON.stringify(configs));
    } catch (error) {
      errorLogger.error('설정 저장 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'notebookLLMService',
        action: 'setProjectNotebookConfig',
        projectId,
      });
    }
  }

  /**
   * 프로젝트별 노트북 LLM 설정 로드
   */
  getProjectNotebookConfig(projectId: string): NotebookLLMConfig | null {
    // 메모리에서 먼저 확인
    if (this.projectConfigs.has(projectId)) {
      return this.projectConfigs.get(projectId)!;
    }

    // 로컬 스토리지에서 로드
    try {
      const stored = localStorage.getItem('notebookLLMConfigs');
      if (stored) {
        const configs = JSON.parse(stored);
        if (configs[projectId]) {
          const config = configs[projectId];
          this.projectConfigs.set(projectId, config);
          return config;
        }
      }
    } catch (error) {
      errorLogger.error('설정 로드 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'notebookLLMService',
        action: 'getProjectNotebookConfig',
        projectId,
      });
    }

    return null;
  }

  /**
   * 기본 설정 업데이트
   */
  setDefaultConfig(config: Partial<NotebookLLMConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };

    try {
      localStorage.setItem('defaultNotebookLLMConfig', JSON.stringify(this.defaultConfig));
    } catch (error) {
      errorLogger.error('기본 설정 저장 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'notebookLLMService',
        action: 'setDefaultConfig',
      });
    }
  }

  /**
   * 기본 설정 로드
   */
  loadDefaultConfig(): NotebookLLMConfig {
    try {
      const stored = localStorage.getItem('defaultNotebookLLMConfig');
      if (stored) {
        this.defaultConfig = { ...this.defaultConfig, ...JSON.parse(stored) };
      }
    } catch (error) {
      errorLogger.error('기본 설정 로드 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'notebookLLMService',
        action: 'loadDefaultConfig',
      });
    }

    return this.defaultConfig;
  }
}

export const notebookLLMService = NotebookLLMService.getInstance();
export default notebookLLMService;

