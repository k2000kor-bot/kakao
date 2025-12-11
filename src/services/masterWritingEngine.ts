/**
 * CORBU AI 마스터 글쓰기 엔진
 * 정치적 성향, 연령대, 입장, 강성도를 모두 통합한 고도화된 글쓰기 시스템
 */

import { politicalWritingEngine, PoliticalWritingProfile, PoliticalSpectrum, PoliticalStance, EmotionIntensity, ToneIntensity } from './politicalWritingEngine';
import { generationWritingEngine, GenerationWritingProfile, AgeGroup, GenerationStyle, CommunicationPattern } from './generationWritingEngine';
import { stanceWritingEngine, StanceWritingProfile, StancePosition, ArgumentStyle, PersuasionStrategy } from './stanceWritingEngine';

export interface MasterWritingProfile {
    // 정치적 성향
    politicalSpectrum: PoliticalSpectrum;
    politicalStance: PoliticalStance;

    // 연령대 특성
    ageGroup: AgeGroup;
    generationStyle: GenerationStyle;

    // 입장 및 논조
    stancePosition: StancePosition;
    argumentStyle: ArgumentStyle;

    // 강성도 및 톤
    emotionIntensity: EmotionIntensity;
    toneIntensity: ToneIntensity;
    strengthLevel: 'mild' | 'moderate' | 'strong' | 'passionate' | 'extreme';

    // 글쓰기 스타일
    formalityLevel: 'very_formal' | 'formal' | 'moderate' | 'informal' | 'very_informal';
    useHonorific: boolean;
    useMilitantLanguage: boolean;
    useAggressiveRhetoric: boolean;

    // 내용 구성
    includePersonalExperience: boolean;
    includeCounterArguments: boolean;
    includeEvidence: boolean;
    useTraditionalExpressions: boolean;
    showAuthorityTone: boolean;
}

export interface MasterWritingRequest {
    topic: string;
    originalText?: string;
    profile: MasterWritingProfile;
    targetLength: number;
    outputFormat: 'essay' | 'opinion' | 'rebuttal' | 'support' | 'analysis' | 'critique';
    tone: 'formal' | 'informal' | 'academic' | 'conversational' | 'passionate';
    targetAudience: 'general' | 'experts' | 'opponents' | 'supporters' | 'younger' | 'older';
    purpose: 'persuade' | 'inform' | 'criticize' | 'support' | 'educate' | 'provoke';
}

export interface MasterWritingResponse {
    generatedText: string;
    analysisReport: {
        politicalCharacteristics: string[];
        generationalCharacteristics: string[];
        stanceCharacteristics: string[];
        strengthAnalysis: string;
        languageFeatures: string[];
        rhetoricalDevices: string[];
        persuasionElements: string[];
    };
    styleMetrics: {
        formalityScore: number;
        aggressivenessScore: number;
        persuasivenessScore: number;
        authorityScore: number;
        emotionalIntensityScore: number;
    };
    recommendations: string[];
}

export type WritingTemplate =
    | 'extreme_right_elderly_militant'
    | 'progressive_young_passionate'
    | 'conservative_middle_firm'
    | 'centrist_mature_balanced'
    | 'militant_opposition_combative'
    | 'gentle_support_respectful'
    | 'academic_neutral_formal'
    | 'populist_emotional_aggressive';

class MasterWritingEngine {
    private predefinedTemplates: Map<WritingTemplate, MasterWritingProfile>;

    constructor() {
        this.predefinedTemplates = new Map();
        this.initializePredefinedTemplates();
    }

