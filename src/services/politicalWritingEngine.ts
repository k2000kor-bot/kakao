/**
 * CORBU.AI 정치적 성향별 글쓰기 엔진
 * 극우, 진보, 중도 등 다양한 정치적 성향을 반영한 글쓰기 서비스
 */
import { errorLogger, toError } from '../utils/errorLogger';

export type PoliticalSpectrum = 'extreme_right' | 'conservative' | 'center_right' | 'center' | 'center_left' | 'progressive' | 'extreme_left';
export type PoliticalStance = 'strongly_support' | 'support' | 'neutral' | 'oppose' | 'strongly_oppose';
export type EmotionIntensity = 'very_calm' | 'calm' | 'moderate' | 'passionate' | 'very_passionate' | 'militant' | 'aggressive';
export type ToneIntensity = 'gentle' | 'moderate' | 'firm' | 'strong' | 'militant' | 'aggressive' | 'combative';

export interface PoliticalWritingProfile {
    spectrum: PoliticalSpectrum;
    stance: PoliticalStance;
    emotionIntensity: EmotionIntensity;
    toneIntensity: ToneIntensity;
    useRhetoric: boolean;
    useStatistics: boolean;
    useEmotionalAppeal: boolean;
    useMilitantLanguage: boolean;
    useAggressiveRhetoric: boolean;
    formalityLevel: 'very_formal' | 'formal' | 'moderate' | 'informal' | 'very_informal';
}

export interface PoliticalWritingRequest {
    topic: string;
    originalText?: string;
    profile: PoliticalWritingProfile;
    targetLength: number;
    includeReferences: boolean;
    outputFormat: 'essay' | 'opinion' | 'rebuttal' | 'support' | 'analysis';
}

export interface PoliticalWritingResponse {
    generatedText: string;
    keyArguments: string[];
    rhetoricalDevices: string[];
    emotionalTone: string;
    persuasionStrategies: string[];
    counterArgumentsAddressed: string[];
    politicalFraming: string;
    languageStyle: string;
}

class PoliticalWritingEngine {
    private politicalVocabulary: Map<PoliticalSpectrum, Record<string, unknown>> = new Map();
    private rhetoricalPatterns: Map<PoliticalSpectrum, string[]> = new Map();
    private argumentationStyles: Map<PoliticalSpectrum, Record<string, unknown>> = new Map();
    private militantVocabulary: Map<ToneIntensity, Record<string, unknown>> = new Map();
    private aggressivePatterns: Map<ToneIntensity, string[]> = new Map();

    constructor() {
        this.initializePoliticalVocabulary();
        this.initializeRhetoricalPatterns();
        this.initializeArgumentationStyles();
        this.initializeMilitantVocabulary();
        this.initializeAggressivePatterns();
    }

    /**
     * 정치적 성향별 어휘 초기화
     */
    private initializePoliticalVocabulary(): void {
        this.politicalVocabulary = new Map([
            ['extreme_right', {
                keyWords: ['전통', '보수', '질서', '안보', '국가', '애국', '자유시장', '규제완화'],
                phrases: ['국가 정체성', '전통 가치', '강력한 국방', '시장 경제'],
                modifiers: ['확고한', '단호한', '명확한', '전통적인', '보수적인'],
                opposingTerms: ['좌파', '진보', '사회주의', '포퓰리즘'],
                supportTerms: ['우파', '보수', '자유주의', '시장경제']
            }],
            ['conservative', {
                keyWords: ['안정', '점진적', '신중한', '경험', '실용', '균형'],
                phrases: ['점진적 개혁', '안정적 발전', '신중한 접근', '균형잡힌 정책'],
                modifiers: ['신중한', '실용적인', '균형잡힌', '현실적인'],
                opposingTerms: ['급진적', '성급한', '실험적'],
                supportTerms: ['안정적', '점진적', '현실적']
            }],
            ['center', {
                keyWords: ['균형', '합리적', '객관적', '중도', '실용', '타협'],
                phrases: ['균형잡힌 접근', '합리적 해결', '중도적 입장', '실용적 정책'],
                modifiers: ['균형잡힌', '합리적인', '객관적인', '현실적인'],
                opposingTerms: ['극단적', '편향적', '일방적'],
                supportTerms: ['중도적', '균형적', '합리적']
            }],
            ['progressive', {
                keyWords: ['진보', '개혁', '평등', '혁신', '포용', '다양성', '사회정의'],
                phrases: ['사회적 진보', '평등한 기회', '포용적 성장', '혁신적 변화'],
                modifiers: ['진보적인', '혁신적인', '포용적인', '개방적인'],
                opposingTerms: ['보수', '기득권', '불평등', '차별'],
                supportTerms: ['진보', '개혁', '평등', '혁신']
            }],
            ['extreme_left', {
                keyWords: ['혁명', '변혁', '계급', '민중', '반체제', '사회변화'],
                phrases: ['근본적 변혁', '사회 구조 개혁', '민중의 권리', '체제 변화'],
                modifiers: ['혁명적인', '급진적인', '변혁적인', '투쟁적인'],
                opposingTerms: ['기득권', '자본가', '체제', '보수'],
                supportTerms: ['민중', '노동자', '변혁', '혁명']
            }]
        ]);
    }

