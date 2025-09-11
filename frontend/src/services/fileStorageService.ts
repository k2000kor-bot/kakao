import { ProjectFile } from '../types/project';

export interface FileStorageData {
  projectId: string;
  files: ProjectFile[];
  lastUpdated: string;
}

class FileStorageService {
  private static instance: FileStorageService;
  private storageKey = 'project_files_storage';
  private deletedFilesKey = 'deleted_files_backup';

  private constructor() { }

  static getInstance(): FileStorageService {
    if (!FileStorageService.instance) {
      FileStorageService.instance = new FileStorageService();
    }
    return FileStorageService.instance;
  }

  // 파일 저장 전 필터링 (하드코딩된 파일 방지)
  private filterHardcodedFiles(files: ProjectFile[]): ProjectFile[] {
    return files.filter(file => {
      // 하드코딩된 파일 이름 패턴 체크
      const hardcodedPatterns = [
        '개포우성7차_제안서',
        '개포우성7차_분석보고서',
        'proposal.pdf',
        'test_proposal'
      ];

      const fileName = file.name || '';
      const isHardcoded = hardcodedPatterns.some(pattern =>
        fileName.toLowerCase().includes(pattern.toLowerCase())
      );

      if (isHardcoded) {
        console.warn('하드코딩된 파일 저장 방지:', fileName);
        return false;
      }

      return true;
    });
  }

