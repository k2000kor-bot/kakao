/**
 * CommunityView 테스트 — 커뮤니티 화면 렌더·목데이터 연동
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CommunityView from './CommunityView';
import * as communityViewService from '../services/communityViewService';
import type { CommunitySummary } from '../services/communityViewService';

jest.mock('../services/communityViewService', () => ({
  ...jest.requireActual<typeof import('../services/communityViewService')>('../services/communityViewService'),
  fetchCommunitySummary: jest.fn(),
}));

const mockFetch: jest.MockedFunction<typeof communityViewService.fetchCommunitySummary> = jest.mocked(
  communityViewService.fetchCommunitySummary,
);

describe('CommunityView', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({
      topicCount: 0,
      recentPostLabel: '—',
    } as unknown as CommunitySummary);
  });

  it('커뮤니티 뷰가 렌더되고 제목이 표시된다', async () => {
    render(<MemoryRouter><CommunityView /></MemoryRouter>);
    expect(screen.getByTestId('community-view')).toBeInTheDocument();
    expect(screen.getByText(/포럼과 지식 공유 공간입니다/)).toBeInTheDocument();
    await screen.findByText(/주제 수/); // fetch 완료 대기 → act 경고 방지
  });

  it('포럼 섹션 제목이 표시된다', async () => {
    render(<MemoryRouter><CommunityView /></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 2, name: '포럼' })).toBeInTheDocument();
    await screen.findByText(/주제 수/); // fetch 완료 대기 → act 경고 방지
  });

  it('포럼 섹션에 커뮤니티 예시 플레이스홀더가 표시된다', async () => {
    render(<MemoryRouter><CommunityView /></MemoryRouter>);
    expect(await screen.findByText(/주제 수/)).toBeInTheDocument();
    expect(screen.getByText(/최근 글/)).toBeInTheDocument();
  });

  it('목데이터 연동 시 주제 수·최근 글이 표시된다', async () => {
    render(<MemoryRouter><CommunityView /></MemoryRouter>);
    expect(await screen.findByText(/주제 수: 0/)).toBeInTheDocument();
    expect(screen.getByText(/최근 글: —/)).toBeInTheDocument();
  });
});
