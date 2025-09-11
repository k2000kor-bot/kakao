/**
 * CORBU AI 고도화된 논리 및 어조 분석 엔진
 * 텍스트의 논리적 구조, 추론 패턴, 어조 변화, 감정 흐름을 정밀 분석하여
 * 동일한 논리 체계와 어조로 새로운 주제의 글을 생성할 수 있는 시스템
 */

export interface LogicalStructure {
  // 논리적 구성 요소
  argumentType: 'deductive' | 'inductive' | 'abductive' | 'analogical' | 'causal' | 'comparative';
  premisePatterns: string[];
  conclusionPatterns: string[];
  evidenceTypes: ('empirical' | 'theoretical' | 'anecdotal' | 'statistical' | 'authoritative' | 'logical')[];

  // 논증 기법
  persuasionStrategy: ('logos' | 'ethos' | 'pathos')[];
  fallacyPatterns: string[];
  strengthOfClaims: 'weak' | 'moderate' | 'strong' | 'absolute';

  // 반박 및 대안 제시
  counterargumentStyle: 'none' | 'acknowledgment' | 'refutation' | 'synthesis';
  alternativeHandling: 'ignore' | 'dismiss' | 'consider' | 'integrate';

  // 논리적 연결
  causalChains: CausalChain[];
  logicalConnectors: LogicalConnector[];
  inferencePatterns: InferencePattern[];
}

export interface CausalChain {
  cause: string;
  effect: string;
  strength: 'weak' | 'moderate' | 'strong';
  certainty: 'possible' | 'probable' | 'certain';
  intermediateSteps: string[];
}

export interface LogicalConnector {
  type: 'therefore' | 'however' | 'moreover' | 'nevertheless' | 'consequently' | 'similarly';
  frequency: number;
  position: 'beginning' | 'middle' | 'end';
  contextPattern: string;
}

export interface InferencePattern {
  type: 'if_then' | 'cause_effect' | 'comparison' | 'analogy' | 'generalization';
  template: string;
  confidence: number;
  usage_frequency: number;
}

export interface TonalProgression {
  // 어조 변화 패턴
  openingTone: ToneProfile;
  developmentTone: ToneProfile;
  climaxTone: ToneProfile;
  conclusionTone: ToneProfile;

  // 감정적 흐름
  emotionalArc: EmotionalPoint[];
  intensityProgression: IntensityPoint[];

  // 어조 일관성
  toneConsistency: number;
  toneShifts: ToneShift[];
}

export interface ToneProfile {
  formality: number; // 0-100
  confidence: number; // 0-100
  urgency: number; // 0-100
  empathy: number; // 0-100
  authority: number; // 0-100
  objectivity: number; // 0-100
  creativity: number; // 0-100
  humor: number; // 0-100
}

export interface EmotionalPoint {
  position: number; // 텍스트 내 위치 (0-1)
  emotion: 'joy' | 'anger' | 'sadness' | 'fear' | 'surprise' | 'disgust' | 'neutral';
  intensity: number; // 0-100
  trigger: string; // 감정을 유발한 텍스트
}

export interface IntensityPoint {
  position: number;
  intensity: number;
  reason: string;
}

export interface ToneShift {
  position: number;
  fromTone: Partial<ToneProfile>;
  toTone: Partial<ToneProfile>;
  trigger: string;
  purpose: string;
}

export interface ArgumentativeFramework {
  // 논증 구조
  claimStructure: 'single_main' | 'multiple_parallel' | 'hierarchical' | 'circular';
  evidenceIntegration: 'front_loaded' | 'distributed' | 'end_heavy' | 'spiral';

  // 독자와의 관계
  audienceEngagement: 'direct_address' | 'rhetorical_questions' | 'shared_assumptions' | 'challenge';
  perspectiveTaking: 'first_person' | 'second_person' | 'third_person' | 'mixed' | 'universal';

  // 논리적 발전
  ideaDevelopment: 'linear' | 'spiral' | 'dialectical' | 'layered' | 'mosaic';
  transitionStyle: 'smooth' | 'abrupt' | 'signposted' | 'implicit';

  // 수사적 전략
  rhetoricalQuestions: RhetoricalQuestion[];
  metaphoricalFramework: MetaphorPattern[];
  repetitionStrategy: RepetitionStrategy;
}

export interface RhetoricalQuestion {
  question: string;
  purpose: 'engagement' | 'emphasis' | 'transition' | 'challenge';
  position: number;
  expectedAnswer: 'obvious' | 'complex' | 'none';
}

export interface MetaphorPattern {
  sourcedomain: string;
  targetDomain: string;
  mappingStrength: number;
  frequency: number;
  function: 'explanation' | 'persuasion' | 'emotional_impact' | 'memorability';
}

export interface RepetitionStrategy {
  keyPhrases: string[];
  repetitionType: 'exact' | 'synonymous' | 'structural' | 'thematic';
  frequency: number;
  function: 'emphasis' | 'rhythm' | 'memory_aid' | 'persuasion';
}

export interface AdvancedStyleProfile {
  // 기본 스타일 정보
  basicStyle: any; // StyleProfile from previous engine

  // 논리적 구조
  logicalStructure: LogicalStructure;

  // 어조 진행
  tonalProgression: TonalProgression;

  // 논증 프레임워크
  argumentativeFramework: ArgumentativeFramework;

  // 언어학적 특징
  linguisticSignature: LinguisticSignature;

  // 인지적 패턴
  cognitivePatterns: CognitivePattern[];
}

export interface LinguisticSignature {
  // 어휘 선택 패턴
  vocabularyPreferences: VocabularyPreference[];

  // 문법적 특징
  syntacticPatterns: SyntacticPattern[];

  // 구두점 사용 패턴
  punctuationStyle: PunctuationStyle;

