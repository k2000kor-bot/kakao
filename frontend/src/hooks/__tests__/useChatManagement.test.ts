/**
 * useChatManagement 훅 테스트
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useChatManagement } from '../useChatManagement';
import { CHATGPT_CHATS_STORAGE_KEY } from '../../services/chatGptUiStorageKeys';

jest.mock('../../utils/topicDetector', () => ({
  checkChatContinuity: jest.fn(() => null),
  detectTopicChange: jest.fn(() => ({ changed: false, newTopic: null })),
}));

jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('useChatManagement', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('초기 상태 반환', () => {
    const { result } = renderHook(() =>
      useChatManagement(null)
    );

    expect(result.current.chats).toEqual([]);
    expect(result.current.currentChatId).toBeNull();
    expect(result.current.currentChat).toBeNull();
    expect(result.current.messages).toEqual([]);
    expect(result.current.chatSearchTerm).toBe('');
    expect(result.current.chatSortOrder).toBe('recent');
    expect(result.current.chatFilterProject).toBeNull();
    expect(result.current.allDisplayChats).toEqual([]);
    expect(result.current.editingMessageId).toBeNull();
    expect(result.current.editingMessageContent).toBe('');
    expect(result.current.messageSearchTerm).toBe('');
    expect(result.current.highlightedMessageIds).toEqual(new Set());
  });

  it('setChatSearchTerm 호출 시 chatSearchTerm 변경', () => {
    const { result } = renderHook(() => useChatManagement(null));

    act(() => {
      result.current.setChatSearchTerm('검색어');
    });

    expect(result.current.chatSearchTerm).toBe('검색어');
  });

  it('setChatSortOrder 호출 시 chatSortOrder 변경', () => {
    const { result } = renderHook(() => useChatManagement(null));

    act(() => {
      result.current.setChatSortOrder('alphabetical');
    });

    expect(result.current.chatSortOrder).toBe('alphabetical');
  });

  it('setChatFilterProject 호출 시 chatFilterProject 변경', () => {
    const { result } = renderHook(() => useChatManagement(null));

    act(() => {
      result.current.setChatFilterProject('proj-1');
    });

    expect(result.current.chatFilterProject).toBe('proj-1');
  });

  it('getChatTime - chat의 updatedAt 반환', () => {
    const { result } = renderHook(() => useChatManagement(null));

    const chat = {
      id: 'c1',
      title: '테스트',
      summary: '',
      date: '2025-01-01',
      messages: [],
      updatedAt: '2025-01-15T10:00:00Z',
    };

    const time = result.current.getChatTime(chat);
    expect(time).toBe(new Date('2025-01-15T10:00:00Z').getTime());
  });

  it('createProjectChat 호출 시 프로젝트 소속 새 대화 생성', () => {
    const { result } = renderHook(() => useChatManagement(null));

    let chatId: string | undefined;
    act(() => {
      chatId = result.current.createProjectChat('proj-1', '프로젝트명');
    });

    expect(chatId).toBeDefined();
    expect(typeof chatId).toBe('string');
    expect(result.current.chats).toHaveLength(1);
    expect(result.current.chats[0].projectId).toBe('proj-1');
    expect(result.current.chats[0].title).toBe('프로젝트명 - 새 대화');
    expect(result.current.chats[0].summary).toBe('프로젝트명 프로젝트의 새 대화입니다.');
  });

  it('createProjectChat(projectId만) 시 기본 제목은 새 프로젝트 대화', () => {
    const { result } = renderHook(() => useChatManagement(null));

    act(() => {
      result.current.createProjectChat('proj-2');
    });

    expect(result.current.chats).toHaveLength(1);
    expect(result.current.chats[0].title).toBe('새 프로젝트 대화');
    expect(result.current.chats[0].summary).toBe('');
  });

  it('updateChatMessages: 기본 제목(새 대화)이면 첫 사용자 메시지에서 명시 제목을 반영한다', async () => {
    const chatId = 'chat-upd-explicit';
    localStorage.setItem(
      CHATGPT_CHATS_STORAGE_KEY,
      JSON.stringify([
        {
          id: chatId,
          title: '새 대화',
          summary: '',
          date: '2025-01-01',
          messages: [],
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ]),
    );

    const { result } = renderHook(() => useChatManagement(null));

    await waitFor(() => {
      expect(result.current.chats.find((c) => c.id === chatId)).toBeDefined();
    });

    act(() => {
      result.current.updateChatMessages(chatId, [
        {
          id: 'm1',
          role: 'user',
          content: '제목: 유닛테스트제목\n\n본문',
          timestamp: '2025-01-02T10:00:00.000Z',
        },
      ]);
    });

    expect(result.current.chats.find((c) => c.id === chatId)?.title).toBe('유닛테스트제목');
  });

  it('updateChatMessages: 세션 N 형태 기본 제목도 첫 메시지로 갱신한다', async () => {
    const chatId = 'chat-upd-session';
    localStorage.setItem(
      CHATGPT_CHATS_STORAGE_KEY,
      JSON.stringify([
        {
          id: chatId,
          title: '세션 2',
          summary: '',
          date: '2025-01-01',
          messages: [],
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ]),
    );

    const { result } = renderHook(() => useChatManagement(null));

    await waitFor(() => {
      expect(result.current.chats.find((c) => c.id === chatId)).toBeDefined();
    });

    act(() => {
      result.current.updateChatMessages(chatId, [
        {
          id: 'm1',
          role: 'user',
          content: '간단 질문',
          timestamp: '2025-01-02T10:00:00.000Z',
        },
      ]);
    });

    expect(result.current.chats.find((c) => c.id === chatId)?.title).toBe('간단 질문');
  });

  it('updateChatMessages: 사용자 지정 제목은 덮어쓰지 않는다', async () => {
    const chatId = 'chat-upd-custom';
    localStorage.setItem(
      CHATGPT_CHATS_STORAGE_KEY,
      JSON.stringify([
        {
          id: chatId,
          title: '내 고정 제목',
          summary: '',
          date: '2025-01-01',
          messages: [],
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ]),
    );

    const { result } = renderHook(() => useChatManagement(null));

    await waitFor(() => {
      expect(result.current.chats.find((c) => c.id === chatId)).toBeDefined();
    });

    act(() => {
      result.current.updateChatMessages(chatId, [
        {
          id: 'm1',
          role: 'user',
          content: '제목: 바꿔도안됨\n\n본문',
          timestamp: '2025-01-02T10:00:00.000Z',
        },
      ]);
    });

    expect(result.current.chats.find((c) => c.id === chatId)?.title).toBe('내 고정 제목');
  });
});
