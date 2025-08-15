import React, { useState, useEffect, useRef } from 'react';
import './ProjectChatSystem.css';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastActivity: string;
  messageCount: number;
}

interface ChatMessage {
  id: string;
  projectId: string;
  content: string;
  sender: string;
  timestamp: string;
  type: 'question' | 'answer' | 'system' | 'file' | 'image';
  isUser: boolean;
  replyTo?: string;
  attachments?: Array<{
    id: string;
    name: string;
    type: 'image' | 'file' | 'document';
    url: string;
  }>;
}

interface ProjectChatSystemProps {
  onMessageSend: (projectId: string, message: string, type: 'question' | 'answer') => void;
  onProjectCreate: (projectName: string, description: string) => void;
  onProjectSelect: (projectId: string) => void;
}

const ProjectChatSystem: React.FC<ProjectChatSystemProps> = ({
  onMessageSend,
  onProjectCreate,
  onProjectSelect
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [messageType, setMessageType] = useState<'question' | 'answer'>('question');
  const [showProjectCreator, setShowProjectCreator] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 프로젝트 생성
  const handleCreateProject = () => {
    if (newProjectName.trim() && newProjectDescription.trim()) {
      const project: Project = {
        id: Date.now().toString(),
        name: newProjectName,
        description: newProjectDescription,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        messageCount: 0
      };
      
      setProjects(prev => [...prev, project]);
      setSelectedProject(project);
      setShowProjectCreator(false);
      setNewProjectName('');
      setNewProjectDescription('');
      
      onProjectCreate(newProjectName, newProjectDescription);
    }
  };

  // 메시지 전송
  const handleSendMessage = () => {
    if (!inputValue.trim() || !selectedProject) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      projectId: selectedProject.id,
      content: inputValue.trim(),
      sender: messageType === 'question' ? '사용자' : 'AI 어시스턴트',
      timestamp: new Date().toISOString(),
      type: messageType,
      isUser: messageType === 'question'
    };

    setMessages(prev => [...prev, message]);
    setInputValue('');
    
    // 프로젝트 마지막 활동 업데이트
    setProjects(prev => prev.map(p => 
      p.id === selectedProject.id 
        ? { ...p, lastActivity: new Date().toISOString(), messageCount: p.messageCount + 1 }
        : p
    ));

    onMessageSend(selectedProject.id, inputValue.trim(), messageType);
    
    // AI 응답 시뮬레이션 (실제로는 API 호출)
    if (messageType === 'question') {
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          projectId: selectedProject.id,
          content: `질문에 대한 AI 응답: "${inputValue.trim()}"에 대한 답변입니다.`,
          sender: 'AI 어시스턴트',
          timestamp: new Date().toISOString(),
          type: 'answer',
          isUser: false
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  // 키보드 이벤트
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 프로젝트 선택
  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    onProjectSelect(project.id);
    // 해당 프로젝트의 메시지 로드 (실제로는 API 호출)
    setMessages([]);
  };

  // 메시지 타입 토글
  const toggleMessageType = () => {
    setMessageType(prev => prev === 'question' ? 'answer' : 'question');
  };

  return (
    <div className="project-chat-system">
      {/* 프로젝트 사이드바 */}
      <div className="project-sidebar">
        <div className="sidebar-header">
          <h3>프로젝트</h3>
          <button
            className="create-project-btn"
            onClick={() => setShowProjectCreator(true)}
            title="새 프로젝트 생성"
          >
            ➕
          </button>
        </div>

        <div className="project-list">
          {projects.map(project => (
            <div
              key={project.id}
              className={`project-item ${selectedProject?.id === project.id ? 'selected' : ''}`}
              onClick={() => handleProjectSelect(project)}
            >
              <div className="project-info">
                <h4 className="project-name">{project.name}</h4>
                <p className="project-description">{project.description}</p>
                <div className="project-meta">
                  <span className="message-count">{project.messageCount}개 메시지</span>
                  <span className="last-activity">
                    {new Date(project.lastActivity).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 메인 채팅 영역 */}
      <div className="chat-main">
        {selectedProject ? (
          <>
            {/* 채팅 헤더 */}
            <div className="chat-header">
              <div className="project-header">
                <h2>{selectedProject.name}</h2>
                <p>{selectedProject.description}</p>
              </div>
              <div className="chat-controls">
                <button
                  className={`message-type-btn ${messageType === 'question' ? 'active' : ''}`}
                  onClick={() => setMessageType('question')}
                >
                  질문
                </button>
                <button
                  className={`message-type-btn ${messageType === 'answer' ? 'active' : ''}`}
                  onClick={() => setMessageType('answer')}
                >
                  답변
                </button>
              </div>
            </div>

            {/* 메시지 영역 */}
            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💬</div>
                  <h3>대화를 시작하세요</h3>
                  <p>질문이나 답변을 입력하여 프로젝트를 진행하세요.</p>
                </div>
              ) : (
                <div className="messages-timeline">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`message-item ${message.isUser ? 'user-message' : 'ai-message'}`}
                    >
                      <div className="message-header">
                        <span className="message-sender">{message.sender}</span>
                        <span className="message-time">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="message-content">
                        <div className={`message-bubble ${message.type}`}>
                          {message.content}
                        </div>
                      </div>
                      {index < messages.length - 1 && (
                        <div className="message-connector">
                          <div className="connector-line"></div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* 입력 영역 */}
            <div className="input-area">
              <div className="input-container">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`${messageType === 'question' ? '질문' : '답변'}을 입력하세요...`}
                  className="message-input"
                  rows={1}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="send-btn"
                >
                  전송
                </button>
              </div>
              <div className="input-footer">
                <span className="message-type-indicator">
                  현재 모드: {messageType === 'question' ? '질문' : '답변'}
                </span>
                <button
                  onClick={toggleMessageType}
                  className="toggle-type-btn"
                >
                  모드 변경
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="no-project-selected">
            <div className="empty-icon">📁</div>
            <h3>프로젝트를 선택하세요</h3>
            <p>왼쪽에서 프로젝트를 선택하거나 새 프로젝트를 생성하세요.</p>
          </div>
        )}
      </div>

      {/* 프로젝트 생성 모달 */}
      {showProjectCreator && (
        <div className="modal-overlay">
          <div className="project-creator-modal">
            <h3>새 프로젝트 생성</h3>
            <div className="form-group">
              <label>프로젝트 이름</label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="프로젝트 이름을 입력하세요"
                className="project-name-input"
              />
            </div>
            <div className="form-group">
              <label>프로젝트 설명</label>
              <textarea
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="프로젝트에 대한 설명을 입력하세요"
                className="project-description-input"
                rows={3}
              />
            </div>
            <div className="modal-actions">
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || !newProjectDescription.trim()}
                className="create-btn"
              >
                프로젝트 생성
              </button>
              <button
                onClick={() => setShowProjectCreator(false)}
                className="cancel-btn"
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

export default ProjectChatSystem; 