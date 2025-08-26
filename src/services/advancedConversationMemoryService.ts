import { QuestionUnderstandingResult } from './advancedQuestionUnderstandingEngine';

export interface ConversationMemory {
    user_id: string;
    session_id: string;
    conversation_history: ConversationEntry[];
    user_profile: UserProfile;
    learning_patterns: LearningPattern[];
    preferences: UserPreferences;
    knowledge_graph: KnowledgeGraph;
    interaction_stats: InteractionStats;
    last_updated: Date;
}

export interface ConversationEntry {
    id: string;
    timestamp: Date;
    user_input: string;
    ai_response: string;
    understanding_result?: QuestionUnderstandingResult;
    user_feedback?: UserFeedback;
    context: ConversationContext;
    metadata: EntryMetadata;
}

export interface UserProfile {
    expertise_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    primary_domains: string[];
    learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    communication_preference: 'formal' | 'casual' | 'technical' | 'educational';
    response_length_preference: 'concise' | 'moderate' | 'detailed';
    example_preference: 'code' | 'real_world' | 'analogy' | 'none';
    update_frequency: Date;
}

export interface LearningPattern {
    pattern_type: 'concept_repetition' | 'topic_progression' | 'difficulty_scaling' | 'interruption_recovery';
    frequency: number;
    effectiveness_score: number;
    last_observed: Date;
    examples: string[];
}

export interface UserPreferences {
    language: string;
    timezone: string;
    notification_settings: NotificationSettings;
    ui_preferences: UIPreferences;
    content_preferences: ContentPreferences;
}

export interface NotificationSettings {
    email_notifications: boolean;
    push_notifications: boolean;
    reminder_frequency: 'never' | 'daily' | 'weekly' | 'monthly';
    topics_of_interest: string[];
}

export interface UIPreferences {
    theme: 'light' | 'dark' | 'auto';
    font_size: 'small' | 'medium' | 'large';
    animation_enabled: boolean;
    compact_mode: boolean;
}

export interface ContentPreferences {
    preferred_detail_level: 'basic' | 'intermediate' | 'advanced';
    code_examples: boolean;
    visual_aids: boolean;
    external_links: boolean;
    follow_up_questions: boolean;
}

export interface KnowledgeGraph {
    nodes: KnowledgeNode[];
    edges: KnowledgeEdge[];
    last_updated: Date;
}

export interface KnowledgeNode {
    id: string;
    concept: string;
    confidence: number;
    last_accessed: Date;
    access_count: number;
    related_concepts: string[];
}

export interface KnowledgeEdge {
    source: string;
    target: string;
    relationship_type: 'prerequisite' | 'related' | 'contradicts' | 'enhances';
    strength: number;
    last_updated: Date;
}

export interface InteractionStats {
    total_conversations: number;
    total_messages: number;
    average_session_length: number;
    most_active_hours: number[];
    preferred_topics: TopicPreference[];
    response_time_preferences: ResponseTimePreference[];
    satisfaction_scores: SatisfactionScore[];
}

export interface TopicPreference {
    topic: string;
    frequency: number;
    last_interaction: Date;
    satisfaction_score: number;
}

export interface ResponseTimePreference {
    time_range: string;
    frequency: number;
    average_response_time: number;
}

export interface SatisfactionScore {
    date: Date;
    score: number;
    factors: string[];
}

export interface ConversationContext {
    current_topic: string;
    conversation_depth: number;
    user_engagement_level: 'low' | 'medium' | 'high';
    interruption_count: number;
    clarification_requests: number;
}

export interface UserFeedback {
    rating: number; // 1-5
    helpful: boolean;
    clear: boolean;
    complete: boolean;
    suggestions: string[];
    emotional_response: 'positive' | 'neutral' | 'negative';
}

export interface EntryMetadata {
    processing_time: number;
    model_used: string;
    confidence_score: number;
    flags: string[];
}

class AdvancedConversationMemoryService {
    private memoryStore: Map<string, ConversationMemory> = new Map();
    private globalStats: GlobalStats = {
        total_users: 0,
        total_conversations: 0,
        average_satisfaction: 0,
        popular_topics: [],
        system_performance: {
            average_response_time: 0,
            memory_usage: 0,
            error_rate: 0
        }
    };

    constructor() {
        this.initializeService();
    }

