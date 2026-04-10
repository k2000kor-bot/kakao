/**
 * 웹검색 지식과 학습 내용 통합 서비스
 * 다양한 소스의 정보를 통합하여 논리적이고 포괄적인 답변 생성을 지원
 */

import { QuestionAnalysis } from './advancedNLPService';
import { coerceTrimmedString } from '../utils/chatInputUtils';

export interface KnowledgeSource {
    type: 'web_search' | 'news_api' | 'learned_content' | 'user_history' | 'expert_knowledge';
    content: string;
    reliability: number; // 0-1
    timestamp: Date;
    source: string;
    relevance: number; // 0-1
    metadata?: {
        domain?: string;
        author?: string;
        citations?: number;
        factCheck?: boolean;
    };
}

export interface IntegratedKnowledge {
    synthesizedContent: string;
    supportingEvidence: KnowledgeSource[];
    contradictingEvidence: KnowledgeSource[];
    confidenceScore: number;
    gapsIdentified: string[];
    recommendedSources: string[];
    logicalFlow: {
        premises: string[];
        reasoning: string[];
        conclusions: string[];
    };
}

export interface LearningContext {
    userPreferences: {
        detailLevel: 'brief' | 'moderate' | 'comprehensive';
        evidencePreference: 'minimal' | 'balanced' | 'extensive';
        sourceTypes: string[];
        domainExpertise: Map<string, number>; // domain -> expertise level (0-1)
    };
    conversationHistory: {
        topics: string[];
        patterns: string[];
        satisfactionScores: number[];
        commonQuestions: string[];
    };
    learnedInsights: {
        factualKnowledge: Map<string, string>;
        conceptualUnderstanding: Map<string, string>;
        proceduralKnowledge: Map<string, string[]>;
        contextualPatterns: Map<string, string[]>;
    };
}

export class KnowledgeIntegrationService {
    private knowledgeBase: Map<string, KnowledgeSource[]> = new Map();
    private learningContext: LearningContext;
    private reliabilityWeights: Map<string, number> = new Map();

    constructor() {
        this.initializeReliabilityWeights();
        this.learningContext = this.initializeLearningContext();
    }

    private initializeReliabilityWeights(): void {
        this.reliabilityWeights.set('news_api', 0.8);
        this.reliabilityWeights.set('web_search', 0.6);
        this.reliabilityWeights.set('learned_content', 0.9);
        this.reliabilityWeights.set('user_history', 0.7);
        this.reliabilityWeights.set('expert_knowledge', 0.95);
    }

    private initializeLearningContext(): LearningContext {
        return {
            userPreferences: {
                detailLevel: 'moderate',
                evidencePreference: 'balanced',
                sourceTypes: ['news_api', 'web_search', 'learned_content'],
                domainExpertise: new Map([
                    ['technology', 0.6],
                    ['business', 0.5],
                    ['real_estate', 0.4],
                    ['finance', 0.3]
                ])
            },
            conversationHistory: {
                topics: [],
                patterns: [],
                satisfactionScores: [],
                commonQuestions: []
            },
            learnedInsights: {
                factualKnowledge: new Map(),
                conceptualUnderstanding: new Map(),
                proceduralKnowledge: new Map(),
                contextualPatterns: new Map()
            }
        };
    }

    /**
     * 다양한 소스의 지식을 통합하여 종합적인 답변 생성
     */
    async integrateKnowledge(
        question: string,
        questionAnalysis: QuestionAnalysis,
        webSearchResults: Record<string, unknown>[] = [],
        newsResults: Record<string, unknown>[] = [],
        conversationHistory: string[] = []
    ): Promise<IntegratedKnowledge> {

        // 1. 지식 소스 수집 및 평가
        const knowledgeSources = await this.collectKnowledgeSources(
            question,
            questionAnalysis,
            webSearchResults,
            newsResults,
            conversationHistory
        );

        // 2. 관련성 및 신뢰성 평가
        const evaluatedSources = this.evaluateSources(knowledgeSources, questionAnalysis);

        // 3. 지식 통합 및 합성
        const integratedKnowledge = await this.synthesizeKnowledge(
            evaluatedSources,
            questionAnalysis
        );

        // 4. 학습 컨텍스트 업데이트
        this.updateLearningContext(question, questionAnalysis, integratedKnowledge);

        return integratedKnowledge;
    }

