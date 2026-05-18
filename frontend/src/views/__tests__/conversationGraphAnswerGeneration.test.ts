import { buildGraphAnswerChatContext, GRAPH_ANSWER_CONTEXT_FLAG } from '../conversationGraphAnswerGeneration';
import type { GraphAiAnalysis } from '../conversationGraphAiAnalyzer';

const stubAnalysis: GraphAiAnalysis = {
  analyzedAt: '2026-05-16T00:00:00.000Z',
  trustScore: 80,
  trustLabel: '높음',
  methodology: [],
  stanceSummary: '',
  exchangeSummary: '',
  alignmentSummary: '',
  participants: [],
  topInfluencers: [],
  exchangeLeaders: [],
  agreementHubs: [],
};

describe('buildGraphAnswerChatContext', () => {
  it('userMessage로 feature context를 병합한다', () => {
    const ctx = buildGraphAnswerChatContext({
      analysis: stubAnalysis,
      userMessage: '관계도 보고서를 요약해줘',
    });
    expect(ctx[GRAPH_ANSWER_CONTEXT_FLAG]).toBe(true);
    expect(ctx.prefer_informed_answer).toBe(true);
    expect(ctx.input_intent_hint).toBe('conversation_graph_answer');
    expect(ctx.conversation_graph_summary).toEqual(expect.any(String));
  });
});
