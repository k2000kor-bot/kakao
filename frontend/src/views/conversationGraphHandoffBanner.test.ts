import { isCreateGraphAnswerRequest } from './conversationGraphAnswerIntent';

/** ChatGPTInterface handoff 배너 노출 조건(첨부 파일 + 관계도 생성 의도) 단위 검증 */
describe('conversationGraphHandoffBanner 조건', () => {
  it('관계도 만들기 요청 문구를 감지한다', () => {
    expect(isCreateGraphAnswerRequest('관계도를 만들어줘')).toBe(true);
    expect(isCreateGraphAnswerRequest('관계도를 만들어 주세요')).toBe(true);
    expect(isCreateGraphAnswerRequest('참여자 관계도 생성해줘')).toBe(true);
    expect(isCreateGraphAnswerRequest('안녕하세요')).toBe(false);
  });
});
