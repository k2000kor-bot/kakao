"""
CORBU AI Korean Language Engine - 한국어 특화 고급 언어 처리 엔진
"""
import re
import math
import json
import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Tuple, Union
from dataclasses import dataclass
from enum import Enum
import numpy as np

logger = logging.getLogger(__name__)

class KoreanMorphemeType(Enum):
    """한국어 형태소 유형"""
    NOUN = "명사"
    VERB = "동사"
    ADJECTIVE = "형용사"
    ADVERB = "부사"
    PARTICLE = "조사"
    ENDING = "어미"
    PREFIX = "접두사"
    SUFFIX = "접미사"
    ROOT = "어근"

class LogicalStructure(Enum):
    """논리적 구조 유형"""
    CAUSE_EFFECT = "인과관계"
    COMPARISON = "비교"
    CONTRAST = "대조"
    SEQUENCE = "순서"
    CONDITION = "조건"
    CONCESSION = "양보"
    PURPOSE = "목적"
    RESULT = "결과"
    EXAMPLE = "예시"
    DEFINITION = "정의"

@dataclass
class KoreanAnalysis:
    """한국어 분석 결과"""
    text: str
    morphemes: List[Dict[str, Any]]
    logical_structure: List[LogicalStructure]
    semantic_relations: List[Dict[str, Any]]
    coherence_score: float
    complexity_metrics: Dict[str, float]
    mathematical_relations: List[Dict[str, Any]]
    context_understanding: Dict[str, Any]

