#!/usr/bin/env python3
"""
CORBU.AI 통합 대화 시스템 테스트 스크립트
"""

import os
import requests
import json
import time
from datetime import datetime

# 레거시 통합 대화 서버(unified_conversation_api 등, 기본 8001).
# main_server(5002) 검증: scripts/test/api_test.py 또는 CORBU_UNIFIED_TEST_BASE=http://localhost:5002 (엔드포인트 호환 시)
BASE_URL = os.environ.get("CORBU_UNIFIED_TEST_BASE", "http://localhost:8001")

def test_server_health():
    """서버 상태 확인"""
    print("🔍 서버 상태 확인 중...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 서버 정상 작동")
            print(f"📋 메시지: {data.get('message')}")
            print(f"📦 버전: {data.get('version')}")
            print(f"🔄 상태: {data.get('status')}")
            return True
        else:
            print(f"❌ 서버 응답 오류: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.")
        return False

def test_command_execution():
    """명령어 실행 테스트"""
    print("\n🧪 명령어 실행 테스트...")
    
    commands = [
        {"command": "help", "args": []},
        {"command": "system", "args": ["status"]},
        {"command": "project", "args": ["list"]},
        {"command": "ai", "args": ["analyze", "테스트 텍스트"]},
        {"command": "upload", "args": []},
    ]
    
    for cmd in commands:
        print(f"\n📝 명령어 실행: /{cmd['command']} {' '.join(cmd['args'])}")
        try:
            response = requests.post(
                f"{BASE_URL}/api/command",
                json=cmd,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 성공: {data['response'][:100]}...")
                print(f"⏱️ 실행 시간: {data['execution_time']:.3f}초")
            else:
                print(f"❌ 오류: {response.status_code}")
                
        except Exception as e:
            print(f"❌ 예외 발생: {e}")
        
        time.sleep(1)  # 요청 간격

def test_file_upload():
    """파일 업로드 테스트"""
    print("\n📁 파일 업로드 테스트...")
    
    # 테스트 파일 생성
    test_content = "이것은 테스트 파일입니다.\nCORBU.AI 시스템 테스트용입니다."
    
    try:
        files = {'file': ('test.txt', test_content, 'text/plain')}
        response = requests.post(f"{BASE_URL}/api/upload", files=files)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 파일 업로드 성공: {data['message']}")
            print(f"📄 파일 정보: {data['file_info']['filename']}")
        else:
            print(f"❌ 파일 업로드 실패: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 파일 업로드 예외: {e}")

def test_message_storage():
    """메시지 저장 테스트"""
    print("\n💬 메시지 저장 테스트...")
    
    test_messages = [
        {
            "id": "test_1",
            "sender": "user",
            "content": "안녕하세요!",
            "timestamp": datetime.now().isoformat(),
            "message_type": "text"
        },
        {
            "id": "test_2", 
            "sender": "ai",
            "content": "안녕하세요! CORBU.AI입니다. 무엇을 도와드릴까요?",
            "timestamp": datetime.now().isoformat(),
            "message_type": "text"
        }
    ]
    
    for msg in test_messages:
        try:
            response = requests.post(
                f"{BASE_URL}/api/message",
                json=msg,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                print(f"✅ 메시지 저장 성공: {msg['content'][:30]}...")
            else:
                print(f"❌ 메시지 저장 실패: {response.status_code}")
                
        except Exception as e:
            print(f"❌ 메시지 저장 예외: {e}")

def test_project_management():
    """프로젝트 관리 테스트"""
    print("\n📋 프로젝트 관리 테스트...")
    
    # 프로젝트 생성 테스트
    test_project = {
        "name": "테스트 프로젝트",
        "description": "CORBU.AI 시스템 테스트용 프로젝트"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/project", data=test_project)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 프로젝트 생성 성공: {data['message']}")
            print(f"🆔 프로젝트 ID: {data['project_id']}")
        else:
            print(f"❌ 프로젝트 생성 실패: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 프로젝트 생성 예외: {e}")
    
    # 프로젝트 목록 조회 테스트
    try:
        response = requests.get(f"{BASE_URL}/api/projects")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 프로젝트 목록 조회 성공: {data['total']}개 프로젝트")
            for project in data['projects']:
                print(f"  📁 {project['name']} ({project['file_count']}개 파일)")
        else:
            print(f"❌ 프로젝트 목록 조회 실패: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 프로젝트 목록 조회 예외: {e}")

def test_system_status():
    """시스템 상태 테스트"""
    print("\n🖥️ 시스템 상태 테스트...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/status")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 시스템 상태 조회 성공")
            print(f"📊 파일 업로드: {'진행 중' if data['is_file_uploading'] else '대기 중'}")
            print(f"📊 분석 작업: {'진행 중' if data['is_analyzing'] else '대기 중'}")
            print(f"📊 학습 작업: {'진행 중' if data['is_learning'] else '대기 중'}")
            print(f"📊 활성 프로젝트: {len(data['active_projects'])}개")
            print(f"📊 사용 가능한 명령어: {len(data['available_commands'])}개")
        else:
            print(f"❌ 시스템 상태 조회 실패: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 시스템 상태 조회 예외: {e}")

def run_all_tests():
    """모든 테스트 실행"""
    print("🚀 CORBU.AI 통합 대화 시스템 테스트 시작")
    print("=" * 50)
    
    # 서버 상태 확인
    if not test_server_health():
        print("❌ 서버가 실행되지 않았습니다. 테스트를 중단합니다.")
        return
    
    # 각종 테스트 실행
    test_command_execution()
    test_file_upload()
    test_message_storage()
    test_project_management()
    test_system_status()
    
    print("\n" + "=" * 50)
    print("✅ 모든 테스트 완료!")
    print("💡 브라우저에서 http://localhost:3000 으로 접속하여 UI를 확인하세요.")

if __name__ == "__main__":
    run_all_tests() 