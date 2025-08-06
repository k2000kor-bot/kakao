import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/AppContext';

interface MediaFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  category?: string;
  tags?: string[];
  confidence?: number;
  extractedText?: string;
  summary?: string;
}

interface MediaFileClassifierProps {
  files: File[];
  onClassificationComplete: (classifiedFiles: MediaFile[]) => void;
  onClose: () => void;
}

const MediaFileClassifier: React.FC<MediaFileClassifierProps> = ({
  files,
  onClassificationComplete,
  onClose
}) => {
  const [classifiedFiles, setClassifiedFiles] = useState<MediaFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const { addNotification } = useNotifications();

  // 파일 카테고리 정의
  const categories = {
    'document': {
      name: '문서',
      icon: '📄',
      subcategories: ['contract', 'proposal', 'report', 'manual', 'guideline']
    },
    'image': {
      name: '이미지',
      icon: '🖼️',
      subcategories: ['design', 'photo', 'diagram', 'chart', 'screenshot']
    },
    'presentation': {
      name: '프레젠테이션',
      icon: '📊',
      subcategories: ['pitch', 'report', 'analysis', 'proposal']
    },
    'data': {
      name: '데이터',
      icon: '📈',
      subcategories: ['excel', 'csv', 'database', 'analytics']
    },
    'media': {
      name: '미디어',
      icon: '🎥',
      subcategories: ['video', 'audio', 'animation']
    }
  };

  // 딥러닝 모의 분류 함수
  const classifyFile = async (file: File): Promise<MediaFile> => {
    // 모의 딥러닝 처리 지연
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const fileType = file.type;
    let category = 'document';
    let tags: string[] = [];
    let confidence = 0.85 + Math.random() * 0.1;
    let extractedText = '';
    let summary = '';

    // 파일 타입별 분류 로직
    if (fileType.startsWith('image/')) {
      category = 'image';
      tags = ['design', 'visual', 'reference'];
      extractedText = '이미지 파일 - 시각적 참고 자료';
      summary = '디자인 참고용 이미지 파일입니다.';
    } else if (fileType.includes('pdf')) {
      category = 'document';
      tags = ['contract', 'proposal', 'report'];
      extractedText = 'PDF 문서 - 계약서 또는 제안서';
      summary = '계약서 또는 제안서 문서입니다.';
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      category = 'data';
      tags = ['excel', 'data', 'analysis'];
      extractedText = '엑셀 파일 - 데이터 분석 자료';
      summary = '데이터 분석용 엑셀 파일입니다.';
    } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
      category = 'presentation';
      tags = ['presentation', 'pitch', 'report'];
      extractedText = '프레젠테이션 파일 - 발표 자료';
      summary = '프레젠테이션 발표 자료입니다.';
    } else if (fileType.startsWith('video/')) {
      category = 'media';
      tags = ['video', 'demo', 'tutorial'];
      extractedText = '비디오 파일 - 데모 또는 튜토리얼';
      summary = '데모 또는 튜토리얼 비디오입니다.';
    }

    return {
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      category,
      tags,
      confidence,
      extractedText,
      summary
    };
  };

  // 파일 분류 시작
  useEffect(() => {
    const processFiles = async () => {
      setIsProcessing(true);
      const results: MediaFile[] = [];

      for (let i = 0; i < files.length; i++) {
        setCurrentFileIndex(i);
        const classifiedFile = await classifyFile(files[i]);
        results.push(classifiedFile);
        
        addNotification({
          type: 'success',
          title: '파일 분류 완료',
          message: `${files[i].name} 파일이 ${categories[classifiedFile.category as keyof typeof categories]?.name}로 분류되었습니다.`
        });
      }

      setClassifiedFiles(results);
      setIsProcessing(false);
    };

    if (files.length > 0) {
      processFiles();
    }
  }, [files, addNotification]);

  const handleComplete = () => {
    onClassificationComplete(classifiedFiles);
    onClose();
  };

  const getCategoryIcon = (category: string) => {
    return categories[category as keyof typeof categories]?.icon || '📁';
  };

  const getCategoryName = (category: string) => {
    return categories[category as keyof typeof categories]?.name || '기타';
  };

  if (!isProcessing && classifiedFiles.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">AI 파일 분류</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isProcessing}
              aria-label="파일 분류 모달 닫기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {isProcessing ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  AI가 파일을 분석하고 있습니다...
                </h3>
                <p className="text-gray-600">
                  {files[currentFileIndex]?.name} 파일을 분류 중입니다.
                </p>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentFileIndex + 1) / files.length) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {currentFileIndex + 1} / {files.length}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  분류 결과 ({classifiedFiles.length}개 파일)
                </h3>
                <p className="text-gray-600 mb-4">
                  AI가 파일을 분석하여 카테고리별로 분류했습니다.
                </p>
              </div>

              <div className="space-y-4">
                {classifiedFiles.map((file) => (
                  <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">{getCategoryIcon(file.category!)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{file.name}</h4>
                          <span className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {getCategoryName(file.category!)}
                          </span>
                          <span className="text-sm text-gray-500">
                            신뢰도: {(file.confidence! * 100).toFixed(1)}%
                          </span>
                        </div>

                        {file.tags && file.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {file.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {file.summary && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {file.summary}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 분류된 파일 활용 방법</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 문서 파일: 프로젝트 지침 및 계약서로 활용</li>
                  <li>• 이미지 파일: 디자인 참고 자료로 활용</li>
                  <li>• 데이터 파일: 분석 및 보고서 작성에 활용</li>
                  <li>• 프레젠테이션: 발표 자료 및 제안서로 활용</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {!isProcessing && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800"
              >
                취소
              </button>
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                분류 완료
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaFileClassifier; 