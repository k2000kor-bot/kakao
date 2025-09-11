/**
 * CORBU AI 댓글 생성 및 반박글 시스템
 * 게시글에 대한 다양한 형태의 댓글과 반박글을 생성하는 고도화된 시스템
 */

import { socialMediaInteractionEngine } from './socialMediaInteractionEngine';
import { advancedWritingCognitiveEngine } from './advancedWritingCognitiveEngine';

export interface CommentGenerationRequest {
    originalPost: string;
    commentType: 'supportive' | 'critical' | 'questioning' | 'informative' | 'humorous' | 'personal_experience';
    tone: 'respectful' | 'casual' | 'formal' | 'passionate' | 'analytical' | 'empathetic';
    persona?: {
        age: '10s' | '20s' | '30s' | '40s' | '50s' | '60s+';
        background: string;
        expertise: string[];
        personality: string[];
    };
    engagement_goal: 'start_discussion' | 'provide_support' | 'offer_alternative' | 'seek_clarification' | 'share_experience' | 'challenge_respectfully';
    platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'community' | 'blog';
    length: 'short' | 'medium' | 'long';
}

export interface RebuttalRequest {
    originalPost: string;
    rebuttalType: 'logical_counter' | 'evidence_based' | 'experiential' | 'ethical_concern' | 'practical_issue' | 'alternative_solution';
    strength: 'gentle_disagreement' | 'moderate_opposition' | 'strong_counter' | 'complete_refutation';
    approach: 'respectful_discourse' | 'academic_debate' | 'passionate_advocacy' | 'fact_checking' | 'personal_testimony';
    target_weakness?: string[];
    supporting_evidence?: string[];
    maintain_civility: boolean;
}

export interface ConversationContext {
    previousComments: string[];
    currentTrend: string[];
    communityNorms: string[];
    sensitiveTopics: string[];
    moderationGuidelines: string[];
}

export interface CommentVariations {
    mainComment: string;
    variations: {
        shorter: string;
        longer: string;
        different_tone: string;
        different_angle: string;
        more_personal: string;
    };
    hashtagSuggestions: string[];
    mentionSuggestions: string[];
    followUpQuestions: string[];
}

export interface RebuttalAnalysis {
    originalPostAnalysis: {
        mainClaims: string[];
        logicalStructure: string[];
        evidenceQuality: number;
        emotionalContent: string[];
        potentialWeaknesses: string[];
    };
    rebuttalStrategy: {
        primaryApproach: string;
        keyArguments: string[];
        evidenceToPresent: string[];
        rhetoricalTechniques: string[];
    };
    riskAssessment: {
        controversyLevel: number;
        backfireRisk: number;
        misinterpretationRisk: number;
        relationshipImpact: number;
    };
}

class CommentAndRebuttalSystem {
    private commentTemplates: Map<string, any> = new Map();
    private rebuttalStrategies: Map<string, any> = new Map();
    private platformGuidelines: Map<string, any> = new Map();
    private personaProfiles: Map<string, any> = new Map();

    constructor() {
        this.initializeCommentTemplates();
        this.initializeRebuttalStrategies();
        this.initializePlatformGuidelines();
        this.initializePersonaProfiles();
    }

    /**
     * 고도화된 댓글 생성
     */
    public async generateAdvancedComment(
        request: CommentGenerationRequest,
        context?: ConversationContext
    ): Promise<{
        comment: CommentVariations;
        analysis: {
            appropriateness: number;
            engagement_potential: number;
            risk_level: number;
            platform_optimization: number;
        };
        suggestions: {
            timing: string;
            engagement_tactics: string[];
            follow_up_strategy: string;
        };
        alternatives: string[];
    }> {
        try {
            console.log('💬 고도화된 댓글 생성 시작...', { 
                type: request.commentType, 
                platform: request.platform 
            });

            // 원본 게시글 심층 분석
            const postAnalysis = await this.analyzePostForComment(request.originalPost, request.platform);
            
            // 페르소나 적용
            const activePersona = await this.applyPersona(request.persona, request.commentType);
            
            // 플랫폼별 최적화 설정
            const platformSettings = this.getPlatformCommentGuidelines(request.platform);
            
            // 메인 댓글 생성
            const mainComment = await this.generateMainComment(
                request, 
                postAnalysis, 
                activePersona, 
                platformSettings,
                context
            );
            
            // 댓글 변형 생성
            const variations = await this.generateCommentVariations(mainComment, request, activePersona);
            
            // 해시태그 및 멘션 제안
            const hashtagSuggestions = await this.generateHashtagSuggestions(request, postAnalysis);
            const mentionSuggestions = await this.generateMentionSuggestions(request, context);
            
            // 후속 질문 생성
            const followUpQuestions = await this.generateFollowUpQuestions(request, postAnalysis);
            
            // 댓글 품질 분석
            const qualityAnalysis = await this.analyzeCommentQuality(
                mainComment, 
                request, 
                postAnalysis, 
                platformSettings
            );
            
            // 참여 전략 제안
            const engagementSuggestions = await this.generateEngagementSuggestions(
                request, 
                postAnalysis, 
                qualityAnalysis
            );
            
            // 대안 댓글들
            const alternatives = await this.generateAlternativeComments(request, postAnalysis, 3);

            return {
                comment: {
                    mainComment,
                    variations,
                    hashtagSuggestions,
                    mentionSuggestions,
                    followUpQuestions
                },
                analysis: qualityAnalysis,
                suggestions: engagementSuggestions,
                alternatives
            };

        } catch (error) {
            console.error('❌ 고도화된 댓글 생성 실패:', error);
            throw new Error('고도화된 댓글 생성에 실패했습니다.');
        }
    }

    /**
     * 지능형 반박글 생성
     */
    public async generateIntelligentRebuttal(
        request: RebuttalRequest,
        context?: ConversationContext
    ): Promise<{
        rebuttal: {
            main: string;
            structured: {
                introduction: string;
                arguments: string[];
                evidence: string[];
                conclusion: string;
            };
            variations: string[];
        };
        analysis: RebuttalAnalysis;
        effectiveness: {
            persuasion_score: number;
            logic_score: number;
            evidence_score: number;
            civility_score: number;
        };
        strategy: {
            approach_rationale: string;
            key_tactics: string[];
            expected_responses: string[];
            counter_preparations: string[];
        };
    }> {
        try {
            console.log('⚔️ 지능형 반박글 생성 시작...', { 
                type: request.rebuttalType, 
                strength: request.strength 
            });

            // 원본 게시글 논리 구조 분석
            const originalAnalysis = await this.analyzePostForRebuttal(request.originalPost);
            
            // 반박 전략 수립
            const rebuttalStrategy = await this.developRebuttalStrategy(
                request, 
                originalAnalysis, 
                context
            );
            
            // 구조화된 반박글 생성
            const structuredRebuttal = await this.generateStructuredRebuttal(
                request, 
                originalAnalysis, 
                rebuttalStrategy
            );
            
            // 메인 반박글 작성
            const mainRebuttal = await this.composeMainRebuttal(structuredRebuttal, request);
            
            // 반박글 변형 생성
            const rebuttalVariations = await this.generateRebuttalVariations(
                mainRebuttal, 
                request, 
                rebuttalStrategy
            );
            
            // 효과성 분석
            const effectiveness = await this.analyzeRebuttalEffectiveness(
                mainRebuttal, 
                request.originalPost, 
                request
            );
            
            // 전략 분석 및 제안
            const strategyAnalysis = await this.analyzeRebuttalStrategy(
                rebuttalStrategy, 
                originalAnalysis, 
                effectiveness
            );

            return {
                rebuttal: {
                    main: mainRebuttal,
                    structured: structuredRebuttal,
                    variations: rebuttalVariations
                },
                analysis: {
                    originalPostAnalysis: originalAnalysis,
                    rebuttalStrategy,
                    riskAssessment: await this.assessRebuttalRisks(mainRebuttal, request, context)
                },
                effectiveness,
                strategy: strategyAnalysis
            };

        } catch (error) {
            console.error('❌ 지능형 반박글 생성 실패:', error);
            throw new Error('지능형 반박글 생성에 실패했습니다.');
        }
    }

