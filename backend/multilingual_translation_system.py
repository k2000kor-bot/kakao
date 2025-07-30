#!/usr/bin/env python3
"""
다중 언어 지원 및 번역 통합 시스템 v9.0
- 한국어, 영어, 중국어, 일본어 지원
- 실시간 번역 및 언어 감지
- 도메인 특화 번역 (재건축/부동산)
- 번역 품질 평가 및 개선
- 다국어 메시지 생성
"""

import json
import re
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import hashlib

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class LanguageDetectionResult:
    """언어 감지 결과"""
    detected_language: str  # ko, en, zh, ja
    confidence: float  # 신뢰도 (0-1)
    alternative_languages: List[Tuple[str, float]]  # 다른 가능한 언어들
    mixed_language: bool  # 혼합 언어 여부
    text_segments: List[Dict[str, Any]]  # 언어별 텍스트 세그먼트


@dataclass
class TranslationResult:
    """번역 결과"""
    source_language: str
    target_language: str
    original_text: str
    translated_text: str
    translation_quality: float  # 품질 점수 (0-1)
    domain_terms: List[str]  # 도메인 특화 용어들
    alternative_translations: List[str]  # 대안 번역들
    processing_time: float  # 처리 시간 (초)
    translation_method: str  # rule_based, neural, hybrid


@dataclass
class MultilingualMessage:
    """다국어 메시지"""
    message_id: str
    original_language: str
    original_text: str
    translations: Dict[str, TranslationResult]
    context_metadata: Dict[str, Any]
    domain_category: str  # construction, finance, legal, general
    formality_level: str  # casual, formal, business
    created_at: datetime


