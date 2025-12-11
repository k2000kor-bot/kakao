/**
 * answerCritic 서비스 테스트
 * 답변 비평 기능 테스트
 */

import { critiqueAnswer, CritiqueOptions } from '../answerCritic';

describe('answerCritic', () => {
  describe('critiqueAnswer', () => {
    it('짧은 답변에 대해 이슈를 감지해야 함', () => {
      const answer = '짧은 답변';
      const result = critiqueAnswer(answer);

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('needsRefine');
      expect(result.issues).toContain('답변이 너무 짧습니다');
      expect(result.score).toBeLessThan(1);
    });

    it('구조화된 답변을 올바르게 평가해야 함', () => {
      const answer = '긴 답변입니다.\n- 첫 번째 포인트\n- 두 번째 포인트\n- 세 번째 포인트\n\n[파일: test.pdf]';
      const result = critiqueAnswer(answer);

      // 불릿 포인트와 인용이 있으면 이슈가 없어야 함
      expect(result.issues.length).toBeLessThanOrEqual(1);
      expect(result.score).toBeGreaterThan(0.7);
    });

    it('불릿 포인트가 없는 답변에 대해 이슈를 감지해야 함', () => {
      const answer = 'A'.repeat(100);
      const result = critiqueAnswer(answer);

      expect(result.issues).toContain('불릿/구조화가 부족합니다');
    });

    it('인용이 없는 답변에 대해 이슈를 감지해야 함', () => {
      const answer = '긴 답변입니다.\n- 첫 번째 포인트\n- 두 번째 포인트';
      const result = critiqueAnswer(answer);

      expect(result.issues).toContain('인용/출처 표시가 없습니다');
    });

    it('requireCitations 옵션이 false이면 인용 체크를 건너뛰어야 함', () => {
      const options: CritiqueOptions = { requireCitations: false };
      const answer = '긴 답변입니다.\n- 첫 번째 포인트\n- 두 번째 포인트';
      const result = critiqueAnswer(answer, options);

      expect(result.issues).not.toContain('인용/출처 표시가 없습니다');
    });

    it('점수가 0.75 미만이면 needsRefine이 true여야 함', () => {
      const answer = '짧은 답변';
      const result = critiqueAnswer(answer);

      expect(result.needsRefine).toBe(true);
    });

    it('점수가 0.75 이상이면 needsRefine이 false여야 함', () => {
      const answer = '긴 답변입니다.\n- 첫 번째 포인트\n- 두 번째 포인트\n- 세 번째 포인트\n\n[파일: test.pdf]';
      const result = critiqueAnswer(answer);

      expect(result.needsRefine).toBe(false);
    });

    it('점수는 0과 1 사이여야 함', () => {
      const answer = '테스트 답변';
      const result = critiqueAnswer(answer);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it('여러 이슈가 있을 때 점수가 더 낮아야 함', () => {
      const shortAnswer = '짧음';
      const longAnswer = '긴 답변입니다.\n- 첫 번째 포인트\n- 두 번째 포인트\n- 세 번째 포인트\n\n[파일: test.pdf]';

      const shortResult = critiqueAnswer(shortAnswer);
      const longResult = critiqueAnswer(longAnswer);

      expect(shortResult.score).toBeLessThan(longResult.score);
    });
  });
});

