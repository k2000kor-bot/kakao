import {
  buildGraphAnswerDocumentFormatInstruction,
  buildGraphAnswerFormatCurriculumPrompt,
  getGraphAnswerDocumentFormatDef,
  graphAnswerDraftMatchesFormat,
  inferGraphAnswerDocumentFormat,
  reshapeGraphAnswerDraftToFormat,
} from './conversationGraphAnswerDocumentFormats';

describe('inferGraphAnswerDocumentFormat', () => {
  it('논문 키워드는 academic_paper', () => {
    expect(inferGraphAnswerDocumentFormat('대화 관계를 논문형으로 서론·결론까지 써 주세요')).toBe(
      'academic_paper',
    );
  });

  it('문학 키워드는 literary_essay', () => {
    expect(inferGraphAnswerDocumentFormat('인물 관계를 문학·서사 수필로 풀어 주세요')).toBe(
      'literary_essay',
    );
  });

  it('엔티티 프로필 키워드는 entity_profile', () => {
    expect(inferGraphAnswerDocumentFormat('참여자별 엔티티 프로필 카드를 작성해 주세요')).toBe(
      'entity_profile',
    );
  });

  it('엔티티·인텔리전스 보고서 키워드는 entity_intelligence_report', () => {
    expect(
      inferGraphAnswerDocumentFormat('대화 관계를 엔티티 인텔리전스 보고서로 작성해 주세요'),
    ).toBe('entity_intelligence_report');
  });

  it('백서 키워드는 white_paper', () => {
    expect(inferGraphAnswerDocumentFormat('관계도 분석 백서를 작성해 주세요')).toBe('white_paper');
  });

  it('관계도 만들기는 graph_deliverable', () => {
    expect(inferGraphAnswerDocumentFormat('대화 관계도를 만들어 주세요')).toBe('graph_deliverable');
  });
});

describe('buildGraphAnswerDocumentFormatInstruction', () => {
  it('형식 이름·골격·질문을 포함한다', () => {
    const out = buildGraphAnswerDocumentFormatInstruction(
      'academic_paper',
      '논문형 요약',
      true,
    );
    expect(out).toContain('논문');
    expect(out).toContain('서론');
    expect(out).toContain('논문형 요약');
  });
});

describe('reshapeGraphAnswerDraftToFormat', () => {
  it('논문 형식에 누락된 서론·방법 제목을 보강한다', () => {
    const out = reshapeGraphAnswerDraftToFormat('짧은 분석 본문만 있습니다.', 'academic_paper');
    expect(out).toContain('## 서론');
    expect(out).toContain('짧은 분석');
  });
});

describe('graphAnswerDraftMatchesFormat', () => {
  it('학술 섹션이 있으면 academic_paper 통과에 가깝다', () => {
    const draft = '## 서론\n내용\n## 방법\n## 결과\n## 논의\n## 결론';
    const { ok } = graphAnswerDraftMatchesFormat(draft, 'academic_paper');
    expect(ok).toBe(true);
  });
});

describe('buildGraphAnswerFormatCurriculumPrompt', () => {
  it('여러 문서 형식 학습 문구를 포함한다', () => {
    const p = buildGraphAnswerFormatCurriculumPrompt();
    expect(p).toContain('분석보고서');
    expect(p).toContain('논문');
    expect(p).toContain('문학');
  });
});

describe('getGraphAnswerDocumentFormatDef', () => {
  it('알 수 없는 id는 분석 보고서로 폴백', () => {
    expect(getGraphAnswerDocumentFormatDef('analytical_report' as const).labelKo).toBe('분석 보고서');
  });
});
