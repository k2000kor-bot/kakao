/**
 * 한국어 이해 강화 계층 (Genspark형 파이프라인의 입력 전처리·프로필)
 *
 * - 단순 번역/언어 감지가 아니라: 생략·화행·장르·톤·관계 맥락을 구조화해 API 컨텍스트로 전달.
 * - 1단계: 휴리스틱 + 키워드 규칙. 2단계 이후: 백엔드 LLM 분류로 교체·보강 예정.
 *
 * @see docs/architecture/GENSPARK_DEEPSEEK_KOREAN_ENGINE_V3.md
 */

import { coerceTrimmedString } from './chatInputUtils';

/** 화행(말하기 행위) 추정 */
export type KoreanSpeechAct =
  | 'request'
  | 'rebuttal_request'
  | 'summarize'
  | 'rewrite'
  | 'persuade'
  | 'tone_adjust'
  | 'fact_check_neutral'
  | 'legal_style'
  | 'news_style'
  | 'chat_style'
  | 'unknown';

/** 출력 장르(채널·문체) */
export type KoreanOutputGenre =
  | 'kakao_message'
  | 'community_post'
  | 'news_article'
  | 'press_release'
  | 'notice'
  | 'administrative'
  | 'legal_memo'
  | 'business_plan'
  | 'dev_doc'
  | 'proposal'
  | 'presentation_script'
  | 'general';

export type KoreanPoliteness = 'informal' | 'semi_formal' | 'formal' | 'mixed_unspecified';

export interface KoreanUnderstandingProfile {
  normalized_input: string;
  /** 사용자에게 노출하지 말 것 — 내부 해석용 */
  corrected_candidates: string[];
  genre: KoreanOutputGenre;
  speech_act: KoreanSpeechAct;
  tone_hint: string;
  emotion_level: number;
  formality: KoreanPoliteness;
  audience_hint: string;
  relationship_context: string;
  omitted_context: string[];
  style_constraints: string[];
  safety_flags: string[];
  /** 직전 사용자/어시스턴트 턴을 참고한 생략 복원 메모 */
  ellipsis_resolution_notes: string[];
}

export interface GenreControlProfile {
  output_genre: KoreanOutputGenre;
  sentence_length: 'very_short' | 'short' | 'medium' | 'long';
  line_break_style: 'chat' | 'paragraph' | 'structured_doc';
  politeness: KoreanPoliteness;
  emphasis_style: 'neutral' | 'human_direct' | 'formal_emphasis';
  allowed_rhetoric: string[];
  disallowed_rhetoric: string[];
}

const HANGUL = /[가-힣]/;

/** 입력에 한글이 포함되는지 */
export function containsHangul(text: string): boolean {
  return typeof text === 'string' && HANGUL.test(text);
}

/**
 * 방금 추가된 사용자 메시지 직전까지의 턴에서 마지막 user/assistant 내용을 추출 (생략 복원용)
 */
export function extractPriorTurnsForKoContext(
  messages: Array<{ role: string; content: string }>
): { lastUserMessage?: string; lastAssistantMessage?: string } {
  const withoutLastUser =
    messages.length > 0 && messages[messages.length - 1]?.role === 'user'
      ? messages.slice(0, -1)
      : messages;
  let lastAssistant: string | undefined;
  let lastUser: string | undefined;
  for (let i = withoutLastUser.length - 1; i >= 0; i--) {
    const m = withoutLastUser[i];
    if (m.role === 'assistant' && lastAssistant === undefined) lastAssistant = m.content;
    if (m.role === 'user' && lastUser === undefined) lastUser = m.content;
    if (lastAssistant !== undefined && lastUser !== undefined) break;
  }
  return { lastUserMessage: lastUser, lastAssistantMessage: lastAssistant };
}

/**
 * 표면 정규화 (1차): 공백·반복·흔한 대화 패턴
 */
export function normalizeKoreanSurfaceText(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  let t = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  t = t.replace(/([ㅋㅎ])\1{3,}/g, '$1$1');
  t = t.replace(/(.)\1{4,}/g, '$1$1$1');
  t = t.replace(/[ \t]+\n/g, '\n');
  t = t.replace(/\n{3,}/g, '\n\n');
  return coerceTrimmedString(t, '');
}

