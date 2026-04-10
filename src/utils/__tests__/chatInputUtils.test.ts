/**
 * chatInputUtils 유닛 테스트
 */
import {
  buildFeatureContextFromMessage,
  extractResponseContent,
  extractNextActionsFromChatResponse,
  extractPipelineFollowUpsFromChatResponse,
  parseNextActionsFromMetadata,
  parsePipelineFollowUpHints,
  hintsFromDeepseekCritique,
  parsePipelineMessageExtras,
  extractPipelineMessageExtrasFromChatResponse,
  mergePipelineMessageExtras,
  hasPipelineExtras,
  extractLastAssistantGenerationScenarioMarkdown,
  cleanResponseText,
  parseQuestionRequirementSections,
  shouldTreatAsStructuredQuestionRequirements,
  truncateStructuredInputPreviewLine,
  STRUCTURED_INPUT_PREVIEW_MAX_CHARS,
  parseInputIntent,
  omitHollowStructuredParsedInput,
  getProjectlessLongInputPipelineFlags,
  PROJECTLESS_LONG_INPUT_FAST_PATH_CHARS,
  PROJECTLESS_LONG_INPUT_LITE_PIPELINE_CHARS,
  IMPLICIT_COMBINED_INTENT_MAX_CHARS,
  shouldOmitComposerDiversityDirectiveBlock,
  userInputAlreadyContainsFullComposerInstructionBlock,
  mapStreamMetadataToAssistantPlaceholder,
  parseMultiAskItems,
  detectColumnStyleIntent,
  coerceTrimmedString,
  coerceTrimmedEnd,
  extractExplicitUserTitleRaw,
  conciseConversationTitleFromExplicit,
  getConciseConversationTitleFromUserInput,
  conversationListTitleFromUserMessage,
  resolveListTitleAfterAssistantReply,
  QUESTION_REQUIREMENT_COMPOSER_TEMPLATE,
  EXPLICIT_TITLE_COMPOSER_LABEL_PREFIX,
  COMPOSER_SIDEBAR_TITLE_HINT_SNIPPET,
  CONCISE_CONVERSATION_TITLE_MAX_LEN,
  getAssistantGenerationPhase,
  isAssistantGenerationPlaceholder,
  isAssistantGenerationStepUi,
  STORED_ASSISTANT_INCOMPLETE_NOTICE,
  ASSISTANT_VERIFY_PHASE_MS,
  NOTEBOOK_STREAM_PHASE_ANALYZE_MS,
  NOTEBOOK_STREAM_PHASE_DRAFT_MS,
  NOTEBOOK_STREAM_PHASE_OUTLINE_MS,
  NOTEBOOK_STREAM_PHASE_CROSSCHECK_MS,
  ASSISTANT_STREAM_PHASE_ANALYZE_MS,
  ASSISTANT_STREAM_PHASE_DRAFT_MS,
  ASSISTANT_STREAM_PHASE_OUTLINE_MS,
  ASSISTANT_STREAM_PHASE_CROSSCHECK_MS,
  scheduleAssistantPreRevealStreamPhases,
  scheduleClientStreamingPipelinePhases,
  computeAssistantPipelineDurationMultiplier,
  scheduleAssistantNonStreamLoadingPhaseTimers,
  runAssistantNonStreamPostResponsePhases,
  ASSISTANT_PLACEHOLDER_ANALYZING,
  ASSISTANT_PLACEHOLDER_THINKING,
  ASSISTANT_PLACEHOLDER_OUTLINE,
  ASSISTANT_PLACEHOLDER_DRAFT,
  ASSISTANT_PLACEHOLDER_CROSSCHECK,
  ASSISTANT_PLACEHOLDER_VERIFY,
  ASSISTANT_PLACEHOLDER_RETRY_NONSTREAM,
  ASSISTANT_GENSPARK_STATUS_RETRY_BANNER,
  ASSISTANT_GENSPARK_STATUS_HEADLINE_INITIAL_DEFAULT,
  ASSISTANT_GENSPARK_STATUS_HEADLINE_INITIAL_DOCUMENT,
  ASSISTANT_GENSPARK_STATUS_HEADLINE_INITIAL_WEB,
  ASSISTANT_GENSPARK_STATUS_HEADLINE_STEP_ACTIVE,
  ASSISTANT_GENSPARK_STATUS_HEADLINE_STEP_RETRY,
  ASSISTANT_GENSPARK_STEPS_ARIA_LABEL,
  ASSISTANT_GENSPARK_QA_BADGE_QUESTION,
  ASSISTANT_GENSPARK_QA_BADGE_ANSWER,
  ASSISTANT_GENERATION_STEP_LABELS_DEFAULT,
  ASSISTANT_GENERATION_STEP_LABELS_WEB_RESEARCH,
  ASSISTANT_GENERATION_PHASE_ORDER,
  assistantGenerationPhaseToStepIndex,
  ASSISTANT_PLACEHOLDER_PIPELINE_ORDER,
} from '../chatInputUtils';
import { DEFAULT_CHAT_RESPONSE_STYLE } from '../modernChatUrlStyle';

describe('coerceTrimmedEnd', () => {
  it('후행 공백만 제거한다', () => {
    expect(coerceTrimmedEnd('  hello  ')).toBe('  hello');
    expect(coerceTrimmedEnd('a\n\n  \t')).toBe('a');
  });
  it('비문자는 String 변환 후 trimEnd', () => {
    expect(coerceTrimmedEnd(String(99))).toBe('99');
  });
});

describe('coerceTrimmedString', () => {
  it('문자열을 trim한다', () => {
    expect(coerceTrimmedString('  a  ')).toBe('a');
  });
  it('primary가 비어 있으면 fallback을 사용한다', () => {
    expect(coerceTrimmedString(undefined, '  x  ')).toBe('x');
    expect(coerceTrimmedString(null, 'y')).toBe('y');
  });
  it('숫자 등은 String 변환 후 trim', () => {
    expect(coerceTrimmedString(String(42))).toBe('42');
  });
  it('객체도 예외 없이 문자열화', () => {
    expect(coerceTrimmedString(String({}), '')).toBe('[object Object]');
  });
});

describe('parseMultiAskItems', () => {
  it('빈 입력은 단일·비다중', () => {
    expect(parseMultiAskItems('')).toEqual({ items: [], hasMultiple: false });
    expect(parseMultiAskItems('   ')).toEqual({ items: [], hasMultiple: false });
  });

  it('번호 목록으로 여러 항목 인식', () => {
    const r = parseMultiAskItems('1. A요약해줘\n2. B최신 뉴스 검색해줘');
    expect(r.hasMultiple).toBe(true);
    expect(r.items.length).toBe(2);
    expect(r.items[0]).toContain('A');
    expect(r.items[1]).toContain('B');
  });

  it('불릿 줄로 여러 항목 인식', () => {
    const r = parseMultiAskItems('- 출처 검증해줘\n- 댓글 만들어줘');
    expect(r.hasMultiple).toBe(true);
    expect(r.items.length).toBe(2);
  });

  it('접속사 줄로 분리', () => {
    const r = parseMultiAskItems('첫 요청 요약해줘\n그리고: 두 번째는 비교해줘');
    expect(r.hasMultiple).toBe(true);
    expect(r.items.length).toBe(2);
  });

  it('질문·요구·요청 라벨 줄로 분리', () => {
    const r = parseMultiAskItems(
      '질문: 이게 뭔가요?\n요구: 세 문장으로 요약\n요청: 한국어로'
    );
    expect(r.hasMultiple).toBe(true);
    expect(r.items.length).toBe(3);
    expect(r.items[0]).toMatch(/질문/i);
    expect(r.items[1]).toMatch(/요구/i);
    expect(r.items[2]).toMatch(/요청/i);
  });

  it('질문·요구사항 라벨 줄로 분리 (merge 테스트와 동일 계열)', () => {
    const r = parseMultiAskItems('질문: a\n요구사항: b');
    expect(r.hasMultiple).toBe(true);
    expect(r.items.length).toBe(2);
    expect(r.items[0]).toContain('질문');
    expect(r.items[1]).toContain('요구사항');
  });

  it('한 줄에 질문·요구 라벨 인라인 분리', () => {
    const r = parseMultiAskItems('질문: 정의만 요구: 예시 두 개');
    expect(r.hasMultiple).toBe(true);
    expect(r.items.length).toBe(2);
    expect(r.items[0]).toMatch(/질문/i);
    expect(r.items[1]).toMatch(/요구/i);
  });

  it('한 줄 인라인 — 앞 문장은 첫 라벨 블록에 합침', () => {
    const r = parseMultiAskItems('참고해서 질문: A인가 요구: B로 정리');
    expect(r.hasMultiple).toBe(true);
    expect(r.items.length).toBe(2);
    expect(r.items[0]).toContain('참고해서');
    expect(r.items[0]).toContain('질문');
    expect(r.items[1]).toContain('요구');
  });
});

