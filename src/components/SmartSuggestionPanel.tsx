import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, MessageCircle, FileText, BarChart3 } from 'lucide-react';

interface Prediction {
    action: string;
    description: string;
    probability: number;
    suggested_prompt: string;
}

interface SmartSuggestionPanelProps {
    isVisible: boolean;
    recentActions: string[];
    onSuggestionClick: (prompt: string) => void;
    onClose: () => void;
}

const SmartSuggestionPanel: React.FC<SmartSuggestionPanelProps> = ({
    isVisible,
    recentActions,
    onSuggestionClick,
    onClose
}) => {
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchPredictions = async () => {
        try {
            setIsLoading(true);

            const response = await fetch('http://localhost:8000/api/v7/predict/next-action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    context: { timestamp: new Date().toISOString() },
                    recent_actions: recentActions
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    setPredictions(data.predictions);
                }
            }
        } catch (error) {
            console.error('예측 데이터 가져오기 오류:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isVisible && recentActions.length > 0) {
            fetchPredictions();
        }
    }, [isVisible, recentActions]);

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'file_analysis_request':
                return <FileText size={16} className="text-blue-600" />;
            case 'project_status_check':
                return <BarChart3 size={16} className="text-green-600" />;
            case 'detailed_analysis_request':
                return <TrendingUp size={16} className="text-purple-600" />;
            case 'system_status_check':
                return <MessageCircle size={16} className="text-orange-600" />;
            default:
                return <Lightbulb size={16} className="text-yellow-600" />;
        }
    };

    const getProbabilityColor = (probability: number) => {
        if (probability >= 0.8) return 'text-green-600 bg-green-50';
        if (probability >= 0.6) return 'text-yellow-600 bg-yellow-50';
        return 'text-gray-600 bg-gray-50';
    };

    const handleSuggestionClick = (prompt: string) => {
        onSuggestionClick(prompt);
        onClose();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-20 right-4 bg-white rounded-lg shadow-xl border max-w-sm w-full z-40">
            <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800 flex items-center">
                        <Lightbulb className="mr-2" size={18} />
                        스마트 제안
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ×
                    </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                    AI가 다음 작업을 예측했습니다
                </p>
            </div>

            <div className="p-4">
                {isLoading ? (
                    <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-600 mt-2">분석 중...</p>
                    </div>
                ) : predictions.length > 0 ? (
                    <div className="space-y-3">
                        {predictions.map((prediction, index) => (
                            <div
                                key={index}
                                className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                                onClick={() => handleSuggestionClick(prediction.suggested_prompt)}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center">
                                        {getActionIcon(prediction.action)}
                                        <span className="ml-2 font-medium text-gray-800 text-sm">
                                            {prediction.description}
                                        </span>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded ${getProbabilityColor(prediction.probability)}`}>
                                        {(prediction.probability * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 italic">
                                    "{prediction.suggested_prompt}"
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <Lightbulb className="mx-auto text-gray-400 mb-2" size={24} />
                        <p className="text-sm text-gray-600">
                            아직 충분한 데이터가 없습니다
                        </p>
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <p className="text-xs text-gray-500 text-center">
                    최근 활동을 기반으로 한 AI 예측입니다
                </p>
            </div>
        </div>
    );
};

export default SmartSuggestionPanel;
