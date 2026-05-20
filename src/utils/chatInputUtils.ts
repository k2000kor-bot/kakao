/**
 * 대화 입력·응답 처리 유틸리티
 * ChatGPTInterface에서 사용하는 순수 함수들
 */

/**
 * 전송·입력 문자열 정규화 (trim).
 * `onClick={handler}`로 SyntheticEvent가 첫 인자로 넘어와도 `.trim()`에서 터지지 않게 함.
 */
export function coerceTrimmedString(primary: unknown, fallback: unknown = ''): string {
  const raw = primary ?? fallback;
  return (typeof raw === 'string' ? raw : String(raw ?? '')).trim();
}

/**
 * 후행 공백만 제거 (`trimEnd`). 선행 들여쓰기·줄바꿈은 유지 — 구조화 입력 보조 등.
 * 비문자 primary도 `String` 변환 후 처리.
 */
export function coerceTrimmedEnd(primary: unknown, fallback: unknown = ''): string {
  const raw = primary ?? fallback;
  return (typeof raw === 'string' ? raw : String(raw ?? '')).trimEnd();
}

/** 질문·요구 파싱 결과 */
export interface ParsedQuestionRequirement {
  question: string;
  requirements: string;
  hasBoth: boolean;
}

/** 구조화 입력 미리보기 한 줄 표시 상한(가독성·오인 시 레이아웃 붕괴 방지) */
export const STRUCTURED_INPUT_PREVIEW_MAX_CHARS = 240;

/**
 * `질문:`/`요구사항:` 파싱 결과가 실제 템플릿 의도인지 판별합니다.
 * 긴 기사 붙여넣기 + 짧은 한 줄 요청처럼 한쪽만 비정형적으로 길면 구조화 assist·[입력 해석] 분할을 끕니다.
 */
export function shouldTreatAsStructuredQuestionRequirements(parsed: ParsedQuestionRequirement): boolean {
  if (!parsed.hasBoth) return false;
  const ql = parsed.question.length;
  const rl = parsed.requirements.length;
  const maxLen = Math.max(ql, rl);
  const minLen = Math.min(ql, rl);
  if (maxLen > 2800 && minLen < 200) return false;
  if (maxLen > 8000 && minLen < 500) return false;
  return true;
}

/** 미리보기 한 줄용(공백 정리 후 길이 제한) */
export function truncateStructuredInputPreviewLine(raw: string, maxLen: number = STRUCTURED_INPUT_PREVIEW_MAX_CHARS): string {
  const singleLine = coerceTrimmedString(raw, '')
    .split('\n')
    .map((line) => coerceTrimmedString(line, ''))
    .filter(Boolean)
    .join(' ');
  if (singleLine.length <= maxLen) return singleLine;
  return `${singleLine.slice(0, Math.max(0, maxLen - 1))}…`;
}

/** 입력 의도 (암시적 추론) */
export type InputIntentType = 'question' | 'requirement' | 'combined' | 'general';

/** 입력 의도 추론 결과 */
export interface ParsedInputIntent {
  type: InputIntentType;
  question?: string;
  requirements?: string;
  confidence: number; // 0~1
}

/**
 * 암시적 "질문+요구 동시 포함" 휴리스틱 적용 시 본문 길이 상한.
 * 시스템 지시문·기사 전체 붙여넣기에서 '질문'·'요구사항' 등이 산재할 때 결합 모드로 오인되는 것을 막음.
 */
export const IMPLICIT_COMBINED_INTENT_MAX_CHARS = 6000;

/**
 * 카카오톡 대화보내기(TXT) 또는 동일 규격 로그.
 * 메인 대화·노트북·다른 입력창에서 붙여넣을 때 통합 프롬프트·장르·품질 지시를 맞추기 위한 힌트.
 */
export function isLikelyKakaoTalkExportText(raw: string): boolean {
  const t = coerceTrimmedString(raw, '');
  if (!t) return false;
  if (/님과 카카오톡 대화/.test(t)) return true;
  if (/저장한 날짜\s*[:：]/.test(t)) return true;
  if (t.length < 40) return false;
  const lineRe = /^\d{4}년 \d{1,2}월 \d{1,2}일 (오전|오후) \d{1,2}:\d{2}, .+ : .+/;
  let kakaoStyleLines = 0;
  for (const line of t.split('\n')) {
    if (lineRe.test(coerceTrimmedString(line, ''))) kakaoStyleLines += 1;
    if (kakaoStyleLines >= 2) return true;
  }
  return false;
}

/**
 * `질문`·`요구사항` 정규식 의도가 둘 다 참일 때, 질문+요구 결합 프리셋을 켤지.
 * 명시적 `질문:`/`요구사항:` 헤더는 parseQuestionRequirementSections.hasBoth 로 별도 처리.
 */
export function shouldUseDualKeywordQuestionRequirementsPreset(
  rawInput: string,
  questionIntentFromRegex: boolean,
  requirementsIntentFromRegex: boolean,
): boolean {
  if (!questionIntentFromRegex || !requirementsIntentFromRegex) return false;
  return coerceTrimmedString(rawInput, '').length <= IMPLICIT_COMBINED_INTENT_MAX_CHARS;
}

/**
 * 입력에 이미 긴 지시문이 있으면 컴포저가 덧붙이는 [강제] 다양성 블록을 생략 (토큰 중복·모델 혼선 완화).
 * 카카오톡 보내기 로그는 동일 길이여도 분석·요약 요청에 통합 생성 지시를 유지(상한만 별도).
 */
export function shouldOmitComposerDiversityDirectiveBlock(rawInput: string): boolean {
  const t = coerceTrimmedString(rawInput, '');
  if (isLikelyKakaoTalkExportText(t)) {
    const forced = t.match(/\[강제\]/g);
    return t.length >= 24000 || (forced?.length ?? 0) >= 3;
  }
  if (t.length >= IMPLICIT_COMBINED_INTENT_MAX_CHARS) return true;
  const forced = t.match(/\[강제\]/g);
  return (forced?.length ?? 0) >= 3;
}

/**
 * 입력에 이미 컴포저가 덧붙이는 장문 지시(출력 형식·품질·다양성 등)가 포함된 경우.
 * 동일 블록을 다시 붙이면 토큰이 중복되어 API 타임아웃·빈 응답이 잦아짐(긴 기사+지시문 붙여넣기 시).
 */
export function userInputAlreadyContainsFullComposerInstructionBlock(rawInput: string): boolean {
  const t = coerceTrimmedString(rawInput, '');
  if (t.length < 350) return false;
  const hasOutput = /\[출력 형식 지시\]/.test(t);
  const hasQuality = /\[품질 검증 지시\]/.test(t);
  const hasFlex = /\[답변 다양성 및 유연성/.test(t);
  const forcedCount = (t.match(/\[강제\]|\[필수\]/g) ?? []).length;
  if (hasOutput && hasQuality) return true;
  if (hasFlex && forcedCount >= 3) return true;
  if (forcedCount >= 6 && t.length >= 1200) return true;
  return false;
}

/**
 * 질문/요구사항 섹션 파싱 (명시적 "질문:", "요구사항:" 헤더 또는 한 줄 슬래시 구분)
 */
export function parseQuestionRequirementSections(rawInput: string): ParsedQuestionRequirement {
  const trimmed = coerceTrimmedString(rawInput, '');
  if (!trimmed) return { question: '', requirements: '', hasBoth: false };

  const slashParts = trimmed.split(/\s*\/\s*/);
  if (slashParts.length >= 2) {
    let q = '';
    let r = '';
    for (const part of slashParts) {
      const qMatch = /^\s*(질문|문의|question)\s*[:：]\s*(.*)$/i.exec(part);
      const rMatch = /^\s*(요구사항|요구|요건|requirements?|spec)\s*[:：]\s*(.*)$/i.exec(part);
      const qPart = coerceTrimmedString(qMatch?.[2], '');
      const rPart = coerceTrimmedString(rMatch?.[2], '');
      if (qPart) q = (q ? q + '\n' : '') + qPart;
      if (rPart) r = (r ? r + '\n' : '') + rPart;
    }
    if (q || r) {
      return { question: q, requirements: r, hasBoth: q.length > 0 && r.length > 0 };
    }
  }

  const lines = trimmed.split('\n');
  let current: 'question' | 'requirements' | null = null;
  const questionLines: string[] = [];
  const requirementLines: string[] = [];

  for (const line of lines) {
    const questionHead = /^\s*(질문|문의|question)\s*[:：]\s*(.*)$/i.exec(line);
    if (questionHead) {
      current = 'question';
      const qh = coerceTrimmedString(questionHead[2], '');
      if (qh) questionLines.push(qh);
      continue;
    }
    const requirementHead = /^\s*(요구사항|요구|요건|requirements?|spec)\s*[:：]\s*(.*)$/i.exec(line);
    if (requirementHead) {
      current = 'requirements';
      const rh = coerceTrimmedString(requirementHead[2], '');
      if (rh) requirementLines.push(rh);
      continue;
    }
    if (current === 'question') questionLines.push(line);
    else if (current === 'requirements') requirementLines.push(line);
  }

  const question = coerceTrimmedString(questionLines.join('\n'), '');
  const requirements = coerceTrimmedString(requirementLines.join('\n'), '');
  return { question, requirements, hasBoth: question.length > 0 && requirements.length > 0 };
}

/** 사이드바·자동 제목 API(`max_length: 30`)와 맞춘 표시 상한 */
export const CONCISE_CONVERSATION_TITLE_MAX_LEN = 30;

/**
 * 복합 제목 라벨의 고정 토큰(슬래시로 이어 쓰는 동의어 나열). 템플릿 첫 줄·푸터 힌트·파서 슬래시 조합과 맞춥니다.
 */
const EXPLICIT_TITLE_COMPOUND_LABEL_CORE = '제목 / title / subject / topic';

/** + 메뉴 템플릿 첫 줄 — 콜론 뒤에 제목을 이어 쓰거나 비워 둠 */
export const EXPLICIT_TITLE_COMPOSER_LABEL_PREFIX = `${EXPLICIT_TITLE_COMPOUND_LABEL_CORE}: `;

/**
 * + 메뉴 «질문+요구 템플릿» — 입력이 비어 있을 때만 UI에 삽입.
 * 첫 줄은 명시 제목 라벨(제목·title·subject·topic·슬래시 조합 뒤 `:`) 형태이며, 콜론 뒤가 비어 있으면 `질문:` 등으로 오인되지 않습니다.
 */
export const QUESTION_REQUIREMENT_COMPOSER_TEMPLATE = [
  EXPLICIT_TITLE_COMPOSER_LABEL_PREFIX,
  '',
  '질문:',
  '- 해결하고 싶은 핵심 질문을 작성하세요.',
  '',
  '요구사항:',
  '- 결과물 형식(예: 표/체크리스트/회의록)',
  '- 필수 포함 항목',
  '- 톤/길이/주의사항',
].join('\n');

/** 입력창 푸터 등 — 명시 제목 라벨 안내 */
export const COMPOSER_SIDEBAR_TITLE_HINT_SNIPPET = `${EXPLICIT_TITLE_COMPOUND_LABEL_CORE}: 한 줄 — 사이드바에 짧게`;

/**
 * 같은 줄 또는 다음 줄(짧을 때만) 제목 라벨.
 * `제목:`, `title:`, `topic:`, `제목 / title / subject / topic:` 등 슬래시로 동의어를 나열한 뒤 `:` 한 번만 오는 형태도 인정.
 */
const EXPLICIT_TITLE_LABEL_LINE =
  /^(?:제목|타이틀|주제|title|subject|topic)(?:\s*\/\s*(?:제목|타이틀|주제|title|subject|topic))*\s*[:：]\s*(.*)$/i;

function isQuestionOrRequirementHeaderLine(L: string): boolean {
  return /^\s*(질문|문의|요구사항|요구|요건|requirements?|spec|question)\s*[:：]/i.test(L);
}

/**
 * 입력 앞쪽(비어 있지 않은 줄 최대 6줄)에서 명시적 제목을 뽑습니다.
 * - `제목: …`, `title: …`, `subject: …`, `topic: …`, `제목 / title / subject / topic: …` 등(같은 줄)
 * - `제목:`만 두고 다음 줄에 한 줄(질문/요구 헤더·`# ` 제목줄이 아니면 길이 무관 — 목록 표시는 concise에서 30자로 정리)
 * - 본문의 첫 비어 있지 않은 줄이 마크다운 `# 한 줄 제목`인 경우(단일 `#`만)
 */
export function extractExplicitUserTitleRaw(rawInput: string): string | null {
  const trimmed = coerceTrimmedString(rawInput, '');
  if (!trimmed) return null;
  const lines = trimmed.split('\n');
  let nonEmptyIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i].trim();
    if (!L) continue;
    nonEmptyIndex += 1;
    if (nonEmptyIndex > 6) break;
    const labeled = EXPLICIT_TITLE_LABEL_LINE.exec(L);
    if (labeled) {
      const v = coerceTrimmedString(labeled[1], '');
      if (v.length > 0) return v;
      for (let j = i + 1; j < lines.length; j++) {
        const Lj = lines[j].trim();
        if (!Lj) continue;
        if (isQuestionOrRequirementHeaderLine(Lj)) break;
        if (/^\s*#\s+/.test(Lj)) break;
        return Lj;
      }
      continue;
    }
    if (nonEmptyIndex === 1) {
      const h1 = /^\s*#\s+(.+)$/.exec(L);
      if (h1) {
        const v = coerceTrimmedString(h1[1], '');
        return v.length > 0 ? v : null;
      }
    }
  }
  return null;
}