    /**
     * 사전 정의된 글쓰기 템플릿 초기화
     */
    private initializePredefinedTemplates(): void {
        this.predefinedTemplates = new Map([
            ['extreme_right_elderly_militant', {
                politicalSpectrum: 'extreme_right',
                politicalStance: 'strongly_support',
                ageGroup: '70s',
                generationStyle: 'strict_mentor',
                stancePosition: 'strongly_support',
                argumentStyle: 'ethical',
                emotionIntensity: 'militant',
                toneIntensity: 'combative',
                strengthLevel: 'extreme',
                formalityLevel: 'very_formal',
                useHonorific: true,
                useMilitantLanguage: true,
                useAggressiveRhetoric: true,
                includePersonalExperience: true,
                includeCounterArguments: true,
                includeEvidence: true,
                useTraditionalExpressions: true,
                showAuthorityTone: true
            }],
            ['progressive_young_passionate', {
                politicalSpectrum: 'progressive',
                politicalStance: 'strongly_support',
                ageGroup: '30s',
                generationStyle: 'formal_traditional',
                stancePosition: 'strongly_support',
                argumentStyle: 'idealistic',
                emotionIntensity: 'very_passionate',
                toneIntensity: 'firm',
                strengthLevel: 'passionate',
                formalityLevel: 'moderate',
                useHonorific: false,
                useMilitantLanguage: false,
                useAggressiveRhetoric: false,
                includePersonalExperience: true,
                includeCounterArguments: true,
                includeEvidence: true,
                useTraditionalExpressions: false,
                showAuthorityTone: false
            }],
            ['conservative_middle_firm', {
                politicalSpectrum: 'conservative',
                politicalStance: 'support',
                ageGroup: '50s',
                generationStyle: 'authoritative_experienced',
                stancePosition: 'support',
                argumentStyle: 'practical',
                emotionIntensity: 'moderate',
                toneIntensity: 'firm',
                strengthLevel: 'strong',
                formalityLevel: 'formal',
                useHonorific: true,
                useMilitantLanguage: false,
                useAggressiveRhetoric: false,
                includePersonalExperience: true,
                includeCounterArguments: true,
                includeEvidence: true,
                useTraditionalExpressions: true,
                showAuthorityTone: true
            }],
            ['centrist_mature_balanced', {
                politicalSpectrum: 'center',
                politicalStance: 'neutral',
                ageGroup: '60s',
                generationStyle: 'wise_elder',
                stancePosition: 'neutral',
                argumentStyle: 'logical',
                emotionIntensity: 'calm',
                toneIntensity: 'moderate',
                strengthLevel: 'moderate',
                formalityLevel: 'formal',
                useHonorific: true,
                useMilitantLanguage: false,
                useAggressiveRhetoric: false,
                includePersonalExperience: true,
                includeCounterArguments: true,
                includeEvidence: true,
                useTraditionalExpressions: true,
                showAuthorityTone: false
            }],
            ['militant_opposition_combative', {
                politicalSpectrum: 'extreme_left',
                politicalStance: 'strongly_oppose',
                ageGroup: '40s',
                generationStyle: 'authoritative_experienced',
                stancePosition: 'strongly_oppose',
                argumentStyle: 'emotional',
                emotionIntensity: 'aggressive',
                toneIntensity: 'combative',
                strengthLevel: 'extreme',
                formalityLevel: 'formal',
                useHonorific: false,
                useMilitantLanguage: true,
                useAggressiveRhetoric: true,
                includePersonalExperience: true,
                includeCounterArguments: true,
                includeEvidence: true,
                useTraditionalExpressions: false,
                showAuthorityTone: true
            }],
            ['gentle_support_respectful', {
                politicalSpectrum: 'center_right',
                politicalStance: 'support',
                ageGroup: '60s',
                generationStyle: 'respectful_conservative',
                stancePosition: 'conditional_support',
                argumentStyle: 'ethical',
                emotionIntensity: 'calm',
                toneIntensity: 'gentle',
                strengthLevel: 'mild',
                formalityLevel: 'very_formal',
                useHonorific: true,
                useMilitantLanguage: false,
                useAggressiveRhetoric: false,
                includePersonalExperience: true,
                includeCounterArguments: false,
                includeEvidence: true,
                useTraditionalExpressions: true,
                showAuthorityTone: false
            }],
            ['academic_neutral_formal', {
                politicalSpectrum: 'center',
                politicalStance: 'neutral',
                ageGroup: '50s',
                generationStyle: 'formal_traditional',
                stancePosition: 'neutral',
                argumentStyle: 'evidence_based',
                emotionIntensity: 'very_calm',
                toneIntensity: 'moderate',
                strengthLevel: 'moderate',
                formalityLevel: 'very_formal',
                useHonorific: true,
                useMilitantLanguage: false,
                useAggressiveRhetoric: false,
                includePersonalExperience: false,
                includeCounterArguments: true,
                includeEvidence: true,
                useTraditionalExpressions: false,
                showAuthorityTone: false
            }],
            ['populist_emotional_aggressive', {
                politicalSpectrum: 'extreme_right',
                politicalStance: 'strongly_support',
                ageGroup: '50s',
                generationStyle: 'authoritative_experienced',
                stancePosition: 'strongly_support',
                argumentStyle: 'emotional',
                emotionIntensity: 'very_passionate',
                toneIntensity: 'aggressive',
                strengthLevel: 'extreme',
                formalityLevel: 'informal',
                useHonorific: false,
                useMilitantLanguage: true,
                useAggressiveRhetoric: true,
                includePersonalExperience: true,
                includeCounterArguments: true,
                includeEvidence: false,
                useTraditionalExpressions: false,
                showAuthorityTone: true
            }]
        ]);
    }

