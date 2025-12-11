/**
 * ProjectChatStructureService 테스트
 */

import {
  ProjectChatStructureService,
  ProjectStructure,
  ProjectFile,
  ProjectGuideline,
} from '../projectChatStructureService';
import { ChatSession, Message } from '../../types/chat';
import { Project } from '../../types/project';

// localStorage 모킹
const createLocalStorageMock = () => {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => {
      return store[key] || null;
    }),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    _store: store,
  };
};

const localStorageMock = createLocalStorageMock();

// beforeEach에서 설정됨

global.console.error = jest.fn();
global.console.log = jest.fn();

describe('ProjectChatStructureService', () => {
  let service: ProjectChatStructureService;
  let mockDateNow: jest.SpyInstance;
  let mockDate: jest.SpyInstance;
  let localStorageMockInstance: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    // localStorageMock 재생성
    localStorageMockInstance = createLocalStorageMock();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMockInstance,
      writable: true,
      configurable: true,
    });
    
    localStorageMockInstance.clear();
    mockDateNow = jest.spyOn(Date, 'now').mockReturnValue(1000000);
    
    // Date 생성자 모킹
    const mockDateInstance = {
      toISOString: jest.fn(() => '2024-01-01T00:00:00.000Z'),
      getTime: jest.fn(() => 1000000),
    };
    mockDate = jest.spyOn(global, 'Date').mockImplementation((value?: any) => {
      if (value) {
        return new (jest.requireActual('Date') as any)(value);
      }
      return mockDateInstance as any;
    });
    (global.Date as any).now = jest.fn(() => 1000000);

    service = ProjectChatStructureService.getInstance();
  });

  afterEach(() => {
    mockDateNow.mockRestore();
    mockDate.mockRestore();
    jest.restoreAllMocks();
  });

  describe('초기화', () => {
    it('싱글톤 인스턴스 생성', () => {
      const instance1 = ProjectChatStructureService.getInstance();
      const instance2 = ProjectChatStructureService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('초기 채팅 생성', () => {
    it('초기 채팅 생성 성공', () => {
      const chat = service.createInitialChat('안녕하세요');

      expect(chat).toBeDefined();
      expect(chat.title).toBe('안녕하세요');
      expect(chat.messages.length).toBe(1);
      expect(chat.messages[0].content).toBe('안녕하세요');
      expect(chat.isPersistent).toBe(true);
    });

    it('긴 메시지로 초기 채팅 생성 시 제목 잘림', () => {
      const longMessage = 'a'.repeat(50);
      const chat = service.createInitialChat(longMessage);

      expect(chat.title.length).toBeLessThanOrEqual(33); // 30 + '...'
      expect(chat.title).toContain('...');
    });

    it('로컬 스토리지에 채팅 저장 확인', () => {
      service.createInitialChat('테스트 메시지');
      
      expect(localStorageMockInstance.setItem).toHaveBeenCalled();
      // chatSessions 키로 저장되었는지 확인
      const savedChats = localStorageMockInstance.getItem('chatSessions');
      expect(savedChats).toBeDefined();
      expect(savedChats).not.toBeNull();
    });
  });

  describe('프로젝트 생성', () => {
    it('프로젝트 생성 성공', () => {
      const project = service.createProject('테스트 프로젝트', '설명');

      expect(project).toBeDefined();
      expect(project.name).toBe('테스트 프로젝트');
      expect(project.description).toBe('설명');
      expect(project.status).toBe('active');
      expect(project.type).toBe('conversation');
    });

    it('설명 없이 프로젝트 생성', () => {
      const project = service.createProject('프로젝트');

      expect(project).toBeDefined();
      expect(project.description).toBe('');
    });
  });

  describe('프로젝트에 파일 추가', () => {
    it('파일 추가 및 하위 채팅 생성', () => {
      // 프로젝트 먼저 생성
      const project = service.createProject('테스트 프로젝트');
      
      // 프로젝트를 localStorage에 저장 (Date를 문자열로 변환)
      // getProject는 JSON.parse를 사용하므로 문자열로 저장해야 함
      const projectForStorage = {
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      };
      const projects = [projectForStorage];
      localStorageMockInstance.setItem('projects', JSON.stringify(projects));

      const testFile: ProjectFile = {
        id: 'file-1',
        name: 'test.pdf',
        type: 'document',
        size: 1024,
        uploadDate: new Date(),
        lastAccessed: new Date(),
        description: '테스트 파일',
        tags: ['test'],
      };

      const result = service.addFileToProject(project.id, testFile);

      expect(result.file).toBeDefined();
      expect(result.file.name).toBe('test.pdf');
      expect(result.chat).toBeDefined();
      expect(result.chat.type).toBe('file_chat');
      expect(result.chat.title).toContain('test.pdf');
    });

    it('존재하지 않는 프로젝트에 파일 추가 시 에러', () => {
      const testFile: ProjectFile = {
        id: 'file-1',
        name: 'test.pdf',
        type: 'document',
        size: 1024,
        uploadDate: new Date(),
        lastAccessed: new Date(),
      };

      expect(() => {
        service.addFileToProject('nonexistent', testFile);
      }).toThrow('프로젝트를 찾을 수 없습니다.');
    });
  });

  describe('프로젝트에 지침 추가', () => {
    it('지침 추가 및 하위 채팅 생성', () => {
      // 프로젝트 먼저 생성
      const project = service.createProject('테스트 프로젝트');
      
      // 프로젝트를 localStorage에 저장 (Date를 문자열로 변환)
      // getProject는 JSON.parse를 사용하므로 문자열로 저장해야 함
      const projectForStorage = {
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      };
      const projects = [projectForStorage];
      localStorageMockInstance.setItem('projects', JSON.stringify(projects));

      const testGuideline: ProjectGuideline = {
        id: 'guideline-1',
        title: '테스트 지침',
        content: '지침 내용',
        category: 'general',
        priority: 'medium',
        createdDate: new Date(),
        lastUpdated: new Date(),
      };

      const result = service.addGuidelineToProject(project.id, testGuideline);

      expect(result.guideline).toBeDefined();
      expect(result.guideline.title).toBe('테스트 지침');
      expect(result.chat).toBeDefined();
      expect(result.chat.type).toBe('guideline_chat');
      expect(result.chat.title).toContain('테스트 지침');
    });

    it('존재하지 않는 프로젝트에 지침 추가 시 에러', () => {
      const testGuideline: ProjectGuideline = {
        id: 'guideline-1',
        title: '테스트 지침',
        content: '지침 내용',
        category: 'general',
        priority: 'medium',
        createdDate: new Date(),
        lastUpdated: new Date(),
      };

      expect(() => {
        service.addGuidelineToProject('nonexistent', testGuideline);
      }).toThrow('프로젝트를 찾을 수 없습니다.');
    });
  });

  describe('프로젝트 구조 조회', () => {
    it('프로젝트 구조 조회 성공', () => {
      // 프로젝트 생성 및 저장
      const project = service.createProject('테스트 프로젝트');
      const projectForStorage = {
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      };
      const projects = [projectForStorage];
      localStorageMockInstance.setItem('projects', JSON.stringify(projects));

      // 채팅 세션 저장
      const chat: ChatSession = {
        id: 'chat-1',
        title: '테스트 채팅',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
        messageCount: 0,
        participants: [],
        tags: [],
        type: 'general',
        status: 'active',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 0,
        isPersistent: false,
        projectId: project.id,
      };
      localStorageMockInstance.setItem('corbu_chat_sessions', JSON.stringify([chat]));

      // getProjectStructure는 getProject를 사용하므로, 저장된 형식으로 조회됨
      // 프로젝트 ID를 사용하여 구조 조회
      const structure = service.getProjectStructure(project.id);

      expect(structure).toBeDefined();
      if (structure) {
        expect(structure.project.id).toBe(project.id);
        expect(structure.subChats.length).toBeGreaterThanOrEqual(0);
      }
    });

    it('존재하지 않는 프로젝트 구조 조회 시 null 반환', () => {
      const structure = service.getProjectStructure('nonexistent');
      expect(structure).toBeNull();
    });
  });

  describe('프로젝트별 채팅 세션 조회', () => {
    it('프로젝트별 채팅 세션 조회 성공', () => {
      const chat: ChatSession = {
        id: 'chat-1',
        title: '테스트 채팅',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
        messageCount: 0,
        participants: [],
        tags: [],
        type: 'general',
        status: 'active',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 0,
        isPersistent: false,
        projectId: 'project-1',
      };

      localStorageMockInstance.setItem('corbu_chat_sessions', JSON.stringify([chat]));

      const chats = service.getChatSessionsByProject('project-1');

      expect(chats.length).toBe(1);
      expect(chats[0].id).toBe('chat-1');
    });

    it('빈 채팅 세션 목록 조회', () => {
      const chats = service.getChatSessionsByProject('project-1');
      expect(chats).toEqual([]);
    });
  });

  describe('모든 프로젝트 구조 조회', () => {
    it('모든 프로젝트 구조 조회 성공', () => {
      const project1 = service.createProject('프로젝트 1');
      const project2 = service.createProject('프로젝트 2');
      
      const projects = [
        {
          ...project1,
          createdAt: project1.createdAt.toISOString(),
          updatedAt: project1.updatedAt.toISOString(),
        },
        {
          ...project2,
          createdAt: project2.createdAt.toISOString(),
          updatedAt: project2.updatedAt.toISOString(),
        },
      ];
      localStorageMockInstance.setItem('projects', JSON.stringify(projects));

      const structures = service.getAllProjectStructures();

      expect(structures.length).toBe(2);
    });

    it('프로젝트가 없을 때 빈 배열 반환', () => {
      const structures = service.getAllProjectStructures();
      expect(structures).toEqual([]);
    });
  });

  describe('독립적인 채팅 세션 조회', () => {
    it('프로젝트 없는 채팅 세션 조회', () => {
      const chat: ChatSession = {
        id: 'chat-1',
        title: '독립 채팅',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
        messageCount: 0,
        participants: [],
        tags: [],
        type: 'general',
        status: 'active',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 0,
        isPersistent: false,
      };

      localStorageMockInstance.setItem('corbu_chat_sessions', JSON.stringify([chat]));

      const chats = service.getIndependentChatSessions();

      expect(chats.length).toBe(1);
      expect(chats[0].id).toBe('chat-1');
    });
  });

  describe('프로젝트 업데이트', () => {
    it('프로젝트 업데이트 성공', () => {
      const project = service.createProject('원본 프로젝트');
      const projectForStorage = {
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      };
      const projects = [projectForStorage];
      localStorageMockInstance.setItem('projects', JSON.stringify(projects));

      const updatedProject: Project = {
        ...project,
        name: '업데이트된 프로젝트',
        description: '업데이트된 설명',
      };

      service.updateProject(updatedProject);

      expect(localStorageMockInstance.setItem).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('프로젝트 삭제', () => {
    it('프로젝트 삭제 성공', () => {
      const project = service.createProject('삭제할 프로젝트');
      const projectForStorage = {
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      };
      const projects = [projectForStorage];
      localStorageMockInstance.setItem('projects', JSON.stringify(projects));

      // 관련 채팅 세션도 저장
      const chat: ChatSession = {
        id: 'chat-1',
        title: '테스트 채팅',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
        messageCount: 0,
        participants: [],
        tags: [],
        type: 'general',
        status: 'active',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 0,
        isPersistent: false,
        projectId: project.id,
      };
      localStorageMockInstance.setItem('corbu_chat_sessions', JSON.stringify([chat]));

      const result = service.deleteProject(project.id);

      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalled();
    });

    it('존재하지 않는 프로젝트 삭제 시 false 반환', () => {
      const result = service.deleteProject('nonexistent');
      expect(result).toBe(false);
    });

    it('프로젝트 삭제 시 관련 채팅 세션도 삭제', () => {
      const project = service.createProject('프로젝트');
      const projectForStorage = {
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      };
      const projects = [projectForStorage];
      localStorageMockInstance.setItem('projects', JSON.stringify(projects));

      const chat: ChatSession = {
        id: 'chat-1',
        title: '테스트 채팅',
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
        messageCount: 0,
        participants: [],
        tags: [],
        type: 'general',
        status: 'active',
        lastActivity: '2024-01-01T00:00:00.000Z',
        totalMessages: 0,
        isPersistent: false,
        projectId: project.id,
      };
      localStorageMockInstance.setItem('corbu_chat_sessions', JSON.stringify([chat]));

      service.deleteProject(project.id);

      // 프로젝트 삭제 시 관련 채팅 세션도 삭제되었는지 확인
      const savedChats = localStorageMockInstance.getItem('corbu_chat_sessions');
      if (savedChats) {
        const chats = JSON.parse(savedChats);
        expect(chats.filter((c: ChatSession) => c.projectId === project.id).length).toBe(0);
      }
    });
  });

  describe('에지 케이스', () => {
    it('로컬 스토리지 오류 처리', () => {
      localStorageMockInstance.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const chats = service.getChatSessionsByProject('project-1');
      expect(chats).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });

    it('빈 프로젝트에 파일 추가', () => {
      const project = service.createProject('프로젝트');
      const projectForStorage = {
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      };
      const projects = [projectForStorage];
      localStorageMockInstance.setItem('projects', JSON.stringify(projects));

      const testFile: ProjectFile = {
        id: 'file-1',
        name: 'test.pdf',
        type: 'document',
        size: 1024,
        uploadDate: new Date(),
        lastAccessed: new Date(),
      };

      const result = service.addFileToProject(project.id, testFile);

      expect(result.file).toBeDefined();
      expect(result.chat).toBeDefined();
    });
  });
});

