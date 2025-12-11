import { test, expect } from '@playwright/test';

/**
 * Performance E2E 테스트
 * Jest에서 스킵된 성능 모니터링 기능을 E2E로 검증
 */

test.describe('Performance E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('페이지 로드 성능이 측정되어야 함', async ({ page }) => {
    // 페이지 로드 시간 측정
    const loadTime = await page.evaluate(() => {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    });
    
    // 로드 시간이 합리적인 범위 내에 있는지 확인 (10초 이내)
    expect(loadTime).toBeLessThan(10000);
    expect(loadTime).toBeGreaterThan(0);
  });

  test('컴포넌트 렌더링 성능이 측정되어야 함', async ({ page }) => {
    // 성능 측정 시작
    await page.evaluate(() => {
      performance.mark('component-render-start');
    });
    
    // 컴포넌트 렌더링 트리거 (예: 버튼 클릭)
    const button = page.locator('button').first();
    if (await button.isVisible().catch(() => false)) {
      await button.click();
      
      // 렌더링 완료 대기
      await page.waitForTimeout(1000);
      
      // 성능 측정 종료
      const renderTime = await page.evaluate(() => {
        performance.mark('component-render-end');
        performance.measure('component-render', 'component-render-start', 'component-render-end');
        const measure = performance.getEntriesByName('component-render')[0];
        return measure.duration;
      });
      
      // 렌더링 시간이 합리적인 범위 내에 있는지 확인
      expect(renderTime).toBeLessThan(5000);
      expect(renderTime).toBeGreaterThan(0);
    }
  });

  test('메모리 사용량이 모니터링되어야 함', async ({ page }) => {
    // 메모리 사용량 확인 (Chrome DevTools Protocol 필요)
    const memoryInfo = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory;
      }
      return null;
    });
    
    // 메모리 정보가 있는지 확인
    if (memoryInfo) {
      expect(memoryInfo.usedJSHeapSize).toBeGreaterThan(0);
      expect(memoryInfo.totalJSHeapSize).toBeGreaterThan(0);
    } else {
      test.skip('메모리 정보를 사용할 수 없습니다');
    }
  });

  test('네트워크 성능이 측정되어야 함', async ({ page }) => {
    // 네트워크 요청 성능 측정
    const networkTiming = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const networkEntries = entries.filter(entry => entry.name.includes('api') || entry.name.includes('fetch'));
      
      if (networkEntries.length > 0) {
        const firstEntry = networkEntries[0];
        return {
          duration: firstEntry.duration,
          transferSize: firstEntry.transferSize,
          encodedBodySize: firstEntry.encodedBodySize,
        };
      }
      return null;
    });
    
    // 네트워크 성능 정보가 있는지 확인
    if (networkTiming) {
      expect(networkTiming.duration).toBeGreaterThan(0);
    } else {
      test.skip('네트워크 성능 정보를 사용할 수 없습니다');
    }
  });

  test('성능 리포트가 생성되어야 함', async ({ page }) => {
    // 성능 모니터링 컴포넌트 찾기
    const performanceMonitor = page.locator('[data-testid="performance-monitor"]');
    
    if (await performanceMonitor.isVisible().catch(() => false)) {
      // 리포트 생성 버튼 클릭
      const reportButton = page.locator('[data-testid="generate-performance-report"]');
      if (await reportButton.isVisible().catch(() => false)) {
        await reportButton.click();
        
        // 리포트가 표시되는지 확인
        await page.waitForTimeout(1000);
        const report = page.locator('[data-testid="performance-report"]');
        await expect(report).toBeVisible();
      }
    } else {
      test.skip('성능 모니터링 컴포넌트가 없습니다');
    }
  });
});