    /**
     * 마스터 글쓰기 생성
     */
    public async generateMasterWriting(request: MasterWritingRequest): Promise<MasterWritingResponse> {
        try {
            // 1. 개별 엔진별 프로필 생성
            const politicalProfile = this.createPoliticalProfile(request.profile);
            const generationProfile = this.createGenerationProfile(request.profile);
            const stanceProfile = this.createStanceProfile(request.profile);

            // 2. 각 엔진에서 텍스트 생성
            const politicalResult = await politicalWritingEngine.generatePoliticalWriting({
                topic: request.topic,
                originalText: request.originalText,
                profile: politicalProfile,
                targetLength: request.targetLength,
                includeReferences: request.profile.includeEvidence,
                outputFormat: request.outputFormat as "analysis" | "opinion" | "rebuttal" | "essay" | "support"
            });

            const generationResult = await generationWritingEngine.generateGenerationWriting({
                topic: request.topic,
                originalText: request.originalText,
                profile: generationProfile,
                targetAudience: this.mapAudienceToAgeGroup(request.targetAudience),
                purposeType: this.mapPurposeToGenerationType(request.purpose),
                targetLength: request.targetLength,
                includePersonalExperience: request.profile.includePersonalExperience
            });

            const stanceResult = await stanceWritingEngine.generateStanceWriting({
                topic: request.topic,
                originalText: request.originalText,
                profile: stanceProfile,
                targetLength: request.targetLength,
                requiredSections: ['introduction', 'main_argument', 'evidence', 'conclusion'],
                tone: request.tone,
                includeCallToAction: request.purpose === 'persuade'
            });

            // 3. 결과 통합 및 조화
            const integratedText = this.integrateWritingResults(
                request,
                politicalResult.generatedText,
                generationResult.generatedText,
                stanceResult.generatedText
            );

            // 4. 분석 리포트 생성
            const analysisReport = this.generateAnalysisReport(
                politicalResult,
                generationResult,
                stanceResult,
                request.profile
            );

            // 5. 스타일 메트릭 계산
            const styleMetrics = this.calculateStyleMetrics(request.profile, integratedText);

            // 6. 개선 추천사항 생성
            const recommendations = this.generateRecommendations(request.profile, styleMetrics);

            return {
                generatedText: integratedText,
                analysisReport,
                styleMetrics,
                recommendations
            };

        } catch (error) {
            console.error('마스터 글쓰기 생성 실패:', error);
            throw new Error('마스터 글쓰기 생성에 실패했습니다.');
        }
    }

    /**
     * 정치적 글쓰기 프로필 생성
     */
    private createPoliticalProfile(masterProfile: MasterWritingProfile): PoliticalWritingProfile {
        return {
            spectrum: masterProfile.politicalSpectrum,
            stance: masterProfile.politicalStance,
            emotionIntensity: masterProfile.emotionIntensity,
            toneIntensity: masterProfile.toneIntensity,
            useRhetoric: true,
            useStatistics: masterProfile.includeEvidence,
            useEmotionalAppeal: masterProfile.emotionIntensity !== 'very_calm',
            useMilitantLanguage: masterProfile.useMilitantLanguage,
            useAggressiveRhetoric: masterProfile.useAggressiveRhetoric,
            formalityLevel: masterProfile.formalityLevel
        };
    }

    /**
     * 세대별 글쓰기 프로필 생성
     */
    private createGenerationProfile(masterProfile: MasterWritingProfile): GenerationWritingProfile {
        return {
            ageGroup: masterProfile.ageGroup,
            generationStyle: masterProfile.generationStyle,
            communicationPattern: this.mapToCommPattern(masterProfile),
            languageFormality: this.mapFormalityLevel(masterProfile.formalityLevel),
            useHonorific: masterProfile.useHonorific,
            useTraditionalExpressions: masterProfile.useTraditionalExpressions,
            useGenerationalReferences: true,
            includeLifeExperience: masterProfile.includePersonalExperience,
            showAuthorityTone: masterProfile.showAuthorityTone
        };
    }

