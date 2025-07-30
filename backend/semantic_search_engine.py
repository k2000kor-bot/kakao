"""
Advanced Semantic Search and Recommendation Engine
의미 기반 검색 및 추천 시스템

Features:
- Multi-modal text embeddings (Korean + English)
- Vector similarity search with multiple algorithms
- Intelligent content recommendation
- Clustering and topic modeling
- Real-time semantic indexing
- Knowledge graph integration
"""

import os
import json
import numpy as np
import faiss
import sqlite3
from typing import Dict, List, Tuple, Optional, Any, Union
from dataclasses import dataclass, asdict
from datetime import datetime
import logging
from pathlib import Path

# NLP and ML imports
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans, DBSCAN
from sklearn.decomposition import LatentDirichletAllocation
from sklearn.metrics.pairwise import cosine_similarity
import umap
from transformers import AutoTokenizer, AutoModel
import torch

# Korean NLP
from konlpy.tag import Okt, Mecab, Komoran
import kss

# FastAPI and async
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class SemanticDocument:
    """Semantic document representation"""
    id: str
    content: str
    title: str = ""
    metadata: Dict[str, Any] = None
    embedding: Optional[List[float]] = None
    topics: List[str] = None
    keywords: List[str] = None
    language: str = "ko"
    created_at: datetime = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}
        if self.topics is None:
            self.topics = []
        if self.keywords is None:
            self.keywords = []
        if self.created_at is None:
            self.created_at = datetime.now()

@dataclass
class SearchResult:
    """Search result with relevance scoring"""
    document: SemanticDocument
    score: float
    rank: int
    explanation: str = ""
    matched_keywords: List[str] = None
    
    def __post_init__(self):
        if self.matched_keywords is None:
            self.matched_keywords = []

@dataclass
class RecommendationResult:
    """Recommendation result with reasoning"""
    document: SemanticDocument
    relevance_score: float
    reason: str
    category: str
    confidence: float

