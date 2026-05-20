import type { Locator, Page } from '@playwright/test';
import { PATHS } from '../paths';
import { TEST_IDS, byTestId } from '../testIds';
import {
  dismissWebpackDevOverlay,
  hasWebpackErrorOverlay,
  waitForFirstVisibleLocator,
} from './playwrightLocators';

const CHAT_COMPOSER_INPUT_SELECTORS = [
  byTestId(TEST_IDS.CHAT_INPUT),
  `${byTestId(TEST_IDS.CHAT_INPUT_CONTAINER)} ${byTestId(TEST_IDS.CHAT_INPUT)}`,
  'textarea[placeholder*="메시지"]',
  'textarea[placeholder*="Type \'/\' for commands"]',
  'textarea[placeholder*="질문"]',
  `${byTestId(TEST_IDS.CHAT_INPUT_CONTAINER)} textarea`,
  'textarea',
];

/** 현재 페이지에서 컴포저 입력창이 보일 때까지 대기 */
export async function waitForComposerInput(page: Page, timeout = 25_000): Promise<Locator | null> {
  await dismissWebpackDevOverlay(page);
  if (await hasWebpackErrorOverlay(page)) {
    return null;
  }
  return waitForFirstVisibleLocator(page, CHAT_COMPOSER_INPUT_SELECTORS, timeout);
}

/** `/chat` 로드 후 lazy `ChatGPTInterface`·입력창이 보일 때까지 대기 */
export async function gotoChatAndWaitForComposerInput(
  page: Page,
  timeout = 25_000,
): Promise<Locator | null> {
  await page.goto(PATHS.CHAT, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await dismissWebpackDevOverlay(page);
  return waitForComposerInput(page, timeout);
}

/** 입력창에 텍스트 입력 후 전송(버튼 우선, 없으면 Enter) */
export async function fillChatComposerAndSend(page: Page, input: Locator, text: string): Promise<void> {
  await dismissWebpackDevOverlay(page);
  await input.fill(text);
  const sendButton = await waitForFirstVisibleLocator(
    page,
    [
      byTestId(TEST_IDS.SEND_BUTTON),
      'button[type="submit"]',
      'button:has-text("전송")',
      'button:has-text("Send")',
    ],
    8_000,
  );
  if (sendButton && (await sendButton.isEnabled().catch(() => false))) {
    await sendButton.click({ force: true });
  } else {
    await input.press('Enter');
  }
}
