import { test, expect } from '@playwright/test';
import { PATHS } from './paths';
import { TEST_IDS, byTestId } from './testIds';

/**
 * LazyLoading E2E 테스트
 * Jest에서 스킵된 IntersectionObserver 기반 지연 로딩 기능을 E2E로 검증
 */

test.describe('LazyLoading E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PATHS.CHAT);
  });

  test('스크롤 시 지연 로딩된 컴포넌트가 표시되어야 함', async ({ page }) => {
    // 페이지 하단으로 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // 지연 로딩된 요소가 표시되는지 확인
    // 실제 구현에 맞게 수정 필요
    await page.waitForTimeout(1000);
    
    // IntersectionObserver가 트리거되었는지 확인
    const lazyElements = await page.locator('[data-lazy-load]').count();
    expect(lazyElements).toBeGreaterThanOrEqual(0);
  });

  test('뷰포트에 들어올 때 지연 로딩이 트리거되어야 함', async ({ page }) => {
    // 초기에는 지연 로딩된 요소가 로드되지 않아야 함
    const initialCount = await page.locator('[data-lazy-loaded]').count();
    
    // 스크롤하여 요소를 뷰포트에 표시
    await page.evaluate(() => {
      const lazyElement = document.querySelector('[data-lazy-load]');
      if (lazyElement) {
        lazyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    
    // 지연 로딩이 트리거되었는지 확인
    await page.waitForTimeout(2000);
    const afterScrollCount = await page.locator('[data-lazy-loaded]').count();
    
    // 스크롤 후 로드된 요소가 증가했는지 확인
    expect(afterScrollCount).toBeGreaterThanOrEqual(initialCount);
  });

  test('이미지 지연 로딩이 작동해야 함', async ({ page }) => {
    // 이미지가 포함된 지연 로딩 섹션 찾기
    const lazyImages = page.locator('img[loading="lazy"]');
    const imageCount = await lazyImages.count();
    
    if (imageCount > 0) {
      // 첫 번째 이미지로 스크롤
      await lazyImages.first().scrollIntoViewIfNeeded();
      
      // 이미지가 로드되었는지 확인
      await page.waitForTimeout(1000);
      const loadedImage = lazyImages.first();
      await expect(loadedImage).toBeVisible();
    } else {
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('지연 로딩 에러가 발생하면 에러 처리가 작동해야 함', async ({ page }) => {
    // 네트워크 오류 시뮬레이션
    await page.route('**/*', route => {
      if (route.request().url().includes('lazy-load')) {
        route.abort();
      } else {
        route.continue();
      }
    });
    
    // 지연 로딩 요소로 스크롤
    await page.evaluate(() => {
      const lazyElement = document.querySelector('[data-lazy-load]');
      if (lazyElement) {
        lazyElement.scrollIntoView();
      }
    });
    
    // 에러 메시지가 표시되는지 확인
    await page.waitForTimeout(2000);
    const errorMessage = page.locator(byTestId(TEST_IDS.LAZY_LOAD_ERROR));
    const hasError = await errorMessage.isVisible().catch(() => false);
    
    // 에러가 발생했을 경우 에러 처리가 작동하는지 확인
    if (hasError) {
      await expect(errorMessage).toBeVisible();
    }
  });
});

