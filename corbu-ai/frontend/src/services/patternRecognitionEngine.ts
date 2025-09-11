import { ChatSession, Message } from '../types/chat';
import { Project, Guideline } from '../types/project';

interface Pattern {
    id: string;
    type: 'conversation' | 'behavior' | 'project' | 'temporal' | 'semantic';
    name: string;
    description: string;
    confidence: number;
    frequency: number;
    firstSeen: Date;
    lastSeen: Date;
    data: any;
}

interface ConversationPattern {
    type: 'question_sequence' | 'topic_shift' | 'response_style' | 'interaction_flow';
    pattern: string[];
    confidence: number;
    context: string;
}

interface BehavioralPattern {
    type: 'timing' | 'preference' | 'engagement' | 'satisfaction';
    pattern: any;
    confidence: number;
    impact: 'positive' | 'negative' | 'neutral';
}

interface ProjectPattern {
    type: 'file_usage' | 'guideline_following' | 'progress_tracking' | 'collaboration';
    pattern: any;
    confidence: number;
    efficiency: number;
}

interface TemporalPattern {
    type: 'daily' | 'weekly' | 'monthly' | 'seasonal';
    pattern: any;
    confidence: number;
    predictability: number;
}

interface SemanticPattern {
    type: 'topic_clustering' | 'sentiment_progression' | 'intent_evolution' | 'knowledge_gaps';
    pattern: any;
    confidence: number;
    insights: string[];
}

class PatternRecognitionEngine {
    private patterns: Map<string, Pattern> = new Map();
    private readonly STORAGE_KEY = 'pattern_recognition_data';
    private readonly MIN_CONFIDENCE = 0.6;
    private readonly MIN_FREQUENCY = 3;

    constructor() {
        this.loadPatterns();
    }

    // 대화 패턴 인식
    async recognizeConversationPatterns(sessions: ChatSession[]): Promise<ConversationPattern[]> {
        const patterns: ConversationPattern[] = [];
        const allMessages = sessions.flatMap(s => s.messages);

        // 질문 시퀀스 패턴
        const questionSequences = this.findQuestionSequences(allMessages);
        patterns.push(...questionSequences);

        // 주제 전환 패턴
        const topicShifts = this.findTopicShifts(allMessages);
        patterns.push(...topicShifts);

        // 응답 스타일 패턴
        const responseStyles = this.findResponseStyles(allMessages);
        patterns.push(...responseStyles);

        // 상호작용 플로우 패턴
        const interactionFlows = this.findInteractionFlows(allMessages);
        patterns.push(...interactionFlows);

        return patterns.filter(p => p.confidence >= this.MIN_CONFIDENCE);
    }

    // 행동 패턴 인식
    async recognizeBehavioralPatterns(sessions: ChatSession[]): Promise<BehavioralPattern[]> {
        const patterns: BehavioralPattern[] = [];

        // 타이밍 패턴
        const timingPatterns = this.findTimingPatterns(sessions);
        patterns.push(...timingPatterns);

        // 선호도 패턴
        const preferencePatterns = this.findPreferencePatterns(sessions);
        patterns.push(...preferencePatterns);

        // 참여도 패턴
        const engagementPatterns = this.findEngagementPatterns(sessions);
        patterns.push(...engagementPatterns);

        // 만족도 패턴
        const satisfactionPatterns = this.findSatisfactionPatterns(sessions);
        patterns.push(...satisfactionPatterns);

        return patterns.filter(p => p.confidence >= this.MIN_CONFIDENCE);
    }

    // 프로젝트 패턴 인식
    async recognizeProjectPatterns(project: Project, sessions: ChatSession[]): Promise<ProjectPattern[]> {
        const patterns: ProjectPattern[] = [];
        const projectSessions = sessions.filter(s => s.projectId === project.id);

        // 파일 사용 패턴
        const fileUsagePatterns = this.findFileUsagePatterns(project, projectSessions);
        patterns.push(...fileUsagePatterns);

        // 지침 준수 패턴
        const guidelinePatterns = this.findGuidelinePatterns(project, projectSessions);
        patterns.push(...guidelinePatterns);

        // 진행 추적 패턴
        const progressPatterns = this.findProgressPatterns(projectSessions);
        patterns.push(...progressPatterns);

        // 협업 패턴
        const collaborationPatterns = this.findCollaborationPatterns(projectSessions);
        patterns.push(...collaborationPatterns);

        return patterns.filter(p => p.confidence >= this.MIN_CONFIDENCE);
    }

