"""
개선된 카카오톡 대화 파서
카카오톡 대화 대응 형식에 맞춘 정확한 파싱
"""

import re
import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class KakaoMessage:
    """카카오톡 메시지"""
    timestamp: datetime
    sender: str
    content: str
    message_type: str = "text"  # text, image, video, audio, file, deleted
    room_name: str = ""
    raw_line: str = ""

@dataclass
class KakaoRoom:
    """카카오톡 대화방"""
    room_name: str
    participant_count: int
    save_date: datetime
    messages: List[KakaoMessage]
    participants: List[str]
    media_folder: Optional[str] = None
    document_folder: Optional[str] = None

class ImprovedKakaoChatParser:
    """개선된 카카오톡 대화 파서"""
    
    def __init__(self):
        # 카카오톡 대화 대응 메시지 패턴
        # "2025년 6월 24일 오전 9:22, 0098 : 조합원들의 의사가 중요한게"
        self.message_pattern = r'^(\d{4})년 (\d{1,2})월 (\d{1,2})일 (오전|오후) (\d{1,2}):(\d{2}), ([^:]+) : (.+)$'
        
        # 헤더 패턴들
        self.room_header_pattern = r'^(.+?)\s+(\d+)\s*님과 카카오톡 대화$'
        self.save_date_pattern = r'^저장한 날짜\s*:\s*(\d{4})년 (\d{1,2})월 (\d{1,2})일 (오전|오후) (\d{1,2}):(\d{2})$'
        
        # 날짜 구분선 패턴 (메시지가 아닌 날짜 표시)
        self.date_separator_pattern = r'^(\d{4})년 (\d{1,2})월 (\d{1,2})일 (오전|오후) (\d{1,2}):(\d{2})$'
        
        # 특수 메시지
        self.deleted_message = "삭제된 메시지입니다."
        self.media_patterns = {
            'image': r'사진',
            'video': r'동영상', 
            'audio': r'음성',
            'file': r'파일'
        }
    
    def parse_chat_file(self, file_path: str) -> KakaoRoom:
        """카카오톡 대화 파일 파싱"""
        
        logger.info(f"개선된 카카오톡 파서로 파일 파싱 시작: {file_path}")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # BOM 제거
            content = content.lstrip('\ufeff')
            lines = content.split('\n')
            
            # 헤더 정보 파싱
            room_info = self._parse_header(lines)
            
            # 메시지 파싱
            messages = self._parse_messages(lines, room_info['room_name'])
            
            # 참여자 목록 추출
            participants = list(set([msg.sender for msg in messages if msg.sender]))
            
            # 미디어/문서 폴더 확인
            base_dir = os.path.dirname(file_path)
            media_folder = os.path.join(base_dir, "미디어") if os.path.exists(os.path.join(base_dir, "미디어")) else None
            document_folder = os.path.join(base_dir, "문서") if os.path.exists(os.path.join(base_dir, "문서")) else None
            
            kakao_room = KakaoRoom(
                room_name=room_info['room_name'],
                participant_count=room_info['participant_count'],
                save_date=room_info['save_date'],
                messages=messages,
                participants=participants,
                media_folder=media_folder,
                document_folder=document_folder
            )
            
            logger.info(f"파싱 완료: {len(messages)}개 메시지, {len(participants)}명 참여자")
            return kakao_room
            
        except Exception as e:
            logger.error(f"파싱 실패: {e}")
            raise
    
    def _parse_header(self, lines: List[str]) -> Dict[str, Any]:
        """헤더 정보 파싱"""
        
        room_name = ""
        participant_count = 0
        save_date = None
        
        for line in lines[:10]:  # 처음 10줄에서 헤더 정보 찾기
            line = line.strip()
            
            # 방 이름과 참여자 수
            room_match = re.match(self.room_header_pattern, line)
            if room_match:
                room_name = room_match.group(1).strip()
                participant_count = int(room_match.group(2))
                continue
            
            # 저장 날짜
            save_match = re.match(self.save_date_pattern, line)
            if save_match:
                year = int(save_match.group(1))
                month = int(save_match.group(2))
                day = int(save_match.group(3))
                ampm = save_match.group(4)
                hour = int(save_match.group(5))
                minute = int(save_match.group(6))
                
                # 24시간 형식으로 변환
                if ampm == "오후" and hour != 12:
                    hour += 12
                elif ampm == "오전" and hour == 12:
                    hour = 0
                
                save_date = datetime(year, month, day, hour, minute)
                continue
        
        return {
            'room_name': room_name,
            'participant_count': participant_count,
            'save_date': save_date or datetime.now()
        }
    
    def _parse_messages(self, lines: List[str], room_name: str) -> List[KakaoMessage]:
        """메시지들 파싱"""
        
        messages = []
        i = 0
        
        while i < len(lines):
            line = lines[i].strip()
            
            if not line:
                i += 1
                continue
            
            # 날짜 구분선 체크 (메시지가 아닌 단순 날짜)
            if re.match(self.date_separator_pattern, line):
                i += 1
                continue
            
            # 메시지 패턴 체크
            msg_match = re.match(self.message_pattern, line)
            if msg_match:
                try:
                    message = self._parse_message_line(msg_match, room_name, line)
                    if message:
                        # 여러 줄 메시지 처리
                        i += 1
                        continuation_content = []
                        
                        while i < len(lines):
                            next_line = lines[i].strip()
                            
                            # 빈 줄이면 스킵
                            if not next_line:
                                i += 1
                                continue
                            
                            # 다음 메시지나 날짜 구분선이면 중단
                            if (re.match(self.message_pattern, next_line) or 
                                re.match(self.date_separator_pattern, next_line)):
                                break
                            
                            # 연속 내용으로 추가
                            continuation_content.append(next_line)
                            i += 1
                        
                        # 여러 줄 내용 합치기
                        if continuation_content:
                            message.content += '\n' + '\n'.join(continuation_content)
                        
                        messages.append(message)
                        continue
                        
                except Exception as e:
                    logger.warning(f"메시지 파싱 오류 (라인 {i}): {e}")
                    logger.warning(f"문제 라인: {line}")
            
            i += 1
        
        return messages
    
    def _parse_message_line(self, match: re.Match, room_name: str, raw_line: str) -> Optional[KakaoMessage]:
        """개별 메시지 라인 파싱"""
        
        try:
            year = int(match.group(1))
            month = int(match.group(2))
            day = int(match.group(3))
            ampm = match.group(4)
            hour = int(match.group(5))
            minute = int(match.group(6))
            sender = match.group(7).strip()
            content = match.group(8).strip()
            
            # 24시간 형식으로 변환
            if ampm == "오후" and hour != 12:
                hour += 12
            elif ampm == "오전" and hour == 12:
                hour = 0
            
            timestamp = datetime(year, month, day, hour, minute)
            
            # 메시지 타입 결정
            message_type = "text"
            if content == self.deleted_message:
                message_type = "deleted"
            else:
                for media_type, pattern in self.media_patterns.items():
                    if pattern in content:
                        message_type = media_type
                        break
            
            return KakaoMessage(
                timestamp=timestamp,
                sender=sender,
                content=content,
                message_type=message_type,
                room_name=room_name,
                raw_line=raw_line
            )
            
        except Exception as e:
            logger.error(f"메시지 라인 파싱 실패: {e}")
            return None
    
    def save_to_json(self, kakao_room: KakaoRoom, output_path: str):
        """JSON 형태로 저장"""
        
        data = {
            'room_name': kakao_room.room_name,
            'participant_count': kakao_room.participant_count,
            'save_date': kakao_room.save_date.isoformat(),
            'participants': kakao_room.participants,
            'media_folder': kakao_room.media_folder,
            'document_folder': kakao_room.document_folder,
            'messages': []
        }
        
        for msg in kakao_room.messages:
            data['messages'].append({
                'timestamp': msg.timestamp.isoformat(),
                'sender': msg.sender,
                'content': msg.content,
                'message_type': msg.message_type,
                'room_name': msg.room_name
            })
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"JSON 저장 완료: {output_path}")
    
    def get_statistics(self, kakao_room: KakaoRoom) -> Dict[str, Any]:
        """대화 통계 정보"""
        
        stats = {
            'room_name': kakao_room.room_name,
            'total_messages': len(kakao_room.messages),
            'total_participants': len(kakao_room.participants),
            'date_range': {
                'start': min([msg.timestamp for msg in kakao_room.messages]).isoformat() if kakao_room.messages else None,
                'end': max([msg.timestamp for msg in kakao_room.messages]).isoformat() if kakao_room.messages else None
            },
            'message_types': {},
            'top_senders': {},
            'daily_message_count': {}
        }
        
        # 메시지 타입별 통계
        for msg in kakao_room.messages:
            stats['message_types'][msg.message_type] = stats['message_types'].get(msg.message_type, 0) + 1
            stats['top_senders'][msg.sender] = stats['top_senders'].get(msg.sender, 0) + 1
            
            date_key = msg.timestamp.strftime('%Y-%m-%d')
            stats['daily_message_count'][date_key] = stats['daily_message_count'].get(date_key, 0) + 1
        
        # 상위 발송자 정렬
        stats['top_senders'] = dict(sorted(stats['top_senders'].items(), key=lambda x: x[1], reverse=True)[:10])
        
        return stats

