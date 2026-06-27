import { test, expect } from '@playwright/test';
import { PATHS } from './paths';
import { TEST_IDS } from './testIds';
import { isServerReachable, devServerUnreachableSkipMessageShort } from './helpers/playwrightEnv';
import { mockConversationsApi, stubGraphAnswerChatRoutes } from './helpers/conversationGraphApiMock';
import {
  clickConversationGraphSearch,
  clickConversationGraphTestId,
  dismissWebpackDevOverlay,
  openConversationGraphWithMock,
  setConversationGraphUiPrefsForE2e,
  stubGraphAnswerChatStream,
  waitForConversationGraphParticipants,
} from './helpers/conversationGraphPage';

test.describe('대화 관계도 E2E', () => {
  test.describe.configure({ mode: 'serial' });
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
    await waitForConversationGraphParticipants(page);

    await expect(page.getByTestId('conversation-graph-stats-stance')).toContainText(/동조 1/);
    await expect(page.getByTestId('conversation-graph-ai-panel')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('conversation-graph-ai-trust')).toBeVisible();
    await expect(page.getByRole('img', { name: '대화 관계도 그래프' })).toBeVisible();

    await clickConversationGraphTestId(page, 'conversation-graph-participant-p1');
    await expect(page.getByTestId('conversation-graph-participant-detail')).toContainText(/알파/);
    await expect(page.getByTestId('conversation-graph-participant-edges')).toBeVisible();

    await clickConversationGraphTestId(page, 'conversation-graph-edge-link-p2');
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

    await clickConversationGraphTestId(page, 'conversation-graph-stance-반대');
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

    await clickConversationGraphTestId(page, 'conversation-graph-preset-동조');
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
    await expect(page.getByTestId('conversation-graph-answer-format-presets')).toBeVisible();

    await clickConversationGraphTestId(page, 'conversation-graph-answer-format-academic_paper');
    await expect(page.getByTestId('conversation-graph-answer-format-hint')).toContainText(/논문/);
    await expect(page.getByTestId('conversation-graph-answer-prompt')).toContainText(/논문|학술|서론/);

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

    await waitForConversationGraphParticipants(page);
    await clickConversationGraphTestId(page, 'conversation-graph-participant-p1');
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
    await page.route('**/api/conversations**', handler);
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
2026-05-11 10:00:00,"알파","안녕"`;
    await page.locator('input[aria-label="대화 파일 선택 (TXT/CSV)"]').setInputFiles({
      name: 'kakao.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csv),
    });

    await expect(page.getByTestId('kakao-upload-preview')).toBeVisible({ timeout: 20_000 });
    await clickConversationGraphTestId(page, 'kakao-upload-confirm');

    await expect(page.getByTestId('conversation-graph-stats-panel')).toBeVisible({ timeout: 25_000 });
    await expect(page.getByRole('img', { name: '대화 관계도 그래프' })).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_PANEL)).toBeVisible();
  });

  test('답변 생성 클릭 시 다단계 UI 후 스트림 답변이 표시된다', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, devServerUnreachableSkipMessageShort());
      return;
    }

    await setConversationGraphUiPrefsForE2e(page, {
      useTwoPassAnswer: false,
      useStreamAnswer: true,
    });

    const llmNarrative = [
      '## 한 줄 요약',
      '',
      'E2E 관계도 기반 생성 답변입니다. 알파와 베타의 동조·반대 구조를 정리했습니다.',
      '',
      '## 해석·갈등 축·실행 제안',
      '',
      '### 해석',
      '',
      'E2E 관계도 기반 생성 답변입니다. 알파는 동조 성향이 두드러지고 베타는 반대 입장을 보입니다.',
      '스냅샷의 연결 강도와 발화 수를 근거로 관계를 해석했으며, 명시되지 않은 사실은 포함하지 않았습니다.',
      '참여자 알파·베타 간 상호작용은 조합 내 의사소통 패턴을 보여 줍니다.',
      '',
      '### 갈등 축',
      '',
      '알파와 베타 사이 반대 연결은 안건별 이견 가능성을 시사합니다. 동조 축이 있는 참여자는 합의 후보로 볼 수 있습니다.',
      '갈등이 반복되는 주제는 별도 안건으로 분리해 논의하는 것이 운영상 유리합니다.',
      '',
      '### 실행 제안',
      '',
      '1. 알파·베타의 우세 입장을 짧게 확인한 뒤 공유합니다.',
      '2. 동조 축을 중심으로 합의 문안을 정리하고 이견은 별도 표로 관리합니다.',
      '3. 다음 회의 전 실행 가능한 조치 1~2가지를 합의합니다.',
    ].join('\n');
    await stubGraphAnswerChatStream(page, llmNarrative);
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

    await clickConversationGraphTestId(page, 'conversation-graph-answer-preset-report');
    await clickConversationGraphTestId(page, 'conversation-graph-answer-generate');

    const pipeline = page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_PIPELINE);
    await expect(pipeline).toBeVisible({ timeout: 10_000 });
    await expect(
      pipeline.getByTestId(TEST_IDS.GENSPARK_GENERATION_STATUS),
    ).toBeVisible();
    const result = page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_RESULT);
    await expect(result).toContainText('E2E 관계도 기반 생성 답변', { timeout: 30_000 });
    await expect(result).not.toContainText('답변 생성 중', { timeout: 45_000 });
    await expect(result).toContainText('알파');
    await expect(result).toContainText('베타');
    await expect(result).toContainText(/참여자|Mermaid|flowchart/i, { timeout: 15_000 });
    await expect(page.getByTestId('conversation-graph-mermaid-block')).toBeVisible({ timeout: 15_000 });
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

    await clickConversationGraphTestId(page, 'conversation-graph-answer-preset-report');
    await clickConversationGraphTestId(page, TEST_IDS.CONVERSATION_GRAPH_ANSWER_OPEN_CHAT);

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
    await page.route('**/api/conversations**', handler);
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

    await expect(page.locator('#chat-main-content')).toBeAttached({ timeout: 20_000 });
    const chatInput = page.getByTestId(TEST_IDS.CHAT_INPUT).first();
    await expect(chatInput).toBeVisible({ timeout: 20_000 });

    const csv = `Date,User,Message\n2026-05-13 10:00:00,"알파","안녕"`;

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

    await expect(page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_CHAT_ATTACHED_FILE)).toContainText('chat.csv', {
      timeout: 10_000,
    });
    await expect(page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_CHAT_HANDOFF_BANNER)).toBeVisible({
      timeout: 10_000,
    });
    await clickConversationGraphTestId(page, TEST_IDS.CONVERSATION_GRAPH_CHAT_HANDOFF_OPEN);

    await expect(page).toHaveURL(/conversation-graph/, { timeout: 20_000 });
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
    await stubGraphAnswerChatRoutes(page, answerText);

    await setConversationGraphUiPrefsForE2e(page, {
      useTwoPassAnswer: false,
      useStreamAnswer: true,
    });

    const handler = mockConversationsApi(
      [
        { id: 'p1', label: '알파', message_count: 2, dominant_stance: '동조' },
        { id: 'p2', label: '베타', message_count: 1, dominant_stance: '반대' },
      ],
      [{ source: 'p1', target: 'p2', weight: 2, weight_동조: 2, edge_type: '동조' }],
      { uploadId: 'paste-upload', listName: '붙여넣은 대화', mockUpload: true },
    );
    await page.route('**/api/conversations**', handler);
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
    await clickConversationGraphTestId(page, 'conversation-graph-answer-preset-create-graph');
    await clickConversationGraphTestId(page, 'conversation-graph-answer-generate');

    await expect(page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_PIPELINE)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_RESULT)).toContainText(
      'E2E 관계도 만들기 답변',
      { timeout: 30_000 },
    );
    const pasteResult = page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_RESULT);
    await expect(pasteResult).not.toContainText('답변 생성 중', { timeout: 45_000 });
    await expect(page.getByTestId('conversation-graph-mermaid-block')).toBeVisible({ timeout: 20_000 });
  });

  test('2-pass 모드에서 개요·보고서 단계 후 합성 답변이 표시된다', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, devServerUnreachableSkipMessageShort());
      return;
    }

    await setConversationGraphUiPrefsForE2e(page, {
      useTwoPassAnswer: true,
      useStreamAnswer: false,
    });

    const outlineText = [
      '## 한 줄 요약',
      '',
      '알파와 베타의 관계를 짧게 요약합니다.',
      '',
      '## 해석',
      '',
      '개요 해석입니다.',
      '',
      '## 갈등 축',
      '',
      '갈등 축 개요.',
      '',
      '## 실행 제안',
      '',
      '실행 제안 개요.',
    ].join('\n');
    const reportText = '## 해석\n\n2-pass E2E 확장 보고서입니다. 알파와 베타 분석을 보강했습니다.';

    let postCall = 0;
    await page.route('**/api/**/chat**', async (route) => {
      const url = route.request().url();
      if (route.request().method() !== 'POST' || url.includes('/stream')) {
        await route.continue();
        return;
      }
      postCall += 1;
      const text = postCall === 1 ? outlineText : reportText;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: { content: text, role: 'assistant' },
        }),
      });
    });

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
    await expect(page.getByTestId('conversation-graph-answer-two-pass')).toBeChecked();

    await clickConversationGraphTestId(page, 'conversation-graph-answer-preset-report');
    await clickConversationGraphTestId(page, 'conversation-graph-answer-generate');

    await expect(page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_PIPELINE)).toBeVisible({
      timeout: 15_000,
    });
    const result = page.getByTestId(TEST_IDS.CONVERSATION_GRAPH_ANSWER_RESULT);
    await expect(result).toContainText('2-pass E2E 확장 보고서', { timeout: 30_000 });
    await expect(result).toContainText('참여자');
    await expect(result).toContainText('알파');
    await expect(page.getByTestId('conversation-graph-mermaid-block')).toBeVisible({ timeout: 10_000 });
    expect(postCall).toBeGreaterThanOrEqual(2);
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

    await clickConversationGraphTestId(page, 'conversation-graph-answer-preset-report');
    await clickConversationGraphTestId(page, TEST_IDS.CONVERSATION_GRAPH_ANSWER_OPEN_CHAT_SEND);

    await expect(page).toHaveURL(new RegExp(`${PATHS.CHAT.replace(/\//g, '\\/')}(\\/)?$`), {
      timeout: 15_000,
    });
  });
});
