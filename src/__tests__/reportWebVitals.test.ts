/**
 * reportWebVitals 테스트
 */

export {};

const mockGetCLS = jest.fn();
const mockGetFID = jest.fn();
const mockGetFCP = jest.fn();
const mockGetLCP = jest.fn();
const mockGetTTFB = jest.fn();

jest.mock('web-vitals', () => ({
  getCLS: (...args: unknown[]) => mockGetCLS(...args),
  getFID: (...args: unknown[]) => mockGetFID(...args),
  getFCP: (...args: unknown[]) => mockGetFCP(...args),
  getLCP: (...args: unknown[]) => mockGetLCP(...args),
  getTTFB: (...args: unknown[]) => mockGetTTFB(...args),
}));

describe('reportWebVitals', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('onPerfEntry가 없으면 web-vitals를 import하지 않음', async () => {
    const reportWebVitals = require('../reportWebVitals').default;
    reportWebVitals(undefined);
    reportWebVitals(null as unknown as (metric: unknown) => void);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockGetCLS).not.toHaveBeenCalled();
  });

  it('onPerfEntry가 함수이면 호출 시 예외 없이 실행', () => {
    const reportWebVitals = require('../reportWebVitals').default;
    const onPerfEntry = jest.fn();
    expect(() => reportWebVitals(onPerfEntry)).not.toThrow();
  });

  it('onPerfEntry가 함수가 아니면 web-vitals 메트릭 미호출', async () => {
    const reportWebVitals = require('../reportWebVitals').default;
    reportWebVitals('not-a-function' as unknown as (metric: unknown) => void);
    await new Promise((r) => setTimeout(r, 0));
    expect(mockGetCLS).not.toHaveBeenCalled();
  });
});
