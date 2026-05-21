import { coerceTrimmedString } from '../utils/chatInputUtils';
import {
  buildGraphAnswerDocumentFormatInstruction,
  buildSparseAnswerScaffoldForFormat,
  getGraphAnswerDocumentFormatDef,
  graphAnswerDraftMatchesFormat,
  inferGraphAnswerDocumentFormat,
  reshapeGraphAnswerDraftToFormat,
  type GraphAnswerDocumentFormatId,
} from './conversationGraphAnswerDocumentFormats';
import { isCreateGraphAnswerRequest } from './conversationGraphAnswerIntent';

/** 관계도 답변 글 유형(프롬프트·후처리 공통) */
export type GraphAnswerWritingStyle = 'report' | 'conflict' | 'action' | 'participant' | 'create';

const STYLE_INSTRUCTIONS: Record<GraphAnswerWritingStyle, string> = {
  report:
    '글 유형: 분석 보고서. 사용자 질문에 먼저 직접 답한 뒤, ## 한 줄 요약→### 핵심 포인트(불릿 3~5)→(시스템 표·Mermaid)→## 해석·갈등 축·실행 제안(### 소제목·각 3~6문장) 순으로 작성하세요. 한 줄·목록만 있는 빈약한 답변은 금지합니다. 표·Mermaid는 재작성하지 마세요.',
  conflict:
    '글 유형: 갈등·긴장 분석. 질문 의도에 맞게 반대·대립 연결과 관여 참여자를 중심으로, ### 갈등 축·### 완화 지점·### 대화 운영 제안 소제목 아래 각 3~5문장으로 쓰세요. 핵심 포인트 불릿 3개 이상 포함하세요.',
  action:
    '글 유형: 실행 제안. 질문·요청에 맞는 실행안을 먼저 요약한 뒤, ## 해석·갈등 축·실행 제안 아래 번호 목록(1. 2. 3.)으로 구체적·측정 가능한 조치를 제시하세요. 각 항목은 한 줄이 아닌 2문장 이상으로 설명하세요.',
  participant:
    '글 유형: 참여자 중심 해석. 선택 참여자의 우세 입장·주고받기 역할·연결을 중심으로 ### 역할·영향·주의점 소제목으로 정리하고, 수치·프로필에 없는 추측은 하지 마세요.',
  create:
    '글 유형: 관계도 작성 결과. 질문에 맞게 한 줄 요약·### 핵심 포인트·표·Mermaid·갈등 축을 정돈된 한국어로 제시하고, 성향·선호는 추정임을 밝히세요.',
};

/** @deprecated `buildGraphAnswerDocumentFormatInstruction` 사용 */
export function buildGraphAnswerOutputFormatInstruction(
  userMessage: string,
  hasStructuredSections: boolean,
): string {
  const formatId = inferGraphAnswerDocumentFormat(userMessage);
  return buildGraphAnswerDocumentFormatInstruction(formatId, userMessage, hasStructuredSections);
}

const SYSTEM_TAG_LINE =
  /^\s*\[(?:다중\s*요청|혁신적|답변\s*다양성|가이드라인|품질\s*검증|출력\s*형식|응답\s*스타일|글쓰기\s*품질|도메인\s*지시)[^\]]*\]\s*$/i;

const EMPTY_BULLET_LINE = /^\s*[\u2022\u2023\u2043\u2219\u00B7•·∙]\s*$/;

const ANALYTICAL_SPARSE_FORMATS: GraphAnswerDocumentFormatId[] = [
  'analytical_report',
  'graph_deliverable',
  'business_report',
  'executive_brief',
  'memo',
];

/** 사용자 지시·프리셋 문장에서 글 유형 추론 */
export function inferGraphAnswerWritingStyle(userMessage: string): GraphAnswerWritingStyle {
  const t = userMessage.trim();
  if (!t) return 'report';
  if (isCreateGraphAnswerRequest(t)) return 'create';
  if (/갈등|긴장|반대|대립/.test(t) && /요약|정리|분석/.test(t)) return 'conflict';
  if (/실행\s*제안|실행|액션|다음\s*단계|조치/.test(t)) return 'action';
  if (/참여자|선택된|중심으로/.test(t) && /분석|해석|관계도/.test(t)) return 'participant';
  if (/보고서|동조·반대|구조를\s*정리|성향\s*분석/.test(t)) return 'report';
  return 'report';
}

export function buildGraphAnswerWritingStyleInstruction(style: GraphAnswerWritingStyle): string {
  return STYLE_INSTRUCTIONS[style];
}

