import {
  extractParticipantLabelsFromGraphContext,
  verifyGraphAnswerAgainstContext,
} from './conversationGraphAnswerVerifier';

describe('conversationGraphAnswerVerifier', () => {
  it('extractParticipantLabelsFromGraphContext는 연결 표에서 이름을 추출한다', () => {
    const labels = extractParticipantLabelsFromGraphContext({
      conversation_graph_snapshot: '- 알파 → 베타: 동조\n- 베타 → 알파: 반대',
    });
    expect(labels).toContain('알파');
    expect(labels).toContain('베타');
  });

  it('관계도 생성 답변은 Mermaid·표가 없으면 실패한다', () => {
    const result = verifyGraphAnswerAgainstContext('요약만 있습니다.', {
      input_intent_hint: 'conversation_graph_create',
      conversation_graph_snapshot: '- 알파 → 베타: 동조',
    });
    expect(result.pass).toBe(false);
    expect(result.issues.some((i) => i.includes('Mermaid'))).toBe(true);
  });

  it('충분한 관계도 생성 답변은 통과한다', () => {
    const draft = [
      '## 한 줄 요약',
      '참여자 표',
      '|이름|입장|',
      '|알파|동조|',
      '|베타|반대|',
      '```mermaid',
      'flowchart TB',
      '  A[알파] --> B[베타]',
      '```',
      '알파와 베타의 관계를 정리했습니다. 동조·반대 축을 스냅샷 근거만으로 서술했습니다.',
      '갈등 완화를 위해 중재자 역할이 필요할 수 있습니다(추정).',
    ].join('\n');
    const result = verifyGraphAnswerAgainstContext(draft, {
      input_intent_hint: 'conversation_graph_create',
      conversation_graph_snapshot: '- 알파 → 베타: 동조',
    });
    expect(result.pass).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('[다중 요청] 문구가 있으면 실패한다', () => {
    const result = verifyGraphAnswerAgainstContext(
      '[다중 요청] 항목1\n'.padEnd(150, 'x'),
      { input_intent_hint: 'conversation_graph_answer' },
    );
    expect(result.pass).toBe(false);
    expect(result.issues.some((i) => i.includes('다중 요청'))).toBe(true);
  });
});
