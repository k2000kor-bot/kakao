// 문맥 분석 기능 테스트
const testContextualAnalysis = async () => {
  const testMessage = `삼성물산의 개포우성7차 재개발 프로젝트에서 시공사 홍보 활동이 논란이 되고 있습니다. 
  조합원들이 불법 홍보에 대한 신고를 요구하고 있으며, GS건설과 비교하여 삼성물산의 홍보 수위가 낮다는 의견도 있습니다. 
  이 문제를 분석해주고 카드뉴스 형식으로 작성해줘.`;

  const testHistory = [
    {
      id: '1',
      content: '안녕하세요',
      sender: 'user',
      timestamp: '2024-01-01T10:00:00Z',
      isUser: true,
      type: 'text'
    },
    {
      id: '2',
      content: '안녕하세요! 무엇을 도와드릴까요?',
      sender: 'ai',
      timestamp: '2024-01-01T10:00:01Z',
      isUser: false,
      type: 'text'
    }
  ];

  try {
    console.log('🧪 문맥 분석 테스트 시작...');
    console.log('📝 테스트 메시지:', testMessage);
    
    const response = await fetch('http://localhost:8003/api/v7/contextual-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: testMessage,
        conversation_history: testHistory,
        context: null,
        user_preferences: null
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 문맥 분석 결과:');
      console.log('📊 분석 요약:', result.analysis.summary);
      console.log('🎯 의도:', result.analysis.intent);
      console.log('😊 감정:', result.analysis.sentiment);
      console.log('📝 주요 토픽:', result.analysis.topics);
      console.log('🏢 핵심 엔티티:', result.analysis.entities);
      console.log('💡 제안사항:', result.suggestions);
      console.log('🔗 관련 토픽:', result.related_topics);
      console.log('🤖 AI 응답:', result.response);
    } else {
      console.error('❌ API 호출 실패:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ 테스트 오류:', error);
  }
};

// 테스트 실행
testContextualAnalysis();
