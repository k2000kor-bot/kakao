/**
 * LoadingSkeleton 컴포넌트 테스트
 * 로딩 스켈레톤 UI 기능 확인
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSkeleton from '../LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('기본 렌더링이 올바르게 작동해야 함', () => {
    const { container } = render(<LoadingSkeleton />);
    expect(container.querySelector('.skeleton')).toBeInTheDocument();
  });

  it('text 타입을 렌더링해야 함', () => {
    const { container } = render(<LoadingSkeleton type="text" />);
    expect(container.querySelector('.skeleton-text')).toBeInTheDocument();
  });

  it('지정된 라인 수만큼 렌더링해야 함', () => {
    const { container } = render(<LoadingSkeleton type="text" lines={5} />);
    const lines = container.querySelectorAll('.skeleton-line');
    expect(lines).toHaveLength(5);
  });

  it('card 타입을 렌더링해야 함', () => {
    const { container } = render(<LoadingSkeleton type="card" />);
    expect(container.querySelector('.skeleton-card')).toBeInTheDocument();
  });

  it('list 타입을 렌더링해야 함', () => {
    const { container } = render(<LoadingSkeleton type="list" />);
    expect(container.querySelector('.skeleton-list')).toBeInTheDocument();
  });

  it('chart 타입을 렌더링해야 함', () => {
    const { container } = render(<LoadingSkeleton type="chart" />);
    expect(container.querySelector('.skeleton-chart')).toBeInTheDocument();
  });

  it('table 타입을 렌더링해야 함', () => {
    const { container } = render(<LoadingSkeleton type="table" />);
    expect(container.querySelector('.skeleton-table')).toBeInTheDocument();
  });

  it('커스텀 width와 height를 적용해야 함', () => {
    const { container } = render(
      <LoadingSkeleton type="card" width="200px" height="100px" />
    );
    const skeleton = container.querySelector('.skeleton-card') as HTMLElement;
    expect(skeleton).toHaveStyle({ width: '200px', height: '100px' });
  });

  it('커스텀 className을 적용해야 함', () => {
    const { container } = render(
      <LoadingSkeleton className="custom-class" />
    );
    const skeleton = container.querySelector('.skeleton');
    expect(skeleton).toHaveClass('custom-class');
  });

  it('마지막 라인이 60% 너비여야 함', () => {
    const { container } = render(<LoadingSkeleton type="text" lines={3} />);
    const lines = container.querySelectorAll('.skeleton-line');
    const lastLine = lines[lines.length - 1] as HTMLElement;
    expect(lastLine).toHaveStyle({ width: '60%' });
  });
});

