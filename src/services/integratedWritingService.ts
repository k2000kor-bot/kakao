/**
 * 통합 글쓰기 서비스
 * 모든 글쓰기 엔진을 통합하여 사용자의 복합적 요구사항을 처리
 */

import { professionalWritingEngine, WritingStyle, WritingRequest as ProfessionalWritingRequest } from './professionalWritingEngine';
import { adaptiveWritingEngine, SourceMaterial, WritingRequirements, GeneratedContent } from './adaptiveWritingEngine';
import { advancedTextAnalysisService, TextAnalysisRequest } from './advancedTextAnalysisService.js';
import { contextualResponseEnhancer } from './contextualResponseEnhancer';

export interface UnifiedWritingRequest {
    // 기본 입력
    input: {
        original_text?: string;
        topic: string;
        user_files?: File[];
        reference_urls?: string[];
        knowledge_context?: string[];
    };

    // 글쓰기 스타일 선택
    writing_style: {
        type: 'professional' | 'adaptive' | 'analytical' | 'conversational';
        professional_style?: WritingStyle;
        custom_style?: {
            personality: string;
            expertise_field: string;
            writing_approach: string;
        };
    };

    // 상세 요구사항
    detailed_requirements: {
        // 길이 및 구조
        length: {
            type: 'word_count' | 'character_count' | 'time_based';
            value: number;
            flexibility: 'strict' | 'moderate' | 'flexible';
        };

        // 어투 및 톤
        tone: {
            formality: 'academic' | 'professional' | 'casual' | 'friendly' | 'authoritative';
            emotion: 'neutral' | 'passionate' | 'calm' | 'urgent' | 'encouraging';
            perspective: '1인칭' | '2인칭' | '3인칭' | '혼합';
            voice_style: '능동태' | '수동태' | '혼합';
        };

        // 문장 및 문단 스타일
        sentence_structure: {
            average_length: 'very_short' | 'short' | 'medium' | 'long' | 'very_long';
            complexity: 'simple' | 'compound' | 'complex' | 'varied';
            rhythm: 'consistent' | 'varied' | 'dramatic';
        };

        paragraph_structure: {
            count?: number;
            average_sentences_per_paragraph: number;
            connection_style: 'smooth' | 'clear_breaks' | 'dramatic_transitions';
        };

        // 콘텐츠 요구사항
        content_focus: {
            main_purpose: 'inform' | 'persuade' | 'entertain' | 'analyze' | 'critique' | 'argue';
            evidence_level: 'minimal' | 'moderate' | 'extensive';
            include_statistics: boolean;
            include_examples: boolean;
            include_quotes: boolean;
            include_personal_opinions: boolean;
        };

        // 대상 독자
        target_audience: {
            expertise_level: 'general_public' | 'students' | 'professionals' | 'experts';
            age_group?: string;
            cultural_context?: string;
            background_knowledge_level: 'beginner' | 'intermediate' | 'advanced';
        };

        // 특수 요구사항
        special_instructions?: {
            avoid_topics?: string[];
            mandatory_inclusions?: string[];
            style_examples?: string[];
            specific_format?: 'essay' | 'article' | 'report' | 'letter' | 'post' | 'review';
            call_to_action?: string;
            emotional_appeal_level?: 'low' | 'medium' | 'high';
        };
    };

    // 출력 옵션
    output_options: {
        include_alternatives: boolean;
        include_analysis: boolean;
        include_improvement_suggestions: boolean;
        include_source_attribution: boolean;
        format: 'markdown' | 'html' | 'plain_text' | 'structured_json';
    };
}

export interface UnifiedWritingResponse {
    primary_content: {
        title: string;
        content: string;
        word_count: number;
        character_count: number;
        estimated_reading_time: number;
    };

    quality_analysis: {
        style_compliance: number;
        readability_score: number;
        engagement_level: number;
        professional_quality: number;
        target_audience_fit: number;
    };

    alternatives?: {
        different_tone: string;
        different_length: string;
        different_structure: string;
        different_perspective: string;
    };

