/**
 * 관계도 답변 — 문서·보고서·논문·문학 등 출력 형식 레지스트리
 * 사용자 질문에서 형식을 추론하고, 형식별 구조·문체·학습 예시를 API·후처리에 전달합니다.
 */
import { coerceTrimmedString } from '../utils/chatInputUtils';
import { isCreateGraphAnswerRequest } from './conversationGraphAnswerIntent';
import type { GraphAnswerWritingStyle } from './conversationGraphAnswerProse';

export type GraphAnswerDocumentFormatId =
  | 'analytical_report'
  | 'business_report'
  | 'entity_profile'
  | 'entity_intelligence_report'
  | 'executive_brief'
  | 'academic_paper'
  | 'literary_essay'
  | 'minutes'
  | 'memo'
  | 'comparison_matrix'
  | 'policy_brief'
  | 'faq_brief'
  | 'white_paper'
  | 'graph_deliverable';

export type GraphAnswerDocumentFormatDef = {
  id: GraphAnswerDocumentFormatId;
  labelKo: string;
  /** UI 프리셋·짧은 설명 */
  presetPrompt: string;
  patterns: RegExp[];
  tone: string;
  /** 필수에 가까운 ##/### 제목 키워드(검증·후처리용) */
  sectionKeywords: string[];
  /** 모델 지시: 구조·문체·금지 사항 */
  instruction: string;
  /** 형식 학습용 골격(마크다운 제목만, 내용은 데이터로 채움) */
  scaffoldOutline: string;
  /** 내장 우수 출력 예시(제목·문단 흐름만, 수치는 데이터로 대체) */
  builtinExemplar: string;
};

