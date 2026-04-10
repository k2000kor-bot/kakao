/**
 * 통합 생성글(답변) 프롬프트 빌더
 * 모든 입력창에서 동일한 품질의 생성글이 나올 수 있도록 공통 지시 블록 제공
 */

import {
  parseQuestionRequirementSections,
  parseInputIntent,
  buildFeatureContextFromMessage,
  coerceTrimmedString,
  shouldTreatAsStructuredQuestionRequirements,
  shouldUseDualKeywordQuestionRequirementsPreset,
  shouldOmitComposerDiversityDirectiveBlock,
} from '../utils/chatInputUtils';
import {
  buildGenreControlProfile,
  buildKoreanUnderstandingInstructionBlock,
  buildKoreanUnderstandingProfile,
  containsHangul,
  extractPriorTurnsForKoContext,
} from '../utils/koreanUnderstandingLayer';
import {
  buildGensparkAgenticContextHints,
  buildGensparkAgenticUserMessageAugmentation,
} from './gensparkAgenticPrompts';
import { buildDeepSeekReviewContextHints } from './deepseekReviewPrompts';
import type { UnifiedChatConversationTurn } from './chatConversationTurn';
import {
  DEFAULT_CHAT_PERSPECTIVE,
  DEFAULT_CHAT_RESPONSE_STYLE,
  type ChatPerspectiveUi,
  type ChatResponseStyleUi,
} from '../utils/modernChatUrlStyle';

export type { UnifiedChatConversationTurn };

export type ResponseStyle = ChatResponseStyleUi;
export type Perspective = ChatPerspectiveUi;

export interface GenerationPromptConfig {
  responseStyle?: ResponseStyle;
  perspective?: Perspective;
  structuredInputAssistEnabled?: boolean;
  variationInstruction?: string;
  styleLearningInstruction?: string;
  /** 한국어 생략 복원용 직전 턴 (선택) */
  conversationHistory?: UnifiedChatConversationTurn[];
  /**
   * Genspark식 과업 완결형 지시 주입 (기본 false — 점진 적용)
   * @see docs/architecture/GENSPARK_STYLE_ANSWER_ENGINE_V1.md
   */
  agenticGensparkStyle?: boolean;
  /**
   * DeepSeek Chat/Reasoner 검수·포맷 계층용 context 힌트 (기본 false)
   * @see docs/architecture/GENSPARK_DEEPSEEK_DUAL_INFERENCE_ENGINE_V2.md
   */
  deepSeekReviewLayerHints?: boolean;
  project?: {
    id?: string;
    name?: string;
    initialGuidelines?: string[];
    tags?: string[];
  } | null;
}

/** 실제로 기본값을 두는 필드만 (선택 플래그는 destructuring 시 undefined 기본 처리) */
const DEFAULT_CONFIG: Pick<
  GenerationPromptConfig,
  'responseStyle' | 'perspective' | 'structuredInputAssistEnabled'
> = {
  responseStyle: DEFAULT_CHAT_RESPONSE_STYLE,
  perspective: DEFAULT_CHAT_PERSPECTIVE,
  structuredInputAssistEnabled: true,
};

/**
 * 혁신적 답변·글쓰기 품질 지시 블록 (NotebookLLM 등 기존 프롬프트에 추가용)
 */
export function getInnovativeWritingInstructionBlock(includeCreative?: boolean): string {
  const lines = [
    '[혁신적 답변·글쓰기 품질]',
    '• 논리적 구조: 전제→논리 전개→결론 순으로 설득력 있게 작성하세요.',
    '• 결론 선행: 핵심 요약·결론을 먼저 제시한 뒤 상세를 풀어가세요.',
    '• 독창적 관점: 흔한 수식어 대신 날카로운 관점·반직관적 인사이트를 포함하세요.',
    '• 수식어 지양: "혁신적", "획기적" 등 빈번한 수식어는 피하고, 구체적 근거로 대체하세요.',
  ];
  if (includeCreative) {
    lines.push('• 창의 모드: 기존과 다른 접근법, 위트 있는 표현(적절히), 2개 이상 대안을 제시하세요.');
  }
  lines.push(
    '• 다각도: 이해관계자·실무·리스크 등 서로 다른 관점을 구분해 다루고, 매번 다른 서두·근거 순서를 사용하세요.',
  );
  return lines.join('\n');
}

