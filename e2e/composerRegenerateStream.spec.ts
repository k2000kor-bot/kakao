import { test, expect } from '@playwright/test';
import {
  e2eSkipMessageCannotConnectKo,
  skipUnlessE2EServerReachable,
} from './helpers/playwrightEnv';
import { installComposerChatStub } from './helpers/composerChatStub';
import { fillChatComposerAndSend, waitForComposerInput } from './helpers/chatComposerPage';
import { dismissWebpackDevOverlay, seedOnboardingDone, dismissOnboardingOverlay } from './helpers/playwrightLocators';
import { PATHS } from './paths';
import { TEST_IDS, byTestId } from './testIds';
import { AGENTS_QUERY_PARAM_ID } from '../src/config/routes';
import { GENSPARK_REFERENCE_AGENT_ID } from '../src/services/gensparkReferenceAgentPreset';

/**
 * ChatGPTInterface 스트림 경로(`/agents?id=`)에서 재생성 검증.
 *
 * 로컬: `E2E_COMPOSER_REGENERATE=1 E2E_SERVER_READY=1 npx playwright test e2e/composerRegenerateStream.spec.ts`
 */
const enabled = process.env.E2E_COMPOSER_REGENERATE === '1';
const describeRegen = enabled ? test.describe : test.describe.skip;

const structuredPrompt = (tag: string) =>
  `질문: E2E ${tag} 스트림 재생성\n요구사항: 한 줄 (${Date.now()})`;

describeRegen('스트리밍 컴포저 — ChatGPTInterface 재생성', () => {
  test.describe.configure({ timeout: 90_000 });

  test.beforeEach(async ({ page }) => {
    await seedOnboardingDone(page);
  });

  test('에이전트 세션 재생성 시 스트림 API가 다시 호출된다', async ({ page }) => {
    test.skip(!!process.env.E2E_USE_BUILD, '정적 빌드 serve는 이 검증에서 제외합니다');
    if (!(await skipUnlessE2EServerReachable(test, e2eSkipMessageCannotConnectKo()))) return;

    const stub = await installComposerChatStub(page, {
      responses: ['E2E Chat 첫 스트림 응답', 'E2E Chat 재생성 스트림 응답'],
      delayMs: 2200,
    });

    const agentUrl = `${PATHS.AGENTS}?${AGENTS_QUERY_PARAM_ID}=${encodeURIComponent(GENSPARK_REFERENCE_AGENT_ID)}`;
    await page.goto(agentUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await dismissWebpackDevOverlay(page);

    const chatInput = await waitForComposerInput(page, 25_000);
    if (!chatInput) {
      test.skip('대화 입력 필드를 찾을 수 없습니다');
      return;
    }

    await fillChatComposerAndSend(page, chatInput, structuredPrompt('ChatStream'));

    await expect
      .poll(() => stub.getPostCount(), { timeout: 25_000, intervals: [400] })
      .toBeGreaterThanOrEqual(1);

    const regenBtn = page.locator(byTestId(TEST_IDS.COMPOSER_REGENERATE_MESSAGE)).first();
    await expect(regenBtn).toBeVisible({ timeout: 45_000 });
    const postsAfterFirst = stub.getPostCount();

    await dismissWebpackDevOverlay(page);
    await dismissOnboardingOverlay(page);
    await regenBtn.click({ force: true });

    await expect
      .poll(() => stub.getPostCount(), { timeout: 35_000, intervals: [400] })
      .toBeGreaterThan(postsAfterFirst);
  });
});
