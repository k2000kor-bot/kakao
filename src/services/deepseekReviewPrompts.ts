/**
 * DeepSeek Chat / Reasoner 검수·포맷 계층용 프롬프트 (Genspark형 파이프라인 v2)
 *
 * @see docs/architecture/GENSPARK_DEEPSEEK_DUAL_INFERENCE_ENGINE_V2.md §8
 * @see docs/architecture/GENSPARK_DEEPSEEK_KOREAN_ENGINE_V3.md §7 (한국어 장르·톤 충돌 검토 시 Reasoner 활용)
 *
 * 실제 호출은 백엔드에서 `deepseek-chat` / `deepseek-reasoner`로 수행.
 * 프론트는 context에 템플릿을 실어 백엔드 오케스트레이터가 선택적으로 사용.
 */

/** §8.1 메인 시스템 (메인 LLM용 — 요약) */
export const MAIN_AGENTIC_SYSTEM_PROMPT_V2 = [
  '[과업 완결형 메인 모델 지시]',
  '너는 단순 응답 생성기가 아니다. 사용자 요청을 과업으로 해석하고, 필요하면 구조를 먼저 설계하며, 최종 결과는 실행 가능한 산출물 형태로 완성한다.',
  '판단: (1) 실제 목적 (2) 필요 맥락 (3) 출력물 형태 (4) 검수 필요 수준 (5) 후속 행동 제안.',
  '짧은 단문 Q&A는 과도한 절차 없이 먼저 직접 답한다.',
].join('\n');

/** §8.2 DeepSeek Chat — 포맷·구조 정리 */
export const DEEPSEEK_CHAT_FORMATTER_PROMPT = [
  '너의 역할은 초안을 더 구조적이고 일관되게 정리하는 것이다.',
  '새로운 주장을 추가하기보다 다음에 집중하라:',
  '1) 섹션 구조 정렬',
  '2) 중복 문장 제거',
  '3) JSON/표/목차 안정화',
  '4) 표현의 균일화',
  '최종 결과는 구조화된 문서(또는 요청된 스키마)만 반환하라.',
].join('\n');

/** §8.3 DeepSeek Reasoner — 비평·검수 (JSON 출력 유도) */
export const DEEPSEEK_REASONER_CRITIQUE_PROMPT = [
  '너의 역할은 비평가이자 검수자다.',
  '아래 초안에 대해 다음을 분석하라:',
  '1) 논리적 누락',
  '2) 취약한 전제',
  '3) 반대편이 공격할 지점',
  '4) 과도한 단정',
  '5) 실무 적용성 부족 요소',
  '6) 개선 우선순위',
  '출력은 JSON으로만 반환하라. 키 예시: logic_gaps[], missing_sections[], risk_points[], improvement_actions[]',
].join('\n');

/** §8.4 메인 모델 최종 재조합 */
export const MAIN_FINAL_MERGE_PROMPT = [
  '아래 초안과 검수 결과를 반영하여 사용자에게 전달할 최종 문서를 완성하라.',
  '조건:',
  '- 문체는 일관되게 유지',
  '- 불필요한 메타 설명(내부 검수 과정 노출) 제거',
  '- 개선사항은 자연스럽게 본문에 녹인다',
  '- 결론 우선 구조를 유지한다',
].join('\n');

/** §9.2 라우팅 정책 (백엔드 구현용 타입 힌트) */
export type DeepSeekRoutingTaskType =
  | 'simple_qa'
  | 'long_form_writing'
  | 'strategic_reasoning'
  | 'critical_review'
  | 'format_cleanup';

export const DEFAULT_ROUTING_POLICY: Record<DeepSeekRoutingTaskType, string[]> = {
  simple_qa: ['main_model'],
  long_form_writing: ['main_model', 'deepseek_chat'],
  strategic_reasoning: ['main_model', 'deepseek_reasoner', 'deepseek_chat'],
  critical_review: ['deepseek_reasoner'],
  format_cleanup: ['deepseek_chat'],
};

/**
 * API context에 넣을 DeepSeek v2 힌트 (백엔드가 라우팅·프롬프트 선택 시 사용)
 */
/** 한국어 계층(v3)과 함께 쓸 때 Reasoner에 넘길 추가 검토 축 */
export const DEEPSEEK_KOREAN_REASONER_AXIS = [
  '한국어: context.korean_understanding·genre_control가 있으면',
  '1) 장르(카톡·기사·법률 등)와 톤이 본문에서 충돌하는지',
  '2) 중립 요청과 감정·구어체 요청이 동시에 있을 때 균형이 맞는지',
  '3) 생략된 대상(직전 맥락)이 답변에 잘못 해석되지 않았는지',
  'JSON 비평에 risk_points·improvement_actions에 위 항목을 반영할 수 있으면 반영한다.',
].join('\n');

export function buildDeepSeekReviewContextHints(): Record<string, unknown> {
  return {
    deepseek_integration_version: 'v2',
    deepseek_chat_formatter_prompt: DEEPSEEK_CHAT_FORMATTER_PROMPT,
    deepseek_reasoner_critique_prompt: DEEPSEEK_REASONER_CRITIQUE_PROMPT,
    main_final_merge_prompt: MAIN_FINAL_MERGE_PROMPT,
    main_agentic_system_prompt_v2: MAIN_AGENTIC_SYSTEM_PROMPT_V2,
    deepseek_routing_policy_default: DEFAULT_ROUTING_POLICY,
    deepseek_korean_reasoner_axis: DEEPSEEK_KOREAN_REASONER_AXIS,
  };
}
