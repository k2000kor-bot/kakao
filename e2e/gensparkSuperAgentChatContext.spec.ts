import { test, expect } from '@playwright/test';
import {
  e2eSkipMessageCannotConnectKo,
  skipUnlessE2EServerReachable,
} from './helpers/playwrightEnv';
import { pickVisibleLocator } from './helpers/playwrightLocators';
import { PATHS } from './paths';
import { TEST_IDS, byTestId } from './testIds';

/** `src/services/gensparkReferenceAgentPreset.ts` 와 동일 — POST context 검증용 */
const GENSPARK_REFERENCE_AGENT_ID = 'eb7747f5-0399-48ff-b436-68a0a23365c9';

/**
 * 실제 브라우저에서 `?type=super_agent`일 때 채팅 POST 본문에 참조 에이전트 id가 실리는지 검증합니다.
 * UI·엔드포인트 변형으로 기본 CI에서는 끕니다.
 *
 * 로컬: `E2E_GENSPARK_CHAT_BODY=1 E2E_SERVER_READY=1 npx playwright test e2e/gensparkSuperAgentChatContext.spec.ts`
 */
const gensparkChatBodyE2EEnabled = process.env.E2E_GENSPARK_CHAT_BODY === '1';
const describeGensparkChat = gensparkChatBodyE2EEnabled ? test.describe : test.describe.skip;

describeGensparkChat('Genspark super_agent URL → chat POST context', () => {
  test('POST /api/chat 본문 context에 genspark_reference_agent_id가 포함된다', async ({ page }) => {
    test.skip(!!process.env.E2E_USE_BUILD, '정적 빌드 serve는 이 검증에서 제외합니다');

    if (!(await skipUnlessE2EServerReachable(test, e2eSkipMessageCannotConnectKo()))) return;

    let captured: unknown;
    const handler = async (route: import('@playwright/test').Route) => {
      const req = route.request();
      if (req.method() !== 'POST') {
        await route.continue();
        return;
      }
      try {
        captured = JSON.parse(req.postData() || '{}');
      } catch {
        captured = null;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, message: 'e2e stub' }),
      });
    };

    await page.route('**/api/chat**', handler);
    await page.route('**/api/unified/chat**', handler);

    await page.goto(`${PATHS.CHAT}?type=super_agent`, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });

    const chatInput = await pickVisibleLocator(page, [
      byTestId(TEST_IDS.CHAT_INPUT),
      'textarea[placeholder*="메시지"]',
      'textarea',
      'input[type="text"]',
    ]);
    if (!chatInput) {
      test.skip('대화 입력 필드를 찾을 수 없습니다');
    }

    await chatInput!.fill(`질문: E2E\n요구사항: 한 줄 (${Date.now()})`);
    const sendButton = await pickVisibleLocator(page, [
      byTestId(TEST_IDS.SEND_BUTTON),
      'button[type="submit"]',
      'button:has-text("전송")',
      'button:has-text("Send")',
    ]);
    if (sendButton && (await sendButton.isEnabled().catch(() => false))) {
      await sendButton.click({ force: true });
    } else {
      await chatInput!.press('Enter');
    }

    await expect
      .poll(
        () => {
          if (!captured || typeof captured !== 'object') return '';
          const ctx = (captured as { context?: Record<string, unknown> }).context;
          return String(ctx?.genspark_reference_agent_id ?? '');
        },
        { timeout: 20_000 },
      )
      .toBe(GENSPARK_REFERENCE_AGENT_ID);
  });
});
