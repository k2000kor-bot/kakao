import { ChatSession } from '../types/chat';
import { Project } from '../types/project';

interface ContextNode {
    id: string;
    type: 'topic' | 'entity' | 'action' | 'emotion' | 'temporal';
    value: string;
    confidence: number;
    timestamp: Date;
    relationships: string[];
    metadata: {
        [key: string]: any;
    };
}

interface ConversationContext {
    sessionId: string;
    currentTopic: string;
    entities: Map<string, ContextNode>;
    topics: Map<string, ContextNode>;
    actions: Map<string, ContextNode>;
    emotions: Map<string, ContextNode>;
    temporalContext: {
        currentTime: Date;
        conversationStart: Date;
        lastActivity: Date;
        duration: number;
    };
    userPreferences: {
        [key: string]: any;
    };
    conversationFlow: {
        [key: string]: any;
    };
}

export class IntelligentContextManager {
    private contexts: Map<string, ConversationContext> = new Map();
    private globalContext: Map<string, any> = new Map();

    // 컨텍스트 초기화
    initializeContext(sessionId: string, project?: Project): ConversationContext {
        const context: ConversationContext = {
            sessionId,
            currentTopic: 'general',
            entities: new Map(),
            topics: new Map(),
            actions: new Map(),
            emotions: new Map(),
            temporalContext: {
                currentTime: new Date(),
                conversationStart: new Date(),
                lastActivity: new Date(),
                duration: 0
            },
            userPreferences: {},
            conversationFlow: {}
        };

        // 프로젝트 컨텍스트 추가
        if (project) {
            this.addProjectContext(context, project);
        }

        this.contexts.set(sessionId, context);
        return context;
    }

    // 프로젝트 컨텍스트 추가
    private addProjectContext(context: ConversationContext, project: Project) {
        const projectNode: ContextNode = {
            id: `project_${project.id}`,
            type: 'entity',
            value: project.name,
            confidence: 1.0,
            timestamp: new Date(),
            relationships: [],
            metadata: {
                projectId: project.id,
                description: project.description,
                createdAt: project.createdAt
            }
        };

        context.entities.set(projectNode.id, projectNode);
        context.currentTopic = project.name;
    }

    // 메시지 컨텍스트 분석
    async analyzeMessageContext(message: string, sessionId: string): Promise<ContextNode[]> {
        const context = this.contexts.get(sessionId);
        if (!context) return [];

        const nodes: ContextNode[] = [];

        // 토픽 추출
        const topics = this.extractTopics(message);
        topics.forEach(topic => {
            const node: ContextNode = {
                id: `topic_${Date.now()}_${Math.random()}`,
                type: 'topic',
                value: topic,
                confidence: 0.8,
                timestamp: new Date(),
                relationships: [],
                metadata: {}
            };
            nodes.push(node);
            context.topics.set(node.id, node);
        });

        // 엔티티 추출
        const entities = this.extractEntities(message);
        entities.forEach(entity => {
            const node: ContextNode = {
                id: `entity_${Date.now()}_${Math.random()}`,
                type: 'entity',
                value: entity,
                confidence: 0.9,
                timestamp: new Date(),
                relationships: [],
                metadata: {}
            };
            nodes.push(node);
            context.entities.set(node.id, node);
        });

        // 액션 추출
        const actions = this.extractActions(message);
        actions.forEach(action => {
            const node: ContextNode = {
                id: `action_${Date.now()}_${Math.random()}`,
                type: 'action',
                value: action,
                confidence: 0.7,
                timestamp: new Date(),
                relationships: [],
                metadata: {}
            };
            nodes.push(node);
            context.actions.set(node.id, node);
        });

        // 감정 추출
        const emotions = this.extractEmotions(message);
        emotions.forEach(emotion => {
            const node: ContextNode = {
                id: `emotion_${Date.now()}_${Math.random()}`,
                type: 'emotion',
                value: emotion,
                confidence: 0.6,
                timestamp: new Date(),
                relationships: [],
                metadata: {}
            };
            nodes.push(node);
            context.emotions.set(node.id, node);
        });

        // 컨텍스트 업데이트
        this.updateContext(context, nodes);
        return nodes;
    }

