import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Plus, Settings, Search, Mic, ChevronDown, ChevronRight, ExternalLink, FileText, Github, Folder, Globe, Calendar, Mail, PenTool, Code, TrendingUp, Hammer, Pencil, Star, Check, Upload, MessageSquare, FolderPlus, FileUp, BookOpen, Users, BarChart3, Zap, Brain, Cpu, Clock, Eye, Download, Share2, Volume2, VolumeX, Maximize2, Minimize2, RotateCcw, Save, Trash2, Edit3, Copy, Share, Bookmark, MoreHorizontal, Filter, Grid, List, Sun, Moon, Monitor, Smartphone, Tablet, Calculator, Shield, Target, Megaphone, Gavel, Presentation, Image, Video, Archive, X, Sparkles, Home, Edit, ArrowRight } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  analysis_type?: string;
  metadata?: {
    tokens?: number;
    processing_time?: number;
    model_used?: string;
    confidence?: number;
    sentiment?: 'positive' | 'negative' | 'neutral';
    project_type?: string;
    tools_used?: string[];
    analysis_type?: string;
  };
}

interface Project {
  id: string;
  name: string;
  type: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  settings?: {
    project_type: string;
  };
}

interface Chat {
  id: string;
  name: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploaded_at: string;
  category: string;
  preview?: string;
  thumbnail?: string;
}

interface Guideline {
  id: string;
  title: string;
  content: string;
  type: 'basic' | 'logical' | 'standard';
  created_at: string;
  priority: 'low' | 'medium' | 'high';
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
  is_pinned?: boolean;
  tags?: string[];
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  avatar?: string;
  last_active: string;
}

interface ProjectSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  ai_model: string;
  auto_save: boolean;
  real_time_collaboration: boolean;
  voice_input_enabled: boolean;
  project_type?: string;
}

interface ChatGPTUnifiedSystemProps { }

// 프로젝트 타입별 특화 기능 추가
interface ProjectType {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  features: string[];
  specialized_tools?: string[];
  templates?: string[];
  ai_prompts?: string[];
}

interface ConstructionAnalysis {
  company_bias: {
    [company: string]: {
      positive_mentions: number;
      negative_mentions: number;
      neutral_mentions: number;
      promotion_logic_count: number;
      opposition_count: number;
      bias_score: number;
      key_promoters: string[];
      key_opponents: string[];
      promotion_statements: string[];
      opposition_statements: string[];
      sentiment_distribution: {
        긍정: number;
        부정: number;
        중립: number;
      };
    };
  };
  participant_analysis: {
    [participant_id: string]: {
      participant_name: string;
      company_bias: { [company: string]: number };
      total_mentions: number;
      promotion_count: number;
      opposition_count: number;
      most_biased_company: string;
      bias_strength: number;
    };
  };
  summary: {
    total_companies_analyzed: number;
    most_biased_company: string;
    most_biased_participant: string;
    overall_bias_trend: string;
    promotion_vs_opposition: {
      total_promotion: number;
      total_opposition: number;
      promotion_ratio: number;
      opposition_ratio: number;
    };
  };
}

const projectTypes: ProjectType[] = [
  {
    id: 'real-estate',
    name: '부동산 프로젝트',
    description: '부동산 개발, 투자, 분석 프로젝트',
    icon: Home,
    color: '#3b82f6',
    features: ['시장 분석', '투자 평가', '법규 검토', '문서 작성'],
    specialized_tools: ['시장 분석', '투자 평가', '법규 검토'],
    templates: ['투자 제안서', '시장 분석 보고서', '법규 검토서'],
    ai_prompts: ['부동산 시장 동향 분석', '투자 수익성 평가', '법규 준수 검토']
  },
  {
    id: 'construction',
    name: '건설 프로젝트',
    description: '건설, 시공, 감리 프로젝트',
    icon: Hammer,
    color: '#10b981',
    features: ['공사 계획', '비용 산정', '일정 관리', '안전 검토'],
    specialized_tools: ['시공사 분석', '계약서 분석', '안전성 분석', '비용 분석'],
    templates: ['공사 계획서', '비용 산정서', '안전 관리서'],
    ai_prompts: ['시공사 편향성 분석', '계약서 리스크 평가', '안전성 검토']
  },
  {
    id: 'business',
    name: '비즈니스 프로젝트',
    description: '기업 전략, 마케팅, 운영 프로젝트',
    icon: Target,
    color: '#f59e0b',
    features: ['전략 수립', '시장 분석', '마케팅 계획', '운영 최적화'],
    specialized_tools: ['전략 분석', '시장 분석', '마케팅 분석'],
    templates: ['전략 제안서', '시장 분석 보고서', '마케팅 계획서'],
    ai_prompts: ['비즈니스 전략 수립', '시장 분석', '마케팅 전략']
  },
  {
    id: 'legal',
    name: '법무 프로젝트',
    description: '법률 검토, 계약, 소송 프로젝트',
    icon: BookOpen,
    color: '#8b5cf6',
    features: ['법률 검토', '계약 작성', '소송 준비', '규정 분석'],
    specialized_tools: ['법률 검토', '계약 분석', '소송 분석'],
    templates: ['법률 검토서', '계약서', '소송 준비서'],
    ai_prompts: ['법률 검토', '계약서 분석', '소송 전략']
  },
  {
    id: 'research',
    name: '연구 프로젝트',
    description: '학술 연구, 조사, 분석 프로젝트',
    icon: Search,
    color: '#10b981',
    features: ['문헌 조사', '데이터 분석', '논문 작성', '발표 자료'],
    specialized_tools: ['문헌 분석', '데이터 분석', '논문 작성'],
    templates: ['연구 계획서', '데이터 분석 보고서', '논문'],
    ai_prompts: ['문헌 조사', '데이터 분석', '논문 작성']
  }
];

// 프로젝트별 컨텍스트 관리
const getProjectContext = (projectType: string, projectData: any) => {
  const type = projectTypes.find(t => t.id === projectType);
  if (!type) return '';

  return `
프로젝트 타입: ${type.name}
프로젝트 설명: ${type.description}
주요 기능: ${type.features.join(', ')}
전문 도구: ${type.specialized_tools?.join(', ') || '없음'}
사용 가능한 템플릿: ${type.templates?.join(', ') || '없음'}

프로젝트 데이터:
- 파일 수: ${projectData.files?.length || 0}
- 지침 수: ${projectData.guidelines?.length || 0}
- 채팅 세션 수: ${projectData.chats?.length || 0}
- 협업자 수: ${projectData.collaborators?.length || 0}

이 프로젝트에 특화된 답변을 제공하세요.
`;
};

// 프로젝트별 AI 응답 생성
const generateProjectSpecificResponse = async (
  message: string,
  projectType: string,
  projectData: any,
  selectedModel: string
) => {
  const context = getProjectContext(projectType, projectData);
  const type = projectTypes.find(t => t.id === projectType);

  const enhancedPrompt = `
${context}

사용자 메시지: ${message}

이 프로젝트에 특화된 전문적인 답변을 제공하세요.
사용 가능한 도구와 템플릿을 활용하여 구체적이고 실용적인 조언을 해주세요.
`;

  try {
    const response = await fetch('http://localhost:8008/api/sessions/default/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: 'default',
        role: 'user',
        content: enhancedPrompt,
        message_type: 'text',
        project_context: {
          type: projectType,
          data: projectData,
          model: selectedModel
        }
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.content;
    }
  } catch (error) {
    console.error('Error generating project-specific response:', error);
  }

  return '프로젝트별 응답을 생성하는 중 오류가 발생했습니다.';
};

