import {
  coerceSidebarContextFilterDetail,
  coerceSidebarContextBooleanDetail,
  SIDEBAR_CONTEXT_FILTER_STORAGE_KEY,
  SIDEBAR_CONTEXT_RESTORE_UPDATED_EVENT,
  SIDEBAR_CONTEXT_RESTORE_KEY,
  SIDEBAR_CONTEXT_TOAST_UPDATED_EVENT,
  SIDEBAR_CONTEXT_FILTER_UPDATED_EVENT,
  dispatchSidebarContextFilterUpdated,
  dispatchSidebarContextRestoreUpdated,
  dispatchSidebarContextToastUpdated,
  isSidebarContextFilter,
  normalizeSidebarContextFilter,
  readSidebarContextFilterFlag,
  readSidebarContextFilterFromStorage,
  sidebarContextFilterLabel,
  type SidebarContextRestoreUpdatedDetail,
  type SidebarContextToastUpdatedDetail,
  type SidebarContextFilterUpdatedDetail,
  writeSidebarContextFilterToStorage,
  writeSidebarContextFilterFlag,
} from './sidebarContextFilterEvent';

describe('sidebarContextFilterEvent', () => {
  it('isSidebarContextFilter는 유효한 필터만 true를 반환한다', () => {
    expect(isSidebarContextFilter('all')).toBe(true);
    expect(isSidebarContextFilter('agent')).toBe(true);
    expect(isSidebarContextFilter('project')).toBe(true);
    expect(isSidebarContextFilter('ALL')).toBe(false);
    expect(isSidebarContextFilter('Agent')).toBe(false);
    expect(isSidebarContextFilter('project ')).toBe(false);
    expect(isSidebarContextFilter('unknown')).toBe(false);
    expect(isSidebarContextFilter(undefined)).toBe(false);
  });

  it('normalizeSidebarContextFilter는 잘못된 값을 fallback으로 정규화한다', () => {
    expect(normalizeSidebarContextFilter('all', 'project')).toBe('all');
    expect(normalizeSidebarContextFilter('agent', 'all')).toBe('agent');
    expect(normalizeSidebarContextFilter('oops', 'project')).toBe('project');
    expect(normalizeSidebarContextFilter(' project ', 'agent')).toBe('agent');
    expect(normalizeSidebarContextFilter(undefined, 'all')).toBe('all');
    expect(normalizeSidebarContextFilter('oops')).toBe('all');
  });

  it('sidebarContextFilterLabel은 필터를 한국어 라벨로 변환한다', () => {
    expect(sidebarContextFilterLabel('all')).toBe('전체');
    expect(sidebarContextFilterLabel('agent')).toBe('에이전트');
    expect(sidebarContextFilterLabel('project')).toBe('프로젝트');
  });

  it('coerceSidebarContextFilterDetail은 유효한 필터 문자열만 허용한다', () => {
    expect(coerceSidebarContextFilterDetail('all')).toBe('all');
    expect(coerceSidebarContextFilterDetail('agent')).toBe('agent');
    expect(coerceSidebarContextFilterDetail('project')).toBe('project');
    expect(coerceSidebarContextFilterDetail(' agent ')).toBeUndefined();
    expect(coerceSidebarContextFilterDetail('')).toBeUndefined();
    expect(coerceSidebarContextFilterDetail('PROJECT')).toBeUndefined();
    // eslint-disable-next-line no-new-wrappers -- String 객체는 primitive가 아님을 검증
    expect(coerceSidebarContextFilterDetail(new String('all'))).toBeUndefined();
    expect(coerceSidebarContextFilterDetail('unknown')).toBeUndefined();
    expect(coerceSidebarContextFilterDetail(1)).toBeUndefined();
    expect(coerceSidebarContextFilterDetail(undefined)).toBeUndefined();
  });

  it('dispatchSidebarContextFilterUpdated는 계약된 이벤트와 payload를 발행한다', () => {
    const onUpdated = jest.fn();
    window.addEventListener(SIDEBAR_CONTEXT_FILTER_UPDATED_EVENT, onUpdated as EventListener);
    try {
      dispatchSidebarContextFilterUpdated('project');
      expect(onUpdated).toHaveBeenCalledTimes(1);
      const event = onUpdated.mock.calls[0]?.[0] as CustomEvent<SidebarContextFilterUpdatedDetail>;
      expect(event.type).toBe(SIDEBAR_CONTEXT_FILTER_UPDATED_EVENT);
      expect(event.detail?.filter).toBe('project');
    } finally {
      window.removeEventListener(SIDEBAR_CONTEXT_FILTER_UPDATED_EVENT, onUpdated as EventListener);
    }
  });

  it('dispatchSidebarContextRestoreUpdated는 복원 설정 이벤트를 발행한다', () => {
    const onUpdated = jest.fn();
    window.addEventListener(SIDEBAR_CONTEXT_RESTORE_UPDATED_EVENT, onUpdated as EventListener);
    try {
      dispatchSidebarContextRestoreUpdated(true);
      expect(onUpdated).toHaveBeenCalledTimes(1);
      const event = onUpdated.mock.calls[0]?.[0] as CustomEvent<SidebarContextRestoreUpdatedDetail>;
      expect(event.type).toBe(SIDEBAR_CONTEXT_RESTORE_UPDATED_EVENT);
      expect(event.detail?.restoreEnabled).toBe(true);
    } finally {
      window.removeEventListener(SIDEBAR_CONTEXT_RESTORE_UPDATED_EVENT, onUpdated as EventListener);
    }
  });

  it('dispatchSidebarContextToastUpdated는 토스트 설정 이벤트를 발행한다', () => {
    const onUpdated = jest.fn();
    window.addEventListener(SIDEBAR_CONTEXT_TOAST_UPDATED_EVENT, onUpdated as EventListener);
    try {
      dispatchSidebarContextToastUpdated(false);
      expect(onUpdated).toHaveBeenCalledTimes(1);
      const event = onUpdated.mock.calls[0]?.[0] as CustomEvent<SidebarContextToastUpdatedDetail>;
      expect(event.type).toBe(SIDEBAR_CONTEXT_TOAST_UPDATED_EVENT);
      expect(event.detail?.enabled).toBe(false);
    } finally {
      window.removeEventListener(SIDEBAR_CONTEXT_TOAST_UPDATED_EVENT, onUpdated as EventListener);
    }
  });

  it('read/writeSidebarContextFilterFlag는 1/0 형식으로 설정을 저장/복원한다', () => {
    localStorage.removeItem(SIDEBAR_CONTEXT_RESTORE_KEY);
    expect(readSidebarContextFilterFlag(SIDEBAR_CONTEXT_RESTORE_KEY, true)).toBe(true);

    writeSidebarContextFilterFlag(SIDEBAR_CONTEXT_RESTORE_KEY, false);
    expect(localStorage.getItem(SIDEBAR_CONTEXT_RESTORE_KEY)).toBe('0');
    expect(readSidebarContextFilterFlag(SIDEBAR_CONTEXT_RESTORE_KEY, true)).toBe(false);

    writeSidebarContextFilterFlag(SIDEBAR_CONTEXT_RESTORE_KEY, true);
    expect(localStorage.getItem(SIDEBAR_CONTEXT_RESTORE_KEY)).toBe('1');
    expect(readSidebarContextFilterFlag(SIDEBAR_CONTEXT_RESTORE_KEY, false)).toBe(true);
  });

  it("readSidebarContextFilterFlag는 '0' 이외 값을 enabled로 해석한다", () => {
    localStorage.setItem(SIDEBAR_CONTEXT_RESTORE_KEY, '2');
    expect(readSidebarContextFilterFlag(SIDEBAR_CONTEXT_RESTORE_KEY, false)).toBe(true);
    localStorage.setItem(SIDEBAR_CONTEXT_RESTORE_KEY, 'random');
    expect(readSidebarContextFilterFlag(SIDEBAR_CONTEXT_RESTORE_KEY, false)).toBe(true);
    localStorage.setItem(SIDEBAR_CONTEXT_RESTORE_KEY, 'false');
    expect(readSidebarContextFilterFlag(SIDEBAR_CONTEXT_RESTORE_KEY, false)).toBe(true);
  });

  it('readSidebarContextFilterFlag는 저장값이 없으면 전달한 default를 그대로 반환한다', () => {
    localStorage.removeItem(SIDEBAR_CONTEXT_RESTORE_KEY);
    expect(readSidebarContextFilterFlag(SIDEBAR_CONTEXT_RESTORE_KEY, true)).toBe(true);
    expect(readSidebarContextFilterFlag(SIDEBAR_CONTEXT_RESTORE_KEY, false)).toBe(false);
  });

  it('readSidebarContextFilterFlag는 default 인자를 생략하면 true를 기본값으로 사용한다', () => {
    localStorage.removeItem(SIDEBAR_CONTEXT_RESTORE_KEY);
    expect(readSidebarContextFilterFlag(SIDEBAR_CONTEXT_RESTORE_KEY)).toBe(true);
  });

  it("readSidebarContextFilterFlag는 default 생략 상태에서도 저장값 '0'을 false로 해석한다", () => {
    localStorage.setItem(SIDEBAR_CONTEXT_RESTORE_KEY, '0');
    expect(readSidebarContextFilterFlag(SIDEBAR_CONTEXT_RESTORE_KEY)).toBe(false);
  });

  it('writeSidebarContextFilterFlag는 storage 쓰기 예외가 나도 throw하지 않는다', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string) => {
      if (String(key) === SIDEBAR_CONTEXT_RESTORE_KEY) {
        throw new Error('storage write failure');
      }
    });
    try {
      expect(() => writeSidebarContextFilterFlag(SIDEBAR_CONTEXT_RESTORE_KEY, true)).not.toThrow();
    } finally {
      setItemSpy.mockRestore();
    }
  });

  it('read/writeSidebarContextFilterToStorage는 필터 값을 저장/복원한다', () => {
    localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
    expect(readSidebarContextFilterFromStorage('all')).toBe('all');

    writeSidebarContextFilterToStorage('all');
    expect(localStorage.getItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY)).toBe('all');
    expect(readSidebarContextFilterFromStorage('project')).toBe('all');

    writeSidebarContextFilterToStorage('agent');
    expect(localStorage.getItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY)).toBe('agent');
    expect(readSidebarContextFilterFromStorage('all')).toBe('agent');

    writeSidebarContextFilterToStorage('project');
    expect(localStorage.getItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY)).toBe('project');
    expect(readSidebarContextFilterFromStorage('all')).toBe('project');
  });

  it('readSidebarContextFilterFromStorage는 잘못된 저장값을 fallback으로 정규화한다', () => {
    localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'invalid-filter');
    expect(readSidebarContextFilterFromStorage('project')).toBe('project');
    localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, ' all ');
    expect(readSidebarContextFilterFromStorage('agent')).toBe('agent');
  });

  it('readSidebarContextFilterFromStorage는 저장값이 없거나 빈 값이면 전달한 fallback을 사용한다', () => {
    localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
    expect(readSidebarContextFilterFromStorage('project')).toBe('project');
    localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, '');
    expect(readSidebarContextFilterFromStorage('agent')).toBe('agent');
  });

  it('readSidebarContextFilterFromStorage는 fallback 인자를 생략하면 기본값 all을 사용한다', () => {
    localStorage.removeItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY);
    expect(readSidebarContextFilterFromStorage()).toBe('all');
    localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'invalid-filter');
    expect(readSidebarContextFilterFromStorage()).toBe('all');
  });

  it('readSidebarContextFilterFromStorage는 저장값이 유효하면 fallback보다 저장값을 우선한다', () => {
    localStorage.setItem(SIDEBAR_CONTEXT_FILTER_STORAGE_KEY, 'project');
    expect(readSidebarContextFilterFromStorage('agent')).toBe('project');
  });

  it('writeSidebarContextFilterToStorage는 storage 예외가 나도 throw하지 않는다', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage write failure');
    });
    expect(() => writeSidebarContextFilterToStorage('all')).not.toThrow();
    setItemSpy.mockRestore();
  });

  it('coerceSidebarContextBooleanDetail은 boolean만 허용한다', () => {
    expect(coerceSidebarContextBooleanDetail(true)).toBe(true);
    expect(coerceSidebarContextBooleanDetail(false)).toBe(false);
    expect(coerceSidebarContextBooleanDetail('true')).toBeUndefined();
    expect(coerceSidebarContextBooleanDetail(1)).toBeUndefined();
    // eslint-disable-next-line no-new-wrappers -- Boolean 객체는 primitive가 아님을 검증
    expect(coerceSidebarContextBooleanDetail(new Boolean(true))).toBeUndefined();
    // eslint-disable-next-line no-new-wrappers
    expect(coerceSidebarContextBooleanDetail(new Boolean(false))).toBeUndefined();
    expect(coerceSidebarContextBooleanDetail({ enabled: true })).toBeUndefined();
    expect(coerceSidebarContextBooleanDetail([true])).toBeUndefined();
    expect(coerceSidebarContextBooleanDetail(null)).toBeUndefined();
    expect(coerceSidebarContextBooleanDetail(undefined)).toBeUndefined();
  });
});
