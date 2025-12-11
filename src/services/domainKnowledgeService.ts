/**
 * 도메인별 지식 베이스 서비스 (상세 버전)
 * 부동산 관련 전문 지식 제공
 */

import { errorLogger } from '../utils/errorLogger';

export type DomainType = 
  | 'urban_planning'      // 도시정비
  | 'tax'                  // 세무
  | 'legal'                // 법무
  | 'finance'              // 금융
  | 'molit'                // 국토부
  | 'real_estate_policy'   // 부동산정책
  | 'supreme_court'        // 대법원 판례
  | 'real_estate_brokerage'; // 부동산중개

export interface DomainKnowledge {
  domain: DomainType;
  name: string;
  description: string;
  keywords: string[];
  knowledgeBase: string[];
  detailedKnowledge: {
    concepts: Array<{ term: string; definition: string; details: string }>;
    procedures: Array<{ title: string; steps: string[]; notes: string[] }>;
    regulations: Array<{ title: string; content: string; effectiveDate?: string }>;
    examples: Array<{ scenario: string; solution: string; reference?: string }>;
  };
  contextPrompts: string[];
  relatedLaws: Array<{ name: string; articles: string[] }>;
  recentUpdates?: Array<{ date: string; content: string; impact: string }>;
  caseStudies?: Array<{ title: string; description: string; outcome: string }>;
}

export interface DomainKnowledgeConfig {
  enabledDomains: DomainType[];
  priority: DomainType[];
  contextWeight: number; // 0-1, 컨텍스트에 얼마나 가중치를 둘지
}

class DomainKnowledgeService {
  private static instance: DomainKnowledgeService;
  private knowledgeBases: Map<DomainType, DomainKnowledge> = new Map();
  private config: DomainKnowledgeConfig = {
    enabledDomains: [],
    priority: [],
    contextWeight: 0.3,
  };

  private constructor() {
    this.initializeKnowledgeBases();
  }

  public static getInstance(): DomainKnowledgeService {
    if (!DomainKnowledgeService.instance) {
      DomainKnowledgeService.instance = new DomainKnowledgeService();
    }
    return DomainKnowledgeService.instance;
  }

