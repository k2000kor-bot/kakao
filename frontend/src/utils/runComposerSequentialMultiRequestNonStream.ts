import {
  mergeSequentialMultiRequestAnswers,
  type SequentialMultiRequestPriorAnswer,
} from './composerSequentialMultiRequest';

export type RunComposerSequentialMultiRequestNonStreamArgs<TResponse> = {
  items: string[];
  buildItemOutboundMessage: (
    index: number,
    priorAnswers: SequentialMultiRequestPriorAnswer[],
  ) => Promise<string>;
  buildItemContext: (index: number) => Record<string, unknown>;
  postChat: (outboundMessage: string, context: Record<string, unknown>) => Promise<TResponse>;
  extractValidContent: (response: TResponse) => string;
  onLiveIndex: (index: number) => void;
  /** 항목 완료 후 다음 항목 처리 전 UI 갱신(비스트리밍 버블 등) */
  onPartialProgress?: (partialDisplay: string) => void;
};

export type RunComposerSequentialMultiRequestNonStreamResult<TResponse> = {
  merged: string;
  answers: string[];
  lastResponse: TResponse;
};

/** 다중 요청 항목별 비스트리밍 API 순차 호출 */
export async function runComposerSequentialMultiRequestNonStream<TResponse>(
  args: RunComposerSequentialMultiRequestNonStreamArgs<TResponse>,
): Promise<RunComposerSequentialMultiRequestNonStreamResult<TResponse>> {
  const prior: SequentialMultiRequestPriorAnswer[] = [];
  const answers: string[] = [];
  let lastResponse!: TResponse;

  for (let i = 0; i < args.items.length; i++) {
    args.onLiveIndex(i);
    const outbound = await args.buildItemOutboundMessage(i, prior);
    const ctx = args.buildItemContext(i);
    const response = await args.postChat(outbound, ctx);
    lastResponse = response;
    const part = args.extractValidContent(response);
    answers.push(part);
    prior.push({ item: args.items[i], answer: part });
    if (i < args.items.length - 1 && args.onPartialProgress) {
      const partial = mergeSequentialMultiRequestAnswers(args.items.slice(0, i + 1), answers);
      args.onPartialProgress(`${partial}\n\n_(항목 ${i + 2}/${args.items.length} 처리 중…)_`);
    }
  }

  return {
    merged: mergeSequentialMultiRequestAnswers(args.items, answers),
    answers,
    lastResponse,
  };
}