    /**
     * 수사학적 패턴 초기화
     */
    private initializeRhetoricalPatterns(): void {
        this.rhetoricalPatterns = new Map([
            ['extreme_right', [
                '국가의 정체성을 지키기 위해서는...',
                '우리의 전통 가치를 수호해야...',
                '강력한 국방력만이...',
                '자유시장 경제의 원칙에 따라...',
                '좌파의 선동에 휘둘리지 말고...'
            ]],
            ['conservative', [
                '신중한 접근이 필요한 시점에서...',
                '기존의 경험을 토대로...',
                '안정적인 발전을 위해서는...',
                '점진적인 개선을 통해...',
                '균형잡힌 정책이 요구됩니다.'
            ]],
            ['center', [
                '양측의 의견을 종합해보면...',
                '객관적으로 분석해볼 때...',
                '합리적인 해결책을 찾기 위해...',
                '균형잡힌 관점에서 보면...',
                '실용적인 접근이 필요합니다.'
            ]],
            ['progressive', [
                '사회적 진보를 위해서는...',
                '모든 시민의 평등한 권리를...',
                '혁신적인 변화가 필요한...',
                '포용적 성장을 통해...',
                '사회정의를 실현하기 위해...'
            ]],
            ['extreme_left', [
                '근본적인 변혁이 필요한...',
                '기득권의 저항에도 불구하고...',
                '민중의 권리를 위해 투쟁해야...',
                '체제의 모순을 해결하려면...',
                '혁명적 변화만이 답입니다.'
            ]]
        ]);
    }

    /**
     * 논증 스타일 초기화
     */
    private initializeArgumentationStyles(): void {
        this.argumentationStyles = new Map([
            ['extreme_right', {
                structure: 'deductive', // 연역적
                evidenceType: 'authority_tradition',
                emotionalAppeal: 'fear_pride',
                logicalStyle: 'absolute',
                conclusionStyle: 'definitive'
            }],
            ['conservative', {
                structure: 'deductive',
                evidenceType: 'experience_statistics',
                emotionalAppeal: 'security_stability',
                logicalStyle: 'cautious',
                conclusionStyle: 'measured'
            }],
            ['center', {
                structure: 'balanced',
                evidenceType: 'multiple_sources',
                emotionalAppeal: 'fairness_pragmatism',
                logicalStyle: 'analytical',
                conclusionStyle: 'conditional'
            }],
            ['progressive', {
                structure: 'inductive', // 귀납적
                evidenceType: 'social_research',
                emotionalAppeal: 'hope_justice',
                logicalStyle: 'idealistic',
                conclusionStyle: 'aspirational'
            }],
            ['extreme_left', {
                structure: 'dialectical', // 변증법적
                evidenceType: 'class_analysis',
                emotionalAppeal: 'anger_solidarity',
                logicalStyle: 'revolutionary',
                conclusionStyle: 'radical'
            }]
        ]);
    }

