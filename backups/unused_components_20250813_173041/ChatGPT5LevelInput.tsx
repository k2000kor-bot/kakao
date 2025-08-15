import React, { useState, useRef, useEffect } from 'react';
import {
    AcademicCapIcon,
    LightBulbIcon,
    ChartBarIcon,
    CogIcon,
    BookOpenIcon,
    SparklesIcon,
    BeakerIcon,
    MagnifyingGlassIcon,
    ClockIcon,
    DocumentIcon,
    CpuChipIcon,
    RocketLaunchIcon,
    StarIcon,
    GlobeAltIcon,
    CodeBracketIcon,
    CalculatorIcon,
    DocumentTextIcon,
    XMarkIcon,
    HeartIcon
} from '@heroicons/react/24/outline';
import { chatGPT5LevelService, ChatGPT5Request, ChatGPT5Response } from '../services/chatgpt5LevelService';

interface ChatGPT5LevelInputProps {
    onSendMessage: (message: string) => void;
    onAdvancedResponse: (response: ChatGPT5Response) => void;
    onFileProcessed?: (fileInfo: any) => void;
    projectId?: string;
    chatId?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    showAdvancedFeatures?: boolean;
    userProfile?: {
        expertise: string[];
        education: string;
        experience: number;
        interests: string[];
        communicationStyle: string;
        preferredComplexity: string;
    };
}

