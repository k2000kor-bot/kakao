import enhancedWritingService from './enhancedWritingService';

export interface AdvancedWritingRequest {
    writingType: 'contextual' | 'semantic' | 'knowledge' | 'insight';
    targetAudience: 'expert' | 'analyst' | 'researcher' | 'strategist';
    writingGoal: 'educate' | 'analyze' | 'synthesize' | 'innovate';
    tone: 'analytical' | 'narrative' | 'technical' | 'insightful';
    length: 'short' | 'medium' | 'long' | 'comprehensive';
    keywords: string[];
    context: string;
    fileContexts: any[];
    semanticAnalysis?: any;
}

export interface AdvancedWritingResponse {
    success: boolean;
    content: string;
    confidence: number;
    persuasionScore: number;
    readability: number;
    emotionalImpact: number;
    contextRelevance: number;
    knowledgeIntegration: number;
    semanticCoherence: number;
    suggestions: string[];
    usedContexts: string[];
    generatedInsights: string[];
    semanticConnections: string[];
    error?: string;
}

export interface DeepContextAnalysis {
    fileId: string;
    fileName: string;
    semanticAnalysis: {
        topics: string[];
        entities: string[];
        relationships: string[];
        themes: string[];
        tone: string;
        complexity: number;
    };
    knowledgeGraph: {
        concepts: string[];
        connections: string[];
        insights: string[];
    };
}