    /**
     * 강성/전투적 어휘 초기화
     */
    private initializeMilitantVocabulary(): void {
        this.militantVocabulary = new Map([
            ['gentle', {
                adjectives: ['온화한', '부드러운', '차분한', '친근한', '따뜻한'],
                verbs: ['제안하다', '권유하다', '당부하다', '부탁하다', '호소하다'],
                adverbs: ['정중하게', '조심스럽게', '겸손하게', '신중하게'],
                phrases: ['조심스럽게 말씀드리면', '감히 제안하건대', '혹시 고려해보실 수 있다면']
            }],
            ['moderate', {
                adjectives: ['적절한', '합리적인', '균형잡힌', '현실적인', '실용적인'],
                verbs: ['제시하다', '설명하다', '주장하다', '요구하다', '제안하다'],
                adverbs: ['분명하게', '명확하게', '확실하게', '정확하게'],
                phrases: ['분명히 말씀드리면', '명확하게 밝히자면', '확실한 것은']
            }],
            ['firm', {
                adjectives: ['확고한', '단호한', '명확한', '분명한', '결정적인'],
                verbs: ['주장하다', '요구하다', '강조하다', '단언하다', '선언하다'],
                adverbs: ['단호하게', '확고하게', '분명하게', '결연하게'],
                phrases: ['단호하게 말하건대', '확고한 입장은', '분명히 밝히는 바는']
            }],
            ['strong', {
                adjectives: ['강력한', '단호한', '결연한', '불굴의', '확신에 찬'],
                verbs: ['강력히 주장하다', '단호히 요구하다', '결연히 반대하다', '확신하다', '선포하다'],
                adverbs: ['강력하게', '단호히', '결연히', '단연코', '틀림없이'],
                phrases: ['강력히 주장하는 바는', '단호한 입장을 밝히면', '결연한 의지로']
            }],
            ['militant', {
                adjectives: ['전투적인', '투쟁적인', '불굴의', '철저한', '비타협적인', '강경한'],
                verbs: ['투쟁하다', '전투하다', '분쇄하다', '척결하다', '응징하다', '단죄하다'],
                adverbs: ['투쟁적으로', '전투적으로', '비타협적으로', '강경하게', '철저히'],
                phrases: ['강경한 투쟁으로', '비타협적 자세로', '전면적 대응을 통해', '철저한 응징이']
            }],
            ['aggressive', {
                adjectives: ['공격적인', '파괴적인', '전면적인', '무자비한', '강압적인', '위협적인'],
                verbs: ['공격하다', '파괴하다', '박멸하다', '섬멸하다', '응징하다', '분쇄하다', '궤멸시키다'],
                adverbs: ['공격적으로', '무자비하게', '전면적으로', '강압적으로', '위협적으로'],
                phrases: ['무자비한 공격으로', '전면적 대응으로', '강압적 수단을 통해', '위협적 자세로']
            }],
            ['combative', {
                adjectives: ['전쟁적인', '살벌한', '파멸적인', '절멸적인', '도발적인', '혁명적인'],
                verbs: ['전쟁하다', '파멸시키다', '절멸시키다', '도발하다', '혁명하다', '전복시키다'],
                adverbs: ['전쟁적으로', '살벌하게', '파멸적으로', '도발적으로', '혁명적으로'],
                phrases: ['전면전을 통해', '살벌한 대응으로', '파멸적 타격을 가해', '도발적 행동으로']
            }]
        ]);
    }