    /**
     * 대화형 댓글 체인 생성
     */
    public async generateCommentChain(
        originalPost: string,
        chainLength: number,
        conversationGoal: 'constructive_debate' | 'information_sharing' | 'community_building' | 'problem_solving',
        participants: { name: string; persona: any; position: string }[]
    ): Promise<{
        chain: {
            participant: string;
            comment: string;
            timestamp: string;
            responses_to: string | null;
            engagement_tactics: string[];
        }[];
        narrative: {
            conversation_arc: string;
            key_developments: string[];
            resolution_points: string[];
        };
        insights: {
            productive_elements: string[];
            potential_improvements: string[];
            community_impact: string;
        };
    }> {
        try {
            console.log('🔗 대화형 댓글 체인 생성...', { 
                length: chainLength, 
                goal: conversationGoal 
            });

            const chain: any[] = [];
            let currentContext = originalPost;

            // 초기 댓글 생성
            for (let i = 0; i < Math.min(chainLength, participants.length); i++) {
                const participant = participants[i];
                
                const commentRequest: CommentGenerationRequest = {
                    originalPost: currentContext,
                    commentType: this.determineCommentType(participant.position, conversationGoal),
                    tone: this.determinePersonaTone(participant.persona),
                    persona: participant.persona,
                    engagement_goal: this.mapConversationGoal(conversationGoal),
                    platform: 'community',
                    length: 'medium'
                };

                const commentResult = await this.generateAdvancedComment(commentRequest);
                
                chain.push({
                    participant: participant.name,
                    comment: commentResult.comment.mainComment,
                    timestamp: new Date(Date.now() + i * 1000 * 60 * 5).toISOString(), // 5분 간격
                    responses_to: i === 0 ? null : chain[Math.floor(Math.random() * i)].participant,
                    engagement_tactics: commentResult.suggestions.engagement_tactics
                });

                // 컨텍스트 업데이트
                currentContext += `\n\n댓글: ${commentResult.comment.mainComment}`;
            }

            // 대화 흐름 분석
            const narrative = await this.analyzeConversationNarrative(chain, conversationGoal);
            
            // 인사이트 추출
            const insights = await this.extractConversationInsights(chain, narrative);

            return {
                chain,
                narrative,
                insights
            };

        } catch (error) {
            console.error('❌ 댓글 체인 생성 실패:', error);
            throw new Error('댓글 체인 생성에 실패했습니다.');
        }
    }

    /**
     * 실시간 댓글 모니터링 및 응답 제안
     */
    public async monitorAndSuggestResponses(
        originalPost: string,
        incomingComments: string[],
        responseStrategy: 'engage_all' | 'selective_engagement' | 'defensive' | 'promotional'
    ): Promise<{
        commentAnalysis: {
            comment: string;
            sentiment: string;
            intent: string;
            engagement_value: number;
            response_priority: number;
        }[];
        responseRecommendations: {
            comment: string;
            suggested_response: string;
            response_type: string;
            timing_advice: string;
            risk_level: number;
        }[];
        overallStrategy: {
            engagement_approach: string;
            key_messages: string[];
            tone_guidance: string;
            escalation_protocols: string[];
        };
    }> {
        try {
            console.log('👁️ 실시간 댓글 모니터링...', { 
                commentCount: incomingComments.length, 
                strategy: responseStrategy 
            });

            // 각 댓글 분석
            const commentAnalysis = await Promise.all(
                incomingComments.map(async (comment) => {
                    const sentiment = await this.analyzeSentiment(comment);
                    const intent = await this.analyzeCommentIntent(comment, originalPost);
                    const engagementValue = await this.calculateEngagementValue(comment, originalPost);
                    const priority = this.calculateResponsePriority(sentiment, intent, engagementValue, responseStrategy);

                    return {
                        comment,
                        sentiment,
                        intent,
                        engagement_value: engagementValue,
                        response_priority: priority
                    };
                })
            );

            // 응답 우선순위별 정렬
            const prioritizedComments = commentAnalysis.sort((a, b) => b.response_priority - a.response_priority);

            // 각 우선순위 댓글에 대한 응답 제안
            const responseRecommendations = await Promise.all(
                prioritizedComments.slice(0, 5).map(async (analysis) => {
                    const responseType = this.determineResponseType(analysis, responseStrategy);
                    const suggestedResponse = await this.generateResponseSuggestion(
                        originalPost,
                        analysis.comment,
                        responseType,
                        responseStrategy
                    );
                    const timing = this.recommendResponseTiming(analysis);
                    const riskLevel = this.assessResponseRisk(analysis, responseType);

                    return {
                        comment: analysis.comment,
                        suggested_response: suggestedResponse,
                        response_type: responseType,
                        timing_advice: timing,
                        risk_level: riskLevel
                    };
                })
            );

            // 전체 전략 수립
            const overallStrategy = await this.developOverallResponseStrategy(
                commentAnalysis,
                responseStrategy,
                originalPost
            );

            return {
                commentAnalysis,
                responseRecommendations,
                overallStrategy
            };

        } catch (error) {
            console.error('❌ 댓글 모니터링 실패:', error);
            throw new Error('댓글 모니터링에 실패했습니다.');
        }
    }

    // ============================
    // 초기화 메서드들
    // ============================

    private initializeCommentTemplates(): void {
        this.commentTemplates.set('supportive', {
            openings: ['정말 공감이 갑니다!', '좋은 말씀이네요!', '완전 동의해요!'],
            connectors: ['특히...', '더 나아가...', '저도 비슷한 경험이...'],
            closings: ['응원합니다!', '함께 해보아요!', '좋은 하루 되세요!'],
            tone_markers: {
                casual: ['ㅎㅎ', '😊', '👍'],
                formal: ['입니다', '했습니다', '바랍니다'],
                passionate: ['정말로!', '진심으로!', '절대적으로!']
            }
        });

        this.commentTemplates.set('critical', {
            openings: ['다른 관점에서 보면...', '한 가지 의문이...', '조금 다르게 생각해보면...'],
            connectors: ['하지만...', '반면에...', '그런데...'],
            closings: ['어떻게 생각하시나요?', '다른 의견도 들어보고 싶습니다.', '더 논의해보면 좋겠어요.'],
            tone_markers: {
                respectful: ['죄송하지만', '실례합니다만', '정중히'],
                analytical: ['분석해보면', '데이터를 보면', '논리적으로'],
                diplomatic: ['양해 부탁드리며', '신중하게', '균형있게']
            }
        });

        this.commentTemplates.set('questioning', {
            openings: ['궁금한 점이 있어서요...', '혹시...', '더 알고 싶은데...'],
            connectors: ['그렇다면...', '만약에...', '구체적으로...'],
            closings: ['답변 부탁드려요!', '의견 나눠주세요!', '더 알려주세요!'],
            tone_markers: {
                curious: ['정말 궁금해요!', '너무 흥미로워요!', '더 자세히!'],
                academic: ['연구 목적으로', '학습 차원에서', '이해를 위해'],
                friendly: ['편하게', '부담없이', '자유롭게']
            }
        });
    }