// 프로젝트별 도구 및 템플릿 제공
const getProjectTools = (projectType: string) => {
  const tools = {
    'construction': [
      { id: 'construction-analysis', name: '시공사 편향성 분석', icon: '🏗️', color: '#3b82f6' },
      { id: 'contract-analysis', name: '계약서 분석', icon: '📋', color: '#10b981' },
      { id: 'safety-analysis', name: '안전성 분석', icon: '🛡️', color: '#f59e0b' },
      { id: 'cost-analysis', name: '비용 분석', icon: '💰', color: '#ef4444' }
    ],
    'real-estate': [
      { id: 'market-analysis', name: '시장 분석', icon: '📈', color: '#3b82f6' },
      { id: 'property-analysis', name: '부동산 분석', icon: '🏠', color: '#10b981' },
      { id: 'investment-analysis', name: '투자 분석', icon: '💹', color: '#f59e0b' }
    ],
    'default': [
      { id: 'general-analysis', name: '일반 분석', icon: '📊', color: '#3b82f6' },
      { id: 'document-analysis', name: '문서 분석', icon: '📄', color: '#10b981' }
    ]
  };
  return tools[projectType as keyof typeof tools] || tools.default;
};

const getToolIcon = (toolName: string) => {
  const iconMap: { [key: string]: any } = {
    '시장 분석기': BarChart3,
    '투자 계산기': TrendingUp,
    '법규 검색기': Search,
    '문서 생성기': FileText,
    '일정 관리기': Calendar,
    '비용 계산기': Calculator,
    '안전 검토기': Shield,
    '감리 도구': Eye,
    '전략 도구': Target,
    '마케팅 도구': Megaphone,
    '운영 분석기': Settings,
    '법률 검색기': BookOpen,
    '계약 생성기': FileText,
    '소송 도구': Gavel,
    '규정 분석기': Clipboard,
    '문헌 검색기': Search,
    '데이터 분석기': BarChart3,
    '논문 도구': BookOpen,
    '발표 도구': Presentation
  };

  return iconMap[toolName] || FileText;
};

const getToolColor = (toolName: string) => {
  const colorMap: { [key: string]: string } = {
    '시장 분석기': '#3b82f6',
    '투자 계산기': '#10b981',
    '법규 검색기': '#f59e0b',
    '문서 생성기': '#8b5cf6',
    '일정 관리기': '#06b6d4',
    '비용 계산기': '#84cc16',
    '안전 검토기': '#ef4444',
    '감리 도구': '#f97316',
    '전략 도구': '#6366f1',
    '마케팅 도구': '#ec4899',
    '운영 분석기': '#8b5cf6',
    '법률 검색기': '#059669',
    '계약 생성기': '#dc2626',
    '소송 도구': '#7c3aed',
    '규정 분석기': '#0891b2',
    '문헌 검색기': '#65a30d',
    '데이터 분석기': '#2563eb',
    '논문 도구': '#7c2d12',
    '발표 도구': '#be185d'
  };

  return colorMap[toolName] || '#6b7280';
};

// 프로젝트별 템플릿 제공
const getProjectTemplates = (projectType: string) => {
  const type = projectTypes.find(t => t.id === projectType);
  if (!type) return [];

  return type.templates?.map(template => ({
    id: template.toLowerCase().replace(/\s+/g, '-'),
    name: template,
    description: `${type.name}용 ${template} 템플릿`,
    category: projectType
  })) || [];
};

// 프로젝트별 AI 프롬프트 제안
const getProjectPrompts = (projectType: string) => {
  const type = projectTypes.find(t => t.id === projectType);
  if (!type) return [];

  return type.ai_prompts?.map((prompt, index) => ({
    id: `prompt-${index}`,
    text: prompt,
    category: projectType
  })) || [];
};

