/**
 * WebResearchModal 컴포넌트 테스트
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import WebResearchModal from '../WebResearchModal';

jest.mock('../../services/webResearchService', () => ({
  __esModule: true,
  default: {
    performWebResearch: jest.fn().mockResolvedValue({
      original_question: 'test',
      research_results: {
        query: 'test',
        sources: [
          { url: 'https://example.com', title: 'Example', domain: 'example.com', credibility_score: 0.9, source_type: 'web' },
        ],
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
  },
}));

jest.mock('../../services/projectService', () => ({
  projectService: {
    addNotebookSourceFromUrl: jest.fn().mockResolvedValue({ source: { id: 's1', title: 'Example', type: 'web' }, source_count: 1 }),
  },
}));

describe('WebResearchModal', () => {
  it('닫힌 상태에서는 아무것도 렌더하지 않음', () => {
    render(<WebResearchModal open={false} onClose={jest.fn()} projectId="p1" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('열린 상태에서 검색 입력과 버튼 표시', () => {
    render(<WebResearchModal open onClose={jest.fn()} projectId="p1" />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/연구할 주제/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /연구 실행/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /닫기/ })).toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 onClose 호출', () => {
    const onClose = jest.fn();
    render(<WebResearchModal open onClose={onClose} projectId="p1" />);
    fireEvent.click(screen.getByRole('button', { name: /닫기/ }));
    expect(onClose).toHaveBeenCalled();
  });
});
