/**
 * EmotionalPsychologicalWritingEngine 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import {
  EmotionalPsychologicalWritingEngine,
  emotionalPsychologicalWritingEngine,
  EmotionalProfile,
  PsychologicalWritingRequest,
  EmotionType,
  AttachmentStyle,
} from '../emotionalPsychologicalWritingEngine';

describe('EmotionalPsychologicalWritingEngine', () => {
  let service: EmotionalPsychologicalWritingEngine;

  beforeEach(() => {
    service = new EmotionalPsychologicalWritingEngine();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(EmotionalPsychologicalWritingEngine);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(emotionalPsychologicalWritingEngine).toBeDefined();
    });
  });

  describe('감정 심리 분석 글쓰기', () => {
    const createTestEmotion = (): EmotionType => ({
      name: '슬픔',
      category: 'basic',
      valence: 'negative',
      arousal: 'low',
      somatic_markers: ['눈물', '처진 어깨'],
      cognitive_components: ['상실감', '무력감'],
    });

    const createTestProfile = (): EmotionalProfile => ({
      primary_emotions: {
        dominant: createTestEmotion(),
        secondary: [],
        intensity: 60,
        stability: 70,
      },
      emotional_patterns: {
        triggers: [],
        responses: [],
        coping_mechanisms: ['일기 쓰기'],
        expression_style: 'direct',
      },
      psychological_traits: {
        personality_type: {
          framework: 'MBTI',
          primary_type: 'INFP',
          traits: {
            openness: 90,
            conscientiousness: 60,
            extraversion: 20,
            agreeableness: 85,
            neuroticism: 70,
          },
          strengths: ['창의성', '공감능력'],
          growth_areas: ['실용성'],
        },
        cognitive_style: {
          thinking_preference: 'analytical',
          information_processing: 'sequential',
          decision_making: 'rational',
          problem_solving: 'systematic',
        },
        defense_mechanisms: [],
        attachment_style: {
          primary: 'secure',
          characteristics: ['타인을 신뢰하는 능력'],
          relationship_patterns: ['건강한 경계 설정'],
          emotional_regulation: ['감정을 인식하고 표현'],
        },
      },
      communication_patterns: {
        preferred_style: 'emotional',
        conflict_resolution: 'collaborative',
        intimacy_level: 'moderate',
        social_orientation: 'introverted',
      },
    });

    const createTestRequest = (): PsychologicalWritingRequest => ({
      target_emotion: createTestEmotion(),
      psychological_depth: 'moderate',
      audience_emotional_state: '슬픔',
      therapeutic_goal: 'healing',
      cultural_context: 'korean',
      constraints: {
        sensitivity_level: 'medium',
        avoid_triggers: [],
        promote_values: ['치유', '성장'],
      },
      writing_purpose: 'therapy',
    });

    it('기본 감정 심리 분석 글쓰기', async () => {
      const request = createTestRequest();
      const readerProfile = createTestProfile();

      const result = await service.generateEmotionalPsychologicalContent(
        request,
        readerProfile
      );

      expect(result).toBeDefined();
      expect(result.output).toBeDefined();
      expect(result.output.content).toBeDefined();
      expect(result.output.content.primary_text).toBeDefined();
      expect(result.output.emotional_analysis).toBeDefined();
      expect(result.output.impact_assessment).toBeDefined();
      expect(result.output.personalization).toBeDefined();
      expect(result.therapeutic_plan).toBeDefined();
      expect(result.personalization_report).toBeDefined();
    });

    it('다양한 심리적 깊이 레벨', async () => {
      const depths: Array<'surface' | 'moderate' | 'deep' | 'therapeutic'> = [
        'surface',
        'moderate',
        'deep',
        'therapeutic',
      ];

      for (const depth of depths) {
        const request = { ...createTestRequest(), psychological_depth: depth };
        const readerProfile = createTestProfile();

        const result = await service.generateEmotionalPsychologicalContent(
          request,
          readerProfile
        );

        expect(result).toBeDefined();
        expect(result.output).toBeDefined();
      }
    });

    it('다양한 치료적 목표', async () => {
      const goals: Array<'healing' | 'insight' | 'catharsis' | 'growth' | 'connection'> = [
        'healing',
        'insight',
        'catharsis',
        'growth',
        'connection',
      ];

      for (const goal of goals) {
        const request = { ...createTestRequest(), therapeutic_goal: goal };
        const readerProfile = createTestProfile();

        const result = await service.generateEmotionalPsychologicalContent(
          request,
          readerProfile
        );

        expect(result).toBeDefined();
        expect(result.output).toBeDefined();
      }
    });

    it('개인화 옵션 적용', async () => {
      const request = createTestRequest();
      const readerProfile = createTestProfile();

      const result = await service.generateEmotionalPsychologicalContent(
        request,
        readerProfile,
        {
          personalization_level: 'high',
          therapeutic_approach: 'integrative',
          safety_priority: 'high',
          cultural_adaptation: true,
        }
      );

      expect(result).toBeDefined();
      expect(result.personalization_report.profile_alignment).toBeDefined();
    });
  });

  describe('치료적 글쓰기 세션', () => {
    const createTestProfile = (): EmotionalProfile => ({
      primary_emotions: {
        dominant: {
          name: '불안',
          category: 'basic',
          valence: 'negative',
          arousal: 'high',
          somatic_markers: ['떨림', '땀'],
          cognitive_components: ['위험 인식'],
        },
        secondary: [],
        intensity: 70,
        stability: 60,
      },
      emotional_patterns: {
        triggers: [],
        responses: [],
        coping_mechanisms: ['호흡 운동'],
        expression_style: 'indirect',
      },
      psychological_traits: {
        personality_type: {
          framework: 'MBTI',
          primary_type: 'ENFJ',
          traits: {
            openness: 80,
            conscientiousness: 80,
            extraversion: 85,
            agreeableness: 90,
            neuroticism: 40,
          },
          strengths: ['리더십'],
          growth_areas: ['자기 돌봄'],
        },
        cognitive_style: {
          thinking_preference: 'holistic',
          information_processing: 'visual',
          decision_making: 'intuitive',
          problem_solving: 'innovative',
        },
        defense_mechanisms: [],
        attachment_style: {
          primary: 'secure',
          characteristics: ['타인을 신뢰하는 능력'],
          relationship_patterns: ['건강한 경계 설정'],
          emotional_regulation: ['감정을 인식하고 표현'],
        },
      },
      communication_patterns: {
        preferred_style: 'emotional',
        conflict_resolution: 'collaborative',
        intimacy_level: 'deep',
        social_orientation: 'extroverted',
      },
    });

    it('기본 치료적 글쓰기 세션', async () => {
      const clientProfile = createTestProfile();
      const sessionGoals = ['감정 인식 향상', '자기 수용 증진'];
      const sessionType = 'exploration';

      const result = await service.conductTherapeuticWritingSession(
        clientProfile,
        sessionGoals,
        sessionType
      );

      expect(result).toBeDefined();
      expect(result.session).toBeDefined();
      expect(result.session.session_id).toBeDefined();
      expect(result.session.client_profile).toBeDefined();
      expect(result.session.therapeutic_goals).toEqual(sessionGoals);
      expect(result.session.session_type).toBe(sessionType);
      expect(Array.isArray(result.session.writing_exercises)).toBe(true);
      expect(result.session.progress_tracking).toBeDefined();
      expect(result.real_time_insights).toBeDefined();
      expect(result.safety_monitoring).toBeDefined();
    });

    it('다양한 세션 타입', async () => {
      const sessionTypes: Array<
        'assessment' | 'exploration' | 'processing' | 'integration' | 'closure'
      > = ['assessment', 'exploration', 'processing', 'integration', 'closure'];

      for (const sessionType of sessionTypes) {
        const clientProfile = createTestProfile();
        const sessionGoals = ['테스트 목표'];

        const result = await service.conductTherapeuticWritingSession(
          clientProfile,
          sessionGoals,
          sessionType
        );

        expect(result).toBeDefined();
        expect(result.session.session_type).toBe(sessionType);
      }
    });

    it('안전 모니터링 옵션', async () => {
      const clientProfile = createTestProfile();
      const sessionGoals = ['감정 조절 향상'];

      const result = await service.conductTherapeuticWritingSession(
        clientProfile,
        sessionGoals,
        'exploration',
        {
          duration: 60,
          supervision_level: 'clinical',
          emergency_protocols: true,
        }
      );

      expect(result).toBeDefined();
      expect(result.safety_monitoring).toBeDefined();
      expect(result.safety_monitoring.risk_level).toBeDefined();
    });
  });

  describe('감정 복잡성 분석', () => {
    it('기본 감정 복잡성 분석', async () => {
      const emotionalInput = {
        described_feelings: '복잡한 감정을 느끼고 있습니다',
        context: '중요한 결정을 앞두고 있음',
        intensity: 70,
        confusion_level: 60,
      };

      const result = await service.analyzeAndExpressEmotionalComplexity(
        emotionalInput,
        'clarification'
      );

      expect(result).toBeDefined();
      expect(result.complexity_analysis).toBeDefined();
      expect(Array.isArray(result.complexity_analysis.identified_emotions)).toBe(true);
      expect(Array.isArray(result.complexity_analysis.emotional_conflicts)).toBe(true);
      expect(Array.isArray(result.complexity_analysis.underlying_needs)).toBe(true);
      expect(Array.isArray(result.complexity_analysis.core_issues)).toBe(true);
      expect(Array.isArray(result.expression_variations)).toBe(true);
      expect(Array.isArray(result.integration_pathways)).toBe(true);
    });

    it('다양한 표현 목표', async () => {
      const goals: Array<
        'clarification' | 'catharsis' | 'understanding' | 'communication' | 'healing'
      > = ['clarification', 'catharsis', 'understanding', 'communication', 'healing'];

      for (const goal of goals) {
        const emotionalInput = {
          described_feelings: '테스트 감정',
          context: '테스트 맥락',
          intensity: 50,
          confusion_level: 40,
        };

        const result = await service.analyzeAndExpressEmotionalComplexity(
          emotionalInput,
          goal
        );

        expect(result).toBeDefined();
        expect(result.expression_variations.length).toBeGreaterThan(0);
      }
    });
  });

  describe('방어기제 인식 및 글쓰기', () => {
    it('기본 방어기제 분석', async () => {
      const textInput = '모든 것이 괜찮다고 생각합니다. 문제가 없어요.';
      const suspectedDefenses = ['합리화', '부정'];
      const therapeuticGoal = 'awareness';

      const result = await service.recognizeAndAddressDefenseMechanisms(
        textInput,
        suspectedDefenses,
        therapeuticGoal
      );

      expect(result).toBeDefined();
      expect(result.defense_analysis).toBeDefined();
      expect(Array.isArray(result.defense_analysis.identified_defenses)).toBe(true);
      expect(Array.isArray(result.defense_analysis.defense_hierarchy)).toBe(true);
      expect(result.defense_analysis.developmental_context).toBeDefined();
      expect(Array.isArray(result.defense_analysis.triggering_factors)).toBe(true);
      expect(result.therapeutic_writing).toBeDefined();
      expect(Array.isArray(result.healing_pathways)).toBe(true);
    });

    it('다양한 치료적 목표', async () => {
      const goals: Array<'awareness' | 'understanding' | 'transformation' | 'integration'> = [
        'awareness',
        'understanding',
        'transformation',
        'integration',
      ];

      for (const goal of goals) {
        const result = await service.recognizeAndAddressDefenseMechanisms(
          '테스트 텍스트',
          ['합리화'],
          goal
        );

        expect(result).toBeDefined();
        expect(result.therapeutic_writing).toBeDefined();
      }
    });
  });

  describe('애착 스타일 기반 글쓰기', () => {
    const createSecureAttachment = (): AttachmentStyle => ({
      primary: 'secure',
      characteristics: ['타인을 신뢰하는 능력', '감정 조절 능력'],
      relationship_patterns: ['건강한 경계 설정', '갈등을 건설적으로 해결'],
      emotional_regulation: ['감정을 인식하고 표현', '스트레스를 효과적으로 관리'],
    });

    const createAnxiousAttachment = (): AttachmentStyle => ({
      primary: 'anxious',
      characteristics: ['버림받을 것에 대한 두려움', '관계에서의 불안감'],
      relationship_patterns: ['관계에 과도하게 집착', '파트너의 사소한 행동에도 민감'],
      emotional_regulation: ['감정의 강도가 높음', '타인에게 의존적 조절'],
    });

    it('기본 애착 기반 글쓰기', async () => {
      const attachmentStyle = createSecureAttachment();
      const relationshipContext = {
        relationship_type: 'romantic',
        current_dynamics: ['안정적', '신뢰'],
        desired_changes: ['더 깊은 소통'],
        communication_goals: ['감정 표현 향상'],
      };
      const writingPurpose = 'self_understanding';

      const result = await service.generateAttachmentBasedWriting(
        attachmentStyle,
        relationshipContext,
        writingPurpose
      );

      expect(result).toBeDefined();
      expect(result.attachment_insights).toBeDefined();
      expect(result.attachment_insights.style_explanation).toBeDefined();
      expect(Array.isArray(result.attachment_insights.relationship_patterns)).toBe(true);
      expect(result.tailored_writing).toBeDefined();
      expect(Array.isArray(result.communication_strategies)).toBe(true);
      expect(result.healing_journey).toBeDefined();
    });

    it('다양한 애착 스타일', async () => {
      const attachmentStyles = [createSecureAttachment(), createAnxiousAttachment()];

      for (const style of attachmentStyles) {
        const relationshipContext = {
          relationship_type: 'friendship',
          current_dynamics: ['안정적'],
          desired_changes: [],
          communication_goals: ['소통 개선'],
        };

        const result = await service.generateAttachmentBasedWriting(
          style,
          relationshipContext,
          'healing'
        );

        expect(result).toBeDefined();
        expect(result.attachment_insights.style_explanation).toBeDefined();
      }
    });

    it('다양한 글쓰기 목적', async () => {
      const purposes: Array<
        'self_understanding' | 'partner_communication' | 'healing' | 'growth'
      > = ['self_understanding', 'partner_communication', 'healing', 'growth'];

      for (const purpose of purposes) {
        const result = await service.generateAttachmentBasedWriting(
          createSecureAttachment(),
          {
            relationship_type: 'family',
            current_dynamics: ['안정적'],
            desired_changes: [],
            communication_goals: [],
          },
          purpose
        );

        expect(result).toBeDefined();
        expect(result.tailored_writing).toBeDefined();
      }
    });
  });
});

