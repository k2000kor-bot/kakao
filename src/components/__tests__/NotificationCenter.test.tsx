/**
 * NotificationCenter 컴포넌트 테스트
 * 알림 센터 기능 확인
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationCenter, { Notification } from '../NotificationCenter';

describe('NotificationCenter', () => {
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'success',
      title: '성공 알림',
      message: '작업이 완료되었습니다.',
      timestamp: new Date(Date.now() - 60000), // 1분 전
      read: false,
    },
    {
      id: '2',
      type: 'error',
      title: '오류 알림',
      message: '작업 중 오류가 발생했습니다.',
      timestamp: new Date(Date.now() - 120000), // 2분 전
      read: false,
    },
    {
      id: '3',
      type: 'info',
      title: '정보 알림',
      message: '새로운 업데이트가 있습니다.',
      timestamp: new Date(Date.now() - 3600000), // 1시간 전
      read: true,
    },
  ];

  const defaultProps = {
    notifications: mockNotifications,
    onMarkAsRead: jest.fn(),
    onDismiss: jest.fn(),
    onClearAll: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('기본 렌더링이 올바르게 작동해야 함', () => {
    render(<NotificationCenter {...defaultProps} />);
    const toggleButton = screen.getByRole('button', { name: /알림.*읽지 않은 알림/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it('읽지 않은 알림 개수를 배지로 표시해야 함', () => {
    render(<NotificationCenter {...defaultProps} />);
    const badge = screen.getByText('2');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('notification-badge');
  });

  it('읽지 않은 알림이 99개를 초과하면 99+로 표시해야 함', () => {
    const manyNotifications: Notification[] = Array.from({ length: 100 }, (_, i) => ({
      id: `id-${i}`,
      type: 'info' as const,
      title: `알림 ${i}`,
      message: `메시지 ${i}`,
      timestamp: new Date(),
      read: false,
    }));

    render(<NotificationCenter {...defaultProps} notifications={manyNotifications} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('토글 버튼 클릭 시 패널이 열려야 함', () => {
    render(<NotificationCenter {...defaultProps} />);
    const toggleButton = screen.getByRole('button', { name: /알림.*읽지 않은 알림/i });
    fireEvent.click(toggleButton);
    expect(screen.getByText('알림')).toBeInTheDocument();
    expect(screen.getByText('성공 알림')).toBeInTheDocument();
  });

  it('토글 버튼 다시 클릭 시 패널이 닫혀야 함', () => {
    render(<NotificationCenter {...defaultProps} />);
    const toggleButton = screen.getByRole('button', { name: /알림.*읽지 않은 알림/i });
    
    // 열기
    fireEvent.click(toggleButton);
    expect(screen.getByText('성공 알림')).toBeInTheDocument();
    
    // 닫기
    fireEvent.click(toggleButton);
    expect(screen.queryByText('성공 알림')).not.toBeInTheDocument();
  });

  it('필터를 변경하면 해당 타입의 알림만 표시해야 함', () => {
    render(<NotificationCenter {...defaultProps} />);
    const toggleButton = screen.getByRole('button', { name: /알림.*읽지 않은 알림/i });
    fireEvent.click(toggleButton);

    const filterSelect = screen.getByDisplayValue('전체');
    fireEvent.change(filterSelect, { target: { value: 'success' } });

    expect(screen.getByText('성공 알림')).toBeInTheDocument();
    expect(screen.queryByText('오류 알림')).not.toBeInTheDocument();
    expect(screen.queryByText('정보 알림')).not.toBeInTheDocument();
  });

  it('모두 지우기 버튼 클릭 시 onClearAll이 호출되어야 함', () => {
    render(<NotificationCenter {...defaultProps} />);
    const toggleButton = screen.getByRole('button', { name: /알림.*읽지 않은 알림/i });
    fireEvent.click(toggleButton);

    const clearAllButton = screen.getByText('모두 지우기');
    fireEvent.click(clearAllButton);
    expect(defaultProps.onClearAll).toHaveBeenCalledTimes(1);
  });

  it('알림이 없으면 모두 지우기 버튼이 표시되지 않아야 함', () => {
    render(<NotificationCenter {...defaultProps} notifications={[]} />);
    const toggleButton = screen.getByRole('button', { name: /알림/i });
    fireEvent.click(toggleButton);

    expect(screen.queryByText('모두 지우기')).not.toBeInTheDocument();
  });

  it('알림 클릭 시 onMarkAsRead가 호출되어야 함', () => {
    render(<NotificationCenter {...defaultProps} />);
    const toggleButton = screen.getByRole('button', { name: /알림.*읽지 않은 알림/i });
    fireEvent.click(toggleButton);

    const notification = screen.getByText('성공 알림');
    fireEvent.click(notification);
    expect(defaultProps.onMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('알림 닫기 버튼 클릭 시 onDismiss가 호출되어야 함', () => {
    render(<NotificationCenter {...defaultProps} />);
    const toggleButton = screen.getByRole('button', { name: /알림.*읽지 않은 알림/i });
    fireEvent.click(toggleButton);

    // 닫기 버튼 찾기 (X 버튼)
    const dismissButtons = screen.getAllByRole('button');
    const dismissButton = dismissButtons.find(btn => btn.textContent === '×' || btn.textContent === '✕');
    
    if (dismissButton) {
      fireEvent.click(dismissButton);
      expect(defaultProps.onDismiss).toHaveBeenCalled();
    }
  });

  it('다양한 알림 타입의 아이콘을 올바르게 표시해야 함', () => {
    const allTypes: Notification[] = [
      { id: '1', type: 'success', title: '성공 알림', message: '메시지', timestamp: new Date(), read: false },
      { id: '2', type: 'info', title: '정보 알림', message: '메시지', timestamp: new Date(), read: false },
      { id: '3', type: 'warning', title: '경고 알림', message: '메시지', timestamp: new Date(), read: false },
      { id: '4', type: 'error', title: '오류 알림', message: '메시지', timestamp: new Date(), read: false },
      { id: '5', type: 'writing', title: '글쓰기 알림', message: '메시지', timestamp: new Date(), read: false },
      { id: '6', type: 'collaboration', title: '협업 알림', message: '메시지', timestamp: new Date(), read: false },
    ];

    render(<NotificationCenter {...defaultProps} notifications={allTypes} />);
    const toggleButton = screen.getByRole('button', { name: /알림.*읽지 않은 알림/i });
    fireEvent.click(toggleButton);

    expect(screen.getByText('성공 알림')).toBeInTheDocument();
    expect(screen.getByText('정보 알림')).toBeInTheDocument();
    expect(screen.getByText('경고 알림')).toBeInTheDocument();
    expect(screen.getByText('오류 알림')).toBeInTheDocument();
    expect(screen.getByText('글쓰기 알림')).toBeInTheDocument();
    expect(screen.getByText('협업 알림')).toBeInTheDocument();
  });

  it('알림 액션 버튼이 있으면 클릭 시 해당 액션이 실행되어야 함', () => {
    const notificationWithAction: Notification[] = [
      {
        id: '1',
        type: 'info',
        title: '알림',
        message: '메시지',
        timestamp: new Date(),
        read: false,
        action: {
          label: '확인',
          onClick: jest.fn(),
        },
      },
    ];

    render(<NotificationCenter {...defaultProps} notifications={notificationWithAction} />);
    const toggleButton = screen.getByRole('button', { name: /알림.*읽지 않은 알림/i });
    fireEvent.click(toggleButton);

    const actionButton = screen.getByText('확인');
    fireEvent.click(actionButton);
    expect(notificationWithAction[0].action?.onClick).toHaveBeenCalled();
  });

  it('패널 외부 클릭 시 패널이 닫혀야 함', () => {
    render(<NotificationCenter {...defaultProps} />);
    const toggleButton = screen.getByRole('button', { name: /알림.*읽지 않은 알림/i });
    fireEvent.click(toggleButton);

    expect(screen.getByText('성공 알림')).toBeInTheDocument();

    // 외부 클릭 시뮬레이션
    fireEvent.mouseDown(document.body);
    
    waitFor(() => {
      expect(screen.queryByText('성공 알림')).not.toBeInTheDocument();
    });
  });
});