const FORMATS: GraphAnswerDocumentFormatDef[] = [
  {
    id: 'graph_deliverable',
    labelKo: '관계도 산출물',
    presetPrompt: '대화 관계도를 작성해 주세요. 참여자 표·연결 표·Mermaid 족보형 다이어그램을 포함하세요.',
    patterns: [/관계도\s*(를|을)?\s*(만들|생성|그려|작성)/i, /flowchart/i],
    tone: '기술 문서·데이터 시각화',
    sectionKeywords: ['한 줄 요약', '참여자', '연결', 'Mermaid', '갈등'],
    instruction:
      '산출물 형식: 관계도 패키지. 표·Mermaid는 데이터 그대로 두고, 해석은 짧은 보조 섹션만 덧붙이세요.',
    scaffoldOutline: '## 한 줄 요약\n### 핵심 포인트\n## 참여자 표\n## 연결 표\n## Mermaid 관계도\n## 해석·갈등 축',
    builtinExemplar:
      '## 한 줄 요약\n(관계도 핵심 2문장)\n### 핵심 포인트\n- (동조·반대 축)\n## 참여자 표\n## Mermaid 관계도\n## 해석·갈등 축',
  },
  {
    id: 'analytical_report',
    labelKo: '분석 보고서',
    presetPrompt:
      '대화 관계도·성향 분석을 바탕으로 분석 보고서를 작성해 주세요. 동조·반대·발화 구조를 데이터 근거로 정리하세요.',
    patterns: [/분석\s*보고서/i, /성향\s*분석/i, /동조·반대/i, /구조를\s*정리/i],
    tone: '객관적 분석 보고서(경어체, ~습니다)',
    sectionKeywords: ['한 줄 요약', '핵심 포인트', '해석', '갈등', '실행'],
    instruction:
      '형식: 분석 보고서. 서두 2~4문장으로 질문에 직접 답한 뒤, ## 한 줄 요약 → ### 핵심 포인트(3~5) → (시스템 표·Mermaid) → ## 해석·갈등 축·실행 제안(### 소제목, 각 3~6문장).',
    scaffoldOutline:
      '## 한 줄 요약\n### 핵심 포인트\n## 해석·갈등 축·실행 제안\n### 해석\n### 갈등 축\n### 실행 제안',
    builtinExemplar:
      '## 한 줄 요약\n(질문에 대한 직접 답)\n### 핵심 포인트\n- …\n## 해석·갈등 축·실행 제안\n### 해석\n### 실행 제안',
  },
  {
    id: 'business_report',
    labelKo: '사업·운영 보고서',
    presetPrompt:
      '채팅방 대화 관계를 사업·운영 관점의 보고서로 정리해 주세요. 이해관계·리스크·협의 포인트를 포함하세요.',
    patterns: [/사업|운영|경영|프로젝트|조합|재개발|시공|입찰/i, /보고서/i],
    tone: '사업 보고서(간결·실무)',
    sectionKeywords: ['요약', '현황', '이슈', '리스크', '제안'],
    instruction:
      '형식: 사업·운영 보고서. ## 경영 요약 → ### 핵심 이슈 → ## 현황·관계 구조(표·Mermaid 활용) → ## 리스크·갈등 → ## 협의·실행 제안(번호 목록).',
    scaffoldOutline:
      '## 경영 요약\n### 핵심 이슈\n## 현황·관계 구조\n## 리스크·갈등\n## 협의·실행 제안',
    builtinExemplar:
      '## 경영 요약\n## 현황·관계 구조\n(표·Mermaid)\n## 리스크·갈등\n## 협의·실행 제안\n1. …',
  },
  {
    id: 'entity_profile',
    labelKo: '엔티티·참여자 프로필',
    presetPrompt:
      '선택·주요 참여자를 엔티티 프로필 보고서 형식으로 작성해 주세요. 입장·역할·연결·근거 발언을 묶어 주세요.',
    patterns: [
      /엔티티\s*프로필|프로필\s*(카드|보고서)?/i,
      /참여자\s*(별\s*)?프로필|인물\s*프로필|개체\s*프로필/i,
      /프로파일|참여자\s*중심|인물\s*분석/i,
    ],
    tone: '프로필·엔티티 카드형',
    sectionKeywords: ['프로필', '입장', '역할', '연결', '근거'],
    instruction:
      '형식: 엔티티(참여자) 프로필 보고서. ## 대상 개요 → ### 핵심 속성(입장·발화·연결) → ## 관계 네트워크(표·Mermaid) → ## 근거 발언·해석 → ## 주의·후속 질문.',
    scaffoldOutline:
      '## 대상 개요\n### 핵심 속성\n## 관계 네트워크\n## 근거 발언·해석\n## 주의·후속 질문',
    builtinExemplar:
      '## 대상 개요\n### 핵심 속성\n| 속성 | 값 |\n## 관계 네트워크\n## 근거 발언·해석',
  },
  {
    id: 'entity_intelligence_report',
    labelKo: '엔티티·인텔리전스 보고서',
    presetPrompt:
      '대화·관계도 데이터를 엔티티(인물·조직) 인텔리전스 보고서 형식으로 작성해 주세요. 대상 식별·관계망·입장·리스크·권고를 도식적으로 정리하세요.',
    patterns: [
      /엔티티\s*인텔리전스|인텔리전스\s*보고/i,
      /엔티티\s*보고서/i,
      /인텔리전스|인텔\s*보고/i,
      /에널리티|엔티티\s*분석\s*보고/i,
      /정보\s*보고서|도식\s*보고/i,
      /dossier|intelligence\s*report/i,
    ],
    tone: '인텔리전스·엔티티 분석 보고서(객관·근거 인용)',
    sectionKeywords: ['엔티티', '식별', '관계망', '입장', '리스크', '권고'],
    instruction:
      '형식: 엔티티·인텔리전스 보고서. ## 개요·판단 요약 → ### 대상 엔티티 식별 → ## 관계망(표·Mermaid) → ### 입장·영향력 → ## 리스크·불확실성 → ## 권고·후속 수집. 참여자명·연결 라벨을 인용하세요.',
    scaffoldOutline:
      '## 개요·판단 요약\n### 대상 엔티티 식별\n## 관계망\n### 입장·영향력\n## 리스크·불확실성\n## 권고·후속 수집',
    builtinExemplar:
      '## 개요·판단 요약\n(2~3문장)\n### 대상 엔티티 식별\n- 엔티티 A: …\n## 관계망\n## 리스크·불확실성\n## 권고·후속 수집',
  },
  {
    id: 'executive_brief',
    labelKo: '경영진 브리핑',
    presetPrompt:
      '경영진이 3분 안에 읽을 수 있는 브리핑으로 관계도 분석을 요약해 주세요. 결론·리스크·결정 사항을 앞에 두세요.',
    patterns: [/경영진|임원|브리핑|executive|의사결정|결론\s*먼저/i, /3분|한\s*페이지/i],
    tone: '경영 브리핑(짧고 단정)',
    sectionKeywords: ['결론', '브리핑', '리스크', '결정'],
    instruction:
      '형식: 경영진 브리핑. ## 결론(3문장 이내) → ### 결정·권고 사항 → ### 핵심 리스크 → ## 근거 스냅샷(표·Mermaid 요약) → ## 상세 해석(선택).',
    scaffoldOutline:
      '## 결론\n### 결정·권고 사항\n### 핵심 리스크\n## 근거 스냅샷\n## 상세 해석',
    builtinExemplar: '## 결론\n### 결정·권고 사항\n## 근거 스냅샷',
  },
  {
    id: 'academic_paper',
    labelKo: '논문·학술형',
    presetPrompt:
      '대화 관계 분석을 학술 논문형(서론·방법·결과·논의·결론)으로 작성해 주세요. 가설·한계를 명시하세요.',
    patterns: [/논문|학술|paper|서론|방법론|결과|논의|결론|가설|문헌/i],
    tone: '학술 논문(객관·인용형, ~한다/~이다 혼용 가능)',
    sectionKeywords: ['서론', '방법', '결과', '논의', '결론'],
    instruction:
      '형식: 학술 논문 요약체. ## 서론(연구 질문·맥락) → ## 방법(데이터·관계도 산출) → ## 결과(표·Mermaid·수치) → ## 논의(해석·갈등) → ## 결론·한계. 추측은 가설로 표기.',
    scaffoldOutline: '## 서론\n## 방법\n## 결과\n## 논의\n## 결론·한계',
    builtinExemplar: '## 서론\n## 방법\n## 결과\n## 논의\n## 결론·한계',
  },
  {
    id: 'literary_essay',
    labelKo: '문학·서사형',
    presetPrompt:
      '대화 속 인물 관계를 문학·서사 수필 형식으로 풀어 쓰되, 수치·발언에 없는 사실은 꾸며내지 마세요.',
    patterns: [/문학|서사|수필|이야기|서사적|인물\s*관계|드라마|소설/i],
    tone: '서사·문학 수필(은유 절제, 사실 왜곡 금지)',
    sectionKeywords: ['서사', '인물', '갈등', '장면'],
    instruction:
      '형식: 문학·서사 해석. ## 서사 한 줄 → ### 인물·관계의 핵심 장면 → ## 관계의 결이(표·Mermaid는 부록) → ## 갈등·전환 → ## 여운·주의(데이터 밖 추측 금지).',
    scaffoldOutline: '## 서사 한 줄\n### 인물·관계의 핵심\n## 관계의 결\n## 갈등·전환\n## 여운·주의',
    builtinExemplar: '## 서사 한 줄\n### 인물·관계의 핵심\n## 갈등·전환\n## 여운·주의',
  },
  {
    id: 'minutes',
    labelKo: '회의록·록',
    presetPrompt:
      '대화 흐름을 회의록 형식으로 정리해 주세요. 안건·발언 요지·합의·미결을 구분하세요.',
    patterns: [/회의록|록\b|minutes|안건|합의|미결|의사\s*진행/i],
    tone: '회의록(간결·사실 중심)',
    sectionKeywords: ['회의', '안건', '합의', '미결', '참석'],
    instruction:
      '형식: 회의록. ## 회의 요약 → ### 안건 → ## 참석·역할(표) → ## 발언·관계 흐름 → ## 합의·미결 → ## 후속 조치.',
    scaffoldOutline:
      '## 회의 요약\n### 안건\n## 참석·역할\n## 발언·관계 흐름\n## 합의·미결\n## 후속 조치',
    builtinExemplar: '## 회의 요약\n## 참석·역할\n## 합의·미결',
  },
  {
    id: 'memo',
    labelKo: '메모·브리프',
    presetPrompt: '관계도 분석을 내부 공유용 메모 형식으로 짧게 정리해 주세요.',
    patterns: [/메모|memo|내부\s*공유|브리프\s*메모/i],
    tone: '내부 메모(짧은 문장)',
    sectionKeywords: ['메모', '요약', '액션'],
    instruction:
      '형식: 내부 메모. ## 메모 요약(5문장 이내) → ### To-do → ## 근거(표·Mermaid 압축) → ## 메모.',
    scaffoldOutline: '## 메모 요약\n### To-do\n## 근거\n## 메모',
    builtinExemplar: '## 메모 요약\n### To-do\n## 근거',
  },
  {
    id: 'comparison_matrix',
    labelKo: '비교·대조 분석',
    presetPrompt:
      '참여자·입장·연결을 비교 표 중심으로 대조 분석해 주세요. 차이·공통점을 명확히 하세요.',
    patterns: [/비교|대조|versus|vs\.?|매트릭스|표\s*중심/i],
    tone: '비교 분석(표·항목 대칭)',
    sectionKeywords: ['비교', '대조', '공통', '차이'],
    instruction:
      '형식: 비교·대조. ## 비교 목적 → ### 비교 축 → ## 비교 표(마크다운) → ## Mermaid(선택) → ## 종합 해석.',
    scaffoldOutline: '## 비교 목적\n### 비교 축\n## 비교 표\n## 종합 해석',
    builtinExemplar: '## 비교 목적\n## 비교 표\n## 종합 해석',
  },
  {
    id: 'policy_brief',
    labelKo: '정책·제안 브리프',
    presetPrompt:
      '관계도 분석을 정책·제안 브리프로 작성해 주세요. 문제·근거·대안·권고 순으로 정리하세요.',
    patterns: [/정책|제안|권고|대안|policy|브리프/i],
    tone: '정책 브리프(문제-근거-대안)',
    sectionKeywords: ['문제', '근거', '대안', '권고'],
    instruction:
      '형식: 정책·제안 브리프. ## 문제 정의 → ## 근거(관계도·표) → ## 대안 → ## 권고·실행.',
    scaffoldOutline: '## 문제 정의\n## 근거\n## 대안\n## 권고·실행',
    builtinExemplar: '## 문제 정의\n## 근거\n## 권고·실행',
  },
  {
    id: 'faq_brief',
    labelKo: 'Q&A·FAQ',
    presetPrompt:
      '관계도 분석을 질문·답변(FAQ) 형식으로 정리해 주세요. 사용자 질문에 맞는 Q를 4~6개 만드세요.',
    patterns: [/FAQ|Q&A|질문\s*답변|물어보|궁금/i],
    tone: 'FAQ(질문 굵게, 답 2~4문장)',
    sectionKeywords: ['Q', '질문', '답'],
    instruction:
      '형식: FAQ. ## 한 줄 요약 → ### Q1 … (각 **Q:** / **A:** 쌍, 4~6개) → ## 참고(표·Mermaid).',
    scaffoldOutline: '## 한 줄 요약\n### Q1\n**Q:** …\n**A:** …\n## 참고',
    builtinExemplar: '## 한 줄 요약\n**Q:** …\n**A:** …\n## 참고',
  },
  {
    id: 'white_paper',
    labelKo: '백서·화이트페이퍼',
    presetPrompt:
      '관계도·대화 분석을 백서(화이트페이퍼) 형식으로 작성해 주세요. 배경·문제·분석·시사점·제언 순으로 정리하세요.',
    patterns: [/백서|화이트\s*페이퍼|white\s*paper|시사\s*보고/i],
    tone: '백서(배경-문제-분석-제언)',
    sectionKeywords: ['배경', '문제', '분석', '시사', '제언'],
    instruction:
      '형식: 백서. ## 요약 → ## 배경·맥락 → ## 문제 정의 → ## 분석(표·Mermaid) → ## 시사점 → ## 제언·로드맵.',
    scaffoldOutline: '## 요약\n## 배경·맥락\n## 문제 정의\n## 분석\n## 시사점\n## 제언·로드맵',
    builtinExemplar: '## 요약\n## 배경·맥락\n## 분석\n## 제언·로드맵',
  },
];