    /**
     * 입장별 글쓰기 프로필 생성
     */
    private createStanceProfile(masterProfile: MasterWritingProfile): StanceWritingProfile {
        return {
            position: masterProfile.stancePosition,
            argumentStyle: masterProfile.argumentStyle,
            persuasionStrategy: this.selectPersuasionStrategies(masterProfile),
            rhetoricalTechniques: this.selectRhetoricalTechniques(masterProfile),
            strengthLevel: masterProfile.strengthLevel,
            includeCounterArguments: masterProfile.includeCounterArguments,
            includeEvidence: masterProfile.includeEvidence,
            includePersonalExperience: masterProfile.includePersonalExperience,
            targetAudience: 'general'
        };
    }

    /**
     * 글쓰기 결과 통합
     */
    private integrateWritingResults(
        request: MasterWritingRequest,
        politicalText: string,
        generationText: string,
        stanceText: string
    ): string {
        // 각 엔진의 장점을 취합하여 통합된 텍스트 생성

        // 1. 기본 구조는 입장별 글쓰기에서 가져옴
        let baseText = stanceText;

        // 2. 정치적 성향의 특징적 표현들을 추가
        baseText = this.injectPoliticalElements(baseText, politicalText, request.profile);

        // 3. 세대별 특징적 표현들을 추가
        baseText = this.injectGenerationalElements(baseText, generationText, request.profile);

        // 4. 강성도에 따른 어조 조정
        baseText = this.adjustToneIntensity(baseText, request.profile);

        // 5. 최종 품질 개선
        baseText = this.finalizeIntegration(baseText, request);

        return baseText;
    }

    /**
     * 정치적 요소 주입
     */
    private injectPoliticalElements(baseText: string, politicalText: string, profile: MasterWritingProfile): string {
        let enhanced = baseText;

        // 정치적 어휘 강화
        if (profile.politicalSpectrum === 'extreme_right') {
            enhanced = enhanced.replace(/국가/g, '우리 국가');
            enhanced = enhanced.replace(/전통/g, '소중한 전통');
        } else if (profile.politicalSpectrum === 'progressive') {
            enhanced = enhanced.replace(/사회/g, '정의로운 사회');
            enhanced = enhanced.replace(/변화/g, '진보적 변화');
        }

        // 정치적 수사 패턴 추가
        if (profile.useMilitantLanguage) {
            enhanced = enhanced.replace(/해야 합니다/g, '반드시 해야 합니다');
            enhanced = enhanced.replace(/중요합니다/g, '매우 중요합니다');
        }

        return enhanced;
    }

    /**
     * 세대별 요소 주입
     */
    private injectGenerationalElements(baseText: string, generationText: string, profile: MasterWritingProfile): string {
        let enhanced = baseText;

        // 연령대별 특징적 표현 추가
        if (profile.ageGroup === '70s' || profile.ageGroup === '80s_plus') {
            enhanced = enhanced.replace(/생각합니다/g, '생각합니다');
            if (profile.useTraditionalExpressions) {
                enhanced = enhanced.replace(/말씀드리면/g, '연로한 입장에서 말씀드리면');
            }
        }

        // 높임말 적용
        if (profile.useHonorific && !enhanced.includes('습니다')) {
            enhanced = enhanced.replace(/합니다/g, '습니다');
            enhanced = enhanced.replace(/입니다/g, '입니다');
        }

        return enhanced;
    }

    /**
     * 어조 강도 조정
     */
    private adjustToneIntensity(text: string, profile: MasterWritingProfile): string {
        let adjusted = text;

        switch (profile.toneIntensity) {
            case 'combative':
                adjusted = adjusted.replace(/\./g, '!!!');
                adjusted = adjusted.replace(/반대합니다/g, '단호히 거부합니다');
                adjusted = adjusted.replace(/지지합니다/g, '열렬히 지지합니다');
                break;
            case 'aggressive':
                adjusted = adjusted.replace(/\./g, '!!');
                adjusted = adjusted.replace(/문제입니다/g, '심각한 문제입니다');
                break;
            case 'militant':
                adjusted = adjusted.replace(/해야 합니다/g, '반드시 해야 합니다');
                adjusted = adjusted.replace(/필요합니다/g, '절실히 필요합니다');
                break;
            case 'gentle':
                adjusted = adjusted.replace(/반대합니다/g, '우려를 표합니다');
                adjusted = adjusted.replace(/문제입니다/g, '고려해볼 점이 있습니다');
                break;
        }

        return adjusted;
    }

