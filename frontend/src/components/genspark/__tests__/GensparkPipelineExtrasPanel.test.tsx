import React from 'react';
import { render, screen } from '@testing-library/react';
import { ASSISTANT_PLACEHOLDER_DRAFT } from '../../../utils/chatInputUtils';
import { GensparkPipelineExtrasPanel } from '../GensparkPipelineExtrasPanel';

jest.mock('../gensparkAnswerMarkdown', () => ({
  GensparkAnswerMarkdown: ({ text }: { text: string }) => (
    <div data-testid="genspark-answer-md">{text}</div>
  ),
}));

jest.mock('../GensparkGenerationStatus', () => ({
  GensparkGenerationStatus: ({
    variant,
    phase,
  }: {
    variant: string;
    phase?: string;
  }) => (
    <div
      data-testid="genspark-generation-status"
      data-variant={variant}
      data-phase={phase ?? ''}
    />
  ),
}));

describe('GensparkPipelineExtrasPanel', () => {
  it('verifierRewriteAttempted일 때 재작성 안내를 표시한다', () => {
    render(
      <GensparkPipelineExtrasPanel
        extras={{
          verifierRewriteAttempted: true,
          verificationPass: true,
        }}
        theme={{ borderColor: '#ccc', textSecondary: '#666' }}
        messageId="m1"
      />
    );
    expect(
      screen.getByText(/검수 피드백 반영을 위해 초안을 1회 재작성했습니다/)
    ).toBeInTheDocument();
  });

  it('generationScenarioMarkdown이 있으면 생성 시나리오 제목과 본문을 표시한다', () => {
    render(
      <GensparkPipelineExtrasPanel
        extras={{
          generationScenarioMarkdown: '## 답변 생성 시나리오\n항목',
        }}
        theme={{ borderColor: '#ccc', textSecondary: '#666' }}
        messageId="m2"
      />
    );
    expect(screen.getByText('생성 시나리오 (파이프라인)')).toBeInTheDocument();
    expect(screen.getByTestId('genspark-answer-md')).toHaveTextContent(/답변 생성 시나리오/);
  });

  it('generationScenarioMarkdown이 생성 플레이스홀더면 GensparkGenerationStatus를 쓴다', () => {
    render(
      <GensparkPipelineExtrasPanel
        extras={{
          generationScenarioMarkdown: ASSISTANT_PLACEHOLDER_DRAFT,
        }}
        theme={{ borderColor: '#ccc', textSecondary: '#666' }}
        messageId="m3"
      />
    );
    const gen = screen.getByTestId('genspark-generation-status');
    expect(gen).toHaveAttribute('data-variant', 'step');
    expect(gen).toHaveAttribute('data-phase', 'draft');
    expect(screen.queryByTestId('genspark-answer-md')).not.toBeInTheDocument();
  });

  it('pipelineGenerationPhase가 있으면 파이프라인 단계 라벨과 값을 표시한다', () => {
    render(
      <GensparkPipelineExtrasPanel
        extras={{ pipelineGenerationPhase: 'verify' }}
        theme={{ borderColor: '#ccc', textSecondary: '#666' }}
        messageId="m4"
      />
    );
    expect(screen.getByText('파이프라인 단계:')).toBeInTheDocument();
    expect(screen.getByText('verify')).toBeInTheDocument();
  });
});