  // 문체적 특징
  stylisticMarkers: StylisticMarker[];
}

export interface VocabularyPreference {
  category: string;
  preferredTerms: string[];
  avoidedTerms: string[];
  registerLevel: 'formal' | 'neutral' | 'informal';
  connotation: 'positive' | 'negative' | 'neutral';
}

export interface SyntacticPattern {
  pattern: string;
  frequency: number;
  function: string;
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface PunctuationStyle {
  commaUsage: 'minimal' | 'standard' | 'liberal';
  semicolonFrequency: number;
  dashUsage: 'none' | 'occasional' | 'frequent';
  parentheticalStyle: 'none' | 'minimal' | 'moderate' | 'frequent';
  exclamationPattern: ExclamationPattern;
}

export interface ExclamationPattern {
  frequency: number;
  contexts: string[];
  intensity: 'mild' | 'moderate' | 'strong';
}

export interface StylisticMarker {
  marker: string;
  type: 'lexical' | 'syntactic' | 'phonetic' | 'semantic';
  frequency: number;
  function: string;
}

export interface CognitivePattern {
  type: 'analytical' | 'intuitive' | 'systematic' | 'creative' | 'critical';
  strength: number;
  manifestations: string[];
  triggers: string[];
}

class AdvancedLogicAnalysisEngine {
  private logicalConnectorMap: Map<string, string> = new Map();
  private emotionKeywords: Map<string, { emotion: string; intensity: number }> = new Map();
  private rhetoricalPatterns: Map<string, RegExp> = new Map();

  constructor() {
    this.initializeLogicalConnectors();
    this.initializeEmotionKeywords();
    this.initializeRhetoricalPatterns();
  }

  /**
   * 고도화된 논리 및 어조 분석
   */
  public async analyzeAdvancedStyle(text: string): Promise<AdvancedStyleProfile> {
    try {
      // 1. 논리적 구조 분석
      const logicalStructure = await this.analyzeLogicalStructure(text);

      // 2. 어조 진행 분석
      const tonalProgression = await this.analyzeTonalProgression(text);

      // 3. 논증 프레임워크 분석
      const argumentativeFramework = await this.analyzeArgumentativeFramework(text);

      // 4. 언어학적 시그니처 분석
      const linguisticSignature = await this.analyzeLinguisticSignature(text);

      // 5. 인지적 패턴 분석
      const cognitivePatterns = await this.analyzeCognitivePatterns(text);

      return {
        basicStyle: null, // Will be filled by styleAnalysisEngine
        logicalStructure,
        tonalProgression,
        argumentativeFramework,
        linguisticSignature,
        cognitivePatterns
      };

    } catch (error) {
      console.error('고도화된 스타일 분석 실패:', error);
      throw new Error('고도화된 스타일 분석에 실패했습니다.');
    }
  }

  /**
   * 논리적 구조 분석
   */
  private async analyzeLogicalStructure(text: string): Promise<LogicalStructure> {
    // 1. 논증 유형 판별
    const argumentType = this.identifyArgumentType(text);

    // 2. 전제 패턴 추출
    const premisePatterns = this.extractPremisePatterns(text);

    // 3. 결론 패턴 추출
    const conclusionPatterns = this.extractConclusionPatterns(text);

    // 4. 증거 유형 분석
    const evidenceTypes = this.analyzeEvidenceTypes(text);

    // 5. 설득 전략 분석
    const persuasionStrategy = this.analyzePersuasionStrategy(text);

    // 6. 오류 패턴 감지
    const fallacyPatterns = this.detectFallacyPatterns(text);

    // 7. 주장의 강도 분석
    const strengthOfClaims = this.analyzeClaimStrength(text);

    // 8. 반박 스타일 분석
    const counterargumentStyle = this.analyzeCounterargumentStyle(text);

    // 9. 대안 처리 방식 분석
    const alternativeHandling = this.analyzeAlternativeHandling(text);

    // 10. 인과 관계 체인 추출
    const causalChains = this.extractCausalChains(text);

    // 11. 논리적 연결어 분석
    const logicalConnectors = this.analyzeLogicalConnectors(text);

    // 12. 추론 패턴 추출
    const inferencePatterns = this.extractInferencePatterns(text);

    return {
      argumentType,
      premisePatterns,
      conclusionPatterns,
      evidenceTypes,
      persuasionStrategy,
      fallacyPatterns,
      strengthOfClaims,
      counterargumentStyle,
      alternativeHandling,
      causalChains,
      logicalConnectors,
      inferencePatterns
    };
  }

  /**
   * 어조 진행 분석
   */
  private async analyzeTonalProgression(text: string): Promise<TonalProgression> {
    const sentences = this.splitIntoSentences(text);
    const totalLength = sentences.length;

    // 텍스트를 4개 구간으로 나누어 분석
    const openingSection = sentences.slice(0, Math.floor(totalLength * 0.25));
    const developmentSection = sentences.slice(Math.floor(totalLength * 0.25), Math.floor(totalLength * 0.75));
    const climaxSection = sentences.slice(Math.floor(totalLength * 0.75), Math.floor(totalLength * 0.9));
    const conclusionSection = sentences.slice(Math.floor(totalLength * 0.9));

    // 각 구간의 어조 프로필 분석
    const openingTone = this.analyzeToneProfile(openingSection.join(' '));
    const developmentTone = this.analyzeToneProfile(developmentSection.join(' '));
    const climaxTone = this.analyzeToneProfile(climaxSection.join(' '));
    const conclusionTone = this.analyzeToneProfile(conclusionSection.join(' '));

    // 감정적 흐름 분석
    const emotionalArc = this.analyzeEmotionalArc(text);

    // 강도 진행 분석
    const intensityProgression = this.analyzeIntensityProgression(text);

    // 어조 일관성 계산
    const toneConsistency = this.calculateToneConsistency([openingTone, developmentTone, climaxTone, conclusionTone]);

    // 어조 변화 감지
    const toneShifts = this.detectToneShifts(text, [openingTone, developmentTone, climaxTone, conclusionTone]);

    return {
      openingTone,
      developmentTone,
      climaxTone,
      conclusionTone,
      emotionalArc,
      intensityProgression,
      toneConsistency,
      toneShifts
    };
  }

