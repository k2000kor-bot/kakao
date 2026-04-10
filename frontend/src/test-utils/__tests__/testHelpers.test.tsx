/**
 * testHelpers 유틸리티 테스트
 */

import React from 'react';
import { screen } from '@testing-library/react';
import {
  renderWithTheme,
  setupCommonMocks,
  createMockFile,
  waitForAsync,
  mockCreateObjectURL,
  setupBlobURLMock,
  mockErrorLogger,
  mockUseNotifications,
} from '../testHelpers';

describe('testHelpers', () => {
  describe('renderWithTheme', () => {
    it('ThemeProvider로 감싸서 렌더링', () => {
      renderWithTheme(<div data-testid="test-node">테스트</div>);
      expect(screen.getByTestId('test-node')).toBeInTheDocument();
      expect(screen.getByText('테스트')).toBeInTheDocument();
    });
  });

  describe('setupCommonMocks', () => {
    it('호출 시 예외 없이 실행', () => {
      expect(() => setupCommonMocks()).not.toThrow();
    });

    it('localStorage 모킹 후 getItem/setItem/removeItem 동작', () => {
      setupCommonMocks();
      localStorage.setItem('key1', 'value1');
      expect(localStorage.getItem('key1')).toBe('value1');
      localStorage.removeItem('key1');
      expect(localStorage.getItem('key1')).toBeNull();
      localStorage.clear();
    });
  });

  describe('createMockFile', () => {
    it('File 인스턴스 반환, name/type/size 일치', () => {
      const file = createMockFile('test.pdf', 'application/pdf', 2000);
      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe('test.pdf');
      expect(file.type).toBe('application/pdf');
      expect(file.size).toBe(2000);
    });

    it('size 미지정 시 기본값', () => {
      const file = createMockFile('a.txt', 'text/plain');
      expect(file.size).toBe(1000);
    });
  });

  describe('waitForAsync', () => {
    it('지정 시간 후 resolve', async () => {
      const start = Date.now();
      await waitForAsync(20);
      expect(Date.now() - start).toBeGreaterThanOrEqual(15);
    });
  });

  describe('mockCreateObjectURL', () => {
    it('blob: 접두사 문자열 반환', () => {
      const url = mockCreateObjectURL(new Blob());
      expect(url).toMatch(/^blob:/);
    });
  });

  describe('setupBlobURLMock', () => {
    it('URL.createObjectURL 설정 후 호출 가능', () => {
      setupBlobURLMock();
      const url = URL.createObjectURL(new Blob());
      expect(url).toMatch(/^blob:/);
    });
  });

  describe('mock 객체 export', () => {
    it('mockErrorLogger 메서드 존재', () => {
      expect(mockErrorLogger.error).toBeDefined();
      expect(mockErrorLogger.warn).toBeDefined();
      expect(mockErrorLogger.info).toBeDefined();
      expect(mockErrorLogger.debug).toBeDefined();
    });

    it('mockUseNotifications 필드 존재', () => {
      expect(mockUseNotifications.notifications).toEqual([]);
      expect(mockUseNotifications.addNotification).toBeDefined();
      expect(mockUseNotifications.markAsRead).toBeDefined();
    });
  });
});
