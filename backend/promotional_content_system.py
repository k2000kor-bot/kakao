#!/usr/bin/env python3
"""
홍보물 및 전달 시스템
홍보물 생성, 전달 관리, 마케팅 콘텐츠 관리 기능
"""

import os
import json
import sqlite3
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from pathlib import Path
import re

from fastapi import FastAPI, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn


# FastAPI 앱 생성
app = FastAPI(
    title="홍보물 및 전달 시스템",
    description="홍보물 생성, 전달 관리, 마케팅 콘텐츠 관리",
    version="7.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 데이터베이스 초기화
def init_promotional_database():
    """홍보물 및 전달 시스템 데이터베이스 초기화"""
    conn = sqlite3.connect('promotional_content_system.db')
    cursor = conn.cursor()

    # 홍보물 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS promotional_materials (
            id TEXT PRIMARY KEY,
            project_id TEXT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            material_type TEXT NOT NULL,
            target_audience TEXT,
            delivery_channels TEXT,
            status TEXT DEFAULT 'draft',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects (id)
        )
    ''')

    # 전달 계획 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS delivery_plans (
            id TEXT PRIMARY KEY,
            material_id TEXT,
            delivery_type TEXT NOT NULL,
            target_audience TEXT,
            schedule_date DATETIME,
            delivery_channels TEXT,
            status TEXT DEFAULT 'planned',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (material_id) REFERENCES promotional_materials (id)
        )
    ''')

    # 마케팅 캠페인 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS marketing_campaigns (
            id TEXT PRIMARY KEY,
            project_id TEXT,
            campaign_name TEXT NOT NULL,
            description TEXT,
            campaign_type TEXT,
            start_date DATETIME,
            end_date DATETIME,
            budget REAL,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects (id)
        )
    ''')

    # 전달 결과 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS delivery_results (
            id TEXT PRIMARY KEY,
            delivery_plan_id TEXT,
            delivery_date DATETIME,
            reach_count INTEGER,
            engagement_rate REAL,
            conversion_rate REAL,
            feedback TEXT,
            status TEXT DEFAULT 'completed',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (delivery_plan_id) REFERENCES delivery_plans (id)
        )
    ''')

    # 템플릿 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS content_templates (
            id TEXT PRIMARY KEY,
            template_name TEXT NOT NULL,
            template_type TEXT NOT NULL,
            content_structure TEXT,
            variables TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()


# 데이터베이스 초기화 실행
init_promotional_database()


# 데이터 모델
class PromotionalMaterialCreate(BaseModel):
    project_id: str
    title: str
    content: str
    material_type: str
    target_audience: Optional[str] = None
    delivery_channels: Optional[List[str]] = None


class DeliveryPlanCreate(BaseModel):
    material_id: str
    delivery_type: str
    target_audience: Optional[str] = None
    schedule_date: Optional[str] = None
    delivery_channels: Optional[List[str]] = None


class MarketingCampaignCreate(BaseModel):
    project_id: str
    campaign_name: str
    description: Optional[str] = None
    campaign_type: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    budget: Optional[float] = None


class ContentTemplateCreate(BaseModel):
    template_name: str
    template_type: str
    content_structure: str
    variables: Optional[List[str]] = None


@dataclass
class PromotionalMaterial:
    """홍보물 정보"""
    id: str
    project_id: str
    title: str
    content: str
    material_type: str
    target_audience: str
    delivery_channels: List[str]
    status: str
    created_at: datetime
    updated_at: datetime


@dataclass
class DeliveryPlan:
    """전달 계획 정보"""
    id: str
    material_id: str
    delivery_type: str
    target_audience: str
    schedule_date: datetime
    delivery_channels: List[str]
    status: str
    created_at: datetime


