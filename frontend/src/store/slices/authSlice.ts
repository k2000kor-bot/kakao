import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CORBU_AUTH_TOKEN_STORAGE_KEY } from '../../services/authStorageKeys';

interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    role: 'admin' | 'user';
    preferences: {
        theme: 'light' | 'dark' | 'auto';
        language: 'ko' | 'en';
        notifications: boolean;
    };
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    token: string | null;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    token: localStorage.getItem(CORBU_AUTH_TOKEN_STORAGE_KEY),
};

// 비동기 액션들
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            // 실제 구현에서는 API 호출
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 임시 사용자 데이터
            const user: User = {
                id: '1',
                email: credentials.email,
                name: 'CORBU.AI 사용자',
                role: 'admin',
                preferences: {
                    theme: 'light',
                    language: 'ko',
                    notifications: true,
                },
            };

            const token = 'mock_jwt_token_' + Date.now();
            localStorage.setItem(CORBU_AUTH_TOKEN_STORAGE_KEY, token);

            return { user, token };
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            localStorage.removeItem(CORBU_AUTH_TOKEN_STORAGE_KEY);
            return null;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Logout failed');
        }
    }
);

export const verifyToken = createAsyncThunk(
    'auth/verifyToken',
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState() as { auth: AuthState };
            const token = state.auth.token;

            if (!token) {
                throw new Error('No token found');
            }

            // 실제 구현에서는 토큰 검증 API 호출
            await new Promise(resolve => setTimeout(resolve, 500));

            // 임시 사용자 데이터
            const user: User = {
                id: '1',
                email: 'user@corbu.ai',
                name: 'CORBU.AI 사용자',
                role: 'admin',
                preferences: {
                    theme: 'light',
                    language: 'ko',
                    notifications: true,
                },
            };

            return user;
        } catch (error) {
            localStorage.removeItem(CORBU_AUTH_TOKEN_STORAGE_KEY);
            return rejectWithValue(error instanceof Error ? error.message : 'Token verification failed');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        updateUserPreferences: (state, action: PayloadAction<Partial<User['preferences']>>) => {
            if (state.user) {
                state.user.preferences = { ...state.user.preferences, ...action.payload };
            }
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
    },
    extraReducers: (builder) => {
        builder
            // loginUser
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
            })
            // logoutUser
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            // verifyToken
            .addCase(verifyToken.pending, (state) => {
                state.loading = true;
            })
            .addCase(verifyToken.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(verifyToken.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            });
    },
});

export const { clearError, updateUserPreferences, setUser } = authSlice.actions;
export default authSlice.reducer;