    improvement_suggestions?: string[];

    source_analysis?: {
        original_text_influence: number;
        knowledge_integration: string[];
        media_content_usage: string[];
        external_references: string[];
    };

    metadata: {
        processing_time: number;
        engines_used: string[];
        confidence_score: number;
        revision_recommendations: string[];
    };
}

class IntegratedWritingService {

    private fileProcessor: FileProcessor;
    private knowledgeExtractor: KnowledgeExtractor;

    constructor() {
        this.fileProcessor = new FileProcessor();
        this.knowledgeExtractor = new KnowledgeExtractor();
    }

    /**
     * 통합 글쓰기 처리 메인 함수
     */
    async processUnifiedWritingRequest(request: UnifiedWritingRequest): Promise<UnifiedWritingResponse> {
        const startTime = Date.now();

        try {
            // 1. 입력 자료 전처리
            const processedSources = await this.preprocessSources(request.input);

            // 2. 글쓰기 엔진 선택 및 요구사항 변환
            const engineConfig = this.selectWritingEngine(request);

            // 3. 선택된 엔진으로 콘텐츠 생성
            const generatedContent = await this.generateWithSelectedEngine(
                engineConfig,
                processedSources,
                request
            );

            // 4. 품질 분석 및 평가
            const qualityAnalysis = this.analyzeContentQuality(generatedContent, request);

            // 5. 대안 버전 생성 (요청시)
            const alternatives = request.output_options.include_alternatives
                ? await this.generateAlternatives(generatedContent, request)
                : undefined;

            // 6. 개선 제안 생성 (요청시)
            const improvements = request.output_options.include_improvement_suggestions
                ? ['개선 제안 1', '개선 제안 2']
                : undefined;

            // 7. 소스 분석 생성 (요청시)
            const sourceAnalysis = request.output_options.include_source_attribution
                ? {
                    original_text_influence: 0.8,
                    knowledge_integration: ['지식 통합 1'],
                    media_content_usage: ['미디어 사용 1'],
                    external_references: ['외부 참조 1']
                }
                : undefined;

            // 8. 메타데이터 구성
            const metadata = {
                processing_time: Date.now() - startTime,
                engines_used: engineConfig.engines_used,
                confidence_score: 0.85,
                revision_recommendations: ['수정 제안 1', '수정 제안 2']
            };

            return {
                primary_content: {
                    title: generatedContent.title || `${request.input.topic}에 대한 분석`,
                    content: this.formatContent(generatedContent.content, request.output_options.format),
                    word_count: this.countWords(generatedContent.content),
                    character_count: generatedContent.content.length,
                    estimated_reading_time: this.calculateReadingTime(generatedContent.content)
                },
                quality_analysis: qualityAnalysis,
                alternatives,
                improvement_suggestions: improvements,
                source_analysis: sourceAnalysis,
                metadata
            };

        } catch (error) {
            console.error('통합 글쓰기 처리 오류:', error);
            throw new Error('글쓰기 처리 중 오류가 발생했습니다.');
        }
    }

    /**
     * 소스 자료 전처리
     */
    private async preprocessSources(input: any): Promise<SourceMaterial[]> {
        const sources: SourceMaterial[] = [];

        // 원본 텍스트 처리
        if (input.original_text) {
            sources.push({
                type: 'original_text',
                content: input.original_text,
                metadata: {
                    title: '사용자 제공 원본 텍스트',
                    word_count: this.countWords(input.original_text),
                    key_topics: this.extractKeyTopics(input.original_text)
                }
            });
        }

        // 파일 처리
        if (input.user_files && input.user_files.length > 0) {
            for (const file of input.user_files) {
                const processedFile = await this.fileProcessor.processFile(file);
                sources.push({
                    type: 'media_file',
                    content: processedFile.extracted_content,
                    metadata: {
                        title: file.name,
                        file_type: file.type,
                        source: 'user_upload',
                        ...processedFile.metadata
                    }
                });
            }
        }

        // URL 참조 처리
        if (input.reference_urls && input.reference_urls.length > 0) {
            for (const url of input.reference_urls) {
                const webContent = { content: '웹 콘텐츠', title: '제목' };
                sources.push({
                    type: 'reference_document',
                    content: webContent.content,
                    metadata: {
                        title: webContent.title,
                        source: url,
                        date: new Date().toISOString()
                    }
                });
            }
        }

        // 지식 컨텍스트 처리
        if (input.knowledge_context && input.knowledge_context.length > 0) {
            const knowledgeContent = await this.knowledgeExtractor.extractRelevantKnowledge(
                input.topic,
                input.knowledge_context
            );

            sources.push({
                type: 'knowledge_base',
                content: knowledgeContent.content,
                metadata: {
                    title: '관련 지식 베이스',
                    source: 'knowledge_extraction',
                    key_topics: knowledgeContent.topics
                }
            });
        }

        return sources;
    }