    // 시간적 패턴 인식
    async recognizeTemporalPatterns(sessions: ChatSession[]): Promise<TemporalPattern[]> {
        const patterns: TemporalPattern[] = [];

        // 일일 패턴
        const dailyPatterns = this.findDailyPatterns(sessions);
        patterns.push(...dailyPatterns);

        // 주간 패턴
        const weeklyPatterns = this.findWeeklyPatterns(sessions);
        patterns.push(...weeklyPatterns);

        // 월간 패턴
        const monthlyPatterns = this.findMonthlyPatterns(sessions);
        patterns.push(...monthlyPatterns);

        // 계절적 패턴
        const seasonalPatterns = this.findSeasonalPatterns(sessions);
        patterns.push(...seasonalPatterns);

        return patterns.filter(p => p.confidence >= this.MIN_CONFIDENCE);
    }

    // 의미적 패턴 인식
    async recognizeSemanticPatterns(sessions: ChatSession[]): Promise<SemanticPattern[]> {
        const patterns: SemanticPattern[] = [];

        // 주제 클러스터링
        const topicClusters = this.findTopicClusters(sessions);
        patterns.push(...topicClusters);

        // 감정 진행 패턴
        const sentimentProgressions = this.findSentimentProgressions(sessions);
        patterns.push(...sentimentProgressions);

        // 의도 진화 패턴
        const intentEvolutions = this.findIntentEvolutions(sessions);
        patterns.push(...intentEvolutions);

        // 지식 격차 패턴
        const knowledgeGaps = this.findKnowledgeGaps(sessions);
        patterns.push(...knowledgeGaps);

        return patterns.filter(p => p.confidence >= this.MIN_CONFIDENCE);
    }

    // 질문 시퀀스 찾기
    private findQuestionSequences(messages: Message[]): ConversationPattern[] {
        const patterns: ConversationPattern[] = [];
        const questionKeywords = ['무엇', '어떻게', '왜', '언제', '어디서', '누가', '어떤', '몇'];

        for (let i = 0; i < messages.length - 2; i++) {
            const current = messages[i];
            const next = messages[i + 1];
            const nextNext = messages[i + 2];

            if (current.isUser && next.isUser && nextNext.isUser) {
                const hasQuestions = [current, next, nextNext].every(msg =>
                    questionKeywords.some(keyword => msg.content.includes(keyword)) ||
                    msg.content.includes('?')
                );

                if (hasQuestions) {
                    patterns.push({
                        type: 'question_sequence',
                        pattern: [current.content, next.content, nextNext.content],
                        confidence: 0.85,
                        context: '연속된 질문 패턴'
                    });
                }
            }
        }

        return patterns;
    }

    // 주제 전환 찾기
    private findTopicShifts(messages: Message[]): ConversationPattern[] {
        const patterns: ConversationPattern[] = [];
        const topicKeywords = ['그런데', '참고로', '말씀드리면', '다른', '새로운', '이제'];

        for (let i = 1; i < messages.length; i++) {
            const prev = messages[i - 1];
            const current = messages[i];

            const hasTopicShift = topicKeywords.some(keyword =>
                current.content.includes(keyword)
            );

            if (hasTopicShift) {
                patterns.push({
                    type: 'topic_shift',
                    pattern: [prev.content, current.content],
                    confidence: 0.75,
                    context: '주제 전환 지점'
                });
            }
        }

        return patterns;
    }

    // 응답 스타일 찾기
    private findResponseStyles(messages: Message[]): ConversationPattern[] {
        const patterns: ConversationPattern[] = [];
        const aiMessages = messages.filter(m => !m.isUser);

        // 상세한 응답 패턴
        const detailedResponses = aiMessages.filter(m => m.content.length > 200);
        if (detailedResponses.length > 0) {
            patterns.push({
                type: 'response_style',
                pattern: detailedResponses.map(m => m.content.substring(0, 100) + '...'),
                confidence: 0.8,
                context: '상세한 응답 스타일'
            });
        }

        // 간결한 응답 패턴
        const conciseResponses = aiMessages.filter(m => m.content.length < 50);
        if (conciseResponses.length > 0) {
            patterns.push({
                type: 'response_style',
                pattern: conciseResponses.map(m => m.content),
                confidence: 0.8,
                context: '간결한 응답 스타일'
            });
        }

        return patterns;
    }

