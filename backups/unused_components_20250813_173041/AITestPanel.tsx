import React, { useState } from 'react';
import { 
    BeakerIcon, 
    SparklesIcon, 
    HeartIcon, 
    CogIcon,
    LanguageIcon,
    AcademicCapIcon,
    LightBulbIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { advancedAIService } from '../services/advancedAIService';

interface TestResult {
    id: string;
    type: string;
    style: string;
    input: string;
    output: string;
    processingTime: number;
    confidence: number;
    timestamp: Date;
}

const AITestPanel: React.FC = () => {
    const [testInput, setTestInput] = useState('');
    const [selectedType, setSelectedType] = useState('conversation');
    const [selectedStyle, setSelectedStyle] = useState('friendly');
    const [isLoading, setIsLoading] = useState(false);
    const [testResults, setTestResults] = useState<TestResult[]>([]);

    const aiTypes = [
        { id: 'conversation', name: '대화', icon: SparklesIcon, description: '자연스러운 대화형 응답' },
        { id: 'analysis', name: '분석', icon: ChartBarIcon, description: '심층 분석 및 인사이트' },
        { id: 'summary', name: '요약', icon: AcademicCapIcon, description: '핵심 내용 요약' },
        { id: 'creative', name: '창작', icon: LightBulbIcon, description: '창의적인 아이디어 생성' },
        { id: 'technical', name: '기술', icon: CogIcon, description: '기술적 해결책 제시' },
        { id: 'business', name: '비즈니스', icon: ChartBarIcon, description: '비즈니스 인사이트' }
    ];

    const aiStyles = [
        { id: 'friendly', name: '친근한', description: '편안하고 친근한 톤' },
        { id: 'professional', name: '전문적인', description: '정확하고 전문적인 톤' },
        { id: 'creative', name: '창의적인', description: '혁신적이고 창의적인 톤' },
        { id: 'formal', name: '격식있는', description: '공식적이고 격식있는 톤' },
        { id: 'casual', name: '일상적인', description: '자연스럽고 일상적인 톤' },
        { id: 'academic', name: '학술적인', description: '학술적이고 연구적인 톤' },
        { id: 'poetic', name: '시적인', description: '아름답고 시적인 표현' }
    ];

    const runTest = async () => {
        if (!testInput.trim()) return;

        setIsLoading(true);
        const startTime = Date.now();

        try {
            const response = await advancedAIService.generateAdvancedResponse({
                type: selectedType as any,
                text: testInput,
                style: selectedStyle as any
            });

            const processingTime = Date.now() - startTime;
            const confidence = response.metadata?.confidence || 0.7;

            const result: TestResult = {
                id: Date.now().toString(),
                type: selectedType,
                style: selectedStyle,
                input: testInput,
                output: response.message.content,
                processingTime,
                confidence,
                timestamp: new Date()
            };

            setTestResults(prev => [result, ...prev]);
            setTestInput('');
        } catch (error) {
            console.error('AI 테스트 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const clearResults = () => {
        setTestResults([]);
    };

    const exportResults = () => {
        const dataStr = JSON.stringify(testResults, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ai-test-results-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <BeakerIcon className="h-8 w-8 text-purple-600 mr-3" />
                    AI 고도화 테스트 패널
                </h2>
                <div className="flex space-x-2">
                    <button
                        onClick={clearResults}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        결과 초기화
                    </button>
                    <button
                        onClick={exportResults}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        결과 내보내기
                    </button>
                </div>
            </div>

            {/* 테스트 설정 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* AI 타입 선택 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        AI 타입
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {aiTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setSelectedType(type.id)}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                    selectedType === type.id
                                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <type.icon className="h-5 w-5" />
                                    <span className="text-sm font-medium">{type.name}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 스타일 선택 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        응답 스타일
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {aiStyles.map((style) => (
                            <button
                                key={style.id}
                                onClick={() => setSelectedStyle(style.id)}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                    selectedStyle === style.id
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium">{style.name}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{style.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 입력 및 실행 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        테스트 입력
                    </label>
                    <textarea
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        placeholder="테스트할 텍스트를 입력하세요..."
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                        onClick={runTest}
                        disabled={isLoading || !testInput.trim()}
                        className="w-full mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                테스트 중...
                            </div>
                        ) : (
                            '테스트 실행'
                        )}
                    </button>
                </div>
            </div>

            {/* 테스트 결과 */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">테스트 결과</h3>
                {testResults.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        아직 테스트 결과가 없습니다. 위에서 테스트를 실행해보세요.
                    </div>
                ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {testResults.map((result) => (
                            <div key={result.id} className="bg-gray-50 rounded-lg p-4 border">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-4">
                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
                                            {aiTypes.find(t => t.id === result.type)?.name}
                                        </span>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                                            {aiStyles.find(s => s.id === result.style)?.name}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {result.timestamp.toLocaleTimeString()}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            입력
                                        </label>
                                        <div className="bg-white p-3 rounded border text-sm">
                                            {result.input}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            AI 응답
                                        </label>
                                        <div className="bg-white p-3 rounded border text-sm">
                                            {result.output}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
                                    <div className="flex items-center space-x-4">
                                        <span>처리 시간: {result.processingTime}ms</span>
                                        <span>신뢰도: {Math.round(result.confidence * 100)}%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 통계 정보 */}
            {testResults.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">테스트 통계</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-blue-600 font-medium">총 테스트:</span>
                            <span className="ml-2">{testResults.length}회</span>
                        </div>
                        <div>
                            <span className="text-blue-600 font-medium">평균 처리시간:</span>
                            <span className="ml-2">
                                {Math.round(testResults.reduce((acc, r) => acc + r.processingTime, 0) / testResults.length)}ms
                            </span>
                        </div>
                        <div>
                            <span className="text-blue-600 font-medium">평균 신뢰도:</span>
                            <span className="ml-2">
                                {Math.round(testResults.reduce((acc, r) => acc + r.confidence, 0) / testResults.length * 100)}%
                            </span>
                        </div>
                        <div>
                            <span className="text-blue-600 font-medium">가장 많이 사용된 타입:</span>
                            <span className="ml-2">
                                {(() => {
                                    const typeCounts = testResults.reduce((acc, r) => {
                                        acc[r.type] = (acc[r.type] || 0) + 1;
                                        return acc;
                                    }, {} as Record<string, number>);
                                    const mostUsed = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
                                    return mostUsed ? aiTypes.find(t => t.id === mostUsed[0])?.name : '-';
                                })()}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AITestPanel;
