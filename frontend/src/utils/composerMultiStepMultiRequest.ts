import { getComposerMultiRequestItems } from './composerMultiRequestProgress';

/** `REACT_APP_COMPOSER_MULTI_STEP_MULTI_REQUEST=true` — 항목별 multiStepResponseGenerator (순차 API보다 우선순위 낮음) */
export function isComposerMultiStepMultiRequestEnabled(): boolean {
  return process.env.REACT_APP_COMPOSER_MULTI_STEP_MULTI_REQUEST === 'true';
}

export function getComposerMultiStepMultiRequestItems(userText: string): string[] {
  return getComposerMultiRequestItems(userText);
}

/**
 * 순차 API(`REACT_APP_COMPOSER_SEQUENTIAL_*`) 또는 SSE 순차가 켜져 있으면 false.
 * 다중 요청 UI 체크리스트는 그대로 동작하며, 응답 생성만 항목별 다단계 전략을 탄다.
 */
export function shouldRunComposerMultiStepMultiRequest(
  items: string[],
  options: {
    multiRequestMode: boolean;
    runSequentialMultiRequest: boolean;
    useSequentialStream: boolean;
  },
): boolean {
  if (!isComposerMultiStepMultiRequestEnabled()) return false;
  if (!options.multiRequestMode || items.length < 2) return false;
  if (options.runSequentialMultiRequest || options.useSequentialStream) return false;
  return true;
}

export function shouldBypassStreamForMultiStepMultiRequest(
  items: string[],
  options: {
    multiRequestMode: boolean;
    runSequentialMultiRequest: boolean;
    useSequentialStream: boolean;
  },
): boolean {
  return shouldRunComposerMultiStepMultiRequest(items, options);
}
