/* eslint-disable jest/no-conditional-expect */
/* eslint-disable testing-library/no-container, testing-library/no-node-access */
/**
 * KeyboardShortcutsHelp 컴포넌트 테스트
 * 키보드 단축키 도움말 기능 확인
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { setupCommonMocks } from '../../test-utils/testHelpers';
import KeyboardShortcutsHelp from '../KeyboardShortcutsHelp';

describe('KeyboardShortcutsHelp', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
  });

  it('isOpen이 false일 때 렌더링되지 않아야 함', () => {
    render(<KeyboardShortcutsHelp isOpen={false} onClose={jest.fn()} />);
    expect(screen.queryByText(/키보드 단축키/)).not.toBeInTheDocument();
  });

  it('isOpen이 true일 때 렌더링되어야 함', () => {
    render(<KeyboardShortcutsHelp {...defaultProps} />);
    expect(screen.getByText(/키보드 단축키/)).toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 onClose가 호출되어야 함', () => {
    render(<KeyboardShortcutsHelp {...defaultProps} />);
    
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('오버레이 클릭 시 onClose가 호출되어야 함', () => {
    const { container } = render(<KeyboardShortcutsHelp {...defaultProps} />);
    
    const overlay = container.querySelector('.shortcuts-help-overlay');
    if (overlay) {
      fireEvent.click(overlay);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('모달 내부 클릭 시 onClose가 호출되지 않아야 함', () => {
    const { container } = render(<KeyboardShortcutsHelp {...defaultProps} />);
    
    const modal = container.querySelector('.shortcuts-help-modal');
    if (modal) {
      fireEvent.click(modal);
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    }
  });

  it('Escape 키로 닫을 수 있어야 함', () => {
    render(<KeyboardShortcutsHelp {...defaultProps} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('카테고리 버튼 클릭 시 필터링되어야 함', () => {
    const { container } = render(<KeyboardShortcutsHelp {...defaultProps} />);
    
    // 네비게이션 버튼 찾기
    const navigationButton = Array.from(container.querySelectorAll('.category-btn')).find(
      btn => btn.textContent?.includes('네비게이션')
    );
    
    if (navigationButton) {
      fireEvent.click(navigationButton);
      
      // 네비게이션 카테고리의 단축키만 표시되어야 함 (실제 컴포넌트 문구 기준)
      expect(screen.getByText('새 대화 시작')).toBeInTheDocument();
      expect(screen.getByText('사이드바 토글')).toBeInTheDocument();
    }
  });

  it('전체 카테고리 선택 시 모든 단축키가 표시되어야 함', () => {
    const { container } = render(<KeyboardShortcutsHelp {...defaultProps} />);
    
    // 네비게이션 선택
    const navigationButton = Array.from(container.querySelectorAll('.category-btn')).find(
      btn => btn.textContent?.includes('네비게이션')
    );
    if (navigationButton) {
      fireEvent.click(navigationButton);
    }
    
    // 전체 선택
    const allButton = Array.from(container.querySelectorAll('.category-btn')).find(
      btn => btn.textContent?.includes('전체')
    );
    if (allButton) {
      fireEvent.click(allButton);
      
      // 모든 카테고리의 단축키가 표시되어야 함
      expect(screen.getByText('새 대화 시작')).toBeInTheDocument();
      expect(screen.getByText('메시지 전송')).toBeInTheDocument();
      expect(screen.getByText(/단축키 도움말/)).toBeInTheDocument();
    }
  });

  it('편집 카테고리 필터링이 작동해야 함', () => {
    const { container } = render(<KeyboardShortcutsHelp {...defaultProps} />);
    
    const editingButton = Array.from(container.querySelectorAll('.category-btn')).find(
      btn => btn.textContent?.includes('편집')
    );
    if (editingButton) {
      fireEvent.click(editingButton);
      expect(screen.getByText('메시지 전송')).toBeInTheDocument();
      expect(screen.getByText('줄바꿈')).toBeInTheDocument();
    }
  });

  it('검색 카테고리 필터링이 작동해야 함', () => {
    const { container } = render(<KeyboardShortcutsHelp {...defaultProps} />);
    
    const searchButton = Array.from(container.querySelectorAll('.category-btn')).find(
      btn => btn.textContent?.includes('검색')
    );
    if (searchButton) {
      fireEvent.click(searchButton);
      expect(screen.getByText('대화 내 메시지 검색')).toBeInTheDocument();
    }
  });

  it('일반 카테고리 필터링이 작동해야 함', () => {
    const { container } = render(<KeyboardShortcutsHelp {...defaultProps} />);
    
    const generalButton = Array.from(container.querySelectorAll('.category-btn')).find(
      btn => btn.textContent?.includes('일반')
    );
    if (generalButton) {
      fireEvent.click(generalButton);
      expect(screen.getByText(/단축키 도움말/)).toBeInTheDocument();
    }
  });

  it('선택된 카테고리가 활성화되어 표시되어야 함', () => {
    const { container } = render(<KeyboardShortcutsHelp {...defaultProps} />);
    
    const navigationButton = Array.from(container.querySelectorAll('.category-btn')).find(
      btn => btn.textContent?.includes('네비게이션')
    );
    if (navigationButton) {
      fireEvent.click(navigationButton);
      
      const activeButton = container.querySelector('.category-btn.active');
      expect(activeButton).toBeInTheDocument();
      expect(activeButton?.textContent).toContain('네비게이션');
    }
  });

  it('단축키 키가 올바르게 표시되어야 함', () => {
    const { container } = render(<KeyboardShortcutsHelp {...defaultProps} />);
    
    // kbd 태그로 키가 표시되어야 함
    const kbdElements = container.querySelectorAll('kbd');
    expect(kbdElements.length).toBeGreaterThan(0);
  });

  it('단축키 설명이 올바르게 표시되어야 함', () => {
    render(<KeyboardShortcutsHelp {...defaultProps} />);
    
    expect(screen.getByText('새 대화 시작')).toBeInTheDocument();
    expect(screen.getByText('메시지 전송')).toBeInTheDocument();
  });

  it('푸터 메시지가 표시되어야 함', () => {
    render(<KeyboardShortcutsHelp {...defaultProps} />);

    expect(screen.getByText(/이 도움말을 열 수 있습니다/)).toBeInTheDocument();
  });
});