  /**
   * 도메인별 지식 베이스 초기화 (상세 버전)
   */
  private initializeKnowledgeBases(): void {
    // 도시정비
    this.knowledgeBases.set('urban_planning', {
      domain: 'urban_planning',
      name: '도시정비',
      description: '도시정비사업, 재개발, 재건축, 도시계획 등에 관한 전문 지식',
      keywords: ['도시정비', '재개발', '재건축', '도시계획', '정비사업', '구역지정', '조합설립', '관리처분', '시공사', '분양', '이주'],
      knowledgeBase: [
        '도시정비법의 주요 내용과 절차',
        '재개발사업과 재건축사업의 차이점',
        '정비구역 지정 요건 및 절차',
        '조합설립 인가 절차 및 요건',
        '관리처분계획 수립 및 인가',
        '시공사 선정 및 계약',
        '분양 및 이주대책',
        '정비사업의 이해관계자 권리와 의무',
      ],
      detailedKnowledge: {
        concepts: [
          {
            term: '정비구역',
            definition: '도시정비법에 따라 정비가 필요한 지역으로 지정된 구역',
            details: '정비구역은 노후·불량건축물이 밀집한 지역, 도시기능 회복이 필요한 지역, 재해위험 지역 등으로 지정됩니다. 지정 요건은 건축물의 노후도, 인구밀도, 도로폭, 공공시설 부족 등을 종합적으로 고려합니다.'
          },
          {
            term: '재개발사업',
            definition: '기존 건축물을 철거하고 새로운 건축물을 건설하는 사업',
            details: '재개발사업은 주로 상가·주거복합지역에서 진행되며, 기존 건축물을 완전히 철거한 후 새로운 건축물을 건설합니다. 사업 시행자는 조합 또는 시공사가 될 수 있으며, 사업 완료 후 기존 소유자에게 분양합니다.'
          },
          {
            term: '재건축사업',
            definition: '기존 아파트 등을 철거하고 새로운 아파트를 건설하는 사업',
            details: '재건축사업은 주로 아파트 단지에서 진행되며, 기존 주택을 철거하고 새로운 주택을 건설합니다. 재건축 추진위원회 설립, 조합 설립 인가, 사업시행계획 수립, 관리처분계획 수립 등의 절차를 거칩니다.'
          },
          {
            term: '관리처분계획',
            definition: '정비사업에서 기존 소유자에게 새로운 건축물을 분양하는 계획',
            details: '관리처분계획은 기존 소유자의 권리를 새로운 건축물로 전환하는 계획으로, 분양가격, 분양면적, 분양순서 등을 정합니다. 조합원 총회의 의결을 거쳐 시장·군수·구청장의 인가를 받아야 합니다.'
          },
          {
            term: '조합설립 인가',
            definition: '정비사업을 시행하기 위한 조합의 설립을 공공기관이 인가하는 것',
            details: '조합설립 인가는 조합원 자격을 가진 자 중 조합원 총수의 3분의 2 이상이 동의하고, 조합원 총수의 과반수가 조합에 가입한 경우에 가능합니다. 시장·군수·구청장이 조합의 정관, 사업시행계획 등을 검토하여 인가합니다.'
          }
        ],
        procedures: [
          {
            title: '정비구역 지정 절차',
            steps: [
              '1. 정비구역 지정 제안 (시민, 조합, 지자체)',
              '2. 정비구역 지정 검토 (지자체)',
              '3. 주민 의견 청취 및 공청회 개최',
              '4. 정비구역 지정 고시',
              '5. 정비계획 수립 및 고시'
            ],
            notes: [
              '정비구역 지정은 도시계획위원회의 심의를 거쳐야 함',
              '주민의 의견을 충분히 반영해야 함',
              '환경영향평가가 필요한 경우 실시해야 함'
            ]
          },
          {
            title: '조합설립 인가 절차',
            steps: [
              '1. 정비구역 내 토지·건축물 소유자 중 조합원 자격 확인',
              '2. 조합설립 발기인 모집 (조합원 총수의 10분의 1 이상)',
              '3. 조합설립 발기인 총회 개최',
              '4. 조합 정관 작성 및 조합원 모집',
              '5. 조합원 총수의 과반수 가입 달성',
              '6. 조합설립 인가 신청',
              '7. 시장·군수·구청장의 조합설립 인가'
            ],
            notes: [
              '조합원 자격은 정비구역 내 토지·건축물 소유자',
              '조합원 총수의 3분의 2 이상 동의 필요',
              '조합 정관에는 사업시행계획의 주요 내용 포함'
            ]
          },
          {
            title: '관리처분계획 수립 절차',
            steps: [
              '1. 분양대상자 및 분양면적 산정',
              '2. 분양가격 산정 기준 수립',
              '3. 분양순서 결정 기준 수립',
              '4. 관리처분계획안 작성',
              '5. 조합원 총회 의결 (조합원 총수의 3분의 2 이상 동의)',
              '6. 관리처분계획 인가 신청',
              '7. 시장·군수·구청장의 관리처분계획 인가'
            ],
            notes: [
              '분양가격은 기존 권리비율과 건설비용을 고려하여 산정',
              '분양순서는 기존 소유 순서, 가입 순서 등을 고려',
              '이의신청 기간을 두어 조합원의 권리를 보호'
            ]
          }
        ],
        regulations: [
          {
            title: '정비구역 지정 요건',
            content: '정비구역은 다음 요건을 모두 충족하는 지역으로 지정할 수 있습니다: 1) 노후·불량건축물이 전체 건축물의 50% 이상인 지역, 2) 도로폭이 4m 미만인 구간이 전체의 50% 이상인 지역, 3) 공공시설이 부족한 지역, 4) 재해위험이 있는 지역'
          },
          {
            title: '조합설립 인가 요건',
            content: '조합설립 인가는 다음 요건을 충족해야 합니다: 1) 조합원 자격을 가진 자 중 조합원 총수의 3분의 2 이상이 조합설립에 동의, 2) 조합원 총수의 과반수가 조합에 가입, 3) 조합 정관이 법령에 위배되지 않음, 4) 사업시행계획이 타당함'
          },
          {
            title: '분양가격 산정 기준',
            content: '분양가격은 다음을 고려하여 산정합니다: 1) 기존 토지·건축물의 가격, 2) 건설비용, 3) 부대비용, 4) 조합 운영비. 분양가격은 공시지가와 시세를 종합적으로 고려하여 산정하며, 조합원의 부담이 과도하지 않도록 해야 합니다.'
          }
        ],
        examples: [
          {
            scenario: '정비구역 내 아파트 재건축 사업',
            solution: '재건축사업의 경우 재건축 추진위원회를 먼저 설립하고, 이후 조합을 설립합니다. 조합원은 기존 아파트 소유자이며, 사업 완료 후 새로운 아파트를 분양받습니다. 분양가격은 기존 아파트 가격과 건설비용을 고려하여 산정합니다.',
            reference: '도시정비법 제2조, 제9조'
          },
          {
            scenario: '상가·주거복합지역 재개발 사업',
            solution: '재개발사업의 경우 조합을 설립하여 사업을 시행합니다. 기존 상가·주거 건축물을 철거하고 새로운 건축물을 건설하며, 기존 소유자에게 분양합니다. 상가와 주거 부분의 분양 비율은 기존 비율을 고려하여 결정합니다.',
            reference: '도시정비법 제2조 제2호'
          }
        ]
      },
      contextPrompts: [
        '도시정비법에 따라',
        '재개발사업의 경우',
        '정비구역 지정 시',
        '조합설립 인가를 받기 위해서는',
        '관리처분계획 수립 시 고려사항',
        '재건축사업 추진 시',
        '분양가격 산정 시',
        '이주대책 수립 시'
      ],
      relatedLaws: [
        {
          name: '도시정비법',
          articles: [
            '제2조 (정의)',
            '제9조 (정비구역의 지정)',
            '제16조 (조합의 설립)',
            '제25조 (사업시행계획)',
            '제44조 (관리처분계획)',
            '제49조 (분양)',
            '제51조 (이주대책)'
          ]
        },
        {
          name: '도시정비법 시행령',
          articles: [
            '제3조 (정비구역 지정 요건)',
            '제8조 (조합설립 인가 요건)',
            '제15조 (사업시행계획 수립 기준)',
            '제22조 (관리처분계획 수립 기준)'
          ]
        },
        {
          name: '국토의 계획 및 이용에 관한 법률',
          articles: [
            '제30조 (도시계획)',
            '제36조 (용도지역)',
            '제51조 (도시계획시설)'
          ]
        }
      ],
      recentUpdates: [
        {
          date: '2024.01',
          content: '정비구역 지정 요건 완화',
          impact: '정비구역 지정이 더 용이해져 재개발·재건축 사업이 활성화될 것으로 예상됩니다.'
        },
        {
          date: '2024.03',
          content: '분양가격 산정 기준 개선',
          impact: '분양가격 산정이 더 공정하고 투명해져 조합원의 부담이 완화될 수 있습니다.'
        }
      ],
      caseStudies: [
        {
          title: '서울 강남구 재개발 사업',
          description: '상가·주거복합지역 재개발 사업으로 기존 건축물을 철거하고 새로운 복합건축물을 건설',
          outcome: '사업 완료 후 기존 소유자에게 분양 완료, 지역 활성화에 기여'
        }
      ]
    });

    // 세무 (더 상세하게)
    this.knowledgeBases.set('tax', {
      domain: 'tax',
      name: '세무',
      description: '부동산 관련 세무, 양도소득세, 종부세, 취득세 등',
      keywords: ['양도소득세', '종부세', '취득세', '등록세', '재산세', '세무', '세금', '공제', '비과세', '감면', 'LTV', 'DTI'],
      knowledgeBase: [
        '양도소득세 계산 방법 및 공제 항목',
        '종합부동산세(종부세) 산정 기준',
        '취득세 및 등록세 계산',
        '재산세 과세 기준',
        '부동산 양도 시 세금 절감 방법',
        '장기보유특별공제 및 주택양도소득세 공제',
        '상속세 및 증여세',
        '부동산 투자 관련 세무 전략',
      ],
      detailedKnowledge: {
        concepts: [
          {
            term: '양도소득세',
            definition: '부동산을 양도할 때 발생하는 소득에 대해 부과되는 세금',
            details: '양도소득세는 양도가액에서 취득가액과 필요경비를 차감한 양도소득금액에 대해 부과됩니다. 주택의 경우 장기보유특별공제, 주택양도소득세 공제 등 다양한 공제가 적용됩니다. 보유기간에 따라 세율이 달라지며, 1세대 1주택 비과세 요건도 있습니다.'
          },
          {
            term: '종합부동산세(종부세)',
            definition: '보유한 부동산의 가액을 합산하여 과세하는 세금',
            details: '종부세는 주택과 토지를 합산하여 과세하며, 공시가격 기준으로 산정합니다. 1세대 1주택의 경우 일정 금액까지 비과세되며, 초과분에 대해서는 누진세율이 적용됩니다. 다주택자에 대해서는 중과세가 적용됩니다.'
          },
          {
            term: '취득세',
            definition: '부동산을 취득할 때 부과되는 지방세',
            details: '취득세는 부동산 취득 시 부과되며, 취득가액에 세율을 곱하여 계산합니다. 주택의 경우 취득세율이 낮고, 비주거용 부동산의 경우 세율이 높습니다. 최초 취득, 상속, 증여 등 취득 형태에 따라 세율이 달라질 수 있습니다.'
          },
          {
            term: '장기보유특별공제',
            definition: '부동산을 장기간 보유한 경우 양도소득세에서 공제되는 금액',
            details: '주택을 2년 이상 보유한 경우 양도소득금액에서 일정 금액을 공제받을 수 있습니다. 보유기간이 길수록 공제율이 높아지며, 최대 80%까지 공제받을 수 있습니다. 다만, 1세대 1주택 요건을 충족해야 합니다.'
          },
          {
            term: '1세대 1주택 비과세',
            definition: '1세대가 1주택을 보유하고 양도할 때 양도소득세가 비과세되는 제도',
            details: '1세대 1주택 비과세는 다음 요건을 모두 충족해야 합니다: 1) 본인과 배우자 및 미성년 자녀가 1주택만 보유, 2) 보유기간 2년 이상, 3) 공시가격 12억원 이하(서울 등 과밀지역은 9억원 이하). 이 요건을 충족하면 양도소득세가 비과세됩니다.'
          }
        ],
        procedures: [
          {
            title: '양도소득세 신고 절차',
            steps: [
              '1. 양도소득금액 계산 (양도가액 - 취득가액 - 필요경비)',
              '2. 공제 항목 적용 (장기보유특별공제, 주택양도소득세 공제 등)',
              '3. 과세표준 산정',
              '4. 세액 계산 (과세표준 × 세율)',
              '5. 양도소득세 신고서 작성',
              '6. 세액 납부 (신고 기한 내)'
            ],
            notes: [
              '양도일로부터 2개월 이내에 신고·납부해야 함',
              '1세대 1주택 비과세 요건 충족 시 신고 불필요',
              '공제 항목을 정확히 적용하여 세액을 절감할 수 있음'
            ]
          },
          {
            title: '종부세 신고 절차',
            steps: [
              '1. 보유 부동산 현황 파악',
              '2. 공시가격 기준 보유세액 산정',
              '3. 비과세 한도 확인 (1세대 1주택)',
              '4. 종부세 신고서 작성',
              '5. 세액 납부 (신고 기한 내)'
            ],
            notes: [
              '매년 6월 1일 현재 보유 부동산 기준으로 과세',
              '1세대 1주택의 경우 공시가격 12억원(서울 등 과밀지역 9억원)까지 비과세',
              '다주택자에 대해서는 중과세 적용'
            ]
          }
        ],
        regulations: [
          {
            title: '양도소득세 세율',
            content: '양도소득세 세율은 보유기간에 따라 달라집니다: 1년 이하 70%, 1년 초과 2년 이하 60%, 2년 초과 50%. 다만, 1세대 1주택 비과세 요건을 충족하면 세율이 적용되지 않습니다.'
          },
          {
            title: '장기보유특별공제율',
            content: '장기보유특별공제율은 보유기간에 따라 달라집니다: 2년 이상 4년 미만 4%, 4년 이상 6년 미만 8%, 6년 이상 8년 미만 12%, 8년 이상 10년 미만 16%, 10년 이상 20%. 최대 80%까지 공제받을 수 있습니다.'
          },
          {
            title: '취득세 세율',
            content: '취득세 세율은 부동산 종류에 따라 달라집니다: 주택 1~4%, 비주거용 부동산 4~8%. 다만, 최초 취득, 상속, 증여 등 취득 형태에 따라 세율이 달라질 수 있습니다.'
          }
        ],
        examples: [
          {
            scenario: '1세대 1주택 양도 (보유기간 5년, 공시가격 8억원)',
            solution: '1세대 1주택 비과세 요건을 충족하므로 양도소득세가 비과세됩니다. 다만, 공시가격이 12억원 이하이고 보유기간이 2년 이상이므로 비과세 요건을 충족합니다.',
            reference: '소득세법 제88조'
          },
          {
            scenario: '2주택 양도 (보유기간 3년)',
            solution: '2주택 양도의 경우 양도소득세가 과세됩니다. 양도소득금액에서 장기보유특별공제(8%)를 적용하고, 나머지 금액에 세율(50%)을 적용하여 세액을 계산합니다.',
            reference: '소득세법 제88조, 제89조'
          }
        ]
      },
      contextPrompts: [
        '양도소득세를 계산할 때',
        '종부세 과세 기준은',
        '취득세 계산 시',
        '장기보유특별공제를 받으려면',
        '부동산 양도 시 세금을 절감하려면',
        '1세대 1주택 비과세 요건은',
        '다주택자 세금은',
        '상속·증여 시 세금은'
      ],
      relatedLaws: [
        {
          name: '소득세법',
          articles: [
            '제88조 (양도소득세 과세표준)',
            '제89조 (양도소득세 세율)',
            '제90조 (장기보유특별공제)',
            '제91조 (주택양도소득세 공제)',
            '제92조 (1세대 1주택 비과세)'
          ]
        },
        {
          name: '종합부동산세법',
          articles: [
            '제3조 (과세대상)',
            '제4조 (과세표준)',
            '제5조 (세율)',
            '제6조 (비과세 및 감면)'
          ]
        },
        {
          name: '지방세법',
          articles: [
            '제111조 (취득세 과세대상)',
            '제112조 (취득세 세율)',
            '제125조 (등록세 과세대상)',
            '제126조 (등록세 세율)'
          ]
        }
      ],
      recentUpdates: [
        {
          date: '2024.01',
          content: '종부세 과세 기준 상향',
          impact: '종부세 과세 기준이 상향되어 더 많은 주택이 과세 대상에서 제외될 수 있습니다.'
        },
        {
          date: '2024.03',
          content: '양도소득세 공제 확대',
          impact: '양도소득세 공제가 확대되어 세 부담이 완화될 수 있습니다.'
        }
      ]
    });

    // 법무 (더 상세하게)
    this.knowledgeBases.set('legal', {
      domain: 'legal',
      name: '법무',
      description: '부동산 관련 법률, 계약, 분쟁 해결 등',
      keywords: ['계약', '법률', '분쟁', '소송', '손해배상', '계약해제', '하자', '담보책임', '등기', '소유권', '전세권', '근저당권'],
      knowledgeBase: [
        '부동산 매매계약서 작성 및 검토',
        '중도금 및 잔금 지급 시 주의사항',
        '계약 해제 및 해지 사유',
        '하자담보책임 및 손해배상',
        '부동산 분쟁 해결 방법',
        '소유권 이전 등기 절차',
        '전세권 및 근저당권',
        '임대차 보호법',
      ],
      detailedKnowledge: {
        concepts: [
          {
            term: '부동산 매매계약',
            definition: '부동산의 소유권을 이전하기 위해 체결하는 계약',
            details: '부동산 매매계약은 서면으로 작성해야 하며, 매도인과 매수인의 인적사항, 부동산의 표시, 매매가격, 계약금·중도금·잔금의 지급 시기와 방법, 소유권 이전 등기 시기 등을 명확히 기재해야 합니다. 계약서에는 특약사항도 포함할 수 있으며, 이는 계약의 중요한 부분입니다.'
          },
          {
            term: '하자담보책임',
            definition: '매도인이 매수인에게 부동산의 하자에 대해 책임을 지는 것',
            details: '하자담보책임은 매도인이 매수인에게 부동산의 하자를 알리지 않았거나, 알 수 없는 하자가 있는 경우 발생합니다. 하자가 발견되면 매수인은 계약 해제, 손해배상 청구, 대금 감액 청구 등을 할 수 있습니다. 하자담보책임의 시효는 하자를 안 날로부터 1년, 계약일로부터 10년입니다.'
          },
          {
            term: '계약 해제',
            definition: '이미 체결한 계약을 소급하여 무효화하는 것',
            details: '계약 해제는 법정 해제사유(하자담보책임, 채무불이행 등)가 있는 경우 또는 당사자 간 합의로 할 수 있습니다. 계약 해제 시 각 당사자는 원상회복의무를 지며, 계약금은 해제 사유에 따라 반환 또는 배상됩니다. 계약 해제는 상대방에게 의사표시를 하여야 효력이 발생합니다.'
          },
          {
            term: '소유권 이전 등기',
            definition: '부동산의 소유권을 매수인 명의로 이전하는 등기',
            details: '소유권 이전 등기는 매매계약에 따라 매도인과 매수인이 함께 등기소에 가서 신청합니다. 등기 신청 시에는 매매계약서, 등기원인증명서, 등기필증, 인감증명서 등이 필요합니다. 등기가 완료되면 매수인이 소유권을 취득하며, 이전 등기 전까지는 매도인이 소유권을 보유합니다.'
          },
          {
            term: '전세권',
            definition: '부동산에 대하여 전세금을 지급하고 그 부동산을 사용·수익할 수 있는 권리',
            details: '전세권은 전세금을 지급하고 부동산을 사용·수익할 수 있는 물권입니다. 전세권은 등기를 하여야 효력이 발생하며, 전세권 설정 등기를 하면 제3자에게 대항할 수 있습니다. 전세권의 존속기간은 최대 20년이며, 기간이 만료되면 전세금을 반환받고 부동산을 반환해야 합니다.'
          }
        ],
        procedures: [
          {
            title: '부동산 매매계약 체결 절차',
            steps: [
              '1. 부동산 현황 확인 (등기부등본, 건축물대장 등)',
              '2. 권리관계 확인 (근저당권, 전세권, 가등기 등)',
              '3. 매매계약서 작성 (서면으로 작성)',
              '4. 계약금 지급 및 계약금 영수증 교부',
              '5. 중도금 지급 (계약서에 명시된 시기)',
              '6. 소유권 이전 등기 신청',
              '7. 잔금 지급 및 부동산 인도'
            ],
            notes: [
              '계약서는 반드시 서면으로 작성해야 함',
              '권리관계를 정확히 확인해야 함',
              '특약사항을 명확히 기재해야 함',
              '등기 전까지는 매도인이 소유권 보유'
            ]
          },
          {
            title: '하자담보책임 청구 절차',
            steps: [
              '1. 하자 발견 및 매도인에게 통지',
              '2. 하자 내용 및 증거 자료 수집',
              '3. 하자담보책임 청구 방법 결정 (해제, 손해배상, 감액)',
              '4. 매도인에게 청구 의사표시',
              '5. 협의 또는 소송 진행'
            ],
            notes: [
              '하자를 안 날로부터 1년 이내에 청구해야 함',
              '하자 내용을 명확히 증명해야 함',
              '계약 해제 시 원상회복의무 발생',
              '손해배상 청구 시 손해액을 증명해야 함'
            ]
          }
        ],
        regulations: [
          {
            title: '계약 해제 사유',
            content: '계약 해제는 다음 사유로 할 수 있습니다: 1) 채무불이행 (이행지체, 이행불능), 2) 하자담보책임, 3) 착오·사기·강박, 4) 당사자 간 합의. 계약 해제 시 각 당사자는 원상회복의무를 지며, 손해가 있으면 배상해야 합니다.'
          },
          {
            title: '하자담보책임 시효',
            content: '하자담보책임의 시효는 하자를 안 날로부터 1년, 계약일로부터 10년입니다. 하자를 발견하면 즉시 매도인에게 통지하고, 시효 내에 청구해야 합니다.'
          }
        ],
        examples: [
          {
            scenario: '부동산 매매 후 하자 발견 (누수)',
            solution: '하자를 발견하면 매도인에게 즉시 통지하고, 하자담보책임을 청구할 수 있습니다. 계약 해제, 손해배상 청구, 대금 감액 청구 중 선택할 수 있으며, 하자를 안 날로부터 1년 이내에 청구해야 합니다.',
            reference: '민법 제580조, 제581조'
          },
          {
            scenario: '중도금 미지급으로 인한 계약 해제',
            solution: '중도금을 지급하지 않으면 이행지체가 되며, 상당한 기간을 정하여 최고한 후에도 이행하지 않으면 계약을 해제할 수 있습니다. 계약 해제 시 계약금은 배상금으로 되고, 추가 손해가 있으면 배상해야 합니다.',
            reference: '민법 제544조, 제545조'
          }
        ]
      },
      contextPrompts: [
        '부동산 매매계약 시',
        '계약 해제를 하려면',
        '하자담보책임이 발생하는 경우',
        '소유권 이전 등기를 하려면',
        '부동산 분쟁이 발생했을 때',
        '전세권 설정 시',
        '근저당권 설정 시',
        '임대차 계약 시'
      ],
      relatedLaws: [
        {
          name: '민법',
          articles: [
            '제544조 (계약 해제)',
            '제545조 (이행지체와 계약 해제)',
            '제580조 (하자담보책임)',
            '제581조 (하자담보책임의 시효)',
            '제303조 (전세권)',
            '제357조 (근저당권)'
          ]
        },
        {
          name: '부동산등기법',
          articles: [
            '제3조 (등기의 효력)',
            '제52조 (소유권 이전 등기)',
            '제134조 (전세권 설정 등기)',
            '제140조 (근저당권 설정 등기)'
          ]
        },
        {
          name: '임대차보호법',
          articles: [
            '제3조 (임대차 기간)',
            '제4조 (임대차 보증금)',
            '제6조 (임대차의 존속)'
          ]
        }
      ]
    });

    // 금융 (더 상세하게)
    this.knowledgeBases.set('finance', {
      domain: 'finance',
      name: '금융',
      description: '부동산 금융, 대출, 담보, 투자 등',
      keywords: ['대출', '담보', '금융', '은행', '전세자금', '주택담보대출', 'LTV', 'DTI', 'DSR', '금리', '변동금리', '고정금리'],
      knowledgeBase: [
        '주택담보대출(LTV, DTI) 규제',
        '전세자금 대출 조건 및 절차',
        '부동산 투자 자금 조달 방법',
        '담보 평가 및 대출 한도',
        '금리 변동에 따른 대출 전략',
        '부동산 펀드 및 REITs',
        '부동산 개발 자금 조달',
        '부동산 금융 리스크 관리',
      ],
      detailedKnowledge: {
        concepts: [
          {
            term: 'LTV (Loan to Value)',
            definition: '대출금액을 담보 부동산 가액으로 나눈 비율',
            details: 'LTV는 대출금액을 담보 부동산 가액으로 나눈 비율로, 대출 한도를 결정하는 중요한 지표입니다. LTV 규제는 지역과 주택 유형에 따라 달라지며, 일반적으로 서울 등 과밀지역은 40%, 기타 지역은 60~70%입니다. LTV가 높을수록 대출 가능 금액이 많아지지만, 리스크도 높아집니다.'
          },
          {
            term: 'DTI (Debt to Income)',
            definition: '연간 부채 상환액을 연소득으로 나눈 비율',
            details: 'DTI는 연간 부채 상환액을 연소득으로 나눈 비율로, 대출자의 상환 능력을 평가하는 지표입니다. DTI 규제는 일반적으로 40%를 초과할 수 없으며, 이는 대출자의 상환 능력을 보호하기 위한 것입니다. DTI가 높을수록 대출 승인이 어려워집니다.'
          },
          {
            term: 'DSR (Debt Service Ratio)',
            definition: '연간 부채 상환액을 연소득으로 나눈 비율 (DTI와 유사)',
            details: 'DSR은 연간 부채 상환액을 연소득으로 나눈 비율로, DTI와 유사한 개념입니다. DSR 규제는 일반적으로 40%를 초과할 수 없으며, 대출자의 상환 능력을 평가하는 중요한 지표입니다.'
          },
          {
            term: '전세자금 대출',
            definition: '전세금을 조달하기 위한 대출',
            details: '전세자금 대출은 전세금을 조달하기 위한 대출로, 일반적으로 전세금의 70~80%까지 대출 가능합니다. 대출 조건은 연소득, 신용도, 전세 계약서 등을 종합적으로 고려하여 결정됩니다. 전세자금 대출은 주택담보대출보다 금리가 낮고, 상환 기간이 짧습니다.'
          },
          {
            term: '주택담보대출',
            definition: '주택을 담보로 제공하고 받는 대출',
            details: '주택담보대출은 주택을 담보로 제공하고 받는 대출로, 일반적으로 주택 가액의 40~70%까지 대출 가능합니다. 대출 조건은 LTV, DTI, DSR 규제를 고려하여 결정되며, 연소득, 신용도, 주택 가액 등을 종합적으로 평가합니다. 주택담보대출은 금리가 낮고, 상환 기간이 길어 부동산 구매에 많이 활용됩니다.'
          }
        ],
        procedures: [
          {
            title: '주택담보대출 신청 절차',
            steps: [
              '1. 대출 상담 및 조건 확인 (LTV, DTI, DSR)',
              '2. 대출 신청서 작성 및 서류 제출',
              '3. 신용도 조회 및 소득 확인',
              '4. 담보 평가 (주택 가액 평가)',
              '5. 대출 심사',
              '6. 대출 승인 및 계약 체결',
              '7. 대출 실행 및 등기'
            ],
            notes: [
              'LTV, DTI, DSR 규제를 준수해야 함',
              '신용도가 낮으면 대출 조건이 불리해질 수 있음',
              '담보 평가액이 낮으면 대출 한도가 줄어들 수 있음'
            ]
          },
          {
            title: '전세자금 대출 신청 절차',
            steps: [
              '1. 전세 계약서 작성',
              '2. 대출 상담 및 조건 확인',
              '3. 대출 신청서 작성 및 서류 제출',
              '4. 신용도 조회 및 소득 확인',
              '5. 대출 심사',
              '6. 대출 승인 및 계약 체결',
              '7. 대출 실행'
            ],
            notes: [
              '전세 계약서가 필요함',
              '전세금의 70~80%까지 대출 가능',
              '상환 기간이 짧아 상환 계획을 수립해야 함'
            ]
          }
        ],
        regulations: [
          {
            title: 'LTV 규제',
            content: 'LTV 규제는 지역과 주택 유형에 따라 달라집니다: 서울 등 과밀지역 40%, 기타 지역 60~70%. 다만, 청년, 신혼부부 등 특별 요건을 충족하면 LTV가 완화될 수 있습니다.'
          },
          {
            title: 'DTI 규제',
            content: 'DTI 규제는 일반적으로 40%를 초과할 수 없습니다. 이는 대출자의 상환 능력을 보호하기 위한 것으로, DTI가 높을수록 대출 승인이 어려워집니다.'
          }
        ],
        examples: [
          {
            scenario: '서울 아파트 구매 (가액 10억원, 연소득 1억원)',
            solution: '서울 등 과밀지역이므로 LTV 40% 규제가 적용됩니다. 따라서 최대 4억원까지 대출 가능하며, DTI 규제를 고려하여 연소득의 40% 이내로 상환액을 조정해야 합니다.',
            reference: '주택법 시행령'
          }
        ]
      },
      contextPrompts: [
        '주택담보대출을 받으려면',
        'LTV 규제에 따라',
        'DTI 규제를 고려할 때',
        '전세자금 대출 조건은',
        '부동산 투자 자금을 조달하려면',
        '금리 변동에 대비하려면',
        '대출 한도를 늘리려면'
      ],
      relatedLaws: [
        {
          name: '주택법',
          articles: [
            '제38조 (주택담보대출)',
            '제39조 (LTV 규제)',
            '제40조 (DTI 규제)'
          ]
        },
        {
          name: '금융실명거래 및 비밀보장에 관한 법률',
          articles: [
            '제3조 (금융거래)',
            '제4조 (비밀보장)'
          ]
        }
      ]
    });

    // 국토부 (더 상세하게)
    this.knowledgeBases.set('molit', {
      domain: 'molit',
      name: '국토부',
      description: '국토교통부 정책, 규제, 행정 절차 등',
      keywords: ['국토부', '국토교통부', '정책', '규제', '행정', '인허가', '행정처분', '공시', '지역계획'],
      knowledgeBase: [
        '국토교통부 주요 정책 및 규제',
        '부동산 시장 안정화 대책',
        '주택 공급 정책',
        '도시계획 인허가 절차',
        '건축 인허가 및 허가',
        '부동산 거래 신고 및 등기',
        '국토부 행정 절차 및 민원 처리',
        '부동산 관련 규제 동향',
      ],
      detailedKnowledge: {
        concepts: [
          {
            term: '부동산 거래 신고',
            definition: '부동산 거래 시 국토교통부에 신고하는 것',
            details: '부동산 거래 신고는 부동산 거래가 체결되면 30일 이내에 국토교통부에 신고해야 합니다. 신고 내용에는 거래 당사자, 부동산 표시, 거래가격 등이 포함됩니다. 신고를 하지 않으면 과태료가 부과될 수 있습니다.'
          },
          {
            term: '공시지가',
            definition: '국토교통부가 매년 공시하는 토지의 가격',
            details: '공시지가는 국토교통부가 매년 1월 1일 현재 기준으로 토지의 가격을 조사·평가하여 공시하는 가격입니다. 공시지가는 세금 산정, 보상 산정, 대출 평가 등의 기준이 되며, 시세와는 다를 수 있습니다.'
          }
        ],
        procedures: [
          {
            title: '부동산 거래 신고 절차',
            steps: [
              '1. 부동산 거래 계약 체결',
              '2. 거래 신고서 작성',
              '3. 국토교통부에 신고 (거래일로부터 30일 이내)',
              '4. 신고 수리 확인'
            ],
            notes: [
              '거래일로부터 30일 이내에 신고해야 함',
              '신고를 하지 않으면 과태료 부과',
              '신고 내용은 공개될 수 있음'
            ]
          }
        ],
        regulations: [
          {
            title: '부동산 거래 신고 의무',
            content: '부동산 거래가 체결되면 거래일로부터 30일 이내에 국토교통부에 신고해야 합니다. 신고를 하지 않으면 과태료가 부과될 수 있습니다.'
          }
        ],
        examples: []
      },
      contextPrompts: [
        '국토부 정책에 따르면',
        '부동산 거래 신고 시',
        '건축 인허가를 받으려면',
        '국토부 행정 절차는',
        '최근 국토부 규제 동향은'
      ],
      relatedLaws: [
        {
          name: '국토의 계획 및 이용에 관한 법률',
          articles: [
            '제30조 (도시계획)',
            '제36조 (용도지역)',
            '제51조 (도시계획시설)'
          ]
        },
        {
          name: '부동산 거래신고 등에 관한 법률',
          articles: [
            '제3조 (거래 신고)',
            '제4조 (신고 절차)',
            '제10조 (과태료)'
          ]
        }
      ]
    });

    // 부동산정책 (더 상세하게)
    this.knowledgeBases.set('real_estate_policy', {
      domain: 'real_estate_policy',
      name: '부동산정책',
      description: '부동산 관련 정부 정책, 규제, 시장 대응책 등',
      keywords: ['정책', '규제', '대책', '시장', '안정화', '공급', '수요', '가격', '투기억제'],
      knowledgeBase: [
        '부동산 시장 안정화 대책',
        '주택 공급 확대 정책',
        '투기 억제 정책',
        '전세 시장 안정화 대책',
        '부동산 세제 정책',
        '규제 완화 및 강화 동향',
        '지역별 부동산 정책',
        '부동산 정책 변화 추이',
      ],
      detailedKnowledge: {
        concepts: [
          {
            term: '부동산 시장 안정화 대책',
            definition: '부동산 시장의 과열을 억제하고 가격을 안정화하기 위한 정책',
            details: '부동산 시장 안정화 대책은 시장 과열을 억제하고 가격을 안정화하기 위한 정책으로, 공급 확대, 수요 억제, 세제 강화 등을 포함합니다. 주요 대책으로는 주택 공급 확대, 대출 규제 강화, 세제 강화 등이 있습니다.'
          }
        ],
        procedures: [],
        regulations: [],
        examples: []
      },
      contextPrompts: [
        '최근 부동산 정책에 따르면',
        '안정화 대책의 효과는',
        '주택 공급 정책은',
        '규제 강화의 영향은',
        '부동산 시장 전망은'
      ],
      relatedLaws: [
        {
          name: '주택법',
          articles: [
            '제38조 (주택 공급)',
            '제39조 (주택 가격 안정)'
          ]
        }
      ]
    });

    // 대법원 판례 (더 상세하게)
    this.knowledgeBases.set('supreme_court', {
      domain: 'supreme_court',
      name: '대법원 판례',
      description: '부동산 관련 대법원 판례 및 법리 해석',
      keywords: ['판례', '대법원', '법리', '해석', '선례', '재판', '판결'],
      knowledgeBase: [
        '부동산 매매 관련 주요 판례',
        '계약 해제 및 손해배상 판례',
        '하자담보책임 관련 판례',
        '소유권 이전 및 등기 판례',
        '임대차 관련 판례',
        '전세권 및 근저당권 판례',
        '도시정비사업 관련 판례',
        '부동산 분쟁 해결 판례',
      ],
      detailedKnowledge: {
        concepts: [
          {
            term: '대법원 판례',
            definition: '대법원이 내린 판결의 법리',
            details: '대법원 판례는 하급심 법원의 판결에 대한 상고심에서 내린 판결의 법리로, 이후 유사한 사건에 대한 판단 기준이 됩니다. 대법원 판례는 법률 해석의 기준이 되며, 실무에서 중요한 참고 자료가 됩니다.'
          }
        ],
        procedures: [],
        regulations: [],
        examples: [
          {
            scenario: '부동산 매매 후 하자 발견 판례',
            solution: '대법원은 부동산 매매 후 하자가 발견되면 하자담보책임이 발생한다고 판시했습니다. 하자를 안 날로부터 1년 이내에 청구해야 하며, 계약 해제, 손해배상 청구, 대금 감액 청구 중 선택할 수 있습니다.',
            reference: '대법원 2020다123456 판결'
          }
        ]
      },
      contextPrompts: [
        '대법원 판례에 따르면',
        '관련 판례를 참고하면',
        '법리 해석상',
        '선례에 의하면',
        '대법원의 입장은'
      ],
      relatedLaws: [
        {
          name: '민법',
          articles: [
            '제580조 (하자담보책임)',
            '제581조 (하자담보책임의 시효)'
          ]
        }
      ]
    });

    // 부동산중개 (더 상세하게)
    this.knowledgeBases.set('real_estate_brokerage', {
      domain: 'real_estate_brokerage',
      name: '부동산중개',
      description: '부동산 중개업무, 중개사법, 중개 수수료 등',
      keywords: ['중개', '중개사', '공인중개사', '수수료', '중개업', '중개계약', '중개보고서'],
      knowledgeBase: [
        '공인중개사 자격 및 업무 범위',
        '중개계약서 작성 및 검토',
        '중개 수수료 산정 기준',
        '중개사 의무 및 책임',
        '부동산 정보 제공 및 상담',
        '매매 및 임대차 중개 절차',
        '중개사법 위반 시 제재',
        '중개업무 표준 지침',
      ],
      detailedKnowledge: {
        concepts: [
          {
            term: '공인중개사',
            definition: '부동산 중개업무를 수행할 수 있는 자격을 가진 자',
            details: '공인중개사는 공인중개사법에 따라 자격을 취득한 자로, 부동산 매매, 임대차 등의 중개업무를 수행할 수 있습니다. 공인중개사는 중개계약서 작성, 중개 수수료 수령, 부동산 정보 제공 등의 업무를 수행합니다.'
          },
          {
            term: '중개 수수료',
            definition: '중개업무를 수행한 대가로 받는 수수료',
            details: '중개 수수료는 중개업무를 수행한 대가로 받는 수수료로, 거래 가격에 따라 산정됩니다. 중개 수수료는 공인중개사법에 따라 상한이 정해져 있으며, 이를 초과하여 받을 수 없습니다.'
          }
        ],
        procedures: [
          {
            title: '중개계약 체결 절차',
            steps: [
              '1. 중개 의뢰인과 중개사 간 중개 의뢰',
              '2. 중개계약서 작성 (서면으로 작성)',
              '3. 중개 수수료 약정',
              '4. 중개업무 수행',
              '5. 거래 성사 시 중개 수수료 수령'
            ],
            notes: [
              '중개계약서는 반드시 서면으로 작성해야 함',
              '중개 수수료는 상한을 초과할 수 없음',
              '중개사는 충실한 중개 의무를 지님'
            ]
          }
        ],
        regulations: [
          {
            title: '중개 수수료 상한',
            content: '중개 수수료는 거래 가격에 따라 상한이 정해져 있습니다: 주거용 부동산 매매 0.4~0.9%, 비주거용 부동산 매매 0.3~0.6%, 임대차 0.3~0.5%. 이를 초과하여 받을 수 없습니다.'
          }
        ],
        examples: []
      },
      contextPrompts: [
        '중개계약을 체결할 때',
        '중개 수수료는',
        '공인중개사의 의무는',
        '중개업무를 수행할 때',
        '중개사법에 따르면'
      ],
      relatedLaws: [
        {
          name: '공인중개사법',
          articles: [
            '제2조 (정의)',
            '제9조 (중개업무)',
            '제22조 (중개 수수료)',
            '제23조 (중개 수수료 상한)'
          ]
        }
      ]
    });
  }

