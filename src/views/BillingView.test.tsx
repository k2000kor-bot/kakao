/**
 * BillingView 테스트 — 구독 화면 렌더·목데이터 연동
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BillingView from './BillingView';
import * as billingViewService from '../services/billingViewService';
import type { BillingSummary } from '../services/billingViewService';

jest.mock('../services/billingViewService', () => ({
  ...jest.requireActual<typeof import('../services/billingViewService')>('../services/billingViewService'),
  fetchBillingSummary: jest.fn(),
}));

const mockFetchBillingSummary: jest.MockedFunction<typeof billingViewService.fetchBillingSummary> = jest.mocked(
  billingViewService.fetchBillingSummary,
);

describe('BillingView', () => {
  beforeEach(() => {
    mockFetchBillingSummary.mockResolvedValue({
      currentPlan: '무료',
      nextBillingDate: null,
    } as unknown as BillingSummary);
  });

  it('구독 뷰가 렌더되고 제목이 표시된다', async () => {
    render(
      <MemoryRouter>
        <BillingView />
      </MemoryRouter>
    );
    expect(screen.getByTestId('billing-view')).toBeInTheDocument();
    expect(screen.getByText(/플랜·결제·사용량을 확인하고 관리할 수 있습니다/)).toBeInTheDocument();
    await screen.findByText(/현재 플랜/); // fetch 완료 대기 → act 경고 방지
  });

  it('플랜 섹션 제목이 표시된다', async () => {
    render(
      <MemoryRouter>
        <BillingView />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 2, name: '플랜' })).toBeInTheDocument();
    await screen.findByText(/현재 플랜/); // fetch 완료 대기 → act 경고 방지
  });

  it('플랜 섹션에 구독 예시 플레이스홀더가 표시된다', async () => {
    render(
      <MemoryRouter>
        <BillingView />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/현재 플랜/)).toBeInTheDocument();
    });
    expect(screen.getByText(/다음 결제일/)).toBeInTheDocument();
  });

  it('목데이터 연동 시 현재 플랜·다음 결제일이 표시된다', async () => {
    render(
      <MemoryRouter>
        <BillingView />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/현재 플랜: 무료/)).toBeInTheDocument();
    });
    expect(screen.getByText(/다음 결제일: —/)).toBeInTheDocument();
  });

  it('다음 결제일이 있으면 해당 날짜가 표시된다', async () => {
    mockFetchBillingSummary.mockResolvedValue({
      currentPlan: 'PRO',
      nextBillingDate: '2025-03-01',
    } as unknown as BillingSummary);
    render(
      <MemoryRouter>
        <BillingView />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/현재 플랜: PRO/)).toBeInTheDocument();
    });
    expect(screen.getByText(/다음 결제일: 2025-03-01/)).toBeInTheDocument();
  });
});
