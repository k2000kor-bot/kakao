const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// 미들웨어
app.use(cors());
app.use(express.json());

// 메모리 데이터 저장소
const dataStore = {
    projects: [
        {
            id: '1',
            name: 'AI 분석 프로젝트',
            description: '고급 AI 분석 및 데이터 처리 프로젝트',
            tags: ['AI', '분석', '데이터'],
            status: 'active',
            messageCount: 0,
            userId: 'user_1',
            createdAt: new Date(),
            updatedAt: new Date(),
            settings: {
                aiModel: 'gpt-4',
                temperature: 0.7,
                maxTokens: 2000,
            }
        },
        {
            id: '2',
            name: '코드 리뷰 어시스턴트',
            description: '코드 품질 향상을 위한 AI 어시스턴트',
            tags: ['코드', '리뷰', '품질'],
            status: 'active',
            messageCount: 0,
            userId: 'user_1',
            createdAt: new Date(),
            updatedAt: new Date(),
            settings: {
                aiModel: 'gpt-4',
                temperature: 0.3,
                maxTokens: 1500,
            }
        }
    ],
    sessions: [
        {
            id: '1',
            projectId: '1',
            name: '세션 #1',
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
                totalTokens: 0,
                avgResponseTime: 0,
            }
        },
        {
            id: '2',
            projectId: '2',
            name: '세션 #1',
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
                totalTokens: 0,
                avgResponseTime: 0,
            }
        }
    ]
};

// 헬스체크
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'online',
            timestamp: new Date(),
            version: '2.0.0'
        }
    });
});

// 프로젝트 목록
app.get('/api/projects', (req, res) => {
    res.json({
        success: true,
        data: dataStore.projects
    });
});

// 세션 목록
app.get('/api/projects/:projectId/sessions', (req, res) => {
    const projectId = req.params.projectId;
    const sessions = dataStore.sessions.filter(s => s.projectId === projectId);
    res.json({
        success: true,
        data: sessions
    });
});

// 메시지 전송
app.post('/api/sessions/:sessionId/messages', (req, res) => {
    const sessionId = req.params.sessionId;
    const { content, role, projectId } = req.body;

    const session = dataStore.sessions.find(s => s.id === sessionId);
    if (!session) {
        return res.status(404).json({
            success: false,
            error: 'Session not found'
        });
    }

    // 사용자 메시지
    const userMessage = {
        id: Date.now().toString(),
        content,
        role: 'user',
        timestamp: new Date().toISOString(),
    };

    // AI 응답
    const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: `"${content}"에 대한 CORBU AI의 분석 결과입니다.

**🔍 분석 요약:**
- 핵심 키워드 추출 완료
- 맥락적 이해도: 95%
- 추천 신뢰도: 높음

**📊 데이터 기반 인사이트:**
현재 시점 기준으로 관련 데이터를 분석한 결과, 다음과 같은 패턴과 트렌드를 확인할 수 있습니다.

**💡 실행 가능한 제안:**
1. **즉시 실행**: 바로 적용 가능한 방법
2. **단기 계획**: 1-2주 내 실행 계획
3. **장기 전략**: 지속적 개선 방안

**🎯 기대 효과:**
- 효율성 향상: 예상 20-30%
- 품질 개선: 지속적 향상 가능
- 리스크 감소: 체계적 관리 가능

더 구체적인 실행 계획이나 세부 사항에 대해 논의하고 싶으시면 언제든 말씀해 주세요!`,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        metadata: {
            model: 'CORBU-AI-v2.0',
            tokens: Math.floor(Math.random() * 200) + 100,
            responseTime: Math.round(Math.random() * 2000 + 500),
            confidence: 0.85 + Math.random() * 0.15,
        }
    };

    // 세션에 메시지 추가
    session.messages.push(userMessage, aiMessage);
    session.updatedAt = new Date();

    // 프로젝트 메시지 카운트 업데이트
    if (projectId) {
        const project = dataStore.projects.find(p => p.id === projectId);
        if (project) {
            project.messageCount += 2;
            project.updatedAt = new Date();
        }
    }

    res.json({
        success: true,
        data: {
            userMessage,
            aiResponse: aiMessage,
        }
    });
});

// 분석 데이터
app.get('/api/analytics', (req, res) => {
    const analytics = {
        totalMessages: dataStore.sessions.reduce((sum, s) => sum + s.messages.length, 0),
        totalSessions: dataStore.sessions.length,
        totalProjects: dataStore.projects.length,
        avgResponseTime: 1.2,
        messagesByDay: Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return {
                date: date.toISOString().split('T')[0],
                messages: Math.floor(Math.random() * 50) + 10,
                responses: Math.floor(Math.random() * 45) + 8,
            };
        }),
        topProjects: dataStore.projects.slice(0, 5).map(p => ({
            id: p.id,
            name: p.name,
            messageCount: p.messageCount,
            lastActivity: p.updatedAt,
        })),
        userActivity: {
            activeUsers: 1,
            totalSessions: dataStore.sessions.length,
            avgSessionDuration: '15분',
            peakHours: ['14:00', '15:00', '16:00'],
        }
    };

    res.json({
        success: true,
        data: analytics
    });
});

// 404 핸들러
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: '요청한 리소스를 찾을 수 없습니다.'
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`🚀 CORBU AI 최소 서버가 포트 ${PORT}에서 실행 중입니다`);
    console.log(`📊 API 엔드포인트: http://localhost:${PORT}/api`);
    console.log(`🔍 헬스체크: http://localhost:${PORT}/api/health`);
});

module.exports = app;
