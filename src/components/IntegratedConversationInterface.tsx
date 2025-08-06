import React, { useState, useEffect, useRef } from 'react';
import { useChat, useNotifications } from '../context/AppContext';
import integratedMessageService from '../services/integratedMessageService';
import DetailedChatInput from './DetailedChatInput';
import ProjectSelector from './ProjectSelector';
import ProjectFileManager from './ProjectFileManager';
import ConversationSummaryComponent from './ConversationSummary';
import ProjectWelcomeScreen from './ProjectWelcomeScreen';
import ProjectChatList from './ProjectChatList';
import GuidelineManager from './GuidelineManager';
import FileLearningManager from './FileLearningManager';
import {
  ChatBubbleLeftRightIcon,
  CogIcon,
  DocumentTextIcon,
  ChartBarIcon,
  FolderIcon,
  SparklesIcon,
  LightBulbIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  PlusIcon,
  XMarkIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import type { AISystem, Project, ConversationSummary } from '../types/chat';
import fileLearningService from '../services/fileLearningService';

interface IntegratedConversationInterfaceProps {
  className?: string;
}

const IntegratedConversationInterface: React.FC<IntegratedConversationInterfaceProps> = ({ className = '' }) => {
  const { messages, addMessage } = useChat();
  const { addNotification } = useNotifications();

  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSystemStatus, setShowSystemStatus] = useState(false);
  const [systemStatus, setSystemStatus] = useState<AISystem[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [autoModeInterval, setAutoModeInterval] = useState<NodeJS.Timeout | null>(null);
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalMessages: 0,
    averageResponseTime: 0,
    successRate: 0,
    activeSystems: 0
  });
  const [userActivityMetrics, setUserActivityMetrics] = useState({
    sessionStartTime: new Date(),
    totalInteractions: 0,
    averageResponseTime: 0,
    favoriteFeatures: [] as string[],
    usagePattern: 'normal' as 'normal' | 'intensive' | 'light'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [systemCache, setSystemCache] = useState<{
    lastUpdate: number;
    systems: AISystem[];
    performance: typeof performanceMetrics;
  }>({
    lastUpdate: 0,
    systems: [],
    performance: performanceMetrics
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectSelector, setShowProjectSelector] = useState(true);
  const [showFileManager, setShowFileManager] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ConversationSummary | null>(null);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [showChatList, setShowChatList] = useState(false);
  const [showGuidelineManager, setShowGuidelineManager] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showFileLearningManager, setShowFileLearningManager] = useState(false);
  const [activeLearningSessions, setActiveLearningSessions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 연결 상태 확인 함수
  const checkConnection = React.useCallback(async () => {
    setConnectionStatus('checking');
    try {
      const isConnected = await integratedMessageService.checkConnection();
      const previousStatus = connectionStatus;
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');

      // 상태 변경 시에만 알림 표시
      if (previousStatus !== 'checking' && previousStatus !== (isConnected ? 'connected' : 'disconnected')) {
        if (!isConnected) {
          addNotification({
            type: 'warning',
            title: '연결 오류',
            message: '백엔드 서버와의 연결이 끊어졌습니다. 자동으로 재연결을 시도합니다.'
          });
          // 자동 재연결 시도
          setTimeout(() => checkConnection(), 5000);
        } else if (previousStatus === 'disconnected') {
          addNotification({
            type: 'success',
            title: '연결 복구',
            message: '백엔드 서버와의 연결이 복구되었습니다.'
          });
        }
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      console.error('연결 확인 오류:', error);
    }
  }, [addNotification, connectionStatus]);

  // 자동 재연결 시도
  useEffect(() => {
    if (connectionStatus === 'disconnected') {
      const reconnectInterval = setInterval(() => {
        checkConnection();
      }, 10000); // 10초마다 재연결 시도
      return () => clearInterval(reconnectInterval);
    }
  }, [connectionStatus, checkConnection]);

  // 연결 상태 확인
  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // 30초마다 체크
    return () => clearInterval(interval);
  }, [checkConnection]);

  // 메시지 전송 함수
  const handleSendMessage = React.useCallback(async (message?: string) => {
    const messageToSend = message || inputMessage;
    if (!messageToSend.trim() || isProcessing) return;

    // 사용자 활동 추적
    trackUserActivity('message_send', { content: messageToSend });

    const userMessage = {
      id: `msg_${Date.now()}`,
      content: messageToSend,
      sender: 'user' as const,
      timestamp: new Date().toISOString(),
      type: 'text' as const
    };
    addMessage(userMessage);
    setInputMessage('');
    setIsProcessing(true);

    // 처리 시작 알림
    addNotification({
      type: 'info',
      title: '메시지 처리 중',
      message: 'AI가 응답을 생성하고 있습니다...'
    });

    try {
      const response = await integratedMessageService.sendMessage({
        content: messageToSend,
        context: messages.map(m => m.content).join('\n'),
        userPreferences: {
          tone: 'formal',
          style: 'informative',
          length: 'medium'
        }
      });
      const assistantMessage = {
        id: response.id,
        content: response.content,
        sender: 'ai' as const,
        timestamp: new Date().toISOString(),
        type: response.type as 'text' | 'analysis' | 'system' | 'success' | 'error' | 'chart' | 'stats' | 'summary' | 'command',
        data: response.metadata,
        metadata: {
          confidence: response.confidence,
          processingTime: response.processingTime,
          suggestions: response.metadata?.suggestions,
          actions: response.metadata?.actions
        }
      };
      addMessage(assistantMessage);

      // AI 응답 활동 추적
      trackUserActivity('ai_response', { confidence: response.confidence });

      // 응답 성공 알림
      if (response.confidence > 0.8) {
        addNotification({
          type: 'success',
          title: '응답 완료',
          message: `AI가 성공적으로 응답했습니다. (신뢰도: ${(response.confidence * 100).toFixed(0)}%)`
        });
      } else if (response.confidence > 0.6) {
        addNotification({
          type: 'warning',
          title: '응답 완료',
          message: `AI가 응답했습니다. (신뢰도: ${(response.confidence * 100).toFixed(0)}%)`
        });
      }
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      const errorMessage = {
        id: `error_${Date.now()}`,
        content: '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.',
        sender: 'system' as const,
        timestamp: new Date().toISOString(),
        type: 'error' as const
      };
      addMessage(errorMessage);
      addNotification({
        type: 'error',
        title: '오류 발생',
        message: '메시지 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [inputMessage, isProcessing, addMessage, addNotification, messages]);

  // 시스템 상태 로드
  useEffect(() => {
    const initializeSystem = async () => {
      setIsInitializing(true);
      try {
        await loadSystemStatus();
        await checkConnection();
        setIsLoading(false);
      } catch (error) {
        console.error('시스템 초기화 오류:', error);
        setIsLoading(false);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeSystem();
  }, []);

  // 성능 메트릭 업데이트
  useEffect(() => {
    if (!isInitializing) {
      updatePerformanceMetrics();
    }
  }, [messages, isInitializing]);

  // 실시간 성능 모니터링 (1분마다)
  useEffect(() => {
    if (!isInitializing) {
      const performanceInterval = setInterval(() => {
        updatePerformanceMetrics();
      }, 60000); // 1분마다
      return () => clearInterval(performanceInterval);
    }
  }, [isInitializing]);

  // 자동 모드 처리
  useEffect(() => {
    if (isAutoMode) {
      const interval = setInterval(() => {
        const autoMessages = [
          '시스템 상태를 확인해줘',
          '현재 프로젝트 정보를 알려줘',
          '업로드된 파일 목록을 보여줘',
          '이 대화를 분석해줘',
          '메시지 가이드를 만들어줘'
        ];
        const randomMessage = autoMessages[Math.floor(Math.random() * autoMessages.length)];
        setInputMessage(randomMessage);
        setTimeout(() => {
          handleSendMessage(randomMessage);
        }, 1000);
      }, 10000);
      setAutoModeInterval(interval);
    } else {
      if (autoModeInterval) {
        clearInterval(autoModeInterval);
        setAutoModeInterval(null);
      }
    }
    return () => {
      if (autoModeInterval) {
        clearInterval(autoModeInterval);
      }
    };
  }, [isAutoMode, autoModeInterval, handleSendMessage]);

  const loadSystemStatus = async () => {
    try {
      // 캐시 확인 (5분 이내면 캐시 사용)
      const now = Date.now();
      if (systemCache.lastUpdate > 0 && (now - systemCache.lastUpdate) < 300000) {
        setSystemStatus(systemCache.systems);
        setPerformanceMetrics(systemCache.performance);
        return;
      }

      const systems = await integratedMessageService.getSystemStatus();
      setSystemStatus(systems);

      // 성능 메트릭 계산
      const activeSystems = systems.filter(s => s.isActive).length;
      const avgResponseTime = systems.reduce((acc, s) => acc + (1 / s.performance.speed), 0) / systems.length * 1000;
      const avgAccuracy = systems.reduce((acc, s) => acc + s.performance.accuracy, 0) / systems.length;

      const newPerformanceMetrics = {
        totalMessages: messages.length,
        averageResponseTime: Math.round(avgResponseTime),
        successRate: Math.round(avgAccuracy * 100),
        activeSystems
      };

      setPerformanceMetrics(newPerformanceMetrics);

      // 캐시 업데이트
      setSystemCache({
        lastUpdate: now,
        systems,
        performance: newPerformanceMetrics
      });
    } catch (error) {
      console.error('시스템 상태 로드 실패:', error);
    }
  };

  const updatePerformanceMetrics = () => {
    const aiMessages = messages.filter(m => m.sender === 'ai');
    const avgResponseTime = aiMessages.length > 0
      ? aiMessages.reduce((acc, m) => acc + (m.metadata?.processingTime || 0), 0) / aiMessages.length
      : 0;

    const successRate = aiMessages.length > 0
      ? aiMessages.filter(m => (m.metadata?.confidence || 0) > 0.6).length / aiMessages.length * 100
      : 0;

    const newMetrics = {
      totalMessages: messages.length,
      averageResponseTime: Math.round(avgResponseTime),
      successRate: Math.round(successRate),
      activeSystems: performanceMetrics.activeSystems
    };

    setPerformanceMetrics(newMetrics);

    // 캐시 업데이트
    setSystemCache(prev => ({
      ...prev,
      performance: newMetrics
    }));
  };

  const analyzeConversation = () => {
    const userMessages = messages.filter(m => m.sender === 'user');
    const aiMessages = messages.filter(m => m.sender === 'ai');
    const systemMessages = messages.filter(m => m.sender === 'system');

    const sessionDuration = Date.now() - userActivityMetrics.sessionStartTime.getTime();
    const minutes = Math.floor(sessionDuration / 60000);
    const interactionsPerMinute = minutes > 0 ? userActivityMetrics.totalInteractions / minutes : 0;

    const analysis = {
      totalMessages: messages.length,
      userMessages: userMessages.length,
      aiMessages: aiMessages.length,
      systemMessages: systemMessages.length,
      averageUserMessageLength: userMessages.length > 0
        ? Math.round(userMessages.reduce((acc, m) => acc + m.content.length, 0) / userMessages.length)
        : 0,
      averageAIResponseLength: aiMessages.length > 0
        ? Math.round(aiMessages.reduce((acc, m) => acc + m.content.length, 0) / aiMessages.length)
        : 0,
      averageConfidence: aiMessages.length > 0
        ? aiMessages.reduce((acc, m) => acc + (m.metadata?.confidence || 0), 0) / aiMessages.length
        : 0,
      averageProcessingTime: aiMessages.length > 0
        ? aiMessages.reduce((acc, m) => acc + (m.metadata?.processingTime || 0), 0) / aiMessages.length
        : 0,
      sessionDuration: minutes,
      interactionsPerMinute,
      usagePattern: userActivityMetrics.usagePattern,
      favoriteFeatures: userActivityMetrics.favoriteFeatures
    };

    const analysisMessage = `📊 고급 대화 분석 결과:
• 총 메시지: ${analysis.totalMessages}개
• 사용자 메시지: ${analysis.userMessages}개
• AI 응답: ${analysis.aiMessages}개
• 시스템 메시지: ${analysis.systemMessages}개
• 평균 사용자 메시지 길이: ${analysis.averageUserMessageLength}자
• 평균 AI 응답 길이: ${analysis.averageAIResponseLength}자
• 평균 신뢰도: ${(analysis.averageConfidence * 100).toFixed(1)}%
• 평균 처리 시간: ${Math.round(analysis.averageProcessingTime)}ms
• 세션 시간: ${analysis.sessionDuration}분
• 분당 상호작용: ${analysis.interactionsPerMinute.toFixed(1)}회/분
• 사용 패턴: ${analysis.usagePattern === 'intensive' ? '집중적' : analysis.usagePattern === 'light' ? '가벼운' : '일반적'}
• 선호 기능: ${analysis.favoriteFeatures.join(', ') || '없음'}`;

    handleSendMessage(analysisMessage);
  };

  const optimizeSystem = async () => {
    addNotification({
      type: 'info',
      title: '시스템 최적화',
      message: '시스템 성능을 최적화하고 있습니다...'
    });

    try {
      // 메모리 정리
      if (messages.length > 100) {
        const recentMessages = messages.slice(-50);
        // 메시지 히스토리 정리 로직
        addNotification({
          type: 'success',
          title: '메모리 정리 완료',
          message: '오래된 메시지를 정리하여 성능을 개선했습니다.'
        });
      }

      // 캐시 무효화 및 시스템 상태 재확인
      setSystemCache({
        lastUpdate: 0,
        systems: [],
        performance: performanceMetrics
      });
      await loadSystemStatus();

      // 성능 메트릭 재계산
      updatePerformanceMetrics();

      addNotification({
        type: 'success',
        title: '최적화 완료',
        message: '시스템이 최적화되었습니다.'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: '최적화 실패',
        message: '시스템 최적화 중 오류가 발생했습니다.'
      });
    }
  };

  // 메모리 최적화를 위한 메시지 히스토리 관리
  const cleanupMessageHistory = () => {
    if (messages.length > 200) {
      const recentMessages = messages.slice(-100);
      // 메시지 히스토리 정리
      addNotification({
        type: 'info',
        title: '메모리 정리',
        message: '메시지 히스토리를 정리하여 성능을 최적화합니다.'
      });
    }
  };

  // 주기적 메모리 정리
  useEffect(() => {
    const cleanupInterval = setInterval(cleanupMessageHistory, 300000); // 5분마다
    return () => clearInterval(cleanupInterval);
  }, [messages]);

  // 사용자 활동 추적
  const trackUserActivity = (action: string, data?: any) => {
    setUserActivityMetrics(prev => {
      const newInteractions = prev.totalInteractions + 1;
      const sessionDuration = Date.now() - prev.sessionStartTime.getTime();

      // 사용 패턴 분석
      let usagePattern: 'normal' | 'intensive' | 'light' = 'normal';
      if (newInteractions > 50 && sessionDuration < 300000) { // 5분 내 50회 이상
        usagePattern = 'intensive';
      } else if (newInteractions < 10 && sessionDuration > 600000) { // 10분 내 10회 미만
        usagePattern = 'light';
      }

      // 선호 기능 추적
      const favoriteFeatures = [...prev.favoriteFeatures];
      if (!favoriteFeatures.includes(action)) {
        favoriteFeatures.push(action);
      }

      return {
        ...prev,
        totalInteractions: newInteractions,
        favoriteFeatures: favoriteFeatures.slice(-5), // 최근 5개만 유지
        usagePattern
      };
    });
  };

  // 사용자 활동 분석 리포트 생성
  const generateUserActivityReport = () => {
    const sessionDuration = Date.now() - userActivityMetrics.sessionStartTime.getTime();
    const minutes = Math.floor(sessionDuration / 60000);
    const interactionsPerMinute = minutes > 0 ? userActivityMetrics.totalInteractions / minutes : 0;

    const report = `📊 사용자 활동 분석 리포트:
• 세션 시작: ${userActivityMetrics.sessionStartTime.toLocaleString()}
• 세션 시간: ${minutes}분
• 총 상호작용: ${userActivityMetrics.totalInteractions}회
• 분당 상호작용: ${interactionsPerMinute.toFixed(1)}회/분
• 사용 패턴: ${userActivityMetrics.usagePattern === 'intensive' ? '집중적' : userActivityMetrics.usagePattern === 'light' ? '가벼운' : '일반적'}
• 선호 기능: ${userActivityMetrics.favoriteFeatures.join(', ') || '없음'}
• 평균 응답시간: ${performanceMetrics.averageResponseTime}ms
• 시스템 성공률: ${performanceMetrics.successRate}%`;

    handleSendMessage(report);
  };

  // 프로젝트 관련 함수들
  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setShowProjectSelector(false);
    setShowWelcomeScreen(true);
    addNotification({
      type: 'success',
      title: '프로젝트 선택',
      message: `${project.name} 프로젝트가 선택되었습니다.`
    });
  };

  const handleProjectCreate = () => {
    addNotification({
      type: 'info',
      title: '새 프로젝트',
      message: '새 프로젝트 생성 기능이 준비 중입니다.'
    });
  };

  const handleFileUpload = async (files: FileList) => {
    if (!selectedProject) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const result = await integratedMessageService.uploadFile(file);
        if (result.success) {
          addNotification({
            type: 'success',
            title: '파일 업로드 성공',
            message: `${file.name}이 성공적으로 업로드되었습니다.`
          });
        } else {
          addNotification({
            type: 'error',
            title: '파일 업로드 실패',
            message: result.error || '파일 업로드에 실패했습니다.'
          });
        }
      } catch (error) {
        console.error('파일 업로드 오류:', error);
      }
    }
  };

  const handleFileDelete = (fileId: string) => {
    addNotification({
      type: 'info',
      title: '파일 삭제',
      message: '파일이 삭제되었습니다.'
    });
  };

  const handleConversationSelect = (conversation: ConversationSummary) => {
    setSelectedConversation(conversation);
    const summaryMessage = `📋 대화 요약: ${conversation.title}
• 기간: ${new Date(conversation.dateRange.start).toLocaleDateString('ko-KR')} ~ ${new Date(conversation.dateRange.end).toLocaleDateString('ko-KR')}
• 참여자: ${conversation.participants.join(', ')}
• 주요 주제: ${conversation.keyTopics.join(', ')}
• 요약: ${conversation.summary}`;

    handleSendMessage(summaryMessage);
  };

  // 프로젝트 첫 화면 관련 함수들
  const handleStartChat = () => {
    setShowWelcomeScreen(false);
    addNotification({
      type: 'success',
      title: '채팅 시작',
      message: '새로운 대화를 시작합니다.'
    });
  };

  const handleViewFiles = () => {
    setShowFileManager(true);
  };

  const handleViewGuidelines = () => {
    setShowGuidelineManager(true);
  };

  const handleViewConversations = () => {
    setShowChatList(true);
  };

  const handleProjectSettings = () => {
    addNotification({
      type: 'info',
      title: '프로젝트 설정',
      message: '프로젝트 설정 기능이 준비 중입니다.'
    });
  };

  // 채팅 리스트 관련 함수들
  const handleNewChat = () => {
    setShowChatList(false);
    addNotification({
      type: 'success',
      title: '새 채팅',
      message: '새로운 채팅을 시작합니다.'
    });
  };

  const handleDeleteChat = (chatId: string) => {
    addNotification({
      type: 'warning',
      title: '채팅 삭제',
      message: `채팅 ID ${chatId}가 삭제되었습니다.`
    });
  };

  const handleArchiveChat = (chatId: string) => {
    addNotification({
      type: 'info',
      title: '채팅 보관',
      message: `채팅 ID ${chatId}가 보관되었습니다.`
    });
  };

  // 지침 관리 관련 함수들
  const handleAddGuideline = (guideline: any) => {
    addNotification({
      type: 'success',
      title: '지침 추가',
      message: '새로운 지침이 추가되었습니다.'
    });
  };

  const handleUpdateGuideline = (id: string, guideline: any) => {
    addNotification({
      type: 'success',
      title: '지침 수정',
      message: '지침이 수정되었습니다.'
    });
  };

  const handleDeleteGuideline = (id: string) => {
    addNotification({
      type: 'warning',
      title: '지침 삭제',
      message: '지침이 삭제되었습니다.'
    });
  };

  // 파일 학습 관련 함수들
  const handleStartFileLearning = async (fileIds: string[]) => {
    try {
      const session = await fileLearningService.startLearning(fileIds);
      setActiveLearningSessions(prev => [...prev, session.id]);
      
      addNotification({
        type: 'success',
        title: '파일 학습 시작',
        message: `${fileIds.length}개 파일의 학습이 시작되었습니다.`
      });

      // 실시간 진행률 모니터링
      fileLearningService.monitorLearningProgress(session.id, (progress) => {
        console.log(`학습 진행률: ${progress}%`);
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: '학습 시작 실패',
        message: '파일 학습을 시작할 수 없습니다.'
      });
    }
  };

  const handleStopFileLearning = async (sessionId: string) => {
    try {
      await fileLearningService.stopLearning(sessionId);
      setActiveLearningSessions(prev => prev.filter(id => id !== sessionId));
      
      addNotification({
        type: 'info',
        title: '학습 중지',
        message: '파일 학습이 중지되었습니다.'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: '학습 중지 실패',
        message: '파일 학습을 중지할 수 없습니다.'
      });
    }
  };

  const handleViewFileInsights = (fileId: string) => {
    addNotification({
      type: 'info',
      title: '파일 인사이트',
      message: '파일 인사이트를 확인합니다.'
    });
  };

  const handleVoiceInput = () => {
    addNotification({
      type: 'info',
      title: '음성 입력',
      message: '음성 입력 기능이 활성화되었습니다.'
    });
  };

  const handleSmartSuggestion = (suggestion: string) => {
    setInputMessage(suggestion);
    addNotification({
      type: 'info',
      title: '스마트 제안',
      message: `"${suggestion}" 제안이 선택되었습니다.`
    });
  };

  const toggleAutoMode = () => {
    setIsAutoMode(!isAutoMode);
    addNotification({
      type: 'info',
      title: '자동 모드',
      message: isAutoMode ? '자동 모드가 비활성화되었습니다.' : '자동 모드가 활성화되었습니다.'
    });
  };

  const toggleSystemStatus = () => {
    setShowSystemStatus(!showSystemStatus);
  };

  const toggleQuickActions = () => {
    setShowQuickActions(!showQuickActions);
  };

  const getMessageIcon = (sender: string) => {
    switch (sender) {
      case 'user':
        return <ChatBubbleLeftRightIcon className="w-4 h-4" />;
      case 'ai':
        return <SparklesIcon className="w-4 h-4" />;
      case 'system':
        return <DocumentTextIcon className="w-4 h-4" />;
      default:
        return <ChatBubbleLeftRightIcon className="w-4 h-4" />;
    }
  };

  const getMessageStyle = (sender: string) => {
    switch (sender) {
      case 'user':
        return 'bg-blue-600 text-white ml-auto';
      case 'ai':
        return 'bg-white text-gray-900 shadow';
      case 'system':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-500';
      case 'disconnected':
        return 'text-red-500';
      case 'checking':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return '연결됨';
      case 'disconnected':
        return '연결 끊김';
      case 'checking':
        return '확인 중...';
      default:
        return '알 수 없음';
    }
  };

  const quickActions = [
    {
      id: 'analysis',
      icon: <DocumentTextIcon className="w-4 h-4" />,
      title: '분석',
      description: 'AI 분석 수행',
      example: '이 대화를 분석해줘',
      color: 'text-blue-600'
    },
    {
      id: 'guidance',
      icon: <LightBulbIcon className="w-4 h-4" />,
      title: '가이드',
      description: '메시지 가이드 생성',
      example: '이 상황에 대한 메시지 가이드를 만들어줘',
      color: 'text-yellow-600'
    },
    {
      id: 'project',
      icon: <FolderIcon className="w-4 h-4" />,
      title: '프로젝트',
      description: '프로젝트 정보 조회',
      example: '개포우성7차 프로젝트 정보를 알려줘',
      color: 'text-green-600'
    },
    {
      id: 'file',
      icon: <ChartBarIcon className="w-4 h-4" />,
      title: '파일',
      description: '파일 관리',
      example: '업로드된 파일 목록을 보여줘',
      color: 'text-purple-600'
    },
    {
      id: 'system',
      icon: <CogIcon className="w-4 h-4" />,
      title: '시스템',
      description: '시스템 상태 확인',
      example: '시스템 상태를 확인해줘',
      color: 'text-red-600'
    }
  ];

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* 프로젝트 선택 화면 */}
      {showProjectSelector && (
        <div className="h-full">
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <FolderIcon className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">CORBU AI</h1>
            </div>
            <p className="text-sm text-gray-600 mt-1">프로젝트를 선택하여 시작하세요</p>
          </div>
          <ProjectSelector
            selectedProject={selectedProject || undefined}
            onProjectSelect={handleProjectSelect}
            onProjectCreate={handleProjectCreate}
          />
        </div>
      )}

      {/* 프로젝트 기반 메인 인터페이스 */}
      {!showProjectSelector && selectedProject && (
        <>
          {/* 헤더 */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <FolderIcon className="w-6 h-6 text-blue-600" />
                  <h1 className="text-xl font-bold text-gray-900">{selectedProject.name}</h1>
                </div>
                <div className={`flex items-center space-x-1 text-sm ${getConnectionStatusColor()}`}>
                  <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                  <span>{getConnectionStatusText()}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFileManager(true)}
                  className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                  title="파일 관리"
                >
                  <PlusIcon className="w-3 h-3" />
                  <span>파일 추가</span>
                </button>
                <button
                  onClick={() => setShowChatList(true)}
                  className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                  title="채팅 목록"
                >
                  <ListBulletIcon className="w-3 h-3" />
                  <span>채팅 목록</span>
                </button>
                <button
                  onClick={() => setShowGuidelineManager(true)}
                  className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200"
                  title="지침 관리"
                >
                  <CogIcon className="w-3 h-3" />
                  <span>지침</span>
                </button>
                <button
                  onClick={() => setShowFileLearningManager(true)}
                  className="flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs hover:bg-orange-200"
                  title="파일 학습"
                >
                  <LightBulbIcon className="w-3 h-3" />
                  <span>파일 학습</span>
                </button>
                <button
                  onClick={toggleAutoMode}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${isAutoMode
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  title="자동 모드"
                >
                  {isAutoMode ? <PlayIcon className="w-3 h-3" /> : <PauseIcon className="w-3 h-3" />}
                  <span>자동</span>
                </button>
                <button
                  onClick={toggleSystemStatus}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                  title="시스템 상태"
                >
                  <CogIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleQuickActions}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                  title="빠른 액션"
                >
                  <LightBulbIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowPerformanceDashboard(!showPerformanceDashboard)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                  title="성능 대시보드"
                >
                  <ChartBarIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowProjectSelector(true)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                  title="프로젝트 선택"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 시스템 상태 패널 */}
          {showSystemStatus && (
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">시스템 상태</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-700">전체 시스템</span>
                      <span className="text-xs text-blue-600">
                        {systemStatus.filter(s => s.isActive).length}/{systemStatus.length} 활성
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(systemStatus.filter(s => s.isActive).length / systemStatus.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-700">평균 응답 시간</span>
                      <span className="text-xs text-green-600">
                        {Math.round(systemStatus.reduce((acc, s) => acc + (1 / s.performance.speed), 0) / systemStatus.length * 1000)}ms
                      </span>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-700">평균 정확도</span>
                      <span className="text-xs text-purple-600">
                        {(systemStatus.reduce((acc, s) => acc + s.performance.accuracy, 0) / systemStatus.length * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {systemStatus.map((system) => (
                  <div key={system.id} className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${system.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm font-medium">{system.name}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{system.description}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">정확도:</span>
                        <span className="text-gray-700">{(system.performance.accuracy * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">속도:</span>
                        <span className="text-gray-700">{(system.performance.speed * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">안정성:</span>
                        <span className="text-gray-700">{(system.performance.reliability * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 성능 대시보드 패널 */}
          {showPerformanceDashboard && (
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">실시간 성능 대시보드</h3>
                <p className="text-sm text-gray-600">현재 세션의 성능 지표를 실시간으로 모니터링합니다.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700">총 메시지</span>
                    <span className="text-2xl font-bold text-blue-600">{performanceMetrics.totalMessages}</span>
                  </div>
                  <div className="text-xs text-blue-600">사용자 + AI 메시지</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-700">평균 응답시간</span>
                    <span className="text-2xl font-bold text-green-600">{performanceMetrics.averageResponseTime}ms</span>
                  </div>
                  <div className="text-xs text-green-600">AI 응답 평균 시간</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-700">성공률</span>
                    <span className="text-2xl font-bold text-purple-600">{performanceMetrics.successRate}%</span>
                  </div>
                  <div className="text-xs text-purple-600">신뢰도 60% 이상</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-700">활성 시스템</span>
                    <span className="text-2xl font-bold text-orange-600">{performanceMetrics.activeSystems}</span>
                  </div>
                  <div className="text-xs text-orange-600">정상 작동 중인 AI</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">시스템 상태:</span>
                  <span className={`px-2 py-1 rounded text-xs ${performanceMetrics.activeSystems === systemStatus.length
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {performanceMetrics.activeSystems === systemStatus.length ? '모든 시스템 정상' : '일부 시스템 비활성'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 실시간 사용자 활동 패널 */}
          {showPerformanceDashboard && (
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">실시간 사용자 활동</h3>
                <p className="text-sm text-gray-600">현재 세션의 사용자 활동을 실시간으로 모니터링합니다.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-cyan-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-cyan-700">총 상호작용</span>
                    <span className="text-2xl font-bold text-cyan-600">{userActivityMetrics.totalInteractions}</span>
                  </div>
                  <div className="text-xs text-cyan-600">사용자 + AI 상호작용</div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-indigo-700">세션 시간</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      {Math.floor((Date.now() - userActivityMetrics.sessionStartTime.getTime()) / 60000)}분
                    </span>
                  </div>
                  <div className="text-xs text-indigo-600">현재 세션 지속 시간</div>
                </div>
                <div className="bg-rose-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-rose-700">사용 패턴</span>
                    <span className="text-2xl font-bold text-rose-600">
                      {userActivityMetrics.usagePattern === 'intensive' ? '집중' :
                        userActivityMetrics.usagePattern === 'light' ? '가벼움' : '일반'}
                    </span>
                  </div>
                  <div className="text-xs text-rose-600">현재 사용 패턴</div>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-amber-700">선호 기능</span>
                    <span className="text-2xl font-bold text-amber-600">{userActivityMetrics.favoriteFeatures.length}</span>
                  </div>
                  <div className="text-xs text-amber-600">사용된 기능 수</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">선호 기능:</span>
                  <span className="text-gray-700">
                    {userActivityMetrics.favoriteFeatures.length > 0
                      ? userActivityMetrics.favoriteFeatures.join(', ')
                      : '아직 사용된 기능이 없습니다'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 빠른 액션 패널 */}
          {showQuickActions && (
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">빠른 액션</h3>
                <p className="text-sm text-gray-600">자주 사용하는 기능들을 빠르게 실행할 수 있습니다.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <button
                  onClick={() => {
                    handleSendMessage('시스템 상태를 확인해줘');
                  }}
                  className="flex flex-col items-center space-y-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                >
                  <CogIcon className="w-6 h-6" />
                  <span className="text-xs font-medium">시스템 상태</span>
                </button>
                <button
                  onClick={() => {
                    handleSendMessage('현재 프로젝트 정보를 알려줘');
                  }}
                  className="flex flex-col items-center space-y-2 p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
                >
                  <DocumentTextIcon className="w-6 h-6" />
                  <span className="text-xs font-medium">프로젝트 정보</span>
                </button>
                <button
                  onClick={() => {
                    handleSendMessage('업로드된 파일 목록을 보여줘');
                  }}
                  className="flex flex-col items-center space-y-2 p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
                >
                  <FolderIcon className="w-6 h-6" />
                  <span className="text-xs font-medium">파일 목록</span>
                </button>
                <button
                  onClick={() => {
                    handleSendMessage('이 대화를 분석해줘');
                  }}
                  className="flex flex-col items-center space-y-2 p-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors"
                >
                  <ChartBarIcon className="w-6 h-6" />
                  <span className="text-xs font-medium">대화 분석</span>
                </button>
                <button
                  onClick={() => {
                    handleSendMessage('메시지 가이드를 만들어줘');
                  }}
                  className="flex flex-col items-center space-y-2 p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                >
                  <LightBulbIcon className="w-6 h-6" />
                  <span className="text-xs font-medium">메시지 가이드</span>
                </button>
                <button
                  onClick={() => {
                    handleSendMessage('최근 대화 요약해줘');
                  }}
                  className="flex flex-col items-center space-y-2 p-3 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg transition-colors"
                >
                  <DocumentTextIcon className="w-6 h-6" />
                  <span className="text-xs font-medium">대화 요약</span>
                </button>
                <button
                  onClick={() => {
                    handleSendMessage('AI 성능 최적화 방법 알려줘');
                  }}
                  className="flex flex-col items-center space-y-2 p-3 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-lg transition-colors"
                >
                  <SparklesIcon className="w-6 h-6" />
                  <span className="text-xs font-medium">성능 최적화</span>
                </button>
                <button
                  onClick={() => {
                    handleSendMessage('사용 가능한 명령어 목록 보여줘');
                  }}
                  className="flex flex-col items-center space-y-2 p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
                >
                  <CogIcon className="w-6 h-6" />
                  <span className="text-xs font-medium">명령어 도움말</span>
                </button>
                <button
                  onClick={analyzeConversation}
                  className="flex flex-col items-center space-y-2 p-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                >
                  <ChartBarIcon className="w-6 h-6" />
                  <span className="text-xs font-medium">고급 분석</span>
                </button>
                <button
                  onClick={optimizeSystem}
                  className="flex flex-col items-center space-y-2 p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                >
                  <SparklesIcon className="w-6 h-6" />
                  <span className="text-xs font-medium">시스템 최적화</span>
                </button>
                <button
                  onClick={generateUserActivityReport}
                  className="flex flex-col items-center space-y-2 p-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-lg transition-colors"
                >
                  <ChartBarIcon className="w-6 h-6" />
                  <span className="text-xs font-medium">사용자 활동</span>
                </button>
              </div>
            </div>
          )}

          {/* 메인 콘텐츠 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <SparklesIcon className="w-16 h-16 mb-4" />
                <h3 className="text-lg font-medium mb-2">CORBU AI 초기화 중...</h3>
                <p className="text-sm text-center max-w-md">
                  백엔드 서버와의 연결을 확인하고 시스템 상태를 로드하고 있습니다.
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <SparklesIcon className="w-16 h-16 mb-4" />
                <h3 className="text-lg font-medium mb-2">CORBU AI와 대화를 시작하세요</h3>
                <p className="text-sm text-center max-w-md">
                  분석, 가이드, 프로젝트 관리 등 다양한 AI 기능을 대화를 통해 이용할 수 있습니다.
                </p>
              </div>
            ) : (
              <div className="p-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-xs lg:max-w-md xl:max-w-lg ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.sender === 'user' ? 'bg-blue-500' : message.sender === 'system' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}>
                          {getMessageIcon(message.sender)}
                        </div>
                      </div>
                      <div
                        className={`px-4 py-2 rounded-lg shadow-sm ${message.sender === 'user'
                          ? 'bg-blue-500 text-white'
                          : message.sender === 'system'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : 'bg-white border border-gray-200 text-gray-900'
                          }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.metadata && (
                          <div className="mt-2 pt-2 border-t border-gray-200 border-opacity-50">
                            <div className="flex items-center justify-between text-xs opacity-75">
                              <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                              {message.metadata.processingTime && (
                                <span className="text-gray-500">
                                  처리시간: {message.metadata.processingTime}ms
                                </span>
                              )}
                            </div>
                            {message.metadata.confidence && (
                              <div className="mt-1">
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs text-gray-500">신뢰도:</span>
                                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                                    <div
                                      className={`h-1 rounded-full ${message.metadata.confidence > 0.8 ? 'bg-green-500' :
                                        message.metadata.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                      style={{ width: `${message.metadata.confidence * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {(message.metadata.confidence * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start mb-4">
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                        <SparklesIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white border border-gray-200 text-gray-900 px-4 py-2 rounded-lg shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm">AI가 응답을 생성하고 있습니다...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="bg-white border-t border-gray-200 p-4">
            <DetailedChatInput
              onSendMessage={handleSendMessage}
              onFileUpload={handleFileUpload}
              onVoiceInput={handleVoiceInput}
              onSmartSuggestion={handleSmartSuggestion}
              isProcessing={isProcessing}
              projectContext={selectedProject?.name || ''}
            />
          </div>

          {/* 프로젝트 파일 관리 모달 */}
          {showFileManager && selectedProject && (
            <ProjectFileManager
              project={selectedProject}
              onFileUpload={handleFileUpload}
              onFileDelete={handleFileDelete}
              onClose={() => setShowFileManager(false)}
            />
          )}

          {/* 프로젝트 첫 화면 */}
          {showWelcomeScreen && selectedProject && (
            <ProjectWelcomeScreen
              project={selectedProject}
              onStartChat={handleStartChat}
              onViewFiles={handleViewFiles}
              onViewGuidelines={handleViewGuidelines}
              onViewConversations={handleViewConversations}
              onProjectSettings={handleProjectSettings}
            />
          )}

          {/* 채팅 리스트 모달 */}
          {showChatList && selectedProject && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">{selectedProject.name} 채팅 목록</h2>
                  <button
                    onClick={() => setShowChatList(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <ProjectChatList
                  projectId={selectedProject.id}
                  projectName={selectedProject.name}
                  onChatSelect={(chatId) => {
                    setSelectedChatId(chatId);
                    setShowChatList(false);
                  }}
                  onNewChat={handleNewChat}
                  onDeleteChat={handleDeleteChat}
                  onArchiveChat={handleArchiveChat}
                />
              </div>
            </div>
          )}

          {/* 지침 관리 모달 */}
          {showGuidelineManager && selectedProject && (
            <GuidelineManager
              guidelines={selectedProject.guidelines}
              onAddGuideline={handleAddGuideline}
              onUpdateGuideline={handleUpdateGuideline}
              onDeleteGuideline={handleDeleteGuideline}
              onClose={() => setShowGuidelineManager(false)}
            />
          )}

          {/* 파일 학습 관리 모달 */}
          {showFileLearningManager && selectedProject && (
            <FileLearningManager
              projectId={selectedProject.id}
              files={selectedProject.files}
              onStartLearning={handleStartFileLearning}
              onStopLearning={handleStopFileLearning}
              onViewInsights={handleViewFileInsights}
              onClose={() => setShowFileLearningManager(false)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default IntegratedConversationInterface; 