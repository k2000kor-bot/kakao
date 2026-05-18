/** prefers-reduced-motion 여부 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)')?.matches === true;
  } catch {
    return false;
  }
}

/** scrollIntoView 실패 시 폴백 */
export function scrollElementIntoViewSafe(
  el: Element | null | undefined,
  options?: { block?: ScrollLogicalPosition; behavior?: ScrollBehavior },
): void {
  if (!el || typeof (el as HTMLElement).scrollIntoView !== 'function') return;
  const behavior = options?.behavior ?? (prefersReducedMotion() ? 'auto' : 'smooth');
  try {
    el.scrollIntoView({
      block: options?.block ?? 'nearest',
      behavior,
    });
  } catch {
    try {
      el.scrollIntoView();
    } catch {
      /* noop */
    }
  }
}

export function scrollToSelector(
  selector: string,
  options?: { block?: ScrollLogicalPosition; behavior?: ScrollBehavior },
): void {
  scrollElementIntoViewSafe(document.querySelector(selector), options);
}
