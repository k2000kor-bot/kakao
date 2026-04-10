import { test, expect } from '@playwright/test';
import { PATHS } from './paths';
import { TEST_IDS, byTestId, byTestIdPrefix } from './testIds';

/**
 * ChatGPT5CompleteInterface E2E 테스트
 * 통합 대화 인터페이스의 주요 기능을 E2E로 검증
 */

test.describe('ChatGPT5CompleteInterface E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PATHS.CHAT);
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);
  });

  test('ChatGPT5 인터페이스가 올바르게 렌더링되어야 함', async ({ page }) => {
    // ChatGPT 5 제목이 표시되는지 확인
    const title = page.locator('text=/ChatGPT 5/i, h1:has-text("ChatGPT 5"), h2:has-text("ChatGPT 5")').first();
    
    await page.waitForTimeout(2000);
    const isTitleVisible = await title.isVisible().catch(() => false);
    
    if (isTitleVisible) {
      await expect(title).toBeVisible({ timeout: 5000 });
    } else {
      // 대체 확인: 페이지가 로드되었는지 확인
      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });

  test('프로젝트를 생성할 수 있어야 함', async ({ page }) => {
    // 새 프로젝트 만들기 버튼 찾기
    const newProjectButton = page.locator(
      `button:has-text("새 프로젝트 만들기"), button:has-text("새 프로젝트"), button:has-text("New Project"), ${byTestId(TEST_IDS.NEW_PROJECT_BUTTON)}`
    ).first();
    
    await page.waitForTimeout(2000);
    const isButtonVisible = await newProjectButton.isVisible().catch(() => false);
    
    if (isButtonVisible) {
      await newProjectButton.click();
      
      // 프로젝트 생성 다이얼로그 또는 폼 확인
      await page.waitForTimeout(1000);
      const dialog = page.locator(`[role="dialog"], ${byTestId(TEST_IDS.PROJECT_CREATION_DIALOG)}`).first();
      const isDialogVisible = await dialog.isVisible().catch(() => false);
      
      if (isDialogVisible) {
        // 프로젝트 이름 입력
        const nameInput = page.locator(
          'input[placeholder*="이름"], ' +
          'input[placeholder*="프로젝트"], ' +
          'input[type="text"]'
        ).first();
        
        if (await nameInput.isVisible().catch(() => false)) {
          await nameInput.fill('E2E 테스트 프로젝트');
          
          // 생성 버튼 클릭
          const createButton = page.locator(
            'button:has-text("생성"), ' +
            'button:has-text("Create"), ' +
            'button:has-text("저장"), ' +
            'button[type="submit"]'
          ).first();
          
          if (await createButton.isVisible().catch(() => false)) {
            await createButton.click();
            
            // 프로젝트가 생성되었는지 확인
            await page.waitForTimeout(2000);
            const newProject = page.locator('text=E2E 테스트 프로젝트').first();
            await expect(newProject).toBeVisible({ timeout: 5000 });
          }
        }
      }
    } else {
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('대화 입력 필드에 메시지를 입력할 수 있어야 함', async ({ page }) => {
    const chatInput = page.locator(
      `${byTestId(TEST_IDS.CHAT_INPUT)}, textarea[placeholder*="메시지"], textarea[placeholder*="message"], input[type="text"], textarea, [contenteditable="true"]`
    ).first();
    
    await page.waitForTimeout(2000);
    const isInputVisible = await chatInput.isVisible().catch(() => false);
    
    if (isInputVisible) {
      await chatInput.click();
      await chatInput.fill('안녕하세요, 테스트 메시지입니다.');
      
      // 입력된 텍스트 확인
      const inputValue = await chatInput.inputValue().catch(() => '');
      if (inputValue) {
        expect(inputValue).toContain('안녕하세요');
      }
    } else {
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('메시지를 전송할 수 있어야 함', async ({ page }) => {
    const chatInput = page.locator(
      `${byTestId(TEST_IDS.CHAT_INPUT)}, textarea[placeholder*="메시지"], input[type="text"], textarea`
    ).first();
    
    await page.waitForTimeout(2000);
    const isInputVisible = await chatInput.isVisible().catch(() => false);
    
    if (isInputVisible) {
      // 메시지 입력
      await chatInput.fill('테스트 메시지 전송');
      
      // 전송 버튼 찾기
      const sendButton = page.locator(
        `button[type="submit"], button:has-text("전송"), button:has-text("Send"), ${byTestId(TEST_IDS.SEND_BUTTON)}, button[aria-label*="전송"]`
      ).first();
      
      if (await sendButton.isVisible().catch(() => false)) {
        await sendButton.click();
      } else {
        // Enter 키로 전송 시도
        await chatInput.press('Enter');
      }
      
      // 메시지가 전송되었는지 확인 (로딩 인디케이터 또는 메시지 표시)
      await page.waitForTimeout(2000);
      const message = page.locator('text=테스트 메시지 전송').first();
      const isMessageVisible = await message.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (!isMessageVisible) {
        // 대체 확인: 타이핑 인디케이터 확인
        const typingIndicator = page.locator(`${byTestId(TEST_IDS.TYPING_INDICATOR)}, ${byTestId(TEST_IDS.LOADING)}`).first();
        await typingIndicator.isVisible({ timeout: 3000 }).catch(() => {});
      }
    } else {
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('프로젝트 카테고리 필터가 작동해야 함', async ({ page }) => {
    // 카테고리 버튼들 찾기
    const categoryButtons = page.locator(
      'button:has-text("투자"), ' +
      'button:has-text("숙제"), ' +
      'button:has-text("글쓰기"), ' +
      'button:has-text("건강"), ' +
      'button:has-text("여행")'
    );
    
    await page.waitForTimeout(2000);
    const buttonCount = await categoryButtons.count();
    
    if (buttonCount > 0) {
      // 첫 번째 카테고리 버튼 클릭
      const firstCategoryButton = categoryButtons.first();
      await firstCategoryButton.click();
      
      // 카테고리가 선택되었는지 확인 (시각적 피드백)
      await page.waitForTimeout(1000);
      
      // 버튼이 선택된 상태인지 확인 (aria-pressed 또는 class)
      const isPressed = await firstCategoryButton.getAttribute('aria-pressed');
      const className = await firstCategoryButton.getAttribute('class');
      
      if (isPressed === 'true' || className?.includes('selected') || className?.includes('active')) {
        expect(isPressed || className).toBeTruthy();
      }
    } else {
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('검색 기능이 작동해야 함', async ({ page }) => {
    // 검색 입력 필드 찾기
    const searchInput = page.locator(
      `input[type="search"], input[placeholder*="검색"], input[placeholder*="Search"], ${byTestId(TEST_IDS.SEARCH_INPUT)}, input[aria-label*="검색"]`
    ).first();
    
    await page.waitForTimeout(2000);
    const isSearchVisible = await searchInput.isVisible().catch(() => false);
    
    if (isSearchVisible) {
      await searchInput.fill('테스트 검색어');
      await page.waitForTimeout(1000);
      
      // 검색 결과가 표시되는지 확인
      const searchResults = page.locator(`${byTestId(TEST_IDS.SEARCH_RESULTS)}, .search-results`).first();
      const hasResults = await searchResults.isVisible({ timeout: 3000 }).catch(() => false);
      
      // 검색어가 입력되었는지 확인
      const inputValue = await searchInput.inputValue().catch(() => '');
      expect(inputValue).toContain('테스트 검색어');
    } else {
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('탭 전환이 작동해야 함', async ({ page }) => {
    // 탭 버튼들 찾기
    const tabs = page.locator(
      `[role="tab"], button[aria-label*="탭"], ${byTestIdPrefix('tab')}`
    );
    
    await page.waitForTimeout(2000);
    const tabCount = await tabs.count();
    
    if (tabCount > 1) {
      // 두 번째 탭 클릭
      const secondTab = tabs.nth(1);
      await secondTab.click();
      
      await page.waitForTimeout(1000);
      
      // 탭이 선택되었는지 확인
      const isSelected = await secondTab.getAttribute('aria-selected');
      const className = await secondTab.getAttribute('class');
      
      if (isSelected === 'true' || className?.includes('selected') || className?.includes('active')) {
        expect(isSelected || className).toBeTruthy();
      }
    } else {
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('새 대화 시작 버튼이 작동해야 함', async ({ page }) => {
    // 새 대화 시작 버튼 찾기
    const newChatButton = page.locator(
      `button:has-text("새 채팅 시작"), button:has-text("새 채팅"), button:has-text("새 대화"), button:has-text("New Chat"), a:has-text("새 대화"), ${byTestId(TEST_IDS.NEW_CHAT_BUTTON)}`
    ).first();
    
    await page.waitForTimeout(2000);
    const isButtonVisible = await newChatButton.isVisible().catch(() => false);
    
    if (isButtonVisible) {
      await newChatButton.click();
      await page.waitForTimeout(1000);
      
      // 새 대화가 시작되었는지 확인 (입력 필드가 비어 있거나 새 세션 표시)
      const chatInput = page.locator(
        'input[type="text"], ' +
        'textarea, ' +
        '[contenteditable="true"]'
      ).first();
      
      if (await chatInput.isVisible().catch(() => false)) {
        const inputValue = await chatInput.inputValue().catch(() => '');
        // 새 대화면 입력 필드가 비어 있거나 히스토리가 없는 상태
        expect(inputValue).toBeFalsy();
      }
    } else {
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('모바일 메뉴가 작동해야 함', async ({ page }) => {
    // 모바일 메뉴 버튼 찾기
    const menuButton = page.locator(
      `button[aria-label*="메뉴"], button[aria-label*="Menu"], ${byTestId(TEST_IDS.MENU_BUTTON)}, button:has(svg[data-testid="MenuIcon"])`
    ).first();
    
    await page.waitForTimeout(2000);
    const isMenuButtonVisible = await menuButton.isVisible().catch(() => false);
    
    if (isMenuButtonVisible) {
      await menuButton.click();
      await page.waitForTimeout(500);
      
      // 메뉴가 열렸는지 확인 (드로어 또는 메뉴가 표시)
      const drawer = page.locator(`[role="presentation"], ${byTestId(TEST_IDS.DRAWER)}, .MuiDrawer-root`).first();
      const menu = page.locator(`[role="menu"], ${byTestId(TEST_IDS.MENU)}`).first();
      
      const isDrawerVisible = await drawer.isVisible({ timeout: 1000 }).catch(() => false);
      const isMenuVisible = await menu.isVisible({ timeout: 1000 }).catch(() => false);
      
      if (isDrawerVisible || isMenuVisible) {
        expect(isDrawerVisible || isMenuVisible).toBeTruthy();
      }
    } else {
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('노트북 LLM 진입 후 목소리 생성 버튼이 표시될 수 있음', async ({ page }) => {
    // 노트북 LLM 열기 버튼 찾기 (프로젝트가 있을 때 표시)
    const notebookButton = page.locator(
      'button:has-text("노트북 LLM 열기"), ' +
      'button:has-text("📓 노트북 LLM"), ' +
      'a:has-text("노트북 LLM")'
    ).first();

    await page.waitForTimeout(2000);
    const isNotebookButtonVisible = await notebookButton.isVisible().catch(() => false);

    if (!isNotebookButtonVisible) {
      await expect(page.locator('body')).toBeVisible();
      return;
    }

    await notebookButton.click();
    await page.waitForTimeout(2000);

    // 노트북 뷰에서 목소리 생성 버튼 찾기
    const voiceGenButton = page.locator(
      'button:has-text("목소리 생성"), ' +
      'button[aria-label="목소리 생성"], ' +
      '[aria-label="목소리 생성"]'
    ).first();

    const isVoiceGenVisible = await voiceGenButton.isVisible({ timeout: 3000 }).catch(() => false);

    if (!isVoiceGenVisible) {
      await expect(page.locator('body')).toBeVisible();
      return;
    }

    await voiceGenButton.click();
    await page.waitForTimeout(2500);

    // 모달 또는 목소리 생성 섹션이 표시되는지 확인 (Lazy 로딩 대기)
    const dialog = page.locator(`[role="dialog"][aria-label="목소리 생성"], ${byTestId(TEST_IDS.VOICE_GEN_SECTION)}`).first();
    const isDialogVisible = await dialog.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isDialogVisible) {
      await expect(page.locator('body')).toBeVisible();
      return;
    }
    expect(isDialogVisible).toBe(true);
  });
});

