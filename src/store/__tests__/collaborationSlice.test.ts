/**
 * collaborationSlice 리듀서 테스트
 */

import collaborationReducer, {
  addCollaborator,
  removeCollaborator,
  updateCollaboratorStatus,
  setSharing,
  addTypingUser,
  removeTypingUser,
  clearTypingUsers,
} from '../slices/collaborationSlice';

const mockCollaborator = {
  id: 'c1',
  name: '협업자1',
  isOnline: true,
  lastSeen: '2024-01-01T00:00:00Z',
};

describe('collaborationSlice', () => {
  const getInitialState = () => collaborationReducer(undefined, { type: 'unknown' });

  it('초기 상태', () => {
    const state = getInitialState();
    expect(state.collaborators).toEqual([]);
    expect(state.isSharing).toBe(false);
    expect(state.sharedSessionId).toBeNull();
    expect(state.typingUsers).toEqual({});
  });

  it('addCollaborator - 새 협업자', () => {
    const state = collaborationReducer(getInitialState(), addCollaborator(mockCollaborator));
    expect(state.collaborators).toHaveLength(1);
    expect(state.collaborators[0]).toEqual(mockCollaborator);
  });

  it('addCollaborator - 기존 id면 업데이트', () => {
    let state = collaborationReducer(getInitialState(), addCollaborator(mockCollaborator));
    state = collaborationReducer(state, addCollaborator({ ...mockCollaborator, name: '업데이트됨' }));
    expect(state.collaborators).toHaveLength(1);
    expect(state.collaborators[0].name).toBe('업데이트됨');
  });

  it('removeCollaborator', () => {
    let state = collaborationReducer(getInitialState(), addCollaborator(mockCollaborator));
    state = collaborationReducer(state, removeCollaborator('c1'));
    expect(state.collaborators).toHaveLength(0);
  });

  it('updateCollaboratorStatus', () => {
    let state = collaborationReducer(getInitialState(), addCollaborator(mockCollaborator));
    state = collaborationReducer(state, updateCollaboratorStatus({ id: 'c1', isOnline: false, lastSeen: '2024-01-02T00:00:00Z' }));
    expect(state.collaborators[0].isOnline).toBe(false);
    expect(state.collaborators[0].lastSeen).toBe('2024-01-02T00:00:00Z');
  });

  it('setSharing', () => {
    const state = collaborationReducer(
      getInitialState(),
      setSharing({ isSharing: true, sessionId: 'sess-1' })
    );
    expect(state.isSharing).toBe(true);
    expect(state.sharedSessionId).toBe('sess-1');
  });

  it('setSharing - sessionId 없으면 null', () => {
    const state = collaborationReducer(getInitialState(), setSharing({ isSharing: false }));
    expect(state.sharedSessionId).toBeNull();
  });

  it('addTypingUser', () => {
    const state = collaborationReducer(
      getInitialState(),
      addTypingUser({ sessionId: 's1', userId: 'u1' })
    );
    expect(state.typingUsers['s1']).toEqual(['u1']);
  });

  it('addTypingUser - 같은 userId 중복 안 함', () => {
    let state = collaborationReducer(getInitialState(), addTypingUser({ sessionId: 's1', userId: 'u1' }));
    state = collaborationReducer(state, addTypingUser({ sessionId: 's1', userId: 'u1' }));
    expect(state.typingUsers['s1']).toEqual(['u1']);
  });

  it('removeTypingUser', () => {
    let state = collaborationReducer(getInitialState(), addTypingUser({ sessionId: 's1', userId: 'u1' }));
    state = collaborationReducer(state, removeTypingUser({ sessionId: 's1', userId: 'u1' }));
    expect(state.typingUsers['s1']).toEqual([]);
  });

  it('clearTypingUsers', () => {
    let state = collaborationReducer(getInitialState(), addTypingUser({ sessionId: 's1', userId: 'u1' }));
    state = collaborationReducer(state, clearTypingUsers('s1'));
    expect(state.typingUsers['s1']).toBeUndefined();
  });
});
