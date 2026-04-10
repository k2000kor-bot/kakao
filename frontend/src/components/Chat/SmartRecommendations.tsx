import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lightbulb,
    TrendingUp,
    Code,
    BookOpen,
    Settings,
    Star,
    Clock,
    Zap,
    Target,
    Sparkles
} from 'lucide-react';
import { recommendationService, Recommendation } from '../../services/recommendationService';

interface SmartRecommendationsProps {
    currentMessage?: string;
    onRecommendationClick: (recommendation: Recommendation) => void;
    showPersonalized?: boolean;
    showContextual?: boolean;
}

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
    currentMessage = '',
    onRecommendationClick,
    showPersonalized = true,
    showContextual = true
}) => {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [contextualRecommendations, setContextualRecommendations] = useState<Recommendation[]>([]);
    const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'personalized' | 'contextual' | 'suggestions'>('personalized');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadRecommendations();
    }, []);

    useEffect(() => {
        if (currentMessage && showContextual) {
            loadContextualRecommendations();
            loadSmartSuggestions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- loadContextualRecommendations, loadSmartSuggestions are stable
    }, [currentMessage, showContextual]);

    const loadRecommendations = () => {
        setIsLoading(true);
        const personalized = recommendationService.getPersonalizedRecommendations(6);
        setRecommendations(personalized);
        setIsLoading(false);
    };

    const loadContextualRecommendations = () => {
        const contextual = recommendationService.getContextualRecommendations(currentMessage, 4);
        setContextualRecommendations(contextual);
    };

    const loadSmartSuggestions = () => {
        const suggestions = recommendationService.generateSmartSuggestions(currentMessage);
        setSmartSuggestions(suggestions);
    };

    const handleRecommendationClick = (recommendation: Recommendation) => {
        recommendationService.recordRecommendationUsage(recommendation.id);
        onRecommendationClick(recommendation);
    };

    const getRecommendationIcon = (type: Recommendation['type']) => {
        switch (type) {
            case 'question':
                return <BookOpen size={16} className="bw-text-info" />;
            case 'topic':
                return <TrendingUp size={16} className="bw-text-success" />;
            case 'action':
                return <Target size={16} className="bw-text-info" />;
            case 'suggestion':
                return <Lightbulb size={16} className="bw-text-warning" />;
            default:
                return <Sparkles size={16} className="bw-text-muted" />;
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence > 0.8) return 'bw-text-success';
        if (confidence > 0.6) return 'bw-text-warning';
        return 'bw-text-error';
    };

    const getConfidenceText = (confidence: number) => {
        if (confidence > 0.8) return '매우 관련';
        if (confidence > 0.6) return '관련';
        return '낮은 관련';
    };

    const RecommendationCard: React.FC<{ recommendation: Recommendation }> = ({ recommendation }) => (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRecommendationClick(recommendation)}
            className="bw-card rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200"
        >
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                    {getRecommendationIcon(recommendation.type)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold bw-text-primary truncate">
                            {recommendation.title}
                        </h4>
                        <div className="flex items-center space-x-1">
                            <Star size={12} className="bw-text-warning" />
                            <span className="text-xs bw-text-muted">
                                {recommendation.metadata?.usageCount || 0}
                            </span>
                        </div>
                    </div>
                    <p className="text-xs bw-text-secondary mb-2 line-clamp-2">
                        {recommendation.description}
                    </p>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className={`text-xs font-medium ${getConfidenceColor(recommendation.confidence)}`}>
                                {getConfidenceText(recommendation.confidence)}
                            </span>
                            <div className="w-12 h-1 bw-progress-bar rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bw-progress-fill"
                                    style={{ background: 'var(--accent-success)' }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${recommendation.confidence * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {recommendation.tags.slice(0, 2).map((tag, index) => (
                                <span key={index} className="bw-badge px-2 py-1 text-xs rounded-full">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const SuggestionCard: React.FC<{ suggestion: string; index: number }> = ({ suggestion, index }) => (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bw-card-secondary rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-200 border border-[var(--accent-info-border)]"
        >
            <div className="flex items-center space-x-2">
                <Zap size={14} className="bw-text-info" />
                <span className="text-sm bw-text-primary">{suggestion}</span>
            </div>
        </motion.div>
    );

    return (
        <div className="bw-card-secondary rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Sparkles size={20} className="bw-text-info" />
                    <h3 className="text-lg font-semibold bw-text-primary">AI 추천</h3>
                </div>
                <button type="button" onClick={loadRecommendations} className="bw-btn-ghost p-2 rounded-lg" aria-label="AI 추천 새로고침">
                    <Settings size={16} className="bw-text-muted" aria-hidden="true" />
                </button>
            </div>

            <div className="flex space-x-1 mb-4 bw-card rounded-lg p-1">
                {showPersonalized && (
                    <button
                        type="button"
                        onClick={() => setActiveTab('personalized')}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'personalized' ? 'bw-btn-primary' : 'bw-btn-ghost bw-text-secondary'}`}
                    >
                        개인화
                    </button>
                )}
                {showContextual && currentMessage && (
                    <button
                        type="button"
                        onClick={() => setActiveTab('contextual')}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'contextual' ? 'bw-btn-primary' : 'bw-btn-ghost bw-text-secondary'}`}
                    >
                        컨텍스트
                    </button>
                )}
                {smartSuggestions.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setActiveTab('suggestions')}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'suggestions' ? 'bw-btn-primary' : 'bw-btn-ghost bw-text-secondary'}`}
                    >
                        제안
                    </button>
                )}
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-8">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Sparkles size={24} className="bw-text-info" />
                    </motion.div>
                </div>
            )}

            {/* 추천 내용 */}
            <AnimatePresence mode="wait">
                {activeTab === 'personalized' && showPersonalized && (
                    <motion.div
                        key="personalized"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-3"
                    >
                        {recommendations.length > 0 ? (
                            recommendations.map((recommendation) => (
                                <RecommendationCard key={recommendation.id} recommendation={recommendation} />
                            ))
                        ) : (
                            <div className="bw-empty py-8">
                                <Lightbulb size={48} className="mx-auto mb-2 bw-empty-icon" />
                                <p>아직 개인화된 추천이 없습니다</p>
                                <p className="text-sm">더 많은 대화를 나누면 맞춤형 추천을 받을 수 있습니다</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'contextual' && showContextual && currentMessage && (
                    <motion.div
                        key="contextual"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-3"
                    >
                        {contextualRecommendations.length > 0 ? (
                            contextualRecommendations.map((recommendation) => (
                                <RecommendationCard key={recommendation.id} recommendation={recommendation} />
                            ))
                        ) : (
                            <div className="bw-empty py-8">
                                <Code size={48} className="mx-auto mb-2 bw-empty-icon" />
                                <p>현재 컨텍스트에 맞는 추천이 없습니다</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'suggestions' && smartSuggestions.length > 0 && (
                    <motion.div
                        key="suggestions"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-2"
                    >
                        {smartSuggestions.map((suggestion, index) => (
                            <SuggestionCard key={index} suggestion={suggestion} index={index} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 사용 통계 */}
            {recommendations.length > 0 && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center justify-between text-xs bw-text-muted">
                        <span>총 {recommendations.length}개의 추천</span>
                        <div className="flex items-center space-x-2">
                            <Clock size={12} />
                            <span>실시간 업데이트</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartRecommendations;
