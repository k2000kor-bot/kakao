import React, { useState, useRef, useEffect } from 'react';
import ChatSidebar from './ChatSidebar';
import UnifiedDoctorLevelInput from './UnifiedDoctorLevelInput';
import enhancedFileAnalysisService, { FileAnalysis, AIResponse } from '../services/enhancedFileAnalysisService';

// 기존 컴포넌트들 import
import AdvancedFileUploadWithLearning from './AdvancedFileUploadWithLearning';
import MessageGuidanceSystem from './MessageGuidanceSystem';
import MediaAnalysis from './MediaAnalysis';
import ProjectManagement from './ProjectManagement';
import KnowledgeBasedChat from './KnowledgeBasedChat';
import QuantumAIEngine from './QuantumAIEngine';
import UltimateAIEngine from './UltimateAIEngine';
import AdvancedAIAnalysis from './AdvancedAIAnalysis';
import AnalysisResultCard from './AnalysisResultCard';
import CollaborationStatus from './CollaborationStatus';

// API 서비스 import
import { unifiedConversationAPI, executeCommand, addMessage, getMessages, uploadFile, getSystemStatus } from '../services/unifiedConversationAPI';
import { realtimeCollaboration } from '../services/realtimeCollaboration';

interface UnifiedConversationInterfaceProps {
  selectedRoomId?: string;
  sidebarCommand?: string;
  onSidebarCommandHandled?: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai' | 'system';
  content: string;
  timestamp: string;
  type?: 'text' | 'command' | 'file' | 'project' | 'analysis';
  metadata?: {
    command?: string;
    files?: File[];
    project?: any;
    analysis?: any;
  };
}

interface Command {
  name: string;
  description: string;
  usage: string;
  examples: string[];
  handler: (args: string[]) => Promise<string>;
}

interface SystemStatus {
  isFileUploading: boolean;
  isAnalyzing: boolean;
  isLearning: boolean;
  isProjectLoading: boolean;
  activeProjects: string[];
  availableCommands: Command[];
}

