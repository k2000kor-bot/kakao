export interface WritingStyle {
    tone: 'formal' | 'casual' | 'professional' | 'friendly' | 'academic' | 'creative';
    complexity: 'simple' | 'moderate' | 'complex';
    formality: 'very_formal' | 'formal' | 'neutral' | 'casual' | 'very_casual';
    audience: 'general' | 'expert' | 'student' | 'business' | 'technical';
    purpose: 'inform' | 'persuade' | 'entertain' | 'educate' | 'analyze';
}

export interface PoliticalTendency {
    bias: 'neutral' | 'progressive' | 'conservative' | 'centrist' | 'liberal';
    perspective: 'balanced' | 'left_leaning' | 'right_leaning' | 'moderate';
    approach: 'objective' | 'subjective' | 'analytical' | 'opinionated';
}

export interface MessageFormat {
    structure: 'narrative' | 'analytical' | 'persuasive' | 'descriptive' | 'comparative';
    length: 'brief' | 'moderate' | 'detailed' | 'comprehensive';
    organization: 'chronological' | 'logical' | 'thematic' | 'problem_solution';
    emphasis: 'facts' | 'opinions' | 'emotions' | 'data' | 'stories';
}

export interface TextProcessingRequest {
    originalText: string;
    targetStyle: WritingStyle;
    politicalContext: PoliticalTendency;
    format: MessageFormat;
    additionalRequirements?: string[];
    targetLength?: number;
    keywords?: string[];
}

export interface ProcessingStage {
    name: string;
    description: string;
    input: unknown;
    output: unknown;
    processingTime: number;
    confidence: number;
}

export interface ProcessedText {
    finalContent: string;
    stages: ProcessingStage[];
    metadata: {
        originalLength: number;
        finalLength: number;
        processingTime: number;
        styleApplied: WritingStyle;
        politicalBalance: PoliticalTendency;
        formatUsed: MessageFormat;
        readabilityScore: number;
        complexityLevel: string;
        keyThemes: string[];
        sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    };
    alternatives: {
        brief: string;
        detailed: string;
        technical: string;
        casual: string;
    };
}

class AdvancedTextProcessor {
    private processingModules: Map<string, (input: unknown) => Promise<unknown>> = new Map();

    constructor() {
        this.initializeModules();
    }

    private initializeModules() {
        // 1. 텍스트 분석 모듈
        this.processingModules.set('textAnalyzer', async (input: unknown) => {
            const text = input as string;
            const startTime = Date.now();

            const analysis = {
                length: text.length,
                wordCount: text.split(/\s+/).length,
                sentenceCount: text.split(/[.!?]+/).length - 1,
                paragraphCount: text.split(/\n\s*\n/).length,
                complexity: this.analyzeComplexity(text),
                sentiment: this.analyzeSentiment(text),
                keyThemes: this.extractThemes(text),
                readability: this.calculateReadability(text)
            };

            return {
                success: true,
                data: analysis,
                processingTime: Date.now() - startTime,
                confidence: 0.85
            };
        });

        // 2. 스타일 변환 모듈
        this.processingModules.set('styleTransformer', async (input: unknown) => {
            const { text, targetStyle } = input as { text: string; targetStyle: WritingStyle };
            const startTime = Date.now();

            const transformed = this.applyWritingStyle(text, targetStyle);

            return {
                success: true,
                data: transformed,
                processingTime: Date.now() - startTime,
                confidence: 0.88
            };
        });

        // 3. 정치적 성향 조정 모듈
        this.processingModules.set('politicalBalancer', async (input: unknown) => {
            const { text, context } = input as { text: string; context: PoliticalTendency };
            const startTime = Date.now();

            const balanced = this.adjustPoliticalTendency(text, context);

            return {
                success: true,
                data: balanced,
                processingTime: Date.now() - startTime,
                confidence: 0.82
            };
        });

        // 4. 형식 구조화 모듈
        this.processingModules.set('formatStructuring', async (input: unknown) => {
            const { text, format } = input as { text: string; format: MessageFormat };
            const startTime = Date.now();

            const structured = this.structureMessage(text, format);

            return {
                success: true,
                data: structured,
                processingTime: Date.now() - startTime,
                confidence: 0.90
            };
        });

        // 5. 품질 검증 모듈
        this.processingModules.set('qualityValidator', async (input: unknown) => {
            const { text, requirements } = input as { text: string; requirements: { targetLength?: number; keywords?: string[] } };
            const startTime = Date.now();

            const validation = this.validateQuality(text, requirements);

            return {
                success: true,
                data: validation,
                processingTime: Date.now() - startTime,
                confidence: 0.95
            };
        });
    }

