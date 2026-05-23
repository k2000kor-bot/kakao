import { TEST_IDS } from '../testIds';

describe('conversation graph TEST_IDS', () => {
  it('관계도·답변 패널 testid가 컴포넌트 data-testid와 일치한다', () => {
    expect(TEST_IDS.CONVERSATION_GRAPH_VIEW).toBe('conversation-graph-view');
    expect(TEST_IDS.CONVERSATION_GRAPH_ANSWER_PANEL).toBe('conversation-graph-answer-panel');
    expect(TEST_IDS.CONVERSATION_GRAPH_ANSWER_GENERATE).toBe('conversation-graph-answer-generate');
    expect(TEST_IDS.CONVERSATION_GRAPH_ANSWER_PIPELINE).toBe('conversation-graph-answer-pipeline');
    expect(TEST_IDS.CONVERSATION_GRAPH_ANSWER_RESULT).toBe('conversation-graph-answer-result');
    expect(TEST_IDS.CONVERSATION_GRAPH_ANSWER_OPEN_CHAT).toBe('conversation-graph-answer-open-chat');
    expect(TEST_IDS.CONVERSATION_GRAPH_ANSWER_OPEN_CHAT_SEND).toBe(
      'conversation-graph-answer-open-chat-send',
    );
    expect(TEST_IDS.CONVERSATION_GRAPH_ANSWER_STREAMING).toBe('conversation-graph-answer-streaming');
    expect(TEST_IDS.GENSPARK_GENERATION_STATUS).toBe('genspark-generation-status');
  });
});
