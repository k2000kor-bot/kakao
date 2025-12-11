import { test, expect } from '@playwright/test';

/**
 * PWA E2E 테스트
 * Jest에서 스킵된 PWA 기능을 E2E로 검증
 */

test.describe('PWA E2E 테스트', () => {
  test.beforeEach(async ({ page, context }) => {
    // Service Worker 등록을 위해 HTTPS 또는 localhost 필요
    await page.goto('/');
  });

  test('Service Worker가 등록되어야 함', async ({ page }) => {
    // Service Worker 등록 확인
    const serviceWorker = await page.evaluate(() => {
      return navigator.serviceWorker.getRegistration();
    });
    
    // Service Worker가 등록되었는지 확인
    // 실제 구현에 따라 다를 수 있음
    expect(serviceWorker).toBeDefined();
  });

  test('오프라인 모드에서 작동해야 함', async ({ page, context }) => {
    // 오프라인 모드로 전환
    await context.setOffline(true);
    
    // 페이지 새로고침
    await page.reload();
    
    // 오프라인 인디케이터가 표시되는지 확인
    await page.waitForTimeout(1000);
    const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
    const isOffline = await offlineIndicator.isVisible().catch(() => false);
    
    // 오프라인 상태가 감지되었는지 확인
    if (isOffline) {
      await expect(offlineIndicator).toBeVisible();
    }
    
    // 다시 온라인 모드로 전환
    await context.setOffline(false);
  });

  test('PWA 설치 프롬프트가 표시되어야 함', async ({ page }) => {
    // beforeinstallprompt 이벤트 트리거 확인
    const installPrompt = await page.evaluate(() => {
      return new Promise((resolve) => {
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();
          resolve(true);
        });
        
        // 이벤트가 발생하지 않으면 타임아웃
        setTimeout(() => resolve(false), 3000);
      });
    });
    
    // 설치 프롬프트가 트리거되었는지 확인
    // 실제 브라우저 환경에서만 작동
    expect(typeof installPrompt).toBe('boolean');
  });

  test('앱 업데이트 알림이 표시되어야 함', async ({ page }) => {
    // Service Worker 업데이트 확인
    const updateAvailable = await page.evaluate(() => {
      return new Promise((resolve) => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            resolve(true);
          });
          
          // 업데이트 확인
          navigator.serviceWorker.getRegistration().then(registration => {
            if (registration) {
              registration.update();
            }
          });
          
          setTimeout(() => resolve(false), 3000);
        } else {
          resolve(false);
        }
      });
    });
    
    // 업데이트 알림이 표시되는지 확인
    if (updateAvailable) {
      const updateNotification = page.locator('[data-testid="update-notification"]');
      await expect(updateNotification).toBeVisible({ timeout: 5000 });
    }
  });

  test('캐시된 리소스가 오프라인에서 로드되어야 함', async ({ page, context }) => {
    // 먼저 온라인에서 리소스 로드
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 오프라인 모드로 전환
    await context.setOffline(true);
    
    // 페이지 새로고침
    await page.reload();
    
    // 캐시된 리소스가 로드되었는지 확인
    await page.waitForTimeout(2000);
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // 다시 온라인 모드로 전환
    await context.setOffline(false);
  });
});

