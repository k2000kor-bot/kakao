import React, { useState } from 'react';
import { useCollaboration } from '../hooks/useCollaboration';

interface CollaborationPanelProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  projectId,
  isOpen,
  onClose
}) => {
  const {
    collaborationState,
    currentUser,
    startSharing,
    stopSharing,
    addCollaborator,
    removeCollaborator
  } = useCollaboration(projectId);

  const [newCollaboratorName, setNewCollaboratorName] = useState('');

  const handleStartSharing = async () => {
    try {
      await startSharing();
      alert('프로젝트 공유 URL이 클립보드에 복사되었습니다!');
    } catch (error) {
      alert('공유 시작에 실패했습니다.');
    }
  };

  const handleAddCollaborator = () => {
    if (newCollaboratorName.trim()) {
      addCollaborator({
        name: newCollaboratorName.trim(),
        avatar: '👤',
        status: 'online',
        lastActivity: new Date()
      });
      setNewCollaboratorName('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return '온라인';
      case 'away':
        return '자리비움';
      case 'offline':
        return '오프라인';
      default:
        return '알 수 없음';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">협업 관리</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="p-6 space-y-6">
          {/* 공유 상태 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">프로젝트 공유</h3>

            {collaborationState.isSharing ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 dark:text-green-400">🔗</span>
                    <span className="text-sm text-green-800 dark:text-green-200">공유 중</span>
                  </div>
                  <button
                    onClick={stopSharing}
                    className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    중지
                  </button>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">공유 URL:</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 break-all">
                    {collaborationState.shareUrl}
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleStartSharing}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                프로젝트 공유 시작
              </button>
            )}
          </div>

          {/* 협업자 목록 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">협업자</h3>

            {/* 현재 사용자 */}
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{currentUser.avatar}</span>
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {currentUser.name} (나)
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {getStatusText(currentUser.status)}
                  </p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(currentUser.status)}`}></div>
            </div>

            {/* 다른 협업자들 */}
            {collaborationState.collaborators.map((collaborator) => (
              <div key={collaborator.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{collaborator.avatar}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {collaborator.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getStatusText(collaborator.status)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(collaborator.status)}`}></div>
                  <button
                    onClick={() => removeCollaborator(collaborator.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                  >
                    제거
                  </button>
                </div>
              </div>
            ))}

            {/* 협업자 추가 */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">협업자 추가</h4>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCollaboratorName}
                  onChange={(e) => setNewCollaboratorName(e.target.value)}
                  placeholder="협업자 이름"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCollaborator()}
                />
                <button
                  onClick={handleAddCollaborator}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollaborationPanel;
