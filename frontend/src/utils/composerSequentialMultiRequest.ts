import { getComposerMultiRequestItems } from './composerMultiRequestProgress';

/**
 * ChatGPTInterface 다중 요청 순차 API.
 * 다단계 전략(`multiStepResponseGenerator`)과 UI 체크리스트는 별 경로 — 후자는 `multi_request_*` 컨텍스트만 복잡도 분석에 공유.
 */
/** `REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST=true` — 다중 요청을 항목별 순차 호출 */
export function isComposerSequentialMultiRequestEnabled(): boolean {
  return process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST === 'true';
}

/** `REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST_STREAM=true` — 순차 호출 시 항목별 SSE(스트리밍) 사용 */
export function isComposerSequentialMultiRequestStreamEnabled(): boolean {
  return process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST_STREAM === 'true';
}

export type SequentialMultiRequestPriorAnswer = {
  item: string;
  answer: string;
};

export function getComposerSequentialMultiRequestItems(userText: string): string[] {
  return getComposerMultiRequestItems(userText);
}

export function shouldRunComposerSequentialMultiRequest(
  items: string[],
  options: { multiRequestMode: boolean },
): boolean {
  if (!isComposerSequentialMultiRequestEnabled()) return false;
  if (!options.multiRequestMode) return false;
  return items.length >= 2;
}

/**
 * 스트리밍이 켜져 있어도 순차 다중 요청이면 비스트리밍 항목별 호출로 우회합니다.
 */
export function shouldBypassStreamingForSequentialMultiRequest(
  items: string[],
  options: { multiRequestMode: boolean },
): boolean {
  if (isComposerSequentialMultiRequestStreamEnabled()) return false;
  return shouldRunComposerSequentialMultiRequest(items, options);
}

export function shouldUseSequentialMultiRequestStream(
  items: string[],
  options: { multiRequestMode: boolean; streamingSupported: boolean },
): boolean {
  return (
    options.streamingSupported &&
    isComposerSequentialMultiRequestStreamEnabled() &&
    shouldRunComposerSequentialMultiRequest(items, options)
  );
}

/** 항목별 API 호출용 사용자 메시지(이전 항목 답변을 맥락으로 포함) */
export function buildSequentialMultiRequestItemMessage(
  item: string,
  index: number,
  total: number,
  priorAnswers: SequentialMultiRequestPriorAnswer[],
): string {
  const header =
    `[다중 요청 ${index + 1}/${total}] 아래 항목만 처리하세요. 다른 항목은 이미 처리되었거나 이후에 처리됩니다.\n\n${item}`;
  if (!priorAnswers.length) return header;
  const prior = priorAnswers
    .map((p, i) => `### ${i + 1}. ${p.item}\n${p.answer}`)
    .join('\n\n');
  return `${header}\n\n---\n이미 완료된 항목:\n${prior}`;
}

/** 순차 호출 결과를 하나의 어시스턴트 메시지 본문으로 합칩니다. */
export function mergeSequentialMultiRequestAnswers(items: string[], answers: string[]): string {
  return items
    .map((item, i) => {
      const body = coerceAnswer(answers[i]);
      return `## ${i + 1}. ${item}\n\n${body}`;
    })
    .join('\n\n---\n\n');
}

function coerceAnswer(raw: string | undefined): string {
  const t = typeof raw === 'string' ? raw.trim() : '';
  return t || '(응답 없음)';
}
