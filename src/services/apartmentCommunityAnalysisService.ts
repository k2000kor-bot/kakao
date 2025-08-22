/**
 * 아파트 커뮤니티 분석 서비스
 * 입주민 성향 분석, 댓글 감정 분석, 맞춤형 대응글 생성
 */

export interface ResidentProfile {
    id: string;
    name: string;
    unit: string;
    moveInDate: Date;
    demographics: {
        ageGroup: '20대' | '30대' | '40대' | '50대' | '60대+';
        familyType: '1인가구' | '신혼부부' | '자녀있는가족' | '노부부';
        occupation: string;
        lifestyle: string[];
    };
    communicationStyle: {
        tone: 'formal' | 'casual' | 'friendly' | 'direct';
        frequency: 'high' | 'medium' | 'low';
        topics: string[];
        sentiment: 'positive' | 'neutral' | 'negative';
    };
    concerns: {
        category: string;
        priority: 'high' | 'medium' | 'low';
        description: string;
        frequency: number;
    }[];
    relationships: {
        allies: string[];
        conflicts: string[];
        neutral: string[];
    };
}

export interface CommunityComment {
    id: string;
    authorId: string;
    content: string;
    timestamp: Date;
    category: 'maintenance' | 'noise' | 'parking' | 'security' | 'facilities' | 'general';
    sentiment: {
        score: number; // -1 to 1
        emotion: 'angry' | 'frustrated' | 'concerned' | 'neutral' | 'satisfied' | 'happy';
        intensity: 'low' | 'medium' | 'high';
    };
    topics: string[];
    mentions: string[];
    responses: CommunityResponse[];
}

export interface CommunityResponse {
    id: string;
    originalCommentId: string;
    content: string;
    tone: 'empathetic' | 'informative' | 'diplomatic' | 'assertive';
    strategy: 'acknowledge' | 'explain' | 'apologize' | 'redirect' | 'escalate';
    effectiveness: number; // 0 to 1
    generatedAt: Date;
}

export interface CommunityAnalytics {
    totalResidents: number;
    activeParticipants: number;
    sentimentTrends: {
        date: Date;
        positive: number;
        neutral: number;
        negative: number;
    }[];
    topConcerns: {
        category: string;
        count: number;
        trend: 'increasing' | 'stable' | 'decreasing';
    }[];
    communicationPatterns: {
        peakHours: number[];
        peakDays: string[];
        averageResponseTime: number;
    };
    conflictAreas: {
        topic: string;
        severity: 'low' | 'medium' | 'high';
        involvedResidents: string[];
        resolutionStatus: 'pending' | 'in_progress' | 'resolved';
    }[];
}

class ApartmentCommunityAnalysisService {
    private residents: ResidentProfile[] = [];
    private comments: CommunityComment[] = [];
    private responses: CommunityResponse[] = [];

    constructor() {
        this.initializeMockData();
    }

    // 입주민 프로필 분석
    analyzeResidentProfile(commentHistory: CommunityComment[]): ResidentProfile {
        const demographics = this.inferDemographics(commentHistory);
        const communicationStyle = this.analyzeCommunicationStyle(commentHistory);
        const concerns = this.extractConcerns(commentHistory);
        const relationships = this.analyzeRelationships(commentHistory);

        return {
            id: this.generateId(),
            name: '익명 입주민',
            unit: '000호',
            moveInDate: new Date(),
            demographics,
            communicationStyle,
            concerns,
            relationships
        };
    }

