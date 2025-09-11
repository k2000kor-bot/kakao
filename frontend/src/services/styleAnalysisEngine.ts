/**
 * CORBU AI 스타일 분석 엔진
 * 기존 글의 스타일, 어투, 문체를 정밀 분석하여 동일한 스타일로 새로운 글을 생성할 수 있는 프로필을 추출
 */

export interface StyleProfile {
    // 기본 정보
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    averageWordsPerSentence: number;
    averageSentencesPerParagraph: number;

    // 언어적 특성
    formality: 'very_formal' | 'formal' | 'semi_formal' | 'casual' | 'very_casual';
    politeness: 'very_polite' | 'polite' | 'neutral' | 'direct' | 'blunt';
    emotionalTone: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
    intensity: 'very_mild' | 'mild' | 'moderate' | 'strong' | 'very_strong';

    // 문체적 특성
    writingStyle: 'descriptive' | 'narrative' | 'argumentative' | 'persuasive' | 'informative';
    voiceType: 'first_person' | 'second_person' | 'third_person' | 'mixed';
    tenseDominance: 'past' | 'present' | 'future' | 'mixed';

    // 어휘적 특성
    vocabularyLevel: 'simple' | 'common' | 'intermediate' | 'advanced' | 'expert';
    technicalTerms: number;
    foreignWords: number;
    honorificUsage: 'none' | 'minimal' | 'moderate' | 'frequent' | 'extensive';

    // 문장 구조
    sentenceComplexity: 'simple' | 'compound' | 'complex' | 'mixed';
    averageClausesPerSentence: number;
    questionSentences: number;
    exclamatorySentences: number;

    // 수사법
    rhetoricalDevices: string[];
    metaphorUsage: number;
    repetitionPatterns: string[];

    // 논조와 관점
    argumentativeStance: 'strongly_for' | 'for' | 'neutral' | 'against' | 'strongly_against';
    certaintyLevel: 'uncertain' | 'cautious' | 'confident' | 'very_confident' | 'absolute';
    subjectivity: 'very_objective' | 'objective' | 'balanced' | 'subjective' | 'very_subjective';

    // 연결어와 전개
    transitionWords: string[];
    logicalStructure: 'chronological' | 'spatial' | 'importance' | 'compare_contrast' | 'cause_effect';
    conclusionStyle: 'summary' | 'call_to_action' | 'question' | 'quote' | 'prediction';

    // 특별한 패턴
    uniquePhrases: string[];
    characteristicExpressions: string[];
    punctuationPatterns: any;

    // 문맥적 특성
    targetAudience: 'children' | 'teenagers' | 'adults' | 'elderly' | 'experts' | 'general';
    purpose: 'inform' | 'persuade' | 'entertain' | 'instruct' | 'express';
    domain: 'academic' | 'business' | 'casual' | 'creative' | 'technical';
}

export interface StyleAnalysisRequest {
    text: string;
    context?: string;
    author?: string;
    genre?: string;
}

export interface StyleAnalysisResponse {
    profile: StyleProfile;
    confidence: number;
    keyCharacteristics: string[];
    styleSignature: string;
    recommendations: string[];
}

export interface StyleCloneRequest {
    originalText: string;
    newTopic: string;
    targetWordCount?: number;
    preserveStyle: boolean;
    adjustments?: Partial<StyleProfile>;
}

export interface StyleCloneResponse {
    generatedText: string;
    styleMatchScore: number;
    appliedProfile: StyleProfile;
    deviations: string[];
    improvements: string[];
}

class StyleAnalysisEngine {
    private koreanParticles = ['이', '가', '을', '를', '에', '에서', '로', '으로', '와', '과', '의', '도', '만', '부터', '까지', '처럼', '같이'];
    private honorificPatterns = ['습니다', '시다', '세요', '십시오', '하십시오', '입니다', '됩니다', '습니까', '실까요'];
    private emotionalWords = {
        positive: ['좋은', '훌륭한', '멋진', '아름다운', '기쁜', '행복한', '만족스러운'],
        negative: ['나쁜', '끔찍한', '슬픈', '화나는', '실망스러운', '불만스러운'],
        neutral: ['보통', '일반적인', '평범한', '기본적인']
    };
    private transitionWords = ['그러나', '하지만', '따라서', '그러므로', '또한', '더불어', '반면', '한편', '결국', '결론적으로'];

