// Writing Service - 글쓰기 관련 기능을 제공하는 서비스

export interface WritingTemplate {
    id: string;
    name: string;
    description: string;
    category: 'report' | 'proposal' | 'summary' | 'analysis' | 'document';
    sections: string[];
    keywords: string[];
}

export interface WritingRequest {
    topic: string;
    template: string;
    keywords: string[];
    tone: 'formal' | 'casual' | 'professional' | 'friendly';
    targetAudience: string;
    length: 'short' | 'medium' | 'long';
    format: 'markdown' | 'html' | 'plain';
}

export interface WritingResult {
    id: string;
    title: string;
    content: string;
    summary: string;
    keywords: string[];
    quality: number;
    wordCount: number;
    readingTime: number;
    createdAt: Date;
    metadata: {
        template: string;
        tone: string;
        targetAudience: string;
        complexity: 'simple' | 'moderate' | 'complex';
        sentiment: 'positive' | 'negative' | 'neutral';
    };
}

export interface WritingTool {
    id: string;
    name: string;
    description: string;
    category: 'enhancement' | 'analysis' | 'formatting';
    icon: string;
}

export interface ContentAnalysis {
    wordCount: number;
    readingTime: number;
    complexity: 'simple' | 'moderate' | 'complex';
    sentiment: 'positive' | 'negative' | 'neutral';
    readability: number;
    keywordDensity: { [key: string]: number };
    structure: {
        hasHeadings: boolean;
        hasLists: boolean;
        hasParagraphs: boolean;
        structureScore: number;
    };
}

export class WritingService {
    private templates: WritingTemplate[] = [
        {
            id: 'report',
            name: '리포트 템플릿',
            description: '체계적인 분석과 결론을 포함한 리포트 작성',
            category: 'report',
            sections: ['개요', '분석', '결론', '권고사항'],
            keywords: ['분석', '데이터', '결론', '권고']
        },
        {
            id: 'proposal',
            name: '제안서 템플릿',
            description: '비즈니스 제안서 작성',
            category: 'proposal',
            sections: ['문제 정의', '해결방안', '기대효과', '실행계획'],
            keywords: ['제안', '해결방안', '효과', '계획']
        },
        {
            id: 'summary',
            name: '요약 템플릿',
            description: '긴 문서를 간결하게 요약',
            category: 'summary',
            sections: ['핵심 내용', '주요 포인트', '결론'],
            keywords: ['요약', '핵심', '포인트', '결론']
        }
    ];

    private tools: WritingTool[] = [
        {
            id: 'clarity',
            name: '명확성 향상',
            description: '문장을 더 명확하고 이해하기 쉽게 개선',
            category: 'enhancement',
            icon: '🔍'
        },
        {
            id: 'detail',
            name: '상세화',
            description: '내용을 더 구체적이고 상세하게 보완',
            category: 'enhancement',
            icon: '📝'
        },
        {
            id: 'structure',
            name: '구조 개선',
            description: '문서의 구조와 흐름을 개선',
            category: 'enhancement',
            icon: '🏗️'
        },
        {
            id: 'tone',
            name: '톤 조정',
            description: '문서의 톤과 어조를 조정',
            category: 'enhancement',
            icon: '🎭'
        }
    ];

    // 템플릿 목록 조회
    async getTemplates(): Promise<WritingTemplate[]> {
        return this.templates;
    }

    // 도구 목록 조회
    async getTools(): Promise<WritingTool[]> {
        return this.tools;
    }

    // 글쓰기 생성
    async generateContent(request: WritingRequest): Promise<WritingResult> {
        const template = this.templates.find(t => t.id === request.template);
        if (!template) {
            throw new Error('템플릿을 찾을 수 없습니다.');
        }

        // 콘텐츠 생성 시뮬레이션
        let content = this.generateSectionContent('개요', request.topic, request.tone, request.targetAudience);

        for (const section of template.sections.slice(1)) {
            content += '\n\n' + this.generateSectionContent(section, request.topic, request.tone, request.targetAudience);
        }

        // 길이에 따른 조정
        content = this.adjustLength(content, request.length, request.topic, template);

        const result: WritingResult = {
            id: `writing-${Date.now()}`,
            title: this.generateTitle(request.topic, template),
            content: content,
            summary: this.generateSummary(content),
            keywords: request.keywords,
            quality: this.calculateQuality(content, request),
            wordCount: content.split(' ').length,
            readingTime: Math.ceil(content.split(' ').length / 200), // 분당 200단어 기준
            createdAt: new Date(),
            metadata: {
                template: template.name,
                tone: request.tone,
                targetAudience: request.targetAudience,
                complexity: this.analyzeComplexity(content),
                sentiment: this.analyzeSentiment(content)
            }
        };

        return result;
    }

    // 콘텐츠 향상
    async enhanceContent(content: string, enhancementType: string): Promise<string> {
        switch (enhancementType) {
            case 'clarity':
                return this.enhanceClarity(content);
            case 'detail':
                return this.enhanceDetail(content);
            case 'structure':
                return this.enhanceStructure(content);
            case 'tone':
                return this.enhanceTone(content);
            default:
                return content;
        }
    }

    // 콘텐츠 분석
    async analyzeContent(content: string): Promise<ContentAnalysis> {
        return {
            wordCount: content.split(' ').length,
            readingTime: Math.ceil(content.split(' ').length / 200),
            complexity: this.analyzeComplexity(content),
            sentiment: this.analyzeSentiment(content),
            readability: this.calculateReadability(content),
            keywordDensity: this.calculateKeywordDensity(content),
            structure: this.analyzeStructure(content)
        };
    }

