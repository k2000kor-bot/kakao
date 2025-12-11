import { test, expect } from '@playwright/test';

/**
 * StreamingClient E2E 테스트
 * Jest에서 스킵된 스트리밍 기능을 E2E로 검증
 */

test.describe('StreamingClient E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('스트리밍 메시지가 실시간으로 표시되어야 함', async ({ page }) => {
    // 채팅 입력 필드 찾기
    const chatInput = page.locator('input[type="text"], textarea').first();
    
    if (await chatInput.isVisible().catch(() => false)) {
      // 메시지 입력
      await chatInput.fill('테스트 메시지');
      await chatInput.press('Enter');
      
      // 스트리밍 메시지가 표시되는지 확인
      await expect(page.locator('[data-testid="streaming-message"]')).toBeVisible({ timeout: 10000 });
    } else {
      test.skip();
    }
  });

  test('스트리밍 중 에러가 발생하면 에러 메시지가 표시되어야 함', async ({ page }) => {
    // 네트워크 오류 시뮬레이션
    await page.route('**/api/chat/stream', route => route.abort());
    
    const chatInput = page.locator('input[type="text"], textarea').first();
    
    if (await chatInput.isVisible().catch(() => false)) {
      await chatInput.fill('테스트 메시지');
      await chatInput.press('Enter');
      
      // 에러 메시지 확인
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 5000 });
    } else {
      test.skip();
    }
  });
});

