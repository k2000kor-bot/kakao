import { Message } from '../types/project';
import { coerceTrimmedString } from '../utils/chatInputUtils';

export interface NLPAnalysisResult {
    intent: string;
    entities: Entity[];
    sentiment: {
        score: number;
        label: 'positive' | 'negative' | 'neutral';
        confidence: number;
    };
    language: string;
    complexity: number;
    topics: string[];
    keywords: string[];
    context: ContextAnalysis;
    response_strategy: ResponseStrategy;
}

export interface Entity {
    text: string;
    label: string;
    confidence: number;
    start: number;
    end: number;
}

export interface ContextAnalysis {
    conversation_flow: string;
    user_expertise_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    domain: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    formality: 'casual' | 'professional' | 'academic';
}

export interface ResponseStrategy {
    tone: 'friendly' | 'professional' | 'technical' | 'empathetic';
    detail_level: 'brief' | 'moderate' | 'detailed' | 'comprehensive';
    examples_needed: boolean;
    code_examples: boolean;
    visual_aids: boolean;
}

export interface ConversationMemory {
    user_id: string;
    conversation_history: Message[];
    user_preferences: UserPreferences;
    learned_patterns: LearnedPattern[];
    context_stack: string[];
    last_updated: Date;
}

export interface UserPreferences {
    preferred_language: string;
    communication_style: string;
    expertise_domains: string[];
    response_length: 'short' | 'medium' | 'long';
    include_examples: boolean;
    technical_depth: number; // 1-10
}

export interface LearnedPattern {
    pattern_type: string;
    pattern_data: Record<string, unknown>;
    frequency: number;
    confidence: number;
    last_observed: Date;
}

class AdvancedNLPEngine {
    private conversationMemories: Map<string, ConversationMemory> = new Map();
    private domainKnowledge: Map<string, Record<string, unknown>> = new Map();
    private languageModels: Map<string, Record<string, unknown>> = new Map();

    constructor() {
        this.initializeDomainKnowledge();
        this.initializeLanguageModels();
    }

    // 고급 자연어 분석
    async analyzeText(text: string, userId?: string, context?: Record<string, unknown>): Promise<NLPAnalysisResult> {
        const language = this.detectLanguage(text);
        const intent = await this.extractIntent(text, language);
        const entities = await this.extractEntities(text, language);
        const sentiment = await this.analyzeSentiment(text, language);
        const complexity = this.calculateComplexity(text);
        const topics = await this.extractTopics(text, language);
        const keywords = this.extractKeywords(text, language);

        const contextAnalysis = await this.analyzeContext(text, userId, context);
        const responseStrategy = this.determineResponseStrategy(
            intent, sentiment, contextAnalysis, complexity
        );

        return {
            intent,
            entities,
            sentiment,
            language,
            complexity,
            topics,
            keywords,
            context: contextAnalysis,
            response_strategy: responseStrategy
        };
    }

    // 언어 감지
    private detectLanguage(text: string): string {
        // 한국어 패턴 감지
        const koreanPattern = /[\u3131-\u3163\uac00-\ud7a3]/;
        const englishPattern = /[a-zA-Z]/;
        const japanesePattern = /[\u3040-\u309f\u30a0-\u30ff]/;
        const chinesePattern = /[\u4e00-\u9fff]/;

        const koreanCount = (text.match(koreanPattern) || []).length;
        const englishCount = (text.match(englishPattern) || []).length;
        const japaneseCount = (text.match(japanesePattern) || []).length;
        const chineseCount = (text.match(chinesePattern) || []).length;

        const total = koreanCount + englishCount + japaneseCount + chineseCount;

        if (koreanCount / total > 0.3) return 'ko';
        if (englishCount / total > 0.5) return 'en';
        if (japaneseCount / total > 0.3) return 'ja';
        if (chineseCount / total > 0.3) return 'zh';

        return 'en'; // 기본값
    }

