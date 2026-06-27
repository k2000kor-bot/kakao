import { test, expect } from '@playwright/test';
import { PATHS } from './paths';
import { TEST_IDS } from './testIds';
import {
  e2eSkipMessageCannotConnectKo,
  skipUnlessE2EServerReachable,
} from './helpers/playwrightEnv';
import { installComposerChatStub } from './helpers/composerChatStub';
import { waitForComposerInput } from './helpers/chatComposerPage';
import { dismissWebpackDevOverlay, seedOnboardingDone } from './helpers/playwrightLocators';

/**
 * `/chat` — 메시지 없음(또는 초기화) 상태에서 대화 파일 첨부 + 짧은 지시 전송 시
 * `conversation_file_content`가 API context에 포함되고 fast path가 꺼지는지 검증.
 *
 * 로컬: `E2E_COMPOSER_ATTACH_CONTEXT=1 E2E_SERVER_READY=1 npx playwright test e2e/composerAttachShortInstruction.spec.ts`
 */
const enabled = process.env.E2E_COMPOSER_ATTACH_CONTEXT === '1';
const describeAttachContext = enabled ? test.describe : test.describe.skip;

describeAttachContext('/chat — 첨부 + 짧은 지시 맥락 전송', () => {
  test.describe.configure({ timeout: 90_000 });

  test.beforeEach(async ({ page }) => {
    await seedOnboardingDone(page);
  });

  test('대화 txt 첨부 후 짧은 지시 전송 시 context에 파일 본문·full pipeline', async ({ page }) => {
    test.skip(!!process.env.E2E_USE_BUILD, '정적 빌드 serve는 이 검증에서 제외합니다');
    if (!(await skipUnlessE2EServerReachable(test, e2eSkipMessageCannotConnectKo()))) return;

    let lastPostBody: Record<string, unknown> | null = null;
    await installComposerChatStub(page, {
      responses: ['첨부 대화를 반영한 E2E 스텁 응답입니다.'],
      delayMs: 400,
      onPost: (_url, body) => {
        lastPostBody = body;
      },
    });

    await page.goto(PATHS.CHAT, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await dismissWebpackDevOverlay(page);

    const chatInput = await waitForComposerInput(page, 25_000);
    if (!chatInput) {
      test.skip('대화 입력 필드를 찾을 수 없습니다');
      return;
    }

    const txt = `user: 계약 해지 조건이 뭐야?\nassistant: 30일 전 서면 통지가 필요합니다.\n`.repeat(
      12,
    );
    const composerFileInput = page
      .getByTestId(TEST_IDS.CHAT_INPUT_CONTAINER)
      .locator('input[type="file"]')
      .first();
    await composerFileInput.setInputFiles({
      name: 'prior-chat.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from(txt, 'utf-8'),
    });

    await chatInput.fill('위 내용 기준으로 3줄 요약해줘');
    await chatInput.evaluate((el, value) => {
      const ta = el as HTMLTextAreaElement;
      ta.value = value;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }, '위 내용 기준으로 3줄 요약해줘');
    await chatInput.press('Enter');

    await expect(page.getByText(/첨부 대화를 반영한 E2E 스텁/)).toBeVisible({ timeout: 45_000 });

    await expect.poll(() => lastPostBody, { timeout: 15_000 }).not.toBeNull();
    const ctx = (lastPostBody!.context ?? {}) as Record<string, unknown>;
    const fileContent = String(ctx.conversation_file_content ?? '');
    expect(fileContent.length).toBeGreaterThan(100);
    expect(fileContent).toContain('계약 해지');
    expect(ctx.composer_simple_query).not.toBe(true);
    expect(ctx.qa_pipeline_fast_path).not.toBe(true);
  });
});
