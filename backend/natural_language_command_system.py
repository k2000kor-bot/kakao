"""
Natural Language Command Processing System
자연어 명령 처리 시스템

Features:
- Voice command recognition and processing
- Intent-based action execution
- Smart automation and workflow management
- Context-aware command interpretation
- Multi-modal command input (text, voice)
- Command learning and adaptation
- Safety and permission management
"""

import os
import json
import re
import sqlite3
import asyncio
import subprocess
from typing import Dict, List, Optional, Any, Callable, Tuple
from dataclasses import dataclass, asdict, field
from datetime import datetime
from enum import Enum
import logging
from pathlib import Path

# Speech and audio processing
import speech_recognition as sr
import pyttsx3
from pydub import AudioSegment
import pyaudio
import wave

# NLP and ML
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch

# Korean NLP
from konlpy.tag import Okt, Mecab
import kss

# System integration
import psutil
import webbrowser
import smtplib
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart

# FastAPI and async
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CommandType(Enum):
    """Types of commands"""
    SYSTEM = "system"
    APPLICATION = "application"
    FILE_OPERATION = "file_operation"
    WEB_SEARCH = "web_search"
    EMAIL = "email"
    REMINDER = "reminder"
    AUTOMATION = "automation"
    ANALYSIS = "analysis"
    CONVERSATION = "conversation"

class ActionResult(Enum):
    """Action execution results"""
    SUCCESS = "success"
    FAILED = "failed"
    PERMISSION_DENIED = "permission_denied"
    NOT_FOUND = "not_found"
    INVALID_PARAMS = "invalid_params"

class ConfidenceLevel(Enum):
    """Confidence levels for command interpretation"""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

@dataclass
class ParsedCommand:
    """Parsed natural language command"""
    original_text: str
    command_type: CommandType
    action: str
    parameters: Dict[str, Any]
    confidence: ConfidenceLevel
    intent: str
    entities: List[Dict[str, str]] = field(default_factory=list)
    alternatives: List[str] = field(default_factory=list)

@dataclass
class CommandExecutionResult:
    """Result of command execution"""
    command_id: str
    success: bool
    result: ActionResult
    output: str
    error_message: Optional[str] = None
    execution_time: float = 0.0
    side_effects: List[str] = field(default_factory=list)

@dataclass
class VoiceCommand:
    """Voice command with audio data"""
    audio_data: bytes
    transcribed_text: str
    confidence: float
    language: str = "ko-KR"
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class CommandPattern:
    """Command pattern for recognition"""
    id: str
    pattern: str
    command_type: CommandType
    action: str
    parameters: Dict[str, str]
    examples: List[str] = field(default_factory=list)
    enabled: bool = True

class VoiceProcessor:
    """Voice recognition and synthesis"""
    
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        self.tts_engine = pyttsx3.init()
        self._configure_tts()
        self._calibrate_microphone()
    
    def _configure_tts(self):
        """Configure text-to-speech engine"""
        try:
            # Set properties for Korean TTS
            voices = self.tts_engine.getProperty('voices')
            korean_voice = None
            
            for voice in voices:
                if 'korean' in voice.name.lower() or 'ko' in voice.id.lower():
                    korean_voice = voice.id
                    break
            
            if korean_voice:
                self.tts_engine.setProperty('voice', korean_voice)
            
            self.tts_engine.setProperty('rate', 150)  # Speech rate
            self.tts_engine.setProperty('volume', 0.8)  # Volume level
            
            logger.info("TTS engine configured successfully")
        except Exception as e:
            logger.error(f"Error configuring TTS: {e}")
    
    def _calibrate_microphone(self):
        """Calibrate microphone for ambient noise"""
        try:
            with self.microphone as source:
                logger.info("Calibrating microphone for ambient noise...")
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
                logger.info("Microphone calibration completed")
        except Exception as e:
            logger.error(f"Error calibrating microphone: {e}")
    
    async def listen_for_command(self, timeout: float = 5.0, phrase_timeout: float = 1.0) -> Optional[VoiceCommand]:
        """Listen for voice command"""
        try:
            logger.info("Listening for voice command...")
            
            with self.microphone as source:
                # Listen for audio
                audio = self.recognizer.listen(source, timeout=timeout, phrase_time_limit=phrase_timeout)
            
            # Convert audio to bytes
            audio_data = audio.get_wav_data()
            
            # Transcribe using Google Speech Recognition
            try:
                # Try Korean first
                text = self.recognizer.recognize_google(audio, language='ko-KR')
                confidence = 0.8  # Default confidence for Google API
                
                return VoiceCommand(
                    audio_data=audio_data,
                    transcribed_text=text,
                    confidence=confidence,
                    language='ko-KR'
                )
                
            except sr.UnknownValueError:
                # Try English as fallback
                try:
                    text = self.recognizer.recognize_google(audio, language='en-US')
                    confidence = 0.7
                    
                    return VoiceCommand(
                        audio_data=audio_data,
                        transcribed_text=text,
                        confidence=confidence,
                        language='en-US'
                    )
                except sr.UnknownValueError:
                    logger.warning("Could not understand audio")
                    return None
                    
        except sr.WaitTimeoutError:
            logger.info("No speech detected within timeout")
            return None
        except Exception as e:
            logger.error(f"Error during voice recognition: {e}")
            return None
    
    def speak(self, text: str):
        """Convert text to speech"""
        try:
            self.tts_engine.say(text)
            self.tts_engine.runAndWait()
        except Exception as e:
            logger.error(f"Error in text-to-speech: {e}")

