import { expect, type Page } from '@playwright/test';
import { PATHS } from '../paths';
import { TEST_IDS } from '../testIds';
import {
  chatStreamRouteStub,
  mockConversationsApi,
  type ConversationGraphMockEdge,
  type ConversationGraphMockNode,
} from './conversationGraphApiMock';
import { dismissWebpackDevOverlay } from './playwrightLocators';

export { dismissWebpackDevOverlay };

type MockOptions = {
  uploadId?: string;
  listName?: string;
  mockUpload?: boolean;
};

/** 관계도 API mock + 화면 진입 + 업로드 목록·선택 대기 */
export async function openConversationGraphWithMock(
  page: Page,
  graphNodes: ConversationGraphMockNode[],
  graphEdges: ConversationGraphMockEdge[],
  options?: MockOptions,
): Promise<void> {
  const handler = mockConversationsApi(graphNodes, graphEdges, options);
  await page.route(/\/api\/conversations/, handler);

  await page.addInitScript(() => {
    const hideOverlay = () => {
      document.getElementById('webpack-dev-server-client-overlay')?.remove();
      document.querySelector('iframe#webpack-dev-server-client-overlay')?.remove();
    };
    hideOverlay();
    new MutationObserver(hideOverlay).observe(document.documentElement, { childList: true, subtree: true });
  });

  await page.goto(PATHS.CONVERSATION_GRAPH, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await dismissWebpackDevOverlay(page);
  await expect(page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_VIEW)).toBeAttached({ timeout: 15_000 });

  const listName = options?.listName ?? 'E2E 관계도';
  await expect(page.getByRole('radio', { name: new RegExp(listName, 'i') })).toBeVisible({ timeout: 20_000 });
}

/** 선택된 대화로 관계도 검색 실행 */
/** E2E용 관계도 UI prefs (localStorage) */
export async function setConversationGraphUiPrefsForE2e(
  page: Page,
  prefs: Record<string, unknown>,
): Promise<void> {
  await page.addInitScript((stored) => {
    localStorage.setItem('corbu.conversationGraph.uiPrefs', JSON.stringify(stored));
  }, prefs);
}

/** 관계도 답변 생성 E2E — 채팅 스트림 SSE 스텁 */
export async function stubGraphAnswerChatStream(page: Page, llmNarrative: string): Promise<void> {
  const streamStub = chatStreamRouteStub(llmNarrative);
  await page.route('**/api/chat/stream**', streamStub);
  await page.route('**/api/unified/chat/stream**', streamStub);
}

export async function clickConversationGraphSearch(page: Page): Promise<void> {
  const form = page.locator('form[aria-label="기간 지정 및 관계도 검색"]');
  const searchBtn = form.getByRole('button', { name: '관계도 검색' });
  await expect(searchBtn).toBeEnabled({ timeout: 15_000 });
  await form.evaluate((el) => {
    if (el instanceof HTMLFormElement) {
      el.requestSubmit();
    }
  });
  await dismissWebpackDevOverlay(page);
}
