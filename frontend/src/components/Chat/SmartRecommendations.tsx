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
                return <BookOpen size={16} className="text-blue-500" />;
            case 'topic':
                return <TrendingUp size={16} className="text-green-500" />;
            case 'action':
                return <Target size={16} className="text-purple-500" />;
            case 'suggestion':
                return <Lightbulb size={16} className="text-yellow-500" />;
            default:
                return <Sparkles size={16} className="text-gray-500" />;
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence > 0.8) return 'text-green-600';
        if (confidence > 0.6) return 'text-yellow-600';
        return 'text-red-600';
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
            className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-blue-300"
        >
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                    {getRecommendationIcon(recommendation.type)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {recommendation.title}
                        </h4>
                        <div className="flex items-center space-x-1">
                            <Star size={12} className="text-yellow-400" />
                            <span className="text-xs text-gray-500">
                                {recommendation.metadata?.usageCount || 0}
                            </span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {recommendation.description}
                    </p>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className={`text-xs font-medium ${getConfidenceColor(recommendation.confidence)}`}>
                                {getConfidenceText(recommendation.confidence)}
                            </span>
                            <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-green-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${recommendation.confidence * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {recommendation.tags.slice(0, 2).map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                                >
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
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-200"
        >
            <div className="flex items-center space-x-2">
                <Zap size={14} className="text-blue-500" />
                <span className="text-sm text-blue-800">{suggestion}</span>
            </div>
        </motion.div>
    );

    return (
        <div className="bg-gray-50 rounded-lg p-4">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Sparkles size={20} className="text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900">AI 추천</h3>
                </div>
                <button
                    onClick={loadRecommendations}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                >
                    <Settings size={16} />
                </button>
            </div>

            {/* 탭 네비게이션 */}
            <div className="flex space-x-1 mb-4 bg-white rounded-lg p-1">
                {showPersonalized && (
                    <button
                        onClick={() => setActiveTab('personalized')}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'personalized'
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        개인화
                    </button>
                )}
                {showContextual && currentMessage && (
                    <button
                        onClick={() => setActiveTab('contextual')}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'contextual'
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        컨텍스트
                    </button>
                )}
                {smartSuggestions.length > 0 && (
                    <button
                        onClick={() => setActiveTab('suggestions')}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'suggestions'
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        제안
                    </button>
                )}
            </div>

            {/* 로딩 상태 */}
            {isLoading && (
                <div className="flex items-center justify-center py-8">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <Sparkles size={24} className="text-blue-500" />
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
                            <div className="text-center py-8 text-gray-500">
                                <Lightbulb size={48} className="mx-auto mb-2 text-gray-300" />
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
                            <div className="text-center py-8 text-gray-500">
                                <Code size={48} className="mx-auto mb-2 text-gray-300" />
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
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
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