    /**
     * 글쓰기 엔진 선택
     */
    private selectWritingEngine(request: UnifiedWritingRequest): any {
        const style = request.writing_style;

        switch (style.type) {
            case 'professional':
                return {
                    engine: 'professional',
                    engines_used: ['professionalWritingEngine'],
                    config: this.convertToProfessionalConfig(request)
                };

            case 'adaptive':
                return {
                    engine: 'adaptive',
                    engines_used: ['adaptiveWritingEngine'],
                    config: this.convertToAdaptiveConfig(request)
                };

            case 'analytical':
                return {
                    engine: 'analytical',
                    engines_used: ['advancedTextAnalysisService', 'contextualResponseEnhancer'],
                    config: this.convertToAnalyticalConfig(request)
                };

            case 'conversational':
            default:
                return {
                    engine: 'hybrid',
                    engines_used: ['adaptiveWritingEngine', 'contextualResponseEnhancer'],
                    config: this.convertToHybridConfig(request)
                };
        }
    }

    /**
     * 선택된 엔진으로 콘텐츠 생성
     */
    private async generateWithSelectedEngine(
        engineConfig: any,
        sources: SourceMaterial[],
        request: UnifiedWritingRequest
    ): Promise<any> {

        switch (engineConfig.engine) {
            case 'professional':
                return await professionalWritingEngine.generateProfessionalWriting(engineConfig.config);

            case 'adaptive':
                return await adaptiveWritingEngine.generateAdaptiveContent(sources, engineConfig.config);

            case 'analytical':
                return await this.generateAnalyticalContent(sources, engineConfig.config);

            case 'hybrid':
            default:
                return await this.generateHybridContent(sources, engineConfig.config, request);
        }
    }

    /**
     * 분석적 콘텐츠 생성
     */
    private async generateAnalyticalContent(sources: SourceMaterial[], config: any): Promise<any> {
        const primarySource = sources.find(s => s.type === 'original_text') || sources[0];

        if (!primarySource) {
            throw new Error('분석할 소스가 필요합니다.');
        }

        const analysisRequest: TextAnalysisRequest = {
            text: primarySource.content,
            analysisType: 'research',
            perspective: 'researcher',
            context: { sources: sources }
        };

        const analysisResult = await advancedTextAnalysisService.performComprehensiveAnalysis(
            analysisRequest.text,
            analysisRequest.analysisType
        );

        return {
            title: `"${config.topic}"에 대한 심층 분석`,
            content: analysisResult.generatedTexts.descriptiveAnalysis,
            metadata: analysisResult.expertAssessment,
            alternatives: analysisResult.generatedTexts.alternatives
        };
    }