    private async collectKnowledgeSources(
        question: string,
        analysis: QuestionAnalysis,
        webSearchResults: Record<string, unknown>[],
        newsResults: Record<string, unknown>[],
        conversationHistory: string[]
    ): Promise<KnowledgeSource[]> {

        const sources: KnowledgeSource[] = [];

        // 웹 검색 결과 처리
        webSearchResults.forEach(result => {
            const r = result as Record<string, unknown>;
            const snippet = String(r.snippet ?? r.content ?? '');
            const link = String(r.link ?? r.url ?? '');
            sources.push({
                type: 'web_search',
                content: snippet || String(r.content ?? ''),
                reliability: this.calculateWebSourceReliability(result),
                timestamp: new Date(),
                source: link || String(r.url ?? ''),
                relevance: this.calculateRelevance(snippet || String(r.content ?? ''), question),
                metadata: {
                    domain: this.extractDomain(link),
                    factCheck: this.isFactCheckSource(link)
                }
            });
        });

        // 뉴스 API 결과 처리
        newsResults.forEach(article => {
            const a = article as Record<string, unknown>;
            const content = String(a.description ?? a.content ?? '');
            const publishedAt = a.publishedAt;
            const url = String(a.url ?? '');
            const author = a.author as string | undefined;
            sources.push({
                type: 'news_api',
                content: content || String(a.content ?? ''),
                reliability: this.calculateNewsReliability(article),
                timestamp: new Date(publishedAt instanceof Date ? publishedAt : String(publishedAt ?? '')),
                source: url || String(a.url ?? ''),
                relevance: this.calculateRelevance(content, question),
                metadata: {
                    domain: 'news',
                    author: author,
                    factCheck: true
                }
            });
        });

        // 학습된 내용 검색
        const learnedContent = this.searchLearnedContent(question, analysis);
        sources.push(...learnedContent);

        // 사용자 히스토리에서 관련 내용 추출
        const historyContent = this.extractFromHistory(conversationHistory, question);
        sources.push(...historyContent);

        return sources;
    }

    private evaluateSources(sources: KnowledgeSource[], analysis: QuestionAnalysis): KnowledgeSource[] {
        return sources
            .map(source => ({
                ...source,
                reliability: this.adjustReliabilityByContext(source, analysis),
                relevance: this.adjustRelevanceByIntent(source, analysis)
            }))
            .filter(source => source.relevance > 0.3) // 관련성이 낮은 소스 제외
            .sort((a, b) => (b.reliability * b.relevance) - (a.reliability * a.relevance));
    }

    private async synthesizeKnowledge(
        sources: KnowledgeSource[],
        analysis: QuestionAnalysis
    ): Promise<IntegratedKnowledge> {

        // 지원하는 증거와 반박하는 증거 분류
        const supportingEvidence = sources.filter(s => s.relevance > 0.6);
        const contradictingEvidence = this.identifyContradictions(sources);

        // 논리적 흐름 구성
        const logicalFlow = this.constructLogicalFlow(supportingEvidence, analysis);

        // 내용 합성
        const synthesizedContent = await this.generateSynthesizedContent(
            supportingEvidence,
            analysis,
            logicalFlow
        );

        // 신뢰도 점수 계산
        const confidenceScore = this.calculateConfidenceScore(supportingEvidence, contradictingEvidence);

        // 지식 공백 식별
        const gapsIdentified = this.identifyKnowledgeGaps(analysis, sources);

        // 추천 소스 생성
        const recommendedSources = this.generateRecommendedSources(analysis, gapsIdentified);

        return {
            synthesizedContent,
            supportingEvidence,
            contradictingEvidence,
            confidenceScore,
            gapsIdentified,
            recommendedSources,
            logicalFlow
        };
    }

