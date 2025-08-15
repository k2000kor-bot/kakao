import React, { useState } from 'react';

interface Project {
  id: string;
  name: string;
  fileCount: number;
  lastModified: string;
}

interface ProjectFile {
  id: string;
  name: string;
  type: 'document' | 'spreadsheet' | 'image' | 'other';
  size: string;
  lastModified: string;
}

interface Guideline {
  id: string;
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
}

interface ConversationSummary {
  id: string;
  type: 'summary' | 'analysis' | 'response';
  content: string;
  timestamp: string;
}

interface ProjectManagementProps {
  isOpen?: boolean;
  onClose: () => void;
}

const ProjectManagement: React.FC<ProjectManagementProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'files' | 'guidelines' | 'summaries'>('projects');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [message, setMessage] = useState('');
  const [showFileModal, setShowFileModal] = useState(false);
  const [showGuidelineModal, setShowGuidelineModal] = useState(false);

  // Mock data
  const projects: Project[] = [
    { id: '1', name: '개포우성7차', fileCount: 20, lastModified: '2024-01-15' },
    { id: '2', name: '잠실우성_대화요약', fileCount: 15, lastModified: '2024-01-14' },
    { id: '3', name: '삼성홍보_반박자료', fileCount: 8, lastModified: '2024-01-13' },
    { id: '4', name: '분석_보고서', fileCount: 12, lastModified: '2024-01-12' }
  ];

  const projectFiles: ProjectFile[] = [
    { id: '1', name: '대화내용.txt', type: 'document', size: '2.3MB', lastModified: '2024-01-15' },
    { id: '2', name: '분석결과.xlsx', type: 'spreadsheet', size: '1.8MB', lastModified: '2024-01-14' },
    { id: '3', name: '차트.png', type: 'image', size: '0.5MB', lastModified: '2024-01-13' },
    { id: '4', name: '보고서.pdf', type: 'document', size: '3.1MB', lastModified: '2024-01-12' }
  ];

  const guidelines: Guideline[] = [
    { id: '1', title: '글쓰기 지침', content: '명확하고 간결한 문장 사용', priority: 'high' },
    { id: '2', title: '분석 지침', content: '데이터 기반 객관적 분석', priority: 'medium' },
    { id: '3', title: '인용 지침', content: '출처 명시 및 적절한 인용', priority: 'high' }
  ];

  const summaries: ConversationSummary[] = [
    { id: '1', type: 'summary', content: '개포우성 7차 재건축 프로젝트 주요 논의사항', timestamp: '2024-01-15' },
    { id: '2', type: 'analysis', content: '삼성물산 vs GS건설 비교 분석 결과', timestamp: '2024-01-14' },
    { id: '3', type: 'response', content: '조합원 문의사항에 대한 답변', timestamp: '2024-01-13' }
  ];

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setActiveTab('files');
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      // 메시지 전송 로직
      console.log('메시지 전송:', message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <div className="w-4 h-4 bg-blue-500 rounded"></div>;
      case 'spreadsheet':
        return <div className="w-4 h-4 bg-green-500 rounded"></div>;
      case 'image':
        return <div className="w-4 h-4 bg-purple-500 rounded"></div>;
      default:
        return <div className="w-4 h-4 bg-gray-500 rounded"></div>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (selectedProject) {
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <div className="w-5 h-5 bg-gray-500 rounded"></div>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <h2 className="text-lg font-semibold">{selectedProject.name}</h2>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                분석
              </button>
              <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                내보내기
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 mt-16 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6">
              {[
                { id: 'files', label: '파일', count: projectFiles.length },
                { id: 'guidelines', label: '지침', count: guidelines.length },
                { id: 'summaries', label: '요약', count: summaries.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm">
              {activeTab === 'files' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">프로젝트 파일</h3>
                    <button
                      onClick={() => setShowFileModal(true)}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      파일 추가
                    </button>
                  </div>
                  <div className="space-y-3">
                    {projectFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getFileTypeIcon(file.type)}
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-500">{file.size} • {file.lastModified}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-sm text-blue-600 hover:text-blue-800">다운로드</button>
                          <button className="text-sm text-red-600 hover:text-red-800">삭제</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'guidelines' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">작업 지침</h3>
                    <button
                      onClick={() => setShowGuidelineModal(true)}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      지침 추가
                    </button>
                  </div>
                  <div className="space-y-3">
                    {guidelines.map((guideline) => (
                      <div key={guideline.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{guideline.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(guideline.priority)}`}>
                            {guideline.priority === 'high' ? '높음' : guideline.priority === 'medium' ? '보통' : '낮음'}
                          </span>
                        </div>
                        <p className="text-gray-600">{guideline.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'summaries' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">대화 요약</h3>
                  <div className="space-y-3">
                    {summaries.map((summary) => (
                      <div key={summary.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">
                            {summary.type === 'summary' ? '요약' : summary.type === 'analysis' ? '분석' : '응답'}
                          </h4>
                          <span className="text-sm text-gray-500">{summary.timestamp}</span>
                        </div>
                        <p className="text-gray-600">{summary.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto flex items-center space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="프로젝트에 대해 질문하세요..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              전송
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        {/* Top Section */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded"></div>
            <span className="font-semibold">CORBU.AI</span>
          </div>
          <div className="flex space-x-2">
            <div className="w-6 h-6 bg-gray-600 rounded"></div>
            <div className="w-6 h-6 bg-gray-600 rounded"></div>
            <div className="w-6 h-6 bg-gray-600 rounded"></div>
            <div className="w-6 h-6 bg-gray-600 rounded"></div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 p-4 space-y-4">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <span>새 채팅</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <span>채팅 검색</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <span>라이브러리</span>
          </div>

          <div className="space-y-2 text-sm">
            <div>Codex</div>
            <div>Sora</div>
            <div>GPT</div>
            <div>챗</div>
          </div>

          {/* Project Section */}
          <div className="pt-4">
            <div className="flex items-center space-x-3 text-sm mb-4">
              <div className="w-4 h-4 bg-gray-600 rounded"></div>
              <span>새 프로젝트</span>
            </div>
            <div className="flex items-center space-x-3 text-sm mb-4">
              <div className="w-4 h-4 bg-gray-600 rounded"></div>
              <span>바이럴</span>
            </div>

            {/* Project List */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>채팅방 논의 요약</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>행복한소유 개포우성7차 요약</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>삼성 홍보 반박</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>70대 조합원 반박글</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>DA 설계 의견 요청</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom User Info */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
            <div>
              <div className="text-sm font-medium">KIM HOBUM</div>
              <div className="text-xs text-gray-400">Premium</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">프로젝트 관리</h1>
            <p className="text-gray-600">프로젝트와 파일을 관리하고 분석 결과를 확인하세요</p>
          </div>

          {/* Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleProjectClick(project)}
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                  </div>
                  <span className="text-sm text-gray-500">{project.fileCount} 파일</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">수정일:</span>
                    <span className="text-gray-900">{project.lastModified}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">유형:</span>
                    <span className="text-gray-900">
                      {/* project.type === 'chat' ? '채팅' : project.type === 'analysis' ? '분석' : '문서' */}
                      {/* This line was removed as per the edit hint */}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-dashed border-gray-300 hover:border-blue-500 cursor-pointer transition-colors">
              <div className="text-center">
                <div className="w-8 h-8 bg-gray-400 rounded mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">새 프로젝트</h3>
                <p className="text-gray-600">새로운 프로젝트를 생성하세요</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectManagement; 