/**
 * 보조 대화 UI → 통합 API용 context (ChatGPTInterface·Ultimate와 동일 계약)
 *
 * `REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT=0` 이면 비활성 — **ModernChat·IntegratedMaster 등
 * 이 모듈을 쓰는 모든 진입점**에서 파이프라인 context를 보내지 않음.
 * 미설정 시 활성 — 구조화 입력·웹 의도 등이 있을 때만 Q→A·Genspark 블록 포함.
 */

import {
  resolveDeepseekFlagsForConversation,
  type ConversationDeepseekFlags,
} from '../config/deepseekUiDefaults';
import type { Message } from '../types';
import {
  buildFeatureContextFromMessage,
  coerceTrimmedString,
  extractLastAssistantGenerationScenarioMarkdown,
  parseInputIntent,
  parseQuestionRequirementSections,
} from '../utils/chatInputUtils';
import type { MessageLikeForScenarioInherit, PipelineMessageExtras } from '../utils/chatInputUtils';
import {
  buildUnifiedChatContext,
  MULTI_REQUEST_ADAPTATION_INSTRUCTION,
} from './generationPromptBuilder';
import { applyGensparkRouteContextFromWindowIfMissing } from './gensparkAgentRegistry';
import type { ChatTurn } from './chatConversationTurn';

export type { ChatTurn } from './chatConversationTurn';

function isUnifiedContextDisabled(): boolean {
  return process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT === '0';
}

export type ChatPipelineHistoryOptions = {
  /** `/agents?id=` 등 — buildUnifiedChatContext에 전달해 Genspark 프로필·URL을 해당 id로 맞춤 */
  gensparkRouteAgentId?: string;
  /** 직전 턴 시나리오를 `client_generation_scenario`로 전달 (백엔드 프리픽스 승격) */
  clientGenerationScenario?: string;
  /** 대화별 딥시크 — 미설정 필드는 전역 env 기본 */
  conversationDeepseek?: ConversationDeepseekFlags;
};

/** `mergeApiChatContextPayload` 4번째 인자 — 직전 어시스턴트 `pipelineExtras.generationScenarioMarkdown` 상속 */
export type MergeApiChatContextPayloadOptions = {
  recentMessagesForScenarioInherit?: readonly MessageLikeForScenarioInherit[];
  conversationDeepseek?: ConversationDeepseekFlags;
};

function isInheritClientGenerationScenarioEnabled(): boolean {
  return process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO === 'true';
}

/**
 * `REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO=true`이고 메시지 배열이 비어 있지 않을 때만
 * `mergeApiChatContextPayload` 4번째 인자로 넘길 객체를 반환. UI·서비스에서 중복 env 검사 제거용.
 */
export function scenarioInheritMergeOptionsFromMessages(
  recentMessagesForScenarioInherit: readonly MessageLikeForScenarioInherit[] | undefined | null
): MergeApiChatContextPayloadOptions | undefined {
  if (!isInheritClientGenerationScenarioEnabled()) return undefined;
  if (!recentMessagesForScenarioInherit || recentMessagesForScenarioInherit.length === 0) {
    return undefined;
  }
  return { recentMessagesForScenarioInherit };
}

/**
 * 프로젝트 대화 등 UI 메시지(`role`·`sender` 혼용·대소문자 불일치)에서 시나리오 상속 옵션 생성.
 * `extractLastAssistantGenerationScenarioMarkdown`이 어시스턴트 턴을 안정적으로 찾도록 역할을 맞춤.
 */
export function scenarioInheritMergeOptionsFromPipelineLikeMessages(
  messages: readonly {
    role?: string;
    sender?: string;
    /** 파일 분석 대화 등 `type: 'user' | 'ai'` 계열 */
    type?: string;
    pipelineExtras?: PipelineMessageExtras | null;
  }[]
): MergeApiChatContextPayloadOptions | undefined {
  if (!messages || messages.length === 0) return undefined;
  const normalized: MessageLikeForScenarioInherit[] = messages.map((m) => {
    const r = String(m.role ?? '').toLowerCase();
    const s = typeof m.sender === 'string' ? m.sender.toLowerCase() : '';
    const typ = String(m.type ?? '').toLowerCase();
    const assistantByRole = r === 'assistant' || r === 'ai';
    const assistantBySender = s === 'ai' || s === 'assistant';
    const assistantByType = typ === 'ai' || typ === 'assistant';
    const isAssistant = assistantByRole || assistantBySender || assistantByType;
    return {
      role: isAssistant ? 'assistant' : 'user',
      sender: m.sender,
      pipelineExtras: m.pipelineExtras,
    };
  });
  return scenarioInheritMergeOptionsFromMessages(normalized);
}