    private initializeRebuttalStrategies(): void {
        this.rebuttalStrategies.set('logical_counter', {
            structure: ['전제 검토', '논리적 허점 지적', '대안 논리 제시', '결론 도출'],
            techniques: ['삼단논법 검증', '인과관계 분석', '논리적 비약 지적', '반례 제시'],
            evidence_types: ['논리적 증명', '반박 사례', '논문 인용', '전문가 의견'],
            tone_guidelines: {
                respectful: '정중한 학술적 토론',
                assertive: '확신에 찬 논리적 반박',
                analytical: '냉정한 분석적 접근'
            }
        });

        this.rebuttalStrategies.set('evidence_based', {
            structure: ['현재 주장 요약', '반박 증거 제시', '증거 해석', '새로운 결론'],
            techniques: ['팩트 체크', '데이터 분석', '연구 결과 인용', '통계적 반박'],
            evidence_types: ['과학적 연구', '공식 통계', '권위있는 자료', '검증된 사실'],
            tone_guidelines: {
                authoritative: '권위있는 전문가적 접근',
                objective: '객관적 사실 중심',
                educational: '교육적 정보 제공'
            }
        });

        this.rebuttalStrategies.set('experiential', {
            structure: ['개인 경험 소개', '경험과 주장 대조', '경험의 의미', '대안 제시'],
            techniques: ['체험담 공유', '사례 연구', '현장 경험', '실무적 관점'],
            evidence_types: ['개인 사례', '현장 경험', '실무 지식', '관찰 결과'],
            tone_guidelines: {
                personal: '개인적이고 진솔한',
                empathetic: '공감적이고 이해하는',
                practical: '실용적이고 현실적인'
            }
        });
    }

    private initializePlatformGuidelines(): void {
        this.platformGuidelines.set('facebook', {
            comment_length: { min: 10, optimal: 100, max: 8000 },
            tone_preference: 'friendly_conversational',
            engagement_features: ['likes', 'replies', 'shares', 'reactions'],
            cultural_norms: ['family_friendly', 'community_focused', 'personal_sharing'],
            moderation_level: 'moderate'
        });

        this.platformGuidelines.set('twitter', {
            comment_length: { min: 5, optimal: 80, max: 280 },
            tone_preference: 'witty_concise',
            engagement_features: ['likes', 'retweets', 'replies', 'quotes'],
            cultural_norms: ['brevity', 'trending_awareness', 'real_time'],
            moderation_level: 'high'
        });

        this.platformGuidelines.set('linkedin', {
            comment_length: { min: 20, optimal: 150, max: 1300 },
            tone_preference: 'professional_insightful',
            engagement_features: ['likes', 'comments', 'shares', 'connections'],
            cultural_norms: ['professional', 'value_adding', 'network_building'],
            moderation_level: 'high'
        });

        this.platformGuidelines.set('instagram', {
            comment_length: { min: 5, optimal: 50, max: 2200 },
            tone_preference: 'visual_supportive',
            engagement_features: ['likes', 'comments', 'story_reactions', 'dm'],
            cultural_norms: ['visual_first', 'lifestyle_focused', 'hashtag_culture'],
            moderation_level: 'moderate'
        });
    }

    private initializePersonaProfiles(): void {
        this.personaProfiles.set('20s_student', {
            vocabulary_level: 'casual_modern',
            reference_points: ['학교', '과제', '미래', '꿈', '친구'],
            communication_style: 'enthusiastic_questioning',
            values: ['성장', '경험', '도전', '소통'],
            typical_concerns: ['진로', '관계', '경제', '사회문제']
        });

        this.personaProfiles.set('30s_professional', {
            vocabulary_level: 'professional_balanced',
            reference_points: ['직장', '커리어', '가정', '효율성'],
            communication_style: 'practical_analytical',
            values: ['성취', '안정', '발전', '균형'],
            typical_concerns: ['승진', '육아', '투자', '건강']
        });

        this.personaProfiles.set('40s_manager', {
            vocabulary_level: 'formal_experienced',
            reference_points: ['경영', '리더십', '책임', '성과'],
            communication_style: 'authoritative_mentoring',
            values: ['책임', '성과', '지속성', '멘토링'],
            typical_concerns: ['조직관리', '결과', '부하직원', '미래전략']
        });

        this.personaProfiles.set('50s_expert', {
            vocabulary_level: 'sophisticated_nuanced',
            reference_points: ['경험', '전문성', '지혜', '조언'],
            communication_style: 'wise_reflective',
            values: ['전문성', '경험', '조언', '전수'],
            typical_concerns: ['후배양성', '지식전수', '사회기여', '은퇴준비']
        });
    }

    // ============================
    // 핵심 분석 메서드들
    // ============================

    private async analyzePostForComment(post: string, platform: string): Promise<any> {
        return {
            main_topic: this.extractMainTopic(post),
            emotional_tone: await this.analyzeSentiment(post),
            engagement_level: this.calculatePostEngagement(post),
            controversy_level: this.detectControversy(post),
            discussion_potential: this.assessDiscussionPotential(post),
            platform_context: this.getPlatformCommentGuidelines(platform),
            key_points: this.extractKeyPoints(post),
            target_audience: this.inferTargetAudience(post)
        };
    }

    private async analyzePostForRebuttal(post: string): Promise<any> {
        return {
            mainClaims: this.extractMainClaims(post),
            logicalStructure: this.analyzeLogicalStructure(post),
            evidenceQuality: this.assessEvidenceQuality(post),
            emotionalContent: this.identifyEmotionalElements(post),
            potentialWeaknesses: await this.identifyLogicalWeaknesses(post)
        };
    }

    private async applyPersona(persona: any, commentType: string): Promise<any> {
        if (!persona) {
            return this.getDefaultPersona(commentType);
        }

        const profileKey = `${persona.age}_${persona.background}`;
        const baseProfile = this.personaProfiles.get(profileKey) || this.personaProfiles.get('30s_professional');

        return {
            ...baseProfile,
            expertise: persona.expertise || [],
            personality: persona.personality || [],
            custom_background: persona.background
        };
    }

    private getPlatformCommentGuidelines(platform: string): any {
        return this.platformGuidelines.get(platform) || this.platformGuidelines.get('facebook');
    }

    // ============================
    // 댓글 생성 메서드들
    // ============================

    private async generateMainComment(
        request: CommentGenerationRequest,
        postAnalysis: any,
        persona: any,
        platformSettings: any,
        context?: ConversationContext
    ): Promise<string> {
        // 댓글 템플릿 선택
        const template = this.commentTemplates.get(request.commentType) || this.commentTemplates.get('supportive');
        
        // 어조 마커 선택
        const toneMarkers = template.tone_markers[request.tone] || template.tone_markers.casual;
        
        // 페르소나 기반 어휘 선택
        const vocabulary = this.selectPersonaVocabulary(persona, request.tone);
        
        // 플랫폼 최적화
        const platformOptimized = this.optimizeForPlatformComment(request, platformSettings);
        
        // 댓글 구성
        const opening = this.selectAppropriateOpening(template.openings, postAnalysis, persona);
        const mainBody = await this.generateCommentBody(request, postAnalysis, persona, vocabulary);
        const closing = this.selectAppropriateClosing(template.closings, request.engagement_goal);
        
        // 길이 조정
        let comment = `${opening} ${mainBody} ${closing}`;
        comment = this.adjustCommentLength(comment, request.length, platformSettings);
        
        // 어조 마커 적용
        comment = this.applyToneMarkers(comment, toneMarkers, request.tone);
        
        return comment.trim();
    }

    private async generateCommentVariations(
        mainComment: string,
        request: CommentGenerationRequest,
        persona: any
    ): Promise<CommentVariations['variations']> {
        return {
            shorter: await this.createShorterVersion(mainComment, request),
            longer: await this.createLongerVersion(mainComment, request, persona),
            different_tone: await this.changeTone(mainComment, request),
            different_angle: await this.changeAngle(mainComment, request, persona),
            more_personal: await this.addPersonalTouch(mainComment, persona)
        };
    }

