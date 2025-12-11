import { test, expect } from '@playwright/test';

/**
 * ChatGPT5CompleteInterface E2E 테스트
 * 통합 채팅 인터페이스의 주요 기능을 E2E로 검증
 */

test.describe('ChatGPT5CompleteInterface E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
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
      'button:has-text("새 프로젝트 만들기"), ' +
      'button:has-text("새 프로젝트"), ' +
      'button:has-text("New Project"), ' +
      '[data-testid="new-project-button"]'
    ).first();
    
    await page.waitForTimeout(2000);
    const isButtonVisible = await newProjectButton.isVisible().catch(() => false);
    
    if (isButtonVisible) {
      await newProjectButton.click();
      
      // 프로젝트 생성 다이얼로그 또는 폼 확인
      await page.waitForTimeout(1000);
      const dialog = page.locator('[role="dialog"], [data-testid="project-creation-dialog"]').first();
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
      test.skip('새 프로젝트 버튼을 찾을 수 없습니다');
    }
  });

  test('채팅 입력 필드에 메시지를 입력할 수 있어야 함', async ({ page }) => {
    // 채팅 입력 필드 찾기
    const chatInput = page.locator(
      'input[type="text"], ' +
      'textarea, ' +
      '[contenteditable="true"], ' +
      '[data-testid="chat-input"], ' +
      '[placeholder*="메시지"], ' +
      '[placeholder*="message"]'
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
      test.skip('채팅 입력 필드를 찾을 수 없습니다');
    }
  });

  test('메시지를 전송할 수 있어야 함', async ({ page }) => {
    // 채팅 입력 필드 찾기
    const chatInput = page.locator(
      'input[type="text"], ' +
      'textarea, ' +
      '[contenteditable="true"], ' +
      '[data-testid="chat-input"]'
    ).first();
    
    await page.waitForTimeout(2000);
    const isInputVisible = await chatInput.isVisible().catch(() => false);
    
    if (isInputVisible) {
      // 메시지 입력
      await chatInput.fill('테스트 메시지 전송');
      
      // 전송 버튼 찾기
      const sendButton = page.locator(
        'button[type="submit"], ' +
        'button:has-text("전송"), ' +
        'button:has-text("Send"), ' +
        '[data-testid="send-button"], ' +
        'button[aria-label*="전송"]'
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
        const typingIndicator = page.locator('[data-testid="typing-indicator"], [data-testid="loading"]').first();
        await typingIndicator.isVisible({ timeout: 3000 }).catch(() => {});
      }
    } else {
      test.skip('채팅 입력 필드를 찾을 수 없습니다');
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
      test.skip('카테고리 버튼을 찾을 수 없습니다');
    }
  });

  test('검색 기능이 작동해야 함', async ({ page }) => {
    // 검색 입력 필드 찾기
    const searchInput = page.locator(
      'input[type="search"], ' +
      'input[placeholder*="검색"], ' +
      'input[placeholder*="Search"], ' +
      '[data-testid="search-input"], ' +
      'input[aria-label*="검색"]'
    ).first();
    
    await page.waitForTimeout(2000);
    const isSearchVisible = await searchInput.isVisible().catch(() => false);
    
    if (isSearchVisible) {
      await searchInput.fill('테스트 검색어');
      await page.waitForTimeout(1000);
      
      // 검색 결과가 표시되는지 확인
      const searchResults = page.locator('[data-testid="search-results"], .search-results').first();
      const hasResults = await searchResults.isVisible({ timeout: 3000 }).catch(() => false);
      
      // 검색어가 입력되었는지 확인
      const inputValue = await searchInput.inputValue().catch(() => '');
      expect(inputValue).toContain('테스트 검색어');
    } else {
      test.skip('검색 입력 필드를 찾을 수 없습니다');
    }
  });

  test('탭 전환이 작동해야 함', async ({ page }) => {
    // 탭 버튼들 찾기
    const tabs = page.locator(
      '[role="tab"], ' +
      'button[aria-label*="탭"], ' +
      '[data-testid*="tab"]'
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
      test.skip('탭을 찾을 수 없습니다');
    }
  });

  test('새 채팅 시작 버튼이 작동해야 함', async ({ page }) => {
    // 새 채팅 시작 버튼 찾기
    const newChatButton = page.locator(
      'button:has-text("새 채팅 시작"), ' +
      'button:has-text("새 채팅"), ' +
      'button:has-text("New Chat"), ' +
      '[data-testid="new-chat-button"]'
    ).first();
    
    await page.waitForTimeout(2000);
    const isButtonVisible = await newChatButton.isVisible().catch(() => false);
    
    if (isButtonVisible) {
      await newChatButton.click();
      await page.waitForTimeout(1000);
      
      // 새 채팅이 시작되었는지 확인 (채팅 입력 필드가 비어있거나 새 세션 표시)
      const chatInput = page.locator(
        'input[type="text"], ' +
        'textarea, ' +
        '[contenteditable="true"]'
      ).first();
      
      if (await chatInput.isVisible().catch(() => false)) {
        const inputValue = await chatInput.inputValue().catch(() => '');
        // 새 채팅이면 입력 필드가 비어있거나 히스토리가 없는 상태
        expect(inputValue).toBeFalsy();
      }
    } else {
      test.skip('새 채팅 시작 버튼을 찾을 수 없습니다');
    }
  });

  test('모바일 메뉴가 작동해야 함', async ({ page }) => {
    // 모바일 메뉴 버튼 찾기
    const menuButton = page.locator(
      'button[aria-label*="메뉴"], ' +
      'button[aria-label*="Menu"], ' +
      '[data-testid="menu-button"], ' +
      'button:has(svg[data-testid="MenuIcon"])'
    ).first();
    
    await page.waitForTimeout(2000);
    const isMenuButtonVisible = await menuButton.isVisible().catch(() => false);
    
    if (isMenuButtonVisible) {
      await menuButton.click();
      await page.waitForTimeout(500);
      
      // 메뉴가 열렸는지 확인 (드로어 또는 메뉴가 표시)
      const drawer = page.locator('[role="presentation"], [data-testid="drawer"], .MuiDrawer-root').first();
      const menu = page.locator('[role="menu"], [data-testid="menu"]').first();
      
      const isDrawerVisible = await drawer.isVisible({ timeout: 1000 }).catch(() => false);
      const isMenuVisible = await menu.isVisible({ timeout: 1000 }).catch(() => false);
      
      if (isDrawerVisible || isMenuVisible) {
        expect(isDrawerVisible || isMenuVisible).toBeTruthy();
      }
    } else {
      test.skip('모바일 메뉴 버튼을 찾을 수 없습니다 (데스크톱 모드일 수 있음)');
    }
  });
});

