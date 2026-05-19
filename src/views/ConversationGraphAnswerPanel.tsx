import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GraphAiAnalysis, ParticipantAiInsight } from './conversationGraphAiAnalyzer';
import {
  buildGraphAnswerChatContext,
  buildParticipantAnswerPreset,
  generateGraphAnswerViaChat,
  GRAPH_ANSWER_PROMPT_PRESETS,
  isCreateGraphAnswerRequest,
  prepareGraphAnswerGenerationMessage,
} from './conversationGraphAnswerGeneration';
import { coerceTrimmedString, type AssistantGenerationPhase } from '../utils/chatInputUtils';
import { showToast } from '../utils/toast';
import {
  copyGraphAnswerToClipboard,
  downloadGraphAnswerMarkdown,
  downloadGraphAnswerText,
} from './conversationGraphAnswerExport';
import { downloadGraphFullReportMarkdown } from './conversationGraphFullReportExport';
import { isStreamingSupported } from '../utils/streamingClient';
import type { RelationshipGraphData } from '../services/conversationGraphService';
import type { ExpertLayerId } from './conversationGraphExpertLayers';
import { GensparkGenerationStatus } from '../components/genspark/GensparkGenerationStatus';
import { GensparkAnswerMarkdown } from '../components/genspark/gensparkAnswerMarkdown';
import { TEST_IDS } from '../constants/testIds';
import { CREATE_GRAPH_ANSWER_PRESET } from './conversationGraphAnswerIntent';
import { extractMermaidBlocksFromAnswer } from './conversationGraphMermaidExtract';
import { ConversationGraphMermaidBlock } from './ConversationGraphMermaidBlock';

export type GraphAnswerEnsureGraphResult = {
  graph: RelationshipGraphData;
  analysis: GraphAiAnalysis;
  narrative: string;
};

export type ConversationGraphAnswerPanelProps = {
  analysis: GraphAiAnalysis;
  narrative: string;
  narrativeSource?: 'heuristic' | 'ai';
  analysisSummary?: string;
  graphSnapshotText?: string;
  conversationTitle?: string;
  periodLabel?: string;
  selectedInsight?: ParticipantAiInsight | null;
  graph?: RelationshipGraphData | null;
  expertLayer?: ExpertLayerId;
  /** 붙여넣은 대화 원문(서버 관계도 없을 때 답변·관계도 생성 맥락) */
  rawConversationText?: string;
  /** 「관계도 만들어줘」 등 요청 시 서버 관계도를 먼저 생성 */
  onEnsureGraphBeforeAnswer?: () => Promise<GraphAnswerEnsureGraphResult | null>;
  /** 증가할 때마다 기본 보고서 프리셋으로 자동 생성 시도 */
  autoGenerateTrigger?: number;
  /** 채팅 handoff 등: 관계도 만들기 프리셋으로 자동 생성 */
  handoffAutoCreateTrigger?: number;
  autoGenerateAnswer?: boolean;
  onAutoGenerateAnswerChange?: (value: boolean) => void;
  useStreamAnswer?: boolean;
  onUseStreamAnswerChange?: (value: boolean) => void;
  onOpenInChat: (draft: string, context: Record<string, unknown>, autoSend: boolean) => void;
};

