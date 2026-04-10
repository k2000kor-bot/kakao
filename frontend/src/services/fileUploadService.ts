// addNotification은 useNotifications 훅을 통해 사용해야 합니다

import {
  API_FORM_FIELD_FILE,
  API_SESSIONS_LIST_PATH,
  API_SESSION_SCOPED_FILE_ANALYSIS_SEGMENT,
  API_SESSION_SCOPED_FILES_SEGMENT,
  API_SESSION_UPLOAD_SEGMENT,
  joinApiHealthCheckUrl,
  resolveApiBaseUrl,
} from '../config/api';
import { errorLogger, toError } from '../utils/errorLogger';

export interface FileUploadResponse {
  success: boolean;
  file_id?: string;
  filename?: string;
  file_type?: string;
  file_size?: number;
  analysis?: unknown;
  error?: string;
}

export interface FileAnalysisResult {
  content_type: string;
  extracted_text?: string;
  summary?: string;
  keywords?: string[];
  sentiment?: string;
  confidence: number;
  processing_time: number;
}

class FileUploadService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = resolveApiBaseUrl();
  }

  /**
   * 파일 업로드
   */
  async uploadFile(sessionId: string, file: File): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append(API_FORM_FIELD_FILE, file);

      const response = await fetch(
        joinApiHealthCheckUrl(
          this.baseUrl,
          `${API_SESSIONS_LIST_PATH}/${encodeURIComponent(sessionId)}${API_SESSION_UPLOAD_SEGMENT}`,
        ),
        {
          method: 'POST',
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // 성공 알림은 컴포넌트에서 처리
        errorLogger.info('파일이 성공적으로 업로드되었습니다', {
          component: 'fileUploadService',
          action: 'uploadFile',
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          sessionId,
          fileId: result.file_id,
        });
      } else {
        // 실패 알림은 컴포넌트에서 처리
        errorLogger.error('파일 업로드 실패', new Error(result.error || '파일 업로드 중 오류가 발생했습니다.'), {
          component: 'fileUploadService',
          action: 'uploadFile',
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          sessionId,
          error: result.error,
        });
      }

      return result;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('파일 업로드 실패', err, {
        component: 'fileUploadService',
        action: 'uploadFile',
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        sessionId,
      });
      // 오류 알림은 컴포넌트에서 처리

      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  }

  /**
   * 다중 파일 업로드
   */
  async uploadMultipleFiles(sessionId: string, files: File[]): Promise<FileUploadResponse[]> {
    const uploadPromises = files.map(file => this.uploadFile(sessionId, file));
    return Promise.all(uploadPromises);
  }

  /**
   * 파일 분석 결과 조회
   */
  async getFileAnalysis(sessionId: string, fileId: string): Promise<FileAnalysisResult | null> {
    try {
      const response = await fetch(
        joinApiHealthCheckUrl(
          this.baseUrl,
          `${API_SESSIONS_LIST_PATH}/${encodeURIComponent(sessionId)}${API_SESSION_SCOPED_FILES_SEGMENT}/${encodeURIComponent(fileId)}${API_SESSION_SCOPED_FILE_ANALYSIS_SEGMENT}`,
        ),
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success ? result.analysis : null;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('파일 분석 조회 실패', err, {
        component: 'fileUploadService',
        action: 'getFileAnalysis',
        sessionId,
        fileId,
      });
      return null;
    }
  }

  /**
   * 업로드된 파일 목록 조회
   */
  async getUploadedFiles(sessionId: string): Promise<Record<string, unknown>[]> {
    try {
      const response = await fetch(
        joinApiHealthCheckUrl(
          this.baseUrl,
          `${API_SESSIONS_LIST_PATH}/${encodeURIComponent(sessionId)}${API_SESSION_SCOPED_FILES_SEGMENT}`,
        ),
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success ? result.files : [];
    } catch (error) {
      const err = toError(error);
      errorLogger.error('업로드된 파일 목록 조회 실패', err, {
        component: 'fileUploadService',
        action: 'getUploadedFiles',
        sessionId,
      });
      return [];
    }
  }

  /**
   * 파일 삭제
   */
  async deleteFile(sessionId: string, fileId: string): Promise<boolean> {
    try {
      const response = await fetch(
        joinApiHealthCheckUrl(
          this.baseUrl,
          `${API_SESSIONS_LIST_PATH}/${encodeURIComponent(sessionId)}${API_SESSION_SCOPED_FILES_SEGMENT}/${encodeURIComponent(fileId)}`,
        ),
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // 성공 알림은 컴포넌트에서 처리
        errorLogger.info('파일이 성공적으로 삭제되었습니다', {
          component: 'fileUploadService',
          action: 'deleteFile',
          sessionId,
          fileId,
        });
      } else {
        // 실패 알림은 컴포넌트에서 처리
        errorLogger.error('파일 삭제 실패', new Error(result.error || '파일 삭제 중 오류가 발생했습니다.'), {
          component: 'fileUploadService',
          action: 'deleteFile',
          sessionId,
          fileId,
          error: result.error,
        });
      }

      return result.success;
    } catch (error) {
      const err = toError(error);
      errorLogger.error('파일 삭제 실패', err, {
        component: 'fileUploadService',
        action: 'deleteFile',
        sessionId,
        fileId,
      });
      // 오류 알림은 컴포넌트에서 처리
      return false;
    }
  }

  /**
   * 파일 크기 포맷팅
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 파일 타입 검증
   */
  validateFileType(file: File): boolean {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
      'application/csv',
      'text/comma-separated-values',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    if (allowedTypes.includes(file.type)) return true;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'csv' && (!file.type || file.type === 'application/octet-stream')) {
      return true;
    }
    return false;
  }

  /**
   * 파일 크기 검증 (기본 10GB)
   */
  validateFileSize(file: File, maxSize: number = 10 * 1024 * 1024 * 1024): boolean {
    return file.size <= maxSize;
  }

  /**
   * 파일 업로드 진행률 시뮬레이션
   */
  simulateUploadProgress(
    onProgress: (progress: number) => void,
    duration: number = 2000
  ): Promise<void> {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve();
        }
        onProgress(progress);
      }, duration / 20);
    });
  }
}

const fileUploadService = new FileUploadService();
export default fileUploadService; 