#!/usr/bin/env python3
"""
카카오톡 대화 파일 파서
- 카카오톡 txt 파일을 구조화된 데이터로 변환
- 메시지, 시간, 발신자 정보 추출
- 미디어 파일 링크 처리
- 삭제된 메시지 처리
"""

import re
import os
from datetime import datetime
from typing import List, Dict, Optional, Any, Tuple
from dataclasses import dataclass
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class KakaoMessage:
    """카카오톡 메시지 데이터 클래스"""
    timestamp: datetime
    sender: str
    content: str
    message_type: str  # text, image, video, audio, deleted, system
    original_sender_id: Optional[str] = None
    media_files: List[str] = None
    is_deleted: bool = False
    room_name: str = ""


@dataclass
class KakaoRoom:
    """카카오톡 방 정보"""
    room_name: str
    participant_count: int
    save_date: datetime
    messages: List[KakaoMessage]
    participants: List[str]
    media_folder: Optional[str] = None
    document_folder: Optional[str] = None


class KakaoChatParser:
    """카카오톡 대화 파서"""
    
    def __init__(self):
        # 날짜/시간 패턴
        self.date_pattern = r'(\d{4})년 (\d{1,2})월 (\d{1,2})일'
        self.time_pattern = r'(오전|오후) (\d{1,2}):(\d{2})'
        self.datetime_pattern = r'(\d{4})년 (\d{1,2})월 (\d{1,2})일 (오전|오후) (\d{1,2}):(\d{2})'
        
        # 메시지 패턴
        self.message_pattern = r'(\d{4})년 (\d{1,2})월 (\d{1,2})일 (오전|오후) (\d{1,2}):(\d{2}), ([^:]+) : (.+)'
        
        # 특수 메시지 패턴들
        self.deleted_message = "삭제된 메시지입니다."
        self.media_patterns = {
            'image': r'<사진.*?>',
            'video': r'<동영상.*?>',
            'audio': r'<음성.*?>',
            'file': r'<파일.*?>'
        }
        
    def parse_chat_file(self, file_path: str) -> KakaoRoom:
        """카카오톡 대화 파일 파싱"""
        
        logger.info(f"카카오톡 대화 파일 파싱 시작: {file_path}")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # BOM 문자 제거
            content = content.lstrip('\ufeff')
                
            # 헤더 정보 추출
            room_info = self._parse_header(content)
            
            # 메시지들 파싱
            messages = self._parse_messages(content, room_info['room_name'])
            
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
            
    def _parse_header(self, content: str) -> Dict[str, Any]:
        """헤더 정보 파싱"""
        
        lines = content.split('\n')
        
        # 방 제목과 참여자 수 (BOM 문자 제거)
        first_line = lines[0].lstrip('\ufeff') if lines else ""
        room_match = re.search(r'(.+?)\s*(\d+)\s*님과 카카오톡 대화', first_line)
        
        if room_match:
            room_name = room_match.group(1).strip()
            participant_count = int(room_match.group(2))
        else:
            room_name = "Unknown Room"
            participant_count = 0
            
        # 저장 날짜
        save_date_line = ""
        for line in lines[:5]:
            if "저장한 날짜" in line:
                save_date_line = line
                break
                
        save_date = self._parse_save_date(save_date_line)
        
        return {
            'room_name': room_name,
            'participant_count': participant_count,
            'save_date': save_date
        }
        
    def _parse_save_date(self, save_date_line: str) -> datetime:
        """저장 날짜 파싱"""
        
        try:
            # "저장한 날짜 : 2025년 7월 14일 오후 7:44" 형식
            match = re.search(r'(\d{4})년 (\d{1,2})월 (\d{1,2})일 (오전|오후) (\d{1,2}):(\d{2})', save_date_line)
            
            if match:
                year = int(match.group(1))
                month = int(match.group(2))
                day = int(match.group(3))
                ampm = match.group(4)
                hour = int(match.group(5))
                minute = int(match.group(6))
                
                # 24시간 형식으로 변환
                if ampm == "오후" and hour != 12:
                    hour += 12
                elif ampm == "오전" and hour == 12:
                    hour = 0
                    
                return datetime(year, month, day, hour, minute)
                
        except Exception as e:
            logger.warning(f"저장 날짜 파싱 실패: {e}")
            
        return datetime.now()
        
    def _parse_messages(self, content: str, room_name: str) -> List[KakaoMessage]:
        """메시지들 파싱"""
        
        messages = []
        lines = content.split('\n')
        
        current_date = None
        i = 0
        
        while i < len(lines):
            line = lines[i].strip()
            
            if not line:
                i += 1
                continue
                
            # 날짜 라인 체크
            date_match = re.match(self.date_pattern, line)
            if date_match:
                year = int(date_match.group(1))
                month = int(date_match.group(2))
                day = int(date_match.group(3))
                current_date = (year, month, day)
                i += 1
                continue
                
            # 메시지 라인 체크
            msg_match = re.match(self.message_pattern, line)
            if msg_match:
                try:
                    message = self._parse_message_line(msg_match, room_name)
                    if message:
                        # 여러 줄 메시지 처리
                        i += 1
                        while i < len(lines):
                            next_line = lines[i].strip()
                            if not next_line:
                                break
                            if re.match(self.message_pattern, next_line) or re.match(self.date_pattern, next_line):
                                break
                            # 다음 줄이 메시지의 연속인 경우
                            message.content += '\n' + next_line
                            i += 1
                        messages.append(message)
                        continue
                except Exception as e:
                    logger.warning(f"메시지 파싱 오류: {e}")
                    i += 1
                    continue
            else:
                # 메시지 패턴에 맞지 않는 라인은 건너뛰기
                i += 1
                continue
                    
        logger.info(f"파싱 완료: {len(messages)}개 메시지, {len(set([msg.sender for msg in messages if msg.sender]))}명 참여자")
        return messages
        
    def _parse_message_line(self, match: re.Match, room_name: str) -> Optional[KakaoMessage]:
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
            
            # 메시지 유형 판별
            message_type, media_files = self._determine_message_type(content)
            
            # 삭제된 메시지 체크
            is_deleted = (content == self.deleted_message)
            
            return KakaoMessage(
                timestamp=timestamp,
                sender=sender,
                content=content,
                message_type=message_type,
                original_sender_id=sender,
                media_files=media_files,
                is_deleted=is_deleted,
                room_name=room_name
            )
            
        except Exception as e:
            logger.warning(f"메시지 라인 파싱 실패: {e}")
            return None
            
    def _determine_message_type(self, content: str) -> Tuple[str, List[str]]:
        """메시지 유형 및 미디어 파일 확인"""
        
        media_files = []
        
        # 삭제된 메시지
        if content == self.deleted_message:
            return "deleted", []
            
        # 미디어 파일들 체크
        for media_type, pattern in self.media_patterns.items():
            matches = re.findall(pattern, content)
            if matches:
                media_files.extend(matches)
                return media_type, media_files
                
        # 기본 텍스트 메시지
        return "text", []
        
    def get_conversation_statistics(self, kakao_room: KakaoRoom) -> Dict[str, Any]:
        """대화방 통계 정보"""
        
        total_messages = len(kakao_room.messages)
        text_messages = len([msg for msg in kakao_room.messages if msg.message_type == "text" and not msg.is_deleted])
        deleted_messages = len([msg for msg in kakao_room.messages if msg.is_deleted])
        
        # 참여자별 메시지 수
        participant_stats = {}
        for msg in kakao_room.messages:
            if msg.sender and not msg.is_deleted:
                participant_stats[msg.sender] = participant_stats.get(msg.sender, 0) + 1
                
        # 시간대별 활동
        hourly_activity = {}
        for msg in kakao_room.messages:
            if not msg.is_deleted:
                hour = msg.timestamp.hour
                hourly_activity[hour] = hourly_activity.get(hour, 0) + 1
                
        # 일별 활동
        daily_activity = {}
        for msg in kakao_room.messages:
            if not msg.is_deleted:
                date_key = msg.timestamp.strftime('%Y-%m-%d')
                daily_activity[date_key] = daily_activity.get(date_key, 0) + 1
                
        return {
            'room_info': {
                'name': kakao_room.room_name,
                'participant_count': kakao_room.participant_count,
                'save_date': kakao_room.save_date.isoformat(),
                'has_media_folder': kakao_room.media_folder is not None,
                'has_document_folder': kakao_room.document_folder is not None
            },
            'message_stats': {
                'total_messages': total_messages,
                'text_messages': text_messages,
                'deleted_messages': deleted_messages,
                'media_messages': total_messages - text_messages - deleted_messages
            },
            'participant_stats': participant_stats,
            'activity_patterns': {
                'hourly': hourly_activity,
                'daily': daily_activity
            },
            'date_range': {
                'start': min([msg.timestamp for msg in kakao_room.messages]).isoformat() if kakao_room.messages else None,
                'end': max([msg.timestamp for msg in kakao_room.messages]).isoformat() if kakao_room.messages else None
            }
        }
        
    def extract_topics_and_keywords(self, kakao_room: KakaoRoom) -> Dict[str, Any]:
        """주제 및 키워드 추출"""
        
        # 텍스트 메시지만 추출
        text_messages = [msg.content for msg in kakao_room.messages 
                        if msg.message_type == "text" and not msg.is_deleted]
        
        # 키워드 빈도 분석
        keywords = {}
        important_terms = [
            # 시공사 관련
            "GS", "파르나스", "현대", "대우", "삼성", "시공사", "건설사",
            # 재정 관련  
            "분담금", "환급", "비용", "관리비", "예산", "자금",
            # 시설 관련
            "커뮤니티", "수영장", "사우나", "헬스장", "식당", "카페",
            # 절차 관련
            "총회", "투표", "안건", "승인", "결정", "논의",
            # 기타
            "아파트", "단지", "입지", "가치", "브랜드"
        ]
        
        all_text = " ".join(text_messages)
        for term in important_terms:
            count = all_text.count(term)
            if count > 0:
                keywords[term] = count
                
        # 상위 키워드 정렬
        sorted_keywords = dict(sorted(keywords.items(), key=lambda x: x[1], reverse=True))
        
        # 주요 토픽 추출 (키워드 기반)
        topics = []
        if any(term in sorted_keywords for term in ["GS", "파르나스", "현대", "대우", "시공사"]):
            topics.append("시공사 선정")
        if any(term in sorted_keywords for term in ["분담금", "환급", "비용"]):
            topics.append("분담금 및 비용")
        if any(term in sorted_keywords for term in ["커뮤니티", "수영장", "사우나"]):
            topics.append("커뮤니티 시설")
        if any(term in sorted_keywords for term in ["총회", "투표", "안건"]):
            topics.append("총회 및 의사결정")
            
        return {
            'keywords': sorted_keywords,
            'top_keywords': dict(list(sorted_keywords.items())[:10]),
            'main_topics': topics,
            'text_message_count': len(text_messages),
            'total_text_length': len(all_text)
        }


# 사용 예시
if __name__ == "__main__":
    print("📱 카카오톡 대화 파서 테스트")
    print("=" * 40)
    
    parser = KakaoChatParser()
    
    # 테스트 파일 경로
    test_file = "chat_rooms/[인증]행복한소유☆개포우성7차/[인증]행복한소유☆개포우성7차.txt"
    
    if os.path.exists(test_file):
        try:
            # 파싱 실행
            kakao_room = parser.parse_chat_file(test_file)
            
            # 통계 정보
            stats = parser.get_conversation_statistics(kakao_room)
            
            # 주제 분석
            topics = parser.extract_topics_and_keywords(kakao_room)
            
            print(f"✅ 방 제목: {kakao_room.room_name}")
            print(f"📊 총 메시지: {len(kakao_room.messages)}개")
            print(f"👥 참여자: {len(kakao_room.participants)}명")
            print(f"🏷️ 주요 주제: {', '.join(topics['main_topics'])}")
            print(f"🔑 상위 키워드: {list(topics['top_keywords'].keys())[:5]}")
            
        except Exception as e:
            print(f"❌ 테스트 실패: {e}")
    else:
        print(f"❌ 테스트 파일 없음: {test_file}") 