  /**
   * 논증 프레임워크 분석
   */
  private async analyzeArgumentativeFramework(text: string): Promise<ArgumentativeFramework> {
    // 1. 주장 구조 분석
    const claimStructure = this.analyzeClaimStructure(text);

    // 2. 증거 통합 방식 분석
    const evidenceIntegration = this.analyzeEvidenceIntegration(text);

    // 3. 독자 참여 방식 분석
    const audienceEngagement = this.analyzeAudienceEngagement(text);

    // 4. 관점 채택 방식 분석
    const perspectiveTaking = this.analyzePerspectiveTaking(text);

    // 5. 아이디어 발전 방식 분석
    const ideaDevelopment = this.analyzeIdeaDevelopment(text);

    // 6. 전환 스타일 분석
    const transitionStyle = this.analyzeTransitionStyle(text);

    // 7. 수사적 질문 추출
    const rhetoricalQuestions = this.extractRhetoricalQuestions(text);

    // 8. 은유적 프레임워크 분석
    const metaphoricalFramework = this.analyzeMetaphoricalFramework(text);

    // 9. 반복 전략 분석
    const repetitionStrategy = this.analyzeRepetitionStrategy(text);

    return {
      claimStructure,
      evidenceIntegration,
      audienceEngagement,
      perspectiveTaking,
      ideaDevelopment,
      transitionStyle,
      rhetoricalQuestions,
      metaphoricalFramework,
      repetitionStrategy
    };
  }

  /**
   * 언어학적 시그니처 분석
   */
  private async analyzeLinguisticSignature(text: string): Promise<LinguisticSignature> {
    // 1. 어휘 선택 패턴 분석
    const vocabularyPreferences = this.analyzeVocabularyPreferences(text);

    // 2. 구문 패턴 분석
    const syntacticPatterns = this.analyzeSyntacticPatterns(text);

    // 3. 구두점 스타일 분석
    const punctuationStyle = this.analyzePunctuationStyle(text);

    // 4. 문체적 마커 추출
    const stylisticMarkers = this.extractStylisticMarkers(text);

    return {
      vocabularyPreferences,
      syntacticPatterns,
      punctuationStyle,
      stylisticMarkers
    };
  }

  /**
   * 인지적 패턴 분석
   */
  private async analyzeCognitivePatterns(text: string): Promise<CognitivePattern[]> {
    const patterns: CognitivePattern[] = [];

    // 분석적 사고 패턴
    const analyticalPattern = this.detectAnalyticalPattern(text);
    if (analyticalPattern.strength > 0.3) patterns.push(analyticalPattern);

    // 직관적 사고 패턴
    const intuitivePattern = this.detectIntuitivePattern(text);
    if (intuitivePattern.strength > 0.3) patterns.push(intuitivePattern);

    // 체계적 사고 패턴
    const systematicPattern = this.detectSystematicPattern(text);
    if (systematicPattern.strength > 0.3) patterns.push(systematicPattern);

    // 창의적 사고 패턴
    const creativePattern = this.detectCreativePattern(text);
    if (creativePattern.strength > 0.3) patterns.push(creativePattern);

    // 비판적 사고 패턴
    const criticalPattern = this.detectCriticalPattern(text);
    if (criticalPattern.strength > 0.3) patterns.push(criticalPattern);

    return patterns;
  }

  /**
   * 구체적 분석 메서드들 구현
   */
  private identifyArgumentType(text: string): LogicalStructure['argumentType'] {
    // 연역적 논증 패턴
    const deductivePatterns = ['모든', '따라서', '그러므로', '결론적으로'];
    const deductiveScore = this.countPatterns(text, deductivePatterns);

    // 귀납적 논증 패턴
    const inductivePatterns = ['예를 들어', '사례를 보면', '일반적으로', '대부분'];
    const inductiveScore = this.countPatterns(text, inductivePatterns);

    // 가추적 논증 패턴
    const abductivePatterns = ['가장 좋은 설명은', '아마도', '추정컨대', '가능성이 높다'];
    const abductiveScore = this.countPatterns(text, abductivePatterns);

    // 유추적 논증 패턴
    const analogicalPatterns = ['마치', '와 같이', '비슷하게', '유사하게'];
    const analogicalScore = this.countPatterns(text, analogicalPatterns);

    // 인과적 논증 패턴
    const causalPatterns = ['때문에', '원인은', '결과적으로', '영향을 미친다'];
    const causalScore = this.countPatterns(text, causalPatterns);

    // 비교적 논증 패턴
    const comparativePatterns = ['반면에', '대조적으로', '비교하면', '차이점은'];
    const comparativeScore = this.countPatterns(text, comparativePatterns);

    const scores = {
      deductive: deductiveScore,
      inductive: inductiveScore,
      abductive: abductiveScore,
      analogical: analogicalScore,
      causal: causalScore,
      comparative: comparativeScore
    };

    return Object.keys(scores).reduce((a, b) =>
      scores[a as keyof typeof scores] > scores[b as keyof typeof scores] ? a : b
    ) as LogicalStructure['argumentType'];
  }

  private extractPremisePatterns(text: string): string[] {
    const premiseIndicators = [
      '왜냐하면', '근거는', '이유는', '바탕으로', '기반으로',
      '사실은', '증거로는', '데이터에 따르면', '연구에 의하면'
    ];

    const patterns: string[] = [];
    const sentences = this.splitIntoSentences(text);

    sentences.forEach(sentence => {
      premiseIndicators.forEach(indicator => {
        if (sentence.includes(indicator)) {
          patterns.push(this.extractPatternStructure(sentence, indicator));
        }
      });
    });

    return patterns;
  }

