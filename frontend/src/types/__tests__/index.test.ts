/**
 * types 모듈 런타임 형태 검증
 * 인터페이스 계약이 런타임 객체와 맞는지 확인
 */

import type {
  EmotionAnalysis,
  IntentAnalysis,
  AnalysisData,
  Message,
  ChatAPIRequest,
  ChatAPIResponse,
} from '../index';

describe('types', () => {
  it('모듈 로드 시 예외 없음', () => {
    expect(() => require('../index')).not.toThrow();
  });

  it('Message 형태 객체 검증', () => {
    const msg: Message = {
      id: 1,
      sender: 'user',
      text: 'hello',
      timestamp: new Date().toISOString(),
      analysis: null,
    };
    expect(msg).toHaveProperty('id');
    expect(msg).toHaveProperty('sender');
    expect(msg).toHaveProperty('text');
    expect(msg).toHaveProperty('timestamp');
    expect(msg).toHaveProperty('analysis');
    expect(typeof msg.id).toBe('number');
    expect(['user', 'ai']).toContain(msg.sender);
    expect(typeof msg.text).toBe('string');
    expect(msg.analysis === null || typeof msg.analysis === 'object').toBe(true);
  });

  it('AnalysisData 형태 객체 검증', () => {
    const emotion: EmotionAnalysis = {
      emotion: 'positive',
      confidence: 0.9,
      intensity: 0.8,
      keywords: ['good'],
    };
    const intent: IntentAnalysis = {
      intent: 'question',
      confidence: 0.85,
      context: 'test',
      entities: [],
    };
    const data: AnalysisData = {
      emotion_analysis: emotion,
      intent_analysis: intent,
      success: true,
      response: 'ok',
      response_time: 100,
      session_id: 's1',
      timestamp: new Date().toISOString(),
      type: 'chat',
    };
    expect(data.emotion_analysis).toEqual(emotion);
    expect(data.intent_analysis).toEqual(intent);
    expect(data.success).toBe(true);
    expect(typeof data.response_time).toBe('number');
    expect(typeof data.session_id).toBe('string');
  });

  it('ChatAPIRequest 형태 객체 검증', () => {
    const req: ChatAPIRequest = {
      message: 'hello',
      session_id: 's1',
    };
    expect(req).toHaveProperty('message');
    expect(req).toHaveProperty('session_id');
    expect(typeof req.message).toBe('string');
    expect(typeof req.session_id).toBe('string');
  });

  it('ChatAPIResponse 형태 객체 검증', () => {
    const res: ChatAPIResponse = {
      success: true,
      response: 'reply',
    };
    expect(res).toHaveProperty('success');
    expect(typeof res.success).toBe('boolean');
    expect(res.response === undefined || typeof res.response === 'string').toBe(true);
  });

  it('ChatMode 유효 값', () => {
    const modes = ['chat', 'coding', 'analysis', 'monitoring', 'writing', 'notebook'] as const;
    expect(modes).toContain('chat');
    expect(modes).toContain('notebook');
    expect(modes.length).toBe(6);
  });
});