    private constructLogicalFlow(sources: KnowledgeSource[], analysis: QuestionAnalysis): IntegratedKnowledge['logicalFlow'] {
        const premises: string[] = [];
        const reasoning: string[] = [];
        const conclusions: string[] = [];

        // 전제 수집
        sources.forEach(source => {
            if (source.reliability > 0.7) {
                const factualClaims = this.extractFactualClaims(source.content);
                premises.push(...factualClaims);
            }
        });

        // 추론 과정 구성
        switch (analysis.questionType) {
            case 'analytical':
                reasoning.push('수집된 데이터 분석');
                reasoning.push('패턴 및 트렌드 식별');
                reasoning.push('원인-결과 관계 분석');
                break;
            case 'comparative':
                reasoning.push('비교 기준 설정');
                reasoning.push('각 요소별 평가');
                reasoning.push('차이점 및 유사점 분석');
                break;
            case 'explanatory':
                reasoning.push('개념 정의 및 배경 설명');
                reasoning.push('메커니즘 또는 과정 분석');
                reasoning.push('실제 적용 사례 검토');
                break;
        }

        // 결론 도출
        const highConfidenceSources = sources.filter(s => s.reliability > 0.8);
        if (highConfidenceSources.length > 0) {
            conclusions.push('신뢰할 수 있는 다수의 소스가 일치하는 견해');
        }
        if (analysis.intent.expectedDepth === 'expert') {
            conclusions.push('전문적 관점에서의 종합 판단');
        }

        return { premises, reasoning, conclusions };
    }

    private async generateSynthesizedContent(
        sources: KnowledgeSource[],
        analysis: QuestionAnalysis,
        logicalFlow: IntegratedKnowledge['logicalFlow']
    ): Promise<string> {

        let content = '';

        // 질문 유형에 따른 구조화된 답변 생성
        switch (analysis.questionType) {
            case 'factual':
                content = this.generateFactualResponse(sources, analysis);
                break;
            case 'analytical':
                content = this.generateAnalyticalResponse(sources, analysis, logicalFlow);
                break;
            case 'comparative':
                content = this.generateComparativeResponse(sources, analysis);
                break;
            case 'explanatory':
                content = this.generateExplanatoryResponse(sources, analysis, logicalFlow);
                break;
            default:
                content = this.generateGeneralResponse(sources, analysis);
        }

        // 사용자 선호도에 따른 조정
        content = this.adjustContentByPreferences(content, analysis);

        return content;
    }

    private generateAnalyticalResponse(
        sources: KnowledgeSource[],
        analysis: QuestionAnalysis,
        logicalFlow: IntegratedKnowledge['logicalFlow']
    ): string {

        let response = '';

        // 1. 문제 정의
        response += '## 📊 분석 개요\n\n';
        response += `${analysis.intent.primary}에 대한 종합적 분석을 수행했습니다.\n\n`;

        // 2. 핵심 발견사항
        response += '## 🔍 핵심 발견사항\n\n';
        const keyFindings = this.extractKeyFindings(sources);
        keyFindings.forEach((finding, index) => {
            response += `${index + 1}. **${finding.title}**: ${finding.content}\n`;
        });
        response += '\n';

        // 3. 데이터 기반 분석
        response += '## 📈 데이터 기반 분석\n\n';
        const statisticalData = sources.filter(s => s.content.includes('통계') || s.content.includes('%'));
        if (statisticalData.length > 0) {
            statisticalData.forEach(data => {
                response += `- ${this.extractStatistics(data.content)}\n`;
            });
        } else {
            response += '정량적 데이터는 제한적이나, 정성적 분석을 통해 다음과 같은 인사이트를 도출했습니다:\n';
        }
        response += '\n';

        // 4. 논리적 추론
        response += '## 🧠 논리적 추론 과정\n\n';
        logicalFlow.reasoning.forEach((step, index) => {
            response += `**${index + 1}단계**: ${step}\n`;
        });
        response += '\n';

        // 5. 결론 및 시사점
        response += '## 💡 결론 및 시사점\n\n';
        logicalFlow.conclusions.forEach(conclusion => {
            response += `- ${conclusion}\n`;
        });

        return response;
    }

