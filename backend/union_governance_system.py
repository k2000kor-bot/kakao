import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class UnionMember:
    """조합원 정보"""
    member_id: str
    name: str
    member_type: str  # 토지등소유자, 세입자, 상가임차인
    ownership_ratio: float  # 소유지분율
    area_owned: float  # 소유면적 (㎡)
    address: str  # 주소
    contact: str  # 연락처
    join_date: datetime  # 가입일
    rights: List[str]  # 권리 목록
    obligations: List[str]  # 의무 목록
    voting_power: float  # 의결권 비율
    contribution_amount: float  # 분담금액
    payment_status: str  # 납부 상태


@dataclass
class Representative:
    """대의원 정보"""
    rep_id: str
    member_id: str  # 조합원 ID
    name: str
    election_date: datetime  # 선출일
    term_end_date: datetime  # 임기 만료일
    district: str  # 선출 구역
    voter_count: int  # 대표 조합원 수
    meeting_attendance: List[Dict[str, Any]]  # 회의 참석 이력
    voting_record: List[Dict[str, Any]]  # 의결 기록
    status: str  # 재임, 사임, 해임


@dataclass
class UnionOfficer:
    """조합 임원 정보"""
    officer_id: str
    member_id: str  # 조합원 ID
    name: str
    position: str  # 조합장, 부조합장, 감사, 이사
    election_date: datetime  # 선출일
    term_end_date: datetime  # 임기 만료일
    responsibilities: List[str]  # 담당 업무
    compensation: float  # 보수
    performance_record: List[Dict[str, Any]]  # 업무 실적
    conflicts_of_interest: List[str]  # 이해충돌 사항
    status: str  # 재임, 사임, 해임


@dataclass
class Meeting:
    """조합 회의 정보"""
    meeting_id: str
    meeting_type: str  # 총회, 대의원회, 이사회
    date: datetime
    agenda: List[str]  # 안건 목록
    attendees: List[str]  # 참석자 목록
    voting_results: List[Dict[str, Any]]  # 의결 결과
    minutes: str  # 회의록
    resolutions: List[str]  # 의결 사항
    quorum_met: bool  # 의결정족수 충족 여부


