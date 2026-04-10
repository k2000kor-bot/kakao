/**
 * TeamView 테스트 — 팀 화면 렌더·목데이터 연동
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TeamView from './TeamView';
import * as teamViewService from '../services/teamViewService';
import type { TeamSummary } from '../services/teamViewService';

jest.mock('../services/teamViewService', () => ({
  ...jest.requireActual<typeof import('../services/teamViewService')>('../services/teamViewService'),
  fetchTeamSummary: jest.fn(),
}));

const mockFetch: jest.MockedFunction<typeof teamViewService.fetchTeamSummary> = jest.mocked(
  teamViewService.fetchTeamSummary,
);

describe('TeamView', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({
      memberCount: 1,
      role: '관리자',
    } as unknown as TeamSummary);
  });

  it('팀 뷰가 렌더되고 제목이 표시된다', async () => {
    render(<MemoryRouter><TeamView /></MemoryRouter>);
    expect(screen.getByTestId('team-view')).toBeInTheDocument();
    expect(screen.getByText(/팀 멤버와 권한을 관리할 수 있습니다/)).toBeInTheDocument();
    await screen.findByText(/멤버 수/); // fetch 완료 대기 → act 경고 방지
  });

  it('멤버 섹션 제목이 표시된다', async () => {
    render(<MemoryRouter><TeamView /></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 2, name: '멤버' })).toBeInTheDocument();
    await screen.findByText(/멤버 수/); // fetch 완료 대기 → act 경고 방지
  });

  it('멤버 섹션에 팀 예시 플레이스홀더가 표시된다', async () => {
    render(<MemoryRouter><TeamView /></MemoryRouter>);
    expect(await screen.findByText(/멤버 수/)).toBeInTheDocument();
    expect(screen.getByText(/역할:/)).toBeInTheDocument();
  });

  it('목데이터 연동 시 멤버 수·역할이 표시된다', async () => {
    render(<MemoryRouter><TeamView /></MemoryRouter>);
    expect(await screen.findByText(/멤버 수: 1/)).toBeInTheDocument();
    expect(screen.getByText(/역할: 관리자/)).toBeInTheDocument();
  });
});
