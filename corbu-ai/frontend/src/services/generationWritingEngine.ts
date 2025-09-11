/**
 * CORBU AI 연령대별 글쓰기 엔진
 * 50대, 60대, 70대 등 세대별 특징적인 어투와 표현 방식을 반영한 글쓰기 서비스
 */

export type AgeGroup = '20s' | '30s' | '40s' | '50s' | '60s' | '70s' | '80s_plus';
export type GenerationStyle = 'formal_traditional' | 'respectful_conservative' | 'authoritative_experienced' | 'wise_elder' | 'strict_mentor';
export type CommunicationPattern = 'hierarchical' | 'respectful' | 'authoritative' | 'mentoring' | 'commanding';
export type LanguageFormality = 'very_formal' | 'formal' | 'semi_formal' | 'casual' | 'intimate';

export interface GenerationWritingProfile {
    ageGroup: AgeGroup;
    generationStyle: GenerationStyle;
    communicationPattern: CommunicationPattern;
    languageFormality: LanguageFormality;
    useHonorific: boolean;
    useTraditionalExpressions: boolean;
    useGenerationalReferences: boolean;
    includeLifeExperience: boolean;
    showAuthorityTone: boolean;
}

export interface GenerationWritingRequest {
    topic: string;
    originalText?: string;
    profile: GenerationWritingProfile;
    targetAudience: AgeGroup;
    purposeType: 'advice' | 'opinion' | 'criticism' | 'support' | 'explanation';
    targetLength: number;
    includePersonalExperience: boolean;
}

export interface GenerationWritingResponse {
    generatedText: string;
    generationalCharacteristics: string[];
    languageFeatures: string[];
    communicationStyle: string;
    generationalReferences: string[];
    wisdomElements: string[];
    authorityIndicators: string[];
    formalityLevel: string;
}

class GenerationWritingEngine {
    private generationVocabulary: Map<AgeGroup, any>;
    private generationPatterns: Map<AgeGroup, string[]>;
    private communicationStyles: Map<CommunicationPattern, any>;
    private traditionalExpressions: Map<AgeGroup, string[]>;
    private generationalReferences: Map<AgeGroup, any>;

    constructor() {
        this.generationVocabulary = new Map();
        this.generationPatterns = new Map();
        this.communicationStyles = new Map();
        this.traditionalExpressions = new Map();
        this.generationalReferences = new Map();

        this.initializeGenerationVocabulary();
        this.initializeGenerationPatterns();
        this.initializeCommunicationStyles();
        this.initializeTraditionalExpressions();
        this.initializeGenerationalReferences();
    }

    /**
     * 연령대별 어휘 초기화
     */
    private initializeGenerationVocabulary(): void {
        this.generationVocabulary = new Map([
            ['50s', {
                keyWords: ['경험', '실무', '현실적', '책임감', '성숙함', '안정성'],
                honorifics: ['~하십니다', '~이십니다', '~해주십시오', '말씀하신', '생각하시는'],
                modifiers: ['신중한', '경험있는', '현실적인', '책임감 있는', '성숙한'],
                phrases: ['경험상 말씀드리면', '실무적으로 보면', '현실적으로 고려할 때'],
                endings: ['~다고 봅니다', '~라고 생각합니다', '~할 필요가 있습니다']
            }],
            ['60s', {
                keyWords: ['지혜', '경륜', '인생', '세월', '깊이', '성찰', '전통'],
                honorifics: ['~하십니다', '~이십니다', '~드립니다', '말씀하시는', '여쭙습니다'],
                modifiers: ['깊이 있는', '경륜 있는', '지혜로운', '성찰적인', '전통적인'],
                phrases: ['인생 경험으로 볼 때', '오랜 세월 살아보니', '지혜로운 선택은'],
                endings: ['~입니다', '~다고 여겨집니다', '~하는 것이 좋겠습니다']
            }],
            ['70s', {
                keyWords: ['세월', '연륜', '후세', '전통', '가르침', '훈계', '유산'],
                honorifics: ['~하오', '~이오', '~하게', '~하지 않나', '말이야'],
                modifiers: ['오랜', '깊은', '연륜 있는', '전통적인', '권위 있는'],
                phrases: ['세월이 가르쳐 준 것은', '오랜 경험으로 말하면', '후세를 위해서는'],
                endings: ['~하는 것이네', '~다고 봐야 하네', '~해야 할 것이야']
            }],
            ['80s_plus', {
                keyWords: ['평생', '일생', '전통', '가르침', '유훈', '후손', '마지막'],
                honorifics: ['~하오', '~이오', '~하지', '~다네', '~하게나'],
                modifiers: ['평생의', '일생의', '마지막', '최고의', '귀중한'],
                phrases: ['평생을 살아보니', '일생 동안 깨달은 것은', '마지막으로 하고 싶은 말은'],
                endings: ['~하는 것이지', '~다고 할 수 있네', '~해야 한다네']
            }]
        ]);
    }

