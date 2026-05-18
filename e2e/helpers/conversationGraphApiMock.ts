import type { Route } from '@playwright/test';

export type ConversationGraphMockNode = {
  id: string;
  label: string;
  message_count: number;
  dominant_stance?: string;
  [key: string]: unknown;
};

export type ConversationGraphMockEdge = {
  source: string;
  target: string;
  weight: number;
  [key: string]: unknown;
};

/** GET `/api/conversations`·`relationship-graph`·(선택) POST upload 라우트 스텁 */
export function mockConversationsApi(
  graphNodes: ConversationGraphMockNode[],
  graphEdges: ConversationGraphMockEdge[],
  options?: { uploadId?: string; listName?: string; mockUpload?: boolean },
) {
  const uploadId = options?.uploadId ?? 'e2e-graph';
  const listName = options?.listName ?? 'E2E 관계도';
  const mockUpload = options?.mockUpload ?? false;

  return async (route: Route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (mockUpload && method === 'POST' && url.includes('/upload')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            upload_id: uploadId,
            name: listName,
            filename: 'e2e.txt',
            uploaded_at: '2026-05-13T00:00:00.000Z',
            message_count: graphNodes.reduce((sum, n) => sum + (n.message_count ?? 0), 0) || 2,
          },
        }),
      });
      return;
    }

    if (method !== 'GET') {
      await route.continue();
      return;
    }
    if (url.includes('relationship-graph')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            upload_id: uploadId,
            nodes: graphNodes,
            edges: graphEdges,
          },
        }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          {
            id: uploadId,
            name: listName,
            filename: 't.txt',
            uploaded_at: '2026-05-13T00:00:00.000Z',
            message_count: 10,
          },
        ],
      }),
    });
  };
}

/** 채팅 스트림 SSE 스텁 (답변 생성 E2E) */
export function buildChatStreamSseBody(answerText: string, generationPhase = 'analyze'): string {
  return [
    `data: ${JSON.stringify({ metadata: { generation_phase: generationPhase } })}\n\n`,
    `data: ${JSON.stringify({ content: answerText })}\n\n`,
    `data: ${JSON.stringify({ done: true })}\n\n`,
  ].join('');
}

export function chatStreamRouteStub(answerText: string, delayMs = 1200) {
  const body = buildChatStreamSseBody(answerText);
  return async (route: Route) => {
    await new Promise((r) => setTimeout(r, delayMs));
    await route.fulfill({
      status: 200,
      headers: { 'content-type': 'text/event-stream; charset=utf-8' },
      body,
    });
  };
}
