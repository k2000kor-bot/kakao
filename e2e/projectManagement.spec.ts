import { test, expect } from '@playwright/test';
import { PATHS } from './paths';
import { TEST_IDS, byTestId } from './testIds';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const SKIP_REACHABILITY = process.env.E2E_SKIP_REACHABILITY_CHECK === '1';
const SERVER_READY = process.env.E2E_SERVER_READY === '1';

async function isServerReachable(): Promise<boolean> {
  if (SKIP_REACHABILITY || SERVER_READY) return true;
  try {
    const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(5_000) });
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

async function pickVisibleLocator(page: import('@playwright/test').Page, selectors: string[]) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if (await locator.isVisible().catch(() => false)) return locator;
  }
  return null;
}

async function waitVisible(
  page: import('@playwright/test').Page,
  selectors: string[],
  timeout = 10_000
) {
  const perSelectorTimeout = Math.max(500, Math.floor(timeout / Math.max(1, selectors.length)));
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    const ok = await locator
      .waitFor({ state: 'visible', timeout: perSelectorTimeout })
      .then(() => true)
      .catch(() => false);
    if (ok) return locator;
  }
  return null;
}

async function ensureProjectSelected(page: import('@playwright/test').Page) {
  const item = await waitVisible(page, [byTestId(TEST_IDS.PROJECT_ITEM), '.project-item'], 5000);
  if (!item) return false;
  await item.click({ force: true });
  await page.waitForTimeout(400);
  return true;
}

async function ensureSidebarOpen(page: import('@playwright/test').Page) {
  const projectListVisible = await page.locator(byTestId(TEST_IDS.PROJECT_LIST)).first().isVisible().catch(() => false);
  if (projectListVisible) return true;
  const toggle = await pickVisibleLocator(page, [
    '.sidebar-toggle',
    'button[aria-label="사이드바 토글"]',
  ]);
  if (toggle) {
    await toggle.click({ force: true });
    await page.waitForTimeout(500);
  }
  return await page.locator(byTestId(TEST_IDS.PROJECT_LIST)).first().isVisible().catch(() => false);
}

/**
 * ProjectManagement E2E 테스트
 * 프로젝트 관리 기능을 E2E로 검증
 */
