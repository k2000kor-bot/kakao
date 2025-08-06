import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    CloudArrowUpIcon,
    DocumentIcon,
    PhotoIcon,
    VideoCameraIcon,
    MusicalNoteIcon,
    XMarkIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon,
    AcademicCapIcon,
    LightBulbIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import EnhancedMediaFileUpload from './EnhancedMediaFileUpload';
import enhancedFileAnalysisService, { FileAnalysis, AIResponse, FileProcessingOptions } from '../services/enhancedFileAnalysisService';

interface FileInfo {
    id: string;
    file: File;
    name: string;
    size: number;
    type: string;
    status: 'uploading' | 'analyzing' | 'completed' | 'failed';
    progress: number;
    analysis?: FileAnalysis;
    aiResponse?: AIResponse;
    error?: string;
}

interface IntegratedMediaFileUploadProps {
    onFilesUploaded: (files: FileInfo[]) => void;
    onFileAnalyzed: (fileId: string, analysis: FileAnalysis) => void;
    onAIResponseGenerated: (fileId: string, response: AIResponse) => void;
    onFileError: (fileId: string, error: string) => void;
    className?: string;
    theme?: 'default' | 'minimal' | 'professional';
    autoGenerateResponse?: boolean;
    responseType?: AIResponse['responseType'];
}

