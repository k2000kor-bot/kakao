import type { StreamingOptions } from './streamingClient';
import {
  buildSequentialMultiRequestItemMessage,
  mergeSequentialMultiRequestAnswers,
  type SequentialMultiRequestPriorAnswer,
} from './composerSequentialMultiRequest';

export type RunComposerSequentialMultiRequestStreamArgs = {
  items: string[];
  conversationId: string;
  signal?: AbortSignal;
  buildItemOutboundMessage: (
    index: number,
    priorAnswers: SequentialMultiRequestPriorAnswer[],
  ) => Promise<string>;
  buildItemStreamContext: (index: number) => Record<string, unknown>;
  buildStreamRequestBody: (context: Record<string, unknown>) => Record<string, unknown>;
  streamMessage: (
    message: string,
    sessionId: string,
    options: StreamingOptions,
  ) => Promise<string>;
  onLiveIndex: (index: number) => void;
  onDisplayContent: (content: string) => void;
  streamOptionsBase?: Pick<
    StreamingOptions,
    'messagesForScenarioInherit' | 'mergeApiChatContextOptions'
  >;
  onStreamComplete?: StreamingOptions['onComplete'];
  onStreamMetadata?: StreamingOptions['onMetadata'];
};

/** 다중 요청 항목별 SSE 순차 호출 후 병합 본문 반환 */
export async function runComposerSequentialMultiRequestStream(
  args: RunComposerSequentialMultiRequestStreamArgs,
): Promise<{ merged: string; answers: string[] }> {
  const prior: SequentialMultiRequestPriorAnswer[] = [];
  const answers: string[] = [];
  const { items } = args;

  for (let i = 0; i < items.length; i++) {
    args.onLiveIndex(i);
    const outbound = await args.buildItemOutboundMessage(i, prior);
    const ctx = args.buildItemStreamContext(i);
    let itemAccum = '';
    const pushDisplay = () => {
      const partialItems = items.slice(0, i + 1);
      const partialAnswers = [...answers, itemAccum];
      args.onDisplayContent(mergeSequentialMultiRequestAnswers(partialItems, partialAnswers));
    };

    const fullText = await args.streamMessage(outbound, args.conversationId, {
      signal: args.signal,
      ...args.streamOptionsBase,
      requestBody: args.buildStreamRequestBody(ctx),
      onChunk: (chunk) => {
        itemAccum += chunk;
        pushDisplay();
      },
      onMetadata: (meta) => {
        args.onStreamMetadata?.(meta);
      },
    });

    const answer = typeof fullText === 'string' && fullText.trim() ? fullText : itemAccum;
    answers.push(answer);
    prior.push({ item: items[i], answer });
    args.onDisplayContent(mergeSequentialMultiRequestAnswers(items.slice(0, i + 1), answers));
  }

  const merged = mergeSequentialMultiRequestAnswers(items, answers);
  if (args.onStreamComplete) {
    await args.onStreamComplete(merged, undefined);
  }
  return { merged, answers };
}

export function buildSequentialMultiRequestItemContext(
  baseContext: Record<string, unknown>,
  items: string[],
  index: number,
): Record<string, unknown> {
  return {
    ...baseContext,
    multi_request_sequential: true,
    multi_request_current_index: index,
    multi_request_current_item: items[index],
    multi_request_items: items,
    multi_request_mode: true,
  };
}

export { buildSequentialMultiRequestItemMessage };
