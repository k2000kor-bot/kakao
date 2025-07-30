#!/usr/bin/env python3
import os
import sys
import time
import threading
from auto_file_organizer import AutoFileOrganizer, FileWatcher
from watchdog.observers import Observer
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class FileWatcherService:
    """파일 감시 서비스"""
    
    def __init__(self, watch_folder: str = "uploads"):
        self.watch_folder = watch_folder
        self.organizer = AutoFileOrganizer(watch_folder)
        self.observer = None
        self.running = False
        
        # 감시 폴더 생성
        os.makedirs(watch_folder, exist_ok=True)
        
    def start(self):
        """파일 감시 시작"""
        if self.running:
            logger.warning("파일 감시자가 이미 실행 중입니다.")
            return
            
        try:
            # 기존 파일들 먼저 처리
            logger.info("기존 파일들을 처리합니다...")
            results = self.organizer.process_existing_files()
            
            if results:
                success_count = sum(1 for r in results if r["success"])
                error_count = len(results) - success_count
                logger.info(f"기존 파일 처리 완료: 성공 {success_count}개, 실패 {error_count}개")
                
                for result in results:
                    if result["success"]:
                        logger.info(f"✅ 분류 완료: {result['original_path']} -> {result['category']}")
                    else:
                        logger.error(f"❌ 분류 실패: {result.get('error', '알 수 없는 오류')}")
            
            # 파일 감시자 시작
            event_handler = FileWatcher(self.organizer)
            self.observer = Observer()
            self.observer.schedule(event_handler, self.watch_folder, recursive=False)
            self.observer.start()
            
            self.running = True
            logger.info(f"🔍 파일 감시 시작: {os.path.abspath(self.watch_folder)}")
            logger.info("파일을 uploads 폴더에 복사하면 자동으로 분류됩니다.")
            
            return True
            
        except Exception as e:
            logger.error(f"파일 감시 시작 실패: {e}")
            return False
    
    def stop(self):
        """파일 감시 중단"""
        if self.observer and self.running:
            self.observer.stop()
            self.observer.join()
            self.running = False
            logger.info("파일 감시가 중단되었습니다.")
            
    def get_status(self):
        """현재 상태 조회"""
        stats = self.organizer.get_statistics()
        return {
            "running": self.running,
            "watch_folder": os.path.abspath(self.watch_folder),
            "total_files": stats["total_files"],
            "categories": stats["categories"],
            "file_types": stats["file_types"],
            "last_updated": stats["last_updated"]
        }
        
    def get_organized_files(self, category=None):
        """정리된 파일 목록 조회"""
        return self.organizer.get_file_list(category)
        
    def run_forever(self):
        """계속 실행"""
        if not self.start():
            return
            
        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("사용자에 의해 중단되었습니다.")
        finally:
            self.stop()

def main():
    """메인 실행 함수"""
    print("🚀 실시간 파일 자동 분류 시스템")
    print("=" * 50)
    
    service = FileWatcherService()
    
    # 현재 상태 출력
    status = service.get_status()
    print(f"📁 감시 폴더: {status['watch_folder']}")
    print(f"📊 처리된 파일 수: {status['total_files']}")
    print()
    
    if len(sys.argv) > 1 and sys.argv[1] == "--daemon":
        # 데몬 모드로 실행
        print("🔄 데몬 모드로 실행 중...")
        
        def run_service():
            service.run_forever()
            
        daemon_thread = threading.Thread(target=run_service, daemon=True)
        daemon_thread.start()
        
        print("✅ 파일 감시 서비스가 백그라운드에서 시작되었습니다.")
        print("서비스를 중단하려면 Ctrl+C를 누르세요.")
        
        try:
            while True:
                time.sleep(60)  # 1분마다 상태 체크
                current_status = service.get_status()
                if current_status["running"]:
                    print(f"⏰ {time.strftime('%H:%M:%S')} - 서비스 실행 중 (총 {current_status['total_files']}개 파일 처리됨)")
                else:
                    print("❌ 서비스가 중단되었습니다.")
                    break
        except KeyboardInterrupt:
            print("\n🛑 서비스를 중단합니다...")
            service.stop()
    else:
        # 대화형 모드로 실행
        print("📝 사용 방법:")
        print("1. 다른 터미널에서 파일을 uploads 폴더에 복사하세요")
        print("2. 파일이 자동으로 분류되는 것을 확인하세요")
        print("3. Ctrl+C로 종료할 수 있습니다")
        print()
        
        service.run_forever()

if __name__ == "__main__":
    main() 