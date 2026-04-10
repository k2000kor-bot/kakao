// Jest + Babel 소스맵이 일부 프레임에서 깨질 때 source-map-support 가 TypeError(generatedLine)를
// 내며 스위트 로드가 실패할 수 있음(예: SecurityEnhancementService). unregister + 단순 prepareStackTrace.
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
try {
  require('source-map-support').unregister();
} catch {
  /* no-op */
}

type StackFrame = { toString(): string };
Error.prepareStackTrace = (_err: Error, stack: StackFrame[]) =>
  stack.map((frame) => frame.toString()).join('\n');

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { setupCommonMocks } from './test-utils/testHelpers';

// react-markdown 등 ESM 전용 패키지는 Jest 기본 변환에서 실패하므로 스텁 (루트 src/setupTests와 동일)
jest.mock('react-markdown', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  const React = require('react');
  function ReactMarkdown({ children }: { children?: React.ReactNode }) {
    return React.createElement(React.Fragment, null, children);
  }
  return { __esModule: true, default: ReactMarkdown };
});
jest.mock('remark-gfm', () => ({
  __esModule: true,
  default: () => undefined,
}));

// react-router v7 등에서 사용하는 TextEncoder/TextDecoder (Jest/jsdom 환경)
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder: TE, TextDecoder: TD } = require('util');
  (global as unknown as { TextEncoder: typeof TE }).TextEncoder = TE;
  (global as unknown as { TextDecoder: typeof TD }).TextDecoder = TD;
}

/** Node·Jest `testEnvironment: node` 등에서 `globalThis.File`만 있고 `global.File`·자유 식별자 `File`이 안 잡히는 경우 보강 */
if (typeof globalThis.File !== 'function') {
  (globalThis as unknown as { File: new (bits: BlobPart[], name: string, options?: FilePropertyBag) => File }).File =
    class MockFile {
      readonly name: string;
      readonly type: string;
      readonly lastModified: number;
      constructor(bits: BlobPart[], filename: string, options?: FilePropertyBag) {
        this.name = filename;
        this.type = options?.type ?? '';
        this.lastModified = options?.lastModified ?? Date.now();
        void bits;
      }
    } as unknown as typeof File;
}
if (typeof global !== 'undefined' && typeof globalThis.File === 'function') {
  (global as unknown as { File: typeof File }).File = globalThis.File;
}

/** 일부 Jest/jsdom 조합에서 `FormData`가 없어 업로드 서비스 테스트가 실패함 — `append`만 제공해도 충분 */
if (typeof globalThis.FormData === 'undefined') {
  (globalThis as unknown as { FormData: new () => FormData }).FormData = class MockFormData {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly entries: [string, any][] = [];
    append(name: string, value: unknown): void {
      this.entries.push([name, value]);
    }
  } as unknown as typeof FormData;
}

// Jest·구형 jsdom에서 `global.fetch`가 없을 때 LLM 상태·프로젝트 로드 등이 즉시 실패함
if (typeof globalThis.fetch !== 'function') {
  globalThis.fetch = jest.fn(() =>
    Promise.resolve({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
    } as Response)
  ) as typeof fetch;
}

// 공통 모킹 설정
setupCommonMocks();