/**
 * 모든 입력창에서 동일한 생성글 품질을 위한 통합 프롬프트 생성
 * @param rawInput 사용자 원본 입력
 * @param config 생성 옵션 (미지정 시 기본값: balanced, practical)
 * @returns API에 전달할 message 문자열 (사용자 입력 + 생성글 품질 지시)
 */
export function buildUnifiedGenerationPrompt(
  rawInput: string,
  config: GenerationPromptConfig = {}
): string {
  const {
    responseStyle = DEFAULT_CONFIG.responseStyle,
    perspective = DEFAULT_CONFIG.perspective,
    structuredInputAssistEnabled = DEFAULT_CONFIG.structuredInputAssistEnabled,
    variationInstruction,
    styleLearningInstruction,
    conversationHistory,
    agenticGensparkStyle,
    deepSeekReviewLayerHints,
    project,
  } = config;

  const parsedSections = parseQuestionRequirementSections(rawInput);
  const explicitQuestionRequirementIntent =
    structuredInputAssistEnabled && shouldTreatAsStructuredQuestionRequirements(parsedSections);
  const questionIntent = /(질문|q&a|qa|인터뷰|면담 질문|물어볼)/i.test(rawInput);
  const requirementsIntent = /(요구사항|요건|requirement|명세|스펙|spec)/i.test(rawInput);
  const minutesIntent = /(회의록|미팅 노트|회의 정리)/i.test(rawInput);
  const checklistIntent = /(체크리스트|점검표|todo|할 일)/i.test(rawInput);
  const riskIntent = /(리스크|위험|risk|완화 방안)/i.test(rawInput);
  const omitHeavyPromptDupes = shouldOmitComposerDiversityDirectiveBlock(rawInput);

  const styleInstruction =
    responseStyle === 'concise'
      ? '최대한 간결하게, 핵심만 bullet 중심으로 작성하세요.'
      : responseStyle === 'balanced'
        ? '핵심과 근거를 균형 있게 작성하세요.'
        : responseStyle === 'detailed'
          ? '실무 적용 가능한 세부 항목까지 충분히 상세히 작성하세요.'
          : '종합형으로 작성하고, 요약→본문→실행계획 순으로 구조화하세요.';

  const perspectiveInstruction =
    perspective === 'practical'
      ? '실행 가능성과 현실 적용성을 최우선으로 판단하세요.'
      : perspective === 'theoretical'
        ? '개념적 근거와 원리를 명확히 제시하세요.'
        : perspective === 'creative'
          ? '대안안을 2개 이상 제시해 창의적 선택지를 포함하세요. 독창적 관점·반직관적 인사이트를 담으세요.'
          : perspective === 'critical'
            ? '가정/한계/반례를 먼저 점검하고 보완안을 제시하세요.'
            : perspective === 'empathetic'
              ? '이해관계자 관점의 우려/커뮤니케이션 포인트를 반영하세요.'
              : '';

  const innovativeWritingInstruction = omitHeavyPromptDupes
    ? ''
    : getInnovativeWritingInstructionBlock(perspective === 'creative');

  let resolvedInstruction = '질문 의도를 분석해 가장 적합한 형식으로 구조화하세요.';
  if (
    explicitQuestionRequirementIntent ||
    shouldUseDualKeywordQuestionRequirementsPreset(rawInput, questionIntent, requirementsIntent)
  ) {
    resolvedInstruction =
      '1) 질문 목록과 2) 요구사항 명세를 분리 작성하세요. 질문 파트는 카테고리별, 요구사항 파트는 기능/비기능/수용기준으로 정리하세요.';
  } else if (omitHeavyPromptDupes) {
    resolvedInstruction =
      '사용자 메시지에 이미 형식·스타일·필수 항목이 있으면 그에 맞게 답하세요. 없으면 일반 구조화 답변을 하세요.';
  } else if (minutesIntent) {
    resolvedInstruction =
      '회의록 형식으로 작성하세요. 참석자, 안건, 결정사항, 액션 아이템(담당/기한), 미결 이슈를 포함하세요.';
  } else if (checklistIntent) {
    resolvedInstruction =
      '실행 체크리스트 형식으로 작성하세요. 단계별 항목, 완료 기준, 우선순위(P1~P3), 예상 소요시간을 포함하세요.';
  } else if (riskIntent) {
    resolvedInstruction =
      '리스크 매트릭스 형식으로 작성하세요. 리스크 항목, 영향도, 발생 가능성, 조기 징후, 대응/완화 방안을 표로 작성하세요.';
  } else if (questionIntent) {
    resolvedInstruction =
      '질문 생성 요청으로 인식하고, 난이도/목적 기준으로 구조화하세요.';
  } else if (requirementsIntent) {
    resolvedInstruction =
      '요구사항 요청으로 인식하고, 기능/비기능/제약/수용기준을 빠짐없이 구조화하세요.';
  }

  const qualityGuardrail = omitHeavyPromptDupes
    ? '[품질] 사용자 메시지에 이미 품질·형식 지시가 있으면 최우선으로 따르세요. 중복 시스템 품질 블록은 생략되었습니다.'
    : [
        '[필수] 핵심 요약(3줄 이내) 섹션을 먼저 제시하세요.',
        '[필수] 누락 가능성이 높은 항목 3개를 별도 섹션으로 제시하세요.',
        '[필수] 확실하지 않은 내용은 "확인 필요"로 명시하고 추가 확인 질문을 2개 제시하세요.',
        '[필수] 사용자의 의도와 요구사항을 정확히 파악하여 그에 맞는 형식과 스타일로 답변하세요.',
        '[필수] 매 요청마다 다른 접근 방식과 관점을 사용하여 답변의 다양성을 보장하세요.',
        '[필수] 다양한 예시와 대안을 포함하여 답변의 깊이와 유용성을 높이세요.',
      ].join('\n');

  const projectInstruction = project?.name ? `현재 프로젝트명: ${project.name}` : '';
  const parsedInputInstruction =
    explicitQuestionRequirementIntent
      ? [
          '[입력 해석]',
          '아래 사용자 입력의 질문과 요구사항을 모두 충족해야 합니다.',
          '질문:',
          parsedSections.question,
          '',
          '요구사항:',
          parsedSections.requirements,
        ].join('\n')
      : '';

  const isUrbanDomainProject =
    Array.isArray(project?.tags) &&
    (project?.tags ?? []).some((t) => /도시정비|재건축|재개발/i.test(String(t)));
  const domainInstruction = isUrbanDomainProject
    ? '도시정비/재건축/재개발 실무 맥락을 반영하세요. 인허가, 이해관계자 커뮤니케이션, 일정/비용 리스크를 반드시 포함하세요.'
    : '일반 맥락으로 작성하되 실행 순서와 책임 주체를 명확히 제시하세요.';

  const guidelineInstruction =
    Array.isArray(project?.initialGuidelines) && (project?.initialGuidelines?.length ?? 0) > 0
      ? [
          '[프로젝트 가이드라인 우선 반영]',
          '등록된 가이드라인을 우선 반영하여 답변하세요.',
          '충돌 시 우선순위: 필수 규칙 > 출력 형식 지시 > 권장 규칙.',
        ].join('\n')
      : '[프로젝트 가이드라인 우선 반영]\n등록된 가이드라인이 없으면 기본 품질 기준을 따르세요.';

  const koreanBlock =
    containsHangul(rawInput) &&
    (() => {
      const prior = extractPriorTurnsForKoContext(conversationHistory ?? []);
      const koProfile = buildKoreanUnderstandingProfile(rawInput, prior);
      const genreProf = buildGenreControlProfile(koProfile);
      return buildKoreanUnderstandingInstructionBlock(koProfile, genreProf);
    })();

  const agenticBlock =
    agenticGensparkStyle === true ? buildGensparkAgenticUserMessageAugmentation() : '';
  const deepSeekHintBlock =
    deepSeekReviewLayerHints === true
      ? [
          '[DeepSeek 검수·포맷 계층 — 내부 전용]',
          '백엔드에서 task에 따라 deepseek-chat(구조·포맷) / deepseek-reasoner(비평·논리)를 선택 호출한다.',
          '사용자에게 API 키·모델명·내부 JSON 검수 원문을 노출하지 않는다.',
        ].join('\n')
      : '';

  const instructionBlock = [
    agenticBlock ? `${agenticBlock}\n\n` : '',
    deepSeekHintBlock ? `${deepSeekHintBlock}\n\n` : '',
    koreanBlock ? `${koreanBlock}\n\n` : '',
    '[출력 형식 지시]',
    resolvedInstruction,
    '',
    '[응답 스타일 지시]',
    styleInstruction,
    perspectiveInstruction || '관점은 중립으로 유지하되 실행 가능성을 우선하세요.',
    '',
    innovativeWritingInstruction,
    '',
    '[품질 검증 지시]',
    qualityGuardrail,
    variationInstruction ? `[다양성 지시]\n${variationInstruction}` : '',
    styleLearningInstruction || '',
    '',
    guidelineInstruction,
    '',
    '[도메인 지시]',
    domainInstruction,
    projectInstruction,
    parsedInputInstruction,
  ]
    .filter(Boolean)
    .join('\n');

  return `${rawInput}\n\n${instructionBlock}`;
}

