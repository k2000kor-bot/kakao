/**
 * projectEvents 유틸리티 테스트 — notifyProjectsChanged, onProjectsChanged
 */
import { notifyProjectsChanged, onProjectsChanged } from '../projectEvents';

const PROJECTS_CHANGED_EVENT = 'corbu-projects-changed';

describe('projectEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('notifyProjectsChanged', () => {
    it('corbu-projects-changed CustomEvent를 dispatch해야 함', () => {
      const listener = jest.fn();
      window.addEventListener(PROJECTS_CHANGED_EVENT, listener);

      notifyProjectsChanged();

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].type).toBe(PROJECTS_CHANGED_EVENT);

      window.removeEventListener(PROJECTS_CHANGED_EVENT, listener);
    });
  });

  describe('onProjectsChanged', () => {
    it('리스너를 등록하고 notifyProjectsChanged 시 콜백이 호출되어야 함', () => {
      const callback = jest.fn();
      const unsubscribe = onProjectsChanged(callback);

      notifyProjectsChanged();

      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
    });

    it('반환된 함수 호출 시 리스너가 제거되어야 함', () => {
      const callback = jest.fn();
      const unsubscribe = onProjectsChanged(callback);

      unsubscribe();
      notifyProjectsChanged();

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
