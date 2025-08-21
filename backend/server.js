const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Rate Limiting
const rateLimiter = new RateLimiterMemory({
    keyGenerator: (req) => req.ip,
    points: 100, // 요청 수
    duration: 60, // 60초
});

// 미들웨어
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://your-domain.com']
        : ['http://localhost:3000', 'http://localhost:3003'],
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting middleware
app.use(async (req, res, next) => {
    try {
        await rateLimiter.consume(req.ip);
        next();
    } catch (rejRes) {
        res.status(429).json({
            success: false,
            error: 'Too Many Requests',
            message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
        });
    }
});

// 고급 메모리 저장소 (실제 운영에서는 MongoDB/PostgreSQL 사용)
class AdvancedDataStore {
    constructor() {
        this.projects = new Map();
        this.sessions = new Map();
        this.messages = new Map();
        this.users = new Map();
        this.analytics = new Map();

        // 기본 데이터 초기화
        this.initializeDefaultData();
    }

    initializeDefaultData() {
        // 기본 사용자
        const defaultUser = {
            id: 'user_1',
            email: 'admin@corbu.ai',
            name: 'CORBU 관리자',
            role: 'admin',
            createdAt: new Date(),
            lastLoginAt: new Date(),
        };
        this.users.set(defaultUser.id, defaultUser);

        // 기본 프로젝트들
        const defaultProjects = [
            {
                id: uuidv4(),
                name: 'AI 분석 프로젝트',
                description: '고급 AI 분석 및 데이터 처리 프로젝트',
                tags: ['AI', '분석', '데이터'],
                status: 'active',
                messageCount: 0,
                userId: defaultUser.id,
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
                userId: defaultUser.id,
                createdAt: new Date(),
                updatedAt: new Date(),
                settings: {
                    aiModel: 'gpt-4',
                    temperature: 0.3,
                    maxTokens: 1500,
                }
            }
        ];

        defaultProjects.forEach(project => {
            this.projects.set(project.id, project);

            // 각 프로젝트에 기본 세션 생성
            const defaultSession = {
                id: uuidv4(),
                projectId: project.id,
                name: `세션 #1`,
                messages: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                metadata: {
                    totalTokens: 0,
                    avgResponseTime: 0,
                }
            };
            this.sessions.set(defaultSession.id, defaultSession);
        });
    }

    // 프로젝트 관련 메서드
    getProjects(userId = null) {
        const projects = Array.from(this.projects.values());
        return userId ? projects.filter(p => p.userId === userId) : projects;
    }

    getProject(id) {
        return this.projects.get(id);
    }

    createProject(projectData) {
        const project = {
            id: uuidv4(),
            ...projectData,
            messageCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            settings: {
                aiModel: 'gpt-4',
                temperature: 0.7,
                maxTokens: 2000,
                ...projectData.settings,
            }
        };
        this.projects.set(project.id, project);
        return project;
    }

    updateProject(id, updates) {
        const project = this.projects.get(id);
        if (project) {
            const updatedProject = { ...project, ...updates, updatedAt: new Date() };
            this.projects.set(id, updatedProject);
            return updatedProject;
        }
        return null;
    }

    // 세션 관련 메서드
    getSessions(projectId) {
        return Array.from(this.sessions.values()).filter(s => s.projectId === projectId);
    }

    getSession(id) {
        return this.sessions.get(id);
    }

    createSession(sessionData) {
        const session = {
            id: uuidv4(),
            ...sessionData,
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
                totalTokens: 0,
                avgResponseTime: 0,
            }
        };
        this.sessions.set(session.id, session);
        return session;
    }

    // 메시지 관련 메서드
    addMessage(sessionId, messageData) {
        const session = this.sessions.get(sessionId);
        if (!session) return null;

        const message = {
            id: uuidv4(),
            ...messageData,
            timestamp: new Date(),
        };

        session.messages.push(message);
        session.updatedAt = new Date();
        this.sessions.set(sessionId, session);
        this.messages.set(message.id, message);

        return message;
    }

    // 분석 데이터 메서드
    getAnalytics(projectId = null, timeRange = '7d') {
        const now = new Date();
        const startDate = new Date();

        switch (timeRange) {
            case '1d':
                startDate.setDate(now.getDate() - 1);
                break;
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            default:
                startDate.setDate(now.getDate() - 7);
        }

        // 실제 구현에서는 데이터베이스에서 집계
        return {
            totalMessages: Array.from(this.messages.values()).length,
            totalSessions: Array.from(this.sessions.values()).length,
            totalProjects: Array.from(this.projects.values()).length,
            avgResponseTime: 1.2,
            messagesByDay: this.generateMockChartData(7),
            topProjects: this.getTopProjects(5),
            userActivity: this.generateUserActivityData(),
        };
    }

    generateMockChartData(days) {
        return Array.from({ length: days }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - i));
            return {
                date: date.toISOString().split('T')[0],
                messages: Math.floor(Math.random() * 50) + 10,
                responses: Math.floor(Math.random() * 45) + 8,
            };
        });
    }

    getTopProjects(limit) {
        return Array.from(this.projects.values())
            .sort((a, b) => b.messageCount - a.messageCount)
            .slice(0, limit)
            .map(p => ({
                id: p.id,
                name: p.name,
                messageCount: p.messageCount,
                lastActivity: p.updatedAt,
            }));
    }

    generateUserActivityData() {
        return {
            activeUsers: 1,
            totalSessions: Array.from(this.sessions.values()).length,
            avgSessionDuration: '15분',
            peakHours: ['14:00', '15:00', '16:00'],
        };
    }
}

