import React, { useState, useEffect } from 'react';
import {
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import FileStorageService from '../services/fileStorageService';

interface FileStorageStatusProps {
  projectId: string;
}

const FileStorageStatus: React.FC<FileStorageStatusProps> = ({ projectId }) => {
  const [storageStats, setStorageStats] = useState({
    totalProjects: 0,
    totalFiles: 0,
    totalSize: 0
  });
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  const fileStorageService = FileStorageService.getInstance();

  useEffect(() => {
    updateStorageStats();
    const savedFiles = fileStorageService.getProjectFiles(projectId);
    if (savedFiles.length > 0) {
      const lastFile = savedFiles[savedFiles.length - 1];
      setLastSync(lastFile.uploadedAt);
    }

    // 업로드/삭제 이벤트 수신하여 즉시 새로고침
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { projectId?: string } | undefined;
      if (!detail || detail.projectId === projectId) {
        updateStorageStats();
      }
    };
    window.addEventListener('projectFilesUpdated', handler as EventListener);
    return () => window.removeEventListener('projectFilesUpdated', handler as EventListener);
  }, [projectId]);

  const updateStorageStats = () => {
    // 현재 프로젝트의 파일만 계산
    const projectFiles = fileStorageService.getProjectFiles(projectId);
    const projectTotalSize = projectFiles.reduce((total, file) => total + (file.size || 0), 0);

    setStorageStats({
      totalProjects: 1, // 현재 프로젝트만
      totalFiles: projectFiles.length,
      totalSize: projectTotalSize
    });
  };

  const handleSync = async () => {
    setSyncStatus('syncing');
    try {
      // 시뮬레이션된 동기화
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStorageStats();
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 2000);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <ClockIcon className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
      default:
        return <CloudArrowUpIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return '동기화 중...';
      case 'success':
        return '동기화 완료';
      case 'error':
        return '동기화 실패';
      default:
        return '저장됨';
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">파일 저장 상태</h3>
        <button
          onClick={handleSync}
          disabled={syncStatus === 'syncing'}
          className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50"
        >
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600">총 파일 수</p>
          <p className="font-medium text-gray-900">{storageStats.totalFiles}개</p>
        </div>
        <div>
          <p className="text-gray-600">총 크기</p>
          <p className="font-medium text-gray-900">{formatFileSize(storageStats.totalSize)}</p>
        </div>
      </div>

      {lastSync && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            마지막 동기화: {new Date(lastSync).toLocaleString()}
          </p>
        </div>
      )}

      <div className="mt-3 flex items-center space-x-2">
        <CloudArrowDownIcon className="w-4 h-4 text-green-500" />
        <span className="text-xs text-gray-600">
          로컬 저장소에 안전하게 저장됨
        </span>
      </div>
    </div>
  );
};

export default FileStorageStatus;
