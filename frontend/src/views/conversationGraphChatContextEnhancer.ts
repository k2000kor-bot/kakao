import {
  buildCreateGraphAnswerInstruction,
  isCreateGraphAnswerRequest,
  truncateRawConversationForAnswer,
} from './conversationGraphAnswerIntent';
import {
  applyGraphAnswerQualityDefaults,
  GRAPH_ANSWER_CONTEXT_FLAG,
} from './conversationGraphAnswerGeneration';

export type MergeConversationGraphChatContextOptions = {
  conversationFileContent?: string;
  /** 이미 관계도 handoff context가 실려 있는지 */
  hasGraphHandoffContext?: boolean;
};

/**
 * 통합 대화 `/chat` 전송 context에 「관계도 만들어줘」 의도를 병합합니다.
 * 첨부·붙여넣은 대화 원문 또는 관계도 handoff 맥락이 있을 때만 적용합니다.
 */
function resolveConversationFileTextForGraph(
  base: Record<string, unknown>,
  opts?: MergeConversationGraphChatContextOptions,
): string {
  const fromOpts = opts?.conversationFileContent?.trim() ?? '';
  if (fromOpts) {
    return truncateRawConversationForAnswer(fromOpts);
  }
  const fromBase = typeof base.conversation_file_content === 'string' ? base.conversation_file_content.trim() : '';
  return fromBase ? truncateRawConversationForAnswer(fromBase) : '';
}

export function mergeConversationGraphCreateIntentIntoChatContext(
  trimmedInput: string,
  base: Record<string, unknown>,
  opts?: MergeConversationGraphChatContextOptions,
): Record<string, unknown> {
  if (!isCreateGraphAnswerRequest(trimmedInput)) {
    return base;
  }

  const fileText = resolveConversationFileTextForGraph(base, opts);
  const hasHandoff = opts?.hasGraphHandoffContext ?? base[GRAPH_ANSWER_CONTEXT_FLAG] === true;
  const hasSnapshot = Boolean(
    typeof base.conversation_graph_snapshot === 'string' &&
      String(base.conversation_graph_snapshot).trim(),
  );

  if (!fileText && !hasHandoff && !hasSnapshot) {
    return applyGraphAnswerQualityDefaults({
      ...base,
      [GRAPH_ANSWER_CONTEXT_FLAG]: true,
      multi_request_mode: false,
      input_intent_hint: 'conversation_graph_create',
      conversation_graph_has_data: false,
      conversation_graph_create_from_chat: true,
      conversation_graph_page_path: '/conversation-graph',
      conversation_graph_create_hint:
        '관계도 작성을 요청했습니다. 카카오톡 대화 TXT/CSV를 첨부하거나 /conversation-graph 에서 대화를 붙여넣은 뒤 「관계도 만들기」 답변 생성을 이용해 주세요.',
      answer_quality_instruction: buildCreateGraphAnswerInstruction(false, false),
    });
  }

  const hasGraphNodes = base.conversation_graph_has_data === true || hasSnapshot || hasHandoff;
  const instruction = buildCreateGraphAnswerInstruction(hasGraphNodes, Boolean(fileText));

  return applyGraphAnswerQualityDefaults({
    ...base,
    [GRAPH_ANSWER_CONTEXT_FLAG]: true,
    multi_request_mode: false,
    input_intent_hint: 'conversation_graph_create',
    conversation_graph_has_data: hasGraphNodes,
    ...(fileText && !hasSnapshot ? { conversation_graph_raw_conversation: fileText } : {}),
    answer_quality_instruction: instruction,
    conversation_graph_create_from_chat: true,
    conversation_graph_page_path: '/conversation-graph',
  });
}
