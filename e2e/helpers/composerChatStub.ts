import type { Page, Route } from '@playwright/test';

export type ComposerChatStubOptions = {
  /** 각 POST /api/chat(·/stream) 응답 본문 */
  responses: string[];
  delayMs?: number;
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

  return { getPostCount: () => postIndex };
}
