/**
 * Genspark식 과업 완결형 에이전트 답변 — 재사용 프롬프트 블록
 *
 * @see docs/architecture/GENSPARK_STYLE_ANSWER_ENGINE_V1.md
 * @see docs/architecture/GENSPARK_REPO_IMPLEMENTATION_ORDER.md
 * @see docs/architecture/GENSPARK_EXTERNAL_AGENT_FORM_MAPPING.md (agents?id=… 폼 매핑)
 *
 * 기본 대화 동작은 변경하지 않는다. `agenticGensparkStyle: true`일 때만 컨텍스트/프롬프트에 주입.
 */

import { coerceTrimmedString } from '../utils/chatInputUtils';
import { buildGensparkReferenceAgentContext } from './gensparkReferenceAgentPreset';
import { buildGensparkRouteAgentContext } from './gensparkAgentRegistry';

/** §6.1 시스템 프롬프트 레이어 (요약) */
export const GENSPARK_AGENTIC_SYSTEM_LAYER = [
  '[과업 완결형 에이전트 지시 — 내부 전용]',
  '당신은 단순 대화형 답변기가 아니다. 사용자 요청을 업무·과업으로 해석하고, 필요하면 맥락을 보완하며, 답변 전에 구조를 설계하고, 결과는 실행 가능한 형태로 완성한다.',
  '우선순위: (1) 사용자의 실제 목적 (2) 구조적 문제 해결 (3) 검증 가능한 근거 (4) 산출물 완결성 (5) 다음 단계 제안.',
  '짧고 단순한 사실 질의(예: 한 줄 답)는 과도한 절차 없이 먼저 직접 답하되, 그 뒤 필요 시 한 줄로 다음 행동을 제안할 수 있다.',
].join('\n');

/** §5.1 출력 순서 힌트 (백엔드 llm_service GFM 블록과 동일한 섹션 제목) */
export const GENSPARK_OUTPUT_STRUCTURE_HINT = [
  '[출력 순서 권장 — 본문은 GFM 마크다운]',
  '1) 맨 위에 `## 한 줄 결론` 후 1~3문장',
  '2) 필요 시 `## 핵심 내용`, `## 근거·분석`, `## 실행안`, `## 다음 단계`만 추가(무관하면 생략)',
  '3) 코드는 ``` 언어 펜스, 표·목록으로 가독성 유지',
  '4) 과업형 요청이면 재정의·분석·단계·후속 옵션을 위 섹션에 맞게 배치',
].join('\n');

/** §6.2 플래너 (JSON만) — 백엔드 전용 호출 시 사용 */
export const GENSPARK_PLANNER_PROMPT = [
  '사용자 요청을 분석해 아래 항목만 채운 JSON을 반환하라. 설명 문장은 쓰지 말 것.',
  '필드: user_goal, hidden_needs, task_type, mode(fast|guided|expert), required_context[], ideal_output, risk_points[]',
].join('\n');

/** §6.3 블루프린트 — 본문 없이 구조만 */
export const GENSPARK_BLUEPRINT_PROMPT = [
  '이 요청에 대한 최적의 답변 구조만 설계하라. 본문은 쓰지 말 것.',
  'JSON 스키마: title, summary, sections[{title,purpose}], output_format, followup_actions[]',
].join('\n');

/** §6.4 초안 생성 */
export const GENSPARK_DRAFT_COMPOSER_PROMPT = [
  '아래 설계도(블루프린트)를 기준으로 최종 답변 초안을 작성하라.',
  '조건: 결론 우선, 불필요한 수식·군더더기 금지, 실행 가능한 문장, 예시·절차 포함, 복사해 바로 활용 가능한 형태.',
].join('\n');

/** §6.5 품질 검수 */
export const GENSPARK_VERIFIER_PROMPT = [
  '너는 답변 품질검사기다. 아래 초안을 검토하라.',
  '점검: 질문 의도 일치, 구조 누락, 단정·과장, 실행 불가 문장, 다음 단계 부재.',
  '수정 지시문만 반환하거나, 최종 개선본만 반환하라(호출 측에서 지정).',
].join('\n');

/**
 * 프론트→백엔드 컨텍스트에 넣을 압축 블록 (단일 LLM 호출 보강용)
 * 완전 다단계 오케스트레이션은 백엔드에서 수행.
 */
/**
 * @param routeAgentId `undefined`면 기본 참조 에이전트(eb7747…). `/agents?id=`로 열린 세션은 해당 id로 프로필·URL 메타를 맞춘다.
 */
export function buildGensparkAgenticContextHints(routeAgentId?: string): Record<string, string> {
  const rid = coerceTrimmedString(routeAgentId ?? '', '');
  const referenceBlock = rid ? buildGensparkRouteAgentContext(rid) : buildGensparkReferenceAgentContext();
  return {
    genspark_agentic_system: GENSPARK_AGENTIC_SYSTEM_LAYER,
    genspark_output_structure: GENSPARK_OUTPUT_STRUCTURE_HINT,
    genspark_planner_prompt_template: GENSPARK_PLANNER_PROMPT,
    genspark_blueprint_prompt_template: GENSPARK_BLUEPRINT_PROMPT,
    genspark_draft_prompt_template: GENSPARK_DRAFT_COMPOSER_PROMPT,
    genspark_verifier_prompt_template: GENSPARK_VERIFIER_PROMPT,
    /** Genspark agents 편집 폼(이름·설명·지시·산출·품질)에 대응하는 참조 프로필 */
    ...referenceBlock,
  };
}

/**
 * 사용자 메시지에 붙는 보조 지시 (내부 전용 — UI에 원문 노출 금지 정책과 정합)
 */
export function buildGensparkAgenticUserMessageAugmentation(): string {
  return [GENSPARK_AGENTIC_SYSTEM_LAYER, '', GENSPARK_OUTPUT_STRUCTURE_HINT].join('\n');
}
