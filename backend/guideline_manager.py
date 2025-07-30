import os
import json
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from pathlib import Path
import logging
from dataclasses import dataclass
from enum import Enum
import re
from collections import defaultdict

logger = logging.getLogger(__name__)

class GuidelinePriority(Enum):
    CRITICAL = "critical"      # 긴급
    HIGH = "high"             # 높음
    MEDIUM = "medium"         # 보통
    LOW = "low"               # 낮음

class GuidelineCategory(Enum):
    LABOR_LAW = "labor_law"           # 노동법
    SAFETY = "safety"                 # 안전
    WELFARE = "welfare"               # 복지
    NEGOTIATION = "negotiation"       # 협의
    EDUCATION = "education"           # 교육
    GENERAL = "general"               # 일반

@dataclass
class Guideline:
    id: str
    title: str
    content: str
    category: GuidelineCategory
    priority: GuidelinePriority
    keywords: List[str]
    references: List[str]
    created_at: datetime
    updated_at: datetime
    usage_count: int = 0
    effectiveness_score: float = 0.0

class GuidelineManager:
    """지침 관리 시스템"""
    
    def __init__(self, db_path: str = "guidelines.db"):
        self.db_path = db_path
        self.init_database()
        self.load_guidelines()
    
    def init_database(self):
        """데이터베이스 초기화"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 지침 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS guidelines (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                category TEXT NOT NULL,
                priority TEXT NOT NULL,
                keywords TEXT,
                references TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                usage_count INTEGER DEFAULT 0,
                effectiveness_score REAL DEFAULT 0.0
            )
        ''')
        
        # 지침 사용 기록 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS guideline_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guideline_id TEXT,
                context TEXT,
                user_feedback TEXT,
                used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (guideline_id) REFERENCES guidelines (id)
            )
        ''')
        
        # 지침 효과성 평가 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS guideline_effectiveness (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guideline_id TEXT,
                metric_name TEXT,
                metric_value REAL,
                evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (guideline_id) REFERENCES guidelines (id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def load_guidelines(self):
        """지침 로드"""
        self.guidelines = {}
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, title, content, category, priority, keywords, references,
                   created_at, updated_at, usage_count, effectiveness_score
            FROM guidelines
        ''')
        
        for row in cursor.fetchall():
            guideline = Guideline(
                id=row[0],
                title=row[1],
                content=row[2],
                category=GuidelineCategory(row[3]),
                priority=GuidelinePriority(row[4]),
                keywords=json.loads(row[5]) if row[5] else [],
                references=json.loads(row[6]) if row[6] else [],
                created_at=datetime.fromisoformat(row[7]),
                updated_at=datetime.fromisoformat(row[8]),
                usage_count=row[9],
                effectiveness_score=row[10]
            )
            self.guidelines[guideline.id] = guideline
        
        conn.close()
    
    def generate_guidelines_from_data(self, data_dir: str = "processed") -> Dict[str, Any]:
        """업로드된 데이터에서 지침 자동 생성"""
        try:
            data_path = Path(data_dir)
            if not data_path.exists():
                return {"error": "데이터 디렉토리가 존재하지 않습니다."}
            
            generated_guidelines = []
            
            # 카테고리별 데이터 분석
            for category_dir in data_path.iterdir():
                if category_dir.is_dir():
                    category = GuidelineCategory(category_dir.name)
                    guidelines = self.analyze_category_data(category_dir, category)
                    generated_guidelines.extend(guidelines)
            
            # 지침 저장
            for guideline in generated_guidelines:
                self.save_guideline(guideline)
            
            self.load_guidelines()  # 다시 로드
            
            return {
                "status": "success",
                "generated_count": len(generated_guidelines),
                "guidelines": [g.title for g in generated_guidelines]
            }
            
        except Exception as e:
            logger.error(f"지침 생성 실패: {e}")
            return {"error": f"지침 생성 실패: {str(e)}"}
    
    def analyze_category_data(self, category_dir: Path, category: GuidelineCategory) -> List[Guideline]:
        """카테고리별 데이터 분석하여 지침 생성"""
        guidelines = []
        
        # 파일 분석
        files = list(category_dir.iterdir())
        if not files:
            return guidelines
        
        # 파일명에서 키워드 추출
        keywords = self.extract_keywords_from_files(files)
        
        # 카테고리별 기본 지침 생성
        base_guidelines = self.get_base_guidelines_for_category(category)
        
        for base_guideline in base_guidelines:
            # 파일 데이터를 기반으로 지침 커스터마이징
            customized_guideline = self.customize_guideline(
                base_guideline, keywords, files
            )
            guidelines.append(customized_guideline)
        
        return guidelines
    
    def extract_keywords_from_files(self, files: List[Path]) -> List[str]:
        """파일에서 키워드 추출"""
        keywords = []
        
        for file_path in files:
            # 파일명에서 키워드 추출
            filename = file_path.stem.lower()
            
            # 일반적인 키워드 패턴
            keyword_patterns = [
                r'급여|체불|임금|지급',
                r'안전|사고|보호|규정',
                r'복지|혜택|의료|교육',
                r'협의|회의|논의|합의',
                r'교육|훈련|강의|학습',
                r'조합|정책|규정|총회'
            ]
            
            for pattern in keyword_patterns:
                matches = re.findall(pattern, filename)
                keywords.extend(matches)
        
        # 중복 제거 및 빈도 계산
        keyword_counts = defaultdict(int)
        for keyword in keywords:
            keyword_counts[keyword] += 1
        
        # 상위 키워드 반환
        return sorted(keyword_counts.keys(), key=lambda x: keyword_counts[x], reverse=True)[:10]
    
    def get_base_guidelines_for_category(self, category: GuidelineCategory) -> List[Dict[str, Any]]:
        """카테고리별 기본 지침 템플릿"""
        base_guidelines = {
            GuidelineCategory.LABOR_LAW: [
                {
                    "title": "노동법 준수 가이드라인",
                    "content": "모든 업무는 관련 노동법을 준수하여 수행해야 합니다. 특히 근로기준법, 산업안전보건법, 최저임금법을 철저히 준수하세요.",
                    "priority": GuidelinePriority.HIGH,
                    "keywords": ["노동법", "근로기준법", "산업안전", "최저임금"]
                },
                {
                    "title": "임금 지급 규정",
                    "content": "임금은 정해진 날짜에 정확히 지급되어야 하며, 체불이 발생하지 않도록 관리해야 합니다.",
                    "priority": GuidelinePriority.CRITICAL,
                    "keywords": ["임금", "체불", "지급", "급여"]
                }
            ],
            GuidelineCategory.SAFETY: [
                {
                    "title": "안전 작업 가이드라인",
                    "content": "모든 작업은 안전 규정을 준수하여 수행해야 하며, 보호구 착용을 필수로 합니다.",
                    "priority": GuidelinePriority.CRITICAL,
                    "keywords": ["안전", "보호구", "규정", "작업"]
                },
                {
                    "title": "사고 예방 지침",
                    "content": "사고 예방을 위해 정기적인 안전 점검과 교육을 실시해야 합니다.",
                    "priority": GuidelinePriority.HIGH,
                    "keywords": ["사고", "예방", "점검", "교육"]
                }
            ],
            GuidelineCategory.WELFARE: [
                {
                    "title": "복지 혜택 관리",
                    "content": "조합원의 복지 혜택을 적극적으로 관리하고 개선해야 합니다.",
                    "priority": GuidelinePriority.HIGH,
                    "keywords": ["복지", "혜택", "의료", "교육"]
                }
            ],
            GuidelineCategory.NEGOTIATION: [
                {
                    "title": "협의 진행 가이드라인",
                    "content": "협의는 상호 존중과 이해를 바탕으로 진행해야 하며, 합의점을 찾기 위해 노력해야 합니다.",
                    "priority": GuidelinePriority.HIGH,
                    "keywords": ["협의", "합의", "회의", "논의"]
                }
            ],
            GuidelineCategory.EDUCATION: [
                {
                    "title": "교육 프로그램 운영",
                    "content": "조합원의 역량 향상을 위한 교육 프로그램을 정기적으로 운영해야 합니다.",
                    "priority": GuidelinePriority.MEDIUM,
                    "keywords": ["교육", "훈련", "프로그램", "역량"]
                }
            ]
        }
        
        return base_guidelines.get(category, [])
    
    def customize_guideline(self, base_guideline: Dict[str, Any], keywords: List[str], files: List[Path]) -> Guideline:
        """기본 지침을 데이터에 맞게 커스터마이징"""
        # 키워드를 기반으로 내용 보강
        enhanced_content = base_guideline["content"]
        if keywords:
            keyword_mention = f"특히 {', '.join(keywords[:3])} 관련 사항에 주의를 기울여야 합니다."
            enhanced_content += f" {keyword_mention}"
        
        # 참고 자료 추가
        references = [str(f) for f in files[:5]]  # 최대 5개 파일
        
        return Guideline(
            id=f"guideline_{len(self.guidelines) + 1}",
            title=base_guideline["title"],
            content=enhanced_content,
            category=GuidelineCategory.GENERAL,  # 기본값
            priority=base_guideline["priority"],
            keywords=keywords,
            references=references,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
    
    def save_guideline(self, guideline: Guideline):
        """지침 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO guidelines 
            (id, title, content, category, priority, keywords, references, 
             created_at, updated_at, usage_count, effectiveness_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            guideline.id,
            guideline.title,
            guideline.content,
            guideline.category.value,
            guideline.priority.value,
            json.dumps(guideline.keywords),
            json.dumps(guideline.references),
            guideline.created_at.isoformat(),
            guideline.updated_at.isoformat(),
            guideline.usage_count,
            guideline.effectiveness_score
        ))
        
        conn.commit()
        conn.close()
    
    def get_guidelines(self, category: Optional[str] = None, priority: Optional[str] = None) -> List[Dict[str, Any]]:
        """지침 조회"""
        guidelines = []
        
        for guideline in self.guidelines.values():
            if category and guideline.category.value != category:
                continue
            if priority and guideline.priority.value != priority:
                continue
            
            guidelines.append({
                "id": guideline.id,
                "title": guideline.title,
                "content": guideline.content,
                "category": guideline.category.value,
                "priority": guideline.priority.value,
                "keywords": guideline.keywords,
                "references": guideline.references,
                "usage_count": guideline.usage_count,
                "effectiveness_score": guideline.effectiveness_score,
                "created_at": guideline.created_at.isoformat(),
                "updated_at": guideline.updated_at.isoformat()
            })
        
        return guidelines
    
    def get_relevant_guidelines(self, context: str, limit: int = 5) -> List[Dict[str, Any]]:
        """컨텍스트에 관련된 지침 조회"""
        relevant_guidelines = []
        
        for guideline in self.guidelines.values():
            # 키워드 매칭 점수 계산
            score = self.calculate_relevance_score(context, guideline)
            
            if score > 0.3:  # 임계값
                relevant_guidelines.append({
                    **self.guideline_to_dict(guideline),
                    "relevance_score": score
                })
        
        # 관련성 점수로 정렬
        relevant_guidelines.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        return relevant_guidelines[:limit]
    
    def calculate_relevance_score(self, context: str, guideline: Guideline) -> float:
        """관련성 점수 계산"""
        context_lower = context.lower()
        score = 0.0
        
        # 키워드 매칭
        for keyword in guideline.keywords:
            if keyword.lower() in context_lower:
                score += 0.3
        
        # 제목 매칭
        if guideline.title.lower() in context_lower:
            score += 0.5
        
        # 내용 매칭
        content_words = guideline.content.lower().split()
        context_words = context_lower.split()
        common_words = set(content_words) & set(context_words)
        
        if len(context_words) > 0:
            score += len(common_words) / len(context_words) * 0.2
        
        return min(score, 1.0)
    
    def guideline_to_dict(self, guideline: Guideline) -> Dict[str, Any]:
        """지침을 딕셔너리로 변환"""
        return {
            "id": guideline.id,
            "title": guideline.title,
            "content": guideline.content,
            "category": guideline.category.value,
            "priority": guideline.priority.value,
            "keywords": guideline.keywords,
            "references": guideline.references,
            "usage_count": guideline.usage_count,
            "effectiveness_score": guideline.effectiveness_score,
            "created_at": guideline.created_at.isoformat(),
            "updated_at": guideline.updated_at.isoformat()
        }
    
    def update_guideline_usage(self, guideline_id: str, context: str = "", feedback: str = ""):
        """지침 사용 기록 업데이트"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 사용 기록 추가
            cursor.execute('''
                INSERT INTO guideline_usage (guideline_id, context, user_feedback)
                VALUES (?, ?, ?)
            ''', (guideline_id, context, feedback))
            
            # 사용 횟수 업데이트
            cursor.execute('''
                UPDATE guidelines 
                SET usage_count = usage_count + 1, updated_at = ?
                WHERE id = ?
            ''', (datetime.now().isoformat(), guideline_id))
            
            conn.commit()
            conn.close()
            
            # 메모리 업데이트
            if guideline_id in self.guidelines:
                self.guidelines[guideline_id].usage_count += 1
                self.guidelines[guideline_id].updated_at = datetime.now()
            
        except Exception as e:
            logger.error(f"지침 사용 기록 업데이트 실패: {e}")
    
    def evaluate_guideline_effectiveness(self, guideline_id: str, metrics: Dict[str, float]):
        """지침 효과성 평가"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 효과성 메트릭 저장
            for metric_name, metric_value in metrics.items():
                cursor.execute('''
                    INSERT INTO guideline_effectiveness (guideline_id, metric_name, metric_value)
                    VALUES (?, ?, ?)
                ''', (guideline_id, metric_name, metric_value))
            
            # 평균 효과성 점수 계산
            cursor.execute('''
                SELECT AVG(metric_value) 
                FROM guideline_effectiveness 
                WHERE guideline_id = ?
            ''', (guideline_id,))
            
            avg_score = cursor.fetchone()[0] or 0.0
            
            # 지침 효과성 점수 업데이트
            cursor.execute('''
                UPDATE guidelines 
                SET effectiveness_score = ?, updated_at = ?
                WHERE id = ?
            ''', (avg_score, datetime.now().isoformat(), guideline_id))
            
            conn.commit()
            conn.close()
            
            # 메모리 업데이트
            if guideline_id in self.guidelines:
                self.guidelines[guideline_id].effectiveness_score = avg_score
                self.guidelines[guideline_id].updated_at = datetime.now()
            
        except Exception as e:
            logger.error(f"지침 효과성 평가 실패: {e}")
    
    def get_guideline_statistics(self) -> Dict[str, Any]:
        """지침 통계 조회"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 전체 지침 수
            cursor.execute('SELECT COUNT(*) FROM guidelines')
            total_guidelines = cursor.fetchone()[0]
            
            # 카테고리별 지침 수
            cursor.execute('''
                SELECT category, COUNT(*) 
                FROM guidelines 
                GROUP BY category
            ''')
            category_counts = dict(cursor.fetchall())
            
            # 우선순위별 지침 수
            cursor.execute('''
                SELECT priority, COUNT(*) 
                FROM guidelines 
                GROUP BY priority
            ''')
            priority_counts = dict(cursor.fetchall())
            
            # 평균 사용 횟수
            cursor.execute('SELECT AVG(usage_count) FROM guidelines')
            avg_usage = cursor.fetchone()[0] or 0.0
            
            # 평균 효과성 점수
            cursor.execute('SELECT AVG(effectiveness_score) FROM guidelines')
            avg_effectiveness = cursor.fetchone()[0] or 0.0
            
            conn.close()
            
            return {
                "total_guidelines": total_guidelines,
                "category_counts": category_counts,
                "priority_counts": priority_counts,
                "average_usage": round(avg_usage, 2),
                "average_effectiveness": round(avg_effectiveness, 3)
            }
            
        except Exception as e:
            logger.error(f"지침 통계 조회 실패: {e}")
            return {"error": str(e)}

# 전역 인스턴스
guideline_manager = GuidelineManager() 