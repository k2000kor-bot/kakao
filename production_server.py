#!/usr/bin/env python3
"""
CORBU.AI 프로덕션 서버
Gunicorn과 함께 사용하기 위한 WSGI 애플리케이션
"""

import os
import sys
import logging
from logging.handlers import RotatingFileHandler
from complete_server import app

# 로그 설정
def setup_logging():
    """프로덕션 로깅 설정"""
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    # 파일 핸들러 설정 (최대 10MB, 5개 파일 유지)
    file_handler = RotatingFileHandler(
        'logs/corbu_ai.log', 
        maxBytes=10240000, 
        backupCount=5
    )
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    
    # 에러 핸들러 설정
    error_handler = RotatingFileHandler(
        'logs/corbu_ai_errors.log',
        maxBytes=10240000,
        backupCount=5
    )
    error_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    error_handler.setLevel(logging.ERROR)
    
    app.logger.addHandler(file_handler)
    app.logger.addHandler(error_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('CORBU.AI 프로덕션 서버 시작')

# 프로덕션 설정 적용
def configure_production():
    """프로덕션 환경 설정"""
    # 디버그 모드 비활성화
    app.config['DEBUG'] = False
    
    # 보안 설정
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'corbu-ai-production-key-2025')
    
    # 업로드 설정
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB 제한
    
    # CORS 설정 (프로덕션에서는 더 엄격하게)
    app.config['CORS_ORIGINS'] = os.environ.get('CORS_ORIGINS', '*').split(',')
    
    print("🔒 프로덕션 환경으로 설정되었습니다")
    print("📊 로깅이 활성화되었습니다")
    print("🛡️  보안 설정이 적용되었습니다")

if __name__ == '__main__':
    setup_logging()
    configure_production()
    
    # 프로덕션에서는 Gunicorn 사용 권장
    port = int(os.environ.get('PORT', 8080))
    host = os.environ.get('HOST', '0.0.0.0')
    
    print(f"🚀 CORBU.AI 프로덕션 서버 시작: {host}:{port}")
    app.run(host=host, port=port, debug=False)
else:
    # Gunicorn에서 사용할 때
    setup_logging()
    configure_production()

# Gunicorn 설정을 위한 애플리케이션 객체
application = app
