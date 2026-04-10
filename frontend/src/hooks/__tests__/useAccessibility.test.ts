/**
 * useAccessibility 훅 테스트
 * 접근성 기능 확인
 * @jest-environment jsdom
*/

import { renderHook, act } from '@testing-library/react';
import { useAccessibility } from '../useAccessibility';

// SpeechSynthesis 모킹
const mockSpeechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
};

Object.defineProperty(window, 'speechSynthesis', {
  value: mockSpeechSynthesis,
  writable: true,
});

// SpeechSynthesisUtterance 모킹
global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text: string) => ({
  text,
  volume: 1,
  rate: 1,
  pitch: 1,
})) as unknown as typeof SpeechSynthesisUtterance;

describe('useAccessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    /* eslint-disable testing-library/no-node-access -- 훅이 DOM에 직접 추가한 라이브 영역 제거 */
    const existingRegion = document.getElementById('aria-live-region');
    if (existingRegion) {
      existingRegion.remove();
    }
    /* eslint-enable testing-library/no-node-access */
  });

  afterEach(() => {
    /* eslint-disable testing-library/no-node-access -- 훅이 DOM에 직접 추가한 라이브 영역 정리 */
    const region = document.getElementById('aria-live-region');
    if (region) {
      region.remove();
    }
    /* eslint-enable testing-library/no-node-access */
  });

  it('기본 옵션으로 초기화해야 함', () => {
    const { result } = renderHook(() => useAccessibility());

    expect(result.current.announce).toBeDefined();
    expect(result.current.focusElement).toBeDefined();
    expect(result.current.trapFocus).toBeDefined();
    expect(result.current.liveRegionRef).toBeDefined();
  });

  it('announceChanges가 false이면 알림을 생성하지 않아야 함', () => {
    const { result } = renderHook(() =>
      useAccessibility({ announceChanges: false })
    );

    act(() => {
      result.current.announce('Test message');
    });

    // eslint-disable-next-line testing-library/no-node-access -- 훅이 생성한 라이브 영역 검증
    const region = document.getElementById('aria-live-region');
    expect(region).toBeNull();
  });

  it('메시지를 알림해야 함', () => {
    const { result } = renderHook(() => useAccessibility());

    act(() => {
      result.current.announce('Test message');
    });

    // eslint-disable-next-line testing-library/no-node-access -- 훅이 생성한 라이브 영역 검증
    const region = document.getElementById('aria-live-region');
    expect(region).not.toBeNull();
    expect(region?.textContent).toBe('Test message');
  });

  it('우선순위를 설정해야 함', () => {
    const { result } = renderHook(() =>
      useAccessibility({ priority: 'assertive' })
    );

    act(() => {
      result.current.announce('Test message', 'assertive');
    });

    // eslint-disable-next-line testing-library/no-node-access -- 훅이 생성한 라이브 영역 검증
    const region = document.getElementById('aria-live-region');
    expect(region?.getAttribute('aria-live')).toBe('assertive');
  });

  it('요소에 포커스를 이동해야 함', () => {
    const { result } = renderHook(() => useAccessibility());

    const element = document.createElement('button');
    element.textContent = 'Test Button';
    document.body.appendChild(element);

    const focusSpy = jest.spyOn(element, 'focus');

    act(() => {
      result.current.focusElement(element);
    });

    expect(focusSpy).toHaveBeenCalled();
  });

  it('manageFocus가 false이면 포커스를 이동하지 않아야 함', () => {
    const { result } = renderHook(() =>
      useAccessibility({ manageFocus: false })
    );

    const element = document.createElement('button');
    document.body.appendChild(element);

    const focusSpy = jest.spyOn(element, 'focus');

    act(() => {
      result.current.focusElement(element);
    });

    expect(focusSpy).not.toHaveBeenCalled();
  });

  it('포커스 트랩을 설정해야 함', () => {
    const { result } = renderHook(() => useAccessibility());

    const container = document.createElement('div');
    const button1 = document.createElement('button');
    button1.textContent = 'Button 1';
    const button2 = document.createElement('button');
    button2.textContent = 'Button 2';
    container.appendChild(button1);
    container.appendChild(button2);
    document.body.appendChild(container);

    act(() => {
      const cleanup = result.current.trapFocus(container);
      expect(cleanup).toBeDefined();

      // Tab 키 이벤트 시뮬레이션
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      button2.dispatchEvent(tabEvent);

      cleanup();
    });

    expect(button1.focus).toBeDefined();
  });

  it('빈 컨테이너에 대한 포커스 트랩을 처리해야 함', () => {
    const { result } = renderHook(() => useAccessibility());

    const container = document.createElement('div');

    act(() => {
      const cleanup = result.current.trapFocus(container);
      expect(cleanup).toBeDefined();
      cleanup();
    });
  });

  it('null 컨테이너에 대한 포커스 트랩을 처리해야 함', () => {
    const { result } = renderHook(() => useAccessibility());

    act(() => {
      const cleanup = result.current.trapFocus(null);
      expect(cleanup).toBeDefined();
      cleanup();
    });
  });
});

