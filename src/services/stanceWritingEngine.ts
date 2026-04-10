/**
 * CORBU.AI 찬성/반대/중립 논조 글쓰기 엔진
 * 특정 주제에 대한 찬성, 반대, 중립적 입장을 명확하고 설득력 있게 표현하는 글쓰기 서비스
 */

import { errorLogger, toError } from '../utils/errorLogger';

export type StancePosition = 'strongly_support' | 'support' | 'neutral' | 'oppose' | 'strongly_oppose' | 'conditional_support' | 'conditional_oppose';
export type ArgumentStyle = 'logical' | 'emotional' | 'ethical' | 'practical' | 'idealistic' | 'evidence_based' | 'experiential';
export type PersuasionStrategy = 'facts_and_data' | 'emotional_appeal' | 'authority_citation' | 'analogy' | 'cause_effect' | 'pros_cons' | 'precedent';
export type RhetoricalTechnique = 'repetition' | 'contrast' | 'metaphor' | 'rhetorical_question' | 'enumeration' | 'climax' | 'antithesis';

export interface StanceWritingProfile {
    position: StancePosition;
    argumentStyle: ArgumentStyle;
    persuasionStrategy: PersuasionStrategy[];
    rhetoricalTechniques: RhetoricalTechnique[];
    strengthLevel: 'mild' | 'moderate' | 'strong' | 'passionate' | 'extreme';
    includeCounterArguments: boolean;
    includeEvidence: boolean;
    includePersonalExperience: boolean;
    targetAudience: 'general' | 'experts' | 'opponents' | 'supporters' | 'undecided';
}

export interface StanceWritingRequest {
    topic: string;
    originalText?: string;
    profile: StanceWritingProfile;
    targetLength: number;
    requiredSections: ('introduction' | 'main_argument' | 'evidence' | 'counter_argument' | 'conclusion')[];
    tone: 'formal' | 'informal' | 'academic' | 'conversational' | 'passionate';
    includeCallToAction: boolean;
}

export interface StanceWritingResponse {
    generatedText: string;
    stanceIndicators: string[];
    argumentStructure: string[];
    persuasionElements: string[];
    rhetoricalDevices: string[];
    strengthAssessment: string;
    counterArgumentsAddressed: string[];
    evidenceTypes: string[];
}

class StanceWritingEngine {
    private stanceVocabulary: Map<StancePosition, Record<string, unknown>> = new Map();
    private argumentPatterns: Map<ArgumentStyle, string[]> = new Map();
    private persuasionTemplates: Map<PersuasionStrategy, Record<string, unknown>> = new Map();
    private rhetoricalDevices: Map<RhetoricalTechnique, Record<string, unknown>> = new Map();
    private strengthModifiers: Map<string, Record<string, unknown>> = new Map();

    constructor() {
        this.initializeStanceVocabulary();
        this.initializeArgumentPatterns();
        this.initializePersuasionTemplates();
        this.initializeRhetoricalDevices();
        this.initializeStrengthModifiers();
    }