    // 메모리 초기화
    private initializeService(): void {
        console.log('Advanced Conversation Memory Service initialized');
        this.loadPersistedMemory();
        this.startMemoryOptimization();
    }

    // 사용자 메모리 생성 또는 가져오기
    async getUserMemory(userId: string, sessionId?: string): Promise<ConversationMemory> {
        const memoryKey = `${userId}-${sessionId || 'default'}`;

        if (!this.memoryStore.has(memoryKey)) {
            const newMemory = await this.createNewMemory(userId, sessionId);
            this.memoryStore.set(memoryKey, newMemory);
            this.globalStats.total_users++;
        }

        return this.memoryStore.get(memoryKey)!;
    }

    // 새 메모리 생성
    private async createNewMemory(userId: string, sessionId?: string): Promise<ConversationMemory> {
        const session = sessionId || `session-${Date.now()}`;

        return {
            user_id: userId,
            session_id: session,
            conversation_history: [],
            user_profile: await this.initializeUserProfile(userId),
            learning_patterns: [],
            preferences: this.getDefaultPreferences(),
            knowledge_graph: { nodes: [], edges: [], last_updated: new Date() },
            interaction_stats: this.initializeInteractionStats(),
            last_updated: new Date()
        };
    }

    // 사용자 프로필 초기화
    private async initializeUserProfile(userId: string): Promise<UserProfile> {
        // 실제 구현에서는 사용자 데이터베이스에서 정보를 가져올 수 있음
        return {
            expertise_level: 'intermediate',
            primary_domains: ['general'],
            learning_style: 'visual',
            communication_preference: 'casual',
            response_length_preference: 'moderate',
            example_preference: 'code',
            update_frequency: new Date()
        };
    }

    // 기본 선호도 설정
    private getDefaultPreferences(): UserPreferences {
        return {
            language: 'ko',
            timezone: 'Asia/Seoul',
            notification_settings: {
                email_notifications: false,
                push_notifications: true,
                reminder_frequency: 'weekly',
                topics_of_interest: []
            },
            ui_preferences: {
                theme: 'auto',
                font_size: 'medium',
                animation_enabled: true,
                compact_mode: false
            },
            content_preferences: {
                preferred_detail_level: 'intermediate',
                code_examples: true,
                visual_aids: true,
                external_links: true,
                follow_up_questions: true
            }
        };
    }

    // 상호작용 통계 초기화
    private initializeInteractionStats(): InteractionStats {
        return {
            total_conversations: 0,
            total_messages: 0,
            average_session_length: 0,
            most_active_hours: [],
            preferred_topics: [],
            response_time_preferences: [],
            satisfaction_scores: []
        };
    }

    // 대화 항목 추가
    async addConversationEntry(
        userId: string,
        sessionId: string,
        userInput: string,
        aiResponse: string,
        understandingResult?: QuestionUnderstandingResult,
        userFeedback?: UserFeedback
    ): Promise<void> {
        const memory = await this.getUserMemory(userId, sessionId);
        const entry: ConversationEntry = {
            id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            user_input: userInput,
            ai_response: aiResponse,
            understanding_result: understandingResult,
            user_feedback: userFeedback,
            context: this.analyzeConversationContext(memory, userInput),
            metadata: {
                processing_time: understandingResult?.processing_time || 0,
                model_used: 'advanced-ai-model',
                confidence_score: understandingResult?.confidence_score || 0.5,
                flags: this.generateEntryFlags(userInput, aiResponse, understandingResult)
            }
        };

        memory.conversation_history.push(entry);
        memory.last_updated = new Date();

        // 메모리 업데이트
        await this.updateMemory(memory, entry);

        // 통계 업데이트
        this.updateGlobalStats(entry);
    }

    // 대화 컨텍스트 분석
    private analyzeConversationContext(memory: ConversationMemory, userInput: string): ConversationContext {
        const history = memory.conversation_history;
        const currentTopic = this.extractCurrentTopic(userInput, history);
        const conversationDepth = this.calculateConversationDepth(history);
        const engagementLevel = this.assessEngagementLevel(userInput, history);
        const interruptionCount = this.countInterruptions(history);
        const clarificationRequests = this.countClarificationRequests(history);

        return {
            current_topic: currentTopic,
            conversation_depth: conversationDepth,
            user_engagement_level: engagementLevel,
            interruption_count: interruptionCount,
            clarification_requests: clarificationRequests
        };
    }

