/**
 * 질문·요구 확장 서비스
 * 짧은 입력을 긴 질문, 긴 요구, 다양한 질문/요구로 확장
 */

import { coerceTrimmedString } from '../utils/chatInputUtils';

export interface ExpandedSuggestions {
  longQuestions: string[];
  longRequirements: string[];
  variousQuestions: string[];
  variousRequirements: string[];
}

const QUESTION_PREFIXES = [
  '다음에 대해 자세히 설명해 주세요: ',
  '아래 주제를 구체적으로 분석해 주세요: ',
  '이 내용과 관련하여 상세히 알려 주세요: ',
];

const REQUIREMENT_PREFIXES = [
  '다음 요구사항을 충족하는 내용을 작성해 주세요: ',
  '아래 사항을 반드시 포함하여 작성해 주세요: ',
  '다음 조건을 고려한 결과를 제시해 주세요: ',
];

const QUESTION_ANGLES = [
  (s: string) => `${s}의 정의와 개념을 설명해 주세요.`,
  (s: string) => `${s}과 관련된 절차나 방법을 알려 주세요.`,
  (s: string) => `${s} 시 주의할 점은 무엇인가요?`,
  (s: string) => `${s}의 법적·제도적 근거는 무엇인가요?`,
  (s: string) => `${s}의 실무 적용 사례를 들어 설명해 주세요.`,
];

const REQUIREMENT_ANGLES = [
  (s: string) => `${s}을/를 반영한 요약`,
  (s: string) => `${s}에 대한 상세 분석 및 대응 방안`,
  (s: string) => `${s}을/를 고려한 체크리스트`,
  (s: string) => `${s} 관련 핵심 포인트 정리`,
  (s: string) => `${s}에 따른 권고사항 및 주의사항`,
];

/**
 * 짧은 입력을 다양한 질문·요구 형태로 확장
 */
export function expandInput(input: string): ExpandedSuggestions {
  const trimmed = coerceTrimmedString(input, '');
  if (!trimmed) {
    return { longQuestions: [], longRequirements: [], variousQuestions: [], variousRequirements: [] };
  }

  const longQuestions = QUESTION_PREFIXES.map((p) => p + trimmed);
  const longRequirements = REQUIREMENT_PREFIXES.map((p) => p + trimmed);
  const variousQuestions = QUESTION_ANGLES.map((fn) => fn(trimmed));
  const variousRequirements = REQUIREMENT_ANGLES.map((fn) => fn(trimmed));

  return {
    longQuestions,
    longRequirements,
    variousQuestions,
    variousRequirements,
  };
}
