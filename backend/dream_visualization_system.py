#!/usr/bin/env python3
"""
꿈 시각화 시스템
새아파트 비전 시스템, 희망 시각화, 꿈 실현 로드맵
"""

import os
import json
import sqlite3
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from collections import defaultdict
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from PIL import Image, ImageDraw, ImageFont
import base64
from io import BytesIO
import requests

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class DreamGoal:
    """꿈 목표 데이터 클래스"""
    goal_id: str
    user_id: str
    goal_type: str  # 아파트구매, 투자, 자산증식 등
    target_property: str
    target_price: float
    current_savings: float
    monthly_income: float
    monthly_expenses: float
    target_date: str
    priority_level: int  # 1-5
    description: str
    created_at: str

@dataclass
class DreamVisualization:
    """꿈 시각화 결과"""
    goal_id: str
    visualization_type: str
    image_data: str  # base64 encoded image
    progress_percentage: float
    months_remaining: int
    monthly_savings_needed: float
    achievement_probability: float
    milestones: List[Dict[str, Any]]
    recommendations: List[str]

@dataclass
class DreamRoadmap:
    """꿈 실현 로드맵"""
    roadmap_id: str
    user_id: str
    goals: List[DreamGoal]
    timeline_months: int
    total_investment_needed: float
    monthly_savings_plan: Dict[str, float]
    milestone_dates: List[str]
    risk_factors: List[str]
    success_strategies: List[str]

