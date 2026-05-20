import { sendChatMessage } from '../../services/unifiedAPI';
import { isStreamingSupported, streamChatMessage } from '../../utils/streamingClient';
import {
  ASSISTANT_PLACEHOLDER_DRAFT,
  ASSISTANT_PLACEHOLDER_OUTLINE,
} from '../../utils/chatInputUtils';
import { CREATE_GRAPH_ANSWER_PRESET } from '../conversationGraphAnswerIntent';
import {
  buildGraphAnswerChatContext,
  generateGraphAnswerViaChat,
  GRAPH_ANSWER_CONTEXT_FLAG,
} from '../conversationGraphAnswerGeneration';
import type { GraphAiAnalysis } from '../conversationGraphAiAnalyzer';

jest.mock('../../utils/streamingClient', () => ({
  isStreamingSupported: jest.fn(),
  streamChatMessage: jest.fn(),
}));

jest.mock('../../services/unifiedAPI', () => ({
  buildUnifiedApiChatRequestBody: jest.requireActual('../../services/unifiedAPI')
    .buildUnifiedApiChatRequestBody,
  sendChatMessage: jest.fn(),
}));

const mockStream = jest.mocked(streamChatMessage);
const mockSend = jest.mocked(sendChatMessage);
const mockStreamingSupported = jest.mocked(isStreamingSupported);

