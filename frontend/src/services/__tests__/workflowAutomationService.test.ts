/**
 * WorkflowAutomationService 테스트
 * @jest-environment jsdom
 */
import { WorkflowAutomationService } from '../workflowAutomationService';
import type { WorkflowTemplate, Notification } from '../workflowAutomationService';

jest.mock('../collaborationService', () => ({
  collaborationService: {
    getProjectComments: jest.fn(() => []),
    getProjectUsers: jest.fn(() => [])
  }
}));

jest.mock('../projectKnowledgeService', () => ({
  projectKnowledgeService: {
    getProjectKnowledge: jest.fn(() => [])
  }
}));

const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (i: number) => Object.keys(store)[i] || null,
    get length() {
      return Object.keys(store).length;
    }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('WorkflowAutomationService', () => {
  let service: WorkflowAutomationService;

  beforeEach(() => {
    localStorage.clear();
    service = new WorkflowAutomationService();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('워크플로우 템플릿', () => {
    it('기본 템플릿 조회', () => {
      const templates = service.getWorkflowTemplates();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach(t => {
        expect(t.id).toBeDefined();
        expect(t.name).toBeDefined();
        expect(t.category).toBeDefined();
        expect(t.steps).toBeDefined();
        expect(Array.isArray(t.steps)).toBe(true);
      });
    });

    it('템플릿 생성', () => {
      const newTemplate: Omit<WorkflowTemplate, 'id'> = {
        name: '테스트 워크플로우',
        description: '테스트용',
        category: 'custom',
        complexity: 'simple',
        estimatedDuration: '1주',
        steps: [
          {
            name: '단계 1',
            description: '첫 번째 단계',
            type: 'manual',
            order: 0
          }
        ],
        triggers: [
          {
            id: '1',
            type: 'project_created',
            conditions: [],
            description: '프로젝트 생성 시'
          }
        ]
      };

      const created = service.createWorkflowTemplate(newTemplate);
      expect(created.id).toBeDefined();
      expect(created.name).toBe('테스트 워크플로우');
      expect(created.category).toBe('custom');

      const templates = service.getWorkflowTemplates();
      expect(templates.some(t => t.id === created.id)).toBe(true);
    });
  });

  describe('워크플로우 인스턴스', () => {
    it('프로젝트 워크플로우 목록 조회 (빈 상태)', () => {
      const workflows = service.getProjectWorkflows('project-1');
      expect(Array.isArray(workflows)).toBe(true);
      expect(workflows.length).toBe(0);
    });

    it('워크플로우 인스턴스 생성', () => {
      const templates = service.getWorkflowTemplates();
      const templateId = templates[0].id;

      const instance = service.createWorkflowInstance('project-1', templateId, '테스트 인스턴스');

      expect(instance).toBeDefined();
      expect(instance.id).toBeDefined();
      expect(instance.projectId).toBe('project-1');
      expect(instance.templateId).toBe(templateId);
      expect(instance.name).toBe('테스트 인스턴스');
      expect(instance.status).toBe('active');
      expect(instance.steps.length).toBeGreaterThan(0);
      expect(instance.history.length).toBeGreaterThan(0);

      const workflows = service.getProjectWorkflows('project-1');
      expect(workflows.some(w => w.id === instance.id)).toBe(true);
    });

    it('존재하지 않는 템플릿으로 인스턴스 생성 시 에러', () => {
      expect(() => {
        service.createWorkflowInstance('project-1', 'nonexistent-template');
      }).toThrow('찾을 수 없습니다');
    });

    it('이름 없이 인스턴스 생성 시 템플릿 이름 사용', () => {
      const templates = service.getWorkflowTemplates();
      const templateId = templates[0].id;
      const template = templates[0];

      const instance = service.createWorkflowInstance('project-1', templateId);

      expect(instance.name).toBe(template.name);
      expect(instance.status).toBe('active');
    });
  });

  describe('알림 관리', () => {
    it('알림 목록 조회 (빈 상태)', () => {
      const notifications = service.getProjectNotifications('project-1');
      expect(Array.isArray(notifications)).toBe(true);
      expect(notifications.length).toBe(0);
    });

    it('알림 추가 및 조회', () => {
      const notification: Notification = {
        id: 'notif-1',
        projectId: 'project-1',
        userId: 'user-1',
        type: 'workflow',
        title: '테스트 알림',
        message: '알림 내용',
        priority: 'medium',
        isRead: false,
        createdAt: new Date()
      };

      service.addNotification(notification);
      const notifications = service.getProjectNotifications('project-1');
      expect(notifications.length).toBe(1);
      expect(notifications[0].title).toBe('테스트 알림');
      expect(notifications[0].isRead).toBe(false);
    });

    it('알림 읽음 처리', () => {
      const notification: Notification = {
        id: 'notif-2',
        projectId: 'project-1',
        userId: 'user-1',
        type: 'workflow',
        title: '읽을 알림',
        message: '내용',
        priority: 'low',
        isRead: false,
        createdAt: new Date()
      };

      service.addNotification(notification);
      service.markNotificationAsRead('project-1', 'notif-2');

      const notifications = service.getProjectNotifications('project-1');
      const readNotif = notifications.find(n => n.id === 'notif-2');
      expect(readNotif?.isRead).toBe(true);
      expect(readNotif?.readAt).toBeDefined();
    });

    it('getProjectNotifications에 userId 필터 적용', () => {
      const notif1: Notification = {
        id: 'n1',
        projectId: 'project-1',
        userId: 'user-1',
        type: 'workflow',
        title: '알림1',
        message: '내용',
        priority: 'medium',
        isRead: false,
        createdAt: new Date(),
      };
      const notif2: Notification = {
        id: 'n2',
        projectId: 'project-1',
        userId: 'user-2',
        type: 'workflow',
        title: '알림2',
        message: '내용',
        priority: 'medium',
        isRead: false,
        createdAt: new Date(),
      };

      service.addNotification(notif1);
      service.addNotification(notif2);

      const user1Notifs = service.getProjectNotifications('project-1', 'user-1');
      expect(user1Notifs.length).toBe(1);
      expect(user1Notifs[0].userId).toBe('user-1');
    });
  });
});
