/**
 * conversationRouter 유틸리티 테스트
 * 대화형 명령 파싱 기능 확인
 */

import { parseConversationCommand } from '../conversationRouter';

describe('conversationRouter', () => {
  describe('parseConversationCommand', () => {
    it('AI 상태 명령을 파싱해야 함', () => {
      const result = parseConversationCommand('AI 상태 확인해주세요');
      
      expect(result.intent).toBe('ai_status');
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.keywords.length).toBeGreaterThan(0);
    });

    it('분석 명령을 파싱해야 함', () => {
      const result = parseConversationCommand('분석 리포트를 보여주세요');
      
      expect(result.intent).toBe('analytics');
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.keywords.length).toBeGreaterThan(0);
    });

    it('파일 업로드 명령을 파싱해야 함', () => {
      const result = parseConversationCommand('파일 업로드 방법을 알려주세요');
      
      expect(result.intent).toBe('file_upload');
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.keywords.length).toBeGreaterThan(0);
    });

    it('구 표현「채팅방」목록 명령을 파싱해야 함', () => {
      const result = parseConversationCommand('채팅방 목록을 보여주세요');
      
      expect(result.intent).toBe('list_rooms');
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.keywords.length).toBeGreaterThan(0);
    });

    it('대화방 목록 명령을 파싱해야 함', () => {
      const result = parseConversationCommand('대화방 목록을 보여주세요');
      expect(result.intent).toBe('list_rooms');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('로그아웃 명령을 파싱해야 함', () => {
      const result = parseConversationCommand('로그아웃하고 싶어요');
      
      expect(result.intent).toBe('logout');
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.keywords.length).toBeGreaterThan(0);
    });

    it('도움말 명령을 파싱해야 함', () => {
      const result = parseConversationCommand('도움말을 보여주세요');
      
      expect(result.intent).toBe('help');
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.keywords.length).toBeGreaterThan(0);
    });

    it('일반 대화를 기본값으로 반환해야 함', () => {
      const result = parseConversationCommand('안녕하세요');
      
      expect(result.intent).toBe('chat');
      expect(result.confidence).toBe(0.5);
      expect(result.keywords).toEqual([]);
    });

    it('빈 메시지는 chat 기본값으로 반환해야 함', () => {
      const result = parseConversationCommand('');
      expect(result.intent).toBe('chat');
      expect(result.confidence).toBe(0.5);
      expect(result.keywords).toEqual([]);
    });

    it('나가기·종료 키워드는 logout intent로 파싱해야 함', () => {
      const result1 = parseConversationCommand('나가기 할게요');
      const result2 = parseConversationCommand('종료해주세요');
      expect(result1.intent).toBe('logout');
      expect(result2.intent).toBe('logout');
      expect(result1.confidence).toBeGreaterThan(0.8);
      expect(result2.confidence).toBeGreaterThan(0.8);
    });

    it('대소문자를 구분하지 않아야 함', () => {
      const result1 = parseConversationCommand('AI 상태');
      const result2 = parseConversationCommand('ai 상태');
      const result3 = parseConversationCommand('Ai 상태');
      
      expect(result1.intent).toBe('ai_status');
      expect(result2.intent).toBe('ai_status');
      expect(result3.intent).toBe('ai_status');
    });

    it('여러 키워드가 포함된 경우 가장 높은 confidence를 반환해야 함', () => {
      const result = parseConversationCommand('AI 상태와 분석 리포트를 보여주세요');
      
      // 첫 번째로 매칭되는 intent를 반환
      expect(['ai_status', 'analytics']).toContain(result.intent);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('키워드 배열을 올바르게 추출해야 함', () => {
      const result = parseConversationCommand('AI 상태 확인');
      
      expect(Array.isArray(result.keywords)).toBe(true);
      expect(result.keywords.length).toBeGreaterThan(0);
      expect(result.keywords.every(k => typeof k === 'string')).toBe(true);
    });
  });
});

