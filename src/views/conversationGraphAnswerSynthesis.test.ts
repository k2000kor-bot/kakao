import { mergeGraphAnswerWithDeterministicSections } from './conversationGraphAnswerSynthesis';

const structured = [
  '<!-- graph-structured-sections -->',
  '## 참여자 표',
  '| 알파 | 동조 | 12 |',
  '```mermaid',
  'flowchart TB',
  '  n0["알파"]',
  '```',
].join('\n');

describe('mergeGraphAnswerWithDeterministicSections', () => {
  it('LLM 본문이 없으면 구조화 블록만 반환', () => {
    expect(mergeGraphAnswerWithDeterministicSections('', structured)).toContain('## 참여자 표');
  });

  it('LLM 서술과 구조화 블록을 합성한다', () => {
    const llm = '## 한 줄 요약\n\n알파와 베타의 갈등이 있습니다.\n\n## 해석\n\n동조 축이 강합니다.';
    const merged = mergeGraphAnswerWithDeterministicSections(llm, structured);
    expect(merged).toContain('## 참여자 표');
    expect(merged).toContain('```mermaid');
    expect(merged).toContain('## 해석');
    expect(merged).toContain('알파와 베타');
  });

  it('LLM 본문이 짧아도 핵심 포인트·실행 제안 골격을 붙인다', () => {
    const llm = '알파와 베타 사이 갈등이 두드러집니다.';
    const merged = mergeGraphAnswerWithDeterministicSections(llm, structured);
    expect(merged).toContain('### 핵심 포인트');
    expect(merged).toContain('## 참여자 표');
    expect(merged).toContain('실행 제안');
  });
});
