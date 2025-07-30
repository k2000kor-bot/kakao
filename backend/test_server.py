from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
import json
from datetime import datetime, timedelta
import random

app = FastAPI(title="Advanced Knowledge Management API Test")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 테스트 데이터
test_documents = [
    {
        "id": "doc_001",
        "title": "안전 가이드라인 v2.1",
        "category": "safety_guidelines",
        "subcategory": "안전 규정",
        "confidence_score": 0.92,
        "tags": ["안전", "가이드라인", "규정"],
        "file_type": ".pdf",
        "upload_date": "2024-01-15T10:30:00Z",
        "usage_count": 45,
        "rating": 4.7,
        "ai_insights": {
            "key_topics": ["안전", "보호구", "절차"],
            "complexity": "medium",
            "summary": "작업장 안전을 위한 기본 가이드라인과 보호구 사용법을 설명합니다."
        }
    },
    {
        "id": "doc_002", 
        "title": "조합원 복지 정책 안내",
        "category": "welfare_info",
        "subcategory": "복지 정책",
        "confidence_score": 0.88,
        "tags": ["복지", "정책", "조합원"],
        "file_type": ".docx",
        "upload_date": "2024-01-14T15:20:00Z",
        "usage_count": 32,
        "rating": 4.3,
        "ai_insights": {
            "key_topics": ["복지", "의료", "교육"],
            "complexity": "simple",
            "summary": "조합원들을 위한 다양한 복지 혜택과 신청 방법을 안내합니다."
        }
    },
    {
        "id": "doc_003",
        "title": "노동법 개정 사항",
        "category": "labor_law", 
        "subcategory": "근로기준법",
        "confidence_score": 0.95,
        "tags": ["노동법", "개정", "근로기준법"],
        "file_type": ".pdf",
        "upload_date": "2024-01-13T09:00:00Z",
        "usage_count": 78,
        "rating": 4.9,
        "ai_insights": {
            "key_topics": ["근로기준법", "임금", "근로시간"],
            "complexity": "complex",
            "summary": "2024년 개정된 근로기준법의 주요 변경사항과 적용 방법을 설명합니다."
        }
    }
]

