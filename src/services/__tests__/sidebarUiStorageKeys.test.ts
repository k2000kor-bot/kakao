/**
 * @jest-environment jsdom
 */
import { SELECTED_AI_MODEL_STORAGE_KEY } from '../sidebarUiStorageKeys';

describe('sidebarUiStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    expect(SELECTED_AI_MODEL_STORAGE_KEY).toBe('selectedAIModel');
  });
});
