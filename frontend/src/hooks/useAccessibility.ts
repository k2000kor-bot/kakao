/**
 * 접근성 훅
 * 스크린 리더 지원 및 키보드 포커스 관리
 * 
 * Task-H2: 접근성 개선
 */

import { useCallback, useRef, useEffect } from 'react';
import { errorLogger } from '../utils/errorLogger';

export interface UseAccessibilityOptions {
  /**
   * 변경사항을 자동으로 알림 여부
   */
  announceChanges?: boolean;

  /**
   * 알림 우선순위
   */
  priority?: 'polite' | 'assertive' | 'off';

  /**
   * 포커스 관리 활성화 여부
   */
  manageFocus?: boolean;
}

export interface UseAccessibilityReturn {
  /**
   * 스크린 리더에 메시지 알림
   */
  announce: (message: string, priority?: 'polite' | 'assertive') => void;

  /**
   * 요소에 포커스 이동
   */
  focusElement: (element: HTMLElement | null) => void;

  /**
   * 포커스 트랩 설정
   */
  trapFocus: (container: HTMLElement | null) => () => void;

  /**
   * ARIA 라이브 영역 참조
   */
  liveRegionRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * 접근성 훅
 */
export const useAccessibility = (
  options: UseAccessibilityOptions = {}
): UseAccessibilityReturn => {
  const {
    announceChanges = true,
    priority = 'polite',
    manageFocus = true,
  } = options;

  const liveRegionRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // ARIA 라이브 영역 생성
  useEffect(() => {
    if (!announceChanges) return;

    let liveRegion = document.getElementById('aria-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'aria-live-region';
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }

    if (liveRegionRef.current) {
      liveRegionRef.current = liveRegion as HTMLDivElement;
    }

    return () => {
      // 컴포넌트 언마운트 시 정리하지 않음 (다른 컴포넌트에서도 사용 가능)
    };
  }, [announceChanges, priority]);

  /**
   * 스크린 리더에 메시지 알림
   */
  const announce = useCallback((message: string, messagePriority?: 'polite' | 'assertive') => {
    if (!announceChanges || !message) return;

    const liveRegion = document.getElementById('aria-live-region') || liveRegionRef.current;
    if (!liveRegion) return;

    // 우선순위 설정
    const finalPriority = messagePriority || priority;
    liveRegion.setAttribute('aria-live', finalPriority);
    liveRegion.setAttribute('aria-atomic', 'true');

    // 메시지 설정
    liveRegion.textContent = message;

    // Web Speech API를 사용한 음성 알림 (선택적)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.volume = 0.5;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        // Web Speech API가 지원되지 않는 경우 무시
        console.debug('Web Speech API not available:', error);
      }
    }

    // 메시지 초기화 (다음 알림을 위해)
    setTimeout(() => {
      if (liveRegion) {
        liveRegion.textContent = '';
      }
    }, 1000);
  }, [announceChanges, priority]);

  /**
   * 요소에 포커스 이동
   */
  const focusElement = useCallback((element: HTMLElement | null) => {
    if (!manageFocus || !element) return;

    // 현재 포커스 저장
    previousFocusRef.current = document.activeElement as HTMLElement;

    // 포커스 이동
    try {
      element.focus();

      // 스크롤하여 요소가 보이도록
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });

      // 포커스 가능한 요소인지 확인
      if (document.activeElement !== element) {
        // 포커스 가능한 하위 요소 찾기
        const focusableElements = element.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          (focusableElements[0] as HTMLElement).focus();
        } else {
          // tabindex 추가하여 포커스 가능하게 만들기
          const originalTabIndex = element.getAttribute('tabindex');
          element.setAttribute('tabindex', '-1');
          element.focus();
          if (originalTabIndex === null) {
            element.removeAttribute('tabindex');
          } else {
            element.setAttribute('tabindex', originalTabIndex);
          }
        }
      }
    } catch (error) {
      errorLogger.warn('Focus element failed', { component: 'useAccessibility', action: 'focusElement', error: error instanceof Error ? error.message : String(error) });
    }
  }, [manageFocus]);

  /**
   * 포커스 트랩 설정 (모달 등에서 사용)
   */
  const trapFocus = useCallback((container: HTMLElement | null) => {
    if (!container) return () => { };

    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return () => { };

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // 첫 요소에 포커스
    firstElement.focus();

    // 정리 함수
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  return {
    announce,
    focusElement,
    trapFocus,
    liveRegionRef,
  };
};

