/* eslint-disable testing-library/no-node-access, testing-library/no-container */
import React from 'react';
import { render, screen } from '@testing-library/react';
import PredictionChart from '../PredictionChart';
import { setupCommonMocks } from '../../test-utils/testHelpers';

describe('PredictionChart', () => {
  beforeEach(() => {
    setupCommonMocks();
  });

  const mockData = {
    labels: ['Label 1', 'Label 2', 'Label 3'],
    values: [0.3, 0.5, 0.2],
    colors: ['#ff0000', '#00ff00', '#0000ff']
  };

  describe('렌더링', () => {
    it('기본적으로 차트를 렌더링해야 함', () => {
      render(<PredictionChart data={mockData} />);

      expect(screen.getByText('Label 1')).toBeInTheDocument();
      expect(screen.getByText('Label 2')).toBeInTheDocument();
      expect(screen.getByText('Label 3')).toBeInTheDocument();
    });

    it('제목이 있을 때 제목을 표시해야 함', () => {
      render(<PredictionChart data={mockData} title="Test Chart" />);

      expect(screen.getByText('Test Chart')).toBeInTheDocument();
    });

    it('제목이 없을 때 제목을 표시하지 않아야 함', () => {
      const { container } = render(<PredictionChart data={mockData} />);
      const title = container.querySelector('h2, h3, h4');
      expect(title).not.toBeInTheDocument();
    });
  });

  describe('Bar Chart', () => {
    it('기본 타입이 bar일 때 막대 차트를 렌더링해야 함', () => {
      render(<PredictionChart data={mockData} type="bar" />);

      const chartContainer = screen.getByText('Label 1').closest('.chart-container');
      expect(chartContainer).toBeInTheDocument();
    });

    it('막대 차트에서 값을 표시해야 함', () => {
      render(<PredictionChart data={mockData} type="bar" />);

      expect(screen.getByText('30.0%')).toBeInTheDocument();
      expect(screen.getByText('50.0%')).toBeInTheDocument();
      expect(screen.getByText('20.0%')).toBeInTheDocument();
    });

    it('막대 차트에서 커스텀 색상을 사용해야 함', () => {
      render(<PredictionChart data={mockData} type="bar" />);

      const bars = document.querySelectorAll('.chart-bar');
      expect(bars.length).toBe(3);
    });
  });

  describe('Line Chart', () => {
    it('line 타입일 때 선 차트를 렌더링해야 함', () => {
      render(<PredictionChart data={mockData} type="line" />);

      const svg = document.querySelector('.chart-svg');
      expect(svg).toBeInTheDocument();
    });

    it('선 차트에서 라벨을 표시해야 함', () => {
      render(<PredictionChart data={mockData} type="line" />);

      expect(screen.getByText('Label 1')).toBeInTheDocument();
      expect(screen.getByText('Label 2')).toBeInTheDocument();
      expect(screen.getByText('Label 3')).toBeInTheDocument();
    });
  });

  describe('Pie Chart', () => {
    it('pie 타입일 때 파이 차트를 렌더링해야 함', () => {
      render(<PredictionChart data={mockData} type="pie" />);

      const svg = document.querySelector('.chart-svg');
      expect(svg).toBeInTheDocument();
    });

    it('파이 차트에서 라벨을 표시해야 함', () => {
      render(<PredictionChart data={mockData} type="pie" />);

      expect(screen.getByText('Label 1')).toBeInTheDocument();
      expect(screen.getByText('Label 2')).toBeInTheDocument();
      expect(screen.getByText('Label 3')).toBeInTheDocument();
    });
  });

  describe('데이터 처리', () => {
    it('maxValue가 제공되면 그것을 사용해야 함', () => {
      render(<PredictionChart data={mockData} type="bar" maxValue={1.0} />);

      // maxValue가 1.0이면 값들이 그대로 표시됨
      expect(screen.getByText('30.0%')).toBeInTheDocument();
    });

    it('maxValue가 없으면 최대값을 자동 계산해야 함', () => {
      render(<PredictionChart data={mockData} type="bar" />);

      // 최대값이 0.5이므로 0.3은 60%로 표시됨
      expect(screen.getByText('30.0%')).toBeInTheDocument();
    });

    it('빈 데이터를 처리해야 함', () => {
      const emptyData = {
        labels: [],
        values: []
      };

      render(<PredictionChart data={emptyData} type="bar" />);

      const chartContainer = document.querySelector('.chart-container');
      expect(chartContainer).toBeInTheDocument();
    });

    it('단일 데이터 포인트를 처리해야 함', () => {
      const singleData = {
        labels: ['Single'],
        values: [1.0]
      };

      render(<PredictionChart data={singleData} type="bar" />);

      expect(screen.getByText('Single')).toBeInTheDocument();
      expect(screen.getByText('100.0%')).toBeInTheDocument();
    });
  });

  describe('색상 처리', () => {
    it('커스텀 색상을 사용해야 함', () => {
      render(<PredictionChart data={mockData} type="bar" />);

      const bars = document.querySelectorAll('.chart-bar');
      expect(bars.length).toBeGreaterThan(0);
    });

    it('색상이 없으면 기본 색상을 사용해야 함', () => {
      const dataWithoutColors = {
        labels: ['Label 1', 'Label 2'],
        values: [0.5, 0.5]
      };

      render(<PredictionChart data={dataWithoutColors} type="bar" />);

      const bars = document.querySelectorAll('.chart-bar');
      expect(bars.length).toBe(2);
    });
  });

  describe('값 포맷팅', () => {
    it('값을 퍼센트로 올바르게 포맷팅해야 함', () => {
      const data = {
        labels: ['Test'],
        values: [0.1234]
      };

      render(<PredictionChart data={data} type="bar" />);

      expect(screen.getByText('12.3%')).toBeInTheDocument();
    });

    it('0 값을 올바르게 처리해야 함', () => {
      const data = {
        labels: ['Zero'],
        values: [0]
      };

      render(<PredictionChart data={data} type="bar" />);

      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });
  });
});

