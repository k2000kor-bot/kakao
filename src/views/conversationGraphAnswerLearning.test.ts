import {
  __readGraphAnswerLessonsForTest,
  buildGraphAnswerLessonsPrompt,
  clearGraphAnswerLessons,
  recordGraphAnswerLessonFromContext,
} from './conversationGraphAnswerLearning';

describe('conversationGraphAnswerLearning', () => {
  beforeEach(() => {
    clearGraphAnswerLessons();
  });

  it('로컬 학습이 없으면 형식별 내장 패턴 시드를 반환한다', () => {
    const prompt = buildGraphAnswerLessonsPrompt('entity_intelligence_report');
    expect(prompt).toContain('인텔리전스');
    expect(prompt).toContain('내장');
  });

  it('검증 통과 답변을 localStorage에 기록하고 다음 프롬프트에 반영한다', () => {
    recordGraphAnswerLessonFromContext(
      '## 한 줄 요약\n\n알파와 베타의 갈등 축을 정리했습니다. '.repeat(4),
      {
        conversation_graph_lesson_participant_count: 3,
        conversation_graph_lesson_edge_count: 5,
        conversation_graph_trust_label: '보통',
        conversation_graph_document_format: 'analytical_report',
      },
      '분석 보고서',
    );

    const lessons = __readGraphAnswerLessonsForTest();
    expect(lessons).toHaveLength(1);
    expect(lessons[0].participantCount).toBe(3);
    expect(buildGraphAnswerLessonsPrompt()).toContain('분석 보고서');
    expect(buildGraphAnswerLessonsPrompt()).toContain('이전 관계도 답변 학습');
    expect(lessons[0].documentFormat).toBe('analytical_report');
  });

  it('참여자 수가 없으면 기록하지 않는다', () => {
    recordGraphAnswerLessonFromContext('짧은 본문', {}, '테스트');
    expect(__readGraphAnswerLessonsForTest()).toHaveLength(0);
  });
});
