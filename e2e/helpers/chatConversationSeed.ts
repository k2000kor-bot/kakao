import type { Page } from '@playwright/test';
import { PATHS } from '../paths';
import { TEST_IDS, byTestId } from '../testIds';

/** 단일 시드 대화를 넣고 /chat 로드·대기만 (스레드 클릭 없음 — 사이드바 삭제 등용) */
export async function seedOneConversationAndGotoChat(
  page: Page,
  conversationId: string,
  title: string
): Promise<void> {
  await page.evaluate(
    ({ id, t }) => {
      const now = new Date().toISOString();
      localStorage.setItem(
        'chatgpt-conversations',
        JSON.stringify([
          {
            id,
            title: t,
            messages: [{ id: 'u1', role: 'user', content: 'seed', timestamp: now }],
            createdAt: now,
            updatedAt: now,
          },
        ])
      );
    },
    { id: conversationId, t: title }
  );
  await page.goto(PATHS.CHAT, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForTimeout(600);
}

/** 시드 후 사이드바에서 해당 스레드를 연다. 스레드가 안 보이면 false (스킵용). */
export async function seedOneConversationAndOpenChatThread(
  page: Page,
  conversationId: string,
  title: string
): Promise<boolean> {
  await seedOneConversationAndGotoChat(page, conversationId, title);
  const nav = page.getByRole('navigation', { name: '대화 기록' });
  const threadLink = nav.getByTitle(title);
  if (!(await threadLink.isVisible().catch(() => false))) return false;
  await threadLink.click();
  await page.waitForTimeout(500);
  return true;
}

/** 헤더의 「보내기」 details를 연다 */
export async function openChatHeaderSendMenu(page: Page): Promise<void> {
  const send = page.locator(byTestId(TEST_IDS.CHAT_HEADER_SEND_MENU)).first();
  await send.locator('summary').click();
}

/** 헤더의 「관리」 details를 열어 패널 안 액션(대화 삭제 등)이 보이게 함 */
export async function openChatHeaderManageMenu(page: Page): Promise<void> {
  const manage = page.locator(byTestId(TEST_IDS.CHAT_HEADER_MANAGE_MENU)).first();
  await manage.locator('summary').click();
}