    /**
     * 최종 통합 완성
     */
    private finalizeIntegration(text: string, request: MasterWritingRequest): string {
        let finalized = text;

        // 목적에 따른 마무리 조정
        if (request.purpose === 'persuade') {
            finalized += '\n\n이에 대한 여러분의 적극적인 관심과 참여를 촉구합니다.';
        } else if (request.purpose === 'provoke') {
            finalized += '\n\n이 문제에 대해 깊이 있는 성찰이 필요한 시점입니다.';
        }

        // 대상 독자에 따른 조정
        if (request.targetAudience === 'experts') {
            finalized = finalized.replace(/쉽게 말하면/g, '전문적으로 분석하면');
        } else if (request.targetAudience === 'general') {
            finalized = finalized.replace(/전문적으로/g, '이해하기 쉽게');
        }

        return finalized;
    }

    /**
     * 분석 리포트 생성
     */
    private generateAnalysisReport(
        politicalResult: any,
        generationResult: any,
        stanceResult: any,
        profile: MasterWritingProfile
    ): any {
        return {
            politicalCharacteristics: politicalResult.keyArguments || [],
            generationalCharacteristics: generationResult.generationalCharacteristics || [],
            stanceCharacteristics: stanceResult.stanceIndicators || [],
            strengthAnalysis: `${profile.strengthLevel} 강도의 ${profile.toneIntensity} 어조`,
            languageFeatures: [
                `${profile.formalityLevel} 격식 수준`,
                `${profile.ageGroup} 세대 특성`,
                `${profile.politicalSpectrum} 성향 반영`
            ],
            rhetoricalDevices: stanceResult.rhetoricalDevices || [],
            persuasionElements: stanceResult.persuasionElements || []
        };
    }

    /**
     * 스타일 메트릭 계산
     */
    private calculateStyleMetrics(profile: MasterWritingProfile, text: string): any {
        // 텍스트 분석을 통한 점수 계산
        const formalityScore = this.calculateFormalityScore(profile, text);
        const aggressivenessScore = this.calculateAggressivenessScore(profile, text);
        const persuasivenessScore = this.calculatePersuasivenessScore(profile, text);
        const authorityScore = this.calculateAuthorityScore(profile, text);
        const emotionalIntensityScore = this.calculateEmotionalIntensityScore(profile, text);

        return {
            formalityScore,
            aggressivenessScore,
            persuasivenessScore,
            authorityScore,
            emotionalIntensityScore
        };
    }

    /**
     * 개별 메트릭 계산 메서드들
     */
    private calculateFormalityScore(profile: MasterWritingProfile, text: string): number {
        let score = 50; // 기본 점수

        // 격식 수준에 따른 점수
        const formalityMap = {
            'very_formal': 90,
            'formal': 70,
            'moderate': 50,
            'informal': 30,
            'very_informal': 10
        };
        score = formalityMap[profile.formalityLevel];

        // 높임말 사용 여부
        if (profile.useHonorific) score += 10;

        // 전통적 표현 사용 여부
        if (profile.useTraditionalExpressions) score += 10;

        return Math.min(100, score);
    }

    private calculateAggressivenessScore(profile: MasterWritingProfile, text: string): number {
        let score = 0;

        // 어조 강도에 따른 점수
        const intensityMap = {
            'gentle': 10,
            'moderate': 30,
            'firm': 50,
            'strong': 70,
            'militant': 85,
            'aggressive': 95,
            'combative': 100
        };
        score = intensityMap[profile.toneIntensity];

        // 공격적 수사 사용 여부
        if (profile.useAggressiveRhetoric) score += 10;

        // 강성 언어 사용 여부
        if (profile.useMilitantLanguage) score += 10;

        return Math.min(100, score);
    }

