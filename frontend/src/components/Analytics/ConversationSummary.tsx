import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { FileText, Sparkles, Copy, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConversationSummaryProps {
  sessionId: string;
}

const ConversationSummary: React.FC<ConversationSummaryProps> = ({ sessionId }) => {
  const { sessions } = useSelector((state: RootState) => state.sessions);
  const currentSession = sessions.find(s => s.id === sessionId);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<string>('');

  const conversationData = useMemo(() => {
    if (!currentSession) return null;

    const messages = currentSession.messages;
    const userMessages = messages.filter(m => m.role === 'user');
    const aiMessages = messages.filter(m => m.role === 'assistant');
    const bookmarkedMessages = messages.filter(m => m.isBookmarked);

    // 주요 키워드 추출 (간단한 버전)
    const allText = messages.map(m => m.content).join(' ');
    const words = allText.toLowerCase()
      .replace(/[^\w\s가-힣]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 1);
    
    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    const keywords = Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    return {
      totalMessages: messages.length,
      userMessages: userMessages.length,
      aiMessages: aiMessages.length,
      bookmarkedMessages: bookmarkedMessages.length,
      keywords,
      duration: messages.length > 0 
        ? Math.round((new Date(messages[messages.length - 1].timestamp).getTime() - 
                     new Date(messages[0].timestamp).getTime()) / (1000 * 60))
        : 0,
      topics: extractTopics(messages)
    };
  }, [currentSession]);

  const extractTopics = (messages: any[]) => {
    const topics = new Set<string>();
    const topicKeywords = {
      '코딩': ['코드', '프로그래밍', '개발', '함수', '클래스', '변수', 'API'],
      '디자인': ['디자인', 'UI', 'UX', '레이아웃', '색상', '폰트'],
      '비즈니스': ['비즈니스', '마케팅', '전략', '수익', '고객', '서비스'],
      '학습': ['학습', '교육', '강의', '튜토리얼', '가이드', '설명'],
      '기술': ['기술', '테크', '인터넷', '소프트웨어', '하드웨어']
    };

    const allText = messages.map(m => m.content).join(' ').toLowerCase();
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => allText.includes(keyword))) {
        topics.add(topic);
      }
    });

    return Array.from(topics);
  };

  const generateSummary = async () => {
    if (!conversationData) return;

    setIsGenerating(true);
    
    // 실제로는 AI API를 호출하여 요약을 생성
    // 여기서는 간단한 템플릿 기반 요약을 생성
    setTimeout(() => {
      const summaryText = `
📊 대화 요약

총 메시지: ${conversationData.totalMessages}개
사용자 메시지: ${conversationData.userMessages}개
AI 응답: ${conversationData.aiMessages}개
북마크된 메시지: ${conversationData.bookmarkedMessages}개
대화 시간: ${conversationData.duration}분

🎯 주요 주제: ${conversationData.topics.join(', ') || '일반적인 대화'}

🔑 주요 키워드: ${conversationData.keywords.slice(0, 5).join(', ')}

💡 대화 특징:
- ${conversationData.userMessages > conversationData.aiMessages ? '사용자가 주도적인 대화' : 'AI가 상세히 응답하는 대화'}
- ${conversationData.bookmarkedMessages > 0 ? `${conversationData.bookmarkedMessages}개의 중요한 메시지가 북마크됨` : '북마크된 메시지 없음'}
- ${conversationData.duration > 30 ? '장시간에 걸친 심도 있는 대화' : '간단한 질의응답'}
      `.trim();

      setSummary(summaryText);
      setIsGenerating(false);
    }, 2000);
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      // 복사 성공 알림
    } catch (error) {
      console.error('Failed to copy summary:', error);
    }
  };

  if (!conversationData) {
    return (
      <div className="p-6 text-center text-gray-500">
        <FileText size={48} className="mx-auto mb-4 text-gray-300" />
        <p>요약할 대화가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FileText size={24} className="text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">대화 요약</h3>
        </div>
        <button
          onClick={generateSummary}
          disabled={isGenerating}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>생성 중...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>요약 생성</span>
            </>
          )}
        </button>
      </div>

      {/* 기본 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">총 메시지</p>
          <p className="text-2xl font-bold text-blue-900">{conversationData.totalMessages}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600">사용자</p>
          <p className="text-2xl font-bold text-green-900">{conversationData.userMessages}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-600">AI 응답</p>
          <p className="text-2xl font-bold text-purple-900">{conversationData.aiMessages}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-600">북마크</p>
          <p className="text-2xl font-bold text-yellow-900">{conversationData.bookmarkedMessages}</p>
        </div>
      </div>

      {/* 키워드 */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">주요 키워드</h4>
        <div className="flex flex-wrap gap-2">
          {conversationData.keywords.slice(0, 8).map((keyword, index) => (
            <motion.span
              key={keyword}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="px-3 py-1 bg-white text-sm text-gray-700 rounded-full border border-gray-200"
            >
              {keyword}
            </motion.span>
          ))}
        </div>
      </div>

      {/* 주제 */}
      {conversationData.topics.length > 0 && (
        <div className="bg-indigo-50 p-4 rounded-lg mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">주요 주제</h4>
          <div className="flex flex-wrap gap-2">
            {conversationData.topics.map((topic, index) => (
              <motion.span
                key={topic}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="px-3 py-1 bg-indigo-100 text-sm text-indigo-700 rounded-full"
              >
                {topic}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* 요약 결과 */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">AI 생성 요약</h4>
            <button
              onClick={copySummary}
              className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            >
              <Copy size={14} />
              <span>복사</span>
            </button>
          </div>
          <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
            {summary}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ConversationSummary;