@app.get("/")
async def root():
    return {
        "message": "Advanced Knowledge Management API Test Server",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/knowledge/advanced/search")
async def advanced_knowledge_search(
    query: str,
    category: Optional[str] = None,
    limit: int = 10
):
    """고급 스마트 검색"""
    try:
        # 간단한 검색 시뮬레이션
        results = []
        for doc in test_documents:
            # 제목이나 태그에서 검색
            if (query.lower() in doc["title"].lower() or 
                any(query.lower() in tag.lower() for tag in doc["tags"])):
                if not category or doc["category"] == category:
                    results.append({
                        **doc,
                        "similarity_score": random.uniform(0.7, 0.95)
                    })
        
        # 유사도 기준 정렬
        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        
        return {
            "success": True,
            "query": query,
            "total_results": len(results),
            "results": results[:limit]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/api/knowledge/advanced/document/{document_id}/analytics")
async def get_document_analytics(document_id: str):
    """문서 상세 분석"""
    try:
        # 문서 찾기
        doc = next((d for d in test_documents if d["id"] == document_id), None)
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # 관련 문서 찾기
        related_docs = [d for d in test_documents if d["id"] != document_id and d["category"] == doc["category"]][:3]
        
        analytics = {
            "document_info": doc,
            "related_documents": related_docs,
            "usage_pattern": {
                "total_usage": doc["usage_count"],
                "average_rating": doc["rating"],
                "last_accessed": doc["upload_date"],
                "popularity_rank": test_documents.index(doc) + 1,
                "usage_trend": "increasing"
            },
            "recommendations": [
                {
                    "type": "related_documents",
                    "title": "관련 문서",
                    "description": f"{doc['category']} 카테고리의 유사한 문서들을 확인해보세요."
                },
                {
                    "type": "update",
                    "title": "정기 검토",
                    "description": "이 문서를 정기적으로 검토하여 최신 정보를 유지하세요."
                }
            ]
        }
        
        return {
            "success": True,
            "document_id": document_id,
            "analytics": analytics
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics failed: {str(e)}")

@app.get("/api/knowledge/advanced/statistics")
async def get_advanced_knowledge_statistics():
    """고급 지식 베이스 통계"""
    try:
        # 카테고리별 분포
        category_distribution = {}
        for doc in test_documents:
            category_distribution[doc["category"]] = category_distribution.get(doc["category"], 0) + 1
        
        # 파일 타입 분포
        file_type_distribution = {}
        for doc in test_documents:
            file_type_distribution[doc["file_type"]] = file_type_distribution.get(doc["file_type"], 0) + 1
        
        stats = {
            "total_documents": len(test_documents),
            "category_distribution": category_distribution,
            "file_type_distribution": file_type_distribution,
            "average_confidence_score": round(sum(doc["confidence_score"] for doc in test_documents) / len(test_documents), 2),
            "recent_uploads_30_days": len(test_documents),  # 모든 문서가 최근 업로드
            "total_usage_count": sum(doc["usage_count"] for doc in test_documents),
            "average_rating": round(sum(doc["rating"] for doc in test_documents) / len(test_documents), 2),
            "categories": {
                "safety_guidelines": "안전 가이드라인",
                "welfare_info": "복지 정보", 
                "labor_law": "노동법",
                "union_policy": "조합 정책",
                "negotiation_materials": "협의 자료",
                "training_materials": "교육 자료"
            }
        }
        
        return {
            "success": True,
            "statistics": stats,
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Statistics failed: {str(e)}")

@app.get("/api/knowledge/advanced/dashboard")
async def get_knowledge_dashboard_data():
    """지식 관리 대시보드 데이터"""
    try:
        # 통계 데이터
        stats = await get_advanced_knowledge_statistics()
        
        # 최근 활동
        recent_activity = [
            {
                "type": "upload",
                "title": "새 문서 업로드",
                "description": "안전 가이드라인 v2.1",
                "timestamp": datetime.now().isoformat(),
                "category": "safety_guidelines"
            },
            {
                "type": "analysis",
                "title": "AI 분석 완료", 
                "description": f"{len(test_documents)}개 문서 분석 완료",
                "timestamp": (datetime.now() - timedelta(minutes=30)).isoformat(),
                "category": "system"
            },
            {
                "type": "recommendation",
                "title": "새 추천사항",
                "description": "노동법 카테고리 문서 보강 필요",
                "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
                "category": "recommendation"
            }
        ]
        
        # 트렌드 데이터
        trend_data = {
            "upload_trend": [
                {"date": "2024-01-10", "count": 5},
                {"date": "2024-01-11", "count": 8},
                {"date": "2024-01-12", "count": 12},
                {"date": "2024-01-13", "count": 7},
                {"date": "2024-01-14", "count": 15},
                {"date": "2024-01-15", "count": 10}
            ],
            "category_popularity": [
                {"category": "training_materials", "score": 85},
                {"category": "safety_guidelines", "score": 72},
                {"category": "welfare_info", "score": 68},
                {"category": "labor_law", "score": 45},
                {"category": "union_policy", "score": 38},
                {"category": "negotiation_materials", "score": 28}
            ]
        }
        
        return {
            "success": True,
            "dashboard": {
                "statistics": stats["statistics"],
                "recent_activity": recent_activity,
                "trends": trend_data,
                "system_health": {
                    "status": "healthy",
                    "ai_model_status": "active",
                    "last_backup": (datetime.now() - timedelta(hours=6)).isoformat(),
                    "storage_usage": "68%"
                }
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard data failed: {str(e)}")

@app.post("/api/knowledge/advanced/real-time/upload")
async def real_time_knowledge_upload(file: UploadFile = File(...)):
    """실시간 지식 업로드 및 분석"""
    try:
        # 파일 정보 추출
        content = await file.read()
        
        # AI 분석 시뮬레이션
        analysis_result = {
            "file_info": {
                "filename": file.filename,
                "size": len(content),
                "upload_time": datetime.now().isoformat()
            },
            "ai_analysis": {
                "category": "training_materials",
                "confidence": round(random.uniform(0.8, 0.95), 2),
                "key_topics": ["교육", "안전", "절차"],
                "summary": f"{file.filename}에 대한 AI 분석이 완료되었습니다.",
                "complexity": random.choice(["simple", "medium", "complex"]),
                "estimated_read_time": f"{random.randint(3, 15)}분"
            },
            "recommendations": [
                {
                    "type": "categorization",
                    "message": "교육 자료 카테고리로 분류를 제안합니다."
                },
                {
                    "type": "tagging", 
                    "message": "교육, 안전, 절차 태그를 추가하는 것을 권장합니다."
                }
            ]
        }
        
        return {
            "success": True,
            "message": "File uploaded and analyzed successfully",
            "analysis": analysis_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.get("/api/knowledge/advanced/categories")
async def get_knowledge_categories():
    """지식 카테고리 정보"""
    categories = {
        "labor_law": {
            "name": "노동법",
            "subcategories": ["근로기준법", "산업안전보건법", "최저임금법", "근로복지법"],
            "keywords": ["노동", "근로", "임금", "근로기준법", "최저임금", "산업안전", "근로복지"]
        },
        "union_policy": {
            "name": "조합 정책",
            "subcategories": ["조합원 규정", "복지 정책", "교육 정책", "협의 정책"],
            "keywords": ["조합", "정책", "규정", "조합원", "조합장", "총회", "이사회"]
        },
        "safety_guidelines": {
            "name": "안전 가이드라인",
            "subcategories": ["안전 규정", "작업 매뉴얼", "응급 대응", "교육 자료"],
            "keywords": ["안전", "사고", "보호구", "안전교육", "작업매뉴얼", "응급", "구급"]
        },
        "welfare_info": {
            "name": "복지 정보",
            "subcategories": ["의료 혜택", "교육 지원", "문화 혜택", "금융 지원"],
            "keywords": ["복지", "혜택", "의료", "교육", "문화", "금융", "지원", "보험"]
        },
        "negotiation_materials": {
            "name": "협의 자료",
            "subcategories": ["협의 기록", "합의 사항", "쟁점 사항", "후속 조치"],
            "keywords": ["협의", "시공사", "합의", "쟁점", "협상", "대화", "회의"]
        },
        "training_materials": {
            "name": "교육 자료",
            "subcategories": ["기술 교육", "안전 교육", "법규 교육", "리더십 교육"],
            "keywords": ["교육", "훈련", "강의", "학습", "기술", "리더십", "역량"]
        }
    }
    
    return {
        "success": True,
        "categories": categories
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001) 