    /**
     * 텍스트 스타일 분석
     */
    public async analyzeStyle(request: StyleAnalysisRequest): Promise<StyleAnalysisResponse> {
        try {
            const text = request.text;

            // 1. 기본 구조 분석
            const basicStructure = this.analyzeBasicStructure(text);

            // 2. 언어적 특성 분석
            const languageFeatures = this.analyzeLanguageFeatures(text);

            // 3. 문체적 특성 분석
            const writingFeatures = this.analyzeWritingFeatures(text);

            // 4. 어휘적 특성 분석
            const vocabularyFeatures = this.analyzeVocabularyFeatures(text);

            // 5. 문장 구조 분석
            const sentenceFeatures = this.analyzeSentenceFeatures(text);

            // 6. 수사법 분석
            const rhetoricalFeatures = this.analyzeRhetoricalFeatures(text);

            // 7. 논조와 관점 분석
            const argumentativeFeatures = this.analyzeArgumentativeFeatures(text);

            // 8. 연결어와 전개 분석
            const structuralFeatures = this.analyzeStructuralFeatures(text);

            // 9. 특별한 패턴 분석
            const uniqueFeatures = this.analyzeUniqueFeatures(text);

            // 10. 문맥적 특성 분석
            const contextualFeatures = this.analyzeContextualFeatures(text, request.context);

            // 종합 프로필 생성
            const profile: StyleProfile = {
                wordCount: basicStructure.wordCount || 0,
                sentenceCount: basicStructure.sentenceCount || 0,
                paragraphCount: basicStructure.paragraphCount || 0,
                averageWordsPerSentence: basicStructure.averageWordsPerSentence || 0,
                averageSentencesPerParagraph: basicStructure.averageSentencesPerParagraph || 0,
                formality: languageFeatures.formality || 'semi_formal',
                politeness: languageFeatures.politeness || 'polite',
                emotionalTone: languageFeatures.emotionalTone || 'neutral',
                intensity: languageFeatures.intensity || 'moderate',
                writingStyle: writingFeatures.writingStyle || 'informative',
                voiceType: sentenceFeatures.voiceType || 'third_person',
                tenseDominance: sentenceFeatures.tenseDominance || 'present',
                vocabularyLevel: vocabularyFeatures.vocabularyLevel || 'common',
                technicalTerms: vocabularyFeatures.technicalTerms || 0,
                foreignWords: vocabularyFeatures.foreignWords || 0,
                honorificUsage: vocabularyFeatures.honorificUsage || 'minimal',
                sentenceComplexity: sentenceFeatures.sentenceComplexity || 'simple',
                averageClausesPerSentence: sentenceFeatures.averageClausesPerSentence || 1,
                questionSentences: sentenceFeatures.questionSentences || 0,
                exclamatorySentences: sentenceFeatures.exclamatorySentences || 0,
                rhetoricalDevices: rhetoricalFeatures.rhetoricalDevices || [],
                metaphorUsage: rhetoricalFeatures.metaphorUsage || 0,
                repetitionPatterns: rhetoricalFeatures.repetitionPatterns || [],
                argumentativeStance: argumentativeFeatures.argumentativeStance || 'neutral',
                certaintyLevel: argumentativeFeatures.certaintyLevel || 'confident',
                subjectivity: argumentativeFeatures.subjectivity || 'balanced',
                transitionWords: structuralFeatures.transitionWords || [],
                logicalStructure: structuralFeatures.logicalStructure || 'importance',
                conclusionStyle: structuralFeatures.conclusionStyle || 'summary',
                uniquePhrases: uniqueFeatures.uniquePhrases || [],
                characteristicExpressions: uniqueFeatures.characteristicExpressions || [],
                punctuationPatterns: uniqueFeatures.punctuationPatterns || {},
                targetAudience: contextualFeatures.targetAudience || 'general',
                purpose: contextualFeatures.purpose || 'inform',
                domain: contextualFeatures.domain || 'casual',
                ...languageFeatures,
                ...writingFeatures,
                ...vocabularyFeatures,
                ...sentenceFeatures,
                ...rhetoricalFeatures,
                ...argumentativeFeatures,
                ...structuralFeatures,
                ...uniqueFeatures,
                ...contextualFeatures
            };

            // 신뢰도 계산
            const confidence = this.calculateConfidence(text, profile);

            // 주요 특성 추출
            const keyCharacteristics = this.extractKeyCharacteristics(profile);

            // 스타일 시그니처 생성
            const styleSignature = this.generateStyleSignature(profile);

            // 추천사항 생성
            const recommendations = this.generateRecommendations(profile);

            return {
                profile,
                confidence,
                keyCharacteristics,
                styleSignature,
                recommendations
            };

        } catch (error) {
            console.error('스타일 분석 실패:', error);
            throw new Error('스타일 분석에 실패했습니다.');
        }
    }

    /**
     * 기본 구조 분석
     */
    private analyzeBasicStructure(text: string): Partial<StyleProfile> {
        const sentences = text.split(/[.!?。！？]/).filter(s => s.trim().length > 0);
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        const words = text.replace(/[^\w\s가-힣]/g, ' ').split(/\s+/).filter(w => w.length > 0);

        return {
            wordCount: words.length,
            sentenceCount: sentences.length,
            paragraphCount: paragraphs.length,
            averageWordsPerSentence: words.length / sentences.length,
            averageSentencesPerParagraph: sentences.length / paragraphs.length
        };
    }

