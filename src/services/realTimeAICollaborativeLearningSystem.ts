import realTimeAIAlertSystem from './realTimeAIAlertSystem';
import { errorLogger } from '../utils/errorLogger';

// 협업 학습 인터페이스
interface CollaborativeSession {
    id: string;
    name: string;
    description: string;
    session_type: 'brainstorming' | 'problem_solving' | 'knowledge_sharing' | 'project_collaboration' | 'peer_review' | 'group_discussion';
    participants: string[];
    facilitators: string[];
    status: 'planning' | 'active' | 'paused' | 'completed' | 'archived';
    created_at: Date;
    started_at?: Date;
    completed_at?: Date;
    settings: CollaborativeSessionSettings;
}

interface CollaborativeSessionSettings {
    max_participants: number;
    session_duration: number; // minutes
    collaboration_mode: 'synchronous' | 'asynchronous' | 'hybrid';
    privacy_level: 'public' | 'private' | 'invite_only';
    recording_enabled: boolean;
    ai_assistance_level: 'minimal' | 'moderate' | 'high' | 'full';
}

interface CollaborativeInteraction {
    id: string;
    session_id: string;
    user_id: string;
    interaction_type: 'message' | 'idea' | 'question' | 'feedback' | 'resource' | 'vote' | 'action';
    content: string;
    metadata: Record<string, unknown>;
    timestamp: Date;
    response_to?: string;
    reactions: CollaborativeReaction[];
    ai_analysis?: AIInteractionAnalysis;
}

interface CollaborativeReaction {
    user_id: string;
    reaction_type: 'like' | 'dislike' | 'agree' | 'disagree' | 'helpful' | 'confused' | 'excited' | 'neutral';
    timestamp: Date;
}

interface AIInteractionAnalysis {
    sentiment: 'positive' | 'negative' | 'neutral';
    relevance_score: number; // 0-1
    contribution_quality: number; // 0-1
    collaboration_impact: number; // 0-1
    suggested_responses: string[];
    insights: string[];
}

interface CollaborativePattern {
    id: string;
    session_id: string;
    pattern_type: 'communication' | 'idea_generation' | 'decision_making' | 'conflict_resolution' | 'knowledge_sharing';
    participants: string[];
    frequency: number;
    effectiveness: number; // 0-1
    description: string;
    examples: string[];
    recommendations: string[];
    created_at: Date;
}

interface GroupIntelligence {
    id: string;
    session_id: string;
    collective_knowledge: Record<string, number>; // topic -> confidence
    shared_understanding: number; // 0-1
    group_cohesion: number; // 0-1
    decision_quality: number; // 0-1
    innovation_potential: number; // 0-1
    collaboration_efficiency: number; // 0-1
    insights: string[];
    recommendations: string[];
    updated_at: Date;
}

interface CollaborativeMetrics {
    totalSessions: number;
    activeSessions: number;
    totalParticipants: number;
    averageSessionDuration: number;
    collaborationEffectiveness: number;
    groupIntelligenceScore: number;
    knowledgeSharingRate: number;
    innovationIndex: number;
    participantEngagement: number;
    aiAssistanceEffectiveness: number;
}

