/**
 * WritingStatisticsDashboard 컴포넌트 테스트
 * 글쓰기 통계 대시보드 기능 확인
 */
/* eslint-disable testing-library/no-container, testing-library/no-node-access */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { setupCommonMocks } from '../../test-utils/testHelpers';
import WritingStatisticsDashboard from '../WritingStatisticsDashboard';
import writingQualityAnalyzer from '../../services/writingQualityAnalyzer';

// Mock CSS
jest.mock('../WritingStatisticsDashboard.css', () => ({}));

// Mock PredictionChart
jest.mock('../PredictionChart', () => {
  return jest.fn(({ data, title }) => (
    <div data-testid="prediction-chart">
      {title && <h4>{title}</h4>}
      {data.labels.map((label: string, idx: number) => (
        <div key={idx}>{label}</div>
      ))}
    </div>
  ));
});

// Mock writingQualityAnalyzer
const _mockAnalyzeQuality = jest.fn();

jest.mock('../../services/writingQualityAnalyzer', () => {
  return {
    __esModule: true,
    default: {
      analyzeQuality: jest.fn(),
    },
  };
});

describe('WritingStatisticsDashboard', () => {
  const mockAnalysis = {
    metrics: {
      overall: 85.5,
    },
  };

  const mockHistoryItems = [
    {
      id: '1',
      template: '블로그 포스트',
      category: '블로그',
      content: '첫 번째 글쓰기 내용입니다.',
      formValues: { title: '제목1' },
      createdAt: '2024-01-01T10:00:00Z',
    },
    {
      id: '2',
      template: '이메일',
      category: '비즈니스',
      content: '두 번째 글쓰기 내용입니다.',
      formValues: { subject: '제목2' },
      createdAt: '2024-01-02T10:00:00Z',
    },
  ];

  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
    window.localStorage.clear();
    jest.mocked(writingQualityAnalyzer.analyzeQuality).mockReturnValue(mockAnalysis);
  });

  describe('기본 렌더링', () => {
    it('기본 렌더링이 올바르게 작동해야 함', () => {
      render(<WritingStatisticsDashboard content="" />);
      expect(screen.getByText(/글쓰기 통계/i)).toBeInTheDocument();
    });

    it('빈 상태 메시지를 표시해야 함', () => {
      render(<WritingStatisticsDashboard content="" />);
      expect(screen.getByText(/아직 통계 데이터가 없습니다/i)).toBeInTheDocument();
    });
  });

  describe('localStorage 통계 로드', () => {
    it('localStorage에서 히스토리를 로드하여 통계를 계산해야 함', async () => {
      window.localStorage.setItem('writingHistory', JSON.stringify(mockHistoryItems));

      render(<WritingStatisticsDashboard content="" />);

      await waitFor(() => {
        expect(writingQualityAnalyzer.analyzeQuality).toHaveBeenCalled();
      });
    });

    it('히스토리가 없으면 빈 통계를 표시해야 함', () => {
      render(<WritingStatisticsDashboard content="" />);
      expect(screen.getByText(/아직 통계 데이터가 없습니다/i)).toBeInTheDocument();
    });

    it('히스토리 데이터를 기반으로 전체 통계를 계산해야 함', async () => {
      window.localStorage.setItem('writingHistory', JSON.stringify(mockHistoryItems));

      render(<WritingStatisticsDashboard content="" />);

      await waitFor(() => {
        expect(writingQualityAnalyzer.analyzeQuality).toHaveBeenCalled();
      });
    });
  });

  describe('전체 통계 표시', () => {
    beforeEach(() => {
      window.localStorage.setItem('writingHistory', JSON.stringify(mockHistoryItems));
    });

    it('총 작성 글을 표시해야 함', async () => {
      render(<WritingStatisticsDashboard content="" />);
      await waitFor(() => {
        expect(screen.getByText(/총 작성 글/i)).toBeInTheDocument();
      });
    });

    it('총 단어 수를 표시해야 함', async () => {
      render(<WritingStatisticsDashboard content="" />);
      await waitFor(() => {
        expect(screen.getByText(/총 단어 수/i)).toBeInTheDocument();
      });
    });

    it('평균 품질 점수를 표시해야 함', async () => {
      render(<WritingStatisticsDashboard content="" />);
      await waitFor(() => {
        expect(screen.getByText(/평균 품질 점수/i)).toBeInTheDocument();
      });
    });

    it('사용한 템플릿을 표시해야 함', async () => {
      render(<WritingStatisticsDashboard content="" />);
      await waitFor(() => {
        const templateLabels = screen.getAllByText(/사용한 템플릿/i);
        expect(templateLabels.length).toBeGreaterThan(0);
      });
    });
  });

  describe('일일 통계 표시', () => {
    beforeEach(() => {
      window.localStorage.setItem('writingHistory', JSON.stringify(mockHistoryItems));
    });

    it('최근 7일 통계 섹션을 표시해야 함', async () => {
      render(<WritingStatisticsDashboard content="" />);
      await waitFor(() => {
        expect(screen.getByText(/최근 7일 통계/i)).toBeInTheDocument();
      });
    });

    it('품질 추이 섹션을 표시해야 함', async () => {
      render(<WritingStatisticsDashboard content="" />);
      await waitFor(() => {
        expect(screen.getByText(/품질 추이/i)).toBeInTheDocument();
      });
    });
  });

  describe('내용 변경 처리', () => {
    it('내용이 변경되면 통계가 업데이트되어야 함', async () => {
      window.localStorage.setItem('writingHistory', JSON.stringify(mockHistoryItems));
      const { rerender } = render(<WritingStatisticsDashboard content="초기 내용" />);

      await waitFor(() => {
        expect(writingQualityAnalyzer.analyzeQuality).toHaveBeenCalled();
      });

      const callCountBefore = jest.mocked(writingQualityAnalyzer.analyzeQuality).mock.calls.length;

      rerender(<WritingStatisticsDashboard content="변경된 내용" />);

      await waitFor(() => {
        expect(jest.mocked(writingQualityAnalyzer.analyzeQuality).mock.calls.length).toBeGreaterThan(callCountBefore);
      });
    });

    it('빈 내용일 때도 정상적으로 작동해야 함', () => {
      render(<WritingStatisticsDashboard content="" />);
      expect(screen.getByText(/글쓰기 통계/i)).toBeInTheDocument();
    });
  });

  describe('에러 처리', () => {
    it('localStorage 파싱 에러가 발생해도 정상적으로 작동해야 함', () => {
      window.localStorage.setItem('writingHistory', 'invalid json');

      render(<WritingStatisticsDashboard content="" />);
      expect(screen.getByText(/글쓰기 통계/i)).toBeInTheDocument();
    });
  });

  describe('차트 표시', () => {
    beforeEach(() => {
      window.localStorage.setItem('writingHistory', JSON.stringify(mockHistoryItems));
    });

    it('차트 영역이 존재해야 함', async () => {
      const { container } = render(<WritingStatisticsDashboard content="" />);
      await waitFor(() => {
        const chartSection = container.querySelector('.daily-stats-section');
        expect(chartSection).toBeInTheDocument();
      });
    });

    it('품질 추이 차트 영역이 존재해야 함', async () => {
      const { container } = render(<WritingStatisticsDashboard content="" />);
      await waitFor(() => {
        const qualitySection = container.querySelector('.quality-trend-section');
        expect(qualitySection).toBeInTheDocument();
      });
    });
  });

  describe('통계 계산', () => {
    it('여러 날짜의 통계를 올바르게 계산해야 함', async () => {
      const multiDateHistory = [
        {
          id: '1',
          template: '블로그 포스트',
          content: '첫 번째 내용',
          createdAt: '2024-01-01T10:00:00Z',
        },
        {
          id: '2',
          template: '이메일',
          content: '두 번째 내용',
          createdAt: '2024-01-01T11:00:00Z',
        },
        {
          id: '3',
          template: '소셜 미디어',
          content: '세 번째 내용',
          createdAt: '2024-01-02T10:00:00Z',
        },
      ];

      window.localStorage.setItem('writingHistory', JSON.stringify(multiDateHistory));

      render(<WritingStatisticsDashboard content="" />);

      await waitFor(() => {
        expect(writingQualityAnalyzer.analyzeQuality).toHaveBeenCalled();
      });
    });

    it('템플릿이 없는 항목도 처리해야 함', async () => {
      const historyWithoutTemplate = [
        {
          id: '1',
          content: '내용만 있는 항목',
          createdAt: '2024-01-01T10:00:00Z',
        },
      ];

      window.localStorage.setItem('writingHistory', JSON.stringify(historyWithoutTemplate));

      render(<WritingStatisticsDashboard content="" />);

      await waitFor(() => {
        expect(writingQualityAnalyzer.analyzeQuality).toHaveBeenCalled();
      });
    });
  });
});