    // 의도 추출
    private async extractIntent(text: string, language: string): Promise<string> {
        const intentPatterns = {
            ko: {
                question: /\?|궁금|알려|설명|어떻게|무엇|왜|언제|어디서|누가/,
                request: /해줘|부탁|요청|만들어|생성|작성|도와/,
                command: /실행|시작|중지|삭제|수정|업데이트/,
                analysis: /분석|검토|평가|조사|확인|점검/,
                comparison: /비교|차이|대비|vs|versus/,
                problem_solving: /문제|오류|에러|해결|고치|수정/,
                learning: /배우|학습|공부|익히|연습/,
                creative: /창작|만들|디자인|아이디어|제안/
            },
            en: {
                question: /\?|what|how|why|when|where|who|which|can you|could you/,
                request: /please|can you|could you|would you|help me|assist/,
                command: /run|execute|start|stop|delete|modify|update/,
                analysis: /analyze|review|evaluate|examine|check|assess/,
                comparison: /compare|difference|versus|vs|contrast/,
                problem_solving: /problem|error|issue|solve|fix|debug/,
                learning: /learn|study|understand|explain|teach/,
                creative: /create|design|generate|brainstorm|suggest/
            }
        };

        const patterns = intentPatterns[language as keyof typeof intentPatterns] || intentPatterns.en;

        for (const [intent, pattern] of Object.entries(patterns)) {
            if (pattern.test(text.toLowerCase())) {
                return intent;
            }
        }

        return 'general';
    }

