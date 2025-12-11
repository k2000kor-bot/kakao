/**
 * Conversation Style Analyzer
 * 실제 대화 스타일, 논리 패턴, 말투 분석 서비스
 * 
 * Features:
 * - 개인별 말투 패턴 분석
 * - 논리 구조 분석
 * - 감정 표현 방식 분석
 * - 문체 일관성 분석
 * - 대화 논리 흐름 분석
 */

export interface SpeakingStyle {
    formality_level: number; // 격식도 (0: 반말, 1: 존댓말)
    sentence_length: 'short' | 'medium' | 'long';
    emotional_expression: 'direct' | 'indirect' | 'moderate';
    logical_pattern: 'deductive' | 'inductive' | 'narrative' | 'questioning';
    conversation_role: 'leader' | 'supporter' | 'mediator' | 'observer';
    characteristic_phrases: string[];
    verbal_habits: string[];
    tone_indicators: {
        concern: number;
        confidence: number;
        enthusiasm: number;
        caution: number;
    };
}

export interface ConversationLogic {
    argument_structure: 'linear' | 'circular' | 'branched' | 'fragmented';
    evidence_usage: 'factual' | 'experiential' | 'emotional' | 'authoritative';
    persuasion_style: 'rational' | 'emotional' | 'social' | 'mixed';
    decision_making: 'quick' | 'deliberate' | 'collaborative' | 'hesitant';
    conflict_resolution: 'direct' | 'diplomatic' | 'avoidant' | 'escalating';
    topic_transitions: 'smooth' | 'abrupt' | 'logical' | 'associative';
}

export interface PersonaProfile {
    speaker_id: string;
    speaking_style: SpeakingStyle;
    conversation_logic: ConversationLogic;
    signature_expressions: string[];
    emotional_vocabulary: string[];
    technical_vocabulary: string[];
    social_markers: string[];
    consistency_score: number;
    sample_messages: string[];
}

export interface StyleBasedMessage {
    content: string;
    style_confidence: number;
    logic_flow: string[];
    emotional_tone: string;
    formality_match: number;
    characteristic_elements: string[];
    natural_flow_score: number;
}

export class ConversationStyleAnalyzer {
    private speakerProfiles: Map<string, PersonaProfile> = new Map();
    private conversationPatterns: Map<string, ConversationLogic> = new Map();

    // 한국어 특화 패턴 데이터
    private koreanStylePatterns = {
        formality: {
            honorific: ['습니다', '있습니다', '드립니다', '께서', '님', '분'],
            polite: ['해요', '이에요', '가요', '세요', '네요', '죠'],
            casual: ['해', '야', '어', '지', '다', '냐', '니'],
            intimate: ['응', '어', '그래', '맞아', '아니야']
        },
        sentence_endings: {
            decisive: ['습니다', '해야 합니다', '결정했습니다', '확실합니다'],
            questioning: ['까요?', '할까요?', '어떨까요?', '어떻게 생각하세요?'],
            suggesting: ['어떨까요', '하면 좋겠어요', '제안드립니다', '고려해보세요'],
            emotional: ['걱정돼요', '기쁩니다', '안타깝네요', '다행이에요']
        },
        logical_connectors: {
            cause_effect: ['그래서', '따라서', '그러므로', '때문에', '덕분에'],
            contrast: ['하지만', '그런데', '그러나', '반면에', '오히려'],
            addition: ['그리고', '또한', '게다가', '더불어', '아울러'],
            sequence: ['먼저', '다음에', '그 다음', '마지막으로', '결국']
        },
        emotional_expressions: {
            concern: ['걱정', '우려', '염려', '불안', '조심', '신중'],
            excitement: ['기대', '설레', '좋아', '훌륭', '멋져', '대박'],
            agreement: ['맞아', '동감', '그래', '옳아', '찬성', '공감'],
            disagreement: ['아니', '글쎄', '의문', '반대', '다르게', '아닌 것 같아']
        },
        decision_patterns: {
            authoritative: ['결정', '지시', '시행', '승인', '채택'],
            collaborative: ['함께', '같이', '협의', '상의', '논의'],
            tentative: ['일단', '우선', '생각해보고', '검토', '고민']
        }
    };

    /**
     * 개별 발화자의 스타일 분석
     */
    analyzeSpeakerStyle(messages: any[], speakerId: string): PersonaProfile {
        const speakerMessages = messages.filter(msg => msg.sender === speakerId);

        if (speakerMessages.length === 0) {
            return this.createDefaultProfile(speakerId);
        }

        // 메시지 객체에서 텍스트 내용만 추출
        const messageContents = speakerMessages.map(msg => {
            if (typeof msg === 'string') {
                return msg;
            }
            return msg.content || msg.message || msg.text || String(msg);
        }).filter(content => typeof content === 'string' && content.trim().length > 0);

        const speakingStyle = this.analyzeSpeakingStyle(messageContents);
        const conversationLogic = this.analyzeConversationLogic(messageContents);
        const signatureExpressions = this.extractCharacteristicPhrases(messageContents);
        const vocabularyAnalysis = this.analyzeVocabulary(messageContents);

        const profile: PersonaProfile = {
            speaker_id: speakerId,
            speaking_style: speakingStyle,
            conversation_logic: conversationLogic,
            signature_expressions: signatureExpressions,
            emotional_vocabulary: vocabularyAnalysis.emotional,
            technical_vocabulary: vocabularyAnalysis.technical,
            social_markers: vocabularyAnalysis.social,
            consistency_score: this.calculateConsistencyScore(messageContents),
            sample_messages: speakerMessages.slice(-5).map(msg => msg.content)
        };

        this.speakerProfiles.set(speakerId, profile);
        return profile;
    }