/**
 * 사용자가 적어 둔 제목 문자열을 목록 표시용으로 짧게 정리합니다.
 */
export function conciseConversationTitleFromExplicit(
  rawTitle: string,
  maxLen: number = CONCISE_CONVERSATION_TITLE_MAX_LEN,
): string {
  const normalized = coerceTrimmedString(rawTitle, '').replace(/\s+/g, ' ');
  if (!normalized) return '';
  if (normalized.length <= maxLen) return normalized;
  const budget = Math.max(4, maxLen - 1);
  let cut = normalized.slice(0, budget);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace >= Math.floor(budget * 0.45)) {
    cut = cut.slice(0, lastSpace);
  }
  return cut.replace(/[，、,\s]+$/u, '') + '…';
}

/** 명시적 제목이 있으면 간결화한 문자열, 없으면 null */
export function getConciseConversationTitleFromUserInput(
  rawInput: string,
  maxLen: number = CONCISE_CONVERSATION_TITLE_MAX_LEN,
): string | null {
  const raw = extractExplicitUserTitleRaw(rawInput);
  if (!raw) return null;
  const c = conciseConversationTitleFromExplicit(raw, maxLen);
  return c.length > 0 ? c : null;
}

/**
 * 사이드바·세션 목록용 제목: 명시 제목 우선, 없으면 본문을 30자(+ `...`)로 잘라 표시.
 * 공백뿐이면 `새 대화`.
 */
export function conversationListTitleFromUserMessage(rawInput: string): string {
  const explicit = getConciseConversationTitleFromUserInput(rawInput);
  if (explicit) return explicit;
  const t = coerceTrimmedString(rawInput, '');
  if (!t) return '새 대화';
  if (t.length <= CONCISE_CONVERSATION_TITLE_MAX_LEN) return t;
  return `${t.substring(0, CONCISE_CONVERSATION_TITLE_MAX_LEN)}...`;
}

/** assistant 응답 기반 자동 제목(API 또는 폴백) */
export type ConversationListTitleGenerator = (
  trimmedUserMessage: string,
  assistantDisplayText: string,
) => Promise<string>;

/**
 * assistant 메시지 반영 직후 사이드바·목록용 제목.
 * `shouldUpdateTitle`이 거짓이거나 assistant 본문이 비면 `conversationTitle` 유지.
 * 명시 제목이 있으면 `generateTitle`을 호출하지 않습니다.
 */
export async function resolveListTitleAfterAssistantReply(args: {
  conversationTitle: string;
  shouldUpdateTitle: boolean;
  explicitTitleConcise: string | null;
  trimmedUserMessage: string;
  assistantDisplayText: string;
  generateTitle: ConversationListTitleGenerator;
}): Promise<string> {
  const assistantOk = coerceTrimmedString(args.assistantDisplayText, '').length > 0;
  if (!args.shouldUpdateTitle || !assistantOk) {
    return args.conversationTitle;
  }
  if (args.explicitTitleConcise) {
    return args.explicitTitleConcise;
  }
  return args.generateTitle(args.trimmedUserMessage, args.assistantDisplayText);
}

/**
 * 암시적 입력 의도 추론 (헤더 없이도 질문/요구 구분)
 */
export function parseInputIntent(rawInput: string): ParsedInputIntent {
  const trimmed = coerceTrimmedString(rawInput, '');
  if (!trimmed) return { type: 'general', confidence: 0 };

  const parsed = parseQuestionRequirementSections(trimmed);
  if (parsed.hasBoth) return { type: 'combined', question: parsed.question, requirements: parsed.requirements, confidence: 0.95 };
  if (parsed.question) return { type: 'question', question: parsed.question, confidence: 0.9 };
  if (parsed.requirements) return { type: 'requirement', requirements: parsed.requirements, confidence: 0.9 };

  const lower = trimmed.toLowerCase();
  const questionPatterns = [
    /\?\s*$/, /\?$/, /(뭐야|무엇|어떻게|왜|언제|어디|누가|몇\s*개|알려\s*줘|알려주세요|설명해\s*줘|설명해주세요|이해가\s*안\s*돼|모르겠어|뭔지|무엇인지)/i,
    /(질문|궁금|문의|인터뷰\s*질문|면담\s*질문)/i,
  ];
  // 질문·요구·요청 일반 표현(특정 사업장·도메인에 묶이지 않음)은 아래 정규식에 포함
  const requirementPatterns = [
    /(만들어\s*줘|작성해\s*줘|생성해\s*줘|정리해\s*줘|분석해\s*줘|요약해\s*줘|써\s*줘|작성해주세요|만들어주세요|생성해주세요|정리해주세요|분석해주세요|요약해주세요|써주세요)/i,
    /(요구사항|요건|명세|스펙|체크리스트|회의록|계획서|리스트|표\s*만들)/i,
    /(다음\s*형식|다음\s*형태|다음과\s*같이|형식으로|형태로)/i,
    /(요청\s*[:：]|요청\s*드립|요청합니다|요청\s*사항|부탁\s*드립|부탁합니다|필요한\s*점은|해주시면|도와\s*줘)/i,
  ];

  const hasQuestion = questionPatterns.some((p) => p.test(trimmed));
  const hasRequirement = requirementPatterns.some((p) => p.test(lower));

  if (hasQuestion && hasRequirement) {
    if (trimmed.length <= IMPLICIT_COMBINED_INTENT_MAX_CHARS) {
      return { type: 'combined', confidence: 0.75 };
    }
    return { type: 'general', confidence: 0.55 };
  }
  if (hasQuestion) return { type: 'question', confidence: 0.7 };
  if (hasRequirement) return { type: 'requirement', confidence: 0.7 };
  return { type: 'general', confidence: 0.5 };
}

/** 통합 채팅 API `context.parsed_input`에 실을 구조 */
export interface StructuredParsedInputForPipeline {
  question?: string;
  requirements?: string;
  intent_type: InputIntentType;
  intent_confidence: number;
}

/**
 * 의도 타입만 있고 질문·요구 본문이 비면 `parsed_input`을 보내지 않도록 undefined로 정리합니다.
 * (긴 붙여넣기 + 끝줄 «작성해줘» 등으로 requirement로만 분류될 때 빈 객체가 나가는 것 방지)
 */
export function omitHollowStructuredParsedInput(
  parsed: StructuredParsedInputForPipeline | undefined
): StructuredParsedInputForPipeline | undefined {
  if (!parsed) return undefined;
  const pq = coerceTrimmedString(parsed.question ?? '', '');
  const pr = coerceTrimmedString(parsed.requirements ?? '', '');
  if (!pq && !pr) return undefined;
  return {
    intent_type: parsed.intent_type,
    intent_confidence: parsed.intent_confidence,
    ...(pq ? { question: pq } : {}),
    ...(pr ? { requirements: pr } : {}),
  };
}

/** 프로젝트·에이전트 세션이 아닌 일반 채팅에서 긴 붙여넣기 시 `qa_pipeline_fast_path` 유도 */
export const PROJECTLESS_LONG_INPUT_FAST_PATH_CHARS = 3200;
/** 위보다 더 길면 무거운 에이전트 파이프라인 플래그를 끄고 fast path만 유지 */
export const PROJECTLESS_LONG_INPUT_LITE_PIPELINE_CHARS = 10000;

export interface ProjectlessLongInputPipelineFlags {
  longProjectlessFast: boolean;
  longProjectlessLite: boolean;
}

/**
 * 일반 대화(프로젝트 미선택·에이전트 라우트 아님)에서 입력 길이에 따른 파이프라인 완화 플래그.
 */
export function getProjectlessLongInputPipelineFlags(options: {
  trimmedInput: string;
  currentProjectId?: string;
  gensparkRouteAgentId?: string;
}): ProjectlessLongInputPipelineFlags {
  const inputLen = coerceTrimmedString(options.trimmedInput, '').length;
  const projectlessNoAgent = !options.currentProjectId && !options.gensparkRouteAgentId;
  return {
    longProjectlessFast: projectlessNoAgent && inputLen >= PROJECTLESS_LONG_INPUT_FAST_PATH_CHARS,
    longProjectlessLite: projectlessNoAgent && inputLen >= PROJECTLESS_LONG_INPUT_LITE_PIPELINE_CHARS,
  };
}

/** 한 메시지 안의 여러 질문·요구(번호·불릿·접속사 줄바꿈) 분리 — 항목마다 기능 플래그를 맞출 때 사용 */
export interface ParsedMultiAskItems {
  items: string[];
  /** 2개 이상 의미 있는 조각 */
  hasMultiple: boolean;
}

const MULTI_ASK_CONNECTOR_LINE = /^\s*(그리고|또한|추가로|그다음에는|다음으로|마지막으로|아울러|한편)\s*[:：]?\s*/i;

/** 질문·요구(사항)·요청(사항) 줄/인라인 라벨 — 긴 토큰을 앞에 두어 `요구`가 `요구사항`에만 매칭되지 않게 함 */
const MULTI_ASK_LABEL_HEAD =
  /^\s*(질문|요구사항|요청사항|요구|요청)\s*[:：]/i;
const MULTI_ASK_LABEL_SPLIT_LOOKAHEAD =
  /\s+(?=(?:질문|요구사항|요청사항|요구|요청)\s*[:：])/i;

/** 줄 단위 라벨로 구획된 다중 입력 */
function splitLabeledQuestionDemandRequest(text: string): string[] {
  const lines = text.split(/\n/);
  const blocks: string[] = [];
  let cur: string[] = [];
  let started = false;
  for (const line of lines) {
    const isLabel = MULTI_ASK_LABEL_HEAD.test(line);
    if (isLabel) {
      if (started && cur.length) {
        const j = coerceTrimmedString(cur.join('\n'), '');
        if (j) blocks.push(j);
      }
      cur = [line];
      started = true;
    } else if (started) {
      cur.push(line);
    }
  }
  if (started && cur.length) {
    const j = coerceTrimmedString(cur.join('\n'), '');
    if (j) blocks.push(j);
  }
  return blocks.length >= 2 ? blocks : [];
}

/** 한 줄에 `질문: … 요구: …`처럼 공백으로 이어진 라벨 다중 입력 */
function splitInlineLabeledQuestionDemandRequest(text: string): string[] {
  const t = coerceTrimmedString(text, '');
  if (!t || t.includes('\n')) return [];
  const parts = t
    .split(MULTI_ASK_LABEL_SPLIT_LOOKAHEAD)
    .map((s) => coerceTrimmedString(s, ''))
    .filter((s) => s.length >= 2);
  const labeled = parts.filter((p) => MULTI_ASK_LABEL_HEAD.test(p));
  if (labeled.length < 2) return [];
  const firstIdx = parts.findIndex((p) => MULTI_ASK_LABEL_HEAD.test(p));
  if (firstIdx > 0) {
    const preamble = parts.slice(0, firstIdx).join(' ').trim();
    if (preamble) {
      const rest = parts.slice(firstIdx);
      rest[0] = `${preamble} ${rest[0]}`.trim();
      return rest;
    }
  }
  return parts;
}

/**
 * 번호·원문자·불릿·접속사(줄 단위) 등으로 여러 요청이 섞인 입력을 나눕니다.
 * 보수적으로 동작: 애매하면 단일 항목으로 둡니다.
 */
