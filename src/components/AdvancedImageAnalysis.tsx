import React, { useState, useCallback, useRef } from 'react';
import {
    PhotoIcon,
    MagnifyingGlassIcon,
    DocumentTextIcon,
    FaceSmileIcon,
    ArrowUpTrayIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

interface AnalysisResult {
    type: 'object_detection' | 'text_extraction' | 'emotion_analysis';
    result: any;
    confidence: number;
    timestamp: Date;
}

interface ObjectDetectionResult {
    objects: string[];
    count: number;
    boundingBoxes?: Array<{
        object: string;
        confidence: number;
        x: number;
        y: number;
        width: number;
        height: number;
    }>;
}

interface TextExtractionResult {
    text: string;
    words: string[];
    confidence: number;
}

interface EmotionAnalysisResult {
    emotion: string;
    confidence: number;
    emotions: Array<{
        emotion: string;
        confidence: number;
    }>;
}

interface AdvancedImageAnalysisProps {
    onAnalyze?: (imageData: string) => Promise<AnalysisResult>;
    onDetectObjects?: (image: File) => Promise<ObjectDetectionResult>;
    onExtractText?: (image: File) => Promise<TextExtractionResult>;
    onAnalyzeEmotion?: (image: File) => Promise<EmotionAnalysisResult>;
    className?: string;
}

const AdvancedImageAnalysis: React.FC<AdvancedImageAnalysisProps> = ({
    onAnalyze,
    onDetectObjects,
    onExtractText,
    onAnalyzeEmotion,
    className = ''
}) => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 이미지 파일 선택
    const handleImageSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                setSelectedImage(file);
                setError(null);

                // 이미지 미리보기 생성
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
    const handleDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);
            setError(null);

            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setError('이미지 파일만 드롭할 수 있습니다.');
        }
    }, []);

    const handleDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
    }, []);

    // 객체 감지
    const handleObjectDetection = useCallback(async () => {
        if (!selectedImage) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            const result = await onDetectObjects?.(selectedImage) || {
                objects: ['사람', '자동차', '건물'],
                count: 3
            };

            const analysisResult: AnalysisResult = {
                type: 'object_detection',
                result,
                confidence: 0.92,
                timestamp: new Date()
            };

            setAnalysisResults(prev => [...prev, analysisResult]);
        } catch (err) {
            setError('객체 감지 중 오류가 발생했습니다.');
        } finally {
            setIsAnalyzing(false);
        }
    }, [selectedImage, onDetectObjects]);

    // 텍스트 추출 (OCR)
    const handleTextExtraction = useCallback(async () => {
        if (!selectedImage) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            const result = await onExtractText?.(selectedImage) || {
                text: '추출된 텍스트 예시',
                words: ['추출된', '텍스트', '예시'],
                confidence: 0.85
            };

            const analysisResult: AnalysisResult = {
                type: 'text_extraction',
                result,
                confidence: result.confidence,
                timestamp: new Date()
            };

            setAnalysisResults(prev => [...prev, analysisResult]);
        } catch (err) {
            setError('텍스트 추출 중 오류가 발생했습니다.');
        } finally {
            setIsAnalyzing(false);
        }
    }, [selectedImage, onExtractText]);

    // 감정 분석
    const handleEmotionAnalysis = useCallback(async () => {
        if (!selectedImage) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            const result = await onAnalyzeEmotion?.(selectedImage) || {
                emotion: '행복',
                confidence: 0.85,
                emotions: [
                    { emotion: '행복', confidence: 0.85 },
                    { emotion: '평온', confidence: 0.10 },
                    { emotion: '슬픔', confidence: 0.05 }
                ]
            };

            const analysisResult: AnalysisResult = {
                type: 'emotion_analysis',
                result,
                confidence: result.confidence,
                timestamp: new Date()
            };

            setAnalysisResults(prev => [...prev, analysisResult]);
        } catch (err) {
            setError('감정 분석 중 오류가 발생했습니다.');
        } finally {
            setIsAnalyzing(false);
        }
    }, [selectedImage, onAnalyzeEmotion]);

    // 이미지 제거
    const handleRemoveImage = useCallback(() => {
        setSelectedImage(null);
        setImagePreview(null);
        setAnalysisResults([]);
        setError(null);
    }, []);

    // 결과 삭제
    const handleClearResults = useCallback(() => {
        setAnalysisResults([]);
    }, []);

    return (
        <div className={`advanced-image-analysis ${className}`}>
            {/* 헤더 */}
            <div className="analysis-header">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    🖼️ 고급 이미지 분석 시스템
                </h3>
            </div>

            {/* 이미지 업로드 영역 */}
            <div className="image-upload-area mb-6">
                {!selectedImage ? (
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-corbu-blue transition-colors"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                    >
                        <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">
                            이미지를 드래그 앤 드롭하거나 클릭하여 선택하세요
                        </p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-corbu-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <ArrowUpTrayIcon className="w-5 h-5 inline mr-2" />
                            이미지 선택
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                    </div>
                ) : (
                    <div className="relative">
                        <div className="relative inline-block">
                            <img
                                src={imagePreview!}
                                alt="선택된 이미지"
                                className="max-w-full h-auto rounded-lg border border-gray-200"
                                style={{ maxHeight: '300px' }}
                            />
                            <button
                                onClick={handleRemoveImage}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            {selectedImage.name} ({(selectedImage.size / 1024).toFixed(1)} KB)
                        </p>
                    </div>
                )}
            </div>

            {/* 분석 옵션 */}
            {selectedImage && (
                <div className="analysis-options mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">분석 옵션</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button
                            onClick={handleObjectDetection}
                            disabled={isAnalyzing}
                            className="flex items-center justify-center px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                        >
                            <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                            객체 감지
                        </button>
                        <button
                            onClick={handleTextExtraction}
                            disabled={isAnalyzing}
                            className="flex items-center justify-center px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                        >
                            <DocumentTextIcon className="w-5 h-5 mr-2" />
                            텍스트 추출
                        </button>
                        <button
                            onClick={handleEmotionAnalysis}
                            disabled={isAnalyzing}
                            className="flex items-center justify-center px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                        >
                            <FaceSmileIcon className="w-5 h-5 mr-2" />
                            감정 분석
                        </button>
                    </div>
                </div>
            )}

            {/* 로딩 상태 */}
            {isAnalyzing && (
                <div className="analyzing-status mb-4">
                    <div className="flex items-center text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        <span className="text-sm font-medium">이미지 분석 중...</span>
                    </div>
                </div>
            )}

            {/* 오류 메시지 */}
            {error && (
                <div className="error-message mb-4">
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                        ⚠️ {error}
                    </div>
                </div>
            )}

            {/* 분석 결과 */}
            {analysisResults.length > 0 && (
                <div className="analysis-results">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-medium text-gray-700">
                            분석 결과 ({analysisResults.length}개)
                        </h4>
                        <button
                            onClick={handleClearResults}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            결과 삭제
                        </button>
                    </div>

                    <div className="space-y-4">
                        {analysisResults.map((result, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <h5 className="font-medium text-gray-800">
                                        {result.type === 'object_detection' && '🔍 객체 감지'}
                                        {result.type === 'text_extraction' && '📝 텍스트 추출'}
                                        {result.type === 'emotion_analysis' && '😊 감정 분석'}
                                    </h5>
                                    <span className="text-xs text-gray-500">
                                        {(result.confidence * 100).toFixed(1)}%
                                    </span>
                                </div>

                                <div className="text-sm text-gray-600">
                                    {result.type === 'object_detection' && (
                                        <div>
                                            <p className="mb-2">
                                                <strong>감지된 객체:</strong> {result.result.objects.join(', ')}
                                            </p>
                                            <p>총 {result.result.count}개의 객체가 감지되었습니다.</p>
                                        </div>
                                    )}

                                    {result.type === 'text_extraction' && (
                                        <div>
                                            <p className="mb-2">
                                                <strong>추출된 텍스트:</strong>
                                            </p>
                                            <p className="bg-gray-50 p-2 rounded">{result.result.text}</p>
                                            <p className="mt-2 text-xs">
                                                단어 수: {result.result.words.length}개
                                            </p>
                                        </div>
                                    )}

                                    {result.type === 'emotion_analysis' && (
                                        <div>
                                            <p className="mb-2">
                                                <strong>주요 감정:</strong> {result.result.emotion}
                                            </p>
                                            <div className="space-y-1">
                                                {result.result.emotions.map((emotion: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between text-xs">
                                                        <span>{emotion.emotion}</span>
                                                        <span>{(emotion.confidence * 100).toFixed(1)}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="text-xs text-gray-400 mt-2">
                                    {result.timestamp.toLocaleTimeString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 통계 */}
            {analysisResults.length > 0 && (
                <div className="analysis-statistics mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">분석 통계</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">총 분석:</span>
                            <span className="ml-2 font-medium">{analysisResults.length}회</span>
                        </div>
                        <div>
                            <span className="text-gray-500">평균 정확도:</span>
                            <span className="ml-2 font-medium">
                                {(analysisResults.reduce((acc, r) => acc + r.confidence, 0) / analysisResults.length * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500">분석 유형:</span>
                            <span className="ml-2 font-medium">
                                {new Set(analysisResults.map(r => r.type)).size}가지
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedImageAnalysis; 