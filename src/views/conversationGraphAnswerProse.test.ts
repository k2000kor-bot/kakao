import {
  buildGraphAnswerWritingStyleInstruction,
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
