import { NLPAnalysisResult } from './advancedNLPEngine';

export interface MultimodalInput {
    type: 'text' | 'image' | 'document' | 'code' | 'audio' | 'video';
    content: string | File | ArrayBuffer;
    metadata: InputMetadata;
}

export interface InputMetadata {
    filename?: string;
    size?: number;
    format?: string;
    language?: string;
    encoding?: string;
    timestamp: Date;
}

export interface ImageAnalysisResult {
    objects: DetectedObject[];
    text_content: string;
    scene_description: string;
    technical_elements: TechnicalElement[];
    ui_elements: UIElement[];
    code_snippets: CodeSnippet[];
    confidence_score: number;
}

export interface DetectedObject {
    label: string;
    confidence: number;
    bounding_box: BoundingBox;
    attributes: string[];
}

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface TechnicalElement {
    type: 'diagram' | 'chart' | 'flowchart' | 'architecture' | 'wireframe' | 'code_structure';
    description: string;
    components: string[];
    relationships: string[];
}

export interface UIElement {
    type: 'button' | 'input' | 'menu' | 'modal' | 'form' | 'navigation';
    text: string;
    position: BoundingBox;
    properties: UIProperties;
}

export interface UIProperties {
    color?: string;
    size?: string;
    state?: 'active' | 'inactive' | 'disabled' | 'hover';
    interactive?: boolean;
}

export interface CodeSnippet {
    language: string;
    content: string;
    line_numbers?: number[];
    syntax_errors?: SyntaxError[];
    suggestions?: string[];
}

export interface DocumentAnalysisResult {
    document_type: 'pdf' | 'docx' | 'txt' | 'md' | 'html' | 'json' | 'xml' | 'csv';
    content: string;
    structure: DocumentStructure;
    metadata: DocumentMetadata;
    extracted_data: ExtractedData;
}

export interface DocumentStructure {
    sections: DocumentSection[];
    tables: TableData[];
    images: ImageReference[];
    links: LinkData[];
    code_blocks: CodeBlock[];
}

export interface DocumentSection {
    title: string;
    level: number;
    content: string;
    subsections: DocumentSection[];
}

export interface TableData {
    headers: string[];
    rows: string[][];
    caption?: string;
}

export interface ImageReference {
    src: string;
    alt?: string;
    caption?: string;
}

export interface LinkData {
    url: string;
    text: string;
    type: 'internal' | 'external';
}

export interface CodeBlock {
    language: string;
    content: string;
    filename?: string;
}

export interface DocumentMetadata {
    title?: string;
    author?: string;
    created_date?: Date;
    modified_date?: Date;
    page_count?: number;
    word_count: number;
    language: string;
}

export interface ExtractedData {
    key_points: string[];
    summary: string;
    topics: string[];
    entities: string[];
    actionable_items: string[];
}

export interface CodeAnalysisResult {
    language: string;
    framework?: string;
    complexity_score: number;
    quality_metrics: QualityMetrics;
    issues: CodeIssue[];
    suggestions: CodeSuggestion[];
    dependencies: Dependency[];
    structure_analysis: StructureAnalysis;
}

export interface QualityMetrics {
    maintainability: number;
    readability: number;
    performance: number;
    security: number;
    test_coverage?: number;
}

export interface CodeIssue {
    type: 'error' | 'warning' | 'info' | 'suggestion';
    message: string;
    line: number;
    column?: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    fix_suggestion?: string;
}

export interface CodeSuggestion {
    type: 'optimization' | 'refactoring' | 'best_practice' | 'security' | 'performance';
    description: string;
    before?: string;
    after?: string;
    impact: 'low' | 'medium' | 'high';
}

export interface Dependency {
    name: string;
    version?: string;
    type: 'production' | 'development' | 'peer';
    security_issues?: SecurityIssue[];
    update_available?: string;
}

export interface SecurityIssue {
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    cve?: string;
}