/**
 * UI 메시지(`role`·`content`·선택 `pipelineExtras`) → API용 `ChatTurn`.
 * ChatGPTInterface·Ultimate·ModernChat 등 `conversation_history` 구성 시 공통 사용.
 */
export function toChatTurnWithPipelineExtras(part: {
  role: string;
  content: string;
  pipelineExtras?: PipelineMessageExtras | null;
}): ChatTurn {
  const roleRaw = String(part.role ?? 'user').toLowerCase();
  const role: ChatTurn['role'] =
    roleRaw === 'assistant' || roleRaw === 'ai' ? 'assistant' : 'user';
  const turn: ChatTurn = {
    role,
    content: coerceTrimmedString(part.content, ''),
  };
  if (part.pipelineExtras != null && typeof part.pipelineExtras === 'object') {
    turn.pipelineExtras = part.pipelineExtras;
  }
  return turn;
}

/**
 * `CHAT_POST_PATH` 등 대화 POST 어댑터 공통: `role`을 user|assistant로 정규화(`ai`·대소문자 변형 포함)하고 `pipelineExtras` 유지.
 */
export function normalizeChatTurnsForApiMerge(
  raw: readonly ChatTurn[] | null | undefined
): ChatTurn[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw.map((t) => {
    const roleRaw = String(t.role ?? 'user').toLowerCase();
    const role: ChatTurn['role'] =
      roleRaw === 'assistant' || roleRaw === 'ai' ? 'assistant' : 'user';
    const turn: ChatTurn = {
      role,
      content: String(t.content ?? ''),
    };
    if (t.pipelineExtras !== undefined) {
      turn.pipelineExtras = t.pipelineExtras;
    }
    return turn;
  });
}

/** 명시 merge 옵션이 있으면 그대로, 없으면 정규화된 턴으로 시나리오 상속 옵션 유도 */
export function resolveMergeOptionsFromHistoryAndExplicit(
  normalizedHistory: readonly ChatTurn[],
  explicit?: MergeApiChatContextPayloadOptions
): MergeApiChatContextPayloadOptions | undefined {
  if (explicit !== undefined) return explicit;
  return scenarioInheritMergeOptionsFromMessages(
    normalizedHistory.map((t) => ({ role: t.role, pipelineExtras: t.pipelineExtras }))
  );
}

/**
 * 대화 턴 배열로 통합 context 생성 (Integrated Master 등 Message 타입이 다른 화면용)
 */
export function buildChatPipelineContextFromHistory(
  rawUserMessage: string,
  conversationHistory: ChatTurn[],
  options?: ChatPipelineHistoryOptions
): Record<string, unknown> | undefined {
  if (isUnifiedContextDisabled()) {
    return undefined;
  }

  const trimmed = coerceTrimmedString(rawUserMessage, '');
  if (!trimmed) return undefined;

  const history: ChatTurn[] = conversationHistory
    .map((t) => {
      const role = t.role === 'user' ? 'user' : 'assistant';
      const content = coerceTrimmedString(t.content, '');
      const turn: ChatTurn = { role, content };
      if (t.pipelineExtras !== undefined) {
        turn.pipelineExtras = t.pipelineExtras;
      }
      return turn;
    })
    .filter((t) => t.content.length > 0);

  const featureCtx = buildFeatureContextFromMessage(trimmed);
  const parsedSections = parseQuestionRequirementSections(trimmed);
  const inputIntent = parseInputIntent(trimmed);
  const parsedInput =
    parsedSections.hasBoth || inputIntent.type !== 'general'
      ? {
          question: parsedSections.question || inputIntent.question || undefined,
          requirements: parsedSections.requirements || inputIntent.requirements || undefined,
          intent_type: inputIntent.type,
          intent_confidence: inputIntent.confidence,
        }
      : undefined;

  const rid = coerceTrimmedString(options?.gensparkRouteAgentId ?? '', '');
  const agentRouteSession = rid.length > 0;

  const wantsPipeline =
    !!parsedInput ||
    !!(featureCtx as Record<string, unknown>).prefer_informed_answer ||
    !!(featureCtx as Record<string, unknown>).enable_web_research;

  if (!wantsPipeline && !agentRouteSession) {
    return undefined;
  }

  const ds = resolveDeepseekFlagsForConversation(options?.conversationDeepseek);
  const cgs = coerceTrimmedString(options?.clientGenerationScenario ?? '', '');

  return buildUnifiedChatContext(trimmed, {
    conversationHistory: history,
    useQuestionAnswerPipeline: true,
    agenticGensparkStyle: true,
    qaPipelineAllowEmptyProject: true,
    ...(rid ? { gensparkRouteAgentId: rid } : {}),
    ...(cgs ? { clientGenerationScenario: cgs } : {}),
    deepSeekReviewLayerHints: ds.review,
    pipelineDeepSeekRefine: ds.refine,
    pipelineDeepSeekReasoner: ds.reasoner,
    skipWriterLlmPolish: process.env.REACT_APP_PIPELINE_SKIP_WRITER_POLISH === 'true',
    ...(process.env.REACT_APP_PIPELINE_VERIFIER_REWRITE === 'true'
      ? { pipelineVerifierRewrite: true }
      : {}),
    ...(process.env.REACT_APP_INCLUDE_QA_GENERATION_SCENARIO === 'true'
      ? { includeGenerationScenarioInResponse: true }
      : {}),
  });
}