    // 토픽 추출
    private extractTopics(message: string): string[] {
        const topics: string[] = [];

        // 키워드 기반 토픽 추출
        const topicKeywords = {
            '건설': ['시공', '공사', '건설사', '시공사'],
            '부동산': ['매물', '부동산', '집', '아파트'],
            '투자': ['투자', '금융', '주식', '펀드'],
            '기술': ['IT', '기술', '소프트웨어', '개발'],
            '분석': ['분석', '검토', '평가', '조사']
        };

        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
            if (keywords.some(keyword => message.includes(keyword))) {
                topics.push(topic);
            }
        });

        return topics;
    }

    // 엔티티 추출
    private extractEntities(message: string): string[] {
        const entities: string[] = [];

        // 회사명 패턴
        const companyPattern = /([가-힣]+(?:건설|물산|개발|투자|그룹))/g;
        const companies = message.match(companyPattern);
        if (companies) {
            entities.push(...companies);
        }

        // 숫자 패턴 (가격, 비율 등)
        const numberPattern = /(\d+(?:억|천만|만|%)?)/g;
        const numbers = message.match(numberPattern);
        if (numbers) {
            entities.push(...numbers);
        }

        // 날짜 패턴
        const datePattern = /(\d{4}년|\d{1,2}월|\d{1,2}일)/g;
        const dates = message.match(datePattern);
        if (dates) {
            entities.push(...dates);
        }

        return entities;
    }

    // 액션 추출
    private extractActions(message: string): string[] {
        const actions: string[] = [];

        const actionKeywords = [
            '분석', '검토', '평가', '조사', '연구',
            '추천', '제안', '권장', '조언',
            '예측', '전망', '예상', '추정',
            '비교', '대조', '검증', '확인'
        ];

        actionKeywords.forEach(action => {
            if (message.includes(action)) {
                actions.push(action);
            }
        });

        return actions;
    }

    // 감정 추출
    private extractEmotions(message: string): string[] {
        const emotions: string[] = [];

        const emotionKeywords = {
            '긍정': ['좋다', '훌륭하다', '만족', '성공', '희망'],
            '부정': ['나쁘다', '실패', '불만', '우려', '문제'],
            '중립': ['보통', '일반', '평균', '보편']
        };

        Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
            if (keywords.some(keyword => message.includes(keyword))) {
                emotions.push(emotion);
            }
        });

        return emotions;
    }

    // 컨텍스트 업데이트
    private updateContext(context: ConversationContext, nodes: ContextNode[]) {
        // 현재 토픽 업데이트
        const topicNodes = nodes.filter(node => node.type === 'topic');
        if (topicNodes.length > 0) {
            context.currentTopic = topicNodes[0].value;
        }

        // 시간 컨텍스트 업데이트
        context.temporalContext.lastActivity = new Date();
        context.temporalContext.duration =
            context.temporalContext.lastActivity.getTime() -
            context.temporalContext.conversationStart.getTime();

        // 사용자 선호도 업데이트
        this.updateUserPreferences(context, nodes);
    }

    // 사용자 선호도 업데이트
    private updateUserPreferences(context: ConversationContext, nodes: ContextNode[]) {
        const emotionNodes = nodes.filter(node => node.type === 'emotion');
        const actionNodes = nodes.filter(node => node.type === 'action');

        // 감정 기반 선호도
        emotionNodes.forEach(node => {
            if (node.value === '긍정') {
                context.userPreferences.satisfaction = 'high';
            } else if (node.value === '부정') {
                context.userPreferences.satisfaction = 'low';
            }
        });

        // 액션 기반 선호도
        actionNodes.forEach(node => {
            if (node.value === '분석') {
                context.userPreferences.analysisDepth = 'detailed';
            } else if (node.value === '추천') {
                context.userPreferences.responseType = 'recommendation';
            }
        });
    }

    // 컨텍스트 기반 응답 생성
    async generateContextualResponse(message: string, sessionId: string): Promise<string> {
        const context = this.contexts.get(sessionId);
        if (!context) return message;

        // 컨텍스트 분석
        const nodes = await this.analyzeMessageContext(message, sessionId);

        // 컨텍스트 기반 응답 조정
        let response = message;

        // 토픽 기반 조정
        const topicNodes = nodes.filter(node => node.type === 'topic');
        if (topicNodes.length > 0) {
            response = this.adjustResponseByTopic(response, topicNodes[0].value);
        }

        // 감정 기반 조정
        const emotionNodes = nodes.filter(node => node.type === 'emotion');
        if (emotionNodes.length > 0) {
            response = this.adjustResponseByEmotion(response, emotionNodes[0].value);
        }

        // 사용자 선호도 기반 조정
        response = this.adjustResponseByPreferences(response, context.userPreferences);

        return response;
    }

    // 토픽 기반 응답 조정
    private adjustResponseByTopic(response: string, topic: string): string {
        const topicAdjustments: { [key: string]: string } = {
            '건설': '건설 업계의 전문적인 관점에서 ',
            '부동산': '부동산 시장의 특성을 고려하여 ',
            '투자': '투자 관점에서 위험과 수익을 고려하여 ',
            '기술': '기술적 관점에서 혁신과 효율성을 고려하여 ',
            '분석': '체계적인 분석을 통해 '
        };

        const adjustment = topicAdjustments[topic];
        if (adjustment) {
            return adjustment + response;
        }

        return response;
    }

    // 감정 기반 응답 조정
    private adjustResponseByEmotion(response: string, emotion: string): string {
        if (emotion === '긍정') {
            return response + ' (긍정적인 관점에서 분석)';
        } else if (emotion === '부정') {
            return response + ' (우려사항을 고려한 분석)';
        }

        return response;
    }

    // 선호도 기반 응답 조정
    private adjustResponseByPreferences(response: string, preferences: { [key: string]: any }): string {
        if (preferences.analysisDepth === 'detailed') {
            return response + ' (상세한 분석 포함)';
        }

        if (preferences.responseType === 'recommendation') {
            return response + ' (구체적인 추천사항 포함)';
        }

        return response;
    }

    // 컨텍스트 요약 생성
    generateContextSummary(sessionId: string): string {
        const context = this.contexts.get(sessionId);
        if (!context) return '컨텍스트 정보가 없습니다.';

        const summary = {
            currentTopic: context.currentTopic,
            entities: Array.from(context.entities.values()).map(e => e.value),
            topics: Array.from(context.topics.values()).map(t => t.value),
            emotions: Array.from(context.emotions.values()).map(e => e.value),
            duration: Math.round(context.temporalContext.duration / 1000 / 60), // 분 단위
            userPreferences: context.userPreferences
        };

        return `## 📊 대화 컨텍스트 요약

**현재 토픽**: ${summary.currentTopic}
**주요 엔티티**: ${summary.entities.join(', ') || '없음'}
**다룬 주제**: ${summary.topics.join(', ') || '없음'}
**감정 상태**: ${summary.emotions.join(', ') || '중립'}
**대화 시간**: ${summary.duration}분
**사용자 선호도**: ${JSON.stringify(summary.userPreferences, null, 2)}`;
    }

    // 컨텍스트 조회
    getContext(sessionId: string): ConversationContext | null {
        return this.contexts.get(sessionId) || null;
    }

    // 전역 컨텍스트 설정
    setGlobalContext(key: string, value: any) {
        this.globalContext.set(key, value);
    }

    // 전역 컨텍스트 조회
    getGlobalContext(key: string): any {
        return this.globalContext.get(key);
    }

    // 컨텍스트 정리
    clearContext(sessionId: string) {
        this.contexts.delete(sessionId);
    }
}

const intelligentContextManager = new IntelligentContextManager();
export default intelligentContextManager;
