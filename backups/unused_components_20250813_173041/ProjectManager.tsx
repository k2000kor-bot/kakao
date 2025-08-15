import React, { useState } from 'react';
import { useNotifications } from '../context/AppContext';
import ProjectCreationModal from './ProjectCreationModal';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived' | 'completed';
  chatRooms: ChatRoom[];
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'general' | 'development' | 'planning' | 'qa';
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

interface ProjectManagerProps {
  onProjectSelect: (projectId: string) => void;
  onRoomSelect: (roomId: string) => void;
  selectedProjectId?: string;
  selectedRoomId?: string;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({
  onProjectSelect,
  onRoomSelect,
  selectedProjectId,
  selectedRoomId
}) => {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState<'general' | 'development' | 'planning' | 'qa'>('general');

  const { addNotification } = useNotifications();

  // 모의 프로젝트 데이터
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: '개포우성7차',
      description: '개포우성7차 아파트 개발 프로젝트',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T15:30:00Z',
      status: 'active',
      chatRooms: [
        {
          id: '1-1',
          name: '일반 채팅',
          type: 'general',
          unreadCount: 0,
          lastMessage: '프로젝트가 시작되었습니다.',
          lastMessageTime: '2024-01-15T10:00:00Z'
        },
        {
          id: '1-2',
          name: '개발팀',
          type: 'development',
          unreadCount: 3,
          lastMessage: 'API 개발 진행상황 업데이트',
          lastMessageTime: '2024-01-15T14:30:00Z'
        },
        {
          id: '1-3',
          name: '기획팀',
          type: 'planning',
          unreadCount: 0,
          lastMessage: '요구사항 분석 완료',
          lastMessageTime: '2024-01-15T12:00:00Z'
        },
        {
          id: '1-4',
          name: 'QA팀',
          type: 'qa',
          unreadCount: 1,
          lastMessage: '테스트 케이스 작성 중',
          lastMessageTime: '2024-01-15T13:45:00Z'
        }
      ]
    },
    {
      id: '2',
      name: '스마트시티 프로젝트',
      description: '스마트시티 인프라 구축 프로젝트',
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-15T11:20:00Z',
      status: 'active',
      chatRooms: [
        {
          id: '2-1',
          name: '일반 채팅',
          type: 'general',
          unreadCount: 0,
          lastMessage: '프로젝트 초기 설정 완료',
          lastMessageTime: '2024-01-10T09:00:00Z'
        }
      ]
    }
  ]);

  const [showCreateProject, setShowCreateProject] = useState(false);

  const handleProjectCreated = (newProject: Project) => {
    setProjects(prev => [...prev, newProject]);
  };

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) {
      addNotification({
        type: 'error',
        title: '채팅방 생성 실패',
        message: '채팅방 이름을 입력해주세요.'
      });
      return;
    }

    if (!selectedProjectId) {
      addNotification({
        type: 'error',
        title: '채팅방 생성 실패',
        message: '프로젝트를 먼저 선택해주세요.'
      });
      return;
    }

    const newRoom: ChatRoom = {
      id: `${selectedProjectId}-${Date.now()}`,
      name: newRoomName,
      type: newRoomType,
      unreadCount: 0,
      lastMessage: '새로운 채팅방이 생성되었습니다.',
      lastMessageTime: new Date().toISOString()
    };

    setProjects(prev => prev.map(project =>
      project.id === selectedProjectId
        ? { ...project, chatRooms: [...project.chatRooms, newRoom] }
        : project
    ));

    setNewRoomName('');
    setNewRoomType('general');
    setShowCreateRoom(false);

    addNotification({
      type: 'success',
      title: '채팅방 생성 완료',
      message: `${newRoom.name} 채팅방이 성공적으로 생성되었습니다.`
    });
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="project-manager bg-white rounded-lg shadow-lg">
      {/* 프로젝트 목록 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">프로젝트</h2>
          <button
            onClick={() => setShowCreateProject(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            새 프로젝트
          </button>
        </div>

        <div className="space-y-2">
          {projects.map(project => (
            <div
              key={project.id}
              onClick={() => onProjectSelect(project.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedProjectId === project.id
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50 border border-transparent'
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500">{project.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${project.status === 'active' ? 'bg-green-100 text-green-800' :
                    project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                  }`}>
                  {project.status === 'active' ? '진행중' :
                    project.status === 'completed' ? '완료' : '보관'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 선택된 프로젝트의 채팅방 목록 */}
      {selectedProject && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedProject.name} - 채팅방
            </h3>
            <button
              onClick={() => setShowCreateRoom(true)}
              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              새 채팅방
            </button>
          </div>

          <div className="space-y-2">
            {selectedProject.chatRooms.map(room => (
              <div
                key={room.id}
                onClick={() => onRoomSelect(room.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedRoomId === room.id
                    ? 'bg-green-50 border border-green-200'
                    : 'hover:bg-gray-50 border border-transparent'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{room.name}</h4>
                    {room.lastMessage && (
                      <p className="text-sm text-gray-500 truncate">
                        {room.lastMessage}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {room.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full">
                        {room.unreadCount}
                      </span>
                    )}
                    {room.lastMessageTime && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(room.lastMessageTime).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 새 프로젝트 생성 모달 */}
      <ProjectCreationModal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onProjectCreated={handleProjectCreated}
      />

      {/* 새 채팅방 생성 모달 */}
      {showCreateRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">새 채팅방 생성</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  채팅방 이름 *
                </label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="채팅방 이름을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  채팅방 유형
                </label>
                <select
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="채팅방 유형 선택"
                >
                  <option value="general">일반</option>
                  <option value="development">개발</option>
                  <option value="planning">기획</option>
                  <option value="qa">QA</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateRoom}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                생성
              </button>
              <button
                onClick={() => setShowCreateRoom(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager; 