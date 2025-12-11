/**
 * notebookLLMStreamingService 서비스 테스트
 * 노트북 LLM 스트리밍 서비스 테스트
 */

import notebookLLMStreamingService from '../notebookLLMStreamingService';
import notebookLLMService from '../notebookLLMService';
import { errorLogger } from '../../utils/errorLogger';

// TextEncoder/TextDecoder 모킹
global.TextEncoder = global.TextEncoder || require('util').TextEncoder;
global.TextDecoder = global.TextDecoder || require('util').TextDecoder;

// ReadableStream 모킹
class MockReadableStream {
  private chunks: Uint8Array[];
  private index: number;

  constructor(chunks: string[]) {
    const encoder = new TextEncoder();
    this.chunks = chunks.map(chunk => encoder.encode(chunk));
    this.index = 0;
  }

  getReader() {
    return {
      read: async () => {
        if (this.index < this.chunks.length) {
          const value = this.chunks[this.index];
          this.index++;
          return { done: false, value };
        }
        return { done: true, value: undefined };
      },
      cancel: jest.fn(),
      releaseLock: jest.fn(),
      closed: Promise.resolve(),
    };
  }

  locked = false;
  cancel = jest.fn();
  pipeTo = jest.fn();
  pipeThrough = jest.fn();
  tee = jest.fn();
}

// fetch 모킹
global.fetch = jest.fn();

// notebookLLMService 모킹
jest.mock('../notebookLLMService', () => ({
  loadDefaultConfig: jest.fn(() => ({
    modelType: 'auto',
    processingMode: 'auto',
  })),
  getProjectNotebookConfig: jest.fn((projectId: string) => {
    if (projectId === 'project-123') {
      return {
        modelType: 'llama3.1:8b',
        processingMode: 'local_only',
      };
    }
    return null;
  }),
}));