    /**
     * 말하기 스타일 분석
     */
    private analyzeSpeakingStyle(messages: any[]): SpeakingStyle {
        const contents = messages.map(msg => {
            if (typeof msg === 'string') {
                return msg;
            }
            return msg?.content || msg?.message || msg?.text || String(msg);
        }).filter(content => typeof content === 'string' && content.trim().length > 0);

        // 빈 배열 처리
        if (contents.length === 0) {
            return this.createDefaultSpeakingStyle();
        }

        // 격식도 분석
        const formalityLevel = this.analyzeFormalityLevel(contents);

        // 문장 길이 분석
        const sentenceLength = this.analyzeSentenceLength(contents);

        // 감정 표현 방식 분석
        const emotionalExpression = this.analyzeEmotionalExpression(contents);

        // 논리 패턴 분석
        const logicalPattern = this.analyzeLogicalPattern(contents);

        // 대화 역할 분석
        const conversationRole = this.analyzeConversationRole(contents);

        // 특징적 표현 추출
        const characteristicPhrases = this.extractCharacteristicPhrases(contents);

        // 말투 습관 분석
        const verbalHabits = this.analyzeVerbalHabits(contents);

        // 어조 지표 분석
        const toneIndicators = this.analyzeToneIndicators(contents);

        return {
            formality_level: formalityLevel,
            sentence_length: sentenceLength,
            emotional_expression: emotionalExpression,
            logical_pattern: logicalPattern,
            conversation_role: conversationRole,
            characteristic_phrases: characteristicPhrases,
            verbal_habits: verbalHabits,
            tone_indicators: toneIndicators
        };
    }

    /**
     * 격식도 분석
     */
    private analyzeFormalityLevel(contents: string[]): number {
        if (!contents || contents.length === 0) {
            return 0.5; // 기본값
        }

        let formalScore = 0;
        let totalPatterns = 0;

        for (const content of contents) {
            // 타입 검증
            if (typeof content !== 'string') {
                console.warn('Invalid content type in analyzeFormalityLevel:', typeof content, content);
                continue;
            }

            // 존댓말 패턴
            for (const pattern of this.koreanStylePatterns.formality.honorific) {
                if (content.includes(pattern)) {
                    formalScore += 3;
                    totalPatterns += 3;
                }
            }

            // 정중한 말투
            for (const pattern of this.koreanStylePatterns.formality.polite) {
                if (content.includes(pattern)) {
                    formalScore += 2;
                    totalPatterns += 2;
                }
            }

            // 반말 패턴
            for (const pattern of this.koreanStylePatterns.formality.casual) {
                if (content.includes(pattern)) {
                    formalScore += 0;
                    totalPatterns += 2;
                }
            }
        }

        return totalPatterns > 0 ? formalScore / totalPatterns : 0.5;
    }

    /**
     * 문장 길이 분석
     */
    private analyzeSentenceLength(contents: string[]): 'short' | 'medium' | 'long' {
        if (!contents || contents.length === 0) {
            return 'medium';
        }
        const avgLength = contents.reduce((sum, content) => sum + content.length, 0) / contents.length;

        if (avgLength < 20) return 'short';
        if (avgLength < 50) return 'medium';
        return 'long';
    }

    /**
     * 감정 표현 방식 분석
     */
    private analyzeEmotionalExpression(contents: string[]): 'direct' | 'indirect' | 'moderate' {
        let directCount = 0;
        let indirectCount = 0;

        for (const content of contents) {
            // 타입 검증
            if (typeof content !== 'string') {
                console.warn('Invalid content type in analyzeEmotionalExpression:', typeof content, content);
                continue;
            }

            // 직접적 감정 표현
            const directEmotions = ['좋아요', '싫어요', '화나요', '기뻐요', '슬퍼요'];
            if (directEmotions.some(emotion => content.includes(emotion))) {
                directCount++;
            }

            // 간접적 감정 표현
            const indirectEmotions = ['것 같아요', '느낌이', '인상이', '생각이'];
            if (indirectEmotions.some(expression => content.includes(expression))) {
                indirectCount++;
            }
        }

        if (directCount > indirectCount * 1.5) return 'direct';
        if (indirectCount > directCount * 1.5) return 'indirect';
        return 'moderate';
    }

