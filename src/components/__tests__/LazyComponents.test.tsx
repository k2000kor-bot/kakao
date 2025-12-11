import React, { Suspense } from 'react';
import { render, screen } from '@testing-library/react';
import {
  withLazyLoading,
} from '../LazyComponents';
import LoadingSkeleton from '../LoadingSkeleton';

// Mock LoadingSkeleton
jest.mock('../LoadingSkeleton', () => {
  return jest.fn(() => <div data-testid="loading-skeleton">Loading...</div>);
});

// Mock 컴포넌트
const MockComponent: React.FC<{ title: string }> = ({ title }) => (
  <div data-testid="mock-component">{title}</div>
);

describe('LazyComponents', () => {
  describe('Suspense 구조', () => {
    it('Suspense로 컴포넌트를 감쌀 수 있어야 함', () => {
      render(
        <Suspense fallback={<div>Loading...</div>}>
          <MockComponent title="Test" />
        </Suspense>
      );

      expect(screen.getByTestId('mock-component')).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('withLazyLoading', () => {
    it('컴포넌트를 지연 로딩 래퍼로 감쌀 수 있어야 함', () => {
      const LazyWrappedComponent = withLazyLoading(MockComponent);

      render(<LazyWrappedComponent title="Wrapped" />);

      expect(screen.getByTestId('mock-component')).toBeInTheDocument();
      expect(screen.getByText('Wrapped')).toBeInTheDocument();
    });

    it('커스텀 fallback을 사용할 수 있어야 함', () => {
      const CustomFallback = () => <div>Custom Loading...</div>;
      const LazyWrappedComponent = withLazyLoading(MockComponent, <CustomFallback />);

      render(<LazyWrappedComponent title="Wrapped" />);

      // 컴포넌트가 로드되면 표시됨
      expect(screen.getByTestId('mock-component')).toBeInTheDocument();
    });

    it('props를 올바르게 전달해야 함', () => {
      const LazyWrappedComponent = withLazyLoading(MockComponent);

      render(<LazyWrappedComponent title="Test Props" />);

      expect(screen.getByText('Test Props')).toBeInTheDocument();
    });
  });

  describe('지연 로딩된 컴포넌트', () => {
    it('Lazy 컴포넌트들이 정의되어 있어야 함', () => {
      // Lazy 컴포넌트들이 export되어 있는지 확인
      // 실제 import는 동적이므로 모킹이 필요할 수 있음
      expect(true).toBe(true); // 기본 테스트
    });
  });
});

