/**
 * @jest-environment jsdom
 */
import {
  CURRENT_PROJECT_STORAGE_KEY,
  PROJECTS_STORAGE_KEY,
  PROJECT_CHAT_STRUCTURE_SESSIONS_STORAGE_KEY,
  SYSTEM_IMPORT_CHATS_STORAGE_KEY,
  SYSTEM_IMPORT_MESSAGES_STORAGE_KEY,
} from '../projectStorageKeys';
import {
  PROJECTS_STORAGE_KEY as P_PS,
  SYSTEM_IMPORT_CHATS_STORAGE_KEY as C_PS,
  SYSTEM_IMPORT_MESSAGES_STORAGE_KEY as M_PS,
} from '../projectService';
import {
  PROJECTS_STORAGE_KEY as P_PC,
  PROJECT_CHAT_STRUCTURE_SESSIONS_STORAGE_KEY as S_PC,
} from '../projectChatStructureService';

describe('projectStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    expect(PROJECTS_STORAGE_KEY).toBe('projects');
    expect(SYSTEM_IMPORT_CHATS_STORAGE_KEY).toBe('chats');
    expect(SYSTEM_IMPORT_MESSAGES_STORAGE_KEY).toBe('messages');
    expect(PROJECT_CHAT_STRUCTURE_SESSIONS_STORAGE_KEY).toBe('chatSessions');
    expect(CURRENT_PROJECT_STORAGE_KEY).toBe('currentProject');
  });

  it('projectService 재보내기와 동일', () => {
    expect(P_PS).toBe(PROJECTS_STORAGE_KEY);
    expect(C_PS).toBe(SYSTEM_IMPORT_CHATS_STORAGE_KEY);
    expect(M_PS).toBe(SYSTEM_IMPORT_MESSAGES_STORAGE_KEY);
  });

  it('projectChatStructureService 재보내기와 동일', () => {
    expect(P_PC).toBe(PROJECTS_STORAGE_KEY);
    expect(S_PC).toBe(PROJECT_CHAT_STRUCTURE_SESSIONS_STORAGE_KEY);
  });
});
