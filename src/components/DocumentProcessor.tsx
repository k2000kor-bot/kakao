import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  FolderIcon,
  ArrowUpTrayIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { Document as KnowledgeDocument, KnowledgeProcessingResult } from '../types/knowledge';
import knowledgeService from '../services/knowledgeService';

interface DocumentProcessorProps {
  documents: KnowledgeDocument[];
  onDocumentProcessed: (document: KnowledgeDocument, result: KnowledgeProcessingResult) => void;
  onProcessingComplete: () => void;
}

const DocumentProcessor: React.FC<DocumentProcessorProps> = ({
  documents,
  onDocumentProcessed,
  onProcessingComplete
}) => {
  const [processingQueue, setProcessingQueue] = useState<KnowledgeDocument[]>([]);
  const [processedDocuments, setProcessedDocuments] = useState<Map<string, KnowledgeProcessingResult>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<KnowledgeDocument | null>(null);
  const [progress, setProgress] = useState(0);
  const [processingStats, setProcessingStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    averageTime: 0
  });

  useEffect(() => {
    if (documents.length > 0) {
      setProcessingQueue(documents);
      setProcessingStats(prev => ({ ...prev, total: documents.length }));
    }
  }, [documents]);

  const startProcessing = async () => {
    if (processingQueue.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    const startTime = Date.now();
    let completed = 0;
    let failed = 0;

    for (let i = 0; i < processingQueue.length; i++) {
      const document = processingQueue[i];
      setCurrentDocument(document);
      setProgress(((i + 1) / processingQueue.length) * 100);

      try {
        const result = await knowledgeService.processDocument(document);

        setProcessedDocuments(prev => new Map(prev.set(document.id, result)));
        onDocumentProcessed(document, result);
        completed++;

        // 처리 시간 계산
        const processingTime = Date.now() - startTime;
        setProcessingStats(prev => ({
          ...prev,
          completed,
          averageTime: processingTime / (completed + failed)
        }));

        // 잠시 대기 (실제로는 비동기 처리)
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`문서 처리 실패: ${document.title}`, error);
        failed++;
        setProcessingStats(prev => ({ ...prev, failed }));
      }
    }

    setIsProcessing(false);
    setCurrentDocument(null);
    setProgress(100);
    onProcessingComplete();
  };

  const getProcessingStatus = (documentId: string) => {
    if (processedDocuments.has(documentId)) {
      return 'completed';
    }
    if (currentDocument?.id === documentId) {
      return 'processing';
    }
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <ArrowPathIcon className="w-5 h-5 animate-spin text-blue-600" />;
      case 'failed':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <DocumentTextIcon className="w-5 h-5 text-red-600" />;
      case 'doc':
        return <DocumentTextIcon className="w-5 h-5 text-blue-600" />;
      case 'txt':
        return <DocumentTextIcon className="w-5 h-5 text-gray-600" />;
      case 'image':
        return <DocumentTextIcon className="w-5 h-5 text-green-600" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 처리 통계 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">41</span>
            문서 처리 현황
          </h3>
          <button
            onClick={startProcessing}
            disabled={isProcessing || processingQueue.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            <CogIcon className="w-4 h-4" />
            <span>{isProcessing ? '처리 중...' : '처리 시작'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{processingStats.total}</p>
            <p className="text-sm text-gray-600">총 문서</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{processingStats.completed}</p>
            <p className="text-sm text-gray-600">완료</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{processingStats.failed}</p>
            <p className="text-sm text-gray-600">실패</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {processingStats.averageTime > 0 ? `${(processingStats.averageTime / 1000).toFixed(1)}s` : '-'}
            </p>
            <p className="text-sm text-gray-600">평균 시간</p>
          </div>
        </div>

        {/* 진행률 바 */}
        {isProcessing && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>처리 진행률</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* 문서 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">문서 목록</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {processingQueue.map(document => {
            const status = getProcessingStatus(document.id);
            const result = processedDocuments.get(document.id);

            return (
              <div key={document.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(status)}
                    {getDocumentTypeIcon(document.type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{document.title}</h4>
                      <p className="text-sm text-gray-600">
                        {document.type.toUpperCase()} • {document.uploadedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {status === 'completed' && result && (
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-green-600">
                          키워드: {result.extractedInfo.keyPoints.length}개
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${result.extractedInfo.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                          result.extractedInfo.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                          {result.extractedInfo.sentiment === 'positive' ? '긍정' :
                            result.extractedInfo.sentiment === 'negative' ? '부정' : '중립'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 처리 결과 상세 정보 */}
                {status === 'completed' && result && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">추출된 키워드</h5>
                        <div className="flex flex-wrap gap-1">
                          {result.extractedInfo.keyPoints.slice(0, 5).map((keyword, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">엔티티</h5>
                        <div className="flex flex-wrap gap-1">
                          {result.extractedInfo.entities.slice(0, 3).map((entity, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              {entity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h5 className="font-medium text-gray-900 mb-2">처리 메타데이터</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">처리 시간:</span>
                          <span className="ml-2 font-medium">{result.metadata.processingTime}ms</span>
                        </div>
                        <div>
                          <span className="text-gray-600">모델:</span>
                          <span className="ml-2 font-medium">{result.metadata.modelUsed}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">임베딩 차원:</span>
                          <span className="ml-2 font-medium">{result.embeddings?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 처리 옵션 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">처리 옵션</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">분석 옵션</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-2" />
                <span className="text-sm">키워드 추출</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-2" />
                <span className="text-sm">엔티티 인식</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-2" />
                <span className="text-sm">감정 분석</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-2" />
                <span className="text-sm">임베딩 생성</span>
              </label>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">AI 모델 설정</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">모델 선택</label>
                <select className="w-full p-2 border border-gray-300 rounded text-sm" aria-label="문서 유형 선택">
                  <option value="local-bert">로컬 BERT</option>
                  <option value="openai">OpenAI GPT</option>
                  <option value="claude">Claude</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">처리 품질</label>
                <select className="w-full p-2 border border-gray-300 rounded text-sm" aria-label="문서 상태 선택">
                  <option value="fast">빠름 (기본)</option>
                  <option value="balanced">균형</option>
                  <option value="accurate">정확함</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentProcessor; 