class RealTimeAICollaborativeLearningSystem {
    private collaborativeSessions: Map<string, CollaborativeSession> = new Map();
    private interactions: Map<string, CollaborativeInteraction[]> = new Map();
    private patterns: Map<string, CollaborativePattern[]> = new Map();
    private groupIntelligence: Map<string, GroupIntelligence> = new Map();
    private metrics: CollaborativeMetrics;
    private isRunning: boolean = false;
    private updateInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.metrics = {
            totalSessions: 0,
            activeSessions: 0,
            totalParticipants: 0,
            averageSessionDuration: 0,
            collaborationEffectiveness: 0,
            groupIntelligenceScore: 0,
            knowledgeSharingRate: 0,
            innovationIndex: 0,
            participantEngagement: 0,
            aiAssistanceEffectiveness: 0
        };
    }

    // 시스템 초기화
    public initializeSystem(): void {
        errorLogger.info('🤝 실시간 AI 협업 학습 시스템 초기화 중', {
            component: 'realTimeAICollaborativeLearningSystem',
            action: 'initializeSystem',
        });

        // 초기 협업 세션 생성
        this.createInitialCollaborativeSessions();

        errorLogger.info('✅ 실시간 AI 협업 학습 시스템이 초기화되었습니다.', {
            component: 'realTimeAICollaborativeLearningSystem',
            action: 'initializeSystem',
        });
    }

    // 초기 협업 세션 생성
    private createInitialCollaborativeSessions(): void {
        const sessions: CollaborativeSession[] = [
            {
                id: 'session-001',
                name: 'AI 기술 브레인스토밍',
                description: '최신 AI 기술 트렌드와 응용 방안에 대한 그룹 브레인스토밍',
                session_type: 'brainstorming',
                participants: ['user-001', 'user-002', 'user-003'],
                facilitators: ['user-001'],
                status: 'active',
                created_at: new Date(Date.now() - 3600000), // 1시간 전
                started_at: new Date(Date.now() - 3000000), // 50분 전
                settings: {
                    max_participants: 10,
                    session_duration: 120,
                    collaboration_mode: 'synchronous',
                    privacy_level: 'public',
                    recording_enabled: true,
                    ai_assistance_level: 'high'
                }
            },
            {
                id: 'session-002',
                name: '프로젝트 문제 해결',
                description: '현재 진행 중인 프로젝트의 기술적 문제 해결을 위한 협업 세션',
                session_type: 'problem_solving',
                participants: ['user-002', 'user-004', 'user-005'],
                facilitators: ['user-002'],
                status: 'active',
                created_at: new Date(Date.now() - 7200000), // 2시간 전
                started_at: new Date(Date.now() - 6000000), // 1시간 40분 전
                settings: {
                    max_participants: 8,
                    session_duration: 90,
                    collaboration_mode: 'hybrid',
                    privacy_level: 'private',
                    recording_enabled: false,
                    ai_assistance_level: 'moderate'
                }
            }
        ];

        sessions.forEach(session => {
            this.collaborativeSessions.set(session.id, session);
            this.initializeSessionData(session);
        });
    }

    // 세션 데이터 초기화
    private initializeSessionData(session: CollaborativeSession): void {
        // 초기 상호작용 데이터 생성
        const interactions: CollaborativeInteraction[] = [
            {
                id: 'interaction-001',
                session_id: session.id,
                user_id: session.participants[0],
                interaction_type: 'message',
                content: '안녕하세요! 오늘 AI 기술에 대해 어떤 주제로 논의해볼까요?',
                metadata: { message_type: 'greeting' },
                timestamp: new Date(Date.now() - 3500000),
                reactions: [
                    {
                        user_id: session.participants[1],
                        reaction_type: 'like',
                        timestamp: new Date(Date.now() - 3490000)
                    }
                ],
                ai_analysis: {
                    sentiment: 'positive',
                    relevance_score: 0.9,
                    contribution_quality: 0.8,
                    collaboration_impact: 0.7,
                    suggested_responses: [
                        '머신러닝의 최신 발전 동향에 대해 이야기해보는 건 어떨까요?',
                        'AI 윤리와 책임에 대한 논의도 흥미로울 것 같습니다.'
                    ],
                    insights: ['긍정적인 분위기로 세션을 시작했습니다.']
                }
            }
        ];

        this.interactions.set(session.id, interactions);

        // 그룹 인텔리전스 초기화
        const groupIntelligence: GroupIntelligence = {
            id: `gi-${session.id}`,
            session_id: session.id,
            collective_knowledge: {
                'AI': 0.8,
                'Machine Learning': 0.7,
                'Deep Learning': 0.6,
                'Natural Language Processing': 0.5
            },
            shared_understanding: 0.75,
            group_cohesion: 0.8,
            decision_quality: 0.7,
            innovation_potential: 0.8,
            collaboration_efficiency: 0.75,
            insights: ['그룹이 AI 기술에 대한 높은 관심을 보이고 있습니다.'],
            recommendations: ['더 구체적인 AI 응용 사례를 논의해보세요.'],
            updated_at: new Date()
        };

        this.groupIntelligence.set(session.id, groupIntelligence);
    }

    // 협업 세션 생성
    public createCollaborativeSession(session: Omit<CollaborativeSession, 'id' | 'created_at'>): string {
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newSession: CollaborativeSession = {
            ...session,
            id: sessionId,
            created_at: new Date()
        };

        this.collaborativeSessions.set(sessionId, newSession);
        this.interactions.set(sessionId, []);
        this.updateMetrics();

        // 알림 생성
        realTimeAIAlertSystem.createAlert({
            type: 'info',
            severity: 'medium',
            title: '새로운 협업 세션 생성됨',
            message: `협업 세션 "${session.name}"이(가) 생성되었습니다.`,
            source: 'collaborative-learning-system',
            category: 'collaboration',
            auto_resolve: false,
            priority: 'medium',
            tags: ['collaboration', 'session-created'],
            metadata: {
                session_id: sessionId,
                session_type: session.session_type,
                participant_count: session.participants.length
            }
        });

        return sessionId;
    }

    // 상호작용 추가
    public addInteraction(sessionId: string, interaction: Omit<CollaborativeInteraction, 'id' | 'timestamp'>): string {
        const session = this.collaborativeSessions.get(sessionId);
        if (!session) {
            throw new Error(`협업 세션을 찾을 수 없습니다: ${sessionId}`);
        }

        const interactionId = `interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newInteraction: CollaborativeInteraction = {
            ...interaction,
            id: interactionId,
            timestamp: new Date()
        };

        // AI 분석 수행
        newInteraction.ai_analysis = this.analyzeInteraction(newInteraction, session);

        // 상호작용 저장
        if (!this.interactions.has(sessionId)) {
            this.interactions.set(sessionId, []);
        }
        this.interactions.get(sessionId)!.push(newInteraction);

        // 그룹 인텔리전스 업데이트
        this.updateGroupIntelligence(sessionId);

        // 협업 패턴 분석
        this.analyzeCollaborativePatterns(sessionId);

        return interactionId;
    }

    // 상호작용 AI 분석
    private analyzeInteraction(interaction: CollaborativeInteraction, session: CollaborativeSession): AIInteractionAnalysis {
        const sentiment = this.analyzeSentiment(interaction.content);
        const relevanceScore = this.calculateRelevanceScore(interaction, session);
        const contributionQuality = this.assessContributionQuality(interaction);
        const collaborationImpact = this.assessCollaborationImpact(interaction, session);

        return {
            sentiment,
            relevance_score: relevanceScore,
            contribution_quality: contributionQuality,
            collaboration_impact: collaborationImpact,
            suggested_responses: this.generateSuggestedResponses(interaction, session),
            insights: this.generateInsights(interaction, session)
        };
    }

    // 감정 분석
    private analyzeSentiment(content: string): 'positive' | 'negative' | 'neutral' {
        const positiveWords = ['좋다', '훌륭하다', '멋지다', '흥미롭다', '도움이 된다', '감사하다'];
        const negativeWords = ['나쁘다', '어렵다', '문제가 있다', '실망하다', '화나다', '힘들다'];

        const positiveCount = positiveWords.filter(word => content.includes(word)).length;
        const negativeCount = negativeWords.filter(word => content.includes(word)).length;

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }

    // 관련성 점수 계산
    private calculateRelevanceScore(interaction: CollaborativeInteraction, session: CollaborativeSession): number {
        // 실제 구현에서는 더 정교한 NLP 분석을 사용
        const sessionKeywords = this.extractSessionKeywords(session);
        const interactionKeywords = this.extractInteractionKeywords(interaction);

        const commonKeywords = sessionKeywords.filter(keyword =>
            interactionKeywords.includes(keyword)
        );

        return Math.min(1, commonKeywords.length / Math.max(sessionKeywords.length, 1));
    }

    // 기여 품질 평가
    private assessContributionQuality(interaction: CollaborativeInteraction): number {
        let quality = 0.5; // 기본 점수

        // 상호작용 타입에 따른 점수 조정
        switch (interaction.interaction_type) {
            case 'idea':
                quality += 0.3;
                break;
            case 'question':
                quality += 0.2;
                break;
            case 'feedback':
                quality += 0.25;
                break;
            case 'resource':
                quality += 0.3;
                break;
        }

        // 내용 길이에 따른 점수 조정
        if (interaction.content.length > 50) quality += 0.1;
        if (interaction.content.length > 100) quality += 0.1;

        return Math.min(1, quality);
    }

    // 협업 영향도 평가
    private assessCollaborationImpact(interaction: CollaborativeInteraction, _session: CollaborativeSession): number {
        let impact = 0.5;

        // 다른 참가자들의 반응 고려
        if (interaction.reactions.length > 0) {
            const positiveReactions = interaction.reactions.filter(r =>
                ['like', 'agree', 'helpful', 'excited'].includes(r.reaction_type)
            ).length;
            impact += (positiveReactions / interaction.reactions.length) * 0.3;
        }

        // 상호작용 타입에 따른 영향도
        if (interaction.interaction_type === 'idea') impact += 0.2;
        if (interaction.interaction_type === 'question') impact += 0.15;

        return Math.min(1, impact);
    }

    // 제안 응답 생성
    private generateSuggestedResponses(interaction: CollaborativeInteraction, _session: CollaborativeSession): string[] {
        const responses: string[] = [];

        switch (interaction.interaction_type) {
            case 'question':
                responses.push('좋은 질문입니다. 이에 대해 더 자세히 설명해드릴까요?');
                responses.push('이 질문에 대한 다양한 관점을 들어보는 것이 도움이 될 것 같습니다.');
                break;
            case 'idea':
                responses.push('흥미로운 아이디어네요! 이 아이디어를 발전시켜볼까요?');
                responses.push('이 아이디어의 실현 가능성에 대해 논의해보는 건 어떨까요?');
                break;
            case 'feedback':
                responses.push('건설적인 피드백 감사합니다. 이를 바탕으로 개선해보겠습니다.');
                responses.push('이 피드백을 어떻게 적용할 수 있을지 함께 생각해보세요.');
                break;
        }

        return responses;
    }

    // 인사이트 생성
    private generateInsights(interaction: CollaborativeInteraction, _session: CollaborativeSession): string[] {
        const insights: string[] = [];

        if (interaction.ai_analysis?.sentiment === 'positive') {
            insights.push('긍정적인 상호작용이 그룹 분위기를 향상시키고 있습니다.');
        }

        if (interaction.ai_analysis?.contribution_quality && interaction.ai_analysis.contribution_quality > 0.8) {
            insights.push('높은 품질의 기여가 세션의 가치를 높이고 있습니다.');
        }

        if (interaction.reactions.length > 2) {
            insights.push('다른 참가자들의 활발한 참여가 협업을 촉진하고 있습니다.');
        }

        return insights;
    }

    // 세션 키워드 추출
    private extractSessionKeywords(session: CollaborativeSession): string[] {
        const keywords: string[] = [];

        // 세션 이름과 설명에서 키워드 추출
        const text = `${session.name} ${session.description}`.toLowerCase();

        // 간단한 키워드 추출 (실제로는 NLP 라이브러리 사용)
        const commonKeywords = ['ai', '기술', '문제', '해결', '협업', '학습', '프로젝트', '개발'];
        commonKeywords.forEach(keyword => {
            if (text.includes(keyword)) {
                keywords.push(keyword);
            }
        });

        return keywords;
    }

    // 상호작용 키워드 추출
    private extractInteractionKeywords(interaction: CollaborativeInteraction): string[] {
        const keywords: string[] = [];
        const text = interaction.content.toLowerCase();

        const commonKeywords = ['ai', '기술', '문제', '해결', '협업', '학습', '프로젝트', '개발'];
        commonKeywords.forEach(keyword => {
            if (text.includes(keyword)) {
                keywords.push(keyword);
            }
        });

        return keywords;
    }

    // 그룹 인텔리전스 업데이트
    private updateGroupIntelligence(sessionId: string): void {
        const session = this.collaborativeSessions.get(sessionId);
        const interactions = this.interactions.get(sessionId) || [];

        if (!session) return;

        const currentGI = this.groupIntelligence.get(sessionId);
        if (!currentGI) return;

        // 집단 지식 업데이트
        const collectiveKnowledge = this.calculateCollectiveKnowledge(interactions);

        // 공유 이해도 계산
        const sharedUnderstanding = this.calculateSharedUnderstanding(interactions, session);

        // 그룹 응집력 계산
        const groupCohesion = this.calculateGroupCohesion(interactions, session);

        // 의사결정 품질 계산
        const decisionQuality = this.calculateDecisionQuality(interactions);

        // 혁신 잠재력 계산
        const innovationPotential = this.calculateInnovationPotential(interactions);

        // 협업 효율성 계산
        const collaborationEfficiency = this.calculateCollaborationEfficiency(interactions, session);

        // 새로운 인사이트와 추천사항 생성
        const insights = this.generateGroupInsights(interactions, session);
        const recommendations = this.generateGroupRecommendations(interactions, session);

        const updatedGI: GroupIntelligence = {
            ...currentGI,
            collective_knowledge: collectiveKnowledge,
            shared_understanding: sharedUnderstanding,
            group_cohesion: groupCohesion,
            decision_quality: decisionQuality,
            innovation_potential: innovationPotential,
            collaboration_efficiency: collaborationEfficiency,
            insights,
            recommendations,
            updated_at: new Date()
        };

        this.groupIntelligence.set(sessionId, updatedGI);
    }

    // 집단 지식 계산
    private calculateCollectiveKnowledge(interactions: CollaborativeInteraction[]): Record<string, number> {
        const knowledge: Record<string, number> = {};

        // 상호작용에서 주제별 지식 수준 추정
        interactions.forEach(interaction => {
            const topics = this.extractInteractionKeywords(interaction);
            topics.forEach(topic => {
                const quality = interaction.ai_analysis?.contribution_quality || 0.5;
                knowledge[topic] = (knowledge[topic] || 0) + quality;
            });
        });

        // 정규화
        Object.keys(knowledge).forEach(topic => {
            knowledge[topic] = Math.min(1, knowledge[topic] / interactions.length);
        });

        return knowledge;
    }

    // 공유 이해도 계산
    private calculateSharedUnderstanding(interactions: CollaborativeInteraction[], session: CollaborativeSession): number {
        if (interactions.length === 0) return 0;

        // 참가자별 기여도 계산
        const participantContributions = new Map<string, number>();
        session.participants.forEach(participant => {
            participantContributions.set(participant, 0);
        });

        interactions.forEach(interaction => {
            const current = participantContributions.get(interaction.user_id) || 0;
            participantContributions.set(interaction.user_id, current + 1);
        });

        // 기여도 분산 계산
        const contributions = Array.from(participantContributions.values());
        const mean = contributions.reduce((sum, val) => sum + val, 0) / contributions.length;
        const variance = contributions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / contributions.length;

        // 분산이 작을수록 공유 이해도가 높음
        return Math.max(0, 1 - variance / Math.max(mean, 1));
    }

    // 그룹 응집력 계산
    private calculateGroupCohesion(interactions: CollaborativeInteraction[], _session: CollaborativeSession): number {
        if (interactions.length === 0) return 0;

        let positiveInteractions = 0;
        let totalInteractions = 0;

        interactions.forEach(interaction => {
            totalInteractions++;
            if (interaction.ai_analysis?.sentiment === 'positive') {
                positiveInteractions++;
            }
        });

        return positiveInteractions / totalInteractions;
    }

    // 의사결정 품질 계산
    private calculateDecisionQuality(interactions: CollaborativeInteraction[]): number {
        const decisionInteractions = interactions.filter(i =>
            i.interaction_type === 'idea' || i.interaction_type === 'feedback'
        );

        if (decisionInteractions.length === 0) return 0;

        const averageQuality = decisionInteractions.reduce((sum, interaction) =>
            sum + (interaction.ai_analysis?.contribution_quality || 0), 0
        ) / decisionInteractions.length;

        return averageQuality;
    }

    // 혁신 잠재력 계산
    private calculateInnovationPotential(interactions: CollaborativeInteraction[]): number {
        const ideaInteractions = interactions.filter(i => i.interaction_type === 'idea');

        if (ideaInteractions.length === 0) return 0;

        const averageQuality = ideaInteractions.reduce((sum, interaction) =>
            sum + (interaction.ai_analysis?.contribution_quality || 0), 0
        ) / ideaInteractions.length;

        const diversity = this.calculateIdeaDiversity(ideaInteractions);

        return (averageQuality + diversity) / 2;
    }

    // 아이디어 다양성 계산
    private calculateIdeaDiversity(ideaInteractions: CollaborativeInteraction[]): number {
        const uniqueUsers = new Set(ideaInteractions.map(i => i.user_id));
        return uniqueUsers.size / Math.max(ideaInteractions.length, 1);
    }

    // 협업 효율성 계산
    private calculateCollaborationEfficiency(interactions: CollaborativeInteraction[], _session: CollaborativeSession): number {
        if (interactions.length === 0) return 0;

        const averageImpact = interactions.reduce((sum, interaction) =>
            sum + (interaction.ai_analysis?.collaboration_impact || 0), 0
        ) / interactions.length;

        const responseRate = this.calculateResponseRate(interactions);

        return (averageImpact + responseRate) / 2;
    }

    // 응답률 계산
    private calculateResponseRate(interactions: CollaborativeInteraction[]): number {
        const questions = interactions.filter(i => i.interaction_type === 'question');
        if (questions.length === 0) return 1;

        const answeredQuestions = questions.filter(q =>
            interactions.some(i => i.response_to === q.id)
        );

        return answeredQuestions.length / questions.length;
    }

    // 그룹 인사이트 생성
    private generateGroupInsights(interactions: CollaborativeInteraction[], _session: CollaborativeSession): string[] {
        const insights: string[] = [];

        const positiveInteractions = interactions.filter(i =>
            i.ai_analysis?.sentiment === 'positive'
        );

        if (positiveInteractions.length > interactions.length * 0.7) {
            insights.push('그룹이 매우 긍정적인 분위기로 협업하고 있습니다.');
        }

        const highQualityContributions = interactions.filter(i =>
            (i.ai_analysis?.contribution_quality || 0) > 0.8
        );

        if (highQualityContributions.length > 0) {
            insights.push('높은 품질의 기여가 지속적으로 이루어지고 있습니다.');
        }

        return insights;
    }

    // 그룹 추천사항 생성
    private generateGroupRecommendations(interactions: CollaborativeInteraction[], _session: CollaborativeSession): string[] {
        const recommendations: string[] = [];

        const questionCount = interactions.filter(i => i.interaction_type === 'question').length;
        if (questionCount < 3) {
            recommendations.push('더 많은 질문을 통해 깊이 있는 논의를 이끌어보세요.');
        }

        const ideaCount = interactions.filter(i => i.interaction_type === 'idea').length;
        if (ideaCount < 2) {
            recommendations.push('창의적인 아이디어 공유를 더 활발히 해보세요.');
        }

        return recommendations;
    }

    // 협업 패턴 분석
    private analyzeCollaborativePatterns(sessionId: string): void {
        const interactions = this.interactions.get(sessionId) || [];
        const session = this.collaborativeSessions.get(sessionId);

        if (!session || interactions.length === 0) return;

        const patterns: CollaborativePattern[] = [];

        // 의사소통 패턴 분석
        const communicationPattern = this.analyzeCommunicationPattern(interactions, session);
        if (communicationPattern) patterns.push(communicationPattern);

        // 아이디어 생성 패턴 분석
        const ideaGenerationPattern = this.analyzeIdeaGenerationPattern(interactions, session);
        if (ideaGenerationPattern) patterns.push(ideaGenerationPattern);

        // 의사결정 패턴 분석
        const decisionMakingPattern = this.analyzeDecisionMakingPattern(interactions, session);
        if (decisionMakingPattern) patterns.push(decisionMakingPattern);

        this.patterns.set(sessionId, patterns);
    }

    // 의사소통 패턴 분석
    private analyzeCommunicationPattern(interactions: CollaborativeInteraction[], session: CollaborativeSession): CollaborativePattern | null {
        const messageInteractions = interactions.filter(i => i.interaction_type === 'message');

        if (messageInteractions.length < 3) return null;

        const participants = new Set(messageInteractions.map(i => i.user_id));
        const frequency = messageInteractions.length;
        const effectiveness = this.calculateCommunicationEffectiveness(messageInteractions);

        return {
            id: `pattern-comm-${Date.now()}`,
            session_id: session.id,
            pattern_type: 'communication',
            participants: Array.from(participants),
            frequency,
            effectiveness,
            description: '그룹 내 활발한 의사소통이 이루어지고 있습니다.',
            examples: messageInteractions.map(i => i.content),
            recommendations: ['의사소통의 질을 더욱 향상시키기 위해 구체적인 피드백을 제공해보세요.'],
            created_at: new Date()
        };
    }

    // 의사소통 효과성 계산
    private calculateCommunicationEffectiveness(messageInteractions: CollaborativeInteraction[]): number {
        const positiveMessages = messageInteractions.filter(i =>
            i.ai_analysis?.sentiment === 'positive'
        ).length;

        return positiveMessages / messageInteractions.length;
    }

    // 아이디어 생성 패턴 분석
    private analyzeIdeaGenerationPattern(interactions: CollaborativeInteraction[], session: CollaborativeSession): CollaborativePattern | null {
        const ideaInteractions = interactions.filter(i => i.interaction_type === 'idea');

        if (ideaInteractions.length < 2) return null;

        const participants = new Set(ideaInteractions.map(i => i.user_id));
        const frequency = ideaInteractions.length;
        const effectiveness = this.calculateIdeaGenerationEffectiveness(ideaInteractions);

        return {
            id: `pattern-idea-${Date.now()}`,
            session_id: session.id,
            pattern_type: 'idea_generation',
            participants: Array.from(participants),
            frequency,
            effectiveness,
            description: '다양한 참가자로부터 창의적인 아이디어가 생성되고 있습니다.',
            examples: ideaInteractions.map(i => i.content),
            recommendations: ['아이디어를 더욱 발전시키기 위해 구체적인 실행 방안을 논의해보세요.'],
            created_at: new Date()
        };
    }

    // 아이디어 생성 효과성 계산
    private calculateIdeaGenerationEffectiveness(ideaInteractions: CollaborativeInteraction[]): number {
        const highQualityIdeas = ideaInteractions.filter(i =>
            (i.ai_analysis?.contribution_quality || 0) > 0.7
        ).length;

        return highQualityIdeas / ideaInteractions.length;
    }

    // 의사결정 패턴 분석
    private analyzeDecisionMakingPattern(interactions: CollaborativeInteraction[], session: CollaborativeSession): CollaborativePattern | null {
        const decisionInteractions = interactions.filter(i =>
            i.interaction_type === 'idea' || i.interaction_type === 'feedback'
        );

        if (decisionInteractions.length < 2) return null;

        const participants = new Set(decisionInteractions.map(i => i.user_id));
        const frequency = decisionInteractions.length;
        const effectiveness = this.calculateDecisionMakingEffectiveness(decisionInteractions);

        return {
            id: `pattern-decision-${Date.now()}`,
            session_id: session.id,
            pattern_type: 'decision_making',
            participants: Array.from(participants),
            frequency,
            effectiveness,
            description: '그룹 의사결정이 체계적으로 이루어지고 있습니다.',
            examples: decisionInteractions.map(i => i.content),
            recommendations: ['의사결정의 효율성을 높이기 위해 명확한 기준을 설정해보세요.'],
            created_at: new Date()
        };
    }

    // 의사결정 효과성 계산
    private calculateDecisionMakingEffectiveness(decisionInteractions: CollaborativeInteraction[]): number {
        const highImpactDecisions = decisionInteractions.filter(i =>
            (i.ai_analysis?.collaboration_impact || 0) > 0.7
        ).length;

        return highImpactDecisions / decisionInteractions.length;
    }

    // 메트릭 업데이트
    private updateMetrics(): void {
        const sessions = Array.from(this.collaborativeSessions.values());
        const allInteractions = Array.from(this.interactions.values()).flat();

        this.metrics = {
            totalSessions: sessions.length,
            activeSessions: sessions.filter(s => s.status === 'active').length,
            totalParticipants: new Set(sessions.flatMap(s => s.participants)).size,
            averageSessionDuration: this.calculateAverageSessionDuration(sessions),
            collaborationEffectiveness: this.calculateCollaborationEffectiveness(allInteractions),
            groupIntelligenceScore: this.calculateGroupIntelligenceScore(),
            knowledgeSharingRate: this.calculateKnowledgeSharingRate(allInteractions),
            innovationIndex: this.calculateInnovationIndex(allInteractions),
            participantEngagement: this.calculateParticipantEngagement(sessions, allInteractions),
            aiAssistanceEffectiveness: this.calculateAIAssistanceEffectiveness(allInteractions)
        };
    }

    // 평균 세션 지속시간 계산
    private calculateAverageSessionDuration(sessions: CollaborativeSession[]): number {
        const completedSessions = sessions.filter(s => s.completed_at && s.started_at);
        if (completedSessions.length === 0) return 0;

        const totalDuration = completedSessions.reduce((sum, session) => {
            const duration = session.completed_at!.getTime() - session.started_at!.getTime();
            return sum + duration;
        }, 0);

        return totalDuration / completedSessions.length / 60000; // 분 단위
    }

    // 협업 효과성 계산
    private calculateCollaborationEffectiveness(interactions: CollaborativeInteraction[]): number {
        if (interactions.length === 0) return 0;

        const averageImpact = interactions.reduce((sum, interaction) =>
            sum + (interaction.ai_analysis?.collaboration_impact || 0), 0
        ) / interactions.length;

        return averageImpact;
    }

    // 그룹 인텔리전스 점수 계산
    private calculateGroupIntelligenceScore(): number {
        const groupIntelligences = Array.from(this.groupIntelligence.values());
        if (groupIntelligences.length === 0) return 0;

        const averageScore = groupIntelligences.reduce((sum, gi) =>
            sum + (gi.shared_understanding + gi.group_cohesion + gi.decision_quality + gi.innovation_potential + gi.collaboration_efficiency) / 5, 0
        ) / groupIntelligences.length;

        return averageScore;
    }

    // 지식 공유율 계산
    private calculateKnowledgeSharingRate(interactions: CollaborativeInteraction[]): number {
        const knowledgeInteractions = interactions.filter(i =>
            i.interaction_type === 'resource' || i.interaction_type === 'idea'
        );

        return knowledgeInteractions.length / Math.max(interactions.length, 1);
    }

    // 혁신 지수 계산
    private calculateInnovationIndex(interactions: CollaborativeInteraction[]): number {
        const ideaInteractions = interactions.filter(i => i.interaction_type === 'idea');
        if (ideaInteractions.length === 0) return 0;

        const averageQuality = ideaInteractions.reduce((sum, interaction) =>
            sum + (interaction.ai_analysis?.contribution_quality || 0), 0
        ) / ideaInteractions.length;

        return averageQuality;
    }

    // 참가자 참여도 계산
    private calculateParticipantEngagement(sessions: CollaborativeSession[], interactions: CollaborativeInteraction[]): number {
        if (sessions.length === 0) return 0;

        const totalParticipants = new Set(sessions.flatMap(s => s.participants)).size;
        const activeParticipants = new Set(interactions.map(i => i.user_id)).size;

        return activeParticipants / totalParticipants;
    }

    // AI 지원 효과성 계산
    private calculateAIAssistanceEffectiveness(interactions: CollaborativeInteraction[]): number {
        const interactionsWithAI = interactions.filter(i => i.ai_analysis);
        if (interactionsWithAI.length === 0) return 0;

        const averageQuality = interactionsWithAI.reduce((sum, interaction) =>
            sum + (interaction.ai_analysis?.contribution_quality || 0), 0
        ) / interactionsWithAI.length;

        return averageQuality;
    }

    // 시스템 시작
    public start(): void {
        if (this.isRunning) {
            errorLogger.info('⚠️ 실시간 AI 협업 학습 시스템이 이미 실행 중입니다.', {
                component: 'realTimeAICollaborativeLearningSystem',
                action: 'start',
            });
            return;
        }

        this.isRunning = true;
        this.initializeSystem();

        // 주기적 업데이트
        this.updateInterval = setInterval(() => {
            this.updateMetrics();
            this.cleanupOldData();
        }, 30000); // 30초마다 업데이트

        errorLogger.info('🚀 실시간 AI 협업 학습 시스템이 시작되었습니다.', {
            component: 'realTimeAICollaborativeLearningSystem',
            action: 'start',
        });
    }

    // 시스템 중지
    public stop(): void {
        if (!this.isRunning) {
            errorLogger.info('⚠️ 실시간 AI 협업 학습 시스템이 실행 중이 아닙니다.', {
                component: 'realTimeAICollaborativeLearningSystem',
                action: 'stop',
            });
            return;
        }

        this.isRunning = false;

        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

        errorLogger.info('🛑 실시간 AI 협업 학습 시스템이 중지되었습니다.', {
            component: 'realTimeAICollaborativeLearningSystem',
            action: 'stop',
        });
    }

    // 오래된 데이터 정리
    private cleanupOldData(): void {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30); // 30일 이전 데이터

        // 오래된 상호작용 정리
        this.interactions.forEach((interactions, sessionId) => {
            this.interactions.set(sessionId, interactions.filter(interaction =>
                interaction.timestamp >= cutoffDate
            ));
        });

        // 오래된 패턴 정리
        this.patterns.forEach((patterns, sessionId) => {
            this.patterns.set(sessionId, patterns.filter(pattern =>
                pattern.created_at >= cutoffDate
            ));
        });
    }

    // 공개 메서드들
    public getMetrics(): CollaborativeMetrics {
        return { ...this.metrics };
    }

    public getSystemHealth(): { status: string; details: Record<string, unknown> } {
        return {
            status: this.isRunning ? 'healthy' : 'stopped',
            details: {
                active_sessions: this.metrics.activeSessions,
                total_participants: this.metrics.totalParticipants,
                collaboration_effectiveness: this.metrics.collaborationEffectiveness,
                group_intelligence_score: this.metrics.groupIntelligenceScore,
                last_update: new Date()
            }
        };
    }

    public getCollaborativeSessions(): CollaborativeSession[] {
        return Array.from(this.collaborativeSessions.values());
    }

    public getCollaborativeSession(sessionId: string): CollaborativeSession | undefined {
        return this.collaborativeSessions.get(sessionId);
    }

    public getInteractions(sessionId: string): CollaborativeInteraction[] {
        return this.interactions.get(sessionId) || [];
    }

    public getPatterns(sessionId: string): CollaborativePattern[] {
        return this.patterns.get(sessionId) || [];
    }

    public getGroupIntelligence(sessionId: string): GroupIntelligence | undefined {
        return this.groupIntelligence.get(sessionId);
    }
}

const realTimeAICollaborativeLearningSystem = new RealTimeAICollaborativeLearningSystem();
export default realTimeAICollaborativeLearningSystem;