    // 포맷 변환
    async formatContent(content: string, format: string): Promise<string> {
        switch (format) {
            case 'markdown':
                return this.convertToMarkdown(content);
            case 'html':
                return this.convertToHtml(content);
            case 'plain':
                return this.convertToPlain(content);
            default:
                return content;
        }
    }

    // Private helper methods
    private generateSectionContent(section: string, topic: string, tone: string, audience: string): string {
        const sectionTemplates: Record<string, string> = {
            '개요': `${topic}에 대한 개요를 설명드리겠습니다. 이 프로젝트는 ${audience}를 대상으로 진행되는 중요한 프로젝트입니다.`,
            '분석': '지금까지의 주요 성과를 정리하면 다음과 같습니다. 체계적인 접근과 전문적인 관리로 인해 예상보다 좋은 결과를 얻을 수 있었습니다.',
            '진행 상황': '현재 진행 상황을 살펴보면, 계획에 따라 순조롭게 진행되고 있습니다. 각 단계별 목표를 달성하며 다음 단계로 나아가고 있습니다.',
            '문제점 및 해결방안': '프로젝트 진행 중 몇 가지 문제점이 발생했지만, 신속한 대응과 창의적인 해결방안으로 성공적으로 극복했습니다.',
            '다음 단계': '앞으로의 계획을 수립하여 더욱 체계적이고 효율적인 진행을 위해 노력하겠습니다.'
        };

        return sectionTemplates[section as keyof typeof sectionTemplates] || `${section}에 대한 내용을 작성합니다.`;
    }

    private generateTitle(topic: string, template: WritingTemplate): string {
        return `${topic} - ${template.name}`;
    }

    private generateSummary(content: string): string {
        const sentences = content.split('.').slice(0, 3);
        return sentences.join('.') + '.';
    }

    private calculateQuality(content: string, request: WritingRequest): number {
        let quality = 0.7; // 기본 품질

        // 길이에 따른 품질 조정
        const wordCount = content.split(' ').length;
        if (wordCount > 500) quality += 0.1;
        if (wordCount > 1000) quality += 0.1;

        // 키워드 포함도
        const keywordCount = request.keywords.filter(keyword =>
            content.toLowerCase().includes(keyword.toLowerCase())
        ).length;
        quality += (keywordCount / request.keywords.length) * 0.1;

        return Math.min(1.0, quality);
    }

    private analyzeComplexity(content: string): 'simple' | 'moderate' | 'complex' {
        const wordCount = content.split(' ').length;
        const hasComplexTerms = /(분석|전략|시스템|프로세스|최적화|통합)/g.test(content);

        if (wordCount > 1000 || hasComplexTerms) return 'complex';
        if (wordCount > 500) return 'moderate';
        return 'simple';
    }

    private analyzeSentiment(content: string): 'positive' | 'negative' | 'neutral' {
        const positiveWords = ['성공', '개선', '향상', '긍정', '좋은', '훌륭한'];
        const negativeWords = ['문제', '실패', '어려움', '부정', '나쁜', '실망'];

        const positiveCount = positiveWords.filter(word => content.includes(word)).length;
        const negativeCount = negativeWords.filter(word => content.includes(word)).length;

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }

    private enhanceClarity(content: string): string {
        return content.replace(/[가-힣]+[은는이가] [가-힣]+[을를] [가-힣]+[하겠습니다]/g,
            (match: string) => match.split(' ').slice(0, 3).join(' ') + '하겠습니다.');
    }

    private enhanceDetail(content: string): string {
        return content + '\n\n추가적인 상세 정보를 제공하여 더욱 구체적인 내용으로 보완했습니다.';
    }

    private enhanceStructure(content: string): string {
        return content.replace(/\n\n/g, '\n\n---\n\n');
    }

    private enhanceTone(content: string): string {
        return content.replace(/입니다/g, '입니다 😊');
    }

    private calculateReadability(content: string): number {
        const sentences = content.split('.').length;
        const words = content.split(' ').length;
        return words / sentences; // 평균 문장 길이
    }

    private calculateKeywordDensity(content: string): { [key: string]: number } {
        const words = content.toLowerCase().split(' ');
        const wordCount: { [key: string]: number } = {};

        words.forEach((word: string) => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });

        return wordCount;
    }

    private analyzeStructure(content: string): any {
        const hasHeadings = /^#+\s/.test(content);
        const hasLists = /^\s*[-*+]\s/.test(content);
        const hasParagraphs = content.split('\n\n').length > 3;

        return {
            hasHeadings,
            hasLists,
            hasParagraphs,
            structureScore: (hasHeadings ? 0.4 : 0) + (hasLists ? 0.3 : 0) + (hasParagraphs ? 0.3 : 0)
        };
    }

    private convertToMarkdown(content: string): string {
        return content.replace(/^(.+)$/gm, '# $1');
    }

    private convertToHtml(content: string): string {
        return content.replace(/\n/g, '<br>').replace(/^(.+)$/gm, '<h1>$1</h1>');
    }

    private convertToPlain(content: string): string {
        return content.replace(/^#+\s/gm, '').replace(/\n\n/g, '\n');
    }

    private adjustLength(content: string, length: string, topic: string, template: WritingTemplate): string {
        if (length === 'short') {
            content = content.split('\n\n').slice(0, 2).join('\n\n');
        } else if (length === 'long') {
            content += this.generateAdditionalContent(topic, template);
        }

        return content;
    }

    private generateAdditionalContent(topic: string, template: WritingTemplate): string {
        return `\n## 추가 고려사항\n\n${topic}와 관련하여 추가로 고려해야 할 사항들이 있습니다. 이러한 요소들을 종합적으로 검토하여 더욱 완성도 높은 결과물을 만들어 나가겠습니다.`;
    }
}

export const writingService = new WritingService();