    // 현재 주제 추출
    private extractCurrentTopic(userInput: string, history: ConversationEntry[]): string {
        // 키워드 기반 주제 추출
        const topicKeywords = {
            'programming': ['code', 'program', 'develop', 'software', 'algorithm'],
            'web_development': ['web', 'frontend', 'backend', 'html', 'css', 'javascript'],
            'database': ['database', 'sql', 'query', 'data', 'storage'],
            'ai_ml': ['ai', 'machine learning', 'neural', 'model', 'algorithm'],
            'devops': ['deploy', 'server', 'infrastructure', 'ci/cd', 'docker'],
            'security': ['security', 'authentication', 'encryption', 'vulnerability'],
            'performance': ['performance', 'optimization', 'speed', 'efficiency']
        };

        const inputLower = userInput.toLowerCase();
        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(keyword => inputLower.includes(keyword))) {
                return topic;
            }
        }

        // 히스토리 기반 주제 추출
        if (history.length > 0) {
            const recentEntries = history.slice(-3);
            const recentTopics = recentEntries
                .map(entry => entry.context.current_topic)
                .filter(topic => topic !== 'general');

            if (recentTopics.length > 0) {
                return recentTopics[recentTopics.length - 1];
            }
        }

        return 'general';
    }

    // 대화 깊이 계산
    private calculateConversationDepth(history: ConversationEntry[]): number {
        if (history.length === 0) return 0;

        const recentEntries = history.slice(-5);
        let depth = 0;

        for (let i = 1; i < recentEntries.length; i++) {
            const prev = recentEntries[i - 1];
            const curr = recentEntries[i];

            // 같은 주제에서 계속되는 대화
            if (prev.context.current_topic === curr.context.current_topic) {
                depth++;
            }
            // 주제가 바뀌면 깊이 리셋
            else {
                depth = 0;
            }
        }

        return Math.min(depth, 10); // 최대 10으로 제한
    }

    // 참여도 평가
    private assessEngagementLevel(userInput: string, history: ConversationEntry[]): 'low' | 'medium' | 'high' {
        const inputLength = userInput.length;
        const hasQuestions = userInput.includes('?') || userInput.includes('어떻게') || userInput.includes('왜');
        const hasTechnicalTerms = /(function|class|api|database|algorithm|optimize)/i.test(userInput);

        let score = 0;
        if (inputLength > 50) score += 2;
        if (hasQuestions) score += 2;
        if (hasTechnicalTerms) score += 1;

        // 최근 대화 히스토리 분석
        const recentEntries = history.slice(-3);
        const recentEngagement = recentEntries.reduce((sum, entry) => {
            if (entry.user_input.length > 30) sum += 1;
            if (entry.user_feedback?.rating && entry.user_feedback.rating >= 4) sum += 1;
            return sum;
        }, 0);

        score += recentEngagement;

        if (score >= 5) return 'high';
        if (score >= 2) return 'medium';
        return 'low';
    }

    // 중단 횟수 계산
    private countInterruptions(history: ConversationEntry[]): number {
        return history.filter(entry =>
            entry.metadata.flags.includes('interruption') ||
            entry.user_input.includes('잠깐') ||
            entry.user_input.includes('stop') ||
            entry.user_input.includes('중단')
        ).length;
    }

    // 명확화 요청 횟수 계산
    private countClarificationRequests(history: ConversationEntry[]): number {
        return history.filter(entry =>
            entry.metadata.flags.includes('clarification_request') ||
            entry.user_input.includes('무슨 뜻') ||
            entry.user_input.includes('잘 모르겠') ||
            entry.user_input.includes('다시 설명')
        ).length;
    }

    // 항목 플래그 생성
    private generateEntryFlags(userInput: string, aiResponse: string, understandingResult?: QuestionUnderstandingResult): string[] {
        const flags: string[] = [];

        // 사용자 입력 분석
        if (userInput.length < 10) flags.push('short_input');
        if (userInput.includes('?')) flags.push('question');
        if (userInput.includes('감사') || userInput.includes('thank')) flags.push('gratitude');
        if (userInput.includes('잘 모르겠') || userInput.includes('confused')) flags.push('confusion');
        if (userInput.includes('다시') || userInput.includes('repeat')) flags.push('repetition_request');

        // AI 응답 분석
        if (aiResponse.length > 500) flags.push('long_response');
        if (aiResponse.includes('코드') || aiResponse.includes('code')) flags.push('code_included');
        if (aiResponse.includes('예시') || aiResponse.includes('example')) flags.push('example_included');

        // 이해 결과 분석
        if (understandingResult) {
            if (understandingResult.semantic_analysis.ambiguity_detection.confidence_impact > 0.3) {
                flags.push('ambiguous_question');
            }
            if (understandingResult.semantic_analysis.complexity_assessment.overall_complexity > 7) {
                flags.push('complex_question');
            }
            if (understandingResult.intent_clarification.clarification_needed) {
                flags.push('clarification_needed');
            }
        }

        return flags;
    }

    // 메모리 업데이트
    private async updateMemory(memory: ConversationMemory, newEntry: ConversationEntry): Promise<void> {
        // 사용자 프로필 업데이트
        await this.updateUserProfile(memory, newEntry);

        // 학습 패턴 업데이트
        await this.updateLearningPatterns(memory, newEntry);

        // 지식 그래프 업데이트
        await this.updateKnowledgeGraph(memory, newEntry);

        // 상호작용 통계 업데이트
        this.updateInteractionStats(memory, newEntry);

        // 메모리 최적화
        this.optimizeMemory(memory);
    }

    // 사용자 프로필 업데이트
    private async updateUserProfile(memory: ConversationMemory, entry: ConversationEntry): Promise<void> {
        const profile = memory.user_profile;
        const understanding = entry.understanding_result;

        if (understanding) {
            // 전문성 수준 업데이트
            const complexity = understanding.semantic_analysis.complexity_assessment.overall_complexity;
            if (complexity > 8 && profile.expertise_level === 'intermediate') {
                profile.expertise_level = 'advanced';
            } else if (complexity < 3 && profile.expertise_level === 'advanced') {
                profile.expertise_level = 'intermediate';
            }

            // 주요 도메인 업데이트
            const domain = understanding.semantic_analysis.domain_classification.primary_domain;
            if (domain !== 'general' && !profile.primary_domains.includes(domain)) {
                profile.primary_domains.push(domain);
                if (profile.primary_domains.length > 5) {
                    profile.primary_domains = profile.primary_domains.slice(-5);
                }
            }

            // 학습 스타일 추론
            if (entry.ai_response.includes('그림') || entry.ai_response.includes('diagram')) {
                profile.learning_style = 'visual';
            } else if (entry.ai_response.includes('예시') || entry.ai_response.includes('example')) {
                profile.learning_style = 'kinesthetic';
            }

            // 응답 길이 선호도 업데이트
            const responseLength = entry.ai_response.length;
            if (responseLength < 100) {
                profile.response_length_preference = 'concise';
            } else if (responseLength > 500) {
                profile.response_length_preference = 'detailed';
            }

            profile.update_frequency = new Date();
        }
    }

    // 학습 패턴 업데이트
    private async updateLearningPatterns(memory: ConversationMemory, entry: ConversationEntry): Promise<void> {
        const patterns = memory.learning_patterns;
        const understanding = entry.understanding_result;

        if (understanding) {
            // 개념 반복 패턴
            const repeatedConcepts = this.findRepeatedConcepts(memory, understanding);
            if (repeatedConcepts.length > 0) {
                this.updatePattern(patterns, 'concept_repetition', repeatedConcepts);
            }

            // 주제 진행 패턴
            const topicProgression = this.analyzeTopicProgression(memory, understanding);
            if (topicProgression) {
                this.updatePattern(patterns, 'topic_progression', [topicProgression]);
            }

            // 난이도 스케일링 패턴
            const difficultyScaling = this.analyzeDifficultyScaling(memory, understanding);
            if (difficultyScaling) {
                this.updatePattern(patterns, 'difficulty_scaling', [difficultyScaling]);
            }
        }
    }

    // 반복된 개념 찾기
    private findRepeatedConcepts(memory: ConversationMemory, understanding: QuestionUnderstandingResult): string[] {
        const currentConcepts = understanding.semantic_analysis.core_concepts.map(c => c.concept);
        const history = memory.conversation_history.slice(-10);

        const repeated: string[] = [];
        for (const concept of currentConcepts) {
            const count = history.filter(entry =>
                entry.understanding_result?.semantic_analysis.core_concepts.some(c =>
                    c.concept.toLowerCase() === concept.toLowerCase()
                )
            ).length;

            if (count > 1) {
                repeated.push(concept);
            }
        }

        return repeated;
    }

    // 주제 진행 분석
    private analyzeTopicProgression(memory: ConversationMemory, understanding: QuestionUnderstandingResult): string | null {
        const currentDomain = understanding.semantic_analysis.domain_classification.primary_domain;
        const history = memory.conversation_history.slice(-5);

        if (history.length < 2) return null;

        const previousDomains = history.map(entry =>
            entry.understanding_result?.semantic_analysis.domain_classification.primary_domain
        ).filter(Boolean);

        if (previousDomains.length > 0 && previousDomains[previousDomains.length - 1] !== currentDomain) {
            return `${previousDomains[previousDomains.length - 1]} → ${currentDomain}`;
        }

        return null;
    }

    // 난이도 스케일링 분석
    private analyzeDifficultyScaling(memory: ConversationMemory, understanding: QuestionUnderstandingResult): string | null {
        const currentComplexity = understanding.semantic_analysis.complexity_assessment.overall_complexity;
        const history = memory.conversation_history.slice(-3);

        if (history.length < 2) return null;

        const previousComplexities = history.map(entry =>
            entry.understanding_result?.semantic_analysis.complexity_assessment.overall_complexity
        ).filter(Boolean);

        if (previousComplexities.length > 0) {
            const avgPrevious = previousComplexities.reduce((a, b) => a + b, 0) / previousComplexities.length;
            const diff = currentComplexity - avgPrevious;

            if (Math.abs(diff) > 1) {
                return diff > 0 ? 'increasing' : 'decreasing';
            }
        }

        return null;
    }

    // 패턴 업데이트
    private updatePattern(patterns: LearningPattern[], type: string, examples: string[]): void {
        const existingPattern = patterns.find(p => p.pattern_type === type);

        if (existingPattern) {
            existingPattern.frequency++;
            existingPattern.last_observed = new Date();
            existingPattern.examples.push(...examples);
            if (existingPattern.examples.length > 10) {
                existingPattern.examples = existingPattern.examples.slice(-10);
            }
        } else {
            patterns.push({
                pattern_type: type as any,
                frequency: 1,
                effectiveness_score: 0.5,
                last_observed: new Date(),
                examples: examples
            });
        }
    }

    // 지식 그래프 업데이트
    private async updateKnowledgeGraph(memory: ConversationMemory, entry: ConversationEntry): Promise<void> {
        const graph = memory.knowledge_graph;
        const understanding = entry.understanding_result;

        if (understanding) {
            // 노드 추가/업데이트
            for (const concept of understanding.semantic_analysis.core_concepts) {
                const existingNode = graph.nodes.find(n => n.concept.toLowerCase() === concept.concept.toLowerCase());

                if (existingNode) {
                    existingNode.access_count++;
                    existingNode.last_accessed = new Date();
                    existingNode.confidence = Math.max(existingNode.confidence, concept.importance);
                } else {
                    graph.nodes.push({
                        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        concept: concept.concept,
                        confidence: concept.importance,
                        last_accessed: new Date(),
                        access_count: 1,
                        related_concepts: concept.related_concepts
                    });
                }
            }

            // 엣지 추가/업데이트
            for (const relationship of understanding.semantic_analysis.relationships) {
                const existingEdge = graph.edges.find(e =>
                    e.source === relationship.source && e.target === relationship.target
                );

                if (existingEdge) {
                    existingEdge.strength = Math.max(existingEdge.strength, relationship.strength);
                    existingEdge.last_updated = new Date();
                } else {
                    graph.edges.push({
                        source: relationship.source,
                        target: relationship.target,
                        relationship_type: relationship.relationship_type,
                        strength: relationship.strength,
                        last_updated: new Date()
                    });
                }
            }

            graph.last_updated = new Date();
        }
    }

    // 상호작용 통계 업데이트
    private updateInteractionStats(memory: ConversationMemory, entry: ConversationEntry): void {
        const stats = memory.interaction_stats;

        stats.total_messages++;
        stats.average_session_length = Math.round(
            (stats.average_session_length * (stats.total_messages - 1) + entry.ai_response.length) / stats.total_messages
        );

        // 활성 시간 업데이트
        const hour = entry.timestamp.getHours();
        if (!stats.most_active_hours.includes(hour)) {
            stats.most_active_hours.push(hour);
            stats.most_active_hours.sort();
        }

        // 주제 선호도 업데이트
        const topic = entry.context.current_topic;
        const topicPref = stats.preferred_topics.find(t => t.topic === topic);
        if (topicPref) {
            topicPref.frequency++;
            topicPref.last_interaction = entry.timestamp;
        } else {
            stats.preferred_topics.push({
                topic,
                frequency: 1,
                last_interaction: entry.timestamp,
                satisfaction_score: 0
            });
        }

        // 만족도 점수 업데이트
        if (entry.user_feedback) {
            stats.satisfaction_scores.push({
                date: entry.timestamp,
                score: entry.user_feedback.rating,
                factors: this.analyzeSatisfactionFactors(entry)
            });
        }
    }

    // 만족도 요인 분석
    private analyzeSatisfactionFactors(entry: ConversationEntry): string[] {
        const factors: string[] = [];

        if (entry.user_feedback) {
            if (entry.user_feedback.helpful) factors.push('helpful_response');
            if (entry.user_feedback.clear) factors.push('clear_explanation');
            if (entry.user_feedback.complete) factors.push('complete_answer');
            if (entry.user_feedback.emotional_response === 'positive') factors.push('positive_emotion');
        }

        if (entry.metadata.processing_time < 1000) factors.push('fast_response');
        if (entry.metadata.confidence_score > 0.8) factors.push('high_confidence');
        if (entry.ai_response.includes('코드') || entry.ai_response.includes('example')) factors.push('practical_example');

        return factors;
    }

    // 전역 통계 업데이트
    private updateGlobalStats(entry: ConversationEntry): void {
        this.globalStats.total_conversations++;

        if (entry.user_feedback) {
            const currentAvg = this.globalStats.average_satisfaction;
            const totalScores = this.globalStats.total_conversations;
            this.globalStats.average_satisfaction =
                (currentAvg * (totalScores - 1) + entry.user_feedback.rating) / totalScores;
        }

        // 인기 주제 업데이트
        const topic = entry.context.current_topic;
        const existingTopic = this.globalStats.popular_topics.find(t => t.topic === topic);
        if (existingTopic) {
            existingTopic.count++;
        } else {
            this.globalStats.popular_topics.push({ topic, count: 1 });
        }

        // 성능 통계 업데이트
        this.globalStats.system_performance.average_response_time =
            (this.globalStats.system_performance.average_response_time + entry.metadata.processing_time) / 2;
    }

    // 메모리 최적화
    private optimizeMemory(memory: ConversationMemory): void {
        // 대화 히스토리 제한 (최대 100개)
        if (memory.conversation_history.length > 100) {
            memory.conversation_history = memory.conversation_history.slice(-100);
        }

        // 지식 그래프 노드 제한 (최대 200개)
        if (memory.knowledge_graph.nodes.length > 200) {
            memory.knowledge_graph.nodes = memory.knowledge_graph.nodes
                .sort((a, b) => b.access_count - a.access_count)
                .slice(0, 200);
        }

        // 만족도 점수 제한 (최대 50개)
        if (memory.interaction_stats.satisfaction_scores.length > 50) {
            memory.interaction_stats.satisfaction_scores =
                memory.interaction_stats.satisfaction_scores.slice(-50);
        }
    }

    // 메모리 최적화 스케줄러
    private startMemoryOptimization(): void {
        setInterval(() => {
            this.performMemoryCleanup();
        }, 300000); // 5분마다 실행
    }

    // 메모리 정리
    private performMemoryCleanup(): void {
        const now = Date.now();
        const oneDayAgo = now - (24 * 60 * 60 * 1000);

        for (const [key, memory] of this.memoryStore.entries()) {
            // 24시간 이상 된 세션 정리
            if (memory.last_updated.getTime() < oneDayAgo) {
                this.memoryStore.delete(key);
            }
        }

        console.log(`Memory cleanup completed. Active sessions: ${this.memoryStore.size}`);
    }

    // 지속화된 메모리 로드
    private loadPersistedMemory(): void {
        try {
            const persisted = localStorage.getItem('corbu_conversation_memory');
            if (persisted) {
                const parsed = JSON.parse(persisted);
                for (const [key, memory] of Object.entries(parsed)) {
                    this.memoryStore.set(key, memory as ConversationMemory);
                }
            }
        } catch (error) {
            console.warn('Failed to load persisted memory:', error);
        }
    }

    // 메모리 지속화
    private persistMemory(): void {
        try {
            const memoryData: { [key: string]: ConversationMemory } = {};
            for (const [key, memory] of this.memoryStore.entries()) {
                memoryData[key] = memory;
            }
            localStorage.setItem('corbu_conversation_memory', JSON.stringify(memoryData));
        } catch (error) {
            console.warn('Failed to persist memory:', error);
        }
    }

    // 공개 메서드들
    async getConversationContext(userId: string, sessionId: string): Promise<ConversationContext | null> {
        const memory = await this.getUserMemory(userId, sessionId);
        if (memory.conversation_history.length === 0) return null;

        const lastEntry = memory.conversation_history[memory.conversation_history.length - 1];
        return lastEntry.context;
    }

    async getUserPreferences(userId: string, sessionId: string): Promise<UserPreferences> {
        const memory = await this.getUserMemory(userId, sessionId);
        return memory.preferences;
    }

    async getLearningPatterns(userId: string, sessionId: string): Promise<LearningPattern[]> {
        const memory = await this.getUserMemory(userId, sessionId);
        return memory.learning_patterns;
    }

    async getKnowledgeGraph(userId: string, sessionId: string): Promise<KnowledgeGraph> {
        const memory = await this.getUserMemory(userId, sessionId);
        return memory.knowledge_graph;
    }

    async getInteractionStats(userId: string, sessionId: string): Promise<InteractionStats> {
        const memory = await this.getUserMemory(userId, sessionId);
        return memory.interaction_stats;
    }

    async updateUserFeedback(
        userId: string,
        sessionId: string,
        entryId: string,
        feedback: UserFeedback
    ): Promise<void> {
        const memory = await this.getUserMemory(userId, sessionId);
        const entry = memory.conversation_history.find(e => e.id === entryId);

        if (entry) {
            entry.user_feedback = feedback;
            memory.last_updated = new Date();

            // 통계 업데이트
            this.updateInteractionStats(memory, entry);
        }
    }

    async getPersonalizedSuggestions(userId: string, sessionId: string): Promise<string[]> {
        const memory = await this.getUserMemory(userId, sessionId);
        const suggestions: string[] = [];

        // 학습 패턴 기반 제안
        const patterns = memory.learning_patterns;
        const conceptRepetition = patterns.find(p => p.pattern_type === 'concept_repetition');
        if (conceptRepetition && conceptRepetition.frequency > 3) {
            suggestions.push('반복 학습이 효과적입니다. 이전에 배운 개념을 복습해보세요.');
        }

        // 주제 선호도 기반 제안
        const preferredTopics = memory.interaction_stats.preferred_topics
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 3);

        if (preferredTopics.length > 0) {
            suggestions.push(`관심 있는 주제: ${preferredTopics.map(t => t.topic).join(', ')}`);
        }

        // 만족도 기반 제안
        const recentSatisfaction = memory.interaction_stats.satisfaction_scores
            .slice(-5)
            .reduce((sum, score) => sum + score.score, 0) / 5;

        if (recentSatisfaction < 3) {
            suggestions.push('더 자세한 설명이 필요하시면 말씀해 주세요.');
        }

        return suggestions;
    }

    getGlobalStats(): GlobalStats {
        return { ...this.globalStats };
    }

    // 서비스 종료 시 메모리 지속화
    shutdown(): void {
        this.persistMemory();
        console.log('Advanced Conversation Memory Service shutdown');
    }
}

interface GlobalStats {
    total_users: number;
    total_conversations: number;
    average_satisfaction: number;
    popular_topics: Array<{ topic: string; count: number }>;
    system_performance: {
        average_response_time: number;
        memory_usage: number;
        error_rate: number;
    };
}

const advancedConversationMemoryService = new AdvancedConversationMemoryService();
export default advancedConversationMemoryService;
