import React, { useState, useEffect } from 'react';
import {
    CloudArrowUpIcon,
    CpuChipIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ClockIcon,
    DocumentIcon
} from '@heroicons/react/24/outline';

interface ProcessingStep {
    id: string;
    name: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    progress: number;
    message?: string;
}

interface FileProcessingStatusProps {
    fileName: string;
    isVisible: boolean;
    onComplete?: () => void;
    onError?: (error: string) => void;
}

const FileProcessingStatus: React.FC<FileProcessingStatusProps> = ({
    fileName,
    isVisible,
    onComplete,
    onError
}) => {
    const [steps, setSteps] = useState<ProcessingStep[]>([
        { id: 'upload', name: '파일 업로드', status: 'pending', progress: 0 },
        { id: 'analysis', name: '텍스트 분석', status: 'pending', progress: 0 },
        { id: 'extraction', name: '지식 추출', status: 'pending', progress: 0 },
        { id: 'integration', name: '지식 베이스 통합', status: 'pending', progress: 0 },
        { id: 'materials', name: '글쓰기 소재 생성', status: 'pending', progress: 0 }
    ]);

    const [currentStep, setCurrentStep] = useState(0);
    const [overallProgress, setOverallProgress] = useState(0);

    // 파일 처리 시뮬레이션
    useEffect(() => {
        if (!isVisible) return;

        const processSteps = async () => {
            try {
                for (let i = 0; i < steps.length; i++) {
                    setCurrentStep(i);

                    // 현재 단계를 처리 중으로 설정
                    setSteps(prev => prev.map((step, index) =>
                        index === i ? { ...step, status: 'processing' } : step
                    ));

                    // 진행률 시뮬레이션
                    for (let progress = 0; progress <= 100; progress += 10) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                        setSteps(prev => prev.map((step, index) =>
                            index === i ? { ...step, progress } : step
                        ));

                        // 전체 진행률 업데이트
                        const totalProgress = ((i * 100) + progress) / steps.length;
                        setOverallProgress(totalProgress);
                    }

                    // 단계 완료 표시
                    setSteps(prev => prev.map((step, index) =>
                        index === i ? { ...step, status: 'completed', progress: 100 } : step
                    ));

                    // 각 단계별 처리 시간 조정
                    const delay = i === 1 ? 800 : 300; // 분석 단계는 더 오래
                    await new Promise(resolve => setTimeout(resolve, delay));
                }

                // 모든 단계 완료
                setTimeout(() => {
                    onComplete?.();
                }, 500);

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : '파일 처리 중 오류가 발생했습니다.';
                setSteps(prev => prev.map((step, index) =>
                    index === currentStep ? { ...step, status: 'error', message: errorMessage } : step
                ));
                onError?.(errorMessage);
            }
        };

        processSteps();
    }, [isVisible]);

    if (!isVisible) return null;

    const getStepIcon = (step: ProcessingStep) => {
        switch (step.status) {
            case 'completed':
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            case 'error':
                return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />;
            case 'processing':
                return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
            default:
                return <ClockIcon className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStepStatusText = (step: ProcessingStep) => {
        switch (step.status) {
            case 'completed':
                return '완료';
            case 'error':
                return '오류';
            case 'processing':
                return '처리 중...';
            default:
                return '대기 중';
        }
    };

    const getProgressColor = (step: ProcessingStep) => {
        switch (step.status) {
            case 'completed':
                return 'bg-green-500';
            case 'error':
                return 'bg-red-500';
            case 'processing':
                return 'bg-blue-500';
            default:
                return 'bg-gray-300';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                {/* 헤더 */}
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <DocumentIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">파일 처리 중</h3>
                        <p className="text-sm text-gray-500 truncate">{fileName}</p>
                    </div>
                </div>

                {/* 전체 진행률 */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">전체 진행률</span>
                        <span className="text-sm text-gray-500">{Math.round(overallProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${overallProgress}%` }}
                        />
                    </div>
                </div>

                {/* 단계별 진행 상황 */}
                <div className="space-y-4">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                {getStepIcon(step)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900">{step.name}</p>
                                    <span className={`text-xs ${step.status === 'completed' ? 'text-green-600' :
                                            step.status === 'error' ? 'text-red-600' :
                                                step.status === 'processing' ? 'text-blue-600' :
                                                    'text-gray-500'
                                        }`}>
                                        {getStepStatusText(step)}
                                    </span>
                                </div>

                                {/* 단계별 진행률 바 */}
                                <div className="mt-1">
                                    <div className="w-full bg-gray-200 rounded-full h-1">
                                        <div
                                            className={`h-1 rounded-full transition-all duration-300 ease-out ${getProgressColor(step)}`}
                                            style={{ width: `${step.progress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* 에러 메시지 */}
                                {step.status === 'error' && step.message && (
                                    <p className="text-xs text-red-600 mt-1">{step.message}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FileProcessingStatus;