    async processText(request: TextProcessingRequest): Promise<ProcessedText> {
        const stages: ProcessingStage[] = [];
        let currentText = request.originalText;
        const startTime = Date.now();

        // 1단계: 텍스트 분석
        const analysisStage = await this.executeStage('textAnalyzer', currentText);
        stages.push(analysisStage);

        // 2단계: 스타일 변환
        const styleStage = await this.executeStage('styleTransformer', {
            text: currentText,
            targetStyle: request.targetStyle
        });
        stages.push(styleStage);
        currentText = (styleStage.output as { data: string }).data;

        // 3단계: 정치적 성향 조정
        const politicalStage = await this.executeStage('politicalBalancer', {
            text: currentText,
            context: request.politicalContext
        });
        stages.push(politicalStage);
        currentText = (politicalStage.output as { data: string }).data;

        // 4단계: 형식 구조화
        const formatStage = await this.executeStage('formatStructuring', {
            text: currentText,
            format: request.format
        });
        stages.push(formatStage);
        currentText = (formatStage.output as { data: string }).data;

        // 5단계: 품질 검증 및 최종 조정
        const validationStage = await this.executeStage('qualityValidator', {
            text: currentText,
            requirements: {
                targetLength: request.targetLength,
                keywords: request.keywords,
                additionalRequirements: request.additionalRequirements
            }
        });
        stages.push(validationStage);

        // 최종 텍스트 조정
        const validationData = (validationStage.output as { data: { meetsLength?: boolean; includesKeywords?: boolean; readability?: number; coherence?: number; completeness?: number } }).data;
        const validationForFinalize = { meetsLength: validationData.meetsLength ?? false, includesKeywords: validationData.includesKeywords ?? false };
        const finalText = this.finalizeText(currentText, request, validationForFinalize);

        // 대안 버전 생성
        const alternatives = this.generateAlternatives(finalText, request);

        return {
            finalContent: finalText,
            stages,
            metadata: {
                originalLength: request.originalText.length,
                finalLength: finalText.length,
                processingTime: Date.now() - startTime,
                styleApplied: request.targetStyle,
                politicalBalance: request.politicalContext,
                formatUsed: request.format,
                readabilityScore: this.calculateReadability(finalText),
                complexityLevel: this.analyzeComplexity(finalText),
                keyThemes: this.extractThemes(finalText),
                sentiment: this.analyzeSentiment(finalText)
            },
            alternatives
        };
    }

    private async executeStage(stageName: string, input: unknown): Promise<ProcessingStage> {
        const module = this.processingModules.get(stageName);
        if (!module) {
            throw new Error(`Unknown processing module: ${stageName}`);
        }

        const startTime = Date.now();
        const result = await module(input) as { confidence?: number };
        const processingTime = Date.now() - startTime;

        return {
            name: stageName,
            description: this.getStageDescription(stageName),
            input,
            output: result,
            processingTime,
            confidence: result.confidence ?? 0
        };
    }

    private getStageDescription(stageName: string): string {
        const descriptions: { [key: string]: string } = {
            textAnalyzer: '텍스트의 기본 특성과 복잡도 분석',
            styleTransformer: '요청된 글쓰기 스타일에 맞춘 텍스트 변환',
            politicalBalancer: '정치적 성향과 균형감 조정',
            formatStructuring: '메시지 형식과 구조화 적용',
            qualityValidator: '최종 품질 검증 및 조정'
        };
        return descriptions[stageName] || '알 수 없는 단계';
    }

    private analyzeComplexity(text: string): string {
        const wordCount = text.split(/\s+/).length;
        const avgWordLength = text.replace(/\s+/g, '').length / wordCount;
        const sentenceCount = text.split(/[.!?]+/).length - 1;
        const avgSentenceLength = wordCount / sentenceCount;

        if (avgWordLength > 6 || avgSentenceLength > 25) return 'complex';
        if (avgWordLength > 4 || avgSentenceLength > 15) return 'moderate';
        return 'simple';
    }

    private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' | 'mixed' {
        const positiveWords = ['좋다', '훌륭하다', '성공', '완료', '진행', '개선', '향상', '긍정', '희망', '미래'];
        const negativeWords = ['문제', '실패', '지연', '오류', '실패', '어려움', '불만', '부정', '우려', '위험'];

