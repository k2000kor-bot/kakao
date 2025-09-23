#!/usr/bin/env python3
"""
CORBU AI 캐시 관리 시스템
메모리 캐시 및 Redis 캐시 관리
"""

import time
import json
import hashlib
from typing import Any, Optional, Dict
from datetime import datetime, timedelta
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import threading
from collections import OrderedDict

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Cache Manager API",
    description="Intelligent caching system for CORBU AI",
    version="1.0.0",
)

class CacheEntry(BaseModel):
    key: str
    value: Any
    created_at: datetime
    expires_at: Optional[datetime] = None
    access_count: int = 0
    last_accessed: datetime

class CacheStats(BaseModel):
    total_entries: int
    hit_rate: float
    miss_rate: float
    memory_usage_mb: float
    evicted_entries: int
    expired_entries: int

class CacheManager:
    def __init__(self, max_size: int = 1000, default_ttl: int = 3600):
        self.max_size = max_size
        self.default_ttl = default_ttl
        self.cache: OrderedDict[str, CacheEntry] = OrderedDict()
        self.stats = {
            "hits": 0,
            "misses": 0,
            "evictions": 0,
            "expirations": 0
        }
        self.lock = threading.RLock()
        
    def _generate_key(self, prefix: str, *args) -> str:
        """캐시 키 생성"""
        key_string = f"{prefix}:{':'.join(str(arg) for arg in args)}"
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def get(self, key: str) -> Optional[Any]:
        """캐시에서 값 조회"""
        with self.lock:
            if key in self.cache:
                entry = self.cache[key]
                
                # 만료 확인
                if entry.expires_at and datetime.now() > entry.expires_at:
                    del self.cache[key]
                    self.stats["expirations"] += 1
                    self.stats["misses"] += 1
                    return None
                
                # 접근 통계 업데이트
                entry.access_count += 1
                entry.last_accessed = datetime.now()
                
                # LRU: 가장 최근 접근한 항목을 맨 뒤로
                self.cache.move_to_end(key)
                
                self.stats["hits"] += 1
                return entry.value
            else:
                self.stats["misses"] += 1
                return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """캐시에 값 저장"""
        with self.lock:
            ttl = ttl or self.default_ttl
            expires_at = datetime.now() + timedelta(seconds=ttl) if ttl > 0 else None
            
            entry = CacheEntry(
                key=key,
                value=value,
                created_at=datetime.now(),
                expires_at=expires_at,
                access_count=0,
                last_accessed=datetime.now()
            )
            
            self.cache[key] = entry
            
            # 크기 제한 확인
            if len(self.cache) > self.max_size:
                # LRU: 가장 오래된 항목 제거
                oldest_key = next(iter(self.cache))
                del self.cache[oldest_key]
                self.stats["evictions"] += 1
    
    def delete(self, key: str) -> bool:
        """캐시에서 값 삭제"""
        with self.lock:
            if key in self.cache:
                del self.cache[key]
                return True
            return False
    
    def clear(self) -> None:
        """캐시 전체 삭제"""
        with self.lock:
            self.cache.clear()
    
    def cleanup_expired(self) -> int:
        """만료된 항목 정리"""
        with self.lock:
            expired_keys = []
            now = datetime.now()
            
            for key, entry in self.cache.items():
                if entry.expires_at and now > entry.expires_at:
                    expired_keys.append(key)
            
            for key in expired_keys:
                del self.cache[key]
                self.stats["expirations"] += 1
            
            return len(expired_keys)
    
    def get_stats(self) -> CacheStats:
        """캐시 통계 조회"""
        with self.lock:
            total_requests = self.stats["hits"] + self.stats["misses"]
            hit_rate = (self.stats["hits"] / total_requests * 100) if total_requests > 0 else 0
            miss_rate = (self.stats["misses"] / total_requests * 100) if total_requests > 0 else 0
            
            # 메모리 사용량 추정 (간단한 계산)
            memory_usage_mb = len(json.dumps(list(self.cache.values()), default=str)) / (1024 * 1024)
            
            return CacheStats(
                total_entries=len(self.cache),
                hit_rate=hit_rate,
                miss_rate=miss_rate,
                memory_usage_mb=memory_usage_mb,
                evicted_entries=self.stats["evictions"],
                expired_entries=self.stats["expirations"]
            )

