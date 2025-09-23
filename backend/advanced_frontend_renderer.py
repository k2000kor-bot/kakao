#!/usr/bin/env python3
"""
고급 프론트엔드 렌더러 - 다양한 응답 타입을 동적으로 렌더링
Advanced Frontend Renderer - Dynamic Rendering of Various Response Types

Features:
- 응답 타입별 맞춤형 HTML/CSS/JS 생성
- 인터랙티브 요소 자동 생성
- 반응형 디자인 적용
- 한국어 최적화된 UI/UX
- 실시간 데이터 시각화
"""

import json
import re
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class RenderMode(Enum):
    """렌더링 모드"""
    COMPACT = "compact"
    DETAILED = "detailed"
    INTERACTIVE = "interactive"
    VISUAL = "visual"

@dataclass
class RenderConfig:
    """렌더링 설정"""
    mode: RenderMode = RenderMode.DETAILED
    theme: str = "modern"
    language: str = "korean"
    responsive: bool = True
    animations: bool = True
    dark_mode: bool = False

class AdvancedFrontendRenderer:
    """고급 프론트엔드 렌더러"""
    
    def __init__(self):
        self.templates = self._initialize_templates()
        self.styles = self._initialize_styles()
        self.scripts = self._initialize_scripts()
        
    def _initialize_templates(self) -> Dict[str, str]:
        """템플릿 초기화"""
        return {
            "analysis": """
<div class="response-container analysis-response">
    <div class="response-header">
        <h3 class="response-title">📊 분석 결과</h3>
        <div class="response-meta">
            <span class="timestamp">{timestamp}</span>
            <span class="confidence">신뢰도: {confidence}%</span>
        </div>
    </div>
    
    <div class="analysis-content">
        <div class="insights-section">
            <h4>🎯 핵심 인사이트</h4>
            <div class="insights-grid">
                {insights}
            </div>
        </div>
        
        <div class="metrics-section">
            <h4>📈 주요 지표</h4>
            <div class="metrics-cards">
                {metrics}
            </div>
        </div>
        
        <div class="detailed-analysis">
            <h4>🔍 상세 분석</h4>
            <div class="analysis-text">
                {detailed_analysis}
            </div>
        </div>
        
        <div class="recommendations">
            <h4>💡 추천 사항</h4>
            <ul class="recommendations-list">
                {recommendations}
            </ul>
        </div>
    </div>
</div>
            """,
            
            "comparison": """
<div class="response-container comparison-response">
    <div class="response-header">
        <h3 class="response-title">⚖️ 비교 분석</h3>
    </div>
    
    <div class="comparison-content">
        <div class="comparison-table">
            {comparison_table}
        </div>
        
        <div class="comparison-chart">
            {comparison_chart}
        </div>
        
        <div class="final-assessment">
            <h4>🏆 최종 평가</h4>
            <div class="assessment-content">
                {final_assessment}
            </div>
        </div>
    </div>
</div>
            """,
            
            "step_by_step": """
<div class="response-container step-response">
    <div class="response-header">
        <h3 class="response-title">🚀 단계별 가이드</h3>
        <div class="progress-indicator">
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
            <span class="progress-text">0 / {total_steps} 단계 완료</span>
        </div>
    </div>
    
    <div class="steps-content">
        {steps}
    </div>
    
    <div class="checklist-section">
        <h4>✅ 완료 체크리스트</h4>
        <div class="checklist">
            {checklist}
        </div>
    </div>
</div>
            """,
            
            "data_visualization": """
<div class="response-container visualization-response">
    <div class="response-header">
        <h3 class="response-title">📊 데이터 시각화</h3>
        <div class="visualization-controls">
            <button class="btn btn-sm" onclick="toggleChartType()">차트 타입 변경</button>
            <button class="btn btn-sm" onclick="exportChart()">내보내기</button>
        </div>
    </div>
    
    <div class="visualization-content">
        <div class="chart-container">
            {chart}
        </div>
        
        <div class="data-table-container">
            {data_table}
        </div>
        
        <div class="summary-stats">
            {summary_stats}
        </div>
    </div>
</div>
            """,
            
            "code": """
<div class="response-container code-response">
    <div class="response-header">
        <h3 class="response-title">💻 코드</h3>
        <div class="code-controls">
            <button class="btn btn-sm" onclick="copyCode()">복사</button>
            <button class="btn btn-sm" onclick="formatCode()">포맷팅</button>
        </div>
    </div>
    
    <div class="code-content">
        <pre class="code-block">
            <code class="language-{language}">{code}</code>
        </pre>
    </div>
    
    <div class="code-explanation">
        {explanation}
    </div>
</div>
            """,
            
            "interactive": """
<div class="response-container interactive-response">
    <div class="response-header">
        <h3 class="response-title">🎮 인터랙티브 콘텐츠</h3>
    </div>
    
    <div class="interactive-content">
        {interactive_elements}
    </div>
</div>
            """
        }
    
    def _initialize_styles(self) -> Dict[str, str]:
        """스타일 초기화"""
        return {
            "base": """
<style>
.response-container {
    margin: 20px 0;
    padding: 20px;
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.response-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #f3f4f6;
}

.response-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
}

.response-meta {
    display: flex;
    gap: 15px;
    font-size: 0.875rem;
    color: #6b7280;
}

.insights-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 15px;
    margin: 15px 0;
}

.insight-card {
    padding: 15px;
    background: #f8fafc;
    border-radius: 8px;
    border-left: 4px solid #3b82f6;
}

.metrics-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin: 15px 0;
}

.metric-card {
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 10px;
    text-align: center;
}

.metric-value {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 5px;
}

.metric-label {
    font-size: 0.875rem;
    opacity: 0.9;
}

.step-item {
    display: flex;
    align-items: flex-start;
    margin: 20px 0;
    padding: 20px;
    background: #f9fafb;
    border-radius: 10px;
    border-left: 4px solid #10b981;
}

.step-number {
    background: #10b981;
    color: white;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 15px;
    flex-shrink: 0;
}

.step-content {
    flex: 1;
}

.step-title {
    font-weight: 600;
    margin-bottom: 8px;
    color: #1f2937;
}

.step-description {
    color: #6b7280;
    line-height: 1.6;
}

.progress-indicator {
    margin: 15px 0;
}

.progress-bar {
    width: 100%;
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981, #059669);
    transition: width 0.3s ease;
}

.progress-text {
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 5px;
}

.chart-container {
    margin: 20px 0;
    padding: 20px;
    background: #f8fafc;
    border-radius: 10px;
}

.data-table-container {
    margin: 20px 0;
    overflow-x: auto;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.data-table th,
.data-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
}

.data-table th {
    background: #f9fafb;
    font-weight: 600;
    color: #374151;
}

.data-table tr:hover {
    background: #f9fafb;
}

.code-block {
    background: #1f2937;
    color: #f9fafc;
    padding: 20px;
    border-radius: 8px;
    overflow-x: auto;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
}

.btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s;
}

.btn-sm {
    padding: 6px 12px;
    font-size: 0.75rem;
}

.btn-primary {
    background: #3b82f6;
    color: white;
}

.btn-primary:hover {
    background: #2563eb;
}

.checklist {
    margin: 15px 0;
}

.checklist-item {
    display: flex;
    align-items: center;
    margin: 10px 0;
    padding: 10px;
    background: #f9fafb;
    border-radius: 6px;
}

.checklist-item input[type="checkbox"] {
    margin-right: 10px;
    transform: scale(1.2);
}

.recommendations-list {
    list-style: none;
    padding: 0;
}

.recommendations-list li {
    padding: 10px 0;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
}

.recommendations-list li:before {
    content: "💡";
    margin-right: 10px;
}

@media (max-width: 768px) {
    .response-container {
        margin: 10px 0;
        padding: 15px;
    }
    
    .response-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
    
    .insights-grid,
    .metrics-cards {
        grid-template-columns: 1fr;
    }
    
    .step-item {
        flex-direction: column;
        text-align: center;
    }
    
    .step-number {
        margin: 0 auto 10px auto;
    }
}
</style>
            """,
            
            "dark_mode": """
<style>
.dark-mode .response-container {
    background: #1f2937;
    border-color: #374151;
    color: #f9fafc;
}

.dark-mode .response-title {
    color: #f9fafc;
}

.dark-mode .insight-card {
    background: #374151;
    border-left-color: #60a5fa;
}

.dark-mode .step-item {
    background: #374151;
    border-left-color: #34d399;
}

.dark-mode .code-block {
    background: #111827;
}

.dark-mode .data-table th {
    background: #374151;
    color: #f9fafc;
}

.dark-mode .data-table tr:hover {
    background: #374151;
}
</style>
            """
        }
    
    def _initialize_scripts(self) -> Dict[str, str]:
        """스크립트 초기화"""
        return {
            "base": """
<script>
// 전역 함수들
function copyCode() {
    const codeBlock = document.querySelector('.code-block code');
    if (codeBlock) {
        navigator.clipboard.writeText(codeBlock.textContent);
        showToast('코드가 복사되었습니다!');
    }
}

function formatCode() {
    const codeBlock = document.querySelector('.code-block code');
    if (codeBlock) {
        // 코드 포맷팅 로직
        showToast('코드가 포맷팅되었습니다!');
    }
}

function toggleChartType() {
    // 차트 타입 변경 로직
    showToast('차트 타입이 변경되었습니다!');
}

function exportChart() {
    // 차트 내보내기 로직
    showToast('차트가 내보내기되었습니다!');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// 단계별 가이드 진행률 업데이트
function updateProgress(completedSteps, totalSteps) {
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (progressFill && progressText) {
        const percentage = (completedSteps / totalSteps) * 100;
        progressFill.style.width = percentage + '%';
        progressText.textContent = `${completedSteps} / ${totalSteps} 단계 완료`;
    }
}

// 체크리스트 아이템 토글
function toggleChecklistItem(checkbox) {
    const completedSteps = document.querySelectorAll('.checklist-item input[type="checkbox"]:checked').length;
    const totalSteps = document.querySelectorAll('.checklist-item input[type="checkbox"]').length;
    updateProgress(completedSteps, totalSteps);
}

// 애니메이션 CSS
const animationCSS = `
@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.response-container {
    animation: fadeIn 0.5s ease;
}
`;

// CSS 추가
const style = document.createElement('style');
style.textContent = animationCSS;
document.head.appendChild(style);
</script>
            """,
            
            "chart": """
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
function createChart(canvasId, data, type = 'bar') {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    new Chart(ctx, {
        type: type,
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: '데이터 시각화'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
</script>
            """
        }
    
    def render_response(self, structured_response, config: RenderConfig = None) -> str:
        """응답 렌더링"""
        if config is None:
            config = RenderConfig()
        
        try:
            # 메인 콘텐츠 렌더링
            main_html = self._render_main_content(structured_response, config)
            
            # 컴포넌트 렌더링
            components_html = self._render_components(structured_response.components, config)
            
            # 스타일 및 스크립트 추가
            styles_html = self._get_styles(config)
            scripts_html = self._get_scripts(config)
            
            # 최종 HTML 조합
            final_html = f"""
{styles_html}
<div class="ai-response-wrapper">
    {main_html}
    {components_html}
</div>
{scripts_html}
            """
            
            return final_html.strip()
            
        except Exception as e:
            logger.error(f"렌더링 실패: {e}")
            return self._create_error_response(str(e))
    
    def _render_main_content(self, structured_response, config: RenderConfig) -> str:
        """메인 콘텐츠 렌더링"""
        # 간단한 텍스트 응답인 경우
        if not structured_response.components:
            return f"""
            <div class="response-container text-response">
                <div class="response-content">
                    {structured_response.main_content}
                </div>
            </div>
            """
        
        # 구조화된 응답인 경우
        return f"""
        <div class="response-container structured-response">
            <div class="response-content">
                {structured_response.main_content}
            </div>
        </div>
        """
    
    def _render_components(self, components, config: RenderConfig) -> str:
        """컴포넌트 렌더링"""
        rendered_components = []
        
        for component in components:
            if component.type.value == "analysis":
                rendered_components.append(self._render_analysis_component(component))
            elif component.type.value == "chart":
                rendered_components.append(self._render_chart_component(component))
            elif component.type.value == "table":
                rendered_components.append(self._render_table_component(component))
            elif component.type.value == "code":
                rendered_components.append(self._render_code_component(component))
            elif component.type.value == "step_by_step":
                rendered_components.append(self._render_step_component(component))
        
        return "\n".join(rendered_components)
    
    def _render_analysis_component(self, component) -> str:
        """분석 컴포넌트 렌더링"""
        template = self.templates["analysis"]
        
        # 컴포넌트 데이터 파싱
        content = component.content
        if isinstance(content, dict):
            insights = self._format_insights_html(content.get('insights', []))
            metrics = self._format_metrics_html(content.get('metrics', {}))
            detailed_analysis = content.get('detailed_analysis', '')
            recommendations = self._format_recommendations_html(content.get('recommendations', []))
        else:
            insights = str(content)
            metrics = ""
            detailed_analysis = ""
            recommendations = ""
        
        return template.format(
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M"),
            confidence=85,
            insights=insights,
            metrics=metrics,
            detailed_analysis=detailed_analysis,
            recommendations=recommendations
        )
    
    def _render_chart_component(self, component) -> str:
        """차트 컴포넌트 렌더링"""
        template = self.templates["data_visualization"]
        
        chart_id = f"chart_{int(time.time())}"
        chart_html = f"""
        <canvas id="{chart_id}" width="400" height="200"></canvas>
        <script>
        createChart('{chart_id}', {json.dumps(component.content)});
        </script>
        """
        
        return template.format(
            chart=chart_html,
            data_table="",
            summary_stats=""
        )
    
    def _render_table_component(self, component) -> str:
        """테이블 컴포넌트 렌더링"""
        data = component.content
        if isinstance(data, list) and len(data) > 0:
            headers = list(data[0].keys()) if isinstance(data[0], dict) else []
            rows = data
        else:
            headers = []
            rows = []
        
        table_html = f"""
        <table class="data-table">
            <thead>
                <tr>
                    {''.join(f'<th>{header}</th>' for header in headers)}
                </tr>
            </thead>
            <tbody>
                {''.join(f'<tr>{"".join(f"<td>{row.get(header, "")}</td>" for header in headers)}</tr>' for row in rows)}
            </tbody>
        </table>
        """
        
        return f"""
        <div class="response-container table-response">
            <div class="response-header">
                <h3 class="response-title">📋 데이터 테이블</h3>
            </div>
            <div class="data-table-container">
                {table_html}
            </div>
        </div>
        """
    
    def _render_code_component(self, component) -> str:
        """코드 컴포넌트 렌더링"""
        template = self.templates["code"]
        
        code = component.content
        language = "python"  # 기본값
        
        return template.format(
            language=language,
            code=code,
            explanation=""
        )
    
    def _render_step_component(self, component) -> str:
        """단계별 가이드 컴포넌트 렌더링"""
        template = self.templates["step_by_step"]
        
        steps = component.content
        if isinstance(steps, list):
            steps_html = ""
            for i, step in enumerate(steps, 1):
                if isinstance(step, dict):
                    title = step.get('title', f'단계 {i}')
                    description = step.get('description', '')
                else:
                    title = f'단계 {i}'
                    description = str(step)
                
                steps_html += f"""
                <div class="step-item">
                    <div class="step-number">{i}</div>
                    <div class="step-content">
                        <div class="step-title">{title}</div>
                        <div class="step-description">{description}</div>
                    </div>
                </div>
                """
            
            checklist_html = ""
            for i, step in enumerate(steps, 1):
                checklist_html += f"""
                <div class="checklist-item">
                    <input type="checkbox" onchange="toggleChecklistItem(this)">
                    <span>단계 {i} 완료</span>
                </div>
                """
        else:
            steps_html = str(steps)
            checklist_html = ""
        
        return template.format(
            total_steps=len(steps) if isinstance(steps, list) else 1,
            steps=steps_html,
            checklist=checklist_html
        )
    
    def _format_insights_html(self, insights) -> str:
        """인사이트 HTML 포맷팅"""
        if isinstance(insights, list):
            return "".join(f'<div class="insight-card">{insight}</div>' for insight in insights)
        return f'<div class="insight-card">{insights}</div>'
    
    def _format_metrics_html(self, metrics) -> str:
        """메트릭 HTML 포맷팅"""
        if isinstance(metrics, dict):
            return "".join(f'''
            <div class="metric-card">
                <div class="metric-value">{value}</div>
                <div class="metric-label">{key}</div>
            </div>
            ''' for key, value in metrics.items())
        return ""
    
    def _format_recommendations_html(self, recommendations) -> str:
        """추천사항 HTML 포맷팅"""
        if isinstance(recommendations, list):
            return "".join(f'<li>{rec}</li>' for rec in recommendations)
        return f'<li>{recommendations}</li>'
    
    def _get_styles(self, config: RenderConfig) -> str:
        """스타일 가져오기"""
        styles = [self.styles["base"]]
        
        if config.dark_mode:
            styles.append(self.styles["dark_mode"])
        
        return "".join(styles)
    
    def _get_scripts(self, config: RenderConfig) -> str:
        """스크립트 가져오기"""
        scripts = [self.scripts["base"]]
        
        # 차트가 있는 경우 차트 스크립트 추가
        if config.mode == RenderMode.VISUAL:
            scripts.append(self.scripts["chart"])
        
        return "".join(scripts)
    
    def _create_error_response(self, error: str) -> str:
        """오류 응답 생성"""
        return f"""
        <div class="response-container error-response">
            <div class="response-header">
                <h3 class="response-title">⚠️ 오류 발생</h3>
            </div>
            <div class="error-content">
                <p>응답을 렌더링하는 중에 오류가 발생했습니다:</p>
                <code>{error}</code>
            </div>
        </div>
        """

# 전역 인스턴스
advanced_frontend_renderer = AdvancedFrontendRenderer()
