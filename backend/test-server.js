const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;

// 미들웨어
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 메모리 데이터 저장소
const dataStore = {
    projects: [
        {
            id: uuidv4(),
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
            id: uuidv4(),
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
    sessions: [],
    messages: []
};

// 기본 세션 생성
dataStore.projects.forEach(project => {
    const session = {
        id: uuidv4(),
        projectId: project.id,
        name: '세션 #1',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
            totalTokens: 0,
            avgResponseTime: 0,
        }
    };
    dataStore.sessions.push(session);
});

// API 라우트들

// 시스템 상태
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'online',
            timestamp: new Date(),
            version: '2.0.0',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
        }
    });
});

app.get('/api/system/status', (req, res) => {
    const analytics = {
        totalMessages: dataStore.messages.length,
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
        data: {
            status: 'online',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date(),
            stats: analytics
        }
    });
});

// 프로젝트 관련 API
app.get('/api/projects', (req, res) => {
    try {
        res.json({
            success: true,
            data: dataStore.projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

app.post('/api/projects', (req, res) => {
    try {
        const { name, description, tags = [], settings = {} } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                error: 'Bad Request',
                message: '프로젝트 이름과 설명은 필수입니다.'
            });
        }

        const newProject = {
            id: uuidv4(),
            name,
            description,
            tags,
            status: 'active',
            messageCount: 0,
            userId: 'user_1',
            createdAt: new Date(),
            updatedAt: new Date(),
            settings: {
                aiModel: 'gpt-4',
                temperature: 0.7,
                maxTokens: 2000,
                ...settings,
            }
        };

        dataStore.projects.push(newProject);

        res.status(201).json({
            success: true,
            data: newProject
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

app.get('/api/projects/:projectId', (req, res) => {
    try {
        const { projectId } = req.params;
        const project = dataStore.projects.find(p => p.id === projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Not Found',
                message: '프로젝트를 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

// 세션 관련 API
app.get('/api/projects/:projectId/sessions', (req, res) => {
    try {
        const { projectId } = req.params;
        const sessions = dataStore.sessions.filter(s => s.projectId === projectId);

        res.json({
            success: true,
            data: sessions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

app.post('/api/sessions', (req, res) => {
    try {
        const { projectId, name } = req.body;

        if (!projectId) {
            return res.status(400).json({
                success: false,
                error: 'Bad Request',
                message: '프로젝트 ID는 필수입니다.'
            });
        }

        const project = dataStore.projects.find(p => p.id === projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Not Found',
                message: '프로젝트를 찾을 수 없습니다.'
            });
        }

        const existingSessions = dataStore.sessions.filter(s => s.projectId === projectId);
        const sessionName = name || `세션 #${existingSessions.length + 1}`;

        const newSession = {
            id: uuidv4(),
            projectId,
            name: sessionName,
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
                totalTokens: 0,
                avgResponseTime: 0,
            }
        };

        dataStore.sessions.push(newSession);

        res.status(201).json({
            success: true,
            data: newSession
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

// 메시지 관련 API
app.post('/api/sessions/:sessionId/messages', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { content, role, projectId } = req.body;

        if (!content || !role) {
            return res.status(400).json({
                success: false,
                error: 'Bad Request',
                message: '메시지 내용과 역할은 필수입니다.'
            });
        }

        const session = dataStore.sessions.find(s => s.id === sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Not Found',
                message: '세션을 찾을 수 없습니다.'
            });
        }

        // 사용자 메시지 생성
        const userMessage = {
            id: uuidv4(),
            content,
            role: 'user',
            timestamp: new Date().toISOString(),
        };

        // AI 응답 생성 (시뮬레이션)
        const aiResponses = [
            `"${content}"에 대한 분석을 진행하겠습니다. 

이 질문은 매우 흥미로운 관점을 제시합니다. 다음과 같은 측면에서 살펴볼 수 있습니다:

1. **핵심 개념 분석**: 제시된 내용의 주요 요소들을 체계적으로 분석해보겠습니다.

2. **실용적 접근**: 실제 적용 가능한 솔루션과 방법론을 제안드리겠습니다.

3. **추가 고려사항**: 관련된 다른 요소들과의 연관성도 함께 검토해보겠습니다.

더 구체적인 정보나 특정 방향으로의 분석이 필요하시면 언제든 말씀해 주세요.`,

            `안녕하세요! "${content}"에 대해 도움을 드리겠습니다.

**상세 분석:**

• **현황 파악**: 현재 상황을 정확히 이해하고 분석했습니다.
• **해결 방안**: 단계별로 접근할 수 있는 실용적인 방법들을 제시합니다.
• **예상 결과**: 각 방안의 장단점과 예상되는 결과를 설명드립니다.

**추천 사항:**
1. 우선순위에 따른 단계별 접근
2. 리스크 관리 방안 수립
3. 지속적인 모니터링 체계 구축

추가로 궁금한 점이나 더 자세한 설명이 필요한 부분이 있으시면 언제든 말씀해 주세요!`,

            `"${content}"에 대한 CORBU AI의 분석 결과입니다.

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

더 구체적인 실행 계획이나 세부 사항에 대해 논의하고 싶으시면 언제든 말씀해 주세요!`
        ];

        const selectedResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];

        const aiMessage = {
            id: uuidv4(),
            content: selectedResponse,
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
        session.metadata.totalTokens += (userMessage.metadata?.tokens || 0) + (aiMessage.metadata?.tokens || 0);

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
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

// 분석 API
app.get('/api/analytics', (req, res) => {
    try {
        const { projectId, timeRange = '7d' } = req.query;
        
        const analytics = {
            totalMessages: dataStore.messages.length,
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
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
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
    console.log(`🚀 CORBU AI 테스트 서버가 포트 ${PORT}에서 실행 중입니다`);
    console.log(`📊 API 엔드포인트: http://localhost:${PORT}/api`);
    console.log(`🔍 헬스체크: http://localhost:${PORT}/api/health`);
    console.log(`📈 분석 API: http://localhost:${PORT}/api/analytics`);
});

module.exports = app;
