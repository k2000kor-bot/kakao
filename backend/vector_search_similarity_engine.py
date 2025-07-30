#!/usr/bin/env python3
"""
고급 벡터 검색 및 의미 기반 유사도 분석 시스템 v9.0
- 텍스트 임베딩 및 벡터화
- 코사인 유사도 기반 검색
- 의미적 유사도 분석
- 클러스터링 및 토픽 모델링
- 추천 시스템 통합
"""

import numpy as np
import json
import pickle
import logging
from datetime import datetime
from typing import List, Dict, Optional, Any, Tuple, Union
from dataclasses import dataclass, asdict
from pathlib import Path
import hashlib
import re
from collections import defaultdict, Counter
import math

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class DocumentVector:
    """문서 벡터"""
    document_id: str
    content: str
    vector: np.ndarray
    metadata: Dict[str, Any]
    created_at: datetime
    vector_model: str  # tfidf, word2vec, bert, custom
    dimension: int


@dataclass
class SimilarityResult:
    """유사도 검색 결과"""
    query_document_id: str
    similar_document_id: str
    similarity_score: float
    content_preview: str
    metadata: Dict[str, Any]
    similarity_type: str  # cosine, euclidean, jaccard, semantic


@dataclass
class ClusterResult:
    """클러스터링 결과"""
    cluster_id: str
    documents: List[str]
    centroid: np.ndarray
    cluster_size: int
    coherence_score: float
    dominant_topics: List[str]
    representative_keywords: List[str]


@dataclass
class TopicModel:
    """토픽 모델"""
    topic_id: str
    topic_words: List[Tuple[str, float]]
    document_assignments: List[Tuple[str, float]]
    topic_coherence: float
    topic_description: str


