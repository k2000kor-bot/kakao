import { buildComposerOversightPlan } from './composerOversightPipeline';
import {
  buildComposerOversightCouncilLayer,
  COUNCIL_PHASES,
  mergeComposerOversightCouncilIntoContext,
} from './composerOversightCouncil';

describe('composerOversightCouncil', () => {
  it('Council v2는 5단계 좌석을 정의한다', () => {
    expect(COUNCIL_PHASES).toHaveLength(5);
    expect(COUNCIL_PHASES[0].seat).toBe('intake_director');
    expect(COUNCIL_PHASES[4].seat).toBe('knowledge_guardian');
  });

  it('다중 요청 plan에 Council 지시·실행 브리프를 만든다', () => {
    const plan = buildComposerOversightPlan(
      '1) 시장 요약\n2) 보고서 초안 작성',
    );
    const council = buildComposerOversightCouncilLayer(plan);
    expect(council.enabled).toBe(true);
    expect(council.councilInstruction).toMatch(/Strategic Planner/);
    expect(council.executionBrief).toMatch(/성공 기준/);
    expect(council.consistencyCharter).toMatch(/일관성/);
  });

  it('mergeComposerOversightCouncilIntoContext는 v2 플래그를 넣는다', () => {
    const plan = buildComposerOversightPlan('질문: A?\n요구사항: 표 포함');
    const ctx = mergeComposerOversightCouncilIntoContext({}, plan);
    expect(ctx.composer_oversight_council_v2).toBe(true);
    expect(ctx.pipeline_verifier_rewrite).toBe(true);
    expect(Array.isArray(ctx.composer_oversight_council_phases)).toBe(true);
  });
});
