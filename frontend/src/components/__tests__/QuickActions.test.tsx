/**
 * QuickActions 컴포넌트 테스트
 * 빠른 테스트 액션 기능 확인
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { setupCommonMocks } from '../../test-utils/testHelpers';
import QuickActions from '../QuickActions';

describe('QuickActions', () => {
  const mockOnActionClick = jest.fn();

  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
  });

  it('기본 렌더링이 올바르게 작동해야 함', () => {
    render(<QuickActions onActionClick={mockOnActionClick} />);
    expect(screen.getByText('빠른 테스트 액션')).toBeInTheDocument();
    expect(screen.getByText('다양한 AI 분석 기능을 빠르게 테스트해보세요')).toBeInTheDocument();
  });

  it('모든 액션 카드가 렌더링되어야 함', () => {
    render(<QuickActions onActionClick={mockOnActionClick} />);
    expect(screen.getByText('감정 분석 테스트')).toBeInTheDocument();
    expect(screen.getByText('의도 분석 테스트')).toBeInTheDocument();
    expect(screen.getByText('성능 테스트')).toBeInTheDocument();
    expect(screen.getByText('피드백 테스트')).toBeInTheDocument();
  });

  it('액션 버튼 클릭 시 onActionClick이 호출되어야 함', () => {
    render(<QuickActions onActionClick={mockOnActionClick} />);
    const exampleButton = screen.getByText('정말 좋은 하루예요!');
    fireEvent.click(exampleButton);
    expect(mockOnActionClick).toHaveBeenCalledWith('정말 좋은 하루예요!');
  });

  it('액션 버튼 클릭 시 선택된 액션이 표시되어야 함', () => {
    render(<QuickActions onActionClick={mockOnActionClick} />);
    const exampleButton = screen.getByText('정말 좋은 하루예요!');
    fireEvent.click(exampleButton);
    expect(screen.getByText(/선택된 액션: 감정 분석 테스트/i)).toBeInTheDocument();
  });

  it('여러 액션 버튼을 클릭해도 마지막 선택이 표시되어야 함', () => {
    render(<QuickActions onActionClick={mockOnActionClick} />);
    const button1 = screen.getByText('정말 좋은 하루예요!');
    const button2 = screen.getByText('이 기능은 어떻게 사용하나요?');
    
    fireEvent.click(button1);
    expect(screen.getByText(/선택된 액션: 감정 분석 테스트/i)).toBeInTheDocument();
    
    fireEvent.click(button2);
    expect(screen.getByText(/선택된 액션: 의도 분석 테스트/i)).toBeInTheDocument();
  });

  it('모든 예제 버튼이 렌더링되어야 함', () => {
    render(<QuickActions onActionClick={mockOnActionClick} />);
    
    // 감정 분석 테스트 예제
    expect(screen.getByText('정말 좋은 하루예요!')).toBeInTheDocument();
    expect(screen.getByText('너무 화가 나네요...')).toBeInTheDocument();
    expect(screen.getByText('그냥 평범한 하루입니다.')).toBeInTheDocument();
    
    // 의도 분석 테스트 예제
    expect(screen.getByText('이 기능은 어떻게 사용하나요?')).toBeInTheDocument();
    expect(screen.getByText('도와주세요!')).toBeInTheDocument();
    expect(screen.getByText('감사합니다!')).toBeInTheDocument();
  });

  it('액션 설명이 표시되어야 함', () => {
    render(<QuickActions onActionClick={mockOnActionClick} />);
    expect(screen.getByText('다양한 감정 표현을 테스트해보세요')).toBeInTheDocument();
    expect(screen.getByText('다양한 의도를 가진 메시지를 테스트해보세요')).toBeInTheDocument();
    expect(screen.getByText('시스템 성능을 확인해보세요')).toBeInTheDocument();
    expect(screen.getByText('긍정적/부정적 피드백을 테스트해보세요')).toBeInTheDocument();
  });
});

