import React, { useMemo } from 'react';
import { AssistantGensparkBody } from '../components/genspark/AssistantGensparkBody';
import { GensparkAnswerMarkdown } from '../components/genspark/gensparkAnswerMarkdown';
import { TEST_IDS } from '../constants/testIds';
import {
  ASSISTANT_GENSPARK_QA_BADGE_ANSWER,
  ASSISTANT_GENSPARK_QA_BADGE_QUESTION,
} from '../utils/chatInputUtils';
import { ConversationGraphMermaidBlock } from './ConversationGraphMermaidBlock';
import { extractMermaidBlocksFromAnswer } from './conversationGraphMermaidExtract';
import type { GraphAnswerTurn } from './conversationGraphAnswerTurns';
import { truncateGraphAnswerQuestionPreview } from './conversationGraphAnswerTurns';

export type GraphAnswerTurnBlockProps = {
  turn: GraphAnswerTurn;
  index: number;
  total: number;
  /** 스트리밍 중이고 본문이 비었을 때 젠스파이크형 생성 단계 UI */
};

export function GraphAnswerTurnBlock({
  turn,
  index,
  total,
}: GraphAnswerTurnBlockProps) {
  const parsed = useMemo(
    () => (turn.answer ? extractMermaidBlocksFromAnswer(turn.answer) : { body: '', diagrams: [] }),
    [turn.answer],
  );
  const isError = turn.status === 'error';
  const isStreaming = turn.status === 'streaming';
  const questionPreview = truncateGraphAnswerQuestionPreview(turn.question);
  const markdownBody = parsed.body || turn.answer;
  const showGenerationStatus = isStreaming && !markdownBody && !isError;

  return (
    <article
      className="conversation-graph-answer-turn genspark-qa-article assistant-message"
      data-testid={TEST_IDS.CONVERSATION_GRAPH_ANSWER_TURN}
      data-turn-id={turn.id}
      data-turn-index={index}
    >
      <header className="conversation-graph-answer-turn__question-block">
        <div className="genspark-qa-role-row">
          <span className="genspark-qa-badge genspark-qa-badge--question">
            {ASSISTANT_GENSPARK_QA_BADGE_QUESTION}
          </span>
          <span className="conversation-graph-answer-turn__meta">
            {index + 1}
            {total > 1 ? ` / ${total}` : ''}
            {isStreaming ? ' · 생성 중' : ''}
          </span>
        </div>
        <p
          className="conversation-graph-answer-turn__question"
          data-testid="conversation-graph-answer-turn-question"
        >
          {questionPreview}
        </p>
      </header>

      <div
        className="message-text conversation-graph-answer-turn__answer"
        data-testid="conversation-graph-answer-turn-answer"
      >
        <div className="genspark-qa-role-row">
          <span className="genspark-qa-badge genspark-qa-badge--answer">
            {ASSISTANT_GENSPARK_QA_BADGE_ANSWER}
          </span>
        </div>

        {showGenerationStatus ? (
          <AssistantGensparkBody
            text=""
            embedded
            documentContext
            className="genspark-md-body bw-text-primary conversation-graph-answer-turn__md"
          />
        ) : null}

        {turn.answer && !showGenerationStatus ? (
          isError ? (
            <p className="conversation-graph-answer-turn__error" role="alert">
              {turn.answer}
            </p>
          ) : (
            <>
              {parsed.diagrams.map((diagram, diagramIndex) => (
                <ConversationGraphMermaidBlock key={`${turn.id}-m-${diagramIndex}`} source={diagram} />
              ))}
              <GensparkAnswerMarkdown
                text={markdownBody}
                className="genspark-md-body bw-text-primary conversation-graph-answer-turn__md"
                enhancedCodeBlocks
              />
            </>
          )
        ) : null}

        {isStreaming && markdownBody && !isError ? (
          <p className="conversation-graph-answer-turn__streaming-hint" role="status" aria-live="polite">
            답변을 이어서 작성하는 중…
          </p>
        ) : null}
      </div>
    </article>
  );
}
