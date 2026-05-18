import {
  buildGraphAnswerChatContext,
  buildGraphAnswerChatNavState,
  buildGraphSnapshotForAnswer,
  buildParticipantAnswerPreset,
  GRAPH_ANSWER_CONTEXT_FLAG,
} from './conversationGraphAnswerGeneration';
import type { ParticipantAiInsight } from './conversationGraphAiAnalyzer';
import {
  CONVERSATION_GRAPH_CHAT_AUTOSEND_STATE_KEY,
  CONVERSATION_GRAPH_CHAT_CONTEXT_STATE_KEY,
  CONVERSATION_GRAPH_CHAT_DRAFT_STATE_KEY,
} from '../config/routes';
import type { GraphAiAnalysis } from './conversationGraphAiAnalyzer';

const analysis: GraphAiAnalysis = {
  analyzedAt: '2026-05-16',
  trustScore: 72,
  trustLabel: '보통',
  methodology: ['규칙 기반'],
  stanceSummary: '동조 2명',
  exchangeSummary: '주도 1명',
  alignmentSummary: '동조 허브 1명',
  participants: [],
  topInfluencers: [],
  exchangeLeaders: [],
  agreementHubs: [],
};

describe('conversationGraphAnswerGeneration', () => {
  it('buildGraphSnapshotForAnswer는 관계도 규모·연결을 요약한다', () => {
    const snap = buildGraphSnapshotForAnswer({
      upload_id: 'g1',
      nodes: [
        { id: 'p1', label: 'A', message_count: 2, dominant_stance: '동조' },
        { id: 'p2', label: 'B', message_count: 1, dominant_stance: '반대' },
      ],
      edges: [{ source: 'p1', target: 'p2', weight: 3, weight_동조: 2 }],
    });
    expect(snap).toContain('참여자 2명');
    expect(snap).toContain('활발한 연결');
  });

  it('buildGraphAnswerChatContext는 관계도 플래그와 요약을 담는다', () => {
    const ctx = buildGraphAnswerChatContext({
      analysis,
      narrative: '테스트 해석',
      conversationTitle: '단체 채팅',
      periodLabel: '2026-05-01 ~ 2026-05-10',
      graph: {
        upload_id: 'g1',
        nodes: [{ id: 'p1', label: 'A', message_count: 1 }],
        edges: [],
      },
    });
    expect(ctx[GRAPH_ANSWER_CONTEXT_FLAG]).toBe(true);
    expect(ctx.conversation_graph_narrative).toBe('테스트 해석');
    expect(ctx.conversation_graph_title).toBe('단체 채팅');
    expect(String(ctx.conversation_graph_summary)).toContain('신뢰 지표');
    expect(String(ctx.conversation_graph_snapshot)).toContain('참여자');
  });

  it('buildParticipantAnswerPreset는 참여자 이름을 프리셋에 포함한다', () => {
    const insight: ParticipantAiInsight = {
      id: 'p1',
      label: '김철수',
      dominantStance: '동조',
      stanceConfidence: 0.8,
      exchangeRole: '주도',
      influenceScore: 10,
      messageCount: 5,
      stanceCounts: { 동조: 5, 반대: 0, 중립: 0 },
      outboundWeight: 1,
      inboundWeight: 1,
      agreementTies: 1,
      oppositionTies: 0,
      profileLine: '주도적 발화',
    };
    const preset = buildParticipantAnswerPreset(insight);
    expect(preset.label).toContain('김철수');
    expect(preset.prompt).toContain('김철수');
  });

  it('buildGraphAnswerChatNavState는 draft·context·autoSend를 반환한다', () => {
    const ctx = { [GRAPH_ANSWER_CONTEXT_FLAG]: true };
    const state = buildGraphAnswerChatNavState('보고서 작성', ctx, true);
    expect(state[CONVERSATION_GRAPH_CHAT_DRAFT_STATE_KEY]).toBe('보고서 작성');
    expect(state[CONVERSATION_GRAPH_CHAT_CONTEXT_STATE_KEY]).toEqual(ctx);
    expect(state[CONVERSATION_GRAPH_CHAT_AUTOSEND_STATE_KEY]).toBe(true);
  });
});
