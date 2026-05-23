/**
 * `react-router` 로드 전에 `globalThis.TextEncoder`를 채웁니다(단일 테스트 파일 실행 시).
 * `__tests__` 폴더에 두면 CRA Jest가 스위트로 집어 넣으므로 이 디렉터리에 둡니다.
 */
import { TextDecoder, TextEncoder } from 'util';

if (typeof globalThis.TextEncoder === 'undefined') {
  (globalThis as unknown as { TextEncoder: typeof TextEncoder }).TextEncoder = TextEncoder;
  (globalThis as unknown as { TextDecoder: typeof TextDecoder }).TextDecoder = TextDecoder;
}
if (typeof global !== 'undefined' && typeof global.TextEncoder === 'undefined') {
  (global as unknown as { TextEncoder: typeof TextEncoder }).TextEncoder = TextEncoder;
  (global as unknown as { TextDecoder: typeof TextDecoder }).TextDecoder = TextDecoder;
}
