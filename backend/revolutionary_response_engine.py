#!/usr/bin/env python3
"""
혁신적인 응답 엔진 - 다양한 백엔드 기능을 프론트엔드에 동적으로 표시
Revolutionary Response Engine - Dynamic Frontend Display of Backend Features

Features:
- 다양한 응답 타입별 맞춤형 렌더링
- 가독성 최적화된 구조화된 출력
- 인터랙티브 요소 포함
- 실시간 데이터 시각화
- 한국어 특화 표시 방식
"""

import json
import re
import time
from datetime import datetime
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, asdict
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class ResponseType(Enum):
    """응답 타입"""
    TEXT = "text"
    ANALYSIS = "analysis"
    CHART = "chart"
    TABLE = "table"
    LIST = "list"
    CODE = "code"
    IMAGE = "image"
    INTERACTIVE = "interactive"
    TIMELINE = "timeline"
    COMPARISON = "comparison"
    STEP_BY_STEP = "step_by_step"
    SUMMARY = "summary"
    DETAILED = "detailed"

class ContentFormat(Enum):
    """콘텐츠 포맷"""
    MARKDOWN = "markdown"
    HTML = "html"
    JSON = "json"
    XML = "xml"
    CSV = "csv"
    PLAIN = "plain"

@dataclass
class ResponseComponent:
    """응답 컴포넌트"""
    type: ResponseType
    title: str
    content: Any
    format: ContentFormat = ContentFormat.MARKDOWN
    metadata: Dict[str, Any] = None
    interactive: bool = False
    priority: int = 1

@dataclass
class StructuredResponse:
    """구조화된 응답"""
    main_content: str
    components: List[ResponseComponent]
    metadata: Dict[str, Any]
    display_mode: str = "adaptive"
    total_processing_time: float = 0.0

