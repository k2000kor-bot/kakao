/**
 * DocsView 테스트 — 도움말 화면 렌더·문서 링크
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DocsView from './DocsView';

describe('DocsView', () => {
  it('도움말 뷰가 렌더되고 제목이 표시된다', () => {
    render(
      <MemoryRouter>
        <DocsView />
      </MemoryRouter>
    );
    expect(screen.getByTestId('docs-view')).toBeInTheDocument();
    expect(screen.getByText(/사용 방법과 개발 문서를 확인할 수 있습니다/)).toBeInTheDocument();
  });

  it('단축키 섹션이 있다', () => {
    render(
      <MemoryRouter>
        <DocsView />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 2, name: '단축키' })).toBeInTheDocument();
  });

  it('가이드·문서·문제 해결 섹션이 있다', () => {
    render(
      <MemoryRouter>
        <DocsView />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 2, name: '가이드·문서' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '문제 해결' })).toBeInTheDocument();
  });
});
