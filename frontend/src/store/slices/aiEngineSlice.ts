import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import apiService from '../../services/api';

// AI 엔진 상태 타입
export interface AIEngineState {
    // 실시간 분석 상태
    realtimeAnalysis: {
        isActive: boolean;
        currentAnalysis: string | null;
        confidence: number;
        processingTime: number;
    };

    // 고급 AI 모델 상태
    aiModels: {
        currentModel: string;
        availableModels: string[];
        modelPerformance: Record<string, number>;
        isModelLoading: boolean;
    };

    // 지능형 응답 생성
    intelligentResponse: {
        isGenerating: boolean;
        responseQuality: number;
        contextUnderstanding: number;
        personalizationLevel: number;
    };

    // 웹소켓 연결 상태
    websocket: {
        isConnected: boolean;
        connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
        lastMessage: unknown;
        messageHistory: unknown[];
    };

    // 고급 분석 기능
    advancedAnalytics: {
        sentimentAnalysis: {
            isActive: boolean;
            currentSentiment: 'positive' | 'negative' | 'neutral';
            confidence: number;
        };
        intentRecognition: {
            isActive: boolean;
            detectedIntent: string;
            confidence: number;
        };
        contextAwareness: {
            isActive: boolean;
            contextLevel: number;
            relevantTopics: string[];
        };
    };

    // 에러 상태
    errors: {
        hasError: boolean;
        errorMessage: string | null;
        errorType: string | null;
    };
}

const initialState: AIEngineState = {
    realtimeAnalysis: {
        isActive: false,
        currentAnalysis: null,
        confidence: 0,
        processingTime: 0,
    },
    aiModels: {
        currentModel: 'enhanced_unified',
        availableModels: ['enhanced_unified', 'advanced_nlp', 'contextual_ai', 'quantum_ai'],
        modelPerformance: {},
        isModelLoading: false,
    },
    intelligentResponse: {
        isGenerating: false,
        responseQuality: 0,
        contextUnderstanding: 0,
        personalizationLevel: 0,
    },
    websocket: {
        isConnected: false,
        connectionStatus: 'disconnected',
        lastMessage: null,
        messageHistory: [],
    },
    advancedAnalytics: {
        sentimentAnalysis: {
            isActive: false,
            currentSentiment: 'neutral',
            confidence: 0,
        },
        intentRecognition: {
            isActive: false,
            detectedIntent: '',
            confidence: 0,
        },
        contextAwareness: {
            isActive: false,
            contextLevel: 0,
            relevantTopics: [],
        },
    },
    errors: {
        hasError: false,
        errorMessage: null,
        errorType: null,
    },
};

// 비동기 액션들
export const initializeAIEngine = createAsyncThunk(
    'aiEngine/initialize',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiService.initializeAIEngine();
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: unknown } };
            return rejectWithValue(err.response?.data || 'AI 엔진 초기화 실패');
        }
    }
);

export const switchAIModel = createAsyncThunk(
    'aiEngine/switchModel',
    async (modelName: string, { rejectWithValue }) => {
        try {
            const response = await apiService.switchAIModel(modelName);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: unknown } };
            return rejectWithValue(err.response?.data || '모델 전환 실패');
        }
    }
);

export const startRealtimeAnalysis = createAsyncThunk(
    'aiEngine/startRealtimeAnalysis',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiService.startRealtimeAnalysis();
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: unknown } };
            return rejectWithValue(err.response?.data || '실시간 분석 시작 실패');
        }
    }
);

export const analyzeSentiment = createAsyncThunk(
    'aiEngine/analyzeSentiment',
    async (text: string, { rejectWithValue }) => {
        try {
            const response = await apiService.analyzeSentiment(text);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: unknown } };
            return rejectWithValue(err.response?.data || '감정 분석 실패');
        }
    }
);

export const detectIntent = createAsyncThunk(
    'aiEngine/detectIntent',
    async (text: string, { rejectWithValue }) => {
        try {
            const response = await apiService.detectIntent(text);
            return response;
        } catch (error: unknown) {
            const err = error as { response?: { data?: unknown } };
            return rejectWithValue(err.response?.data || '의도 감지 실패');
        }
    }
);