    private async generateHashtagSuggestions(
        request: CommentGenerationRequest,
        postAnalysis: any
    ): Promise<string[]> {
        const hashtags = [];
        
        // 주제 기반 해시태그
        if (postAnalysis.main_topic) {
            hashtags.push(`#${postAnalysis.main_topic.replace(/\s+/g, '')}`);
        }
        
        // 댓글 타입 기반
        const typeHashtags = {
            supportive: ['#응원', '#동감', '#공감'],
            critical: ['#의견', '#토론', '#생각'],
            questioning: ['#궁금', '#질문', '#알고싶어'],
            informative: ['#정보', '#팁', '#알림'],
            humorous: ['#웃긴', '#재미', '#유머'],
            personal_experience: ['#경험', '#후기', '#실화']
        };
        
        hashtags.push(...(typeHashtags[request.commentType] || []));
        
        // 플랫폼별 인기 태그
        const platformTags = this.getPlatformPopularTags(request.platform);
        hashtags.push(...platformTags.slice(0, 2));
        
        return hashtags.slice(0, 5);
    }

    private async generateMentionSuggestions(
        request: CommentGenerationRequest,
        context?: ConversationContext
    ): Promise<string[]> {
        const mentions = [];
        
        if (context?.previousComments) {
            // 이전 댓글 작성자들 중 멘션 가능한 사람들
            mentions.push('@원글작성자');
        }
        
        // 전문가나 관련 인물들
        if (request.persona?.expertise) {
            mentions.push('@관련전문가');
        }
        
        return mentions.slice(0, 3);
    }

    private async generateFollowUpQuestions(
        request: CommentGenerationRequest,
        postAnalysis: any
    ): Promise<string[]> {
        const questions = [];
        
        switch (request.commentType) {
            case 'questioning':
                questions.push(
                    '더 자세한 설명이 가능할까요?',
                    '다른 사례도 있나요?',
                    '어떻게 시작하면 좋을까요?'
                );
                break;
            case 'supportive':
                questions.push(
                    '다른 분들 생각은 어떤가요?',
                    '경험담 더 들려주세요!',
                    '함께 할 수 있는 방법이 있을까요?'
                );
                break;
            case 'critical':
                questions.push(
                    '이 부분은 어떻게 생각하시나요?',
                    '다른 관점도 고려해보셨나요?',
                    '대안이 있다면 무엇일까요?'
                );
                break;
            default:
                questions.push(
                    '어떻게 생각하시나요?',
                    '더 많은 의견을 듣고 싶어요!',
                    '경험이 있으시다면 공유해주세요!'
                );
        }
        
        return questions;
    }

    // ============================
    // 반박글 생성 메서드들
    // ============================

    private async developRebuttalStrategy(
        request: RebuttalRequest,
        originalAnalysis: any,
        context?: ConversationContext
    ): Promise<any> {
        const strategy = this.rebuttalStrategies.get(request.rebuttalType) || 
                        this.rebuttalStrategies.get('logical_counter');
        
        return {
            primaryApproach: strategy.structure[0],
            keyArguments: await this.identifyKeyRebuttalPoints(originalAnalysis, request),
            evidenceToPresent: this.selectRebuttalEvidence(request.supporting_evidence, request.rebuttalType),
            rhetoricalTechniques: this.selectRhetoricalTechniques(request.approach, request.strength)
        };
    }

    private async generateStructuredRebuttal(
        request: RebuttalRequest,
        originalAnalysis: any,
        strategy: any
    ): Promise<any> {
        const structure = this.rebuttalStrategies.get(request.rebuttalType)?.structure || 
                         ['도입', '논증', '결론'];
        
        return {
            introduction: await this.createRebuttalIntroduction(request, originalAnalysis),
            arguments: await this.createRebuttalArguments(strategy.keyArguments, request),
            evidence: await this.presentRebuttalEvidence(strategy.evidenceToPresent, request),
            conclusion: await this.createRebuttalConclusion(request, strategy)
        };
    }

    private async composeMainRebuttal(structuredRebuttal: any, request: RebuttalRequest): Promise<string> {
        let rebuttal = '';
        
        // 정중한 도입 (civility가 true인 경우)
        if (request.maintain_civility) {
            rebuttal += structuredRebuttal.introduction + '\n\n';
        }
        
        // 주요 논증들
        structuredRebuttal.arguments.forEach((arg: string, index: number) => {
            rebuttal += `${index + 1}. ${arg}\n\n`;
        });
        
        // 증거 제시
        if (structuredRebuttal.evidence.length > 0) {
            rebuttal += '관련 근거:\n';
            structuredRebuttal.evidence.forEach((evidence: string) => {
                rebuttal += `- ${evidence}\n`;
            });
            rebuttal += '\n';
        }
        
        // 결론
        rebuttal += structuredRebuttal.conclusion;
        
        return rebuttal.trim();
    }

    private async generateRebuttalVariations(
        mainRebuttal: string,
        request: RebuttalRequest,
        strategy: any
    ): Promise<string[]> {
        const variations = [];
        
        // 더 강한 버전
        if (request.strength !== 'complete_refutation') {
            variations.push(await this.createStrongerRebuttal(mainRebuttal, request));
        }
        
        // 더 부드러운 버전
        if (request.strength !== 'gentle_disagreement') {
            variations.push(await this.createGentlerRebuttal(mainRebuttal, request));
        }
        
        // 다른 접근법 버전
        variations.push(await this.createAlternativeApproachRebuttal(mainRebuttal, request, strategy));
        
        return variations;
    }

    // ============================
    // 품질 분석 메서드들
    // ============================

    private async analyzeCommentQuality(
        comment: string,
        request: CommentGenerationRequest,
        postAnalysis: any,
        platformSettings: any
    ): Promise<any> {
        return {
            appropriateness: this.calculateAppropriateness(comment, postAnalysis, platformSettings),
            engagement_potential: this.calculateEngagementPotential(comment, request),
            risk_level: this.calculateRiskLevel(comment, request, postAnalysis),
            platform_optimization: this.calculatePlatformOptimization(comment, request.platform, platformSettings)
        };
    }

    private async analyzeRebuttalEffectiveness(
        rebuttal: string,
        originalPost: string,
        request: RebuttalRequest
    ): Promise<any> {
        return {
            persuasion_score: this.calculatePersuasionScore(rebuttal, request),
            logic_score: this.calculateLogicScore(rebuttal, originalPost),
            evidence_score: this.calculateEvidenceScore(rebuttal, request.supporting_evidence || []),
            civility_score: this.calculateCivilityScore(rebuttal, request.maintain_civility)
        };
    }

    // ============================
    // 유틸리티 메서드들
    // ============================

    private extractMainTopic(post: string): string {
        // 간단한 주제 추출 (실제로는 더 복잡한 NLP 사용)
        const words = post.split(' ').filter(word => word.length > 3);
        return words[0] || '일반';
    }

    private async analyzeSentiment(text: string): Promise<string> {
        // 감정 분석 (간단한 버전)
        const positiveWords = ['좋은', '훌륭한', '멋진', '행복', '감사'];
        const negativeWords = ['나쁜', '화난', '실망', '슬픈', '문제'];
        
        const positiveCount = positiveWords.filter(word => text.includes(word)).length;
        const negativeCount = negativeWords.filter(word => text.includes(word)).length;
        
        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }

    private calculatePostEngagement(post: string): number {
        let score = 50;
        if (post.includes('?')) score += 20;
        if (post.includes('!')) score += 10;
        if (post.length > 100 && post.length < 500) score += 15;
        return Math.min(score, 100);
    }

    private detectControversy(post: string): number {
        const controversialWords = ['정치', '종교', '젠더', '세대', '갈등', '논란'];
        const count = controversialWords.filter(word => post.includes(word)).length;
        return Math.min(count * 25, 100);
    }

