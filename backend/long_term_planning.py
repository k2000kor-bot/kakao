#!/usr/bin/env python3
"""
장기 계획 기능 시스템
로드맵 관리, 목표 추적, 성과 분석, 미래 예측
"""

import os
import json
import sqlite3
import logging
import asyncio
import time
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from collections import defaultdict, deque
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class LongTermGoal:
    """장기 목표 데이터 클래스"""
    goal_id: str
    user_id: str
    title: str
    description: str
    category: str
    priority: int  # 1-5
    target_date: str
    current_progress: float  # 0-100
    milestones: List[Dict[str, Any]]
    dependencies: List[str]
    resources_needed: Dict[str, Any]
    success_criteria: List[str]
    created_at: str
    updated_at: str

@dataclass
class Roadmap:
    """로드맵 데이터 클래스"""
    roadmap_id: str
    user_id: str
    title: str
    description: str
    goals: List[LongTermGoal]
    timeline_months: int
    phases: List[Dict[str, Any]]
    risk_factors: List[str]
    success_metrics: Dict[str, Any]
    created_at: str

@dataclass
class PerformanceAnalysis:
    """성과 분석 결과"""
    analysis_id: str
    user_id: str
    period: str
    goals_achieved: int
    goals_total: int
    completion_rate: float
    average_progress: float
    trend_analysis: Dict[str, Any]
    recommendations: List[str]
    timestamp: str

