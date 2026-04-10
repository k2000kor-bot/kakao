// 고급 맥락 이해 및 대화 지속성 테스트
const testAdvancedContextSystem = async () => {
    console.log('🧪 고급 맥락 이해 및 대화 지속성 테스트 시작...\n');

    // 테스트 케이스 1: 긴 문서 처리
    console.log('📄 테스트 1: 긴 문서 처리 능력');
    const longDocumentTest = {
        document_text: `삼성물산의 샘플 프로젝트 재개발 프로젝트에서 시공사 홍보 활동이 논란이 되고 있습니다. 
    조합원들이 불법 홍보에 대한 신고를 요구하고 있으며, GS건설과 비교하여 삼성물산의 홍보 수위가 낮다는 의견도 있습니다. 
    이 문제를 분석해주고 카드뉴스 형식으로 작성해줘. 그리고 추가로 다른 시공사들과도 비교 분석해줘.
    또한 조합원들의 의견을 정리하고, 법적 검토도 포함해서 종합적인 보고서를 만들어줘.
    마지막으로 향후 대응 방안까지 제시해줘.`,
        conversation_history: [
            {
                id: '1',
                content: '안녕하세요, 샘플 프로젝트 재개발 관련 문의가 있습니다.',
                sender: 'user',
                timestamp: '2024-01-01T10:00:00Z',
                isUser: true,
                type: 'text'
            },
            {
                id: '2',
                content: '네, 샘플 프로젝트 재개발에 대해 도움드리겠습니다. 어떤 부분이 궁금하신가요?',
                sender: 'ai',
                timestamp: '2024-01-01T10:00:01Z',
                isUser: false,
                type: 'text'
            },
            {
                id: '3',
                content: '시공사 홍보 활동에 대한 문제점들이 있어서요.',
                sender: 'user',
                timestamp: '2024-01-01T10:01:00Z',
                isUser: true,
                type: 'text'
            }
        ],
        user_conditions: [
            '분석해주고',
            '카드뉴스 형식으로 작성해줘',
            '다른 시공사들과도 비교 분석해줘',
            '조합원들의 의견을 정리하고',
            '법적 검토도 포함해서',
            '종합적인 보고서를 만들어줘',
            '향후 대응 방안까지 제시해줘'
        ],
        context_id: 'test_ctx_001',
        priority_level: 'high'
    };

    await testDocumentProcessing(longDocumentTest);

    // 테스트 케이스 2: 대화 연속성
    console.log('\n💬 테스트 2: 대화 연속성 및 맥락 유지');
    const conversationTest = {
        document_text: '이전에 말씀드린 삼성물산 홍보 문제에 대한 후속 조치는 어떻게 하면 좋을까요?',
        conversation_history: [
            ...longDocumentTest.conversation_history,
            {
                id: '4',
                content: longDocumentTest.document_text,
                sender: 'user',
                timestamp: '2024-01-01T10:02:00Z',
                isUser: true,
                type: 'text'
            },
            {
                id: '5',
                content: '네, 종합적인 분석을 제공해드리겠습니다. 먼저 시공사 홍보 활동의 문제점부터 살펴보겠습니다.',
                sender: 'ai',
                timestamp: '2024-01-01T10:02:30Z',
                isUser: false,
                type: 'text'
            }
        ],
        user_conditions: ['후속 조치 방안'],
        context_id: 'test_ctx_001', // 동일한 컨텍스트 ID
        priority_level: 'normal'
    };

    await testDocumentProcessing(conversationTest);

    // 테스트 케이스 3: 복잡한 다중 조건 요청
    console.log('\n🔄 테스트 3: 복잡한 다중 조건 요청 처리');
    const complexRequestTest = {
        document_text: `먼저 현재 상황을 정리해주고, 그다음에 각 시공사별 홍보 전략을 비교 분석해줘. 
    동시에 법적 리스크도 검토하고, 만약 시간이 허락한다면 조합원 설문조사 결과도 포함해서 
    최종적으로는 3가지 대안을 제시해줘. 각 대안은 장단점과 함께 실행 가능성도 평가해줘.`,
        conversation_history: conversationTest.conversation_history,
        user_conditions: [
            '먼저 현재 상황을 정리해주고',
            '그다음에 각 시공사별 홍보 전략을 비교 분석해줘',
            '동시에 법적 리스크도 검토하고',
            '만약 시간이 허락한다면 조합원 설문조사 결과도 포함해서',
            '최종적으로는 3가지 대안을 제시해줘',
            '각 대안은 장단점과 함께 실행 가능성도 평가해줘'
        ],
        context_id: 'test_ctx_001',
        priority_level: 'high'
    };

    await testDocumentProcessing(complexRequestTest);

    // 처리 통계 확인
    console.log('\n📊 처리 통계 확인');
    await testProcessingStats();
};