    private assessDiscussionPotential(post: string): number {
        let score = 30;
        if (post.includes('어떻게 생각')) score += 25;
        if (post.includes('의견')) score += 20;
        if (post.includes('토론')) score += 30;
        return Math.min(score, 100);
    }

    private extractKeyPoints(post: string): string[] {
        return post.split(/[.!?]/).filter(s => s.trim().length > 10).slice(0, 3);
    }

    private inferTargetAudience(post: string): string[] {
        const audiences = [];
        if (post.includes('학생') || post.includes('공부')) audiences.push('학생');
        if (post.includes('직장') || post.includes('회사')) audiences.push('직장인');
        if (post.includes('부모') || post.includes('육아')) audiences.push('부모');
        return audiences.length > 0 ? audiences : ['일반'];
    }

    // 더 많은 유틸리티 메서드들...
    private extractMainClaims(post: string): string[] {
        // 주요 주장 추출
        return post.split(/[.!?]/).filter(s => 
            s.includes('는') || s.includes('다') || s.includes('이다')
        ).slice(0, 3);
    }

    private analyzeLogicalStructure(post: string): string[] {
        // 논리 구조 분석
        const structure = [];
        if (post.includes('왜냐하면') || post.includes('때문에')) structure.push('원인-결과');
        if (post.includes('따라서') || post.includes('그러므로')) structure.push('결론 도출');
        if (post.includes('만약') || post.includes('가정')) structure.push('가정-추론');
        return structure.length > 0 ? structure : ['기본 서술'];
    }

    private assessEvidenceQuality(post: string): number {
        let score = 30;
        if (post.includes('연구') || post.includes('조사')) score += 25;
        if (post.includes('데이터') || post.includes('통계')) score += 20;
        if (post.includes('사례') || post.includes('예시')) score += 15;
        if (post.includes('경험') || post.includes('체험')) score += 10;
        return Math.min(score, 100);
    }

    private identifyEmotionalElements(post: string): string[] {
        const emotions = [];
        if (post.includes('화') || post.includes('분노')) emotions.push('분노');
        if (post.includes('기쁨') || post.includes('행복')) emotions.push('기쁨');
        if (post.includes('슬픔') || post.includes('우울')) emotions.push('슬픔');
        if (post.includes('두려움') || post.includes('걱정')) emotions.push('두려움');
        return emotions;
    }

    private async identifyLogicalWeaknesses(post: string): Promise<string[]> {
        const weaknesses = [];
        
        // 근거 부족 체크
        const evidenceScore = this.assessEvidenceQuality(post);
        if (evidenceScore < 50) weaknesses.push('근거 부족');
        
        // 논리적 비약 체크
        const claims = this.extractMainClaims(post);
        const evidence = post.split(/[.!?]/).filter(s => 
            s.includes('연구') || s.includes('데이터') || s.includes('사례')
        );
        if (claims.length > evidence.length * 2) weaknesses.push('논리적 비약');
        
        // 일반화 오류 체크
        if (post.includes('모든') || post.includes('항상') || post.includes('절대')) {
            weaknesses.push('과도한 일반화');
        }
        
        return weaknesses;
    }

    // 나머지 메서드들도 유사하게 구현...
    private getDefaultPersona(commentType: string): any {
        return this.personaProfiles.get('30s_professional');
    }

    private selectPersonaVocabulary(persona: any, tone: string): any {
        return {
            level: persona.vocabulary_level || 'casual_modern',
            references: persona.reference_points || ['일반적인', '보편적인'],
            style: persona.communication_style || 'friendly'
        };
    }

    private optimizeForPlatformComment(request: CommentGenerationRequest, settings: any): any {
        return {
            max_length: settings.comment_length.max,
            optimal_length: settings.comment_length.optimal,
            tone_preference: settings.tone_preference,
            features: settings.engagement_features
        };
    }

    private selectAppropriateOpening(openings: string[], postAnalysis: any, persona: any): string {
        // 게시글 감정과 페르소나에 맞는 오프닝 선택
        return openings[0] || '안녕하세요!';
    }

    private async generateCommentBody(
        request: CommentGenerationRequest,
        postAnalysis: any,
        persona: any,
        vocabulary: any
    ): Promise<string> {
        let body = '';
        
        switch (request.commentType) {
            case 'supportive':
                body = `${postAnalysis.main_topic}에 대한 의견에 정말 공감합니다.`;
                break;
            case 'critical':
                body = `${postAnalysis.main_topic}에 대해 다른 관점에서 생각해볼 점이 있습니다.`;
                break;
            case 'questioning':
                body = `${postAnalysis.main_topic}에 대해 더 자세히 알고 싶습니다.`;
                break;
            case 'informative':
                body = `${postAnalysis.main_topic}에 대한 추가 정보를 공유드립니다.`;
                break;
            case 'humorous':
                body = `${postAnalysis.main_topic}에 대한 재미있는 이야기가 생각나네요! 😄`;
                break;
            case 'personal_experience':
                body = `${postAnalysis.main_topic}와 관련해서 제 경험을 말씀드리면...`;
                break;
            default:
                body = `${postAnalysis.main_topic}에 대한 좋은 글이네요.`;
        }
        
        // 페르소나의 전문성 반영
        if (persona.expertise && persona.expertise.length > 0) {
            body += ` ${persona.expertise[0]} 분야에서의 경험으로 보면,`;
        }
        
        return body;
    }

    private selectAppropriateClosing(closings: string[], engagementGoal: string): string {
        const goalClosings = {
            start_discussion: '다른 분들 의견도 궁금하네요!',
            provide_support: '응원합니다!',
            offer_alternative: '다른 방법도 고려해보세요!',
            seek_clarification: '더 자세한 설명 부탁드려요!',
            share_experience: '경험담 나눠주세요!',
            challenge_respectfully: '어떻게 생각하시나요?'
        };
        
        return goalClosings[engagementGoal as keyof typeof goalClosings] || closings[0] || '감사합니다!';
    }

    private adjustCommentLength(comment: string, length: string, settings: any): string {
        const targetLengths = {
            short: Math.min(50, settings.comment_length.optimal / 2),
            medium: settings.comment_length.optimal,
            long: Math.min(settings.comment_length.max, settings.comment_length.optimal * 2)
        };
        
        const target = targetLengths[length as keyof typeof targetLengths] || targetLengths.medium;
        
        if (comment.length > target) {
            return comment.substring(0, target - 3) + '...';
        } else if (comment.length < target * 0.7) {
            return comment + ' 더 많은 이야기를 나누고 싶어요!';
        }
        
        return comment;
    }

    private applyToneMarkers(comment: string, markers: string[], tone: string): string {
        if (tone === 'casual' && markers.length > 0) {
            return comment + ' ' + markers[0];
        } else if (tone === 'formal') {
            return comment.replace(/해요/g, '합니다').replace(/이에요/g, '입니다');
        }
        return comment;
    }

    // 변형 생성 메서드들
    private async createShorterVersion(comment: string, request: CommentGenerationRequest): Promise<string> {
        const sentences = comment.split(/[.!?]/).filter(s => s.trim());
        return sentences[0] + (sentences[0].endsWith('.') ? '' : '.');
    }

    private async createLongerVersion(comment: string, request: CommentGenerationRequest, persona: any): Promise<string> {
        let longer = comment;
        
        // 개인 경험 추가
        if (persona.custom_background) {
            longer += ` ${persona.custom_background} 경험상 이런 점이 중요하다고 생각합니다.`;
        }
        
        // 추가 질문
        longer += ' 다른 분들은 어떤 경험이 있으신지 궁금하네요!';
        
        return longer;
    }

