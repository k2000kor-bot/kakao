import React, { useState, useRef, useEffect } from 'react';
import ChatSidebar from './ChatSidebar';
import {
  uploadMediaFile,
  analyzeMediaFile,
  generateConversationalResponse,
  getFileList,
  getAnalysisResults,
  deleteFile,
  uploadMultipleFiles,
  checkAnalysisStatus,
  AnalysisResult,
  AdvancedAnalysisOptions,
  performAdvancedAnalysis
} from '../services/advancedMediaAnalysisAPI';

interface ChatGPTInterfaceProps {
  selectedRoomId?: string;
  sidebarCommand?: string;
  onSidebarCommandHandled?: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  type?: 'text' | 'card' | 'list';
  cardData?: any;
}

interface Project {
  id: string;
  name: string;
  description: string;
  fileCount: number;
  lastUpdated: string;
}

interface AttachedFile {
  id: string;
  file: File;
  type: 'image' | 'video' | 'audio' | 'document';
  size: string;
  uploadedAt: string;
  uploadStatus: 'uploading' | 'uploaded' | 'analyzing' | 'completed' | 'failed';
}

interface ConversationMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
}

// ChatRoom 타입을 import하거나 기존 타입 사용
interface ChatRoom {
  id: string;
  name: string;
  type: 'project' | 'system' | 'general' | 'analysis';
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

const ChatGPTInterface: React.FC<ChatGPTInterfaceProps> = ({ selectedRoomId, sidebarCommand, onSidebarCommandHandled }) => {
  const [inputMessage, setInputMessage] = useState('무엇이든 물어보세요');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showGuidelineModal, setShowGuidelineModal] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [showConversationSummary, setShowConversationSummary] = useState(false);
  const [showChatList, setShowChatList] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chatSortBy, setChatSortBy] = useState<'latest' | 'popular' | 'usage'>('latest');
  const [showChatDetail, setShowChatDetail] = useState(false);
  const [currentChatMessages, setCurrentChatMessages] = useState<ConversationMessage[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [projects] = useState<Project[]>([
    { id: '1', name: '개포우성7차', description: '개포우성7차 프로젝트 설명', fileCount: 20, lastUpdated: '2024-01-15' },
    { id: '2', name: '잠실우성_대화요약', description: '잠실우성_대화요약 설명', fileCount: 15, lastUpdated: '2024-01-14' },
    { id: '3', name: '삼성홍보_반박자료', description: '삼성홍보_반박자료 설명', fileCount: 8, lastUpdated: '2024-01-13' }
  ]);

  // 채팅방 데이터
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([
    {
      id: '1',
      name: '개포우성7차',
      type: 'project',
      lastMessage: '프로젝트 진행 중...',
      timestamp: '방금 전',
      unreadCount: 0
    },
    {
      id: '2',
      name: '개포우성8차',
      type: 'project',
      lastMessage: '계획 수립 중...',
      timestamp: '1시간 전',
      unreadCount: 0
    },
    {
      id: '3',
      name: '개포우성9차',
      type: 'project',
      lastMessage: '검토 완료',
      timestamp: '2시간 전',
      unreadCount: 0
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceRecognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 음성 인식 초기화
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      voiceRecognitionRef.current = new (window as any).webkitSpeechRecognition();
      voiceRecognitionRef.current.continuous = false;
      voiceRecognitionRef.current.interimResults = false;
      voiceRecognitionRef.current.lang = 'ko-KR';
    }
  }, []);

  // 컴포넌트 마운트 시 입력창에 자동 포커스 및 커서 위치 설정
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      // 커서를 텍스트 끝에 위치시킴
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, []);

  // 사이드바 명령 프리셋이 들어오면 입력창에 자동 입력 또는 바로 실행
  useEffect(() => {
    if (sidebarCommand) {
      handleSidebarCommand(sidebarCommand);
      if (onSidebarCommandHandled) onSidebarCommandHandled();
    }
  }, [sidebarCommand, onSidebarCommandHandled]);

  // 파일 타입 판별
  const getFileType = (file: File): AttachedFile['type'] => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'csv'].includes(extension || '')) return 'document';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) return 'image';
    if (['mp4', 'mov', 'avi'].includes(extension || '')) return 'video';
    if (['mp3', 'wav', 'm4a'].includes(extension || '')) return 'audio';
    return 'document';
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 실제 파일 업로드 및 분석
  const handleFileUpload = async (file: File): Promise<AttachedFile> => {
    const attachedFile: AttachedFile = {
      id: Date.now().toString() + Math.random(),
      file,
      type: getFileType(file),
      size: formatFileSize(file.size),
      uploadedAt: new Date().toLocaleTimeString(),
      uploadStatus: 'uploading'
    };

    try {
      // 1. 파일 업로드
      const uploadResult = await uploadMediaFile(file);
      attachedFile.uploadStatus = 'uploaded';

      // 2. 파일 분석 시작
      attachedFile.uploadStatus = 'analyzing';
      const analysisResult = await analyzeMediaFile(uploadResult.id);

      attachedFile.uploadStatus = 'completed';

      return attachedFile;
    } catch (error) {
      console.error('File upload/analysis error:', error);
      attachedFile.uploadStatus = 'failed';
      return attachedFile;
    }
  };

  const handleChatClick = (chatId: string) => {
    setShowChatDetail(true);
    setShowProjectDetails(false);
    setSelectedChatId(chatId);

    // 선택된 채팅의 메시지 로드 (실제로는 API에서 가져와야 함)
    const selectedChat = chatRooms.find(chat => chat.id === chatId);
    if (selectedChat) {
      // 채팅 상세 페이지에서는 새로운 메시지 배열로 시작
      setMessages([
        {
          id: '1',
          sender: 'ai',
          content: `안녕하세요! ${selectedChat.name}에서 무엇을 도와드릴까요?`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }
  };

  const handleBackToProject = () => {
    setShowChatDetail(false);
    setShowProjectDetails(true);
    setSelectedChatId(null);
  };

  const handleCloseProjectDetails = () => {
    setShowProjectDetails(false);
    setShowChatDetail(false);
    setSelectedChatId(null);
    setMessages([]);
  };

  const handleSidebarCommand = (command: string) => {
    switch (command) {
      case 'show_projects':
        // 자동 메시지 추가 제거
        break;
      case 'show_files':
        // 자동 메시지 추가 제거
        break;
      case 'show_guidelines':
        // 자동 메시지 추가 제거
        break;
      case 'show_analysis':
        // 자동 메시지 추가 제거
        break;
      case 'show_templates':
        // 자동 메시지 추가 제거
        break;
      case 'show_export':
        // 자동 메시지 추가 제거
        break;
      case 'show_project_details':
        setSelectedProject('1');
        setShowProjectDetails(true);
        break;
      default:
        break;
    }
  };

  // 프로젝트 카드 출력
  const showProjectsCard = () => {
    const message: Message = {
      id: Date.now().toString(),
      sender: 'ai',
      content: '📁 **프로젝트 목록**',
      timestamp: new Date().toLocaleTimeString(),
      type: 'card',
      cardData: {
        type: 'projects',
        projects: projects
      }
    };
    setMessages(prev => [...prev, message]);
  };

  // 프로젝트 파일 카드 출력
  const showProjectFilesCard = () => {
    const files = [
      { name: '개포우성_대화내용.txt', size: '2.3MB', date: '2024-01-15' },
      { name: '잠실우성_요약보고서.pdf', size: '1.8MB', date: '2024-01-14' },
      { name: '삼성홍보_반박자료.docx', size: '3.1MB', date: '2024-01-13' },
      { name: '분석결과_차트.xlsx', size: '0.9MB', date: '2024-01-12' }
    ];

    const message: Message = {
      id: Date.now().toString(),
      sender: 'ai',
      content: '📂 **프로젝트 파일 목록**',
      timestamp: new Date().toLocaleTimeString(),
      type: 'card',
      cardData: {
        type: 'files',
        files: files
      }
    };
    setMessages(prev => [...prev, message]);
  };

  // 지침 카드 출력
  const showGuidelinesCard = () => {
    const guidelines = [
      { title: '글쓰기 지침', content: '명확하고 간결한 문장 사용' },
      { title: '분석 지침', content: '데이터 기반 객관적 분석' },
      { title: '인용 지침', content: '출처 명시 및 적절한 인용' },
      { title: '보고서 지침', content: '구조화된 보고서 작성' }
    ];

    const message: Message = {
      id: Date.now().toString(),
      sender: 'ai',
      content: '📋 **작업 지침**',
      timestamp: new Date().toLocaleTimeString(),
      type: 'card',
      cardData: {
        type: 'guidelines',
        guidelines: guidelines
      }
    };
    setMessages(prev => [...prev, message]);
  };

  // 분석 기록 카드 출력
  const showAnalysisHistoryCard = () => {
    const history = [
      { date: '2024-01-15', type: '파일 분석', result: '완료', files: 3 },
      { date: '2024-01-14', type: '요약 생성', result: '완료', files: 2 },
      { date: '2024-01-13', type: '카드뉴스', result: '완료', files: 1 },
      { date: '2024-01-12', type: '보고서 작성', result: '진행중', files: 5 }
    ];

    const message: Message = {
      id: Date.now().toString(),
      sender: 'ai',
      content: '📊 **분석 기록**',
      timestamp: new Date().toLocaleTimeString(),
      type: 'card',
      cardData: {
        type: 'history',
        history: history
      }
    };
    setMessages(prev => [...prev, message]);
  };

  // 템플릿 카드 출력
  const showTemplatesCard = () => {
    const templates = [
      { name: '보고서 템플릿', description: '구조화된 보고서 작성' },
      { name: '요약 템플릿', description: '핵심 내용 요약' },
      { name: '분석 템플릿', description: '데이터 분석 보고서' },
      { name: '카드뉴스 템플릿', description: '소셜미디어용 카드뉴스' }
    ];

    const message: Message = {
      id: Date.now().toString(),
      sender: 'ai',
      content: '📝 **작성 템플릿**',
      timestamp: new Date().toLocaleTimeString(),
      type: 'card',
      cardData: {
        type: 'templates',
        templates: templates
      }
    };
    setMessages(prev => [...prev, message]);
  };

  // 내보내기 옵션 카드 출력
  const showExportOptionsCard = () => {
    const exportOptions = [
      { format: 'PDF', description: '고품질 문서 출력' },
      { format: 'Word', description: '편집 가능한 문서' },
      { format: 'Excel', description: '데이터 분석 결과' },
      { format: 'PowerPoint', description: '프레젠테이션용' },
      { format: 'HTML', description: '웹 페이지 형식' }
    ];

    const message: Message = {
      id: Date.now().toString(),
      sender: 'ai',
      content: '📤 **내보내기 옵션**',
      timestamp: new Date().toLocaleTimeString(),
      type: 'card',
      cardData: {
        type: 'export',
        exportOptions: exportOptions
      }
    };
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = async () => {
    // 기본 문구인 경우 무시
    if (inputMessage.trim() === '' || inputMessage === '무엇이든 물어보세요') return;

    // 현재 페이지에 따라 다른 동작
    if (showProjectDetails) {
      // 프로젝트 상세 페이지에서는 채팅 목록에 추가
      const newChat: ChatRoom = {
        id: Date.now().toString(),
        name: `개포우성7차 채팅 ${chatRooms.filter(chat => chat.name.includes('개포우성7차')).length + 1}`,
        type: 'project',
        lastMessage: inputMessage,
        timestamp: new Date().toLocaleTimeString(),
        unreadCount: 0
      };

      setChatRooms(prev => [...prev, newChat]);
      setInputMessage('무엇이든 물어보세요');

      // 채팅 목록에 추가되었다는 메시지 표시
      const systemMessage: Message = {
        id: Date.now().toString(),
        sender: 'ai',
        content: `새로운 채팅이 생성되었습니다: "${newChat.name}"`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, systemMessage]);

    } else if (showChatDetail) {
      // 채팅 상세 페이지에서는 실제 대화 진행
      const userMessage: Message = {
        id: Date.now().toString(),
        sender: 'user',
        content: inputMessage,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      // AI 응답 생성
      const aiResponse = await generateAIResponse(inputMessage, selectedFiles);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
      setInputMessage('무엇이든 물어보세요');

    } else {
      // 메인 페이지에서는 일반적인 대화
      const userMessage: Message = {
        id: Date.now().toString(),
        sender: 'user',
        content: inputMessage,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      // AI 응답 생성
      const aiResponse = await generateAIResponse(inputMessage, selectedFiles);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
      setInputMessage('무엇이든 물어보세요');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    // 기본 문구가 있고 사용자가 타이핑을 시작하면 기본 문구를 지움
    if (inputMessage === '무엇이든 물어보세요' && value !== '무엇이든 물어보세요') {
      setInputMessage(value);
    } else {
      setInputMessage(value);
    }

    // 자동 높이 조절 (18줄까지)
    const textarea = e.target;
    textarea.style.height = 'auto';
    const maxHeight = 432; // 18줄 * 24px
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setSelectedFiles(prev => [...prev, ...newFiles]);

      // 파일 모달이 열려있으면 파일 추가 처리
      if (showFileModal) {
        newFiles.forEach(file => {
          console.log('파일 추가됨:', file.name);
          // 여기에 실제 파일 업로드 로직 추가
        });
      }
    }
  };

  const handleRemoveFile = (fileToRemove: AttachedFile) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileToRemove.id));
    setSelectedFiles(prev => prev.filter(file => file !== fileToRemove.file));

    const message: Message = {
      id: Date.now().toString(),
      sender: 'ai',
      content: `${fileToRemove.file.name} 파일이 제거되었습니다.`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const handleVoiceInput = () => {
    if (!voiceRecognitionRef.current) {
      alert('음성 인식이 지원되지 않는 브라우저입니다.');
      return;
    }

    setIsRecording(true);

    voiceRecognitionRef.current.onstart = () => {
      setIsRecording(true);
    };

    voiceRecognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsRecording(false);
    };

    voiceRecognitionRef.current.onerror = () => {
      setIsRecording(false);
    };

    voiceRecognitionRef.current.start();
  };

  const handleAnalyzeFiles = async () => {
    if (selectedFiles.length === 0) {
      alert('분석할 파일을 먼저 첨부해주세요.');
      return;
    }

    setIsAnalyzing(true);

    try {
      // 고급 분석 옵션 설정
      const analysisOptions: AdvancedAnalysisOptions = {
        extract_keywords: true,
        sentiment_analysis: true,
        entity_recognition: true,
        summarization: true,
        custom_prompts: ['주요 내용을 추출해주세요', '핵심 키워드를 찾아주세요']
      };

      // 각 파일에 대해 고급 분석 수행
      const results = await Promise.all(
        attachedFiles.map(async (attachedFile) => {
          if (attachedFile.uploadStatus === 'completed') {
            return await performAdvancedAnalysis(attachedFile.id, analysisOptions);
          }
          return null;
        })
      );

      const validResults = results.filter(result => result !== null);

      setIsAnalyzing(false);

      if (validResults.length > 0) {
        const analysisMessage: Message = {
          id: Date.now().toString(),
          sender: 'ai',
          content: `📊 고급 분석이 완료되었습니다!\n\n${validResults.map((result: any, index: number) =>
            `**${index + 1}. ${attachedFiles[index].file.name}**\n${result?.summary}\n\n**주요 포인트:**\n${result?.key_points.map((point: string) => `• ${point}`).join('\n')}`
          ).join('\n\n')}`,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prevMessages) => [...prevMessages, analysisMessage]);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);

      const errorMessage: Message = {
        id: Date.now().toString(),
        sender: 'ai',
        content: '❌ 파일 분석 중 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  const handleSummarizeConversation = () => {
    if (messages.length === 0) {
      alert('요약할 대화 내용이 없습니다.');
      return;
    }

    const summaryMessage: Message = {
      id: Date.now().toString(),
      sender: 'ai',
      content: `📋 **대화 내용 요약**\n\n총 ${messages.length}개의 메시지가 교환되었습니다.\n\n**주요 내용:**\n• 사용자 질문: ${messages.filter(m => m.sender === 'user').length}개\n• AI 응답: ${messages.filter(m => m.sender === 'ai').length}개\n• 첨부 파일: ${selectedFiles.length}개\n\n**핵심 키워드:**\n• 분석, 파일, 시스템, 기능\n\n**다음 단계 권장사항:**\n• 추가 파일 분석 진행\n• 상세한 인사이트 도출\n• 실무 적용 방안 검토`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prevMessages) => [...prevMessages, summaryMessage]);
  };

  const generateAIResponse = async (query: string, files: File[]): Promise<string> => {
    const lowerQuery = query.toLowerCase();

    // 파일 분석 요청
    if (lowerQuery.includes('분석') || lowerQuery.includes('어떻게') || lowerQuery.includes('파일')) {
      if (files.length > 0) {
        return `📊 첨부된 ${files.length}개 파일을 분석해드릴게요!\n\n**분석 중인 파일들:**\n${files.map(file => `• ${file.name}`).join('\n')}\n\n분석이 완료되면 상세한 결과를 제공해드리겠습니다. 잠시만 기다려주세요!`;
      } else {
        return '📊 분석 요청이시군요! 먼저 분석할 파일을 첨부해주시면 상세한 분석을 제공해드릴게요.';
      }
    }

    // 요약 요청
    if (lowerQuery.includes('요약') || lowerQuery.includes('정리') || lowerQuery.includes('핵심')) {
      return '📋 요약 작업을 도와드릴게요! 첨부된 파일들을 기반으로 핵심 내용을 간결하게 정리해드리겠습니다.';
    }

    // 글쓰기 요청
    if (lowerQuery.includes('글') || lowerQuery.includes('작성') || lowerQuery.includes('보고서')) {
      return '✍️ 글쓰기를 도와드릴게요! 어떤 종류의 글을 작성하고 싶으신가요? (보고서, 요약문, 분석서 등)';
    }

    // 극우적 댓글 요청
    if (lowerQuery.includes('극우') || lowerQuery.includes('댓글') || lowerQuery.includes('반박')) {
      return `🔥 극우적 댓글을 생성해드릴게요!\n\n**생성된 댓글 15개:**\n\n1. "이런 설계는 완전히 실패작입니다. 조합원들을 무시하는 건가요?"\n2. "차량 진입이 불가능한 주차장이라니, 이건 설계가 아니라 코미디입니다."\n3. "주차 공간을 줄이고 임대주택을 우선시한다니, 조합원들을 바보로 보나요?"\n4. "서쪽 입구 변경이 도시계회 지시사항인데, 삼성이 무시하고 홍보만 하네요."\n5. "지하 1층 제거로 306세대가 사라지는데, 누가 책임지나요?"\n\n... (이하 10개 더 생성)`;
    }

    // 카드뉴스 요청
    if (lowerQuery.includes('카드뉴스') || lowerQuery.includes('카드') || lowerQuery.includes('소셜')) {
      return '📱 카드뉴스 형식으로 제작해드릴게요!\n\n**카드뉴스 구성:**\n• 카드 1: 핵심 문제 제시\n• 카드 2: 구체적 사례\n• 카드 3: 영향 분석\n• 카드 4: 해결 방안\n• 카드 5: 행동 촉구\n\n소셜미디어에 최적화된 형태로 제작하겠습니다.';
    }

    // 프로젝트 관련 요청
    if (lowerQuery.includes('프로젝트') || lowerQuery.includes('개포우성')) {
      return '🏗️ 개포우성7차 프로젝트에 대해 도와드릴게요! 어떤 정보가 필요하신가요?\n\n• 프로젝트 개요\n• 진행 상황\n• 주요 이슈\n• 관련 문서';
    }

    // 도움말 요청
    if (lowerQuery.includes('도움') || lowerQuery.includes('help') || lowerQuery.includes('기능')) {
      return `🤖 CORBU.AI가 도와드릴 수 있는 기능들입니다:\n\n📊 **파일 분석**: 첨부된 파일을 분석하여 인사이트 제공\n📋 **요약**: 긴 문서를 간결하게 요약\n✍️ **글쓰기**: 보고서, 분석서 등 작성 지원\n🔥 **댓글 생성**: 극우적 댓글 자동 생성\n📱 **카드뉴스**: 소셜미디어용 카드뉴스 제작\n🏗️ **프로젝트 관리**: 개포우성7차 프로젝트 관련 지원\n\n어떤 기능을 사용해보시겠어요?`;
    }

    // 기본 응답
    return '🤔 흥미로운 질문이네요! CORBU.AI가 첨부된 파일을 기반으로 더 구체적인 답변을 드릴 수 있습니다. 어떤 부분을 중점적으로 도와드릴까요?\n\n💡 "도움말" 또는 "기능"이라고 입력하시면 사용 가능한 기능들을 확인할 수 있습니다.';
  };

  // 프로젝트 선택 처리
  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
    setShowProjectDetails(true);
    // 자동 메시지 추가 완전 제거
  };

  // 카드 렌더링 함수
  const renderCard = (message: Message) => {
    if (!message.cardData) return null;

    const { type, ...data } = message.cardData;

    switch (type) {
      case 'projects':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">프로젝트 목록</h3>
            <div className="space-y-2">
              {data.projects.map((project: Project) => (
                <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{project.name}</h4>
                    <p className="text-sm text-gray-500">{project.fileCount}개 파일</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{project.lastUpdated}</p>
                    <button
                      onClick={() => handleProjectSelect(project.id)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      선택
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'files':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">프로젝트 파일 목록</h3>
            <div className="space-y-2">
              {data.files.map((file: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{file.name}</h4>
                    <p className="text-sm text-gray-500">{file.size}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{file.date}</p>
                    <button className="text-xs text-blue-600 hover:text-blue-800">
                      다운로드
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'guidelines':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">작업 지침</h3>
            <div className="space-y-3">
              {data.guidelines.map((guideline: any, index: number) => (
                <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800">{guideline.title}</h4>
                  <p className="text-sm text-yellow-700">{guideline.content}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">분석 기록</h3>
            <div className="space-y-2">
              {data.history.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{item.type}</h4>
                    <p className="text-sm text-gray-500">{item.files}개 파일</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{item.date}</p>
                    <span className={`text-xs px-2 py-1 rounded ${item.result === '완료' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {item.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'templates':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">작성 템플릿</h3>
            <div className="space-y-2">
              {data.templates.map((template: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-gray-500">{template.description}</p>
                  </div>
                  <button className="text-xs text-blue-600 hover:text-blue-800">
                    사용
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'export':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">내보내기 옵션</h3>
            <div className="space-y-2">
              {data.exportOptions.map((option: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{option.format}</h4>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                  <button className="text-xs text-blue-600 hover:text-blue-800">
                    내보내기
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // 지침 모달 렌더링
  const renderGuidelineModal = () => {
    if (!showGuidelineModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-4/5 h-4/5 max-h-[90vh] overflow-y-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-8 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">지침</h3>
            <button
              onClick={() => setShowGuidelineModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <div className="w-6 h-6 bg-gray-400 rounded"></div>
            </button>
          </div>

          {/* 내용 */}
          <div className="p-8">
            <div className="mb-8">
              <h4 className="font-medium text-gray-900 mb-4 text-xl">
                어떻게 하면 ChatGPT가 이 프로젝트를 최대한 도와드릴 수 있을까요?
              </h4>
              <p className="text-base text-gray-600 leading-relaxed">
                ChatGPT에게 특정 토픽에 집중해 달라고 하거나, 특정한 톤이나 포맷으로 응답해 달라고 할 수 있습니다.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8">
              <h5 className="font-medium text-gray-900 mb-4 text-xl">개포우성 0000대화 요약</h5>
              <p className="text-base text-gray-600 mb-3">2025년 00월 00일 오후 8시 이후 ~ 00월 00일 기준</p>
              <p className="text-base text-gray-600 mb-6">시공사 홍보 문제</p>

              <div className="space-y-4">
                <p className="text-base text-gray-700">• GS건설과 삼성물산의 개별 홍보 활동 논란 지속</p>
                <p className="text-base text-gray-700">• GS건설 홍보 요원이 일부 조합원의 집까지 방문했다는 제보가 이어짐.</p>
                <p className="text-base text-gray-700">• 삼성물산도 홍보 활동을 진행 중이나 GS보다는 수위가 낮다는 의견 존재.</p>
                <p className="text-base text-gray-700">• 조합원들 사이에서 불법 홍보에 대한 신고 및 강경 대응 필요성이 제기됨.</p>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-4 p-8 border-t border-gray-200">
            <button
              onClick={() => setShowGuidelineModal(false)}
              className="px-8 py-3 text-gray-600 hover:text-gray-800"
            >
              취소
            </button>
            <button
              onClick={() => setShowGuidelineModal(false)}
              className="px-8 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 파일 추가 함수
  const handleAddFile = () => {
    fileInputRef.current?.click();
  };

  // 파일 추가 후 처리 함수
  const handleFileAdded = (file: File) => {
    // 새로운 파일을 목록에 추가하는 로직
    console.log('새 파일 추가:', file.name);
    // 실제 구현에서는 서버에 업로드하고 목록을 업데이트
  };

  // 프로젝트 파일 모달 렌더링
  const renderFileModal = () => {
    if (!showFileModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-4/5 h-4/5 max-h-[90vh] flex flex-col">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-8 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">프로젝트 파일</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleAddFile}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                파일 추가
              </button>
              <button
                onClick={() => setShowFileModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <div className="w-6 h-6 bg-gray-400 rounded"></div>
              </button>
            </div>
          </div>

          {/* 내용 영역 - 최대 공간 확보 */}
          <div className="flex-1 p-8 overflow-y-auto">
            {/* 경고 메시지 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h4 className="font-medium text-yellow-800 mb-2">⚠️ 주의사항</h4>
              <p className="text-yellow-700 text-sm">
                이 파일들은 프로젝트와 관련된 민감한 정보를 포함하고 있습니다.
                외부로 유출되지 않도록 주의해주세요.
              </p>
            </div>

            {/* 파일 목록 - 최대 공간 활용 */}
            <div className="space-y-6">
              <div className="flex items-center space-x-6 p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-pink-500 rounded flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded"></div>
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-gray-900">
                    [인증] 행복한소유☆개포우성7차.txt
                  </p>
                  <p className="text-sm text-gray-500 mt-2">문서</p>
                </div>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                    다운로드
                  </button>
                  <button className="px-4 py-2 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200">
                    삭제
                  </button>
                </div>
              </div>

              {/* 추가 파일 예시 */}
              <div className="flex items-center space-x-6 p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-green-500 rounded flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded"></div>
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-gray-900">
                    개포우성7차_설계도면.pdf
                  </p>
                  <p className="text-sm text-gray-500 mt-2">PDF</p>
                </div>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                    다운로드
                  </button>
                  <button className="px-4 py-2 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200">
                    삭제
                  </button>
                </div>
              </div>

              {/* 추가 파일 예시 2 */}
              <div className="flex items-center space-x-6 p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-500 rounded flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded"></div>
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-gray-900">
                    개포우성7차_회의록.docx
                  </p>
                  <p className="text-sm text-gray-500 mt-2">문서</p>
                </div>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                    다운로드
                  </button>
                  <button className="px-4 py-2 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200">
                    삭제
                  </button>
                </div>
              </div>

              {/* 추가 파일 예시 3 */}
              <div className="flex items-center space-x-6 p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-500 rounded flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded"></div>
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-gray-900">
                    개포우성7차_계약서.pdf
                  </p>
                  <p className="text-sm text-gray-500 mt-2">PDF</p>
                </div>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                    다운로드
                  </button>
                  <button className="px-4 py-2 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200">
                    삭제
                  </button>
                </div>
              </div>

              {/* 추가 파일 예시 4 */}
              <div className="flex items-center space-x-6 p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-orange-500 rounded flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded"></div>
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-gray-900">
                    개포우성7차_예산안.xlsx
                  </p>
                  <p className="text-sm text-gray-500 mt-2">스프레드시트</p>
                </div>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                    다운로드
                  </button>
                  <button className="px-4 py-2 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200">
                    삭제
                  </button>
                </div>
              </div>

              {/* 추가 파일 예시 5 */}
              <div className="flex items-center space-x-6 p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-teal-500 rounded flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded"></div>
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-gray-900">
                    개포우성7차_사진자료.zip
                  </p>
                  <p className="text-sm text-gray-500 mt-2">압축파일</p>
                </div>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                    다운로드
                  </button>
                  <button className="px-4 py-2 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200">
                    삭제
                  </button>
                </div>
              </div>

              {/* 추가 파일 예시 6 */}
              <div className="flex items-center space-x-6 p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-indigo-500 rounded flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded"></div>
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-gray-900">
                    개포우성7차_최종보고서.pdf
                  </p>
                  <p className="text-sm text-gray-500 mt-2">PDF</p>
                </div>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                    다운로드
                  </button>
                  <button className="px-4 py-2 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200">
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 대화 요약 화면 렌더링
  const renderConversationSummary = () => {
    if (!showConversationSummary) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-4/5 h-4/5 max-h-[90vh] overflow-y-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-8 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">대화내용 요약해줘</h3>
            <button
              onClick={() => setShowConversationSummary(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <div className="w-6 h-6 bg-gray-400 rounded"></div>
            </button>
          </div>

          {/* 내용 */}
          <div className="p-8">
            <div className="bg-blue-50 rounded-lg p-8">
              <h4 className="font-medium text-blue-900 mb-4 text-xl">대화 요약</h4>
              <p className="text-blue-700 mb-4">
                개포우성7차 프로젝트와 관련된 주요 논의 사항들을 정리해드리겠습니다.
              </p>

              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">📋 주요 토픽</h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• 시공사 홍보 활동 관련 논란</li>
                    <li>• 조합원 간 의견 분열</li>
                    <li>• 법적 대응 방안 검토</li>
                    <li>• 향후 일정 조율</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">📊 진행 상황</h5>
                  <p className="text-sm text-gray-700">
                    프로젝트 진행률: 65% 완료<br />
                    주요 이슈: 시공사 홍보 논란<br />
                    다음 단계: 조합원 의견 수렴
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">⚠️ 주의사항</h5>
                  <p className="text-sm text-gray-700">
                    민감한 정보가 포함되어 있으므로 외부 유출에 주의해주세요.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-4 p-8 border-t border-gray-200">
            <button
              onClick={() => setShowConversationSummary(false)}
              className="px-8 py-3 text-gray-600 hover:text-gray-800"
            >
              닫기
            </button>
            <button
              onClick={() => setShowConversationSummary(false)}
              className="px-8 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              내보내기
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 프로젝트 상세 정보 렌더링
  const renderProjectDetails = () => {
    if (!showProjectDetails) return null;

    // 선택된 프로젝트 정보 가져오기
    const selectedProjectData = projects.find(p => p.id === selectedProject);

    return (
      <div className="flex h-screen">
        {/* 사이드바 */}
        <ChatSidebar
          chatRooms={chatRooms}
          onRoomSelect={handleProjectSelect}
          onSystemCommand={handleSidebarCommand}
          selectedRoomId={selectedRoomId || ''}
        />

        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* 헤더 */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{selectedProjectData?.name || '프로젝트명'}</h2>
              <button
                onClick={handleCloseProjectDetails}
                className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="프로젝트 상세 페이지 닫기"
              >
                <div className="w-6 h-6 bg-gray-400 rounded"></div>
              </button>
            </div>
          </div>

          {/* 콘텐츠 영역 */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* 프로젝트 정보 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">프로젝트 정보</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">프로젝트명</p>
                  <p className="font-medium text-gray-900">{selectedProjectData?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">파일 수</p>
                  <p className="font-medium text-gray-900">{selectedProjectData?.fileCount}개</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">마지막 업데이트</p>
                  <p className="font-medium text-gray-900">{selectedProjectData?.lastUpdated}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">설명</p>
                  <p className="font-medium text-gray-900">{selectedProjectData?.description}</p>
                </div>
              </div>
            </div>

            {/* 지침 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">지침</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-blue-900">프로젝트 진행 규칙</p>
                    <p className="text-sm text-blue-700 mt-1">모든 회의록과 문서는 실시간으로 업데이트되어야 합니다.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-green-900">보안 정책</p>
                    <p className="text-sm text-green-700 mt-1">민감한 정보는 외부로 유출되지 않도록 주의해주세요.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-yellow-900">문서 관리</p>
                    <p className="text-sm text-yellow-700 mt-1">모든 문서는 버전 관리가 되어야 합니다.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 채팅 리스트 */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">채팅</h3>
              <div className="space-y-3">
                {chatRooms
                  .filter(chat => chat.type === 'project' && chat.name.includes('개포우성7차'))
                  .map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => handleChatClick(chat.id)}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{chat.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{chat.lastMessage}</p>
                        <p className="text-xs text-gray-400 mt-1">{chat.timestamp}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {chat.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                            {chat.unreadCount}
                          </span>
                        )}
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* 입력 영역 */}
          <div className="p-4">
            {renderInputForm()}
          </div>
        </div>
      </div>
    );
  };

  // 채팅 상세 페이지 렌더링
  const renderChatDetail = () => {
    if (!showChatDetail) return null;

    const selectedChatRoom = chatRooms.find(chat => chat.id === selectedChatId);

    return (
      <div className="flex h-screen">
        {/* 사이드바 */}
        <ChatSidebar
          chatRooms={chatRooms}
          onRoomSelect={handleProjectSelect}
          onSystemCommand={handleSidebarCommand}
          selectedRoomId={selectedChatId || ''}
        />

        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* 헤더 */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToProject}
                className="text-gray-600 hover:text-gray-800"
              >
                <div className="w-6 h-6 bg-gray-400 rounded"></div>
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedChatRoom?.name || '채팅'}
              </h2>
            </div>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-lg ${message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-2">{message.timestamp}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="p-4">
            {renderInputForm()}
          </div>
        </div>
      </div>
    );
  };

  // 공통 입력 컴포넌트
  const renderInputForm = () => (
    <div className="flex items-center bg-gray-50 hover:bg-white border border-gray-200 rounded-2xl shadow-sm px-6 py-4 transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
      {/* 왼쪽: 파일 첨부, 도구 */}
      <div className="flex items-center space-x-4">
        <button
          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200"
          title="파일 첨부"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-4 h-4 bg-gray-500 rounded"></div>
        </button>
        <button
          className="flex items-center space-x-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200"
          title="도구"
        >
          <div className="w-4 h-4 bg-gray-600 rounded-sm mr-1"></div>
          <span className="text-sm font-medium">도구</span>
        </button>
      </div>

      {/* 입력창 */}
      <div className="flex-1 relative mx-4 flex items-center">
        <textarea
          ref={textareaRef}
          value={inputMessage}
          onChange={handleInputChange}
          className="w-full bg-transparent border-none outline-none resize-none text-gray-900 py-4 text-left leading-6 min-h-[24px] max-h-[432px] overflow-y-auto transition-all duration-200"
          rows={1}
          title="메시지 입력"
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            lineHeight: '1.5rem',
            minHeight: '24px',
            maxHeight: '432px' // 18줄 * 24px
          }}
        ></textarea>
      </div>

      {/* 오른쪽: 음성, 전송 */}
      <div className="flex items-center space-x-2">
        <button
          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200"
          title="음성 입력"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim()}
          className="w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-xl flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
          title="메시지 전송"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );

  // 메인 페이지 렌더링
  const renderMainPage = () => {
    return (
      <div className="flex h-screen">
        {/* 사이드바 */}
        <ChatSidebar
          chatRooms={chatRooms}
          onRoomSelect={handleProjectSelect}
          onSystemCommand={handleSidebarCommand}
          selectedRoomId={selectedRoomId || ''}
        />

        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              // 첫 접속 시 중앙에 메시지 표시
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-gray-800 mb-4">무엇이든 물어보세요!</h1>
                  <p className="text-gray-600">CORBU.AI가 도와드리겠습니다.</p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-4 rounded-lg ${message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-2">{message.timestamp}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="p-4">
            {renderInputForm()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 모달들 */}
      {renderFileModal()}
      {renderGuidelineModal()}
      {renderConversationSummary()}

      {/* 페이지 렌더링 */}
      {showProjectDetails ? (
        <>
          {renderProjectDetails()}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      ) : showChatDetail ? (
        <>
          {renderChatDetail()}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      ) : (
        <>
          {renderMainPage()}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
    </>
  );
};

export default ChatGPTInterface; 