/**
 * aiEngineSlice 리듀서 테스트
 */

import aiEngineReducer, {
  setWebSocketStatus,
  receiveWebSocketMessage,
  updateRealtimeAnalysis,
  updateModelPerformance,
  updateResponseQuality,
  updateAdvancedAnalytics,
  setError,
  clearError,
  clearMessageHistory,
  initializeAIEngine,
  switchAIModel,
  startRealtimeAnalysis,
  analyzeSentiment,
  detectIntent,
} from '../slices/aiEngineSlice';

jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {},
}));

describe('aiEngineSlice', () => {
  const getInitialState = () => aiEngineReducer(undefined, { type: 'unknown' });

  it('초기 상태', () => {
    const state = getInitialState();
    expect(state.realtimeAnalysis.isActive).toBe(false);
    expect(state.aiModels.currentModel).toBe('enhanced_unified');
    expect(state.websocket.connectionStatus).toBe('disconnected');
    expect(state.errors.hasError).toBe(false);
  });

  it('setWebSocketStatus', () => {
    let state = aiEngineReducer(getInitialState(), setWebSocketStatus('connected'));
    expect(state.websocket.connectionStatus).toBe('connected');
    expect(state.websocket.isConnected).toBe(true);
    state = aiEngineReducer(state, setWebSocketStatus('disconnected'));
    expect(state.websocket.isConnected).toBe(false);
  });

  it('receiveWebSocketMessage', () => {
    const msg = { type: 'realtime_analysis', data: { analysis: '분석', confidence: 0.9, processingTime: 100 } };
    const state = aiEngineReducer(getInitialState(), receiveWebSocketMessage(msg));
    expect(state.websocket.lastMessage).toEqual(msg);
    expect(state.websocket.messageHistory).toHaveLength(1);
    expect(state.realtimeAnalysis.currentAnalysis).toBe('분석');
    expect(state.realtimeAnalysis.confidence).toBe(0.9);
    expect(state.realtimeAnalysis.processingTime).toBe(100);
  });

  it('updateRealtimeAnalysis', () => {
    const state = aiEngineReducer(
      getInitialState(),
      updateRealtimeAnalysis({ isActive: true, confidence: 0.8 })
    );
    expect(state.realtimeAnalysis.isActive).toBe(true);
    expect(state.realtimeAnalysis.confidence).toBe(0.8);
  });

  it('updateModelPerformance', () => {
    const state = aiEngineReducer(
      getInitialState(),
      updateModelPerformance({ model: 'gpt-4', performance: 0.95 })
    );
    expect(state.aiModels.modelPerformance['gpt-4']).toBe(0.95);
  });

  it('updateResponseQuality', () => {
    const state = aiEngineReducer(
      getInitialState(),
      updateResponseQuality({ responseQuality: 0.9 })
    );
    expect(state.intelligentResponse.responseQuality).toBe(0.9);
  });

  it('updateAdvancedAnalytics', () => {
    const state = aiEngineReducer(
      getInitialState(),
      updateAdvancedAnalytics({
        sentimentAnalysis: { isActive: true, currentSentiment: 'positive', confidence: 0.85 },
      })
    );
    expect(state.advancedAnalytics.sentimentAnalysis.isActive).toBe(true);
    expect(state.advancedAnalytics.sentimentAnalysis.currentSentiment).toBe('positive');
    expect(state.advancedAnalytics.sentimentAnalysis.confidence).toBe(0.85);
  });

  it('setError / clearError', () => {
    let state = aiEngineReducer(
      getInitialState(),
      setError({ message: '에러 메시지', type: 'network' })
    );
    expect(state.errors.hasError).toBe(true);
    expect(state.errors.errorMessage).toBe('에러 메시지');
    expect(state.errors.errorType).toBe('network');
    state = aiEngineReducer(state, clearError());
    expect(state.errors.hasError).toBe(false);
    expect(state.errors.errorMessage).toBeNull();
  });

  it('clearMessageHistory', () => {
    let state = aiEngineReducer(
      getInitialState(),
      receiveWebSocketMessage({ type: 'test' })
    );
    expect(state.websocket.messageHistory).toHaveLength(1);
    state = aiEngineReducer(state, clearMessageHistory());
    expect(state.websocket.messageHistory).toHaveLength(0);
  });

  it('initializeAIEngine.pending / fulfilled / rejected', () => {
    let state = aiEngineReducer(getInitialState(), initializeAIEngine.pending(''));
    expect(state.aiModels.isModelLoading).toBe(true);
    expect(state.errors.hasError).toBe(false);

    const payload = { data: { currentModel: 'gpt-4', availableModels: ['gpt-4', 'claude'] } };
    state = aiEngineReducer(state, initializeAIEngine.fulfilled(payload, ''));
    expect(state.aiModels.isModelLoading).toBe(false);
    expect(state.aiModels.currentModel).toBe('gpt-4');
    expect(state.aiModels.availableModels).toEqual(['gpt-4', 'claude']);

    state = aiEngineReducer(state, initializeAIEngine.rejected(new Error('err'), '', undefined, 'init failed'));
    expect(state.aiModels.isModelLoading).toBe(false);
    expect(state.errors.hasError).toBe(true);
    expect(state.errors.errorMessage).toBe('init failed');
    expect(state.errors.errorType).toBe('initialization');
  });

  it('switchAIModel.fulfilled', () => {
    let state = aiEngineReducer(getInitialState(), switchAIModel.pending(''));
    state = aiEngineReducer(state, switchAIModel.fulfilled({ data: { model: 'advanced_nlp' } }, '', 'advanced_nlp'));
    expect(state.aiModels.isModelLoading).toBe(false);
    expect(state.aiModels.currentModel).toBe('advanced_nlp');
  });

  it('startRealtimeAnalysis.fulfilled / rejected', () => {
    const state = aiEngineReducer(getInitialState(), startRealtimeAnalysis.fulfilled(undefined, ''));
    expect(state.realtimeAnalysis.isActive).toBe(true);

    const rejectedState = aiEngineReducer(
      getInitialState(),
      startRealtimeAnalysis.rejected(new Error('err'), '', undefined, 'analysis failed')
    );
    expect(rejectedState.errors.hasError).toBe(true);
    expect(rejectedState.errors.errorType).toBe('realtime_analysis');
  });

  it('analyzeSentiment.fulfilled', () => {
    const state = aiEngineReducer(
      getInitialState(),
      analyzeSentiment.fulfilled(
        { data: { sentiment: 'positive', confidence: 0.9 } },
        '',
        '테스트'
      )
    );
    expect(state.advancedAnalytics.sentimentAnalysis.currentSentiment).toBe('positive');
    expect(state.advancedAnalytics.sentimentAnalysis.confidence).toBe(0.9);
  });

  it('detectIntent.fulfilled', () => {
    const state = aiEngineReducer(
      getInitialState(),
      detectIntent.fulfilled(
        { data: { intent: 'question', confidence: 0.85 } },
        '',
        '질문'
      )
    );
    expect(state.advancedAnalytics.intentRecognition.detectedIntent).toBe('question');
    expect(state.advancedAnalytics.intentRecognition.confidence).toBe(0.85);
  });
});
