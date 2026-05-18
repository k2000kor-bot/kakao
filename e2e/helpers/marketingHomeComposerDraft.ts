import { expect, type Locator, type Page } from '@playwright/test';
import {
  WORKSPACE_COMPOSER_FORM_ARIA_LABEL,
  WORKSPACE_COMPOSER_PLACEHOLDER,
  WORKSPACE_HOME_HEADLINE,
  WORKSPACE_MARKETING_DOCUMENT_TITLE,
  WORKSPACE_TAGLINE_AFTER_QUERY,
  WORKSPACE_TAGLINE_QUERY_SNIPPET,
} from '../../src/constants/workspaceHomeCopy';
import { PATHS } from '../paths';
import { TEST_IDS } from '../testIds';
import { skipUnlessE2EServerReachableShort, type E2ETestSkip } from './playwrightEnv';

export type MarketingComposerDraftNavCtx = {
  composer: Locator;
  topNav: Locator;
  rail: Locator;
};

/** 홈 질의 입력 후 다양한 경로로 `/chat` 이동 시 입력창에 초안이 반영되는지 공통 검증 */
export async function expectMarketingHomeComposerDraftOnChat(
  testApi: E2ETestSkip,
  page: Page,
  draft: string,
  navigateToChat: (ctx: MarketingComposerDraftNavCtx) => Promise<void>,
): Promise<void> {
  if (!(await skipUnlessE2EServerReachableShort(testApi))) return;
  await page.goto(PATHS.HOME, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await expect(page.getByTestId(TEST_IDS.GENSPARK_MARKETING_HOME)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('heading', { name: WORKSPACE_HOME_HEADLINE })).toBeVisible();
  await expect(page.getByText(WORKSPACE_TAGLINE_QUERY_SNIPPET)).toBeVisible();
  await expect(page.getByText(new RegExp(WORKSPACE_TAGLINE_AFTER_QUERY.trim()))).toBeVisible();
  await expect(page).toHaveTitle(WORKSPACE_MARKETING_DOCUMENT_TITLE, { timeout: 15_000 });
  const composer = page.getByTestId(TEST_IDS.GENSPARK_MARKETING_COMPOSER);
  await expect(composer).toHaveAttribute('aria-label', WORKSPACE_COMPOSER_FORM_ARIA_LABEL);
  const homePrompt = composer.locator('textarea');
  await expect(homePrompt).toBeVisible();
  await expect(homePrompt).toHaveAttribute('placeholder', WORKSPACE_COMPOSER_PLACEHOLDER);
  await homePrompt.fill(draft);
  await navigateToChat({
    composer,
    topNav: page.getByRole('navigation', { name: /빠른 이동/i }),
    rail: page.getByTestId(TEST_IDS.GENSPARK_MARKETING_TOOL_RAIL),
  });
  await expect(page).toHaveURL(/\/chat/, { timeout: 20_000 });
  const chatInput = page.getByTestId(TEST_IDS.CHAT_INPUT).first();
  await expect(chatInput).toBeVisible({ timeout: 15_000 });
  const snippet = draft.trim().slice(0, 48);
  await expect
    .poll(
      async () => {
        const inputVal = (await chatInput.inputValue()).trim();
        if (inputVal === draft.trim()) return 'draft-only';
        const main = page.getByRole('main').first();
        const text = await main.innerText().catch(() => '');
        if (snippet.length > 0 && text.includes(snippet)) return 'autosent';
        return 'waiting';
      },
      { timeout: 25_000 },
    )
    .not.toBe('waiting');
}
