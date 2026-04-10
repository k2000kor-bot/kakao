/**
 * @jest-environment jsdom
 */
import {
  CONSTRUCTION_COMPANIES_STORAGE_KEY,
  POLICY_UPDATES_STORAGE_KEY,
  REAL_ESTATE_LAWS_STORAGE_KEY,
  RECONSTRUCTION_PROJECTS_STORAGE_KEY,
} from '../realEstateKnowledgeStorageKeys';
import {
  CONSTRUCTION_COMPANIES_STORAGE_KEY as K_CO,
  POLICY_UPDATES_STORAGE_KEY as K_PO,
  REAL_ESTATE_LAWS_STORAGE_KEY as K_LAW,
  RECONSTRUCTION_PROJECTS_STORAGE_KEY as K_PR,
} from '../realEstateKnowledgeService';

describe('realEstateKnowledgeStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    expect(REAL_ESTATE_LAWS_STORAGE_KEY).toBe('real_estate_laws');
    expect(RECONSTRUCTION_PROJECTS_STORAGE_KEY).toBe('reconstruction_projects');
    expect(CONSTRUCTION_COMPANIES_STORAGE_KEY).toBe('construction_companies');
    expect(POLICY_UPDATES_STORAGE_KEY).toBe('policy_updates');
  });

  it('realEstateKnowledgeService 재보내기와 동일', () => {
    expect(K_LAW).toBe(REAL_ESTATE_LAWS_STORAGE_KEY);
    expect(K_PR).toBe(RECONSTRUCTION_PROJECTS_STORAGE_KEY);
    expect(K_CO).toBe(CONSTRUCTION_COMPANIES_STORAGE_KEY);
    expect(K_PO).toBe(POLICY_UPDATES_STORAGE_KEY);
  });
});