  private extractConclusionPatterns(text: string): string[] {
    const conclusionIndicators = [
      '따라서', '그러므로', '결론적으로', '요약하면', '정리하면',
      '결국', '최종적으로', '종합하면', '판단컨대'
    ];

    const patterns: string[] = [];
    const sentences = this.splitIntoSentences(text);

    sentences.forEach(sentence => {
      conclusionIndicators.forEach(indicator => {
        if (sentence.includes(indicator)) {
          patterns.push(this.extractPatternStructure(sentence, indicator));
        }
      });
    });

    return patterns;
  }

  private analyzeEvidenceTypes(text: string): LogicalStructure['evidenceTypes'] {
    const types: LogicalStructure['evidenceTypes'] = [];

    // 실증적 증거
    if (this.hasEmpiricalEvidence(text)) types.push('empirical');

    // 이론적 증거
    if (this.hasTheoreticalEvidence(text)) types.push('theoretical');

    // 일화적 증거
    if (this.hasAnecdotalEvidence(text)) types.push('anecdotal');

    // 통계적 증거
    if (this.hasStatisticalEvidence(text)) types.push('statistical');

    // 권위적 증거
    if (this.hasAuthoritativeEvidence(text)) types.push('authoritative');

    // 논리적 증거
    if (this.hasLogicalEvidence(text)) types.push('logical');

    return types;
  }

  private analyzeToneProfile(text: string): ToneProfile {
    return {
      formality: this.calculateFormality(text),
      confidence: this.calculateConfidence(text),
      urgency: this.calculateUrgency(text),
      empathy: this.calculateEmpathy(text),
      authority: this.calculateAuthority(text),
      objectivity: this.calculateObjectivity(text),
      creativity: this.calculateCreativity(text),
      humor: this.calculateHumor(text)
    };
  }

  private analyzeEmotionalArc(text: string): EmotionalPoint[] {
    const sentences = this.splitIntoSentences(text);
    const emotionalPoints: EmotionalPoint[] = [];

    sentences.forEach((sentence, index) => {
      const position = index / sentences.length;
      const emotion = this.detectDominantEmotion(sentence);
      const intensity = this.calculateEmotionalIntensity(sentence);

      if (intensity > 30) { // 임계값 이상의 감정만 기록
        emotionalPoints.push({
          position,
          emotion: emotion.emotion,
          intensity,
          trigger: sentence.substring(0, 50) + '...'
        });
      }
    });

    return emotionalPoints;
  }

  private analyzeIntensityProgression(text: string): IntensityPoint[] {
    const sentences = this.splitIntoSentences(text);
    const intensityPoints: IntensityPoint[] = [];

    sentences.forEach((sentence, index) => {
      const position = index / sentences.length;
      const intensity = this.calculateSentenceIntensity(sentence);
      const reason = this.identifyIntensityReason(sentence);

      intensityPoints.push({
        position,
        intensity,
        reason
      });
    });

    return intensityPoints;
  }

  /**
   * 유틸리티 메서드들
   */
  private splitIntoSentences(text: string): string[] {
    return text.split(/[.!?。！？]/).filter(s => s.trim().length > 0);
  }

  private countPatterns(text: string, patterns: string[]): number {
    return patterns.reduce((count, pattern) => {
      const regex = new RegExp(pattern, 'gi');
      return count + (text.match(regex) || []).length;
    }, 0);
  }

  private extractPatternStructure(sentence: string, indicator: string): string {
    // 지시어 주변의 구문 구조를 추출
    const parts = sentence.split(indicator);
    if (parts.length > 1) {
      return `${indicator} [내용]`;
    }
    return sentence.substring(0, 100);
  }

  private hasEmpiricalEvidence(text: string): boolean {
    const empiricalKeywords = ['실험', '관찰', '측정', '데이터', '결과'];
    return this.countPatterns(text, empiricalKeywords) > 0;
  }

  private hasTheoreticalEvidence(text: string): boolean {
    const theoreticalKeywords = ['이론', '원리', '법칙', '모델', '가설'];
    return this.countPatterns(text, theoreticalKeywords) > 0;
  }

  private hasAnecdotalEvidence(text: string): boolean {
    const anecdotalKeywords = ['경험', '이야기', '사례', '개인적으로', '한번은'];
    return this.countPatterns(text, anecdotalKeywords) > 0;
  }

  private hasStatisticalEvidence(text: string): boolean {
    const statisticalPattern = /\d+%|\d+명|\d+개|\d+배|통계|수치|비율/g;
    return (text.match(statisticalPattern) || []).length > 0;
  }

  private hasAuthoritativeEvidence(text: string): boolean {
    const authorityKeywords = ['전문가', '교수', '박사', '연구진', '기관'];
    return this.countPatterns(text, authorityKeywords) > 0;
  }

  private hasLogicalEvidence(text: string): boolean {
    const logicalKeywords = ['논리적으로', '합리적으로', '추론', '연역', '귀납'];
    return this.countPatterns(text, logicalKeywords) > 0;
  }

  private calculateFormality(text: string): number {
    const formalPatterns = ['습니다', '입니다', '됩니다'];
    const informalPatterns = ['해요', '이에요', '네요'];

    const formalCount = this.countPatterns(text, formalPatterns);
    const informalCount = this.countPatterns(text, informalPatterns);
    const total = formalCount + informalCount;

    if (total === 0) return 50;
    return Math.round((formalCount / total) * 100);
  }