    /**
     * 공격적/강성 수사 패턴 초기화
     */
    private initializeAggressivePatterns(): void {
        this.aggressivePatterns = new Map([
            ['gentle', [
                '정중하게 말씀드리자면...',
                '조심스럽게 제안하건대...',
                '혹시 가능하다면...',
                '감히 건의드리는 것은...',
                '정중히 요청드리는 바는...'
            ]],
            ['moderate', [
                '명확하게 밝히자면...',
                '분명한 입장은...',
                '확실한 것은...',
                '정확히 말하면...',
                '명백한 사실은...'
            ]],
            ['firm', [
                '단호하게 말하건대...',
                '확고한 신념으로...',
                '분명히 선언하는 바는...',
                '결연한 의지로...',
                '굳은 결심으로...'
            ]],
            ['strong', [
                '강력히 주장하는 바는...',
                '단호한 입장을 밝히면...',
                '결연한 의지를 표명하며...',
                '확신에 찬 목소리로...',
                '불굴의 정신으로...'
            ]],
            ['militant', [
                '투쟁적 자세로 임하여...',
                '전투적 의지를 다지며...',
                '비타협적 입장에서...',
                '강경한 대응을 통해...',
                '철저한 응징으로...',
                '단호한 투쟁으로...'
            ]],
            ['aggressive', [
                '공격적으로 대응하여...',
                '무자비한 응징으로...',
                '전면적 대결을 통해...',
                '강압적 수단으로...',
                '위협적 자세로...',
                '파괴적 힘으로...'
            ]],
            ['combative', [
                '전면전을 선포하며...',
                '살벌한 대응으로...',
                '파멸적 타격을 가해...',
                '절멸적 공격으로...',
                '도발적 행동으로...',
                '혁명적 변혁을 통해...'
            ]]
        ]);
    }

    /**
     * 정치적 성향별 글쓰기 생성
     */
    public async generatePoliticalWriting(request: PoliticalWritingRequest): Promise<PoliticalWritingResponse> {
        try {
            // 1. 정치적 프레이밍 분석
            const politicalFraming = this.analyzePoliticalFraming(request.topic, request.profile);

            // 2. 핵심 논증 구성
            const keyArguments = this.buildKeyArguments(request.topic, request.profile);

            // 3. 수사학적 장치 선택
            const rhetoricalDevices = this.selectRhetoricalDevices(request.profile);

            // 4. 글 구조 설계
            const structure = this.designWritingStructure(request.profile, request.outputFormat);

            // 5. 본문 생성
            const generatedText = this.generateMainText(request, keyArguments, structure);

            // 6. 강성 어조 적용
            const militantText = this.applyMilitantTone(generatedText, request.profile);

            // 7. 감정적 톤 조절
            const emotionalTone = this.adjustEmotionalTone(militantText, request.profile);

            // 8. 설득 전략 분석
            const persuasionStrategies = this.identifyPersuasionStrategies(request.profile);

            // 9. 반박 논리 구성
            const counterArgumentsAddressed = this.addressCounterArguments(request.topic, request.profile);

            return {
                generatedText: emotionalTone.adjustedText,
                keyArguments,
                rhetoricalDevices,
                emotionalTone: emotionalTone.toneDescription,
                persuasionStrategies,
                counterArgumentsAddressed,
                politicalFraming,
                languageStyle: this.getLanguageStyle(request.profile)
            };

        } catch (error) {
            const err = toError(error);
            errorLogger.error('정치적 글쓰기 생성 실패', err, {
                component: 'politicalWritingEngine',
                action: 'generatePoliticalWriting',
                topic: request.topic,
            });
            throw new Error('정치적 성향별 글쓰기 생성에 실패했습니다.');
        }
    }

    /**
     * 정치적 프레이밍 분석
     */
    private analyzePoliticalFraming(topic: string, profile: PoliticalWritingProfile): string {
        const _vocabulary = this.politicalVocabulary.get(profile.spectrum);

        switch (profile.spectrum) {
            case 'extreme_right':
                return `${topic}을 국가 정체성과 전통 가치 보존의 관점에서 접근`;
            case 'conservative':
                return `${topic}에 대한 신중하고 점진적인 접근을 통한 안정적 해결`;
            case 'center':
                return `${topic}에 대한 균형잡힌 시각과 합리적 분석을 통한 중도적 해결`;
            case 'progressive':
                return `${topic}을 사회적 진보와 평등 실현의 관점에서 접근`;
            case 'extreme_left':
                return `${topic}에 대한 근본적 변혁과 체제 개혁의 관점에서 접근`;
            default:
                return `${topic}에 대한 균형잡힌 접근`;
        }
    }

