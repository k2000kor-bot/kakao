import React, { useState, useRef, useEffect } from 'react';
import {
  FiImage,
  FiVideo,
  FiMusic,
  FiFileText,
  FiUpload,
  FiCheck,
  FiBookOpen,
  FiSettings,
  FiMessageSquare,
  FiPlus,
  FiMic,
  FiSend,
  FiFolder,
  FiTrash2,
  FiDownload,
  FiX
} from 'react-icons/fi';
import { advancedMediaAnalysisAPI } from '../services/advancedMediaAnalysisAPI';
import { MediaFile, WritingInsight, ConversationMessage, WritingTheory } from '../types/mediaAnalysis';



const AdvancedMediaAnalysisWithWriting: React.FC = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  const [writingContext, setWritingContext] = useState({
    tone: '친근한',
    style: '대화체',
    purpose: '정보 전달',
    audience: '일반인'
  });
  const [showWritingTheories, setShowWritingTheories] = useState(false);
  const [activeTheory, setActiveTheory] = useState<WritingTheory | null>(null);
  const [conversationMode, setConversationMode] = useState<'casual' | 'professional' | 'academic'>('casual');
  const [responseStyle, setResponseStyle] = useState<'friendly' | 'formal' | 'creative'>('friendly');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showFileManager, setShowFileManager] = useState(false);
  const [showAnalysisHistory, setShowAnalysisHistory] = useState(false);
  const [showWritingTemplates, setShowWritingTemplates] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projects, setProjects] = useState([
    { id: '1', name: '개포우성_실명방', fileCount: 20, lastUpdated: '2024-01-15' },
    { id: '2', name: '잠실우성_대화요약', fileCount: 15, lastUpdated: '2024-01-14' },
    { id: '3', name: '삼성홍보_반박자료', fileCount: 8, lastUpdated: '2024-01-13' }
  ]);
  const [analysisHistory, setAnalysisHistory] = useState([
    { id: '1', title: '도시 및 주거환경정비법 분석', date: '2024-01-15', status: 'completed' },
    { id: '2', title: '삼성 홍보 반박 자료 분석', date: '2024-01-14', status: 'completed' },
    { id: '3', title: '70대 조합원 반박글 분석', date: '2024-01-13', status: 'completed' }
  ]);
  const [writingTemplates, setWritingTemplates] = useState([
    { id: '1', name: '카드뉴스 형식', description: '소셜미디어용 카드뉴스 템플릿' },
    { id: '2', name: '공식 문서 형식', description: '업무용 공식 문서 템플릿' },
    { id: '3', name: '블로그 포스트', description: '블로그용 글쓰기 템플릿' }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 글쓰기 이론 데이터
  const writingTheories: WritingTheory[] = [
    {
      id: '1',
      name: '인용 이론 (Citation Theory)',
      description: '다른 사람의 말이나 글을 적절히 인용하여 자신의 주장을 뒷받침하는 방법',
      principles: [
        '정확한 출처 표시',
        '적절한 인용 형식 사용',
        '인용과 자신의 의견 구분',
        '맥락에 맞는 인용 선택'
      ],
      examples: [
        '"인용은 자신의 주장을 강화하는 강력한 도구입니다." (김철수, 2023)',
        '연구 결과에 따르면 "적절한 인용은 글의 신뢰성을 높인다."',
        '전문가들은 "인용은 학술적 글쓰기의 기본"이라고 강조한다.'
      ],
      application: '분석된 미디어 내용에서 핵심 문구를 인용하여 대화체로 표현'
    },
    {
      id: '2',
      name: '대화체 글쓰기 (Conversational Writing)',
      description: '자연스러운 대화처럼 읽기 쉽고 이해하기 쉬운 글쓰기 스타일',
      principles: [
        '간결하고 명확한 문장',
        '일상적인 표현 사용',
        '독자와의 연결감 형성',
        '자연스러운 흐름 유지'
      ],
      examples: [
        '이런 식으로 보시면 됩니다.',
        '말씀하신 대로 정말 중요한 부분이에요.',
        '한번 같이 살펴볼까요?'
      ],
      application: '분석 결과를 친근하고 이해하기 쉬운 대화체로 전달'
    },
    {
      id: '3',
      name: '맥락 기반 글쓰기 (Context-Based Writing)',
      description: '주어진 상황과 배경을 고려하여 적절한 내용과 톤을 선택하는 글쓰기',
      principles: [
        '상황에 맞는 어조 선택',
        '대상 독자 고려',
        '목적에 맞는 내용 구성',
        '적절한 예시와 설명'
      ],
      examples: [
        '이 상황에서는 이런 접근이 효과적일 것 같아요.',
        '고려해야 할 중요한 포인트들이 있어요.',
        '실제 사례를 통해 설명드리면...'
      ],
      application: '미디어 분석 결과를 상황에 맞게 재구성하여 전달'
    }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsAnalyzing(true);

    try {
      // 실제 API를 통한 파일 업로드 및 분석
      const uploadedFiles = await advancedMediaAnalysisAPI.uploadAndAnalyzeFiles(Array.from(files));
      setMediaFiles(prev => [...prev, ...uploadedFiles]);
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      // 에러 처리
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getFileType = (mimeType: string): 'image' | 'video' | 'audio' | 'document' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const analyzeMediaFile = async (file: File, mediaFile: MediaFile): Promise<Partial<MediaFile>> => {
    // 실제로는 서버 API를 호출하여 분석
    const mockAnalysis = {
      extractedText: `이 ${mediaFile.type} 파일에서 추출된 텍스트 내용입니다. 
      파일명: ${file.name}
      크기: ${(file.size / 1024).toFixed(2)}KB
      분석 시간: ${new Date().toLocaleString()}
      
      주요 내용:
      - 첫 번째 핵심 포인트
      - 두 번째 중요한 정보
      - 세 번째 참고사항
      
      이 내용을 바탕으로 다양한 관점에서 분석하고 활용할 수 있습니다.`,
      summary: `${mediaFile.type} 파일 분석 완료 - 주요 내용 추출 및 키워드 분석`,
      keywords: ['분석', '내용', '정보', '데이터', '결과'],
      sentiment: 'neutral',
      writingInsights: generateWritingInsights(mediaFile.type, file.name)
    };

    return mockAnalysis;
  };

  const generateWritingInsights = (fileType: string, fileName: string): WritingInsight[] => {
    const insights: WritingInsight[] = [
      {
        id: '1',
        type: 'quote',
        content: `"이 ${fileType} 파일은 중요한 정보를 담고 있습니다."`,
        source: fileName,
        confidence: 0.9,
        context: '파일 분석 결과',
        writingStyle: '대화체',
        citationFormat: `(${fileName}, ${new Date().getFullYear()})`
      },
      {
        id: '2',
        type: 'reference',
        content: '분석 결과에 따르면 이 내용은 참고할 만한 가치가 있습니다.',
        source: 'AI 분석',
        confidence: 0.8,
        context: '자동 분석',
        writingStyle: '학술적',
        citationFormat: '(AI 분석, 2024)'
      },
      {
        id: '3',
        type: 'argument',
        content: '이 정보를 바탕으로 다음과 같은 결론을 도출할 수 있습니다.',
        source: '논리적 추론',
        confidence: 0.7,
        context: '분석 기반 추론',
        writingStyle: '논리적',
        citationFormat: '(논리적 분석, 2024)'
      }
    ];

    return insights;
  };

  const generateConversationalResponse = (userMessage: string, selectedFiles: MediaFile[]): string => {
    // 선택된 파일들의 분석 결과를 활용
    const analyzedFiles = selectedFiles.filter(file => file.analysisStatus === 'completed');

    if (analyzedFiles.length === 0) {
      return "아직 분석이 완료되지 않은 파일이 있어요. 잠시만 기다려주세요! ⏳";
    }

    // 사용자 메시지 분석
    const lowerMessage = userMessage.toLowerCase();

    // 대화 모드와 응답 스타일에 따른 응답 생성
    const response = generateContextualResponse(userMessage, analyzedFiles);

    // 글쓰기 이론에 따른 응답 생성
    if (activeTheory) {
      if (activeTheory.id === '1') { // 인용 이론
        return generateCitationBasedResponse(userMessage, analyzedFiles);
      } else if (activeTheory.id === '2') { // 대화체 글쓰기
        return generateConversationalStyleResponse(userMessage, analyzedFiles);
      } else if (activeTheory.id === '3') { // 맥락 기반 글쓰기
        return generateContextBasedResponse(userMessage, analyzedFiles);
      }
    }

    // 기본 대화체 응답
    return generateDefaultConversationalResponse(userMessage, analyzedFiles);
  };

  const generateContextualResponse = (userMessage: string, files: MediaFile[]): string => {
    const responseParts = [];

    // 대화 모드에 따른 인사말
    switch (conversationMode) {
      case 'casual':
        responseParts.push("안녕하세요! 😊");
        break;
      case 'professional':
        responseParts.push("안녕하세요. 분석 결과를 바탕으로 답변드리겠습니다.");
        break;
      case 'academic':
        responseParts.push("안녕하세요. 첨부된 자료를 분석한 결과를 말씀드리겠습니다.");
        break;
    }

    // 응답 스타일에 따른 내용 구성
    switch (responseStyle) {
      case 'friendly':
        responseParts.push("말씀해주신 내용을 확인해보니 정말 흥미로운 부분들이 있어요!");
        break;
      case 'formal':
        responseParts.push("문의하신 내용에 대해 분석 결과를 바탕으로 답변드립니다.");
        break;
      case 'creative':
        responseParts.push("흥미로운 질문이네요! 분석한 내용을 바탕으로 창의적인 관점에서 답변드릴게요.");
        break;
    }

    // 파일 내용 분석
    if (files.length > 0) {
      const firstFile = files[0];
      if (firstFile.summary) {
        responseParts.push(`첨부된 파일을 분석한 결과, ${firstFile.summary}라는 내용이 확인됩니다.`);
      }
      if (firstFile.keywords && firstFile.keywords.length > 0) {
        responseParts.push(`주요 키워드로는 ${firstFile.keywords.slice(0, 3).join(', ')} 등이 있습니다.`);
      }
    }

    return responseParts.join(" ");
  };

  const generateCitationBasedResponse = (userMessage: string, files: MediaFile[]): string => {
    const responseParts = [];

    // 인사말
    if (userMessage.includes('안녕') || userMessage.includes('hello')) {
      responseParts.push("안녕하세요! 👋 분석된 내용을 바탕으로 답변드릴게요.");
    }

    // 파일 내용 인용
    if (files.length > 0) {
      const firstFile = files[0];
      if (firstFile.summary) {
        responseParts.push(`분석 결과에 따르면 "${firstFile.summary}"라고 해요.`);
      }
      if (firstFile.keywords && firstFile.keywords.length > 0) {
        responseParts.push(`주요 키워드로는 "${firstFile.keywords.slice(0, 3).join(', ')}" 등이 있어요.`);
      }
    }

    // 사용자 질문에 대한 구체적 답변
    if (userMessage.includes('무엇') || userMessage.includes('뭐')) {
      responseParts.push("말씀하신 내용을 보니 정말 궁금한 점이 많으시군요! 😊");
      if (files[0]?.extractedText) {
        responseParts.push(`첨부된 파일에서 "${files[0].extractedText.substring(0, 100)}..."라는 내용을 확인할 수 있어요.`);
      }
    }

    // 결론
    responseParts.push("이런 식으로 접근하시면 더 깊이 있는 이해가 가능할 것 같아요!");

    return responseParts.join(" ");
  };

  const generateConversationalStyleResponse = (userMessage: string, files: MediaFile[]): string => {
    const responseParts = [];

    // 친근한 인사
    responseParts.push("네, 말씀해주세요! 😊");

    // 분석 결과를 친근하게 설명
    if (files.length > 0 && files[0].summary) {
      responseParts.push(`첨부해주신 파일들을 분석해보니 ${files[0].summary}라는 내용이 있어요.`);
    }

    // 키워드를 자연스럽게 언급
    if (files.length > 0 && files[0].keywords && files[0].keywords.length > 0) {
      responseParts.push(`특히 ${files[0].keywords.slice(0, 2).join(', ')} 같은 부분들이 눈에 띄네요.`);
    }

    // 사용자와의 상호작용
    if (userMessage.includes('도움') || userMessage.includes('도와')) {
      responseParts.push("무엇을 도와드릴까요? 구체적으로 말씀해주시면 더 정확한 답변을 드릴 수 있어요!");
    }

    // 추가 정보 제공
    if (files.length > 0 && files[0].extractedText) {
      responseParts.push("더 자세한 내용이 궁금하시면 언제든지 물어보세요!");
    }

    return responseParts.join(" ");
  };

  const generateContextBasedResponse = (userMessage: string, files: MediaFile[]): string => {
    const responseParts = [];

    // 상황 파악
    if (userMessage.includes('분석') || userMessage.includes('요약')) {
      responseParts.push("분석 요청이시군요! 📊");
      if (files.length > 0 && files[0].summary) {
        responseParts.push(`주요 내용을 정리하면: ${files[0].summary}`);
      }
    } else if (userMessage.includes('중요') || userMessage.includes('핵심')) {
      responseParts.push("중요한 포인트를 찾아드릴게요! 🔍");
      if (files.length > 0 && files[0].keywords && files[0].keywords.length > 0) {
        responseParts.push(`핵심 키워드는 ${files[0].keywords.slice(0, 3).join(', ')}입니다.`);
      }
    } else if (userMessage.includes('설명') || userMessage.includes('이해')) {
      responseParts.push("이해하기 쉽게 설명드릴게요! 💡");
      if (files.length > 0 && files[0].extractedText) {
        responseParts.push(`이 내용은 ${files[0].extractedText.substring(0, 50)}...와 관련이 있어요.`);
      }
    }

    // 맥락에 맞는 조언
    responseParts.push("이런 관점에서 보시면 어떨까요?");

    return responseParts.join(" ");
  };

  const generateDefaultConversationalResponse = (userMessage: string, files: MediaFile[]): string => {
    const responseParts = [];

    // 사용자 메시지에 따른 응답
    if (userMessage.includes('안녕') || userMessage.includes('hello')) {
      responseParts.push("안녕하세요! 무엇을 도와드릴까요? 😊");
    } else if (userMessage.includes('분석') || userMessage.includes('분석해')) {
      responseParts.push("네, 분석해드릴게요! 📋");
      if (files.length > 0 && files[0].summary) {
        responseParts.push(`분석 결과: ${files[0].summary}`);
      }
    } else if (userMessage.includes('요약') || userMessage.includes('정리') || userMessage.includes('핵심')) {
      responseParts.push("핵심을 정리해드릴게요! ✨");
      if (files.length > 0 && files[0].keywords && files[0].keywords.length > 0) {
        responseParts.push(`주요 포인트: ${files[0].keywords.slice(0, 3).join(', ')}`);
      }
    } else if (userMessage.includes('무엇') || userMessage.includes('뭐') || userMessage.includes('어떤')) {
      responseParts.push("말씀하신 내용을 확인해보니... 🤔");
      if (files.length > 0 && files[0].extractedText) {
        responseParts.push(`첨부된 파일에서 ${files[0].extractedText.substring(0, 30)}...라는 내용이 있어요.`);
      }
    } else {
      responseParts.push("네, 말씀해주세요! 어떤 도움이 필요하신가요? 💬");
      if (files.length > 0 && files[0].summary) {
        responseParts.push(`현재 분석된 내용: ${files[0].summary}`);
      }
    }

    return responseParts.join(" ");
  };

  const generateDetailedExplanationResponse = (userMessage: string, files: MediaFile[]): string => {
    const responseParts = [];

    // 인사말
    responseParts.push("안녕하세요! 📚 분석된 내용을 바탕으로 자세히 설명드릴게요.");

    // 파일 분석 결과 요약
    if (files.length > 0 && files[0].summary) {
      responseParts.push(`\n📋 **주요 내용 요약:**`);
      responseParts.push(`${files[0].summary}`);
    }

    // 키워드 분석
    if (files.length > 0 && files[0].keywords && files[0].keywords.length > 0) {
      responseParts.push(`\n🔑 **핵심 키워드:**`);
      responseParts.push(`• ${files[0].keywords.slice(0, 5).join(', ')}`);
    }

    // 구체적인 내용 분석
    if (files.length > 0 && files[0].extractedText) {
      responseParts.push(`\n📖 **상세 내용:**`);
      // 첫 200자 정도를 추출하여 설명
      const contentPreview = files[0].extractedText.length > 200
        ? files[0].extractedText.substring(0, 200) + "..."
        : files[0].extractedText;
      responseParts.push(`${contentPreview}`);
    }

    // 사용자 질문에 대한 구체적 답변
    if (userMessage.includes('무엇') || userMessage.includes('뭐')) {
      responseParts.push(`\n❓ **질문에 대한 답변:**`);
      responseParts.push("말씀하신 내용을 분석한 결과, 다음과 같은 정보를 확인할 수 있습니다:");

      if (files.length > 0 && files[0].summary) {
        responseParts.push(`• ${files[0].summary}`);
      }
      if (files.length > 0 && files[0].keywords && files[0].keywords.length > 0) {
        responseParts.push(`• 주요 키워드: ${files[0].keywords.slice(0, 3).join(', ')}`);
      }
    }

    // 실용적인 조언
    responseParts.push(`\n💡 **활용 방안:**`);
    responseParts.push("이 정보를 다음과 같이 활용하실 수 있습니다:");
    responseParts.push("• 문서 작성 시 참고 자료로 활용");
    responseParts.push("• 프레젠테이션 준비 시 핵심 포인트로 활용");
    responseParts.push("• 추가 연구나 분석의 기초 자료로 활용");

    // 추가 질문 유도
    responseParts.push(`\n🤔 **더 궁금한 점이 있으시면 언제든지 물어보세요!**`);

    return responseParts.join("\n");
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString(),
      mediaFiles: selectedFiles,
      writingContext
    };

    setConversation(prev => [...prev, userMessage]);

    // AI 응답 생성
    const aiResponse = generateConversationalResponse(inputMessage, selectedFiles);

    const aiMessage: ConversationMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      content: aiResponse,
      timestamp: new Date().toLocaleTimeString(),
      writingContext
    };

    setTimeout(() => {
      setConversation(prev => [...prev, aiMessage]);
    }, 1000);

    setInputMessage('');
    setSelectedFiles([]);
  };

  const handleFileSelect = (file: MediaFile) => {
    setSelectedFiles(prev =>
      prev.find(f => f.id === file.id)
        ? prev.filter(f => f.id !== file.id)
        : [...prev, file]
    );
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <div className="w-5 h-5 bg-blue-500 rounded"></div>;
      case 'video': return <div className="w-5 h-5 bg-red-500 rounded"></div>;
      case 'audio': return <div className="w-5 h-5 bg-green-500 rounded"></div>;
      default: return <div className="w-5 h-5 bg-gray-500 rounded"></div>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
    // 프로젝트 변경 시 관련 파일들 로드
    console.log(`프로젝트 선택: ${projectId}`);
  };

  const handleNewProject = () => {
    const newProject = {
      id: Date.now().toString(),
      name: `새 프로젝트 ${projects.length + 1}`,
      fileCount: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setProjects([...projects, newProject]);
    setSelectedProject(newProject.id);
  };

  const handleAnalysisHistoryClick = (analysisId: string) => {
    const analysis = analysisHistory.find(a => a.id === analysisId);
    if (analysis) {
      // 분석 결과를 대화에 로드
      const message = `이전 분석 결과를 불러왔습니다: ${analysis.title}`;
      setConversation([...conversation, {
        id: Date.now().toString(),
        sender: 'ai',
        content: message,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = writingTemplates.find(t => t.id === templateId);
    if (template) {
      // 템플릿 적용
      setConversation([...conversation, {
        id: Date.now().toString(),
        sender: 'ai',
        content: `${template.name} 템플릿이 적용되었습니다. 이제 이 형식에 맞춰 글을 작성해드릴게요!`,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const handleExportData = (format: 'json' | 'pdf' | 'txt') => {
    const data = {
      conversation,
      mediaFiles,
      analysisHistory,
      timestamp: new Date().toISOString()
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation_${Date.now()}.json`;
      a.click();
    } else if (format === 'txt') {
      const textContent = conversation.map(msg => `${msg.sender}: ${msg.content}`).join('\n\n');
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation_${Date.now()}.txt`;
      a.click();
    }

    setConversation([...conversation, {
      id: Date.now().toString(),
      sender: 'ai',
      content: `${format.toUpperCase()} 형식으로 데이터를 내보냈습니다!`,
      timestamp: new Date().toISOString()
    }]);
  };

  const handleFileManagerAction = (action: 'upload' | 'delete' | 'organize') => {
    switch (action) {
      case 'upload':
        fileInputRef.current?.click();
        break;
      case 'delete':
        setMediaFiles([]);
        setConversation([...conversation, {
          id: Date.now().toString(),
          sender: 'ai',
          content: '모든 파일이 삭제되었습니다.',
          timestamp: new Date().toISOString()
        }]);
        break;
      case 'organize':
        setConversation([...conversation, {
          id: Date.now().toString(),
          sender: 'ai',
          content: '파일들이 카테고리별로 정리되었습니다.',
          timestamp: new Date().toISOString()
        }]);
        break;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 왼쪽 사이드바 */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* 헤더 */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">미디어 분석 도구</h2>
        </div>

        {/* 파일 관리 섹션 */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">파일 관리</h3>
          <div className="space-y-2">
            <button
              onClick={() => handleFileManagerAction('upload')}
              className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
            >
              <div className="w-4 h-4 bg-white rounded mr-2"></div>
              파일 업로드
            </button>
            <button
              onClick={() => handleFileManagerAction('organize')}
              className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center"
            >
              <div className="w-4 h-4 bg-gray-500 rounded mr-2"></div>
              파일 정리
            </button>
            <button
              onClick={() => handleFileManagerAction('delete')}
              className="w-full px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center justify-center"
            >
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              파일 삭제
            </button>
          </div>
        </div>

        {/* 프로젝트 섹션 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">프로젝트</h3>
            <button
              onClick={handleNewProject}
              className="text-blue-500 hover:text-blue-700"
            >
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
            </button>
          </div>
          <div className="space-y-2">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleProjectSelect(project.id)}
                className={`p-2 rounded cursor-pointer ${selectedProject === project.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
                  }`}
              >
                <div className="font-medium text-sm">{project.name}</div>
                <div className="text-xs text-gray-500">
                  {project.fileCount} 파일 • {project.lastUpdated}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 분석 기록 섹션 */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">분석 기록</h3>
          <div className="space-y-2">
            {analysisHistory.map((analysis) => (
              <div
                key={analysis.id}
                onClick={() => handleAnalysisHistoryClick(analysis.id)}
                className="p-2 rounded cursor-pointer hover:bg-gray-100"
              >
                <div className="font-medium text-sm">{analysis.title}</div>
                <div className="text-xs text-gray-500">{analysis.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 글쓰기 템플릿 섹션 */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">글쓰기 템플릿</h3>
          <div className="space-y-2">
            {writingTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className="p-2 rounded cursor-pointer hover:bg-gray-100"
              >
                <div className="font-medium text-sm">{template.name}</div>
                <div className="text-xs text-gray-500">{template.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 내보내기 섹션 */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">내보내기</h3>
          <div className="space-y-2">
            <button
              onClick={() => handleExportData('json')}
              className="w-full px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center justify-center"
            >
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              JSON 내보내기
            </button>
            <button
              onClick={() => handleExportData('txt')}
              className="w-full px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center justify-center"
            >
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              텍스트 내보내기
            </button>
          </div>
        </div>
      </div>

      {/* 메인 대화 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">미디어 기반 대화체 글쓰기</h1>
              <p className="text-sm text-gray-600">
                {selectedFiles.length > 0
                  ? `${selectedFiles.length}개 파일 선택됨`
                  : '파일을 선택하여 대화를 시작하세요'
                }
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {activeTheory && (
                <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {activeTheory.name}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 대화 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversation.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded mx-auto"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">대화를 시작해보세요</h3>
              <p className="text-gray-600">
                파일을 업로드하고 분석을 시작하거나, 직접 질문해보세요.
              </p>
            </div>
          ) : (
            conversation.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl p-4 rounded-lg ${message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs opacity-75 mt-2">
                    {message.timestamp}
                  </div>

                  {message.mediaFiles && message.mediaFiles.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs opacity-75 mb-2">첨부된 파일:</div>
                      <div className="flex flex-wrap gap-2">
                        {message.mediaFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center space-x-2 px-2 py-1 bg-gray-100 rounded text-xs"
                          >
                            {getFileIcon(file.type)}
                            <span>{file.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-lg border border-gray-300 p-4">
              <div className="flex items-start space-x-3">
                {/* 왼쪽 도구들 */}
                <div className="flex items-center space-x-2">
                  <button
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800"
                    title="파일 첨부"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-4 h-4 bg-gray-500 rounded"></div>
                  </button>
                  <button
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                    title="글쓰기 도구"
                  >
                    <div className="w-4 h-4 bg-black rounded-sm"></div>
                    <span className="text-sm">도구</span>
                  </button>
                </div>

                {/* 메인 입력 필드 */}
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="무엇이든 물어보세요"
                    className="w-full bg-transparent border-none outline-none resize-none text-gray-900 placeholder-gray-500"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>

                {/* 오른쪽 컨트롤 */}
                <div className="flex items-center space-x-2">
                  <button
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800"
                    title="음성 입력"
                  >
                    <div className="w-4 h-4 bg-gray-500 rounded"></div>
                  </button>
                  <button
                    className="w-8 h-8 bg-black rounded-full flex items-center justify-center"
                    title="음파"
                  >
                    <div className="flex space-x-0.5">
                      <div className="w-0.5 h-2 bg-gray-400 rounded-sm"></div>
                      <div className="w-0.5 h-4 bg-gray-400 rounded-sm"></div>
                      <div className="w-0.5 h-5 bg-gray-400 rounded-sm"></div>
                      <div className="w-0.5 h-4 bg-gray-400 rounded-sm"></div>
                      <div className="w-0.5 h-2 bg-gray-400 rounded-sm"></div>
                    </div>
                  </button>
                  <button
                    className="w-8 h-8 bg-black rounded-full flex items-center justify-center"
                    title="메시지 전송"
                    onClick={handleSendMessage}
                  >
                    <div className="w-4 h-4 bg-white rounded"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default AdvancedMediaAnalysisWithWriting; 