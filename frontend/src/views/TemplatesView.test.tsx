/**
 * TemplatesView 테스트 — 템플릿 화면 렌더·목데이터 연동
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TemplatesView from './TemplatesView';
import * as templatesViewService from '../services/templatesViewService';
import type { TemplatesSummary } from '../services/templatesViewService';

jest.mock('../services/templatesViewService', () => ({
  ...jest.requireActual<typeof import('../services/templatesViewService')>('../services/templatesViewService'),
  fetchTemplatesSummary: jest.fn(),
}));

const mockFetchTemplatesSummary: jest.MockedFunction<typeof templatesViewService.fetchTemplatesSummary> = jest.mocked(
  templatesViewService.fetchTemplatesSummary,
);

describe('TemplatesView', () => {
  beforeEach(() => {
    mockFetchTemplatesSummary.mockResolvedValue({
      categories: ['도시정비·재개발', '일반 업무', '회의·문서'],
      favoritesCount: 0,
    } as unknown as TemplatesSummary);
  });

  it('템플릿 뷰가 렌더되고 제목이 표시된다', async () => {
    render(
      <MemoryRouter>
        <TemplatesView />
      </MemoryRouter>
    );
    expect(screen.getByTestId('templates-view')).toBeInTheDocument();
    expect(screen.getByText(/프롬프트·템플릿 라이브러리를 관리하고 재사용할 수 있습니다/)).toBeInTheDocument();
    await screen.findByText(/카테고리: /); // fetch 완료 대기 → act 경고 방지
  });

  it('프롬프트 라이브러리 섹션 제목이 표시된다', async () => {
    render(
      <MemoryRouter>
        <TemplatesView />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 2, name: '프롬프트 라이브러리' })).toBeInTheDocument();
    await screen.findByText(/카테고리: /); // fetch 완료 대기 → act 경고 방지
  });

  it('프롬프트 라이브러리 섹션에 템플릿 예시 플레이스홀더가 표시된다', async () => {
    render(
      <MemoryRouter>
        <TemplatesView />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/카테고리:/)).toBeInTheDocument();
    });
    expect(screen.getByText(/즐겨찾기:/)).toBeInTheDocument();
  });

  it('목데이터 연동 시 카테고리·즐겨찾기 개수가 표시된다', async () => {
    render(
      <MemoryRouter>
        <TemplatesView />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/카테고리: 도시정비·재개발 · 일반 업무 · 회의·문서/)).toBeInTheDocument();
    });
    expect(screen.getByText(/즐겨찾기: 0개/)).toBeInTheDocument();
  });

  it('즐겨찾기 개수가 있으면 표시된다', async () => {
    mockFetchTemplatesSummary.mockResolvedValue({
      categories: ['일반'],
      favoritesCount: 3,
    } as unknown as TemplatesSummary);
    render(
      <MemoryRouter>
        <TemplatesView />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/즐겨찾기: 3개/)).toBeInTheDocument();
    });
  });
});
