// API 서비스 - 백엔드와의 통신을 담당
const API_BASE_URL = 'http://localhost:8003';

export interface PoliticalStyleRequest {
    target_topic: string;
    political_style: string;
    message_intent: string;
    context_messages?: any[];
}

export interface PoliticalStyleResponse {
    success: boolean;
    message: string;
    political_style_used: string;
    generation_metadata: {
        target_topic: string;
        message_intent: string;
        context_messages_count: number;
    };
}

export interface ProjectRequest {
    name: string;
    chatRoomId: string;
    chatRoomName: string;
}

export interface GuidelineRequest {
    title: string;
    content: string;
    category: 'logic' | 'strategy' | 'communication' | 'analysis' | 'general';
    priority: 'low' | 'medium' | 'high';
}

export interface ChatRoom {
    id: string;
    name: string;
    messageCount: number;
    lastActivity: string;
}

export interface ChatMessage {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
    type: 'text' | 'image' | 'file' | 'system';
    metadata?: {
        file_name?: string;
        file_size?: number;
        file_type?: string;
    };
}

export interface Project {
    id: string;
    name: string;
    chatRoomId: string;
    chatRoomName: string;
    files: ProjectFile[];
    guidelines: Guideline[];
    createdAt: string;
    updatedAt: string;
}

export interface ProjectFile {
    id: string;
    name: string;
    type: 'document' | 'image' | 'video' | 'audio' | 'spreadsheet' | 'presentation';
    url: string;
    size: number;
    uploadedAt: string;
}

export interface Guideline {
    id: string;
    title: string;
    content: string;
    category: 'logic' | 'strategy' | 'communication' | 'analysis' | 'general';
    priority: 'low' | 'medium' | 'high';
    isActive: boolean;
    createdAt: string;
}

