/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RoutePathBreadcrumb } from './RoutePathBreadcrumb';

describe('RoutePathBreadcrumb', () => {
  it('경로를 한 줄 nav로 렌더한다', () => {
    render(
      <MemoryRouter>
        <RoutePathBreadcrumb
          items={[
            { label: '홈', to: '/' },
            { label: '대화' },
          ]}
        />
      </MemoryRouter>
    );
    const nav = screen.getByRole('navigation', { name: '현재 위치' });
    expect(nav).toHaveClass('brainwave-chat-route-breadcrumb--single-line');
    expect(screen.getByRole('link', { name: '홈' })).toHaveAttribute('href', '/');
    expect(screen.getByText('대화')).toHaveClass('brainwave-chat-route-breadcrumb__leaf');
  });
});
