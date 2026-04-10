/**
 * 전체 기능 맵 뷰 테스트 — 기본(에이전트 중심) / 프로젝트 UI 켬 분기
 */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FeaturesMapView from './FeaturesMapView';
import { AGENTS_PATH } from '../config/routes';
import { STANDALONE_CHAT_PATH } from '../config/uiPreferences';

describe('FeaturesMapView (기본: 프로젝트 UI 끔)', () => {
  it('전체 기능 제목과 홈·에이전트 안내를 렌더한다', () => {
    render(
      <MemoryRouter>
        <FeaturesMapView />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('전체 기능');
    expect(
      screen.getByText(new RegExp(`첫 화면은 에이전트 허브\\(${AGENTS_PATH.replace('/', '\\/')}\\)이며`, 'i'))
    ).toBeInTheDocument();
  });

  it('빠른 이동 카드(일반 대화, 에이전트)를 렌더한다', () => {
    render(
      <MemoryRouter>
        <FeaturesMapView />
      </MemoryRouter>
    );
    const nav = screen.getByRole('navigation', { name: /주요 화면 빠른 이동/ });
    expect(nav).toBeInTheDocument();
    const links = within(nav).getAllByRole('link');
    expect(links.length).toBe(2);
    expect(links[0]).toHaveAttribute('href', STANDALONE_CHAT_PATH);
    expect(links[0]).toHaveTextContent('일반 대화');
    expect(links[1]).toHaveAttribute('href', AGENTS_PATH);
    expect(links[1]).toHaveTextContent('에이전트');
  });

  it('카테고리 섹션(일반 대화, 에이전트)을 렌더한다', () => {
    render(
      <MemoryRouter>
        <FeaturesMapView />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 2, name: `일반 대화 (${STANDALONE_CHAT_PATH})` })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: `에이전트 (${AGENTS_PATH})` })
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: '프로젝트 (/projects)' })).not.toBeInTheDocument();
  });

  it('data-testid features-map-view를 가진 컨테이너를 렌더한다', () => {
    render(
      <MemoryRouter>
        <FeaturesMapView />
      </MemoryRouter>
    );
    expect(screen.getByTestId('features-map-view')).toBeInTheDocument();
  });
});

describe('FeaturesMapView (REACT_APP_UI_PROJECTS_ENABLED=true)', () => {
  const prev = process.env.REACT_APP_UI_PROJECTS_ENABLED;

  beforeAll(() => {
    process.env.REACT_APP_UI_PROJECTS_ENABLED = 'true';
  });

  afterAll(() => {
    process.env.REACT_APP_UI_PROJECTS_ENABLED = prev;
  });

  it('세 영역 안내와 프로젝트 빠른 이동·섹션을 렌더한다', () => {
    render(
      <MemoryRouter>
        <FeaturesMapView />
      </MemoryRouter>
    );
    expect(screen.getByText(/일반 대화·프로젝트·프로젝트 · 대화 세 영역/)).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: /주요 화면 빠른 이동/ });
    const links = within(nav).getAllByRole('link');
    expect(links[1]).toHaveAttribute('href', '/projects');
    expect(links[1]).toHaveTextContent('프로젝트');
    expect(screen.getByRole('heading', { level: 2, name: '프로젝트 (/projects)' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: '프로젝트 · 대화 (/projects/:id)' })
    ).toBeInTheDocument();
  });
});
