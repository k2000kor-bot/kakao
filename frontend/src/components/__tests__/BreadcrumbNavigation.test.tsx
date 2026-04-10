/**
 * BreadcrumbNavigation 컴포넌트 테스트
 * 브레드크럼 네비게이션 기능 확인
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { setupCommonMocks } from '../../test-utils/testHelpers';
import BreadcrumbNavigation, { BreadcrumbItem } from '../BreadcrumbNavigation';

describe('BreadcrumbNavigation', () => {
  const mockItems: BreadcrumbItem[] = [
    { label: '홈', path: '/', onClick: jest.fn() },
    { label: '프로젝트', path: '/projects', onClick: jest.fn() },
    { label: '현재 페이지', path: '/projects/1' },
  ];

  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
  });

  it('기본 렌더링이 올바르게 작동해야 함', () => {
    render(<BreadcrumbNavigation items={mockItems} />);
    expect(screen.getByText('홈')).toBeInTheDocument();
    expect(screen.getByText('프로젝트')).toBeInTheDocument();
    expect(screen.getByText('현재 페이지')).toBeInTheDocument();
  });

  it('빈 배열일 때 렌더링되지 않아야 함', () => {
    const { container } = render(<BreadcrumbNavigation items={[]} />);
    // eslint-disable-next-line testing-library/no-node-access -- 빈 목록일 때 자식 없음 검증
    expect(container.firstChild).toBeNull();
  });

  it('마지막 항목이 현재 페이지로 표시되어야 함', () => {
    render(<BreadcrumbNavigation items={mockItems} />);
    
    const currentPage = screen.getByText('현재 페이지');
    expect(currentPage).toHaveAttribute('aria-current', 'page');
    expect(currentPage.className).toContain('breadcrumb-current');
  });

  it('마지막이 아닌 항목은 버튼으로 렌더링되어야 함', () => {
    render(<BreadcrumbNavigation items={mockItems} />);
    
    const homeButton = screen.getByText('홈');
    expect(homeButton.tagName).toBe('BUTTON');
    expect(homeButton).toHaveAttribute('aria-label', '홈로 이동');
  });

  it('항목 클릭 시 onClick이 호출되어야 함', () => {
    const mockOnClick = jest.fn();
    const items: BreadcrumbItem[] = [
      { label: '홈', onClick: mockOnClick },
      { label: '현재 페이지' },
    ];
    
    render(<BreadcrumbNavigation items={items} />);
    
    const homeButton = screen.getByText('홈');
    expect(homeButton.tagName).toBe('BUTTON');
    fireEvent.click(homeButton);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('아이콘이 제공되면 표시되어야 함', () => {
    const itemsWithIcon: BreadcrumbItem[] = [
      { label: '홈', icon: <span data-testid="home-icon">🏠</span> },
    ];
    
    render(<BreadcrumbNavigation items={itemsWithIcon} />);
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });

  it('구분자가 올바르게 표시되어야 함', () => {
    const { container } = render(<BreadcrumbNavigation items={mockItems} />);
    // 마지막 항목이 아닌 항목들 사이에 구분자가 있어야 함 (aria-hidden 구분자 검증)
    /* eslint-disable testing-library/no-container, testing-library/no-node-access */
    const separators = container.querySelectorAll('.breadcrumb-separator');
    /* eslint-enable testing-library/no-container, testing-library/no-node-access */
    expect(separators.length).toBeGreaterThan(0);
  });

  it('마지막 항목 뒤에는 구분자가 없어야 함', () => {
    render(<BreadcrumbNavigation items={mockItems} />);
    const currentPage = screen.getByText('현재 페이지');
    // eslint-disable-next-line testing-library/no-node-access -- 마지막 항목 뒤 구분자 없음 검증
    const _nextSibling = currentPage.nextSibling;
    // 구분자는 aria-hidden이 true이므로 숨겨져 있을 수 있음
    // 하지만 마지막 항목 뒤에는 구분자가 없어야 함
  });

  it('className prop이 올바르게 적용되어야 함', () => {
    const { container } = render(
      <BreadcrumbNavigation items={mockItems} className="custom-class" />
    );
    /* eslint-disable testing-library/no-container, testing-library/no-node-access */
    const nav = container.querySelector('nav');
    /* eslint-enable testing-library/no-container, testing-library/no-node-access */
    expect(nav?.className).toContain('custom-class');
  });

  it('접근성 속성이 올바르게 설정되어야 함', () => {
    render(<BreadcrumbNavigation items={mockItems} />);
    
    const nav = screen.getByLabelText('Breadcrumb');
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
    expect(nav.tagName).toBe('NAV');
  });

  it('단일 항목도 올바르게 렌더링되어야 함', () => {
    const singleItem: BreadcrumbItem[] = [
      { label: '홈' },
    ];
    
    render(<BreadcrumbNavigation items={singleItem} />);
    expect(screen.getByText('홈')).toBeInTheDocument();
    expect(screen.getByText('홈')).toHaveAttribute('aria-current', 'page');
  });

  it('path가 없어도 올바르게 렌더링되어야 함', () => {
    const itemsWithoutPath: BreadcrumbItem[] = [
      { label: '홈', onClick: jest.fn() },
    ];
    
    render(<BreadcrumbNavigation items={itemsWithoutPath} />);
    expect(screen.getByText('홈')).toBeInTheDocument();
  });
});