const ChatGPTUnifiedSystem: React.FC<ChatGPTUnifiedSystemProps> = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Claude Sonnet 4');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showDeepThought, setShowDeepThought] = useState(false);
  const [showWebSearch, setShowWebSearch] = useState(true);
  const [showConnectors, setShowConnectors] = useState(false);

  // 새로운 상태들
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedChatSession, setSelectedChatSession] = useState<ChatSession | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<ProjectFile[]>([]);
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);

  // 고도화된 기능들
  const [isTyping, setIsTyping] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState<string | null>(null);
  const [aiPerformance, setAiPerformance] = useState({
    response_time: 0,
    tokens_used: 0,
    model_accuracy: 0,
    confidence_score: 0
  });
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('dark');
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(false);

  // 지침과 파일 관리를 위한 상태 추가
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [editingGuideline, setEditingGuideline] = useState<Guideline | null>(null);
  const [editingFile, setEditingFile] = useState<ProjectFile | null>(null);
  const [selectedFileCategory, setSelectedFileCategory] = useState('all');
  const [selectedGuidelineType, setSelectedGuidelineType] = useState<'all' | 'basic' | 'logical' | 'standard'>('all');

  const [constructionAnalysis, setConstructionAnalysis] = useState<ConstructionAnalysis | null>(null);
  const [showConstructionAnalysis, setShowConstructionAnalysis] = useState(false);
  const [collaborationMode, setCollaborationMode] = useState(false);
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    messageCount: 0,
    averageResponseTime: 0,
    projectProgress: 0,
    aiAccuracy: 0
  });
  const [activeCollaborators, setActiveCollaborators] = useState<Collaborator[]>([]);


  // 파일 카테고리 관리
  const fileCategories = [
    { id: 'all', name: '전체', icon: Folder },
    { id: 'documents', name: '문서', icon: FileText },
    { id: 'images', name: '이미지', icon: Image },
    { id: 'videos', name: '동영상', icon: Video },
    { id: 'audio', name: '음성', icon: Volume2 },
    { id: 'spreadsheets', name: '스프레드시트', icon: BarChart3 },
    { id: 'presentations', name: '프레젠테이션', icon: Presentation },
    { id: 'archives', name: '압축파일', icon: Archive }
  ];

  // 지침 타입별 필터링
  const getFilteredGuidelines = () => {
    if (selectedGuidelineType === 'all') return guidelines;
    return guidelines.filter(guideline => guideline.type === selectedGuidelineType);
  };

  // 파일 카테고리별 필터링
  const getFilteredFiles = () => {
    if (selectedFileCategory === 'all') return uploadedFiles;
    return uploadedFiles.filter(file => {
      const fileType = file.type.toLowerCase();
      switch (selectedFileCategory) {
        case 'documents':
          return fileType.includes('pdf') || fileType.includes('doc') || fileType.includes('txt');
        case 'images':
          return fileType.includes('jpg') || fileType.includes('png') || fileType.includes('gif');
        case 'videos':
          return fileType.includes('mp4') || fileType.includes('avi') || fileType.includes('mov');
        case 'audio':
          return fileType.includes('mp3') || fileType.includes('wav') || fileType.includes('aac');
        case 'spreadsheets':
          return fileType.includes('xlsx') || fileType.includes('csv');
        case 'presentations':
          return fileType.includes('pptx') || fileType.includes('key');
        case 'archives':
          return fileType.includes('zip') || fileType.includes('rar');
        default:
          return true;
      }
    });
  };

  // 지침 추가/편집
  const handleGuidelineSubmit = () => {
    if (!editingGuideline) return;

    if (editingGuideline.id) {
      // 기존 지침 수정
      setGuidelines(prev => prev.map(g =>
        g.id === editingGuideline.id ? editingGuideline : g
      ));
    } else {
      // 새 지침 추가
      const newGuideline: Guideline = {
        ...editingGuideline,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };
      setGuidelines(prev => [...prev, newGuideline]);
    }

    setEditingGuideline(null);
    setShowGuidelinesModal(false);
  };

  // 파일 편집
  const handleFileEdit = () => {
    if (!editingFile) return;

    setUploadedFiles(prev => prev.map(f =>
      f.id === editingFile.id ? editingFile : f
    ));

    setEditingFile(null);
    setShowFilesModal(false);
  };

  // 파일 삭제
  const handleFileDelete = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // 지침 삭제
  const handleGuidelineDelete = (guidelineId: string) => {
    setGuidelines(prev => prev.filter(g => g.id !== guidelineId));
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 파일 타입별 아이콘
  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return FileText;
    if (type.includes('doc')) return FileText;
    if (type.includes('jpg') || type.includes('png') || type.includes('gif')) return Image;
    if (type.includes('mp4') || type.includes('avi')) return Video;
    if (type.includes('mp3') || type.includes('wav')) return Volume2;
    if (type.includes('xlsx') || type.includes('csv')) return BarChart3;
    if (type.includes('pptx')) return Presentation;
    if (type.includes('zip') || type.includes('rar')) return Archive;
    return FileText;
  };

  // 지침 우선순위별 색상
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  // 지침 타입별 색상
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'basic': return '#3b82f6';
      case 'logical': return '#8b5cf6';
      case 'standard': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const voiceRecognitionRef = useRef<any>(null);

  const models = [
    {
      id: 'claude-opus-4',
      name: 'Claude Opus 4',
      description: '복잡한 작업을 위한 강력한 대형 모델',
      performance: { speed: 95, accuracy: 98, cost: 'high' }
    },
    {
      id: 'claude-sonnet-4',
      name: 'Claude Sonnet 4',
      description: '일상적인 사용에 적합한 스마트하고 효율적인 모델',
      performance: { speed: 98, accuracy: 95, cost: 'medium' }
    },
    {
      id: 'claude-haiku-4',
      name: 'Claude Haiku 4',
      description: '빠른 응답이 필요한 간단한 작업용 모델',
      performance: { speed: 100, accuracy: 92, cost: 'low' }
    }
  ];

  const tools = [
    { id: 'deep-research', name: '심층 리서치', icon: Search, description: '깊이 있는 연구 및 분석', color: '#3b82f6' },
    { id: 'image-creation', name: '이미지 만들기', icon: PenTool, description: 'AI 이미지 생성', color: '#8b5cf6' },
    { id: 'web-search', name: '웹 검색', icon: Globe, description: '실시간 웹 검색', color: '#10b981' },
    { id: 'canvas', name: '캔버스', icon: FileText, description: '창작 도구', color: '#f59e0b' },
    { id: 'file-upload', name: '파일 업로드', icon: Upload, description: '파일 첨부', color: '#ef4444' },
    { id: 'github', name: 'GitHub에서 추가', icon: Github, description: 'GitHub 연동', color: '#6b7280' },
    { id: 'drive', name: 'Google Drive에서 추가', icon: FileText, description: 'Google Drive 연동', color: '#4285f4' },
    { id: 'project', name: '프로젝트 사용하기', icon: Folder, description: '프로젝트 관리', color: '#059669' }
  ];

  const connectors = [
    { id: 'drive-search', name: 'Drive 검색', icon: FileText, connected: false },
    { id: 'gmail-search', name: 'Gmail 검색', icon: Mail, connected: true },
    { id: 'calendar-search', name: 'Calendar 검색', icon: Calendar, connected: false }
  ];

  // 키보드 단축키
  const keyboardShortcuts = {
    'Ctrl+Enter': '메시지 전송',
    'Ctrl+K': '검색',
    'Ctrl+N': '새 채팅',
    'Ctrl+P': '새 프로젝트',
    'Ctrl+S': '저장',
    'Ctrl+Z': '실행 취소',
    'Ctrl+Y': '다시 실행',
    'Ctrl+/': '단축키 도움말',
    'F11': '전체화면',
    'Ctrl+M': '음성 입력'
  };

  // 초기 데이터 설정
  useEffect(() => {
    const initialProject: Project = {
      id: '1',
      name: '개포우성_실명방',
      description: '개포우성 프로젝트 채팅방',
      createdAt: new Date(),
      updatedAt: new Date(),
      type: 'real-estate'
    };

    const initialChatSession: ChatSession = {
      id: '1',
      title: '새 채팅',
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_pinned: false,
      tags: ['일반']
    };

    setCurrentProject(initialProject);
    setProjects([initialProject]);
    setChatSessions([initialChatSession]);
    setSelectedChatSession(initialChatSession);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 입력 관련 상태 추가
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputPlaceholder, setInputPlaceholder] = useState('메시지를 입력하세요...');
  const [showInputSuggestions, setShowInputSuggestions] = useState(false);
  const [inputSuggestions] = useState([
    '프로젝트 분석을 도와주세요',
    '새로운 아이디어를 제안해주세요',
    '문서를 요약해주세요',
    '코드를 최적화해주세요',
    '시장 분석을 해주세요'
  ]);

  // 입력창 포커스 처리
  const handleInputFocus = () => {
    setIsInputFocused(true);
    setInputPlaceholder('메시지를 입력하세요...');
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    setShowInputSuggestions(false);
  };

  // 입력창 키 입력 처리
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'ArrowDown' && showInputSuggestions) {
      e.preventDefault();
      // 제안 항목 네비게이션 로직
    } else if (e.key === 'Escape') {
      setShowInputSuggestions(false);
    }
  };

  // 제안 항목 선택
  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    setShowInputSuggestions(false);
    inputRef.current?.focus();
  };

  // 입력창 높이 자동 조절 (개선)
  const adjustTextareaHeight = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = '24px'; // 초기 높이로 리셋
      const scrollHeight = inputRef.current.scrollHeight;
      const maxHeight = 20 * 24; // 20줄 * 24px
      const newHeight = Math.min(scrollHeight, maxHeight);
      inputRef.current.style.height = `${newHeight}px`;

      // 스크롤 표시 여부 결정
      if (scrollHeight > maxHeight) {
        inputRef.current.style.overflowY = 'auto';
      } else {
        inputRef.current.style.overflowY = 'hidden';
      }
    }
  }, []);

  // 입력값 변경 시 높이 조절 및 제안 표시
  useEffect(() => {
    adjustTextareaHeight();

    // 입력값이 있을 때 제안 숨기기
    if (inputMessage.trim()) {
      setShowInputSuggestions(false);
    } else if (isInputFocused) {
      setShowInputSuggestions(true);
    }
  }, [inputMessage, adjustTextareaHeight, isInputFocused]);

  // 입력창 자동 포커스
  useEffect(() => {
    if (messages.length > 0 && !isTyping) {
      inputRef.current?.focus();
    }
  }, [messages.length, isTyping]);

  // 타이핑 속도 시뮬레이션
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setTypingSpeed(prev => Math.min(prev + 5, 100));
      }, 50);
      return () => clearInterval(interval);
    } else {
      setTypingSpeed(0);
    }
  }, [isLoading]);

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault();
            handleSendMessage();
            break;
          case 'k':
            e.preventDefault();
            searchRef.current?.focus();
            break;
          case 'n':
            e.preventDefault();
            handleCreateNewChat();
            break;
          case 'p':
            e.preventDefault();
            setShowNewProjectModal(true);
            break;
          case 's':
            e.preventDefault();
            handleSaveProject();
            break;
          case '/':
            e.preventDefault();
            setShowKeyboardShortcuts(!showKeyboardShortcuts);
            break;
        }
      }

      if (e.key === 'F11') {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, showKeyboardShortcuts]);

  // 기존 코드에 프로젝트별 기능 통합
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      created_at: new Date().toISOString(),
      metadata: {
        tokens: Math.floor(inputMessage.length / 4),
        processing_time: 0,
        model_used: selectedModel,
        confidence: 1.0,
        sentiment: 'neutral',
        project_type: currentProject?.settings?.project_type || 'general'
      }
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // 프로젝트별 특화 응답 생성
      const projectType = currentProject?.settings?.project_type || 'general';
      const projectData = {
        files: uploadedFiles,
        guidelines,
        chats: chatSessions,
        collaborators
      };

      const response = await generateProjectSpecificResponse(
        inputMessage,
        projectType,
        projectData,
        selectedModel
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        created_at: new Date().toISOString(),
        metadata: {
          tokens: Math.floor(response.length / 4),
          processing_time: Math.random() * 2000 + 500,
          model_used: selectedModel,
          confidence: 0.95,
          sentiment: 'positive',
          project_type: projectType,
          tools_used: getProjectTools(projectType).map(t => t.name)
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

      // AI 성능 메트릭 업데이트
      setAiPerformance({
        response_time: assistantMessage.metadata?.processing_time || 0,
        tokens_used: assistantMessage.metadata?.tokens || 0,
        model_accuracy: 95 + Math.random() * 5,
        confidence_score: assistantMessage.metadata?.confidence || 0
      });
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '죄송합니다. 프로젝트별 응답을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleModelSelect = (model: typeof models[0]) => {
    setSelectedModel(model.name);
    setShowModelDropdown(false);
  };

  // 새로운 프로젝트 생성
  const handleCreateNewProject = () => {
    if (!newProjectName.trim()) return;

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName,
      description: newProjectDescription,
      createdAt: new Date(),
      updatedAt: new Date(),
      type: 'real-estate',
      settings: {
        project_type: 'real-estate'
      }
    };

    setProjects(prev => [...prev, newProject]);
    setCurrentProject(newProject);
    setNewProjectName('');
    setNewProjectDescription('');
    goToConversation();
  };

  // 새 채팅 세션 생성
  const handleCreateNewChat = () => {
    const newChatSession: ChatSession = {
      id: Date.now().toString(),
      title: `새 채팅 ${chatSessions.length + 1}`,
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_pinned: false,
      tags: ['일반']
    };

    setChatSessions(prev => [...prev, newChatSession]);
    setSelectedChatSession(newChatSession);
    setMessages([]);
  };

  // 파일 업로드 처리
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    const newFiles: ProjectFile[] = files.map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      uploaded_at: new Date().toISOString(),
      category: '자동분류됨',
      preview: URL.createObjectURL(file)
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setShowFileUpload(false);
  };

  // 지침 추가
  const handleAddGuideline = (type: 'basic' | 'logical' | 'standard') => {
    const guideline: Guideline = {
      id: Date.now().toString(),
      title: `${type === 'basic' ? '기본' : type === 'logical' ? '논리' : '기준'} 지침`,
      content: `${type === 'basic' ? '기본적인' : type === 'logical' ? '논리적인' : '표준'} 지침 내용입니다.`,
      type,
      created_at: new Date().toISOString(),
      priority: 'medium'
    };

    setGuidelines(prev => [...prev, guideline]);
  };

  // 음성 입력 처리
  const handleVoiceInput = () => {
    if (!isVoiceRecording) {
      setIsVoiceRecording(true);
      // 음성 인식 시작
      if ('webkitSpeechRecognition' in window) {
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'ko-KR';

        recognition.onstart = () => {
          console.log('음성 인식 시작');
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(transcript);
          setIsVoiceRecording(false);
        };

        recognition.onerror = () => {
          setIsVoiceRecording(false);
        };

        recognition.start();
        voiceRecognitionRef.current = recognition;
      }
    } else {
      setIsVoiceRecording(false);
      if (voiceRecognitionRef.current) {
        voiceRecognitionRef.current.stop();
      }
    }
  };

  // 프로젝트 저장
  const handleSaveProject = () => {
    setIsAutoSaving(true);
    setTimeout(() => {
      setIsAutoSaving(false);
    }, 2000);
  };

  // 메시지 검색
  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 협업자 추가
  const handleAddCollaborator = () => {
    const newCollaborator: Collaborator = {
      id: Date.now().toString(),
      name: '새 협업자',
      email: 'collaborator@example.com',
      role: 'editor',
      last_active: new Date().toISOString()
    };
    setCollaborators(prev => [...prev, newCollaborator]);
  };

  // 프로젝트별 도구 메뉴 표시
  const renderProjectTools = () => {
    if (!currentProject) return null;

    const projectType = currentProject.settings?.project_type || 'general';
    const tools = getProjectTools(projectType);
    const templates = getProjectTemplates(projectType);
    const prompts = getProjectPrompts(projectType);

    return (
      <div className="project-specific-tools">
        <div className="tools-section">
          <h4>전문 도구</h4>
          <div className="tools-grid">
            {tools.map(tool => (
              <button key={tool.id} className="tool-item" title={tool.name}>
                <span className="tool-icon">{tool.icon}</span>
                <span className="tool-name">{tool.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="templates-section">
          <h4>템플릿</h4>
          <div className="templates-grid">
            {templates.map(template => (
              <button key={template.id} className="template-item" title={template.description}>
                <FileText size={16} />
                <span>{template.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="prompts-section">
          <h4>AI 프롬프트</h4>
          <div className="prompts-grid">
            {prompts.map(prompt => (
              <button
                key={prompt.id}
                className="prompt-item"
                onClick={() => setInputMessage(prompt.text)}
                title="클릭하여 입력창에 추가"
              >
                <MessageSquare size={16} />
                <span>{prompt.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 고급 UI 상태 추가
  const [showAdvancedUI, setShowAdvancedUI] = useState(false);
  const [uiTheme, setUITheme] = useState<'cosmic' | 'neon' | 'aurora'>('cosmic');
  const [particleEffect, setParticleEffect] = useState(false);
  const [holographicMode, setHolographicMode] = useState(false);

  // UI 테마별 색상 팔레트
  const themeColors = {
    cosmic: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      glow: 'rgba(99, 102, 241, 0.3)'
    },
    neon: {
      primary: '#10b981',
      secondary: '#f59e0b',
      accent: '#ef4444',
      glow: 'rgba(16, 185, 129, 0.3)'
    },
    aurora: {
      primary: '#8b5cf6',
      secondary: '#ec4899',
      accent: '#06b6d4',
      glow: 'rgba(139, 92, 246, 0.3)'
    }
  };

  // 현재 테마 색상
  const currentColors = themeColors[uiTheme];

  // 고급 UI 토글
  const toggleAdvancedUI = () => {
    setShowAdvancedUI(!showAdvancedUI);
    if (!showAdvancedUI) {
      setParticleEffect(true);
      setTimeout(() => setParticleEffect(false), 3000);
    }
  };

  // 홀로그래픽 모드 토글
  const toggleHolographicMode = () => {
    setHolographicMode(!holographicMode);
  };

  // 파티클 효과
  useEffect(() => {
    if (particleEffect) {
      const particles = document.createElement('div');
      particles.className = 'particle-container';
      document.body.appendChild(particles);

      setTimeout(() => {
        document.body.removeChild(particles);
      }, 3000);
    }
  }, [particleEffect]);

  // 페이지 상태 관리
  const [currentPage, setCurrentPage] = useState<'welcome' | 'project-setup' | 'conversation'>('welcome');
  const [showSidebar, setShowSidebar] = useState(true); // 초기값을 true로 변경

  // 페이지 전환 함수들
  const goToWelcome = () => {
    setCurrentPage('welcome');
    setShowSidebar(true); // 사이드바 표시
  };

  const goToProjectSetup = () => {
    setCurrentPage('project-setup');
    setShowSidebar(true); // 사이드바 표시
  };

  const goToConversation = () => {
    setCurrentPage('conversation');
    setShowSidebar(true);
  };

  // 페이지별 렌더링 함수들
  const renderWelcomePage = () => (
    <div className="welcome-page">
      <div className="welcome-content glass-effect">
        {/* 브랜딩 섹션 */}
        <div className="welcome-section branding-section">
          <div className="welcome-icon">
            <Brain size={80} className="gradient-text" />
          </div>
          <h1 className="gradient-text">CORBU AI에 오신 것을 환영합니다</h1>
          <p className="welcome-description">
            프로젝트별 특화된 AI 협업 플랫폼으로 더 나은 결과를 만들어보세요
          </p>
        </div>

        {/* 플로우 섹션 */}
        <div className="welcome-section flow-section">
          <div className="flow-container">
            <div className="flow-step">
              <div className="flow-icon">
                <Plus size={32} />
              </div>
              <div className="flow-content">
                <h3>1. 프로젝트 생성</h3>
                <p>프로젝트 타입을 선택하고 기본 정보를 설정합니다</p>
              </div>
            </div>
            
            <div className="flow-arrow">
              <ArrowRight size={24} />
            </div>
            
            <div className="flow-step">
              <div className="flow-icon">
                <MessageSquare size={32} />
              </div>
              <div className="flow-content">
                <h3>2. AI 대화 시작</h3>
                <p>프로젝트별 특화된 AI와 전문적인 대화를 시작합니다</p>
              </div>
            </div>
            
            <div className="flow-arrow">
              <ArrowRight size={24} />
            </div>
            
            <div className="flow-step">
              <div className="flow-icon">
                <FileText size={32} />
              </div>
              <div className="flow-content">
                <h3>3. 파일 & 지침 관리</h3>
                <p>프로젝트 관련 파일과 지침을 체계적으로 관리합니다</p>
              </div>
            </div>
            
            <div className="flow-arrow">
              <ArrowRight size={24} />
            </div>
            
            <div className="flow-step">
              <div className="flow-icon">
                <Target size={32} />
              </div>
              <div className="flow-content">
                <h3>4. 결과 도출</h3>
                <p>AI 분석과 협업을 통해 프로젝트 목표를 달성합니다</p>
              </div>
            </div>
          </div>
        </div>

        {/* 기능 섹션 */}
        <div className="welcome-section features-section">
          <div className="welcome-features">
            <div className="feature-card">
              <Zap size={32} />
              <h3>프로젝트별 특화 AI</h3>
              <p>부동산, 건설, 비즈니스 등 프로젝트 타입에 맞는 전문 AI</p>
            </div>
            <div className="feature-card">
              <Users size={32} />
              <h3>실시간 협업</h3>
              <p>팀원과 함께 실시간으로 프로젝트를 진행하고 결과를 공유</p>
            </div>
            <div className="feature-card">
              <FileText size={32} />
              <h3>스마트 파일 관리</h3>
              <p>자동 분류와 검색으로 효율적인 문서 관리</p>
            </div>
            <div className="feature-card">
              <Target size={32} />
              <h3>목표 지향적 분석</h3>
              <p>프로젝트 목표에 맞춘 데이터 분석과 인사이트 도출</p>
            </div>
          </div>
        </div>

        {/* 액션 섹션 */}
        <div className="welcome-section actions-section">
          <div className="welcome-actions">
            <button
              className="primary-btn"
              onClick={goToProjectSetup}
            >
              <Plus size={24} />
              새 프로젝트 시작
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProjectSetupPage = () => (
    <div className="project-setup-page">
      <div className="setup-content glass-effect">
        <h2 className="gradient-text">새 프로젝트 설정</h2>

        <div className="setup-sections">
          <div className="setup-section">
            <h3>프로젝트 타입 선택</h3>
            <div className="project-type-grid">
              {projectTypes.map(type => (
                <button
                  key={type.id}
                  className={`project-type-card ${currentProject?.settings?.project_type === type.id ? 'active' : ''}`}
                  onClick={() => {
                    if (!currentProject) {
                      const newProject: Project = {
                        id: Date.now().toString(),
                        name: '',
                        description: '',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        type: type.id
                      };
                      setCurrentProject(newProject);
                    } else {
                      setCurrentProject(prev => prev ? {
                        ...prev,
                        settings: { ...prev.settings, project_type: type.id }
                      } : null);
                    }
                  }}
                >
                  <type.icon size={32} />
                  <h4>{type.name}</h4>
                  <p>{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {currentProject && (
            <div className="setup-section">
              <h3>프로젝트 정보</h3>
              <div className="project-info-form">
                <input
                  type="text"
                  placeholder="프로젝트 이름"
                  value={currentProject.name}
                  onChange={(e) => setCurrentProject(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
                <textarea
                  placeholder="프로젝트 설명"
                  value={currentProject.description}
                  onChange={(e) => setCurrentProject(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>
            </div>
          )}

          {currentProject && currentProject.name && (
            <div className="setup-actions">
              <button
                className="primary-btn"
                onClick={goToConversation}
              >
                프로젝트 시작하기
              </button>
              <button
                className="secondary-btn"
                onClick={goToWelcome}
              >
                뒤로 가기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderConversationPage = () => (
    <div className="conversation-page">
      {/* 프로젝트별 도구 */}
      {currentProject && (
        <div className="project-specific-tools">
          <h3>🔧 프로젝트 도구</h3>
          <div className="tools-grid">
            {getProjectTools(currentProject.settings?.project_type || 'default').map(tool => (
              <button
                key={tool.id}
                className="tool-item"
                onClick={() => handleToolClick(tool.id)}
                style={{ '--tool-color': tool.color } as React.CSSProperties}
              >
                <span className="tool-icon">{tool.icon}</span>
                <span className="tool-name">{tool.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 채팅 메시지 */}
      <div className="chat-messages">
        {selectedChatSession?.messages.map(message => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-content">
              {message.analysis_type === 'construction_bias' ? (
                <div className="analysis-message">
                  <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br/>') }} />
                  <button
                    className="analysis-detail-btn"
                    onClick={() => setShowConstructionAnalysis(true)}
                  >
                    🏗️ 시공사 분석 상세보기
                  </button>
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br/>') }} />
              )}
            </div>
            <div className="message-actions">
              <button onClick={() => handleCopyMessage(message.content)} title="복사">
                <Copy size={14} />
              </button>
              <button onClick={() => handleEditMessage(message.id)} title="편집">
                <Edit size={14} />
              </button>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="message assistant typing">
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

      {/* 입력 영역 */}
      <div className="input-area">
        {/* ... existing input area code ... */}
      </div>
    </div>
  );

  const handleConstructionAnalysis = async () => {
    if (!currentProject || !selectedChatSession) {
      alert('프로젝트와 채팅 세션을 선택해주세요.');
      return;
    }

    try {
      setIsTyping(true);

      const response = await fetch('/api/construction-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: currentProject.id,
          chat_session_id: selectedChatSession.id,
          messages: selectedChatSession.messages
        }),
      });

      if (response.ok) {
        const analysisData = await response.json();
        setConstructionAnalysis(analysisData);
        setShowConstructionAnalysis(true);

        // 분석 결과를 채팅에 추가
        const analysisMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `🏗️ **시공사 편향성 분석 완료**\n\n` +
            `📊 **전체 요약**\n` +
            `• 분석된 시공사: ${analysisData.summary.total_companies_analyzed}개\n` +
            `• 가장 편향된 시공사: ${analysisData.summary.most_biased_company}\n` +
            `• 전체 트렌드: ${analysisData.summary.overall_bias_trend}\n` +
            `• 홍보 vs 반대 비율: ${Math.round(analysisData.summary.promotion_vs_opposition.promotion_ratio * 100)}% : ${Math.round(analysisData.summary.promotion_vs_opposition.opposition_ratio * 100)}%\n\n` +
            `💡 **상세 분석 결과를 확인하려면 '시공사 분석 상세보기' 버튼을 클릭하세요.`,
          created_at: new Date().toISOString(),
          analysis_type: 'construction_bias'
        };

        setSelectedChatSession(prev => ({
          ...prev!,
          messages: [...prev!.messages, analysisMessage]
        }));
      } else {
        throw new Error('분석 요청에 실패했습니다.');
      }
    } catch (error) {
      console.error('시공사 분석 오류:', error);
      alert('시공사 분석 중 오류가 발생했습니다.');
    } finally {
      setIsTyping(false);
    }
  };

  const renderConstructionAnalysisModal = () => {
    if (!constructionAnalysis) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowConstructionAnalysis(false)}>
        <div className="modal-content construction-analysis-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>🏗️ 시공사 편향성 분석 결과</h2>
            <button className="modal-close" onClick={() => setShowConstructionAnalysis(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="modal-body">
            {/* 전체 요약 */}
            <div className="analysis-summary">
              <h3>📊 전체 요약</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">분석된 시공사</span>
                  <span className="summary-value">{constructionAnalysis.summary.total_companies_analyzed}개</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">가장 편향된 시공사</span>
                  <span className="summary-value">{constructionAnalysis.summary.most_biased_company}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">전체 트렌드</span>
                  <span className="summary-value">{constructionAnalysis.summary.overall_bias_trend}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">홍보 vs 반대</span>
                  <span className="summary-value">
                    {Math.round(constructionAnalysis.summary.promotion_vs_opposition.promotion_ratio * 100)}% : {Math.round(constructionAnalysis.summary.promotion_vs_opposition.opposition_ratio * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* 시공사별 분석 */}
            <div className="company-analysis">
              <h3>🏢 시공사별 편향성 분석</h3>
              <div className="company-grid">
                {Object.entries(constructionAnalysis.company_bias).map(([company, data]) => (
                  <div key={company} className="company-card">
                    <div className="company-header">
                      <h4>{company}</h4>
                      <div className={`bias-score ${data.bias_score > 0 ? 'positive' : data.bias_score < 0 ? 'negative' : 'neutral'}`}>
                        {data.bias_score > 0 ? '+' : ''}{Math.round(data.bias_score * 100)}%
                      </div>
                    </div>
                    <div className="company-stats">
                      <div className="stat-item">
                        <span>긍정 언급</span>
                        <span>{data.positive_mentions}회</span>
                      </div>
                      <div className="stat-item">
                        <span>부정 언급</span>
                        <span>{data.negative_mentions}회</span>
                      </div>
                      <div className="stat-item">
                        <span>홍보 논리</span>
                        <span>{data.promotion_logic_count}회</span>
                      </div>
                      <div className="stat-item">
                        <span>반대 의견</span>
                        <span>{data.opposition_count}회</span>
                      </div>
                    </div>
                    {data.key_promoters.length > 0 && (
                      <div className="key-participants">
                        <span>주요 옹호자: {data.key_promoters.join(', ')}</span>
                      </div>
                    )}
                    {data.key_opponents.length > 0 && (
                      <div className="key-participants">
                        <span>주요 반대자: {data.key_opponents.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 참여자별 분석 */}
            <div className="participant-analysis">
              <h3>👥 참여자별 편향성 분석</h3>
              <div className="participant-grid">
                {Object.entries(constructionAnalysis.participant_analysis).map(([participant_id, data]) => (
                  <div key={participant_id} className="participant-card">
                    <div className="participant-header">
                      <h4>{data.participant_name}</h4>
                      <div className={`bias-strength ${data.bias_strength > 0.5 ? 'high' : data.bias_strength > 0.2 ? 'medium' : 'low'}`}>
                        편향도: {Math.round(data.bias_strength * 100)}%
                      </div>
                    </div>
                    <div className="participant-stats">
                      <div className="stat-item">
                        <span>총 언급</span>
                        <span>{data.total_mentions}회</span>
                      </div>
                      <div className="stat-item">
                        <span>홍보 발언</span>
                        <span>{data.promotion_count}회</span>
                      </div>
                      <div className="stat-item">
                        <span>반대 발언</span>
                        <span>{data.opposition_count}회</span>
                      </div>
                      <div className="stat-item">
                        <span>가장 편향된 시공사</span>
                        <span>{data.most_biased_company}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleToolClick = async (toolId: string) => {
    if (!currentProject) {
      alert('프로젝트를 선택해주세요.');
      return;
    }

    switch (toolId) {
      case 'construction-analysis':
        await handleConstructionAnalysis();
        break;
      case 'contract-analysis':
        // 계약서 분석 기능
        break;
      case 'safety-analysis':
        // 안전성 분석 기능
        break;
      case 'cost-analysis':
        // 비용 분석 기능
        break;
      default:
        alert('해당 기능은 준비 중입니다.');
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('메시지가 클립보드에 복사되었습니다.');
  };

  const handleEditMessage = (messageId: string) => {
    // 메시지 편집 기능
    console.log('편집할 메시지:', messageId);
  };

  const toggleCollaboration = () => {
    setCollaborationMode(!collaborationMode);
  };

  return (
    <div className={`chatgpt-container ${holographicMode ? 'holographic' : ''}`}>


      {/* 메인 콘텐츠 영역 */}
      <div className="chatgpt-main">
        {/* 헤더 - 모든 페이지에서 표시 */}
        <div className={`chatgpt-header glass-effect ${holographicMode ? 'holographic' : ''}`}>
          <div className="header-content">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            <div className="header-actions">
              {/* 고급 UI 토글 */}
              <button
                className="header-btn neon-glow"
                onClick={toggleAdvancedUI}
                title="고급 UI 모드"
              >
                <Zap size={16} />
              </button>

              {/* 홀로그래픽 모드 */}
              <button
                className={`header-btn ${holographicMode ? 'active' : ''}`}
                onClick={toggleHolographicMode}
                title="홀로그래픽 모드"
              >
                <Brain size={16} />
              </button>

              {/* 테마 변경 */}
              <div className="theme-selector">
                <button
                  className={`theme-btn ${uiTheme === 'cosmic' ? 'active' : ''}`}
                  onClick={() => setUITheme('cosmic')}
                  title="Cosmic 테마"
                  style={{ backgroundColor: themeColors.cosmic.primary }}
                >
                  <Star size={14} />
                </button>
                <button
                  className={`theme-btn ${uiTheme === 'neon' ? 'active' : ''}`}
                  onClick={() => setUITheme('neon')}
                  title="Neon 테마"
                  style={{ backgroundColor: themeColors.neon.primary }}
                >
                  <Zap size={14} />
                </button>
                <button
                  className={`theme-btn ${uiTheme === 'aurora' ? 'active' : ''}`}
                  onClick={() => setUITheme('aurora')}
                  title="Aurora 테마"
                  style={{ backgroundColor: themeColors.aurora.primary }}
                >
                  <Sparkles size={14} />
                </button>
              </div>

              <button
                className="header-btn"
                onClick={() => setShowPerformanceMetrics(!showPerformanceMetrics)}
                title="성능 지표"
              >
                <BarChart3 size={16} />
              </button>

              {/* 실시간 협업 토글 */}
              <button
                className={`header-btn ${collaborationMode ? 'active' : ''}`}
                onClick={toggleCollaboration}
                title="실시간 협업"
              >
                <Users size={16} />
              </button>

              {/* 고급 분석 패널 */}
              <button
                className="header-btn"
                onClick={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
                title="고급 분석"
              >
                <TrendingUp size={16} />
              </button>

              <button
                className="header-btn"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title="테마 변경"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              <button
                className="header-btn"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title="전체화면"
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>
          {currentProject && currentPage === 'conversation' && (
            <div className="project-title">
              <span className="gradient-text">{currentProject.name}</span>
            </div>
          )}
        </div>

        {/* 페이지별 콘텐츠 렌더링 */}
        {currentPage === 'welcome' && renderWelcomePage()}
        {currentPage === 'project-setup' && renderProjectSetupPage()}
        {currentPage === 'conversation' && renderConversationPage()}

        {/* 고급 UI 패널 */}
        {showAdvancedUI && (
          <div className="modal-overlay" onClick={() => setShowAdvancedUI(false)}>
            <div className="advanced-ui-panel glass-effect" onClick={e => e.stopPropagation()}>
              <div className="advanced-ui-content">
                <div className="modal-header">
                  <h3>고급 UI 설정</h3>
                  <button className="modal-close" onClick={() => setShowAdvancedUI(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="ui-controls">
                  <div className="control-group">
                    <label>테마 선택</label>
                    <div className="theme-buttons">
                      {Object.entries(themeColors).map(([theme, colors]) => (
                        <button
                          key={theme}
                          className={`theme-option ${uiTheme === theme ? 'active' : ''}`}
                          onClick={() => setUITheme(theme as any)}
                          style={{
                            background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}20 100%)`,
                            borderColor: uiTheme === theme ? colors.primary : 'transparent'
                          }}
                        >
                          <span className="theme-name">{theme}</span>
                          <div className="theme-preview" style={{ backgroundColor: colors.primary }}></div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="control-group">
                    <label>특수 효과</label>
                    <div className="effect-toggles">
                      <button
                        className={`effect-btn ${holographicMode ? 'active' : ''}`}
                        onClick={toggleHolographicMode}
                      >
                        <Brain size={16} />
                        <span>홀로그래픽</span>
                      </button>
                      <button
                        className={`effect-btn ${particleEffect ? 'active' : ''}`}
                        onClick={() => setParticleEffect(!particleEffect)}
                      >
                        <Sparkles size={16} />
                        <span>파티클</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 고급 분석 패널 */}
        {showAnalyticsPanel && (
          <div className="modal-overlay" onClick={() => setShowAnalyticsPanel(false)}>
            <div className="analytics-panel glass-effect" onClick={e => e.stopPropagation()}>
              <div className="analytics-content">
                <div className="modal-header">
                  <h3>프로젝트 분석</h3>
                  <button className="modal-close" onClick={() => setShowAnalyticsPanel(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <div className="analytics-icon">
                      <MessageSquare size={20} />
                    </div>
                    <div className="analytics-info">
                      <h4>총 메시지</h4>
                      <span className="analytics-value">{analyticsData.messageCount}</span>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-icon">
                      <Clock size={20} />
                    </div>
                    <div className="analytics-info">
                      <h4>평균 응답 시간</h4>
                      <span className="analytics-value">{Math.round(analyticsData.averageResponseTime)}ms</span>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-icon">
                      <TrendingUp size={20} />
                    </div>
                    <div className="analytics-info">
                      <h4>프로젝트 진행률</h4>
                      <span className="analytics-value">{Math.round(analyticsData.projectProgress)}%</span>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-icon">
                      <Target size={20} />
                    </div>
                    <div className="analytics-info">
                      <h4>AI 정확도</h4>
                      <span className="analytics-value">{analyticsData.aiAccuracy.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 실시간 협업 표시 */}
        {collaborationMode && activeCollaborators.length > 0 && (
          <div className="collaboration-indicator glass-effect">
            <div className="collaboration-header">
              <Users size={16} />
              <span>실시간 협업 중</span>
            </div>
            <div className="active-collaborators">
              {activeCollaborators.map(collaborator => (
                <div key={collaborator.id} className="collaborator-indicator">
                  <div className="collaborator-avatar">
                    {collaborator.name.charAt(0)}
                  </div>
                  <span className="collaborator-name">{collaborator.name}</span>
                  <span className="collaborator-role">{collaborator.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 지침 관리 모달 */}
        {showGuidelinesModal && (
          <div className="modal-overlay">
            <div className="modal-content guidelines-modal">
              <div className="modal-header">
                <h3>지침 관리</h3>
                <button
                  className="close-btn"
                  onClick={() => setShowGuidelinesModal(false)}
                  title="닫기"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-tabs">
                <button
                  className={`tab-btn ${!editingGuideline ? 'active' : ''}`}
                  onClick={() => setEditingGuideline(null)}
                >
                  지침 목록
                </button>
                <button
                  className={`tab-btn ${editingGuideline ? 'active' : ''}`}
                  onClick={() => {
                    if (!editingGuideline) {
                      setEditingGuideline({
                        id: '',
                        title: '',
                        content: '',
                        type: 'basic',
                        created_at: '',
                        priority: 'medium'
                      });
                    }
                  }}
                >
                  {editingGuideline?.id ? '지침 편집' : '새 지침'}
                </button>
              </div>

              {!editingGuideline ? (
                <div className="guidelines-list-view">
                  <div className="filter-section">
                    <select
                      value={selectedGuidelineType}
                      onChange={(e) => setSelectedGuidelineType(e.target.value as any)}
                      className="filter-select"
                      title="지침 타입 필터"
                    >
                      <option value="all">전체</option>
                      <option value="basic">기본</option>
                      <option value="logical">논리</option>
                      <option value="standard">기준</option>
                    </select>
                  </div>

                  <div className="guidelines-grid">
                    {getFilteredGuidelines().map(guideline => (
                      <div key={guideline.id} className="guideline-card">
                        <div className="guideline-header">
                          <div className="guideline-type" style={{ backgroundColor: getTypeColor(guideline.type) }}>
                            {guideline.type}
                          </div>
                          <div className="guideline-priority" style={{ backgroundColor: getPriorityColor(guideline.priority) }}>
                            {guideline.priority}
                          </div>
                        </div>
                        <h4>{guideline.title}</h4>
                        <p>{guideline.content}</p>
                        <div className="guideline-actions">
                          <button
                            onClick={() => setEditingGuideline(guideline)}
                            title="편집"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleGuidelineDelete(guideline.id)}
                            title="삭제"
                            className="delete-btn"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="guideline-edit-form">
                  <input
                    type="text"
                    placeholder="지침 제목"
                    value={editingGuideline.title}
                    onChange={(e) => setEditingGuideline(prev => prev ? { ...prev, title: e.target.value } : null)}
                    title="지침 제목"
                  />
                  <textarea
                    placeholder="지침 내용"
                    value={editingGuideline.content}
                    onChange={(e) => setEditingGuideline(prev => prev ? { ...prev, content: e.target.value } : null)}
                    title="지침 내용"
                  />
                  <div className="form-row">
                    <select
                      value={editingGuideline.type}
                      onChange={(e) => setEditingGuideline(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                      title="지침 타입"
                    >
                      <option value="basic">기본</option>
                      <option value="logical">논리</option>
                      <option value="standard">기준</option>
                    </select>
                    <select
                      value={editingGuideline.priority}
                      onChange={(e) => setEditingGuideline(prev => prev ? { ...prev, priority: e.target.value as any } : null)}
                      title="우선순위"
                    >
                      <option value="low">낮음</option>
                      <option value="medium">보통</option>
                      <option value="high">높음</option>
                    </select>
                  </div>
                  <div className="modal-actions">
                    <button onClick={() => setEditingGuideline(null)}>취소</button>
                    <button onClick={handleGuidelineSubmit}>저장</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 파일 관리 모달 */}
        {showFilesModal && (
          <div className="modal-overlay">
            <div className="modal-content files-modal">
              <div className="modal-header">
                <h3>파일 관리</h3>
                <button
                  className="close-btn"
                  onClick={() => setShowFilesModal(false)}
                  title="닫기"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-tabs">
                <button
                  className={`tab-btn ${!editingFile ? 'active' : ''}`}
                  onClick={() => setEditingFile(null)}
                >
                  파일 목록
                </button>
                <button
                  className={`tab-btn ${editingFile ? 'active' : ''}`}
                  onClick={() => {
                    if (!editingFile) {
                      setEditingFile({
                        id: '',
                        name: '',
                        type: '',
                        size: 0,
                        uploaded_at: '',
                        category: ''
                      });
                    }
                  }}
                >
                  파일 업로드
                </button>
              </div>

              {!editingFile ? (
                <div className="files-list-view">
                  <div className="filter-section">
                    <div className="category-filters">
                      {fileCategories.map(category => (
                        <button
                          key={category.id}
                          className={`category-btn ${selectedFileCategory === category.id ? 'active' : ''}`}
                          onClick={() => setSelectedFileCategory(category.id)}
                          title={category.name}
                        >
                          <category.icon size={16} />
                          <span>{category.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="files-grid">
                    {getFilteredFiles().map(file => {
                      const FileIcon = getFileIcon(file.type);
                      return (
                        <div key={file.id} className="file-card">
                          <div className="file-icon">
                            <FileIcon size={24} />
                          </div>
                          <div className="file-info">
                            <h4>{file.name}</h4>
                            <p>{formatFileSize(file.size)}</p>
                            <p>{file.category}</p>
                          </div>
                          <div className="file-actions">
                            <button
                              onClick={() => setShowFilePreview(file.id)}
                              title="미리보기"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => setEditingFile(file)}
                              title="편집"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleFileDelete(file.id)}
                              title="삭제"
                              className="delete-btn"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="file-upload-form">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="upload-area"
                    title="파일 선택"
                  >
                    <Upload size={32} />
                    <span>파일을 선택하거나 여기로 드래그하세요</span>
                  </button>
                  <div className="modal-actions">
                    <button onClick={() => setEditingFile(null)}>취소</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 자동 저장 표시 */}
        {isAutoSaving && (
          <div className="auto-save-indicator">
            <Save size={14} />
            <span>자동 저장 중...</span>
          </div>
        )}

        {/* 도구 메뉴 */}
        {showToolsMenu && (
          <div className="chatgpt-tools-menu">
            <div className="chatgpt-tools-search">
              <Search size={14} />
              <input placeholder="Q 메뉴 검색" />
            </div>
            <div className="chatgpt-tools-list">
              {tools.slice(0, 4).map((tool) => (
                <button key={tool.id} className="chatgpt-tool-item" title={tool.description}>
                  <tool.icon size={16} />
                  <span>{tool.name}</span>
                </button>
              ))}
              <button className="chatgpt-tool-item" title="더 많은 도구">
                <Plus size={16} />
                <span>+ 도구</span>
              </button>
            </div>
          </div>
        )}

        {/* 커넥터 메뉴 */}
        {showConnectors && (
          <div className="chatgpt-connectors-menu">
            <div className="chatgpt-connectors-search">
              <Search size={14} />
              <input placeholder="Q 메뉴 검색" />
            </div>

            <div className="chatgpt-connectors-section">
              <div className="connector-option">
                <PenTool size={16} />
                <span>스타일 사용</span>
                <ChevronRight size={14} />
              </div>

              <div className="connector-option">
                <div className="connector-info">
                  <Calendar size={16} />
                  <span>심층 사고 모드</span>
                </div>
                <button
                  className={`toggle-switch ${showDeepThought ? 'active' : ''}`}
                  onClick={() => setShowDeepThought(!showDeepThought)}
                >
                  <div className="toggle-slider"></div>
                </button>
              </div>
            </div>

            <div className="chatgpt-connectors-section">
              <div className="connector-option">
                <div className="connector-info">
                  <Globe size={16} />
                  <span>웹 검색</span>
                </div>
                <button
                  className={`toggle-switch ${showWebSearch ? 'active' : ''}`}
                  onClick={() => setShowWebSearch(!showWebSearch)}
                >
                  <div className="toggle-slider"></div>
                </button>
              </div>
            </div>

            <div className="chatgpt-connectors-section">
              {connectors.map((connector) => (
                <div key={connector.id} className="connector-option">
                  <connector.icon size={16} />
                  <span>{connector.name}</span>
                  <div className="connector-status">
                    <span>{connector.connected ? '연결됨' : '연결 안됨'}</span>
                    <ExternalLink size={12} />
                  </div>
                </div>
              ))}
            </div>

            <div className="chatgpt-connectors-section">
              <div className="connector-option">
                <Plus size={16} />
                <span>+ 커넥터 추가</span>
              </div>

              <div className="connector-option">
                <Settings size={16} />
                <span>커넥터 관리</span>
                <ExternalLink size={12} />
              </div>
            </div>
          </div>
        )}

        {/* 면책 조항 */}
        <div className="chatgpt-disclaimer">
          CORBU AI는 실험적 기술을 사용합니다. 중요한 결정을 내리기 전에 항상 검증하세요.
        </div>
      </div>

      {/* 시공사 분석 모달 */}
      {showConstructionAnalysis && renderConstructionAnalysisModal()}
    </div>
  );
};

export default ChatGPTUnifiedSystem;