    private calculatePersuasivenessScore(profile: MasterWritingProfile, text: string): number {
        let score = 50;

        // 증거 포함 여부
        if (profile.includeEvidence) score += 20;

        // 반박 논리 포함 여부
        if (profile.includeCounterArguments) score += 15;

        // 개인 경험 포함 여부
        if (profile.includePersonalExperience) score += 10;

        // 강도에 따른 조정
        if (profile.strengthLevel === 'passionate' || profile.strengthLevel === 'extreme') {
            score += 15;
        }

        return Math.min(100, score);
    }

    private calculateAuthorityScore(profile: MasterWritingProfile, text: string): number {
        let score = 30;

        // 연령대에 따른 권위
        const ageAuthorityMap = {
            '20s': 20,
            '30s': 30,
            '40s': 50,
            '50s': 70,
            '60s': 85,
            '70s': 95,
            '80s_plus': 100
        };
        score = ageAuthorityMap[profile.ageGroup];

        // 권위적 톤 사용 여부
        if (profile.showAuthorityTone) score += 10;

        // 전통적 표현 사용 여부
        if (profile.useTraditionalExpressions) score += 5;

        return Math.min(100, score);
    }

    private calculateEmotionalIntensityScore(profile: MasterWritingProfile, text: string): number {
        const intensityMap = {
            'very_calm': 10,
            'calm': 25,
            'moderate': 50,
            'passionate': 75,
            'very_passionate': 90,
            'militant': 95,
            'aggressive': 100
        };
        return intensityMap[profile.emotionIntensity];
    }

    /**
     * 개선 추천사항 생성
     */
    private generateRecommendations(profile: MasterWritingProfile, metrics: any): string[] {
        const recommendations: string[] = [];

        if (metrics.formalityScore < 50) {
            recommendations.push('전문가 대상이므로 더 격식적인 표현을 사용하는 것이 좋겠습니다.');
        }

        if (metrics.aggressivenessScore > 80) {
            recommendations.push('일반 대중 대상이므로 어조를 다소 완화하는 것을 고려해보세요.');
        }

        if (metrics.persuasivenessScore < 60) {
            recommendations.push('설득력 향상을 위해 구체적 증거나 사례를 추가하는 것이 좋겠습니다.');
        }

        if (metrics.authorityScore < 40 && profile.showAuthorityTone) {
            recommendations.push('권위적 어조를 위해 경험이나 전문성을 더 강조해보세요.');
        }

        return recommendations;
    }

    /**
     * 유틸리티 메서드들
     */
    private mapToCommPattern(profile: MasterWritingProfile): CommunicationPattern {
        if (profile.showAuthorityTone) return 'authoritative';
        if (profile.toneIntensity === 'combative' || profile.toneIntensity === 'aggressive') return 'commanding';
        if (profile.generationStyle === 'wise_elder') return 'mentoring';
        if (profile.useHonorific) return 'respectful';
        return 'hierarchical';
    }

    private mapFormalityLevel(level: string): any {
        const mapping = {
            'very_formal': 'very_formal',
            'formal': 'formal',
            'moderate': 'semi_formal',
            'informal': 'casual',
            'very_informal': 'intimate'
        };
        return (mapping as any)[level] || 'formal';
    }

    private mapAudienceToAgeGroup(audience: string): AgeGroup {
        const mapping = {
            'younger': '30s',
            'older': '60s',
            'general': '50s',
            'experts': '50s',
            'opponents': '50s',
            'supporters': '50s'
        };
        return ((mapping as any)[audience] as AgeGroup) || '50s';
    }

    private mapPurposeToGenerationType(purpose: string): any {
        const mapping = {
            'persuade': 'advice',
            'inform': 'explanation',
            'criticize': 'criticism',
            'support': 'support',
            'educate': 'explanation',
            'provoke': 'opinion'
        };
        return (mapping as any)[purpose] || 'opinion';
    }

    private selectPersuasionStrategies(profile: MasterWritingProfile): PersuasionStrategy[] {
        const strategies: PersuasionStrategy[] = [];

        if (profile.includeEvidence) strategies.push('facts_and_data');
        if (profile.emotionIntensity !== 'very_calm') strategies.push('emotional_appeal');
        if (profile.showAuthorityTone) strategies.push('authority_citation');
        if (profile.includeCounterArguments) strategies.push('pros_cons');

        return strategies.length > 0 ? strategies : ['facts_and_data'];
    }