    /**
     * 입장별 어휘 초기화
     */
    private initializeStanceVocabulary(): void {
        this.stanceVocabulary = new Map([
            ['strongly_support', {
                positiveVerbs: ['강력히 지지하다', '전적으로 찬성하다', '열렬히 환영하다', '적극 옹호하다'],
                positiveAdjectives: ['탁월한', '완벽한', '필수적인', '최적의', '혁신적인', '획기적인'],
                positiveAdverbs: ['강력히', '확고히', '절대적으로', '무조건적으로', '전적으로'],
                phrases: ['반드시 실현되어야 할', '시급히 도입해야 할', '적극적으로 추진해야 할'],
                conclusions: ['강력한 지지를 표명합니다', '전적인 찬성 의사를 밝힙니다', '적극적인 지원을 약속합니다']
            }],
            ['support', {
                positiveVerbs: ['지지하다', '찬성하다', '동의하다', '지원하다', '환영하다'],
                positiveAdjectives: ['좋은', '바람직한', '긍정적인', '유익한', '필요한', '적절한'],
                positiveAdverbs: ['충분히', '확실히', '분명히', '기본적으로', '전반적으로'],
                phrases: ['긍정적으로 평가할 수 있는', '충분히 고려할 만한', '지지할 만한'],
                conclusions: ['지지 입장을 밝힙니다', '찬성 의견을 표명합니다', '긍정적으로 평가합니다']
            }],
            ['neutral', {
                neutralVerbs: ['검토하다', '고려하다', '분석하다', '평가하다', '살펴보다'],
                neutralAdjectives: ['복합적인', '다면적인', '신중한', '균형잡힌', '객관적인'],
                neutralAdverbs: ['신중하게', '객관적으로', '균형있게', '다각도로', '종합적으로'],
                phrases: ['다양한 관점에서 볼 때', '장단점을 모두 고려하면', '신중한 접근이 필요한'],
                conclusions: ['신중한 검토가 필요합니다', '다각적 분석이 요구됩니다', '균형잡힌 접근을 제안합니다']
            }],
            ['oppose', {
                negativeVerbs: ['반대하다', '우려하다', '문제제기하다', '의문시하다', '비판하다'],
                negativeAdjectives: ['문제가 있는', '부적절한', '위험한', '불완전한', '비현실적인'],
                negativeAdverbs: ['분명히', '명백히', '확실히', '심각하게', '깊이'],
                phrases: ['우려를 표하는', '문제가 되는', '재검토가 필요한'],
                conclusions: ['반대 입장을 표명합니다', '우려를 표합니다', '재검토를 요구합니다']
            }],
            ['strongly_oppose', {
                negativeVerbs: ['강력히 반대하다', '단호히 거부하다', '결연히 반대하다', '절대 반대하다'],
                negativeAdjectives: ['극도로 위험한', '절대 불가능한', '완전히 잘못된', '치명적인'],
                negativeAdverbs: ['강력히', '단호히', '절대적으로', '결코', '전혀'],
                phrases: ['절대 용납할 수 없는', '강력히 반대해야 할', '즉각 중단되어야 할'],
                conclusions: ['강력한 반대를 표명합니다', '절대 반대 입장을 밝힙니다', '즉각적인 철회를 요구합니다']
            }],
            ['conditional_support', {
                conditionalVerbs: ['조건부로 지지하다', '부분적으로 찬성하다', '단계적으로 지원하다'],
                conditionalAdjectives: ['조건부의', '부분적인', '단계적인', '제한적인', '수정된'],
                conditionalAdverbs: ['조건부로', '부분적으로', '제한적으로', '단계적으로'],
                phrases: ['일정 조건 하에서', '부분적으로 수용 가능한', '수정을 전제로 한'],
                conclusions: ['조건부 지지를 표명합니다', '부분적 찬성 의견을 밝힙니다']
            }],
            ['conditional_oppose', {
                conditionalVerbs: ['조건부로 반대하다', '부분적으로 우려하다', '제한적으로 반대하다'],
                conditionalAdjectives: ['부분적으로 문제가 있는', '일부 우려되는', '제한적으로 반대할'],
                conditionalAdverbs: ['부분적으로', '제한적으로', '조건부로', '특정 부분에서'],
                phrases: ['특정 조건에서 반대하는', '부분적으로 문제가 되는', '일부 수정이 필요한'],
                conclusions: ['부분적 반대 의견을 표명합니다', '조건부 우려를 표합니다']
            }]
        ]);
    }

