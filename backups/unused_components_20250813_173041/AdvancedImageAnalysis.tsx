import React, { useState, useRef, useCallback } from 'react';
import { 
  PhotoIcon, 
  MagnifyingGlassIcon,
  DocumentTextIcon,
  FaceSmileIcon,
  EyeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

interface ImageAnalysisResult {
  objects: Array<{
    name: string;
    confidence: number;
    boundingBox: { x: number; y: number; width: number; height: number };
  }>;
  text: string[];
  emotions: Array<{
    emotion: string;
    confidence: number;
  }>;
  colors: Array<{
    color: string;
    percentage: number;
  }>;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

interface AnalysisSettings {
  objectDetection: boolean;
  textExtraction: boolean;
  emotionAnalysis: boolean;
  colorAnalysis: boolean;
  faceDetection: boolean;
}

const AdvancedImageAnalysis: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<Array<{
    id: string;
    filename: string;
    timestamp: string;
    result: ImageAnalysisResult;
  }>>([]);

  const [settings, setSettings] = useState<AnalysisSettings>({
    objectDetection: true,
    textExtraction: true,
    emotionAnalysis: true,
    colorAnalysis: true,
    faceDetection: true
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 이미지 선택 처리
  const handleImageSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        setError(null);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setError('이미지 파일만 선택할 수 있습니다.');
      }
    }
  }, []);

  // 드래그 앤 드롭 처리
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        setError(null);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setError('이미지 파일만 선택할 수 있습니다.');
      }
    }
  }, []);

  // 이미지 분석 실행
  const analyzeImage = useCallback(async () => {
    if (!selectedImage || !imagePreview) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Base64로 이미지 변환
      const base64Image = imagePreview.split(',')[1];
      
      // 백엔드 API 호출
      const response = await fetch('/api/v7/image/analyze-base64', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_data: base64Image,
          analysis_type: 'comprehensive',
          settings: settings
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // 분석 결과 처리
        const analysisData: ImageAnalysisResult = {
          objects: result.objects || [],
          text: result.text || [],
          emotions: result.emotions || [],
          colors: result.colors || [],
          metadata: {
            width: result.metadata?.width || 0,
            height: result.metadata?.height || 0,
            format: selectedImage.type,
            size: selectedImage.size
          }
        };

        setAnalysisResult(analysisData);

        // 분석 히스토리에 추가
        const historyItem = {
          id: Date.now().toString(),
          filename: selectedImage.name,
          timestamp: new Date().toISOString(),
          result: analysisData
        };
        setAnalysisHistory(prev => [historyItem, ...prev.slice(0, 9)]);

        // 캔버스에 바운딩 박스 그리기
        drawBoundingBoxes(analysisData.objects);
      } else {
        throw new Error('이미지 분석에 실패했습니다.');
      }
    } catch (error) {
      console.error('이미지 분석 오류:', error);
      setError('이미지 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedImage, imagePreview, settings]);

  // 바운딩 박스 그리기
  const drawBoundingBoxes = useCallback((objects: ImageAnalysisResult['objects']) => {
    const canvas = canvasRef.current;
    const image = new Image();
    
    if (canvas && imagePreview) {
      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // 이미지 그리기
          ctx.drawImage(image, 0, 0);
          
          // 바운딩 박스 그리기
          objects.forEach(obj => {
            const { x, y, width, height } = obj.boundingBox;
            
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);
            
            // 라벨 그리기
            ctx.fillStyle = '#00ff00';
            ctx.font = '14px Arial';
            ctx.fillText(`${obj.name} (${(obj.confidence * 100).toFixed(1)}%)`, x, y - 5);
          });
        }
      };
      image.src = imagePreview;
    }
  }, [imagePreview]);

  // 설정 토글
  const toggleSetting = useCallback((key: keyof AnalysisSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // 이미지 초기화
  const clearImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // 히스토리에서 결과 로드
  const loadFromHistory = useCallback((historyItem: typeof analysisHistory[0]) => {
    setAnalysisResult(historyItem.result);
    setImagePreview(`data:image/jpeg;base64,${historyItem.result.metadata.format}`);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <PhotoIcon className="w-6 h-6 mr-2" />
          고급 이미지 분석 시스템
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleSetting('objectDetection')}
            className={`p-2 rounded-lg ${
              settings.objectDetection 
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}
            title="객체 감지"
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => toggleSetting('textExtraction')}
            className={`p-2 rounded-lg ${
              settings.textExtraction 
                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}
            title="텍스트 추출"
          >
            <DocumentTextIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => toggleSetting('emotionAnalysis')}
            className={`p-2 rounded-lg ${
              settings.emotionAnalysis 
                ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}
            title="감정 분석"
          >
            <FaceSmileIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 왼쪽 패널: 이미지 업로드 및 미리보기 */}
        <div className="space-y-4">
          {/* 이미지 업로드 영역 */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            <PhotoIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              이미지를 드래그 앤 드롭하거나 클릭하여 선택하세요
            </p>
                         <input
               ref={fileInputRef}
               type="file"
               accept="image/*"
               onChange={handleImageSelect}
               className="hidden"
               aria-label="이미지 파일 선택"
             />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              <ArrowUpTrayIcon className="w-5 h-5 inline mr-2" />
              이미지 선택
            </button>
          </div>

          {/* 이미지 미리보기 */}
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="미리보기"
                className="w-full h-auto rounded-lg shadow-lg"
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
            </div>
          )}

          {/* 분석 버튼 */}
          {selectedImage && (
            <div className="flex space-x-4">
              <button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium ${
                  isAnalyzing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                {isAnalyzing ? '분석 중...' : '이미지 분석'}
              </button>
              <button
                onClick={clearImage}
                className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
              >
                초기화
              </button>
            </div>
          )}
        </div>

        {/* 오른쪽 패널: 분석 결과 */}
        <div className="space-y-4">
          {/* 분석 결과 */}
          {analysisResult && (
            <div className="space-y-4">
              {/* 객체 감지 결과 */}
              {settings.objectDetection && analysisResult.objects.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                    <EyeIcon className="w-5 h-5 mr-2" />
                    감지된 객체
                  </h3>
                  <div className="space-y-2">
                    {analysisResult.objects.map((obj, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-blue-800 dark:text-blue-200">{obj.name}</span>
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          {(obj.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 텍스트 추출 결과 */}
              {settings.textExtraction && analysisResult.text.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center">
                    <DocumentTextIcon className="w-5 h-5 mr-2" />
                    추출된 텍스트
                  </h3>
                  <div className="space-y-2">
                    {analysisResult.text.map((text, index) => (
                      <p key={index} className="text-green-800 dark:text-green-200 text-sm">
                        {text}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* 감정 분석 결과 */}
              {settings.emotionAnalysis && analysisResult.emotions.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center">
                    <FaceSmileIcon className="w-5 h-5 mr-2" />
                    감정 분석
                  </h3>
                  <div className="space-y-2">
                    {analysisResult.emotions.map((emotion, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-purple-800 dark:text-purple-200">{emotion.emotion}</span>
                        <span className="text-purple-600 dark:text-purple-400 font-medium">
                          {(emotion.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 색상 분석 결과 */}
              {settings.colorAnalysis && analysisResult.colors.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3 flex items-center">
                    <ChartBarIcon className="w-5 h-5 mr-2" />
                    주요 색상
                  </h3>
                  <div className="space-y-2">
                    {analysisResult.colors.map((color, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: color.color }}
                        />
                        <span className="text-orange-800 dark:text-orange-200 flex-1">
                          {color.color}
                        </span>
                        <span className="text-orange-600 dark:text-orange-400 font-medium">
                          {color.percentage.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 이미지 메타데이터 */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  이미지 정보
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">크기:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {analysisResult.metadata.width} × {analysisResult.metadata.height}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">형식:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {analysisResult.metadata.format}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">파일 크기:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {(analysisResult.metadata.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 분석 히스토리 */}
          {analysisHistory.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                최근 분석 기록
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {analysisHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {item.filename}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 오류 메시지 */}
      {error && (
        <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="text-red-800 dark:text-red-200">
            <strong>오류:</strong> {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedImageAnalysis; 