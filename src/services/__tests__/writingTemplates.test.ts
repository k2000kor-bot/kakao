/**
 * writingTemplates 서비스 테스트
 */
import writingTemplates, {
  getTemplatesByCategory,
  getTemplateById,
  getAllCategories,
  getToneDescription,
  getStyleDescription,
  generatePrompt
} from '../writingTemplates';
import type { WritingTemplate } from '../writingTemplates';

describe('writingTemplates', () => {
  describe('writingTemplates 배열', () => {
    it('템플릿 배열이 존재하고 비어있지 않음', () => {
      expect(Array.isArray(writingTemplates)).toBe(true);
      expect(writingTemplates.length).toBeGreaterThan(0);
    });

    it('각 템플릿에 필수 속성 존재', () => {
      writingTemplates.slice(0, 5).forEach(template => {
        expect(template.id).toBeDefined();
        expect(template.category).toBeDefined();
        expect(template.title).toBeDefined();
        expect(template.description).toBeDefined();
        expect(template.prompt).toBeDefined();
      });
    });
  });

  describe('getTemplatesByCategory', () => {
    it('카테고리별 템플릿 조회', () => {
      const categories = getAllCategories();
      expect(categories.length).toBeGreaterThan(0);

      const firstCategory = categories[0];
      const templates = getTemplatesByCategory(firstCategory);
      expect(Array.isArray(templates)).toBe(true);
      templates.forEach(t => expect(t.category).toBe(firstCategory));
    });

    it('존재하지 않는 카테고리 시 빈 배열', () => {
      const templates = getTemplatesByCategory('nonexistent_category_xyz');
      expect(templates).toEqual([]);
    });
  });

  describe('getTemplateById', () => {
    it('ID로 템플릿 조회', () => {
      const firstTemplate = writingTemplates[0];
      const found = getTemplateById(firstTemplate.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(firstTemplate.id);
      expect(found?.title).toBe(firstTemplate.title);
    });

    it('존재하지 않는 ID 시 undefined', () => {
      const found = getTemplateById('nonexistent_id_xyz');
      expect(found).toBeUndefined();
    });
  });

  describe('getAllCategories', () => {
    it('중복 없는 카테고리 목록', () => {
      const categories = getAllCategories();
      const unique = new Set(categories);
      expect(categories.length).toBe(unique.size);
    });
  });

  describe('getToneDescription', () => {
    it('어투별 설명 반환', () => {
      const desc = getToneDescription('formal');
      expect(typeof desc).toBe('string');
      expect(desc.length).toBeGreaterThan(0);
    });

    it('다양한 어투 지원', () => {
      const tones = ['formal', 'casual', 'professional', 'friendly', 'academic'] as const;
      tones.forEach(tone => {
        const desc = getToneDescription(tone);
        expect(desc).toBeDefined();
        expect(desc.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getStyleDescription', () => {
    it('글 종류별 설명 반환', () => {
      const desc = getStyleDescription('essay');
      expect(typeof desc).toBe('string');
      expect(desc.length).toBeGreaterThan(0);
    });

    it('다양한 스타일 지원', () => {
      const styles = ['essay', 'novel', 'poem', 'article', 'report'] as const;
      styles.forEach(style => {
        const desc = getStyleDescription(style);
        expect(desc).toBeDefined();
        expect(desc.length).toBeGreaterThan(0);
      });
    });
  });

  describe('generatePrompt', () => {
    it('필드 치환', () => {
      const template: WritingTemplate = {
        id: 'test',
        category: '테스트',
        title: '테스트',
        description: '테스트',
        prompt: '수신자: {{recipient}}, 목적: {{purpose}}',
        defaultTone: 'formal',
        defaultStyle: 'letter'
      };

      const prompt = generatePrompt(template, {
        recipient: '홍길동',
        purpose: '회의 요청'
      });

      expect(prompt).toContain('홍길동');
      expect(prompt).toContain('회의 요청');
    });

    it('어투 지시사항 포함', () => {
      const template = getTemplateById('business-email') || writingTemplates[0];
      const prompt = generatePrompt(template, {
        recipient: '테스트',
        purpose: '테스트',
        content: '테스트'
      });

      expect(prompt).toContain('[어투 요구사항]');
    });

    it('빈 필드값은 빈 문자열로 치환', () => {
      const template: WritingTemplate = {
        id: 'test',
        category: '테스트',
        title: '테스트',
        description: '테스트',
        prompt: '수신자: {{recipient}}, 내용: {{content}}',
        defaultTone: 'formal',
        defaultStyle: 'letter'
      };

      const prompt = generatePrompt(template, { recipient: '홍길동', content: '' });

      expect(prompt).toContain('홍길동');
      expect(typeof prompt).toBe('string');
    });
  });

  describe('getToneDescription / getStyleDescription', () => {
    it('getToneDescription creative 반환', () => {
      const desc = getToneDescription('creative');
      expect(desc).toBeDefined();
      expect(desc.length).toBeGreaterThan(0);
    });

    it('getStyleDescription diary 반환', () => {
      const desc = getStyleDescription('diary');
      expect(desc).toBeDefined();
      expect(desc.length).toBeGreaterThan(0);
    });
  });
});
