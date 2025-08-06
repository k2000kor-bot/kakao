import React, { useState } from 'react';
import { useNotifications } from '../context/AppContext';

interface MediaFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  category?: string;
  tags?: string[];
  confidence?: number;
  summary?: string;
}

interface ProjectInfo {
  id: string;
  name: string;
  description: string;
  mediaFiles: MediaFile[];
  guidelines: string;
  createdAt: string;
}

interface ProjectInfoPopupProps {
  project: ProjectInfo;
  isOpen: boolean;
  onClose: () => void;
}

const ProjectInfoPopup: React.FC<ProjectInfoPopupProps> = ({
  project,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'files' | 'guidelines'>('files');
  const { addNotification } = useNotifications();

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📈';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    return '📁';
  };

  const getCategoryName = (category?: string) => {
    const categories: { [key: string]: string } = {
      'document': '문서',
      'image': '이미지',
      'presentation': '프레젠테이션',
      'data': '데이터',
      'media': '미디어'
    };
    return categories[category || ''] || '기타';
  };

  const getCategoryColor = (category?: string) => {
    const colors: { [key: string]: string } = {
      'document': 'bg-blue-100 text-blue-800',
      'image': 'bg-green-100 text-green-800',
      'presentation': 'bg-purple-100 text-purple-800',
      'data': 'bg-orange-100 text-orange-800',
      'media': 'bg-pink-100 text-pink-800'
    };
    return colors[category || ''] || 'bg-gray-100 text-gray-800';
  };

  const handleFileDownload = (file: MediaFile) => {
    // 모의 다운로드
    addNotification({
      type: 'success',
      title: '파일 다운로드',
      message: `${file.name} 파일을 다운로드합니다.`
    });
  };

  const handleFilePreview = (file: MediaFile) => {
    // 모의 미리보기
    addNotification({
      type: 'info',
      title: '파일 미리보기',
      message: `${file.name} 파일을 미리보기합니다.`
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📁</div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
                <p className="text-sm text-gray-500">{project.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="프로젝트 정보 팝업 닫기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('files')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'files'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📁 프로젝트 파일 ({project.mediaFiles.length})
            </button>
            <button
              onClick={() => setActiveTab('guidelines')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'guidelines'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📋 프로젝트 지침
            </button>
          </div>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="p-6">
          {activeTab === 'files' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">프로젝트 파일</h3>
                <span className="text-sm text-gray-500">
                  {project.mediaFiles.length}개 파일
                </span>
              </div>

              {project.mediaFiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.mediaFiles.map((file) => (
                    <div
                      key={file.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{getFileIcon(file.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 truncate">
                              {file.name}
                            </h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(file.category)}`}>
                              {getCategoryName(file.category)}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 mb-2">
                            <span className="text-sm text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                            {file.confidence && (
                              <span className="text-sm text-gray-500">
                                신뢰도: {(file.confidence * 100).toFixed(1)}%
                              </span>
                            )}
                          </div>

                          {file.tags && file.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {file.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {file.summary && (
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-3">
                              {file.summary}
                            </p>
                          )}

                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleFilePreview(file)}
                              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                            >
                              미리보기
                            </button>
                            <button
                              onClick={() => handleFileDownload(file)}
                              className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                            >
                              다운로드
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📁</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">파일이 없습니다</h3>
                  <p className="text-gray-500">프로젝트에 업로드된 파일이 없습니다.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'guidelines' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">프로젝트 지침</h3>
                <span className="text-sm text-gray-500">
                  {new Date(project.createdAt).toLocaleDateString('ko-KR')} 생성
                </span>
              </div>

              {project.guidelines ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                      {project.guidelines}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">지침이 없습니다</h3>
                  <p className="text-gray-500">프로젝트 지침이 설정되지 않았습니다.</p>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 지침 활용 방법</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 프로젝트 진행 시 지침을 참고하여 일관성 유지</li>
                  <li>• 팀원들과 지침을 공유하여 업무 표준화</li>
                  <li>• 정기적으로 지침을 업데이트하여 최신 상태 유지</li>
                  <li>• 지침을 기반으로 한 의사결정 프로세스 활용</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoPopup; 