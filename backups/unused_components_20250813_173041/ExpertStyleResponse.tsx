import React, { useState, useEffect } from 'react';
import {
    AcademicCapIcon,
    ChartBarIcon,
    LightBulbIcon,
    BookOpenIcon,
    UserGroupIcon,
    CogIcon,
    SparklesIcon,
    DocumentTextIcon,
    PresentationChartLineIcon,
    BeakerIcon,
    GlobeAltIcon,
    HeartIcon,
    FireIcon,
    StarIcon,
    RocketLaunchIcon,
    CheckIcon,
    XMarkIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

interface ExpertStyleResponseProps {
    message: string;
    projectContext?: {
        name: string;
        files: any[];
        knowledgeBase?: any;
    };
    onGenerateResponse: (style: string, message: string) => Promise<string>;
    className?: string;
}

interface ExpertStyle {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<any>;
    color: string;
    bgColor: string;
    prompt: string;
}

const ExpertStyleResponse: React.FC<ExpertStyleResponseProps> = ({
    message,
    projectContext,
    onGenerateResponse,
    className = ""
}) => {
    const [selectedStyle, setSelectedStyle] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedResponse, setGeneratedResponse] = useState<string>('');
    const [showStyles, setShowStyles] = useState(false);

    const expertStyles: ExpertStyle[] = [
        {
            id: 'researcher',
            name: '연구자',
            description: '학술적이고 체계적인 분석',
            icon: AcademicCapIcon,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            prompt: '다음과 같은 연구자 관점에서 분석해주세요:\n\n1. 연구 배경 및 목적\n2. 방법론적 접근\n3. 주요 발견사항\n4. 연구의 한계점\n5. 향후 연구 방향\n\n학술적이고 객관적인 톤으로 답변해주세요.'
        },
        {
            id: 'analyst',
            name: '분석가',
            description: '데이터 기반 정량적 분석',
            icon: ChartBarIcon,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            prompt: '다음과 같은 분석가 관점에서 분석해주세요:\n\n1. 핵심 지표 분석\n2. 트렌드 및 패턴 분석\n3. 위험 요소 평가\n4. 기회 요소 분석\n5. 정량적 근거 제시\n\n데이터 중심의 객관적 분석을 제공해주세요.'
        },
        {
            id: 'critic',
            name: '평론가',
            description: '비판적이고 통찰력 있는 평가',
            icon: LightBulbIcon,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            prompt: '다음과 같은 평론가 관점에서 평가해주세요:\n\n1. 핵심 이슈 및 논점\n2. 장점 및 강점 분석\n3. 문제점 및 개선사항\n4. 사회적/산업적 영향\n5. 종합적 평가 및 제언\n\n비판적이면서도 건설적인 관점으로 답변해주세요.'
        },
        {
            id: 'consultant',
            name: '컨설턴트',
            description: '실무적이고 실행 가능한 조언',
            icon: UserGroupIcon,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            prompt: '다음과 같은 컨설턴트 관점에서 조언해주세요:\n\n1. 현재 상황 진단\n2. 핵심 과제 및 이슈\n3. 실행 가능한 해결방안\n4. 우선순위 및 로드맵\n5. 성공 지표 및 모니터링\n\n실무적이고 실행 가능한 조언을 제공해주세요.'
        },
        {
            id: 'strategist',
            name: '전략가',
            description: '장기적이고 포괄적인 전략 제시',
            icon: RocketLaunchIcon,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            prompt: '다음과 같은 전략가 관점에서 전략을 제시해주세요:\n\n1. 환경 분석 (SWOT)\n2. 비전 및 목표 설정\n3. 핵심 전략 방향\n4. 실행 계획 및 단계\n5. 리스크 관리 및 대응\n\n장기적이고 포괄적인 전략적 관점으로 답변해주세요.'
        },
        {
            id: 'innovator',
            name: '혁신가',
            description: '창의적이고 혁신적인 아이디어',
            icon: SparklesIcon,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            prompt: '다음과 같은 혁신가 관점에서 아이디어를 제시해주세요:\n\n1. 현재 패러다임 분석\n2. 혁신 기회 영역\n3. 창의적 해결방안\n4. 기술적/비즈니스 혁신\n5. 미래 비전 및 로드맵\n\n창의적이고 혁신적인 관점으로 답변해주세요.'
        },
        {
            id: 'educator',
            name: '교육자',
            description: '이해하기 쉽고 교육적인 설명',
            icon: BookOpenIcon,
            color: 'text-teal-600',
            bgColor: 'bg-teal-50',
            prompt: '다음과 같은 교육자 관점에서 설명해주세요:\n\n1. 기본 개념 및 원리\n2. 단계별 이해 과정\n3. 실제 사례 및 예시\n4. 핵심 포인트 정리\n5. 추가 학습 방향\n\n이해하기 쉽고 교육적인 방식으로 답변해주세요.'
        },
        {
            id: 'journalist',
            name: '기자',
            description: '객관적이고 사실 중심의 보도',
            icon: DocumentTextIcon,
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
            prompt: '다음과 같은 기자 관점에서 보도해주세요:\n\n1. 핵심 사실 및 정보\n2. 관련자 인터뷰 및 의견\n3. 배경 및 맥락 분석\n4. 영향 및 파급효과\n5. 향후 전망 및 전망\n\n객관적이고 사실 중심의 보도 스타일로 답변해주세요.'
        }
    ];

    const handleStyleSelect = async (style: ExpertStyle) => {
        setSelectedStyle(style.id);
        setIsGenerating(true);
        setShowStyles(false);

        try {
            const enhancedMessage = `${style.prompt}\n\n질문: ${message}`;
            const response = await onGenerateResponse(style.id, enhancedMessage);
            setGeneratedResponse(response);
        } catch (error) {
            console.error('응답 생성 실패:', error);
            setGeneratedResponse('응답 생성 중 오류가 발생했습니다.');
        } finally {
            setIsGenerating(false);
        }
    };

    const resetResponse = () => {
        setSelectedStyle('');
        setGeneratedResponse('');
        setShowStyles(false);
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(generatedResponse);
            // 복사 성공 알림
        } catch (error) {
            console.error('클립보드 복사 실패:', error);
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* 스타일 선택 버튼 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <SparklesIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">전문가 스타일 선택</span>
                </div>
                <button
                    onClick={() => setShowStyles(!showStyles)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    title="전문가 스타일 선택"
                >
                    {showStyles ? '닫기' : '스타일 선택'}
                </button>
            </div>

            {/* 스타일 선택 패널 */}
            {showStyles && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h4 className="font-medium text-gray-900 mb-3">전문가 스타일을 선택하세요</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {expertStyles.map((style) => (
                            <button
                                key={style.id}
                                onClick={() => handleStyleSelect(style)}
                                disabled={isGenerating}
                                className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${selectedStyle === style.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                    } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={style.description}
                            >
                                <div className="flex flex-col items-center space-y-2">
                                    <style.icon className={`w-6 h-6 ${style.color}`} />
                                    <div className="text-center">
                                        <div className="font-medium text-gray-900 text-sm">{style.name}</div>
                                        <div className="text-xs text-gray-500">{style.description}</div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 생성 중 표시 */}
            {isGenerating && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <div>
                            <div className="font-medium text-blue-900">
                                {expertStyles.find(s => s.id === selectedStyle)?.name} 스타일로 응답 생성 중...
                            </div>
                            <div className="text-sm text-blue-700">잠시만 기다려주세요</div>
                        </div>
                    </div>
                </div>
            )}

            {/* 생성된 응답 */}
            {generatedResponse && !isGenerating && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            {selectedStyle && (
                                <>
                                    {React.createElement(expertStyles.find(s => s.id === selectedStyle)?.icon || SparklesIcon, {
                                        className: `w-5 h-5 ${expertStyles.find(s => s.id === selectedStyle)?.color}`
                                    })}
                                    <span className="font-medium text-gray-900">
                                        {expertStyles.find(s => s.id === selectedStyle)?.name} 스타일 응답
                                    </span>
                                </>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={copyToClipboard}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                                title="클립보드에 복사"
                            >
                                <DocumentTextIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={resetResponse}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                                title="새로 시작"
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                            {generatedResponse}
                        </div>
                    </div>
                </div>
            )}

            {/* 빠른 스타일 버튼들 */}
            {!showStyles && !generatedResponse && (
                <div className="flex flex-wrap gap-2">
                    {expertStyles.slice(0, 4).map((style) => (
                        <button
                            key={style.id}
                            onClick={() => handleStyleSelect(style)}
                            disabled={isGenerating}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${style.bgColor
                                } ${style.color} hover:bg-opacity-80 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            title={style.description}
                        >
                            <style.icon className="w-4 h-4 inline mr-1" />
                            {style.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExpertStyleResponse;
