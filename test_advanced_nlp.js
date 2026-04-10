// 고급 NLP 기능 테스트
const testAdvancedNLP = async () => {
    const testMessage = `삼성물산의 샘플 프로젝트 재개발 프로젝트에서 시공사 홍보 활동이 논란이 되고 있습니다. 
  조합원들이 불법 홍보에 대한 신고를 요구하고 있으며, GS건설과 비교하여 삼성물산의 홍보 수위가 낮다는 의견도 있습니다. 
  이 문제를 분석해주고 카드뉴스 형식으로 작성해줘. 그리고 추가로 다른 시공사들과도 비교 분석해줘.`;

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
        console.log('🧪 고급 NLP 테스트 시작...');
        console.log('📝 테스트 메시지:', testMessage);

        const response = await fetch('http://localhost:8004/api/v8/advanced-nlp', {
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
            console.log('✅ 고급 NLP 분석 결과:');
            console.log('🎯 주요 의도:', result.intent_analysis.primary_intent);
            console.log('🎯 보조 의도:', result.intent_analysis.secondary_intents);
            console.log('📊 신뢰도:', result.intent_analysis.confidence);
            console.log('🔍 추론 과정:', result.intent_analysis.reasoning);

            console.log('\n📋 명시적 요구사항:', result.requirement_analysis.explicit_requirements);
            console.log('📋 암시적 요구사항:', result.requirement_analysis.implicit_requirements);
            console.log('📋 제약사항:', result.requirement_analysis.constraints);
            console.log('📋 선호사항:', result.requirement_analysis.preferences);

            console.log('\n📝 주요 토픽:', result.context_analysis.topics);
            console.log('🏢 핵심 엔티티:', result.context_analysis.entities);
            console.log('🔗 관계:', result.context_analysis.relationships);
            console.log('😊 감정:', result.context_analysis.sentiment);
            console.log('⚡ 긴급도:', result.context_analysis.urgency);
            console.log('📊 복잡도:', result.context_analysis.complexity);

            console.log('\n💡 제안사항:', result.suggestions);
            console.log('❓ 후속 질문:', result.follow_up_questions);
            console.log('✅ 액션 아이템:', result.action_items);
            console.log('🤖 AI 응답:', result.response);
            console.log('📈 전체 신뢰도:', result.confidence_score);
        } else {
            console.error('❌ API 호출 실패:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('❌ 테스트 오류:', error);
    }
};

// 테스트 실행
testAdvancedNLP();
