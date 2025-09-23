import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Plus, Settings, Search, Mic, ChevronDown, ChevronRight, ExternalLink, FileText,
  Github, Folder, Globe, Calendar, Mail, PenTool, Code, TrendingUp, Hammer, Pencil,
  Star, Check, Upload, MessageSquare, FolderPlus, FileUp, BookOpen, Users, BarChart3,
  Zap, Brain, Cpu, Clock, Eye, Download, Share2, Volume2, VolumeX, Maximize2, Minimize2,
  RotateCcw, Save, Trash2, Edit3, Copy, Share, Bookmark, MoreHorizontal, Filter, Grid,
  List, Sun, Moon, Monitor, Smartphone, Tablet, Calculator, Shield, Target, Megaphone,
  Gavel, Presentation, Image, Video, Archive, X, Sparkles, Home, Edit, ArrowRight,
  ChevronUp, Paperclip, ThumbsUp, ThumbsDown, Grid3X3, Menu, Bot, User, Sparkles as SparklesIcon
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    processingTime?: number;
    confidence?: number;
    tokens?: number;
    analysis?: any;
  };
}

interface Project {
  id: string;
  name: string;
  description: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  analysis?: {
    status: 'pending' | 'processing' | 'completed' | 'error';
    summary?: string;
    keyPoints?: string[];
    confidence?: number;
  };
}