    /**
     * 핵심 논증 구성
     */
    private buildKeyArguments(topic: string, profile: PoliticalWritingProfile): string[] {
        const args: string[] = [];
        const vocabulary = this.politicalVocabulary.get(profile.spectrum);

        switch (profile.stance) {
            case 'strongly_support':
                args.push(`${topic}은 ${((vocabulary?.supportTerms as string[] | undefined)?.[0]) || '중요한'} 가치를 실현하는 핵심 방안입니다.`);
                args.push(`현재 상황에서 ${topic}은 반드시 필요한 조치입니다.`);
                args.push(`${topic}을 통해 우리가 추구하는 이상을 달성할 수 있습니다.`);
                break;
            case 'support':
                args.push(`${topic}은 전반적으로 긍정적인 방향으로 평가됩니다.`);
                args.push(`몇 가지 우려사항이 있지만, ${topic}의 장점이 더 큽니다.`);
                break;
            case 'neutral':
                args.push(`${topic}에 대해서는 다양한 관점이 존재합니다.`);
                args.push(`${topic}의 장단점을 신중히 검토해야 합니다.`);
                break;
            case 'oppose':
                args.push(`${topic}에 대해 여러 우려사항이 제기됩니다.`);
                args.push(`현재 형태의 ${topic}은 재검토가 필요합니다.`);
                break;
            case 'strongly_oppose':
                args.push(`${topic}은 ${((vocabulary?.opposingTerms as string[] | undefined)?.[0]) || '문제가 있는'} 접근입니다.`);
                args.push(`${topic}은 우리의 핵심 가치와 상충됩니다.`);
                args.push(`${topic}을 강력히 반대하며, 대안적 접근이 필요합니다.`);
                break;
        }

        return args;
    }

    /**
     * 수사학적 장치 선택
     */
    private selectRhetoricalDevices(profile: PoliticalWritingProfile): string[] {
        const devices: string[] = [];

        if (profile.useRhetoric) {
            switch (profile.spectrum) {
                case 'extreme_right':
                    devices.push('애국적 호소', '전통 가치 강조', '위기감 조성');
                    break;
                case 'conservative':
                    devices.push('경험적 근거', '점진적 논리', '안정성 강조');
                    break;
                case 'center':
                    devices.push('균형적 논증', '다각적 분석', '합리적 근거');
                    break;
                case 'progressive':
                    devices.push('사회정의 호소', '미래 비전 제시', '포용적 언어');
                    break;
                case 'extreme_left':
                    devices.push('계급의식 호도', '체제 비판', '혁명적 수사');
                    break;
            }
        }

        // 강성 어조별 추가 수사 장치
        if (profile.useMilitantLanguage || profile.useAggressiveRhetoric) {
            switch (profile.toneIntensity) {
                case 'militant':
                    devices.push('전투적 은유', '투쟁 용어', '비타협적 선언');
                    break;
                case 'aggressive':
                    devices.push('공격적 수사', '위협적 언어', '강압적 논조');
                    break;
                case 'combative':
                    devices.push('전쟁 은유', '절멸적 언어', '도발적 수사', '혁명적 선언');
                    break;
                case 'strong':
                    devices.push('강력한 단언', '확신에 찬 어조', '결연한 의지 표명');
                    break;
                case 'firm':
                    devices.push('단호한 논조', '확고한 입장', '분명한 선언');
                    break;
            }
        }

        return devices;
    }

    /**
     * 글 구조 설계
     */
    private designWritingStructure(profile: PoliticalWritingProfile, _format: string): Record<string, unknown> {
        const style = this.argumentationStyles.get(profile.spectrum);

        return {
            introduction: this.getIntroductionStyle(profile.spectrum),
            bodyStructure: style?.structure || 'balanced',
            evidenceStyle: style?.evidenceType || 'multiple_sources',
            conclusion: style?.conclusionStyle || 'conditional'
        };
    }

