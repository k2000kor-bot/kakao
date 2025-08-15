import React, { useState, useEffect, useRef } from 'react';


interface VoiceRecognitionResult {
    text: string;
    confidence: number;
    language: string;
    duration: number;
    timestamp: string;
    emotions: Record<string, number>;
    keywords: string[];
    sentiment: string;
}

interface ImageAnalysisResult {
    image_info: {
        dimensions: { width: number; height: number };
        channels: number;
        file_size_estimate: number;
        mean_color: number[];
        std_color: number;
        quality_score: number;
        aspect_ratio: number;
    };
    object_detection: Array<{
        object_name: string;
        confidence: number;
        bounding_box: number[];
        class_id: number;
    }>;
    ocr_results: Array<{
        text: string;
        confidence: number;
        bounding_boxes: number[][];
        language: string;
    }>;
    emotion_analysis: {
        primary_emotion: string;
        emotion_confidence: number;
        emotion_scores: Record<string, number>;
        face_detected: boolean;
        face_count: number;
    };
    analysis_timestamp: string;
    processing_time: number;
}

interface PredictionResult {
    prediction_type: string;
    predicted_value: number;
    confidence_interval: [number, number];
    prediction_horizon: number;
    model_accuracy: number;
    features_importance: Record<string, number>;
    timestamp: string;
}