const IntegratedMediaFileUpload: React.FC<IntegratedMediaFileUploadProps> = ({
    onFilesUploaded,
    onFileAnalyzed,
    onAIResponseGenerated,
    onFileError,
    className = '',
    theme = 'default',
    autoGenerateResponse = true,
    responseType = 'analysis'
}) => {
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedResponseType, setSelectedResponseType] = useState<AIResponse['responseType']>(responseType);
    const [showResponseOptions, setShowResponseOptions] = useState(false);

    // 파일 업로드 처리
    const handleFilesUploaded = useCallback(async (uploadedFiles: any[]) => {
        const newFiles: FileInfo[] = uploadedFiles.map(fileInfo => ({
            id: fileInfo.id,
            file: fileInfo.file,
            name: fileInfo.name,
            size: fileInfo.size,
            type: fileInfo.type,
            status: 'uploading',
            progress: 0
        }));

        setFiles(prev => [...prev, ...newFiles]);
        setIsProcessing(true);

        // 각 파일에 대해 분석 수행
        for (const fileInfo of newFiles) {
            try {
                // 파일 분석 옵션 설정
                const analysisOptions: FileProcessingOptions = {
                    generateSummary: true,
                    extractText: true,
                    analyzeSentiment: true,
                    identifyKeywords: true,
                    provideRecommendations: true,
                    researchPerspective: selectedResponseType === 'research',
                    technicalAnalysis: true,
                    userGuidance: true
                };

                // 파일 분석 수행
                const analysis = await enhancedFileAnalysisService.uploadAndAnalyzeFile(
                    fileInfo.file,
                    analysisOptions
                );

                // 파일 상태 업데이트
                setFiles(prev => prev.map(f =>
                    f.id === fileInfo.id
                        ? { ...f, status: 'completed', analysis }
                        : f
                ));

                onFileAnalyzed(fileInfo.id, analysis);

                // 자동 AI 응답 생성
                if (autoGenerateResponse) {
                    const aiResponse = await enhancedFileAnalysisService.generateAIResponse(
                        analysis,
                        undefined,
                        selectedResponseType
                    );

                    setFiles(prev => prev.map(f =>
                        f.id === fileInfo.id
                            ? { ...f, aiResponse }
                            : f
                    ));

                    onAIResponseGenerated(fileInfo.id, aiResponse);
                }

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : '파일 처리 중 오류가 발생했습니다.';

                setFiles(prev => prev.map(f =>
                    f.id === fileInfo.id
                        ? { ...f, status: 'failed', error: errorMessage }
                        : f
                ));

                onFileError(fileInfo.id, errorMessage);
            }
        }

        setIsProcessing(false);
        onFilesUploaded(newFiles);
    }, [onFileAnalyzed, onAIResponseGenerated, onFileError, onFilesUploaded, autoGenerateResponse, selectedResponseType]);

    // 파일 분석 처리
    const handleFileAnalyzed = useCallback((fileId: string, analysis: FileAnalysis) => {
        console.log('파일 분석 완료:', fileId, analysis);
    }, []);

    // AI 응답 생성 처리
    const handleAIResponseGenerated = useCallback((fileId: string, response: AIResponse) => {
        console.log('AI 응답 생성 완료:', fileId, response);
    }, []);

    // 파일 오류 처리
    const handleFileError = useCallback((fileId: string, error: string) => {
        console.error('파일 처리 오류:', fileId, error);
    }, []);

    // 파일 제거
    const removeFile = useCallback((fileId: string) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
    }, []);

    // AI 응답 수동 생성
    const generateAIResponse = useCallback(async (fileId: string) => {
        const fileInfo = files.find(f => f.id === fileId);
        if (!fileInfo || !fileInfo.analysis) return;

        try {
            const aiResponse = await enhancedFileAnalysisService.generateAIResponse(
                fileInfo.analysis,
                undefined,
                selectedResponseType
            );

            setFiles(prev => prev.map(f =>
                f.id === fileId
                    ? { ...f, aiResponse }
                    : f
            ));

            onAIResponseGenerated(fileId, aiResponse);
        } catch (error) {
            console.error('AI 응답 생성 오류:', error);
        }
    }, [files, selectedResponseType, onAIResponseGenerated]);

    // 응답 타입별 아이콘
    const getResponseTypeIcon = (type: AIResponse['responseType']) => {
        switch (type) {
            case 'summary':
                return DocumentIcon;
            case 'analysis':
                return MagnifyingGlassIcon;
            case 'recommendation':
                return LightBulbIcon;
            case 'research':
                return AcademicCapIcon;
            case 'comparison':
                return ChartBarIcon;
            default:
                return DocumentIcon;
        }
    };

    // 응답 타입별 라벨
    const getResponseTypeLabel = (type: AIResponse['responseType']) => {
        switch (type) {
            case 'summary':
                return '요약';
            case 'analysis':
                return '분석';
            case 'recommendation':
                return '추천';
            case 'research':
                return '연구';
            case 'comparison':
                return '비교';
            default:
                return '분석';
        }
    };

    // 테마별 스타일 클래스
    const getThemeClasses = () => {
        switch (theme) {
            case 'minimal':
                return {
                    container: 'bg-white border border-gray-200 rounded-lg',
                    header: 'bg-gray-50 border-b border-gray-200',
                    button: 'bg-gray-900 text-white hover:bg-gray-800',
                    fileItem: 'bg-gray-50 border border-gray-200',
                    responseItem: 'bg-white border border-gray-200'
                };
            case 'professional':
                return {
                    container: 'bg-white shadow-lg border border-gray-200 rounded-xl',
                    header: 'bg-blue-50 border-b border-blue-200',
                    button: 'bg-blue-600 text-white hover:bg-blue-700',
                    fileItem: 'bg-white border border-gray-200 shadow-sm',
                    responseItem: 'bg-blue-50 border border-blue-200'
                };
            default:
                return {
                    container: 'bg-white border border-gray-200 rounded-lg',
                    header: 'bg-gray-50 border-b border-gray-200',
                    button: 'bg-blue-500 text-white hover:bg-blue-600',
                    fileItem: 'bg-gray-50 border border-gray-200',
                    responseItem: 'bg-green-50 border border-green-200'
                };
        }
    };

    const themeClasses = getThemeClasses();

    return (
        <div className={`${themeClasses.container} ${className}`}>
            {/* 헤더 */}
            <div className={`p-4 ${themeClasses.header}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <CloudArrowUpIcon className="w-6 h-6 text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900">미디어 파일 업로드</h3>
                    </div>

                    {/* 응답 타입 선택 */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowResponseOptions(!showResponseOptions)}
                            className={`px-3 py-1 text-sm rounded ${themeClasses.button}`}
                        >
                            {getResponseTypeLabel(selectedResponseType)}
                        </button>
                    </div>
                </div>

                {/* 응답 타입 옵션 */}
                {showResponseOptions && (
                    <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">응답 타입 선택:</p>
                        <div className="grid grid-cols-2 gap-2">
                            {(['summary', 'analysis', 'recommendation', 'research', 'comparison'] as const).map((type) => {
                                const IconComponent = getResponseTypeIcon(type);
                                return (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            setSelectedResponseType(type);
                                            setShowResponseOptions(false);
                                        }}
                                        className={`flex items-center space-x-2 p-2 rounded text-sm transition-colors ${selectedResponseType === type
                                            ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                            : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        <IconComponent className="w-4 h-4" />
                                        <span>{getResponseTypeLabel(type)}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* 파일 업로드 영역 */}
            <div className="p-4">
                <EnhancedMediaFileUpload
                    onFilesUploaded={handleFilesUploaded}
                    onFileAnalyzed={handleFileAnalyzed}
                    onFileError={handleFileError}
                    theme={theme}
                    className="mb-4"
                />
            </div>

            {/* 업로드된 파일 목록 */}
            {files.length > 0 && (
                <div className="p-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">처리된 파일</h4>
                    <div className="space-y-3">
                        {files.map((fileInfo) => (
                            <div key={fileInfo.id} className={`p-4 rounded-lg ${themeClasses.fileItem}`}>
                                {/* 파일 정보 */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        {fileInfo.type.startsWith('image/') ? (
                                            <PhotoIcon className="w-8 h-8 text-blue-500" />
                                        ) : fileInfo.type.startsWith('video/') ? (
                                            <VideoCameraIcon className="w-8 h-8 text-purple-500" />
                                        ) : fileInfo.type.startsWith('audio/') ? (
                                            <MusicalNoteIcon className="w-8 h-8 text-green-500" />
                                        ) : (
                                            <DocumentIcon className="w-8 h-8 text-gray-500" />
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{fileInfo.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {(fileInfo.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {fileInfo.status === 'completed' && (
                                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                        )}
                                        {fileInfo.status === 'failed' && (
                                            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                                        )}
                                        <button
                                            onClick={() => removeFile(fileInfo.id)}
                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                            title="파일 제거"
                                            aria-label="파일 제거"
                                        >
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* 분석 결과 */}
                                {fileInfo.analysis && (
                                    <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-200">
                                        <h5 className="text-sm font-medium text-blue-900 mb-2">분석 결과</h5>
                                        <div className="text-xs text-blue-700 space-y-1">
                                            <p>• 타입: {fileInfo.analysis.analysisType}</p>
                                            <p>• 신뢰도: {(fileInfo.analysis.confidence * 100).toFixed(1)}%</p>
                                            <p>• 처리 시간: {fileInfo.analysis.processingTime}ms</p>
                                            {fileInfo.analysis.keywords && (
                                                <p>• 키워드: {fileInfo.analysis.keywords.join(', ')}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* AI 응답 */}
                                {fileInfo.aiResponse && (
                                    <div className={`p-3 rounded border ${themeClasses.responseItem}`}>
                                        <div className="flex items-center space-x-2 mb-2">
                                            {React.createElement(getResponseTypeIcon(fileInfo.aiResponse.responseType), {
                                                className: "w-4 h-4 text-green-600"
                                            })}
                                            <h5 className="text-sm font-medium text-green-900">
                                                {getResponseTypeLabel(fileInfo.aiResponse.responseType)} 응답
                                            </h5>
                                        </div>
                                        <div className="text-xs text-green-700 max-h-32 overflow-y-auto">
                                            <div className="whitespace-pre-line">
                                                {fileInfo.aiResponse.content.substring(0, 300)}
                                                {fileInfo.aiResponse.content.length > 300 && '...'}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* AI 응답 생성 버튼 */}
                                {fileInfo.analysis && !fileInfo.aiResponse && (
                                    <button
                                        onClick={() => generateAIResponse(fileInfo.id)}
                                        className={`mt-2 px-3 py-1 text-xs rounded ${themeClasses.button}`}
                                        disabled={isProcessing}
                                    >
                                        {getResponseTypeLabel(selectedResponseType)} 생성
                                    </button>
                                )}

                                {/* 오류 메시지 */}
                                {fileInfo.error && (
                                    <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                                        <p className="text-xs text-red-700 font-medium">오류 발생</p>
                                        <p className="text-xs text-red-600">{fileInfo.error}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntegratedMediaFileUpload;
