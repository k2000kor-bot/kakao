import re
import json
from datetime import datetime
from typing import Dict, List, Any, Optional
from collections import defaultdict, Counter
import logging

logger = logging.getLogger(__name__)

class EnhancedConversationAnalyzer:
    """향상된 카카오톡 대화 분석기"""
    
    def __init__(self):
        self.conversation_patterns = {}
        self.user_profiles = {}
        self.topic_transitions = []
        self.emotion_patterns = {}
        self.response_patterns = {}
        self.real_estate_keywords = {
            '재개발', '재건축', '분양', '아파트', '단지', '보상금', '이주비', '분담금',
            '고급화', '시설', '수영장', '체육관', '주차장', '상가', '상권', '교통',
            '학교', '병원', '공원', '환경', '투자', '수익', '가격', '시세', '매매',
            '임대', '관리비', '청약', '당첨', '미당첨', '서류', '계약', '법적',
            '행정', '정부', '지자체', '민원', '반대', '찬성', '투표', '총회'
        }
        
        self.community_keywords = {
            '이웃', '주민', '동네', '커뮤니티', '단체', '모임', '회의', '소통',
            '친목', '도움', '협력', '연대', '단결', '화합', '갈등', '분쟁',
            '의견', '제안', '건의', '불만', '민원', '해결', '개선', '발전'
        }
        
        self.emotion_indicators = {
            '긍정': ['좋다', '좋은', '좋아', '감사', '고맙', '행복', '기쁘', '만족', '성공', '축하'],
            '부정': ['나쁘', '안좋', '싫', '화나', '짜증', '불만', '실망', '걱정', '걱정', '걱정'],
            '중립': ['그렇', '알겠', '네', '예', '아니', '모르', '생각', '같', '보'],
            '강조': ['정말', '진짜', '완전', '너무', '매우', '엄청', '대박', '최고', '최악'],
            '의문': ['왜', '어떻게', '언제', '어디', '뭐', '무엇', '어떤', '얼마', '몇']
        }
    
    def analyze_chat_file(self, file_path: str) -> Dict[str, Any]:
        """카카오톡 대화 파일을 분석"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            messages = self._parse_messages(content)
            
            if not messages:
                logger.warning(f"파싱된 메시지가 없습니다: {file_path}")
                return self._empty_analysis_result()
            
            analysis_result = {
                'file_path': file_path,
                'total_messages': len(messages),
                'participants': self._analyze_participants(messages),
                'conversation_patterns': self._analyze_conversation_patterns(messages),
                'topic_analysis': self._analyze_topics(messages),
                'emotion_analysis': self._analyze_emotions(messages),
                'response_patterns': self._analyze_response_patterns(messages),
                'real_estate_patterns': self._analyze_real_estate_patterns(messages),
                'community_patterns': self._analyze_community_patterns(messages),
                'communication_style': self._analyze_communication_style(messages),
                'temporal_patterns': self._analyze_temporal_patterns(messages),
                'keyword_frequency': self._analyze_keyword_frequency(messages),
                'interaction_network': self._analyze_interaction_network(messages)
            }
            
            logger.info(f"대화 분석 완료: {len(messages)}개 메시지, {len(analysis_result['participants'])}명 참여자")
            return analysis_result
            
        except Exception as e:
            logger.error(f"대화 파일 분석 오류: {e}")
            return self._empty_analysis_result()
    
    def _parse_messages(self, content: str) -> List[Dict[str, Any]]:
        """카카오톡 대화 형식 파싱"""
        messages = []
        lines = content.split('\n')
        
        current_date = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # 날짜 라인 확인
            if re.match(r'^\d{4}년 \d{1,2}월 \d{1,2}일', line):
                current_date = line
                continue
            
            # 메시지 라인 파싱 (카카오톡 형식)
            message_match = re.match(r'^(\d{4}년 \d{1,2}월 \d{1,2}일 오[전후] \d{1,2}:\d{2}), (.+?) : (.+)$', line)
            if message_match:
                full_time, user_id, message_content = message_match.groups()
                # 시간만 추출
                time_match = re.search(r'(\d{1,2}:\d{2})$', full_time)
                time = time_match.group(1) if time_match else full_time
                
                # 다음 라인들도 같은 메시지의 일부인지 확인
                current_idx = lines.index(line)
                next_line_idx = current_idx + 1
                while next_line_idx < len(lines):
                    next_line = lines[next_line_idx].strip()
                    if not next_line:
                        next_line_idx += 1
                        continue
                    # 새로운 메시지인지 확인
                    if re.match(r'^\d{4}년 \d{1,2}월 \d{1,2}일 오[전후] \d{1,2}:\d{2},', next_line):
                        break
                    # 같은 메시지의 연속
                    message_content += '\n' + next_line
                    next_line_idx += 1
                
                # 특수 메시지 처리
                if message_content in ['삭제된 메시지입니다.', '<사진 읽지 않음>']:
                    message_type = 'deleted' if message_content == '삭제된 메시지입니다.' else 'photo'
                else:
                    message_type = self._analyze_message_type(message_content)
                
                messages.append({
                    'timestamp': full_time,
                    'user_id': user_id,
                    'content': message_content,
                    'type': message_type,
                    'date': full_time.split(',')[0],
                    'time': time
                })
            else:
                # 디버깅을 위한 로그
                if line and not line.startswith('[') and not line.startswith('저장한 날짜'):
                    logger.debug(f"파싱되지 않은 라인: {line[:50]}...")
        
        logger.info(f"총 {len(messages)}개 메시지 파싱 완료")
        return messages
    
    def _analyze_message_type(self, content: str) -> str:
        """메시지 타입 분석"""
        # 이모티콘 확인
        if re.search(r'[😀-🙏🌀-🗿]', content):
            return 'emoticon'
        
        # 감정 표현 확인
        emotion_words = ['ㅋㅋ', 'ㅎㅎ', 'ㅠㅠ', 'ㅜㅜ', '^^', 'ㅡㅡ', 'ㅇㅇ', 'ㄴㄴ']
        if any(word in content for word in emotion_words):
            return 'emotional'
        
        # 질문 확인
        if '?' in content or any(word in content for word in ['어떻게', '왜', '언제', '어디', '뭐']):
            return 'question'
        
        # 동의/부정 확인
        if any(word in content for word in ['네', '예', '맞아', '그래', '좋아']):
            return 'agreement'
        if any(word in content for word in ['아니', '아닌', '틀렸', '그렇지 않']):
            return 'disagreement'
        
        # 부동산 관련 확인
        if any(keyword in content for keyword in self.real_estate_keywords):
            return 'real_estate'
        
        # 커뮤니티 관련 확인
        if any(keyword in content for keyword in self.community_keywords):
            return 'community'
        
        return 'general'
    
    def _analyze_participants(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """참여자 분석"""
        participants = defaultdict(lambda: {
            'message_count': 0,
            'total_length': 0,
            'avg_length': 0,
            'common_words': Counter(),
            'emotion_indicators': Counter(),
            'question_count': 0,
            'agreement_count': 0,
            'disagreement_count': 0,
            'response_style': Counter(),
            'active_hours': Counter(),
            'message_types': Counter()
        })
        
        for msg in messages:
            user_id = msg['user_id']
            content = msg['content']
            msg_type = msg['type']
            
            participants[user_id]['message_count'] += 1
            participants[user_id]['total_length'] += len(content)
            participants[user_id]['message_types'][msg_type] += 1
            
            # 시간대 분석
            if 'time' in msg:
                hour = int(msg['time'].split(':')[0])
                participants[user_id]['active_hours'][hour] += 1
            
            # 단어 분석
            words = re.findall(r'\w+', content)
            participants[user_id]['common_words'].update(words)
            
            # 감정 지표 분석
            for emotion, indicators in self.emotion_indicators.items():
                for indicator in indicators:
                    if indicator in content:
                        participants[user_id]['emotion_indicators'][emotion] += 1
            
            # 응답 스타일 분석
            if msg_type in ['question', 'agreement', 'disagreement', 'emotional']:
                participants[user_id]['response_style'][msg_type] += 1
            
            if msg_type == 'question':
                participants[user_id]['question_count'] += 1
            elif msg_type == 'agreement':
                participants[user_id]['agreement_count'] += 1
            elif msg_type == 'disagreement':
                participants[user_id]['disagreement_count'] += 1
        
        # 평균 길이 계산
        for user_id, data in participants.items():
            if data['message_count'] > 0:
                data['avg_length'] = data['total_length'] / data['message_count']
        
        return dict(participants)
    
    def _analyze_conversation_patterns(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """대화 패턴 분석"""
        patterns = {
            'turn_taking': [],
            'response_delays': [],
            'conversation_flow': [],
            'topic_continuity': [],
            'interruption_patterns': []
        }
        
        for i in range(len(messages) - 1):
            current_msg = messages[i]
            next_msg = messages[i + 1]
            
            # 화자 전환 패턴
            if current_msg['user_id'] != next_msg['user_id']:
                patterns['turn_taking'].append({
                    'from': current_msg['user_id'],
                    'to': next_msg['user_id'],
                    'topic': self._extract_topic(current_msg['content'])
                })
            
            # 응답 지연 분석
            if 'time' in current_msg and 'time' in next_msg:
                delay = self._calculate_time_delay(current_msg['time'], next_msg['time'])
                patterns['response_delays'].append(delay)
        
        return patterns
    
    def _analyze_topics(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """주제 분석"""
        topics = {
            'real_estate': [],
            'community': [],
            'daily_life': [],
            'politics': [],
            'other': []
        }
        
        for msg in messages:
            content = msg['content']
            topic = self._categorize_topic(content)
            topics[topic].append({
                'user_id': msg['user_id'],
                'content': content,
                'timestamp': msg['timestamp']
            })
        
        return topics
    
    def _categorize_topic(self, content: str) -> str:
        """주제 분류"""
        if any(keyword in content for keyword in self.real_estate_keywords):
            return 'real_estate'
        elif any(keyword in content for keyword in self.community_keywords):
            return 'community'
        elif any(word in content for word in ['정치', '정부', '선거', '투표', '민주']):
            return 'politics'
        elif any(word in content for word in ['일상', '날씨', '음식', '취미', '가족']):
            return 'daily_life'
        else:
            return 'other'
    
    def _analyze_emotions(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """감정 분석"""
        emotions = {
            'overall_sentiment': Counter(),
            'emotion_by_user': defaultdict(Counter),
            'emotion_by_topic': defaultdict(Counter),
            'emotion_timeline': []
        }
        
        for msg in messages:
            content = msg['content']
            user_id = msg['user_id']
            
            # 감정 분석
            detected_emotions = self._detect_emotions(content)
            
            for emotion in detected_emotions:
                emotions['overall_sentiment'][emotion] += 1
                emotions['emotion_by_user'][user_id][emotion] += 1
                
                # 주제별 감정
                topic = self._categorize_topic(content)
                emotions['emotion_by_topic'][topic][emotion] += 1
            
            emotions['emotion_timeline'].append({
                'timestamp': msg['timestamp'],
                'user_id': user_id,
                'emotions': detected_emotions,
                'content': content
            })
        
        return emotions
    
    def _detect_emotions(self, content: str) -> List[str]:
        """감정 감지"""
        emotions = []
        
        for emotion, indicators in self.emotion_indicators.items():
            for indicator in indicators:
                if indicator in content:
                    emotions.append(emotion)
                    break
        
        return emotions if emotions else ['중립']
    
    def _analyze_response_patterns(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """응답 패턴 분석"""
        patterns = {
            'question_response': [],
            'agreement_response': [],
            'disagreement_response': [],
            'emotional_response': [],
            'topic_switching': []
        }
        
        for i in range(len(messages) - 1):
            current_msg = messages[i]
            next_msg = messages[i + 1]
            
            if current_msg['type'] == 'question' and current_msg['user_id'] != next_msg['user_id']:
                patterns['question_response'].append({
                    'question': current_msg['content'],
                    'response': next_msg['content'],
                    'responder': next_msg['user_id']
                })
            
            elif current_msg['type'] == 'agreement' and current_msg['user_id'] != next_msg['user_id']:
                patterns['agreement_response'].append({
                    'agreement': current_msg['content'],
                    'response': next_msg['content'],
                    'responder': next_msg['user_id']
                })
        
        return patterns
    
    def _analyze_real_estate_patterns(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """부동산 관련 패턴 분석"""
        patterns = {
            'keywords_frequency': Counter(),
            'user_interest': defaultdict(Counter),
            'sentiment_analysis': Counter(),
            'topic_evolution': []
        }
        
        for msg in messages:
            if msg['type'] == 'real_estate':
                content = msg['content']
                
                # 키워드 빈도
                for keyword in self.real_estate_keywords:
                    if keyword in content:
                        patterns['keywords_frequency'][keyword] += 1
                        patterns['user_interest'][msg['user_id']][keyword] += 1
                
                # 감정 분석
                emotions = self._detect_emotions(content)
                for emotion in emotions:
                    patterns['sentiment_analysis'][emotion] += 1
                
                patterns['topic_evolution'].append({
                    'timestamp': msg['timestamp'],
                    'user_id': msg['user_id'],
                    'content': content,
                    'emotions': emotions
                })
        
        return patterns
    
    def _analyze_community_patterns(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """커뮤니티 관련 패턴 분석"""
        patterns = {
            'keywords_frequency': Counter(),
            'user_engagement': defaultdict(Counter),
            'collaboration_patterns': [],
            'conflict_patterns': []
        }
        
        for msg in messages:
            if msg['type'] == 'community':
                content = msg['content']
                
                # 키워드 빈도
                for keyword in self.community_keywords:
                    if keyword in content:
                        patterns['keywords_frequency'][keyword] += 1
                        patterns['user_engagement'][msg['user_id']][keyword] += 1
                
                # 협력/갈등 패턴
                if any(word in content for word in ['협력', '도움', '연대', '단결']):
                    patterns['collaboration_patterns'].append({
                        'user_id': msg['user_id'],
                        'content': content,
                        'timestamp': msg['timestamp']
                    })
                elif any(word in content for word in ['갈등', '분쟁', '반대', '불만']):
                    patterns['conflict_patterns'].append({
                        'user_id': msg['user_id'],
                        'content': content,
                        'timestamp': msg['timestamp']
                    })
        
        return patterns
    
    def _analyze_communication_style(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """의사소통 스타일 분석"""
        styles = {
            'formality_level': Counter(),
            'response_speed': defaultdict(list),
            'engagement_level': defaultdict(Counter),
            'conversation_initiation': Counter()
        }
        
        for i, msg in enumerate(messages):
            content = msg['content']
            user_id = msg['user_id']
            
            # 격식 수준
            if any(word in content for word in ['습니다', '니다', '습니다']):
                styles['formality_level']['formal'] += 1
            elif any(word in content for word in ['ㅋㅋ', 'ㅎㅎ', '^^']):
                styles['formality_level']['casual'] += 1
            else:
                styles['formality_level']['neutral'] += 1
            
            # 참여도
            if msg['type'] in ['question', 'agreement', 'disagreement']:
                styles['engagement_level'][user_id]['high'] += 1
            else:
                styles['engagement_level'][user_id]['normal'] += 1
            
            # 대화 시작
            if i == 0 or (i > 0 and messages[i-1]['user_id'] != user_id):
                styles['conversation_initiation'][user_id] += 1
        
        return styles
    
    def _analyze_temporal_patterns(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """시간적 패턴 분석"""
        patterns = {
            'hourly_activity': Counter(),
            'daily_activity': Counter(),
            'conversation_duration': [],
            'peak_activity_hours': []
        }
        
        for msg in messages:
            if 'time' in msg:
                hour = int(msg['time'].split(':')[0])
                patterns['hourly_activity'][hour] += 1
        
        # 피크 활동 시간
        if patterns['hourly_activity']:
            max_activity = max(patterns['hourly_activity'].values())
            patterns['peak_activity_hours'] = [
                hour for hour, count in patterns['hourly_activity'].items()
                if count >= max_activity * 0.8
            ]
        
        return patterns
    
    def _analyze_keyword_frequency(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """키워드 빈도 분석"""
        keyword_analysis = {
            'overall_keywords': Counter(),
            'user_specific_keywords': defaultdict(Counter),
            'topic_keywords': defaultdict(Counter),
            'trending_keywords': []
        }
        
        for msg in messages:
            content = msg['content']
            user_id = msg['user_id']
            
            # 전체 키워드
            words = re.findall(r'\w+', content)
            keyword_analysis['overall_keywords'].update(words)
            keyword_analysis['user_specific_keywords'][user_id].update(words)
            
            # 주제별 키워드
            topic = self._categorize_topic(content)
            keyword_analysis['topic_keywords'][topic].update(words)
        
        return keyword_analysis
    
    def _analyze_interaction_network(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """상호작용 네트워크 분석"""
        network = {
            'user_interactions': defaultdict(Counter),
            'response_network': defaultdict(list),
            'influence_scores': defaultdict(float)
        }
        
        for i in range(len(messages) - 1):
            current_user = messages[i]['user_id']
            next_user = messages[i + 1]['user_id']
            
            if current_user != next_user:
                network['user_interactions'][current_user][next_user] += 1
                network['response_network'][current_user].append({
                    'responder': next_user,
                    'response_type': messages[i + 1]['type'],
                    'timestamp': messages[i + 1]['timestamp']
                })
        
        return network
    
    def _extract_topic(self, content: str) -> str:
        """주제 추출"""
        if any(keyword in content for keyword in self.real_estate_keywords):
            return 'real_estate'
        elif any(keyword in content for keyword in self.community_keywords):
            return 'community'
        else:
            return 'general'
    
    def _calculate_time_delay(self, time1: str, time2: str) -> int:
        """시간 지연 계산 (분 단위)"""
        try:
            t1 = datetime.strptime(time1, '%H:%M')
            t2 = datetime.strptime(time2, '%H:%M')
            return int((t2 - t1).total_seconds() / 60)
        except:
            return 0
    
    def _empty_analysis_result(self) -> Dict[str, Any]:
        """빈 분석 결과 반환"""
        return {
            'file_path': '',
            'total_messages': 0,
            'participants': {},
            'conversation_patterns': {},
            'topic_analysis': {},
            'emotion_analysis': {},
            'response_patterns': {},
            'real_estate_patterns': {},
            'community_patterns': {},
            'communication_style': {},
            'temporal_patterns': {},
            'keyword_frequency': {},
            'interaction_network': {}
        }
    
    def generate_insights(self, analysis_result: Dict[str, Any]) -> List[str]:
        """분석 결과에서 인사이트 생성"""
        insights = []
        
        # 참여자 분석 인사이트
        participants = analysis_result.get('participants', {})
        if participants:
            most_active = max(participants.items(), key=lambda x: x[1]['message_count'])
            insights.append(f"가장 활발한 참여자: {most_active[0]} ({most_active[1]['message_count']}개 메시지)")
        
        # 주제 분석 인사이트
        topic_analysis = analysis_result.get('topic_analysis', {})
        if topic_analysis:
            real_estate_count = len(topic_analysis.get('real_estate', []))
            community_count = len(topic_analysis.get('community', []))
            insights.append(f"부동산 관련 대화: {real_estate_count}개, 커뮤니티 관련: {community_count}개")
        
        # 감정 분석 인사이트
        emotion_analysis = analysis_result.get('emotion_analysis', {})
        if emotion_analysis:
            overall_sentiment = emotion_analysis.get('overall_sentiment', {})
            if overall_sentiment:
                dominant_emotion = max(overall_sentiment.items(), key=lambda x: x[1])
                insights.append(f"주요 감정: {dominant_emotion[0]} ({dominant_emotion[1]}회)")
        
        return insights 