/**
 * 메시지 히스토리 관리 서비스
 * 로컬 스토리지에 메시지 저장, 검색, 즐겨찾기 관리
 * 
 * Task-C2: 메시지 히스토리 관리 개선
 * Task-D3: 고급 검색 기능 지원
 */

import advancedSearchParser from '../utils/advancedSearchParser';
import { errorLogger } from '../utils/errorLogger';
import { MESSAGE_HISTORY_STORAGE_KEY } from './messageHistoryStorageKeys';
import {
    coerceTrimmedString,
    isAssistantGenerationPlaceholder,
    STORED_ASSISTANT_INCOMPLETE_NOTICE,
} from '../utils/chatInputUtils';

export interface StoredMessage {
    id: number;
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
    sessionId: string;
    isLiked?: boolean;
    isDisliked?: boolean;
    isBookmarked?: boolean;
    tags?: string[];
    metadata?: {
        analysis?: unknown;
        [key: string]: unknown;
    };
}

interface MessageHistoryConfig {
    maxMessagesPerSession: number;
    maxSessions: number;
    storageKey: string;
}

export class MessageHistoryService {
    private config: MessageHistoryConfig = {
        maxMessagesPerSession: 1000,
        maxSessions: 50,
        storageKey: MESSAGE_HISTORY_STORAGE_KEY,
    };

    private isValidStoredMessage(m: unknown): m is StoredMessage {
        if (m === null || typeof m !== 'object') {
            return false;
        }
        const o = m as Record<string, unknown>;
        return (
            typeof o.id === 'number' &&
            (o.sender === 'user' || o.sender === 'ai') &&
            typeof o.text === 'string' &&
            typeof o.timestamp === 'string' &&
            typeof o.sessionId === 'string'
        );
    }

    private sanitizeSessionMessages(messages: unknown[]): StoredMessage[] {
        if (!Array.isArray(messages)) {
            return [];
        }
        return messages
            .filter((m): m is StoredMessage => this.isValidStoredMessage(m))
            .map((m) => {
                if (m.sender === 'ai' && isAssistantGenerationPlaceholder(m.text)) {
                    return { ...m, text: STORED_ASSISTANT_INCOMPLETE_NOTICE };
                }
                return m;
            });
    }

    /** 저장 직전에 조회 시와 동일하게 AI 생성 중 플레이스홀더를 안내 문구로 통일 */
    private normalizeMessageForStorage(message: StoredMessage): StoredMessage {
        if (message.sender === 'ai' && isAssistantGenerationPlaceholder(message.text)) {
            return { ...message, text: STORED_ASSISTANT_INCOMPLETE_NOTICE };
        }
        return message;
    }

