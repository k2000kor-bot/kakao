/**
 * @jest-environment jsdom
 */
import {
  CREATIVE_WRITINGS_STORAGE_KEY,
  UPLOADED_FILES_STORAGE_KEY,
  WRITING_HISTORY_STORAGE_KEY,
  WRITING_TEMPLATE_FAVORITES_STORAGE_KEY,
  WRITING_TEMPLATES_STORAGE_KEY,
} from '../writingUiStorageKeys';

describe('writingUiStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    expect(WRITING_HISTORY_STORAGE_KEY).toBe('writingHistory');
    expect(WRITING_TEMPLATE_FAVORITES_STORAGE_KEY).toBe('writingTemplateFavorites');
    expect(WRITING_TEMPLATES_STORAGE_KEY).toBe('writingTemplates');
    expect(UPLOADED_FILES_STORAGE_KEY).toBe('uploadedFiles');
    expect(CREATIVE_WRITINGS_STORAGE_KEY).toBe('creativeWritings');
  });
});