export function ConversationGraphAnswerPanel({
  analysis,
  narrative,
  narrativeSource = 'heuristic',
  analysisSummary = '',
  graphSnapshotText = '',
  conversationTitle,
  periodLabel,
  selectedInsight,
  graph,
  expertLayer = 'all',
  rawConversationText = '',
  onEnsureGraphBeforeAnswer,
  autoGenerateTrigger = 0,
  handoffAutoCreateTrigger = 0,
  autoGenerateAnswer = false,
  onAutoGenerateAnswerChange,
  useStreamAnswer = true,
  onUseStreamAnswerChange,
  onOpenInChat,
}: ConversationGraphAnswerPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [generatedAnswer, setGeneratedAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<AssistantGenerationPhase | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastAutoTriggerRef = useRef(0);
  const lastHandoffAutoCreateRef = useRef(0);

  const promptPresets = useMemo(() => {
    const base = [...GRAPH_ANSWER_PROMPT_PRESETS];
    if (selectedInsight) {
      base.unshift(buildParticipantAnswerPreset(selectedInsight));
    }
    return base;
  }, [selectedInsight]);

  const buildContextForMessage = useCallback(
    (
      userMessage: string,
      overrides?: Partial<{
        analysis: GraphAiAnalysis;
        narrative: string;
        graph: RelationshipGraphData | null;
      }>,
    ) =>
      buildGraphAnswerChatContext({
        analysis: overrides?.analysis ?? analysis,
        narrative: overrides?.narrative ?? narrative,
        conversationTitle,
        periodLabel,
        selectedInsight,
        graph: overrides?.graph !== undefined ? overrides.graph : graph,
        userMessage,
        expertLayer,
        rawConversationText,
      }),
    [
      analysis,
      narrative,
      conversationTitle,
      periodLabel,
      selectedInsight,
      graph,
      expertLayer,
      rawConversationText,
    ],
  );

  const defaultPresetPrompt = useMemo(() => {
    if (selectedInsight) {
      return buildParticipantAnswerPreset(selectedInsight).prompt;
    }
    return (
      GRAPH_ANSWER_PROMPT_PRESETS.find((p) => p.id === 'report')?.prompt ??
      GRAPH_ANSWER_PROMPT_PRESETS[0]?.prompt ??
      ''
    );
  }, [selectedInsight]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const cancelGenerate = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
    setGenerationPhase(null);
  }, []);

  const runGenerate = useCallback(
    async (message: string) => {
      const trimmed = coerceTrimmedString(message, '');
      if (!trimmed) return;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setGeneratedAnswer('');
      setGenerationPhase(null);

      let activeAnalysis = analysis;
      let activeNarrative = narrative;
      let activeGraph = graph ?? null;
      const hasGraphNodes = (activeGraph?.nodes ?? []).length > 0;

      if (isCreateGraphAnswerRequest(trimmed) && !hasGraphNodes && onEnsureGraphBeforeAnswer) {
        setGenerationPhase('analyze');
        try {
          const ensured = await onEnsureGraphBeforeAnswer();
          if (controller.signal.aborted) return;
          if (ensured) {
            activeGraph = ensured.graph;
            activeAnalysis = ensured.analysis;
            activeNarrative = ensured.narrative;
            showToast('관계도를 생성했습니다. 이어서 답변을 작성합니다.', 'success');
          }
        } catch {
          if (controller.signal.aborted) return;
          showToast('관계도 생성에 실패했습니다. 대화를 붙여넣거나 업로드한 뒤 다시 시도해 주세요.', 'error');
        }
      }

      const { apiMessage } = prepareGraphAnswerGenerationMessage(
        trimmed,
        (activeGraph?.nodes ?? []).length > 0,
      );
      const ctx = buildContextForMessage(trimmed, {
        analysis: activeAnalysis,
        narrative: activeNarrative,
        graph: activeGraph,
      });
      try {
        const stream = useStreamAnswer && isStreamingSupported();
        const text = await generateGraphAnswerViaChat(apiMessage, ctx, {
          signal: controller.signal,
          preferStream: stream,
          onPhase: (phase) => setGenerationPhase(phase),
          onChunk: (_accumulated, displayText) => {
            if (displayText) setGeneratedAnswer(displayText);
          },
        });
        if (controller.signal.aborted) return;
        if (text) {
          setGeneratedAnswer(text);
          setGenerationPhase('verify');
          showToast('답변을 생성했습니다.', 'success');
          return;
        }
        setGeneratedAnswer(
          '답변을 생성하지 못했습니다. 백엔드 연결 후 다시 시도하거나 「대화에서 답변 생성」을 이용해 주세요.',
        );
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
        setLoading(false);
        setGenerationPhase(null);
      }
    },
    [analysis, narrative, graph, buildContextForMessage, onEnsureGraphBeforeAnswer, useStreamAnswer],
  );

  const handleGenerate = useCallback(() => {
    void runGenerate(prompt);
  }, [prompt, runGenerate]);

  const handleOpenInChat = useCallback(
    (autoSend: boolean) => {
      const draft =
        coerceTrimmedString(prompt, '') ||
        promptPresets[0]?.prompt ||
        '관계도 분석을 바탕으로 요약 보고서를 작성해 주세요.';
      onOpenInChat(draft, buildContextForMessage(draft), autoSend);
    },
    [prompt, buildContextForMessage, onOpenInChat, promptPresets],
  );

  useEffect(() => {
    if (autoGenerateTrigger <= 0 || autoGenerateTrigger === lastAutoTriggerRef.current) return;
    lastAutoTriggerRef.current = autoGenerateTrigger;
    if (!defaultPresetPrompt) return;
    setPrompt(defaultPresetPrompt);
    void runGenerate(defaultPresetPrompt);
  }, [autoGenerateTrigger, defaultPresetPrompt, runGenerate]);

  useEffect(() => {
    if (handoffAutoCreateTrigger <= 0 || handoffAutoCreateTrigger === lastHandoffAutoCreateRef.current) {
      return;
    }
    lastHandoffAutoCreateRef.current = handoffAutoCreateTrigger;
    setPrompt(CREATE_GRAPH_ANSWER_PRESET.prompt);
    void runGenerate(CREATE_GRAPH_ANSWER_PRESET.prompt);
  }, [handoffAutoCreateTrigger, runGenerate]);

  const parsedAnswer = useMemo(
    () => (generatedAnswer ? extractMermaidBlocksFromAnswer(generatedAnswer) : { body: '', diagrams: [] }),
    [generatedAnswer],
  );

  const showPipelineStatus = loading && !generatedAnswer;
  const isGenerationFailureMessage = generatedAnswer.startsWith('답변을 생성하지 못했습니다');
  const showStreamingPartial =
    loading && !!generatedAnswer && !isGenerationFailureMessage;

  return (
    <div
      className="bw-mt-md bw-features-card"
      data-testid={TEST_IDS.CONVERSATION_GRAPH_ANSWER_PANEL}
      role="region"
      aria-label="관계도 답변 생성"
      aria-busy={loading}
      style={{ padding: 12 }}
    >
      <p className="bw-label-block" style={{ margin: 0 }}>
        답변 생성
      </p>
      <p className="bw-detail-meta-text bw-mt-sm">
        관계도·AI 성향 분석을 통합 대화 API 맥락에 담아 보고서·요약·제안 문장을 생성합니다.
        「관계도를 만들어줘」처럼 요청하면 붙여넣은 대화로 서버 관계도를 만든 뒤, 참여자·연결 표와 Mermaid
        다이어그램을 답변으로 작성합니다.
      </p>
      {selectedInsight ? (
        <p className="bw-detail-meta-text bw-mt-sm" data-testid="conversation-graph-answer-selected-hint">
          선택 참여자: <strong>{selectedInsight.label}</strong> ({selectedInsight.dominantStance} ·{' '}
          {selectedInsight.exchangeRole}) — 「{selectedInsight.label} 분석」 프리셋을 사용할 수 있습니다.
        </p>
      ) : null}

      <div
        className="bw-mt-sm"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
        data-testid="conversation-graph-answer-presets"
      >
        {promptPresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="bw-btn-secondary"
            style={{ fontSize: 12 }}
            data-testid={`conversation-graph-answer-preset-${preset.id}`}
            onClick={() => setPrompt(preset.prompt)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <label className="bw-label-block bw-mt-sm" htmlFor="conversation-graph-answer-prompt">
        생성할 내용 (질문·지시)
      </label>
      <textarea
        id="conversation-graph-answer-prompt"
        className="bw-input"
        rows={3}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            if (!loading && coerceTrimmedString(prompt, '')) {
              void handleGenerate();
            }
          }
        }}
        placeholder="예: 관계도를 만들어 주세요 / 참여자별 역할과 갈등 축 보고서 (Ctrl+Enter로 생성)"
        style={{ width: '100%', maxWidth: 560, marginTop: 6 }}
        data-testid="conversation-graph-answer-prompt"
      />

      <div className="bw-mt-sm" style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {isStreamingSupported() ? (
          <label
            className="bw-detail-meta-text"
            style={{ display: 'flex', gap: 8, alignItems: 'center' }}
            data-testid="conversation-graph-answer-stream-label"
          >
            <input
              type="checkbox"
              checked={useStreamAnswer}
              onChange={(e) => onUseStreamAnswerChange?.(e.target.checked)}
              data-testid="conversation-graph-answer-stream"
            />
            스트리밍으로 실시간 표시
          </label>
        ) : null}
        {onAutoGenerateAnswerChange ? (
          <label
            className="bw-detail-meta-text"
            style={{ display: 'flex', gap: 8, alignItems: 'center' }}
            data-testid="conversation-graph-answer-auto-label"
          >
            <input
              type="checkbox"
              checked={autoGenerateAnswer}
              onChange={(e) => onAutoGenerateAnswerChange(e.target.checked)}
              data-testid="conversation-graph-answer-auto"
            />
            관계도 생성 후 보고서 답변 자동 생성
          </label>
        ) : null}
      </div>

      <div className="bw-mt-sm" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button
          type="button"
          className="bw-btn-primary"
          onClick={() => void handleGenerate()}
          disabled={loading || !coerceTrimmedString(prompt, '')}
          data-testid={TEST_IDS.CONVERSATION_GRAPH_ANSWER_GENERATE}
        >
          {loading ? '답변 생성 중…' : '답변 생성'}
        </button>
        {loading ? (
          <button
            type="button"
            className="bw-btn-secondary"
            onClick={cancelGenerate}
            data-testid="conversation-graph-answer-cancel"
          >
            취소
          </button>
        ) : null}
        <button
          type="button"
          className="bw-btn-secondary"
          onClick={() => handleOpenInChat(false)}
          disabled={loading}
          data-testid={TEST_IDS.CONVERSATION_GRAPH_ANSWER_OPEN_CHAT}
        >
          대화에서 답변 생성
        </button>
        <button
          type="button"
          className="bw-btn-secondary"
          onClick={() => handleOpenInChat(true)}
          disabled={loading || (!coerceTrimmedString(prompt, '') && !promptPresets[0])}
          data-testid={TEST_IDS.CONVERSATION_GRAPH_ANSWER_OPEN_CHAT_SEND}
        >
          대화에서 바로 전송
        </button>
        <button
          type="button"
          className="bw-btn-secondary"
          onClick={() => {
            downloadGraphFullReportMarkdown({
              title: conversationTitle,
              period: periodLabel,
              narrative,
              narrativeSource,
              generatedAnswer: generatedAnswer || undefined,
              analysisSummary,
              graphSnapshot: graphSnapshotText,
              trustScore: analysis.trustScore,
              trustLabel: analysis.trustLabel,
            });
            showToast('통합 리포트 Markdown을 저장했습니다.', 'success');
          }}
          data-testid="conversation-graph-full-report-download"
        >
          통합 리포트 저장
        </button>
      </div>

      {showPipelineStatus ? (
        <div className="bw-mt-md" data-testid={TEST_IDS.CONVERSATION_GRAPH_ANSWER_PIPELINE}>
          {generationPhase ? (
            <GensparkGenerationStatus variant="step" phase={generationPhase} embedded />
          ) : (
            <GensparkGenerationStatus variant="initial" embedded />
          )}
        </div>
      ) : null}

      {generatedAnswer ? (
        <div
          className="bw-mt-md"
          data-testid={TEST_IDS.CONVERSATION_GRAPH_ANSWER_RESULT}
          aria-live="polite"
          aria-atomic="true"
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <p className="bw-label-block" style={{ fontSize: 13, margin: 0 }}>
              생성된 답변
            </p>
            <button
              type="button"
              className="bw-btn-secondary"
              style={{ fontSize: 12 }}
              data-testid="conversation-graph-answer-copy"
              onClick={() => {
                void copyGraphAnswerToClipboard(generatedAnswer).then((ok) => {
                  showToast(ok ? '답변을 복사했습니다.' : '복사에 실패했습니다.', ok ? 'success' : 'error');
                });
              }}
            >
              복사
            </button>
            <button
              type="button"
              className="bw-btn-secondary"
              style={{ fontSize: 12 }}
              data-testid="conversation-graph-answer-download"
              onClick={() => {
                downloadGraphAnswerText(generatedAnswer, 'conversation-graph-answer.txt');
                showToast('답변 TXT를 저장했습니다.', 'success');
              }}
            >
              TXT 저장
            </button>
            <button
              type="button"
              className="bw-btn-secondary"
              style={{ fontSize: 12 }}
              data-testid="conversation-graph-answer-download-md"
              onClick={() => {
                downloadGraphAnswerMarkdown(generatedAnswer, {
                  title: conversationTitle,
                  period: periodLabel,
                });
                showToast('답변 Markdown을 저장했습니다.', 'success');
              }}
            >
              MD 저장
            </button>
          </div>
          {showStreamingPartial ? (
            <p
              className="bw-detail-meta-text bw-mt-sm"
              role="status"
              data-testid={TEST_IDS.CONVERSATION_GRAPH_ANSWER_STREAMING}
            >
              답변을 이어서 생성하는 중…
            </p>
          ) : null}
          {isGenerationFailureMessage ? (
            <p
              className="bw-detail-meta-text"
              style={{ marginTop: 6, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}
            >
              {generatedAnswer}
            </p>
          ) : (
            <>
              {parsedAnswer.diagrams.map((diagram, index) => (
                <ConversationGraphMermaidBlock key={`mermaid-${index}`} source={diagram} />
              ))}
              <GensparkAnswerMarkdown
                text={parsedAnswer.body || generatedAnswer}
                className="genspark-md-body bw-text-primary bw-mt-sm"
                enhancedCodeBlocks
              />
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}