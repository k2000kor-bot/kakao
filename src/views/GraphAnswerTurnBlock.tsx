import React, { useMemo } from 'react';
import { GensparkAnswerMarkdown } from '../components/genspark/gensparkAnswerMarkdown';
import { TEST_IDS } from '../constants/testIds';
import { ConversationGraphMermaidBlock } from './ConversationGraphMermaidBlock';
import { extractMermaidBlocksFromAnswer } from './conversationGraphMermaidExtract';
import type { GraphAnswerTurn } from './conversationGraphAnswerTurns';
import { truncateGraphAnswerQuestionPreview } from './conversationGraphAnswerTurns';

export type GraphAnswerTurnBlockProps = {
  turn: GraphAnswerTurn;
  index: number;
  total: number;
};

export function GraphAnswerTurnBlock({ turn, index, total }: GraphAnswerTurnBlockProps) {
  const parsed = useMemo(
    () => (turn.answer ? extractMermaidBlocksFromAnswer(turn.answer) : { body: '', diagrams: [] }),
    [turn.answer],
  );
  const isError = turn.status === 'error';
  const isStreaming = turn.status === 'streaming';
  const questionPreview = truncateGraphAnswerQuestionPreview(turn.question);

  return (
    <article
      className="bw-features-card"
      data-testid={TEST_IDS.CONVERSATION_GRAPH_ANSWER_TURN}
      data-turn-id={turn.id}
      data-turn-index={index}
      style={{
        padding: 10,
        marginBottom: 10,
        borderLeft: '3px solid var(--bw-border-strong, #c5c9d0)',
      }}
    >
      <header style={{ marginBottom: 8 }}>
        <p className="bw-label-block" style={{ fontSize: 12, margin: 0 }}>
          질문 {index + 1}
          {total > 1 ? ` / ${total}` : ''}
          {isStreaming ? ' · 생성 중' : ''}
        </p>
        <p
          className="bw-detail-meta-text"
          style={{ margin: '4px 0 0', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}
          data-testid="conversation-graph-answer-turn-question"
        >
          {questionPreview}
        </p>
      </header>
      {turn.answer ? (
        <div data-testid="conversation-graph-answer-turn-answer">
          {isError ? (
            <p className="bw-detail-meta-text" style={{ margin: 0, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
              {turn.answer}
            </p>
          ) : (
            <>
              {parsed.diagrams.map((diagram, diagramIndex) => (
                <ConversationGraphMermaidBlock key={`${turn.id}-m-${diagramIndex}`} source={diagram} />
              ))}
              <GensparkAnswerMarkdown
                text={parsed.body || turn.answer}
                className="genspark-md-body bw-text-primary"
                enhancedCodeBlocks
              />
            </>
          )}
        </div>
      ) : isStreaming ? (
        <p className="bw-detail-meta-text" role="status">
          답변을 작성하는 중…
        </p>
      ) : null}
    </article>
  );
}