    /**
     * 언어적 특성 분석
     */
    private analyzeLanguageFeatures(text: string): Partial<StyleProfile> {
        // 격식도 분석
        const formality = this.analyzeFormalityLevel(text);

        // 정중함 분석
        const politeness = this.analyzePolitenessLevel(text);

        // 감정적 톤 분석
        const emotionalTone = this.analyzeEmotionalTone(text);

        // 강도 분석
        const intensity = this.analyzeIntensity(text);

        return {
            formality,
            politeness,
            emotionalTone,
            intensity
        };
    }

    private analyzeFormalityLevel(text: string): StyleProfile['formality'] {
        const formalPatterns = ['습니다', '입니다', '됩니다', '하겠습니다'];
        const casualPatterns = ['해요', '이에요', '예요', '할게요'];

        const formalCount = formalPatterns.reduce((count, pattern) =>
            count + (text.match(new RegExp(pattern, 'g')) || []).length, 0);
        const casualCount = casualPatterns.reduce((count, pattern) =>
            count + (text.match(new RegExp(pattern, 'g')) || []).length, 0);

        const totalEndings = formalCount + casualCount;
        if (totalEndings === 0) return 'neutral' as any;

        const formalRatio = formalCount / totalEndings;

        if (formalRatio >= 0.8) return 'very_formal';
        if (formalRatio >= 0.6) return 'formal';
        if (formalRatio >= 0.4) return 'semi_formal';
        if (formalRatio >= 0.2) return 'casual';
        return 'very_casual';
    }

    private analyzePolitenessLevel(text: string): StyleProfile['politeness'] {
        const veryPolitePatterns = ['죄송합니다', '감사합니다', '부탁드립니다', '양해 부탁드립니다'];
        const politePatterns = ['고맙습니다', '미안합니다', '주세요', '해주세요'];
        const directPatterns = ['해라', '하자', '해야 한다', '해야 된다'];

        const veryPoliteCount = this.countPatterns(text, veryPolitePatterns);
        const politeCount = this.countPatterns(text, politePatterns);
        const directCount = this.countPatterns(text, directPatterns);

        if (veryPoliteCount > politeCount && veryPoliteCount > directCount) return 'very_polite';
        if (politeCount > directCount) return 'polite';
        if (directCount > politeCount) return 'direct';
        return 'neutral';
    }

    private analyzeEmotionalTone(text: string): StyleProfile['emotionalTone'] {
        const positiveCount = this.countPatterns(text, this.emotionalWords.positive);
        const negativeCount = this.countPatterns(text, this.emotionalWords.negative);
        const exclamationCount = (text.match(/!/g) || []).length;

        const emotionalBalance = positiveCount - negativeCount;
        const totalEmotional = positiveCount + negativeCount;

        if (totalEmotional === 0) return 'neutral';

        if (emotionalBalance > 3 || (emotionalBalance > 0 && exclamationCount > 2)) return 'very_positive';
        if (emotionalBalance > 0) return 'positive';
        if (emotionalBalance < -3 || (emotionalBalance < 0 && exclamationCount > 2)) return 'very_negative';
        if (emotionalBalance < 0) return 'negative';
        return 'neutral';
    }

    private analyzeIntensity(text: string): StyleProfile['intensity'] {
        const intensifiers = ['매우', '너무', '완전히', '절대적으로', '극도로', '엄청나게'];
        const moderators = ['조금', '약간', '다소', '어느 정도', '비교적'];
        const strongPunctuation = (text.match(/[!]{2,}|[?]{2,}/g) || []).length;

        const intensifierCount = this.countPatterns(text, intensifiers);
        const moderatorCount = this.countPatterns(text, moderators);

        const intensityScore = intensifierCount - moderatorCount + strongPunctuation;

        if (intensityScore >= 5) return 'very_strong';
        if (intensityScore >= 2) return 'strong';
        if (intensityScore >= -1) return 'moderate';
        if (intensityScore >= -3) return 'mild';
        return 'very_mild';
    }

    /**
     * 문체적 특성 분석
     */
    private analyzeWritingFeatures(text: string): Partial<StyleProfile> {
        const writingStyle = this.analyzeWritingStyle(text);
        const voiceType = this.analyzeVoiceType(text);
        const tenseDominance = this.analyzeTenseDominance(text);

        return {
            writingStyle,
            voiceType,
            tenseDominance
        };
    }

    private analyzeWritingStyle(text: string): StyleProfile['writingStyle'] {
        const descriptivePatterns = ['묘사', '설명', '표현', '모습', '상태'];
        const narrativePatterns = ['이야기', '사건', '경험', '과정', '당시'];
        const argumentativePatterns = ['주장', '논리', '근거', '반박', '증명'];
        const persuasivePatterns = ['설득', '권유', '추천', '제안', '호소'];
        const informativePatterns = ['정보', '사실', '데이터', '통계', '연구'];

        const scores = {
            descriptive: this.countPatterns(text, descriptivePatterns),
            narrative: this.countPatterns(text, narrativePatterns),
            argumentative: this.countPatterns(text, argumentativePatterns),
            persuasive: this.countPatterns(text, persuasivePatterns),
            informative: this.countPatterns(text, informativePatterns)
        };

        return Object.keys(scores).reduce((a, b) =>
            scores[a as keyof typeof scores] > scores[b as keyof typeof scores] ? a : b) as StyleProfile['writingStyle'];
    }

