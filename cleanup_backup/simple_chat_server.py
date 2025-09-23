from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from datetime import datetime
import random
import uuid

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# 로깅 설정
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/', methods=['GET'])
def root():
    """메인 HTML 파일 서빙"""
    return app.send_static_file('modern_chat_interface.html')

@app.route('/api/health', methods=['GET'])
def health_check():
    """헬스 체크 API"""
    return jsonify({
        'service': 'CORBU.AI Backend',
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'uptime': 'running',
        'version': '2.0.0'
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """채팅 API"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        if not message:
            return jsonify({'success': False, 'error': '메시지가 제공되지 않았습니다.'}), 400
        
        # 간단한 AI 응답 생성
        responses = [
            f"안녕하세요! '{message}'에 대한 답변입니다. CORBU.AI가 도와드리겠습니다.",
            f"좋은 질문이네요! '{message}'에 대해 설명드리겠습니다.",
            f"'{message}'에 대한 정보를 제공해드리겠습니다.",
            f"흥미로운 주제입니다! '{message}'에 대해 자세히 알아보겠습니다."
        ]
        
        response_text = random.choice(responses)
        
        return jsonify({
            'success': True,
            'response': response_text,
            'response_time': 0.01,
            'session_id': str(uuid.uuid4()),
            'analysis': {
                'emotion_analysis': {
                    'emotion': 'positive',
                    'confidence': 0.85
                },
                'intent_analysis': {
                    'intent': 'question',
                    'confidence': 0.90
                }
            }
        })
        
    except Exception as e:
        logger.error(f"채팅 오류: {e}")
        return jsonify({'success': False, 'error': '채팅 처리 중 오류가 발생했습니다.'}), 500

@app.route('/api/code-review', methods=['POST'])
def code_review():
    """코드 리뷰 API"""
    try:
        data = request.get_json()
        code = data.get('code', '')
        language = data.get('language', 'python')
        
        if not code:
            return jsonify({'success': False, 'error': '코드가 제공되지 않았습니다.'}), 400
        
        # 간단한 코드 분석
        issues = []
        suggestions = []
        
        if language.lower() == 'python':
            if 'print(' in code and 'logging' not in code:
                issues.append("print 문 대신 logging 모듈 사용을 권장합니다.")
            if 'except:' in code:
                issues.append("빈 except 절은 피하세요. 구체적인 예외를 처리하세요.")
        
        complexity = len(code.split('\n')) + code.count('if') + code.count('for') + code.count('while')
        
        review_result = f"""🔍 **코드 리뷰 결과**

**분석된 언어:** {language.upper()}
**코드 복잡도:** {complexity}/100

**발견된 문제점:**
{chr(10).join([f"⚠️ {issue}" for issue in issues]) if issues else "✅ 특별한 문제점이 발견되지 않았습니다."}

**개선 제안:**
{chr(10).join([f"💡 {suggestion}" for suggestion in suggestions]) if suggestions else "✅ 코드가 잘 작성되었습니다."}

**전체 평가:**
{'🟢 우수' if len(issues) == 0 else '🟡 개선 필요' if len(issues) < 3 else '🔴 리팩토링 권장'}"""
        
        return jsonify({
            'success': True,
            'review': review_result,
            'issues_count': len(issues),
            'suggestions_count': len(suggestions),
            'complexity_score': complexity
        })
        
    except Exception as e:
        logger.error(f"코드 리뷰 오류: {e}")
        return jsonify({'success': False, 'error': '코드 리뷰 중 오류가 발생했습니다.'}), 500

@app.route('/api/text-summarize', methods=['POST'])
def text_summarize():
    """텍스트 요약 API"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        max_length = data.get('max_length', 200)
        
        if not text:
            return jsonify({'success': False, 'error': '텍스트가 제공되지 않았습니다.'}), 400
        
        # 간단한 요약 알고리즘
        sentences = text.split('. ')
        if len(sentences) <= 3:
            summary = text
        else:
            important_sentences = [sentences[0]]
            middle_sentences = sentences[1:-1]
            middle_sentences.sort(key=len, reverse=True)
            
            for sentence in middle_sentences[:2]:
                if len(sentence) > 20:
                    important_sentences.append(sentence)
            
            if len(sentences) > 1:
                important_sentences.append(sentences[-1])
            
            summary = '. '.join(important_sentences)
            
            if len(summary) > max_length:
                summary = summary[:max_length] + '...'
        
        return jsonify({
            'success': True,
            'summary': summary,
            'original_length': len(text),
            'summary_length': len(summary),
            'compression_ratio': round(len(summary) / len(text) * 100, 1)
        })
        
    except Exception as e:
        logger.error(f"텍스트 요약 오류: {e}")
        return jsonify({'success': False, 'error': '텍스트 요약 중 오류가 발생했습니다.'}), 500

@app.route('/api/performance-metrics', methods=['GET'])
def get_performance_metrics():
    """시스템 성능 메트릭 조회"""
    try:
        import os
        
        metrics = {
            'timestamp': datetime.now().isoformat(),
            'system': {
                'cpu_usage': 'N/A',
                'memory_usage': 'N/A',
                'memory_available': 'N/A',
                'disk_usage': 'N/A',
                'disk_free': 'N/A'
            },
            'application': {
                'process_memory': 'N/A',
                'uptime': 'N/A',
                'total_requests': 0,
                'successful_requests': 0,
                'error_rate': 0,
                'python_version': f"{os.sys.version_info.major}.{os.sys.version_info.minor}.{os.sys.version_info.micro}",
                'platform': os.name
            }
        }
        
        return jsonify({
            'success': True,
            'metrics': metrics
        })
        
    except Exception as e:
        logger.error(f"성능 메트릭 조회 오류: {e}")
        return jsonify({'success': False, 'error': '성능 메트릭 조회 중 오류가 발생했습니다.'}), 500

if __name__ == '__main__':
    print("🚀 CORBU.AI 간단 서버를 시작합니다...")
    print("📍 서버 주소: http://localhost:3000")
    print("🔗 메인 화면: modern_chat_interface.html")
    app.run(host='0.0.0.0', port=3000, debug=True)