describe('buildFeatureContextFromMessage', () => {
  it('여러 항목 시 플래그 합집합·multi_request_mode', () => {
    const ctx = buildFeatureContextFromMessage(
      '1. 출처 검증해줘\n2. 댓글 만들어줘'
    );
    expect(ctx.multi_request_mode).toBe(true);
    expect(Array.isArray(ctx.multi_request_items)).toBe(true);
    expect(Array.isArray(ctx.multi_request_items) ? ctx.multi_request_items.length : 0).toBeGreaterThanOrEqual(2);
    expect(ctx.investigative_mode).toBe(true);
    expect(ctx.force_comment_generation).toBe(true);
  });

  it('빈 문자열·nullish 입력 시 빈 객체 반환', () => {
    expect(buildFeatureContextFromMessage('')).toEqual({});
    expect(buildFeatureContextFromMessage('   ')).toEqual({});
    // @ts-expect-error 런타임에서 null 전달 허용 여부
    expect(buildFeatureContextFromMessage(null)).toEqual({});
  });

  it('웹검색 슬래시 명령어 시 enable_web_research 설정', () => {
    expect(buildFeatureContextFromMessage('/웹검색 오늘 날씨')).toEqual({
      enable_web_research: true,
    });
    expect(buildFeatureContextFromMessage('/검색 재건축')).toEqual({
      enable_web_research: true,
    });
    expect(buildFeatureContextFromMessage('/web AI news')).toEqual({
      enable_web_research: true,
    });
  });

  it('웹검색 패턴 포함 시 enable_web_research 설정', () => {
    expect(buildFeatureContextFromMessage('최신 뉴스 검색해줘')).toEqual({
      enable_web_research: true,
    });
    expect(buildFeatureContextFromMessage('인터넷에서 찾아줘')).toEqual({
      enable_web_research: true,
    });
    expect(buildFeatureContextFromMessage('트렌드 정보 알려줘')).toEqual({
      enable_web_research: true,
    });
    expect(buildFeatureContextFromMessage('시장 동향 알려줘')).toEqual({
      enable_web_research: true,
    });
    expect(buildFeatureContextFromMessage('현재 시세 조회')).toEqual({
      enable_web_research: true,
    });
  });

  it('조사·검증 패턴 시 investigative_mode 설정', () => {
    expect(buildFeatureContextFromMessage('출처 좀 알려줘')).toEqual({
      enable_web_research: true,
      investigative_mode: true,
    });
    expect(buildFeatureContextFromMessage('근거 검증해줘')).toEqual({
      enable_web_research: true,
      investigative_mode: true,
    });
    expect(buildFeatureContextFromMessage('fact check 해줘')).toEqual({
      investigative_mode: true,
    });
    expect(buildFeatureContextFromMessage('팩트체크 해줘')).toEqual({
      investigative_mode: true,
    });
  });

  it('댓글 생성 패턴 시 force_comment_generation 설정', () => {
    expect(buildFeatureContextFromMessage('댓글 만들어줘')).toEqual({
      force_comment_generation: true,
    });
    expect(buildFeatureContextFromMessage('댓글 생성 5개')).toEqual({
      force_comment_generation: true,
    });
  });

  it('질문/설명 패턴 시 enable_web_research 또는 prefer_informed_answer 설정', () => {
    expect(buildFeatureContextFromMessage('이 개념 설명해줘')).toMatchObject({ enable_web_research: true });
    expect(buildFeatureContextFromMessage('정의가 뭐야')).toMatchObject({ enable_web_research: true });
    expect(buildFeatureContextFromMessage('왜 그런지 알려줘')).toMatchObject({ enable_web_research: true });
    expect(buildFeatureContextFromMessage('원리 설명해')).toMatchObject({ enable_web_research: true });
    // 뭐야? 등은 웹검색 패턴으로 enable_web_research가 될 수 있음
    const r = buildFeatureContextFromMessage('그거 뭐야?');
    expect(r.enable_web_research === true || r.prefer_informed_answer === true).toBe(true);
  });

  it('요약·비교·분석 등 패턴 시 prefer_informed_answer 설정', () => {
    expect(buildFeatureContextFromMessage('도시정비법 요약해줘')).toMatchObject({ prefer_informed_answer: true });
    expect(buildFeatureContextFromMessage('두 제도 비교해줘')).toMatchObject({ prefer_informed_answer: true });
    expect(buildFeatureContextFromMessage('장단점 정리해줘')).toMatchObject({ prefer_informed_answer: true });
    expect(buildFeatureContextFromMessage('기준과 방법 정리해줘')).toMatchObject({ prefer_informed_answer: true });
    // 차이점 알려줘·배경 설명해줘 등은 웹검색 패턴(알려/설명해)으로 enable_web_research가 될 수 있음
    const withInformed = buildFeatureContextFromMessage('차이점 알려줘');
    expect(withInformed.enable_web_research === true || withInformed.prefer_informed_answer === true).toBe(true);
  });

  it('품질·상세 요청 패턴 시 prefer_informed_answer 또는 enable_web_research 설정', () => {
    const checkInformed = (ctx) =>
      ctx.prefer_informed_answer === true || ctx.enable_web_research === true;
    expect(checkInformed(buildFeatureContextFromMessage('상세히 설명해줘'))).toBe(true);
    expect(checkInformed(buildFeatureContextFromMessage('구체적으로 알려 주세요'))).toBe(true);
    expect(buildFeatureContextFromMessage('예시와 함께 정리해줘')).toMatchObject({ prefer_informed_answer: true });
    expect(checkInformed(buildFeatureContextFromMessage('단계별로 알려줘'))).toBe(true);
    expect(buildFeatureContextFromMessage('논리적으로 결론 내려줘')).toMatchObject({ prefer_informed_answer: true });
    expect(checkInformed(buildFeatureContextFromMessage('대안과 권장 사항 알려줘'))).toBe(true);
    expect(buildFeatureContextFromMessage('핵심만 요점 정리해줘')).toMatchObject({ prefer_informed_answer: true });
    expect(buildFeatureContextFromMessage('검토 의견 부탁해줘')).toMatchObject({ prefer_informed_answer: true });
    expect(checkInformed(buildFeatureContextFromMessage('실제 사례 들어서 설명해줘'))).toBe(true);
  });

  it('질문:/요구사항: 구조화 입력 시 prefer_informed_answer 또는 enable_web_research 설정', () => {
    const checkInformed = (ctx) =>
      ctx.prefer_informed_answer === true || ctx.enable_web_research === true;
    expect(checkInformed(buildFeatureContextFromMessage('질문: 도시정비법이 뭐야?\n요구사항: 요약해줘'))).toBe(true);
    expect(buildFeatureContextFromMessage('질문: A와 B 차이')).toMatchObject({ prefer_informed_answer: true });
    expect(buildFeatureContextFromMessage('요구사항: 단계별로 정리해줘')).toMatchObject({ prefer_informed_answer: true });
  });

  it('관련 없는 입력 시 빈 객체 반환', () => {
    expect(buildFeatureContextFromMessage('안녕하세요')).toEqual({});
    expect(buildFeatureContextFromMessage('그냥 인사할게')).toEqual({});
  });

  it('이미지 분석 패턴 시 hint_image_analysis 설정', () => {
    expect(buildFeatureContextFromMessage('이미지 분석해줘')).toMatchObject({ hint_image_analysis: true });
    expect(buildFeatureContextFromMessage('사진 분석')).toMatchObject({ hint_image_analysis: true });
    expect(buildFeatureContextFromMessage('이 사진 뭐야')).toMatchObject({ hint_image_analysis: true });
    expect(buildFeatureContextFromMessage('이 이미지 설명해줘')).toMatchObject({ hint_image_analysis: true });
  });

  it('예측·품질 패턴 시 hint_prediction 설정', () => {
    expect(buildFeatureContextFromMessage('품질 예측해줘')).toMatchObject({ hint_prediction: true });
    expect(buildFeatureContextFromMessage('예측 분석')).toMatchObject({ hint_prediction: true });
    expect(buildFeatureContextFromMessage('전망 알려줘')).toMatchObject({ hint_prediction: true });
    expect(buildFeatureContextFromMessage('향후 시세 추정')).toMatchObject({ hint_prediction: true });
  });

  it('기능·단축키 안내 패턴 시 request_capability_help 설정', () => {
    expect(buildFeatureContextFromMessage('어떤 기능이 있어?')).toMatchObject({ request_capability_help: true });
    expect(buildFeatureContextFromMessage('단축키 알려줘')).toMatchObject({ request_capability_help: true });
  });
});