    // 상호작용 플로우 찾기
    private findInteractionFlows(messages: Message[]): ConversationPattern[] {
        const patterns: ConversationPattern[] = [];

        // 질문-답변-후속질문 패턴
        for (let i = 0; i < messages.length - 2; i++) {
            const question = messages[i];
            const answer = messages[i + 1];
            const followUp = messages[i + 2];

            if (question.isUser && !answer.isUser && followUp.isUser) {
                patterns.push({
                    type: 'interaction_flow',
                    pattern: ['질문', '답변', '후속질문'],
                    confidence: 0.9,
                    context: '표준 상호작용 플로우'
                });
            }
        }

        return patterns;
    }

    // 타이밍 패턴 찾기
    private findTimingPatterns(sessions: ChatSession[]): BehavioralPattern[] {
        const patterns: BehavioralPattern[] = [];

        // 응답 시간 패턴
        const responseTimes: number[] = [];
        sessions.forEach(session => {
            const messages = session.messages;
            for (let i = 1; i < messages.length; i++) {
                const currentTime = new Date(messages[i].timestamp).getTime();
                const prevTime = new Date(messages[i - 1].timestamp).getTime();
                responseTimes.push(currentTime - prevTime);
            }
        });

        const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const fastResponses = responseTimes.filter(t => t < avgResponseTime * 0.5).length;
        const slowResponses = responseTimes.filter(t => t > avgResponseTime * 1.5).length;

        if (fastResponses > slowResponses) {
            patterns.push({
                type: 'timing',
                pattern: { avgResponseTime, fastResponses, slowResponses },
                confidence: 0.8,
                impact: 'positive'
            });
        } else if (slowResponses > fastResponses) {
            patterns.push({
                type: 'timing',
                pattern: { avgResponseTime, fastResponses, slowResponses },
                confidence: 0.8,
                impact: 'negative'
            });
        }

        return patterns;
    }

    // 선호도 패턴 찾기
    private findPreferencePatterns(sessions: ChatSession[]): BehavioralPattern[] {
        const patterns: BehavioralPattern[] = [];
        const allMessages = sessions.flatMap(s => s.messages);

        // 주제 선호도
        const topics: { [key: string]: number } = {};
        allMessages.forEach(msg => {
            const words = msg.content.toLowerCase().match(/[가-힣]+/g) || [];
            words.forEach(word => {
                if (word.length > 1) {
                    topics[word] = (topics[word] || 0) + 1;
                }
            });
        });

        const topTopics = Object.entries(topics)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);

        if (topTopics.length > 0) {
            patterns.push({
                type: 'preference',
                pattern: topTopics,
                confidence: 0.85,
                impact: 'neutral'
            });
        }