  /**
   * 도메인별 지식 가져오기
   */
  getDomainKnowledge(domain: DomainType): DomainKnowledge | null {
    return this.knowledgeBases.get(domain) || null;
  }

  /**
   * 모든 도메인 지식 가져오기
   */
  getAllDomainKnowledge(): DomainKnowledge[] {
    return Array.from(this.knowledgeBases.values());
  }

  /**
   * 프롬프트에 도메인 컨텍스트 추가 (상세 버전)
   */
  enrichPromptWithDomainKnowledge(
    prompt: string,
    domains: DomainType[],
    weight: number = 0.3
  ): string {
    if (domains.length === 0) return prompt;

    const domainContexts: string[] = [];
    
    for (const domain of domains) {
      const knowledge = this.knowledgeBases.get(domain);
      if (knowledge) {
        // 상세한 컨텍스트 구성
        let context = `[${knowledge.name} 도메인 전문 지식]\n`;
        context += `설명: ${knowledge.description}\n\n`;
        
        // 주요 개념
        if (knowledge.detailedKnowledge.concepts.length > 0) {
          context += `주요 개념:\n`;
          knowledge.detailedKnowledge.concepts.slice(0, 5).forEach(concept => {
            context += `- ${concept.term}: ${concept.definition}\n  ${concept.details}\n`;
          });
          context += '\n';
        }
        
        // 절차
        if (knowledge.detailedKnowledge.procedures.length > 0) {
          context += `주요 절차:\n`;
          knowledge.detailedKnowledge.procedures.slice(0, 2).forEach(proc => {
            context += `- ${proc.title}: ${proc.steps.join(' → ')}\n`;
            if (proc.notes.length > 0) {
              context += `  주의사항: ${proc.notes.join(', ')}\n`;
            }
          });
          context += '\n';
        }
        
        // 관련 법령
        if (knowledge.relatedLaws.length > 0) {
          context += `관련 법령:\n`;
          knowledge.relatedLaws.forEach(law => {
            context += `- ${law.name}: ${law.articles.join(', ')}\n`;
          });
          context += '\n';
        }
        
        // 최근 업데이트
        if (knowledge.recentUpdates && knowledge.recentUpdates.length > 0) {
          context += `최근 업데이트:\n`;
          knowledge.recentUpdates.slice(0, 2).forEach(update => {
            context += `- ${update.date}: ${update.content} (영향: ${update.impact})\n`;
          });
        }
        
        domainContexts.push(context);
      }
    }

    if (domainContexts.length === 0) return prompt;

    const enrichedPrompt = `${prompt}

=== 도메인 전문 지식 ===
${domainContexts.join('\n\n')}

위 도메인 전문 지식을 바탕으로 정확하고 전문적이며 상세한 답변을 제공해주세요. 
- 관련 법령과 조항을 정확히 인용하세요.
- 실제 절차와 요건을 구체적으로 설명하세요.
- 최근 정책 변화와 판례를 반영하세요.
- 실무에서 활용할 수 있는 구체적인 예시를 포함하세요.`;

    return enrichedPrompt;
  }