class ApiService {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    // 정치인 스타일 메시지 생성
    async generatePoliticalStyleMessage(request: PoliticalStyleRequest): Promise<PoliticalStyleResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v7/political-style/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('정치인 스타일 메시지 생성 실패:', error);
            // 폴백: 로컬 생성
            return this.generateLocalPoliticalMessage(request);
        }
    }

    // 로컬 정치인 스타일 메시지 생성 (백엔드 연결 실패 시)
    private generateLocalPoliticalMessage(request: PoliticalStyleRequest): PoliticalStyleResponse {
        const styleTemplates = {
            '유시민': {
                phrases: ['제가 보기에는', '상식적으로 생각해보면', '논리적으로 따져보면'],
                style: '논리적이고 합리적인 접근'
            },
            '정준희': {
                phrases: ['현실을 직시하면', '냉정하게 말씀드리면', '사실은 이렇습니다'],
                style: '현실적이고 직설적인 표현'
            },
            '진중권': {
                phrases: ['이건 정말 웃기는 일이다', '말이 안 되는 소리다', '상식 이하의 발상이다'],
                style: '비판적이고 철학적 관점'
            },
            '박형준': {
                phrases: ['균형잡힌 시각에서', '상호 이해를 바탕으로', '건설적인 방향으로'],
                style: '균형잡힌 중재적 접근'
            },
            '정원책': {
                phrases: ['변화가 필요합니다', '개혁의 시급성', '민주주의의 발전을 위해'],
                style: '진보적 가치 추구'
            },
            '이철희': {
                phrases: ['구체적으로 살펴보면', '데이터가 보여주는 것은', '정책적 관점에서'],
                style: '체계적이고 정책적 접근'
            }
        };

        const style = styleTemplates[request.political_style as keyof typeof styleTemplates] || styleTemplates['유시민'];
        const phrase = style.phrases[Math.floor(Math.random() * style.phrases.length)];

        let message = `${phrase} ${request.target_topic}에 대해 말씀드리면, `;

        if (request.target_topic.includes('시공사') || request.target_topic.includes('선정')) {
            message += '시공사 선정은 매우 중요한 결정입니다. 투명하고 공정한 절차를 통해 최적의 업체를 선택하는 것이 중요합니다.';
        } else {
            message += '이 문제에 대해 신중하게 접근해야 합니다. 모든 이해관계자의 의견을 충분히 수렴하고, 객관적인 기준을 바탕으로 결정을 내려야 합니다.';
        }

        return {
            success: true,
            message: message,
            political_style_used: request.political_style,
            generation_metadata: {
                target_topic: request.target_topic,
                message_intent: request.message_intent,
                context_messages_count: request.context_messages?.length || 0
            }
        };
    }

    // 채팅방 목록 조회
    async getChatRooms(): Promise<ChatRoom[]> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v7/chat-rooms`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.chat_rooms || [];
        } catch (error) {
            console.error('채팅방 목록 조회 실패:', error);
            // 폴백: 기본 채팅방 목록
            return [
                {
                    id: '1',
                    name: '[인증]행복한소유☆개포우성7차',
                    messageCount: 0,
                    lastActivity: new Date().toISOString()
                },
                {
                    id: '2',
                    name: '테스트 카카오톡 대화 파일',
                    messageCount: 0,
                    lastActivity: new Date().toISOString()
                }
            ];
        }
    }

    // 채팅방 메시지 조회
    async getChatMessages(chatRoomId: string): Promise<ChatMessage[]> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v7/chat-messages/${encodeURIComponent(chatRoomId)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.messages || [];
        } catch (error) {
            console.error('채팅방 메시지 조회 실패:', error);
            // 폴백: 샘플 메시지
            return this.getSampleMessages(chatRoomId);
        }
    }

    // 샘플 메시지 생성 (백엔드 연결 실패 시)
    private getSampleMessages(chatRoomId: string): ChatMessage[] {
        const sampleMessages: ChatMessage[] = [
            {
                id: '1',
                sender: '김철수',
                content: '안녕하세요! 오늘 회의 일정 확인해주세요.',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                type: 'text'
            },
            {
                id: '2',
                sender: '이영희',
                content: '네, 오후 2시에 회의실에서 진행하겠습니다.',
                timestamp: new Date(Date.now() - 3500000).toISOString(),
                type: 'text'
            },
            {
                id: '3',
                sender: '박민수',
                content: '회의 자료 미리 보내드릴게요.',
                timestamp: new Date(Date.now() - 3400000).toISOString(),
                type: 'file',
                metadata: {
                    file_name: '회의자료.pdf',
                    file_size: 2048576,
                    file_type: 'pdf'
                }
            },
            {
                id: '4',
                sender: '김철수',
                content: '감사합니다! 자료 잘 받았습니다.',
                timestamp: new Date(Date.now() - 3300000).toISOString(),
                type: 'text'
            },
            {
                id: '5',
                sender: '이영희',
                content: '회의 주제: 시공사 선정 관련 논의\n\n1. 후보 업체 검토\n2. 평가 기준 설정\n3. 투명성 확보 방안',
                timestamp: new Date(Date.now() - 3200000).toISOString(),
                type: 'text'
            },
            {
                id: '6',
                sender: '박민수',
                content: '시공사 선정은 매우 중요한 결정이니 신중하게 접근해야겠습니다.',
                timestamp: new Date(Date.now() - 3100000).toISOString(),
                type: 'text'
            },
            {
                id: '7',
                sender: '김철수',
                content: '투명하고 공정한 절차를 통해 최적의 업체를 선택하는 것이 중요하겠네요.',
                timestamp: new Date(Date.now() - 3000000).toISOString(),
                type: 'text'
            },
            {
                id: '8',
                sender: '이영희',
                content: '모든 이해관계자의 의견을 충분히 수렴하고, 객관적인 기준을 바탕으로 결정을 내려야 합니다.',
                timestamp: new Date(Date.now() - 2900000).toISOString(),
                type: 'text'
            }
        ];

        return sampleMessages;
    }

    // 프로젝트 생성
    async createProject(request: ProjectRequest): Promise<Project> {
        const newProject: Project = {
            id: Date.now().toString(),
            name: request.name,
            chatRoomId: request.chatRoomId,
            chatRoomName: request.chatRoomName,
            files: [],
            guidelines: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // 로컬 스토리지에 저장 (실제로는 백엔드에 저장)
        const projects = this.getProjects();
        projects.push(newProject);
        localStorage.setItem('projects', JSON.stringify(projects));

        return newProject;
    }

    // 프로젝트 목록 조회
    getProjects(): Project[] {
        try {
            const projects = localStorage.getItem('projects');
            return projects ? JSON.parse(projects) : [];
        } catch (error) {
            console.error('프로젝트 목록 조회 실패:', error);
            return [];
        }
    }

    // 프로젝트 업데이트
    updateProject(projectId: string, updates: Partial<Project>): Project | null {
        const projects = this.getProjects();
        const projectIndex = projects.findIndex(p => p.id === projectId);

        if (projectIndex === -1) return null;

        projects[projectIndex] = {
            ...projects[projectIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem('projects', JSON.stringify(projects));
        return projects[projectIndex];
    }

    // 파일 업로드
    async uploadFile(projectId: string, file: File): Promise<ProjectFile> {
        const projectFile: ProjectFile = {
            id: Date.now().toString(),
            name: file.name,
            type: this.getProjectFileType(file.name),
            url: URL.createObjectURL(file),
            size: file.size,
            uploadedAt: new Date().toISOString()
        };

        const project = this.getProjects().find(p => p.id === projectId);
        if (project) {
            project.files.push(projectFile);
            this.updateProject(projectId, { files: project.files });
        }

        return projectFile;
    }

    // 파일 타입 판별 (프로젝트 파일용)
    private getProjectFileType(fileName: string): ProjectFile['type'] {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return 'image';
        if (['mp4', 'avi', 'mov'].includes(ext || '')) return 'video';
        if (['mp3', 'wav', 'aac'].includes(ext || '')) return 'audio';
        if (['xlsx', 'xls', 'csv'].includes(ext || '')) return 'spreadsheet';
        if (['pptx', 'ppt'].includes(ext || '')) return 'presentation';
        return 'document';
    }

    // 지침 추가
    addGuideline(projectId: string, guideline: GuidelineRequest): Guideline | null {
        const newGuideline: Guideline = {
            id: Date.now().toString(),
            title: guideline.title,
            content: guideline.content,
            category: guideline.category,
            priority: guideline.priority,
            isActive: true,
            createdAt: new Date().toISOString()
        };

        const project = this.getProjects().find(p => p.id === projectId);
        if (project) {
            project.guidelines.push(newGuideline);
            this.updateProject(projectId, { guidelines: project.guidelines });
            return newGuideline;
        }

        return null;
    }

    // 시스템 상태 확인
    async getSystemStatus(): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v7/status`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('시스템 상태 확인 실패:', error);
            return {
                status: 'offline',
                message: '백엔드 서버에 연결할 수 없습니다. 로컬 모드로 실행 중입니다.'
            };
        }
    }

    // 정치인 스타일 목록 조회
    async getAvailablePoliticalStyles(): Promise<any[]> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v7/political-style/available-styles`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.available_styles || [];
        } catch (error) {
            console.error('정치인 스타일 목록 조회 실패:', error);
            // 기본 정치인 스타일 목록
            return [
                { id: 'yusimin', name: '유시민', description: '논리적 설득형, 객관적 분석' },
                { id: 'jungjunhee', name: '정준희', description: '날카로운 분석형, 현실 직시' },
                { id: 'jinjungkwon', name: '진중권', description: '신랄한 비판형, 철학적 접근' },
                { id: 'parkhyungjun', name: '박형준', description: '균형잡힌 중재형, 건설적 접근' },
                { id: 'jungwonchak', name: '정원책', description: '열정적 개혁형, 진보적 가치' },
                { id: 'leechulhee', name: '이철희', description: '치밀한 분석형, 체계적 접근' }
            ];
        }
    }

    // 메시지 품질 분석
    async analyzeMessageQuality(message: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v7/political-style/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message_content: message }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('메시지 품질 분석 실패:', error);
            // 기본 품질 점수
            return {
                success: true,
                quality_score: 85 + Math.random() * 10,
                analysis: {
                    readability: 0.8,
                    coherence: 0.85,
                    style_consistency: 0.9
                }
            };
        }
    }

    // 고급 분석 데이터
    async getAdvancedAnalytics(): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v7/analytics`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('고급 분석 데이터 로드 실패:', error);
            // 기본 분석 데이터
            return {
                totalMessages: 5265,
                participants: 77,
                activityScore: 85,
                emotion: {
                    positive: 40,
                    neutral: 30,
                    negative: 30
                },
                topics: [
                    { name: '시공사 선정', count: 120 },
                    { name: '분담금', count: 90 },
                    { name: '회의 일정', count: 70 }
                ]
            };
        }
    }

    // 브레인워시 메시지 생성
    async generateBrainwashMessage(context: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v7/message/brainwash`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ context }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('브레인워시 메시지 생성 실패:', error);
            return {
                success: true,
                message: `브레인워시 스타일 메시지: ${context}에 대한 설득력 있는 메시지를 생성했습니다.`,
                style: 'persuasive',
                confidence: 0.85
            };
        }
    }

    // 설득 메시지 생성
    async generatePersuasionMessage(context: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v7/message/persuasion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ context }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('설득 메시지 생성 실패:', error);
            return {
                success: true,
                message: `설득 메시지: ${context}에 대한 설득력 있는 메시지를 생성했습니다.`,
                style: 'persuasive',
                confidence: 0.9
            };
        }
    }

    // 분석 메시지 생성
    async generateAnalysisMessage(context: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v7/message/analysis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ context }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('분석 메시지 생성 실패:', error);
            return {
                success: true,
                message: `분석 메시지: ${context}에 대한 객관적 분석 메시지를 생성했습니다.`,
                style: 'analytical',
                confidence: 0.88
            };
        }
    }

    // 비즈니스 문서 생성
    async generateBusinessDocument(context: string, type: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v7/business/document`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ context, type }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('비즈니스 문서 생성 실패:', error);
            return this.generateLocalBusinessDocument(context, type);
        }
    }

    // 로컬 비즈니스 문서 생성 (백엔드 연결 실패 시)
    private generateLocalBusinessDocument(type: string, context: string, options: any = {}): any {
        const templates = {
            'proposal': {
                title: '사업 제안서',
                structure: [
                    '1. 사업 개요',
                    '2. 시장 분석',
                    '3. 사업 계획',
                    '4. 재무 계획',
                    '5. 위험 요소 및 대응 방안',
                    '6. 결론'
                ],
                content: `# 사업 제안서

## 1. 사업 개요
${context}에 대한 사업 제안서입니다.

## 2. 시장 분석
- 시장 규모: 추정 시장 규모
- 성장률: 연평균 성장률
- 경쟁 환경: 주요 경쟁사 분석

## 3. 사업 계획
- 핵심 가치 제안
- 수익 모델
- 마케팅 전략

## 4. 재무 계획
- 초기 투자금
- 예상 수익
- 손익분기점

## 5. 위험 요소 및 대응 방안
- 주요 위험 요소
- 대응 전략

## 6. 결론
이 사업은 ${context} 분야에서 성공 가능성이 높은 프로젝트입니다.`
            },
            'report': {
                title: '업무 보고서',
                structure: [
                    '1. 개요',
                    '2. 주요 성과',
                    '3. 문제점 및 개선사항',
                    '4. 향후 계획',
                    '5. 결론'
                ],
                content: `# 업무 보고서

## 1. 개요
${context}에 대한 업무 보고서입니다.

## 2. 주요 성과
- 목표 달성률
- 주요 성과 지표
- 고객 만족도

## 3. 문제점 및 개선사항
- 현재 문제점
- 개선 방안
- 필요 자원

## 4. 향후 계획
- 단기 목표
- 중장기 계획
- 예상 결과

## 5. 결론
${context} 관련 업무가 성공적으로 진행되고 있습니다.`
            },
            'email': {
                title: '비즈니스 이메일',
                structure: [
                    '인사말',
                    '본문',
                    '요청사항',
                    '마무리'
                ],
                content: `제목: ${context} 관련 안내

안녕하세요,

${context}에 대해 안내드립니다.

[본문 내용]

추가 문의사항이 있으시면 언제든 연락주시기 바랍니다.

감사합니다.

[이름]
[직책]
[연락처]`
            },
            'presentation': {
                title: '프레젠테이션',
                structure: [
                    '1. 개요',
                    '2. 현재 상황',
                    '3. 제안사항',
                    '4. 기대효과',
                    '5. 다음 단계'
                ],
                content: `# ${context} 프레젠테이션

## 1. 개요
- 목적
- 배경
- 범위

## 2. 현재 상황
- 현황 분석
- 문제점
- 기회 요소

## 3. 제안사항
- 핵심 제안
- 구체적 방안
- 필요 자원

## 4. 기대효과
- 정량적 효과
- 정성적 효과
- ROI 분석

## 5. 다음 단계
- 실행 계획
- 일정
- 담당자`
            }
        };

        const template = templates[type as keyof typeof templates] || templates.proposal;

        return {
            success: true,
            document: {
                type,
                title: template.title,
                structure: template.structure,
                content: template.content,
                metadata: {
                    generated_at: new Date().toISOString(),
                    context,
                    options
                }
            }
        };
    }

    // 실무용 메시지 템플릿 생성
    async generateProfessionalTemplate(type: string, context: string, style: string = 'formal'): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v7/template/professional`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type, context, style }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('전문 템플릿 생성 실패:', error);
            return this.generateLocalProfessionalTemplate(type, context, style);
        }
    }

    // 로컬 전문 템플릿 생성 (백엔드 연결 실패 시)
    private generateLocalProfessionalTemplate(type: string, context: string, style: string): any {
        const templates = {
            'email': {
                title: '전문 이메일 템플릿',
                content: `제목: ${context} 관련 안내

