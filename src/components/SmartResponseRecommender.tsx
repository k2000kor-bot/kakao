import React, { useState, useEffect } from 'react';
import {
    SparklesIcon,
    LightBulbIcon,
    ClockIcon,
    UserGroupIcon,
    ChartBarIcon,
    DocumentTextIcon,
    StarIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

interface ResponseSuggestion {
    id: string;
    content: string;
    tone: string;
    effectiveness: number;
    reasoning: string;
    category: string;
    estimatedTime: string;
    confidence: number;
}

interface ConversationContext {
    participant: string;
    relationship: string;
    urgency: 'low' | 'medium' | 'high';
    topic: string;
    sentiment: string;
    previousMessages: number;
}

const SmartResponseRecommender: React.FC = () => {
    const [inputMessage, setInputMessage] = useState('');
    const [suggestions, setSuggestions] = useState<ResponseSuggestion[]>([]);
    const [context, setContext] = useState<ConversationContext>({
        participant: '조합원',
        relationship: 'professional',
        urgency: 'medium',
        topic: '재건축',
        sentiment: 'neutral',
        previousMessages: 3
    });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

    // 스마트 응답 생성
    const generateSuggestions = async () => {
        if (!inputMessage.trim()) return;

        setIsAnalyzing(true);

        // AI 응답 생성 시뮬레이션
        setTimeout(() => {
            const baseSuggestions: Omit<ResponseSuggestion, 'id'>[] = [
                {
                    content: `안녕하세요, ${context.participant}님! ${inputMessage}에 대해 상세히 안내드리겠습니다. 현재 상황을 정확히 파악하여 최선의 방향으로 진행하겠습니다.`,
                    tone: '친절하고 전문적',
                    effectiveness: 92,
                    reasoning: '정중한 인사와 함께 전문성을 보여주며 신뢰감을 조성합니다.',
                    category: '정보 제공',
                    estimatedTime: '2분',
                    confidence: 95
                },
                {
                    content: `말씀해 주신 내용 잘 이해했습니다. ${inputMessage}와 관련하여 몇 가지 방안을 검토해보겠습니다. 곧 구체적인 계획을 공유드릴 예정입니다.`,
                    tone: '신중하고 체계적',
                    effectiveness: 87,
                    reasoning: '체계적인 접근을 통해 신뢰성을 높이고 기대감을 관리합니다.',
                    category: '계획 수립',
                    estimatedTime: '3분',
                    confidence: 88
                },
                {
                    content: `${inputMessage}에 대한 우려를 충분히 이해합니다. 투명한 정보 공유를 통해 불안감을 해소하고, 함께 해결책을 찾아보겠습니다.`,
                    tone: '공감하고 안심시키는',
                    effectiveness: 90,
                    reasoning: '감정적 공감을 바탕으로 협력적 관계를 구축합니다.',
                    category: '감정 관리',
                    estimatedTime: '1분',
                    confidence: 91
                },
                {
                    content: `${inputMessage}는 정말 중요한 사항입니다. 즉시 관련 부서와 협의하여 빠른 시일 내에 명확한 답변을 드리겠습니다. 추가 질문이 있으시면 언제든 연락 주세요.`,
                    tone: '신속하고 적극적',
                    effectiveness: 85,
                    reasoning: '즉시 대응하는 자세로 책임감과 신뢰성을 보여줍니다.',
                    category: '긴급 대응',
                    estimatedTime: '즉시',
                    confidence: 86
                }
            ];

            const generatedSuggestions = baseSuggestions.map((suggestion, index) => ({
                ...suggestion,
                id: `suggestion_${Date.now()}_${index}`,
                effectiveness: Math.max(80, suggestion.effectiveness + (Math.random() * 10 - 5))
            })).sort((a, b) => b.effectiveness - a.effectiveness);

            setSuggestions(generatedSuggestions);
            setIsAnalyzing(false);
        }, 2000);
    };

    // 효과성 색상 반환
    const getEffectivenessColor = (score: number) => {
        if (score >= 90) return 'text-green-600 bg-green-100';
        if (score >= 80) return 'text-blue-600 bg-blue-100';
        if (score >= 70) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    // 응답 복사
    const copyToClipboard = (content: string) => {
        navigator.clipboard.writeText(content);
        setSelectedSuggestion(content);
        setTimeout(() => setSelectedSuggestion(null), 2000);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* 헤더 */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">스마트 응답 추천 시스템</h1>
                <p className="text-gray-600">AI가 상황을 분석하여 최적의 응답을 추천합니다</p>
            </div>

            {/* 상황 설정 */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">대화 상황 설정</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">대화 상대</label>
                        <select
                            value={context.participant}
                            onChange={(e) => setContext(prev => ({ ...prev, participant: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="조합원">조합원</option>
                            <option value="시공사">시공사</option>
                            <option value="설계사">설계사</option>
                            <option value="공무원">공무원</option>
                            <option value="컨설턴트">컨설턴트</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">긴급도</label>
                        <select
                            value={context.urgency}
                            onChange={(e) => setContext(prev => ({ ...prev, urgency: e.target.value as any }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="low">낮음</option>
                            <option value="medium">보통</option>
                            <option value="high">높음</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">주제</label>
                        <select
                            value={context.topic}
                            onChange={(e) => setContext(prev => ({ ...prev, topic: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="재건축">재건축</option>
                            <option value="분담금">분담금</option>
                            <option value="시공사">시공사</option>
                            <option value="일정">일정</option>
                            <option value="설계">설계</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 메시지 입력 */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">응답할 메시지</h2>
                <div className="space-y-4">
                    <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="응답하고 싶은 메시지나 상황을 입력하세요..."
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        rows={4}
                    />
                    <button
                        onClick={generateSuggestions}
                        disabled={isAnalyzing || !inputMessage.trim()}
                        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        {isAnalyzing ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>AI가 응답을 분석하고 있습니다...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center space-x-2">
                                <SparklesIcon className="h-5 w-5" />
                                <span>스마트 응답 생성</span>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {/* 응답 추천 */}
            {suggestions.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">AI 추천 응답</h2>
                    {suggestions.map((suggestion, index) => (
                        <div key={suggestion.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-full font-bold">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{suggestion.tone}</h3>
                                        <p className="text-sm text-gray-600">{suggestion.category}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getEffectivenessColor(suggestion.effectiveness)}`}>
                                        효과성 {Math.round(suggestion.effectiveness)}%
                                    </div>
                                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                                        <ClockIcon className="h-4 w-4" />
                                        <span>{suggestion.estimatedTime}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-800 leading-relaxed">{suggestion.content}</p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-start space-x-2 text-sm text-blue-600">
                                    <LightBulbIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <p>{suggestion.reasoning}</p>
                                </div>

                                <button
                                    onClick={() => copyToClipboard(suggestion.content)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${selectedSuggestion === suggestion.content
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                        }`}
                                >
                                    {selectedSuggestion === suggestion.content ? '복사됨!' : '복사하기'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 사용 팁 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 스마트 응답 팁</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                    <div className="flex items-start space-x-2">
                        <StarIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">상황별 맞춤 응답</p>
                            <p>대화 상대와 상황을 설정하면 더 정확한 응답을 받을 수 있습니다</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-2">
                        <ChartBarIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">효과성 점수 활용</p>
                            <p>점수가 높은 응답일수록 긍정적인 결과를 얻을 가능성이 높습니다</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-2">
                        <DocumentTextIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">개인화 조정</p>
                            <p>추천된 응답을 상황에 맞게 수정하여 사용하세요</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-2">
                        <ArrowPathIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">지속적 학습</p>
                            <p>사용할수록 더 정확하고 개인화된 추천을 받을 수 있습니다</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartResponseRecommender; 