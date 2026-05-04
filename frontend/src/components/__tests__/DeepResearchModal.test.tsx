/**
 * DeepResearchModal 컴포넌트 테스트
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeepResearchModal from '../DeepResearchModal';

jest.mock('../../services/webResearchService', () => ({
  __esModule: true,
  default: {
    performWebResearch: jest.fn().mockResolvedValue({
      original_question: 'test',
      research_results: {
        query: 'test',
        sources: [{ url: 'https://example.com', title: 'Example', domain: 'example.com', credibility_score: 0.9, source_type: 'web' }],
        key_findings: [],
        consensus_points: [],
        credibility_assessment: { high_credibility_sources: 1, medium_credibility_sources: 0, low_credibility_sources: 0, average_credibility: 0.9 },
        research_summary: '테스트 요약',
      },
      logical_refutations: [],
      methodology_assessment: { sample_size: 1, source_diversity: 1, methodology_strength: 'strong' },
      conclusion: '결론',
      recommendations: [],
      confidence_score: 0.9,
    }),
    formatWebResearchResponse: jest.fn(() => '## 보고서\n테스트 내용'),
  },
}));

jest.mock('../../services/projectService', () => ({
  projectService: {
    addNotebookSourceFromWebIngestUrl: jest.fn().mockResolvedValue({
      ok: true,
      source: { id: 's1', title: 'Example', type: 'web' },
      source_count: 1,
    }),
  },
}));

const buildMockResearchResult = () => ({
  original_question: 'test',
  research_results: {
    query: 'test',
    sources: [{ url: 'https://example.com', title: 'Example', domain: 'example.com', credibility_score: 0.9, source_type: 'web' }],
    key_findings: [],
    consensus_points: [],
    credibility_assessment: { high_credibility_sources: 1, medium_credibility_sources: 0, low_credibility_sources: 0, average_credibility: 0.9 },
    research_summary: '테스트 요약',
  },
  logical_refutations: [],
  methodology_assessment: { sample_size: 1, source_diversity: 1, methodology_strength: 'strong' },
  conclusion: '결론',
  recommendations: [],
  confidence_score: 0.9,
});

describe('DeepResearchModal', () => {
  it('닫힌 상태에서는 아무것도 렌더하지 않음', () => {
    render(<DeepResearchModal open={false} onClose={jest.fn()} projectId="p1" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('열린 상태에서 입력과 버튼 표시', () => {
    render(<DeepResearchModal open onClose={jest.fn()} projectId="p1" />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-describedby', 'deep-research-description');
    expect(screen.getByText(/주제를 입력하면 웹 검색 기반 심층 보고서를 생성합니다/)).toHaveAttribute(
      'id',
      'deep-research-description'
    );
    expect(screen.getByPlaceholderText(/심층 분석할 주제/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /심층 보고서 생성/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /닫기/ })).toHaveAttribute('title', '닫기');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 onClose 호출', () => {
    const onClose = jest.fn();
    render(<DeepResearchModal open onClose={onClose} projectId="p1" />);
    fireEvent.click(screen.getByRole('button', { name: /닫기/ }));
    expect(onClose).toHaveBeenCalled();
  });

  it('Escape 키 입력 시 onClose 호출', () => {
    const onClose = jest.fn();
    render(<DeepResearchModal open onClose={onClose} projectId="p1" />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('오버레이 클릭 시 onClose 호출', () => {
    const onClose = jest.fn();
    render(<DeepResearchModal open onClose={onClose} projectId="p1" />);
    fireEvent.click(screen.getByRole('dialog').parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalled();
  });

  it('모달 내부 클릭 시 onClose를 호출하지 않음', () => {
    const onClose = jest.fn();
    render(<DeepResearchModal open onClose={onClose} projectId="p1" />);
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('열림/닫힘에 따라 body 스크롤 락을 적용하고 복원함', () => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    const { rerender } = render(<DeepResearchModal open onClose={jest.fn()} projectId="p1" />);
    expect(document.body.style.overflow).toBe('hidden');

    rerender(<DeepResearchModal open={false} onClose={jest.fn()} projectId="p1" />);
    expect(document.body.style.overflow).toBe(originalOverflow);
    expect(document.body.style.paddingRight).toBe(originalPaddingRight);
  });

  it('모달 닫힘 시 이전 포커스로 복원함', () => {
    const ModalHarness: React.FC = () => {
      const [open, setOpen] = React.useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>모달 열기</button>
          <DeepResearchModal open={open} onClose={() => setOpen(false)} projectId="p1" />
        </>
      );
    };

    render(<ModalHarness />);
    const trigger = screen.getByRole('button', { name: '모달 열기' });
    trigger.focus();
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('button', { name: /닫기/ }));
    expect(trigger).toHaveFocus();
  });

  it('Tab/Shift+Tab으로 모달 내부 포커스를 순환함', () => {
    render(<DeepResearchModal open onClose={jest.fn()} projectId="p1" />);
    const closeButton = screen.getByRole('button', { name: /닫기/ });
    const input = screen.getByLabelText('연구 주제');
    const runButton = screen.getByRole('button', { name: /심층 보고서 생성/ });
    fireEvent.change(input, { target: { value: '테스트 주제' } });
    expect(runButton).not.toBeDisabled();

    runButton.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(closeButton).toHaveFocus();

    closeButton.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(runButton).toHaveFocus();
  });

  it('빈 입력에서는 심층 보고서 생성 버튼이 비활성화됨', () => {
    render(<DeepResearchModal open onClose={jest.fn()} projectId="p1" />);
    expect(screen.getByRole('button', { name: /심층 보고서 생성/ })).toBeDisabled();
  });

  it('공백만 입력하면 비활성 유지, 텍스트 입력 시 활성화됨', () => {
    render(<DeepResearchModal open onClose={jest.fn()} projectId="p1" />);
    const input = screen.getByLabelText('연구 주제');
    const runButton = screen.getByRole('button', { name: /심층 보고서 생성/ });

    fireEvent.change(input, { target: { value: '   ' } });
    expect(runButton).toBeDisabled();

    fireEvent.change(input, { target: { value: '시장 분석' } });
    expect(runButton).not.toBeDisabled();
  });

  it('로딩 중 상태 안내를 표시함', async () => {
    const webResearchService = require('../../services/webResearchService').default;
    let resolveResearch: ((value: unknown) => void) | null = null;
    const pendingResearch = new Promise((resolve) => {
      resolveResearch = resolve;
    });
    (webResearchService.performWebResearch as jest.Mock).mockImplementationOnce(() => pendingResearch);

    render(<DeepResearchModal open onClose={jest.fn()} projectId="p1" />);
    fireEvent.change(screen.getByLabelText('연구 주제'), { target: { value: '시장 분석' } });
    fireEvent.click(screen.getByRole('button', { name: /심층 보고서 생성/ }));

    expect(screen.getByRole('status')).toHaveTextContent('심층 보고서를 생성 중입니다.');
    resolveResearch?.(buildMockResearchResult());

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('');
    });
  });
});