function normalizeSectionHeading(line: string): string {
  const t = line.trim();
  if (/^#{1,6}\s*한\s*줄\s*요약/i.test(t)) return '## 한 줄 요약';
  if (/^#{1,6}\s*(해석|갈등|실행)/i.test(t) && !/실행\s*제안\s*만/.test(t)) {
    return '## 해석·갈등 축·실행 제안';
  }
  if (/^#{1,6}\s*참여자\s*표/i.test(t)) return '## 참여자 표';
  if (/^#{1,6}\s*연결\s*표/i.test(t)) return '## 연결 표 (활동 상위)';
  if (/^#{1,6}\s*mermaid/i.test(t)) return '## Mermaid 관계도 (족보형)';
  return line;
}

function enrichAnalyticalSparseAnswer(body: string, lead: string): string {
  const parts: string[] = [];
  const hasKeyPoints = /#{1,6}\s*(핵심|이슈|포인트|Q1)/i.test(body);
  const hasInterpretation = /#{1,6}\s*(해석|갈등|실행|논의|결론|권고|비교)/i.test(body);

  if (!/^##\s*한\s*줄\s*요약/i.test(body) && lead.length > 20) {
    parts.push('## 한 줄 요약', '', lead.slice(0, 420), '');
  }

  if (!hasKeyPoints && lead.length > 20) {
    const sentences = lead
      .split(/(?<=[.!?…])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 12);
    const bullets = (sentences.length >= 2 ? sentences.slice(0, 4) : [lead]).map((s) => `- ${s}`);
    parts.push('### 핵심 포인트', '', ...bullets, '');
  }

  if (!hasInterpretation && lead.length > 18) {
    parts.push(
      '## 해석·갈등 축·실행 제안',
      '',
      '### 해석',
      '',
      `${lead} 위 내용은 관계도·성향 분석 수치와 근거 발언 샘플에 기반한 해석이며, 명시되지 않은 사실은 포함하지 않았습니다.`,
      '',
    );
  }

  if (parts.length === 0) return body;
  return [...parts, body].join('\n').trim().replace(/\n{3,}/g, '\n\n');
}

function enrichFormatSparseAnswer(
  body: string,
  formatId: GraphAnswerDocumentFormatId,
  lead: string,
): string {
  const def = getGraphAnswerDocumentFormatDef(formatId);
  const headings = def.scaffoldOutline.split('\n').filter((l) => /^#{2,3}\s/.test(l.trim()));
  const top = headings.find((h) => h.startsWith('##')) ?? '## 요약';
  const sub = headings.find((h) => h.startsWith('###')) ?? headings[1] ?? top;
  const parts: string[] = [];

  const topLabel = top.replace(/^#+\s*/, '').trim();
  if (!graphAnswerDraftMatchesFormat(body, formatId).ok && lead.length > 18) {
    if (topLabel.length < 2 || !body.includes(topLabel.slice(0, Math.min(6, topLabel.length)))) {
      parts.push(top, '', lead.slice(0, 420), '');
    }
    if (sub && sub !== top && !/#{1,6}\s*(핵심|포인트|Q1|서론|개요)/i.test(body)) {
      const sentences = lead
        .split(/(?<=[.!?…])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 12);
      const bullets = (sentences.length >= 2 ? sentences.slice(0, 4) : [lead]).map((s) => `- ${s}`);
      parts.push(sub, '', ...bullets, '');
    }
  }

  if (parts.length === 0) {
    return `${buildSparseAnswerScaffoldForFormat(formatId)}\n${body}`.trim().replace(/\n{3,}/g, '\n\n');
  }
  return [...parts, body].join('\n').trim().replace(/\n{3,}/g, '\n\n');
}

/** 합성·스트림 후 본문: 시스템 태그 제거·제목 정규화·과다 공백 정리 */
export function polishGraphAnswerMarkdown(
  text: string,
  formatId: GraphAnswerDocumentFormatId = 'analytical_report',
): string {
  const raw = coerceTrimmedString(text, '');
  if (!raw) return '';

  const lines = raw.split('\n');
  const out: string[] = [];
  let lastHeading = '';

  for (const line of lines) {
    if (SYSTEM_TAG_LINE.test(line) || EMPTY_BULLET_LINE.test(line)) continue;
    if (/^\s*\[(?:강제|필수)\]\s*$/i.test(line)) continue;

    let current = line;
    if (/^#{1,6}\s*\S/.test(current.trim())) {
      current = normalizeSectionHeading(current);
      if (current === lastHeading) continue;
      lastHeading = current;
    } else if (current.trim() !== '') {
      lastHeading = '';
    }

    out.push(current);
  }

  let polished = out.join('\n');
  polished = polished.replace(/\n{3,}/g, '\n\n');
  const enriched = enrichSparseGraphAnswerMarkdown(coerceTrimmedString(polished, ''), formatId);
  return reshapeGraphAnswerDraftToFormat(enriched, formatId);
}

const MIN_RICH_ANSWER_CHARS = 280;

/** 짧거나 제목만 있는 답변에 형식별 골격을 보강(표시용, 추측 사실 추가 없음) */
export function enrichSparseGraphAnswerMarkdown(
  text: string,
  formatId: GraphAnswerDocumentFormatId = 'analytical_report',
): string {
  const body = coerceTrimmedString(text, '');
  if (!body) return body;

  const paragraphs = body
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter((b) => b.length > 24 && !/^#{1,6}\s/.test(b) && !/^```/.test(b) && !/^\|/.test(b));

  const lead = paragraphs[0] ?? body.replace(/^#{1,6}\s+[^\n]+\n?/gm, '').trim();

  if (body.length >= MIN_RICH_ANSWER_CHARS) {
    return reshapeGraphAnswerDraftToFormat(body, formatId);
  }

  if (ANALYTICAL_SPARSE_FORMATS.includes(formatId)) {
    const merged = enrichAnalyticalSparseAnswer(body, lead);
    if (merged !== body) return merged;
    return `${buildSparseAnswerScaffoldForFormat(formatId)}\n${body}`.trim().replace(/\n{3,}/g, '\n\n');
  }

  return enrichFormatSparseAnswer(body, formatId, lead);
}

/** context·사용자 메시지로 형식을 정한 뒤 후처리 */
export function polishGraphAnswerMarkdownForContext(
  text: string,
  userMessage: string,
  ctx?: Record<string, unknown>,
): string {
  const fromCtx = coerceTrimmedString(String(ctx?.conversation_graph_document_format ?? ''), '');
  const formatId = (fromCtx || inferGraphAnswerDocumentFormat(userMessage)) as GraphAnswerDocumentFormatId;
  return polishGraphAnswerMarkdown(text, formatId);
}
