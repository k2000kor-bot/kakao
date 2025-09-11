import { configureStore } from '@reduxjs/toolkit';
import projectsReducer from './slices/projectsSlice';
import sessionsReducer from './slices/sessionsSlice';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import collaborationReducer from './slices/collaborationSlice';
import aiEngineReducer from './slices/aiEngineSlice';

export const store = configureStore({
    reducer: {
        projects: projectsReducer,
        sessions: sessionsReducer,
        ui: uiReducer,
        auth: authReducer,
        collaboration: collaborationReducer,
        aiEngine: aiEngineReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