/** 백엔드 capability_help 시 전달할 기능 안내 (질문·요구 매칭용). 정보 수집·학습·정보 찾기 능력 포함 */
export const AVAILABLE_CAPABILITIES_HINT =
  '정보 수집·학습·정보 찾기: (1) 정보 수집 — 웹 검색·프로젝트 소스·대화 맥락에서 답변에 필요한 자료를 수집함. (2) 학습 — 프로젝트에 등록한 파일·지침·가이드라인을 저장·활용해 프로젝트별 지식으로 답변에 반영함. (3) 정보 찾기 — 웹 리서치(/웹검색·/검색), MD 문서 검색, 프로젝트 노트북 컨텍스트 조회로 관련 정보를 찾아 답변에 활용함. 사용 가능 기능: 웹검색(/웹검색·/검색·최신정보·뉴스·시장동향), 이미지 분석(첨부 후 설명/분석 요청), 예측·전망, 조사·검증(조사·검증·출처·근거 시 웹 리서치), 댓글 생성, 노트북 LLM(프로젝트별 학습 기반 답변). 질문/요구 유형에 맞는 형식으로 답변 생성. 단축키 ⌘F 검색 ⌘? 도움말.';

/** 요구·질문에 맞게 유연하게 생성 — context.adapt_answer_to_request 단일 소스 (ChatGPTInterface·buildUnifiedChatContext 등) - 강화 버전 */
export const ADAPT_ANSWER_TO_REQUEST_INSTRUCTION =
  '[강제 적용] 답변의 길이·형식·깊이는 사용자의 질문과 요구에 정확히 맞춰 유연하게 조절하세요. ' +
  '[필수] 글쓰기 형식(보고서·칼럼·요약·단계별 가이드·Q&A·사건조사 형식 등)과 스타일(어투·톤·길이)은 요구에 정확히 맞게 구성하고, ' +
  '[필수] 결과물의 구성(서론·본론·결론, 항목·섹션)을 질문과 요구사항에 정확히 맞게 잡으세요. 요구에 형식이 명시되면 반드시 따르세요. ' +
  '[필수] 답변 작성 시 생성로직(사실 정리→맥락·원인→분석·조사 내용→결론·시사점)을 갖추어 단계적으로 서술하세요. ' +
  '[필수] 사건조사 형식을 요청하면 개요·경과·원인 분석·관계자·결론·시사점 등 조사보고 구조에 정확히 맞게 작성하세요. ' +
  '[필수] 짧은 질문·단순 요청(예: 1+1은?, 뭐야?)에는 그 질문에 대한 직접적인 짧은 답을 먼저 제시하세요. ' +
  '[필수] 한 줄로·짧게·요약만 요청했으면 한 줄 또는 매우 짧은 답만 제시하세요. ' +
  '[필수] 반대되는 논리로만·반대 논리로 작성해달라 요청했으면 찬성 논리나 양론 정리가 아닌, 제시된 문장에 대한 반대 논리만 서술하세요. ' +
  '[필수] 찬성 논리로만·찬성 입장으로 작성해달라 요청했으면 반대 논리나 양론 정리가 아닌, 제시된 문장에 대한 찬성 논리만 서술하세요. ' +
  '[필수] 상세·분석·비교·단계별·예시를 요청하면 그에 맞게 충실히 답하고, 요구사항이 명시된 경우 형식·항목·구조를 정확히 지키세요. ' +
  '[강제] 사용자의 의도와 요구사항을 정확히 파악하여 그에 맞는 형식, 스타일, 길이, 깊이로 답변하세요. ' +
  '[강제] 매 요청마다 다른 접근 방식, 다른 논리 전개, 다른 예시를 사용하여 답변의 다양성을 보장하세요.';