const FORMAT_BY_ID = new Map(FORMATS.map((f) => [f.id, f]));

/** UI·프리셋용 목록 */
export const GRAPH_ANSWER_DOCUMENT_FORMAT_PRESETS = FORMATS.filter(
  (f) => f.id !== 'graph_deliverable',
).map((f) => ({
  id: f.id,
  label: f.labelKo,
  prompt: f.presetPrompt,
}));

function scoreFormat(message: string, def: GraphAnswerDocumentFormatDef): number {
  let score = 0;
  def.patterns.forEach((re, i) => {
    if (re.test(message)) score += i === 0 ? 3 : 2;
  });
  return score;
}

/** 사용자 메시지·글 유형에서 문서 형식 추론 */
export function inferGraphAnswerDocumentFormat(
  userMessage: string,
  writingStyle?: GraphAnswerWritingStyle,
): GraphAnswerDocumentFormatId {
  const t = coerceTrimmedString(userMessage, '');
  if (!t) return 'analytical_report';
  if (isCreateGraphAnswerRequest(t)) return 'graph_deliverable';

  let best: GraphAnswerDocumentFormatDef = FORMAT_BY_ID.get('analytical_report')!;
  let bestScore = 0;
  for (const def of FORMATS) {
    const s = scoreFormat(t, def);
    if (s > bestScore) {
      bestScore = s;
      best = def;
    }
  }

  if (bestScore === 0 && writingStyle) {
    const styleMap: Partial<Record<GraphAnswerWritingStyle, GraphAnswerDocumentFormatId>> = {
      conflict: 'analytical_report',
      action: 'policy_brief',
      participant: 'entity_intelligence_report',
      create: 'graph_deliverable',
      report: 'analytical_report',
    };
    const mapped = styleMap[writingStyle];
    if (mapped) return mapped;
  }

  return best.id;
}

