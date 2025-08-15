import React, { useState, useEffect, useRef } from 'react';
import {
  FolderIcon,
  DocumentIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  TableCellsIcon,
  PresentationChartBarIcon,
  CodeBracketIcon,
  CloudIcon,
  DocumentPlusIcon,
  EyeIcon,
  XMarkIcon,
  AcademicCapIcon,
  CircleStackIcon,
  CpuChipIcon,
  LightBulbIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadTime: Date;
  status: 'uploading' | 'uploaded' | 'analyzing' | 'completed' | 'error';
  progress: number;
  category: 'document' | 'image' | 'video' | 'audio' | 'data' | 'code' | 'presentation' | 'other';
  aiAnalysis?: AIAnalysisResult;
  knowledgeBase?: KnowledgeBaseResult;
  deepLearning?: DeepLearningResult;
  autoClassified: boolean;
}

interface AIAnalysisResult {
  keyConcepts: string[];
  patterns: string[];
  insights: string[];
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  complexity: 'low' | 'medium' | 'high';
  topics: string[];
  entities: string[];
  projectRelevance: number; // 0-1
  completedAt: Date;
}

interface KnowledgeBaseResult {
  knowledgeGraph: {
    nodes: KnowledgeNode[];
    edges: KnowledgeEdge[];
  };
  documents: KnowledgeDocument[];
  tags: string[];
  projectConnections: string[];
  completedAt: Date;
}

interface KnowledgeNode {
  id: string;
  label: string;
  type: 'concept' | 'entity' | 'topic' | 'file' | 'project';
  weight: number;
  projectRelated: boolean;
}

interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  weight: number;
}

interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  type: string;
  tags: string[];
  projectRelevance: number;
}

interface DeepLearningResult {
  models: DeepLearningModel[];
  predictions: any[];
  accuracy: number;
  projectSpecificInsights: string[];
  completedAt: Date;
}

interface DeepLearningModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'nlp' | 'vision';
  accuracy: number;
  status: 'training' | 'ready' | 'deployed';
  projectOptimized: boolean;
}

interface ProjectStats {
  totalFiles: number;
  totalSize: number;
  lastSync: Date;
  categories: {
    document: number;
    image: number;
    video: number;
    audio: number;
    data: number;
    code: number;
    presentation: number;
    other: number;
  };
  aiProgress: {
    analyzed: number;
    inProgress: number;
    pending: number;
  };
}

