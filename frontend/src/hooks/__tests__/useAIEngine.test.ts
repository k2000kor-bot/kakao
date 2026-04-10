/**
 * useAIEngine 훅 테스트
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import api from '../../services/api';
import { websocketService } from '../../services/websocketService';
import { useAIEngine } from '../useAIEngine';
import projectsReducer from '../../store/slices/projectsSlice';
import sessionsReducer from '../../store/slices/sessionsSlice';
import uiReducer from '../../store/slices/uiSlice';
import authReducer from '../../store/slices/authSlice';
import collaborationReducer from '../../store/slices/collaborationSlice';
import aiEngineReducer from '../../store/slices/aiEngineSlice';

jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    initializeAIEngine: jest.fn().mockResolvedValue({}),
    switchAIModel: jest.fn().mockResolvedValue({}),
    startRealtimeAnalysis: jest.fn().mockResolvedValue({}),
    analyzeSentiment: jest.fn().mockResolvedValue({}),
    detectIntent: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock('../../services/websocketService', () => ({
  websocketService: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    sendMessage: jest.fn(),
    isConnected: jest.fn(),
  },
}));

const mockApi: jest.Mocked<typeof api> = jest.mocked(api);

const apiOk = (): { success: true; timestamp: string } => ({
  success: true,
  timestamp: new Date().toISOString(),
});

const createStore = () =>
  configureStore({
    reducer: {
      projects: projectsReducer,
      sessions: sessionsReducer,
      ui: uiReducer,
      auth: authReducer,
      collaboration: collaborationReducer,
      aiEngine: aiEngineReducer,
    },
  });

const renderWithStore = (store = createStore()) => {
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(Provider, { store, children });
  return renderHook(() => useAIEngine(), { wrapper });
};

const flushInitialEffect = async () => {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
};

describe('useAIEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(websocketService.isConnected).mockReturnValue(false);
    mockApi.initializeAIEngine.mockResolvedValue(apiOk());
    mockApi.switchAIModel.mockResolvedValue(apiOk());
    mockApi.startRealtimeAnalysis.mockResolvedValue(apiOk());
    mockApi.analyzeSentiment.mockResolvedValue(apiOk());
    mockApi.detectIntent.mockResolvedValue(apiOk());
  });

  it('초기 상태 및 유틸 필드 반환', async () => {
    const { result } = renderWithStore();
    await waitFor(() => expect(mockApi.initializeAIEngine).toHaveBeenCalled());

    expect(result.current.connectionStatus).toBe('disconnected');
    expect(result.current.currentModel).toBe('enhanced_unified');
    expect(result.current.hasError).toBe(false);
    expect(result.current.isAnalysisActive).toBe(false);
    expect(result.current.aiEngine).toBeDefined();
    expect(result.current.realtimeAnalysis).toBeDefined();
    expect(result.current.aiModels).toBeDefined();
    expect(result.current.errors).toBeDefined();
  });

  it('isConnected()는 false 반환', async () => {
    const { result } = renderWithStore();
    await flushInitialEffect();

    expect(result.current.isConnected()).toBe(false);
  });

  it('clearEngineError 호출 시 dispatch', async () => {
    const store = createStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    const { result } = renderWithStore(store);
    await flushInitialEffect();

    act(() => {
      result.current.clearEngineError();
    });

    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('updateAnalysis 호출 시 updateRealtimeAnalysis dispatch', async () => {
    const store = createStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    const { result } = renderWithStore(store);
    await flushInitialEffect();

    act(() => {
      result.current.updateAnalysis({ confidence: 0.9 });
    });

    expect(dispatchSpy).toHaveBeenCalled();
    const [action] = dispatchSpy.mock.calls[dispatchSpy.mock.calls.length - 1];
    expect(action.type).toContain('updateRealtimeAnalysis');
    expect(action.payload).toEqual({ confidence: 0.9 });
  });

  it('updateQuality 호출 시 updateResponseQuality dispatch', async () => {
    const store = createStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    const { result } = renderWithStore(store);
    await flushInitialEffect();

    act(() => {
      result.current.updateQuality({ responseQuality: 0.8 });
    });

    expect(dispatchSpy).toHaveBeenCalled();
    const [action] = dispatchSpy.mock.calls[dispatchSpy.mock.calls.length - 1];
    expect(action.type).toContain('updateResponseQuality');
    expect(action.payload).toEqual({ responseQuality: 0.8 });
  });

  it('updateAnalytics 호출 시 updateAdvancedAnalytics dispatch', async () => {
    const store = createStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    const { result } = renderWithStore(store);
    await flushInitialEffect();

    act(() => {
      result.current.updateAnalytics({ sentimentAnalysis: { isActive: true } });
    });

    expect(dispatchSpy).toHaveBeenCalled();
    const [action] = dispatchSpy.mock.calls[dispatchSpy.mock.calls.length - 1];
    expect(action.type).toContain('updateAdvancedAnalytics');
    expect(action.payload).toEqual({ sentimentAnalysis: { isActive: true } });
  });

  it('switchModel 호출 시 apiService.switchAIModel 호출', async () => {
    const { result } = renderWithStore();
    await flushInitialEffect();

    await act(async () => {
      await result.current.switchModel('advanced_nlp');
    });

    expect(mockApi.switchAIModel).toHaveBeenCalledWith('advanced_nlp');
  });

  it('analyzeTextSentiment 호출 시 apiService.analyzeSentiment 호출', async () => {
    const { result } = renderWithStore();
    await flushInitialEffect();

    await act(async () => {
      await result.current.analyzeTextSentiment('테스트 문장');
    });

    expect(mockApi.analyzeSentiment).toHaveBeenCalledWith('테스트 문장');
  });

  it('detectTextIntent 호출 시 apiService.detectIntent 호출', async () => {
    const { result } = renderWithStore();
    await flushInitialEffect();

    await act(async () => {
      await result.current.detectTextIntent('의도 문장');
    });

    expect(mockApi.detectIntent).toHaveBeenCalledWith('의도 문장');
  });
});
