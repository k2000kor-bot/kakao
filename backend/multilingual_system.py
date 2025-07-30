import asyncio
import logging
from typing import Dict, List, Optional, Tuple
import json
import sqlite3
from datetime import datetime, timedelta
import aiohttp
from dataclasses import dataclass
from enum import Enum
import re
import unicodedata

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SupportedLanguage(Enum):
    KOREAN = "ko"
    ENGLISH = "en"
    JAPANESE = "ja"
    CHINESE_SIMPLIFIED = "zh-cn"
    CHINESE_TRADITIONAL = "zh-tw"
    SPANISH = "es"
    FRENCH = "fr"
    GERMAN = "de"
    RUSSIAN = "ru"
    PORTUGUESE = "pt"

@dataclass
class TranslationResult:
    original_text: str
    translated_text: str
    source_language: str
    target_language: str
    confidence: float
    method: str  # 'api', 'cache', 'local'
    timestamp: datetime
    
class MultilingualSystem:
    """다국어 지원 및 번역 시스템"""
    
    def __init__(self, db_path: str = "multilingual.db"):
        self.db_path = db_path
        self.translation_cache: Dict[str, TranslationResult] = {}
        self.language_patterns = self._init_language_patterns()
        self.local_dictionaries = self._load_local_dictionaries()
        
        # 데이터베이스 초기화
        self._init_database()
        
        # 번역 캐시 로드
        self._load_translation_cache()

    def _init_database(self):
        """데이터베이스 초기화"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # 번역 캐시 테이블
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS translation_cache (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        original_text TEXT NOT NULL,
                        translated_text TEXT NOT NULL,
                        source_language TEXT NOT NULL,
                        target_language TEXT NOT NULL,
                        confidence REAL NOT NULL,
                        method TEXT NOT NULL,
                        created_at TEXT NOT NULL,
                        access_count INTEGER DEFAULT 1,
                        last_accessed TEXT NOT NULL
                    )
                """)
                
                # 언어 감지 기록
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS language_detection_log (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        text TEXT NOT NULL,
                        detected_language TEXT NOT NULL,
                        confidence REAL NOT NULL,
                        method TEXT NOT NULL,
                        timestamp TEXT NOT NULL
                    )
                """)
                
                # 다국어 용어 사전
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS multilingual_dictionary (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        term TEXT NOT NULL,
                        language TEXT NOT NULL,
                        translation TEXT NOT NULL,
                        context TEXT,
                        category TEXT,
                        confidence REAL DEFAULT 1.0,
                        created_at TEXT NOT NULL
                    )
                """)
                
                conn.commit()
                logger.info("다국어 시스템 데이터베이스 초기화 완료")
                
        except Exception as e:
            logger.error(f"데이터베이스 초기화 오류: {e}")

    def _init_language_patterns(self) -> Dict[str, Dict]:
        """언어별 특성 패턴 초기화"""
        return {
            'ko': {
                'unicode_ranges': [(0xAC00, 0xD7AF), (0x1100, 0x11FF), (0x3130, 0x318F)],  # 한글
                'common_words': ['이', '그', '저', '의', '를', '에', '은', '는', '이다', '있다', '하다'],
                'particles': ['이', '가', '을', '를', '에', '에서', '로', '으로', '와', '과', '의', '도'],
                'honorifics': ['님', '씨', '께서', '하십시오', '입니다', '습니다'],
                'endings': ['다', '요', '야', '지', '어', '아']
            },
            'en': {
                'unicode_ranges': [(0x0041, 0x005A), (0x0061, 0x007A)],  # 영어
                'common_words': ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for'],
                'articles': ['a', 'an', 'the'],
                'prepositions': ['in', 'on', 'at', 'by', 'for', 'with', 'from', 'to', 'of', 'about'],
                'contractions': ["'s", "'t", "'re", "'ve", "'ll", "'d", "'m"]
            },
            'ja': {
                'unicode_ranges': [(0x3040, 0x309F), (0x30A0, 0x30FF), (0x4E00, 0x9FAF)],  # 일본어
                'common_words': ['の', 'に', 'は', 'を', 'が', 'で', 'と', 'て', 'に', 'だ', 'である'],
                'particles': ['は', 'が', 'を', 'に', 'で', 'と', 'から', 'まで', 'より', 'へ'],
                'endings': ['です', 'ます', 'だ', 'である', 'た', 'る', 'う']
            },
            'zh-cn': {
                'unicode_ranges': [(0x4E00, 0x9FFF)],  # 중국어 간체
                'common_words': ['的', '是', '了', '在', '有', '我', '他', '这', '个', '们', '中', '来'],
                'measure_words': ['个', '只', '本', '张', '件', '条', '台', '辆'],
                'particles': ['的', '了', '过', '着', '呢', '吗', '啊']
            }
        }

    def _load_local_dictionaries(self) -> Dict[str, Dict]:
        """로컬 번역 사전 로드"""
        dictionaries = {
            'real_estate': {
                'ko': {
                    '재건축': {'en': 'reconstruction', 'ja': '再建築', 'zh-cn': '重建'},
                    '조합': {'en': 'association', 'ja': '組合', 'zh-cn': '协会'},
                    '환급금': {'en': 'refund', 'ja': '還付金', 'zh-cn': '退款'},
                    '시공사': {'en': 'construction company', 'ja': '施工会社', 'zh-cn': '施工公司'},
                    '총회': {'en': 'general meeting', 'ja': '総会', 'zh-cn': '大会'},
                    '분담금': {'en': 'share cost', 'ja': '分担金', 'zh-cn': '分摊费'},
                    '입주': {'en': 'move-in', 'ja': '入居', 'zh-cn': '入住'},
                    '준공': {'en': 'completion', 'ja': '竣工', 'zh-cn': '竣工'}
                }
            },
            'business': {
                'ko': {
                    '회의': {'en': 'meeting', 'ja': '会議', 'zh-cn': '会议'},
                    '계약': {'en': 'contract', 'ja': '契約', 'zh-cn': '合同'},
                    '제안서': {'en': 'proposal', 'ja': '提案書', 'zh-cn': '提案书'},
                    '검토': {'en': 'review', 'ja': '検討', 'zh-cn': '审查'},
                    '승인': {'en': 'approval', 'ja': '承認', 'zh-cn': '批准'}
                }
            }
        }
        
        return dictionaries

    def _load_translation_cache(self):
        """번역 캐시 로드"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT original_text, translated_text, source_language, 
                           target_language, confidence, method, created_at
                    FROM translation_cache
                    WHERE access_count > 2
                    ORDER BY access_count DESC
                    LIMIT 1000
                """)
                
                rows = cursor.fetchall()
                for row in rows:
                    cache_key = f"{row[0]}|{row[2]}|{row[3]}"
                    self.translation_cache[cache_key] = TranslationResult(
                        original_text=row[0],
                        translated_text=row[1],
                        source_language=row[2],
                        target_language=row[3],
                        confidence=row[4],
                        method=row[5],
                        timestamp=datetime.fromisoformat(row[6])
                    )
                
                logger.info(f"{len(self.translation_cache)}개의 번역 캐시를 로드했습니다")
                
        except Exception as e:
            logger.error(f"번역 캐시 로드 오류: {e}")

    async def detect_language(self, text: str) -> Tuple[str, float]:
        """언어 자동 감지"""
        try:
            # 1. 유니코드 범위 기반 감지
            unicode_scores = self._detect_by_unicode(text)
            
            # 2. 특징적 단어 기반 감지
            word_scores = self._detect_by_words(text)
            
            # 3. 언어별 패턴 기반 감지
            pattern_scores = self._detect_by_patterns(text)
            
            # 4. 종합 점수 계산
            combined_scores = {}
            all_languages = set(unicode_scores.keys()) | set(word_scores.keys()) | set(pattern_scores.keys())
            
            for lang in all_languages:
                score = (
                    unicode_scores.get(lang, 0) * 0.4 +
                    word_scores.get(lang, 0) * 0.4 +
                    pattern_scores.get(lang, 0) * 0.2
                )
                combined_scores[lang] = score
            
            # 최고 점수 언어 선택
            if combined_scores:
                detected_lang = max(combined_scores.items(), key=lambda x: x[1])
                confidence = min(detected_lang[1], 1.0)
                
                # 감지 기록 저장
                self._save_detection_log(text, detected_lang[0], confidence, 'local_analysis')
                
                return detected_lang[0], confidence
            else:
                return 'ko', 0.5  # 기본값: 한국어
                
        except Exception as e:
            logger.error(f"언어 감지 오류: {e}")
            return 'ko', 0.5

    def _detect_by_unicode(self, text: str) -> Dict[str, float]:
        """유니코드 범위 기반 언어 감지"""
        scores = {}
        total_chars = len([c for c in text if c.isalpha()])
        
        if total_chars == 0:
            return scores
        
        for lang, patterns in self.language_patterns.items():
            unicode_ranges = patterns.get('unicode_ranges', [])
            matching_chars = 0
            
            for char in text:
                char_code = ord(char)
                for start, end in unicode_ranges:
                    if start <= char_code <= end:
                        matching_chars += 1
                        break
            
            if total_chars > 0:
                scores[lang] = matching_chars / total_chars
        
        return scores

    def _detect_by_words(self, text: str) -> Dict[str, float]:
        """특징적 단어 기반 언어 감지"""
        scores = {}
        words = re.findall(r'\w+', text.lower())
        total_words = len(words)
        
        if total_words == 0:
            return scores
        
        for lang, patterns in self.language_patterns.items():
            common_words = patterns.get('common_words', [])
            matching_words = sum(1 for word in words if word in common_words)
            
            if total_words > 0:
                scores[lang] = matching_words / total_words
        
        return scores

    def _detect_by_patterns(self, text: str) -> Dict[str, float]:
        """언어별 패턴 기반 감지"""
        scores = {}
        
        # 한국어 조사 패턴
        if any(particle in text for particle in self.language_patterns['ko']['particles']):
            scores['ko'] = scores.get('ko', 0) + 0.3
        
        # 영어 전치사 패턴
        if any(prep in text.lower().split() for prep in self.language_patterns['en']['prepositions']):
            scores['en'] = scores.get('en', 0) + 0.3
        
        # 일본어 조사 패턴
        if any(particle in text for particle in self.language_patterns['ja']['particles']):
            scores['ja'] = scores.get('ja', 0) + 0.3
        
        # 중국어 구조 패턴
        if any(particle in text for particle in self.language_patterns['zh-cn']['particles']):
            scores['zh-cn'] = scores.get('zh-cn', 0) + 0.3
        
        return scores

    async def translate_text(self, text: str, target_language: str, 
                           source_language: str = None) -> TranslationResult:
        """텍스트 번역"""
        try:
            # 소스 언어 자동 감지
            if not source_language:
                source_language, confidence = await self.detect_language(text)
                if confidence < 0.7:
                    source_language = 'ko'  # 낮은 신뢰도시 한국어로 가정
            
            # 동일 언어인 경우
            if source_language == target_language:
                return TranslationResult(
                    original_text=text,
                    translated_text=text,
                    source_language=source_language,
                    target_language=target_language,
                    confidence=1.0,
                    method='same_language',
                    timestamp=datetime.now()
                )
            
            # 캐시 확인
            cache_key = f"{text}|{source_language}|{target_language}"
            if cache_key in self.translation_cache:
                cached_result = self.translation_cache[cache_key]
                self._update_cache_access(text, source_language, target_language)
                return cached_result
            
            # 1. 로컬 사전 번역 시도
            local_result = self._translate_local(text, source_language, target_language)
            if local_result:
                self._save_translation_cache(local_result)
                return local_result
            
            # 2. API 번역 (OpenAI 기반)
            api_result = await self._translate_with_openai(text, source_language, target_language)
            if api_result:
                self._save_translation_cache(api_result)
                return api_result
            
            # 3. 폴백: 단순 복사
            fallback_result = TranslationResult(
                original_text=text,
                translated_text=text,
                source_language=source_language,
                target_language=target_language,
                confidence=0.3,
                method='fallback',
                timestamp=datetime.now()
            )
            
            return fallback_result
            
        except Exception as e:
            logger.error(f"번역 오류: {e}")
            return TranslationResult(
                original_text=text,
                translated_text=text,
                source_language=source_language or 'ko',
                target_language=target_language,
                confidence=0.1,
                method='error',
                timestamp=datetime.now()
            )

    def _translate_local(self, text: str, source_lang: str, target_lang: str) -> Optional[TranslationResult]:
        """로컬 사전 기반 번역"""
        try:
            translated_parts = []
            confidence_scores = []
            
            # 단어별 번역 시도
            words = re.findall(r'\S+', text)
            
            for word in words:
                translated = False
                
                # 각 카테고리별 사전 확인
                for category, dictionaries in self.local_dictionaries.items():
                    if source_lang in dictionaries:
                        source_dict = dictionaries[source_lang]
                        if word in source_dict and target_lang in source_dict[word]:
                            translated_parts.append(source_dict[word][target_lang])
                            confidence_scores.append(0.9)
                            translated = True
                            break
                
                if not translated:
                    translated_parts.append(word)
                    confidence_scores.append(0.1)
            
            # 전체 신뢰도 계산
            overall_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.1
            
            # 50% 이상 번역된 경우만 유효
            if overall_confidence >= 0.5:
                translated_text = ' '.join(translated_parts)
                return TranslationResult(
                    original_text=text,
                    translated_text=translated_text,
                    source_language=source_lang,
                    target_language=target_lang,
                    confidence=overall_confidence,
                    method='local_dictionary',
                    timestamp=datetime.now()
                )
            
            return None
            
        except Exception as e:
            logger.error(f"로컬 번역 오류: {e}")
            return None

    async def _translate_with_openai(self, text: str, source_lang: str, target_lang: str) -> Optional[TranslationResult]:
        """OpenAI API 기반 번역"""
        try:
            # 언어 코드를 전체 언어명으로 변환
            lang_names = {
                'ko': 'Korean', 'en': 'English', 'ja': 'Japanese',
                'zh-cn': 'Chinese (Simplified)', 'zh-tw': 'Chinese (Traditional)',
                'es': 'Spanish', 'fr': 'French', 'de': 'German',
                'ru': 'Russian', 'pt': 'Portuguese'
            }
            
            source_name = lang_names.get(source_lang, 'Korean')
            target_name = lang_names.get(target_lang, 'English')
            
            # OpenAI 번역 프롬프트
            prompt = f"""
            다음 텍스트를 {source_name}에서 {target_name}로 정확하게 번역해주세요.
            전문용어(재건축, 조합, 환급금 등)는 맥락에 맞게 번역하고,
            존댓말/반말 톤은 원문의 톤을 유지해주세요.
            
            원문: {text}
            
            번역:
            """
            
            # API 호출 시뮬레이션 (실제로는 OpenAI API 사용)
            # 여기서는 간단한 로직으로 시뮬레이션
            if target_lang == 'en':
                # 한국어 → 영어 번역 시뮬레이션
                translated = self._simulate_korean_to_english(text)
            else:
                # 기타 언어는 기본 응답
                translated = f"[{target_name} translation of: {text}]"
            
            return TranslationResult(
                original_text=text,
                translated_text=translated,
                source_language=source_lang,
                target_language=target_lang,
                confidence=0.85,
                method='openai_api',
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"OpenAI 번역 오류: {e}")
            return None

    def _simulate_korean_to_english(self, text: str) -> str:
        """한국어 → 영어 번역 시뮬레이션"""
        # 기본적인 번역 시뮬레이션
        translations = {
            '안녕하세요': 'Hello',
            '감사합니다': 'Thank you',
            '죄송합니다': 'I\'m sorry',
            '네': 'Yes',
            '아니오': 'No',
            '재건축': 'reconstruction',
            '조합': 'association',
            '환급금': 'refund',
            '총회': 'general meeting',
            '시공사': 'construction company',
            '계약': 'contract',
            '회의': 'meeting'
        }
        
        result = text
        for ko, en in translations.items():
            result = result.replace(ko, en)
        
        return result

    def _save_translation_cache(self, result: TranslationResult):
        """번역 결과를 캐시에 저장"""
        try:
            cache_key = f"{result.original_text}|{result.source_language}|{result.target_language}"
            self.translation_cache[cache_key] = result
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO translation_cache 
                    (original_text, translated_text, source_language, target_language,
                     confidence, method, created_at, last_accessed)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    result.original_text, result.translated_text,
                    result.source_language, result.target_language,
                    result.confidence, result.method,
                    result.timestamp.isoformat(), datetime.now().isoformat()
                ))
                conn.commit()
                
        except Exception as e:
            logger.error(f"번역 캐시 저장 오류: {e}")

    def _update_cache_access(self, text: str, source_lang: str, target_lang: str):
        """캐시 접근 카운트 업데이트"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE translation_cache 
                    SET access_count = access_count + 1, last_accessed = ?
                    WHERE original_text = ? AND source_language = ? AND target_language = ?
                """, (datetime.now().isoformat(), text, source_lang, target_lang))
                conn.commit()
                
        except Exception as e:
            logger.error(f"캐시 접근 업데이트 오류: {e}")

    def _save_detection_log(self, text: str, detected_lang: str, confidence: float, method: str):
        """언어 감지 로그 저장"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO language_detection_log 
                    (text, detected_language, confidence, method, timestamp)
                    VALUES (?, ?, ?, ?, ?)
                """, (text, detected_lang, confidence, method, datetime.now().isoformat()))
                conn.commit()
                
        except Exception as e:
            logger.error(f"언어 감지 로그 저장 오류: {e}")

    async def batch_translate(self, texts: List[str], target_language: str, 
                            source_language: str = None) -> List[TranslationResult]:
        """배치 번역"""
        try:
            results = []
            
            # 병렬 번역 실행
            tasks = []
            for text in texts:
                task = self.translate_text(text, target_language, source_language)
                tasks.append(task)
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # 예외 처리
            valid_results = []
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.error(f"배치 번역 오류 (인덱스 {i}): {result}")
                    # 오류 시 기본 결과 생성
                    valid_results.append(TranslationResult(
                        original_text=texts[i],
                        translated_text=texts[i],
                        source_language=source_language or 'ko',
                        target_language=target_language,
                        confidence=0.1,
                        method='error',
                        timestamp=datetime.now()
                    ))
                else:
                    valid_results.append(result)
            
            return valid_results
            
        except Exception as e:
            logger.error(f"배치 번역 오류: {e}")
            return []

    def get_supported_languages(self) -> List[Dict[str, str]]:
        """지원 언어 목록 반환"""
        languages = [
            {'code': 'ko', 'name': '한국어', 'native_name': '한국어'},
            {'code': 'en', 'name': '영어', 'native_name': 'English'},
            {'code': 'ja', 'name': '일본어', 'native_name': '日本語'},
            {'code': 'zh-cn', 'name': '중국어(간체)', 'native_name': '简体中文'},
            {'code': 'zh-tw', 'name': '중국어(번체)', 'native_name': '繁體中文'},
            {'code': 'es', 'name': '스페인어', 'native_name': 'Español'},
            {'code': 'fr', 'name': '프랑스어', 'native_name': 'Français'},
            {'code': 'de', 'name': '독일어', 'native_name': 'Deutsch'},
            {'code': 'ru', 'name': '러시아어', 'native_name': 'Русский'},
            {'code': 'pt', 'name': '포르투갈어', 'native_name': 'Português'}
        ]
        
        return languages

    def get_translation_statistics(self, days: int = 30) -> Dict:
        """번역 통계 조회"""
        try:
            start_date = datetime.now() - timedelta(days=days)
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # 전체 번역 통계
                cursor.execute("""
                    SELECT 
                        COUNT(*) as total_translations,
                        AVG(confidence) as avg_confidence,
                        COUNT(DISTINCT source_language) as source_languages,
                        COUNT(DISTINCT target_language) as target_languages
                    FROM translation_cache 
                    WHERE created_at > ?
                """, (start_date.isoformat(),))
                
                stats = cursor.fetchone()
                
                # 언어별 통계
                cursor.execute("""
                    SELECT 
                        source_language, 
                        target_language, 
                        COUNT(*) as count,
                        AVG(confidence) as avg_confidence
                    FROM translation_cache 
                    WHERE created_at > ?
                    GROUP BY source_language, target_language
                    ORDER BY count DESC
                """, (start_date.isoformat(),))
                
                language_pairs = cursor.fetchall()
                
                # 방법별 통계
                cursor.execute("""
                    SELECT 
                        method, 
                        COUNT(*) as count,
                        AVG(confidence) as avg_confidence
                    FROM translation_cache 
                    WHERE created_at > ?
                    GROUP BY method
                    ORDER BY count DESC
                """, (start_date.isoformat(),))
                
                methods = cursor.fetchall()
                
                return {
                    'total_translations': stats[0] or 0,
                    'average_confidence': round(stats[1] or 0, 2),
                    'source_languages_count': stats[2] or 0,
                    'target_languages_count': stats[3] or 0,
                    'language_pairs': [
                        {
                            'source': pair[0], 'target': pair[1],
                            'count': pair[2], 'avg_confidence': round(pair[3], 2)
                        }
                        for pair in language_pairs
                    ],
                    'methods': [
                        {'method': method[0], 'count': method[1], 'avg_confidence': round(method[2], 2)}
                        for method in methods
                    ],
                    'period_days': days
                }
                
        except Exception as e:
            logger.error(f"번역 통계 조회 오류: {e}")
            return {}

