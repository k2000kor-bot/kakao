import React, { useState, useRef } from 'react';
import {
  FiUpload,
  FiX,
  FiTrendingUp,
  FiMessageSquare,
  FiUsers,
  FiCheckCircle
} from 'react-icons/fi';

interface AnalysisResult {
  participants: string[];
  message_count: number;
  topics: string[];
  sentiment: string;
  suggestions: string[];
  analysis: string;
}

const KakaoChatAnalysis: React.FC<{ onAnalysisComplete?: (result: any) => void }> = ({ onAnalysisComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/v1/analyze-kakao-chat', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisResult(data.data);
        onAnalysisComplete?.(data.data);
      } else {
        console.error('분석 실패:', data.error);
      }
    } catch (error) {
      console.error('분석 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateResponse = async () => {
    if (!analysisResult) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/v1/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis: analysisResult,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onAnalysisComplete?.({
          success: true,
          response: data.response,
        });
      } else {
        console.error('답변 생성 실패:', data.error);
      }
    } catch (error) {
      console.error('답변 생성 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileAnalysis = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/v1/analyze-file', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisResult(data.data);
        onAnalysisComplete?.(data.data);
      } else {
        console.error('파일 분석 실패:', data.error);
      }
    } catch (error) {
      console.error('파일 분석 오류:', error);
      onAnalysisComplete?.({
        success: false,
        error: '파일 분석 중 오류가 발생했습니다.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">카카오톡 대화 분석</h2>
        <p className="text-gray-600">카카오톡 대화 파일을 업로드하여 분석하고 답변을 생성하세요</p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center">
          <button
            onClick={() => document.getElementById('file-upload')?.click()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            title="파일 업로드"
          >
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span>파일 업로드</span>
          </button>
        </div>

        {selectedFile && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{selectedFile.name}</span>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-red-500 hover:text-red-700"
                title="파일 제거"
              >
                <div className="w-4 h-4 bg-gray-500 rounded"></div>
              </button>
            </div>
          </div>
        )}

        <input
          id="file-upload"
          type="file"
          accept=".txt"
          onChange={handleFileSelect}
          className="hidden"
          title="파일 선택"
        />

        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleAnalyze}
            disabled={!selectedFile || isAnalyzing}
            className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="대화 분석"
          >
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span>{isAnalyzing ? '분석 중...' : '대화 분석'}</span>
          </button>

          <button
            onClick={handleGenerateResponse}
            disabled={!analysisResult || isAnalyzing}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="답변 생성"
          >
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span>{isAnalyzing ? '생성 중...' : '답변 생성'}</span>
          </button>

          {selectedFile && (
            <button
              onClick={handleFileAnalysis}
              disabled={isAnalyzing}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="파일 분석"
            >
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
              <span>{isAnalyzing ? '처리 중...' : '파일 분석'}</span>
            </button>
          )}
        </div>

        {analysisResult && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="font-medium">참여자</span>
                </div>
                <p className="text-sm text-gray-600">
                  {analysisResult.participants || '분석 중...'}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="font-medium">메시지 수</span>
                </div>
                <p className="text-sm text-gray-600">
                  {analysisResult.message_count || '분석 중...'}
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="font-medium">주제</span>
                </div>
                <p className="text-sm text-gray-600">
                  {analysisResult.topics || '분석 중...'}
                </p>
              </div>
            </div>

            {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">제안사항</h3>
                <ul className="space-y-1">
                  {analysisResult.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded mt-0.5 flex-shrink-0"></div>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KakaoChatAnalysis; 