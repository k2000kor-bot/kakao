/**
 * 🧠 지능형 컨텍스트 분석기
 * 사용자의 실제 요구사항을 깊이 이해하고 맞춤형 답변을 생성하는 시스템
 */

export interface DeepContextAnalysis {
    // 핵심 의도 분석
    primaryIntent: {
        type: string;
        confidence: number;
        subIntents: string[];
        urgency: 'low' | 'medium' | 'high' | 'critical';
    };
    
    // 숨겨진 요구사항
    hiddenRequirements: {
        explicit: string[];      // 명시적 요구사항
        implicit: string[];      // 암시적 요구사항
        contextual: string[];    // 맥락적 요구사항
        emotional: string[];     // 감정적 요구사항
    };
    
    // 프로젝트 컨텍스트
    projectContext: {
        codebase: any;
        technologies: string[];
        currentIssues: string[];
        userExpertise: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    };
    
    // 대화 흐름 분석
    conversationFlow: {
        phase: 'problem_identification' | 'solution_seeking' | 'implementation' | 'validation';
        continuity: number;
        previousContext: any[];
        expectedFollowUp: string[];
    };
    
    // 답변 전략
    responseStrategy: {
        approach: 'direct' | 'educational' | 'collaborative' | 'diagnostic';
        detailLevel: 'overview' | 'detailed' | 'comprehensive' | 'expert';
        format: 'text' | 'code' | 'visual' | 'interactive';
        tone: 'professional' | 'friendly' | 'technical' | 'encouraging';
    };
}

export interface PracticalAnswer {
    // 메인 답변
    mainResponse: string;
    
    // 실행 가능한 해결책
    actionableSteps: {
        immediate: string[];     // 즉시 실행 가능
        shortTerm: string[];     // 단기 계획
        longTerm: string[];      // 장기 계획
    };
    
    // 구체적 예시
    concreteExamples: {
        codeSnippets: Array<{
            language: string;
            code: string;
            explanation: string;
            context: string;
        }>;
        realWorldCases: string[];
        bestPractices: string[];
    };
    
    // 검증 방법
    validationMethods: {
        testingSteps: string[];
        successCriteria: string[];
        potentialIssues: string[];
        troubleshooting: string[];
    };
    
    // 추가 리소스
    additionalResources: {
        documentation: string[];
        tutorials: string[];
        tools: string[];
        communities: string[];
    };
    
    // 품질 메트릭
    qualityMetrics: {
        relevance: number;
        completeness: number;
        actionability: number;
        clarity: number;
        practicality: number;
        overall: number;
    };
}

class IntelligentContextAnalyzer {
    private conversationMemory: Map<string, any> = new Map();
    private userProfiles: Map<string, any> = new Map();
    private projectContexts: Map<string, any> = new Map();

    /**
     * 🔍 깊이 있는 컨텍스트 분석
     */
    async analyzeDeepContext(
        userMessage: string, 
        conversationHistory: any[], 
        projectInfo: any,
        userId?: string
    ): Promise<DeepContextAnalysis> {
        
        // 1. 다층적 의도 분석
        const primaryIntent = await this.analyzePrimaryIntent(userMessage, conversationHistory);
        
        // 2. 숨겨진 요구사항 추출
        const hiddenRequirements = await this.extractHiddenRequirements(
            userMessage, 
            conversationHistory, 
            projectInfo
        );
        
        // 3. 프로젝트 컨텍스트 구축
        const projectContext = await this.buildProjectContext(projectInfo, userMessage);
        
        // 4. 대화 흐름 분석
        const conversationFlow = await this.analyzeConversationFlow(
            conversationHistory, 
            userMessage
        );
        
        // 5. 최적 답변 전략 결정
        const responseStrategy = await this.determineResponseStrategy(
            primaryIntent, 
            hiddenRequirements, 
            projectContext, 
            conversationFlow
        );

        return {
            primaryIntent,
            hiddenRequirements,
            projectContext,
            conversationFlow,
            responseStrategy
        };
    }