    /**
     * 논증 스타일별 패턴 초기화
     */
    private initializeArgumentPatterns(): void {
        this.argumentPatterns = new Map([
            ['logical', [
                '논리적으로 분석해보면...',
                '합리적 근거에 따르면...',
                '체계적으로 검토한 결과...',
                '이성적 판단에 의하면...',
                '논리적 결론은...'
            ]],
            ['emotional', [
                '진심으로 호소드리는 것은...',
                '가슴 깊이 느끼는 바는...',
                '간절한 마음으로 말씀드리면...',
                '절실한 심정으로...',
                '감정적으로 공감하는 부분은...'
            ]],
            ['ethical', [
                '도덕적 관점에서 보면...',
                '윤리적 기준으로 판단할 때...',
                '양심적으로 생각해보면...',
                '정의로운 관점에서...',
                '올바른 가치관에 따르면...'
            ]],
            ['practical', [
                '현실적으로 고려해보면...',
                '실용적 관점에서...',
                '실제 적용 가능성을 보면...',
                '현장 경험으로 볼 때...',
                '실무적 측면에서...'
            ]],
            ['idealistic', [
                '이상적인 관점에서...',
                '미래 비전을 그려보면...',
                '희망적인 전망으로...',
                '꿈꾸는 사회를 위해서는...',
                '이상향을 추구한다면...'
            ]],
            ['evidence_based', [
                '객관적 데이터에 따르면...',
                '실증적 연구 결과는...',
                '구체적 사례를 보면...',
                '통계적 분석에 의하면...',
                '과학적 근거로는...'
            ]],
            ['experiential', [
                '경험적으로 말씀드리면...',
                '직접 겪어본 바로는...',
                '실제 사례에서 보듯이...',
                '현장에서 느낀 바는...',
                '체험적 관찰에 의하면...'
            ]]
        ]);
    }

    /**
     * 설득 전략 템플릿 초기화
     */
    private initializePersuasionTemplates(): void {
        this.persuasionTemplates = new Map([
            ['facts_and_data', {
                structure: '객관적 사실 제시 → 데이터 분석 → 결론 도출',
                keywords: ['통계', '데이터', '사실', '연구결과', '객관적 지표'],
                patterns: ['~에 따르면', '~가 입증하고 있다', '~라는 사실이 확인되었다']
            }],
            ['emotional_appeal', {
                structure: '감정적 공감 → 개인적 체험 → 감정적 결론',
                keywords: ['감동', '가슴', '마음', '느낌', '공감'],
                patterns: ['가슴 깊이 느끼는', '진심으로 호소하는', '간절한 마음으로']
            }],
            ['authority_citation', {
                structure: '권위자 의견 인용 → 전문가 견해 → 권위에 기반한 결론',
                keywords: ['전문가', '권위자', '학자', '연구진', '기관'],
                patterns: ['전문가들은 말한다', '권위 있는 기관에서', '연구 결과에 따르면']
            }],
            ['analogy', {
                structure: '유사 사례 제시 → 비교 분석 → 유추를 통한 결론',
                keywords: ['마치', '~와 같이', '비유하자면', '유사하게'],
                patterns: ['~와 마찬가지로', '~에 비유하면', '~와 유사하게']
            }],
            ['cause_effect', {
                structure: '원인 분석 → 결과 예측 → 인과관계 기반 결론',
                keywords: ['원인', '결과', '효과', '영향', '파급효과'],
                patterns: ['~로 인해', '~의 결과로', '~가 초래하는']
            }],
            ['pros_cons', {
                structure: '장점 나열 → 단점 검토 → 균형적 결론',
                keywords: ['장점', '단점', '이점', '문제점', '한계'],
                patterns: ['장점으로는', '반면에', '그러나', '한편으로는']
            }],
            ['precedent', {
                structure: '선례 제시 → 성공/실패 사례 → 선례 기반 결론',
                keywords: ['선례', '사례', '경험', '과거', '역사'],
                patterns: ['과거 사례를 보면', '선례에 따르면', '역사적 경험으로는']
            }]
        ]);
    }