    // 엔티티 추출
    private async extractEntities(text: string, _language: string): Promise<Entity[]> {
        const entities: Entity[] = [];

        // 기술 관련 엔티티
        const techPatterns = {
            programming_language: /\b(JavaScript|Python|Java|C\+\+|React|Vue|Angular|Node\.js|TypeScript)\b/gi,
            framework: /\b(React|Vue|Angular|Express|Django|Flask|Spring|Laravel)\b/gi,
            database: /\b(MySQL|PostgreSQL|MongoDB|Redis|SQLite|Oracle)\b/gi,
            cloud: /\b(AWS|Azure|GCP|Docker|Kubernetes|Heroku)\b/gi,
            tool: /\b(Git|GitHub|VSCode|Webpack|npm|yarn)\b/gi
        };

        // 날짜/시간 엔티티
        const datePatterns = {
            date: /\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/g,
            time: /\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?\b/g
        };

        // 숫자 엔티티
        const numberPatterns = {
            number: /\b\d+(?:\.\d+)?\b/g,
            percentage: /\b\d+(?:\.\d+)?%\b/g,
            currency: /[$₩¥€£]\s*\d+(?:,\d{3})*(?:\.\d{2})?/g
        };

        // 모든 패턴 적용
        const allPatterns = { ...techPatterns, ...datePatterns, ...numberPatterns };

        for (const [label, pattern] of Object.entries(allPatterns)) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                entities.push({
                    text: match[0],
                    label,
                    confidence: 0.8 + Math.random() * 0.2,
                    start: match.index,
                    end: match.index + match[0].length
                });
            }
        }

        return entities;
    }

    // 감정 분석
    private async analyzeSentiment(text: string, language: string): Promise<{ score: number, label: 'positive' | 'negative' | 'neutral', confidence: number }> {
        const sentimentWords = {
            ko: {
                positive: ['좋다', '훌륭하다', '멋지다', '완벽하다', '최고', '감사', '만족', '행복', '성공', '우수'],
                negative: ['나쁘다', '싫다', '실망', '화나다', '문제', '오류', '실패', '어렵다', '복잡하다', '불편']
            },
            en: {
                positive: ['good', 'great', 'excellent', 'perfect', 'amazing', 'wonderful', 'fantastic', 'awesome', 'love', 'like'],
                negative: ['bad', 'terrible', 'awful', 'hate', 'dislike', 'problem', 'issue', 'error', 'difficult', 'complicated']
            }
        };

        const words = sentimentWords[language as keyof typeof sentimentWords] || sentimentWords.en;
        const textLower = text.toLowerCase();

        let positiveScore = 0;
        let negativeScore = 0;

        words.positive.forEach(word => {
            const matches = textLower.split(word).length - 1;
            positiveScore += matches;
        });

        words.negative.forEach(word => {
            const matches = textLower.split(word).length - 1;
            negativeScore += matches;
        });

        const totalWords = text.split(/\s+/).length;
        const normalizedPositive = positiveScore / totalWords;
        const normalizedNegative = negativeScore / totalWords;

        const score = normalizedPositive - normalizedNegative;
        const confidence = Math.min(0.9, Math.abs(score) + 0.5);

        let label: 'positive' | 'negative' | 'neutral';
        if (score > 0.1) label = 'positive';
        else if (score < -0.1) label = 'negative';
        else label = 'neutral';

        return { score, label, confidence };
    }

    // 복잡도 계산
    private calculateComplexity(text: string): number {
        const sentences = text.split(/[.!?]+/).filter((s) => coerceTrimmedString(s, '').length > 0);
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const avgWordsPerSentence = words.length / sentences.length;

        // 기술 용어 밀도
        const techTerms = /\b(algorithm|function|variable|array|object|class|method|API|database|server|client|framework|library|component|interface|implementation|optimization|performance|scalability|architecture|deployment|integration|authentication|authorization|encryption|security|protocol|endpoint|middleware|backend|frontend|fullstack)\b/gi;
        const techMatches = (text.match(techTerms) || []).length;
        const techDensity = techMatches / words.length;

        // 복잡한 문장 구조
        const complexStructures = /\b(however|nevertheless|furthermore|moreover|consequently|therefore|although|whereas|meanwhile|subsequently)\b/gi;
        const complexMatches = (text.match(complexStructures) || []).length;

        const complexity = Math.min(10,
            (avgWordsPerSentence / 10) * 3 +
            (techDensity * 10) * 4 +
            (complexMatches / sentences.length) * 3
        );

        return Math.round(complexity * 10) / 10;
    }

    // 주제 추출
    private async extractTopics(text: string, _language: string): Promise<string[]> {
        const topicKeywords = {
            programming: ['코드', '프로그래밍', '개발', 'code', 'programming', 'development', 'software'],
            web_development: ['웹', '프론트엔드', '백엔드', 'web', 'frontend', 'backend', 'HTML', 'CSS', 'JavaScript'],
            data_science: ['데이터', '분석', '머신러닝', 'data', 'analysis', 'machine learning', 'AI', 'statistics'],
            mobile: ['모바일', '앱', 'mobile', 'app', 'iOS', 'Android', 'React Native', 'Flutter'],
            devops: ['배포', '서버', '클라우드', 'deployment', 'server', 'cloud', 'Docker', 'Kubernetes', 'CI/CD'],
            database: ['데이터베이스', '쿼리', 'database', 'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL'],
            security: ['보안', '인증', 'security', 'authentication', 'encryption', 'SSL', 'HTTPS'],
            performance: ['성능', '최적화', 'performance', 'optimization', 'speed', 'efficiency'],
            testing: ['테스트', '디버깅', 'testing', 'debugging', 'unit test', 'integration test'],
            design: ['디자인', 'UI', 'UX', 'design', 'interface', 'user experience']
        };

        const topics: string[] = [];
        const textLower = text.toLowerCase();

        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            const matches = keywords.filter(keyword => textLower.includes(keyword.toLowerCase()));
            if (matches.length > 0) {
                topics.push(topic);
            }
        }

        return topics.length > 0 ? topics : ['general'];
    }

    // 키워드 추출
    private extractKeywords(text: string, language: string): string[] {
        // 불용어 제거
        const stopWords = {
            ko: ['이', '그', '저', '것', '들', '는', '은', '을', '를', '에', '의', '가', '와', '과', '도', '만', '까지', '부터', '로', '으로'],
            en: ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']
        };

        const words = text.toLowerCase()
            .replace(/[^\w\s가-힣]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2);

        const relevantStopWords = stopWords[language as keyof typeof stopWords] || stopWords.en;
        const filteredWords = words.filter(word => !relevantStopWords.includes(word));

        // 빈도 계산
        const wordFreq: { [key: string]: number } = {};
        filteredWords.forEach(word => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        });

        // 빈도순 정렬하여 상위 키워드 반환
        return Object.entries(wordFreq)
            .sort(([, a], [, b]) => b - a)
            .map(([word]) => word);
    }

    // 컨텍스트 분석
    private async analyzeContext(text: string, userId?: string, _context?: Record<string, unknown>): Promise<ContextAnalysis> {
        const memory = userId ? this.conversationMemories.get(userId) : null;

        // 사용자 전문성 수준 판단
        const expertiseLevel = this.determineExpertiseLevel(text, memory);

        // 도메인 판단
        const domain = await this.determineDomain(text);

        // 긴급도 판단
        const urgency = this.determineUrgency(text);

        // 격식 수준 판단
        const formality = this.determineFormality(text);

        // 대화 흐름 분석
        const conversationFlow = this.analyzeConversationFlow(text, memory);

        return {
            conversation_flow: conversationFlow,
            user_expertise_level: expertiseLevel,
            domain,
            urgency,
            formality
        };
    }

    // 전문성 수준 판단
    private determineExpertiseLevel(text: string, memory?: ConversationMemory | null): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
        const beginnerIndicators = /기초|초보|처음|시작|배우고|모르겠|어려워|basic|beginner|start|learn|don't know/i;
        const expertIndicators = /최적화|아키텍처|성능|스케일링|고급|전문|optimization|architecture|performance|scaling|advanced|expert|professional/i;
        const intermediateIndicators = /경험|사용해봤|알고있|구현|개발|experience|used|implement|develop|familiar/i;

        if (expertIndicators.test(text)) return 'expert';
        if (intermediateIndicators.test(text)) return 'intermediate';
        if (beginnerIndicators.test(text)) return 'beginner';

        // 메모리 기반 판단
        if (memory) {
            const recentMessages = memory.conversation_history.slice(-10);
            const techTermCount = recentMessages.reduce((count, msg) => {
                return count + (msg.content.match(/\b(function|class|method|API|database|server|framework|library|component|interface|implementation)\b/gi) || []).length;
            }, 0);

            if (techTermCount > 20) return 'expert';
            if (techTermCount > 10) return 'advanced';
            if (techTermCount > 5) return 'intermediate';
        }

        return 'intermediate'; // 기본값
    }

    // 도메인 판단
    private async determineDomain(text: string): Promise<string> {
        const domains = {
            'web_development': /웹|프론트엔드|백엔드|HTML|CSS|JavaScript|React|Vue|Angular|web|frontend|backend/i,
            'mobile_development': /모바일|앱|iOS|Android|React Native|Flutter|mobile|app/i,
            'data_science': /데이터|분석|머신러닝|AI|통계|data|analysis|machine learning|statistics|pandas|numpy/i,
            'devops': /배포|서버|클라우드|Docker|Kubernetes|AWS|Azure|deployment|server|cloud|infrastructure/i,
            'database': /데이터베이스|SQL|MongoDB|PostgreSQL|쿼리|database|query|schema/i,
            'security': /보안|인증|암호화|security|authentication|encryption|SSL|cybersecurity/i,
            'design': /디자인|UI|UX|인터페이스|design|interface|user experience|figma|sketch/i,
            'project_management': /프로젝트|관리|일정|팀|project|management|schedule|team|agile|scrum/i
        };

        for (const [domain, pattern] of Object.entries(domains)) {
            if (pattern.test(text)) {
                return domain;
            }
        }

        return 'general';
    }

    // 긴급도 판단
    private determineUrgency(text: string): 'low' | 'medium' | 'high' | 'critical' {
        const criticalIndicators = /긴급|즉시|당장|critical|urgent|immediately|asap|emergency/i;
        const highIndicators = /빨리|서둘|중요|important|quickly|soon|priority/i;
        const lowIndicators = /천천히|나중에|여유|slowly|later|whenever|no rush/i;

        if (criticalIndicators.test(text)) return 'critical';
        if (highIndicators.test(text)) return 'high';
        if (lowIndicators.test(text)) return 'low';

        return 'medium';
    }

    // 격식 수준 판단
    private determineFormality(text: string): 'casual' | 'professional' | 'academic' {
        const casualIndicators = /ㅋㅋ|ㅎㅎ|~|!{2,}|lol|haha|😊|😄|👍/;
        const academicIndicators = /논문|연구|학술|분석|검토|평가|research|study|analysis|evaluation|methodology/i;
        const professionalIndicators = /회사|업무|프로젝트|비즈니스|company|business|project|professional|corporate/i;

        if (academicIndicators.test(text)) return 'academic';
        if (professionalIndicators.test(text)) return 'professional';
        if (casualIndicators.test(text)) return 'casual';

        return 'professional'; // 기본값
    }

    // 대화 흐름 분석
    private analyzeConversationFlow(text: string, memory?: ConversationMemory | null): string {
        if (!memory || memory.conversation_history.length === 0) {
            return 'new_conversation';
        }

        const lastMessage = memory.conversation_history[memory.conversation_history.length - 1];
        const timeDiff = Date.now() - new Date(lastMessage.timestamp).getTime();

        if (timeDiff > 24 * 60 * 60 * 1000) return 'resumed_conversation';
        if (timeDiff > 60 * 60 * 1000) return 'continued_conversation';

        // 주제 연속성 확인
        const currentTopics = this.extractKeywords(text, 'ko');
        const lastTopics = this.extractKeywords(lastMessage.content, 'ko');
        const commonTopics = currentTopics.filter(topic => lastTopics.includes(topic));

        if (commonTopics.length > 0) return 'topic_continuation';

        return 'topic_change';
    }

    // 응답 전략 결정
    private determineResponseStrategy(
        intent: string,
        sentiment: Record<string, unknown>,
        context: ContextAnalysis,
        complexity: number
    ): ResponseStrategy {
        let tone: ResponseStrategy['tone'] = 'professional';
        let detailLevel: ResponseStrategy['detail_level'] = 'moderate';
        let examplesNeeded = false;
        let codeExamples = false;
        let visualAids = false;

        // 톤 결정
        if (context.formality === 'casual') tone = 'friendly';
        else if (context.formality === 'academic') tone = 'technical';
        else if (sentiment.label === 'negative') tone = 'empathetic';

        // 상세도 결정
        if (context.user_expertise_level === 'beginner') {
            detailLevel = 'detailed';
            examplesNeeded = true;
        } else if (context.user_expertise_level === 'expert') {
            detailLevel = 'brief';
        } else if (complexity > 7) {
            detailLevel = 'comprehensive';
            examplesNeeded = true;
        }

        // 코드 예제 필요성
        if (['programming', 'web_development', 'mobile_development'].includes(context.domain)) {
            codeExamples = true;
        }

        // 시각적 도구 필요성
        if (intent === 'analysis' || intent === 'comparison' || complexity > 8) {
            visualAids = true;
        }

        return {
            tone,
            detail_level: detailLevel,
            examples_needed: examplesNeeded,
            code_examples: codeExamples,
            visual_aids: visualAids
        };
    }

    // 대화 메모리 업데이트
    updateConversationMemory(userId: string, message: Message): void {
        let memory = this.conversationMemories.get(userId);

        if (!memory) {
            memory = {
                user_id: userId,
                conversation_history: [],
                user_preferences: {
                    preferred_language: 'ko',
                    communication_style: 'professional',
                    expertise_domains: [],
                    response_length: 'medium',
                    include_examples: true,
                    technical_depth: 5
                },
                learned_patterns: [],
                context_stack: [],
                last_updated: new Date()
            };
        }

        memory.conversation_history.push(message);
        memory.last_updated = new Date();

        // 최근 50개 메시지만 유지
        if (memory.conversation_history.length > 50) {
            memory.conversation_history = memory.conversation_history.slice(-50);
        }

        this.conversationMemories.set(userId, memory);
    }

    // 도메인 지식 초기화
    private initializeDomainKnowledge(): void {
        this.domainKnowledge.set('programming', {
            languages: ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 'Go', 'Rust'],
            frameworks: ['React', 'Vue', 'Angular', 'Express', 'Django', 'Spring'],
            concepts: ['OOP', 'FP', 'Design Patterns', 'Algorithms', 'Data Structures']
        });

        this.domainKnowledge.set('web_development', {
            frontend: ['HTML', 'CSS', 'JavaScript', 'React', 'Vue', 'Angular'],
            backend: ['Node.js', 'Python', 'Java', 'PHP', 'Ruby'],
            databases: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis'],
            tools: ['Webpack', 'Babel', 'ESLint', 'Prettier']
        });
    }

    // 언어 모델 초기화
    private initializeLanguageModels(): void {
        // 간단한 언어별 모델 설정
        this.languageModels.set('ko', {
            tokenizer: 'korean',
            stopwords: ['이', '그', '저', '것', '들', '는', '은', '을', '를'],
            patterns: {
                question: /\?|궁금|알려|설명/,
                request: /해줘|부탁|요청/
            }
        });

        this.languageModels.set('en', {
            tokenizer: 'english',
            stopwords: ['the', 'a', 'an', 'and', 'or', 'but'],
            patterns: {
                question: /\?|what|how|why/,
                request: /please|can you|could you/
            }
        });
    }

    // 공개 메서드들
    getConversationMemory(userId: string): ConversationMemory | undefined {
        return this.conversationMemories.get(userId);
    }

    updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): void {
        const memory = this.conversationMemories.get(userId);
        if (memory) {
            memory.user_preferences = { ...memory.user_preferences, ...preferences };
            this.conversationMemories.set(userId, memory);
        }
    }

    clearConversationMemory(userId: string): void {
        this.conversationMemories.delete(userId);
    }

    getAnalyticsData(): Record<string, unknown> {
        return {
            total_users: this.conversationMemories.size,
            total_conversations: Array.from(this.conversationMemories.values())
                .reduce((sum, memory) => sum + memory.conversation_history.length, 0),
            language_distribution: this.getLanguageDistribution(),
            domain_distribution: this.getDomainDistribution()
        };
    }

    private getLanguageDistribution(): Record<string, unknown> {
        const distribution: { [key: string]: number } = {};
        this.conversationMemories.forEach(memory => {
            const lang = memory.user_preferences.preferred_language;
            distribution[lang] = (distribution[lang] || 0) + 1;
        });
        return distribution;
    }

    private getDomainDistribution(): Record<string, unknown> {
        const distribution: { [key: string]: number } = {};
        this.conversationMemories.forEach(memory => {
            memory.user_preferences.expertise_domains.forEach(domain => {
                distribution[domain] = (distribution[domain] || 0) + 1;
            });
        });
        return distribution;
    }
}

const advancedNLPEngine = new AdvancedNLPEngine();
export default advancedNLPEngine;
