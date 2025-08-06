import React, { useState, useEffect } from 'react';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  type: 'text' | 'analysis' | 'chart';
}

interface AdvancedAIAnalyticsProps {
  roomId?: string;
}

const AdvancedAIAnalytics: React.FC<AdvancedAIAnalyticsProps> = ({ roomId }) => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 채팅 기능 추가
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    if (roomId) {
      loadAnalyticsData();
    }
  }, [roomId]);

  // 초기 환영 메시지
  useEffect(() => {
    setChatMessages([
      {
        id: '1',
        content: '안녕하세요! AI 분석 도우미입니다. 🤖\n\n사용 가능한 기능들:\n• 📊 분석 통계 보기\n• 📈 차트 생성\n• 🔍 특정 데이터 분석\n• 💬 분석 결과 질문\n• 📋 보고서 생성\n\n어떤 분석이 필요하신가요?',
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        type: 'text'
      }
    ]);
  }, []);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // 실제 API 호출 대신 샘플 데이터 사용
      setAnalyticsData({
        messageCount: 1250,
        participants: 8,
        averageResponseTime: 2.3,
        sentimentScore: 0.65,
        engagementRate: 0.78,
        topKeywords: ['프로젝트', '개발', '계획', '진행', '완료'],
        timeDistribution: {
          morning: 25,
          afternoon: 45,
          evening: 30
        }
      });
    } catch (error) {
      console.error('분석 데이터 로딩 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 채팅 메시지 전송
  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: chatInput.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    // AI 응답 처리
    setTimeout(() => {
      const response = processChatRequest(chatInput.trim());
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      setChatMessages(prev => [...prev, assistantMessage]);
      setIsChatLoading(false);
    }, 1000);
  };

  // 채팅 요청 처리
  const processChatRequest = (request: string): string => {
    const lowerRequest = request.toLowerCase();

    if (lowerRequest.includes('통계') || lowerRequest.includes('statistics')) {
      if (!analyticsData) {
        return '📊 분석 데이터가 아직 준비되지 않았습니다. 먼저 "분석 시작" 버튼을 클릭하여 데이터를 수집하고 분석해주세요. 분석이 완료되면 상세한 통계 정보를 제공해드릴 수 있습니다.';
      }
      
      const sentimentLevel = analyticsData.sentimentScore > 0.7 ? '매우 긍정적' : 
                           analyticsData.sentimentScore > 0.5 ? '긍정적' : 
                           analyticsData.sentimentScore > 0.3 ? '중립적' : '부정적';
      
      const engagementLevel = analyticsData.engagementRate > 0.8 ? '매우 높음' : 
                            analyticsData.engagementRate > 0.6 ? '높음' : 
                            analyticsData.engagementRate > 0.4 ? '보통' : '낮음';
      
      return `📊 **상세 분석 통계 보고서**

**📈 기본 지표**
• 총 메시지 수: ${analyticsData.messageCount}개 (평균 ${(analyticsData.messageCount / analyticsData.participants).toFixed(1)}개/인)
• 활성 참여자: ${analyticsData.participants}명
• 평균 응답시간: ${analyticsData.averageResponseTime}초 (${analyticsData.averageResponseTime < 30 ? '매우 빠름' : analyticsData.averageResponseTime < 60 ? '빠름' : '보통'})

**😊 감정 분석**
• 전체 감정 점수: ${(analyticsData.sentimentScore * 100).toFixed(1)}% (${sentimentLevel})
• 참여도 수준: ${(analyticsData.engagementRate * 100).toFixed(1)}% (${engagementLevel})

**💡 인사이트**
${analyticsData.sentimentScore > 0.6 ? '• 전반적으로 긍정적인 분위기로 대화가 활발하게 이루어지고 있습니다.' : '• 감정 점수가 다소 낮아 대화 분위기 개선이 필요할 수 있습니다.'}
${analyticsData.engagementRate > 0.7 ? '• 높은 참여도로 모든 참여자들이 적극적으로 소통하고 있습니다.' : '• 참여도를 높이기 위한 추가적인 활동이 필요할 수 있습니다.'}

이러한 데이터를 바탕으로 더 구체적인 분석이나 개선 방안을 제시해드릴 수 있습니다.`;
    }

    if (lowerRequest.includes('차트') || lowerRequest.includes('chart')) {
      return `📈 **차트 및 시각화 옵션**

**📊 사용 가능한 차트 유형**

**1. 시간대별 분석 차트**
• 오전/오후/저녁 메시지 분포
• 시간대별 참여도 변화
• 피크 시간대 식별

**2. 참여자 활동 차트**
• 개인별 메시지 수
• 참여자별 응답시간
• 활성도 순위

**3. 감정 변화 추이**
• 일별/주별 감정 점수 변화
• 긍정/부정 키워드 트렌드
• 감정 패턴 분석

**4. 키워드 분석 차트**
• 상위 키워드 워드클라우드
• 키워드 빈도 변화
• 연관 키워드 네트워크

**5. 대화 패턴 분석**
• 메시지 길이 분포
• 대화 주제 변화
• 반응 패턴 분석

어떤 차트를 생성하시겠습니까? 구체적인 차트 유형을 말씀해 주시면 상세한 분석을 제공해드리겠습니다.`;
    }

    if (lowerRequest.includes('키워드') || lowerRequest.includes('keyword')) {
      if (!analyticsData) {
        return '🔍 키워드 분석을 위해서는 먼저 데이터 분석이 필요합니다. "분석 시작" 버튼을 클릭하여 데이터를 수집한 후 키워드 분석을 진행해주세요.';
      }
      
      const keywordInsights = analyticsData.topKeywords.map((keyword: string, index: number) => {
        const frequency = Math.random() * 50 + 20; // 임시 빈도 계산
        return `${index + 1}. **${keyword}** (${frequency.toFixed(0)}회 언급)`;
      }).join('\n');
      
      return `🔍 **키워드 분석 보고서**

**📝 상위 키워드 (빈도순)**
${keywordInsights}

**💡 키워드 인사이트**
• **가장 자주 언급된 키워드**: "${analyticsData.topKeywords[0]}" - 이는 대화의 주요 주제임을 나타냅니다.
• **키워드 다양성**: ${analyticsData.topKeywords.length}개의 주요 키워드가 식별되었습니다.
• **주제 분포**: ${analyticsData.topKeywords.slice(0, 3).join(', ')} 등이 주요 관심사입니다.

**📊 키워드 트렌드**
• 최근 7일간 "${analyticsData.topKeywords[0]}" 키워드 사용량이 증가 추세입니다.
• "${analyticsData.topKeywords[1]}" 키워드는 안정적인 관심을 받고 있습니다.
• 새로운 키워드들이 지속적으로 등장하고 있어 대화가 활발함을 보여줍니다.

**🎯 키워드 활용 방안**
• 주요 키워드를 활용한 콘텐츠 제작
• 키워드 기반 자동 응답 시스템 구축
• 키워드 트렌드 모니터링 시스템

더 구체적인 키워드 분석이나 특정 키워드에 대한 상세 정보가 필요하시면 말씀해 주세요.`;
    }

    if (lowerRequest.includes('보고서') || lowerRequest.includes('report')) {
      return `📋 **보고서 생성 시스템**

**📊 사용 가능한 보고서 유형**

**1. 일일 활동 보고서**
• 오늘의 메시지 통계
• 주요 활동 요약
• 참여자별 기여도
• 감정 변화 추이

**2. 주간 트렌드 분석**
• 주간 메시지 패턴
• 인기 주제 변화
• 참여도 트렌드
• 성과 지표 변화

**3. 월간 성과 요약**
• 월간 통계 종합
• 목표 달성도
• 개선 사항 분석
• 다음 달 계획

**4. 사용자 행동 분석**
• 개인별 활동 패턴
• 선호 주제 분석
• 참여 시간대 분석
• 상호작용 패턴

**5. 커스텀 보고서**
• 특정 기간 분석
• 주제별 필터링
• 참여자 그룹 분석
• 성과 비교 분석

**🎯 보고서 기능**
• PDF/Excel 형식 다운로드
• 자동 이메일 발송
• 실시간 업데이트
• 대시보드 연동

어떤 유형의 보고서를 생성하시겠습니까? 구체적인 요구사항을 말씀해 주시면 맞춤형 보고서를 작성해드리겠습니다.`;
    }

    if (lowerRequest.includes('도움') || lowerRequest.includes('help')) {
      return `🎯 **AI 분석 시스템 도움말**

**📊 주요 기능**

**1. 통계 분석**
• "통계 보기" - 상세한 분석 통계와 인사이트 제공
• "기본 통계" - 핵심 지표 요약
• "고급 통계" - 심화 분석 결과

**2. 시각화 차트**
• "차트 생성" - 다양한 차트 옵션 제공
• "시간대 분석" - 시간별 패턴 시각화
• "참여자 차트" - 개인별 활동 분석

**3. 키워드 분석**
• "키워드 분석" - 주요 키워드와 트렌드 분석
• "키워드 상세" - 특정 키워드 심화 분석
• "키워드 트렌드" - 키워드 변화 추이

**4. 보고서 생성**
• "보고서 생성" - 다양한 형식의 보고서
• "일일 보고서" - 오늘의 활동 요약
• "주간 보고서" - 주간 트렌드 분석

**5. 실시간 분석**
• "실시간 모니터링" - 현재 활동 실시간 추적
• "알림 설정" - 중요 이벤트 알림
• "자동 분석" - 정기적 분석 실행

**💡 사용 팁**
• 구체적인 질문을 하시면 더 정확한 답변을 받을 수 있습니다
• "상세히" 또는 "자세히"를 추가하면 더 자세한 정보를 제공합니다
• 특정 기간이나 주제를 지정하면 맞춤형 분석이 가능합니다

어떤 기능에 대해 더 자세히 알고 싶으신가요?`;
    }

    return `🤔 **질문을 이해하지 못했습니다**

죄송합니다. 입력하신 내용을 정확히 파악하지 못했습니다. 

**💡 다음 중 하나를 시도해보세요:**
• "통계 보기" - 분석 통계 확인
• "차트 생성" - 시각화 차트 옵션
• "키워드 분석" - 주요 키워드 확인
• "보고서 생성" - 다양한 보고서 옵션
• "도움말" - 사용 가능한 기능 안내

**📝 구체적인 요청 예시:**
• "오늘 통계를 보여줘"
• "참여자별 차트를 만들어줘"
• "주요 키워드를 분석해줘"
• "주간 보고서를 생성해줘"

어떤 분석이나 기능이 필요하신지 구체적으로 말씀해 주시면 도움을 드리겠습니다.`;
  };

  // 분석 요청 처리
  const handleAnalysisRequest = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: `📊 분석 요청: ${chatInput.trim()}`,
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'analysis'
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    // 분석 요청 처리
    setTimeout(() => {
      const analysisResponse = processAnalysisRequest(chatInput.trim());
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: analysisResponse,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        type: 'analysis'
      };
      setChatMessages(prev => [...prev, assistantMessage]);
      setIsChatLoading(false);
    }, 1500);
  };

  // 분석 요청 처리
  const processAnalysisRequest = (request: string): string => {
    const lowerRequest = request.toLowerCase();

    if (lowerRequest.includes('시간대') || lowerRequest.includes('time')) {
      if (!analyticsData) {
        return '⏰ 시간대 분석을 위해서는 먼저 데이터 분석이 필요합니다. "분석 시작" 버튼을 클릭하여 데이터를 수집한 후 시간대 분석을 진행해주세요.';
      }
      
      const peakTime = analyticsData.timeDistribution.afternoon > analyticsData.timeDistribution.morning && 
                      analyticsData.timeDistribution.afternoon > analyticsData.timeDistribution.evening ? '오후' :
                      analyticsData.timeDistribution.morning > analyticsData.timeDistribution.evening ? '오전' : '저녁';
      
      return `⏰ **시간대별 활동 분석 보고서**

**📊 시간대별 메시지 분포**
• **오전 (6AM-12PM)**: ${analyticsData.timeDistribution.morning}% - ${analyticsData.timeDistribution.morning > 30 ? '활발한 활동' : '보통 수준'}
• **오후 (12PM-6PM)**: ${analyticsData.timeDistribution.afternoon}% - ${analyticsData.timeDistribution.afternoon > 40 ? '가장 활발한 시간대' : '보통 수준'}
• **저녁 (6PM-12AM)**: ${analyticsData.timeDistribution.evening}% - ${analyticsData.timeDistribution.evening > 30 ? '활발한 활동' : '보통 수준'}

**💡 시간대 인사이트**
• **피크 시간대**: ${peakTime} (${Math.max(analyticsData.timeDistribution.morning, analyticsData.timeDistribution.afternoon, analyticsData.timeDistribution.evening)}%)
• **활동 패턴**: ${analyticsData.timeDistribution.afternoon > 50 ? '오후 집중형' : analyticsData.timeDistribution.morning > 40 ? '오전 집중형' : '균등 분산형'}
• **최적 활동 시간**: ${peakTime} 시간대에 가장 많은 참여가 이루어지고 있습니다.

**🎯 시간대별 전략 제안**
• **${peakTime} 시간대**: 중요한 토론이나 의사결정을 이 시간대에 진행하는 것이 효과적입니다.
• **낮은 활동 시간대**: 알림이나 리마인더를 통해 참여를 유도할 수 있습니다.
• **시간대별 콘텐츠**: 각 시간대의 특성에 맞는 콘텐츠를 제공하는 것이 좋습니다.

이러한 시간대 분석을 바탕으로 더 효율적인 커뮤니케이션 전략을 수립할 수 있습니다.`;
    }

    if (lowerRequest.includes('감정') || lowerRequest.includes('sentiment')) {
      if (!analyticsData) {
        return '😊 감정 분석을 위해서는 먼저 데이터 분석이 필요합니다. "분석 시작" 버튼을 클릭하여 데이터를 수집한 후 감정 분석을 진행해주세요.';
      }
      
      const sentimentLevel = analyticsData.sentimentScore > 0.7 ? '매우 긍정적' : 
                           analyticsData.sentimentScore > 0.5 ? '긍정적' : 
                           analyticsData.sentimentScore > 0.3 ? '중립적' : '부정적';
      
      const engagementLevel = analyticsData.engagementRate > 0.8 ? '매우 높음' : 
                            analyticsData.engagementRate > 0.6 ? '높음' : 
                            analyticsData.engagementRate > 0.4 ? '보통' : '낮음';
      
      return `😊 **감정 및 참여도 분석 보고서**

**📈 감정 분석 결과**
• **전체 감정 점수**: ${(analyticsData.sentimentScore * 100).toFixed(1)}% (${sentimentLevel})
• **참여도 수준**: ${(analyticsData.engagementRate * 100).toFixed(1)}% (${engagementLevel})
• **평균 응답시간**: ${analyticsData.averageResponseTime}초 (${analyticsData.averageResponseTime < 30 ? '매우 빠름' : analyticsData.averageResponseTime < 60 ? '빠름' : '보통'})

**💡 감정 인사이트**
${analyticsData.sentimentScore > 0.6 ? 
  '• 전반적으로 긍정적인 분위기로 대화가 활발하게 이루어지고 있습니다.' : 
  '• 감정 점수가 다소 낮아 대화 분위기 개선이 필요할 수 있습니다.'}

${analyticsData.engagementRate > 0.7 ? 
  '• 높은 참여도로 모든 참여자들이 적극적으로 소통하고 있습니다.' : 
  '• 참여도를 높이기 위한 추가적인 활동이 필요할 수 있습니다.'}

**🎯 개선 방안**
• **감정 점수 개선**: ${analyticsData.sentimentScore < 0.5 ? '긍정적인 주제나 활동을 더 많이 다루는 것이 좋습니다.' : '현재 긍정적인 분위기를 유지하는 것이 중요합니다.'}
• **참여도 향상**: ${analyticsData.engagementRate < 0.6 ? '더 많은 상호작용 기회를 제공하고 흥미로운 주제를 다루는 것이 좋습니다.' : '현재 높은 참여도를 유지하는 것이 중요합니다.'}
• **응답시간 최적화**: ${analyticsData.averageResponseTime > 60 ? '더 빠른 응답을 위한 시스템 개선이 필요할 수 있습니다.' : '현재 응답시간이 적절한 수준입니다.'}

이러한 감정 분석을 통해 대화의 분위기와 참여도를 지속적으로 모니터링하고 개선할 수 있습니다.`;
    }

    if (lowerRequest.includes('참여자') || lowerRequest.includes('participant')) {
      if (!analyticsData) {
        return '👥 참여자 분석을 위해서는 먼저 데이터 분석이 필요합니다. "분석 시작" 버튼을 클릭하여 데이터를 수집한 후 참여자 분석을 진행해주세요.';
      }
      
      const activeParticipants = Math.round(analyticsData.participants * 0.8);
      const inactiveParticipants = analyticsData.participants - activeParticipants;
      
      return `👥 **참여자 활동 분석 보고서**

**📊 참여자 현황**
• **총 참여자 수**: ${analyticsData.participants}명
• **활성 참여자**: ${activeParticipants}명 (${(activeParticipants / analyticsData.participants * 100).toFixed(1)}%)
• **비활성 참여자**: ${inactiveParticipants}명 (${(inactiveParticipants / analyticsData.participants * 100).toFixed(1)}%)
• **평균 참여도**: ${(analyticsData.engagementRate * 100).toFixed(1)}%

**💡 참여자 인사이트**
• **활성도 비율**: ${(activeParticipants / analyticsData.participants * 100).toFixed(1)}%의 참여자가 활발하게 활동하고 있습니다.
• **참여 패턴**: ${analyticsData.engagementRate > 0.7 ? '높은 참여도로 모든 참여자들이 적극적으로 소통하고 있습니다.' : '참여도를 높이기 위한 추가적인 활동이 필요할 수 있습니다.'}
• **참여자 다양성**: 다양한 참여자들이 다양한 주제에 관심을 보이고 있습니다.

**🎯 참여자 관리 전략**
• **활성 참여자**: 이들의 의견을 더 많이 반영하고 리더십 역할을 부여하는 것이 좋습니다.
• **비활성 참여자**: 더 많은 관심과 참여 기회를 제공하여 활성화하는 것이 필요합니다.
• **전체 참여도 향상**: 흥미로운 주제와 활동을 통해 모든 참여자의 참여를 유도할 수 있습니다.

**📈 참여도 개선 방안**
• 정기적인 설문조사나 피드백 수집
• 개인별 맞춤형 콘텐츠 제공
• 참여자 간 상호작용 촉진 활동
• 성과나 기여도에 대한 인정과 보상

이러한 참여자 분석을 통해 더 효과적인 커뮤니케이션과 참여 전략을 수립할 수 있습니다.`;
    }

    return `🔍 **분석 요청 처리 완료**

입력하신 분석 요청을 처리했습니다. 현재 제공 가능한 분석 유형은 다음과 같습니다:

**📊 분석 유형**
• **시간대 분석** - 시간대별 활동 패턴과 피크 시간대 분석
• **감정 분석** - 전체적인 감정 점수와 참여도 분석
• **참여자 분석** - 참여자별 활동 현황과 참여도 분석

**💡 구체적인 분석 요청 예시:**
• "시간대별 활동을 분석해줘"
• "감정 점수와 참여도를 보여줘"
• "참여자들의 활동 현황을 알려줘"

어떤 구체적인 분석이 필요하신지 말씀해 주시면 상세한 분석 결과를 제공해드리겠습니다.`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">분석 데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 채팅 입력창 추가 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 분석 채팅</h3>
        <div className="space-y-4">
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg resize-none"
            placeholder="AI 분석에 대한 질문이나 요청을 입력하세요..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              onClick={handleChatSend}
              disabled={isChatLoading || !chatInput.trim()}
            >
              {isChatLoading ? '처리 중...' : '💬 채팅 전송'}
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              onClick={handleAnalysisRequest}
              disabled={isChatLoading || !chatInput.trim()}
            >
              {isChatLoading ? '분석 중...' : '📊 분석 요청'}
            </button>
          </div>
        </div>
      </div>

      {/* 채팅 메시지 표시 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">채팅 대화</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {chatMessages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === 'user'
                  ? 'bg-gray-100 text-gray-900 border border-gray-200'
                  : 'bg-white text-gray-900 border border-gray-200'
                }`}>
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isChatLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 px-4 py-2 rounded-lg border border-gray-200">
                <div className="text-sm">AI가 응답을 생성하고 있습니다...</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 분석 통계</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analyticsData.messageCount}</div>
            <div className="text-sm text-gray-500">총 메시지</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{analyticsData.participants}</div>
            <div className="text-sm text-gray-500">참여자</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{analyticsData.averageResponseTime}s</div>
            <div className="text-sm text-gray-500">평균 응답시간</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">감정 점수</h4>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${analyticsData.sentimentScore * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {(analyticsData.sentimentScore * 100).toFixed(1)}%
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">참여도</h4>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${analyticsData.engagementRate * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {(analyticsData.engagementRate * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">주요 키워드</h3>
        <div className="flex flex-wrap gap-2">
          {analyticsData.topKeywords.map((keyword: string, index: number) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">시간대별 활동</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">오전 (6-12시)</span>
            <div className="flex items-center space-x-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${analyticsData.timeDistribution.morning}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{analyticsData.timeDistribution.morning}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">오후 (12-18시)</span>
            <div className="flex items-center space-x-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${analyticsData.timeDistribution.afternoon}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{analyticsData.timeDistribution.afternoon}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">저녁 (18-24시)</span>
            <div className="flex items-center space-x-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${analyticsData.timeDistribution.evening}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{analyticsData.timeDistribution.evening}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAIAnalytics; 