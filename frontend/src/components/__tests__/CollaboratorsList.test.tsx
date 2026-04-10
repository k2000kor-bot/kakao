/**
 * CollaboratorsList 컴포넌트 테스트
 * 협업자 목록 표시 기능 확인
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { setupCommonMocks } from '../../test-utils/testHelpers';
import CollaboratorsList from '../Collaboration/CollaboratorsList';
import collaborationSlice from '../../store/slices/collaborationSlice';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => <div {...props}>{children}</div>,
  },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  User: ({ size, className }: { size?: number; className?: string }) => (
    <svg data-testid="user-icon" data-size={size} className={className} />
  ),
  Circle: ({ size, className, fill }: { size?: number; className?: string; fill?: string }) => (
    <svg data-testid="circle-icon" data-size={size} className={className} data-fill={fill} />
  ),
}));

const createMockStore = (collaborators: Array<{
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: string;
  currentSessionId?: string;
}> = []) => {
  return configureStore({
    reducer: {
      collaboration: collaborationSlice,
    },
    preloadedState: {
      collaboration: {
        collaborators,
        isSharing: false,
        sharedSessionId: null,
        typingUsers: {},
      },
    },
  });
};

describe('CollaboratorsList', () => {
  beforeEach(() => {
    setupCommonMocks();
  });

  describe('기본 렌더링', () => {
    it('협업자가 없을 때 빈 상태 메시지를 표시해야 함', () => {
      const store = createMockStore([]);

      render(
        <Provider store={store}>
          <CollaboratorsList />
        </Provider>
      );

      expect(screen.getByText(/현재 협업자가 없습니다/)).toBeInTheDocument();
      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });

    it('협업자가 있을 때 협업자 목록을 표시해야 함', () => {
      const collaborators = [
        {
          id: '1',
          name: '사용자 1',
          isOnline: true,
          lastSeen: new Date().toISOString(),
        },
      ];

      const store = createMockStore(collaborators);

      render(
        <Provider store={store}>
          <CollaboratorsList />
        </Provider>
      );

      expect(screen.getByText(/협업자 \(1\)/)).toBeInTheDocument();
      expect(screen.getByText('사용자 1')).toBeInTheDocument();
    });
  });

  describe('협업자 목록 표시', () => {
    it('여러 협업자를 표시해야 함', () => {
      const collaborators = [
        {
          id: '1',
          name: '사용자 1',
          isOnline: true,
          lastSeen: new Date().toISOString(),
        },
        {
          id: '2',
          name: '사용자 2',
          isOnline: false,
          lastSeen: new Date(Date.now() - 3600000).toISOString(),
        },
      ];

      const store = createMockStore(collaborators);

      render(
        <Provider store={store}>
          <CollaboratorsList />
        </Provider>
      );

      expect(screen.getByText(/협업자 \(2\)/)).toBeInTheDocument();
      expect(screen.getByText('사용자 1')).toBeInTheDocument();
      expect(screen.getByText('사용자 2')).toBeInTheDocument();
    });
  });

  describe('온라인 상태 표시', () => {
    it('온라인 협업자는 "온라인" 상태를 표시해야 함', () => {
      const collaborators = [
        {
          id: '1',
          name: '온라인 사용자',
          isOnline: true,
          lastSeen: new Date().toISOString(),
        },
      ];

      const store = createMockStore(collaborators);

      render(
        <Provider store={store}>
          <CollaboratorsList />
        </Provider>
      );

      expect(screen.getByText('온라인')).toBeInTheDocument();
    });

    it('오프라인 협업자는 마지막 접속 시간을 표시해야 함', () => {
      const lastSeen = new Date(Date.now() - 3600000);
      const collaborators = [
        {
          id: '1',
          name: '오프라인 사용자',
          isOnline: false,
          lastSeen: lastSeen.toISOString(),
        },
      ];

      const store = createMockStore(collaborators);

      render(
        <Provider store={store}>
          <CollaboratorsList />
        </Provider>
      );

      expect(screen.getByText(/마지막 접속:/)).toBeInTheDocument();
    });
  });
});
