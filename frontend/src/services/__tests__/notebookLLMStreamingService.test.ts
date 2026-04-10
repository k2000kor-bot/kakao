/**
 * notebookLLMStreamingService 서비스 테스트
 * 노트북 LLM 스트리밍 서비스 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import notebookLLMStreamingService from '../notebookLLMStreamingService';
import notebookLLMService from '../notebookLLMService';
import {
  API_PROJECTS_LIST_PATH,
  API_V7_NOTEBOOK_LLM_STREAM_PATH,
  PROJECT_NOTEBOOK_LLM_SEGMENT,
  joinApiHealthCheckUrl,
  resolveApiBaseUrl,
} from '../../config/api';
import { errorLogger } from '../../utils/errorLogger';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';

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
      read: async (): Promise<ReadableStreamReadResult<Uint8Array>> => {
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
installJestFetchMock();

function mockFetchResponse(init: Record<string, unknown>): Response {
  return init as unknown as Response;
}

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
    jest.mocked(global.fetch).mockClear();
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

      jest.mocked(global.fetch).mockResolvedValueOnce(mockFetchResponse({
        ok: true,
        body: mockStream,
      }));

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
        joinApiHealthCheckUrl(resolveApiBaseUrl(), API_V7_NOTEBOOK_LLM_STREAM_PATH),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('스트리밍 실패 시 에러를 처리해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce(mockFetchResponse({
        ok: false,
        statusText: 'Internal Server Error',
      }));

      const onError = jest.fn();

      await expect(
        notebookLLMStreamingService.streamDefaultNotebook(
          '테스트 프롬프트',
          {},
          {},
          { onError }
        )
      ).rejects.toThrow();

      expect(onError).toHaveBeenCalled();
    });

    it('스트리밍 리더가 없을 때 에러를 발생시켜야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce(mockFetchResponse({
        ok: true,
        body: null,
      }));

      const onError = jest.fn();

      await expect(
        notebookLLMStreamingService.streamDefaultNotebook(
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

      jest.mocked(global.fetch).mockResolvedValueOnce(mockFetchResponse({
        ok: true,
        body: mockStream,
      }));

      await notebookLLMStreamingService.streamDefaultNotebook(
        '테스트 프롬프트',
        { key: 'value' },
        { modelType: 'llama3.1:8b' }
      );

      expect(global.fetch).toHaveBeenCalled();
      const init = jest.mocked(global.fetch).mock.calls[0]?.[1] as RequestInit | undefined;
      expect(init?.body).toBeDefined();
      const body = JSON.parse(String(init!.body));
      
      expect(body.prompt).toBe('테스트 프롬프트');
      expect(body.context).toEqual({ key: 'value' });
      expect(body.config).toBeDefined();
    });

    it('본문 청크 없이 스트림이 닫혀도 누적 metadata는 done 시점에 onMetadata로 전달해야 함', async () => {
      const chunks = ['{"metadata":{"generation_phase":"analyze","trace_id":"t-close"}}\n'];
      const mockStream = createMockReadableStream(chunks);

      jest.mocked(global.fetch).mockResolvedValueOnce(mockFetchResponse({
        ok: true,
        body: mockStream,
      }));

      const onMetadata = jest.fn();
      const onComplete = jest.fn();

      await notebookLLMStreamingService.streamDefaultNotebook(
        '메타만',
        {},
        {},
        { onMetadata, onComplete, chunkSize: 50 }
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(onMetadata).toHaveBeenCalledWith(
        expect.objectContaining({ generation_phase: 'analyze', trace_id: 't-close' }),
      );
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({ content: '', mode: 'streaming' }),
      );
    });

    it('NDJSON metadata가 있으면 onMetadata로 누적 전달해야 함', async () => {
      const longBit = 'x'.repeat(50);
      const chunks = [
        `{"metadata":{"generation_phase":"draft"},"content":"${longBit}"}\n`,
        '{"done":true}\n',
      ];
      const mockStream = createMockReadableStream(chunks);

      jest.mocked(global.fetch).mockResolvedValueOnce(mockFetchResponse({
        ok: true,
        body: mockStream,
      }));

      const onMetadata = jest.fn();
      const onComplete = jest.fn();

      await notebookLLMStreamingService.streamDefaultNotebook(
        '메타 테스트',
        {},
        {},
        { onMetadata, onComplete, chunkSize: 50 }
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(onMetadata).toHaveBeenCalled();
      expect(onMetadata).toHaveBeenCalledWith(
        expect.objectContaining({ generation_phase: 'draft' }),
      );
      expect(onComplete).toHaveBeenCalled();
    });

    it('청크 콜백을 호출해야 함', async () => {
      const chunks = ['{"content":"첫번째"}\n', '{"content":"두번째"}\n', '{"done":true}\n'];
      const mockStream = createMockReadableStream(chunks);

      jest.mocked(global.fetch).mockResolvedValueOnce(mockFetchResponse({
        ok: true,
        body: mockStream,
      }));

      const onChunk = jest.fn();
      const onComplete = jest.fn();

      await notebookLLMStreamingService.streamDefaultNotebook(
        '테스트',
        {},
        {},
        { onChunk, onComplete, chunkSize: 10 }
      );

      // 스트리밍 완료 대기
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(onComplete).toHaveBeenCalled();
    });

    it('잘못된 JSON 라인이 있어도 파싱 실패만 로깅하고 스트리밍을 계속해야 함', async () => {
      const chunks = ['not-valid-json\n', '{"content":"유효한"}\n', '{"done":true}\n'];
      const mockStream = createMockReadableStream(chunks);

      jest.mocked(global.fetch).mockResolvedValueOnce(mockFetchResponse({
        ok: true,
        body: mockStream,
      }));

      const onComplete = jest.fn();

      await notebookLLMStreamingService.streamDefaultNotebook(
        '테스트',
        {},
        {},
        { onComplete }
      );

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(errorLogger.warn).toHaveBeenCalledWith(
        '스트리밍 데이터 파싱 실패',
        expect.objectContaining({
          component: 'NotebookLLMStreamingService',
          action: 'parseStreamingData',
        })
      );
      expect(onComplete).toHaveBeenCalled();
      expect(onComplete.mock.calls[0][0].content).toContain('유효한');
    });

    it('fetch가 reject되면 onError를 호출하고 reject해야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const onError = jest.fn();

      await expect(
        notebookLLMStreamingService.streamDefaultNotebook(
          '테스트',
          {},
          {},
          { onError }
        )
      ).rejects.toThrow('Network error');

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
      expect(onError.mock.calls[0][0].message).toBe('Network error');
    });

    it('스트리밍 완료 시 onComplete에 NotebookLLMResponse 형태를 전달해야 함', async () => {
      const chunks = ['{"content":"완료"}\n', '{"done":true}\n'];
      const mockStream = createMockReadableStream(chunks);

      jest.mocked(global.fetch).mockResolvedValueOnce(mockFetchResponse({
        ok: true,
        body: mockStream,
      }));

      const onComplete = jest.fn();

      await notebookLLMStreamingService.streamDefaultNotebook(
        '테스트',
        {},
        {},
        { onComplete }
      );

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(onComplete).toHaveBeenCalledTimes(1);
      const res = onComplete.mock.calls[0][0];
      expect(res).toMatchObject({
        content: expect.any(String),
        modelUsed: 'streaming',
        mode: 'streaming',
        confidence: 0.8,
      });
      expect(typeof res.processingTime).toBe('number');
      expect(typeof res.tokensUsed).toBe('number');
      expect(typeof res.timestamp).toBe('string');
    });

    it('chunkSize를 옵션으로 전달하면 해당 크기 기준으로 onChunk가 호출될 수 있음', async () => {
      const chunks = [
        '{"content":"a"}\n',
        '{"content":"b"}\n',
        '{"content":"c"}\n',
        '{"content":"d"}\n',
        '{"content":"e"}\n',
        '{"done":true}\n',
      ];
      const mockStream = createMockReadableStream(chunks);

      jest.mocked(global.fetch).mockResolvedValueOnce(mockFetchResponse({
        ok: true,
        body: mockStream,
      }));

      const onChunk = jest.fn();
      const onComplete = jest.fn();

      await notebookLLMStreamingService.streamDefaultNotebook(
        '테스트',
        {},
        {},
        { onChunk, onComplete, chunkSize: 2 }
      );

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(onComplete).toHaveBeenCalled();
      expect(onComplete.mock.calls[0][0].content).toBeDefined();
    });
  });

  describe('streamProjectNotebook', () => {
    const createMockReadableStream = (chunks: string[]) => {
      return new MockReadableStream(chunks);
    };

    it('프로젝트별 노트북 LLM 스트리밍을 시작할 수 있어야 함', async () => {
      const chunks = ['{"content":"프로젝트 스트리밍"}\n', '{"done":true}\n'];
      const mockStream = createMockReadableStream(chunks);

      jest.mocked(global.fetch).mockResolvedValueOnce(mockFetchResponse({
        ok: true,
        body: mockStream,
      }));

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
        joinApiHealthCheckUrl(resolveApiBaseUrl(), `${API_PROJECTS_LIST_PATH}/project-123${PROJECT_NOTEBOOK_LLM_SEGMENT}/stream`),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('프로젝트 설정을 사용해야 함', async () => {
      const chunks = ['{"done":true}\n'];
      const mockStream = createMockReadableStream(chunks);

      jest.mocked(global.fetch).mockResolvedValueOnce(mockFetchResponse({
        ok: true,
        body: mockStream,
      }));

      await notebookLLMStreamingService.streamProjectNotebook(
        'project-123',
        '테스트',
        {},
        {}
      );

      expect(notebookLLMService.getProjectNotebookConfig).toHaveBeenCalledWith('project-123');
    });

    it('프로젝트 스트리밍 실패 시 에러를 처리해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce(mockFetchResponse({
        ok: false,
        statusText: 'Not Found',
      }));

      const onError = jest.fn();

      await expect(
        notebookLLMStreamingService.streamProjectNotebook(
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

      jest.mocked(global.fetch).mockResolvedValueOnce(mockFetchResponse({
        ok: true,
        body: mockStream,
      }));

      await notebookLLMStreamingService.streamProjectNotebook(
        'project-456',
        '테스트',
        {},
        {}
      );

      const init = jest.mocked(global.fetch).mock.calls[0]?.[1] as RequestInit | undefined;
      expect(init?.body).toBeDefined();
      const body = JSON.parse(String(init!.body));
      
      expect(body.config.projectId).toBe('project-456');
    });

    it('프로젝트 스트리밍 시 body가 없으면 리더 에러를 발생시켜야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce(mockFetchResponse({
        ok: true,
        body: null,
      }));

      const onError = jest.fn();

      await expect(
        notebookLLMStreamingService.streamProjectNotebook(
          'project-123',
          '테스트',
          {},
          {},
          { onError }
        )
      ).rejects.toThrow('스트리밍 리더를 사용할 수 없습니다');

      expect(onError).toHaveBeenCalled();
    });

    it('스트림에 data.error가 있으면 onError를 호출하고 종료해야 함', async () => {
      const chunks = ['{"error":"서버 오류"}\n'];
      const mockStream = createMockReadableStream(chunks);

      jest.mocked(global.fetch).mockResolvedValueOnce(mockFetchResponse({
        ok: true,
        body: mockStream,
      }));

      const onError = jest.fn();
      const onComplete = jest.fn();

      await notebookLLMStreamingService.streamProjectNotebook(
        'project-123',
        '테스트',
        {},
        {},
        { onError, onComplete }
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
      expect(onError.mock.calls[0][0].message).toBe('서버 오류');
      expect(onComplete).not.toHaveBeenCalled();
    });

    it('fetch가 reject되면 onError를 호출하고 reject해야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network failure'));

      const onError = jest.fn();

      await expect(
        notebookLLMStreamingService.streamProjectNotebook(
          'project-123',
          '테스트',
          {},
          {},
          { onError }
        )
      ).rejects.toThrow('Network failure');

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
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

      jest.mocked(global.fetch).mockResolvedValueOnce(mockFetchResponse({
        ok: true,
        body: mockStream,
      }));

      const chunksReceived: string[] = [];
      const onChunk = jest.fn((chunk) => {
        chunksReceived.push(chunk.content);
      });
      const onComplete = jest.fn();

      await notebookLLMStreamingService.streamDefaultNotebook(
        '시공사 선정 기준은 무엇인가요?',
        {
          project: '샘플 재개발',
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

      jest.mocked(global.fetch).mockResolvedValueOnce(mockFetchResponse({
        ok: true,
        body: mockStream,
      }));

      await notebookLLMStreamingService.streamProjectNotebook(
        'project-123',
        '재개발 프로젝트 시공사 선정에 대해 설명해주세요.',
        {
          projectName: '샘플 프로젝트',
          projectType: 'redevelopment',
        },
        { temperature: 0.7 }
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(notebookLLMService.getProjectNotebookConfig).toHaveBeenCalledWith('project-123');
    });
  });
});