  private calculateConfidence(text: string): number {
    const confidentWords = ['확실히', '분명히', '틀림없이', '당연히'];
    const uncertainWords = ['아마도', '혹시', '가능하다', '것 같다'];

    const confidentCount = this.countPatterns(text, confidentWords);
    const uncertainCount = this.countPatterns(text, uncertainWords);

    const baseConfidence = 50;
    const adjustment = (confidentCount - uncertainCount) * 10;

    return Math.max(0, Math.min(100, baseConfidence + adjustment));
  }

  private calculateUrgency(text: string): number {
    const urgentWords = ['즉시', '빨리', '서둘러', '긴급히', '시급히'];
    const calmWords = ['천천히', '여유롭게', '차근차근', '신중하게'];

    const urgentCount = this.countPatterns(text, urgentWords);
    const calmCount = this.countPatterns(text, calmWords);
    const exclamations = (text.match(/!/g) || []).length;

    const baseUrgency = 30;
    const adjustment = (urgentCount - calmCount) * 15 + exclamations * 5;

    return Math.max(0, Math.min(100, baseUrgency + adjustment));
  }

  private calculateEmpathy(text: string): number {
    const empathyWords = ['이해합니다', '공감합니다', '마음', '느낌', '감정'];
    const empathyCount = this.countPatterns(text, empathyWords);

    return Math.min(100, empathyCount * 20);
  }

  private calculateAuthority(text: string): number {
    const authorityWords = ['경험상', '전문가로서', '연구에 의하면', '확실한 것은'];
    const authorityCount = this.countPatterns(text, authorityWords);

    return Math.min(100, authorityCount * 25);
  }

  private calculateObjectivity(text: string): number {
    const objectiveWords = ['객관적으로', '사실적으로', '데이터에 따르면', '중립적으로'];
    const subjectiveWords = ['개인적으로', '주관적으로', '느끼기에', '생각에는'];

    const objectiveCount = this.countPatterns(text, objectiveWords);
    const subjectiveCount = this.countPatterns(text, subjectiveWords);

    const total = objectiveCount + subjectiveCount;
    if (total === 0) return 50;

    return Math.round((objectiveCount / total) * 100);
  }

  private calculateCreativity(text: string): number {
    const creativeWords = ['상상', '창의적', '혁신적', '독창적', '새로운'];
    const metaphors = (text.match(/마치|처럼|같이|비유/g) || []).length;

    const creativeCount = this.countPatterns(text, creativeWords);

    return Math.min(100, (creativeCount + metaphors) * 15);
  }

  private calculateHumor(text: string): number {
    const humorWords = ['웃기는', '재미있는', '유머', '농담', '익살'];
    const humorCount = this.countPatterns(text, humorWords);

    return Math.min(100, humorCount * 30);
  }

  private detectDominantEmotion(sentence: string): { emotion: EmotionalPoint['emotion']; confidence: number } {
    const emotions = {
      joy: ['기쁜', '행복한', '즐거운', '만족스러운', '좋은'],
      anger: ['화난', '분노한', '짜증나는', '격분한', '성난'],
      sadness: ['슬픈', '우울한', '실망한', '좌절한', '아쉬운'],
      fear: ['무서운', '두려운', '걱정되는', '불안한', '위험한'],
      surprise: ['놀라운', '의외의', '뜻밖의', '충격적인', '예상치 못한'],
      disgust: ['역겨운', '불쾌한', '싫은', '혐오스러운', '지긋지긋한']
    };

    let maxScore = 0;
    let dominantEmotion: EmotionalPoint['emotion'] = 'neutral';

    Object.entries(emotions).forEach(([emotion, words]) => {
      const score = this.countPatterns(sentence, words);
      if (score > maxScore) {
        maxScore = score;
        dominantEmotion = emotion as EmotionalPoint['emotion'];
      }
    });

    return { emotion: dominantEmotion, confidence: maxScore };
  }

  private calculateEmotionalIntensity(sentence: string): number {
    const intensifiers = ['매우', '너무', '완전히', '극도로', '엄청나게'];
    const intensifierCount = this.countPatterns(sentence, intensifiers);
    const exclamations = (sentence.match(/!/g) || []).length;
    const capsWords = (sentence.match(/[A-Z가-힣]{3,}/g) || []).length;

    return Math.min(100, (intensifierCount * 20) + (exclamations * 15) + (capsWords * 10));
  }

  private calculateSentenceIntensity(sentence: string): number {
    const length = sentence.length;
    const complexWords = (sentence.match(/[가-힣]{4,}/g) || []).length;
    const punctuation = (sentence.match(/[!?.,;:]/g) || []).length;

    let intensity = 30; // 기본 강도
    intensity += Math.min(30, length / 10); // 길이에 따른 조정
    intensity += Math.min(20, complexWords * 2); // 복잡한 어휘
    intensity += Math.min(20, punctuation * 3); // 구두점

    return Math.min(100, intensity);
  }

  private identifyIntensityReason(sentence: string): string {
    if (sentence.includes('!')) return '감탄부호 사용';
    if (sentence.includes('?')) return '의문문 사용';
    if (sentence.length > 100) return '긴 문장';
    if (this.countPatterns(sentence, ['매우', '너무', '완전히']) > 0) return '강조 부사 사용';
    return '일반적 강도';
  }

  // 추가 분석 메서드들 (간략히 구현)
  private analyzeClaimStructure(text: string): ArgumentativeFramework['claimStructure'] {
    const sentences = this.splitIntoSentences(text);
    const claims = sentences.filter(s => this.isClaim(s));

    if (claims.length === 1) return 'single_main';
    if (this.hasHierarchicalStructure(text)) return 'hierarchical';
    if (this.hasCircularStructure(text)) return 'circular';
    return 'multiple_parallel';
  }

  private isClaim(sentence: string): boolean {
    const claimIndicators = ['주장하다', '생각한다', '믿는다', '확신한다'];
    return this.countPatterns(sentence, claimIndicators) > 0;
  }