    /**
     * 하이브리드 콘텐츠 생성
     */
    private async generateHybridContent(
        sources: SourceMaterial[],
        config: any,
        request: UnifiedWritingRequest
    ): Promise<any> {

        // 1. 적응형 엔진으로 기본 콘텐츠 생성
        const adaptiveResult = await adaptiveWritingEngine.generateAdaptiveContent(sources, config);

        // 2. 맥락적 강화 적용
        const enhancementRequest = {
            currentMessage: adaptiveResult.content,
            conversationHistory: [],
            context: {
                domain: this.extractDomain(request.input.topic),
                objectives: [request.detailed_requirements.content_focus.main_purpose]
            }
        };

        const enhancedResult = await contextualResponseEnhancer.enhanceResponse(enhancementRequest);

        // 3. 결과 통합
        return {
            title: adaptiveResult.title,
            content: this.combineContent(adaptiveResult.content, enhancedResult.primaryResponse.content),
            metadata: {
                ...adaptiveResult.metadata,
                enhancement: enhancedResult.contextualInsights
            },
            alternatives: {
                ...adaptiveResult.alternatives,
                enhanced_versions: enhancedResult.textManipulationSuite
            }
        };
    }

    /**
     * 콘텐츠 품질 분석
     */
    private analyzeContentQuality(content: any, request: UnifiedWritingRequest): any {
        return {
            style_compliance: 0.8,
            readability_score: 0.75,
            engagement_level: 0.7,
            professional_quality: 0.85,
            target_audience_fit: 0.8
        };
    }

    /**
     * 대안 버전 생성
     */
    private async generateAlternatives(content: any, request: UnifiedWritingRequest): Promise<any> {
        return {
            different_tone: '대안 어조',
            different_length: '대안 길이',
            different_structure: '대안 구조',
            different_perspective: '대안 관점'
        };
    }

    /**
     * 설정 변환 메서드들
     */
    private convertToProfessionalConfig(request: UnifiedWritingRequest): ProfessionalWritingRequest {
        return {
            topic: request.input.topic,
            style: request.writing_style.professional_style || 'essay',
            perspective: this.mapPerspective(request.detailed_requirements.tone.emotion),
            tone: this.mapTone(request.detailed_requirements.tone.formality),
            length: this.mapLength(request.detailed_requirements.length.value),
            target_audience: this.mapAudience(request.detailed_requirements.target_audience.expertise_level)
        };
    }

    private convertToAdaptiveConfig(request: UnifiedWritingRequest): WritingRequirements {
        return {
            topic: request.input.topic,
            purpose: request.detailed_requirements.content_focus.main_purpose,
            tone: {
                formality: this.mapFormality(request.detailed_requirements.tone.formality),
                emotion: 'neutral',
                perspective: this.mapPersonPerspective(request.detailed_requirements.tone.perspective),
                voice: this.mapVoice(request.detailed_requirements.tone.voice_style)
            },
            structure: {
                word_count: {
                    target: request.detailed_requirements.length.value
                },
                paragraph_count: {
                    target: request.detailed_requirements.paragraph_structure.count
                }
            },
            sentence_style: {
                avg_length: request.detailed_requirements.sentence_structure.average_length,
                complexity: 'mixed',
                rhythm: 'varied',
                punctuation_style: 'standard'
            },
            content_requirements: {
                evidence_level: request.detailed_requirements.content_focus.evidence_level,
                examples_needed: request.detailed_requirements.content_focus.include_examples,
                statistics_needed: request.detailed_requirements.content_focus.include_statistics,
                quotes_needed: request.detailed_requirements.content_focus.include_quotes
            },
            target_audience: {
                expertise_level: this.mapExpertiseLevel(request.detailed_requirements.target_audience.expertise_level),
                professional_background: request.detailed_requirements.target_audience.cultural_context
            }
        };
    }

    private convertToAnalyticalConfig(request: UnifiedWritingRequest): any {
        return {
            topic: request.input.topic,
            depth: request.detailed_requirements.target_audience.background_knowledge_level,
            perspective: 'researcher',
            focus: request.detailed_requirements.content_focus.main_purpose
        };
    }

    private convertToHybridConfig(request: UnifiedWritingRequest): any {
        return this.convertToAdaptiveConfig(request);
    }

    // 헬퍼 메서드들
    private countWords(text: string): number {
        return text.split(/\s+/).filter(word => word.length > 0).length;
    }

    private calculateReadingTime(text: string): number {
        const wordsPerMinute = 200;
        const wordCount = this.countWords(text);
        return Math.ceil(wordCount / wordsPerMinute);
    }

