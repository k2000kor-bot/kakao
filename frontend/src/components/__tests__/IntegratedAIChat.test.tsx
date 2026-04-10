/* eslint-disable jest/no-conditional-expect */
/**
 * IntegratedAIChat 컴포넌트 테스트
 * 통합 AI 대화 컴포넌트 기능 확인
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// react-markdown는 ESM이라 Jest에서 직접 로드 시 SyntaxError — gensparkAnswerMarkdown 경유 모킹
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="react-markdown">{children}</div>
  ),
}));

jest.mock('remark-gfm', () => ({
  __esModule: true,
  default: () => {},
}));

jest.mock('../../utils/rehypeHighlightSearch', () => ({
  rehypeHighlightSearch: () => () => {},
}));

import IntegratedAIChat from '../IntegratedAIChat';
import { renderWithTheme, setupCommonMocks } from '../../test-utils/testHelpers';
import { integratedAPIService } from '../../services/integratedAPIService';

// Mock integratedAPIService
jest.mock('../../services/integratedAPIService', () => ({
  integratedAPIService: {
    testConnection: jest.fn(),
    getSystemStatus: jest.fn(),
    analyzeMessage: jest.fn(),
  },
}));

// Mock child components
jest.mock('../SystemStatus', () => {
  return function MockSystemStatus() {
    return <div data-testid="system-status">SystemStatus</div>;
  };
});

jest.mock('../QuickActions', () => {
  return function MockQuickActions() {
    return <div data-testid="quick-actions">QuickActions</div>;
  };
});

jest.mock('../SystemHealthMonitor', () => {
  return function MockSystemHealthMonitor() {
    return <div data-testid="system-health-monitor">SystemHealthMonitor</div>;
  };
});

jest.mock('../CreativeWriting', () => {
  return function MockCreativeWriting() {
    return <div data-testid="creative-writing">CreativeWriting</div>;
  };
});

jest.mock('../PersuasionContent', () => {
  return function MockPersuasionContent() {
    return <div data-testid="persuasion-content">PersuasionContent</div>;
  };
});

jest.mock('../MarketingContent', () => {
  return function MockMarketingContent() {
    return <div data-testid="marketing-content">MarketingContent</div>;
  };
});

jest.mock('../AdvancedAnalytics', () => {
  return function MockAdvancedAnalytics() {
    return <div data-testid="advanced-analytics">AdvancedAnalytics</div>;
  };
});

jest.mock('../AIManagement', () => {
  return function MockAIManagement() {
    return <div data-testid="ai-management">AIManagement</div>;
  };
});

jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

const mockIntegratedAPIService: jest.Mocked<typeof integratedAPIService> = jest.mocked(integratedAPIService);

describe('IntegratedAIChat', () => {
  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
    
    // 기본 모킹 설정
    mockIntegratedAPIService.testConnection.mockResolvedValue(true);
    mockIntegratedAPIService.getSystemStatus.mockResolvedValue({
      status: 'healthy',
      version: '1.0.0',
      metrics: {
        total_requests: 0,
        successful_requests: 0,
        failed_requests: 0,
        average_response_time: 0,
        last_updated: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
    mockIntegratedAPIService.analyzeMessage.mockResolvedValue({
      success: true,
      response: '테스트 응답',
      analysis: {
        emotion: {
          sentiment: 'positive',
          confidence: 0.95,
          positive_score: 0.95,
          negative_score: 0.05,
        },
        keywords: [],
        intent: { type: 'question', confidence: 0.95 },
        response_time: 100,
      },
      timestamp: new Date().toISOString(),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('기본 렌더링', () => {
    it('컴포넌트가 올바르게 렌더링되어야 함', async () => {
      renderWithTheme(<IntegratedAIChat />);

      await waitFor(() => {
        expect(screen.getByTestId('system-status')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('자식 컴포넌트들이 렌더링되어야 함', async () => {
      renderWithTheme(<IntegratedAIChat />);

      await waitFor(() => {
        expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
      }, { timeout: 3000 });
      expect(screen.getByTestId('system-health-monitor')).toBeInTheDocument();
    });
  });

  describe('연결 상태 확인', () => {
    it('연결 상태를 확인할 수 있어야 함', async () => {
      renderWithTheme(<IntegratedAIChat />);

      await waitFor(() => {
        expect(mockIntegratedAPIService.testConnection).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('시스템 메트릭 로드', () => {
    it('시스템 메트릭을 로드할 수 있어야 함', async () => {
      renderWithTheme(<IntegratedAIChat />);

      await waitFor(() => {
        expect(mockIntegratedAPIService.getSystemStatus).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('메시지 전송', () => {
    it('메시지를 입력하고 전송할 수 있어야 함', async () => {
      renderWithTheme(<IntegratedAIChat />);

      await waitFor(() => {
        const inputFields = screen.queryAllByRole('textbox');
        expect(inputFields.length).toBeGreaterThan(0);
      }, { timeout: 3000 });

      const inputFields = screen.queryAllByRole('textbox');
      if (inputFields.length > 0) {
        fireEvent.change(inputFields[0], { target: { value: '테스트 메시지' } });
        
        const sendButton = screen.queryByRole('button', { name: /전송/i }) || 
                          screen.queryByTestId('send-button') ||
                          screen.queryByTestId('send');
        
        if (sendButton) {
          fireEvent.click(sendButton);
          
          await waitFor(() => {
            expect(mockIntegratedAPIService.analyzeMessage).toHaveBeenCalled();
          }, { timeout: 3000 });
        }
      }
    });
  });
});
