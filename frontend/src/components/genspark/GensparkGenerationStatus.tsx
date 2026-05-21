/**
 * 젠스파이크형 답변 생성 중 UI — 분석 → 관점·개요 → 작성 → 다각도 점검 → 최종 검토(5단계)
 * (`ChatGPTInterface`·NotebookLLM 등 플레이스홀더와 연동)
 */
import React from 'react';
import {
  type AssistantGenerationPhase,
  ASSISTANT_GENSPARK_STATUS_RETRY_BANNER,
  ASSISTANT_GENSPARK_STATUS_HEADLINE_INITIAL_DEFAULT,
  ASSISTANT_GENSPARK_STATUS_HEADLINE_INITIAL_DOCUMENT,
  ASSISTANT_GENSPARK_STATUS_HEADLINE_INITIAL_WEB,
  ASSISTANT_GENSPARK_STATUS_HEADLINE_STEP_ACTIVE,
  ASSISTANT_GENSPARK_STATUS_HEADLINE_STEP_RETRY,
  ASSISTANT_GENSPARK_STEPS_ARIA_LABEL,
  ASSISTANT_GENERATION_STEP_LABELS_DEFAULT,
  ASSISTANT_GENERATION_STEP_LABELS_WEB_RESEARCH,
  assistantGenerationPhaseToStepIndex,
} from '../../utils/chatInputUtils';

export type GensparkGenerationStatusProps =
  | { variant: 'initial'; webSearch?: boolean; documentContext?: boolean; embedded?: boolean }
  | { variant: 'step'; phase: AssistantGenerationPhase; webSearch?: boolean; embedded?: boolean };

export const GensparkGenerationStatus: React.FC<GensparkGenerationStatusProps> = (props) => {
  const webSearch = props.webSearch === true;
  const documentContext =
    props.variant === 'initial' ? props.documentContext === true : false;
  const labels = webSearch
    ? ASSISTANT_GENERATION_STEP_LABELS_WEB_RESEARCH
    : ASSISTANT_GENERATION_STEP_LABELS_DEFAULT;

  const variant = props.variant;
  const phase = variant === 'step' ? props.phase : undefined;
  const embedded = props.embedded === true;

  const activeIndex =
    variant === 'initial'
      ? 0
      : assistantGenerationPhaseToStepIndex(props.phase) ?? -1;

  const headline =
    variant === 'initial'
      ? webSearch
        ? ASSISTANT_GENSPARK_STATUS_HEADLINE_INITIAL_WEB
        : documentContext
          ? ASSISTANT_GENSPARK_STATUS_HEADLINE_INITIAL_DOCUMENT
          : ASSISTANT_GENSPARK_STATUS_HEADLINE_INITIAL_DEFAULT
      : phase === 'retry'
        ? ASSISTANT_GENSPARK_STATUS_HEADLINE_STEP_RETRY
        : ASSISTANT_GENSPARK_STATUS_HEADLINE_STEP_ACTIVE;

  return (
    <div
      data-testid="genspark-generation-status"
      className={`genspark-generation-status${embedded ? ' genspark-generation-status--embedded' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="genspark-generation-status__headline">{headline}</div>
      {variant === 'step' && phase === 'retry' ? (
        <p className="genspark-generation-status__retry">{ASSISTANT_GENSPARK_STATUS_RETRY_BANNER}</p>
      ) : (
        <ol className="genspark-generation-status__steps" aria-label={ASSISTANT_GENSPARK_STEPS_ARIA_LABEL}>
          {labels.map((label, i) => {
            const state =
              i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'pending';
            return (
              <li
                key={label}
                className={`genspark-generation-status__step genspark-generation-status__step--${state}`}
              >
                <span className="genspark-generation-status__dot" aria-hidden />
                <span className="genspark-generation-status__label">{label}</span>
              </li>
            );
          })}
        </ol>
      )}
      <span className="genspark-generation-status__pulse" aria-hidden />
    </div>
  );
};