export function getGraphAnswerDocumentFormatDef(
  id: GraphAnswerDocumentFormatId,
): GraphAnswerDocumentFormatDef {
  return FORMAT_BY_ID.get(id) ?? FORMAT_BY_ID.get('analytical_report')!;
}

/** 형식별 모델 지시 + 골격 + 학습 예시 */
export function buildGraphAnswerDocumentFormatInstruction(
  formatId: GraphAnswerDocumentFormatId,
  userMessage: string,
  hasStructuredSections: boolean,
): string {
  const def = getGraphAnswerDocumentFormatDef(formatId);
  const intent = coerceTrimmedString(userMessage, '').slice(0, 220);
  const dataNote = hasStructuredSections
    ? '시스템이 제공한 표·Mermaid 블록은 유지하고 서술만 형식에 맞게 작성하세요.'
    : '데이터 근거로 표·Mermaid flowchart TB를 직접 작성하세요.';

  return [
    `[출력 문서 형식: ${def.labelKo}]`,
    `문체: ${def.tone}.`,
    intent ? `사용자 요청: 「${intent}」— 이 질문·요구·요청에 맞는 결론을 맨 앞에 제시하세요.` : '',
    def.instruction,
    `권장 제목 골격:\n${def.scaffoldOutline}`,
    `[내장 우수 출력 예시 — 구조·밀도만 참고, 내용은 반드시 스냅샷·발언 근거로 채우세요]\n${def.builtinExemplar}`,
    dataNote,
    '수치·참여자·발언에 없는 사실은 추측하지 마세요. 빈 목록·한 줄 답변·플레이스홀더 금지. 전체 600자 이상, 각 섹션 3문장 이상으로 작성하세요.',
  ]
    .filter(Boolean)
    .join(' ');
}

