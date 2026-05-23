import { test, expect } from '@playwright/test';
import {
  e2eSkipMessageCannotConnectKo,
  skipUnlessE2EServerReachable,
} from './helpers/playwrightEnv';
import { fillChatComposerAndSend } from './helpers/chatComposerPage';
import { installComposerChatStub } from './helpers/composerChatStub';
import { dismissWebpackDevOverlay, seedOnboardingDone, dismissOnboardingOverlay } from './helpers/playwrightLocators';
import { LEGACY_REDIRECT_PATHS, PATHS } from './paths';
import { TEST_IDS, byTestId } from './testIds';

/**
 * 비스트리밍 화면(Ultimate·파일 분석)에서 재생성 버튼·Council extras 연동 검증.
 *
 * 로컬: `E2E_COMPOSER_REGENERATE=1 E2E_SERVER_READY=1 npx playwright test e2e/composerRegenerateNonStream.spec.ts`
 */
const enabled = process.env.E2E_COMPOSER_REGENERATE === '1';
const describeRegen = enabled ? test.describe : test.describe.skip;

const structuredPrompt = (tag: string) =>
  `질문: E2E ${tag} 재생성\n요구사항: 한 줄 (${Date.now()})`;

describeRegen('비스트리밍 컴포저 — 재생성·Council', () => {
  test.beforeEach(async ({ page }) => {
    await seedOnboardingDone(page);
  });

  test('Ultimate(/ultimate) 재생성 시 API가 다시 호출된다', async ({ page }) => {
    test.skip(!!process.env.E2E_USE_BUILD, '정적 빌드 serve는 이 검증에서 제외합니다');
    if (!(await skipUnlessE2EServerReachable(test, e2eSkipMessageCannotConnectKo()))) return;

    const stub = await installComposerChatStub(page, {
      responses: ['E2E Ultimate 첫 응답', 'E2E Ultimate 재생성 응답'],
      delayMs: 400,
    });

    await page.goto(PATHS.ULTIMATE, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await dismissWebpackDevOverlay(page);

    const input = page.getByRole('textbox', { name: /메시지 입력/i });
    await expect(input).toBeVisible({ timeout: 20_000 });
    await fillChatComposerAndSend(page, input, structuredPrompt('Ultimate'));

    await expect(page.getByText('E2E Ultimate 첫 응답')).toBeVisible({ timeout: 25_000 });
    const postsAfterFirst = stub.getPostCount();
    expect(postsAfterFirst).toBeGreaterThanOrEqual(1);

    await dismissWebpackDevOverlay(page);
    await dismissOnboardingOverlay(page);
    await page.locator(byTestId(TEST_IDS.COMPOSER_REGENERATE_MESSAGE)).first().click({ force: true });

    await expect(page.getByText('E2E Ultimate 재생성 응답')).toBeVisible({ timeout: 25_000 });
    expect(stub.getPostCount()).toBeGreaterThan(postsAfterFirst);

    const extras = page.locator(byTestId(TEST_IDS.COMPOSER_PIPELINE_EXTRAS));
    await expect(extras).toBeVisible({ timeout: 10_000 });
    await dismissOnboardingOverlay(page);
    await extras.locator('summary').click({ force: true });
    await expect(page.locator(byTestId(TEST_IDS.COMPOSER_OVERSIGHT_COUNCIL))).toBeVisible({
      timeout: 5_000,
    });
  });

  test('파일 분석(/file-analysis) 재생성 시 API가 다시 호출된다', async ({ page }) => {
    test.skip(!!process.env.E2E_USE_BUILD, '정적 빌드 serve는 이 검증에서 제외합니다');
    if (!(await skipUnlessE2EServerReachable(test, e2eSkipMessageCannotConnectKo()))) return;

    const stub = await installComposerChatStub(page, {
      responses: ['E2E 파일분석 첫 응답', 'E2E 파일분석 재생성 응답'],
      delayMs: 400,
    });

    await page.goto(LEGACY_REDIRECT_PATHS.FILE_ANALYSIS, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    await dismissWebpackDevOverlay(page);

    const root = page.locator(byTestId(TEST_IDS.PAGE_FILE_ANALYSIS));
    const visible = await root.isVisible({ timeout: 8_000 }).catch(() => false);
    if (!visible) {
      test.skip('파일 분석 페이지가 이 빌드에서 노출되지 않습니다');
      return;
    }

    const input = page.locator('#file-analysis-message-input');
    await fillChatComposerAndSend(page, input, structuredPrompt('FileAnalysis'));

    await expect(page.getByText('E2E 파일분석 첫 응답')).toBeVisible({ timeout: 25_000 });
    const postsAfterFirst = stub.getPostCount();

    await dismissWebpackDevOverlay(page);
    await page.locator(byTestId(TEST_IDS.COMPOSER_REGENERATE_MESSAGE)).first().click({ force: true });

    await expect(page.getByText('E2E 파일분석 재생성 응답')).toBeVisible({ timeout: 25_000 });
    expect(stub.getPostCount()).toBeGreaterThan(postsAfterFirst);
  });
});
