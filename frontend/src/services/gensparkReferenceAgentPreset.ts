/**
 * Genspark 에이전트 편집 화면(agents?id=…) 폼과 1:1로 맞출 수 있는 참조 프리셋.
 *
 * 외부 페이지는 Cloudflare 등으로 자동 수집이 불가하므로,
 * 공개 UX(Custom Super Agent: 이름·설명·지시문·산출·품질)에 맞춘 기본값을 두고
 * `REACT_APP_GENSPARK_REFERENCE_AGENT_INSTRUCTIONS`에 Genspark에서 복사한 지시문을 넣으면 그대로 반영된다.
 *
 * 참조 URL(사용자 제공): `PUBLIC_GENSPARK_AGENTS_ORIGIN?id=…`(아래 GENSPARK_REFERENCE_AGENT_ID)
 */

import { PUBLIC_GENSPARK_AGENTS_ORIGIN } from '../config/api';
import { AGENTS_QUERY_PARAM_ID } from '../config/routes';
import { coerceTrimmedString } from '../utils/chatInputUtils';

export const GENSPARK_REFERENCE_AGENT_ID = 'eb7747f5-0399-48ff-b436-68a0a23365c9';

export const GENSPARK_REFERENCE_AGENT_URL =
  `${PUBLIC_GENSPARK_AGENTS_ORIGIN}?${AGENTS_QUERY_PARAM_ID}=${GENSPARK_REFERENCE_AGENT_ID}`;

/** Genspark 에이전트 편집 폼의 논리적 필드 (UI 섹션과 대응) */
export type GensparkAgentFormFields = {
  /** 에이전트 표시 이름 */
  displayName: string;
  /** 한 줄 소개 / What this agent does */
  oneLineDescription: string;
  /** 핵심 지시문 (Instructions / System) — Genspark에서 복사해 env로 덮어쓸 수 있음 */
  instructions: string;
  /** 지식·도구: 내부 RAG·웹·첨부 활용 원칙 */
  knowledgeAndTools: string;
  /** 기대 산출물 형태 */
  expectedDeliverables: string;
  /** 품질·검증·불확실성 처리 */
  qualityAndVerification: string;
};

/**
 * 레포 아키텍처(GENSPARK_STYLE_ANSWER_ENGINE_V1)에 맞춘 기본 지시문.
 * 실제 Genspark 에이전트와 동일하게 맞추려면 해당 페이지의 Instructions를 복사해 env에 넣는다.
 */
export const DEFAULT_REFERENCE_AGENT_INSTRUCTIONS = [
  '역할: 사용자의 발화를 "대화 한 줄"이 아니라 완결 가능한 과업으로 해석한다.',
  '절차: (1) 목표·제약 확인 (2) 필요 맥락 보완 (3) 답 구조(블루프린트) 설계 (4) 실행 가능한 산출 (5) 검증 관점에서 한 번 더 점검 (6) 다음 행동 2~3개 제안.',
  '출력 순서: 한 줄 결론 → 문제 재정의(과업 단위) → 핵심 분석·근거 → 실행안(단계) → 후속 옵션.',
  '짧은 사실 질의는 절차를 과도하게 늘리지 말고 먼저 직답한 뒤, 필요 시 한 줄로 다음 행동만 제안한다.',
  '근거가 없으면 단정하지 말고 "확인 필요"와 확인 질문을 명시한다.',
  '프로젝트 소스·웹 조사·대화 첨부가 있으면 우선 근거로 사용한다.',
].join('\n');

export const DEFAULT_GENSPARK_AGENT_FORM: GensparkAgentFormFields = {
  displayName: '과업 완결형 Super Agent (레포 정합 프리셋)',
  oneLineDescription:
    '질문을 업무 과업으로 바꾸고, 개요·초안·검증·다음 단계까지 밀어주는 Genspark식 에이전트 동작을 따른다.',
  instructions: DEFAULT_REFERENCE_AGENT_INSTRUCTIONS,
  knowledgeAndTools:
    '내부 지식(RAG)·프로젝트 지침·웹 요약·사용자 첨부가 주어지면 인용·근거로 삼고, 없으면 일반 지식 범위를 명시한다.',
  expectedDeliverables:
    '복사해 바로 쓸 수 있는 문장·체크리스트·단계 목록을 우선하고, 표·목차가 요청에 맞으면 마크다운으로 구조화한다.',
  qualityAndVerification:
    '단정·환각 위험이 있으면 완곡히 제한하고, 파이프라인 Verifier/검수 메타가 있으면 그 피드백을 존중한다.',
};

/** Genspark `agents?id=` 와 동일한 ID·URL로 외부 프로필 마크다운 생성 (라우트별 에이전트 공용) */
export function buildExternalAgentProfileMarkdown(
  agentId: string,
  agentUrl: string,
  form: GensparkAgentFormFields
): string {
  return [
    '[Genspark 참조 에이전트 프로필 — 폼 필드 매핑]',
    `에이전트 ID(참조): ${agentId}`,
    `원본 편집 URL: ${agentUrl}`,
    '',
    `## 표시 이름\n${form.displayName}`,
    '',
    `## 한 줄 설명\n${form.oneLineDescription}`,
    '',
    '## 지시문 (Instructions)',
    form.instructions,
    '',
    `## 지식·도구\n${form.knowledgeAndTools}`,
    '',
    `## 기대 산출물\n${form.expectedDeliverables}`,
    '',
    `## 품질·검증\n${form.qualityAndVerification}`,
  ].join('\n');
}

/**
 * 프론트→백엔드 context에 넣을 참조 에이전트 블록 (agentic_genspark_style과 함께 전달 권장)
 */
export function buildGensparkReferenceAgentContext(): Record<string, string> {
  const envInstr = coerceTrimmedString(
    typeof process !== 'undefined'
      ? process.env.REACT_APP_GENSPARK_REFERENCE_AGENT_INSTRUCTIONS || ''
      : '',
    ''
  );
  const skip =
    typeof process !== 'undefined' &&
    process.env.REACT_APP_GENSPARK_REFERENCE_AGENT_PROFILE === '0';

  if (skip) {
    return {
      genspark_reference_agent_id: GENSPARK_REFERENCE_AGENT_ID,
      genspark_reference_agent_url: GENSPARK_REFERENCE_AGENT_URL,
    };
  }

  const form: GensparkAgentFormFields = {
    ...DEFAULT_GENSPARK_AGENT_FORM,
    ...(envInstr ? { instructions: envInstr } : {}),
  };

  return {
    genspark_reference_agent_id: GENSPARK_REFERENCE_AGENT_ID,
    genspark_reference_agent_url: GENSPARK_REFERENCE_AGENT_URL,
    genspark_external_agent_profile: buildExternalAgentProfileMarkdown(
      GENSPARK_REFERENCE_AGENT_ID,
      GENSPARK_REFERENCE_AGENT_URL,
      form
    ),
  };
}