// errorLogger 모킹
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('notebookLLMStreamingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(notebookLLMStreamingService).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = notebookLLMStreamingService;
      const instance2 = notebookLLMStreamingService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('streamDefaultNotebook', () => {
    // ReadableStream 모킹 헬퍼
    const createMockReadableStream = (chunks: string[]) => {
      return new MockReadableStream(chunks);
    };

    it('기본 노트북 LLM 스트리밍을 시작할 수 있어야 함', async () => {
      const chunks = ['{"content":"안녕하세요"}\n', '{"content":"테스트입니다"}\n', '{"done":true}\n'];
      const mockStream = createMockReadableStream(chunks);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const onChunk = jest.fn();
      const onComplete = jest.fn();
      const onError = jest.fn();

      await notebookLLMStreamingService.streamDefaultNotebook(
        '테스트 프롬프트',
        {},
        {},
        { onChunk, onComplete, onError }
      );

      // 스트리밍이 완료될 때까지 대기
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v7/notebook-llm/stream'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('스트리밍 실패 시 에러를 처리해야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      const onError = jest.fn();

      await expect(
        NotebookLLMStreamingService.getInstance().streamDefaultNotebook(
          '테스트 프롬프트',
          {},
          {},
          { onError }
        )
      ).rejects.toThrow();

      expect(onError).toHaveBeenCalled();
    });

    it('스트리밍 리더가 없을 때 에러를 발생시켜야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: null,
      });

      const onError = jest.fn();

      await expect(
        NotebookLLMStreamingService.getInstance().streamDefaultNotebook(
          '테스트 프롬프트',
          {},
          {},
          { onError }
        )
      ).rejects.toThrow('스트리밍 리더를 사용할 수 없습니다');
    });

    it('컨텍스트와 설정을 포함할 수 있어야 함', async () => {
      const chunks = ['{"done":true}\n'];
      const mockStream = createMockReadableStream(chunks);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      await NotebookLLMStreamingService.getInstance().streamDefaultNotebook(
        '테스트 프롬프트',
        { key: 'value' },
        { modelType: 'llama3.1:8b' }
      );

      expect(global.fetch).toHaveBeenCalled();
      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.prompt).toBe('테스트 프롬프트');
      expect(body.context).toEqual({ key: 'value' });
      expect(body.config).toBeDefined();
    });

    it('청크 콜백을 호출해야 함', async () => {
      const chunks = ['{"content":"첫번째"}\n', '{"content":"두번째"}\n', '{"done":true}\n'];
      const mockStream = createMockReadableStream(chunks);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const onChunk = jest.fn();
      const onComplete = jest.fn();

      await NotebookLLMStreamingService.getInstance().streamDefaultNotebook(
        '테스트',
        {},
        {},
        { onChunk, onComplete, chunkSize: 10 }
      );

      // 스트리밍 완료 대기
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(onComplete).toHaveBeenCalled();
    });
  });

  describe('streamProjectNotebook', () => {
    const createMockReadableStream = (chunks: string[]) => {
      return new MockReadableStream(chunks);
    };

    it('프로젝트별 노트북 LLM 스트리밍을 시작할 수 있어야 함', async () => {
      const chunks = ['{"content":"프로젝트 스트리밍"}\n', '{"done":true}\n'];
      const mockStream = createMockReadableStream(chunks);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const onComplete = jest.fn();

      await notebookLLMStreamingService.streamProjectNotebook(
        'project-123',
        '테스트 프롬프트',
        {},
        {},
        { onComplete }
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v7/notebook-llm/project/project-123/stream'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('프로젝트 설정을 사용해야 함', async () => {
      const chunks = ['{"done":true}\n'];
      const mockStream = createMockReadableStream(chunks);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      await notebookLLMStreamingService.streamProjectNotebook(
        'project-123',
        '테스트',
        {},
        {}
      );

      expect(notebookLLMService.getProjectNotebookConfig).toHaveBeenCalledWith('project-123');
    });

    it('프로젝트 스트리밍 실패 시 에러를 처리해야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      const onError = jest.fn();

      await expect(
        NotebookLLMStreamingService.getInstance().streamProjectNotebook(
          'project-123',
          '테스트',
          {},
          {},
          { onError }
        )
      ).rejects.toThrow();

      expect(onError).toHaveBeenCalled();
    });

    it('프로젝트 ID를 설정에 포함해야 함', async () => {
      const chunks = ['{"done":true}\n'];
      const mockStream = createMockReadableStream(chunks);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      await notebookLLMStreamingService.streamProjectNotebook(
        'project-456',
        '테스트',
        {},
        {}
      );

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.config.projectId).toBe('project-456');
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    const createMockReadableStream = (chunks: string[]) => {
      return new MockReadableStream(chunks);
    };

    it('재개발 프로젝트 관련 질문을 스트리밍할 수 있어야 함', async () => {
      const chunks = [
        '{"content":"시공사"}\n',
        '{"content":" 선정 기준은"}\n',
        '{"content":" 기술력, 안전성, 경험입니다"}\n',
        '{"done":true}\n',
      ];
      const mockStream = createMockReadableStream(chunks);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const chunksReceived: string[] = [];
      const onChunk = jest.fn((chunk) => {
        chunksReceived.push(chunk.content);
      });
      const onComplete = jest.fn();

      await NotebookLLMStreamingService.getInstance().streamDefaultNotebook(
        '시공사 선정 기준은 무엇인가요?',
        {
          project: '개포우성7차 재개발',
          topic: '시공사 선정',
        },
        { modelType: 'llama3.1:8b' },
        { onChunk, onComplete }
      );

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(onComplete).toHaveBeenCalled();
      expect(onComplete.mock.calls[0][0].content).toContain('시공사');
    });

    it('프로젝트별 설정으로 스트리밍할 수 있어야 함', async () => {
      const chunks = ['{"content":"프로젝트별 응답"}\n', '{"done":true}\n'];
      const mockStream = createMockReadableStream(chunks);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const onComplete = jest.fn();

      await notebookLLMStreamingService.streamProjectNotebook(
        'project-123',
        '재개발 프로젝트 시공사 선정에 대해 설명해주세요.',
        {
          projectName: '개포우성7차',
          projectType: 'redevelopment',
        },
        { temperature: 0.7 }
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(notebookLLMService.getProjectNotebookConfig).toHaveBeenCalledWith('project-123');
    });
  });
});

