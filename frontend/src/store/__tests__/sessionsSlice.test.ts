/**
 * sessionsSlice 리듀서 테스트
 */

import sessionsReducer, {
  setCurrentSession,
  clearSessions,
  addMessageToSession,
  updateSessionMetadata,
  toggleMessageBookmark,
  fetchSessions,
  fetchSession,
  createSession,
  updateSession,
  deleteSession,
  sendMessage,
  fetchMessages,
} from '../slices/sessionsSlice';

jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {},
}));

const mockMessage = {
  id: 'm1',
  content: '메시지',
  role: 'user' as const,
  timestamp: '2024-01-01T00:00:00Z',
};

const mockSession = {
  id: 's1',
  projectId: 'p1',
  name: '세션1',
  messages: [mockMessage],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  metadata: { totalTokens: 0, avgResponseTime: 0 },
};

describe('sessionsSlice', () => {
  const getInitialState = () => sessionsReducer(undefined, { type: 'unknown' });

  it('초기 상태', () => {
    const state = getInitialState();
    expect(state.sessions).toEqual([]);
    expect(state.currentSession).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('setCurrentSession - id가 목록에 있으면 currentSession 설정', () => {
    let state = sessionsReducer(
      getInitialState(),
      fetchSessions.fulfilled([mockSession], 'p1')
    );
    state = sessionsReducer(state, setCurrentSession('s1'));
    expect(state.currentSession).toEqual(mockSession);
  });

  it('setCurrentSession - null이면 currentSession null', () => {
    let state = sessionsReducer(
      getInitialState(),
      fetchSessions.fulfilled([mockSession], 'p1')
    );
    state = sessionsReducer(state, setCurrentSession(null));
    expect(state.currentSession).toBeNull();
  });

  it('clearSessions', () => {
    let state = sessionsReducer(
      getInitialState(),
      fetchSessions.fulfilled([mockSession], 'p1')
    );
    state = sessionsReducer(state, clearSessions());
    expect(state.sessions).toEqual([]);
    expect(state.currentSession).toBeNull();
    expect(state.error).toBeNull();
  });

  it('addMessageToSession', () => {
    const newMsg = {
      id: 'm2',
      content: '새 메시지',
      role: 'assistant' as const,
      timestamp: new Date().toISOString(),
    };
    let state = sessionsReducer(
      getInitialState(),
      fetchSessions.fulfilled([mockSession], 'p1')
    );
    state = sessionsReducer(
      state,
      addMessageToSession({ sessionId: 's1', message: newMsg })
    );
    expect(state.sessions[0].messages).toHaveLength(2);
    expect(state.sessions[0].messages[1].content).toBe('새 메시지');
  });

  it('updateSessionMetadata', () => {
    let state = sessionsReducer(
      getInitialState(),
      fetchSessions.fulfilled([mockSession], 'p1')
    );
    state = sessionsReducer(
      state,
      updateSessionMetadata({ sessionId: 's1', metadata: { totalTokens: 100 } })
    );
    expect(state.sessions[0].metadata.totalTokens).toBe(100);
  });

  it('toggleMessageBookmark', () => {
    let state = sessionsReducer(
      getInitialState(),
      fetchSessions.fulfilled([{ ...mockSession, messages: [{ ...mockMessage, isBookmarked: false }] }], 'p1')
    );
    state = sessionsReducer(
      state,
      toggleMessageBookmark({ sessionId: 's1', messageId: 'm1' })
    );
    expect(state.sessions[0].messages[0].isBookmarked).toBe(true);
  });

  it('fetchSessions.fulfilled', () => {
    const state = sessionsReducer(
      getInitialState(),
      fetchSessions.fulfilled([mockSession], 'p1')
    );
    expect(state.sessions).toEqual([mockSession]);
    expect(state.loading).toBe(false);
  });

  it('fetchSessions.rejected - error 설정', () => {
    const state = sessionsReducer(
      getInitialState(),
      fetchSessions.rejected(new Error('fail'), 'p1', undefined, '세션 목록 조회 실패')
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('세션 목록 조회 실패');
  });

  it('fetchSession.fulfilled - 기존 항목 업데이트', () => {
    let state = sessionsReducer(
      getInitialState(),
      fetchSessions.fulfilled([mockSession], 'p1')
    );
    const updated = { ...mockSession, name: '세션1 수정됨' };
    state = sessionsReducer(state, fetchSession.fulfilled(updated, 's1'));
    expect(state.sessions[0].name).toBe('세션1 수정됨');
  });

  it('fetchSession.rejected - error 설정', () => {
    const state = sessionsReducer(
      getInitialState(),
      fetchSession.rejected(new Error('fail'), 's1', undefined, '세션 조회 실패')
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('세션 조회 실패');
  });

  it('createSession.fulfilled - currentSession 설정', () => {
    const state = sessionsReducer(
      getInitialState(),
      createSession.fulfilled(mockSession, '', { projectId: 'p1' })
    );
    expect(state.sessions).toHaveLength(1);
    expect(state.currentSession).toEqual(mockSession);
  });

  it('updateSession.fulfilled', () => {
    let state = sessionsReducer(
      getInitialState(),
      fetchSessions.fulfilled([mockSession], 'p1')
    );
    const updated = { ...mockSession, name: '수정됨' };
    state = sessionsReducer(
      state,
      updateSession.fulfilled(updated, '', { sessionId: 's1', updates: { name: '수정됨' } })
    );
    expect(state.sessions[0].name).toBe('수정됨');
  });

  it('deleteSession.fulfilled', () => {
    let state = sessionsReducer(
      getInitialState(),
      fetchSessions.fulfilled([mockSession], 'p1')
    );
    state = sessionsReducer(state, setCurrentSession('s1'));
    state = sessionsReducer(state, deleteSession.fulfilled('s1', ''));
    expect(state.sessions).toHaveLength(0);
    expect(state.currentSession).toBeNull();
  });

  it('sendMessage.fulfilled - 메시지 추가', () => {
    const userMsg = { id: 'u1', content: '유저', role: 'user' as const, timestamp: '' };
    const aiMsg = { id: 'a1', content: 'AI', role: 'assistant' as const, timestamp: '' };
    let state = sessionsReducer(
      getInitialState(),
      fetchSessions.fulfilled([mockSession], 'p1')
    );
    state = sessionsReducer(
      state,
      sendMessage.fulfilled(
        { userMessage: userMsg, aiResponse: aiMsg },
        '',
        { sessionId: 's1', content: '유저', projectId: 'p1' }
      )
    );
    expect(state.sessions[0].messages).toHaveLength(3);
  });

  it('fetchMessages.fulfilled', () => {
    const messages = [mockMessage];
    let state = sessionsReducer(
      getInitialState(),
      fetchSessions.fulfilled([mockSession], 'p1')
    );
    state = sessionsReducer(
      state,
      fetchMessages.fulfilled({ sessionId: 's1', messages }, '')
    );
    expect(state.sessions[0].messages).toEqual(messages);
  });
});
