#!/usr/bin/env python3
"""
시공사 정보 시스템
하자 이슈, 대응 방안, 선정 기준 분석
"""

import os
import json
import sqlite3
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from collections import defaultdict, Counter
import requests
from bs4 import BeautifulSoup
import pandas as pd
import numpy as np

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ConstructionCompany:
    """시공사 정보 데이터 클래스"""
    company_id: str
    name: str
    established_year: int
    capital: float
    employees: int
    projects_completed: int
    current_projects: int
    specialties: List[str]
    certifications: List[str]
    reputation_score: float
    defect_rate: float
    response_time_days: float
    customer_satisfaction: float

@dataclass
class DefectIssue:
    """하자 이슈 데이터 클래스"""
    issue_id: str
    company_id: str
    project_name: str
    issue_type: str
    severity: str
    description: str
    reported_date: str
    resolved_date: Optional[str]
    resolution_method: Optional[str]
    cost_impact: float
    customer_impact_score: float

@dataclass
class CompanyAnalysis:
    """시공사 분석 결과"""
    company: ConstructionCompany
    defect_history: List[DefectIssue]
    reliability_score: float
    quality_score: float
    responsiveness_score: float
    cost_effectiveness_score: float
    overall_rating: str
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]

class ConstructionCompanyInfoSystem:
    """시공사 정보 시스템"""
    
    def __init__(self, db_path: str = "construction_companies.db"):
        self.db_path = db_path
        self.init_database()
        self.load_sample_data()
        
    def init_database(self):
        """데이터베이스 초기화"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 시공사 정보 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS construction_companies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_id TEXT UNIQUE,
                name TEXT,
                established_year INTEGER,
                capital REAL,
                employees INTEGER,
                projects_completed INTEGER,
                current_projects INTEGER,
                specialties TEXT,
                certifications TEXT,
                reputation_score REAL,
                defect_rate REAL,
                response_time_days REAL,
                customer_satisfaction REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 하자 이슈 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS defect_issues (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                issue_id TEXT UNIQUE,
                company_id TEXT,
                project_name TEXT,
                issue_type TEXT,
                severity TEXT,
                description TEXT,
                reported_date TEXT,
                resolved_date TEXT,
                resolution_method TEXT,
                cost_impact REAL,
                customer_impact_score REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (company_id) REFERENCES construction_companies (company_id)
            )
        ''')
        
        # 프로젝트 정보 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id TEXT UNIQUE,
                project_name TEXT,
                company_id TEXT,
                project_type TEXT,
                scale REAL,
                start_date TEXT,
                completion_date TEXT,
                budget REAL,
                actual_cost REAL,
                quality_rating REAL,
                customer_rating REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (company_id) REFERENCES construction_companies (company_id)
            )
        ''')
        
        conn.commit()
        conn.close()
        
    def load_sample_data(self):
        """샘플 데이터 로드"""
        sample_companies = [
            {
                "company_id": "COMP001",
                "name": "대한건설",
                "established_year": 1985,
                "capital": 50000000000,
                "employees": 1200,
                "projects_completed": 150,
                "current_projects": 8,
                "specialties": ["아파트", "오피스텔", "상업시설"],
                "certifications": ["ISO9001", "ISO14001", "OHSAS18001"],
                "reputation_score": 8.5,
                "defect_rate": 2.3,
                "response_time_days": 3.2,
                "customer_satisfaction": 8.7
            },
            {
                "company_id": "COMP002",
                "name": "한국건설",
                "established_year": 1992,
                "capital": 30000000000,
                "employees": 800,
                "projects_completed": 95,
                "current_projects": 5,
                "specialties": ["아파트", "빌라", "단독주택"],
                "certifications": ["ISO9001", "ISO14001"],
                "reputation_score": 7.8,
                "defect_rate": 3.1,
                "response_time_days": 4.5,
                "customer_satisfaction": 7.9
            },
            {
                "company_id": "COMP003",
                "name": "서울건설",
                "established_year": 1978,
                "capital": 80000000000,
                "employees": 2000,
                "projects_completed": 280,
                "current_projects": 12,
                "specialties": ["아파트", "오피스텔", "상업시설", "공공시설"],
                "certifications": ["ISO9001", "ISO14001", "OHSAS18001", "KS인증"],
                "reputation_score": 9.2,
                "defect_rate": 1.8,
                "response_time_days": 2.1,
                "customer_satisfaction": 9.1
            }
        ]
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for company in sample_companies:
            cursor.execute('''
                INSERT OR REPLACE INTO construction_companies 
                (company_id, name, established_year, capital, employees, projects_completed,
                 current_projects, specialties, certifications, reputation_score, defect_rate,
                 response_time_days, customer_satisfaction)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                company["company_id"],
                company["name"],
                company["established_year"],
                company["capital"],
                company["employees"],
                company["projects_completed"],
                company["current_projects"],
                json.dumps(company["specialties"]),
                json.dumps(company["certifications"]),
                company["reputation_score"],
                company["defect_rate"],
                company["response_time_days"],
                company["customer_satisfaction"]
            ))
        
        # 샘플 하자 이슈 데이터
        sample_defects = [
            {
                "issue_id": "DEF001",
                "company_id": "COMP001",
                "project_name": "대한아파트 1단지",
                "issue_type": "벽체균열",
                "severity": "중간",
                "description": "외벽에 미세한 균열 발견",
                "reported_date": "2024-01-15",
                "resolved_date": "2024-01-25",
                "resolution_method": "실리콘 보수 및 방수처리",
                "cost_impact": 5000000,
                "customer_impact_score": 6.0
            },
            {
                "issue_id": "DEF002",
                "company_id": "COMP002",
                "project_name": "한국빌라 2동",
                "issue_type": "배관누수",
                "severity": "높음",
                "description": "화장실 배관에서 누수 발생",
                "reported_date": "2024-02-10",
                "resolved_date": "2024-02-20",
                "resolution_method": "배관 교체 및 방수처리",
                "cost_impact": 8000000,
                "customer_impact_score": 8.0
            },
            {
                "issue_id": "DEF003",
                "company_id": "COMP003",
                "project_name": "서울오피스텔 A동",
                "issue_type": "엘리베이터 고장",
                "severity": "높음",
                "description": "엘리베이터 작동 불량",
                "reported_date": "2024-03-05",
                "resolved_date": "2024-03-08",
                "resolution_method": "부품 교체 및 정비",
                "cost_impact": 12000000,
                "customer_impact_score": 9.0
            }
        ]
        
        for defect in sample_defects:
            cursor.execute('''
                INSERT OR REPLACE INTO defect_issues 
                (issue_id, company_id, project_name, issue_type, severity, description,
                 reported_date, resolved_date, resolution_method, cost_impact, customer_impact_score)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                defect["issue_id"],
                defect["company_id"],
                defect["project_name"],
                defect["issue_type"],
                defect["severity"],
                defect["description"],
                defect["reported_date"],
                defect["resolved_date"],
                defect["resolution_method"],
                defect["cost_impact"],
                defect["customer_impact_score"]
            ))
        
        conn.commit()
        conn.close()
        
    def analyze_company(self, company_id: str) -> CompanyAnalysis:
        """시공사 분석"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 시공사 정보 조회
        cursor.execute("SELECT * FROM construction_companies WHERE company_id = ?", (company_id,))
        company_data = cursor.fetchone()
        
        if not company_data:
            conn.close()
            raise ValueError(f"시공사 ID {company_id}를 찾을 수 없습니다.")
        
        # 시공사 객체 생성
        company = ConstructionCompany(
            company_id=company_data[1],
            name=company_data[2],
            established_year=company_data[3],
            capital=company_data[4],
            employees=company_data[5],
            projects_completed=company_data[6],
            current_projects=company_data[7],
            specialties=json.loads(company_data[8]),
            certifications=json.loads(company_data[9]),
            reputation_score=company_data[10],
            defect_rate=company_data[11],
            response_time_days=company_data[12],
            customer_satisfaction=company_data[13]
        )
        
        # 하자 이슈 조회
        cursor.execute("SELECT * FROM defect_issues WHERE company_id = ?", (company_id,))
        defect_data = cursor.fetchall()
        
        defect_history = []
        for defect in defect_data:
            defect_history.append(DefectIssue(
                issue_id=defect[1],
                company_id=defect[2],
                project_name=defect[3],
                issue_type=defect[4],
                severity=defect[5],
                description=defect[6],
                reported_date=defect[7],
                resolved_date=defect[8],
                resolution_method=defect[9],
                cost_impact=defect[10],
                customer_impact_score=defect[11]
            ))
        
        conn.close()
        
        # 분석 수행
        reliability_score = self._calculate_reliability_score(company, defect_history)
        quality_score = self._calculate_quality_score(company, defect_history)
        responsiveness_score = self._calculate_responsiveness_score(company, defect_history)
        cost_effectiveness_score = self._calculate_cost_effectiveness_score(company, defect_history)
        
        overall_rating = self._determine_overall_rating(
            reliability_score, quality_score, responsiveness_score, cost_effectiveness_score
        )
        
        strengths, weaknesses = self._identify_strengths_weaknesses(company, defect_history)
        recommendations = self._generate_recommendations(company, defect_history, strengths, weaknesses)
        
        return CompanyAnalysis(
            company=company,
            defect_history=defect_history,
            reliability_score=reliability_score,
            quality_score=quality_score,
            responsiveness_score=responsiveness_score,
            cost_effectiveness_score=cost_effectiveness_score,
            overall_rating=overall_rating,
            strengths=strengths,
            weaknesses=weaknesses,
            recommendations=recommendations
        )
    
    def _calculate_reliability_score(self, company: ConstructionCompany, defects: List[DefectIssue]) -> float:
        """신뢰성 점수 계산"""
        # 기본 점수 (회사 규모, 경험)
        base_score = min(company.projects_completed / 10, 10) * 2  # 최대 20점
        
        # 하자율 기반 점수 (낮을수록 좋음)
        defect_score = max(0, 10 - company.defect_rate * 2)  # 최대 10점
        
        # 고객 만족도
        satisfaction_score = company.customer_satisfaction  # 최대 10점
        
        # 인증서 보유
        certification_score = len(company.certifications) * 2  # 최대 10점
        
        total_score = base_score + defect_score + satisfaction_score + certification_score
        return min(total_score, 50)  # 최대 50점
    
    def _calculate_quality_score(self, company: ConstructionCompany, defects: List[DefectIssue]) -> float:
        """품질 점수 계산"""
        if not defects:
            return 50.0
        
        # 하자 심각도 분석
        severity_scores = {"낮음": 10, "중간": 5, "높음": 0}
        severity_penalty = sum(severity_scores.get(defect.severity, 0) for defect in defects)
        
        # 하자 해결률
        resolved_defects = [d for d in defects if d.resolved_date]
        resolution_rate = len(resolved_defects) / len(defects) * 100
        
        # 평균 해결 시간
        avg_resolution_time = np.mean([
            (datetime.strptime(d.resolved_date, "%Y-%m-%d") - 
             datetime.strptime(d.reported_date, "%Y-%m-%d")).days
            for d in resolved_defects if d.resolved_date
        ]) if resolved_defects else 0
        
        resolution_time_score = max(0, 20 - avg_resolution_time)  # 빠를수록 좋음
        
        quality_score = resolution_rate + resolution_time_score - (severity_penalty / len(defects))
        return max(0, min(quality_score, 50))
    
    def _calculate_responsiveness_score(self, company: ConstructionCompany, defects: List[DefectIssue]) -> float:
        """응답성 점수 계산"""
        # 평균 응답 시간
        response_time_score = max(0, 20 - company.response_time_days * 2)
        
        # 고객 영향도 고려
        if defects:
            avg_customer_impact = np.mean([d.customer_impact_score for d in defects])
            impact_score = max(0, 20 - avg_customer_impact * 2)
        else:
            impact_score = 20
        
        # 해결 방법의 적절성
        resolution_score = 10  # 기본 점수
        
        total_score = response_time_score + impact_score + resolution_score
        return min(total_score, 50)
    
    def _calculate_cost_effectiveness_score(self, company: ConstructionCompany, defects: List[DefectIssue]) -> float:
        """비용 효율성 점수 계산"""
        # 자본 대비 프로젝트 수
        capital_efficiency = (company.projects_completed / (company.capital / 1000000000)) * 10
        
        # 하자 수리 비용
        if defects:
            total_defect_cost = sum(d.cost_impact for d in defects)
            cost_per_project = total_defect_cost / company.projects_completed if company.projects_completed > 0 else 0
            cost_score = max(0, 20 - cost_per_project / 1000000)  # 100만원당 1점 차감
        else:
            cost_score = 20
        
        # 규모의 경제
        scale_score = min(company.employees / 100, 20)  # 직원 수 기반
        
        total_score = capital_efficiency + cost_score + scale_score
        return min(total_score, 50)
    
    def _determine_overall_rating(self, reliability: float, quality: float, 
                                 responsiveness: float, cost_effectiveness: float) -> str:
        """전체 등급 결정"""
        total_score = reliability + quality + responsiveness + cost_effectiveness
        
        if total_score >= 180:
            return "A+ (매우 우수)"
        elif total_score >= 160:
            return "A (우수)"
        elif total_score >= 140:
            return "B+ (양호)"
        elif total_score >= 120:
            return "B (보통)"
        elif total_score >= 100:
            return "C (미흡)"
        else:
            return "D (부족)"
    
    def _identify_strengths_weaknesses(self, company: ConstructionCompany, 
                                     defects: List[DefectIssue]) -> Tuple[List[str], List[str]]:
        """강점과 약점 식별"""
        strengths = []
        weaknesses = []
        
        # 강점 분석
        if company.reputation_score >= 8.5:
            strengths.append("높은 시장 신뢰도")
        
        if company.defect_rate <= 2.0:
            strengths.append("낮은 하자율")
        
        if company.response_time_days <= 3.0:
            strengths.append("빠른 하자 대응")
        
        if company.customer_satisfaction >= 8.5:
            strengths.append("높은 고객 만족도")
        
        if len(company.certifications) >= 3:
            strengths.append("다양한 품질 인증 보유")
        
        # 약점 분석
        if company.defect_rate > 3.0:
            weaknesses.append("높은 하자율")
        
        if company.response_time_days > 5.0:
            weaknesses.append("느린 하자 대응")
        
        if company.customer_satisfaction < 7.0:
            weaknesses.append("낮은 고객 만족도")
        
        if company.projects_completed < 50:
            weaknesses.append("제한된 프로젝트 경험")
        
        if len(company.specialties) < 2:
            weaknesses.append("제한된 전문 분야")
        
        return strengths, weaknesses
    
    def _generate_recommendations(self, company: ConstructionCompany, defects: List[DefectIssue],
                                 strengths: List[str], weaknesses: List[str]) -> List[str]:
        """개선 권장사항 생성"""
        recommendations = []
        
        # 약점 기반 권장사항
        if "높은 하자율" in weaknesses:
            recommendations.append("품질 관리 시스템 강화 및 시공 과정 모니터링 개선")
        
        if "느린 하자 대응" in weaknesses:
            recommendations.append("24시간 하자 신고 시스템 구축 및 응답팀 강화")
        
        if "낮은 고객 만족도" in weaknesses:
            recommendations.append("고객 서비스 교육 강화 및 피드백 시스템 개선")
        
        if "제한된 프로젝트 경험" in weaknesses:
            recommendations.append("중소규모 프로젝트부터 단계적 경험 축적")
        
        if "제한된 전문 분야" in weaknesses:
            recommendations.append("새로운 건설 분야 진출 및 전문 인력 확보")
        
        # 일반적 권장사항
        recommendations.extend([
            "정기적인 품질 점검 및 예방적 유지보수 체계 구축",
            "디지털 기술 도입을 통한 건설 프로세스 혁신",
            "지속적인 직원 교육 및 기술 역량 강화",
            "고객과의 소통 채널 다양화 및 투명성 제고"
        ])
        
        return recommendations[:5]  # 상위 5개 권장사항만 반환
    
    def get_company_comparison(self, company_ids: List[str]) -> Dict[str, Any]:
        """시공사 비교 분석"""
        comparisons = {}
        
        for company_id in company_ids:
            try:
                analysis = self.analyze_company(company_id)
                comparisons[company_id] = {
                    "name": analysis.company.name,
                    "reliability_score": analysis.reliability_score,
                    "quality_score": analysis.quality_score,
                    "responsiveness_score": analysis.responsiveness_score,
                    "cost_effectiveness_score": analysis.cost_effectiveness_score,
                    "overall_rating": analysis.overall_rating,
                    "defect_rate": analysis.company.defect_rate,
                    "customer_satisfaction": analysis.company.customer_satisfaction
                }
            except ValueError as e:
                logger.error(f"시공사 분석 오류: {e}")
                continue
        
        return comparisons
    
    def get_defect_trend_analysis(self, company_id: str, months: int = 12) -> Dict[str, Any]:
        """하자 트렌드 분석"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 최근 N개월 하자 데이터 조회
        cutoff_date = (datetime.now() - timedelta(days=months*30)).strftime("%Y-%m-%d")
        cursor.execute('''
            SELECT issue_type, severity, reported_date, resolved_date, cost_impact
            FROM defect_issues 
            WHERE company_id = ? AND reported_date >= ?
            ORDER BY reported_date DESC
        ''', (company_id, cutoff_date))
        
        defects = cursor.fetchall()
        conn.close()
        
        if not defects:
            return {"message": "최근 하자 데이터가 없습니다."}
        
        # 하자 유형별 분석
        issue_types = [d[0] for d in defects]
        issue_type_counts = Counter(issue_types)
        
        # 심각도별 분석
        severities = [d[1] for d in defects]
        severity_counts = Counter(severities)
        
        # 월별 하자 발생 추이
        monthly_defects = defaultdict(int)
        for defect in defects:
            month = defect[2][:7]  # YYYY-MM
            monthly_defects[month] += 1
        
        # 평균 해결 시간
        resolved_defects = [d for d in defects if d[3]]
        avg_resolution_days = np.mean([
            (datetime.strptime(d[3], "%Y-%m-%d") - 
             datetime.strptime(d[2], "%Y-%m-%d")).days
            for d in resolved_defects
        ]) if resolved_defects else 0
        
        # 총 하자 비용
        total_cost = sum(d[4] for d in defects)
        
        return {
            "total_defects": len(defects),
            "issue_type_distribution": dict(issue_type_counts),
            "severity_distribution": dict(severity_counts),
            "monthly_trend": dict(monthly_defects),
            "avg_resolution_days": avg_resolution_days,
            "total_defect_cost": total_cost,
            "analysis_period_months": months
        }

# API 서버 통합
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="시공사 정보 시스템 API")

class CompanyAnalysisRequest(BaseModel):
    company_id: str

class CompanyComparisonRequest(BaseModel):
    company_ids: List[str]

class DefectTrendRequest(BaseModel):
    company_id: str
    months: int = 12

info_system = ConstructionCompanyInfoSystem()

@app.post("/analyze-company")
async def analyze_company(request: CompanyAnalysisRequest):
    """시공사 분석 API"""
    try:
        analysis = info_system.analyze_company(request.company_id)
        return analysis.__dict__
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/compare-companies")
async def compare_companies(request: CompanyComparisonRequest):
    """시공사 비교 분석 API"""
    try:
        comparison = info_system.get_company_comparison(request.company_ids)
        return comparison
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/defect-trend-analysis")
async def defect_trend_analysis(request: DefectTrendRequest):
    """하자 트렌드 분석 API"""
    try:
        trend_analysis = info_system.get_defect_trend_analysis(
            request.company_id, request.months
        )
        return trend_analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/companies")
async def get_all_companies():
    """전체 시공사 목록 조회"""
    try:
        conn = sqlite3.connect(info_system.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT company_id, name, reputation_score, defect_rate FROM construction_companies")
        companies = cursor.fetchall()
        conn.close()
        
        return [
            {
                "company_id": company[0],
                "name": company[1],
                "reputation_score": company[2],
                "defect_rate": company[3]
            }
            for company in companies
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn

    _cc = int(
        os.environ.get(
            "CONSTRUCTION_COMPANY_INFO_PORT", os.environ.get("PORT", "8006")
        )
    )
    uvicorn.run(app, host="0.0.0.0", port=_cc)