# 전역 캐시 매니저 인스턴스
cache_manager = CacheManager(max_size=2000, default_ttl=1800)  # 30분 기본 TTL

def background_cleanup():
    """백그라운드 정리 작업"""
    while True:
        try:
            expired_count = cache_manager.cleanup_expired()
            if expired_count > 0:
                logger.info(f"Cleaned up {expired_count} expired cache entries")
            time.sleep(300)  # 5분마다 정리
        except Exception as e:
            logger.error(f"Cache cleanup error: {e}")
            time.sleep(600)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "cache_manager", "timestamp": datetime.now().isoformat()}

@app.get("/cache/{key}")
async def get_cache(key: str):
    """캐시 값 조회"""
    value = cache_manager.get(key)
    if value is None:
        raise HTTPException(status_code=404, detail="Cache key not found")
    return {"key": key, "value": value}

@app.post("/cache/{key}")
async def set_cache(key: str, value: Any, ttl: Optional[int] = None):
    """캐시 값 저장"""
    cache_manager.set(key, value, ttl)
    return {"status": "cached", "key": key, "ttl": ttl}

@app.delete("/cache/{key}")
async def delete_cache(key: str):
    """캐시 값 삭제"""
    success = cache_manager.delete(key)
    if not success:
        raise HTTPException(status_code=404, detail="Cache key not found")
    return {"status": "deleted", "key": key}

@app.delete("/cache")
async def clear_cache():
    """전체 캐시 삭제"""
    cache_manager.clear()
    return {"status": "cleared"}

@app.get("/cache/stats")
async def get_cache_stats():
    """캐시 통계 조회"""
    return cache_manager.get_stats()

@app.get("/cache/keys")
async def list_cache_keys(limit: int = 100):
    """캐시 키 목록 조회"""
    with cache_manager.lock:
        keys = list(cache_manager.cache.keys())[:limit]
        return {"keys": keys, "total": len(cache_manager.cache)}

# 특화된 캐시 함수들
@app.post("/cache/intent/{intent_key}")
async def cache_intent_result(intent_key: str, result: Dict[str, Any], ttl: int = 3600):
    """의도 분류 결과 캐시"""
    cache_manager.set(f"intent:{intent_key}", result, ttl)
    return {"status": "cached", "type": "intent"}

@app.get("/cache/intent/{intent_key}")
async def get_cached_intent(intent_key: str):
    """캐시된 의도 분류 결과 조회"""
    result = cache_manager.get(f"intent:{intent_key}")
    if result is None:
        raise HTTPException(status_code=404, detail="Intent result not found in cache")
    return {"intent_key": intent_key, "result": result}

@app.post("/cache/analysis/{analysis_key}")
async def cache_analysis_result(analysis_key: str, result: Dict[str, Any], ttl: int = 1800):
    """분석 결과 캐시"""
    cache_manager.set(f"analysis:{analysis_key}", result, ttl)
    return {"status": "cached", "type": "analysis"}

@app.get("/cache/analysis/{analysis_key}")
async def get_cached_analysis(analysis_key: str):
    """캐시된 분석 결과 조회"""
    result = cache_manager.get(f"analysis:{analysis_key}")
    if result is None:
        raise HTTPException(status_code=404, detail="Analysis result not found in cache")
    return {"analysis_key": analysis_key, "result": result}

@app.post("/cache/context/{session_id}")
async def cache_context(session_id: str, context: Dict[str, Any], ttl: int = 7200):
    """대화 컨텍스트 캐시"""
    cache_manager.set(f"context:{session_id}", context, ttl)
    return {"status": "cached", "type": "context"}

@app.get("/cache/context/{session_id}")
async def get_cached_context(session_id: str):
    """캐시된 대화 컨텍스트 조회"""
    context = cache_manager.get(f"context:{session_id}")
    if context is None:
        raise HTTPException(status_code=404, detail="Context not found in cache")
    return {"session_id": session_id, "context": context}

if __name__ == "__main__":
    # 백그라운드 정리 작업 시작
    cleanup_thread = threading.Thread(target=background_cleanup, daemon=True)
    cleanup_thread.start()
    
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8014)
