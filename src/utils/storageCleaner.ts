/**
 * 로컬 스토리지 정리 유틸리티
 * 하드코딩된 파일 데이터를 제거하고 깨끗한 상태로 만듭니다.
 */

import { errorLogger } from './errorLogger';

export const cleanLocalStorage = () => {
  try {
    errorLogger.info('로컬 스토리지 정리 시작', { component: 'storageCleaner', action: 'cleanLocalStorage' });
    
    // 파일 저장소 키들
    const storageKeys = [
      'projectFiles',
      'fileStorage',
      'uploadedFiles',
      'fileAnalysisCache',
      'knowledgeBase',
      'writingMaterials',
      'attachedFiles',
      'selectedFiles',
      'fileList',
      'processedFiles'
    ];
    
    storageKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          
          // 하드코딩된 파일 제거
          if (typeof parsed === 'object') {
            if (Array.isArray(parsed)) {
              // 배열인 경우
              const cleaned = parsed.filter((item: any) => {
                if (item && typeof item === 'object') {
                  // 파일 이름이 하드코딩된 파일인지 확인
                  const fileName = item.name || item.filename || item.fileName || '';
                  if (fileName.includes('개포우성7차_제안서') || 
                      fileName.includes('래미안 루미원') ||
                      fileName.includes('Raemian') ||
                      fileName.includes('개포우성')) {
                    errorLogger.info('하드코딩된 파일 제거', { component: 'storageCleaner', action: 'cleanLocalStorage', fileName, key });
                    return false;
                  }
                }
                return true;
              });
              
              if (cleaned.length !== parsed.length) {
                localStorage.setItem(key, JSON.stringify(cleaned));
                errorLogger.info(`${key}: ${parsed.length - cleaned.length}개 파일 제거됨`, { component: 'storageCleaner', action: 'cleanLocalStorage', key, removedCount: parsed.length - cleaned.length });
              }
            } else {
              // 객체인 경우 (프로젝트별 파일 저장소)
              let hasChanges = false;
              Object.keys(parsed).forEach(projectId => {
                if (parsed[projectId] && parsed[projectId].files) {
                  const originalLength = parsed[projectId].files.length;
                  parsed[projectId].files = parsed[projectId].files.filter((file: any) => {
                    const fileName = file.name || file.filename || file.fileName || '';
                    if (fileName.includes('개포우성7차_제안서') || 
                        fileName.includes('래미안 루미원') ||
                        fileName.includes('Raemian') ||
                        fileName.includes('개포우성')) {
                      errorLogger.info('하드코딩된 파일 제거', { component: 'storageCleaner', action: 'cleanLocalStorage', fileName, key });
                      return false;
                    }
                    return true;
                  });
                  
                  if (parsed[projectId].files.length !== originalLength) {
                    hasChanges = true;
                      errorLogger.info(`프로젝트 ${projectId}: ${originalLength - parsed[projectId].files.length}개 파일 제거됨`, { component: 'storageCleaner', action: 'cleanLocalStorage', projectId, removedCount: originalLength - parsed[projectId].files.length });
                  }
                }
              });
              
              if (hasChanges) {
                localStorage.setItem(key, JSON.stringify(parsed));
              }
            }
          }
        } catch (parseError) {
          errorLogger.warn(`${key} 파싱 실패`, { component: 'storageCleaner', action: 'cleanLocalStorage', key, error: parseError instanceof Error ? parseError : new Error(String(parseError)) });
        }
      }
    });
    
    // 추가로 특정 키들 완전 삭제
    const keysToRemove = [
      'hardcodedFiles',
      'sampleFiles',
      'testFiles',
      'demoFiles',
      'exampleFiles'
    ];
    
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        errorLogger.info(`${key} 완전 삭제됨`, { component: 'storageCleaner', action: 'cleanLocalStorage', key });
      }
    });
    
    // 모든 localStorage 키를 확인하여 파일 관련 데이터 제거
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.toLowerCase().includes('file') || key.toLowerCase().includes('upload')) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            if (typeof parsed === 'object' && parsed !== null) {
              let hasChanges = false;
              
              if (Array.isArray(parsed)) {
                const originalLength = parsed.length;
                const cleaned = parsed.filter((item: any) => {
                  if (item && typeof item === 'object') {
                    const fileName = item.name || item.filename || item.fileName || '';
                    if (fileName.includes('개포우성7차_제안서') || 
                        fileName.includes('래미안 루미원') ||
                        fileName.includes('Raemian') ||
                        fileName.includes('개포우성')) {
                      errorLogger.info(`전역 검색에서 하드코딩된 파일 제거: ${fileName} (${key})`, { component: 'storageCleaner', action: 'cleanLocalStorage', fileName, key });
                      return false;
                    }
                  }
                  return true;
                });
                
                if (cleaned.length !== originalLength) {
                  localStorage.setItem(key, JSON.stringify(cleaned));
                  hasChanges = true;
                  errorLogger.info(`${key}: ${originalLength - cleaned.length}개 파일 제거됨`, { component: 'storageCleaner', action: 'cleanLocalStorage', key, removedCount: originalLength - cleaned.length });
                }
              }
              
              if (hasChanges) {
                errorLogger.info(`${key} 업데이트됨`, { component: 'storageCleaner', action: 'cleanLocalStorage', key });
              }
            }
          }
        } catch (error) {
          // 파싱 실패는 무시
        }
      }
    });
    
    errorLogger.info('로컬 스토리지 정리 완료', { component: 'storageCleaner', action: 'cleanLocalStorage' });
    return true;
  } catch (error) {
    errorLogger.error('로컬 스토리지 정리 중 오류', error instanceof Error ? error : new Error(String(error)), { component: 'storageCleaner', action: 'cleanLocalStorage' });
    return false;
  }
};

