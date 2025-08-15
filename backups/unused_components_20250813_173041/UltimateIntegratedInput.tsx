import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    PaperClipIcon,
    MicrophoneIcon,
    LightBulbIcon,
    AcademicCapIcon,
    ArrowUpIcon,
    CpuChipIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

type GenericMap = Record<string, unknown>;

interface UltimateIntegratedInputProps {
    onSendMessage: (message: string, context?: GenericMap) => void;
    onFileUpload?: (files: File[]) => void;
    onVoiceInput?: () => void;
    onAdvancedAnalysis?: (data: GenericMap) => void;
    onAutoLearning?: (data: GenericMap) => void;
    onKnowledgeExtraction?: (data: GenericMap) => void;
    placeholder?: string;
    isLoading?: boolean;
    disabled?: boolean;
    projectId?: string;
    roomId?: string;
}

interface AdvancedContext {
    complexity: 'basic' | 'intermediate' | 'advanced' | 'expert' | 'phd';
    domain: 'general' | 'academic' | 'technical' | 'creative' | 'analytical';
    style: 'conversational' | 'formal' | 'technical' | 'creative' | 'analytical';
    depth: 'surface' | 'moderate' | 'deep' | 'comprehensive' | 'exhaustive';
    output: 'text' | 'code' | 'analysis' | 'visualization' | 'multimodal';
}

interface IntegratedFeatures {
    autoLearning: boolean;
    knowledgeExtraction: boolean;
    deepLearning: boolean;
    semanticAnalysis: boolean;
    realTimeProcessing: boolean;
    multiModalInput: boolean;
    contextualUnderstanding: boolean;
    predictiveResponse: boolean;
}