class MultiModalEmbedder:
    """Multi-modal text embedding system"""
    
    def __init__(self):
        self.models = {}
        self.korean_analyzer = Okt()
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize embedding models"""
        try:
            # Korean specialized models
            self.models['ko_sbert'] = SentenceTransformer('jhgan/ko-sroberta-multitask')
            self.models['ko_bert'] = SentenceTransformer('snunlp/KR-SBERT-V40K-klueNLI-augSTS')
            
            # Multilingual models
            self.models['multilingual'] = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
            self.models['universal'] = SentenceTransformer('sentence-transformers/distiluse-base-multilingual-cased')
            
            logger.info("Embedding models initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing embedding models: {e}")
            # Fallback to basic TF-IDF
            self.models['tfidf'] = TfidfVectorizer(max_features=1000, ngram_range=(1, 2))
    
    def preprocess_korean_text(self, text: str) -> str:
        """Preprocess Korean text for better embeddings"""
        try:
            # Sentence segmentation
            sentences = kss.split_sentences(text)
            
            # Clean and normalize
            processed_sentences = []
            for sentence in sentences:
                # Remove excessive whitespace
                sentence = ' '.join(sentence.split())
                if len(sentence.strip()) > 5:  # Filter very short sentences
                    processed_sentences.append(sentence)
            
            return ' '.join(processed_sentences)
        except Exception as e:
            logger.error(f"Error preprocessing Korean text: {e}")
            return text
    
    def generate_embeddings(self, text: str, model_name: str = 'ko_sbert') -> np.ndarray:
        """Generate embeddings for text"""
        try:
            processed_text = self.preprocess_korean_text(text)
            
            if model_name in self.models and model_name != 'tfidf':
                model = self.models[model_name]
                embedding = model.encode(processed_text, convert_to_numpy=True)
                return embedding
            else:
                # Fallback to TF-IDF
                return self._tfidf_embedding(processed_text)
                
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            return np.zeros(384)  # Default embedding size
    
    def _tfidf_embedding(self, text: str) -> np.ndarray:
        """Generate TF-IDF based embedding"""
        try:
            # Tokenize Korean text
            tokens = self.korean_analyzer.morphs(text)
            processed_text = ' '.join(tokens)
            
            if 'tfidf' not in self.models:
                self.models['tfidf'] = TfidfVectorizer(max_features=384, ngram_range=(1, 2))
            
            tfidf_model = self.models['tfidf']
            if not hasattr(tfidf_model, 'vocabulary_'):
                # Fit on dummy data if not fitted
                tfidf_model.fit([processed_text])
            
            embedding = tfidf_model.transform([processed_text]).toarray()[0]
            return embedding
        except Exception as e:
            logger.error(f"Error generating TF-IDF embedding: {e}")
            return np.zeros(384)

class VectorIndex:
    """FAISS-based vector index for similarity search"""
    
    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        self.index = None
        self.document_ids = []
        self._initialize_index()
    
    def _initialize_index(self):
        """Initialize FAISS index"""
        try:
            # Use IndexFlatIP for inner product (cosine similarity)
            self.index = faiss.IndexFlatIP(self.dimension)
            logger.info(f"FAISS index initialized with dimension {self.dimension}")
        except Exception as e:
            logger.error(f"Error initializing FAISS index: {e}")
    
    def add_vectors(self, vectors: np.ndarray, document_ids: List[str]):
        """Add vectors to index"""
        try:
            if vectors.shape[1] != self.dimension:
                logger.warning(f"Vector dimension mismatch: {vectors.shape[1]} vs {self.dimension}")
                return
            
            # Normalize vectors for cosine similarity
            faiss.normalize_L2(vectors)
            
            self.index.add(vectors)
            self.document_ids.extend(document_ids)
            
            logger.info(f"Added {len(document_ids)} vectors to index")
        except Exception as e:
            logger.error(f"Error adding vectors to index: {e}")
    
    def search(self, query_vector: np.ndarray, k: int = 10) -> Tuple[np.ndarray, np.ndarray]:
        """Search for similar vectors"""
        try:
            # Normalize query vector
            query_vector = query_vector.reshape(1, -1)
            faiss.normalize_L2(query_vector)
            
            scores, indices = self.index.search(query_vector, k)
            return scores[0], indices[0]
        except Exception as e:
            logger.error(f"Error searching vectors: {e}")
            return np.array([]), np.array([])
    
    def get_index_size(self) -> int:
        """Get number of vectors in index"""
        return self.index.ntotal if self.index else 0

class TopicModeler:
    """Advanced topic modeling and clustering"""
    
    def __init__(self):
        self.lda_model = None
        self.kmeans_model = None
        self.umap_reducer = None
        self.korean_analyzer = Okt()
    
    def extract_topics(self, documents: List[str], n_topics: int = 10) -> Dict[str, Any]:
        """Extract topics using LDA"""
        try:
            # Preprocess documents
            processed_docs = []
            for doc in documents:
                tokens = self.korean_analyzer.morphs(doc)
                # Filter out short tokens and common stop words
                filtered_tokens = [token for token in tokens if len(token) > 1]
                processed_docs.append(' '.join(filtered_tokens))
            
            # TF-IDF vectorization
            vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2))
            doc_vectors = vectorizer.fit_transform(processed_docs)
            
            # LDA topic modeling
            self.lda_model = LatentDirichletAllocation(
                n_components=n_topics,
                random_state=42,
                max_iter=20
            )
            topic_distributions = self.lda_model.fit_transform(doc_vectors)
            
            # Extract topic keywords
            feature_names = vectorizer.get_feature_names_out()
            topics = []
            
            for topic_idx, topic in enumerate(self.lda_model.components_):
                top_keywords_idx = topic.argsort()[-10:][::-1]
                top_keywords = [feature_names[i] for i in top_keywords_idx]
                topics.append({
                    'id': topic_idx,
                    'keywords': top_keywords,
                    'weight': float(topic.sum())
                })
            
            return {
                'topics': topics,
                'document_topics': topic_distributions.tolist(),
                'model_info': {
                    'n_topics': n_topics,
                    'n_documents': len(documents)
                }
            }
            
        except Exception as e:
            logger.error(f"Error extracting topics: {e}")
            return {'topics': [], 'document_topics': [], 'model_info': {}}
    
    def cluster_documents(self, embeddings: np.ndarray, n_clusters: int = 5) -> Dict[str, Any]:
        """Cluster documents using K-means and UMAP"""
        try:
            # UMAP dimensionality reduction for visualization
            self.umap_reducer = umap.UMAP(n_components=2, random_state=42)
            reduced_embeddings = self.umap_reducer.fit_transform(embeddings)
            
            # K-means clustering
            self.kmeans_model = KMeans(n_clusters=n_clusters, random_state=42)
            cluster_labels = self.kmeans_model.fit_predict(embeddings)
            
            # DBSCAN for density-based clustering
            dbscan = DBSCAN(eps=0.5, min_samples=2)
            dbscan_labels = dbscan.fit_predict(embeddings)
            
            return {
                'kmeans_labels': cluster_labels.tolist(),
                'dbscan_labels': dbscan_labels.tolist(),
                'reduced_embeddings': reduced_embeddings.tolist(),
                'cluster_centers': self.kmeans_model.cluster_centers_.tolist(),
                'n_clusters': n_clusters
            }
            
        except Exception as e:
            logger.error(f"Error clustering documents: {e}")
            return {'kmeans_labels': [], 'dbscan_labels': [], 'reduced_embeddings': []}

class SemanticSearchEngine:
    """Main semantic search engine"""
    
    def __init__(self, db_path: str = "semantic_search.db"):
        self.db_path = db_path
        self.embedder = MultiModalEmbedder()
        self.vector_index = VectorIndex()
        self.topic_modeler = TopicModeler()
        self.documents: Dict[str, SemanticDocument] = {}
        self._initialize_database()
    
    def _initialize_database(self):
        """Initialize SQLite database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Documents table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS documents (
                    id TEXT PRIMARY KEY,
                    content TEXT NOT NULL,
                    title TEXT,
                    metadata TEXT,
                    embedding BLOB,
                    topics TEXT,
                    keywords TEXT,
                    language TEXT,
                    created_at TIMESTAMP
                )
            ''')
            
            # Search history table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS search_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    query TEXT NOT NULL,
                    results TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Recommendations table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS recommendations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    document_id TEXT,
                    recommended_id TEXT,
                    score REAL,
                    reason TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
            conn.close()
            logger.info("Database initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing database: {e}")
    
    def add_document(self, document: SemanticDocument) -> bool:
        """Add document to search engine"""
        try:
            # Generate embedding
            embedding = self.embedder.generate_embeddings(document.content)
            document.embedding = embedding.tolist()
            
            # Add to vector index
            self.vector_index.add_vectors(
                embedding.reshape(1, -1),
                [document.id]
            )
            
            # Store in memory
            self.documents[document.id] = document
            
            # Save to database
            self._save_document_to_db(document)
            
            logger.info(f"Document {document.id} added successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error adding document: {e}")
            return False
    
    def _save_document_to_db(self, document: SemanticDocument):
        """Save document to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO documents 
                (id, content, title, metadata, embedding, topics, keywords, language, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                document.id,
                document.content,
                document.title,
                json.dumps(document.metadata),
                json.dumps(document.embedding),
                json.dumps(document.topics),
                json.dumps(document.keywords),
                document.language,
                document.created_at.isoformat()
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error saving document to database: {e}")
    
    def search(self, query: str, k: int = 10, filters: Dict[str, Any] = None) -> List[SearchResult]:
        """Semantic search for documents"""
        try:
            # Generate query embedding
            query_embedding = self.embedder.generate_embeddings(query)
            
            # Vector search
            scores, indices = self.vector_index.search(query_embedding, k)
            
            results = []
            for i, (score, idx) in enumerate(zip(scores, indices)):
                if idx < len(self.vector_index.document_ids):
                    doc_id = self.vector_index.document_ids[idx]
                    if doc_id in self.documents:
                        document = self.documents[doc_id]
                        
                        # Apply filters if provided
                        if filters and not self._apply_filters(document, filters):
                            continue
                        
                        result = SearchResult(
                            document=document,
                            score=float(score),
                            rank=i + 1,
                            explanation=f"의미적 유사도: {score:.3f}"
                        )
                        results.append(result)
            
            # Save search history
            self._save_search_history(query, results)
            
            return results
            
        except Exception as e:
            logger.error(f"Error during search: {e}")
            return []
    
    def _apply_filters(self, document: SemanticDocument, filters: Dict[str, Any]) -> bool:
        """Apply search filters"""
        try:
            for key, value in filters.items():
                if key == 'language' and document.language != value:
                    return False
                elif key == 'topics' and not any(topic in document.topics for topic in value):
                    return False
                elif key == 'metadata' and not all(
                    document.metadata.get(k) == v for k, v in value.items()
                ):
                    return False
            return True
        except Exception:
            return False
    
    def get_recommendations(self, document_id: str, k: int = 5) -> List[RecommendationResult]:
        """Get recommendations for a document"""
        try:
            if document_id not in self.documents:
                return []
            
            source_doc = self.documents[document_id]
            source_embedding = np.array(source_doc.embedding)
            
            recommendations = []
            
            # Find similar documents
            scores, indices = self.vector_index.search(source_embedding, k + 1)  # +1 to exclude self
            
            for score, idx in zip(scores, indices):
                if idx < len(self.vector_index.document_ids):
                    candidate_id = self.vector_index.document_ids[idx]
                    if candidate_id != document_id and candidate_id in self.documents:
                        candidate_doc = self.documents[candidate_id]
                        
                        # Calculate recommendation reason
                        reason = self._generate_recommendation_reason(source_doc, candidate_doc, score)
                        
                        recommendation = RecommendationResult(
                            document=candidate_doc,
                            relevance_score=float(score),
                            reason=reason,
                            category="유사 내용",
                            confidence=min(float(score), 1.0)
                        )
                        recommendations.append(recommendation)
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return []
    
    def _generate_recommendation_reason(self, source: SemanticDocument, candidate: SemanticDocument, score: float) -> str:
        """Generate recommendation reasoning"""
        reasons = []
        
        # Topic similarity
        common_topics = set(source.topics) & set(candidate.topics)
        if common_topics:
            reasons.append(f"공통 주제: {', '.join(list(common_topics)[:3])}")
        
        # Keyword similarity
        common_keywords = set(source.keywords) & set(candidate.keywords)
        if common_keywords:
            reasons.append(f"공통 키워드: {', '.join(list(common_keywords)[:3])}")
        
        # Semantic similarity
        if score > 0.8:
            reasons.append("매우 높은 의미적 유사도")
        elif score > 0.6:
            reasons.append("높은 의미적 유사도")
        else:
            reasons.append("의미적 연관성")
        
        return " | ".join(reasons) if reasons else "시스템 추천"
    
    def _save_search_history(self, query: str, results: List[SearchResult]):
        """Save search history to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            results_data = [
                {
                    'id': result.document.id,
                    'title': result.document.title,
                    'score': result.score,
                    'rank': result.rank
                }
                for result in results
            ]
            
            cursor.execute('''
                INSERT INTO search_history (query, results)
                VALUES (?, ?)
            ''', (query, json.dumps(results_data)))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error saving search history: {e}")
    
    def analyze_corpus(self) -> Dict[str, Any]:
        """Analyze entire document corpus"""
        try:
            if not self.documents:
                return {'error': 'No documents in corpus'}
            
            documents_list = list(self.documents.values())
            contents = [doc.content for doc in documents_list]
            embeddings = np.array([doc.embedding for doc in documents_list])
            
            # Topic modeling
            topics_result = self.topic_modeler.extract_topics(contents)
            
            # Clustering
            clustering_result = self.topic_modeler.cluster_documents(embeddings)
            
            # Basic statistics
            stats = {
                'total_documents': len(self.documents),
                'languages': list(set(doc.language for doc in documents_list)),
                'avg_content_length': np.mean([len(doc.content) for doc in documents_list]),
                'index_size': self.vector_index.get_index_size()
            }
            
            return {
                'statistics': stats,
                'topics': topics_result,
                'clustering': clustering_result,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing corpus: {e}")
            return {'error': str(e)}

# FastAPI application
app = FastAPI(title="Semantic Search Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global search engine instance
search_engine = SemanticSearchEngine()

@app.on_event("startup")
async def startup_event():
    """Initialize search engine on startup"""
    logger.info("Semantic Search Engine starting up...")

@app.post("/api/documents")
async def add_document(document_data: Dict[str, Any]):
    """Add a new document"""
    try:
        document = SemanticDocument(
            id=document_data.get('id', str(datetime.now().timestamp())),
            content=document_data['content'],
            title=document_data.get('title', ''),
            metadata=document_data.get('metadata', {}),
            topics=document_data.get('topics', []),
            keywords=document_data.get('keywords', []),
            language=document_data.get('language', 'ko')
        )
        
        success = search_engine.add_document(document)
        if success:
            return {"status": "success", "document_id": document.id}
        else:
            raise HTTPException(status_code=500, detail="Failed to add document")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/search")
async def search_documents(q: str, k: int = 10, language: str = None):
    """Search documents"""
    try:
        filters = {}
        if language:
            filters['language'] = language
        
        results = search_engine.search(q, k, filters)
        
        return {
            "query": q,
            "results": [
                {
                    "document": {
                        "id": result.document.id,
                        "title": result.document.title,
                        "content": result.document.content[:500] + "..." if len(result.document.content) > 500 else result.document.content,
                        "metadata": result.document.metadata,
                        "topics": result.document.topics,
                        "keywords": result.document.keywords
                    },
                    "score": result.score,
                    "rank": result.rank,
                    "explanation": result.explanation
                }
                for result in results
            ],
            "total": len(results)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/recommendations/{document_id}")
async def get_recommendations(document_id: str, k: int = 5):
    """Get recommendations for a document"""
    try:
        recommendations = search_engine.get_recommendations(document_id, k)
        
        return {
            "document_id": document_id,
            "recommendations": [
                {
                    "document": {
                        "id": rec.document.id,
                        "title": rec.document.title,
                        "content": rec.document.content[:300] + "..." if len(rec.document.content) > 300 else rec.document.content
                    },
                    "relevance_score": rec.relevance_score,
                    "reason": rec.reason,
                    "category": rec.category,
                    "confidence": rec.confidence
                }
                for rec in recommendations
            ],
            "total": len(recommendations)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analyze")
async def analyze_corpus():
    """Analyze document corpus"""
    try:
        analysis = search_engine.analyze_corpus()
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time search"""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            
            if data.get('type') == 'search':
                query = data.get('query', '')
                k = data.get('k', 10)
                
                results = search_engine.search(query, k)
                
                await websocket.send_json({
                    'type': 'search_results',
                    'query': query,
                    'results': [
                        {
                            'id': result.document.id,
                            'title': result.document.title,
                            'score': result.score,
                            'explanation': result.explanation
                        }
                        for result in results
                    ]
                })
                
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002) 