const UnifiedConversationInterface: React.FC<UnifiedConversationInterfaceProps> = ({
  selectedRoomId,
  sidebarCommand,
  onSidebarCommandHandled
}) => {
  // 기본 상태
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('무엇이든 물어보세요');
  const [isLoading, setIsLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    isFileUploading: false,
    isAnalyzing: false,
    isLearning: false,
    isProjectLoading: false,
    activeProjects: [],
    availableCommands: []
  });

  // 모달 상태들
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showProjectManagement, setShowProjectManagement] = useState(false);
  const [showMediaAnalysis, setShowMediaAnalysis] = useState(false);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
  const [showMessageGuidance, setShowMessageGuidance] = useState(false);

  // 파일 및 프로젝트 상태
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [fileUploadProgress, setFileUploadProgress] = useState<{ [key: string]: number }>({});
  const [dragOver, setDragOver] = useState(false);

  // 미디어 파일 업로드 상태
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [fileAnalyses, setFileAnalyses] = useState<{ [key: string]: FileAnalysis }>({});
  const [aiResponses, setAiResponses] = useState<{ [key: string]: AIResponse }>({});
  const [systemMetrics, setSystemMetrics] = useState({
    memoryUsage: 0,
    cpuUsage: 0,
    responseTime: 0,
    activeConnections: 0
  });

  // QuantumAIEngine 상태
  const [showQuantumAI, setShowQuantumAI] = useState(false);
  const [quantumAnalyses, setQuantumAnalyses] = useState<any[]>([]);
  const [quantumProgress, setQuantumProgress] = useState(0);
  const [quantumMetrics, setQuantumMetrics] = useState({
    totalQubits: 0,
    coherenceTime: 0,
    entanglementEntropy: 0,
    quantumAdvantage: 0
  });

  // UltimateAIEngine 상태
  const [showUltimateAI, setShowUltimateAI] = useState(false);
  const [ultimateAnalyses, setUltimateAnalyses] = useState<any[]>([]);
  const [ultimateProgress, setUltimateProgress] = useState(0);
  const [ultimateMetrics, setUltimateMetrics] = useState({
    totalDimensions: 0,
    evolutionLevel: 0,
    ultimateLevel: 0,
    ultimateAdvantage: 0
  });

  // AdvancedAIAnalysis 상태
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // 파일 학습 시스템 상태
  const [learningStatus, setLearningStatus] = useState<'idle' | 'learning' | 'completed' | 'error'>('idle');
  const [learningProgress, setLearningProgress] = useState(0);
  const [learningData, setLearningData] = useState<any>(null);
  const [learningMetrics, setLearningMetrics] = useState({
    totalFiles: 0,
    processedFiles: 0,
    learningAccuracy: 0,
    modelVersion: '1.0.0'
  });

  // 미디어 분석 상태
  const [mediaAnalysisStatus, setMediaAnalysisStatus] = useState<'idle' | 'analyzing' | 'completed' | 'error'>('idle');
  const [mediaAnalysisProgress, setMediaAnalysisProgress] = useState(0);
  const [mediaAnalysisResults, setMediaAnalysisResults] = useState<any>(null);
  const [mediaMetrics, setMediaMetrics] = useState({
    totalFiles: 0,
    processedFiles: 0,
    extractionAccuracy: 0,
    processingTime: 0
  });

  // 학습 완료 시 자동 메시지 추가
  useEffect(() => {
    if (learningStatus === 'completed') {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          content:
            `🧠 파일 학습이 완료되었습니다.\n` +
            `- 처리 파일: ${learningData?.fileName || '알 수 없음'}\n` +
            `- 학습 정확도: ${learningMetrics.learningAccuracy.toFixed(1)}%\n` +
            `- 처리된 파일: ${learningMetrics.processedFiles}개\n` +
            `- 모델 버전: ${learningMetrics.modelVersion}\n` +
            `- 주요 패턴: "계약", "합의", "조합"`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }
  }, [learningStatus]);

  // 미디어 분석 완료 시 자동 메시지 추가
  useEffect(() => {
    if (mediaAnalysisStatus === 'completed') {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          content:
            `📊 미디어 분석이 완료되었습니다.\n` +
            `- 분석 파일: ${mediaAnalysisResults?.fileName || '알 수 없음'}\n` +
            `- 추출 정확도: ${mediaMetrics.extractionAccuracy.toFixed(1)}%\n` +
            `- 처리 시간: ${mediaMetrics.processingTime.toFixed(1)}초\n` +
            `- 주요 키워드: "문서", "이미지", "텍스트"`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }
  }, [mediaAnalysisStatus]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 컴포넌트 마운트 시 자동 포커스 및 커서 위치 설정
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, []);

  // 사이드바 명령어 처리
  useEffect(() => {
    if (sidebarCommand) {
      handleSidebarCommand(sidebarCommand);
      if (onSidebarCommandHandled) onSidebarCommandHandled();
    }
  }, [sidebarCommand, onSidebarCommandHandled]);

  // 메시지 스크롤 자동화
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 명령어 시스템 초기화
  useEffect(() => {
    initializeCommandSystem();
  }, []);

  // 시스템 메트릭 업데이트
  useEffect(() => {
    const updateSystemMetrics = () => {
      setSystemMetrics({
        memoryUsage: Math.random() * 100,
        cpuUsage: Math.random() * 100,
        responseTime: Math.random() * 1000,
        activeConnections: Math.floor(Math.random() * 10)
      });
    };

    // 초기 업데이트
    updateSystemMetrics();

    // 5초마다 메트릭 업데이트
    const interval = setInterval(updateSystemMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  // 명령어 시스템 초기화
  const initializeCommandSystem = () => {
    const commands: Command[] = [
      {
        name: 'upload',
        description: '파일을 업로드합니다',
        usage: '/upload [파일명]',
        examples: ['/upload document.pdf', '/upload image.jpg'],
        handler: handleFileUpload
      },
      {
        name: 'analyze',
        description: '파일을 분석합니다',
        usage: '/analyze [파일명]',
        examples: ['/analyze document.pdf', '/analyze all'],
        handler: handleFileAnalysis
      },
      {
        name: 'project',
        description: '프로젝트를 관리합니다',
        usage: '/project [create|list|open] [프로젝트명]',
        examples: ['/project create 새프로젝트', '/project list', '/project open 기존프로젝트'],
        handler: handleProjectOperation
      },
      {
        name: 'ai',
        description: 'AI 기능을 사용합니다',
        usage: '/ai [analyze|write|summarize] [내용]',
        examples: ['/ai analyze 이 텍스트를 분석해줘', '/ai write 보고서 작성'],
        handler: handleAIOperation
      },
      {
        name: 'system',
        description: '시스템 상태를 확인합니다',
        usage: '/system [status|logs|optimize]',
        examples: ['/system status', '/system logs'],
        handler: handleSystemOperation
      },
      {
        name: 'help',
        description: '박사급 AI 도움말을 보여줍니다',
        usage: '/help [주제]',
        examples: ['/help', '/help 분석', '/help 연구'],
        handler: handleHelpCommand
      },
      {
        name: 'quantum',
        description: '양자 AI 엔진을 사용합니다',
        usage: '/quantum [analyze|optimize|predict] [내용]',
        examples: ['/quantum analyze 텍스트', '/quantum optimize 시스템'],
        handler: handleQuantumOperation
      },
      {
        name: 'ultimate',
        description: '궁극 AI 엔진을 사용합니다',
        usage: '/ultimate [analyze|evolve|transcend] [내용]',
        examples: ['/ultimate analyze 텍스트', '/ultimate evolve 시스템'],
        handler: handleUltimateOperation
      },
      {
        name: 'advanced',
        description: '고급 AI 분석을 수행합니다',
        usage: '/advanced [analyze|insights|trends] [내용]',
        examples: ['/advanced analyze 데이터', '/advanced insights 패턴'],
        handler: handleAdvancedOperation
      },
      {
        name: 'learn',
        description: '파일 학습 시스템을 사용합니다',
        usage: '/learn [start|status|stop] [파일명]',
        examples: ['/learn start 파일.txt', '/learn status'],
        handler: handleLearningOperation
      },
      {
        name: 'media',
        description: '미디어 파일 분석을 수행합니다',
        usage: '/media [analyze|extract|process] [파일명]',
        examples: ['/media analyze 이미지.jpg', '/media extract 문서.pdf'],
        handler: handleMediaOperation
      },
      {
        name: 'insights',
        description: '고급 인사이트를 생성합니다',
        usage: '/insights [learning|media|quantum|ultimate|personal] [내용]',
        examples: ['/insights learning 파일분석', '/insights personal 사용패턴'],
        handler: handleInsightsOperation
      }
    ];

    setSystemStatus(prev => ({
      ...prev,
      availableCommands: commands
    }));
  };

  // 명령어 파서
  const parseCommand = (input: string): { command: string; args: string[] } | null => {
    if (!input.startsWith('/')) return null;

    const parts = input.slice(1).split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    return { command, args };
  };

  // 명령어 실행
  const executeCommandHandler = async (command: string, args: string[]): Promise<string> => {
    const cmd = systemStatus.availableCommands.find(c => c.name === command);
    if (!cmd) {
      return `❌ 알 수 없는 명령어입니다: ${command}\n💡 /help를 입력하여 사용 가능한 명령어를 확인하세요.`;
    }

    try {
      // 백엔드 API 호출
      const response = await executeCommand(command, args);
      return response.response;
    } catch (error) {
      // 로컬 핸들러로 폴백
      try {
        return await cmd.handler(args);
      } catch (localError) {
        return `❌ 명령어 실행 중 오류가 발생했습니다: ${error}\n💡 사용법: ${cmd.usage}`;
      }
    }
  };

  // 고급 파일 업로드 처리
  const handleFileUpload = async (args: string[]): Promise<string> => {
    if (args.length === 0) {
      setShowFileUpload(true);
      return '📁 고급 파일 업로드 & 학습 시스템이 열렸습니다. 파일을 선택하고 학습 설정을 구성해주세요.';
    }

    // 명령어로 파일명이 지정된 경우
    const filename = args[0];
    return `📁 파일 "${filename}" 고급 업로드가 시작되었습니다. 학습 시스템과 함께 처리됩니다.`;
  };

  // 파일 처리 완료 핸들러
  const handleFileProcessed = (fileInfo: any) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'ai',
        content: `📊 파일 처리 완료!\n\n**파일:** ${fileInfo.originalName}\n**분류:** ${fileInfo.category} - ${fileInfo.subcategory}\n**신뢰도:** ${(fileInfo.learningData?.confidence || 0) * 100}%\n**키워드:** ${fileInfo.learningData?.keywords?.join(', ') || '없음'}\n**요약:** ${fileInfo.summary || '요약 없음'}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'file',
        metadata: {
          files: [fileInfo]
        }
      }
    ]);
  };

  // 미디어 파일 업로드 핸들러
  const handleMediaFilesUploaded = (files: any[]) => {
    setMediaFiles(prev => [...prev, ...files]);
    console.log('미디어 파일 업로드됨:', files);
  };

  const handleFileAnalyzed = (fileId: string, analysis: FileAnalysis) => {
    setFileAnalyses(prev => ({ ...prev, [fileId]: analysis }));
    console.log('파일 분석 완료:', fileId, analysis);
  };

  const handleAIResponseGenerated = (fileId: string, response: AIResponse) => {
    setAiResponses(prev => ({ ...prev, [fileId]: response }));
    console.log('AI 응답 생성 완료:', fileId, response);
  };

  const handleFileError = (fileId: string, error: string) => {
    console.error('파일 처리 오류:', fileId, error);
  };

  // 파일 드래그 앤 드롭 처리
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    setSystemStatus(prev => ({ ...prev, isFileUploading: true }));

    try {
      for (const file of files) {
        // 업로드 진행률 초기화
        setFileUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        // 파일 업로드 시뮬레이션
        for (let progress = 0; progress <= 100; progress += 10) {
          setFileUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 파일 정보 저장
        setUploadedFiles(prev => [...prev, file]);
      }

      const fileNames = files.map(f => f.name).join(', ');
      return `📁 ${files.length}개 파일이 성공적으로 업로드되었습니다: ${fileNames}`;
    } catch (error) {
      return `❌ 파일 업로드 중 오류가 발생했습니다: ${error}`;
    } finally {
      setSystemStatus(prev => ({ ...prev, isFileUploading: false }));
      setFileUploadProgress({});
    }
  };

  // 파일 타입별 아이콘 반환
  const getFileIcon = (file: File): string => {
    const type = file.type;
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📈';
    return '📁';
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 파일 분석 처리
  const handleFileAnalysis = async (args: string[]): Promise<string> => {
    if (uploadedFiles.length === 0) {
      return '❌ 분석할 파일이 없습니다. 먼저 파일을 업로드해주세요.';
    }

    setSystemStatus(prev => ({ ...prev, isAnalyzing: true }));

    // 분석 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000));

    setSystemStatus(prev => ({ ...prev, isAnalyzing: false }));

    return `📊 ${uploadedFiles.length}개 파일 분석이 완료되었습니다!\n\n**분석 결과:**\n${uploadedFiles.map(file => `• ${file.name}: 텍스트 추출, 키워드 분석, 감정 분석 완료`).join('\n')}`;
  };

  // 프로젝트 작업 처리
  const handleProjectOperation = async (args: string[]): Promise<string> => {
    if (args.length === 0) {
      return '❌ 프로젝트 명령어 사용법: /project [create|list|open] [프로젝트명]';
    }

    const operation = args[0];
    const projectName = args[1];

    switch (operation) {
      case 'create':
        if (!projectName) return '❌ 프로젝트명을 입력해주세요: /project create [프로젝트명]';

        // 새 프로젝트 생성
        const newProject = {
          id: Date.now().toString(),
          name: projectName,
          description: `프로젝트: ${projectName}`,
          fileCount: 0,
          createdTime: new Date().toISOString()
        };

        setProjects(prev => [...prev, newProject]);
        setCurrentProject(newProject);

        return `📁 프로젝트 "${projectName}"이 성공적으로 생성되었습니다!`;

      case 'list':
        if (projects.length === 0) {
          return '📋 현재 프로젝트가 없습니다. `/project create [프로젝트명]`으로 새 프로젝트를 생성하세요.';
        }
        return `📋 현재 프로젝트 목록:\n${projects.map(p => `• ${p.name} (${p.fileCount}개 파일)`).join('\n')}`;

      case 'open':
        if (!projectName) return '❌ 프로젝트명을 입력해주세요: /project open [프로젝트명]';
        const project = projects.find(p => p.name === projectName);
        if (!project) return `❌ 프로젝트 "${projectName}"을 찾을 수 없습니다.`;
        setCurrentProject(project);
        return `📁 프로젝트 "${projectName}"이 열렸습니다. 현재 활성 프로젝트입니다.`;

      case 'current':
        if (!currentProject) {
          return '📋 현재 활성 프로젝트가 없습니다. `/project list`로 프로젝트 목록을 확인하세요.';
        }
        return `📁 현재 활성 프로젝트: ${currentProject.name}\n📄 파일 수: ${currentProject.fileCount}개\n📅 생성일: ${new Date(currentProject.createdTime).toLocaleDateString()}`;

      default:
        return `❌ 알 수 없는 프로젝트 작업입니다: ${operation}\n💡 사용법: /project [create|list|open|current] [프로젝트명]`;
    }
  };

  // AI 작업 처리
  const handleAIOperation = async (args: string[]): Promise<string> => {
    if (args.length < 2) {
      return '❌ AI 명령어 사용법: /ai [analyze|write|summarize] [내용]';
    }

    const operation = args[0];
    const content = args.slice(1).join(' ');

    switch (operation) {
      case 'analyze':
        return `🤖 AI 분석 결과:\n\n**분석 대상:** ${content}\n**결과:** 긍정적 감정이 70%로 나타났으며, 주요 키워드는 "프로젝트", "개발", "진행"입니다.`;

      case 'write':
        return `✍️ AI 글쓰기 결과:\n\n**주제:** ${content}\n**생성된 내용:**\n\n${content}에 대한 상세한 보고서를 작성해드리겠습니다. 주요 내용은 다음과 같습니다...`;

      case 'summarize':
        return `📋 AI 요약 결과:\n\n**원문:** ${content}\n**요약:** 핵심 내용을 간결하게 정리한 요약문입니다.`;

      default:
        return `❌ 알 수 없는 AI 작업입니다: ${operation}\n💡 사용법: /ai [analyze|write|summarize] [내용]`;
    }
  };

  // 시스템 작업 처리
  const handleSystemOperation = async (args: string[]): Promise<string> => {
    if (args.length === 0) {
      return '❌ 시스템 명령어 사용법: /system [status|logs|optimize]';
    }

    const operation = args[0];

    switch (operation) {
      case 'status':
        return `🖥️ 시스템 상태:\n\n• 파일 업로드: ${systemStatus.isFileUploading ? '진행 중' : '대기 중'}\n• 분석 작업: ${systemStatus.isAnalyzing ? '진행 중' : '대기 중'}\n• 학습 작업: ${systemStatus.isLearning ? '진행 중' : '대기 중'}\n• 활성 프로젝트: ${systemStatus.activeProjects.length}개\n• 사용 가능한 명령어: ${systemStatus.availableCommands.length}개\n\n📊 시스템 메트릭:\n• 메모리 사용량: ${systemMetrics.memoryUsage.toFixed(1)}%\n• CPU 사용량: ${systemMetrics.cpuUsage.toFixed(1)}%\n• 응답 시간: ${systemMetrics.responseTime.toFixed(0)}ms\n• 활성 연결: ${systemMetrics.activeConnections}개`;

      case 'logs':
        return `📝 최근 시스템 로그:\n\n• [2024-12-19 14:30] 시스템 시작\n• [2024-12-19 14:31] 파일 업로드 완료\n• [2024-12-19 14:32] AI 분석 시작\n• [2024-12-19 14:33] 프로젝트 생성 완료`;

      case 'optimize':
        return `⚡ 시스템 최적화 완료:\n\n• 메모리 사용량: 15% 감소\n• 응답 시간: 0.2초 단축\n• 캐시 정리: 완료\n• 성능 향상: 25%`;

      default:
        return `❌ 알 수 없는 시스템 작업입니다: ${operation}\n💡 사용법: /system [status|logs|optimize]`;
    }
  };

  // QuantumAI 명령어 처리
  const handleQuantumOperation = async (args: string[]): Promise<string> => {
    if (args.length < 2) {
      return '❌ QuantumAI 명령어 사용법: /quantum [analyze|optimize|predict] [내용]';
    }

    const operation = args[0];
    const content = args.slice(1).join(' ');

    setShowQuantumAI(true);
    setQuantumProgress(0);

    // 양자 분석 시뮬레이션
    for (let i = 0; i <= 100; i += 10) {
      setQuantumProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 양자 메트릭 업데이트
    setQuantumMetrics({
      totalQubits: Math.floor(Math.random() * 100) + 50,
      coherenceTime: Math.random() * 1000,
      entanglementEntropy: Math.random() * 2,
      quantumAdvantage: Math.random() * 100
    });

    switch (operation) {
      case 'analyze':
        return `🔬 QuantumAI 분석 결과:\n\n**분석 대상:** ${content}\n**양자 상태:** 초전도 큐비트 64개 사용\n**양자 우위:** ${quantumMetrics.quantumAdvantage.toFixed(1)}%\n**결과:** 다차원 양자 분석을 통해 감정, 의도, 성격 패턴을 동시에 분석했습니다.`;

      case 'optimize':
        return `⚡ QuantumAI 최적화 결과:\n\n**최적화 대상:** ${content}\n**양자 알고리즘:** QAOA (Quantum Approximate Optimization Algorithm)\n**최적화율:** ${(Math.random() * 30 + 70).toFixed(1)}%\n**결과:** 양자 컴퓨팅을 통한 다차원 최적화가 완료되었습니다.`;

      case 'predict':
        return `🔮 QuantumAI 예측 결과:\n\n**예측 대상:** ${content}\n**양자 모델:** Quantum Neural Network\n**예측 정확도:** ${(Math.random() * 20 + 80).toFixed(1)}%\n**결과:** 양자 머신러닝을 통한 다차원 패턴 예측이 완료되었습니다.`;

      default:
        return `❌ 알 수 없는 QuantumAI 작업입니다: ${operation}\n💡 사용법: /quantum [analyze|optimize|predict] [내용]`;
    }
  };

  // UltimateAI 명령어 처리
  const handleUltimateOperation = async (args: string[]): Promise<string> => {
    if (args.length < 2) {
      return '❌ UltimateAI 명령어 사용법: /ultimate [analyze|evolve|transcend] [내용]';
    }

    const operation = args[0];
    const content = args.slice(1).join(' ');

    setShowUltimateAI(true);
    setUltimateProgress(0);

    // 궁극 AI 분석 시뮬레이션
    for (let i = 0; i <= 100; i += 10) {
      setUltimateProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 궁극 AI 메트릭 업데이트
    setUltimateMetrics({
      totalDimensions: Math.floor(Math.random() * 20) + 10,
      evolutionLevel: Math.random() * 100,
      ultimateLevel: Math.random() * 100,
      ultimateAdvantage: Math.random() * 100
    });

    switch (operation) {
      case 'analyze':
        return `🌟 UltimateAI 분석 결과:\n\n**분석 대상:** ${content}\n**궁극 상태:** ${ultimateMetrics.totalDimensions}차원 탐색\n**진화 수준:** ${ultimateMetrics.evolutionLevel.toFixed(1)}%\n**결과:** 궁극의식 수준에서 다차원 분석을 통해 모든 가능성을 동시에 탐색했습니다.`;

      case 'evolve':
        return `🚀 UltimateAI 진화 결과:\n\n**진화 대상:** ${content}\n**궁극 알고리즘:** Infinite Evolution Algorithm\n**진화율:** ${(Math.random() * 30 + 70).toFixed(1)}%\n**결과:** 궁극의식 수준에서 무한 진화가 완료되었습니다.`;

      case 'transcend':
        return `✨ UltimateAI 초월 결과:\n\n**초월 대상:** ${content}\n**궁극 모델:** Transcendental Neural Network\n**초월 정확도:** ${(Math.random() * 20 + 80).toFixed(1)}%\n**결과:** 궁극의식 수준에서 현실을 초월한 다차원 패턴 인식이 완료되었습니다.`;

      default:
        return `❌ 알 수 없는 UltimateAI 작업입니다: ${operation}\n💡 사용법: /ultimate [analyze|evolve|transcend] [내용]`;
    }
  };

  // AdvancedAIAnalysis 명령어 처리
  const handleAdvancedOperation = async (args: string[]): Promise<string> => {
    if (args.length < 2) {
      return '❌ AdvancedAI 명령어 사용법: /advanced [analyze|insights|trends] [내용]';
    }

    const operation = args[0];
    const content = args.slice(1).join(' ');

    setShowAdvancedAnalysis(true);
    setAnalysisProgress(0);

    // 고급 분석 시뮬레이션
    for (let i = 0; i <= 100; i += 10) {
      setAnalysisProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    switch (operation) {
      case 'analyze':
        return `📊 AdvancedAI 분석 결과:\n\n**분석 대상:** ${content}\n**분석 방법:** 다차원 패턴 인식\n**정확도:** ${(Math.random() * 20 + 80).toFixed(1)}%\n**결과:** 고급 머신러닝을 통한 심층 분석이 완료되었습니다.`;

      case 'insights':
        return `💡 AdvancedAI 인사이트 결과:\n\n**분석 대상:** ${content}\n**인사이트 수:** ${Math.floor(Math.random() * 10) + 5}개\n**신뢰도:** ${(Math.random() * 20 + 80).toFixed(1)}%\n**결과:** 숨겨진 패턴과 트렌드를 발견했습니다.`;

      case 'trends':
        return `📈 AdvancedAI 트렌드 결과:\n\n**분석 대상:** ${content}\n**트렌드 수:** ${Math.floor(Math.random() * 5) + 3}개\n**예측 정확도:** ${(Math.random() * 20 + 80).toFixed(1)}%\n**결과:** 미래 트렌드와 패턴을 예측했습니다.`;

      default:
        return `❌ 알 수 없는 AdvancedAI 작업입니다: ${operation}\n💡 사용법: /advanced [analyze|insights|trends] [내용]`;
    }
  };

  // 파일 학습 시스템 명령어 처리
  const handleLearningOperation = async (args: string[]): Promise<string> => {
    if (args.length === 0) {
      return '❌ 학습 명령어 사용법: /learn [start|status|stop] [파일명]';
    }

    const operation = args[0];
    const filename = args[1];

    switch (operation) {
      case 'start':
        if (!filename) {
          return '❌ 파일명을 입력해주세요: /learn start [파일명]';
        }

        setLearningStatus('learning');
        setLearningProgress(0);

        // 학습 진행률 시뮬레이션
        for (let i = 0; i <= 100; i += 5) {
          setLearningProgress(i);
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        // 학습 메트릭 업데이트
        setLearningMetrics({
          totalFiles: Math.floor(Math.random() * 10) + 5,
          processedFiles: Math.floor(Math.random() * 10) + 5,
          learningAccuracy: Math.random() * 100,
          modelVersion: '1.1.0'
        });

        setLearningStatus('completed');
        return `🧠 파일 학습 완료!\n\n**학습 파일:** ${filename}\n**처리된 파일:** ${learningMetrics.processedFiles}개\n**학습 정확도:** ${learningMetrics.learningAccuracy.toFixed(1)}%\n**모델 버전:** ${learningMetrics.modelVersion}\n**결과:** 파일 내용을 분석하여 새로운 패턴을 학습했습니다.`;

      case 'status':
        const statusText = learningStatus === 'idle' ? '대기 중' :
          learningStatus === 'learning' ? '학습 중' :
            learningStatus === 'completed' ? '완료' : '오류';

        return `📊 학습 시스템 상태:\n\n**상태:** ${statusText}\n**진행률:** ${learningProgress}%\n**총 파일:** ${learningMetrics.totalFiles}개\n**처리된 파일:** ${learningMetrics.processedFiles}개\n**학습 정확도:** ${learningMetrics.learningAccuracy.toFixed(1)}%\n**모델 버전:** ${learningMetrics.modelVersion}`;

      case 'stop':
        setLearningStatus('idle');
        setLearningProgress(0);
        return '⏹️ 학습이 중지되었습니다.';

      default:
        return `❌ 알 수 없는 학습 작업입니다: ${operation}\n💡 사용법: /learn [start|status|stop] [파일명]`;
    }
  };

  // 미디어 분석 명령어 처리
  const handleMediaOperation = async (args: string[]): Promise<string> => {
    if (args.length < 2) {
      return '❌ 미디어 분석 명령어 사용법: /media [analyze|extract|process] [파일명]';
    }

    const operation = args[0];
    const filename = args[1];

    setMediaAnalysisStatus('analyzing');
    setMediaAnalysisProgress(0);

    // 미디어 분석 진행률 시뮬레이션
    for (let i = 0; i <= 100; i += 10) {
      setMediaAnalysisProgress(i);
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    // 미디어 메트릭 업데이트
    setMediaMetrics({
      totalFiles: Math.floor(Math.random() * 5) + 1,
      processedFiles: Math.floor(Math.random() * 5) + 1,
      extractionAccuracy: Math.random() * 100,
      processingTime: Math.random() * 10 + 2
    });

    setMediaAnalysisStatus('completed');

    switch (operation) {
      case 'analyze':
        return `📊 미디어 분석 완료!\n\n**분석 파일:** ${filename}\n**분석 방법:** OCR + 이미지 인식\n**추출 정확도:** ${mediaMetrics.extractionAccuracy.toFixed(1)}%\n**처리 시간:** ${mediaMetrics.processingTime.toFixed(1)}초\n**결과:** 이미지에서 텍스트와 객체를 성공적으로 인식했습니다.`;

      case 'extract':
        return `📄 텍스트 추출 완료!\n\n**파일:** ${filename}\n**추출 방법:** 고급 OCR 엔진\n**추출 정확도:** ${mediaMetrics.extractionAccuracy.toFixed(1)}%\n**처리 시간:** ${mediaMetrics.processingTime.toFixed(1)}초\n**결과:** 문서에서 텍스트를 성공적으로 추출했습니다.`;

      case 'process':
        return `⚙️ 미디어 처리 완료!\n\n**처리 파일:** ${filename}\n**처리 방법:** 다중 포맷 지원\n**처리 정확도:** ${mediaMetrics.extractionAccuracy.toFixed(1)}%\n**처리 시간:** ${mediaMetrics.processingTime.toFixed(1)}초\n**결과:** 미디어 파일을 다양한 형태로 처리했습니다.`;

      default:
        return `❌ 알 수 없는 미디어 작업입니다: ${operation}\n💡 사용법: /media [analyze|extract|process] [파일명]`;
    }
  };

  // 도움말 명령어 처리
  const handleHelpCommand = async (args: string[]): Promise<string> => {
    if (args.length === 0) {
      return `🤖 CORBU.AI 사용 가능한 명령어:\n\n${systemStatus.availableCommands.map(cmd => `**/${cmd.name}** - ${cmd.description}\n   사용법: ${cmd.usage}`).join('\n\n')}\n\n💡 특정 명령어의 자세한 설명을 보려면: /help [명령어명]`;
    }

    const commandName = args[0];
    const command = systemStatus.availableCommands.find(c => c.name === commandName);

    if (!command) {
      return `❌ 명령어 "${commandName}"을 찾을 수 없습니다.`;
    }

    return `📖 **/${command.name}** 명령어 도움말:\n\n**설명:** ${command.description}\n**사용법:** ${command.usage}\n**예시:**\n${command.examples.map(ex => `• ${ex}`).join('\n')}`;
  };

  // 메시지 전송 처리
  const handleSendMessage = async () => {
    if (inputMessage.trim() === '' || inputMessage === '무엇이든 물어보세요') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // 명령어인지 확인
      const parsedCommand = parseCommand(inputMessage);
      let aiResponse: string;

      if (parsedCommand) {
        // 명령어 실행
        aiResponse = await executeCommandHandler(parsedCommand.command, parsedCommand.args);
      } else {
        // 일반 대화 처리
        aiResponse = await generateAIResponse(inputMessage);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'system',
        content: `❌ 오류가 발생했습니다: ${error}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInputMessage('무엇이든 물어보세요');
    }
  };

  // 미디어 파일 업로드 토글
  const handleMediaUploadToggle = () => {
    setShowMediaUpload(!showMediaUpload);
  };

  // AI 응답 생성
  const generateAIResponse = async (query: string): Promise<string> => {
    const lowerQuery = query.toLowerCase();

    // 파일 관련 질문
    if (lowerQuery.includes('파일') || lowerQuery.includes('업로드')) {
      if (uploadedFiles.length > 0) {
        return `📁 현재 ${uploadedFiles.length}개 파일이 업로드되어 있습니다:\n${uploadedFiles.map(f => `• ${f.name} (${formatFileSize(f.size)})`).join('\n')}\n\n파일을 분석하려면 \`/analyze all\` 명령어를 사용하세요.`;
      }
      return '📁 파일을 업로드하려면 `/upload` 명령어를 사용하세요. 또는 파일을 드래그하여 놓으세요.';
    }

    // 분석 관련 질문
    if (lowerQuery.includes('분석') || lowerQuery.includes('어떻게')) {
      if (uploadedFiles.length === 0) {
        return '📊 분석할 파일이 없습니다. 먼저 파일을 업로드해주세요. `/upload` 명령어를 사용하거나 파일을 드래그하세요.';
      }
      return `📊 ${uploadedFiles.length}개 파일을 분석할 수 있습니다. \`/analyze all\` 명령어를 사용하세요.`;
    }

    // 프로젝트 관련 질문
    if (lowerQuery.includes('프로젝트') || lowerQuery.includes('관리')) {
      if (currentProject) {
        return `📋 현재 활성 프로젝트: ${currentProject.name}\n\n프로젝트를 관리하려면:\n• \`/project list\` - 프로젝트 목록\n• \`/project current\` - 현재 프로젝트 정보\n• \`/project create [이름]\` - 새 프로젝트 생성`;
      }
      return '📋 프로젝트를 관리하려면 `/project` 명령어를 사용하세요:\n• `/project list` - 프로젝트 목록\n• `/project create [이름]` - 새 프로젝트 생성';
    }

    // AI 관련 질문
    if (lowerQuery.includes('ai') || lowerQuery.includes('인공지능')) {
      return '🤖 AI 기능을 사용하려면 `/ai` 명령어를 사용하세요:\n• `/ai analyze [텍스트]` - 텍스트 분석\n• `/ai write [주제]` - 글쓰기\n• `/ai summarize [텍스트]` - 요약';
    }

    // 양자 AI 관련 질문
    if (lowerQuery.includes('양자') || lowerQuery.includes('quantum')) {
      return '🔬 양자 AI 기능을 사용하려면 `/quantum` 명령어를 사용하세요:\n• `/quantum analyze [텍스트]` - 양자 분석\n• `/quantum optimize [시스템]` - 양자 최적화\n• `/quantum predict [데이터]` - 양자 예측';
    }

    // 궁극 AI 관련 질문
    if (lowerQuery.includes('궁극') || lowerQuery.includes('ultimate')) {
      return '🌟 궁극 AI 기능을 사용하려면 `/ultimate` 명령어를 사용하세요:\n• `/ultimate analyze [텍스트]` - 궁극 분석\n• `/ultimate evolve [시스템]` - 궁극 진화\n• `/ultimate transcend [데이터]` - 궁극 초월';
    }

    // 고급 AI 관련 질문
    if (lowerQuery.includes('고급') || lowerQuery.includes('advanced')) {
      return '📊 고급 AI 기능을 사용하려면 `/advanced` 명령어를 사용하세요:\n• `/advanced analyze [데이터]` - 고급 분석\n• `/advanced insights [패턴]` - 인사이트 생성\n• `/advanced trends [트렌드]` - 트렌드 예측';
    }

    // 파일 학습 관련 질문
    if (lowerQuery.includes('학습') || lowerQuery.includes('learn')) {
      return '🧠 파일 학습 기능을 사용하려면 `/learn` 명령어를 사용하세요:\n• `/learn start [파일명]` - 학습 시작\n• `/learn status` - 학습 상태 확인\n• `/learn stop` - 학습 중지';
    }

    // 미디어 분석 관련 질문
    if (lowerQuery.includes('미디어') || lowerQuery.includes('media')) {
      return '📊 미디어 분석 기능을 사용하려면 `/media` 명령어를 사용하세요:\n• `/media analyze [파일명]` - 미디어 분석\n• `/media extract [파일명]` - 텍스트 추출\n• `/media process [파일명]` - 미디어 처리';
    }

    // 인사이트 관련 질문
    if (lowerQuery.includes('인사이트') || lowerQuery.includes('insights')) {
      return '💡 고급 인사이트 기능을 사용하려면 `/insights` 명령어를 사용하세요:\n• `/insights learning [내용]` - 학습 패턴 인사이트\n• `/insights media [내용]` - 미디어 분석 인사이트\n• `/insights quantum [내용]` - 양자 분석 인사이트\n• `/insights ultimate [내용]` - 궁극 분석 인사이트\n• `/insights personal [내용]` - 개인화 추천';
    }

    // 시스템 관련 질문
    if (lowerQuery.includes('시스템') || lowerQuery.includes('상태')) {
      return '🖥️ 시스템 상태를 확인하려면 `/system status` 명령어를 사용하세요.';
    }

    // 도움말 요청
    if (lowerQuery.includes('도움') || lowerQuery.includes('help') || lowerQuery.includes('명령어')) {
      return '💡 사용 가능한 명령어를 보려면 `/help`를 입력하세요.';
    }

    // 감사 표현
    if (lowerQuery.includes('감사') || lowerQuery.includes('고마워') || lowerQuery.includes('thank')) {
      return '😊 천만에요! CORBU.AI가 도움이 되어서 기쁩니다. 더 필요한 것이 있으시면 언제든 말씀해주세요!';
    }

    // 인사
    if (lowerQuery.includes('안녕') || lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
      return '👋 안녕하세요! CORBU.AI입니다. 무엇을 도와드릴까요?\n\n💡 사용 가능한 기능:\n📁 파일 업로드 및 분석\n📋 프로젝트 관리\n🤖 AI 기능 활용\n🖥️ 시스템 모니터링';
    }

    // 기본 응답
    return `🤔 흥미로운 질문이네요! CORBU.AI가 도와드릴 수 있는 기능들이 있습니다:\n\n📁 **파일 관리**: 파일 업로드, 분석, 학습\n📋 **프로젝트 관리**: 프로젝트 생성, 수정, 관리\n🤖 **AI 기능**: 텍스트 분석, 글쓰기, 요약\n🖥️ **시스템 관리**: 상태 확인, 최적화\n\n💡 특정 기능에 대해 알고 싶으시면 "/help"를 입력하세요.`;
  };

  // 고급 인사이트 생성
  const generateAdvancedInsights = (analysisType: string, data: any): string => {
    const insights = [];

    switch (analysisType) {
      case 'learning':
        insights.push(
          `🔍 **학습 패턴 분석**:`,
          `• 가장 많이 학습된 키워드: "${data.topKeyword || '프로젝트'}"`,
          `• 학습 효율성: ${data.efficiency || '85%'} (평균 대비 +15%)`,
          `• 추천 다음 단계: "${data.nextStep || '관련 문서 추가 학습'}"`
        );
        break;

      case 'media':
        insights.push(
          `📊 **미디어 인사이트**:`,
          `• 문서 유형: ${data.documentType || '비즈니스 문서'}`,
          `• 주요 주제: "${data.mainTopic || '프로젝트 관리'}"`,
          `• 감정 분석: ${data.sentiment || '긍정적'} (${data.sentimentScore || '75%'})`,
          `• 추천 액션: "${data.recommendedAction || '관련 프로젝트 생성'}"`
        );
        break;

      case 'quantum':
        insights.push(
          `🔬 **양자 분석 인사이트**:`,
          `• 양자 우위: ${data.quantumAdvantage || '67%'} (고성능)`,
          `• 다차원 패턴: "${data.pattern || '순환적 의사결정 패턴'}"`,
          `• 예측 신뢰도: ${data.predictionConfidence || '89%'}`,
          `• 최적화 제안: "${data.optimization || '의사결정 프로세스 개선'}"`
        );
        break;

      case 'ultimate':
        insights.push(
          `🌟 **궁극 분석 인사이트**:`,
          `• 진화 수준: ${data.evolutionLevel || '92%'} (최고 수준)`,
          `• 초월 패턴: "${data.transcendence || '현실 초월적 사고 패턴'}"`,
          `• 궁극 정확도: ${data.ultimateAccuracy || '95%'}`,
          `• 미래 예측: "${data.futurePrediction || '혁신적 솔루션 개발 가능성 높음'}"`
        );
        break;

      default:
        insights.push(
          `💡 **일반 인사이트**:`,
          `• 분석 완료 시간: ${new Date().toLocaleTimeString()}`,
          `• 데이터 품질: ${data.quality || '우수'}`,
          `• 추천: "${data.recommendation || '추가 분석을 통해 더 깊은 인사이트 확보 가능'}"`
        );
    }

    return insights.join('\n');
  };

  // 사용자 맞춤 추천 생성
  const generatePersonalizedRecommendations = (userHistory: any[]): string => {
    const recommendations = [];

    // 사용 패턴 분석
    const commandUsage = userHistory.reduce((acc, msg) => {
      if (msg.content.startsWith('/')) {
        const command = msg.content.split(' ')[0];
        acc[command] = (acc[command] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // 가장 많이 사용하는 명령어 기반 추천
    const mostUsed = Object.entries(commandUsage)
      .sort(([, a], [, b]) => (b as number) - (a as number))[0];

    if (mostUsed) {
      const [command, count] = mostUsed;
      recommendations.push(
        `🎯 **개인화 추천**:`,
        `• 자주 사용하는 명령어: ${command} (${count}회)`,
        `• 추천 기능: "${getRecommendationByCommand(command)}"`,
        `• 효율성 팁: "${getEfficiencyTip(command)}"`
      );
    }

    // 프로젝트 기반 추천
    if (currentProject) {
      recommendations.push(
        `📁 **프로젝트 추천**:`,
        `• 현재 프로젝트: ${currentProject.name}`,
        `• 추천 작업: "${getProjectRecommendation(currentProject)}"`,
        `• 다음 단계: "${getNextProjectStep(currentProject)}"`
      );
    }

    return recommendations.join('\n\n');
  };

  // 명령어별 추천 함수들
  const getRecommendationByCommand = (command: string): string => {
    const recommendations: Record<string, string> = {
      '/learn': '고급 학습 알고리즘 사용으로 정확도 향상',
      '/media': '다중 미디어 동시 분석으로 효율성 증대',
      '/quantum': '양자-고급 AI 연계 분석으로 깊이 있는 인사이트',
      '/ultimate': '궁극 AI와 다른 엔진 조합으로 종합적 분석',
      '/project': '프로젝트별 분석 결과 비교 및 통합',
      '/ai': 'AI 엔진들 간의 협업 분석으로 다각적 접근'
    };
    return recommendations[command] || '추가 명령어 탐색으로 새로운 기능 발견';
  };

  const getEfficiencyTip = (command: string): string => {
    const tips: Record<string, string> = {
      '/learn': '배치 학습으로 여러 파일 동시 처리',
      '/media': '파일 형식별 최적화된 분석 엔진 선택',
      '/quantum': '큐비트 수 조정으로 성능과 정확도 균형',
      '/ultimate': '차원 수 조정으로 분석 깊이 제어',
      '/project': '프로젝트 템플릿 활용으로 빠른 설정',
      '/ai': '명령어 조합으로 복합 분석 수행'
    };
    return tips[command] || '명령어 옵션을 활용하여 세밀한 제어';
  };

  const getProjectRecommendation = (project: any): string => {
    if (project.fileCount === 0) {
      return '파일 업로드 및 초기 분석 수행';
    } else if (project.fileCount < 5) {
      return '추가 파일 업로드로 분석 범위 확대';
    } else {
      return '고급 분석 및 인사이트 생성';
    }
  };

  const getNextProjectStep = (project: any): string => {
    if (project.fileCount === 0) {
      return '파일 업로드 → 기본 분석 → 결과 검토';
    } else if (project.fileCount < 5) {
      return '추가 파일 업로드 → 심화 분석 → 인사이트 생성';
    } else {
      return '고급 분석 → 인사이트 통합 → 보고서 생성';
    }
  };

  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 입력 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    // 기본 문구가 있고 사용자가 타이핑을 시작하면 기본 문구를 지움
    if (inputMessage === '무엇이든 물어보세요' && value !== '무엇이든 물어보세요') {
      setInputMessage(value);
    } else {
      setInputMessage(value);
    }

    // 자동 높이 조절
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 480) + 'px';
  };

  // 사이드바 명령어 처리
  const handleSidebarCommand = (command: string) => {
    console.log('사이드바 명령 수신:', command);

    switch (command) {
      case '파일 업로드':
      case 'file-upload':
        setShowFileUpload(true);
        break;
      case 'project-management':
        setShowProjectManagement(true);
        break;
      case 'media-analysis':
        setShowMediaAnalysis(true);
        break;
      case 'knowledge-base':
        setShowKnowledgeBase(true);
        break;
      case 'message-guidance':
        setShowMessageGuidance(true);
        break;
      case 'quantum-ai':
        setShowQuantumAI(true);
        break;
      case 'show_projects':
        setShowProjectManagement(true);
        break;
      case 'show_project_files':
        setShowFileUpload(true);
        break;
      case 'show_guidelines':
        setShowMessageGuidance(true);
        break;
      case 'show_analysis_history':
        // 분석 기록 표시 로직
        console.log('분석 기록 표시');
        break;
      case 'show_templates':
        // 템플릿 표시 로직
        console.log('템플릿 표시');
        break;
      case 'show_export_options':
        // 내보내기 옵션 표시 로직
        console.log('내보내기 옵션 표시');
        break;
      default:
        // 기존 명령 처리 로직
        console.log('처리되지 않은 명령:', command);
        break;
    }

    onSidebarCommandHandled?.();
  };

  // 입력 폼 렌더링
  const renderInputForm = () => (
    <div className="space-y-4">
      {/* 미디어 파일 업로드 영역 */}
      {showMediaUpload && (
        <div className="mb-4">
          <AdvancedFileUploadWithLearning
            isOpen={true}
            onClose={() => setShowMediaUpload(false)}
            projectId="default"
            onFileProcessed={(fileInfo) => {
              handleMediaFilesUploaded([fileInfo]);
            }}
          />
        </div>
      )}

      {/* 채팅 입력 */}
      <UnifiedDoctorLevelInput
        onSendMessage={handleSendMessage}
        onFileUpload={(files: File[]) => {
          // 파일 업로드 처리
          setUploadedFiles(prev => [...prev, ...files]);
          setShowFileUpload(true);
        }}
        onVoiceInput={() => {
          // 음성 입력 처리
          console.log('음성 입력 기능');
        }}
        onToolClick={handleMediaUploadToggle}
        placeholder="박사급 AI와 대화하세요. 복잡한 질문, 분석 요청, 연구 논의 등 무엇이든 물어보세요."
        disabled={false}
        isLoading={isLoading}
        showFileUpload={true}
        showVoiceInput={true}
        showToolButton={true}
        showStyleButtons={true}
        autoFocus={true}
        maxLength={10000}
      />
    </div>
  );

  // 메시지 내용 렌더링 함수
  const renderMessageContent = (message: Message) => {
    // 파일 학습 결과 메시지
    if (message.content.startsWith('🧠 파일 학습이 완료되었습니다.')) {
      const accuracy = Number(message.content.match(/학습 정확도: ([0-9.]+)%/)?.[1]);
      const processed = message.content.match(/처리된 파일: ([0-9]+)/)?.[1];
      const model = message.content.match(/모델 버전: ([^\n]+)/)?.[1];
      const keywords = message.content.match(/주요 패턴: (.+)/)?.[1]?.replace(/"/g, '').split(',').map(s => s.trim());
      return (
        <AnalysisResultCard
          title="파일 학습 결과"
          accuracy={accuracy}
          keywords={keywords}
          extra={<div className="text-xs text-gray-500 mt-2">모델 버전: {model} | 처리 파일: {processed}개</div>}
        />
      );
    }
    // 미디어 분석 결과 메시지
    if (message.content.startsWith('📊 미디어 분석이 완료되었습니다.')) {
      const accuracy = Number(message.content.match(/추출 정확도: ([0-9.]+)%/)?.[1]);
      const time = message.content.match(/처리 시간: ([0-9.]+)초/)?.[1];
      const keywords = message.content.match(/주요 키워드: (.+)/)?.[1]?.replace(/"/g, '').split(',').map(s => s.trim());
      return (
        <AnalysisResultCard
          title="미디어 분석 결과"
          accuracy={accuracy}
          keywords={keywords}
          extra={<div className="text-xs text-gray-500 mt-2">처리 시간: {time}초</div>}
        />
      );
    }
    // 기본 텍스트 메시지
    return <p className="text-sm whitespace-pre-wrap">{message.content}</p>;
  };

  // 메인 페이지 렌더링
  const renderMainPage = () => {
    return (
      <div className="flex h-screen">
        {/* 사이드바 */}
        <ChatSidebar
          chatRooms={[]}
          onRoomSelect={() => { }}
          onSystemCommand={handleSidebarCommand}
          selectedRoomId={selectedRoomId || ''}
        />

        {/* 메인 콘텐츠 */}
        <div
          className="flex-1 flex flex-col bg-gray-50"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* 드래그 오버 표시 */}
          {dragOver && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <div className="text-4xl mb-4">📁</div>
                <p className="text-lg font-semibold">파일을 여기에 놓으세요</p>
                <p className="text-sm text-gray-600">업로드할 파일을 드래그하여 놓으세요</p>
              </div>
            </div>
          )}

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              // 첫 접속 시 중앙에 메시지 표시
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-gray-800 mb-4">무엇이든 물어보세요!</h1>
                  <p className="text-gray-600">CORBU.AI가 도와드리겠습니다.</p>
                  <div className="mt-6 text-sm text-gray-500">
                    <p>💡 박사급 AI와 자유롭게 대화하세요</p>
                    <p className="mt-2">복잡한 질문, 긴 글 분석, 연구 논의 등</p>
                    <p>ChatGPT 5 수준의 지능으로 답변드립니다</p>
                  </div>
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
                      : message.sender === 'system'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                  >
                    {renderMessageContent(message)}
                    <p className="text-xs opacity-70 mt-2">{message.timestamp}</p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-900 border border-gray-200 max-w-[70%] p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span className="text-sm text-gray-600">AI가 응답을 생성하고 있습니다...</span>
                  </div>
                </div>
              </div>
            )}

            {/* 업로드된 파일 목록 */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">📁 업로드된 파일</h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getFileIcon(file)}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {fileUploadProgress[file.name] !== undefined && (
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${fileUploadProgress[file.name]}%` }}
                            ></div>
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                          title="파일 제거"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 실시간 분석 상태 표시 */}
          {(learningStatus === 'learning' || mediaAnalysisStatus === 'analyzing') && (
            <div className="mx-4 mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">⚡</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-900">
                    {learningStatus === 'learning' ? '파일 학습 중' : '미디어 분석 중'}
                  </h3>
                  <div className="w-full bg-yellow-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${learningStatus === 'learning' ? learningProgress : mediaAnalysisProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-yellow-700 mt-1">
                    {learningStatus === 'learning' ? learningProgress : mediaAnalysisProgress}% 완료
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 현재 프로젝트 정보 */}
          {currentProject && (
            <div className="mx-4 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600">📁</span>
                  <div>
                    <p className="text-sm font-medium text-blue-900">{currentProject.name}</p>
                    <p className="text-xs text-blue-700">{currentProject.fileCount}개 파일</p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentProject(null)}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                  title="프로젝트 닫기"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* 입력 영역 */}
          <div className="p-4">
            {renderInputForm()}
          </div>
        </div>
      </div>
    );
  };

  // 인사이트 명령어 처리
  const handleInsightsOperation = async (args: string[]): Promise<string> => {
    if (args.length < 2) {
      return '❌ 인사이트 명령어 사용법: /insights [learning|media|quantum|ultimate|personal] [내용]';
    }

    const insightType = args[0];
    const content = args.slice(1).join(' ');

    // 인사이트 데이터 생성
    const insightData = {
      topKeyword: content.split(' ')[0] || '프로젝트',
      efficiency: Math.random() * 20 + 80,
      nextStep: '관련 문서 추가 분석',
      documentType: '비즈니스 문서',
      mainTopic: content || '프로젝트 관리',
      sentiment: '긍정적',
      sentimentScore: Math.random() * 30 + 70,
      recommendedAction: '관련 프로젝트 생성',
      quantumAdvantage: Math.random() * 30 + 70,
      pattern: '순환적 의사결정 패턴',
      predictionConfidence: Math.random() * 20 + 80,
      optimization: '의사결정 프로세스 개선',
      evolutionLevel: Math.random() * 20 + 80,
      transcendence: '현실 초월적 사고 패턴',
      ultimateAccuracy: Math.random() * 10 + 90,
      futurePrediction: '혁신적 솔루션 개발 가능성 높음',
      quality: '우수',
      recommendation: '추가 분석을 통해 더 깊은 인사이트 확보 가능'
    };

    let result = '';

    switch (insightType) {
      case 'learning':
        result = generateAdvancedInsights('learning', insightData);
        break;
      case 'media':
        result = generateAdvancedInsights('media', insightData);
        break;
      case 'quantum':
        result = generateAdvancedInsights('quantum', insightData);
        break;
      case 'ultimate':
        result = generateAdvancedInsights('ultimate', insightData);
        break;
      case 'personal':
        result = generateAdvancedInsights('default', insightData) + '\n\n' + generatePersonalizedRecommendations(messages);
        break;
      default:
        return `❌ 알 수 없는 인사이트 타입입니다: ${insightType}\n💡 사용법: /insights [learning|media|quantum|ultimate|personal] [내용]`;
    }

    return `💡 **고급 인사이트 생성 완료**\n\n${result}`;
  };

  return (
    <>
      {/* 모달들 */}
      {showFileUpload && (
        <AdvancedFileUploadWithLearning
          isOpen={showFileUpload}
          onClose={() => setShowFileUpload(false)}
          projectId={currentProject?.id}
          onFileProcessed={handleFileProcessed}
        />
      )}

      {showProjectManagement && (
        <ProjectManagement
          isOpen={showProjectManagement}
          onClose={() => setShowProjectManagement(false)}
        />
      )}

      {showMediaAnalysis && (
        <MediaAnalysis
          isOpen={showMediaAnalysis}
          onClose={() => setShowMediaAnalysis(false)}
          onAnalysisComplete={(result) => {
            console.log('미디어 분석 완료:', result);
            setShowMediaAnalysis(false);
          }}
        />
      )}

      {showKnowledgeBase && (
        <KnowledgeBasedChat
          isOpen={showKnowledgeBase}
          onClose={() => setShowKnowledgeBase(false)}
          knowledgeBase={[]}
          citations={[]}
          onResponse={(response) => {
            console.log('지식베이스 응답:', response);
          }}
        />
      )}

      {showMessageGuidance && (
        <MessageGuidanceSystem
          isOpen={showMessageGuidance}
          onClose={() => setShowMessageGuidance(false)}
        />
      )}

      {showQuantumAI && (
        <QuantumAIEngine
          messages={messages}
          onQuantumAnalysisComplete={(analyses) => {
            setQuantumAnalyses(analyses);
            setShowQuantumAI(false);
          }}
          onMultidimensionalAnalysisComplete={(analysis) => {
            console.log('다차원 분석 완료:', analysis);
          }}
          onQuantumOptimizationComplete={(optimization) => {
            console.log('양자 최적화 완료:', optimization);
          }}
        />
      )}

      {showUltimateAI && (
        <UltimateAIEngine
          messages={messages}
          onUltimateAnalysisComplete={(analyses) => {
            setUltimateAnalyses(analyses);
            setShowUltimateAI(false);
          }}
          onInfiniteEvolutionAnalysisComplete={(analysis) => {
            console.log('무한 진화 분석 완료:', analysis);
          }}
          onUltimateOptimizationComplete={(optimization) => {
            console.log('궁극 최적화 완료:', optimization);
          }}
        />
      )}

      {showAdvancedAnalysis && (
        <AdvancedAIAnalysis />
      )}

      {/* 메인 페이지 */}
      {renderMainPage()}
    </>
  );
};

export default UnifiedConversationInterface; 