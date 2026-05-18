import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ConversationGraphMermaidBlock } from './ConversationGraphMermaidBlock';

jest.mock('mermaid', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn(),
    render: jest.fn().mockResolvedValue({ svg: '<svg data-testid="mock-mermaid-svg"></svg>' }),
  },
}));

describe('ConversationGraphMermaidBlock', () => {
  beforeEach(() => {
    const mermaid = jest.requireMock('mermaid').default;
    mermaid.render.mockResolvedValue({ svg: '<svg data-testid="mock-mermaid-svg"></svg>' });
  });

  it('Mermaid 미리보기를 렌더하고 소스 토글이 동작한다', async () => {
    render(
      <ConversationGraphMermaidBlock source={'flowchart TB\n  A-->B'} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-mermaid-preview')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('conversation-graph-mermaid-source')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('conversation-graph-mermaid-toggle-source'));
    expect(screen.getByTestId('conversation-graph-mermaid-source')).toHaveTextContent('flowchart TB');

    fireEvent.click(screen.getByTestId('conversation-graph-mermaid-toggle-source'));
    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-mermaid-preview')).toBeInTheDocument();
    });
  });

  it('렌더 실패 시 소스만 표시한다', async () => {
    const mermaid = jest.requireMock('mermaid').default;
    mermaid.render.mockRejectedValueOnce(new Error('bad syntax'));

    render(<ConversationGraphMermaidBlock source={'invalid'} />);

    await waitFor(() => {
      expect(screen.getByTestId('conversation-graph-mermaid-source')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('conversation-graph-mermaid-preview')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/미리보기를 그리지 못했습니다/)).toBeInTheDocument();
    });
  });
});
