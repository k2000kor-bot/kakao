/**
 * useChatEnhancements 훅 테스트
 */

import { renderHook, act } from '@testing-library/react';
import realTimeSync from '../../services/realTimeSync';
import recommendationService from '../../services/recommendationService';
import useChatEnhancements from '../useChatEnhancements';

jest.mock('../../services/realTimeSync', () => ({
  __esModule: true,
  default: {
    on: jest.fn(() => jest.fn()),
    configure: jest.fn(),
    sendEvent: jest.fn(),
  },
}));

jest.mock('../../services/recommendationService', () => ({
  __esModule: true,
  default: {
    generateSmartSuggestions: jest.fn(() => []),
    getContextualRecommendations: jest.fn(() => []),
  },
}));

jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

const mockOn: jest.MockedFunction<typeof realTimeSync.on> = jest.mocked(realTimeSync.on);
const mockSendEvent: jest.MockedFunction<typeof realTimeSync.sendEvent> = jest.mocked(realTimeSync.sendEvent);
const mockGenerateSmartSuggestions: jest.MockedFunction<typeof recommendationService.generateSmartSuggestions> =
  jest.mocked(recommendationService.generateSmartSuggestions);
const mockGetContextualRecommendations: jest.MockedFunction<typeof recommendationService.getContextualRecommendations> =
  jest.mocked(recommendationService.getContextualRecommendations);

