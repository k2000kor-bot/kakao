import React, { useState } from 'react';


interface ProjectFile {
  id: string;
  name: string;
  type: 'document' | 'spreadsheet' | 'image' | 'video' | 'audio' | 'pdf';
  size: string;
  uploadedAt: Date;
  description?: string;
  tags?: string[];
  isPinned?: boolean;
  updatedAt?: Date;
}

interface ProjectGuideline {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  status?: 'active' | 'archived' | 'draft';
}

interface ProjectChat {
  id: string;
  title: string;
  lastMessage: string;
  participants: string[];
  status: 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  keyPoints?: string[];
  isPinned?: boolean;
}

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
    description: string;
  } | null;
  onChatSelect: (chatId: string, chatTitle: string) => void;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  isOpen,
  onClose,
  project,
  onChatSelect
}) => {
  const [activeTab, setActiveTab] = useState<'files' | 'guidelines' | 'chats'>('files');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');

  // 실제 프로젝트 데이터
  const projectFiles: ProjectFile[] = [
    {
      id: '1',
      name: '[인증] 행복한소유☆개포우성7차.txt',
      type: 'document',
      size: '2.3MB',
      uploadedAt: new Date('2025-01-20'),
      description: '개포우성7차 실명방 대화 내용',
      tags: ['대화', '요약', '인증'],
      isPinned: true
    },
    {
      id: '2',
      name: '도시 및 주거환경정비법 시행규칙.pdf',
      type: 'pdf',
      size: '1.8MB',
      uploadedAt: new Date('2025-01-19'),
      description: '국토교통부 시행규칙',
      tags: ['법규', '정비법'],
      isPinned: false
    },
    {
      id: '3',
      name: '250727_개포우성7_전단_삼성설계오류.pdf',
      type: 'pdf',
      size: '3.1MB',
      uploadedAt: new Date('2025-01-18'),
      description: '삼성물산 설계 오류 관련 전단',
      tags: ['설계', '삼성', '오류'],
      isPinned: true
    },
    {
      id: '4',
      name: '개포우성7차 재건축 설계안.xlsx',
      type: 'spreadsheet',
      size: '4.2MB',
      uploadedAt: new Date('2025-01-17'),
      description: '재건축 설계안 상세 자료',
      tags: ['설계안', '재건축'],
      isPinned: false
    }
  ];

  const projectGuidelines: ProjectGuideline[] = [
    {
      id: '1',
      title: '금리 및 보증 조건',
      content: `- 대우 금리: cd금리+0% (약 2.5%)
- 삼성 금리: 회사자체보증 시 cd금리+0.3% (약 2.8%)
- GS 금리: cd금리+0.2% (약 2.7%)
- 보증료: 대우 0.5%, 삼성 0.3%, GS 0.4%`,
      category: '금융',
      priority: 'high',
      createdAt: new Date('2025-01-15'),
      updatedAt: new Date('2025-01-20'),
      isActive: true
    },
    {
      id: '2',
      title: '시공사 평가 기준',
      content: `1. 설계안 품질 (40%)
2. 공사비 경쟁력 (30%)
3. 시공 실적 및 경험 (20%)
4. 기술력 및 안정성 (10%)`,
      category: '평가',
      priority: 'high',
      createdAt: new Date('2025-01-14'),
      updatedAt: new Date('2025-01-19'),
      isActive: true
    },
    {
      id: '3',
      title: '홍보 활동 제한사항',
      content: `- 개별 홍보 활동 금지
- 조합원 집 방문 금지
- 허위 정보 유포 금지
- 부당한 이익 제공 금지`,
      category: '규정',
      priority: 'medium',
      createdAt: new Date('2025-01-13'),
      updatedAt: new Date('2025-01-18'),
      isActive: true
    }
  ];

  const projectChats: ProjectChat[] = [
    {
      id: '1',
      title: '개포우성 0000대화 요약',
      lastMessage: '시공사 홍보 문제 관련 논의 요약',
      participants: ['이재헌', '박재우', '박은진', '정지혜'],
      status: 'active',
      createdAt: new Date('2025-01-20'),
      updatedAt: new Date('2025-01-20'),
      keyPoints: ['시공사 평가 기준', '설명회 기대사항', '공사비 관련 견해'],
      isPinned: true
    },
    {
      id: '2',
      title: '행복한소유 개포우성7차 요약',
      lastMessage: '발언자 실제 닉네임으로 요약 완료',
      participants: ['행복한소유', '관리자'],
      status: 'completed',
      createdAt: new Date('2025-01-19'),
      updatedAt: new Date('2025-01-19'),
      keyPoints: ['대화 내용 요약', '발언자별 정리']
    },
    {
      id: '3',
      title: '삼성 홍보 반박',
      lastMessage: '삼성 홍보 활동에 대한 반박 메시지 생성',
      participants: ['관리자'],
      status: 'active',
      createdAt: new Date('2025-01-18'),
      updatedAt: new Date('2025-01-18'),
      keyPoints: ['홍보 반박', '메시지 생성']
    },
    {
      id: '4',
      title: '70대 조합원 반박글',
      lastMessage: '카드뉴스 형식 반박글 생성 완료',
      participants: ['관리자'],
      status: 'completed',
      createdAt: new Date('2025-01-17'),
      updatedAt: new Date('2025-01-17'),
      keyPoints: ['반박글', '카드뉴스']
    }
  ];

  // 날짜 포맷팅 함수
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // 파일 아이콘 가져오기
  const getFileIcon = (type: string): string => {
    switch (type) {
      case 'document':
        return '📄';
      case 'spreadsheet':
        return '📊';
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'audio':
        return '🎵';
      case 'pdf':
        return '📕';
      case 'presentation':
        return '📽️';
      default:
        return '📁';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🟢';
      case 'completed': return '✅';
      case 'archived': return '📁';
      default: return '⚪';
    }
  };

  const handleNewChat = () => {
    if (newChatTitle.trim()) {
      console.log('새 채팅 생성:', newChatTitle);
      setNewChatTitle('');
      setShowNewChatModal(false);
    }
  };

  const handleChatSelect = (chat: ProjectChat) => {
    onChatSelect(chat.id, chat.title);
  };

  if (!isOpen || !project) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal project-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{project.name}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          {/* 탭 네비게이션 */}
          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
              onClick={() => setActiveTab('files')}
            >
              📁 프로젝트 파일 ({projectFiles.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'guidelines' ? 'active' : ''}`}
              onClick={() => setActiveTab('guidelines')}
            >
              📋 지침 ({projectGuidelines.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'chats' ? 'active' : ''}`}
              onClick={() => setActiveTab('chats')}
            >
              💬 프로젝트 채팅 ({projectChats.length})
            </button>
          </div>

          {/* 파일 탭 */}
          {activeTab === 'files' && (
            <div className="tab-content">
              <div className="content-header">
                <div className="header-info">
                  <h4>프로젝트 파일</h4>
                  <p className="file-warning">
                    파일이 응답에 영향을 줍니다<br />
                    이 프로젝트가 사용하는 파일의 수로 인해 응답의 품질이 저하될 수 있습니다.
                  </p>
                </div>
                <button className="btn-primary">파일 추가</button>
              </div>
              
              <div className="file-list">
                {projectFiles.map((file) => (
                  <div key={file.id} className={`file-item ${file.isPinned ? 'pinned' : ''}`}>
                    <div className="file-icon">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="file-info">
                      <div className="file-name">{file.name}</div>
                      <div className="file-meta">
                        <span className="file-type">{file.type}</span>
                        <span className="file-size">{file.size}</span>
                        <span className="file-date">{formatDate(file.uploadedAt)}</span>
                        {file.isPinned && <span className="pinned-badge">📌</span>}
                      </div>
                      {file.description && (
                        <div className="file-description">{file.description}</div>
                      )}
                    </div>
                    <div className="file-actions">
                      <button className="action-btn" title="다운로드">⬇️</button>
                      <button className="action-btn" title="삭제">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 지침 탭 */}
          {activeTab === 'guidelines' && (
            <div className="tab-content">
              <div className="content-header">
                <h4>프로젝트 지침</h4>
                <button className="btn-primary">지침 추가</button>
              </div>
              
              <div className="guideline-list">
                {projectGuidelines.map((guideline) => (
                  <div key={guideline.id} className="guideline-item">
                    <div className="guideline-header">
                      <div className="guideline-title">
                        {getPriorityIcon(guideline.priority)} {guideline.title}
                      </div>
                      <div className="guideline-meta">
                        <span className="guideline-category">{guideline.category}</span>
                        <span className="guideline-date">{formatDate(guideline.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="guideline-content">
                      <pre>{guideline.content}</pre>
                    </div>
                    <div className="guideline-actions">
                      <button className="action-btn" title="편집">✏️</button>
                      <button className="action-btn" title="삭제">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 채팅 탭 */}
          {activeTab === 'chats' && (
            <div className="tab-content">
              <div className="content-header">
                <h4>프로젝트 채팅</h4>
                <button 
                  className="btn-primary"
                  onClick={() => setShowNewChatModal(true)}
                >
                  새 채팅
                </button>
              </div>
              
              <div className="chat-list">
                {projectChats.map((chat) => (
                  <div 
                    key={chat.id} 
                    className={`chat-item ${chat.isPinned ? 'pinned' : ''}`}
                    onClick={() => handleChatSelect(chat)}
                  >
                    <div className="chat-icon">
                      {getStatusIcon(chat.status)}
                    </div>
                    <div className="chat-info">
                      <div className="chat-title">
                        {chat.title}
                        {chat.isPinned && <span className="pinned-badge">📌</span>}
                      </div>
                      <div className="chat-meta">
                        <span className="chat-participants">
                          참가자: {chat.participants.join(', ')}
                        </span>
                        <span className="chat-date">{formatDate(chat.updatedAt)}</span>
                      </div>
                      <div className="chat-last-message">{chat.lastMessage}</div>
                      {chat.keyPoints && chat.keyPoints.length > 0 && (
                        <div className="chat-key-points">
                          <strong>주요 포인트:</strong> {chat.keyPoints.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 새 채팅 모달 */}
        {showNewChatModal && (
          <div className="modal-overlay" onClick={() => setShowNewChatModal(false)}>
            <div className="modal new-chat-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>새 채팅 생성</h3>
                <button className="modal-close" onClick={() => setShowNewChatModal(false)}>×</button>
              </div>
              <div className="modal-content">
                <div className="form-group">
                  <label>채팅 제목</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newChatTitle}
                    onChange={(e) => setNewChatTitle(e.target.value)}
                    placeholder="채팅 제목을 입력하세요"
                  />
                </div>
                <div className="modal-actions">
                  <button className="btn-secondary" onClick={() => setShowNewChatModal(false)}>
                    취소
                  </button>
                  <button className="btn-primary" onClick={handleNewChat}>
                    생성
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailModal;