/** `context` 객체에만 넣어 둔 대화 턴 → `mergeApiChatContextPayload`·스트리밍 본문에서 파이프라인 히스토리로 사용 */
export function coerceChatTurnsFromContextRecord(ctx: Record<string, unknown>): ChatTurn[] {
  const raw = ctx.conversation_history ?? ctx.conversationHistory ?? ctx.messages;
  if (!Array.isArray(raw)) return [];
  const out: ChatTurn[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const r = item as Record<string, unknown>;
    const roleRaw = String(r.role ?? r.sender ?? 'user').toLowerCase();
    const role = roleRaw === 'assistant' || roleRaw === 'ai' ? 'assistant' : 'user';
    const content = coerceTrimmedString(String(r.content ?? r.message ?? r.text ?? ''), '');
    if (content.length > 0) {
      const turn: ChatTurn = { role, content };
      const pe = r.pipelineExtras;
      if (pe != null && typeof pe === 'object') {
        turn.pipelineExtras = pe as PipelineMessageExtras;
      }
      out.push(turn);
    }
  }
  return out;
}

export function buildModernChatPipelineContext(
  rawUserMessage: string,
  recentMessages: Message[],
  options?: ChatPipelineHistoryOptions
): Record<string, unknown> | undefined {
  const conversationHistory: ChatTurn[] = recentMessages.map((m) =>
    toChatTurnWithPipelineExtras({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
      pipelineExtras: m.pipelineExtras,
    })
  );
  const inherited =
    isInheritClientGenerationScenarioEnabled() &&
    !coerceTrimmedString(options?.clientGenerationScenario ?? '', '')
      ? extractLastAssistantGenerationScenarioMarkdown(
          recentMessages.map((m) => ({
            sender: m.sender,
            pipelineExtras: m.pipelineExtras,
          }))
        )
      : undefined;
  const opt: ChatPipelineHistoryOptions = {
    ...options,
    ...(inherited ? { clientGenerationScenario: inherited } : {}),
  };
  return buildChatPipelineContextFromHistory(rawUserMessage, conversationHistory, opt);
}

/**
 * `CHAT_POST_PATH` 본문용: 파이프라인 context + 호출부 context 병합(호출부 우선), quality는 최상위로 분리.
 * `ChatService`·`integratedSystemAPI` 등 공통 사용.
 *
 * @param message **사용자가 입력한 원문**(다중요청 파싱·파이프라인 의도·`original_user_message`에 사용).
 *   API `message` 필드에 `buildUnifiedGenerationPrompt` 결과를 넣는 경우에도, 여기서는 반드시 원문을 넘기세요.
 * 시나리오 상속: 4번째 인자에 `recentMessagesForScenarioInherit` 키가 없으면, 병합된 대화 턴(`conversation_history`·`conversationHistory`·`messages`·3번째 인자)에서 `pipelineExtras`를 읽어 채움. 빈 배열을 넘기면 폴백 없이 상속 끔.
 *
 * `window.location`에 `?id=`·`?type=super_agent`가 있고 context에 `genspark_*`가 없으면 여기서 보강(`unifiedAPI`·`ChatService` 등 모든 merge 호출 공통).
 * 끄려면 `REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT=true`.
 */
