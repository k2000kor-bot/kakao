/**
 * 🧠 대화 기억 및 학습 시스템
 * 사용자별 대화 패턴, 선호도, 학습 진도를 기억하고 맞춤형 경험 제공
 */

import { errorLogger, toError } from '../utils/errorLogger';
import { ANALYTICS_USER_PROFILES_STORAGE_KEY } from './analyticsPersistenceStorageKeys';

export interface UserProfile {
    userId: string;
    name?: string;
    expertise: {
        overall: 'beginner' | 'intermediate' | 'advanced' | 'expert';
        technologies: Record<string, {
            level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
            experience: number; // months
            lastUpdated: Date;
            projects: string[];
        }>;
    };
    preferences: {
        responseStyle: 'concise' | 'detailed' | 'comprehensive' | 'tutorial';
        codeExamples: 'minimal' | 'standard' | 'extensive';
        explanationDepth: 'surface' | 'moderate' | 'deep' | 'academic';
        preferredLanguages: string[];
        learningGoals: string[];
    };
    conversationPatterns: {
        commonTopics: Array<{ topic: string; frequency: number; lastDiscussed: Date }>;
        questionTypes: Array<{ type: string; count: number }>;
        timePreferences: {
            activeHours: number[];
            sessionDuration: number; // minutes
        };
    };
    learningProgress: {
        completedTopics: Array<{
            topic: string;
            completionDate: Date;
            masteryLevel: number; // 0-1
            needsReview: boolean;
        }>;
        currentLearningPath: Array<{
            topic: string;
            progress: number; // 0-1
            estimatedCompletion: Date;
            difficulty: number; // 1-5
        }>;
        strugglingAreas: Array<{
            area: string;
            attempts: number;
            lastAttempt: Date;
            helpNeeded: string[];
        }>;
    };
    interactionHistory: {
        totalSessions: number;
        totalMessages: number;
        averageSessionLength: number;
        lastActive: Date;
        satisfactionRating: number; // 1-5
        feedbackHistory: Array<{
            date: Date;
            rating: number;
            comment?: string;
            responseId: string;
        }>;
    };
}

export interface ConversationContext {
    sessionId: string;
    userId: string;
    startTime: Date;
    messages: Array<{
        id: string;
        role: 'user' | 'assistant';
        content: string;
        timestamp: Date;
        metadata?: {
            intent: string;
            topics: string[];
            sentiment: string;
            complexity: number;
            responseTime?: number;
            userSatisfaction?: number;
        };
    }>;
    currentTopic: string;
    topicHistory: Array<{
        topic: string;
        startTime: Date;
        endTime?: Date;
        depth: number;
    }>;
    learningObjectives: string[];
    achievements: Array<{
        type: string;
        description: string;
        timestamp: Date;
    }>;
}

export interface LearningRecommendation {
    type: 'review' | 'advance' | 'practice' | 'explore';
    priority: 'high' | 'medium' | 'low';
    topic: string;
    reason: string;
    suggestedActions: string[];
    estimatedTime: string;
    resources: Array<{
        type: 'article' | 'video' | 'practice' | 'project';
        title: string;
        url?: string;
        description: string;
    }>;
}

export class ConversationMemorySystem {
    private userProfiles: Map<string, UserProfile> = new Map();
    private conversationContexts: Map<string, ConversationContext> = new Map();
    private learningAnalytics: Map<string, Record<string, unknown>> = new Map();

    constructor() {
        this.loadUserProfiles();
        this.initializeAnalytics();
    }

    /**
     * 👤 사용자 프로필 관리
     * 
     * @param userId - 사용자 ID
     * @returns Promise<UserProfile> - 사용자 프로필
     * @throws Error - 프로필 로드 실패 시
     */
    async getUserProfile(userId: string): Promise<UserProfile> {
        if (!userId || typeof userId !== 'string') {
            throw new Error('유효하지 않은 사용자 ID입니다.');
        }

        try {
            let profile = this.userProfiles.get(userId);
            
            if (!profile) {
                profile = this.createDefaultProfile(userId);
                this.userProfiles.set(userId, profile);
                await this.saveUserProfile(profile);
            }
            
            return profile;
        } catch (error) {
            const err = toError(error);
            errorLogger.error(`사용자 프로필 로드 실패 (${userId})`, err, {
                component: 'conversationMemorySystem',
                action: 'getUserProfile',
                userId,
            });
            // 기본 프로필 반환으로 폴백
            return this.createDefaultProfile(userId);
        }
    }

