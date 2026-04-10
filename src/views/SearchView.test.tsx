/**
 * SearchView 테스트 — 검색 화면 렌더·목데이터 연동
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SearchView from './SearchView';
import * as searchViewService from '../services/searchViewService';
import type { SearchSummary } from '../services/searchViewService';

jest.mock('../services/searchViewService', () => ({
  ...jest.requireActual<typeof import('../services/searchViewService')>('../services/searchViewService'),
  fetchSearchSummary: jest.fn(),
}));

const mockFetchSearchSummary: jest.MockedFunction<typeof searchViewService.fetchSearchSummary> = jest.mocked(
  searchViewService.fetchSearchSummary,
);

describe('SearchView', () => {
  beforeEach(() => {
    mockFetchSearchSummary.mockResolvedValue({
      searchTarget: '대화·프로젝트·문서',
      recentQueries: [] as string[],
    } as unknown as SearchSummary);
  });

  it('검색 뷰가 렌더되고 제목이 표시된다', async () => {
    render(
      <MemoryRouter>
        <SearchView />
      </MemoryRouter>
    );
    expect(screen.getByTestId('search-view')).toBeInTheDocument();
    expect(screen.getByText(/대화·프로젝트·문서를 한곳에서 검색할 수 있습니다/)).toBeInTheDocument();
    await screen.findByText(/검색 대상/); // fetch 완료 대기 → act 경고 방지
  });

  it('전역 검색 섹션 제목이 표시된다', async () => {
    render(
      <MemoryRouter>
        <SearchView />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 2, name: '전역 검색' })).toBeInTheDocument();
    await screen.findByText(/검색 대상/); // fetch 완료 대기 → act 경고 방지
  });

  it('전역 검색 섹션에 검색 예시 플레이스홀더가 표시된다', async () => {
    render(
      <MemoryRouter>
        <SearchView />
      </MemoryRouter>
    );
    expect(await screen.findByText(/검색 대상: 대화·프로젝트·문서/)).toBeInTheDocument();
    expect(screen.getByText(/최근 검색어: —/)).toBeInTheDocument();
  });

  it('목데이터 연동 시 검색 대상·최근 검색어가 표시된다', async () => {
    render(
      <MemoryRouter>
        <SearchView />
      </MemoryRouter>
    );
    expect(await screen.findByText(/검색 대상: 대화·프로젝트·문서/)).toBeInTheDocument();
    expect(screen.getByText(/최근 검색어: —/)).toBeInTheDocument();
  });

  it('최근 검색어가 있으면 목록이 표시된다', async () => {
    mockFetchSearchSummary.mockResolvedValue({
      searchTarget: '대화·프로젝트·문서',
      recentQueries: ['프로젝트 A', '요약 요청'],
    } as unknown as SearchSummary);
    render(
      <MemoryRouter>
        <SearchView />
      </MemoryRouter>
    );
    expect(await screen.findByText(/최근 검색어: 프로젝트 A, 요약 요청/)).toBeInTheDocument();
  });
});