    private generateComparativeResponse(sources: KnowledgeSource[], analysis: QuestionAnalysis): string {
        let response = '';

        response += '## ⚖️ 비교 분석\n\n';

        // 비교 기준 설정
        const comparisonCriteria = this.identifyComparisonCriteria(sources, analysis);
        response += '### 📋 비교 기준\n\n';
        comparisonCriteria.forEach((criterion, index) => {
            response += `${index + 1}. ${criterion}\n`;
        });
        response += '\n';

        // 각 항목별 분석
        response += '### 📊 항목별 분석\n\n';
        const items = this.extractComparisonItems(sources);
        items.forEach(item => {
            response += `**${item.name}**\n`;
            response += `- 장점: ${item.advantages.join(', ')}\n`;
            response += `- 단점: ${item.disadvantages.join(', ')}\n`;
            response += `- 특징: ${item.features.join(', ')}\n\n`;
        });

        // 종합 평가
        response += '### 🎯 종합 평가\n\n';
        response += this.generateComparisonSummary(items, comparisonCriteria);

        return response;
    }

    private generateExplanatoryResponse(
        sources: KnowledgeSource[],
        analysis: QuestionAnalysis,
        _logicalFlow: IntegratedKnowledge['logicalFlow']
    ): string {

        let response = '';

        // 1. 개념 정의
        response += '## 📚 개념 정의\n\n';
        const definitions = this.extractDefinitions(sources);
        definitions.forEach(def => {
            response += `**${def.term}**: ${def.definition}\n\n`;
        });

        // 2. 배경 설명
        response += '## 🌐 배경 및 맥락\n\n';
        const background = this.extractBackground(sources, analysis);
        response += `${background}\n\n`;

        // 3. 단계별 과정 (해당하는 경우)
        if (analysis.requirements.formatPreferences.includes('step_by_step')) {
            response += '## 📝 단계별 과정\n\n';
            const steps = this.extractSteps(sources);
            steps.forEach((step, index) => {
                response += `**${index + 1}단계**: ${step}\n`;
            });
            response += '\n';
        }

        // 4. 실제 적용 예시
        response += '## 💼 실제 적용 예시\n\n';
        const examples = this.extractExamples(sources);
        examples.forEach((example, index) => {
            response += `**예시 ${index + 1}**: ${example}\n\n`;
        });

        return response;
    }

    // 유틸리티 메서드들
    private calculateWebSourceReliability(result: Record<string, unknown>): number {
        let reliability = 0.6; // 기본값
        const link = String(result.link ?? '');

        if (link.includes('.edu')) reliability += 0.2;
        if (link.includes('.gov')) reliability += 0.3;
        if (link.includes('wikipedia')) reliability += 0.1;

        return Math.min(reliability, 1.0);
    }

    private calculateNewsReliability(article: Record<string, unknown>): number {
        let reliability = 0.7; // 기본값
        const sourceName = String((article.source as Record<string, unknown> | undefined)?.name ?? '');

        if (sourceName.includes('Reuters') ||
            sourceName.includes('AP') ||
            sourceName.includes('BBC')) {
            reliability += 0.2;
        }

        return Math.min(reliability, 1.0);
    }

    private calculateRelevance(content: string, question: string): number {
        const questionWords = question.toLowerCase().split(/\s+/);
        const contentWords = content.toLowerCase().split(/\s+/);

        const matches = questionWords.filter(word =>
            contentWords.some(cWord => cWord.includes(word) || word.includes(cWord))
        );

        return matches.length / questionWords.length;
    }

    private searchLearnedContent(question: string, analysis: QuestionAnalysis): KnowledgeSource[] {
        const sources: KnowledgeSource[] = [];

        // 도메인별 학습된 내용 검색
        analysis.context.domain.forEach(domain => {
            const domainKnowledge = this.learningContext.learnedInsights.factualKnowledge.get(domain);
            if (domainKnowledge) {
                sources.push({
                    type: 'learned_content',
                    content: domainKnowledge,
                    reliability: 0.9,
                    timestamp: new Date(),
                    source: 'internal_knowledge_base',
                    relevance: 0.8
                });
            }
        });

        return sources;
    }

