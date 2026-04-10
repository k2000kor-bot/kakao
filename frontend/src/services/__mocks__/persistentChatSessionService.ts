/**
 * persistentChatSessionService 수동 목 — jest.mock('../../services/persistentChatSessionService') 시 사용
 */

export const persistentChatServiceTestDouble = {
    getSessions: jest.fn(() => Promise.resolve([])),
    createSession: jest.fn(() => Promise.resolve({ id: '1', title: '새 세션' })),
    getSessionMessages: jest.fn(() => Promise.resolve([])),
    saveMessage: jest.fn(() => Promise.resolve({})),
    getActiveSessions: jest.fn(() => Promise.resolve([])),
    getSessionStats: jest.fn(() => ({
        totalSessions: 0,
        activeSessions: 0,
        archivedSessions: 0,
        totalMessages: 0,
        averageSessionDuration: 0,
        mostActiveTopics: [] as string[],
    })),
    addMessageToSession: jest.fn(() => Promise.resolve({})),
    createPersistentChatSession: jest.fn(() => Promise.resolve({ id: '1', title: '새 세션' })),
    getSession: jest.fn(() => null),
    archiveSession: jest.fn(() => Promise.resolve(true)),
    searchSessions: jest.fn(() => []),
    updateSession: jest.fn(() => Promise.resolve({})),
    deleteSession: jest.fn(() => Promise.resolve({})),
};

const PersistentChatSessionServiceMock = {
    getInstance() {
        return persistentChatServiceTestDouble;
    },
};

export default PersistentChatSessionServiceMock;
