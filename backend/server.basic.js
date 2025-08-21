const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(express.json());

// 메모리 저장소 (실제 운영에서는 데이터베이스 사용)
let projects = [];
let sessions = [];
let messages = [];

// 기본 프로젝트 생성
const defaultProject = {
  id: uuidv4(),
  name: '기본 프로젝트',
  description: 'CORBU AI 기본 프로젝트입니다',
  tags: ['AI', '분석'],
  status: 'active',
  messageCount: 0,
  createdAt: new Date(),
  updatedAt: new Date()
};

projects.push(defaultProject);

// 기본 세션 생성
const defaultSession = {
  id: uuidv4(),
  projectId: defaultProject.id,
  messages: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

sessions.push(defaultSession);

// API 엔드포인트

// 시스템 상태 확인
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'online',
      timestamp: new Date(),
      version: '1.0.0'
    }
  });
});

// 시스템 상태
app.get('/api/system/status', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'online',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date()
    }
  });
});

// 프로젝트 목록 조회
app.get('/api/projects', (req, res) => {
  res.json({
    success: true,
    data: projects
  });
});

// 프로젝트 생성
app.post('/api/projects', (req, res) => {
  const { name, description, tags = [] } = req.body;
  
  const newProject = {
    id: uuidv4(),
    name,
    description,
    tags,
    status: 'active',
    messageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  projects.push(newProject);
  
  res.json({
    success: true,
    data: newProject
  });
});

// 세션 목록 조회
app.get('/api/projects/:projectId/sessions', (req, res) => {
  const { projectId } = req.params;
  const projectSessions = sessions.filter(s => s.projectId === projectId);
  
  res.json({
    success: true,
    data: projectSessions
  });
});

// 세션 생성
app.post('/api/sessions', (req, res) => {
  const { projectId } = req.body;
  
  const newSession = {
    id: uuidv4(),
    projectId,
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  sessions.push(newSession);
  
  res.json({
    success: true,
    data: newSession
  });
});

// 메시지 전송
app.post('/api/sessions/:sessionId/messages', (req, res) => {
  const { sessionId } = req.params;
  const { content, role, projectId } = req.body;
  
  // 사용자 메시지 생성
  const userMessage = {
    id: uuidv4(),
    content,
    role: 'user',
    timestamp: new Date(),
    sessionId,
    metadata: {}
  };
  
  // AI 응답 생성 (간단한 시뮬레이션)
  const aiResponse = {
    id: uuidv4(),
    content: `안녕하세요! "${content}"에 대한 답변입니다. CORBU AI가 도움을 드리겠습니다. 현재 시간은 ${new Date().toLocaleString('ko-KR')}입니다.`,
    role: 'assistant',
    timestamp: new Date(),
    sessionId,
    metadata: {
      model: 'CORBU-AI-v1.0',
      tokens: Math.floor(Math.random() * 100) + 50
    }
  };
  
  // 메시지 저장
  messages.push(userMessage, aiResponse);
  
  // 세션 업데이트
  const session = sessions.find(s => s.id === sessionId);
  if (session) {
    session.messages.push(userMessage, aiResponse);
    session.updatedAt = new Date();
  }
  
  // 프로젝트 메시지 카운트 업데이트
  if (projectId) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      project.messageCount += 2;
      project.updatedAt = new Date();
    }
  }
  
  res.json({
    success: true,
    data: {
      userMessage,
      aiResponse
    }
  });
});

// 초기화 엔드포인트
app.post('/api/initialize', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'CORBU AI 시스템이 초기화되었습니다',
      timestamp: new Date()
    }
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 CORBU AI 백엔드 서버가 포트 ${PORT}에서 실행 중입니다`);
  console.log(`📊 API 엔드포인트: http://localhost:${PORT}/api`);
  console.log(`🔍 헬스체크: http://localhost:${PORT}/api/health`);
});

module.exports = app;