const dataStore = new AdvancedDataStore();

// AI 응답 생성 시뮬레이션 (실제로는 OpenAI/Claude API 사용)
class AIResponseGenerator {
    static async generateResponse(message, context = {}) {
        // 응답 시간 시뮬레이션
        const responseTime = Math.random() * 2000 + 500;
        await new Promise(resolve => setTimeout(resolve, responseTime));

        const responses = [
            `"${message}"에 대한 분석을 진행하겠습니다. 

이 질문은 매우 흥미로운 관점을 제시합니다. 다음과 같은 측면에서 살펴볼 수 있습니다:

1. **핵심 개념 분석**: 제시된 내용의 주요 요소들을 체계적으로 분석해보겠습니다.

2. **실용적 접근**: 실제 적용 가능한 솔루션과 방법론을 제안드리겠습니다.

3. **추가 고려사항**: 관련된 다른 요소들과의 연관성도 함께 검토해보겠습니다.

더 구체적인 정보나 특정 방향으로의 분석이 필요하시면 언제든 말씀해 주세요.`,

            `안녕하세요! "${message}"에 대해 도움을 드리겠습니다.

**상세 분석:**

• **현황 파악**: 현재 상황을 정확히 이해하고 분석했습니다.
• **해결 방안**: 단계별로 접근할 수 있는 실용적인 방법들을 제시합니다.
• **예상 결과**: 각 방안의 장단점과 예상되는 결과를 설명드립니다.

**추천 사항:**
1. 우선순위에 따른 단계별 접근
2. 리스크 관리 방안 수립
3. 지속적인 모니터링 체계 구축

추가로 궁금한 점이나 더 자세한 설명이 필요한 부분이 있으시면 언제든 말씀해 주세요!`,

            `"${message}"에 대한 CORBU AI의 분석 결과입니다.

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

        const selectedResponse = responses[Math.floor(Math.random() * responses.length)];

        return {
            content: selectedResponse,
            metadata: {
                model: context.model || 'CORBU-AI-v2.0',
                tokens: Math.floor(Math.random() * 200) + 100,
                responseTime: Math.round(responseTime),
                confidence: 0.85 + Math.random() * 0.15,
            }
        };
    }
}

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
    const analytics = dataStore.getAnalytics();
    res.json({
        success: true,
        data: {
            status: 'online',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date(),
            stats: {
                totalProjects: analytics.totalProjects,
                totalSessions: analytics.totalSessions,
                totalMessages: analytics.totalMessages,
                avgResponseTime: analytics.avgResponseTime,
            }
        }
    });
});

// 프로젝트 관련 API
app.get('/api/projects', (req, res) => {
    try {
        const projects = dataStore.getProjects();
        res.json({
            success: true,
            data: projects
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

        const newProject = dataStore.createProject({
            name,
            description,
            tags,
            status: 'active',
            userId: 'user_1', // 실제로는 인증된 사용자 ID
            settings,
        });

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
        const project = dataStore.getProject(projectId);

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
        const sessions = dataStore.getSessions(projectId);

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

        const project = dataStore.getProject(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Not Found',
                message: '프로젝트를 찾을 수 없습니다.'
            });
        }

        const existingSessions = dataStore.getSessions(projectId);
        const sessionName = name || `세션 #${existingSessions.length + 1}`;

        const newSession = dataStore.createSession({
            projectId,
            name: sessionName,
        });

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

        const session = dataStore.getSession(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Not Found',
                message: '세션을 찾을 수 없습니다.'
            });
        }

        // 사용자 메시지 저장
        const userMessage = dataStore.addMessage(sessionId, {
            content,
            role: 'user',
        });

        // AI 응답 생성
        const project = dataStore.getProject(session.projectId);
        const aiResponseData = await AIResponseGenerator.generateResponse(content, {
            model: project?.settings?.aiModel,
            temperature: project?.settings?.temperature,
        });

        const aiMessage = dataStore.addMessage(sessionId, {
            content: aiResponseData.content,
            role: 'assistant',
            metadata: aiResponseData.metadata,
        });

        // 프로젝트 메시지 카운트 업데이트
        if (project) {
            dataStore.updateProject(project.id, {
                messageCount: project.messageCount + 2,
            });
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
        const analytics = dataStore.getAnalytics(projectId, timeRange);

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

// 초기화 API
app.post('/api/initialize', (req, res) => {
    res.json({
        success: true,
        data: {
            message: 'CORBU AI 고급 시스템이 초기화되었습니다',
            timestamp: new Date(),
            version: '2.0.0',
            features: [
                'Advanced Analytics',
                'Real-time Monitoring',
                'Enhanced AI Models',
                'Project Management',
                'Session Tracking'
            ]
        }
    });
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : '서버 오류가 발생했습니다.'
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
    console.log(`🚀 CORBU AI 고급 백엔드 서버가 포트 ${PORT}에서 실행 중입니다`);
    console.log(`📊 API 엔드포인트: http://localhost:${PORT}/api`);
    console.log(`🔍 헬스체크: http://localhost:${PORT}/api/health`);
    console.log(`📈 분석 API: http://localhost:${PORT}/api/analytics`);
    console.log(`⚡ 고급 기능: Rate Limiting, Security Headers, Compression`);
});

module.exports = app;