/** 한 메시지에 여러 질문·요구가 있을 때(context.multi_request_mode) 백엔드·LLM이 항목별로 맞춤 처리 */
export const MULTI_REQUEST_ADAPTATION_INSTRUCTION =
  '[필수] 질문·요구·요청이 한 메시지에 함께 있으면 모두 수용하고, context.multi_request_items 번호 순서를 존중하세요. ' +
  '최종 답을 쓰기 전에 항목별 처리 순서와 서두→본문→마무리 시나리오를 짧게 정리한 뒤 전개하세요. ' +
  '각 항목마다 형식·길이·깊이·톤을 해당 내용에 맞게 조절하고, 마지막에 모든 항목이 반영된 하나의 완결된 답으로 마무리하세요. ' +
  '웹검색·조사·요약·분석 등 기능 플래그는 항목별 의도에 맞게 합쳐져 있으므로 항목 단위로 수행하세요. ' +
  '이전 턴 목차·템플릿을 복사하지 말고 이번 메시지 구성에 맞게 답 구조를 새로 잡으세요.';

/**
 * 매 응답마다 동일한 결론·문장 패턴 반복을 줄이고, 여러 관점·대안을 유도 — `buildUnifiedChatContext`에 항상 포함.
 */
export const MULTI_PERSPECTIVE_RESPONSE_INSTRUCTION =
  '[필수] 매 요청마다 이전 답·상투적 서두·동일 목차를 피하고, 서두·근거·예시·접속 순서를 바꿔 서술하세요. ' +
  '[필수] 한 관점만 고정하지 말고, 이해관계자·실무·비판(리스크) 등 서로 다른 관점을 2가지 이상 구분해 다루세요. ' +
  '[필수] 대안 시나리오·한계·반례·주의점을 최소 1개 이상 명시하세요. ' +
  '[필수] 결론이 비슷해도 근거·비유·단계는 매번 다르게 하세요.';

