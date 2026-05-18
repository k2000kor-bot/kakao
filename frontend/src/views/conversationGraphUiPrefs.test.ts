import {
  loadConversationGraphUiPrefs,
  saveConversationGraphUiPrefs,
} from './conversationGraphUiPrefs';

describe('conversationGraphUiPrefs', () => {
  beforeEach(() => {
    localStorage.removeItem('corbu.conversationGraph.uiPrefs');
  });

  it('저장 키가 없으면 빈 객체를 반환한다', () => {
    expect(loadConversationGraphUiPrefs()).toEqual({});
  });

  it('save는 기존 설정에 패치를 병합한다', () => {
    saveConversationGraphUiPrefs({ graphLayoutMode: 'force' });
    saveConversationGraphUiPrefs({ autoGenerateAnswer: true });
    expect(loadConversationGraphUiPrefs()).toEqual({
      graphLayoutMode: 'force',
      autoGenerateAnswer: true,
    });
  });

  it('손상된 JSON은 무시하고 빈 객체를 반환한다', () => {
    localStorage.setItem('corbu.conversationGraph.uiPrefs', 'not-json');
    expect(loadConversationGraphUiPrefs()).toEqual({});
  });
});
