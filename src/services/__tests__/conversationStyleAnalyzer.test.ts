/**
 * ConversationStyleAnalyzer 테스트
 */

import {
  ConversationStyleAnalyzer,
  conversationStyleAnalyzer,
} from '../conversationStyleAnalyzer';

describe('ConversationStyleAnalyzer', () => {
  let service: ConversationStyleAnalyzer;

  beforeEach(() => {
    service = new ConversationStyleAnalyzer();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(ConversationStyleAnalyzer);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(conversationStyleAnalyzer).toBeDefined();
    });
  });

  describe('발화자 스타일 분석', () => {
    it('기본 발화자 스타일 분석', () => {
      const messages = [
        { sender: 'user1', content: '시공사 선정에 대해 분석해주세요.' },
        { sender: 'user1', content: '어떤 기준으로 선정하는 것이 좋을까요?' },
        { sender: 'user1', content: '신중하게 검토해야 할 것 같습니다.' },
      ];

      const profile = service.analyzeSpeakerStyle(messages, 'user1');

      expect(profile).toBeDefined();
      expect(profile.speaker_id).toBe('user1');
      expect(profile.speaking_style).toBeDefined();
      expect(profile.conversation_logic).toBeDefined();
      expect(Array.isArray(profile.signature_expressions)).toBe(true);
    });

    it('빈 메시지 배열 처리', () => {
      const messages: any[] = [];
      const profile = service.analyzeSpeakerStyle(messages, 'user2');

      expect(profile).toBeDefined();
      expect(profile.speaker_id).toBe('user2');
    });

    it('격식도 분석', () => {
      const formalMessages = [
        { sender: 'user3', content: '시공사 선정에 대해 분석해주시기 바랍니다.' },
        { sender: 'user3', content: '검토 부탁드립니다.' },
      ];

      const profile = service.analyzeSpeakerStyle(formalMessages, 'user3');
      expect(profile.speaking_style.formality_level).toBeGreaterThanOrEqual(0);
      expect(profile.speaking_style.formality_level).toBeLessThanOrEqual(1);
    });

    it('문장 길이 분석', () => {
      const shortMessages = [
        { sender: 'user4', content: '좋아요.' },
        { sender: 'user4', content: '알겠습니다.' },
      ];

      const profile = service.analyzeSpeakerStyle(shortMessages, 'user4');
      expect(['short', 'medium', 'long']).toContain(profile.speaking_style.sentence_length);
    });

    it('감정 표현 분석', () => {
      const emotionalMessages = [
        { sender: 'user5', content: '정말 걱정이 됩니다.' },
        { sender: 'user5', content: '기대가 되네요!' },
      ];

      const profile = service.analyzeSpeakerStyle(emotionalMessages, 'user5');
      expect(['direct', 'indirect', 'moderate']).toContain(
        profile.speaking_style.emotional_expression
      );
    });

    it('논리 패턴 분석', () => {
      const logicalMessages = [
        { sender: 'user6', content: '먼저 시공사를 비교하고, 다음에 선정 기준을 검토해야 합니다.' },
        { sender: 'user6', content: '그래서 신중한 결정이 필요합니다.' },
      ];

      const profile = service.analyzeSpeakerStyle(logicalMessages, 'user6');
      expect(['deductive', 'inductive', 'narrative', 'questioning']).toContain(
        profile.speaking_style.logical_pattern
      );
    });

    it('대화 역할 분석', () => {
      const leaderMessages = [
        { sender: 'user7', content: '이렇게 결정하겠습니다.' },
        { sender: 'user7', content: '다음 단계를 진행하겠습니다.' },
      ];

      const profile = service.analyzeSpeakerStyle(leaderMessages, 'user7');
      expect(['leader', 'supporter', 'mediator', 'observer']).toContain(
        profile.speaking_style.conversation_role
      );
    });

    it('특성 구문 추출', () => {
      const messages = [
        { sender: 'user8', content: '시공사 선정에 대해 분석해주세요.' },
        { sender: 'user8', content: '시공사 선정 기준을 알려주세요.' },
      ];

      const profile = service.analyzeSpeakerStyle(messages, 'user8');
      expect(Array.isArray(profile.signature_expressions)).toBe(true);
    });

    it('어조 지표 분석', () => {
      const concernedMessages = [
        { sender: 'user9', content: '걱정이 됩니다.' },
        { sender: 'user9', content: '우려가 있습니다.' },
      ];

      const profile = service.analyzeSpeakerStyle(concernedMessages, 'user9');
      expect(profile.speaking_style.tone_indicators).toBeDefined();
      expect(typeof profile.speaking_style.tone_indicators.concern).toBe('number');
      expect(typeof profile.speaking_style.tone_indicators.confidence).toBe('number');
    });
  });

  describe('대화 논리 분석', () => {
    it('논증 구조 분석', () => {
      const linearMessages = [
        { sender: 'user10', content: '먼저 시공사를 비교하고, 다음에 선정 기준을 검토합니다.' },
        { sender: 'user10', content: '마지막으로 결정을 내립니다.' },
      ];

      const profile = service.analyzeSpeakerStyle(linearMessages, 'user10');
      expect(['linear', 'circular', 'branched', 'fragmented']).toContain(
        profile.conversation_logic.argument_structure
      );
    });

    it('증거 사용 방식 분석', () => {
      const factualMessages = [
        { sender: 'user11', content: '통계에 따르면 시공사 A가 우수합니다.' },
        { sender: 'user11', content: '데이터를 보면 선정 기준이 명확합니다.' },
      ];

      const profile = service.analyzeSpeakerStyle(factualMessages, 'user11');
      expect(['factual', 'experiential', 'emotional', 'authoritative']).toContain(
        profile.conversation_logic.evidence_usage
      );
    });

    it('설득 스타일 분석', () => {
      const rationalMessages = [
        { sender: 'user12', content: '논리적으로 분석하면 시공사 A가 적합합니다.' },
        { sender: 'user12', content: '비용 대비 효과를 고려해야 합니다.' },
      ];

      const profile = service.analyzeSpeakerStyle(rationalMessages, 'user12');
      expect(['rational', 'emotional', 'social', 'mixed']).toContain(
        profile.conversation_logic.persuasion_style
      );
    });
  });

  describe('스타일 기반 메시지 생성', () => {
    it('스타일 기반 메시지 생성', () => {
      const messages = [
        { sender: 'user13', content: '시공사 선정에 대해 알려주세요.' },
      ];

      service.analyzeSpeakerStyle(messages, 'user13');

      const styleMessage = service.generateStyleBasedMessage(
        'user13',
        '시공사 선정 기준을 설명해주세요.',
        []
      );

      expect(styleMessage).toBeDefined();
      expect(styleMessage.content).toBeDefined();
      expect(typeof styleMessage.style_confidence).toBe('number');
      expect(Array.isArray(styleMessage.logic_flow)).toBe(true);
    });

    it('스타일 신뢰도 확인', () => {
      const messages = [
        { sender: 'user14', content: '시공사 선정에 대해 알려주세요.' },
      ];

      service.analyzeSpeakerStyle(messages, 'user14');

      const styleMessage = service.generateStyleBasedMessage(
        'user14',
        '시공사 비교를 해주세요.',
        []
      );

      expect(styleMessage.style_confidence).toBeGreaterThanOrEqual(0);
      expect(styleMessage.style_confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('프로필 업데이트', () => {
    it('발화자 프로필 업데이트', () => {
      const initialMessages = [
        { sender: 'user15', content: '시공사 선정에 대해 알려주세요.' },
      ];

      service.analyzeSpeakerStyle(initialMessages, 'user15');

      const newMessages = [
        { sender: 'user15', content: '시공사 비교를 해주세요.' },
        { sender: 'user15', content: '선정 기준을 검토해야 합니다.' },
      ];

      service.updateSpeakerProfile('user15', newMessages);

      const updatedProfile = service.analyzeSpeakerStyle(
        [...initialMessages, ...newMessages],
        'user15'
      );

      expect(updatedProfile).toBeDefined();
      expect(updatedProfile.speaker_id).toBe('user15');
    });
  });
});

