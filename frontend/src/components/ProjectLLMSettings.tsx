/**
 * 프로젝트별 LLM 설정 컴포넌트
 * 각 프로젝트마다 다른 로컬 LLM을 설정할 수 있게 해주는 UI
 */

import React, { useState, useEffect, useCallback } from 'react';
import { localLLMService, type LLMProvider, type LLMModel, type ProjectLLMConfig } from '../services/localLLMService';
import { errorLogger } from '../utils/errorLogger';
import { showToast } from '../utils/toast';
import './ProjectLLMSettings.css';

interface ProjectLLMSettingsProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
  onSave?: (config: ProjectLLMConfig) => void;
}

const ProjectLLMSettings: React.FC<ProjectLLMSettingsProps> = ({
  projectId,
  projectName,
  onClose,
  onSave,
}) => {
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider | null>(null);
  const [availableModels, setAvailableModels] = useState<LLMModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<LLMModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [settings, setSettings] = useState({
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9,
    topK: undefined as number | undefined,
    stream: true,
  });
  const [currentConfig, setCurrentConfig] = useState<ProjectLLMConfig | null>(null);

  // 기존 설정 로드
  useEffect(() => {
    const config = localLLMService.getProjectLLM(projectId);
    if (config) {
      setCurrentConfig(config);
      setSelectedProvider(config.provider);
      setSelectedModel(config.model);
      setSettings({
        ...config.settings,
        topK: config.settings.topK ?? undefined
      });
    }
  }, [projectId]);

  // 프로바이더 목록 로드
  useEffect(() => {
    const loadProviders = async () => {
      const providerList = localLLMService.getProviders();
      setProviders(providerList);
      
      if (providerList.length > 0 && !selectedProvider) {
        setSelectedProvider(providerList[0]);
      }
    };
    loadProviders();
  }, [selectedProvider]);

  // 프로바이더 선택 시 모델 로드
  useEffect(() => {
    const loadModels = async () => {
      if (!selectedProvider) {
        setAvailableModels([]);
        return;
      }

      setLoading(true);
      try {
        let models: LLMModel[] = [];
        
        if (selectedProvider.type === 'ollama') {
          models = await localLLMService.getOllamaModels(selectedProvider.baseUrl);
        } else if (selectedProvider.type === 'lmstudio') {
          models = await localLLMService.getLMStudioModels(selectedProvider.baseUrl);
        }

        setAvailableModels(models);
        
        if (models.length > 0 && !selectedModel) {
          setSelectedModel(models[0]);
        }
      } catch (error) {
        errorLogger.error('모델 로드 실패', error instanceof Error ? error : new Error(String(error)), {
          component: 'ProjectLLMSettings',
          action: 'loadModels',
          projectId,
        });
        setAvailableModels([]);
      } finally {
        setLoading(false);
      }
    };

    loadModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvider, selectedModel]);

  // 연결 테스트
  const handleTestConnection = useCallback(async () => {
    if (!selectedProvider) return;

    setTesting(true);
    setTestResult(null);

    try {
      const success = await localLLMService.testProviderConnection(selectedProvider);
      setTestResult({
        success,
        message: success
          ? '연결 성공! 사용 가능한 모델을 불러왔습니다.'
          : '연결 실패. 프로바이더가 실행 중인지 확인하세요.',
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : '연결 테스트 중 오류가 발생했습니다.',
      });
    } finally {
      setTesting(false);
    }
  }, [selectedProvider]);

  // 설정 저장
  const handleSave = useCallback(() => {
    if (!selectedProvider || !selectedModel) {
      showToast('프로바이더와 모델을 선택해주세요.');
      return;
    }

    localLLMService.setProjectLLM(projectId, projectName, selectedProvider, selectedModel, settings);
    const config = localLLMService.getProjectLLM(projectId);
    
    if (config) {
      setCurrentConfig(config);
      onSave?.(config);
      onClose();
    }
  }, [projectId, projectName, selectedProvider, selectedModel, settings, onSave, onClose]);

  return (
    <div className="project-llm-settings">
      <div className="settings-header">
        <h2>프로젝트별 LLM 설정</h2>
        <button type="button" className="close-btn" onClick={onClose} aria-label="설정 모달 닫기">
          ×
        </button>
      </div>

      <div className="settings-content">
        <div className="project-info">
          <h3>프로젝트: {projectName}</h3>
          <p className="project-id">ID: {projectId}</p>
        </div>

        {currentConfig && (
          <div className="current-config">
            <h4>현재 설정</h4>
            <div className="config-info">
              <p><strong>프로바이더:</strong> {currentConfig.provider.name}</p>
              <p><strong>모델:</strong> {currentConfig.model.name}</p>
              <p><strong>업데이트:</strong> {new Date(currentConfig.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        )}

        <div className="settings-section">
          <h4>프로바이더 선택</h4>
          <select
            value={selectedProvider?.id || ''}
            onChange={(e) => {
              const provider = providers.find(p => p.id === e.target.value);
              setSelectedProvider(provider || null);
              setSelectedModel(null);
            }}
            className="provider-select"
          >
            <option value="">프로바이더 선택</option>
            {providers.map(provider => (
              <option key={provider.id} value={provider.id}>
                {provider.name} ({provider.baseUrl})
              </option>
            ))}
          </select>

          {selectedProvider && (
            <div className="provider-actions">
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="test-btn"
              >
                {testing ? '테스트 중...' : '연결 테스트'}
              </button>
              {testResult && (
                <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                  {testResult.message}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="settings-section">
          <h4>모델 선택</h4>
          {loading ? (
            <div className="loading">모델 로딩 중...</div>
          ) : (
            <select
              value={selectedModel?.id || ''}
              onChange={(e) => {
                const model = availableModels.find(m => m.id === e.target.value);
                setSelectedModel(model || null);
              }}
              className="model-select"
              disabled={!selectedProvider || availableModels.length === 0}
            >
              <option value="">모델 선택</option>
              {availableModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} {model.description && `- ${model.description}`}
                </option>
              ))}
            </select>
          )}
          {selectedProvider && availableModels.length === 0 && !loading && (
            <p className="error-message">사용 가능한 모델이 없습니다. 연결을 테스트해주세요.</p>
          )}
        </div>

        <div className="settings-section">
          <h4>고급 설정</h4>
          <div className="settings-grid">
            <div className="setting-item">
              <label htmlFor="temperature">Temperature</label>
              <input
                id="temperature"
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
              />
              <span className="setting-hint">0.0 (보수적) ~ 2.0 (창의적)</span>
            </div>

            <div className="setting-item">
              <label htmlFor="maxTokens">Max Tokens</label>
              <input
                id="maxTokens"
                type="number"
                min="1"
                max="8192"
                value={settings.maxTokens}
                onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
              />
              <span className="setting-hint">최대 생성 토큰 수</span>
            </div>

            <div className="setting-item">
              <label htmlFor="topP">Top P</label>
              <input
                id="topP"
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={settings.topP}
                onChange={(e) => setSettings({ ...settings, topP: parseFloat(e.target.value) })}
              />
              <span className="setting-hint">0.0 ~ 1.0</span>
            </div>

            <div className="setting-item">
              <label htmlFor="stream">
                <input
                  id="stream"
                  type="checkbox"
                  checked={settings.stream}
                  onChange={(e) => setSettings({ ...settings, stream: e.target.checked })}
                />
                스트리밍 활성화
              </label>
              <span className="setting-hint">실시간 응답 스트리밍</span>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button type="button" onClick={onClose} className="cancel-btn" aria-label="설정 취소">취소</button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!selectedProvider || !selectedModel}
            className="save-btn"
            aria-label="LLM 설정 저장"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectLLMSettings;