class AdvancedContextualWritingService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8008';
    }

    /**
     * 고도화된 문맥 기반 글쓰기 생성
     */
    async generateAdvancedContextualWriting(
        sessionId: string,
        request: AdvancedWritingRequest
    ): Promise<AdvancedWritingResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/api/sessions/${sessionId}/advanced-contextual-writing`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('고도화된 문맥 글쓰기 생성 실패:', error);
            return {
                success: false,
                content: '',
                confidence: 0,
                persuasionScore: 0,
                readability: 0,
                emotionalImpact: 0,
                contextRelevance: 0,
                knowledgeIntegration: 0,
                semanticCoherence: 0,
                suggestions: [],
                usedContexts: [],
                generatedInsights: [],
                semanticConnections: [],
                error: error instanceof Error ? error.message : '알 수 없는 오류'
            };
        }
    }

    /**
     * 심층 문맥 분석 수행
     */
    async analyzeDeepContext(
        sessionId: string,
        fileContexts: any[]
    ): Promise<{ success: boolean; deepAnalysis?: DeepContextAnalysis[]; error?: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/api/sessions/${sessionId}/deep-context-analysis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fileContexts }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('심층 문맥 분석 실패:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '알 수 없는 오류'
            };
        }
    }

    /**
     * 문맥 관련성 계산
     */
    calculateContextRelevance(fileContexts: any[], userRequest: string): number {
        if (fileContexts.length === 0) return 0;

        let totalRelevance = 0;
        const userKeywords = this.extractKeywords(userRequest);

        for (const context of fileContexts) {
            const contextKeywords = context.keywords || [];
            const keywordOverlap = userKeywords.filter(keyword =>
                contextKeywords.some((ck: string) => ck.toLowerCase().includes(keyword.toLowerCase()))
            ).length;

            const relevance = Math.min(keywordOverlap / Math.max(userKeywords.length, 1), 1.0);
            totalRelevance += relevance;
        }

        return totalRelevance / fileContexts.length;
    }

    /**
     * 지식 통합도 계산
     */
    calculateKnowledgeIntegration(fileContexts: any[]): number {
        if (fileContexts.length === 0) return 0;

        let totalIntegration = 0;
        const allConcepts = new Set<string>();
        const allConnections = new Set<string>();

        for (const context of fileContexts) {
            const knowledgeGraph = context.knowledgeGraph || {};
            knowledgeGraph.concepts?.forEach((concept: string) => allConcepts.add(concept));
            knowledgeGraph.connections?.forEach((connection: string) => allConnections.add(connection));
        }

        const conceptDiversity = allConcepts.size / Math.max(fileContexts.length * 3, 1);
        const connectionDensity = allConnections.size / Math.max(fileContexts.length * 2, 1);

        totalIntegration = (conceptDiversity + connectionDensity) / 2;
        return Math.min(totalIntegration, 1.0);
    }

    /**
     * 시맨틱 일관성 계산
     */
    calculateSemanticCoherence(fileContexts: any[]): number {
        if (fileContexts.length === 0) return 0;

        const tones = fileContexts.map(context => context.semanticAnalysis?.tone || 'neutral');
        const themes = fileContexts.flatMap(context => context.semanticAnalysis?.themes || []);
        const topics = fileContexts.flatMap(context => context.semanticAnalysis?.topics || []);

        // 톤 일관성
        const toneConsistency = this.calculateConsistency(tones);

        // 테마 일관성
        const themeConsistency = this.calculateConsistency(themes);

        // 주제 일관성
        const topicConsistency = this.calculateConsistency(topics);

        return (toneConsistency + themeConsistency + topicConsistency) / 3;
    }

    /**
     * 일관성 계산 헬퍼 함수
     */
    private calculateConsistency(items: string[]): number {
        if (items.length === 0) return 0;

        const itemCounts = items.reduce((acc, item) => {
            acc[item] = (acc[item] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const maxCount = Math.max(...Object.values(itemCounts));
        return maxCount / items.length;
    }

    /**
     * 키워드 추출
     */
    private extractKeywords(text: string): string[] {
        const stopWords = ['이', '가', '을', '를', '의', '에', '로', '와', '과', '도', '는', '은', '이', '가', '을', '를'];
        const words = text.split(/\s+/).filter(word =>
            word.length > 1 && !stopWords.includes(word)
        );
        return Array.from(new Set(words));
    }

    /**
     * 고도화된 글쓰기 품질 분석
     */
    analyzeAdvancedWritingQuality(content: string, contextRelevance: number, knowledgeIntegration: number, semanticCoherence: number): {
        overallScore: number;
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
    } {
        const overallScore = (contextRelevance + knowledgeIntegration + semanticCoherence) / 3;

        const strengths: string[] = [];
        const weaknesses: string[] = [];
        const recommendations: string[] = [];

        if (contextRelevance > 0.7) {
            strengths.push('문맥과 높은 관련성을 보입니다');
        } else {
            weaknesses.push('문맥 활용도를 높일 필요가 있습니다');
            recommendations.push('더 많은 관련 파일을 선택하거나 키워드를 구체화해보세요');
        }

        if (knowledgeIntegration > 0.7) {
            strengths.push('지식 통합이 잘 이루어졌습니다');
        } else {
            weaknesses.push('지식 통합을 개선할 필요가 있습니다');
            recommendations.push('개념 간의 연결성을 더 강조해보세요');
        }

        if (semanticCoherence > 0.7) {
            strengths.push('시맨틱 일관성이 높습니다');
        } else {
            weaknesses.push('시맨틱 일관성을 개선할 필요가 있습니다');
            recommendations.push('일관된 톤과 테마를 유지해보세요');
        }

        return {
            overallScore,
            strengths,
            weaknesses,
            recommendations
        };
    }

    /**
     * 문맥 기반 인사이트 생성
     */
    generateContextualInsights(fileContexts: any[]): string[] {
        const insights: string[] = [];

        if (fileContexts.length === 0) {
            return ['분석할 파일이 없습니다. 파일을 업로드하고 선택해보세요.'];
        }

        // 주제별 그룹화
        const topicGroups = fileContexts.reduce((acc, context) => {
            const topics = context.semanticAnalysis?.topics || [];
            topics.forEach((topic: string) => {
                if (!acc[topic]) acc[topic] = [];
                acc[topic].push(context);
            });
            return acc;
        }, {} as Record<string, any[]>);

        // 주요 주제별 인사이트
        Object.entries(topicGroups).forEach(([topic, contexts]) => {
            if ((contexts as any[]).length > 1) {
                insights.push(`"${topic}" 관련 파일이 ${(contexts as any[]).length}개 발견되어 이 주제에 대한 깊이 있는 분석이 가능합니다.`);
            }
        });

        // 감정 분석 인사이트
        const sentiments = fileContexts.map(context => context.semanticAnalysis?.tone || 'neutral');
        const positiveCount = sentiments.filter(s => s === 'positive').length;
        const negativeCount = sentiments.filter(s => s === 'negative').length;

        if (positiveCount > negativeCount) {
            insights.push('전반적으로 긍정적인 톤의 문서들이 많아 낙관적인 관점의 글쓰기가 적합합니다.');
        } else if (negativeCount > positiveCount) {
            insights.push('신중한 톤의 문서들이 많아 균형잡힌 관점의 글쓰기가 필요합니다.');
        }

        // 복잡도 분석
        const complexities = fileContexts.map(context => context.semanticAnalysis?.complexity || 0.5);
        const avgComplexity = complexities.reduce((sum, c) => sum + c, 0) / complexities.length;

        if (avgComplexity > 0.7) {
            insights.push('고복잡도 문서들이 많아 전문적인 수준의 글쓰기가 적합합니다.');
        } else if (avgComplexity < 0.3) {
            insights.push('단순한 문서들이 많아 이해하기 쉬운 글쓰기가 적합합니다.');
        }

        return insights;
    }

    /**
     * 고도화된 글쓰기 템플릿 제공
     */
    getAdvancedWritingTemplates(): Record<string, Record<string, string>> {
        return {
            contextual: {
                analytical: "심층 문맥 분석을 바탕으로 전문적이고 통찰력 있는 내용을 작성합니다.",
                narrative: "문맥을 바탕으로 매력적인 스토리를 구성합니다.",
                technical: "기술적 관점에서 문맥을 분석하고 전문적인 내용을 작성합니다."
            },
            semantic: {
                analytical: "시맨틱 분석 결과를 바탕으로 깊이 있는 내용을 작성합니다.",
                insightful: "발견된 인사이트를 바탕으로 통찰력 있는 내용을 작성합니다."
            },
            knowledge: {
                graphical: "지식 그래프의 연결성을 바탕으로 체계적인 내용을 작성합니다.",
                conceptual: "추출된 개념들을 바탕으로 개념적 내용을 작성합니다."
            },
            insight: {
                discovery: "새로운 발견과 인사이트를 중심으로 혁신적인 내용을 작성합니다.",
                synthesis: "다양한 관점을 종합하여 통합적인 내용을 작성합니다."
            }
        };
    }
}

const advancedContextualWritingService = new AdvancedContextualWritingService();
export default advancedContextualWritingService; 