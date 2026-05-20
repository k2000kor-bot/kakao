import {
  buildComposerOversightPipelineExtras,
  buildComposerOversightPlan,
  mergeComposerOversightIntoContext,
} from './composerOversightPipeline';

describe('composerOversightPipeline', () => {
  it('다중 번호 요청이면 작업 항목과 기획 지시를 만든다', () => {
    const plan = buildComposerOversightPlan('1) 요약해줘\n2) 보고서 작성해줘');
    expect(plan.enabled).toBe(true);
    expect(plan.workItems.length).toBeGreaterThanOrEqual(2);
    expect(plan.planMarkdown).toMatch(/중간 기획자/);
    expect(plan.planMarkdown).toMatch(/검증자/);
  });

  it('질문·요구 섹션이 있으면 항목을 분리한다', () => {
    const plan = buildComposerOversightPlan(
      '질문: 시장 전망은?\n요구사항: 3줄 요약과 표 포함',
    );
    expect(plan.enabled).toBe(true);
    expect(plan.hasStructuredQa).toBe(true);
    expect(plan.workItems.some((w) => w.kind === 'question')).toBe(true);
    expect(plan.workItems.some((w) => w.kind === 'requirement')).toBe(true);
  });

  it('mergeComposerOversightIntoContext는 API 키를 넣는다', () => {
    const plan = buildComposerOversightPlan('1) 첫 번째 요약해줘\n2) 두 번째 보고서 작성해줘');
    const ctx = mergeComposerOversightIntoContext({}, plan);
    expect(ctx.composer_oversight_enabled).toBe(true);
      expect(ctx.composer_oversight_council_v2).toBe(true);
      expect(String(ctx.composer_oversight_instruction)).toMatch(/Council/);
  });

  it('skipForSimpleQuery면 비활성', () => {
    const plan = buildComposerOversightPlan('오늘 할 일 정리해줘', { skipForSimpleQuery: true });
    expect(plan.enabled).toBe(false);
  });

  it('skipWhenGraphAnswer면 비활성', () => {
    const plan = buildComposerOversightPlan('1) A\n2) B', { skipWhenGraphAnswer: true });
    expect(plan.enabled).toBe(false);
  });

  it('includeSelfDevelop면 기획 지시에 자가 개발 단계를 포함한다', () => {
    const plan = buildComposerOversightPlan('1) 요약\n2) 보고서 작성', {
      includeSelfDevelop: true,
    });
    expect(plan.planMarkdown).toMatch(/자가 개발/);
    expect(plan.planMarkdown).toMatch(/evolve/);
  });

  it('buildComposerOversightPipelineExtras는 Council 메타를 extras로 만든다', () => {
    const ex = buildComposerOversightPipelineExtras({
      composer_oversight_enabled: true,
      composer_oversight_council_v2: true,
      composer_oversight_has_multiple: true,
      composer_oversight_work_items: [{ index: 1 }, { index: 2 }],
    });
    expect(ex?.composerOversightCouncilV2).toBe(true);
    expect(ex?.composerOversightWorkItemCount).toBe(2);
    expect(ex?.composerOversightHasMultiple).toBe(true);
  });
});
