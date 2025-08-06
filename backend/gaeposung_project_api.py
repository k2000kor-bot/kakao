import sqlite3
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import uuid

class GaepoSungProjectAPI:
    def __init__(self, db_path: str = "backend/advanced_message_system.db"):
        self.db_path = db_path
        self.init_database()

    def init_database(self):
        """프로젝트 관리 테이블 초기화"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 프로젝트 작업 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS project_tasks (
                id TEXT PRIMARY KEY,
                room_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'pending',
                priority TEXT DEFAULT 'medium',
                assignee TEXT,
                due_date TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 프로젝트 마일스톤 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS project_milestones (
                id TEXT PRIMARY KEY,
                room_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                target_date TEXT,
                status TEXT DEFAULT 'upcoming',
                progress INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # AI 추천 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS ai_recommendations (
                id TEXT PRIMARY KEY,
                room_id TEXT NOT NULL,
                type TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                confidence REAL DEFAULT 0.0,
                priority TEXT DEFAULT 'medium',
                category TEXT,
                suggested_actions TEXT,
                impact TEXT,
                status TEXT DEFAULT 'pending',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 팀 구성원 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS team_members (
                id TEXT PRIMARY KEY,
                room_id TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT,
                tasks_count INTEGER DEFAULT 0,
                completed_tasks INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()

    def create_task(self, room_id: str, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """새 작업 생성"""
        task_id = str(uuid.uuid4())
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO project_tasks (id, room_id, title, description, status, priority, assignee, due_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            task_id,
            room_id,
            task_data.get('title'),
            task_data.get('description'),
            task_data.get('status', 'pending'),
            task_data.get('priority', 'medium'),
            task_data.get('assignee'),
            task_data.get('due_date')
        ))
        
        conn.commit()
        conn.close()
        
        return self.get_task(task_id)

    def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        """작업 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM project_tasks WHERE id = ?', (task_id,))
        row = cursor.fetchone()
        
        conn.close()
        
        if row:
            columns = [description[0] for description in cursor.description]
            return dict(zip(columns, row))
        return None

    def get_tasks_by_room(self, room_id: str) -> List[Dict[str, Any]]:
        """채팅방별 작업 목록 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM project_tasks WHERE room_id = ? ORDER BY created_at DESC', (room_id,))
        rows = cursor.fetchall()
        
        conn.close()
        
        if rows:
            columns = [description[0] for description in cursor.description]
            return [dict(zip(columns, row)) for row in rows]
        return []

    def update_task(self, task_id: str, task_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """작업 업데이트"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        update_fields = []
        values = []
        
        for field in ['title', 'description', 'status', 'priority', 'assignee', 'due_date']:
            if field in task_data:
                update_fields.append(f"{field} = ?")
                values.append(task_data[field])
        
        if update_fields:
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            values.append(task_id)
            
            cursor.execute(f'''
                UPDATE project_tasks 
                SET {', '.join(update_fields)}
                WHERE id = ?
            ''', values)
            
            conn.commit()
        
        conn.close()
        
        return self.get_task(task_id)

    def delete_task(self, task_id: str) -> bool:
        """작업 삭제"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM project_tasks WHERE id = ?', (task_id,))
        deleted = cursor.rowcount > 0
        
        conn.commit()
        conn.close()
        
        return deleted

    def create_milestone(self, room_id: str, milestone_data: Dict[str, Any]) -> Dict[str, Any]:
        """새 마일스톤 생성"""
        milestone_id = str(uuid.uuid4())
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO project_milestones (id, room_id, title, description, target_date, status, progress)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            milestone_id,
            room_id,
            milestone_data.get('title'),
            milestone_data.get('description'),
            milestone_data.get('target_date'),
            milestone_data.get('status', 'upcoming'),
            milestone_data.get('progress', 0)
        ))
        
        conn.commit()
        conn.close()
        
        return self.get_milestone(milestone_id)

    def get_milestone(self, milestone_id: str) -> Optional[Dict[str, Any]]:
        """마일스톤 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM project_milestones WHERE id = ?', (milestone_id,))
        row = cursor.fetchone()
        
        conn.close()
        
        if row:
            columns = [description[0] for description in cursor.description]
            return dict(zip(columns, row))
        return None

    def get_milestones_by_room(self, room_id: str) -> List[Dict[str, Any]]:
        """채팅방별 마일스톤 목록 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM project_milestones WHERE room_id = ? ORDER BY target_date ASC', (room_id,))
        rows = cursor.fetchall()
        
        conn.close()
        
        if rows:
            columns = [description[0] for description in cursor.description]
            return [dict(zip(columns, row)) for row in rows]
        return []

    def update_milestone(self, milestone_id: str, milestone_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """마일스톤 업데이트"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        update_fields = []
        values = []
        
        for field in ['title', 'description', 'target_date', 'status', 'progress']:
            if field in milestone_data:
                update_fields.append(f"{field} = ?")
                values.append(milestone_data[field])
        
        if update_fields:
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            values.append(milestone_id)
            
            cursor.execute(f'''
                UPDATE project_milestones 
                SET {', '.join(update_fields)}
                WHERE id = ?
            ''', values)
            
            conn.commit()
        
        conn.close()
        
        return self.get_milestone(milestone_id)

    def create_recommendation(self, room_id: str, recommendation_data: Dict[str, Any]) -> Dict[str, Any]:
        """새 AI 추천 생성"""
        recommendation_id = str(uuid.uuid4())
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        suggested_actions = json.dumps(recommendation_data.get('suggested_actions', []), ensure_ascii=False)
        
        cursor.execute('''
            INSERT INTO ai_recommendations (id, room_id, type, title, description, confidence, priority, category, suggested_actions, impact)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            recommendation_id,
            room_id,
            recommendation_data.get('type'),
            recommendation_data.get('title'),
            recommendation_data.get('description'),
            recommendation_data.get('confidence', 0.0),
            recommendation_data.get('priority', 'medium'),
            recommendation_data.get('category'),
            suggested_actions,
            recommendation_data.get('impact')
        ))
        
        conn.commit()
        conn.close()
        
        return self.get_recommendation(recommendation_id)

    def get_recommendation(self, recommendation_id: str) -> Optional[Dict[str, Any]]:
        """AI 추천 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM ai_recommendations WHERE id = ?', (recommendation_id,))
        row = cursor.fetchone()
        
        conn.close()
        
        if row:
            columns = [description[0] for description in cursor.description]
            result = dict(zip(columns, row))
            if result.get('suggested_actions'):
                result['suggested_actions'] = json.loads(result['suggested_actions'])
            return result
        return None

    def get_recommendations_by_room(self, room_id: str) -> List[Dict[str, Any]]:
        """채팅방별 AI 추천 목록 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM ai_recommendations WHERE room_id = ? ORDER BY created_at DESC', (room_id,))
        rows = cursor.fetchall()
        
        conn.close()
        
        if rows:
            columns = [description[0] for description in cursor.description]
            results = []
            for row in rows:
                result = dict(zip(columns, row))
                if result.get('suggested_actions'):
                    result['suggested_actions'] = json.loads(result['suggested_actions'])
                results.append(result)
            return results
        return []

    def update_recommendation_status(self, recommendation_id: str, status: str) -> Optional[Dict[str, Any]]:
        """AI 추천 상태 업데이트"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE ai_recommendations 
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (status, recommendation_id))
        
        conn.commit()
        conn.close()
        
        return self.get_recommendation(recommendation_id)

    def get_project_overview(self, room_id: str) -> Dict[str, Any]:
        """프로젝트 개요 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 작업 통계
        cursor.execute('''
            SELECT 
                COUNT(*) as total_tasks,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks
            FROM project_tasks 
            WHERE room_id = ?
        ''', (room_id,))
        task_stats = cursor.fetchone()
        
        # 마일스톤 통계
        cursor.execute('''
            SELECT 
                COUNT(*) as total_milestones,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_milestones,
                AVG(progress) as avg_progress
            FROM project_milestones 
            WHERE room_id = ?
        ''', (room_id,))
        milestone_stats = cursor.fetchone()
        
        # AI 추천 통계
        cursor.execute('''
            SELECT 
                COUNT(*) as total_recommendations,
                SUM(CASE WHEN status = 'implemented' THEN 1 ELSE 0 END) as implemented_recommendations,
                AVG(confidence) as avg_confidence
            FROM ai_recommendations 
            WHERE room_id = ?
        ''', (room_id,))
        recommendation_stats = cursor.fetchone()
        
        conn.close()
        
        return {
            'tasks': {
                'total': task_stats[0] if task_stats else 0,
                'completed': task_stats[1] if task_stats else 0,
                'in_progress': task_stats[2] if task_stats else 0,
                'pending': task_stats[3] if task_stats else 0
            },
            'milestones': {
                'total': milestone_stats[0] if milestone_stats else 0,
                'completed': milestone_stats[1] if milestone_stats else 0,
                'avg_progress': milestone_stats[2] if milestone_stats else 0
            },
            'recommendations': {
                'total': recommendation_stats[0] if recommendation_stats else 0,
                'implemented': recommendation_stats[1] if recommendation_stats else 0,
                'avg_confidence': recommendation_stats[2] if recommendation_stats else 0
            }
        }

    def generate_ai_recommendations(self, room_id: str) -> List[Dict[str, Any]]:
        """AI 추천 생성 (샘플 데이터)"""
        recommendations = [
            {
                'type': 'strategy',
                'title': '시공사 평가 기준 최적화',
                'description': '현재 논의된 내용을 바탕으로 시공사 평가 기준을 더 객관적이고 체계적으로 개선할 수 있습니다.',
                'confidence': 0.92,
                'priority': 'high',
                'category': '시공사 선정',
                'suggested_actions': [
                    '평가 항목별 가중치 조정',
                    '정량적 평가 기준 추가',
                    '평가자 교육 프로그램 개발'
                ],
                'impact': '시공사 선정의 객관성과 신뢰성 향상'
            },
            {
                'type': 'action',
                'title': '공사비 협상 전략 수립',
                'description': '현재 공사비 관련 논의를 분석한 결과, 체계적인 협상 전략이 필요합니다.',
                'confidence': 0.88,
                'priority': 'critical',
                'category': '비용 관리',
                'suggested_actions': [
                    '시공사별 공사비 상세 분석',
                    '협상 우선순위 설정',
                    '대안 시공사 검토'
                ],
                'impact': '프로젝트 비용 최적화 및 예산 효율성 증대'
            }
        ]
        
        # 기존 추천 삭제 후 새로 생성
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('DELETE FROM ai_recommendations WHERE room_id = ?', (room_id,))
        conn.commit()
        conn.close()
        
        # 새 추천 생성
        created_recommendations = []
        for rec in recommendations:
            created = self.create_recommendation(room_id, rec)
            if created:
                created_recommendations.append(created)
        
        return created_recommendations

# 전역 인스턴스 생성
gaeposung_project_api = GaepoSungProjectAPI() 