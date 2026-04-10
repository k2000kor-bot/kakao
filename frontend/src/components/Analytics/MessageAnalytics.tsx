import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { BarChart as LucideBarChart, MessageSquare, Clock, TrendingUp, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';

interface MessageAnalyticsProps {
  sessionId: string;
}

const MessageAnalytics: React.FC<MessageAnalyticsProps> = ({ sessionId }) => {
  const { sessions } = useSelector((state: RootState) => state.sessions);
  const currentSession = sessions.find(s => s.id === sessionId);

  const analytics = useMemo(() => {
    if (!currentSession) return null;

    const messages = currentSession.messages;
    const userMessages = messages.filter(m => m.role === 'user');
    const aiMessages = messages.filter(m => m.role === 'assistant');
    const bookmarkedMessages = messages.filter(m => m.isBookmarked);

    // 평균 응답 시간 계산
    const responseTimes = [];
    for (let i = 0; i < messages.length - 1; i++) {
      if (messages[i].role === 'user' && messages[i + 1].role === 'assistant') {
        const userTime = new Date(messages[i].timestamp).getTime();
        const aiTime = new Date(messages[i + 1].timestamp).getTime();
        responseTimes.push(aiTime - userTime);
      }
    }
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;

    // 가장 긴 대화 구간 찾기
    let maxConsecutiveMessages = 0;
    let currentConsecutive = 0;
    for (const message of messages) {
      if (message.role === 'user') {
        currentConsecutive++;
        maxConsecutiveMessages = Math.max(maxConsecutiveMessages, currentConsecutive);
      } else {
        currentConsecutive = 0;
      }
    }

    // 시간대별 메시지 분포
    const hourDistribution = new Array(24).fill(0);
    messages.forEach(message => {
      const hour = new Date(message.timestamp).getHours();
      hourDistribution[hour]++;
    });

    return {
      totalMessages: messages.length,
      userMessages: userMessages.length,
      aiMessages: aiMessages.length,
      bookmarkedMessages: bookmarkedMessages.length,
      avgResponseTime: Math.round(avgResponseTime / 1000), // 초 단위
      maxConsecutiveMessages,
      hourDistribution,
      sessionDuration: messages.length > 0 
        ? Math.round((new Date(messages[messages.length - 1].timestamp).getTime() - 
                     new Date(messages[0].timestamp).getTime()) / (1000 * 60)) // 분 단위
        : 0
    };
  }, [currentSession]);

  if (!analytics) {
    return (
      <div className="bw-empty">
        <LucideBarChart size={48} className="mx-auto bw-empty-icon" />
        <p>분석할 메시지가 없습니다</p>
      </div>
    );
  }

  const stats = [
    { title: '총 메시지', value: analytics.totalMessages, icon: MessageSquare, borderVar: '--accent-info' as const, colorClass: 'bw-text-info' },
    { title: '사용자 메시지', value: analytics.userMessages, icon: MessageSquare, borderVar: '--accent-success' as const, colorClass: 'bw-text-success' },
    { title: 'AI 응답', value: analytics.aiMessages, icon: MessageSquare, borderVar: '--accent-secondary' as const, colorClass: 'bw-text-info' },
    { title: '북마크', value: analytics.bookmarkedMessages, icon: Bookmark, borderVar: '--accent-warning-muted' as const, colorClass: 'bw-text-warning' },
    { title: '평균 응답시간', value: `${analytics.avgResponseTime}초`, icon: Clock, borderVar: '--accent-error-border' as const, colorClass: 'bw-text-error' },
    { title: '세션 시간', value: `${analytics.sessionDuration}분`, icon: TrendingUp, borderVar: '--accent-info-muted' as const, colorClass: 'bw-text-info' }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center space-x-2 mb-6">
        <LucideBarChart size={24} className="bw-text-primary" />
        <h3 className="bw-heading-2 mb-0">대화 분석</h3>
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bw-card-secondary p-4"
            style={{ borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: `var(${stat.borderVar})` }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg shrink-0" style={{ background: `var(${stat.borderVar})`, opacity: 0.25 }}>
                <stat.icon size={20} className={stat.colorClass} />
              </div>
              <div className="min-w-0">
                <p className="text-sm bw-text-secondary">{stat.title}</p>
                <p className="text-lg font-semibold bw-text-primary">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 시간대별 분포 차트 */}
      <div className="bw-card p-4">
        <h4 className="bw-card-title-sm">시간대별 메시지 분포</h4>
        <div className="flex items-end space-x-1 h-32">
          {analytics.hourDistribution.map((count, hour) => {
            const maxCount = Math.max(...analytics.hourDistribution);
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return (
              <div key={hour} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full rounded-t transition-all duration-300"
                  style={{ height: `${height}%`, backgroundColor: 'var(--accent-info)' }}
                  title={`${hour}시: ${count}개 메시지`}
                />
                <span className="text-xs bw-text-muted mt-1">{hour}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MessageAnalytics;
