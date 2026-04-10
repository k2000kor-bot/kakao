/**
 * toast 유틸리티 테스트 — showToast, onToast
 */
import { showToast, onToast, type ToastDetail } from '../toast';

describe('toast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('showToast', () => {
    it('CustomEvent를 corbu-toast로 dispatch해야 함', () => {
      const listener = jest.fn();
      window.addEventListener('corbu-toast', listener);

      showToast('테스트 메시지', 'info');

      expect(listener).toHaveBeenCalledTimes(1);
      const e = listener.mock.calls[0][0] as CustomEvent<ToastDetail>;
      expect(e.detail).toEqual({ message: '테스트 메시지', type: 'info' });

      window.removeEventListener('corbu-toast', listener);
    });

    it('type 생략 시 기본값 error여야 함', () => {
      const listener = jest.fn();
      window.addEventListener('corbu-toast', listener);

      showToast('에러 메시지');

      expect(listener).toHaveBeenCalledTimes(1);
      const e = listener.mock.calls[0][0] as CustomEvent<ToastDetail>;
      expect(e.detail.type).toBe('error');
      expect(e.detail.message).toBe('에러 메시지');

      window.removeEventListener('corbu-toast', listener);
    });

    it('success 타입을 전달할 수 있어야 함', () => {
      const listener = jest.fn();
      window.addEventListener('corbu-toast', listener);

      showToast('저장됨', 'success');

      expect(listener).toHaveBeenCalledTimes(1);
      const e = listener.mock.calls[0][0] as CustomEvent<ToastDetail>;
      expect(e.detail).toEqual({ message: '저장됨', type: 'success' });

      window.removeEventListener('corbu-toast', listener);
    });
  });

  describe('onToast', () => {
    it('리스너를 등록하고 showToast 시 콜백이 호출되어야 함', () => {
      const callback = jest.fn();
      const unsubscribe = onToast(callback);

      showToast('알림', 'info');

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({ message: '알림', type: 'info' });

      unsubscribe();
    });

    it('반환된 함수 호출 시 리스너가 제거되어야 함', () => {
      const callback = jest.fn();
      const unsubscribe = onToast(callback);

      unsubscribe();
      showToast('이후 메시지');

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
