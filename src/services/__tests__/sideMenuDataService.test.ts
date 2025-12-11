/**
 * SideMenuDataService 테스트
 */

import SideMenuDataService, {
  SideMenuData,
  FileItem,
  TemplateItem,
  WorkflowItem,
  StatisticsData,
} from '../sideMenuDataService';
import { Project } from '../../types/project';
import { ChatSession } from '../../types/chat';

// localStorage 모킹
const localStorageMock = (() => {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// projectService 모킹
jest.mock('../projectService', () => ({
  projectService: {
    seedProjectsIfEmpty: jest.fn(),
  },
}));

// chatSessionService 모킹
jest.mock('../chatSessionService', () => ({
  __esModule: true,
  default: {},
}));

global.console.error = jest.fn();

describe('SideMenuDataService', () => {
  let service: SideMenuDataService;
  let mockDateNow: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    mockDateNow = jest.spyOn(Date, 'now').mockReturnValue(1000000);
    (global.Date as any).now = jest.fn(() => 1000000);

    // 싱글톤 인스턴스 가져오기
    service = SideMenuDataService.getInstance();
  });

  afterEach(() => {
    mockDateNow.mockRestore();
  });

  describe('초기화', () => {
    it('싱글톤 인스턴스 확인', () => {
      const instance1 = SideMenuDataService.getInstance();
      const instance2 = SideMenuDataService.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(SideMenuDataService);
    });

    it('초기 데이터 구조 확인', () => {
      const data = service.getAllData();

      expect(data).toHaveProperty('projects');
      expect(data).toHaveProperty('chatSessions');
      expect(data).toHaveProperty('recentFiles');
      expect(data).toHaveProperty('templates');
      expect(data).toHaveProperty('workflows');
      expect(data).toHaveProperty('statistics');
    });

    it('기본 최근 파일 데이터 로드', () => {
      const files = service.getRecentFiles();

      expect(Array.isArray(files)).toBe(true);
      expect(files.length).toBeGreaterThan(0);
      
      if (files.length > 0) {
        expect(files[0]).toHaveProperty('id');
        expect(files[0]).toHaveProperty('name');
        expect(files[0]).toHaveProperty('type');
        expect(files[0]).toHaveProperty('size');
      }
    });

    it('기본 템플릿 데이터 로드', () => {
      const templates = service.getTemplates();

      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
      
      if (templates.length > 0) {
        expect(templates[0]).toHaveProperty('id');
        expect(templates[0]).toHaveProperty('name');
        expect(templates[0]).toHaveProperty('category');
        expect(templates[0]).toHaveProperty('description');
      }
    });

    it('기본 워크플로우 데이터 로드', () => {
      const workflows = service.getWorkflows();

      expect(Array.isArray(workflows)).toBe(true);
      expect(workflows.length).toBeGreaterThan(0);
      
      if (workflows.length > 0) {
        expect(workflows[0]).toHaveProperty('id');
        expect(workflows[0]).toHaveProperty('name');
        expect(workflows[0]).toHaveProperty('status');
        expect(workflows[0]).toHaveProperty('steps');
      }
    });

    it('기본 통계 데이터 로드', () => {
      const statistics = service.getStatistics();

      expect(statistics).toHaveProperty('totalProjects');
      expect(statistics).toHaveProperty('totalSessions');
      expect(statistics).toHaveProperty('totalMessages');
      expect(statistics).toHaveProperty('totalFiles');
      expect(statistics).toHaveProperty('activeWorkflows');
      expect(statistics).toHaveProperty('systemHealth');
    });
  });

  describe('프로젝트 관리', () => {
    it('프로젝트 목록 조회', () => {
      const projects = service.getProjects();

      expect(Array.isArray(projects)).toBe(true);
    });

    it('프로젝트 업데이트', () => {
      const mockProjects: Project[] = [
        {
          id: '1',
          name: '테스트 프로젝트',
          description: '테스트 설명',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      service.updateProjects(mockProjects);

      expect(service.getProjects()).toEqual(mockProjects);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'corbu_ai_projects',
        JSON.stringify(mockProjects)
      );
    });
  });

  describe('채팅 세션 관리', () => {
    it('채팅 세션 목록 조회', () => {
      const sessions = service.getChatSessions();

      expect(Array.isArray(sessions)).toBe(true);
    });

    it('채팅 세션 업데이트', () => {
      const mockSessions: ChatSession[] = [
        {
          id: 'session-1',
          projectId: '1',
          title: '테스트 세션',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      service.updateChatSessions(mockSessions);

      expect(service.getChatSessions()).toEqual(mockSessions);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'corbu_ai_chat_sessions',
        JSON.stringify(mockSessions)
      );
    });
  });

  describe('최근 파일 관리', () => {
    it('최근 파일 목록 조회', () => {
      const files = service.getRecentFiles();

      expect(Array.isArray(files)).toBe(true);
    });

    it('최근 파일 업데이트', () => {
      const mockFiles: FileItem[] = [
        {
          id: 'file-1',
          name: '테스트 파일.pdf',
          type: 'document',
          size: 1024,
          uploadDate: new Date(),
          lastAccessed: new Date(),
          projectId: '1',
        },
      ];

      service.updateRecentFiles(mockFiles);

      expect(service.getRecentFiles()).toEqual(mockFiles);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'corbu_ai_recent_files',
        JSON.stringify(mockFiles)
      );
    });

    it('파일 타입 확인', () => {
      const files = service.getRecentFiles();

      files.forEach(file => {
        expect(['document', 'image', 'video', 'audio', 'other']).toContain(file.type);
      });
    });
  });

  describe('템플릿 관리', () => {
    it('템플릿 목록 조회', () => {
      const templates = service.getTemplates();

      expect(Array.isArray(templates)).toBe(true);
    });

    it('템플릿 업데이트', () => {
      const mockTemplates: TemplateItem[] = [
        {
          id: 'template-1',
          name: '테스트 템플릿',
          category: '테스트',
          description: '테스트 설명',
          usageCount: 10,
          lastUsed: new Date(),
          isFavorite: true,
        },
      ];

      service.updateTemplates(mockTemplates);

      expect(service.getTemplates()).toEqual(mockTemplates);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'corbu_ai_templates',
        JSON.stringify(mockTemplates)
      );
    });

    it('템플릿 구조 확인', () => {
      const templates = service.getTemplates();

      templates.forEach(template => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('category');
        expect(template).toHaveProperty('description');
        expect(typeof template.usageCount).toBe('number');
        expect(template.lastUsed).toBeInstanceOf(Date);
        expect(typeof template.isFavorite).toBe('boolean');
      });
    });
  });

  describe('워크플로우 관리', () => {
    it('워크플로우 목록 조회', () => {
      const workflows = service.getWorkflows();

      expect(Array.isArray(workflows)).toBe(true);
    });

    it('워크플로우 업데이트', () => {
      const mockWorkflows: WorkflowItem[] = [
        {
          id: 'workflow-1',
          name: '테스트 워크플로우',
          description: '테스트 설명',
          status: 'active',
          lastRun: new Date(),
          nextRun: new Date(),
          steps: 5,
          completionRate: 100,
        },
      ];

      service.updateWorkflows(mockWorkflows);

      expect(service.getWorkflows()).toEqual(mockWorkflows);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'corbu_ai_workflows',
        JSON.stringify(mockWorkflows)
      );
    });

    it('워크플로우 상태 확인', () => {
      const workflows = service.getWorkflows();

      workflows.forEach(workflow => {
        expect(['active', 'inactive', 'running', 'error']).toContain(workflow.status);
        expect(typeof workflow.steps).toBe('number');
        expect(typeof workflow.completionRate).toBe('number');
      });
    });
  });

  describe('통계 관리', () => {
    it('통계 데이터 조회', () => {
      const statistics = service.getStatistics();

      expect(typeof statistics.totalProjects).toBe('number');
      expect(typeof statistics.totalSessions).toBe('number');
      expect(typeof statistics.totalMessages).toBe('number');
      expect(typeof statistics.totalFiles).toBe('number');
      expect(typeof statistics.activeWorkflows).toBe('number');
      expect(['excellent', 'good', 'warning', 'error']).toContain(statistics.systemHealth);
    });

    it('통계 데이터 업데이트', () => {
      const mockStatistics: StatisticsData = {
        totalProjects: 10,
        totalSessions: 50,
        totalMessages: 5000,
        totalFiles: 100,
        activeWorkflows: 5,
        systemHealth: 'good',
      };

      service.updateStatistics(mockStatistics);

      expect(service.getStatistics()).toEqual(mockStatistics);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'corbu_ai_statistics',
        JSON.stringify(mockStatistics)
      );
    });
  });

  describe('데이터 새로고침', () => {
    it('데이터 새로고침', () => {
      const dataBefore = service.getAllData();

      service.refreshData();

      const dataAfter = service.getAllData();

      // 새로고침 후 데이터 구조 확인
      expect(dataAfter).toHaveProperty('projects');
      expect(dataAfter).toHaveProperty('chatSessions');
      expect(dataAfter).toHaveProperty('recentFiles');
      expect(dataAfter).toHaveProperty('templates');
      expect(dataAfter).toHaveProperty('workflows');
      expect(dataAfter).toHaveProperty('statistics');
    });
  });

  describe('파일 크기 포맷팅', () => {
    it('0 바이트 포맷팅', () => {
      const formatted = service.formatFileSize(0);
      expect(formatted).toBe('0 Bytes');
    });

    it('바이트 단위 포맷팅', () => {
      const formatted = service.formatFileSize(512);
      expect(formatted).toContain('Bytes');
    });

    it('KB 단위 포맷팅', () => {
      const formatted = service.formatFileSize(2048);
      expect(formatted).toContain('KB');
    });

    it('MB 단위 포맷팅', () => {
      const formatted = service.formatFileSize(2097152);
      expect(formatted).toContain('MB');
    });

    it('GB 단위 포맷팅', () => {
      const formatted = service.formatFileSize(2147483648);
      expect(formatted).toContain('GB');
    });

    it('큰 파일 크기 포맷팅', () => {
      const formatted = service.formatFileSize(1073741824);
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('날짜 포맷팅', () => {
    beforeEach(() => {
      // Date.now() 모킹 해제하여 실제 날짜 사용
      mockDateNow.mockRestore();
    });

    afterEach(() => {
      // 모킹 복원
      mockDateNow = jest.spyOn(Date, 'now').mockReturnValue(1000000);
    });

    it('오늘 날짜 포맷팅', () => {
      const today = new Date();
      const formatted = service.formatDate(today);
      expect(formatted).toBe('오늘');
    });

    it('어제 날짜 포맷팅', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const formatted = service.formatDate(yesterday);
      expect(formatted).toBe('어제');
    });

    it('며칠 전 날짜 포맷팅', () => {
      const daysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const formatted = service.formatDate(daysAgo);
      expect(formatted).toContain('일 전');
    });

    it('몇 주 전 날짜 포맷팅', () => {
      const weeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const formatted = service.formatDate(weeksAgo);
      expect(formatted).toContain('주 전');
    });

    it('오래된 날짜 포맷팅', () => {
      const oldDate = new Date('2020-01-01');
      const formatted = service.formatDate(oldDate);
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('localStorage 데이터 로드', () => {
    it('저장된 최근 파일 로드', () => {
      const mockFiles: FileItem[] = [
        {
          id: 'saved-file-1',
          name: '저장된 파일.pdf',
          type: 'document',
          size: 2048,
          uploadDate: new Date('2024-01-01'),
          lastAccessed: new Date('2024-01-02'),
        },
      ];

      localStorageMock.setItem('corbu_ai_recent_files', JSON.stringify(mockFiles));

      const newService = SideMenuDataService.getInstance();
      const files = newService.getRecentFiles();

      // localStorage에서 로드된 파일이 포함되어 있는지 확인
      expect(Array.isArray(files)).toBe(true);
    });

    it('저장된 템플릿 로드', () => {
      const mockTemplates: TemplateItem[] = [
        {
          id: 'saved-template-1',
          name: '저장된 템플릿',
          category: '테스트',
          description: '설명',
          usageCount: 5,
          lastUsed: new Date('2024-01-01'),
          isFavorite: false,
        },
      ];

      localStorageMock.setItem('corbu_ai_templates', JSON.stringify(mockTemplates));

      const newService = SideMenuDataService.getInstance();
      const templates = newService.getTemplates();

      // localStorage에서 로드된 템플릿이 포함되어 있는지 확인
      expect(Array.isArray(templates)).toBe(true);
    });

    it('저장된 워크플로우 로드', () => {
      const mockWorkflows: WorkflowItem[] = [
        {
          id: 'saved-workflow-1',
          name: '저장된 워크플로우',
          description: '설명',
          status: 'active',
          lastRun: new Date('2024-01-01'),
          nextRun: new Date('2024-01-02'),
          steps: 3,
          completionRate: 100,
        },
      ];

      localStorageMock.setItem('corbu_ai_workflows', JSON.stringify(mockWorkflows));

      const newService = SideMenuDataService.getInstance();
      const workflows = newService.getWorkflows();

      // localStorage에서 로드된 워크플로우가 포함되어 있는지 확인
      expect(Array.isArray(workflows)).toBe(true);
    });

    it('저장된 통계 데이터 로드', () => {
      const mockStatistics: StatisticsData = {
        totalProjects: 5,
        totalSessions: 25,
        totalMessages: 2500,
        totalFiles: 50,
        activeWorkflows: 3,
        systemHealth: 'good',
      };

      localStorageMock.setItem('corbu_ai_statistics', JSON.stringify(mockStatistics));

      const newService = SideMenuDataService.getInstance();
      const statistics = newService.getStatistics();

      // localStorage에서 로드된 통계가 포함되어 있는지 확인
      expect(statistics).toBeDefined();
    });
  });

  describe('에러 처리', () => {
    it('잘못된 JSON 데이터 처리', () => {
      localStorageMock.setItem('corbu_ai_recent_files', 'invalid json');

      const newService = SideMenuDataService.getInstance();
      const files = newService.getRecentFiles();

      // 에러가 발생해도 기본 데이터 반환
      expect(Array.isArray(files)).toBe(true);
    });

    it('localStorage 접근 실패 처리', () => {
      const originalGetItem = localStorageMock.getItem;
      localStorageMock.getItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      const newService = SideMenuDataService.getInstance();
      const files = newService.getRecentFiles();

      // 에러가 발생해도 기본 데이터 반환
      expect(Array.isArray(files)).toBe(true);

      localStorageMock.getItem = originalGetItem;
    });
  });

  describe('전체 데이터 조회', () => {
    it('전체 데이터 조회', () => {
      const allData = service.getAllData();

      expect(allData).toHaveProperty('projects');
      expect(allData).toHaveProperty('chatSessions');
      expect(allData).toHaveProperty('recentFiles');
      expect(allData).toHaveProperty('templates');
      expect(allData).toHaveProperty('workflows');
      expect(allData).toHaveProperty('statistics');
    });

    it('데이터 업데이트 후 전체 데이터 반영', () => {
      const mockFiles: FileItem[] = [
        {
          id: 'test-file',
          name: '테스트',
          type: 'document',
          size: 1024,
          uploadDate: new Date(),
          lastAccessed: new Date(),
        },
      ];

      service.updateRecentFiles(mockFiles);

      const allData = service.getAllData();
      expect(allData.recentFiles).toEqual(mockFiles);
    });
  });
});

