import { buildGraphAnswerContextWithRevision } from './conversationGraphAnswerSelfImprove';

describe('buildGraphAnswerContextWithRevision', () => {
  it('문서 형식 검증 실패 시 골격·키워드를 재작성 지시에 넣는다', () => {
    const ctx = buildGraphAnswerContextWithRevision(
      {
        conversation_graph_document_format: 'academic_paper',
        answer_quality_instruction: '기존 지시',
      },
      ['요청 문서 형식(논문·학술형)에 맞는 제목·섹션이 부족합니다.'],
      0,
    );
    const instruction = String(ctx.answer_quality_instruction ?? '');
    expect(instruction).toContain('## 서론');
    expect(instruction).toContain('필수 키워드');
  });
});