export function mergeApiChatContextPayload(
  message: string,
  context?: Record<string, unknown>,
  conversationHistory?: ChatTurn[],
  mergeOptions?: MergeApiChatContextPayloadOptions
): { quality: string; contextForBody?: Record<string, unknown> } {
  const userCtx = applyGensparkRouteContextFromWindowIfMissing(
    context && typeof context === 'object' ? { ...context } : {}
  );
  const routeFromCtx = coerceTrimmedString(
    String(
      userCtx.genspark_route_agent_id ??
        userCtx.gensparkRouteAgentId ??
        userCtx.genspark_reference_agent_id ??
        ''
    ),
    ''
  );
  const explicitHist =
    conversationHistory && conversationHistory.length > 0 ? conversationHistory : undefined;
  const embedded = explicitHist ?? coerceChatTurnsFromContextRecord(userCtx);

  const explicitScenarioUser = coerceTrimmedString(
    String(userCtx.client_generation_scenario ?? userCtx.clientGenerationScenario ?? ''),
    ''
  );
  /** 명시 `recentMessagesForScenarioInherit: []` 는 embedded 폴백 없이 상속 끔 */
  const recentForScenarioInherit: readonly MessageLikeForScenarioInherit[] | undefined =
    mergeOptions != null &&
    Object.prototype.hasOwnProperty.call(mergeOptions, 'recentMessagesForScenarioInherit')
      ? mergeOptions.recentMessagesForScenarioInherit
      : isInheritClientGenerationScenarioEnabled() && embedded.length > 0
        ? embedded.map((t) => ({ role: t.role, pipelineExtras: t.pipelineExtras }))
        : undefined;

  let inheritedScenario: string | undefined;
  if (
    isInheritClientGenerationScenarioEnabled() &&
    recentForScenarioInherit &&
    recentForScenarioInherit.length > 0 &&
    !explicitScenarioUser
  ) {
    inheritedScenario = extractLastAssistantGenerationScenarioMarkdown(recentForScenarioInherit);
  }
  const pipelineCtx = buildChatPipelineContextFromHistory(
    message,
    embedded.length > 0 ? embedded : [],
    {
      ...(routeFromCtx ? { gensparkRouteAgentId: routeFromCtx } : {}),
      ...(inheritedScenario ? { clientGenerationScenario: inheritedScenario } : {}),
      ...(mergeOptions?.conversationDeepseek
        ? { conversationDeepseek: mergeOptions.conversationDeepseek }
        : {}),
    }
  );
  const merged: Record<string, unknown> = {
    ...(pipelineCtx ?? {}),
    ...userCtx,
  };
  if (inheritedScenario) {
    const already = coerceTrimmedString(
      String(merged.client_generation_scenario ?? merged.clientGenerationScenario ?? ''),
      ''
    );
    if (!already) {
      merged.client_generation_scenario = inheritedScenario;
    }
  }
  /* 파이프라인 블록이 없을 때도 번호·불릿 다중 요청·기능 플래그는 전달 (streamingClient·ChatService 등) */
  if (!isUnifiedContextDisabled()) {
    const featureFlags = buildFeatureContextFromMessage(message);
    for (const [key, val] of Object.entries(featureFlags)) {
      if (merged[key] === undefined) {
        merged[key] = val;
      }
    }
    if (featureFlags.multi_request_mode === true) {
      merged.multi_request_mode = true;
      if (Array.isArray(featureFlags.multi_request_items)) {
        merged.multi_request_items = featureFlags.multi_request_items;
      }
      if (!merged.multi_request_adaptation_instruction) {
        merged.multi_request_adaptation_instruction = MULTI_REQUEST_ADAPTATION_INSTRUCTION;
      }
    }
  }

  /* 파이프라인이 비어도 대화·원문은 백엔드가 맥락·다중요청·적응 지시에 쓸 수 있게 전달 */
  const msgTrim = coerceTrimmedString(message, '');
  if (embedded.length > 0 && merged.conversation_history === undefined) {
    merged.conversation_history = embedded;
  }
  if (msgTrim.length > 0 && merged.original_user_message === undefined) {
    merged.original_user_message = msgTrim;
  }

  const rawQ = merged.quality;
  const quality =
    typeof rawQ === 'string' && ['basic', 'enhanced', 'ultimate'].includes(rawQ)
      ? rawQ
      : 'enhanced';
  const contextForBody = { ...merged };
  delete contextForBody.quality;
  if (Object.keys(contextForBody).length === 0) {
    return { quality };
  }
  return { quality, contextForBody };
}