class DreamVisualizationSystem:
    """꿈 시각화 시스템"""
    
    def __init__(self, db_path: str = "dream_visualization.db"):
        self.db_path = db_path
        self.init_database()
        
    def init_database(self):
        """데이터베이스 초기화"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 꿈 목표 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS dream_goals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                goal_id TEXT UNIQUE,
                user_id TEXT,
                goal_type TEXT,
                target_property TEXT,
                target_price REAL,
                current_savings REAL,
                monthly_income REAL,
                monthly_expenses REAL,
                target_date TEXT,
                priority_level INTEGER,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 꿈 시각화 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS dream_visualizations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                goal_id TEXT,
                visualization_type TEXT,
                image_data TEXT,
                progress_percentage REAL,
                months_remaining INTEGER,
                monthly_savings_needed REAL,
                achievement_probability REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (goal_id) REFERENCES dream_goals (goal_id)
            )
        ''')
        
        # 꿈 로드맵 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS dream_roadmaps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                roadmap_id TEXT UNIQUE,
                user_id TEXT,
                timeline_months INTEGER,
                total_investment_needed REAL,
                monthly_savings_plan TEXT,
                milestone_dates TEXT,
                risk_factors TEXT,
                success_strategies TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        
    def create_dream_goal(self, user_id: str, goal_data: Dict[str, Any]) -> DreamGoal:
        """꿈 목표 생성"""
        goal_id = f"GOAL_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        goal = DreamGoal(
            goal_id=goal_id,
            user_id=user_id,
            goal_type=goal_data.get("goal_type", "아파트구매"),
            target_property=goal_data.get("target_property", ""),
            target_price=goal_data.get("target_price", 0),
            current_savings=goal_data.get("current_savings", 0),
            monthly_income=goal_data.get("monthly_income", 0),
            monthly_expenses=goal_data.get("monthly_expenses", 0),
            target_date=goal_data.get("target_date", ""),
            priority_level=goal_data.get("priority_level", 3),
            description=goal_data.get("description", ""),
            created_at=datetime.now().isoformat()
        )
        
        # 데이터베이스에 저장
        self._save_dream_goal(goal)
        
        return goal
    
    def _save_dream_goal(self, goal: DreamGoal):
        """꿈 목표 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO dream_goals 
            (goal_id, user_id, goal_type, target_property, target_price,
             current_savings, monthly_income, monthly_expenses, target_date,
             priority_level, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            goal.goal_id,
            goal.user_id,
            goal.goal_type,
            goal.target_property,
            goal.target_price,
            goal.current_savings,
            goal.monthly_income,
            goal.monthly_expenses,
            goal.target_date,
            goal.priority_level,
            goal.description
        ))
        
        conn.commit()
        conn.close()
    
    def visualize_dream(self, goal_id: str, visualization_type: str = "progress_chart") -> DreamVisualization:
        """꿈 시각화 생성"""
        # 목표 정보 조회
        goal = self._get_dream_goal(goal_id)
        if not goal:
            raise ValueError(f"목표 ID {goal_id}를 찾을 수 없습니다.")
        
        # 시각화 생성
        if visualization_type == "progress_chart":
            image_data = self._create_progress_chart(goal)
        elif visualization_type == "timeline":
            image_data = self._create_timeline_chart(goal)
        elif visualization_type == "savings_plan":
            image_data = self._create_savings_plan_chart(goal)
        elif visualization_type == "dream_house":
            image_data = self._create_dream_house_visualization(goal)
        else:
            image_data = self._create_progress_chart(goal)
        
        # 진행률 계산
        progress_percentage = self._calculate_progress_percentage(goal)
        
        # 남은 기간 계산
        months_remaining = self._calculate_months_remaining(goal)
        
        # 월 저축 필요액 계산
        monthly_savings_needed = self._calculate_monthly_savings_needed(goal)
        
        # 달성 확률 계산
        achievement_probability = self._calculate_achievement_probability(goal)
        
        # 마일스톤 생성
        milestones = self._generate_milestones(goal)
        
        # 권장사항 생성
        recommendations = self._generate_recommendations(goal)
        
        visualization = DreamVisualization(
            goal_id=goal_id,
            visualization_type=visualization_type,
            image_data=image_data,
            progress_percentage=progress_percentage,
            months_remaining=months_remaining,
            monthly_savings_needed=monthly_savings_needed,
            achievement_probability=achievement_probability,
            milestones=milestones,
            recommendations=recommendations
        )
        
        # 데이터베이스에 저장
        self._save_dream_visualization(visualization)
        
        return visualization
    
    def _get_dream_goal(self, goal_id: str) -> Optional[DreamGoal]:
        """꿈 목표 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM dream_goals WHERE goal_id = ?", (goal_id,))
        goal_data = cursor.fetchone()
        
        conn.close()
        
        if not goal_data:
            return None
        
        return DreamGoal(
            goal_id=goal_data[1],
            user_id=goal_data[2],
            goal_type=goal_data[3],
            target_property=goal_data[4],
            target_price=goal_data[5],
            current_savings=goal_data[6],
            monthly_income=goal_data[7],
            monthly_expenses=goal_data[8],
            target_date=goal_data[9],
            priority_level=goal_data[10],
            description=goal_data[11],
            created_at=goal_data[12]
        )
    
    def _create_progress_chart(self, goal: DreamGoal) -> str:
        """진행률 차트 생성"""
        try:
            # 차트 데이터 준비
            current_amount = goal.current_savings
            target_amount = goal.target_price
            progress_percentage = (current_amount / target_amount) * 100
            
            # 차트 생성
            fig, ax = plt.subplots(figsize=(10, 6))
            
            # 진행률 바 차트
            categories = ['현재 저축액', '목표 금액']
            amounts = [current_amount, target_amount]
            colors = ['#4CAF50', '#E0E0E0']
            
            bars = ax.bar(categories, amounts, color=colors, alpha=0.8)
            
            # 값 표시
            for bar, amount in zip(bars, amounts):
                height = bar.get_height()
                ax.text(bar.get_x() + bar.get_width()/2., height + height*0.01,
                       f'{amount:,.0f}원', ha='center', va='bottom', fontsize=12, fontweight='bold')
            
            # 진행률 텍스트
            ax.text(0.5, max(amounts) * 0.7, f'진행률: {progress_percentage:.1f}%', 
                   ha='center', va='center', fontsize=16, fontweight='bold',
                   bbox=dict(boxstyle="round,pad=0.3", facecolor="yellow", alpha=0.7))
            
            ax.set_title(f'{goal.target_property} 구매 목표 진행률', fontsize=16, fontweight='bold')
            ax.set_ylabel('금액 (원)', fontsize=12)
            
            # Y축 포맷팅
            ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'{x:,.0f}'))
            
            plt.tight_layout()
            
            # 이미지를 base64로 변환
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.getvalue()).decode()
            plt.close()
            
            return image_base64
            
        except Exception as e:
            logger.error(f"진행률 차트 생성 오류: {e}")
            return self._create_default_image()
    
    def _create_timeline_chart(self, goal: DreamGoal) -> str:
        """타임라인 차트 생성"""
        try:
            # 타임라인 데이터 준비
            target_date = datetime.strptime(goal.target_date, "%Y-%m-%d")
            current_date = datetime.now()
            months_remaining = (target_date.year - current_date.year) * 12 + (target_date.month - current_date.month)
            
            # 월별 저축 계획
            monthly_savings = (goal.target_price - goal.current_savings) / max(months_remaining, 1)
            
            # 차트 생성
            fig, ax = plt.subplots(figsize=(12, 6))
            
            # 월별 누적 저축액 계산
            months = list(range(0, months_remaining + 1))
            cumulative_savings = [goal.current_savings + monthly_savings * month for month in months]
            
            # 타임라인 플롯
            ax.plot(months, cumulative_savings, marker='o', linewidth=3, markersize=8, color='#2196F3')
            
            # 목표선 추가
            ax.axhline(y=goal.target_price, color='red', linestyle='--', linewidth=2, alpha=0.7)
            ax.text(months_remaining * 0.7, goal.target_price * 1.02, 
                   f'목표: {goal.target_price:,.0f}원', fontsize=12, color='red', fontweight='bold')
            
            # 현재 시점 표시
            ax.axvline(x=0, color='green', linestyle=':', linewidth=2, alpha=0.7)
            ax.text(0.5, goal.current_savings * 1.1, 
                   f'현재: {goal.current_savings:,.0f}원', fontsize=12, color='green', fontweight='bold')
            
            ax.set_title(f'{goal.target_property} 구매 타임라인', fontsize=16, fontweight='bold')
            ax.set_xlabel('남은 기간 (개월)', fontsize=12)
            ax.set_ylabel('누적 저축액 (원)', fontsize=12)
            
            # Y축 포맷팅
            ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'{x:,.0f}'))
            
            # 격자 추가
            ax.grid(True, alpha=0.3)
            
            plt.tight_layout()
            
            # 이미지를 base64로 변환
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.getvalue()).decode()
            plt.close()
            
            return image_base64
            
        except Exception as e:
            logger.error(f"타임라인 차트 생성 오류: {e}")
            return self._create_default_image()
    
    def _create_savings_plan_chart(self, goal: DreamGoal) -> str:
        """저축 계획 차트 생성"""
        try:
            # 저축 계획 데이터 준비
            monthly_income = goal.monthly_income
            monthly_expenses = goal.monthly_expenses
            available_savings = monthly_income - monthly_expenses
            
            target_date = datetime.strptime(goal.target_date, "%Y-%m-%d")
            current_date = datetime.now()
            months_remaining = (target_date.year - current_date.year) * 12 + (target_date.month - current_date.month)
            
            required_monthly_savings = (goal.target_price - goal.current_savings) / max(months_remaining, 1)
            
            # 차트 생성
            fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
            
            # 월별 수입/지출 파이 차트
            income_expense_data = [monthly_expenses, available_savings]
            labels = ['지출', '저축 가능액']
            colors = ['#FF5722', '#4CAF50']
            
            ax1.pie(income_expense_data, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90)
            ax1.set_title('월별 수입/지출 분석', fontsize=14, fontweight='bold')
            
            # 저축 계획 바 차트
            categories = ['현재 저축액', '필요 저축액', '월 저축 가능액']
            amounts = [goal.current_savings, required_monthly_savings * months_remaining, available_savings * months_remaining]
            colors_bar = ['#2196F3', '#FF9800', '#4CAF50']
            
            bars = ax2.bar(categories, amounts, color=colors_bar, alpha=0.8)
            
            # 값 표시
            for bar, amount in zip(bars, amounts):
                height = bar.get_height()
                ax2.text(bar.get_x() + bar.get_width()/2., height + height*0.01,
                        f'{amount:,.0f}원', ha='center', va='bottom', fontsize=10, fontweight='bold')
            
            ax2.set_title('저축 계획 분석', fontsize=14, fontweight='bold')
            ax2.set_ylabel('금액 (원)', fontsize=12)
            
            # Y축 포맷팅
            ax2.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'{x:,.0f}'))
            
            plt.tight_layout()
            
            # 이미지를 base64로 변환
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.getvalue()).decode()
            plt.close()
            
            return image_base64
            
        except Exception as e:
            logger.error(f"저축 계획 차트 생성 오류: {e}")
            return self._create_default_image()
    
    def _create_dream_house_visualization(self, goal: DreamGoal) -> str:
        """꿈의 집 시각화 생성"""
        try:
            # 간단한 집 이미지 생성
            img = Image.new('RGB', (800, 600), color='white')
            draw = ImageDraw.Draw(img)
            
            # 집 기본 구조
            # 지붕
            draw.polygon([(200, 200), (400, 100), (600, 200)], fill='#8B4513')
            
            # 집 몸체
            draw.rectangle([(200, 200), (600, 500)], fill='#F5DEB3', outline='#8B4513', width=3)
            
            # 문
            draw.rectangle([(350, 350), (450, 500)], fill='#8B4513')
            
            # 창문들
            draw.rectangle([(250, 250), (320, 320)], fill='#87CEEB', outline='#8B4513', width=2)
            draw.rectangle([(480, 250), (550, 320)], fill='#87CEEB', outline='#8B4513', width=2)
            
            # 굴뚝
            draw.rectangle([(450, 100), (470, 150)], fill='#696969')
            
            # 제목 텍스트
            try:
                # 기본 폰트 사용
                title_text = f"{goal.target_property}"
                draw.text((400, 50), title_text, fill='#2E8B57', anchor="mm")
                
                # 목표 금액 텍스트
                price_text = f"목표: {goal.target_price:,.0f}원"
                draw.text((400, 550), price_text, fill='#2E8B57', anchor="mm")
            except:
                pass
            
            # 이미지를 base64로 변환
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            return image_base64
            
        except Exception as e:
            logger.error(f"꿈의 집 시각화 생성 오류: {e}")
            return self._create_default_image()
    
    def _create_default_image(self) -> str:
        """기본 이미지 생성"""
        try:
            img = Image.new('RGB', (400, 300), color='lightblue')
            draw = ImageDraw.Draw(img)
            draw.text((200, 150), "시각화 생성 중...", fill='black', anchor="mm")
            
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            return image_base64
        except:
            return ""
    
    def _calculate_progress_percentage(self, goal: DreamGoal) -> float:
        """진행률 계산"""
        if goal.target_price <= 0:
            return 0.0
        return (goal.current_savings / goal.target_price) * 100
    
    def _calculate_months_remaining(self, goal: DreamGoal) -> int:
        """남은 기간 계산 (개월)"""
        try:
            target_date = datetime.strptime(goal.target_date, "%Y-%m-%d")
            current_date = datetime.now()
            months_remaining = (target_date.year - current_date.year) * 12 + (target_date.month - current_date.month)
            return max(months_remaining, 0)
        except:
            return 0
    
    def _calculate_monthly_savings_needed(self, goal: DreamGoal) -> float:
        """월 저축 필요액 계산"""
        months_remaining = self._calculate_months_remaining(goal)
        if months_remaining <= 0:
            return 0.0
        
        remaining_amount = goal.target_price - goal.current_savings
        return remaining_amount / months_remaining
    
    def _calculate_achievement_probability(self, goal: DreamGoal) -> float:
        """달성 확률 계산"""
        monthly_savings_needed = self._calculate_monthly_savings_needed(goal)
        available_savings = goal.monthly_income - goal.monthly_expenses
        
        if available_savings <= 0:
            return 0.0
        
        # 저축 가능액 대비 필요액 비율
        savings_ratio = available_savings / monthly_savings_needed if monthly_savings_needed > 0 else 0
        
        # 달성 확률 계산 (0-100%)
        if savings_ratio >= 1.0:
            probability = 95.0  # 충분한 저축 가능
        elif savings_ratio >= 0.8:
            probability = 80.0  # 거의 충분
        elif savings_ratio >= 0.6:
            probability = 60.0  # 보통
        elif savings_ratio >= 0.4:
            probability = 40.0  # 부족
        else:
            probability = 20.0  # 매우 부족
        
        return min(probability, 100.0)
    
    def _generate_milestones(self, goal: DreamGoal) -> List[Dict[str, Any]]:
        """마일스톤 생성"""
        milestones = []
        
        # 25%, 50%, 75%, 100% 마일스톤
        percentages = [25, 50, 75, 100]
        
        for percentage in percentages:
            target_amount = goal.target_price * (percentage / 100)
            months_needed = self._calculate_months_for_amount(goal, target_amount)
            
            milestone_date = (datetime.now() + timedelta(days=months_needed * 30)).strftime("%Y-%m-%d")
            
            milestones.append({
                "percentage": percentage,
                "target_amount": target_amount,
                "months_needed": months_needed,
                "milestone_date": milestone_date,
                "description": f"{percentage}% 달성 목표"
            })
        
        return milestones
    
    def _calculate_months_for_amount(self, goal: DreamGoal, target_amount: float) -> int:
        """특정 금액 달성까지 필요한 개월 수 계산"""
        if target_amount <= goal.current_savings:
            return 0
        
        monthly_savings = goal.monthly_income - goal.monthly_expenses
        if monthly_savings <= 0:
            return 999  # 달성 불가능
        
        remaining_amount = target_amount - goal.current_savings
        return int(remaining_amount / monthly_savings)
    
    def _generate_recommendations(self, goal: DreamGoal) -> List[str]:
        """권장사항 생성"""
        recommendations = []
        
        monthly_savings_needed = self._calculate_monthly_savings_needed(goal)
        available_savings = goal.monthly_income - goal.monthly_expenses
        
        # 저축 계획 관련 권장사항
        if available_savings < monthly_savings_needed:
            recommendations.append("월 저축액을 늘리기 위해 지출을 줄이거나 수입을 늘리는 방법을 고려하세요.")
            recommendations.append("부업이나 투자를 통해 추가 수입원을 마련하세요.")
        else:
            recommendations.append("현재 저축 계획이 목표 달성에 충분합니다. 꾸준히 지속하세요.")
        
        # 투자 관련 권장사항
        if goal.current_savings > 10000000:  # 1천만원 이상
            recommendations.append("대용량 자금을 활용한 부동산 투자 상품을 검토해보세요.")
        
        # 일반적 권장사항
        recommendations.extend([
            "정기적인 목표 점검과 계획 수정을 통해 현실적인 계획을 유지하세요.",
            "부동산 시장 동향을 지속적으로 모니터링하여 최적의 구매 시점을 파악하세요.",
            "신용도 관리와 대출 준비를 미리 해두세요."
        ])
        
        return recommendations[:5]  # 상위 5개 권장사항만 반환
    
    def _save_dream_visualization(self, visualization: DreamVisualization):
        """꿈 시각화 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO dream_visualizations 
            (goal_id, visualization_type, image_data, progress_percentage,
             months_remaining, monthly_savings_needed, achievement_probability)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            visualization.goal_id,
            visualization.visualization_type,
            visualization.image_data,
            visualization.progress_percentage,
            visualization.months_remaining,
            visualization.monthly_savings_needed,
            visualization.achievement_probability
        ))
        
        conn.commit()
        conn.close()
    
    def create_dream_roadmap(self, user_id: str, goals: List[DreamGoal]) -> DreamRoadmap:
        """꿈 실현 로드맵 생성"""
        roadmap_id = f"ROADMAP_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # 전체 타임라인 계산
        max_months = max([self._calculate_months_remaining(goal) for goal in goals])
        
        # 총 투자 필요액 계산
        total_investment = sum([goal.target_price - goal.current_savings for goal in goals])
        
        # 월별 저축 계획 생성
        monthly_savings_plan = self._create_monthly_savings_plan(goals, max_months)
        
        # 마일스톤 날짜 생성
        milestone_dates = self._generate_milestone_dates(goals, max_months)
        
        # 위험 요인 식별
        risk_factors = self._identify_risk_factors(goals)
        
        # 성공 전략 생성
        success_strategies = self._generate_success_strategies(goals)
        
        roadmap = DreamRoadmap(
            roadmap_id=roadmap_id,
            user_id=user_id,
            goals=goals,
            timeline_months=max_months,
            total_investment_needed=total_investment,
            monthly_savings_plan=monthly_savings_plan,
            milestone_dates=milestone_dates,
            risk_factors=risk_factors,
            success_strategies=success_strategies
        )
        
        # 데이터베이스에 저장
        self._save_dream_roadmap(roadmap)
        
        return roadmap
    
    def _create_monthly_savings_plan(self, goals: List[DreamGoal], max_months: int) -> Dict[str, float]:
        """월별 저축 계획 생성"""
        monthly_plan = {}
        
        for month in range(1, max_months + 1):
            total_monthly_savings = 0
            
            for goal in goals:
                months_remaining = self._calculate_months_remaining(goal)
                if month <= months_remaining:
                    monthly_savings_needed = self._calculate_monthly_savings_needed(goal)
                    total_monthly_savings += monthly_savings_needed
            
            monthly_plan[f"month_{month}"] = total_monthly_savings
        
        return monthly_plan
    
    def _generate_milestone_dates(self, goals: List[DreamGoal], max_months: int) -> List[str]:
        """마일스톤 날짜 생성"""
        milestone_dates = []
        
        # 분기별 마일스톤
        for quarter in range(1, (max_months // 3) + 1):
            milestone_date = (datetime.now() + timedelta(days=quarter * 90)).strftime("%Y-%m-%d")
            milestone_dates.append(f"Q{quarter}: {milestone_date}")
        
        return milestone_dates
    
    def _identify_risk_factors(self, goals: List[DreamGoal]) -> List[str]:
        """위험 요인 식별"""
        risk_factors = []
        
        for goal in goals:
            monthly_savings_needed = self._calculate_monthly_savings_needed(goal)
            available_savings = goal.monthly_income - goal.monthly_expenses
            
            if available_savings < monthly_savings_needed:
                risk_factors.append(f"{goal.target_property}: 월 저축액 부족")
            
            if goal.target_price > goal.monthly_income * 100:  # 연봉의 100배 이상
                risk_factors.append(f"{goal.target_property}: 목표 금액이 과도하게 높음")
        
        # 일반적 위험 요인
        risk_factors.extend([
            "경제 불안정으로 인한 수입 감소 가능성",
            "부동산 시장 변동성",
            "금리 상승으로 인한 대출 부담 증가",
            "인플레이션으로 인한 구매력 하락"
        ])
        
        return risk_factors[:5]  # 상위 5개 위험 요인만 반환
    
    def _generate_success_strategies(self, goals: List[DreamGoal]) -> List[str]:
        """성공 전략 생성"""
        strategies = []
        
        # 목표별 맞춤 전략
        for goal in goals:
            if goal.goal_type == "아파트구매":
                strategies.append(f"{goal.target_property}: 신도시나 개발 예정 지역 조기 투자 검토")
            elif goal.goal_type == "투자":
                strategies.append(f"{goal.target_property}: 분산 투자를 통한 리스크 관리")
        
        # 일반적 성공 전략
        strategies.extend([
            "정기적인 목표 점검과 계획 수정",
            "다양한 수입원 개발 (부업, 투자 등)",
            "지출 최적화를 통한 저축액 증대",
            "부동산 시장 동향 지속적 모니터링",
            "신용도 관리 및 대출 준비"
        ])
        
        return strategies[:5]  # 상위 5개 전략만 반환
    
    def _save_dream_roadmap(self, roadmap: DreamRoadmap):
        """꿈 로드맵 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO dream_roadmaps 
            (roadmap_id, user_id, timeline_months, total_investment_needed,
             monthly_savings_plan, milestone_dates, risk_factors, success_strategies)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            roadmap.roadmap_id,
            roadmap.user_id,
            roadmap.timeline_months,
            roadmap.total_investment_needed,
            json.dumps(roadmap.monthly_savings_plan),
            json.dumps(roadmap.milestone_dates),
            json.dumps(roadmap.risk_factors),
            json.dumps(roadmap.success_strategies)
        ))
        
        conn.commit()
        conn.close()

# API 서버 통합
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="꿈 시각화 시스템 API")

class DreamGoalRequest(BaseModel):
    user_id: str
    goal_data: Dict[str, Any]

class DreamVisualizationRequest(BaseModel):
    goal_id: str
    visualization_type: str = "progress_chart"

class DreamRoadmapRequest(BaseModel):
    user_id: str
    goal_ids: List[str]

visualization_system = DreamVisualizationSystem()

@app.post("/create-dream-goal")
async def create_dream_goal(request: DreamGoalRequest):
    """꿈 목표 생성 API"""
    try:
        goal = visualization_system.create_dream_goal(request.user_id, request.goal_data)
        return goal.__dict__
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/visualize-dream")
async def visualize_dream(request: DreamVisualizationRequest):
    """꿈 시각화 생성 API"""
    try:
        visualization = visualization_system.visualize_dream(
            request.goal_id, request.visualization_type
        )
        return visualization.__dict__
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/create-dream-roadmap")
async def create_dream_roadmap(request: DreamRoadmapRequest):
    """꿈 실현 로드맵 생성 API"""
    try:
        # 목표 조회
        goals = []
        for goal_id in request.goal_ids:
            goal = visualization_system._get_dream_goal(goal_id)
            if goal:
                goals.append(goal)
        
        if not goals:
            raise ValueError("유효한 목표가 없습니다.")
        
        roadmap = visualization_system.create_dream_roadmap(request.user_id, goals)
        return roadmap.__dict__
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dream-goals/{user_id}")
async def get_user_dream_goals(user_id: str):
    """사용자 꿈 목표 목록 조회"""
    try:
        conn = sqlite3.connect(visualization_system.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM dream_goals WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        goals_data = cursor.fetchall()
        conn.close()
        
        goals = []
        for goal_data in goals_data:
            goals.append({
                "goal_id": goal_data[1],
                "goal_type": goal_data[3],
                "target_property": goal_data[4],
                "target_price": goal_data[5],
                "current_savings": goal_data[6],
                "target_date": goal_data[9],
                "priority_level": goal_data[10],
                "description": goal_data[11]
            })
        
        return {"goals": goals}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8008)
