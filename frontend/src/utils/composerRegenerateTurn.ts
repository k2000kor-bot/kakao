import { coerceTrimmedString } from './chatInputUtils';

/** 어시스턴트 메시지 재생성 — 직전 사용자 턴 텍스트·잘라낼 인덱스 */
export function resolveComposerRegenerateUserTurn<
  T extends {
    id: string;
    content: string;
    generationPlaceholder?: boolean;
    role?: string;
    type?: string;
  },
>(
  messages: T[],
  assistantMessageId: string,
): { userText: string; truncateToIndex: number; assistantMessageIndex: number } | null {
  const messageKind = (m: { role?: string; type?: string }): string | undefined => {
    const role = m.role;
    const msgType = m.type;
    return typeof role === 'string' && role ? role : typeof msgType === 'string' ? msgType : undefined;
  };
  const idx = messages.findIndex((m) => m.id === assistantMessageId);
  if (idx < 0) return null;
  const target = messages[idx];
  const assistantKinds = new Set(['assistant', 'ai']);
  const userKinds = new Set(['user']);
  const targetKind = messageKind(target);
  if (!targetKind || !assistantKinds.has(targetKind) || target.generationPlaceholder) return null;
  let userIdx = idx - 1;
  while (userIdx >= 0) {
    const kind = messageKind(messages[userIdx]);
    if (kind && userKinds.has(kind)) break;
    userIdx -= 1;
  }
  if (userIdx < 0) return null;
  const userText = coerceTrimmedString(messages[userIdx].content, '');
  const msgFiles = (messages[userIdx] as { files?: unknown[] }).files;
  const hasFiles = Array.isArray(msgFiles) && msgFiles.length > 0;
  if (!userText && !hasFiles) {
    return null;
  }
  return {
    userText: userText || '(파일만 업로드됨)',
    truncateToIndex: userIdx,
    assistantMessageIndex: idx,
  };
}
