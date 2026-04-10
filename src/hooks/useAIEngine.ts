import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { websocketService } from '../services/websocketService';
import { errorLogger } from '../utils/errorLogger';
import {
    selectAIEngine,
    selectRealtimeAnalysis,
    selectAIModels,
    selectIntelligentResponse,
    selectAdvancedAnalytics,
    selectAIErrors,
    initializeAIEngine,
    switchAIModel,
    startRealtimeAnalysis,
    analyzeSentiment,
    detectIntent,
    clearError,
    updateRealtimeAnalysis,
    updateResponseQuality,
    updateAdvancedAnalytics,
} from '../store/slices/aiEngineSlice';

export const useAIEngine = () => {
    const dispatch = useDispatch<AppDispatch>();
    const aiEngine = useSelector(selectAIEngine);
    const realtimeAnalysis = useSelector(selectRealtimeAnalysis);
    const aiModels = useSelector(selectAIModels);
    const intelligentResponse = useSelector(selectIntelligentResponse);
    const advancedAnalytics = useSelector(selectAdvancedAnalytics);
    const errors = useSelector(selectAIErrors);

    // AI 엔진 초기화
    const initialize = useCallback(async () => {
        try {
            await dispatch(initializeAIEngine()).unwrap();
            websocketService.connect();
        } catch (error) {
            errorLogger.error('AI 엔진 초기화 실패', error instanceof Error ? error : new Error(String(error)), { component: 'useAIEngine', action: 'initializeAIEngine' });
        }
    }, [dispatch]);

    // AI 모델 전환
    const switchModel = useCallback(async (modelName: string) => {
        try {
            await dispatch(switchAIModel(modelName)).unwrap();
            websocketService.sendMessage({
                type: 'switch_model',
                data: { model: modelName },
            });
        } catch (error) {
            errorLogger.error('모델 전환 실패', error instanceof Error ? error : new Error(String(error)), { component: 'useAIEngine', action: 'switchModel', modelName });
        }
    }, [dispatch]);

    // 실시간 분석 시작
    const startAnalysis = useCallback(async (config?: Record<string, unknown>) => {
        try {
            await dispatch(startRealtimeAnalysis()).unwrap();
            websocketService.sendMessage({
                type: 'start_analysis',
                data: config || {},
            });
        } catch (error) {
            errorLogger.error('실시간 분석 시작 실패', error instanceof Error ? error : new Error(String(error)), { component: 'useAIEngine', action: 'startAnalysis' });
        }
    }, [dispatch]);

    // 감정 분석
    const analyzeTextSentiment = useCallback(async (text: string) => {
        try {
            await dispatch(analyzeSentiment(text)).unwrap();
            websocketService.sendMessage({
                type: 'sentiment_analysis',
                data: { text },
            });
        } catch (error) {
            errorLogger.error('감정 분석 실패', error instanceof Error ? error : new Error(String(error)), { component: 'useAIEngine', action: 'analyzeTextSentiment' });
        }
    }, [dispatch]);

    // 의도 감지
    const detectTextIntent = useCallback(async (text: string) => {
        try {
            await dispatch(detectIntent(text)).unwrap();
            websocketService.sendMessage({
                type: 'intent_detection',
                data: { text },
            });
        } catch (error) {
            errorLogger.error('의도 감지 실패', error instanceof Error ? error : new Error(String(error)), { component: 'useAIEngine', action: 'detectTextIntent' });
        }
    }, [dispatch]);

    // 에러 해제
    const clearEngineError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    // 실시간 분석 상태 업데이트
    const updateAnalysis = useCallback((updates: Record<string, unknown>) => {
        dispatch(updateRealtimeAnalysis(updates));
    }, [dispatch]);

    // 응답 품질 업데이트
    const updateQuality = useCallback((updates: Record<string, unknown>) => {
        dispatch(updateResponseQuality(updates));
    }, [dispatch]);

    // 고급 분석 상태 업데이트
    const updateAnalytics = useCallback((updates: Record<string, unknown>) => {
        dispatch(updateAdvancedAnalytics(updates));
    }, [dispatch]);

    // 웹소켓 연결 상태 확인
    const isConnected = useCallback(() => websocketService.isConnected(), []);

    const connectWebSocket = useCallback(async () => {
        websocketService.connect();
    }, []);

    const disconnectWebSocket = useCallback(() => {
        websocketService.disconnect();
    }, []);

    const sendWebSocketMessage = useCallback((message: { type: string; data?: unknown }) => {
        websocketService.sendMessage(message);
    }, []);

    // 컴포넌트 마운트 시 초기화
    useEffect(() => {
        initialize();
    }, [initialize]);

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => {
            disconnectWebSocket();
        };
    }, [disconnectWebSocket]);

    return {
        // 상태
        aiEngine,
        realtimeAnalysis,
        aiModels,
        intelligentResponse,
        advancedAnalytics,
        errors,

        // 액션
        initialize,
        switchModel,
        startAnalysis,
        analyzeTextSentiment,
        detectTextIntent,
        clearEngineError,
        updateAnalysis,
        updateQuality,
        updateAnalytics,

        // 웹소켓
        isConnected,
        connectWebSocket,
        disconnectWebSocket,
        sendWebSocketMessage,

        // 유틸리티
        isInitialized: !aiModels.isModelLoading && aiEngine.websocket.connectionStatus === 'connected',
        hasError: errors.hasError,
        isAnalysisActive: realtimeAnalysis.isActive,
        currentModel: aiModels.currentModel,
        connectionStatus: aiEngine.websocket.connectionStatus,
    };
};

export default useAIEngine;
