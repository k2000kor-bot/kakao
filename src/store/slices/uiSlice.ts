import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    sidebarOpen: boolean;
    darkMode: boolean;
    currentView: 'chat' | 'dashboard' | 'analytics' | 'settings';
    showNewProjectModal: boolean;
    showNewSessionModal: boolean;
    notifications: Notification[];
    isInitializing: boolean;
    selectedAIModel: 'gemini-pro' | 'gpt-4' | 'claude-3' | 'custom';
}

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    timestamp: Date;
    read: boolean;
    duration?: number;
}

const initialState: UIState = {
    sidebarOpen: true,
    darkMode: false,
    currentView: 'chat',
    showNewProjectModal: false,
    showNewSessionModal: false,
    notifications: [],
    isInitializing: true,
    selectedAIModel: 'gemini-pro',
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebarOpen: (state, action: PayloadAction<boolean>) => {
            state.sidebarOpen = action.payload;
        },
        toggleDarkMode: (state) => {
            state.darkMode = !state.darkMode;
        },
        setDarkMode: (state, action: PayloadAction<boolean>) => {
            state.darkMode = action.payload;
        },
        setCurrentView: (state, action: PayloadAction<UIState['currentView']>) => {
            state.currentView = action.payload;
        },
        setShowNewProjectModal: (state, action: PayloadAction<boolean>) => {
            state.showNewProjectModal = action.payload;
        },
        setShowNewSessionModal: (state, action: PayloadAction<boolean>) => {
            state.showNewSessionModal = action.payload;
        },
        addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
            const notification: Notification = {
                ...action.payload,
                id: Date.now().toString(),
                timestamp: new Date(),
                read: false,
            };
            state.notifications.unshift(notification);

            // 최대 50개의 알림만 유지
            if (state.notifications.length > 50) {
                state.notifications = state.notifications.slice(0, 50);
            }
        },
        markNotificationAsRead: (state, action: PayloadAction<string>) => {
            const notification = state.notifications.find(n => n.id === action.payload);
            if (notification) {
                notification.read = true;
            }
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter(n => n.id !== action.payload);
        },
        clearAllNotifications: (state) => {
            state.notifications = [];
        },
        setIsInitializing: (state, action: PayloadAction<boolean>) => {
            state.isInitializing = action.payload;
        },
        setSelectedAIModel: (state, action: PayloadAction<UIState['selectedAIModel']>) => {
            state.selectedAIModel = action.payload;
        },
    },
});

export const {
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
    setSelectedAIModel,
    clearAllNotifications,
    setIsInitializing,
} = uiSlice.actions;

export default uiSlice.reducer;
