/**
 * API 호출 헬퍼 함수
 * 네트워크 오류를 더 잘 처리하기 위한 유틸리티
 */

import { errorLogger } from './errorLogger';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export class ApiHelper {
    private static baseUrls = {
        main: 'http://localhost:5001',
        advanced: 'http://localhost:5001',
        message: 'http://localhost:5001',
        upload: 'http://localhost:5001'
    };

    /**
     * 안전한 fetch 호출
     */
    static async safeFetch(url: string, options: RequestInit = {}): Promise<ApiResponse> {
        try {
            errorLogger.info(`API 호출: ${url}`, {
                component: 'apiHelper',
                action: 'safeFetch',
                url,
            });

            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            errorLogger.info(`API 응답 성공: ${url}`, {
                component: 'apiHelper',
                action: 'safeFetch',
                url,
                status: response.status,
            });

            return {
                success: true,
                data
            };
        } catch (error: any) {
            errorLogger.error(`API 호출 실패: ${url}`, error instanceof Error ? error : new Error(String(error)), {
                component: 'apiHelper',
                action: 'safeFetch',
                url,
            });

            return {
                success: false,
                error: error?.message || '알 수 없는 오류'
            };
        }
    }

    /**
 * 채팅방 목록 조회
 */
    static async getChatRooms(): Promise<ApiResponse> {
        try {
            const url = `${this.baseUrls.advanced}/api/v7/chat-rooms`;
            errorLogger.info('채팅방 목록 조회 URL', {
                component: 'apiHelper',
                action: 'getChatRooms',
                url,
            });
            const result = await this.safeFetch(url);

            if (result.success && result.data) {
                errorLogger.info(`채팅방 목록 조회 성공: ${result.data.chat_rooms?.length || 0}개`, {
                    component: 'apiHelper',
                    action: 'getChatRooms',
                    count: result.data.chat_rooms?.length || 0,
                });
            }

            return result;
        } catch (error: any) {
            errorLogger.error('채팅방 목록 조회 중 오류', error instanceof Error ? error : new Error(String(error)), {
                component: 'apiHelper',
                action: 'getChatRooms',
            });
            return {
                success: false,
                error: error?.message || '채팅방 목록 조회 중 오류가 발생했습니다.'
            };
        }
    }

    /**
 * 채팅방 메시지 조회
 */
    static async getChatMessages(roomId: string): Promise<ApiResponse> {
        try {
            const encodedRoomId = encodeURIComponent(roomId);
            const url = `${this.baseUrls.advanced}/api/v7/chat-messages/${encodedRoomId}`;
            errorLogger.info('메시지 조회 URL', {
                component: 'apiHelper',
                action: 'getChatMessages',
                url,
                roomId,
            });
            const result = await this.safeFetch(url);

            if (result.success && result.data) {
                errorLogger.info(`메시지 조회 성공: ${result.data.messages?.length || 0}개`, {
                    component: 'apiHelper',
                    action: 'getChatMessages',
                    count: result.data.messages?.length || 0,
                    roomId,
                });
            }

            return result;
        } catch (error: any) {
            errorLogger.error('메시지 조회 중 오류', error instanceof Error ? error : new Error(String(error)), {
                component: 'apiHelper',
                action: 'getChatMessages',
                roomId,
            });
            return {
                success: false,
                error: error?.message || '메시지 조회 중 오류가 발생했습니다.'
            };
        }
    }

    /**
     * 파일 업로드
     */
    static async uploadChatFile(file: File): Promise<ApiResponse> {
        try {
            errorLogger.info(`파일 업로드: ${file.name}`, {
                component: 'apiHelper',
                action: 'uploadChatFile',
                fileName: file.name,
                fileSize: file.size,
            });

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${this.baseUrls.upload}/api/upload-chat`, {
                method: 'POST',
                body: formData,
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            errorLogger.info('파일 업로드 성공', {
                component: 'apiHelper',
                action: 'uploadChatFile',
                fileName: file.name,
            });

            return {
                success: true,
                data
            };
        } catch (error: any) {
            errorLogger.error('파일 업로드 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'apiHelper',
                action: 'uploadChatFile',
                fileName: file.name,
            });

            return {
                success: false,
                error: error?.message || '파일 업로드 중 오류가 발생했습니다.'
            };
        }
    }

    /**
     * 서버 상태 확인
     */
    static async checkServerHealth(): Promise<Record<string, boolean>> {
        const servers = [
            { name: 'main', url: `${this.baseUrls.main}/api/health` },
            { name: 'advanced', url: `${this.baseUrls.advanced}/api/v7/chat-rooms` },
            { name: 'message', url: `${this.baseUrls.message}/api/status` },
            { name: 'upload', url: `${this.baseUrls.upload}/` }
        ];

        const results: Record<string, boolean> = {};

        for (const server of servers) {
            try {
                const response = await fetch(server.url, { mode: 'cors' });
                results[server.name] = response.ok;
            } catch (error) {
                errorLogger.error(`${server.name} 서버 연결 실패`, error instanceof Error ? error : new Error(String(error)), {
                    component: 'apiHelper',
                    action: 'checkServerHealth',
                    serverName: server.name,
                    serverUrl: server.url,
                });
                results[server.name] = false;
            }
        }

        return results;
    }
}

export default ApiHelper; 