import {
  buildComposerMultiRequestProgressState,
  computeComposerMultiRequestActiveIndex,
  getComposerMultiRequestItems,
} from '../composerMultiRequestProgress';

describe('composerMultiRequestProgress', () => {
  it('getComposerMultiRequestItems는 2개 이상 번호 목록만 반환한다', () => {
    expect(getComposerMultiRequestItems('단일 질문')).toEqual([]);
    const items = getComposerMultiRequestItems('1. 첫 번째\n2. 두 번째\n3. 세 번째');
    expect(items).toHaveLength(3);
  });

  it('computeComposerMultiRequestActiveIndex는 단계에 따라 증가한다', () => {
    expect(computeComposerMultiRequestActiveIndex(4, 'analyze', 0)).toBe(0);
    expect(computeComposerMultiRequestActiveIndex(4, 'verify', 0)).toBe(3);
  });

  it('buildComposerMultiRequestProgressState는 null 또는 진행 상태를 반환한다', () => {
    expect(buildComposerMultiRequestProgressState('안녕', 'analyze', 0)).toBeNull();
    const state = buildComposerMultiRequestProgressState('1. 첫 항목\n2. 둘째 항목', 'draft', 5000);
    expect(state?.items).toHaveLength(2);
    expect(state!.activeIndex).toBeGreaterThanOrEqual(0);
  });
});
