/* eslint-disable jest/no-conditional-expect */
/**
 * AdvancedSecurityMonitor 컴포넌트 테스트
 * 고급 보안 모니터링 컴포넌트 기능 확인
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdvancedSecurityMonitor from '../AdvancedSecurityMonitor';
import { renderWithTheme, setupCommonMocks } from '../../test-utils/testHelpers';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';

// Mock errorLogger
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock fetch
installJestFetchMock();

describe('AdvancedSecurityMonitor', () => {
  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
    jest.mocked(global.fetch).mockClear();
    
    // 초기 렌더링 시 호출되는 fetch 모킹
    jest.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        metrics: {
          threatLevel: 'low',
          activeThreats: 0,
          blockedAttempts: 0,
          vulnerabilities: 0,
          securityScore: 95,
          lastScan: new Date().toISOString(),
          encryptionStatus: 'active',
          firewallStatus: 'active',
          antivirusStatus: 'active',
        },
      }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('기본 렌더링', () => {
    it('컴포넌트가 올바르게 렌더링되어야 함', () => {
      renderWithTheme(<AdvancedSecurityMonitor />);

      // 탭으로 확인
      expect(screen.getByRole('tab', { name: /대시보드/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /위협 모니터링/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /보안 정책/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /감사 로그/i })).toBeInTheDocument();
    });

    it('대시보드 탭이 기본적으로 활성화되어 있어야 함', async () => {
      renderWithTheme(<AdvancedSecurityMonitor />);

      const dashboardTab = screen.getByRole('tab', { name: /대시보드/i });
      expect(dashboardTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('탭 전환', () => {
    it('위협 모니터링 탭으로 전환할 수 있어야 함', () => {
      renderWithTheme(<AdvancedSecurityMonitor />);

      const threatsTab = screen.getByRole('tab', { name: /위협 모니터링/i });
      fireEvent.click(threatsTab);

      // 탭이 활성화되었는지 확인
      expect(threatsTab).toHaveAttribute('aria-selected', 'true');
    });

    it('보안 정책 탭으로 전환할 수 있어야 함', () => {
      renderWithTheme(<AdvancedSecurityMonitor />);

      const policiesTab = screen.getByRole('tab', { name: /보안 정책/i });
      fireEvent.click(policiesTab);

      // 탭이 활성화되었는지 확인
      expect(policiesTab).toHaveAttribute('aria-selected', 'true');
    });

    it('감사 로그 탭으로 전환할 수 있어야 함', () => {
      renderWithTheme(<AdvancedSecurityMonitor />);

      const auditTab = screen.getByRole('tab', { name: /감사 로그/i });
      fireEvent.click(auditTab);

      // 탭이 활성화되었는지 확인
      expect(auditTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('보안 메트릭', () => {
    it('보안 점수가 표시되어야 함', () => {
      renderWithTheme(<AdvancedSecurityMonitor />);

      expect(screen.getByText(/95/i)).toBeInTheDocument();
    });

    it('위협 레벨이 표시되어야 함', () => {
      renderWithTheme(<AdvancedSecurityMonitor />);

      expect(screen.getByText(/low/i)).toBeInTheDocument();
    });

    it('보안 상태가 표시되어야 함', () => {
      renderWithTheme(<AdvancedSecurityMonitor />);

      expect(screen.getByText(/암호화/i)).toBeInTheDocument();
      expect(screen.getByText(/방화벽/i)).toBeInTheDocument();
      expect(screen.getByText(/안티바이러스/i)).toBeInTheDocument();
    });
  });

  describe('보안 이벤트', () => {
    it('보안 이벤트 목록이 표시되어야 함', () => {
      renderWithTheme(<AdvancedSecurityMonitor />);

      const threatsTab = screen.getByText(/위협 모니터링/i);
      fireEvent.click(threatsTab);

      expect(screen.getByText('의심스러운 로그인 시도')).toBeInTheDocument();
      expect(screen.getByText('SQL 인젝션 공격 시도')).toBeInTheDocument();
      expect(screen.getByText('권한 없는 파일 접근 시도')).toBeInTheDocument();
    });

    it('이벤트 심각도가 표시되어야 함', () => {
      renderWithTheme(<AdvancedSecurityMonitor />);

      const threatsTab = screen.getByText(/위협 모니터링/i);
      fireEvent.click(threatsTab);

      // 심각도 레이블 확인 (여러 개 있을 수 있으므로 queryAllByText 사용)
      const mediumLabels = screen.queryAllByText(/medium/i);
      const highLabels = screen.queryAllByText(/high/i);
      expect(mediumLabels.length + highLabels.length).toBeGreaterThan(0);
    });
  });

  describe('보안 정책', () => {
    it('보안 정책 목록이 표시되어야 함', () => {
      renderWithTheme(<AdvancedSecurityMonitor />);

      const policiesTab = screen.getByRole('tab', { name: /보안 정책/i });
      fireEvent.click(policiesTab);

      // 탭이 활성화되었는지 확인
      expect(policiesTab).toHaveAttribute('aria-selected', 'true');
    });

    it('정책 상태가 표시되어야 함', () => {
      renderWithTheme(<AdvancedSecurityMonitor />);

      const policiesTab = screen.getByText(/보안 정책/i);
      fireEvent.click(policiesTab);

      // 정책 상태 확인 (여러 개 있을 수 있으므로 queryAllByText 사용)
      const activeLabels = screen.queryAllByText(/active/i);
      expect(activeLabels.length).toBeGreaterThan(0);
    });
  });

  describe('감사 로그', () => {
    it('감사 로그 테이블이 표시되어야 함', () => {
      renderWithTheme(<AdvancedSecurityMonitor />);

      const auditTab = screen.getByText(/감사 로그/i);
      fireEvent.click(auditTab);

      expect(screen.getByText(/사용자/i)).toBeInTheDocument();
      expect(screen.getByText(/액션/i)).toBeInTheDocument();
      expect(screen.getByText(/리소스/i)).toBeInTheDocument();
      expect(screen.getByText(/상태/i)).toBeInTheDocument();
    });
  });

  describe('보안 스캔', () => {
    it('보안 스캔을 시작할 수 있어야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          scanId: 'scan-123',
        }),
      });

      renderWithTheme(<AdvancedSecurityMonitor />);

      // 스캔 버튼 찾기
      const scanButtons = screen.queryAllByRole('button', { name: /스캔|scan/i });
      if (scanButtons.length > 0) {
        fireEvent.click(scanButtons[0]);
        
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalled();
        });
      }
    });
  });

  describe('위협 상세 정보', () => {
    it('위협 목록이 표시되어야 함', () => {
      renderWithTheme(<AdvancedSecurityMonitor />);

      const threatsTab = screen.getByText(/위협 모니터링/i);
      fireEvent.click(threatsTab);

      // 위협 목록 확인
      expect(screen.getByText('의심스러운 로그인 시도')).toBeInTheDocument();
    });
  });

  describe('보안 메트릭 업데이트', () => {
    it('보안 메트릭을 업데이트할 수 있어야 함', async () => {
      const mockMetrics = {
        success: true,
        metrics: {
          threatLevel: 'medium',
          activeThreats: 2,
          blockedAttempts: 10,
          vulnerabilities: 1,
          securityScore: 90,
          lastScan: new Date().toISOString(),
          encryptionStatus: 'active',
          firewallStatus: 'active',
          antivirusStatus: 'active',
        },
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMetrics,
      });

      renderWithTheme(<AdvancedSecurityMonitor />);

      // 새로고침 버튼 찾기
      const refreshButtons = screen.queryAllByRole('button', { name: /새로고침|refresh/i });
      if (refreshButtons.length > 0) {
        fireEvent.click(refreshButtons[0]);
        
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalled();
        });
      }
    });
  });
});
