"""
Conversation Memory and Context Understanding System
대화 맥락 이해 및 기억 시스템

Features:
- Long-term conversation memory
- User personalization and profiling
- Context-aware response generation
- Emotional state tracking
- Relationship dynamics analysis
- Knowledge persistence and retrieval
- Multi-session conversation tracking
"""

import os
import json
import sqlite3
import hashlib
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict, field
from datetime import datetime, timedelta
from enum import Enum
import logging
import numpy as np

# AI/ML imports
from sentence_transformers import SentenceTransformer
from sklearn.cluster import DBSCAN
from sklearn.metrics.pairwise import cosine_similarity
import faiss

# Korean NLP
from konlpy.tag import Okt, Mecab
import kss

# FastAPI and async
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MemoryType(Enum):
    """Types of memory"""
    EPISODIC = "episodic"  # Specific conversation episodes
    SEMANTIC = "semantic"  # General knowledge about user
    PROCEDURAL = "procedural"  # How to interact with user
    EMOTIONAL = "emotional"  # Emotional patterns and preferences

class PersonalityTrait(Enum):
    """User personality traits"""
    EXTROVERT = "extrovert"
    INTROVERT = "introvert"
    FORMAL = "formal"
    INFORMAL = "informal"
    ANALYTICAL = "analytical"
    CREATIVE = "creative"
    PATIENT = "patient"
    IMPATIENT = "impatient"

class EmotionalState(Enum):
    """Emotional states"""
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"
    EXCITED = "excited"
    FRUSTRATED = "frustrated"
    CURIOUS = "curious"
    SATISFIED = "satisfied"

@dataclass
class ConversationMessage:
    """Individual conversation message"""
    id: str
    user_id: str
    session_id: str
    content: str
    timestamp: datetime
    speaker: str  # 'user' or 'assistant'
    emotional_tone: Optional[EmotionalState] = None
    topics: List[str] = field(default_factory=list)
    keywords: List[str] = field(default_factory=list)
    intent: Optional[str] = None
    confidence: float = 0.0
    embedding: Optional[List[float]] = None

@dataclass
class ConversationSession:
    """Conversation session"""
    id: str
    user_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    messages: List[ConversationMessage] = field(default_factory=list)
    summary: Optional[str] = None
    topics: List[str] = field(default_factory=list)
    emotional_arc: List[EmotionalState] = field(default_factory=list)
    satisfaction_score: Optional[float] = None

@dataclass
class UserProfile:
    """Comprehensive user profile"""
    user_id: str
    name: Optional[str] = None
    personality_traits: List[PersonalityTrait] = field(default_factory=list)
    preferences: Dict[str, Any] = field(default_factory=dict)
    interests: List[str] = field(default_factory=list)
    communication_style: Dict[str, float] = field(default_factory=dict)
    emotional_patterns: Dict[str, float] = field(default_factory=dict)
    knowledge_areas: List[str] = field(default_factory=list)
    relationship_history: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    last_updated: datetime = field(default_factory=datetime.now)

@dataclass
class MemoryItem:
    """Individual memory item"""
    id: str
    user_id: str
    memory_type: MemoryType
    content: str
    importance_score: float
    created_at: datetime
    last_accessed: datetime
    access_count: int = 0
    tags: List[str] = field(default_factory=list)
    related_sessions: List[str] = field(default_factory=list)
    embedding: Optional[List[float]] = None
    decay_factor: float = 1.0

@dataclass
class ContextState:
    """Current conversation context"""
    user_id: str
    session_id: str
    current_topics: List[str] = field(default_factory=list)
    emotional_state: EmotionalState = EmotionalState.NEUTRAL
    conversation_mode: str = "general"
    active_memories: List[MemoryItem] = field(default_factory=list)
    user_intent: Optional[str] = None
    context_window: List[ConversationMessage] = field(default_factory=list)
    last_updated: datetime = field(default_factory=datetime.now)

