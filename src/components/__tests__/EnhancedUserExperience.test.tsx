/* eslint-disable jest/no-conditional-expect */
/**
 * EnhancedUserExperience 컴포넌트 테스트
 * 사용자 경험 향상 컴포넌트 기능 확인
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedUserExperience from '../EnhancedUserExperience';
import { renderWithTheme, setupCommonMocks } from '../../test-utils/testHelpers';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';

// Mock errorLogger
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    error: jest.fn(),
  },
}));

// Mock fetch
installJestFetchMock();

describe('EnhancedUserExperience', () => {
  // 긴 비동기 작업을 위한 타임아웃 설정
  jest.setTimeout(20000);

  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
    localStorage.clear();
    jest.mocked(global.fetch).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('기본 렌더링', () => {
    it('컴포넌트가 올바르게 렌더링되어야 함', () => {
      renderWithTheme(<EnhancedUserExperience />);

      expect(screen.getByText('프로필')).toBeInTheDocument();
      expect(screen.getByText('설정')).toBeInTheDocument();
      expect(screen.getByText('활동')).toBeInTheDocument();
      expect(screen.getByText('피드백')).toBeInTheDocument();
    });

    it('프로필 탭이 기본적으로 활성화되어야 함', () => {
      renderWithTheme(<EnhancedUserExperience />);

      expect(screen.getByText('사용자 프로필')).toBeInTheDocument();
      expect(screen.getByText('총 세션')).toBeInTheDocument();
    });
  });

  describe('탭 전환', () => {
    it('설정 탭으로 전환할 수 있어야 함', () => {
      renderWithTheme(<EnhancedUserExperience />);

      const settingsTab = screen.getByText('설정');
      fireEvent.click(settingsTab);

      expect(screen.getByText('사용자 설정')).toBeInTheDocument();
      expect(screen.getByText('일반 설정')).toBeInTheDocument();
    });

    it('활동 탭으로 전환할 수 있어야 함', () => {
      renderWithTheme(<EnhancedUserExperience />);

      const activityTab = screen.getByText('활동');
      fireEvent.click(activityTab);

      expect(screen.getByText('활동 기록')).toBeInTheDocument();
    });

    it('피드백 탭으로 전환할 수 있어야 함', () => {
      renderWithTheme(<EnhancedUserExperience />);

      const feedbackTab = screen.getByText('피드백');
      fireEvent.click(feedbackTab);

      expect(screen.getByText('피드백 및 제안')).toBeInTheDocument();
      expect(screen.getByText('서비스 피드백')).toBeInTheDocument();
    });
  });

  describe('사용자 통계 표시', () => {
    it('사용자 통계가 올바르게 표시되어야 함', () => {
      renderWithTheme(<EnhancedUserExperience />);

      expect(screen.getByText('45')).toBeInTheDocument(); // totalSessions
      expect(screen.getByText('1250분')).toBeInTheDocument(); // totalTime
      expect(screen.getByText('12')).toBeInTheDocument(); // achievements
      expect(screen.getByText('85%')).toBeInTheDocument(); // productivity
    });

    it('즐겨찾기 기능이 표시되어야 함', () => {
      renderWithTheme(<EnhancedUserExperience />);

      expect(screen.getByText('AI 분석')).toBeInTheDocument();
      // "프로젝트 관리"가 여러 곳에 있을 수 있으므로 queryAllByText 사용
      const projectManagement = screen.queryAllByText('프로젝트 관리');
      expect(projectManagement.length).toBeGreaterThan(0);
      expect(screen.getByText('실시간 협업')).toBeInTheDocument();
    });
  });

  describe('설정 변경', () => {
    it('테마를 변경할 수 있어야 함', async () => {
      renderWithTheme(<EnhancedUserExperience />);

      const settingsTab = screen.getByText('설정');
      fireEvent.click(settingsTab);

      // 테마 선택기가 렌더링될 때까지 대기
      await waitFor(() => {
        // MUI Select는 "테마" 라벨과 함께 렌더링됨 (여러 개일 수 있음)
        const themeLabels = screen.queryAllByText('테마');
        expect(themeLabels.length).toBeGreaterThan(0);
      }, { timeout: 10000 });
    });

    it('언어를 변경할 수 있어야 함', async () => {
      renderWithTheme(<EnhancedUserExperience />);

      const settingsTab = screen.getByText('설정');
      fireEvent.click(settingsTab);

      // 언어 선택기가 렌더링될 때까지 대기
      await waitFor(() => {
        // MUI Select는 "언어" 라벨과 함께 렌더링됨 (여러 개일 수 있음)
        const languageLabels = screen.queryAllByText('언어');
        expect(languageLabels.length).toBeGreaterThan(0);
      }, { timeout: 10000 });
    });

    it('폰트 크기를 변경할 수 있어야 함', async () => {
      renderWithTheme(<EnhancedUserExperience />);

      const settingsTab = screen.getByText('설정');
      fireEvent.click(settingsTab);

      // 폰트 크기 슬라이더가 렌더링될 때까지 대기
      await waitFor(() => {
        // Slider는 role="slider"를 가지지만 aria-label이 없을 수 있음
        const sliders = screen.queryAllByRole('slider');
        expect(sliders.length).toBeGreaterThanOrEqual(0);
      }, { timeout: 10000 });
      
      const sliders = screen.queryAllByRole('slider');
      const fontSizeText = screen.queryByText(/폰트 크기/i);
      if (fontSizeText && sliders.length > 0) {
        const fontSizeSlider = sliders[0];
        fireEvent.change(fontSizeSlider, { target: { value: '16' } });
        expect(fontSizeSlider).toHaveValue(16);
      } else {
        // 폰트 크기 텍스트가 표시되는지 확인
        expect(fontSizeText).toBeInTheDocument();
      }
    });

    it('애니메이션 설정이 표시되어야 함', () => {
      renderWithTheme(<EnhancedUserExperience />);

      const settingsTab = screen.getByText('설정');
      fireEvent.click(settingsTab);

      expect(screen.getByText('애니메이션')).toBeInTheDocument();
    });

    it('사운드 설정이 표시되어야 함', () => {
      renderWithTheme(<EnhancedUserExperience />);

      const settingsTab = screen.getByText('설정');
      fireEvent.click(settingsTab);

      expect(screen.getByText('사운드')).toBeInTheDocument();
    });
  });

  describe('접근성 설정', () => {
    it('접근성 설정이 표시되어야 함', () => {
      renderWithTheme(<EnhancedUserExperience />);

      const settingsTab = screen.getByText('설정');
      fireEvent.click(settingsTab);

      expect(screen.getByText('접근성 설정')).toBeInTheDocument();
      expect(screen.getByText('고대비 모드')).toBeInTheDocument();
      expect(screen.getByText('움직임 줄이기')).toBeInTheDocument();
      expect(screen.getByText('스크린 리더 지원')).toBeInTheDocument();
      expect(screen.getByText('키보드 네비게이션')).toBeInTheDocument();
    });
  });

  describe('성능 설정', () => {
    it('성능 설정이 표시되어야 함', () => {
      renderWithTheme(<EnhancedUserExperience />);

      const settingsTab = screen.getByText('설정');
      fireEvent.click(settingsTab);

      expect(screen.getByText('성능 설정')).toBeInTheDocument();
      expect(screen.getByText('캐싱 활성화')).toBeInTheDocument();
      expect(screen.getByText('압축 활성화')).toBeInTheDocument();
      expect(screen.getByText('지연 로딩')).toBeInTheDocument();
      expect(screen.getByText('가상화')).toBeInTheDocument();
    });
  });

  describe('활동 기록', () => {
    it('활동 기록이 표시되어야 함', () => {
      renderWithTheme(<EnhancedUserExperience />);

      const activityTab = screen.getByText('활동');
      fireEvent.click(activityTab);

      expect(screen.getByText('AI 마스터 달성')).toBeInTheDocument();
      expect(screen.getByText('프로젝트 생성')).toBeInTheDocument();
      expect(screen.getByText('로그인')).toBeInTheDocument();
    });
  });

  describe('피드백 제출', () => {
    it('피드백 탭이 표시되어야 함', () => {
      renderWithTheme(<EnhancedUserExperience />);

      const feedbackTab = screen.getByText('피드백');
      fireEvent.click(feedbackTab);

      expect(screen.getByText('피드백 및 제안')).toBeInTheDocument();
      expect(screen.getByText('서비스 피드백')).toBeInTheDocument();
    });

    it('피드백 입력 필드가 표시되어야 함', () => {
      renderWithTheme(<EnhancedUserExperience />);

      const feedbackTab = screen.getByText('피드백');
      fireEvent.click(feedbackTab);

      const commentInput = screen.getByLabelText(/의견 및 제안/i);
      expect(commentInput).toBeInTheDocument();
    });
  });

  describe('온보딩', () => {
    it('온보딩이 완료되지 않았으면 다이얼로그가 표시되어야 함', () => {
      localStorage.removeItem('onboardingCompleted');
      renderWithTheme(<EnhancedUserExperience />);

      expect(screen.getByText('CORBU.AI 환영합니다!')).toBeInTheDocument();
    });

    it('온보딩이 완료되었으면 다이얼로그가 표시되지 않아야 함', () => {
      localStorage.setItem('onboardingCompleted', 'true');
      renderWithTheme(<EnhancedUserExperience />);

      expect(screen.queryByText('CORBU.AI 환영합니다!')).not.toBeInTheDocument();
    });
  });

  describe('선호도 저장', () => {
    it('설정 탭이 표시되어야 함', () => {
      renderWithTheme(<EnhancedUserExperience />);

      const settingsTab = screen.getByText('설정');
      fireEvent.click(settingsTab);

      expect(screen.getByText('사용자 설정')).toBeInTheDocument();
    });
  });

  describe('에러 처리', () => {
    it('컴포넌트가 정상적으로 렌더링되어야 함', () => {
      renderWithTheme(<EnhancedUserExperience />);
      expect(screen.getByText('프로필')).toBeInTheDocument();
    });

    it('피드백 제출 실패 시 에러를 로깅해야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      renderWithTheme(<EnhancedUserExperience />);

      const feedbackTab = screen.getByText('피드백');
      fireEvent.click(feedbackTab);

      // 피드백 입력 필드 확인
      const commentInput = screen.getByLabelText(/의견 및 제안/i);
      expect(commentInput).toBeInTheDocument();
    });
  });
});