async function testDocumentProcessing(testData) {
    try {
        const startTime = performance.now();

        const response = await fetch('http://localhost:8005/api/v9/advanced-document', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        const endTime = performance.now();
        const processingTime = endTime - startTime;

        if (response.ok) {
            const result = await response.json();

            console.log('✅ 처리 성공!');
            console.log(`⏱️  클라이언트 처리 시간: ${processingTime.toFixed(2)}ms`);
            console.log(`🔧 서버 처리 시간: ${result.processing_metadata.processing_time.toFixed(2)}ms`);
            console.log(`🧠 메모리 강도: ${result.context_memory.memory_strength.toFixed(2)}`);
            console.log(`🔗 맥락 연속성: ${result.context_continuity_score.toFixed(2)}`);
            console.log(`📊 복잡도 점수: ${result.multi_condition_analysis.complexity_score.toFixed(2)}`);
            console.log(`🎯 세부 보존 점수: ${result.detail_preservation_score.toFixed(2)}`);
            console.log(`🎨 스타일 일관성: ${result.style_analysis.consistency_score.toFixed(2)}`);

            console.log('\n📝 문서 구조:');
            console.log(`  - 섹션 수: ${result.document_structure.sections.length}`);
            console.log(`  - 주요 토픽: ${result.document_structure.main_topics.join(', ')}`);
            console.log(`  - 키포인트: ${result.document_structure.key_points.length}개`);

            console.log('\n🎯 다중 조건 분석:');
            console.log(`  - 주요 조건: ${result.multi_condition_analysis.primary_condition}`);
            console.log(`  - 보조 조건: ${result.multi_condition_analysis.secondary_conditions.length}개`);
            console.log(`  - 의존성: ${result.multi_condition_analysis.dependencies.length}개`);
            console.log(`  - 우선순위: ${result.multi_condition_analysis.priority_order.join(' → ')}`);

            console.log('\n🧠 컨텍스트 메모리:');
            console.log(`  - 컨텍스트 윈도우: ${result.context_memory.context_windows.length}개`);
            console.log(`  - 핵심 엔티티: ${Object.keys(result.context_memory.key_entities).length}개 카테고리`);
            console.log(`  - 장기 메모리 토픽: ${Object.keys(result.context_memory.long_term_memory.topics || {}).length}개`);

            console.log('\n🎨 스타일 분석:');
            console.log(`  - 톤: ${result.style_analysis.tone}`);
            console.log(`  - 격식 수준: ${result.style_analysis.formality_level.toFixed(2)}`);
            console.log(`  - 어휘 스타일: ${result.style_analysis.vocabulary_style}`);
            console.log(`  - 감정 지표: ${result.style_analysis.emotion_indicators.join(', ')}`);

            console.log('\n🤖 AI 응답:');
            console.log(`"${result.processed_response}"`);

            // 성능 평가
            console.log('\n📈 성능 평가:');
            if (processingTime < 1000) {
                console.log('🟢 우수한 응답 속도');
            } else if (processingTime < 3000) {
                console.log('🟡 양호한 응답 속도');
            } else {
                console.log('🔴 응답 속도 개선 필요');
            }

            if (result.context_memory.memory_strength > 0.8) {
                console.log('🟢 뛰어난 맥락 이해력');
            } else if (result.context_memory.memory_strength > 0.6) {
                console.log('🟡 양호한 맥락 이해력');
            } else {
                console.log('🔴 맥락 이해력 개선 필요');
            }

            if (result.multi_condition_analysis.complexity_score > 0.7) {
                console.log('🟢 복잡한 요청 처리 성공');
            } else {
                console.log('🟡 단순한 요청으로 인식');
            }

        } else {
            console.error('❌ API 호출 실패:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('오류 내용:', errorText);
        }
    } catch (error) {
        console.error('❌ 테스트 오류:', error);
    }
}

async function testProcessingStats() {
    try {
        const response = await fetch('http://localhost:8005/api/v9/stats');

        if (response.ok) {
            const stats = await response.json();
            console.log('📊 시스템 처리 통계:');
            console.log(`  - 총 요청 수: ${stats.total_requests}`);
            console.log(`  - 평균 처리 시간: ${stats.avg_processing_time.toFixed(2)}ms`);
            console.log(`  - 캐시 히트: ${stats.cache_hits}`);
        } else {
            console.error('❌ 통계 조회 실패');
        }
    } catch (error) {
        console.error('❌ 통계 조회 오류:', error);
    }
}

// 테스트 실행
console.log('🚀 고급 맥락 이해 시스템 테스트를 시작합니다...\n');
testAdvancedContextSystem().then(() => {
    console.log('\n✅ 모든 테스트가 완료되었습니다!');
}).catch(error => {
    console.error('\n❌ 테스트 실행 중 오류 발생:', error);
});