class PersonalityAnalyzer:
    """Analyze user personality from conversation patterns"""
    
    def __init__(self):
        self.korean_analyzer = Okt()
        self.trait_patterns = self._initialize_trait_patterns()
    
    def _initialize_trait_patterns(self) -> Dict[PersonalityTrait, Dict[str, List[str]]]:
        """Initialize personality trait detection patterns"""
        return {
            PersonalityTrait.FORMAL: {
                'formal_words': ['습니다', '됩니다', '있습니다', '해주세요', '부탁드립니다'],
                'formal_patterns': ['요', '니다', '께서']
            },
            PersonalityTrait.INFORMAL: {
                'informal_words': ['해', '야', '지', '거야', '잖아'],
                'informal_patterns': ['ㅋㅋ', 'ㅎㅎ', '~']
            },
            PersonalityTrait.ANALYTICAL: {
                'analytical_words': ['분석', '데이터', '논리', '근거', '증명', '통계'],
                'question_patterns': ['왜', '어떻게', '무엇', '언제', '어디서']
            },
            PersonalityTrait.CREATIVE: {
                'creative_words': ['창의', '아이디어', '상상', '예술', '디자인', '독창'],
                'expression_patterns': ['!', '~', '♪', '★']
            },
            PersonalityTrait.EXTROVERT: {
                'social_words': ['친구', '모임', '파티', '사람들', '함께', '같이'],
                'energy_patterns': ['!!', '와', '대박', '진짜']
            },
            PersonalityTrait.INTROVERT: {
                'solitary_words': ['혼자', '조용히', '차분히', '생각', '독서'],
                'reserved_patterns': ['...', '음', '글쎄']
            }
        }
    
    def analyze_personality(self, messages: List[ConversationMessage]) -> Dict[PersonalityTrait, float]:
        """Analyze personality traits from conversation messages"""
        trait_scores = {trait: 0.0 for trait in PersonalityTrait}
        total_messages = len(messages)
        
        if total_messages == 0:
            return trait_scores
        
        for message in messages:
            if message.speaker == 'user':
                message_scores = self._analyze_message_personality(message.content)
                for trait, score in message_scores.items():
                    trait_scores[trait] += score
        
        # Normalize scores
        for trait in trait_scores:
            trait_scores[trait] = min(1.0, trait_scores[trait] / total_messages)
        
        return trait_scores
    
    def _analyze_message_personality(self, text: str) -> Dict[PersonalityTrait, float]:
        """Analyze personality traits in a single message"""
        scores = {trait: 0.0 for trait in PersonalityTrait}
        
        # Tokenize text
        words = self.korean_analyzer.morphs(text)
        text_lower = text.lower()
        
        for trait, patterns in self.trait_patterns.items():
            score = 0.0
            
            # Check word patterns
            if 'formal_words' in patterns:
                score += sum(1 for word in patterns['formal_words'] if word in text) * 0.3
            if 'informal_words' in patterns:
                score += sum(1 for word in patterns['informal_words'] if word in text) * 0.3
            if 'analytical_words' in patterns:
                score += sum(1 for word in patterns['analytical_words'] if word in text) * 0.4
            if 'creative_words' in patterns:
                score += sum(1 for word in patterns['creative_words'] if word in text) * 0.4
            if 'social_words' in patterns:
                score += sum(1 for word in patterns['social_words'] if word in text) * 0.3
            if 'solitary_words' in patterns:
                score += sum(1 for word in patterns['solitary_words'] if word in text) * 0.3
            
            # Check pattern expressions
            for pattern_type in ['formal_patterns', 'informal_patterns', 'question_patterns', 
                               'expression_patterns', 'energy_patterns', 'reserved_patterns']:
                if pattern_type in patterns:
                    for pattern in patterns[pattern_type]:
                        score += text.count(pattern) * 0.2
            
            scores[trait] = min(1.0, score)
        
        return scores

