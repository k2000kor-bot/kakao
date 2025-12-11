/**
 * projectService 테스트
 */

// fetch 모킹
global.fetch = jest.fn();

// localStorage 모킹
let localStorageStore: Record<string, string> = {};

const localStorageMock = {
  getItem: jest.fn().mockImplementation((key: string) => {
    return localStorageStore[key] || null;
  }),
  setItem: jest.fn().mockImplementation((key: string, value: string) => {
    localStorageStore[key] = value.toString();
  }),
  removeItem: jest.fn().mockImplementation((key: string) => {
    delete localStorageStore[key];
  }),
  clear: jest.fn().mockImplementation(() => {
    localStorageStore = {};
  }),
  get length() {
    return Object.keys(localStorageStore).length;
  },
  key: jest.fn().mockImplementation((index: number) => {
    const keys = Object.keys(localStorageStore);
    return keys[index] || null;
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

import {
  projectService,
  chatService,
  messageService,
  systemService,
  getProjectStats,
} from '../projectService';
import { Project, Chat, Message } from '../../types/project';

describe('projectService', () => {
  beforeEach(() => {
    // localStorage store 초기화
    localStorageStore = {};
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    // fetch가 실패하도록 기본 설정
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
  });

  describe('프로젝트 관리', () => {
    it('프로젝트 목록 조회 - 로컬 스토리지', async () => {
      const mockProjects: Project[] = [
        {
          id: 'project-1',
          name: '테스트 프로젝트 1',
          description: '설명 1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          files: [],
          instructions: '',
          tags: [],
          isActive: true,
          type: 'conversation',
          status: 'active',
          chats: [],
        },
      ];

      // fetch가 실패하도록 설정 (로컬 스토리지 사용)
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      localStorageMock.setItem('corbu_projects', JSON.stringify(mockProjects));

      const projects = await projectService.getProjects();

      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBeGreaterThan(0);
    });

    it('프로젝트 목록 조회 - 빈 배열', async () => {
      const projects = await projectService.getProjects();

      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBe(0);
    });

    it('프로젝트 생성 - 로컬 스토리지', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const projectData = {
        name: '새 프로젝트',
        description: '새 프로젝트 설명',
        status: 'active' as const,
        priority: 'medium' as const,
        tags: ['태그1'],
        guidelines: '가이드라인',
        files: [],
        messageCount: 0,
        instructions: '',
        isActive: true,
        type: 'conversation' as const,
      };

      const project = await projectService.createProject(projectData);

      expect(project).toBeDefined();
      expect(project.id).toBeDefined();
      expect(project.name).toBe(projectData.name);
      expect(project.description).toBe(projectData.description);
    });

    it('프로젝트 조회', async () => {
      const mockProject: Project = {
        id: 'project-1',
        name: '테스트 프로젝트',
        description: '설명',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      };

      // fetch가 실패하도록 설정 (로컬 스토리지 사용)
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      localStorageMock.setItem('corbu_projects', JSON.stringify([mockProject]));

      const project = await projectService.getProject('project-1');

      expect(project).toBeDefined();
      expect(project?.id).toBe('project-1');
    });

    it('존재하지 않는 프로젝트 조회', async () => {
      const project = await projectService.getProject('nonexistent');

      expect(project).toBeNull();
    });

    it('프로젝트 업데이트', async () => {
      const mockProject: Project = {
        id: 'project-1',
        name: '원래 이름',
        description: '원래 설명',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      };

      // fetch가 실패하도록 설정 (로컬 스토리지 사용)
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      localStorageMock.setItem('corbu_projects', JSON.stringify([mockProject]));

      const updated = await projectService.updateProject('project-1', {
        name: '업데이트된 이름',
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('업데이트된 이름');
    });

    it('프로젝트 삭제', async () => {
      const mockProject: Project = {
        id: 'project-1',
        name: '삭제할 프로젝트',
        description: '설명',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      };

      // fetch가 실패하도록 설정 (로컬 스토리지 사용)
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      localStorageMock.setItem('corbu_projects', JSON.stringify([mockProject]));

      const result = await projectService.deleteProject('project-1');

      expect(result).toBe(true);
    });

    it('초기 프로젝트 시드 생성', async () => {
      // fetch가 실패하도록 설정 (로컬 스토리지 사용)
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await projectService.seedProjectsIfEmpty();

      expect(result).toBeUndefined();
      const projects = await projectService.getProjects();
      expect(projects.length).toBeGreaterThan(0);
    });
  });

  describe('채팅 관리', () => {
    it('프로젝트의 채팅 목록 조회', () => {
      const mockChats: Chat[] = [
        {
          id: 'chat-1',
          projectId: 'project-1',
          name: '채팅 1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          messages: [],
        },
      ];

      localStorageMock.setItem('corbu_chats', JSON.stringify(mockChats));

      const chats = chatService.getProjectChats('project-1');

      expect(Array.isArray(chats)).toBe(true);
      expect(chats.length).toBe(1);
    });

    it('채팅 생성', async () => {
      const mockProject: Project = {
        id: 'project-1',
        name: '테스트 프로젝트',
        description: '설명',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      };

      localStorageMock.setItem('corbu_projects', JSON.stringify([mockProject]));

      const chat = await chatService.createChat('project-1', '새 채팅');

      expect(chat).toBeDefined();
      expect(chat.id).toBeDefined();
      expect(chat.projectId).toBe('project-1');
      expect(chat.name).toBe('새 채팅');
    });

    it('채팅 조회', () => {
      const mockChat: Chat = {
        id: 'chat-1',
        projectId: 'project-1',
        name: '테스트 채팅',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        messages: [],
      };

      localStorageMock.setItem('corbu_chats', JSON.stringify([mockChat]));

      const chat = chatService.getChat('chat-1');

      expect(chat).toBeDefined();
      expect(chat?.id).toBe('chat-1');
    });

    it('채팅 업데이트', () => {
      const mockChat: Chat = {
        id: 'chat-1',
        projectId: 'project-1',
        name: '원래 이름',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        messages: [],
      };

      localStorageMock.setItem('corbu_chats', JSON.stringify([mockChat]));

      const updated = chatService.updateChat('chat-1', { name: '업데이트된 이름' });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('업데이트된 이름');
    });

    it('채팅 삭제', () => {
      const mockChat: Chat = {
        id: 'chat-1',
        projectId: 'project-1',
        name: '삭제할 채팅',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        messages: [],
      };

      localStorageMock.setItem('corbu_chats', JSON.stringify([mockChat]));

      const result = chatService.deleteChat('chat-1');

      expect(result).toBe(true);
    });

    it('모든 채팅 조회', () => {
      const mockChats: Chat[] = [
        {
          id: 'chat-1',
          projectId: 'project-1',
          name: '채팅 1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          messages: [],
        },
      ];

      localStorageMock.setItem('corbu_chats', JSON.stringify(mockChats));

      const chats = chatService.getAllChats();

      expect(Array.isArray(chats)).toBe(true);
      expect(chats.length).toBe(1);
    });
  });

  describe('메시지 관리', () => {
    it('채팅의 메시지 목록 조회', () => {
      const mockMessages: Message[] = [
        {
          id: 'msg-1',
          chatId: 'chat-1',
          content: '메시지 1',
          role: 'user',
          timestamp: new Date('2024-01-01'),
        },
      ];

      localStorageMock.setItem('corbu_messages', JSON.stringify(mockMessages));

      const messages = messageService.getChatMessages('chat-1');

      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBe(1);
    });

    it('메시지 추가', () => {
      const mockChat: Chat = {
        id: 'chat-1',
        projectId: 'project-1',
        name: '테스트 채팅',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        messages: [],
      };

      localStorageMock.setItem('corbu_chats', JSON.stringify([mockChat]));

      const message = messageService.addMessage('chat-1', '새 메시지', 'user');

      expect(message).toBeDefined();
      expect(message.id).toBeDefined();
      expect(message.chatId).toBe('chat-1');
      expect(message.content).toBe('새 메시지');
      expect(message.role).toBe('user');
    });

    it('메시지 업데이트', () => {
      const mockMessage: Message = {
        id: 'msg-1',
        chatId: 'chat-1',
        content: '원래 내용',
        role: 'user',
        timestamp: new Date('2024-01-01'),
      };

      localStorageMock.setItem('corbu_messages', JSON.stringify([mockMessage]));

      const updated = messageService.updateMessage('msg-1', { content: '업데이트된 내용' });

      expect(updated).toBeDefined();
      expect(updated?.content).toBe('업데이트된 내용');
    });

    it('메시지 삭제', () => {
      const mockMessage: Message = {
        id: 'msg-1',
        chatId: 'chat-1',
        content: '삭제할 메시지',
        role: 'user',
        timestamp: new Date('2024-01-01'),
      };

      localStorageMock.setItem('corbu_messages', JSON.stringify([mockMessage]));

      const result = messageService.deleteMessage('msg-1');

      expect(result).toBe(true);
    });

    it('채팅의 모든 메시지 삭제', () => {
      const mockMessages: Message[] = [
        {
          id: 'msg-1',
          chatId: 'chat-1',
          content: '메시지 1',
          role: 'user',
          timestamp: new Date('2024-01-01'),
        },
        {
          id: 'msg-2',
          chatId: 'chat-2',
          content: '메시지 2',
          role: 'user',
          timestamp: new Date('2024-01-01'),
        },
      ];

      localStorageMock.setItem('corbu_messages', JSON.stringify(mockMessages));

      messageService.deleteChatMessages('chat-1');

      const messages = messageService.getChatMessages('chat-1');
      expect(messages.length).toBe(0);
    });

    it('모든 메시지 조회', () => {
      const mockMessages: Message[] = [
        {
          id: 'msg-1',
          chatId: 'chat-1',
          content: '메시지 1',
          role: 'user',
          timestamp: new Date('2024-01-01'),
        },
      ];

      localStorageMock.setItem('corbu_messages', JSON.stringify(mockMessages));

      const messages = messageService.getAllMessages();

      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBe(1);
    });
  });

  describe('시스템 관리', () => {
    it('시스템 통계 조회', async () => {
      const mockProjects: Project[] = [
        {
          id: 'project-1',
          name: '프로젝트 1',
          description: '설명',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          files: [],
          instructions: '',
          tags: [],
          isActive: true,
          type: 'conversation',
          status: 'active',
          chats: [],
        },
      ];

      localStorageMock.setItem('corbu_projects', JSON.stringify(mockProjects));
      localStorageMock.setItem('corbu_chats', JSON.stringify([]));
      localStorageMock.setItem('corbu_messages', JSON.stringify([]));

      const stats = await systemService.getSystemStats();

      expect(stats).toBeDefined();
      expect(typeof stats.totalProjects).toBe('number');
      expect(typeof stats.totalChats).toBe('number');
      expect(typeof stats.totalMessages).toBe('number');
    });

    it('프로젝트 검색', async () => {
      const mockProjects: Project[] = [
        {
          id: 'project-1',
          name: '테스트 프로젝트',
          description: '테스트 설명',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          files: [],
          instructions: '',
          tags: [],
          isActive: true,
          type: 'conversation',
          status: 'active',
          chats: [],
        },
      ];

      localStorageMock.setItem('corbu_projects', JSON.stringify(mockProjects));

      const results = await systemService.searchProjects('테스트');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it('프로젝트 필터링', async () => {
      const mockProjects: Project[] = [
        {
          id: 'project-1',
          name: '활성 프로젝트',
          description: '설명',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          files: [],
          instructions: '',
          tags: [],
          isActive: true,
          type: 'conversation',
          status: 'active',
          chats: [],
        },
        {
          id: 'project-2',
          name: '보관 프로젝트',
          description: '설명',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          files: [],
          instructions: '',
          tags: [],
          isActive: true,
          type: 'conversation',
          status: 'archived',
          chats: [],
        },
      ];

      localStorageMock.setItem('corbu_projects', JSON.stringify(mockProjects));

      const results = await systemService.searchProjects('', { status: 'active' });

      expect(Array.isArray(results)).toBe(true);
      expect(results.every((p) => p.status === 'active')).toBe(true);
    });
  });

  describe('프로젝트 통계', () => {
    it('프로젝트 통계 계산', async () => {
      const mockProject: Project = {
        id: 'project-1',
        name: '테스트 프로젝트',
        description: '설명',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      };

      const mockChat: Chat = {
        id: 'chat-1',
        projectId: 'project-1',
        name: '채팅 1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        messages: [],
      };

      localStorageMock.setItem('corbu_projects', JSON.stringify([mockProject]));
      localStorageMock.setItem('corbu_chats', JSON.stringify([mockChat]));
      localStorageMock.setItem('corbu_messages', JSON.stringify([]));

      const stats = await getProjectStats('project-1');

      expect(stats).toBeDefined();
      expect(typeof stats?.totalChats).toBe('number');
      expect(typeof stats?.totalMessages).toBe('number');
    });

    it('존재하지 않는 프로젝트 통계', async () => {
      const stats = await getProjectStats('nonexistent');

      expect(stats).toBeNull();
    });
  });
});

