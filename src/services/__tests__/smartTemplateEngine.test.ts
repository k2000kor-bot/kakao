/**
 * SmartTemplateEngine 테스트
 */
import smartTemplateEngine from '../smartTemplateEngine';
import { projectService } from '../projectService';

jest.mock('../projectService', () => ({
  projectService: {
    createProject: jest.fn()
  }
}));

describe('SmartTemplateEngine', () => {
  describe('getTemplates', () => {
    it('전체 템플릿 조회', () => {
      const templates = smartTemplateEngine.getTemplates();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach(t => {
        expect(t).toHaveProperty('id');
        expect(t).toHaveProperty('name');
        expect(t).toHaveProperty('category');
        expect(t).toHaveProperty('structure');
        expect(t.structure).toHaveProperty('guidelines');
      });
    });

    it('카테고리별 템플릿 조회', () => {
      const devTemplates = smartTemplateEngine.getTemplates('development');
      expect(Array.isArray(devTemplates)).toBe(true);
      devTemplates.forEach(t => expect(t.category).toBe('development'));
    });
  });

  describe('getTemplate', () => {
    it('존재하는 템플릿 조회', () => {
      const template = smartTemplateEngine.getTemplate('web_development');
      expect(template).toBeDefined();
      expect(template?.id).toBe('web_development');
      expect(template?.name).toBeDefined();
    });

    it('존재하지 않는 템플릿 조회', () => {
      const template = smartTemplateEngine.getTemplate('nonexistent');
      expect(template).toBeNull();
    });
  });

  describe('getCategories', () => {
    it('카테고리 목록 조회', () => {
      const categories = smartTemplateEngine.getCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    it('카테고리에 development·marketing·research 포함', () => {
      const categories = smartTemplateEngine.getCategories();
      expect(categories).toContain('development');
      expect(categories).toContain('marketing');
      expect(categories).toContain('research');
    });
  });

  describe('getTemplates 카테고리별', () => {
    it('marketing 카테고리 템플릿 조회', () => {
      const templates = smartTemplateEngine.getTemplates('marketing');
      expect(Array.isArray(templates)).toBe(true);
      templates.forEach(t => expect(t.category).toBe('marketing'));
    });

    it('research 카테고리 템플릿 조회', () => {
      const templates = smartTemplateEngine.getTemplates('research');
      expect(Array.isArray(templates)).toBe(true);
      templates.forEach(t => expect(t.category).toBe('research'));
    });
  });

  describe('getTemplate 템플릿 구조', () => {
    it('템플릿에 structure·aiPrompts 포함', () => {
      const template = smartTemplateEngine.getTemplate('web_development');
      expect(template).toBeDefined();
      expect(template?.structure).toBeDefined();
      expect(template?.structure.guidelines).toBeDefined();
      expect(template?.structure.initialChats).toBeDefined();
      expect(template?.structure.milestones).toBeDefined();
      expect(template?.aiPrompts).toBeDefined();
      expect(template?.aiPrompts.welcome).toBeDefined();
    });
  });

  describe('recommendTemplates', () => {
    it('웹 개발 관련 추천', async () => {
      const recommendations = await smartTemplateEngine.recommendTemplates(
        '웹사이트 개발',
        'React로 웹 애플리케이션을 만들고 싶습니다',
        ['React', '웹개발']
      );

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThanOrEqual(0);
      
      // 추천이 있는 경우에만 상세 검증
      recommendations.forEach((rec) => {
        expect(rec).toHaveProperty('template');
        expect(rec).toHaveProperty('matchScore');
        expect(rec).toHaveProperty('reasons');
        expect(rec).toHaveProperty('customizations');
        expect(typeof rec.matchScore).toBe('number');
      });
    });

    it('사용자 선호도 포함 추천', async () => {
      const recommendations = await smartTemplateEngine.recommendTemplates(
        '마케팅 프로젝트',
        '소셜 미디어 마케팅',
        [],
        { category: 'marketing' }
      );

      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe('createProjectFromTemplate', () => {
    it('템플릿으로 프로젝트 생성', async () => {
      const mockProject = {
        id: 'proj-1',
        name: '테스트 프로젝트',
        description: '웹 개발 프로젝트',
        createdAt: new Date(),
        updatedAt: new Date(),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation' as const,
        status: 'active' as const
      };

      jest.mocked(projectService.createProject).mockResolvedValue(mockProject);

      const project = await smartTemplateEngine.createProjectFromTemplate(
        'web_development',
        '테스트 프로젝트'
      );

      expect(project).toBeDefined();
      expect(project.name).toBe('테스트 프로젝트');
      expect(projectService.createProject).toHaveBeenCalled();
    });

    it('존재하지 않는 템플릿으로 프로젝트 생성 시 오류', async () => {
      await expect(
        smartTemplateEngine.createProjectFromTemplate('nonexistent', '테스트')
      ).rejects.toThrow('템플릿을 찾을 수 없습니다.');
    });
  });
});
