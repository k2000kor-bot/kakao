/**
 * E2E data-testid 상수
 * 단일 소스: src/constants/testIds.ts
 * e2e/README.md "주요 data-testid 참조"와 동기화.
 */
import { TEST_IDS as _TEST_IDS } from '../src/constants/testIds';

export { _TEST_IDS as TEST_IDS };

/** [data-testid="value"] 셀렉터 반환 */
export function byTestId(id: string): string {
  return `[data-testid="${id}"]`;
}

/** [data-testid^="prefix"] 셀렉터 반환 (접두어 매칭) */
export function byTestIdPrefix(prefix: string): string {
  return `[data-testid^="${prefix}"]`;
}
