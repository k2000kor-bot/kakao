/**
 * WritingQualityPanel 컴포넌트 테스트
 * 글쓰기 품질 분석 패널 기능 확인
 */
/* eslint-disable testing-library/no-container, testing-library/no-node-access */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { setupCommonMocks } from '../../test-utils/testHelpers';
import WritingQualityPanel from '../WritingQualityPanel';
import writingQualityAnalyzer from '../../services/writingQualityAnalyzer';

// Mock CSS
jest.mock('../WritingQualityPanel.css', () => ({}));

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
const _mockAnalyzeStyle = jest.fn();

jest.mock('../../services/writingQualityAnalyzer', () => {
  return {
    __esModule: true,
    default: {
      analyzeQuality: jest.fn(),
      analyzeStyle: jest.fn(),
    },
  };
});

describe('WritingQualityPanel', () => {
  const mockOnImprove = jest.fn();

  const mockAnalysis = {
    metrics: {
      overall: 85.5,
      readability: 90,
      coherence: 80,
      grammar: 85,
      vocabulary: 88,
      structure: 84,
    },
    statistics: {
      wordCount: 150,
      charCount: 750,
      sentenceCount: 10,
      paragraphCount: 3,
      readingTime: 3,
      uniqueWords: 120,
    },
    strengths: ['명확한 구조', '적절한 어휘 사용'],
    weaknesses: ['문장 길이 개선 필요'],
    suggestions: ['긴 문장을 짧게 나누세요', '더 구체적인 예시를 추가하세요'],
  };

  const mockStyleAnalysis = {
    formality: 'formal',
    tone: 'positive',
    complexity: 'moderate',
  };

  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
    jest.mocked(writingQualityAnalyzer.analyzeQuality).mockReturnValue(mockAnalysis);
    jest.mocked(writingQualityAnalyzer.analyzeStyle).mockReturnValue(mockStyleAnalysis);
  });

  describe('기본 렌더링', () => {
    it('빈 내용일 때 빈 상태 메시지를 표시해야 함', () => {
      render(<WritingQualityPanel content="" />);
      expect(screen.getByText('글을 작성하면 품질 분석 결과가 표시됩니다.')).toBeInTheDocument();
    });

    it('내용이 있을 때 품질 분석 결과를 표시해야 함', () => {
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      expect(screen.getByText('글쓰기 품질 분석')).toBeInTheDocument();
    });

    it('전체 점수를 표시해야 함', () => {
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      expect(screen.getByText('85.5')).toBeInTheDocument();
    });

    it('점수 레이블을 표시해야 함', () => {
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      expect(screen.getByText('양호')).toBeInTheDocument();
    });
  });

  describe('점수 색상 및 레이블', () => {
    it('점수가 90 이상이면 "우수" 레이블을 표시해야 함', () => {
      jest.mocked(writingQualityAnalyzer.analyzeQuality).mockReturnValue({
        ...mockAnalysis,
        metrics: { ...mockAnalysis.metrics, overall: 95 },
      });
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      expect(screen.getByText('우수')).toBeInTheDocument();
    });

    it('점수가 80 이상이면 "양호" 레이블을 표시해야 함', () => {
      jest.mocked(writingQualityAnalyzer.analyzeQuality).mockReturnValue({
        ...mockAnalysis,
        metrics: { ...mockAnalysis.metrics, overall: 85 },
      });
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      expect(screen.getByText('양호')).toBeInTheDocument();
    });

    it('점수가 70 이상이면 "보통" 레이블을 표시해야 함', () => {
      jest.mocked(writingQualityAnalyzer.analyzeQuality).mockReturnValue({
        ...mockAnalysis,
        metrics: { ...mockAnalysis.metrics, overall: 75 },
      });
      jest.mocked(writingQualityAnalyzer.analyzeStyle).mockReturnValue({
        ...mockStyleAnalysis,
        complexity: 'simple', // "보통"과 겹치지 않도록 변경
      });
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      const scoreLabels = screen.getAllByText('보통');
      expect(scoreLabels.length).toBeGreaterThan(0);
    });

    it('점수가 60 이상이면 "개선 필요" 레이블을 표시해야 함', () => {
      jest.mocked(writingQualityAnalyzer.analyzeQuality).mockReturnValue({
        ...mockAnalysis,
        metrics: { ...mockAnalysis.metrics, overall: 65 },
        weaknesses: [], // "개선 필요" 섹션 제목과 겹치지 않도록
      });
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      const labels = screen.getAllByText('개선 필요');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('점수가 60 미만이면 "부족" 레이블을 표시해야 함', () => {
      jest.mocked(writingQualityAnalyzer.analyzeQuality).mockReturnValue({
        ...mockAnalysis,
        metrics: { ...mockAnalysis.metrics, overall: 50 },
      });
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      expect(screen.getByText('부족')).toBeInTheDocument();
    });
  });

  describe('통계 정보 표시', () => {
    it('단어 수를 표시해야 함', () => {
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      expect(screen.getByText('단어 수')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it('글자 수를 표시해야 함', () => {
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      expect(screen.getByText('글자 수')).toBeInTheDocument();
      expect(screen.getByText('750')).toBeInTheDocument();
    });

    it('문장 수를 표시해야 함', () => {
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      expect(screen.getByText('문장 수')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('단락 수를 표시해야 함', () => {
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      expect(screen.getByText('단락 수')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('읽기 시간을 표시해야 함', () => {
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      expect(screen.getByText('읽기 시간')).toBeInTheDocument();
      expect(screen.getByText('3분')).toBeInTheDocument();
    });

    it('고유 단어 수를 표시해야 함', () => {
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      expect(screen.getByText('고유 단어')).toBeInTheDocument();
      expect(screen.getByText('120')).toBeInTheDocument();
    });
  });

  describe('차트 표시', () => {
    it('차트 영역이 존재해야 함', () => {
      const { container } = render(<WritingQualityPanel content="테스트 내용입니다" />);
      const chartSection = container.querySelector('.metrics-chart');
      expect(chartSection).toBeInTheDocument();
    });

    it('PredictionChart 컴포넌트가 호출되어야 함', () => {
      const PredictionChart = require('../PredictionChart');
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      // PredictionChart가 모킹되어 있으므로 호출되었는지 확인
      expect(PredictionChart).toHaveBeenCalled();
    });
  });

  describe('스타일 분석', () => {
    it('스타일 분석 섹션을 표시해야 함', () => {
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      expect(screen.getByText('스타일 분석')).toBeInTheDocument();
    });

    it('격식 수준을 표시해야 함', () => {
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      expect(screen.getByText('격식있는')).toBeInTheDocument();
    });

    it('톤을 표시해야 함', () => {
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      expect(screen.getByText('긍정적')).toBeInTheDocument();
    });

    it('복잡도를 표시해야 함', () => {
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      expect(screen.getByText('보통')).toBeInTheDocument();
    });
  });

  describe('강점 표시', () => {
    it('강점이 있으면 강점 섹션을 표시해야 함', () => {
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      expect(screen.getByText('강점')).toBeInTheDocument();
      expect(screen.getByText(/명확한 구조/)).toBeInTheDocument();
      expect(screen.getByText(/적절한 어휘 사용/)).toBeInTheDocument();
    });

    it('강점이 없으면 강점 섹션을 표시하지 않아야 함', () => {
      jest.mocked(writingQualityAnalyzer.analyzeQuality).mockReturnValue({
        ...mockAnalysis,
        strengths: [],
      });
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      expect(screen.queryByText('강점')).not.toBeInTheDocument();
    });
  });

  describe('약점 표시', () => {
    it('약점이 있으면 개선 필요 섹션을 표시해야 함', () => {
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      expect(screen.getByText('개선 필요')).toBeInTheDocument();
      expect(screen.getByText(/문장 길이 개선 필요/)).toBeInTheDocument();
    });

    it('약점이 없으면 개선 필요 섹션을 표시하지 않아야 함', () => {
      jest.mocked(writingQualityAnalyzer.analyzeQuality).mockReturnValue({
        ...mockAnalysis,
        weaknesses: [],
      });
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      // "개선 필요"는 약점 섹션 제목이지만 통계 섹션에도 있을 수 있으므로 확인 필요
      const weaknessesSection = screen.queryByText(/문장 길이 개선 필요/);
      expect(weaknessesSection).not.toBeInTheDocument();
    });
  });

  describe('개선 제안', () => {
    it('개선 제안이 있으면 제안 섹션을 표시해야 함', () => {
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      expect(screen.getByText('개선 제안')).toBeInTheDocument();
      expect(screen.getByText(/긴 문장을 짧게 나누세요/)).toBeInTheDocument();
      expect(screen.getByText(/더 구체적인 예시를 추가하세요/)).toBeInTheDocument();
    });

    it('개선 제안이 없으면 제안 섹션을 표시하지 않아야 함', () => {
      jest.mocked(writingQualityAnalyzer.analyzeQuality).mockReturnValue({
        ...mockAnalysis,
        suggestions: [],
      });
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      expect(screen.queryByText('개선 제안')).not.toBeInTheDocument();
    });

    it('onImprove가 제공되면 적용 버튼을 표시해야 함', () => {
      render(<WritingQualityPanel content="테스트 내용입니다" onImprove={mockOnImprove} />);
      const applyButtons = screen.getAllByText('적용');
      expect(applyButtons.length).toBeGreaterThan(0);
    });

    it('적용 버튼을 클릭하면 onImprove 콜백이 호출되어야 함', () => {
      render(<WritingQualityPanel content="테스트 내용입니다" onImprove={mockOnImprove} />);
      const applyButtons = screen.getAllByText('적용');
      fireEvent.click(applyButtons[0]);
      expect(mockOnImprove).toHaveBeenCalledWith('긴 문장을 짧게 나누세요');
    });

    it('onImprove가 제공되지 않으면 적용 버튼을 표시하지 않아야 함', () => {
      render(<WritingQualityPanel content="테스트 내용입니다" />);
      expect(screen.queryByText('적용')).not.toBeInTheDocument();
    });
  });

  describe('내용 변경', () => {
    it('내용이 변경되면 분석이 다시 수행되어야 함', () => {
      const { rerender } = render(<WritingQualityPanel content="초기 내용" />);
      expect(writingQualityAnalyzer.analyzeQuality).toHaveBeenCalledWith('초기 내용');

      rerender(<WritingQualityPanel content="변경된 내용" />);
      expect(writingQualityAnalyzer.analyzeQuality).toHaveBeenCalledWith('변경된 내용');
    });

    it('내용이 빈 문자열이 되면 빈 상태를 표시해야 함', () => {
      const { rerender } = render(<WritingQualityPanel content="테스트 내용" />);
      rerender(<WritingQualityPanel content="" />);
      expect(screen.getByText('글을 작성하면 품질 분석 결과가 표시됩니다.')).toBeInTheDocument();
    });
  });
});