class CommandParser:
    """Parse natural language commands into structured format"""
    
    def __init__(self):
        self.korean_analyzer = Okt()
        self.command_patterns = []
        self.intent_classifier = None
        self._initialize_patterns()
        self._load_intent_classifier()
    
    def _initialize_patterns(self):
        """Initialize command patterns"""
        patterns = [
            # System commands
            CommandPattern(
                id="shutdown_system",
                pattern=r"(컴퓨터|시스템)을?\s*(종료|끄|셧다운)",
                command_type=CommandType.SYSTEM,
                action="shutdown",
                parameters={},
                examples=["컴퓨터 종료해줘", "시스템 셧다운", "컴퓨터 꺼줘"]
            ),
            CommandPattern(
                id="restart_system",
                pattern=r"(컴퓨터|시스템)을?\s*(재시작|리부팅)",
                command_type=CommandType.SYSTEM,
                action="restart",
                parameters={},
                examples=["컴퓨터 재시작해줘", "시스템 리부팅"]
            ),
            
            # Application commands
            CommandPattern(
                id="open_application",
                pattern=r"(.+?)\s*(열어|실행|켜|시작)",
                command_type=CommandType.APPLICATION,
                action="open",
                parameters={"app_name": "\\1"},
                examples=["메모장 열어줘", "브라우저 실행해줘", "카카오톡 켜줘"]
            ),
            CommandPattern(
                id="close_application",
                pattern=r"(.+?)\s*(닫아|종료|끝)",
                command_type=CommandType.APPLICATION,
                action="close",
                parameters={"app_name": "\\1"},
                examples=["메모장 닫아줘", "브라우저 종료해줘"]
            ),
            
            # File operations
            CommandPattern(
                id="create_file",
                pattern=r"(.+?)\s*(파일|문서)을?\s*(만들|생성|작성)",
                command_type=CommandType.FILE_OPERATION,
                action="create",
                parameters={"filename": "\\1"},
                examples=["새 문서 만들어줘", "테스트 파일 생성해줘"]
            ),
            CommandPattern(
                id="delete_file",
                pattern=r"(.+?)\s*(파일|문서)을?\s*(삭제|지워)",
                command_type=CommandType.FILE_OPERATION,
                action="delete",
                parameters={"filename": "\\1"},
                examples=["임시 파일 삭제해줘", "테스트 문서 지워줘"]
            ),
            
            # Web search
            CommandPattern(
                id="web_search",
                pattern=r"(.+?)\s*(검색|찾아|알아봐)",
                command_type=CommandType.WEB_SEARCH,
                action="search",
                parameters={"query": "\\1"},
                examples=["날씨 검색해줘", "파이썬 튜토리얼 찾아줘"]
            ),
            
            # Email
            CommandPattern(
                id="send_email",
                pattern=r"(.+?)에게\s*(.+?)\s*(메일|이메일)\s*(보내|전송)",
                command_type=CommandType.EMAIL,
                action="send",
                parameters={"recipient": "\\1", "subject": "\\2"},
                examples=["김철수에게 회의 메일 보내줘", "팀장님에게 보고서 이메일 전송해줘"]
            ),
            
            # Reminders
            CommandPattern(
                id="set_reminder",
                pattern=r"(.+?)\s*(알림|리마인더)\s*(설정|만들)",
                command_type=CommandType.REMINDER,
                action="set",
                parameters={"content": "\\1"},
                examples=["회의 알림 설정해줘", "약속 리마인더 만들어줘"]
            ),
            
            # Analysis commands
            CommandPattern(
                id="analyze_file",
                pattern=r"(.+?)\s*(분석|해석|요약)",
                command_type=CommandType.ANALYSIS,
                action="analyze",
                parameters={"target": "\\1"},
                examples=["데이터 분석해줘", "문서 요약해줘", "로그 파일 해석해줘"]
            )
        ]
        
        self.command_patterns = patterns
        logger.info(f"Initialized {len(patterns)} command patterns")
    
    def _load_intent_classifier(self):
        """Load intent classification model"""
        try:
            # Try to load a Korean intent classification model
            # This would be replaced with a proper trained model
            self.intent_classifier = pipeline(
                "text-classification",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                return_all_scores=True
            )
            logger.info("Intent classifier loaded successfully")
        except Exception as e:
            logger.error(f"Error loading intent classifier: {e}")
    
    def parse_command(self, text: str) -> ParsedCommand:
        """Parse natural language command"""
        try:
            # Clean and normalize text
            normalized_text = self._normalize_text(text)
            
            # Extract entities
            entities = self._extract_entities(normalized_text)
            
            # Match against patterns
            best_match = self._match_patterns(normalized_text)
            
            if best_match:
                pattern, confidence, parameters = best_match
                
                return ParsedCommand(
                    original_text=text,
                    command_type=pattern.command_type,
                    action=pattern.action,
                    parameters=parameters,
                    confidence=confidence,
                    intent=f"{pattern.command_type.value}_{pattern.action}",
                    entities=entities
                )
            else:
                # Fallback to general conversation
                return ParsedCommand(
                    original_text=text,
                    command_type=CommandType.CONVERSATION,
                    action="respond",
                    parameters={"text": text},
                    confidence=ConfidenceLevel.LOW,
                    intent="general_conversation",
                    entities=entities
                )
                
        except Exception as e:
            logger.error(f"Error parsing command: {e}")
            return ParsedCommand(
                original_text=text,
                command_type=CommandType.CONVERSATION,
                action="error",
                parameters={"error": str(e)},
                confidence=ConfidenceLevel.LOW,
                intent="error"
            )
    
    def _normalize_text(self, text: str) -> str:
        """Normalize text for better matching"""
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        # Convert to lowercase for Korean text processing
        # Note: Korean doesn't have case, but this helps with mixed content
        text = text.lower()
        
        # Remove common filler words
        filler_words = ['좀', '한번', '해줘', '해주세요', '부탁', '드립니다']
        for filler in filler_words:
            text = text.replace(filler, ' ')
        
        return ' '.join(text.split())
    
    def _extract_entities(self, text: str) -> List[Dict[str, str]]:
        """Extract named entities from text"""
        entities = []
        
        try:
            # Extract nouns as potential entities
            nouns = self.korean_analyzer.nouns(text)
            
            for noun in nouns:
                if len(noun) > 1:  # Filter single characters
                    entity_type = self._classify_entity(noun)
                    entities.append({
                        "text": noun,
                        "type": entity_type,
                        "confidence": 0.8
                    })
            
            # Extract numbers
            numbers = re.findall(r'\d+', text)
            for number in numbers:
                entities.append({
                    "text": number,
                    "type": "number",
                    "confidence": 0.9
                })
            
            # Extract time expressions
            time_patterns = [
                r'\d{1,2}시',
                r'\d{1,2}분',
                r'오늘|내일|모레|어제',
                r'아침|점심|저녁|밤'
            ]
            
            for pattern in time_patterns:
                matches = re.findall(pattern, text)
                for match in matches:
                    entities.append({
                        "text": match,
                        "type": "time",
                        "confidence": 0.9
                    })
        
        except Exception as e:
            logger.error(f"Error extracting entities: {e}")
        
        return entities
    
    def _classify_entity(self, entity: str) -> str:
        """Classify entity type"""
        # Simple rule-based classification
        app_names = ['메모장', '브라우저', '카카오톡', '엑셀', '워드', '파워포인트']
        file_extensions = ['txt', 'doc', 'pdf', 'xlsx', 'ppt']
        
        if entity in app_names:
            return "application"
        elif any(ext in entity for ext in file_extensions):
            return "file"
        elif entity.endswith('님') or entity.endswith('씨'):
            return "person"
        else:
            return "general"
    
    def _match_patterns(self, text: str) -> Optional[Tuple[CommandPattern, ConfidenceLevel, Dict[str, str]]]:
        """Match text against command patterns"""
        best_match = None
        best_confidence = 0
        
        for pattern in self.command_patterns:
            if not pattern.enabled:
                continue
            
            match = re.search(pattern.pattern, text)
            if match:
                confidence = self._calculate_confidence(text, pattern, match)
                
                if confidence > best_confidence:
                    # Extract parameters from regex groups
                    parameters = {}
                    for param_name, group_ref in pattern.parameters.items():
                        if group_ref.startswith('\\'):
                            group_num = int(group_ref[1:])
                            if group_num <= len(match.groups()):
                                parameters[param_name] = match.group(group_num).strip()
                        else:
                            parameters[param_name] = group_ref
                    
                    best_match = (pattern, self._confidence_to_level(confidence), parameters)
                    best_confidence = confidence
        
        return best_match
    
    def _calculate_confidence(self, text: str, pattern: CommandPattern, match: re.Match) -> float:
        """Calculate confidence score for pattern match"""
        base_confidence = 0.6
        
        # Boost confidence if match covers most of the text
        match_coverage = len(match.group(0)) / len(text)
        coverage_boost = match_coverage * 0.3
        
        # Boost confidence if pattern has many examples
        example_boost = min(0.1, len(pattern.examples) * 0.02)
        
        total_confidence = base_confidence + coverage_boost + example_boost
        return min(1.0, total_confidence)
    
    def _confidence_to_level(self, confidence: float) -> ConfidenceLevel:
        """Convert confidence score to level"""
        if confidence >= 0.8:
            return ConfidenceLevel.HIGH
        elif confidence >= 0.6:
            return ConfidenceLevel.MEDIUM
        else:
            return ConfidenceLevel.LOW

