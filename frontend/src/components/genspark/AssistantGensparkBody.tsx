/**
 * 비스트리밍 어시스턴트 본문: 빈 문자열·생성 플레이스홀더 → GensparkGenerationStatus, 그 외 → GensparkAnswerMarkdown
 */
import React from 'react';
import {
  coerceTrimmedString,
  getAssistantGenerationPhase,
  isAssistantGenerationStepUi,
} from '../../utils/chatInputUtils';
import { GensparkAnswerMarkdown } from './gensparkAnswerMarkdown';
import { GensparkGenerationStatus } from './GensparkGenerationStatus';

export interface AssistantGensparkBodyProps {
  text: string;
  searchTerm?: string;
  enhancedCodeBlocks?: boolean;
  embedded?: boolean;
  webSearch?: boolean;
  documentContext?: boolean;
  className?: string;
}

export const AssistantGensparkBody: React.FC<AssistantGensparkBodyProps> = ({
  text,
  searchTerm,
  enhancedCodeBlocks = true,
  embedded = false,
  webSearch,
  documentContext,
  className = 'genspark-md-body bw-text-primary',
}) => {
  const body = coerceTrimmedString(text, '');
  const genShell = (node: React.ReactNode) => <div data-generation-step="true">{node}</div>;

  if (isAssistantGenerationStepUi(text)) {
    if (!body) {
      return genShell(
        <GensparkGenerationStatus
          variant="initial"
          embedded={embedded}
          webSearch={webSearch}
          documentContext={documentContext}
        />,
      );
    }
    const phase = getAssistantGenerationPhase(body);
    return genShell(
      phase !== null ? (
        <GensparkGenerationStatus
          variant="step"
          phase={phase}
          embedded={embedded}
          webSearch={webSearch}
        />
      ) : (
        <GensparkGenerationStatus
          variant="initial"
          embedded={embedded}
          webSearch={webSearch}
          documentContext={documentContext}
        />
      ),
    );
  }
  return (
    <GensparkAnswerMarkdown
      text={text}
      className={className}
      searchTerm={searchTerm}
      enhancedCodeBlocks={enhancedCodeBlocks}
    />
  );
};
