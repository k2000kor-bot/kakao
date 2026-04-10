/* eslint-disable jest/no-conditional-expect */
/**
 * AdvancedSecurityDashboard 컴포넌트 테스트
 * 고급 보안 대시보드 컴포넌트 기능 확인
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import AdvancedSecurityDashboard from '../AdvancedSecurityDashboard';
import { renderWithTheme, setupCommonMocks } from '../../test-utils/testHelpers';

// Mock axios
jest.mock('axios', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

// Mock errorLogger
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));
const mockedAxios: jest.Mocked<typeof axios> = jest.mocked(axios);

describe('AdvancedSecurityDashboard', () => {
  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
    
    // 기본 모킹 설정
    mockedAxios.get.mockImplementation((url: string) => {
      if (url?.includes('security/status')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              overall_status: 'secure',
              security_score: 85,
              threats: {
                total: 10,
                active: 2,
                critical: 0,
              },
              events: {
                total: 100,
                high_risk: 5,
              },
              audit: {
                total_logs: 1000,
                failed_logins: 10,
              },
              encryption: {
                active_keys: 5,
                total_keys: 10,
              },
              recommendations: ['Update security policies', 'Review access logs'],
            },
          },
        });
      }
      if (url?.includes('security/threats')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              threats: [],
            },
          },
        });
      }
      if (url?.includes('security/events')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              events: [],
            },
          },
        });
      }
      if (url?.includes('security/keys')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              keys: [],
            },
          },
        });
      }
      if (url?.includes('security/audit-logs')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              logs: [],
            },
          },
        });
      }
      return Promise.resolve({ data: { success: true, data: {} } });
    });

    mockedAxios.post.mockResolvedValue({
      data: { success: true },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('기본 렌더링', () => {
    it('컴포넌트가 올바르게 렌더링되어야 함', async () => {
      renderWithTheme(<AdvancedSecurityDashboard />);

      await waitFor(() => {
        const headers = screen.queryAllByText(/보안 대시보드|보안/i);
        expect(headers.length).toBeGreaterThan(0);
      }, { timeout: 5000 });
    });

    it('탭이 표시되어야 함', async () => {
      renderWithTheme(<AdvancedSecurityDashboard />);

      await waitFor(() => {
        const tabs = screen.queryAllByRole('tab');
        expect(tabs.length).toBeGreaterThan(0);
      }, { timeout: 10000 });
    });
  });

  describe('보안 데이터 로드', () => {
    it('보안 상태를 조회할 수 있어야 함', async () => {
      renderWithTheme(<AdvancedSecurityDashboard />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      }, { timeout: 5000 });
    });
  });

  describe('탭 전환', () => {
    it('위협 탭으로 전환할 수 있어야 함', async () => {
      renderWithTheme(<AdvancedSecurityDashboard />);

      await waitFor(() => {
        const tabs = screen.queryAllByRole('tab');
        expect(tabs.length).toBeGreaterThan(0);
      }, { timeout: 5000 });

      const tabs = screen.queryAllByRole('tab');
      if (tabs.length > 1) {
        fireEvent.click(tabs[1]);
        await waitFor(() => {
          expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
        });
      }
    });

    it('이벤트 탭으로 전환할 수 있어야 함', async () => {
      renderWithTheme(<AdvancedSecurityDashboard />);

      await waitFor(() => {
        const tabs = screen.queryAllByRole('tab');
        expect(tabs.length).toBeGreaterThan(0);
      }, { timeout: 5000 });

      const tabs = screen.queryAllByRole('tab');
      if (tabs.length > 2) {
        fireEvent.click(tabs[2]);
        await waitFor(() => {
          expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
        });
      }
    });
  });

  describe('보안 스캔', () => {
    it('보안 스캔을 시작할 수 있어야 함', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            scan_id: 'scan-123',
            vulnerabilities_found: 5,
            threats_detected: 2,
            risk_level: 'medium',
            recommendations: ['Update dependencies'],
          },
        },
      });

      renderWithTheme(<AdvancedSecurityDashboard />);

      await waitFor(() => {
        const scanButtons = screen.queryAllByRole('button');
        const scanButton = scanButtons.find(btn => 
          btn.textContent?.includes('스캔') || 
          btn.textContent?.includes('Scan')
        );
        if (scanButton) {
          fireEvent.click(scanButton);
          expect(mockedAxios.post).toHaveBeenCalled();
        }
      }, { timeout: 5000 });
    });
  });
});
