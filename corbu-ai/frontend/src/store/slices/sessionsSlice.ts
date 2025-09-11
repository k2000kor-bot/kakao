import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { updateProjectMessageCount } from './projectsSlice';

// 타입 정의
interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: string;
    isBookmarked?: boolean;
    metadata?: {
        model?: string;
        tokens?: number;
        responseTime?: number;
        confidence?: number;
    };
}

interface Session {
    id: string;
    projectId: string;
    name: string;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
    metadata: {
        totalTokens: number;
        avgResponseTime: number;
    };
}

interface SessionsState {
    sessions: Session[];
    currentSession: Session | null;
    loading: boolean;
    error: string | null;
}

const initialState: SessionsState = {
    sessions: [],
    currentSession: null,
    loading: false,
    error: null,
};

// Async Thunks
export const fetchSessions = createAsyncThunk(
    'sessions/fetchSessions',
    async (projectId: string, { rejectWithValue }) => {
        try {
            const sessions = await api.getSessions(projectId);
            return sessions;
        } catch (error) {
            return rejectWithValue(api.handleError(error));
        }
    }
);

export const fetchSession = createAsyncThunk(
    'sessions/fetchSession',
    async (sessionId: string, { rejectWithValue }) => {
        try {
            const session = await api.getSession(sessionId);
            return session;
        } catch (error) {
            return rejectWithValue(api.handleError(error));
        }
    }
);

export const createSession = createAsyncThunk(
    'sessions/createSession',
    async (sessionData: {
        projectId: string;
        name?: string;
    }, { rejectWithValue }) => {
        try {
            const session = await api.createSession(sessionData);
            return session;
        } catch (error) {
            return rejectWithValue(api.handleError(error));
        }
    }
);

export const updateSession = createAsyncThunk(
    'sessions/updateSession',
    async ({ sessionId, updates }: { sessionId: string; updates: Partial<Session> }, { rejectWithValue }) => {
        try {
            const session = await api.updateSession(sessionId, updates);
            return session;
        } catch (error) {
            return rejectWithValue(api.handleError(error));
        }
    }
);

export const deleteSession = createAsyncThunk(
    'sessions/deleteSession',
    async (sessionId: string, { rejectWithValue }) => {
        try {
            const success = await api.deleteSession(sessionId);
            if (success) {
                return sessionId;
            }
            throw new Error('세션 삭제에 실패했습니다.');
        } catch (error) {
            return rejectWithValue(api.handleError(error));
        }
    }
);

export const sendMessage = createAsyncThunk(
    'sessions/sendMessage',
    async (messageData: {
        sessionId: string;
        content: string;
        role?: 'user' | 'assistant';
        projectId?: string;
    }, { rejectWithValue, dispatch }) => {
        try {
            const result = await api.sendMessage(messageData);

            // 프로젝트 메시지 카운트 업데이트
            if (messageData.projectId) {
                dispatch(updateProjectMessageCount({
                    projectId: messageData.projectId,
                    count: 2 // 사용자 메시지 + AI 응답
                }));
            }

            return result;
        } catch (error) {
            return rejectWithValue(api.handleError(error));
        }
    }
);

export const fetchMessages = createAsyncThunk(
    'sessions/fetchMessages',
    async (sessionId: string, { rejectWithValue }) => {
        try {
            const messages = await api.getMessages(sessionId);
            return { sessionId, messages };
        } catch (error) {
            return rejectWithValue(api.handleError(error));
        }
    }
);