class CommandExecutor:
    """Execute parsed commands"""
    
    def __init__(self):
        self.execution_log = []
        self.safety_checks = True
        self.allowed_actions = self._initialize_allowed_actions()
    
    def _initialize_allowed_actions(self) -> Dict[CommandType, List[str]]:
        """Initialize allowed actions for each command type"""
        return {
            CommandType.SYSTEM: ["restart", "shutdown", "sleep"],
            CommandType.APPLICATION: ["open", "close", "focus"],
            CommandType.FILE_OPERATION: ["create", "delete", "copy", "move", "read"],
            CommandType.WEB_SEARCH: ["search", "browse"],
            CommandType.EMAIL: ["send", "read", "draft"],
            CommandType.REMINDER: ["set", "list", "delete"],
            CommandType.AUTOMATION: ["run", "schedule", "stop"],
            CommandType.ANALYSIS: ["analyze", "summarize", "report"],
            CommandType.CONVERSATION: ["respond", "clarify", "help"]
        }
    
    async def execute_command(self, command: ParsedCommand) -> CommandExecutionResult:
        """Execute a parsed command"""
        start_time = datetime.now()
        command_id = f"cmd_{int(start_time.timestamp())}"
        
        try:
            # Safety check
            if self.safety_checks and not self._is_action_allowed(command):
                return CommandExecutionResult(
                    command_id=command_id,
                    success=False,
                    result=ActionResult.PERMISSION_DENIED,
                    output="명령 실행이 허용되지 않습니다.",
                    error_message="Action not in allowed list"
                )
            
            # Route to appropriate executor
            if command.command_type == CommandType.SYSTEM:
                result = await self._execute_system_command(command)
            elif command.command_type == CommandType.APPLICATION:
                result = await self._execute_application_command(command)
            elif command.command_type == CommandType.FILE_OPERATION:
                result = await self._execute_file_operation(command)
            elif command.command_type == CommandType.WEB_SEARCH:
                result = await self._execute_web_search(command)
            elif command.command_type == CommandType.EMAIL:
                result = await self._execute_email_command(command)
            elif command.command_type == CommandType.REMINDER:
                result = await self._execute_reminder_command(command)
            elif command.command_type == CommandType.ANALYSIS:
                result = await self._execute_analysis_command(command)
            else:
                result = await self._execute_conversation_command(command)
            
            # Calculate execution time
            execution_time = (datetime.now() - start_time).total_seconds()
            result.execution_time = execution_time
            
            # Log execution
            self.execution_log.append({
                "command_id": command_id,
                "command": command.original_text,
                "result": result.result.value,
                "timestamp": start_time.isoformat()
            })
            
            return result
            
        except Exception as e:
            logger.error(f"Error executing command: {e}")
            return CommandExecutionResult(
                command_id=command_id,
                success=False,
                result=ActionResult.FAILED,
                output="명령 실행 중 오류가 발생했습니다.",
                error_message=str(e),
                execution_time=(datetime.now() - start_time).total_seconds()
            )
    
    def _is_action_allowed(self, command: ParsedCommand) -> bool:
        """Check if action is allowed"""
        allowed = self.allowed_actions.get(command.command_type, [])
        return command.action in allowed
    
    async def _execute_system_command(self, command: ParsedCommand) -> CommandExecutionResult:
        """Execute system commands"""
        action = command.action
        
        if action == "shutdown":
            if os.name == 'nt':  # Windows
                subprocess.run(['shutdown', '/s', '/t', '5'])
            else:  # Unix/Linux/Mac
                subprocess.run(['sudo', 'shutdown', '-h', '+1'])
            
            return CommandExecutionResult(
                command_id="",
                success=True,
                result=ActionResult.SUCCESS,
                output="시스템이 5초 후에 종료됩니다."
            )
        
        elif action == "restart":
            if os.name == 'nt':  # Windows
                subprocess.run(['shutdown', '/r', '/t', '5'])
            else:  # Unix/Linux/Mac
                subprocess.run(['sudo', 'shutdown', '-r', '+1'])
            
            return CommandExecutionResult(
                command_id="",
                success=True,
                result=ActionResult.SUCCESS,
                output="시스템이 5초 후에 재시작됩니다."
            )
        
        else:
            return CommandExecutionResult(
                command_id="",
                success=False,
                result=ActionResult.INVALID_PARAMS,
                output=f"알 수 없는 시스템 명령: {action}"
            )
    
    async def _execute_application_command(self, command: ParsedCommand) -> CommandExecutionResult:
        """Execute application commands"""
        action = command.action
        app_name = command.parameters.get("app_name", "").lower()
        
        # Map Korean app names to executable names
        app_mapping = {
            '메모장': 'notepad',
            '브라우저': 'chrome',
            '크롬': 'chrome',
            '파이어폭스': 'firefox',
            '익스플로러': 'iexplore',
            '엑셀': 'excel',
            '워드': 'winword',
            '파워포인트': 'powerpnt',
            '카카오톡': 'kakaotalk'
        }
        
        executable = app_mapping.get(app_name, app_name)
        
        if action == "open":
            try:
                if os.name == 'nt':  # Windows
                    subprocess.Popen([executable])
                else:  # Unix/Linux/Mac
                    subprocess.Popen(['open', '-a', executable])
                
                return CommandExecutionResult(
                    command_id="",
                    success=True,
                    result=ActionResult.SUCCESS,
                    output=f"{app_name} 애플리케이션을 실행했습니다."
                )
            except Exception as e:
                return CommandExecutionResult(
                    command_id="",
                    success=False,
                    result=ActionResult.NOT_FOUND,
                    output=f"{app_name} 애플리케이션을 찾을 수 없습니다.",
                    error_message=str(e)
                )
        
        elif action == "close":
            try:
                # Find and terminate process
                for proc in psutil.process_iter(['pid', 'name']):
                    if executable.lower() in proc.info['name'].lower():
                        proc.terminate()
                        return CommandExecutionResult(
                            command_id="",
                            success=True,
                            result=ActionResult.SUCCESS,
                            output=f"{app_name} 애플리케이션을 종료했습니다."
                        )
                
                return CommandExecutionResult(
                    command_id="",
                    success=False,
                    result=ActionResult.NOT_FOUND,
                    output=f"실행 중인 {app_name} 애플리케이션을 찾을 수 없습니다."
                )
            except Exception as e:
                return CommandExecutionResult(
                    command_id="",
                    success=False,
                    result=ActionResult.FAILED,
                    output=f"{app_name} 애플리케이션 종료 중 오류가 발생했습니다.",
                    error_message=str(e)
                )
    
    async def _execute_file_operation(self, command: ParsedCommand) -> CommandExecutionResult:
        """Execute file operations"""
        action = command.action
        filename = command.parameters.get("filename", "")
        
        if action == "create":
            try:
                # Create file with basic content
                if not filename.endswith('.txt'):
                    filename += '.txt'
                
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(f"# {filename}\n\n자동으로 생성된 파일입니다.\n생성 시간: {datetime.now().isoformat()}\n")
                
                return CommandExecutionResult(
                    command_id="",
                    success=True,
                    result=ActionResult.SUCCESS,
                    output=f"{filename} 파일을 생성했습니다."
                )
            except Exception as e:
                return CommandExecutionResult(
                    command_id="",
                    success=False,
                    result=ActionResult.FAILED,
                    output=f"파일 생성 중 오류가 발생했습니다.",
                    error_message=str(e)
                )
        
        elif action == "delete":
            try:
                if os.path.exists(filename):
                    os.remove(filename)
                    return CommandExecutionResult(
                        command_id="",
                        success=True,
                        result=ActionResult.SUCCESS,
                        output=f"{filename} 파일을 삭제했습니다."
                    )
                else:
                    return CommandExecutionResult(
                        command_id="",
                        success=False,
                        result=ActionResult.NOT_FOUND,
                        output=f"{filename} 파일을 찾을 수 없습니다."
                    )
            except Exception as e:
                return CommandExecutionResult(
                    command_id="",
                    success=False,
                    result=ActionResult.FAILED,
                    output=f"파일 삭제 중 오류가 발생했습니다.",
                    error_message=str(e)
                )
    
    async def _execute_web_search(self, command: ParsedCommand) -> CommandExecutionResult:
        """Execute web search commands"""
        query = command.parameters.get("query", "")
        
        try:
            # Open search in default browser
            search_url = f"https://www.google.com/search?q={query.replace(' ', '+')}"
            webbrowser.open(search_url)
            
            return CommandExecutionResult(
                command_id="",
                success=True,
                result=ActionResult.SUCCESS,
                output=f"'{query}' 검색 결과를 브라우저에서 열었습니다."
            )
        except Exception as e:
            return CommandExecutionResult(
                command_id="",
                success=False,
                result=ActionResult.FAILED,
                output=f"웹 검색 중 오류가 발생했습니다.",
                error_message=str(e)
            )
    
    async def _execute_email_command(self, command: ParsedCommand) -> CommandExecutionResult:
        """Execute email commands"""
        # This is a placeholder - would need actual email configuration
        return CommandExecutionResult(
            command_id="",
            success=False,
            result=ActionResult.FAILED,
            output="이메일 기능은 설정이 필요합니다."
        )
    
    async def _execute_reminder_command(self, command: ParsedCommand) -> CommandExecutionResult:
        """Execute reminder commands"""
        content = command.parameters.get("content", "")
        
        # Create a simple reminder file
        reminder_file = "reminders.txt"
        reminder_text = f"{datetime.now().isoformat()}: {content}\n"
        
        try:
            with open(reminder_file, 'a', encoding='utf-8') as f:
                f.write(reminder_text)
            
            return CommandExecutionResult(
                command_id="",
                success=True,
                result=ActionResult.SUCCESS,
                output=f"'{content}' 알림을 설정했습니다."
            )
        except Exception as e:
            return CommandExecutionResult(
                command_id="",
                success=False,
                result=ActionResult.FAILED,
                output=f"알림 설정 중 오류가 발생했습니다.",
                error_message=str(e)
            )
    
    async def _execute_analysis_command(self, command: ParsedCommand) -> CommandExecutionResult:
        """Execute analysis commands"""
        target = command.parameters.get("target", "")
        
        return CommandExecutionResult(
            command_id="",
            success=True,
            result=ActionResult.SUCCESS,
            output=f"{target} 분석 요청을 접수했습니다. 분석 결과는 별도로 제공됩니다."
        )
    
    async def _execute_conversation_command(self, command: ParsedCommand) -> CommandExecutionResult:
        """Execute conversation commands"""
        text = command.parameters.get("text", "")
        
        # Simple response generation
        response = f"'{text}'에 대해 말씀해주셨네요. 더 구체적인 명령을 원하시면 말씀해주세요."
        
        return CommandExecutionResult(
            command_id="",
            success=True,
            result=ActionResult.SUCCESS,
            output=response
        )

