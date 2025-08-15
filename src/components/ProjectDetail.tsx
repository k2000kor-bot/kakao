import React, { useState, useEffect, useCallback } from 'react';
import {
  ProjectDetail as ProjectDetailType,
  ProjectFile,
  projectDetailService
} from '../services/projectDetailService';


interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

// Icon components
const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack }) => {
  const [projectData, setProjectData] = useState<ProjectDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'guidelines' | 'conversations' | 'analysis'>('overview');
  const [messages, setMessages] = useState<Array<{ id: string; content: string; isUser: boolean; timestamp: Date }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showGuidelineModal, setShowGuidelineModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);

  const loadProject = useCallback(async () => {
    try {
      setIsLoading(true);
      const project = await projectDetailService.getProjectDetail(projectId);
      setProjectData(project);
    } catch (err) {
      setError('프로젝트를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handleSendMessage = async (message: string) => {
    const userMessage = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // 간단한 AI 응답 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1500));

      const aiResponse = `프로젝트 "${projectData?.name}"에 대한 질문에 답변드리겠습니다.\n\n질문: ${message}\n\n프로젝트 상태: ${projectData?.status}\n프로젝트 설명: ${projectData?.description}\n키워드: ${projectData?.analysis.keywords.join(', ')}\n감정 분석: ${projectData?.analysis.sentiment}`;

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: '죄송합니다. 응답 생성 중 오류가 발생했습니다.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      await projectDetailService.addFile(projectData!.id, file);
      await loadProject();
      setShowFileUpload(false);
    } catch (error) {
      console.error('File upload failed:', error);
    }
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      await projectDetailService.deleteFile(projectData!.id, fileId);
      await loadProject();
    } catch (error) {
      console.error('File deletion failed:', error);
    }
  };

  const handleGuidelineAdd = async (guideline: { title: string; content: string; category: string }) => {
    try {
      await projectDetailService.addGuideline(projectData!.id, guideline);
      await loadProject();
      setShowGuidelineModal(false);
    } catch (error) {
      console.error('Guideline addition failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="project-detail-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>프로젝트 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !projectData) {
    return (
      <div className="project-detail-container">
        <div className="error-container">
          <h2>오류 발생</h2>
          <p>{error || '프로젝트를 찾을 수 없습니다.'}</p>
          <button onClick={onBack} className="back-btn">뒤로 가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="project-detail-container">
      {/* 프로젝트 헤더 */}
      <div className="project-header">
        <div className="project-header-left">
          <button onClick={onBack} className="back-btn">← 뒤로</button>
          <div className="project-info">
            <h1>{projectData.name}</h1>
            <div className="project-meta">
              <span className="project-date">
                생성일: {projectData.createdAt.toLocaleDateString()}
              </span>
              <span className="project-date">
                수정일: {projectData.updatedAt.toLocaleDateString()}
              </span>
              <span className={`status-badge ${projectData.status}`}>
                {projectData.status === 'active' ? '진행중' :
                  projectData.status === 'completed' ? '완료' : '대기중'}
              </span>
            </div>
          </div>
        </div>
        <div className="project-header-right">
          <button className="action-btn">
            <ShareIcon />
            공유
          </button>
          <button className="action-btn">
            <MoreIcon />
            설정
          </button>
          <button className="action-btn">
            내보내기
          </button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          개요
        </button>
        <button
          className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          프로젝트 파일 ({projectData.files.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'guidelines' ? 'active' : ''}`}
          onClick={() => setActiveTab('guidelines')}
        >
          지침 ({projectData.guidelines.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'conversations' ? 'active' : ''}`}
          onClick={() => setActiveTab('conversations')}
        >
          대화 내용 ({projectData.conversations.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          분석
        </button>
      </div>

      {/* 프로젝트 콘텐츠 */}
      <div className="project-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="project-description">
              <h3>프로젝트 설명</h3>
              <p>{projectData.description}</p>
            </div>

            <div className="project-stats">
              <div className="stat-card">
                <div className="stat-icon">📁</div>
                <div className="stat-info">
                  <h4>파일</h4>
                  <span>{projectData.files.length}개</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-info">
                  <h4>지침</h4>
                  <span>{projectData.guidelines.length}개</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💬</div>
                <div className="stat-info">
                  <h4>대화</h4>
                  <span>{projectData.conversations.length}개</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <h4>키워드</h4>
                  <span>{projectData.analysis.keywords.length}개</span>
                </div>
              </div>
            </div>

            <div className="recent-activity">
              <h3>최근 활동</h3>
              <div className="activity-list">
                {projectData.conversations.slice(0, 3).map((conv) => (
                  <div key={conv.id} className="activity-item">
                    <div className="activity-icon">💬</div>
                    <div className="activity-content">
                      <h4>{conv.title}</h4>
                      <p>{conv.summary.substring(0, 100)}...</p>
                      <span className="activity-time">
                        {conv.date.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="files-tab">
            <div className="files-header">
              <h3>프로젝트 파일</h3>
              <button
                className="add-file-btn"
                onClick={() => setShowFileUpload(true)}
              >
                + 파일 추가
              </button>
            </div>

            <div className="files-list">
              {projectData.files.map((file) => (
                <div key={file.id} className="file-item">
                  <div className="file-icon">
                    {file.type === 'document' ? '📄' :
                      file.type === 'image' ? '🖼️' :
                        file.type === 'audio' ? '🎵' :
                          file.type === 'video' ? '🎥' : '📁'}
                  </div>
                  <div className="file-info">
                    <h4>{file.name}</h4>
                    <p>{(file.size / 1024).toFixed(1)} KB • {file.uploadedAt.toLocaleDateString()}</p>
                  </div>
                  <div className="file-actions">
                    <button
                      className="file-action-btn"
                      onClick={() => setSelectedFile(file)}
                    >
                      보기
                    </button>
                    <button
                      className="file-action-btn delete"
                      onClick={() => handleFileDelete(file.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'guidelines' && (
          <div className="guidelines-tab">
            <div className="guidelines-header">
              <h3>프로젝트 지침</h3>
              <button
                className="add-guideline-btn"
                onClick={() => setShowGuidelineModal(true)}
              >
                + 지침 추가
              </button>
            </div>

            <div className="guidelines-list">
              {projectData.guidelines.map((guideline) => (
                <div key={guideline.id} className="guideline-item">
                  <div className="guideline-header">
                    <h4>{guideline.title}</h4>
                    <span className="guideline-category">{guideline.category}</span>
                  </div>
                  <p>{guideline.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'conversations' && (
          <div className="conversations-tab">
            <h3>대화 내용</h3>
            <div className="conversations-list">
              {projectData.conversations.map((conv) => (
                <div key={conv.id} className="conversation-item">
                  <div className="conversation-header">
                    <h4>{conv.title}</h4>
                    <span className="conversation-date">
                      {conv.date.toLocaleDateString()}
                    </span>
                  </div>
                  <p>{conv.summary}</p>
                  <div className="conversation-participants">
                    <span>참여자: {conv.participants.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="analysis-tab">
            <h3>프로젝트 분석</h3>

            <div className="analysis-section">
              <h4>키워드 분석</h4>
              <div className="keywords-list">
                {projectData.analysis.keywords.map((keyword, index) => (
                  <span key={index} className="keyword-tag">{keyword}</span>
                ))}
              </div>
            </div>

            <div className="analysis-section">
              <h4>감정 분석</h4>
              <div className={`sentiment-indicator ${projectData.analysis.sentiment}`}>
                {projectData.analysis.sentiment === 'positive' ? '긍정적' :
                  projectData.analysis.sentiment === 'negative' ? '부정적' : '중립적'}
              </div>
            </div>

            <div className="analysis-section">
              <h4>주요 토픽</h4>
              <div className="topics-list">
                {projectData.analysis.topics.map((topic, index) => (
                  <div key={index} className="topic-item">
                    <span className="topic-icon">📌</span>
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 메시지 영역 */}
      <div className="messages-area">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}>
            <div className="message-content">
              {message.content}
            </div>
            <div className="message-meta">
              <span className="message-time">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="processing-message">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>AI가 프로젝트 컨텍스트를 분석하고 있습니다...</p>
          </div>
        )}
      </div>

      {/* 통합 입력창 */}
      <div className="unified-input-area">
        <div className="input-container">
          <input
            type="text"
            placeholder={`${projectData.name} 프로젝트에 대해 무엇이든 물어보세요`}
            className="input-field"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                if (target.value.trim()) {
                  handleSendMessage(target.value);
                  target.value = '';
                }
              }
            }}
          />
          <button className="send-btn">전송</button>
        </div>
      </div>

      {/* 모달들 */}
      {showFileUpload && (
        <div className="modal-overlay" onClick={() => setShowFileUpload(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>파일 업로드</h3>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <div className="modal-actions">
              <button onClick={() => setShowFileUpload(false)}>취소</button>
            </div>
          </div>
        </div>
      )}

      {showGuidelineModal && (
        <div className="modal-overlay" onClick={() => setShowGuidelineModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>지침 추가</h3>
            <input
              type="text"
              placeholder="지침 제목"
              id="guideline-title"
            />
            <textarea
              placeholder="지침 내용"
              id="guideline-content"
            />
            <select id="guideline-category">
              <option value="general">일반</option>
              <option value="financial">재무</option>
              <option value="design">설계</option>
              <option value="communication">소통</option>
            </select>
            <div className="modal-actions">
              <button onClick={() => setShowGuidelineModal(false)}>취소</button>
              <button onClick={() => {
                const title = (document.getElementById('guideline-title') as HTMLInputElement).value;
                const content = (document.getElementById('guideline-content') as HTMLTextAreaElement).value;
                const category = (document.getElementById('guideline-category') as HTMLSelectElement).value;
                if (title && content) {
                  handleGuidelineAdd({ title, content, category });
                }
              }}>저장</button>
            </div>
          </div>
        </div>
      )}

      {selectedFile && (
        <div className="modal-overlay" onClick={() => setSelectedFile(null)}>
          <div className="modal file-detail-modal" onClick={(e) => e.stopPropagation()}>
            <h3>파일 상세</h3>
            <div className="file-detail">
              <h4>{selectedFile.name}</h4>
              <p>크기: {(selectedFile.size / 1024).toFixed(1)} KB</p>
              <p>업로드: {selectedFile.uploadedAt.toLocaleDateString()}</p>
              <p>상태: {selectedFile.status}</p>
            </div>
            <div className="modal-actions">
              <button onClick={() => setSelectedFile(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
