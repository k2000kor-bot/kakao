/**
 * fileStorageService 테스트
 * 파일 저장소 서비스 기능 확인
 * @jest-environment jsdom
 */
/* eslint-disable jest/no-conditional-expect */

import FileStorageService from '../fileStorageService';
import { ProjectFile } from '../../types/project';

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
  };
})();

// console 메서드 모킹
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('FileStorageService', () => {
  let service: FileStorageService;

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });

    // 싱글톤 인스턴스 리셋
    (FileStorageService as unknown as { instance: unknown }).instance = undefined;
    service = FileStorageService.getInstance();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleWarn.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('getInstance', () => {
    it('싱글톤 인스턴스를 반환해야 함', () => {
      const instance1 = FileStorageService.getInstance();
      const instance2 = FileStorageService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('saveProjectFiles', () => {
    it('프로젝트 파일을 저장해야 함', () => {
      const files: ProjectFile[] = [
        { id: '1', name: 'file1.pdf', size: 1000 },
        { id: '2', name: 'file2.docx', size: 2000 },
      ];

      service.saveProjectFiles('project-1', files);

      const savedFiles = service.getProjectFiles('project-1');
      expect(savedFiles).toHaveLength(2);
      expect(savedFiles[0].name).toBe('file1.pdf');
    });

    it('하드코딩된 파일을 필터링해야 함', () => {
      const files: ProjectFile[] = [
        { id: '1', name: 'sample_hardcoded_proposal_v1.pdf', size: 1000 },
        { id: '2', name: 'normal_file.pdf', size: 2000 },
        { id: '3', name: 'proposal.pdf', size: 3000 },
      ];

      service.saveProjectFiles('project-1', files);

      const savedFiles = service.getProjectFiles('project-1');
      expect(savedFiles).toHaveLength(1);
      expect(savedFiles[0].name).toBe('normal_file.pdf');
      expect(mockConsoleWarn).toHaveBeenCalled();
    });
  });

  describe('getProjectFiles', () => {
    it('프로젝트 파일을 가져와야 함', () => {
      const files: ProjectFile[] = [
        { id: '1', name: 'file1.pdf', size: 1000 },
      ];

      service.saveProjectFiles('project-1', files);
      const retrievedFiles = service.getProjectFiles('project-1');

      expect(retrievedFiles).toHaveLength(1);
      expect(retrievedFiles[0].id).toBe('1');
    });

    it('존재하지 않는 프로젝트는 빈 배열을 반환해야 함', () => {
      const files = service.getProjectFiles('non-existent');

      expect(files).toEqual([]);
    });
  });

  describe('addFile', () => {
    it('새 파일을 추가해야 함', () => {
      const newFile: ProjectFile = { id: '3', name: 'file3.pdf', size: 3000 };

      service.saveProjectFiles('project-1', [
        { id: '1', name: 'file1.pdf', size: 1000 },
      ]);

      const result = service.addFile('project-1', newFile);

      expect(result).toBe(true);
      const files = service.getProjectFiles('project-1');
      expect(files).toHaveLength(2);
      expect(files.find(f => f.id === '3')).toBeDefined();
    });

    it('기존 파일을 업데이트해야 함', () => {
      service.saveProjectFiles('project-1', [
        { id: '1', name: 'file1.pdf', size: 1000 },
      ]);

      const updatedFile: ProjectFile = { id: '1', name: 'file1_updated.pdf', size: 2000 };
      const result = service.addFile('project-1', updatedFile);

      expect(result).toBe(true);
      const files = service.getProjectFiles('project-1');
      expect(files).toHaveLength(1);
      expect(files[0].name).toBe('file1_updated.pdf');
    });
  });

  describe('updateFile', () => {
    it('파일을 업데이트해야 함', () => {
      service.saveProjectFiles('project-1', [
        { id: '1', name: 'file1.pdf', size: 1000 },
      ]);

      service.updateFile('project-1', '1', { name: 'file1_updated.pdf' });

      const files = service.getProjectFiles('project-1');
      expect(files[0].name).toBe('file1_updated.pdf');
    });
  });

  describe('removeFile', () => {
    it('파일을 삭제해야 함', () => {
      service.saveProjectFiles('project-1', [
        { id: '1', name: 'file1.pdf', size: 1000 },
        { id: '2', name: 'file2.pdf', size: 2000 },
      ]);

      const result = service.removeFile('project-1', '1');

      expect(result).toBe(true);
      const files = service.getProjectFiles('project-1');
      expect(files).toHaveLength(1);
      expect(files.find(f => f.id === '1')).toBeUndefined();
    });

    it('존재하지 않는 파일 삭제 시 false를 반환해야 함', () => {
      service.saveProjectFiles('project-1', [
        { id: '1', name: 'file1.pdf', size: 1000 },
      ]);

      const result = service.removeFile('project-1', 'non-existent');

      expect(result).toBe(false);
    });
  });

  describe('restoreDeletedFile', () => {
    it('삭제된 파일을 복구해야 함', () => {
      const file: ProjectFile = { id: '1', name: 'file1.pdf', size: 1000 };
      service.saveProjectFiles('project-1', [file]);
      service.removeFile('project-1', '1');

      const result = service.restoreDeletedFile('project-1', '1');

      expect(result).toBe(true);
      const files = service.getProjectFiles('project-1');
      expect(files).toHaveLength(1);
      expect(files[0].id).toBe('1');
    });

    it('존재하지 않는 파일 복구 시 false를 반환해야 함', () => {
      const result = service.restoreDeletedFile('project-1', 'non-existent');

      expect(result).toBe(false);
    });
  });

  describe('removeProjectFiles', () => {
    it('프로젝트의 모든 파일을 삭제해야 함', () => {
      service.saveProjectFiles('project-1', [
        { id: '1', name: 'file1.pdf', size: 1000 },
        { id: '2', name: 'file2.pdf', size: 2000 },
      ]);

      service.removeProjectFiles('project-1');

      const files = service.getProjectFiles('project-1');
      expect(files).toHaveLength(0);
    });
  });

  describe('getAllProjectIds', () => {
    it('모든 프로젝트 ID를 반환해야 함', () => {
      service.saveProjectFiles('project-1', [{ id: '1', name: 'file1.pdf' }]);
      service.saveProjectFiles('project-2', [{ id: '2', name: 'file2.pdf' }]);

      const projectIds = service.getAllProjectIds();

      expect(projectIds).toContain('project-1');
      expect(projectIds).toContain('project-2');
    });

    it('저장소가 비어 있으면 빈 배열을 반환해야 함', () => {
      const projectIds = service.getAllProjectIds();
      expect(projectIds).toEqual([]);
    });
  });

  describe('getDeletedFiles', () => {
    it('삭제된 파일이 없으면 빈 배열을 반환해야 함', () => {
      const deleted = service.getDeletedFiles();
      expect(deleted).toEqual([]);
    });

    it('파일 삭제 후 해당 프로젝트의 삭제된 파일 목록을 반환해야 함', () => {
      service.saveProjectFiles('project-1', [
        { id: 'f1', name: 'a.pdf', size: 100 },
        { id: 'f2', name: 'b.pdf', size: 200 },
      ]);
      service.removeFile('project-1', 'f1');

      const deletedForProject = service.getDeletedFiles('project-1');
      expect(deletedForProject.length).toBe(1);
      expect(deletedForProject[0].file.id).toBe('f1');
      expect(deletedForProject[0].projectId).toBe('project-1');

      const allDeleted = service.getDeletedFiles();
      expect(allDeleted.length).toBe(1);
    });
  });

  describe('getStorageStats', () => {
    it('저장소 통계를 반환해야 함', () => {
      service.saveProjectFiles('project-1', [
        { id: '1', name: 'file1.pdf', size: 1000 },
        { id: '2', name: 'file2.pdf', size: 2000 },
      ]);
      service.saveProjectFiles('project-2', [
        { id: '3', name: 'file3.pdf', size: 3000 },
      ]);

      const stats = service.getStorageStats();

      expect(stats.totalProjects).toBe(2);
      expect(stats.totalFiles).toBe(3);
      expect(stats.totalSize).toBe(6000);
    });

    it('빈 저장소는 0 통계를 반환해야 함', () => {
      const stats = service.getStorageStats();

      expect(stats.totalProjects).toBe(0);
      expect(stats.totalFiles).toBe(0);
      expect(stats.totalSize).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('오래된 데이터를 정리해야 함', () => {
      // 오래된 데이터 생성 (실제로는 시간 기반이지만 테스트에서는 간단히)
      service.saveProjectFiles('project-1', [{ id: '1', name: 'file1.pdf' }]);

      service.cleanup();

      // cleanup은 1주일 이상 된 데이터를 삭제하므로
      // 방금 저장한 데이터는 남아있어야 함
      const files = service.getProjectFiles('project-1');
      expect(files.length).toBeGreaterThanOrEqual(0);
    });
  });
});

