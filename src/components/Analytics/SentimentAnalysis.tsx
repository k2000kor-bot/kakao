import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Heart, Smile, Meh, Frown, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface SentimentAnalysisProps {
    sessionId: string;
}

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ sessionId }) => {
    const { sessions } = useSelector((state: RootState) => state.sessions);
    const currentSession = sessions.find(s => s.id === sessionId);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const sentimentData = useMemo(() => {
        if (!currentSession) return null;

        const messages = currentSession.messages;
        const userMessages = messages.filter(m => m.role === 'user');
        const aiMessages = messages.filter(m => m.role === 'assistant');

        // 간단한 감정 분석 (키워드 기반)
        const positiveWords = ['좋다', '감사', '훌륭', '완벽', '최고', '좋은', '멋진', '대단', '성공', '행복'];
        const negativeWords = ['나쁘다', '실패', '문제', '어려움', '불만', '화나', '짜증', '실망', '힘들', '스트레스'];
        const neutralWords = ['일반', '보통', '평범', '그냥', '그대로', '동일', '같다'];

        let positiveCount = 0;
        let negativeCount = 0;
        let neutralCount = 0;

        // 사용자 메시지 감정 분석
        userMessages.forEach(message => {
            const content = message.content.toLowerCase();
            const positiveMatches = positiveWords.filter(word => content.includes(word)).length;
            const negativeMatches = negativeWords.filter(word => content.includes(word)).length;
            const neutralMatches = neutralWords.filter(word => content.includes(word)).length;

            if (positiveMatches > negativeMatches && positiveMatches > neutralMatches) {
                positiveCount++;
            } else if (negativeMatches > positiveMatches && negativeMatches > neutralMatches) {
                negativeCount++;
            } else {
                neutralCount++;
            }
        });

        const totalMessages = userMessages.length;
        const positivePercentage = totalMessages > 0 ? (positiveCount / totalMessages) * 100 : 0;
        const negativePercentage = totalMessages > 0 ? (negativeCount / totalMessages) * 100 : 0;
        const neutralPercentage = totalMessages > 0 ? (neutralCount / totalMessages) * 100 : 0;

        // 감정 변화 추이
        const sentimentTrend = [];
        const chunkSize = Math.max(1, Math.floor(userMessages.length / 5));

        for (let i = 0; i < userMessages.length; i += chunkSize) {
            const chunk = userMessages.slice(i, i + chunkSize);
            let chunkPositive = 0;
            let chunkNegative = 0;

            chunk.forEach(message => {
                const content = message.content.toLowerCase();
                const positiveMatches = positiveWords.filter(word => content.includes(word)).length;
                const negativeMatches = negativeWords.filter(word => content.includes(word)).length;

                if (positiveMatches > negativeMatches) {
                    chunkPositive++;
                } else if (negativeMatches > positiveMatches) {
                    chunkNegative++;
                }
            });

            const chunkSentiment = chunkPositive > chunkNegative ? 'positive' :
                chunkNegative > chunkPositive ? 'negative' : 'neutral';
            sentimentTrend.push(chunkSentiment);
        }

        return {
            positiveCount,
            negativeCount,
            neutralCount,
            positivePercentage,
            negativePercentage,
            neutralPercentage,
            sentimentTrend,
            totalMessages
        };
    }, [currentSession]);

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case 'positive':
                return <Smile size={16} className="text-green-600" />;
            case 'negative':
                return <Frown size={16} className="text-red-600" />;
            default:
                return <Meh size={16} className="text-gray-600" />;
        }
    };

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'negative':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    if (!sentimentData) {
        return (
            <div className="p-6 text-center text-gray-500">
                <Heart size={48} className="mx-auto mb-4 text-gray-300" />
                <p>분석할 메시지가 없습니다</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
                <Heart size={24} className="text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">감정 분석</h3>
            </div>

            {/* 감정 분포 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 p-4 rounded-lg border border-green-200 text-center"
                >
                    <Smile size={32} className="mx-auto mb-2 text-green-600" />
                    <p className="text-sm text-green-600">긍정적</p>
                    <p className="text-2xl font-bold text-green-900">{sentimentData.positiveCount}</p>
                    <p className="text-xs text-green-600">{sentimentData.positivePercentage.toFixed(1)}%</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center"
                >
                    <Meh size={32} className="mx-auto mb-2 text-gray-600" />
                    <p className="text-sm text-gray-600">중립적</p>
                    <p className="text-2xl font-bold text-gray-900">{sentimentData.neutralCount}</p>
                    <p className="text-xs text-gray-600">{sentimentData.neutralPercentage.toFixed(1)}%</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-red-50 p-4 rounded-lg border border-red-200 text-center"
                >
                    <Frown size={32} className="mx-auto mb-2 text-red-600" />
                    <p className="text-sm text-red-600">부정적</p>
                    <p className="text-2xl font-bold text-red-900">{sentimentData.negativeCount}</p>
                    <p className="text-xs text-red-600">{sentimentData.negativePercentage.toFixed(1)}%</p>
                </motion.div>
            </div>

            {/* 감정 변화 추이 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">감정 변화 추이</h4>
                <div className="flex items-center space-x-2">
                    {sentimentData.sentimentTrend.map((sentiment, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center space-x-1 px-3 py-2 rounded-lg border ${getSentimentColor(sentiment)}`}
                        >
                            {getSentimentIcon(sentiment)}
                            <span className="text-sm font-medium">
                                {sentiment === 'positive' ? '긍정' : sentiment === 'negative' ? '부정' : '중립'}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* 감정 통계 */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-3">감정 분석 통계</h4>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">총 분석 메시지</span>
                        <span className="text-sm font-medium text-blue-900">{sentimentData.totalMessages}개</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">주요 감정</span>
                        <span className="text-sm font-medium text-blue-900">
                            {sentimentData.positivePercentage > sentimentData.negativePercentage ? '긍정적' : '부정적'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">감정 안정성</span>
                        <span className="text-sm font-medium text-blue-900">
                            {Math.abs(sentimentData.positivePercentage - sentimentData.negativePercentage) < 20 ? '안정적' : '변동적'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SentimentAnalysis;