    /**
     * 수사 기법 초기화
     */
    private initializeRhetoricalDevices(): void {
        this.rhetoricalDevices = new Map([
            ['repetition', {
                technique: '반복법',
                effect: '강조와 인상 강화',
                patterns: ['~해야 합니다. ~해야 합니다.', '중요한 것은... 중요한 것은...']
            }],
            ['contrast', {
                technique: '대조법',
                effect: '차이점 부각',
                patterns: ['~인 반면', '~와는 달리', '그러나', '반대로']
            }],
            ['metaphor', {
                technique: '은유법',
                effect: '생생한 이미지 전달',
                patterns: ['~는 마치 ~와 같다', '~는 ~이다', '~라는 거울에 비춰보면']
            }],
            ['rhetorical_question', {
                technique: '의문문',
                effect: '독자 참여 유도',
                patterns: ['~하지 않습니까?', '과연 ~일까요?', '어떻게 ~할 수 있겠습니까?']
            }],
            ['enumeration', {
                technique: '열거법',
                effect: '체계적 정리',
                patterns: ['첫째,', '둘째,', '마지막으로', '또한', '더불어']
            }],
            ['climax', {
                technique: '점층법',
                effect: '감정적 고조',
                patterns: ['~뿐만 아니라', '더 나아가', '궁극적으로는']
            }],
            ['antithesis', {
                technique: '대조법',
                effect: '극명한 대비',
                patterns: ['~가 아니라 ~이다', '~이 아닌 ~', '~보다는 ~']
            }]
        ]);
    }

    /**
     * 강도 수식어 초기화
     */
    private initializeStrengthModifiers(): void {
        this.strengthModifiers = new Map([
            ['mild', {
                intensifiers: ['어느 정도', '약간', '다소', '조금', '부분적으로'],
                qualifiers: ['~할 수도 있다', '~라고 생각된다', '~할 가능성이 있다'],
                certainty: ['아마도', '대체로', '일반적으로', '보통']
            }],
            ['moderate', {
                intensifiers: ['상당히', '꽤', '제법', '충분히', '적절히'],
                qualifiers: ['~할 것이다', '~라고 본다', '~할 필요가 있다'],
                certainty: ['분명히', '확실히', '명백히', '틀림없이']
            }],
            ['strong', {
                intensifiers: ['매우', '크게', '강하게', '현저히', '뚜렷하게'],
                qualifiers: ['~해야 한다', '~라고 확신한다', '~할 것이 확실하다'],
                certainty: ['반드시', '절대적으로', '확실히', '의심할 여지없이']
            }],
            ['passionate', {
                intensifiers: ['극도로', '엄청나게', '대단히', '완전히', '절대적으로'],
                qualifiers: ['~해야만 한다', '~라고 강력히 주장한다', '~할 수밖에 없다'],
                certainty: ['단언컨대', '확신을 갖고', '의심의 여지없이', '100% 확실히']
            }],
            ['extreme', {
                intensifiers: ['극단적으로', '완전히', '절대적으로', '극도로', '최고도로'],
                qualifiers: ['~해야만 한다', '~라고 절대 확신한다', '~할 수밖에 없다'],
                certainty: ['절대적으로', '무조건', '반드시', '틀림없이']
            }]
        ]);
    }

    /**
     * 입장별 글쓰기 생성
     */
    public async generateStanceWriting(request: StanceWritingRequest): Promise<StanceWritingResponse> {
        try {
            // 1. 입장 지표 분석
            const stanceIndicators = this.analyzeStanceIndicators(request.profile);

            // 2. 논증 구조 설계
            const argumentStructure = this.designArgumentStructure(request);

            // 3. 설득 요소 구성
            const persuasionElements = this.buildPersuasionElements(request.profile);

            // 4. 수사 기법 적용
            const rhetoricalDevices = this.applyRhetoricalDevices(request.profile);

            // 5. 본문 생성
            const generatedText = this.generateMainContent(request, argumentStructure);

            // 6. 강도 평가
            const strengthAssessment = this.assessStrength(request.profile);

            // 7. 반박 논리 구성
            const counterArgumentsAddressed = this.addressCounterArguments(request);

            // 8. 증거 유형 분석
            const evidenceTypes = this.analyzeEvidenceTypes(request.profile);

            return {
                generatedText,
                stanceIndicators,
                argumentStructure,
                persuasionElements,
                rhetoricalDevices,
                strengthAssessment,
                counterArgumentsAddressed,
                evidenceTypes
            };

        } catch (error) {
            const err = toError(error);
            errorLogger.error('입장별 글쓰기 생성 실패', err, {
                component: 'stanceWritingEngine',
                action: 'generateStanceWriting',
                topic: request.topic,
                position: request.profile.position,
            });
            throw new Error('입장별 글쓰기 생성에 실패했습니다.');
        }
    }

