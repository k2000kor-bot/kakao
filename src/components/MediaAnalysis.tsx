import React, { useState, useRef } from 'react';
import {
  FiImage,
  FiVideo,
  FiMusic,
  FiFileText,
  FiUpload,
  FiCheck,
  FiX
} from 'react-icons/fi';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  analysis?: string;
  extractedText?: string;
  knowledgeBase?: string[];
  citations?: string[];
}

interface MediaAnalysisProps {
  isOpen?: boolean;
  onClose: () => void;
  onAnalysisComplete: (analysis: any) => void;
}

const MediaAnalysis: React.FC<MediaAnalysisProps> = ({ onAnalysisComplete }) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);

    const newFiles: MediaFile[] = uploadedFiles.map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      type: getFileType(file.type),
      size: file.size,
      status: 'uploading'
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // 파일 업로드 시뮬레이션
    for (let i = 0; i < newFiles.length; i++) {
      await simulateFileUpload(newFiles[i].id);
    }

    // 분석 시작
    await analyzeAllFiles();
  };

  const getFileType = (mimeType: string): 'image' | 'video' | 'audio' | 'document' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const simulateFileUpload = async (fileId: string) => {
    setFiles(prev => prev.map(file =>
      file.id === fileId ? { ...file, status: 'processing' } : file
    ));

    // 업로드 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000));

    setFiles(prev => prev.map(file =>
      file.id === fileId ? { ...file, status: 'completed' } : file
    ));
  };

  const analyzeAllFiles = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    const totalFiles = files.length;
    let completedFiles = 0;

    for (const file of files) {
      if (file.status === 'completed') {
        // 파일 분석 시뮬레이션
        await simulateFileAnalysis(file);
        completedFiles++;
        setAnalysisProgress((completedFiles / totalFiles) * 100);
      }
    }

    // 지식베이스 생성 및 인용 추출
    await generateKnowledgeBase();

    setIsAnalyzing(false);
    onAnalysisComplete({
      files: files,
      knowledgeBase: generateMockKnowledgeBase(),
      citations: generateMockCitations()
    });
  };

  const simulateFileAnalysis = async (file: MediaFile) => {
    // OCR, 음성 인식, 비디오 분석 시뮬레이션
    const analysis = await generateMockAnalysis(file);

    setFiles(prev => prev.map(f =>
      f.id === file.id ? {
        ...f,
        analysis: analysis.analysis,
        extractedText: analysis.extractedText,
        knowledgeBase: analysis.knowledgeBase,
        citations: analysis.citations
      } : f
    ));
  };

  const generateMockAnalysis = async (file: MediaFile) => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockAnalyses = {
      image: {
        analysis: "이미지에서 텍스트, 객체, 레이아웃을 분석했습니다.",
        extractedText: "도시 및 주거환경정비법 시행규칙 제15조에 따라...",
        knowledgeBase: ["부동산 정책", "도시개발", "법규"],
        citations: ["도시 및 주거환경정비법", "국토교통부 고시"]
      },
      video: {
        analysis: "비디오에서 음성, 자막, 시각적 요소를 분석했습니다.",
        extractedText: "이번 프로젝트는 총 3단계로 진행되며...",
        knowledgeBase: ["프로젝트 관리", "단계별 진행", "일정 관리"],
        citations: ["프로젝트 계획서", "진행 보고서"]
      },
      audio: {
        analysis: "오디오에서 음성을 텍스트로 변환하고 내용을 분석했습니다.",
        extractedText: "회의 내용을 정리하면 다음과 같습니다...",
        knowledgeBase: ["회의록", "의사결정", "토론 내용"],
        citations: ["회의록", "참석자 발언"]
      },
      document: {
        analysis: "문서의 구조와 내용을 분석했습니다.",
        extractedText: "본 문서는 2025년도 사업계획을 담고 있습니다...",
        knowledgeBase: ["사업계획", "예산", "목표"],
        citations: ["사업계획서", "예산안"]
      }
    };

    return mockAnalyses[file.type] || mockAnalyses.document;
  };

  const generateKnowledgeBase = async () => {
    // 모든 파일의 지식베이스를 통합
    const allKnowledge = files
      .filter(f => f.knowledgeBase)
      .flatMap(f => f.knowledgeBase || []);

    // 중복 제거 및 정리
    const uniqueKnowledge = Array.from(new Set(allKnowledge));

    return uniqueKnowledge;
  };

  const generateMockKnowledgeBase = () => {
    return [
      "부동산 정책 및 법규",
      "도시개발 프로젝트 관리",
      "회의 및 의사결정 과정",
      "사업계획 및 예산 관리",
      "문서 작성 및 보고서 작성법"
    ];
  };

  const generateMockCitations = () => {
    return [
      "도시 및 주거환경정비법 (2025년 개정)",
      "국토교통부 고시 제2025-123호",
      "프로젝트 계획서 v2.1",
      "회의록 2025년 7월 14일",
      "사업계획서 2025년도"
    ];
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <div className="w-5 h-5 bg-blue-500 rounded"></div>;
      case 'video': return <div className="w-5 h-5 bg-red-500 rounded"></div>;
      case 'audio': return <div className="w-5 h-5 bg-green-500 rounded"></div>;
      default: return <div className="w-5 h-5 bg-gray-500 rounded"></div>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading': return <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>;
      case 'processing': return <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>;
      case 'completed': return <div className="w-4 h-4 bg-green-500 rounded"></div>;
      case 'error': return <div className="w-4 h-4 bg-red-500 rounded"></div>;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">미디어 파일 분석</h3>
        <p className="text-sm text-gray-600 mb-4">
          이미지, 비디오, 오디오, 문서 파일을 업로드하면 AI가 내용을 분석하고 지식베이스를 구축합니다.
        </p>
      </div>

      {/* 파일 업로드 영역 */}
      <div className="mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="mb-4">
            <div className="w-12 h-12 bg-gray-400 rounded mx-auto"></div>
          </div>
          <p className="text-gray-600 mb-2">파일을 드래그하거나 클릭하여 업로드하세요</p>
          <p className="text-sm text-gray-500 mb-4">
            지원 형식: 이미지, 비디오, 오디오, 문서 (최대 10개 파일)
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            파일 선택
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
            title="미디어 파일 업로드"
            aria-label="미디어 파일 업로드"
          />
        </div>
      </div>

      {/* 파일 목록 */}
      {files.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-3">업로드된 파일</h4>
          <div className="space-y-2">
            {files.map(file => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type)}
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(file.status)}
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <div className="w-4 h-4 bg-gray-500 rounded"></div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 분석 진행률 */}
      {isAnalyzing && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">분석 진행 중...</span>
            <span className="text-sm text-gray-500">{Math.round(analysisProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${analysisProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 분석 결과 */}
      {files.some(f => f.analysis) && (
        <div className="space-y-4">
          <h4 className="font-medium">분석 결과</h4>
          {files.filter(f => f.analysis).map(file => (
            <div key={file.id} className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                {getFileIcon(file.type)}
                <span className="font-medium">{file.name}</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{file.analysis}</p>
              {file.extractedText && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">추출된 텍스트:</p>
                  <p className="text-sm bg-white p-2 rounded border">
                    {file.extractedText.substring(0, 150)}...
                  </p>
                </div>
              )}
              {file.knowledgeBase && file.knowledgeBase.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">발견된 지식:</p>
                  <div className="flex flex-wrap gap-1">
                    {file.knowledgeBase.map((knowledge, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {knowledge}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaAnalysis; 