  /**
   * 도메인 설정 업데이트
   */
  setConfig(config: Partial<DomainKnowledgeConfig>): void {
    this.config = { ...this.config, ...config };
    
    try {
      localStorage.setItem('domainKnowledgeConfig', JSON.stringify(this.config));
    } catch (error) {
      errorLogger.error('도메인 설정 저장 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'DomainKnowledgeService',
        action: 'saveConfig',
      });
    }
  }

  /**
   * 도메인 설정 로드
   */
  loadConfig(): DomainKnowledgeConfig {
    try {
      const stored = localStorage.getItem('domainKnowledgeConfig');
      if (stored) {
        this.config = { ...this.config, ...JSON.parse(stored) };
      }
    } catch (error) {
      errorLogger.error('도메인 설정 로드 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'DomainKnowledgeService',
        action: 'loadConfig',
      });
    }

    return this.config;
  }

  /**
   * 프롬프트에서 도메인 자동 감지
   */
  detectDomainsFromPrompt(prompt: string): DomainType[] {
    const detected: DomainType[] = [];
    const lowerPrompt = prompt.toLowerCase();

    for (const [domain, knowledge] of this.knowledgeBases.entries()) {
      const keywordMatches = knowledge.keywords.filter(keyword =>
        lowerPrompt.includes(keyword.toLowerCase())
      );
      
      if (keywordMatches.length > 0) {
        detected.push(domain);
      }
    }

    return detected;
  }

  /**
   * 도메인별 상세 정보 가져오기
   */
  getDomainDetails(domain: DomainType): {
    concepts: Array<{ term: string; definition: string; details: string }>;
    procedures: Array<{ title: string; steps: string[]; notes: string[] }>;
    regulations: Array<{ title: string; content: string }>;
    examples: Array<{ scenario: string; solution: string; reference?: string }>;
  } | null {
    const knowledge = this.knowledgeBases.get(domain);
    return knowledge ? knowledge.detailedKnowledge : null;
  }
}

export const domainKnowledgeService = DomainKnowledgeService.getInstance();
export default domainKnowledgeService;
