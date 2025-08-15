import React, { useState, useEffect } from 'react';
import { AIProvider, AIConfig } from '../services/externalAIService';
import externalAIService from '../services/externalAIService';


interface AIModelSelectorProps {
  currentConfig: AIConfig;
  onConfigChange: (config: AIConfig) => void;
  onModelCompare?: (results: { [key: string]: any }) => void;
}

const AIModelSelector: React.FC<AIModelSelectorProps> = ({
  currentConfig,
  onConfigChange,
  onModelCompare
}) => {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const providerList = await externalAIService.getProviders();
      setProviders(providerList);
    } catch (error) {
      console.error('AI 제공자 로드 오류:', error);
    }
  };

  const handleProviderChange = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
      const newConfig: AIConfig = {
        ...currentConfig,
        provider: providerId,
        model: getDefaultModel(providerId),
        maxTokens: Math.min(currentConfig.maxTokens, provider.maxTokens)
      };
      onConfigChange(newConfig);
    }
  };

  const handleModelChange = (model: string) => {
    onConfigChange({
      ...currentConfig,
      model
    });
  };

  const handleTemperatureChange = (temperature: number) => {
    onConfigChange({
      ...currentConfig,
      temperature
    });
  };

  const handleMaxTokensChange = (maxTokens: number) => {
    const provider = providers.find(p => p.id === currentConfig.provider);
    const maxAllowed = provider ? provider.maxTokens : 4096;
    onConfigChange({
      ...currentConfig,
      maxTokens: Math.min(maxTokens, maxAllowed)
    });
  };

  const getDefaultModel = (providerId: string): string => {
    const models = {
      openai: 'gpt-4',
      claude: 'claude-3-sonnet-20240229',
      gemini: 'gemini-pro',
      local: 'local-ai'
    };
    return models[providerId as keyof typeof models] || 'gpt-4';
  };

  const getModelOptions = (providerId: string): { value: string; label: string }[] => {
    const modelOptions = {
      openai: [
        { value: 'gpt-4', label: 'GPT-4 (최신)' },
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (빠름)' },
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (경제적)' }
      ],
      claude: [
        { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (최고급)' },
        { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet (균형)' },
        { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (빠름)' }
      ],
      gemini: [
        { value: 'gemini-pro', label: 'Gemini Pro (표준)' },
        { value: 'gemini-pro-vision', label: 'Gemini Pro Vision (이미지)' }
      ],
      local: [
        { value: 'local-ai', label: '로컬 AI (오프라인)' }
      ]
    };
    return modelOptions[providerId as keyof typeof modelOptions] || [];
  };

  const getProviderIcon = (providerId: string): string => {
    const icons = {
      openai: '🤖',
      claude: '🧠',
      gemini: '🔮',
      local: '💻'
    };
    return icons[providerId as keyof typeof icons] || '🤖';
  };

  const getProviderColor = (providerId: string): string => {
    const colors = {
      openai: '#10a37f',
      claude: '#d97706',
      gemini: '#4285f4',
      local: '#6b7280'
    };
    return colors[providerId as keyof typeof colors] || '#6b7280';
  };

  const handleModelCompare = async () => {
    if (!onModelCompare) return;

    setIsComparing(true);
    try {
      // 실제 구현에서는 현재 메시지와 세션을 전달
      const results = await externalAIService.compareModels(
        '테스트 메시지',
        {
          id: 'test',
          title: '테스트',
          messages: [],
          messageCount: 0,
          createdAt: '',
          updatedAt: '',
          isActive: true,
          participants: [],
          tags: []
        },
        null
      );
      onModelCompare(results);
    } catch (error) {
      console.error('모델 비교 오류:', error);
    } finally {
      setIsComparing(false);
    }
  };

  const currentProvider = providers.find(p => p.id === currentConfig.provider);

  return (
    <div className="ai-model-selector">
      <div className="selector-header">
        <h3>🤖 AI 모델 선택</h3>
        <button
          className="advanced-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? '기본 설정' : '고급 설정'}
        </button>
      </div>

      <div className="provider-selection">
        <h4>AI 제공자</h4>
        <div className="provider-grid">
          {providers.map(provider => (
            <div
              key={provider.id}
              className={`provider-card ${currentConfig.provider === provider.id ? 'active' : ''}`}
              onClick={() => handleProviderChange(provider.id)}
              style={{ borderColor: getProviderColor(provider.id) }}
            >
              <div className="provider-icon" style={{ color: getProviderColor(provider.id) }}>
                {getProviderIcon(provider.id)}
              </div>
              <div className="provider-info">
                <h5>{provider.name}</h5>
                <p>{provider.description}</p>
                <div className="provider-capabilities">
                  {provider.capabilities?.slice(0, 2).map(cap => (
                    <span key={cap} className="capability-tag">{cap}</span>
                  ))}
                  {provider.capabilities && provider.capabilities.length > 2 && (
                    <span className="capability-more">+{provider.capabilities.length - 2}</span>
                  )}
                </div>
              </div>
              <div className="provider-cost">
                ${provider.costPerToken.toFixed(4)}/토큰
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="model-selection">
        <h4>모델</h4>
        <select
          value={currentConfig.model}
          onChange={(e) => handleModelChange(e.target.value)}
          className="model-select"
        >
          {getModelOptions(currentConfig.provider).map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {showAdvanced && (
        <div className="advanced-settings">
          <div className="setting-group">
            <label>
              온도 (Temperature): {currentConfig.temperature}
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={currentConfig.temperature}
                onChange={(e) => handleTemperatureChange(parseFloat(e.target.value))}
                className="temperature-slider"
              />
            </label>
            <div className="temperature-labels">
              <span>정확함</span>
              <span>균형</span>
              <span>창의적</span>
            </div>
          </div>

          <div className="setting-group">
            <label>
              최대 토큰: {currentConfig.maxTokens}
              <input
                type="range"
                min="100"
                max={currentProvider?.maxTokens || 4096}
                step="100"
                value={currentConfig.maxTokens}
                onChange={(e) => handleMaxTokensChange(parseInt(e.target.value))}
                className="tokens-slider"
              />
            </label>
            <div className="tokens-info">
              <span>짧은 응답</span>
              <span>긴 응답</span>
            </div>
          </div>
        </div>
      )}

      <div className="model-actions">
        {onModelCompare && (
          <button
            className="compare-button"
            onClick={handleModelCompare}
            disabled={isComparing}
          >
            {isComparing ? '비교 중...' : '모델 성능 비교'}
          </button>
        )}

        <div className="current-config-info">
          <div className="config-item">
            <span className="config-label">선택된 모델:</span>
            <span className="config-value">
              {getProviderIcon(currentConfig.provider)} {currentProvider?.name} - {currentConfig.model}
            </span>
          </div>
          <div className="config-item">
            <span className="config-label">예상 비용:</span>
            <span className="config-value">
              ${(currentConfig.maxTokens * (currentProvider?.costPerToken || 0)).toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIModelSelector;