    private async changeTone(comment: string, request: CommentGenerationRequest): Promise<string> {
        const alternativeTones = {
            casual: 'formal',
            formal: 'casual',
            respectful: 'passionate',
            passionate: 'analytical',
            analytical: 'empathetic',
            empathetic: 'respectful'
        };
        
        const newTone = alternativeTones[request.tone as keyof typeof alternativeTones] || 'casual';
        
        if (newTone === 'formal') {
            return comment.replace(/해요/g, '합니다').replace(/이에요/g, '입니다');
        } else if (newTone === 'casual') {
            return comment.replace(/합니다/g, '해요').replace(/입니다/g, '이에요') + ' 😊';
        }
        
        return comment;
    }

    private async changeAngle(comment: string, request: CommentGenerationRequest, persona: any): Promise<string> {
        const angles = {
            supportive: '비판적 관점에서 보면,',
            critical: '긍정적인 측면도 있는데,',
            questioning: '제 생각으로는',
            informative: '개인적 경험으로는',
            humorous: '진지하게 생각해보면',
            personal_experience: '객관적으로 보면'
        };
        
        const newAngle = angles[request.commentType as keyof typeof angles] || '다른 관점에서 보면,';
        return newAngle + ' ' + comment;
    }

    private async addPersonalTouch(comment: string, persona: any): Promise<string> {
        let personal = comment;
        
        if (persona.personality && persona.personality.length > 0) {
            personal = `${persona.personality[0]} 성격상, ${personal}`;
        }
        
        if (persona.typical_concerns && persona.typical_concerns.length > 0) {
            personal += ` 특히 ${persona.typical_concerns[0]} 측면에서 중요하다고 생각해요.`;
        }
        
        return personal;
    }

    // 플랫폼별 인기 태그
    private getPlatformPopularTags(platform: string): string[] {
        const popularTags = {
            facebook: ['#일상', '#공유', '#소통'],
            instagram: ['#데일리', '#팔로우', '#좋아요'],
            twitter: ['#실시간', '#소통', '#의견'],
            linkedin: ['#인사이트', '#전문가', '#네트워킹'],
            youtube: ['#영상', '#구독', '#댓글'],
            community: ['#커뮤니티', '#정보', '#나눔']
        };
        
        return popularTags[platform as keyof typeof popularTags] || popularTags.community;
    }

    // 대화 체인 관련 메서드들
    private determineCommentType(position: string, goal: string): CommentGenerationRequest['commentType'] {
        if (position.includes('지지') || position.includes('찬성')) return 'supportive';
        if (position.includes('반대') || position.includes('비판')) return 'critical';
        if (position.includes('질문') || position.includes('궁금')) return 'questioning';
        return 'informative';
    }

    private determinePersonaTone(persona: any): CommentGenerationRequest['tone'] {
        if (persona.communication_style?.includes('professional')) return 'formal';
        if (persona.communication_style?.includes('passionate')) return 'passionate';
        if (persona.communication_style?.includes('analytical')) return 'analytical';
        return 'casual';
    }

    private mapConversationGoal(goal: string): CommentGenerationRequest['engagement_goal'] {
        const mapping = {
            constructive_debate: 'start_discussion',
            information_sharing: 'provide_support', 
            community_building: 'share_experience',
            problem_solving: 'offer_alternative'
        };
        
        return (mapping as any)[goal] || 'start_discussion';
    }

    // 분석 메서드들
    private async analyzeConversationNarrative(chain: any[], goal: string): Promise<any> {
        return {
            conversation_arc: `${goal} 목표로 ${chain.length}개 댓글이 연결된 건설적 대화`,
            key_developments: chain.map((comment, index) => `${index + 1}단계: ${comment.participant}의 ${comment.engagement_tactics[0] || '참여'}`),
            resolution_points: ['상호 이해 증진', '다양한 관점 공유', '건설적 결론 도출']
        };
    }

    private async extractConversationInsights(chain: any[], narrative: any): Promise<any> {
        return {
            productive_elements: [
                '정중한 의견 교환',
                '구체적 사례 공유',
                '상호 존중적 토론'
            ],
            potential_improvements: [
                '더 구체적인 근거 제시',
                '감정적 호소 강화',
                '실용적 해결책 제안'
            ],
            community_impact: '긍정적인 담론 문화 형성에 기여'
        };
    }

    // 실시간 모니터링 관련 메서드들
    private async analyzeCommentIntent(comment: string, originalPost: string): Promise<string> {
        if (comment.includes('?')) return 'questioning';
        if (comment.includes('동감') || comment.includes('좋아')) return 'supportive';
        if (comment.includes('반대') || comment.includes('문제')) return 'critical';
        if (comment.includes('정보') || comment.includes('알려드리')) return 'informative';
        return 'general_engagement';
    }

    private async calculateEngagementValue(comment: string, originalPost: string): Promise<number> {
        let value = 30;
        
        if (comment.length > 20) value += 20;
        if (comment.includes('?')) value += 15;
        if (comment.includes('경험') || comment.includes('사례')) value += 25;
        if (comment.includes('전문') || comment.includes('연구')) value += 30;
        
        return Math.min(value, 100);
    }

    private calculateResponsePriority(
        sentiment: string, 
        intent: string, 
        engagementValue: number, 
        strategy: string
    ): number {
        let priority = engagementValue;
        
        // 전략별 가중치
        if (strategy === 'engage_all') {
            priority += 10;
        } else if (strategy === 'selective_engagement') {
            if (intent === 'questioning' || intent === 'critical') priority += 20;
        } else if (strategy === 'defensive') {
            if (sentiment === 'negative') priority += 30;
        }
        
        return Math.min(priority, 100);
    }

    private determineResponseType(analysis: any, strategy: string): string {
        if (analysis.sentiment === 'negative' && strategy === 'defensive') return 'clarification';
        if (analysis.intent === 'questioning') return 'informative';
        if (analysis.intent === 'supportive') return 'appreciation';
        if (analysis.intent === 'critical') return 'diplomatic';
        return 'general_engagement';
    }

    private async generateResponseSuggestion(
        originalPost: string,
        comment: string,
        responseType: string,
        strategy: string
    ): Promise<string> {
        const responses = {
            clarification: '오해가 있었던 것 같습니다. 명확히 설명드리면...',
            informative: '좋은 질문이네요! 자세히 말씀드리면...',
            appreciation: '응원해 주셔서 감사합니다! 정말 힘이 됩니다.',
            diplomatic: '다른 관점을 제시해 주셔서 감사합니다. 함께 생각해보면...',
            general_engagement: '의견 주셔서 감사합니다! 더 많은 대화를 나누고 싶어요.'
        };
        
        return responses[responseType as keyof typeof responses] || responses.general_engagement;
    }

    private recommendResponseTiming(analysis: any): string {
        if (analysis.engagement_value > 80) return '즉시 응답 권장';
        if (analysis.sentiment === 'negative') return '신중한 검토 후 응답';
        if (analysis.intent === 'questioning') return '24시간 내 응답';
        return '적절한 시점에 응답';
    }

    private assessResponseRisk(analysis: any, responseType: string): number {
        let risk = 20; // 기본 리스크
        
        if (analysis.sentiment === 'negative') risk += 30;
        if (responseType === 'diplomatic') risk += 20;
        if (analysis.intent === 'critical') risk += 25;
        
        return Math.min(risk, 100);
    }