class PromotionalContentSystem:
    """홍보물 및 전달 시스템"""

    def __init__(self):
        # 홍보물 타입
        self.material_types = [
            "브로셔", "팜플렛", "포스터", "뉴스레터", "소셜미디어", 
            "이메일", "웹사이트", "광고", "프레스릴리즈", "비디오"
        ]

        # 전달 채널
        self.delivery_channels = [
            "이메일", "소셜미디어", "웹사이트", "인쇄물", "SMS",
            "전화", "대면", "온라인광고", "오프라인광고", "인플루언서"
        ]

        # 마케팅 캠페인 타입
        self.campaign_types = [
            "브랜드 인지도", "제품 런칭", "판매 촉진", "고객 유지",
            "이벤트 홍보", "사회적 책임", "교육", "기업 홍보"
        ]

        # 콘텐츠 템플릿
        self.default_templates = {
            "브로셔": {
                "structure": "제목\n부제목\n주요 내용\n특징\n연락처",
                "variables": ["제목", "부제목", "주요내용", "특징", "연락처"]
            },
            "소셜미디어": {
                "structure": "해시태그 #키워드\n\n주요 메시지\n\n더 자세한 정보: 링크",
                "variables": ["해시태그", "주요메시지", "링크"]
            },
            "이메일": {
                "structure": "제목: [제목]\n\n안녕하세요,\n\n[본문내용]\n\n감사합니다.\n[회사명]",
                "variables": ["제목", "본문내용", "회사명"]
            }
        }

    def create_promotional_material(self, material_data: PromotionalMaterialCreate) -> str:
        """홍보물 생성"""
        material_id = str(uuid.uuid4())
        
        conn = sqlite3.connect('promotional_content_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO promotional_materials (id, project_id, title, content, material_type, target_audience, delivery_channels, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            material_id, material_data.project_id, material_data.title,
            material_data.content, material_data.material_type,
            material_data.target_audience,
            json.dumps(material_data.delivery_channels) if material_data.delivery_channels else '[]',
            'draft'
        ))
        
        conn.commit()
        conn.close()
        
        return material_id

    def create_delivery_plan(self, plan_data: DeliveryPlanCreate) -> str:
        """전달 계획 생성"""
        plan_id = str(uuid.uuid4())
        
        conn = sqlite3.connect('promotional_content_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO delivery_plans (id, material_id, delivery_type, target_audience, schedule_date, delivery_channels, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            plan_id, plan_data.material_id, plan_data.delivery_type,
            plan_data.target_audience, plan_data.schedule_date,
            json.dumps(plan_data.delivery_channels) if plan_data.delivery_channels else '[]',
            'planned'
        ))
        
        conn.commit()
        conn.close()
        
        return plan_id

    def create_marketing_campaign(self, campaign_data: MarketingCampaignCreate) -> str:
        """마케팅 캠페인 생성"""
        campaign_id = str(uuid.uuid4())
        
        conn = sqlite3.connect('promotional_content_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO marketing_campaigns (id, project_id, campaign_name, description, campaign_type, start_date, end_date, budget, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            campaign_id, campaign_data.project_id, campaign_data.campaign_name,
            campaign_data.description, campaign_data.campaign_type,
            campaign_data.start_date, campaign_data.end_date,
            campaign_data.budget, 'active'
        ))
        
        conn.commit()
        conn.close()
        
        return campaign_id

    def create_content_template(self, template_data: ContentTemplateCreate) -> str:
        """콘텐츠 템플릿 생성"""
        template_id = str(uuid.uuid4())
        
        conn = sqlite3.connect('promotional_content_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO content_templates (id, template_name, template_type, content_structure, variables)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            template_id, template_data.template_name, template_data.template_type,
            template_data.content_structure,
            json.dumps(template_data.variables) if template_data.variables else '[]'
        ))
        
        conn.commit()
        conn.close()
        
        return template_id

    def get_project_materials(self, project_id: str) -> List[Dict[str, Any]]:
        """프로젝트 홍보물 목록 조회"""
        conn = sqlite3.connect('promotional_content_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM promotional_materials
            WHERE project_id = ?
            ORDER BY created_at DESC
        ''', (project_id,))
        
        materials = []
        for row in cursor.fetchall():
            materials.append({
                "id": row[0],
                "project_id": row[1],
                "title": row[2],
                "content": row[3],
                "material_type": row[4],
                "target_audience": row[5],
                "delivery_channels": json.loads(row[6]) if row[6] else [],
                "status": row[7],
                "created_at": row[8],
                "updated_at": row[9]
            })
        
        conn.close()
        return materials

    def get_delivery_plans(self, material_id: str) -> List[Dict[str, Any]]:
        """홍보물 전달 계획 조회"""
        conn = sqlite3.connect('promotional_content_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM delivery_plans
            WHERE material_id = ?
            ORDER BY created_at DESC
        ''', (material_id,))
        
        plans = []
        for row in cursor.fetchall():
            plans.append({
                "id": row[0],
                "material_id": row[1],
                "delivery_type": row[2],
                "target_audience": row[3],
                "schedule_date": row[4],
                "delivery_channels": json.loads(row[5]) if row[5] else [],
                "status": row[6],
                "created_at": row[7]
            })
        
        conn.close()
        return plans

    def get_marketing_campaigns(self, project_id: str) -> List[Dict[str, Any]]:
        """프로젝트 마케팅 캠페인 조회"""
        conn = sqlite3.connect('promotional_content_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM marketing_campaigns
            WHERE project_id = ?
            ORDER BY created_at DESC
        ''', (project_id,))
        
        campaigns = []
        for row in cursor.fetchall():
            campaigns.append({
                "id": row[0],
                "project_id": row[1],
                "campaign_name": row[2],
                "description": row[3],
                "campaign_type": row[4],
                "start_date": row[5],
                "end_date": row[6],
                "budget": row[7],
                "status": row[8],
                "created_at": row[9]
            })
        
        conn.close()
        return campaigns

    def get_content_templates(self) -> List[Dict[str, Any]]:
        """콘텐츠 템플릿 목록 조회"""
        conn = sqlite3.connect('promotional_content_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM content_templates
            ORDER BY created_at DESC
        ''')
        
        templates = []
        for row in cursor.fetchall():
            templates.append({
                "id": row[0],
                "template_name": row[1],
                "template_type": row[2],
                "content_structure": row[3],
                "variables": json.loads(row[4]) if row[4] else [],
                "created_at": row[5]
            })
        
        conn.close()
        return templates

    def generate_content_from_template(self, template_type: str, variables: Dict[str, str]) -> str:
        """템플릿을 사용한 콘텐츠 생성"""
        template = self.default_templates.get(template_type, {
            "structure": "기본 템플릿\n\n{내용}",
            "variables": ["내용"]
        })
        
        content = template["structure"]
        for var_name, var_value in variables.items():
            content = content.replace(f"{{{var_name}}}", var_value)
        
        return content

    def analyze_delivery_performance(self, delivery_plan_id: str) -> Dict[str, Any]:
        """전달 성과 분석 (시뮬레이션)"""
        # 실제 구현에서는 실제 데이터를 사용
        return {
            "reach_count": 1500,
            "engagement_rate": 0.12,
            "conversion_rate": 0.03,
            "click_through_rate": 0.08,
            "bounce_rate": 0.45,
            "average_session_duration": 180,
            "social_shares": 25,
            "comments": 15,
            "likes": 120
        }


