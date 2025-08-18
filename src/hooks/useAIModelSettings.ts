import { useState, useCallback } from 'react';

export interface AIModel {
    id: string;
    name: string;
    description: string;
    maxTokens: number;
    temperature: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
    costPerToken: number;
    speed: 'fast' | 'balanced' | 'accurate';
    capabilities: string[];
}

export interface ModelSettings {
    selectedModel: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
    customInstructions: string;
    responseFormat: 'text' | 'json' | 'markdown';
    enableStreaming: boolean;
    enableMemory: boolean;
    enableContextWindow: boolean;
}

const DEFAULT_MODELS: AIModel[] = [
    {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: '가장 강력한 멀티모달 AI 모델',
        maxTokens: 128000,
        temperature: 0.7,
        topP: 1.0,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        costPerToken: 0.005,
        speed: 'balanced',
        capabilities: ['text', 'image', 'code', 'reasoning', 'creativity']
    },
    {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        description: '빠르고 효율적인 AI 모델',
        maxTokens: 128000,
        temperature: 0.7,
        topP: 1.0,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        costPerToken: 0.00015,
        speed: 'fast',
        capabilities: ['text', 'code', 'reasoning']
    },
    {
        id: 'claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet',
        description: '정확하고 신뢰할 수 있는 AI 모델',
        maxTokens: 200000,
        temperature: 0.7,
        topP: 1.0,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        costPerToken: 0.003,
        speed: 'accurate',
        capabilities: ['text', 'analysis', 'writing', 'research']
    },
    {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: 'Google의 최신 AI 모델',
        maxTokens: 1000000,
        temperature: 0.7,
        topP: 1.0,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        costPerToken: 0.0025,
        speed: 'balanced',
        capabilities: ['text', 'image', 'code', 'multimodal']
    },
    {
        id: 'custom',
        name: '커스텀 모델',
        description: '사용자 정의 설정',
        maxTokens: 32000,
        temperature: 0.7,
        topP: 1.0,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        costPerToken: 0.001,
        speed: 'balanced',
        capabilities: ['text', 'custom']
    }
];

const DEFAULT_SETTINGS: ModelSettings = {
    selectedModel: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 4000,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    customInstructions: '',
    responseFormat: 'text',
    enableStreaming: true,
    enableMemory: true,
    enableContextWindow: true
};

export const useAIModelSettings = () => {
    const [settings, setSettings] = useState<ModelSettings>(() => {
        const saved = localStorage.getItem('ai-model-settings');
        return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    });

    const [models] = useState<AIModel[]>(DEFAULT_MODELS);

    // 설정 저장
    const saveSettings = useCallback((newSettings: Partial<ModelSettings>) => {
        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);
        localStorage.setItem('ai-model-settings', JSON.stringify(updatedSettings));
    }, [settings]);

    // 모델 변경
    const changeModel = useCallback((modelId: string) => {
        const model = models.find(m => m.id === modelId);
        if (model) {
            saveSettings({
                selectedModel: modelId,
                temperature: model.temperature,
                maxTokens: Math.min(model.maxTokens, 4000),
                topP: model.topP,
                frequencyPenalty: model.frequencyPenalty,
                presencePenalty: model.presencePenalty
            });
        }
    }, [models, saveSettings]);

    // 설정 리셋
    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
        localStorage.setItem('ai-model-settings', JSON.stringify(DEFAULT_SETTINGS));
    }, []);

    // 현재 선택된 모델 가져오기
    const getCurrentModel = useCallback(() => {
        return models.find(m => m.id === settings.selectedModel) || models[0];
    }, [models, settings.selectedModel]);

    // 예상 비용 계산
    const calculateCost = useCallback((tokens: number) => {
        const model = getCurrentModel();
        return (tokens / 1000) * model.costPerToken;
    }, [getCurrentModel]);

    // 모델 성능 평가
    const getModelPerformance = useCallback((modelId: string) => {
        const model = models.find(m => m.id === modelId);
        if (!model) return null;

        const performance = {
            speed: model.speed === 'fast' ? 90 : model.speed === 'balanced' ? 75 : 60,
            accuracy: model.speed === 'accurate' ? 95 : model.speed === 'balanced' ? 85 : 70,
            cost: model.costPerToken < 0.001 ? 95 : model.costPerToken < 0.003 ? 75 : 50,
            capabilities: model.capabilities.length * 15
        };

        return {
            ...performance,
            overall: Math.round((performance.speed + performance.accuracy + performance.cost + performance.capabilities) / 4)
        };
    }, [models]);

    // 프리셋 설정
    const applyPreset = useCallback((preset: 'creative' | 'precise' | 'balanced' | 'fast') => {
        const presets = {
            creative: {
                temperature: 0.9,
                topP: 0.9,
                frequencyPenalty: 0.1,
                presencePenalty: 0.1
            },
            precise: {
                temperature: 0.1,
                topP: 1.0,
                frequencyPenalty: 0.0,
                presencePenalty: 0.0
            },
            balanced: {
                temperature: 0.7,
                topP: 1.0,
                frequencyPenalty: 0.0,
                presencePenalty: 0.0
            },
            fast: {
                temperature: 0.5,
                topP: 0.8,
                frequencyPenalty: 0.0,
                presencePenalty: 0.0
            }
        };

        saveSettings(presets[preset]);
    }, [saveSettings]);

    return {
        settings,
        models,
        getCurrentModel,
        changeModel,
        saveSettings,
        resetSettings,
        calculateCost,
        getModelPerformance,
        applyPreset
    };
};
