import React, { useState, useEffect } from 'react';
import {
    UserGroupIcon,
    ChatBubbleLeftRightIcon,
    ListBulletIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    LightBulbIcon,
    StarIcon
} from '@heroicons/react/24/outline';

interface MessageStrategy {
    id: string;
    name: string;
    description: string;
    icon: string;
    examples: string[];
    confidence: number;
}

interface CommunicationMethod {
    id: string;
    name: string;
    description: string;
    icon: string;
    useCases: string[];
}

interface GeneratedMessage {
    content: string;
    confidence: number;
    strategy: string;
    method: string;
    tone: string;
    waitTime: number;
}

const AdvancedMessageStrategy: React.FC = () => {
    const [selectedTendency, setSelectedTendency] = useState('중립');
    const [selectedContractor, setSelectedContractor] = useState('강대우');
    const [selectedStrategy, setSelectedStrategy] = useState('concern_sharing');
    const [selectedMethod, setSelectedMethod] = useState('mutual_consideration');
    const [targetParticipant, setTargetParticipant] = useState('');
    const [generatedMessage, setGeneratedMessage] = useState<GeneratedMessage | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const tendencies = [
        { value: '중립', label: '중립', icon: '😐' },
        { value: '긍정', label: '긍정', icon: '😊' },
        { value: '부정', label: '부정', icon: '😞' },
        { value: '전문적', label: '전문적', icon: '👨‍💼' }
    ];

    const contractors = [
        { value: '강대우', label: '강대우' },
        { value: '삼성물산', label: '삼성물산' },
        { value: '현대건설', label: '현대건설' },
        { value: '롯데건설', label: '롯데건설' }
    ];

    const participants = [
        '우성7차',
        '관리자',
        '조합원A',
        '조합원B',
        '전체 참여자'
    ];

    const basicStrategies: MessageStrategy[] = [
        {
            id: 'logical_rebuttal',
            name: '논리적 반박',
            description: '데이터와 근거를 바탕으로 논리적 대응',
            icon: '📊',
            examples: [
                '재개발 사업의 경제적 효과를 구체적인 수치로 설명',
                '법적 근거를 제시하여 우려사항 해소',
                '성공 사례를 통한 신뢰도 향상'
            ],
            confidence: 85
        },
        {
            id: 'information_provision',
            name: '정보 제공',
            description: '유용한 정보와 지식을 공유',
            icon: '📚',
            examples: [
                '재개발 과정의 단계별 설명',
                '투명한 정보 공개로 신뢰 구축',
                '조합원 혜택의 구체적 설명'
            ],
            confidence: 78
        },
        {
            id: 'emotion_avoidance',
            name: '감정 회피',
            description: '감정적 대립을 피하고 중립적 접근',
            icon: '⚖️',
            examples: [
                '객관적 사실에 집중한 설명',
                '감정적 표현 대신 논리적 접근',
                '상호 이해를 위한 중립적 입장'
            ],
            confidence: 72
        },
        {
            id: 'short_answer',
            name: '단답 강조',
            description: '간결하고 명확한 메시지',
            icon: '💬',
            examples: [
                '핵심 정보만 간결하게 전달',
                '불필요한 설명 제거',
                '행동 지침 명확화'
            ],
            confidence: 90
        }
    ];

    const communicationMethods: CommunicationMethod[] = [
        {
            id: 'majority_opinion',
            name: '다수 의견',
            description: '다른 사람들의 의견이나 사례를 자연스럽게 언급',
            icon: '👥',
            useCases: [
                '대부분의 조합원들이 동의하는 사항',
                '다른 재개발 사례의 성공 사례',
                '일반적인 관행이나 표준'
            ]
        },
        {
            id: 'mutual_consideration',
            name: '상호 배려',
            description: '먼저 도움이나 정보를 제공하며 관계 형성',
            icon: '🤝',
            useCases: [
                '조합원의 입장을 먼저 고려',
                '상호 이익을 위한 제안',
                '신뢰 관계 구축'
            ]
        },
        {
            id: 'experience_sharing',
            name: '경험 공유',
            description: '개인 경험이나 지식을 자연스럽게 공유',
            icon: '💡',
            useCases: [
                '유사한 상황에서의 경험담',
                '전문 지식의 공유',
                '실제 사례를 통한 설명'
            ]
        },
        {
            id: 'consensus_seeking',
            name: '합의 추구',
            description: '공통 관심사를 찾아 자연스러운 대화 유도',
            icon: '🎯',
            useCases: [
                '모두가 동의할 수 있는 공통점 찾기',
                '합의를 위한 대화 유도',
                '공동 목표 설정'
            ]
        }
    ];

    const generateMessage = async () => {
        if (!targetParticipant) {
            alert('메시지 대상을 선택해주세요.');
            return;
        }

        setIsGenerating(true);

        // 시뮬레이션된 메시지 생성
        await new Promise(resolve => setTimeout(resolve, 2000));

        const selectedStrategyObj = basicStrategies.find(s => s.id === selectedStrategy);
        const selectedMethodObj = communicationMethods.find(m => m.id === selectedMethod);

        const messageTemplates = {
            logical_rebuttal: {
                content: `안녕하세요, ${targetParticipant}님. 말씀하신 환급금 관련하여 정확한 정보를 드리겠습니다.

재개발 사업의 환급금은 실제로는 사업 규모와 조건에 따라 달라질 수 있습니다. 현재 예상 환급금은 약 2.8억원 정도로 추정되며, 이는 시장 상황과 사업 진행 상황에 따라 변동될 수 있습니다.

자산가치 하락에 대해서는 재개발 완료 후 새로운 시설로 인한 자산가치 상승이 예상되므로, 장기적으로는 자산가치가 향상될 것으로 전망됩니다.

더 자세한 정보가 필요하시면 언제든 연락주세요.`,
                confidence: 85,
                tone: '전문적이고 객관적'
            },
            information_provision: {
                content: `안녕하세요, ${targetParticipant}님. 재개발 사업에 대한 구체적인 정보를 공유드리겠습니다.

현재 진행 중인 재개발 사업은 다음과 같은 단계로 진행됩니다:
1. 사업계획 승인 (완료)
2. 조합원 동의 절차 (진행 중)
3. 시공사 선정 (예정)
4. 착공 및 완공 (예정)

각 단계별로 조합원분들의 의견을 수렴하여 투명하게 진행하고 있습니다.`,
                confidence: 78,
                tone: '정보 제공 중심'
            },
            emotion_avoidance: {
                content: `안녕하세요, ${targetParticipant}님. 말씀하신 내용에 대해 객관적으로 검토해보겠습니다.

재개발 사업의 환급금은 법적 기준에 따라 산정되며, 현재 예상 금액은 약 2.8억원입니다. 이는 시장 상황과 사업 조건에 따라 변동될 수 있습니다.

자산가치 관련해서는 재개발 완료 후 새로운 시설로 인한 가치 상승이 예상됩니다.`,
                confidence: 72,
                tone: '중립적이고 객관적'
            },
            short_answer: {
                content: `안녕하세요, ${targetParticipant}님.

환급금: 약 2.8억원 (예상)
자산가치: 재개발 완료 후 상승 예상
추가 문의: 언제든 연락주세요.`,
                confidence: 90,
                tone: '간결하고 명확'
            }
        };

        const template = messageTemplates[selectedStrategy as keyof typeof messageTemplates];

        setGeneratedMessage({
            content: template.content,
            confidence: template.confidence,
            strategy: selectedStrategyObj?.name || '',
            method: selectedMethodObj?.name || '',
            tone: template.tone,
            waitTime: 0
        });

        setIsGenerating(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('메시지가 클립보드에 복사되었습니다.');
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <StarIcon className="w-8 h-8 text-purple-600" />
                    <h2 className="text-2xl font-bold text-gray-900">고급 메시지 전략 시스템</h2>
                </div>

                <div className="flex items-center space-x-2">
                    <span className="text-sm text-green-600">● 온라인</span>
                    <span className="text-sm text-gray-600">AI 모델: GPT-4</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 왼쪽: 설정 패널 */}
                <div className="space-y-6">
                    {/* 참여자 선택 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <UserGroupIcon className="w-5 h-5 text-gray-600 mr-2" />
                            참여자 선택
                        </h3>
                        <select
                            value={targetParticipant}
                            onChange={(e) => setTargetParticipant(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            aria-label="메시지 대상 선택"
                        >
                            <option value="">참여자를 선택하세요</option>
                            {participants.map((participant) => (
                                <option key={participant} value={participant}>{participant}</option>
                            ))}
                        </select>
                    </div>

                    {/* 성향 & 시공사 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <UserGroupIcon className="w-5 h-5 text-gray-600 mr-2" />
                            성향 & 시공사
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">성향</label>
                                <select
                                    value={selectedTendency}
                                    onChange={(e) => setSelectedTendency(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {tendencies.map((tendency) => (
                                        <option key={tendency.value} value={tendency.value}>
                                            {tendency.icon} {tendency.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">시공사</label>
                                <select
                                    value={selectedContractor}
                                    onChange={(e) => setSelectedContractor(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {contractors.map((contractor) => (
                                        <option key={contractor.value} value={contractor.value}>{contractor.label}</option>
                                    ))}
                                </select>
                            </div>
                            <button className="w-full px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700">
                                선택 초기화
                            </button>
                        </div>
                    </div>

                    {/* 메시지 전략 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <ListBulletIcon className="w-5 h-5 text-gray-600 mr-2" />
                            메시지 전략
                        </h3>

                        {/* 기본 메시지 전략 */}
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">기본 메시지 전략</h4>
                            <div className="space-y-2">
                                {basicStrategies.map((strategy) => (
                                    <label key={strategy.id} className="flex items-start space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="basicStrategy"
                                            value={strategy.id}
                                            checked={selectedStrategy === strategy.id}
                                            onChange={(e) => setSelectedStrategy(e.target.value)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-lg">{strategy.icon}</span>
                                                <span className="font-medium text-gray-900">{strategy.name}</span>
                                                <span className="text-xs text-gray-500">({strategy.confidence}%)</span>
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">{strategy.description}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 커뮤니케이션 방식 */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">커뮤니케이션 방식</h4>
                            <div className="space-y-2">
                                {communicationMethods.map((method) => (
                                    <label key={method.id} className="flex items-start space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="communicationMethod"
                                            value={method.id}
                                            checked={selectedMethod === method.id}
                                            onChange={(e) => setSelectedMethod(e.target.value)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-lg">{method.icon}</span>
                                                <span className="font-medium text-gray-900">{method.name}</span>
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">{method.description}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 생성 버튼 */}
                    <button
                        onClick={generateMessage}
                        disabled={!targetParticipant || isGenerating}
                        className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {isGenerating ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>생성 중...</span>
                            </>
                        ) : (
                            <>
                                <StarIcon className="w-4 h-4" />
                                <span>메시지 생성</span>
                            </>
                        )}
                    </button>
                </div>

                {/* 오른쪽: 생성 결과 */}
                <div className="space-y-6">
                    {/* 생성된 메시지 */}
                    {generatedMessage && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                                <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-600 mr-2" />
                                생성된 메시지
                            </h3>

                            <div className="bg-white rounded-lg p-4 mb-4">
                                <p className="text-gray-900 whitespace-pre-line">{generatedMessage.content}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                <div>
                                    <span className="font-medium text-green-800">신뢰도:</span>
                                    <span className="ml-2 text-green-700">{generatedMessage.confidence}%</span>
                                </div>
                                <div>
                                    <span className="font-medium text-green-800">톤:</span>
                                    <span className="ml-2 text-green-700">{generatedMessage.tone}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-green-800">전략:</span>
                                    <span className="ml-2 text-green-700">{generatedMessage.strategy}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-green-800">방식:</span>
                                    <span className="ml-2 text-green-700">{generatedMessage.method}</span>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => copyToClipboard(generatedMessage.content)}
                                    className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center justify-center space-x-1"
                                >
                                    <CheckCircleIcon className="w-4 h-4" />
                                    <span>복사</span>
                                </button>
                                <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                                    수정
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 전략 상세 정보 */}
                    {selectedStrategy && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                <LightBulbIcon className="w-5 h-5 text-blue-600 mr-2" />
                                선택된 전략 상세
                            </h3>

                            {(() => {
                                const strategy = basicStrategies.find(s => s.id === selectedStrategy);
                                const method = communicationMethods.find(m => m.id === selectedMethod);

                                return (
                                    <div className="space-y-4">
                                        {strategy && (
                                            <div>
                                                <h4 className="font-medium text-blue-900 mb-2">{strategy.name}</h4>
                                                <p className="text-sm text-blue-800 mb-3">{strategy.description}</p>
                                                <div className="space-y-2">
                                                    <h5 className="text-sm font-medium text-blue-900">예시:</h5>
                                                    {strategy.examples.map((example, index) => (
                                                        <div key={index} className="text-sm text-blue-700 bg-blue-100 rounded p-2">
                                                            • {example}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {method && (
                                            <div>
                                                <h4 className="font-medium text-blue-900 mb-2">{method.name}</h4>
                                                <p className="text-sm text-blue-800 mb-3">{method.description}</p>
                                                <div className="space-y-2">
                                                    <h5 className="text-sm font-medium text-blue-900">사용 사례:</h5>
                                                    {method.useCases.map((useCase, index) => (
                                                        <div key={index} className="text-sm text-blue-700 bg-blue-100 rounded p-2">
                                                            • {useCase}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdvancedMessageStrategy; 