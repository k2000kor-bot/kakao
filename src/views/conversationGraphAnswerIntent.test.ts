import {
  buildCreateGraphAnswerInstruction,
  isCreateGraphAnswerRequest,
  resolveGraphAnswerUserMessage,
} from './conversationGraphAnswerIntent';
import { buildGraphAnswerChatContext, prepareGraphAnswerGenerationMessage } from './conversationGraphAnswerGeneration';
import type { GraphAiAnalysis } from './conversationGraphAiAnalyzer';

const analysis: GraphAiAnalysis = {
  analyzedAt: '2026-05-16',
  trustScore: 50,
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

describe('conversationGraphAnswerIntent', () => {
  it('isCreateGraphAnswerRequest는 관계도 생성 요청을 감지한다', () => {
    expect(isCreateGraphAnswerRequest('관계도를 만들어 주세요')).toBe(true);
    expect(isCreateGraphAnswerRequest('이 대화로 관계도 생성해줘')).toBe(true);
    expect(isCreateGraphAnswerRequest('대화를 기준으로 관계도를 만들어줘')).toBe(true);
    expect(isCreateGraphAnswerRequest('보고서 작성해줘')).toBe(false);
  });

  it('resolveGraphAnswerUserMessage는 생성 요청 시 사용자 문장만 반환한다', () => {
    const { message, isCreateGraph } = resolveGraphAnswerUserMessage('관계도 만들어줘', true);
    expect(isCreateGraph).toBe(true);
    expect(message).toBe('관계도 만들어줘');
    expect(message).not.toContain('1)');
  });

  it('buildCreateGraphAnswerInstruction은 데이터 유무에 따라 안내를 바꾼다', () => {
    expect(buildCreateGraphAnswerInstruction(true, false)).toContain('snapshot');
    expect(buildCreateGraphAnswerInstruction(false, true)).toContain('raw_conversation');
    expect(buildCreateGraphAnswerInstruction(false, false)).toContain('부족');
  });

  it('buildGraphAnswerChatContext는 관계도 생성 의도 시 intent 힌트를 바꾼다', () => {
    const ctx = buildGraphAnswerChatContext({
      analysis,
      userMessage: '관계도를 만들어 주세요',
      graph: {
        upload_id: 'g1',
        nodes: [{ id: 'p1', label: 'A', message_count: 1 }],
        edges: [],
      },
    });
    expect(ctx.input_intent_hint).toBe('conversation_graph_create');
    expect(String(ctx.answer_quality_instruction)).toContain('Mermaid');
  });

  it('prepareGraphAnswerGenerationMessage는 API 메시지를 정규화한다', () => {
    const { apiMessage, isCreateGraph } = prepareGraphAnswerGenerationMessage('관계도 만들어줘', false);
    expect(isCreateGraph).toBe(true);
    expect(apiMessage).toBe('관계도 만들어줘');
  });

  it('buildGraphAnswerChatContext는 다중 요청 모드를 끈다', () => {
    const ctx = buildGraphAnswerChatContext({
      analysis,
      userMessage: '1) 첫 항목\n2) 둘째 항목',
    });
    expect(ctx.multi_request_mode).toBe(false);
    expect(ctx.conversation_graph_analysis).toBe(true);
  });
});