    /**
     * 연령대별 문체 패턴 초기화
     */
    private initializeGenerationPatterns(): void {
        this.generationPatterns = new Map([
            ['50s', [
                '실무 경험상...',
                '현실적으로 판단해보면...',
                '책임감 있는 입장에서...',
                '성숙한 시각으로 보면...',
                '신중하게 접근한다면...'
            ]],
            ['60s', [
                '인생을 살아보니...',
                '오랜 경험으로 말씀드리면...',
                '지혜로운 관점에서 보면...',
                '깊이 성찰해보면...',
                '세월이 가르쳐 준 것은...'
            ]],
            ['70s', [
                '연륜으로 말하자면...',
                '오랜 세월 겪어보니...',
                '후배들에게 조언하자면...',
                '전통적 관점에서...',
                '권위 있는 입장에서...'
            ]],
            ['80s_plus', [
                '평생을 살아보니...',
                '일생 동안 깨달은 바로는...',
                '후손들을 위해 말하자면...',
                '마지막 당부의 말씀으로...',
                '유훈으로 남기고 싶은 것은...'
            ]]
        ]);
    }

    /**
     * 소통 스타일 초기화
     */
    private initializeCommunicationStyles(): void {
        this.communicationStyles = new Map([
            ['hierarchical', {
                structure: 'top_down',
                tone: 'authoritative',
                approach: 'directive',
                relationshipStyle: 'superior_subordinate'
            }],
            ['respectful', {
                structure: 'mutual_respect',
                tone: 'courteous',
                approach: 'consultative',
                relationshipStyle: 'peer_to_peer'
            }],
            ['authoritative', {
                structure: 'knowledge_based',
                tone: 'confident',
                approach: 'instructive',
                relationshipStyle: 'teacher_student'
            }],
            ['mentoring', {
                structure: 'guidance_oriented',
                tone: 'supportive',
                approach: 'advisory',
                relationshipStyle: 'mentor_mentee'
            }],
            ['commanding', {
                structure: 'direct_control',
                tone: 'firm',
                approach: 'imperative',
                relationshipStyle: 'leader_follower'
            }]
        ]);
    }

    /**
     * 전통적 표현 초기화
     */
    private initializeTraditionalExpressions(): void {
        this.traditionalExpressions = new Map([
            ['50s', [
                '실무진으로서',
                '현장에서 보면',
                '책임자 입장에서',
                '중견 관리자로서',
                '가정의 기둥으로서'
            ]],
            ['60s', [
                '선배로서 한 말씀',
                '인생 선배의 조언',
                '경륜 있는 입장에서',
                '깊은 성찰로',
                '지혜로운 마음으로'
            ]],
            ['70s', [
                '어른의 입장에서',
                '연장자로서',
                '전통을 지키는 마음으로',
                '후배를 아끼는 마음에서',
                '권위 있는 조언으로'
            ]],
            ['80s_plus', [
                '원로의 입장에서',
                '평생의 경험으로',
                '마지막 당부로',
                '후세를 위한 유언으로',
                '일생일대의 조언으로'
            ]]
        ]);
    }