    /**
     * 강성 어조 적용
     */
    private applyMilitantTone(text: string, profile: PoliticalWritingProfile): string {
        if (!profile.useMilitantLanguage && !profile.useAggressiveRhetoric) {
            return text;
        }

        let militantText = text;
        const militantVocab = this.militantVocabulary.get(profile.toneIntensity);
        const aggressivePatterns = (this.aggressivePatterns.get(profile.toneIntensity) as string[] | undefined) || [];

        if (militantVocab && aggressivePatterns.length > 0) {
            // 1. 강성 어휘로 교체
            if (profile.useMilitantLanguage) {
                // 일반적인 동사를 강성 동사로 교체
                const verbs = (militantVocab.verbs as string[] | undefined) || [];
                const adjectives = (militantVocab.adjectives as string[] | undefined) || [];
                const adverbs = (militantVocab.adverbs as string[] | undefined) || [];
                militantText = militantText.replace(/제안합니다/g, verbs[0] || '제안합니다');
                militantText = militantText.replace(/생각합니다/g, verbs[1] || '생각합니다');
                militantText = militantText.replace(/요청합니다/g, verbs[2] || '요청합니다');
                militantText = militantText.replace(/중요한/g, adjectives[0] || '중요한');
                militantText = militantText.replace(/필요한/g, adjectives[1] || '필요한');
                militantText = militantText.replace(/좋은/g, adjectives[2] || '좋은');
                militantText = militantText.replace(/분명히/g, adverbs[0] || '분명히');
                militantText = militantText.replace(/확실히/g, adverbs[1] || '확실히');
            }

            // 2. 공격적 수사 패턴 적용
            if (profile.useAggressiveRhetoric && aggressivePatterns.length > 0) {
                // 문장 시작을 강성 패턴으로 교체
                const randomPattern = aggressivePatterns[Math.floor(Math.random() * aggressivePatterns.length)];
                militantText = militantText.replace(/^이 문제에 대해 살펴보면,/, randomPattern);

                // 결론 부분을 강성으로 교체
                if (profile.toneIntensity === 'militant' || profile.toneIntensity === 'aggressive' || profile.toneIntensity === 'combative') {
                    militantText = militantText.replace(/결론적으로,/, '단호하게 선언하건대,');
                    militantText = militantText.replace(/입장을 표명하는 바입니다/, '입장을 강력히 천명합니다');
                }
            }

            // 3. 강도별 추가 수정
            switch (profile.toneIntensity) {
                case 'militant':
                    militantText = militantText.replace(/\./g, '!');
                    militantText = militantText.replace(/해야 합니다/g, '해야만 합니다');
                    militantText = militantText.replace(/필요합니다/g, '반드시 필요합니다');
                    break;
                case 'aggressive':
                    militantText = militantText.replace(/\./g, '!!');
                    militantText = militantText.replace(/반대합니다/g, '단호히 거부합니다');
                    militantText = militantText.replace(/문제가 있습니다/g, '절대 용납할 수 없습니다');
                    break;
                case 'combative':
                    militantText = militantText.replace(/\./g, '!!!');
                    militantText = militantText.replace(/대응해야/g, '전면적으로 맞서야');
                    militantText = militantText.replace(/해결해야/g, '완전히 척결해야');
                    break;
            }
        }

        return militantText;
    }

    /**
     * 본문 생성
     */
    private generateMainText(request: PoliticalWritingRequest, keyArguments: string[], _structure: Record<string, unknown>): string {
        const patterns = this.rhetoricalPatterns.get(request.profile.spectrum) || [];
        const vocabulary = this.politicalVocabulary.get(request.profile.spectrum);

        let text = '';

        // 서론
        text += `${patterns[0] || '이 문제에 대해 살펴보면,'} ${request.topic}에 대한 명확한 입장을 제시하고자 합니다.\n\n`;

        // 본론
        keyArguments.forEach((arg, index) => {
            text += `${index + 1}. ${arg}\n`;

            // 근거 추가
            if (request.profile.useStatistics) {
                text += `   관련 데이터에 따르면, 이러한 접근이 효과적임이 입증되고 있습니다.\n`;
            }

            if (request.profile.useEmotionalAppeal) {
                text += `   이는 우리 모두가 공감할 수 있는 중요한 가치입니다.\n`;
            }

            text += '\n';
        });

        // 결론
        text += `결론적으로, ${request.topic}에 대한 ${this.getStanceDescription(request.profile.stance)} 입장을 `;
        text += `${((vocabulary?.modifiers as string[] | undefined)?.[0]) || '명확히'} 표명하는 바입니다.`;

        return text;
    }

