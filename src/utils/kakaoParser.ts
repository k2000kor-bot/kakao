export interface KakaoMessage {
    id: string;
    date: string;
    time: string;
    sender: string;
    content: string;
    timestamp: Date;
    isDeleted?: boolean;
    hasMedia?: boolean;
}

export interface KakaoChatRoom {
    roomName: string;
    participantCount: number;
    saveDate: string;
    messages: KakaoMessage[];
    participants: string[];
}

export class KakaoParser {
    // 카카오톡 대화 파일을 파싱하는 메인 함수
    static parseKakaoFile(fileContent: string): KakaoChatRoom {
        const lines = fileContent.split('\n');
        const result: KakaoChatRoom = {
            roomName: '',
            participantCount: 0,
            saveDate: '',
            messages: [],
            participants: []
        };

        let currentDate = '';
        const participantSet = new Set<string>();

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // 방 제목 파싱
            if (line.includes('님과 카카오톡 대화')) {
                result.roomName = line.replace(' 님과 카카오톡 대화', '').trim();
            }

            // 저장 날짜 파싱
            if (line.startsWith('저장한 날짜')) {
                result.saveDate = line.replace('저장한 날짜 : ', '').trim();
            }

            // 날짜 라인 파싱 (예: "2025년 6월 24일 오전 9:22")
            if (this.isDateLine(line)) {
                currentDate = line;
                continue;
            }

            // 메시지 라인 파싱
            const messageData = this.parseMessageLine(line, currentDate);
            if (messageData) {
                participantSet.add(messageData.sender);
                result.messages.push(messageData);
            }
        }

        result.participants = Array.from(participantSet);
        result.participantCount = result.participants.length;

        return result;
    }

    // 날짜 라인인지 확인
    private static isDateLine(line: string): boolean {
        const datePattern = /^\d{4}년 \d{1,2}월 \d{1,2}일 (오전|오후) \d{1,2}:\d{2}$/;
        return datePattern.test(line);
    }

    // 메시지 라인 파싱
    private static parseMessageLine(line: string, currentDate: string): KakaoMessage | null {
        // 메시지 패턴: "2025년 6월 24일 오전 9:22, 0098 : 메시지 내용"
        const messagePattern = /^(\d{4}년 \d{1,2}월 \d{1,2}일 (오전|오후) \d{1,2}:\d{2}), ([^:]+) : (.+)$/;
        const match = line.match(messagePattern);

        if (!match) return null;

        const [, dateTime, , sender, content] = match;

        return {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            date: this.extractDate(dateTime),
            time: this.extractTime(dateTime),
            sender: sender.trim(),
            content: content.trim(),
            timestamp: this.parseDateTime(dateTime),
            isDeleted: content.includes('삭제된 메시지입니다'),
            hasMedia: this.hasMediaContent(content)
        };
    }

    // 날짜 추출
    private static extractDate(dateTime: string): string {
        const match = dateTime.match(/(\d{4}년 \d{1,2}월 \d{1,2}일)/);
        return match ? match[1] : '';
    }

    // 시간 추출
    private static extractTime(dateTime: string): string {
        const match = dateTime.match(/(오전|오후) (\d{1,2}:\d{2})/);
        return match ? `${match[1]} ${match[2]}` : '';
    }

    // 날짜 시간을 Date 객체로 변환
    private static parseDateTime(dateTime: string): Date {
        const match = dateTime.match(/(\d{4})년 (\d{1,2})월 (\d{1,2})일 (오전|오후) (\d{1,2}):(\d{2})/);
        if (!match) return new Date();

        const [, year, month, day, ampm, hour, minute] = match;
        let hour24 = parseInt(hour);

        if (ampm === '오후' && hour24 !== 12) {
            hour24 += 12;
        } else if (ampm === '오전' && hour24 === 12) {
            hour24 = 0;
        }

        return new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            hour24,
            parseInt(minute)
        );
    }

    // 미디어 콘텐츠 포함 여부 확인
    private static hasMediaContent(content: string): boolean {
        const mediaKeywords = ['사진', '동영상', '음성메시지', '파일', '이모티콘'];
        return mediaKeywords.some(keyword => content.includes(keyword));
    }

    // 메시지 필터링 (검색, 날짜 범위 등)
    static filterMessages(
        messages: KakaoMessage[],
        filters: {
            searchText?: string;
            sender?: string;
            dateFrom?: Date;
            dateTo?: Date;
            excludeDeleted?: boolean;
        }
    ): KakaoMessage[] {
        return messages.filter(message => {
            // 삭제된 메시지 제외
            if (filters.excludeDeleted && message.isDeleted) return false;

            // 발신자 필터
            if (filters.sender && message.sender !== filters.sender) return false;

            // 텍스트 검색
            if (filters.searchText && !message.content.toLowerCase().includes(filters.searchText.toLowerCase())) return false;

            // 날짜 범위 필터
            if (filters.dateFrom && message.timestamp < filters.dateFrom) return false;
            if (filters.dateTo && message.timestamp > filters.dateTo) return false;

            return true;
        });
    }

    // 통계 정보 생성
    static generateStats(chatRoom: KakaoChatRoom) {
        const totalMessages = chatRoom.messages.length;
        const deletedMessages = chatRoom.messages.filter(m => m.isDeleted).length;
        const mediaMessages = chatRoom.messages.filter(m => m.hasMedia).length;

        const messagesByParticipant = chatRoom.messages.reduce((acc, message) => {
            acc[message.sender] = (acc[message.sender] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const mostActiveParticipant = Object.entries(messagesByParticipant)
            .sort(([, a], [, b]) => b - a)[0];

        const dateRange = {
            start: chatRoom.messages[0]?.timestamp,
            end: chatRoom.messages[chatRoom.messages.length - 1]?.timestamp
        };

        return {
            totalMessages,
            deletedMessages,
            mediaMessages,
            activeParticipants: Object.keys(messagesByParticipant).length,
            mostActiveParticipant: mostActiveParticipant ? {
                name: mostActiveParticipant[0],
                messageCount: mostActiveParticipant[1]
            } : null,
            dateRange,
            messagesByParticipant
        };
    }
} 