    /**
     * 세대별 참조 표현 초기화
     */
    private initializeGenerationalReferences(): void {
        this.generationalReferences = new Map([
            ['50s', {
                historicalEvents: ['IMF 외환위기', 'IT 혁명', '민주화 운동', '88올림픽'],
                culturalReferences: ['X세대', '신세대', '386세대', '스펙 세대'],
                workExperience: ['평생직장', '연공서열', '외환위기 극복', 'IT 붐'],
                socialValues: ['실용주의', '현실주의', '안정 지향', '책임감']
            }],
            ['60s', {
                historicalEvents: ['한국전쟁', '4·19혁명', '5·16쿠데타', '유신체제', '민주화'],
                culturalReferences: ['전후세대', '산업화 세대', '민주화 세대'],
                workExperience: ['산업화 일꾼', '경제발전 주역', '민주화 투사'],
                socialValues: ['근면성실', '인내', '희생정신', '가족주의']
            }],
            ['70s', {
                historicalEvents: ['일제강점기', '해방', '한국전쟁', '재건 시대'],
                culturalReferences: ['해방세대', '전쟁세대', '재건세대'],
                workExperience: ['맨손으로 시작', '폐허에서 재건', '기적의 시대'],
                socialValues: ['전통', '효도', '권위', '위계질서']
            }],
            ['80s_plus', {
                historicalEvents: ['일제강점기', '해방', '건국', '전쟁'],
                culturalReferences: ['일제강점기 세대', '건국 세대', '전쟁 체험 세대'],
                workExperience: ['나라 잃은 설움', '광복의 기쁨', '건국의 의지'],
                socialValues: ['전통 수호', '조상 숭배', '국가관', '절약정신']
            }]
        ]);
    }

    /**
     * 연령대별 글쓰기 생성
     */
    public async generateGenerationWriting(request: GenerationWritingRequest): Promise<GenerationWritingResponse> {
        try {
            // 1. 세대별 특성 분석
            const generationalCharacteristics = this.analyzeGenerationalCharacteristics(request.profile);

            // 2. 언어적 특징 추출
            const languageFeatures = this.extractLanguageFeatures(request.profile);

            // 3. 소통 스타일 결정
            const communicationStyle = this.determineCommunicationStyle(request.profile);

            // 4. 본문 생성
            const generatedText = this.generateMainContent(request, generationalCharacteristics);

            // 5. 세대별 참조 요소 추가
            const generationalReferences = this.addGenerationalReferences(request.profile, request.topic);

            // 6. 지혜/경험 요소 추가
            const wisdomElements = this.addWisdomElements(request.profile, request.purposeType);

            // 7. 권위 지표 추가
            const authorityIndicators = this.addAuthorityIndicators(request.profile);

            return {
                generatedText,
                generationalCharacteristics,
                languageFeatures,
                communicationStyle,
                generationalReferences,
                wisdomElements,
                authorityIndicators,
                formalityLevel: this.getFormalityDescription(request.profile.languageFormality)
            };

        } catch (error) {
            console.error('연령대별 글쓰기 생성 실패:', error);
            throw new Error('연령대별 글쓰기 생성에 실패했습니다.');
        }
    }

    /**
     * 세대별 특성 분석
     */
    private analyzeGenerationalCharacteristics(profile: GenerationWritingProfile): string[] {
        const characteristics: string[] = [];
        const vocab = this.generationVocabulary.get(profile.ageGroup);
        const refs = this.generationalReferences.get(profile.ageGroup);

        if (vocab && refs) {
            characteristics.push(`${profile.ageGroup} 세대 특유의 ${vocab.keyWords.slice(0, 3).join(', ')} 중시`);
            characteristics.push(`${refs.socialValues.slice(0, 2).join('과 ')} 가치관 반영`);

            if (profile.useTraditionalExpressions) {
                characteristics.push('전통적 표현 방식 활용');
            }

            if (profile.showAuthorityTone) {
                characteristics.push('연령에서 오는 권위적 어조');
            }

            if (profile.includeLifeExperience) {
                characteristics.push('풍부한 인생 경험 바탕');
            }
        }

        return characteristics;
    }