# 전역 다국어 시스템 인스턴스
multilingual_system = MultilingualSystem()

# 비동기 함수들
async def detect_text_language(text: str) -> Tuple[str, float]:
    """텍스트 언어 감지"""
    return await multilingual_system.detect_language(text)

async def translate_message(text: str, target_language: str, source_language: str = None) -> TranslationResult:
    """메시지 번역"""
    return await multilingual_system.translate_text(text, target_language, source_language)

async def batch_translate_messages(texts: List[str], target_language: str, source_language: str = None) -> List[TranslationResult]:
    """메시지 배치 번역"""
    return await multilingual_system.batch_translate(texts, target_language, source_language)

if __name__ == "__main__":
    # 테스트 코드
    async def test_multilingual_system():
        # 언어 감지 테스트
        test_texts = [
            "안녕하세요. 재건축 조합 관련 문의드립니다.",
            "Hello, I have a question about the reconstruction project.",
            "こんにちは、再建築についてお聞きしたいことがあります。",
            "你好，我想咨询重建项目的事情。"
        ]
        
        for text in test_texts:
            lang, confidence = await detect_text_language(text)
            print(f"텍스트: {text}")
            print(f"감지된 언어: {lang} (신뢰도: {confidence:.2f})\n")
        
        # 번역 테스트
        korean_text = "환급금 3억을 받을 예정입니다. 총회에서 결정됩니다."
        
        for target_lang in ['en', 'ja', 'zh-cn']:
            result = await translate_message(korean_text, target_lang)
            print(f"번역 ({target_lang}): {result.translated_text}")
            print(f"신뢰도: {result.confidence:.2f}, 방법: {result.method}\n")
    
    asyncio.run(test_multilingual_system()) 