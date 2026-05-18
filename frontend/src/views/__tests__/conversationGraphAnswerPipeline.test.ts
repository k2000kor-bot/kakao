import {
  ASSISTANT_PLACEHOLDER_DRAFT,
  ASSISTANT_PLACEHOLDER_OUTLINE,
} from '../../utils/chatInputUtils';
import {
  createGraphAnswerPipelineController,
  resolveGraphAnswerDisplayText,
} from '../conversationGraphAnswerPipeline';

describe('conversationGraphAnswerPipeline', () => {
  it('resolveGraphAnswerDisplayText는 플레이스홀더·빈 문자열을 제외한다', () => {
    expect(resolveGraphAnswerDisplayText('')).toBe('');
    expect(resolveGraphAnswerDisplayText(ASSISTANT_PLACEHOLDER_OUTLINE)).toBe('');
    expect(resolveGraphAnswerDisplayText('관계도 요약 본문입니다.')).toBe('관계도 요약 본문입니다.');
  });

  it('플레이스홀더 뒤에 이어진 본문은 추출한다', () => {
    const mixed = `${ASSISTANT_PLACEHOLDER_OUTLINE}${ASSISTANT_PLACEHOLDER_DRAFT}최종 보고서`;
    expect(resolveGraphAnswerDisplayText(mixed)).toBe('최종 보고서');
  });

  it('handleAccumulated는 단계 UI 문구에서 phase를보내고 displayText는 비운다', () => {
    const phases: string[] = [];
    const ctrl = createGraphAnswerPipelineController({
      onPhase: (p) => phases.push(p),
    });
    const r = ctrl.handleAccumulated(ASSISTANT_PLACEHOLDER_DRAFT);
    expect(r.displayText).toBe('');
    expect(r.phase).toBe('draft');
    expect(phases).toContain('draft');
    ctrl.cancel();
  });

  it('handleMetadata는 generation_phase를 단계로 매핑한다', () => {
    const phases: string[] = [];
    const ctrl = createGraphAnswerPipelineController({
      onPhase: (p) => phases.push(p),
    });
    ctrl.handleMetadata({ generation_phase: 'crosscheck' });
    expect(phases).toContain('crosscheck');
    ctrl.cancel();
  });
});
