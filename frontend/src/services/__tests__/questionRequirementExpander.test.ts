/**
 * questionRequirementExpander 테스트
 */
import { expandInput } from '../questionRequirementExpander';

describe('questionRequirementExpander', () => {
  describe('expandInput', () => {
    it('빈 입력 시 빈 배열 반환', () => {
      const result = expandInput('');
      expect(result.longQuestions).toEqual([]);
      expect(result.longRequirements).toEqual([]);
      expect(result.variousQuestions).toEqual([]);
      expect(result.variousRequirements).toEqual([]);
    });

    it('공백만 입력 시 빈 배열 반환', () => {
      const result = expandInput('   ');
      expect(result.longQuestions).toEqual([]);
    });

    it('입력 시 긴 질문 3개 생성', () => {
      const result = expandInput('재개발 시공사 선정');
      expect(result.longQuestions).toHaveLength(3);
      expect(result.longQuestions[0]).toContain('재개발 시공사 선정');
    });

    it('입력 시 긴 요구 3개 생성', () => {
      const result = expandInput('분양 절차');
      expect(result.longRequirements).toHaveLength(3);
      expect(result.longRequirements[0]).toContain('분양 절차');
    });

    it('입력 시 다양한 질문 5개 생성', () => {
      const result = expandInput('정관');
      expect(result.variousQuestions).toHaveLength(5);
      expect(result.variousQuestions[0]).toContain('정관');
    });

    it('입력 시 다양한 요구 5개 생성', () => {
      const result = expandInput('입찰');
      expect(result.variousRequirements).toHaveLength(5);
      expect(result.variousRequirements[0]).toContain('입찰');
    });
  });
});
