"""
Real-time Language Generation Engine
실시간 언어 생성 시스템

Features:
- Multi-modal text generation (creative writing, summarization, translation, Q&A)
- Real-time streaming generation
- Korean language specialization
- Quality assessment and optimization
- Template-based generation
- Style adaptation and transfer
- Context-aware generation
"""

import os
import json
import asyncio
import sqlite3
from typing import Dict, List, Optional, Any, AsyncGenerator, Union
from dataclasses import dataclass, asdict
from datetime import datetime
from enum import Enum
import logging
from pathlib import Path

# AI/ML imports
import openai
import anthropic
from transformers import (
    AutoTokenizer, AutoModelForCausalLM, AutoModelForSeq2SeqLM,
    T5ForConditionalGeneration, T5Tokenizer,
    pipeline, GPT2LMHeadModel, GPT2Tokenizer
)
import torch
from torch.nn.functional import softmax

# Korean NLP
from konlpy.tag import Okt, Mecab, Komoran
import kss
from googletrans import Translator

# FastAPI and async
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GenerationType(Enum):
    """Types of text generation"""
    CREATIVE_WRITING = "creative_writing"
    SUMMARIZATION = "summarization"
    TRANSLATION = "translation"
    QA = "question_answering"
    PARAPHRASING = "paraphrasing"
    STYLE_TRANSFER = "style_transfer"
    DIALOGUE = "dialogue"
    COMPLETION = "completion"

class GenerationQuality(Enum):
    """Quality levels for generation"""
    FAST = "fast"
    BALANCED = "balanced"
    QUALITY = "quality"
    CREATIVE = "creative"

@dataclass
class GenerationRequest:
    """Text generation request"""
    text: str
    generation_type: GenerationType
    quality: GenerationQuality = GenerationQuality.BALANCED
    language: str = "ko"
    target_language: str = None  # For translation
    style: str = "neutral"
    max_length: int = 512
    temperature: float = 0.7
    top_p: float = 0.9
    context: Optional[str] = None
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class GenerationResult:
    """Text generation result"""
    request_id: str
    generated_text: str
    generation_type: GenerationType
    quality_score: float
    processing_time: float
    model_used: str
    metadata: Dict[str, Any] = None
    alternatives: List[str] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}
        if self.alternatives is None:
            self.alternatives = []

@dataclass
class GenerationTemplate:
    """Template for text generation"""
    id: str
    name: str
    template: str
    generation_type: GenerationType
    variables: List[str]
    description: str
    examples: List[Dict[str, str]] = None
    
    def __post_init__(self):
        if self.examples is None:
            self.examples = []

