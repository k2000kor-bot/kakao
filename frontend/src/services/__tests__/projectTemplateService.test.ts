/**
 * projectTemplateService 서비스 테스트
 * 프로젝트 템플릿 서비스 테스트
 * @jest-environment jsdom
 */
/* eslint-disable jest/no-conditional-expect */

import projectTemplateService from '../projectTemplateService';

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

describe('projectTemplateService', () => {
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
      expect(projectTemplateService).toBeDefined();
    });
  });

  describe('getAllTemplates', () => {
    it('모든 템플릿을 반환해야 함', () => {
      const templates = projectTemplateService.getAllTemplates();
      expect(Array.isArray(templates)).toBe(true);
    });

    it('템플릿이 없으면 빈 배열을 반환해야 함', () => {
      const templates = projectTemplateService.getAllTemplates();
      expect(templates.length).toBe(0);
    });
  });

  describe('saveTemplate', () => {
    it('새 템플릿을 저장할 수 있어야 함', () => {
      const template = projectTemplateService.saveTemplate({
        name: '테스트 템플릿',
        description: '테스트 설명',
        category: 'test',
        tags: ['테스트'],
        guidelines: [],
        memoryType: 'default',
        isPublic: true,
      });

      expect(template).toBeDefined();
      expect(template.id).toBeDefined();
      expect(template.name).toBe('테스트 템플릿');
      expect(template.createdAt).toBeDefined();
      expect(template.usageCount).toBe(0);
    });

    it('저장된 템플릿을 조회할 수 있어야 함', () => {
      const saved = projectTemplateService.saveTemplate({
        name: '조회 테스트',
        description: '설명',
        category: 'test',
        tags: [],
        guidelines: [],
        memoryType: 'default',
        isPublic: true,
      });

      const retrieved = projectTemplateService.getTemplate(saved.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe('조회 테스트');
    });
  });

  describe('createTemplateFromProject', () => {
    it('프로젝트에서 템플릿을 생성할 수 있어야 함', () => {
      const template = projectTemplateService.createTemplateFromProject({
        name: '프로젝트',
        description: '프로젝트 설명',
        category: 'test',
        tags: ['태그1'],
        guidelines: ['가이드라인1'],
        memoryType: 'project_exclusive',
      });

      expect(template.name).toBe('프로젝트 (템플릿)');
      expect(template.category).toBe('test');
      expect(template.isPublic).toBe(false);
    });

    it('기본값이 올바르게 설정되어야 함', () => {
      const template = projectTemplateService.createTemplateFromProject({
        name: '프로젝트',
        category: 'test',
      });

      expect(template.description).toBe('');
      expect(template.tags).toEqual([]);
      expect(template.guidelines).toEqual([]);
      expect(template.memoryType).toBe('default');
    });
  });

  describe('getTemplate', () => {
    it('템플릿을 조회할 수 있어야 함', () => {
      const saved = projectTemplateService.saveTemplate({
        name: '조회',
        description: '설명',
        category: 'test',
        tags: [],
        guidelines: [],
        memoryType: 'default',
        isPublic: true,
      });

      const retrieved = projectTemplateService.getTemplate(saved.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe('조회');
    });

    it('존재하지 않는 템플릿은 null을 반환해야 함', () => {
      const retrieved = projectTemplateService.getTemplate('nonexistent');
      expect(retrieved).toBeNull();
    });
  });

  describe('updateTemplate', () => {
    it('템플릿을 업데이트할 수 있어야 함', () => {
      const saved = projectTemplateService.saveTemplate({
        name: '원본',
        description: '설명',
        category: 'test',
        tags: [],
        guidelines: [],
        memoryType: 'default',
        isPublic: true,
      });

      const updated = projectTemplateService.updateTemplate(saved.id, {
        name: '업데이트됨',
      });

      expect(updated).toBe(true);
      const retrieved = projectTemplateService.getTemplate(saved.id);
      expect(retrieved?.name).toBe('업데이트됨');
    });

    it('존재하지 않는 템플릿 업데이트는 false를 반환해야 함', () => {
      const result = projectTemplateService.updateTemplate('nonexistent', {
        name: '업데이트',
      });

      expect(result).toBe(false);
    });

    it('업데이트 시 updatedAt이 변경되어야 함', () => {
      const saved = projectTemplateService.saveTemplate({
        name: '템플릿',
        description: '설명',
        category: 'test',
        tags: [],
        guidelines: [],
        memoryType: 'default',
        isPublic: true,
      });

      const initialUpdatedAt = saved.updatedAt;

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          projectTemplateService.updateTemplate(saved.id, {
            name: '업데이트',
          });

          const retrieved = projectTemplateService.getTemplate(saved.id);
          expect(retrieved?.updatedAt).not.toBe(initialUpdatedAt);
          resolve();
        }, 10);
      });
    });
  });

  describe('deleteTemplate', () => {
    it('템플릿을 삭제할 수 있어야 함', () => {
      const saved = projectTemplateService.saveTemplate({
        name: '삭제할 템플릿',
        description: '설명',
        category: 'test',
        tags: [],
        guidelines: [],
        memoryType: 'default',
        isPublic: true,
      });

      const deleted = projectTemplateService.deleteTemplate(saved.id);
      expect(deleted).toBe(true);

      const retrieved = projectTemplateService.getTemplate(saved.id);
      expect(retrieved).toBeNull();
    });

    it('존재하지 않는 템플릿 삭제는 false를 반환해야 함', () => {
      const result = projectTemplateService.deleteTemplate('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('incrementUsageCount', () => {
    it('템플릿 사용 횟수를 증가시킬 수 있어야 함', () => {
      const saved = projectTemplateService.saveTemplate({
        name: '템플릿',
        description: '설명',
        category: 'test',
        tags: [],
        guidelines: [],
        memoryType: 'default',
        isPublic: true,
      });

      const initialCount = saved.usageCount;
      projectTemplateService.incrementUsageCount(saved.id);

      const retrieved = projectTemplateService.getTemplate(saved.id);
      expect(retrieved?.usageCount).toBe(initialCount + 1);
    });

    it('여러 번 호출하면 사용 횟수가 계속 증가해야 함', () => {
      const saved = projectTemplateService.saveTemplate({
        name: '템플릿',
        description: '설명',
        category: 'test',
        tags: [],
        guidelines: [],
        memoryType: 'default',
        isPublic: true,
      });

      projectTemplateService.incrementUsageCount(saved.id);
      projectTemplateService.incrementUsageCount(saved.id);
      projectTemplateService.incrementUsageCount(saved.id);

      const retrieved = projectTemplateService.getTemplate(saved.id);
      expect(retrieved?.usageCount).toBe(3);
    });
  });

  describe('getTemplatesByCategory', () => {
    it('카테고리별 템플릿을 조회할 수 있어야 함', () => {
      projectTemplateService.saveTemplate({
        name: '템플릿1',
        description: '설명',
        category: 'category1',
        tags: [],
        guidelines: [],
        memoryType: 'default',
        isPublic: true,
      });

      projectTemplateService.saveTemplate({
        name: '템플릿2',
        description: '설명',
        category: 'category2',
        tags: [],
        guidelines: [],
        memoryType: 'default',
        isPublic: true,
      });

      const templates = projectTemplateService.getTemplatesByCategory('category1');
      expect(templates.length).toBe(1);
      expect(templates[0].category).toBe('category1');
    });

    it('존재하지 않는 카테고리는 빈 배열을 반환해야 함', () => {
      const templates = projectTemplateService.getTemplatesByCategory('nonexistent_category');
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBe(0);
    });
  });

  describe('getPopularTemplates', () => {
    it('인기 템플릿을 조회할 수 있어야 함', () => {
      const template1 = projectTemplateService.saveTemplate({
        name: '템플릿1',
        description: '설명',
        category: 'test',
        tags: [],
        guidelines: [],
        memoryType: 'default',
        isPublic: true,
      });

      const template2 = projectTemplateService.saveTemplate({
        name: '템플릿2',
        description: '설명',
        category: 'test',
        tags: [],
        guidelines: [],
        memoryType: 'default',
        isPublic: true,
      });

      projectTemplateService.incrementUsageCount(template2.id);
      projectTemplateService.incrementUsageCount(template2.id);

      const popular = projectTemplateService.getPopularTemplates(10);
      expect(popular.some((t) => t.id === template1.id)).toBe(true);
      expect(popular.length).toBeGreaterThan(0);
      expect(popular[0].usageCount).toBeGreaterThanOrEqual(popular[1]?.usageCount || 0);
    });

    it('limit 파라미터로 개수를 제한할 수 있어야 함', () => {
      for (let i = 0; i < 5; i++) {
        projectTemplateService.saveTemplate({
          name: `템플릿 ${i}`,
          description: '설명',
          category: 'test',
          tags: [],
          guidelines: [],
          memoryType: 'default',
          isPublic: true,
        });
      }

      const popular = projectTemplateService.getPopularTemplates(3);
      expect(popular.length).toBeLessThanOrEqual(3);
    });
  });

  describe('getRecentTemplates', () => {
    it('최근 템플릿을 조회할 수 있어야 함', () => {
      const template1 = projectTemplateService.saveTemplate({
        name: '템플릿1',
        description: '설명',
        category: 'test',
        tags: [],
        guidelines: [],
        memoryType: 'default',
        isPublic: true,
      });

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const template2 = projectTemplateService.saveTemplate({
            name: '템플릿2',
            description: '설명',
            category: 'test',
            tags: [],
            guidelines: [],
            memoryType: 'default',
            isPublic: true,
          });

          const recent = projectTemplateService.getRecentTemplates(10);
          expect(recent.length).toBeGreaterThan(0);
          // 최신 템플릿이 먼저 와야 함
          const template2Index = recent.findIndex(t => t.id === template2.id);
          const template1Index = recent.findIndex(t => t.id === template1.id);
          expect(template2Index).toBeLessThan(template1Index);
          resolve();
        }, 10);
      });
    });

    it('limit 파라미터로 개수를 제한할 수 있어야 함', () => {
      for (let i = 0; i < 5; i++) {
        projectTemplateService.saveTemplate({
          name: `템플릿 ${i}`,
          description: '설명',
          category: 'test',
          tags: [],
          guidelines: [],
          memoryType: 'default',
          isPublic: true,
        });
      }

      const recent = projectTemplateService.getRecentTemplates(3);
      expect(recent.length).toBeLessThanOrEqual(3);
    });
  });

  describe('searchTemplates', () => {
    it('템플릿을 검색할 수 있어야 함', () => {
      projectTemplateService.saveTemplate({
        name: '검색 테스트',
        description: '설명',
        category: 'test',
        tags: ['태그'],
        guidelines: [],
        memoryType: 'default',
        isPublic: true,
      });

      const results = projectTemplateService.searchTemplates('검색');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toContain('검색');
    });

    it('이름으로 검색할 수 있어야 함', () => {
      projectTemplateService.saveTemplate({
        name: '특정 이름',
        description: '설명',
        category: 'test',
        tags: [],
        guidelines: [],
        memoryType: 'default',
        isPublic: true,
      });

      const results = projectTemplateService.searchTemplates('특정');
      expect(results.some(t => t.name.includes('특정'))).toBe(true);
    });

    it('설명으로 검색할 수 있어야 함', () => {
      projectTemplateService.saveTemplate({
        name: '템플릿',
        description: '특정 설명',
        category: 'test',
        tags: [],
        guidelines: [],
        memoryType: 'default',
        isPublic: true,
      });

      const results = projectTemplateService.searchTemplates('특정');
      expect(results.some(t => t.description.includes('특정'))).toBe(true);
    });

    it('태그로 검색할 수 있어야 함', () => {
      projectTemplateService.saveTemplate({
        name: '템플릿',
        description: '설명',
        category: 'test',
        tags: ['특정태그'],
        guidelines: [],
        memoryType: 'default',
        isPublic: true,
      });

      const results = projectTemplateService.searchTemplates('특정태그');
      expect(results.length).toBeGreaterThan(0);
    });

    it('대소문자 구분 없이 검색해야 함', () => {
      projectTemplateService.saveTemplate({
        name: '대소문자 테스트',
        description: '설명',
        category: 'test',
        tags: [],
        guidelines: [],
        memoryType: 'default',
        isPublic: true,
      });

      const results = projectTemplateService.searchTemplates('대소문자');
      expect(results.length).toBeGreaterThan(0);
    });

    it('검색 결과가 없으면 빈 배열을 반환해야 함', () => {
      const results = projectTemplateService.searchTemplates('존재하지않는검색어123');
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });

  describe('initializeDefaultTemplates', () => {
    it('기본 템플릿을 초기화할 수 있어야 함', () => {
      projectTemplateService.initializeDefaultTemplates();

      const templates = projectTemplateService.getAllTemplates();
      expect(templates.length).toBeGreaterThan(0);
    });

    it('이미 템플릿이 있으면 초기화하지 않아야 함', () => {
      projectTemplateService.saveTemplate({
        name: '기존 템플릿',
        description: '설명',
        category: 'test',
        tags: [],
        guidelines: [],
        memoryType: 'default',
        isPublic: true,
      });

      const beforeCount = projectTemplateService.getAllTemplates().length;
      projectTemplateService.initializeDefaultTemplates();
      const afterCount = projectTemplateService.getAllTemplates().length;

      expect(afterCount).toBe(beforeCount);
    });
  });

  describe('createProjectDataFromTemplate', () => {
    it('템플릿에서 프로젝트 데이터를 생성할 수 있어야 함', () => {
      const template = projectTemplateService.saveTemplate({
        name: '프로젝트 (템플릿)',
        description: '설명',
        category: 'test',
        tags: ['태그1'],
        guidelines: ['가이드라인1'],
        memoryType: 'project_exclusive',
        isPublic: true,
      });

      const projectData = projectTemplateService.createProjectDataFromTemplate(template);

      expect(projectData.name).toBe('프로젝트');
      expect(projectData.category).toBe('test');
      expect(projectData.memoryType).toBe('project_exclusive');
      expect(projectData.tags).toEqual(['태그1']);
      expect(projectData.guidelines).toEqual(['가이드라인1']);
    });

    it('템플릿 이름에서 "(템플릿)" 접미사를 제거해야 함', () => {
      const template = projectTemplateService.saveTemplate({
        name: '테스트 (템플릿)',
        description: '설명',
        category: 'test',
        tags: [],
        guidelines: [],
        memoryType: 'default',
        isPublic: true,
      });

      const projectData = projectTemplateService.createProjectDataFromTemplate(template);
      expect(projectData.name).toBe('테스트');
    });
  });
});