    /**
     * 언어적 특징 추출
     */
    private extractLanguageFeatures(profile: GenerationWritingProfile): string[] {
        const features: string[] = [];
        const vocab = this.generationVocabulary.get(profile.ageGroup);

        if (vocab) {
            if (profile.useHonorific) {
                features.push(`${profile.ageGroup} 세대 특유의 높임말 사용: ${vocab.honorifics.slice(0, 2).join(', ')}`);
            }

            features.push(`세대별 어미 활용: ${vocab.endings.slice(0, 2).join(', ')}`);
            features.push(`특징적 수식어: ${vocab.modifiers.slice(0, 3).join(', ')}`);

            switch (profile.languageFormality) {
                case 'very_formal':
                    features.push('매우 격식적이고 공손한 문체');
                    break;
                case 'formal':
                    features.push('격식을 갖춘 정중한 문체');
                    break;
                case 'semi_formal':
                    features.push('적당히 격식적인 문체');
                    break;
                case 'casual':
                    features.push('편안하고 친근한 문체');
                    break;
            }
        }

        return features;
    }

    /**
     * 소통 스타일 결정
     */
    private determineCommunicationStyle(profile: GenerationWritingProfile): string {
        const style = this.communicationStyles.get(profile.communicationPattern);

        if (style) {
            return `${style.tone} 톤의 ${style.approach} 접근 방식 (${style.relationshipStyle} 관계)`;
        }

        return '일반적인 소통 스타일';
    }

    /**
     * 본문 생성
     */
    private generateMainContent(request: GenerationWritingRequest, characteristics: string[]): string {
        const vocab = this.generationVocabulary.get(request.profile.ageGroup);
        const patterns = this.generationPatterns.get(request.profile.ageGroup);
        const traditionalExprs = this.traditionalExpressions.get(request.profile.ageGroup);

        if (!vocab || !patterns) {
            return `${request.topic}에 대한 ${request.profile.ageGroup} 세대의 관점을 제시합니다.`;
        }

        let content = '';

        // 1. 서론 - 세대별 특징적 시작
        const openingPattern = patterns[Math.floor(Math.random() * patterns.length)];
        content += `${openingPattern} ${request.topic}에 대해 말씀드리고자 합니다.\n\n`;

        // 2. 전통적 표현 추가
        if (request.profile.useTraditionalExpressions && traditionalExprs) {
            const traditionalExpr = traditionalExprs[Math.floor(Math.random() * traditionalExprs.length)];
            content += `${traditionalExpr} 한 말씀드리면, `;
        }

        // 3. 목적별 내용 구성
        switch (request.purposeType) {
            case 'advice':
                content += this.generateAdviceContent(request, vocab);
                break;
            case 'opinion':
                content += this.generateOpinionContent(request, vocab);
                break;
            case 'criticism':
                content += this.generateCriticismContent(request, vocab);
                break;
            case 'support':
                content += this.generateSupportContent(request, vocab);
                break;
            case 'explanation':
                content += this.generateExplanationContent(request, vocab);
                break;
        }

        // 4. 개인 경험 추가
        if (request.includePersonalExperience) {
            const refs = this.generationalReferences.get(request.profile.ageGroup);
            if (refs) {
                const experience = refs.workExperience[Math.floor(Math.random() * refs.workExperience.length)];
                content += `\n\n${experience} 시절을 겪어본 입장에서 말씀드리면, 이러한 문제는 신중하게 접근해야 합니다.`;
            }
        }

        // 5. 결론 - 세대별 특징적 마무리
        const ending = vocab.endings[Math.floor(Math.random() * vocab.endings.length)];
        content += `\n\n이상으로 ${request.topic}에 대한 소견을 말씀${ending}`;

        return content;
    }

    /**
     * 조언 내용 생성
     */
    private generateAdviceContent(request: GenerationWritingRequest, vocab: any): string {
        return `${vocab.keyWords[0]}을 바탕으로 조언드리자면, ${request.topic}에 대해서는 ${vocab.modifiers[0]} 접근이 필요합니다. ` +
            `${vocab.phrases[0]} 이런 상황에서는 무엇보다 ${vocab.keyWords[1]}이 중요하다고 생각합니다.`;
    }

