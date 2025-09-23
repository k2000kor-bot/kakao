import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
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
import { websocketService } from '../services/websocketService';

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
            // await websocketService.connect();
        } catch (error) {
            console.error('AI 엔진 초기화 실패:', error);
        }
    }, [dispatch]);

    // AI 모델 전환
    const switchModel = useCallback(async (modelName: string) => {
        try {
            await dispatch(switchAIModel(modelName)).unwrap();
            // WebSocket을 통한 모델 전환 메시지 전송
            // websocketService.sendMessage({
            //     type: 'switch_model',
            //     data: { model: modelName }
            // });
        } catch (error) {
            console.error('모델 전환 실패:', error);
        }
    }, [dispatch]);

    // 실시간 분석 시작
    const startAnalysis = useCallback(async (config?: any) => {
        try {
            await dispatch(startRealtimeAnalysis()).unwrap();
            // WebSocket을 통한 실시간 분석 시작 메시지 전송
            // websocketService.sendMessage({
            //     type: 'start_analysis',
            //     data: config || {}
            // });
        } catch (error) {
            console.error('실시간 분석 시작 실패:', error);
        }
    }, [dispatch]);

    // 감정 분석
    const analyzeTextSentiment = useCallback(async (text: string) => {
        try {
            await dispatch(analyzeSentiment(text)).unwrap();
            // WebSocket을 통한 감정 분석 요청
            // websocketService.sendMessage({
            //     type: 'sentiment_analysis',
            //     data: { text }
            // });
        } catch (error) {
            console.error('감정 분석 실패:', error);
        }
    }, [dispatch]);

    // 의도 감지
    const detectTextIntent = useCallback(async (text: string) => {
        try {
            await dispatch(detectIntent(text)).unwrap();
            // WebSocket을 통한 의도 감지 요청
            // websocketService.sendMessage({
            //     type: 'intent_detection',
            //     data: { text }
            // });
        } catch (error) {
            console.error('의도 감지 실패:', error);
        }
    }, [dispatch]);

    // 에러 해제
    const clearEngineError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    // 실시간 분석 상태 업데이트
    const updateAnalysis = useCallback((updates: any) => {
        dispatch(updateRealtimeAnalysis(updates));
    }, [dispatch]);

    // 응답 품질 업데이트
    const updateQuality = useCallback((updates: any) => {
        dispatch(updateResponseQuality(updates));
    }, [dispatch]);

    // 고급 분석 상태 업데이트
    const updateAnalytics = useCallback((updates: any) => {
        dispatch(updateAdvancedAnalytics(updates));
    }, [dispatch]);

    // 웹소켓 연결 상태 확인
    const isConnected = useCallback(() => {
        return false; // websocketService.isConnected();
    }, []);

    // 웹소켓 연결
    const connectWebSocket = useCallback(async () => {
        // await websocketService.connect();
    }, []);

    // 웹소켓 연결 해제
    const disconnectWebSocket = useCallback(() => {
        // websocketService.disconnect();
    }, []);

    // 메시지 전송
    const sendWebSocketMessage = useCallback((message: any) => {
        // websocketService.sendMessage(message);
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
