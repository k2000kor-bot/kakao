import type { PipelineMessageExtras } from '../utils/chatInputUtils';

/**
 * API `conversation_history` / `buildUnifiedChatContext` 공통 턴.
 * `pipelineExtras`는 merge 시나리오 상속 등에만 쓰이고 본문 직렬화에서는 보통 생략됨.
 */
export type ChatTurn = {
  role: string;
  content: string;
  pipelineExtras?: PipelineMessageExtras | null;
};

/** 프롬프트 빌더 공개 타입 — `ChatTurn`과 동일 계약 */
export type UnifiedChatConversationTurn = ChatTurn;
