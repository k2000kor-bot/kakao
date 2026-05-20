import {
  formatGraphAnswerHistoryForContext,
  type GraphAnswerTurn,
} from './conversationGraphAnswerTurns';

describe('formatGraphAnswerHistoryForContext', () => {
  it('완료된 턴만 이전 맥락 문자열로 만든다', () => {
    const turns: GraphAnswerTurn[] = [
      {
        id: '1',
        question: '첫 질문',
        answer: '첫 답변',
        createdAt: 1,
        status: 'complete',
      },
      {
        id: '2',
        question: '둘째 질문',
        answer: '',
        createdAt: 2,
        status: 'streaming',
      },
    ];
    const text = formatGraphAnswerHistoryForContext(turns);
    expect(text).toContain('[이전 질문 1]');
    expect(text).toContain('첫 질문');
    expect(text).toContain('첫 답변');
    expect(text).not.toContain('둘째 질문');
  });
});