class EmotionalAnalyzer:
    """Analyze emotional states from conversation"""
    
    def __init__(self):
        self.korean_analyzer = Okt()
        self.emotion_lexicon = self._initialize_emotion_lexicon()
    
    def _initialize_emotion_lexicon(self) -> Dict[EmotionalState, List[str]]:
        """Initialize emotion detection lexicon"""
        return {
            EmotionalState.POSITIVE: [
                '좋아', '행복', '기뻐', '만족', '감사', '즐거워', '신나', '멋져', 
                '훌륭', '완벽', '최고', '대단', '웃음', '미소'
            ],
            EmotionalState.NEGATIVE: [
                '슬퍼', '화나', '짜증', '답답', '실망', '우울', '걱정', '불안',
                '스트레스', '피곤', '힘들어', '어려워', '나빠', '싫어'
            ],
            EmotionalState.EXCITED: [
                '와', '대박', '진짜', '놀라워', '흥미', '기대', '설렘', '신기',
                '궁금', '재밌어', '쩔어', '작업', '열정'
            ],
            EmotionalState.FRUSTRATED: [
                '답답', '짜증', '막막', '어렵다', '복잡', '헷갈려', '모르겠어',
                '안되네', '실패', '문제', '오류', '버그'
            ],
            EmotionalState.CURIOUS: [
                '궁금', '알고싶어', '왜', '어떻게', '무엇', '언제', '어디',
                '흥미', '관심', '배우고', '알아보자', '탐구'
            ],
            EmotionalState.SATISFIED: [
                '만족', '충분', '완성', '성공', '해결', '끝났네', '됐다',
                '좋네', '완료', '달성', '목표'
            ]
        }
    
    def analyze_emotion(self, text: str) -> Tuple[EmotionalState, float]:
        """Analyze emotional state from text"""
        emotion_scores = {emotion: 0.0 for emotion in EmotionalState}
        
        # Tokenize text
        words = self.korean_analyzer.morphs(text)
        text_lower = text.lower()
        
        # Score based on emotion words
        for emotion, emotion_words in self.emotion_lexicon.items():
            for word in emotion_words:
                if word in text_lower:
                    emotion_scores[emotion] += 1.0
        
        # Consider punctuation and expressions
        if '!' in text:
            emotion_scores[EmotionalState.EXCITED] += 0.5
        if '?' in text:
            emotion_scores[EmotionalState.CURIOUS] += 0.3
        if '...' in text:
            emotion_scores[EmotionalState.FRUSTRATED] += 0.3
        
        # Normalize scores
        total_score = sum(emotion_scores.values())
        if total_score > 0:
            for emotion in emotion_scores:
                emotion_scores[emotion] /= total_score
        
        # Find dominant emotion
        dominant_emotion = max(emotion_scores.items(), key=lambda x: x[1])
        
        # Return neutral if no strong emotion detected
        if dominant_emotion[1] < 0.3:
            return EmotionalState.NEUTRAL, 0.5
        
        return dominant_emotion[0], dominant_emotion[1]

