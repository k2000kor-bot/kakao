import React, { useState, useRef, useEffect, useCallback } from 'react';
import AdvancedFeaturesPanel from './components/AdvancedFeaturesPanel';
import PerformanceMonitoringDashboard from './components/PerformanceMonitoringDashboard';
import WritingAssistant from './components/WritingAssistant';
import LanguageSelector from './components/LanguageSelector';
import NotificationCenter from './components/NotificationCenter';
import UserSettings from './components/UserSettings';
import SearchPanel from './components/SearchPanel';
import AdvancedSearchPanel from './components/AdvancedSearchPanel';
import BreadcrumbNavigation from './components/BreadcrumbNavigation';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import ErrorBoundary from './components/ErrorBoundary';
import MessageItem from './components/MessageItem';
import FileUploadZone from './components/FileUploadZone';
import SessionManager from './components/SessionManager';
import TypingIndicator from './components/TypingIndicator';
import MessageReply from './components/MessageReply';
import messageHistoryService from './services/messageHistoryService';
import errorReportingService from './services/errorReportingService';
import { sendChatMessage, isValidChatResponse } from './utils/apiClient';
import { streamChatMessage, isStreamingSupported } from './utils/streamingClient';
import { getUserFriendlyError, getErrorIcon } from './utils/errorMessages';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useDarkMode } from './hooks/useDarkMode';
import { useTranslation } from './hooks/useTranslation';
import { useNotifications } from './hooks/useNotifications';
import type { Message, ChatMode } from './types';
import './ModernChatInterface.css';

const ModernChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'ai',
      text: '안녕하세요! CORBU.AI입니다. 🚀\n저는 고급 감정 분석과 의도 파악 기능을 갖춘 AI 어시스턴트입니다.\n무엇을 도와드릴까요?',
      timestamp: new Date().toLocaleTimeString(),
      analysis: null
    }
  ]);

  const MAX_MESSAGES = 50;
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(null);
  const [currentMode, setCurrentMode] = useState<ChatMode>('chat');
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showSessionManager, setShowSessionManager] = useState(false);
  const [sessions, setSessions] = useState<Array<{ id: string; name: string; createdAt: string; updatedAt: string; messageCount?: number }>>([]);

  // 다크 모드
  const darkMode = useDarkMode();

  // 번역
  const { t } = useTranslation();

  // 알림
  const {
    notifications,
    addNotification,
    markAsRead,
    dismiss,
    clearAll,
    requestPermission,
  } = useNotifications();

  // 브라우저 알림 권한 요청
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);
  const [sessionId, setSessionId] = useState(() => {
    const saved = localStorage.getItem('chatSessionId');
    return saved || 'session-' + Math.random().toString(36).substring(2, 15);
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 세션 관리 함수들
  const handleSessionSelect = useCallback((selectedSessionId: string) => {
    setSessionId(selectedSessionId);
    setShowSessionManager(false);
    // 세션 변경 시 메시지 로드
    const savedMessages = messageHistoryService.getSessionMessages(selectedSessionId);
    if (savedMessages.length > 0) {
      setMessages(savedMessages.map((msg): Message => ({
        id: msg.id,
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.timestamp || new Date().toLocaleTimeString(),
        analysis: msg.metadata?.analysis || null,
        isLiked: msg.isLiked,
        isDisliked: msg.isDisliked,
        isBookmarked: msg.isBookmarked,
      })));
    } else {
      setMessages([{
        id: 1,
        sender: 'ai',
        text: '안녕하세요! CORBU.AI입니다. 🚀\n저는 고급 감정 분석과 의도 파악 기능을 갖춘 AI 어시스턴트입니다.\n무엇을 도와드릴까요?',
        timestamp: new Date().toLocaleTimeString(),
        analysis: null
      }]);
    }
  }, []);

  const handleSessionCreate = useCallback((name?: string) => {
    const newSessionId = 'session-' + Math.random().toString(36).substring(2, 15);
    const newSession = {
      id: newSessionId,
      name: name || `세션 ${sessions.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
    };
    setSessions(prev => [...prev, newSession]);
    handleSessionSelect(newSessionId);
    localStorage.setItem('chatSessions', JSON.stringify([...sessions, newSession]));
  }, [sessions, handleSessionSelect]);

  const handleSessionRename = useCallback((sessionIdToRename: string, newName: string) => {
    setSessions((prev) => {
      const updatedSessions = prev.map((s) => 
        s.id === sessionIdToRename ? { ...s, name: newName, updatedAt: new Date().toISOString() } : s
      );
      localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
      return updatedSessions;
    });
  }, []);

  const handleSessionDelete = useCallback((sessionIdToDelete: string) => {
    setSessions((prev) => {
      const updatedSessions = prev.filter((s) => s.id !== sessionIdToDelete);
      localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
      
      // 메시지 히스토리에서 세션 삭제
      messageHistoryService.deleteSession(sessionIdToDelete);
      
      if (sessionId === sessionIdToDelete && updatedSessions.length > 0) {
        handleSessionSelect(updatedSessions[0].id);
      } else if (updatedSessions.length === 0) {
        const newSessionId = 'session-' + Math.random().toString(36).substring(2, 15);
        setSessionId(newSessionId);
        setMessages([{
          id: 1,
          sender: 'ai',
          text: '안녕하세요! CORBU.AI입니다. 🚀\n저는 고급 감정 분석과 의도 파악 기능을 갖춘 AI 어시스턴트입니다.\n무엇을 도와드릴까요?',
          timestamp: new Date().toLocaleTimeString(),
          analysis: null
        }]);
      }
      
      return updatedSessions;
    });
  }, [sessionId, handleSessionSelect]);

  // 세션 목록 로드
  useEffect(() => {
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
      } catch (e) {
        console.error('Failed to parse saved sessions:', e);
      }
    } else {
      // 기본 세션 생성
      const defaultSession = {
        id: sessionId,
        name: '새 채팅',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0,
      };
      setSessions([defaultSession]);
      localStorage.setItem('chatSessions', JSON.stringify([defaultSession]));
    }
  }, []);

  // 세션 메시지 수 업데이트
  useEffect(() => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return { ...s, messageCount: messages.length, updatedAt: new Date().toISOString() };
      }
      return s;
    }));
  }, [messages.length, sessionId]);

  useEffect(() => {
    localStorage.setItem('chatSessionId', sessionId);
    // 세션 변경 시 저장된 메시지 로드
    const savedMessages = messageHistoryService.getSessionMessages(sessionId);
    if (savedMessages.length > 0) {
      setMessages(savedMessages.map(msg => ({
        id: msg.id,
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.timestamp,
        analysis: msg.metadata?.analysis || null,
        isLiked: msg.isLiked,
        isDisliked: msg.isDisliked,
        isBookmarked: msg.isBookmarked,
      })));
    }
  }, [sessionId]);

  // 메시지 변경 시 자동 저장 (디바운스)
  useEffect(() => {
    if (messages.length > 0) {
      const timeoutId = setTimeout(() => {
        messages.forEach(message => {
          messageHistoryService.saveMessage({
            id: message.id,
            sender: message.sender,
            text: message.text,
            timestamp: message.timestamp,
            sessionId: sessionId,
            isLiked: message.isLiked,
            isDisliked: message.isDisliked,
            isBookmarked: message.isBookmarked,
            metadata: {
              analysis: message.analysis,
            },
          });
        });
      }, 500); // 500ms 디바운스

      return () => clearTimeout(timeoutId);
    }
  }, [messages, sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startNewChat = useCallback(() => {
    const newSessionId = 'session-' + Math.random().toString(36).substring(2, 15);
    setSessionId(newSessionId);
    setMessages([{
      id: 1,
      sender: 'ai',
      text: '새로운 대화를 시작합니다! 무엇을 도와드릴까요?',
      timestamp: new Date().toLocaleTimeString(),
      analysis: null
    }]);
  }, []);

  // 키보드 단축키 설정
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrl: true,
      action: () => {
        startNewChat();
      },
      description: '새 채팅 시작',
    },
    {
      key: 'k',
      ctrl: true,
      action: () => {
        setShowSearch(true);
      },
      description: '검색 열기',
    },
    {
      key: 'l',
      ctrl: true,
      action: () => {
        textareaRef.current?.focus();
      },
      description: '입력창 포커스',
    },
    {
      key: ',',
      ctrl: true,
      action: () => {
        setShowSettings(true);
      },
      description: '설정 열기',
    },
    {
      key: '/',
      ctrl: true,
      action: () => {
        setShowShortcutsHelp(true);
      },
      description: '단축키 도움말',
    },
    {
      key: 'k',
      ctrl: true,
      shift: true,
      action: () => {
        setShowAdvancedSearch(true);
      },
      description: '고급 검색 열기',
    },
    {
      key: '/',
      ctrl: true,
      action: () => {
        setShowAdvancedSearch(true);
      },
      description: '고급 검색 열기',
    },
    {
      key: 'm',
      ctrl: true,
      action: () => {
        setCurrentMode('monitoring');
      },
      description: '성능 모니터링 열기',
    },
    {
      key: 'w',
      ctrl: true,
      action: () => {
        setCurrentMode('writing');
      },
      description: '글쓰기 모드 열기',
    },
    {
      key: '1',
      ctrl: true,
      action: () => {
        setCurrentMode('chat');
      },
      description: '일반 채팅 모드',
    },
    {
      key: '2',
      ctrl: true,
      action: () => {
        setCurrentMode('coding');
      },
      description: '코딩 파트너 모드',
    },
    {
      key: '3',
      ctrl: true,
      action: () => {
        setCurrentMode('analysis');
      },
      description: '분석 모드',
    },
  ]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // 메시지 액션 핸들러들 (메모이제이션)
  const handleCopyMessage = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    addNotification({
      type: 'success',
      title: '복사 완료',
      message: '메시지가 클립보드에 복사되었습니다.',
    });
  }, [addNotification]);

  const handleRegenerateMessage = useCallback((id: number) => {
    const messageToRegenerate = messages.find(m => m.id === id);
    if (messageToRegenerate) {
      setInputText(messageToRegenerate.text);
      addNotification({
        type: 'info',
        title: '재생성 준비',
        message: '메시지를 입력창에 불러왔습니다. 수정 후 전송하세요.',
      });
    }
  }, [messages, addNotification]);

  const handleLikeMessage = useCallback((id: number) => {
    setMessages(prev => prev.map(m =>
      m.id === id
        ? { ...m, isLiked: !m.isLiked, isDisliked: false }
        : m
    ));
  }, []);

  const handleDislikeMessage = useCallback((id: number) => {
    setMessages(prev => prev.map(m =>
      m.id === id
        ? { ...m, isDisliked: !m.isDisliked, isLiked: false }
        : m
    ));
  }, []);

  const handleBookmarkMessage = useCallback((id: number) => {
    const isBookmarked = messageHistoryService.toggleBookmark(id, sessionId);
    setMessages(prev => prev.map(m =>
      m.id === id
        ? { ...m, isBookmarked }
        : m
    ));
    addNotification({
      type: isBookmarked ? 'success' : 'info',
      title: isBookmarked ? '즐겨찾기 추가' : '즐겨찾기 제거',
      message: isBookmarked
        ? '메시지가 즐겨찾기에 추가되었습니다.'
        : '메시지가 즐겨찾기에서 제거되었습니다.',
    });
  }, [sessionId, addNotification]);

  const handleEditMessage = useCallback((id: number, newText: string) => {
    setMessages(prev => prev.map(m =>
      m.id === id
        ? { ...m, text: newText }
        : m
    ));
    
    // 메시지 히스토리 업데이트
    const message = messages.find(m => m.id === id);
    if (message) {
      messageHistoryService.saveMessage({
        id: message.id,
        sender: message.sender,
        text: newText,
        timestamp: message.timestamp,
        sessionId: sessionId,
        isLiked: message.isLiked,
        isDisliked: message.isDisliked,
        isBookmarked: message.isBookmarked,
        metadata: {
          analysis: message.analysis,
        },
      });
    }

    addNotification({
      type: 'success',
      title: '메시지 수정 완료',
      message: '메시지가 수정되었습니다.',
    });
  }, [messages, sessionId, addNotification]);

  const handleReplyToMessage = useCallback((id: number) => {
    const messageToReply = messages.find(m => m.id === id);
    if (messageToReply) {
      setReplyingTo(messageToReply);
      textareaRef.current?.focus();
    }
  }, [messages]);

  const getEmotionEmoji = (emotion: string): string => {
    const emojis: { [key: string]: string } = {
      'happy': '😊',
      'sad': '😢',
      'angry': '😤',
      'excited': '🎉',
      'neutral': '😐',
      'confused': '🤔',
      'curious': '🔍',
      'frustrated': '😩'
    };
    return emojis[emotion] || '😐';
  };

  const getIntentEmoji = (intent: string): string => {
    const emojis: { [key: string]: string } = {
      'question': '❓',
      'greeting': '👋',
      'request': '🙏',
      'complaint': '😠',
      'compliment': '👍',
      'goodbye': '👋',
      'help': '🆘',
      'information': 'ℹ️'
    };
    return emojis[intent] || 'ℹ️';
  };

  const sendMessage = async () => {
    let message = inputText.trim();
    if (message === '') return;

    // 답장 중인 경우 인용 메시지 추가
    if (replyingTo) {
      message = `> ${replyingTo.text.replace(/\n/g, '\n> ')}\n\n${message}`;
      setReplyingTo(null);
    }

    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: message,
      timestamp: new Date().toLocaleTimeString(),
      analysis: null
    };

    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      return newMessages.length > MAX_MESSAGES
        ? newMessages.slice(-MAX_MESSAGES)
        : newMessages;
    });

    setInputText('');

    // 스트리밍 지원 여부 확인
    const useStreaming = isStreamingSupported();
    
    if (useStreaming) {
      // 스트리밍 모드
      setIsStreaming(true);
      const aiMessageId = Date.now() + 1;
      setStreamingMessageId(aiMessageId);

      // 스트리밍 메시지 초기화
      const aiMessage: Message = {
        id: aiMessageId,
        sender: 'ai',
        text: '',
        timestamp: new Date().toLocaleTimeString(),
        analysis: null
      };

      setMessages(prev => {
        const newMessages = [...prev, aiMessage];
        return newMessages.length > MAX_MESSAGES
          ? newMessages.slice(-MAX_MESSAGES)
          : newMessages;
      });

      try {
        await streamChatMessage(message, sessionId, {
          onChunk: (chunk: string) => {
            setMessages(prev => prev.map(m =>
              m.id === aiMessageId
                ? { ...m, text: m.text + chunk }
                : m
            ));
            scrollToBottom();
          },
          onComplete: (fullText: string) => {
            setIsStreaming(false);
            setStreamingMessageId(null);
            
            // 최종 메시지 업데이트 (분석 데이터 포함)
            setMessages(prev => prev.map(m =>
              m.id === aiMessageId
                ? { ...m, text: fullText }
                : m
            ));

            addNotification({
              type: 'success',
              title: '응답 생성 완료',
              message: 'AI가 응답을 생성했습니다.',
            });
          },
          onError: (error: Error) => {
            setIsStreaming(false);
            setStreamingMessageId(null);
            
            const errorInfo = getUserFriendlyError(error);
            setMessages(prev => prev.map(m =>
              m.id === aiMessageId
                ? {
                    ...m,
                    text: `${getErrorIcon(errorInfo.type)} ${errorInfo.userMessage}\n\n${errorInfo.suggestions.map(s => `• ${s}`).join('\n')}`,
                  }
                : m
            ));

            addNotification({
              type: 'error',
              title: '스트리밍 오류',
              message: errorInfo.userMessage,
            });
          },
        });
      } catch (error) {
        setIsStreaming(false);
        setStreamingMessageId(null);
        
        const errorInfo = getUserFriendlyError(error);
        setMessages(prev => prev.map(m =>
          m.id === aiMessageId
            ? {
                ...m,
                text: `${getErrorIcon(errorInfo.type)} ${errorInfo.userMessage}\n\n${errorInfo.suggestions.map(s => `• ${s}`).join('\n')}`,
              }
            : m
        ));
      }
    } else {
      // 일반 모드 (기존 로직)
      setIsTyping(true);

      try {
        const data = await sendChatMessage(message, sessionId);
        setIsTyping(false);

        if (!isValidChatResponse(data)) {
          throw new Error('Invalid API response format');
        }

        if (data.success && data.response) {
        const aiMessage: Message = {
          id: Date.now() + 1,
          sender: 'ai',
          text: data.response,
          timestamp: new Date().toLocaleTimeString(),
          analysis: data.emotion_analysis && data.intent_analysis ? {
            emotion_analysis: data.emotion_analysis,
            intent_analysis: data.intent_analysis,
            success: true,
            response: data.response,
            response_time: data.response_time || 0,
            session_id: data.session_id || sessionId,
            timestamp: data.timestamp || new Date().toISOString(),
            type: data.type || 'chat',
          } : null
        };

        setMessages(prev => {
          const newMessages = [...prev, aiMessage];
          return newMessages.length > MAX_MESSAGES
            ? newMessages.slice(-MAX_MESSAGES)
            : newMessages;
        });

        // 성공 알림 추가
        addNotification({
          type: 'success',
          title: '응답 생성 완료',
          message: 'AI가 응답을 생성했습니다.',
        });
      } else {
        // API가 success: false를 반환한 경우
        const errorInfo = getUserFriendlyError(new Error(data.error || '알 수 없는 오류가 발생했습니다.'));

        // 에러 리포팅
        errorReportingService.reportError(
          new Error(data.error || 'API 응답 오류'),
          {
            severity: 'medium',
            additionalContext: {
              apiResponse: data,
              sessionId,
            },
          }
        );

        const errorMessage: Message = {
          id: Date.now() + 1,
          sender: 'ai',
          text: `${getErrorIcon(errorInfo.type)} ${errorInfo.userMessage}\n\n${errorInfo.suggestions.map(s => `• ${s}`).join('\n')}`,
          timestamp: new Date().toLocaleTimeString(),
          analysis: null
        };

        setMessages(prev => {
          const newMessages = [...prev, errorMessage];
          return newMessages.length > MAX_MESSAGES
            ? newMessages.slice(-MAX_MESSAGES)
            : newMessages;
        });

        addNotification({
          type: 'error',
          title: '응답 생성 실패',
          message: errorInfo.userMessage,
        });
        }
      } catch (error) {
        setIsTyping(false);
        setIsStreaming(false);
        setStreamingMessageId(null);

      // 에러 리포팅
      const errorObj = error instanceof Error ? error : new Error(String(error));
      errorReportingService.reportError(errorObj, {
        severity: 'high',
        additionalContext: {
          action: 'sendMessage',
          sessionId,
          message,
        },
      });

      const errorInfo = getUserFriendlyError(error);

      const errorMessage: Message = {
        id: Date.now() + 1,
        sender: 'ai',
        text: `${getErrorIcon(errorInfo.type)} ${errorInfo.userMessage}\n\n${errorInfo.suggestions.map(s => `• ${s}`).join('\n')}\n\n${errorInfo.canRetry ? '🔄 재시도 버튼을 클릭하여 다시 시도할 수 있습니다.' : ''}`,
        timestamp: new Date().toLocaleTimeString(),
        analysis: null
      };

      setMessages(prev => {
        const newMessages = [...prev, errorMessage];
        return newMessages.length > MAX_MESSAGES
          ? newMessages.slice(-MAX_MESSAGES)
          : newMessages;
      });

      addNotification({
        type: 'error',
        title: '전송 실패',
        message: errorInfo.userMessage,
        action: errorInfo.canRetry ? {
          label: '재시도',
          onClick: () => {
            setInputText(message);
            setTimeout(() => sendMessage(), 100);
          },
        } : undefined,
      });
    }
  };

  const sendQuickMessage = (message: string) => {
    setInputText(message);
    setTimeout(() => sendMessage(), 100);
  };


  const switchMode = (mode: ChatMode) => {
    setCurrentMode(mode);
    setShowAdvancedFeatures(false);

    const modeMessages: { [key: string]: string } = {
      'coding': '코딩 파트너 모드로 전환했습니다! 프로그래밍 관련 질문을 해주세요.',
      'analysis': '텍스트 분석 모드로 전환했습니다! 분석하고 싶은 텍스트를 입력해주세요.',
      'chat': '일반 채팅 모드입니다. 무엇이든 물어보세요!',
      'monitoring': '성능 모니터링 모드로 전환했습니다! 시스템 성능을 실시간으로 확인할 수 있습니다.'
    };

    const modeMessage: Message = {
      id: Date.now(),
      sender: 'ai',
      text: modeMessages[mode] || modeMessages['chat'],
      timestamp: new Date().toLocaleTimeString(),
      analysis: null
    };

    setMessages(prev => {
      const newMessages = [...prev, modeMessage];
      return newMessages.length > MAX_MESSAGES
        ? newMessages.slice(-MAX_MESSAGES)
        : newMessages;
    });
  };

  const handleFilesSelected = useCallback((files: Array<{ file: File; preview?: string; type: 'image' | 'document' | 'other' }>) => {
    files.forEach(({ file, preview, type }) => {
      let messageText = '';
      
      if (type === 'image' && preview) {
        messageText = `🖼️ 이미지 첨부: ${file.name}\n\n![${file.name}](${preview})`;
      } else if (type === 'document') {
        messageText = `📄 문서 첨부: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;
      } else {
        messageText = `📎 파일 첨부: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;
      }

      const fileMessage: Message = {
        id: Date.now() + Math.random(),
        sender: 'user',
        text: messageText,
        timestamp: new Date().toLocaleTimeString(),
        analysis: null,
      };

      setMessages(prev => {
        const newMessages = [...prev, fileMessage];
        return newMessages.length > MAX_MESSAGES
          ? newMessages.slice(-MAX_MESSAGES)
          : newMessages;
      });
    });

    addNotification({
      type: 'success',
      title: '파일 업로드 완료',
      message: `${files.length}개 파일이 업로드되었습니다.`,
    });
  }, [addNotification]);

  const handleFileUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.pdf,.doc,.docx,.csv,.json,.md';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const fileResults = Array.from(files).map(file => ({
          file,
          type: (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) 
            ? 'document' as const 
            : 'other' as const,
        }));
        handleFilesSelected(fileResults);
      }
    };
    input.click();
  }, [handleFilesSelected]);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        Promise.all(
          Array.from(files).map(async (file) => {
            const preview = await new Promise<string | undefined>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.onerror = () => resolve(undefined);
              reader.readAsDataURL(file);
            });
            return {
              file,
              preview,
              type: 'image' as const,
            };
          })
        ).then(handleFilesSelected);
      }
    };
    input.click();
  }, [handleFilesSelected]);

  const startVoiceInput = () => {
    const voiceMessage: Message = {
      id: Date.now(),
      sender: 'ai',
      text: '음성 입력 기능은 준비 중입니다. 곧 사용하실 수 있습니다!',
      timestamp: new Date().toLocaleTimeString(),
      analysis: null
    };

    setMessages(prev => {
      const newMessages = [...prev, voiceMessage];
      return newMessages.length > MAX_MESSAGES
        ? newMessages.slice(-MAX_MESSAGES)
        : newMessages;
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="app-container">
      {/* 사이드바 */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">CORBU.AI</div>
          <button className="new-chat-btn" onClick={startNewChat}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            새 채팅
          </button>
        </div>

        <div className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">기능</div>
            <div
              className={`nav-item ${currentMode === 'chat' ? 'active' : ''}`}
              onClick={() => switchMode('chat')}
            >
              <div className="nav-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              일반 채팅
            </div>
            <div
              className={`nav-item ${currentMode === 'coding' ? 'active' : ''}`}
              onClick={() => switchMode('coding')}
            >
              <div className="nav-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
              </div>
              코딩 파트너
            </div>
            <div
              className={`nav-item ${currentMode === 'analysis' ? 'active' : ''}`}
              onClick={() => switchMode('analysis')}
            >
              <div className="nav-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 19c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9zM21 3l-6 6" />
                </svg>
              </div>
              {t('sidebar.analysis')}
            </div>
            <button
              className={`nav-item ${showAdvancedFeatures ? 'active' : ''}`}
              onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowAdvancedFeatures(!showAdvancedFeatures);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="고급 기능 패널 열기/닫기"
            >
              <div className="nav-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              {t('sidebar.advancedFeatures')}
            </button>
            <button
              className={`nav-item ${currentMode === 'monitoring' ? 'active' : ''}`}
              onClick={() => {
                setCurrentMode('monitoring');
                setShowAdvancedFeatures(false);
              }}
              aria-label="성능 모니터링 대시보드 열기"
            >
              <div className="nav-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v18h18" />
                  <path d="M7 12l4-4 4 4 6-6" />
                </svg>
              </div>
              {t('sidebar.monitoring')}
            </button>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">세션 관리</div>
            <button
              className="nav-item"
              onClick={() => setShowSessionManager(!showSessionManager)}
              aria-label="세션 관리"
            >
              <div className="nav-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              세션 목록
            </button>
            {sessions.slice(0, 5).map((session) => (
              <div
                key={session.id}
                className={`nav-item ${sessionId === session.id ? 'active' : ''}`}
                onClick={() => handleSessionSelect(session.id)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSessionSelect(session.id);
                  }
                }}
              >
                <div className="nav-item-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                {session.name}
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">U</div>
            <div>
              <div style={{ fontWeight: 500, color: '#1f2937' }}>사용자</div>
              <div style={{ fontSize: '12px' }}>CORBU.AI Plus</div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="main-content">
        {/* 브레드크럼 네비게이션 */}
        <BreadcrumbNavigation
          items={[
            {
              label: '홈',
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              ),
              onClick: () => {
                setCurrentMode('chat');
                setShowAdvancedFeatures(false);
              },
            },
            ...(currentMode !== 'chat'
              ? [
                {
                  label:
                    currentMode === 'writing'
                      ? '글쓰기'
                      : currentMode === 'monitoring'
                        ? '성능 모니터링'
                        : currentMode === 'coding'
                          ? '코딩 파트너'
                          : '분석',
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  ),
                },
              ]
              : []),
            ...(showAdvancedFeatures
              ? [
                {
                  label: '고급 기능',
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    </svg>
                  ),
                },
              ]
              : []),
          ]}
        />

        <div className="main-header">
          <div className="header-left">
            <div className="header-title">CORBU.AI</div>
            <div className="model-selector">
              <span>고급 AI</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9" />
              </svg>
            </div>
          </div>
          <div className="header-right">
            <NotificationCenter
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onDismiss={dismiss}
              onClearAll={clearAll}
            />
            <LanguageSelector />
            <button className="upgrade-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {t('common.upgrade') || '업그레이드'}
            </button>
            <button
              className="theme-toggle-btn"
              onClick={darkMode.toggleDarkMode}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  darkMode.toggleDarkMode();
                }
              }}
              title={darkMode.isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
              aria-label={darkMode.isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
              {darkMode.isDarkMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button
              className="profile-btn"
              title="설정"
              onClick={() => setShowSettings(true)}
            >
              ⚙️
            </button>
          </div>
        </div>

        {/* 설정 모달 */}
        {showSettings && (
          <UserSettings onClose={() => setShowSettings(false)} />
        )}

        {/* 검색 패널 */}
        {showSearch && (
          <ErrorBoundary
            fallback={
              <div className="error-fallback" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10000 }}>
                <h3>검색 패널 로드 실패</h3>
                <p>검색 패널을 불러오는 중 오류가 발생했습니다.</p>
                <button onClick={() => setShowSearch(false)}>닫기</button>
              </div>
            }
          >
            <SearchPanel
              isOpen={showSearch}
              onClose={() => setShowSearch(false)}
              onSelect={(result) => {
                // 검색 결과 선택 시 처리
                if (result.type === 'message') {
                  // 메시지로 스크롤
                  setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                } else if (result.type === 'writing') {
                  // 글쓰기 모드로 전환
                  setCurrentMode('writing');
                }
              }}
            />
          </ErrorBoundary>
        )}

        {/* 검색 패널 */}
        {showSearch && (
          <ErrorBoundary
            fallback={
              <div className="error-fallback" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10000 }}>
                <h3>검색 패널 로드 실패</h3>
                <p>검색 패널을 불러오는 중 오류가 발생했습니다.</p>
                <button onClick={() => setShowSearch(false)}>닫기</button>
              </div>
            }
          >
            <SearchPanel
              isOpen={showSearch}
              onClose={() => setShowSearch(false)}
              onSelect={(result) => {
                if (result.type === 'message') {
                  setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                } else if (result.type === 'writing') {
                  setCurrentMode('writing');
                }
              }}
            />
          </ErrorBoundary>
        )}

        {/* 고급 검색 패널 */}
        {showAdvancedSearch && (
          <ErrorBoundary
            fallback={
              <div className="error-fallback" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10000 }}>
                <h3>고급 검색 패널 로드 실패</h3>
                <p>고급 검색 패널을 불러오는 중 오류가 발생했습니다.</p>
                <button onClick={() => setShowAdvancedSearch(false)}>닫기</button>
              </div>
            }
          >
            <AdvancedSearchPanel
              isOpen={showAdvancedSearch}
              onClose={() => setShowAdvancedSearch(false)}
              onSelect={(result) => {
                if (result.type === 'message' && result.metadata?.sessionId) {
                  if (result.metadata.sessionId !== sessionId) {
                    setSessionId(result.metadata.sessionId);
                  }
                  setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                } else if (result.type === 'writing') {
                  setCurrentMode('writing');
                }
              }}
            />
          </ErrorBoundary>
        )}

        {/* 키보드 단축키 도움말 */}
        <KeyboardShortcutsHelp
          isOpen={showShortcutsHelp}
          onClose={() => setShowShortcutsHelp(false)}
        />

        <div className="chat-container">
          {currentMode === 'writing' ? (
            <div className="writing-wrapper">
              <ErrorBoundary
                fallback={
                  <div className="error-fallback">
                    <h3>글쓰기 어시스턴트 로드 실패</h3>
                    <p>글쓰기 어시스턴트를 불러오는 중 오류가 발생했습니다.</p>
                    <button onClick={() => setCurrentMode('chat')}>채팅으로 돌아가기</button>
                  </div>
                }
              >
                <WritingAssistant
                  onGenerate={(content) => {
                    // 생성된 글을 채팅 메시지로 추가
                    const message: Message = {
                      id: Date.now(),
                      sender: 'ai',
                      text: `📝 생성된 글:\n\n${content}`,
                      timestamp: new Date().toLocaleTimeString(),
                      analysis: null,
                    };
                    setMessages((prev) => [...prev, message]);

                    // 글쓰기 완료 알림
                    addNotification({
                      type: 'writing',
                      title: '글쓰기 생성 완료',
                      message: '새로운 글이 생성되었습니다.',
                      action: {
                        label: '보기',
                        onClick: () => {
                          // 메시지로 스크롤
                          setTimeout(() => {
                            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        },
                      },
                    });
                  }}
                />
              </ErrorBoundary>
            </div>
          ) : currentMode === 'monitoring' ? (
            <div className="monitoring-wrapper">
              <ErrorBoundary
                fallback={
                  <div className="error-fallback">
                    <h3>성능 모니터링 로드 실패</h3>
                    <p>성능 모니터링 대시보드를 불러오는 중 오류가 발생했습니다.</p>
                    <button onClick={() => window.location.reload()}>페이지 새로고침</button>
                  </div>
                }
              >
                <PerformanceMonitoringDashboard
                  refreshInterval={30}
                  showPredictions={true}
                />
              </ErrorBoundary>
            </div>
          ) : showAdvancedFeatures ? (
            <div className="advanced-features-wrapper">
              <div className="advanced-features-header">
                <h2>고급 기능</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowAdvancedFeatures(false)}
                  title="닫기"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <ErrorBoundary
                fallback={
                  <div className="error-fallback">
                    <h3>고급 기능 패널 로드 실패</h3>
                    <p>고급 기능 패널을 불러오는 중 오류가 발생했습니다.</p>
                    <button onClick={() => setShowAdvancedFeatures(false)}>패널 닫기</button>
                  </div>
                }
              >
                <AdvancedFeaturesPanel
                  userId={sessionId}
                  onImageAnalyzed={(result) => {
                    const imageMessage: Message = {
                      id: Date.now(),
                      sender: 'ai',
                      text: `🖼️ 이미지 분석 완료!\n\n이미지 크기: ${result.analysis?.image_info.width}x${result.analysis?.image_info.height}\n형식: ${result.analysis?.image_info.format}\n${result.analysis?.object_detection
                        ? `감지된 객체: ${result.analysis.object_detection.total_objects}개\n`
                        : ''
                        }${result.analysis?.ocr_results?.extracted_text
                          ? `추출된 텍스트: ${result.analysis.ocr_results.extracted_text}\n`
                          : ''
                        }`,
                      timestamp: new Date().toLocaleTimeString(),
                      analysis: null
                    };
                    setMessages(prev => [...prev, imageMessage]);
                  }}
                  onPredictionComplete={(type, result) => {
                    let predictionText = '';
                    if (type === 'user_activity' && result.prediction) {
                      predictionText = `👤 사용자 활동 예측 완료!\n\n다음 예상 활동:\n${result.prediction.predicted_activities.map((a: any) => `- ${a.activity} (${(a.probability * 100).toFixed(1)}%)`).join('\n')}`;
                    } else if (type === 'message_quality' && result.quality_analysis) {
                      predictionText = `✍️ 메시지 품질 분석 완료!\n\n종합 점수: ${(result.quality_analysis.overall_score * 100).toFixed(1)}점\n품질 수준: ${result.quality_analysis.quality_level}\n\n개선 제안:\n${result.quality_analysis.suggestions.map((s: string) => `- ${s}`).join('\n')}`;
                    } else if (type === 'system_performance' && result.performance_prediction) {
                      predictionText = `⚙️ 시스템 성능 예측 완료!\n\n예상 CPU: ${result.performance_prediction.predicted_metrics.cpu_usage.toFixed(1)}%\n예상 메모리: ${result.performance_prediction.predicted_metrics.memory_usage.toFixed(1)}%\n응답 시간: ${result.performance_prediction.predicted_metrics.response_time_ms.toFixed(0)}ms`;
                    }

                    if (predictionText) {
                      const predictionMessage: Message = {
                        id: Date.now(),
                        sender: 'ai',
                        text: predictionText,
                        timestamp: new Date().toLocaleTimeString(),
                        analysis: null
                      };
                      setMessages(prev => [...prev, predictionMessage]);
                    }
                  }}
                />
              </ErrorBoundary>
            </div>
          ) : (
            <>
              <div
                className="chat-messages"
                role="log"
                aria-label="채팅 메시지 목록"
                aria-live="polite"
                aria-atomic="false"
              >
                {messages.map((message) => (
                  <MessageItem
                    key={message.id}
                    id={message.id}
                    sender={message.sender}
                    text={message.text}
                    timestamp={message.timestamp}
                    analysis={message.analysis}
                    isLiked={message.isLiked}
                    isDisliked={message.isDisliked}
                    isBookmarked={message.isBookmarked}
                    sessionId={sessionId}
                    onCopy={handleCopyMessage}
                    onRegenerate={handleRegenerateMessage}
                    onEdit={handleEditMessage}
                    onReply={handleReplyToMessage}
                    onLike={handleLikeMessage}
                    onDislike={handleDislikeMessage}
                    onBookmark={handleBookmarkMessage}
                  />
                ))}

                {(isTyping || isStreaming) && !streamingMessageId && (
                  <div
                    className="message ai typing-message"
                    role="status"
                    aria-live="polite"
                    aria-label="AI가 메시지를 입력 중입니다"
                  >
                    <div className="message-avatar" aria-hidden="true">AI</div>
                    <div className="message-content">
                      <TypingIndicator 
                        userName="AI"
                        size="medium"
                        theme="primary"
                      />
                      <div className="message-time" aria-hidden="true">
                        {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-container">
                <div className="quick-actions">
                  <button className="quick-action-btn" onClick={() => sendQuickMessage('안녕하세요!')}>인사</button>
                  <button className="quick-action-btn" onClick={() => sendQuickMessage('파이썬 웹 개발에 대해 알려주세요')}>웹 개발</button>
                  <button className="quick-action-btn" onClick={() => sendQuickMessage('머신러닝 기초를 설명해주세요')}>머신러닝</button>
                  <button className="quick-action-btn" onClick={() => sendQuickMessage('데이터 분석 도구를 추천해주세요')}>데이터 분석</button>
                </div>

                <div className="input-wrapper" role="form" aria-label="메시지 입력">
                  <div className="input-attachments" role="group" aria-label="첨부 파일 옵션">
                    <button
                      className="attachment-btn"
                      onClick={handleFileUpload}
                      title="파일 첨부"
                      aria-label="파일 첨부"
                      type="button"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49" />
                      </svg>
                    </button>
                    <button
                      className="attachment-btn"
                      onClick={handleImageUpload}
                      title="이미지 첨부"
                      aria-label="이미지 첨부"
                      type="button"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21,15 16,10 5,21" />
                      </svg>
                    </button>
                  </div>

                  {/* 파일 업로드 존 (드래그 앤 드롭) - 접을 수 있는 형태로 표시 */}
                  {!isTyping && (
                    <FileUploadZone
                      onFilesSelected={handleFilesSelected}
                      accept="*/*"
                      multiple={true}
                      maxSize={10 * 1024 * 1024}
                      maxFiles={5}
                      disabled={isTyping}
                    />
                  )}

                  <textarea
                    ref={textareaRef}
                    className="chat-input"
                    placeholder="CORBU.AI에게 무엇이든 물어보세요..."
                    value={inputText}
                    onChange={handleTextareaChange}
                    onKeyPress={handleKeyPress}
                    rows={1}
                    aria-label="메시지 입력창"
                    aria-describedby="input-hint"
                    aria-required="true"
                  />
                  <span id="input-hint" className="sr-only">
                    Enter 키를 누르면 메시지가 전송되고, Shift+Enter를 누르면 줄바꿈됩니다.
                  </span>

                  <div className="input-actions">
                    <button
                      className="voice-btn"
                      onClick={startVoiceInput}
                      title="음성 입력"
                      aria-label="음성 입력"
                      type="button"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                      </svg>
                    </button>
                    <button
                      className="send-btn"
                      onClick={sendMessage}
                      title="전송"
                      aria-label="메시지 전송"
                      disabled={!inputText.trim() || isTyping}
                      type="submit"
                      aria-disabled={!inputText.trim() || isTyping}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22,2 15,22 11,13 2,9 22,2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 세션 관리 모달 */}
      {showSessionManager && (
        <div className="modal-overlay" onClick={() => setShowSessionManager(false)}>
          <div className="modal-content session-manager-modal" onClick={(e) => e.stopPropagation()}>
            <SessionManager
              currentSessionId={sessionId}
              sessions={sessions}
              onSessionSelect={handleSessionSelect}
              onSessionCreate={handleSessionCreate}
              onSessionRename={handleSessionRename}
              onSessionDelete={handleSessionDelete}
              onClose={() => setShowSessionManager(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernChatInterface;