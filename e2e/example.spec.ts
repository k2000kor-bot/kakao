import { test, expect } from '@playwright/test';

/**
 * 기본 E2E 테스트 예제
 * 앱의 기본 기능이 정상 작동하는지 확인
 */

test.describe('기본 앱 기능', () => {
  test('앱이 정상적으로 로드되어야 함', async ({ page }) => {
    await page.goto('/');
    
    // 페이지가 로드되었는지 확인
    await expect(page).toHaveTitle(/CORBU AI|React App/);
  });

  test('기본 UI 요소가 렌더링되어야 함', async ({ page }) => {
    await page.goto('/');
    
    // 기본 요소들이 존재하는지 확인
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

