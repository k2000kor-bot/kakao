/**
 * 전역 토스트 유틸리티
 * alert 대신 토스트 알림을 사용할 때 호출
 */
const TOAST_EVENT = 'corbu-toast';

export interface ToastDetail {
  message: string;
  type?: 'success' | 'error' | 'info';
}

export function showToast(message: string, type: ToastDetail['type'] = 'error'): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<ToastDetail>(TOAST_EVENT, { detail: { message, type } }));
}

export function onToast(callback: (detail: ToastDetail) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => callback((e as CustomEvent<ToastDetail>).detail);
  window.addEventListener(TOAST_EVENT, handler);
  return () => window.removeEventListener(TOAST_EVENT, handler);
}