describe('extractResponseContent', () => {
  const fallback = '응답을 생성할 수 없습니다. 다시 시도해 주세요.';

  it('null·undefined 시 fallback 반환', () => {
    expect(extractResponseContent(null)).toBe(fallback);
    expect(extractResponseContent(undefined)).toBe(fallback);
  });

  it('data가 null/없을 때 fallback 반환', () => {
    expect(extractResponseContent({ data: null })).toBe(fallback);
    expect(extractResponseContent({})).toBe(fallback);
  });

  it('data가 문자열이면 trim 후 반환', () => {
    expect(extractResponseContent({ data: 'Hello' })).toBe('Hello');
    expect(extractResponseContent({ data: '  답변  ' })).toBe('답변');
    expect(extractResponseContent({ data: '   ' })).toBe(fallback);
  });

  it('success: false·error 문자열 시 error 반환', () => {
    expect(
      extractResponseContent({
        data: { success: false, error: 'API 오류' },
      })
    ).toBe('API 오류');
  });

  it('최상위 response/message/content 추출', () => {
    expect(
      extractResponseContent({ data: { response: '답변1' } })
    ).toBe('답변1');
    expect(
      extractResponseContent({ data: { message: '답변2' } })
    ).toBe('답변2');
    expect(
      extractResponseContent({ data: { content: '답변3' } })
    ).toBe('답변3');
  });

  it('response_text/generated_text/generated_content 추출', () => {
    expect(
      extractResponseContent({ data: { response_text: '생성된 답변' } })
    ).toBe('생성된 답변');
    expect(
      extractResponseContent({ data: { generated_text: '생성 텍스트' } })
    ).toBe('생성 텍스트');
    expect(
      extractResponseContent({ data: { generated_content: '생성 콘텐츠' } })
    ).toBe('생성 콘텐츠');
  });

  it('markdown·body·assistant_response·문자열 payload 추출', () => {
    expect(extractResponseContent({ data: { markdown: '# 제목' } })).toBe('# 제목');
    expect(extractResponseContent({ data: { body: '본문' } })).toBe('본문');
    expect(
      extractResponseContent({ data: { assistant_response: '어시스턴트' } })
    ).toBe('어시스턴트');
    expect(
      extractResponseContent({ data: { payload: '페이로드 문자열' } })
    ).toBe('페이로드 문자열');
  });

  it('data.data 내부에서 추출', () => {
    expect(
      extractResponseContent({
        data: {
          data: { response: '내부 답변' },
        },
      })
    ).toBe('내부 답변');
    expect(
      extractResponseContent({
        data: {
          data: [{ response: '배열 첫번째' }],
        },
      })
    ).toBe('배열 첫번째');
  });

  it('빈/추출 불가 시 fallback 반환', () => {
    expect(extractResponseContent({ data: {} })).toBe(fallback);
    expect(extractResponseContent({ data: { data: [] } })).toBe(fallback);
  });

  it('응답에 프롬프트 지시 섹션이 섞여 있으면 제거 후 본문만 반환', () => {
    const raw =
      '재개발은 기존 시가지를 정비·재건축하는 사업입니다.\n\n[출력 형식 지시]\n질문 의도를 분석해 가장 적합한 형식으로 구조화하세요.';
    expect(extractResponseContent({ data: { response: raw } })).toBe(
      '재개발은 기존 시가지를 정비·재건축하는 사업입니다.'
    );
  });
});

describe('extractNextActionsFromChatResponse / parseNextActionsFromMetadata', () => {
  it('최상위 next_actions 추출', () => {
    expect(
      extractNextActionsFromChatResponse({
        data: { next_actions: ['a', 'b', ''], response: '본문' },
      })
    ).toEqual(['a', 'b']);
  });

  it('data.data.next_actions 추출', () => {
    expect(
      extractNextActionsFromChatResponse({
        data: { data: { next_actions: ['다음 단계'] } },
      })
    ).toEqual(['다음 단계']);
  });

  it('parseNextActionsFromMetadata', () => {
    expect(parseNextActionsFromMetadata({ next_actions: ['x'] })).toEqual(['x']);
    expect(parseNextActionsFromMetadata(undefined)).toBeUndefined();
  });
});

describe('parsePipelineFollowUpHints / hintsFromDeepseekCritique', () => {
  it('critique에서 follow_up·improvement_actions·요약을 힌트로 합친다', () => {
    const crit = {
      summary_for_user: '근거 보강 필요',
      follow_up_questions: ['예산은?'],
      improvement_actions: [{ priority: 'high', action: '표 추가', target_section: '2장' }],
    };
    expect(hintsFromDeepseekCritique(crit)).toEqual(['근거 보강 필요', '예산은?', '표 추가']);
    expect(
      parsePipelineFollowUpHints({
        next_actions: ['다음'],
        deepseek_critique: crit,
      })
    ).toEqual(['다음', '근거 보강 필요', '예산은?', '표 추가']);
  });

  it('extractPipelineFollowUpsFromChatResponse는 최상위 critique까지 병합', () => {
    const ax = extractPipelineFollowUpsFromChatResponse({
      data: {
        next_actions: ['다음 액션 A'],
        deepseek_critique: { follow_up_questions: ['후속 질문 B'] },
      },
    });
    expect(ax).toEqual(['다음 액션 A', '후속 질문 B']);
  });

  it('extractPipelineFollowUpsFromChatResponse는 data.data 중첩의 next_actions도 읽는다', () => {
    const ax = extractPipelineFollowUpsFromChatResponse({
      data: {
        data: { next_actions: ['중첩'], deepseek_critique: { summary_for_user: '요약' } },
      },
    });
    expect(ax).toEqual(['중첩', '요약']);
  });

  it('최상위 follow_up_questions도 다음 액션 힌트에 합친다', () => {
    expect(
      parsePipelineFollowUpHints({
        follow_up_questions: ['리스크는?', '일정은?'],
        next_actions: ['표로 정리'],
      })
    ).toEqual(['표로 정리', '리스크는?', '일정은?']);
  });

  it('extractPipelineFollowUpsFromChatResponse가 follow_up_questions를 중첩 data까지 병합한다', () => {
    const ax = extractPipelineFollowUpsFromChatResponse({
      data: {
        follow_up_questions: ['상단 후속'],
        data: { follow_up_questions: ['중첩 후속'] },
      },
    });
    expect(ax).toEqual(['상단 후속', '중첩 후속']);
  });
});

