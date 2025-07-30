#!/usr/bin/env python3
"""
데이터베이스 초기화 스크립트
"""

import sqlite3
import os
from real_kakao_data_processor import RealKakaoDataProcessor

def init_database():
    """데이터베이스 초기화"""
    print("🔧 데이터베이스 초기화 시작...")
    
    # RealKakaoDataProcessor 인스턴스 생성
    processor = RealKakaoDataProcessor()
    
    # 데이터베이스 초기화
    processor.init_database()
    
    print("✅ 데이터베이스 초기화 완료!")
    
    # 초기화 후 상태 확인
    db_path = os.path.join(os.path.dirname(__file__), 'kakao_chat.db')
    
    if os.path.exists(db_path):
        print(f"📊 데이터베이스 파일 생성됨: {db_path}")
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 테이블 목록 확인
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print(f"\n📋 생성된 테이블:")
        for table in tables:
            print(f"  - {table[0]}")
        
        conn.close()
        print("\n🎉 데이터베이스가 성공적으로 초기화되었습니다!")
        print("이제 카카오톡 파일을 업로드할 수 있습니다.")
    else:
        print("❌ 데이터베이스 파일 생성 실패!")

if __name__ == "__main__":
    init_database() 