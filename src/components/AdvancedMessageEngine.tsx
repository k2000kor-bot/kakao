import React, { useState, useEffect } from 'react';
import {
  StarIcon,
    DocumentTextIcon,
    ChatBubbleLeftRightIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

interface MessageContext {
    sender: string;
    content: string;
    sentiment: string;
    timestamp: string;
    keywords: string[];
    urgency: 'low' | 'medium' | 'high';
}

interface GenerationStrategy {
    id: string;
    name: string;
    description: string;
    tone: string;
    approach: string;
    examples: string[];
}

interface GeneratedMessage {
    id: string;
    content: string;
    confidence: number;
    strategy: string;
    reasoning: string;
    alternatives: string[];
    waitTime: number;
    tone: string;
}

const AdvancedMessageEngine: React.FC = () => {
    const [selectedContext, setSelectedContext] = useState<MessageContext | null>(null);
    const [selectedStrategy, setSelectedStrategy] = useState<string>('');
    const [generatedMessage, setGeneratedMessage] = useState<GeneratedMessage | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationHistory, setGenerationHistory] = useState<GeneratedMessage[]>([]);

    const strategies: GenerationStrategy[] = [
        {
            id: 'logical_rebuttal',
            name: '논리적 반박',
            description: '데이터와 근거를 바탕으로 논리적 대응',
            tone: '전문적이고 객관적',
            approach: '사실 기반 논리적 설명',
            examples: [
                '재개발 사업의 경제적 효과를 구체적인 수치로 설명',
                '법적 근거를 제시하여 우려사항 해소',
                '성공 사례를 통한 신뢰도 향상'
            ]
        },
        {
            id: 'information_provision',
            name: '정보 제공',
            description: '유용한 정보와 지식을 공유',
            tone: '도움이 되고 교육적',
            approach: '실용적인 정보 전달',
            examples: [
                '재개발 과정의 단계별 설명',
                '투명한 정보 공개로 신뢰 구축',
                '조합원 혜택의 구체적 설명'
            ]
        },
        {
            id: 'emotion_avoidance',
            name: '감정 회피',
            description: '감정적 대립을 피하고 중립적 접근',
            tone: '차분하고 균형잡힌',
            approach: '감정적 요소 최소화',
            examples: [
                '객관적 사실에 집중한 설명',
                '감정적 표현 대신 논리적 접근',
                '상호 이해를 위한 중립적 입장'
            ]
        },
        {
            id: 'short_answer',
            name: '단답 강조',
            description: '간결하고 명확한 메시지',
            tone: '명확하고 직접적',
            approach: '핵심만 간결하게 전달',
            examples: [
                '핵심 정보만 간결하게 전달',
                '불필요한 설명 제거',
                '행동 지침 명확화'
            ]
        }
    ];

    const communicationMethods = [
        {
            id: 'majority_opinion',
            name: '다수 의견',
            description: '다른 사람들의 의견이나 사례를 자연스럽게 언급',
            examples: ['대부분의 조합원들이 동의하는 사항', '다른 재개발 사례의 성공 사례']
        },
        {
            id: 'mutual_consideration',
            name: '상호 배려',
            description: '먼저 도움이나 정보를 제공하며 관계 형성',
            examples: ['조합원의 입장을 먼저 고려', '상호 이익을 위한 제안']
        },
        {
            id: 'experience_sharing',
            name: '경험 공유',
            description: '개인 경험이나 지식을 자연스럽게 공유',
            examples: ['유사한 상황에서의 경험담', '전문 지식의 공유']
        },
        {
            id: 'consensus_seeking',
            name: '합의 추구',
            description: '공통 관심사를 찾아 자연스러운 대화 유도',
            examples: ['모두가 동의할 수 있는 공통점 찾기', '합의를 위한 대화 유도']
        }
    ];

    // 시뮬레이션된 컨텍스트 데이터
    const sampleContext: MessageContext = {
        sender: '우성7차',
        content: '환급금 3억 받은걸로 알고 있습니다! 환급금이 실제로는 얼마인지 정확히 알려주세요. 자산가치가 떨어지면 어떻게 되는지도 설명해주세요.',
        sentiment: 'neutral',
        timestamp: '2025년 6월 24일 오전 9:22',
        keywords: ['환급금', '자산가치', '정확한 정보', '설명'],
        urgency: 'high'
    };

    const generateMessage = async () => {
        if (!selectedContext || !selectedStrategy) return;

        setIsGenerating(true);

        // 시뮬레이션된 생성 과정
        await new Promise(resolve => setTimeout(resolve, 2000));

        const strategy = strategies.find(s => s.id === selectedStrategy);
        const method = communicationMethods.find(m => m.id === 'mutual_consideration');

        const generated: GeneratedMessage = {
            id: Date.now().toString(),
            content: `안녕하세요, 우성7차님. 환급금 관련 문의해주셔서 감사합니다.

재개발 사업의 환급금은 실제로는 사업 규모와 조건에 따라 달라질 수 있습니다. 현재 예상 환급금은 약 2.8억원 정도로 추정되며, 이는 시장 상황과 사업 진행 상황에 따라 변동될 수 있습니다.

자산가치 하락에 대해서는 재개발 완료 후 새로운 시설로 인한 자산가치 상승이 예상되므로, 장기적으로는 자산가치가 향상될 것으로 전망됩니다.

더 자세한 정보가 필요하시면 언제든 연락주세요.`,
            confidence: 85,
            strategy: strategy?.name || '',
            reasoning: '조합원의 우려사항을 이해하고 정확한 정보를 제공하여 신뢰를 구축하는 방향으로 응답했습니다.',
            alternatives: [
                '더 간결한 버전으로 핵심만 전달',
                '구체적인 수치와 함께 더 상세한 설명',
                '감정적 공감을 바탕으로 한 접근'
            ],
            waitTime: 0,
            tone: strategy?.tone || ''
        };

        setGeneratedMessage(generated);
        setGenerationHistory(prev => [generated, ...prev.slice(0, 4)]);
        setIsGenerating(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // 토스트 알림 등 추가 가능
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <StarIcon className="w-8 h-8 text-purple-600" />
                    <h2 className="text-2xl font-bold text-gray-900">고급 메시지 생성 엔진</h2>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">AI 모델: GPT-4</span>
                    <span className="text-sm text-green-600">● 온라인</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 왼쪽: 컨텍스트 및 전략 선택 */}
                <div className="space-y-6">
                    {/* 컨텍스트 분석 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <DocumentTextIcon className="w-5 h-5 text-gray-600 mr-2" />
                            컨텍스트 분석
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">선택된 메시지</label>
                                <div className="bg-white border border-gray-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium">{sampleContext.sender}</span>
                                        <span className="text-sm text-gray-500">{sampleContext.timestamp}</span>
                                    </div>
                                    <p className="text-gray-900 text-sm">{sampleContext.content}</p>
                                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                        <span>감정: {sampleContext.sentiment}</span>
                                        <span>긴급도: {sampleContext.urgency}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">키워드 분석</label>
                                <div className="flex flex-wrap gap-2">
                                    {sampleContext.keywords.map((keyword, index) => (
                                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 전략 선택 */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">메시지 전략 선택</h3>
                        <div className="space-y-3">
                            {strategies.map((strategy) => (
                                <label key={strategy.id} className="flex items-start space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="strategy"
                                        value={strategy.id}
                                        checked={selectedStrategy === strategy.id}
                                        onChange={(e) => setSelectedStrategy(e.target.value)}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">{strategy.name}</div>
                                        <div className="text-sm text-gray-600">{strategy.description}</div>
                                        <div className="text-xs text-gray-500 mt-1">톤: {strategy.tone}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 커뮤니케이션 방식 */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">커뮤니케이션 방식</h3>
                        <div className="space-y-2">
                            {communicationMethods.map((method) => (
                                <label key={method.id} className="flex items-start space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="communicationMethod"
                                        value={method.id}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">{method.name}</div>
                                        <div className="text-sm text-gray-600">{method.description}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 생성 버튼 */}
                    <button
                        onClick={generateMessage}
                        disabled={!selectedStrategy || isGenerating}
                        className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {isGenerating ? (
                            <>
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                <span>생성 중...</span>
                            </>
                        ) : (
                            <>
                                <StarIcon className="w-5 h-5" />
                                <span>메시지 생성</span>
                            </>
                        )}
                    </button>
                </div>

                {/* 오른쪽: 생성 결과 */}
                <div className="space-y-6">
                    {/* 생성된 메시지 */}
                    {generatedMessage && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-green-900">생성된 메시지</h3>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-green-700">신뢰도: {generatedMessage.confidence}%</span>
                                    <button
                                        onClick={() => copyToClipboard(generatedMessage.content)}
                                        className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                    >
                                        <ClipboardDocumentIcon className="w-3 h-3" />
                                        <span>복사</span>
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-3 mb-3">
                                <p className="text-gray-900 whitespace-pre-line">{generatedMessage.content}</p>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div><span className="font-medium">전략:</span> {generatedMessage.strategy}</div>
                                <div><span className="font-medium">톤:</span> {generatedMessage.tone}</div>
                                <div><span className="font-medium">추천 대기시간:</span> {generatedMessage.waitTime}분</div>
                            </div>
                        </div>
                    )}

                    {/* 생성 이력 */}
                    {generationHistory.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">생성 이력</h3>
                            <div className="space-y-2">
                                {generationHistory.map((msg) => (
                                    <div key={msg.id} className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">{msg.strategy}</span>
                                            <span className="text-xs text-gray-500">{msg.confidence}%</span>
                                        </div>
                                        <p className="text-sm text-gray-700 line-clamp-2">{msg.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI 추천사항 */}
                    {generatedMessage && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-900 mb-3">AI 추천사항</h3>
                            <div className="space-y-2 text-sm text-blue-800">
                                <p>• <strong>즉시 응답 권장:</strong> 긴급한 문의이므로 빠른 응답이 필요합니다.</p>
                                <p>• <strong>정확한 정보 제공:</strong> 환급금 관련 구체적인 수치를 제시하세요.</p>
                                <p>• <strong>신뢰 구축:</strong> 투명한 정보 공개로 신뢰를 형성하세요.</p>
                                <p>• <strong>후속 조치:</strong> 추가 문의사항에 대한 연락 방법을 안내하세요.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdvancedMessageEngine; 