describe('parsePipelineMessageExtras', () => {
  it('메타에서 블루프린트·trace·비평을 추출한다', () => {
    const ex = parsePipelineMessageExtras({
      answer_blueprint: '## 개요',
      qa_pipeline_trace_id: 'trace_ab',
      deepseek_critique: { summary_for_user: '보강 필요', overall_severity: 'medium' },
    });
    expect(ex.answerBlueprintMarkdown).toBe('## 개요');
    expect(ex.qaPipelineTraceId).toBe('trace_ab');
    expect(ex.critiqueSummary).toBe('보강 필요');
    expect(ex.deepseekSeverity).toBe('medium');
    expect(hasPipelineExtras(ex)).toBe(true);
  });

  it('trace_id만 있어도 qaPipelineTraceId로 승격한다 (/api/chat 파이프라인 호환)', () => {
    const ex = parsePipelineMessageExtras({ trace_id: 'trace_legacy_main' });
    expect(ex.qaPipelineTraceId).toBe('trace_legacy_main');
  });

  it('extractPipelineMessageExtrasFromChatResponse가 data.trace_id를 읽는다', () => {
    const ex = extractPipelineMessageExtrasFromChatResponse({
      data: { trace_id: 'from_data_object', task_plan: { task_type: 'generate' } },
    });
    expect(ex.qaPipelineTraceId).toBe('from_data_object');
    expect(ex.taskPlan?.task_type).toBe('generate');
  });

  it('extractPipelineMessageExtrasFromChatResponse가 fetch JSON 본문(최상위, axios 래퍼 없음)을 처리한다', () => {
    const ex = extractPipelineMessageExtrasFromChatResponse({
      trace_id: 'plain_fetch',
      task_plan: { task_type: 'qa' },
    });
    expect(ex.qaPipelineTraceId).toBe('plain_fetch');
    expect(ex.taskPlan?.task_type).toBe('qa');
  });

  it('mergePipelineMessageExtras가 primary 필드를 우선하고 fallback으로 보완한다', () => {
    const merged = mergePipelineMessageExtras(
      { qaPipelineTraceId: 'stream-end' },
      {
        qaPipelineTraceId: 'ignored',
        pipelineTaskType: 'planning',
        evidenceCoverage: 0.5,
        generationScenarioMarkdown: 'fallback 시나리오',
      }
    );
    expect(merged.qaPipelineTraceId).toBe('stream-end');
    expect(merged.pipelineTaskType).toBe('planning');
    expect(merged.evidenceCoverage).toBe(0.5);
    expect(merged.generationScenarioMarkdown).toBe('fallback 시나리오');
  });

  it('generation_scenario 메타를 generationScenarioMarkdown으로 파싱한다', () => {
    const ex = parsePipelineMessageExtras({
      generation_scenario: '## 답변 생성 시나리오\n본문',
    });
    expect(ex.generationScenarioMarkdown).toContain('답변 생성 시나리오');
    expect(hasPipelineExtras(ex)).toBe(true);
  });

  it('response_alternatives·verification_pass를 파싱한다', () => {
    const ex = parsePipelineMessageExtras({
      response_alternatives: ['  버전 A  ', '버전 B'],
      verification_pass: true,
    });
    expect(ex.responseAlternatives).toEqual(['버전 A', '버전 B']);
    expect(ex.verificationPass).toBe(true);
    expect(hasPipelineExtras(ex)).toBe(true);
  });

  it('verification_summary가 있으면 verification_pass 필드보다 우선한다', () => {
    const ex = parsePipelineMessageExtras({
      verification_summary: { pass: false, issue_count: 1 },
      verification_pass: true,
    });
    expect(ex.verificationPass).toBe(false);
    expect(ex.verificationIssueCount).toBe(1);
  });

  it('verification_summary.verifier_rewrite_attempted를 파싱한다', () => {
    const ex = parsePipelineMessageExtras({
      verification_summary: {
        pass: true,
        verifier_rewrite_attempted: true,
        issue_count: 0,
      },
      task_plan: { task_type: 'generate' },
    });
    expect(ex.verifierRewriteAttempted).toBe(true);
    expect(ex.verificationPass).toBe(true);
    expect(hasPipelineExtras(ex)).toBe(true);
  });

  it('extractPipelineMessageExtrasFromChatResponse가 중첩 data의 verification_summary를 병합한다', () => {
    const ex = extractPipelineMessageExtrasFromChatResponse({
      data: {
        verification_summary: { pass: true, issue_count: 0 },
        data: {
          verification_summary: {
            pass: true,
            verifier_rewrite_attempted: true,
          },
        },
      },
    });
    expect(ex.verifierRewriteAttempted).toBe(true);
    expect(ex.verificationPass).toBe(true);
  });

  it('evidence_coverage와 task_plan.evidence_coverage를 evidenceCoverage로 파싱한다', () => {
    const top = parsePipelineMessageExtras({ evidence_coverage: 0.42 });
    expect(top.evidenceCoverage).toBe(0.42);
    expect(hasPipelineExtras(top)).toBe(true);
    const nested = parsePipelineMessageExtras({
      task_plan: { evidence_coverage: 0.88, task_type: 'compare' },
    });
    expect(nested.evidenceCoverage).toBe(0.88);
    expect(nested.pipelineTaskType).toBe('compare');
  });

  it('route_decision.task_type을 pipelineTaskType으로 우선 파싱한다', () => {
    const ex = parsePipelineMessageExtras({
      route_decision: { task_type: 'planning', grounding_required: 'preferred' },
      task_plan: { task_type: 'generate' },
    });
    expect(ex.pipelineTaskType).toBe('planning');
    expect(hasPipelineExtras(ex)).toBe(true);
  });

  it('axios 응답 최상위·data.data 병합', () => {
    const ex = extractPipelineMessageExtrasFromChatResponse({
      data: {
        answer_blueprint: '상단',
        data: {
          qa_pipeline_trace_id: 'nested',
          deepseek_critique: { overall_severity: 'low' },
        },
      },
    });
    expect(ex.answerBlueprintMarkdown).toBe('상단');
    expect(ex.qaPipelineTraceId).toBe('nested');
    expect(ex.deepseekSeverity).toBe('low');
  });

  it('task_plan이 있으면 pipelineExtras로 인정한다', () => {
    const ex = parsePipelineMessageExtras({
      task_plan: { task_type: 'planning', pipeline_status: 'completed' },
    });
    expect(ex.taskPlan?.task_type).toBe('planning');
    expect(hasPipelineExtras(ex)).toBe(true);
  });

  it('task_plan에 answer_mode·response_style이 있으면 객체로 유지된다 (UI 패널용)', () => {
    const ex = parsePipelineMessageExtras({
      task_plan: {
        task_type: 'generate',
        answer_mode: 'expert',
        response_style: 'detailed',
      },
    });
    expect(ex.taskPlan?.answer_mode).toBe('expert');
    expect(ex.taskPlan?.response_style).toBe('detailed');
    expect(hasPipelineExtras(ex)).toBe(true);
  });

  it('최상위 answer_mode·response_style만 있어도 pipelineExtras로 인정한다', () => {
    const ex = parsePipelineMessageExtras({
      answer_mode: 'guided',
      response_style: DEFAULT_CHAT_RESPONSE_STYLE,
    });
    expect(ex.answerMode).toBe('guided');
    expect(ex.responseStyle).toBe(DEFAULT_CHAT_RESPONSE_STYLE);
    expect(hasPipelineExtras(ex)).toBe(true);
  });

  it('extractPipelineMessageExtrasFromChatResponse가 data 중첩의 UI 모드를 병합한다', () => {
    const ex = extractPipelineMessageExtrasFromChatResponse({
      data: {
        answer_mode: 'fast',
        data: { response_style: 'comprehensive' },
      },
    });
    expect(ex.answerMode).toBe('fast');
    expect(ex.responseStyle).toBe('comprehensive');
  });

  it('parsePipelineMessageExtras가 generation_phase·pipeline_phase를 읽는다', () => {
    expect(
      parsePipelineMessageExtras({ generation_phase: 'verify' }).pipelineGenerationPhase
    ).toBe('verify');
    expect(
      parsePipelineMessageExtras({ pipeline_phase: 'draft' }).pipelineGenerationPhase
    ).toBe('draft');
    expect(hasPipelineExtras({ pipelineGenerationPhase: 'final' })).toBe(true);
  });

  it('extractPipelineMessageExtrasFromChatResponse가 최상위·data.metadata의 단계를 병합한다', () => {
    const top = extractPipelineMessageExtrasFromChatResponse({
      metadata: { generation_phase: 'analyze' },
    });
    expect(top.pipelineGenerationPhase).toBe('analyze');
    const nested = extractPipelineMessageExtrasFromChatResponse({
      data: { metadata: { pipeline_phase: 'generate' } },
    });
    expect(nested.pipelineGenerationPhase).toBe('generate');
    const override = extractPipelineMessageExtrasFromChatResponse({
      metadata: { generation_phase: 'old' },
      data: { metadata: { generation_phase: 'new' } },
    });
    expect(override.pipelineGenerationPhase).toBe('new');
  });
});

describe('extractLastAssistantGenerationScenarioMarkdown', () => {
  it('가장 마지막 어시스턴트 턴의 generationScenarioMarkdown을 반환한다', () => {
    const md = '## 시나리오\n항목';
    expect(
      extractLastAssistantGenerationScenarioMarkdown([
        { role: 'user' },
        {
          role: 'assistant',
          pipelineExtras: { generationScenarioMarkdown: '옛 시나리오' },
        },
        { role: 'user' },
        { role: 'assistant', pipelineExtras: { generationScenarioMarkdown: md } },
      ])
    ).toBe(md);
  });

  it('sender ai로도 어시스턴트로 인식한다', () => {
    expect(
      extractLastAssistantGenerationScenarioMarkdown([
        { sender: 'user' },
        { sender: 'ai', pipelineExtras: { generationScenarioMarkdown: 'X' } },
      ])
    ).toBe('X');
  });

  it('시나리오가 없으면 undefined', () => {
    expect(
      extractLastAssistantGenerationScenarioMarkdown([
        { role: 'assistant', pipelineExtras: {} },
      ])
    ).toBeUndefined();
  });
});