    private async developOverallResponseStrategy(
        commentAnalysis: any[],
        responseStrategy: string,
        originalPost: string
    ): Promise<any> {
        const positiveCount = commentAnalysis.filter(c => c.sentiment === 'positive').length;
        const negativeCount = commentAnalysis.filter(c => c.sentiment === 'negative').length;
        const questionCount = commentAnalysis.filter(c => c.intent === 'questioning').length;
        
        return {
            engagement_approach: responseStrategy === 'engage_all' ? '모든 댓글에 적극 응답' : '선별적 전략적 응답',
            key_messages: [
                '감사와 존중의 표현',
                '건설적 대화 유도',
                '추가 정보 제공'
            ],
            tone_guidance: positiveCount > negativeCount ? '긍정적이고 개방적인 어조' : '신중하고 균형잡힌 어조',
            escalation_protocols: [
                '부적절한 댓글은 신고',
                '논란 발생시 중재자 개입',
                '필요시 댓글 숨김 처리'
            ]
        };
    }

    // 품질 점수 계산 메서드들
    private calculateAppropriateness(comment: string, postAnalysis: any, platformSettings: any): number {
        let score = 70;
        
        // 길이 적절성
        const optimalLength = platformSettings.comment_length.optimal;
        const lengthRatio = comment.length / optimalLength;
        if (lengthRatio >= 0.5 && lengthRatio <= 2) score += 15;
        
        // 어조 적절성
        if (platformSettings.tone_preference.includes('professional') && 
            (comment.includes('합니다') || comment.includes('입니다'))) score += 10;
        
        // 논란 요소 체크
        if (postAnalysis.controversy_level > 50 && !comment.includes('존중')) score -= 15;
        
        return Math.min(score, 100);
    }

    private calculateEngagementPotential(comment: string, request: CommentGenerationRequest): number {
        let score = 50;
        
        if (comment.includes('?')) score += 20;
        if (comment.includes('경험')) score += 15;
        if (request.engagement_goal === 'start_discussion') score += 10;
        if (comment.length > 50) score += 10;
        
        return Math.min(score, 100);
    }

    private calculateRiskLevel(comment: string, request: CommentGenerationRequest, postAnalysis: any): number {
        let risk = 10;
        
        if (request.commentType === 'critical') risk += 25;
        if (postAnalysis.controversy_level > 70) risk += 30;
        if (comment.includes('반대') || comment.includes('문제')) risk += 20;
        // 기본적으로 문명함을 유지한다고 가정
        risk += 0;
        
        return Math.min(risk, 100);
    }

    private calculatePlatformOptimization(comment: string, platform: string, settings: any): number {
        let score = 60;
        
        // 길이 최적화
        if (comment.length <= settings.comment_length.optimal * 1.2) score += 20;
        
        // 플랫폼별 특성 반영
        if (platform === 'twitter' && comment.length <= 200) score += 15;
        if (platform === 'linkedin' && comment.includes('전문')) score += 15;
        if (platform === 'instagram' && comment.includes('👍')) score += 10;
        
        return Math.min(score, 100);
    }

    // 반박글 효과성 계산
    private calculatePersuasionScore(rebuttal: string, request: RebuttalRequest): number {
        let score = 50;
        
        if (request.approach === 'academic_debate') score += 20;
        if (rebuttal.includes('연구') || rebuttal.includes('데이터')) score += 25;
        if (request.maintain_civility) score += 15;
        if (rebuttal.length > 200 && rebuttal.length < 800) score += 10;
        
        return Math.min(score, 100);
    }

    private calculateLogicScore(rebuttal: string, originalPost: string): number {
        let score = 60;
        
        if (rebuttal.includes('따라서') || rebuttal.includes('그러므로')) score += 15;
        if (rebuttal.includes('근거') || rebuttal.includes('증거')) score += 20;
        if (rebuttal.includes('예를 들어')) score += 10;
        
        return Math.min(score, 100);
    }

    private calculateEvidenceScore(rebuttal: string, evidence: string[]): number {
        let score = 40;
        
        score += evidence.length * 15; // 증거당 15점
        if (rebuttal.includes('연구')) score += 20;
        if (rebuttal.includes('통계')) score += 15;
        if (rebuttal.includes('사례')) score += 10;
        
        return Math.min(score, 100);
    }

    private calculateCivilityScore(rebuttal: string, maintainCivility: boolean): number {
        let score = maintainCivility ? 80 : 40;
        
        if (rebuttal.includes('존중') || rebuttal.includes('이해')) score += 10;
        if (rebuttal.includes('정중히') || rebuttal.includes('신중히')) score += 10;
        if (rebuttal.includes('공격') || rebuttal.includes('비난')) score -= 30;
        
        return Math.min(score, 100);
    }

    // 반박글 생성 세부 메서드들
    private async identifyKeyRebuttalPoints(analysis: any, request: RebuttalRequest): Promise<string[]> {
        const points = [];
        
        // 약점 기반 반박점
        analysis.potentialWeaknesses.forEach((weakness: string) => {
            points.push(`${weakness}에 대한 반박`);
        });
        
        // 타겟 약점 기반
        if (request.target_weakness) {
            request.target_weakness.forEach(weakness => {
                points.push(weakness);
            });
        }
        
        // 반박 유형별 기본 포인트
        const typePoints = {
            logical_counter: ['논리적 일관성 문제', '전제의 타당성 문제'],
            evidence_based: ['증거의 신뢰성 문제', '데이터 해석 오류'],
            experiential: ['실제 경험과의 차이', '현실적 적용의 한계'],
            ethical_concern: ['윤리적 문제점', '가치관의 충돌'],
            practical_issue: ['실용성 부족', '실현 가능성 의문'],
            alternative_solution: ['대안 제시', '개선 방안 제안']
        };
        
        const additionalPoints = typePoints[request.rebuttalType] || [];
        points.push(...additionalPoints);
        
        return points.slice(0, 3); // 최대 3개 핵심 포인트
    }

    private selectRebuttalEvidence(evidence: string[] | undefined, rebuttalType: string): string[] {
        if (!evidence) return [];
        
        // 반박 유형에 맞는 증거 선별
        const typePreferences = {
            logical_counter: ['논리적 증명', '반박 사례'],
            evidence_based: ['과학적 연구', '공식 통계'],
            experiential: ['개인 사례', '현장 경험'],
            ethical_concern: ['윤리 가이드라인', '도덕적 원칙'],
            practical_issue: ['실무 경험', '현실적 제약'],
            alternative_solution: ['성공 사례', '대안 모델']
        };
        
        return evidence.slice(0, 3); // 최대 3개 증거
    }

    private selectRhetoricalTechniques(approach: string, strength: string): string[] {
        const techniques = [];
        
        // 접근법별 기법
        const approachTechniques = {
            respectful_discourse: ['정중한 질문', '상호 존중'],
            academic_debate: ['논리적 분석', '학술적 논증'],
            passionate_advocacy: ['감정적 호소', '열정적 주장'],
            fact_checking: ['팩트 체크', '객관적 검증'],
            personal_testimony: ['개인 경험', '증언']
        };
        
        techniques.push(...(approachTechniques[approach as keyof typeof approachTechniques] || []));
        
        // 강도별 기법
        const strengthTechniques = {
            gentle_disagreement: ['부드러운 의문 제기'],
            moderate_opposition: ['논리적 반박'],
            strong_counter: ['직접적 반박'],
            complete_refutation: ['전면적 반박']
        };
        
        techniques.push(...(strengthTechniques[strength as keyof typeof strengthTechniques] || []));
        
        return techniques;
    }

    private async createRebuttalIntroduction(request: RebuttalRequest, analysis: any): Promise<string> {
        const introductions = {
            gentle_disagreement: '제시해 주신 의견을 주의깊게 읽어보았습니다. 몇 가지 다른 관점을 제시해보고 싶습니다.',
            moderate_opposition: '흥미로운 주장이지만, 다음과 같은 점에서 재고가 필요할 것 같습니다.',
            strong_counter: '제시된 주장에 대해 중요한 반박 근거들이 있어 말씀드리고자 합니다.',
            complete_refutation: '제시된 주장은 다음과 같은 근본적인 문제점들을 가지고 있습니다.'
        };
        
        return introductions[request.strength as keyof typeof introductions] || introductions.moderate_opposition;
    }

