import React, { useState, useRef, useCallback } from 'react';

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
    if (!selectedImage) {
      setError('분석할 이미지를 선택해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // 시뮬레이션된 분석 결과 생성
      const mockResult: ImageAnalysisResult = {
        objects: [
          {
            name: '사람',
            confidence: 0.95,
            boundingBox: { x: 100, y: 50, width: 200, height: 300 }
          },
          {
            name: '컴퓨터',
            confidence: 0.87,
            boundingBox: { x: 350, y: 200, width: 150, height: 100 }
          },
          {
            name: '책상',
            confidence: 0.92,
            boundingBox: { x: 300, y: 250, width: 200, height: 80 }
          }
        ],
        text: [
          'CORBU.AI',
          '지능형 분석 플랫폼',
          '2024'
        ],
        emotions: [
          {
            emotion: '집중',
            confidence: 0.78
          },
          {
            emotion: '만족',
            confidence: 0.65
          }
        ],
        colors: [
          {
            color: '#2563eb',
            percentage: 35
          },
          {
            color: '#ffffff',
            percentage: 25
          },
          {
            color: '#1f2937',
            percentage: 20
          },
          {
            color: '#6b7280',
            percentage: 15
          },
          {
            color: '#f3f4f6',
            percentage: 5
          }
        ],
        metadata: {
          width: 800,
          height: 600,
          format: 'JPEG',
          size: 245760
        }
      };

      // 실제 API 호출 대신 시뮬레이션
      setTimeout(() => {
        setAnalysisResult(mockResult);
        
        // 분석 히스토리에 추가
        const historyItem = {
          id: Date.now().toString(),
          filename: selectedImage.name,
          timestamp: new Date().toISOString(),
          result: mockResult
        };
        setAnalysisHistory(prev => [historyItem, ...prev.slice(0, 9)]); // 최대 10개 유지
        
        setIsAnalyzing(false);
      }, 3000);

    } catch (error) {
      console.error('이미지 분석 실패:', error);
      setError('이미지 분석 중 오류가 발생했습니다.');
      setIsAnalyzing(false);
    }
  }, [selectedImage]);

  // 파일 선택 버튼 클릭
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  // 분석 설정 변경
  const handleSettingChange = (setting: keyof AnalysisSettings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="advanced-image-analysis">
      <div className="analysis-header">
        <h2>🖼️ 고급 이미지 분석</h2>
        <p>AI 기반 이미지 분석으로 객체 감지, 텍스트 추출, 감정 분석을 수행합니다.</p>
      </div>

      <div className="analysis-container">
        <div className="upload-section">
          <div
            className={`upload-area ${selectedImage ? 'has-image' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {imagePreview ? (
              <div className="image-preview">
                <img src={imagePreview} alt="미리보기" />
                <div className="image-info">
                  <p>{selectedImage?.name}</p>
                  <p>{formatFileSize(selectedImage?.size || 0)}</p>
                </div>
              </div>
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon">📷</div>
                <p>이미지를 드래그하여 업로드하거나 클릭하여 선택하세요</p>
                <p className="upload-hint">JPG, PNG, GIF 파일을 지원합니다</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
            <button
              className="file-select-button"
              onClick={handleFileButtonClick}
            >
              이미지 선택
            </button>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        <div className="settings-section">
          <h3>분석 설정</h3>
          <div className="settings-grid">
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.objectDetection}
                onChange={() => handleSettingChange('objectDetection')}
              />
              <span>객체 감지</span>
            </label>
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.textExtraction}
                onChange={() => handleSettingChange('textExtraction')}
              />
              <span>텍스트 추출</span>
            </label>
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.emotionAnalysis}
                onChange={() => handleSettingChange('emotionAnalysis')}
              />
              <span>감정 분석</span>
            </label>
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.colorAnalysis}
                onChange={() => handleSettingChange('colorAnalysis')}
              />
              <span>색상 분석</span>
            </label>
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.faceDetection}
                onChange={() => handleSettingChange('faceDetection')}
              />
              <span>얼굴 감지</span>
            </label>
          </div>

          <button
            className="analyze-button"
            onClick={analyzeImage}
            disabled={!selectedImage || isAnalyzing}
          >
            {isAnalyzing ? '분석 중...' : '이미지 분석 시작'}
          </button>
        </div>

        {analysisResult && (
          <div className="analysis-results">
            <h3>분석 결과</h3>
            
            <div className="results-grid">
              <div className="result-section">
                <h4>📦 감지된 객체</h4>
                <div className="objects-list">
                  {analysisResult.objects.map((object, index) => (
                    <div key={index} className="object-item">
                      <span className="object-name">{object.name}</span>
                      <span className="object-confidence">
                        {(object.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="result-section">
                <h4>📝 추출된 텍스트</h4>
                <div className="text-list">
                  {analysisResult.text.map((text, index) => (
                    <div key={index} className="text-item">
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              <div className="result-section">
                <h4>😊 감정 분석</h4>
                <div className="emotions-list">
                  {analysisResult.emotions.map((emotion, index) => (
                    <div key={index} className="emotion-item">
                      <span className="emotion-name">{emotion.emotion}</span>
                      <span className="emotion-confidence">
                        {(emotion.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="result-section">
                <h4>🎨 색상 분석</h4>
                <div className="colors-list">
                  {analysisResult.colors.map((color, index) => (
                    <div key={index} className="color-item">
                      <div 
                        className="color-swatch"
                        style={{ backgroundColor: color.color }}
                      />
                      <span className="color-code">{color.color}</span>
                      <span className="color-percentage">{color.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="result-section">
                <h4>📊 이미지 메타데이터</h4>
                <div className="metadata-list">
                  <div className="metadata-item">
                    <span>크기:</span>
                    <span>{analysisResult.metadata.width} × {analysisResult.metadata.height}</span>
                  </div>
                  <div className="metadata-item">
                    <span>형식:</span>
                    <span>{analysisResult.metadata.format}</span>
                  </div>
                  <div className="metadata-item">
                    <span>파일 크기:</span>
                    <span>{formatFileSize(analysisResult.metadata.size)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {analysisHistory.length > 0 && (
          <div className="analysis-history">
            <h3>분석 히스토리</h3>
            <div className="history-list">
              {analysisHistory.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-info">
                    <span className="history-filename">{item.filename}</span>
                    <span className="history-timestamp">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="history-summary">
                    <span>{item.result.objects.length}개 객체</span>
                    <span>{item.result.text.length}개 텍스트</span>
                    <span>{item.result.emotions.length}개 감정</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedImageAnalysis;
