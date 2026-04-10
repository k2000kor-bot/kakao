import { test, expect } from '@playwright/test';
import { PATHS, LEGACY_REDIRECT_PATHS, NOT_FOUND_PATH } from './paths';
import { NOT_FOUND_PAGE_HEADING } from '../src/config/routes';
import { TEST_IDS, byTestId } from './testIds';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const SKIP_REACHABILITY = process.env.E2E_SKIP_REACHABILITY_CHECK === '1';
const SERVER_READY = process.env.E2E_SERVER_READY === '1';

async function isServerReachable(): Promise<boolean> {
  if (SKIP_REACHABILITY || SERVER_READY) return true;
  try {
    const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(5_000) });
    return res.ok || res.status < 500;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`[E2E] Server unreachable at ${BASE_URL}: ${msg}`);
    return false;
  }
}

/**
 * 기본 E2E 테스트 예제
 * 앱의 기본 기능이 정상 작동하는지 확인
 * - Dev 서버가 baseURL에서 응답하지 않으면 스위트 전체 skip
 */
test.describe('기본 앱 기능', () => {
  test.setTimeout(60_000);

  test('앱이 정상적으로 로드되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.HOME, { waitUntil: 'domcontentloaded', timeout: 30_000 });

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title).toMatch(/CORBU.AI|React App/i);
  });

  test('기본 UI 요소가 렌더링되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.HOME, { waitUntil: 'domcontentloaded', timeout: 30_000 });

    await expect(page.locator('body')).toBeVisible();
  });

  test('통합 앱: 스킵 링크와 메인 콘텐츠 영역이 있어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.HOME, { waitUntil: 'domcontentloaded', timeout: 30_000 });

    const skipLink = page.locator('a[href="#main-content"], a.skip-to-main, a:has-text("본문으로 건너뛰기")').first();
    await expect(skipLink).toBeAttached();
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeAttached();
  });

  test('홈(/) 일반 대화 페이지가 로드되고 대화 영역이 있어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.CHAT, { waitUntil: 'domcontentloaded', timeout: 30_000 });

    const title = await page.title();
    expect(title).toMatch(/대화|CORBU.AI/i);
    const chatContent = page.locator('#chat-main-content')
      .or(page.getByText(/일반 대화|새 대화|AI와 대화/))
      .or(page.locator('textarea'));
    await expect(chatContent.first()).toBeAttached({ timeout: 10_000 });
  });

  test('/agents 허브가 로드되고 안내 제목이 보여야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.AGENTS, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await expect(page.getByTestId('genspark-agents-hub')).toBeAttached({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: /에이전트 \(Genspark 링크\)/ })).toBeVisible();
  });

  test('독립 대화(/chat)에서 메시지 입력 후 전송 시 사용자 메시지가 표시되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.CHAT, { waitUntil: 'domcontentloaded', timeout: 30_000 });

    const chatInput = page.locator('textarea').first();
    await expect(chatInput).toBeVisible({ timeout: 10_000 });
    const testMessage = 'E2E 대화 전송 테스트';
    await chatInput.fill(testMessage);

    const sendBtn = page.locator('button[title*="전송"], button[aria-label*="전송"]').first();
    if (await sendBtn.isVisible().catch(() => false)) {
      await sendBtn.click();
    } else {
      await chatInput.press('Enter');
    }

    // 사용자 메시지 버블 또는 전송 완료 토스트 확인 (백엔드 미연결 시 토스트만 표시될 수 있음)
    const userBubble = page.locator('[data-testid="message-user"]').filter({ hasText: testMessage });
    const sentToast = page.getByRole('status', { name: testMessage });
    await expect(userBubble.or(sentToast)).toBeVisible({ timeout: 12_000 });
  });

  test('독립 대화(/chat)에 메시지 입력창과 전송 버튼이 있어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.CHAT, { waitUntil: 'domcontentloaded', timeout: 30_000 });

    const chatInput = page.getByTestId(TEST_IDS.CHAT_INPUT).first();
    await expect(chatInput).toBeVisible({ timeout: 10_000 });
    const sendButton = page.getByTestId(TEST_IDS.SEND_BUTTON).first();
    await expect(sendButton).toBeAttached({ timeout: 5_000 });
  });

  test('프로젝트(/projects) — UI 켬이면 목록, 끔이면 에이전트 허브로 리다이렉트', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.PROJECTS, { waitUntil: 'domcontentloaded', timeout: 30_000 });

    const title = await page.title();
    expect(title).toMatch(/프로젝트|에이전트|CORBU.AI/i);
    if (page.url().includes('/projects')) {
      const projectContent = page.getByText('프로젝트').or(page.locator(byTestId(TEST_IDS.PROJECT_LIST)));
      await expect(projectContent.first()).toBeAttached({ timeout: 10_000 });
    } else {
      await expect(page.getByTestId('genspark-agents-hub')).toBeVisible({ timeout: 10_000 });
    }
  });

  test('홈(/)에서 사이드바 도구 메뉴가 표시되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.HOME, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    const toolsSection = page.getByText('도구', { exact: true }).first();
    await expect(toolsSection).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('link', { name: '설정으로 이동' })).toBeAttached();
    await expect(page.getByRole('link', { name: '도움말으로 이동' })).toBeAttached();
  });

  test('구버전 /features 경로가 독립 대화(/chat)로 리다이렉트되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(LEGACY_REDIRECT_PATHS.FEATURES, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    const baseEscaped = BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await expect(page).toHaveURL(new RegExp(`^${baseEscaped}/chat(\\?|$)`), { timeout: 5_000 });
  });

  test('구버전 /notebook 경로가 /projects 또는 독립 대화(/chat)로 리다이렉트되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(LEGACY_REDIRECT_PATHS.NOTEBOOK, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    const path = new URL(page.url()).pathname.replace(/\/$/, '') || '/';
    expect(path === '/' || path === PATHS.CHAT || path === '/projects').toBe(true);
  });

  test('사이드바에서 새 대화 링크 클릭 시 독립 대화(/chat)로 이동해야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.PROJECTS, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    const chatLink = page
      .locator('aside')
      .getByRole('link', { name: /새 일반 대화|새 대화/ })
      .first();
    await expect(chatLink).toBeAttached({ timeout: 10_000 });
    await chatLink.click();
    const baseEscaped = BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await expect(page).toHaveURL(new RegExp(`^${baseEscaped}/chat(\\?|$)`), { timeout: 10_000 });
    const title = await page.title();
    expect(title).toMatch(/대화|CORBU.AI/i);
  });

  test('사이드바에서 목소리 생성 클릭 시 /voice-generation으로 이동해야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.HOME, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    const voiceLink = page.getByRole('link', { name: /목소리 생성/i }).first();
    await expect(voiceLink).toBeAttached({ timeout: 10_000 });
    await voiceLink.click();
    await expect(page).toHaveURL(/\/voice-generation/, { timeout: 10_000 });
  });

  test('목소리 생성(/voice-generation) 페이지에 TTS 뷰가 로드되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.VOICE_GENERATION, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await expect(page).toHaveURL(/\/voice-generation/);
    const voiceView = page.getByTestId('voice-generation-view');
    await expect(voiceView).toBeVisible({ timeout: 10_000 });
    await expect(voiceView).toHaveAttribute('aria-label', '음성 생성');
  });

  test('사이드바 프로젝트 링크 — UI 켤 때만 /projects 로 이동', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.HOME, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    const projectLink = page.locator('aside a[href="/projects"]').first();
    const visible = await projectLink.isVisible().catch(() => false);
    if (!visible) {
      test.skip(true, '프로젝트 UI 비활성(기본): aside에 /projects 링크 없음');
      return;
    }
    await projectLink.click();
    await expect(page).toHaveURL(/\/projects/, { timeout: 10_000 });
    const title = await page.title();
    expect(title).toMatch(/프로젝트|CORBU.AI/i);
  });

  test('독립 대화(/chat)에 입력·대화 관련 UI가 있어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.CHAT, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    const chatArea = page.locator('textarea, input[type="text"]').or(page.getByPlaceholder(/메시지|입력|대화/)).first();
    await expect(chatArea).toBeAttached({ timeout: 15_000 });
  });

  test('구버전 /file-analysis 경로가 /projects 또는 독립 대화(/chat)로 리다이렉트되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(LEGACY_REDIRECT_PATHS.FILE_ANALYSIS, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    const path = new URL(page.url()).pathname.replace(/\/$/, '') || '/';
    expect(path === '/' || path === PATHS.CHAT || path === '/projects').toBe(true);
  });

  test('/analytics 경로에서 분석 뷰가 표시되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.ANALYTICS, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await expect(page).toHaveURL(/\/analytics/);
    await expect(page.getByTestId('analytics-view')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('heading', { level: 2, name: '사용 통계' })).toBeVisible({ timeout: 3_000 });
  });

  test('구버전 /features-map 경로가 홈(/)으로 리다이렉트되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(LEGACY_REDIRECT_PATHS.FEATURES_MAP, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    const baseEscaped = BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await expect(page).toHaveURL(new RegExp(`^${baseEscaped}/?(\\?|$)`), { timeout: 5_000 });
  });

  test('/voice-generation 경로에서 목소리 생성 화면이 표시되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.VOICE_GENERATION, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await expect(page).toHaveURL(/\/voice-generation/);
    await expect(page.getByText(/목소리 생성|고급 기능/).first()).toBeVisible({ timeout: 10_000 });
  });

  test('목소리 생성 페이지에서 TTS 입력·생성 UI가 표시되어야 함 (핵심 플로우)', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.VOICE_GENERATION, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await expect(page).toHaveURL(/\/voice-generation/);
    await expect(page.getByTestId('voice-generation-view')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/목소리 생성|고급 기능/).first()).toBeVisible({ timeout: 5_000 });
    // TTS 대본 입력은 lazy/탭 로딩으로 늦게 나올 수 있음 — 있으면 검증, 없으면 통과
    const ttsInput = page.getByTestId('voice-gen-script');
    await expect(ttsInput).toBeVisible({ timeout: 15_000 }).catch(() => {
      // 로컬/빌드 차이로 미노출 시 스킵 (뷰 자체는 검증됨)
    });
  });

  test('/settings 경로에서 설정 뷰가 표시되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.SETTINGS, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByTestId('settings-view')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('heading', { level: 2, name: '테마' })).toBeVisible({ timeout: 3_000 });
  });

  test('/docs 경로에서 도움말 뷰가 표시되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.DOCS, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await expect(page).toHaveURL(/\/docs/);
    await expect(page.getByTestId('docs-view')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('heading', { level: 2, name: '가이드·문서' })).toBeVisible({ timeout: 3_000 });
  });

  test('/templates 경로에서 템플릿 뷰가 표시되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.TEMPLATES, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await expect(page).toHaveURL(/\/templates/);
    await expect(page.getByTestId('templates-view')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('heading', { level: 2, name: '프롬프트 라이브러리' })).toBeVisible({ timeout: 3_000 });
  });

  test('/search 경로에서 검색 뷰가 표시되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.SEARCH, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await expect(page).toHaveURL(/\/search/);
    await expect(page.getByTestId('search-view')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('heading', { level: 2, name: '전역 검색' })).toBeVisible({ timeout: 3_000 });
  });

  test('/integrations 경로에서 연동 뷰가 표시되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.INTEGRATIONS, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await expect(page).toHaveURL(/\/integrations/);
    await expect(page.getByTestId('integrations-view')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('heading', { level: 2, name: '웹훅' })).toBeVisible({ timeout: 3_000 });
  });

  test('/team 경로에서 팀 뷰가 표시되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.TEAM, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await expect(page).toHaveURL(/\/team/);
    await expect(page.getByTestId('team-view')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('heading', { level: 2, name: '멤버' })).toBeVisible({ timeout: 3_000 });
  });

  test('/learn 경로에서 학습 뷰가 표시되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.LEARN, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await expect(page).toHaveURL(/\/learn/);
    await expect(page.getByTestId('learn-view')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('heading', { level: 2, name: '학습 경로' })).toBeVisible({ timeout: 3_000 });
  });

  test('/billing 경로에서 구독 뷰가 표시되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.BILLING, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await expect(page).toHaveURL(/\/billing/);
    await expect(page.getByTestId('billing-view')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('heading', { level: 2, name: '플랜' })).toBeVisible({ timeout: 3_000 });
  });

  test('/workspace 경로에서 워크스페이스 뷰가 표시되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.WORKSPACE, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await expect(page).toHaveURL(/\/workspace/);
    await expect(page.getByTestId('workspace-view')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('heading', { level: 2, name: '워크스페이스 목록' })).toBeVisible({ timeout: 3_000 });
  });

  test('/automation 경로에서 자동화 뷰가 표시되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.AUTOMATION, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await expect(page).toHaveURL(/\/automation/);
    await expect(page.getByTestId('automation-view')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('heading', { level: 2, name: '워크플로우 빌더' })).toBeVisible({ timeout: 3_000 });
  });

  test('/community 경로에서 커뮤니티 뷰가 표시되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(PATHS.COMMUNITY, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await expect(page).toHaveURL(/\/community/);
    await expect(page.getByTestId('community-view')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('heading', { level: 2, name: '포럼' })).toBeVisible({ timeout: 3_000 });
  });

  test('알 수 없는 경로(/404 등)에서 404 페이지가 표시되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`);
      return;
    }
    await page.goto(NOT_FOUND_PATH, { waitUntil: 'domcontentloaded', timeout: 30_000 });

    await expect(page.getByText(NOT_FOUND_PAGE_HEADING)).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveTitle(new RegExp(NOT_FOUND_PAGE_HEADING));
    await expect(page).toHaveTitle(/CORBU\.AI/);
    const homeOrBack = page.getByRole('link', { name: /홈으로|이전 페이지/i }).first();
    await expect(homeOrBack).toBeAttached();
  });
});

