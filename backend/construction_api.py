"""
시공사 선정 시스템 API 엔드포인트
"""

import os

from cors_config import get_cors_allow_origins
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import io
import json
import pandas as pd
from construction_company_analyzer import construction_analyzer, DecisionCriteria, EvaluationCriteria

app = FastAPI(title="Construction Company Selection API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_allow_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ComparisonDataModel(BaseModel):
    """비교집 데이터 모델"""
    companies: Dict[str, Any]
    project_info: Dict[str, Any]

class DecisionCriteriaModel(BaseModel):
    """의사결정 기준 모델"""
    project_type: str
    budget_range: List[int]  # [min, max]
    timeline: int
    priority_weights: Dict[str, float]
    mandatory_requirements: List[str]
    preferred_features: List[str] = []
    risk_tolerance: str = "medium"

class MessageGenerationRequest(BaseModel):
    """메시지 생성 요청 모델"""
    message_type: str  # recommendation, comparison, risk_analysis
    include_details: bool = True
    target_audience: str = "management"  # management, technical, general

@app.get("/")
async def root():
    return {"message": "Construction Company Selection API", "version": "1.0.0"}

@app.post("/api/upload_comparison_data")
async def upload_comparison_data(
    file: UploadFile = File(...),
    project_type: str = Form(...)
):
    """비교집 자료 업로드 및 처리"""
    try:
        # 파일 읽기
        content = await file.read()
        
        name = (file.filename or '').lower()
        if name.endswith('.json'):
            raw_data = json.loads(content.decode('utf-8'))
        elif name.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(content))
            raw_data = df.to_dict('records')
        elif name.endswith('.csv'):
            text: Optional[str] = None
            for enc in ('utf-8-sig', 'utf-8', 'cp949', 'euc-kr'):
                try:
                    text = content.decode(enc)
                    break
                except UnicodeDecodeError:
                    continue
            if text is None:
                text = content.decode('utf-8', errors='replace')
            df = pd.read_csv(io.StringIO(text))
            raw_data = df.to_dict('records')
        else:
            raise HTTPException(status_code=400, detail="지원하지 않는 파일 형식입니다.")
        
        # 데이터 처리
        processed_companies = construction_analyzer.process_comparison_data(raw_data)
        
        # 메모리에 저장 (실제 구현에서는 데이터베이스 사용)
        construction_analyzer.comparison_database = processed_companies
        
        return {
            "status": "success",
            "message": f"{len(processed_companies)}개 시공사 데이터 처리 완료",
            "companies": list(processed_companies.keys()),
            "processed_data": {
                company_id: {
                    "name": data.company_name,
                    "evaluation_scores": data.evaluation_scores,
                    "strengths": data.strengths,
                    "weaknesses": data.weaknesses,
                    "risk_factors": data.risk_factors
                }
                for company_id, data in processed_companies.items()
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"데이터 처리 중 오류: {str(e)}")

@app.post("/api/analyze_companies")
async def analyze_companies(request: DecisionCriteriaModel):
    """시공사 분석 및 의사결정 논리 생성"""
    try:
        # 저장된 비교 데이터 가져오기 (실제 구현에서는 데이터베이스에서)
        companies = construction_analyzer.comparison_database
        
        if not companies:
            raise HTTPException(status_code=400, detail="비교 데이터가 없습니다. 먼저 데이터를 업로드해주세요.")
        
        # 의사결정 기준 생성
        criteria = DecisionCriteria(
            project_type=request.project_type,
            budget_range=tuple(request.budget_range),
            timeline=request.timeline,
            priority_weights={
                EvaluationCriteria(k): v for k, v in request.priority_weights.items()
                if k in [e.value for e in EvaluationCriteria]
            },
            mandatory_requirements=request.mandatory_requirements,
            preferred_features=request.preferred_features,
            risk_tolerance=request.risk_tolerance
        )
        
        # 의사결정 논리 생성
        decision_logic = construction_analyzer.generate_decision_logic(companies, criteria)
        
        # 의사결정 이력에 저장
        construction_analyzer.decision_history.append(decision_logic)
        
        return {
            "status": "success",
            "analysis_result": decision_logic,
            "criteria_applied": {
                "project_type": request.project_type,
                "timeline": request.timeline,
                "priority_weights": request.priority_weights,
                "risk_tolerance": request.risk_tolerance
            },
            "companies_analyzed": len(companies)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"분석 중 오류: {str(e)}")

@app.post("/api/generate_message")
async def generate_message(request: MessageGenerationRequest):
    """일관된 논리 기반 메시지 생성"""
    try:
        companies = construction_analyzer.comparison_database
        
        if not companies:
            raise HTTPException(status_code=400, detail="분석 데이터가 없습니다.")
        
        # 최근 의사결정 논리 가져오기 (실제로는 세션/DB에서)
        if not construction_analyzer.decision_history:
            raise HTTPException(status_code=400, detail="의사결정 분석을 먼저 수행해주세요.")
        
        latest_decision = construction_analyzer.decision_history[-1]
        
        # 메시지 생성
        message_data = construction_analyzer.generate_consistent_message(
            latest_decision,
            companies,
            request.message_type
        )
        
        # 대상 청중에 맞게 메시지 조정
        if request.target_audience == "technical":
            message_data = _adjust_for_technical_audience(message_data)
        elif request.target_audience == "management":
            message_data = _adjust_for_management_audience(message_data)
        
        return {
            "status": "success",
            "message_data": message_data,
            "generation_info": {
                "message_type": request.message_type,
                "target_audience": request.target_audience,
                "include_details": request.include_details,
                "timestamp": message_data["timestamp"]
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"메시지 생성 중 오류: {str(e)}")

def _adjust_for_technical_audience(message_data: Dict) -> Dict:
    """기술진 대상 메시지 조정"""
    content = message_data["generated_content"]
    
    # 기술적 세부사항 강조
    if "content" in content:
        content["content"] += "\n\n## 🔧 기술적 검토사항\n"
        content["content"] += "- 기술사양 적합성 검증 필요\n"
        content["content"] += "- 시공방법론 상세 검토\n"
        content["content"] += "- 품질관리 체계 확인\n"
        content["technical_focus"] = True
    
    return message_data

def _adjust_for_management_audience(message_data: Dict) -> Dict:
    """경영진 대상 메시지 조정"""
    content = message_data["generated_content"]
    
    # 비즈니스 임팩트 강조
    if "content" in content:
        content["content"] += "\n\n## 💼 경영진 검토사항\n"
        content["content"] += "- ROI 및 비용효율성\n"
        content["content"] += "- 프로젝트 위험관리\n"
        content["content"] += "- 장기 파트너십 가능성\n"
        content["executive_summary"] = True
    
    return message_data

@app.get("/api/evaluation_criteria")
async def get_evaluation_criteria():
    """평가 기준 목록 조회"""
    criteria_info = {}
    
    for criteria in EvaluationCriteria:
        criteria_info[criteria.value] = {
            "name": criteria.value,
            "description": f"{criteria.value} 관련 평가 기준",
            "weight_range": [0.1, 0.3],
            "data_type": "numeric"
        }
    
    return {
        "criteria": criteria_info,
        "total_criteria": len(EvaluationCriteria),
        "weight_total": 1.0
    }

@app.get("/api/knowledge_base")
async def get_knowledge_base():
    """지식베이스 정보 조회"""
    return {
        "knowledge_base": construction_analyzer.knowledge_base,
        "last_updated": "2024-01-01",
        "version": "1.0"
    }

@app.post("/api/save_decision")
async def save_decision(decision_data: Dict[str, Any]):
    """의사결정 결과 저장"""
    try:
        # 의사결정 이력에 추가
        construction_analyzer.decision_history.append(decision_data)
        
        return {
            "status": "success",
            "message": "의사결정 결과가 저장되었습니다",
            "decision_id": len(construction_analyzer.decision_history),
            "timestamp": decision_data.get("timestamp")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"저장 중 오류: {str(e)}")

@app.get("/api/decision_history")
async def get_decision_history():
    """의사결정 이력 조회"""
    return {
        "history": construction_analyzer.decision_history,
        "total_decisions": len(construction_analyzer.decision_history)
    }

@app.delete("/api/reset_data")
async def reset_data():
    """데이터 초기화"""
    construction_analyzer.comparison_database.clear()
    construction_analyzer.decision_history.clear()
    
    return {
        "status": "success",
        "message": "모든 데이터가 초기화되었습니다"
    }

if __name__ == "__main__":
    import uvicorn

    _p = int(os.environ.get("CONSTRUCTION_API_PORT", os.environ.get("PORT", "8002")))
    uvicorn.run(app, host="0.0.0.0", port=_p) 