/**
 * ConversationGraphAnswerPanel — 답변 생성·다단계 파이프라인 UI
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { ConversationGraphAnswerPanel } from './ConversationGraphAnswerPanel';
import type { GraphAiAnalysis } from './conversationGraphAiAnalyzer';
import { CREATE_GRAPH_API_USER_MESSAGE } from './conversationGraphAnswerIntent';
import { generateGraphAnswerViaChat } from './conversationGraphAnswerGeneration';
import { isStreamingSupported } from '../utils/streamingClient';
import { TEST_IDS } from '../constants/testIds';
import {
  __readGraphAnswerLessonsForTest,
  clearGraphAnswerLessons,
  recordGraphAnswerLessonFromContext,
} from './conversationGraphAnswerLearning';

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

function clickIntentPreset(id: string) {
  fireEvent.click(screen.getAllByTestId(`conversation-graph-answer-preset-${id}`)[0]);
}

function clickGenerate() {
  fireEvent.click(screen.getAllByTestId('conversation-graph-answer-generate')[0]);
}

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
    clickGenerate();

    await waitFor(() => expect(onEnsure).toHaveBeenCalled());
    await waitFor(() => expect(generateGraphAnswerViaChat).toHaveBeenCalled());
    const [apiMessage, ctx] = jest.mocked(generateGraphAnswerViaChat).mock.calls.at(-1) ?? [];
    expect(String(apiMessage)).toBe('관계도를 만들어 주세요');
    expect(ctx).toMatchObject({
      input_intent_hint: 'conversation_graph_create',
      multi_request_mode: false,
    });
    expect(String((ctx as Record<string, unknown>).answer_quality_instruction)).toContain('Mermaid');
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

    clickIntentPreset('report');
    clickGenerate();

    expect((await screen.findAllByTestId('conversation-graph-answer-pipeline')).length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('genspark-generation-status-mock')[0]).toHaveAttribute(
      'data-variant',
      'step',
    );

    resolveGen('패널 생성 답변');

    await waitFor(() => {
      expect(screen.getAllByTestId('conversation-graph-answer-result')[0]).toHaveTextContent(
        '패널 생성 답변',
      );
    });
    expect(screen.queryByTestId('conversation-graph-answer-pipeline')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('genspark-answer-markdown-mock')[0]).toHaveTextContent('패널 생성 답변');
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

    clickIntentPreset('report');
    await waitFor(() => {
      expect(screen.getAllByTestId('conversation-graph-answer-generate')[0]).not.toBeDisabled();
    });
    clickGenerate();
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

    clickIntentPreset('report');
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

    clickIntentPreset('report');
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

    clickIntentPreset('report');
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

    clickIntentPreset('report');
    clickGenerate();

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

  it('2-pass 체크박스를 켜면 generateGraphAnswerViaChat에 twoPass를 전달한다', async () => {
    jest.mocked(generateGraphAnswerViaChat).mockResolvedValue('합성 답변');
    const onTwoPass = jest.fn();

    render(
      <ConversationGraphAnswerPanel
        analysis={analysis}
        narrative="해석"
        graph={{
          upload_id: 'g1',
          nodes: [{ id: 'p1', label: '알파', message_count: 1, dominant_stance: '동조' }],
          edges: [],
        }}
        useTwoPassAnswer
        onUseTwoPassAnswerChange={onTwoPass}
        onOpenInChat={jest.fn()}
      />,
    );

    clickIntentPreset('report');
    clickGenerate();

    await waitFor(() => expect(generateGraphAnswerViaChat).toHaveBeenCalled());
    const opts = jest.mocked(generateGraphAnswerViaChat).mock.calls.at(-1)?.[2];
    expect(opts?.twoPass).toBe(true);
  });

  it('관계도 만들기 프리셋으로 대화 바로 전송 시 API용 짧은 메시지를 넘긴다', () => {
    const onOpenInChat = jest.fn();
    render(
      <ConversationGraphAnswerPanel
        analysis={analysis}
        narrative="해석"
        onOpenInChat={onOpenInChat}
      />,
    );

    fireEvent.click(screen.getByTestId('conversation-graph-answer-preset-create-graph'));
    fireEvent.click(screen.getByTestId('conversation-graph-answer-open-chat-send'));

    expect(onOpenInChat).toHaveBeenCalledWith(
      CREATE_GRAPH_API_USER_MESSAGE,
      expect.objectContaining({
        input_intent_hint: 'conversation_graph_create',
        multi_request_mode: false,
      }),
      true,
    );
    expect(onOpenInChat.mock.calls[0]?.[0]).not.toContain('1)');
  });

  it('연속 질문·답변을 스크롤 영역에 쌓고 이전 맥락을 API에 전달한다', async () => {
    jest
      .mocked(generateGraphAnswerViaChat)
      .mockResolvedValueOnce('첫 번째 답변')
      .mockResolvedValueOnce('두 번째 답변');

    render(
      <ConversationGraphAnswerPanel
        analysis={analysis}
        narrative="해석"
        onOpenInChat={jest.fn()}
      />,
    );

    clickIntentPreset('report');
    clickGenerate();
    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-answer-turns')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getAllByTestId('conversation-graph-answer-turn')).toHaveLength(1);
    });

    fireEvent.change(screen.getByTestId('conversation-graph-answer-prompt'), {
      target: { value: '이어서 실행 제안을 주세요' },
    });
    clickGenerate();

    await waitFor(() => {
      expect(screen.getAllByTestId('conversation-graph-answer-turn')).toHaveLength(2);
    });

    const secondCtx = jest.mocked(generateGraphAnswerViaChat).mock.calls[1]?.[1] as Record<string, unknown>;
    expect(String(secondCtx.conversation_graph_answer_history)).toContain('첫 번째 답변');
    expect(screen.getAllByTestId('conversation-graph-answer-turn')).toHaveLength(2);
    expect(screen.getAllByTestId('conversation-graph-answer-turn-question').length).toBeGreaterThanOrEqual(2);
  });

  it('문서 형식 프리셋 클릭 시 형식 힌트·프롬프트·고정이 갱신된다', () => {
    render(
      <ConversationGraphAnswerPanel
        analysis={analysis}
        narrative="해석"
        onOpenInChat={jest.fn()}
        onUseTwoPassAnswerChange={jest.fn()}
      />,
    );

    fireEvent.click(screen.getAllByTestId('conversation-graph-answer-format-academic_paper')[0]);

    expect(screen.getByTestId('conversation-graph-answer-format-hint')).toHaveTextContent(/논문/);
    expect(screen.getByTestId('conversation-graph-answer-format-hint')).toHaveTextContent(/내장 골격/);
    expect(screen.getByTestId('conversation-graph-answer-format-unpin')).toBeInTheDocument();
    expect(screen.getByTestId('conversation-graph-answer-prompt')).not.toHaveValue('');
  });

  it('답변 학습 초기화 버튼이 localStorage 기록을 지운다', () => {
    clearGraphAnswerLessons();
    recordGraphAnswerLessonFromContext(
      '## 한 줄 요약\n\n검증 통과한 관계도 답변 본문입니다. '.repeat(4),
      { conversation_graph_lesson_participant_count: 2, conversation_graph_lesson_edge_count: 1 },
      '보고서',
    );
    expect(__readGraphAnswerLessonsForTest()).toHaveLength(1);

    render(
      <ConversationGraphAnswerPanel
        analysis={analysis}
        narrative="해석"
        onOpenInChat={jest.fn()}
        onUseTwoPassAnswerChange={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId('conversation-graph-answer-clear-lessons'));
    expect(__readGraphAnswerLessonsForTest()).toHaveLength(0);
  });
});