        const lowerText = text.toLowerCase();
        const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
        const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

        if (positiveCount > negativeCount && positiveCount > 0) return 'positive';
        if (negativeCount > positiveCount && negativeCount > 0) return 'negative';
        if (positiveCount > 0 && negativeCount > 0) return 'mixed';
        return 'neutral';
    }

    private extractThemes(text: string): string[] {
        const themes = [
            '경제', '정치', '사회', '문화', '기술', '환경', '교육', '의료', '안전', '복지',
            '개발', '혁신', '성장', '변화', '미래', '전통', '현대화', '국제화', '지역', '국가'
        ];

        const lowerText = text.toLowerCase();
        return themes.filter(theme => lowerText.includes(theme));
    }

    private calculateReadability(text: string): number {
        const words = text.split(/\s+/).length;
        const sentences = text.split(/[.!?]+/).length - 1;
        const syllables = this.countSyllables(text);

        if (words === 0 || sentences === 0) return 0;

        // 한국어 가독성 공식 (수정된 Flesch-Kincaid)
        const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
        return Math.max(0, Math.min(100, score));
    }

    private countSyllables(text: string): number {
        // 한국어 음절 수 계산 (대략적)
        const koreanChars = text.match(/[가-힣]/g) || [];
        return koreanChars.length;
    }

    private applyWritingStyle(text: string, style: WritingStyle): string {
        let processedText = text;

        // 톤 조정
        switch (style.tone) {
            case 'formal':
                processedText = this.makeFormal(processedText);
                break;
            case 'casual':
                processedText = this.makeCasual(processedText);
                break;
            case 'professional':
                processedText = this.makeProfessional(processedText);
                break;
            case 'academic':
                processedText = this.makeAcademic(processedText);
                break;
            case 'creative':
                processedText = this.makeCreative(processedText);
                break;
        }

        // 복잡도 조정
        switch (style.complexity) {
            case 'simple':
                processedText = this.simplifyText(processedText);
                break;
            case 'complex':
                processedText = this.complexifyText(processedText);
                break;
        }

        // 목적에 따른 조정
        switch (style.purpose) {
            case 'persuade':
                processedText = this.addPersuasiveElements(processedText);
                break;
            case 'educate':
                processedText = this.addEducationalElements(processedText);
                break;
            case 'analyze':
                processedText = this.addAnalyticalElements(processedText);
                break;
        }

        return processedText;
    }

    private makeFormal(text: string): string {
        return text
            .replace(/~다/g, '~입니다')
            .replace(/~어/g, '~습니다')
            .replace(/~야/g, '~입니다')
            .replace(/~이야/g, '~입니다')
            .replace(/~거든/g, '~기 때문입니다')
            .replace(/~잖아/g, '~이지 않습니까');
    }

    private makeCasual(text: string): string {
        return text
            .replace(/~입니다/g, '~야')
            .replace(/~습니다/g, '~어')
            .replace(/~이지 않습니까/g, '~잖아')
            .replace(/~기 때문입니다/g, '~거든');
    }

    private makeProfessional(text: string): string {
        return text
            .replace(/~다/g, '~입니다')
            .replace(/~어/g, '~습니다')
            + '\n\n이러한 관점에서 볼 때, 체계적이고 전문적인 접근이 필요합니다.';
    }

    private makeAcademic(text: string): string {
        return `본 연구에서는 ${text}에 대해 분석하고자 한다. 

문헌 검토를 통해 다음과 같은 사항을 확인할 수 있다:

1. 이론적 배경
2. 연구 방법론
3. 분석 결과
4. 결론 및 제언

이러한 분석을 통해 학술적 가치를 창출할 수 있을 것으로 기대된다.`;
    }

    private makeCreative(text: string): string {
        return `✨ ${text} ✨

상상력을 자극하는 이 주제는 우리에게 새로운 관점을 제시합니다.

🎨 창의적 사고로 접근해보면:
• 색다른 해석
• 독창적 아이디어
• 혁신적 접근

이처럼 창의성은 우리의 사고를 확장시키는 원동력이 됩니다! 🌟`;
    }

    private simplifyText(text: string): string {
        // 복잡한 문장을 단순화
        const sentences = text.split(/[.!?]+/);
        const simplified = sentences.map(sentence => {
            if (sentence.length > 50) {
                return sentence.substring(0, 50) + '...';
            }
            return sentence;
        });
        return simplified.join('. ');
    }

    private complexifyText(text: string): string {
        // 더 복잡하고 상세한 설명 추가
        return text + '\n\n이러한 맥락에서 더 깊이 있는 분석이 필요하다. 다양한 관점과 이론적 배경을 고려할 때, 이 문제는 단순한 현상이 아닌 복합적인 요인들의 상호작용으로 이해되어야 한다.';
    }

    private addPersuasiveElements(text: string): string {
        return text + '\n\n따라서 이러한 이유로 이 방안을 적극적으로 추천한다. 객관적 데이터와 논리적 분석을 통해 이 접근법의 우수성을 입증할 수 있으며, 장기적 관점에서도 지속 가능한 해결책이 될 것이다.';
    }

    private addEducationalElements(text: string): string {
        return text + '\n\n💡 학습 포인트:\n• 핵심 개념 이해\n• 실제 적용 방법\n• 주의사항 및 팁\n\n이러한 내용을 통해 더 깊이 있는 이해를 얻을 수 있을 것이다.';
    }

    private addAnalyticalElements(text: string): string {
        return text + '\n\n📊 분석 결과:\n• 강점: 체계적 접근, 논리적 구조\n• 약점: 일부 제한사항 존재\n• 기회: 개선 가능성 높음\n• 위협: 외부 요인 고려 필요\n\n이러한 분석을 바탕으로 객관적 판단이 가능하다.';
    }

    private adjustPoliticalTendency(text: string, context: PoliticalTendency): string {
        let adjustedText = text;

        switch (context.bias) {
            case 'neutral':
                adjustedText = this.makeNeutral(adjustedText);
                break;
            case 'progressive':
                adjustedText = this.addProgressiveElements(adjustedText);
                break;
            case 'conservative':
                adjustedText = this.addConservativeElements(adjustedText);
                break;
            case 'centrist':
                adjustedText = this.addCentristElements(adjustedText);
                break;
        }

        return adjustedText;
    }

    private makeNeutral(text: string): string {
        return text + '\n\n양쪽의 관점을 모두 고려할 때, 객관적이고 균형 잡힌 접근이 필요하다. 다양한 의견과 데이터를 종합하여 중립적인 입장에서 분석하는 것이 바람직하다.';
    }

    private addProgressiveElements(text: string): string {
        return text + '\n\n진보적 관점에서 볼 때, 변화와 혁신을 통한 사회 발전이 중요하다. 기존의 틀을 벗어나 새로운 패러다임을 추구하는 것이 미래 지향적 접근법이다.';
    }

    private addConservativeElements(text: string): string {
        return text + '\n\n보수적 관점에서는 안정성과 전통적 가치의 중요성을 강조한다. 급진적 변화보다는 점진적 개선과 검증된 방법론을 통한 접근이 바람직하다.';
    }

    private addCentristElements(text: string): string {
        return text + '\n\n중도적 관점에서는 극단적 입장을 피하고 실용적 해결책을 모색한다. 다양한 의견을 조화롭게 통합하여 최적의 방안을 찾는 것이 중요하다.';
    }

    private structureMessage(text: string, format: MessageFormat): string {
        let structuredText = text;

        switch (format.structure) {
            case 'narrative':
                structuredText = this.structureAsNarrative(structuredText);
                break;
            case 'analytical':
                structuredText = this.structureAsAnalytical(structuredText);
                break;
            case 'persuasive':
                structuredText = this.structureAsPersuasive(structuredText);
                break;
            case 'comparative':
                structuredText = this.structureAsComparative(structuredText);
                break;
        }

        return structuredText;
    }

    private structureAsNarrative(text: string): string {
        return `📖 이야기로 풀어보는 ${text}

시작: 상황의 배경과 맥락
전개: 주요 사건과 변화 과정
절정: 핵심 문제와 갈등
결말: 해결책과 미래 전망

이러한 서사적 구조를 통해 더욱 이해하기 쉽게 설명할 수 있다.`;
    }

    private structureAsAnalytical(text: string): string {
        return `🔍 분석적 접근: ${text}

1. 문제 정의
2. 원인 분석
3. 영향 평가
4. 해결 방안
5. 결론 및 제언

이러한 체계적 분석을 통해 객관적이고 정확한 이해가 가능하다.`;
    }

    private structureAsPersuasive(text: string): string {
        return `💪 설득적 논증: ${text}

주장: 핵심 메시지
근거: 객관적 데이터와 사실
예시: 구체적 사례
반론: 예상되는 반대 의견
결론: 강력한 마무리

이러한 논리적 구조를 통해 설득력을 극대화할 수 있다.`;
    }

    private structureAsComparative(text: string): string {
        return `⚖️ 비교 분석: ${text}

A안 vs B안:
• 비용: A안이 20% 절약
• 시간: B안이 30% 단축
• 품질: A안이 우수
• 위험: B안이 낮음

종합 평가: 각각의 장단점을 고려한 최적 선택`;
    }

    private validateQuality(text: string, requirements: { targetLength?: number; keywords?: string[] }): {
        meetsLength: boolean;
        includesKeywords: boolean;
        readability: number;
        coherence: number;
        completeness: number;
    } {
        const validation = {
            meetsLength: true,
            includesKeywords: true,
            readability: this.calculateReadability(text),
            coherence: this.checkCoherence(text),
            completeness: this.checkCompleteness(text)
        };

        if (requirements.targetLength) {
            validation.meetsLength = Math.abs(text.length - requirements.targetLength) <= requirements.targetLength * 0.2;
        }

        if (requirements.keywords) {
            validation.includesKeywords = requirements.keywords.every((keyword: string) =>
                text.toLowerCase().includes(keyword.toLowerCase())
            );
        }

        return validation;
    }

    private checkCoherence(text: string): number {
        // 간단한 일관성 검사
        const sentences = text.split(/[.!?]+/);
        const avgLength = sentences.reduce((sum, sentence) => sum + sentence.length, 0) / sentences.length;
        const variance = sentences.reduce((sum, sentence) => sum + Math.pow(sentence.length - avgLength, 2), 0) / sentences.length;

        return Math.max(0, 100 - variance / 10);
    }

    private checkCompleteness(text: string): number {
        const hasIntroduction = text.includes('개요') || text.includes('소개') || text.includes('배경');
        const hasMainContent = text.length > 100;
        const hasConclusion = text.includes('결론') || text.includes('요약') || text.includes('마무리');

        let score = 0;
        if (hasIntroduction) score += 30;
        if (hasMainContent) score += 40;
        if (hasConclusion) score += 30;

        return score;
    }

    private finalizeText(text: string, request: TextProcessingRequest, validation: { meetsLength: boolean; includesKeywords: boolean }): string {
        let finalText = text;

        // 길이 조정
        if (request.targetLength && !validation.meetsLength) {
            if (text.length > request.targetLength) {
                finalText = text.substring(0, request.targetLength) + '...';
            } else {
                finalText = text + '\n\n추가적인 설명이 필요하다면 더 구체적으로 요청해 주시기 바랍니다.';
            }
        }

        // 키워드 포함 확인
        if (request.keywords && !validation.includesKeywords) {
            const missingKeywords = request.keywords.filter((keyword: string) =>
                !text.toLowerCase().includes(keyword.toLowerCase())
            );
            if (missingKeywords.length > 0) {
                finalText += `\n\n관련 키워드: ${missingKeywords.join(', ')}`;
            }
        }

        return finalText;
    }

    private generateAlternatives(text: string, _request: TextProcessingRequest): ProcessedText['alternatives'] {
        return {
            brief: this.createBriefVersion(text),
            detailed: this.createDetailedVersion(text),
            technical: this.createTechnicalVersion(text),
            casual: this.createCasualVersion(text)
        };
    }

    private createBriefVersion(text: string): string {
        const sentences = text.split(/[.!?]+/);
        return sentences.slice(0, 3).join('. ') + '.';
    }

    private createDetailedVersion(text: string): string {
        return text + '\n\n추가 상세 정보:\n• 배경 및 맥락\n• 구체적 사례\n• 전문가 의견\n• 향후 전망\n• 참고 자료';
    }

    private createTechnicalVersion(text: string): string {
        return `기술적 분석 보고서\n\n${text}\n\n기술적 세부사항:\n• 방법론: 체계적 분석\n• 데이터: 객관적 지표\n• 검증: 다중 검증\n• 한계: 인정된 제약사항`;
    }

    private createCasualVersion(text: string): string {
        return `😊 쉽게 설명하면:\n\n${text}\n\n💡 핵심 포인트:\n• 간단한 요약\n• 실용적 팁\n• 재미있는 비유\n\n더 궁금한 점이 있으면 언제든 물어보세요! 😄`;
    }
}

export const advancedTextProcessor = new AdvancedTextProcessor();
export default advancedTextProcessor;