        return patterns;
    }

    // 참여도 패턴 찾기
    private findEngagementPatterns(sessions: ChatSession[]): BehavioralPattern[] {
        const patterns: BehavioralPattern[] = [];

        // 메시지 수 기반 참여도
        const messageCounts = sessions.map(s => s.messages.length);
        const avgMessages = messageCounts.reduce((a, b) => a + b, 0) / messageCounts.length;
        const highEngagement = messageCounts.filter(c => c > avgMessages * 1.5).length;
        const lowEngagement = messageCounts.filter(c => c < avgMessages * 0.5).length;

        if (highEngagement > lowEngagement) {
            patterns.push({
                type: 'engagement',
                pattern: { avgMessages, highEngagement, lowEngagement },
                confidence: 0.8,
                impact: 'positive'
            });
        }

        return patterns;
    }

    // 만족도 패턴 찾기
    private findSatisfactionPatterns(sessions: ChatSession[]): BehavioralPattern[] {
        const patterns: BehavioralPattern[] = [];
        const allMessages = sessions.flatMap(s => s.messages);

        const positiveWords = ['좋다', '훌륭하다', '감사', '만족', '성공'];
        const negativeWords = ['문제', '실패', '불만', '어려움', '실망'];

        let positiveCount = 0;
        let negativeCount = 0;

        allMessages.forEach(msg => {
            const content = msg.content.toLowerCase();
            positiveWords.forEach(word => {
                if (content.includes(word)) positiveCount++;
            });
            negativeWords.forEach(word => {
                if (content.includes(word)) negativeCount++;
            });
        });

        if (positiveCount > negativeCount) {
            patterns.push({
                type: 'satisfaction',
                pattern: { positiveCount, negativeCount },
                confidence: 0.75,
                impact: 'positive'
            });
        } else if (negativeCount > positiveCount) {
            patterns.push({
                type: 'satisfaction',
                pattern: { positiveCount, negativeCount },
                confidence: 0.75,
                impact: 'negative'
            });
        }

        return patterns;
    }

    // 파일 사용 패턴 찾기
    private findFileUsagePatterns(project: Project, sessions: ChatSession[]): ProjectPattern[] {
        const patterns: ProjectPattern[] = [];

        if (project.files && project.files.length > 0) {
            const fileUsage: { [key: string]: number } = {};

            sessions.forEach(session => {
                session.messages.forEach(msg => {
                    project.files!.forEach(file => {
                        if (msg.content.includes(file.name)) {
                            fileUsage[file.name] = (fileUsage[file.name] || 0) + 1;
                        }
                    });
                });
            });

            const mostUsedFiles = Object.entries(fileUsage)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3);

            if (mostUsedFiles.length > 0) {
                patterns.push({
                    type: 'file_usage',
                    pattern: mostUsedFiles,
                    confidence: 0.8,
                    efficiency: mostUsedFiles.length / project.files.length
                });
            }
        }

        return patterns;
    }

    // 지침 준수 패턴 찾기
    private findGuidelinePatterns(project: Project, sessions: ChatSession[]): ProjectPattern[] {
        const patterns: ProjectPattern[] = [];

        if (project.guidelines && project.guidelines.length > 0) {
            const guidelineUsage: { [key: string]: number } = {};

            sessions.forEach(session => {
                session.messages.forEach(msg => {
                    if (Array.isArray(project.guidelines)) {
                        (project.guidelines as Guideline[]).forEach((guideline: Guideline) => {
                            if (msg.content.includes(guideline.title)) {
                                guidelineUsage[guideline.title] = (guidelineUsage[guideline.title] || 0) + 1;
                            }
                        });
                    }
                });
            });

            const followedGuidelines = Object.keys(guidelineUsage).length;
            const complianceRate = followedGuidelines / project.guidelines.length;

            patterns.push({
                type: 'guideline_following',
                pattern: { followedGuidelines, totalGuidelines: project.guidelines.length },
                confidence: 0.85,
                efficiency: complianceRate
            });
        }

        return patterns;
    }

    // 진행 추적 패턴 찾기
    private findProgressPatterns(sessions: ChatSession[]): ProjectPattern[] {
        const patterns: ProjectPattern[] = [];

        const progressKeywords = ['진행', '완료', '단계', '목표', '달성'];
        const progressMessages = sessions.flatMap(s => s.messages)
            .filter(msg => progressKeywords.some(keyword => msg.content.includes(keyword)));

        if (progressMessages.length > 0) {
            patterns.push({
                type: 'progress_tracking',
                pattern: { progressMessages: progressMessages.length, totalMessages: sessions.flatMap(s => s.messages).length },
                confidence: 0.8,
                efficiency: progressMessages.length / sessions.flatMap(s => s.messages).length
            });
        }

        return patterns;
    }

    // 협업 패턴 찾기
    private findCollaborationPatterns(sessions: ChatSession[]): ProjectPattern[] {
        const patterns: ProjectPattern[] = [];

        const collaborationKeywords = ['팀', '협업', '회의', '공유', '검토'];
        const collaborationMessages = sessions.flatMap(s => s.messages)
            .filter(msg => collaborationKeywords.some(keyword => msg.content.includes(keyword)));

        if (collaborationMessages.length > 0) {
            patterns.push({
                type: 'collaboration',
                pattern: { collaborationMessages: collaborationMessages.length, totalMessages: sessions.flatMap(s => s.messages).length },
                confidence: 0.75,
                efficiency: collaborationMessages.length / sessions.flatMap(s => s.messages).length
            });
        }

        return patterns;
    }

    // 일일 패턴 찾기
    private findDailyPatterns(sessions: ChatSession[]): TemporalPattern[] {
        const patterns: TemporalPattern[] = [];

        const hourlyActivity: { [key: number]: number } = {};
        sessions.forEach(session => {
            session.messages.forEach(msg => {
                const hour = new Date(msg.timestamp).getHours();
                hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
            });
        });

        const peakHours = Object.entries(hourlyActivity)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([hour]) => parseInt(hour));

        if (peakHours.length > 0) {
            patterns.push({
                type: 'daily',
                pattern: { peakHours, hourlyActivity },
                confidence: 0.8,
                predictability: 0.7
            });
        }

        return patterns;
    }

    // 주간 패턴 찾기
    private findWeeklyPatterns(sessions: ChatSession[]): TemporalPattern[] {
        const patterns: TemporalPattern[] = [];

        const dailyActivity: { [key: number]: number } = {};
        sessions.forEach(session => {
            session.messages.forEach(msg => {
                const day = new Date(msg.timestamp).getDay();
                dailyActivity[day] = (dailyActivity[day] || 0) + 1;
            });
        });

        const activeDays = Object.entries(dailyActivity)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([day]) => parseInt(day));

        if (activeDays.length > 0) {
            patterns.push({
                type: 'weekly',
                pattern: { activeDays, dailyActivity },
                confidence: 0.75,
                predictability: 0.6
            });
        }

        return patterns;
    }

    // 월간 패턴 찾기
    private findMonthlyPatterns(sessions: ChatSession[]): TemporalPattern[] {
        const patterns: TemporalPattern[] = [];

        const monthlyActivity: { [key: number]: number } = {};
        sessions.forEach(session => {
            session.messages.forEach(msg => {
                const month = new Date(msg.timestamp).getMonth();
                monthlyActivity[month] = (monthlyActivity[month] || 0) + 1;
            });
        });

        const activeMonths = Object.entries(monthlyActivity)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([month]) => parseInt(month));

        if (activeMonths.length > 0) {
            patterns.push({
                type: 'monthly',
                pattern: { activeMonths, monthlyActivity },
                confidence: 0.7,
                predictability: 0.5
            });
        }

        return patterns;
    }

    // 계절적 패턴 찾기
    private findSeasonalPatterns(sessions: ChatSession[]): TemporalPattern[] {
        const patterns: TemporalPattern[] = [];

        const seasonalActivity: { [key: string]: number } = {
            spring: 0, summer: 0, autumn: 0, winter: 0
        };

        sessions.forEach(session => {
            session.messages.forEach(msg => {
                const month = new Date(msg.timestamp).getMonth();
                if (month >= 2 && month <= 4) seasonalActivity.spring++;
                else if (month >= 5 && month <= 7) seasonalActivity.summer++;
                else if (month >= 8 && month <= 10) seasonalActivity.autumn++;
                else seasonalActivity.winter++;
            });
        });

        const peakSeason = Object.entries(seasonalActivity)
            .sort(([, a], [, b]) => b - a)[0];

        if (peakSeason) {
            patterns.push({
                type: 'seasonal',
                pattern: { peakSeason: peakSeason[0], seasonalActivity },
                confidence: 0.6,
                predictability: 0.4
            });
        }

        return patterns;
    }

    // 주제 클러스터링
    private findTopicClusters(sessions: ChatSession[]): SemanticPattern[] {
        const patterns: SemanticPattern[] = [];
        const allMessages = sessions.flatMap(s => s.messages);

        const topics: { [key: string]: number } = {};
        allMessages.forEach(msg => {
            const words = msg.content.toLowerCase().match(/[가-힣]+/g) || [];
            words.forEach(word => {
                if (word.length > 1) {
                    topics[word] = (topics[word] || 0) + 1;
                }
            });
        });

        const topicClusters = Object.entries(topics)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([topic, count]) => ({ topic, count }));

        if (topicClusters.length > 0) {
            patterns.push({
                type: 'topic_clustering',
                pattern: topicClusters,
                confidence: 0.85,
                insights: [
                    `가장 많이 언급된 주제: ${topicClusters[0].topic}`,
                    `총 ${topicClusters.length}개의 주요 주제 클러스터 발견`
                ]
            });
        }

        return patterns;
    }

    // 감정 진행 패턴
    private findSentimentProgressions(sessions: ChatSession[]): SemanticPattern[] {
        const patterns: SemanticPattern[] = [];
        const allMessages = sessions.flatMap(s => s.messages);

        const positiveWords = ['좋다', '훌륭하다', '성공', '개선', '만족'];
        const negativeWords = ['문제', '실패', '어려움', '불만', '위험'];

        const sentimentProgression: { [key: string]: number } = {};
        let messageIndex = 0;

        allMessages.forEach(msg => {
            const content = msg.content.toLowerCase();
            let positiveCount = 0;
            let negativeCount = 0;

            positiveWords.forEach(word => {
                if (content.includes(word)) positiveCount++;
            });
            negativeWords.forEach(word => {
                if (content.includes(word)) negativeCount++;
            });

            const sentiment = positiveCount > negativeCount ? 'positive' :
                negativeCount > positiveCount ? 'negative' : 'neutral';

            sentimentProgression[`message_${messageIndex}`] = sentiment === 'positive' ? 1 :
                sentiment === 'negative' ? -1 : 0;
            messageIndex++;
        });

        patterns.push({
            type: 'sentiment_progression',
            pattern: sentimentProgression,
            confidence: 0.75,
            insights: [
                '감정 변화 추이 분석 완료',
                '전체 대화에서 감정 패턴 식별'
            ]
        });

        return patterns;
    }

    // 의도 진화 패턴
    private findIntentEvolutions(sessions: ChatSession[]): SemanticPattern[] {
        const patterns: SemanticPattern[] = [];
        const allMessages = sessions.flatMap(s => s.messages);

        const intentKeywords = {
            information: ['무엇', '어떻게', '왜', '언제', '어디서'],
            action: ['해주세요', '해보겠습니다', '시작하겠습니다', '진행하겠습니다'],
            confirmation: ['맞나요', '확인', '정말', '진짜'],
            completion: ['완료', '끝', '마무리', '감사합니다']
        };

        const intentEvolution: { [key: string]: string } = {};
        let messageIndex = 0;

        allMessages.forEach(msg => {
            const content = msg.content.toLowerCase();
            let detectedIntent = 'general';

            Object.entries(intentKeywords).forEach(([intent, keywords]) => {
                if (keywords.some(keyword => content.includes(keyword))) {
                    detectedIntent = intent;
                }
            });

            intentEvolution[`message_${messageIndex}`] = detectedIntent;
            messageIndex++;
        });

        patterns.push({
            type: 'intent_evolution',
            pattern: intentEvolution,
            confidence: 0.8,
            insights: [
                '사용자 의도 변화 추적 완료',
                '대화 진행에 따른 의도 진화 패턴 발견'
            ]
        });

        return patterns;
    }

    // 지식 격차 패턴
    private findKnowledgeGaps(sessions: ChatSession[]): SemanticPattern[] {
        const patterns: SemanticPattern[] = [];
        const allMessages = sessions.flatMap(s => s.messages);

        const knowledgeGapIndicators = [
            '모르겠어요', '이해가 안 돼요', '설명해주세요', '어떻게 해야 하나요',
            '잘 모르겠습니다', '도움이 필요합니다', '어려워요', '복잡해요'
        ];

        const gaps: { [key: string]: number } = {};
        allMessages.forEach(msg => {
            if (msg.isUser) {
                knowledgeGapIndicators.forEach(indicator => {
                    if (msg.content.includes(indicator)) {
                        gaps[indicator] = (gaps[indicator] || 0) + 1;
                    }
                });
            }
        });

        const identifiedGaps = Object.entries(gaps)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);

        if (identifiedGaps.length > 0) {
            patterns.push({
                type: 'knowledge_gaps',
                pattern: identifiedGaps,
                confidence: 0.9,
                insights: [
                    `주요 지식 격차 영역: ${identifiedGaps[0][0]}`,
                    `총 ${identifiedGaps.length}개의 지식 격차 패턴 발견`
                ]
            });
        }

        return patterns;
    }

    // 패턴 저장
    private savePatterns(): void {
        try {
            const data = Object.fromEntries(this.patterns);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('패턴 데이터 저장 오류:', error);
        }
    }

    // 패턴 로드
    private loadPatterns(): void {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                this.patterns = new Map(Object.entries(data));
            }
        } catch (error) {
            console.error('패턴 데이터 로드 오류:', error);
        }
    }

    // 전체 패턴 분석 실행
    async runFullPatternAnalysis(
        sessions: ChatSession[],
        project: Project | null
    ): Promise<{
        conversation: ConversationPattern[];
        behavioral: BehavioralPattern[];
        project: ProjectPattern[];
        temporal: TemporalPattern[];
        semantic: SemanticPattern[];
    }> {
        const conversation = await this.recognizeConversationPatterns(sessions);
        const behavioral = await this.recognizeBehavioralPatterns(sessions);
        const projectPatterns = project ? await this.recognizeProjectPatterns(project, sessions) : [];
        const temporal = await this.recognizeTemporalPatterns(sessions);
        const semantic = await this.recognizeSemanticPatterns(sessions);

        return {
            conversation,
            behavioral,
            project: projectPatterns,
            temporal,
            semantic
        };
    }
}

const patternRecognitionEngine = new PatternRecognitionEngine();
export default patternRecognitionEngine;