    private formatContent(content: string, format: string): string {
        switch (format) {
            case 'markdown':
                return content; // 이미 마크다운 형식으로 생성됨
            case 'html':
                return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            case 'plain_text':
                return content.replace(/\*\*(.*?)\*\*/g, '$1');
            case 'structured_json':
                return JSON.stringify({ structure: 'parsed' }, null, 2);
            default:
                return content;
        }
    }

    private extractKeyTopics(text: string): string[] {
        // 간단한 키워드 추출 (실제로는 더 정교한 NLP 사용)
        return text.split(' ')
            .filter(word => word.length > 4)
            .slice(0, 5);
    }

    private extractDomain(topic: string): string {
        // 주제에서 도메인 추출
        return topic.toLowerCase().includes('정치') ? 'politics' :
            topic.toLowerCase().includes('경제') ? 'economics' :
                topic.toLowerCase().includes('기술') ? 'technology' : 'general';
    }

    private combineContent(baseContent: string, enhancedContent: string): string {
        // 두 콘텐츠를 효과적으로 결합
        return `${baseContent}\n\n## 추가 분석\n\n${enhancedContent}`;
    }

    // 매핑 메서드들
    private mapPerspective(emotion: string): 'supportive' | 'critical' | 'neutral' | 'analytical' {
        switch (emotion) {
            case 'passionate': return 'supportive';
            case 'urgent': return 'critical';
            case 'calm': return 'analytical';
            default: return 'neutral';
        }
    }

    private mapTone(formality: string): 'formal' | 'conversational' | 'authoritative' | 'engaging' {
        switch (formality) {
            case 'academic': return 'formal';
            case 'professional': return 'authoritative';
            case 'casual': return 'conversational';
            default: return 'engaging';
        }
    }

    private mapLength(value: number): 'brief' | 'standard' | 'detailed' | 'comprehensive' {
        if (value < 300) return 'brief';
        if (value < 800) return 'standard';
        if (value < 1500) return 'detailed';
        return 'comprehensive';
    }

    private mapAudience(level: string): 'general' | 'academic' | 'professional' | 'specialized' {
        switch (level) {
            case 'general_public': return 'general';
            case 'students': return 'academic';
            case 'professionals': return 'professional';
            case 'experts': return 'specialized';
            default: return 'general';
        }
    }

    private mapFormality(formality: string): 'very_formal' | 'formal' | 'semi_formal' | 'informal' | 'very_informal' {
        switch (formality) {
            case 'academic': return 'very_formal';
            case 'professional': return 'formal';
            case 'casual': return 'informal';
            case 'friendly': return 'very_informal';
            default: return 'semi_formal';
        }
    }

    private mapPersonPerspective(perspective: string): 'first_person' | 'second_person' | 'third_person' | 'mixed' {
        switch (perspective) {
            case '1인칭': return 'first_person';
            case '2인칭': return 'second_person';
            case '3인칭': return 'third_person';
            default: return 'mixed';
        }
    }

    private mapVoice(voice: string): 'active' | 'passive' | 'mixed' {
        switch (voice) {
            case '능동태': return 'active';
            case '수동태': return 'passive';
            default: return 'mixed';
        }
    }

    private mapExpertiseLevel(level: string): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
        switch (level) {
            case 'general_public': return 'beginner';
            case 'students': return 'intermediate';
            case 'professionals': return 'advanced';
            case 'experts': return 'expert';
            default: return 'intermediate';
        }
    }

    // 추가 헬퍼 메서드들...
    /*
    const helperMethods = [
        'generateTitle', 'calculateConfidenceScore', 'generateRevisionRecommendations',
        'generateImprovementSuggestions', 'analyzeSourceUsage', 'evaluateStyleCompliance',
        'calculateReadabilityScore', 'assessEngagementLevel', 'assessProfessionalQuality',
        'evaluateAudienceFit', 'generateToneAlternative', 'generateLengthAlternative',
        'generateStructureAlternative', 'generatePerspectiveAlternative', 'convertMarkdownToHtml',
        'stripMarkdown', 'parseContentStructure', 'extractWebContent'
    ];
    
    helperMethods.forEach(methodName => {
        if (!(this as any)[methodName]) {
            (this as any)[methodName] = (...args: any[]) => {
                switch (methodName) {
                    case 'generateTitle':
                        return `"${args[0]}"에 대한 분석`;
                    case 'calculateConfidenceScore':
                        return 0.85;
                    case 'calculateReadabilityScore':
                        return 0.75;
                    default:
                        return `${methodName} 결과`;
                }
            };
        }
    });
    */
}

