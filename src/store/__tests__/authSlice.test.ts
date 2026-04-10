/**
 * authSlice 리듀서 테스트
 * @jest-environment jsdom
 */

import authReducer, {
  clearError,
  updateUserPreferences,
  setUser,
  loginUser,
  logoutUser,
  verifyToken,
} from '../slices/authSlice';

const mockUser = {
  id: '1',
  email: 'user@test.com',
  name: '테스트 사용자',
  role: 'user' as const,
  preferences: {
    theme: 'light' as const,
    language: 'ko' as const,
    notifications: true,
  },
};

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const getInitialState = () => authReducer(undefined, { type: 'unknown' });

  it('초기 상태', () => {
    const state = getInitialState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.token).toBeNull();
  });

  it('clearError', () => {
    let state = authReducer(
      getInitialState(),
      loginUser.rejected(new Error('err'), 'loginUser', {}, 'err')
    );
    expect(state.error).toBe('err');
    state = authReducer(state, clearError());
    expect(state.error).toBeNull();
  });

  it('updateUserPreferences - user 있을 때', () => {
    let state = authReducer(getInitialState(), setUser(mockUser));
    state = authReducer(state, updateUserPreferences({ theme: 'dark' }));
    expect(state.user?.preferences.theme).toBe('dark');
    expect(state.user?.preferences.language).toBe('ko');
  });

  it('updateUserPreferences - user 없을 때 변경 없음', () => {
    const state = authReducer(
      getInitialState(),
      updateUserPreferences({ theme: 'dark' })
    );
    expect(state.user).toBeNull();
  });

  it('setUser', () => {
    const state = authReducer(getInitialState(), setUser(mockUser));
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('loginUser.pending', () => {
    const state = authReducer(
      getInitialState(),
      loginUser.pending('', { email: 'a', password: 'b' })
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('loginUser.fulfilled', () => {
    const state = authReducer(
      getInitialState(),
      loginUser.fulfilled(
        { user: mockUser, token: 'jwt-123' },
        '',
        { email: 'a', password: 'b' }
      )
    );
    expect(state.loading).toBe(false);
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('jwt-123');
    expect(state.isAuthenticated).toBe(true);
  });

  it('loginUser.rejected', () => {
    const state = authReducer(
      getInitialState(),
      loginUser.rejected(new Error('fail'), '', { email: 'a', password: 'b' }, 'fail')
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('fail');
    expect(state.isAuthenticated).toBe(false);
  });

  it('logoutUser.fulfilled', () => {
    let state = authReducer(getInitialState(), setUser(mockUser));
    state = authReducer(state, logoutUser.fulfilled(null, ''));
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeNull();
  });

  it('verifyToken.pending', () => {
    let state = authReducer(
      getInitialState(),
      loginUser.fulfilled(
        { user: mockUser, token: 't' },
        '',
        { email: '', password: '' }
      )
    );
    state = authReducer(state, verifyToken.pending(''));
    expect(state.loading).toBe(true);
  });

  it('verifyToken.fulfilled', () => {
    let state = authReducer(getInitialState(), verifyToken.pending(''));
    state = authReducer(state, verifyToken.fulfilled(mockUser, ''));
    expect(state.loading).toBe(false);
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('verifyToken.rejected', () => {
    let state = authReducer(
      getInitialState(),
      loginUser.fulfilled(
        { user: mockUser, token: 't' },
        '',
        { email: '', password: '' }
      )
    );
    state = authReducer(state, verifyToken.rejected(new Error('invalid'), ''));
    expect(state.loading).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