  // 프로젝트 파일 저장 (하드코딩된 파일 필터링 포함)
  saveProjectFiles(projectId: string, files: ProjectFile[]): void {
    try {
      // 하드코딩된 파일 필터링
      const filteredFiles = this.filterHardcodedFiles(files);

      if (filteredFiles.length !== files.length) {
        console.log(`하드코딩된 파일 ${files.length - filteredFiles.length}개 필터링됨`);
      }

      const storageData = this.getAllProjectFiles();
      storageData[projectId] = {
        projectId,
        files: filteredFiles,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(this.storageKey, JSON.stringify(storageData));
      console.log(`프로젝트 ${projectId} 파일 저장 완료 (${filteredFiles.length}개)`);
    } catch (error) {
      console.error('프로젝트 파일 저장 실패:', error);
    }
  }

  // 프로젝트별 파일 불러오기
  getProjectFiles(projectId: string): ProjectFile[] {
    try {
      const storageData = this.getAllProjectFiles();
      const projectData = storageData[projectId];

      if (projectData) {
        console.log(`프로젝트 ${projectId}의 파일 ${projectData.files.length}개 불러옴`);
        return projectData.files;
      }

      return [];
    } catch (error) {
      console.error('파일 불러오기 실패:', error);
      return [];
    }
  }

    // 특정 파일 완전 삭제 (백업 포함)
  removeFile(projectId: string, fileId: string): boolean {
    try {
      console.log(`파일 완전 삭제 시작: ${fileId} (프로젝트: ${projectId})`);

      // 1. 현재 프로젝트의 파일 목록 가져오기
      const currentFiles = this.getProjectFiles(projectId);
      const fileToDelete = currentFiles.find(file => file.id === fileId);

      if (!fileToDelete) {
        console.warn(`삭제할 파일을 찾을 수 없음: ${fileId}`);
        return false;
      }

      console.log(`삭제할 파일 발견: ${fileToDelete.name} (${fileId})`);

      // 2. 삭제 전 백업 저장
      this.backupDeletedFile(projectId, fileToDelete);

      // 3. 파일 제거
      const updatedFiles = currentFiles.filter(file => file.id !== fileId);

      // 4. 직접 localStorage에 저장 (필터링 없이)
      const storageData = this.getAllProjectFiles();
      storageData[projectId] = {
        projectId,
        files: updatedFiles,
        lastUpdated: new Date().toISOString()
      };

      // 5. localStorage에 저장
      localStorage.setItem(this.storageKey, JSON.stringify(storageData));

      // 6. 삭제 확인
      const verifyFiles = this.getProjectFiles(projectId);
      const stillExists = verifyFiles.find(file => file.id === fileId);

      if (stillExists) {
        console.error(`파일 삭제 실패 - 여전히 존재함: ${fileId}`);
        
        // 강제 삭제 시도
        const forceUpdatedFiles = verifyFiles.filter(file => file.id !== fileId);
        storageData[projectId] = {
          projectId,
          files: forceUpdatedFiles,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(this.storageKey, JSON.stringify(storageData));
        
        // 최종 확인
        const finalCheck = this.getProjectFiles(projectId);
        const finalExists = finalCheck.find(file => file.id === fileId);
        
        if (finalExists) {
          console.error(`강제 삭제도 실패: ${fileId}`);
          return false;
        }
      }

      console.log(`파일 완전 삭제 완료: ${fileId}`);
      console.log(`프로젝트 ${projectId}의 남은 파일 수: ${updatedFiles.length}`);

      // 7. 이벤트 발생
      window.dispatchEvent(new CustomEvent('projectFilesUpdated', {
        detail: { projectId, fileId, action: 'deleted', complete: true }
      }));

      return true;
    } catch (error) {
      console.error('파일 완전 삭제 실패:', error);
      return false;
    }
  }

  // 특정 파일 추가
  addFile(projectId: string, file: ProjectFile): boolean {
    try {
      const files = this.getProjectFiles(projectId);

      // 중복 파일 확인
      const existingFileIndex = files.findIndex(f => f.id === file.id);
      let updatedFiles: ProjectFile[];

      if (existingFileIndex >= 0) {
        // 기존 파일 업데이트
        updatedFiles = [...files];
        updatedFiles[existingFileIndex] = file;
        console.log(`파일 ${file.name} 업데이트됨 (ID: ${file.id})`);
      } else {
        // 새 파일 추가
        updatedFiles = [...files, file];
        console.log(`파일 ${file.name} 추가됨 (ID: ${file.id})`);
      }

      this.saveProjectFiles(projectId, updatedFiles);
      console.log(`프로젝트 ${projectId}의 총 파일 수: ${updatedFiles.length}`);

      // 즉시 이벤트 발생
      window.dispatchEvent(new CustomEvent('projectFilesUpdated', {
        detail: { projectId, fileId: file.id, action: 'added' }
      }));

      return true;
    } catch (error) {
      console.error('파일 추가 실패:', error);
      return false;
    }
  }

  // 파일 업데이트
  updateFile(projectId: string, fileId: string, updates: Partial<ProjectFile>): void {
    try {
      const files = this.getProjectFiles(projectId);
      const updatedFiles = files.map(file =>
        file.id === fileId ? { ...file, ...updates } : file
      );
      this.saveProjectFiles(projectId, updatedFiles);
      console.log(`파일 ${fileId} 업데이트됨`);
    } catch (error) {
      console.error('파일 업데이트 실패:', error);
    }
  }

  // 프로젝트 파일 전체 삭제
  removeProjectFiles(projectId: string): void {
    try {
      const storageData = this.getAllProjectFiles();
      delete storageData[projectId];
      localStorage.setItem(this.storageKey, JSON.stringify(storageData));
      console.log(`프로젝트 ${projectId}의 모든 파일 삭제됨`);
    } catch (error) {
      console.error('프로젝트 파일 삭제 실패:', error);
    }
  }

  // 삭제된 파일 백업
  private backupDeletedFile(projectId: string, file: ProjectFile): void {
    try {
      const backupData = this.getDeletedFilesBackup();
      const backupKey = `${projectId}_${file.id}`;
      
      backupData[backupKey] = {
        projectId,
        file,
        deletedAt: new Date().toISOString(),
        canRestore: true
      };
      
      localStorage.setItem(this.deletedFilesKey, JSON.stringify(backupData));
      console.log(`파일 백업 완료: ${file.name} (${file.id})`);
    } catch (error) {
      console.error('파일 백업 실패:', error);
    }
  }

  // 삭제된 파일 복구
  restoreDeletedFile(projectId: string, fileId: string): boolean {
    try {
      const backupData = this.getDeletedFilesBackup();
      const backupKey = `${projectId}_${fileId}`;
      const backup = backupData[backupKey];

      if (!backup || !backup.canRestore) {
        console.warn(`복구할 파일을 찾을 수 없음: ${fileId}`);
        return false;
      }

      // 파일 복구
      const currentFiles = this.getProjectFiles(projectId);
      const updatedFiles = [...currentFiles, backup.file];

      // 저장소 업데이트
      const storageData = this.getAllProjectFiles();
      storageData[projectId] = {
        projectId,
        files: updatedFiles,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(storageData));

      // 백업에서 제거
      delete backupData[backupKey];
      localStorage.setItem(this.deletedFilesKey, JSON.stringify(backupData));

      console.log(`파일 복구 완료: ${backup.file.name} (${fileId})`);

      // 이벤트 발생
      window.dispatchEvent(new CustomEvent('projectFilesUpdated', {
        detail: { projectId, fileId, action: 'restored', complete: true }
      }));

      return true;
    } catch (error) {
      console.error('파일 복구 실패:', error);
      return false;
    }
  }

  // 삭제된 파일 목록 가져오기
  getDeletedFiles(projectId?: string): Array<{ projectId: string; file: ProjectFile; deletedAt: string; canRestore: boolean }> {
    try {
      const backupData = this.getDeletedFilesBackup();
      const deletedFiles = Object.values(backupData);
      
      if (projectId) {
        return deletedFiles.filter(item => item.projectId === projectId);
      }
      
      return deletedFiles;
    } catch (error) {
      console.error('삭제된 파일 목록 불러오기 실패:', error);
      return [];
    }
  }

  // 백업 데이터 가져오기
  private getDeletedFilesBackup(): Record<string, { projectId: string; file: ProjectFile; deletedAt: string; canRestore: boolean }> {
    try {
      const data = localStorage.getItem(this.deletedFilesKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('삭제된 파일 백업 데이터 불러오기 실패:', error);
      return {};
    }
  }

  // 모든 프로젝트 파일 데이터 가져오기
  private getAllProjectFiles(): Record<string, FileStorageData> {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('저장된 파일 데이터 불러오기 실패:', error);
      return {};
    }
  }

  // 저장된 모든 프로젝트 ID 목록
  getAllProjectIds(): string[] {
    const storageData = this.getAllProjectFiles();
    return Object.keys(storageData);
  }

  // 저장소 정리 (오래된 데이터 삭제)
  cleanup(): void {
    try {
      const storageData = this.getAllProjectFiles();
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const cleanedData: Record<string, FileStorageData> = {};

      Object.entries(storageData).forEach(([projectId, data]) => {
        const lastUpdated = new Date(data.lastUpdated);
        if (lastUpdated > oneWeekAgo) {
          cleanedData[projectId] = data;
        }
      });

      localStorage.setItem(this.storageKey, JSON.stringify(cleanedData));
      console.log('오래된 파일 데이터 정리 완료');
    } catch (error) {
      console.error('저장소 정리 실패:', error);
    }
  }

  // 저장소 통계
  getStorageStats(): { totalProjects: number; totalFiles: number; totalSize: number } {
    const storageData = this.getAllProjectFiles();
    let totalFiles = 0;
    let totalSize = 0;

    Object.values(storageData).forEach(data => {
      totalFiles += data.files.length;
      data.files.forEach(file => {
        totalSize += file.size || 0;
      });
    });

    return {
      totalProjects: Object.keys(storageData).length,
      totalFiles,
      totalSize
    };
  }
}

export default FileStorageService;
