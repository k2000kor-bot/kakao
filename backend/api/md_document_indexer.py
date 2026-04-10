"""
MD 파일 인덱싱 및 검색 시스템
프로젝트의 모든 MD 파일을 인덱싱하고 검색하는 모듈
"""

import os
import re
import logging
from typing import List, Dict, Optional
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)


class MDDocumentIndexer:
    """MD 파일 인덱서 클래스"""
    
    def __init__(self, root_path: str = None):
        """
        초기화
        
        Args:
            root_path: 프로젝트 루트 경로 (기본값: 현재 디렉토리에서 찾기)
        """
        if root_path is None:
            # 현재 파일 위치에서 프로젝트 루트 찾기
            current_dir = Path(__file__).parent.parent.parent
            # worktree나 심볼릭 링크인 경우 실제 경로 찾기
            try:
                resolved = current_dir.resolve()
                self.root_path = str(resolved)
            except (OSError, RuntimeError):
                self.root_path = str(current_dir)
        else:
            self.root_path = root_path
            
        self.index = {}  # {file_path: {content, sections, metadata}}
        self.indexed_files = set()
        self.last_indexed = None
        self.search_cache = {}  # 간단한 검색 결과 캐시
        
        logger.debug(f"MD 인덱서 초기화: root_path={self.root_path}")
        
    def find_md_files(self) -> List[str]:
        """프로젝트의 모든 MD 파일 찾기"""
        md_files = []
        
        # 제외할 디렉토리
        exclude_dirs = {
            'node_modules', '.git', '__pycache__', 'dist', 'build',
            'backups', 'cleanup_backup', '.vscode', '.idea',
            'corbu-ai',  # 하위 프로젝트 제외
            '.cursor',  # Cursor 관련 디렉토리 제외
        }
        
        try:
            root = Path(self.root_path)
            
            # 루트 경로가 존재하는지 확인
            if not root.exists():
                logger.warning(f"루트 경로가 존재하지 않습니다: {self.root_path}")
                # 상위 디렉토리 시도
                parent = root.parent
                if parent.exists():
                    logger.info(f"상위 디렉토리 사용: {parent}")
                    root = parent
                else:
                    logger.error("유효한 프로젝트 루트를 찾을 수 없습니다.")
                    return []
            
            for md_file in root.rglob('*.md'):
                # 제외 디렉토리에 포함되지 않은 파일만
                if any(excluded in md_file.parts for excluded in exclude_dirs):
                    continue
                # 파일이 실제로 존재하고 읽을 수 있는지 확인
                try:
                    if md_file.is_file() and md_file.stat().st_size > 0:
                        md_files.append(str(md_file))
                except (OSError, PermissionError):
                    continue
            
            logger.info(f"총 {len(md_files)}개의 MD 파일을 찾았습니다.")
            return md_files
        except Exception as e:
            logger.error(f"MD 파일 검색 오류: {e}")
            return []
    
    def parse_md_file(self, file_path: str) -> Dict:
        """
        MD 파일을 파싱하여 구조화된 데이터로 변환
        
        Returns:
            {
                'content': 전체 내용,
                'sections': [{'title': 제목, 'content': 내용, 'level': 레벨}],
                'metadata': {'file_name', 'file_path', 'size', 'modified'}
            }
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # 파일 메타데이터
            file_stat = os.stat(file_path)
            metadata = {
                'file_name': os.path.basename(file_path),
                'file_path': file_path,
                'relative_path': os.path.relpath(file_path, self.root_path),
                'size': file_stat.st_size,
                'modified': datetime.fromtimestamp(file_stat.st_mtime).isoformat()
            }
            
            # 섹션 추출 (헤더 기반)
            sections = self._extract_sections(content)
            
            return {
                'content': content,
                'sections': sections,
                'metadata': metadata
            }
            
        except Exception as e:
            logger.error(f"MD 파일 파싱 오류 ({file_path}): {e}")
            return {
                'content': '',
                'sections': [],
                'metadata': {'file_path': file_path, 'error': str(e)}
            }
    
    def _extract_sections(self, content: str) -> List[Dict]:
        """MD 파일에서 섹션 추출 (헤더 기준)"""
        sections = []
        lines = content.split('\n')
        current_section = {'title': 'Introduction', 'content': [], 'level': 0}
        
        for line in lines:
            # 헤더 감지 (#으로 시작)
            header_match = re.match(r'^(#{1,6})\s+(.+)$', line)
            if header_match:
                # 이전 섹션 저장
                if current_section['content']:
                    sections.append({
                        'title': current_section['title'],
                        'content': '\n'.join(current_section['content']).strip(),
                        'level': current_section['level']
                    })
                
                # 새 섹션 시작
                level = len(header_match.group(1))
                title = header_match.group(2).strip()
                current_section = {'title': title, 'content': [], 'level': level}
            else:
                current_section['content'].append(line)
        
        # 마지막 섹션 저장
        if current_section['content']:
            sections.append({
                'title': current_section['title'],
                'content': '\n'.join(current_section['content']).strip(),
                'level': current_section['level']
            })
        
        return sections
    
    def index_all_files(self, force_reindex: bool = False):
        """모든 MD 파일 인덱싱"""
        if not force_reindex and self.index and self.last_indexed:
            logger.info("인덱스가 이미 존재합니다. force_reindex=True로 강제 재인덱싱하세요.")
            return
        
        md_files = self.find_md_files()
        logger.info(f"{len(md_files)}개 파일 인덱싱 시작...")
        
        if force_reindex:
            self.index = {}
            self.search_cache = {}  # 재인덱싱 시 캐시도 초기화
        
        indexed_count = len(self.index)  # 기존 인덱스 개수
        
        for md_file in md_files:
            # 이미 인덱싱된 파일은 건너뛰기 (재인덱싱이 아닌 경우)
            if md_file in self.index and not force_reindex:
                continue
                
            try:
                parsed = self.parse_md_file(md_file)
                if parsed['content']:  # 내용이 있는 경우만 인덱싱
                    self.index[md_file] = parsed
                    indexed_count += 1
            except Exception as e:
                logger.error(f"인덱싱 오류 ({md_file}): {e}")
        
        self.last_indexed = datetime.now().isoformat()
        logger.info(f"인덱싱 완료: {indexed_count}/{len(md_files)} 파일")
    
    def search(self, query: str, max_results: int = 5) -> List[Dict]:
        """
        쿼리로 관련 MD 파일 내용 검색
        
        Args:
            query: 검색 쿼리
            max_results: 최대 결과 수
            
        Returns:
            [{
                'file_path': 파일 경로,
                'metadata': 메타데이터,
                'matched_sections': [매칭된 섹션들],
                'relevance_score': 관련도 점수
            }]
        """
        if not self.index:
            logger.info("인덱스가 없습니다. 빠른 인덱싱을 시작합니다...")
            try:
                # 빠른 인덱싱 시도 (일부 파일만 먼저)
                self.index_all_files()
            except Exception as e:
                logger.error(f"인덱싱 실패: {e}")
                return []
        
        # 캐시 확인 (간단한 해시 기반)
        cache_key = f"{query.lower()}_{max_results}"
        if cache_key in self.search_cache:
            logger.debug(f"검색 결과 캐시 히트: {query}")
            return self.search_cache[cache_key]
        
        query_lower = query.lower().strip()
        query_words = set(query_lower.split())
        
        results = []
        
        for file_path, file_data in self.index.items():
            matched_sections = []
            total_score = 0
            
            # 전체 내용에서 검색
            content_lower = file_data['content'].lower()
            content_score = self._calculate_relevance(query_words, content_lower)
            
            # 섹션별 검색
            for section in file_data.get('sections', []):
                section_text = f"{section['title']} {section['content']}".lower()
                section_score = self._calculate_relevance(query_words, section_text)
                
                if section_score > 0:
                    matched_sections.append({
                        'title': section['title'],
                        'content': section['content'],
                        'level': section['level'],
                        'score': section_score
                    })
                    total_score += section_score
            
            # 파일명/경로에서도 검색 (보너스 점수)
            metadata = file_data.get('metadata', {})
            file_name_lower = metadata.get('file_name', '').lower()
            relative_path_lower = metadata.get('relative_path', '').lower()
            
            # 파일명 매칭 보너스 (더 높은 가중치)
            filename_matches = sum(1 for word in query_words if word in file_name_lower)
            if filename_matches > 0:
                total_score += 0.5 * (filename_matches / len(query_words))
            
            # 경로 매칭 보너스
            path_matches = sum(1 for word in query_words if word in relative_path_lower)
            if path_matches > 0:
                total_score += 0.2 * (path_matches / len(query_words))
            
            # 특정 파일명 패턴 보너스
            important_patterns = {
                'readme': 0.3, 'start': 0.3, 'guide': 0.2, 'quick': 0.2,
                'api': 0.2, 'docs': 0.2, 'manual': 0.2
            }
            for pattern, bonus in important_patterns.items():
                if pattern in file_name_lower and any(pattern in word or word in pattern 
                                                     for word in query_words):
                    total_score += bonus
            
            if total_score > 0 or content_score > 0:
                final_score = max(total_score, content_score)
                results.append({
                    'file_path': file_path,
                    'relative_path': metadata.get('relative_path', file_path),
                    'metadata': metadata,
                    'matched_sections': sorted(matched_sections, key=lambda x: x['score'], reverse=True)[:3],
                    'relevance_score': final_score,
                    'content_preview': file_data['content'][:500]  # 미리보기
                })
        
        # 관련도 점수로 정렬
        results.sort(key=lambda x: x['relevance_score'], reverse=True)
        final_results = results[:max_results]
        
        # 캐시에 저장 (최대 100개만 캐시)
        if len(self.search_cache) < 100:
            self.search_cache[cache_key] = final_results
        else:
            # 가장 오래된 캐시 항목 제거 (FIFO)
            oldest_key = next(iter(self.search_cache))
            del self.search_cache[oldest_key]
            self.search_cache[cache_key] = final_results
        
        return final_results
    
    def _calculate_relevance(self, query_words: set, text: str) -> float:
        """텍스트와 쿼리의 관련도 계산 (개선된 알고리즘)"""
        if not query_words or not text:
            return 0.0
        
        # 불용어 제거 (한국어/영어)
        stop_words = {
            '은', '는', '이', '가', '을', '를', '에', '의', '와', '과', '도', '로', '으로',
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'
        }
        filtered_words = {w for w in query_words if w not in stop_words and len(w) > 1}
        
        if not filtered_words:
            return 0.0
        
        # 단어별 매칭 점수 계산
        word_scores = []
        text_lower = text.lower()
        matched_count = 0
        
        for word in filtered_words:
            # 정확한 단어 매칭
            exact_count = text_lower.count(f' {word} ') + text_lower.count(f'{word} ') + text_lower.count(f' {word}')
            if exact_count > 0:
                # 단어 길이와 빈도 고려 (긴 단어일수록 더 중요한 키워드)
                base_score = min(len(word) / 8.0, 2.0)  # 최대 2.0
                frequency_bonus = min(exact_count / 3.0, 1.5)  # 빈도 보너스
                word_score = base_score * (1 + frequency_bonus)
                word_scores.append(word_score)
                matched_count += 1
            else:
                # 부분 매칭 시도 (한국어의 경우 어간 추출 효과)
                partial_matches = sum(1 for i in range(len(text_lower) - len(word) + 1) 
                                     if text_lower[i:i+len(word)] == word)
                if partial_matches > 0:
                    # 부분 매칭은 낮은 점수
                    word_score = (len(word) / 15.0) * min(partial_matches / 5.0, 0.5)
                    word_scores.append(word_score)
                    matched_count += 0.5  # 부분 매칭은 절반만 카운트
        
        if not word_scores:
            return 0.0
        
        # 평균 점수
        avg_score = sum(word_scores) / len(word_scores)
        
        # 모든 단어가 매칭되면 보너스
        match_ratio = matched_count / len(filtered_words)
        if match_ratio >= 0.8:  # 80% 이상 매칭
            avg_score *= 1.5
        elif match_ratio >= 0.5:  # 50% 이상 매칭
            avg_score *= 1.2
        
        return avg_score
    
    def get_file_content(self, file_path: str) -> Optional[str]:
        """특정 파일의 전체 내용 가져오기"""
        if file_path in self.index:
            return self.index[file_path]['content']
        return None
    
    def get_context_for_query(self, query: str, max_chars: Optional[int] = None) -> str:
        """
        쿼리에 대한 컨텍스트 생성 (여러 파일의 관련 내용 결합)

        Args:
            query: 검색 쿼리
            max_chars: 최대 문자 수(None이면 검색·섹션·본문 전부 포함)
        """
        results = self.search(query, max_results=20)
        context_parts: List[str] = []
        total_chars = 0

        for result in results:
            file_name = result["metadata"].get("file_name", "Unknown")
            header = f"\n## 파일: {file_name}\n"
            if max_chars is not None and total_chars + len(header) > max_chars:
                break
            context_parts.append(header)
            total_chars += len(header)

            for section in result.get("matched_sections") or []:
                body = section.get("content") or ""
                section_text = f"\n### {section.get('title', '')}\n{body}\n"
                if max_chars is None:
                    context_parts.append(section_text)
                    continue
                if total_chars + len(section_text) > max_chars:
                    remaining = max_chars - total_chars - 100
                    if remaining > 0:
                        context_parts.append(section_text[:remaining] + "...")
                    return "\n".join(context_parts)
                context_parts.append(section_text)
                total_chars += len(section_text)

            if max_chars is not None and total_chars >= max_chars:
                break

        return "\n".join(context_parts)


# 전역 인스턴스
_md_indexer: Optional[MDDocumentIndexer] = None


def get_md_indexer(root_path: str = None) -> MDDocumentIndexer:
    """MD 인덱서 싱글톤 인스턴스 가져오기"""
    global _md_indexer
    if _md_indexer is None:
        _md_indexer = MDDocumentIndexer(root_path)
        try:
            # 백그라운드에서 인덱싱 시작 (비동기로 처리)
            import threading
            def index_in_background():
                try:
                    _md_indexer.index_all_files()
                    logger.info(f"MD 파일 인덱싱 완료: {len(_md_indexer.index)}개 파일")
                except Exception as e:
                    logger.error(f"MD 파일 인덱싱 오류: {e}")
            
            # 백그라운드 스레드에서 인덱싱 시작
            index_thread = threading.Thread(target=index_in_background, daemon=True)
            index_thread.start()
            logger.info("MD 파일 인덱싱을 백그라운드에서 시작했습니다...")
        except Exception as e:
            logger.warning(f"백그라운드 인덱싱 시작 실패, 동기적으로 진행: {e}")
            try:
                _md_indexer.index_all_files()
            except Exception as e2:
                logger.error(f"MD 파일 인덱싱 오류: {e2}")
    return _md_indexer


def reindex_md_files(root_path: str = None):
    """MD 파일 재인덱싱"""
    global _md_indexer
    _md_indexer = MDDocumentIndexer(root_path)
    _md_indexer.index_all_files(force_reindex=True)
    return _md_indexer