class KoreanLanguageModels:
    """Korean language model management"""
    
    def __init__(self):
        self.models = {}
        self.tokenizers = {}
        self.pipelines = {}
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize Korean language models"""
        try:
            # Korean GPT models
            self._load_kogpt2()
            self._load_korean_t5()
            self._load_translation_models()
            
            logger.info("Korean language models initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing Korean models: {e}")
    
    def _load_kogpt2(self):
        """Load KoGPT-2 model"""
        try:
            model_name = "skt/kogpt2-base-v2"
            self.tokenizers['kogpt2'] = GPT2Tokenizer.from_pretrained(model_name)
            self.models['kogpt2'] = GPT2LMHeadModel.from_pretrained(model_name)
            
            # Special tokens
            if self.tokenizers['kogpt2'].pad_token is None:
                self.tokenizers['kogpt2'].pad_token = self.tokenizers['kogpt2'].eos_token
            
            logger.info("KoGPT-2 model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading KoGPT-2: {e}")
    
    def _load_korean_t5(self):
        """Load Korean T5 models"""
        try:
            # Korean T5 for summarization and Q&A
            model_name = "KETI-AIR/ke-t5-base"
            self.tokenizers['ke-t5'] = T5Tokenizer.from_pretrained(model_name)
            self.models['ke-t5'] = T5ForConditionalGeneration.from_pretrained(model_name)
            
            logger.info("Korean T5 model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading Korean T5: {e}")
    
    def _load_translation_models(self):
        """Load translation models"""
        try:
            # Korean-English translation
            self.pipelines['ko-en'] = pipeline(
                "translation",
                model="Helsinki-NLP/opus-mt-ko-en",
                tokenizer="Helsinki-NLP/opus-mt-ko-en"
            )
            
            self.pipelines['en-ko'] = pipeline(
                "translation", 
                model="Helsinki-NLP/opus-mt-en-ko",
                tokenizer="Helsinki-NLP/opus-mt-en-ko"
            )
            
            # Backup translator
            self.pipelines['google_translate'] = Translator()
            
            logger.info("Translation models loaded successfully")
        except Exception as e:
            logger.error(f"Error loading translation models: {e}")

class TextQualityAssessor:
    """Text quality assessment and optimization"""
    
    def __init__(self):
        self.korean_analyzer = Okt()
        self.quality_metrics = {}
    
    def assess_quality(self, text: str, generation_type: GenerationType) -> Dict[str, float]:
        """Assess text quality across multiple dimensions"""
        try:
            metrics = {}
            
            # Basic metrics
            metrics['length_score'] = self._assess_length(text, generation_type)
            metrics['readability_score'] = self._assess_readability(text)
            metrics['fluency_score'] = self._assess_fluency(text)
            metrics['coherence_score'] = self._assess_coherence(text)
            metrics['creativity_score'] = self._assess_creativity(text)
            
            # Type-specific metrics
            if generation_type == GenerationType.SUMMARIZATION:
                metrics['compression_score'] = self._assess_compression(text)
            elif generation_type == GenerationType.TRANSLATION:
                metrics['naturalness_score'] = self._assess_translation_naturalness(text)
            elif generation_type == GenerationType.CREATIVE_WRITING:
                metrics['engagement_score'] = self._assess_engagement(text)
            
            # Overall score
            metrics['overall_score'] = sum(metrics.values()) / len(metrics)
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error assessing text quality: {e}")
            return {'overall_score': 0.5}
    
    def _assess_length(self, text: str, generation_type: GenerationType) -> float:
        """Assess text length appropriateness"""
        length = len(text)
        
        # Optimal length ranges by type
        optimal_ranges = {
            GenerationType.SUMMARIZATION: (100, 300),
            GenerationType.TRANSLATION: (50, 1000),
            GenerationType.QA: (20, 200),
            GenerationType.CREATIVE_WRITING: (200, 1000),
            GenerationType.DIALOGUE: (10, 100)
        }
        
        optimal_min, optimal_max = optimal_ranges.get(generation_type, (50, 500))
        
        if optimal_min <= length <= optimal_max:
            return 1.0
        elif length < optimal_min:
            return length / optimal_min
        else:
            return max(0.1, optimal_max / length)
    
    def _assess_readability(self, text: str) -> float:
        """Assess text readability"""
        try:
            sentences = kss.split_sentences(text)
            if not sentences:
                return 0.0
            
            # Average sentence length
            avg_sentence_length = sum(len(sentence.split()) for sentence in sentences) / len(sentences)
            
            # Ideal range: 10-20 words per sentence
            if 10 <= avg_sentence_length <= 20:
                return 1.0
            elif avg_sentence_length < 10:
                return avg_sentence_length / 10
            else:
                return max(0.3, 20 / avg_sentence_length)
                
        except Exception:
            return 0.5
    
    def _assess_fluency(self, text: str) -> float:
        """Assess text fluency using Korean linguistic features"""
        try:
            # Morphological analysis
            morphs = self.korean_analyzer.morphs(text)
            pos_tags = self.korean_analyzer.pos(text)
            
            if not morphs:
                return 0.0
            
            # Check grammatical patterns
            fluency_score = 0.5
            
            # Check for proper particle usage (조사)
            particles = [tag for word, tag in pos_tags if tag == 'Josa']
            if len(particles) / len(pos_tags) > 0.1:  # Good particle density
                fluency_score += 0.2
            
            # Check for proper verb endings
            verb_endings = [tag for word, tag in pos_tags if tag in ['Eomi', 'PreEomi']]
            if len(verb_endings) > 0:
                fluency_score += 0.2
            
            # Check for repeated patterns (bad sign)
            unique_ratio = len(set(morphs)) / len(morphs)
            fluency_score += 0.1 * unique_ratio
            
            return min(1.0, fluency_score)
            
        except Exception:
            return 0.5
    
    def _assess_coherence(self, text: str) -> float:
        """Assess text coherence"""
        try:
            sentences = kss.split_sentences(text)
            if len(sentences) < 2:
                return 1.0
            
            # Simple coherence check based on topic consistency
            # In a real implementation, this would use semantic similarity
            coherence_score = 0.7  # Base score
            
            # Check for connecting words (연결어)
            connecting_words = ['그리고', '하지만', '그러나', '또한', '따라서', '그래서', '그런데']
            total_connections = 0
            
            for sentence in sentences:
                for word in connecting_words:
                    if word in sentence:
                        total_connections += 1
                        break
            
            # Higher connection ratio = better coherence
            connection_ratio = total_connections / len(sentences)
            coherence_score += 0.3 * min(1.0, connection_ratio * 2)
            
            return min(1.0, coherence_score)
            
        except Exception:
            return 0.5
    
    def _assess_creativity(self, text: str) -> float:
        """Assess text creativity"""
        try:
            words = text.split()
            if not words:
                return 0.0
            
            # Vocabulary diversity
            unique_words = set(words)
            diversity_ratio = len(unique_words) / len(words)
            
            # Metaphor detection (simple keyword-based)
            creative_patterns = ['같은', '처럼', '마치', '듯이', '것처럼']
            metaphor_count = sum(1 for pattern in creative_patterns if pattern in text)
            
            creativity_score = 0.3 + (0.4 * diversity_ratio) + (0.3 * min(1.0, metaphor_count / 3))
            
            return min(1.0, creativity_score)
            
        except Exception:
            return 0.5
    
    def _assess_compression(self, text: str) -> float:
        """Assess summarization compression quality"""
        # This would typically compare against the original text
        # For now, return a baseline score
        return 0.7
    
    def _assess_translation_naturalness(self, text: str) -> float:
        """Assess translation naturalness"""
        # Check for translation artifacts
        try:
            # Simple check for unnatural patterns
            artifacts = ['것이다', '하는 것', '되어야 한다']
            artifact_count = sum(1 for artifact in artifacts if artifact in text)
            
            # Lower artifact count = more natural
            naturalness = max(0.3, 1.0 - (artifact_count * 0.2))
            
            return naturalness
            
        except Exception:
            return 0.6
    
    def _assess_engagement(self, text: str) -> float:
        """Assess creative writing engagement"""
        try:
            # Check for engaging elements
            engaging_elements = ['!', '?', '"', ''', '"', '~']
            element_count = sum(text.count(element) for element in engaging_elements)
            
            # Variety in sentence structure
            sentences = kss.split_sentences(text)
            avg_length = sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 0
            length_variety = 1.0 if 8 <= avg_length <= 25 else 0.5
            
            engagement = 0.4 + (0.3 * min(1.0, element_count / 10)) + (0.3 * length_variety)
            
            return min(1.0, engagement)
            
        except Exception:
            return 0.5

class TemplateManager:
    """Template management for text generation"""
    
    def __init__(self):
        self.templates: Dict[str, GenerationTemplate] = {}
        self._initialize_default_templates()
    
    def _initialize_default_templates(self):
        """Initialize default generation templates"""
        
        # Creative writing templates
        self.templates['story_beginning'] = GenerationTemplate(
            id='story_beginning',
            name='이야기 시작',
            template='"{character}이(가) {setting}에서 {situation}을(를) 마주했을 때, ',
            generation_type=GenerationType.CREATIVE_WRITING,
            variables=['character', 'setting', 'situation'],
            description='이야기의 흥미로운 시작 부분을 생성합니다.',
            examples=[
                {
                    'character': '젊은 탐험가',
                    'setting': '신비로운 숲',
                    'situation': '이상한 빛'
                }
            ]
        )
        
        # Summarization templates
        self.templates['summary_formal'] = GenerationTemplate(
            id='summary_formal',
            name='공식 요약',
            template='다음 내용을 3-5문장으로 요약해주세요: {text}',
            generation_type=GenerationType.SUMMARIZATION,
            variables=['text'],
            description='공식적인 문서나 뉴스를 간결하게 요약합니다.'
        )
        
        # Q&A templates
        self.templates['qa_detailed'] = GenerationTemplate(
            id='qa_detailed',
            name='상세 답변',
            template='질문: {question}\n\n다음 정보를 바탕으로 상세히 답변해주세요:\n{context}\n\n답변:',
            generation_type=GenerationType.QA,
            variables=['question', 'context'],
            description='주어진 맥락을 바탕으로 상세한 답변을 생성합니다.'
        )
        
        # Translation templates
        self.templates['formal_translation'] = GenerationTemplate(
            id='formal_translation',
            name='공식 번역',
            template='다음을 {target_language}(으)로 정확하고 자연스럽게 번역해주세요: {text}',
            generation_type=GenerationType.TRANSLATION,
            variables=['text', 'target_language'],
            description='공식적인 문서나 내용을 자연스럽게 번역합니다.'
        )

class RealTimeGenerationEngine:
    """Main real-time text generation engine"""
    
    def __init__(self, db_path: str = "generation_engine.db"):
        self.db_path = db_path
        self.korean_models = KoreanLanguageModels()
        self.quality_assessor = TextQualityAssessor()
        self.template_manager = TemplateManager()
        self.active_sessions: Dict[str, Dict] = {}
        
        # External API clients
        self.openai_client = None
        self.anthropic_client = None
        
        self._initialize_database()
        self._initialize_api_clients()
    
    def _initialize_database(self):
        """Initialize SQLite database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Generation requests table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS generation_requests (
                    id TEXT PRIMARY KEY,
                    request_data TEXT NOT NULL,
                    result_data TEXT,
                    processing_time REAL,
                    quality_score REAL,
                    model_used TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Templates table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS templates (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    template TEXT NOT NULL,
                    generation_type TEXT NOT NULL,
                    variables TEXT,
                    description TEXT,
                    examples TEXT
                )
            ''')
            
            # Quality assessments table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS quality_assessments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    request_id TEXT,
                    assessment_data TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
            conn.close()
            logger.info("Generation engine database initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing database: {e}")
    
    def _initialize_api_clients(self):
        """Initialize external API clients"""
        try:
            # OpenAI
            openai_key = os.getenv('OPENAI_API_KEY')
            if openai_key:
                openai.api_key = openai_key
                self.openai_client = openai
            
            # Anthropic
            anthropic_key = os.getenv('ANTHROPIC_API_KEY')
            if anthropic_key:
                self.anthropic_client = anthropic.Anthropic(api_key=anthropic_key)
            
            logger.info("API clients initialized")
            
        except Exception as e:
            logger.error(f"Error initializing API clients: {e}")
    
    async def generate_text(self, request: GenerationRequest) -> GenerationResult:
        """Generate text based on request"""
        start_time = datetime.now()
        request_id = f"{int(start_time.timestamp())}"
        
        try:
            # Select appropriate model and method
            model_name, generated_text = await self._select_and_generate(request)
            
            # Assess quality
            quality_metrics = self.quality_assessor.assess_quality(
                generated_text, request.generation_type
            )
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            result = GenerationResult(
                request_id=request_id,
                generated_text=generated_text,
                generation_type=request.generation_type,
                quality_score=quality_metrics['overall_score'],
                processing_time=processing_time,
                model_used=model_name,
                metadata={
                    'quality_metrics': quality_metrics,
                    'request_params': asdict(request)
                }
            )
            
            # Save to database
            await self._save_generation_result(request, result)
            
            return result
            
        except Exception as e:
            logger.error(f"Error generating text: {e}")
            return GenerationResult(
                request_id=request_id,
                generated_text=f"생성 중 오류가 발생했습니다: {str(e)}",
                generation_type=request.generation_type,
                quality_score=0.0,
                processing_time=(datetime.now() - start_time).total_seconds(),
                model_used="error"
            )
    
    async def _select_and_generate(self, request: GenerationRequest) -> Tuple[str, str]:
        """Select appropriate model and generate text"""
        
        # Model selection based on type and quality
        if request.generation_type == GenerationType.CREATIVE_WRITING:
            if request.quality == GenerationQuality.CREATIVE and self.openai_client:
                return await self._generate_with_openai(request)
            else:
                return await self._generate_with_kogpt2(request)
                
        elif request.generation_type == GenerationType.SUMMARIZATION:
            if 'ke-t5' in self.korean_models.models:
                return await self._generate_with_korean_t5(request)
            else:
                return await self._generate_with_openai(request)
                
        elif request.generation_type == GenerationType.TRANSLATION:
            return await self._generate_translation(request)
            
        elif request.generation_type == GenerationType.QA:
            if request.quality == GenerationQuality.QUALITY and self.anthropic_client:
                return await self._generate_with_anthropic(request)
            else:
                return await self._generate_with_korean_t5(request)
        
        else:
            # Default to KoGPT-2
            return await self._generate_with_kogpt2(request)
    
    async def _generate_with_kogpt2(self, request: GenerationRequest) -> Tuple[str, str]:
        """Generate text using KoGPT-2"""
        try:
            if 'kogpt2' not in self.korean_models.models:
                raise Exception("KoGPT-2 model not available")
            
            model = self.korean_models.models['kogpt2']
            tokenizer = self.korean_models.tokenizers['kogpt2']
            
            # Prepare input
            input_text = self._prepare_input_text(request)
            
            # Tokenize
            inputs = tokenizer.encode(input_text, return_tensors='pt')
            
            # Generate
            with torch.no_grad():
                outputs = model.generate(
                    inputs,
                    max_length=min(inputs.shape[1] + request.max_length, 1024),
                    temperature=request.temperature,
                    top_p=request.top_p,
                    do_sample=True,
                    pad_token_id=tokenizer.eos_token_id
                )
            
            # Decode
            generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Remove input text from output
            if generated_text.startswith(input_text):
                generated_text = generated_text[len(input_text):].strip()
            
            return "kogpt2", generated_text
            
        except Exception as e:
            logger.error(f"Error with KoGPT-2 generation: {e}")
            return "kogpt2", "KoGPT-2 생성에 실패했습니다."
    
    async def _generate_with_korean_t5(self, request: GenerationRequest) -> Tuple[str, str]:
        """Generate text using Korean T5"""
        try:
            if 'ke-t5' not in self.korean_models.models:
                raise Exception("Korean T5 model not available")
            
            model = self.korean_models.models['ke-t5']
            tokenizer = self.korean_models.tokenizers['ke-t5']
            
            # Prepare input with task prefix
            input_text = self._prepare_t5_input(request)
            
            # Tokenize
            inputs = tokenizer.encode(input_text, return_tensors='pt', max_length=512, truncation=True)
            
            # Generate
            with torch.no_grad():
                outputs = model.generate(
                    inputs,
                    max_length=request.max_length,
                    temperature=request.temperature,
                    top_p=request.top_p,
                    do_sample=True
                )
            
            # Decode
            generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            return "ke-t5", generated_text
            
        except Exception as e:
            logger.error(f"Error with Korean T5 generation: {e}")
            return "ke-t5", "Korean T5 생성에 실패했습니다."
    
    async def _generate_with_openai(self, request: GenerationRequest) -> Tuple[str, str]:
        """Generate text using OpenAI GPT"""
        try:
            if not self.openai_client:
                raise Exception("OpenAI client not available")
            
            # Prepare prompt
            prompt = self._prepare_openai_prompt(request)
            
            # API call
            response = await asyncio.to_thread(
                self.openai_client.ChatCompletion.create,
                model="gpt-4" if request.quality == GenerationQuality.QUALITY else "gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "당신은 한국어 텍스트 생성 전문가입니다. 자연스럽고 유창한 한국어로 응답해주세요."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=request.max_length,
                temperature=request.temperature,
                top_p=request.top_p
            )
            
            generated_text = response.choices[0].message.content.strip()
            model_used = response.model
            
            return model_used, generated_text
            
        except Exception as e:
            logger.error(f"Error with OpenAI generation: {e}")
            return "openai", "OpenAI 생성에 실패했습니다."
    
    async def _generate_with_anthropic(self, request: GenerationRequest) -> Tuple[str, str]:
        """Generate text using Anthropic Claude"""
        try:
            if not self.anthropic_client:
                raise Exception("Anthropic client not available")
            
            # Prepare prompt
            prompt = self._prepare_anthropic_prompt(request)
            
            # API call
            response = await asyncio.to_thread(
                self.anthropic_client.messages.create,
                model="claude-3-sonnet-20240229",
                max_tokens=request.max_length,
                temperature=request.temperature,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            generated_text = response.content[0].text.strip()
            
            return "claude-3-sonnet", generated_text
            
        except Exception as e:
            logger.error(f"Error with Anthropic generation: {e}")
            return "claude", "Claude 생성에 실패했습니다."
    
    async def _generate_translation(self, request: GenerationRequest) -> Tuple[str, str]:
        """Generate translation"""
        try:
            source_lang = request.language
            target_lang = request.target_language or ('en' if source_lang == 'ko' else 'ko')
            
            # Use Helsinki NLP models for Korean-English translation
            if source_lang == 'ko' and target_lang == 'en':
                if 'ko-en' in self.korean_models.pipelines:
                    result = self.korean_models.pipelines['ko-en'](request.text)
                    translated = result[0]['translation_text']
                    return "helsinki-ko-en", translated
            
            elif source_lang == 'en' and target_lang == 'ko':
                if 'en-ko' in self.korean_models.pipelines:
                    result = self.korean_models.pipelines['en-ko'](request.text)
                    translated = result[0]['translation_text']
                    return "helsinki-en-ko", translated
            
            # Fallback to Google Translate
            if 'google_translate' in self.korean_models.pipelines:
                translator = self.korean_models.pipelines['google_translate']
                result = translator.translate(request.text, src=source_lang, dest=target_lang)
                return "google-translate", result.text
            
            return "fallback", "번역 서비스를 사용할 수 없습니다."
            
        except Exception as e:
            logger.error(f"Error with translation: {e}")
            return "translation", "번역 중 오류가 발생했습니다."
    
    def _prepare_input_text(self, request: GenerationRequest) -> str:
        """Prepare input text for generation"""
        if request.context:
            return f"{request.context}\n\n{request.text}"
        return request.text
    
    def _prepare_t5_input(self, request: GenerationRequest) -> str:
        """Prepare input for T5 model with task prefix"""
        task_prefixes = {
            GenerationType.SUMMARIZATION: "요약: ",
            GenerationType.QA: "질문답변: ",
            GenerationType.PARAPHRASING: "패러프레이징: ",
            GenerationType.COMPLETION: "완성: "
        }
        
        prefix = task_prefixes.get(request.generation_type, "")
        input_text = self._prepare_input_text(request)
        
        return f"{prefix}{input_text}"
    
    def _prepare_openai_prompt(self, request: GenerationRequest) -> str:
        """Prepare prompt for OpenAI models"""
        type_instructions = {
            GenerationType.CREATIVE_WRITING: "창의적인 글을 작성해주세요.",
            GenerationType.SUMMARIZATION: "다음 내용을 간결하게 요약해주세요.",
            GenerationType.QA: "다음 질문에 정확하고 상세하게 답변해주세요.",
            GenerationType.PARAPHRASING: "다음 내용을 다른 표현으로 바꿔 작성해주세요.",
            GenerationType.STYLE_TRANSFER: f"다음 내용을 {request.style} 스타일로 다시 작성해주세요."
        }
        
        instruction = type_instructions.get(request.generation_type, "다음 내용을 바탕으로 텍스트를 생성해주세요.")
        input_text = self._prepare_input_text(request)
        
        return f"{instruction}\n\n{input_text}"
    
    def _prepare_anthropic_prompt(self, request: GenerationRequest) -> str:
        """Prepare prompt for Anthropic models"""
        # Similar to OpenAI but with Claude-specific formatting
        return self._prepare_openai_prompt(request)
    
    async def _save_generation_result(self, request: GenerationRequest, result: GenerationResult):
        """Save generation result to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO generation_requests 
                (id, request_data, result_data, processing_time, quality_score, model_used)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                result.request_id,
                json.dumps(asdict(request), default=str),
                json.dumps(asdict(result), default=str),
                result.processing_time,
                result.quality_score,
                result.model_used
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error saving generation result: {e}")
    
    async def generate_stream(self, request: GenerationRequest) -> AsyncGenerator[str, None]:
        """Generate text with streaming output"""
        try:
            # For streaming, we'll simulate by yielding chunks
            # In a real implementation, this would use actual streaming APIs
            
            result = await self.generate_text(request)
            text = result.generated_text
            
            # Yield text in chunks
            chunk_size = 10
            words = text.split()
            
            for i in range(0, len(words), chunk_size):
                chunk = ' '.join(words[i:i + chunk_size])
                yield f"data: {json.dumps({'text': chunk, 'done': False})}\n\n"
                await asyncio.sleep(0.1)  # Simulate typing delay
            
            yield f"data: {json.dumps({'text': '', 'done': True, 'metadata': result.metadata})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"

# FastAPI application
app = FastAPI(title="Real-time Language Generation Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global generation engine instance
generation_engine = RealTimeGenerationEngine()

@app.on_event("startup")
async def startup_event():
    """Initialize generation engine on startup"""
    logger.info("Real-time Language Generation Engine starting up...")

@app.post("/api/generate")
async def generate_text(request_data: Dict[str, Any]):
    """Generate text"""
    try:
        request = GenerationRequest(
            text=request_data['text'],
            generation_type=GenerationType(request_data.get('generation_type', 'completion')),
            quality=GenerationQuality(request_data.get('quality', 'balanced')),
            language=request_data.get('language', 'ko'),
            target_language=request_data.get('target_language'),
            style=request_data.get('style', 'neutral'),
            max_length=request_data.get('max_length', 512),
            temperature=request_data.get('temperature', 0.7),
            top_p=request_data.get('top_p', 0.9),
            context=request_data.get('context'),
            metadata=request_data.get('metadata', {})
        )
        
        result = await generation_engine.generate_text(request)
        
        return {
            "request_id": result.request_id,
            "generated_text": result.generated_text,
            "generation_type": result.generation_type.value,
            "quality_score": result.quality_score,
            "processing_time": result.processing_time,
            "model_used": result.model_used,
            "metadata": result.metadata
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/generate/stream")
async def generate_text_stream(request_data: Dict[str, Any]):
    """Generate text with streaming"""
    try:
        request = GenerationRequest(
            text=request_data['text'],
            generation_type=GenerationType(request_data.get('generation_type', 'completion')),
            quality=GenerationQuality(request_data.get('quality', 'balanced')),
            language=request_data.get('language', 'ko'),
            target_language=request_data.get('target_language'),
            style=request_data.get('style', 'neutral'),
            max_length=request_data.get('max_length', 512),
            temperature=request_data.get('temperature', 0.7),
            top_p=request_data.get('top_p', 0.9),
            context=request_data.get('context'),
            metadata=request_data.get('metadata', {})
        )
        
        return StreamingResponse(
            generation_engine.generate_stream(request),
            media_type="text/plain",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/templates")
async def get_templates():
    """Get available templates"""
    templates = generation_engine.template_manager.templates
    return {
        "templates": [
            {
                "id": template.id,
                "name": template.name,
                "generation_type": template.generation_type.value,
                "description": template.description,
                "variables": template.variables,
                "examples": template.examples
            }
            for template in templates.values()
        ]
    }

@app.post("/api/templates")
async def create_template(template_data: Dict[str, Any]):
    """Create a new template"""
    try:
        template = GenerationTemplate(
            id=template_data['id'],
            name=template_data['name'],
            template=template_data['template'],
            generation_type=GenerationType(template_data['generation_type']),
            variables=template_data['variables'],
            description=template_data['description'],
            examples=template_data.get('examples', [])
        )
        
        generation_engine.template_manager.templates[template.id] = template
        
        return {"status": "success", "template_id": template.id}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time generation"""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            
            if data.get('type') == 'generate':
                request = GenerationRequest(
                    text=data['text'],
                    generation_type=GenerationType(data.get('generation_type', 'completion')),
                    quality=GenerationQuality(data.get('quality', 'balanced')),
                    language=data.get('language', 'ko'),
                    max_length=data.get('max_length', 256),
                    temperature=data.get('temperature', 0.7)
                )
                
                result = await generation_engine.generate_text(request)
                
                await websocket.send_json({
                    'type': 'generation_result',
                    'request_id': result.request_id,
                    'generated_text': result.generated_text,
                    'quality_score': result.quality_score,
                    'processing_time': result.processing_time,
                    'model_used': result.model_used
                })
                
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8003) 