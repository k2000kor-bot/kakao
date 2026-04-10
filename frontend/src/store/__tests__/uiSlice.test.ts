/**
 * uiSlice 리듀서 테스트
 */

import uiReducer, {
  toggleSidebar,
  setSidebarOpen,
  toggleDarkMode,
  setDarkMode,
  setCurrentView,
  setShowNewProjectModal,
  setShowNewSessionModal,
  addNotification,
  markNotificationAsRead,
  removeNotification,
  clearAllNotifications,
  setIsInitializing,
  setSelectedAIModel,
} from '../slices/uiSlice';

describe('uiSlice', () => {
  const getInitialState = () =>
    uiReducer(undefined, { type: 'unknown' });

  it('초기 상태', () => {
    const state = getInitialState();
    expect(state.sidebarOpen).toBe(true);
    expect(state.darkMode).toBe(false);
    expect(state.currentView).toBe('chat');
    expect(state.showNewProjectModal).toBe(false);
    expect(state.showNewSessionModal).toBe(false);
    expect(state.notifications).toEqual([]);
    expect(state.isInitializing).toBe(true);
    expect(state.selectedAIModel).toBe('gemini-pro');
  });

  it('toggleSidebar', () => {
    const state = uiReducer(getInitialState(), toggleSidebar());
    expect(state.sidebarOpen).toBe(false);
    const next = uiReducer(state, toggleSidebar());
    expect(next.sidebarOpen).toBe(true);
  });

  it('setSidebarOpen', () => {
    const state = uiReducer(getInitialState(), setSidebarOpen(false));
    expect(state.sidebarOpen).toBe(false);
    const next = uiReducer(state, setSidebarOpen(true));
    expect(next.sidebarOpen).toBe(true);
  });

  it('toggleDarkMode', () => {
    const state = uiReducer(getInitialState(), toggleDarkMode());
    expect(state.darkMode).toBe(true);
    const next = uiReducer(state, toggleDarkMode());
    expect(next.darkMode).toBe(false);
  });

  it('setDarkMode', () => {
    const state = uiReducer(getInitialState(), setDarkMode(true));
    expect(state.darkMode).toBe(true);
  });

  it('setCurrentView', () => {
    const state = uiReducer(getInitialState(), setCurrentView('dashboard'));
    expect(state.currentView).toBe('dashboard');
    const next = uiReducer(state, setCurrentView('analytics'));
    expect(next.currentView).toBe('analytics');
  });

  it('setShowNewProjectModal', () => {
    const state = uiReducer(getInitialState(), setShowNewProjectModal(true));
    expect(state.showNewProjectModal).toBe(true);
  });

  it('setShowNewSessionModal', () => {
    const state = uiReducer(getInitialState(), setShowNewSessionModal(true));
    expect(state.showNewSessionModal).toBe(true);
  });

  it('addNotification', () => {
    const state = uiReducer(
      getInitialState(),
      addNotification({ type: 'info', message: '테스트 알림' })
    );
    expect(state.notifications.length).toBe(1);
    expect(state.notifications[0].message).toBe('테스트 알림');
    expect(state.notifications[0].type).toBe('info');
    expect(state.notifications[0].read).toBe(false);
  });

  it('markNotificationAsRead', () => {
    let state = uiReducer(
      getInitialState(),
      addNotification({ type: 'info', message: '알림' })
    );
    const id = state.notifications[0].id;
    state = uiReducer(state, markNotificationAsRead(id));
    expect(state.notifications[0].read).toBe(true);
  });

  it('removeNotification', () => {
    let state = uiReducer(
      getInitialState(),
      addNotification({ type: 'info', message: '알림' })
    );
    const id = state.notifications[0].id;
    state = uiReducer(state, removeNotification(id));
    expect(state.notifications).toHaveLength(0);
  });

  it('clearAllNotifications', () => {
    let state = uiReducer(
      getInitialState(),
      addNotification({ type: 'info', message: '1' })
    );
    state = uiReducer(state, addNotification({ type: 'success', message: '2' }));
    state = uiReducer(state, clearAllNotifications());
    expect(state.notifications).toHaveLength(0);
  });

  it('setIsInitializing', () => {
    const state = uiReducer(getInitialState(), setIsInitializing(false));
    expect(state.isInitializing).toBe(false);
  });

  it('setSelectedAIModel', () => {
    const state = uiReducer(getInitialState(), setSelectedAIModel('gpt-4'));
    expect(state.selectedAIModel).toBe('gpt-4');
  });
});
