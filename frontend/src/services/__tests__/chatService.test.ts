/// <reference types="jest" />
/**
 * chatService 테스트
 * ChatService sendMessage(API·폴백), uploadFile 검증
 */

import { installJestFetchMock } from '../../test-utils/installJestFetchMock';

installJestFetchMock();
const mockFetch: jest.MockedFunction<typeof fetch> = jest.mocked(global.fetch);

/** fetch 목(text)을 Response로 단언 */
function partialTextResponse(init: {
  ok?: boolean;
  status?: number;
  statusText?: string;
  text: () => Promise<string>;
}): Response {
  return init as unknown as Response;
}

jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../config/api', () => ({
  ...jest.requireActual<typeof import('../../config/api')>('../../config/api'),
  API_BASE_URL: 'http://test-api',
}));

import { CHAT_POST_PATH } from '../../config/api';
import {
  AGENTS_QUERY_PARAM_ID,
  AGENTS_QUERY_PARAM_TYPE,
  GENSPARK_AGENTS_TYPE_SUPER_AGENT,
} from '../../config/routes';
import { GENSPARK_REFERENCE_AGENT_ID } from '../gensparkReferenceAgentPreset';
import { ChatService } from '../chatService';

const TEST_CHAT_POST_URL = `http://test-api${CHAT_POST_PATH}`;

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(() => {
    service = new ChatService();
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('API 성공 시 data.response를 message로 반환해야 함', async () => {
      mockFetch.mockResolvedValueOnce(partialTextResponse({
        ok: true,
        text: async () =>
          JSON.stringify({
            success: true,
            response: 'API 응답 메시지',
            model: 'gpt-4',
            tokens: 10,
            processing_time: 100,
            confidence: 0.9,
          }),
      }));

      const result = await service.sendMessage('안녕');

      expect(result.message).toBe('API 응답 메시지');
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.model).toBe('unified-api');
      expect(mockFetch).toHaveBeenCalledWith(
        TEST_CHAT_POST_URL,
        expect.objectContaining({ method: 'POST' })
      );
      const posted = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
      expect(posted).toMatchObject({
        message: '안녕',
        quality: 'enhanced',
      });
      expect(posted.conversation_id).toBeUndefined();
      expect(posted.context).toMatchObject({ original_user_message: '안녕' });
    });

    it('REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT=1이면 URL에 id가 있어도 context에 genspark_*를 넣지 않는다', async () => {
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      mockFetch.mockResolvedValueOnce(
        partialTextResponse({
          ok: true,
          text: async () => JSON.stringify({ success: true, response: 'ok' }),
        })
      );
      try {
        window.history.replaceState(
          {},
          '',
          `/?${AGENTS_QUERY_PARAM_ID}=7c36051a-2b94-4e9e-bd36-05dfabfe3e07`,
        );
        await service.sendMessage('안녕', undefined, undefined, {});
        const posted = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
        expect(posted.context?.genspark_route_agent_id).toBeUndefined();
        expect(posted.context?.genspark_reference_agent_id).toBeUndefined();
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('URL type=super_agent만 있으면 context에 참조 Super Agent id가 실린다', async () => {
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      if (prevDisable !== undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      mockFetch.mockResolvedValueOnce(
        partialTextResponse({
          ok: true,
          text: async () => JSON.stringify({ success: true, response: 'ok' }),
        })
      );
      try {
        window.history.replaceState(
          {},
          '',
          `/?${AGENTS_QUERY_PARAM_TYPE}=${encodeURIComponent(GENSPARK_AGENTS_TYPE_SUPER_AGENT)}`,
        );
        await service.sendMessage('안녕', undefined, undefined, {});
        const posted = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
        expect(posted.context?.genspark_reference_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
        expect(posted.context?.genspark_route_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('GENSPARK_DISABLE이면 type=super_agent만 있어도 context에 genspark_*를 넣지 않는다', async () => {
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      mockFetch.mockResolvedValueOnce(
        partialTextResponse({
          ok: true,
          text: async () => JSON.stringify({ success: true, response: 'ok' }),
        })
      );
      try {
        window.history.replaceState(
          {},
          '',
          `/?${AGENTS_QUERY_PARAM_TYPE}=${encodeURIComponent(GENSPARK_AGENTS_TYPE_SUPER_AGENT)}`,
        );
        await service.sendMessage('안녕', undefined, undefined, {});
        const posted = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
        expect(posted.context?.genspark_route_agent_id).toBeUndefined();
        expect(posted.context?.genspark_reference_agent_id).toBeUndefined();
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('API 응답 metadata의 generation_phase를 pipelineExtras로 전달한다', async () => {
      mockFetch.mockResolvedValueOnce(partialTextResponse({
        ok: true,
        text: async () =>
          JSON.stringify({
            success: true,
            response: '답',
            metadata: { generation_phase: 'verify' },
          }),
      }));

      const result = await service.sendMessage('질문');

      expect(result.message).toBe('답');
      expect(result.pipelineExtras?.pipelineGenerationPhase).toBe('verify');
    });

    it('API 실패 시 폴백 응답을 반환해야 함', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await service.sendMessage('hello');

      expect(result.message).toContain('CORBU.AI');
      expect(result.metadata).toBeDefined();
    });

    it('conversationId와 context를 body에 포함해야 함', async () => {
      mockFetch.mockResolvedValueOnce(partialTextResponse({
        ok: true,
        text: async () => JSON.stringify({ success: true, response: 'ok' }),
      }));

      await service.sendMessage('테스트', undefined, 'conv-1', { key: 'value' });

      const posted = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
      expect(posted).toMatchObject({
        message: '테스트',
        quality: 'enhanced',
        conversation_id: 'conv-1',
      });
      expect(posted.context).toMatchObject({ key: 'value' });
    });

    it('context에 quality가 있으면 body.quality로 전달해야 함', async () => {
      mockFetch.mockResolvedValueOnce(partialTextResponse({
        ok: true,
        text: async () => JSON.stringify({ success: true, response: 'ok' }),
      }));

      await service.sendMessage('테스트', undefined, 'conv-1', { quality: 'ultimate', key: 'value' });

      const callBody = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
      expect(callBody.quality).toBe('ultimate');
      expect(callBody.context).toMatchObject({ key: 'value' });
    });

    it('질문+요구 메시지면 파이프라인 context가 body에 병합되어야 함', async () => {
      mockFetch.mockResolvedValueOnce(partialTextResponse({
        ok: true,
        text: async () => JSON.stringify({ success: true, response: 'ok' }),
      }));

      await service.sendMessage('질문: A\n요구사항: B');

      const callBody = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
      expect(callBody.context?.use_pipeline_v2).toBe(true);
      expect(callBody.context?.agentic_genspark_style).toBe(true);
    });

    it('conversationHistory 옵션을 파이프라인에 전달해야 함', async () => {
      mockFetch.mockResolvedValueOnce(partialTextResponse({
        ok: true,
        text: async () => JSON.stringify({ success: true, response: 'ok' }),
      }));

      await service.sendMessage('/웹검색 날씨', undefined, undefined, undefined, {
        conversationHistory: [{ role: 'user', content: '안녕' }],
      });

      const callBody = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
      expect(callBody.context?.use_pipeline_v2).toBe(true);
      expect(Array.isArray(callBody.context?.conversation_history)).toBe(true);
    });

    it('mergeApiChatContextOptions+상속 env 시 client_generation_scenario를 넣는다', async () => {
      const prev = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
      mockFetch.mockResolvedValueOnce(partialTextResponse({
        ok: true,
        text: async () => JSON.stringify({ success: true, response: 'ok' }),
      }));
      try {
        await service.sendMessage('질문: X\n요구사항: Y', undefined, undefined, undefined, {
          mergeApiChatContextOptions: {
            recentMessagesForScenarioInherit: [
              {
                role: 'assistant',
                pipelineExtras: { generationScenarioMarkdown: '## ChatService\n이전 시나리오' },
              },
            ],
          },
        });
        const callBody = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
        expect(String(callBody.context?.client_generation_scenario)).toContain('ChatService');
      } finally {
        if (prev === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
        else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prev;
      }
    });

    it('options.conversationHistory의 pipelineExtras만으로(merge 옵션 없이) 상속 env 시 client_generation_scenario를 넣는다', async () => {
      const prev = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
      mockFetch.mockResolvedValueOnce(partialTextResponse({
        ok: true,
        text: async () => JSON.stringify({ success: true, response: 'ok' }),
      }));
      try {
        await service.sendMessage('질문: X\n요구사항: Y', undefined, undefined, undefined, {
          conversationHistory: [
            {
              role: 'assistant',
              content: '이전',
              pipelineExtras: { generationScenarioMarkdown: '## ChatService옵션히스\n시나리오' },
            },
          ],
        });
        const callBody = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
        expect(String(callBody.context?.client_generation_scenario)).toContain('ChatService옵션히스');
      } finally {
        if (prev === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
        else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prev;
      }
    });

    it('context.conversation_history의 pipelineExtras만으로 상속 env 시 client_generation_scenario를 넣는다', async () => {
      const prev = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
      mockFetch.mockResolvedValueOnce(partialTextResponse({
        ok: true,
        text: async () => JSON.stringify({ success: true, response: 'ok' }),
      }));
      try {
        await service.sendMessage('질문: X\n요구사항: Y', undefined, undefined, {
          conversation_history: [
            {
              role: 'assistant',
              content: '이전',
              pipelineExtras: { generationScenarioMarkdown: '## ChatService컨텍스트\n시나리오' },
            },
          ],
        });
        const callBody = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
        expect(String(callBody.context?.client_generation_scenario)).toContain('ChatService컨텍스트');
      } finally {
        if (prev === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
        else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prev;
      }
    });

    it('API 실패 후 파일 첨부 시 폴백 응답에 파일명이 포함되어야 함', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const file = new File(['content'], 'report.pdf', { type: 'application/pdf' });
      const result = await service.sendMessage('분석해줘', [file]);

      expect(result.message).toContain('report.pdf');
      expect(result.message).toContain('첨부된 파일');
    });

    it('API가 response.ok false를 반환하면 폴백 응답을 반환해야 함', async () => {
      mockFetch
        .mockResolvedValueOnce(partialTextResponse({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          text: async () => '{}',
        }))
        .mockResolvedValueOnce(partialTextResponse({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          text: async () => '{}',
        }));

      const result = await service.sendMessage('테스트');

      expect(result.message).toContain('CORBU.AI');
      expect(result.metadata).toBeDefined();
    });
  });

  describe('uploadFile', () => {
    it('성공 시 FileUploadResponse 형태를 반환해야 함', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      const result = await service.uploadFile(file);

      expect(result.success).toBe(true);
      expect(result.fileId).toBeDefined();
      expect(result.fileName).toBe('test.txt');
      expect(result.fileSize).toBe(file.size);
      expect(result.fileType).toBe('text/plain');
      expect(result.url).toBeDefined();
    });
  });

  describe('getChatHistory', () => {
    it('대화 히스토리 배열을 반환해야 함', async () => {
      const result = await service.getChatHistory('chat-1');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(0);
      result.forEach((item) => {
        expect(item).toMatchObject({
          id: expect.any(String),
          content: expect.any(String),
          isUser: expect.any(Boolean),
          timestamp: expect.any(Date),
        });
      });
    });
  });

  describe('createNewChat', () => {
    it('새 대화 ID 문자열을 반환해야 함', async () => {
      const result = await service.createNewChat();

      expect(typeof result).toBe('string');
      expect(result).toMatch(/^chat_/);
    });
  });

  describe('saveChatMessage', () => {
    it('저장 성공 시 true를 반환해야 함', async () => {
      const message = {
        id: 'msg-1',
        content: '테스트',
        isUser: true,
        timestamp: new Date(),
      };

      const result = await service.saveChatMessage('chat-1', message);

      expect(result).toBe(true);
    });
  });
});