function detectGenreHeuristic(text: string): KoreanOutputGenre {
  const s = text.toLowerCase();
  if (/카톡|카카오톡|톡으로|메시지로|문자로/.test(s)) return 'kakao_message';
  if (/민원|신고용|구청|시청|행정|공문/.test(s)) return 'administrative';
  if (/변호사|법률|소송|계약서|검토문|법적/.test(s)) return 'legal_memo';
  if (/기사|보도|리드문|팩트/.test(s)) return 'news_article';
  if (/보도자료|press/.test(s)) return 'press_release';
  if (/공지|안내글/.test(s)) return 'notice';
  if (/카페|커뮤니티|게시글|댓글/.test(s)) return 'community_post';
  if (/사업계획|제안서|발표|ppt|슬라이드|프레젠/.test(s)) return 'proposal';
  if (/api|프론트|백엔드|구현|코드|개발|스펙/.test(s)) return 'dev_doc';
  if (/부동산|재개발|재건축|조합|입주자|대의원/.test(s)) return 'community_post';
  return 'general';
}

function detectSpeechActHeuristic(text: string): KoreanSpeechAct {
  const s = text;
  if (/반박|반론|깨줘|뒤집어|반대로 말해/.test(s)) return 'rebuttal_request';
  if (/팩트체크|팩트 체크|중립적으로|검증/.test(s)) return 'fact_check_neutral';
  if (/요약|정리해|한줄로|짧게/.test(s)) return 'summarize';
  if (/다시 써|재작성|문체|말투|톤|딱딱|부드럽|세게|약하게/.test(s)) return 'rewrite';
  if (/설득|조합원|투표|참석/.test(s)) return 'persuade';
  if (/변호사|법률/.test(s)) return 'legal_style';
  if (/기사|보도/.test(s)) return 'news_style';
  if (/카톡|톡/.test(s)) return 'chat_style';
  if (/해줘|해주세요|부탁|작성|만들어|알려줘/.test(s)) return 'request';
  return 'unknown';
}

function detectFormality(text: string): KoreanPoliteness {
  if (/합니다\.|습니다\.|드립니다|하십시오|주시기 바랍니다/.test(text)) return 'formal';
  if (/해요|세요|죠\?|네요|어요/.test(text)) return 'semi_formal';
  if (/한다\.|해라|임|ㅋ|ㅎ|야\s|해줘$/.test(text)) return 'informal';
  return 'mixed_unspecified';
}

function detectToneHint(text: string): string {
  if (/극단|극우|극좌|공격|비아냥|조롱|냉소/.test(text)) return 'sharp_or_satirical_requested';
  if (/중립|팩트|객관/.test(text)) return 'neutral_factual';
  if (/세게|강하게|단호/.test(text)) return 'strong';
  if (/부드럽|완곡|부탁/.test(text)) return 'soft';
  if (/사람 말투|자연스럽|말하듯/.test(text)) return 'conversational_human';
  return 'unspecified';
}

function detectAudienceHint(text: string): string {
  if (/조합원|입주자|대의원/.test(text)) return 'resident_association';
  if (/고객|이용자|회원/.test(text)) return 'customers_members';
  if (/구청|시청|관공서|기관/.test(text)) return 'government';
  if (/상사|팀장|임원/.test(text)) return 'hierarchy_up';
  if (/동료|팀/.test(text)) return 'peers';
  return 'unspecified';
}

function buildSafetyFlags(text: string): string[] {
  const flags: string[] = [];
  if (/혐오|차별|폭력|살인|자살/.test(text)) flags.push('high_risk_keywords');
  if (/극우|극좌|선동/.test(text)) flags.push('political_extreme_request_review');
  return flags;
}

function ellipsisNotes(
  text: string,
  lastUserContent?: string,
  lastAssistantSnippet?: string
): string[] {
  const notes: string[] = [];
  const refersBack = /이거|이것|위 내용|아까|방금|그거|그건|이 취지|더|다시|간결하게/.test(text);
  if (refersBack) {
    notes.push(
      '사용자 표현에 지시어(이거/위 내용/다시 등)가 있음. 직전 대화의 대상을 주어·목적어로 복원해 해석할 것.'
    );
  }
  if (lastAssistantSnippet && refersBack) {
    notes.push(
      `직전 어시스턴트 응답 참고: "${lastAssistantSnippet}"`
    );
  }
  if (lastUserContent && /같은|위와|동일/.test(text)) {
    notes.push('이전 사용자 메시지와 동일 맥락으로 해석할 것.');
  }
  return notes;
}

/**
 * 대화 히스토리 일부를 넘겨 생략 복원 힌트를 강화한다.
 */