describe('cleanResponseText', () => {
  it('빈·비문자열 입력은 그대로 반환', () => {
    expect(cleanResponseText('')).toBe('');
    // @ts-expect-error 런타임 null
    expect(cleanResponseText(null)).toBe(null);
  });

  it('[출력 형식 지시] 이후 블록 제거', () => {
    const t = '요약: 안녕\n\n[출력 형식 지시]\n구조화하세요.';
    expect(cleanResponseText(t)).toBe('요약: 안녕');
  });

  it('[강제] [필수] 태그 제거', () => {
    expect(cleanResponseText('본문 [강제] 끝')).toBe('본문  끝');
  });

  it('일반 답변은 과도하게 잘리지 않음', () => {
    const t = '짧은 답';
    expect(cleanResponseText(t)).toBe('짧은 답');
  });

  it('긴 일반 답변도 그대로 유지', () => {
    const t = '이것은 일반적인 답변입니다. 프롬프트 지시사항이 없으므로 그대로 유지되어야 합니다.';
    expect(cleanResponseText(t)).toBe(t);
  });

  it('여러 지시사항 섹션이 모두 제거됨', () => {
    const t = '답변입니다.\n\n[출력 형식 지시]\n구조화하세요.\n\n[응답 스타일 지시]\n상세히 작성하세요.';
    expect(cleanResponseText(t)).toBe('답변입니다.');
  });

  it('[강제] 태그가 본문 중간에 있어도 제거', () => {
    const t = '첫 번째 문장 [강제] 두 번째 문장';
    expect(cleanResponseText(t)).toBe('첫 번째 문장  두 번째 문장');
  });

  it('연속된 빈 줄이 정리됨', () => {
    const t = '첫 줄\n\n\n\n\n마지막 줄';
    expect(cleanResponseText(t)).toBe('첫 줄\n\n마지막 줄');
  });
});

describe('parseQuestionRequirementSections', () => {
  it('질문: / 요구사항: 헤더 파싱', () => {
    const r = parseQuestionRequirementSections('질문: 도시정비법 요약해줘\n요구사항: 3페이지 이내');
    expect(r.hasBoth).toBe(true);
    expect(r.question).toContain('도시정비법');
    expect(r.requirements).toContain('3페이지');
  });

  it('한 줄 슬래시 구분', () => {
    const r = parseQuestionRequirementSections('질문: 재건축 조건 / 요구사항: 표로 정리');
    expect(r.hasBoth).toBe(true);
    expect(r.question).toContain('재건축');
    expect(r.requirements).toContain('표');
  });
});

describe('shouldTreatAsStructuredQuestionRequirements', () => {
  it('짧은 질문+짧은 요구는 구조화로 인정', () => {
    const r = parseQuestionRequirementSections('질문: 요약\n요구사항: 3줄');
    expect(shouldTreatAsStructuredQuestionRequirements(r)).toBe(true);
  });

  it('긴 본문+매우 짧은 한쪽은 붙여넣기 오인으로 구조화 끔', () => {
    const longQ = 'a'.repeat(3000);
    const r = { question: longQ, requirements: '톤만 지정', hasBoth: true };
    expect(shouldTreatAsStructuredQuestionRequirements(r)).toBe(false);
  });

  it('긴 양쪽은 구조화 유지', () => {
    const r = {
      question: 'a'.repeat(3000),
      requirements: 'b'.repeat(800),
      hasBoth: true,
    };
    expect(shouldTreatAsStructuredQuestionRequirements(r)).toBe(true);
  });
});

describe('truncateStructuredInputPreviewLine', () => {
  it('짧은 문자열은 그대로', () => {
    expect(truncateStructuredInputPreviewLine('안녕')).toBe('안녕');
  });

  it('긴 한 줄은 상한으로 자름', () => {
    const s = '가'.repeat(STRUCTURED_INPUT_PREVIEW_MAX_CHARS + 40);
    const out = truncateStructuredInputPreviewLine(s);
    expect(out.length).toBeLessThanOrEqual(STRUCTURED_INPUT_PREVIEW_MAX_CHARS);
    expect(out.endsWith('…')).toBe(true);
  });
});

describe('parseInputIntent', () => {
  it('암시적 질문 의도', () => {
    expect(parseInputIntent('이거 어떻게 해?').type).toBe('question');
    expect(parseInputIntent('Python 버전 알려줘').type).toBe('question');
  });

  it('암시적 요구 의도', () => {
    expect(parseInputIntent('체크리스트 만들어줘').type).toBe('requirement');
    expect(parseInputIntent('다음 형식으로 정리해줘').type).toBe('requirement');
    expect(parseInputIntent('도시정비법 분석해줘').type).toBe('requirement');
    expect(parseInputIntent('요약해줘').type).toBe('requirement');
  });

  it('일반 입력', () => {
    expect(parseInputIntent('안녕').type).toBe('general');
  });

  it('긴 붙여넣기는 질문·요구 키워드가 섞여도 combined로 오인하지 않음', () => {
    const pad = 'x'.repeat(IMPLICIT_COMBINED_INTENT_MAX_CHARS + 80);
    const r = parseInputIntent(`${pad}\n같은 질문에 대해 사용자 요구사항을 반영해 주세요.`);
    expect(r.type).toBe('general');
  });

  it('짧은 입력은 질문·요구 키워드가 동시에 있으면 combined', () => {
    const r = parseInputIntent('질문 하나 있고 요구사항은 표로 정리해줘');
    expect(r.type).toBe('combined');
  });
});

describe('omitHollowStructuredParsedInput', () => {
  it('undefined는 그대로', () => {
    expect(omitHollowStructuredParsedInput(undefined)).toBeUndefined();
  });

  it('질문·요구 본문이 모두 비면 undefined', () => {
    expect(
      omitHollowStructuredParsedInput({
        intent_type: 'requirement',
        intent_confidence: 0.7,
      })
    ).toBeUndefined();
    expect(
      omitHollowStructuredParsedInput({
        question: '   ',
        requirements: '',
        intent_type: 'requirement',
        intent_confidence: 0.7,
      })
    ).toBeUndefined();
  });

  it('질문 또는 요구 중 하나라도 있으면 trim된 객체 반환', () => {
    expect(
      omitHollowStructuredParsedInput({
        question: '  핵심만  ',
        intent_type: 'question',
        intent_confidence: 0.9,
      })
    ).toEqual({
      question: '핵심만',
      intent_type: 'question',
      intent_confidence: 0.9,
    });
    expect(
      omitHollowStructuredParsedInput({
        requirements: ' 표 형식 ',
        intent_type: 'combined',
        intent_confidence: 0.95,
      })
    ).toEqual({
      requirements: '표 형식',
      intent_type: 'combined',
      intent_confidence: 0.95,
    });
  });
});

describe('getProjectlessLongInputPipelineFlags', () => {
  it('프로젝트 또는 에이전트 라우트면 둘 다 false', () => {
    const long = 'x'.repeat(PROJECTLESS_LONG_INPUT_LITE_PIPELINE_CHARS + 100);
    expect(
      getProjectlessLongInputPipelineFlags({
        trimmedInput: long,
        currentProjectId: 'p1',
      })
    ).toEqual({ longProjectlessFast: false, longProjectlessLite: false });
    expect(
      getProjectlessLongInputPipelineFlags({
        trimmedInput: long,
        gensparkRouteAgentId: 'a1',
      })
    ).toEqual({ longProjectlessFast: false, longProjectlessLite: false });
  });

  it('일반 채팅에서 임계 길이 이상이면 fast, 더 길면 lite', () => {
    expect(
      getProjectlessLongInputPipelineFlags({
        trimmedInput: 'x'.repeat(PROJECTLESS_LONG_INPUT_FAST_PATH_CHARS - 1),
      })
    ).toEqual({ longProjectlessFast: false, longProjectlessLite: false });
    expect(
      getProjectlessLongInputPipelineFlags({
        trimmedInput: 'x'.repeat(PROJECTLESS_LONG_INPUT_FAST_PATH_CHARS),
      })
    ).toEqual({ longProjectlessFast: true, longProjectlessLite: false });
    expect(
      getProjectlessLongInputPipelineFlags({
        trimmedInput: 'x'.repeat(PROJECTLESS_LONG_INPUT_LITE_PIPELINE_CHARS),
      })
    ).toEqual({ longProjectlessFast: true, longProjectlessLite: true });
  });
});

