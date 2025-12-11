/**
 * citationInjector 서비스 테스트
 * 인용 주입 기능 테스트
 */

import { injectCitations } from '../citationInjector';
import { BuiltContext } from '../contextBuilder';

describe('citationInjector', () => {
  describe('injectCitations', () => {
    it('context가 없으면 원본 답변을 반환해야 함', () => {
      const answer = '테스트 답변입니다.';
      const result = injectCitations(answer);

      expect(result).toBe(answer);
    });

    it('context가 undefined이면 원본 답변을 반환해야 함', () => {
      const answer = '테스트 답변입니다.';
      const result = injectCitations(answer, undefined);

      expect(result).toBe(answer);
    });

    it('지침이 있으면 인용을 추가해야 함', () => {
      const answer = '테스트 답변입니다.';
      const context: BuiltContext = {
        guidelines: [
          { id: 'guideline-1', title: '테스트 지침 1', content: '내용' },
          { id: 'guideline-2', title: '테스트 지침 2', content: '내용' },
        ],
        files: [],
      };

      const result = injectCitations(answer, context);

      expect(result).toContain(answer);
      expect(result).toContain('지침:');
      expect(result).toContain('[테스트 지침 1]');
      expect(result).toContain('[테스트 지침 2]');
      expect(result).toContain('corbu://guideline/guideline-1');
      expect(result).toContain('corbu://guideline/guideline-2');
    });

    it('파일이 있으면 인용을 추가해야 함', () => {
      const answer = '테스트 답변입니다.';
      const context: BuiltContext = {
        guidelines: [],
        files: [
          { id: 'file-1', name: '테스트 파일 1.pdf', type: 'pdf', size: 1000 },
          { id: 'file-2', name: '테스트 파일 2.docx', type: 'docx', size: 2000 },
        ],
      };

      const result = injectCitations(answer, context);

      expect(result).toContain(answer);
      expect(result).toContain('파일:');
      expect(result).toContain('[테스트 파일 1.pdf]');
      expect(result).toContain('[테스트 파일 2.docx]');
      expect(result).toContain('corbu://file/file-1');
      expect(result).toContain('corbu://file/file-2');
    });

    it('지침과 파일이 모두 있으면 둘 다 인용을 추가해야 함', () => {
      const answer = '테스트 답변입니다.';
      const context: BuiltContext = {
        guidelines: [
          { id: 'guideline-1', title: '테스트 지침 1', content: '내용' },
        ],
        files: [
          { id: 'file-1', name: '테스트 파일 1.pdf', type: 'pdf', size: 1000 },
        ],
      };

      const result = injectCitations(answer, context);

      expect(result).toContain(answer);
      expect(result).toContain('지침:');
      expect(result).toContain('파일:');
      expect(result).toContain('[테스트 지침 1]');
      expect(result).toContain('[테스트 파일 1.pdf]');
    });

    it('지침과 파일이 모두 없으면 원본 답변을 반환해야 함', () => {
      const answer = '테스트 답변입니다.';
      const context: BuiltContext = {
        guidelines: [],
        files: [],
      };

      const result = injectCitations(answer, context);

      expect(result).toBe(answer);
    });

    it('참고 섹션을 포함해야 함', () => {
      const answer = '테스트 답변입니다.';
      const context: BuiltContext = {
        guidelines: [
          { id: 'guideline-1', title: '테스트 지침 1', content: '내용' },
        ],
        files: [],
      };

      const result = injectCitations(answer, context);

      expect(result).toContain('---');
      expect(result).toContain('[참고]');
    });

    it('URL 인코딩을 올바르게 처리해야 함', () => {
      const answer = '테스트 답변입니다.';
      const context: BuiltContext = {
        guidelines: [
          { id: 'guideline with spaces', title: '테스트 지침', content: '내용' },
        ],
        files: [],
      };

      const result = injectCitations(answer, context);

      expect(result).toContain('corbu://guideline/guideline%20with%20spaces');
    });
  });
});