  private hasHierarchicalStructure(text: string): boolean {
    return text.includes('첫째') || text.includes('둘째') || text.includes('셋째');
  }

  private hasCircularStructure(text: string): boolean {
    const firstSentence = this.splitIntoSentences(text)[0];
    const lastSentence = this.splitIntoSentences(text).slice(-1)[0];
    return this.calculateSimilarity(firstSentence, lastSentence) > 0.7;
  }

  private calculateSimilarity(text1: string, text2: string): number {
    // 간단한 유사도 계산 (실제로는 더 정교한 알고리즘 필요)
    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  // 나머지 메서드들도 유사하게 구현...
  private analyzeEvidenceIntegration(text: string): ArgumentativeFramework['evidenceIntegration'] {
    return 'distributed'; // 임시 구현
  }

  private analyzeAudienceEngagement(text: string): ArgumentativeFramework['audienceEngagement'] {
    if (text.includes('여러분')) return 'direct_address';
    if (text.includes('?')) return 'rhetorical_questions';
    return 'shared_assumptions';
  }

  private analyzePerspectiveTaking(text: string): ArgumentativeFramework['perspectiveTaking'] {
    const firstPerson = this.countPatterns(text, ['나는', '내가', '저는']);
    const secondPerson = this.countPatterns(text, ['당신은', '여러분은']);
    const thirdPerson = this.countPatterns(text, ['그는', '그들은']);

    if (firstPerson > secondPerson && firstPerson > thirdPerson) return 'first_person';
    if (secondPerson > 0) return 'second_person';
    if (thirdPerson > 0) return 'third_person';
    return 'mixed';
  }

  private analyzeIdeaDevelopment(text: string): ArgumentativeFramework['ideaDevelopment'] {
    return 'linear'; // 임시 구현
  }

  private analyzeTransitionStyle(text: string): ArgumentativeFramework['transitionStyle'] {
    const transitionWords = ['그러나', '따라서', '또한', '하지만'];
    const transitionCount = this.countPatterns(text, transitionWords);

    if (transitionCount === 0) return 'implicit';
    if (transitionCount > 3) return 'signposted';
    return 'smooth';
  }

  private extractRhetoricalQuestions(text: string): RhetoricalQuestion[] {
    const questions: RhetoricalQuestion[] = [];
    const sentences = this.splitIntoSentences(text);

    sentences.forEach((sentence, index) => {
      if (sentence.includes('?')) {
        questions.push({
          question: sentence,
          purpose: this.determineQuestionPurpose(sentence),
          position: index / sentences.length,
          expectedAnswer: this.determineExpectedAnswer(sentence)
        });
      }
    });

    return questions;
  }

  private determineQuestionPurpose(question: string): RhetoricalQuestion['purpose'] {
    if (question.includes('그렇지 않나요') || question.includes('아닌가요')) return 'emphasis';
    if (question.includes('어떻게') || question.includes('왜')) return 'challenge';
    return 'engagement';
  }

  private determineExpectedAnswer(question: string): RhetoricalQuestion['expectedAnswer'] {
    if (question.includes('당연히') || question.includes('물론')) return 'obvious';
    return 'complex';
  }

  private analyzeMetaphoricalFramework(text: string): MetaphorPattern[] {
    const patterns: MetaphorPattern[] = [];

    // 은유 표현 패턴 찾기
    const metaphorRegex = /(.*?)(는|은)\s*(마치|처럼|같이)\s*(.*?)(와|과|처럼|같다)/g;
    let match;

    while ((match = metaphorRegex.exec(text)) !== null) {
              patterns.push({
            sourcedomain: match[4],
            targetDomain: match[1],
            mappingStrength: 0.8,
            frequency: 1,
        function: 'explanation'
      });
    }

    return patterns;
  }

  private analyzeRepetitionStrategy(text: string): RepetitionStrategy {
    const words = text.split(/\s+/);
    const wordCounts: { [key: string]: number } = {};

    words.forEach(word => {
      const cleanWord = word.replace(/[^\w가-힣]/g, '');
      if (cleanWord.length > 2) {
        wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
      }
    });

    const repeatedWords = Object.entries(wordCounts)
      .filter(([_, count]) => count >= 2)
      .map(([word, _]) => word);

    return {
      keyPhrases: repeatedWords.slice(0, 5),
      repetitionType: 'exact',
      frequency: repeatedWords.length,
      function: 'emphasis'
    };
  }

  private analyzeVocabularyPreferences(text: string): VocabularyPreference[] {
    return []; // 임시 구현
  }

  private analyzeSyntacticPatterns(text: string): SyntacticPattern[] {
    return []; // 임시 구현
  }

  private analyzePunctuationStyle(text: string): PunctuationStyle {
    const commas = (text.match(/,/g) || []).length;
    const semicolons = (text.match(/;/g) || []).length;
    const dashes = (text.match(/--/g) || []).length;
    const parentheses = (text.match(/\(/g) || []).length;
    const exclamations = (text.match(/!/g) || []).length;

    return {
      commaUsage: commas > 10 ? 'liberal' : commas > 5 ? 'standard' : 'minimal',
      semicolonFrequency: semicolons,
      dashUsage: dashes > 2 ? 'frequent' : dashes > 0 ? 'occasional' : 'none',
      parentheticalStyle: parentheses > 3 ? 'frequent' : parentheses > 1 ? 'moderate' : parentheses > 0 ? 'minimal' : 'none',
      exclamationPattern: {
        frequency: exclamations,
        contexts: ['강조', '감탄'],
        intensity: exclamations > 5 ? 'strong' : exclamations > 2 ? 'moderate' : 'mild'
      }
    };
  }

  private extractStylisticMarkers(text: string): StylisticMarker[] {
    return []; // 임시 구현
  }

  private detectAnalyticalPattern(text: string): CognitivePattern {
    const analyticalWords = ['분석', '검토', '평가', '논리적', '체계적'];
    const strength = Math.min(1, this.countPatterns(text, analyticalWords) / 10);

    return {
      type: 'analytical',
      strength,
      manifestations: ['논리적 구조', '체계적 접근'],
      triggers: analyticalWords
    };
  }

  private detectIntuitivePattern(text: string): CognitivePattern {
    const intuitiveWords = ['느낌', '직감', '본능적으로', '감으로'];
    const strength = Math.min(1, this.countPatterns(text, intuitiveWords) / 10);

    return {
      type: 'intuitive',
      strength,
      manifestations: ['직관적 판단', '감정적 접근'],
      triggers: intuitiveWords
    };
  }

  private detectSystematicPattern(text: string): CognitivePattern {
    const systematicWords = ['체계', '단계', '순서', '절차', '방법론'];
    const strength = Math.min(1, this.countPatterns(text, systematicWords) / 10);

    return {
      type: 'systematic',
      strength,
      manifestations: ['단계적 접근', '방법론적 사고'],
      triggers: systematicWords
    };
  }

  private detectCreativePattern(text: string): CognitivePattern {
    const creativeWords = ['창의', '혁신', '새로운', '독창적', '상상'];
    const strength = Math.min(1, this.countPatterns(text, creativeWords) / 10);

    return {
      type: 'creative',
      strength,
      manifestations: ['창의적 표현', '독창적 관점'],
      triggers: creativeWords
    };
  }

  private detectCriticalPattern(text: string): CognitivePattern {
    const criticalWords = ['비판', '의문', '검증', '문제점', '한계'];
    const strength = Math.min(1, this.countPatterns(text, criticalWords) / 10);

    return {
      type: 'critical',
      strength,
      manifestations: ['비판적 사고', '의문 제기'],
      triggers: criticalWords
    };
  }

  private calculateToneConsistency(tones: ToneProfile[]): number {
    if (tones.length < 2) return 100;

    let totalVariance = 0;
    const aspects = Object.keys(tones[0]) as (keyof ToneProfile)[];

    aspects.forEach(aspect => {
      const values = tones.map(tone => tone[aspect]);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      totalVariance += variance;
    });

    const averageVariance = totalVariance / aspects.length;
    return Math.max(0, 100 - averageVariance);
  }

  private detectToneShifts(text: string, tones: ToneProfile[]): ToneShift[] {
    const shifts: ToneShift[] = [];

    for (let i = 1; i < tones.length; i++) {
      const prevTone = tones[i - 1];
      const currTone = tones[i];

      const significantChanges = this.findSignificantToneChanges(prevTone, currTone);

      if (significantChanges.length > 0) {
        shifts.push({
          position: i / tones.length,
          fromTone: prevTone,
          toTone: currTone,
          trigger: '구간 전환',
          purpose: '논조 조절'
        });
      }
    }

    return shifts;
  }

  private findSignificantToneChanges(prev: ToneProfile, curr: ToneProfile): string[] {
    const changes: string[] = [];
    const threshold = 20; // 20점 이상 차이나면 유의미한 변화

    Object.keys(prev).forEach(key => {
      const aspect = key as keyof ToneProfile;
      if (Math.abs(prev[aspect] - curr[aspect]) > threshold) {
        changes.push(aspect);
      }
    });

    return changes;
  }

  /**
   * 초기화 메서드들
   */
  private initializeLogicalConnectors(): void {
    this.logicalConnectorMap.set('따라서', 'conclusion');
    this.logicalConnectorMap.set('그러나', 'contrast');
    this.logicalConnectorMap.set('또한', 'addition');
    this.logicalConnectorMap.set('반면에', 'contrast');
    this.logicalConnectorMap.set('결과적으로', 'consequence');
    this.logicalConnectorMap.set('마찬가지로', 'similarity');
  }

  private initializeEmotionKeywords(): void {
    this.emotionKeywords.set('기쁘다', { emotion: 'joy', intensity: 80 });
    this.emotionKeywords.set('슬프다', { emotion: 'sadness', intensity: 80 });
    this.emotionKeywords.set('화나다', { emotion: 'anger', intensity: 85 });
    this.emotionKeywords.set('무섭다', { emotion: 'fear', intensity: 75 });
    this.emotionKeywords.set('놀랍다', { emotion: 'surprise', intensity: 70 });
    this.emotionKeywords.set('역겹다', { emotion: 'disgust', intensity: 85 });
  }

  private initializeRhetoricalPatterns(): void {
    this.rhetoricalPatterns.set('rhetorical_question', /.*\?$/);
    this.rhetoricalPatterns.set('metaphor', /.*(마치|처럼|같이).*/);
    this.rhetoricalPatterns.set('repetition', /(.+)\1/);
    this.rhetoricalPatterns.set('emphasis', /.*(매우|너무|완전히).*/);
  }

  private analyzePersuasionStrategy(text: string): LogicalStructure['persuasionStrategy'] {
    const strategies: LogicalStructure['persuasionStrategy'] = [];

    // Logos (논리적 호소)
    if (this.hasLogicalAppeal(text)) strategies.push('logos');

    // Ethos (권위적 호소)
    if (this.hasEthicalAppeal(text)) strategies.push('ethos');

    // Pathos (감정적 호소)
    if (this.hasEmotionalAppeal(text)) strategies.push('pathos');

    return strategies;
  }

  private hasLogicalAppeal(text: string): boolean {
    const logicalKeywords = ['논리적으로', '합리적으로', '증명', '근거', '데이터'];
    return this.countPatterns(text, logicalKeywords) > 0;
  }

  private hasEthicalAppeal(text: string): boolean {
    const ethicalKeywords = ['전문가', '권위자', '경험', '신뢰할 수 있는'];
    return this.countPatterns(text, ethicalKeywords) > 0;
  }

  private hasEmotionalAppeal(text: string): boolean {
    const emotionalKeywords = ['감동적인', '안타까운', '기쁜', '슬픈', '화나는'];
    return this.countPatterns(text, emotionalKeywords) > 0;
  }

  private detectFallacyPatterns(text: string): string[] {
    const fallacies: string[] = [];

    // Ad hominem (인신공격)
    if (text.includes('그 사람은') && text.includes('믿을 수 없다')) {
      fallacies.push('ad_hominem');
    }

    // False dichotomy (거짓 이분법)
    if (text.includes('둘 중 하나') || text.includes('아니면')) {
      fallacies.push('false_dichotomy');
    }

    // Appeal to authority (권위에의 호소)
    if (text.includes('전문가가 말했으니까')) {
      fallacies.push('appeal_to_authority');
    }

    return fallacies;
  }

  private analyzeClaimStrength(text: string): LogicalStructure['strengthOfClaims'] {
    const absoluteWords = ['절대적으로', '반드시', '확실히', '틀림없이'];
    const strongWords = ['대체로', '일반적으로', '보통'];
    const weakWords = ['아마도', '가능하다', '것 같다'];

    const absoluteCount = this.countPatterns(text, absoluteWords);
    const strongCount = this.countPatterns(text, strongWords);
    const weakCount = this.countPatterns(text, weakWords);

    if (absoluteCount > strongCount && absoluteCount > weakCount) return 'absolute';
    if (strongCount > weakCount) return 'strong';
    if (weakCount > 0) return 'weak';
    return 'moderate';
  }

  private analyzeCounterargumentStyle(text: string): LogicalStructure['counterargumentStyle'] {
    if (text.includes('물론') || text.includes('인정하지만')) return 'acknowledgment';
    if (text.includes('그러나 이는 틀렸다') || text.includes('반박하자면')) return 'refutation';
    if (text.includes('종합하면') || text.includes('결합하면')) return 'synthesis';
    return 'none';
  }

  private analyzeAlternativeHandling(text: string): LogicalStructure['alternativeHandling'] {
    if (text.includes('다른 방법도 있지만') || text.includes('대안으로는')) return 'consider';
    if (text.includes('통합하면') || text.includes('결합하면')) return 'integrate';
    if (text.includes('그런 건 상관없다')) return 'dismiss';
    return 'ignore';
  }

  private extractCausalChains(text: string): CausalChain[] {
    const chains: CausalChain[] = [];
    const causalPatterns = [
      /(.+?)(때문에|원인으로)(.+?)(결과적으로|따라서)(.+)/g,
      /(.+?)(로 인해)(.+?)(가 된다|된다)/g
    ];

    causalPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        chains.push({
          cause: match[1].trim(),
          effect: match[3] ? match[3].trim() : match[2].trim(),
          strength: 'moderate',
          certainty: 'probable',
          intermediateSteps: []
        });
      }
    });

