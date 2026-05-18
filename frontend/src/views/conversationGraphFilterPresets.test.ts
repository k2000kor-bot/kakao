import {
  GRAPH_FILTER_PRESETS,
  graphFilterPresetLabel,
  stanceFilterForPreset,
} from './conversationGraphFilterPresets';

describe('conversationGraphFilterPresets', () => {
  it('stanceFilterForPreset은 프리셋별 입장 필터를 만든다', () => {
    expect(stanceFilterForPreset('all')).toEqual({ 동조: true, 반대: true, 중립: true });
    expect(stanceFilterForPreset('동조')).toEqual({ 동조: true, 반대: false, 중립: false });
  });

  it('GRAPH_FILTER_PRESETS는 UI 버튼용 id 목록을 제공한다', () => {
    expect(GRAPH_FILTER_PRESETS).toContain('all');
    expect(graphFilterPresetLabel('반대')).toBe('반대만');
  });
});
