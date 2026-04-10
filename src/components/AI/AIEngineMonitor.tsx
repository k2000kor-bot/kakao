import React, { useEffect, useState } from 'react';
import './AIEngineMonitor.css';
import { getSentimentColor } from '../../styles/themeColors';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import {
    selectAIEngine,
    selectRealtimeAnalysis,
    selectAIModels,
    selectIntelligentResponse,
    selectAdvancedAnalytics,
    selectAIErrors,
    initializeAIEngine,
    switchAIModel,
    startRealtimeAnalysis,
    analyzeSentiment,
    detectIntent,
    clearError
} from '../../store/slices/aiEngineSlice';
import {
    Activity,
    Brain,
    Zap,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    X,
    Settings,
    BarChart,
    MessageSquare,
    Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveGenericWebSocketClientUrl } from '../../config/api';
import { coerceTrimmedString } from '../../utils/chatInputUtils';

interface AIEngineMonitorProps {
    isOpen: boolean;
    onClose: () => void;
}

const AIEngineMonitor: React.FC<AIEngineMonitorProps> = ({ isOpen, onClose }) => {
    const dispatch = useDispatch<AppDispatch>();
    const aiEngine = useSelector(selectAIEngine);
    const realtimeAnalysis = useSelector(selectRealtimeAnalysis);
    const aiModels = useSelector(selectAIModels);
    const intelligentResponse = useSelector(selectIntelligentResponse);
    const advancedAnalytics = useSelector(selectAdvancedAnalytics);
    const errors = useSelector(selectAIErrors);

    const [selectedTab, setSelectedTab] = useState<'overview' | 'models' | 'analytics' | 'settings'>('overview');
    const [testText, setTestText] = useState('');

    useEffect(() => {
        if (isOpen) {
            dispatch(initializeAIEngine());
        }
    }, [isOpen, dispatch]);

    const handleModelSwitch = (modelName: string) => {
        dispatch(switchAIModel(modelName));
    };

    const handleStartRealtimeAnalysis = () => {
        dispatch(startRealtimeAnalysis());
    };

    const handleSentimentAnalysis = () => {
        if (coerceTrimmedString(testText, '')) {
            dispatch(analyzeSentiment(testText));
        }
    };

    const handleIntentDetection = () => {
        if (coerceTrimmedString(testText, '')) {
            dispatch(detectIntent(testText));
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'connected': return 'var(--accent-success)';
            case 'connecting': return 'var(--accent-warning)';
            case 'error': return 'var(--accent-error)';
            default: return 'var(--text-tertiary)';
        }
    };

    const tabs = [
        { id: 'overview', label: '개요', icon: BarChart },
        { id: 'models', label: 'AI 모델', icon: Brain },
        { id: 'analytics', label: '분석', icon: TrendingUp },
        { id: 'settings', label: '설정', icon: Settings },
    ] as const;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="aem-overlay" onClick={onClose}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="aem-panel" onClick={(e) => e.stopPropagation()}>
                        {/* 헤더 */}
                        <div className="aem-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--accent-info)', color: 'var(--on-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Brain className="w-6 h-6" aria-hidden />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, color: 'var(--text-primary)' }}>AI 엔진 모니터</h2>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>고급 AI 시스템 상태 및 제어</p>
                                </div>
                            </div>
                            <button type="button" onClick={onClose} className="bw-btn-ghost">
                                <X className="w-5 h-5" aria-hidden />
                            </button>
                        </div>

                        {/* 탭 네비게이션 */}
                        <div className="aem-tabs">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button key={tab.id} type="button" onClick={() => setSelectedTab(tab.id)} className={`aem-tab ${selectedTab === tab.id ? 'active' : ''}`}>
                                        <Icon className="w-4 h-4" aria-hidden />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* 컨텐츠 */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-lg)' }}>
                            <AnimatePresence mode="wait">
                                {selectedTab === 'overview' && (
                                    <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                                        {/* 연결 상태 */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
                                            <div className="aem-stat-card">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                                                    <Activity className="w-5 h-5" style={{ color: 'var(--accent-info)' }} aria-hidden />
                                                    <span style={{ fontWeight: 500 }}>연결 상태</span>
                                                </div>
                                                <div className="aem-metric-value" style={{ fontSize: 'var(--font-size-lg)', color: getStatusColor(aiEngine.websocket.connectionStatus) }}>
                                                    {aiEngine.websocket.connectionStatus === 'connected' ? '연결됨' : aiEngine.websocket.connectionStatus === 'connecting' ? '연결 중' : aiEngine.websocket.connectionStatus === 'error' ? '오류' : '연결 끊김'}
                                                </div>
                                            </div>
                                            <div className="aem-stat-card">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                                                    <Brain className="w-5 h-5" style={{ color: 'var(--accent-secondary)' }} aria-hidden />
                                                    <span style={{ fontWeight: 500 }}>현재 모델</span>
                                                </div>
                                                <div className="aem-metric-value" style={{ fontSize: 'var(--font-size-lg)' }}>
                                                    {aiModels.currentModel}
                                                </div>
                                            </div>
                                            <div className="aem-stat-card">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                                                    <Zap className="w-5 h-5" style={{ color: 'var(--accent-warning)' }} aria-hidden />
                                                    <span style={{ fontWeight: 500 }}>실시간 분석</span>
                                                </div>
                                                <div className="aem-metric-value" style={{ fontSize: 'var(--font-size-lg)' }}>
                                                    {realtimeAnalysis.isActive ? '활성' : '비활성'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 성능 지표 */}
                                        <div className="bw-card" style={{ padding: 'var(--spacing-lg)' }}>
                                            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>성능 지표</h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 'var(--spacing-md)' }}>
                                                {[
                                                    { value: `${intelligentResponse.responseQuality}%`, label: '응답 품질', color: 'var(--accent-info)' },
                                                    { value: `${intelligentResponse.contextUnderstanding}%`, label: '컨텍스트 이해', color: 'var(--accent-success)' },
                                                    { value: `${realtimeAnalysis.confidence}%`, label: '분석 신뢰도', color: 'var(--accent-secondary)' },
                                                    { value: `${realtimeAnalysis.processingTime}ms`, label: '처리 시간', color: 'var(--accent-orange)' }
                                                ].map((m) => (
                                                    <div key={m.label} style={{ textAlign: 'center' }}>
                                                        <div className="aem-metric-value" style={{ color: m.color }}>{m.value}</div>
                                                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>{m.label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 에러 상태 */}
                                        {errors.hasError && (
                                            <div className="bw-alert-error" style={{ padding: 'var(--spacing-md)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                                                    <AlertTriangle className="w-5 h-5" style={{ color: 'var(--accent-error)' }} aria-hidden />
                                                    <span style={{ fontWeight: 500 }}>오류 발생</span>
                                                </div>
                                                <p style={{ marginBottom: 'var(--spacing-sm)' }}>{errors.errorMessage}</p>
                                                <button type="button" onClick={() => dispatch(clearError())} className="bw-btn-ghost" style={{ color: 'var(--accent-error)' }}>
                                                    오류 해제
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {selectedTab === 'models' && (
                                    <motion.div key="models" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                                        <div className="bw-card" style={{ padding: 'var(--spacing-lg)' }}>
                                            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>AI 모델 관리</h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--spacing-md)' }}>
                                                {aiModels.availableModels.map((model) => (
                                                    <div
                                                        key={model}
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={() => handleModelSwitch(model)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleModelSwitch(model)}
                                                        style={{
                                                            padding: 'var(--spacing-md)',
                                                            border: 'var(--border-width) solid',
                                                            borderColor: aiModels.currentModel === model ? 'var(--accent-info)' : 'var(--border-color)',
                                                            backgroundColor: aiModels.currentModel === model ? 'var(--accent-info-muted)' : 'transparent',
                                                            borderRadius: 'var(--radius-lg)',
                                                            cursor: 'pointer',
                                                            transition: 'border-color var(--transition-base), background var(--transition-base)'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <div>
                                                                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{model}</div>
                                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>성능: {aiModels.modelPerformance[model] || 0}%</div>
                                                            </div>
                                                            {aiModels.currentModel === model && <CheckCircle className="w-5 h-5" style={{ color: 'var(--accent-info)' }} aria-hidden />}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {aiModels.isModelLoading && (
                                            <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--accent-info-muted)', border: 'var(--border-width) solid var(--accent-info)', borderRadius: 'var(--radius-lg)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                    <div className="bw-spinner" style={{ width: 16, height: 16 }} />
                                                    <span style={{ color: 'var(--accent-info)' }}>모델 전환 중...</span>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {selectedTab === 'analytics' && (
                                    <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                                        <div className="bw-card" style={{ padding: 'var(--spacing-lg)' }}>
                                            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>실시간 분석</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                                <button type="button" onClick={handleStartRealtimeAnalysis} disabled={realtimeAnalysis.isActive} className="bw-btn-primary">
                                                    {realtimeAnalysis.isActive ? '분석 중...' : '분석 시작'}
                                                </button>
                                                {realtimeAnalysis.isActive && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: 'var(--accent-success)' }}>
                                                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--accent-success)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                                                        <span>실시간 분석 활성</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bw-card" style={{ padding: 'var(--spacing-lg)' }}>
                                            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>감정 분석 테스트</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                                <textarea value={testText} onChange={(e) => setTestText(e.target.value)} placeholder="분석할 텍스트를 입력하세요..." className="bw-input" rows={3} style={{ resize: 'none' }} />
                                                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                                    <button type="button" onClick={handleSentimentAnalysis} className="bw-btn-primary" style={{ background: 'var(--accent-success)', borderColor: 'var(--accent-success)' }}>감정 분석</button>
                                                    <button type="button" onClick={handleIntentDetection} className="bw-btn-secondary" style={{ color: 'var(--accent-secondary)', borderColor: 'var(--accent-secondary)' }}>의도 감지</button>
                                                </div>
                                            </div>
                                            {(advancedAnalytics.sentimentAnalysis.isActive || advancedAnalytics.intentRecognition.isActive) && (
                                                <div style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-md)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                                                    {advancedAnalytics.sentimentAnalysis.isActive && (
                                                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                                                                <MessageSquare className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} aria-hidden />
                                                                <span style={{ fontWeight: 500 }}>감정 분석 결과:</span>
                                                            </div>
                                                            <div style={{ fontWeight: 600, color: getSentimentColor(advancedAnalytics.sentimentAnalysis.currentSentiment) }}>
                                                                {advancedAnalytics.sentimentAnalysis.currentSentiment === 'positive' ? '긍정적' : advancedAnalytics.sentimentAnalysis.currentSentiment === 'negative' ? '부정적' : '중립적'}
                                                                ({advancedAnalytics.sentimentAnalysis.confidence}% 신뢰도)
                                                            </div>
                                                        </div>
                                                    )}
                                                    {advancedAnalytics.intentRecognition.isActive && (
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                                                                <Target className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} aria-hidden />
                                                                <span style={{ fontWeight: 500 }}>의도 감지 결과:</span>
                                                            </div>
                                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                                                {advancedAnalytics.intentRecognition.detectedIntent} ({advancedAnalytics.intentRecognition.confidence}% 신뢰도)
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {selectedTab === 'settings' && (
                                    <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                        <div className="bw-card" style={{ padding: 'var(--spacing-lg)' }}>
                                            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>AI 엔진 설정</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                                <div>
                                                    <label className="as-label" style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>웹소켓 연결 URL</label>
                                                    <input
                                                        type="text"
                                                        defaultValue={
                                                            process.env.REACT_APP_WEBSOCKET_URL ||
                                                            process.env.REACT_APP_WS_URL ||
                                                            resolveGenericWebSocketClientUrl()
                                                        }
                                                        className="bw-input"
                                                        readOnly
                                                    />
                                                </div>
                                                <div>
                                                    <label className="as-label" style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>재연결 시도 횟수</label>
                                                    <input type="number" defaultValue={5} className="bw-input" readOnly />
                                                </div>
                                                <div>
                                                    <label className="as-label" style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>하트비트 간격 (초)</label>
                                                    <input type="number" defaultValue={30} className="bw-input" readOnly />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AIEngineMonitor;