// Slice
const sessionsSlice = createSlice({
    name: 'sessions',
    initialState,
    reducers: {
        setCurrentSession: (state, action: PayloadAction<string | null>) => {
            if (action.payload) {
                state.currentSession = state.sessions.find(s => s.id === action.payload) || null;
            } else {
                state.currentSession = null;
            }
        },
        clearSessions: (state) => {
            state.sessions = [];
            state.currentSession = null;
            state.error = null;
        },
        addMessageToSession: (state, action: PayloadAction<{ sessionId: string; message: Message }>) => {
            const session = state.sessions.find(s => s.id === action.payload.sessionId);
            if (session) {
                session.messages.push(action.payload.message);
                session.updatedAt = new Date().toISOString();
            }
            if (state.currentSession?.id === action.payload.sessionId) {
                state.currentSession.messages.push(action.payload.message);
                state.currentSession.updatedAt = new Date().toISOString();
            }
        },
        updateSessionMetadata: (state, action: PayloadAction<{
            sessionId: string;
            metadata: { totalTokens?: number; avgResponseTime?: number; }
        }>) => {
            const session = state.sessions.find(s => s.id === action.payload.sessionId);
            if (session) {
                session.metadata = { ...session.metadata, ...action.payload.metadata };
            }
            if (state.currentSession?.id === action.payload.sessionId) {
                state.currentSession.metadata = { ...state.currentSession.metadata, ...action.payload.metadata };
            }
        },
        toggleMessageBookmark: (state, action: PayloadAction<{ sessionId: string; messageId: string }>) => {
            const { sessionId, messageId } = action.payload;
            const session = state.sessions.find(s => s.id === sessionId);
            if (session) {
                const message = session.messages.find(m => m.id === messageId);
                if (message) {
                    message.isBookmarked = !message.isBookmarked;
                }
            }
            if (state.currentSession?.id === sessionId) {
                const message = state.currentSession.messages.find(m => m.id === messageId);
                if (message) {
                    message.isBookmarked = !message.isBookmarked;
                }
            }
        },
    },
    extraReducers: (builder) => {
        // fetchSessions
        builder
            .addCase(fetchSessions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSessions.fulfilled, (state, action) => {
                state.loading = false;
                state.sessions = action.payload;
                state.error = null;
            })
            .addCase(fetchSessions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // fetchSession
        builder
            .addCase(fetchSession.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSession.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    const existingIndex = state.sessions.findIndex(s => s.id === action.payload!.id);
                    if (existingIndex >= 0) {
                        state.sessions[existingIndex] = action.payload;
                    } else {
                        state.sessions.push(action.payload);
                    }
                }
                state.error = null;
            })
            .addCase(fetchSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // createSession
        builder
            .addCase(createSession.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createSession.fulfilled, (state, action) => {
                state.loading = false;
                state.sessions.push(action.payload);
                state.currentSession = action.payload;
                state.error = null;
            })
            .addCase(createSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // updateSession
        builder
            .addCase(updateSession.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateSession.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    const index = state.sessions.findIndex(s => s.id === action.payload!.id);
                    if (index >= 0) {
                        state.sessions[index] = action.payload;
                    }
                    if (state.currentSession?.id === action.payload.id) {
                        state.currentSession = action.payload;
                    }
                }
                state.error = null;
            })
            .addCase(updateSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // deleteSession
        builder
            .addCase(deleteSession.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteSession.fulfilled, (state, action) => {
                state.loading = false;
                state.sessions = state.sessions.filter(s => s.id !== action.payload);
                if (state.currentSession?.id === action.payload) {
                    state.currentSession = null;
                }
                state.error = null;
            })
            .addCase(deleteSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // sendMessage
        builder
            .addCase(sendMessage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.loading = false;
                const { userMessage, aiResponse } = action.payload;

                // 사용자 메시지와 AI 응답을 세션에 추가
                const session = state.sessions.find(s => s.id === action.meta.arg.sessionId);
                if (session) {
                    session.messages.push(userMessage, aiResponse);
                    session.updatedAt = new Date().toISOString();
                }

                if (state.currentSession?.id === action.meta.arg.sessionId) {
                    state.currentSession.messages.push(userMessage, aiResponse);
                    state.currentSession.updatedAt = new Date().toISOString();
                }

                state.error = null;
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // fetchMessages
        builder
            .addCase(fetchMessages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.loading = false;
                const { sessionId, messages } = action.payload;
                const session = state.sessions.find(s => s.id === sessionId);
                if (session) {
                    session.messages = messages;
                }
                if (state.currentSession?.id === sessionId) {
                    state.currentSession.messages = messages;
                }
                state.error = null;
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});



export const {
    setCurrentSession,
    clearSessions,
    addMessageToSession,
    updateSessionMetadata,
    toggleMessageBookmark
} = sessionsSlice.actions;

export default sessionsSlice.reducer;
