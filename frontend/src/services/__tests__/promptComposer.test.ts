/**
 * promptComposer 서비스 테스트
 * 프롬프트 작성 기능 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import { composePrompt, ComposeOptions } from '../promptComposer';
import { BuiltContext } from '../contextBuilder';

describe('promptComposer', () => {
  describe('composePrompt', () => {
    it('기본 옵션으로 프롬프트를 작성해야 함', () => {
      const message = '테스트 메시지';
      const result = composePrompt(message);

      expect(result).toHaveProperty('system');
      expect(result).toHaveProperty('user');
      expect(result.system).toContain('CORBU.AI assistant');
      expect(result.user).toContain(message);
    });

    it('context 없이 프롬프트를 작성해야 함', () => {
      const message = '테스트 메시지';
      const result = composePrompt(message);

      expect(result.system).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user).toContain('Task: 테스트 메시지');
    });

    it('프로젝트 컨텍스트를 포함해야 함', () => {
      const message = '테스트 메시지';
      const context: BuiltContext = {
        project_name: '테스트 프로젝트',
        guidelines: [],
        files: [],
      };

      const result = composePrompt(message, context);

      expect(result.user).toContain('Project: 테스트 프로젝트');
    });

    it('지침 컨텍스트를 포함해야 함', () => {
      const message = '테스트 메시지';
      const context: BuiltContext = {
        guidelines: [
          { id: '1', title: '지침 1', content: '내용 1' },
          { id: '2', title: '지침 2', content: '내용 2' },
        ],
        files: [],
      };

      const result = composePrompt(message, context);

      expect(result.user).toContain('Guidelines(2):');
      expect(result.user).toContain('지침 1');
      expect(result.user).toContain('지침 2');
    });

    it('파일 컨텍스트를 포함해야 함', () => {
      const message = '테스트 메시지';
      const context: BuiltContext = {
        guidelines: [],
        files: [
          { id: '1', name: '파일1.pdf', type: 'document', size: 1000 },
          { id: '2', name: '파일2.docx', type: 'document', size: 2000 },
        ],
      };

      const result = composePrompt(message, context);

      expect(result.user).toContain('Files(2):');
      expect(result.user).toContain('파일1.pdf');
      expect(result.user).toContain('파일2.docx');
    });

    it('style 옵션을 적용해야 함', () => {
      const message = '테스트 메시지';
      const options: ComposeOptions = {
        intent: 'qa',
        style: 'concise',
      };

      const result = composePrompt(message, undefined, options);

      expect(result.user).toContain('Style: concise');
    });

    it('tone 옵션을 적용해야 함', () => {
      const message = '테스트 메시지';
      const options: ComposeOptions = {
        intent: 'qa',
        tone: 'friendly',
      };

      const result = composePrompt(message, undefined, options);

      expect(result.system).toContain('Tone: friendly');
    });

    it('requireCitations 옵션이 false이면 인용이 선택사항이어야 함', () => {
      const message = '테스트 메시지';
      const options: ComposeOptions = {
        intent: 'qa',
        requireCitations: false,
      };

      const result = composePrompt(message, undefined, options);

      expect(result.system).toContain('Citations optional');
    });

    it('requireCitations 옵션이 true이면 인용이 필수여야 함', () => {
      const message = '테스트 메시지';
      const options: ComposeOptions = {
        intent: 'qa',
        requireCitations: true,
      };

      const result = composePrompt(message, undefined, options);

      expect(result.system).toContain('Cite sources');
    });

    it('intent 옵션을 적용해야 함', () => {
      const message = '테스트 메시지';
      const options: ComposeOptions = {
        intent: 'summarize',
      };

      const result = composePrompt(message, undefined, options);

      expect(result.user).toContain('Intent: summarize');
    });

    it('모든 컨텍스트와 옵션을 함께 사용할 수 있어야 함', () => {
      const message = '테스트 메시지';
      const context: BuiltContext = {
        project_name: '테스트 프로젝트',
        guidelines: [
          { id: '1', title: '지침 1', content: '내용 1' },
        ],
        files: [
          { id: '1', name: '파일1.pdf', type: 'document', size: 1000 },
        ],
      };
      const options: ComposeOptions = {
        intent: 'analyze',
        style: 'detailed',
        tone: 'professional',
        requireCitations: true,
      };

      const result = composePrompt(message, context, options);

      expect(result.user).toContain('Project: 테스트 프로젝트');
      expect(result.user).toContain('Guidelines(1):');
      expect(result.user).toContain('Files(1):');
      expect(result.user).toContain('Intent: analyze');
      expect(result.user).toContain('Style: detailed');
      expect(result.system).toContain('Tone: professional');
      expect(result.system).toContain('Cite sources');
    });

    it('한국어 출력 지시를 포함해야 함', () => {
      const message = '테스트 메시지';
      const result = composePrompt(message);

      expect(result.user).toContain('Korean');
    });

    it('빈 메시지도 처리해야 함', () => {
      const result = composePrompt('');
      expect(result.system).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user).toContain('Task:');
    });

    it('neutral tone 적용', () => {
      const options: ComposeOptions = {
        intent: 'qa',
        tone: 'neutral',
      };
      const result = composePrompt('메시지', undefined, options);
      expect(result.system).toContain('Tone: neutral');
    });

    it('style balanced 기본값 적용', () => {
      const result = composePrompt('메시지', undefined, { intent: 'qa' });
      expect(result.user).toContain('Style: balanced');
    });
  });
});