describe('shouldOmitComposerDiversityDirectiveBlock', () => {
  it('IMPLICIT_COMBINED_INTENT_MAX_CHARS 이상이면 생략', () => {
    expect(shouldOmitComposerDiversityDirectiveBlock('x'.repeat(IMPLICIT_COMBINED_INTENT_MAX_CHARS + 1))).toBe(true);
  });

  it('[강제]가 3회 이상이면 생략', () => {
    expect(shouldOmitComposerDiversityDirectiveBlock('a [강제] b [강제] c [강제]')).toBe(true);
  });

  it('짧고 지시 태그가 적으면 생략하지 않음', () => {
    expect(shouldOmitComposerDiversityDirectiveBlock('요약해줘')).toBe(false);
    expect(shouldOmitComposerDiversityDirectiveBlock('[강제] 하나만')).toBe(false);
  });
});

describe('userInputAlreadyContainsFullComposerInstructionBlock', () => {
  const longBody = 'a'.repeat(400);

  it('[출력 형식 지시]와 [품질 검증 지시]가 함께 있으면 true', () => {
    expect(
      userInputAlreadyContainsFullComposerInstructionBlock(
        `${longBody}\n[출력 형식 지시]\n\n[품질 검증 지시]\n`,
      ),
    ).toBe(true);
  });

  it('짧은 입력이면 false', () => {
    expect(userInputAlreadyContainsFullComposerInstructionBlock('[출력 형식 지시]\n[품질 검증 지시]')).toBe(false);
  });

  it('일반 질문이면 false', () => {
    expect(userInputAlreadyContainsFullComposerInstructionBlock('요약해줘')).toBe(false);
  });
});

describe('scheduleAssistantNonStreamLoadingPhaseTimers', () => {
  it('분석 후 관점·개요, 이후 답변 생성 문구를 순서대로 호출한다', () => {
    jest.useFakeTimers();
    const setPhaseText = jest.fn();
    const clear = scheduleAssistantNonStreamLoadingPhaseTimers(setPhaseText);
    expect(setPhaseText).not.toHaveBeenCalled();
    jest.advanceTimersByTime(800);
    expect(setPhaseText).toHaveBeenCalledWith(ASSISTANT_PLACEHOLDER_OUTLINE);
    jest.advanceTimersByTime(550);
    expect(setPhaseText).toHaveBeenCalledWith(ASSISTANT_PLACEHOLDER_DRAFT);
    clear();
    jest.advanceTimersByTime(5000);
    expect(setPhaseText).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });
});

describe('runAssistantNonStreamPostResponsePhases', () => {
  it('다각도 점검 후 최종 검토 문구와 지연을 적용한다', async () => {
    jest.useFakeTimers();
    const setPhaseText = jest.fn();
    const p = runAssistantNonStreamPostResponsePhases(setPhaseText);
    expect(setPhaseText).toHaveBeenCalledWith(ASSISTANT_PLACEHOLDER_CROSSCHECK);
    jest.advanceTimersByTime(450);
    await Promise.resolve();
    expect(setPhaseText).toHaveBeenCalledWith(ASSISTANT_PLACEHOLDER_VERIFY);
    jest.advanceTimersByTime(350);
    await Promise.resolve();
    await p;
    expect(setPhaseText).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });
});