class KoreanLanguageEngine:
    """한국어 특화 고급 언어 처리 엔진"""
    
    def __init__(self):
        self.morpheme_patterns = self._initialize_morpheme_patterns()
        self.logical_connectors = self._initialize_logical_connectors()
        self.semantic_patterns = self._initialize_semantic_patterns()
        self.mathematical_patterns = self._initialize_mathematical_patterns()
        self.context_memory = {}
        
    def _initialize_morpheme_patterns(self) -> Dict[str, List[str]]:
        """형태소 패턴 초기화"""
        return {
            "noun_endings": [
                r'[가-힣]+(?:이|가|을|를|은|는|에|에서|로|으로|의|와|과|도|만|부터|까지)',
                r'[가-힣]+(?:들|님|씨|님들)'
            ],
            "verb_endings": [
                r'[가-힣]+(?:다|한다|한다|한다|한다|한다|한다|한다|한다|한다)',
                r'[가-힣]+(?:어|아|여|해|해|해|해|해|해|해)',
                r'[가-힣]+(?:고|며|면서|으면서|면서)',
                r'[가-힣]+(?:면|으면|면|으면|면|으면)'
            ],
            "adjective_endings": [
                r'[가-힣]+(?:다|하다|하다|하다|하다|하다|하다|하다|하다|하다)',
                r'[가-힣]+(?:은|는|을|를|이|가)',
                r'[가-힣]+(?:게|하게|하게|하게|하게|하게|하게|하게|하게|하게)'
            ],
            "particles": [
                r'(?:이|가|을|를|은|는|에|에서|로|으로|의|와|과|도|만|부터|까지|에게|한테|께|께서)',
                r'(?:처럼|같이|만큼|만치|치고|치고|치고|치고|치고|치고)'
            ]
        }
    
    def _initialize_logical_connectors(self) -> Dict[str, List[str]]:
        """논리적 연결어 초기화"""
        return {
            "cause_effect": [
                "때문에", "그래서", "따라서", "그러므로", "왜냐하면", "이유는",
                "원인은", "결과적으로", "그 결과", "그로 인해", "그 때문에"
            ],
            "comparison": [
                "비교하면", "비교해보면", "대비하여", "대조적으로", "반면에",
                "한편으로는", "다른 한편으로는", "이에 비해", "상대적으로"
            ],
            "contrast": [
                "하지만", "그러나", "그런데", "반면에", "다만", "단",
                "그럼에도 불구하고", "그러나", "그런데도", "그럼에도"
            ],
            "sequence": [
                "먼저", "다음으로", "그 다음", "마지막으로", "결국",
                "최종적으로", "단계적으로", "순서대로", "차례대로"
            ],
            "condition": [
                "만약", "만일", "만약에", "만일", "만약에", "만일",
                "만약", "만일", "만약에", "만일", "만약", "만일"
            ],
            "concession": [
                "비록", "아무리", "아무리", "아무리", "아무리", "아무리",
                "아무리", "아무리", "아무리", "아무리", "아무리", "아무리"
            ],
            "purpose": [
                "위해서", "위해", "위해서", "위해", "위해서", "위해",
                "위해서", "위해", "위해서", "위해", "위해서", "위해"
            ],
            "result": [
                "결과적으로", "그 결과", "그로 인해", "그 때문에", "그래서",
                "따라서", "그러므로", "그러므로", "그러므로", "그러므로"
            ],
            "example": [
                "예를 들어", "예를 들면", "예시로", "예시로", "예시로",
                "예시로", "예시로", "예시로", "예시로", "예시로", "예시로"
            ],
            "definition": [
                "정의하면", "정의하면", "정의하면", "정의하면", "정의하면",
                "정의하면", "정의하면", "정의하면", "정의하면", "정의하면"
            ]
        }
    
    def _initialize_semantic_patterns(self) -> Dict[str, List[str]]:
        """의미적 패턴 초기화"""
        return {
            "quantitative": [
                r'\d+[%]', r'\d+[개]', r'\d+[명]', r'\d+[번]', r'\d+[회]',
                r'\d+[년]', r'\d+[월]', r'\d+[일]', r'\d+[시간]', r'\d+[분]'
            ],
            "temporal": [
                "오늘", "어제", "내일", "지금", "현재", "과거", "미래",
                "이전", "이후", "동안", "사이", "중에", "때", "시점"
            ],
            "spatial": [
                "위", "아래", "앞", "뒤", "왼쪽", "오른쪽", "가운데",
                "중앙", "주변", "근처", "멀리", "가까이", "옆", "곁"
            ],
            "causal": [
                "원인", "결과", "효과", "영향", "작용", "반응", "변화",
                "발생", "일어나다", "생기다", "만들다", "유발하다"
            ]
        }
    
    def _initialize_mathematical_patterns(self) -> Dict[str, List[str]]:
        """수학적 패턴 초기화"""
        return {
            "operators": [
                r'[+\-*/=<>≤≥≠]', r'[더하기|빼기|곱하기|나누기|같다|크다|작다]',
                r'[증가|감소|상승|하락|증가하다|감소하다|상승하다|하락하다]'
            ],
            "comparisons": [
                r'[비교|대비|대조|상대적|절대적|상대적으로|절대적으로]',
                r'[더|덜|가장|최고|최저|최대|최소|최고로|최저로]'
            ],
            "proportions": [
                r'\d+[%]', r'\d+[분의]\d+', r'\d+[대]\d+', r'\d+[비]\d+',
                r'[비율|비례|반비례|정비례|역비례]'
            ],
            "statistics": [
                r'[평균|중간값|최빈값|표준편차|분산|상관계수|회귀분석]',
                r'[통계|데이터|분석|조사|연구|실험|측정]'
            ]
        }
    
    async def analyze_korean_text(self, text: str, user_id: str = "default") -> KoreanAnalysis:
        """한국어 텍스트 고급 분석"""
        try:
            # 형태소 분석
            morphemes = self._analyze_morphemes(text)
            
            # 논리적 구조 분석
            logical_structure = self._analyze_logical_structure(text)
            
            # 의미적 관계 분석
            semantic_relations = self._analyze_semantic_relations(text)
            
            # 일관성 점수 계산
            coherence_score = self._calculate_coherence_score(text, logical_structure, semantic_relations)
            
            # 복잡도 지표 계산
            complexity_metrics = self._calculate_complexity_metrics(text, morphemes)
            
            # 수학적 관계 분석
            mathematical_relations = self._analyze_mathematical_relations(text)
            
            # 맥락 이해 분석
            context_understanding = self._analyze_context_understanding(text, user_id)
            
            return KoreanAnalysis(
                text=text,
                morphemes=morphemes,
                logical_structure=logical_structure,
                semantic_relations=semantic_relations,
                coherence_score=coherence_score,
                complexity_metrics=complexity_metrics,
                mathematical_relations=mathematical_relations,
                context_understanding=context_understanding
            )
            
        except Exception as e:
            logger.error(f"한국어 텍스트 분석 중 오류: {e}")
            return self._create_fallback_korean_analysis(text)
    
    def _analyze_morphemes(self, text: str) -> List[Dict[str, Any]]:
        """형태소 분석"""
        morphemes = []
        
        for morpheme_type, patterns in self.morpheme_patterns.items():
            for pattern in patterns:
                matches = re.finditer(pattern, text)
                for match in matches:
                    morphemes.append({
                        "type": morpheme_type,
                        "text": match.group(),
                        "start": match.start(),
                        "end": match.end(),
                        "confidence": 0.8
                    })
        
        return morphemes
    
    def _analyze_logical_structure(self, text: str) -> List[LogicalStructure]:
        """논리적 구조 분석"""
        structures = []
        
        for structure_type, connectors in self.logical_connectors.items():
            for connector in connectors:
                if connector in text:
                    structures.append(LogicalStructure(structure_type))
                    break
        
        return structures
    
    def _analyze_semantic_relations(self, text: str) -> List[Dict[str, Any]]:
        """의미적 관계 분석"""
        relations = []
        
        for relation_type, patterns in self.semantic_patterns.items():
            for pattern in patterns:
                matches = re.finditer(pattern, text)
                for match in matches:
                    relations.append({
                        "type": relation_type,
                        "text": match.group(),
                        "start": match.start(),
                        "end": match.end(),
                        "confidence": 0.7
                    })
        
        return relations
    
    def _calculate_coherence_score(self, text: str, logical_structures: List[LogicalStructure], semantic_relations: List[Dict]) -> float:
        """일관성 점수 계산"""
        # 기본 점수
        base_score = 0.5
        
        # 논리적 구조 점수
        logical_score = min(len(logical_structures) * 0.1, 0.3)
        
        # 의미적 관계 점수
        semantic_score = min(len(semantic_relations) * 0.05, 0.2)
        
        # 문장 길이 점수 (적절한 길이일 때 높은 점수)
        sentences = re.split(r'[.!?]', text)
        avg_sentence_length = sum(len(sentence.split()) for sentence in sentences) / len(sentences) if sentences else 0
        length_score = 0.1 if 10 <= avg_sentence_length <= 30 else 0.05
        
        return min(base_score + logical_score + semantic_score + length_score, 1.0)
    
    def _calculate_complexity_metrics(self, text: str, morphemes: List[Dict]) -> Dict[str, float]:
        """복잡도 지표 계산"""
        words = text.split()
        sentences = re.split(r'[.!?]', text)
        
        # 기본 지표
        word_count = len(words)
        sentence_count = len(sentences)
        morpheme_count = len(morphemes)
        
        # 평균 계산
        avg_word_length = sum(len(word) for word in words) / word_count if word_count > 0 else 0
        avg_sentence_length = word_count / sentence_count if sentence_count > 0 else 0
        avg_morphemes_per_word = morpheme_count / word_count if word_count > 0 else 0
        
        # 복잡도 점수 계산
        lexical_diversity = len(set(words)) / word_count if word_count > 0 else 0
        syntactic_complexity = avg_morphemes_per_word * avg_sentence_length / 10
        semantic_richness = morpheme_count / word_count if word_count > 0 else 0
        
        return {
            "word_count": word_count,
            "sentence_count": sentence_count,
            "morpheme_count": morpheme_count,
            "avg_word_length": round(avg_word_length, 2),
            "avg_sentence_length": round(avg_sentence_length, 2),
            "avg_morphemes_per_word": round(avg_morphemes_per_word, 2),
            "lexical_diversity": round(lexical_diversity, 3),
            "syntactic_complexity": round(syntactic_complexity, 3),
            "semantic_richness": round(semantic_richness, 3),
            "overall_complexity": round((lexical_diversity + syntactic_complexity + semantic_richness) / 3, 3)
        }
    
    def _analyze_mathematical_relations(self, text: str) -> List[Dict[str, Any]]:
        """수학적 관계 분석"""
        relations = []
        
        for relation_type, patterns in self.mathematical_patterns.items():
            for pattern in patterns:
                matches = re.finditer(pattern, text)
                for match in matches:
                    relations.append({
                        "type": relation_type,
                        "text": match.group(),
                        "start": match.start(),
                        "end": match.end(),
                        "confidence": 0.8
                    })
        
        return relations
    
    def _analyze_context_understanding(self, text: str, user_id: str) -> Dict[str, Any]:
        """맥락 이해 분석"""
        context = {
            "user_id": user_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "text_length": len(text),
            "complexity_level": "medium",
            "logical_flow": "coherent",
            "mathematical_content": False,
            "temporal_references": [],
            "spatial_references": [],
            "causal_chains": []
        }
        
        # 복잡도 레벨 결정
        complexity_metrics = self._calculate_complexity_metrics(text, [])
        if complexity_metrics["overall_complexity"] > 0.7:
            context["complexity_level"] = "high"
        elif complexity_metrics["overall_complexity"] < 0.3:
            context["complexity_level"] = "low"
        
        # 수학적 내용 확인
        mathematical_relations = self._analyze_mathematical_relations(text)
        if mathematical_relations:
            context["mathematical_content"] = True
        
        # 시간적 참조 추출
        temporal_patterns = self.semantic_patterns["temporal"]
        for pattern in temporal_patterns:
            if pattern in text:
                context["temporal_references"].append(pattern)
        
        # 공간적 참조 추출
        spatial_patterns = self.semantic_patterns["spatial"]
        for pattern in spatial_patterns:
            if pattern in text:
                context["spatial_references"].append(pattern)
        
        # 인과관계 체인 추출
        causal_patterns = self.semantic_patterns["causal"]
        for pattern in causal_patterns:
            if pattern in text:
                context["causal_chains"].append(pattern)
        
        return context
    
    def _create_fallback_korean_analysis(self, text: str) -> KoreanAnalysis:
        """기본 한국어 분석 결과 생성"""
        return KoreanAnalysis(
            text=text,
            morphemes=[],
            logical_structure=[],
            semantic_relations=[],
            coherence_score=0.5,
            complexity_metrics={"overall_complexity": 0.5},
            mathematical_relations=[],
            context_understanding={"user_id": "default", "timestamp": datetime.now(timezone.utc).isoformat()}
        )
    
    async def generate_logical_explanation(self, analysis: KoreanAnalysis, question: str = "") -> str:
        """논리적 설명 생성"""
        try:
            explanation_parts = []
            
            # 기본 분석 결과 요약
            explanation_parts.append(f"## 📝 텍스트 분석 결과")
            explanation_parts.append(f"**입력 텍스트**: \"{analysis.text[:100]}{'...' if len(analysis.text) > 100 else ''}\"")
            explanation_parts.append("")
            
            # 논리적 구조 분석
            if analysis.logical_structure:
                explanation_parts.append("### 🔗 논리적 구조")
                for structure in analysis.logical_structure:
                    explanation_parts.append(f"- **{structure.value}**: 텍스트에서 {structure.value} 관계가 감지되었습니다.")
                explanation_parts.append("")
            
            # 복잡도 분석
            explanation_parts.append("### 📊 복잡도 분석")
            metrics = analysis.complexity_metrics
            explanation_parts.append(f"- **단어 수**: {metrics['word_count']}개")
            explanation_parts.append(f"- **문장 수**: {metrics['sentence_count']}개")
            explanation_parts.append(f"- **평균 문장 길이**: {metrics['avg_sentence_length']:.1f}단어")
            explanation_parts.append(f"- **어휘 다양성**: {metrics['lexical_diversity']:.3f}")
            explanation_parts.append(f"- **전체 복잡도**: {metrics['overall_complexity']:.3f}")
            explanation_parts.append("")
            
            # 수학적 관계 분석
            if analysis.mathematical_relations:
                explanation_parts.append("### 🔢 수학적 관계")
                for relation in analysis.mathematical_relations:
                    explanation_parts.append(f"- **{relation['type']}**: {relation['text']}")
                explanation_parts.append("")
            
            # 일관성 점수
            explanation_parts.append("### ✅ 일관성 평가")
            coherence_level = "높음" if analysis.coherence_score > 0.7 else "보통" if analysis.coherence_score > 0.4 else "낮음"
            explanation_parts.append(f"- **일관성 점수**: {analysis.coherence_score:.3f} ({coherence_level})")
            explanation_parts.append("")
            
            # 맥락 이해
            context = analysis.context_understanding
            explanation_parts.append("### 🧠 맥락 이해")
            explanation_parts.append(f"- **복잡도 레벨**: {context['complexity_level']}")
            explanation_parts.append(f"- **논리적 흐름**: {context['logical_flow']}")
            explanation_parts.append(f"- **수학적 내용**: {'포함' if context['mathematical_content'] else '미포함'}")
            explanation_parts.append("")
            
            # 개선 제안
            explanation_parts.append("### 💡 개선 제안")
            if analysis.coherence_score < 0.5:
                explanation_parts.append("- 논리적 연결어를 사용하여 문장 간 연결성을 높이세요.")
            if metrics['lexical_diversity'] < 0.3:
                explanation_parts.append("- 다양한 어휘를 사용하여 표현력을 높이세요.")
            if metrics['avg_sentence_length'] > 40:
                explanation_parts.append("- 긴 문장을 짧게 나누어 가독성을 높이세요.")
            if not analysis.mathematical_relations and "수학" in analysis.text:
                explanation_parts.append("- 수학적 개념을 더 구체적으로 설명하세요.")
            
            explanation_parts.append("")
            explanation_parts.append("---")
            explanation_parts.append("*CORBU AI Korean Language Engine이 제공하는 고급 언어 분석입니다*")
            
            return "\n".join(explanation_parts)
            
        except Exception as e:
            logger.error(f"논리적 설명 생성 중 오류: {e}")
            return f"## 오류 발생\n텍스트 분석 중 오류가 발생했습니다: {str(e)}"
    
    async def get_korean_language_statistics(self) -> Dict[str, Any]:
        """한국어 언어 처리 통계"""
        return {
            "morpheme_patterns": len(self.morpheme_patterns),
            "logical_connectors": sum(len(connectors) for connectors in self.logical_connectors.values()),
            "semantic_patterns": sum(len(patterns) for patterns in self.semantic_patterns.values()),
            "mathematical_patterns": sum(len(patterns) for patterns in self.mathematical_patterns.values()),
            "engine_status": "active",
            "supported_features": [
                "형태소 분석", "논리적 구조 분석", "의미적 관계 분석",
                "복잡도 계산", "수학적 관계 분석", "맥락 이해"
            ]
        }
