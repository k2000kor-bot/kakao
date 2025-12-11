/**
 * conversationHistoryService 서비스 테스트
 * 대화 히스토리 관리 서비스 테스트
 */

import conversationHistoryService, {
  ConversationContext,
  ConversationMessage,
} from '../conversationHistoryService';

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

describe('conversationHistoryService', () => {
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
      expect(conversationHistoryService).toBeDefined();
    });
  });

  describe('createConversation', () => {
    it('새 대화를 생성할 수 있어야 함', () => {
      const conversation = conversationHistoryService.createConversation('테스트 대화');

      expect(conversation).toBeDefined();
      expect(conversation.id).toBeDefined();
      expect(conversation.title).toBe('테스트 대화');
      expect(conversation.messages).toEqual([]);
      expect(conversation.createdAt).toBeDefined();
      expect(conversation.tags).toEqual([]);
    });

    it('프로젝트 ID와 함께 대화를 생성할 수 있어야 함', () => {
      const conversation = conversationHistoryService.createConversation('대화', 'project-123');

      expect(conversation.projectId).toBe('project-123');
    });

    it('초기 메시지와 함께 대화를 생성할 수 있어야 함', () => {
      const initialMessage: ConversationMessage = {
        id: 'msg-1',
        role: 'user',
        content: '안녕하세요',
        timestamp: new Date().toISOString(),
      };

      const conversation = conversationHistoryService.createConversation(
        '대화',
        undefined,
        initialMessage
      );

      expect(conversation.messages.length).toBe(1);
      expect(conversation.messages[0].content).toBe('안녕하세요');
    });
  });

  describe('addMessage', () => {
    it('대화에 메시지를 추가할 수 있어야 함', () => {
      const conversation = conversationHistoryService.createConversation('대화');
      const message = conversationHistoryService.addMessage(conversation.id, {
        role: 'user',
        content: '테스트 메시지',
      });

      expect(message).toBeDefined();
      expect(message.id).toBeDefined();
      expect(message.content).toBe('테스트 메시지');
      expect(message.timestamp).toBeDefined();
    });

    it('메타데이터를 포함한 메시지를 추가할 수 있어야 함', () => {
      const conversation = conversationHistoryService.createConversation('대화');
      const message = conversationHistoryService.addMessage(conversation.id, {
        role: 'assistant',
        content: '응답',
        metadata: {
          modelUsed: 'gpt-4',
          tokensUsed: 100,
        },
      });

      expect(message.metadata?.modelUsed).toBe('gpt-4');
      expect(message.metadata?.tokensUsed).toBe(100);
    });

    it('존재하지 않는 대화에 메시지 추가 시 에러를 던져야 함', () => {
      expect(() => {
        conversationHistoryService.addMessage('nonexistent', {
          role: 'user',
          content: '메시지',
        });
      }).toThrow('대화를 찾을 수 없습니다: nonexistent');
    });

    it('메시지 추가 후 대화가 업데이트되어야 함', () => {
      const conversation = conversationHistoryService.createConversation('대화');
      const initialUpdatedAt = conversation.updatedAt;

      // 약간 대기
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          conversationHistoryService.addMessage(conversation.id, {
            role: 'user',
            content: '메시지',
          });

          const updated = conversationHistoryService.getConversation(conversation.id);
          expect(updated?.updatedAt).not.toBe(initialUpdatedAt);
          resolve();
        }, 10);
      });
    });
  });

  describe('getConversation', () => {
    it('대화를 조회할 수 있어야 함', () => {
      const conversation = conversationHistoryService.createConversation('대화');

      const retrieved = conversationHistoryService.getConversation(conversation.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.title).toBe('대화');
    });

    it('존재하지 않는 대화는 null을 반환해야 함', () => {
      const retrieved = conversationHistoryService.getConversation('nonexistent');
      expect(retrieved).toBeNull();
    });
  });

  describe('getConversations', () => {
    it('모든 대화를 반환해야 함', () => {
      conversationHistoryService.createConversation('대화1');
      conversationHistoryService.createConversation('대화2');

      const conversations = conversationHistoryService.getConversations();
      expect(conversations.length).toBeGreaterThanOrEqual(2);
    });

    it('프로젝트 ID로 필터링할 수 있어야 함', () => {
      conversationHistoryService.createConversation('대화1', 'project-1');
      conversationHistoryService.createConversation('대화2', 'project-2');
      conversationHistoryService.createConversation('대화3', 'project-1');

      const conversations = conversationHistoryService.getConversations('project-1');
      expect(conversations.length).toBe(2);
      conversations.forEach(c => {
        expect(c.projectId).toBe('project-1');
      });
    });

    it('업데이트 시간 순으로 정렬되어야 함', () => {
      const conv1 = conversationHistoryService.createConversation('대화1');
      
      // 약간 대기
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const conv2 = conversationHistoryService.createConversation('대화2');
          conversationHistoryService.addMessage(conv2.id, {
            role: 'user',
            content: '메시지',
          });

          const conversations = conversationHistoryService.getConversations();
          expect(conversations.length).toBeGreaterThan(0);
          // 최신 대화가 먼저 와야 함
          const conv2Index = conversations.findIndex(c => c.id === conv2.id);
          const conv1Index = conversations.findIndex(c => c.id === conv1.id);
          expect(conv2Index).toBeLessThan(conv1Index);
          resolve();
        }, 10);
      });
    });
  });

  describe('generateSummary', () => {
    it('대화 요약을 생성할 수 있어야 함', () => {
      const conversation = conversationHistoryService.createConversation('대화');
      conversationHistoryService.addMessage(conversation.id, {
        role: 'user',
        content: '첫 번째 사용자 메시지',
      });

      const summary = conversationHistoryService.generateSummary(conversation.id);
      expect(summary).toBe('첫 번째 사용자 메시지');
    });

    it('긴 메시지는 100자로 제한되어야 함', () => {
      const conversation = conversationHistoryService.createConversation('대화');
      const longMessage = 'a'.repeat(150);
      conversationHistoryService.addMessage(conversation.id, {
        role: 'user',
        content: longMessage,
      });

      const summary = conversationHistoryService.generateSummary(conversation.id);
      expect(summary.length).toBe(103); // 100 + '...'
      expect(summary).toContain('...');
    });

    it('메시지가 없으면 빈 대화 메시지를 반환해야 함', () => {
      const conversation = conversationHistoryService.createConversation('대화');

      const summary = conversationHistoryService.generateSummary(conversation.id);
      expect(summary).toBe('대화가 없습니다.');
    });

    it('존재하지 않는 대화는 빈 문자열을 반환해야 함', () => {
      const summary = conversationHistoryService.generateSummary('nonexistent');
      expect(summary).toBe('');
    });
  });

  describe('updateConversation', () => {
    it('대화를 업데이트할 수 있어야 함', () => {
      const conversation = conversationHistoryService.createConversation('대화');

      const updated = conversationHistoryService.updateConversation(conversation.id, {
        title: '업데이트된 대화',
      });

      expect(updated).not.toBeNull();
      expect(updated?.title).toBe('업데이트된 대화');
    });

    it('태그를 추가할 수 있어야 함', () => {
      const conversation = conversationHistoryService.createConversation('대화');

      const updated = conversationHistoryService.updateConversation(conversation.id, {
        tags: ['태그1', '태그2'],
      });

      expect(updated?.tags).toEqual(['태그1', '태그2']);
    });

    it('요약을 추가할 수 있어야 함', () => {
      const conversation = conversationHistoryService.createConversation('대화');

      const updated = conversationHistoryService.updateConversation(conversation.id, {
        summary: '대화 요약',
      });

      expect(updated?.summary).toBe('대화 요약');
    });

    it('존재하지 않는 대화는 null을 반환해야 함', () => {
      const result = conversationHistoryService.updateConversation('nonexistent', {
        title: '업데이트',
      });

      expect(result).toBeNull();
    });

    it('업데이트 후 updatedAt이 변경되어야 함', () => {
      const conversation = conversationHistoryService.createConversation('대화');
      const initialUpdatedAt = conversation.updatedAt;

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const updated = conversationHistoryService.updateConversation(conversation.id, {
            title: '업데이트',
          });

          expect(updated?.updatedAt).not.toBe(initialUpdatedAt);
          resolve();
        }, 10);
      });
    });
  });

  describe('deleteConversation', () => {
    it('대화를 삭제할 수 있어야 함', () => {
      const conversation = conversationHistoryService.createConversation('대화');

      const deleted = conversationHistoryService.deleteConversation(conversation.id);
      expect(deleted).toBe(true);

      const retrieved = conversationHistoryService.getConversation(conversation.id);
      expect(retrieved).toBeNull();
    });

    it('존재하지 않는 대화 삭제는 false를 반환해야 함', () => {
      const result = conversationHistoryService.deleteConversation('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('getContextForLLM', () => {
    it('LLM용 컨텍스트를 반환해야 함', () => {
      const conversation = conversationHistoryService.createConversation('대화');
      conversationHistoryService.addMessage(conversation.id, {
        role: 'user',
        content: '사용자 메시지',
      });
      conversationHistoryService.addMessage(conversation.id, {
        role: 'assistant',
        content: '응답',
      });

      const context = conversationHistoryService.getContextForLLM(conversation.id);
      expect(context.length).toBe(2);
      expect(context[0].role).toBe('user');
      expect(context[0].content).toBe('사용자 메시지');
      expect(context[1].role).toBe('assistant');
      expect(context[1].content).toBe('응답');
    });

    it('maxMessages 파라미터로 메시지 수를 제한할 수 있어야 함', () => {
      const conversation = conversationHistoryService.createConversation('대화');
      for (let i = 0; i < 5; i++) {
        conversationHistoryService.addMessage(conversation.id, {
          role: 'user',
          content: `메시지 ${i}`,
        });
      }

      const context = conversationHistoryService.getContextForLLM(conversation.id, 3);
      expect(context.length).toBe(3);
    });

    it('존재하지 않는 대화는 빈 배열을 반환해야 함', () => {
      const context = conversationHistoryService.getContextForLLM('nonexistent');
      expect(context.length).toBe(0);
    });
  });

  describe('컨텍스트 길이 관리', () => {
    it('긴 메시지가 있어도 컨텍스트 길이를 관리해야 함', () => {
      const conversation = conversationHistoryService.createConversation('대화');
      
      // 시스템 메시지 추가 (시스템 메시지는 유지되어야 함)
      conversationHistoryService.addMessage(conversation.id, {
        role: 'system',
        content: '시스템 메시지',
      });
      
      // 매우 긴 메시지 추가 (토큰 수가 maxContextLength를 초과하도록)
      const longContent = 'a'.repeat(40000); // 약 10000 토큰
      conversationHistoryService.addMessage(conversation.id, {
        role: 'user',
        content: longContent,
      });

      const retrieved = conversationHistoryService.getConversation(conversation.id);
      expect(retrieved).not.toBeNull();
      // 시스템 메시지는 유지되어야 함
      const systemMessages = retrieved?.messages.filter(m => m.role === 'system') || [];
      expect(systemMessages.length).toBeGreaterThan(0);
    });
  });

  describe('localStorage 통합', () => {
    it('대화가 localStorage에 저장되어야 함', () => {
      const conversation = conversationHistoryService.createConversation('대화');

      const stored = localStorage.getItem('conversationHistory');
      expect(stored).not.toBeNull();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.length).toBeGreaterThan(0);
      expect(parsed.some((c: ConversationContext) => c.id === conversation.id)).toBe(true);
    });

    it('저장된 대화를 로드할 수 있어야 함', () => {
      const conversation = conversationHistoryService.createConversation('대화');
      const conversationId = conversation.id;

      // 새 인스턴스처럼 동작하도록 localStorage에서 직접 로드
      const stored = localStorage.getItem('conversationHistory');
      const parsed = JSON.parse(stored!);
      const found = parsed.find((c: ConversationContext) => c.id === conversationId);
      
      expect(found).toBeDefined();
      expect(found.title).toBe('대화');
    });
  });
});

