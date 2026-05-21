import {
  buildGraphAnswerOutputFormatInstruction,
  buildGraphAnswerWritingStyleInstruction,
  enrichSparseGraphAnswerMarkdown,
  inferGraphAnswerWritingStyle,
  polishGraphAnswerMarkdown,
} from './conversationGraphAnswerProse';

describe('inferGraphAnswerWritingStyle', () => {
  it('관계도 만들기 요청은 create', () => {
    expect(inferGraphAnswerWritingStyle('대화 관계도를 만들어 주세요')).toBe('create');
  });

  it('갈등 프리셋은 conflict', () => {
    expect(
      inferGraphAnswerWritingStyle('반대·대립 연결을 중심으로 갈등 축을 요약해 주세요'),
    ).toBe('conflict');
  });

  it('실행 제안 프리셋은 action', () => {
    expect(inferGraphAnswerWritingStyle('실행 제안 3가지를 제시해 주세요')).toBe('action');
  });
});

describe('polishGraphAnswerMarkdown', () => {
  it('시스템 태그 줄을 제거하고 제목을 정규화한다', () => {
    const out = polishGraphAnswerMarkdown(
      '[다중 요청]\n##한줄요약\n\n알파와 베타의 관계를 정리했습니다.\n•\n## 해석\n동조 축이 강합니다.',
    );
    expect(out.length).toBeGreaterThan(20);
    expect(out.includes('[다중 요청]')).toBe(false);
    expect(out.includes('한 줄 요약')).toBe(true);
    expect(out.includes('동조 축이 강합니다')).toBe(true);
  });
});

describe('buildGraphAnswerWritingStyleInstruction', () => {
  it('report 스타일 지시를 반환한다', () => {
    expect(buildGraphAnswerWritingStyleInstruction('report')).toContain('분석 보고서');
  });
});

describe('buildGraphAnswerOutputFormatInstruction', () => {
  it('질문 의도와 구조화 블록 안내를 포함한다', () => {
    const out = buildGraphAnswerOutputFormatInstruction('갈등 요약해 주세요', true);
    expect(out).toContain('갈등 요약');
    expect(out).toContain('출력 문서 형식');
    expect(out).toContain('표·Mermaid');
  });
});

describe('enrichSparseGraphAnswerMarkdown', () => {
  it('짧은 답변에 핵심 포인트·해석 골격을 추가한다', () => {
    const out = enrichSparseGraphAnswerMarkdown('알파와 베타 사이에 반대 연결이 눈에 띕니다.');
    expect(out).toContain('핵심 포인트');
    expect(out).toContain('해석');
    expect(out).toContain('알파와 베타');
  });

  it('논문 형식은 서론 골격을 쓰고 한 줄 요약을 강제하지 않는다', () => {
    const out = enrichSparseGraphAnswerMarkdown(
      '가설에 따르면 동조 축이 강합니다.',
      'academic_paper',
    );
    expect(out).toContain('서론');
    expect(out).not.toMatch(/^##\s*한\s*줄\s*요약/im);
  });
});