    /**
     * 🎯 다층적 의도 분석
     */
    private async analyzePrimaryIntent(userMessage: string, history: any[]): Promise<any> {
        const message = userMessage.toLowerCase();
        
        // 복합 의도 패턴 매칭
        const intentAnalysis = {
            // 문제 해결 의도
            problemSolving: {
                patterns: [
                    /문제가 있어요|오류가 나요|안 돼요|작동하지 않아요/gi,
                    /해결|고치|수정|개선|최적화/gi,
                    /어떻게 해야|방법이 있을까요|도움이 필요해요/gi
                ],
                weight: 0
            },
            
            // 학습 의도  
            learning: {
                patterns: [
                    /배우고 싶어요|알고 싶어요|이해하고 싶어요/gi,
                    /설명해주세요|가르쳐주세요|어떻게 동작하나요/gi,
                    /원리가 뭔가요|왜 그런가요|어떤 차이가 있나요/gi
                ],
                weight: 0
            },
            
            // 구현 의도
            implementation: {
                patterns: [
                    /만들어주세요|구현해주세요|코드를 작성해주세요/gi,
                    /어떻게 만들까요|구현 방법|개발 방법/gi,
                    /예제|샘플|템플릿/gi
                ],
                weight: 0
            },
            
            // 분석 의도
            analysis: {
                patterns: [
                    /분석해주세요|검토해주세요|평가해주세요/gi,
                    /어떻게 생각하세요|의견이 어떠세요/gi,
                    /장단점|비교|차이점/gi
                ],
                weight: 0
            },
            
            // 최적화 의도
            optimization: {
                patterns: [
                    /성능|속도|최적화|개선/gi,
                    /느려요|빨라요|효율적/gi,
                    /더 좋은 방법|베스트 프랙티스/gi
                ],
                weight: 0
            }
        };

        // 패턴 매칭 및 가중치 계산
        Object.entries(intentAnalysis).forEach(([intent, data]) => {
            data.patterns.forEach(pattern => {
                const matches = message.match(pattern);
                if (matches) {
                    data.weight += matches.length;
                }
            });
        });

        // 컨텍스트 기반 가중치 조정
        if (history.length > 0) {
            const recentContext = history.slice(-3).join(' ').toLowerCase();
            
            // 연속성 분석
            if (recentContext.includes('문제') && message.includes('해결')) {
                intentAnalysis.problemSolving.weight += 2;
            }
            
            if (recentContext.includes('코드') && message.includes('설명')) {
                intentAnalysis.learning.weight += 1.5;
            }
        }

        // 최고 점수 의도 결정
        const sortedIntents = Object.entries(intentAnalysis)
            .sort(([,a], [,b]) => b.weight - a.weight);
        
        const primaryIntentType = sortedIntents[0][0];
        const confidence = Math.min(sortedIntents[0][1].weight / 3, 1.0);
        
        // 서브 의도 추출
        const subIntents = sortedIntents
            .slice(1, 3)
            .filter(([, data]) => data.weight > 0)
            .map(([intent]) => intent);

        // 긴급도 분석
        const urgency = this.analyzeUrgency(userMessage, history);

        return {
            type: primaryIntentType,
            confidence,
            subIntents,
            urgency
        };
    }

    /**
     * 🕵️ 숨겨진 요구사항 추출
     */
    private async extractHiddenRequirements(
        userMessage: string, 
        history: any[], 
        projectInfo: any
    ): Promise<any> {
        
        const requirements = {
            explicit: [],
            implicit: [],
            contextual: [],
            emotional: []
        };

        // 명시적 요구사항 (직접적 표현)
        const explicitPatterns = [
            /해주세요|만들어주세요|알려주세요|설명해주세요/gi,
            /필요해요|원해요|하고 싶어요|되었으면 좋겠어요/gi
        ];
        
        explicitPatterns.forEach(pattern => {
            const matches = userMessage.match(pattern);
            if (matches) {
                requirements.explicit.push(...matches);
            }
        });

        // 암시적 요구사항 (간접적 표현)
        const implicitIndicators = {
            '성능 문제': ['최적화 방법', '성능 측정', '병목 지점 파악'],
            '코드 리뷰': ['베스트 프랙티스', '코드 품질', '리팩토링'],
            '버그 해결': ['디버깅 방법', '테스트 케이스', '예외 처리'],
            '기능 추가': ['아키텍처 고려', '확장성', '유지보수성']
        };

        Object.entries(implicitIndicators).forEach(([indicator, reqs]) => {
            if (userMessage.toLowerCase().includes(indicator.toLowerCase())) {
                requirements.implicit.push(...reqs);
            }
        });

        // 맥락적 요구사항 (프로젝트/기술 스택 기반)
        if (projectInfo) {
            if (projectInfo.technologies?.includes('React')) {
                requirements.contextual.push('React 모범 사례', '컴포넌트 설계');
            }
            if (projectInfo.technologies?.includes('TypeScript')) {
                requirements.contextual.push('타입 안전성', '인터페이스 설계');
            }
        }

        // 감정적 요구사항 (사용자 상태 기반)
        const emotionalCues = {
            '답답해요|짜증나요|힘들어요': ['단계별 가이드', '친절한 설명'],
            '궁금해요|흥미로워요': ['깊이 있는 설명', '추가 학습 자료'],
            '급해요|빨리': ['즉시 실행 가능한 해결책', '간단한 방법']
        };

        Object.entries(emotionalCues).forEach(([emotion, reqs]) => {
            if (new RegExp(emotion, 'gi').test(userMessage)) {
                requirements.emotional.push(...reqs);
            }
        });

        return requirements;
    }

