#!/usr/bin/env python3
"""
카카오톡 AI 분석 시스템 - 고정 포트 설정
각 서버가 항상 동일한 포트에서 실행되도록 설정
"""

import os

# 고정 포트 설정
FIXED_PORTS = {
    # 통합 main_server — 프론트·프록시 기본 5002 (BACKEND_PORT와 맞출 것)
    "main_server": {
        "port": int(os.environ.get("BACKEND_PORT", "5002")),
        "host": "0.0.0.0",
        "description": "통합 API 서버 (main_server.py)",
    },
    
    # 고급 API 서버 - 카카오톡 분석 전용
    'advanced_api_server': {
        'port': 8002,
        'host': '0.0.0.0',
        'description': '고급 API 서버 - 카카오톡 분석 기능'
    },
    
    # 메시지 생성 서버 - AI 메시지 생성
    'message_generation_server': {
        'port': 8003,
        'host': '0.0.0.0',
        'description': '메시지 생성 서버 - AI 메시지 생성'
    },
    
    # 파일 업로드 서버 - 파일 처리 전용
    'chat_upload_server': {
        'port': 8004,
        'host': '0.0.0.0',
        'description': '파일 업로드 서버 - 카카오톡 파일 처리'
    },
    
    # 분석 서버 - 대화 분석
    'analysis_server': {
        'port': 8005,
        'host': '0.0.0.0',
        'description': '분석 서버 - 대화 분석 및 인사이트'
    },
    
    # 컨텍스트 서버 - 상황 분석
    'context_server': {
        'port': 8006,
        'host': '0.0.0.0',
        'description': '컨텍스트 서버 - 상황 및 패턴 분석'
    },
    
    # 미디어 서버 - 파일 관리
    'media_server': {
        'port': 8007,
        'host': '0.0.0.0',
        'description': '미디어 서버 - 파일 및 미디어 관리'
    },
    
    # 전략 서버 - 전략 최적화
    'strategy_server': {
        'port': 8008,
        'host': '0.0.0.0',
        'description': '전략 서버 - 전략 최적화 및 A/B 테스트'
    },
    
    # 시뮬레이션 서버 - 응답 시뮬레이션
    'simulation_server': {
        'port': 8009,
        'host': '0.0.0.0',
        'description': '시뮬레이션 서버 - 응답 시뮬레이션'
    },
    
    # 동기화 서버 - 데이터 동기화
    'sync_server': {
        'port': 8010,
        'host': '0.0.0.0',
        'description': '동기화 서버 - 데이터 동기화 및 백업'
    }
}

# 프론트엔드 설정
FRONTEND_CONFIG = {
    'port': 3000,
    'host': 'localhost',
    'description': 'React 프론트엔드'
}

def get_server_config(server_name: str) -> dict:
    """서버 설정 반환"""
    if server_name in FIXED_PORTS:
        return FIXED_PORTS[server_name]
    else:
        raise ValueError(f"알 수 없는 서버: {server_name}")

def get_all_ports() -> dict:
    """모든 포트 정보 반환"""
    return {name: config['port'] for name, config in FIXED_PORTS.items()}

def check_port_availability(port: int) -> bool:
    """포트 사용 가능 여부 확인"""
    import socket
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('localhost', port))
            return True
    except OSError:
        return False

def get_available_servers() -> list:
    """사용 가능한 서버 목록 반환"""
    available = []
    for name, config in FIXED_PORTS.items():
        if check_port_availability(config['port']):
            available.append(name)
    return available

if __name__ == "__main__":
    print("🔧 고정 포트 설정 확인")
    print("=" * 50)
    
    for name, config in FIXED_PORTS.items():
        status = "✅ 사용 가능" if check_port_availability(config['port']) else "❌ 사용 중"
        print(f"{name:25} : {config['port']:4d} - {status}")
    
    print("=" * 50)
    print(f"프론트엔드 포트: {FRONTEND_CONFIG['port']}") 