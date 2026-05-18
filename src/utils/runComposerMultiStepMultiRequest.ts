import { generateMultiStepResponse } from '../services/multiStepResponseGenerator';
import { coerceTrimmedString } from './chatInputUtils';
import {
  buildSequentialMultiRequestItemMessage,
  mergeSequentialMultiRequestAnswers,
  type SequentialMultiRequestPriorAnswer,
} from './composerSequentialMultiRequest';

export type RunComposerMultiStepMultiRequestArgs = {
  items: string[];
  buildItemContext: (index: number) => Record<string, unknown>;
  buildItemQuestion?: (
    index: number,
    priorAnswers: SequentialMultiRequestPriorAnswer[],
  ) => string;
  onLiveIndex: (index: number) => void;
  onPartialProgress?: (partialDisplay: string) => void;
};

/** 다중 요청 항목별 `generateMultiStepResponse` 순차 호출 후 병합 */
export async function runComposerMultiStepMultiRequest(
  args: RunComposerMultiStepMultiRequestArgs,
): Promise<{ merged: string; answers: string[] }> {
  const prior: SequentialMultiRequestPriorAnswer[] = [];
  const answers: string[] = [];
  const { items } = args;

  for (let i = 0; i < items.length; i++) {
    args.onLiveIndex(i);
    const question = args.buildItemQuestion
      ? args.buildItemQuestion(i, prior)
      : buildSequentialMultiRequestItemMessage(items[i], i, items.length, prior);
    const ctx = args.buildItemContext(i);
    const stepResult = await generateMultiStepResponse(question, ctx);
    const part = coerceTrimmedString(stepResult.finalResponse, '') || '(응답 없음)';
    answers.push(part);
    prior.push({ item: items[i], answer: part });
    if (i < items.length - 1 && args.onPartialProgress) {
      const partial = mergeSequentialMultiRequestAnswers(items.slice(0, i + 1), answers);
      args.onPartialProgress(`${partial}\n\n_(항목 ${i + 2}/${items.length} 다단계 처리 중…)_`);
    }
  }

  return {
    merged: mergeSequentialMultiRequestAnswers(items, answers),
    answers,
  };
}
