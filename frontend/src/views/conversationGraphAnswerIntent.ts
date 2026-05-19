import type { GraphAiAnalysis } from './conversationGraphAiAnalyzer';

/** 사용자가 관계도 산출·시각화를 요청했는지 (자연어) */
export function isCreateGraphAnswerRequest(message: string): boolean {
  const t = message.trim();
  if (!t) return false;
  if (/관계도\s*(를|을)?\s*(만들|생성|그려|그리|작성|구축|뽑|출력|보여|그려줘|만들어)/i.test(t)) {
    return true;
  }
  if (/(만들|생성|그려|작성).{0,12}관계도/i.test(t)) {
    return true;
  }
  if (/대화.{0,16}(을|를)?\s*(기준|바탕).{0,16}관계도/i.test(t)) {
    return true;
  }
  if (/관계도.{0,16}(을|를)?\s*(기준|바탕).{0,8}대화/i.test(t)) {
    return true;
  }
  if (/relationship\s*graph|conversation\s*graph/i.test(t) && /(create|make|build|draw|generate)/i.test(t)) {
    return true;
  }
  return false;
}

const CREATE_GRAPH_PROMPT_BODY = [
  '아래 대화·관계도 분석 데이터를 바탕으로 **족보형 대화 관계도**를 작성해 주세요.',
  '반드시 다음을 포함하세요:',
  '1) 한 줄 요약',
  '2) 참여자 표(이름·우세 입장·주고받기 역할·족보 계층·발화 수)',
  '3) 연결 표(누가→누구, 동조/반대/발화 흐름, 가중치)',
  '4) Mermaid `flowchart TB` 다이어그램(위→아래 족보, 화살표에 연결 의미 라벨)',
  '5) 갈등 축·시공사 반응(데이터에 있을 때만)',
  '수치·스냅샷·근거 발언에 없는 참여자·연결은 추가하지 마세요. 모든 성향·선호는 추정임을 밝히세요.',
].join('\n');

export const CREATE_GRAPH_ANSWER_PRESET = {
  id: 'create-graph',
  label: '관계도 만들기',
  prompt: CREATE_GRAPH_PROMPT_BODY,
} as const;

export function resolveGraphAnswerUserMessage(
  message: string,
  _hasGraphNodes: boolean,
): { message: string; isCreateGraph: boolean } {
  const trimmed = message.trim();
  if (!trimmed) return { message: trimmed, isCreateGraph: false };
  if (isCreateGraphAnswerRequest(trimmed)) {
    /* API message는 사용자 문장만 — 번호 목록(1) 2)…)은 context·백엔드 지시로 전달(다중 요청 오인 방지) */
    return { message: trimmed, isCreateGraph: true };
  }
  return { message: trimmed, isCreateGraph: false };
}

export function buildCreateGraphAnswerInstruction(hasGraphNodes: boolean, hasRawConversation: boolean): string {
  if (hasGraphNodes) {
    return [
      '요청은 대화 관계도 작성입니다.',
      'conversation_graph_snapshot·근거 발언·KPI만 근거로 참여자 표·연결 표·Mermaid flowchart TB를 출력하세요.',
      '화면 관계도(족보형)와 일치하도록 위→아래 계층을 유지하세요.',
    ].join(' ');
  }
  if (hasRawConversation) {
    return [
      '요청은 대화 관계도 작성입니다. 서버 관계도가 아직 없으므로 conversation_graph_raw_conversation 원문에서',
      '참여자·발화 흐름·동조/반대를 추출해 참여자 표·연결 표·Mermaid flowchart TB를 작성하세요.',
      '확실하지 않은 연결은 추측하지 마세요.',
    ].join(' ');
  }
  return '요청은 대화 관계도 작성입니다. 데이터가 부족하면 필요한 입력(대화 붙여넣기·파일 업로드)을 안내하세요.';
}

export function createPlaceholderGraphAnalysis(): GraphAiAnalysis {
  return {
    analyzedAt: new Date().toISOString().slice(0, 10),
    trustScore: 0,
    trustLabel: '낮음',
    methodology: ['관계도 생성'],
    stanceSummary: '',
    exchangeSummary: '',
    alignmentSummary: '',
    participants: [],
    topInfluencers: [],
    exchangeLeaders: [],
    agreementHubs: [],
  };
}

/** 답변 맥락용 원문 대화 (토큰 절약) */
export function truncateRawConversationForAnswer(text: string, maxLen = 12000): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen)}\n…(이하 생략)`;
}
