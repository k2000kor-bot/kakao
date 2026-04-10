/**
 * LearnView 테스트 — 학습 화면 렌더·목데이터 연동
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LearnView from './LearnView';
import * as learnViewService from '../services/learnViewService';
import type { LearnSummary } from '../services/learnViewService';

jest.mock('../services/learnViewService', () => ({
  ...jest.requireActual<typeof import('../services/learnViewService')>('../services/learnViewService'),
  fetchLearnSummary: jest.fn(),
}));

const mockFetch: jest.MockedFunction<typeof learnViewService.fetchLearnSummary> = jest.mocked(
  learnViewService.fetchLearnSummary,
);

describe('LearnView', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({
      progressPercent: 0,
      completedCourses: 0,
    } as unknown as LearnSummary);
  });

  it('학습 뷰가 렌더되고 제목이 표시된다', async () => {
    render(<MemoryRouter><LearnView /></MemoryRouter>);
    expect(screen.getByTestId('learn-view')).toBeInTheDocument();
    expect(screen.getByText(/학습 경로·코스·튜토리얼을 확인할 수 있습니다/)).toBeInTheDocument();
    await screen.findByText(/진행률: 0%/); // fetch 완료 대기 → act 경고 방지
  });

  it('학습 경로 섹션 제목이 표시된다', async () => {
    render(<MemoryRouter><LearnView /></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 2, name: '학습 경로' })).toBeInTheDocument();
    await screen.findByText(/진행률: 0%/); // fetch 완료 대기 → act 경고 방지
  });

  it('학습 경로 섹션에 학습 예시 플레이스홀더가 표시된다', async () => {
    render(<MemoryRouter><LearnView /></MemoryRouter>);
    expect(await screen.findByText(/진행률: 0%/)).toBeInTheDocument();
    expect(screen.getByText(/완료 코스/)).toBeInTheDocument();
  });

  it('목데이터 연동 시 진행률·완료 코스가 표시된다', async () => {
    render(<MemoryRouter><LearnView /></MemoryRouter>);
    expect(await screen.findByText(/진행률: 0%/)).toBeInTheDocument();
    expect(screen.getByText(/완료 코스: 0개/)).toBeInTheDocument();
  });
});