    /**
     * 논리 패턴 분석
     */
    private analyzeLogicalPattern(contents: string[]): 'deductive' | 'inductive' | 'narrative' | 'questioning' {
        let deductiveScore = 0;
        let inductiveScore = 0;
        let narrativeScore = 0;
        let questioningScore = 0;

        for (const content of contents) {
            // 연역적 패턴 (결론 -> 근거)
            if (content.includes('따라서') || content.includes('그러므로') || content.includes('결론적으로')) {
                deductiveScore++;
            }

            // 귀납적 패턴 (사례 -> 결론)
            if (content.includes('예를 들어') || content.includes('경우를 보면') || content.includes('이런 점에서')) {
                inductiveScore++;
            }

            // 서사적 패턴
            if (content.includes('먼저') || content.includes('그 다음') || content.includes('마지막으로')) {
                narrativeScore++;
            }

            // 질문형 패턴
            if (content.includes('?') || content.includes('어떻게') || content.includes('왜')) {
                questioningScore++;
            }
        }

        const maxScore = Math.max(deductiveScore, inductiveScore, narrativeScore, questioningScore);

        if (maxScore === deductiveScore) return 'deductive';
        if (maxScore === inductiveScore) return 'inductive';
        if (maxScore === narrativeScore) return 'narrative';
        return 'questioning';
    }

    /**
     * 대화 역할 분석
     */
    private analyzeConversationRole(contents: string[]): 'leader' | 'supporter' | 'mediator' | 'observer' {
        let leaderScore = 0;
        let supporterScore = 0;
        let mediatorScore = 0;
        let observerScore = 0;

        for (const content of contents) {
            // 리더십 표현
            if (content.includes('결정') || content.includes('지시') || content.includes('진행')) {
                leaderScore++;
            }

            // 지지 표현
            if (content.includes('동의') || content.includes('찬성') || content.includes('좋은 생각')) {
                supporterScore++;
            }

            // 중재 표현
            if (content.includes('양쪽') || content.includes('절충') || content.includes('타협')) {
                mediatorScore++;
            }

            // 관찰 표현
            if (content.includes('보니까') || content.includes('관찰') || content.includes('지켜봐')) {
                observerScore++;
            }
        }

        const maxScore = Math.max(leaderScore, supporterScore, mediatorScore, observerScore);

        if (maxScore === leaderScore) return 'leader';
        if (maxScore === supporterScore) return 'supporter';
        if (maxScore === mediatorScore) return 'mediator';
        return 'observer';
    }

