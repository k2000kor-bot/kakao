#!/usr/bin/env python3
"""
궁극의 시스템 데모 & 테스트 스크립트 v1.0
- 실제 시스템 기능 데모
- 성능 벤치마크
- API 테스트
- 통합 검증
"""

import asyncio
import aiohttp
import json
import time
import logging
from datetime import datetime
from typing import Dict, List, Any
import base64
import io
from PIL import Image
import numpy as np

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

class UltimateSystemDemo:
    """궁극의 시스템 데모"""
    
    def __init__(self, base_url: str = "http://localhost:8080"):
        self.base_url = base_url
        self.session = None
        self.demo_results = {}
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def test_system_health(self) -> Dict[str, Any]:
        """시스템 헬스 체크"""
        
        logger.info("🔍 시스템 헬스 체크 시작...")
        
        try:
            async with self.session.get(f"{self.base_url}/health") as response:
                if response.status == 200:
                    health_data = await response.json()
                    logger.info("✅ 시스템 정상 작동 중")
                    return {"status": "healthy", "data": health_data}
                else:
                    logger.error(f"❌ 헬스 체크 실패: {response.status}")
                    return {"status": "unhealthy", "code": response.status}
        except Exception as e:
            logger.error(f"❌ 연결 실패: {e}")
            return {"status": "connection_failed", "error": str(e)}
    
    async def demo_hyper_personalized_message(self) -> Dict[str, Any]:
        """하이퍼 개인화 메시지 생성 데모"""
        
        logger.info("🧠 하이퍼 개인화 메시지 생성 데모...")
        
        demo_requests = [
            {
                "name": "비즈니스 제안서",
                "request": {
                    "user_context": {
                        "recent_messages": ["프로젝트 진행 상황 논의", "예산 검토 필요"],
                        "user_profile": {"role": "매니저", "experience": "5년", "style": "분석적"}
                    },
                    "message_intent": "제안",
                    "target_audience": "경영진",
                    "complexity": "expert",
                    "personalization": "hyper_personalized",
                    "style_preferences": {
                        "tone": "professional",
                        "formality": "formal"
                    },
                    "constraints": ["300자 이내", "존댓말 사용", "구체적 수치 포함"]
                }
            },
            {
                "name": "고객 응대 메시지",
                "request": {
                    "user_context": {
                        "customer_history": ["불만 접수", "해결 요청"],
                        "satisfaction_level": "low"
                    },
                    "message_intent": "사과/해결",
                    "target_audience": "불만 고객",
                    "complexity": "moderate",
                    "personalization": "advanced",
                    "style_preferences": {
                        "tone": "apologetic",
                        "emotion": "empathy"
                    }
                }
            },
            {
                "name": "팀 동기부여 메시지",
                "request": {
                    "user_context": {
                        "team_situation": "프로젝트 마감 임박",
                        "team_mood": "피로감"
                    },
                    "message_intent": "동기부여",
                    "target_audience": "팀원들",
                    "complexity": "simple",
                    "personalization": "advanced",
                    "style_preferences": {
                        "tone": "encouraging",
                        "emotion": "positive"
                    }
                }
            }
        ]
        
        results = []
        
        for demo in demo_requests:
            logger.info(f"  📝 {demo['name']} 생성 중...")
            start_time = time.time()
            
            try:
                async with self.session.post(
                    f"{self.base_url}/api/v10/generate/hyper-personalized",
                    json=demo["request"]
                ) as response:
                    
                    processing_time = time.time() - start_time
                    
                    if response.status == 200:
                        result = await response.json()
                        
                        results.append({
                            "demo_name": demo["name"],
                            "status": "success",
                            "message": result.get("message", ""),
                            "quality_score": result.get("quality_score", 0),
                            "processing_time": processing_time,
                            "nlp_analysis": result.get("nlp_analysis", {}),
                            "model_contributions": result.get("model_contributions", {})
                        })
                        
                        logger.info(f"  ✅ {demo['name']} 완료 ({processing_time:.2f}초)")
                        logger.info(f"     💬 메시지: {result.get('message', '')[:100]}...")
                        logger.info(f"     📊 품질점수: {result.get('quality_score', 0):.2f}")
                        
                    else:
                        results.append({
                            "demo_name": demo["name"],
                            "status": "failed",
                            "error_code": response.status,
                            "processing_time": processing_time
                        })
                        logger.error(f"  ❌ {demo['name']} 실패: {response.status}")
                        
            except Exception as e:
                results.append({
                    "demo_name": demo["name"],
                    "status": "error",
                    "error": str(e),
                    "processing_time": time.time() - start_time
                })
                logger.error(f"  ❌ {demo['name']} 오류: {e}")
        
        return {"demo_type": "hyper_personalized_message", "results": results}
    
    async def demo_multimodal_processing(self) -> Dict[str, Any]:
        """멀티모달 처리 데모"""
        
        logger.info("🎭 멀티모달 처리 데모...")
        
        # 샘플 이미지 생성 (간단한 텍스트 이미지)
        def create_sample_image():
            img = Image.new('RGB', (400, 200), color='white')
            # 실제로는 PIL의 ImageDraw를 사용하여 텍스트 추가
            img_buffer = io.BytesIO()
            img.save(img_buffer, format='PNG')
            img_buffer.seek(0)
            return base64.b64encode(img_buffer.getvalue()).decode()
        
        sample_image = create_sample_image()
        
        demo_request = {
            "text": "회사의 새로운 프로젝트에 대해 팀원들과 논의하고 있습니다. 모든 것이 순조롭게 진행되고 있어 기쁩니다.",
            "image_data": f"data:image/png;base64,{sample_image}",
            "processing_mode": "fusion",
            "target_language": "ko"
        }
        
        start_time = time.time()
        
        try:
            async with self.session.post(
                f"{self.base_url}/api/v10/multimodal/process",
                json=demo_request
            ) as response:
                
                processing_time = time.time() - start_time
                
                if response.status == 200:
                    result = await response.json()
                    
                    logger.info(f"  ✅ 멀티모달 처리 완료 ({processing_time:.2f}초)")
                    logger.info(f"     📊 통합 분석: {len(result.get('result', {}).get('integrated_analysis', {}))}개 인사이트")
                    
                    return {
                        "demo_type": "multimodal_processing",
                        "status": "success",
                        "processing_time": processing_time,
                        "result": result.get("result", {})
                    }
                else:
                    logger.error(f"  ❌ 멀티모달 처리 실패: {response.status}")
                    return {
                        "demo_type": "multimodal_processing",
                        "status": "failed",
                        "error_code": response.status
                    }
                    
        except Exception as e:
            logger.error(f"  ❌ 멀티모달 처리 오류: {e}")
            return {
                "demo_type": "multimodal_processing",
                "status": "error",
                "error": str(e)
            }
    
    async def demo_quantum_security(self) -> Dict[str, Any]:
        """양자 보안 데모"""
        
        logger.info("🔮 양자 보안 시스템 데모...")
        
        # 1. 보안 채널 생성
        channel_request = {
            "participants": ["user1", "user2", "user3"],
            "security_level": "quantum_safe",
            "encryption_method": "quantum_otp"
        }
        
        try:
            async with self.session.post(
                f"{self.base_url}/api/v10/security/create-channel",
                json=channel_request
            ) as response:
                
                if response.status == 200:
                    channel_result = await response.json()
                    channel_id = channel_result.get("channel_id")
                    
                    logger.info(f"  ✅ 양자 보안 채널 생성: {channel_id[:8]}...")
                    
                    # 2. 메시지 암호화 테스트
                    test_message = "이것은 양자 보안으로 암호화된 극비 메시지입니다. 🔒"
                    
                    encrypt_response = await self.session.post(
                        f"{self.base_url}/api/v10/security/encrypt",
                        params={"channel_id": channel_id, "message": test_message}
                    )
                    
                    if encrypt_response.status == 200:
                        encrypt_result = await encrypt_response.json()
                        
                        logger.info("  ✅ 양자 암호화 성공")
                        logger.info(f"     🔒 암호화된 데이터 길이: {len(encrypt_result.get('encrypted_data', {}).get('encrypted_message', ''))}자")
                        
                        return {
                            "demo_type": "quantum_security",
                            "status": "success",
                            "channel_id": channel_id,
                            "encryption_test": "passed",
                            "security_level": channel_result.get("security_level"),
                            "encryption_method": channel_result.get("encryption_method")
                        }
                    else:
                        logger.error("  ❌ 양자 암호화 실패")
                        return {
                            "demo_type": "quantum_security", 
                            "status": "encryption_failed"
                        }
                else:
                    logger.error(f"  ❌ 보안 채널 생성 실패: {response.status}")
                    return {
                        "demo_type": "quantum_security",
                        "status": "channel_creation_failed",
                        "error_code": response.status
                    }
                    
        except Exception as e:
            logger.error(f"  ❌ 양자 보안 데모 오류: {e}")
            return {
                "demo_type": "quantum_security",
                "status": "error",
                "error": str(e)
            }
    
    async def demo_feedback_learning(self) -> Dict[str, Any]:
        """적응형 학습 데모"""
        
        logger.info("🔄 적응형 학습 시스템 데모...")
        
        # 여러 유형의 피드백 제공
        feedback_samples = [
            {
                "user_id": "demo_user_1",
                "message_id": "msg_001",
                "feedback_type": "rating",
                "feedback_value": 4.5,
                "context": {"situation": "비즈니스 미팅", "formality": "high"},
                "impact_score": 1.0
            },
            {
                "user_id": "demo_user_1", 
                "message_id": "msg_002",
                "feedback_type": "style_preference",
                "feedback_value": "professional",
                "context": {"tone_satisfaction": "high"},
                "impact_score": 0.8
            },
            {
                "user_id": "demo_user_2",
                "message_id": "msg_003", 
                "feedback_type": "preference_score",
                "feedback_value": 3.8,
                "context": {"message_length": "appropriate", "clarity": "good"},
                "impact_score": 0.9
            }
        ]
        
        feedback_results = []
        
        for feedback in feedback_samples:
            try:
                async with self.session.post(
                    f"{self.base_url}/api/v10/feedback/record",
                    json=feedback
                ) as response:
                    
                    if response.status == 200:
                        result = await response.json()
                        feedback_results.append({
                            "feedback_type": feedback["feedback_type"],
                            "status": "recorded",
                            "event_id": result.get("event_id")
                        })
                        logger.info(f"  ✅ 피드백 기록: {feedback['feedback_type']}")
                    else:
                        feedback_results.append({
                            "feedback_type": feedback["feedback_type"],
                            "status": "failed",
                            "error_code": response.status
                        })
                        
            except Exception as e:
                feedback_results.append({
                    "feedback_type": feedback["feedback_type"],
                    "status": "error",
                    "error": str(e)
                })
        
        return {
            "demo_type": "adaptive_learning",
            "feedback_count": len(feedback_samples),
            "successful_records": len([r for r in feedback_results if r["status"] == "recorded"]),
            "results": feedback_results
        }
    
    async def demo_comprehensive_analytics(self) -> Dict[str, Any]:
        """종합 분석 데모"""
        
        logger.info("📊 종합 분석 시스템 데모...")
        
        try:
            async with self.session.get(f"{self.base_url}/api/v10/analytics/comprehensive") as response:
                
                if response.status == 200:
                    analytics = await response.json()
                    
                    logger.info("  ✅ 종합 분석 데이터 수집 완료")
                    logger.info(f"     🎯 AI 엔진 상태: {analytics.get('ai_engine', {}).get('status', 'unknown')}")
                    logger.info(f"     🔒 양자 보안 상태: {analytics.get('quantum_security', {}).get('status', 'unknown')}")
                    logger.info(f"     🏗️ 마이크로서비스 상태: {analytics.get('microservices', {}).get('status', 'unknown')}")
                    
                    return {
                        "demo_type": "comprehensive_analytics",
                        "status": "success",
                        "components_analyzed": len([k for k in analytics.keys() if k != 'timestamp']),
                        "analytics_data": analytics
                    }
                else:
                    logger.error(f"  ❌ 분석 데이터 수집 실패: {response.status}")
                    return {
                        "demo_type": "comprehensive_analytics",
                        "status": "failed",
                        "error_code": response.status
                    }
                    
        except Exception as e:
            logger.error(f"  ❌ 분석 시스템 오류: {e}")
            return {
                "demo_type": "comprehensive_analytics",
                "status": "error",
                "error": str(e)
            }
    
    async def run_performance_benchmark(self) -> Dict[str, Any]:
        """성능 벤치마크"""
        
        logger.info("⚡ 성능 벤치마크 실행...")
        
        # 동시 요청 테스트
        concurrent_requests = 5
        benchmark_results = {
            "concurrent_requests": concurrent_requests,
            "individual_times": [],
            "total_time": 0,
            "success_count": 0,
            "error_count": 0
        }
        
        async def single_request():
            request_data = {
                "message_intent": "일반적인 소통",
                "complexity": "moderate",
                "personalization": "basic"
            }
            
            start_time = time.time()
            try:
                async with self.session.post(
                    f"{self.base_url}/api/v10/generate/hyper-personalized",
                    json=request_data
                ) as response:
                    
                    processing_time = time.time() - start_time
                    
                    if response.status == 200:
                        return {"status": "success", "time": processing_time}
                    else:
                        return {"status": "failed", "time": processing_time, "code": response.status}
            except Exception as e:
                return {"status": "error", "time": time.time() - start_time, "error": str(e)}
        
        # 동시 요청 실행
        start_time = time.time()
        tasks = [single_request() for _ in range(concurrent_requests)]
        results = await asyncio.gather(*tasks)
        total_time = time.time() - start_time
        
        benchmark_results["total_time"] = total_time
        
        for result in results:
            benchmark_results["individual_times"].append(result["time"])
            if result["status"] == "success":
                benchmark_results["success_count"] += 1
            else:
                benchmark_results["error_count"] += 1
        
        avg_time = sum(benchmark_results["individual_times"]) / len(benchmark_results["individual_times"])
        success_rate = benchmark_results["success_count"] / concurrent_requests * 100
        
        logger.info(f"  📊 동시 요청 {concurrent_requests}개 처리 완료")
        logger.info(f"     ⏱️ 평균 응답시간: {avg_time:.2f}초")
        logger.info(f"     ✅ 성공률: {success_rate:.1f}%")
        logger.info(f"     🚀 전체 처리시간: {total_time:.2f}초")
        
        return {
            "demo_type": "performance_benchmark",
            "metrics": {
                "average_response_time": avg_time,
                "success_rate": success_rate,
                "total_processing_time": total_time,
                "requests_per_second": concurrent_requests / total_time
            },
            "details": benchmark_results
        }
    
    async def run_full_demo(self) -> Dict[str, Any]:
        """전체 시스템 데모 실행"""
        
        logger.info("🌟 ======================================")
        logger.info("🚀 궁극의 시스템 전체 데모 시작!")
        logger.info("🌟 ======================================")
        
        demo_start_time = time.time()
        
        # 모든 데모 실행
        demos = [
            ("health_check", self.test_system_health()),
            ("hyper_personalized_message", self.demo_hyper_personalized_message()),
            ("multimodal_processing", self.demo_multimodal_processing()),
            ("quantum_security", self.demo_quantum_security()),
            ("adaptive_learning", self.demo_feedback_learning()),
            ("comprehensive_analytics", self.demo_comprehensive_analytics()),
            ("performance_benchmark", self.run_performance_benchmark())
        ]
        
        all_results = {}
        
        for demo_name, demo_task in demos:
            logger.info(f"\n📋 {demo_name.upper()} 데모 실행 중...")
            try:
                result = await demo_task
                all_results[demo_name] = result
                
                if result.get("status") == "success" or result.get("status") == "healthy":
                    logger.info(f"✅ {demo_name} 데모 성공")
                else:
                    logger.warning(f"⚠️ {demo_name} 데모 부분 실패")
                    
            except Exception as e:
                logger.error(f"❌ {demo_name} 데모 오류: {e}")
                all_results[demo_name] = {"status": "error", "error": str(e)}
        
        total_demo_time = time.time() - demo_start_time
        
        # 데모 결과 요약
        successful_demos = len([r for r in all_results.values() 
                              if r.get("status") in ["success", "healthy"]])
        total_demos = len(all_results)
        
        logger.info("\n🌟 ======================================")
        logger.info("📊 전체 데모 결과 요약")
        logger.info("🌟 ======================================")
        logger.info(f"✅ 성공한 데모: {successful_demos}/{total_demos}")
        logger.info(f"⏱️ 총 실행시간: {total_demo_time:.2f}초")
        logger.info(f"🎯 성공률: {successful_demos/total_demos*100:.1f}%")
        
        return {
            "demo_summary": {
                "total_demos": total_demos,
                "successful_demos": successful_demos,
                "success_rate": successful_demos/total_demos*100,
                "total_execution_time": total_demo_time
            },
            "detailed_results": all_results
        }

async def main():
    """메인 실행 함수"""
    
    print("🌟 ============================================")
    print("🚀 궁극의 시스템 데모 & 테스트 시작")
    print("🌟 ============================================")
    
    async with UltimateSystemDemo() as demo:
        results = await demo.run_full_demo()
        
        # 결과를 파일로 저장
        with open('demo_results.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2, default=str)
        
        print("\n💾 데모 결과가 'demo_results.json'에 저장되었습니다.")
        
        return results

if __name__ == "__main__":
    asyncio.run(main()) 