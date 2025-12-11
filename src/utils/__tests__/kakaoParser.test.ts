/**
 * kakaoParser 유틸리티 테스트
 * 카카오톡 대화 파일 파싱 기능 확인
 */

import { KakaoParser, KakaoMessage, KakaoChatRoom } from '../kakaoParser';

describe('KakaoParser', () => {
  const sampleKakaoFile = `홍길동 님과 카카오톡 대화
저장한 날짜 : 2025년 6월 24일 오전 9:22

2025년 6월 24일 오전 9:22
2025년 6월 24일 오전 9:22, 홍길동 : 안녕하세요!
2025년 6월 24일 오전 9:23, 김철수 : 안녕하세요! 반갑습니다.
2025년 6월 24일 오전 9:24, 홍길동 : 오늘 날씨가 좋네요.
2025년 6월 24일 오전 9:25, 김철수 : 사진
2025년 6월 24일 오전 9:26, 홍길동 : 삭제된 메시지입니다`;

  describe('parseKakaoFile', () => {
    it('카카오톡 파일을 파싱해야 함', () => {
      const result = KakaoParser.parseKakaoFile(sampleKakaoFile);

      expect(result.roomName).toBe('홍길동');
      expect(result.saveDate).toBe('2025년 6월 24일 오전 9:22');
      expect(result.messages.length).toBe(5);
      expect(result.participants.length).toBe(2);
      expect(result.participantCount).toBe(2);
    });

    it('방 제목을 올바르게 파싱해야 함', () => {
      const file = '김철수 님과 카카오톡 대화\n저장한 날짜 : 2025년 6월 24일';
      const result = KakaoParser.parseKakaoFile(file);

      expect(result.roomName).toBe('김철수');
    });

    it('저장 날짜를 올바르게 파싱해야 함', () => {
      const file = '홍길동 님과 카카오톡 대화\n저장한 날짜 : 2025년 7월 1일 오후 3:30';
      const result = KakaoParser.parseKakaoFile(file);

      expect(result.saveDate).toBe('2025년 7월 1일 오후 3:30');
    });

    it('메시지를 올바르게 파싱해야 함', () => {
      const result = KakaoParser.parseKakaoFile(sampleKakaoFile);

      expect(result.messages[0].sender).toBe('홍길동');
      expect(result.messages[0].content).toBe('안녕하세요!');
      expect(result.messages[1].sender).toBe('김철수');
      expect(result.messages[1].content).toBe('안녕하세요! 반갑습니다.');
    });

    it('삭제된 메시지를 감지해야 함', () => {
      const result = KakaoParser.parseKakaoFile(sampleKakaoFile);

      const deletedMessage = result.messages.find(m => m.isDeleted);
      expect(deletedMessage).toBeDefined();
      expect(deletedMessage?.content).toContain('삭제된 메시지입니다');
    });

    it('미디어 메시지를 감지해야 함', () => {
      const result = KakaoParser.parseKakaoFile(sampleKakaoFile);

      const mediaMessage = result.messages.find(m => m.hasMedia);
      expect(mediaMessage).toBeDefined();
      expect(mediaMessage?.content).toBe('사진');
    });

    it('참가자 목록을 올바르게 생성해야 함', () => {
      const result = KakaoParser.parseKakaoFile(sampleKakaoFile);

      expect(result.participants).toContain('홍길동');
      expect(result.participants).toContain('김철수');
      expect(result.participants.length).toBe(2);
    });
  });

  describe('filterMessages', () => {
    let messages: KakaoMessage[];

    beforeEach(() => {
      const result = KakaoParser.parseKakaoFile(sampleKakaoFile);
      messages = result.messages;
    });

    it('텍스트로 메시지를 필터링해야 함', () => {
      const filtered = KakaoParser.filterMessages(messages, {
        searchText: '안녕',
      });

      expect(filtered.length).toBe(2);
      expect(filtered.every(m => m.content.includes('안녕'))).toBe(true);
    });

    it('발신자로 메시지를 필터링해야 함', () => {
      const filtered = KakaoParser.filterMessages(messages, {
        sender: '홍길동',
      });

      expect(filtered.length).toBe(3);
      expect(filtered.every(m => m.sender === '홍길동')).toBe(true);
    });

    it('삭제된 메시지를 제외해야 함', () => {
      const filtered = KakaoParser.filterMessages(messages, {
        excludeDeleted: true,
      });

      expect(filtered.every(m => !m.isDeleted)).toBe(true);
    });

    it('날짜 범위로 메시지를 필터링해야 함', () => {
      const dateFrom = new Date('2025-06-24T09:23:00');
      const dateTo = new Date('2025-06-24T09:25:00');

      const filtered = KakaoParser.filterMessages(messages, {
        dateFrom,
        dateTo,
      });

      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every(m => {
        return m.timestamp >= dateFrom && m.timestamp <= dateTo;
      })).toBe(true);
    });

    it('복합 필터를 적용해야 함', () => {
      const filtered = KakaoParser.filterMessages(messages, {
        sender: '홍길동',
        excludeDeleted: true,
        searchText: '안녕',
      });

      expect(filtered.length).toBe(1);
      expect(filtered[0].sender).toBe('홍길동');
      expect(filtered[0].content).toContain('안녕');
    });
  });

  describe('generateStats', () => {
    it('통계 정보를 생성해야 함', () => {
      const chatRoom = KakaoParser.parseKakaoFile(sampleKakaoFile);
      const stats = KakaoParser.generateStats(chatRoom);

      expect(stats.totalMessages).toBe(5);
      expect(stats.deletedMessages).toBe(1);
      expect(stats.mediaMessages).toBe(1);
      expect(stats.activeParticipants).toBe(2);
      expect(stats.mostActiveParticipant).toBeDefined();
      expect(stats.dateRange.start).toBeDefined();
      expect(stats.dateRange.end).toBeDefined();
    });

    it('가장 활발한 참가자를 올바르게 식별해야 함', () => {
      const chatRoom = KakaoParser.parseKakaoFile(sampleKakaoFile);
      const stats = KakaoParser.generateStats(chatRoom);

      expect(stats.mostActiveParticipant?.name).toBe('홍길동');
      expect(stats.mostActiveParticipant?.messageCount).toBe(3);
    });

    it('빈 채팅방에 대한 통계를 처리해야 함', () => {
      const emptyRoom: KakaoChatRoom = {
        roomName: 'Test',
        participantCount: 0,
        saveDate: '',
        messages: [],
        participants: [],
      };

      const stats = KakaoParser.generateStats(emptyRoom);

      expect(stats.totalMessages).toBe(0);
      expect(stats.deletedMessages).toBe(0);
      expect(stats.mediaMessages).toBe(0);
      expect(stats.activeParticipants).toBe(0);
      expect(stats.mostActiveParticipant).toBeNull();
    });
  });
});

