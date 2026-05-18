import {
  coerceTrimmedString,
  parseMultiAskItems,
  type AssistantGenerationPhase,
} from './chatInputUtils';

export const COMPOSER_MULTI_REQUEST_MAX_ITEMS = 8;

export type ComposerMultiRequestProgressState = {
  items: string[];
  activeIndex: number;
};

/** 번호·불릿 등으로 나뉜 다중 요청 항목 (2개 이상일 때만) */
export function getComposerMultiRequestItems(userText: string): string[] {
  const multi = parseMultiAskItems(coerceTrimmedString(userText, ''));
  if (!multi.hasMultiple || multi.items.length < 2) return [];
  return multi.items
    .map((s) => coerceTrimmedString(s, ''))
    .filter((s) => s.length >= 2)
    .slice(0, COMPOSER_MULTI_REQUEST_MAX_ITEMS);
}

/** 생성 단계·경과 시간에 따라 현재 처리 중인 항목 인덱스 추정 */
export function computeComposerMultiRequestActiveIndex(
  itemsCount: number,
  phase: AssistantGenerationPhase | null,
  elapsedMs: number,
): number {
  if (itemsCount < 2) return 0;
  const last = itemsCount - 1;
  if (phase === 'analyze' || phase === 'outline') return 0;
  if (phase === 'draft') return Math.min(last, Math.max(1, Math.floor(itemsCount / 2)));
  if (phase === 'crosscheck') return Math.min(last, Math.max(1, itemsCount - 2));
  if (phase === 'verify') return last;
  const tick = Math.floor(Math.max(0, elapsedMs) / 2800);
  return Math.min(last, tick);
}

export function buildComposerMultiRequestProgressState(
  userText: string,
  phase: AssistantGenerationPhase | null,
  elapsedMs: number,
): ComposerMultiRequestProgressState | null {
  const items = getComposerMultiRequestItems(userText);
  if (items.length < 2) return null;
  return {
    items,
    activeIndex: computeComposerMultiRequestActiveIndex(items.length, phase, elapsedMs),
  };
}