    private selectRhetoricalTechniques(profile: MasterWritingProfile): any[] {
        const techniques: any[] = [];

        if (profile.strengthLevel === 'extreme' || profile.strengthLevel === 'passionate') {
            techniques.push('repetition', 'climax');
        }
        if (profile.includeCounterArguments) {
            techniques.push('contrast', 'antithesis');
        }
        if (profile.argumentStyle === 'logical') {
            techniques.push('enumeration');
        }

        return techniques.length > 0 ? techniques : ['enumeration'];
    }

    /**
     * 템플릿 기반 글쓰기
     */
    public async generateFromTemplate(
        template: WritingTemplate,
        topic: string,
        customizations?: Partial<MasterWritingProfile>
    ): Promise<MasterWritingResponse> {
        const baseProfile = this.predefinedTemplates.get(template);
        if (!baseProfile) {
            throw new Error(`Unknown template: ${template}`);
        }

        const finalProfile = { ...baseProfile, ...customizations };

        return this.generateMasterWriting({
            topic,
            profile: finalProfile,
            targetLength: 500,
            outputFormat: 'opinion',
            tone: 'formal',
            targetAudience: 'general',
            purpose: 'persuade'
        });
    }

    /**
     * 빠른 글쓰기 (간편 인터페이스)
     */
    public async quickWrite(
        topic: string,
        options: {
            stance: 'support' | 'oppose' | 'neutral';
            tone: 'gentle' | 'firm' | 'aggressive';
            age: '50s' | '60s' | '70s';
            political: 'conservative' | 'progressive' | 'center';
        }
    ): Promise<string> {
        const profile: MasterWritingProfile = {
            politicalSpectrum: options.political === 'conservative' ? 'conservative' :
                options.political === 'progressive' ? 'progressive' : 'center',
            politicalStance: options.stance === 'support' ? 'support' :
                options.stance === 'oppose' ? 'oppose' : 'neutral',
            ageGroup: options.age,
            generationStyle: 'formal_traditional',
            stancePosition: options.stance === 'support' ? 'support' :
                options.stance === 'oppose' ? 'oppose' : 'neutral',
            argumentStyle: 'logical',
            emotionIntensity: 'moderate',
            toneIntensity: options.tone === 'gentle' ? 'gentle' :
                options.tone === 'firm' ? 'firm' : 'aggressive',
            strengthLevel: 'moderate',
            formalityLevel: 'formal',
            useHonorific: true,
            useMilitantLanguage: options.tone === 'aggressive',
            useAggressiveRhetoric: options.tone === 'aggressive',
            includePersonalExperience: true,
            includeCounterArguments: true,
            includeEvidence: true,
            useTraditionalExpressions: true,
            showAuthorityTone: options.age !== '50s'
        };

        const result = await this.generateMasterWriting({
            topic,
            profile,
            targetLength: 300,
            outputFormat: 'opinion',
            tone: 'formal',
            targetAudience: 'general',
            purpose: 'persuade'
        });

        return result.generatedText;
    }

    /**
     * 사용 가능한 템플릿 목록 반환
     */
    public getAvailableTemplates(): WritingTemplate[] {
        return Array.from(this.predefinedTemplates.keys());
    }

    /**
     * 템플릿 설명 반환
     */
    public getTemplateDescription(template: WritingTemplate): string {
        const descriptions = {
            'extreme_right_elderly_militant': '극우 성향의 고령자가 강성한 어조로 쓰는 글',
            'progressive_young_passionate': '진보 성향의 젊은 층이 열정적으로 쓰는 글',
            'conservative_middle_firm': '보수 성향의 중년층이 단호하게 쓰는 글',
            'centrist_mature_balanced': '중도 성향의 성숙한 어른이 균형있게 쓰는 글',
            'militant_opposition_combative': '강성 반대파가 전투적으로 쓰는 글',
            'gentle_support_respectful': '온건한 지지자가 정중하게 쓰는 글',
            'academic_neutral_formal': '학술적이고 중립적인 격식있는 글',
            'populist_emotional_aggressive': '포퓰리즘적 감정 호소형 공격적 글'
        };
        return descriptions[template] || '설명 없음';
    }
}

const masterWritingEngine = new MasterWritingEngine();
export default masterWritingEngine;
export { MasterWritingEngine };
