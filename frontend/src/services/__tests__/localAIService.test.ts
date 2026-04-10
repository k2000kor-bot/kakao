/**
 * LocalAIService 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import {
  LocalAIService,
  localAIService,
  LocalAIRequest,
} from '../localAIService';

// console.error 모킹
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

describe('LocalAIService', () => {
  let service: LocalAIService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new LocalAIService();
    consoleErrorSpy.mockClear();
  });

  afterEach(() => {
    consoleErrorSpy.mockClear();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(LocalAIService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(localAIService).toBeDefined();
      expect(localAIService).toBeInstanceOf(LocalAIService);
    });
  });

  describe('대화 메시지 처리', () => {
    it('대화 메시지 처리 - 안녕', async () => {
      const request: LocalAIRequest = {
        type: 'chat',
        content: '안녕하세요',
      };

      const response = await service.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message).toBeDefined();
      expect(response.message.content).toContain('CORBU.AI');
    });

    it('대화 메시지 처리 - 도움말', async () => {
      const request: LocalAIRequest = {
        type: 'chat',
        content: '도움말',
      };

      const response = await service.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('도움말');
    });

    it('대화 메시지 처리 - 테스트', async () => {
      const request: LocalAIRequest = {
        type: 'chat',
        content: '테스트',
      };

      const response = await service.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('테스트');
    });

    it('대화 메시지 처리 - 상태', async () => {
      const request: LocalAIRequest = {
        type: 'chat',
        content: '상태',
      };

      const response = await service.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('상태');
    });

    it('대화 메시지 처리 - 일반 메시지', async () => {
      const request: LocalAIRequest = {
        type: 'chat',
        content: '일반 메시지',
      };

      const response = await service.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message.content).toBeTruthy();
    });
  });

  describe('분석 메시지 처리', () => {
    it('분석 메시지 처리', async () => {
      const request: LocalAIRequest = {
        type: 'analysis',
        content: '이 텍스트를 분석해주세요',
      };

      const response = await service.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('분석 결과');
      expect(response.metadata?.model).toBe('local-ai');
    });

    it('분석 결과에 메타데이터 포함', async () => {
      const request: LocalAIRequest = {
        type: 'analysis',
        content: '테스트 분석',
      };

      const response = await service.processMessage(request);

      expect(response.metadata).toBeDefined();
      expect(response.metadata?.confidence).toBeGreaterThan(0);
      expect(response.metadata?.processingTime).toBeGreaterThanOrEqual(0);
      expect(response.metadata?.tokens).toBeGreaterThan(0);
    });
  });

  describe('가이드 메시지 처리', () => {
    it('가이드 메시지 처리', async () => {
      const request: LocalAIRequest = {
        type: 'guidance',
        content: '메시지 가이드를 만들어주세요',
        options: {
          style: 'friendly',
          length: 'medium',
        },
      };

      const response = await service.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('메시지 가이드');
      expect(response.metadata?.model).toBe('local-ai');
    });

    it('다양한 스타일 옵션', async () => {
      const styles: Array<'friendly' | 'professional' | 'creative' | 'formal'> = [
        'friendly',
        'professional',
        'creative',
        'formal',
      ];

      for (const style of styles) {
        const request: LocalAIRequest = {
          type: 'guidance',
          content: '테스트',
          options: { style },
        };

        const response = await service.processMessage(request);
        expect(response.success).toBe(true);
      }
    });

    it('다양한 길이 옵션', async () => {
      const lengths: Array<'short' | 'medium' | 'long'> = ['short', 'medium', 'long'];

      for (const length of lengths) {
        const request: LocalAIRequest = {
          type: 'guidance',
          content: '테스트',
          options: { length },
        };

        const response = await service.processMessage(request);
        expect(response.success).toBe(true);
      }
    });
  });

  describe('프로젝트 메시지 처리', () => {
    it('프로젝트 메시지 처리 - 특정 프로젝트', async () => {
      const request: LocalAIRequest = {
        type: 'project',
        content: '샘플 프로젝트 A 프로젝트 정보',
      };

      const response = await service.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('샘플 프로젝트 A');
      expect(response.metadata?.model).toBe('local-ai');
    });

    it('프로젝트 메시지 처리 - 프로젝트 목록', async () => {
      const request: LocalAIRequest = {
        type: 'project',
        content: '프로젝트 목록',
      };

      const response = await service.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('프로젝트');
    });

    it('샘플 프로젝트 B 조회', async () => {
      const request: LocalAIRequest = {
        type: 'project',
        content: '샘플 프로젝트 B 프로젝트',
      };

      const response = await service.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('샘플 프로젝트 B');
    });
  });

  describe('파일 메시지 처리', () => {
    it('파일 메시지 처리 - 목록', async () => {
      const request: LocalAIRequest = {
        type: 'file',
        content: '파일 목록',
      };

      const response = await service.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('파일 목록');
      expect(response.metadata?.model).toBe('local-ai');
    });

    it('파일 메시지 처리 - 검색', async () => {
      const request: LocalAIRequest = {
        type: 'file',
        content: '회의록_요약.pdf',
      };

      const response = await service.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('검색 결과');
    });

    it('존재하지 않는 파일 검색', async () => {
      const request: LocalAIRequest = {
        type: 'file',
        content: '존재하지않는파일 검색',
      };

      const response = await service.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('검색 결과가 없습니다');
    });
  });

  describe('시스템 메시지 처리', () => {
    it('시스템 메시지 처리', async () => {
      const request: LocalAIRequest = {
        type: 'system',
        content: '시스템 상태 확인',
      };

      const response = await service.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('시스템 상태');
      expect(response.metadata?.model).toBe('local-ai');
    });
  });

  describe('대화 명령 처리', () => {
    it('분석 명령 처리', async () => {
      const response = await service.processConversationCommand('이 대화를 분석해줘');

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('분석 결과');
    });

    it('가이드 명령 처리', async () => {
      const response = await service.processConversationCommand('메시지 가이드를 만들어줘');

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('메시지 가이드');
    });

    it('프로젝트 명령 처리', async () => {
      const response = await service.processConversationCommand('프로젝트 정보');

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('프로젝트');
    });

    it('파일 명령 처리', async () => {
      const response = await service.processConversationCommand('파일 목록');

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('파일');
    });

    it('시스템 명령 처리', async () => {
      const response = await service.processConversationCommand('시스템 상태');

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('시스템');
    });

    it('영어 명령 처리 - analyze', async () => {
      const response = await service.processConversationCommand('analyze this conversation');

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('분석');
    });

    it('영어 명령 처리 - project', async () => {
      const response = await service.processConversationCommand('show project information');

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('프로젝트');
    });

    it('기본 대화 명령 처리', async () => {
      const response = await service.processConversationCommand('일반 메시지');

      expect(response.success).toBe(true);
      expect(response.message).toBeDefined();
    });
  });

  describe('응답 구조', () => {
    it('응답에 메시지 포함', async () => {
      const request: LocalAIRequest = {
        type: 'chat',
        content: '테스트',
      };

      const response = await service.processMessage(request);

      expect(response.message).toBeDefined();
      expect(response.message.id).toBeDefined();
      expect(response.message.content).toBeDefined();
      expect(response.message.sender).toBeDefined();
      expect(response.message.timestamp).toBeDefined();
      expect(response.message.type).toBeDefined();
    });

    it('응답에 메타데이터 포함', async () => {
      const request: LocalAIRequest = {
        type: 'chat',
        content: '테스트',
      };

      const response = await service.processMessage(request);

      expect(response.metadata).toBeDefined();
      if (response.metadata) {
        expect(response.metadata.processingTime).toBeGreaterThanOrEqual(0);
        expect(response.metadata.confidence).toBeGreaterThan(0);
        expect(response.metadata.model).toBeDefined();
        expect(response.metadata.tokens).toBeGreaterThan(0);
        expect(response.metadata.usedServices).toBeInstanceOf(Array);
      }
    });
  });

  describe('에러 처리', () => {
    it('에러 발생 시 폴백 응답', async () => {
      // 에러를 강제로 발생시키기 위해 service의 메서드를 모킹
      const originalHandleChatMessage = (service as unknown as { handleChatMessage: (msg: unknown) => Promise<unknown> }).handleChatMessage as (msg: unknown) => Promise<unknown>;
      (service as unknown as { handleChatMessage: (msg: unknown) => Promise<unknown> }).handleChatMessage = jest.fn().mockRejectedValue(new Error('Test error'));

      const request: LocalAIRequest = {
        type: 'chat',
        content: '테스트',
      };

      const response = await service.processMessage(request);

      expect(response.success).toBe(false);
      expect(response.message.content).toContain('오류가 발생했습니다');

      // 원래 메서드 복원
      (service as unknown as { handleChatMessage: (msg: unknown) => Promise<unknown> }).handleChatMessage = originalHandleChatMessage;
    });
  });

  describe('타입별 처리', () => {
    it('모든 타입 처리 확인', async () => {
      const types: Array<'chat' | 'analysis' | 'guidance' | 'project' | 'file' | 'system'> = [
        'chat',
        'analysis',
        'guidance',
        'project',
        'file',
        'system',
      ];

      for (const type of types) {
        const request: LocalAIRequest = {
          type,
          content: '테스트',
        };

        const response = await service.processMessage(request);

        expect(response.success).toBe(true);
        expect(response.message).toBeDefined();
        expect(response.metadata?.usedServices).toContain(type);
      }
    });

    it('알 수 없는 타입은 기본 대화로 처리', async () => {
      const request = {
        type: 'unknown' as 'chat',
        content: '테스트',
      };

      const response = await service.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message).toBeDefined();
    });
  });

  describe('옵션 처리', () => {
    it('옵션 포함 요청', async () => {
      const request: LocalAIRequest = {
        type: 'guidance',
        content: '테스트',
        options: {
          style: 'professional',
          length: 'long',
          priority: 'high',
        },
      };

      const response = await service.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('전문적');
    });

    it('옵션 없이 요청', async () => {
      const request: LocalAIRequest = {
        type: 'guidance',
        content: '테스트',
      };

      const response = await service.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message).toBeDefined();
    });
  });

  describe('컨텍스트 처리', () => {
    it('컨텍스트 포함 요청', async () => {
      const request: LocalAIRequest = {
        type: 'chat',
        content: '테스트',
        context: {
          projectId: 'project-1',
          userId: 'user-1',
          conversationId: 'conv-1',
        },
      };

      const response = await service.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message).toBeDefined();
    });
  });

  describe('메시지 ID 생성', () => {
    it('각 타입별 고유 ID 생성', async () => {
      const request1: LocalAIRequest = {
        type: 'chat',
        content: '테스트1',
      };

      const request2: LocalAIRequest = {
        type: 'analysis',
        content: '테스트2',
      };

      const response1 = await service.processMessage(request1);
      const response2 = await service.processMessage(request2);

      expect(response1.message.id).not.toBe(response2.message.id);
      expect(response1.message.id).toContain('chat');
      expect(response2.message.id).toContain('analysis');
    });
  });
});

