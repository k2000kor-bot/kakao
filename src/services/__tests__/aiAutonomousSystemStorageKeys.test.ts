/**
 * @jest-environment jsdom
 */
import {
  AUTONOMOUS_CAPABILITIES_STORAGE_KEY,
  AUTONOMOUS_EVOLUTIONS_STORAGE_KEY,
  SELF_DIAGNOSTICS_STORAGE_KEY,
  SELF_HEALING_ACTIONS_STORAGE_KEY,
  SYSTEM_CONSCIOUSNESS_STORAGE_KEY,
} from '../aiAutonomousSystemStorageKeys';
import {
  AUTONOMOUS_CAPABILITIES_STORAGE_KEY as K_CAP,
  AUTONOMOUS_EVOLUTIONS_STORAGE_KEY as K_EVO,
  SELF_DIAGNOSTICS_STORAGE_KEY as K_DIAG,
  SELF_HEALING_ACTIONS_STORAGE_KEY as K_HEAL,
  SYSTEM_CONSCIOUSNESS_STORAGE_KEY as K_CONS,
} from '../aiAutonomousSystemService';

describe('aiAutonomousSystemStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    expect(AUTONOMOUS_CAPABILITIES_STORAGE_KEY).toBe('autonomous_capabilities');
    expect(SELF_DIAGNOSTICS_STORAGE_KEY).toBe('self_diagnostics');
    expect(SELF_HEALING_ACTIONS_STORAGE_KEY).toBe('self_healing');
    expect(AUTONOMOUS_EVOLUTIONS_STORAGE_KEY).toBe('autonomous_evolutions');
    expect(SYSTEM_CONSCIOUSNESS_STORAGE_KEY).toBe('system_consciousness');
  });

  it('aiAutonomousSystemService 재보내기와 동일', () => {
    expect(K_CAP).toBe(AUTONOMOUS_CAPABILITIES_STORAGE_KEY);
    expect(K_DIAG).toBe(SELF_DIAGNOSTICS_STORAGE_KEY);
    expect(K_HEAL).toBe(SELF_HEALING_ACTIONS_STORAGE_KEY);
    expect(K_EVO).toBe(AUTONOMOUS_EVOLUTIONS_STORAGE_KEY);
    expect(K_CONS).toBe(SYSTEM_CONSCIOUSNESS_STORAGE_KEY);
  });
});
