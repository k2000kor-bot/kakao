/**
 * typeGuards 유틸리티 테스트
 * 타입 가드 함수들의 정상 작동 확인
 */

import {
  isMessage,
  isAnalysisData,
  isChatAPIResponse,
  isMessageArray,
} from '../typeGuards';
import type { Message, AnalysisData, ChatAPIResponse } from '../../types';

describe('typeGuards', () => {
  describe('isMessage', () => {
    it('유효한 Message 객체를 확인해야 함', () => {
      const validMessage: Message = {
        id: 1,
        sender: 'user',
        text: 'Hello',
        timestamp: '2024-01-01T00:00:00Z',
        analysis: null,
      };

      expect(isMessage(validMessage)).toBe(true);
    });

    it('AI 메시지를 확인해야 함', () => {
      const aiMessage: Message = {
        id: 2,
        sender: 'ai',
        text: 'Hi there',
        timestamp: '2024-01-01T00:00:00Z',
        analysis: null,
      };

      expect(isMessage(aiMessage)).toBe(true);
    });

    it('AnalysisData가 포함된 메시지를 확인해야 함', () => {
      const analysisData: AnalysisData = {
        emotion_analysis: {},
        intent_analysis: {},
        success: true,
      };

      const messageWithAnalysis: Message = {
        id: 3,
        sender: 'user',
        text: 'Test',
        timestamp: '2024-01-01T00:00:00Z',
        analysis: analysisData,
      };

      expect(isMessage(messageWithAnalysis)).toBe(true);
    });

    it('유효하지 않은 객체를 거부해야 함', () => {
      expect(isMessage(null)).toBe(false);
      expect(isMessage(undefined)).toBe(false);
      expect(isMessage({})).toBe(false);
      expect(isMessage({ id: 1 })).toBe(false);
      expect(isMessage({ id: 1, sender: 'user' })).toBe(false);
      expect(isMessage({ id: 1, sender: 'invalid' })).toBe(false);
      expect(isMessage({ id: '1', sender: 'user', text: 'Hello' })).toBe(false);
    });

    it('잘못된 sender 값을 거부해야 함', () => {
      const invalidMessage = {
        id: 1,
        sender: 'invalid',
        text: 'Hello',
        timestamp: '2024-01-01T00:00:00Z',
        analysis: null,
      };

      expect(isMessage(invalidMessage)).toBe(false);
    });
  });

  describe('isAnalysisData', () => {
    it('유효한 AnalysisData 객체를 확인해야 함', () => {
      const validAnalysis: AnalysisData = {
        emotion_analysis: {
          emotion: 'happy',
          score: 0.8,
        },
        intent_analysis: {
          intent: 'greeting',
          confidence: 0.9,
        },
        success: true,
      };

      expect(isAnalysisData(validAnalysis)).toBe(true);
    });

    it('success가 false인 경우도 확인해야 함', () => {
      const analysis: AnalysisData = {
        emotion_analysis: {},
        intent_analysis: {},
        success: false,
      };

      expect(isAnalysisData(analysis)).toBe(true);
    });

    it('유효하지 않은 객체를 거부해야 함', () => {
      expect(isAnalysisData(null)).toBe(false);
      expect(isAnalysisData(undefined)).toBe(false);
      expect(isAnalysisData({})).toBe(false);
      expect(isAnalysisData({ emotion_analysis: {} })).toBe(false);
      expect(isAnalysisData({ intent_analysis: {} })).toBe(false);
      expect(isAnalysisData({ success: true })).toBe(false);
    });
  });

  describe('isChatAPIResponse', () => {
    it('유효한 ChatAPIResponse 객체를 확인해야 함', () => {
      const validResponse: ChatAPIResponse = {
        success: true,
        message: 'Success',
      };

      expect(isChatAPIResponse(validResponse)).toBe(true);
    });

    it('success가 false인 경우도 확인해야 함', () => {
      const response: ChatAPIResponse = {
        success: false,
        error: 'Error message',
      };

      expect(isChatAPIResponse(response)).toBe(true);
    });

    it('유효하지 않은 객체를 거부해야 함', () => {
      expect(isChatAPIResponse(null)).toBe(false);
      expect(isChatAPIResponse(undefined)).toBe(false);
      expect(isChatAPIResponse({})).toBe(false);
      expect(isChatAPIResponse({ message: 'test' })).toBe(false);
    });
  });

  describe('isMessageArray', () => {
    it('유효한 Message 배열을 확인해야 함', () => {
      const messages: Message[] = [
        {
          id: 1,
          sender: 'user',
          text: 'Hello',
          timestamp: '2024-01-01T00:00:00Z',
          analysis: null,
        },
        {
          id: 2,
          sender: 'ai',
          text: 'Hi',
          timestamp: '2024-01-01T00:00:01Z',
          analysis: null,
        },
      ];

      expect(isMessageArray(messages)).toBe(true);
    });

    it('빈 배열을 확인해야 함', () => {
      expect(isMessageArray([])).toBe(true);
    });

    it('유효하지 않은 배열을 거부해야 함', () => {
      expect(isMessageArray([{ id: 1 }])).toBe(false);
      expect(isMessageArray([null])).toBe(false);
      expect(isMessageArray([undefined])).toBe(false);
      expect(isMessageArray([{ id: 1, sender: 'user' }])).toBe(false);
    });

    it('배열이 아닌 값을 거부해야 함', () => {
      expect(isMessageArray(null)).toBe(false);
      expect(isMessageArray(undefined)).toBe(false);
      expect(isMessageArray({})).toBe(false);
      expect(isMessageArray('string')).toBe(false);
      expect(isMessageArray(123)).toBe(false);
    });

    it('일부만 유효한 배열을 거부해야 함', () => {
      const mixedArray = [
        {
          id: 1,
          sender: 'user',
          text: 'Hello',
          timestamp: '2024-01-01T00:00:00Z',
          analysis: null,
        },
        { id: 2 }, // 유효하지 않은 메시지
      ];

      expect(isMessageArray(mixedArray)).toBe(false);
    });
  });
});

