import type { Page, Route } from '@playwright/test';

export type ComposerChatStubOptions = {
  /** 각 POST /api/chat(·/stream) 응답 본문 */
  responses: string[];
  delayMs?: number;
  /** POST body JSON 캡처( E2E context 검증용) */
  onPost?: (url: string, body: Record<string, unknown>) => void;
};

/** `streamingClient`가 파싱하는 SSE 형식 (`content`·`done`·`fullContent`) */
export function buildComposerStreamSseBody(text: string): string {
  return [
    `data: ${JSON.stringify({ content: text })}\n\n`,
    `data: ${JSON.stringify({ done: true, fullContent: text })}\n\n`,
  ].join('');
}

/** 스트림·비스트리밍 `postChat` 공통 스텁 (재생성 E2E 등) */
export async function installComposerChatStub(
  page: Page,
  options: ComposerChatStubOptions,
): Promise<{ getPostCount: () => number }> {
  let postIndex = 0;

  const stub = async (route: Route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    if (options.delayMs) {
      await new Promise((r) => setTimeout(r, options.delayMs));
    }
    const bodyText =
      options.responses[Math.min(postIndex, options.responses.length - 1)] ?? 'E2E 스텁 응답';
    postIndex += 1;

    const url = route.request().url();
    if (options.onPost) {
      try {
        const raw = route.request().postData();
        if (raw) {
          options.onPost(url, JSON.parse(raw) as Record<string, unknown>);
        }
      } catch {
        /* ignore malformed body */
      }
    }
    if (url.includes('/stream')) {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'text/event-stream; charset=utf-8' },
        body: buildComposerStreamSseBody(bodyText),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        response: bodyText,
        analysis: { performance: { response_time: 40 }, emotion: { confidence: 0.9 } },
      }),
    });
  };

  await page.route('**/api/chat**', stub);
  await page.route('**/api/unified/chat**', stub);
  // .env.local REACT_APP_API_URL=http://localhost:5002 직접 호출 대비
  await page.route('http://localhost:5002/api/**', stub);
  await page.route('http://127.0.0.1:5002/api/**', stub);

  return { getPostCount: () => postIndex };
}