class MemoryManager:
    """Manage conversation memories with forgetting and reinforcement"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.embedder = SentenceTransformer('jhgan/ko-sroberta-multitask')
        self.memory_index = faiss.IndexFlatIP(384)  # Sentence transformer dimension
        self.memory_ids = []
        self._initialize_database()
    
    def _initialize_database(self):
        """Initialize memory database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Memory table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS memories (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    memory_type TEXT NOT NULL,
                    content TEXT NOT NULL,
                    importance_score REAL,
                    created_at TIMESTAMP,
                    last_accessed TIMESTAMP,
                    access_count INTEGER DEFAULT 0,
                    tags TEXT,
                    related_sessions TEXT,
                    embedding BLOB,
                    decay_factor REAL DEFAULT 1.0
                )
            ''')
            
            # User profiles table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_profiles (
                    user_id TEXT PRIMARY KEY,
                    name TEXT,
                    personality_traits TEXT,
                    preferences TEXT,
                    interests TEXT,
                    communication_style TEXT,
                    emotional_patterns TEXT,
                    knowledge_areas TEXT,
                    relationship_history TEXT,
                    created_at TIMESTAMP,
                    last_updated TIMESTAMP
                )
            ''')
            
            # Conversation sessions table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS conversation_sessions (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    start_time TIMESTAMP,
                    end_time TIMESTAMP,
                    summary TEXT,
                    topics TEXT,
                    emotional_arc TEXT,
                    satisfaction_score REAL
                )
            ''')
            
            # Messages table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS conversation_messages (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    session_id TEXT NOT NULL,
                    content TEXT NOT NULL,
                    timestamp TIMESTAMP,
                    speaker TEXT NOT NULL,
                    emotional_tone TEXT,
                    topics TEXT,
                    keywords TEXT,
                    intent TEXT,
                    confidence REAL,
                    embedding BLOB
                )
            ''')
            
            conn.commit()
            conn.close()
            logger.info("Memory database initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing memory database: {e}")
    
    def create_memory(self, user_id: str, memory_type: MemoryType, 
                     content: str, importance_score: float = 0.5,
                     tags: List[str] = None, related_sessions: List[str] = None) -> MemoryItem:
        """Create a new memory item"""
        try:
            memory_id = hashlib.md5(f"{user_id}_{content}_{datetime.now()}".encode()).hexdigest()
            
            # Generate embedding
            embedding = self.embedder.encode(content).tolist()
            
            memory = MemoryItem(
                id=memory_id,
                user_id=user_id,
                memory_type=memory_type,
                content=content,
                importance_score=importance_score,
                created_at=datetime.now(),
                last_accessed=datetime.now(),
                tags=tags or [],
                related_sessions=related_sessions or [],
                embedding=embedding
            )
            
            # Save to database
            self._save_memory(memory)
            
            # Add to vector index
            self.memory_index.add(np.array([embedding]))
            self.memory_ids.append(memory_id)
            
            logger.info(f"Created memory {memory_id} for user {user_id}")
            return memory
            
        except Exception as e:
            logger.error(f"Error creating memory: {e}")
            return None
    
    def _save_memory(self, memory: MemoryItem):
        """Save memory to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO memories 
                (id, user_id, memory_type, content, importance_score, created_at, 
                 last_accessed, access_count, tags, related_sessions, embedding, decay_factor)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                memory.id,
                memory.user_id,
                memory.memory_type.value,
                memory.content,
                memory.importance_score,
                memory.created_at.isoformat(),
                memory.last_accessed.isoformat(),
                memory.access_count,
                json.dumps(memory.tags),
                json.dumps(memory.related_sessions),
                json.dumps(memory.embedding),
                memory.decay_factor
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error saving memory: {e}")
    
    def retrieve_memories(self, user_id: str, query: str, 
                         memory_type: Optional[MemoryType] = None,
                         limit: int = 10) -> List[MemoryItem]:
        """Retrieve relevant memories"""
        try:
            # Generate query embedding
            query_embedding = self.embedder.encode(query)
            
            # Search similar memories
            scores, indices = self.memory_index.search(
                query_embedding.reshape(1, -1), min(limit * 2, len(self.memory_ids))
            )
            
            # Get memory details from database
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            memories = []
            for score, idx in zip(scores[0], indices[0]):
                if idx < len(self.memory_ids):
                    memory_id = self.memory_ids[idx]
                    
                    # Apply filters
                    filter_conditions = ["user_id = ?", "id = ?"]
                    filter_params = [user_id, memory_id]
                    
                    if memory_type:
                        filter_conditions.append("memory_type = ?")
                        filter_params.append(memory_type.value)
                    
                    cursor.execute(f'''
                        SELECT * FROM memories 
                        WHERE {" AND ".join(filter_conditions)}
                    ''', filter_params)
                    
                    row = cursor.fetchone()
                    if row:
                        memory = self._row_to_memory(row)
                        memory.access_count += 1
                        memory.last_accessed = datetime.now()
                        
                        # Update access information
                        self._update_memory_access(memory)
                        
                        memories.append(memory)
                        
                        if len(memories) >= limit:
                            break
            
            conn.close()
            
            # Apply memory decay and importance filtering
            memories = self._apply_memory_decay(memories)
            memories.sort(key=lambda m: m.importance_score * m.decay_factor, reverse=True)
            
            return memories[:limit]
            
        except Exception as e:
            logger.error(f"Error retrieving memories: {e}")
            return []
    
    def _row_to_memory(self, row) -> MemoryItem:
        """Convert database row to MemoryItem"""
        return MemoryItem(
            id=row[0],
            user_id=row[1],
            memory_type=MemoryType(row[2]),
            content=row[3],
            importance_score=row[4],
            created_at=datetime.fromisoformat(row[5]),
            last_accessed=datetime.fromisoformat(row[6]),
            access_count=row[7],
            tags=json.loads(row[8]) if row[8] else [],
            related_sessions=json.loads(row[9]) if row[9] else [],
            embedding=json.loads(row[10]) if row[10] else None,
            decay_factor=row[11]
        )
    
    def _update_memory_access(self, memory: MemoryItem):
        """Update memory access information"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE memories 
                SET access_count = ?, last_accessed = ?
                WHERE id = ?
            ''', (memory.access_count, memory.last_accessed.isoformat(), memory.id))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error updating memory access: {e}")
    
    def _apply_memory_decay(self, memories: List[MemoryItem]) -> List[MemoryItem]:
        """Apply time-based memory decay"""
        now = datetime.now()
        
        for memory in memories:
            # Calculate time-based decay
            days_since_creation = (now - memory.created_at).days
            days_since_access = (now - memory.last_accessed).days
            
            # Decay formula: more recent access and higher access count = less decay
            base_decay = max(0.1, 1.0 - (days_since_access * 0.02))
            access_boost = min(0.3, memory.access_count * 0.05)
            importance_factor = memory.importance_score
            
            memory.decay_factor = min(1.0, base_decay + access_boost) * importance_factor
        
        return memories
    
    def consolidate_memories(self, user_id: str) -> int:
        """Consolidate similar memories to prevent redundancy"""
        try:
            # Get all memories for user
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('SELECT * FROM memories WHERE user_id = ?', (user_id,))
            rows = cursor.fetchall()
            
            memories = [self._row_to_memory(row) for row in rows]
            
            if len(memories) < 2:
                return 0
            
            # Group similar memories
            embeddings = np.array([memory.embedding for memory in memories if memory.embedding])
            
            if len(embeddings) == 0:
                return 0
            
            # Use DBSCAN clustering to find similar memories
            clustering = DBSCAN(eps=0.8, min_samples=2, metric='cosine')
            cluster_labels = clustering.fit_predict(embeddings)
            
            consolidated_count = 0
            
            # Process each cluster
            for cluster_id in set(cluster_labels):
                if cluster_id == -1:  # Noise points
                    continue
                
                cluster_indices = np.where(cluster_labels == cluster_id)[0]
                cluster_memories = [memories[i] for i in cluster_indices]
                
                if len(cluster_memories) > 1:
                    # Consolidate memories in this cluster
                    consolidated_count += self._consolidate_memory_cluster(cluster_memories)
            
            conn.close()
            return consolidated_count
            
        except Exception as e:
            logger.error(f"Error consolidating memories: {e}")
            return 0
    
    def _consolidate_memory_cluster(self, memories: List[MemoryItem]) -> int:
        """Consolidate a cluster of similar memories"""
        try:
            # Keep the most important/recent memory
            primary_memory = max(memories, key=lambda m: m.importance_score * m.decay_factor)
            
            # Merge information from other memories
            all_tags = set(primary_memory.tags)
            all_sessions = set(primary_memory.related_sessions)
            total_access_count = primary_memory.access_count
            
            for memory in memories:
                if memory.id != primary_memory.id:
                    all_tags.update(memory.tags)
                    all_sessions.update(memory.related_sessions)
                    total_access_count += memory.access_count
            
            # Update primary memory
            primary_memory.tags = list(all_tags)
            primary_memory.related_sessions = list(all_sessions)
            primary_memory.access_count = total_access_count
            primary_memory.importance_score = min(1.0, primary_memory.importance_score * 1.2)
            
            # Save updated primary memory
            self._save_memory(primary_memory)
            
            # Delete other memories
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            for memory in memories:
                if memory.id != primary_memory.id:
                    cursor.execute('DELETE FROM memories WHERE id = ?', (memory.id,))
            
            conn.commit()
            conn.close()
            
            return len(memories) - 1  # Number of memories consolidated
            
        except Exception as e:
            logger.error(f"Error consolidating memory cluster: {e}")
            return 0

class ConversationMemorySystem:
    """Main conversation memory and context system"""
    
    def __init__(self, db_path: str = "conversation_memory.db"):
        self.db_path = db_path
        self.memory_manager = MemoryManager(db_path)
        self.personality_analyzer = PersonalityAnalyzer()
        self.emotional_analyzer = EmotionalAnalyzer()
        self.user_profiles: Dict[str, UserProfile] = {}
        self.active_contexts: Dict[str, ContextState] = {}
        self.korean_analyzer = Okt()
        
        self._load_user_profiles()
    
    def _load_user_profiles(self):
        """Load user profiles from database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('SELECT * FROM user_profiles')
            rows = cursor.fetchall()
            
            for row in rows:
                profile = UserProfile(
                    user_id=row[0],
                    name=row[1],
                    personality_traits=[PersonalityTrait(t) for t in json.loads(row[2]) if row[2]],
                    preferences=json.loads(row[3]) if row[3] else {},
                    interests=json.loads(row[4]) if row[4] else [],
                    communication_style=json.loads(row[5]) if row[5] else {},
                    emotional_patterns=json.loads(row[6]) if row[6] else {},
                    knowledge_areas=json.loads(row[7]) if row[7] else [],
                    relationship_history=json.loads(row[8]) if row[8] else {},
                    created_at=datetime.fromisoformat(row[9]) if row[9] else datetime.now(),
                    last_updated=datetime.fromisoformat(row[10]) if row[10] else datetime.now()
                )
                self.user_profiles[profile.user_id] = profile
            
            conn.close()
            logger.info(f"Loaded {len(self.user_profiles)} user profiles")
            
        except Exception as e:
            logger.error(f"Error loading user profiles: {e}")
    
    def process_message(self, user_id: str, session_id: str, 
                       content: str, speaker: str = 'user') -> ContextState:
        """Process a new message and update context"""
        try:
            # Create message object
            message = ConversationMessage(
                id=hashlib.md5(f"{user_id}_{session_id}_{content}_{datetime.now()}".encode()).hexdigest(),
                user_id=user_id,
                session_id=session_id,
                content=content,
                timestamp=datetime.now(),
                speaker=speaker
            )
            
            # Analyze message
            self._analyze_message(message)
            
            # Update or create context
            if session_id not in self.active_contexts:
                self.active_contexts[session_id] = ContextState(
                    user_id=user_id,
                    session_id=session_id
                )
            
            context = self.active_contexts[session_id]
            
            # Update context with new message
            context.context_window.append(message)
            if len(context.context_window) > 10:  # Keep last 10 messages
                context.context_window = context.context_window[-10:]
            
            # Update emotional state
            if message.emotional_tone:
                context.emotional_state = message.emotional_tone
            
            # Update topics
            if message.topics:
                context.current_topics = list(set(context.current_topics + message.topics))
                if len(context.current_topics) > 5:
                    context.current_topics = context.current_topics[-5:]
            
            # Retrieve relevant memories
            relevant_memories = self.memory_manager.retrieve_memories(
                user_id, content, limit=5
            )
            context.active_memories = relevant_memories
            
            # Update user profile
            self._update_user_profile(user_id, message)
            
            # Create memories for important interactions
            if speaker == 'user' and len(content) > 20:
                self._create_interaction_memory(user_id, session_id, message)
            
            context.last_updated = datetime.now()
            
            return context
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return self.active_contexts.get(session_id) or ContextState(user_id, session_id)
    
    def _analyze_message(self, message: ConversationMessage):
        """Analyze message content for various attributes"""
        try:
            content = message.content
            
            # Emotional analysis
            emotion, confidence = self.emotional_analyzer.analyze_emotion(content)
            message.emotional_tone = emotion
            message.confidence = confidence
            
            # Topic extraction (simple keyword-based)
            keywords = self.korean_analyzer.nouns(content)
            message.keywords = [kw for kw in keywords if len(kw) > 1][:10]
            
            # Simple topic categorization
            topics = []
            if any(word in content for word in ['카카오톡', '대화', '대화', '메시지']):
                topics.append('카카오톡')
            if any(word in content for word in ['AI', '인공지능', '로봇', '자동']):
                topics.append('AI')
            if any(word in content for word in ['개발', '프로그래밍', '코딩', '시스템']):
                topics.append('개발')
            if any(word in content for word in ['분석', '데이터', '통계']):
                topics.append('분석')
            
            message.topics = topics
            
            # Intent detection (basic)
            if any(word in content for word in ['도움', '알려', '방법', '어떻게']):
                message.intent = 'help_request'
            elif any(word in content for word in ['고마워', '감사', '좋아']):
                message.intent = 'appreciation'
            elif any(word in content for word in ['문제', '오류', '안돼', '실패']):
                message.intent = 'problem_report'
            else:
                message.intent = 'general'
            
        except Exception as e:
            logger.error(f"Error analyzing message: {e}")
    
    def _update_user_profile(self, user_id: str, message: ConversationMessage):
        """Update user profile based on new message"""
        try:
            if user_id not in self.user_profiles:
                self.user_profiles[user_id] = UserProfile(user_id=user_id)
            
            profile = self.user_profiles[user_id]
            
            # Update interests based on topics
            for topic in message.topics:
                if topic not in profile.interests:
                    profile.interests.append(topic)
            
            # Update emotional patterns
            if message.emotional_tone:
                emotion_key = message.emotional_tone.value
                profile.emotional_patterns[emotion_key] = profile.emotional_patterns.get(emotion_key, 0) + 1
            
            # Update knowledge areas based on keywords
            for keyword in message.keywords:
                if keyword not in profile.knowledge_areas and len(keyword) > 2:
                    profile.knowledge_areas.append(keyword)
            
            # Limit list sizes
            profile.interests = profile.interests[-20:]
            profile.knowledge_areas = profile.knowledge_areas[-30:]
            
            profile.last_updated = datetime.now()
            
            # Save to database
            self._save_user_profile(profile)
            
        except Exception as e:
            logger.error(f"Error updating user profile: {e}")
    
    def _save_user_profile(self, profile: UserProfile):
        """Save user profile to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO user_profiles 
                (user_id, name, personality_traits, preferences, interests, 
                 communication_style, emotional_patterns, knowledge_areas, 
                 relationship_history, created_at, last_updated)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                profile.user_id,
                profile.name,
                json.dumps([trait.value for trait in profile.personality_traits]),
                json.dumps(profile.preferences),
                json.dumps(profile.interests),
                json.dumps(profile.communication_style),
                json.dumps(profile.emotional_patterns),
                json.dumps(profile.knowledge_areas),
                json.dumps(profile.relationship_history),
                profile.created_at.isoformat(),
                profile.last_updated.isoformat()
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error saving user profile: {e}")
    
    def _create_interaction_memory(self, user_id: str, session_id: str, message: ConversationMessage):
        """Create memory from important interactions"""
        try:
            # Determine memory importance
            importance = 0.5
            
            if message.intent == 'help_request':
                importance = 0.8
            elif message.intent == 'problem_report':
                importance = 0.9
            elif len(message.content) > 100:
                importance = 0.7
            
            # Create episodic memory
            if importance > 0.6:
                self.memory_manager.create_memory(
                    user_id=user_id,
                    memory_type=MemoryType.EPISODIC,
                    content=f"사용자 메시지: {message.content}",
                    importance_score=importance,
                    tags=message.keywords + message.topics,
                    related_sessions=[session_id]
                )
            
            # Create semantic memory for important topics
            if message.topics:
                for topic in message.topics:
                    self.memory_manager.create_memory(
                        user_id=user_id,
                        memory_type=MemoryType.SEMANTIC,
                        content=f"사용자가 {topic}에 관심을 가지고 있음",
                        importance_score=0.6,
                        tags=[topic],
                        related_sessions=[session_id]
                    )
            
        except Exception as e:
            logger.error(f"Error creating interaction memory: {e}")
    
    def get_contextual_response_info(self, user_id: str, session_id: str) -> Dict[str, Any]:
        """Get contextual information for response generation"""
        try:
            context = self.active_contexts.get(session_id)
            profile = self.user_profiles.get(user_id)
            
            if not context:
                return {'error': 'No active context found'}
            
            response_info = {
                'user_profile': {
                    'interests': profile.interests if profile else [],
                    'personality_traits': [trait.value for trait in profile.personality_traits] if profile else [],
                    'communication_style': profile.communication_style if profile else {},
                    'emotional_patterns': profile.emotional_patterns if profile else {}
                },
                'current_context': {
                    'emotional_state': context.emotional_state.value,
                    'current_topics': context.current_topics,
                    'conversation_mode': context.conversation_mode,
                    'user_intent': context.user_intent
                },
                'recent_messages': [
                    {
                        'content': msg.content,
                        'speaker': msg.speaker,
                        'emotional_tone': msg.emotional_tone.value if msg.emotional_tone else None,
                        'topics': msg.topics,
                        'timestamp': msg.timestamp.isoformat()
                    }
                    for msg in context.context_window[-5:]
                ],
                'relevant_memories': [
                    {
                        'content': memory.content,
                        'memory_type': memory.memory_type.value,
                        'importance': memory.importance_score,
                        'tags': memory.tags
                    }
                    for memory in context.active_memories[:3]
                ],
                'recommendations': {
                    'tone': self._recommend_response_tone(context, profile),
                    'topics_to_explore': self._recommend_topics(context, profile),
                    'personalization_hints': self._get_personalization_hints(profile)
                }
            }
            
            return response_info
            
        except Exception as e:
            logger.error(f"Error getting contextual response info: {e}")
            return {'error': str(e)}
    
    def _recommend_response_tone(self, context: ContextState, profile: Optional[UserProfile]) -> str:
        """Recommend appropriate response tone"""
        if not profile:
            return 'neutral'
        
        # Check formal vs informal preference
        formal_traits = [PersonalityTrait.FORMAL]
        informal_traits = [PersonalityTrait.INFORMAL]
        
        is_formal = any(trait in profile.personality_traits for trait in formal_traits)
        is_informal = any(trait in profile.personality_traits for trait in informal_traits)
        
        if context.emotional_state == EmotionalState.FRUSTRATED:
            return 'supportive'
        elif context.emotional_state == EmotionalState.EXCITED:
            return 'enthusiastic'
        elif is_formal:
            return 'formal'
        elif is_informal:
            return 'casual'
        else:
            return 'friendly'
    
    def _recommend_topics(self, context: ContextState, profile: Optional[UserProfile]) -> List[str]:
        """Recommend topics to explore"""
        if not profile:
            return []
        
        # Suggest based on interests and current topics
        recommendations = []
        
        for interest in profile.interests[-5:]:
            if interest not in context.current_topics:
                recommendations.append(interest)
        
        return recommendations[:3]
    
    def _get_personalization_hints(self, profile: Optional[UserProfile]) -> List[str]:
        """Get personalization hints for response"""
        if not profile:
            return []
        
        hints = []
        
        # Based on personality traits
        if PersonalityTrait.ANALYTICAL in profile.personality_traits:
            hints.append("제공할 때 데이터나 근거를 포함해주세요")
        if PersonalityTrait.CREATIVE in profile.personality_traits:
            hints.append("창의적인 예시나 아이디어를 포함해주세요")
        if PersonalityTrait.IMPATIENT in profile.personality_traits:
            hints.append("간결하고 직접적인 답변을 선호합니다")
        
        # Based on interests
        if 'AI' in profile.interests:
            hints.append("AI나 기술 관련 내용에 관심이 많습니다")
        
        return hints

# FastAPI application
app = FastAPI(title="Conversation Memory System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global memory system instance
memory_system = ConversationMemorySystem()

@app.on_event("startup")
async def startup_event():
    """Initialize memory system on startup"""
    logger.info("Conversation Memory System starting up...")

@app.post("/api/message")
async def process_message(message_data: Dict[str, Any]):
    """Process a new conversation message"""
    try:
        user_id = message_data['user_id']
        session_id = message_data['session_id']
        content = message_data['content']
        speaker = message_data.get('speaker', 'user')
        
        context = memory_system.process_message(user_id, session_id, content, speaker)
        
        return {
            "status": "success",
            "context": {
                "session_id": context.session_id,
                "emotional_state": context.emotional_state.value,
                "current_topics": context.current_topics,
                "active_memories_count": len(context.active_memories),
                "last_updated": context.last_updated.isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/context/{user_id}/{session_id}")
async def get_context_info(user_id: str, session_id: str):
    """Get contextual information for response generation"""
    try:
        context_info = memory_system.get_contextual_response_info(user_id, session_id)
        return context_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/profile/{user_id}")
async def get_user_profile(user_id: str):
    """Get user profile"""
    try:
        profile = memory_system.user_profiles.get(user_id)
        if not profile:
            return {"error": "User profile not found"}
        
        return {
            "user_id": profile.user_id,
            "name": profile.name,
            "personality_traits": [trait.value for trait in profile.personality_traits],
            "interests": profile.interests,
            "communication_style": profile.communication_style,
            "emotional_patterns": profile.emotional_patterns,
            "knowledge_areas": profile.knowledge_areas,
            "created_at": profile.created_at.isoformat(),
            "last_updated": profile.last_updated.isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/memories")
async def create_memory(memory_data: Dict[str, Any]):
    """Create a new memory"""
    try:
        memory = memory_system.memory_manager.create_memory(
            user_id=memory_data['user_id'],
            memory_type=MemoryType(memory_data['memory_type']),
            content=memory_data['content'],
            importance_score=memory_data.get('importance_score', 0.5),
            tags=memory_data.get('tags', []),
            related_sessions=memory_data.get('related_sessions', [])
        )
        
        if memory:
            return {"status": "success", "memory_id": memory.id}
        else:
            raise HTTPException(status_code=500, detail="Failed to create memory")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/memories/{user_id}")
async def get_memories(user_id: str, query: str = "", memory_type: str = None, limit: int = 10):
    """Retrieve user memories"""
    try:
        mem_type = MemoryType(memory_type) if memory_type else None
        memories = memory_system.memory_manager.retrieve_memories(
            user_id, query, mem_type, limit
        )
        
        return {
            "memories": [
                {
                    "id": memory.id,
                    "memory_type": memory.memory_type.value,
                    "content": memory.content,
                    "importance_score": memory.importance_score,
                    "created_at": memory.created_at.isoformat(),
                    "last_accessed": memory.last_accessed.isoformat(),
                    "access_count": memory.access_count,
                    "tags": memory.tags,
                    "decay_factor": memory.decay_factor
                }
                for memory in memories
            ],
            "total": len(memories)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/consolidate/{user_id}")
async def consolidate_memories(user_id: str):
    """Consolidate similar memories for a user"""
    try:
        consolidated_count = memory_system.memory_manager.consolidate_memories(user_id)
        return {
            "status": "success",
            "consolidated_count": consolidated_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time conversation tracking"""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            
            if data.get('type') == 'message':
                context = memory_system.process_message(
                    data['user_id'],
                    data['session_id'],
                    data['content'],
                    data.get('speaker', 'user')
                )
                
                await websocket.send_json({
                    'type': 'context_update',
                    'session_id': context.session_id,
                    'emotional_state': context.emotional_state.value,
                    'current_topics': context.current_topics,
                    'active_memories_count': len(context.active_memories)
                })
                
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")

if __name__ == "__main__":
    _p = int(
        os.environ.get(
            "CONVERSATION_MEMORY_SYSTEM_PORT", os.environ.get("PORT", "8004")
        )
    )
    uvicorn.run(app, host="0.0.0.0", port=_p) 