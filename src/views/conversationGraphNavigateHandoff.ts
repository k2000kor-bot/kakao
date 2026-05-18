import {
  CONVERSATION_GRAPH_AUTO_CREATE_STATE_KEY,
  CONVERSATION_GRAPH_PASTE_STATE_KEY,
} from '../config/routes';

export { CONVERSATION_GRAPH_PASTE_STATE_KEY, CONVERSATION_GRAPH_AUTO_CREATE_STATE_KEY };

/** navigate 직후 리마운트 대비 — 1회성 붙여넣기 백업 */
export const CONVERSATION_GRAPH_HANDOFF_STORAGE_KEY = 'corbu.conversationGraph.handoffPaste';

export function peekHandoffPasteFromSession(): string {
  try {
    return sessionStorage.getItem(CONVERSATION_GRAPH_HANDOFF_STORAGE_KEY)?.trim() ?? '';
  } catch {
    return '';
  }
}

export function stashHandoffPasteToSession(pasteText: string): void {
  try {
    sessionStorage.setItem(CONVERSATION_GRAPH_HANDOFF_STORAGE_KEY, pasteText);
  } catch {
    /* storage unavailable */
  }
}

export function consumeHandoffPasteFromSession(): string {
  const text = peekHandoffPasteFromSession();
  if (!text) return '';
  try {
    sessionStorage.removeItem(CONVERSATION_GRAPH_HANDOFF_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return text;
}

export function buildConversationGraphPasteNavState(
  pasteText: string,
  autoCreateGraph = false,
): Record<string, unknown> {
  const state: Record<string, unknown> = {
    [CONVERSATION_GRAPH_PASTE_STATE_KEY]: pasteText,
  };
  if (autoCreateGraph) {
    state[CONVERSATION_GRAPH_AUTO_CREATE_STATE_KEY] = true;
  }
  return state;
}

export function readConversationGraphHandoffFromLocationState(
  state: unknown,
): { pasteText: string; autoCreateGraph: boolean } | null {
  if (!state || typeof state !== 'object' || Array.isArray(state)) return null;
  const s = state as Record<string, unknown>;
  const raw = s[CONVERSATION_GRAPH_PASTE_STATE_KEY];
  if (typeof raw !== 'string' || !raw.trim()) return null;
  return {
    pasteText: raw,
    autoCreateGraph: s[CONVERSATION_GRAPH_AUTO_CREATE_STATE_KEY] === true,
  };
}

/** handoff 키만 제거한 나머지 state (다른 navigation state 보존) */
export function stripConversationGraphHandoffKeys(
  state: Record<string, unknown>,
): Record<string, unknown> | undefined {
  const next = { ...state };
  delete next[CONVERSATION_GRAPH_PASTE_STATE_KEY];
  delete next[CONVERSATION_GRAPH_AUTO_CREATE_STATE_KEY];
  const keys = Object.keys(next).filter((k) => next[k] !== undefined && next[k] !== null);
  return keys.length ? next : undefined;
}