    /**
     * 입장 지표 분석
     */
    private analyzeStanceIndicators(profile: StanceWritingProfile): string[] {
        const indicators: string[] = [];
        const vocab = this.stanceVocabulary.get(profile.position);

        if (vocab) {
            const pv = (vocab.positiveVerbs as string[] | undefined);
            const nv = (vocab.negativeVerbs as string[] | undefined);
            const cv = (vocab.conditionalVerbs as string[] | undefined);
            if (Array.isArray(pv) && pv.length > 0) {
                indicators.push(`긍정적 동사 사용: ${pv.slice(0, 2).join(', ')}`);
            }
            if (Array.isArray(nv) && nv.length > 0) {
                indicators.push(`부정적 동사 사용: ${nv.slice(0, 2).join(', ')}`);
            }
            if (Array.isArray(cv) && cv.length > 0) {
                indicators.push(`조건부 동사 사용: ${cv.slice(0, 2).join(', ')}`);
            }
            const adjectives = (vocab.positiveAdjectives || vocab.negativeAdjectives || vocab.conditionalAdjectives) as string[] | undefined;
            if (Array.isArray(adjectives) && adjectives.length > 0) {
                indicators.push(`특징적 형용사: ${adjectives.slice(0, 2).join(', ')}`);
            }
            const adverbs = (vocab.positiveAdverbs || vocab.negativeAdverbs || vocab.conditionalAdverbs) as string[] | undefined;
            if (Array.isArray(adverbs) && adverbs.length > 0) {
                indicators.push(`강조 부사: ${adverbs.slice(0, 2).join(', ')}`);
            }
        }

        // 강도 지표
        indicators.push(`표현 강도: ${profile.strengthLevel}`);

        return indicators;
    }

    /**
     * 논증 구조 설계
     */
    private designArgumentStructure(request: StanceWritingRequest): string[] {
        const structure: string[] = [];

        request.requiredSections.forEach(section => {
            switch (section) {
                case 'introduction':
                    structure.push('서론: 주제 제시 및 입장 표명');
                    break;
                case 'main_argument':
                    structure.push(`본론: ${request.profile.argumentStyle} 논증 전개`);
                    break;
                case 'evidence':
                    structure.push('근거: 구체적 증거 및 사례 제시');
                    break;
                case 'counter_argument':
                    structure.push('반박: 상대방 논리에 대한 반박');
                    break;
                case 'conclusion':
                    structure.push('결론: 입장 재확인 및 행동 촉구');
                    break;
            }
        });

        return structure;
    }

    /**
     * 설득 요소 구성
     */
    private buildPersuasionElements(profile: StanceWritingProfile): string[] {
        const elements: string[] = [];

        profile.persuasionStrategy.forEach(strategy => {
            const template = this.persuasionTemplates.get(strategy);
            if (template) {
                elements.push(`${strategy}: ${template.structure}`);
            }
        });

        return elements;
    }

    /**
     * 수사 기법 적용
     */
    private applyRhetoricalDevices(profile: StanceWritingProfile): string[] {
        const devices: string[] = [];

        profile.rhetoricalTechniques.forEach(technique => {
            const device = this.rhetoricalDevices.get(technique);
            if (device) {
                devices.push(`${device.technique}: ${device.effect}`);
            }
        });

        return devices;
    }

