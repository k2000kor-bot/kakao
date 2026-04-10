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

interface ChatGPTUnifiedSystemProps { }

const ChatGPTUnifiedSystem: React.FC<ChatGPTUnifiedSystemProps> = () => {
  // 기본 상태
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
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
    { id: 'gpt-4o', name: 'GPT-4o', description: '가장 강력한 모델' },
    { id: 'gpt-4', name: 'GPT-4', description: '고성능 모델' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: '빠른 응답' }
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

    // AI 응답 시뮬레이션
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(userMessage.content),
        timestamp: new Date(),
        metadata: {
          model: selectedModel,
          processingTime: Math.random() * 2000 + 1000,
          confidence: Math.random() * 0.3 + 0.7,
          tokens: Math.floor(Math.random() * 500) + 100
        }
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  // AI 응답 생성
  const generateAIResponse = (userInput: string): string => {
    const responses = [
      `안녕하세요! "${userInput}"에 대한 답변입니다. 현재 프로젝트: ${currentProject?.name || '일반'}`,
      `좋은 질문이네요. "${userInput}"에 대해 자세히 설명드리겠습니다.`,
      `"${userInput}"에 대한 분석 결과를 제공해드립니다.`,
      `흥미로운 주제입니다. "${userInput}"에 대해 다양한 관점에서 살펴보겠습니다.`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
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

    // 분석 시뮬레이션
    setTimeout(() => {
      const analysis = {
        status: 'completed' as const,
        summary: `${file.name} 파일 분석이 완료되었습니다.`,
        keyPoints: ['주요 내용 1', '주요 내용 2', '주요 내용 3'],
        confidence: Math.random() * 0.3 + 0.7
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
    }, 3000);
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
    localStorage.setItem('chatgpt_conversation', JSON.stringify(conversationData));
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
    <div className={`h-screen flex ${theme === 'dark' ? 'dark' : ''}`}>
      {/* 사이드바 */}
      {showSidebar && (
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          {/* 헤더 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="w-6 h-6 text-blue-600" />
                <h1 className="text-lg font-bold">CORBU.AI</h1>
              </div>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
                title="사이드바 닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 프로젝트 정보 */}
          <div className="p-4 border-b border-gray-200">
            {currentProject ? (
              <div>
                <h3 className="font-medium text-gray-900">{currentProject.name}</h3>
                <p className="text-sm text-gray-600">{currentProject.description}</p>
              </div>
            ) : (
              <button
                onClick={createNewProject}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                새 프로젝트 시작
              </button>
            )}
          </div>

          {/* 파일 목록 */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">파일</h3>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1 text-gray-500 hover:text-gray-700"
                title="파일 추가"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {files.map(file => (
                <div key={file.id} className="flex items-center p-2 bg-white rounded border">
                  {getFileIcon(file.type)}
                  <div className="ml-2 flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  {file.analysis?.status === 'processing' && (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 하단 설정 */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
                title="모델 선택"
              >
                {models.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-1 text-gray-500 hover:text-gray-700"
                title="테마 변경"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col">
        {/* 상단 헤더 */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!showSidebar && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  title="사이드바 열기"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-lg font-semibold">대화</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilePanel(!showFilePanel)}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="파일 패널"
              >
                <Folder className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="설정"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl p-4 rounded-lg ${message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
                  }`}
              >
                <div className="flex items-start space-x-2">
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 mt-1 flex-shrink-0" />
                  ) : (
                    <Bot className="w-5 h-5 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.metadata && (
                      <div className="text-xs mt-2 opacity-70">
                        {message.metadata.model} • {message.metadata.processingTime}ms
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5" />
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

        {/* 입력 영역 */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
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
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                placeholder="메시지를 입력하세요... (Ctrl+K로 포커스)"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '200px' }}
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-gray-500 hover:text-gray-700"
                title="파일 첨부"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="메시지 전송"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 파일 드래그 앤 드롭 영역 */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`mt-4 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
              }`}
          >
            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              {isDragOver ? '파일을 여기에 놓으세요' : '파일을 드래그하거나 클릭하여 업로드'}
            </p>

            {/* 업로드 진행률 */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="mt-3 space-y-2">
                {Object.entries(uploadProgress).map(([fileId, progress]) => (
                  <div key={fileId} className="bg-white border rounded p-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>업로드 중...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            multiple
            title="파일 선택"
            aria-label="파일 업로드를 위한 파일 선택"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatGPTUnifiedSystem;