/**
 * promptTemplateService 서비스 테스트
 * 프롬프트 템플릿 서비스 테스트
 * @jest-environment jsdom
 */
/* eslint-disable jest/no-conditional-expect */

import promptTemplateService from '../promptTemplateService';

// localStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// errorLogger 모킹
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('promptTemplateService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
  });

  describe('싱글톤 인스턴스', () => {
    it('내보낸 인스턴스가 정의되어 있어야 함', () => {
      expect(promptTemplateService).toBeDefined();
    });
  });

  describe('getTemplates', () => {
    it('모든 템플릿을 반환해야 함', () => {
      const templates = promptTemplateService.getTemplates();

      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
    });

    it('기본 템플릿들이 포함되어 있어야 함', () => {
      const templates = promptTemplateService.getTemplates();

      const templateIds = templates.map(t => t.id);
      expect(templateIds).toContain('code-review');
      expect(templateIds).toContain('data-analysis');
      expect(templateIds).toContain('document-generation');
    });

    it('카테고리별로 필터링할 수 있어야 함', () => {
      const codeTemplates = promptTemplateService.getTemplates('code');

      expect(Array.isArray(codeTemplates)).toBe(true);
      codeTemplates.forEach(template => {
        expect(template.category).toBe('code');
      });
    });

    it('analysis 카테고리 템플릿을 필터링할 수 있어야 함', () => {
      const analysisTemplates = promptTemplateService.getTemplates('analysis');

      expect(Array.isArray(analysisTemplates)).toBe(true);
      analysisTemplates.forEach(template => {
        expect(template.category).toBe('analysis');
      });
    });

    it('사용 횟수 순으로 정렬되어야 함', () => {
      const templates = promptTemplateService.getTemplates();

      for (let i = 0; i < templates.length - 1; i++) {
        expect(templates[i].usageCount).toBeGreaterThanOrEqual(
          templates[i + 1].usageCount
        );
      }
    });
  });

  describe('getTemplate', () => {
    it('코드 리뷰 템플릿을 조회할 수 있어야 함', () => {
      const template = promptTemplateService.getTemplate('code-review');

      expect(template).not.toBeNull();
      expect(template?.name).toBe('코드 리뷰');
      expect(template?.category).toBe('code');
    });

    it('데이터 분석 템플릿을 조회할 수 있어야 함', () => {
      const template = promptTemplateService.getTemplate('data-analysis');

      expect(template).not.toBeNull();
      expect(template?.name).toBe('데이터 분석');
      expect(template?.category).toBe('analysis');
    });

    it('존재하지 않는 템플릿은 null을 반환해야 함', () => {
      const template = promptTemplateService.getTemplate('nonexistent');

      expect(template).toBeNull();
    });
  });

  describe('createTemplate', () => {
    it('새 템플릿을 생성할 수 있어야 함', () => {
      const newTemplate = promptTemplateService.createTemplate({
        name: '테스트 템플릿',
        description: '테스트용 템플릿',
        category: 'general',
        template: '테스트 템플릿 내용: {{variable}}',
        variables: ['variable'],
        tags: ['테스트'],
        isPublic: true,
      });

      expect(newTemplate).toBeDefined();
      expect(newTemplate.id).toBeDefined();
      expect(newTemplate.name).toBe('테스트 템플릿');
      expect(newTemplate.createdAt).toBeDefined();
      expect(newTemplate.usageCount).toBe(0);
    });

    it('생성된 템플릿을 조회할 수 있어야 함', () => {
      const newTemplate = promptTemplateService.createTemplate({
        name: '조회 테스트',
        description: '조회 테스트용',
        category: 'general',
        template: '테스트',
        variables: [],
        tags: [],
        isPublic: true,
      });

      const retrieved = promptTemplateService.getTemplate(newTemplate.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe('조회 테스트');
    });

    it('생성된 템플릿이 목록에 포함되어야 함', () => {
      const newTemplate = promptTemplateService.createTemplate({
        name: '목록 테스트',
        description: '목록 테스트용',
        category: 'general',
        template: '테스트',
        variables: [],
        tags: [],
        isPublic: true,
      });

      const templates = promptTemplateService.getTemplates();
      const templateIds = templates.map(t => t.id);
      expect(templateIds).toContain(newTemplate.id);
    });
  });

  describe('updateTemplate', () => {
    it('템플릿을 업데이트할 수 있어야 함', () => {
      const template = promptTemplateService.getTemplate('code-review');
      expect(template).not.toBeNull();

      const updated = promptTemplateService.updateTemplate('code-review', {
        name: '업데이트된 코드 리뷰',
      });

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('업데이트된 코드 리뷰');
      expect(updated?.updatedAt).toBeDefined();
    });

    it('업데이트된 템플릿이 저장되어야 함', () => {
      promptTemplateService.updateTemplate('code-review', {
        description: '업데이트된 설명',
      });

      const retrieved = promptTemplateService.getTemplate('code-review');
      expect(retrieved?.description).toBe('업데이트된 설명');
    });

    it('존재하지 않는 템플릿 업데이트는 null을 반환해야 함', () => {
      const result = promptTemplateService.updateTemplate('nonexistent', {
        name: '업데이트',
      });

      expect(result).toBeNull();
    });
  });

  describe('deleteTemplate', () => {
    it('템플릿을 삭제할 수 있어야 함', () => {
      const newTemplate = promptTemplateService.createTemplate({
        name: '삭제 테스트',
        description: '삭제 테스트용',
        category: 'general',
        template: '테스트',
        variables: [],
        tags: [],
        isPublic: true,
      });

      const deleted = promptTemplateService.deleteTemplate(newTemplate.id);
      expect(deleted).toBe(true);

      const retrieved = promptTemplateService.getTemplate(newTemplate.id);
      expect(retrieved).toBeNull();
    });

    it('존재하지 않는 템플릿 삭제는 false를 반환해야 함', () => {
      const result = promptTemplateService.deleteTemplate('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('useTemplate', () => {
    it('템플릿을 사용하여 변수를 치환할 수 있어야 함', () => {
      const result = promptTemplateService.useTemplate('code-review', {
        code: 'const x = 1;',
      });

      expect(typeof result).toBe('string');
      expect(result).toContain('const x = 1;');
      expect(result).not.toContain('{{code}}');
    });

    it('여러 변수를 치환할 수 있어야 함', () => {
      const result = promptTemplateService.useTemplate('bug-fix', {
        bugDescription: '테스트 버그',
        errorMessage: '테스트 에러',
        code: 'const x = 1;',
      });

      expect(result).toContain('테스트 버그');
      expect(result).toContain('테스트 에러');
      expect(result).toContain('const x = 1;');
    });

    it('템플릿 사용 시 usageCount가 증가해야 함', () => {
      const template = promptTemplateService.getTemplate('code-review');
      const initialCount = template?.usageCount || 0;

      promptTemplateService.useTemplate('code-review', { code: 'test' });

      const updated = promptTemplateService.getTemplate('code-review');
      expect(updated?.usageCount).toBe(initialCount + 1);
    });

    it('존재하지 않는 템플릿 사용 시 에러를 던져야 함', () => {
      expect(() => {
        promptTemplateService.useTemplate('nonexistent', {});
      }).toThrow('템플릿을 찾을 수 없습니다: nonexistent');
    });
  });

  describe('extractVariables', () => {
    it('템플릿에서 변수를 추출할 수 있어야 함', () => {
      const variables = promptTemplateService.extractVariables(
        '템플릿: {{var1}} 그리고 {{var2}}'
      );

      expect(Array.isArray(variables)).toBe(true);
      expect(variables).toContain('var1');
      expect(variables).toContain('var2');
    });

    it('중복 변수는 한 번만 추출해야 함', () => {
      const variables = promptTemplateService.extractVariables(
        '템플릿: {{var1}} 그리고 {{var1}}'
      );

      expect(variables.filter(v => v === 'var1').length).toBe(1);
    });

    it('변수가 없는 템플릿은 빈 배열을 반환해야 함', () => {
      const variables = promptTemplateService.extractVariables('변수 없는 템플릿');

      expect(Array.isArray(variables)).toBe(true);
      expect(variables.length).toBe(0);
    });
  });

  describe('템플릿 데이터 검증', () => {
    it('모든 템플릿이 필수 속성을 가져야 함', () => {
      const templates = promptTemplateService.getTemplates();

      templates.forEach(template => {
        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.description).toBeDefined();
        expect(template.category).toBeDefined();
        expect(Array.isArray(template.variables)).toBe(true);
        expect(Array.isArray(template.tags)).toBe(true);
        expect(template.createdAt).toBeDefined();
        expect(template.updatedAt).toBeDefined();
        expect(typeof template.usageCount).toBe('number');
        expect(typeof template.isPublic).toBe('boolean');
      });
    });

    it('모든 템플릿이 유효한 카테고리를 가져야 함', () => {
      const validCategories = ['general', 'code', 'analysis', 'creative', 'project'];

      const templates = promptTemplateService.getTemplates();
      templates.forEach(template => {
        expect(validCategories).toContain(template.category);
      });
    });
  });
});

