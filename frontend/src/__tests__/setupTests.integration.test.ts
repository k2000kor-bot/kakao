/**
 * setupTests 적용 여부 검증
 * Jest + jest-dom + setupCommonMocks가 정상 적용되었는지 확인
 */

export {};

describe('setupTests 환경', () => {
  it('document.body 존재', () => {
    expect(document.body).toBeDefined();
    expect(document.body).toBeInstanceOf(HTMLBodyElement);
  });

  it('jest-dom matcher toBeInTheDocument 사용 가능', () => {
    const div = document.createElement('div');
    div.textContent = 'test';
    expect(div).not.toBeInTheDocument();
    document.body.appendChild(div);
    expect(div).toBeInTheDocument();
    document.body.removeChild(div);
  });

  it('localStorage 사용 가능 (setupCommonMocks)', () => {
    expect(typeof localStorage.setItem).toBe('function');
    expect(typeof localStorage.getItem).toBe('function');
    expect(typeof localStorage.removeItem).toBe('function');
    expect(typeof localStorage.clear).toBe('function');
    localStorage.setItem('__setup_test__', '1');
    expect(localStorage.getItem('__setup_test__')).toBe('1');
    localStorage.removeItem('__setup_test__');
    expect(localStorage.getItem('__setup_test__')).toBeNull();
  });

  it('window.matchMedia 존재 (setupCommonMocks)', () => {
    expect(typeof window.matchMedia).toBe('function');
    const q = window.matchMedia('(min-width: 768px)');
    if (q != null) {
      // eslint-disable-next-line jest/no-conditional-expect -- q may be null in some envs
      expect(typeof q.matches).toBe('boolean');
    }
  });
});
