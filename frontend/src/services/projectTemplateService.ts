/**
 * 프로젝트 템플릿 서비스
 * 프로젝트 템플릿 생성, 저장, 조회, 관리
 * 
 * Task-B4: 프로젝트 허브 확장
 */

import { errorLogger } from '../utils/errorLogger';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  guidelines: string[];
  memoryType: 'default' | 'project_exclusive';
  createdAt: string;
  updatedAt: string;
  usageCount: number; // 사용 횟수
  isPublic: boolean; // 공개 템플릿 여부
  author?: string; // 작성자
  preview?: {
    messageCount: number;
    sessionCount: number;
    fileCount: number;
  };
}

class ProjectTemplateService {
  private readonly STORAGE_KEY = 'corbu_project_templates';
  private readonly DEFAULT_TEMPLATES_KEY = 'corbu_default_templates';

  /**
   * 모든 템플릿 조회
   */
  getAllTemplates(): ProjectTemplate[] {
    try {
      const templatesJson = localStorage.getItem(this.STORAGE_KEY);
      return templatesJson ? JSON.parse(templatesJson) : [];
    } catch (error) {
      errorLogger.error('템플릿 조회 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'projectTemplateService',
        action: 'getTemplates',
      });
      return [];
    }
  }

  /**
   * 템플릿 저장
   */
  saveTemplate(template: Omit<ProjectTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): ProjectTemplate {
    const templates = this.getAllTemplates();
    const newTemplate: ProjectTemplate = {
      ...template,
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
    };

    templates.push(newTemplate);
    this.saveTemplates(templates);
    return newTemplate;
  }

  /**
   * 프로젝트에서 템플릿 생성
   */
  createTemplateFromProject(project: {
    name: string;
    description?: string;
    category: string;
    tags?: string[];
    guidelines?: string[];
    memoryType?: 'default' | 'project_exclusive';
  }): ProjectTemplate {
    return this.saveTemplate({
      name: `${project.name} (템플릿)`,
      description: project.description || '',
      category: project.category,
      tags: project.tags || [],
      guidelines: project.guidelines || [],
      memoryType: project.memoryType || 'default',
      isPublic: false,
    });
  }

  /**
   * 템플릿 조회
   */
  getTemplate(templateId: string): ProjectTemplate | null {
    const templates = this.getAllTemplates();
    return templates.find(t => t.id === templateId) || null;
  }

  /**
   * 템플릿 업데이트
   */
  updateTemplate(templateId: string, updates: Partial<ProjectTemplate>): boolean {
    const templates = this.getAllTemplates();
    const index = templates.findIndex(t => t.id === templateId);

    if (index === -1) return false;

    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveTemplates(templates);
    return true;
  }

  /**
   * 템플릿 삭제
   */
  deleteTemplate(templateId: string): boolean {
    const templates = this.getAllTemplates();
    const filtered = templates.filter(t => t.id !== templateId);

    if (filtered.length === templates.length) return false;

    this.saveTemplates(filtered);
    return true;
  }

  /**
   * 템플릿 사용 횟수 증가
   */
  incrementUsageCount(templateId: string): void {
    const template = this.getTemplate(templateId);
    if (template) {
      this.updateTemplate(templateId, {
        usageCount: template.usageCount + 1,
      });
    }
  }

  /**
   * 카테고리별 템플릿 조회
   */
  getTemplatesByCategory(category: string): ProjectTemplate[] {
    const templates = this.getAllTemplates();
    return templates.filter(t => t.category === category);
  }

  /**
   * 인기 템플릿 조회 (사용 횟수 기준)
   */
  getPopularTemplates(limit: number = 10): ProjectTemplate[] {
    const templates = this.getAllTemplates();
    return templates
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  /**
   * 최근 템플릿 조회
   */
  getRecentTemplates(limit: number = 10): ProjectTemplate[] {
    const templates = this.getAllTemplates();
    return templates
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }

  /**
   * 템플릿 검색
   */
  searchTemplates(query: string): ProjectTemplate[] {
    const templates = this.getAllTemplates();
    const lowerQuery = query.toLowerCase();

    return templates.filter(template =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * 기본 템플릿 초기화
   */
  initializeDefaultTemplates(): void {
    const existing = this.getAllTemplates();
    if (existing.length > 0) return; // 이미 템플릿이 있으면 초기화하지 않음

    const defaultTemplates: Omit<ProjectTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>[] = [
      {
        name: '빈 프로젝트',
        description: '기본 설정으로 시작하는 빈 프로젝트',
        category: 'other',
        tags: ['기본', '빈 프로젝트'],
        guidelines: [],
        memoryType: 'default',
        isPublic: true,
      },
      {
        name: '글쓰기 프로젝트',
        description: '글쓰기 작업에 최적화된 프로젝트 템플릿',
        category: 'writing',
        tags: ['글쓰기', '작성'],
        guidelines: [
          '명확하고 간결한 문장을 사용하세요',
          '독자의 관점에서 내용을 검토하세요',
          '적절한 문단 구분을 유지하세요',
        ],
        memoryType: 'default',
        isPublic: true,
      },
      {
        name: '투자 분석 프로젝트',
        description: '투자 분석 및 리서치에 적합한 프로젝트 템플릿',
        category: 'investment',
        tags: ['투자', '분석', '리서치'],
        guidelines: [
          '데이터 기반 분석을 우선시하세요',
          '리스크를 명확히 평가하세요',
          '객관적인 시각을 유지하세요',
        ],
        memoryType: 'project_exclusive',
        isPublic: true,
      },
      {
        name: '학습 프로젝트',
        description: '학습 및 숙제에 최적화된 프로젝트 템플릿',
        category: 'homework',
        tags: ['학습', '숙제', '교육'],
        guidelines: [
          '학습 목표를 명확히 하세요',
          '단계별로 접근하세요',
          '이해한 내용을 정리하세요',
        ],
        memoryType: 'default',
        isPublic: true,
      },
    ];

    defaultTemplates.forEach(template => {
      this.saveTemplate(template);
    });
  }

  /**
   * 템플릿 목록 저장
   */
  private saveTemplates(templates: ProjectTemplate[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
    } catch (error) {
      errorLogger.error('템플릿 저장 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'projectTemplateService',
        action: 'saveTemplates',
      });
    }
  }

  /**
   * 템플릿에서 프로젝트 데이터 생성
   */
  createProjectDataFromTemplate(template: ProjectTemplate): {
    name: string;
    category: string;
    memoryType: 'default' | 'project_exclusive';
    description?: string;
    tags?: string[];
    guidelines?: string[];
  } {
    return {
      name: template.name.replace(' (템플릿)', ''),
      category: template.category,
      memoryType: template.memoryType,
      description: template.description,
      tags: template.tags,
      guidelines: template.guidelines,
    };
  }
}

// 싱글톤 인스턴스
const projectTemplateService = new ProjectTemplateService();

// 기본 템플릿 초기화 (서비스 로드 시)
if (typeof window !== 'undefined') {
  projectTemplateService.initializeDefaultTemplates();
}

export default projectTemplateService;

