import type { Locator, Page } from '@playwright/test';

/** 여러 셀렉터 중 첫 번째로 보이는 locator (없으면 null) */
export async function pickVisibleLocator(page: Page, selectors: string[]): Promise<Locator | null> {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if (await locator.isVisible().catch(() => false)) {
      return locator;
    }
  }
  return null;
}

/** CRA/webpack dev 오버레이가 떠 있는지 */
export async function hasWebpackErrorOverlay(page: Page): Promise<boolean> {
  return (await page.locator('#webpack-dev-server-client-overlay').count()) > 0;
}

/** dev 서버 컴파일 오버레이가 클릭을 가로막지 않도록 제거 */
export async function dismissWebpackDevOverlay(page: Page): Promise<void> {
  await page.evaluate(() => {
    document.getElementById('webpack-dev-server-client-overlay')?.remove();
    document.querySelector('iframe#webpack-dev-server-client-overlay')?.remove();
  });
}

/** 온보딩 투어 오버레이 — E2E 클릭 가로막음 방지 */
export async function dismissOnboardingOverlay(page: Page): Promise<void> {
  await page.evaluate(() => {
    try {
      localStorage.setItem('corbu.onboarding.done', '1');
    } catch {
      /* ignore */
    }
    document.querySelector('.onboarding-overlay')?.remove();
  });
  const skip = page.getByRole('button', { name: /건너뛰|Skip|닫기|완료/i }).first();
  if (await skip.isVisible().catch(() => false)) {
    await skip.click({ force: true }).catch(() => undefined);
  }
}

/** E2E 초기 localStorage — 온보딩 완료 */
export async function seedOnboardingDone(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('corbu.onboarding.done', '1');
    } catch {
      /* ignore */
    }
  });
}

/**
 * 셀렉터 목록을 순서대로 `waitFor({ state: 'visible' })` — 첫 성공 시 해당 locator 반환.
 * (`pickVisibleLocator`는 즉시 isVisible만 보므로, 늦게 나타나는 UI에는 이쪽 사용)
 */
export async function waitForFirstVisibleLocator(
  page: Page,
  selectors: string[],
  timeout = 10_000
): Promise<Locator | null> {
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
