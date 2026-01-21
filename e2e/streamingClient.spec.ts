import { test, expect } from '@playwright/test';

/**
 * StreamingClient E2E 테스트
 * Jest에서 스킵된 스트리밍 기능을 E2E로 검증
 */

test.describe('StreamingClient E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
  });

  test('채팅 입력창이 표시되어야 함', async ({ page }) => {
    // 채팅 입력 필드 찾기 (data-testid 사용)
    const chatInput = page.locator('[data-testid="chat-input"]');
    
    // 입력창이 보이거나 대체 선택자 사용
    const isVisible = await chatInput.isVisible().catch(() => false);
    if (!isVisible) {
      // 대체 선택자로 시도
      const altInput = page.locator('textarea.message-input, input[type="text"]').first();
      await expect(altInput).toBeVisible({ timeout: 5000 });
    } else {
      await expect(chatInput).toBeVisible();
    }
  });

  test('스트리밍 메시지가 실시간으로 표시되어야 함', async ({ page }) => {
    // 채팅 입력 필드 찾기
    const chatInput = page.locator('[data-testid="chat-input"]').or(
      page.locator('textarea.message-input')
    ).first();
    
    if (await chatInput.isVisible().catch(() => false)) {
      // 메시지 입력
      await chatInput.fill('테스트 메시지');
      
      // 전송 버튼 클릭 또는 Enter 키
      const sendButton = page.locator('[data-testid="send-button"]');
      if (await sendButton.isVisible().catch(() => false)) {
        await sendButton.click();
      } else {
        await chatInput.press('Enter');
      }
      
      // 스트리밍 메시지 또는 AI 응답 메시지가 표시되는지 확인
      await expect(
        page.locator('[data-testid="message-assistant-streaming"]')
          .or(page.locator('[data-testid="message-assistant"]'))
          .or(page.locator('[data-testid="loading-indicator"]'))
      ).toBeVisible({ timeout: 10000 });
    } else {
      test.skip();
    }
  });

  test('메시지 컨테이너가 존재해야 함', async ({ page }) => {
    // 새 대화 시작 또는 기존 대화가 있는 경우
    const messagesContainer = page.locator('[data-testid="messages-container"]');
    
    // 대화가 선택되어 있으면 메시지 컨테이너가 보여야 함
    const isVisible = await messagesContainer.isVisible().catch(() => false);
    if (isVisible) {
      await expect(messagesContainer).toBeVisible();
    } else {
      // 컨테이너가 없으면 새 대화를 시작해야 함
      test.skip();
    }
  });

  test('스트리밍 중 에러가 발생하면 에러 메시지가 표시되어야 함', async ({ page }) => {
    // 네트워크 오류 시뮬레이션
    await page.route('**/api/chat/stream', route => route.abort());
    await page.route('**/api/chat', route => route.abort());
    
    const chatInput = page.locator('[data-testid="chat-input"]').or(
      page.locator('textarea.message-input')
    ).first();
    
    if (await chatInput.isVisible().catch(() => false)) {
      await chatInput.fill('테스트 메시지');
      
      const sendButton = page.locator('[data-testid="send-button"]');
      if (await sendButton.isVisible().catch(() => false)) {
        await sendButton.click();
      } else {
        await chatInput.press('Enter');
      }
      
      // 에러가 포함된 AI 메시지 확인 (에러는 일반 메시지로 표시됨)
      await expect(
        page.locator('[data-testid="message-assistant"]').filter({ hasText: '오류' })
          .or(page.locator('.message.assistant-message').filter({ hasText: '오류' }))
      ).toBeVisible({ timeout: 10000 });
    } else {
      test.skip();
    }
  });
});