    private analyzeVoiceType(text: string): StyleProfile['voiceType'] {
        const firstPersonPatterns = ['나는', '내가', '저는', '제가', '우리는'];
        const secondPersonPatterns = ['당신은', '여러분은', '너는', '네가'];
        const thirdPersonPatterns = ['그는', '그녀는', '그들은', '이들은'];

        const firstCount = this.countPatterns(text, firstPersonPatterns);
        const secondCount = this.countPatterns(text, secondPersonPatterns);
        const thirdCount = this.countPatterns(text, thirdPersonPatterns);

        const total = firstCount + secondCount + thirdCount;
        if (total === 0) return 'third_person';

        const firstRatio = firstCount / total;
        const secondRatio = secondCount / total;

        if (firstRatio > 0.5) return 'first_person';
        if (secondRatio > 0.3) return 'second_person';
        if (firstRatio > 0.2 && secondRatio > 0.2) return 'mixed';
        return 'third_person';
    }

    private analyzeTenseDominance(text: string): StyleProfile['tenseDominance'] {
        const pastPatterns = ['했다', '였다', '았다', '었다'];
        const presentPatterns = ['한다', '이다', '는다', '다'];
        const futurePatterns = ['할 것이다', '될 것이다', '하겠다', '되겠다'];

        const pastCount = this.countPatterns(text, pastPatterns);
        const presentCount = this.countPatterns(text, presentPatterns);
        const futureCount = this.countPatterns(text, futurePatterns);

        const total = pastCount + presentCount + futureCount;
        if (total === 0) return 'present';

        const maxCount = Math.max(pastCount, presentCount, futureCount);
        const maxRatio = maxCount / total;

        if (maxRatio < 0.5) return 'mixed';
        if (maxCount === pastCount) return 'past';
        if (maxCount === futureCount) return 'future';
        return 'present';
    }

    /**
     * 어휘적 특성 분석
     */
    private analyzeVocabularyFeatures(text: string): Partial<StyleProfile> {
        const vocabularyLevel = this.analyzeVocabularyLevel(text);
        const technicalTerms = this.countTechnicalTerms(text);
        const foreignWords = this.countForeignWords(text);
        const honorificUsage = this.analyzeHonorificUsage(text);

        return {
            vocabularyLevel,
            technicalTerms,
            foreignWords,
            honorificUsage
        };
    }

    private analyzeVocabularyLevel(text: string): StyleProfile['vocabularyLevel'] {
        const simpleWords = ['하다', '되다', '있다', '없다', '좋다', '나쁘다'];
        const intermediateWords = ['발전', '변화', '영향', '결과', '원인', '방법'];
        const advancedWords = ['혁신', '패러다임', '메커니즘', '체계', '구조적', '본질적'];
        const expertWords = ['인식론적', '형이상학적', '실증주의', '구조주의', '포스트모던'];

        const simpleCount = this.countPatterns(text, simpleWords);
        const intermediateCount = this.countPatterns(text, intermediateWords);
        const advancedCount = this.countPatterns(text, advancedWords);
        const expertCount = this.countPatterns(text, expertWords);

        const wordCounts = [simpleCount, intermediateCount, advancedCount, expertCount];
        const maxIndex = wordCounts.indexOf(Math.max(...wordCounts));

        const levels: StyleProfile['vocabularyLevel'][] = ['simple', 'intermediate', 'advanced', 'expert'];
        return levels[maxIndex] !== undefined ? levels[maxIndex] : 'common';
    }

    private countTechnicalTerms(text: string): number {
        const technicalPatterns = ['시스템', '프로세스', '알고리즘', '데이터베이스', '네트워크', '인터페이스'];
        return this.countPatterns(text, technicalPatterns);
    }

    private countForeignWords(text: string): number {
        // 영어 단어 패턴 감지 (간단한 구현)
        const foreignWordPattern = /[a-zA-Z]{3,}/g;
        return (text.match(foreignWordPattern) || []).length;
    }

    private analyzeHonorificUsage(text: string): StyleProfile['honorificUsage'] {
        const honorificCount = this.countPatterns(text, this.honorificPatterns);
        const totalSentences = text.split(/[.!?]/).length;

        if (totalSentences === 0) return 'none';

        const honorificRatio = honorificCount / totalSentences;

        if (honorificRatio >= 0.8) return 'extensive';
        if (honorificRatio >= 0.6) return 'frequent';
        if (honorificRatio >= 0.3) return 'moderate';
        if (honorificRatio > 0) return 'minimal';
        return 'none';
    }