describe('scheduleAssistantPreRevealStreamPhases', () => {
  it('reducedMotion이면 짧은 간격으로 순차 플레이스홀더 후 onReveal', () => {
    jest.useFakeTimers();
    const setPlaceholder = jest.fn();
    const onReveal = jest.fn();
    const clear = scheduleAssistantPreRevealStreamPhases({
      reducedMotion: true,
      setPlaceholder,
      onReveal,
    });
    jest.advanceTimersByTime(200);
    expect(setPlaceholder).toHaveBeenCalledWith(ASSISTANT_PLACEHOLDER_OUTLINE);
    jest.advanceTimersByTime(200);
    expect(setPlaceholder).toHaveBeenCalledWith(ASSISTANT_PLACEHOLDER_DRAFT);
    jest.advanceTimersByTime(200);
    expect(setPlaceholder).toHaveBeenCalledWith(ASSISTANT_PLACEHOLDER_CROSSCHECK);
    jest.advanceTimersByTime(200);
    expect(setPlaceholder).toHaveBeenCalledWith(ASSISTANT_PLACEHOLDER_VERIFY);
    jest.advanceTimersByTime(200);
    expect(onReveal).toHaveBeenCalledTimes(1);
    clear();
    jest.useRealTimers();
  });

  it('reducedMotion이 아니면 순차 플레이스홀더 후 onReveal', () => {
    jest.useFakeTimers();
    const setPlaceholder = jest.fn();
    const onReveal = jest.fn();
    scheduleAssistantPreRevealStreamPhases({
      reducedMotion: false,
      setPlaceholder,
      onReveal,
    });
    jest.advanceTimersByTime(800);
    expect(setPlaceholder).toHaveBeenCalledWith(ASSISTANT_PLACEHOLDER_OUTLINE);
    jest.advanceTimersByTime(550);
    expect(setPlaceholder).toHaveBeenCalledWith(ASSISTANT_PLACEHOLDER_DRAFT);
    jest.advanceTimersByTime(800);
    expect(setPlaceholder).toHaveBeenCalledWith(ASSISTANT_PLACEHOLDER_CROSSCHECK);
    jest.advanceTimersByTime(450);
    expect(setPlaceholder).toHaveBeenCalledWith(ASSISTANT_PLACEHOLDER_VERIFY);
    jest.advanceTimersByTime(350);
    expect(onReveal).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});

describe('computeAssistantPipelineDurationMultiplier', () => {
  it('기본은 1에 가깝다', () => {
    expect(computeAssistantPipelineDurationMultiplier('hi', {}, false)).toBe(1);
  });

  it('웹검색·구조화 assist면 배율이 올라간다', () => {
    const m = computeAssistantPipelineDurationMultiplier('x', { enable_web_research: true }, true);
    expect(m).toBeGreaterThan(1);
    expect(m).toBeLessThanOrEqual(1.85);
  });
});

describe('scheduleClientStreamingPipelinePhases', () => {
  it('draft 후 crosscheck·verify 순으로 onPhase 호출', () => {
    jest.useFakeTimers();
    const phases: string[] = [];
    const clear = scheduleClientStreamingPipelinePhases({
      multiplier: 1,
      onPhase: (p) => phases.push(p),
    });
    expect(phases).toEqual(['draft']);
    jest.advanceTimersByTime(650);
    expect(phases).toEqual(['draft', 'crosscheck']);
    jest.advanceTimersByTime(520);
    expect(phases).toEqual(['draft', 'crosscheck', 'verify']);
    clear();
    jest.useRealTimers();
  });
});

describe('mapStreamMetadataToAssistantPlaceholder', () => {
  it('generation_phase 문자열을 플레이스홀더로 매핑', () => {
    expect(mapStreamMetadataToAssistantPlaceholder({ generation_phase: 'analyze' })).toBe(ASSISTANT_PLACEHOLDER_ANALYZING);
    expect(mapStreamMetadataToAssistantPlaceholder({ pipeline_phase: 'outline' })).toBe(ASSISTANT_PLACEHOLDER_OUTLINE);
    expect(mapStreamMetadataToAssistantPlaceholder({ pipeline_phase: 'draft' })).toBe(ASSISTANT_PLACEHOLDER_DRAFT);
    expect(mapStreamMetadataToAssistantPlaceholder({ generation_phase: 'crosscheck' })).toBe(ASSISTANT_PLACEHOLDER_CROSSCHECK);
    expect(mapStreamMetadataToAssistantPlaceholder({ qa_pipeline_phase: 'verify' })).toBe(ASSISTANT_PLACEHOLDER_VERIFY);
  });

  it('pipeline_step 숫자로 매핑 (0 분석 → 1 개요 → 2 작성 → 3 점검 → 그 외 검토)', () => {
    expect(mapStreamMetadataToAssistantPlaceholder({ pipeline_step: 0 })).toBe(ASSISTANT_PLACEHOLDER_ANALYZING);
    expect(mapStreamMetadataToAssistantPlaceholder({ generation_step: 1 })).toBe(ASSISTANT_PLACEHOLDER_OUTLINE);
    expect(mapStreamMetadataToAssistantPlaceholder({ pipeline_step: 2 })).toBe(ASSISTANT_PLACEHOLDER_DRAFT);
    expect(mapStreamMetadataToAssistantPlaceholder({ pipeline_step: 3 })).toBe(ASSISTANT_PLACEHOLDER_CROSSCHECK);
    expect(mapStreamMetadataToAssistantPlaceholder({ pipeline_step: 4 })).toBe(ASSISTANT_PLACEHOLDER_VERIFY);
  });

  it('힌트 없으면 null', () => {
    expect(mapStreamMetadataToAssistantPlaceholder({})).toBe(null);
  });
});

describe('detectColumnStyleIntent', () => {
  it('칼럼·유시민 스타일 요청 시 true', () => {
    expect(detectColumnStyleIntent('롯데건설 내용 유시민 스타일 칼럼으로 써줘')).toBe(true);
    expect(detectColumnStyleIntent('칼럼으로 작성해줘')).toBe(true);
    expect(detectColumnStyleIntent('분석 칼럼 만들어줘')).toBe(true);
    expect(detectColumnStyleIntent('해설으로 써줘')).toBe(true);
    expect(detectColumnStyleIntent('경제 칼럼 형식으로')).toBe(true);
  });

  it('칼럼/해설 의도 없으면 false', () => {
    expect(detectColumnStyleIntent('안녕하세요')).toBe(false);
    expect(detectColumnStyleIntent('Python 기초 알려줘')).toBe(false);
    expect(detectColumnStyleIntent('요약해줘')).toBe(false);
  });

  it('빈 문자열·공백 시 false', () => {
    expect(detectColumnStyleIntent('')).toBe(false);
    expect(detectColumnStyleIntent('   ')).toBe(false);
  });
});

describe('ASSISTANT_GENERATION_STEP_LABELS_*', () => {
  it('일반·웹검색 라벨이 각각 5단계이며 작성 단계 문구는 공통', () => {
    expect(ASSISTANT_GENERATION_STEP_LABELS_DEFAULT).toHaveLength(5);
    expect(ASSISTANT_GENERATION_STEP_LABELS_WEB_RESEARCH).toHaveLength(5);
    expect(ASSISTANT_GENERATION_STEP_LABELS_DEFAULT[2]).toBe('답변 작성');
    expect(ASSISTANT_GENERATION_STEP_LABELS_WEB_RESEARCH[2]).toBe('답변 작성');
  });

  it('PHASE_ORDER 길이가 짧은 라벨 배열과 일치', () => {
    expect(ASSISTANT_GENERATION_PHASE_ORDER).toHaveLength(5);
    expect(ASSISTANT_GENERATION_PHASE_ORDER).toHaveLength(
      ASSISTANT_GENERATION_STEP_LABELS_DEFAULT.length,
    );
    expect(ASSISTANT_GENERATION_PHASE_ORDER).toHaveLength(
      ASSISTANT_GENERATION_STEP_LABELS_WEB_RESEARCH.length,
    );
  });

  it('플레이스홀더 파이프라인 순서가 PHASE_ORDER·짧은 라벨과 같은 길이', () => {
    expect(ASSISTANT_PLACEHOLDER_PIPELINE_ORDER).toHaveLength(
      ASSISTANT_GENERATION_PHASE_ORDER.length,
    );
    expect(ASSISTANT_PLACEHOLDER_PIPELINE_ORDER[0]).toBe(ASSISTANT_PLACEHOLDER_ANALYZING);
    expect(ASSISTANT_PLACEHOLDER_PIPELINE_ORDER[4]).toBe(ASSISTANT_PLACEHOLDER_VERIFY);
  });

  it('PIPELINE_ORDER 각 문구가 getAssistantGenerationPhase에서 PHASE_ORDER와 짝을 이룬다', () => {
    ASSISTANT_GENERATION_PHASE_ORDER.forEach((ph, i) => {
      expect(getAssistantGenerationPhase(ASSISTANT_PLACEHOLDER_PIPELINE_ORDER[i])).toBe(ph);
    });
    expect(getAssistantGenerationPhase(ASSISTANT_PLACEHOLDER_THINKING)).toBe('analyze');
  });

  it('GENSPARK_STATUS_RETRY_BANNER은 젠스파이크 상태 패널용 비스트리밍 재시도 설명', () => {
    expect(ASSISTANT_GENSPARK_STATUS_RETRY_BANNER).toContain('비스트리밍');
    expect(ASSISTANT_GENSPARK_STATUS_RETRY_BANNER).toContain('재시도');
  });

  it('GENSPARK_STATUS 헤드라인·단계 aria 상수가 비어 있지 않다', () => {
    const headlines = [
      ASSISTANT_GENSPARK_STATUS_HEADLINE_INITIAL_WEB,
      ASSISTANT_GENSPARK_STATUS_HEADLINE_INITIAL_DOCUMENT,
      ASSISTANT_GENSPARK_STATUS_HEADLINE_INITIAL_DEFAULT,
      ASSISTANT_GENSPARK_STATUS_HEADLINE_STEP_RETRY,
      ASSISTANT_GENSPARK_STATUS_HEADLINE_STEP_ACTIVE,
    ];
    headlines.forEach((s) => expect(s.trim().length).toBeGreaterThan(0));
    expect(ASSISTANT_GENSPARK_STEPS_ARIA_LABEL.trim().length).toBeGreaterThan(0);
  });

  it('QA 역할 배지 문구가 플레이스홀더 본문과 겹치지 않는다', () => {
    expect(ASSISTANT_GENSPARK_QA_BADGE_QUESTION).toBe('질문');
    expect(ASSISTANT_GENSPARK_QA_BADGE_ANSWER).toBe('답변');
    expect(isAssistantGenerationPlaceholder(ASSISTANT_GENSPARK_QA_BADGE_QUESTION)).toBe(false);
    expect(isAssistantGenerationPlaceholder(ASSISTANT_GENSPARK_QA_BADGE_ANSWER)).toBe(false);
  });
});

describe('assistantGenerationPhaseToStepIndex', () => {
  it('retry는 null', () => {
    expect(assistantGenerationPhaseToStepIndex('retry')).toBeNull();
  });

  it('analyze~verify는 0~4', () => {
    expect(assistantGenerationPhaseToStepIndex('analyze')).toBe(0);
    expect(assistantGenerationPhaseToStepIndex('outline')).toBe(1);
    expect(assistantGenerationPhaseToStepIndex('draft')).toBe(2);
    expect(assistantGenerationPhaseToStepIndex('crosscheck')).toBe(3);
    expect(assistantGenerationPhaseToStepIndex('verify')).toBe(4);
  });
});

describe('getAssistantGenerationPhase', () => {
  it('ASSISTANT_VERIFY_PHASE_MS는 검토 단계 노출 시간(ms)', () => {
    expect(ASSISTANT_VERIFY_PHASE_MS).toBe(350);
  });

  it('ASSISTANT_STREAM_PHASE_* / NOTEBOOK_STREAM_PHASE_*는 젠스파이크 순차 단계(ms)', () => {
    expect(ASSISTANT_STREAM_PHASE_ANALYZE_MS).toBe(800);
    expect(ASSISTANT_STREAM_PHASE_OUTLINE_MS).toBe(550);
    expect(ASSISTANT_STREAM_PHASE_DRAFT_MS).toBe(800);
    expect(ASSISTANT_STREAM_PHASE_CROSSCHECK_MS).toBe(450);
    expect(NOTEBOOK_STREAM_PHASE_ANALYZE_MS).toBe(ASSISTANT_STREAM_PHASE_ANALYZE_MS);
    expect(NOTEBOOK_STREAM_PHASE_OUTLINE_MS).toBe(ASSISTANT_STREAM_PHASE_OUTLINE_MS);
    expect(NOTEBOOK_STREAM_PHASE_DRAFT_MS).toBe(ASSISTANT_STREAM_PHASE_DRAFT_MS);
    expect(NOTEBOOK_STREAM_PHASE_CROSSCHECK_MS).toBe(ASSISTANT_STREAM_PHASE_CROSSCHECK_MS);
  });

  it('플레이스홀더 문구를 단계로 매핑한다', () => {
    expect(getAssistantGenerationPhase(ASSISTANT_PLACEHOLDER_ANALYZING)).toBe('analyze');
    expect(getAssistantGenerationPhase(ASSISTANT_PLACEHOLDER_THINKING)).toBe('analyze');
    expect(getAssistantGenerationPhase(ASSISTANT_PLACEHOLDER_OUTLINE)).toBe('outline');
    expect(getAssistantGenerationPhase(ASSISTANT_PLACEHOLDER_DRAFT)).toBe('draft');
    expect(getAssistantGenerationPhase(ASSISTANT_PLACEHOLDER_CROSSCHECK)).toBe('crosscheck');
    expect(getAssistantGenerationPhase(ASSISTANT_PLACEHOLDER_VERIFY)).toBe('verify');
    expect(getAssistantGenerationPhase(ASSISTANT_PLACEHOLDER_RETRY_NONSTREAM)).toBe('retry');
  });

  it('실제 답변 본문은 null', () => {
    expect(getAssistantGenerationPhase('안녕하세요. **굵게**')).toBe(null);
    expect(getAssistantGenerationPhase('')).toBe(null);
  });

  it('isAssistantGenerationPlaceholder는 플레이스홀더만 true', () => {
    expect(isAssistantGenerationPlaceholder(ASSISTANT_PLACEHOLDER_DRAFT)).toBe(true);
    expect(isAssistantGenerationPlaceholder('일반 텍스트')).toBe(false);
  });

  it('isAssistantGenerationStepUi는 빈 본문·플레이스홀더일 때 true', () => {
    expect(isAssistantGenerationStepUi('')).toBe(true);
    expect(isAssistantGenerationStepUi('   ')).toBe(true);
    expect(isAssistantGenerationStepUi(ASSISTANT_PLACEHOLDER_DRAFT)).toBe(true);
    expect(isAssistantGenerationStepUi('일반 텍스트')).toBe(false);
  });

  it('STORED_ASSISTANT_INCOMPLETE_NOTICE는 비어 있지 않고 플레이스홀더가 아니다', () => {
    expect(typeof STORED_ASSISTANT_INCOMPLETE_NOTICE).toBe('string');
    expect(STORED_ASSISTANT_INCOMPLETE_NOTICE.length).toBeGreaterThan(0);
    expect(isAssistantGenerationPlaceholder(STORED_ASSISTANT_INCOMPLETE_NOTICE)).toBe(false);
  });
});

describe('explicit conversation title from user input', () => {
  it('제목: 라벨로 앞쪽 줄에서 제목을 뽑는다', () => {
    const body = '본문입니다.';
    expect(
      extractExplicitUserTitleRaw(`제목: HDC 입찰 관련\n\n${body}`),
    ).toBe('HDC 입찰 관련');
    expect(getConciseConversationTitleFromUserInput(`제목：긴 제목…\n${body}`)).toBe('긴 제목…');
  });

  it('subject: · title: · topic: 영문 라벨도 인정한다', () => {
    expect(getConciseConversationTitleFromUserInput('subject: API 설계\n\n본문')).toBe('API 설계');
    expect(getConciseConversationTitleFromUserInput('Title: Short line\n\nbody')).toBe('Short line');
    expect(getConciseConversationTitleFromUserInput('topic: 배포 체크리스트\n\n본문')).toBe('배포 체크리스트');
  });

  it('슬래시로 연결한 복합 라벨 한 줄도 인정한다', () => {
    expect(
      getConciseConversationTitleFromUserInput(
        `${EXPLICIT_TITLE_COMPOSER_LABEL_PREFIX}주간 회의록\n\n질문:\n내용`,
      ),
    ).toBe('주간 회의록');
    expect(
      getConciseConversationTitleFromUserInput('제목 / title / subject: 구버전 라벨\n\n질문:\n내용'),
    ).toBe('구버전 라벨');
  });

  it('QUESTION_REQUIREMENT_COMPOSER_TEMPLATE는 빈 제목으로 삽입되며 질문 헤더를 제목으로 쓰지 않는다', () => {
    expect(QUESTION_REQUIREMENT_COMPOSER_TEMPLATE.startsWith(EXPLICIT_TITLE_COMPOSER_LABEL_PREFIX)).toBe(true);
    expect(extractExplicitUserTitleRaw(QUESTION_REQUIREMENT_COMPOSER_TEMPLATE)).toBeNull();
  });

  it('COMPOSER_SIDEBAR_TITLE_HINT_SNIPPET은 템플릿·파서 키워드와 맞춘다', () => {
    expect(COMPOSER_SIDEBAR_TITLE_HINT_SNIPPET).toContain('title');
    expect(COMPOSER_SIDEBAR_TITLE_HINT_SNIPPET).toContain('subject');
    expect(COMPOSER_SIDEBAR_TITLE_HINT_SNIPPET).toContain('topic');
  });

  it('첫 줄이 마크다운 # 이면 제목으로 인정한다', () => {
    expect(extractExplicitUserTitleRaw('# 헤드라인\n\n내용')).toBe('헤드라인');
    expect(getConciseConversationTitleFromUserInput('# 헤드라인\n내용')).toBe('헤드라인');
  });

  it('긴 명시 제목은 30자 내로 잘라 …를 붙인다', () => {
    const long = '가'.repeat(45);
    const out = conciseConversationTitleFromExplicit(long, CONCISE_CONVERSATION_TITLE_MAX_LEN);
    expect(out.length).toBeLessThanOrEqual(CONCISE_CONVERSATION_TITLE_MAX_LEN);
    expect(out.endsWith('…')).toBe(true);
  });

  it('명시 제목이 없으면 null', () => {
    expect(getConciseConversationTitleFromUserInput('그냥 긴 글만 있고 라벨 없음')).toBeNull();
    expect(extractExplicitUserTitleRaw('제목:')).toBeNull();
  });

  it('제목: 만 두고 다음 줄에 짧은 한 줄이면 그 줄을 제목으로 쓴다', () => {
    const t = '제목:\n\n용산 입찰 논의\n\n질문:\n- 내용';
    expect(extractExplicitUserTitleRaw(t)).toBe('용산 입찰 논의');
    expect(getConciseConversationTitleFromUserInput(t)).toBe('용산 입찰 논의');
  });

  it('제목: 다음 줄이 길어도 명시 제목으로 쓰고 목록용은 30자 이내로 잘린다', () => {
    const longNext = '가'.repeat(90);
    expect(extractExplicitUserTitleRaw(`제목:\n${longNext}`)).toBe(longNext);
    const concise = getConciseConversationTitleFromUserInput(`제목:\n${longNext}`);
    expect(concise).not.toBeNull();
    expect(concise!.length).toBeLessThanOrEqual(CONCISE_CONVERSATION_TITLE_MAX_LEN);
    expect(concise!.endsWith('…')).toBe(true);
  });

  it('conversationListTitleFromUserMessage — 빈 입력은 새 대화, 긴 본문은 30자+...', () => {
    expect(conversationListTitleFromUserMessage('')).toBe('새 대화');
    expect(conversationListTitleFromUserMessage('   ')).toBe('새 대화');
    const long = 'b'.repeat(45);
    const t = conversationListTitleFromUserMessage(long);
    expect(t.length).toBeLessThanOrEqual(33);
    expect(t.endsWith('...')).toBe(true);
    expect(conversationListTitleFromUserMessage('제목: 짧음\n\n본문')).toBe('짧음');
  });
});

describe('resolveListTitleAfterAssistantReply', () => {
  it('갱신하지 않으면 기존 제목', async () => {
    await expect(
      resolveListTitleAfterAssistantReply({
        conversationTitle: '기존',
        shouldUpdateTitle: false,
        explicitTitleConcise: '명시',
        trimmedUserMessage: 'u',
        assistantDisplayText: '답',
        generateTitle: async () => 'api',
      }),
    ).resolves.toBe('기존');
  });

  it('assistant 본문이 비면 기존 제목', async () => {
    await expect(
      resolveListTitleAfterAssistantReply({
        conversationTitle: '기존',
        shouldUpdateTitle: true,
        explicitTitleConcise: null,
        trimmedUserMessage: 'u',
        assistantDisplayText: '   ',
        generateTitle: async () => 'api',
      }),
    ).resolves.toBe('기존');
  });

  it('명시 제목이 있으면 API 없이 사용', async () => {
    await expect(
      resolveListTitleAfterAssistantReply({
        conversationTitle: '기존',
        shouldUpdateTitle: true,
        explicitTitleConcise: '짧음',
        trimmedUserMessage: 'u',
        assistantDisplayText: '긴 답',
        generateTitle: async () => 'api',
      }),
    ).resolves.toBe('짧음');
  });

  it('명시가 없으면 generateTitle', async () => {
    await expect(
      resolveListTitleAfterAssistantReply({
        conversationTitle: '기존',
        shouldUpdateTitle: true,
        explicitTitleConcise: null,
        trimmedUserMessage: 'u',
        assistantDisplayText: '답',
        generateTitle: async (u, a) => `api-${u}-${a}`,
      }),
    ).resolves.toBe('api-u-답');
  });
});