export function parseMultiAskItems(rawInput: string): ParsedMultiAskItems {
  const trimmed = coerceTrimmedString(rawInput, '');
  if (!trimmed) return { items: [], hasMultiple: false };

  const splitNumbered = (text: string): string[] => {
    const lines = text.split(/\n/);
    const chunks: string[] = [];
    let buf: string[] = [];
    const isNumberHead = (line: string) =>
      /^\s*(?:\d+[.)]\s+|\([0-9]+\)\s+|[①②③④⑤⑥⑦⑧⑨⑩]\s*)/.test(line);

    for (const line of lines) {
      if (isNumberHead(line) && buf.length > 0) {
        const joined = coerceTrimmedString(buf.join('\n'), '');
        if (joined) chunks.push(joined);
        buf = [line];
      } else {
        buf.push(line);
      }
    }
    const last = coerceTrimmedString(buf.join('\n'), '');
    if (last) chunks.push(last);
    return chunks.map((c) => coerceTrimmedString(c.replace(/^\s*(?:\d+[.)]\s+|\([0-9]+\)\s+|[①②③④⑤⑥⑦⑧⑨⑩]\s*)/, ''), '')).filter(Boolean);
  };

  const splitBullets = (text: string): string[] => {
    const lines = text.split(/\n/).map((l) => l.trimEnd());
    const items: string[] = [];
    let cur: string[] = [];
    const isBullet = (l: string) => /^\s*[-*•·]\s+/.test(l);
    let bulletCount = 0;
    for (const line of lines) {
      if (isBullet(line)) {
        bulletCount += 1;
        if (cur.length) {
          const j = coerceTrimmedString(cur.join('\n'), '');
          if (j) items.push(j);
        }
        cur = [line.replace(/^\s*[-*•·]\s+/, '')];
      } else if (cur.length) {
        cur.push(line);
      }
    }
    if (cur.length) {
      const j = coerceTrimmedString(cur.join('\n'), '');
      if (j) items.push(j);
    }
    if (bulletCount >= 2 && items.length >= 2) return items;
    return [];
  };

  const splitConnectors = (text: string): string[] => {
    const lines = text.split(/\n/);
    const parts: string[] = [];
    let buf: string[] = [];
    for (const line of lines) {
      if (MULTI_ASK_CONNECTOR_LINE.test(line) && buf.length > 0) {
        const head = line.replace(MULTI_ASK_CONNECTOR_LINE, '');
        const prev = coerceTrimmedString(buf.join('\n'), '');
        if (prev) parts.push(prev);
        buf = head ? [head] : [];
      } else {
        buf.push(line);
      }
    }
    const tail = coerceTrimmedString(buf.join('\n'), '');
    if (tail) parts.push(tail);
    return parts.length >= 2 ? parts : [];
  };

  const numbered = splitNumbered(trimmed);
  if (numbered.length >= 2) {
    return { items: numbered, hasMultiple: true };
  }

  const labeledBlocks = splitLabeledQuestionDemandRequest(trimmed);
  if (labeledBlocks.length >= 2) {
    return { items: labeledBlocks, hasMultiple: true };
  }

  const inlineLabeled = splitInlineLabeledQuestionDemandRequest(trimmed);
  if (inlineLabeled.length >= 2) {
    return { items: inlineLabeled, hasMultiple: true };
  }

  const bullets = splitBullets(trimmed);
  if (bullets.length >= 2) {
    return { items: bullets, hasMultiple: true };
  }

  const connected = splitConnectors(trimmed);
  if (connected.length >= 2) {
    return { items: connected, hasMultiple: true };
  }

  return { items: [trimmed], hasMultiple: false };
}

export function mergeBooleanFeatureRecords(
  base: Record<string, unknown>,
  extra: Record<string, unknown>
): Record<string, unknown> {
  const out = { ...base };
  for (const [k, v] of Object.entries(extra)) {
    if (v === true) out[k] = true;
  }
  return out;
}

/**
 * 단일 블록(이미 trim)에 대한 기능 플래그만 계산 — 다중 요청 항목별 병합용
 */
function computeFeatureFlagsForTrimmedText(trimmed: string): Record<string, unknown> {
  const lower = trimmed.toLowerCase();
  const explicitWebCommands = [
    '/웹검색', '/웹 검색', '/검색', '/research', '/web', '/웹',
    '웹검색:', '웹 검색:', '검색:', 'research:', '[웹검색]', '[검색]',
  ];
  const hasExplicitWeb = explicitWebCommands.some((c) =>
    lower.startsWith(c.toLowerCase()) || lower.includes(` ${c.toLowerCase()}`)
  );
  const webSearchPatterns = [
    '검색', '찾아', '알려', '최신', '뉴스', '웹', '인터넷', '리서치', 'research',
    '검색해', '찾아줘', '알려줘', '조회', '조사', '검증', '출처', '근거',
    'deep research', '웹검색', '웹 검색', '정보', '현재', '트렌드', '동향', '시장',
    '현재 시세', '시장 동향', '최신 동향', '최신 트렌드', '최신 뉴스', '실시간',
    /* 부족한 지식 보완·관련 자료 활용을 위한 질문/설명 요청 패턴 */
    '설명해줘', '설명해', '설명해 주', '알려줘', '알려 주', '뭐야', '무엇이', '무엇인가', '무엇인지',
    '왜 ', '왜 그런', '어떻게 ', '어떻게 되', '어떻게 하', '정의', '개념', '원리', '원리가',
    '근거를', '출처를', '확인해', '확인이 필요', '소개해', '개요', '지식', '배경지식', '참고',
    '관련 자료', '관련 정보', '찾아서', '조사해서', '검색해서', '확인해서',
    '최신 정보로', '현재 기준', '출처와 함께', '근거와 함께', '참고 자료',
  ];
  const investigativePatterns = [
    '조사', '검증', '출처', '근거', '팩트', 'fact', 'verify', 'investigate',
    '근거있', '출처있', '출처 좀', '검증해', '조사해', '팩트체크', '팩트 체크',
  ];
  const commentPatterns = ['댓글', '댓글 만들어', '댓글 생성', '댓글 작성', 'comment'];
  const imageAnalysisPatterns = [
    '이미지 분석', '이미지 분석해', '사진 분석', '이미지 인식', '그림 설명', '사진 설명',
    '이 사진', '이 이미지', '사진 뭐야', '이 사진 뭐', '이 이미지 뭐',
  ];
  const predictionPatterns = [
    '예측', '품질 예측', '예측 분석', '품질 점수', '예측해', '전망', '예상', '추정', '향후',
  ];
  const capabilityHelpPatterns = [
    '기능',
    '뭐 할 수',
    '할 수 있는',
    '가능한',
    '사용법',
    '단축키',
    '⌘',
    'cmd',
    '어떤 기능',
    '지원 기능',
    '기능 목록',
    '기능 안내',
    '뭘 할 수',
  ];
  const wantsWebResearch =
    hasExplicitWeb || webSearchPatterns.some((p) => lower.includes(p));
  const wantsInvestigative = investigativePatterns.some((p) => lower.includes(p));
  const wantsCommentGeneration = commentPatterns.some((p) => lower.includes(p));
  const wantsImageAnalysis = imageAnalysisPatterns.some((p) => lower.includes(p));
  const wantsPrediction = predictionPatterns.some((p) => lower.includes(p));
  const wantsCapabilityHelp = capabilityHelpPatterns.some((p) => lower.includes(p));
  const questionLikePatterns = [
    '?', '뭐야', '무엇', '왜', '어떻게', '언제', '어디', '누가', '몇 ', '설명', '알려', '소개', '개념', '정의',
    '요약', '요약해', '비교', '비교해', '차이', '차이점', '장단점', '분석', '분석해', '정리', '정리해',
    '배경', '이유', '원인', '근거', '기준', '방법', '절차', '과정', '역할', '기능', '효과', '영향',
  ];
  /** 상세·품질 높은 생성 요청 패턴 — 검색·자료 활용·논리 구성으로 답변 품질 향상 */
  const qualitySeekingPatterns = [
    '요청',
    '요구',
    '부탁',
    '상세히', '자세히', '구체적으로', '예시와 함께', '예시 들어', '단계별', '단계별로', '논리적으로',
    '근거를 들어', '근거 있게', '검증된', '보고서', '리포트', '대안', '옵션', '권장', '추천', '판단', '의견',
    '결론', '정리하면', '요약하면', '비교하면', '분석하면', '설명 부탁', '정리 부탁', '알려 주세요', '알려줘요',
    '제대로', '좋은 답변', '품질 높은', '깊이 있는', '전문적으로', '핵심만', '요점', '포인트', '참고해서',
    '기준으로', '관점에서', '측면에서', '영향은', '장점은', '단점은', '차이는', '공통점', '차이점',
    '실무적으로', '실제 사례', '케이스', '검토해', '검토 부탁', '검토해줘', '검토해 주세요',
    '비교 검토', '검토 의견', '의견 부탁', '판단 부탁', '정리 부탁해', '요약 부탁',
  ];
  const parsedSections = parseQuestionRequirementSections(trimmed);
  const hasStructuredInput = parsedSections.hasBoth || parsedSections.question.length > 0 || parsedSections.requirements.length > 0;
  const looksLikeQuestionOrExplanation = questionLikePatterns.some((p) => lower.includes(p));
  const looksLikeQualitySeeking = qualitySeekingPatterns.some((p) => lower.includes(p));
  const out: Record<string, unknown> = {};
  if (wantsWebResearch) out.enable_web_research = true;
  if ((looksLikeQuestionOrExplanation || looksLikeQualitySeeking || hasStructuredInput) && !out.enable_web_research) out.prefer_informed_answer = true;
  if (wantsInvestigative) out.investigative_mode = true;
  if (wantsCommentGeneration) out.force_comment_generation = true;
  if (wantsImageAnalysis) out.hint_image_analysis = true;
  if (wantsPrediction) out.hint_prediction = true;
  if (wantsCapabilityHelp) out.request_capability_help = true;
  if (isLikelyKakaoTalkExportText(trimmed)) {
    const tailWindow = trimmed.slice(Math.max(0, trimmed.length - 1600));
    const transcriptTask =
      looksLikeQuestionOrExplanation ||
      looksLikeQualitySeeking ||
      /요약|정리|분석|핵심|브리핑|관계|입장|대화\s*기록|대화\s*내용|이\s*내용|찬반|동조|반대|대립|메시지\s*로부터/.test(
        tailWindow
      );
    if (transcriptTask) {
      out.prefer_informed_answer = true;
    }
    out.hint_kakao_export_transcript = true;
  }
  return out;
}

/**
 * 사용자 메시지 의도에 따라 백엔드 기능 플래그(웹검색·조사모드 등)를 반환.
 * 여러 질문·요구가 한 메시지에 있으면 항목별 플래그를 합집합(OR)하고 `multi_request_items`를 넣습니다.
 */
export function buildFeatureContextFromMessage(message: string): Record<string, unknown> {
  if (!message || typeof message !== 'string') return {};
  const trimmed = coerceTrimmedString(message, '');
  if (!trimmed) return {};
  let out: Record<string, unknown> = { ...computeFeatureFlagsForTrimmedText(trimmed) };
  const multi = parseMultiAskItems(trimmed);
  if (multi.hasMultiple && multi.items.length >= 2) {
    const capped = multi.items
      .map((s) => coerceTrimmedString(s, ''))
      .filter((s) => s.length >= 2);
    if (capped.length >= 2) {
      out = { ...out, multi_request_mode: true, multi_request_items: capped };
      for (const seg of capped) {
        out = mergeBooleanFeatureRecords(out, computeFeatureFlagsForTrimmedText(seg));
      }
    }
  }
  return out;
}

/** 입력·일회 첨부·스레드 첨부 스니펫 스캔 상한 — `buildMergedFeatureContextFromInputAndAttachments`와 전송 경로에서 공통 */
export const CHAT_FEATURE_ATTACH_CONTEXT_SCAN_MAX = 20000;

/**
 * 사용자 입력문 + 일회 첨부 본문 + 스레드 첨부 본문 스니펫으로 기능 플래그를 OR 병합.
 * 메인 전송·재생성·편집 후 전송이 동일 규칙을 쓰도록 공유합니다.
 */
export function buildMergedFeatureContextFromInputAndAttachments(options: {
  trimmedUserInput: string;
  conversationFileContent?: string;
  threadAttachedFileContents?: string | null;
}): Record<string, unknown> {
  const max = CHAT_FEATURE_ATTACH_CONTEXT_SCAN_MAX;
  const threadSnippet =
    options.threadAttachedFileContents != null && typeof options.threadAttachedFileContents === 'string'
      ? String(options.threadAttachedFileContents).slice(0, max)
      : '';
  let featureCtx: Record<string, unknown> = {
    ...(buildFeatureContextFromMessage(options.trimmedUserInput) as Record<string, unknown>),
  };
  const fileContent = options.conversationFileContent;
  if (fileContent) {
    featureCtx = mergeBooleanFeatureRecords(
      featureCtx,
      buildFeatureContextFromMessage(fileContent.slice(0, max)) as Record<string, unknown>,
    );
  }
  if (threadSnippet) {
    featureCtx = mergeBooleanFeatureRecords(
      featureCtx,
      buildFeatureContextFromMessage(threadSnippet) as Record<string, unknown>,
    );
  }
  const substantialAttachment =
    (!!fileContent && coerceTrimmedString(fileContent, '').length > 40) ||
    (!!threadSnippet && coerceTrimmedString(threadSnippet, '').length > 40);
  if (substantialAttachment) {
    featureCtx.prefer_informed_answer = true;
  }
  return featureCtx;
}

