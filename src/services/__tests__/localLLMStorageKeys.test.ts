import {
  LOCAL_LLM_PROVIDERS_STORAGE_KEY,
  PROJECT_LLM_CONFIGS_STORAGE_KEY,
  USE_LOCAL_LLM_STORAGE_KEY,
} from '../localLLMStorageKeys';
import {
  LOCAL_LLM_PROVIDERS_STORAGE_KEY as K_PROVIDERS_SVC,
  PROJECT_LLM_CONFIGS_STORAGE_KEY as K_CONFIGS_SVC,
  USE_LOCAL_LLM_STORAGE_KEY as K_USE_LOCAL_SVC,
} from '../localLLMService';

describe('localLLMStorageKeys', () => {
  it('localStorage 키 문자열 계약(기존 사용자 데이터와 호환)', () => {
    expect(LOCAL_LLM_PROVIDERS_STORAGE_KEY).toBe('localLLMProviders');
    expect(PROJECT_LLM_CONFIGS_STORAGE_KEY).toBe('projectLLMConfigs');
    expect(USE_LOCAL_LLM_STORAGE_KEY).toBe('useLocalLLM');
  });

  it('localLLMService 재보내기가 키 전용 모듈과 동일하다', () => {
    expect(K_PROVIDERS_SVC).toBe(LOCAL_LLM_PROVIDERS_STORAGE_KEY);
    expect(K_CONFIGS_SVC).toBe(PROJECT_LLM_CONFIGS_STORAGE_KEY);
    expect(K_USE_LOCAL_SVC).toBe(USE_LOCAL_LLM_STORAGE_KEY);
  });
});