const AdvancedFeatures: React.FC = () => {
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [voiceResults, setVoiceResults] = useState<VoiceRecognitionResult[]>([]);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysisResult | null>(null);
    const [predictions, setPredictions] = useState<PredictionResult[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [activeTab, setActiveTab] = useState<'voice' | 'image' | 'prediction'>('voice');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // 음성 인식 시작
    const startVoiceRecognition = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                await processVoiceAudio(audioBlob);
            };

            mediaRecorder.start();
            setIsVoiceActive(true);
        } catch (error) {
            console.error('음성 인식 시작 실패:', error);
        }
    };

    // 음성 인식 중지
    const stopVoiceRecognition = () => {
        if (mediaRecorderRef.current && isVoiceActive) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsVoiceActive(false);
        }
    };

    // 음성 오디오 처리
    const processVoiceAudio = async (audioBlob: Blob) => {
        try {
            const base64Audio = await blobToBase64(audioBlob);

            const response = await fetch('http://localhost:8001/api/v7/voice/recognize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    audio_data: base64Audio,
                    language: 'ko-KR'
                })
            });

            const result = await response.json();
            if (result.success) {
                setVoiceResults(prev => [...prev, result.result]);
            }
        } catch (error) {
            console.error('음성 처리 실패:', error);
        }
    };

    // Blob을 Base64로 변환
    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    // 이미지 선택
    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedImage(file);
        }
    };

    // 이미지 분석
    const analyzeImage = async () => {
        if (!selectedImage) return;

        setIsAnalyzing(true);
        try {
            const base64Image = await fileToBase64(selectedImage);

            const response = await fetch('http://localhost:8002/api/v7/image/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image_data: base64Image,
                    analysis_type: 'comprehensive'
                })
            });

            const result = await response.json();
            if (result.success) {
                setImageAnalysis(result.result);
            }
        } catch (error) {
            console.error('이미지 분석 실패:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // 파일을 Base64로 변환
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // 예측 분석 실행
    const runPrediction = async (type: 'user_activity' | 'message_quality' | 'system_performance') => {
        try {
            const mockData = {
                user_activity: {
                    session_duration: 120,
                    message_count: 15,
                    analysis_count: 3,
                    upload_count: 2,
                    download_count: 1
                },
                message_quality: {
                    content_length: 150,
                    keyword_count: 5,
                    sentiment_score: 0.7,
                    ai_confidence: 0.85,
                    user_experience_level: 3
                },
                system_performance: {
                    cpu_usage: 45.2,
                    memory_usage: 67.8,
                    response_time: 0.3,
                    error_rate: 0.02,
                    active_users: 25
                }
            };

            const response = await fetch(`http://localhost:8003/api/v7/predict/${type}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prediction_type: type,
                    data: mockData[type],
                    time_horizon: 24,
                    confidence_level: 0.95
                })
            });

            const result = await response.json();
            if (result.success) {
                setPredictions(prev => [...prev, result.prediction]);
            }
        } catch (error) {
            console.error('예측 분석 실패:', error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    고급 AI 기능
                </h2>

                {/* 탭 네비게이션 */}
                <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('voice')}
                        className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${activeTab === 'voice'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        음성 인식
                    </button>
                    <button
                        onClick={() => setActiveTab('image')}
                        className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${activeTab === 'image'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        이미지 분석
                    </button>
                    <button
                        onClick={() => setActiveTab('prediction')}
                        className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${activeTab === 'prediction'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        예측 분석
                    </button>
                </div>

                {/* 음성 인식 탭 */}
                {activeTab === 'voice' && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                실시간 음성 인식
                            </h3>

                            <div className="flex space-x-4 mb-6">
                                <button
                                    onClick={startVoiceRecognition}
                                    disabled={isVoiceActive}
                                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${isVoiceActive
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-green-500 text-white hover:bg-green-600'
                                        }`}
                                >
                                    음성 인식 시작
                                </button>
                                <button
                                    onClick={stopVoiceRecognition}
                                    disabled={!isVoiceActive}
                                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${!isVoiceActive
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-red-500 text-white hover:bg-red-600'
                                        }`}
                                >
                                    음성 인식 중지
                                </button>
                            </div>

                            {isVoiceActive && (
                                <div className="flex items-center space-x-2 text-green-600">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <span>음성 인식 활성화 중...</span>
                                </div>
                            )}

                            {/* 음성 인식 결과 */}
                            {voiceResults.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="text-md font-semibold text-gray-700 mb-3">인식 결과</h4>
                                    <div className="space-y-3">
                                        {voiceResults.map((result, index) => (
                                            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-gray-800 font-medium">{result.text}</p>
                                                    <span className="text-sm text-gray-500">
                                                        {(result.confidence * 100).toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                    <span>감정: {result.sentiment}</span>
                                                    <span>키워드: {result.keywords.join(', ')}</span>
                                                    <span>처리시간: {result.duration.toFixed(2)}초</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 이미지 분석 탭 */}
                {activeTab === 'image' && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                고급 이미지 분석
                            </h3>

                            <div className="mb-6">
                                <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-2">
                                    이미지 파일 선택
                                </label>
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>

                            {selectedImage && (
                                <div className="mb-6">
                                    <div className="flex items-center space-x-4">
                                        <img
                                            src={URL.createObjectURL(selectedImage)}
                                            alt="선택된 이미지"
                                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                                        />
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                파일명: {selectedImage.name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                크기: {(selectedImage.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={analyzeImage}
                                        disabled={isAnalyzing}
                                        className={`mt-4 flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${isAnalyzing
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-purple-500 text-white hover:bg-purple-600'
                                            }`}
                                    >
                                        {isAnalyzing ? '분석 중...' : '이미지 분석'}
                                    </button>
                                </div>
                            )}

                            {/* 이미지 분석 결과 */}
                            {imageAnalysis && (
                                <div className="mt-6 space-y-4">
                                    <h4 className="text-md font-semibold text-gray-700">분석 결과</h4>

                                    {/* 이미지 정보 */}
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <h5 className="font-medium text-gray-800 mb-2">이미지 정보</h5>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600">크기:</span>
                                                <span className="ml-2">{imageAnalysis.image_info.dimensions.width} x {imageAnalysis.image_info.dimensions.height}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">품질 점수:</span>
                                                <span className="ml-2">{(imageAnalysis.image_info.quality_score * 100).toFixed(1)}%</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">처리 시간:</span>
                                                <span className="ml-2">{imageAnalysis.processing_time.toFixed(2)}초</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 객체 감지 */}
                                    {imageAnalysis.object_detection.length > 0 && (
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <h5 className="font-medium text-gray-800 mb-2">감지된 객체</h5>
                                            <div className="space-y-2">
                                                {imageAnalysis.object_detection.map((obj, index) => (
                                                    <div key={index} className="flex justify-between items-center">
                                                        <span className="text-sm">{obj.object_name}</span>
                                                        <span className="text-sm text-gray-600">
                                                            {(obj.confidence * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* OCR 결과 */}
                                    {imageAnalysis.ocr_results.length > 0 && (
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <h5 className="font-medium text-gray-800 mb-2">추출된 텍스트</h5>
                                            <div className="space-y-2">
                                                {imageAnalysis.ocr_results.map((ocr, index) => (
                                                    <div key={index} className="flex justify-between items-center">
                                                        <span className="text-sm">{ocr.text}</span>
                                                        <span className="text-sm text-gray-600">
                                                            {(ocr.confidence * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 감정 분석 */}
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <h5 className="font-medium text-gray-800 mb-2">감정 분석</h5>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">주요 감정:</span>
                                                <span className="text-sm font-medium">{imageAnalysis.emotion_analysis.primary_emotion}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">감지된 얼굴:</span>
                                                <span className="text-sm">{imageAnalysis.emotion_analysis.face_count}개</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 예측 분석 탭 */}
                {activeTab === 'prediction' && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                예측 분석
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <button
                                    onClick={() => runPrediction('user_activity')}
                                    className="flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    사용자 활동 예측
                                </button>
                                <button
                                    onClick={() => runPrediction('message_quality')}
                                    className="flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    메시지 품질 예측
                                </button>
                                <button
                                    onClick={() => runPrediction('system_performance')}
                                    className="flex items-center justify-center px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                >
                                    시스템 성능 예측
                                </button>
                            </div>

                            {/* 예측 결과 */}
                            {predictions.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="text-md font-semibold text-gray-700 mb-3">예측 결과</h4>
                                    <div className="space-y-4">
                                        {predictions.map((prediction, index) => (
                                            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h5 className="font-medium text-gray-800 capitalize">
                                                            {prediction.prediction_type.replace('_', ' ')} 예측
                                                        </h5>
                                                        <p className="text-sm text-gray-600">
                                                            예측값: {(prediction.predicted_value * 100).toFixed(1)}%
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-sm text-gray-500">
                                                            정확도: {(prediction.model_accuracy * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">신뢰 구간:</span>
                                                        <span className="text-gray-800">
                                                            {(prediction.confidence_interval[0] * 100).toFixed(1)}% - {(prediction.confidence_interval[1] * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">예측 범위:</span>
                                                        <span className="text-gray-800">{prediction.prediction_horizon}시간</span>
                                                    </div>
                                                </div>

                                                {/* 특성 중요도 */}
                                                {Object.keys(prediction.features_importance).length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                                        <h6 className="text-sm font-medium text-gray-700 mb-2">주요 특성</h6>
                                                        <div className="space-y-1">
                                                            {Object.entries(prediction.features_importance)
                                                                .sort(([, a], [, b]) => b - a)
                                                                .slice(0, 3)
                                                                .map(([feature, importance]) => (
                                                                    <div key={feature} className="flex justify-between text-xs">
                                                                        <span className="text-gray-600 capitalize">{feature.replace('_', ' ')}:</span>
                                                                        <span className="text-gray-800">{(importance * 100).toFixed(1)}%</span>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvancedFeatures; 