/**
 * 프롬프트 템플릿 서비스
 * 재사용 가능한 프롬프트 템플릿 관리
 */

import { errorLogger } from '../utils/errorLogger';

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: 'general' | 'code' | 'analysis' | 'creative' | 'project';
  template: string;
  variables: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  isPublic: boolean;
  projectId?: string;
}

export interface TemplateVariable {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'code' | 'file';
  required: boolean;
  defaultValue?: string;
}

class PromptTemplateService {
  private static instance: PromptTemplateService;
  private templates: Map<string, PromptTemplate> = new Map();
  private readonly storageKey = 'promptTemplates';

  constructor() {
    this.loadTemplates();
    this.initializeDefaultTemplates();
  }

  public static getInstance(): PromptTemplateService {
    if (!PromptTemplateService.instance) {
      PromptTemplateService.instance = new PromptTemplateService();
    }
    return PromptTemplateService.instance;
  }

  /**
   * 기본 템플릿 초기화
   */
  private initializeDefaultTemplates(): void {
    const defaultTemplates: PromptTemplate[] = [
      {
        id: 'code-review',
        name: '코드 리뷰',
        description: '코드 리뷰 및 개선 제안',
        category: 'code',
        template: '다음 코드를 리뷰하고 개선 제안을 해주세요:\n\n```\n{{code}}\n```\n\n주요 검토 사항:\n- 코드 품질\n- 성능 최적화\n- 보안 이슈\n- 가독성',
        variables: ['code'],
        tags: ['코드', '리뷰', '개발'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
        isPublic: true,
      },
      {
        id: 'data-analysis',
        name: '데이터 분석',
        description: '데이터 분석 및 인사이트 추출',
        category: 'analysis',
        template: '다음 데이터를 분석하고 주요 인사이트를 제공해주세요:\n\n{{data}}\n\n분석 항목:\n- 통계 요약\n- 트렌드 분석\n- 이상치 탐지\n- 추천 사항',
        variables: ['data'],
        tags: ['데이터', '분석', '인사이트'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
        isPublic: true,
      },
      {
        id: 'document-generation',
        name: '문서 생성',
        description: '프로젝트 문서 자동 생성',
        category: 'project',
        template: '다음 정보를 바탕으로 프로젝트 문서를 작성해주세요:\n\n프로젝트명: {{projectName}}\n설명: {{description}}\n주요 기능: {{features}}\n\n문서 구조:\n1. 개요\n2. 기능 설명\n3. 사용 방법\n4. 기술 스택',
        variables: ['projectName', 'description', 'features'],
        tags: ['문서', '프로젝트', '생성'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
        isPublic: true,
      },
      {
        id: 'bug-fix',
        name: '버그 수정',
        description: '버그 분석 및 수정 제안',
        category: 'code',
        template: '다음 버그를 분석하고 수정 방법을 제안해주세요:\n\n버그 설명: {{bugDescription}}\n에러 메시지: {{errorMessage}}\n관련 코드:\n```\n{{code}}\n```\n\n분석 항목:\n- 원인 분석\n- 수정 방법\n- 예방 조치',
        variables: ['bugDescription', 'errorMessage', 'code'],
        tags: ['버그', '수정', '디버깅'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
        isPublic: true,
      },
      {
        id: 'creative-writing',
        name: '창의적 글쓰기',
        description: '창의적인 콘텐츠 생성',
        category: 'creative',
        template: '다음 주제로 창의적인 글을 작성해주세요:\n\n주제: {{topic}}\n스타일: {{style}}\n길이: {{length}}\n\n요구사항:\n- 독창성\n- 흥미로운 내용\n- 명확한 구조',
        variables: ['topic', 'style', 'length'],
        tags: ['글쓰기', '창의', '콘텐츠'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
        isPublic: true,
      },
    ];

    defaultTemplates.forEach(template => {
      if (!this.templates.has(template.id)) {
        this.templates.set(template.id, template);
      }
    });

    this.saveTemplates();
  }

  /**
   * 템플릿 목록 조회
   */
  getTemplates(category?: string, projectId?: string): PromptTemplate[] {
    let templates = Array.from(this.templates.values());

    if (category) {
      templates = templates.filter(t => t.category === category);
    }

    if (projectId) {
      templates = templates.filter(t => !t.projectId || t.projectId === projectId);
    } else {
      templates = templates.filter(t => t.isPublic || !t.projectId);
    }

    return templates.sort((a, b) => b.usageCount - a.usageCount);
  }

  /**
   * 템플릿 조회
   */
  getTemplate(id: string): PromptTemplate | null {
    return this.templates.get(id) || null;
  }

  /**
   * 템플릿 생성
   */
  createTemplate(template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): PromptTemplate {
    const newTemplate: PromptTemplate = {
      ...template,
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
    };

    this.templates.set(newTemplate.id, newTemplate);
    this.saveTemplates();

    return newTemplate;
  }

  /**
   * 템플릿 업데이트
   */
  updateTemplate(id: string, updates: Partial<PromptTemplate>): PromptTemplate | null {
    const template = this.templates.get(id);
    if (!template) return null;

    const updatedTemplate: PromptTemplate = {
      ...template,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    this.templates.set(id, updatedTemplate);
    this.saveTemplates();

    return updatedTemplate;
  }

  /**
   * 템플릿 삭제
   */
  deleteTemplate(id: string): boolean {
    const deleted = this.templates.delete(id);
    if (deleted) {
      this.saveTemplates();
    }
    return deleted;
  }

  /**
   * 템플릿 사용 (변수 치환)
   */
  useTemplate(id: string, variables: Record<string, string>): string {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error(`템플릿을 찾을 수 없습니다: ${id}`);
    }

    // 사용 횟수 증가
    template.usageCount++;
    this.templates.set(id, template);
    this.saveTemplates();

    // 변수 치환
    let result = template.template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, value);
    }

    // 치환되지 않은 변수 경고
    const remainingVars = result.match(/\{\{(\w+)\}\}/g);
    if (remainingVars) {
      errorLogger.warn('치환되지 않은 변수', {
        component: 'PromptTemplateService',
        action: 'renderTemplate',
        remainingVars,
      });
    }

    return result;
  }

  /**
   * 템플릿 변수 추출
   */
  extractVariables(template: string): string[] {
    const regex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(template)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }

  /**
   * 템플릿 저장
   */
  private saveTemplates(): void {
    try {
      const templatesArray = Array.from(this.templates.values());
      localStorage.setItem(this.storageKey, JSON.stringify(templatesArray));
    } catch (error) {
      errorLogger.error('템플릿 저장 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'PromptTemplateService',
        action: 'saveTemplates',
      });
    }
  }

  /**
   * 템플릿 로드
   */
  private loadTemplates(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const templatesArray: PromptTemplate[] = JSON.parse(stored);
        templatesArray.forEach(template => {
          this.templates.set(template.id, template);
        });
      }
    } catch (error) {
      errorLogger.error('템플릿 로드 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'PromptTemplateService',
        action: 'loadTemplates',
      });
    }
  }
}

export const promptTemplateService = PromptTemplateService.getInstance();
export default promptTemplateService;