# 전역 인스턴스
promotional_system = PromotionalContentSystem()


# API 엔드포인트
@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "홍보물 및 전달 시스템",
        "version": "7.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/status")
async def get_status():
    """시스템 상태 확인"""
    return {
        "status": "healthy",
        "services": {
            "promotional_materials": "running",
            "delivery_management": "running",
            "marketing_campaigns": "running",
            "content_templates": "running",
            "performance_analytics": "running"
        },
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/promotional-materials")
async def create_promotional_material(material: PromotionalMaterialCreate):
    """홍보물 생성"""
    try:
        material_id = promotional_system.create_promotional_material(material)
        return {
            "success": True,
            "material_id": material_id,
            "message": "홍보물이 성공적으로 생성되었습니다."
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"홍보물 생성 실패: {str(e)}"
        }


@app.post("/api/delivery-plans")
async def create_delivery_plan(plan: DeliveryPlanCreate):
    """전달 계획 생성"""
    try:
        plan_id = promotional_system.create_delivery_plan(plan)
        return {
            "success": True,
            "plan_id": plan_id,
            "message": "전달 계획이 성공적으로 생성되었습니다."
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"전달 계획 생성 실패: {str(e)}"
        }


@app.post("/api/marketing-campaigns")
async def create_marketing_campaign(campaign: MarketingCampaignCreate):
    """마케팅 캠페인 생성"""
    try:
        campaign_id = promotional_system.create_marketing_campaign(campaign)
        return {
            "success": True,
            "campaign_id": campaign_id,
            "message": "마케팅 캠페인이 성공적으로 생성되었습니다."
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"마케팅 캠페인 생성 실패: {str(e)}"
        }


@app.post("/api/content-templates")
async def create_content_template(template: ContentTemplateCreate):
    """콘텐츠 템플릿 생성"""
    try:
        template_id = promotional_system.create_content_template(template)
        return {
            "success": True,
            "template_id": template_id,
            "message": "콘텐츠 템플릿이 성공적으로 생성되었습니다."
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"콘텐츠 템플릿 생성 실패: {str(e)}"
        }


@app.get("/api/projects/{project_id}/materials")
async def get_project_materials(project_id: str):
    """프로젝트 홍보물 목록 조회"""
    try:
        materials = promotional_system.get_project_materials(project_id)
        return {
            "success": True,
            "materials": materials
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"홍보물 목록 조회 실패: {str(e)}"
        }


@app.get("/api/materials/{material_id}/delivery-plans")
async def get_material_delivery_plans(material_id: str):
    """홍보물 전달 계획 조회"""
    try:
        plans = promotional_system.get_delivery_plans(material_id)
        return {
            "success": True,
            "plans": plans
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"전달 계획 조회 실패: {str(e)}"
        }


@app.get("/api/projects/{project_id}/campaigns")
async def get_project_campaigns(project_id: str):
    """프로젝트 마케팅 캠페인 조회"""
    try:
        campaigns = promotional_system.get_marketing_campaigns(project_id)
        return {
            "success": True,
            "campaigns": campaigns
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"마케팅 캠페인 조회 실패: {str(e)}"
        }


@app.get("/api/content-templates")
async def get_content_templates():
    """콘텐츠 템플릿 목록 조회"""
    try:
        templates = promotional_system.get_content_templates()
        return {
            "success": True,
            "templates": templates
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"콘텐츠 템플릿 조회 실패: {str(e)}"
        }


@app.post("/api/generate-content")
async def generate_content_from_template(template_type: str = Form(...), variables: str = Form(...)):
    """템플릿을 사용한 콘텐츠 생성"""
    try:
        variables_dict = json.loads(variables)
        content = promotional_system.generate_content_from_template(template_type, variables_dict)
        return {
            "success": True,
            "content": content,
            "template_type": template_type
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"콘텐츠 생성 실패: {str(e)}"
        }


@app.get("/api/delivery-plans/{plan_id}/performance")
async def get_delivery_performance(plan_id: str):
    """전달 성과 분석"""
    try:
        performance = promotional_system.analyze_delivery_performance(plan_id)
        return {
            "success": True,
            "performance": performance
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"성과 분석 실패: {str(e)}"
        }


@app.get("/api/test")
async def test_endpoint():
    """테스트 엔드포인트"""
    return {
        "message": "홍보물 및 전달 시스템이 정상적으로 작동하고 있습니다!",
        "features": [
            "홍보물 생성 및 관리",
            "전달 계획 수립",
            "마케팅 캠페인 관리",
            "콘텐츠 템플릿 시스템",
            "성과 분석 및 리포팅"
        ],
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    import os
    _p = int(os.environ.get("PROMOTIONAL_CONTENT_SYSTEM_PORT", os.environ.get("PORT", "8006")))
    print("🚀 홍보물 및 전달 시스템 시작 중...")
    uvicorn.run(
        "promotional_content_system:app",
        host="0.0.0.0",
        port=_p,
        reload=False,
        log_level="info"
    ) 