    /**
     * 의견 내용 생성
     */
    private generateOpinionContent(request: GenerationWritingRequest, vocab: any): string {
        return `${request.topic}에 대한 제 견해는 이렇습니다. ${vocab.phrases[0]} ${vocab.modifiers[0]} 관점에서 보면, ` +
            `이 문제는 ${vocab.keyWords[0]}과 ${vocab.keyWords[1]}을 종합적으로 고려해야 할 사안입니다.`;
    }

    /**
     * 비판 내용 생성
     */
    private generateCriticismContent(request: GenerationWritingRequest, vocab: any): string {
        return `${request.topic}에 대해 ${vocab.modifiers[0]} 비판을 제기하고자 합니다. ` +
            `${vocab.phrases[0]} 이런 접근은 ${vocab.keyWords[0]}을 간과하고 있으며, ` +
            `보다 ${vocab.modifiers[1]} 방향으로 개선되어야 한다고 봅니다.`;
    }

    /**
     * 지지 내용 생성
     */
    private generateSupportContent(request: GenerationWritingRequest, vocab: any): string {
        return `${request.topic}에 대해 ${vocab.modifiers[0]} 지지를 표명합니다. ` +
            `${vocab.phrases[0]} 이러한 방향은 ${vocab.keyWords[0]}과 ${vocab.keyWords[1]}에 부합하며, ` +
            `매우 ${vocab.modifiers[1]} 선택이라고 생각합니다.`;
    }

    /**
     * 설명 내용 생성
     */
    private generateExplanationContent(request: GenerationWritingRequest, vocab: any): string {
        return `${request.topic}에 대해 ${vocab.modifiers[0]} 설명을 드리겠습니다. ` +
            `${vocab.phrases[0]} 이 문제는 ${vocab.keyWords[0]}과 ${vocab.keyWords[1]}이라는 두 가지 측면에서 ` +
            `이해할 수 있으며, ${vocab.modifiers[1]} 접근이 필요합니다.`;
    }

    /**
     * 세대별 참조 요소 추가
     */
    private addGenerationalReferences(profile: GenerationWritingProfile, topic: string): string[] {
        const refs = this.generationalReferences.get(profile.ageGroup);
        const references: string[] = [];

        if (refs && profile.useGenerationalReferences) {
            references.push(`${refs.historicalEvents[0]} 시대 경험`);
            references.push(`${refs.culturalReferences[0]} 세대 특성`);
            references.push(`${refs.workExperience[0]} 경험 활용`);
        }

        return references;
    }

    /**
     * 지혜/경험 요소 추가
     */
    private addWisdomElements(profile: GenerationWritingProfile, purposeType: string): string[] {
        const wisdom: string[] = [];
        const vocab = this.generationVocabulary.get(profile.ageGroup);

        if (vocab && profile.includeLifeExperience) {
            switch (profile.ageGroup) {
                case '50s':
                    wisdom.push('실무 경험에서 얻은 교훈');
                    wisdom.push('현실적 판단력');
                    break;
                case '60s':
                    wisdom.push('인생 경험에서 우러나온 지혜');
                    wisdom.push('깊은 성찰과 통찰');
                    break;
                case '70s':
                    wisdom.push('오랜 세월이 준 연륜');
                    wisdom.push('후배에 대한 애정 어린 조언');
                    break;
                case '80s_plus':
                    wisdom.push('평생에 걸친 경험의 정수');
                    wisdom.push('후세를 위한 마지막 당부');
                    break;
            }
        }

        return wisdom;
    }

    /**
     * 권위 지표 추가
     */
    private addAuthorityIndicators(profile: GenerationWritingProfile): string[] {
        const indicators: string[] = [];

        if (profile.showAuthorityTone) {
            switch (profile.ageGroup) {
                case '50s':
                    indicators.push('중견 관리자의 책임감');
                    indicators.push('현장 경험에서 오는 신뢰성');
                    break;
                case '60s':
                    indicators.push('선배로서의 권위');
                    indicators.push('경륜에서 우러나오는 위엄');
                    break;
                case '70s':
                    indicators.push('연장자로서의 지위');
                    indicators.push('전통적 권위의식');
                    break;
                case '80s_plus':
                    indicators.push('원로로서의 존경받는 지위');
                    indicators.push('최고 연장자의 절대적 권위');
                    break;
            }
        }

        return indicators;
    }

