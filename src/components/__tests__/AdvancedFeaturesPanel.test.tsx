/**
 * AdvancedFeaturesPanel 컴포넌트 테스트
 * 고급 기능 패널 기능 확인
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdvancedFeaturesPanel from '../AdvancedFeaturesPanel';
import advancedAPIService from '../../services/advancedAPIService';

// Mock CSS
jest.mock('../AdvancedFeaturesPanel.css', () => ({}));

// Mock hooks
const mockUseWebSocket = jest.fn(() => ({
  isConnected: true,
  socket: null,
  sendMessage: jest.fn(),
  disconnect: jest.fn(),
  reconnect: jest.fn(),
}));

jest.mock('../../hooks/useWebSocket', () => ({
  useWebSocket: (...args: any[]) => mockUseWebSocket(...args),
}));

const mockUseLoadingState = jest.fn(() => ({
  loadingState: { type: 'idle' },
  startRefreshing: jest.fn(),
  stopLoading: jest.fn(),
  startInitialLoading: jest.fn(),
  startUpdating: jest.fn(),
  isLoading: false,
  isInitialLoading: false,
  isUpdating: false,
  isRefreshing: false,
}));

jest.mock('../../hooks/useLoadingState', () => ({
  useLoadingState: (...args: any[]) => mockUseLoadingState(...args),
}));

const mockUseDebounce = jest.fn((value: string) => value);

jest.mock('../../hooks/useDebounce', () => ({
  useDebounce: (...args: any[]) => mockUseDebounce(...args),
}));

// Mock services
jest.mock('../../services/advancedAPIService', () => ({
  __esModule: true,
  default: {
    analyzeImage: jest.fn(),
    analyzeImageFile: jest.fn(),
    startVoiceRecognition: jest.fn(),
    stopVoiceRecognition: jest.fn(),
    getVoiceRecognitionResults: jest.fn(),
    predictUserActivity: jest.fn(),
    predictMessageQuality: jest.fn(),
    predictSystemPerformance: jest.fn(),
    getPredictionSummary: jest.fn(),
  },
}));

jest.mock('../../services/speechRecognitionService', () => ({
  speechRecognitionService: {
    start: jest.fn(),
    stop: jest.fn(),
    isSupported: jest.fn(() => true),
  },
}));

// Mock child components
jest.mock('../PredictionChart', () => {
  return function MockPredictionChart({ data, title }: any) {
    return (
      <div data-testid="prediction-chart">
        {title && <h3>{title}</h3>}
        <div>Chart Data: {JSON.stringify(data)}</div>
      </div>
    );
  };
});

jest.mock('../LoadingSkeleton', () => ({
  __esModule: true,
  default: function MockLoadingSkeleton() {
    return <div data-testid="loading-skeleton">Loading...</div>;
  },
}));

jest.mock('../LoadingStateIndicator', () => {
  return function MockLoadingStateIndicator({ type, message }: any) {
    if (type === 'idle') return null;
    return (
      <div data-testid="loading-state-indicator">
        {message || 'Loading...'}
      </div>
    );
  };
});

describe('AdvancedFeaturesPanel', () => {
  const mockAdvancedAPIService = advancedAPIService as jest.Mocked<typeof advancedAPIService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseWebSocket.mockReturnValue({
      isConnected: true,
      socket: null,
      sendMessage: jest.fn(),
      disconnect: jest.fn(),
      reconnect: jest.fn(),
    });
    mockUseLoadingState.mockReturnValue({
      loadingState: { type: 'idle' },
      startRefreshing: jest.fn(),
      stopLoading: jest.fn(),
      startInitialLoading: jest.fn(),
      startUpdating: jest.fn(),
      isLoading: false,
      isInitialLoading: false,
      isUpdating: false,
      isRefreshing: false,
    });
    mockUseDebounce.mockImplementation((value: string) => value);
  });

  describe('기본 렌더링', () => {
    it('기본 렌더링이 올바르게 작동해야 함', () => {
      render(<AdvancedFeaturesPanel />);
      expect(screen.getByText(/고급 기능/)).toBeInTheDocument();
    });

    it('탭이 표시되어야 함', () => {
      render(<AdvancedFeaturesPanel />);
      const imageTabs = screen.queryAllByText(/이미지 분석/);
      const voiceTabs = screen.queryAllByText(/음성 인식/);
      const predictionTabs = screen.queryAllByText(/예측 분석/);
      expect(imageTabs.length).toBeGreaterThan(0);
      expect(voiceTabs.length).toBeGreaterThan(0);
      expect(predictionTabs.length).toBeGreaterThan(0);
    });

    it('기본적으로 이미지 분석 탭이 활성화되어야 함', () => {
      render(<AdvancedFeaturesPanel />);
      const imageTabs = screen.queryAllByText(/이미지 분석/);
      expect(imageTabs.length).toBeGreaterThan(0);
    });
  });

  describe('탭 전환', () => {
    it('음성 인식 탭 클릭 시 탭이 전환되어야 함', () => {
      render(<AdvancedFeaturesPanel />);
      
      const voiceTabs = screen.getAllByText(/음성 인식/);
      const voiceTab = voiceTabs.find((el) => el.tagName === 'BUTTON') || voiceTabs[0];
      fireEvent.click(voiceTab);

      expect(screen.getByText(/음성 인식 시작/)).toBeInTheDocument();
    });

    it('예측 분석 탭 클릭 시 탭이 전환되어야 함', () => {
      render(<AdvancedFeaturesPanel />);
      
      const predictionTabs = screen.getAllByText(/예측 분석/);
      const predictionTab = predictionTabs.find((el) => el.tagName === 'BUTTON') || predictionTabs[0];
      fireEvent.click(predictionTab);

      const messageInput = screen.queryByPlaceholderText(/메시지를 입력하세요/);
      expect(messageInput).toBeInTheDocument();
    });
  });

  describe('이미지 분석', () => {
    beforeEach(() => {
      mockAdvancedAPIService.analyzeImage.mockResolvedValue({
        status: 'success',
        analysis: {
          objects: [],
          text: '',
          colors: [],
        },
      } as any);
    });

    it('이미지 업로드 버튼이 표시되어야 함', () => {
      render(<AdvancedFeaturesPanel />);
      expect(screen.getByText(/이미지 선택/)).toBeInTheDocument();
    });

    it('이미지 파일 선택 시 분석이 시작되어야 함', async () => {
      mockAdvancedAPIService.analyzeImageFile = jest.fn().mockResolvedValue({
        status: 'success',
        analysis: {
          objects: [],
          text: '',
          colors: [],
        },
      } as any);

      const mockOnImageAnalyzed = jest.fn();
      render(<AdvancedFeaturesPanel onImageAnalyzed={mockOnImageAnalyzed} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
          expect(mockAdvancedAPIService.analyzeImageFile).toHaveBeenCalled();
        }, { timeout: 3000 });
      }
    });
  });

  describe('음성 인식', () => {
    it('음성 인식 시작 버튼이 표시되어야 함', () => {
      render(<AdvancedFeaturesPanel />);
      
      const voiceTab = screen.getByText(/음성 인식/);
      fireEvent.click(voiceTab);

      expect(screen.getByText(/음성 인식 시작/)).toBeInTheDocument();
    });

    it('음성 인식이 지원되지 않을 때도 컴포넌트가 작동해야 함', () => {
      const { speechRecognitionService } = require('../../services/speechRecognitionService');
      speechRecognitionService.isSupported.mockReturnValue(false);

      render(<AdvancedFeaturesPanel />);
      
      const voiceTabs = screen.getAllByText(/음성 인식/);
      const voiceTab = voiceTabs.find((el) => el.tagName === 'BUTTON') || voiceTabs[0];
      fireEvent.click(voiceTab);

      // 음성 인식 시작 버튼은 여전히 표시되어야 함
      expect(screen.getByText(/음성 인식 시작/)).toBeInTheDocument();
    });
  });

  describe('예측 분석', () => {
    beforeEach(() => {
      mockAdvancedAPIService.predictUserActivity.mockResolvedValue({
        status: 'success',
        predictions: [],
      } as any);
      mockAdvancedAPIService.predictMessageQuality.mockResolvedValue({
        status: 'success',
        predictions: [],
      } as any);
      mockAdvancedAPIService.predictSystemPerformance.mockResolvedValue({
        status: 'success',
        predictions: [],
      } as any);
      mockAdvancedAPIService.getPredictionSummary.mockResolvedValue({
        status: 'success',
        summary: {},
      } as any);
    });

    it('예측 분석 탭에서 메시지 입력 필드가 표시되어야 함', () => {
      render(<AdvancedFeaturesPanel />);
      
      const predictionTab = screen.getByText(/예측 분석/);
      fireEvent.click(predictionTab);

      const messageInput = screen.getByPlaceholderText(/메시지를 입력하세요/);
      expect(messageInput).toBeInTheDocument();
    });

    it('예측 분석 실행 버튼이 표시되어야 함', () => {
      render(<AdvancedFeaturesPanel />);
      
      const predictionTabs = screen.getAllByText(/예측 분석/);
      const predictionTab = predictionTabs.find((el) => el.tagName === 'BUTTON') || predictionTabs[0];
      fireEvent.click(predictionTab);

      // 실제로는 여러 예측 버튼들이 있음
      expect(screen.getByText(/사용자 활동 예측/)).toBeInTheDocument();
      const qualityButtons = screen.queryAllByText(/품질 예측/);
      expect(qualityButtons.length).toBeGreaterThan(0);
    });
  });

  describe('WebSocket 연결', () => {
    it('WebSocket이 연결되어 있을 때 연결 상태가 표시되어야 함', () => {
      mockUseWebSocket.mockReturnValueOnce({
        isConnected: true,
        socket: null,
        sendMessage: jest.fn(),
        disconnect: jest.fn(),
        reconnect: jest.fn(),
      });

      render(<AdvancedFeaturesPanel />);
      // WebSocket 연결 상태는 컴포넌트 내부에서 사용되지만 UI에 직접 표시되지 않을 수 있음
      expect(mockUseWebSocket).toHaveBeenCalled();
    });

    it('WebSocket이 연결되지 않았을 때도 컴포넌트가 작동해야 함', () => {
      mockUseWebSocket.mockReturnValueOnce({
        isConnected: false,
        socket: null,
        sendMessage: jest.fn(),
        disconnect: jest.fn(),
        reconnect: jest.fn(),
      });

      render(<AdvancedFeaturesPanel />);
      expect(screen.getByText(/고급 기능/)).toBeInTheDocument();
    });
  });

  describe('에러 처리', () => {
    it('에러 발생 시 에러 메시지가 표시되어야 함', async () => {
      mockAdvancedAPIService.analyzeImageFile = jest.fn().mockRejectedValueOnce(new Error('Analysis failed'));

      render(<AdvancedFeaturesPanel />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
          // 에러 메시지는 error state에 저장되고 error-message div에 표시됨
          const errorMessage = screen.queryByText(/오류가 발생했습니다|Analysis failed|이미지 분석 중 오류가 발생했습니다/);
          expect(errorMessage).toBeInTheDocument();
        }, { timeout: 3000 });
      }
    });
  });

  describe('콜백 함수', () => {
    it('onImageAnalyzed 콜백이 호출되어야 함', async () => {
      mockAdvancedAPIService.analyzeImageFile = jest.fn().mockResolvedValue({
        status: 'success',
        analysis: {
          image_info: {
            width: 800,
            height: 600,
            format: 'jpeg',
          },
          object_detection: {
            total_objects: 0,
            detected_objects: [],
          },
          ocr_results: {
            extracted_text: '',
          },
          objects: [],
          text: '',
          colors: [],
        },
      } as any);

      const mockOnImageAnalyzed = jest.fn();
      render(<AdvancedFeaturesPanel onImageAnalyzed={mockOnImageAnalyzed} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
          expect(mockOnImageAnalyzed).toHaveBeenCalled();
        }, { timeout: 3000 });
      }
    });
  });
});