class LongTermPlanningSystem:
    """장기 계획 시스템"""
    
    def __init__(self, db_path: str = "long_term_planning.db"):
        self.db_path = db_path
        self.init_database()
        
    def init_database(self):
        """데이터베이스 초기화"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 장기 목표 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS long_term_goals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                goal_id TEXT UNIQUE,
                user_id TEXT,
                title TEXT,
                description TEXT,
                category TEXT,
                priority INTEGER,
                target_date TEXT,
                current_progress REAL,
                milestones TEXT,
                dependencies TEXT,
                resources_needed TEXT,
                success_criteria TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 로드맵 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS roadmaps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                roadmap_id TEXT UNIQUE,
                user_id TEXT,
                title TEXT,
                description TEXT,
                goals TEXT,
                timeline_months INTEGER,
                phases TEXT,
                risk_factors TEXT,
                success_metrics TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 성과 분석 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS performance_analysis (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                analysis_id TEXT UNIQUE,
                user_id TEXT,
                period TEXT,
                goals_achieved INTEGER,
                goals_total INTEGER,
                completion_rate REAL,
                average_progress REAL,
                trend_analysis TEXT,
                recommendations TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def create_long_term_goal(self, user_id: str, goal_data: Dict[str, Any]) -> LongTermGoal:
        """장기 목표 생성"""
        goal_id = f"GOAL_{user_id}_{int(time.time())}"
        
        goal = LongTermGoal(
            goal_id=goal_id,
            user_id=user_id,
            title=goal_data.get('title', ''),
            description=goal_data.get('description', ''),
            category=goal_data.get('category', 'general'),
            priority=goal_data.get('priority', 3),
            target_date=goal_data.get('target_date', ''),
            current_progress=0.0,
            milestones=goal_data.get('milestones', []),
            dependencies=goal_data.get('dependencies', []),
            resources_needed=goal_data.get('resources_needed', {}),
            success_criteria=goal_data.get('success_criteria', []),
            created_at=datetime.now().isoformat(),
            updated_at=datetime.now().isoformat()
        )
        
        self._save_long_term_goal(goal)
        return goal
    
    def _save_long_term_goal(self, goal: LongTermGoal):
        """장기 목표 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO long_term_goals 
            (goal_id, user_id, title, description, category, priority,
             target_date, current_progress, milestones, dependencies,
             resources_needed, success_criteria, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ''', (
            goal.goal_id,
            goal.user_id,
            goal.title,
            goal.description,
            goal.category,
            goal.priority,
            goal.target_date,
            goal.current_progress,
            json.dumps(goal.milestones),
            json.dumps(goal.dependencies),
            json.dumps(goal.resources_needed),
            json.dumps(goal.success_criteria)
        ))
        
        conn.commit()
        conn.close()
    
    def update_goal_progress(self, goal_id: str, progress: float) -> bool:
        """목표 진행률 업데이트"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE long_term_goals 
            SET current_progress = ?, updated_at = CURRENT_TIMESTAMP
            WHERE goal_id = ?
        ''', (progress, goal_id))
        
        success = cursor.rowcount > 0
        conn.commit()
        conn.close()
        
        return success
    
    def create_roadmap(self, user_id: str, roadmap_data: Dict[str, Any]) -> Roadmap:
        """로드맵 생성"""
        roadmap_id = f"ROADMAP_{user_id}_{int(time.time())}"
        
        # 목표들 조회
        goals = self._get_user_goals(user_id)
        
        roadmap = Roadmap(
            roadmap_id=roadmap_id,
            user_id=user_id,
            title=roadmap_data.get('title', ''),
            description=roadmap_data.get('description', ''),
            goals=goals,
            timeline_months=roadmap_data.get('timeline_months', 12),
            phases=roadmap_data.get('phases', []),
            risk_factors=roadmap_data.get('risk_factors', []),
            success_metrics=roadmap_data.get('success_metrics', {}),
            created_at=datetime.now().isoformat()
        )
        
        self._save_roadmap(roadmap)
        return roadmap
    
    def _get_user_goals(self, user_id: str) -> List[LongTermGoal]:
        """사용자 목표 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM long_term_goals WHERE user_id = ?", (user_id,))
        goals_data = cursor.fetchall()
        conn.close()
        
        goals = []
        for goal_data in goals_data:
            goal = LongTermGoal(
                goal_id=goal_data[1],
                user_id=goal_data[2],
                title=goal_data[3],
                description=goal_data[4],
                category=goal_data[5],
                priority=goal_data[6],
                target_date=goal_data[7],
                current_progress=goal_data[8],
                milestones=json.loads(goal_data[9]) if goal_data[9] else [],
                dependencies=json.loads(goal_data[10]) if goal_data[10] else [],
                resources_needed=json.loads(goal_data[11]) if goal_data[11] else {},
                success_criteria=json.loads(goal_data[12]) if goal_data[12] else [],
                created_at=goal_data[13],
                updated_at=goal_data[14]
            )
            goals.append(goal)
        
        return goals
    
    def _save_roadmap(self, roadmap: Roadmap):
        """로드맵 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO roadmaps 
            (roadmap_id, user_id, title, description, goals,
             timeline_months, phases, risk_factors, success_metrics)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            roadmap.roadmap_id,
            roadmap.user_id,
            roadmap.title,
            roadmap.description,
            json.dumps([goal.goal_id for goal in roadmap.goals]),
            roadmap.timeline_months,
            json.dumps(roadmap.phases),
            json.dumps(roadmap.risk_factors),
            json.dumps(roadmap.success_metrics)
        ))
        
        conn.commit()
        conn.close()
    
    def analyze_performance(self, user_id: str, period_months: int = 6) -> PerformanceAnalysis:
        """성과 분석"""
        goals = self._get_user_goals(user_id)
        
        # 기간 필터링
        cutoff_date = datetime.now() - timedelta(days=period_months * 30)
        recent_goals = [
            goal for goal in goals 
            if datetime.fromisoformat(goal.created_at) >= cutoff_date
        ]
        
        # 성과 계산
        goals_achieved = len([goal for goal in recent_goals if goal.current_progress >= 100])
        goals_total = len(recent_goals)
        completion_rate = (goals_achieved / goals_total * 100) if goals_total > 0 else 0
        average_progress = np.mean([goal.current_progress for goal in recent_goals]) if recent_goals else 0
        
        # 트렌드 분석
        trend_analysis = self._analyze_trends(recent_goals)
        
        # 권장사항 생성
        recommendations = self._generate_recommendations(recent_goals, completion_rate, average_progress)
        
        analysis = PerformanceAnalysis(
            analysis_id=f"ANALYSIS_{user_id}_{int(time.time())}",
            user_id=user_id,
            period=f"{period_months}개월",
            goals_achieved=goals_achieved,
            goals_total=goals_total,
            completion_rate=completion_rate,
            average_progress=average_progress,
            trend_analysis=trend_analysis,
            recommendations=recommendations,
            timestamp=datetime.now().isoformat()
        )
        
        self._save_performance_analysis(analysis)
        return analysis
    
    def _analyze_trends(self, goals: List[LongTermGoal]) -> Dict[str, Any]:
        """트렌드 분석"""
        if not goals:
            return {}
        
        # 카테고리별 성과
        category_performance = defaultdict(list)
        for goal in goals:
            category_performance[goal.category].append(goal.current_progress)
        
        category_averages = {
            category: np.mean(progresses) 
            for category, progresses in category_performance.items()
        }
        
        # 우선순위별 성과
        priority_performance = defaultdict(list)
        for goal in goals:
            priority_performance[goal.priority].append(goal.current_progress)
        
        priority_averages = {
            priority: np.mean(progresses) 
            for priority, progresses in priority_performance.items()
        }
        
        return {
            'category_performance': category_averages,
            'priority_performance': priority_averages,
            'total_goals': len(goals),
            'average_progress': np.mean([goal.current_progress for goal in goals])
        }
    
    def _generate_recommendations(self, goals: List[LongTermGoal], completion_rate: float, average_progress: float) -> List[str]:
        """권장사항 생성"""
        recommendations = []
        
        if completion_rate < 50:
            recommendations.append("목표 달성률이 낮습니다. 목표를 더 현실적으로 설정하거나 단계별로 나누어보세요.")
        
        if average_progress < 30:
            recommendations.append("전반적인 진행률이 낮습니다. 일일/주간 체크인을 통해 꾸준한 진행을 유지하세요.")
        
        # 카테고리별 권장사항
        category_progress = defaultdict(list)
        for goal in goals:
            category_progress[goal.category].append(goal.current_progress)
        
        for category, progresses in category_progress.items():
            avg_progress = np.mean(progresses)
            if avg_progress < 40:
                recommendations.append(f"{category} 카테고리의 목표들이 부진합니다. 해당 영역에 더 집중해보세요.")
        
        # 우선순위별 권장사항
        high_priority_goals = [goal for goal in goals if goal.priority >= 4]
        if high_priority_goals:
            high_priority_avg = np.mean([goal.current_progress for goal in high_priority_goals])
            if high_priority_avg < 50:
                recommendations.append("높은 우선순위 목표들의 진행이 부진합니다. 우선순위 목표에 더 집중하세요.")
        
        return recommendations
    
    def _save_performance_analysis(self, analysis: PerformanceAnalysis):
        """성과 분석 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO performance_analysis 
            (analysis_id, user_id, period, goals_achieved, goals_total,
             completion_rate, average_progress, trend_analysis, recommendations)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            analysis.analysis_id,
            analysis.user_id,
            analysis.period,
            analysis.goals_achieved,
            analysis.goals_total,
            analysis.completion_rate,
            analysis.average_progress,
            json.dumps(analysis.trend_analysis),
            json.dumps(analysis.recommendations)
        ))
        
        conn.commit()
        conn.close()
    
    def predict_future_performance(self, user_id: str, months_ahead: int = 6) -> Dict[str, Any]:
        """미래 성과 예측"""
        goals = self._get_user_goals(user_id)
        
        if not goals:
            return {'error': '예측할 목표가 없습니다.'}
        
        # 과거 성과 데이터 수집
        performance_data = []
        for goal in goals:
            created_date = datetime.fromisoformat(goal.created_at)
            months_since_creation = (datetime.now() - created_date).days / 30
            if months_since_creation > 0:
                performance_data.append({
                    'months': months_since_creation,
                    'progress': goal.current_progress
                })
        
        if len(performance_data) < 3:
            return {'error': '예측을 위한 충분한 데이터가 없습니다.'}
        
        # 선형 회귀 모델로 예측
        df = pd.DataFrame(performance_data)
        X = df[['months']]
        y = df['progress']
        
        model = LinearRegression()
        model.fit(X, y)
        
        # 미래 예측
        future_months = np.arange(1, months_ahead + 1).reshape(-1, 1)
        predictions = model.predict(future_months)
        
        # 예측 결과 포맷팅
        prediction_results = []
        for i, month in enumerate(range(1, months_ahead + 1)):
            prediction_results.append({
                'month': month,
                'predicted_progress': max(0, min(100, predictions[i])),
                'confidence': max(0, 1 - (i * 0.1))  # 시간이 지날수록 신뢰도 감소
            })
        
        return {
            'user_id': user_id,
            'predictions': prediction_results,
            'model_accuracy': model.score(X, y),
            'current_average_progress': np.mean([goal.current_progress for goal in goals]),
            'prediction_period': f"{months_ahead}개월"
        }

# API 서버 통합
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="장기 계획 기능 API")

class LongTermGoalRequest(BaseModel):
    user_id: str
    goal_data: Dict[str, Any]

class RoadmapRequest(BaseModel):
    user_id: str
    roadmap_data: Dict[str, Any]

class PerformanceAnalysisRequest(BaseModel):
    user_id: str
    period_months: int = 6

class FuturePredictionRequest(BaseModel):
    user_id: str
    months_ahead: int = 6

planning_system = LongTermPlanningSystem()

@app.post("/create-long-term-goal")
async def create_long_term_goal(request: LongTermGoalRequest):
    """장기 목표 생성"""
    try:
        goal = planning_system.create_long_term_goal(request.user_id, request.goal_data)
        return goal.__dict__
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/update-goal-progress")
async def update_goal_progress(goal_id: str, progress: float):
    """목표 진행률 업데이트"""
    try:
        success = planning_system.update_goal_progress(goal_id, progress)
        return {"success": success, "message": "진행률이 업데이트되었습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/create-roadmap")
async def create_roadmap(request: RoadmapRequest):
    """로드맵 생성"""
    try:
        roadmap = planning_system.create_roadmap(request.user_id, request.roadmap_data)
        return roadmap.__dict__
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-performance")
async def analyze_performance(request: PerformanceAnalysisRequest):
    """성과 분석"""
    try:
        analysis = planning_system.analyze_performance(request.user_id, request.period_months)
        return analysis.__dict__
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-future-performance")
async def predict_future_performance(request: FuturePredictionRequest):
    """미래 성과 예측"""
    try:
        prediction = planning_system.predict_future_performance(request.user_id, request.months_ahead)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user-goals/{user_id}")
async def get_user_goals(user_id: str):
    """사용자 목표 조회"""
    try:
        goals = planning_system._get_user_goals(user_id)
        return {"goals": [goal.__dict__ for goal in goals]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    _p = int(os.environ.get("LONG_TERM_PLANNING_PORT", os.environ.get("PORT", "8012")))
    uvicorn.run(app, host="0.0.0.0", port=_p)
