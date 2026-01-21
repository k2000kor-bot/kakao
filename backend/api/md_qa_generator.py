"""
MD 문서 기반 질문-답변 생성기
MD 파일 내용을 기반으로 질문에 대한 답변을 생성
"""

import logging
from typing import Dict, Optional, List
try:
    from api.md_document_indexer import get_md_indexer
except ImportError:
    # 순환 import 방지를 위한 fallback
    def get_md_indexer():
        from api.md_document_indexer import get_md_indexer as _get_md_indexer
        return _get_md_indexer()

logger = logging.getLogger(__name__)


class MDQAGenerator:
    """MD 문서 기반 QA 생성기"""
    
    def __init__(self):
        try:
            self.indexer = get_md_indexer()
        except Exception as e:
            logger.error(f"MD 인덱서 초기화 오류: {e}")
            # 더미 인덱서 생성 (오류 방지)
            from api.md_document_indexer import MDDocumentIndexer
            self.indexer = MDDocumentIndexer()
    
    def generate_answer(self, question: str, include_sources: bool = True) -> Dict:
        """
        질문에 대한 답변 생성
        
        Args:
            question: 사용자 질문
            include_sources: 출처 정보 포함 여부
            
        Returns:
            {
                'answer': 답변 텍스트,
                'sources': [출처 정보],
                'confidence': 신뢰도 (0-1)
            }
        """
        try:
            if not question or not question.strip():
                return {
                    'answer': '질문을 입력해주세요.',
                    'sources': [],
                    'confidence': 0.0
                }
            
            # 인덱싱이 아직 진행 중인지 확인
            if not self.indexer.index:
                # 인덱싱이 완료되지 않았으면 잠시 대기
                import time
                max_wait = 5  # 최대 5초 대기
                waited = 0
                while not self.indexer.index and waited < max_wait:
                    time.sleep(0.5)
                    waited += 0.5
                
                if not self.indexer.index:
                    return {
                        'answer': '문서 인덱싱이 아직 진행 중입니다. 잠시 후 다시 시도해주세요. 또는 일반 채팅 기능을 사용해주세요.',
                        'sources': [],
                        'confidence': 0.0
                    }
            
            # 문서 검색 (검색 향상 모듈 사용)
            try:
                from api.md_search_enhancer import get_search_enhancer
                enhancer = get_search_enhancer()
                enhanced_query = enhancer.enhance_search_query(question)
                
                # 향상된 쿼리로 검색
                search_query = enhanced_query.get('enhanced_query', question)
                search_results = self.indexer.search(search_query, max_results=8)
                
                # 검색 결과 재순위화
                search_results = enhancer.rerank_results(search_results, enhanced_query)
                search_results = search_results[:5]  # 상위 5개만
                
                logger.debug(f"검색 향상 적용: 타입={enhanced_query.get('query_type')}, 확장어={len(enhanced_query.get('expanded_terms', []))}")
            except Exception as e:
                logger.warning(f"검색 향상 실패, 기본 검색 사용: {e}")
                try:
                    search_results = self.indexer.search(question, max_results=5)
                except Exception as e2:
                    logger.error(f"문서 검색 오류: {e2}")
                    search_results = []
            
            if not search_results:
                return {
                    'answer': '죄송합니다. 프로젝트 문서에서 관련 정보를 찾을 수 없습니다. 질문을 다르게 표현해보시거나, 일반 채팅 기능을 사용해주세요.',
                    'sources': [],
                    'confidence': 0.0
                }
            
            # 컨텍스트 생성 (LLM에 전달할 충분한 정보)
            context = self.indexer.get_context_for_query(question, max_chars=6000)
            
            # 답변 생성
            answer = self._generate_answer_from_context(question, context, search_results)
            
            # 출처 정보 준비
            sources = []
            if include_sources:
                for result in search_results[:3]:
                    sources.append({
                        'file': result['relative_path'],
                        'file_name': result['metadata'].get('file_name', ''),
                        'sections': [s['title'] for s in result['matched_sections'][:3]]
                    })
            
            # 신뢰도 계산 (검색 결과 점수 기반)
            confidence = min(1.0, search_results[0]['relevance_score'] / 5.0) if search_results else 0.0
            
            return {
                'answer': answer,
                'sources': sources,
                'confidence': confidence,
                'search_results_count': len(search_results)
            }
            
        except Exception as e:
            logger.error(f"답변 생성 오류: {e}")
            return {
                'answer': f'답변 생성 중 오류가 발생했습니다: {str(e)}',
                'sources': [],
                'confidence': 0.0
            }
    
    def _generate_answer_from_context(self, question: str, context: str, search_results: List[Dict]) -> str:
        """
        컨텍스트와 검색 결과를 기반으로 답변 생성
        
        LLM이 있으면 활용, 없으면 템플릿 기반 생성
        """
        if not context:
            return "관련 문서를 찾을 수 없습니다."
        
        # LLM 통합 시도 (있으면 더 자연스러운 답변 생성)
        try:
            llm_answer = self._generate_with_llm(question, context, search_results)
            if llm_answer and len(llm_answer.strip()) > 50:
                return llm_answer
        except Exception as e:
            logger.debug(f"LLM 기반 답변 생성 실패, 템플릿 사용: {e}")
        
        # 템플릿 기반 답변 생성
        return self._generate_template_answer(question, context, search_results)
    
    def _generate_with_llm(self, question: str, context: str, search_results: List[Dict]) -> Optional[str]:
        """LLM을 활용한 자연스러운 답변 생성"""
        try:
            # 노트북 LLM 또는 기타 LLM 서비스 시도
            from api.intelligent_answer_generator import intelligent_answer_generator
            import asyncio
            
            # 컨텍스트를 포함한 프롬프트 구성
            enhanced_prompt = f"""다음은 프로젝트 문서에서 검색한 내용입니다:

{context}

위 문서 내용을 바탕으로 사용자의 질문에 대한 답변을 생성해주세요.

**질문**: {question}

**답변 요구사항**:
- 문서 내용을 바탕으로 정확한 정보를 제공하세요
- 답변은 자연스럽고 명확하게 작성하세요
- 관련 문서 출처를 자연스럽게 언급하세요
- 문서에 없는 정보는 추가하지 마세요
"""
            
            # LLM으로 답변 생성 (비동기 함수를 동기적으로 호출)
            analysis = intelligent_answer_generator.analyze_request(enhanced_prompt, None)
            
            # 기존 이벤트 루프가 있으면 사용, 없으면 새로 생성
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    # 이미 실행 중인 루프가 있으면 동기 호출 불가
                    # 이 경우는 템플릿 기반 답변을 사용
                    logger.debug("실행 중인 이벤트 루프 감지, LLM 호출 대신 템플릿 사용")
                    return None
                else:
                    # 루프가 있지만 실행 중이 아니면 사용
                    answer = loop.run_until_complete(
                        intelligent_answer_generator.generate_answer(
                            enhanced_prompt, analysis, "enhanced", None
                        )
                    )
            except RuntimeError:
                # 이벤트 루프가 없으면 새로 생성
                try:
                    answer = asyncio.run(
                        intelligent_answer_generator.generate_answer(
                            enhanced_prompt, analysis, "enhanced", None
                        )
                    )
                except RuntimeError as e:
                    # 중첩된 이벤트 루프 오류 등
                    logger.debug(f"이벤트 루프 생성 실패: {e}")
                    return None
            
            if answer and len(answer.strip()) > 50:
                # 출처 정보 추가
                sources_text = "\n\n**📚 참고 문서:**\n"
                for result in search_results[:3]:
                    file_name = result.get('relative_path', result.get('metadata', {}).get('file_name', ''))
                    sources_text += f"- `{file_name}`\n"
                return answer + sources_text
            
        except RuntimeError as e:
            # 이벤트 루프 관련 오류는 조용히 무시 (템플릿 사용)
            logger.debug(f"이벤트 루프 오류, 템플릿 사용: {e}")
        except Exception as e:
            logger.debug(f"LLM 통합 실패, 템플릿 사용: {e}")
        
        return None
    
    def _generate_template_answer(self, question: str, context: str, search_results: List[Dict]) -> str:
        """템플릿 기반 답변 생성"""
        # 가장 관련성 높은 섹션 추출
        top_sections = []
        for result in search_results[:2]:
            for section in result.get('matched_sections', [])[:2]:
                if section['content']:
                    top_sections.append({
                        'title': section['title'],
                        'content': section['content'][:1000],  # 길이 제한
                        'file': result['relative_path']
                    })
        
        if not top_sections:
            return "관련 내용을 찾았지만 구조화된 답변을 생성할 수 없습니다."
        
        # 답변 구성
        answer_parts = []
        
        # 질문에 대한 직접적인 답변 시도
        answer_parts.append(f"질문하신 '{question}'에 대해 프로젝트 문서에서 다음과 같은 정보를 찾았습니다:\n\n")
        
        # 각 섹션별 답변
        for i, section in enumerate(top_sections, 1):
            answer_parts.append(f"### {section['title']}\n")
            answer_parts.append(section['content'])
            
            # 파일 출처 표시 (첫 번째 섹션에만)
            if i == 1:
                answer_parts.append(f"\n\n*출처: {section['file']}*")
            
            if i < len(top_sections):
                answer_parts.append("\n\n---\n\n")
        
        # 추가 관련 정보가 있는 경우
        if len(search_results) > 2:
            answer_parts.append(f"\n\n*참고: 총 {len(search_results)}개의 관련 문서를 찾았습니다. 더 자세한 정보가 필요하시면 구체적으로 질문해주세요.*")
        
        return ''.join(answer_parts)
    
    def is_md_related_question(self, question: str) -> bool:
        """
        질문이 이 프로젝트의 MD 문서 관련 질문인지 판단
        
        주의: 일반적인 프로그래밍 질문이나 설명 요청은 MD 문서가 아닌 
              AI 응답으로 처리해야 합니다.
        """
        question_lower = question.lower()
        
        # 이 프로젝트 문서 관련 구체적 키워드 (엄격하게 제한)
        project_specific_keywords = [
            'corbu', 'kakao-frontend', 'unified_chat_api', 
            '이 프로젝트', '이 시스템', '현재 프로젝트',
            'readme', 'integrated_api', 'api 문서'
        ]
        
        # 프로젝트 특정 키워드가 있으면 MD 관련
        if any(keyword in question_lower for keyword in project_specific_keywords):
            return True
        
        # API 엔드포인트 직접 질문
        if '/api/' in question_lower or 'api 엔드포인트' in question_lower:
            return True
        
        # 일반적인 프로그래밍 질문은 MD 관련이 아님
        general_programming_keywords = [
            'python', 'javascript', 'react', 'java', 'c++', 'go', 'rust',
            '코드', '프로그래밍', '개발', '웹 크롤러', '웹 스크래핑',
            '알고리즘', '데이터 구조', '함수', '클래스',
            '만들어', '작성해', '설명해', '알려줘', '가르쳐'
        ]
        
        # 일반 프로그래밍 키워드가 있으면 MD 관련 아님
        if any(keyword in question_lower for keyword in general_programming_keywords):
            return False
        
        # 그 외에는 MD 관련 아님 (기본값)
        return False


# 전역 인스턴스
_md_qa_generator: Optional[MDQAGenerator] = None


def get_md_qa_generator() -> MDQAGenerator:
    """MD QA 생성기 싱글톤 인스턴스"""
    global _md_qa_generator
    if _md_qa_generator is None:
        _md_qa_generator = MDQAGenerator()
    return _md_qa_generator