    return chains;
  }

  private analyzeLogicalConnectors(text: string): LogicalConnector[] {
    const connectors: LogicalConnector[] = [];
    const sentences = this.splitIntoSentences(text);

    this.logicalConnectorMap.forEach((type, connector) => {
      const count = this.countPatterns(text, [connector]);
      if (count > 0) {
        // 위치 분석
        const positions = this.findConnectorPositions(sentences, connector);

        connectors.push({
          type: type as any,
          frequency: count,
          position: this.determineAveragePosition(positions),
          contextPattern: this.extractContextPattern(text, connector)
        });
      }
    });

    return connectors;
  }

  private findConnectorPositions(sentences: string[], connector: string): number[] {
    const positions: number[] = [];

    sentences.forEach((sentence, index) => {
      if (sentence.includes(connector)) {
        positions.push(index / sentences.length);
      }
    });

    return positions;
  }

  private determineAveragePosition(positions: number[]): LogicalConnector['position'] {
    if (positions.length === 0) return 'middle';

    const average = positions.reduce((sum, pos) => sum + pos, 0) / positions.length;

    if (average < 0.33) return 'beginning';
    if (average > 0.67) return 'end';
    return 'middle';
  }

  private extractContextPattern(text: string, connector: string): string {
    const sentences = this.splitIntoSentences(text);
    const relevantSentences = sentences.filter(s => s.includes(connector));

    if (relevantSentences.length > 0) {
      return relevantSentences[0].substring(0, 50) + '...';
    }

    return connector + ' [내용]';
  }

  private extractInferencePatterns(text: string): InferencePattern[] {
    const patterns: InferencePattern[] = [];

    // If-then 패턴
    const ifThenMatches = text.match(/만약.+?라면.+?것이다/g);
    if (ifThenMatches) {
      patterns.push({
        type: 'if_then',
        template: '만약 [조건]라면 [결과]것이다',
        confidence: 0.8,
        usage_frequency: ifThenMatches.length
      });
    }

    // Cause-effect 패턴
    const causeEffectMatches = text.match(/.+?때문에.+?다/g);
    if (causeEffectMatches) {
      patterns.push({
        type: 'cause_effect',
        template: '[원인]때문에 [결과]다',
        confidence: 0.9,
        usage_frequency: causeEffectMatches.length
      });
    }

    // Comparison 패턴
    const comparisonMatches = text.match(/.+?에 비해.+?다/g);
    if (comparisonMatches) {
      patterns.push({
        type: 'comparison',
        template: '[대상1]에 비해 [대상2]다',
        confidence: 0.7,
        usage_frequency: comparisonMatches.length
      });
    }

    return patterns;
  }
}

export const advancedLogicAnalysisEngine = new AdvancedLogicAnalysisEngine();
export default advancedLogicAnalysisEngine;
