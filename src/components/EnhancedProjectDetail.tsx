import React, { useState } from 'react';


interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

interface ProjectFile {
  id: string;
  name: string;
  type: 'document' | 'spreadsheet' | 'image' | 'video' | 'audio';
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  description: string;
}

interface ProjectGuideline {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  status: 'active' | 'draft' | 'archived';
}

interface ConversationSummary {
  id: string;
  title: string;
  summary: string;
  participants: string[];
  date: string;
  duration: string;
  status: 'completed' | 'in-progress' | 'pending';
  keyPoints: string[];
}

const EnhancedProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'guidelines' | 'conversations' | 'analysis' | 'chat'>('overview');
  const [userInput, setUserInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; content: string; isUser: boolean; timestamp: Date }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'document' | 'spreadsheet' | 'image' | 'video' | 'audio'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('date');

  // 프로젝트 데이터
  const projectData = {
    id: projectId,
    name: '개포우성_실명방',
    description: '개포우성7차 재개발 프로젝트 실명방 대화 및 문서 관리',
    status: '진행중',
    progress: 75,
    createdAt: '2025-01-15',
    lastUpdated: '2025-01-19',
    participants: ['김호범', '이재헌', '박재우', '박은진', '정지혜'],
    keywords: ['재개발', '개포우성', '시공사', '설계', '홍보', '반박'],
    priority: '높음',
    budget: '50억원',
    deadline: '2025-12-31',
    category: '재개발',
    location: '서울시 강남구 개포동'
  };

  // 프로젝트 파일 데이터
  const projectFiles: ProjectFile[] = [
    {
      id: '1',
      name: '개포우성_재개발_계획서.pdf',
      type: 'document',
      size: '2.5MB',
      uploadedAt: '2025-01-15',
      uploadedBy: '김호범',
      description: '개포우성7차 재개발 사업 기본 계획서'
    },
    {
      id: '2',
      name: '설계도면_1층.dwg',
      type: 'document',
      size: '15.2MB',
      uploadedAt: '2025-01-16',
      uploadedBy: '박재우',
      description: '1층 설계 도면 파일'
    },
    {
      id: '3',
      name: '예산_계산서.xlsx',
      type: 'spreadsheet',
      size: '1.8MB',
      uploadedAt: '2025-01-17',
      uploadedBy: '이재헌',
      description: '프로젝트 예산 상세 계산서'
    },
    {
      id: '4',
      name: '현장_사진_1.jpg',
      type: 'image',
      size: '3.2MB',
      uploadedAt: '2025-01-18',
      uploadedBy: '박은진',
      description: '현장 상황 사진'
    },
    {
      id: '5',
      name: '회의_녹음_20250119.mp3',
      type: 'audio',
      size: '45.6MB',
      uploadedAt: '2025-01-19',
      uploadedBy: '정지혜',
      description: '1월 19일 회의 녹음 파일'
    }
  ];

  // 프로젝트 지침 데이터
  const projectGuidelines: ProjectGuideline[] = [
    {
      id: '1',
      title: '문서 작성 규칙',
      content: '모든 프로젝트 문서는 표준 템플릿을 사용하여 작성해야 합니다. 문서 제목은 명확하고 간결하게 작성하며, 버전 관리를 철저히 해야 합니다.',
      category: '문서관리',
      createdAt: '2025-01-15',
      updatedAt: '2025-01-18',
      author: '김호범',
      status: 'active'
    },
    {
      id: '2',
      title: '회의 진행 규칙',
      content: '회의는 매주 월요일 오전 10시에 진행됩니다. 회의록은 24시간 이내에 작성하여 공유해야 하며, 결정사항은 즉시 실행에 옮겨야 합니다.',
      category: '회의관리',
      createdAt: '2025-01-16',
      updatedAt: '2025-01-16',
      author: '박재우',
      status: 'active'
    },
    {
      id: '3',
      title: '보안 정책',
      content: '프로젝트 관련 모든 정보는 기밀사항으로 분류됩니다. 외부 반출 시 반드시 승인을 받아야 하며, 문서 접근 권한을 엄격히 관리해야 합니다.',
      category: '보안',
      createdAt: '2025-01-17',
      updatedAt: '2025-01-19',
      author: '이재헌',
      status: 'active'
    }
  ];

  // 대화 요약 데이터
  const conversationSummaries: ConversationSummary[] = [
    {
      id: '1',
      title: '1월 19일 주간 회의',
      summary: '개포우성7차 재개발 프로젝트 진행 상황 점검 및 다음 주 계획 수립',
      participants: ['김호범', '이재헌', '박재우', '박은진', '정지혜'],
      date: '2025-01-19',
      duration: '2시간 30분',
      status: 'completed',
      keyPoints: [
        '설계 검토 완료 및 승인',
        '예산 확정 및 계약 체결 준비',
        '주민 설명회 일정 조율',
        '시공사 선정 절차 진행'
      ]
    },
    {
      id: '2',
      title: '설계팀 미팅',
      summary: '건축 설계 세부 사항 검토 및 수정 사항 논의',
      participants: ['박재우', '박은진'],
      date: '2025-01-18',
      duration: '1시간 45분',
      status: 'completed',
      keyPoints: [
        '외관 디자인 최종 확정',
        '내부 공간 배치 조정',
        '친환경 요소 추가 검토',
        '시공 가능성 재검토'
      ]
    },
    {
      id: '3',
      title: '예산 검토 회의',
      summary: '프로젝트 예산 상세 검토 및 조정 사항 논의',
      participants: ['이재헌', '정지혜', '김호범'],
      date: '2025-01-17',
      duration: '3시간',
      status: 'completed',
      keyPoints: [
        '총 예산 50억원 확정',
        '세부 항목별 예산 배분',
        '리스크 관리 예산 확보',
        '월별 현금 흐름 계획'
      ]
    }
  ];

  // 필터링된 파일 목록
  const filteredFiles = projectFiles
    .filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || file.type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case 'size':
          return parseFloat(a.size) - parseFloat(b.size);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

  // 필터링된 지침 목록
  const filteredGuidelines = projectGuidelines
    .filter(guideline =>
      guideline.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guideline.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guideline.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // 필터링된 대화 요약 목록
  const filteredConversations = conversationSummaries
    .filter(conversation =>
      conversation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleSendMessage = async () => {
    if (!userInput.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now().toString(),
      content: userInput,
      isUser: true,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsProcessing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      let aiResponse = '';

      // 사용자 입력에 따른 지능적인 응답 생성
      if (userMessage.content.includes('파일') || userMessage.content.includes('문서')) {
        aiResponse = `프로젝트 "${projectData.name}"의 파일 현황입니다:\n\n총 ${projectFiles.length}개의 파일이 있습니다:\n${projectFiles.map(file => `• ${file.name} (${file.size})`).join('\n')}\n\n파일 관리는 '프로젝트 파일' 탭에서 확인하실 수 있습니다.`;
      } else if (userMessage.content.includes('지침') || userMessage.content.includes('규칙')) {
        aiResponse = `프로젝트 지침 현황입니다:\n\n총 ${projectGuidelines.length}개의 지침이 있습니다:\n${projectGuidelines.map(guideline => `• ${guideline.title} (${guideline.category})`).join('\n')}\n\n지침은 '지침' 탭에서 확인하실 수 있습니다.`;
      } else if (userMessage.content.includes('회의') || userMessage.content.includes('대화')) {
        aiResponse = `최근 회의 현황입니다:\n\n총 ${conversationSummaries.length}개의 회의가 있습니다:\n${conversationSummaries.map(conv => `• ${conv.title} (${conv.duration})`).join('\n')}\n\n대화 요약은 '대화 요약' 탭에서 확인하실 수 있습니다.`;
      } else if (userMessage.content.includes('진행') || userMessage.content.includes('상황')) {
        aiResponse = `프로젝트 "${projectData.name}" 진행 상황입니다:\n\n• 상태: ${projectData.status}\n• 진행률: ${projectData.progress}%\n• 예산: ${projectData.budget}\n• 마감일: ${projectData.deadline}\n• 위치: ${projectData.location}\n\n현재 ${projectData.participants.length}명의 팀원이 참여하고 있습니다.`;
      } else {
        aiResponse = `프로젝트 "${projectData.name}"에 대한 질문에 답변드리겠습니다.\n\n질문: ${userMessage.content}\n\n프로젝트 상태: ${projectData.status}\n진행률: ${projectData.progress}%\n참여자: ${projectData.participants.join(', ')}\n키워드: ${projectData.keywords.join(', ')}\n\n더 구체적인 정보가 필요하시면 파일, 지침, 회의 등에 대해 질문해 주세요.`;
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI 응답 생성 중 오류:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document': return '📄';
      case 'spreadsheet': return '📊';
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      default: return '📁';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'completed';
      case 'in-progress': return 'in-progress';
      case 'pending': return 'pending';
      default: return 'pending';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '완료';
      case 'in-progress': return '진행중';
      case 'pending': return '대기중';
      default: return status;
    }
  };

  return (
    <div className="enhanced-project-detail">
      <div className="project-header">
        <button className="back-button" onClick={onBack}>
          ← 대시보드로 돌아가기
        </button>
        <div className="project-title">
          <span className="project-icon">📁</span>
          {projectData.name}
        </div>
      </div>

      {/* 프로젝트 정보 섹션 */}
      <div className="project-info-section">
        <div className="project-info-header">
          <div className="project-info-main">
            <h1>{projectData.name}</h1>
            <div className="project-meta">
              <span className={`status-badge ${projectData.status === '진행중' ? 'active' : 'completed'}`}>
                {projectData.status}
              </span>
              <span className={`priority-badge ${projectData.priority === '높음' ? 'high' : 'medium'}`}>
                우선순위: {projectData.priority}
              </span>
            </div>
          </div>
        </div>

        <div className="project-info-grid">
          <div className="info-card">
            <div className="info-icon">📅</div>
            <div className="info-content">
              <label>생성일</label>
              <span>{projectData.createdAt}</span>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">👥</div>
            <div className="info-content">
              <label>참여자</label>
              <span>{projectData.participants.length}명</span>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">💰</div>
            <div className="info-content">
              <label>예산</label>
              <span>{projectData.budget}</span>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">🎯</div>
            <div className="info-content">
              <label>마감일</label>
              <span>{projectData.deadline}</span>
            </div>
          </div>
        </div>

        <div className="project-description">
          <h3>프로젝트 설명</h3>
          <p>{projectData.description}</p>
        </div>

        <div className="project-participants">
          <h3>참여자 목록</h3>
          <div className="participants-list">
            {projectData.participants.map((participant, index) => (
              <div key={index} className="participant-item">
                <div className="participant-avatar">
                  {participant.charAt(0)}
                </div>
                <span className="participant-name">{participant}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="project-keywords">
          <h3>주요 키워드</h3>
          <div className="keywords-list">
            {projectData.keywords.map((keyword, index) => (
              <span key={index} className="keyword-tag">{keyword}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📋 개요
        </button>
        <button
          className={`tab-button ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          📁 프로젝트 파일 ({projectFiles.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'guidelines' ? 'active' : ''}`}
          onClick={() => setActiveTab('guidelines')}
        >
          📋 지침 ({projectGuidelines.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'conversations' ? 'active' : ''}`}
          onClick={() => setActiveTab('conversations')}
        >
          💬 대화 요약 ({conversationSummaries.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          📊 분석
        </button>
        <button
          className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          🤖 AI 채팅
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'overview' && (
        <div className="overview-content">
          <div className="overview-grid">
            <div className="overview-card">
              <h3>프로젝트 현황</h3>
              <div className="progress-section">
                <div className="progress-info">
                  <span>진행률</span>
                  <span>{projectData.progress}%</span>
                </div>
                <div className="progress-bar-large">
                  <div
                    className="progress-fill-large"
                    style={{ width: `${projectData.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="status-info">
                <span className="status-label">상태:</span>
                <span className={`status-value ${projectData.status === '진행중' ? 'active' : 'completed'}`}>
                  {projectData.status}
                </span>
              </div>
            </div>

            <div className="overview-card">
              <h3>빠른 액션</h3>
              <div className="quick-actions-grid">
                <button className="quick-action-card" onClick={() => setActiveTab('files')}>
                  <span className="action-icon">📁</span>
                  <span className="action-text">파일 관리</span>
                </button>
                <button className="quick-action-card" onClick={() => setActiveTab('chat')}>
                  <span className="action-icon">🤖</span>
                  <span className="action-text">AI 채팅</span>
                </button>
                <button className="quick-action-card" onClick={() => setActiveTab('guidelines')}>
                  <span className="action-icon">📋</span>
                  <span className="action-text">지침 확인</span>
                </button>
                <button className="quick-action-card" onClick={() => setActiveTab('conversations')}>
                  <span className="action-icon">💬</span>
                  <span className="action-text">회의 요약</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'files' && (
        <div className="files-content">
          <div className="content-header">
            <h3>프로젝트 파일</h3>
            <div className="content-controls">
              <input
                type="text"
                placeholder="파일 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'document' | 'spreadsheet' | 'image' | 'video' | 'audio')}
                className="filter-select"
              >
                <option value="all">모든 파일</option>
                <option value="document">문서</option>
                <option value="spreadsheet">스프레드시트</option>
                <option value="image">이미지</option>
                <option value="video">비디오</option>
                <option value="audio">오디오</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size' | 'type')}
                className="sort-select"
              >
                <option value="date">날짜순</option>
                <option value="name">이름순</option>
                <option value="size">크기순</option>
                <option value="type">유형순</option>
              </select>
            </div>
          </div>

          <div className="files-list">
            {filteredFiles.map((file) => (
              <div key={file.id} className="file-item">
                <div className="file-icon">
                  {getFileIcon(file.type)}
                </div>
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-details">
                    <span>{file.size}</span>
                    <span>•</span>
                    <span>{file.uploadedAt}</span>
                    <span>•</span>
                    <span>{file.uploadedBy}</span>
                  </div>
                  <div className="file-description">{file.description}</div>
                </div>
                <div className="file-actions">
                  <button className="action-btn download">📥</button>
                  <button className="action-btn delete">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'guidelines' && (
        <div className="guidelines-content">
          <div className="content-header">
            <h3>프로젝트 지침</h3>
            <div className="content-controls">
              <input
                type="text"
                placeholder="지침 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="guidelines-list">
            {filteredGuidelines.map((guideline) => (
              <div key={guideline.id} className="guideline-item">
                <div className="guideline-header">
                  <h4>{guideline.title}</h4>
                  <span className={`status-badge ${guideline.status}`}>
                    {guideline.status === 'active' ? '활성' : guideline.status === 'draft' ? '초안' : '보관'}
                  </span>
                </div>
                <div className="guideline-meta">
                  <span>카테고리: {guideline.category}</span>
                  <span>작성자: {guideline.author}</span>
                  <span>수정일: {guideline.updatedAt}</span>
                </div>
                <div className="guideline-content">
                  {guideline.content}
                </div>
                <div className="guideline-actions">
                  <button className="action-btn edit">✏️ 수정</button>
                  <button className="action-btn delete">🗑️ 삭제</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'conversations' && (
        <div className="conversations-content">
          <div className="content-header">
            <h3>대화 요약</h3>
            <div className="content-controls">
              <input
                type="text"
                placeholder="대화 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="conversations-list">
            {filteredConversations.map((conversation) => (
              <div key={conversation.id} className="conversation-item">
                <div className="conversation-header">
                  <h4>{conversation.title}</h4>
                  <span className={`status-badge ${getStatusColor(conversation.status)}`}>
                    {getStatusText(conversation.status)}
                  </span>
                </div>
                <div className="conversation-meta">
                  <span>날짜: {conversation.date}</span>
                  <span>시간: {conversation.duration}</span>
                  <span>참여자: {conversation.participants.join(', ')}</span>
                </div>
                <div className="conversation-summary">
                  <strong>요약:</strong> {conversation.summary}
                </div>
                <div className="conversation-keypoints">
                  <strong>주요 포인트:</strong>
                  <ul>
                    {conversation.keyPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
                <div className="conversation-actions">
                  <button className="action-btn view">👁️ 상세보기</button>
                  <button className="action-btn edit">✏️ 수정</button>
                  <button className="action-btn delete">🗑️ 삭제</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="analysis-content">
          <h3>프로젝트 분석</h3>
          <div className="analysis-grid">
            <div className="analysis-card">
              <h4>파일 분석</h4>
              <div className="analysis-stats">
                <div className="stat-item">
                  <span className="stat-label">총 파일 수</span>
                  <span className="stat-value">{projectFiles.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">문서</span>
                  <span className="stat-value">{projectFiles.filter(f => f.type === 'document').length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">미디어</span>
                  <span className="stat-value">{projectFiles.filter(f => ['image', 'video', 'audio'].includes(f.type)).length}</span>
                </div>
              </div>
            </div>

            <div className="analysis-card">
              <h4>활동 분석</h4>
              <div className="analysis-stats">
                <div className="stat-item">
                  <span className="stat-label">총 회의 수</span>
                  <span className="stat-value">{conversationSummaries.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">완료된 회의</span>
                  <span className="stat-value">{conversationSummaries.filter(c => c.status === 'completed').length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">총 회의 시간</span>
                  <span className="stat-value">7시간 15분</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="chat-content">
          <div className="chat-messages">
            {chatMessages.length === 0 ? (
              <div className="empty-chat">
                <p>프로젝트에 대해 무엇이든 물어보세요!</p>
                <div className="chat-suggestions">
                  <button onClick={() => setUserInput('프로젝트 진행 상황은?')}>프로젝트 진행 상황은?</button>
                  <button onClick={() => setUserInput('파일 목록을 보여줘')}>파일 목록을 보여줘</button>
                  <button onClick={() => setUserInput('최근 회의 내용은?')}>최근 회의 내용은?</button>
                  <button onClick={() => setUserInput('지침을 확인해줘')}>지침을 확인해줘</button>
                </div>
              </div>
            ) : (
              chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`chat-message ${message.isUser ? 'user' : 'ai'}`}
                >
                  <div className="message-content">
                    {message.content}
                  </div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
            {isProcessing && (
              <div className="chat-message ai">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="chat-input">
            <div className="input-tools">
              <button className="tool-button">
                <span>+</span>
              </button>
              <button className="tool-button">
                <span>🔗</span>
              </button>
              <span className="tools-text">도구</span>
            </div>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="무엇이든 물어보세요 (Enter: 전송, Shift+Enter: 줄바꿈)"
              className="chat-input-field"
            />
            <div className="input-controls">
              <button className="voice-button">
                <span>🎤</span>
              </button>
              <button className="send-button" onClick={handleSendMessage}>
                <span>➤</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedProjectDetail;
