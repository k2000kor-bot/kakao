import React from 'react';
import { useAIModelSettings, AIModel } from '../hooks/useAIModelSettings';

const AIModelSettings: React.FC = () => {
    const {
        settings,
        models,
        getCurrentModel,
        changeModel,
        saveSettings,
        resetSettings,
        getModelPerformance,
        applyPreset
    } = useAIModelSettings();

    const currentModel = getCurrentModel();

    const getSpeedIcon = (speed: string) => {
        switch (speed) {
            case 'fast': return '⚡';
            case 'balanced': return '⚖️';
            case 'accurate': return '🎯';
            default: return '⚡';
        }
    };

    const getPerformanceColor = (score: number) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    AI 모델 설정
                </h2>
                <button
                    onClick={resetSettings}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                    기본값으로 리셋
                </button>
            </div>

            {/* 모델 선택 */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    AI 모델 선택
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {models.map((model) => {
                        const performance = getModelPerformance(model.id);
                        const isSelected = settings.selectedModel === model.id;

                        return (
                            <div
                                key={model.id}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                    }`}
                                onClick={() => changeModel(model.id)}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                        {model.name}
                                    </h4>
                                    <span className="text-lg">{getSpeedIcon(model.speed)}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    {model.description}
                                </p>

                                {performance && (
                                    <div className="space-y-1 mb-3">
                                        <div className="flex justify-between text-xs">
                                            <span>속도</span>
                                            <span className={getPerformanceColor(performance.speed)}>
                                                {performance.speed}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span>정확도</span>
                                            <span className={getPerformanceColor(performance.accuracy)}>
                                                {performance.accuracy}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span>비용 효율</span>
                                            <span className={getPerformanceColor(performance.cost)}>
                                                {performance.cost}%
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-1">
                                    {model.capabilities.map((capability) => (
                                        <span
                                            key={capability}
                                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                                        >
                                            {capability}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 프리셋 설정 */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    빠른 프리셋
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                        onClick={() => applyPreset('creative')}
                        className="p-3 text-center bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    >
                        <div className="text-lg mb-1">🎨</div>
                        <div className="text-sm font-medium text-purple-900 dark:text-purple-100">창의적</div>
                        <div className="text-xs text-purple-600 dark:text-purple-400">높은 창의성</div>
                    </button>

                    <button
                        onClick={() => applyPreset('precise')}
                        className="p-3 text-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                        <div className="text-lg mb-1">🎯</div>
                        <div className="text-sm font-medium text-blue-900 dark:text-blue-100">정확</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">높은 정확도</div>
                    </button>

                    <button
                        onClick={() => applyPreset('balanced')}
                        className="p-3 text-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                    >
                        <div className="text-lg mb-1">⚖️</div>
                        <div className="text-sm font-medium text-green-900 dark:text-green-100">균형</div>
                        <div className="text-xs text-green-600 dark:text-green-400">균형잡힌 응답</div>
                    </button>

                    <button
                        onClick={() => applyPreset('fast')}
                        className="p-3 text-center bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                    >
                        <div className="text-lg mb-1">⚡</div>
                        <div className="text-sm font-medium text-orange-900 dark:text-orange-100">빠름</div>
                        <div className="text-xs text-orange-600 dark:text-orange-400">빠른 응답</div>
                    </button>
                </div>
            </div>

            {/* 고급 설정 */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    고급 설정
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Temperature */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Temperature: {settings.temperature}
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={settings.temperature}
                            onChange={(e) => saveSettings({ temperature: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>정확</span>
                            <span>균형</span>
                            <span>창의적</span>
                        </div>
                    </div>

                    {/* Max Tokens */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            최대 토큰: {settings.maxTokens.toLocaleString()}
                        </label>
                        <input
                            type="range"
                            min="1000"
                            max="32000"
                            step="1000"
                            value={settings.maxTokens}
                            onChange={(e) => saveSettings({ maxTokens: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>짧음</span>
                            <span>중간</span>
                            <span>길음</span>
                        </div>
                    </div>

                    {/* Top P */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Top P: {settings.topP}
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={settings.topP}
                            onChange={(e) => saveSettings({ topP: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                    </div>

                    {/* Response Format */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            응답 형식
                        </label>
                        <select
                            value={settings.responseFormat}
                            onChange={(e) => saveSettings({ responseFormat: e.target.value as any })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="text">일반 텍스트</option>
                            <option value="markdown">마크다운</option>
                            <option value="json">JSON</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 기능 설정 */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    기능 설정
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-gray-900 dark:text-white">스트리밍 응답</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">실시간으로 응답을 받습니다</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.enableStreaming}
                                onChange={(e) => saveSettings({ enableStreaming: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-gray-900 dark:text-white">메모리 기능</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">이전 대화를 기억합니다</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.enableMemory}
                                onChange={(e) => saveSettings({ enableMemory: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-gray-900 dark:text-white">컨텍스트 윈도우</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">긴 문서를 처리할 수 있습니다</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.enableContextWindow}
                                onChange={(e) => saveSettings({ enableContextWindow: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* 커스텀 지침 */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    커스텀 지침
                </h3>
                <textarea
                    value={settings.customInstructions}
                    onChange={(e) => saveSettings({ customInstructions: e.target.value })}
                    placeholder="AI에게 특별한 지침을 입력하세요..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    rows={4}
                />
            </div>
        </div>
    );
};

export default AIModelSettings;