    private extractFromHistory(history: string[], question: string): KnowledgeSource[] {
        const sources: KnowledgeSource[] = [];

        history.forEach((msg, index) => {
            const relevance = this.calculateRelevance(msg, question);
            if (relevance > 0.4) {
                sources.push({
                    type: 'user_history',
                    content: msg,
                    reliability: 0.7,
                    timestamp: new Date(Date.now() - (history.length - index) * 60000),
                    source: 'conversation_history',
                    relevance
                });
            }
        });

        return sources;
    }

    private adjustReliabilityByContext(source: KnowledgeSource, analysis: QuestionAnalysis): number {
        let adjustedReliability = source.reliability;

        // 도메인 전문성에 따른 조정
        analysis.context.domain.forEach(domain => {
            const expertise = this.learningContext.userPreferences.domainExpertise.get(domain) || 0.5;
            if (source.metadata?.domain === domain) {
                adjustedReliability *= (1 + expertise * 0.2);
            }
        });

        return Math.min(adjustedReliability, 1.0);
    }

    private adjustRelevanceByIntent(source: KnowledgeSource, analysis: QuestionAnalysis): number {
        let adjustedRelevance = source.relevance;

        // 의도에 따른 관련성 조정
        if (analysis.intent.implicitNeeds.includes('news_search') && source.type === 'news_api') {
            adjustedRelevance *= 1.3;
        }

        if (analysis.intent.expectedDepth === 'expert' && source.type === 'learned_content') {
            adjustedRelevance *= 1.2;
        }

        return Math.min(adjustedRelevance, 1.0);
    }

    private identifyContradictions(sources: KnowledgeSource[]): KnowledgeSource[] {
        // 간단한 모순 감지 로직 (실제로는 더 정교한 NLP 분석 필요)
        const contradictions: KnowledgeSource[] = [];

        sources.forEach(source => {
            if (source.content.includes('반면') ||
                source.content.includes('하지만') ||
                source.content.includes('그러나')) {
                contradictions.push(source);
            }
        });

        return contradictions;
    }

    private calculateConfidenceScore(supporting: KnowledgeSource[], contradicting: KnowledgeSource[]): number {
        const supportingWeight = supporting.reduce((sum, s) => sum + (s.reliability * s.relevance), 0);
        const contradictingWeight = contradicting.reduce((sum, s) => sum + (s.reliability * s.relevance), 0);

        const totalWeight = supportingWeight + contradictingWeight;
        if (totalWeight === 0) return 0.5;

        return supportingWeight / totalWeight;
    }

    private identifyKnowledgeGaps(analysis: QuestionAnalysis, sources: KnowledgeSource[]): string[] {
        const gaps: string[] = [];

        // 요구된 정보 유형이 부족한지 확인
        if (analysis.requirements.informationTypes.includes('statistical_data')) {
            const hasStats = sources.some(s => s.content.includes('통계') || s.content.includes('%'));
            if (!hasStats) {
                gaps.push('통계적 데이터 부족');
            }
        }

        if (analysis.requirements.informationTypes.includes('examples')) {
            const hasExamples = sources.some(s => s.content.includes('예시') || s.content.includes('사례'));
            if (!hasExamples) {
                gaps.push('구체적 사례 부족');
            }
        }

        return gaps;
    }

    private generateRecommendedSources(analysis: QuestionAnalysis, gaps: string[]): string[] {
        const recommendations: string[] = [];

        gaps.forEach(gap => {
            switch (gap) {
                case '통계적 데이터 부족':
                    recommendations.push('통계청, 한국은행 등 공식 통계 기관');
                    break;
                case '구체적 사례 부족':
                    recommendations.push('업계 보고서, 케이스 스터디 자료');
                    break;
                default:
                    recommendations.push('추가적인 전문 자료 검색 권장');
            }
        });

        return recommendations;
    }

    private updateLearningContext(
        question: string,
        analysis: QuestionAnalysis,
        knowledge: IntegratedKnowledge
    ): void {
        // 대화 히스토리 업데이트
        this.learningContext.conversationHistory.topics.push(...analysis.context.domain);

        // 학습된 인사이트 업데이트
        analysis.context.domain.forEach(domain => {
            const existingKnowledge = this.learningContext.learnedInsights.factualKnowledge.get(domain) || '';
            const newKnowledge = coerceTrimmedString(
              `${existingKnowledge}\n${knowledge.synthesizedContent}`,
              ''
            );
            this.learningContext.learnedInsights.factualKnowledge.set(domain, newKnowledge);
        });
    }