    /**
     * 사용자 프로필 업데이트
     * 
     * @param userId - 사용자 ID
     * @param updates - 업데이트할 프로필 정보
     * @throws Error - 업데이트 실패 시
     */
    async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
        if (!userId || typeof userId !== 'string') {
            throw new Error('유효하지 않은 사용자 ID입니다.');
        }

        try {
            const profile = await this.getUserProfile(userId);
            const updatedProfile = { ...profile, ...updates };
            this.userProfiles.set(userId, updatedProfile);
            await this.saveUserProfile(updatedProfile);
        } catch (error) {
            const err = toError(error);
            errorLogger.error(`사용자 프로필 업데이트 실패 (${userId})`, err, {
                component: 'conversationMemorySystem',
                action: 'updateUserProfile',
                userId,
            });
            throw new Error(`프로필 업데이트에 실패했습니다: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 🧠 대화 컨텍스트 관리
     */
    async startConversationSession(userId: string): Promise<string> {
        const sessionId = this.generateSessionId();
        const userProfile = await this.getUserProfile(userId);
        
        const context: ConversationContext = {
            sessionId,
            userId,
            startTime: new Date(),
            messages: [],
            currentTopic: '',
            topicHistory: [],
            learningObjectives: userProfile.preferences.learningGoals,
            achievements: []
        };
        
        this.conversationContexts.set(sessionId, context);
        return sessionId;
    }

    /**
     * 대화 컨텍스트에 메시지 추가
     * 
     * @param sessionId - 세션 ID
     * @param role - 메시지 역할
     * @param content - 메시지 내용
     * @param metadata - 메시지 메타데이터
     * @throws Error - 세션이 없거나 메시지 추가 실패 시
     */
    async addMessageToContext(
        sessionId: string, 
        role: 'user' | 'assistant', 
        content: string,
        metadata?: Record<string, unknown>
    ): Promise<void> {
        if (!sessionId || typeof sessionId !== 'string') {
            throw new Error('유효하지 않은 세션 ID입니다.');
        }

        if (!content || typeof content !== 'string') {
            throw new Error('메시지 내용이 필요합니다.');
        }

        try {
            const context = this.conversationContexts.get(sessionId);
            if (!context) {
                throw new Error(`세션을 찾을 수 없습니다: ${sessionId}`);
            }

            const message = {
                id: this.generateMessageId(),
                role,
                content,
                timestamp: new Date(),
                metadata
            };

            context.messages.push(message as typeof context.messages[0]);

            // 사용자 메시지인 경우 학습 패턴 분석
            if (role === 'user') {
                await this.analyzeUserMessage(context.userId, content, metadata);
            }

            // AI 응답인 경우 효과성 추적
            if (role === 'assistant') {
                await this.trackResponseEffectiveness(context.userId, message);
            }

            this.conversationContexts.set(sessionId, context);
        } catch (error) {
            const err = toError(error);
            errorLogger.error(`메시지 추가 실패 (${sessionId})`, err, {
                component: 'conversationMemorySystem',
                action: 'addMessageToContext',
                sessionId,
                role,
            });
            throw error;
        }
    }

    /**
     * 📊 학습 패턴 분석
     */
    private async analyzeUserMessage(userId: string, content: string, metadata?: Record<string, unknown>): Promise<void> {
        if (!metadata) return;
        const profile = await this.getUserProfile(userId);
        
        // 주제 빈도 업데이트
        const topics = Array.isArray(metadata.topics) ? (metadata.topics as string[]) : [];
        if (topics.length > 0) {
            for (const topic of topics) {
                const existingTopic = profile.conversationPatterns.commonTopics.find(t => t.topic === topic);
                if (existingTopic) {
                    existingTopic.frequency++;
                    existingTopic.lastDiscussed = new Date();
                } else {
                    profile.conversationPatterns.commonTopics.push({
                        topic,
                        frequency: 1,
                        lastDiscussed: new Date()
                    });
                }
            }
        }

        // 질문 유형 분석
        const intent = String(metadata.intent ?? '');
        if (intent) {
            const existingType = profile.conversationPatterns.questionTypes.find(q => q.type === intent);
            if (existingType) {
                existingType.count++;
            } else {
                profile.conversationPatterns.questionTypes.push({
                    type: intent,
                    count: 1
                });
            }
        }

        // 기술 관련 질문인 경우 전문성 레벨 조정
        const technologies = Array.isArray(metadata.technologies) ? (metadata.technologies as string[]) : [];
        if (technologies.length > 0) {
            for (const tech of technologies) {
                if (!profile.expertise.technologies[tech]) {
                    profile.expertise.technologies[tech] = {
                        level: 'beginner',
                        experience: 0,
                        lastUpdated: new Date(),
                        projects: []
                    };
                }

                // 질문 복잡도에 따라 레벨 조정
                const complexity = Number(metadata.complexity) || 0.5;
                const currentLevel = profile.expertise.technologies[tech].level;
                
                if (complexity > 0.7 && currentLevel === 'beginner') {
                    profile.expertise.technologies[tech].level = 'intermediate';
                } else if (complexity > 0.9 && currentLevel === 'intermediate') {
                    profile.expertise.technologies[tech].level = 'advanced';
                }
                
                profile.expertise.technologies[tech].lastUpdated = new Date();
            }
        }

        await this.updateUserProfile(userId, profile);
    }

    /**
     * 📈 응답 효과성 추적
     */
    private async trackResponseEffectiveness(userId: string, message: Record<string, unknown>): Promise<void> {
        const profile = await this.getUserProfile(userId);
        const meta = (message.metadata || {}) as { responseTime?: number; userSatisfaction?: number };
        
        // 응답 시간 추적
        if (typeof meta.responseTime === 'number') {
            profile.interactionHistory.averageSessionLength = 
                (profile.interactionHistory.averageSessionLength + meta.responseTime) / 2;
        }

        // 사용자 만족도 추적 (추후 피드백 시스템과 연동)
        if (typeof meta.userSatisfaction === 'number') {
            profile.interactionHistory.satisfactionRating = 
                (profile.interactionHistory.satisfactionRating + meta.userSatisfaction) / 2;
        }

        await this.updateUserProfile(userId, profile);
    }

    /**
     * 🎯 개인화된 학습 추천
     */
    async getPersonalizedRecommendations(userId: string): Promise<LearningRecommendation[]> {
        const profile = await this.getUserProfile(userId);
        const recommendations: LearningRecommendation[] = [];

        // 1. 복습이 필요한 주제 식별
        const reviewTopics = profile.learningProgress.completedTopics.filter(topic => {
            const daysSinceCompletion = (Date.now() - topic.completionDate.getTime()) / (1000 * 60 * 60 * 24);
            return topic.needsReview || (daysSinceCompletion > 30 && topic.masteryLevel < 0.8);
        });

        for (const topic of reviewTopics) {
            recommendations.push({
                type: 'review',
                priority: 'high',
                topic: topic.topic,
                reason: `${topic.topic}을(를) 복습하여 기억을 강화하세요`,
                suggestedActions: [
                    '핵심 개념 다시 정리하기',
                    '실습 예제 다시 풀어보기',
                    '관련 프로젝트에 적용해보기'
                ],
                estimatedTime: '30-60분',
                resources: [
                    {
                        type: 'practice',
                        title: `${topic.topic} 복습 문제`,
                        description: '핵심 개념을 확인할 수 있는 실습 문제'
                    }
                ]
            });
        }

        // 2. 어려움을 겪고 있는 영역 지원
        for (const struggle of profile.learningProgress.strugglingAreas) {
            recommendations.push({
                type: 'practice',
                priority: 'high',
                topic: struggle.area,
                reason: `${struggle.area}에서 어려움을 겪고 있어 추가 연습이 필요합니다`,
                suggestedActions: struggle.helpNeeded,
                estimatedTime: '1-2시간',
                resources: [
                    {
                        type: 'article',
                        title: `${struggle.area} 단계별 가이드`,
                        description: '기초부터 차근차근 설명하는 튜토리얼'
                    }
                ]
            });
        }

        // 3. 자주 묻는 주제의 심화 학습
        const sortedTopics = [...profile.conversationPatterns.commonTopics].sort((a, b) => b.frequency - a.frequency);

        for (const topic of sortedTopics) {
            recommendations.push({
                type: 'advance',
                priority: 'medium',
                topic: topic.topic,
                reason: `${topic.topic}에 관심이 많으시니 심화 학습을 추천합니다`,
                suggestedActions: [
                    '고급 개념 학습하기',
                    '실무 사례 분석하기',
                    '개인 프로젝트에 적용하기'
                ],
                estimatedTime: '2-4시간',
                resources: [
                    {
                        type: 'article',
                        title: `${topic.topic} 고급 가이드`,
                        description: '실무에서 사용하는 고급 기법과 패턴'
                    }
                ]
            });
        }

        // 4. 학습 목표 기반 추천
        for (const goal of profile.preferences.learningGoals) {
            recommendations.push({
                type: 'explore',
                priority: 'medium',
                topic: goal,
                reason: `학습 목표인 ${goal}을(를) 달성하기 위한 다음 단계입니다`,
                suggestedActions: [
                    '관련 기초 개념 학습',
                    '실습 프로젝트 시작',
                    '커뮤니티 참여'
                ],
                estimatedTime: '1주일',
                resources: [
                    {
                        type: 'project',
                        title: `${goal} 실습 프로젝트`,
                        description: '실무 경험을 쌓을 수 있는 프로젝트'
                    }
                ]
            });
        }

        const sortedRecommendations = [...recommendations].sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
        return sortedRecommendations;
    }

    /**
     * 💡 맞춤형 응답 스타일 결정
     */
    async getOptimalResponseStyle(userId: string, questionType: string): Promise<{
        style: string;
        tone: string;
        detailLevel: string;
        includeExamples: boolean;
        codeComplexity: string;
    }> {
        const profile = await this.getUserProfile(userId);
        
        // 사용자 선호도 기반
        let style = profile.preferences.responseStyle;
        let detailLevel = profile.preferences.explanationDepth;
        let codeComplexity = profile.preferences.codeExamples;

        // 질문 유형별 조정
        if (questionType === 'learning') {
            style = 'tutorial';
            detailLevel = 'deep';
        } else if (questionType === 'problemSolving') {
            style = 'detailed';
            detailLevel = 'moderate';
        } else if (questionType === 'quickAnswer') {
            style = 'concise';
            detailLevel = 'surface';
        }

        // 전문성 레벨에 따른 조정
        if (profile.expertise.overall === 'beginner') {
            detailLevel = 'deep';
            codeComplexity = 'extensive';
        } else if (profile.expertise.overall === 'expert') {
            style = 'concise';
            detailLevel = 'surface';
            codeComplexity = 'minimal';
        }

        return {
            style,
            tone: 'friendly',
            detailLevel,
            includeExamples: true,
            codeComplexity
        };
    }

    /**
     * 🔧 유틸리티 메서드들
     */
    private createDefaultProfile(userId: string): UserProfile {
        return {
            userId,
            expertise: {
                overall: 'intermediate',
                technologies: {}
            },
            preferences: {
                responseStyle: 'detailed',
                codeExamples: 'standard',
                explanationDepth: 'moderate',
                preferredLanguages: ['JavaScript', 'TypeScript'],
                learningGoals: []
            },
            conversationPatterns: {
                commonTopics: [],
                questionTypes: [],
                timePreferences: {
                    activeHours: [9, 10, 11, 14, 15, 16, 19, 20, 21],
                    sessionDuration: 30
                }
            },
            learningProgress: {
                completedTopics: [],
                currentLearningPath: [],
                strugglingAreas: []
            },
            interactionHistory: {
                totalSessions: 0,
                totalMessages: 0,
                averageSessionLength: 0,
                lastActive: new Date(),
                satisfactionRating: 4,
                feedbackHistory: []
            }
        };
    }

    private generateSessionId(): string {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    }

    private generateMessageId(): string {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    }

    /**
     * 사용자 프로필 로드 (로컬 스토리지에서)
     * 
     * @throws Error - 로드 실패 시
     */
    private async loadUserProfiles(): Promise<void> {
        try {
            const stored = localStorage.getItem(ANALYTICS_USER_PROFILES_STORAGE_KEY);
            if (stored) {
                const profiles = JSON.parse(stored);
                for (const [userId, profile] of Object.entries(profiles)) {
                    // 타입 검증
                    if (userId && typeof userId === 'string' && profile) {
                        this.userProfiles.set(userId, profile as UserProfile);
                    }
                }
            }
        } catch (error) {
            const err = toError(error);
            errorLogger.error('사용자 프로필 로드 실패', err, {
                component: 'conversationMemorySystem',
                action: 'loadUserProfiles',
            });
            // 로드 실패해도 계속 진행 (빈 상태로 시작)
        }
    }

    /**
     * 사용자 프로필 저장 (로컬 스토리지에)
     * 
     * @param profile - 저장할 프로필
     * @throws Error - 저장 실패 시
     */
    private async saveUserProfile(_profile: UserProfile): Promise<void> {
        try {
            const allProfiles: Record<string, UserProfile> = {};
            for (const [userId, userProfile] of this.userProfiles.entries()) {
                allProfiles[userId] = userProfile;
            }
            
            // 로컬 스토리지 용량 초과 처리
            try {
                localStorage.setItem(ANALYTICS_USER_PROFILES_STORAGE_KEY, JSON.stringify(allProfiles));
            } catch (storageError) {
                if (storageError instanceof Error && storageError.name === 'QuotaExceededError') {
                    // 오래된 프로필 제거 (마지막 활동일 기준)
                    const sortedProfiles = Object.entries(allProfiles).sort((a, b) => {
                        const dateA = new Date(a[1].interactionHistory.lastActive).getTime();
                        const dateB = new Date(b[1].interactionHistory.lastActive).getTime();
                        return dateB - dateA;
                    });
                    
                    // 최신 50개만 유지
                    const cleanedProfiles: Record<string, UserProfile> = {};
                    for (const [userId, profile] of sortedProfiles.slice(0, 50)) {
                        cleanedProfiles[userId] = profile;
                    }
                    
                    localStorage.setItem(ANALYTICS_USER_PROFILES_STORAGE_KEY, JSON.stringify(cleanedProfiles));
                    errorLogger.warn('⚠️ 로컬 스토리지 용량 초과: 오래된 프로필이 제거되었습니다', {
                        component: 'conversationMemorySystem',
                        action: 'saveUserProfile',
                        removedProfilesCount: sortedProfiles.length - 50,
                    });
                } else {
                    throw storageError;
                }
            }
        } catch (error) {
            const err = toError(error);
            errorLogger.error('사용자 프로필 저장 실패', err, {
                component: 'conversationMemorySystem',
                action: 'saveUserProfile',
            });
            throw new Error(`프로필 저장에 실패했습니다: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private initializeAnalytics(): void {
        // 학습 분석을 위한 초기화
        errorLogger.info('🧠 대화 기억 시스템 초기화 완료', {
            component: 'conversationMemorySystem',
            action: 'initializeAnalytics',
        });
    }

    /**
     * 📊 사용자 통계 생성
     */
    async getUserStats(userId: string): Promise<{
        learningStreak: number;
        topicsExplored: number;
        questionsAsked: number;
        averageSessionTime: number;
        mostActiveDay: string;
        preferredTopics: string[];
        skillProgression: Array<{
            skill: string;
            level: string;
            progress: number;
        }>;
    }> {
        const profile = await this.getUserProfile(userId);
        
        return {
            learningStreak: this.calculateLearningStreak(profile),
            topicsExplored: profile.conversationPatterns.commonTopics.length,
            questionsAsked: profile.interactionHistory.totalMessages,
            averageSessionTime: profile.interactionHistory.averageSessionLength,
            mostActiveDay: this.getMostActiveDay(profile),
            preferredTopics: (() => {
                const sortedTopics = [...profile.conversationPatterns.commonTopics].sort((a, b) => b.frequency - a.frequency);
                return sortedTopics.map(t => t.topic);
            })(),
            skillProgression: Object.entries(profile.expertise.technologies).map(([skill, data]) => ({
                skill,
                level: data.level,
                progress: this.calculateSkillProgress(data.level, data.experience)
            }))
        };
    }

    private calculateLearningStreak(_profile: UserProfile): number {
        // 연속 학습 일수 계산 로직
        return 7; // 예시값
    }

    private getMostActiveDay(_profile: UserProfile): string {
        // 가장 활동적인 요일 계산
        return 'Monday'; // 예시값
    }

    private calculateSkillProgress(level: string, _experience: number): number {
        const levelMap: Record<string, number> = { 
            beginner: 0.25, 
            intermediate: 0.5, 
            advanced: 0.75, 
            expert: 1 
        };
        return levelMap[level] ?? 0;
    }
}

export { ANALYTICS_USER_PROFILES_STORAGE_KEY } from './analyticsPersistenceStorageKeys';

export default ConversationMemorySystem;