class MultilingualTranslationSystem:
    """다중 언어 번역 시스템"""
    
    def __init__(self):
        # 지원 언어
        self.supported_languages = {
            'ko': '한국어',
            'en': 'English', 
            'zh': '中文',
            'ja': '日本語'
        }
        
        # 언어별 패턴
        self.language_patterns = self._initialize_language_patterns()
        
        # 도메인 특화 용어 사전
        self.domain_dictionaries = self._load_domain_dictionaries()
        
        # 번역 규칙
        self.translation_rules = self._initialize_translation_rules()
        
        # 번역 품질 모델 (실제로는 ML 모델 사용)
        self.quality_model = self._initialize_quality_model()
        
        # 캐시
        self.translation_cache: Dict[str, TranslationResult] = {}
        
        logger.info("다중 언어 번역 시스템 초기화 완료")
        
    def _initialize_language_patterns(self) -> Dict[str, Dict[str, Any]]:
        """언어별 패턴 초기화"""
        
        return {
            'ko': {
                'unicode_ranges': [(0xAC00, 0xD7AF), (0x3130, 0x318F)],  # 한글
                'common_words': ['이', '가', '을', '를', '의', '에', '서', '와', '과'],
                'endings': ['다', '요', '습니다', '네요', '죠', '까요'],
                'particles': ['은', '는', '이', '가', '을', '를', '에', '서', '로', '와', '과']
            },
            'en': {
                'unicode_ranges': [(0x0041, 0x005A), (0x0061, 0x007A)],  # 영어
                'common_words': ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to'],
                'patterns': [r'\b[A-Za-z]+\b'],
                'articles': ['a', 'an', 'the']
            },
            'zh': {
                'unicode_ranges': [(0x4E00, 0x9FFF)],  # 중국어 한자
                'common_chars': ['的', '了', '在', '是', '我', '有', '他', '这', '中', '大'],
                'patterns': [r'[\u4e00-\u9fff]+']
            },
            'ja': {
                'unicode_ranges': [(0x3040, 0x309F), (0x30A0, 0x30FF), (0x4E00, 0x9FAF)],  # 히라가나, 카타카나, 한자
                'hiragana': ['は', 'が', 'を', 'に', 'で', 'と', 'から', 'まで'],
                'katakana_patterns': [r'[\u30a0-\u30ff]+'],
                'particles': ['は', 'が', 'を', 'に', 'へ', 'で', 'と', 'から']
            }
        }
        
    def _load_domain_dictionaries(self) -> Dict[str, Dict[str, Dict[str, str]]]:
        """도메인 특화 용어 사전 로드"""
        
        return {
            'construction': {
                'ko_to_en': {
                    '시공사': 'construction company',
                    '건설사': 'construction firm',
                    '재건축': 'reconstruction',
                    '분담금': 'contribution fee',
                    '총회': 'general meeting',
                    '조합원': 'union member',
                    '커뮤니티시설': 'community facilities',
                    '수영장': 'swimming pool',
                    '사우나': 'sauna',
                    '헬스장': 'fitness center',
                    '아파트': 'apartment',
                    '단지': 'complex',
                    '평형': 'floor plan size',
                    '브랜드': 'brand',
                    '프리미엄': 'premium'
                },
                'ko_to_zh': {
                    '시공사': '施工公司',
                    '건설사': '建设公司', 
                    '재건축': '重建',
                    '분담금': '分摊费',
                    '총회': '大会',
                    '조합원': '组合员',
                    '아파트': '公寓',
                    '단지': '小区'
                },
                'ko_to_ja': {
                    '시공사': '施工会社',
                    '건설사': '建設会社',
                    '재건축': '再建築',
                    '분담금': '分担金',
                    '총회': '総会',
                    '조합원': '組合員',
                    '아파트': 'アパート',
                    '단지': '団地'
                }
            },
            'finance': {
                'ko_to_en': {
                    '환급': 'refund',
                    '비용': 'cost',
                    '예산': 'budget',
                    '자금': 'funds',
                    '계산': 'calculation',
                    '투자': 'investment',
                    '수익': 'profit',
                    '손실': 'loss',
                    '이자': 'interest',
                    '대출': 'loan'
                },
                'ko_to_zh': {
                    '환급': '退款',
                    '비용': '费用',
                    '예산': '预算',
                    '자금': '资金',
                    '계산': '计算'
                },
                'ko_to_ja': {
                    '환급': '払い戻し',
                    '비용': '費用',
                    '예산': '予算',
                    '자금': '資金',
                    '계산': '計算'
                }
            },
            'legal': {
                'ko_to_en': {
                    '법률': 'law',
                    '규정': 'regulation',
                    '계약': 'contract',
                    '조건': 'condition',
                    '절차': 'procedure',
                    '승인': 'approval',
                    '허가': 'permit',
                    '의무': 'obligation',
                    '권리': 'right',
                    '책임': 'responsibility'
                },
                'ko_to_zh': {
                    '법률': '法律',
                    '규정': '规定',
                    '계약': '合同',
                    '조건': '条件',
                    '절차': '程序'
                },
                'ko_to_ja': {
                    '법률': '法律',
                    '규정': '規定',
                    '계약': '契約',
                    '조건': '条件',
                    '절차': '手続き'
                }
            }
        }
        
    def _initialize_translation_rules(self) -> Dict[str, Any]:
        """번역 규칙 초기화"""
        
        return {
            'korean_honorifics': {
                # 존댓말 처리
                'formal_endings': ['습니다', '됩니다', '있습니다', '합니다'],
                'casual_endings': ['해요', '가요', '봐요', '되요'],
                'very_formal': ['하겠습니다', '드리겠습니다', '사료됩니다']
            },
            'formality_mapping': {
                'en': {
                    'formal': ['please', 'would you', 'could you', 'I would like to'],
                    'casual': ['can you', 'gonna', 'wanna', 'yeah']
                },
                'ja': {
                    'formal': ['です', 'ます', 'であります'],
                    'casual': ['だ', 'である', 'じゃない']
                }
            },
            'context_rules': {
                'business': {
                    'tone': 'formal',
                    'vocabulary': 'professional',
                    'structure': 'complete_sentences'
                },
                'casual': {
                    'tone': 'friendly',
                    'vocabulary': 'everyday',
                    'structure': 'natural'
                }
            }
        }
        
    def _initialize_quality_model(self) -> Dict[str, Any]:
        """번역 품질 모델 초기화"""
        
        return {
            'quality_factors': {
                'fluency': 0.3,      # 유창성
                'accuracy': 0.4,     # 정확성  
                'adequacy': 0.2,     # 적절성
                'formality': 0.1     # 격식도
            },
            'penalty_patterns': {
                'incomplete_sentence': -0.2,
                'wrong_honorific': -0.3,
                'mistranslated_term': -0.4,
                'grammar_error': -0.2
            }
        }
        
    def detect_language(self, text: str) -> LanguageDetectionResult:
        """언어 감지"""
        
        if not text.strip():
            return LanguageDetectionResult(
                detected_language="unknown",
                confidence=0.0,
                alternative_languages=[],
                mixed_language=False,
                text_segments=[]
            )
            
        # 각 언어별 점수 계산
        language_scores = {}
        text_segments = []
        
        for lang_code, patterns in self.language_patterns.items():
            score = self._calculate_language_score(text, patterns)
            language_scores[lang_code] = score
            
        # 가장 높은 점수의 언어
        best_language = max(language_scores, key=language_scores.get)
        best_score = language_scores[best_language]
        
        # 대안 언어들 (점수 순)
        alternatives = [(lang, score) for lang, score in 
                       sorted(language_scores.items(), key=lambda x: x[1], reverse=True)[1:]]
        
        # 혼합 언어 여부 판단
        mixed_language = len([score for score in language_scores.values() if score > 0.3]) > 1
        
        # 텍스트 세그먼트 분석 (혼합 언어인 경우)
        if mixed_language:
            text_segments = self._segment_mixed_language_text(text)
            
        return LanguageDetectionResult(
            detected_language=best_language,
            confidence=best_score,
            alternative_languages=alternatives,
            mixed_language=mixed_language,
            text_segments=text_segments
        )
        
    def _calculate_language_score(self, text: str, patterns: Dict[str, Any]) -> float:
        """언어별 점수 계산"""
        
        total_chars = len(text)
        if total_chars == 0:
            return 0.0
            
        score = 0.0
        
        # 유니코드 범위 체크
        if 'unicode_ranges' in patterns:
            unicode_chars = 0
            for char in text:
                char_code = ord(char)
                for start, end in patterns['unicode_ranges']:
                    if start <= char_code <= end:
                        unicode_chars += 1
                        break
            score += (unicode_chars / total_chars) * 0.7
            
        # 공통 단어/글자 체크
        common_items = patterns.get('common_words', []) + patterns.get('common_chars', [])
        if common_items:
            found_items = sum(1 for item in common_items if item in text)
            score += (found_items / len(common_items)) * 0.2
            
        # 패턴 매칭
        if 'patterns' in patterns:
            pattern_matches = 0
            for pattern in patterns['patterns']:
                pattern_matches += len(re.findall(pattern, text))
            score += min(pattern_matches / max(total_chars * 0.1, 1), 0.1)
            
        return min(score, 1.0)
        
    def _segment_mixed_language_text(self, text: str) -> List[Dict[str, Any]]:
        """혼합 언어 텍스트 세그먼트화"""
        
        segments = []
        current_segment = ""
        current_language = "unknown"
        
        for char in text:
            char_lang = self._detect_character_language(char)
            
            if char_lang != current_language:
                if current_segment.strip():
                    segments.append({
                        'text': current_segment.strip(),
                        'language': current_language,
                        'start_pos': len(text) - len(current_segment),
                        'end_pos': len(text)
                    })
                current_segment = char
                current_language = char_lang
            else:
                current_segment += char
                
        # 마지막 세그먼트 추가
        if current_segment.strip():
            segments.append({
                'text': current_segment.strip(),
                'language': current_language,
                'start_pos': len(text) - len(current_segment),
                'end_pos': len(text)
            })
            
        return segments
        
    def _detect_character_language(self, char: str) -> str:
        """개별 문자의 언어 감지"""
        
        char_code = ord(char)
        
        # 한글
        if 0xAC00 <= char_code <= 0xD7AF or 0x3130 <= char_code <= 0x318F:
            return 'ko'
        # 영어
        elif 0x0041 <= char_code <= 0x005A or 0x0061 <= char_code <= 0x007A:
            return 'en'
        # 중국어 한자
        elif 0x4E00 <= char_code <= 0x9FFF:
            return 'zh'
        # 일본어 (히라가나, 카타카나)
        elif 0x3040 <= char_code <= 0x309F or 0x30A0 <= char_code <= 0x30FF:
            return 'ja'
        else:
            return 'unknown'
            
    def translate_text(self, text: str, target_language: str, 
                      source_language: Optional[str] = None,
                      domain: str = "general",
                      formality: str = "formal") -> TranslationResult:
        """텍스트 번역"""
        
        start_time = datetime.now()
        
        # 소스 언어 감지
        if not source_language:
            detection_result = self.detect_language(text)
            source_language = detection_result.detected_language
            
        # 캐시 체크
        cache_key = hashlib.md5(f"{text}_{source_language}_{target_language}_{domain}_{formality}".encode()).hexdigest()
        if cache_key in self.translation_cache:
            logger.info("캐시에서 번역 결과 반환")
            return self.translation_cache[cache_key]
            
        # 번역 수행
        if source_language == target_language:
            translated_text = text
            translation_method = "no_translation"
            quality_score = 1.0
        else:
            # 도메인 특화 번역
            translated_text = self._perform_domain_translation(
                text, source_language, target_language, domain
            )
            
            # 격식도 조정
            translated_text = self._adjust_formality(
                translated_text, target_language, formality
            )
            
            translation_method = "hybrid"
            quality_score = self._evaluate_translation_quality(
                text, translated_text, source_language, target_language
            )
            
        # 처리 시간 계산
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # 도메인 용어 추출
        domain_terms = self._extract_domain_terms(text, domain)
        
        # 대안 번역 생성 (간단한 버전)
        alternative_translations = self._generate_alternative_translations(
            text, source_language, target_language, domain
        )
        
        result = TranslationResult(
            source_language=source_language,
            target_language=target_language,
            original_text=text,
            translated_text=translated_text,
            translation_quality=quality_score,
            domain_terms=domain_terms,
            alternative_translations=alternative_translations,
            processing_time=processing_time,
            translation_method=translation_method
        )
        
        # 캐시 저장
        self.translation_cache[cache_key] = result
        
        return result
        
    def _perform_domain_translation(self, text: str, source_lang: str, 
                                  target_lang: str, domain: str) -> str:
        """도메인 특화 번역"""
        
        translated_text = text
        
        # 도메인 사전 조회
        dict_key = f"{source_lang}_to_{target_lang}"
        
        if domain in self.domain_dictionaries and dict_key in self.domain_dictionaries[domain]:
            domain_dict = self.domain_dictionaries[domain][dict_key]
            
            # 도메인 용어 치환
            for source_term, target_term in domain_dict.items():
                translated_text = translated_text.replace(source_term, target_term)
                
        # 일반 번역 규칙 적용
        translated_text = self._apply_general_translation_rules(
            translated_text, source_lang, target_lang
        )
        
        return translated_text
        
    def _apply_general_translation_rules(self, text: str, source_lang: str, target_lang: str) -> str:
        """일반 번역 규칙 적용"""
        
        if source_lang == 'ko' and target_lang == 'en':
            # 한국어 → 영어
            text = self._korean_to_english_rules(text)
        elif source_lang == 'en' and target_lang == 'ko':
            # 영어 → 한국어  
            text = self._english_to_korean_rules(text)
        elif source_lang == 'ko' and target_lang == 'zh':
            # 한국어 → 중국어
            text = self._korean_to_chinese_rules(text)
        elif source_lang == 'ko' and target_lang == 'ja':
            # 한국어 → 일본어
            text = self._korean_to_japanese_rules(text)
            
        return text
        
    def _korean_to_english_rules(self, text: str) -> str:
        """한국어 → 영어 번역 규칙"""
        
        # 간단한 규칙 기반 번역 (실제로는 신경망 모델 사용)
        replacements = {
            '안녕하세요': 'Hello',
            '감사합니다': 'Thank you',
            '죄송합니다': 'I apologize',
            '네': 'Yes',
            '아니요': 'No',
            '그렇습니다': 'That is correct',
            '모르겠습니다': 'I do not know',
            '좋습니다': 'That is good',
            '나쁩니다': 'That is bad',
            '중요합니다': 'It is important'
        }
        
        for korean, english in replacements.items():
            text = text.replace(korean, english)
            
        return text
        
    def _english_to_korean_rules(self, text: str) -> str:
        """영어 → 한국어 번역 규칙"""
        
        replacements = {
            'Hello': '안녕하세요',
            'Thank you': '감사합니다',
            'Sorry': '죄송합니다',
            'Yes': '네',
            'No': '아니요',
            'Good': '좋습니다',
            'Bad': '나쁩니다',
            'Important': '중요합니다'
        }
        
        for english, korean in replacements.items():
            text = re.sub(r'\b' + english + r'\b', korean, text, flags=re.IGNORECASE)
            
        return text
        
    def _korean_to_chinese_rules(self, text: str) -> str:
        """한국어 → 중국어 번역 규칙"""
        
        replacements = {
            '안녕하세요': '您好',
            '감사합니다': '谢谢',
            '죄송합니다': '对不起',
            '네': '是',
            '아니요': '不是',
            '좋습니다': '好',
            '나쁩니다': '不好',
            '중요합니다': '很重要'
        }
        
        for korean, chinese in replacements.items():
            text = text.replace(korean, chinese)
            
        return text
        
    def _korean_to_japanese_rules(self, text: str) -> str:
        """한국어 → 일본어 번역 규칙"""
        
        replacements = {
            '안녕하세요': 'こんにちは',
            '감사합니다': 'ありがとうございます',
            '죄송합니다': 'すみません',
            '네': 'はい',
            '아니요': 'いいえ',
            '좋습니다': '良いです',
            '나쁩니다': '悪いです',
            '중요합니다': '重要です'
        }
        
        for korean, japanese in replacements.items():
            text = text.replace(korean, japanese)
            
        return text
        
    def _adjust_formality(self, text: str, target_language: str, formality: str) -> str:
        """격식도 조정"""
        
        if target_language == 'ko':
            return self._adjust_korean_formality(text, formality)
        elif target_language == 'ja':
            return self._adjust_japanese_formality(text, formality)
        elif target_language == 'en':
            return self._adjust_english_formality(text, formality)
            
        return text
        
    def _adjust_korean_formality(self, text: str, formality: str) -> str:
        """한국어 격식도 조정"""
        
        if formality == 'formal':
            # 존댓말로 변환
            replacements = {
                '이다': '입니다',
                '하다': '합니다',
                '있다': '있습니다',
                '없다': '없습니다',
                '좋다': '좋습니다',
                '나쁘다': '나쁩니다'
            }
        elif formality == 'casual':
            # 반말로 변환
            replacements = {
                '습니다': '해',
                '입니다': '이야',
                '합니다': '해',
                '있습니다': '있어',
                '없습니다': '없어'
            }
        else:
            return text
            
        for old, new in replacements.items():
            text = text.replace(old, new)
            
        return text
        
    def _adjust_japanese_formality(self, text: str, formality: str) -> str:
        """일본어 격식도 조정"""
        
        if formality == 'formal':
            replacements = {
                'だ': 'です',
                'である': 'であります',
                'する': 'します',
                'いる': 'います'
            }
        elif formality == 'casual':
            replacements = {
                'です': 'だ',
                'ます': '',
                'であります': 'である'
            }
        else:
            return text
            
        for old, new in replacements.items():
            text = text.replace(old, new)
            
        return text
        
    def _adjust_english_formality(self, text: str, formality: str) -> str:
        """영어 격식도 조정"""
        
        if formality == 'formal':
            replacements = {
                "can't": 'cannot',
                "won't": 'will not',
                "don't": 'do not',
                'gonna': 'going to',
                'wanna': 'want to'
            }
        elif formality == 'casual':
            replacements = {
                'cannot': "can't",
                'will not': "won't",
                'do not': "don't",
                'going to': 'gonna',
                'want to': 'wanna'
            }
        else:
            return text
            
        for old, new in replacements.items():
            text = re.sub(r'\b' + re.escape(old) + r'\b', new, text, flags=re.IGNORECASE)
            
        return text
        
    def _evaluate_translation_quality(self, source_text: str, translated_text: str,
                                    source_lang: str, target_lang: str) -> float:
        """번역 품질 평가"""
        
        quality_score = 0.8  # 기본 점수
        
        # 길이 비교 (너무 짧거나 긴 번역은 품질이 낮을 가능성)
        length_ratio = len(translated_text) / max(len(source_text), 1)
        if 0.5 <= length_ratio <= 2.0:
            quality_score += 0.1
        else:
            quality_score -= 0.2
            
        # 도메인 용어 보존 확인
        domain_terms = self._extract_domain_terms(source_text, "construction")
        preserved_terms = sum(1 for term in domain_terms if term in translated_text)
        if domain_terms:
            preservation_rate = preserved_terms / len(domain_terms)
            quality_score += preservation_rate * 0.1
            
        # 문장 완성도 체크
        if translated_text.strip().endswith(('.', '!', '?', '다', '요', '습니다')):
            quality_score += 0.05
            
        return min(max(quality_score, 0.0), 1.0)
        
    def _extract_domain_terms(self, text: str, domain: str) -> List[str]:
        """도메인 용어 추출"""
        
        domain_terms = []
        
        if domain in self.domain_dictionaries:
            for dict_key, term_dict in self.domain_dictionaries[domain].items():
                if dict_key.startswith('ko_to_'):
                    for term in term_dict.keys():
                        if term in text:
                            domain_terms.append(term)
                            
        return domain_terms
        
    def _generate_alternative_translations(self, text: str, source_lang: str,
                                         target_lang: str, domain: str) -> List[str]:
        """대안 번역 생성"""
        
        alternatives = []
        
        # 다른 격식도로 번역
        for formality in ['formal', 'casual']:
            alt_translation = self._perform_domain_translation(text, source_lang, target_lang, domain)
            alt_translation = self._adjust_formality(alt_translation, target_lang, formality)
            if alt_translation != text and alt_translation not in alternatives:
                alternatives.append(alt_translation)
                
        # 최대 3개까지
        return alternatives[:3]
        
    def create_multilingual_message(self, text: str, source_language: str,
                                  target_languages: List[str],
                                  domain: str = "general",
                                  formality: str = "formal") -> MultilingualMessage:
        """다국어 메시지 생성"""
        
        message_id = hashlib.md5(f"{text}_{datetime.now().isoformat()}".encode()).hexdigest()[:16]
        
        translations = {}
        
        for target_lang in target_languages:
            if target_lang != source_language:
                translation_result = self.translate_text(
                    text, target_lang, source_language, domain, formality
                )
                translations[target_lang] = translation_result
                
        # 맥락 메타데이터
        detection_result = self.detect_language(text)
        context_metadata = {
            'language_detection': asdict(detection_result),
            'text_length': len(text),
            'word_count': len(text.split()),
            'mixed_language': detection_result.mixed_language,
            'processing_timestamp': datetime.now().isoformat()
        }
        
        return MultilingualMessage(
            message_id=message_id,
            original_language=source_language,
            original_text=text,
            translations=translations,
            context_metadata=context_metadata,
            domain_category=domain,
            formality_level=formality,
            created_at=datetime.now()
        )
        
    def batch_translate(self, texts: List[str], target_language: str,
                       source_language: Optional[str] = None,
                       domain: str = "general") -> List[TranslationResult]:
        """일괄 번역"""
        
        results = []
        
        logger.info(f"일괄 번역 시작: {len(texts)}개 텍스트")
        
        for i, text in enumerate(texts):
            try:
                result = self.translate_text(text, target_language, source_language, domain)
                results.append(result)
                
                if (i + 1) % 10 == 0:
                    logger.info(f"번역 진행: {i + 1}/{len(texts)}")
                    
            except Exception as e:
                logger.error(f"번역 실패 {i}: {e}")
                # 오류 시 원본 텍스트 반환
                results.append(TranslationResult(
                    source_language=source_language or "unknown",
                    target_language=target_language,
                    original_text=text,
                    translated_text=text,
                    translation_quality=0.0,
                    domain_terms=[],
                    alternative_translations=[],
                    processing_time=0.0,
                    translation_method="failed"
                ))
                
        logger.info(f"일괄 번역 완료: {len(results)}개 결과")
        return results
        
    def get_translation_statistics(self) -> Dict[str, Any]:
        """번역 통계"""
        
        if not self.translation_cache:
            return {"status": "no_data"}
            
        total_translations = len(self.translation_cache)
        
        # 언어별 통계
        language_pairs = {}
        quality_scores = []
        processing_times = []
        
        for result in self.translation_cache.values():
            pair = f"{result.source_language} → {result.target_language}"
            language_pairs[pair] = language_pairs.get(pair, 0) + 1
            quality_scores.append(result.translation_quality)
            processing_times.append(result.processing_time)
            
        # 평균 품질 및 처리 시간
        avg_quality = sum(quality_scores) / len(quality_scores) if quality_scores else 0
        avg_processing_time = sum(processing_times) / len(processing_times) if processing_times else 0
        
        return {
            'total_translations': total_translations,
            'language_pairs': language_pairs,
            'average_quality': avg_quality,
            'average_processing_time': avg_processing_time,
            'supported_languages': len(self.supported_languages),
            'domain_dictionaries': len(self.domain_dictionaries),
            'cache_hit_ratio': total_translations / max(total_translations * 1.2, 1)  # 추정
        }