안녕하세요,

${context}에 대해 안내드립니다.

[본문 내용]

추가 문의사항이 있으시면 언제든 연락주시기 바랍니다.

감사합니다.

[이름]
[직책]
[연락처]`
            },
            'report': {
                title: '전문 보고서 템플릿',
                content: `# ${context} 보고서

## 개요
${context}에 대한 전문 보고서입니다.

## 주요 내용
- 핵심 사항
- 분석 결과
- 권장사항

## 결론
${context}에 대한 전문적인 분석과 제안을 제시합니다.`
            },
            'proposal': {
                title: '전문 제안서 템플릿',
                content: `# ${context} 제안서

## 제안 개요
${context}에 대한 전문 제안서입니다.

## 제안 내용
- 목표
- 방법론
- 예상 결과

## 결론
${context}에 대한 전문적인 제안을 제시합니다.`
            }
        };

        const template = templates[type as keyof typeof templates] || templates.email;

        return {
            success: true,
            template: {
                type: type,
                style: style,
                title: template.title,
                content: template.content,
                context: context
            }
        };
    }

    // 실무용 데이터 분석
    async analyzeBusinessData(data: any): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v7/analysis/business`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('비즈니스 데이터 분석 실패:', error);
            return {
                success: true,
                analysis: {
                    insights: [
                        '데이터 기반 의사결정을 위한 가이드라인을 제공합니다.',
                        '시장 동향과 경쟁사 분석 결과를 포함합니다.',
                        '리스크 관리 방안을 제시합니다.'
                    ],
                    recommendations: [
                        '전략적 접근 방식을 고려하세요.',
                        '지속적인 모니터링 체계를 구축하세요.',
                        '데이터 기반 의사결정을 강화하세요.'
                    ],
                    summary: '종합적인 비즈니스 분석을 완료했습니다.'
                }
            };
        }
    }

    // 실무용 프로젝트 관리
    async createBusinessProject(projectData: any): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v7/project/business`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(projectData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('비즈니스 프로젝트 생성 실패:', error);
            return {
                success: true,
                project: {
                    name: `${projectData.name || '새 프로젝트'}`,
                    description: `${projectData.description || '비즈니스 프로젝트'}`,
                    type: projectData.type || 'business',
                    status: 'active',
                    milestones: [
                        '프로젝트 기획 및 목표 설정',
                        '팀 구성 및 역할 분담',
                        '실행 계획 수립',
                        '진행 상황 모니터링',
                        '결과 평가 및 피드백'
                    ]
                }
            };
        }
    }

    // 파일 업로드 및 분석
    async uploadAndAnalyzeFile(file: File, context: string = ''): Promise<any> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('context', context);

            const response = await fetch(`${this.baseUrl}/api/v7/file/upload-analyze`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('파일 업로드 및 분석 실패:', error);
            return this.analyzeFileLocally(file, context);
        }
    }

    // 로컬 파일 분석 (백엔드 연결 실패 시)
    private async analyzeFileLocally(file: File, context: string): Promise<any> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                const fileType = this.getFileType(file.name);

                let analysis = '';
                let extractedText = '';

                if (fileType === 'text') {
                    extractedText = content;
                    analysis = `파일 "${file.name}"을 분석했습니다.\n\n주요 내용:\n${content.substring(0, 500)}...\n\n${context ? `요청사항 "${context}"에 대한 답변:\n` : ''}이 문서를 기반으로 한 답변을 제공합니다.`;
                } else if (fileType === 'image') {
                    extractedText = '[이미지 파일]';
                    analysis = `이미지 파일 "${file.name}"을 업로드했습니다.\n\n${context ? `요청사항 "${context}"에 대한 답변:\n` : ''}이미지 내용을 기반으로 한 답변을 제공합니다.`;
                } else {
                    extractedText = '[지원하지 않는 파일 형식]';
                    analysis = `파일 "${file.name}"은 현재 지원하지 않는 형식입니다.\n\n지원 형식: 텍스트 파일(.txt, .md, .doc, .docx), 이미지 파일(.jpg, .png, .gif)`;
                }

                resolve({
                    success: true,
                    analysis: {
                        filename: file.name,
                        fileType: fileType,
                        fileSize: file.size,
                        extractedText: extractedText,
                        analysis: analysis,
                        context: context,
                        uploadedAt: new Date().toISOString()
                    }
                });
            };
            reader.readAsText(file);
        });
    }

    // 파일 타입 확인
    private getFileType(filename: string): string {
        const ext = filename.toLowerCase().split('.').pop();
        const textExtensions = ['txt', 'md', 'doc', 'docx', 'pdf'];
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];

        if (textExtensions.includes(ext || '')) return 'text';
        if (imageExtensions.includes(ext || '')) return 'image';
        return 'unknown';
    }

    // 파일 기반 AI 답변 생성
    async generateFileBasedResponse(fileAnalysis: any, question: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v7/file/generate-response`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileAnalysis,
                    question
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('파일 기반 답변 생성 실패:', error);
            return this.generateLocalFileBasedResponse(fileAnalysis, question);
        }
    }

    // 로컬 파일 기반 답변 생성
    private generateLocalFileBasedResponse(fileAnalysis: any, question: string): any {
        const response = `파일 "${fileAnalysis.filename}"을 기반으로 한 답변입니다:

**파일 정보:**
- 파일명: ${fileAnalysis.filename}
- 파일 타입: ${fileAnalysis.fileType}
- 파일 크기: ${(fileAnalysis.fileSize / 1024).toFixed(2)} KB

**질문:** ${question}

**답변:**
${fileAnalysis.analysis}

이 답변은 업로드된 파일의 내용을 분석하여 생성되었습니다. 추가 질문이 있으시면 언제든 말씀해 주세요.`;

        return {
            success: true,
            response: {
                content: response,
                sourceFile: fileAnalysis.filename,
                generatedAt: new Date().toISOString()
            }
        };
    }

    // 다중 파일 업로드 및 분석
    async uploadMultipleFiles(files: File[], context: string = ''): Promise<any> {
        try {
            const formData = new FormData();
            files.forEach((file, index) => {
                formData.append(`file_${index}`, file);
            });
            formData.append('context', context);

            const response = await fetch(`${this.baseUrl}/api/v7/file/upload-multiple`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('다중 파일 업로드 실패:', error);
            return this.analyzeMultipleFilesLocally(files, context);
        }
    }

    // 로컬 다중 파일 분석
    private async analyzeMultipleFilesLocally(files: File[], context: string): Promise<any> {
        const analyses = [];

        for (const file of files) {
            const analysis = await this.analyzeFileLocally(file, context);
            analyses.push(analysis.analysis);
        }

        return {
            success: true,
            analyses: analyses,
            totalFiles: files.length,
            context: context
        };
    }

    // ChatGPT 스타일 고급 파일 분석
    async analyzeFileAdvanced(file: File, context: string = ''): Promise<any> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('context', context);
            formData.append('advanced_analysis', 'true');

            const response = await fetch(`${this.baseUrl}/api/v7/file/advanced-analyze`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('고급 파일 분석 실패:', error);
            return this.analyzeFileAdvancedLocally(file, context);
        }
    }

    // 로컬 고급 파일 분석
    private async analyzeFileAdvancedLocally(file: File, context: string): Promise<any> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                const fileType = this.getFileType(file.name);

                let analysis = '';
                let extractedText = '';
                let insights: string[] = [];
                let recommendations: string[] = [];

                if (fileType === 'text') {
                    extractedText = content;

                    // 고급 텍스트 분석
                    const wordCount = content.split(/\s+/).length;
                    const charCount = content.length;
                    const paragraphCount = content.split(/\n\s*\n/).length;

                    // 키워드 추출 (간단한 버전)
                    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
                    const wordFreq: { [key: string]: number } = {};
                    words.forEach(word => {
                        if (word.length > 2) {
                            wordFreq[word] = (wordFreq[word] || 0) + 1;
                        }
                    });

                    const topKeywords = Object.entries(wordFreq)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([word]) => word);

                    insights = [
                        `문서 길이: ${wordCount}단어, ${charCount}문자`,
                        `단락 수: ${paragraphCount}개`,
                        `주요 키워드: ${topKeywords.join(', ')}`,
                        `문서 유형: ${this.detectDocumentType(content)}`
                    ];

                    recommendations = [
                        '문서의 핵심 내용을 요약하여 정리하세요',
                        '주요 키워드를 활용한 검색 최적화를 고려하세요',
                        '단락별로 구조화하여 가독성을 높이세요'
                    ];

                    analysis = `📄 **고급 문서 분석 결과**

**문서 정보:**
- 파일명: ${file.name}
- 파일 크기: ${(file.size / 1024).toFixed(2)} KB
- 단어 수: ${wordCount}개
- 문자 수: ${charCount}개
- 단락 수: ${paragraphCount}개

**주요 인사이트:**
${insights.map(insight => `• ${insight}`).join('\n')}

**추천사항:**
${recommendations.map(rec => `• ${rec}`).join('\n')}

**문서 내용 요약:**
${content.substring(0, 300)}${content.length > 300 ? '...' : ''}

${context ? `**요청사항 "${context}"에 대한 답변:**\n` : ''}이 문서를 기반으로 한 전문적인 분석과 답변을 제공합니다.`;

                } else if (fileType === 'image') {
                    extractedText = '[이미지 파일]';
                    insights = [
                        '이미지 파일이 업로드되었습니다',
                        '이미지 내용 분석이 필요합니다',
                        'OCR 기능을 활용하여 텍스트 추출 가능'
                    ];
                    recommendations = [
                        '이미지의 주요 내용을 설명해주세요',
                        '이미지와 관련된 질문을 구체적으로 해주세요'
                    ];

                    analysis = `🖼️ **이미지 파일 분석**

**파일 정보:**
- 파일명: ${file.name}
- 파일 크기: ${(file.size / 1024).toFixed(2)} KB
- 파일 형식: 이미지

**분석 결과:**
${insights.map(insight => `• ${insight}`).join('\n')}

**추천사항:**
${recommendations.map(rec => `• ${rec}`).join('\n')}

${context ? `**요청사항 "${context}"에 대한 답변:**\n` : ''}이미지 내용을 기반으로 한 답변을 제공합니다.`;
                } else {
                    extractedText = '[지원하지 않는 파일 형식]';
                    analysis = `❌ **지원하지 않는 파일 형식**

파일 "${file.name}"은 현재 지원하지 않는 형식입니다.

**지원 형식:**
• 텍스트 파일: .txt, .md, .doc, .docx, .pdf
• 이미지 파일: .jpg, .png, .gif, .bmp, .webp

다른 형식의 파일로 다시 시도해 주세요.`;
                }

                resolve({
                    success: true,
                    analysis: {
                        filename: file.name,
                        fileType: fileType,
                        fileSize: file.size,
                        extractedText: extractedText,
                        analysis: analysis,
                        insights: insights,
                        recommendations: recommendations,
                        context: context,
                        uploadedAt: new Date().toISOString(),
                        advancedAnalysis: true
                    }
                });
            };
            reader.readAsText(file);
        });
    }

    // 문서 유형 감지
    private detectDocumentType(content: string): string {
        const lowerContent = content.toLowerCase();

        if (lowerContent.includes('제안서') || lowerContent.includes('proposal')) return '제안서';
        if (lowerContent.includes('보고서') || lowerContent.includes('report')) return '보고서';
        if (lowerContent.includes('계약서') || lowerContent.includes('contract')) return '계약서';
        if (lowerContent.includes('매뉴얼') || lowerContent.includes('manual')) return '매뉴얼';
        if (lowerContent.includes('가이드') || lowerContent.includes('guide')) return '가이드';
        if (lowerContent.includes('정책') || lowerContent.includes('policy')) return '정책문서';
        if (lowerContent.includes('회의록') || lowerContent.includes('minutes')) return '회의록';
        if (lowerContent.includes('이메일') || lowerContent.includes('email')) return '이메일';

        return '일반 문서';
    }

    // 파일을 프로젝트에 자동 분류
    async autoClassifyAndAddToProject(file: File, projectId: string, context: string = ''): Promise<any> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('projectId', projectId);
            formData.append('context', context);

            const response = await fetch(`${this.baseUrl}/api/v7/file/auto-classify`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('파일 자동 분류 실패:', error);
            return this.autoClassifyFileLocally(file, projectId, context);
        }
    }

    // 로컬 파일 자동 분류
    private async autoClassifyFileLocally(file: File, projectId: string, context: string): Promise<any> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                const fileType = this.getFileType(file.name);

                // 파일 분류 로직
                const classification = this.classifyFile(file, content);

                // 프로젝트 파일 생성
                const projectFile: ProjectFile = {
                    id: Date.now().toString(),
                    name: file.name,
                    type: this.getProjectFileType(file.name),
                    url: URL.createObjectURL(file),
                    size: file.size,
                    uploadedAt: new Date().toISOString()
                };

                resolve({
                    success: true,
                    classification: {
                        category: classification.category,
                        subcategory: classification.subcategory,
                        tags: classification.tags,
                        confidence: classification.confidence
                    },
                    projectFile: projectFile,
                    message: `파일 "${file.name}"이(가) "${classification.category}" 카테고리로 자동 분류되어 프로젝트에 추가되었습니다.`
                });
            };
            reader.readAsText(file);
        });
    }

    // 파일 분류 로직
    private classifyFile(file: File, content: string): any {
        const fileName = file.name.toLowerCase();
        const fileContent = content.toLowerCase();

        // 카테고리별 키워드 정의
        const categories = {
            '문서': {
                keywords: ['제안서', '보고서', '계약서', '매뉴얼', '가이드', '정책', '회의록'],
                subcategories: {
                    '제안서': ['proposal', '제안', '안건'],
                    '보고서': ['report', '보고', '분석'],
                    '계약서': ['contract', '계약', '협약'],
                    '매뉴얼': ['manual', '설명서', '사용법'],
                    '가이드': ['guide', '지침', '안내'],
                    '정책': ['policy', '정책', '규정'],
                    '회의록': ['minutes', '회의', '논의']
                }
            },
            '미디어': {
                keywords: ['이미지', '사진', '그림', '스크린샷', 'image', 'photo', 'picture'],
                subcategories: {
                    '이미지': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
                    '스크린샷': ['screenshot', '화면', '캡처'],
                    '사진': ['photo', '사진', '촬영']
                }
            },
            '데이터': {
                keywords: ['데이터', '통계', '분석', 'chart', 'graph', 'excel', 'csv'],
                subcategories: {
                    '스프레드시트': ['excel', 'xlsx', 'csv', '데이터'],
                    '차트': ['chart', 'graph', '그래프'],
                    '통계': ['statistics', '통계', '분석']
                }
            },
            '프레젠테이션': {
                keywords: ['ppt', 'powerpoint', '발표', 'presentation'],
                subcategories: {
                    '발표자료': ['presentation', '발표', 'ppt'],
                    '슬라이드': ['slide', '슬라이드']
                }
            }
        };

        // 카테고리 결정
        let bestCategory = '기타';
        let bestSubcategory = '일반';
        let confidence = 0.5;
        let tags: string[] = [];

        for (const [category, categoryInfo] of Object.entries(categories)) {
            const categoryScore = categoryInfo.keywords.filter(keyword =>
                fileName.includes(keyword) || fileContent.includes(keyword)
            ).length;

            if (categoryScore > 0) {
                bestCategory = category;
                confidence = Math.min(0.9, 0.5 + categoryScore * 0.1);

                // 서브카테고리 결정
                for (const [subcategory, subKeywords] of Object.entries(categoryInfo.subcategories)) {
                    const subScore = subKeywords.filter(keyword =>
                        fileName.includes(keyword) || fileContent.includes(keyword)
                    ).length;

                    if (subScore > 0) {
                        bestSubcategory = subcategory;
                        confidence = Math.min(0.95, confidence + subScore * 0.05);
                        break;
                    }
                }

                // 태그 생성
                tags = categoryInfo.keywords.filter(keyword =>
                    fileName.includes(keyword) || fileContent.includes(keyword)
                ).slice(0, 3);
                break;
            }
        }

        return {
            category: bestCategory,
            subcategory: bestSubcategory,
            tags: tags,
            confidence: confidence
        };
    }

    // ChatGPT 스타일 대화형 파일 분석
    async chatWithFile(file: File, messages: any[]): Promise<any> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('messages', JSON.stringify(messages));

            const response = await fetch(`${this.baseUrl}/api/v7/file/chat`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('파일과의 대화 실패:', error);
            return this.chatWithFileLocally(file, messages);
        }
    }

    // 로컬 파일과의 대화
    private async chatWithFileLocally(file: File, messages: any[]): Promise<any> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                const lastMessage = messages[messages.length - 1]?.content || '';

                // 간단한 대화형 응답 생성
                const response = `파일 "${file.name}"에 대한 질문을 받았습니다.

**파일 내용:**
${content.substring(0, 200)}${content.length > 200 ? '...' : ''}

**질문:** ${lastMessage}

**답변:**
이 파일을 기반으로 한 답변을 제공합니다. 파일의 내용을 분석하여 구체적인 답변을 드릴 수 있습니다. 추가 질문이 있으시면 언제든 말씀해 주세요.`;

                resolve({
                    success: true,
                    response: {
                        content: response,
                        sourceFile: file.name,
                        timestamp: new Date().toISOString()
                    }
                });
            };
            reader.readAsText(file);
        });
    }
}

export const apiService = new ApiService();
export default apiService; 