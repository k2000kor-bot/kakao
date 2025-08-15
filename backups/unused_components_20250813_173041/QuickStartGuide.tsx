import React from 'react';
import {
    ChatBubbleLeftRightIcon,
    LightBulbIcon,
    SparklesIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const QuickStartGuide: React.FC = () => {
    const steps = [
        {
            icon: ChatBubbleLeftRightIcon,
            title: "1. 대화방 선택",
            description: "왼쪽에서 대화방을 선택하고 원하는 메시지를 클릭하세요",
            example: "개포우성7차 대화방 → 특정 메시지 선택"
        },
        {
            icon: SparklesIcon,
            title: "2. 메시지 형식 선택",
            description: "22가지 형식 중 원하는 것을 선택하거나 'AI 자동'을 사용하세요",
            example: "공감, 제안, 반박 등 최대 3개까지 선택 가능"
        },
        {
            icon: LightBulbIcon,
            title: "3. 메시지 취지 입력",
            description: "어떤 내용의 메시지를 원하는지 구체적으로 작성하세요",
            example: "프로젝트 일정에 대한 우려사항을 전달하고 싶습니다"
        },
        {
            icon: CheckCircleIcon,
            title: "4. 생성 및 확인",
            description: "메시지 생성 버튼을 클릭하고 결과를 확인하세요",
            example: "선택한 형식별로 각각 다른 톤의 메시지가 생성됩니다"
        }
    ];

    const examples = [
        {
            title: "📝 새 메시지 생성",
            input: "회의 일정 변경에 대한 안내를 전달하고 싶습니다",
            formats: ["공감", "제안"],
            result: "공감과 제안 형식으로 2개의 메시지가 생성됩니다"
        },
        {
            title: "✏️ 텍스트 리라이팅",
            input: "기존: '회의가 연기되었습니다' → 더 정중하게 표현",
            formats: ["공감", "중립"],
            result: "정중하고 이해심 있는 톤으로 리라이팅됩니다"
        }
    ];

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* 헤더 */}
            <div className="text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                        <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">빠른 시작 가이드</h1>
                </div>
                <p className="text-gray-600 text-lg">AI 메시지 생성 시스템을 쉽고 빠르게 사용해보세요</p>
            </div>

            {/* 단계별 가이드 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">사용 방법</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div key={index} className="flex space-x-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Icon className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                                    <p className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1">
                                        예: {step.example}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 사용 예시 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">사용 예시</h2>
                <div className="space-y-6">
                    {examples.map((example, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">{example.title}</h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm font-medium text-gray-700">입력:</span>
                                    <p className="text-sm text-gray-600 bg-gray-50 rounded p-2 mt-1">
                                        {example.input}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-700">선택 형식:</span>
                                    <div className="flex space-x-2 mt-1">
                                        {example.formats.map((format) => (
                                            <span key={format} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                                {format}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-700">결과:</span>
                                    <p className="text-sm text-green-600 bg-green-50 rounded p-2 mt-1">
                                        ✅ {example.result}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 팁과 주의사항 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">💡 유용한 팁</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h3 className="font-medium text-gray-800">메시지 형식 선택</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• 상황에 맞는 형식을 선택하세요</li>
                            <li>• 최대 3개까지 선택 가능합니다</li>
                            <li>• 'AI 자동'이 확실하지 않을 때 좋습니다</li>
                        </ul>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-medium text-gray-800">메시지 취지 작성</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• 구체적으로 작성할수록 좋습니다</li>
                            <li>• 상대방과의 관계를 고려하세요</li>
                            <li>• 원하는 결과를 명시하세요</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* 시작하기 버튼 */}
            <div className="text-center">
                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                >
                    지금 시작하기 🚀
                </button>
                <p className="text-sm text-gray-500 mt-2">왼쪽 메뉴에서 '고급 대화 생성'을 선택하세요</p>
            </div>
        </div>
    );
};

export default QuickStartGuide; 