export function buildKoreanUnderstandingProfile(
  rawInput: string,
  options?: {
    lastUserMessage?: string;
    lastAssistantMessage?: string;
  }
): KoreanUnderstandingProfile {
  const normalized_input = normalizeKoreanSurfaceText(rawInput);
  const genre = detectGenreHeuristic(normalized_input);
  const speech_act = detectSpeechActHeuristic(normalized_input);
  const formality = detectFormality(normalized_input);
  const tone_hint = detectToneHint(normalized_input);
  const audience_hint = detectAudienceHint(normalized_input);
  const safety_flags = buildSafetyFlags(normalized_input);

  let emotion_level = 0.35;
  if (/분노|열받|미쳐|화나|ㅋㅋ|ㅎㅎ/.test(normalized_input)) emotion_level = 0.55;
  if (/세게|강하게|극단|비아냥|조롱/.test(normalized_input)) emotion_level = Math.max(emotion_level, 0.65);
  if (/중립|팩트|차분/.test(normalized_input)) emotion_level = 0.25;

  const style_constraints: string[] = [];
  if (genre === 'kakao_message') {
    style_constraints.push('짧은 줄·핵심 선행·과한 문어체 금지');
  }
  if (genre === 'news_article') {
    style_constraints.push('객관 서술·과장·감탄사 최소화');
  }
  if (genre === 'administrative' || genre === 'legal_memo') {
    style_constraints.push('높임·서식 일관·추정은 확인 필요로 표기');
  }

  const omitted_context: string[] = [];
  if (/이거|그거|위|아까/.test(normalized_input)) {
    omitted_context.push('대상 엔티티가 생략됨 — 대화 맥락에서 복원');
  }

  return {
    normalized_input,
    corrected_candidates: [],
    genre,
    speech_act,
    tone_hint,
    emotion_level,
    formality,
    audience_hint,
    relationship_context: audience_hint,
    omitted_context,
    style_constraints,
    safety_flags,
    ellipsis_resolution_notes: ellipsisNotes(
      normalized_input,
      options?.lastUserMessage,
      options?.lastAssistantMessage
    ),
  };
}

/** 장르에 맞는 출력 제어 프로필 */
export function buildGenreControlProfile(profile: KoreanUnderstandingProfile): GenreControlProfile {
  const g = profile.genre;
  if (g === 'kakao_message') {
    return {
      output_genre: g,
      sentence_length: 'short',
      line_break_style: 'chat',
      politeness: profile.formality === 'informal' ? 'semi_formal' : profile.formality,
      emphasis_style: 'human_direct',
      allowed_rhetoric: ['호소', '강조', '우려'],
      disallowed_rhetoric: ['번역투', '과도한 피동', '장문 수식'],
    };
  }
  if (g === 'news_article' || g === 'press_release') {
    return {
      output_genre: g,
      sentence_length: 'medium',
      line_break_style: 'paragraph',
      politeness: 'formal',
      emphasis_style: 'neutral',
      allowed_rhetoric: ['사실 전달', '인용 구조'],
      disallowed_rhetoric: ['구어체 남발', '감정 과장'],
    };
  }
  if (g === 'administrative' || g === 'legal_memo') {
    return {
      output_genre: g,
      sentence_length: 'medium',
      line_break_style: 'structured_doc',
      politeness: 'formal',
      emphasis_style: 'formal_emphasis',
      allowed_rhetoric: ['조건', '요건', '기한'],
      disallowed_rhetoric: ['비속어', '추측을 단정'],
    };
  }
  return {
    output_genre: g === 'general' ? 'general' : g,
    sentence_length: 'medium',
    line_break_style: 'paragraph',
    politeness: profile.formality,
    emphasis_style: 'neutral',
    allowed_rhetoric: ['명확한 결론', '실행 가능한 문장'],
    disallowed_rhetoric: ['번역투', '조사 반복'],
  };
}

/**
 * 모델에만 전달할 내부 지시(사용자 UI에 출력 금지 — 백엔드 정책과 합의).
 */
export function buildKoreanUnderstandingInstructionBlock(
  profile: KoreanUnderstandingProfile,
  genreProfile: GenreControlProfile
): string {
  const json = JSON.stringify(
    {
      korean_profile: profile,
      genre_control: genreProfile,
    },
    null,
    0
  );

  return [
    '[한국어 이해·출력 계층 — 내부 전용]',
    '다음 JSON은 입력 해석 결과다. 사용자에게 이 JSON이나 섹션 제목을 출력하지 말 것.',
    '규칙:',
    '1) 생략된 주어·목적어·대상은 대화 맥락과 아래 notes로 복원해 해석할 것.',
    '2) speech_act·genre·politeness에 맞춰 문장 호흡·높임말·줄바꿈을 통일할 것.',
    '3) 부동산·행정·법률 등 혼합 도메인은 사실 단정을 피하고 확인 필요를 명시할 것.',
    '4) safety_flags가 있으면 정책 준수를 최우선으로 하고, 위험한 요청은 거절·완화할 것.',
    json,
  ].join('\n');
}