    private async createRebuttalArguments(keyArguments: string[], request: RebuttalRequest): Promise<string[]> {
        return keyArguments.map((arg, index) => {
            const strengthPrefixes = {
                gentle_disagreement: '고려해볼 점은',
                moderate_opposition: '문제가 되는 부분은',
                strong_counter: '명백한 오류는',
                complete_refutation: '근본적 결함은'
            };
            
            const prefix = strengthPrefixes[request.strength as keyof typeof strengthPrefixes] || '중요한 점은';
            return `${prefix} ${arg}입니다.`;
        });
    }

    private async presentRebuttalEvidence(evidence: string[], request: RebuttalRequest): Promise<string[]> {
        return evidence.map(ev => {
            if (request.rebuttalType === 'evidence_based') {
                return `관련 연구에 따르면: ${ev}`;
            } else if (request.rebuttalType === 'experiential') {
                return `실제 경험상: ${ev}`;
            } else {
                return ev;
            }
        });
    }

    private async createRebuttalConclusion(request: RebuttalRequest, strategy: any): Promise<string> {
        const conclusions = {
            gentle_disagreement: '이러한 점들을 함께 고려해보시면 어떨까요?',
            moderate_opposition: '따라서 더 신중한 접근이 필요하다고 생각합니다.',
            strong_counter: '이러한 이유로 재검토가 필요하다고 판단됩니다.',
            complete_refutation: '따라서 제시된 주장은 수용하기 어렵다고 결론짓습니다.'
        };
        
        let conclusion = conclusions[request.strength as keyof typeof conclusions] || conclusions.moderate_opposition;
        
        if (request.maintain_civility) {
            conclusion += ' 다양한 의견을 통해 더 나은 결론에 도달할 수 있기를 바랍니다.';
        }
        
        return conclusion;
    }

    private async createStrongerRebuttal(mainRebuttal: string, request: RebuttalRequest): Promise<string> {
        return mainRebuttal.replace(/고려해볼/g, '명백한').replace(/문제가 될 수 있는/g, '심각한 문제인');
    }

    private async createGentlerRebuttal(mainRebuttal: string, request: RebuttalRequest): Promise<string> {
        return '정중히 다른 의견을 제시하면, ' + mainRebuttal.replace(/명백한/g, '고려해볼').replace(/심각한/g, '검토가 필요한');
    }

    private async createAlternativeApproachRebuttal(mainRebuttal: string, request: RebuttalRequest, strategy: any): Promise<string> {
        const alternativeApproaches = {
            logical_counter: '감정적 관점에서 보면',
            evidence_based: '개인적 경험으로는',
            experiential: '객관적 데이터로는',
            ethical_concern: '실용적 측면에서는',
            practical_issue: '이상적 관점에서는',
            alternative_solution: '문제 중심적으로는'
        };
        
        const alternative = alternativeApproaches[request.rebuttalType as keyof typeof alternativeApproaches] || '다른 접근으로는';
        return `${alternative} ${mainRebuttal}`;
    }

    private async assessRebuttalRisks(rebuttal: string, request: RebuttalRequest, context?: ConversationContext): Promise<any> {
        let controversyLevel = 30;
        let backfireRisk = 20;
        let misinterpretationRisk = 25;
        let relationshipImpact = 15;
        
        // 강도별 리스크 증가
        const strengthRiskMultipliers = {
            gentle_disagreement: 1.0,
            moderate_opposition: 1.3,
            strong_counter: 1.7,
            complete_refutation: 2.0
        };
        
        const multiplier = strengthRiskMultipliers[request.strength] || 1.0;
        controversyLevel *= multiplier;
        backfireRisk *= multiplier;
        
        // 예의 유지 여부에 따른 리스크
        if (!request.maintain_civility) {
            relationshipImpact += 40;
            misinterpretationRisk += 30;
        }
        
        // 컨텍스트 기반 리스크
        if (context?.sensitiveTopics && context.sensitiveTopics.length > 0) {
            controversyLevel += 25;
        }
        
        return {
            controversyLevel: Math.min(controversyLevel, 100),
            backfireRisk: Math.min(backfireRisk, 100),
            misinterpretationRisk: Math.min(misinterpretationRisk, 100),
            relationshipImpact: Math.min(relationshipImpact, 100)
        };
    }

    private async analyzeRebuttalStrategy(strategy: any, originalAnalysis: any, effectiveness: any): Promise<any> {
        return {
            approach_rationale: `${strategy.primaryApproach} 접근법을 통해 효과적인 반박을 구성했습니다.`,
            key_tactics: strategy.rhetoricalTechniques,
            expected_responses: [
                '추가 근거 제시 요구',
                '감정적 반응 가능성',
                '건설적 토론 유도'
            ],
            counter_preparations: [
                '추가 증거 준비',
                '대화 중재 방안',
                '감정 완화 전략'
            ]
        };
    }

    private async generateEngagementSuggestions(
        request: CommentGenerationRequest,
        postAnalysis: any,
        qualityAnalysis: any
    ): Promise<any> {
        return {
            timing: this.getOptimalCommentTiming(request.platform, postAnalysis),
            engagement_tactics: this.getEngagementTactics(request, qualityAnalysis),
            follow_up_strategy: this.getFollowUpStrategy(request, postAnalysis)
        };
    }

    private async generateAlternativeComments(
        request: CommentGenerationRequest,
        postAnalysis: any,
        count: number
    ): Promise<string[]> {
        const alternatives = [];
        
        for (let i = 0; i < count; i++) {
            const altRequest = { ...request };
            
            // 다른 어조로 변경
            const tones: CommentGenerationRequest['tone'][] = ['casual', 'formal', 'empathetic'];
            altRequest.tone = tones[i] || 'casual';
            
            const altComment = await this.generateMainComment(
                altRequest,
                postAnalysis,
                await this.applyPersona(request.persona, request.commentType),
                this.getPlatformCommentGuidelines(request.platform)
            );
            
            alternatives.push(altComment);
        }
        
        return alternatives;
    }

    // 유틸리티 메서드들
    private getOptimalCommentTiming(platform: string, postAnalysis: any): string {
        const timings = {
            facebook: '게시 후 2-4시간 (높은 활동 시간대)',
            instagram: '게시 후 1-2시간 (빠른 반응)',
            twitter: '게시 후 15-30분 (실시간성)',
            linkedin: '게시 후 4-8시간 (전문적 검토)',
            youtube: '게시 후 첫날 (초기 참여)',
            community: '게시 후 하루 이내'
        };
        
        return timings[platform as keyof typeof timings] || timings.community;
    }

    private getEngagementTactics(request: CommentGenerationRequest, qualityAnalysis: any): string[] {
        const tactics = [];
        
        if (request.engagement_goal === 'start_discussion') {
            tactics.push('열린 질문 포함', '다른 의견 유도');
        }
        
        if (qualityAnalysis.engagement_potential > 70) {
            tactics.push('후속 대화 준비', '추가 정보 제공');
        }
        
        if (request.platform === 'instagram' || request.platform === 'facebook') {
            tactics.push('이모지 활용', '시각적 요소 강조');
        }
        
        return tactics;
    }

    private getFollowUpStrategy(request: CommentGenerationRequest, postAnalysis: any): string {
        if (postAnalysis.discussion_potential > 70) {
            return '활발한 토론이 예상되므로 지속적 참여 준비';
        } else if (request.commentType === 'questioning') {
            return '답변 대기 후 감사 표현 및 추가 질문';
        } else {
            return '적절한 시점에 대화 확장 시도';
        }
    }
}

export const commentAndRebuttalSystem = new CommentAndRebuttalSystem();
export default commentAndRebuttalSystem;
