import { coerceTrimmedString } from '../utils/chatInputUtils';
import { isCreateGraphAnswerRequest } from './conversationGraphAnswerIntent';

/** 관계도 답변 글 유형(프롬프트·후처리 공통) */
export type GraphAnswerWritingStyle = 'report' | 'conflict' | 'action' | 'participant' | 'create';

const STYLE_INSTRUCTIONS: Record<GraphAnswerWritingStyle, string> = {
  report:
    '글 유형: 분석 보고서. 경어체(~습니다)로 통일하고, ## 한 줄 요약→(시스템 표·Mermaid)→## 해석·갈등 축·실행 제안 순으로 정리하세요. 표·Mermaid는 재작성하지 마세요.',
  conflict:
    '글 유형: 갈등·긴장 분석. 반대·대립 연결과 관여 참여자를 중심으로, 원인·완화 지점을 짧은 문단(각 3~5문장)으로 명확히 쓰세요.',
  action:
    '글 유형: 실행 제안. ## 실행 제안(또는 ## 해석·갈등 축·실행 제안) 아래에 번호 목록(1. 2. 3.)으로 구체적·실행 가능한 조치만 제시하세요.',
  participant:
    '글 유형: 참여자 중심 해석. 선택 참여자의 우세 입장·주고받기 역할·연결을 중심으로, 수치·프로필에 없는 추측은 하지 마세요.',
  create:
    '글 유형: 관계도 작성 결과. 한 줄 요약·표·Mermaid·갈등 축을 정돈된 한국어로 제시하고, 성향·선호는 추정임을 밝히세요.',
};

const SYSTEM_TAG_LINE =
  /^\s*\[(?:다중\s*요청|혁신적|답변\s*다양성|가이드라인|품질\s*검증|출력\s*형식|응답\s*스타일|글쓰기\s*품질|도메인\s*지시)[^\]]*\]\s*$/i;

const EMPTY_BULLET_LINE = /^\s*[\u2022\u2023\u2043\u2219\u00B7•·∙]\s*$/;

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

/** 합성·스트림 후 본문: 시스템 태그 제거·제목 정규화·과다 공백 정리 */
export function polishGraphAnswerMarkdown(text: string): string {
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
  return coerceTrimmedString(polished, '');
}