    // 댓글 감정 분석
    analyzeSentiment(comment: string): CommunityComment['sentiment'] {
        // 감정 키워드 분석
        const emotionKeywords = {
            angry: ['화나', '짜증', '분노', '열받', '빡쳐', '미치겠'],
            frustrated: ['답답', '막막', '스트레스', '힘들', '지쳐'],
            concerned: ['걱정', '우려', '불안', '염려', '신경'],
            satisfied: ['만족', '좋아', '괜찮', '다행', '감사'],
            happy: ['기뻐', '행복', '즐거', '신나', '좋다', '최고']
        };

        let maxScore = 0;
        let dominantEmotion: CommunityComment['sentiment']['emotion'] = 'neutral';

        Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
            const score = keywords.reduce((sum, keyword) => {
                return sum + (comment.includes(keyword) ? 1 : 0);
            }, 0);

            if (score > maxScore) {
                maxScore = score;
                dominantEmotion = emotion as CommunityComment['sentiment']['emotion'];
            }
        });

        // 감정 강도 계산
        const intensity = maxScore >= 3 ? 'high' : maxScore >= 1 ? 'medium' : 'low';

        // 감정 점수 계산 (-1 to 1)
        const sentimentScore = dominantEmotion === 'neutral' ? 0 :
            dominantEmotion === 'positive' ? 0.6 :
                dominantEmotion === 'negative' ? -0.8 : 0;

        return {
            score: sentimentScore,
            emotion: dominantEmotion,
            intensity
        };
    }

    // 맞춤형 대응글 생성
    generateResponse(comment: CommunityComment, residentProfile: ResidentProfile): CommunityResponse {
        const strategy = this.determineResponseStrategy(comment, residentProfile);
        const tone = this.selectResponseTone(residentProfile.communicationStyle, comment.sentiment);
        const content = this.generateResponseContent(comment, strategy, tone);

        return {
            id: this.generateId(),
            originalCommentId: comment.id,
            content,
            tone,
            strategy,
            effectiveness: this.predictEffectiveness(strategy, tone, residentProfile),
            generatedAt: new Date()
        };
    }

    // 커뮤니티 분석 대시보드 데이터
    getCommunityAnalytics(): CommunityAnalytics {
        return {
            totalResidents: this.residents.length,
            activeParticipants: this.residents.filter(r => r.communicationStyle.frequency !== 'low').length,
            sentimentTrends: this.generateSentimentTrends(),
            topConcerns: this.getTopConcerns(),
            communicationPatterns: this.analyzeCommunicationPatterns(),
            conflictAreas: this.identifyConflictAreas()
        };
    }

    // 주제별 댓글 분류
    categorizeComment(content: string): CommunityComment['category'] {
        const categoryKeywords = {
            maintenance: ['수리', '고장', '누수', '엘리베이터', '보일러', '전기', '배관'],
            noise: ['소음', '시끄러', '층간소음', '발소리', '음악', '텔레비전'],
            parking: ['주차', '차량', '주차장', '주차비', '주차공간'],
            security: ['보안', '출입', '경비', 'CCTV', '안전', '도난'],
            facilities: ['헬스장', '수영장', '놀이터', '커뮤니티', '시설', '편의시설']
        };

        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(keyword => content.includes(keyword))) {
                return category as CommunityComment['category'];
            }
        }

        return 'general';
    }

    // 개인화된 커뮤니케이션 전략 추천
    getPersonalizedStrategy(residentId: string): {
        preferredTone: string;
        effectiveTopics: string[];
        avoidanceTopics: string[];
        bestContactTime: string;
        communicationTips: string[];
    } {
        const resident = this.residents.find(r => r.id === residentId);
        if (!resident) {
            return this.getDefaultStrategy();
        }

        return {
            preferredTone: this.getPreferredTone(resident),
            effectiveTopics: this.getEffectiveTopics(resident),
            avoidanceTopics: this.getAvoidanceTopics(resident),
            bestContactTime: this.getBestContactTime(resident),
            communicationTips: this.getCommunicationTips(resident)
        };
    }

    // Private helper methods
    private initializeMockData(): void {
        // 목업 입주민 데이터
        this.residents = [
            {
                id: '1',
                name: '김철수',
                unit: '101호',
                moveInDate: new Date('2023-03-15'),
                demographics: {
                    ageGroup: '40대',
                    familyType: '자녀있는가족',
                    occupation: '회사원',
                    lifestyle: ['조용한생활', '규칙적인생활']
                },
                communicationStyle: {
                    tone: 'formal',
                    frequency: 'medium',
                    topics: ['소음문제', '주차문제'],
                    sentiment: 'neutral'
                },
                concerns: [
                    {
                        category: '층간소음',
                        priority: 'high',
                        description: '위층 발소리가 심함',
                        frequency: 5
                    }
                ],
                relationships: {
                    allies: ['2'],
                    conflicts: ['3'],
                    neutral: ['4', '5']
                }
            },
            {
                id: '2',
                name: '이영희',
                unit: '201호',
                moveInDate: new Date('2023-01-10'),
                demographics: {
                    ageGroup: '30대',
                    familyType: '신혼부부',
                    occupation: '프리랜서',
                    lifestyle: ['활동적인생활', '소셜라이프']
                },
                communicationStyle: {
                    tone: 'friendly',
                    frequency: 'high',
                    topics: ['커뮤니티활동', '시설개선'],
                    sentiment: 'positive'
                },
                concerns: [
                    {
                        category: '시설개선',
                        priority: 'medium',
                        description: '헬스장 시설 노후화',
                        frequency: 3
                    }
                ],
                relationships: {
                    allies: ['1', '4'],
                    conflicts: [],
                    neutral: ['3', '5']
                }
            }
        ];

        // 목업 댓글 데이터
        this.comments = [
            {
                id: '1',
                authorId: '1',
                content: '위층에서 밤늦게까지 발소리가 너무 심합니다. 아이가 잠을 못 자서 정말 힘들어요.',
                timestamp: new Date('2024-01-15T22:30:00'),
                category: 'noise',
                sentiment: {
                    score: -0.7,
                    emotion: 'frustrated',
                    intensity: 'high'
                },
                topics: ['층간소음', '수면방해'],
                mentions: [],
                responses: []
            },
            {
                id: '2',
                authorId: '2',
                content: '헬스장 런닝머신이 고장 났는데 언제 수리되나요? 관리사무소에서 답변 부탁드립니다.',
                timestamp: new Date('2024-01-16T09:15:00'),
                category: 'facilities',
                sentiment: {
                    score: -0.2,
                    emotion: 'concerned',
                    intensity: 'medium'
                },
                topics: ['헬스장', '시설수리'],
                mentions: ['관리사무소'],
                responses: []
            }
        ];
    }

    private inferDemographics(comments: CommunityComment[]): ResidentProfile['demographics'] {
        // 댓글 내용으로부터 인구통계학적 정보 추론
        const content = comments.map(c => c.content).join(' ');

        let ageGroup: ResidentProfile['demographics']['ageGroup'] = '30대';
        let familyType: ResidentProfile['demographics']['familyType'] = '1인가구';

        // 연령대 추론
        if (content.includes('아이') || content.includes('자녀')) {
            ageGroup = '40대';
            familyType = '자녀있는가족';
        } else if (content.includes('신혼') || content.includes('결혼')) {
            ageGroup = '30대';
            familyType = '신혼부부';
        }

        return {
            ageGroup,
            familyType,
            occupation: '추정불가',
            lifestyle: this.inferLifestyle(content)
        };
    }

    private inferLifestyle(content: string): string[] {
        const lifestyle: string[] = [];

        if (content.includes('조용') || content.includes('소음')) {
            lifestyle.push('조용한생활선호');
        }
        if (content.includes('운동') || content.includes('헬스')) {
            lifestyle.push('건강관리');
        }
        if (content.includes('커뮤니티') || content.includes('모임')) {
            lifestyle.push('사교적');
        }

        return lifestyle.length > 0 ? lifestyle : ['일반적'];
    }

    private analyzeCommunicationStyle(comments: CommunityComment[]): ResidentProfile['communicationStyle'] {
        const totalComments = comments.length;
        const avgSentiment = comments.reduce((sum, c) => sum + c.sentiment.score, 0) / totalComments;

        // 어조 분석
        const formalWords = ['습니다', '드립니다', '해주세요'];
        const casualWords = ['해요', '이에요', '그래요'];

        const content = comments.map(c => c.content).join(' ');
        const formalCount = formalWords.reduce((sum, word) => sum + (content.split(word).length - 1), 0);
        const casualCount = casualWords.reduce((sum, word) => sum + (content.split(word).length - 1), 0);

        const tone = formalCount > casualCount ? 'formal' : 'casual';
        const frequency = totalComments > 10 ? 'high' : totalComments > 5 ? 'medium' : 'low';
        const sentiment = avgSentiment > 0.3 ? 'positive' : avgSentiment < -0.3 ? 'negative' : 'neutral';

        return {
            tone,
            frequency,
            topics: this.extractTopics(comments),
            sentiment
        };
    }

    private extractTopics(comments: CommunityComment[]): string[] {
        const topicCounts: { [key: string]: number } = {};

        comments.forEach(comment => {
            comment.topics.forEach(topic => {
                topicCounts[topic] = (topicCounts[topic] || 0) + 1;
            });
        });

        return Object.entries(topicCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([topic]) => topic);
    }

    private extractConcerns(comments: CommunityComment[]): ResidentProfile['concerns'] {
        const concernMap: { [key: string]: { count: number; priority: 'high' | 'medium' | 'low' } } = {};

        comments.forEach(comment => {
            const priority = comment.sentiment.intensity === 'high' ? 'high' :
                comment.sentiment.intensity === 'medium' ? 'medium' : 'low';

            if (concernMap[comment.category]) {
                concernMap[comment.category].count++;
            } else {
                concernMap[comment.category] = { count: 1, priority };
            }
        });

        return Object.entries(concernMap).map(([category, data]) => ({
            category,
            priority: data.priority,
            description: `${category} 관련 문제`,
            frequency: data.count
        }));
    }

    private analyzeRelationships(comments: CommunityComment[]): ResidentProfile['relationships'] {
        // 간단한 관계 분석 (실제로는 더 복잡한 네트워크 분석 필요)
        return {
            allies: [],
            conflicts: [],
            neutral: []
        };
    }

    private determineResponseStrategy(comment: CommunityComment, profile: ResidentProfile): CommunityResponse['strategy'] {
        if (comment.sentiment.emotion === 'angry' || comment.sentiment.emotion === 'frustrated') {
            return 'acknowledge';
        } else if (comment.category === 'maintenance' || comment.category === 'facilities') {
            return 'explain';
        } else if (comment.sentiment.score < -0.5) {
            return 'apologize';
        } else {
            return 'acknowledge';
        }
    }

    private selectResponseTone(style: ResidentProfile['communicationStyle'], sentiment: CommunityComment['sentiment']): CommunityResponse['tone'] {
        if (sentiment.emotion === 'angry') {
            return 'empathetic';
        } else if (style.tone === 'formal') {
            return 'diplomatic';
        } else {
            return 'informative';
        }
    }

    private generateResponseContent(comment: CommunityComment, strategy: CommunityResponse['strategy'], tone: CommunityResponse['tone']): string {
        const templates = {
            acknowledge: {
                empathetic: "말씀해주신 불편함을 충분히 이해합니다. 빠른 시일 내에 해결방안을 마련하겠습니다.",
                diplomatic: "입주민님의 의견을 소중히 받아들이며, 관련 부서와 협의하여 개선방안을 검토하겠습니다.",
                informative: "해당 문제에 대해 확인 후 적절한 조치를 취하겠습니다."
            },
            explain: {
                empathetic: "현재 상황을 설명드리면, 해당 시설은 정기점검 중이며 곧 정상화될 예정입니다.",
                diplomatic: "관련 규정에 따라 절차를 진행하고 있으며, 자세한 일정을 안내드리겠습니다.",
                informative: "해당 사안은 다음과 같은 절차로 처리됩니다: 1) 접수 2) 검토 3) 조치 4) 완료보고"
            },
            apologize: {
                empathetic: "불편을 끼쳐드려 진심으로 죄송합니다. 재발방지를 위해 최선을 다하겠습니다.",
                diplomatic: "관리상의 미흡함으로 인한 불편에 대해 사과드리며, 개선방안을 마련하겠습니다.",
                informative: "해당 문제로 인한 불편에 대해 사과드리며, 빠른 해결을 위해 노력하겠습니다."
            }
        };

        return templates[strategy]?.[tone] || "감사합니다. 검토 후 답변드리겠습니다.";
    }

    private predictEffectiveness(strategy: CommunityResponse['strategy'], tone: CommunityResponse['tone'], profile: ResidentProfile): number {
        let effectiveness = 0.5; // 기본값

        // 전략과 프로필 매칭
        if (strategy === 'acknowledge' && profile.communicationStyle.sentiment === 'negative') {
            effectiveness += 0.3;
        }

        // 어조와 프로필 매칭
        if (tone === 'diplomatic' && profile.communicationStyle.tone === 'formal') {
            effectiveness += 0.2;
        }

        return Math.min(effectiveness, 1.0);
    }

    private generateSentimentTrends(): CommunityAnalytics['sentimentTrends'] {
        const trends: CommunityAnalytics['sentimentTrends'] = [];
        const now = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);

            trends.push({
                date,
                positive: Math.random() * 0.4 + 0.2,
                neutral: Math.random() * 0.4 + 0.3,
                negative: Math.random() * 0.3 + 0.1
            });
        }

        return trends;
    }

    private getTopConcerns(): CommunityAnalytics['topConcerns'] {
        return [
            { category: '층간소음', count: 15, trend: 'increasing' },
            { category: '주차문제', count: 12, trend: 'stable' },
            { category: '시설관리', count: 8, trend: 'decreasing' },
            { category: '보안', count: 5, trend: 'stable' }
        ];
    }

    private analyzeCommunicationPatterns(): CommunityAnalytics['communicationPatterns'] {
        return {
            peakHours: [9, 12, 18, 21], // 9시, 12시, 18시, 21시
            peakDays: ['월요일', '수요일', '금요일'],
            averageResponseTime: 4.5 // 시간
        };
    }

    private identifyConflictAreas(): CommunityAnalytics['conflictAreas'] {
        return [
            {
                topic: '층간소음',
                severity: 'high',
                involvedResidents: ['1', '3', '7'],
                resolutionStatus: 'in_progress'
            },
            {
                topic: '주차공간',
                severity: 'medium',
                involvedResidents: ['2', '5'],
                resolutionStatus: 'pending'
            }
        ];
    }

    private getDefaultStrategy() {
        return {
            preferredTone: '정중한 어조',
            effectiveTopics: ['시설개선', '커뮤니티활동'],
            avoidanceTopics: ['개인적인 문제'],
            bestContactTime: '오전 9-11시, 오후 2-5시',
            communicationTips: ['명확한 정보 제공', '신속한 응답', '정기적인 업데이트']
        };
    }

    private getPreferredTone(resident: ResidentProfile): string {
        return resident.communicationStyle.tone === 'formal' ? '정중하고 격식있는 어조' : '친근하고 편안한 어조';
    }

    private getEffectiveTopics(resident: ResidentProfile): string[] {
        return resident.communicationStyle.topics;
    }

    private getAvoidanceTopics(resident: ResidentProfile): string[] {
        return resident.concerns
            .filter(c => c.priority === 'high')
            .map(c => c.category);
    }

    private getBestContactTime(resident: ResidentProfile): string {
        return resident.communicationStyle.frequency === 'high' ?
            '언제든지' : '업무시간 내 (9-18시)';
    }

    private getCommunicationTips(resident: ResidentProfile): string[] {
        const tips = ['명확한 정보 제공'];

        if (resident.communicationStyle.sentiment === 'negative') {
            tips.push('공감적 접근', '해결방안 우선 제시');
        }

        if (resident.communicationStyle.tone === 'formal') {
            tips.push('격식있는 표현 사용');
        }

        return tips;
    }

    private generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }

    // Public methods for external access
    public getResidents(): ResidentProfile[] {
        return this.residents;
    }

    public getComments(): CommunityComment[] {
        return this.comments;
    }

    public getResponses(): CommunityResponse[] {
        return this.responses;
    }

    public addComment(comment: Omit<CommunityComment, 'id' | 'sentiment' | 'topics'>): CommunityComment {
        const sentiment = this.analyzeSentiment(comment.content);
        const category = this.categorizeComment(comment.content);
        const topics = this.extractTopicsFromContent(comment.content);

        const newComment: CommunityComment = {
            ...comment,
            id: this.generateId(),
            category,
            sentiment,
            topics,
            responses: []
        };

        this.comments.push(newComment);
        return newComment;
    }

    private extractTopicsFromContent(content: string): string[] {
        const topicKeywords = {
            '층간소음': ['소음', '시끄러', '발소리'],
            '주차': ['주차', '차량', '주차장'],
            '시설': ['시설', '헬스장', '수영장'],
            '보안': ['보안', '출입', '경비'],
            '관리비': ['관리비', '요금', '비용']
        };

        const topics: string[] = [];
        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
            if (keywords.some(keyword => content.includes(keyword))) {
                topics.push(topic);
            }
        });

        return topics;
    }
}

export const apartmentCommunityAnalysisService = new ApartmentCommunityAnalysisService();