/**
 * API 요청용 컨텍스트 구성 (parsed_input, feature flags 등)
 */
export function buildUnifiedChatContext(
  rawInput: string,
  options?: {
    conversationHistory?: UnifiedChatConversationTurn[];
    /** true 시 Genspark식 과업·출력 순서·다단계 프롬프트 템플릿을 context에 포함 */
    agenticGensparkStyle?: boolean;
    /** true 시 DeepSeek Chat/Reasoner용 프롬프트·라우팅 힌트를 context에 포함 (v2) */
    deepSeekReviewLayerHints?: boolean;
    /**
     * true 시 Q→A 파이프라인 완료 후 DeepSeek Chat으로 초안 정리(옵트인, API 키 필요).
     * 서버 환경변수 PIPELINE_DEEPSEEK_REFINE=true 만으로도 켤 수 있음.
     */
    pipelineDeepSeekRefine?: boolean;
    /**
     * true 시 파이프라인에서 DeepSeek Reasoner 비평 JSON 생성(옵트인, API 키 필요).
     * deepSeekReviewLayerHints와 함께일 때만 `pipeline_deepseek_reasoner` 전달.
     * 서버 `PIPELINE_DEEPSEEK_REASONER=true`로도 켤 수 있음.
     */
    pipelineDeepSeekReasoner?: boolean;
    /**
     * true 시 백엔드 질문→답변 파이프라인(run_pipeline) 우선 시도.
     * agenticGensparkStyle + project.id 가 있으면 자동으로 켜짐(명시 false 아닐 때).
     */
    useQuestionAnswerPipeline?: boolean;
    /**
     * false일 때만 프로젝트 없이 Q→A 시 `qa_pipeline_allow_empty_project` 미전송.
     * 기본(미지정)은 프로젝트 없어도 백엔드 파이프라인 진입 허용.
     */
    qaPipelineAllowEmptyProject?: boolean;
    /** true 시 context.qa_pipeline_fast_path — 다단계 파이프라인 생략·직경로 우선(간결 모드) */
    pipelineFastPath?: boolean;
    /** 라우터·블루프린트·pipeline_gate와 맞춤: fast|guided|expert */
    answerMode?: 'fast' | 'guided' | 'expert';
    /** 파이프라인 web 플랜 근거로 쓸 선행 웹 요약(선택, 상한 약 12k자) */
    pipelineWebEvidence?: string;
    /** true 시 Writer 단계 LLM 다듬기 생략 */
    skipWriterLlmPolish?: boolean;
    /**
     * 검수 실패 시 Writer 1회 재작성. `false`면 환경변수가 켜져 있어도 끔.
     * 미지정 시 `REACT_APP_PIPELINE_VERIFIER_REWRITE=true`이면 Q→A 파이프라인 context에 포함.
     */
    pipelineVerifierRewrite?: boolean;
    /**
     * true 시 백엔드가 Q→A 응답 메타에 `generation_scenario`(작성 시나리오 마크다운)를 포함.
     * 미지정 시 `REACT_APP_INCLUDE_QA_GENERATION_SCENARIO=true`이면 전달.
     */
    includeGenerationScenarioInResponse?: boolean;
    /**
     * 비파이프라인·통합 LLM 경로용 작성 시나리오(마크다운). 백엔드가 `_generation_scenario_markdown`으로 승격해 `llm_service` 프리픽스에 넣음.
     */
    clientGenerationScenario?: string;
    /** `/agents?id=` 세션 — Genspark 에이전트 id별 프로필·URL을 context에 넣음 */
    gensparkRouteAgentId?: string;
    project?: {
      id?: string;
      name?: string;
      files?: Array<{ name: string; type: string }>;
      instructions?: string;
      initialGuidelines?: string[];
      tags?: string[];
    } | null;
  }
): Record<string, unknown> {
  const parsedSections = parseQuestionRequirementSections(rawInput);
  const inputIntent = parseInputIntent(rawInput);
  const featureCtx = buildFeatureContextFromMessage(rawInput);

  const parsedInput =
    parsedSections.hasBoth || inputIntent.type !== 'general'
      ? {
          question: parsedSections.question || inputIntent.question || undefined,
          requirements: parsedSections.requirements || inputIntent.requirements || undefined,
          intent_type: inputIntent.type,
          intent_confidence: inputIntent.confidence,
        }
      : undefined;

  const koCtx =
    containsHangul(rawInput) &&
    (() => {
      const prior = extractPriorTurnsForKoContext(options?.conversationHistory ?? []);
      const koreanProfile = buildKoreanUnderstandingProfile(rawInput, prior);
      const genreControl = buildGenreControlProfile(koreanProfile);
      return {
        korean_understanding: koreanProfile,
        genre_control: genreControl,
        korean_layer_instruction: buildKoreanUnderstandingInstructionBlock(
          koreanProfile,
          genreControl
        ),
        enable_korean_depth: true,
      };
    })();

  const useQaPipeline =
    options?.useQuestionAnswerPipeline === true ||
    (options?.agenticGensparkStyle === true &&
      Boolean(options?.project?.id) &&
      options?.useQuestionAnswerPipeline !== false);

  const pipelineVerifierRewriteOn =
    useQaPipeline &&
    (options?.pipelineVerifierRewrite === true ||
      (options?.pipelineVerifierRewrite !== false &&
        process.env.REACT_APP_PIPELINE_VERIFIER_REWRITE === 'true'));

  const includeGenerationScenarioInResponseOn =
    useQaPipeline &&
    (options?.includeGenerationScenarioInResponse === true ||
      (options?.includeGenerationScenarioInResponse !== false &&
        process.env.REACT_APP_INCLUDE_QA_GENERATION_SCENARIO === 'true'));

  const ctx: Record<string, unknown> = {
    ...featureCtx,
    ...(parsedInput && { parsed_input: parsedInput }),
    available_capabilities: AVAILABLE_CAPABILITIES_HINT,
    adapt_answer_to_request: ADAPT_ANSWER_TO_REQUEST_INSTRUCTION,
    multi_perspective_response: MULTI_PERSPECTIVE_RESPONSE_INSTRUCTION,
    perspective_diversity_requested: true,
    ...(featureCtx.multi_request_mode === true
      ? { multi_request_adaptation_instruction: MULTI_REQUEST_ADAPTATION_INSTRUCTION }
      : {}),
    ...(useQaPipeline && {
      use_pipeline_v2: true,
      agentic_pipeline: true,
      // 프로젝트 ID 없이 Q→A만 켠 경우(unified_chat: pk/pid 없음) 백엔드가 파이프라인 진입하도록
      ...(!options?.project?.id && options?.qaPipelineAllowEmptyProject !== false
        ? { qa_pipeline_allow_empty_project: true }
        : {}),
      ...(options?.pipelineFastPath ? { qa_pipeline_fast_path: true } : {}),
      ...(pipelineVerifierRewriteOn ? { pipeline_verifier_rewrite: true } : {}),
      ...(includeGenerationScenarioInResponseOn
        ? { include_generation_scenario_in_response: true }
        : {}),
    }),
    ...(options?.answerMode ? { answer_mode: options.answerMode } : {}),
    ...(typeof options?.pipelineWebEvidence === 'string' && coerceTrimmedString(options.pipelineWebEvidence, '')
      ? {
          pipeline_web_evidence: coerceTrimmedString(options.pipelineWebEvidence, ''),
        }
      : {}),
    ...(typeof options?.clientGenerationScenario === 'string' &&
    coerceTrimmedString(options.clientGenerationScenario, '')
      ? {
          client_generation_scenario: coerceTrimmedString(
            options.clientGenerationScenario,
            ''
          ),
        }
      : {}),
    ...(options?.skipWriterLlmPolish === true ? { pipeline_skip_writer_llm_polish: true } : {}),
    ...(options?.agenticGensparkStyle === true
      ? {
          agentic_genspark_style: true,
          ...buildGensparkAgenticContextHints(options?.gensparkRouteAgentId),
        }
      : {}),
    ...(options?.deepSeekReviewLayerHints === true
      ? {
          deepseek_review_layer_hints: true,
          ...buildDeepSeekReviewContextHints(),
          ...(options.pipelineDeepSeekRefine === true
            ? { pipeline_deepseek_refine: true }
            : {}),
          ...(options.pipelineDeepSeekReasoner === true
            ? { pipeline_deepseek_reasoner: true }
            : {}),
        }
      : {}),
    ...(koCtx || {}),
    ...(options?.conversationHistory && {
      conversation_history: options.conversationHistory,
      consistency_instruction:
        '이전 대화에서 논의된 용어·가정·결정사항을 유지하여 일관되게 답변하세요.',
    }),
  };

  if (options?.project) {
    ctx.projectId = options.project.id;
    ctx.projectName = options.project.name;
    if (options.project.files?.length) {
      ctx.project_files = options.project.files;
    }
    if (options.project.instructions) {
      ctx.project_instructions = options.project.instructions;
    }
    if (options.project.initialGuidelines?.length) {
      ctx.project_guidelines = options.project.initialGuidelines.map((raw) => {
          const m = raw.match(/^\[(필수|권장)\]\s*(.+)$/);
          return {
            level: m?.[1] === '필수' ? 'required' : 'recommended',
            text: coerceTrimmedString(m?.[2] ?? raw, ''),
          };
        });
    }
  }

  return ctx;
}