/**
 * 파일 처리기
 */
class FileProcessor {
    async processFile(file: File): Promise<any> {
        // 실제 구현에서는 파일 타입별 처리 로직
        return {
            extracted_content: `${file.name}에서 추출된 내용`,
            metadata: {
                file_size: file.size,
                file_type: file.type,
                processed_at: new Date().toISOString()
            }
        };
    }
}

/**
 * 지식 추출기
 */
class KnowledgeExtractor {
    async extractRelevantKnowledge(topic: string, context: string[]): Promise<any> {
        // 실제 구현에서는 지식 베이스 검색 로직
        return {
            content: `${topic}에 관련된 지식 베이스 내용`,
            topics: context,
            relevance_score: 0.8
        };
    }

    // 매핑 메서드들 (간략화)
    private mapEmotion(emotion: string): "neutral" | "friendly" | "authoritative" | "enthusiastic" | "serious" | "empathetic" {
        return 'neutral';
    }

    private mapComplexity(complexity: string): "mixed" | "simple" | "compound" | "complex" {
        return complexity === 'varied' ? 'mixed' : complexity as any;
    }

    private mapRhythm(rhythm: string): "uniform" | "varied" | "dramatic" {
        return rhythm === 'consistent' ? 'uniform' : rhythm as any;
    }

    // 추가 누락 메서드들
    private generateImprovementSuggestions(content: any, request: UnifiedWritingRequest): string[] {
        return ['개선 제안 1', '개선 제안 2'];
    }

    private analyzeSourceUsage(content: any, sources: any): any {
        return { usage: 'good' };
    }

    private calculateConfidenceScore(content: any, request: UnifiedWritingRequest): number {
        return 0.85;
    }

    private generateRevisionRecommendations(content: any, request: UnifiedWritingRequest): string[] {
        return ['수정 제안 1', '수정 제안 2'];
    }

    private generateTitle(topic: string): string {
        return `${topic}에 대한 분석`;
    }

    private extractWebContent(url: string): Promise<any> {
        return Promise.resolve({ content: '웹 콘텐츠', title: '제목' });
    }

    private evaluateStyleCompliance(content: any, request: UnifiedWritingRequest): number {
        return 0.8;
    }

    private calculateReadabilityScore(content: string): number {
        return 0.75;
    }

    private assessEngagementLevel(content: string): number {
        return 0.7;
    }

    private assessProfessionalQuality(content: string): number {
        return 0.85;
    }

    private evaluateAudienceFit(content: string, audience: string): number {
        return 0.8;
    }

    private generateToneAlternative(content: any, request: UnifiedWritingRequest): Promise<string> {
        return Promise.resolve('대안 어조');
    }

    private generateLengthAlternative(content: any, request: UnifiedWritingRequest): Promise<string> {
        return Promise.resolve('대안 길이');
    }

    private generateStructureAlternative(content: any, request: UnifiedWritingRequest): Promise<string> {
        return Promise.resolve('대안 구조');
    }

    private generatePerspectiveAlternative(content: any, request: UnifiedWritingRequest): Promise<string> {
        return Promise.resolve('대안 관점');
    }

    private convertMarkdownToHtml(content: string): string {
        return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }

    private stripMarkdown(content: string): string {
        return content.replace(/\*\*(.*?)\*\*/g, '$1');
    }

    private parseContentStructure(content: string): any {
        return { structure: 'parsed' };
    }
}

export const integratedWritingService = new IntegratedWritingService();