    /**
     * 메시지 저장
     */
    saveMessage(message: StoredMessage): void {
        try {
            const normalized = this.normalizeMessageForStorage(message);
            const history = this.getHistory();
            const sessionMessages = history[normalized.sessionId] || [];

            // 중복 체크 (같은 ID가 있으면 업데이트)
            const existingIndex = sessionMessages.findIndex(m => m.id === normalized.id);
            if (existingIndex >= 0) {
                sessionMessages[existingIndex] = normalized;
            } else {
                sessionMessages.push(normalized);
            }

            // 메시지 수 제한
            if (sessionMessages.length > this.config.maxMessagesPerSession) {
                sessionMessages.shift(); // 가장 오래된 메시지 제거
            }

            history[normalized.sessionId] = sessionMessages;
            this.saveHistory(history);
        } catch (error) {
            errorLogger.error('메시지 저장 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'messageHistoryService',
                action: 'saveMessage',
                sessionId: message.sessionId,
            });
        }
    }

    /**
     * 세션의 메시지 조회
     */
    getSessionMessages(sessionId: string): StoredMessage[] {
        try {
            const history = this.getHistory();
            return history[sessionId] || [];
        } catch (error) {
            errorLogger.error('메시지 조회 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'messageHistoryService',
                action: 'getMessages',
                sessionId,
            });
            return [];
        }
    }

    /**
     * 모든 세션의 메시지 조회
     */
    getAllMessages(): StoredMessage[] {
        try {
            const history = this.getHistory();
            return Object.values(history).flat();
        } catch (error) {
            errorLogger.error('전체 메시지 조회 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'messageHistoryService',
                action: 'getAllMessages',
            });
            return [];
        }
    }

    /**
     * 메시지 검색
     * 고급 검색 기능 지원 (정규식, 부울 연산자)
     */
    searchMessages(query: string, options?: {
        sessionId?: string;
        sender?: 'user' | 'ai';
        isBookmarked?: boolean;
        isLiked?: boolean;
        dateFrom?: Date;
        dateTo?: Date;
        useRegex?: boolean;
        caseSensitive?: boolean;
    }): StoredMessage[] {
        try {
            let messages = options?.sessionId
                ? this.getSessionMessages(options.sessionId)
                : this.getAllMessages();

            // 필터링
            if (options?.sender) {
                messages = messages.filter(m => m.sender === options.sender);
            }

            if (options?.isBookmarked !== undefined) {
                messages = messages.filter(m => m.isBookmarked === options.isBookmarked);
            }

            if (options?.isLiked !== undefined) {
                messages = messages.filter(m => m.isLiked === options.isLiked);
            }

            if (options?.dateFrom) {
                messages = messages.filter(m => new Date(m.timestamp) >= options.dateFrom!);
            }

            if (options?.dateTo) {
                messages = messages.filter(m => new Date(m.timestamp) <= options.dateTo!);
            }

            // 고급 텍스트 검색
            if (coerceTrimmedString(query, '')) {
                try {
                    const searchQuery = advancedSearchParser.parseQuery(query, {
                        useRegex: options?.useRegex,
                        caseSensitive: options?.caseSensitive,
                    });

                    messages = messages.filter(m => {
                        const textMatch = advancedSearchParser.matches(m.text || '', searchQuery);
                        const tagMatch = m.tags?.some(tag => advancedSearchParser.matches(tag, searchQuery));
                        return textMatch || tagMatch;
                    });
                } catch (error) {
                    // 폴백: 기본 검색
                    errorLogger.warn('고급 검색 실패, 기본 검색으로 전환', {
                        component: 'messageHistoryService',
                        action: 'searchMessages',
                        query,
                        error: error instanceof Error ? error.message : String(error),
                    });
                    const lowerQuery = coerceTrimmedString(query, '').toLowerCase();
                    messages = messages.filter(m =>
                        m.text.toLowerCase().includes(lowerQuery) ||
                        m.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
                    );
                }
            }

            // 최신순 정렬
            return messages.sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
        } catch (error) {
            errorLogger.error('메시지 검색 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'messageHistoryService',
                action: 'searchMessages',
                query,
            });
            return [];
        }
    }

    /**
     * 즐겨찾기 메시지 조회
     */
    getBookmarkedMessages(): StoredMessage[] {
        return this.searchMessages('', { isBookmarked: true });
    }

    /**
     * 좋아요한 메시지 조회
     */
    getLikedMessages(): StoredMessage[] {
        return this.searchMessages('', { isLiked: true });
    }

    /**
     * 메시지 즐겨찾기 토글
     */
    toggleBookmark(messageId: number, sessionId: string): boolean {
        try {
            const history = this.getHistory();
            const sessionMessages = history[sessionId] || [];
            const message = sessionMessages.find(m => m.id === messageId);

            if (message) {
                message.isBookmarked = !message.isBookmarked;
                this.saveHistory(history);
                return message.isBookmarked;
            }

            return false;
        } catch (error) {
            errorLogger.error('즐겨찾기 토글 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'messageHistoryService',
                action: 'toggleBookmark',
                messageId,
            });
            return false;
        }
    }

    /**
     * 메시지 삭제
     */
    deleteMessage(messageId: number, sessionId: string): boolean {
        try {
            const history = this.getHistory();
            const sessionMessages = history[sessionId] || [];
            const filtered = sessionMessages.filter(m => m.id !== messageId);

            if (filtered.length !== sessionMessages.length) {
                history[sessionId] = filtered;
                this.saveHistory(history);
                return true;
            }

            return false;
        } catch (error) {
            errorLogger.error('메시지 삭제 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'messageHistoryService',
                action: 'deleteMessage',
                messageId,
            });
            return false;
        }
    }

    /**
     * 세션 삭제
     */
    deleteSession(sessionId: string): boolean {
        try {
            const history = this.getHistory();
            if (history[sessionId]) {
                delete history[sessionId];
                this.saveHistory(history);
                return true;
            }
            return false;
        } catch (error) {
            errorLogger.error('세션 삭제 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'messageHistoryService',
                action: 'deleteSession',
                sessionId,
            });
            return false;
        }
    }

    /**
     * 모든 히스토리 삭제
     */
    clearHistory(): void {
        try {
            localStorage.removeItem(this.config.storageKey);
        } catch (error) {
            errorLogger.error('히스토리 삭제 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'messageHistoryService',
                action: 'clearHistory',
            });
        }
    }

    /**
     * 히스토리 통계
     */
    getStatistics(): {
        totalMessages: number;
        totalSessions: number;
        bookmarkedMessages: number;
        likedMessages: number;
        sessions: Array<{
            sessionId: string;
            messageCount: number;
            lastMessageTime: string;
        }>;
    } {
        try {
            const history = this.getHistory();
            const allMessages = this.getAllMessages();
            const sessions = Object.keys(history).map(sessionId => {
                const messages = history[sessionId];
                return {
                    sessionId,
                    messageCount: messages.length,
                    lastMessageTime: messages.length > 0
                        ? messages[messages.length - 1].timestamp
                        : '',
                };
            });

            return {
                totalMessages: allMessages.length,
                totalSessions: sessions.length,
                bookmarkedMessages: allMessages.filter(m => m.isBookmarked).length,
                likedMessages: allMessages.filter(m => m.isLiked).length,
                sessions: sessions.sort((a, b) =>
                    new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
                ),
            };
        } catch (error) {
            errorLogger.error('통계 조회 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'messageHistoryService',
                action: 'getStatistics',
            });
            return {
                totalMessages: 0,
                totalSessions: 0,
                bookmarkedMessages: 0,
                likedMessages: 0,
                sessions: [],
            };
        }
    }

    /**
     * 히스토리 내보내기
     */
    exportHistory(format: 'json' | 'txt' = 'json'): string {
        try {
            const history = this.getHistory();

            if (format === 'json') {
                return JSON.stringify(history, null, 2);
            } else {
                // 텍스트 형식
                const lines: string[] = [];
                Object.entries(history).forEach(([sessionId, messages]) => {
                    lines.push(`=== 세션: ${sessionId} ===`);
                    messages.forEach(msg => {
                        lines.push(`[${msg.timestamp}] ${msg.sender.toUpperCase()}: ${msg.text}`);
                    });
                    lines.push('');
                });
                return lines.join('\n');
            }
        } catch (error) {
            errorLogger.error('히스토리 내보내기 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'messageHistoryService',
                action: 'exportHistory',
            });
            return '';
        }
    }

    /**
     * 히스토리 가져오기
     */
    importHistory(data: string, format: 'json' | 'txt' = 'json'): boolean {
        try {
            if (format === 'json') {
                const parsed = JSON.parse(data) as unknown;
                if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
                    return false;
                }
                const history = parsed as Record<string, unknown>;
                const sanitized: Record<string, StoredMessage[]> = {};
                for (const [sessionId, msgs] of Object.entries(history)) {
                    sanitized[sessionId] = Array.isArray(msgs)
                        ? this.sanitizeSessionMessages(msgs)
                        : [];
                }
                this.saveHistory(sanitized);
                return true;
            }
            // 텍스트 형식 파싱은 복잡하므로 JSON만 지원
            return false;
        } catch (error) {
            errorLogger.error('히스토리 가져오기 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'messageHistoryService',
                action: 'importHistory',
            });
            return false;
        }
    }

    /**
     * 내부: 히스토리 조회
     */
    private getHistory(): Record<string, StoredMessage[]> {
        try {
            const stored = localStorage.getItem(this.config.storageKey);
            if (!stored) {
                return {};
            }
            const parsed = JSON.parse(stored) as unknown;
            if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
                return {};
            }
            const raw = parsed as Record<string, unknown>;
            const out: Record<string, StoredMessage[]> = {};
            for (const [sessionId, msgs] of Object.entries(raw)) {
                out[sessionId] = Array.isArray(msgs) ? this.sanitizeSessionMessages(msgs) : [];
            }
            return out;
        } catch (error) {
            errorLogger.error('히스토리 조회 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'messageHistoryService',
                action: 'getHistory',
            });
            return {};
        }
    }

    /**
     * 내부: 히스토리 저장
     */
    private saveHistory(history: Record<string, StoredMessage[]>): void {
        try {
            // 세션 수 제한
            const sessionIds = Object.keys(history);
            if (sessionIds.length > this.config.maxSessions) {
                // 가장 오래된 세션 제거
                const sortedSessions = sessionIds
                    .map(id => ({
                        id,
                        lastMessageTime: history[id].length > 0
                            ? history[id][history[id].length - 1].timestamp
                            : '0',
                    }))
                    .sort((a, b) => a.lastMessageTime.localeCompare(b.lastMessageTime));

                const toRemove = sortedSessions.slice(0, sessionIds.length - this.config.maxSessions);
                toRemove.forEach(session => {
                    delete history[session.id];
                });
            }

            localStorage.setItem(this.config.storageKey, JSON.stringify(history));
        } catch (error) {
            errorLogger.error('히스토리 저장 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'messageHistoryService',
                action: 'saveHistory',
            });
            // 저장 공간 부족 시 오래된 세션 삭제 후 재시도
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                const sessionIds = Object.keys(history);
                const toRemove = sessionIds.slice(0, Math.floor(sessionIds.length / 2));
                toRemove.forEach(id => delete history[id]);
                try {
                    localStorage.setItem(this.config.storageKey, JSON.stringify(history));
                } catch (retryError) {
                    errorLogger.error('히스토리 저장 재시도 실패', retryError instanceof Error ? retryError : new Error(String(retryError)), {
                        component: 'messageHistoryService',
                        action: 'saveHistory',
                        retry: true,
                    });
                }
            }
        }
    }
}

export { MESSAGE_HISTORY_STORAGE_KEY } from './messageHistoryStorageKeys';

// 싱글톤 인스턴스
export const messageHistoryService = new MessageHistoryService();

export default messageHistoryService;

