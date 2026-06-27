import { test, expect } from '@playwright/test';
import { PATHS } from './paths';
import { TEST_IDS, byTestId } from './testIds';
import {
  e2eSkipMessageCannotConnectKo,
  skipUnlessE2EServerReachable,
} from './helpers/playwrightEnv';
import { installComposerChatStub } from './helpers/composerChatStub';
import { dismissWebpackDevOverlay, seedOnboardingDone } from './helpers/playwrightLocators';
import { fillChatComposerAndSend, waitForComposerInput } from './helpers/chatComposerPage';

/**
 * `/chat` — CSV 첨부·관계도 생성 의도 전송 후 graph 재생성 E2E.
 *
 * 로컬: `E2E_GRAPH_CHAT_REGENERATE=1 E2E_SERVER_READY=1 npx playwright test e2e/graphChatRegenerate.spec.ts`
 */
const enabled = process.env.E2E_GRAPH_CHAT_REGENERATE === '1';
const describeGraphChatRegen = enabled ? test.describe : test.describe.skip;

const GRAPH_CHAT_ANSWER_STUB = [
  '## 요약',
  '',
  '알파와 베타의 관계를 분석한 E2E graph 답변입니다. 조합·재개발 맥락에서 의사소통 흐름을 정리합니다.',
  '',
  '|참여자|입장|',
  '|---|---|',
  '|알파|동조|',
  '|베타|반대|',
  '',
  '## 해석',
  '',
  '알파는 찬성 측 논리를 반복하며 베타는 절차·리스크를 강조합니다.',
  '',
  '```mermaid',
  'flowchart TB',
  '  A[알파] -->|동조| B[베타]',
  '```',
].join('\n');

describeGraphChatRegen('/chat — 관계도 답변 재생성', () => {
  test.describe.configure({ timeout: 120_000 });

  test.beforeEach(async ({ page }) => {
    await seedOnboardingDone(page);
    await page.addInitScript(() => {
      const hideOverlay = () => {
        document.getElementById('webpack-dev-server-client-overlay')?.remove();
        document.querySelector('iframe#webpack-dev-server-client-overlay')?.remove();
      };
      hideOverlay();
      new MutationObserver(hideOverlay).observe(document.documentElement, { childList: true, subtree: true });
    });
  });

  test('첨부·관계도 의도 전송 후 재생성 시 graph API가 다시 호출된다', async ({ page }) => {
    test.skip(!!process.env.E2E_USE_BUILD, '정적 빌드 serve는 이 검증에서 제외합니다');
    if (!(await skipUnlessE2EServerReachable(test, e2eSkipMessageCannotConnectKo()))) return;

    const stub = await installComposerChatStub(page, {
      responses: [GRAPH_CHAT_ANSWER_STUB, GRAPH_CHAT_ANSWER_STUB],
      delayMs: 400,
    });

    await page.goto(PATHS.CHAT, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await dismissWebpackDevOverlay(page);

    const chatInput = await waitForComposerInput(page, 25_000);
    if (!chatInput) {
      test.skip('대화 입력 필드를 찾을 수 없습니다');
      return;
    }

    const csv = `Date,User,Message\n2026-05-13 10:00:00,"알파","찬성합니다"\n2026-05-13 10:01:00,"베타","반대합니다"`;
    const composerFileInput = page
      .getByTestId(TEST_IDS.CHAT_INPUT_CONTAINER)
      .locator('input[type="file"]')
      .first();
    await composerFileInput.setInputFiles({
      name: 'graph-regen.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csv),
    });
    await expect(page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_CHAT_ATTACHED_FILE)).toContainText('graph-regen.csv', {
      timeout: 8_000,
    });

    await fillChatComposerAndSend(page, chatInput, '관계도를 만들어줘');

    await expect
      .poll(() => stub.getPostCount(), { timeout: 45_000, intervals: [400] })
      .toBeGreaterThanOrEqual(1);

    const regenBtn = page.locator(byTestId(TEST_IDS.COMPOSER_REGENERATE_MESSAGE)).first();
    await expect(regenBtn).toBeVisible({ timeout: 45_000 });
    const postsAfterFirst = stub.getPostCount();

    await dismissWebpackDevOverlay(page);
    await regenBtn.click({ force: true });

    await expect
      .poll(() => stub.getPostCount(), { timeout: 45_000, intervals: [400] })
      .toBeGreaterThan(postsAfterFirst);
  });
});