    /**
     * 🏗️ 프로젝트 컨텍스트 구축
     */
    private async buildProjectContext(projectInfo: any, userMessage: string): Promise<any> {
        // 기본 컨텍스트
        const context = {
            codebase: projectInfo?.codebase || {},
            technologies: projectInfo?.technologies || [],
            currentIssues: [],
            userExpertise: 'intermediate' // 기본값
        };

        // 메시지에서 기술 스택 추출
        const techPatterns = {
            'React': /react|jsx|컴포넌트/gi,
            'TypeScript': /typescript|ts|타입/gi,
            'Node.js': /node|nodejs|서버/gi,
            'Python': /python|파이썬/gi,
            'JavaScript': /javascript|js|자바스크립트/gi
        };

        Object.entries(techPatterns).forEach(([tech, pattern]) => {
            if (pattern.test(userMessage)) {
                if (!context.technologies.includes(tech)) {
                    context.technologies.push(tech);
                }
            }
        });

        // 사용자 전문성 추정
        const expertiseIndicators = {
            beginner: /처음|모르겠어요|어려워요|초보/gi,
            intermediate: /알고는 있지만|경험이 있지만/gi,
            advanced: /최적화|아키텍처|패턴|성능/gi,
            expert: /커스텀|확장|프레임워크 개발/gi
        };

        Object.entries(expertiseIndicators).forEach(([level, pattern]) => {
            if (pattern.test(userMessage)) {
                context.userExpertise = level as any;
            }
        });

        return context;
    }

    /**
     * 🌊 대화 흐름 분석
     */
    private async analyzeConversationFlow(history: any[], currentMessage: string): Promise<any> {
        const flow = {
            phase: 'problem_identification' as any,
            continuity: 0,
            previousContext: [],
            expectedFollowUp: []
        };

        if (history.length === 0) {
            flow.phase = 'problem_identification';
            flow.expectedFollowUp = ['문제 상세 설명', '추가 정보 제공'];
            return flow;
        }

        // 대화 단계 분석
        const recentMessages = history.slice(-3).join(' ').toLowerCase();
        
        if (recentMessages.includes('문제') || recentMessages.includes('오류')) {
            if (currentMessage.includes('해결') || currentMessage.includes('방법')) {
                flow.phase = 'solution_seeking';
                flow.expectedFollowUp = ['구체적 구현 방법', '예제 코드'];
            }
        } else if (recentMessages.includes('코드') || recentMessages.includes('구현')) {
            flow.phase = 'implementation';
            flow.expectedFollowUp = ['테스트 방법', '배포 가이드'];
        }

        // 연속성 점수 계산
        const keywords = this.extractKeywords(currentMessage);
        const historyKeywords = this.extractKeywords(recentMessages);
        
        const commonKeywords = keywords.filter(k => historyKeywords.includes(k));
        flow.continuity = commonKeywords.length / Math.max(keywords.length, 1);

        return flow;
    }

    /**
     * 📋 답변 전략 결정
     */
    private async determineResponseStrategy(
        intent: any, 
        requirements: any, 
        projectContext: any, 
        conversationFlow: any
    ): Promise<any> {
        
        const strategy = {
            approach: 'collaborative' as any,
            detailLevel: 'detailed' as any,
            format: 'text' as any,
            tone: 'friendly' as any
        };

        // 의도 기반 접근 방식
        switch (intent.type) {
            case 'problemSolving':
                strategy.approach = 'diagnostic';
                strategy.detailLevel = 'comprehensive';
                break;
            case 'learning':
                strategy.approach = 'educational';
                strategy.detailLevel = 'detailed';
                break;
            case 'implementation':
                strategy.approach = 'direct';
                strategy.format = 'code';
                break;
        }

        // 전문성 수준 기반 조정
        switch (projectContext.userExpertise) {
            case 'beginner':
                strategy.detailLevel = 'comprehensive';
                strategy.tone = 'encouraging';
                break;
            case 'expert':
                strategy.detailLevel = 'overview';
                strategy.tone = 'technical';
                break;
        }

        // 긴급도 기반 조정
        if (intent.urgency === 'critical') {
            strategy.approach = 'direct';
            strategy.detailLevel = 'overview';
        }

        return strategy;
    }

    /**
     * ⚡ 긴급도 분석
     */
    private analyzeUrgency(message: string, history: any[]): 'low' | 'medium' | 'high' | 'critical' {
        const urgentWords = /급해요|빨리|즉시|당장|긴급|critical|urgent/gi;
        const moderateWords = /빠른|신속|soon|asap/gi;
        
        if (urgentWords.test(message)) return 'critical';
        if (moderateWords.test(message)) return 'high';
        if (history.length > 3 && message.includes('아직')) return 'medium';
        
        return 'low';
    }

    /**
     * 🔑 키워드 추출
     */
    private extractKeywords(text: string): string[] {
        // 간단한 키워드 추출 (실제로는 더 정교한 NLP 사용)
        return text.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 2)
            .filter(word => !/^(이|그|저|것|는|은|이|가|을|를|에|에서|로|으로)$/.test(word));
    }
}

export default IntelligentContextAnalyzer;