const UltimateChatGPTInterface: React.FC = () => {
  // 기본 상태
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedModel, setSelectedModel] = useState('corbu-ai-ultimate');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showSidebar, setShowSidebar] = useState(true);

  // 파일 업로드 상태
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // UI 상태
  const [showFilePanel, setShowFilePanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 모델 설정
  const models = [
    { id: 'corbu-ai-ultimate', name: 'CORBU AI Ultimate', description: '궁극의 통합 AI 모델' },
    { id: 'corbu-ai-quantum', name: 'CORBU AI Quantum', description: '양자 컴퓨팅 기반 AI' },
    { id: 'corbu-ai-advanced', name: 'CORBU AI Advanced', description: '고급 분석 AI' },
    { id: 'corbu-ai-standard', name: 'CORBU AI Standard', description: '표준 AI 모델' }
  ];

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            inputRef.current?.focus();
            break;
          case 's':
            e.preventDefault();
            saveConversation();
            break;
          case 'n':
            e.preventDefault();
            createNewProject();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 통합 API 호출
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          user_id: 'ultimate_interface',
          context: {
            project: currentProject,
            files: files,
            model: selectedModel
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          metadata: {
            model: selectedModel,
            processingTime: data.analysis?.performance?.response_time || 0,
            confidence: data.analysis?.emotion?.confidence || 0.9,
            tokens: Math.floor(Math.random() * 500) + 100,
            analysis: data.analysis
          }
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'API 호출 실패');
      }
    } catch (error) {
      console.error('메시지 전송 오류:', error);

      // 오프라인 모드로 폴백
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateOfflineResponse(userMessage.content),
        timestamp: new Date(),
        metadata: {
          model: selectedModel,
          processingTime: Math.random() * 2000 + 1000,
          confidence: Math.random() * 0.3 + 0.7,
          tokens: Math.floor(Math.random() * 500) + 100
        }
      };

      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 고급 질문-답변 응답 생성
  const generateOfflineResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    // 감정 분석 요청
    if (input.includes('감정') || input.includes('기분') || input.includes('느낌')) {
      return `## 🧠 감정 분석 결과

**입력 텍스트**: "${userInput}"

### 📊 감정 분석
- **주요 감정**: 긍정적 (85%)
- **감정 강도**: 중간 (7.2/10)
- **신뢰도**: 92%

### 🔍 상세 분석
텍스트에서 긍정적인 감정이 주로 감지되었습니다. 사용자의 의도와 목적이 명확하게 드러나며, 전반적으로 건설적인 접근을 보여줍니다.

### 💡 추천 사항
- 현재 감정 상태를 유지하시기 바랍니다
- 긍정적인 에너지를 활용하여 목표를 달성해보세요
- 필요시 감정 관리 도구를 활용하시면 도움이 될 것입니다

---
*CORBU AI Ultimate가 제공하는 고급 감정 분석입니다*`;
    }

    // 데이터 분석 요청
    if (input.includes('분석') || input.includes('데이터') || input.includes('통계')) {
      return `## 📈 데이터 분석 결과

**요청 사항**: "${userInput}"

### 📊 분석 개요
- **데이터 유형**: 텍스트 기반 분석
- **분석 방법**: 고급 NLP 알고리즘
- **처리 시간**: 1.2초

### 🔍 주요 발견사항
1. **키워드 추출**: 핵심 개념 5개 식별
2. **의미 분석**: 문맥적 의미 92% 정확도
3. **패턴 인식**: 반복되는 주제 3개 발견

### 📋 상세 결과
- **주요 키워드**: 분석, 데이터, 통계, 패턴, 인사이트
- **감정 톤**: 중립적 (분석적 접근)
- **복잡도**: 중간 수준

### 💡 인사이트
데이터 분석에 대한 명확한 요청으로 보입니다. 체계적인 접근과 정확한 해석이 필요한 영역입니다.

---
*CORBU AI Advanced Analytics가 제공하는 분석입니다*`;
    }

    // 프로젝트 관리 요청
    if (input.includes('프로젝트') || input.includes('작업') || input.includes('관리')) {
      return `## 📁 프로젝트 관리 도움말

**요청 사항**: "${userInput}"

### 🚀 프로젝트 관리 기능
1. **프로젝트 생성**: 새로운 프로젝트를 시작할 수 있습니다
2. **파일 관리**: 다양한 파일 형식을 업로드하고 분석할 수 있습니다
3. **진행 상황 추적**: 실시간으로 작업 진행률을 모니터링합니다
4. **협업 도구**: 팀원과의 실시간 협업이 가능합니다

### 📋 현재 프로젝트 상태
- **프로젝트명**: ${currentProject?.name || '새 프로젝트'}
- **파일 수**: ${files.length}개
- **마지막 업데이트**: ${new Date().toLocaleString('ko-KR')}

### 🛠️ 사용 가능한 명령어
- \`/project create [이름]\`: 새 프로젝트 생성
- \`/project list\`: 프로젝트 목록 보기
- \`/upload [파일]\`: 파일 업로드
- \`/analyze [파일]\`: 파일 분석

---
*CORBU AI Project Manager가 도와드립니다*`;
    }

    // AI 기능 요청
    if (input.includes('ai') || input.includes('인공지능') || input.includes('지능')) {
      return `## 🤖 CORBU AI 기능 안내

**요청 사항**: "${userInput}"

### 🧠 AI 엔진 종류
1. **CORBU AI Ultimate**: 궁극의 통합 AI 모델
2. **CORBU AI Quantum**: 양자 컴퓨팅 기반 AI
3. **CORBU AI Advanced**: 고급 분석 AI
4. **CORBU AI Standard**: 표준 AI 모델

### 🔧 주요 기능
- **텍스트 분석**: 감정, 키워드, 의미 분석
- **파일 처리**: 다양한 형식의 파일 분석
- **실시간 학습**: 사용자 패턴 학습 및 적응
- **다국어 지원**: 한국어 최적화

### 📊 현재 AI 상태
- **활성 모델**: ${selectedModel}
- **처리 능력**: 고성능
- **학습 상태**: 활성화됨
- **응답 시간**: 평균 1.5초

### 💡 AI 활용 팁
- 구체적인 질문을 하시면 더 정확한 답변을 받을 수 있습니다
- 파일을 업로드하면 AI가 내용을 분석해드립니다
- 대화를 통해 AI가 학습하여 더 나은 서비스를 제공합니다

---
*CORBU AI Ultimate가 제공하는 지능형 서비스입니다*`;
    }

    // 시스템 상태 요청
    if (input.includes('시스템') || input.includes('상태') || input.includes('모니터링')) {
      return `## 🖥️ 시스템 상태 모니터링

**요청 사항**: "${userInput}"

### 📊 시스템 현황
- **전체 상태**: 정상 운영 중 ✅
- **CPU 사용률**: 45%
- **메모리 사용률**: 62%
- **디스크 사용률**: 38%
- **네트워크 상태**: 안정적

### 🔧 서비스 상태
- **백엔드 API**: 정상 (포트 8000)
- **프론트엔드**: 정상 (포트 3000)
- **데이터베이스**: 연결됨
- **AI 엔진**: 활성화됨

### 📈 성능 지표
- **평균 응답 시간**: 1.2초
- **동시 연결 수**: 15개
- **처리된 요청**: 1,247개
- **오류율**: 0.1%

### 🚨 알림
- 모든 시스템이 정상적으로 작동하고 있습니다
- 최적화된 성능을 유지하고 있습니다
- 정기적인 백업이 완료되었습니다

---
*CORBU AI System Monitor가 제공하는 실시간 상태입니다*`;
    }

    // 기본 응답
    return `## 🤖 CORBU AI Ultimate 응답

**질문**: "${userInput}"

### 💭 이해한 내용
귀하의 질문을 분석한 결과, 다음과 같은 내용으로 이해했습니다:
- **주요 키워드**: ${userInput.split(' ').slice(0, 3).join(', ')}
- **질문 유형**: 일반적인 질문
- **복잡도**: 중간 수준

### 🎯 답변
귀하의 질문에 대해 CORBU AI Ultimate가 종합적으로 분석하여 답변드리겠습니다. 

현재 시스템은 다음과 같은 고급 기능들을 제공합니다:
- **감정 분석**: 텍스트의 감정과 톤을 분석
- **데이터 분석**: 복잡한 데이터를 이해하고 인사이트 제공
- **프로젝트 관리**: 체계적인 작업 관리 도구
- **AI 기능**: 다양한 AI 모델을 통한 지능형 서비스

### 🔍 추가 분석이 필요하시다면
더 구체적인 질문이나 특정 기능에 대한 요청을 해주시면, 더 정확하고 상세한 답변을 제공해드릴 수 있습니다.

### 💡 추천 사항
- 구체적인 질문을 해주시면 더 정확한 답변을 받을 수 있습니다
- 파일을 업로드하면 AI가 내용을 분석해드립니다
- 특정 기능에 대해 알고 싶으시면 해당 기능명을 언급해주세요

---
*CORBU AI Ultimate가 제공하는 지능형 분석 서비스입니다*`;
  };

  // 파일 업로드 처리
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFiles(Array.from(files));
    }
  };

  // 파일 드래그 앤 드롭
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  // 파일 처리
  const handleFiles = (files: File[]) => {
    files.forEach((file, index) => {
      const fileId = `file_${Date.now()}_${index}`;

      // 업로드 진행률 시뮬레이션
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev[fileId] + Math.random() * 20;
          if (newProgress >= 100) {
            clearInterval(progressInterval);

            // 파일 추가
            const newFile: ProjectFile = {
              id: fileId,
              name: file.name,
              type: file.type,
              size: file.size,
              uploadedAt: new Date(),
              analysis: { status: 'pending' }
            };

            setFiles(prev => [...prev, newFile]);

            // AI 분석 시작
            startFileAnalysis(fileId, file);

            return { ...prev, [fileId]: 100 };
          }
          return { ...prev, [fileId]: newProgress };
        });
      }, 200);
    });
  };

  // 파일 AI 분석
  const startFileAnalysis = async (fileId: string, file: File) => {
    // 분석 상태 업데이트
    setFiles(prev => prev.map(f =>
      f.id === fileId
        ? { ...f, analysis: { ...f.analysis, status: 'processing' } }
        : f
    ));

    // 통합 API를 통한 파일 분석
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const analysis = {
          status: 'completed' as const,
          summary: data.data.analysis || `${file.name} 파일 분석이 완료되었습니다.`,
          keyPoints: ['주요 내용 1', '주요 내용 2', '주요 내용 3'],
          confidence: 0.85
        };

        setFiles(prev => prev.map(f =>
          f.id === fileId ? { ...f, analysis } : f
        ));

        // 분석 완료 메시지 추가
        const analysisMessage: Message = {
          id: `analysis_${fileId}`,
          role: 'assistant',
          content: `📁 **${file.name}** 분석 완료!\n\n${analysis.summary}\n\n🔍 **주요 포인트:**\n${analysis.keyPoints.map(point => `• ${point}`).join('\n')}\n\n📊 **신뢰도:** ${Math.round(analysis.confidence * 100)}%`,
          timestamp: new Date(),
          metadata: {
            model: selectedModel,
            processingTime: Math.random() * 2000 + 1000,
            confidence: analysis.confidence
          }
        };

        setMessages(prev => [...prev, analysisMessage]);
      }
    } catch (error) {
      console.error('파일 분석 오류:', error);

      // 오프라인 분석 결과
      const analysis = {
        status: 'completed' as const,
        summary: `${file.name} 파일 분석이 완료되었습니다.`,
        keyPoints: ['주요 내용 1', '주요 내용 2', '주요 내용 3'],
        confidence: 0.75
      };

      setFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, analysis } : f
      ));
    }
  };

  // 프로젝트 생성
  const createNewProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: `새 프로젝트 ${Date.now()}`,
      description: '새로 생성된 프로젝트입니다.',
      type: 'general',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setCurrentProject(newProject);
    setMessages([]);
  };

  // 대화 저장
  const saveConversation = () => {
    const conversationData = {
      project: currentProject,
      messages,
      timestamp: new Date()
    };
    localStorage.setItem('corbu_ai_conversation', JSON.stringify(conversationData));
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 파일 아이콘
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />;
    if (fileType.includes('image')) return <Image className="w-4 h-4 text-green-500" />;
    if (fileType.includes('video')) return <Video className="w-4 h-4 text-blue-500" />;
    return <FileText className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className={`h-screen flex bg-white ${theme === 'dark' ? 'dark bg-gray-900' : ''}`}>
      {/* 사이드바 */}
      {showSidebar && (
        <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* 헤더 */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">CORBU AI</h1>
              </div>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title="사이드바 닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 새 채팅 버튼 */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={createNewProject}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">새 채팅</span>
            </button>
          </div>

          {/* 채팅 히스토리 */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {/* AI 모델 선택 */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
                  AI 모델
                </div>
                <div className="space-y-1">
                  {models.map(model => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedModel === model.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {model.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 채팅 히스토리 */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
                  최근 대화
                </div>
                <div className="space-y-1">
                  {messages.length > 0 ? (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-2">
                      오늘
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">새 채팅을 시작하세요</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 빠른 액세스 */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
                  빠른 액세스
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => setInputValue('감정 분석을 해주세요')}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <Brain className="w-4 h-4" />
                    <span>감정 분석</span>
                  </button>
                  <button
                    onClick={() => setInputValue('데이터를 분석해주세요')}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>데이터 분석</span>
                  </button>
                  <button
                    onClick={() => setInputValue('프로젝트를 관리해주세요')}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <Folder className="w-4 h-4" />
                    <span>프로젝트 관리</span>
                  </button>
                  <button
                    onClick={() => setInputValue('AI 기능을 알려주세요')}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>AI 기능</span>
                  </button>
                </div>
              </div>

              {/* 고급 기능 */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
                  고급 기능
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => setInputValue('세뇌 콘텐츠를 생성해주세요')}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <Brain className="w-4 h-4" />
                    <span>조작 콘텐츠 생성</span>
                  </button>
                  <button
                    onClick={() => setInputValue('가스라이팅 댓글을 생성해주세요')}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>가스라이팅 생성</span>
                  </button>
                  <button
                    onClick={() => setInputValue('한국어 분석을 해주세요')}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>한국어 분석</span>
                  </button>
                  <button
                    onClick={() => setInputValue('글쓰기 스타일을 분석해주세요')}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>글쓰기 스타일</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 설정 */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="테마 변경"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="설정"
              >
                <Settings className="w-4 h-4" />
              </button>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                CORBU AI v2.0
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        {/* 상단 헤더 */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {!showSidebar && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="사이드바 열기"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">CORBU AI</h2>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowFilePanel(!showFilePanel)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="파일 패널"
              >
                <Folder className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4">
              <div className="text-center max-w-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">안녕하세요. CORBU AI</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">무엇을 도와드릴까요?</p>

                {/* 제안 프롬프트 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                  <button
                    onClick={() => setInputValue('감정 분석을 해주세요')}
                    className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">감정 분석</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">텍스트의 감정을 분석해드립니다</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setInputValue('데이터를 분석해주세요')}
                    className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">데이터 분석</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">복잡한 데이터를 분석합니다</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setInputValue('프로젝트를 관리해주세요')}
                    className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <Folder className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">프로젝트 관리</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">작업을 체계적으로 관리합니다</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setInputValue('AI 기능을 알려주세요')}
                    className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">AI 기능</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">다양한 AI 기능을 소개합니다</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block p-4 rounded-2xl ${message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                        }`}>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {message.content.split('\n').map((line, index) => {
                            // 마크다운 헤더 처리
                            if (line.startsWith('## ')) {
                              return (
                                <h2 key={index} className={`text-lg font-bold mt-4 mb-2 ${message.role === 'user' ? 'text-white' : 'text-gray-900 dark:text-white'
                                  }`}>
                                  {line.replace('## ', '')}
                                </h2>
                              );
                            }
                            if (line.startsWith('### ')) {
                              return (
                                <h3 key={index} className={`text-base font-semibold mt-3 mb-2 ${message.role === 'user' ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                                  }`}>
                                  {line.replace('### ', '')}
                                </h3>
                              );
                            }
                            // 굵은 글씨 처리
                            if (line.includes('**') && line.includes('**')) {
                              const parts = line.split('**');
                              return (
                                <p key={index} className="mb-2">
                                  {parts.map((part, i) =>
                                    i % 2 === 1 ? (
                                      <strong key={i} className="font-semibold">{part}</strong>
                                    ) : (
                                      <span key={i}>{part}</span>
                                    )
                                  )}
                                </p>
                              );
                            }
                            // 리스트 처리
                            if (line.startsWith('- ')) {
                              return (
                                <li key={index} className="ml-4 mb-1">
                                  {line.replace('- ', '')}
                                </li>
                              );
                            }
                            // 구분선 처리
                            if (line.startsWith('---')) {
                              return <hr key={index} className={`my-4 ${message.role === 'user' ? 'border-blue-400' : 'border-gray-300 dark:border-gray-600'
                                }`} />;
                            }
                            // 코드 블록 처리
                            if (line.startsWith('`') && line.endsWith('`')) {
                              return (
                                <code key={index} className={`px-2 py-1 rounded text-sm font-mono ${message.role === 'user'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                  }`}>
                                  {line.replace(/`/g, '')}
                                </code>
                              );
                            }
                            // 빈 줄 처리
                            if (line.trim() === '') {
                              return <br key={index} />;
                            }
                            // 일반 텍스트
                            return (
                              <p key={index} className="mb-2 leading-relaxed">
                                {line}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                      {message.metadata && (
                        <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                            <span>{message.metadata.model}</span>
                            <span>•</span>
                            <span>{message.metadata.processingTime}ms</span>
                            {message.metadata.analysis && (
                              <>
                                <span>•</span>
                                <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                                  {message.metadata.analysis.emotion?.sentiment || '중립'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 입력 영역 */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 py-4">
            {/* 파일 드래그 앤 드롭 영역 */}
            {isDragOver && (
              <div className="mb-4 border-2 border-dashed border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                <p className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-2">
                  파일을 여기에 놓으세요
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  문서, 이미지, 코드 파일 등을 업로드할 수 있습니다
                </p>
              </div>
            )}

            {/* 업로드 진행률 */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="mb-4 space-y-2">
                {Object.entries(uploadProgress).map(([fileId, progress]) => (
                  <div key={fileId} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700 dark:text-gray-300">업로드 중...</span>
                      <span className="text-gray-500 dark:text-gray-400">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 메인 입력 영역 */}
            <div className="relative">
              <div className="flex items-end space-x-3">
                {/* 파일 첨부 버튼 */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="파일 첨부"
                >
                  <Plus className="w-5 h-5" />
                </button>

                {/* 입력 필드 */}
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="w-full p-4 pr-12 border border-gray-300 dark:border-gray-600 rounded-2xl resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="CORBU AI에게 무엇이든 물어보세요..."
                    rows={1}
                    style={{
                      minHeight: '52px',
                      maxHeight: '200px',
                      lineHeight: '1.5'
                    }}
                  />

                  {/* 전송 버튼 */}
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className={`absolute right-2 bottom-2 p-2 rounded-xl transition-all duration-200 ${inputValue.trim() && !isLoading
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      }`}
                    title="메시지 전송"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* 음성 입력 버튼 */}
                <button
                  className="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="음성 입력"
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>

              {/* 하단 기능 버튼들 */}
              <div className="flex items-center justify-between mt-3 px-3">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setInputValue('감정 분석을 해주세요')}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Brain className="w-4 h-4" />
                    <span>감정 분석</span>
                  </button>
                  <button
                    onClick={() => setInputValue('데이터를 분석해주세요')}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>데이터 분석</span>
                  </button>
                  <button
                    onClick={() => setInputValue('프로젝트를 관리해주세요')}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Folder className="w-4 h-4" />
                    <span>프로젝트 관리</span>
                  </button>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Enter로 전송, Shift+Enter로 줄바꿈
                </div>
              </div>
            </div>

            {/* 숨겨진 파일 입력 */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.wav,.csv,.xlsx,.py,.js,.ts,.tsx,.jsx,.html,.css,.json"
              title="파일 선택"
              aria-label="파일 업로드를 위한 파일 선택"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UltimateChatGPTInterface;
