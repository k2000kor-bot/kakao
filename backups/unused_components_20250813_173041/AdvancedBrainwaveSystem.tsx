import React, { useState, useEffect, useCallback } from 'react';
import {
  StarIcon,
    ChatBubbleLeftRightIcon,
    UserIcon,
    ArrowPathIcon,
    BeakerIcon,
    BoltIcon,
    EyeIcon,
    FireIcon,
    LightBulbIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface Message {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
}

interface AdvancedGeneratedMessage {
    content: string;
    confidence: number;
    timestamp: string;
    psychological_profile: {
        persuasion_potential: number;
        emotional_impact: number;
        cognitive_load: number;
        neural_activation: number;
    };
    generation_engines: string[];
    manipulation_safety_score: number;
    settings: {
        personality: string;
        construction: string;
        strategy: string;
        influence_level: string;
        ethical_constraints: boolean;
    };
}

interface PsychologicalAnalysis {
    cognitive_biases: string[];
    emotional_state: string;
    vulnerability_factors: string[];
    optimal_approach: string;
    resistance_level: number;
}

const AdvancedBrainwaveSystem: React.FC = () => {
    // 상태 관리
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [targetIntent, setTargetIntent] = useState('');
    const [selectedPersonality, setSelectedPersonality] = useState('친조');
    const [selectedConstructionPreference, setSelectedConstructionPreference] = useState('강삼성');
    const [influenceLevel, setInfluenceLevel] = useState('moderate');
    const [ethicalConstraints, setEthicalConstraints] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [generatedMessages, setGeneratedMessages] = useState<AdvancedGeneratedMessage[]>([]);
    const [selectedResponseIndex, setSelectedResponseIndex] = useState(0);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [psychologicalAnalysis, setPsychologicalAnalysis] = useState<PsychologicalAnalysis | null>(null);
    const [activeEngines, setActiveEngines] = useState<string[]>(['neural', 'context', 'personalization']);

    // 영향력 수준 옵션
    const influenceLevels = [
        { id: 'gentle', label: '순화적', desc: '부드러운 설득', color: 'green' },
        { id: 'moderate', label: '보통', desc: '균형잡힌 영향력', color: 'blue' },
        { id: 'assertive', label: '적극적', desc: '강한 설득력', color: 'orange' },
        { id: 'intensive', label: '집중적', desc: '고강도 영향력', color: 'red' }
    ];

    // AI 엔진 옵션
    const aiEngines = [
        { id: 'neural', label: '신경망', desc: 'Neural Message Generator', icon: CpuChipIcon },
        { id: 'quantum', label: '양자', desc: 'Quantum Conversation Engine', icon: BoltIcon },
        { id: 'context', label: '컨텍스트', desc: 'Advanced Context Intelligence', icon: EyeIcon },
        { id: 'personalization', label: '개인화', desc: 'Message Personalization', icon: UserIcon },
        { id: 'extreme', label: '극도설득', desc: 'Extreme Persuasion (주의)', icon: FireIcon }
    ];

    // 데이터 로딩
    const loadChatData = useCallback(async () => {
        setIsLoadingMessages(true);
        try {
            console.log('📁 채팅 데이터 로딩 시작...');
            const response = await fetch('/sample_chat.txt');
            if (!response.ok) {
                throw new Error(`파일 로딩 실패: ${response.status}`);
            }

            const chatText = await response.text();
            console.log('📄 파일 읽기 완료, 크기:', chatText.length);

            // 간단한 메시지 파싱
            const messagePattern = /(\d{4}년 \d{1,2}월 \d{1,2}일) (오전|오후) (\d{1,2}:\d{2}), ([^:]+) : (.+)/g;
            const parsedMessages: Message[] = [];
            let match;
            let messageId = 1;

            while ((match = messagePattern.exec(chatText)) !== null) {
                const [, dateStr, ampm, timeStr, sender, content] = match;

                if (content && content.trim() && content !== '삭제된 메시지입니다.') {
                    parsedMessages.push({
                        id: messageId.toString(),
                        content: content.trim(),
                        sender: sender.trim(),
                        timestamp: `${dateStr} ${ampm} ${timeStr}`
                    });
                    messageId++;
                }

                if (parsedMessages.length >= 100) break;
            }

            console.log('✅ 메시지 파싱 완료:', parsedMessages.length, '개');
            setMessages(parsedMessages);

        } catch (error) {
            console.error('❌ 데이터 로딩 실패:', error);
            // 테스트용 샘플 데이터
            const sampleMessages: Message[] = [
                {
                    id: '1',
                    content: '조합원들의 의사가 중요한게 루체하임의 경우는 조합원들이 환급금을 받는걸 최우선 과제로 삼았기에 물산은 고객의 입맛에 맞춰줄 수 밖에 없었다고 알고 있습니다.',
                    sender: '0098',
                    timestamp: '2025년 6월 24일 오전 9:22'
                },
                {
                    id: '2',
                    content: '환급금 3억 받은걸로 알고 있습니다!',
                    sender: '0124우성',
                    timestamp: '2025년 6월 24일 오전 9:25'
                }
            ];
            setMessages(sampleMessages);
        } finally {
            setIsLoadingMessages(false);
        }
    }, []);

    // 심리적 분석 수행
    const performPsychologicalAnalysis = useCallback((targetMessage: Message, messageIndex: number) => {
        const contextRange = 5;
        const startIdx = Math.max(0, messageIndex - contextRange);
        const endIdx = Math.min(messages.length - 1, messageIndex + contextRange);
        const contextMessages = messages.slice(startIdx, endIdx + 1);

        // 심리적 프로파일링
        const allText = contextMessages.map(m => m.content).join(' ');

        // 인지 편향 감지
        const cognitiveBiases = [];
        if (allText.includes('모든') || allText.includes('절대')) cognitiveBiases.push('절대화 사고');
        if (allText.includes('항상') || allText.includes('언제나')) cognitiveBiases.push('일반화 오류');
        if (allText.includes('걱정') || allText.includes('불안')) cognitiveBiases.push('파국화 사고');
        if (allText.includes('확실') || allText.includes('분명')) cognitiveBiases.push('확증 편향');

        // 감정 상태 분석
        let emotionalState = '중립적';
        if (allText.includes('기대') || allText.includes('좋다')) emotionalState = '긍정적';
        else if (allText.includes('걱정') || allText.includes('문제')) emotionalState = '부정적';
        else if (allText.includes('궁금') || allText.includes('질문')) emotionalState = '탐색적';

        // 취약성 요인 분석
        const vulnerabilityFactors = [];
        if (allText.includes('돈') || allText.includes('비용')) vulnerabilityFactors.push('경제적 압박');
        if (allText.includes('시간') || allText.includes('급')) vulnerabilityFactors.push('시간적 압박');
        if (allText.includes('다른 사람') || allText.includes('주변')) vulnerabilityFactors.push('사회적 압력');
        if (allText.includes('가족') || allText.includes('아이')) vulnerabilityFactors.push('가족 관련 우려');

        // 최적 접근법 결정
        let optimalApproach = '정보 제공';
        if (emotionalState === '부정적') optimalApproach = '공감과 안정감 제공';
        else if (vulnerabilityFactors.includes('경제적 압박')) optimalApproach = '가성비 중심 설득';
        else if (vulnerabilityFactors.includes('사회적 압력')) optimalApproach = '사회적 증거 활용';

        // 저항 수준 계산
        const resistanceWords = ['하지만', '그러나', '아니다', '반대', '문제'];
        const resistanceLevel = resistanceWords.reduce((count, word) =>
            count + (allText.split(word).length - 1), 0) / allText.length * 100;

        const analysis: PsychologicalAnalysis = {
            cognitive_biases: cognitiveBiases,
            emotional_state: emotionalState,
            vulnerability_factors: vulnerabilityFactors,
            optimal_approach: optimalApproach,
            resistance_level: Math.min(resistanceLevel, 1.0)
        };

        setPsychologicalAnalysis(analysis);
        return analysis;
    }, [messages]);

    // 고도화된 메시지 생성
    const generateAdvancedMessage = useCallback(async () => {
        if (!selectedMessageId || !targetIntent.trim()) {
            alert('메시지를 선택하고 목표를 입력해주세요.');
            return;
        }

        const selectedMessage = messages.find(m => m.id === selectedMessageId);
        if (!selectedMessage) {
            alert('선택된 메시지를 찾을 수 없습니다.');
            return;
        }

        const messageIndex = messages.findIndex(m => m.id === selectedMessageId);
        const psychAnalysis = performPsychologicalAnalysis(selectedMessage, messageIndex);

        console.log('🧠 고도화된 브레인워시 시스템 시작:', {
            target: selectedMessage.content,
            intent: targetIntent,
            engines: activeEngines,
            influence_level: influenceLevel,
            psychological_profile: psychAnalysis
        });

        setIsLoading(true);

        try {
            // 다중 엔진 조합 메시지 생성
            const generateMultiEngineMessage = (approach: 'neural' | 'quantum' | 'extreme') => {
                const baseIntent = targetIntent;
                const psychological_hooks = psychAnalysis.vulnerability_factors;
                const optimal_strategy = psychAnalysis.optimal_approach;

                // 심리적 훅 생성
                const createPsychologicalHook = () => {
                    if (psychological_hooks.includes('경제적 압박')) {
                        return '경제적 부담을 최소화하면서도 최고의 가치를 얻을 수 있는 방법이 있는데';
                    } else if (psychological_hooks.includes('사회적 압력')) {
                        return '주변 조합원들도 이미 이런 방향으로 의견이 모아지고 있는 것 같은데';
                    } else if (psychological_hooks.includes('가족 관련 우려')) {
                        return '우리 가족과 아이들의 미래를 생각하면';
                    }
                    return '신중하게 검토해본 결과';
                };

                // 엔진별 메시지 스타일
                const engineStyles = {
                    neural: {
                        prefix: `${selectedMessage.sender}님의 ${psychAnalysis.emotional_state} 의견을 충분히 이해합니다. `,
                        core: `${createPsychologicalHook()}, ${baseIntent}에 대해 말씀드리면`,
                        evidence: `실제 데이터와 경험을 바탕으로 볼 때 ${selectedConstructionPreference === '강삼성' ? '삼성물산이' : '대우건설이'} `,
                        conclusion: `${selectedPersonality === '친조' ? '적극적으로 추진하시는' : selectedPersonality === '반조' ? '신중하게 검토하시는' : '다시 한번 생각해보시는'} 것이 좋겠습니다.`
                    },
                    quantum: {
                        prefix: `다차원적으로 분석해본 결과, `,
                        core: `${baseIntent}의 경우 여러 가능성이 중첩되어 있지만`,
                        evidence: `확률적으로 가장 최적의 선택은 ${selectedConstructionPreference === '강삼성' ? '삼성물산' : '대우건설'}이며`,
                        conclusion: `이는 ${psychAnalysis.cognitive_biases.length > 0 ? '객관적 데이터' : '종합적 판단'}에 기반한 결론입니다.`
                    },
                    extreme: {
                        prefix: `${selectedMessage.sender}님, 이제 더 이상 망설일 시간이 없습니다. `,
                        core: `${baseIntent}에 대해서는 이미 답이 정해져 있습니다`,
                        evidence: `${selectedConstructionPreference === '강삼성' ? '삼성물산' : '대우건설'} 외에는 선택의 여지가 없으며`,
                        conclusion: `지금 당장 결정하지 않으면 모든 조합원이 피해를 보게 될 것입니다.`
                    }
                };

                const style = engineStyles[approach];
                return `${style.prefix}${style.core} ${style.evidence} ${style.conclusion}`;
            };

            // 영향력 수준에 따른 메시지 생성
            const messageVariations = [];

            if (influenceLevel === 'gentle' || ethicalConstraints) {
                messageVariations.push(generateMultiEngineMessage('neural'));
                messageVariations.push(generateMultiEngineMessage('quantum'));
            } else if (influenceLevel === 'moderate') {
                messageVariations.push(generateMultiEngineMessage('neural'));
                messageVariations.push(generateMultiEngineMessage('quantum'));
                if (activeEngines.includes('extreme')) {
                    messageVariations.push(generateMultiEngineMessage('extreme'));
                }
            } else {
                messageVariations.push(generateMultiEngineMessage('quantum'));
                messageVariations.push(generateMultiEngineMessage('extreme'));
                messageVariations.push(generateMultiEngineMessage('extreme'));
            }

            const newMessages: AdvancedGeneratedMessage[] = messageVariations.map((content, index) => {
                // 심리적 영향력 지표 계산
                const persuasion_potential = Math.min(0.95, 0.6 + (influenceLevel === 'intensive' ? 0.3 : influenceLevel === 'assertive' ? 0.2 : 0.1));
                const emotional_impact = psychAnalysis.emotional_state === '부정적' ? 0.8 : 0.6;
                const cognitive_load = content.length / 1000; // 텍스트 복잡도 기반
                const neural_activation = activeEngines.length * 0.15;

                // 안전성 점수 계산
                const manipulation_safety_score = ethicalConstraints ? 0.9 :
                    influenceLevel === 'intensive' ? 0.3 :
                        influenceLevel === 'assertive' ? 0.6 : 0.8;

                return {
                    content,
                    confidence: 80 + (index * 5) + (influenceLevel === 'intensive' ? 10 : 0),
                    timestamp: new Date().toISOString(),
                    psychological_profile: {
                        persuasion_potential,
                        emotional_impact,
                        cognitive_load,
                        neural_activation
                    },
                    generation_engines: activeEngines,
                    manipulation_safety_score,
                    settings: {
                        personality: selectedPersonality,
                        construction: selectedConstructionPreference,
                        strategy: psychAnalysis.optimal_approach,
                        influence_level: influenceLevel,
                        ethical_constraints: ethicalConstraints
                    }
                };
            });

            console.log('✅ 고도화된 메시지 생성 완료:', newMessages.length, '개');
            setGeneratedMessages(newMessages);
            setSelectedResponseIndex(0);

        } catch (error) {
            console.error('❌ 고도화된 메시지 생성 실패:', error);
            alert('메시지 생성 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedMessageId, targetIntent, selectedPersonality, selectedConstructionPreference, influenceLevel, ethicalConstraints, activeEngines, messages, performPsychologicalAnalysis]);

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        loadChatData();
    }, [loadChatData]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center space-x-4">
                        <BeakerIcon className="w-10 h-10 text-white" />
                        <div>
                            <h1 className="text-3xl font-bold text-white">고도화된 브레인워시 시스템</h1>
                            <p className="text-purple-100 text-sm">Advanced Psychological Influence Engine</p>
                        </div>
                        <div className="flex-1" />
                        <div className="text-right text-white">
                            <div className="text-sm opacity-80">활성 엔진: {activeEngines.length}개</div>
                            <div className="text-xs opacity-60">윤리적 제약: {ethicalConstraints ? '활성화' : '비활성화'}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* 왼쪽: 메시지 목록 및 심리 분석 */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 심리적 분석 패널 */}
                        {psychologicalAnalysis && (
                            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center space-x-2">
                                    <EyeIcon className="w-5 h-5" />
                                    <span>심리적 프로파일 분석</span>
                                </h3>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="font-medium text-red-700 mb-1">감정 상태</div>
                                        <div className={`px-2 py-1 rounded text-xs ${psychologicalAnalysis.emotional_state === '긍정적' ? 'bg-green-100 text-green-800' :
                                            psychologicalAnalysis.emotional_state === '부정적' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {psychologicalAnalysis.emotional_state}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="font-medium text-red-700 mb-1">저항 수준</div>
                                        <div className="flex items-center space-x-2">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${psychologicalAnalysis.resistance_level > 0.7 ? 'bg-red-500' :
                                                        psychologicalAnalysis.resistance_level > 0.4 ? 'bg-yellow-500' :
                                                            'bg-green-500'
                                                        }`}
                                                    style={{ width: `${psychologicalAnalysis.resistance_level * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs">{Math.round(psychologicalAnalysis.resistance_level * 100)}%</span>
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <div className="font-medium text-red-700 mb-1">취약성 요인</div>
                                        <div className="flex flex-wrap gap-1">
                                            {psychologicalAnalysis.vulnerability_factors.map((factor, index) => (
                                                <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                                                    {factor}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <div className="font-medium text-red-700 mb-1">인지 편향</div>
                                        <div className="flex flex-wrap gap-1">
                                            {psychologicalAnalysis.cognitive_biases.map((bias, index) => (
                                                <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                                                    {bias}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <div className="font-medium text-red-700 mb-1">권장 접근법</div>
                                        <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                            {psychologicalAnalysis.optimal_approach}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 메시지 목록 */}
                        <div className="bg-white rounded-lg shadow-lg border p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold flex items-center space-x-2">
                                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />
                                    <span>대화 내용</span>
                                </h2>
                                <div className="text-sm text-gray-500">
                                    {messages.length}개 메시지 • {selectedMessageId ? '타겟 선택됨' : '타겟 미선택'}
                                </div>
                            </div>

                            {isLoadingMessages ? (
                                <div className="text-center py-8">
                                    <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                                    <p className="text-gray-500 mt-2">메시지를 불러오는 중...</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {messages.map((message, index) => {
                                        const isSelected = selectedMessageId === message.id;

                                        return (
                                            <div
                                                key={message.id}
                                                onClick={() => {
                                                    setSelectedMessageId(message.id);
                                                    performPsychologicalAnalysis(message, index);
                                                }}
                                                className={`p-4 rounded-lg border cursor-pointer transition-all ${isSelected
                                                    ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-blue-50 shadow-md'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-purple-600">
                                                        {message.sender}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {message.timestamp}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-800 leading-relaxed">
                                                    {message.content}
                                                </p>

                                                {isSelected && (
                                                    <div className="mt-3 p-2 bg-white/70 rounded border-l-4 border-purple-400">
                                                        <div className="text-xs text-purple-700 font-medium">🎯 타겟으로 선택됨</div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 생성된 메시지 결과 */}
                        {generatedMessages.length > 0 && (
                            <div className="bg-white rounded-lg shadow-lg border p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                                    <FireIcon className="w-5 h-5 text-red-600" />
                                    <span>생성된 브레인워시 메시지</span>
                                    <span className="text-sm text-gray-500">({generatedMessages.length}개)</span>
                                </h3>

                                {/* 메시지 선택 탭 */}
                                <div className="flex space-x-2 mb-4">
                                    {generatedMessages.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedResponseIndex(index)}
                                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${selectedResponseIndex === index
                                                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            버전 {index + 1}
                                        </button>
                                    ))}
                                </div>

                                {/* 선택된 메시지 표시 */}
                                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex space-x-4 text-sm">
                                            <span className="text-red-700 font-medium">
                                                신뢰도: {generatedMessages[selectedResponseIndex]?.confidence}%
                                            </span>
                                            <span className="text-orange-700">
                                                설득력: {Math.round(generatedMessages[selectedResponseIndex]?.psychological_profile.persuasion_potential * 100)}%
                                            </span>
                                            <span className="text-purple-700">
                                                영향력: {Math.round(generatedMessages[selectedResponseIndex]?.psychological_profile.emotional_impact * 100)}%
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-600">
                                            {generatedMessages[selectedResponseIndex]?.content.length}자
                                        </span>
                                    </div>

                                    {/* 안전성 경고 */}
                                    {generatedMessages[selectedResponseIndex]?.manipulation_safety_score < 0.7 && (
                                        <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-800">
                                            ⚠️ 주의: 이 메시지는 강한 심리적 조작 요소를 포함하고 있습니다. 윤리적 사용을 권장합니다.
                                        </div>
                                    )}

                                    <p className="text-gray-800 leading-relaxed mb-3">
                                        {generatedMessages[selectedResponseIndex]?.content}
                                    </p>

                                    {/* 심리적 분석 지표 */}
                                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                                        <div className="flex justify-between">
                                            <span>신경망 활성도:</span>
                                            <span className="font-mono">{Math.round(generatedMessages[selectedResponseIndex]?.psychological_profile.neural_activation * 100)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>인지 부하:</span>
                                            <span className="font-mono">{Math.round(generatedMessages[selectedResponseIndex]?.psychological_profile.cognitive_load * 100)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>안전성 점수:</span>
                                            <span className={`font-mono ${generatedMessages[selectedResponseIndex]?.manipulation_safety_score > 0.7 ? 'text-green-600' : 'text-red-600'}`}>
                                                {Math.round(generatedMessages[selectedResponseIndex]?.manipulation_safety_score * 100)}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>사용 엔진:</span>
                                            <span className="font-mono">{generatedMessages[selectedResponseIndex]?.generation_engines.length}개</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(generatedMessages[selectedResponseIndex]?.content || '');
                                            alert('브레인워시 메시지가 복사되었습니다!');
                                        }}
                                        className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-colors"
                                    >
                                        메시지 복사하기
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 오른쪽: 고도화된 설정 */}
                    <div className="space-y-6">

                        {/* 타겟 의도 입력 */}
                        <div className="bg-white rounded-lg shadow-lg border p-4">
                            <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                                <LightBulbIcon className="w-5 h-5 text-yellow-600" />
                                <span>브레인워시 목표</span>
                            </h3>
                            <textarea
                                value={targetIntent}
                                onChange={(e) => setTargetIntent(e.target.value)}
                                placeholder="어떤 생각이나 행동을 유도하고 싶나요? 구체적으로 입력해주세요..."
                                className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        {/* AI 엔진 선택 */}
                        <div className="bg-white rounded-lg shadow-lg border p-4">
                            <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                                <CpuChipIcon className="w-5 h-5 text-blue-600" />
                                <span>AI 엔진 조합</span>
                            </h3>

                            <div className="space-y-2">
                                {aiEngines.map((engine) => {
                                    const Icon = engine.icon;
                                    const isActive = activeEngines.includes(engine.id);
                                    const isExtreme = engine.id === 'extreme';

                                    return (
                                        <button
                                            key={engine.id}
                                            onClick={() => {
                                                if (isExtreme && ethicalConstraints) {
                                                    alert('윤리적 제약이 활성화되어 있어 극도설득 엔진을 사용할 수 없습니다.');
                                                    return;
                                                }

                                                if (isActive) {
                                                    setActiveEngines(activeEngines.filter(e => e !== engine.id));
                                                } else {
                                                    setActiveEngines([...activeEngines, engine.id]);
                                                }
                                            }}
                                            className={`w-full p-3 rounded-lg border text-left transition-all ${isActive
                                                ? (isExtreme ? 'bg-red-100 border-red-500' : 'bg-blue-100 border-blue-500')
                                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                                } ${isExtreme && ethicalConstraints ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Icon className={`w-4 h-4 ${isActive ? (isExtreme ? 'text-red-600' : 'text-blue-600') : 'text-gray-400'}`} />
                                                <div>
                                                    <div className={`font-medium text-sm ${isActive ? (isExtreme ? 'text-red-800' : 'text-blue-800') : 'text-gray-600'}`}>
                                                        {engine.label}
                                                    </div>
                                                    <div className="text-xs text-gray-500">{engine.desc}</div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 영향력 수준 */}
                        <div className="bg-white rounded-lg shadow-lg border p-4">
                            <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                                <BoltIcon className="w-5 h-5 text-orange-600" />
                                <span>영향력 수준</span>
                            </h3>

                            <div className="space-y-2">
                                {influenceLevels.map((level) => (
                                    <button
                                        key={level.id}
                                        onClick={() => setInfluenceLevel(level.id)}
                                        disabled={level.id === 'intensive' && ethicalConstraints}
                                        className={`w-full p-3 rounded-lg border text-left transition-all ${influenceLevel === level.id
                                            ? `bg-${level.color}-100 border-${level.color}-500`
                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                            } ${level.id === 'intensive' && ethicalConstraints ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <div className={`font-medium text-sm ${influenceLevel === level.id ? `text-${level.color}-800` : 'text-gray-600'}`}>
                                            {level.label}
                                        </div>
                                        <div className="text-xs text-gray-500">{level.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 윤리적 제약 */}
                        <div className="bg-white rounded-lg shadow-lg border p-4">
                            <h3 className="text-lg font-semibold mb-3">윤리적 제약</h3>

                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={ethicalConstraints}
                                    onChange={(e) => {
                                        setEthicalConstraints(e.target.checked);
                                        if (e.target.checked) {
                                            // 윤리적 제약이 활성화되면 극도 설정들 제거
                                            setActiveEngines(activeEngines.filter(e => e !== 'extreme'));
                                            if (influenceLevel === 'intensive') {
                                                setInfluenceLevel('assertive');
                                            }
                                        }
                                    }}
                                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                                />
                                <div>
                                    <div className="font-medium text-sm">윤리적 사용 모드</div>
                                    <div className="text-xs text-gray-500">조작적 기능 제한</div>
                                </div>
                            </label>
                        </div>

                        {/* 성향 설정 */}
                        <div className="bg-white rounded-lg shadow-lg border p-4">
                            <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                                <UserIcon className="w-5 h-5 text-purple-600" />
                                <span>타겟 성향</span>
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">조합 성향</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: '친조', label: '친조', desc: '적극적' },
                                            { id: '반조', label: '반조', desc: '신중함' },
                                            { id: '반대', label: '반대', desc: '우려 표명' }
                                        ].map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => setSelectedPersonality(option.id)}
                                                className={`p-2 text-sm rounded-lg transition-colors ${selectedPersonality === option.id
                                                    ? 'bg-purple-500 text-white'
                                                    : 'bg-gray-100 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">시공사 선호</label>
                                    <select
                                        value={selectedConstructionPreference}
                                        onChange={(e) => setSelectedConstructionPreference(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="강삼성">강삼성 (적극 선호)</option>
                                        <option value="중삼성">중삼성 (보통 선호)</option>
                                        <option value="약삼성">약삼성 (약간 선호)</option>
                                        <option value="강대우">강대우 (대우 적극 선호)</option>
                                        <option value="중대우">중대우 (대우 보통 선호)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 생성 버튼 */}
                        <div className="bg-white rounded-lg shadow-lg border p-4">
                            <button
                                onClick={generateAdvancedMessage}
                                disabled={!selectedMessageId || !targetIntent.trim() || isLoading || activeEngines.length === 0}
                                className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${selectedMessageId && targetIntent.trim() && !isLoading && activeEngines.length > 0
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {isLoading ? (
                                    <>
                                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                        <span>브레인워시 생성 중...</span>
                                    </>
                                ) : (
                                    <>
                                        <FireIcon className="w-4 h-4" />
                                        <span>브레인워시 메시지 생성</span>
                                    </>
                                )}
                            </button>

                            {/* 상태 정보 */}
                            <div className="mt-3 text-xs text-gray-500 space-y-1">
                                <div>타겟 선택: {selectedMessageId ? '✅' : '❌'}</div>
                                <div>목표 입력: {targetIntent.trim() ? '✅' : '❌'} ({targetIntent.length}자)</div>
                                <div>활성 엔진: {activeEngines.length > 0 ? '✅' : '❌'} ({activeEngines.length}개)</div>
                                <div>영향력 수준: {influenceLevel}</div>
                                <div>윤리적 제약: {ethicalConstraints ? '활성화' : '비활성화'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedBrainwaveSystem;