    /**
     * 격식 수준 설명
     */
    private getFormalityDescription(formality: LanguageFormality): string {
        const descriptions = {
            'very_formal': '매우 격식적이고 경어법을 철저히 지킨 문체',
            'formal': '격식을 갖추고 정중한 문체',
            'semi_formal': '적당히 격식적이면서 친근한 문체',
            'casual': '편안하고 자연스러운 문체',
            'intimate': '친밀하고 편안한 문체'
        };
        return descriptions[formality];
    }

    /**
     * 연령대별 글쓰기 프로필 추천
     */
    public recommendGenerationProfile(ageGroup: AgeGroup, context: string): GenerationWritingProfile {
        const baseProfile: GenerationWritingProfile = {
            ageGroup,
            generationStyle: 'formal_traditional',
            communicationPattern: 'respectful',
            languageFormality: 'formal',
            useHonorific: true,
            useTraditionalExpressions: true,
            useGenerationalReferences: true,
            includeLifeExperience: true,
            showAuthorityTone: false
        };

        // 연령대별 특성 조정
        switch (ageGroup) {
            case '50s':
                baseProfile.generationStyle = 'authoritative_experienced';
                baseProfile.communicationPattern = 'authoritative';
                baseProfile.showAuthorityTone = true;
                break;
            case '60s':
                baseProfile.generationStyle = 'wise_elder';
                baseProfile.communicationPattern = 'mentoring';
                baseProfile.languageFormality = 'very_formal';
                break;
            case '70s':
                baseProfile.generationStyle = 'strict_mentor';
                baseProfile.communicationPattern = 'hierarchical';
                baseProfile.languageFormality = 'very_formal';
                baseProfile.showAuthorityTone = true;
                break;
            case '80s_plus':
                baseProfile.generationStyle = 'wise_elder';
                baseProfile.communicationPattern = 'commanding';
                baseProfile.languageFormality = 'very_formal';
                baseProfile.showAuthorityTone = true;
                break;
        }

        return baseProfile;
    }

    /**
     * 연령대별 어투 샘플 생성
     */
    public generateAgeGroupSamples(): { [key in AgeGroup]: string } {
        return {
            '20s': '이 문제에 대해서는 새로운 시각으로 접근해보는 게 어떨까요? 기존과는 다른 혁신적인 방법도 고려해볼 만합니다.',
            '30s': '실무 경험을 바탕으로 말씀드리면, 이 문제는 체계적인 접근이 필요할 것 같습니다. 효율성과 현실성을 동시에 고려해야 합니다.',
            '40s': '관리자 입장에서 보면, 이 문제는 신중한 판단이 필요합니다. 책임감 있는 결정을 위해 다각도로 검토해봐야 할 것 같습니다.',
            '50s': '실무 경험상 말씀드리면, 이런 상황에서는 현실적이고 신중한 접근이 필요합니다. 책임감 있는 입장에서 성숙한 판단을 해야 합니다.',
            '60s': '인생을 살아보니 이런 문제는 지혜롭게 접근해야 한다는 것을 깨달았습니다. 오랜 경험으로 말씀드리면, 깊이 성찰해볼 필요가 있습니다.',
            '70s': '연륜으로 말하자면, 오랜 세월 겪어보니 이런 일은 전통적 관점에서 접근하는 것이 좋습니다. 후배들에게 조언하자면 권위 있는 결정이 필요합니다.',
            '80s_plus': '평생을 살아보니 이런 문제는 마지막 당부의 말씀으로 전해드리고 싶습니다. 일생 동안 깨달은 바로는 후손들을 위해 신중해야 한다는 것입니다.'
        };
    }
}

export const generationWritingEngine = new GenerationWritingEngine();
export default generationWritingEngine;