export const forceRefreshFileList = () => {
  try {
    // 파일 목록 관련 이벤트 강제 발생
    window.dispatchEvent(new CustomEvent('projectFilesUpdated', {
      detail: { force: true, clean: true }
    }));
    
    window.dispatchEvent(new CustomEvent('knowledgeBaseUpdated', {
      detail: { force: true, clean: true }
    }));
    
    window.dispatchEvent(new CustomEvent('writingMaterialsUpdated', {
      detail: { force: true, clean: true }
    }));
    
    errorLogger.info('파일 목록 강제 새로고침 이벤트 발생', { component: 'storageCleaner', action: 'forceRefreshFileList' });
    return true;
  } catch (error) {
    errorLogger.error('파일 목록 새로고침 중 오류', error instanceof Error ? error : new Error(String(error)), { component: 'storageCleaner', action: 'forceRefreshFileList' });
    return false;
  }
};

export const resetProjectData = () => {
  try {
    // 프로젝트 데이터 초기화
    const projectData = {
      id: '1',
      name: '개포우성7차',
      description: '개포우성7차 재건축 프로젝트',
      status: 'active',
      priority: 'high',
      createdAt: '2024-01-15',
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      files: [],
      guidelines: [],
      chats: [],
      analytics: {
        totalFiles: 0,
        totalMessages: 0,
        lastActivity: new Date().toISOString(),
        completionRate: 0,
        topTopics: []
      },
      settings: {
        maxFileSize: 10485760,
        allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
        autoBackup: true,
        notifications: true
      },
      archived: false,
      tags: ['재건축', '개포우성', '프로젝트']
    };
    
    localStorage.setItem('currentProject', JSON.stringify(projectData));
    errorLogger.info('프로젝트 데이터 초기화 완료', { component: 'storageCleaner', action: 'resetProjectData' });
    return true;
  } catch (error) {
    errorLogger.error('프로젝트 데이터 초기화 중 오류', error instanceof Error ? error : new Error(String(error)), { component: 'storageCleaner', action: 'resetProjectData' });
    return false;
  }
};
