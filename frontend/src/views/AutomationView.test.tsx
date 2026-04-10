/**
 * AutomationView 테스트 — 자동화 화면 렌더·API 연동
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AutomationView from './AutomationView';
import * as automationViewService from '../services/automationViewService';

jest.mock('../services/automationViewService');

const mockFetch: jest.MockedFunction<typeof automationViewService.fetchAutomationSummary> = jest.mocked(
  automationViewService.fetchAutomationSummary,
);

describe('AutomationView', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({ workflowCount: 0, lastRunAt: null });
  });

  it('자동화 뷰가 렌더되고 제목이 표시된다', async () => {
    render(<MemoryRouter><AutomationView /></MemoryRouter>);
    expect(screen.getByTestId('automation-view')).toBeInTheDocument();
    expect(screen.getByText(/워크플로우와 자동화를 설계·실행할 수 있습니다/)).toBeInTheDocument();
    await screen.findByText(/워크플로우 수/); // fetch 완료 대기 → act 경고 방지
  });

  it('워크플로우 빌더 섹션 제목이 표시된다', async () => {
    render(<MemoryRouter><AutomationView /></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 2, name: '워크플로우 빌더' })).toBeInTheDocument();
    await screen.findByText(/워크플로우 수/); // fetch 완료 대기 → act 경고 방지
  });

  it('워크플로우 빌더 섹션에 자동화 예시 플레이스홀더가 표시된다', async () => {
    render(<MemoryRouter><AutomationView /></MemoryRouter>);
    expect(await screen.findByText(/워크플로우 수/)).toBeInTheDocument();
    expect(screen.getByText(/마지막 실행/)).toBeInTheDocument();
  });

  it('API 연동 시 워크플로우 수·마지막 실행이 표시된다', async () => {
    render(<MemoryRouter><AutomationView /></MemoryRouter>);
    expect(await screen.findByText(/워크플로우 수: 0/)).toBeInTheDocument();
    expect(screen.getByText(/마지막 실행: —/)).toBeInTheDocument();
  });

  it('API 연동 성공 시 워크플로우 수·마지막 실행이 표시된다', async () => {
    mockFetch.mockResolvedValue({ workflowCount: 3, lastRunAt: '2025-02-25 10:00:00' });
    render(<MemoryRouter><AutomationView /></MemoryRouter>);
    expect(await screen.findByText(/워크플로우 수: 3/)).toBeInTheDocument();
    expect(screen.getByText(/마지막 실행: 2025-02-25 10:00:00/)).toBeInTheDocument();
  });
});