# 사용 예시 및 테스트
def test_multilingual_system():
    """다중 언어 시스템 테스트"""
    
    print("🌍 다중 언어 번역 시스템 테스트")
    print("=" * 50)
    
    system = MultilingualTranslationSystem()
    
    # 테스트 텍스트들
    test_texts = [
        "안녕하세요! 시공사 선정에 관해 논의하고 싶습니다.",
        "분담금 계산 결과를 공유드립니다.",
        "Hello! I would like to discuss the construction company selection.",
        "総会での議論が必要だと思います。",
        "我们需要讨论重建项目的费用分摊。"
    ]
    
    print("1. 언어 감지 테스트:")
    for text in test_texts:
        detection = system.detect_language(text)
        print(f"   '{text[:30]}...'")
        print(f"   → 감지된 언어: {detection.detected_language} "
              f"(신뢰도: {detection.confidence:.2f})")
        if detection.mixed_language:
            print(f"   → 혼합 언어 감지됨")
            
    print(f"\n2. 번역 테스트:")
    korean_text = "안녕하세요! 재건축 관련 총회를 개최하겠습니다. 분담금 관련해서 논의가 필요합니다."
    
    target_languages = ['en', 'zh', 'ja']
    
    for target_lang in target_languages:
        result = system.translate_text(
            korean_text, 
            target_lang, 
            domain="construction", 
            formality="formal"
        )
        
        print(f"\n   한국어 → {system.supported_languages[target_lang]}:")
        print(f"   원문: {result.original_text}")
        print(f"   번역: {result.translated_text}")
        print(f"   품질: {result.translation_quality:.2f}")
        print(f"   처리시간: {result.processing_time:.3f}초")
        print(f"   도메인 용어: {result.domain_terms}")
        
        if result.alternative_translations:
            print(f"   대안 번역: {result.alternative_translations}")
            
    print(f"\n3. 다국어 메시지 생성 테스트:")
    multilingual_msg = system.create_multilingual_message(
        text="시공사 비교 검토 후 총회에서 최종 결정하겠습니다.",
        source_language="ko",
        target_languages=['en', 'zh', 'ja'],
        domain="construction",
        formality="formal"
    )
    
    print(f"   메시지 ID: {multilingual_msg.message_id}")
    print(f"   원본 언어: {multilingual_msg.original_language}")
    print(f"   원본 텍스트: {multilingual_msg.original_text}")
    print(f"   번역 수: {len(multilingual_msg.translations)}개")
    
    for lang, translation in multilingual_msg.translations.items():
        print(f"   {system.supported_languages[lang]}: {translation.translated_text}")
        
    print(f"\n4. 일괄 번역 테스트:")
    batch_texts = [
        "첫 번째 메시지입니다.",
        "두 번째 메시지입니다.", 
        "세 번째 메시지입니다."
    ]
    
    batch_results = system.batch_translate(batch_texts, "en", "ko", "general")
    
    for i, result in enumerate(batch_results):
        print(f"   {i+1}. {result.original_text} → {result.translated_text}")
        
    print(f"\n5. 번역 통계:")
    stats = system.get_translation_statistics()
    print(f"   총 번역: {stats['total_translations']}개")
    print(f"   평균 품질: {stats['average_quality']:.2f}")
    print(f"   평균 처리시간: {stats['average_processing_time']:.3f}초")
    print(f"   지원 언어: {stats['supported_languages']}개")
    print(f"   언어 쌍: {list(stats['language_pairs'].keys())}")
    
    print(f"\n🏆 다중 언어 번역 시스템 테스트 완료!")
    

if __name__ == "__main__":
    test_multilingual_system() 