class VectorSearchSimilarityEngine:
    """벡터 검색 및 유사도 분석 엔진"""
    
    def __init__(self, vector_dimension: int = 300):
        self.vector_dimension = vector_dimension
        self.document_vectors: Dict[str, DocumentVector] = {}
        self.vector_index = None  # 고속 검색을 위한 인덱스
        
        # 텍스트 전처리 도구
        self.korean_stopwords = self._load_korean_stopwords()
        self.tokenizer = self._initialize_tokenizer()
        
        # TF-IDF 벡터라이저
        self.tfidf_vectorizer = None
        self.vocabulary = {}
        self.idf_values = {}
        
        # 클러스터링 결과
        self.clusters: Dict[str, ClusterResult] = {}
        
        # 토픽 모델
        self.topic_models: List[TopicModel] = []
        
        # 유사도 캐시
        self.similarity_cache: Dict[str, float] = {}
        
        logger.info(f"벡터 검색 엔진 초기화 완료 (차원: {vector_dimension})")
        
    def _load_korean_stopwords(self) -> set:
        """한국어 불용어 로드"""
        
        stopwords = {
            '이', '가', '을', '를', '의', '에', '서', '로', '으로', '와', '과',
            '은', '는', '이다', '다', '하다', '있다', '없다', '되다', '이', '그',
            '저', '것', '수', '등', '및', '또한', '그리고', '하지만', '그러나',
            '때문에', '따라서', '즉', '예를 들어', '특히', '또는', '혹은',
            '만약', '만일', '경우', '때', '동안', '사이', '중', '안', '밖',
            '위', '아래', '앞', '뒤', '옆', '근처', '주변', '이곳', '저곳',
            '여기', '거기', '어디', '언제', '누구', '무엇', '어떻게', '왜',
            '얼마나', '몇', '어느', '많이', '조금', '전혀', '매우', '정말',
            '아주', '꽤', '상당히', '다소', '약간', '거의', '완전히', '전부'
        }
        
        return stopwords
        
    def _initialize_tokenizer(self):
        """토크나이저 초기화"""
        # 실제로는 KoNLPy, mecab 등 사용
        class SimpleKoreanTokenizer:
            def tokenize(self, text: str) -> List[str]:
                # 한글, 영어, 숫자만 추출
                tokens = re.findall(r'[가-힣a-zA-Z0-9]+', text)
                return [token.lower() for token in tokens if len(token) >= 2]
                
        return SimpleKoreanTokenizer()
        
    def add_document(self, document_id: str, content: str, 
                    metadata: Optional[Dict[str, Any]] = None,
                    vector_model: str = "tfidf") -> DocumentVector:
        """문서 추가 및 벡터화"""
        
        if not content.strip():
            raise ValueError("빈 문서는 추가할 수 없습니다")
            
        # 메타데이터 처리
        if metadata is None:
            metadata = {}
            
        # 텍스트 전처리
        processed_content = self._preprocess_text(content)
        
        # 벡터화
        vector = self._vectorize_text(processed_content, vector_model)
        
        # DocumentVector 생성
        doc_vector = DocumentVector(
            document_id=document_id,
            content=content,
            vector=vector,
            metadata=metadata,
            created_at=datetime.now(),
            vector_model=vector_model,
            dimension=len(vector)
        )
        
        # 저장
        self.document_vectors[document_id] = doc_vector
        
        # 인덱스 업데이트 (필요시)
        self._update_vector_index()
        
        logger.info(f"문서 추가 완료: {document_id} ({len(content)}자, {vector_model})")
        
        return doc_vector
        
    def _preprocess_text(self, text: str) -> List[str]:
        """텍스트 전처리"""
        
        # 토큰화
        tokens = self.tokenizer.tokenize(text)
        
        # 불용어 제거
        tokens = [token for token in tokens if token not in self.korean_stopwords]
        
        # 길이 필터링 (2글자 이상)
        tokens = [token for token in tokens if len(token) >= 2]
        
        return tokens
        
    def _vectorize_text(self, tokens: List[str], model: str) -> np.ndarray:
        """텍스트 벡터화"""
        
        if model == "tfidf":
            return self._tfidf_vectorize(tokens)
        elif model == "word2vec":
            return self._word2vec_vectorize(tokens)
        elif model == "bow":
            return self._bow_vectorize(tokens)
        elif model == "custom":
            return self._custom_vectorize(tokens)
        else:
            return self._tfidf_vectorize(tokens)
            
    def _tfidf_vectorize(self, tokens: List[str]) -> np.ndarray:
        """TF-IDF 벡터화"""
        
        # 어휘 구축 (최초 실행시)
        if not self.vocabulary:
            self._build_vocabulary()
            
        # TF (Term Frequency) 계산
        tf_vector = np.zeros(len(self.vocabulary))
        token_counts = Counter(tokens)
        total_tokens = len(tokens)
        
        for token, count in token_counts.items():
            if token in self.vocabulary:
                token_idx = self.vocabulary[token]
                tf_vector[token_idx] = count / total_tokens
                
        # IDF (Inverse Document Frequency) 적용
        tfidf_vector = np.zeros(len(self.vocabulary))
        
        for token, count in token_counts.items():
            if token in self.vocabulary:
                token_idx = self.vocabulary[token]
                tf = count / total_tokens
                idf = self.idf_values.get(token, 1.0)
                tfidf_vector[token_idx] = tf * idf
                
        # 정규화
        norm = np.linalg.norm(tfidf_vector)
        if norm > 0:
            tfidf_vector = tfidf_vector / norm
            
        return tfidf_vector
        
    def _build_vocabulary(self):
        """어휘 사전 구축"""
        
        all_tokens = []
        document_count = {}
        
        # 모든 문서에서 토큰 수집
        for doc_vector in self.document_vectors.values():
            tokens = self._preprocess_text(doc_vector.content)
            all_tokens.extend(tokens)
            
            # 문서 빈도 계산
            unique_tokens = set(tokens)
            for token in unique_tokens:
                document_count[token] = document_count.get(token, 0) + 1
                
        # 어휘 인덱스 생성
        unique_tokens = list(set(all_tokens))
        self.vocabulary = {token: idx for idx, token in enumerate(unique_tokens)}
        
        # IDF 계산
        total_documents = len(self.document_vectors)
        for token in self.vocabulary:
            df = document_count.get(token, 1)
            idf = math.log(total_documents / df)
            self.idf_values[token] = idf
            
        logger.info(f"어휘 사전 구축 완료: {len(self.vocabulary)}개 토큰")
        
    def _word2vec_vectorize(self, tokens: List[str]) -> np.ndarray:
        """Word2Vec 스타일 벡터화 (간단한 구현)"""
        
        # 간단한 임베딩 (실제로는 pre-trained 모델 사용)
        vector = np.zeros(self.vector_dimension)
        
        for token in tokens:
            # 해시 기반 간단한 임베딩
            token_hash = hash(token) % self.vector_dimension
            vector[token_hash] += 1
            
        # 정규화
        norm = np.linalg.norm(vector)
        if norm > 0:
            vector = vector / norm
            
        return vector
        
    def _bow_vectorize(self, tokens: List[str]) -> np.ndarray:
        """Bag of Words 벡터화"""
        
        if not self.vocabulary:
            self._build_vocabulary()
            
        bow_vector = np.zeros(len(self.vocabulary))
        token_counts = Counter(tokens)
        
        for token, count in token_counts.items():
            if token in self.vocabulary:
                token_idx = self.vocabulary[token]
                bow_vector[token_idx] = count
                
        return bow_vector
        
    def _custom_vectorize(self, tokens: List[str]) -> np.ndarray:
        """커스텀 벡터화 (도메인 특화)"""
        
        # 재건축 도메인 특화 키워드 가중치
        domain_weights = {
            '시공사': 5.0, '건설사': 5.0, '대우': 4.0, '삼성': 4.0, 'GS': 4.0,
            '분담금': 4.5, '환급': 4.0, '비용': 3.5, '예산': 3.5,
            '총회': 4.0, '투표': 3.5, '안건': 3.5, '승인': 3.5,
            '커뮤니티': 3.0, '시설': 3.0, '수영장': 2.5, '사우나': 2.5,
            '아파트': 2.5, '단지': 2.5, '브랜드': 2.0
        }
        
        vector = np.zeros(self.vector_dimension)
        
        for token in tokens:
            weight = domain_weights.get(token, 1.0)
            token_hash = hash(token) % self.vector_dimension
            vector[token_hash] += weight
            
        # 정규화
        norm = np.linalg.norm(vector)
        if norm > 0:
            vector = vector / norm
            
        return vector
        
    def _update_vector_index(self):
        """벡터 인덱스 업데이트"""
        
        # 단순한 리스트 기반 인덱스 (실제로는 FAISS, Annoy 등 사용)
        if len(self.document_vectors) > 100:
            logger.info("벡터 인덱스 업데이트 중...")
            # 고속 검색을 위한 인덱스 구축
            pass
            
    def find_similar_documents(self, query_document_id: str, 
                             top_k: int = 10,
                             similarity_threshold: float = 0.1,
                             similarity_type: str = "cosine") -> List[SimilarityResult]:
        """유사 문서 검색"""
        
        if query_document_id not in self.document_vectors:
            raise ValueError(f"문서를 찾을 수 없습니다: {query_document_id}")
            
        query_vector = self.document_vectors[query_document_id].vector
        results = []
        
        for doc_id, doc_vector in self.document_vectors.items():
            if doc_id == query_document_id:
                continue
                
            # 유사도 계산
            similarity = self._calculate_similarity(
                query_vector, doc_vector.vector, similarity_type
            )
            
            if similarity >= similarity_threshold:
                result = SimilarityResult(
                    query_document_id=query_document_id,
                    similar_document_id=doc_id,
                    similarity_score=similarity,
                    content_preview=doc_vector.content[:100] + "...",
                    metadata=doc_vector.metadata,
                    similarity_type=similarity_type
                )
                results.append(result)
                
        # 유사도 순으로 정렬
        results.sort(key=lambda x: x.similarity_score, reverse=True)
        
        return results[:top_k]
        
    def _calculate_similarity(self, vector1: np.ndarray, vector2: np.ndarray, 
                            method: str) -> float:
        """유사도 계산"""
        
        if method == "cosine":
            return self._cosine_similarity(vector1, vector2)
        elif method == "euclidean":
            return self._euclidean_similarity(vector1, vector2)
        elif method == "jaccard":
            return self._jaccard_similarity(vector1, vector2)
        else:
            return self._cosine_similarity(vector1, vector2)
            
    def _cosine_similarity(self, v1: np.ndarray, v2: np.ndarray) -> float:
        """코사인 유사도"""
        
        dot_product = np.dot(v1, v2)
        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
            
        return dot_product / (norm1 * norm2)
        
    def _euclidean_similarity(self, v1: np.ndarray, v2: np.ndarray) -> float:
        """유클리드 유사도 (거리의 역수)"""
        
        distance = np.linalg.norm(v1 - v2)
        return 1.0 / (1.0 + distance)
        
    def _jaccard_similarity(self, v1: np.ndarray, v2: np.ndarray) -> float:
        """자카드 유사도 (이진 벡터 기준)"""
        
        # 벡터를 이진으로 변환
        binary1 = (v1 > 0).astype(int)
        binary2 = (v2 > 0).astype(int)
        
        intersection = np.sum(binary1 * binary2)
        union = np.sum(np.maximum(binary1, binary2))
        
        if union == 0:
            return 0.0
            
        return intersection / union
        
    def search_by_text(self, query_text: str, 
                      top_k: int = 10,
                      similarity_threshold: float = 0.1,
                      vector_model: str = "tfidf") -> List[SimilarityResult]:
        """텍스트 쿼리로 검색"""
        
        # 쿼리 텍스트 벡터화
        processed_query = self._preprocess_text(query_text)
        query_vector = self._vectorize_text(processed_query, vector_model)
        
        results = []
        
        for doc_id, doc_vector in self.document_vectors.items():
            similarity = self._cosine_similarity(query_vector, doc_vector.vector)
            
            if similarity >= similarity_threshold:
                result = SimilarityResult(
                    query_document_id="query",
                    similar_document_id=doc_id,
                    similarity_score=similarity,
                    content_preview=doc_vector.content[:100] + "...",
                    metadata=doc_vector.metadata,
                    similarity_type="cosine"
                )
                results.append(result)
                
        # 유사도 순 정렬
        results.sort(key=lambda x: x.similarity_score, reverse=True)
        
        return results[:top_k]
        
    def cluster_documents(self, num_clusters: int = 5, 
                         clustering_method: str = "kmeans") -> List[ClusterResult]:
        """문서 클러스터링"""
        
        if len(self.document_vectors) < num_clusters:
            raise ValueError("클러스터 수가 문서 수보다 많습니다")
            
        # 모든 벡터 수집
        vectors = []
        doc_ids = []
        
        for doc_id, doc_vector in self.document_vectors.items():
            vectors.append(doc_vector.vector)
            doc_ids.append(doc_id)
            
        vectors = np.array(vectors)
        
        if clustering_method == "kmeans":
            cluster_assignments = self._kmeans_clustering(vectors, num_clusters)
        else:
            cluster_assignments = self._simple_clustering(vectors, num_clusters)
            
        # 클러스터 결과 생성
        clusters = []
        
        for cluster_id in range(num_clusters):
            cluster_doc_indices = [i for i, c in enumerate(cluster_assignments) if c == cluster_id]
            
            if not cluster_doc_indices:
                continue
                
            cluster_doc_ids = [doc_ids[i] for i in cluster_doc_indices]
            cluster_vectors = vectors[cluster_doc_indices]
            
            # 클러스터 중심점
            centroid = np.mean(cluster_vectors, axis=0)
            
            # 응집도 계산
            coherence = self._calculate_cluster_coherence(cluster_vectors)
            
            # 주요 토픽 및 키워드 추출
            topics, keywords = self._extract_cluster_topics(cluster_doc_ids)
            
            cluster_result = ClusterResult(
                cluster_id=f"cluster_{cluster_id}",
                documents=cluster_doc_ids,
                centroid=centroid,
                cluster_size=len(cluster_doc_ids),
                coherence_score=coherence,
                dominant_topics=topics,
                representative_keywords=keywords
            )
            
            clusters.append(cluster_result)
            
        # 클러스터 저장
        self.clusters = {cluster.cluster_id: cluster for cluster in clusters}
        
        logger.info(f"클러스터링 완료: {len(clusters)}개 클러스터")
        
        return clusters
        
    def _kmeans_clustering(self, vectors: np.ndarray, k: int, max_iters: int = 100) -> List[int]:
        """K-means 클러스터링 (간단한 구현)"""
        
        n_samples, n_features = vectors.shape
        
        # 초기 중심점 랜덤 선택
        centroids = vectors[np.random.choice(n_samples, k, replace=False)]
        
        for iteration in range(max_iters):
            # 각 점을 가장 가까운 중심점에 할당
            distances = np.array([[np.linalg.norm(x - c) for c in centroids] for x in vectors])
            assignments = np.argmin(distances, axis=1)
            
            # 새로운 중심점 계산
            new_centroids = np.array([vectors[assignments == i].mean(axis=0) for i in range(k)])
            
            # 수렴 체크
            if np.allclose(centroids, new_centroids):
                break
                
            centroids = new_centroids
            
        return assignments.tolist()
        
    def _simple_clustering(self, vectors: np.ndarray, k: int) -> List[int]:
        """간단한 클러스터링"""
        
        # 단순히 벡터 인덱스 기준으로 분할
        n_samples = len(vectors)
        cluster_size = n_samples // k
        
        assignments = []
        for i in range(n_samples):
            cluster_id = min(i // cluster_size, k - 1)
            assignments.append(cluster_id)
            
        return assignments
        
    def _calculate_cluster_coherence(self, cluster_vectors: np.ndarray) -> float:
        """클러스터 응집도 계산"""
        
        if len(cluster_vectors) <= 1:
            return 1.0
            
        # 클러스터 내 평균 유사도
        similarities = []
        
        for i in range(len(cluster_vectors)):
            for j in range(i + 1, len(cluster_vectors)):
                sim = self._cosine_similarity(cluster_vectors[i], cluster_vectors[j])
                similarities.append(sim)
                
        return np.mean(similarities) if similarities else 0.0
        
    def _extract_cluster_topics(self, doc_ids: List[str]) -> Tuple[List[str], List[str]]:
        """클러스터 주제 및 키워드 추출"""
        
        all_tokens = []
        
        for doc_id in doc_ids:
            doc_content = self.document_vectors[doc_id].content
            tokens = self._preprocess_text(doc_content)
            all_tokens.extend(tokens)
            
        # 빈도 기반 키워드 추출
        token_counts = Counter(all_tokens)
        top_keywords = [token for token, count in token_counts.most_common(10)]
        
        # 도메인 기반 주제 분류
        topics = []
        construction_keywords = ['시공사', '건설사', '재건축', '아파트', '단지']
        finance_keywords = ['분담금', '환급', '비용', '예산', '자금']
        meeting_keywords = ['총회', '투표', '안건', '승인', '회의']
        
        if any(keyword in all_tokens for keyword in construction_keywords):
            topics.append('construction')
        if any(keyword in all_tokens for keyword in finance_keywords):
            topics.append('finance')
        if any(keyword in all_tokens for keyword in meeting_keywords):
            topics.append('meeting')
            
        return topics[:3], top_keywords[:5]
        
    def build_topic_model(self, num_topics: int = 5) -> List[TopicModel]:
        """토픽 모델 구축"""
        
        # 모든 문서의 토큰 수집
        document_tokens = {}
        all_tokens = []
        
        for doc_id, doc_vector in self.document_vectors.items():
            tokens = self._preprocess_text(doc_vector.content)
            document_tokens[doc_id] = tokens
            all_tokens.extend(tokens)
            
        # 단어 빈도 계산
        vocabulary = list(set(all_tokens))
        vocab_size = len(vocabulary)
        vocab_index = {word: i for i, word in enumerate(vocabulary)}
        
        # 문서-단어 행렬 생성
        doc_word_matrix = np.zeros((len(document_tokens), vocab_size))
        doc_ids = list(document_tokens.keys())
        
        for doc_idx, (doc_id, tokens) in enumerate(document_tokens.items()):
            token_counts = Counter(tokens)
            for token, count in token_counts.items():
                if token in vocab_index:
                    word_idx = vocab_index[token]
                    doc_word_matrix[doc_idx, word_idx] = count
                    
        # 간단한 토픽 모델링 (NMF 스타일)
        topics = self._simple_topic_modeling(doc_word_matrix, vocabulary, num_topics)
        
        # 문서-토픽 할당
        doc_topic_assignments = self._assign_documents_to_topics(
            doc_word_matrix, topics, doc_ids
        )
        
        # TopicModel 객체 생성
        topic_models = []
        
        for topic_idx, topic_words in enumerate(topics):
            # 해당 토픽에 할당된 문서들
            topic_docs = [(doc_id, score) for doc_id, topic_scores in doc_topic_assignments.items() 
                         if topic_idx < len(topic_scores) and topic_scores[topic_idx] > 0.3]
            
            # 토픽 응집도
            coherence = self._calculate_topic_coherence(topic_words)
            
            # 토픽 설명 생성
            description = self._generate_topic_description(topic_words)
            
            topic_model = TopicModel(
                topic_id=f"topic_{topic_idx}",
                topic_words=topic_words,
                document_assignments=topic_docs,
                topic_coherence=coherence,
                topic_description=description
            )
            
            topic_models.append(topic_model)
            
        self.topic_models = topic_models
        
        logger.info(f"토픽 모델 구축 완료: {len(topic_models)}개 토픽")
        
        return topic_models
        
    def _simple_topic_modeling(self, doc_word_matrix: np.ndarray, 
                              vocabulary: List[str], num_topics: int) -> List[List[Tuple[str, float]]]:
        """간단한 토픽 모델링"""
        
        # TF-IDF 변환
        tfidf_matrix = doc_word_matrix.copy()
        
        # 각 단어의 IDF 계산
        doc_freq = np.sum(doc_word_matrix > 0, axis=0)
        idf = np.log(len(doc_word_matrix) / (doc_freq + 1))
        
        # TF-IDF 적용
        for i in range(len(doc_word_matrix)):
            tf = doc_word_matrix[i] / np.sum(doc_word_matrix[i])
            tfidf_matrix[i] = tf * idf
            
        # 간단한 클러스터링으로 토픽 추출
        word_clusters = self._cluster_words_by_cooccurrence(tfidf_matrix, vocabulary, num_topics)
        
        topics = []
        for cluster_words in word_clusters:
            # 각 클러스터에서 상위 단어들 선택
            topic_words = cluster_words[:10]  # 상위 10개 단어
            topics.append(topic_words)
            
        return topics
        
    def _cluster_words_by_cooccurrence(self, matrix: np.ndarray, vocabulary: List[str], 
                                      num_clusters: int) -> List[List[Tuple[str, float]]]:
        """동시 출현 기반 단어 클러스터링"""
        
        # 단어별 점수 계산 (TF-IDF 합)
        word_scores = np.sum(matrix, axis=0)
        
        # 점수 순으로 정렬
        word_indices = np.argsort(word_scores)[::-1]
        
        # 클러스터별로 단어 분배
        clusters = [[] for _ in range(num_clusters)]
        
        for i, word_idx in enumerate(word_indices):
            cluster_id = i % num_clusters
            word = vocabulary[word_idx]
            score = word_scores[word_idx]
            clusters[cluster_id].append((word, score))
            
        return clusters
        
    def _assign_documents_to_topics(self, doc_word_matrix: np.ndarray, 
                                   topics: List[List[Tuple[str, float]]], 
                                   doc_ids: List[str]) -> Dict[str, List[float]]:
        """문서-토픽 할당"""
        
        assignments = {}
        
        for doc_idx, doc_id in enumerate(doc_ids):
            doc_vector = doc_word_matrix[doc_idx]
            topic_scores = []
            
            for topic_words in topics:
                # 문서가 각 토픽과 얼마나 관련있는지 계산
                score = 0.0
                for word, word_score in topic_words:
                    # 단어가 문서에 포함되어 있다면 점수 추가
                    # 실제로는 더 정교한 계산 필요
                    score += word_score * 0.1  # 간단한 점수
                    
                topic_scores.append(score)
                
            # 정규화
            total_score = sum(topic_scores)
            if total_score > 0:
                topic_scores = [score / total_score for score in topic_scores]
                
            assignments[doc_id] = topic_scores
            
        return assignments
        
    def _calculate_topic_coherence(self, topic_words: List[Tuple[str, float]]) -> float:
        """토픽 응집도 계산"""
        
        # 간단한 응집도 측정: 상위 단어들의 점수 표준편차
        if len(topic_words) < 2:
            return 1.0
            
        scores = [score for word, score in topic_words]
        return 1.0 - (np.std(scores) / np.mean(scores)) if np.mean(scores) > 0 else 0.0
        
    def _generate_topic_description(self, topic_words: List[Tuple[str, float]]) -> str:
        """토픽 설명 생성"""
        
        if not topic_words:
            return "빈 토픽"
            
        top_words = [word for word, score in topic_words[:5]]
        
        # 도메인별 설명 매핑
        descriptions = {
            ('시공사', '건설사', '대우', '삼성'): "시공사 및 건설업체 관련",
            ('분담금', '환급', '비용', '예산'): "재정 및 비용 관련",
            ('총회', '투표', '안건', '승인'): "회의 및 의사결정 관련",
            ('커뮤니티', '시설', '수영장', '헬스'): "커뮤니티 시설 관련",
            ('아파트', '단지', '브랜드', '프리미엄'): "주거 및 부동산 관련"
        }
        
        for keywords, desc in descriptions.items():
            if any(keyword in top_words for keyword in keywords):
                return desc
                
        return f"키워드: {', '.join(top_words)}"
        
    def get_recommendations(self, document_id: str, 
                          recommendation_type: str = "similar",
                          top_k: int = 5) -> List[SimilarityResult]:
        """추천 시스템"""
        
        if document_id not in self.document_vectors:
            raise ValueError(f"문서를 찾을 수 없습니다: {document_id}")
            
        if recommendation_type == "similar":
            return self.find_similar_documents(document_id, top_k)
        elif recommendation_type == "cluster_based":
            return self._cluster_based_recommendations(document_id, top_k)
        elif recommendation_type == "topic_based":
            return self._topic_based_recommendations(document_id, top_k)
        else:
            return self.find_similar_documents(document_id, top_k)
            
    def _cluster_based_recommendations(self, document_id: str, top_k: int) -> List[SimilarityResult]:
        """클러스터 기반 추천"""
        
        # 문서가 속한 클러스터 찾기
        target_cluster = None
        for cluster in self.clusters.values():
            if document_id in cluster.documents:
                target_cluster = cluster
                break
                
        if not target_cluster:
            return []
            
        # 같은 클러스터의 다른 문서들 추천
        recommendations = []
        for doc_id in target_cluster.documents:
            if doc_id != document_id:
                doc_vector = self.document_vectors[doc_id]
                result = SimilarityResult(
                    query_document_id=document_id,
                    similar_document_id=doc_id,
                    similarity_score=0.8,  # 클러스터 기반이므로 높은 점수
                    content_preview=doc_vector.content[:100] + "...",
                    metadata=doc_vector.metadata,
                    similarity_type="cluster_based"
                )
                recommendations.append(result)
                
        return recommendations[:top_k]
        
    def _topic_based_recommendations(self, document_id: str, top_k: int) -> List[SimilarityResult]:
        """토픽 기반 추천"""
        
        # 문서의 주요 토픽 찾기
        relevant_topics = []
        for topic_model in self.topic_models:
            for doc_id, score in topic_model.document_assignments:
                if doc_id == document_id and score > 0.3:
                    relevant_topics.append(topic_model)
                    
        if not relevant_topics:
            return []
            
        # 같은 토픽의 다른 문서들 추천
        recommendations = []
        for topic_model in relevant_topics:
            for doc_id, score in topic_model.document_assignments:
                if doc_id != document_id and score > 0.3:
                    doc_vector = self.document_vectors[doc_id]
                    result = SimilarityResult(
                        query_document_id=document_id,
                        similar_document_id=doc_id,
                        similarity_score=score,
                        content_preview=doc_vector.content[:100] + "...",
                        metadata=doc_vector.metadata,
                        similarity_type="topic_based"
                    )
                    recommendations.append(result)
                    
        # 점수순 정렬
        recommendations.sort(key=lambda x: x.similarity_score, reverse=True)
        
        return recommendations[:top_k]
        
    def get_engine_statistics(self) -> Dict[str, Any]:
        """엔진 통계"""
        
        total_documents = len(self.document_vectors)
        
        if total_documents == 0:
            return {"status": "no_data"}
            
        # 벡터 차원 분포
        dimensions = [doc.dimension for doc in self.document_vectors.values()]
        
        # 벡터 모델 분포
        model_counts = Counter(doc.vector_model for doc in self.document_vectors.values())
        
        # 클러스터 통계
        cluster_stats = {}
        if self.clusters:
            cluster_sizes = [cluster.cluster_size for cluster in self.clusters.values()]
            cluster_stats = {
                'total_clusters': len(self.clusters),
                'avg_cluster_size': np.mean(cluster_sizes),
                'max_cluster_size': max(cluster_sizes),
                'min_cluster_size': min(cluster_sizes)
            }
            
        # 토픽 모델 통계
        topic_stats = {}
        if self.topic_models:
            topic_stats = {
                'total_topics': len(self.topic_models),
                'avg_coherence': np.mean([topic.topic_coherence for topic in self.topic_models])
            }
            
        return {
            'total_documents': total_documents,
            'vector_dimension': self.vector_dimension,
            'vocabulary_size': len(self.vocabulary),
            'model_distribution': dict(model_counts),
            'avg_vector_dimension': np.mean(dimensions),
            'cluster_statistics': cluster_stats,
            'topic_statistics': topic_stats,
            'cache_size': len(self.similarity_cache)
        }


# 사용 예시 및 테스트
def test_vector_search_engine():
    """벡터 검색 엔진 테스트"""
    
    print("🔍 벡터 검색 및 유사도 분석 시스템 테스트")
    print("=" * 60)
    
    engine = VectorSearchSimilarityEngine(vector_dimension=100)
    
    # 테스트 문서들
    test_documents = [
        {
            'id': 'doc001',
            'content': '시공사 선정이 중요합니다. 대우건설과 삼성물산 중에서 선택해야 합니다.',
            'metadata': {'category': 'construction', 'author': '김조합원'}
        },
        {
            'id': 'doc002', 
            'content': '분담금 계산 결과를 공유합니다. 총 비용은 예상보다 높게 나왔습니다.',
            'metadata': {'category': 'finance', 'author': '이조합원'}
        },
        {
            'id': 'doc003',
            'content': '다음 총회에서 안건을 승인받아야 합니다. 투표 절차를 준비하겠습니다.',
            'metadata': {'category': 'meeting', 'author': '박조합원'}
        },
        {
            'id': 'doc004',
            'content': '커뮤니티 시설 설계안을 검토했습니다. 수영장과 헬스장이 포함됩니다.',
            'metadata': {'category': 'facilities', 'author': '최조합원'}
        },
        {
            'id': 'doc005',
            'content': 'GS건설의 제안서가 인상적입니다. 시공 경험이 풍부한 것 같습니다.',
            'metadata': {'category': 'construction', 'author': '정조합원'}
        },
        {
            'id': 'doc006',
            'content': '환급 일정과 절차를 안내드립니다. 예산 범위 내에서 진행됩니다.',
            'metadata': {'category': 'finance', 'author': '강조합원'}
        }
    ]
    
    print("1. 문서 추가 및 벡터화...")
    for doc in test_documents:
        engine.add_document(
            doc['id'], 
            doc['content'], 
            doc['metadata'],
            vector_model="custom"  # 도메인 특화 벡터화
        )
        
    print(f"   → {len(test_documents)}개 문서 벡터화 완료")
    
    print(f"\n2. 유사 문서 검색 테스트...")
    query_doc_id = 'doc001'
    similar_docs = engine.find_similar_documents(
        query_doc_id, 
        top_k=3, 
        similarity_threshold=0.1
    )
    
    print(f"   쿼리 문서: {engine.document_vectors[query_doc_id].content}")
    print(f"   유사 문서 {len(similar_docs)}개 발견:")
    
    for result in similar_docs:
        print(f"     - {result.similar_document_id}: {result.similarity_score:.3f}")
        print(f"       {result.content_preview}")
        
    print(f"\n3. 텍스트 쿼리 검색 테스트...")
    query_text = "시공사 비교 검토"
    search_results = engine.search_by_text(
        query_text,
        top_k=3,
        vector_model="custom"
    )
    
    print(f"   쿼리: '{query_text}'")
    print(f"   검색 결과 {len(search_results)}개:")
    
    for result in search_results:
        print(f"     - {result.similar_document_id}: {result.similarity_score:.3f}")
        print(f"       {result.content_preview}")
        
    print(f"\n4. 문서 클러스터링 테스트...")
    clusters = engine.cluster_documents(num_clusters=3)
    
    print(f"   생성된 클러스터: {len(clusters)}개")
    
    for cluster in clusters:
        print(f"     클러스터 {cluster.cluster_id}:")
        print(f"       문서 수: {cluster.cluster_size}개")
        print(f"       응집도: {cluster.coherence_score:.3f}")
        print(f"       주요 토픽: {cluster.dominant_topics}")
        print(f"       키워드: {cluster.representative_keywords[:3]}")
        print(f"       문서들: {cluster.documents}")
        
    print(f"\n5. 토픽 모델링 테스트...")
    topic_models = engine.build_topic_model(num_topics=3)
    
    print(f"   생성된 토픽: {len(topic_models)}개")
    
    for topic in topic_models:
        print(f"     {topic.topic_id}: {topic.topic_description}")
        print(f"       응집도: {topic.topic_coherence:.3f}")
        print(f"       주요 단어: {[word for word, score in topic.topic_words[:5]]}")
        print(f"       관련 문서: {len(topic.document_assignments)}개")
        
    print(f"\n6. 추천 시스템 테스트...")
    
    # 유사도 기반 추천
    similar_recommendations = engine.get_recommendations(
        'doc001', 
        recommendation_type="similar", 
        top_k=2
    )
    print(f"   유사도 기반 추천:")
    for rec in similar_recommendations:
        print(f"     - {rec.similar_document_id}: {rec.similarity_score:.3f}")
        
    # 클러스터 기반 추천
    cluster_recommendations = engine.get_recommendations(
        'doc001',
        recommendation_type="cluster_based",
        top_k=2
    )
    print(f"   클러스터 기반 추천:")
    for rec in cluster_recommendations:
        print(f"     - {rec.similar_document_id}: {rec.similarity_score:.3f}")
        
    print(f"\n7. 엔진 통계:")
    stats = engine.get_engine_statistics()
    
    print(f"   총 문서: {stats['total_documents']}개")
    print(f"   벡터 차원: {stats['vector_dimension']}")
    print(f"   어휘 크기: {stats['vocabulary_size']}")
    print(f"   모델 분포: {stats['model_distribution']}")
    
    if stats['cluster_statistics']:
        cluster_stats = stats['cluster_statistics']
        print(f"   클러스터: {cluster_stats['total_clusters']}개 "
              f"(평균 크기: {cluster_stats['avg_cluster_size']:.1f})")
              
    if stats['topic_statistics']:
        topic_stats = stats['topic_statistics']
        print(f"   토픽: {topic_stats['total_topics']}개 "
              f"(평균 응집도: {topic_stats['avg_coherence']:.3f})")
    
    print(f"\n🏆 벡터 검색 및 유사도 분석 시스템 테스트 완료!")
    

if __name__ == "__main__":
    test_vector_search_engine() 