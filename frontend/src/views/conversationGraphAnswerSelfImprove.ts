import { coerceTrimmedString } from '../utils/chatInputUtils';
import {
  getGraphAnswerDocumentFormatDef,
  type GraphAnswerDocumentFormatId,
} from './conversationGraphAnswerDocumentFormats';

/** 재생성 시 context에 검증 이슈·시도 횟수 반영 */
export function buildGraphAnswerContextWithRevision(
  base: Record<string, unknown>,
  issues: readonly string[],
  attemptIndex: number,
): Record<string, unknown> {
  const prevInstruction = coerceTrimmedString(String(base.answer_quality_instruction ?? ''), '');
  const revisionLines = [
    '[자동 품질 검증 — 이전 초안 수정 필수]',
    ...issues.map((issue) => `- ${issue}`),
  ];

  const formatRaw = coerceTrimmedString(
    String(base.conversation_graph_document_format ?? ''),
    '',
  );
  if (
    formatRaw &&
    issues.some((issue) => /문서\s*형식|제목|섹션|키워드/i.test(issue))
  ) {
    const def = getGraphAnswerDocumentFormatDef(formatRaw as GraphAnswerDocumentFormatId);
    revisionLines.push(
      '',
      `[${def.labelKo} 형식 재작성 — 아래 제목을 반드시 포함하고 각 섹션을 3문장 이상으로 채우세요]`,
      def.scaffoldOutline,
      `필수 키워드: ${def.sectionKeywords.join(', ')}`,
    );
  }

  const revisionBlock = revisionLines.join('\n');

  return {
    ...base,
    conversation_graph_self_improve_attempt: attemptIndex + 1,
    conversation_graph_revision_issues: [...issues],
    answer_quality_instruction: prevInstruction
      ? `${prevInstruction}\n\n${revisionBlock}`
      : revisionBlock,
  };
}

export function isGraphAnswerSelfImproveEnabled(): boolean {
  return process.env.REACT_APP_GRAPH_ANSWER_SELF_IMPROVE !== '0';
}
