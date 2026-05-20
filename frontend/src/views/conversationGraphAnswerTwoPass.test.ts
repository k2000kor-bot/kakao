import {
  buildGraphAnswerOutlineContext,
  buildGraphAnswerReportContext,
  GRAPH_ANSWER_OUTLINE_KEY,
  GRAPH_ANSWER_SKIP_STRUCTURED_MERGE_KEY,
  isGraphAnswerTwoPassEnabled,
  shouldUseGraphAnswerTwoPass,
} from './conversationGraphAnswerTwoPass';
import { GRAPH_STRUCTURED_SECTIONS_KEY } from './conversationGraphDeterministicSections';

describe('conversationGraphAnswerTwoPass', () => {
  const prev = process.env.REACT_APP_GRAPH_ANSWER_TWO_PASS;

  beforeEach(() => {
    localStorage.removeItem('corbu.conversationGraph.uiPrefs');
  });

  afterEach(() => {
    if (prev === undefined) delete process.env.REACT_APP_GRAPH_ANSWER_TWO_PASS;
    else process.env.REACT_APP_GRAPH_ANSWER_TWO_PASS = prev;
    localStorage.removeItem('corbu.conversationGraph.uiPrefs');
  });

  it('env가 1이고 구조화 블록이 있으면 2-pass를 사용한다', () => {
    process.env.REACT_APP_GRAPH_ANSWER_TWO_PASS = '1';
    expect(isGraphAnswerTwoPassEnabled()).toBe(true);
    expect(
      shouldUseGraphAnswerTwoPass({
        [GRAPH_STRUCTURED_SECTIONS_KEY]: '## 참여자 표',
      }),
    ).toBe(true);
    expect(shouldUseGraphAnswerTwoPass({})).toBe(false);
  });

  it('UI prefs가 env보다 우선한다', () => {
    process.env.REACT_APP_GRAPH_ANSWER_TWO_PASS = '0';
    localStorage.setItem(
      'corbu.conversationGraph.uiPrefs',
      JSON.stringify({ useTwoPassAnswer: true }),
    );
    expect(isGraphAnswerTwoPassEnabled()).toBe(true);
    localStorage.setItem(
      'corbu.conversationGraph.uiPrefs',
      JSON.stringify({ useTwoPassAnswer: false }),
    );
    process.env.REACT_APP_GRAPH_ANSWER_TWO_PASS = '1';
    expect(isGraphAnswerTwoPassEnabled()).toBe(false);
  });

  it('개요 pass는 합성 생략·구조화 LLM 노출 생략 플래그를 켠다', () => {
    const ctx = buildGraphAnswerOutlineContext({
      answer_quality_instruction: '기본',
      [GRAPH_STRUCTURED_SECTIONS_KEY]: '표',
    });
    expect(ctx[GRAPH_ANSWER_SKIP_STRUCTURED_MERGE_KEY]).toBe(true);
    expect(ctx.conversation_graph_omit_structured_in_instruction).toBe(true);
    expect(String(ctx.answer_quality_instruction)).toContain('1차 개요');
  });

  it('보고서 pass는 개요를 context에 실고 합성 플래그를 끈다', () => {
    const ctx = buildGraphAnswerReportContext(
      { answer_quality_instruction: '기본' },
      '## 해석\n\n개요 본문',
    );
    expect(ctx[GRAPH_ANSWER_OUTLINE_KEY]).toContain('개요 본문');
    expect(ctx[GRAPH_ANSWER_SKIP_STRUCTURED_MERGE_KEY]).toBeUndefined();
    expect(ctx.conversation_graph_omit_structured_in_instruction).toBeUndefined();
    expect(String(ctx.answer_quality_instruction)).toContain('2차 보고서');
  });
});
