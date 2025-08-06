import re
import json
import random
from typing import List, Dict, Any, Optional
from datetime import datetime
import os

class ConversationalAISystem:
    def __init__(self):
        self.message_generator = None
        self.conversation_history = []
        self.user_preferences = {}
        self.active_features = []
        
        # 기능별 명령어 및 설명
        self.feature_commands = {
            "메시지_생성": {
                "commands": ["메시지 생성", "AI 메시지", "메시지 만들어줘", "대화 생성"],
                "description": "컨텍스트에 기반한 AI 메시지 생성",
                "function": "generate_message"
            },
            "프로젝트_분석": {
                "commands": ["프로젝트 분석", "개포우성 분석", "분석해줘", "데이터 분석"],
                "description": "개포우성7차 프로젝트 데이터 분석",
                "function": "analyze_project"
            },
            "대화_요약": {
                "commands": ["대화 요약", "요약해줘", "정리해줘", "핵심 정리"],
                "description": "대화 내용 요약 및 핵심 포인트 추출",
                "function": "summarize_conversation"
            },
            "일정_관리": {
                "commands": ["일정 확인", "스케줄", "일정 관리", "마일스톤"],
                "description": "프로젝트 일정 및 마일스톤 관리",
                "function": "manage_schedule"
            },
            "문서_생성": {
                "commands": ["문서 생성", "보고서", "문서 만들어줘", "정리 문서"],
                "description": "프로젝트 관련 문서 및 보고서 생성",
                "function": "generate_document"
            },
            "통계_분석": {
                "commands": ["통계", "분석 통계", "데이터 통계", "수치 분석"],
                "description": "프로젝트 통계 및 수치 분석",
                "function": "analyze_statistics"
            },
            "알림_설정": {
                "commands": ["알림", "알림 설정", "알림 관리", "알림 켜기"],
                "description": "알림 및 알림 설정 관리",
                "function": "manage_notifications"
            },
            "도움말": {
                "commands": ["도움말", "help", "도움", "기능 설명"],
                "description": "사용 가능한 기능 및 명령어 설명",
                "function": "show_help"
            }
        }
        
        # 대화 패턴 및 응답 템플릿
        self.conversation_patterns = {
            "인사": {
                "patterns": ["안녕", "hello", "hi", "반가워"],
                "responses": [
                    "안녕하세요! 개포우성7차 프로젝트 AI 어시스턴트입니다. 무엇을 도와드릴까요?",
                    "반갑습니다! 프로젝트 관련해서 궁금한 점이 있으시면 언제든 말씀해주세요.",
                    "안녕하세요! 개포우성7차 프로젝트를 더욱 효율적으로 진행할 수 있도록 도와드리겠습니다."
                ]
            },
            "감사": {
                "patterns": ["감사", "고마워", "thank", "좋아"],
                "responses": [
                    "천만에요! 더욱 열심히 도와드리겠습니다.",
                    "감사합니다! 만족스러우셨다니 기쁩니다.",
                    "도움이 되어서 기쁩니다! 다른 궁금한 점이 있으시면 언제든 말씀해주세요."
                ]
            },
            "부정": {
                "patterns": ["아니야", "그만", "stop", "취소"],
                "responses": [
                    "알겠습니다. 다른 방법으로 도와드릴까요?",
                    "네, 중단하겠습니다. 다른 기능을 사용해보시겠어요?",
                    "취소하겠습니다. 다른 도움이 필요하시면 말씀해주세요."
                ]
            }
        }

    def initialize_message_generator(self):
        """메시지 생성기 초기화"""
        try:
            from message_generator import message_generator
            self.message_generator = message_generator
            return True
        except Exception as e:
            print(f"메시지 생성기 초기화 오류: {e}")
            return False

    def analyze_user_input(self, user_input: str) -> Dict[str, Any]:
        """사용자 입력 분석"""
        analysis = {
            "intent": "general",
            "feature": None,
            "parameters": {},
            "confidence": 0.0,
            "response_type": "conversation"
        }
        
        user_input_lower = user_input.lower()
        
        # 기능 명령어 분석
        for feature, config in self.feature_commands.items():
            for command in config["commands"]:
                if command in user_input_lower:
                    analysis["intent"] = "feature_request"
                    analysis["feature"] = feature
                    analysis["function"] = config["function"]
                    analysis["confidence"] = 0.9
                    break
            if analysis["feature"]:
                break
        
        # 대화 패턴 분석
        for pattern_type, pattern_config in self.conversation_patterns.items():
            for pattern in pattern_config["patterns"]:
                if pattern in user_input_lower:
                    analysis["intent"] = "conversation"
                    analysis["pattern_type"] = pattern_type
                    analysis["confidence"] = 0.8
                    break
            if analysis["intent"] == "conversation":
                break
        
        # 키워드 추출
        keywords = self.extract_keywords(user_input)
        analysis["keywords"] = keywords
        
        return analysis

    def extract_keywords(self, text: str) -> List[str]:
        """텍스트에서 키워드 추출"""
        keywords = []
        
        # 개포우성7차 관련 키워드
        project_keywords = ["시공사", "공사비", "설계", "홍보", "투표", "계약", "일정", "품질", "개포우성"]
        for keyword in project_keywords:
            if keyword in text:
                keywords.append(keyword)
        
        # 일반 키워드
        general_keywords = ["분석", "생성", "요약", "정리", "확인", "관리", "통계", "알림"]
        for keyword in general_keywords:
            if keyword in text:
                keywords.append(keyword)
        
        return keywords

    def generate_response(self, user_input: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """사용자 입력에 대한 응답 생성"""
        analysis = self.analyze_user_input(user_input)
        
        # 대화 히스토리에 추가
        self.conversation_history.append({
            "user_input": user_input,
            "analysis": analysis,
            "timestamp": datetime.now().isoformat()
        })
        
        response = {
            "success": True,
            "message": "",
            "suggestions": [],
            "actions": [],
            "data": {}
        }
        
        if analysis["intent"] == "feature_request":
            response = self.handle_feature_request(analysis, user_input, context)
        elif analysis["intent"] == "conversation":
            response = self.handle_conversation(analysis)
        else:
            response = self.handle_general_input(analysis, user_input)
        
        return response

    def handle_feature_request(self, analysis: Dict[str, Any], user_input: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """기능 요청 처리"""
        feature = analysis["feature"]
        function = analysis["function"]
        
        response = {
            "success": True,
            "message": "",
            "suggestions": [],
            "actions": [],
            "data": {}
        }
        
        if function == "generate_message":
            response = self.generate_ai_message(user_input, context)
        elif function == "analyze_project":
            response = self.analyze_project_data(user_input, context)
        elif function == "summarize_conversation":
            response = self.summarize_conversation(user_input, context)
        elif function == "manage_schedule":
            response = self.manage_project_schedule(user_input, context)
        elif function == "generate_document":
            response = self.generate_project_document(user_input, context)
        elif function == "analyze_statistics":
            response = self.analyze_project_statistics(user_input, context)
        elif function == "manage_notifications":
            response = self.manage_notification_settings(user_input, context)
        elif function == "show_help":
            response = self.show_available_features()
        
        return response

    def generate_ai_message(self, user_input: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """AI 메시지 생성"""
        if not self.message_generator:
            self.initialize_message_generator()
        
        try:
            messages = self.message_generator.generate_response(user_input, "개포우성7차", "professional")
            
            response = {
                "success": True,
                "message": "AI 메시지를 생성했습니다. 아래 제안 중에서 선택하거나 직접 입력하세요.",
                "suggestions": [msg["text"] for msg in messages],
                "actions": ["send_message", "edit_message", "regenerate"],
                "data": {
                    "generated_messages": messages,
                    "context": user_input
                }
            }
        except Exception as e:
            response = {
                "success": False,
                "message": f"메시지 생성 중 오류가 발생했습니다: {str(e)}",
                "suggestions": [],
                "actions": [],
                "data": {}
            }
        
        return response

    def analyze_project_data(self, user_input: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """프로젝트 데이터 분석"""
        analysis_data = {
            "total_messages": 1250,
            "active_participants": 45,
            "key_topics": ["시공사 평가", "공사비 분담금", "설계 품질", "투표 절차"],
            "sentiment": "positive",
            "engagement_rate": 0.78
        }
        
        response = {
            "success": True,
            "message": "개포우성7차 프로젝트 분석 결과입니다.",
            "suggestions": [
                "상세 분석 보고서 생성",
                "주요 이슈 요약",
                "참여자 활동 분석"
            ],
            "actions": ["generate_report", "export_data", "create_chart"],
            "data": analysis_data
        }
        
        return response

    def summarize_conversation(self, user_input: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """대화 요약"""
        summary = {
            "key_points": [
                "시공사 평가 기준 논의",
                "공사비 분담금 계산 방식",
                "설계 품질 평가 방법",
                "투표 절차 및 일정"
            ],
            "action_items": [
                "시공사 비교 분석표 작성",
                "공사비 분담금 계산서 준비",
                "설계 품질 평가 기준 정리"
            ],
            "next_steps": [
                "조합원 투표 일정 확정",
                "설명회 개최 계획 수립",
                "계약 조건 검토 시작"
            ]
        }
        
        response = {
            "success": True,
            "message": "대화 내용을 요약했습니다.",
            "suggestions": [
                "요약 보고서 생성",
                "액션 아이템 정리",
                "다음 단계 계획"
            ],
            "actions": ["create_summary", "export_summary", "schedule_followup"],
            "data": summary
        }
        
        return response

    def manage_project_schedule(self, user_input: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """프로젝트 일정 관리"""
        schedule_data = {
            "current_phase": "시공사 선정 단계",
            "milestones": [
                {"name": "시공사 평가 완료", "date": "2025-08-15", "status": "진행중"},
                {"name": "투표 실시", "date": "2025-08-25", "status": "예정"},
                {"name": "계약 체결", "date": "2025-09-10", "status": "예정"}
            ],
            "upcoming_events": [
                "설명회 개최 (2025-08-20)",
                "조합원 투표 (2025-08-25)",
                "최종 계약 체결 (2025-09-10)"
            ]
        }
        
        response = {
            "success": True,
            "message": "프로젝트 일정 정보입니다.",
            "suggestions": [
                "일정 수정",
                "새 이벤트 추가",
                "알림 설정"
            ],
            "actions": ["update_schedule", "add_event", "set_reminder"],
            "data": schedule_data
        }
        
        return response

    def generate_project_document(self, user_input: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """프로젝트 문서 생성"""
        document_templates = [
            "시공사 평가 보고서",
            "공사비 분담금 분석서",
            "설계 품질 비교표",
            "투표 절차 안내서",
            "프로젝트 진행 보고서"
        ]
        
        response = {
            "success": True,
            "message": "생성 가능한 문서 목록입니다.",
            "suggestions": document_templates,
            "actions": ["generate_document", "edit_template", "export_pdf"],
            "data": {
                "available_templates": document_templates,
                "recent_documents": [
                    "시공사_평가_보고서_20250801.pdf",
                    "공사비_분담금_분석서_20250801.pdf"
                ]
            }
        }
        
        return response

    def analyze_project_statistics(self, user_input: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """프로젝트 통계 분석"""
        statistics = {
            "message_count": 1250,
            "participant_count": 45,
            "topic_distribution": {
                "시공사": 35,
                "공사비": 28,
                "설계": 22,
                "투표": 15
            },
            "engagement_metrics": {
                "daily_active_users": 23,
                "average_response_time": "2.5시간",
                "satisfaction_score": 4.2
            }
        }
        
        response = {
            "success": True,
            "message": "프로젝트 통계 분석 결과입니다.",
            "suggestions": [
                "상세 통계 보고서",
                "트렌드 분석",
                "예측 분석"
            ],
            "actions": ["generate_chart", "export_statistics", "create_report"],
            "data": statistics
        }
        
        return response

    def manage_notification_settings(self, user_input: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """알림 설정 관리"""
        notification_settings = {
            "email_notifications": True,
            "push_notifications": True,
            "sms_notifications": False,
            "notification_types": [
                "새 메시지 알림",
                "일정 알림",
                "중요 업데이트 알림",
                "투표 알림"
            ]
        }
        
        response = {
            "success": True,
            "message": "알림 설정을 확인했습니다.",
            "suggestions": [
                "알림 설정 변경",
                "새 알림 유형 추가",
                "알림 시간 설정"
            ],
            "actions": ["update_settings", "add_notification_type", "set_schedule"],
            "data": notification_settings
        }
        
        return response

    def show_available_features(self) -> Dict[str, Any]:
        """사용 가능한 기능 표시"""
        features = []
        for feature, config in self.feature_commands.items():
            features.append({
                "name": feature,
                "description": config["description"],
                "commands": config["commands"]
            })
        
        response = {
            "success": True,
            "message": "사용 가능한 기능 목록입니다.",
            "suggestions": [f"{feature['name']}: {feature['description']}" for feature in features],
            "actions": ["select_feature", "learn_more", "test_feature"],
            "data": {
                "available_features": features,
                "total_features": len(features)
            }
        }
        
        return response

    def handle_conversation(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """일반 대화 처리"""
        pattern_type = analysis.get("pattern_type", "general")
        
        if pattern_type in self.conversation_patterns:
            responses = self.conversation_patterns[pattern_type]["responses"]
            selected_response = random.choice(responses)
        else:
            selected_response = "네, 말씀해주세요. 어떤 도움이 필요하신가요?"
        
        response = {
            "success": True,
            "message": selected_response,
            "suggestions": [
                "메시지 생성",
                "프로젝트 분석",
                "일정 확인"
            ],
            "actions": ["continue_conversation", "show_features", "end_conversation"],
            "data": {}
        }
        
        return response

    def handle_general_input(self, analysis: Dict[str, Any], user_input: str) -> Dict[str, Any]:
        """일반 입력 처리"""
        keywords = analysis.get("keywords", [])
        
        if keywords:
            # 키워드 기반 제안
            suggestions = []
            for keyword in keywords:
                if keyword in ["시공사", "공사비", "설계", "투표"]:
                    suggestions.append(f"{keyword} 관련 분석")
                    suggestions.append(f"{keyword} 정보 확인")
            
            response = {
                "success": True,
                "message": f"'{', '.join(keywords)}' 관련 정보를 찾아보겠습니다.",
                "suggestions": suggestions,
                "actions": ["search_info", "generate_report", "show_details"],
                "data": {"keywords": keywords}
            }
        else:
            response = {
                "success": True,
                "message": "무엇을 도와드릴까요?",
                "suggestions": [
                    "메시지 생성",
                    "프로젝트 분석",
                    "일정 확인",
                    "도움말 보기"
                ],
                "actions": ["show_features", "start_conversation"],
                "data": {}
            }
        
        return response

# 전역 인스턴스 생성
conversational_ai = ConversationalAISystem() 