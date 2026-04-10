import { DOMAIN_KNOWLEDGE_CONFIG_STORAGE_KEY } from '../domainKnowledgeStorageKeys';
import { DOMAIN_KNOWLEDGE_CONFIG_STORAGE_KEY as K_SVC } from '../domainKnowledgeService';

describe('domainKnowledgeStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    expect(DOMAIN_KNOWLEDGE_CONFIG_STORAGE_KEY).toBe('domainKnowledgeConfig');
  });

  it('domainKnowledgeService 재보내기와 동일', () => {
    expect(K_SVC).toBe(DOMAIN_KNOWLEDGE_CONFIG_STORAGE_KEY);
  });
});