/** 모든 형식의 구조 학습 요약(짧게, API context용) */
export function buildGraphAnswerFormatCurriculumPrompt(): string {
  const lines = [
    '[문서 형식 커리큘럼 — 질문·요구에 가장 맞는 형식 하나를 끝까지 유지하세요]',
    '형식 종류: 분석보고서, 사업보고서, 엔티티프로필, 엔티티·인텔리전스보고서, 경영브리핑, 논문, 문학·서사, 회의록, 메모, 비교표, 정책브리프, FAQ, 백서, 관계도산출물.',
  ];
  for (const def of FORMATS) {
    if (def.id === 'graph_deliverable') continue;
    lines.push(`- ${def.labelKo}: ${def.scaffoldOutline.replace(/\n/g, ' → ')}`);
  }
  return lines.join('\n');
}

/** 형식에 맞는 빈약 답변 골격(후처리) */
export function buildSparseAnswerScaffoldForFormat(formatId: GraphAnswerDocumentFormatId): string {
  const def = getGraphAnswerDocumentFormatDef(formatId);
  const first = def.scaffoldOutline.split('\n').filter((l) => l.startsWith('##'))[0] ?? '## 한 줄 요약';
  const second =
    def.scaffoldOutline.split('\n').find((l) => l.startsWith('###')) ?? '### 핵심 포인트';
  return `${first}\n\n(관계도·성향 데이터에 기반한 요약을 작성합니다.)\n\n${second}\n\n- (핵심 포인트 1)\n- (핵심 포인트 2)\n`;
}

