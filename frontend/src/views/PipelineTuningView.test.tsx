/**
 * PipelineTuningView — 파이프라인 튜닝·LLM 내부 보안 표시
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PipelineTuningView from './PipelineTuningView';
import {
  fetchPipelineTuning,
  fetchLlmInternalSecurity,
} from '../services/pipelineTuningService';

jest.mock('../services/pipelineTuningService');

const mockTuning: jest.MockedFunction<typeof fetchPipelineTuning> = jest.mocked(fetchPipelineTuning);
const mockSecurity: jest.MockedFunction<typeof fetchLlmInternalSecurity> = jest.mocked(fetchLlmInternalSecurity);

describe('PipelineTuningView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('로딩 후 튜닝·보안 데이터를 표시한다', async () => {
    mockTuning.mockResolvedValue({
      success: true,
      config: { quality_presets: { basic: {} } },
      writable: false,
    });
    mockSecurity.mockResolvedValue({
      success: true,
      airgap: false,
      deepseek_cloud_blocked: true,
      outbound_collection_blocked: false,
    });

    render(
      <MemoryRouter>
        <PipelineTuningView />
      </MemoryRouter>
    );

    expect(screen.getByTestId('pipeline-tuning-view')).toBeInTheDocument();
    expect(screen.getByText(/응답 품질 프리셋/)).toBeInTheDocument();
    expect(screen.getAllByText('불러오는 중…').length).toBeGreaterThanOrEqual(1);

    await waitFor(() => {
      expect(screen.queryByText('불러오는 중…')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/API 쓰기 허용/)).toBeInTheDocument();
    expect(screen.getByText('아니오 (파일 직접 편집)')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'LLM 내부 보안 상태' })).toBeInTheDocument();
    expect(screen.getByText(/DeepSeek 클라우드 차단/)).toBeInTheDocument();
    // DeepSeek 차단=true → 해당 항목 행에 "예" 포함 (텍스트가 여러 노드로 쪼개져 getByText('예') 단독 매칭 불가)
    expect(document.body.textContent).toMatch(/DeepSeek 클라우드 차단[^]*예/);
    expect(screen.getByRole('heading', { name: '현재 파이프라인 설정' })).toBeInTheDocument();
    expect(screen.getByText(/quality_presets/)).toBeInTheDocument();
  });

  it('API 실패 시 안내 문구를 표시한다', async () => {
    mockTuning.mockResolvedValue(null);
    mockSecurity.mockResolvedValue(null);

    render(
      <MemoryRouter>
        <PipelineTuningView />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('불러오는 중…')).not.toBeInTheDocument();
    });

    expect(
      screen.getByText(/GET \/api\/pipeline-tuning/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/\/api\/llm-internal-security/)
    ).toBeInTheDocument();
  });
});