    /**
     * 감정적 톤 조절
     */
    private adjustEmotionalTone(text: string, profile: PoliticalWritingProfile): { adjustedText: string; toneDescription: string } {
        let adjustedText = text;
        let toneDescription = '';

        switch (profile.emotionIntensity) {
            case 'very_passionate':
                adjustedText = text.replace(/\./g, '!').replace(/,/g, ',');
                toneDescription = '매우 열정적이고 감정적인 톤';
                break;
            case 'passionate':
                toneDescription = '열정적이고 확신에 찬 톤';
                break;
            case 'moderate':
                toneDescription = '적당히 감정적이면서 논리적인 톤';
                break;
            case 'calm':
                toneDescription = '차분하고 이성적인 톤';
                break;
            case 'very_calm':
                toneDescription = '매우 차분하고 객관적인 톤';
                break;
            case 'militant':
                adjustedText = adjustedText.replace(/입니다/g, '입니다!');
                adjustedText = adjustedText.replace(/합니다/g, '합니다!');
                toneDescription = '전투적이고 투쟁적인 강성 톤';
                break;
            case 'aggressive':
                adjustedText = adjustedText.replace(/입니다/g, '입니다!!');
                adjustedText = adjustedText.replace(/합니다/g, '합니다!!');
                adjustedText = adjustedText.replace(/것입니다/g, '것입니다!');
                toneDescription = '공격적이고 무자비한 강성 톤';
                break;
        }

        // 강성 톤 추가 조절
        if (profile.toneIntensity === 'combative') {
            adjustedText = adjustedText.replace(/말씀드립니다/g, '선언합니다!!!');
            adjustedText = adjustedText.replace(/생각합니다/g, '확신합니다!!!');
            toneDescription += ' (전면전 수준의 극도로 강성한 어조)';
        } else if (profile.toneIntensity === 'aggressive') {
            adjustedText = adjustedText.replace(/말씀드립니다/g, '단언합니다!!');
            adjustedText = adjustedText.replace(/생각합니다/g, '주장합니다!!');
            toneDescription += ' (공격적이고 위협적인 어조)';
        } else if (profile.toneIntensity === 'militant') {
            adjustedText = adjustedText.replace(/말씀드립니다/g, '천명합니다!');
            adjustedText = adjustedText.replace(/생각합니다/g, '단언합니다!');
            toneDescription += ' (전투적이고 비타협적인 어조)';
        }

        return { adjustedText, toneDescription };
    }

    /**
     * 설득 전략 식별
     */
    private identifyPersuasionStrategies(profile: PoliticalWritingProfile): string[] {
        const strategies: string[] = [];
        const style = this.argumentationStyles.get(profile.spectrum);

        strategies.push(`${style?.emotionalAppeal || '논리적'} 호소`);
        strategies.push(`${style?.evidenceType || '다양한'} 근거 활용`);
        strategies.push(`${style?.logicalStyle || '균형잡힌'} 논리 전개`);

        return strategies;
    }

    /**
     * 반박 논리 구성
     */
    private addressCounterArguments(topic: string, profile: PoliticalWritingProfile): string[] {
        const counterArgs: string[] = [];
        const vocabulary = this.politicalVocabulary.get(profile.spectrum);

        const opposingTerms = vocabulary?.opposingTerms as string[] | undefined;
        if (opposingTerms && opposingTerms[0]) {
            counterArgs.push(`${opposingTerms[0]} 측에서 제기하는 우려사항에 대한 반박`);
            counterArgs.push(`일부에서 제기되는 비판적 시각에 대한 설명`);
            counterArgs.push(`대안적 관점에서 본 ${topic}의 한계점 인정 및 보완책 제시`);
        }

        return counterArgs;
    }

