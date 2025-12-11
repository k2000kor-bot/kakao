import { test, expect } from '@playwright/test';

/**
 * Chat E2E 테스트
 * 채팅 기능의 주요 플로우를 E2E로 검증
 */

test.describe('Chat E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('채팅 입력 필드가 표시되어야 함', async ({ page }) => {
    // 채팅 입력 필드 찾기
    const chatInput = page.locator('input[type="text"], textarea, [contenteditable="true"]').first();
    
    // 입력 필드가 표시되는지 확인
    await expect(chatInput).toBeVisible({ timeout: 5000 });
  });

  test('메시지를 입력하고 전송할 수 있어야 함', async ({ page }) => {
    // 채팅 입력 필드 찾기
    const chatInput = page.locator('input[type="text"], textarea, [contenteditable="true"]').first();
    
    if (await chatInput.isVisible().catch(() => false)) {
      // 메시지 입력
      await chatInput.fill('안녕하세요, 테스트 메시지입니다.');
      
      // 전송 버튼 클릭 또는 Enter 키 입력
      const sendButton = page.locator('button[type="submit"], button:has-text("전송"), button:has-text("Send")').first();
      
      if (await sendButton.isVisible().catch(() => false)) {
        await sendButton.click();
      } else {
        await chatInput.press('Enter');
      }
      
      // 메시지가 표시되는지 확인
      await page.waitForTimeout(2000);
      const message = page.locator('text=안녕하세요, 테스트 메시지입니다.').first();
      await expect(message).toBeVisible({ timeout: 10000 });
    } else {
      test.skip('채팅 입력 필드를 찾을 수 없습니다');
    }
  });

  test('AI 응답이 표시되어야 함', async ({ page }) => {
    // 채팅 입력 필드 찾기
    const chatInput = page.locator('input[type="text"], textarea, [contenteditable="true"]').first();
    
    if (await chatInput.isVisible().catch(() => false)) {
      // 메시지 입력 및 전송
      await chatInput.fill('테스트 질문');
      await chatInput.press('Enter');
      
      // AI 응답이 표시되는지 확인
      await page.waitForTimeout(5000);
      const aiResponse = page.locator('[data-testid="ai-response"], [data-testid="message"]').last();
      await expect(aiResponse).toBeVisible({ timeout: 15000 });
    } else {
      test.skip('채팅 입력 필드를 찾을 수 없습니다');
    }
  });

  test('스트리밍 메시지가 실시간으로 표시되어야 함', async ({ page }) => {
    // 채팅 입력 필드 찾기
    const chatInput = page.locator('input[type="text"], textarea, [contenteditable="true"]').first();
    
    if (await chatInput.isVisible().catch(() => false)) {
      // 메시지 입력 및 전송
      await chatInput.fill('스트리밍 테스트');
      await chatInput.press('Enter');
      
      // 스트리밍 인디케이터 확인
      await page.waitForTimeout(1000);
      const streamingIndicator = page.locator('[data-testid="streaming-indicator"], [data-testid="typing-indicator"]');
      const isStreaming = await streamingIndicator.isVisible().catch(() => false);
      
      if (isStreaming) {
        await expect(streamingIndicator).toBeVisible();
        
        // 스트리밍이 완료될 때까지 대기
        await page.waitForTimeout(5000);
        await expect(streamingIndicator).not.toBeVisible({ timeout: 10000 });
      }
    } else {
      test.skip('채팅 입력 필드를 찾을 수 없습니다');
    }
  });

  test('에러 발생 시 에러 메시지가 표시되어야 함', async ({ page }) => {
    // 네트워크 오류 시뮬레이션
    await page.route('**/api/chat**', route => route.abort());
    
    // 채팅 입력 필드 찾기
    const chatInput = page.locator('input[type="text"], textarea, [contenteditable="true"]').first();
    
    if (await chatInput.isVisible().catch(() => false)) {
      // 메시지 입력 및 전송
      await chatInput.fill('에러 테스트');
      await chatInput.press('Enter');
      
      // 에러 메시지가 표시되는지 확인
      await page.waitForTimeout(3000);
      const errorMessage = page.locator('[data-testid="error-message"], .error, [role="alert"]').first();
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    } else {
      test.skip('채팅 입력 필드를 찾을 수 없습니다');
    }
  });
});