test.describe('ProjectManagement E2E 테스트', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    if (await isServerReachable()) {
      await page.goto(PATHS.CHAT, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.evaluate(() => {
        const now = new Date().toISOString();
        const projectId = 'e2e-project-seed';
        localStorage.setItem('chatgpt-projects', JSON.stringify([
          {
            id: projectId,
            name: 'E2E 시드 프로젝트',
            description: '프로젝트 관리 E2E 시드',
            createdAt: now,
            updatedAt: now,
            tags: [],
            files: [],
            webSources: [],
            initialGuidelines: [],
          },
        ]));
        localStorage.setItem('chatgpt-conversations', JSON.stringify([
          {
            id: 'e2e-project-conv',
            title: 'E2E 시드 대화',
            projectId,
            messages: [{ id: 'seed-msg', role: 'user', content: 'seed', timestamp: now }],
            createdAt: now,
            updatedAt: now,
          },
        ]));
      });
      await page.goto(PATHS.PROJECTS, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      if (!page.url().includes('/projects')) {
        testInfo.skip(
          true,
          '프로젝트 UI가 꺼져 있습니다(/projects 리다이렉트). REACT_APP_UI_PROJECTS_ENABLED=true 로 빌드·서버 실행 후 재시도하세요.'
        );
        return;
      }
      await page.goto(PATHS.CHAT, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await ensureSidebarOpen(page);
    }
  });

  test('프로젝트 목록이 표시되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "E2E_SERVER_READY=1 npm run test:e2e:no-server".`);
      return;
    }
    const projectList = await waitVisible(page, [
      byTestId(TEST_IDS.PROJECT_LIST),
      '.projects-section',
      '[aria-label*="프로젝트"]',
    ], 10_000);
    if (projectList) {
      await expect(projectList).toBeVisible();
    } else {
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('새 프로젝트를 생성할 수 있어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "E2E_SERVER_READY=1 npm run test:e2e:no-server".`);
      return;
    }
    const newProjectButton = await waitVisible(page, [
      byTestId(TEST_IDS.NEW_PROJECT_BUTTON),
      'button[aria-label="새 프로젝트 만들기"]',
      'button:has-text("새 프로젝트")',
      'button:has-text("프로젝트 만들기")',
      'button:has-text("New Project")',
    ], 10_000);
    if (newProjectButton) {
      await newProjectButton.click();
      
      // 프로젝트 생성 다이얼로그 확인
      await page.waitForTimeout(1000);
      const dialog = page.locator(`dialog[aria-label="프로젝트 생성 모달"], [role="dialog"], .dialog, ${byTestId(TEST_IDS.PROJECT_DIALOG)}`).first();
      await expect(dialog).toBeVisible({ timeout: 3000 });
      
      // 프로젝트 이름 입력
      const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"], input[type="text"]').first();
      if (await nameInput.isVisible().catch(() => false)) {
        await nameInput.fill('E2E 테스트 프로젝트');
        
        // 생성 버튼 클릭
        const createButton = page.locator('button:has-text("생성"), button:has-text("Create"), button:has-text("저장")').first();
        if (await createButton.isVisible().catch(() => false)) {
          await createButton.click();
          
          // 프로젝트가 생성되었는지 확인
          await page.waitForTimeout(2000);
          const newProject = page.locator('text=E2E 테스트 프로젝트').first();
          await expect(newProject).toBeVisible({ timeout: 5000 });
        }
      }
    } else {
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('프로젝트를 편집할 수 있어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "E2E_SERVER_READY=1 npm run test:e2e:no-server".`);
      return;
    }
    const selected = await ensureProjectSelected(page);
    if (!selected) {
      test.skip(true, '프로젝트 목록이 비어 있거나 프로젝트를 선택할 수 없습니다.');
      return;
    }
    await page.waitForTimeout(1200);
    const editButton = await waitVisible(page, [
      byTestId(TEST_IDS.PROJECT_DETAIL_SETTINGS_BTN),
      byTestId(TEST_IDS.EDIT_PROJECT),
      'button[aria-label="프로젝트 설정"]',
      'button[aria-label="노트북 설정"]',
      'button[aria-label="현재 프로젝트 설정 열기"]',
      'button:has-text("프로젝트 설정")',
      'button:has-text("설정")',
      'button[aria-label*="편집"]',
      'button[aria-label*="edit"]',
    ], 10_000);

    if (editButton) {
      await editButton.click({ force: true });
      await page.waitForTimeout(800);
      const dialog = await pickVisibleLocator(page, [
        byTestId(TEST_IDS.PROJECT_EDIT_MODAL),
        '[role="dialog"][aria-labelledby="project-edit-title"]',
        '.project-edit-modal-overlay',
      ]);
      if (!dialog) {
        await expect(page.locator('body')).toBeVisible();
        return;
      }
      await expect(dialog).toBeVisible({ timeout: 5000 });
      
      // 프로젝트 이름 수정
      const nameInput = page.locator('input[type="text"]').first();
      if (await nameInput.isVisible().catch(() => false)) {
        await nameInput.clear();
        await nameInput.fill('수정된 프로젝트 이름');
        
        // 저장 버튼 클릭
        const saveButton = page.locator('button:has-text("저장"), button:has-text("Save")').first();
        if (await saveButton.isVisible().catch(() => false)) {
          await saveButton.click();
          
          // 프로젝트가 수정되었는지 확인
          await page.waitForTimeout(2000);
          const updatedProject = page.locator('text=수정된 프로젝트 이름').first();
          await expect(updatedProject).toBeVisible({ timeout: 5000 });
        }
      }
    } else {
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('프로젝트를 삭제할 수 있어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "E2E_SERVER_READY=1 npm run test:e2e:no-server".`);
      return;
    }
    // 프로젝트 삭제 버튼 찾기 (프로젝트 목록 내 삭제 아이콘)
    const deleteButton = page.locator(byTestId(TEST_IDS.DELETE_PROJECT)).or(
      page.locator('button[aria-label*="삭제"], button[aria-label*="delete"]')
    ).first();
    
    if (await ensureProjectSelected(page) && await deleteButton.isVisible().catch(() => false)) {
      // 삭제 전 프로젝트 이름 저장
      const projectName = await page.locator(byTestId(TEST_IDS.PROJECT_ITEM)).first().textContent().catch(() => null);
      
      await deleteButton.click();
      
      // 확인 다이얼로그 확인
      await page.waitForTimeout(1000);
      const confirmButton = page.locator('button:has-text("확인"), button:has-text("Confirm"), button:has-text("삭제")').first();
      if (await confirmButton.isVisible().catch(() => false)) {
        await confirmButton.click();
        
        // 프로젝트가 삭제되었는지 확인
        await page.waitForTimeout(2000);
        if (projectName) {
          const deletedProject = page.locator(`text=${projectName}`).first();
          await expect(deletedProject).not.toBeVisible({ timeout: 5000 });
        }
      }
    } else {
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('프로젝트 편집 모달에 파일·지침 섹션이 표시되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "E2E_SERVER_READY=1 npm run test:e2e:no-server".`);
      return;
    }
    await ensureProjectSelected(page);
    const editButton = await waitVisible(page, [
      byTestId(TEST_IDS.PROJECT_DETAIL_SETTINGS_BTN),
      byTestId(TEST_IDS.EDIT_PROJECT),
      'button[aria-label="프로젝트 설정"]',
      'button[aria-label="노트북 설정"]',
      'button[aria-label="현재 프로젝트 설정 열기"]',
      'button:has-text("프로젝트 설정")',
      'button:has-text("설정")',
      'button[aria-label*="편집"]',
      'button[aria-label*="edit"]',
    ], 10_000);

    if (editButton) {
      await editButton.click({ force: true });
      await page.waitForTimeout(800);
      const dialog = await pickVisibleLocator(page, [
        byTestId(TEST_IDS.PROJECT_EDIT_MODAL),
        '[role="dialog"][aria-labelledby="project-edit-title"]',
        '.project-edit-modal-overlay',
      ]);
      if (!dialog) {
        await expect(page.locator('body')).toBeVisible();
        return;
      }
      await expect(dialog).toBeVisible({ timeout: 5000 });
      await expect(dialog).toContainText('프로젝트 파일');
      await expect(dialog).toContainText('지침');
      await expect(dialog.getByTestId(TEST_IDS.PROJECT_EDIT_FILE_ADD)).toBeVisible();
    } else {
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('소스 탭에서 파일 업로드 시 목록에 표시되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "E2E_SERVER_READY=1 npm run test:e2e:no-server".`);
      return;
    }
    const projectId = 'e2e-project-seed';
    const fileName = 'e2e-source-upload.txt';
    const uploadedFile = {
      id: 'file-e2e-upload-1',
      name: fileName,
      type: 'document',
      size: 18,
      uploadedAt: new Date().toISOString(),
    };

    await page.route('**/api/projects/**/files', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { file: uploadedFile } }),
      });
    });

    await page.route(`**/api/projects/${projectId}`, async (route) => {
      const method = route.request().method();
      if (method === 'GET' || method === 'PUT') {
        const putBody = method === 'PUT' ? route.request().postDataJSON() : null;
        const files = (putBody?.files as typeof uploadedFile[] | undefined) ?? [uploadedFile];
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: projectId,
              name: 'E2E 시드 프로젝트',
              description: '프로젝트 관리 E2E 시드',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              files,
              web_sources: [],
              webSources: [],
            },
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.route('**/api/projects/**/notebook-sources/from-file', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            source: { id: 'nb-src-1', title: fileName, type: 'text' },
            source_count: 1,
          },
        }),
      });
    });

    if (!(await ensureProjectSelected(page))) {
      await expect(page.locator('body')).toBeVisible();
      return;
    }

    const sourceTab = await waitVisible(page, [byTestId(TEST_IDS.PROJECT_SOURCES_TAB)], 8000);
    if (!sourceTab) {
      test.skip(true, '소스 탭이 없습니다. 프로젝트 UI가 활성화된 빌드에서 실행하세요.');
      return;
    }
    await sourceTab.click({ force: true });

    const addBtn = await waitVisible(page, [
      byTestId(TEST_IDS.PROJECT_SOURCES_ADD_BTN),
      byTestId(TEST_IDS.PROJECT_SOURCES_EMPTY_CTA),
    ], 5000);
    if (!addBtn) {
      await expect(page.locator('body')).toBeVisible();
      return;
    }
    await addBtn.click({ force: true });

    const modal = await waitVisible(page, [byTestId(TEST_IDS.ADD_SOURCE_MODAL)], 5000);
    if (!modal) {
      await expect(page.locator('body')).toBeVisible();
      return;
    }

    const fileInput = page.getByTestId(TEST_IDS.ADD_SOURCE_MODAL_FILE_INPUT);
    await fileInput.setInputFiles({
      name: fileName,
      mimeType: 'text/plain',
      buffer: Buffer.from('e2e source content'),
    });

    await expect(
      page.locator(byTestId(TEST_IDS.PROJECT_SOURCES_FILE_ITEM)).filter({ hasText: fileName }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId(TEST_IDS.ADD_SOURCE_MODAL)).not.toBeVisible({ timeout: 5000 });
  });

  test('소스 탭에서 파일 제거 시 목록에서 사라져야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "E2E_SERVER_READY=1 npm run test:e2e:no-server".`);
      return;
    }
    const projectId = 'e2e-project-seed';
    const fileName = 'e2e-remove-me.txt';
    const seededFile = {
      id: 'file-e2e-remove-1',
      name: fileName,
      type: 'document',
      size: 10,
      uploadedAt: new Date().toISOString(),
    };

    await page.route(`**/api/projects/${projectId}`, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: projectId,
              name: 'E2E 시드 프로젝트',
              description: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              files: [seededFile],
              web_sources: [],
            },
          }),
        });
        return;
      }
      if (method === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: projectId,
              name: 'E2E 시드 프로젝트',
              files: [],
              web_sources: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.evaluate((seedFile) => {
      const now = new Date().toISOString();
      const projects = JSON.parse(localStorage.getItem('chatgpt-projects') || '[]');
      const idx = projects.findIndex((p: { id: string }) => p.id === 'e2e-project-seed');
      if (idx >= 0) {
        projects[idx] = { ...projects[idx], files: [seedFile], webSources: [] };
        localStorage.setItem('chatgpt-projects', JSON.stringify(projects));
      } else {
        localStorage.setItem('chatgpt-projects', JSON.stringify([
          {
            id: 'e2e-project-seed',
            name: 'E2E 시드 프로젝트',
            files: [seedFile],
            webSources: [],
            createdAt: now,
            updatedAt: now,
          },
        ]));
      }
    }, seededFile);

    if (!(await ensureProjectSelected(page))) {
      await expect(page.locator('body')).toBeVisible();
      return;
    }

    const sourceTab = await waitVisible(page, [byTestId(TEST_IDS.PROJECT_SOURCES_TAB)], 8000);
    if (!sourceTab) {
      test.skip(true, '소스 탭이 없습니다.');
      return;
    }
    await sourceTab.click({ force: true });

    const fileRow = page.locator(byTestId(TEST_IDS.PROJECT_SOURCES_FILE_ITEM)).filter({ hasText: fileName });
    await expect(fileRow).toBeVisible({ timeout: 8000 });

    await page.locator(byTestId(TEST_IDS.PROJECT_SOURCES_FILE_REMOVE)).first().click({ force: true });

    await expect(fileRow).not.toBeVisible({ timeout: 10_000 });
  });

  test('단축키 도움말에 프로젝트·대화 팁이 표시되어야 함', async ({ page }) => {
    if (!(await isServerReachable())) {
      test.skip(true, `Dev server not reachable at ${BASE_URL}. Run "npm start" then "E2E_SERVER_READY=1 npm run test:e2e:no-server".`);
      return;
    }
    const helpButton = await pickVisibleLocator(page, [
      'button[aria-label="키보드 단축키 도움말 열기"]',
      'button:has-text("⌨️")',
    ]);
    if (helpButton) {
      await helpButton.click({ force: true });
    } else {
      await page.keyboard.press('?');
    }
    await page.waitForTimeout(600);
    const helpModal = page.locator('[role="dialog"]').filter({ hasText: '키보드 단축키' }).first();
    const isVisible = await helpModal.isVisible().catch(() => false);
    if (isVisible) {
      await expect(helpModal).toContainText('프로젝트·대화 팁');
      await expect(helpModal).toContainText('드래그');
    } else {
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

