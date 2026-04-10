/**
 * conversationHandlers 테스트
 */

import {
  handleAIStatus,
  handleAnalytics,
  handleFileUpload,
  handleListRooms,
  handleLogout,
  handleHelp,
  handleChat,
} from '../conversationHandlers';

describe('conversationHandlers', () => {
  describe('handleAIStatus', () => {
    it('AI 시스템 상태 문자열 반환', async () => {
      const result = await handleAIStatus();
      expect(result).toContain('**AI 시스템 상태**');
      expect(result).toContain('대화형 AI');
      expect(result).toContain('분석 AI');
      expect(result).toContain('창작 AI');
      expect(result).toContain('예측 AI');
      expect(result).toContain('활성');
      expect(result).toContain('모든 AI 시스템이 정상적으로 작동하고 있습니다.');
    });
  });

  describe('handleAnalytics', () => {
    it('분석 리포트 문자열 반환', async () => {
      const result = await handleAnalytics();
      expect(result).toContain('**분석 리포트**');
      expect(result).toContain('사용량 통계');
      expect(result).toContain('1,247');
      expect(result).toContain('23명');
      expect(result).toContain('인기 기능');
      expect(result).toContain('대화');
      expect(result).toContain('AI 분석');
    });
  });

  describe('handleFileUpload', () => {
    it('파일 업로드 안내 문자열 반환', async () => {
      const result = await handleFileUpload();
      expect(result).toContain('**파일 업로드 안내**');
      expect(result).toContain('JPG');
      expect(result).toContain('PDF');
      expect(result).toContain('파일을 드래그하여');
      expect(result).toContain('개인정보');
    });
  });

  describe('handleListRooms', () => {
    it('대화방 목록 문자열 반환', async () => {
      const result = await handleListRooms();
      expect(result).toContain('**대화방 목록**');
      expect(result).toContain('일반 대화');
      expect(result).toContain('프로젝트 A');
      expect(result).toContain('읽지 않은 메시지: 3개');
      expect(result).toContain('사이드바에서 클릭하세요');
    });
  });

  describe('handleLogout', () => {
    it('로그아웃 메시지 반환', async () => {
      const result = await handleLogout();
      expect(result).toContain('**로그아웃**');
      expect(result).toContain('CORBU.AI');
      expect(result).toContain('로그아웃되었습니다');
    });
  });

  describe('handleHelp', () => {
    it('도움말 문자열 반환', async () => {
      const result = await handleHelp();
      expect(result).toContain('**CORBU.AI 도움말**');
      expect(result).toContain('AI 상태');
      expect(result).toContain('분석 리포트');
      expect(result).toContain('파일 업로드');
      expect(result).toContain('대화방 목록');
      expect(result).toContain('실시간 대화');
      expect(result).toContain('일반 대화');
    });
  });

  describe('handleChat', () => {
    it('안녕 포함 시 인사 응답', async () => {
      const result = await handleChat('안녕하세요');
      expect(result).toContain('안녕하세요! CORBU.AI');
      expect(result).toContain('오늘도 좋은 하루');
    });

    it('hello 포함 시 인사 응답', async () => {
      const result = await handleChat('hello');
      expect(result).toContain('안녕하세요! CORBU.AI');
    });

    it('감사 포함 시 감사 응답', async () => {
      const result = await handleChat('감사합니다');
      expect(result).toContain('천만에요');
      expect(result).toContain('도움이 되어서 기쁩니다');
    });

    it('고마워 포함 시 감사 응답', async () => {
      const result = await handleChat('고마워요');
      expect(result).toContain('천만에요');
    });

    it('날씨 포함 시 안내 응답', async () => {
      const result = await handleChat('날씨 어때?');
      expect(result).toContain('날씨 정보는 제공하지 않습니다');
    });

    it('시간 포함 시 현재 시간 반환', async () => {
      const result = await handleChat('지금 시간');
      expect(result).toMatch(/현재 시간은 .+입니다\./);
    });

    it('키워드 없을 때 비어있지 않은 응답 반환', async () => {
      const result = await handleChat('무작위 질문 xyz');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