    /**
     * 본문 생성
     */
    private generateMainContent(request: StanceWritingRequest, _structure: string[]): string {
        const vocab = this.stanceVocabulary.get(request.profile.position);
        const patterns = this.argumentPatterns.get(request.profile.argumentStyle);
        const strengthMods = this.strengthModifiers.get(request.profile.strengthLevel);

        if (!vocab || !patterns || !strengthMods) {
            return `${request.topic}에 대한 ${request.profile.position} 입장을 제시합니다.`;
        }

        let content = '';

        // 1. 서론
        const intensifiers = (strengthMods.intensifiers as string[] | undefined) || [];
        const _qualifiers = (strengthMods.qualifiers as string[] | undefined) || [];
        const patternsArr = Array.isArray(patterns) ? patterns : [];
        if (request.requiredSections.includes('introduction')) {
            const pattern = patternsArr[0];
            const intensifier = intensifiers[0];
            content += `${pattern} ${request.topic}에 대해 ${intensifier} ${this.getPositionStatement(request.profile.position, vocab)}.\n\n`;
        }

        // 2. 본론
        if (request.requiredSections.includes('main_argument')) {
            const mainPattern = patternsArr[1] || patternsArr[0];
            content += `${mainPattern} 다음과 같은 이유들을 제시할 수 있습니다.\n\n`;

            // 주요 논점들
            content += this.generateMainPoints(request, vocab, strengthMods);
        }

        // 3. 증거
        if (request.requiredSections.includes('evidence') && request.profile.includeEvidence) {
            content += '\n\n' + this.generateEvidenceSection(request, vocab);
        }

        // 4. 반박
        if (request.requiredSections.includes('counter_argument') && request.profile.includeCounterArguments) {
            content += '\n\n' + this.generateCounterArgumentSection(request, vocab);
        }

        // 5. 결론
        if (request.requiredSections.includes('conclusion')) {
            const conclusions = vocab.conclusions as string[] | undefined;
            const conclusion = conclusions?.[0] ?? this.getDefaultConclusion(request.profile.position);
            content += `\n\n결론적으로, ${request.topic}에 대해 ${conclusion}`;

            if (request.includeCallToAction) {
                content += ` 이에 대한 ${this.generateCallToAction(request.profile.position)}을 촉구합니다.`;
            }
        }

        return content;
    }

    /**
     * 입장 표명문 생성
     */
    private getPositionStatement(position: StancePosition, vocab: Record<string, unknown>): string {
        const pv = (vocab.positiveVerbs as string[] | undefined) || [];
        const nv = (vocab.neutralVerbs as string[] | undefined) || [];
        const negv = (vocab.negativeVerbs as string[] | undefined) || [];
        const cv = (vocab.conditionalVerbs as string[] | undefined) || [];
        switch (position) {
            case 'strongly_support':
                return pv[0] || '강력히 지지합니다';
            case 'support':
                return pv[0] || '지지합니다';
            case 'neutral':
                return nv[0] || '신중하게 검토해야 한다고 봅니다';
            case 'oppose':
                return negv[0] || '반대합니다';
            case 'strongly_oppose':
                return negv[0] || '강력히 반대합니다';
            case 'conditional_support':
                return cv[0] || '조건부로 지지합니다';
            case 'conditional_oppose':
                return cv[0] || '조건부로 반대합니다';
            default:
                return '입장을 표명합니다';
        }
    }

    /**
     * 주요 논점 생성
     */
    private generateMainPoints(request: StanceWritingRequest, vocab: Record<string, unknown>, strengthMods: Record<string, unknown>): string {
        let points = '';

        const intMods = (strengthMods.intensifiers as string[] | undefined) || [];
        const qualMods = (strengthMods.qualifiers as string[] | undefined) || [];
        const posAdj = (vocab.positiveAdjectives as string[] | undefined) || [];
        const negAdj = (vocab.negativeAdjectives as string[] | undefined) || [];
        const neuAdj = (vocab.neutralAdjectives as string[] | undefined) || [];
        for (let i = 1; i <= 3; i++) {
            const intensifier = intMods[i % intMods.length] || '';
            const qualifier = qualMods[0] || '';

            points += `${i}. ${intensifier} 중요한 점은 ${request.topic}이 `;

            if (String(request.profile.position).includes('support')) {
                const adjective = posAdj[i - 1] || '긍정적인';
                points += `${adjective} 결과를 가져올 것이라는 점입니다. 이는 ${qualifier}고 봅니다.\n\n`;
            } else if (String(request.profile.position).includes('oppose')) {
                const adjective = negAdj[i - 1] || '부정적인';
                points += `${adjective} 영향을 미칠 수 있다는 점입니다. 이는 ${qualifier}고 생각합니다.\n\n`;
            } else {
                const adjective = neuAdj[i - 1] || '복합적인';
                points += `${adjective} 측면을 가지고 있다는 점입니다. 이는 ${qualifier}고 판단됩니다.\n\n`;
            }
        }

        return points;
    }

