/**
 * store index 통합 테스트
 */

import { store } from '../index';

jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {},
}));

describe('store', () => {
  it('getState에 모든 slice 키 존재', () => {
    const state = store.getState();
    expect(state).toHaveProperty('projects');
    expect(state).toHaveProperty('sessions');
    expect(state).toHaveProperty('ui');
    expect(state).toHaveProperty('auth');
    expect(state).toHaveProperty('collaboration');
    expect(state).toHaveProperty('aiEngine');
  });

  it('projects 초기 상태', () => {
    const state = store.getState();
    expect(state.projects.projects).toEqual([]);
    expect(state.projects.currentProject).toBeNull();
    expect(state.projects.loading).toBe(false);
    expect(state.projects.error).toBeNull();
  });

  it('sessions 초기 상태', () => {
    const state = store.getState();
    expect(state.sessions.sessions).toEqual([]);
    expect(state.sessions.currentSession).toBeNull();
    expect(state.sessions.loading).toBe(false);
    expect(state.sessions.error).toBeNull();
  });

  it('ui 초기 상태', () => {
    const state = store.getState();
    expect(state.ui.sidebarOpen).toBe(true);
    expect(state.ui.currentView).toBe('chat');
    expect(state.ui.notifications).toEqual([]);
  });

  it('auth 초기 상태', () => {
    const state = store.getState();
    expect(state.auth.user).toBeNull();
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.auth.loading).toBe(false);
    expect(state.auth.error).toBeNull();
  });

  it('collaboration 초기 상태', () => {
    const state = store.getState();
    expect(state.collaboration.collaborators).toEqual([]);
    expect(state.collaboration.isSharing).toBe(false);
    expect(state.collaboration.sharedSessionId).toBeNull();
    expect(state.collaboration.typingUsers).toEqual({});
  });

  it('aiEngine 초기 상태', () => {
    const state = store.getState();
    expect(state.aiEngine.realtimeAnalysis.isActive).toBe(false);
    expect(state.aiEngine.aiModels.currentModel).toBe('enhanced_unified');
    expect(state.aiEngine.websocket.connectionStatus).toBe('disconnected');
    expect(state.aiEngine.errors.hasError).toBe(false);
  });

  it('dispatch 동작', () => {
    const prev = store.getState().ui.sidebarOpen;
    store.dispatch({ type: 'ui/toggleSidebar' });
    expect(store.getState().ui.sidebarOpen).toBe(!prev);
  });
});
