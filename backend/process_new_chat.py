#!/usr/bin/env python3
"""
새로운 카카오톡 대화 파일 자동 처리 스크립트
"""

import os
import sys
import glob
from chat_file_processor import ChatFileProcessor
import logging

logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def find_new_chat_files():
    """새로운 대화 파일 탐지"""
    # 가능한 위치들에서 새 파일 찾기
    search_paths = [
        "uploads/*.txt",
        "temp/*.txt", 
        "../uploads/*.txt",
        "../temp/*.txt",
        "*.txt",
        "../*.txt"
    ]
    
    new_files = []
    
    for pattern in search_paths:
        files = glob.glob(pattern)
        for file in files:
            # 이미 처리된 파일인지 확인 (chat_rooms 폴더에 있지 않은 파일만)
            if "chat_rooms" not in file and os.path.getsize(file) > 1000:
                new_files.append(file)
    
    return new_files


def process_uploaded_file(file_path: str):
    """업로드된 파일 처리"""
    logger.info(f"📁 새 파일 발견: {file_path}")
    
    processor = ChatFileProcessor()
    
    try:
        # 파일 처리
        result = processor.process_new_chat_file(file_path)
        
        if result.processing_status == "success":
            logger.info("✅ 처리 성공!")
            logger.info(f"   대화방: {result.chat_room_name}")
            logger.info(f"   메시지: {result.message_count}개")
            logger.info(f"   참여자: {result.participant_count}명")
            logger.info(f"   미디어: {result.media_files_count}개")
            logger.info(f"   저장 위치: {result.processed_path}")
            
            # 원본 파일 삭제 (선택사항)
            # os.remove(file_path)
            # logger.info(f"   원본 파일 삭제: {file_path}")
            
        else:
            logger.error(f"❌ 처리 실패: {result.error_message}")
            
    except Exception as e:
        logger.error(f"❌ 오류 발생: {e}")


def show_processing_summary():
    """처리 요약 정보 출력"""
    processor = ChatFileProcessor()
    summary = processor.get_processing_summary()
    
    print("\n" + "="*50)
    print("📊 카카오톡 데이터 처리 요약")
    print("="*50)
    print(f"총 대화방 수: {summary['total_chat_rooms']}개")
    print(f"총 메시지 수: {summary['total_messages']:,}개")
    print(f"총 미디어 파일: {summary['total_media_files']:,}개")
    print(f"총 참여자 수: {summary['total_participants']}명")
    print(f"데이터베이스: {summary['database_path']}")
    print("="*50)


def main():
    """메인 실행 함수"""
    if len(sys.argv) > 1:
        # 특정 파일 처리
        file_path = sys.argv[1]
        if os.path.exists(file_path):
            process_uploaded_file(file_path)
        else:
            logger.error(f"파일을 찾을 수 없습니다: {file_path}")
    else:
        # 자동 탐지 및 처리
        logger.info("🔍 새로운 대화 파일 자동 탐지 중...")
        
        new_files = find_new_chat_files()
        
        if new_files:
            logger.info(f"📋 {len(new_files)}개의 새 파일 발견:")
            for file in new_files:
                logger.info(f"   - {file}")
            
            # 각 파일 처리
            for file in new_files:
                process_uploaded_file(file)
                
        else:
            logger.info("새로운 대화 파일이 없습니다.")
    
    # 처리 요약 출력
    show_processing_summary()


if __name__ == "__main__":
    main() 