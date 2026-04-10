/**
 * WorkspaceView 테스트 — 워크스페이스 화면 렌더·목데이터 연동
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WorkspaceView from './WorkspaceView';
import * as workspaceViewService from '../services/workspaceViewService';
import type { WorkspaceSummary } from '../services/workspaceViewService';

jest.mock('../services/workspaceViewService', () => ({
  ...jest.requireActual<typeof import('../services/workspaceViewService')>('../services/workspaceViewService'),
  fetchWorkspaceSummary: jest.fn(),
}));

const mockFetch: jest.MockedFunction<typeof workspaceViewService.fetchWorkspaceSummary> = jest.mocked(
  workspaceViewService.fetchWorkspaceSummary,
);

describe('WorkspaceView', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({
      workspaceCount: 1,
      currentName: '기본',
    } as unknown as WorkspaceSummary);
  });

  it('워크스페이스 뷰가 렌더되고 제목이 표시된다', async () => {
    render(<MemoryRouter><WorkspaceView /></MemoryRouter>);
    expect(screen.getByTestId('workspace-view')).toBeInTheDocument();
    expect(screen.getByText(/워크스페이스와 조직을 관리할 수 있습니다/)).toBeInTheDocument();
    await screen.findByText(/워크스페이스 수/); // fetch 완료 대기 → act 경고 방지
  });

  it('워크스페이스 목록 섹션 제목이 표시된다', async () => {
    render(<MemoryRouter><WorkspaceView /></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 2, name: '워크스페이스 목록' })).toBeInTheDocument();
    await screen.findByText(/워크스페이스 수/); // fetch 완료 대기 → act 경고 방지
  });

  it('워크스페이스 목록 섹션에 예시 플레이스홀더가 표시된다', async () => {
    render(<MemoryRouter><WorkspaceView /></MemoryRouter>);
    expect(await screen.findByText(/워크스페이스 수/)).toBeInTheDocument();
    expect(screen.getByText(/현재:/)).toBeInTheDocument();
  });

  it('목데이터 연동 시 워크스페이스 수·현재가 표시된다', async () => {
    render(<MemoryRouter><WorkspaceView /></MemoryRouter>);
    expect(await screen.findByText(/워크스페이스 수: 1/)).toBeInTheDocument();
    expect(screen.getByText(/현재: 기본/)).toBeInTheDocument();
  });
});