class RevolutionaryResponseEngine:
    """혁신적인 응답 엔진"""
    
    def __init__(self):
        self.response_templates = self._initialize_templates()
        self.formatting_rules = self._initialize_formatting_rules()
        self.visualization_configs = self._initialize_visualization_configs()
        
    def _initialize_templates(self) -> Dict[str, Dict]:
        """응답 템플릿 초기화"""
        return {
            "analysis": {
                "template": """
## 📊 분석 결과

### 🎯 핵심 인사이트
{insights}

### 📈 주요 지표
{metrics}

### 🔍 상세 분석
{detailed_analysis}

### 💡 추천 사항
{recommendations}
                """,
                "components": ["insights", "metrics", "detailed_analysis", "recommendations"]
            },
            "comparison": {
                "template": """
## ⚖️ 비교 분석

### 📋 비교 항목
{comparison_items}

### 📊 비교 결과
{comparison_results}

### 🏆 최종 평가
{final_assessment}
                """,
                "components": ["comparison_items", "comparison_results", "final_assessment"]
            },
            "step_by_step": {
                "template": """
## 🚀 단계별 가이드

{steps}

### ✅ 완료 체크리스트
{checklist}
                """,
                "components": ["steps", "checklist"]
            },
            "data_visualization": {
                "template": """
## 📊 데이터 시각화

### 📈 차트
{charts}

### 📋 데이터 테이블
{tables}

### 📝 요약 통계
{summary_stats}
                """,
                "components": ["charts", "tables", "summary_stats"]
            }
        }
    
    def _initialize_formatting_rules(self) -> Dict[str, Dict]:
        """포맷팅 규칙 초기화"""
        return {
            "korean_text": {
                "paragraph_spacing": 2,
                "bullet_style": "•",
                "number_style": "1.",
                "emphasis_markers": ["**", "*", "`"]
            },
            "code": {
                "syntax_highlighting": True,
                "line_numbers": True,
                "copy_button": True
            },
            "table": {
                "responsive": True,
                "sortable": True,
                "searchable": True,
                "pagination": True
            },
            "chart": {
                "interactive": True,
                "responsive": True,
                "export_options": ["png", "svg", "pdf"]
            }
        }
    
    def _initialize_visualization_configs(self) -> Dict[str, Dict]:
        """시각화 설정 초기화"""
        return {
            "bar_chart": {
                "type": "bar",
                "responsive": True,
                "animation": True,
                "colors": ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"]
            },
            "line_chart": {
                "type": "line",
                "responsive": True,
                "animation": True,
                "smooth": True
            },
            "pie_chart": {
                "type": "pie",
                "responsive": True,
                "animation": True,
                "donut": True
            },
            "table": {
                "type": "table",
                "responsive": True,
                "stripe": True,
                "hover": True
            }
        }
    
    def process_backend_response(self, backend_data: Dict[str, Any], response_type: str = "auto") -> StructuredResponse:
        """백엔드 응답을 프론트엔드용으로 변환"""
        start_time = time.time()
        
        try:
            # 응답 타입 자동 감지
            if response_type == "auto":
                response_type = self._detect_response_type(backend_data)
            
            # 메인 콘텐츠 생성
            main_content = self._generate_main_content(backend_data, response_type)
            
            # 컴포넌트 생성
            components = self._generate_components(backend_data, response_type)
            
            # 메타데이터 생성
            metadata = self._generate_metadata(backend_data, response_type)
            
            processing_time = time.time() - start_time
            
            return StructuredResponse(
                main_content=main_content,
                components=components,
                metadata=metadata,
                display_mode="adaptive",
                total_processing_time=processing_time
            )
            
        except Exception as e:
            logger.error(f"응답 처리 실패: {e}")
            return self._create_fallback_response(backend_data, str(e))
    
    def _detect_response_type(self, data: Dict[str, Any]) -> str:
        """응답 타입 자동 감지"""
        # 키워드 기반 감지
        content_keys = list(data.keys())
        
        if any(key in content_keys for key in ['analysis', 'insights', 'metrics']):
            return "analysis"
        elif any(key in content_keys for key in ['comparison', 'vs', 'compare']):
            return "comparison"
        elif any(key in content_keys for key in ['steps', 'guide', 'tutorial']):
            return "step_by_step"
        elif any(key in content_keys for key in ['chart', 'graph', 'visualization']):
            return "data_visualization"
        elif any(key in content_keys for key in ['code', 'script', 'function']):
            return "code"
        else:
            return "text"
    
    def _generate_main_content(self, data: Dict[str, Any], response_type: str) -> str:
        """메인 콘텐츠 생성"""
        template = self.response_templates.get(response_type, self.response_templates["analysis"])
        
        # 데이터를 템플릿에 맞게 변환
        formatted_content = self._format_content_for_template(data, template)
        
        return formatted_content
    
    def _generate_components(self, data: Dict[str, Any], response_type: str) -> List[ResponseComponent]:
        """컴포넌트 생성"""
        components = []
        
        # 분석 결과 컴포넌트
        if 'analysis' in data:
            components.append(ResponseComponent(
                type=ResponseType.ANALYSIS,
                title="📊 분석 결과",
                content=data['analysis'],
                format=ContentFormat.MARKDOWN,
                priority=1
            ))
        
        # 차트 컴포넌트
        if 'chart_data' in data:
            components.append(ResponseComponent(
                type=ResponseType.CHART,
                title="📈 데이터 차트",
                content=data['chart_data'],
                format=ContentFormat.JSON,
                interactive=True,
                priority=2
            ))
        
        # 테이블 컴포넌트
        if 'table_data' in data:
            components.append(ResponseComponent(
                type=ResponseType.TABLE,
                title="📋 데이터 테이블",
                content=data['table_data'],
                format=ContentFormat.JSON,
                interactive=True,
                priority=3
            ))
        
        # 코드 컴포넌트
        if 'code' in data:
            components.append(ResponseComponent(
                type=ResponseType.CODE,
                title="💻 코드",
                content=data['code'],
                format=ContentFormat.PLAIN,
                priority=4
            ))
        
        # 단계별 가이드 컴포넌트
        if 'steps' in data:
            components.append(ResponseComponent(
                type=ResponseType.STEP_BY_STEP,
                title="🚀 단계별 가이드",
                content=data['steps'],
                format=ContentFormat.MARKDOWN,
                priority=1
            ))
        
        return components
    
    def _format_content_for_template(self, data: Dict[str, Any], template: Dict) -> str:
        """템플릿에 맞게 콘텐츠 포맷팅"""
        template_str = template["template"]
        components = template["components"]
        
        formatted_data = {}
        for component in components:
            if component in data:
                formatted_data[component] = self._format_component_content(data[component], component)
            else:
                formatted_data[component] = f"*{component} 정보가 없습니다*"
        
        return template_str.format(**formatted_data)
    
    def _format_component_content(self, content: Any, component_type: str) -> str:
        """컴포넌트별 콘텐츠 포맷팅"""
        if component_type == "insights":
            return self._format_insights(content)
        elif component_type == "metrics":
            return self._format_metrics(content)
        elif component_type == "steps":
            return self._format_steps(content)
        elif component_type == "recommendations":
            return self._format_recommendations(content)
        else:
            return str(content)
    
    def _format_insights(self, insights: Any) -> str:
        """인사이트 포맷팅"""
        if isinstance(insights, list):
            formatted = []
            for i, insight in enumerate(insights, 1):
                formatted.append(f"**{i}.** {insight}")
            return "\n".join(formatted)
        return str(insights)
    
    def _format_metrics(self, metrics: Any) -> str:
        """메트릭 포맷팅"""
        if isinstance(metrics, dict):
            formatted = []
            for key, value in metrics.items():
                formatted.append(f"- **{key}**: {value}")
            return "\n".join(formatted)
        return str(metrics)
    
    def _format_steps(self, steps: Any) -> str:
        """단계 포맷팅"""
        if isinstance(steps, list):
            formatted = []
            for i, step in enumerate(steps, 1):
                if isinstance(step, dict):
                    title = step.get('title', f'단계 {i}')
                    description = step.get('description', '')
                    formatted.append(f"### {i}. {title}\n{description}\n")
                else:
                    formatted.append(f"### {i}. {step}\n")
            return "\n".join(formatted)
        return str(steps)
    
    def _format_recommendations(self, recommendations: Any) -> str:
        """추천사항 포맷팅"""
        if isinstance(recommendations, list):
            formatted = []
            for rec in recommendations:
                formatted.append(f"💡 {rec}")
            return "\n".join(formatted)
        return str(recommendations)
    
    def _generate_metadata(self, data: Dict[str, Any], response_type: str) -> Dict[str, Any]:
        """메타데이터 생성"""
        return {
            "response_type": response_type,
            "generated_at": datetime.now().isoformat(),
            "data_sources": list(data.keys()),
            "component_count": len([k for k in data.keys() if k in ['analysis', 'chart_data', 'table_data', 'code', 'steps']]),
            "interactive_elements": self._count_interactive_elements(data),
            "estimated_reading_time": self._estimate_reading_time(data)
        }
    
    def _count_interactive_elements(self, data: Dict[str, Any]) -> int:
        """인터랙티브 요소 개수 계산"""
        interactive_keys = ['chart_data', 'table_data', 'interactive_content']
        return sum(1 for key in interactive_keys if key in data)
    
    def _estimate_reading_time(self, data: Dict[str, Any]) -> int:
        """예상 읽기 시간 계산 (분)"""
        total_text = ""
        for value in data.values():
            if isinstance(value, str):
                total_text += value
            elif isinstance(value, (list, dict)):
                total_text += str(value)
        
        # 한국어 기준 분당 200자로 계산
        return max(1, len(total_text) // 200)
    
    def _create_fallback_response(self, data: Dict[str, Any], error: str) -> StructuredResponse:
        """폴백 응답 생성"""
        return StructuredResponse(
            main_content=f"""
## ⚠️ 응답 처리 중 오류 발생

**오류 내용**: {error}

**원본 데이터**:
```json
{json.dumps(data, ensure_ascii=False, indent=2)}
```

죄송합니다. 응답을 처리하는 중에 문제가 발생했습니다. 
다시 시도해주시거나 다른 방식으로 질문해주세요.
            """,
            components=[],
            metadata={
                "response_type": "error",
                "error": error,
                "generated_at": datetime.now().isoformat()
            }
        )
    
    def create_interactive_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """인터랙티브 응답 생성"""
        return {
            "type": "interactive",
            "content": data,
            "ui_components": self._generate_ui_components(data),
            "interactions": self._define_interactions(data)
        }
    
    def _generate_ui_components(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """UI 컴포넌트 생성"""
        components = []
        
        # 차트 컴포넌트
        if 'chart_data' in data:
            components.append({
                "type": "chart",
                "config": self.visualization_configs["bar_chart"],
                "data": data['chart_data']
            })
        
        # 테이블 컴포넌트
        if 'table_data' in data:
            components.append({
                "type": "table",
                "config": self.visualization_configs["table"],
                "data": data['table_data']
            })
        
        return components
    
    def _define_interactions(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """상호작용 정의"""
        interactions = []
        
        # 필터링 상호작용
        if 'table_data' in data:
            interactions.append({
                "type": "filter",
                "target": "table",
                "options": ["전체", "최신순", "인기순"]
            })
        
        # 정렬 상호작용
        if 'chart_data' in data:
            interactions.append({
                "type": "sort",
                "target": "chart",
                "options": ["오름차순", "내림차순"]
            })
        
        return interactions

# 전역 인스턴스
revolutionary_response_engine = RevolutionaryResponseEngine()
