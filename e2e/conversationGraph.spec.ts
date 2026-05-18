import { test, expect } from '@playwright/test';
import { PATHS } from './paths';
import { TEST_IDS } from './testIds';
import { isServerReachable, devServerUnreachableSkipMessageShort } from './helpers/playwrightEnv';
import { chatStreamRouteStub, mockConversationsApi } from './helpers/conversationGraphApiMock';
import {
  clickConversationGraphSearch,
  dismissWebpackDevOverlay,
  openConversationGraphWithMock,
} from './helpers/conversationGraphPage';

test.describe('대화 관계도 E2E', () => {
  test.setTimeout(60_000);

  test('관계도 검색 후 요약·참여자 선택·연결 포커스가 동작한다', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, devServerUnreachableSkipMessageShort());
      return;
    }

    await openConversationGraphWithMock(
      page,
      [
        { id: 'p1', label: '알파', message_count: 3, dominant_stance: '동조' },
        { id: 'p2', label: '베타', message_count: 2, dominant_stance: '반대' },
      ],
      [{ source: 'p1', target: 'p2', weight: 2, weight_동조: 2, edge_type: '동조' }],
    );
    await clickConversationGraphSearch(page);

    await expect(page.getByTestId('conversation-graph-stats-panel')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('conversation-graph-stats-stance')).toContainText(/동조 1/);
    await expect(page.getByTestId('conversation-graph-ai-panel')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('conversation-graph-ai-trust')).toBeVisible();
    await expect(page.getByRole('img', { name: '대화 관계도 그래프' })).toBeVisible();

    await page.getByTestId('conversation-graph-participant-p1').click();
    await expect(page.getByTestId('conversation-graph-participant-detail')).toContainText(/알파/);
    await expect(page.getByTestId('conversation-graph-participant-edges')).toBeVisible();

    await page.getByTestId('conversation-graph-edge-link-p2').click();
    await expect(page.getByTestId('conversation-graph-participant-p2')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('conversation-graph-participant-detail')).toContainText(/베타/);
  });

  test('입장 필터 변경 시 표시 인원 요약이 갱신된다', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, devServerUnreachableSkipMessageShort());
      return;
    }

    await openConversationGraphWithMock(
      page,
      [
        { id: 'p1', label: '동조자', message_count: 1, dominant_stance: '동조' },
        { id: 'p2', label: '반대자', message_count: 1, dominant_stance: '반대' },
      ],
      [{ source: 'p1', target: 'p2', weight: 1 }],
    );
    await clickConversationGraphSearch(page);
    await expect(page.getByTestId('conversation-graph-filter-summary')).toContainText(/표시 중 2명/);

    await page.getByTestId('conversation-graph-stance-반대').click();
    await expect(page.getByTestId('conversation-graph-filter-summary')).toContainText(/표시 중 1명/);
  });

  test('CSV 저장 버튼과 입장 프리셋이 동작한다', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, devServerUnreachableSkipMessageShort());
      return;
    }

    await openConversationGraphWithMock(
      page,
      [
        { id: 'p1', label: '동조자', message_count: 1, dominant_stance: '동조' },
        { id: 'p2', label: '반대자', message_count: 1, dominant_stance: '반대' },
      ],
      [{ source: 'p1', target: 'p2', weight: 1 }],
    );
    await clickConversationGraphSearch(page);
    await expect(page.getByTestId('conversation-graph-download-csv')).toBeEnabled();

    await page.getByTestId('conversation-graph-preset-동조').click();
    await expect(page.getByTestId('conversation-graph-filter-summary')).toContainText(/표시 중 1명/);
    await expect(page.getByTestId('conversation-graph-participant-p1')).toBeVisible();
    await expect(page.getByTestId('conversation-graph-participant-p2')).toHaveCount(0);
  });

  test('답변 생성 패널과 참여자 검색이 표시된다', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, devServerUnreachableSkipMessageShort());
      return;
    }

    await openConversationGraphWithMock(
      page,
      [
        { id: 'p1', label: '알파', message_count: 3, dominant_stance: '동조' },
        { id: 'p2', label: '베타', message_count: 2, dominant_stance: '반대' },
      ],
      [{ source: 'p1', target: 'p2', weight: 2, weight_동조: 2, edge_type: '동조' }],
    );
    await clickConversationGraphSearch(page);
    await expect(page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_PANEL)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('conversation-graph-answer-preset-report')).toBeVisible();

    await page.getByTestId('conversation-graph-answer-preset-report').click();
    await expect(page.getByTestId('conversation-graph-answer-prompt')).not.toHaveValue('');

    await expect(page.getByTestId('conversation-graph-participant-search')).toBeVisible();
    await page.getByTestId('conversation-graph-participant-search').fill('알파');
    await expect(page.getByTestId('conversation-graph-participant-p1')).toBeVisible();
    await expect(page.getByTestId('conversation-graph-participant-p2')).toHaveCount(0);
  });

  test('참여자 선택 시 답변 생성 패널에 선택 참여자 프리셋이 표시된다', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, devServerUnreachableSkipMessageShort());
      return;
    }

    await openConversationGraphWithMock(
      page,
      [
        { id: 'p1', label: '알파', message_count: 3, dominant_stance: '동조' },
        { id: 'p2', label: '베타', message_count: 2, dominant_stance: '반대' },
      ],
      [{ source: 'p1', target: 'p2', weight: 2, weight_동조: 2, edge_type: '동조' }],
    );
    await clickConversationGraphSearch(page);
    await expect(page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_PANEL)).toBeVisible({ timeout: 15_000 });

    await page.getByTestId('conversation-graph-participant-p1').click();
    await expect(page.getByTestId('conversation-graph-answer-selected-hint')).toContainText(/알파/);
    await expect(page.getByTestId('conversation-graph-answer-preset-participant')).toBeVisible();
  });

  test('카카오톡 CSV 업로드 후 관계도가 자동 표시된다', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, devServerUnreachableSkipMessageShort());
      return;
    }

    const handler = mockConversationsApi(
      [{ id: 'p1', label: '알파', message_count: 2, dominant_stance: '동조' }],
      [],
      { uploadId: 'e2e-upload', listName: 'e2e.csv', mockUpload: true },
    );
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

    const csv = `Date,User,Message
2026-05-13 10:00:00,"알파","안녕"`;
    await page.locator('input[aria-label="대화 파일 선택 (TXT/CSV)"]').setInputFiles({
      name: 'e2e.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csv),
    });

    await expect(page.getByTestId('kakao-upload-preview')).toBeVisible({ timeout: 15_000 });
    await dismissWebpackDevOverlay(page);
    await page.getByTestId('kakao-upload-confirm').click({ force: true });

    await expect(page.getByTestId('conversation-graph-stats-panel')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('img', { name: '대화 관계도 그래프' })).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_PANEL)).toBeVisible();
  });

  test('답변 생성 클릭 시 다단계 UI 후 스트림 답변이 표시된다', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, devServerUnreachableSkipMessageShort());
      return;
    }

    const answerText = 'E2E 관계도 기반 생성 답변입니다.';
    const streamStub = chatStreamRouteStub(answerText);

    await page.route('**/api/chat/stream**', streamStub);
    await page.route('**/api/unified/chat/stream**', streamStub);
    await openConversationGraphWithMock(
      page,
      [
        { id: 'p1', label: '알파', message_count: 3, dominant_stance: '동조' },
        { id: 'p2', label: '베타', message_count: 2, dominant_stance: '반대' },
      ],
      [{ source: 'p1', target: 'p2', weight: 2, weight_동조: 2, edge_type: '동조' }],
    );
    await clickConversationGraphSearch(page);
    await expect(page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_PANEL)).toBeVisible({ timeout: 15_000 });

    await page.getByTestId('conversation-graph-answer-preset-report').click();
    await page.getByTestId('conversation-graph-answer-generate').click();

    await expect(page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_PIPELINE)).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByTestId(TEST_IDS.GENSPARK_GENERATION_STATUS)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_RESULT)).toContainText(answerText, {
      timeout: 20_000,
    });
  });

  test('대화에서 답변 생성 클릭 시 /chat으로 이동하고 프리셋 초안이 입력된다', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, devServerUnreachableSkipMessageShort());
      return;
    }

    await openConversationGraphWithMock(
      page,
      [
        { id: 'p1', label: '알파', message_count: 3, dominant_stance: '동조' },
        { id: 'p2', label: '베타', message_count: 2, dominant_stance: '반대' },
      ],
      [{ source: 'p1', target: 'p2', weight: 2, weight_동조: 2, edge_type: '동조' }],
    );
    await clickConversationGraphSearch(page);
    await expect(page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_PANEL)).toBeVisible({
      timeout: 15_000,
    });

    await page.getByTestId('conversation-graph-answer-preset-report').click();
    await page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_OPEN_CHAT).click();

    await expect(page).toHaveURL(new RegExp(`${PATHS.CHAT.replace(/\//g, '\\/')}(\\/)?$`), {
      timeout: 15_000,
    });
    const chatInput = page.getByTestId(TEST_IDS.CHAT_INPUT).first();
    await expect(chatInput).toBeVisible({ timeout: 10_000 });
    await expect(chatInput).not.toHaveValue('');
    await expect(chatInput).toHaveValue(/보고서|관계도/);
  });

  test('session handoff 백업으로 관계도 화면에 대화를 불러온다', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, devServerUnreachableSkipMessageShort());
      return;
    }

    const csv = `Date,User,Message\n2026-05-13 10:00:00,"알파","안녕"`;
    await page.addInitScript((paste: string) => {
      sessionStorage.setItem('corbu.conversationGraph.handoffPaste', paste);
    }, csv);

    await openConversationGraphWithMock(
      page,
      [{ id: 'p1', label: '알파', message_count: 2, dominant_stance: '동조' }],
      [],
      { uploadId: 'session-handoff', listName: 'session.csv' },
    );

    await expect(page.getByLabel('대화 텍스트 붙여넣기')).toHaveValue(/알파/, { timeout: 10_000 });
    await expect(page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_PANEL)).toBeVisible({
      timeout: 10_000,
    });
  });

  test('chat handoff 배너로 관계도 화면에 대화를 넘긴다', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, devServerUnreachableSkipMessageShort());
      return;
    }

    const handler = mockConversationsApi(
      [{ id: 'p1', label: '알파', message_count: 2, dominant_stance: '동조' }],
      [],
      { uploadId: 'chat-handoff', listName: 'chat.csv', mockUpload: true },
    );
    await page.route(/\/api\/conversations/, handler);
    await page.addInitScript(() => {
      const hideOverlay = () => {
        document.getElementById('webpack-dev-server-client-overlay')?.remove();
        document.querySelector('iframe#webpack-dev-server-client-overlay')?.remove();
      };
      hideOverlay();
      new MutationObserver(hideOverlay).observe(document.documentElement, { childList: true, subtree: true });
    });

    await page.goto(PATHS.CHAT, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await dismissWebpackDevOverlay(page);

    const csv = `Date,User,Message\n2026-05-13 10:00:00,"알파","안녕"`;
    const chatInput = page.getByTestId(TEST_IDS.CHAT_INPUT).first();
    await expect(chatInput).toBeVisible({ timeout: 15_000 });

    const composerFileInput = page
      .getByTestId(TEST_IDS.CHAT_INPUT_CONTAINER)
      .locator('input[type="file"]')
      .first();
    await composerFileInput.setInputFiles({
      name: 'chat.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csv),
    });
    await expect(page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_CHAT_ATTACHED_FILE)).toContainText('chat.csv', {
      timeout: 5_000,
    });
    await chatInput.fill('관계도를 만들어줘');

    await expect(page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_CHAT_HANDOFF_BANNER)).toBeVisible({
      timeout: 10_000,
    });
    await dismissWebpackDevOverlay(page);
    await page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_CHAT_HANDOFF_OPEN).click({ force: true });

    await expect(page).toHaveURL(/conversation-graph/, { timeout: 15_000 });
    await expect(page.getByLabel('대화 텍스트 붙여넣기')).toHaveValue(/알파/, { timeout: 10_000 });
    await expect(page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_PANEL)).toBeVisible({
      timeout: 10_000,
    });
  });

  test('붙여넣기 후 관계도 만들기 답변 생성이 동작한다', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, devServerUnreachableSkipMessageShort());
      return;
    }

    const answerText = `E2E 관계도 만들기 답변

\`\`\`mermaid
flowchart TB
  알파 -->|동조| 베타
\`\`\``;
    const streamStub = chatStreamRouteStub(answerText);

    await page.route('**/api/chat/stream**', streamStub);
    await page.route('**/api/unified/chat/stream**', streamStub);
    const handler = mockConversationsApi(
      [
        { id: 'p1', label: '알파', message_count: 2, dominant_stance: '동조' },
        { id: 'p2', label: '베타', message_count: 1, dominant_stance: '반대' },
      ],
      [{ source: 'p1', target: 'p2', weight: 2, weight_동조: 2, edge_type: '동조' }],
      { uploadId: 'paste-upload', listName: '붙여넣은 대화', mockUpload: true },
    );
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

    const csv = `Date,User,Message
2026-05-13 10:00:00,"알파","안녕"
2026-05-13 10:01:00,"베타","반대합니다"`;
    await page.getByLabel('대화 텍스트 붙여넣기').fill(csv);

    await expect(page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_PANEL)).toBeVisible({
      timeout: 10_000,
    });
    await dismissWebpackDevOverlay(page);
    await page.getByTestId('conversation-graph-answer-preset-create-graph').click({ force: true });
    await dismissWebpackDevOverlay(page);
    await page.getByTestId('conversation-graph-answer-generate').click({ force: true });

    await expect(page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_PIPELINE)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_RESULT)).toContainText(
      'E2E 관계도 만들기 답변',
      { timeout: 30_000 },
    );
    await expect(page.getByTestId('conversation-graph-mermaid-block')).toBeVisible({ timeout: 20_000 });
  });

  test('대화에서 바로 전송 클릭 시 /chat으로 이동한다', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, devServerUnreachableSkipMessageShort());
      return;
    }

    await openConversationGraphWithMock(
      page,
      [
        { id: 'p1', label: '알파', message_count: 3, dominant_stance: '동조' },
        { id: 'p2', label: '베타', message_count: 2, dominant_stance: '반대' },
      ],
      [{ source: 'p1', target: 'p2', weight: 2, weight_동조: 2, edge_type: '동조' }],
    );
    await clickConversationGraphSearch(page);
    await expect(page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_PANEL)).toBeVisible({
      timeout: 15_000,
    });

    await page.getByTestId('conversation-graph-answer-preset-report').click();
    await page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_OPEN_CHAT_SEND).click();

    await expect(page).toHaveURL(new RegExp(`${PATHS.CHAT.replace(/\//g, '\\/')}(\\/)?$`), {
      timeout: 15_000,
    });
  });
});
