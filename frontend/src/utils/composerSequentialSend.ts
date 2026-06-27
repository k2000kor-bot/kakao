import {
  shouldBypassStreamForMultiStepMultiRequest,
  shouldRunComposerMultiStepMultiRequest,
} from './composerMultiStepMultiRequest';
import {
  buildSequentialMultiRequestItemMessage,
  getComposerSequentialMultiRequestItems,
  shouldBypassStreamingForSequentialMultiRequest,
  shouldRunComposerSequentialMultiRequest,
  shouldUseSequentialMultiRequestStream,
  type SequentialMultiRequestPriorAnswer,
} from './composerSequentialMultiRequest';

export type ComposerSequentialSendFlags = {
  items: string[];
  multiRequestModeActive: boolean;
  runSequentialMultiRequest: boolean;
  bypassStreamForSequentialMultiRequest: boolean;
  useSequentialStream: boolean;
  runMultiStepMultiRequest: boolean;
  bypassStreamForMultiStepMultiRequest: boolean;
};

export function getComposerSequentialSendFlags(
  trimmedInput: string,
  featureCtx: Record<string, unknown>,
  streamingSupported: boolean,
): ComposerSequentialSendFlags {
  if (featureCtx.conversation_graph_analysis === true) {
    return {
      items: [],
      multiRequestModeActive: false,
      runSequentialMultiRequest: false,
      bypassStreamForSequentialMultiRequest: false,
      useSequentialStream: false,
      runMultiStepMultiRequest: false,
      bypassStreamForMultiStepMultiRequest: false,
    };
  }

  const items = getComposerSequentialMultiRequestItems(trimmedInput);
  const multiRequestModeActive = !!featureCtx.multi_request_mode;
  const runSequentialMultiRequest = shouldRunComposerSequentialMultiRequest(items, {
    multiRequestMode: multiRequestModeActive,
  });
  const useSequentialStream = shouldUseSequentialMultiRequestStream(items, {
    multiRequestMode: multiRequestModeActive,
    streamingSupported,
  });
  const dispatchOpts = {
    multiRequestMode: multiRequestModeActive,
    runSequentialMultiRequest,
    useSequentialStream,
  };
  return {
    items,
    multiRequestModeActive,
    runSequentialMultiRequest,
    bypassStreamForSequentialMultiRequest: shouldBypassStreamingForSequentialMultiRequest(items, {
      multiRequestMode: multiRequestModeActive,
    }),
    useSequentialStream,
    runMultiStepMultiRequest: shouldRunComposerMultiStepMultiRequest(items, dispatchOpts),
    bypassStreamForMultiStepMultiRequest: shouldBypassStreamForMultiStepMultiRequest(
      items,
      dispatchOpts,
    ),
  };
}

export type BuildComposerSequentialItemOutboundDeps = {
  items: string[];
  buildStructuredGenerationPrompt: (
    input: string,
    opts: { variationInstruction: string; styleLearningInstruction: string },
  ) => string;
  variationInstruction: string;
  styleLearningInstruction: string;
  buildMessageToSendForChat: (
    requestMessage: string,
    effectiveInput: string,
    projectContext?: { name: string; instructions?: string },
  ) => Promise<string | { messageToSend: string }>;
  projectContext?: { name: string; instructions?: string };
  onBuildError?: (index: number, error: unknown) => void;
};

export function createComposerSequentialItemOutboundBuilder(
  deps: BuildComposerSequentialItemOutboundDeps,
): (index: number, priorAnswers: SequentialMultiRequestPriorAnswer[]) => Promise<string> {
  return async (index, priorAnswers) => {
    const itemPrompt = buildSequentialMultiRequestItemMessage(
      deps.items[index],
      index,
      deps.items.length,
      priorAnswers,
    );
    const itemRequestMessage = deps.buildStructuredGenerationPrompt(itemPrompt, {
      variationInstruction: deps.variationInstruction,
      styleLearningInstruction: deps.styleLearningInstruction,
    });
    try {
      const raw = await deps.buildMessageToSendForChat(
        itemRequestMessage,
        itemPrompt,
        deps.projectContext,
      );
      return typeof raw === 'string' ? raw : raw.messageToSend;
    } catch (err) {
      deps.onBuildError?.(index, err);
      return itemRequestMessage;
    }
  };
}