describe('useChatEnhancements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOn.mockReturnValue(jest.fn());
    mockGenerateSmartSuggestions.mockReturnValue([]);
    mockGetContextualRecommendations.mockReturnValue([]);
  });

  it('초기 상태 반환', () => {
    const { result } = renderHook(() => useChatEnhancements({ enableRealTimeSync: false }));

    expect(result.current.typingUsers).toEqual([]);
    expect(result.current.readReceipts).toEqual(new Map());
    expect(result.current.reactions).toEqual(new Map());
    expect(result.current.quickReplies).toEqual([]);
    expect(result.current.smartSuggestions).toEqual([]);
  });

  it('getMessageReactions(messageId) - 없으면 빈 배열', () => {
    const { result } = renderHook(() => useChatEnhancements({ enableRealTimeSync: false }));

    expect(result.current.getMessageReactions('msg-1')).toEqual([]);
  });

  it('getMessageReadReceipts(messageId) - 없으면 빈 배열', () => {
    const { result } = renderHook(() => useChatEnhancements({ enableRealTimeSync: false }));

    expect(result.current.getMessageReadReceipts('msg-1')).toEqual([]);
  });

  it('getTypingUsers() - 초기엔 빈 배열', () => {
    const { result } = renderHook(() => useChatEnhancements({ enableRealTimeSync: false }));

    expect(result.current.getTypingUsers()).toEqual([]);
  });

  it('enableSmartSuggestions: false면 generateSmartSuggestions 호출해도 recommendationService 미호출', () => {
    const { result } = renderHook(() =>
      useChatEnhancements({ enableRealTimeSync: false, enableSmartSuggestions: false })
    );

    act(() => {
      result.current.generateSmartSuggestions('hello');
    });

    expect(mockGenerateSmartSuggestions).not.toHaveBeenCalled();
  });

  it('enableQuickReplies: false면 generateQuickReplies가 빈 배열 반환', () => {
    const { result } = renderHook(() =>
      useChatEnhancements({ enableRealTimeSync: false, enableQuickReplies: false })
    );

    const out = result.current.generateQuickReplies('context');

    expect(out).toEqual([]);
    expect(mockGetContextualRecommendations).not.toHaveBeenCalled();
  });

  it('enableRealTimeSync: false면 sendTypingIndicator 호출해도 sendEvent 미호출', () => {
    const { result } = renderHook(() =>
      useChatEnhancements({ enableRealTimeSync: false, enableTypingIndicators: true })
    );

    act(() => {
      result.current.sendTypingIndicator(true, '나');
    });

    expect(mockSendEvent).not.toHaveBeenCalled();
  });

  it('enableRealTimeSync: false면 sendReadReceipt 호출해도 동작 없음', () => {
    const { result } = renderHook(() =>
      useChatEnhancements({ enableRealTimeSync: false, enableReadReceipts: true })
    );

    act(() => {
      result.current.sendReadReceipt('msg-1');
    });

    expect(mockSendEvent).not.toHaveBeenCalled();
    expect(result.current.getMessageReadReceipts('msg-1')).toEqual([]);
  });

  it('enableRealTimeSync: false면 sendReaction 호출해도 sendEvent 미호출', () => {
    const { result } = renderHook(() =>
      useChatEnhancements({ enableRealTimeSync: false, enableReactions: true })
    );

    act(() => {
      result.current.sendReaction('msg-1', '👍');
    });

    expect(mockSendEvent).not.toHaveBeenCalled();
  });

  it('enableQuickReplies: true면 generateQuickReplies가 recommendationService 결과 반환 및 state 반영', () => {
    const recs = [
      { id: '1', type: 'question' as const, title: '제목1', description: '', confidence: 0.9, category: 'cat1', tags: [] },
      { id: '2', type: 'topic' as const, title: '제목2', description: '', confidence: 0.8, category: 'cat2', tags: [] },
    ];
    mockGetContextualRecommendations.mockReturnValue(recs);

    const { result } = renderHook(() => useChatEnhancements({ enableRealTimeSync: false }));

    let out: ReturnType<typeof result.current.generateQuickReplies> = [];
    act(() => {
      out = result.current.generateQuickReplies('context');
    });

    expect(mockGetContextualRecommendations).toHaveBeenCalledWith('context', 3);
    expect(out).toEqual([
      { id: 'quick-0', text: '제목1', category: 'cat1' },
      { id: 'quick-1', text: '제목2', category: 'cat2' },
    ]);
    expect(result.current.quickReplies).toEqual(out);
  });

  it('enableRealTimeSync: true, enableReadReceipts: true면 sendReadReceipt 시 sendEvent·로컬 반영', () => {
    const { result } = renderHook(() => useChatEnhancements({ enableRealTimeSync: true, enableReadReceipts: true }));

    act(() => {
      result.current.sendReadReceipt('msg-1');
    });

    expect(mockSendEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'update',
        data: expect.objectContaining({
          readReceipt: expect.objectContaining({
            messageId: 'msg-1',
            userId: 'current-user',
          }),
        }),
      })
    );
    const receipts = result.current.getMessageReadReceipts('msg-1');
    expect(receipts.length).toBe(1);
    expect(receipts[0].messageId).toBe('msg-1');
    expect(receipts[0].userId).toBe('current-user');
  });

  it('enableRealTimeSync: true, enableReactions: true면 sendReaction 시 sendEvent·로컬 반영', () => {
    const { result } = renderHook(() => useChatEnhancements({ enableRealTimeSync: true, enableReactions: true }));

    act(() => {
      result.current.sendReaction('msg-2', '👍');
    });

    expect(mockSendEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'update',
        data: expect.objectContaining({
          reaction: expect.objectContaining({
            messageId: 'msg-2',
            userId: 'current-user',
            reaction: '👍',
          }),
        }),
      })
    );
    const reactions = result.current.getMessageReactions('msg-2');
    expect(reactions.length).toBe(1);
    expect(reactions[0].messageId).toBe('msg-2');
    expect(reactions[0].reaction).toBe('👍');
  });

  it('enableSmartSuggestions: true면 generateSmartSuggestions 호출 시 800ms 후 recommendationService 호출·smartSuggestions 반영', () => {
    jest.useFakeTimers();
    mockGenerateSmartSuggestions.mockReturnValue(['제안1', '제안2']);

    const { result } = renderHook(() => useChatEnhancements({ enableRealTimeSync: false }));

    act(() => {
      result.current.generateSmartSuggestions('코드');
    });

    expect(result.current.smartSuggestions).toEqual([]);

    act(() => {
      jest.advanceTimersByTime(800);
    });

    expect(mockGenerateSmartSuggestions).toHaveBeenCalledWith('코드');
    expect(result.current.smartSuggestions).toEqual(['제안1', '제안2']);

    jest.useRealTimers();
  });
});