    /**
     * 유틸리티 메서드들
     */
    private getIntroductionStyle(spectrum: PoliticalSpectrum): string {
        const styles: Record<PoliticalSpectrum, string> = {
            'extreme_right': '단호하고 확신에 찬 도입',
            'conservative': '신중하고 점진적인 도입',
            'center_right': '신중하고 점진적인 도입',
            'center': '균형잡히고 객관적인 도입',
            'center_left': '미래지향적이고 희망적인 도입',
            'progressive': '미래지향적이고 희망적인 도입',
            'extreme_left': '비판적이고 변혁적인 도입'
        };
        return styles[spectrum] || '일반적인 도입';
    }

    private getStanceDescription(stance: PoliticalStance): string {
        const descriptions = {
            'strongly_support': '강력한 지지',
            'support': '지지',
            'neutral': '중립적',
            'oppose': '반대',
            'strongly_oppose': '강력한 반대'
        };
        return descriptions[stance];
    }

    private getLanguageStyle(profile: PoliticalWritingProfile): string {
        const formalityMap = {
            'very_formal': '매우 격식적이고 공식적인 문체',
            'formal': '격식적이고 정중한 문체',
            'moderate': '보통 수준의 격식적 문체',
            'informal': '친근하고 편안한 문체',
            'very_informal': '매우 편안하고 구어적인 문체'
        };
        return formalityMap[profile.formalityLevel];
    }

    /**
     * 정치적 성향 추천
     */
    public recommendPoliticalProfile(_topic: string, _userPreferences: Record<string, unknown>): PoliticalWritingProfile {
        // 주제와 사용자 선호에 따른 정치적 성향 추천 로직
        return {
            spectrum: 'center',
            stance: 'neutral',
            emotionIntensity: 'moderate',
            toneIntensity: 'moderate',
            useRhetoric: true,
            useStatistics: true,
            useEmotionalAppeal: false,
            useMilitantLanguage: false,
            useAggressiveRhetoric: false,
            formalityLevel: 'formal'
        };
    }

    /**
     * 강성 글쓰기 프로필 생성
     */
    public createMilitantProfile(
        spectrum: PoliticalSpectrum = 'extreme_right',
        stance: PoliticalStance = 'strongly_support',
        intensity: ToneIntensity = 'militant'
    ): PoliticalWritingProfile {
        return {
            spectrum,
            stance,
            emotionIntensity: intensity === 'combative' ? 'aggressive' : 'militant',
            toneIntensity: intensity,
            useRhetoric: true,
            useStatistics: true,
            useEmotionalAppeal: true,
            useMilitantLanguage: true,
            useAggressiveRhetoric: true,
            formalityLevel: 'formal'
        };
    }

    /**
     * 강성 어조 샘플 생성
     */
    public generateMilitantSamples(): { [key in ToneIntensity]: string } {
        return {
            gentle: '조심스럽게 말씀드리지만, 이 문제에 대해 재고해볼 필요가 있을 것 같습니다.',
            moderate: '분명히 말씀드리면, 이 문제는 신중한 검토가 필요합니다.',
            firm: '단호하게 말하건대, 이 문제는 반드시 해결되어야 합니다.',
            strong: '강력히 주장하는 바는, 이 문제를 더 이상 방치할 수 없다는 것입니다!',
            militant: '투쟁적 자세로 임하여, 이 문제를 반드시 척결해야만 합니다!',
            aggressive: '무자비한 응징으로, 이러한 문제를 완전히 박멸해야 합니다!!',
            combative: '전면전을 선포하며, 이 문제를 절멸시키기 위해 혁명적 변혁을 단행해야 합니다!!!'
        };
    }
}

export const politicalWritingEngine = new PoliticalWritingEngine();
export default politicalWritingEngine;