const aiEngineSlice = createSlice({
    name: 'aiEngine',
    initialState,
    reducers: {
        // 웹소켓 연결 상태 관리
        setWebSocketStatus: (state, action: PayloadAction<AIEngineState['websocket']['connectionStatus']>) => {
            state.websocket.connectionStatus = action.payload;
            state.websocket.isConnected = action.payload === 'connected';
        },

        // 웹소켓 메시지 수신
        receiveWebSocketMessage: (state, action: PayloadAction<unknown>) => {
            const payload = action.payload as { type?: string; data?: { analysis?: string; confidence?: number; processingTime?: number } };
            state.websocket.lastMessage = action.payload;
            state.websocket.messageHistory.push(action.payload);

            // 메시지 타입에 따른 상태 업데이트
            if (payload?.type === 'realtime_analysis' && payload?.data) {
                state.realtimeAnalysis.currentAnalysis = payload.data.analysis ?? null;
                state.realtimeAnalysis.confidence = payload.data.confidence ?? 0;
                state.realtimeAnalysis.processingTime = payload.data.processingTime ?? 0;
            }
        },

        // 실시간 분석 상태 업데이트
        updateRealtimeAnalysis: (state, action: PayloadAction<Partial<AIEngineState['realtimeAnalysis']>>) => {
            state.realtimeAnalysis = { ...state.realtimeAnalysis, ...action.payload };
        },

        // AI 모델 성능 업데이트
        updateModelPerformance: (state, action: PayloadAction<{ model: string; performance: number }>) => {
            state.aiModels.modelPerformance[action.payload.model] = action.payload.performance;
        },

        // 응답 품질 업데이트
        updateResponseQuality: (state, action: PayloadAction<Partial<AIEngineState['intelligentResponse']>>) => {
            state.intelligentResponse = { ...state.intelligentResponse, ...action.payload };
        },

        // 고급 분석 상태 업데이트
        updateAdvancedAnalytics: (state, action: PayloadAction<Partial<AIEngineState['advancedAnalytics']>>) => {
            state.advancedAnalytics = { ...state.advancedAnalytics, ...action.payload };
        },

        // 에러 상태 설정
        setError: (state, action: PayloadAction<{ message: string; type: string }>) => {
            state.errors.hasError = true;
            state.errors.errorMessage = action.payload.message;
            state.errors.errorType = action.payload.type;
        },

        // 에러 상태 초기화
        clearError: (state) => {
            state.errors.hasError = false;
            state.errors.errorMessage = null;
            state.errors.errorType = null;
        },

        // 메시지 히스토리 초기화
        clearMessageHistory: (state) => {
            state.websocket.messageHistory = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // AI 엔진 초기화
            .addCase(initializeAIEngine.pending, (state) => {
                state.aiModels.isModelLoading = true;
                state.errors.hasError = false;
            })
            .addCase(initializeAIEngine.fulfilled, (state, action) => {
                state.aiModels.isModelLoading = false;
                if (action.payload && typeof action.payload === 'object' && 'data' in action.payload) {
                    const data = action.payload.data as { currentModel?: string; availableModels?: string[] } | null;
                    if (data && typeof data === 'object') {
                        state.aiModels.currentModel = data.currentModel ?? state.aiModels.currentModel;
                        state.aiModels.availableModels = data.availableModels ?? state.aiModels.availableModels;
                    }
                }
            })
            .addCase(initializeAIEngine.rejected, (state, action) => {
                state.aiModels.isModelLoading = false;
                state.errors.hasError = true;
                state.errors.errorMessage = action.payload as string;
                state.errors.errorType = 'initialization';
            })

            // 모델 전환
            .addCase(switchAIModel.pending, (state) => {
                state.aiModels.isModelLoading = true;
            })
            .addCase(switchAIModel.fulfilled, (state, action) => {
                state.aiModels.isModelLoading = false;
                if (action.payload && typeof action.payload === 'object' && 'data' in action.payload) {
                    const data = action.payload.data as { model?: string } | null;
                    if (data && typeof data === 'object') {
                        state.aiModels.currentModel = data.model ?? state.aiModels.currentModel;
                    }
                }
            })
            .addCase(switchAIModel.rejected, (state, action) => {
                state.aiModels.isModelLoading = false;
                state.errors.hasError = true;
                state.errors.errorMessage = action.payload as string;
                state.errors.errorType = 'model_switch';
            })

            // 실시간 분석 시작
            .addCase(startRealtimeAnalysis.fulfilled, (state) => {
                state.realtimeAnalysis.isActive = true;
            })
            .addCase(startRealtimeAnalysis.rejected, (state, action) => {
                state.errors.hasError = true;
                state.errors.errorMessage = action.payload as string;
                state.errors.errorType = 'realtime_analysis';
            })

            // 감정 분석
            .addCase(analyzeSentiment.fulfilled, (state, action) => {
                if (action.payload && typeof action.payload === 'object' && 'data' in action.payload) {
                    const data = action.payload.data as { sentiment?: 'positive' | 'negative' | 'neutral'; confidence?: number } | null;
                    if (data && typeof data === 'object') {
                        const s = data.sentiment;
                        state.advancedAnalytics.sentimentAnalysis.currentSentiment = (s === 'positive' || s === 'negative' || s === 'neutral') ? s : 'neutral';
                        state.advancedAnalytics.sentimentAnalysis.confidence = data.confidence ?? 0;
                    }
                }
            })

            // 의도 감지
            .addCase(detectIntent.fulfilled, (state, action) => {
                if (action.payload && typeof action.payload === 'object' && 'data' in action.payload) {
                    const data = action.payload.data as { intent?: string; confidence?: number } | null;
                    if (data && typeof data === 'object') {
                        state.advancedAnalytics.intentRecognition.detectedIntent = data.intent ?? '';
                        state.advancedAnalytics.intentRecognition.confidence = data.confidence ?? 0;
                    }
                }
            });
    },
});

export const {
    setWebSocketStatus,
    receiveWebSocketMessage,
    updateRealtimeAnalysis,
    updateModelPerformance,
    updateResponseQuality,
    updateAdvancedAnalytics,
    setError,
    clearError,
    clearMessageHistory,
} = aiEngineSlice.actions;

// 셀렉터들
export const selectAIEngine = (state: RootState) => state.aiEngine;
export const selectRealtimeAnalysis = (state: RootState) => state.aiEngine.realtimeAnalysis;
export const selectAIModels = (state: RootState) => state.aiEngine.aiModels;
export const selectIntelligentResponse = (state: RootState) => state.aiEngine.intelligentResponse;
export const selectWebSocket = (state: RootState) => state.aiEngine.websocket;
export const selectAdvancedAnalytics = (state: RootState) => state.aiEngine.advancedAnalytics;
export const selectAIErrors = (state: RootState) => state.aiEngine.errors;

export default aiEngineSlice.reducer;
