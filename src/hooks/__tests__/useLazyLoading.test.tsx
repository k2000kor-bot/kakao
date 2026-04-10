/**
 * useLazyLoading 훅 테스트
 * 지연 로딩 기능 확인
 */

import { render, screen, fireEvent, renderHook } from '@testing-library/react';
import { useLazyLoading, UseLazyLoadingOptions } from '../useLazyLoading';

// IntersectionObserver: 클래스 목(`new` 호환). 옵션은 마지막 생성 호출에서 검증
let mockObserve: jest.Mock;
let mockUnobserve: jest.Mock;
let mockDisconnect: jest.Mock;
let lastObserverInit: IntersectionObserverInit | undefined;

beforeAll(() => {
  mockObserve = jest.fn();
  mockUnobserve = jest.fn();
  mockDisconnect = jest.fn();

  class MockIntersectionObserver {
    observe = mockObserve;
    unobserve = mockUnobserve;
    disconnect = mockDisconnect;
    constructor(
      _cb: IntersectionObserverCallback,
      options?: IntersectionObserverInit
    ) {
      lastObserverInit = options;
    }
  }

  globalThis.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver;
});

/** ref가 DOM에 붙어야 useEffect에서 Observer가 생성됨 (renderHook 단독 사용 불가) */
function HookHarness({ options }: { options?: UseLazyLoadingOptions }) {
  const { ref, isLoaded, isIntersecting, load } = useLazyLoading(options);
  return (
    <div>
      <div ref={ref} data-testid="lazy-target" />
      <span
        data-testid="lazy-state"
        data-loaded={isLoaded ? 'true' : 'false'}
        data-intersecting={isIntersecting ? 'true' : 'false'}
      />
      <button type="button" data-testid="lazy-manual-load" onClick={load}>
        load
      </button>
    </div>
  );
}

describe('useLazyLoading', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    lastObserverInit = undefined;
  });

  it('초기 상태를 올바르게 설정해야 함', () => {
    const { result } = renderHook(() => useLazyLoading());

    expect(result.current.isLoaded).toBe(false);
    expect(result.current.isIntersecting).toBe(false);
    expect(result.current.ref).toBeDefined();
    expect(result.current.load).toBeDefined();
  });

  it('enabled가 false이면 즉시 로드해야 함', () => {
    const { result } = renderHook(() => useLazyLoading({ enabled: false }));

    expect(result.current.isLoaded).toBe(true);
    expect(result.current.isIntersecting).toBe(true);
  });

  it('수동으로 로드할 수 있어야 함', () => {
    render(<HookHarness />);

    expect(screen.getByTestId('lazy-state')).toHaveAttribute('data-loaded', 'false');

    fireEvent.click(screen.getByTestId('lazy-manual-load'));

    expect(screen.getByTestId('lazy-state')).toHaveAttribute('data-loaded', 'true');
    expect(screen.getByTestId('lazy-state')).toHaveAttribute('data-intersecting', 'true');
  });

  it('IntersectionObserver를 생성하고 observe를 호출해야 함', () => {
    render(<HookHarness />);

    expect(mockObserve).toHaveBeenCalled();
    expect(lastObserverInit).toEqual(
      expect.objectContaining({
        threshold: 0.1,
        rootMargin: '100px',
      })
    );
  });

  it('커스텀 threshold를 사용해야 함', () => {
    render(<HookHarness options={{ threshold: 0.5 }} />);

    expect(lastObserverInit).toEqual(
      expect.objectContaining({
        threshold: 0.5,
      })
    );
  });

  it('커스텀 rootMargin을 사용해야 함', () => {
    render(<HookHarness options={{ rootMargin: '200px' }} />);

    expect(lastObserverInit).toEqual(
      expect.objectContaining({
        rootMargin: '200px',
      })
    );
  });
});