const UltimateIntegratedInput: React.FC<UltimateIntegratedInputProps> = ({
    onSendMessage,
    onFileUpload,
    onVoiceInput,
    onAdvancedAnalysis,
    onAutoLearning,
    onKnowledgeExtraction,
            placeholder = "CORBU.AI와 고도화된 대화를 시작하세요. 모든 기능을 활용할 수 있습니다...",
    isLoading = false,
    disabled = false,
    projectId,
    roomId
}) => {
    const [message, setMessage] = useState('');
    // const [isExpanded, setIsExpanded] = useState(false);
    const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
    const [showFeaturePanel, setShowFeaturePanel] = useState(false);
    const [advancedContext, setAdvancedContext] = useState<AdvancedContext>({
        complexity: 'intermediate',
        domain: 'general',
        style: 'conversational',
        depth: 'moderate',
        output: 'text'
    });
    const [integratedFeatures, setIntegratedFeatures] = useState<IntegratedFeatures>({
        autoLearning: true,
        knowledgeExtraction: true,
        deepLearning: true,
        semanticAnalysis: true,
        realTimeProcessing: true,
        multiModalInput: true,
        contextualUnderstanding: true,
        predictiveResponse: true
    });
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [inputHistory, setInputHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [processingStatus, setProcessingStatus] = useState<string>('');

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 자동 높이 조절
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            const newHeight = Math.min(Math.max(scrollHeight, 56), 200);
            textareaRef.current.style.height = `${newHeight}px`;
        }
    }, [message]);

    // 통합 기능 실행
    const executeIntegratedFeatures = useCallback(async (text: string) => {
        setProcessingStatus('고도화된 기능들을 실행하고 있습니다...');

        try {
            const results: GenericMap = {};

            // 1. 자동 학습 시스템
            if (integratedFeatures.autoLearning) {
                try {
                    const learningResponse = await fetch('http://localhost:8000/api/v7/auto-learning', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            text: text,
                            project_id: projectId,
                            room_id: roomId
                        })
                    });
                    if (learningResponse.ok) {
                        results.autoLearning = await learningResponse.json();
                    }
                } catch (error) {
                    console.error('자동 학습 오류:', error);
                }
            }

            // 2. 지식 추출 시스템
            if (integratedFeatures.knowledgeExtraction) {
                try {
                    const extractionResponse = await fetch('http://localhost:8000/api/v7/knowledge-extraction', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            text: text,
                            project_id: projectId
                        })
                    });
                    if (extractionResponse.ok) {
                        results.knowledgeExtraction = await extractionResponse.json();
                    }

                    // 백엔드(8001) 지식 검색과도 연동하여 보강 결과 제공
                    try {
                        const url = new URL('http://localhost:8001/api/v1/search-knowledge');
                        url.searchParams.set('project_id', projectId || 'default');
                        url.searchParams.set('q', text.slice(0, 64));
                        const searchRes = await fetch(url.toString());
                        if (searchRes.ok) {
                            const searchJson = await searchRes.json();
                            results.knowledgeSearch = searchJson;
                        }
                    } catch (searchErr) {
                        console.error('지식 검색 연동 오류:', searchErr);
                    }
                } catch (error) {
                    console.error('지식 추출 오류:', error);
                }
            }

            // 3. 딥러닝 분석
            if (integratedFeatures.deepLearning) {
                try {
                    const deepLearningResponse = await fetch('http://localhost:8000/api/v7/deep-learning-analysis', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            text: text,
                            context: advancedContext
                        })
                    });
                    if (deepLearningResponse.ok) {
                        results.deepLearning = await deepLearningResponse.json();
                    }
                } catch (error) {
                    console.error('딥러닝 분석 오류:', error);
                }
            }

            // 4. 시맨틱 분석
            if (integratedFeatures.semanticAnalysis) {
                try {
                    const semanticResponse = await fetch('http://localhost:8000/api/v7/semantic-analysis', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            text: text,
                            features: integratedFeatures
                        })
                    });
                    if (semanticResponse.ok) {
                        results.semanticAnalysis = await semanticResponse.json();
                    }
                } catch (error) {
                    console.error('시맨틱 분석 오류:', error);
                }
            }

            // 5. 컨텍스트 이해
            if (integratedFeatures.contextualUnderstanding) {
                try {
                    const contextResponse = await fetch('http://localhost:8000/api/v7/contextual-understanding', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            text: text,
                            history: inputHistory.slice(0, 5)
                        })
                    });
                    if (contextResponse.ok) {
                        results.contextualUnderstanding = await contextResponse.json();
                    }
                } catch (error) {
                    console.error('컨텍스트 이해 오류:', error);
                }
            }

            // 6. 예측 응답
            if (integratedFeatures.predictiveResponse) {
                try {
                    const predictiveResponse = await fetch('http://localhost:8000/api/v7/predictive-response', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            text: text,
                            user_pattern: inputHistory
                        })
                    });
                    if (predictiveResponse.ok) {
                        results.predictiveResponse = await predictiveResponse.json();
                    }
                } catch (error) {
                    console.error('예측 응답 오류:', error);
                }
            }

            setProcessingStatus('고도화된 분석이 완료되었습니다!');

            // 결과를 콜백으로 전달
            if (onAdvancedAnalysis) {
                onAdvancedAnalysis(results);
            }

        } catch (error) {
            console.error('통합 기능 실행 오류:', error);
            setProcessingStatus('일부 기능 실행 중 오류가 발생했습니다.');
        }
    }, [integratedFeatures, advancedContext, inputHistory, projectId, roomId, onAdvancedAnalysis]);

    // 메시지 분석
    const analyzeMessage = useCallback(async (text: string) => {
        if (text.length < 10) return;

        setIsAnalyzing(true);
        try {
            // 복잡도 자동 감지
            const complexityPatterns = {
                basic: /기초|간단|쉬운|기본|초보/gi,
                intermediate: /중급|보통|일반|평균/gi,
                advanced: /고급|심화|전문|복잡/gi,
                expert: /전문가|박사|최고급|최첨단/gi,
                phd: /박사급|최고수준|최첨단|최고급|전문가급/gi
            };

            let detectedComplexity = 'intermediate';
            Object.entries(complexityPatterns).forEach(([level, pattern]) => {
                if (pattern.test(text)) {
                    detectedComplexity = level;
                }
            });

            // 도메인 감지
            const domainPatterns = {
                academic: /연구|논문|학술|이론|가설|실험/gi,
                technical: /코드|프로그래밍|알고리즘|시스템|기술/gi,
                creative: /창작|아이디어|디자인|예술|창의/gi,
                analytical: /분석|통계|데이터|조사|연구/gi
            };

            let detectedDomain = 'general';
            Object.entries(domainPatterns).forEach(([domain, pattern]) => {
                if (pattern.test(text)) {
                    detectedDomain = domain;
                }
            });

            // 스타일 감지
            const stylePatterns = {
                formal: /공식|정식|격식|공식적/gi,
                technical: /기술적|전문적|상세|정밀/gi,
                creative: /창의적|독창적|혁신적|새로운/gi,
                analytical: /분석적|논리적|체계적/gi
            };

            let detectedStyle = 'conversational';
            Object.entries(stylePatterns).forEach(([style, pattern]) => {
                if (pattern.test(text)) {
                    detectedStyle = style;
                }
            });

            // 깊이 감지
            const depthPatterns = {
                surface: /간단히|요약|개요/gi,
                moderate: /보통|일반적|적당히/gi,
                deep: /깊이|상세히|자세히/gi,
                comprehensive: /포괄적|전체적|종합적/gi,
                exhaustive: /완전히|철저히|모든/gi
            };

            let detectedDepth = 'moderate';
            Object.entries(depthPatterns).forEach(([depth, pattern]) => {
                if (pattern.test(text)) {
                    detectedDepth = depth;
                }
            });

            // 출력 형태 감지
            const outputPatterns = {
                code: /코드|프로그램|함수|클래스|알고리즘/gi,
                analysis: /분석|통계|차트|그래프/gi,
                visualization: /시각화|그래프|차트|표/gi,
                multimodal: /멀티미디어|이미지|동영상|음성/gi
            };

            let detectedOutput = 'text';
            Object.entries(outputPatterns).forEach(([output, pattern]) => {
                if (pattern.test(text)) {
                    detectedOutput = output;
                }
            });

            setAdvancedContext({
                complexity: detectedComplexity as AdvancedContext['complexity'],
                domain: detectedDomain as AdvancedContext['domain'],
                style: detectedStyle as AdvancedContext['style'],
                depth: detectedDepth as AdvancedContext['depth'],
                output: detectedOutput as AdvancedContext['output']
            });

            // 스마트 제안 생성
            generateSmartSuggestions(text, detectedComplexity, detectedDomain);

        } catch (error) {
            console.error('메시지 분석 오류:', error);
        } finally {
            setIsAnalyzing(false);
        }
    }, []);

    // 스마트 제안 생성 (함수 선언으로 호이스팅 보장)
    function generateSmartSuggestions(text: string, complexity: string, domain: string) {
        const next: string[] = [];

        if (complexity === 'phd' || complexity === 'expert') {
            next.push('더 구체적인 연구 방향을 제시해주세요');
            next.push('관련 논문이나 최신 연구 동향을 포함해주세요');
            next.push('방법론적 접근을 상세히 설명해주세요');
            next.push('고도화된 분석 기능을 활용해보세요');
        } else if (complexity === 'advanced') {
            next.push('전문적인 관점에서 분석해주세요');
            next.push('실무 적용 가능한 해결책을 제시해주세요');
            next.push('자동 학습 시스템을 활용해보세요');
        }

        if (domain === 'academic') {
            next.push('학술적 근거를 포함한 답변을 원합니다');
            next.push('관련 이론과 연구 동향을 포함해주세요');
            next.push('지식 추출 기능을 활성화해보세요');
        } else if (domain === 'technical') {
            next.push('기술적 구현 방법을 상세히 설명해주세요');
            next.push('코드 예시와 함께 설명해주세요');
            next.push('딥러닝 분석을 활용해보세요');
        }

        setSuggestions(next.slice(0, 3));
    }

    // 메시지 전송
    const handleSendMessage = useCallback(async () => {
        if (message.trim() && !isLoading) {
            const enrichedMessage = showAdvancedPanel ?
                `${message}\n\n[고도화된 분석 컨텍스트]\n복잡도: ${advancedContext.complexity}\n도메인: ${advancedContext.domain}\n스타일: ${advancedContext.style}\n깊이: ${advancedContext.depth}\n출력: ${advancedContext.output}\n활성화된 기능: ${Object.entries(integratedFeatures).filter(([_, enabled]) => enabled).map(([feature]) => feature).join(', ')}` :
                message;

            // 통합 기능 실행
            await executeIntegratedFeatures(message);

            onSendMessage(enrichedMessage, showAdvancedPanel ? { ...advancedContext, features: integratedFeatures } : undefined);

            // 메시지 초기화 및 UI 상태 리셋
            setMessage('');
            setShowAdvancedPanel(false);
            setShowFeaturePanel(false);
            setSuggestions([]);
            setProcessingStatus('');

            // 텍스트 영역 높이 강제 리셋
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = '56px';
            }

            // 히스토리에 추가
            setInputHistory(prev => [message.trim(), ...prev.slice(0, 9)]);
            setHistoryIndex(-1);
        }
    }, [message, isLoading, showAdvancedPanel, advancedContext, integratedFeatures, executeIntegratedFeatures, onSendMessage]);

    // 키보드 이벤트 처리
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        } else if (e.key === 'ArrowUp' && e.ctrlKey) {
            e.preventDefault();
            if (historyIndex < inputHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setMessage(inputHistory[newIndex]);
            }
        } else if (e.key === 'ArrowDown' && e.ctrlKey) {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setMessage(inputHistory[newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setMessage('');
            }
        }
    }, [handleSendMessage, historyIndex, inputHistory]);

    // 메시지 변경 시 자동 분석
    useEffect(() => {
        if (message.length > 20) {
            const timeoutId = setTimeout(() => {
                analyzeMessage(message);
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [message, analyzeMessage]);

    // 파일 업로드 처리
    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length > 0 && onFileUpload) {
            onFileUpload(files);
        }
    }, [onFileUpload]);

    // 음성 입력 처리
    const handleVoiceInput = useCallback(() => {
        if (onVoiceInput) {
            onVoiceInput();
        }
    }, [onVoiceInput]);

    return (
        <div className="relative w-full max-w-7xl mx-auto">
            {/* 고도화된 기능 패널 */}
            {showFeaturePanel && (
                <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-indigo-900 flex items-center">
                            <CpuChipIcon className="w-4 h-4 mr-2" />
                            고도화된 기능 설정
                        </h4>
                        <button
                            onClick={() => setShowFeaturePanel(false)}
                            className="text-indigo-600 hover:text-indigo-800"
                            title="패널 닫기"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        {Object.entries(integratedFeatures).map(([feature, enabled]) => (
                            <label key={feature} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={enabled}
                                    onChange={(e) => setIntegratedFeatures(prev => ({
                                        ...prev,
                                        [feature]: e.target.checked
                                    }))}
                                    className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-indigo-700 font-medium">
                                    {feature === 'autoLearning' && '자동 학습'}
                                    {feature === 'knowledgeExtraction' && '지식 추출'}
                                    {feature === 'deepLearning' && '딥러닝 분석'}
                                    {feature === 'semanticAnalysis' && '시맨틱 분석'}
                                    {feature === 'realTimeProcessing' && '실시간 처리'}
                                    {feature === 'multiModalInput' && '멀티모달 입력'}
                                    {feature === 'contextualUnderstanding' && '컨텍스트 이해'}
                                    {feature === 'predictiveResponse' && '예측 응답'}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* 박사급 분석 패널 */}
            {showAdvancedPanel && (
                <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-purple-900 flex items-center">
                            <AcademicCapIcon className="w-4 h-4 mr-2" />
                            박사급 분석 컨텍스트
                        </h4>
                        <button
                            onClick={() => setShowAdvancedPanel(false)}
                            className="text-purple-600 hover:text-purple-800"
                            title="패널 닫기"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                        <div>
                            <span className="font-medium text-purple-700">복잡도:</span>
                            <select
                                value={advancedContext.complexity}
                                onChange={(e) => setAdvancedContext(prev => ({ ...prev, complexity: e.target.value as AdvancedContext['complexity'] }))}
                                className="ml-1 px-2 py-1 border border-purple-200 rounded text-xs"
                                title="복잡도 선택"
                            >
                                <option value="basic">기초</option>
                                <option value="intermediate">중급</option>
                                <option value="advanced">고급</option>
                                <option value="expert">전문가</option>
                                <option value="phd">박사급</option>
                            </select>
                        </div>

                        <div>
                            <span className="font-medium text-purple-700">도메인:</span>
                            <select
                                value={advancedContext.domain}
                                onChange={(e) => setAdvancedContext(prev => ({ ...prev, domain: e.target.value as AdvancedContext['domain'] }))}
                                className="ml-1 px-2 py-1 border border-purple-200 rounded text-xs"
                                title="도메인 선택"
                            >
                                <option value="general">일반</option>
                                <option value="academic">학술</option>
                                <option value="technical">기술</option>
                                <option value="creative">창작</option>
                                <option value="analytical">분석</option>
                            </select>
                        </div>

                        <div>
                            <span className="font-medium text-purple-700">스타일:</span>
                            <select
                                value={advancedContext.style}
                                onChange={(e) => setAdvancedContext(prev => ({ ...prev, style: e.target.value as AdvancedContext['style'] }))}
                                className="ml-1 px-2 py-1 border border-purple-200 rounded text-xs"
                                title="스타일 선택"
                            >
                                <option value="conversational">대화형</option>
                                <option value="formal">공식</option>
                                <option value="technical">기술적</option>
                                <option value="creative">창의적</option>
                                <option value="analytical">분석적</option>
                            </select>
                        </div>

                        <div>
                            <span className="font-medium text-purple-700">깊이:</span>
                            <select
                                value={advancedContext.depth}
                                onChange={(e) => setAdvancedContext(prev => ({ ...prev, depth: e.target.value as AdvancedContext['depth'] }))}
                                className="ml-1 px-2 py-1 border border-purple-200 rounded text-xs"
                                title="깊이 선택"
                            >
                                <option value="surface">표면</option>
                                <option value="moderate">보통</option>
                                <option value="deep">깊이</option>
                                <option value="comprehensive">포괄적</option>
                                <option value="exhaustive">철저</option>
                            </select>
                        </div>

                        <div>
                            <span className="font-medium text-purple-700">출력:</span>
                            <select
                                value={advancedContext.output}
                                onChange={(e) => setAdvancedContext(prev => ({ ...prev, output: e.target.value as AdvancedContext['output'] }))}
                                className="ml-1 px-2 py-1 border border-purple-200 rounded text-xs"
                                title="출력 형태 선택"
                            >
                                <option value="text">텍스트</option>
                                <option value="code">코드</option>
                                <option value="analysis">분석</option>
                                <option value="visualization">시각화</option>
                                <option value="multimodal">멀티미디어</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* 스마트 제안 */}
            {suggestions.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-blue-900 flex items-center">
                            <LightBulbIcon className="w-4 h-4 mr-2" />
                            고도화된 제안
                        </h4>
                        <button
                            onClick={() => setSuggestions([])}
                            className="text-blue-600 hover:text-blue-800"
                            title="제안 닫기"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="space-y-2">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setMessage(suggestion);
                                    setSuggestions([]);
                                }}
                                className="block w-full text-left p-2 text-sm text-blue-800 hover:bg-blue-100 rounded transition-colors"
                            >
                                💡 {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 처리 상태 표시 */}
            {processingStatus && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center text-sm text-green-800">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                        {processingStatus}
                    </div>
                </div>
            )}

            {/* 메인 입력 인터페이스 */}
            <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 focus-within:border-indigo-500 focus-within:shadow-xl transition-all duration-300">
                <div className="flex items-end p-4 space-x-3">
                    {/* 파일 업로드 버튼 */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled}
                        className="flex-shrink-0 p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                        title="파일 업로드"
                    >
                        <PaperClipIcon className="w-5 h-5" />
                    </button>

                    {/* 텍스트 입력 영역 */}
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            disabled={disabled}
                            className="w-full resize-none border-0 outline-none text-gray-800 placeholder-gray-400 bg-transparent text-base leading-relaxed min-h-[56px] max-h-[200px]"
                            aria-label="메시지 입력"
                            rows={1}
                        />

                        {/* 문자 수 및 히스토리 인디케이터 */}
                        {message.length > 0 && (
                            <div className="absolute -bottom-1 right-0 text-xs text-gray-400">
                                {message.length}자
                                {historyIndex >= 0 && (
                                    <span className="ml-2 text-indigo-600">
                                        히스토리 {historyIndex + 1}/{inputHistory.length}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 기능 패널 버튼 */}
                    <button
                        onClick={() => setShowFeaturePanel(!showFeaturePanel)}
                        className={`flex-shrink-0 p-2 rounded-lg transition-colors ${showFeaturePanel
                            ? 'bg-indigo-100 text-indigo-600'
                            : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'
                            }`}
                        title="고도화된 기능 설정"
                    >
                        <CpuChipIcon className="w-5 h-5" />
                    </button>

                    {/* 고급 설정 버튼 */}
                    <button
                        onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}
                        className={`flex-shrink-0 p-2 rounded-lg transition-colors ${showAdvancedPanel
                            ? 'bg-purple-100 text-purple-600'
                            : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
                            }`}
                        title="박사급 설정"
                    >
                        <AcademicCapIcon className="w-5 h-5" />
                    </button>

                    {/* 음성 입력 버튼 */}
                    <button
                        onClick={handleVoiceInput}
                        disabled={disabled}
                        className="flex-shrink-0 p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                        title="음성 입력"
                    >
                        <MicrophoneIcon className="w-5 h-5" />
                    </button>

                    {/* 전송 버튼 */}
                    <button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || isLoading || disabled}
                        className={`flex-shrink-0 p-2 rounded-lg transition-all ${message.trim() && !isLoading && !disabled
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        title="메시지 전송 (Enter)"
                    >
                        <ArrowUpIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* 분석 중 인디케이터 */}
                {isAnalyzing && (
                    <div className="px-4 pb-3">
                        <div className="flex items-center text-xs text-indigo-600">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600 mr-2"></div>
                            고도화된 AI가 메시지를 분석하고 있습니다...
                        </div>
                    </div>
                )}

                {/* 키보드 단축키 힌트 */}
                <div className="px-4 pb-2">
                    <div className="text-xs text-gray-500">
                        Enter: 전송 | Shift+Enter: 줄바꿈 | Ctrl+↑/↓: 히스토리 | 모든 고도화된 기능을 활용하세요
                    </div>
                </div>
            </div>

            {/* 숨겨진 파일 입력 */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                aria-label="파일 선택"
                title="파일 선택"
            />
        </div>
    );
};

export default UltimateIntegratedInput;