class NaturalLanguageCommandSystem:
    """Main natural language command system"""
    
    def __init__(self, db_path: str = "command_system.db"):
        self.db_path = db_path
        self.voice_processor = VoiceProcessor()
        self.command_parser = CommandParser()
        self.command_executor = CommandExecutor()
        self.is_listening = False
        self._initialize_database()
    
    def _initialize_database(self):
        """Initialize command system database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Command history table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS command_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    original_text TEXT NOT NULL,
                    command_type TEXT,
                    action TEXT,
                    parameters TEXT,
                    confidence TEXT,
                    execution_result TEXT,
                    success BOOLEAN,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Voice commands table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS voice_commands (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    audio_data BLOB,
                    transcribed_text TEXT,
                    confidence REAL,
                    language TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # User preferences table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_preferences (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    preference_key TEXT NOT NULL,
                    preference_value TEXT,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
            conn.close()
            logger.info("Command system database initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing database: {e}")
    
    async def process_text_command(self, text: str) -> CommandExecutionResult:
        """Process text-based command"""
        try:
            # Parse command
            parsed_command = self.command_parser.parse_command(text)
            
            # Execute command
            result = await self.command_executor.execute_command(parsed_command)
            
            # Save to history
            self._save_command_history(parsed_command, result)
            
            return result
            
        except Exception as e:
            logger.error(f"Error processing text command: {e}")
            return CommandExecutionResult(
                command_id="error",
                success=False,
                result=ActionResult.FAILED,
                output="명령 처리 중 오류가 발생했습니다.",
                error_message=str(e)
            )
    
    async def process_voice_command(self, timeout: float = 5.0) -> Optional[CommandExecutionResult]:
        """Process voice-based command"""
        try:
            # Listen for voice command
            voice_command = await self.voice_processor.listen_for_command(timeout)
            
            if not voice_command:
                return None
            
            # Save voice data
            self._save_voice_command(voice_command)
            
            # Process transcribed text
            result = await self.process_text_command(voice_command.transcribed_text)
            
            # Speak result if successful
            if result.success:
                self.voice_processor.speak(result.output)
            else:
                self.voice_processor.speak(f"죄송합니다. {result.output}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error processing voice command: {e}")
            error_result = CommandExecutionResult(
                command_id="voice_error",
                success=False,
                result=ActionResult.FAILED,
                output="음성 명령 처리 중 오류가 발생했습니다.",
                error_message=str(e)
            )
            self.voice_processor.speak("음성 명령 처리에 실패했습니다.")
            return error_result
    
    def _save_command_history(self, command: ParsedCommand, result: CommandExecutionResult):
        """Save command execution to history"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO command_history 
                (original_text, command_type, action, parameters, confidence, 
                 execution_result, success)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                command.original_text,
                command.command_type.value,
                command.action,
                json.dumps(command.parameters),
                command.confidence.value,
                result.result.value,
                result.success
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error saving command history: {e}")
    
    def _save_voice_command(self, voice_command: VoiceCommand):
        """Save voice command to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO voice_commands 
                (audio_data, transcribed_text, confidence, language)
                VALUES (?, ?, ?, ?)
            ''', (
                voice_command.audio_data,
                voice_command.transcribed_text,
                voice_command.confidence,
                voice_command.language
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error saving voice command: {e}")
    
    async def start_continuous_listening(self):
        """Start continuous voice command listening"""
        self.is_listening = True
        logger.info("Started continuous voice command listening")
        
        while self.is_listening:
            try:
                result = await self.process_voice_command(timeout=2.0)
                if result:
                    logger.info(f"Processed voice command: {result.output}")
                await asyncio.sleep(0.1)  # Small delay to prevent excessive CPU usage
            except Exception as e:
                logger.error(f"Error in continuous listening: {e}")
                await asyncio.sleep(1.0)  # Longer delay on error
    
    def stop_continuous_listening(self):
        """Stop continuous voice command listening"""
        self.is_listening = False
        logger.info("Stopped continuous voice command listening")
    
    def get_command_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get command execution history"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM command_history 
                ORDER BY timestamp DESC 
                LIMIT ?
            ''', (limit,))
            
            rows = cursor.fetchall()
            conn.close()
            
            history = []
            for row in rows:
                history.append({
                    "id": row[0],
                    "original_text": row[1],
                    "command_type": row[2],
                    "action": row[3],
                    "parameters": json.loads(row[4]) if row[4] else {},
                    "confidence": row[5],
                    "execution_result": row[6],
                    "success": bool(row[7]),
                    "timestamp": row[8]
                })
            
            return history
            
        except Exception as e:
            logger.error(f"Error getting command history: {e}")
            return []

# FastAPI application
app = FastAPI(title="Natural Language Command System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global command system instance
command_system = NaturalLanguageCommandSystem()

@app.on_event("startup")
async def startup_event():
    """Initialize command system on startup"""
    logger.info("Natural Language Command System starting up...")

@app.post("/api/command/text")
async def process_text_command(command_data: Dict[str, Any]):
    """Process text command"""
    try:
        text = command_data['text']
        result = await command_system.process_text_command(text)
        
        return {
            "command_id": result.command_id,
            "success": result.success,
            "result": result.result.value,
            "output": result.output,
            "execution_time": result.execution_time,
            "error_message": result.error_message
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/command/voice")
async def process_voice_command(timeout: float = 5.0):
    """Process voice command"""
    try:
        result = await command_system.process_voice_command(timeout)
        
        if result:
            return {
                "command_id": result.command_id,
                "success": result.success,
                "result": result.result.value,
                "output": result.output,
                "execution_time": result.execution_time,
                "error_message": result.error_message
            }
        else:
            return {
                "success": False,
                "result": "no_speech",
                "output": "음성이 감지되지 않았습니다."
            }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/voice/upload")
async def upload_voice_file(file: UploadFile = File(...)):
    """Upload and process voice file"""
    try:
        # Read audio file
        audio_data = await file.read()
        
        # Process with speech recognition
        # This is a simplified implementation
        # In practice, you'd need to handle different audio formats
        
        return {
            "status": "success",
            "message": "음성 파일을 업로드했습니다. 처리 중입니다."
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/listening/start")
async def start_listening():
    """Start continuous voice listening"""
    try:
        asyncio.create_task(command_system.start_continuous_listening())
        return {"status": "success", "message": "연속 음성 인식을 시작했습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/listening/stop")
async def stop_listening():
    """Stop continuous voice listening"""
    try:
        command_system.stop_continuous_listening()
        return {"status": "success", "message": "연속 음성 인식을 중지했습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
async def get_command_history(limit: int = 50):
    """Get command execution history"""
    try:
        history = command_system.get_command_history(limit)
        return {"history": history, "total": len(history)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time command processing"""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            
            if data.get('type') == 'text_command':
                text = data.get('text', '')
                result = await command_system.process_text_command(text)
                
                await websocket.send_json({
                    'type': 'command_result',
                    'success': result.success,
                    'output': result.output,
                    'execution_time': result.execution_time
                })
            
            elif data.get('type') == 'start_listening':
                await websocket.send_json({
                    'type': 'listening_status',
                    'listening': True,
                    'message': '음성 인식을 시작합니다...'
                })
                
                # In a real implementation, you'd handle continuous listening here
                
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")

if __name__ == "__main__":
    _p = int(
        os.environ.get(
            "NATURAL_LANGUAGE_COMMAND_SYSTEM_PORT",
            os.environ.get("PORT", "8005"),
        )
    )
    uvicorn.run(app, host="0.0.0.0", port=_p) 