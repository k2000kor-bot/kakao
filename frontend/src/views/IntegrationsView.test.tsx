/**
 * IntegrationsView 테스트 — 연동 화면 렌더·API 연동
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import IntegrationsView from './IntegrationsView';
import * as integrationsViewService from '../services/integrationsViewService';

jest.mock('../services/integrationsViewService', () => ({
  ...jest.requireActual<typeof import('../services/integrationsViewService')>('../services/integrationsViewService'),
  fetchIntegrationsHealth: jest.fn(),
}));

const mockFetchIntegrationsHealth: jest.MockedFunction<typeof integrationsViewService.fetchIntegrationsHealth> =
  jest.mocked(integrationsViewService.fetchIntegrationsHealth);

describe('IntegrationsView', () => {
  beforeEach(() => {
    mockFetchIntegrationsHealth.mockResolvedValue(null);
  });

  it('연동 뷰가 렌더되고 제목이 표시된다', async () => {
    render(
      <MemoryRouter>
        <IntegrationsView />
      </MemoryRouter>
    );
    expect(screen.getByTestId('integrations-view')).toBeInTheDocument();
    expect(screen.getByText(/외부 API·웹훅·OAuth 등 연동 설정을 관리할 수 있습니다/)).toBeInTheDocument();
    await screen.findByText(/연동 상태/); // fetch 완료 대기 → act 경고 방지
  });

  it('웹훅 섹션 제목이 표시된다', async () => {
    render(
      <MemoryRouter>
        <IntegrationsView />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 2, name: '웹훅' })).toBeInTheDocument();
    await screen.findByText(/연동 상태/); // fetch 완료 대기 → act 경고 방지
  });

  it('웹훅 섹션에 연동 예시 플레이스홀더가 표시된다', async () => {
    render(
      <MemoryRouter>
        <IntegrationsView />
      </MemoryRouter>
    );
    expect(await screen.findByRole('textbox', { name: '웹훅 URL' })).toBeInTheDocument();
    expect(screen.getByText(/웹훅 URL: —/)).toBeInTheDocument();
    expect(screen.getByText(/연동 상태/)).toBeInTheDocument();
  });

  it('API 연동 성공 시 연동 상태가 정상으로 표시된다', async () => {
    mockFetchIntegrationsHealth.mockResolvedValue({ status: 'healthy', service: 'CORBU.AI 통합 API' });
    render(
      <MemoryRouter>
        <IntegrationsView />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/연동 상태: 정상/)).toBeInTheDocument();
    });
  });

  it('API 실패 시 플레이스홀더와 안내 문구가 표시된다', async () => {
    mockFetchIntegrationsHealth.mockResolvedValue(null);
    render(
      <MemoryRouter>
        <IntegrationsView />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/연동 상태: —/)).toBeInTheDocument();
    });
    expect(screen.getByText(/백엔드 미연결 시 게이트웨이 상태/)).toBeInTheDocument();
  });
});
