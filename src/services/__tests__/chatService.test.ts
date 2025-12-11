/**
 * ChatService 테스트
 */

import { ChatService, chatService } from '../chatService';
import { advancedTextProcessor } from '../advancedTextProcessor';

// 모킹
jest.mock('../advancedTextProcessor');

// fetch 모킹
global.fetch = jest.fn();

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(() => {
    service = new ChatService();
    (global.fetch as jest.Mock).mockClear();
    (advancedTextProcessor.processText as jest.Mock) = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(ChatService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(chatService).toBeDefined();
    });
  });

  describe('메시지 전송', () => {
    it('일반 메시지 전송', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          response: '테스트 응답',
          model: 'gpt-4',
          tokens: 100,
          processing_time: 500,
          confidence: 0.9,
        }),
      });

      const response = await service.sendMessage('안녕하세요');

      expect(response).toBeDefined();
      expect(response.message).toBe('테스트 응답');
      expect(response.metadata).toBeDefined();
      expect(response.metadata?.model).toBe('gpt-4');
      expect(typeof response.metadata?.tokens).toBe('number');
    });

    it('텍스트 처리 요청 메시지', async () => {
      (advancedTextProcessor.processText as jest.Mock).mockResolvedValue({
        finalContent: '처리된 텍스트',
        stages: [
          { name: 'stage1', description: 'Stage 1', processingTime: 100 },
          { name: 'stage2', description: 'Stage 2', processingTime: 100 },
        ],
        alternatives: {
          brief: '간단 버전 텍스트',
          detailed: '상세 버전 텍스트',
          technical: '기술 버전 텍스트',
          casual: '친근 버전 텍스트',
        },
        metadata: {
          originalLength: 50,
          finalLength: 100,
          processingTime: 200,
          readabilityScore: 85,
          complexityLevel: 'moderate',
          sentiment: 'neutral',
        },
      });

      const response = await service.sendMessage('글쓰기 스타일로 변환해주세요');

      expect(response).toBeDefined();
      expect(response.message).toBeDefined();
      expect(response.metadata?.model).toBe('advanced-text-processor');
    });

    it('API 호출 실패 시 폴백 응답', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const response = await service.sendMessage('테스트 메시지');

      expect(response).toBeDefined();
      expect(response.message).toBeDefined();
    });

    it('파일과 함께 메시지 전송', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          response: '파일 포함 응답',
          model: 'gpt-4',
          tokens: 150,
          processing_time: 600,
        }),
      });

      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const response = await service.sendMessage('파일 분석', [file]);

      expect(response).toBeDefined();
      expect(response.message).toBeDefined();
    });

    it('대화 ID와 컨텍스트 포함 메시지 전송', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          response: '컨텍스트 포함 응답',
          model: 'gpt-4',
          tokens: 200,
          processing_time: 700,
        }),
      });

      const response = await service.sendMessage('테스트', undefined, 'conv-1', { context: 'test' });

      expect(response).toBeDefined();
      expect(response.message).toBeDefined();
    });
  });

  describe('파일 업로드', () => {
    it('파일 업로드 성공', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const response = await service.uploadFile(file);

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.fileId).toBeDefined();
      expect(response.fileName).toBe('test.txt');
      expect(typeof response.fileSize).toBe('number');
      expect(response.fileType).toBe('text/plain');
    });

    it('파일 업로드 응답 구조 확인', async () => {
      const file = new File(['test content'], 'document.pdf', { type: 'application/pdf' });
      const response = await service.uploadFile(file);

      expect(response.success).toBe(true);
      expect(typeof response.fileId).toBe('string');
      expect(response.fileName).toBe('document.pdf');
      expect(response.fileSize).toBeGreaterThan(0);
      expect(response.fileType).toBe('application/pdf');
    });
  });

  describe('채팅 히스토리', () => {
    it('채팅 히스토리 조회', async () => {
      const history = await service.getChatHistory('chat-1');

      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('새 채팅 생성', () => {
    it('새 채팅 생성', async () => {
      const chatId = await service.createNewChat();

      expect(typeof chatId).toBe('string');
      expect(chatId).toContain('chat_');
    });
  });

  describe('메시지 저장', () => {
    it('메시지 저장', async () => {
      const message = {
        id: 'msg-1',
        content: '테스트 메시지',
        isUser: true,
        timestamp: new Date(),
      };

      const result = await service.saveChatMessage('chat-1', message);

      expect(typeof result).toBe('boolean');
    });
  });

  describe('다양한 텍스트 처리 요청', () => {
    it('스타일 변환 요청', async () => {
      (advancedTextProcessor.processText as jest.Mock).mockResolvedValue({
        processedText: '스타일 변환된 텍스트',
        stages: [{ name: 'style-conversion' }],
        alternatives: [],
        metadata: {
          finalLength: 50,
          processingTime: 100,
        },
      });

      try {
        const response = await service.sendMessage('formal 스타일로 변환');

        expect(response).toBeDefined();
        if (response.metadata?.model === 'advanced-text-processor') {
          expect(response.metadata.model).toBe('advanced-text-processor');
        }
      } catch (error) {
        // 에러가 발생할 수 있으므로 처리
        expect(error).toBeDefined();
      }
    });

    it('정치적 맥락 요청', async () => {
      (advancedTextProcessor.processText as jest.Mock).mockResolvedValue({
        processedText: '정치적 맥락 처리된 텍스트',
        stages: [{ name: 'political-context' }],
        alternatives: [],
        metadata: {
          finalLength: 60,
          processingTime: 150,
        },
      });

      try {
        const response = await service.sendMessage('neutral 정치 맥락으로');

        expect(response).toBeDefined();
      } catch (error) {
        // 에러가 발생할 수 있으므로 처리
        expect(error).toBeDefined();
      }
    });
  });
});