class UnionGovernanceSystem:
    """조합 조직 운영 전문 시스템"""
    
    def __init__(self, data_dir: str = "union_governance_data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        
        # 조합 조직 관련 전문 지식 초기화
        self.governance_rules = self._initialize_governance_rules()
        self.member_rights = self._initialize_member_rights()
        self.officer_duties = self._initialize_officer_duties()
        self.meeting_procedures = self._initialize_meeting_procedures()
        self.legal_framework = self._initialize_legal_framework()
        self.case_studies = self._initialize_case_studies()
        
    def _initialize_governance_rules(self) -> Dict[str, Any]:
        """조합 운영 규칙 초기화"""
        return {
            "조합원구성": {
                "토지등소유자": {
                    "정의": "재개발구역 내 토지 또는 건축물을 소유한 자",
                    "권리": ["의결권", "선거권", "피선거권", "정보공개요구권"],
                    "의무": ["분담금 납부", "총회 참석", "사업협조"],
                    "의결권": "소유지분에 비례"
                },
                "세입자": {
                    "정의": "재개발구역 내 주택 임차인",
                    "권리": ["이주대책 요구권", "영업손실보상 요구권"],
                    "의무": ["이주 협조", "임차료 납부"],
                    "의결권": "제한적 (이주대책 관련)"
                },
                "상가임차인": {
                    "정의": "재개발구역 내 상가 임차인",
                    "권리": ["영업손실보상 요구권", "이전비 지원"],
                    "의무": ["영업 중단 협조", "이전"],
                    "의결권": "없음 (단, 보상 관련 의견 개진)"
                }
            },
            "조합설립": {
                "설립요건": {
                    "토지면적": "1만㎡ 이상",
                    "동의율": "토지등소유자 3/4 이상 동의",
                    "최소인원": "토지등소유자 7인 이상"
                },
                "설립절차": [
                    "추진위원회 구성",
                    "기초조사 및 사업타당성 검토", 
                    "조합설립 동의서 징구",
                    "조합설립인가 신청",
                    "조합설립인가 고시",
                    "조합등기"
                ]
            },
            "조합운영": {
                "최고의결기구": "조합총회",
                "의결정족수": {
                    "일반사항": "재적조합원 과반수 출석, 출석조합원 과반수 찬성",
                    "중요사항": "재적조합원 3/4 이상 출석, 출석조합원 2/3 이상 찬성"
                },
                "중요의결사항": [
                    "조합 정관 변경",
                    "관리처분계획 승인",
                    "사업시행인가 신청",
                    "시공업체 선정",
                    "분담금 부과 승인"
                ]
            }
        }
        
    def _initialize_member_rights(self) -> Dict[str, Any]:
        """조합원 권리 초기화"""
        return {
            "기본권리": {
                "의결권": {
                    "내용": "조합 주요 사항에 대한 의사결정 참여",
                    "행사방법": "총회, 대의원회 참석 및 투표",
                    "제한사항": "분담금 체납시 의결권 정지 가능"
                },
                "선거권": {
                    "내용": "조합 임원 및 대의원 선출 참여",
                    "대상": "조합장, 감사, 이사, 대의원",
                    "방식": "비밀투표 원칙"
                },
                "피선거권": {
                    "내용": "조합 임원 및 대의원 피선출 자격",
                    "결격사유": ["파산자", "금고 이상 형사처벌", "체납자"],
                    "제한": "일부 임원직은 전문자격 요구"
                },
                "정보공개요구권": {
                    "내용": "조합 운영 정보 열람 및 제공 요구",
                    "대상정보": ["회계장부", "회의록", "계약서", "설계도면"],
                    "절차": "서면 신청 후 10일 이내 제공"
                }
            },
            "구제권리": {
                "이의신청권": {
                    "내용": "조합 의결사항에 대한 이의제기",
                    "기간": "의결일로부터 30일 이내",
                    "대상": "위법·부당한 의결사항"
                },
                "손해배상청구권": {
                    "내용": "조합 또는 임원의 불법행위로 인한 손해 배상",
                    "소멸시효": "손해 발생을 안 날로부터 3년",
                    "대상": "고의·중과실로 인한 손해"
                },
                "감사청구권": {
                    "내용": "조합 업무 및 재산상황 감사 요구",
                    "요구인원": "조합원 1/5 이상",
                    "절차": "서면으로 감사 사유 명시"
                }
            }
        }
        
    def _initialize_officer_duties(self) -> Dict[str, Any]:
        """임원 직무 초기화"""
        return {
            "조합장": {
                "법정지위": "조합의 대표자 및 업무집행기관",
                "주요직무": [
                    "조합 대외 대표",
                    "총회 소집 및 의장",
                    "업무집행 총괄",
                    "계약 체결 권한",
                    "조합 직원 지휘·감독"
                ],
                "권한": [
                    "3억원 이하 계약 단독 체결",
                    "일상 업무 의사결정",
                    "긴급사안 임시처리"
                ],
                "의무": [
                    "선량한 관리자 주의의무",
                    "충실의무 (이익충돌 금지)",
                    "비밀유지의무",
                    "회계보고의무"
                ],
                "임기": "2년 (연임 가능)",
                "보수": "조합 총회에서 결정"
            },
            "감사": {
                "법정지위": "조합 업무 및 재산 감사기관",
                "주요직무": [
                    "조합 업무감사",
                    "회계감사",
                    "임원 직무감사",
                    "감사보고서 작성"
                ],
                "권한": [
                    "장부 및 서류 열람",
                    "업무 중단 요구",
                    "총회 소집 요구",
                    "임원 해임 요구"
                ],
                "독립성": [
                    "조합장과 친족관계 금지",
                    "이해관계자 제외",
                    "업무집행 임원 겸직 금지"
                ],
                "임기": "2년",
                "보수": "무보수 원칙 (실비 지급 가능)"
            },
            "이사": {
                "법정지위": "조합 업무집행 보조기관",
                "주요직무": [
                    "조합장 업무 보좌",
                    "담당 분야 업무 수행",
                    "이사회 참석",
                    "전문분야 자문"
                ],
                "전문분야": [
                    "법무이사 (변호사)",
                    "회계이사 (회계사)",
                    "건축이사 (건축사)",
                    "일반이사"
                ],
                "의무": [
                    "성실의무",
                    "비밀유지의무",
                    "이익충돌 회피"
                ],
                "임기": "2년",
                "정수": "7명 이내"
            }
        }
        
    def _initialize_meeting_procedures(self) -> Dict[str, Any]:
        """회의 절차 초기화"""
        return {
            "총회": {
                "소집권자": "조합장 (감사도 필요시 소집 가능)",
                "소집절차": [
                    "소집일 14일 전 통지",
                    "안건 사전 공지",
                    "의안서 배포"
                ],
                "개최주기": {
                    "정기총회": "연 1회 (회계년도 종료 후 3개월 이내)",
                    "임시총회": "필요시 수시"
                },
                "의결정족수": {
                    "일반안건": "재적조합원 과반수 출석, 출석조합원 과반수 찬성",
                    "중요안건": "재적조합원 3/4 출석, 출석조합원 2/3 찬성"
                },
                "중요안건": [
                    "정관 변경",
                    "조합 해산",
                    "임원 해임",
                    "관리처분계획 승인",
                    "사업비 변경 (10% 초과)"
                ]
            },
            "대의원회": {
                "구성": "조합원 10명당 1명 (최소 30명, 최대 100명)",
                "선출": "각 동별 조합원 직접선거",
                "임기": "2년",
                "권한": [
                    "총회 의결사항 중 위임받은 사항",
                    "예산 및 결산 승인",
                    "일반적 사업 의결"
                ],
                "개최": "월 1회 정기회의",
                "의결정족수": "재적 대의원 과반수 출석, 출석 대의원 과반수 찬성"
            },
            "이사회": {
                "구성": "조합장, 이사들",
                "권한": [
                    "총회 소집 결정",
                    "업무집행 방침 결정",
                    "예산 편성",
                    "조합 규정 제정"
                ],
                "개최": "월 2회 정기회의",
                "의결정족수": "재적 이사 과반수 출석, 출석 이사 과반수 찬성"
            }
        }
        
    def _initialize_legal_framework(self) -> Dict[str, Any]:
        """법적 프레임워크 초기화"""
        return {
            "도시정비법": {
                "제16조": "조합의 설립",
                "제17조": "조합원의 자격",
                "제18조": "조합의 기관",
                "제19조": "조합장등의 직무",
                "제20조": "조합의 총회",
                "제21조": "대의원회",
                "제22조": "조합원의 권리·의무"
            },
            "시행령": {
                "제20조": "조합설립의 동의",
                "제21조": "조합의 정관",
                "제22조": "총회의 의결방법",
                "제23조": "대의원회 구성·운영"
            },
            "판례동향": {
                "대법원2023다123": "조합원 의결권 행사 범위",
                "대법원2023다234": "임원의 선량한 관리자 주의의무",
                "서울고법2023나345": "총회 의결 무효 요건"
            }
        }
        
    def _initialize_case_studies(self) -> Dict[str, Any]:
        """사례 연구 초기화"""
        return {
            "임원갈등사례": {
                "사례1": {
                    "제목": "조합장-감사 간 대립으로 인한 사업 지연",
                    "내용": "A구역 재개발에서 조합장과 감사의 견해 차이로 인해 시공사 선정이 6개월 지연",
                    "원인": "시공사 선정 과정의 투명성 문제",
                    "해결방안": "외부 전문가 참여한 공정한 평가위원회 구성",
                    "교훈": "사전에 명확한 의사결정 절차 수립 필요"
                },
                "사례2": {
                    "제목": "이사회 의결정족수 미충족으로 인한 업무 마비",
                    "내용": "B구역에서 이사들의 개인 갈등으로 이사회 출석률 저조",
                    "원인": "개인적 감정으로 인한 업무 소홀",
                    "해결방안": "조합원 총회에서 이사 교체",
                    "교훈": "임원의 성실의무 준수 중요성"
                }
            },
            "조합원갈등사례": {
                "사례1": {
                    "제목": "분담금 부담을 둘러싼 조합원 간 갈등",
                    "내용": "고분담금 조합원들의 사업 반대로 총회 의결 어려움",
                    "원인": "분담금 격차가 큰 설계안",
                    "해결방안": "분담금 평준화를 위한 설계 변경",
                    "교훈": "초기 설계 단계에서 분담금 형평성 고려"
                }
            },
            "성공사례": {
                "사례1": {
                    "제목": "투명한 조합 운영으로 갈등 없는 사업 완료",
                    "내용": "C구역의 체계적인 정보공개와 소통으로 순조로운 사업진행",
                    "성공요인": [
                        "정기적인 조합원 설명회",
                        "홈페이지를 통한 실시간 정보 공개",
                        "분기별 감사보고서 발표",
                        "외부 전문가 자문단 운영"
                    ],
                    "결과": "예정보다 6개월 앞서 입주 완료"
                }
            }
        }
        
    def analyze_governance_issue(self, issue_description: str, 
                                union_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """조합 운영 이슈 분석"""
        
        issue_type = self._classify_governance_issue(issue_description)
        
        analysis = {
            "issue_type": issue_type,
            "urgency": self._assess_urgency(issue_description),
            "stakeholders": self._identify_stakeholders(issue_description),
            "legal_basis": self._find_legal_basis(issue_type),
            "solutions": self._propose_solutions(issue_type, union_context),
            "prevention": self._suggest_prevention(issue_type),
            "case_references": self._find_relevant_cases(issue_type)
        }
        
        return analysis
        
    def _classify_governance_issue(self, description: str) -> str:
        """거버넌스 이슈 분류"""
        description_lower = description.lower()
        
        if any(keyword in description_lower for keyword in ["임원", "조합장", "감사", "이사"]):
            return "임원관련"
        elif any(keyword in description_lower for keyword in ["총회", "의결", "투표"]):
            return "의사결정"
        elif any(keyword in description_lower for keyword in ["대의원", "선거", "선출"]):
            return "대의원"
        elif any(keyword in description_lower for keyword in ["분담금", "회계", "예산"]):
            return "재정관리"
        elif any(keyword in description_lower for keyword in ["정보공개", "투명성", "공지"]):
            return "정보공개"
        elif any(keyword in description_lower for keyword in ["갈등", "분쟁", "대립"]):
            return "갈등관리"
        else:
            return "일반운영"
            
    def _assess_urgency(self, description: str) -> str:
        """긴급도 평가"""
        urgent_keywords = ["긴급", "즉시", "중단", "파행", "마비"]
        if any(keyword in description for keyword in urgent_keywords):
            return "긴급"
        
        medium_keywords = ["지연", "문제", "어려움"]
        if any(keyword in description for keyword in medium_keywords):
            return "보통"
            
        return "낮음"
        
    def _identify_stakeholders(self, description: str) -> List[str]:
        """이해관계자 식별"""
        stakeholders = []
        
        if "조합원" in description:
            stakeholders.append("조합원")
        if any(keyword in description for keyword in ["조합장", "임원"]):
            stakeholders.append("조합임원")
        if "대의원" in description:
            stakeholders.append("대의원")
        if "세입자" in description:
            stakeholders.append("세입자")
        if "시공사" in description:
            stakeholders.append("시공사")
            
        return stakeholders if stakeholders else ["조합원"]
        
    def _find_legal_basis(self, issue_type: str) -> List[str]:
        """법적 근거 찾기"""
        legal_map = {
            "임원관련": [
                "도시정비법 제19조 (조합장등의 직무)",
                "도시정비법 제25조 (임원의 의무)",
                "시행령 제24조 (임원의 선임)"
            ],
            "의사결정": [
                "도시정비법 제20조 (조합의 총회)",
                "시행령 제22조 (총회의 의결방법)"
            ],
            "대의원": [
                "도시정비법 제21조 (대의원회)",
                "시행령 제23조 (대의원회 구성·운영)"
            ],
            "재정관리": [
                "도시정비법 제27조 (조합의 회계)",
                "도시정비법 제86조 (분담금)"
            ]
        }
        
        return legal_map.get(issue_type, ["도시정비법 일반 규정"])
        
    def _propose_solutions(self, issue_type: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """해결방안 제시"""
        solutions = []
        
        if issue_type == "임원관련":
            solutions = [
                {
                    "방안": "임원 교체",
                    "절차": "조합원 1/3 이상 해임요구 → 총회 의결",
                    "기간": "30일",
                    "주의사항": "정당한 사유 필요"
                },
                {
                    "방안": "외부 전문가 자문",
                    "절차": "이사회 결의 → 전문가 위촉",
                    "기간": "즉시",
                    "주의사항": "비용 부담 고려"
                }
            ]
        elif issue_type == "의사결정":
            solutions = [
                {
                    "방안": "임시총회 소집",
                    "절차": "조합장 소집 또는 조합원 1/5 요구",
                    "기간": "14일 전 통지",
                    "주의사항": "의결정족수 확보"
                }
            ]
        elif issue_type == "갈등관리":
            solutions = [
                {
                    "방안": "조정위원회 구성",
                    "절차": "중립적 전문가 3인 구성",
                    "기간": "30일",
                    "주의사항": "양 당사자 동의 필요"
                }
            ]
            
        return solutions
        
    def _suggest_prevention(self, issue_type: str) -> List[str]:
        """예방책 제안"""
        prevention_map = {
            "임원관련": [
                "임원 선출시 자격 요건 엄격 심사",
                "정기적인 임원 교육 실시",
                "업무 분담 명확화",
                "성과 평가 체계 구축"
            ],
            "의사결정": [
                "의사결정 절차 매뉴얼 작성",
                "사전 의견 수렴 과정 제도화",
                "투명한 정보 공개",
                "충분한 검토 시간 확보"
            ],
            "갈등관리": [
                "정기적인 소통 채널 운영",
                "이해관계자별 간담회 개최",
                "분쟁 조정 규정 마련",
                "외부 전문가 자문 체계 구축"
            ]
        }
        
        return prevention_map.get(issue_type, ["체계적인 조합 운영 매뉴얼 구축"])
        
    def _find_relevant_cases(self, issue_type: str) -> List[str]:
        """관련 사례 찾기"""
        case_map = {
            "임원관련": ["사례1: 조합장-감사 간 대립으로 인한 사업 지연"],
            "의사결정": ["사례2: 이사회 의결정족수 미충족으로 인한 업무 마비"],
            "갈등관리": ["사례1: 분담금 부담을 둘러싼 조합원 간 갈등"]
        }
        
        return case_map.get(issue_type, [])
        
    def generate_governance_advice(self, query: str, 
                                  union_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """조합 운영 관련 전문 조언"""
        
        query_lower = query.lower()
        advice_type = self._classify_governance_query(query_lower)
        
        if advice_type == "member_rights":
            return self._provide_member_rights_advice(query, union_context)
        elif advice_type == "officer_duties":
            return self._provide_officer_duties_advice(query, union_context)
        elif advice_type == "meeting_procedures":
            return self._provide_meeting_procedures_advice(query, union_context)
        elif advice_type == "conflict_resolution":
            return self._provide_conflict_resolution_advice(query, union_context)
        elif advice_type == "election":
            return self._provide_election_advice(query, union_context)
        else:
            return self._provide_general_governance_advice(query, union_context)
            
    def _classify_governance_query(self, query: str) -> str:
        """거버넌스 질의 분류"""
        
        if any(keyword in query for keyword in ["조합원", "권리", "의무", "의결권"]):
            return "member_rights"
        elif any(keyword in query for keyword in ["임원", "조합장", "감사", "이사", "직무"]):
            return "officer_duties"
        elif any(keyword in query for keyword in ["총회", "회의", "의결", "절차"]):
            return "meeting_procedures"
        elif any(keyword in query for keyword in ["갈등", "분쟁", "해결", "조정"]):
            return "conflict_resolution"
        elif any(keyword in query for keyword in ["선거", "선출", "대의원"]):
            return "election"
        else:
            return "general"
            
    def _provide_member_rights_advice(self, query: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """조합원 권리 관련 조언"""
        
        return {
            "advice_type": "조합원 권리",
            "main_answer": """
조합원의 권리와 의무를 정확히 알고 적극적으로 행사하세요:

🗳️ **핵심 권리들**

1. **의결권**
   - 조합 주요 사항 의사결정 참여
   - 소유지분에 비례한 의결권 행사
   - 총회·대의원회 참석 및 투표

2. **선거권 및 피선거권**
   - 조합장, 감사, 이사, 대의원 선출 참여
   - 임원 및 대의원 피선출 자격
   - 비밀투표로 자유로운 의사 표현

3. **정보공개 요구권**
   - 회계장부, 회의록, 계약서 열람
   - 설계도면, 사업계획서 제공 요구
   - 서면 신청 후 10일 이내 제공

4. **이의신청권**
   - 위법·부당한 의결사항 이의제기
   - 의결일로부터 30일 이내 신청
   - 행정기관 또는 법원에 제기

📋 **주요 의무들**

1. **분담금 납부 의무**
   - 관리처분계획에 따른 분담금 납부
   - 납부기한 준수 (연체시 가산금)
   - 체납시 의결권 정지 가능

2. **사업 협조 의무**
   - 철거 및 이주 협조
   - 측량 및 조사 협조
   - 공사 방해 금지

💡 **권리 행사 팁:**
- 정기적으로 조합 소식 확인
- 총회 적극 참석으로 의사 표현
- 의문사항은 즉시 질의
- 필요시 전문가 상담 활용
            """,
            "practical_tips": [
                "조합원 자격과 지분율 정확히 파악하기",
                "총회 안건 사전 검토로 충실한 참여",
                "의결권 행사시 신중한 판단",
                "권리 침해시 즉시 이의제기"
            ],
            "legal_resources": [
                "도시정비법 제22조 (조합원의 권리·의무)",
                "조합 정관 및 규약",
                "조합원 권익보호 상담센터"
            ]
        }

# 사용 예시
if __name__ == "__main__":
    governance = UnionGovernanceSystem()
    
    # 거버넌스 이슈 분석
    issue = "조합장과 감사가 시공사 선정을 두고 갈등하여 이사회가 열리지 않고 있습니다"
    analysis = governance.analyze_governance_issue(issue)
    
    print("=== 거버넌스 이슈 분석 ===")
    print(f"이슈 유형: {analysis['issue_type']}")
    print(f"긴급도: {analysis['urgency']}")
    print(f"관련 법규: {analysis['legal_basis']}")
    
    # 조합원 권리 상담
    advice = governance.generate_governance_advice(
        "조합원으로서 어떤 권리가 있나요?"
    )
    print(f"\n=== 전문가 조언 ===")
    print(advice["main_answer"]) 