/**
 * 한국어 이해 프로필용 소스 문자열 — 짧은 질문일 때 첨부 앞부분을 포함합니다.
 */
export function buildKoreanProfileSourceStringForChat(
  trimmedUserInput: string,
  conversationFileContent?: string,
  threadAttachedSnippet?: string,
): string {
  const t = coerceTrimmedString(trimmedUserInput, '');
  if (t.length >= 500) return trimmedUserInput;
  const parts: string[] = [];
  if (t) parts.push(t);
  if (conversationFileContent) parts.push(conversationFileContent.slice(0, 8000));
  if (threadAttachedSnippet) parts.push(threadAttachedSnippet.slice(0, 8000));
  return parts.length ? parts.join('\n\n') : trimmedUserInput;
}

/** 칼럼·유시민 스타일·논설문 요청 여부 (샘플 수준 품질 지침 주입용) */
const COLUMN_STYLE_PATTERNS = [
  /칼럼\s*(으로|로)?\s*(써|작성|만들)/i,
  /유시민\s*스타일/i,
  /(해설|논설|시론|칼럼)\s*(으로|로)\s*(써|작성|만들|쓰)/i,
  /(경제|금융|정치)\s*칼럼/i,
  /분석\s*칼럼/i,
  /칼럼\s*형식/i,
  /칼럼\s*처럼/i,
];

export function detectColumnStyleIntent(rawInput: string): boolean {
  const trimmed = coerceTrimmedString(rawInput, '');
  if (!trimmed) return false;
  return COLUMN_STYLE_PATTERNS.some((p) => p.test(trimmed));
}

const RESPONSE_FALLBACK = '응답을 생성할 수 없습니다. 다시 시도해 주세요.';

/**
 * 응답 텍스트에서 프롬프트 지시사항 및 생성 로직 제거 (외부에서도 사용 가능)
 * 
 * @param text - 정리할 응답 텍스트
 * @returns 프롬프트 지시사항이 제거된 깨끗한 텍스트
 * 
 * @example
 * ```ts
 * const dirty = '답변입니다.\n\n[출력 형식 지시]\n구조화하세요.';
 * const clean = cleanResponseText(dirty);
 * // '답변입니다.'
 * ```
 */
