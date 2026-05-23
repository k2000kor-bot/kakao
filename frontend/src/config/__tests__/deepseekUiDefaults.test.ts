/**
 * 딥시크 힌트 env 기본값 · 대화별 해석 · 신규 대화 스냅샷
 */
import {
  isDeepseekReviewHintsEnabled,
  isPipelineDeepseekRefineEnabled,
  isPipelineDeepseekReasonerEnabled,
  newConversationDeepseekDefaults,
  normalizeConversationDeepseekFlagsFromStorage,
  resolveDeepseekFlagsForConversation,
} from '../deepseekUiDefaults';

describe('deepseekUiDefaults', () => {
  const save = {
    REACT_APP_DEEPSEEK_REVIEW_HINTS: process.env.REACT_APP_DEEPSEEK_REVIEW_HINTS,
    REACT_APP_PIPELINE_DEEPSEEK_REFINE: process.env.REACT_APP_PIPELINE_DEEPSEEK_REFINE,
    REACT_APP_PIPELINE_DEEPSEEK_REASONER: process.env.REACT_APP_PIPELINE_DEEPSEEK_REASONER,
  };

  afterEach(() => {
    (Object.keys(save) as Array<keyof typeof save>).forEach((key) => {
      const v = save[key];
      if (v === undefined) delete process.env[key];
      else process.env[key] = v;
    });
  });

  it('기본: review·refine 켬, reasoner 끔', () => {
    delete process.env.REACT_APP_DEEPSEEK_REVIEW_HINTS;
    delete process.env.REACT_APP_PIPELINE_DEEPSEEK_REFINE;
    delete process.env.REACT_APP_PIPELINE_DEEPSEEK_REASONER;
    expect(isDeepseekReviewHintsEnabled()).toBe(true);
    expect(isPipelineDeepseekRefineEnabled()).toBe(true);
    expect(isPipelineDeepseekReasonerEnabled()).toBe(false);
    const snap = newConversationDeepseekDefaults();
    expect(snap).toEqual({
      deepseekReviewHints: true,
      pipelineDeepSeekRefine: true,
      pipelineDeepSeekReasoner: false,
    });
  });

  it('REACT_APP_DEEPSEEK_REVIEW_HINTS=false 이면 review·refine·reasoner 모두 끔', () => {
    process.env.REACT_APP_DEEPSEEK_REVIEW_HINTS = 'false';
    delete process.env.REACT_APP_PIPELINE_DEEPSEEK_REFINE;
    process.env.REACT_APP_PIPELINE_DEEPSEEK_REASONER = 'true';
    expect(isDeepseekReviewHintsEnabled()).toBe(false);
    const r = resolveDeepseekFlagsForConversation(undefined);
    expect(r).toEqual({ review: false, refine: false, reasoner: false });
    expect(newConversationDeepseekDefaults()).toEqual({
      deepseekReviewHints: false,
      pipelineDeepSeekRefine: false,
      pipelineDeepSeekReasoner: false,
    });
  });

  it('review 켠 상태에서 refine만 false면 refine·reasoner 끔', () => {
    delete process.env.REACT_APP_DEEPSEEK_REVIEW_HINTS;
    process.env.REACT_APP_PIPELINE_DEEPSEEK_REFINE = 'false';
    delete process.env.REACT_APP_PIPELINE_DEEPSEEK_REASONER;
    const r = resolveDeepseekFlagsForConversation(undefined);
    expect(r).toEqual({ review: true, refine: false, reasoner: false });
  });

  it('대화에 저장된 플래그가 전역보다 우선', () => {
    delete process.env.REACT_APP_DEEPSEEK_REVIEW_HINTS;
    delete process.env.REACT_APP_PIPELINE_DEEPSEEK_REFINE;
    delete process.env.REACT_APP_PIPELINE_DEEPSEEK_REASONER;
    const r = resolveDeepseekFlagsForConversation({
      deepseekReviewHints: true,
      pipelineDeepSeekRefine: true,
      pipelineDeepSeekReasoner: true,
    });
    expect(r).toEqual({ review: true, refine: true, reasoner: true });
  });

  it('대화에서 review만 끄면 refine·reasoner도 끔', () => {
    delete process.env.REACT_APP_DEEPSEEK_REVIEW_HINTS;
    delete process.env.REACT_APP_PIPELINE_DEEPSEEK_REFINE;
    process.env.REACT_APP_PIPELINE_DEEPSEEK_REASONER = 'true';
    const r = resolveDeepseekFlagsForConversation({
      deepseekReviewHints: false,
      pipelineDeepSeekRefine: true,
      pipelineDeepSeekReasoner: true,
    });
    expect(r).toEqual({ review: false, refine: false, reasoner: false });
  });

  describe('normalizeConversationDeepseekFlagsFromStorage', () => {
    it('세 필드가 모두 없으면 newConversationDeepseekDefaults와 동일하게 채움', () => {
      delete process.env.REACT_APP_DEEPSEEK_REVIEW_HINTS;
      delete process.env.REACT_APP_PIPELINE_DEEPSEEK_REFINE;
      delete process.env.REACT_APP_PIPELINE_DEEPSEEK_REASONER;
      const out = normalizeConversationDeepseekFlagsFromStorage({});
      expect(out).toEqual({
        deepseekReviewHints: true,
        pipelineDeepSeekRefine: true,
        pipelineDeepSeekReasoner: false,
      });
    });

    it('기존 필드는 유지하고 빠진 키만 기본으로 보정', () => {
      delete process.env.REACT_APP_DEEPSEEK_REVIEW_HINTS;
      delete process.env.REACT_APP_PIPELINE_DEEPSEEK_REFINE;
      delete process.env.REACT_APP_PIPELINE_DEEPSEEK_REASONER;
      const out = normalizeConversationDeepseekFlagsFromStorage({
        deepseekReviewHints: false,
      });
      expect(out.deepseekReviewHints).toBe(false);
      expect(out.pipelineDeepSeekRefine).toBe(true);
      expect(out.pipelineDeepSeekReasoner).toBe(false);
    });
  });
});