    // 추가 유틸리티 메서드들 (간소화된 구현)
    private extractKeyFindings(sources: KnowledgeSource[]): Array<{ title: string, content: string }> {
        return sources.map((source, index) => ({
            title: `핵심 발견 ${index + 1}`,
            content: source.content
        }));
    }

    private extractStatistics(content: string): string {
        const statMatch = content.match(/\d+%|\d+명|\d+건|\d+억|\d+만/);
        return statMatch ? `관련 통계: ${statMatch[0]}` : '정량적 지표 확인 필요';
    }

    private identifyComparisonCriteria(_sources: KnowledgeSource[], _analysis: QuestionAnalysis): string[] {
        return ['기능성', '비용 효율성', '사용 편의성', '신뢰성']; // 기본 비교 기준
    }

    private extractComparisonItems(_sources: KnowledgeSource[]): Array<{
        name: string,
        advantages: string[],
        disadvantages: string[],
        features: string[]
    }> {
        return []; // 실제 구현에서는 소스에서 비교 항목 추출
    }

    private generateComparisonSummary(_items: Record<string, unknown>[], _criteria: string[]): string {
        return '종합적으로 고려할 때, 각 옵션은 고유한 장단점을 가지고 있으며, 선택은 개별 요구사항에 따라 달라질 수 있습니다.';
    }

    private extractDefinitions(_sources: KnowledgeSource[]): Array<{ term: string, definition: string }> {
        return []; // 실제 구현에서는 정의 추출
    }

    private extractBackground(sources: KnowledgeSource[], _analysis: QuestionAnalysis): string {
        return sources.length > 0 ? sources[0].content : '배경 정보를 수집 중입니다.';
    }

    private extractSteps(_sources: KnowledgeSource[]): string[] {
        return ['1단계 정보 수집', '2단계 분석', '3단계 결론 도출']; // 기본 단계
    }

    private extractExamples(sources: KnowledgeSource[]): string[] {
        return sources.filter(s => s.content.includes('예')).map(s => s.content.substring(0, 100));
    }

    private adjustContentByPreferences(content: string, _analysis: QuestionAnalysis): string {
        const detailLevel = this.learningContext.userPreferences.detailLevel;

        if (detailLevel === 'brief' && content.length > 500) {
            return content.substring(0, 500) + '\n\n[요약된 내용입니다. 더 자세한 정보가 필요하시면 말씀해 주세요.]';
        }

        return content;
    }

    private extractDomain(url: string): string {
        try {
            return new URL(url).hostname;
        } catch {
            return 'unknown';
        }
    }

    private isFactCheckSource(url: string): boolean {
        const factCheckDomains = ['snopes.com', 'factcheck.org', 'politifact.com'];
        return factCheckDomains.some(domain => url.includes(domain));
    }

    private extractFactualClaims(content: string): string[] {
        // 간단한 사실 추출 로직
        const sentences = content.split(/[.!?]/).filter((s) => coerceTrimmedString(s, '').length > 10);
        return sentences;
    }

    private generateFactualResponse(sources: KnowledgeSource[], _analysis: QuestionAnalysis): string {
        let response = '## 📋 핵심 정보\n\n';

        sources.forEach((source, index) => {
            response += `**${index + 1}.** ${source.content}\n\n`;
        });

        return response;
    }

    private generateGeneralResponse(sources: KnowledgeSource[], _analysis: QuestionAnalysis): string {
        let response = '## 💡 종합 답변\n\n';

        if (sources.length > 0) {
            response += `${sources[0].content.substring(0, 300)}...\n\n`;

            if (sources.length > 1) {
                response += '## 📚 추가 정보\n\n';
                sources.slice(1, 3).forEach((source, _index) => {
                    response += `- ${source.content.substring(0, 100)}...\n`;
                });
            }
        } else {
            response += '요청하신 정보에 대해 추가적인 검색이 필요합니다.';
        }

        return response;
    }
}

export const knowledgeIntegrationService = new KnowledgeIntegrationService();
