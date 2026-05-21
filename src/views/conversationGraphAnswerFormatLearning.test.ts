import {
  __readFormatStructureLessonsForTest,
  buildBuiltinFormatStructureSeed,
  buildFormatStructureLessonsPrompt,
  clearFormatStructureLessons,
  extractHeadingOutlineFromDraft,
  recordFormatStructureFromDraft,
} from './conversationGraphAnswerFormatLearning';

describe('conversationGraphAnswerFormatLearning', () => {
  beforeEach(() => {
    clearFormatStructureLessons();
  });

  it('제목 줄만 추출한다', () => {
    const outline = extractHeadingOutlineFromDraft(
      '## 한 줄 요약\n본문\n### 핵심\n## 해석',
    );
    expect(outline).toContain('## 한 줄 요약');
    expect(outline).not.toContain('본문');
  });

  it('로컬 학습이 없어도 내장 골격 시드를 반환한다', () => {
    const prompt = buildFormatStructureLessonsPrompt('literary_essay');
    expect(prompt).toContain('문학');
    expect(prompt).toContain('내장');
    expect(buildBuiltinFormatStructureSeed('academic_paper')).toContain('## 서론');
  });

  it('형식별 구조를 저장하고 프롬프트에 반영한다', () => {
    recordFormatStructureFromDraft(
      '## 서론\n내용\n## 방법\n## 결과\n## 결론',
      'academic_paper',
    );
    expect(__readFormatStructureLessonsForTest()).toHaveLength(1);
    const prompt = buildFormatStructureLessonsPrompt('academic_paper');
    expect(prompt).toContain('학술');
    expect(prompt).toContain('## 서론');
  });
});
