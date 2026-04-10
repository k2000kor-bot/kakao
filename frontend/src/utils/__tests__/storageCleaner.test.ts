/**
 * storageCleaner 유틸리티 테스트
 * 로컬 스토리지 정리 기능 확인
 * @jest-environment jsdom
*/

import {
  cleanLocalStorage,
  forceRefreshFileList,
  resetProjectData,
} from '../storageCleaner';

// errorLogger 모킹
jest.mock('../errorLogger', () => ({
  errorLogger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

// localStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

describe('storageCleaner', () => {
  const { errorLogger } = require('../errorLogger');

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
  });

  describe('cleanLocalStorage', () => {
    it('하드코딩된 파일을 배열에서 제거해야 함', () => {
      const files = [
        { name: '개포우성7차_제안서.pdf', id: '1' },
        { name: 'normal_file.pdf', id: '2' },
        { name: '래미안 루미원_계획서.docx', id: '3' },
        { name: 'another_file.pdf', id: '4' },
      ];

      localStorageMock.setItem('projectFiles', JSON.stringify(files));

      const result = cleanLocalStorage();

      expect(result).toBe(true);
      const cleaned = JSON.parse(localStorageMock.getItem('projectFiles') || '[]');
      expect(cleaned).toHaveLength(2);
      expect(cleaned.some((f: { name?: string }) => f.name.includes('개포우성'))).toBe(false);
      expect(cleaned.some((f: { name?: string }) => f.name.includes('래미안'))).toBe(false);
    });

    it('하드코딩된 파일을 객체 구조에서 제거해야 함', () => {
      const projectData = {
        'project-1': {
          files: [
            { name: '개포우성7차_제안서.pdf', id: '1' },
            { name: 'normal_file.pdf', id: '2' },
            { name: 'Raemian_plan.pdf', id: '3' },
          ],
        },
      };

      localStorageMock.setItem('fileStorage', JSON.stringify(projectData));

      const result = cleanLocalStorage();

      expect(result).toBe(true);
      const cleaned = JSON.parse(localStorageMock.getItem('fileStorage') || '{}');
      expect(cleaned['project-1'].files).toHaveLength(1);
      expect(cleaned['project-1'].files[0].name).toBe('normal_file.pdf');
    });

    it('fileName 필드로 된 하드코딩 파일도 제거해야 함', () => {
      const files = [
        { fileName: '래미안 루미원_계획서.docx', id: '1' },
        { fileName: 'keep.pdf', id: '2' },
      ];
      localStorageMock.setItem('projectFiles', JSON.stringify(files));

      const result = cleanLocalStorage();

      expect(result).toBe(true);
      const cleaned = JSON.parse(localStorageMock.getItem('projectFiles') || '[]');
      expect(cleaned).toHaveLength(1);
      expect(cleaned[0].fileName).toBe('keep.pdf');
    });

    it('특정 키들을 완전히 삭제해야 함', () => {
      localStorageMock.setItem('hardcodedFiles', JSON.stringify([{ name: 'test' }]));
      localStorageMock.setItem('sampleFiles', JSON.stringify([{ name: 'test' }]));
      localStorageMock.setItem('testFiles', JSON.stringify([{ name: 'test' }]));

      cleanLocalStorage();

      expect(localStorageMock.getItem('hardcodedFiles')).toBeNull();
      expect(localStorageMock.getItem('sampleFiles')).toBeNull();
      expect(localStorageMock.getItem('testFiles')).toBeNull();
    });

    it('파싱 실패 시 경고를 출력하고 계속 진행해야 함', () => {
      localStorageMock.setItem('projectFiles', 'invalid json');

      const result = cleanLocalStorage();

      expect(result).toBe(true);
      expect(errorLogger.warn).toHaveBeenCalled();
    });

    it('파일 관련 키를 전역 검색하여 정리해야 함', () => {
      const customKey = 'customFileStorage';
      const files = [
        { name: '개포우성7차_제안서.pdf', id: '1' },
        { name: 'normal_file.pdf', id: '2' },
      ];

      localStorageMock.setItem(customKey, JSON.stringify(files));

      // Object.keys를 모킹하여 customKey를 반환하도록 설정
      const originalKeys = Object.keys;
      const keysSpy = jest.spyOn(Object, 'keys').mockImplementation((obj: object) => {
        if (obj === localStorageMock) {
          return ['projectFiles', customKey, 'otherKey'];
        }
        return originalKeys(obj);
      });

      cleanLocalStorage();

      const cleaned = JSON.parse(localStorageMock.getItem(customKey) || '[]');
      expect(cleaned).toHaveLength(1);
      expect(cleaned[0].name).toBe('normal_file.pdf');

      keysSpy.mockRestore();
    });

    it('에러 발생 시 false를 반환해야 함', () => {
      // localStorage.getItem을 모킹하여 에러 발생
      const originalGetItem = localStorageMock.getItem;
      localStorageMock.getItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      const result = cleanLocalStorage();

      expect(result).toBe(false);
      expect(errorLogger.error).toHaveBeenCalled();

      // 원래 함수 복원
      localStorageMock.getItem = originalGetItem;
    });
  });

  describe('forceRefreshFileList', () => {
    it('파일 목록 새로고침 이벤트를 발생시켜야 함', () => {
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

      const result = forceRefreshFileList();

      expect(result).toBe(true);
      expect(dispatchEventSpy).toHaveBeenCalledTimes(3);
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'projectFilesUpdated',
          detail: { force: true, clean: true },
        })
      );
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'knowledgeBaseUpdated',
          detail: { force: true, clean: true },
        })
      );
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'writingMaterialsUpdated',
          detail: { force: true, clean: true },
        })
      );

      dispatchEventSpy.mockRestore();
    });

    it('에러 발생 시 false를 반환해야 함', () => {
      jest.spyOn(window, 'dispatchEvent').mockImplementation(() => {
        throw new Error('Event error');
      });

      const result = forceRefreshFileList();

      expect(result).toBe(false);

      jest.restoreAllMocks();
    });
  });

  describe('resetProjectData', () => {
    it('프로젝트 데이터를 초기화해야 함', () => {
      const result = resetProjectData();

      expect(result).toBe(true);
      const projectData = JSON.parse(localStorageMock.getItem('currentProject') || '{}');
      expect(projectData.id).toBe('1');
      expect(projectData.name).toBe('샘플 프로젝트');
      expect(projectData.files).toEqual([]);
      expect(projectData.messageCount).toBe(0);
    });

    it('에러 발생 시 false를 반환해야 함', () => {
      // localStorage.setItem을 모킹하여 에러 발생
      const originalSetItem = localStorageMock.setItem;
      const errorSetItem = jest.fn(() => {
        throw new Error('Storage error');
      });
      localStorageMock.setItem = errorSetItem;

      // window.localStorage를 다시 정의
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
        configurable: true,
      });

      const result = resetProjectData();

      expect(result).toBe(false);
      // console.error가 호출되었는지 확인 (에러 메시지가 출력되었으므로)
      expect(errorSetItem).toHaveBeenCalled();

      // 원래 함수 복원
      localStorageMock.setItem = originalSetItem;
    });
  });
});