    /**
     * 특징적 표현 추출
     */
    private extractCharacteristicPhrases(contents: string[]): string[] {
        const phraseCount: Map<string, number> = new Map();

        for (const content of contents) {
            // 타입 검증: content가 문자열인지 확인
            if (typeof content !== 'string') {
                console.warn('Invalid content type in extractCharacteristicPhrases:', typeof content, content);
                continue;
            }

            // 2-3단어 구문 추출
            const words = content.split(/\s+/);
            for (let i = 0; i < words.length - 1; i++) {
                const phrase = words.slice(i, i + 2).join(' ');
                if (phrase.length > 3) {
                    phraseCount.set(phrase, (phraseCount.get(phrase) || 0) + 1);
                }
            }
        }

        // 빈도 높은 구문 반환
        return Array.from(phraseCount.entries())
            .filter(([phrase, count]) => count >= 2)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([phrase]) => phrase);
    }

    /**
     * 말투 습관 분석
     */
    private analyzeVerbalHabits(contents: string[]): string[] {
        const habits = [];

        // 문장 끝 습관
        const endingPatterns = ['네요', '요', '죠', '거든요', '잖아요'];
        for (const pattern of endingPatterns) {
            const count = contents.filter(content => content.endsWith(pattern)).length;
            if (count >= 2) {
                habits.push(`자주 "${pattern}"로 끝냄`);
            }
        }

        // 시작 습관
        const startingPatterns = ['그런데', '그래서', '아무튼', '일단', '우선'];
        for (const pattern of startingPatterns) {
            const count = contents.filter(content => content.startsWith(pattern)).length;
            if (count >= 2) {
                habits.push(`"${pattern}"로 자주 시작`);
            }
        }

        // 간투사 습관
        const fillers = ['음', '어', '그', '뭐', '아'];
        for (const filler of fillers) {
            const count = contents.filter(content => content.includes(filler)).length;
            if (count >= contents.length * 0.3) {
                habits.push(`"${filler}" 자주 사용`);
            }
        }

        return habits;
    }

    /**
     * 어조 지표 분석
     */
    private analyzeToneIndicators(contents: string[]): {
        concern: number;
        confidence: number;
        enthusiasm: number;
        caution: number;
    } {
        let concern = 0;
        let confidence = 0;
        let enthusiasm = 0;
        let caution = 0;

        for (const content of contents) {
            // 걱정/우려 지표
            if (['걱정', '우려', '문제', '위험'].some(word => content.includes(word))) {
                concern += 0.2;
            }

            // 자신감 지표
            if (['확실', '분명', '틀림없', '당연'].some(word => content.includes(word))) {
                confidence += 0.2;
            }

            // 열정 지표
            if (['좋아', '기대', '흥미', '재미'].some(word => content.includes(word))) {
                enthusiasm += 0.2;
            }

            // 신중함 지표
            if (['신중', '조심', '차근차근', '천천히'].some(word => content.includes(word))) {
                caution += 0.2;
            }
        }

        const totalMessages = contents.length;
        return {
            concern: Math.min(1.0, concern / totalMessages),
            confidence: Math.min(1.0, confidence / totalMessages),
            enthusiasm: Math.min(1.0, enthusiasm / totalMessages),
            caution: Math.min(1.0, caution / totalMessages)
        };
    }

    /**
     * 대화 논리 분석
     */
    private analyzeConversationLogic(messages: any[]): ConversationLogic {
        const contents = messages.map(msg => {
            if (typeof msg === 'string') {
                return msg;
            }
            return msg?.content || msg?.message || msg?.text || String(msg);
        }).filter(content => typeof content === 'string' && content.trim().length > 0);

        // 빈 배열 처리
        if (contents.length === 0) {
            return {
                argument_structure: 'linear',
                evidence_usage: 'experiential',
                persuasion_style: 'mixed',
                decision_making: 'deliberate',
                conflict_resolution: 'diplomatic',
                topic_transitions: 'smooth'
            };
        }

        return {
            argument_structure: this.analyzeArgumentStructure(contents),
            evidence_usage: this.analyzeEvidenceUsage(contents),
            persuasion_style: this.analyzePersuasionStyle(contents),
            decision_making: this.analyzeDecisionMaking(contents),
            conflict_resolution: this.analyzeConflictResolution(contents),
            topic_transitions: this.analyzeTopicTransitions(contents)
        };
    }

    /**
     * 논증 구조 분석
     */
    private analyzeArgumentStructure(contents: string[]): 'linear' | 'circular' | 'branched' | 'fragmented' {
        let linearScore = 0;
        let circularScore = 0;
        let branchedScore = 0;

        for (const content of contents) {
            // 선형 구조 (순차적 논리)
            if (this.koreanStylePatterns.logical_connectors.sequence.some(conn => content.includes(conn))) {
                linearScore++;
            }

            // 순환 구조 (다시 언급)
            if (content.includes('다시') || content.includes('앞서') || content.includes('처음')) {
                circularScore++;
            }

            // 분기 구조 (대안 제시)
            if (content.includes('만약') || content.includes('다른 방법') || content.includes('대안')) {
                branchedScore++;
            }
        }

        const maxScore = Math.max(linearScore, circularScore, branchedScore);
        if (maxScore === 0) return 'fragmented';
        if (maxScore === linearScore) return 'linear';
        if (maxScore === circularScore) return 'circular';
        return 'branched';
    }

    /**
     * 증거 사용 방식 분석
     */
    private analyzeEvidenceUsage(contents: string[]): 'factual' | 'experiential' | 'emotional' | 'authoritative' {
        let factualScore = 0;
        let experientialScore = 0;
        let emotionalScore = 0;
        let authoritativeScore = 0;

        for (const content of contents) {
            // 사실적 증거
            if (['데이터', '통계', '수치', '자료'].some(word => content.includes(word))) {
                factualScore++;
            }

            // 경험적 증거
            if (['경험', '겪어봤', '해봤', '알고 있어'].some(word => content.includes(word))) {
                experientialScore++;
            }

            // 감정적 증거
            if (['느낌', '기분', '감정', '마음'].some(word => content.includes(word))) {
                emotionalScore++;
            }

            // 권위적 증거
            if (['규정', '법률', '정책', '지침'].some(word => content.includes(word))) {
                authoritativeScore++;
            }
        }

        const maxScore = Math.max(factualScore, experientialScore, emotionalScore, authoritativeScore);
        if (maxScore === factualScore) return 'factual';
        if (maxScore === experientialScore) return 'experiential';
        if (maxScore === emotionalScore) return 'emotional';
        return 'authoritative';
    }

    /**
     * 설득 스타일 분석
     */
    private analyzePersuasionStyle(contents: string[]): 'rational' | 'emotional' | 'social' | 'mixed' {
        let rationalScore = 0;
        let emotionalScore = 0;
        let socialScore = 0;

        for (const content of contents) {
            // 이성적 설득
            if (['논리적', '합리적', '이유', '근거'].some(word => content.includes(word))) {
                rationalScore++;
            }

            // 감정적 설득
            if (['공감', '이해', '느낌', '마음'].some(word => content.includes(word))) {
                emotionalScore++;
            }

            // 사회적 설득
            if (['모두', '함께', '우리', '공동'].some(word => content.includes(word))) {
                socialScore++;
            }
        }

        const total = rationalScore + emotionalScore + socialScore;
        if (total === 0) return 'mixed';

        const maxScore = Math.max(rationalScore, emotionalScore, socialScore);
        if (maxScore === rationalScore && rationalScore > total * 0.5) return 'rational';
        if (maxScore === emotionalScore && emotionalScore > total * 0.5) return 'emotional';
        if (maxScore === socialScore && socialScore > total * 0.5) return 'social';
        return 'mixed';
    }

    /**
     * 의사결정 방식 분석
     */
    private analyzeDecisionMaking(contents: string[]): 'quick' | 'deliberate' | 'collaborative' | 'hesitant' {
        let quickScore = 0;
        let deliberateScore = 0;
        let collaborativeScore = 0;
        let hesitantScore = 0;

        for (const content of contents) {
            // 빠른 결정
            if (['즉시', '바로', '당장', '결정'].some(word => content.includes(word))) {
                quickScore++;
            }

            // 신중한 결정
            if (['검토', '분석', '고려', '생각'].some(word => content.includes(word))) {
                deliberateScore++;
            }

            // 협력적 결정
            if (['같이', '함께', '상의', '협의'].some(word => content.includes(word))) {
                collaborativeScore++;
            }

            // 망설이는 결정
            if (['글쎄', '모르겠', '어려워', '고민'].some(word => content.includes(word))) {
                hesitantScore++;
            }
        }

        const maxScore = Math.max(quickScore, deliberateScore, collaborativeScore, hesitantScore);
        if (maxScore === quickScore) return 'quick';
        if (maxScore === deliberateScore) return 'deliberate';
        if (maxScore === collaborativeScore) return 'collaborative';
        return 'hesitant';
    }

    /**
     * 갈등 해결 방식 분석
     */
    private analyzeConflictResolution(contents: string[]): 'direct' | 'diplomatic' | 'avoidant' | 'escalating' {
        let directScore = 0;
        let diplomaticScore = 0;
        let avoidantScore = 0;
        let escalatingScore = 0;

        for (const content of contents) {
            // 직접적 해결
            if (['명확히', '분명히', '확실히'].some(word => content.includes(word))) {
                directScore++;
            }

            // 외교적 해결
            if (['양해', '이해', '조율', '절충'].some(word => content.includes(word))) {
                diplomaticScore++;
            }

            // 회피적 해결
            if (['나중에', '일단', '우선', '보류'].some(word => content.includes(word))) {
                avoidantScore++;
            }

            // 확대하는 경향
            if (['문제', '심각', '위험', '큰일'].some(word => content.includes(word))) {
                escalatingScore++;
            }
        }

        const maxScore = Math.max(directScore, diplomaticScore, avoidantScore, escalatingScore);
        if (maxScore === directScore) return 'direct';
        if (maxScore === diplomaticScore) return 'diplomatic';
        if (maxScore === avoidantScore) return 'avoidant';
        return 'escalating';
    }

    /**
     * 화제 전환 방식 분석
     */
    private analyzeTopicTransitions(contents: string[]): 'smooth' | 'abrupt' | 'logical' | 'associative' {
        let smoothScore = 0;
        let abruptScore = 0;
        let logicalScore = 0;
        let associativeScore = 0;

        for (const content of contents) {
            // 부드러운 전환
            if (['그런데', '한편', '또한'].some(word => content.includes(word))) {
                smoothScore++;
            }

            // 갑작스런 전환
            if (['그나저나', '아! 그리고', '참'].some(word => content.includes(word))) {
                abruptScore++;
            }

            // 논리적 전환
            if (['따라서', '그러므로', '이에 따라'].some(word => content.includes(word))) {
                logicalScore++;
            }

            // 연상적 전환
            if (['생각해보니', '그러고 보니', '떠올려보니'].some(word => content.includes(word))) {
                associativeScore++;
            }
        }

        const maxScore = Math.max(smoothScore, abruptScore, logicalScore, associativeScore);
        if (maxScore === smoothScore) return 'smooth';
        if (maxScore === abruptScore) return 'abrupt';
        if (maxScore === logicalScore) return 'logical';
        return 'associative';
    }

    /**
     * 어휘 분석
     */
    private analyzeVocabulary(messages: any[]): {
        emotional: string[];
        technical: string[];
        social: string[];
    } {
        const contents = messages.map(msg => msg.content);
        const allText = contents.join(' ');

        // 감정 어휘 추출
        const emotionalWords = [];
        for (const category of Object.values(this.koreanStylePatterns.emotional_expressions)) {
            for (const word of category) {
                if (allText.includes(word)) {
                    emotionalWords.push(word);
                }
            }
        }

        // 기술적 어휘 추출
        const technicalWords = [];
        const technicalPatterns = ['시공', '설계', '분담금', '계약', '공사', '건설'];
        for (const word of technicalPatterns) {
            if (allText.includes(word)) {
                technicalWords.push(word);
            }
        }

        // 사회적 어휘 추출
        const socialWords = [];
        const socialPatterns = ['조합', '총회', '회의', '의견', '합의', '결정'];
        for (const word of socialPatterns) {
            if (allText.includes(word)) {
                socialWords.push(word);
            }
        }

        return {
            emotional: Array.from(new Set(emotionalWords)),
            technical: Array.from(new Set(technicalWords)),
            social: Array.from(new Set(socialWords))
        };
    }

    /**
     * 일관성 점수 계산
     */
    private calculateConsistencyScore(messages: any[]): number {
        if (messages.length < 2) return 0.5;

        const contents = messages.map(msg => {
            if (typeof msg === 'string') {
                return msg;
            }
            return msg?.content || msg?.message || msg?.text || String(msg);
        }).filter(content => typeof content === 'string' && content.trim().length > 0);

        // 격식도 일관성
        const formalityLevels = contents.map(content => {
            if (typeof content !== 'string') {
                return 0.5;
            }
            let score = 0;
            if (this.koreanStylePatterns.formality.honorific.some(pattern => content.includes(pattern))) score += 2;
            if (this.koreanStylePatterns.formality.polite.some(pattern => content.includes(pattern))) score += 1;
            return score;
        });

        const formalityVariance = this.calculateVariance(formalityLevels);
        const formalityConsistency = 1.0 / (1.0 + formalityVariance);

        // 문장 길이 일관성
        const lengths = contents.map(content => content.length);
        const lengthVariance = this.calculateVariance(lengths);
        const lengthConsistency = 1.0 / (1.0 + lengthVariance / 100);

        return (formalityConsistency + lengthConsistency) / 2;
    }

    /**
     * 분산 계산
     */
    private calculateVariance(values: number[]): number {
        if (values.length === 0) return 0;

        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;

        return variance;
    }

    /**
     * 스타일 기반 메시지 생성
     */
    generateStyleBasedMessage(
        speakerId: string,
        context: string,
        recentMessages: any[],
        targetEmotion?: string
    ): StyleBasedMessage {
        const profile = this.speakerProfiles.get(speakerId);

        if (!profile) {
            return this.generateGenericMessage(context);
        }

        // 스타일 기반 메시지 템플릿 생성
        const messageTemplates = this.generateMessageTemplates(profile, context, targetEmotion);

        // 가장 적절한 템플릿 선택
        const bestTemplate = this.selectBestTemplate(messageTemplates, profile, recentMessages);

        // 스타일 요소 적용
        const styledMessage = this.applyStyleElements(bestTemplate, profile);

        // 자연스러운 흐름 점수 계산
        const naturalFlowScore = this.calculateNaturalFlowScore(styledMessage, recentMessages, profile);

        return {
            content: styledMessage,
            style_confidence: this.calculateStyleConfidence(styledMessage, profile),
            logic_flow: this.extractLogicFlow(styledMessage),
            emotional_tone: targetEmotion || 'neutral',
            formality_match: this.calculateFormalityMatch(styledMessage, profile),
            characteristic_elements: this.identifyCharacteristicElements(styledMessage, profile),
            natural_flow_score: naturalFlowScore
        };
    }

    /**
     * 메시지 템플릿 생성
     */
    private generateMessageTemplates(
        profile: PersonaProfile,
        context: string,
        targetEmotion?: string
    ): string[] {
        const templates = [];

        // 역할 기반 템플릿
        switch (profile.speaking_style.conversation_role) {
            case 'leader':
                templates.push(`${context}에 대해 결정해야 할 것 같습니다.`);
                templates.push(`이 문제를 해결하기 위해 다음과 같이 진행하겠습니다.`);
                break;
            case 'supporter':
                templates.push(`좋은 의견이네요. ${context}에 대해 동의합니다.`);
                templates.push(`그 방법이 효과적일 것 같아요.`);
                break;
            case 'mediator':
                templates.push(`양쪽 의견을 고려해서 ${context}를 검토해보면 좋겠어요.`);
                templates.push(`절충안을 찾아보는 것이 어떨까요?`);
                break;
            case 'observer':
                templates.push(`${context} 상황을 지켜보니 흥미롭네요.`);
                templates.push(`상황을 더 자세히 살펴볼 필요가 있을 것 같아요.`);
                break;
        }

        // 논리 패턴 기반 템플릿
        switch (profile.conversation_logic.argument_structure) {
            case 'linear':
                templates.push(`먼저 ${context}를 검토하고, 다음 단계를 진행하겠습니다.`);
                break;
            case 'circular':
                templates.push(`앞서 말씀드린 것처럼, ${context}에 대해 다시 생각해볼 필요가 있습니다.`);
                break;
            case 'branched':
                templates.push(`${context}에 대해 두 가지 방법이 있을 것 같아요.`);
                break;
        }

        // 감정 기반 템플릿
        if (targetEmotion) {
            switch (targetEmotion) {
                case 'concern':
                    templates.push(`${context}에 대해 걱정이 되는 부분이 있어서 말씀드립니다.`);
                    break;
                case 'enthusiasm':
                    templates.push(`${context}에 대해 정말 기대가 됩니다!`);
                    break;
                case 'agreement':
                    templates.push(`${context}에 대해 완전히 동감합니다.`);
                    break;
            }
        }

        return templates;
    }

    /**
     * 최적 템플릿 선택
     */
    private selectBestTemplate(
        templates: string[],
        profile: PersonaProfile,
        recentMessages: any[]
    ): string {
        if (templates.length === 0) {
            return "네, 알겠습니다.";
        }

        // 최근 메시지와의 유사성 고려
        let bestTemplate = templates[0];
        let bestScore = 0;

        for (const template of templates) {
            let score = 0;

            // 스타일 일치도
            if (profile.speaking_style.formality_level > 0.7) {
                if (template.includes('습니다') || template.includes('겠습니다')) {
                    score += 0.3;
                }
            } else if (profile.speaking_style.formality_level < 0.3) {
                if (template.includes('해요') || template.includes('어요')) {
                    score += 0.3;
                }
            }

            // 특징적 표현 포함도
            for (const phrase of profile.signature_expressions) {
                if (template.includes(phrase)) {
                    score += 0.2;
                }
            }

            if (score > bestScore) {
                bestScore = score;
                bestTemplate = template;
            }
        }

        return bestTemplate;
    }

    /**
     * 스타일 요소 적용
     */
    private applyStyleElements(message: string, profile: PersonaProfile): string {
        let styledMessage = message;

        // 격식도 조정
        if (profile.speaking_style.formality_level > 0.8) {
            styledMessage = styledMessage
                .replace(/해요/g, '합니다')
                .replace(/이에요/g, '입니다')
                .replace(/가요/g, '갑니다');
        } else if (profile.speaking_style.formality_level < 0.3) {
            styledMessage = styledMessage
                .replace(/습니다/g, '해요')
                .replace(/입니다/g, '이에요')
                .replace(/갑니다/g, '가요');
        }

        // 특징적 표현 추가
        if (profile.signature_expressions.length > 0 && Math.random() < 0.3) {
            const randomExpression = profile.signature_expressions[
                Math.floor(Math.random() * profile.signature_expressions.length)
            ];
            if (!styledMessage.includes(randomExpression)) {
                styledMessage = `${randomExpression} ${styledMessage}`;
            }
        }

        // 말투 습관 적용
        for (const habit of profile.speaking_style.verbal_habits) {
            if (habit.includes('로 끝냄') && Math.random() < 0.2) {
                const ending = habit.match(/"(.+?)"/)?.[1];
                if (ending && !styledMessage.endsWith(ending)) {
                    styledMessage = styledMessage.replace(/\.$/, ` ${ending}.`);
                }
            }
        }

        return styledMessage;
    }

    /**
     * 자연스러운 흐름 점수 계산
     */
    private calculateNaturalFlowScore(
        message: string,
        recentMessages: any[],
        profile: PersonaProfile
    ): number {
        if (recentMessages.length === 0) return 0.7;

        let score = 0.5;

        // 이전 메시지와의 논리적 연결성
        const lastMessage = recentMessages[recentMessages.length - 1];
        if (lastMessage && lastMessage.content) {
            // 주제 연관성
            const commonWords = this.findCommonWords(message, lastMessage.content);
            score += commonWords.length * 0.1;

            // 논리적 연결사 사용
            if (this.koreanStylePatterns.logical_connectors.cause_effect.some(conn => message.includes(conn))) {
                score += 0.2;
            }
        }

        // 개인 스타일 일관성
        score += profile.consistency_score * 0.3;

        return Math.min(1.0, score);
    }

    /**
     * 공통 단어 찾기
     */
    private findCommonWords(text1: string, text2: string): string[] {
        const words1 = text1.split(/\s+/).filter(word => word.length > 1);
        const words2 = text2.split(/\s+/).filter(word => word.length > 1);

        return words1.filter(word => words2.includes(word));
    }

    /**
     * 스타일 신뢰도 계산
     */
    private calculateStyleConfidence(message: string, profile: PersonaProfile): number {
        let confidence = 0.5;

        // 격식도 일치
        const messageFormalityLevel = this.analyzeFormalityLevel([message]);
        const formalityDifference = Math.abs(messageFormalityLevel - profile.speaking_style.formality_level);
        confidence += (1.0 - formalityDifference) * 0.3;

        // 특징적 표현 포함
        const includedExpressions = profile.signature_expressions.filter(expr => message.includes(expr));
        confidence += (includedExpressions.length / Math.max(1, profile.signature_expressions.length)) * 0.2;

        // 어조 일치
        const toneMatch = this.calculateToneMatch(message, profile);
        confidence += toneMatch * 0.2;

        return Math.min(1.0, confidence);
    }

    /**
     * 어조 일치도 계산
     */
    private calculateToneMatch(message: string, profile: PersonaProfile): number {
        let match = 0;

        // 어조 지표별 검사
        if (profile.speaking_style.tone_indicators.concern > 0.5) {
            if (['걱정', '우려', '신중'].some(word => message.includes(word))) {
                match += 0.25;
            }
        }

        if (profile.speaking_style.tone_indicators.confidence > 0.5) {
            if (['확실', '분명', '틀림없'].some(word => message.includes(word))) {
                match += 0.25;
            }
        }

        if (profile.speaking_style.tone_indicators.enthusiasm > 0.5) {
            if (['좋아', '기대', '기쁘'].some(word => message.includes(word))) {
                match += 0.25;
            }
        }

        if (profile.speaking_style.tone_indicators.caution > 0.5) {
            if (['조심', '신중', '천천히'].some(word => message.includes(word))) {
                match += 0.25;
            }
        }

        return match;
    }

    /**
     * 논리 흐름 추출
     */
    private extractLogicFlow(message: string): string[] {
        const flow = [];

        // 논리적 연결사 찾기
        for (const [category, connectors] of Object.entries(this.koreanStylePatterns.logical_connectors)) {
            for (const connector of connectors) {
                if (message.includes(connector)) {
                    flow.push(`${category}: ${connector}`);
                }
            }
        }

        return flow;
    }

    /**
     * 격식도 일치도 계산
     */
    private calculateFormalityMatch(message: string, profile: PersonaProfile): number {
        const messageFormalityLevel = this.analyzeFormalityLevel([message]);
        return 1.0 - Math.abs(messageFormalityLevel - profile.speaking_style.formality_level);
    }

    /**
     * 특징적 요소 식별
     */
    private identifyCharacteristicElements(message: string, profile: PersonaProfile): string[] {
        const elements = [];

        // 시그니처 표현
        for (const expression of profile.signature_expressions) {
            if (message.includes(expression)) {
                elements.push(`시그니처: ${expression}`);
            }
        }

        // 말투 습관
        for (const habit of profile.speaking_style.verbal_habits) {
            if (habit.includes('끝냄') && message.includes(habit.match(/"(.+?)"/)?.[1] || '')) {
                elements.push(`습관: ${habit}`);
            }
        }

        // 역할별 특징
        elements.push(`역할: ${profile.speaking_style.conversation_role}`);

        return elements;
    }

    /**
     * 기본 말하기 스타일 생성
     */
    private createDefaultSpeakingStyle(): SpeakingStyle {
        return {
            formality_level: 0.7,
            sentence_length: 'medium',
            emotional_expression: 'moderate',
            logical_pattern: 'deductive',
            conversation_role: 'supporter',
            characteristic_phrases: [],
            verbal_habits: [],
            tone_indicators: {
                concern: 0.3,
                confidence: 0.5,
                enthusiasm: 0.4,
                caution: 0.3
            }
        };
    }

    /**
     * 기본 프로필 생성
     */
    private createDefaultProfile(speakerId: string): PersonaProfile {
        return {
            speaker_id: speakerId,
            speaking_style: {
                formality_level: 0.7,
                sentence_length: 'medium',
                emotional_expression: 'moderate',
                logical_pattern: 'deductive',
                conversation_role: 'supporter',
                characteristic_phrases: [],
                verbal_habits: [],
                tone_indicators: {
                    concern: 0.3,
                    confidence: 0.5,
                    enthusiasm: 0.4,
                    caution: 0.3
                }
            },
            conversation_logic: {
                argument_structure: 'linear',
                evidence_usage: 'experiential',
                persuasion_style: 'mixed',
                decision_making: 'deliberate',
                conflict_resolution: 'diplomatic',
                topic_transitions: 'smooth'
            },
            signature_expressions: [],
            emotional_vocabulary: [],
            technical_vocabulary: [],
            social_markers: [],
            consistency_score: 0.5,
            sample_messages: []
        };
    }

    /**
     * 기본 메시지 생성
     */
    private generateGenericMessage(context: string): StyleBasedMessage {
        return {
            content: `${context}에 대해 좀 더 살펴보겠습니다.`,
            style_confidence: 0.3,
            logic_flow: [],
            emotional_tone: 'neutral',
            formality_match: 0.5,
            characteristic_elements: [],
            natural_flow_score: 0.4
        };
    }

    /**
     * 모든 화자 프로필 가져오기
     */
    getAllSpeakerProfiles(): Map<string, PersonaProfile> {
        return this.speakerProfiles;
    }

    /**
     * 특정 화자 프로필 가져오기
     */
    getSpeakerProfile(speakerId: string): PersonaProfile | undefined {
        return this.speakerProfiles.get(speakerId);
    }

    /**
     * 프로필 업데이트
     */
    updateSpeakerProfile(speakerId: string, newMessages: any[]): void {
        const allMessages = [...(this.speakerProfiles.get(speakerId)?.sample_messages || []), ...newMessages.map(msg => msg.content)];
        this.analyzeSpeakerStyle(newMessages, speakerId);
    }
}

// Export singleton instance
export const conversationStyleAnalyzer = new ConversationStyleAnalyzer(); 