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
  /** split 레이아웃: answer=좌측 답변, question=우측 입력, full=기본 */
  part?: 'full' | 'answer' | 'question';
};

export function GraphAnswerTurnBlock({
  turn,
  index,
  total,
  part = 'full',
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
  const showQuestion = part === 'full' || part === 'question';
  const showAnswer = part === 'full' || part === 'answer';

  const questionBlock = (
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
  );

  const answerBlock = (
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
  );

  return (
    <article
      className={[
        'conversation-graph-answer-turn',
        'genspark-qa-article',
        part === 'question' ? 'conversation-graph-answer-turn--question-only' : 'assistant-message',
        part === 'answer' ? 'conversation-graph-answer-turn--answer-only' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      {...(part === 'full' || part === 'answer'
        ? {
            'data-testid': TEST_IDS.CONVERSATION_GRAPH_ANSWER_TURN,
          }
        : {})}
      data-turn-id={turn.id}
      data-turn-index={index}
      data-turn-part={part}
    >
      {showQuestion ? questionBlock : null}
      {showAnswer ? answerBlock : null}
    </article>
  );
}
