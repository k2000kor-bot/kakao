import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 테스트 설정
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* 테스트 실행 최대 시간 */
  timeout: 30 * 1000,
  expect: {
    /* Assertion 타임아웃 */
    timeout: 5000
  },
  /* 테스트를 병렬로 실행 */
  fullyParallel: true,
  /* CI에서 실패 시 재시도 */
  retries: process.env.CI ? 2 : 0,
  /* CI에서 병렬 실행 수 */
  workers: process.env.CI ? 1 : undefined,
  /* 리포트 설정 */
  reporter: 'html',
  /* 공유 설정 */
  use: {
    /* 기본 URL */
    baseURL: 'http://localhost:3000',
    /* 액션 타임아웃 */
    actionTimeout: 0,
    /* 스크린샷 촬영 */
    screenshot: 'only-on-failure',
    /* 비디오 녹화 */
    video: 'retain-on-failure',
    /* 트레이스 수집 */
    trace: 'on-first-retry',
  },

  /* 테스트 프로젝트 설정 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* 개발 서버 실행 (E2E_SERVER_READY=1 이면 스킵 — 수동 npm start 후 실행)
   * E2E_USE_BUILD=1 이면 build 폴더를 serve (빠른 시작, npm run build 선행 필요) */
  ...(process.env.E2E_SERVER_READY
    ? {}
    : {
        webServer: {
          command: process.env.E2E_USE_BUILD
            ? 'npx serve -s build -l 3000'
            : 'npm start',
          url: 'http://localhost:3000',
          reuseExistingServer: !process.env.CI,
          timeout: process.env.E2E_USE_BUILD ? 30 * 1000 : 600 * 1000,
        },
      }),
});

