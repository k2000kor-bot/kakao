import { test, expect } from '@playwright/test';
import {
  e2eSkipMessageCannotConnectKo,
  skipUnlessE2EServerReachable,
} from './helpers/playwrightEnv';
import { buildComposerStreamSseBody, installComposerChatStub } from './helpers/composerChatStub';
import { fillChatComposerAndSend, waitForComposerInput } from './helpers/chatComposerPage';
import { dismissWebpackDevOverlay } from './helpers/playwrightLocators';
import { PATHS } from './paths';
import { TEST_IDS, byTestId } from './testIds';
import { AGENTS_QUERY_PARAM_ID } from '../src/config/routes';
import { GENSPARK_REFERENCE_AGENT_ID } from '../src/services/gensparkReferenceAgentPreset';

/**
 * `/agents?id=` 세션에서 전송 후 입력창 하단 5단계 진행 UI(`composer-genspark-generation-status`)가
 * 잠시라도 보이는지 검증합니다. 스트림 응답은 지연·SSE 스텁으로 로딩 구간을 확보합니다.
 *
 * 로컬: `E2E_AGENTS_COMPOSER_PIPELINE=1 E2E_SERVER_READY=1 npx playwright test e2e/gensparkAgentsComposerPipeline.spec.ts`
 */
const agentsComposerPipelineE2EEnabled = process.env.E2E_AGENTS_COMPOSER_PIPELINE === '1';
const describeAgentsComposer = agentsComposerPipelineE2EEnabled ? test.describe : test.describe.skip;

describeAgentsComposer('/agents 에이전트 세션 — 입력창 하단 생성 단계 UI', () => {
  test('전송 직후 composer-genspark-generation-status가 표시된다', async ({ page }) => {
    test.skip(!!process.env.E2E_USE_BUILD, '정적 빌드 serve는 이 검증에서 제외합니다');

    if (!(await skipUnlessE2EServerReachable(test, e2eSkipMessageCannotConnectKo()))) return;

    const sseBody = buildComposerStreamSseBody('E2E 스텁 응답');

    const streamStub = async (route: import('@playwright/test').Route) => {
      await new Promise((r) => setTimeout(r, 2200));
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'text/event-stream; charset=utf-8' },
        body: sseBody,
      });
    };

    await page.route('**/api/chat/stream**', streamStub);
    await page.route('**/api/unified/chat/stream**', streamStub);

    const agentUrl = `${PATHS.AGENTS}?${AGENTS_QUERY_PARAM_ID}=${encodeURIComponent(GENSPARK_REFERENCE_AGENT_ID)}`;
    await page.goto(agentUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });

    const chatInput = await waitForComposerInput(page, 20_000);
    if (!chatInput) {
      test.skip('대화 입력 필드를 찾을 수 없습니다');
      return;
    }

    await fillChatComposerAndSend(
      page,
      chatInput,
      `질문: E2E 파이프라인\n요구: 한 줄 (${Date.now()})`,
    );

    const composerStatus = page.locator(byTestId(TEST_IDS.COMPOSER_GENSPARK_GENERATION_STATUS));
    await expect(composerStatus).toBeVisible({ timeout: 15_000 });
  });

  test('다중 요청 전송 시 composer-multi-request-checklist가 표시된다', async ({ page }) => {
    test.skip(!!process.env.E2E_USE_BUILD, '정적 빌드 serve는 이 검증에서 제외합니다');

    if (!(await skipUnlessE2EServerReachable(test, e2eSkipMessageCannotConnectKo()))) return;

    const sseBody = buildComposerStreamSseBody('E2E 다중 요청 스텁');

    const streamStub = async (route: import('@playwright/test').Route) => {
      await new Promise((r) => setTimeout(r, 2800));
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'text/event-stream; charset=utf-8' },
        body: sseBody,
      });
    };

    await page.route('**/api/chat/stream**', streamStub);
    await page.route('**/api/unified/chat/stream**', streamStub);

    const agentUrl = `${PATHS.AGENTS}?${AGENTS_QUERY_PARAM_ID}=${encodeURIComponent(GENSPARK_REFERENCE_AGENT_ID)}`;
    await page.goto(agentUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });

    const chatInput = await waitForComposerInput(page, 20_000);
    if (!chatInput) {
      test.skip('대화 입력 필드를 찾을 수 없습니다');
      return;
    }

    await fillChatComposerAndSend(
      page,
      chatInput,
      `1. E2E 첫 질문 (${Date.now()})\n2. E2E 둘째 요청`,
    );

    const checklist = page.locator(byTestId(TEST_IDS.COMPOSER_MULTI_REQUEST_CHECKLIST));
    await expect(checklist).toBeVisible({ timeout: 15_000 });
    await expect(checklist.getByText(/처리 중/)).toBeVisible({ timeout: 5_000 });
  });

  test('구조화 질문 완료 후 Oversight Council 패널이 과업 메타에 표시된다', async ({ page }) => {
    test.skip(!!process.env.E2E_USE_BUILD, '정적 빌드 serve는 이 검증에서 제외합니다');

    if (!(await skipUnlessE2EServerReachable(test, e2eSkipMessageCannotConnectKo()))) return;

    await installComposerChatStub(page, {
      responses: ['E2E Council 스텁 응답'],
      delayMs: 2400,
    });

    const agentUrl = `${PATHS.AGENTS}?${AGENTS_QUERY_PARAM_ID}=${encodeURIComponent(GENSPARK_REFERENCE_AGENT_ID)}`;
    await page.goto(agentUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await dismissWebpackDevOverlay(page);

    const chatInput = await waitForComposerInput(page, 25_000);
    if (!chatInput) {
      test.skip('대화 입력 필드를 찾을 수 없습니다');
      return;
    }

    await fillChatComposerAndSend(
      page,
      chatInput,
      `질문: E2E Council 패널\n요구사항: 한 줄 요약 (${Date.now()})`,
    );

    await expect(page.getByText('E2E Council 스텁 응답')).toBeVisible({ timeout: 30_000 });

    const extras = page.locator(byTestId(TEST_IDS.COMPOSER_PIPELINE_EXTRAS));
    await expect(extras).toBeVisible({ timeout: 10_000 });
    await extras.locator('summary').click();
    await expect(page.locator(byTestId(TEST_IDS.COMPOSER_OVERSIGHT_COUNCIL))).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByText(/Composer Oversight Council v2/)).toBeVisible();
  });
});
