import os
import re
import shutil
import requests
from pathlib import Path
from typing import Dict, List, Any, Optional
from urllib.parse import urlparse
import logging
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class FileClassifier:
    """파일 자동 분류 및 링크 추출기"""
    
    def __init__(self, chat_room_path: str):
        self.chat_room_path = Path(chat_room_path)
        self.setup_folders()
    
    def setup_folders(self):
        """필요한 폴더 구조 생성"""
        folders = [
            "미디어/동영상",
            "미디어/음성", 
            "이미지/사진",
            "이미지/스크린샷",
            "문서/PDF",
            "문서/Word",
            "문서/Excel",
            "링크"
        ]
        
        for folder in folders:
            folder_path = self.chat_room_path / folder
            folder_path.mkdir(parents=True, exist_ok=True)
    
    def classify_files(self, source_path: str):
        """파일들을 자동으로 분류"""
        source = Path(source_path)
        if not source.exists():
            raise FileNotFoundError(f"소스 경로를 찾을 수 없습니다: {source_path}")
        
        # 파일 확장자별 분류 규칙
        classification_rules = {
            # 동영상 파일
            'video': {
                'extensions': ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm'],
                'target_folder': '미디어/동영상'
            },
            # 음성 파일
            'audio': {
                'extensions': ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'],
                'target_folder': '미디어/음성'
            },
            # 이미지 파일
            'image': {
                'extensions': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'],
                'target_folder': '이미지/사진'
            },
            # PDF 문서
            'pdf': {
                'extensions': ['.pdf'],
                'target_folder': '문서/PDF'
            },
            # Word 문서
            'word': {
                'extensions': ['.doc', '.docx'],
                'target_folder': '문서/Word'
            },
            # Excel 파일
            'excel': {
                'extensions': ['.xls', '.xlsx', '.csv'],
                'target_folder': '문서/Excel'
            }
        }
        
        moved_files = []
        for file_path in source.rglob('*'):
            if file_path.is_file():
                try:
                    # 파일 분류
                    target_folder = self.get_target_folder(file_path, classification_rules)
                    if target_folder:
                        new_path = self.chat_room_path / target_folder / file_path.name
                        shutil.move(str(file_path), str(new_path))
                        moved_files.append({
                            'original': str(file_path),
                            'new_location': str(new_path),
                            'category': target_folder
                        })
                        logger.info(f"파일 이동: {file_path.name} -> {target_folder}")
                except Exception as e:
                    logger.error(f"파일 이동 실패 {file_path}: {e}")
        
        return moved_files
    
    def get_target_folder(self, file_path: Path, rules: Dict) -> Optional[str]:
        """파일 확장자에 따라 대상 폴더 결정"""
        extension = file_path.suffix.lower()
        
        for category, rule in rules.items():
            if extension in rule['extensions']:
                return rule['target_folder']
        
        return None
    
    def extract_links_from_chat(self, chat_file_path: str) -> List[Dict[str, Any]]:
        """대화 파일에서 링크 추출"""
        links = []
        
        with open(chat_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 카카오톡 대화 형식에서 링크 추출
        # 형식: [날짜] [시간] [발언자] : [메시지]
        pattern = r'\[([^\]]+)\] \[([^\]]+)\] ([^:]+) : (.+)'
        
        for line in content.split('\n'):
            if not line.strip():
                continue
            
            match = re.match(pattern, line)
            if match:
                date_str, time_str, speaker, message = match.groups()
                
                # 메시지에서 링크 추출
                message_links = self.extract_links_from_text(message)
                
                for link in message_links:
                    links.append({
                        'date': date_str,
                        'time': time_str,
                        'speaker': speaker.strip(),
                        'message': message.strip(),
                        'link': link,
                        'link_type': self.classify_link(link),
                        'timestamp': self.parse_datetime(f"{date_str} {time_str}")
                    })
        
        return links
    
    def extract_links_from_text(self, text: str) -> List[str]:
        """텍스트에서 링크 추출"""
        # 다양한 링크 패턴
        link_patterns = [
            r'https?://[^\s]+',  # HTTP/HTTPS 링크
            r'www\.[^\s]+',      # www로 시작하는 링크
            r'\[링크\]([^\]]+)',  # 카카오톡 링크 형식
            r'\[URL\]([^\]]+)',   # URL 형식
            r'bit\.ly/[^\s]+',    # 단축 링크
            r't\.co/[^\s]+',      # 트위터 단축 링크
        ]
        
        links = []
        for pattern in link_patterns:
            matches = re.findall(pattern, text)
            links.extend(matches)
        
        return links
    
    def classify_link(self, url: str) -> str:
        """링크 타입 분류"""
        url_lower = url.lower()
        
        if any(domain in url_lower for domain in ['youtube.com', 'youtu.be']):
            return 'youtube'
        elif any(domain in url_lower for domain in ['naver.com', 'blog.naver.com']):
            return 'naver'
        elif any(domain in url_lower for domain in ['daum.net', 'cafe.daum.net']):
            return 'daum'
        elif any(domain in url_lower for domain in ['google.com', 'docs.google.com']):
            return 'google'
        elif any(domain in url_lower for domain in ['facebook.com', 'fb.com']):
            return 'facebook'
        elif any(domain in url_lower for domain in ['instagram.com', 'ig.com']):
            return 'instagram'
        elif any(domain in url_lower for domain in ['twitter.com', 't.co', 'x.com']):
            return 'twitter'
        elif any(domain in url_lower for domain in ['kakao.com', 'kakao.co.kr']):
            return 'kakao'
        else:
            return 'other'
    
    def parse_datetime(self, datetime_str: str) -> Optional[datetime]:
        """날짜시간 문자열 파싱"""
        try:
            # "2025년 7월 15일 12:40" 형식
            return datetime.strptime(datetime_str, "%Y년 %m월 %d일 %H:%M")
        except ValueError:
            try:
                # "2025. 7. 15. 12:40" 형식
                return datetime.strptime(datetime_str, "%Y. %m. %d. %H:%M")
            except ValueError:
                return None
    
    def analyze_link_content(self, url: str) -> Dict[str, Any]:
        """링크 내용 분석"""
        try:
            response = requests.get(url, timeout=10)
            content = response.text
            
            # 기본 정보 추출
            title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
            title = title_match.group(1) if title_match else "제목 없음"
            
            # 메타 설명 추출
            desc_match = re.search(r'<meta name="description" content="(.*?)"', content, re.IGNORECASE)
            description = desc_match.group(1) if desc_match else ""
            
            # 키워드 추출
            keywords_match = re.search(r'<meta name="keywords" content="(.*?)"', content, re.IGNORECASE)
            keywords = keywords_match.group(1).split(',') if keywords_match else []
            
            return {
                'url': url,
                'title': title,
                'description': description,
                'keywords': keywords,
                'status_code': response.status_code,
                'content_length': len(content)
            }
        except Exception as e:
            logger.error(f"링크 분석 실패 {url}: {e}")
            return {
                'url': url,
                'title': "분석 실패",
                'description': str(e),
                'keywords': [],
                'status_code': 0,
                'content_length': 0
            }
    
    def save_links_analysis(self, links: List[Dict[str, Any]], output_file: str):
        """링크 분석 결과 저장"""
        analysis_results = []
        
        for link_data in links:
            # 링크 내용 분석
            content_analysis = self.analyze_link_content(link_data['link'])
            
            analysis_results.append({
                **link_data,
                'content_analysis': content_analysis
            })
        
        # JSON 파일로 저장
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(analysis_results, f, ensure_ascii=False, indent=2, default=str)
        
        return analysis_results
    
    def create_link_summary(self, links: List[Dict[str, Any]]) -> Dict[str, Any]:
        """링크 요약 생성"""
        if not links:
            return {}
        
        # 링크 타입별 통계
        link_types = {}
        speakers = {}
        domains = {}
        
        for link in links:
            # 링크 타입 통계
            link_type = link['link_type']
            link_types[link_type] = link_types.get(link_type, 0) + 1
            
            # 발언자별 통계
            speaker = link['speaker']
            speakers[speaker] = speakers.get(speaker, 0) + 1
            
            # 도메인별 통계
            try:
                domain = urlparse(link['link']).netloc
                domains[domain] = domains.get(domain, 0) + 1
            except:
                pass
        
        return {
            'total_links': len(links),
            'link_types': link_types,
            'speakers': speakers,
            'domains': domains,
            'date_range': {
                'start': min(link['timestamp'] for link in links if link['timestamp']),
                'end': max(link['timestamp'] for link in links if link['timestamp'])
            } if any(link['timestamp'] for link in links) else None
        }

# 전역 인스턴스 생성 함수
def create_file_classifier(chat_room_path: str) -> FileClassifier:
    return FileClassifier(chat_room_path)