    /**
     * 증거 섹션 생성
     */
    private generateEvidenceSection(request: StanceWritingRequest, _vocab: Record<string, unknown>): string {
        let evidence = '**구체적 근거 및 사례:**\n\n';

        // 설득 전략에 따른 증거 유형 결정
        if (request.profile.persuasionStrategy.includes('facts_and_data')) {
            evidence += '• 관련 통계 데이터에 따르면, 이러한 접근이 효과적임이 입증되었습니다.\n';
        }

        if (request.profile.persuasionStrategy.includes('precedent')) {
            evidence += '• 과거 유사한 사례들을 분석해보면, 일관된 패턴을 확인할 수 있습니다.\n';
        }

        if (request.profile.persuasionStrategy.includes('authority_citation')) {
            evidence += '• 해당 분야 전문가들의 의견을 종합하면, 이러한 결론에 도달하게 됩니다.\n';
        }

        return evidence;
    }

    /**
     * 반박 섹션 생성
     */
    private generateCounterArgumentSection(request: StanceWritingRequest, _vocab: Record<string, unknown>): string {
        let counter = '**상대방 주장에 대한 반박:**\n\n';

        // 입장에 따른 반박 논리
        if (request.profile.position.includes('support')) {
            counter += '일부에서 제기하는 우려사항들을 살펴보면, 이는 단기적 관점에서의 제한된 시각이라고 할 수 있습니다. ';
            counter += '장기적이고 포괄적인 관점에서 보면, 이러한 우려들은 충분히 해결 가능한 문제들입니다.';
        } else if (request.profile.position.includes('oppose')) {
            counter += '지지자들이 제시하는 장점들을 검토해보면, 이는 이론적으로는 가능하나 현실적으로는 여러 한계가 있습니다. ';
            counter += '실제 적용 과정에서 발생할 수 있는 부작용들을 충분히 고려하지 못한 것으로 보입니다.';
        }

        return counter;
    }

    /**
     * 행동 촉구문 생성
     */
    private generateCallToAction(position: StancePosition): string {
        switch (position) {
            case 'strongly_support':
                return '적극적인 지원과 실행';
            case 'support':
                return '긍정적 검토와 추진';
            case 'neutral':
                return '신중한 검토와 준비';
            case 'oppose':
                return '재검토와 개선';
            case 'strongly_oppose':
                return '즉각적인 중단과 대안 모색';
            default:
                return '신중한 접근';
        }
    }

    /**
     * 기본 결론문 생성
     */
    private getDefaultConclusion(position: StancePosition): string {
        const conclusions = {
            'strongly_support': '강력한 지지 의사를 표명합니다',
            'support': '지지 입장을 밝힙니다',
            'neutral': '신중한 접근을 제안합니다',
            'oppose': '반대 의견을 표명합니다',
            'strongly_oppose': '강력한 반대 입장을 밝힙니다',
            'conditional_support': '조건부 지지를 표명합니다',
            'conditional_oppose': '조건부 반대를 표명합니다'
        };
        return conclusions[position] || '입장을 표명합니다';
    }

    /**
     * 강도 평가
     */
    private assessStrength(profile: StanceWritingProfile): string {
        const strengthDescriptions = {
            'mild': '온화하고 절제된 표현',
            'moderate': '적당한 강도의 확신 있는 표현',
            'strong': '강력하고 확신에 찬 표현',
            'passionate': '열정적이고 감정적인 표현',
            'extreme': '극단적이고 절대적인 표현'
        };

        return strengthDescriptions[profile.strengthLevel] || '일반적인 표현';
    }

