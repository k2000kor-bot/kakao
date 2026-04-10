/**
 * AnalyticsView 테스트 — 분석 화면 렌더·API 연동
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AnalyticsView from './AnalyticsView';
import * as analyticsViewService from '../services/analyticsViewService';
import { projectService } from '../services/projectService';
import type { Project } from '../types/project';

jest.mock('../services/analyticsViewService');
jest.mock('../services/projectService');

const mockFetchAnalytics: jest.MockedFunction<typeof analyticsViewService.fetchAnalytics> = jest.mocked(
  analyticsViewService.fetchAnalytics,
);
const mockFetchProjectAnalytics: jest.MockedFunction<typeof analyticsViewService.fetchProjectAnalytics> =
  jest.mocked(analyticsViewService.fetchProjectAnalytics);
const mockGetProjects: jest.MockedFunction<typeof projectService.getProjects> = jest.mocked(projectService.getProjects);

describe('AnalyticsView', () => {
  beforeEach(() => {
    mockFetchAnalytics.mockResolvedValue(null);
    mockGetProjects.mockResolvedValue([]);
    mockFetchProjectAnalytics.mockResolvedValue(null);
  });

  it('분석 뷰가 렌더되고 제목이 표시된다', async () => {
    render(
      <MemoryRouter>
        <AnalyticsView />
      </MemoryRouter>
    );
    expect(screen.getByTestId('analytics-view')).toBeInTheDocument();
    expect(screen.getByText(/사용 통계와 대시보드를 확인할 수 있습니다/)).toBeInTheDocument();
    await screen.findByText(/요청 수: /); // fetch 완료 대기 → act 경고 방지
  });

  it('사용 통계 섹션 제목이 표시된다', async () => {
    render(
      <MemoryRouter>
        <AnalyticsView />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 2, name: '사용 통계' })).toBeInTheDocument();
    await screen.findByText(/요청 수: /); // fetch 완료 대기 → act 경고 방지
  });

  it('사용 통계에 예시 메트릭 플레이스홀더가 표시된다', async () => {
    render(
      <MemoryRouter>
        <AnalyticsView />
      </MemoryRouter>
    );
    expect(await screen.findByText(/요청 수: —/)).toBeInTheDocument();
    expect(screen.getByText(/토큰 사용: —/)).toBeInTheDocument();
    expect(screen.getByText(/세션 시간: —/)).toBeInTheDocument();
  });

  it('API 연동 성공 시 요청 수·평균 응답이 표시된다', async () => {
    mockFetchAnalytics.mockResolvedValue({
      total_requests: 42,
      successful_requests: 40,
      failed_requests: 2,
      average_response_time: 125.5,
    });
    render(
      <MemoryRouter>
        <AnalyticsView />
      </MemoryRouter>
    );
    expect(await screen.findByText(/요청 수: 42/)).toBeInTheDocument();
    expect(screen.getByText(/평균 응답: 125\.5ms/)).toBeInTheDocument();
  });

  it('API 연동 시 내보내기 버튼이 표시된다', async () => {
    mockFetchAnalytics.mockResolvedValue({
      total_requests: 5,
      successful_requests: 5,
      failed_requests: 0,
      average_response_time: 80,
    });
    render(
      <MemoryRouter>
        <AnalyticsView />
      </MemoryRouter>
    );
    expect(await screen.findByRole('button', { name: /CSV로 내보내기/ })).toBeInTheDocument();
  });

  it('API 연동 시 emotion/intent 분포가 있으면 대시보드 차트가 표시된다', async () => {
    mockFetchAnalytics.mockResolvedValue({
      total_requests: 10,
      successful_requests: 8,
      failed_requests: 2,
      average_response_time: 100,
      emotion_distribution: { positive: 4, negative: 2, neutral: 2 },
      intent_distribution: { question: 3, request: 2 },
    });
    render(
      <MemoryRouter>
        <AnalyticsView />
      </MemoryRouter>
    );
    expect(await screen.findByRole('img', { name: /감정·의도 분포 차트/ })).toBeInTheDocument();
  });

  it('API 실패 시 플레이스홀더와 안내 문구가 표시된다', async () => {
    mockFetchAnalytics.mockResolvedValue(null);
    render(
      <MemoryRouter>
        <AnalyticsView />
      </MemoryRouter>
    );
    expect(await screen.findByText(/요청 수: —/)).toBeInTheDocument();
    expect(screen.getByText(/백엔드 미연결 시 플레이스홀더/)).toBeInTheDocument();
  });

  it('프로젝트별 통계 섹션 제목이 표시된다', async () => {
    render(
      <MemoryRouter>
        <AnalyticsView />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 2, name: '프로젝트별 통계' })).toBeInTheDocument();
    await screen.findByText(/요청 수: /); // fetch 완료 대기 → act 경고 방지
  });

  it('프로젝트가 없으면 안내 문구가 표시된다', async () => {
    mockGetProjects.mockResolvedValue([]);
    render(
      <MemoryRouter>
        <AnalyticsView />
      </MemoryRouter>
    );
    expect(await screen.findByText(/프로젝트가 없습니다/)).toBeInTheDocument();
  });

  it('프로젝트가 있으면 선택 드롭다운과 통계가 표시된다', async () => {
    const testProject: Project = {
      id: 'proj_1',
      name: '테스트 프로젝트',
      description: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      files: [],
      instructions: '',
      tags: [],
      isActive: true,
      type: 'conversation',
      status: 'active',
      chats: [],
    };
    mockGetProjects.mockResolvedValue([testProject]);
    mockFetchProjectAnalytics.mockResolvedValue({
      project_id: 'proj_1',
      project_name: '테스트 프로젝트',
      session_count: 3,
      total_messages: 25,
      source_count: 2,
    });
    render(
      <MemoryRouter>
        <AnalyticsView />
      </MemoryRouter>
    );
    expect(await screen.findByRole('combobox', { name: /프로젝트 선택/ })).toBeInTheDocument();
    expect(await screen.findByText(/세션 수: 3/)).toBeInTheDocument();
    expect(screen.getByText(/메시지 수: 25/)).toBeInTheDocument();
    expect(screen.getByText(/노트북 소스: 2/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /프로젝트별 사용량 차트/ })).toBeInTheDocument();
  });
});
