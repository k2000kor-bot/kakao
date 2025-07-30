#!/usr/bin/env python3
import time
import os
from pathlib import Path
from auto_file_organizer import AutoFileOrganizer

def watch_and_process():
    """간단한 파일 감시 및 처리"""
    print("🚀 실시간 파일 자동 분류 시스템 시작")
    print("=" * 50)
    
    organizer = AutoFileOrganizer()
    watch_folder = Path("uploads")
    
    print(f"📁 감시 폴더: {watch_folder.absolute()}")
    print("📝 파일을 uploads 폴더에 넣으면 자동으로 분류됩니다.")
    print("🛑 Ctrl+C로 종료")
    print()
    
    processed_files = set()
    
    try:
        while True:
            # uploads 폴더의 모든 파일 확인
            if watch_folder.exists():
                for file_path in watch_folder.iterdir():
                    if (file_path.is_file() and 
                        not file_path.name.startswith('.') and 
                        str(file_path) not in processed_files):
                        
                        print(f"🔍 새 파일 감지: {file_path.name}")
                        
                        # 파일 처리
                        result = organizer.organize_file(file_path)
                        
                        if result["success"]:
                            print(f"✅ 분류 완료: {file_path.name} -> {result['category']}")
                            print(f"   📂 위치: {result['new_path']}")
                        else:
                            print(f"❌ 분류 실패: {result.get('error')}")
                            
                        processed_files.add(str(file_path))
                        print()
            
            # 1초마다 체크
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n🛑 파일 감시를 중단합니다.")
        
        # 통계 출력
        stats = organizer.get_statistics()
        print(f"\n📊 최종 통계:")
        print(f"총 처리된 파일: {stats['total_files']}개")
        print("카테고리별 분포:")
        for category, count in stats['categories'].items():
            if count > 0:
                print(f"  - {category}: {count}개")

if __name__ == "__main__":
    watch_and_process() 