    /**
     * 반박 논리 구성
     */
    private addressCounterArguments(request: StanceWritingRequest): string[] {
        const counterArgs: string[] = [];

        if (request.profile.includeCounterArguments) {
            if (request.profile.position.includes('support')) {
                counterArgs.push('반대측 우려사항에 대한 논리적 반박');
                counterArgs.push('부작용 최소화 방안 제시');
                counterArgs.push('대안 비교를 통한 우위성 입증');
            } else if (request.profile.position.includes('oppose')) {
                counterArgs.push('지지측 논리의 한계점 지적');
                counterArgs.push('현실적 실행 가능성 의문 제기');
                counterArgs.push('예상되는 부작용 상세 분석');
            } else {
                counterArgs.push('양측 논리의 균형적 검토');
                counterArgs.push('객관적 기준에 따른 평가');
                counterArgs.push('다각적 관점에서의 종합 판단');
            }
        }

        return counterArgs;
    }

    /**
     * 증거 유형 분석
     */
    private analyzeEvidenceTypes(profile: StanceWritingProfile): string[] {
        const evidenceTypes: string[] = [];

        if (profile.includeEvidence) {
            profile.persuasionStrategy.forEach(strategy => {
                switch (strategy) {
                    case 'facts_and_data':
                        evidenceTypes.push('통계 데이터 및 객관적 사실');
                        break;
                    case 'authority_citation':
                        evidenceTypes.push('전문가 의견 및 권위 있는 자료');
                        break;
                    case 'precedent':
                        evidenceTypes.push('과거 사례 및 선례');
                        break;
                    case 'analogy':
                        evidenceTypes.push('유사 사례 비교 분석');
                        break;
                }
            });

            if (profile.includePersonalExperience) {
                evidenceTypes.push('개인적 경험 및 체험 사례');
            }
        }

        return evidenceTypes;
    }

    /**
     * 입장별 글쓰기 프로필 추천
     */
    public recommendStanceProfile(topic: string, desiredPosition: StancePosition, _context: string): StanceWritingProfile {
        return {
            position: desiredPosition,
            argumentStyle: 'logical',
            persuasionStrategy: ['facts_and_data', 'cause_effect'],
            rhetoricalTechniques: ['enumeration', 'contrast'],
            strengthLevel: 'moderate',
            includeCounterArguments: true,
            includeEvidence: true,
            includePersonalExperience: false,
            targetAudience: 'general'
        };
    }

    /**
     * 입장별 어조 샘플 생성
     */
    public generateStanceSamples(): { [key in StancePosition]: string } {
        return {
            'strongly_support': '이 정책을 강력히 지지하며 전적으로 찬성합니다! 탁월한 정책으로서 반드시 실현되어야 할 필수적인 방안입니다.',
            'support': '이 정책을 지지하며 긍정적으로 평가합니다. 바람직한 방향으로서 충분히 고려할 만한 좋은 정책이라고 생각합니다.',
            'neutral': '이 정책에 대해서는 신중한 검토가 필요합니다. 다양한 관점에서 장단점을 모두 고려하여 균형잡힌 접근을 해야 합니다.',
            'oppose': '이 정책에 대해 반대 입장을 표명합니다. 여러 문제점들이 우려되며, 부적절한 측면들이 있어 재검토가 필요합니다.',
            'strongly_oppose': '이 정책을 강력히 반대하며 절대 반대합니다! 극도로 위험한 정책으로서 절대 용납할 수 없으며 즉각 중단되어야 합니다.',
            'conditional_support': '특정 조건 하에서 이 정책을 조건부로 지지합니다. 일정한 수정을 전제로 부분적으로 찬성하는 입장입니다.',
            'conditional_oppose': '현재 형태로는 이 정책을 조건부로 반대합니다. 일부 문제점들이 해결된다면 재검토할 여지가 있습니다.'
        };
    }
}

export const stanceWritingEngine = new StanceWritingEngine();
export default stanceWritingEngine;
