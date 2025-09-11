import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Collaborator {
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen: string;
    currentSessionId?: string;
}

interface CollaborationState {
    collaborators: Collaborator[];
    isSharing: boolean;
    sharedSessionId: string | null;
    typingUsers: { [sessionId: string]: string[] };
}

const initialState: CollaborationState = {
    collaborators: [],
    isSharing: false,
    sharedSessionId: null,
    typingUsers: {},
};

const collaborationSlice = createSlice({
    name: 'collaboration',
    initialState,
    reducers: {
        addCollaborator: (state, action: PayloadAction<Collaborator>) => {
            const existingIndex = state.collaborators.findIndex(c => c.id === action.payload.id);
            if (existingIndex >= 0) {
                state.collaborators[existingIndex] = action.payload;
            } else {
                state.collaborators.push(action.payload);
            }
        },
        removeCollaborator: (state, action: PayloadAction<string>) => {
            state.collaborators = state.collaborators.filter(c => c.id !== action.payload);
        },
        updateCollaboratorStatus: (state, action: PayloadAction<{ id: string; isOnline: boolean; lastSeen?: string }>) => {
            const collaborator = state.collaborators.find(c => c.id === action.payload.id);
            if (collaborator) {
                collaborator.isOnline = action.payload.isOnline;
                if (action.payload.lastSeen) {
                    collaborator.lastSeen = action.payload.lastSeen;
                }
            }
        },
        setSharing: (state, action: PayloadAction<{ isSharing: boolean; sessionId?: string }>) => {
            state.isSharing = action.payload.isSharing;
            state.sharedSessionId = action.payload.sessionId || null;
        },
        addTypingUser: (state, action: PayloadAction<{ sessionId: string; userId: string }>) => {
            const { sessionId, userId } = action.payload;
            if (!state.typingUsers[sessionId]) {
                state.typingUsers[sessionId] = [];
            }
            if (!state.typingUsers[sessionId].includes(userId)) {
                state.typingUsers[sessionId].push(userId);
            }
        },
        removeTypingUser: (state, action: PayloadAction<{ sessionId: string; userId: string }>) => {
            const { sessionId, userId } = action.payload;
            if (state.typingUsers[sessionId]) {
                state.typingUsers[sessionId] = state.typingUsers[sessionId].filter(id => id !== userId);
            }
        },
        clearTypingUsers: (state, action: PayloadAction<string>) => {
            delete state.typingUsers[action.payload];
        },
    },
});

export const {
    addCollaborator,
    removeCollaborator,
    updateCollaboratorStatus,
    setSharing,
    addTypingUser,
    removeTypingUser,
    clearTypingUsers,
} = collaborationSlice.actions;

export default collaborationSlice.reducer;