/** 초안이 형식 필수 섹션을 어느 정도 충족하는지 */
export function graphAnswerDraftMatchesFormat(
  draft: string,
  formatId: GraphAnswerDocumentFormatId,
): { ok: boolean; missing: string[] } {
  const def = getGraphAnswerDocumentFormatDef(formatId);
  const text = coerceTrimmedString(draft, '');
  const missing = def.sectionKeywords.filter((kw) => !text.includes(kw));
  const ok = missing.length <= Math.max(1, Math.floor(def.sectionKeywords.length / 2));
  return { ok, missing };
}

function graphAnswerHeadingPresent(text: string, headingLine: string): boolean {
  const label = headingLine.replace(/^#+\s*/, '').trim();
  if (!label) return true;
  const core = label.split(/[·\s]/)[0]?.slice(0, 6) ?? label;
  if (core.length >= 2 && text.includes(core)) return true;
  const escaped = core.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^#{1,6}\\s*[^\\n]*${escaped}`, 'im').test(text);
}

/** 형식 골격에 맞지 않는 초안에 누락 제목만 보강(본문은 기존 초안 유지) */
export function reshapeGraphAnswerDraftToFormat(
  draft: string,
  formatId: GraphAnswerDocumentFormatId,
): string {
  const body = coerceTrimmedString(draft, '');
  if (!body) return body;

  const { ok } = graphAnswerDraftMatchesFormat(body, formatId);
  if (ok) return body;

  const def = getGraphAnswerDocumentFormatDef(formatId);
  const headings = def.scaffoldOutline.split('\n').filter((l) => /^#{2,3}\s/.test(l.trim()));
  const lead = body
    .replace(/^#{1,6}\s+[^\n]+\n?/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^\|.+\|$/gm, '')
    .trim()
    .slice(0, 480);
  const inserts: string[] = [];

  for (const heading of headings) {
    const label = heading.replace(/^#+\s*/, '').trim();
    if (graphAnswerHeadingPresent(body, label)) continue;
    inserts.push(
      heading,
      '',
      lead.length > 24
        ? lead.slice(0, 360)
        : `(관계도·성향 데이터에 기반해 「${label}」 섹션을 채웁니다. 아래 본문을 참고하세요.)`,
      '',
    );
  }

  if (inserts.length === 0) return body;
  return `${inserts.join('\n').trim()}\n\n${body}`.replace(/\n{3,}/g, '\n\n');
}
