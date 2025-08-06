import { ProjectFile } from '../types/project';

export interface FileStorageData {
  projectId: string;
  files: ProjectFile[];
  lastUpdated: string;
}

class FileStorageService {
  private static instance: FileStorageService;
  private storageKey = 'project_files_storage';

  private constructor() { }

  static getInstance(): FileStorageService {
    if (!FileStorageService.instance) {
      FileStorageService.instance = new FileStorageService();
    }
    return FileStorageService.instance;
  }

  // 프로젝트별 파일 저장
  saveProjectFiles(projectId: string, files: ProjectFile[]): void {
    try {
      const storageData = this.getAllProjectFiles();
      storageData[projectId] = {
        projectId,
        files,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(this.storageKey, JSON.stringify(storageData));
      console.log(`프로젝트 ${projectId}의 파일 ${files.length}개 저장됨`);
    } catch (error) {
      console.error('파일 저장 실패:', error);
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

  // 특정 파일 추가
  addFile(projectId: string, file: ProjectFile): void {
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
    } catch (error) {
      console.error('파일 추가 실패:', error);
    }
  }

  // 특정 파일 삭제
  removeFile(projectId: string, fileId: string): void {
    try {
      const files = this.getProjectFiles(projectId);
      const fileToDelete = files.find(file => file.id === fileId);

      if (fileToDelete) {
        const updatedFiles = files.filter(file => file.id !== fileId);
        this.saveProjectFiles(projectId, updatedFiles);
        console.log(`파일 ${fileToDelete.name} (${fileId}) 삭제됨`);
        console.log(`프로젝트 ${projectId}의 남은 파일 수: ${updatedFiles.length}`);
      } else {
        console.log(`파일 ${fileId}를 찾을 수 없음`);
      }
    } catch (error) {
      console.error('파일 삭제 실패:', error);
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
