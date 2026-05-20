import {
  appendComposerSelfDevelopLessons,
  applyComposerSelfDevelopIfEnabled,
  buildComposerSelfDevelopPipelineExtras,
  buildComposerSelfDevelopRevisionContext,
  readComposerSelfDevelopLessons,
  shouldRunComposerAnswerSelfDevelop,
  verifyComposerAnswerDraft,
} from '../composerAnswerSelfDevelopment';

describe('composerAnswerSelfDevelopment', () => {
  it('shouldRunComposerAnswerSelfDevelop는 짧은 단순 질문에서 false', () => {
    expect(
      shouldRunComposerAnswerSelfDevelop({
        trimmedInput: '안녕',
        composerSimpleQuery: true,
      }),
    ).toBe(false);
    expect(
      shouldRunComposerAnswerSelfDevelop({
        trimmedInput: '보고서 작성 요구사항을 정리하고 분석해줘. 항목별로 근거를 포함해.',
        composerSimpleQuery: false,
      }),
    ).toBe(true);
    expect(
      shouldRunComposerAnswerSelfDevelop({
        trimmedInput: '요약해줘',
        composerSimpleQuery: false,
        oversightEnabled: true,
      }),
    ).toBe(true);
  });

  it('verifyComposerAnswerDraft는 빈·짧은 답변을 거부한다', () => {
    const r = verifyComposerAnswerDraft('파이썬이란?', '짧음');
    expect(r.pass).toBe(false);
    expect(r.issues.length).toBeGreaterThan(0);
  });

  it('verifyComposerAnswerDraft는 충분한 본문을 통과시킨다', () => {
    const answer =
      '파이썬은 읽기 쉬운 문법을 가진 프로그래밍 언어입니다. 데이터 분석·웹·자동화에 널리 쓰입니다. 다음 단계로 공식 튜토리얼을 따라 간단한 스크립트를 실행해 보세요.';
    const r = verifyComposerAnswerDraft('파이썬이란?', answer);
    expect(r.pass).toBe(true);
  });

  it('세션 lessons 저장·읽기', () => {
    const key = 'test-session-sd';
    sessionStorage.setItem(`composer_sd_lessons_${key}`, '[]');
    appendComposerSelfDevelopLessons(key, ['답변이 짧습니다']);
    expect(readComposerSelfDevelopLessons(key)).toContain('답변이 짧습니다');
  });

  it('buildComposerSelfDevelopPipelineExtras는 개선 결과를 extras로 만든다', () => {
    const ex = buildComposerSelfDevelopPipelineExtras({
      finalText: 'ok',
      attempts: 2,
      improved: true,
      lastScore: 88,
    });
    expect(ex?.composerSelfDevelopImproved).toBe(true);
    expect(ex?.composerSelfDevelopAttempts).toBe(2);
  });

  it('buildComposerSelfDevelopRevisionContext에 시도·이슈를 반영한다', () => {
    const ctx = buildComposerSelfDevelopRevisionContext(
      { answer_quality_instruction: '기존' },
      ['누락'],
      0,
      'critique',
    );
    expect(ctx.composer_self_develop_attempt).toBe(1);
    expect(String(ctx.answer_quality_instruction)).toContain('누락');
  });

  it('applyComposerSelfDevelopIfEnabled는 비활성 시 draft를 그대로 반환한다', async () => {
    const r = await applyComposerSelfDevelopIfEnabled({
      draft: '초안 본문',
      userInput: '질문',
      baseContext: {},
      sessionId: 's1',
      active: false,
      requestRefined: async () => '개선',
    });
    expect(r.text).toBe('초안 본문');
    expect(r.extras).toBeUndefined();
  });
});