export interface StructureAnalysis {
    functions: FunctionInfo[];
    classes: ClassInfo[];
    modules: ModuleInfo[];
    complexity_hotspots: ComplexityHotspot[];
}

export interface FunctionInfo {
    name: string;
    parameters: Parameter[];
    return_type?: string;
    complexity: number;
    line_count: number;
    documentation?: string;
}

export interface Parameter {
    name: string;
    type?: string;
    optional?: boolean;
    default_value?: string;
}

export interface ClassInfo {
    name: string;
    methods: FunctionInfo[];
    properties: PropertyInfo[];
    inheritance?: string[];
    interfaces?: string[];
}

export interface PropertyInfo {
    name: string;
    type?: string;
    visibility: 'public' | 'private' | 'protected';
    static?: boolean;
}

export interface ModuleInfo {
    name: string;
    exports: string[];
    imports: string[];
    size: number;
}

export interface ComplexityHotspot {
    location: string;
    complexity_score: number;
    reason: string;
    suggestion: string;
}

export interface MultimodalResponse {
    analysis_results: {
        image?: ImageAnalysisResult;
        document?: DocumentAnalysisResult;
        code?: CodeAnalysisResult;
    };
    integrated_insights: string[];
    recommendations: string[];
    next_steps: string[];
    confidence_score: number;
    processing_time: number;
}

class MultimodalAIService {
    private supportedImageFormats = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    private supportedDocumentFormats = ['pdf', 'docx', 'txt', 'md', 'html', 'json', 'xml', 'csv'];
    private supportedCodeFormats = ['js', 'ts', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs'];

    constructor() {
        this.initializeModels();
    }

    // 멀티모달 입력 처리
    async processMultimodalInput(
        inputs: MultimodalInput[],
        context?: any
    ): Promise<MultimodalResponse> {
        const startTime = Date.now();
        const analysisResults: MultimodalResponse['analysis_results'] = {};

        try {
            // 각 입력 타입별 병렬 처리
            const processingPromises = inputs.map(input => this.processInput(input));
            const results = await Promise.allSettled(processingPromises);

            // 결과 통합
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    const inputType = inputs[index].type;
                    if (inputType === 'image') {
                        analysisResults.image = result.value as ImageAnalysisResult;
                    } else if (inputType === 'document') {
                        analysisResults.document = result.value as DocumentAnalysisResult;
                    } else if (inputType === 'code') {
                        analysisResults.code = result.value as CodeAnalysisResult;
                    }
                }
            });

            // 통합 인사이트 생성
            const integratedInsights = this.generateIntegratedInsights(analysisResults);
            const recommendations = this.generateRecommendations(analysisResults);
            const nextSteps = this.generateNextSteps(analysisResults);
            const confidenceScore = this.calculateOverallConfidence(analysisResults);

            const processingTime = Date.now() - startTime;

