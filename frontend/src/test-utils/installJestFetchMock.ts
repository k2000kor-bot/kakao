/**
 * jsdom 등에서 `globalThis.fetch`만 바꾸면 `fetch()` 호출이 여전히 `window.fetch`(네이티브)를 쓸 수 있음.
 * 단일 jest.fn()을 globalThis·window에 동기화한다.
 */
export function installJestFetchMock(): jest.MockedFunction<typeof fetch> {
  const mock = jest.fn() as jest.MockedFunction<typeof fetch>;
  globalThis.fetch = mock as unknown as typeof fetch;
  if (typeof window !== 'undefined') {
    window.fetch = globalThis.fetch;
  }
  return mock;
}

/** `installJestFetchMock` 전에 저장해 둔 `fetch`로 globalThis·window를 되돌린다. */
export function restoreGlobalFetch(previous: typeof fetch): void {
  globalThis.fetch = previous;
  if (typeof window !== 'undefined') {
    window.fetch = previous;
  }
}
