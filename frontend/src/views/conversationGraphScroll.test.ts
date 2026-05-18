import { prefersReducedMotion, scrollElementIntoViewSafe } from './conversationGraphScroll';

describe('conversationGraphScroll', () => {
  it('prefersReducedMotion은 matchMedia 결과를 반영한다', () => {
    const matchMedia = jest.fn().mockReturnValue({ matches: true });
    Object.defineProperty(window, 'matchMedia', { writable: true, value: matchMedia });
    expect(prefersReducedMotion()).toBe(true);
    matchMedia.mockReturnValue({ matches: false });
    expect(prefersReducedMotion()).toBe(false);
  });

  it('scrollElementIntoViewSafe는 요소에 scrollIntoView를 호출한다', () => {
    const el = document.createElement('div');
    const scrollIntoView = jest.fn();
    el.scrollIntoView = scrollIntoView;
    scrollElementIntoViewSafe(el, { block: 'start' });
    expect(scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ block: 'start' }),
    );
  });
});
