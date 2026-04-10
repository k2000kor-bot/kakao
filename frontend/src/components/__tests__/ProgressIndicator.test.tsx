/**
 * ProgressIndicator 컴포넌트 테스트
 * 진행률 표시 기능 확인
 */
/* eslint-disable testing-library/no-node-access, testing-library/no-container */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { setupCommonMocks } from '../../test-utils/testHelpers';
import ProgressIndicator from '../ProgressIndicator';

// Mock CSS
jest.mock('../ProgressIndicator.css', () => ({}));

describe('ProgressIndicator', () => {
  beforeEach(() => {
    setupCommonMocks();
  });

  describe('기본 렌더링', () => {
    it('기본 렌더링이 올바르게 작동해야 함', () => {
      const { container } = render(<ProgressIndicator progress={50} />);
      expect(container.querySelector('.progress-indicator')).toBeInTheDocument();
    });

    it('progress bar가 렌더링되어야 함', () => {
      const { container } = render(<ProgressIndicator progress={50} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('progress 값이 올바르게 설정되어야 함', () => {
      render(<ProgressIndicator progress={75} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
      expect(progressBar).toHaveStyle({ width: '75%' });
    });
  });

  describe('progress 값 제한', () => {
    it('progress가 0보다 작으면 0으로 제한되어야 함', () => {
      render(<ProgressIndicator progress={-10} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
      expect(progressBar).toHaveStyle({ width: '0%' });
    });

    it('progress가 100보다 크면 100으로 제한되어야 함', () => {
      render(<ProgressIndicator progress={150} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });

    it('progress가 0-100 범위 내면 그대로 표시되어야 함', () => {
      render(<ProgressIndicator progress={45} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '45');
      expect(progressBar).toHaveStyle({ width: '45%' });
    });
  });

  describe('label 표시', () => {
    it('label이 제공되면 표시되어야 함', () => {
      render(<ProgressIndicator progress={50} label="진행 중" />);
      expect(screen.getByText('진행 중')).toBeInTheDocument();
    });

    it('label이 없으면 표시되지 않아야 함', () => {
      const { container } = render(<ProgressIndicator progress={50} />);
      expect(container.querySelector('.progress-label')).not.toBeInTheDocument();
    });
  });

  describe('size 옵션', () => {
    it('small size를 적용할 수 있어야 함', () => {
      const { container } = render(<ProgressIndicator progress={50} size="small" />);
      expect(container.querySelector('.progress-indicator-small')).toBeInTheDocument();
    });

    it('medium size를 적용할 수 있어야 함 (기본값)', () => {
      const { container } = render(<ProgressIndicator progress={50} />);
      expect(container.querySelector('.progress-indicator-medium')).toBeInTheDocument();
    });

    it('large size를 적용할 수 있어야 함', () => {
      const { container } = render(<ProgressIndicator progress={50} size="large" />);
      expect(container.querySelector('.progress-indicator-large')).toBeInTheDocument();
    });
  });

  describe('variant 옵션', () => {
    it('primary variant를 적용할 수 있어야 함 (기본값)', () => {
      const { container } = render(<ProgressIndicator progress={50} />);
      expect(container.querySelector('.progress-indicator-primary')).toBeInTheDocument();
    });

    it('success variant를 적용할 수 있어야 함', () => {
      const { container } = render(<ProgressIndicator progress={50} variant="success" />);
      expect(container.querySelector('.progress-indicator-success')).toBeInTheDocument();
    });

    it('warning variant를 적용할 수 있어야 함', () => {
      const { container } = render(<ProgressIndicator progress={50} variant="warning" />);
      expect(container.querySelector('.progress-indicator-warning')).toBeInTheDocument();
    });

    it('danger variant를 적용할 수 있어야 함', () => {
      const { container } = render(<ProgressIndicator progress={50} variant="danger" />);
      expect(container.querySelector('.progress-indicator-danger')).toBeInTheDocument();
    });
  });

  describe('애니메이션', () => {
    it('animated가 true일 때 애니메이션 클래스가 적용되어야 함 (기본값)', () => {
      const { container } = render(<ProgressIndicator progress={50} />);
      expect(container.querySelector('.progress-bar-animated')).toBeInTheDocument();
    });

    it('animated가 false일 때 애니메이션 클래스가 적용되지 않아야 함', () => {
      const { container } = render(<ProgressIndicator progress={50} animated={false} />);
      expect(container.querySelector('.progress-bar-animated')).not.toBeInTheDocument();
    });
  });

  describe('상세 정보 표시', () => {
    it('showDetails가 true이고 label이 있으면 퍼센트가 표시되어야 함', () => {
      render(<ProgressIndicator progress={75} label="진행 중" showDetails />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('showDetails가 false이면 퍼센트가 표시되지 않아야 함', () => {
      render(<ProgressIndicator progress={75} label="진행 중" showDetails={false} />);
      expect(screen.queryByText('75%')).not.toBeInTheDocument();
    });

    it('details가 제공되고 showDetails가 true이면 details가 표시되어야 함', () => {
      render(
        <ProgressIndicator
          progress={75}
          showDetails
          details="추가 정보입니다"
        />
      );
      expect(screen.getByText('추가 정보입니다')).toBeInTheDocument();
    });

    it('details가 제공되지만 showDetails가 false이면 details가 표시되지 않아야 함', () => {
      render(
        <ProgressIndicator
          progress={75}
          showDetails={false}
          details="추가 정보입니다"
        />
      );
      expect(screen.queryByText('추가 정보입니다')).not.toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('aria-valuenow 속성이 올바르게 설정되어야 함', () => {
      render(<ProgressIndicator progress={60} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '60');
    });

    it('aria-valuemin 속성이 0으로 설정되어야 함', () => {
      render(<ProgressIndicator progress={50} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    });

    it('aria-valuemax 속성이 100으로 설정되어야 함', () => {
      render(<ProgressIndicator progress={50} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('label이 있으면 aria-label이 label로 설정되어야 함', () => {
      render(<ProgressIndicator progress={50} label="업로드 중" />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', '업로드 중');
    });

    it('label이 없으면 aria-label이 "진행률"로 설정되어야 함', () => {
      render(<ProgressIndicator progress={50} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', '진행률');
    });
  });

  describe('className', () => {
    it('커스텀 className을 적용할 수 있어야 함', () => {
      const { container } = render(
        <ProgressIndicator progress={50} className="custom-class" />
      );
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('퍼센트 반올림', () => {
    it('progress가 소수점이면 반올림되어 표시되어야 함', () => {
      render(<ProgressIndicator progress={75.7} label="진행 중" showDetails />);
      expect(screen.getByText('76%')).toBeInTheDocument();
    });

    it('progress가 소수점이면 반올림되어 표시되어야 함 (내림)', () => {
      render(<ProgressIndicator progress={75.3} label="진행 중" showDetails />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });
});
