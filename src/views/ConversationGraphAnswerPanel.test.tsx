/**
 * ConversationGraphAnswerPanel — 답변 생성·다단계 파이프라인 UI
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { ConversationGraphAnswerPanel } from './ConversationGraphAnswerPanel';
import type { GraphAiAnalysis } from './conversationGraphAiAnalyzer';
import { generateGraphAnswerViaChat } from './conversationGraphAnswerGeneration';
import { isStreamingSupported } from '../utils/streamingClient';
import { TEST_IDS } from '../constants/testIds';

jest.mock('../utils/toast', () => ({
  showToast: jest.fn(),
}));
const mockIsStreamingSupported = jest.fn(() => true);
jest.mock('../utils/streamingClient', () => ({
  isStreamingSupported: () => mockIsStreamingSupported(),
}));
jest.mock('./conversationGraphAnswerGeneration', () => {
  const actual = jest.requireActual('./conversationGraphAnswerGeneration');
  return {
    ...actual,
    generateGraphAnswerViaChat: jest.fn(),
  };
});
jest.mock('../components/genspark/GensparkGenerationStatus', () => ({
  GensparkGenerationStatus: ({ variant, phase }: { variant: string; phase?: string }) => (
    <div data-testid="genspark-generation-status-mock" data-variant={variant} data-phase={phase ?? ''} />
  ),
}));
jest.mock('../components/genspark/gensparkAnswerMarkdown', () => ({
  GensparkAnswerMarkdown: ({ text }: { text: string }) => (
    <div data-testid="genspark-answer-markdown-mock">{text}</div>
  ),
}));

jest.mock('mermaid', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn(),
    render: jest.fn().mockResolvedValue({ svg: '<svg data-testid="mock-mermaid-svg"></svg>' }),
  },
}));

const analysis: GraphAiAnalysis = {
  analyzedAt: '2026-05-16',
  trustScore: 72,
  trustLabel: '보통',
  methodology: [],
  stanceSummary: '',
  exchangeSummary: '',
  alignmentSummary: '',
  participants: [],
  topInfluencers: [],
  exchangeLeaders: [],
  agreementHubs: [],
};

describe('ConversationGraphAnswerPanel', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    mockIsStreamingSupported.mockReturnValue(true);
    jest.mocked(generateGraphAnswerViaChat).mockReset();
    jest.mocked(generateGraphAnswerViaChat).mockResolvedValue('패널 생성 답변');
  });

  it('관계도 만들기 요청 시 onEnsureGraphBeforeAnswer를 먼저 호출한다', async () => {
    const onEnsure = jest.fn().mockResolvedValue({
      graph: {
        upload_id: 'g1',
        nodes: [{ id: 'p1', label: '알파', message_count: 2, dominant_stance: '동조' }],
        edges: [],
      },
      analysis: {
        ...analysis,
        participants: [
          {
            id: 'p1',
            label: '알파',
            dominantStance: '동조',
            stanceConfidence: 0.8,
            exchangeRole: '주도',
            influenceScore: 10,
            messageCount: 2,
            stanceCounts: { 동조: 2, 반대: 0, 중립: 0 },
            outboundWeight: 1,
            inboundWeight: 0,
            agreementTies: 0,
            oppositionTies: 0,
            profileLine: '',
          },
        ],
      },
      narrative: '해석',
    });

    render(
      <ConversationGraphAnswerPanel
        analysis={analysis}
        narrative=""
        graph={null}
        rawConversationText="Date,User,Message\n2026-05-01,A,hi"
        onEnsureGraphBeforeAnswer={onEnsure}
        onOpenInChat={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByTestId('conversation-graph-answer-prompt'), {
      target: { value: '관계도를 만들어 주세요' },
    });
    fireEvent.click(screen.getByTestId('conversation-graph-answer-generate'));

    await waitFor(() => expect(onEnsure).toHaveBeenCalled());
    await waitFor(() => expect(generateGraphAnswerViaChat).toHaveBeenCalled());
    const [apiMessage, ctx] = jest.mocked(generateGraphAnswerViaChat).mock.calls.at(-1) ?? [];
    expect(String(apiMessage)).toContain('Mermaid');
    expect(ctx).toMatchObject({ input_intent_hint: 'conversation_graph_create' });
  });

  it('답변 생성 중 파이프라인 UI를 표시하고 완료 후 결과를 보여준다', async () => {
    let resolveGen!: (value: string) => void;
    const pending = new Promise<string>((resolve) => {
      resolveGen = resolve;
    });
    jest.mocked(generateGraphAnswerViaChat).mockImplementation((_msg, _ctx, opts) => {
      opts?.onPhase?.('analyze');
      return pending.then((text) => {
        opts?.onChunk?.(text, text);
        return text;
      });
    });

    render(
      <ConversationGraphAnswerPanel
        analysis={analysis}
        narrative="해석"
        onOpenInChat={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId('conversation-graph-answer-preset-report'));
    fireEvent.click(screen.getByTestId('conversation-graph-answer-generate'));

    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-answer-pipeline')).toBeInTheDocument();
      expect(screen.getByTestId('genspark-generation-status-mock')).toHaveAttribute('data-variant', 'step');
    });

    resolveGen('패널 생성 답변');

    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-answer-result')).toHaveTextContent('패널 생성 답변');
    });
    expect(screen.queryByTestId('conversation-graph-answer-pipeline')).not.toBeInTheDocument();
    expect(screen.getByTestId('genspark-answer-markdown-mock')).toHaveTextContent('패널 생성 답변');
  });

  it('답변 생성 취소 시 API 호출을 중단한다', async () => {
    let abortSignal: AbortSignal | undefined;
    jest.mocked(generateGraphAnswerViaChat).mockImplementation((_msg, _ctx, opts) => {
      abortSignal = opts?.signal;
      return new Promise(() => {
        /* hang until abort */
      });
    });

    render(
      <ConversationGraphAnswerPanel
        analysis={analysis}
        narrative="해석"
        onOpenInChat={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId('conversation-graph-answer-preset-report'));
    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-answer-generate')).not.toBeDisabled();
    });
    fireEvent.click(screen.getByTestId('conversation-graph-answer-generate'));
    await screen.findByTestId('conversation-graph-answer-cancel');
    fireEvent.click(screen.getByTestId('conversation-graph-answer-cancel'));

    expect(abortSignal?.aborted).toBe(true);
    expect(screen.queryByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_RESULT)).not.toBeInTheDocument();
  });

  it('비스트리밍 모드에서도 onChunk로 결과를 표시한다', async () => {
    mockIsStreamingSupported.mockReturnValue(false);
    jest.mocked(generateGraphAnswerViaChat).mockImplementation(async (_msg, _ctx, opts) => {
      opts?.onPhase?.('draft');
      opts?.onChunk?.('비스트림', '비스트림 답변');
      return '비스트림 답변';
    });

    render(
      <ConversationGraphAnswerPanel
        analysis={analysis}
        narrative="해석"
        onOpenInChat={jest.fn()}
        useStreamAnswer={false}
      />,
    );

    fireEvent.click(screen.getByTestId('conversation-graph-answer-preset-report'));
    fireEvent.click(screen.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_GENERATE));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_RESULT)).toHaveTextContent(
        '비스트림 답변',
      );
    });
    expect(isStreamingSupported()).toBe(false);
  });

  it('생성 중 패널에 aria-busy가 설정된다', async () => {
    let resolveGen!: (value: string) => void;
    const pending = new Promise<string>((resolve) => {
      resolveGen = resolve;
    });
    jest.mocked(generateGraphAnswerViaChat).mockReturnValue(pending);

    render(
      <ConversationGraphAnswerPanel
        analysis={analysis}
        narrative="해석"
        onOpenInChat={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId('conversation-graph-answer-preset-report'));
    fireEvent.click(screen.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_GENERATE));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_PANEL)).toHaveAttribute('aria-busy', 'true');
    });

    resolveGen('완료');
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_PANEL)).toHaveAttribute('aria-busy', 'false');
    });
  });

  it('Ctrl+Enter로 답변 생성을 실행한다', async () => {
    render(
      <ConversationGraphAnswerPanel
        analysis={analysis}
        narrative="해석"
        onOpenInChat={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId('conversation-graph-answer-preset-report'));
    const textarea = screen.getByTestId('conversation-graph-answer-prompt');
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

    await waitFor(() => {
      expect(generateGraphAnswerViaChat).toHaveBeenCalled();
    });
  });

  it('생성 답변에 mermaid 블록이 있으면 MermaidBlock과 본문 마크다운을 분리해 표시한다', async () => {
    const answerWithMermaid = [
      '## 요약',
      '',
      '```mermaid',
      'flowchart TB',
      '  A-->B',
      '```',
      '',
      '본문 설명입니다.',
    ].join('\n');
    jest.mocked(generateGraphAnswerViaChat).mockResolvedValue(answerWithMermaid);

    render(
      <ConversationGraphAnswerPanel
        analysis={analysis}
        narrative="해석"
        onOpenInChat={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId('conversation-graph-answer-preset-report'));
    fireEvent.click(screen.getByTestId('conversation-graph-answer-generate'));

    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-answer-result')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-mermaid-preview')).toBeInTheDocument();
    });
    const markdown = screen.getByTestId('genspark-answer-markdown-mock');
    expect(markdown).toHaveTextContent('본문 설명입니다.');
    expect(markdown).toHaveTextContent('## 요약');
    expect(markdown.textContent).not.toMatch(/flowchart\s+TB/);
  });
});
