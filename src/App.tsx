import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import ProjectDetailPage from './components/ProjectDetailPage';
import UniversalChatInput from './components/UniversalChatInput';
import { Project, ProjectFile, ProjectGuideline, ProjectSettings } from './types/project';
import EnhancedIntegrationMonitor from './components/EnhancedIntegrationMonitor';
import RealTimeDashboard from './components/RealTimeDashboard';
import SmartSuggestionPanel from './components/SmartSuggestionPanel';
import NotificationSystem from './components/NotificationSystem';

interface Chat {
  id: string;
  projectId: string;
  title: string;
  description: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  status: 'active' | 'archived' | 'completed';
  tags: string[];
  participants: string[];
}

interface ChatMessage {
  id: string;
  projectId: string;
  chatId: string;
  content: string;
  sender: string;
  timestamp: string;
  type: 'question' | 'answer' | 'system' | 'file' | 'image';
  isUser: boolean;
  replyTo?: string;
  edited?: boolean;
  attachments?: Array<{
    id: string;
    name: string;
    type: 'image' | 'file' | 'document';
    url: string;
  }>;
  metadata?: {
    confidence?: number;
    processingTime?: number;
    modelUsed?: string;
  };
}

function App() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Array<{
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
    type?: 'text' | 'chart' | 'data' | 'analysis' | 'system' | 'error';
  }>>([]);

  // 누락된 상태 변수들 추가
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showProjectList, setShowProjectList] = useState(true);

  // 프로젝트 관련 상태
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: '개포우성7차',
      description: '개포우성7차 재건축 프로젝트',
      status: 'active',
      priority: 'high',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      messageCount: 150,
      files: [
        {
          id: '1',
          name: '개포우성7차_제안서.pdf',
          type: 'document',
          size: 2048576,
          uploadedAt: '2024-01-15',
          url: '/files/proposal.pdf',
          description: '개포우성7차 재건축 제안서',
          tags: ['제안서', '재건축', '개포우성']
        }
      ],
      guidelines: [],
      chats: [],
      analytics: {
        totalFiles: 5,
        totalMessages: 150,
        lastActivity: '2024-01-20',
        completionRate: 75,
        topTopics: [
          { topic: '재건축', count: 45 },
          { topic: '설계', count: 32 },
          { topic: '예산', count: 28 }
        ]
      },
      settings: {
        maxFileSize: 10485760,
        allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
        autoBackup: true,
        notifications: true
      },
      archived: false,
      tags: ['재건축', '개포우성', '프로젝트']
    }
  ]);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'chat' | 'project-list' | 'project-detail'>('chat');
  const [showRealtimeDashboard, setShowRealtimeDashboard] = useState(false);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(false);
  const [recentActions, setRecentActions] = useState<string[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  // 새로운 모달 상태들
  const [showFileModal, setShowFileModal] = useState(false);
  const [showGuidelineModal, setShowGuidelineModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<ProjectFile[]>([]);
  const [showProjectSettings, setShowProjectSettings] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [projectProgress, setProjectProgress] = useState({
    documentAnalysis: 75,
    conversationSummary: 90,
    conclusion: 60
  });





  // 제거된 상태 변수들 (현재 사용하지 않음)
  // const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'guidelines' | 'chats' | 'analytics' | 'settings'>('overview');
  // const [projectAnalytics, setProjectAnalytics] = useState<any>(null);

  // 유틸리티 함수들 (현재 사용하지 않지만 향후 확장을 위해 유지)
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string): string => {
    const icons: { [key: string]: string } = {
      document: '📄',
      image: '🖼️',
      video: '🎥',
      audio: '🎵',
      spreadsheet: '📊',
      presentation: '📽️'
    };
    return icons[type] || '📄';
  };

  const createProject = (name: string, description: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description,
      status: 'active',
      priority: 'medium',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      messageCount: 0,
      files: [],
      guidelines: [],
      chats: [],
      analytics: {
        totalFiles: 0,
        totalMessages: 0,
        lastActivity: new Date().toISOString().split('T')[0],
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
      tags: []
    };

    setProjects(prev => [newProject, ...prev]);
    setSelectedProjectId(newProject.id);
    setCurrentView('project-detail');
  };



  const getProjectChats = (projectId: string): Chat[] => {
    // 실제로는 프로젝트별 채팅 목록을 반환해야 합니다.
    return [];
  };

  const handleSendMessage = (message: string) => {
    if (message.trim()) {
      const userMessage = {
        id: Date.now().toString(),
        content: message,
        isUser: true,
        timestamp: new Date(),
        type: 'text' as const
      };

      setMessages(prev => [...prev, userMessage]);
      setInputValue('');

      // 사용자 액션 추적
      const action = message.toLowerCase();
      setRecentActions(prev => [action, ...prev.slice(0, 4)]);

      // 스마트 제안 트리거 조건
      if (action.includes('파일') || action.includes('분석') || action.includes('프로젝트')) {
        setTimeout(() => {
          setShowSmartSuggestions(true);
        }, 3000);
      }

      // 긴 메시지 알림
      if (message.length > 100) {
        setTimeout(() => {
          (window as any).addNotification?.({
            type: 'info',
            title: '긴 메시지 감지',
            message: '대화 요약을 생성할 수 있습니다.',
            action: {
              label: '요약 생성',
              onClick: () => generateSummary()
            }
          });
        }, 1000);
      }

      // AI 응답 생성
      const aiResponse = generateAIResponse(message);
      setTimeout(() => {
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const generateSummary = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v7/conversation/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.map(msg => ({
            content: msg.content,
            isUser: msg.isUser
          })),
          type: 'brief'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          const summaryMessage = {
            id: Date.now().toString(),
            content: `📋 대화 요약: ${data.summary.summary}`,
            isUser: false,
            timestamp: new Date(),
            type: 'system' as const
          };
          setMessages(prev => [...prev, summaryMessage]);
        }
      }
    } catch (error) {
      console.error('요약 생성 오류:', error);
    }
  };

  const generateAIResponse = (userInput: string): {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
    type: 'text' | 'chart' | 'data' | 'analysis';
  } => {
    // 대화 분석 관련 키워드 체크
    const analysisKeywords = ['요약', '정리', '분석', '발언', '날짜', '대화', '채팅'];
    const hasAnalysisRequest = analysisKeywords.some(keyword => userInput.includes(keyword));

    if (hasAnalysisRequest && attachedFiles.length > 0) {
      // 대화 파일 분석 응답
      const analysisResponse = generateConversationAnalysis(userInput);
      return {
        id: (Date.now() + 1).toString(),
        content: analysisResponse,
        isUser: false,
        timestamp: new Date(),
        type: 'analysis'
      };
    }

    // 일반 응답
    const responses = [
      '안녕하세요! CORBU AI입니다. 무엇을 도와드릴까요?',
      '좋은 질문이네요! 더 자세히 설명해 주시겠어요?',
      '이해했습니다. 해당 내용에 대해 분석해 드리겠습니다.',
      '흥미로운 주제입니다. 관련 정보를 찾아보겠습니다.',
      '도움이 필요하시면 언제든 말씀해 주세요!',
      '이 내용에 대해 더 구체적으로 알고 싶으신 부분이 있나요?',
      '분석 결과를 차트로 보여드릴까요?',
      '이 데이터를 기반으로 예측 모델을 만들어볼 수 있습니다.',
      '프로젝트 관리를 도와드릴 수 있습니다.',
      '파일 업로드나 분석이 필요하시면 말씀해 주세요.'
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    return {
      id: (Date.now() + 1).toString(),
      content: randomResponse,
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    };
  };

  const generateConversationAnalysis = (userInput: string): string => {
    const currentDate = new Date();
    const fileName = attachedFiles[0]?.name || '대화 파일';

    // 대화 분석 시뮬레이션
    const analysis = `
📊 **대화 파일 분석 결과**

**파일명:** ${fileName}
**분석 날짜:** ${currentDate.toLocaleDateString('ko-KR')}

---

## 📅 **날짜별 대화 요약**

### 2025년 7월 14일
- **주요 이슈:** 시공사 평가 기준 논의
- **참여자:** 이재헌, 박재우, 박은진
- **핵심 내용:** 선정 과정의 투명성과 공정성 강조

### 2025년 7월 15일  
- **주요 이슈:** 공사비 관련 견해
- **참여자:** 이재헌, 박재우, 정지혜
- **핵심 내용:** 비용 비교의 시기상조성 논의

---

## 👥 **발언자별 정리**

### 이재헌
- **발언 횟수:** 15회
- **주요 관점:** 투명성과 공정성 중시
- **핵심 발언:** "선정 과정에서 객관적 기준이 가장 중요합니다."

### 박재우  
- **발언 횟수:** 12회
- **주요 관점:** 실용적 접근
- **핵심 발언:** "내용 검증이 선정보다 우선되어야 합니다."

### 박은진
- **발언 횟수:** 8회  
- **주요 관점:** 프로세스 개선
- **핵심 발언:** "설명회에서 누가 발표하는지가 중요합니다."

### 정지혜
- **발언 횟수:** 6회
- **주요 관점:** 신중한 접근
- **핵심 발언:** "비용 비교는 아직 시기상조입니다."

---

## 📈 **분석 인사이트**

1. **가장 활발한 논의 주제:** 시공사 평가 기준 (총 23회 언급)
2. **주요 갈등 지점:** 투명성 vs 실용성
3. **합의 가능성:** 높음 (모든 참여자가 공정성의 중요성 인정)
4. **다음 단계 제안:** 구체적 평가 기준 수립

이 분석이 도움이 되셨나요? 특정 부분에 대해 더 자세한 분석이 필요하시면 말씀해 주세요.
    `;

    return analysis;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const handleCreateNewProject = () => {
    if (newProjectName.trim() && newProjectDescription.trim()) {
      createProject(newProjectName, newProjectDescription);
    }
  };



  const handleProjectSelect = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setSelectedProjectId(projectId);
    setSelectedProject(project || null);
    setCurrentView('project-detail');
  };

  const handleBackToProjectList = () => {
    setSelectedProjectId(null);
    setSelectedProject(null);
    setSelectedChatId(null);
    setCurrentView('project-list');
  };

  // 누락된 함수들 추가
  const handleEnhancedFileUpload = async (files: File[]) => {
    for (const file of files) {
      try {
        // 파일 분석 및 자동 학습
        const analysisResult = await analyzeAndLearnFile(file);

        if (analysisResult) {
          // 자동 학습 시스템에 전달
          await handleAutoLearning({
            file,
            analysis: analysisResult,
            projectId: selectedProject?.id,
            chatId: selectedChat?.id
          });

          // 파일 업로드 메시지 추가
          const fileMessage = {
            id: Date.now().toString(),
            content: `파일 업로드: ${file.name}`,
            isUser: true,
            timestamp: new Date(),
            type: 'text' as const
          };
          setMessages(prev => [...prev, fileMessage]);
        }
      } catch (error) {
        console.error('파일 업로드 오류:', error);
      }
    }
  };

  const analyzeAndLearnFile = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', selectedProject?.id || '');
    formData.append('chatId', selectedChat?.id || '');

    try {
      const response = await fetch('/api/analyze-and-learn', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        throw new Error('파일 분석 실패');
      }
    } catch (error) {
      console.error('파일 분석 오류:', error);
      return null;
    }
  };

  // 새로운 핸들러 함수들
  const handleVoiceToggle = () => {
    setIsVoiceRecording(!isVoiceRecording);
    if (!isVoiceRecording) {
      // 음성 인식 시작
      console.log('음성 인식 시작');
    } else {
      // 음성 인식 중지
      console.log('음성 인식 중지');
    }
  };

  // AI 기반 파일 자동 분류 및 학습 시스템
  const [fileClassification, setFileClassification] = useState<{ [key: string]: any }>({});
  const [learningProgress, setLearningProgress] = useState<{ [key: string]: number }>({});
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [deepLearningModel, setDeepLearningModel] = useState({
    accuracy: 85,
    trainingData: 127,
    lastUpdated: new Date(),
    modelVersion: 'v2.1.0',
    isTraining: false
  });
  const [fileAnalysisQueue, setFileAnalysisQueue] = useState<string[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState<{ [key: string]: number }>({});
  const [mediaAnalysis, setMediaAnalysis] = useState<{ [key: string]: any }>({});
  const [autoResponseEnabled, setAutoResponseEnabled] = useState(true);
  const [fileProcessingStatus, setFileProcessingStatus] = useState<{ [key: string]: 'uploading' | 'analyzing' | 'processing' | 'completed' | 'error' }>({});
  const [enhancedInputMode, setEnhancedInputMode] = useState<'text' | 'voice' | 'file' | 'analysis'>('text');

  // 자동 학습 관련 상태 추가
  const [autoLearningSessions, setAutoLearningSessions] = useState<{ [key: string]: any }>({});
  const [knowledgeBaseSummary, setKnowledgeBaseSummary] = useState<any>(null);
  const [aiModelsStatus, setAiModelsStatus] = useState<any>(null);

  // 고도화된 통합 시스템 관련 상태 추가
  const [enhancedIntegrationStatus, setEnhancedIntegrationStatus] = useState<any>(null);
  const [showEnhancedMonitor, setShowEnhancedMonitor] = useState(false);

  // 고도화된 통합 시스템 초기화
  useEffect(() => {
    // 고도화된 통합 시스템 상태 로드
    loadEnhancedIntegrationStatus();
  }, []);

  const loadEnhancedIntegrationStatus = async () => {
    try {
      const response = await fetch('/api/v3/system-overview');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEnhancedIntegrationStatus(data.overview);
        }
      }
    } catch (error) {
      console.error('고도화된 통합 상태 로드 실패:', error);
    }
  };

  // 자동 학습 시스템 초기화
  useEffect(() => {
    // 지식 베이스 요약 로드
    loadKnowledgeBaseSummary();
    // AI 모델 상태 로드
    loadAiModelsStatus();
  }, []);

  const loadKnowledgeBaseSummary = async () => {
    try {
      const response = await fetch('/api/v2/knowledge-base-summary');
      if (response.ok) {
        const data = await response.json();
        setKnowledgeBaseSummary(data);
      }
    } catch (error) {
      console.error('지식 베이스 요약 로드 실패:', error);
    }
  };

  const loadAiModelsStatus = async () => {
    try {
      const response = await fetch('/api/v2/ai-models/status');
      if (response.ok) {
        const data = await response.json();
        setAiModelsStatus(data);
      }
    } catch (error) {
      console.error('AI 모델 상태 로드 실패:', error);
    }
  };

  // 자동 학습 처리 함수
  const handleAutoLearning = async (fileData: any) => {
    try {
      const { file, analysis, projectId, chatId } = fileData;

      // 자동 학습 세션 시작
      const sessionId = await startAutoLearningSession(projectId, chatId, file.name);

      if (sessionId) {
        setAutoLearningSessions(prev => ({
          ...prev,
          [sessionId]: {
            fileId: analysis.file_id,
            fileName: file.name,
            status: 'active',
            progress: 0,
            startTime: new Date().toISOString()
          }
        }));

        // 학습 진행 상황 모니터링
        monitorLearningProgress(sessionId);
      }
    } catch (error) {
      console.error('자동 학습 처리 실패:', error);
    }
  };

  const startAutoLearningSession = async (projectId: string, chatId: string, fileName: string) => {
    try {
      const response = await fetch('/api/v2/learning-session/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          chat_id: chatId,
          session_type: 'file_upload',
          metadata: { fileName }
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.session_id;
      }
    } catch (error) {
      console.error('학습 세션 시작 실패:', error);
    }
    return null;
  };

  const monitorLearningProgress = async (sessionId: string) => {
    const checkProgress = async () => {
      try {
        const response = await fetch(`/api/v2/learning-progress/${sessionId}`);
        if (response.ok) {
          const data = await response.json();

          if (data.success) {
            setAutoLearningSessions(prev => ({
              ...prev,
              [sessionId]: {
                ...prev[sessionId],
                status: data.progress.status,
                progress: data.progress.progress || 0
              }
            }));

            // 학습이 완료되면 요약 정보 업데이트
            if (data.progress.status === 'completed') {
              loadKnowledgeBaseSummary();
              loadAiModelsStatus();
            } else if (data.progress.status === 'active') {
              // 계속 모니터링
              setTimeout(checkProgress, 2000);
            }
          }
        }
      } catch (error) {
        console.error('학습 진행 상황 확인 실패:', error);
      }
    };

    // 2초 후 첫 번째 확인
    setTimeout(checkProgress, 2000);
  };

  const classifyFileContent = async (file: File): Promise<any> => {
    // 파일 내용 분석을 위한 시뮬레이션
    const fileContent = await readFileContent(file);

    // AI 기반 자동 분류 로직
    const classification = {
      category: determineFileCategory(file.name, fileContent),
      topics: extractTopics(fileContent),
      sentiment: analyzeSentiment(fileContent),
      participants: extractParticipants(fileContent),
      keyPhrases: extractKeyPhrases(fileContent),
      learningScore: calculateLearningScore(fileContent),
      recommendations: generateRecommendations(fileContent)
    };

    return classification;
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.readAsText(file);
    });
  };

  const determineFileCategory = (fileName: string, content: string): string => {
    const categories = {
      'conversation': ['대화', '채팅', 'conversation', 'chat'],
      'document': ['문서', 'document', 'report', 'pdf'],
      'meeting': ['회의', 'meeting', 'minutes'],
      'analysis': ['분석', 'analysis', 'report'],
      'guideline': ['지침', 'guideline', 'manual']
    };

    const fileNameLower = fileName.toLowerCase();
    const contentLower = content.toLowerCase();

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => fileNameLower.includes(keyword) || contentLower.includes(keyword))) {
        return category;
      }
    }
    return 'document';
  };

  const extractTopics = (content: string): string[] => {
    // 토픽 추출 시뮬레이션
    const topics = [];
    if (content.includes('시공사') || content.includes('건설')) topics.push('시공사 평가');
    if (content.includes('비용') || content.includes('공사비')) topics.push('비용 분석');
    if (content.includes('투명성') || content.includes('공정성')) topics.push('투명성 검토');
    if (content.includes('설명회') || content.includes('발표')) topics.push('설명회 준비');
    return topics;
  };

  const analyzeSentiment = (content: string): string => {
    const positiveWords = ['긍정', '좋음', '성공', '진전', '개선'];
    const negativeWords = ['부정', '문제', '우려', '위험', '실패'];

    const positiveCount = positiveWords.filter(word => content.includes(word)).length;
    const negativeCount = negativeWords.filter(word => content.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  };

  const extractParticipants = (content: string): string[] => {
    // 참여자 추출 시뮬레이션
    const participants: string[] = [];
    const names = ['이재헌', '박재우', '박은진', '정지혜', '김철수', '이영희'];
    names.forEach(name => {
      if (content.includes(name)) participants.push(name);
    });
    return participants;
  };

  const extractKeyPhrases = (content: string): string[] => {
    // 핵심 문구 추출 시뮬레이션
    const phrases = [];
    if (content.includes('시공사 평가 기준')) phrases.push('시공사 평가 기준');
    if (content.includes('투명성과 공정성')) phrases.push('투명성과 공정성');
    if (content.includes('비용 비교')) phrases.push('비용 비교');
    return phrases;
  };

  const calculateLearningScore = (content: string): number => {
    // 학습 점수 계산 (0-100)
    let score = 50;
    if (content.length > 1000) score += 20;
    if (content.includes('분석') || content.includes('검토')) score += 15;
    if (content.includes('결론') || content.includes('제안')) score += 15;
    return Math.min(score, 100);
  };

  const generateRecommendations = (content: string): string[] => {
    const recommendations = [];
    if (content.includes('시공사')) {
      recommendations.push('시공사 평가 기준 문서화 필요');
      recommendations.push('투명성 검증 프로세스 수립');
    }
    if (content.includes('비용')) {
      recommendations.push('비용 비교 분석 리포트 작성');
      recommendations.push('경제성 평가 기준 수립');
    }
    return recommendations;
  };

  // 미디어 파일 분석 및 요구사항 추출
  const analyzeMediaFile = async (file: File): Promise<any> => {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    // 미디어 파일 타입 분류
    const isImage = fileType.startsWith('image/') || fileName.includes('.jpg') || fileName.includes('.png') || fileName.includes('.gif');
    const isVideo = fileType.startsWith('video/') || fileName.includes('.mp4') || fileName.includes('.avi') || fileName.includes('.mov');
    const isAudio = fileType.startsWith('audio/') || fileName.includes('.mp3') || fileName.includes('.wav') || fileName.includes('.m4a');

    let analysis = {
      type: 'unknown',
      requirements: [],
      suggestions: [],
      autoResponse: ''
    };

    if (isImage) {
      analysis = await analyzeImageFile(file);
    } else if (isVideo) {
      analysis = await analyzeVideoFile(file);
    } else if (isAudio) {
      analysis = await analyzeAudioFile(file);
    } else {
      analysis = await analyzeDocumentFile(file);
    }

    return analysis;
  };

  const analyzeImageFile = async (file: File): Promise<any> => {
    // 이미지 분석 시뮬레이션
    const imageAnalysis = {
      type: 'image',
      requirements: [
        '이미지 내용 분석 및 설명',
        '이미지에서 추출 가능한 텍스트 정보',
        '이미지 품질 및 해상도 확인',
        '이미지 관련 컨텍스트 파악'
      ],
      suggestions: [
        '이미지 내용을 텍스트로 변환하여 분석',
        '이미지에서 발견된 정보를 구조화',
        '이미지 품질 개선 제안'
      ],
      autoResponse: `📸 **이미지 파일 분석 요청**

**파일명:** ${file.name}
**파일 크기:** ${(file.size / 1024 / 1024).toFixed(2)} MB

**🔍 분석 요구사항:**
• 이미지 내용 분석 및 설명
• 이미지에서 추출 가능한 텍스트 정보
• 이미지 품질 및 해상도 확인
• 이미지 관련 컨텍스트 파악

**💡 제안사항:**
• 이미지 내용을 텍스트로 변환하여 분석
• 이미지에서 발견된 정보를 구조화
• 이미지 품질 개선 제안

이 이미지에 대해 어떤 분석이 필요하신가요?`
    };

    return imageAnalysis;
  };

  const analyzeVideoFile = async (file: File): Promise<any> => {
    // 비디오 분석 시뮬레이션
    const videoAnalysis = {
      type: 'video',
      requirements: [
        '비디오 내용 요약 및 분석',
        '비디오에서 추출 가능한 오디오 정보',
        '비디오 품질 및 해상도 확인',
        '비디오 길이 및 프레임 분석'
      ],
      suggestions: [
        '비디오 내용을 텍스트로 요약',
        '오디오 트랜스크립션 생성',
        '키 프레임 추출 및 분석'
      ],
      autoResponse: `🎥 **비디오 파일 분석 요청**

**파일명:** ${file.name}
**파일 크기:** ${(file.size / 1024 / 1024).toFixed(2)} MB

**🔍 분석 요구사항:**
• 비디오 내용 요약 및 분석
• 비디오에서 추출 가능한 오디오 정보
• 비디오 품질 및 해상도 확인
• 비디오 길이 및 프레임 분석

**💡 제안사항:**
• 비디오 내용을 텍스트로 요약
• 오디오 트랜스크립션 생성
• 키 프레임 추출 및 분석

이 비디오에 대해 어떤 분석이 필요하신가요?`
    };

    return videoAnalysis;
  };

  const analyzeAudioFile = async (file: File): Promise<any> => {
    // 오디오 분석 시뮬레이션
    const audioAnalysis = {
      type: 'audio',
      requirements: [
        '오디오 내용 트랜스크립션',
        '음성 인식 및 텍스트 변환',
        '오디오 품질 및 길이 확인',
        '화자 식별 및 분리'
      ],
      suggestions: [
        '음성을 텍스트로 변환',
        '화자별 발언 분리',
        '오디오 품질 개선 제안'
      ],
      autoResponse: `🎵 **오디오 파일 분석 요청**

**파일명:** ${file.name}
**파일 크기:** ${(file.size / 1024 / 1024).toFixed(2)} MB

**🔍 분석 요구사항:**
• 오디오 내용 트랜스크립션
• 음성 인식 및 텍스트 변환
• 오디오 품질 및 길이 확인
• 화자 식별 및 분리

**💡 제안사항:**
• 음성을 텍스트로 변환
• 화자별 발언 분리
• 오디오 품질 개선 제안

이 오디오 파일에 대해 어떤 분석이 필요하신가요?`
    };

    return audioAnalysis;
  };

  const analyzeDocumentFile = async (file: File): Promise<any> => {
    // 문서 분석 시뮬레이션
    const documentAnalysis = {
      type: 'document',
      requirements: [
        '문서 내용 요약 및 분석',
        '문서에서 핵심 정보 추출',
        '문서 구조 및 형식 분석',
        '문서 품질 및 가독성 확인'
      ],
      suggestions: [
        '문서 내용을 구조화된 형태로 변환',
        '핵심 키워드 및 주제 추출',
        '문서 품질 개선 제안'
      ],
      autoResponse: `📄 **문서 파일 분석 요청**

**파일명:** ${file.name}
**파일 크기:** ${(file.size / 1024 / 1024).toFixed(2)} MB

**🔍 분석 요구사항:**
• 문서 내용 요약 및 분석
• 문서에서 핵심 정보 추출
• 문서 구조 및 형식 분석
• 문서 품질 및 가독성 확인

**💡 제안사항:**
• 문서 내용을 구조화된 형태로 변환
• 핵심 키워드 및 주제 추출
• 문서 품질 개선 제안

이 문서에 대해 어떤 분석이 필요하신가요?`
    };

    return documentAnalysis;
  };

  // 자동 답변 생성
  const generateAutoResponse = (mediaAnalysis: any, fileName: string): string => {
    const response = mediaAnalysis.autoResponse;

    // 추가적인 컨텍스트 기반 답변 생성
    const contextResponse = `
**🎯 추가 분석 옵션:**

1. **상세 분석**: ${fileName}의 모든 내용을 상세히 분석
2. **요약 생성**: 핵심 내용만 요약하여 제공
3. **구조화**: 정보를 체계적으로 정리
4. **비교 분석**: 다른 파일과 비교 분석
5. **품질 개선**: 파일 품질 향상 방안 제시

어떤 분석을 원하시나요? 구체적인 요구사항을 말씀해 주시면 더 정확한 분석을 제공해 드리겠습니다.
    `;

    return response + contextResponse;
  };

  const updateLearningProgress = (fileId: string, classification: any) => {
    setLearningProgress(prev => ({
      ...prev,
      [fileId]: classification.learningScore
    }));

    // AI 인사이트 업데이트
    const newInsights = classification.recommendations.map((rec: string) =>
      `📊 AI 분석: ${rec}`
    );
    setAiInsights(prev => [...prev, ...newInsights]);

    // 딥러닝 모델 정확도 업데이트
    updateModelAccuracy(classification.learningScore);
  };

  const updateModelAccuracy = (newScore: number) => {
    setDeepLearningModel(prev => ({
      ...prev,
      accuracy: Math.min(100, prev.accuracy + (newScore > 70 ? 0.5 : -0.2)),
      trainingData: prev.trainingData + 1,
      lastUpdated: new Date()
    }));
  };

  const startModelTraining = () => {
    setDeepLearningModel(prev => ({
      ...prev,
      isTraining: true
    }));

    // 모델 훈련 시뮬레이션
    setTimeout(() => {
      setDeepLearningModel(prev => ({
        ...prev,
        isTraining: false,
        accuracy: Math.min(100, prev.accuracy + 2),
        modelVersion: `v${parseFloat(prev.modelVersion.slice(1)) + 0.1}`
      }));
    }, 5000);
  };

  const addToAnalysisQueue = (fileId: string) => {
    setFileAnalysisQueue(prev => [...prev, fileId]);
    setAnalysisProgress(prev => ({
      ...prev,
      [fileId]: 0
    }));
  };

  const processAnalysisQueue = async () => {
    if (fileAnalysisQueue.length === 0) return;

    const currentFileId = fileAnalysisQueue[0];

    // 분석 진행도 시뮬레이션
    for (let progress = 0; progress <= 100; progress += 10) {
      setAnalysisProgress(prev => ({
        ...prev,
        [currentFileId]: progress
      }));
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // 큐에서 제거
    setFileAnalysisQueue(prev => prev.slice(1));

    // 다음 파일 처리
    setTimeout(() => {
      processAnalysisQueue();
    }, 500);
  };

  // 분석 큐 자동 처리
  useEffect(() => {
    if (fileAnalysisQueue.length > 0) {
      processAnalysisQueue();
    }
  }, [fileAnalysisQueue]);

  // 실시간 AI 분석 상태 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(fileClassification).length > 0) {
        // 모델 정확도 자동 업데이트
        const avgScore = Object.values(learningProgress).reduce((sum, score) => sum + score, 0) / Object.keys(learningProgress).length;
        if (avgScore > 0) {
          setDeepLearningModel(prev => ({
            ...prev,
            accuracy: Math.min(100, prev.accuracy + (avgScore > 75 ? 0.1 : -0.05))
          }));
        }
      }
    }, 10000); // 10초마다 업데이트

    return () => clearInterval(interval);
  }, [fileClassification, learningProgress]);

  // 자동 학습 상태 표시 컴포넌트
  const AutoLearningStatus = () => {
    const activeSessions = Object.entries(autoLearningSessions).filter(
      ([_, session]) => session.status === 'active'
    );

    if (activeSessions.length === 0) return null;

    return (
      <div className="fixed bottom-20 right-4 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg max-w-sm">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">자동 학습 진행 중</h3>
        {activeSessions.map(([sessionId, session]) => (
          <div key={sessionId} className="mb-2">
            <div className="flex justify-between text-xs text-blue-600 mb-1">
              <span>{session.fileName}</span>
              <span>{Math.round(session.progress * 100)}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-1">
              <div
                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${session.progress * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 지식 베이스 요약 표시 컴포넌트
  const KnowledgeBaseSummary = () => {
    if (!knowledgeBaseSummary) return null;

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-semibold text-green-800 mb-2">지식 베이스 현황</h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
          <div>총 파일: {knowledgeBaseSummary.summary?.total_files || 0}</div>
          <div>처리 완료: {knowledgeBaseSummary.summary?.processed_files || 0}</div>
          <div>지식 항목: {knowledgeBaseSummary.summary?.knowledge_items || 0}</div>
          <div>활성 모델: {knowledgeBaseSummary.summary?.active_models || 0}</div>
        </div>
      </div>
    );
  };

  // AI 모델 상태 표시 컴포넌트
  const AiModelsStatus = () => {
    if (!aiModelsStatus?.models?.length) return null;

    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-semibold text-purple-800 mb-2">AI 모델 상태</h3>
        <div className="space-y-1">
          {aiModelsStatus.models.slice(0, 3).map((model: any, index: number) => (
            <div key={index} className="flex justify-between text-xs text-purple-700">
              <span>{model.model_name}</span>
              <span>정확도: {Math.round(model.accuracy * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 업로드 시작 알림
      const uploadMessage = {
        id: Date.now().toString(),
        content: `📁 파일 "${file.name}" 업로드 중... AI 분석을 시작합니다.`,
        isUser: false,
        timestamp: new Date(),
        type: 'system' as const
      };
      setMessages(prev => [...prev, uploadMessage]);

      // 실시간 분석 상태 메시지
      const analyzingMessage = {
        id: (Date.now() + 1).toString(),
        content: `🤖 AI가 파일을 분석하고 있습니다...`,
        isUser: false,
        timestamp: new Date(),
        type: 'system' as const
      };
      setMessages(prev => [...prev, analyzingMessage]);

      try {
        // 미디어 파일 분석
        const mediaAnalysis = await analyzeMediaFile(file);
        const fileId = Date.now().toString();

        // 미디어 분석 결과 저장
        setMediaAnalysis(prev => ({
          ...prev,
          [fileId]: mediaAnalysis
        }));

        // AI 기반 파일 분류 및 분석
        const classification = await classifyFileContent(file);

        const newFile: ProjectFile = {
          id: fileId,
          name: file.name,
          type: classification.category as any,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          url: URL.createObjectURL(file),
          description: `분석된 파일: ${file.name}`,
          tags: classification.tags || []
        };

        setAttachedFiles(prev => [...prev, newFile]);
        setFileClassification(prev => ({
          ...prev,
          [fileId]: classification
        }));

        // 분석 큐에 추가
        addToAnalysisQueue(fileId);

        // 학습 진행도 업데이트
        updateLearningProgress(fileId, classification);

        // 자동 답변 생성 (활성화된 경우)
        if (autoResponseEnabled) {
          setTimeout(() => {
            const autoResponseMessage = {
              id: (Date.now() + 1).toString(),
              content: generateAutoResponse(mediaAnalysis, file.name),
              isUser: false,
              timestamp: new Date(),
              type: 'analysis' as const
            };
            setMessages(prev => [...prev, autoResponseMessage]);
          }, 1500);
        }

        // AI 분석 완료 메시지
        setTimeout(() => {
          const completedMessage = {
            id: (Date.now() + 2).toString(),
            content: `✅ AI 분석이 완료되었습니다! 파일 "${file.name}"이 성공적으로 분류되었습니다.`,
            isUser: false,
            timestamp: new Date(),
            type: 'system' as const
          };
          setMessages(prev => [...prev, completedMessage]);

          // 상세 분석 결과 메시지
          setTimeout(() => {
            const analysisMessage = {
              id: (Date.now() + 3).toString(),
              content: generateFileAnalysisMessage(file.name, classification),
              isUser: false,
              timestamp: new Date(),
              type: 'analysis' as const
            };
            setMessages(prev => [...prev, analysisMessage]);
          }, 1000);
        }, 2000);

      } catch (error) {
        console.error('파일 분석 중 오류:', error);
        const errorMessage = {
          id: Date.now().toString(),
          content: `❌ 파일 분석 중 오류가 발생했습니다.`,
          isUser: false,
          timestamp: new Date(),
          type: 'error' as const
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  };

  const generateFileAnalysisMessage = (fileName: string, classification: any): string => {
    const sentimentEmoji = classification.sentiment === 'positive' ? '😊' :
      classification.sentiment === 'negative' ? '😔' : '😐';

    return `
🤖 **AI 파일 분석 완료**

**📁 파일 정보:**
• **파일명:** ${fileName}
• **분류:** ${classification.category}
• **감정 상태:** ${sentimentEmoji} ${classification.sentiment === 'positive' ? '긍정적' : classification.sentiment === 'negative' ? '부정적' : '중립적'}

**📋 주요 토픽 (${classification.topics.length}개):**
${classification.topics.map((topic: string) => `• ${topic}`).join('\n')}

**👥 참여자 (${classification.participants.length}명):**
${classification.participants.length > 0 ? classification.participants.map((participant: string) => `• ${participant}`).join('\n') : '• 참여자 정보 없음'}

**🔑 핵심 문구 (${classification.keyPhrases.length}개):**
${classification.keyPhrases.length > 0 ? classification.keyPhrases.map((phrase: string) => `• "${phrase}"`).join('\n') : '• 핵심 문구 없음'}

**📈 AI 학습 정보:**
• **학습 점수:** ${classification.learningScore}/100 ${classification.learningScore >= 80 ? '🎯' : classification.learningScore >= 60 ? '📊' : '📝'}
• **분석 품질:** ${classification.learningScore >= 80 ? '우수' : classification.learningScore >= 60 ? '양호' : '보통'}

**💡 AI 추천사항 (${classification.recommendations.length}개):**
${classification.recommendations.map((rec: string) => `• ${rec}`).join('\n')}

**🎯 다음 단계:**
이 파일을 기반으로 더 정확한 대화 분석이 가능합니다. 특정 부분에 대해 더 자세한 분석이 필요하시면 말씀해 주세요.
    `;
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleSummarizeConversation = () => {
    setShowSummaryModal(true);
  };



  // 고도화된 통합 시스템 상태 표시 컴포넌트
  const EnhancedIntegrationStatus = () => {
    if (!enhancedIntegrationStatus) return null;

    return (
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-indigo-800">고도화된 통합 시스템</h3>
          <button
            onClick={() => setShowEnhancedMonitor(!showEnhancedMonitor)}
            className="text-xs text-indigo-600 hover:text-indigo-800"
          >
            {showEnhancedMonitor ? '모니터링 숨기기' : '상세 모니터링'}
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="text-center">
            <div className="text-lg font-bold text-indigo-600">{enhancedIntegrationStatus.total_processes}</div>
            <div className="text-indigo-600">총 프로세스</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{enhancedIntegrationStatus.completed_processes}</div>
            <div className="text-green-600">완료</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{enhancedIntegrationStatus.active_integrations}</div>
            <div className="text-purple-600">활성 통합</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              {enhancedIntegrationStatus.total_processes > 0
                ? Math.round((enhancedIntegrationStatus.completed_processes / enhancedIntegrationStatus.total_processes) * 100)
                : 0}%
            </div>
            <div className="text-orange-600">완료율</div>
          </div>
        </div>
      </div>
    );
  };

  // 고도화된 통합 모니터링
  const EnhancedIntegrationMonitorComponent = () => {
    if (!enhancedIntegrationStatus) return null;

    return (
      <EnhancedIntegrationMonitor
        projectId={selectedProject?.id}
        chatId={selectedChat?.id}
      />
    );
  };

  return (
    <div className="App">
      {/* 사이드바 */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1 className="app-title cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setCurrentView('chat')}>CORBU.AI</h1>
        </div>

        <div className="sidebar-section">
          <h3>뷰 전환</h3>
          <div className="sidebar-items">
            <div
              className={`sidebar-item ${currentView === 'chat' ? 'active' : ''}`}
              onClick={() => setCurrentView('chat')}
            >
              <div className="item-icon blue"></div>
              <span>채팅</span>
            </div>
            <div
              className={`sidebar-item ${currentView === 'project-list' ? 'active' : ''}`}
              onClick={() => setCurrentView('project-list')}
            >
              <div className="item-icon green"></div>
              <span>프로젝트 목록</span>
            </div>
            <div
              className="sidebar-item blue-theme"
              onClick={() => setShowRealtimeDashboard(true)}
            >
              <div className="item-icon blue"></div>
              <span>실시간 분석</span>
            </div>
          </div>
        </div>

        <div className="sidebar-section">
          <h3>프로젝트</h3>
          <div className="sidebar-items">
            {projects.map(project => (
              <div
                key={project.id}
                className={`sidebar-item ${selectedProjectId === project.id ? 'active' : ''}`}
                onClick={() => handleProjectSelect(project.id)}
              >
                <div className="item-icon blue"></div>
                <span>{project.name}</span>
                <span className="project-count">({project.messageCount})</span>
              </div>
            ))}
            <div
              className="sidebar-item add-project"
              onClick={() => setShowProjectModal(true)}
            >
              <div className="item-icon green"></div>
              <span>+ 새 프로젝트</span>
            </div>
          </div>
        </div>



        <div className="sidebar-section">
          <h3>시스템 기능</h3>
          <div className="sidebar-items">
            <div className="sidebar-item" onClick={() => setShowFileModal(true)}>
              <div className="item-icon blue"></div>
              <span>프로젝트 파일</span>
            </div>
            <div className="sidebar-item" onClick={() => setShowGuidelineModal(true)}>
              <div className="item-icon green"></div>
              <span>지침</span>
            </div>
            <div className="sidebar-item" onClick={() => setShowSummaryModal(true)}>
              <div className="item-icon yellow"></div>
              <span>대화내용 요약해줘</span>
            </div>
            <div className="sidebar-item">
              <div className="item-icon purple"></div>
              <span>템플릿</span>
            </div>
            <div className="sidebar-item">
              <div className="item-icon orange"></div>
              <span>내보내기</span>
            </div>
          </div>
        </div>

        <div className="sidebar-section">
          <h3>시스템 명령어</h3>
          <div className="sidebar-items">
            <div className="sidebar-item">
              <div className="item-icon purple"></div>
              <span>파일 업로드</span>
            </div>
            <div className="sidebar-item">
              <div className="item-icon green"></div>
              <span>분석 시작</span>
            </div>
            <div className="sidebar-item">
              <div className="item-icon blue"></div>
              <span>요약 생성</span>
            </div>
            <div className="sidebar-item">
              <div className="item-icon pink"></div>
              <span>카드뉴스 생성</span>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="main-content">
        {currentView === 'chat' && (
          <>
            {messages.length === 0 ? (
              <div className="welcome-section">
                <h2 className="welcome-title">무엇이든 물어보세요!</h2>
                <p className="welcome-subtitle">CORBU.AI가 도와드리겠습니다.</p>

                <div className="command-suggestions">
                  <div className="suggestion-header">
                    <span className="lightbulb-icon">💡</span>
                    <span>명령어를 사용해보세요:</span>
                  </div>
                  <div className="suggestion-list">
                    <div className="suggestion-item">/help - 사용 가능한 명령어 보기</div>
                    <div className="suggestion-item">/upload - 파일 업로드</div>
                    <div className="suggestion-item">/project list - 프로젝트 목록</div>
                    <div className="suggestion-item">데이터를 분석해줘 - 분석 기능</div>
                    <div className="suggestion-item">차트로 보여줘 - 차트 생성</div>
                    <div className="suggestion-item">통계 데이터 보여줘 - 데이터 요약</div>
                    <div className="suggestion-item">예측 분석 - 미래 예측</div>
                    <div className="suggestion-item">AI 학습 - 모델 훈련</div>
                    <div className="suggestion-item">자동화 설정 - 작업 자동화</div>
                    <div className="suggestion-item">요약해줘 - 내용 요약</div>
                    <div className="suggestion-item">템플릿 생성 - 양식 생성</div>
                    <div className="suggestion-item">내보내기 - 결과 다운로드</div>
                    <div className="suggestion-item">실시간 분석 - 라이브 모니터링</div>
                    <div className="suggestion-item">도움말 - 사용법 안내</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="messages-container">
                {messages.map((message) => (
                  <div key={message.id} className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}>
                    <div className={`message-content ${message.type}`}>
                      {message.content}
                    </div>
                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 홈 화면 입력 영역 */}
            <div className="input-section">
              <div className="input-form-container">
                <div className="input-form">
                  <div className="input-center-section">
                    <UniversalChatInput
                      onSendMessage={handleSendMessage}
                      onVoiceInput={handleVoiceToggle}
                      onToolClick={() => {
                        // 도구 버튼 클릭 처리
                        console.log('도구 버튼 클릭');
                      }}
                      placeholder="무엇이든 물어보세요"
                      isLoading={false}
                      disabled={false}
                      showFileUpload={false}
                      showVoiceInput={true}
                      showToolButton={true}
                      autoFocus={true}
                      maxHeight={432}
                      minHeight={24}
                      theme="default"
                      size="medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {currentView === 'project-list' && (
          <div className="project-list-view">
            <h2 className="view-title">프로젝트 목록</h2>
            <div className="project-grid">
              {projects.map(project => (
                <div
                  key={project.id}
                  className="project-card"
                  onClick={() => handleProjectSelect(project.id)}
                >
                  <div className="project-card-header">
                    <h3 className="project-card-title">{project.name}</h3>
                    <span className="project-card-count">{project.messageCount}개 메시지</span>
                  </div>
                  <p className="project-card-description">{project.description}</p>
                  <div className="project-card-stats">
                    <span className="stat">📁 {project.files.length}개 파일</span>
                    <span className="stat">📋 {project.guidelines.length}개 가이드라인</span>
                  </div>
                  <div className="project-card-footer">
                    <span className="project-date">생성: {project.createdAt}</span>
                    <span className="project-activity">활동: {project.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'project-detail' && selectedProject && (
          <ProjectDetailPage
            project={selectedProject}
            onBack={handleBackToProjectList}
            onProjectUpdate={(updatedProject) => {
              setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
              setSelectedProjectId(updatedProject.id);
              // 현재 뷰를 유지 (프로젝트 상세 페이지에서 나가지 않음)
            }}
            onProjectDelete={(projectId) => {
              setProjects(prev => prev.filter(p => p.id !== projectId));
              setSelectedProjectId(null);
              setCurrentView('project-list');
            }}
          />
        )}


      </div>

      {/* 프로젝트 파일 관리 모달 */}
      {showFileModal && (
        <div className="modal-overlay">
          <div className="modal file-modal">
            <div className="modal-header">
              <h3>프로젝트 파일</h3>
              <div className="modal-actions">
                <button
                  className="add-file-btn"
                  onClick={() => document.getElementById('modal-file-upload')?.click()}
                >
                  파일 추가
                </button>
                <input
                  id="modal-file-upload"
                  type="file"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  accept=".txt,.doc,.docx,.pdf,.jpg,.jpeg,.png"
                  aria-label="모달 파일 업로드"
                />
                <button onClick={() => setShowFileModal(false)} className="close-btn">×</button>
              </div>
            </div>

            <div className="file-warning">
              파일이 응답에 영향을 줍니다. 이 프로젝트가 사용하는 파일의 수로 인해 응답의 품질이 저하될 수 있습니다.
            </div>

            <div className="file-list">
              {selectedProject?.files.map(file => (
                <div key={file.id} className="file-item">
                  <span className="file-icon">{getFileIcon(file.type)}</span>
                  <span className="file-name">{file.name}</span>
                  <span className="file-type">{file.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 지침 설정 모달 */}
      {showGuidelineModal && (
        <div className="modal-overlay">
          <div className="modal guideline-modal">
            <div className="modal-header">
              <h3>지침</h3>
              <button onClick={() => setShowGuidelineModal(false)} className="close-btn">×</button>
            </div>

            <div className="guideline-content">
              <p className="guideline-question">어떻게 하면 ChatGPT가 이 프로젝트를 최대한 도와드릴 수 있을까요?</p>
              <p className="guideline-description">ChatGPT에게 특정 토픽에 집중해 달라고 하거나, 특정한 톤이나 포맷으로 응답해 달라고 할 수 있습니다.</p>

              <div className="guideline-summary">
                <h4>개포우성 0000대화 요약</h4>
                <p>2025년 00월 00일 오후 8시 이후 ~ 00월 00일 기준</p>

                <div className="summary-section">
                  <h5>시공사 홍보 문제</h5>
                  <p>- 주요 내용</p>
                  <ul>
                    <li>GS건설과 삼성물산의 개별 홍보 활동 논란 지속</li>
                    <li>GS건설 홍보 요원이 일부 조합원의 집까지 방문했다는 제보가 이어짐.</li>
                    <li>삼성물산도 홍보 활동을 진행 중이나 GS보다는 수위가 낮다는 의견 존재.</li>
                    <li>조합원들 사이에서 불법 홍보에 대한 신고 및 강경 대응 필요성이 제기됨.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowGuidelineModal(false)} className="cancel-btn">취소</button>
              <button
                className="save-btn"
                onClick={() => {
                  // 지침 저장 로직
                  console.log('지침이 저장되었습니다.');
                  setShowGuidelineModal(false);
                }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 대화 요약 모달 */}
      {showSummaryModal && (
        <div className="modal-overlay">
          <div className="modal summary-modal">
            <div className="modal-header">
              <h3>대화 내용 요약</h3>
              <div className="summary-actions">
                <button
                  className="edit-btn"
                  onClick={() => {
                    // 편집 기능
                    console.log('요약 편집 모드 활성화');
                  }}
                  title="편집"
                >
                  ✏️
                </button>
                <button
                  className="copy-btn"
                  onClick={() => {
                    // 복사 기능
                    const summaryText = `다음은 실명 채팅방 [인증] 행복한소유 개포우성7차의 2025년 7월 14일 대화 내용을 주요 이슈 중심으로 정리한 요약입니다:

✅ 1. 시공사 평가 기준 및 설명회 기대
• 이재헌: 선정 과정의 투명성과 공정성 강조
• 박재우: 내용 검증의 중요성과 객관적 기준 필요
• 박은진: 설명회에서 누가 발표하는지가 중요하다고 강조

✅ 2. 공사비 관련 견해
• 이재헌: 공사비가 동일할 경우 다양한 요소를 종합적으로 고려해야 한다고 주장
• 박재우: 일부 조건들은 비교할 수 없다고 강조
• 정지혜: 비용 비교는 아직 시기상조라고 판단`;

                    navigator.clipboard.writeText(summaryText).then(() => {
                      console.log('요약이 클립보드에 복사되었습니다.');
                    });
                  }}
                  title="복사"
                >
                  📋
                </button>
                <button onClick={() => setShowSummaryModal(false)} className="close-btn">×</button>
              </div>
            </div>

            <div className="summary-content">
              <p>다음은 실명 채팅방 [인증] 행복한소유 개포우성7차의 2025년 7월 14일 대화 내용을 주요 이슈 중심으로 정리한 요약입니다:</p>

              <div className="summary-section">
                <h4>✅ 1. 시공사 평가 기준 및 설명회 기대</h4>
                <ul>
                  <li><strong>이재헌:</strong> 선정 과정의 투명성과 공정성 강조</li>
                  <li><strong>박재우:</strong> 내용 검증의 중요성과 객관적 기준 필요</li>
                  <li><strong>박은진:</strong> 설명회에서 누가 발표하는지가 중요하다고 강조</li>
                </ul>
              </div>

              <div className="summary-section">
                <h4>✅ 2. 공사비 관련 견해</h4>
                <ul>
                  <li><strong>이재헌:</strong> 공사비가 동일할 경우 다양한 요소를 종합적으로 고려해야 한다고 주장</li>
                  <li><strong>박재우:</strong> 일부 조건들은 비교할 수 없다고 강조</li>
                  <li><strong>정지혜:</strong> 비용 비교는 아직 시기상조라고 판단</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 프로젝트 생성 모달 */}
      {showProjectModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>새 프로젝트 생성</h3>
            <input
              type="text"
              placeholder="프로젝트 이름"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="modal-input"
            />
            <textarea
              placeholder="프로젝트 설명"
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              className="modal-textarea"
            />
            <div className="modal-buttons">
              <button onClick={handleCreateNewProject} className="modal-button primary">
                생성
              </button>
              <button onClick={() => setShowProjectModal(false)} className="modal-button">
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 자동 학습 상태 표시 */}
      <AutoLearningStatus />

      {/* 지식 베이스 요약 표시 */}
      <KnowledgeBaseSummary />

      {/* AI 모델 상태 표시 */}
      <AiModelsStatus />

      {/* 고도화된 통합 시스템 상태 표시 */}
      <EnhancedIntegrationStatus />

      {/* 고도화된 통합 모니터링 */}
      {showEnhancedMonitor && (
        <div className="mb-6">
          <EnhancedIntegrationMonitorComponent />
        </div>
      )}

      {/* 지식 베이스 및 AI 모델 상태 표시 */}
      <div className="mb-6">
        <KnowledgeBaseSummary />
        <AiModelsStatus />
      </div>

      {/* 실시간 분석 대시보드 */}
      <RealTimeDashboard
        isVisible={showRealtimeDashboard}
        onClose={() => setShowRealtimeDashboard(false)}
      />

      {/* 스마트 제안 패널 */}
      <SmartSuggestionPanel
        isVisible={showSmartSuggestions}
        recentActions={recentActions}
        onSuggestionClick={(prompt) => {
          setInputValue(prompt);
          handleSendMessage(prompt);
        }}
        onClose={() => setShowSmartSuggestions(false)}
      />

      {/* 알림 시스템 */}
      <NotificationSystem />

    </div>
  );
}

export default App;