# 테스트 함수
def test_improved_parser():
    """개선된 파서 테스트"""
    
    parser = ImprovedKakaoChatParser()
    chat_file = '../chat_rooms/[인증]행복한소유☆개포우성7차/[인증]행복한소유☆개포우성7차.txt'
    
    if os.path.exists(chat_file):
        print('📱 개선된 카카오톡 대화 파서 테스트')
        print('=' * 60)
        
        kakao_room = parser.parse_chat_file(chat_file)
        
        print(f'🏠 대화방: {kakao_room.room_name}')
        print(f'👥 참여자 수: {kakao_room.participant_count}명')
        print(f'💬 총 메시지 수: {len(kakao_room.messages)}개')
        print(f'📅 저장 날짜: {kakao_room.save_date}')
        print(f'👤 실제 참여자: {len(kakao_room.participants)}명')
        print()
        
        # 통계 정보
        stats = parser.get_statistics(kakao_room)
        print('📊 대화 통계:')
        print(f'  - 메시지 타입: {stats["message_types"]}')
        print(f'  - 기간: {stats["date_range"]["start"]} ~ {stats["date_range"]["end"]}')
        print()
        
        # 상위 발송자
        print('👥 상위 발송자 (메시지 수):')
        for i, (sender, count) in enumerate(list(stats['top_senders'].items())[:5], 1):
            print(f'  {i}. {sender}: {count}개')
        print()
        
        # 최근 메시지 샘플
        print('💬 최근 메시지 샘플:')
        for msg in kakao_room.messages[-3:]:
            content_preview = msg.content.replace('\n', ' ')[:80]
            print(f'  [{msg.timestamp.strftime("%m-%d %H:%M")}] {msg.sender}: {content_preview}...')
        
        # JSON 저장
        output_file = 'parsed_kakao_chat.json'
        parser.save_to_json(kakao_room, output_file)
        print(f'\n💾 JSON 저장: {output_file}')
        
        print('\n✅ 개선된 카카오톡 대화 파싱 및 데이터베이스화 완료!')
        
        return kakao_room
    else:
        print('❌ 카카오톡 대화 파일을 찾을 수 없습니다.')
        return None

if __name__ == "__main__":
    test_improved_parser() 