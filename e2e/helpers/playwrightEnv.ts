/**
 * Playwright E2E 공통: 베이스 URL·서버 도달 가능 여부
 * (`E2E_SKIP_REACHABILITY_CHECK=1` / `E2E_SERVER_READY=1` 이면 fetch 생략)
 */
export const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

const SKIP_REACHABILITY = process.env.E2E_SKIP_REACHABILITY_CHECK === '1';
const SERVER_READY = process.env.E2E_SERVER_READY === '1';

export async function isServerReachable(): Promise<boolean> {
  if (SKIP_REACHABILITY || SERVER_READY) return true;
  try {
    const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(5_000) });
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

/** `test.skip(true, …)` 용 — `E2E_SERVER_READY=1` 안내 포함 (chat·projectManagement 등) */
export function devServerUnreachableSkipMessage(): string {
  return `Dev server not reachable at ${BASE_URL}. Run "npm start" then "E2E_SERVER_READY=1 npm run test:e2e:no-server".`;
}

/** `test.skip(true, …)` 용 — 짧은 안내 (example.spec 등) */
export function devServerUnreachableSkipMessageShort(): string {
  return `Dev server not reachable at ${BASE_URL}. Run "npm start" then "npm run test:e2e:no-server".`;
}

/** Playwright `test.skip` 시그니처에 맞춘 최소 타입 */
export type E2ETestSkip = { skip: (condition: boolean, description?: string) => void };

/**
 * 서버에 닿을 수 있으면 true.
 * 없으면 `test.skip(true, message)` 호출 후 false — 호출부에서 `if (!(await …)) return;` 패턴.
 */
export async function skipUnlessE2EServerReachable(
  testApi: E2ETestSkip,
  message: string = devServerUnreachableSkipMessage()
): Promise<boolean> {
  if (await isServerReachable()) return true;
  testApi.skip(true, message);
  return false;
}

export async function skipUnlessE2EServerReachableShort(testApi: E2ETestSkip): Promise<boolean> {
  return skipUnlessE2EServerReachable(testApi, devServerUnreachableSkipMessageShort());
}

/** 한국어 스킵 메시지 (genspark POST 검증 등) */
export function e2eSkipMessageCannotConnectKo(): string {
  return `서버에 연결할 수 없습니다: ${BASE_URL}`;
}