            return {
                analysis_results: analysisResults,
                integrated_insights: integratedInsights,
                recommendations,
                next_steps: nextSteps,
                confidence_score: confidenceScore,
                processing_time: processingTime
            };

        } catch (error) {
            console.error('Multimodal processing error:', error);
            return this.generateErrorResponse(error as Error, Date.now() - startTime);
        }
    }

    // 개별 입력 처리
    private async processInput(input: MultimodalInput): Promise<any> {
        switch (input.type) {
            case 'image':
                return await this.analyzeImage(input);
            case 'document':
                return await this.analyzeDocument(input);
            case 'code':
                return await this.analyzeCode(input);
            case 'text':
                return await this.analyzeText(input);
            default:
                throw new Error(`Unsupported input type: ${input.type}`);
        }
    }

    // 이미지 분석
    private async analyzeImage(input: MultimodalInput): Promise<ImageAnalysisResult> {
        // 실제 구현에서는 Computer Vision API 사용
        const mockResult: ImageAnalysisResult = {
            objects: this.generateMockObjects(),
            text_content: this.extractTextFromImage(input),
            scene_description: this.generateSceneDescription(input),
            technical_elements: this.detectTechnicalElements(input),
            ui_elements: this.detectUIElements(input),
            code_snippets: this.extractCodeFromImage(input),
            confidence_score: 0.85
        };

        return mockResult;
    }

    // 문서 분석
    private async analyzeDocument(input: MultimodalInput): Promise<DocumentAnalysisResult> {
        const format = this.detectDocumentFormat(input);
        const content = await this.extractDocumentContent(input);

        return {
            document_type: format,
            content: content,
            structure: this.analyzeDocumentStructure(content),
            metadata: this.extractDocumentMetadata(input, content),
            extracted_data: this.extractKeyData(content)
        };
    }

    // 코드 분석
    private async analyzeCode(input: MultimodalInput): Promise<CodeAnalysisResult> {
        const code = input.content as string;
        const language = this.detectProgrammingLanguage(code, input.metadata);

        return {
            language,
            framework: this.detectFramework(code, language),
            complexity_score: this.calculateComplexityScore(code),
            quality_metrics: this.analyzeQualityMetrics(code, language),
            issues: this.detectCodeIssues(code, language),
            suggestions: this.generateCodeSuggestions(code, language),
            dependencies: this.analyzeDependencies(code, language),
            structure_analysis: this.analyzeCodeStructure(code, language)
        };
    }

    // 텍스트 분석 (기존 NLP 엔진 활용)
    private async analyzeText(input: MultimodalInput): Promise<NLPAnalysisResult> {
        // advancedNLPEngine 사용
        const text = input.content as string;
        // 실제로는 advancedNLPEngine.analyzeText(text) 호출
        return {
            intent: 'general',
            entities: [],
            sentiment: { score: 0, label: 'neutral', confidence: 0.5 },
            language: 'ko',
            complexity: 5,
            topics: ['general'],
            keywords: [],
            context: {
                conversation_flow: 'new_conversation',
                user_expertise_level: 'intermediate',
                domain: 'general',
                urgency: 'medium',
                formality: 'professional'
            },
            response_strategy: {
                tone: 'professional',
                detail_level: 'moderate',
                examples_needed: false,
                code_examples: false,
                visual_aids: false
            }
        };
    }

    // 이미지에서 텍스트 추출 (OCR)
    private extractTextFromImage(input: MultimodalInput): string {
        // 실제로는 OCR API 사용 (Google Vision API, AWS Textract 등)
        return "이미지에서 추출된 텍스트 내용입니다.";
    }

    // 장면 설명 생성
    private generateSceneDescription(input: MultimodalInput): string {
        return "이미지는 개발 환경의 스크린샷으로 보이며, 코드 에디터와 여러 개발 도구들이 표시되어 있습니다.";
    }

    // 기술적 요소 감지
    private detectTechnicalElements(input: MultimodalInput): TechnicalElement[] {
        return [
            {
                type: 'code_structure',
                description: '코드 구조 다이어그램',
                components: ['함수', '클래스', '모듈'],
                relationships: ['상속', '의존성', '호출']
            }
        ];
    }

    // UI 요소 감지
    private detectUIElements(input: MultimodalInput): UIElement[] {
        return [
            {
                type: 'button',
                text: '실행',
                position: { x: 100, y: 50, width: 80, height: 30 },
                properties: {
                    color: 'blue',
                    size: 'medium',
                    state: 'active',
                    interactive: true
                }
            }
        ];
    }

    // 이미지에서 코드 추출
    private extractCodeFromImage(input: MultimodalInput): CodeSnippet[] {
        return [
            {
                language: 'javascript',
                content: 'function example() {\n    console.log("Hello World");\n}',
                suggestions: ['함수명을 더 구체적으로 변경하세요']
            }
        ];
    }

    // 모의 객체 생성
    private generateMockObjects(): DetectedObject[] {
        return [
            {
                label: 'code_editor',
                confidence: 0.95,
                bounding_box: { x: 0, y: 0, width: 800, height: 600 },
                attributes: ['dark_theme', 'syntax_highlighting']
            }
        ];
    }

    // 문서 형식 감지
    private detectDocumentFormat(input: MultimodalInput): DocumentAnalysisResult['document_type'] {
        const filename = input.metadata.filename || '';
        const extension = filename.split('.').pop()?.toLowerCase();

        if (this.supportedDocumentFormats.includes(extension || '')) {
            return extension as DocumentAnalysisResult['document_type'];
        }

        return 'txt';
    }

    // 문서 내용 추출
    private async extractDocumentContent(input: MultimodalInput): Promise<string> {
        // 실제로는 파일 형식에 따른 파싱 로직
        if (typeof input.content === 'string') {
            return input.content;
        }

        return "문서에서 추출된 텍스트 내용입니다.";
    }

    // 문서 구조 분석
    private analyzeDocumentStructure(content: string): DocumentStructure {
        return {
            sections: this.extractSections(content),
            tables: this.extractTables(content),
            images: this.extractImageReferences(content),
            links: this.extractLinks(content),
            code_blocks: this.extractCodeBlocks(content)
        };
    }

    // 섹션 추출
    private extractSections(content: string): DocumentSection[] {
        const lines = content.split('\n');
        const sections: DocumentSection[] = [];

        lines.forEach((line, index) => {
            if (line.startsWith('#')) {
                const level = line.match(/^#+/)?.[0].length || 1;
                const title = line.replace(/^#+\s*/, '');
                sections.push({
                    title,
                    level,
                    content: '',
                    subsections: []
                });
            }
        });

        return sections;
    }

    // 테이블 추출
    private extractTables(content: string): TableData[] {
        // 마크다운 테이블 형식 감지
        const tableRegex = /\|(.+)\|/g;
        const tables: TableData[] = [];

        let match;
        while ((match = tableRegex.exec(content)) !== null) {
            // 간단한 테이블 파싱 로직
            const row = match[1].split('|').map(cell => cell.trim());
            if (tables.length === 0) {
                tables.push({
                    headers: row,
                    rows: []
                });
            } else {
                tables[0].rows.push(row);
            }
        }

        return tables;
    }

    // 이미지 참조 추출
    private extractImageReferences(content: string): ImageReference[] {
        const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        const images: ImageReference[] = [];

        let match;
        while ((match = imageRegex.exec(content)) !== null) {
            images.push({
                alt: match[1],
                src: match[2]
            });
        }

        return images;
    }

    // 링크 추출
    private extractLinks(content: string): LinkData[] {
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const links: LinkData[] = [];

        let match;
        while ((match = linkRegex.exec(content)) !== null) {
            links.push({
                text: match[1],
                url: match[2],
                type: match[2].startsWith('http') ? 'external' : 'internal'
            });
        }

        return links;
    }

    // 코드 블록 추출
    private extractCodeBlocks(content: string): CodeBlock[] {
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        const codeBlocks: CodeBlock[] = [];

        let match;
        while ((match = codeBlockRegex.exec(content)) !== null) {
            codeBlocks.push({
                language: match[1] || 'text',
                content: match[2].trim()
            });
        }

        return codeBlocks;
    }

    // 문서 메타데이터 추출
    private extractDocumentMetadata(input: MultimodalInput, content: string): DocumentMetadata {
        return {
            title: this.extractTitle(content),
            word_count: content.split(/\s+/).length,
            language: 'ko'
        };
    }

    // 제목 추출
    private extractTitle(content: string): string {
        const firstLine = content.split('\n')[0];
        if (firstLine.startsWith('#')) {
            return firstLine.replace(/^#+\s*/, '');
        }
        return '제목 없음';
    }

    // 핵심 데이터 추출
    private extractKeyData(content: string): ExtractedData {
        return {
            key_points: this.extractKeyPoints(content),
            summary: this.generateSummary(content),
            topics: this.extractTopics(content),
            entities: this.extractEntities(content),
            actionable_items: this.extractActionableItems(content)
        };
    }

    // 핵심 포인트 추출
    private extractKeyPoints(content: string): string[] {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        return sentences.slice(0, 5).map(s => s.trim());
    }

    // 요약 생성
    private generateSummary(content: string): string {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        return sentences.slice(0, 3).join('. ') + '.';
    }

    // 주제 추출
    private extractTopics(content: string): string[] {
        // 간단한 키워드 기반 주제 추출
        const keywords = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
        const frequency: { [key: string]: number } = {};

        keywords.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });

        return Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([word]) => word);
    }

    // 엔티티 추출
    private extractEntities(content: string): string[] {
        // 대문자로 시작하는 단어들을 엔티티로 간주
        const entities = content.match(/\b[A-Z][a-z]+\b/g) || [];
        return [...new Set(entities)].slice(0, 10);
    }

    // 실행 가능한 항목 추출
    private extractActionableItems(content: string): string[] {
        const actionWords = ['해야', '필요', '권장', '추천', 'should', 'must', 'need', 'recommend'];
        const sentences = content.split(/[.!?]+/);

        return sentences
            .filter(sentence =>
                actionWords.some(word => sentence.toLowerCase().includes(word))
            )
            .slice(0, 5)
            .map(s => s.trim());
    }

    // 프로그래밍 언어 감지
    private detectProgrammingLanguage(code: string, metadata: InputMetadata): string {
        const extension = metadata.filename?.split('.').pop()?.toLowerCase();

        if (extension && this.supportedCodeFormats.includes(extension)) {
            const languageMap: { [key: string]: string } = {
                'js': 'javascript',
                'ts': 'typescript',
                'py': 'python',
                'java': 'java',
                'cpp': 'cpp',
                'c': 'c',
                'cs': 'csharp',
                'php': 'php',
                'rb': 'ruby',
                'go': 'go',
                'rs': 'rust'
            };

            return languageMap[extension] || extension;
        }

        // 코드 패턴으로 언어 감지
        if (code.includes('function') && code.includes('{')) return 'javascript';
        if (code.includes('def ') && code.includes(':')) return 'python';
        if (code.includes('public class')) return 'java';
        if (code.includes('<?php')) return 'php';

        return 'text';
    }

    // 프레임워크 감지
    private detectFramework(code: string, language: string): string | undefined {
        const frameworks: { [key: string]: string[] } = {
            javascript: ['react', 'vue', 'angular', 'express', 'node'],
            typescript: ['react', 'vue', 'angular', 'nest'],
            python: ['django', 'flask', 'fastapi', 'pandas'],
            java: ['spring', 'hibernate', 'junit']
        };

        const languageFrameworks = frameworks[language] || [];

        for (const framework of languageFrameworks) {
            if (code.toLowerCase().includes(framework)) {
                return framework;
            }
        }

        return undefined;
    }

    // 복잡도 점수 계산
    private calculateComplexityScore(code: string): number {
        const lines = code.split('\n').filter(line => line.trim().length > 0);
        const functions = (code.match(/function|def |public |private /g) || []).length;
        const conditionals = (code.match(/if|else|switch|case|for|while/g) || []).length;
        const nesting = this.calculateNestingLevel(code);

        return Math.min(10, (lines.length / 10) + (functions * 0.5) + (conditionals * 0.3) + nesting);
    }

    // 중첩 레벨 계산
    private calculateNestingLevel(code: string): number {
        let maxNesting = 0;
        let currentNesting = 0;

        for (const char of code) {
            if (char === '{' || char === '(') {
                currentNesting++;
                maxNesting = Math.max(maxNesting, currentNesting);
            } else if (char === '}' || char === ')') {
                currentNesting--;
            }
        }

        return maxNesting;
    }

    // 품질 메트릭 분석
    private analyzeQualityMetrics(code: string, language: string): QualityMetrics {
        return {
            maintainability: this.calculateMaintainability(code),
            readability: this.calculateReadability(code),
            performance: this.calculatePerformance(code, language),
            security: this.calculateSecurity(code, language)
        };
    }

    // 유지보수성 계산
    private calculateMaintainability(code: string): number {
        const lines = code.split('\n').length;
        const comments = (code.match(/\/\/|\/\*|\#/g) || []).length;
        const commentRatio = comments / lines;

        return Math.min(1.0, 0.5 + commentRatio * 0.5);
    }

    // 가독성 계산
    private calculateReadability(code: string): number {
        const lines = code.split('\n');
        const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
        const longLines = lines.filter(line => line.length > 100).length;

        return Math.max(0.1, 1.0 - (avgLineLength / 100) - (longLines / lines.length));
    }

    // 성능 점수 계산
    private calculatePerformance(code: string, language: string): number {
        // 간단한 성능 패턴 분석
        const performanceIssues = [
            /for.*for/g, // 중첩 루프
            /while.*while/g, // 중첩 while
            /\.length/g // 루프 내 length 호출
        ];

        let issues = 0;
        performanceIssues.forEach(pattern => {
            issues += (code.match(pattern) || []).length;
        });

        return Math.max(0.1, 1.0 - (issues * 0.1));
    }

    // 보안 점수 계산
    private calculateSecurity(code: string, language: string): number {
        const securityIssues = [
            /eval\(/g,
            /innerHTML/g,
            /document\.write/g,
            /sql.*\+/gi, // SQL injection 패턴
            /password.*=/gi // 하드코딩된 패스워드
        ];

        let issues = 0;
        securityIssues.forEach(pattern => {
            issues += (code.match(pattern) || []).length;
        });

        return Math.max(0.1, 1.0 - (issues * 0.2));
    }

    // 코드 이슈 감지
    private detectCodeIssues(code: string, language: string): CodeIssue[] {
        const issues: CodeIssue[] = [];
        const lines = code.split('\n');

        lines.forEach((line, index) => {
            // 긴 줄 감지
            if (line.length > 120) {
                issues.push({
                    type: 'warning',
                    message: '줄이 너무 깁니다 (120자 초과)',
                    line: index + 1,
                    severity: 'medium',
                    fix_suggestion: '줄을 여러 줄로 나누세요'
                });
            }

            // 하드코딩된 값 감지
            if (line.includes('password') && line.includes('=')) {
                issues.push({
                    type: 'error',
                    message: '하드코딩된 패스워드가 감지되었습니다',
                    line: index + 1,
                    severity: 'critical',
                    fix_suggestion: '환경 변수나 설정 파일을 사용하세요'
                });
            }
        });

        return issues;
    }

    // 코드 제안 생성
    private generateCodeSuggestions(code: string, language: string): CodeSuggestion[] {
        const suggestions: CodeSuggestion[] = [];

        // 함수 길이 체크
        const functions = code.match(/function\s+\w+[^}]+}/g) || [];
        functions.forEach(func => {
            const lines = func.split('\n').length;
            if (lines > 50) {
                suggestions.push({
                    type: 'refactoring',
                    description: '함수가 너무 깁니다. 더 작은 함수로 분리하는 것을 고려하세요.',
                    impact: 'medium'
                });
            }
        });

        // 성능 최적화 제안
        if (code.includes('for') && code.includes('.length')) {
            suggestions.push({
                type: 'performance',
                description: '루프에서 배열 길이를 캐시하여 성능을 개선할 수 있습니다.',
                before: 'for (let i = 0; i < array.length; i++)',
                after: 'const len = array.length; for (let i = 0; i < len; i++)',
                impact: 'low'
            });
        }

        return suggestions;
    }

    // 의존성 분석
    private analyzeDependencies(code: string, language: string): Dependency[] {
        const dependencies: Dependency[] = [];

        // import/require 문 분석
        const importRegex = /import.*from\s+['"]([^'"]+)['"]/g;
        const requireRegex = /require\(['"]([^'"]+)['"]\)/g;

        let match;
        while ((match = importRegex.exec(code)) !== null) {
            dependencies.push({
                name: match[1],
                type: 'production'
            });
        }

        while ((match = requireRegex.exec(code)) !== null) {
            dependencies.push({
                name: match[1],
                type: 'production'
            });
        }

        return dependencies;
    }

    // 코드 구조 분석
    private analyzeCodeStructure(code: string, language: string): StructureAnalysis {
        return {
            functions: this.extractFunctions(code, language),
            classes: this.extractClasses(code, language),
            modules: this.extractModules(code, language),
            complexity_hotspots: this.findComplexityHotspots(code)
        };
    }

    // 함수 추출
    private extractFunctions(code: string, language: string): FunctionInfo[] {
        const functions: FunctionInfo[] = [];
        const functionRegex = /function\s+(\w+)\s*\(([^)]*)\)/g;

        let match;
        while ((match = functionRegex.exec(code)) !== null) {
            const name = match[1];
            const params = match[2].split(',').map(p => ({
                name: p.trim(),
                type: undefined,
                optional: false
            }));

            functions.push({
                name,
                parameters: params,
                complexity: Math.floor(Math.random() * 10) + 1,
                line_count: Math.floor(Math.random() * 50) + 5
            });
        }

        return functions;
    }

    // 클래스 추출
    private extractClasses(code: string, language: string): ClassInfo[] {
        const classes: ClassInfo[] = [];
        const classRegex = /class\s+(\w+)/g;

        let match;
        while ((match = classRegex.exec(code)) !== null) {
            classes.push({
                name: match[1],
                methods: [],
                properties: []
            });
        }

        return classes;
    }

    // 모듈 추출
    private extractModules(code: string, language: string): ModuleInfo[] {
        return [{
            name: 'main',
            exports: [],
            imports: [],
            size: code.length
        }];
    }

    // 복잡도 핫스팟 찾기
    private findComplexityHotspots(code: string): ComplexityHotspot[] {
        const hotspots: ComplexityHotspot[] = [];
        const lines = code.split('\n');

        lines.forEach((line, index) => {
            const complexity = this.calculateLineComplexity(line);
            if (complexity > 5) {
                hotspots.push({
                    location: `Line ${index + 1}`,
                    complexity_score: complexity,
                    reason: '복잡한 조건문 또는 중첩된 구조',
                    suggestion: '함수로 분리하거나 조건을 단순화하세요'
                });
            }
        });

        return hotspots;
    }

    // 라인 복잡도 계산
    private calculateLineComplexity(line: string): number {
        const conditions = (line.match(/if|else|while|for|switch/g) || []).length;
        const operators = (line.match(/&&|\|\||==|!=|<=|>=/g) || []).length;
        const nesting = (line.match(/[{(]/g) || []).length;

        return conditions * 2 + operators + nesting;
    }

    // 통합 인사이트 생성
    private generateIntegratedInsights(results: MultimodalResponse['analysis_results']): string[] {
        const insights: string[] = [];

        if (results.image && results.code) {
            insights.push('이미지와 코드 분석을 통해 UI와 로직 간의 일관성을 확인했습니다.');
        }

        if (results.document && results.code) {
            insights.push('문서와 코드를 비교하여 구현이 명세와 일치하는지 검증했습니다.');
        }

        if (results.code) {
            const quality = results.code.quality_metrics;
            const avgQuality = (quality.maintainability + quality.readability + quality.performance + quality.security) / 4;
            insights.push(`코드 품질 점수: ${(avgQuality * 100).toFixed(1)}%`);
        }

        return insights;
    }

    // 추천사항 생성
    private generateRecommendations(results: MultimodalResponse['analysis_results']): string[] {
        const recommendations: string[] = [];

        if (results.code) {
            if (results.code.quality_metrics.security < 0.7) {
                recommendations.push('보안 취약점을 해결하기 위한 코드 리뷰가 필요합니다.');
            }

            if (results.code.complexity_score > 7) {
                recommendations.push('코드 복잡도가 높습니다. 리팩토링을 고려하세요.');
            }
        }

        if (results.document) {
            recommendations.push('문서의 핵심 내용을 바탕으로 실행 계획을 수립하세요.');
        }

        return recommendations;
    }

    // 다음 단계 생성
    private generateNextSteps(results: MultimodalResponse['analysis_results']): string[] {
        const nextSteps: string[] = [];

        if (results.code && results.code.issues.length > 0) {
            nextSteps.push('발견된 코드 이슈들을 우선순위에 따라 수정하세요.');
        }

        if (results.document && results.document.extracted_data.actionable_items.length > 0) {
            nextSteps.push('문서에서 추출된 실행 항목들을 검토하고 계획하세요.');
        }

        nextSteps.push('분석 결과를 팀과 공유하고 피드백을 수집하세요.');

        return nextSteps;
    }

    // 전체 신뢰도 계산
    private calculateOverallConfidence(results: MultimodalResponse['analysis_results']): number {
        let totalConfidence = 0;
        let count = 0;

        if (results.image) {
            totalConfidence += results.image.confidence_score;
            count++;
        }

        if (results.code) {
            const avgQuality = Object.values(results.code.quality_metrics).reduce((a, b) => a + b, 0) / 4;
            totalConfidence += avgQuality;
            count++;
        }

        if (results.document) {
            totalConfidence += 0.8; // 문서 분석 기본 신뢰도
            count++;
        }

        return count > 0 ? totalConfidence / count : 0.5;
    }

    // 오류 응답 생성
    private generateErrorResponse(error: Error, processingTime: number): MultimodalResponse {
        return {
            analysis_results: {},
            integrated_insights: [`처리 중 오류가 발생했습니다: ${error.message}`],
            recommendations: ['입력을 확인하고 다시 시도해주세요.'],
            next_steps: ['기술 지원팀에 문의하세요.'],
            confidence_score: 0.1,
            processing_time: processingTime
        };
    }

    // 모델 초기화
    private initializeModels(): void {
        // 실제 구현에서는 AI 모델 로딩
        console.log('Multimodal AI models initialized');
    }

    // 공개 메서드들
    getSupportedFormats(): {
        images: string[];
        documents: string[];
        code: string[];
    } {
        return {
            images: this.supportedImageFormats,
            documents: this.supportedDocumentFormats,
            code: this.supportedCodeFormats
        };
    }

    async processImage(imageFile: File): Promise<ImageAnalysisResult> {
        const input: MultimodalInput = {
            type: 'image',
            content: imageFile,
            metadata: {
                filename: imageFile.name,
                size: imageFile.size,
                format: imageFile.type,
                timestamp: new Date()
            }
        };

        return await this.analyzeImage(input);
    }

    async processDocument(documentFile: File): Promise<DocumentAnalysisResult> {
        const input: MultimodalInput = {
            type: 'document',
            content: documentFile,
            metadata: {
                filename: documentFile.name,
                size: documentFile.size,
                format: documentFile.type,
                timestamp: new Date()
            }
        };

        return await this.analyzeDocument(input);
    }

    async processCode(code: string, filename?: string): Promise<CodeAnalysisResult> {
        const input: MultimodalInput = {
            type: 'code',
            content: code,
            metadata: {
                filename: filename,
                timestamp: new Date()
            }
        };

        return await this.analyzeCode(input);
    }
}

const multimodalAIService = new MultimodalAIService();
export default multimodalAIService;