export function cleanResponseText(text: string): string {
  if (!text || typeof text !== 'string') return text;

  /** 짧아도 `[강제]` 등 마커가 있으면 정리 필요 */
  const hasBracketMarkers =
    /\[(?:출력|응답|품질|다양성|강제|필수|도메인|스켈레톤|글쓰기|혁신적|답변\s*다|유연성)/i.test(
      text
    );

  // 매우 짧고 마커·과다 줄바꿈도 없으면 빠른 경로 (연속 \\n 3개 이상은 아래에서 정리)
  if (text.length < 20 && !hasBracketMarkers && !/\n{3,}/.test(text)) return text;

  let cleaned = text;
  
  // 프롬프트 지시사항 패턴 제거
  // 주의: 패턴 순서가 중요함 - 더 구체적인 패턴을 먼저 배치하면 성능 향상
  const promptPatterns = [
    // [출력 형식 지시], [응답 스타일 지시] 등의 섹션 제거 (더 포괄적인 패턴)
    /\[출력\s*형식\s*지시\][\s\S]*?(?=\[|$)/gi,
    /\[응답\s*스타일\s*지시\][\s\S]*?(?=\[|$)/gi,
    /\[품질\s*검증\s*지시\][\s\S]*?(?=\[|$)/gi,
    /\[혁신적\s*답변[^]]*\][\s\S]*?(?=\[|$)/gi,
    /\[글쓰기\s*품질\][\s\S]*?(?=\[|$)/gi,
    /\[다양성\s*지시\][\s\S]*?(?=\[|$)/gi,
    /\[답변\s*다양성[^]]*\][\s\S]*?(?=\[|$)/gi,
    /\[유연성[^]]*\][\s\S]*?(?=\[|$)/gi,
    /\[도메인\s*지시\][\s\S]*?(?=\[|$)/gi,
    /\[출력\s*스켈레톤\][\s\S]*?(?=\[|$)/gi,
    /\[강제\]|\[필수\]/g,
    // 생성 로직 관련 텍스트 제거
    /답변\s*생성\s*로직/gi,
    /생성\s*로직/gi,
    /질문\s*의도를\s*분석/gi,
    /가장\s*적합한\s*형식으로\s*구조화/gi,
    /의도를\s*분석해\s*가장\s*적합한/gi,
    /질문\s*의도\s*파악/gi,
    /요구사항을\s*정확히\s*파악/gi,
    // 백엔드 내부 지시사항 제거
    /실무 적용 가능한 세부 항목까지 충분히 상세히 작성하세요/gi,
    /관점은 중립으로 유지하되 실행 가능성을 우선하세요/gi,
    /논리적 구조: 전제→논리 전개→결론 순으로 설득력 있게 작성하세요/gi,
    /결론 선행: 핵심 요약[··]결론을 먼저 제시한 뒤 상세를 풀어가세요/gi,
    /독창적 관점: 흔한 수식어 대신 날카로운 관점[··]반직관적 인사이트를 포함하세요/gi,
    /수식어 지양: "혁신적", "획기적" 등 빈번한 수식어는 피하고, 구체적 근거로 대체하세요/gi,
    /핵심 요약\(3줄 이내\) 섹션을 먼저 제시하세요/gi,
    /누락 가능성이 높은 항목 \d+개를 별도 섹션으로 제시하세요/gi,
    /확실하지 않은 내용은 "확인 필요"로 명시하고 추가 확인 질문을 \d+개 제시하세요/gi,
    /실행 가능한 다음 단계 또는 구체적 액션을 \d+개 이상 제시하세요/gi,
    /근거[··]출처가 있으면 명시하세요/gi,
    /다양한 접근 방식\(이론적\/실무적\/창의적\)을 혼합하여 답변의 깊이를 높이세요/gi,
    /매 요청마다 다른 문장 구조, 다른 예시, 다른 관점을 사용하여 답변의 다양성을 극대화하세요/gi,
    /이전 답변과 완전히 다른 논리 전개 순서를 반드시 사용하세요/gi,
    /같은 구조를 반복하지 마세요/gi,
    /다양한 예시와 관점을 반드시 포함하여 답변의 깊이를 높이세요/gi,
    /사용자의 의도에 정확히 맞는 다양한 형식[^을를]*을 자동으로 감지하고 적용하세요/gi,
    /같은 질문이라도 매번 다른 접근 방식, 다른 예시, 다른 관점을 사용하여 답변의 다양성을 보장하세요/gi,
    /사용자가 명시한 형식이나 스타일이 있으면 반드시 따르되, 그 안에서도 다양한 표현과 구조를 사용하세요/gi,
    /창의적 대안과 반직관적 인사이트를 포함하여 독창적인 답변을 생성하세요/gi,
    /같은 질문에 대해 반드시 다양한 관점과 접근 방식을 사용하세요/gi,
    /이전 답변과 동일한 구조를 절대 반복하지 마세요/gi,
    /요청마다 반드시 다른 논리 전개 순서와 예시를 사용하여 답변의 다양성을 보장하세요/gi,
    /매 요청마다 다른 문장 구조, 다른 예시, 다른 관점을 사용하여 답변의 다양성을 극대화하세요/gi,
    /사용자의 질문과 요구사항을 정확히 파악하여 그에 맞는 형식, 길이, 깊이로 답변하세요/gi,
  ];
  
  // 각 패턴 제거 (여러 번 반복하여 완전히 제거)
  // 성능 최적화: 프롬프트 마커가 없으면 빠른 경로
  const hasPromptMarkers = /\[(출력|응답|품질|다양성|강제|필수|도메인|스켈레톤)/i.test(cleaned);
  // "프롬프트 지시"는 일반 문장(예: 프롬프트 지시사항이 없으므로)과 충돌해 제외
  if (
    hasPromptMarkers ||
    /(생성\s*로직|질문\s*의도를\s*분석|질문\s*의도\s*파악)/i.test(cleaned)
  ) {
    for (const pattern of promptPatterns) {
      // 패턴이 텍스트에 없으면 스킵 (성능 최적화)
      // 주의: test() 후 lastIndex를 리셋하지 않아도 replace()는 전체 문자열을 검사함
      const testPattern = new RegExp(pattern.source, pattern.flags);
      if (!testPattern.test(cleaned)) continue;
      
      let prevCleaned = cleaned;
      let iterations = 0;
      // 패턴이 더 이상 발견되지 않을 때까지 반복 (최대 5회)
      while (iterations < 5) {
        cleaned = cleaned.replace(pattern, '');
        if (cleaned === prevCleaned) break; // 변경이 없으면 종료
        prevCleaned = cleaned;
        iterations++;
      }
    }
  }

  // 빈 줄이 3개 이상 연속이면 2개로 정리 (마커 없는 본문도 항상 적용)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // 앞뒤 공백 및 빈 줄 제거
  cleaned = coerceTrimmedString(cleaned, '');
  
  // 정리 후 내용이 거의 없으면 원본 반환 (너무 많이 제거된 경우 방지)
  if (cleaned.length < text.length * 0.1 && text.length > 50) {
    // 원본의 10% 미만으로 줄어들었고 원본이 충분히 길면, 정리 과정에서 문제가 있을 수 있음
    // 하지만 여전히 기본적인 패턴은 제거
    cleaned = coerceTrimmedString(
      text
        .replace(/\[출력\s*형식\s*지시\][\s\S]*?(?=\[|$)/gi, '')
        .replace(/\[응답\s*스타일\s*지시\][\s\S]*?(?=\[|$)/gi, '')
        .replace(/\[강제\]|\[필수\]/g, ''),
      ''
    );
  }
  
  return cleaned;
}

/** 메인 대화 `ChatGPTInterface`가 보여 주는 젠스파이크형 생성 단계(플레이스홀더 문구). */
export type AssistantGenerationPhase =
  | 'analyze'
  | 'outline'
  | 'draft'
  | 'crosscheck'
  | 'verify'
  | 'retry';

/** 「최종 검토 중…」 표시 후 본문을 공개하기까지의 지연(ms). 비스트리밍·스트리밍 첫 청크 UX 공통. */
export const ASSISTANT_VERIFY_PHASE_MS = 350;

/** 젠스파이크형: 「질문 분석」 단계 최소 표시(ms). 메인 채팅·노트북·재생성·편집 공통. */
export const ASSISTANT_STREAM_PHASE_ANALYZE_MS = 800;

/** 「관점·개요 정리」 단계 최소 표시(ms). */
export const ASSISTANT_STREAM_PHASE_OUTLINE_MS = 550;

/** 젠스파이크형: 「답변 생성」 단계 최소 표시(ms). 노트북 스트리밍 순차 타이머 등. */
export const ASSISTANT_STREAM_PHASE_DRAFT_MS = 800;

/** 「다각도 점검」 단계 최소 표시(ms). */
export const ASSISTANT_STREAM_PHASE_CROSSCHECK_MS = 450;

/** @alias ASSISTANT_STREAM_PHASE_ANALYZE_MS */
export const NOTEBOOK_STREAM_PHASE_ANALYZE_MS = ASSISTANT_STREAM_PHASE_ANALYZE_MS;

/** @alias ASSISTANT_STREAM_PHASE_DRAFT_MS */
export const NOTEBOOK_STREAM_PHASE_DRAFT_MS = ASSISTANT_STREAM_PHASE_DRAFT_MS;

/** @alias ASSISTANT_STREAM_PHASE_OUTLINE_MS */
export const NOTEBOOK_STREAM_PHASE_OUTLINE_MS = ASSISTANT_STREAM_PHASE_OUTLINE_MS;

/** @alias ASSISTANT_STREAM_PHASE_CROSSCHECK_MS */
export const NOTEBOOK_STREAM_PHASE_CROSSCHECK_MS = ASSISTANT_STREAM_PHASE_CROSSCHECK_MS;

/**
 * `prefers-reduced-motion: reduce`일 때도 5단계를 짧게 순차 표시하기 위한 단계 간격(ms, 기준).
 * `durationMultiplier`와 곱해 사용합니다.
 */
export const ASSISTANT_STREAM_PHASE_REDUCED_MOTION_STEP_MS = 200;

/** 본문 공개 전 단계 문구 — 타이머·SSE `mapStreamMetadata`·`getAssistantGenerationPhase`가 동일 문자열을 씁니다. */
export const ASSISTANT_PLACEHOLDER_ANALYZING = '질문 분석 중...';
export const ASSISTANT_PLACEHOLDER_THINKING = '생각 중...';
export const ASSISTANT_PLACEHOLDER_OUTLINE = '관점·개요 정리 중...';
export const ASSISTANT_PLACEHOLDER_DRAFT = '답변 생성 중...';
export const ASSISTANT_PLACEHOLDER_CROSSCHECK = '다각도 점검 중...';
export const ASSISTANT_PLACEHOLDER_VERIFY = '최종 검토 중...';

/** 스트리밍 실패 후 비스트리밍 폴백 대기 시 어시스턴트 메시지 본문 — `getAssistantGenerationPhase`는 `재시도 중` 접두로 retry 처리 */
export const ASSISTANT_PLACEHOLDER_RETRY_NONSTREAM = '재시도 중... (비스트리밍)';

/** `GensparkGenerationStatus` retry 단계에서 단계 목록 대신 보조 설명으로 쓰는 한 줄 문구(유니코드 …) */
export const ASSISTANT_GENSPARK_STATUS_RETRY_BANNER = '비스트리밍으로 재시도 중…';

/** `GensparkGenerationStatus` 상단 헤드라인 — initial(웹검색·문서 맥락·기본) / step(재시도·진행 중) */
export const ASSISTANT_GENSPARK_STATUS_HEADLINE_INITIAL_WEB =
  '웹 검색 및 답변을 준비하는 중입니다';
export const ASSISTANT_GENSPARK_STATUS_HEADLINE_INITIAL_DOCUMENT =
  '프로젝트 자료를 읽고 답변을 준비하는 중입니다';
export const ASSISTANT_GENSPARK_STATUS_HEADLINE_INITIAL_DEFAULT =
  '질문을 이해하고 답변을 설계하는 중입니다';
export const ASSISTANT_GENSPARK_STATUS_HEADLINE_STEP_RETRY = '다시 연결하는 중입니다';
export const ASSISTANT_GENSPARK_STATUS_HEADLINE_STEP_ACTIVE = '답변을 생성하는 중입니다';

/** 5단계 목록 `ol` 접근성 라벨 */
export const ASSISTANT_GENSPARK_STEPS_ARIA_LABEL = '생성 단계';

/** Q&A 말풍선 역할 배지 — MessageItem·채팅 인터페이스 공통 */
export const ASSISTANT_GENSPARK_QA_BADGE_QUESTION = '질문';
export const ASSISTANT_GENSPARK_QA_BADGE_ANSWER = '답변';

/**
 * `pipeline_step` / `generation_step` 숫자(0~4)와 동일 순서의 본문 플레이스홀더.
 * (`ASSISTANT_GENERATION_PHASE_ORDER`·짧은 라벨 배열과 같은 길이·순서)
 */
export const ASSISTANT_PLACEHOLDER_PIPELINE_ORDER: readonly string[] = [
  ASSISTANT_PLACEHOLDER_ANALYZING,
  ASSISTANT_PLACEHOLDER_OUTLINE,
  ASSISTANT_PLACEHOLDER_DRAFT,
  ASSISTANT_PLACEHOLDER_CROSSCHECK,
  ASSISTANT_PLACEHOLDER_VERIFY,
];

/**
 * `GensparkGenerationStatus` 등 5단계 진행 UI용 짧은 라벨 (일반 대화, analyze→verify 순).
 * 메시지 본문 플레이스홀더(`ASSISTANT_PLACEHOLDER_*`)와 문구는 다르지만 단계 순서는 동일합니다.
 */
export const ASSISTANT_GENERATION_STEP_LABELS_DEFAULT = [
  '질문 분석',
  '관점·개요',
  '답변 작성',
  '다각도 점검',
  '최종 검토',
] as const;

/** 웹 검색·자료 활용 시 같은 순서의 5단계 라벨. */
export const ASSISTANT_GENERATION_STEP_LABELS_WEB_RESEARCH = [
  '검색·자료',
  '쟁점·개요',
  '답변 작성',
  '교차 점검',
  '정리·검토',
] as const;

/** 생성 단계 순서(retry 제외) — 플레이스홀더·짧은 라벨·pre-reveal 타이머와 동일 순서 */
export const ASSISTANT_GENERATION_PHASE_ORDER: readonly Exclude<
  AssistantGenerationPhase,
  'retry'
>[] = ['analyze', 'outline', 'draft', 'crosscheck', 'verify'];

/**
 * `GensparkGenerationStatus` 등 5단계 UI의 활성 스텝 인덱스(0–4).
 * `retry`는 별도 UI이므로 null — 호출부에서 보통 `-1`로 처리합니다.
 */
export function assistantGenerationPhaseToStepIndex(
  phase: AssistantGenerationPhase,
): number | null {
  if (phase === 'retry') return null;
  const i = ASSISTANT_GENERATION_PHASE_ORDER.indexOf(phase);
  return i >= 0 ? i : null;
}

/** `ASSISTANT_PLACEHOLDER_PIPELINE_ORDER`·`THINKING` → `AssistantGenerationPhase` (retry 제외) */
const ASSISTANT_PLACEHOLDER_STRING_TO_PHASE: Readonly<Record<string, AssistantGenerationPhase>> =
  (() => {
    const m: Record<string, AssistantGenerationPhase> = {};
    const phases = ASSISTANT_GENERATION_PHASE_ORDER;
    const placeholders = ASSISTANT_PLACEHOLDER_PIPELINE_ORDER;
    for (let i = 0; i < phases.length; i++) {
      m[placeholders[i]] = phases[i];
    }
    m[ASSISTANT_PLACEHOLDER_THINKING] = 'analyze';
    return m;
  })();

/**
 * 질문·요구·웹검색 등 복합 입력일 때 pre-reveal·스트리밍 중 단계 타이머를 약간 길게 잡기 위한 배율(1~1.85).
 */
export function computeAssistantPipelineDurationMultiplier(
  trimmedInput: string,
  featureFlags: {
    enable_web_research?: boolean;
    prefer_informed_answer?: boolean;
    multi_request_mode?: boolean;
  },
  structuredQuestionRequirementsAssist: boolean,
  gensparkAgentRouteSession?: boolean,
): number {
  let m = 1;
  const len = coerceTrimmedString(trimmedInput, '').length;
  if (len > 3500) m += 0.12;
  if (len > 8000) m += 0.1;
  if (featureFlags.enable_web_research) m += 0.18;
  if (featureFlags.prefer_informed_answer) m += 0.08;
  if (featureFlags.multi_request_mode) m += 0.12;
  if (structuredQuestionRequirementsAssist) m += 0.15;
  if (gensparkAgentRouteSession) m += 0.12;
  return Math.min(m, 1.85);
}

/**
 * 스트리밍 본문이 나온 뒤(`pre-reveal` 종료 후) 상단 젠스파이크 단계 바를 draft→crosscheck→verify로 순차 갱신.
 * SSE `generation_phase`가 오면 호출부에서 타이머를 취소하고 서버 값을 우선합니다.
 */
export function scheduleClientStreamingPipelinePhases(options: {
  multiplier?: number;
  onPhase: (phase: AssistantGenerationPhase) => void;
  benchmarkGenspark?: boolean;
  gensparkAgentRouteSession?: boolean;
}): () => void {
  const slow = Boolean(options.benchmarkGenspark || options.gensparkAgentRouteSession);
  const mult = Math.max(0.75, Math.min((options.multiplier ?? 1) * (slow ? 1.08 : 1), 2));
  const D0 = Math.round(650 * mult);
  const D1 = Math.round(520 * mult);
  const ids: ReturnType<typeof setTimeout>[] = [];
  options.onPhase('draft');
  ids.push(
    setTimeout(() => {
      options.onPhase('crosscheck');
    }, D0),
  );
  ids.push(
    setTimeout(() => {
      options.onPhase('verify');
    }, D0 + D1),
  );
  return () => {
    ids.forEach(clearTimeout);
  };
}

/**
 * 메인 채팅·NotebookLLM 스트리밍 공통: 본문 공개 전까지 5단계 플레이스홀더를 순차 표시한 뒤 `onReveal` 호출.
 * `prefers-reduced-motion: reduce`여도 짧은 간격으로 동일 순서를 밟아 단계 UI가 건너뛰지 않게 합니다.
 */
export function scheduleAssistantPreRevealStreamPhases(options: {
  reducedMotion: boolean;
  setPlaceholder: (text: string) => void;
  onReveal: () => void;
  /** 1=기본. 긴 입력·질문+요구·웹검색 등에서 1보다 크게 */
  durationMultiplier?: number;
  /** 에이전트·복합 맥락에서 단계 간격을 약간 넓힘 */
  benchmarkGenspark?: boolean;
  gensparkAgentRouteSession?: boolean;
}): () => void {
  const slow = Boolean(options.benchmarkGenspark || options.gensparkAgentRouteSession);
  const mult = Math.max(0.65, Math.min((options.durationMultiplier ?? 1) * (slow ? 1.08 : 1), 2));
  const ids: ReturnType<typeof setTimeout>[] = [];
  const run = (fn: () => void, delayMs: number) => {
    ids.push(setTimeout(fn, delayMs));
  };

  if (options.reducedMotion) {
    const R = Math.max(120, Math.round(ASSISTANT_STREAM_PHASE_REDUCED_MOTION_STEP_MS * mult));
    run(() => options.setPlaceholder(ASSISTANT_PLACEHOLDER_OUTLINE), R);
    run(() => options.setPlaceholder(ASSISTANT_PLACEHOLDER_DRAFT), R * 2);
    run(() => options.setPlaceholder(ASSISTANT_PLACEHOLDER_CROSSCHECK), R * 3);
    run(() => options.setPlaceholder(ASSISTANT_PLACEHOLDER_VERIFY), R * 4);
    run(() => options.onReveal(), R * 5);
    return () => {
      ids.forEach(clearTimeout);
    };
  }

  const TA = Math.round(ASSISTANT_STREAM_PHASE_ANALYZE_MS * mult);
  const TO = Math.round(ASSISTANT_STREAM_PHASE_OUTLINE_MS * mult);
  const TD = Math.round(ASSISTANT_STREAM_PHASE_DRAFT_MS * mult);
  const TC = Math.round(ASSISTANT_STREAM_PHASE_CROSSCHECK_MS * mult);
  const TV = Math.round(ASSISTANT_VERIFY_PHASE_MS * mult);
  run(() => options.setPlaceholder(ASSISTANT_PLACEHOLDER_OUTLINE), TA);
  run(() => options.setPlaceholder(ASSISTANT_PLACEHOLDER_DRAFT), TA + TO);
  run(() => options.setPlaceholder(ASSISTANT_PLACEHOLDER_CROSSCHECK), TA + TO + TD);
  run(() => options.setPlaceholder(ASSISTANT_PLACEHOLDER_VERIFY), TA + TO + TD + TC);
  run(() => options.onReveal(), TA + TO + TD + TC + TV);
  return () => {
    ids.forEach(clearTimeout);
  };
}

/**
 * 비스트리밍 API 대기 중: 초기 「질문 분석 중…」은 호출 전에 표시한 뒤,
 * `ASSISTANT_STREAM_PHASE_ANALYZE_MS`·`OUTLINE_MS` 간격으로 관점·개요 → 답변 생성 문구를 갱신합니다.
 */
export function scheduleAssistantNonStreamLoadingPhaseTimers(
  setPhaseText: (text: string) => void,
): () => void {
  const ids: ReturnType<typeof setTimeout>[] = [];
  const TNa = ASSISTANT_STREAM_PHASE_ANALYZE_MS;
  const TNo = ASSISTANT_STREAM_PHASE_OUTLINE_MS;
  ids.push(setTimeout(() => setPhaseText(ASSISTANT_PLACEHOLDER_OUTLINE), TNa));
  ids.push(setTimeout(() => setPhaseText(ASSISTANT_PLACEHOLDER_DRAFT), TNa + TNo));
  return () => {
    ids.forEach(clearTimeout);
    ids.length = 0;
  };
}

/**
 * 비스트리밍 응답 수신 후: 다각도 점검 → 최종 검토 단계를 짧게 보여 준 뒤 본문으로 바꿀 때까지의 지연.
 * 두 번째 인자는 UI 페이싱(에이전트·벤치마크)용 배율만 반영합니다.
 */
export async function runAssistantNonStreamPostResponsePhases(
  setPhaseText: (text: string) => void,
  timing?: {
    durationMultiplier?: number;
    benchmarkGenspark?: boolean;
    gensparkAgentRouteSession?: boolean;
  },
): Promise<void> {
  const mult =
    typeof timing?.durationMultiplier === 'number' && Number.isFinite(timing.durationMultiplier)
      ? Math.max(0.25, timing.durationMultiplier)
      : 1;
  const slow = Boolean(timing?.benchmarkGenspark || timing?.gensparkAgentRouteSession);
  const crossMs = Math.round(ASSISTANT_STREAM_PHASE_CROSSCHECK_MS * mult * (slow ? 1.15 : 1));
  const verifyMs = Math.round(ASSISTANT_VERIFY_PHASE_MS * mult * (slow ? 1.15 : 1));
  setPhaseText(ASSISTANT_PLACEHOLDER_CROSSCHECK);
  await new Promise<void>((resolve) => setTimeout(resolve, crossMs));
  setPhaseText(ASSISTANT_PLACEHOLDER_VERIFY);
  await new Promise<void>((resolve) => setTimeout(resolve, verifyMs));
}

/**
 * 어시스턴트 메시지 본문이 “생성 중” 플레이스홀더 문구인지 판별.
 * 빈 문자열·공백만 있으면 false. (`isAssistantGenerationStepUi`는 빈 본문에 true)
 */
export function isAssistantGenerationPlaceholder(content: string): boolean {
  return getAssistantGenerationPhase(content) !== null;
}

/** 플레이스홀더 문자열 → 단계. 일반 답변은 null. */
export function getAssistantGenerationPhase(content: string): AssistantGenerationPhase | null {
  const c = coerceTrimmedString(content, '');
  const fromPlaceholder = ASSISTANT_PLACEHOLDER_STRING_TO_PHASE[c];
  if (fromPlaceholder) return fromPlaceholder;
  if (c.startsWith('재시도 중')) return 'retry';
  return null;
}

/**
 * 빈 본문이거나 생성 플레이스홀더만 있을 때 — `AssistantGensparkBody`의 생성 UI 구간과 동일.
 * (`isAssistantGenerationPlaceholder`는 공백뿐이면 false)
 */
export function isAssistantGenerationStepUi(content: unknown): boolean {
  const body = coerceTrimmedString(content, '');
  if (!body) return true;
  return getAssistantGenerationPhase(body) !== null;
}

/**
 * SSE/JSON `metadata`에 파이프라인 단계 힌트가 있으면 컴포저 플레이스홀더 문구로 매핑.
 * 백엔드가 보내지 않으면 null — 타이머·첫 청크 기반 UX만 사용.
 */
export function mapStreamMetadataToAssistantPlaceholder(
  meta: Record<string, unknown>,
): string | null {
  const councilPhase = meta.oversight_council_phase ?? meta.pipeline_ui_phase;
  if (typeof councilPhase === 'string' && coerceTrimmedString(councilPhase, '')) {
    const cp = coerceTrimmedString(councilPhase, '').toLowerCase();
    if (/analyze|intake/.test(cp)) return ASSISTANT_PLACEHOLDER_ANALYZING;
    if (/outline|strategy|plan/.test(cp)) return ASSISTANT_PLACEHOLDER_OUTLINE;
    if (/draft|production|write/.test(cp)) return ASSISTANT_PLACEHOLDER_DRAFT;
    if (/crosscheck|critique|review/.test(cp)) return ASSISTANT_PLACEHOLDER_CROSSCHECK;
    if (/verify|integration|guardian/.test(cp)) return ASSISTANT_PLACEHOLDER_VERIFY;
  }
  const phaseRaw =
    meta.generation_phase ??
    meta.pipeline_phase ??
    meta.qa_pipeline_phase ??
    meta.pipeline_ui_phase;
  if (typeof phaseRaw === 'string' && coerceTrimmedString(phaseRaw, '')) {
    const p = coerceTrimmedString(phaseRaw, '').toLowerCase();
    if (/analyze|analysis|route|routing|plan|planning|intent|retrieve|search|research|think/.test(p)) {
      return ASSISTANT_PLACEHOLDER_ANALYZING;
    }
    if (/outline|structure|skeleton|angle|perspective|stakeholder|multi.?view/.test(p)) {
      return ASSISTANT_PLACEHOLDER_OUTLINE;
    }
    if (/draft|write|generat|tool|compose|answer/.test(p)) {
      return ASSISTANT_PLACEHOLDER_DRAFT;
    }
    if (/crosscheck|multi.?crit|red.?team|counter|debate|diverge/.test(p)) {
      return ASSISTANT_PLACEHOLDER_CROSSCHECK;
    }
    if (/verify|verif|polish|review|final|refine|critique/.test(p)) {
      return ASSISTANT_PLACEHOLDER_VERIFY;
    }
  }
  const step = meta.pipeline_step ?? meta.generation_step;
  if (typeof step === 'number' && Number.isFinite(step)) {
    const order = ASSISTANT_PLACEHOLDER_PIPELINE_ORDER;
    const idx = step <= 0 ? 0 : Math.min(step, order.length - 1);
    return order[idx] ?? null;
  }
  return null;
}

/**
 * SSE/JSON `metadata` → Genspark형 5단계 UI용 `AssistantGenerationPhase`.
 * `mapStreamMetadataToAssistantPlaceholder`와 동일 규칙(문자열 phase·pipeline_step 등).
 */
export function mapStreamMetadataToAssistantGenerationPhase(
  meta: Record<string, unknown>,
): AssistantGenerationPhase | null {
  const ph = mapStreamMetadataToAssistantPlaceholder(meta);
  if (!ph) return null;
  return getAssistantGenerationPhase(ph);
}

/**
 * localStorage 등에 생성 단계 플레이스홀더만 남은 어시스턴트 턴이 복원될 때 치환하는 고정 안내.
 * (`isAssistantGenerationPlaceholder`와 함께 사용)
 */
export const STORED_ASSISTANT_INCOMPLETE_NOTICE =
  '[이전 세션에서 저장된 미완료 응답 표시였습니다. 필요하면 다시 질문해 주세요.]';

/** 생성된 답변 필드 우선 추출 (원론적/요약용 message보다 실제 생성 본문 우선) */
function getTextFromObject(obj: Record<string, unknown>): string {
  // 생성된 답변 필드 우선 (다양한 백엔드 형식 지원)
  const generated =
    obj.generated_content ??
    obj.generated_text ??
    obj.response_text ??
    obj.answer_text ??
    obj.completion ??
    obj.output_text ??
    obj.final_response ??
    obj.assistant_response ??
    obj.llm_output ??
    obj.markdown ??
    obj.md ??
    obj.body;
  if (generated != null) {
    const s = coerceTrimmedString(generated, '');
    if (s) return s;
  }
  // 일반 응답 필드 (payload·result 등은 문자열일 때만 본문으로 간주)
  const raw =
    obj.response ??
    obj.message ??
    obj.content ??
    obj.text ??
    obj.result ??
    obj.output ??
    obj.reply ??
    obj.answer ??
    (typeof obj.payload === 'string' ? obj.payload : undefined) ??
    obj.data;
  if (raw == null) return '';
  // data가 객체 배열인 백엔드 형식 (예: data: [{ response: '…' }])
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (item != null && typeof item === 'object' && !Array.isArray(item)) {
        const nested = getTextFromObject(item as Record<string, unknown>);
        if (nested) return nested;
      } else if (typeof item === 'string' && coerceTrimmedString(item, '')) {
        return coerceTrimmedString(item, '');
      }
    }
    return '';
  }
  // 중첩된 객체인 경우 재귀적으로 탐색
  if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
    const nested = getTextFromObject(raw as Record<string, unknown>);
    if (nested) return nested;
  }
  return coerceTrimmedString(raw, '');
}

/** OpenAI 스타일 choices[0].message.content 추출 */
function getTextFromChoices(obj: Record<string, unknown>): string {
  const choices = obj.choices as unknown[] | undefined;
  if (!Array.isArray(choices) || choices.length === 0) return '';
  const first = choices[0] as Record<string, unknown> | undefined;
  if (!first || typeof first !== 'object') return '';
  const msg = first.message as Record<string, unknown> | undefined;
  if (msg && typeof msg.content === 'string') return coerceTrimmedString(msg.content, '');
  if (typeof first.text === 'string') return coerceTrimmedString(first.text, '');
  return '';
}


/**
 * API 응답에서 답변 텍스트 추출. 다양한 응답 구조 대응.
 * (axios 응답 객체 또는 백엔드 JSON 본문 직접 전달 모두 처리)
 * 프롬프트 지시사항 및 생성 로직은 자동으로 제거됩니다.
 */
export function extractResponseContent(response: unknown): string {
  if (response == null) return RESPONSE_FALLBACK;
  const r = response as { data?: unknown; status?: number } | null | undefined;
  let data = r?.data;
  if (data == null) return RESPONSE_FALLBACK;
  if (typeof data === 'string') {
    const cleaned = cleanResponseText(coerceTrimmedString(data, ''));
    return cleaned || RESPONSE_FALLBACK;
  }
  const d = data as Record<string, unknown>;
  
  // 에러 응답 처리
  if (d.success === false && typeof d.error === 'string' && coerceTrimmedString(d.error, '')) {
    return coerceTrimmedString(d.error, '');
  }
  
  // 다양한 응답 형식 지원
  let text = getTextFromObject(d);
  if (text) {
    const cleaned = cleanResponseText(text);
    return cleaned || RESPONSE_FALLBACK;
  }
  
  text = getTextFromChoices(d);
  if (text) {
    const cleaned = cleanResponseText(text);
    return cleaned || RESPONSE_FALLBACK;
  }
  
  // 중첩된 data 필드 처리
  const inner = d?.data as Record<string, unknown> | unknown[] | undefined;
  if (inner != null) {
    if (Array.isArray(inner) && inner.length > 0) {
      // 배열의 첫 번째 요소에서 텍스트 추출
      const firstItem = inner[0];
      if (typeof firstItem === 'object' && firstItem !== null) {
        text = getTextFromObject(firstItem as Record<string, unknown>) || getTextFromChoices(firstItem as Record<string, unknown>);
        if (text) {
          const cleaned = cleanResponseText(text);
          return cleaned || RESPONSE_FALLBACK;
        }
      } else if (typeof firstItem === 'string') {
        text = coerceTrimmedString(firstItem, '');
        if (text) {
          const cleaned = cleanResponseText(text);
          return cleaned || RESPONSE_FALLBACK;
        }
      }
    } else if (typeof inner === 'object' && inner !== null && !Array.isArray(inner)) {
      const innerObj = inner as Record<string, unknown>;
      text = getTextFromObject(innerObj) || getTextFromChoices(innerObj);
      if (text) {
        const cleaned = cleanResponseText(text);
        return cleaned || RESPONSE_FALLBACK;
      }
    }
  }
  
  // results 필드 처리 (일부 백엔드 형식)
  const results = d?.results as unknown[] | undefined;
  if (Array.isArray(results) && results.length > 0) {
    const firstResult = results[0];
    if (typeof firstResult === 'object' && firstResult !== null) {
      text = getTextFromObject(firstResult as Record<string, unknown>);
      if (text) {
        const cleaned = cleanResponseText(text);
        return cleaned || RESPONSE_FALLBACK;
      }
    } else if (typeof firstResult === 'string') {
      text = coerceTrimmedString(firstResult, '');
      if (text) {
        const cleaned = cleanResponseText(text);
        return cleaned || RESPONSE_FALLBACK;
      }
    }
  }
  
  return RESPONSE_FALLBACK;
}

function normalizeNextActionsArray(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out = raw
    .filter((x): x is string => typeof x === 'string' && coerceTrimmedString(x, '').length > 0)
    .map((s) => coerceTrimmedString(s, ''));
  return out.length > 0 ? out : undefined;
}

/** 스트리밍 종료 metadata 등에서 next_actions 파싱 */
export function parseNextActionsFromMetadata(metadata?: Record<string, unknown>): string[] | undefined {
  return normalizeNextActionsArray(metadata?.next_actions);
}

/** DeepSeek Reasoner 비평 JSON에서 후속 질문·요약·개선 행동을 힌트 문자열로 변환 */
export function hintsFromDeepseekCritique(critique: unknown): string[] | undefined {
  if (critique == null || typeof critique !== 'object' || Array.isArray(critique)) return undefined;
  const o = critique as Record<string, unknown>;
  const hints: string[] = [];
  const su = o.summary_for_user;
  if (typeof su === 'string' && coerceTrimmedString(su, '')) hints.push(coerceTrimmedString(su, ''));
  const fu = o.follow_up_questions;
  if (Array.isArray(fu)) {
    for (const x of fu) {
      if (typeof x === 'string' && coerceTrimmedString(x, '')) hints.push(coerceTrimmedString(x, ''));
    }
  }
  const ia = o.improvement_actions;
  if (Array.isArray(ia)) {
    for (const x of ia) {
      if (x != null && typeof x === 'object' && !Array.isArray(x)) {
        const act = (x as { action?: string }).action;
        if (typeof act === 'string' && coerceTrimmedString(act, ''))
          hints.push(coerceTrimmedString(act, ''));
      }
    }
  }
  return hints.length > 0 ? hints : undefined;
}

function normalizePipelineFollowUpQuestionStrings(val: unknown): string[] | undefined {
  if (!Array.isArray(val)) return undefined;
  const out: string[] = [];
  for (const x of val) {
    if (typeof x === 'string' && coerceTrimmedString(x, '')) {
      out.push(coerceTrimmedString(x, ''));
    }
  }
  return out.length > 0 ? out : undefined;
}

/**
 * 파이프라인 SSE/JSON 메타에서 `next_actions` + DeepSeek critique 힌트를 합쳐
 * "다음에 물어보기" 칩에 사용.
 */
export function parsePipelineFollowUpHints(metadata?: Record<string, unknown>): string[] | undefined {
  const fromNext = normalizeNextActionsArray(metadata?.next_actions);
  const fromCrit = hintsFromDeepseekCritique(metadata?.deepseek_critique);
  const fromFollowUps = normalizePipelineFollowUpQuestionStrings(metadata?.follow_up_questions);
  const merged = [...(fromNext ?? []), ...(fromCrit ?? []), ...(fromFollowUps ?? [])];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of merged) {
    const t = coerceTrimmedString(s, '');
    if (t.length < 2 || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out.length > 0 ? out : undefined;
}

function axiosResponseData(response: unknown): Record<string, unknown> | undefined {
  if (response == null || typeof response !== 'object') return undefined;
  const d = (response as { data?: unknown }).data;
  if (d != null && typeof d === 'object' && !Array.isArray(d)) return d as Record<string, unknown>;
  return undefined;
}

/**
 * 비스트리밍 대화 API 응답에서 next_actions 배열 추출 (파이프라인·백엔드 확장용)
 */
export function extractNextActionsFromChatResponse(response: unknown): string[] | undefined {
  const d = axiosResponseData(response);
  if (!d) return undefined;
  const top = normalizeNextActionsArray(d.next_actions);
  if (top) return top;
  const inner = d.data;
  if (inner != null && typeof inner === 'object' && !Array.isArray(inner)) {
    return normalizeNextActionsArray((inner as Record<string, unknown>).next_actions);
  }
  return undefined;
}

/**
 * 비스트리밍 axios 응답에서 next_actions + deepseek_critique 힌트 통합
 */
export function extractPipelineFollowUpsFromChatResponse(response: unknown): string[] | undefined {
  const d = axiosResponseData(response);
  if (!d) return undefined;
  const inner = d.data;
  const innerObj =
    inner != null && typeof inner === 'object' && !Array.isArray(inner)
      ? (inner as Record<string, unknown>)
      : undefined;
  const hints1 = parsePipelineFollowUpHints(d);
  const hints2 = innerObj ? parsePipelineFollowUpHints(innerObj) : undefined;
  const merged = [...(hints1 ?? []), ...(hints2 ?? [])];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of merged) {
    const t = coerceTrimmedString(s, '');
    if (t.length < 2 || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out.length > 0 ? out : undefined;
}

/** 파이프라인 응답·SSE 메타에서 UI용 부가 정보 */
export type PipelineMessageExtras = {
  answerBlueprintMarkdown?: string;
  /** Q→A 파이프라인 생성 시나리오(옵트인 메타, 마크다운) */
  generationScenarioMarkdown?: string;
  qaPipelineTraceId?: string;
  deepseekSeverity?: string;
  critiqueSummary?: string;
  /** Q→A 파이프라인 과업 계획 스냅샷 */
  taskPlan?: Record<string, unknown>;
  /** Verifier 요약 (verification_summary 메타) */
  verificationPass?: boolean;
  verificationSkipped?: boolean;
  verificationSkipReason?: string;
  verificationIssueCount?: number;
  verificationIssuesPreview?: string[];
  verificationFixPreview?: string[];
  /** 백엔드가 검수 이슈 반영을 위해 Writer를 1회 재실행했는지 (`verification_summary.verifier_rewrite_attempted`) */
  verifierRewriteAttempted?: boolean;
  /** 근거 커버리지 0~1 (메타 또는 task_plan) */
  evidenceCoverage?: number;
  /** 라우터 task_type (route_decision 우선, 없으면 task_plan) */
  pipelineTaskType?: string;
  /** 파이프라인 `response_alternatives` (동일 내용 다른 표현) */
  responseAlternatives?: string[];
  /** 응답·SSE 최상위 `answer_mode` 에코 (task_plan과 병행) */
  answerMode?: string;
  /** 응답·SSE 최상위 `response_style` 에코 */
  responseStyle?: string;
  /** `metadata.generation_phase` 등 파이프라인 단계 에코(비스트리밍 JSON·SSE 병합) */
  pipelineGenerationPhase?: string;
  /** 프론트 자가 개발 루프 — 품질 재생성 여부 */
  composerSelfDevelopImproved?: boolean;
  /** 자가 개발 재시도 횟수 */
  composerSelfDevelopAttempts?: number;
  /** 자가 개발 최종 품질 점수(0~100) */
  composerSelfDevelopScore?: number;
  /** 중간 관리형 답변 생성(Council) 활성 */
  composerOversightEnabled?: boolean;
  /** Council v2 5단계 협의회 */
  composerOversightCouncilV2?: boolean;
  /** 작업 항목 수 */
  composerOversightWorkItemCount?: number;
  /** 다중 요청 항목 포함 */
  composerOversightHasMultiple?: boolean;
};

/** 스트리밍·비스트리밍 소스별 메타 병합 (primary 필드 우선) */
export function mergePipelineMessageExtras(
  primary: PipelineMessageExtras,
  fallback: PipelineMessageExtras
): PipelineMessageExtras {
  return {
    critiqueSummary: primary.critiqueSummary ?? fallback.critiqueSummary,
    answerBlueprintMarkdown:
      primary.answerBlueprintMarkdown ?? fallback.answerBlueprintMarkdown,
    generationScenarioMarkdown:
      primary.generationScenarioMarkdown ?? fallback.generationScenarioMarkdown,
    qaPipelineTraceId: primary.qaPipelineTraceId ?? fallback.qaPipelineTraceId,
    deepseekSeverity: primary.deepseekSeverity ?? fallback.deepseekSeverity,
    taskPlan: primary.taskPlan ?? fallback.taskPlan,
    verificationPass: primary.verificationPass ?? fallback.verificationPass,
    verificationSkipped: primary.verificationSkipped ?? fallback.verificationSkipped,
    verificationSkipReason:
      primary.verificationSkipReason ?? fallback.verificationSkipReason,
    verificationIssueCount:
      primary.verificationIssueCount ?? fallback.verificationIssueCount,
    verificationIssuesPreview:
      primary.verificationIssuesPreview ?? fallback.verificationIssuesPreview,
    verificationFixPreview:
      primary.verificationFixPreview ?? fallback.verificationFixPreview,
    verifierRewriteAttempted:
      primary.verifierRewriteAttempted ?? fallback.verifierRewriteAttempted,
    evidenceCoverage: primary.evidenceCoverage ?? fallback.evidenceCoverage,
    pipelineTaskType: primary.pipelineTaskType ?? fallback.pipelineTaskType,
    responseAlternatives:
      primary.responseAlternatives ?? fallback.responseAlternatives,
    answerMode: primary.answerMode ?? fallback.answerMode,
    responseStyle: primary.responseStyle ?? fallback.responseStyle,
    pipelineGenerationPhase:
      primary.pipelineGenerationPhase ?? fallback.pipelineGenerationPhase,
    composerSelfDevelopImproved:
      primary.composerSelfDevelopImproved ?? fallback.composerSelfDevelopImproved,
    composerSelfDevelopAttempts:
      primary.composerSelfDevelopAttempts ?? fallback.composerSelfDevelopAttempts,
    composerSelfDevelopScore:
      primary.composerSelfDevelopScore ?? fallback.composerSelfDevelopScore,
    composerOversightEnabled:
      primary.composerOversightEnabled ?? fallback.composerOversightEnabled,
    composerOversightCouncilV2:
      primary.composerOversightCouncilV2 ?? fallback.composerOversightCouncilV2,
    composerOversightWorkItemCount:
      primary.composerOversightWorkItemCount ?? fallback.composerOversightWorkItemCount,
    composerOversightHasMultiple:
      primary.composerOversightHasMultiple ?? fallback.composerOversightHasMultiple,
  };
}

/** API metadata·task_plan에서 Council·중간 관리 extras 보강 */
function applyOversightPipelineExtrasFromMeta(
  out: PipelineMessageExtras,
  meta: Record<string, unknown>,
): void {
  if (meta.composer_oversight_enabled === true) {
    out.composerOversightEnabled = true;
  }
  if (meta.composer_oversight_council_v2 === true || meta.pipeline_oversight_council === true) {
    out.composerOversightEnabled = true;
    out.composerOversightCouncilV2 = true;
  }
  if (meta.composer_oversight_has_multiple === true) {
    out.composerOversightHasMultiple = true;
  }
  const workItems = meta.composer_oversight_work_items;
  if (Array.isArray(workItems) && workItems.length > 0) {
    out.composerOversightWorkItemCount = workItems.length;
    out.composerOversightEnabled = true;
  }
  const tp = out.taskPlan;
  if (tp && typeof tp === 'object') {
    if (tp.pipeline_oversight_council === true) {
      out.composerOversightEnabled = true;
      out.composerOversightCouncilV2 = true;
    }
    const wc = tp.oversight_work_item_count;
    if (typeof wc === 'number' && wc > 0) {
      out.composerOversightWorkItemCount = wc;
      out.composerOversightEnabled = true;
    }
  }
}

/** 스트리밍 종료 metadata 등에서 블루프린트·trace·비평 요약 추출 */
export function parsePipelineMessageExtras(
  meta?: Record<string, unknown> | null
): PipelineMessageExtras {
  if (meta == null || typeof meta !== 'object') return {};
  const out: PipelineMessageExtras = {};
  const bp = meta.answer_blueprint;
  if (typeof bp === 'string' && coerceTrimmedString(bp, '')) {
    out.answerBlueprintMarkdown = coerceTrimmedString(bp, '');
  }
  const gsc = meta.generation_scenario;
  if (typeof gsc === 'string' && coerceTrimmedString(gsc, '')) {
    out.generationScenarioMarkdown = coerceTrimmedString(gsc, '');
  }
  const tid = meta.qa_pipeline_trace_id ?? meta.trace_id;
  if (typeof tid === 'string' && coerceTrimmedString(tid, '')) {
    out.qaPipelineTraceId = coerceTrimmedString(tid, '');
  }
  const crit = meta.deepseek_critique;
  if (crit != null && typeof crit === 'object' && !Array.isArray(crit)) {
    const o = crit as Record<string, unknown>;
    const su = o.summary_for_user;
    if (typeof su === 'string' && coerceTrimmedString(su, '')) {
      out.critiqueSummary = coerceTrimmedString(su, '');
    }
    const sev = o.overall_severity;
    if (typeof sev === 'string' && coerceTrimmedString(sev, '')) {
      out.deepseekSeverity = coerceTrimmedString(sev, '').toLowerCase();
    }
  }
  const tp = meta.task_plan;
  if (tp != null && typeof tp === 'object' && !Array.isArray(tp)) {
    out.taskPlan = tp as Record<string, unknown>;
  }
  const ecm = meta.evidence_coverage;
  let evc: number | undefined;
  if (typeof ecm === 'number' && Number.isFinite(ecm)) {
    evc = ecm;
  } else if (out.taskPlan) {
    const t = out.taskPlan.evidence_coverage;
    if (typeof t === 'number' && Number.isFinite(t)) {
      evc = t;
    }
  }
  if (evc !== undefined) {
    out.evidenceCoverage = evc;
  }
  const rd = meta.route_decision;
  let taskType: string | undefined;
  if (rd != null && typeof rd === 'object' && !Array.isArray(rd)) {
    const tt = (rd as Record<string, unknown>).task_type;
    if (typeof tt === 'string' && coerceTrimmedString(tt, '')) {
      taskType = coerceTrimmedString(tt, '');
    }
  }
  if (!taskType && out.taskPlan) {
    const tt2 = out.taskPlan.task_type;
    if (typeof tt2 === 'string' && coerceTrimmedString(tt2, '')) {
      taskType = coerceTrimmedString(tt2, '');
    }
  }
  if (taskType) {
    out.pipelineTaskType = taskType;
  }
  const ra = meta.response_alternatives;
  if (Array.isArray(ra)) {
    const alts: string[] = [];
    for (const x of ra) {
      if (typeof x === 'string' && coerceTrimmedString(x, '')) {
        alts.push(coerceTrimmedString(x, ''));
      }
    }
    if (alts.length > 0) {
      out.responseAlternatives = alts;
    }
  }
  const vs = meta.verification_summary;
  if (vs != null && typeof vs === 'object' && !Array.isArray(vs)) {
    const v = vs as Record<string, unknown>;
    if (v.skipped === true) {
      out.verificationSkipped = true;
      const r = v.reason;
      if (typeof r === 'string' && coerceTrimmedString(r, '')) {
        out.verificationSkipReason = coerceTrimmedString(r, '');
      }
    } else if (typeof v.pass === 'boolean') {
      out.verificationPass = v.pass;
    }
    const ic = v.issue_count;
    if (typeof ic === 'number' && ic >= 0) {
      out.verificationIssueCount = ic;
    }
    const ip = v.issues_preview;
    if (Array.isArray(ip)) {
      out.verificationIssuesPreview = ip.filter((x): x is string => typeof x === 'string');
    }
    const fp = v.fix_actions_preview;
    if (Array.isArray(fp)) {
      out.verificationFixPreview = fp.filter((x): x is string => typeof x === 'string');
    }
    if (v.verifier_rewrite_attempted === true) {
      out.verifierRewriteAttempted = true;
    }
  }
  const vpTop = meta.verification_pass;
  if (
    typeof vpTop === 'boolean' &&
    out.verificationPass === undefined &&
    out.verificationSkipped !== true
  ) {
    out.verificationPass = vpTop;
  }
  const am = meta.answer_mode;
  if (typeof am === 'string' && coerceTrimmedString(am, '')) {
    out.answerMode = coerceTrimmedString(am, '');
  }
  const rs = meta.response_style;
  if (typeof rs === 'string' && coerceTrimmedString(rs, '')) {
    out.responseStyle = coerceTrimmedString(rs, '');
  }
  const gp =
    meta.generation_phase ??
    meta.pipeline_phase ??
    meta.qa_pipeline_phase ??
    meta.pipeline_ui_phase;
  if (typeof gp === 'string' && coerceTrimmedString(gp, '')) {
    out.pipelineGenerationPhase = coerceTrimmedString(gp, '');
  }
  applyOversightPipelineExtrasFromMeta(out, meta);
  return out;
}

export function extractPipelineMessageExtrasFromChatResponse(
  response: unknown
): PipelineMessageExtras {
  let d = axiosResponseData(response);
  if (!d && response != null && typeof response === 'object' && !Array.isArray(response)) {
    d = response as Record<string, unknown>;
  }
  if (!d) return {};
  let merged = parsePipelineMessageExtras(d as Record<string, unknown>);
  const dm = d.metadata;
  if (dm != null && typeof dm === 'object' && !Array.isArray(dm)) {
    merged = mergePipelineMessageExtras(
      parsePipelineMessageExtras(dm as Record<string, unknown>),
      merged,
    );
  }
  const inner = d.data;
  if (inner != null && typeof inner === 'object' && !Array.isArray(inner)) {
    const di = inner as Record<string, unknown>;
    merged = mergePipelineMessageExtras(parsePipelineMessageExtras(di), merged);
    const dim = di.metadata;
    if (dim != null && typeof dim === 'object' && !Array.isArray(dim)) {
      merged = mergePipelineMessageExtras(
        parsePipelineMessageExtras(dim as Record<string, unknown>),
        merged,
      );
    }
  }
  return merged;
}

export function hasPipelineExtras(ex: PipelineMessageExtras): boolean {
  const hasTask =
    ex.taskPlan != null &&
    typeof ex.taskPlan === 'object' &&
    Object.keys(ex.taskPlan).length > 0;
  const hasVer =
    ex.verificationSkipped === true ||
    ex.verificationPass === false ||
    ex.verifierRewriteAttempted === true ||
    (typeof ex.verificationIssueCount === 'number' && ex.verificationIssueCount > 0);
  const hasCov = typeof ex.evidenceCoverage === 'number' && Number.isFinite(ex.evidenceCoverage);
  const hasTaskType =
    typeof ex.pipelineTaskType === 'string' && coerceTrimmedString(ex.pipelineTaskType, '').length > 0;
  const hasAlts =
    Array.isArray(ex.responseAlternatives) && ex.responseAlternatives.length > 0;
  const hasUiModes =
    (typeof ex.answerMode === 'string' && coerceTrimmedString(ex.answerMode, '').length > 0) ||
    (typeof ex.responseStyle === 'string' && coerceTrimmedString(ex.responseStyle, '').length > 0);
  const hasPhase =
    typeof ex.pipelineGenerationPhase === 'string' &&
    coerceTrimmedString(ex.pipelineGenerationPhase, '').length > 0;
  const hasSelfDevelop =
    ex.composerSelfDevelopImproved === true ||
    (typeof ex.composerSelfDevelopAttempts === 'number' &&
      ex.composerSelfDevelopAttempts > 0);
  const hasOversight =
    ex.composerOversightEnabled === true ||
    ex.composerOversightCouncilV2 === true ||
    (typeof ex.composerOversightWorkItemCount === 'number' &&
      ex.composerOversightWorkItemCount > 0);
  return Boolean(
    ex.answerBlueprintMarkdown ||
      ex.generationScenarioMarkdown ||
      ex.qaPipelineTraceId ||
      ex.critiqueSummary ||
      ex.deepseekSeverity ||
      hasTask ||
      hasVer ||
      hasCov ||
      hasTaskType ||
      hasAlts ||
      hasUiModes ||
      hasPhase ||
      hasSelfDevelop ||
      hasOversight
  );
}

/** 직전 어시스턴트 턴의 `generationScenarioMarkdown` 승격용 (최소 필드) */
export type MessageLikeForScenarioInherit = {
  role?: string;
  sender?: string;
  pipelineExtras?: PipelineMessageExtras | null;
};

/**
 * 가장 최근 어시스턴트 메시지에 붙은 생성 시나리오 마크다운을 반환.
 * `REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO`는 호출부·merge에서 게이트.
 */
export function extractLastAssistantGenerationScenarioMarkdown(
  messages: readonly MessageLikeForScenarioInherit[]
): string | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    const isAssistant =
      m.role === 'assistant' || m.sender === 'ai' || m.sender === 'assistant';
    if (!isAssistant) continue;
    const raw = m.pipelineExtras?.generationScenarioMarkdown;
    const s = coerceTrimmedString(raw ?? '', '');
    if (s.length > 0) return s;
  }
  return undefined;
}

/** 스레드 id가 바뀔 때 입력창 하단 단계 UI 캐리오버를 지울지 */
export function shouldClearOutboundStepUiCarryoverOnThreadIdChange(
  prevId: string | undefined,
  id: string | undefined,
  skipForFork: boolean,
): boolean {
  if (skipForFork) return false;
  if (prevId === id) return false;
  if (prevId === undefined && id !== undefined) return false;
  return true;
}

/** 에이전트·웹·프로젝트 맥락에서 비스트리밍 단계 UI 간격을 넓힐지 */
export function pipelineBenchmarkPacingFromChatContext(args: {
  gensparkRouteAgentId?: string | null;
  useInformedOrSearch: boolean;
  projectId?: string | null;
}): boolean {
  if (coerceTrimmedString(args.gensparkRouteAgentId ?? '', '')) return true;
  if (args.useInformedOrSearch) return true;
  if (coerceTrimmedString(args.projectId ?? '', '')) return true;
  return false;
}

export function userMessageHasAttachmentChatHint(userText: string): boolean {
  const t = coerceTrimmedString(userText, '');
  if (!t) return false;
  return /첨부|attachment|파일\s*올|업로드|\.pdf|\.csv|\.xlsx|image:|data:image|\[image\]/i.test(t);
}

export function assistantGensparkStepUiFromUserMessage(
  userText: string,
  opts: { projectHasFiles: boolean },
): { webSearch: boolean; documentContext: boolean } {
  const feat = buildFeatureContextFromMessage(userText);
  return {
    webSearch: Boolean(feat.enable_web_research || feat.prefer_informed_answer),
    documentContext: opts.projectHasFiles,
  };
}

/** 입력창 하단 — 다중 질문·요구·요청 또는 질문+요구 구조화 시 생성 안내 문구 */
export function getComposerGenerationCaption(userText: string): string | null {
  const trimmed = coerceTrimmedString(userText, '');
  if (!trimmed) return null;

  const sections = parseQuestionRequirementSections(trimmed);
  if (sections.hasBoth || (sections.question.length > 0 && sections.requirements.length > 0)) {
    return '질문과 요구사항 블록을 구분해 순서대로 답변을 구성합니다.';
  }

  const multi = parseMultiAskItems(trimmed);
  if (multi.hasMultiple && multi.items.length >= 2) {
    return `질문·요구·요청 ${multi.items.length}건을 번호 순서대로 답변에 반영합니다.`;
  }

  return null;
}

/**
 * 스트리밍 메타로 어시스턴트 본문·`pipelineExtras.pipelineGenerationPhase` 보강.
 * 변경 없으면 null.
 */
export function patchAssistantBodyFromStreamMetadata(
  content: unknown,
  pipelineExtras: PipelineMessageExtras | undefined,
  meta: Record<string, unknown>,
): { body: string; pipelineExtras: PipelineMessageExtras } | null {
  const bodyStr = coerceTrimmedString(content, '');
  const placeholder = mapStreamMetadataToAssistantPlaceholder(meta);
  const phase = mapStreamMetadataToAssistantGenerationPhase(meta);
  const nextExtras: PipelineMessageExtras = { ...(pipelineExtras ?? {}) };
  let extrasChanged = false;
  const hasSubstantiveAnswer =
    bodyStr.length >= 24 && !isAssistantGenerationStepUi(bodyStr);
  if (phase && !hasSubstantiveAnswer) {
    const slug = phase;
    if (nextExtras.pipelineGenerationPhase !== slug) {
      nextExtras.pipelineGenerationPhase = slug;
      extrasChanged = true;
    }
  }
  let nextBody = bodyStr;
  if (placeholder && !hasSubstantiveAnswer && (isAssistantGenerationStepUi(bodyStr) || !bodyStr)) {
    nextBody = placeholder;
  }
  const bodyChanged = nextBody !== bodyStr;
  if (!bodyChanged && !extrasChanged) return null;
  return { body: nextBody, pipelineExtras: nextExtras };
}

type NonStreamTimelineOpts = {
  durationMultiplier?: number;
  benchmarkGenspark?: boolean;
  gensparkAgentRouteSession?: boolean;
};

/** 비스트리밍 요청 대기 중 단계 문구를 시간차로 갱신. `promise`는 최소 표시 시간 후 resolve. */
export function startAssistantNonStreamLoadingTimeline(
  setPhaseText: (text: string) => void,
  options: NonStreamTimelineOpts = {},
): { cancel: () => void; promise: Promise<void> } {
  const mult =
    typeof options.durationMultiplier === 'number' && Number.isFinite(options.durationMultiplier)
      ? Math.max(0.25, options.durationMultiplier)
      : 1;
  const slow = Boolean(options.benchmarkGenspark || options.gensparkAgentRouteSession);
  const analyzeMs = Math.round(ASSISTANT_STREAM_PHASE_ANALYZE_MS * mult * (slow ? 1.2 : 1));
  const outlineMs = Math.round(ASSISTANT_STREAM_PHASE_OUTLINE_MS * mult * (slow ? 1.15 : 1));
  const draftMs = Math.round(ASSISTANT_STREAM_PHASE_DRAFT_MS * mult * (slow ? 1.1 : 1));
  const ids: ReturnType<typeof setTimeout>[] = [];
  let cancelled = false;

  setPhaseText(ASSISTANT_PLACEHOLDER_ANALYZING);
  ids.push(
    setTimeout(() => {
      if (!cancelled) setPhaseText(ASSISTANT_PLACEHOLDER_OUTLINE);
    }, analyzeMs),
  );
  ids.push(
    setTimeout(() => {
      if (!cancelled) setPhaseText(ASSISTANT_PLACEHOLDER_DRAFT);
    }, analyzeMs + outlineMs),
  );

  const promise = new Promise<void>((resolve) => {
    ids.push(
      setTimeout(() => {
        if (!cancelled) resolve();
      }, analyzeMs + outlineMs + draftMs + 50),
    );
  });

  return {
    cancel: () => {
      cancelled = true;
      ids.forEach(clearTimeout);
      ids.length = 0;
    },
    promise,
  };
}