const ChatGPT5LevelInput: React.FC<ChatGPT5LevelInputProps> = ({
    onSendMessage,
    onAdvancedResponse,
    onFileProcessed,
    projectId,
    chatId,
    placeholder = "박사급 AI와 대화하세요. 복잡한 질문, 분석 요청, 연구 논의 등 무엇이든 물어보세요.",
    disabled = false,
    className = "",
    showAdvancedFeatures = true,
    userProfile
}) => {
    const [inputValue, setInputValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
    const [selectedComplexity, setSelectedComplexity] = useState<'basic' | 'intermediate' | 'advanced' | 'expert' | 'phd'>('phd');
    const [selectedStyle, setSelectedStyle] = useState<'academic' | 'professional' | 'creative' | 'technical' | 'analytical'>('academic');
    const [selectedDomain, setSelectedDomain] = useState<string>('general');
    const [selectedLanguage, setSelectedLanguage] = useState<'ko' | 'en' | 'ja' | 'zh'>('ko');
    const [advancedOptions, setAdvancedOptions] = useState({
        includeAnalysis: true,
        includeSources: true,
        includeRecommendations: true,
        includeVisualization: true,
        includeCode: false,
        includeMath: false
    });
    const [processingProgress, setProcessingProgress] = useState(0);
    const [processingStep, setProcessingStep] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // 자동 높이 조정
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [inputValue]);

    // 고급 제안사항
    const advancedSuggestions = [
        "양자 컴퓨팅의 현재 기술적 한계와 향후 발전 방향에 대한 심층 분석을 제공해주세요.",
        "머신러닝 알고리즘의 윤리적 함의와 사회적 영향을 다각도로 분석해주세요.",
        "블록체인 기술이 금융 산업에 미치는 혁신적 변화와 규제적 과제를 연구해주세요.",
        "인공지능의 창의성과 인간의 창의성 간의 차이점과 융합 가능성을 탐구해주세요.",
        "기후 변화가 글로벌 경제에 미치는 장기적 영향과 대응 전략을 분석해주세요.",
        "바이오테크놀로지의 의료 분야 혁신과 윤리적 딜레마를 종합적으로 검토해주세요.",
        "현재 프로젝트의 기술적 아키텍처를 분석하고 개선 방안을 제시해주세요.",
        "대화 내용을 바탕으로 한 지식 그래프 구축 방안을 연구해주세요.",
        "AI 모델의 편향성 검출 및 완화 기법에 대한 체계적 분석을 제공해주세요.",
        "실시간 데이터 스트리밍 시스템의 성능 최적화 전략을 제시해주세요.",
        "엣지 컴퓨팅 환경에서의 분산 학습 알고리즘 설계 방안을 연구해주세요.",
        "머신러닝 모델의 성능을 향상시키기 위한 앙상블 기법들의 비교 분석을 해주세요.",
        "빅데이터 처리에서 발생하는 데이터 품질 문제와 해결 방안을 제시해주세요.",
        "클라우드 네이티브 아키텍처의 보안 취약점과 대응 전략을 분석해주세요.",
        "사이버보안에서의 AI 활용과 적대적 공격에 대한 방어 메커니즘을 연구해주세요.",
        "메타버스 기술의 사회적 영향과 윤리적 고려사항을 종합적으로 분석해주세요.",
        "그린 AI 기술의 발전 현황과 지속가능한 컴퓨팅 방안을 연구해주세요.",
        "디지털 트윈 기술의 산업 응용과 미래 발전 방향을 탐구해주세요.",
        "6G 네트워크 기술의 혁신적 특성과 구현 과제를 분석해주세요.",
        "생체인식 기술의 보안 강화와 프라이버시 보호 방안을 연구해주세요.",
        "자율주행차의 윤리적 의사결정 알고리즘과 사회적 수용성 분석을 해주세요.",
        "AI 기반 의료 진단 시스템의 정확도 향상과 윤리적 고려사항을 연구해주세요.",
        "스마트 시티 기술의 데이터 통합과 시민 참여 방안을 분석해주세요.",
        "로봇공학의 인간-로봇 상호작용과 사회적 통합 방안을 탐구해주세요.",
        "AI 기반 교육 시스템의 개인화 학습과 교육 효과성 분석을 해주세요.",
        "블록체인 기반 공급망 관리의 투명성과 효율성 개선 방안을 연구해주세요.",
        "AI 기반 금융 서비스의 리스크 관리와 규제 준수 방안을 분석해주세요.",
        "가상현실 기술의 치료적 응용과 정신건강 개선 효과를 연구해주세요.",
        "AI 기반 창작 도구의 예술적 혁신과 저작권 보호 방안을 탐구해주세요.",
        "스마트 팩토리의 자동화 수준과 인간 노동의 미래를 분석해주세요.",
        "AI 기반 환경 모니터링 시스템의 정확도와 실시간 대응 방안을 연구해주세요.",
        "디지털 헬스케어의 데이터 보안과 환자 프라이버시 보호 방안을 분석해주세요.",
        "AI 기반 법률 서비스의 정확성과 윤리적 고려사항을 연구해주세요.",
        "스마트 에너지 그리드의 효율성과 안정성 향상 방안을 탐구해주세요.",
        "AI 기반 농업 기술의 지속가능성과 식량 안보 개선 방안을 분석해주세요.",
        "웨어러블 기술의 건강 모니터링과 데이터 보안 방안을 연구해주세요.",
        "AI 기반 번역 기술의 정확도 향상과 문화적 맥락 보존 방안을 탐구해주세요.",
        "스마트 홈 기술의 편의성과 보안 강화 방안을 분석해주세요.",
        "AI 기반 음성 인식의 다국어 지원과 방언 처리 방안을 연구해주세요.",
        "블록체인 기반 투표 시스템의 보안성과 투명성 보장 방안을 탐구해주세요.",
        "AI 기반 고객 서비스의 개인화와 감정 인식 정확도 향상 방안을 분석해주세요.",
        "스마트 모빌리티의 교통 효율성과 환경 영향 최소화 방안을 연구해주세요.",
        "AI 기반 재난 예측 시스템의 정확도와 조기 경보 체계 개선 방안을 탐구해주세요.",
        "디지털 화폐의 보안성과 금융 안정성 보장 방안을 분석해주세요.",
        "AI 기반 게임 개발의 창의성과 사용자 경험 향상 방안을 연구해주세요.",
        "스마트 리테일의 고객 경험 개선과 운영 효율성 향상 방안을 탐구해주세요.",
        "AI 기반 콘텐츠 추천 시스템의 개인화와 다양성 보장 방안을 분석해주세요.",
        "블록체인 기반 신원 인증의 보안성과 프라이버시 보호 방안을 연구해주세요.",
        "AI 기반 창작물 검색의 정확도와 저작권 보호 방안을 탐구해주세요.",
        "스마트 물류의 실시간 추적과 최적화 방안을 분석해주세요.",
        "AI 기반 감정 분석의 정확도와 윤리적 고려사항을 연구해주세요.",
        "디지털 아트의 창작 과정과 시장 가치 평가 방안을 탐구해주세요.",
        "AI 기반 음악 생성의 창의성과 저작권 보호 방안을 분석해주세요.",
        "스마트 건설의 안전성 향상과 프로젝트 관리 효율성 개선 방안을 연구해주세요.",
        "AI 기반 패션 디자인의 트렌드 예측과 지속가능성 향상 방안을 탐구해주세요.",
        "블록체인 기반 부동산 거래의 투명성과 효율성 개선 방안을 분석해주세요.",
        "AI 기반 뉴스 생성의 객관성과 사실 확인 방안을 연구해주세요.",
        "스마트 관광의 개인화 서비스와 지역 경제 활성화 방안을 탐구해주세요.",
        "AI 기반 언어 학습의 개인화와 문화적 맥락 이해 향상 방안을 분석해주세요.",
        "디지털 아카이브의 보존 기술과 접근성 향상 방안을 연구해주세요.",
        "AI 기반 스포츠 분석의 정확도와 선수 성과 향상 방안을 탐구해주세요.",
        "스마트 엔터테인먼트의 몰입감 향상과 사용자 경험 개선 방안을 분석해주세요.",
        "AI 기반 마케팅의 타겟팅 정확도와 윤리적 고려사항을 연구해주세요.",
        "블록체인 기반 자격증명의 신뢰성과 검증 효율성 향상 방안을 탐구해주세요.",
        "AI 기반 창작물 번역의 문화적 맥락 보존과 정확도 향상 방안을 분석해주세요.",
        "스마트 웰빙의 건강 관리와 예방 의학 발전 방안을 연구해주세요.",
        "AI 기반 재무 분석의 정확도와 리스크 관리 방안을 탐구해주세요.",
        "디지털 유산의 보존과 후손 전달 방안을 분석해주세요.",
        "AI 기반 창작물 검색의 정확도와 저작권 보호 방안을 연구해주세요.",
        "스마트 물류의 실시간 추적과 최적화 방안을 탐구해주세요.",
        "AI 기반 감정 분석의 정확도와 윤리적 고려사항을 분석해주세요.",
        "디지털 아트의 창작 과정과 시장 가치 평가 방안을 연구해주세요.",
        "AI 기반 음악 생성의 창의성과 저작권 보호 방안을 탐구해주세요.",
        "스마트 건설의 안전성 향상과 프로젝트 관리 효율성 개선 방안을 분석해주세요.",
        "AI 기반 패션 디자인의 트렌드 예측과 지속가능성 향상 방안을 연구해주세요.",
        "블록체인 기반 부동산 거래의 투명성과 효율성 개선 방안을 탐구해주세요.",
        "AI 기반 뉴스 생성의 객관성과 사실 확인 방안을 분석해주세요.",
        "스마트 관광의 개인화 서비스와 지역 경제 활성화 방안을 연구해주세요.",
        "AI 기반 언어 학습의 개인화와 문화적 맥락 이해 향상 방안을 탐구해주세요.",
        "디지털 아카이브의 보존 기술과 접근성 향상 방안을 분석해주세요.",
        "AI 기반 스포츠 분석의 정확도와 선수 성과 향상 방안을 연구해주세요.",
        "스마트 엔터테인먼트의 몰입감 향상과 사용자 경험 개선 방안을 탐구해주세요.",
        "AI 기반 마케팅의 타겟팅 정확도와 윤리적 고려사항을 분석해주세요.",
        "블록체인 기반 자격증명의 신뢰성과 검증 효율성 향상 방안을 연구해주세요.",
        "AI 기반 창작물 번역의 문화적 맥락 보존과 정확도 향상 방안을 탐구해주세요.",
        "스마트 웰빙의 건강 관리와 예방 의학 발전 방안을 분석해주세요.",
        "AI 기반 재무 분석의 정확도와 리스크 관리 방안을 연구해주세요.",
        "디지털 유산의 보존과 후손 전달 방안을 탐구해주세요."
    ];

    const complexityOptions = [
        { value: 'basic', label: '기초', icon: BookOpenIcon, description: '개념 설명' },
        { value: 'intermediate', label: '중급', icon: LightBulbIcon, description: '실용적 분석' },
        { value: 'advanced', label: '고급', icon: ChartBarIcon, description: '전문적 분석' },
        { value: 'expert', label: '전문가', icon: AcademicCapIcon, description: '전문가 수준' },
        { value: 'phd', label: '박사급', icon: CpuChipIcon, description: '최고 수준 분석' }
    ];

    const styleOptions = [
        { value: 'academic', label: '학술적', icon: AcademicCapIcon },
        { value: 'professional', label: '전문적', icon: DocumentTextIcon },
        { value: 'creative', label: '창의적', icon: SparklesIcon },
        { value: 'technical', label: '기술적', icon: CodeBracketIcon },
        { value: 'analytical', label: '분석적', icon: ChartBarIcon }
    ];

    const domains = [
        { value: 'general', label: '일반', icon: GlobeAltIcon },
        { value: 'technology', label: '기술', icon: CpuChipIcon },
        { value: 'science', label: '과학', icon: BeakerIcon },
        { value: 'business', label: '비즈니스', icon: ChartBarIcon },
        { value: 'health', label: '의료', icon: HeartIcon },
        { value: 'finance', label: '금융', icon: CalculatorIcon },
        { value: 'education', label: '교육', icon: AcademicCapIcon }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setInputValue(value);

        // 실시간 제안 생성
        if (value.length > 10) {
            const newSuggestions = generateSuggestions(value);
            setSuggestions(newSuggestions);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const generateSuggestions = (input: string): string[] => {
        // 간단한 제안 생성 로직
        const keywords = input.toLowerCase().split(' ');
        const suggestions = advancedSuggestions.filter(suggestion =>
            keywords.some(keyword => suggestion.toLowerCase().includes(keyword))
        );
        return suggestions.slice(0, 3);
    };

    const identifyDomain = (input: string): string => {
        const lowerInput = input.toLowerCase();
        if (lowerInput.includes('기술') || lowerInput.includes('ai') || lowerInput.includes('인공지능')) return 'technology';
        if (lowerInput.includes('과학') || lowerInput.includes('연구')) return 'science';
        if (lowerInput.includes('비즈니스') || lowerInput.includes('경영')) return 'business';
        if (lowerInput.includes('의료') || lowerInput.includes('건강')) return 'health';
        if (lowerInput.includes('금융') || lowerInput.includes('투자')) return 'finance';
        if (lowerInput.includes('교육') || lowerInput.includes('학습')) return 'education';
        return 'general';
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isProcessing) return;

        setIsProcessing(true);
        setProcessingProgress(0);
        setProcessingStep('입력 분석 중...');

        try {
            // 도메인 자동 감지
            const detectedDomain = identifyDomain(inputValue);
            if (detectedDomain !== selectedDomain) {
                setSelectedDomain(detectedDomain as any);
            }

            // 진행률 시뮬레이션
            const progressInterval = setInterval(() => {
                setProcessingProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 100);

            const request: ChatGPT5Request = {
                input: inputValue,
                context: {
                    conversationHistory: [],
                    userProfile: userProfile || {
                        expertise: ['general'],
                        education: 'phd',
                        experience: 10,
                        interests: ['research', 'analysis'],
                        communicationStyle: 'academic',
                        preferredComplexity: 'phd'
                    },
                    domain: selectedDomain,
                    complexity: selectedComplexity,
                    style: selectedStyle,
                    language: selectedLanguage
                },
                options: advancedOptions
            };

            setProcessingStep('AI 분석 수행 중...');
            const response = await chatGPT5LevelService.generatePhDLevelResponse(request);

            clearInterval(progressInterval);
            setProcessingProgress(100);
            setProcessingStep('완료!');

            // 응답 전달
            onAdvancedResponse(response);

            // 입력 초기화
            setInputValue('');
            setShowSuggestions(false);

        } catch (error) {
            console.error('Error generating response:', error);
            setProcessingStep('오류 발생');
        } finally {
            setTimeout(() => {
                setIsProcessing(false);
                setProcessingProgress(0);
                setProcessingStep('');
            }, 1000);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInputValue(suggestion);
        setShowSuggestions(false);
    };

    const handleAdvancedOptionChange = (option: keyof typeof advancedOptions) => {
        setAdvancedOptions(prev => ({
            ...prev,
            [option]: !prev[option]
        }));
    };

    return (
        <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
            {/* 고급 설정 패널 */}
            {showAdvancedFeatures && showAdvancedPanel && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4 shadow-sm">
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                            <CpuChipIcon className="w-5 h-5" />
                            박사급 AI 설정
                        </h3>
                        <button
                            onClick={() => setShowAdvancedPanel(false)}
                            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            title="닫기"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    </div>

                    {/* 복잡도 설정 */}
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">분석 복잡도</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {complexityOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setSelectedComplexity(option.value as any)}
                                    className={`flex flex-col items-center gap-1 p-3 border rounded-lg transition-all text-center ${selectedComplexity === option.value
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 bg-white hover:border-gray-400'
                                        }`}
                                >
                                    <option.icon className="w-4 h-4" />
                                    <span className="text-xs font-medium">{option.label}</span>
                                    <span className="text-xs text-gray-500">{option.description}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 스타일 및 도메인 설정 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">응답 스타일</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {styleOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setSelectedStyle(option.value as any)}
                                        className={`flex items-center gap-1.5 p-2 border rounded-md transition-all text-sm ${selectedStyle === option.value
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-300 bg-white hover:border-gray-400'
                                            }`}
                                    >
                                        <option.icon className="w-3 h-3" />
                                        <span>{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">도메인</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {domains.map((domain) => (
                                    <button
                                        key={domain.value}
                                        onClick={() => setSelectedDomain(domain.value)}
                                        className={`flex items-center gap-1.5 p-2 border rounded-md transition-all text-sm ${selectedDomain === domain.value
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-300 bg-white hover:border-gray-400'
                                            }`}
                                    >
                                        <domain.icon className="w-3 h-3" />
                                        <span>{domain.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 고급 옵션 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">고급 옵션</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {Object.entries(advancedOptions).map(([key, value]) => (
                                <label key={key} className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={() => handleAdvancedOptionChange(key as keyof typeof advancedOptions)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                        {key === 'includeAnalysis' && '심층 분석'}
                                        {key === 'includeSources' && '참고문헌'}
                                        {key === 'includeRecommendations' && '권장사항'}
                                        {key === 'includeVisualization' && '시각화'}
                                        {key === 'includeCode' && '코드 예제'}
                                        {key === 'includeMath' && '수학 공식'}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 메인 입력 영역 */}
            <div className="relative">
                {/* 제안 패널 */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute bottom-full left-0 right-0 bg-white border border-gray-200 rounded-lg mb-2 shadow-lg z-10">
                        <div className="flex items-center gap-1.5 p-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-700">
                            <LightBulbIcon className="w-3 h-3" />
                            제안사항
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="flex items-center gap-2 w-full p-3 border-none bg-none text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <DocumentTextIcon className="w-3 h-3 text-gray-400" />
                                    <span className="line-clamp-2">{suggestion}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 입력 필드 */}
                <div className="relative flex items-end gap-3 bg-white border-2 border-gray-200 rounded-xl p-4 transition-colors focus-within:border-blue-500">
                    <textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyPress}
                        placeholder={placeholder}
                        disabled={disabled || isProcessing}
                        className="flex-1 border-none outline-none resize-none text-sm leading-relaxed text-gray-900 bg-transparent min-h-6 max-h-32"
                        rows={1}
                    />

                    {/* 처리 중 오버레이 */}
                    {isProcessing && (
                        <div className="absolute inset-0 bg-white/90 rounded-xl flex items-center justify-center">
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                <div className="flex flex-col gap-1">
                                    <div className="text-xs font-medium text-gray-700">{processingStep}</div>
                                    <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-300"
                                            style={{ width: `${processingProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 고급 설정 버튼 */}
                    {showAdvancedFeatures && (
                        <button
                            onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}
                            className={`p-2 rounded-lg transition-colors ${showAdvancedPanel
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                }`}
                            title="고급 설정"
                        >
                            <CogIcon className="w-5 h-5" />
                        </button>
                    )}

                    {/* 전송 버튼 */}
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || disabled || isProcessing}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        title="전송"
                    >
                        <RocketLaunchIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* 현재 설정 표시 */}
                {showAdvancedFeatures && !showAdvancedPanel && (
                    <div className="flex gap-2 mt-2">
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
                            <CpuChipIcon className="w-3 h-3" />
                            <span>{complexityOptions.find(c => c.value === selectedComplexity)?.label}</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs">
                            <DocumentIcon className="w-3 h-3" />
                            <span>{styleOptions.find(s => s.value === selectedStyle)?.label}</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs">
                            <GlobeAltIcon className="w-3 h-3" />
                            <span>{domains.find(d => d.value === selectedDomain)?.label}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatGPT5LevelInput;