const ProjectFolderSystem: React.FC = () => {
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [projectStats, setProjectStats] = useState<ProjectStats>({
    totalFiles: 0,
    totalSize: 0,
    lastSync: new Date(),
    categories: {
      document: 0,
      image: 0,
      video: 0,
      audio: 0,
      data: 0,
      code: 0,
      presentation: 0,
      other: 0
    },
    aiProgress: {
      analyzed: 0,
      inProgress: 0,
      pending: 0
    }
  });
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [showFileDetails, setShowFileDetails] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [autoProcessingStatus, setAutoProcessingStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 프로젝트 관련 키워드
  const projectKeywords = [
    '개포우성', '개포', '우성', '7차', '재건축', '재개발', '아파트', '주택',
    '건설', '개발', '사업', '계획', '제안', '안내', '공고', '공지',
    '계약', '분양', '입주', '시공', '감리', '설계', '인허가', '행정처분'
  ];

  // 파일 자동 분류 함수
  const autoClassifyFile = (fileName: string, fileType: string): 'document' | 'image' | 'video' | 'audio' | 'data' | 'code' | 'presentation' | 'other' => {
    const lowerFileName = fileName.toLowerCase();
    
    // 문서 파일
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(fileType)) {
      return 'document';
    }
    
    // 이미지 파일
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(fileType)) {
      return 'image';
    }
    
    // 비디오 파일
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(fileType)) {
      return 'video';
    }
    
    // 오디오 파일
    if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(fileType)) {
      return 'audio';
    }
    
    // 데이터 파일
    if (['xlsx', 'xls', 'csv', 'json', 'xml', 'sql'].includes(fileType)) {
      return 'data';
    }
    
    // 코드 파일
    if (['js', 'ts', 'py', 'java', 'cpp', 'c', 'html', 'css', 'php'].includes(fileType)) {
      return 'code';
    }
    
    // 프레젠테이션 파일
    if (['pptx', 'ppt', 'key'].includes(fileType)) {
      return 'presentation';
    }
    
    return 'other';
  };

  // 프로젝트 관련성 분석
  const analyzeProjectRelevance = (fileName: string, content?: string): number => {
    const lowerFileName = fileName.toLowerCase();
    let relevance = 0;
    
    // 파일명에서 프로젝트 키워드 검색
    projectKeywords.forEach(keyword => {
      if (lowerFileName.includes(keyword.toLowerCase())) {
        relevance += 0.3;
      }
    });
    
    // 내용에서 프로젝트 키워드 검색 (내용이 있는 경우)
    if (content) {
      const lowerContent = content.toLowerCase();
      projectKeywords.forEach(keyword => {
        if (lowerContent.includes(keyword.toLowerCase())) {
          relevance += 0.1;
        }
      });
    }
    
    return Math.min(relevance, 1);
  };

  const handleFileUpload = (uploadedFiles: FileList) => {
    const newFiles: ProjectFile[] = Array.from(uploadedFiles).map(file => {
      const fileType = file.name.split('.').pop()?.toLowerCase() || 'unknown';
      const category = autoClassifyFile(file.name, fileType);
      
      return {
        id: `file-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: fileType,
        size: file.size,
        uploadTime: new Date(),
        status: 'uploading',
        progress: 0,
        category,
        autoClassified: true
      };
    });

    setProjectFiles(prev => [...prev, ...newFiles]);
    updateProjectStats([...projectFiles, ...newFiles]);

    // 자동 처리 시작 알림
    setAutoProcessingStatus('파일 업로드 완료. 자동 AI 분석을 시작합니다...');

    // 파일 업로드 시뮬레이션
    newFiles.forEach((file, index) => {
      setTimeout(() => {
        simulateFileUpload(file.id);
      }, index * 1000);
    });
  };

  const simulateFileUpload = (fileId: string) => {
    const uploadInterval = setInterval(() => {
      setProjectFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          const newProgress = Math.min(file.progress + 20, 100);
          const newStatus = newProgress >= 100 ? 'uploaded' : 'uploading';

          if (newStatus === 'uploaded') {
            clearInterval(uploadInterval);
            setAutoProcessingStatus('업로드 완료. AI 분석을 시작합니다...');
            setTimeout(() => {
              startAIAnalysis(fileId);
            }, 500);
          }

          return { ...file, progress: newProgress, status: newStatus };
        }
        return file;
      }));
    }, 200);
  };

  const startAIAnalysis = (fileId: string) => {
    setProjectFiles(prev => prev.map(file =>
      file.id === fileId ? { ...file, status: 'analyzing', progress: 0 } : file
    ));

    setAutoProcessingStatus('AI 분석 중: 파일 내용 분석 및 프로젝트 관련성 평가...');

    const analysisSteps = [
      '파일 내용 분석',
      '프로젝트 관련성 평가',
      '주요 개념 추출',
      '패턴 인식',
      '인사이트 생성',
      '요약 생성',
      '감정 분석',
      '복잡도 평가',
      '주제 분류',
      '개체 인식',
      '분석 완료'
    ];

    let currentStep = 0;
    const analysisInterval = setInterval(() => {
      currentStep++;
      const progress = (currentStep / analysisSteps.length) * 100;

      setProjectFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          if (progress >= 100) {
            clearInterval(analysisInterval);
            setAutoProcessingStatus('AI 분석 완료. 지식 베이스 구축을 시작합니다...');
            setTimeout(() => {
              startKnowledgeBaseBuilding(fileId);
            }, 500);
            setTimeout(() => {
              startDeepLearningAnalysis(fileId);
            }, 1000);

            return {
              ...file,
              status: 'completed',
              progress: 100,
              aiAnalysis: generateProjectAIAnalysisResults(file.name, file.type)
            };
          }
          return { ...file, progress };
        }
        return file;
      }));
    }, 800);
  };

  const startKnowledgeBaseBuilding = (fileId: string) => {
    setAutoProcessingStatus('지식 베이스 구축 중: 프로젝트 지식 그래프 생성...');

    const kbSteps = [
      '문서 처리',
      '프로젝트 관련 개념 추출',
      '관계 분석',
      '지식 그래프 구축',
      '문서 인덱싱',
      '태그 생성',
      '메타데이터 추출',
      '지식 베이스 완성'
    ];

    let currentStep = 0;
    const kbInterval = setInterval(() => {
      currentStep++;
      const progress = (currentStep / kbSteps.length) * 100;

      setProjectFiles(prev => prev.map(file => {
        if (file.id === fileId && progress >= 100) {
          clearInterval(kbInterval);
          setAutoProcessingStatus('지식 베이스 구축 완료. 딥러닝 분석을 시작합니다...');
          return {
            ...file,
            knowledgeBase: generateProjectKnowledgeBaseResults(file.name, file.type)
          };
        }
        return file;
      }));
    }, 1000);
  };

  const startDeepLearningAnalysis = (fileId: string) => {
    setAutoProcessingStatus('딥러닝 분석 중: 프로젝트 특화 모델 훈련...');

    const dlSteps = [
      '데이터 전처리',
      '프로젝트 특화 모델 선택',
      '모델 훈련',
      '성능 평가',
      '모델 최적화',
      '예측 생성',
      '결과 분석',
      '딥러닝 완료'
    ];

    let currentStep = 0;
    const dlInterval = setInterval(() => {
      currentStep++;
      const progress = (currentStep / dlSteps.length) * 100;

      setProjectFiles(prev => prev.map(file => {
        if (file.id === fileId && progress >= 100) {
          clearInterval(dlInterval);
          setAutoProcessingStatus('모든 자동 분석이 완료되었습니다!');
          setTimeout(() => {
            setAutoProcessingStatus('');
          }, 3000);
          return {
            ...file,
            deepLearning: generateProjectDeepLearningResults(file.name, file.type)
          };
        }
        return file;
      }));
    }, 1200);
  };

  const generateProjectAIAnalysisResults = (fileName: string, fileType: string): AIAnalysisResult => {
    const projectRelevance = analyzeProjectRelevance(fileName);
    
    const projectConcepts = [
      '재건축 사업', '개포우성7차', '주택개발', '건설사업', '분양계획',
      '입주자 모집', '시공사 선정', '감리업체', '설계업체', '인허가'
    ];
    
    const projectPatterns = [
      '사업계획 수립', '투자분석', '타당성검토', '환경영향평가',
      '주민설명회', '공고사항', '계약체결', '시공관리'
    ];
    
    const projectInsights = [
      '개포우성7차 재건축 사업과 직접적으로 관련된 문서',
      '사업 진행 단계에 따른 체계적인 관리가 필요',
      '주민 이해관계자들과의 소통이 중요한 요소'
    ];

    return {
      keyConcepts: projectConcepts.slice(0, 4),
      patterns: projectPatterns.slice(0, 3),
      insights: projectInsights.slice(0, 2),
      summary: `${fileName} 파일은 개포우성7차 재건축 사업과 관련된 중요한 문서로, 사업 진행에 필요한 핵심 정보를 담고 있습니다.`,
      sentiment: 'positive',
      complexity: 'medium',
      topics: ['Real Estate Development', 'Construction Project', 'Urban Planning'],
      entities: ['개포우성7차', '재건축', '개발사업', '건설업체'],
      projectRelevance,
      completedAt: new Date()
    };
  };

  const generateProjectKnowledgeBaseResults = (fileName: string, fileType: string): KnowledgeBaseResult => {
    return {
      knowledgeGraph: {
        nodes: [
          { id: '1', label: '개포우성7차', type: 'project', weight: 1.0, projectRelated: true },
          { id: '2', label: '재건축', type: 'concept', weight: 0.9, projectRelated: true },
          { id: '3', label: '주택개발', type: 'concept', weight: 0.8, projectRelated: true },
          { id: '4', label: '건설사업', type: 'concept', weight: 0.7, projectRelated: true }
        ],
        edges: [
          { id: '1', source: '1', target: '2', relationship: 'is_a', weight: 0.9 },
          { id: '2', source: '2', target: '3', relationship: 'includes', weight: 0.8 },
          { id: '3', source: '3', target: '4', relationship: 'requires', weight: 0.7 }
        ]
      },
      documents: [
        {
          id: 'doc-1',
          title: `${fileName} 프로젝트 분석 문서`,
          content: `${fileName} 파일에 대한 개포우성7차 프로젝트 특화 분석 결과`,
          type: 'project_analysis',
          tags: ['개포우성7차', '재건축', '프로젝트', fileType],
          projectRelevance: 0.9
        }
      ],
      tags: ['개포우성7차', '재건축', '프로젝트', fileType],
      projectConnections: ['개포우성7차', '재건축사업', '주택개발'],
      completedAt: new Date()
    };
  };

  const generateProjectDeepLearningResults = (fileName: string, fileType: string): DeepLearningResult => {
    return {
      models: [
        {
          id: 'model-1',
          name: '프로젝트 문서 분류 모델',
          type: 'nlp',
          accuracy: 0.95,
          status: 'deployed',
          projectOptimized: true
        },
        {
          id: 'model-2',
          name: '재건축 사업 예측 모델',
          type: 'regression',
          accuracy: 0.88,
          status: 'ready',
          projectOptimized: true
        }
      ],
      predictions: [
        { type: 'classification', result: '재건축 프로젝트 문서', confidence: 0.95 },
        { type: 'regression', result: '사업 진행률: 65%', confidence: 0.88 }
      ],
      accuracy: 0.92,
      projectSpecificInsights: [
        '개포우성7차 프로젝트와 높은 관련성을 보임',
        '사업 진행 단계에 따른 관리가 필요',
        '주민 참여도가 높은 문서로 분류됨'
      ],
      completedAt: new Date()
    };
  };

  const updateProjectStats = (fileList: ProjectFile[]) => {
    const totalSize = fileList.reduce((sum, file) => sum + file.size, 0);
    const categories = {
      document: fileList.filter(f => f.category === 'document').length,
      image: fileList.filter(f => f.category === 'image').length,
      video: fileList.filter(f => f.category === 'video').length,
      audio: fileList.filter(f => f.category === 'audio').length,
      data: fileList.filter(f => f.category === 'data').length,
      code: fileList.filter(f => f.category === 'code').length,
      presentation: fileList.filter(f => f.category === 'presentation').length,
      other: fileList.filter(f => f.category === 'other').length
    };
    const aiProgress = {
      analyzed: fileList.filter(f => f.status === 'completed').length,
      inProgress: fileList.filter(f => f.status === 'analyzing').length,
      pending: fileList.filter(f => f.status === 'uploading' || f.status === 'uploaded').length
    };

    setProjectStats({
      totalFiles: fileList.length,
      totalSize,
      lastSync: new Date(),
      categories,
      aiProgress
    });
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <DocumentIcon className="w-6 h-6 text-red-500" />;
      case 'docx':
      case 'doc':
        return <DocumentTextIcon className="w-6 h-6 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <PhotoIcon className="w-6 h-6 text-green-500" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <VideoCameraIcon className="w-6 h-6 text-purple-500" />;
      case 'mp3':
      case 'wav':
        return <MusicalNoteIcon className="w-6 h-6 text-yellow-500" />;
      case 'xlsx':
      case 'csv':
        return <TableCellsIcon className="w-6 h-6 text-green-600" />;
      case 'pptx':
      case 'ppt':
        return <PresentationChartBarIcon className="w-6 h-6 text-orange-500" />;
      case 'js':
      case 'ts':
      case 'py':
      case 'java':
        return <CodeBracketIcon className="w-6 h-6 text-gray-600" />;
      default:
        return <DocumentIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading':
        return 'text-blue-600 bg-blue-100';
      case 'uploaded':
        return 'text-yellow-600 bg-yellow-100';
      case 'analyzing':
        return 'text-purple-600 bg-purple-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploading':
        return '업로드 중';
      case 'uploaded':
        return '업로드 완료';
      case 'analyzing':
        return 'AI 분석 중';
      case 'completed':
        return '분석 완료';
      case 'error':
        return '오류';
      default:
        return '대기';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'document':
        return '문서';
      case 'image':
        return '이미지';
      case 'video':
        return '비디오';
      case 'audio':
        return '오디오';
      case 'data':
        return '데이터';
      case 'code':
        return '코드';
      case 'presentation':
        return '프레젠테이션';
      default:
        return '기타';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 프로젝트 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-8">
        <div className="flex items-center space-x-4 mb-4">
          <BuildingOfficeIcon className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">개포우성7차 프로젝트</h1>
            <p className="text-blue-100">재건축 사업 전용 파일 관리 시스템</p>
          </div>
        </div>
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <MapPinIcon className="w-4 h-4" />
            <span>서울특별시 강남구 개포동</span>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4" />
            <span>2025년 진행중</span>
          </div>
          <div className="flex items-center space-x-2">
            <UserGroupIcon className="w-4 h-4" />
            <span>주민 1,200세대</span>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="px-6 py-8">
        {/* 프로젝트 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">총 파일 수</p>
                <p className="text-2xl font-bold text-gray-900">{projectStats.totalFiles}개</p>
              </div>
              <FolderIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">총 크기</p>
                <p className="text-2xl font-bold text-gray-900">{formatFileSize(projectStats.totalSize)}</p>
              </div>
              <CloudIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">AI 분석 완료</p>
                <p className="text-2xl font-bold text-gray-900">{projectStats.aiProgress.analyzed}개</p>
              </div>
              <AcademicCapIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">분석 진행중</p>
                <p className="text-2xl font-bold text-gray-900">{projectStats.aiProgress.inProgress}개</p>
              </div>
              <CogIcon className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* 자동 처리 상태 알림 */}
        {autoProcessingStatus && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <CogIcon className="w-5 h-5 text-blue-600 mr-2 animate-spin" />
              <span className="text-blue-800">{autoProcessingStatus}</span>
            </div>
          </div>
        )}

        {/* 파일 업로드 영역 */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center mb-8 transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <ArrowUpTrayIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            개포우성7차 프로젝트 파일 업로드
          </h3>
          <p className="text-lg text-gray-600 mb-4">
            파일을 여기에 드래그하거나 클릭하여 업로드하세요
          </p>
          <p className="text-sm text-gray-500 mb-4">
            지원 형식: 문서, 이미지, 비디오, 오디오, 데이터, 코드, 프레젠테이션
          </p>
          <p className="text-sm text-blue-600 mb-4 font-medium">
            ⚡ 자동 기능: 파일 분류 → AI 분석 → 지식베이스 구축 → 딥러닝 분석
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            title="파일 선택"
            aria-label="프로젝트 파일 업로드를 위한 파일 선택"
          />
        </div>

        {/* 파일 목록 */}
        {projectFiles.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              프로젝트 파일 목록 ({projectFiles.length}개)
            </h3>
            <div className="space-y-3">
              {projectFiles.map(file => (
                <div
                  key={file.id}
                  className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedFile(file);
                    setShowFileDetails(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.type)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {file.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatFileSize(file.size)} • {getCategoryText(file.category)} • {file.uploadTime.toLocaleString('ko-KR')}
                        </div>
                        {file.autoClassified && (
                          <div className="text-xs text-blue-600 mt-1">
                            🤖 자동 분류됨
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                        {getStatusText(file.status)}
                      </span>
                      {file.status === 'uploading' && (
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      )}
                      <EyeIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 파일 상세 정보 모달 */}
        {showFileDetails && selectedFile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    프로젝트 파일 상세 정보
                  </h3>
                  <button
                    onClick={() => setShowFileDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                    title="닫기"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* 파일 기본 정보 */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">파일 정보</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">파일명</div>
                        <div className="font-medium text-gray-900">{selectedFile.name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">파일 크기</div>
                        <div className="font-medium text-gray-900">{formatFileSize(selectedFile.size)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">파일 형식</div>
                        <div className="font-medium text-gray-900">{selectedFile.type.toUpperCase()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">분류 카테고리</div>
                        <div className="font-medium text-gray-900">{getCategoryText(selectedFile.category)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">업로드 시간</div>
                        <div className="font-medium text-gray-900">
                          {selectedFile.uploadTime.toLocaleString('ko-KR')}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">자동 분류</div>
                        <div className="font-medium text-gray-900">
                          {selectedFile.autoClassified ? '✅ 완료' : '❌ 미완료'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI 분석 결과 */}
                  {selectedFile.aiAnalysis && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <AcademicCapIcon className="w-5 h-5 mr-2 text-blue-600" />
                        AI 분석 결과
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">주요 개념</h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedFile.aiAnalysis.keyConcepts.map((concept, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                {concept}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">프로젝트 관련성</h5>
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${selectedFile.aiAnalysis.projectRelevance * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              {(selectedFile.aiAnalysis.projectRelevance * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h5 className="font-medium text-gray-900 mb-2">핵심 인사이트</h5>
                        <div className="space-y-2">
                          {selectedFile.aiAnalysis.insights.map((insight, index) => (
                            <div key={index} className="flex items-start text-sm text-gray-600">
                              <LightBulbIcon className="w-4 h-4 mr-2 text-yellow-500 mt-0.5 flex-shrink-0" />
                              {insight}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4">
                        <h5 className="font-medium text-gray-900 mb-2">종합 요약</h5>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          {selectedFile.aiAnalysis.summary}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 지식 베이스 결과 */}
                  {selectedFile.knowledgeBase && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <CircleStackIcon className="w-5 h-5 mr-2 text-green-600" />
                        지식 베이스 결과
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">프로젝트 연결</h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedFile.knowledgeBase.projectConnections.map((connection, index) => (
                              <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                                {connection}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">태그</h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedFile.knowledgeBase.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 딥러닝 결과 */}
                  {selectedFile.deepLearning && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <CpuChipIcon className="w-5 h-5 mr-2 text-purple-600" />
                        딥러닝 분석 결과
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">프로젝트 특화 모델</h5>
                          <div className="space-y-2">
                            {selectedFile.deepLearning.models.map((model, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{model.name}</div>
                                  <div className="text-xs text-gray-500">{model.type}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-gray-900">정확도: {(model.accuracy * 100).toFixed(1)}%</div>
                                  <div className="text-xs text-gray-500">
                                    {model.projectOptimized ? '프로젝트 최적화' : '일반 모델'}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">프로젝트 특화 인사이트</h5>
                          <div className="space-y-2">
                            {selectedFile.deepLearning.projectSpecificInsights.map((insight, index) => (
                              <div key={index} className="flex items-start text-sm text-gray-600">
                                <ChartBarIcon className="w-4 h-4 mr-2 text-purple-500 mt-0.5 flex-shrink-0" />
                                {insight}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectFolderSystem;