describe('generateGraphAnswerViaChat', () => {
  const prevSelfImprove = process.env.REACT_APP_GRAPH_ANSWER_SELF_IMPROVE;

  beforeEach(() => {
    process.env.REACT_APP_GRAPH_ANSWER_SELF_IMPROVE = '0';
    mockStream.mockReset();
    mockSend.mockReset();
    mockStreamingSupported.mockReturnValue(true);
    mockSend.mockResolvedValue({ success: false } as Awaited<ReturnType<typeof sendChatMessage>>);
  });

  afterEach(() => {
    if (prevSelfImprove === undefined) delete process.env.REACT_APP_GRAPH_ANSWER_SELF_IMPROVE;
    else process.env.REACT_APP_GRAPH_ANSWER_SELF_IMPROVE = prevSelfImprove;
  });

  it('스트리밍으로 본문을 받으면 정제된 답변을 반환하고 phase·displayText 콜백을 호출한다', async () => {
    mockStream.mockImplementation(async (_msg, _sid, opts) => {
      opts?.onMetadata?.({ generation_phase: 'draft' });
      opts?.onChunk?.('관계도 ');
      opts?.onChunk?.('보고서 본문');
      return '관계도 보고서 본문';
    });

    const phases: string[] = [];
    const displays: string[] = [];

    const result = await generateGraphAnswerViaChat(
      '관계도 보고서 작성',
      { [GRAPH_ANSWER_CONTEXT_FLAG]: true },
      {
        onPhase: (p) => phases.push(p),
        onChunk: (_acc, display) => {
          if (display) displays.push(display);
        },
      },
    );

    expect(result).toBe('관계도 보고서 본문');
    expect(phases).toContain('draft');
    expect(phases).toContain('verify');
    expect(displays.at(-1)).toBe('관계도 보고서 본문');
    expect(mockStream).toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('스트림 반환값이 비어도 누적 본문이 있으면 답변을 반환한다', async () => {
    mockStream.mockImplementation(async (_msg, _sid, opts) => {
      opts?.onChunk?.('누적 본문만');
      return '';
    });

    const result = await generateGraphAnswerViaChat('요약', {});
    expect(result).toBe('누적 본문만');
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('스트리밍에 플레이스홀더 후 본문이 오면 displayText에 본문만 전달한다', async () => {
    mockStream.mockImplementation(async (_msg, _sid, opts) => {
      opts?.onChunk?.(ASSISTANT_PLACEHOLDER_OUTLINE);
      opts?.onChunk?.(ASSISTANT_PLACEHOLDER_DRAFT);
      opts?.onChunk?.('최종 보고서');
      return '최종 보고서';
    });

    const displays: string[] = [];
    const result = await generateGraphAnswerViaChat('요약', {}, {
      onChunk: (_a, d) => {
        if (d) displays.push(d);
      },
    });

    expect(result).toBe('최종 보고서');
    expect(displays.at(-1)).toBe('최종 보고서');
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('스트리밍 실패 시 sendChatMessage로 폴백한다', async () => {
    mockStream.mockRejectedValue(new Error('stream unavailable'));
    mockSend.mockResolvedValue({
      success: true,
      message: { content: '비스트림 폴백 답변', role: 'assistant' },
    } as unknown as Awaited<ReturnType<typeof sendChatMessage>>);

    const result = await generateGraphAnswerViaChat('보고서', { [GRAPH_ANSWER_CONTEXT_FLAG]: true });

    expect(result).toBe('비스트림 폴백 답변');
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        message: '보고서',
        context: expect.objectContaining({ [GRAPH_ANSWER_CONTEXT_FLAG]: true }),
      }),
    );
  });

  it('관계도 프리셋·context면 merge 후 Q→A 파이프라인·multi_request가 꺼진다', async () => {
    mockStream.mockImplementation(async (_msg, _sid, opts) => {
      const ctx = (opts?.requestBody?.context ?? {}) as Record<string, unknown>;
      expect(ctx.use_pipeline_v2).toBeUndefined();
      expect(ctx.multi_request_mode).toBe(false);
      expect(ctx.multi_request_items).toBeUndefined();
      expect(ctx.conversation_graph_analysis).toBe(true);
      return '관계도 답변';
    });

    const result = await generateGraphAnswerViaChat(
      CREATE_GRAPH_ANSWER_PRESET.prompt,
      {
        [GRAPH_ANSWER_CONTEXT_FLAG]: true,
        multi_request_mode: false,
        answer_quality_instruction: 'Mermaid flowchart',
      },
      { preferStream: true },
    );

    expect(result).toBe('관계도 답변');
    expect(mockStream).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        requestBody: expect.objectContaining({
          message: expect.not.stringMatching(/^\s*1\)/),
        }),
      }),
    );
  });

  it('2-pass: 개요 후 보고서를 생성하고 구조화 블록과 합성한다', async () => {
    process.env.REACT_APP_GRAPH_ANSWER_TWO_PASS = '1';
    process.env.REACT_APP_GRAPH_ANSWER_SELF_IMPROVE = '0';
    let call = 0;
    mockSend.mockImplementation(async () => {
      call += 1;
      if (call === 1) {
        return {
          success: true,
          message: {
            content: '## 한 줄 요약\n\n요약.\n\n## 해석\n\n개요 해석.\n\n## 갈등 축\n\n갈등.\n\n## 실행 제안\n\n실행.',
            role: 'assistant',
          },
        } as unknown as Awaited<ReturnType<typeof sendChatMessage>>;
      }
      return {
        success: true,
        message: {
          content: '## 해석\n\n확장된 보고서 본문입니다. 알파와 베타 분석.',
          role: 'assistant',
        },
      } as unknown as Awaited<ReturnType<typeof sendChatMessage>>;
    });

    const analysis: GraphAiAnalysis = {
      analyzedAt: '2026-05-16',
      trustScore: 70,
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
    const ctx = buildGraphAnswerChatContext({
      analysis,
      graph: {
        upload_id: 'g1',
        nodes: [
          { id: 'a', label: '알파', message_count: 2, dominant_stance: '동조' },
          { id: 'b', label: '베타', message_count: 1, dominant_stance: '반대' },
        ],
        edges: [{ source: 'a', target: 'b', weight: 1, weight_동조: 1, edge_type: '동조' }],
      },
    });

    const phases: string[] = [];
    const result = await generateGraphAnswerViaChat('관계도 보고서', ctx, {
      preferStream: false,
      onPhase: (p) => phases.push(p),
    });

    expect(call).toBe(2);
    expect(phases).toContain('outline');
    expect(phases).toContain('draft');
    expect(result).toContain('## 참여자 표');
    expect(result).toContain('확장된 보고서');
    expect(mockStream).not.toHaveBeenCalled();
  });

  it('구조화 블록이 있으면 LLM 서술과 결정론적 표·Mermaid를 합성해 반환한다', async () => {
    const analysis: GraphAiAnalysis = {
      analyzedAt: '2026-05-16',
      trustScore: 70,
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
    const ctx = buildGraphAnswerChatContext({
      analysis,
      graph: {
        upload_id: 'g1',
        nodes: [
          { id: 'a', label: '알파', message_count: 2, dominant_stance: '동조' },
          { id: 'b', label: '베타', message_count: 1, dominant_stance: '반대' },
        ],
        edges: [{ source: 'a', target: 'b', weight: 1, weight_동조: 1, edge_type: '동조' }],
      },
    });

    mockStream.mockResolvedValue('## 해석\n\n알파와 베타의 갈등 축이 뚜렷합니다.');

    const result = await generateGraphAnswerViaChat('관계도 보고서', ctx, { preferStream: true });

    expect(result).toContain('## 참여자 표');
    expect(result).toContain('| 알파 |');
    expect(result).toContain('```mermaid');
    expect(result).toContain('## 해석');
    expect(result).toContain('갈등 축');
  });

  it('자가 개선: 검증 실패 시 API를 한 번 더 호출해 개선된 답변을 반환한다', async () => {
    delete process.env.REACT_APP_GRAPH_ANSWER_SELF_IMPROVE;
    let call = 0;
    mockStream.mockImplementation(async () => {
      call += 1;
      if (call === 1) {
        return '짧은 초안';
      }
      return [
        '## 요약',
        '참여자 표',
        '|이름|입장|',
        '|알파|동조|',
        '```mermaid',
        'flowchart TB',
        '  A[알파] --> B[베타]',
        '```',
      ].join('\n');
    });

    const retries: number[] = [];
    const result = await generateGraphAnswerViaChat(
      '관계도를 만들어 주세요',
      {
        [GRAPH_ANSWER_CONTEXT_FLAG]: true,
        input_intent_hint: 'conversation_graph_create',
        conversation_graph_has_data: true,
        conversation_graph_snapshot: '- 알파 → 베타: 동조',
        answer_quality_instruction: 'Mermaid flowchart TB',
      },
      {
        preferStream: true,
        onSelfImproveRetry: (attempt) => {
          retries.push(attempt);
        },
      },
    );

    expect(call).toBe(2);
    expect(retries).toEqual([1]);
    expect(result).toContain('flowchart');
    expect(mockStream).toHaveBeenCalledTimes(2);
  });

  it('abort 시 null을 반환한다', async () => {
    const controller = new AbortController();
    mockStream.mockImplementation(async () => {
      controller.abort();
      throw Object.assign(new Error('aborted'), { name: 'AbortError' });
    });

    const result = await generateGraphAnswerViaChat('질문', {}, { signal: controller.signal });
    expect(result).toBeNull();
  });
});