    /**
     * 문장 구조 분석
     */
    private analyzeSentenceFeatures(text: string): Partial<StyleProfile> {
        const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);

        const sentenceComplexity = this.analyzeSentenceComplexity(text);
        const averageClausesPerSentence = this.calculateAverageClausesPerSentence(sentences);
        const questionSentences = (text.match(/\?/g) || []).length;
        const exclamatorySentences = (text.match(/!/g) || []).length;

        return {
            sentenceComplexity,
            averageClausesPerSentence,
            questionSentences,
            exclamatorySentences
        };
    }

    private analyzeSentenceComplexity(text: string): StyleProfile['sentenceComplexity'] {
        const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
        let simpleCount = 0;
        let compoundCount = 0;
        let complexCount = 0;

        sentences.forEach(sentence => {
            const conjunctions = (sentence.match(/그리고|하지만|그러나|따라서|그러므로/g) || []).length;
            const subordinators = (sentence.match(/때문에|경우에|만약에|비록|~지만/g) || []).length;
            const clauses = sentence.split(/,|;/).length;

            if (conjunctions === 0 && subordinators === 0 && clauses <= 2) {
                simpleCount++;
            } else if (conjunctions > 0 && subordinators === 0) {
                compoundCount++;
            } else if (subordinators > 0) {
                complexCount++;
            }
        });

        const total = sentences.length;
        const simpleRatio = simpleCount / total;
        const compoundRatio = compoundCount / total;
        const complexRatio = complexCount / total;

        if (simpleRatio > 0.6) return 'simple';
        if (compoundRatio > 0.4) return 'compound';
        if (complexRatio > 0.4) return 'complex';
        return 'mixed';
    }

    private calculateAverageClausesPerSentence(sentences: string[]): number {
        const totalClauses = sentences.reduce((sum, sentence) => {
            return sum + sentence.split(/,|;/).length;
        }, 0);
        return totalClauses / sentences.length;
    }

    /**
     * 수사법 분석
     */
    private analyzeRhetoricalFeatures(text: string): Partial<StyleProfile> {
        const rhetoricalDevices = this.identifyRhetoricalDevices(text);
        const metaphorUsage = this.countMetaphors(text);
        const repetitionPatterns = this.identifyRepetitionPatterns(text);

        return {
            rhetoricalDevices,
            metaphorUsage,
            repetitionPatterns
        };
    }

    private identifyRhetoricalDevices(text: string): string[] {
        const devices: string[] = [];

        // 반복법
        if (this.hasRepetition(text)) devices.push('반복법');

        // 대조법
        if (this.hasContrast(text)) devices.push('대조법');

        // 의문법
        if ((text.match(/\?/g) || []).length > 0) devices.push('의문법');

        // 감탄법
        if ((text.match(/!/g) || []).length > 0) devices.push('감탄법');

        // 점층법
        if (this.hasClimax(text)) devices.push('점층법');

        return devices;
    }

    private hasRepetition(text: string): boolean {
        const words = text.split(/\s+/);
        const wordCounts: { [key: string]: number } = {};

        words.forEach(word => {
            const cleanWord = word.replace(/[^\w가-힣]/g, '');
            if (cleanWord.length > 2) {
                wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
            }
        });

        return Object.values(wordCounts).some(count => count >= 3);
    }

    private hasContrast(text: string): boolean {
        const contrastWords = ['반면', '그러나', '하지만', '대조적으로', '반대로'];
        return this.countPatterns(text, contrastWords) > 0;
    }

    private hasClimax(text: string): boolean {
        const climaxWords = ['더 나아가', '뿐만 아니라', '게다가', '더욱이', '특히'];
        return this.countPatterns(text, climaxWords) > 0;
    }

    private countMetaphors(text: string): number {
        const metaphorPatterns = ['마치', '처럼', '같이', '와 같은', '비유하면'];
        return this.countPatterns(text, metaphorPatterns);
    }

    private identifyRepetitionPatterns(text: string): string[] {
        const patterns: string[] = [];
        const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);

        // 문장 시작 반복 패턴
        const startWords: { [key: string]: number } = {};
        sentences.forEach(sentence => {
            const firstWord = sentence.trim().split(/\s+/)[0];
            if (firstWord && firstWord.length > 1) {
                startWords[firstWord] = (startWords[firstWord] || 0) + 1;
            }
        });

        Object.entries(startWords).forEach(([word, count]) => {
            if (count >= 2) {
                patterns.push(`문장 시작 반복: "${word}"`);
            }
        });

        return patterns;
    }

    /**
     * 논조와 관점 분석
     */
    private analyzeArgumentativeFeatures(text: string): Partial<StyleProfile> {
        const argumentativeStance = this.analyzeArgumentativeStance(text);
        const certaintyLevel = this.analyzeCertaintyLevel(text);
        const subjectivity = this.analyzeSubjectivity(text);

        return {
            argumentativeStance,
            certaintyLevel,
            subjectivity
        };
    }

    private analyzeArgumentativeStance(text: string): StyleProfile['argumentativeStance'] {
        const supportWords = ['찬성', '지지', '동의', '옳다', '긍정적'];
        const opposeWords = ['반대', '반박', '거부', '틀리다', '부정적'];
        const neutralWords = ['중립', '객관적', '균형', '고려'];

        const supportCount = this.countPatterns(text, supportWords);
        const opposeCount = this.countPatterns(text, opposeWords);
        const neutralCount = this.countPatterns(text, neutralWords);

        const maxCount = Math.max(supportCount, opposeCount, neutralCount);

        if (maxCount === 0) return 'neutral';
        if (maxCount === neutralCount) return 'neutral';
        if (maxCount === supportCount) {
            return supportCount > opposeCount * 2 ? 'strongly_for' : 'for';
        }
        return opposeCount > supportCount * 2 ? 'strongly_against' : 'against';
    }

    private analyzeCertaintyLevel(text: string): StyleProfile['certaintyLevel'] {
        const uncertainWords = ['아마도', '가능하다', '것 같다', '추정', '예상'];
        const cautiousWords = ['조심스럽게', '신중하게', '혹시', '만약'];
        const confidentWords = ['확실히', '분명히', '틀림없이', '당연히'];
        const absoluteWords = ['절대적으로', '완전히', '100%', '반드시'];

        const uncertainCount = this.countPatterns(text, uncertainWords);
        const cautiousCount = this.countPatterns(text, cautiousWords);
        const confidentCount = this.countPatterns(text, confidentWords);
        const absoluteCount = this.countPatterns(text, absoluteWords);

        const scores = [uncertainCount, cautiousCount, confidentCount, absoluteCount];
        const maxIndex = scores.indexOf(Math.max(...scores));

        const levels: StyleProfile['certaintyLevel'][] = ['uncertain', 'cautious', 'confident', 'absolute'];
        return levels[maxIndex] || 'confident';
    }

    private analyzeSubjectivity(text: string): StyleProfile['subjectivity'] {
        const objectiveWords = ['사실', '데이터', '통계', '연구', '결과'];
        const subjectiveWords = ['생각', '느낌', '의견', '개인적으로', '주관적'];

        const objectiveCount = this.countPatterns(text, objectiveWords);
        const subjectiveCount = this.countPatterns(text, subjectiveWords);

        const total = objectiveCount + subjectiveCount;
        if (total === 0) return 'balanced';

        const objectiveRatio = objectiveCount / total;

        if (objectiveRatio >= 0.8) return 'very_objective';
        if (objectiveRatio >= 0.6) return 'objective';
        if (objectiveRatio >= 0.4) return 'balanced';
        if (objectiveRatio >= 0.2) return 'subjective';
        return 'very_subjective';
    }

    /**
     * 구조적 특성 분석
     */
    private analyzeStructuralFeatures(text: string): Partial<StyleProfile> {
        const transitionWords = this.extractTransitionWords(text);
        const logicalStructure = this.analyzeLogicalStructure(text);
        const conclusionStyle = this.analyzeConclusionStyle(text);

        return {
            transitionWords,
            logicalStructure,
            conclusionStyle
        };
    }

    private extractTransitionWords(text: string): string[] {
        const found = this.transitionWords.filter(word => text.includes(word));
        return found;
    }

    private analyzeLogicalStructure(text: string): StyleProfile['logicalStructure'] {
        const chronologicalWords = ['먼저', '다음에', '그 후', '마지막으로', '처음에'];
        const spatialWords = ['여기서', '거기서', '위에', '아래에', '옆에'];
        const importanceWords = ['가장 중요한', '주요한', '핵심적인', '우선적으로'];
        const compareWords = ['비교하면', '대조적으로', '반면에', '마찬가지로'];
        const causalWords = ['때문에', '결과적으로', '원인은', '영향을 미친'];

        const scores = {
            chronological: this.countPatterns(text, chronologicalWords),
            spatial: this.countPatterns(text, spatialWords),
            importance: this.countPatterns(text, importanceWords),
            compare_contrast: this.countPatterns(text, compareWords),
            cause_effect: this.countPatterns(text, causalWords)
        };

        return Object.keys(scores).reduce((a, b) =>
            scores[a as keyof typeof scores] > scores[b as keyof typeof scores] ? a : b) as StyleProfile['logicalStructure'];
    }

    private analyzeConclusionStyle(text: string): StyleProfile['conclusionStyle'] {
        const lastSentences = text.split(/[.!?]/).slice(-2).join('');

        if (lastSentences.includes('요약하면') || lastSentences.includes('정리하면')) return 'summary';
        if (lastSentences.includes('해야 한다') || lastSentences.includes('행동')) return 'call_to_action';
        if (lastSentences.includes('?')) return 'question';
        if (lastSentences.includes('"') || lastSentences.includes('말했듯이')) return 'quote';
        if (lastSentences.includes('될 것이다') || lastSentences.includes('예상')) return 'prediction';

        return 'summary';
    }

    /**
     * 고유 특성 분석
     */
    private analyzeUniqueFeatures(text: string): Partial<StyleProfile> {
        const uniquePhrases = this.extractUniquePhrases(text);
        const characteristicExpressions = this.extractCharacteristicExpressions(text);
        const punctuationPatterns = this.analyzePunctuationPatterns(text);

        return {
            uniquePhrases,
            characteristicExpressions,
            punctuationPatterns
        };
    }

    private extractUniquePhrases(text: string): string[] {
        // 3글자 이상의 고유한 표현들을 추출
        const words = text.split(/\s+/);
        const phrases: { [key: string]: number } = {};

        for (let i = 0; i < words.length - 1; i++) {
            const phrase = words.slice(i, i + 2).join(' ');
            if (phrase.length >= 3) {
                phrases[phrase] = (phrases[phrase] || 0) + 1;
            }
        }

        return Object.entries(phrases)
            .filter(([_, count]) => count >= 2)
            .map(([phrase, _]) => phrase)
            .slice(0, 5);
    }

    private extractCharacteristicExpressions(text: string): string[] {
        const expressions: string[] = [];

        // 감탄사나 특별한 표현들
        const emotiveExpressions = text.match(/아!|오!|우와!|헉!|음.../g) || [];
        expressions.push(...emotiveExpressions);

        // 관용어나 숙어
        const idioms = ['그야말로', '말할 나위 없이', '두말할 나위 없이'];
        idioms.forEach(idiom => {
            if (text.includes(idiom)) expressions.push(idiom);
        });

        return expressions.slice(0, 5);
    }

    private analyzePunctuationPatterns(text: string): any {
        return {
            exclamationFrequency: (text.match(/!/g) || []).length,
            questionFrequency: (text.match(/\?/g) || []).length,
            ellipsisUsage: (text.match(/\.\.\./g) || []).length,
            dashUsage: (text.match(/--/g) || []).length,
            parenthesesUsage: (text.match(/\(/g) || []).length
        };
    }

    /**
     * 문맥적 특성 분석
     */
    private analyzeContextualFeatures(text: string, context?: string): Partial<StyleProfile> {
        const targetAudience = this.analyzeTargetAudience(text);
        const purpose = this.analyzePurpose(text);
        const domain = this.analyzeDomain(text, context);

        return {
            targetAudience,
            purpose,
            domain
        };
    }

    private analyzeTargetAudience(text: string): StyleProfile['targetAudience'] {
        const childrenWords = ['아이들', '어린이', '쉽게 말하면'];
        const teenWords = ['청소년', '학생들', '젊은이'];
        const adultWords = ['성인', '직장인', '일반인'];
        const elderlyWords = ['어르신', '노인분들', '연장자'];
        const expertWords = ['전문가', '연구자', '학자'];

        const scores = {
            children: this.countPatterns(text, childrenWords),
            teenagers: this.countPatterns(text, teenWords),
            adults: this.countPatterns(text, adultWords),
            elderly: this.countPatterns(text, elderlyWords),
            experts: this.countPatterns(text, expertWords)
        };

        const maxKey = Object.keys(scores).reduce((a, b) =>
            scores[a as keyof typeof scores] > scores[b as keyof typeof scores] ? a : b);

        return maxKey as StyleProfile['targetAudience'] || 'general';
    }

    private analyzePurpose(text: string): StyleProfile['purpose'] {
        const informWords = ['정보', '설명', '알려드리다', '소개'];
        const persuadeWords = ['설득', '권유', '추천', '제안'];
        const entertainWords = ['재미있는', '흥미로운', '즐거운'];
        const instructWords = ['방법', '단계', '과정', '절차'];
        const expressWords = ['느낌', '감정', '생각', '개인적'];

        const scores = {
            inform: this.countPatterns(text, informWords),
            persuade: this.countPatterns(text, persuadeWords),
            entertain: this.countPatterns(text, entertainWords),
            instruct: this.countPatterns(text, instructWords),
            express: this.countPatterns(text, expressWords)
        };

        const maxKey = Object.keys(scores).reduce((a, b) =>
            scores[a as keyof typeof scores] > scores[b as keyof typeof scores] ? a : b);

        return maxKey as StyleProfile['purpose'];
    }

    private analyzeDomain(text: string, context?: string): StyleProfile['domain'] {
        if (context) {
            if (context.includes('academic') || context.includes('학술')) return 'academic';
            if (context.includes('business') || context.includes('비즈니스')) return 'business';
            if (context.includes('technical') || context.includes('기술')) return 'technical';
            if (context.includes('creative') || context.includes('창작')) return 'creative';
        }

        const academicWords = ['연구', '논문', '이론', '가설', '실험'];
        const businessWords = ['매출', '수익', '고객', '마케팅', '전략'];
        const technicalWords = ['시스템', '프로그램', '데이터', '알고리즘'];
        const creativeWords = ['상상', '창작', '예술', '작품', '영감'];

        const scores = {
            academic: this.countPatterns(text, academicWords),
            business: this.countPatterns(text, businessWords),
            technical: this.countPatterns(text, technicalWords),
            creative: this.countPatterns(text, creativeWords)
        };

        const maxKey = Object.keys(scores).reduce((a, b) =>
            scores[a as keyof typeof scores] > scores[b as keyof typeof scores] ? a : b);

        return scores[maxKey as keyof typeof scores] > 0 ? maxKey as StyleProfile['domain'] : 'casual';
    }

    /**
     * 유틸리티 메서드들
     */
    private countPatterns(text: string, patterns: string[]): number {
        return patterns.reduce((count, pattern) => {
            const regex = new RegExp(pattern, 'g');
            return count + (text.match(regex) || []).length;
        }, 0);
    }

    private calculateConfidence(text: string, profile: StyleProfile): number {
        // 텍스트 길이, 분석된 특성의 일관성 등을 기반으로 신뢰도 계산
        const textLength = text.length;
        let confidence = 0.5; // 기본 신뢰도

        // 텍스트 길이에 따른 신뢰도 조정
        if (textLength > 1000) confidence += 0.3;
        else if (textLength > 500) confidence += 0.2;
        else if (textLength > 200) confidence += 0.1;

        // 분석된 특성의 일관성 평가
        if (profile.rhetoricalDevices && profile.rhetoricalDevices.length > 0) confidence += 0.1;
        if (profile.uniquePhrases && profile.uniquePhrases.length > 0) confidence += 0.1;

        return Math.min(confidence, 0.95);
    }

    private extractKeyCharacteristics(profile: StyleProfile): string[] {
        const characteristics: string[] = [];

        characteristics.push(`격식도: ${profile.formality}`);
        characteristics.push(`문체: ${profile.writingStyle}`);
        characteristics.push(`어휘 수준: ${profile.vocabularyLevel}`);
        characteristics.push(`감정적 톤: ${profile.emotionalTone}`);
        characteristics.push(`문장 복잡도: ${profile.sentenceComplexity}`);

        if (profile.rhetoricalDevices && profile.rhetoricalDevices.length > 0) {
            characteristics.push(`수사법: ${profile.rhetoricalDevices.join(', ')}`);
        }

        return characteristics;
    }

    private generateStyleSignature(profile: StyleProfile): string {
        const key_traits = [
            profile.formality,
            profile.writingStyle,
            profile.emotionalTone,
            profile.vocabularyLevel,
            profile.sentenceComplexity
        ];

        return key_traits.join('-').toUpperCase();
    }

    private generateRecommendations(profile: StyleProfile): string[] {
        const recommendations: string[] = [];

        if (profile.sentenceComplexity === 'simple') {
            recommendations.push('문장의 다양성을 위해 복합문장 사용을 고려해보세요');
        }

        if (profile.vocabularyLevel === 'simple') {
            recommendations.push('어휘의 풍부함을 위해 다양한 표현을 사용해보세요');
        }

        if (profile.rhetoricalDevices && profile.rhetoricalDevices.length === 0) {
            recommendations.push('수사법 사용으로 글의 표현력을 높여보세요');
        }

        if (profile.emotionalTone === 'neutral') {
            recommendations.push('감정적 표현을 통해 독자와의 공감대를 형성해보세요');
        }

        return recommendations;
    }

    /**
     * 스타일 기반 새 글 생성 준비
     */
    public prepareStyleCloning(profile: StyleProfile): any {
        return {
            structuralGuidelines: {
                targetWordCount: profile.wordCount,
                paragraphCount: profile.paragraphCount,
                averageWordsPerSentence: profile.averageWordsPerSentence,
                averageSentencesPerParagraph: profile.averageSentencesPerParagraph
            },
            linguisticGuidelines: {
                formality: profile.formality,
                politeness: profile.politeness,
                emotionalTone: profile.emotionalTone,
                intensity: profile.intensity,
                honorificUsage: profile.honorificUsage
            },
            stylisticGuidelines: {
                writingStyle: profile.writingStyle,
                voiceType: profile.voiceType,
                tenseDominance: profile.tenseDominance,
                vocabularyLevel: profile.vocabularyLevel,
                sentenceComplexity: profile.sentenceComplexity
            },
            rhetoricalGuidelines: {
                rhetoricalDevices: profile.rhetoricalDevices,
                transitionWords: profile.transitionWords,
                logicalStructure: profile.logicalStructure,
                conclusionStyle: profile.conclusionStyle
            },
            uniqueElements: {
                characteristicExpressions: profile.characteristicExpressions,
                punctuationPatterns: profile.punctuationPatterns,
                uniquePhrases: profile.uniquePhrases
            }
        };
    }
}

export const styleAnalysisEngine = new StyleAnalysisEngine();
export default styleAnalysisEngine;
