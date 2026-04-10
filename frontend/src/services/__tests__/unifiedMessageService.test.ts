/**
 * unifiedMessageService 서비스 테스트
 * 통합 메시지 서비스 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import { getChatPostUrlsForConfigBase, resolveApiBaseUrl } from '../../config/api';
import { AGENTS_QUERY_PARAM_ID } from '../../config/routes';
import {
  buildModernChatPipelineContext,
  scenarioInheritMergeOptionsFromPipelineLikeMessages,
} from '../modernChatContextBuilder';
import type { Message as UiMessage } from '../../types';
import multiLayerStyleAnalysisSystem, {
  CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS,
} from '../multiLayerStyleAnalysisSystem';
import unifiedMessageService, { UnifiedMessageRequest } from '../unifiedMessageService';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';

const unifiedMessageChatPostUrls = () => getChatPostUrlsForConfigBase(resolveApiBaseUrl());

// fetch 모킹
installJestFetchMock();

// errorLogger 모킹
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const mockFetch: jest.MockedFunction<typeof fetch> = jest.mocked(global.fetch);

describe('unifiedMessageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('싱글톤 인스턴스', () => {
    it('내보낸 인스턴스가 정의되어 있어야 함', () => {
      expect(unifiedMessageService).toBeDefined();
    });
  });

  describe('processMessage', () => {
    it('대화 메시지를 처리할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: {
            content: '테스트 응답',
            sender: 'ai',
            timestamp: new Date().toISOString(),
          },
          metadata: {
            confidence: 0.9,
            tokens: 100,
          },
        }),
      } as Response);

      const request: UnifiedMessageRequest = {
        type: 'chat',
        content: '테스트 메시지',
      };

      const response = await unifiedMessageService.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message).toBeDefined();
      expect(response.message.content).toBe('테스트 응답');
      expect(response.metadata).toBeDefined();
      expect(response.metadata?.usedServices).toContain('chat');
    });

    it('멀티레이어 힌트 env 활성화 시 초장문은 surface 분석 입력이 상한으로 잘린다', async () => {
      const prev = process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT;
      process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT = 'true';
      const spy = jest
        .spyOn(multiLayerStyleAnalysisSystem, 'performMultiLayerAnalysis')
        .mockRejectedValue(new Error('short-circuit'));
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: {
            content: 'ok',
            sender: 'ai',
            timestamp: new Date().toISOString(),
          },
          metadata: {},
        }),
      } as Response);
      try {
        const longMsg = 'q'.repeat(CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS + 30);
        await unifiedMessageService.processMessage({ type: 'chat', content: longMsg });
        expect(spy).toHaveBeenCalledWith(
          'q'.repeat(CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS),
          'surface'
        );
      } finally {
        spy.mockRestore();
        if (prev === undefined) delete process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT;
        else process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT = prev;
      }
    });

    it('첫 /api/chat이 404면 /api/unified/chat으로 재시도한다', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: async () => ({}),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: { response: 'unified 본문' },
          }),
        } as Response);

      const response = await unifiedMessageService.processMessage({
        type: 'chat',
        content: 'hello',
      });

      expect(mockFetch.mock.calls.length).toBe(2);
      const [firstChatUrl, secondChatUrl] = unifiedMessageChatPostUrls();
      expect(mockFetch.mock.calls[0][0]).toBe(firstChatUrl);
      expect(mockFetch.mock.calls[1][0]).toBe(secondChatUrl);
      expect(response.success).toBe(true);
      expect(response.message.content).toBe('unified 본문');
    });

    it('대화 conversationHistory 옵션의 pipelineExtras만으로 상속 env 시 client_generation_scenario를 넣는다', async () => {
      const prev = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: {
            content: 'ok',
            sender: 'ai',
            timestamp: new Date().toISOString(),
          },
        }),
      } as Response);
      try {
        const request: UnifiedMessageRequest = {
          type: 'chat',
          content: '질문: X\n요구사항: Y',
          conversationHistory: [
            {
              role: 'assistant',
              content: '이전',
              pipelineExtras: { generationScenarioMarkdown: '## UnifiedHist옵션\n시나리오' },
            },
          ],
        };
        await unifiedMessageService.processMessage(request);
        const init = (mockFetch.mock.calls[0][1] as { body: string }).body;
        const body = JSON.parse(init);
        expect(String(body.context?.client_generation_scenario)).toContain('UnifiedHist옵션');
      } finally {
        if (prev === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
        else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prev;
      }
    });

    it('대화 context.messages의 pipelineExtras로 상속 env 시 client_generation_scenario를 넣는다', async () => {
      const prev = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: {
            content: 'ok',
            sender: 'ai',
            timestamp: new Date().toISOString(),
          },
        }),
      } as Response);
      try {
        const request: UnifiedMessageRequest = {
          type: 'chat',
          content: '질문: X\n요구사항: Y',
          context: {
            messages: [
              {
                role: 'assistant',
                content: '이전',
                pipelineExtras: { generationScenarioMarkdown: '## UnifiedMessages키\n시나리오' },
              },
            ],
          },
        };
        await unifiedMessageService.processMessage(request);
        const init = (mockFetch.mock.calls[0][1] as { body: string }).body;
        const body = JSON.parse(init);
        expect(String(body.context?.client_generation_scenario)).toContain('UnifiedMessages키');
      } finally {
        if (prev === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
        else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prev;
      }
    });

    it('대화 context.conversation_history의 pipelineExtras로 상속 env 시 client_generation_scenario를 넣는다', async () => {
      const prev = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: {
            content: 'ok',
            sender: 'ai',
            timestamp: new Date().toISOString(),
          },
        }),
      } as Response);
      try {
        const request: UnifiedMessageRequest = {
          type: 'chat',
          content: '질문: X\n요구사항: Y',
          context: {
            conversation_history: [
              {
                role: 'assistant',
                content: '이전',
                pipelineExtras: { generationScenarioMarkdown: '## UnifiedMessage\n시나리오' },
              },
            ],
          },
        };
        await unifiedMessageService.processMessage(request);
        const init = (mockFetch.mock.calls[0][1] as { body: string }).body;
        const body = JSON.parse(init);
        expect(String(body.context?.client_generation_scenario)).toContain('UnifiedMessage');
      } finally {
        if (prev === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
        else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prev;
      }
    });

    it('REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT=1이면 URL에 id가 있어도 chat context에 genspark_*를 넣지 않는다', async () => {
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: {
            content: 'ok',
            sender: 'ai',
            timestamp: new Date().toISOString(),
          },
        }),
      } as Response);
      try {
        window.history.replaceState(
          {},
          '',
          `/?${AGENTS_QUERY_PARAM_ID}=7c36051a-2b94-4e9e-bd36-05dfabfe3e07`,
        );
        await unifiedMessageService.processMessage({
          type: 'chat',
          content: '안녕',
          context: {},
        });
        const body = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
        expect(body.context?.genspark_route_agent_id).toBeUndefined();
        expect(body.context?.genspark_reference_agent_id).toBeUndefined();
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('ModernChat 파이프라인 context로 processMessage(chat) 시 GENSPARK_DISABLE이면 URL id가 context에 끼지 않는다', async () => {
      delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
      const windowUuid = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: {
            content: 'ok',
            sender: 'ai',
            timestamp: new Date().toISOString(),
          },
        }),
      } as Response);
      try {
        window.history.replaceState({}, '', `/?${AGENTS_QUERY_PARAM_ID}=${windowUuid}`);
        const recent: UiMessage[] = [
          { id: 1, sender: 'user', text: '이전', timestamp: 't', analysis: null },
        ];
        const unifiedCtx = buildModernChatPipelineContext('질문: a\n요구사항: b', recent);
        expect(unifiedCtx).toBeDefined();
        const mergeOpts = scenarioInheritMergeOptionsFromPipelineLikeMessages(recent);
        await unifiedMessageService.processMessage({
          type: 'chat',
          content: '질문: a\n요구사항: b',
          context: unifiedCtx as Record<string, unknown>,
          ...(mergeOpts != null ? { mergeApiChatContextOptions: mergeOpts } : {}),
        });
        const body = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
        expect(body.context?.genspark_route_agent_id).not.toBe(windowUuid);
        expect(body.context?.genspark_reference_agent_id).not.toBe(windowUuid);
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('ModernChat 파이프라인 옵션(gensparkRouteAgentId)으로 processMessage(chat) 시 context에 해당 에이전트 id가 실린다', async () => {
      delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
      const routeId = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: {
            content: 'ok',
            sender: 'ai',
            timestamp: new Date().toISOString(),
          },
        }),
      } as Response);
      const unifiedCtx = buildModernChatPipelineContext('질문: a\n요구사항: b', [], {
        gensparkRouteAgentId: routeId,
      });
      expect(unifiedCtx).toBeDefined();
      await unifiedMessageService.processMessage({
        type: 'chat',
        content: '질문: a\n요구사항: b',
        context: unifiedCtx as Record<string, unknown>,
      });
      const body = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
      expect(body.context?.genspark_reference_agent_id).toBe(routeId);
      expect(String(body.context?.genspark_external_agent_profile ?? '')).toContain(routeId);
    });

    it('분석 메시지를 처리할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          analysis: '분석 결과',
          confidence: 0.85,
          tokens: 200,
        }),
      } as Response);

      const request: UnifiedMessageRequest = {
        type: 'analysis',
        content: '분석 요청',
      };

      const response = await unifiedMessageService.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('분석 결과');
      expect(response.metadata?.usedServices).toContain('analysis');
    });

    it('가이드 메시지를 처리할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          generatedMessage: '가이드 내용',
          confidence: 0.9,
          tokens: 150,
        }),
      } as Response);

      const request: UnifiedMessageRequest = {
        type: 'guidance',
        content: '가이드 요청',
      };

      const response = await unifiedMessageService.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('가이드');
      expect(response.metadata?.usedServices).toContain('guidance');
    });

    it('프로젝트 메시지를 처리할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: '프로젝트 정보',
          confidence: 0.8,
          tokens: 120,
        }),
      } as Response);

      const request: UnifiedMessageRequest = {
        type: 'project',
        content: '프로젝트 조회',
      };

      const response = await unifiedMessageService.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('프로젝트');
      expect(response.metadata?.usedServices).toContain('project');
    });

    it('파일 메시지를 처리할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: '파일 정보',
          confidence: 0.85,
          tokens: 100,
        }),
      } as Response);

      const request: UnifiedMessageRequest = {
        type: 'file',
        content: '파일 조회',
      };

      const response = await unifiedMessageService.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('파일');
      expect(response.metadata?.usedServices).toContain('file');
    });

    it('시스템 메시지를 처리할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: '시스템 상태',
          confidence: 0.95,
          tokens: 80,
        }),
      } as Response);

      const request: UnifiedMessageRequest = {
        type: 'system',
        content: '시스템 상태 조회',
      };

      const response = await unifiedMessageService.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('시스템');
      expect(response.metadata?.usedServices).toContain('system');
    });

    it('API 호출 실패 시 폴백 응답을 반환해야 함', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request: UnifiedMessageRequest = {
        type: 'chat',
        content: '테스트',
      };

      const response = await unifiedMessageService.processMessage(request);

      expect(response.success).toBe(false);
      expect(response.message).toBeDefined();
      expect(response.message.content).toBeDefined();
    });

    it('HTTP 에러 시 폴백 응답을 반환해야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const request: UnifiedMessageRequest = {
        type: 'chat',
        content: '테스트',
      };

      const response = await unifiedMessageService.processMessage(request);

      expect(response.success).toBe(false);
    });

    it('알 수 없는 타입은 기본 대화로 처리해야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: {
            content: '응답',
            sender: 'ai',
            timestamp: new Date().toISOString(),
          },
        }),
      } as Response);

      const request = {
        type: 'unknown' as 'chat',
        content: '테스트',
      };

      const response = await unifiedMessageService.processMessage(request);

      expect(response).toBeDefined();
    });

    it('메타데이터를 포함해야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: {
            content: '응답',
            sender: 'ai',
            timestamp: new Date().toISOString(),
          },
        }),
      } as Response);

      const request: UnifiedMessageRequest = {
        type: 'chat',
        content: '테스트',
      };

      const response = await unifiedMessageService.processMessage(request);

      expect(response.metadata).toBeDefined();
      expect(response.metadata?.processingTime).toBeGreaterThanOrEqual(0);
      expect(response.metadata?.confidence).toBeDefined();
      expect(response.metadata?.model).toBeDefined();
      expect(response.metadata?.tokens).toBeDefined();
      expect(response.metadata?.usedServices).toBeDefined();
    });
  });

  describe('processConversationCommand', () => {
    it('분석 명령을 처리할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          analysis: '분석 결과',
          confidence: 0.85,
          tokens: 200,
        }),
      } as Response);

      const response = await unifiedMessageService.processConversationCommand('이것을 분석해주세요');

      expect(response.metadata?.usedServices).toContain('analysis');
    });

    it('가이드 명령을 처리할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          generatedMessage: '가이드',
          confidence: 0.9,
          tokens: 150,
        }),
      } as Response);

      const response = await unifiedMessageService.processConversationCommand('가이드를 알려주세요');

      expect(response.metadata?.usedServices).toContain('guidance');
    });

    it('프로젝트 명령을 처리할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: '프로젝트 정보',
          confidence: 0.8,
          tokens: 120,
        }),
      } as Response);

      const response = await unifiedMessageService.processConversationCommand('프로젝트를 보여주세요');

      expect(response.metadata?.usedServices).toContain('project');
    });

    it('파일 명령을 처리할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: '파일 정보',
          confidence: 0.85,
          tokens: 100,
        }),
      } as Response);

      const response = await unifiedMessageService.processConversationCommand('파일 목록을 보여주세요');

      expect(response.metadata?.usedServices).toContain('file');
    });

    it('시스템 명령을 처리할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: '시스템 상태',
          confidence: 0.95,
          tokens: 80,
        }),
      } as Response);

      const response = await unifiedMessageService.processConversationCommand('시스템 상태를 확인해주세요');

      expect(response.metadata?.usedServices).toContain('system');
    });

    it('영어 명령도 처리할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          analysis: '분석',
          confidence: 0.85,
          tokens: 200,
        }),
      } as Response);

      const response = await unifiedMessageService.processConversationCommand('analyze this');

      expect(response.metadata?.usedServices).toContain('analysis');
    });

    it('명령이 없으면 기본 대화로 처리해야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: {
            content: '응답',
            sender: 'ai',
            timestamp: new Date().toISOString(),
          },
        }),
      } as Response);

      const response = await unifiedMessageService.processConversationCommand('일반 메시지');

      expect(response.metadata?.usedServices).toContain('chat');
    });
  });
});

