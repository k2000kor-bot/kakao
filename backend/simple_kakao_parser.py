#!/usr/bin/env python3
"""
간단한 카카오톡 대화 파일 파서
"""

import re
import os
from datetime import datetime
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class SimpleKakaoMessage:
    """카카오톡 메시지 데이터 클래스"""
    timestamp: datetime
    sender: str
    content: str
    message_type: str = "text"
    is_deleted: bool = False


@dataclass
class SimpleKakaoRoom:
    """카카오톡 방 정보"""
    room_name: str
    messages: List[SimpleKakaoMessage]
    participants: List[str]


class SimpleKakaoParser:
    """간단한 카카오톡 대화 파서"""
    
    def __init__(self):
        # 메시지 패턴
        self.message_pattern = r'(\d{4})년 (\d{1,2})월 (\d{1,2})일 (오전|오후) (\d{1,2}):(\d{2}), ([^:]+) : (.+)'
        
    def parse_chat_file(self, file_path: str) -> SimpleKakaoRoom:
        """카카오톡 대화 파일 파싱"""
        
        logger.info(f"카카오톡 대화 파일 파싱 시작: {file_path}")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # BOM 문자 제거
            content = content.lstrip('\ufeff')
            
            # 헤더 정보 추출
            room_name = self._extract_room_name(content)
            
            # 메시지들 파싱
            messages = self._parse_messages(content)
            
            # 참여자 목록 추출
            participants = list(set([msg.sender for msg in messages if msg.sender]))
            
            logger.info(f"파싱 완료: {len(messages)}개 메시지, {len(participants)}명 참여자")
            
            return SimpleKakaoRoom(
                room_name=room_name,
                messages=messages,
                participants=participants
            )
            
        except Exception as e:
            logger.error(f"파싱 오류: {e}")
            return SimpleKakaoRoom(room_name="", messages=[], participants=[])
    
    def _extract_room_name(self, content: str) -> str:
        """방 이름 추출"""
        lines = content.split('\n')
        if lines:
            return lines[0].strip()
        return "Unknown Room"
    
    def _parse_messages(self, content: str) -> List[SimpleKakaoMessage]:
        """메시지들 파싱"""
        
        messages = []
        lines = content.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # 메시지 라인 체크
            msg_match = re.match(self.message_pattern, line)
            if msg_match:
                try:
                    message = self._parse_message_line(msg_match)
                    if message:
                        messages.append(message)
                except Exception as e:
                    logger.warning(f"메시지 파싱 오류: {e}")
                    
        return messages
    
    def _parse_message_line(self, match: re.Match) -> Optional[SimpleKakaoMessage]:
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
            
            # 삭제된 메시지 체크
            is_deleted = (content == "삭제된 메시지입니다.")
            
            return SimpleKakaoMessage(
                timestamp=timestamp,
                sender=sender,
                content=content,
                message_type="text",
                is_deleted=is_deleted
            )
            
        except Exception as e:
            logger.warning(f"메시지 라인 파싱 실패: {e}")
            return None 