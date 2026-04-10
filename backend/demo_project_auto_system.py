#!/usr/bin/env python3
"""
프로젝트별 미디어 자동분류 + 지침 자동분류 + 일관된 메시지 전달 시스템 데모 v1.0
- 실제 기능 시연
- 자동분류 결과 확인
- 일관된 메시지 생성 테스트
"""

import json
from datetime import datetime
from typing import Dict, List, Any
import os
from pathlib import Path

class ProjectAutoSystemDemo:
    """프로젝트 자동화 시스템 데모"""
    
    def __init__(self):
        self.projects = {}
        self.media_files = {}
        self.instructions = {}
        self.message_history = []
        self._init_classification_rules()
    
    def _init_classification_rules(self):
        """분류 규칙 초기화"""
        
        self.classification_rules = {
            "project_types": {
                "건설_재개발": {
                    "keywords": ["재개발", "재건축", "정비", "철거", "신축", "샘플 프로젝트"],
                    "auto_folders": ["설계도", "시공계획", "허가서", "현장사진", "회의록"]
                },
                "조합_운영": {
                    "keywords": ["조합", "총회", "의결", "동의", "투표", "조합원"],
                    "auto_folders": ["회의록", "안건서", "공지사항", "결과보고", "의견서"]
                },
                "시공_관리": {
                    "keywords": ["시공", "공사", "진행", "현장", "안전", "품질"],
                    "auto_folders": ["현장사진", "진행보고", "안전점검", "품질관리", "일정표"]
                }
            },
            "file_categories": {
                "document": {
                    "extensions": [".pdf", ".docx", ".doc", ".txt", ".md", ".csv", ".hwp"],
                    "auto_actions": ["텍스트추출", "키워드분석", "카테고리분류"],
                    "folders": ["계약서", "제안서", "보고서", "검토서", "의견서"]
                },
                "image": {
                    "extensions": [".jpg", ".png", ".bmp", ".tiff"],
                    "auto_actions": ["이미지분석", "OCR", "표감지"],
                    "folders": ["설계도", "현장사진", "스크린샷", "도면", "사진"]
                },
                "video": {
                    "extensions": [".mp4", ".avi", ".mov"],
                    "auto_actions": ["썸네일생성", "음성추출", "장면분석"],
                    "folders": ["회의영상", "현장영상", "설명영상", "교육자료"]
                },
                "presentation": {
                    "extensions": [".pptx", ".ppt"],
                    "auto_actions": ["슬라이드추출", "텍스트분석"],
                    "folders": ["발표자료", "제안서", "설명자료", "교육자료"]
                }
            },
            "instruction_categories": {
                "tone_guidelines": {
                    "keywords": ["톤", "말투", "격식", "존댓말", "정중"],
                    "patterns": ["~습니다", "~해주세요", "~드립니다"],
                    "logic_type": "음성톤조절"
                },
                "logic_patterns": {
                    "keywords": ["논리", "근거", "이유", "결론", "증명"],
                    "patterns": ["왜냐하면", "따라서", "그러므로", "결과적으로"],
                    "logic_type": "논리구조"
                },
                "response_templates": {
                    "keywords": ["대응", "답변", "회신", "피드백"],
                    "patterns": ["~에 대해", "~관련하여", "~건으로"],
                    "logic_type": "응답패턴"
                }
            }
        }
    
    def create_project_with_auto_classification(self, project_name: str, description: str = "") -> Dict:
        """프로젝트 생성 및 자동분류"""
        
        project_id = f"proj_{len(self.projects)+1}"
        
        # 프로젝트 타입 자동 분류
        project_type = self._classify_project_type(project_name, description)
        
        # 자동 폴더 구조 생성
        auto_folders = self._generate_auto_folders(project_type)
        
        # 자동분류 규칙 설정
        auto_rules = self._generate_classification_rules(project_type)
        
        project = {
            "project_id": project_id,
            "project_name": project_name,
            "project_type": project_type,
            "description": description,
            "created_date": datetime.now().isoformat(),
            "auto_folders": auto_folders,
            "auto_classification_rules": auto_rules,
            "media_count": 0,
            "instruction_count": 0,
            "status": "active"
        }
        
        self.projects[project_id] = project
        
        print(f"🗂️ 프로젝트 생성 완료: {project_name}")
        print(f"   📁 자동분류 타입: {project_type}")
        print(f"   🗂️ 자동생성 폴더: {', '.join(auto_folders)}")
        print(f"   ⚙️ 분류규칙: {len(auto_rules)}개 자동 설정")
        
        return project
    
    def _classify_project_type(self, name: str, description: str) -> str:
        """프로젝트 타입 자동분류"""
        
        text = f"{name} {description}".lower()
        
        for project_type, rules in self.classification_rules["project_types"].items():
            if any(keyword in text for keyword in rules["keywords"]):
                return project_type
        
        return "일반_프로젝트"
    
    def _generate_auto_folders(self, project_type: str) -> List[str]:
        """자동 폴더 구조 생성"""
        
        if project_type in self.classification_rules["project_types"]:
            return self.classification_rules["project_types"][project_type]["auto_folders"]
        
        return ["문서", "이미지", "기타"]
    
    def _generate_classification_rules(self, project_type: str) -> Dict:
        """자동분류 규칙 생성"""
        
        if project_type in self.classification_rules["project_types"]:
            keywords = self.classification_rules["project_types"][project_type]["keywords"]
            return {
                "priority_keywords": keywords,
                "auto_categorization": True,
                "smart_folder_assignment": True,
                "content_analysis": True
            }
        
        return {"auto_categorization": False}
    
    def upload_media_with_auto_classification(self, project_id: str, filename: str, 
                                            file_content: str = "") -> Dict:
        """미디어 업로드 및 자동분류"""
        
        if project_id not in self.projects:
            raise ValueError("프로젝트를 찾을 수 없습니다.")
        
        file_id = f"file_{len(self.media_files)+1}"
        
        # 파일 카테고리 자동분류
        file_category = self._classify_file_category(filename)
        
        # 파일명 자동 정리
        clean_filename = self._clean_filename(filename)
        
        # 내용 기반 세부분류
        content_classification = self._classify_content(file_content, file_category)
        
        # 자동 폴더 배정
        auto_folder = self._assign_auto_folder(project_id, filename, content_classification)
        
        # 자동 태그 생성
        auto_tags = self._generate_auto_tags(filename, file_content, content_classification)
        
        media_file = {
            "file_id": file_id,
            "project_id": project_id,
            "original_filename": filename,
            "clean_filename": clean_filename,
            "file_category": file_category,
            "auto_folder": auto_folder,
            "auto_tags": auto_tags,
            "content_classification": content_classification,
            "upload_time": datetime.now().isoformat(),
            "auto_processed": True
        }
        
        self.media_files[file_id] = media_file
        self.projects[project_id]["media_count"] += 1
        
        print(f"📁 미디어 업로드 완료: {clean_filename}")
        print(f"   🔍 자동분류: {file_category}")
        print(f"   📂 자동폴더: {auto_folder}")
        print(f"   🏷️ 자동태그: {', '.join(auto_tags)}")
        print(f"   🎯 분류정확도: {content_classification.get('confidence', 0):.1%}")
        
        return media_file
    
    def _classify_file_category(self, filename: str) -> str:
        """파일 카테고리 자동분류"""
        
        file_ext = Path(filename).suffix.lower()
        filename_lower = filename.lower()
        
        for category, rules in self.classification_rules["file_categories"].items():
            if file_ext in rules["extensions"]:
                return category
            
            # 파일명 키워드 확인
            if any(keyword in filename_lower for keyword in rules.get("keywords", [])):
                return category
        
        return "document"  # 기본값
    
    def _clean_filename(self, filename: str) -> str:
        """파일명 자동 정리"""
        
        import re
        
        # 특수문자 제거
        clean = re.sub(r'[^\w\s.-]', '', filename)
        # 공백을 언더스코어로
        clean = re.sub(r'\s+', '_', clean)
        # 날짜 정규화
        clean = re.sub(r'(\d{4})[.-](\d{2})[.-](\d{2})', r'\1\2\3', clean)
        
        return clean
    
    def _classify_content(self, content: str, category: str) -> Dict:
        """내용 기반 세부분류"""
        
        classification = {
            "category": category,
            "confidence": 0.8,
            "detected_themes": [],
            "content_type": "일반",
            "priority_level": "중간"
        }
        
        content_lower = content.lower()
        
        # 테마 감지
        themes = []
        if any(word in content_lower for word in ["계약", "협약", "동의"]):
            themes.append("계약관련")
            classification["content_type"] = "계약문서"
        
        if any(word in content_lower for word in ["설계", "도면", "계획"]):
            themes.append("설계관련")
            classification["content_type"] = "설계문서"
        
        if any(word in content_lower for word in ["현장", "진행", "상황"]):
            themes.append("현장관련")
            classification["content_type"] = "현장보고"
        
        if any(word in content_lower for word in ["긴급", "중요", "즉시"]):
            classification["priority_level"] = "높음"
        
        classification["detected_themes"] = themes
        
        return classification
    
    def _assign_auto_folder(self, project_id: str, filename: str, classification: Dict) -> str:
        """자동 폴더 배정"""
        
        project = self.projects[project_id]
        auto_folders = project["auto_folders"]
        
        filename_lower = filename.lower()
        content_type = classification.get("content_type", "일반")
        
        # 내용 타입 기반 폴더 배정
        if "계약" in content_type:
            return "계약서" if "계약서" in auto_folders else auto_folders[0]
        elif "설계" in content_type:
            return "설계도" if "설계도" in auto_folders else auto_folders[0]
        elif "현장" in content_type:
            return "현장사진" if "현장사진" in auto_folders else auto_folders[0]
        
        # 파일명 기반 폴더 배정
        for folder in auto_folders:
            if folder.lower() in filename_lower:
                return folder
        
        return auto_folders[0]  # 기본 폴더
    
    def _generate_auto_tags(self, filename: str, content: str, classification: Dict) -> List[str]:
        """자동 태그 생성"""
        
        tags = []
        
        # 분류 기반 태그
        tags.append(classification["category"])
        tags.append(classification["content_type"])
        
        # 우선순위 기반 태그
        if classification["priority_level"] == "높음":
            tags.append("긴급")
        
        # 테마 기반 태그
        tags.extend(classification.get("detected_themes", []))
        
        # 날짜 태그
        import re
        date_match = re.search(r'(\d{4})(\d{2})(\d{2})', filename)
        if date_match:
            year, month, day = date_match.groups()
            tags.append(f"{year}년{month}월")
        
        return list(set(tags))  # 중복 제거
    
    def register_instruction_with_auto_classification(self, project_id: str, 
                                                    title: str, content: str) -> Dict:
        """지침 등록 및 자동분류"""
        
        if project_id not in self.projects:
            raise ValueError("프로젝트를 찾을 수 없습니다.")
        
        rule_id = f"rule_{len(self.instructions)+1}"
        
        # 지침 카테고리 자동분류
        rule_category = self._classify_instruction_category(title, content)
        
        # 논리 구조 자동 분석
        logic_analysis = self._analyze_logic_structure(content)
        
        # 적용 시나리오 자동 추출
        usage_scenarios = self._extract_usage_scenarios(content)
        
        # 톤 지시자 자동 감지
        tone_indicators = self._detect_tone_indicators(content)
        
        instruction = {
            "rule_id": rule_id,
            "project_id": project_id,
            "rule_title": title,
            "rule_content": content,
            "rule_category": rule_category,
            "logic_analysis": logic_analysis,
            "usage_scenarios": usage_scenarios,
            "tone_indicators": tone_indicators,
            "auto_classification": {
                "category": rule_category,
                "confidence": 0.9,
                "logic_type": logic_analysis.get("type", "일반"),
                "applicability": len(usage_scenarios)
            },
            "created_date": datetime.now().isoformat(),
            "usage_count": 0,
            "success_rate": 0.0
        }
        
        self.instructions[rule_id] = instruction
        self.projects[project_id]["instruction_count"] += 1
        
        print(f"📋 지침 등록 완료: {title}")
        print(f"   🔍 자동분류: {rule_category}")
        print(f"   🧠 논리구조: {logic_analysis.get('type', '일반')}")
        print(f"   🎯 적용시나리오: {len(usage_scenarios)}개")
        print(f"   🎨 톤지시자: {', '.join(tone_indicators)}")
        
        return instruction
    
    def _classify_instruction_category(self, title: str, content: str) -> str:
        """지침 카테고리 자동분류"""
        
        text = f"{title} {content}".lower()
        
        for category, rules in self.classification_rules["instruction_categories"].items():
            keywords = rules["keywords"]
            patterns = rules["patterns"]
            
            if any(keyword in text for keyword in keywords):
                return category
            
            if any(pattern in content for pattern in patterns):
                return category
        
        return "general_guideline"
    
    def _analyze_logic_structure(self, content: str) -> Dict:
        """논리 구조 자동 분석"""
        
        logic_patterns = {
            "조건부": ["만약", "~라면", "~인 경우", "~할 때"],
            "인과관계": ["왜냐하면", "따라서", "그러므로", "결과적으로"],
            "대조": ["그러나", "하지만", "반면에", "그럼에도"],
            "순서": ["첫째", "둘째", "마지막으로", "다음으로"],
            "강조": ["특히", "중요한 것은", "반드시", "절대"]
        }
        
        detected_patterns = []
        for logic_type, patterns in logic_patterns.items():
            if any(pattern in content for pattern in patterns):
                detected_patterns.append(logic_type)
        
        if detected_patterns:
            return {
                "type": detected_patterns[0],
                "complexity": "복합" if len(detected_patterns) > 2 else "단순",
                "patterns": detected_patterns
            }
        
        return {"type": "일반", "complexity": "단순", "patterns": []}
    
    def _extract_usage_scenarios(self, content: str) -> List[str]:
        """적용 시나리오 자동 추출"""
        
        scenarios = []
        
        scenario_patterns = [
            ("공정성_이슈", ["공정", "경쟁", "투명", "객관"]),
            ("갈등_상황", ["갈등", "분쟁", "대립", "문제"]),
            ("의사결정", ["결정", "선택", "판단", "검토"]),
            ("소통_상황", ["소통", "대화", "회의", "논의"])
        ]
        
        for scenario_name, keywords in scenario_patterns:
            if any(keyword in content for keyword in keywords):
                scenarios.append(scenario_name)
        
        return scenarios
    
    def _detect_tone_indicators(self, content: str) -> List[str]:
        """톤 지시자 자동 감지"""
        
        tone_patterns = {
            "정중함": ["정중하게", "정중히", "공손하게"],
            "격식": ["격식있게", "정식으로", "공식적으로"],
            "친근함": ["친근하게", "친밀하게", "부드럽게"],
            "강조": ["강하게", "확실하게", "명확하게"],
            "조심": ["조심스럽게", "신중하게", "세심하게"]
        }
        
        detected_tones = []
        for tone, patterns in tone_patterns.items():
            if any(pattern in content for pattern in patterns):
                detected_tones.append(tone)
        
        return detected_tones
    
    def generate_consistent_message(self, project_id: str, situation: str) -> Dict:
        """일관된 메시지 생성"""
        
        if project_id not in self.projects:
            raise ValueError("프로젝트를 찾을 수 없습니다.")
        
        # 프로젝트 정보 수집
        project = self.projects[project_id]
        project_instructions = [instr for instr in self.instructions.values() 
                               if instr["project_id"] == project_id]
        project_media = [media for media in self.media_files.values() 
                        if media["project_id"] == project_id]
        
        # 상황에 맞는 지침 선택
        applicable_instructions = self._select_applicable_instructions(
            project_instructions, situation
        )
        
        # 메시지 생성
        base_message = self._generate_base_message(situation)
        enhanced_message = self._apply_instructions_to_message(
            base_message, applicable_instructions
        )
        
        # 미디어 참조 추가
        if project_media:
            enhanced_message = self._add_media_references(enhanced_message, project_media)
        
        # 일관성 검증
        consistency_score = self._verify_consistency(enhanced_message, applicable_instructions)
        
        result = {
            "message_id": f"msg_{len(self.message_history)+1}",
            "project_id": project_id,
            "situation": situation,
            "generated_message": enhanced_message,
            "applied_instructions": [instr["rule_title"] for instr in applicable_instructions],
            "referenced_media_count": len(project_media),
            "consistency_score": consistency_score,
            "generation_time": datetime.now().isoformat()
        }
        
        self.message_history.append(result)
        
        return result
    
    def _select_applicable_instructions(self, instructions: List[Dict], situation: str) -> List[Dict]:
        """적용 가능한 지침 선택"""
        
        applicable = []
        situation_lower = situation.lower()
        
        for instruction in instructions:
            scenarios = instruction.get("usage_scenarios", [])
            content = instruction["rule_content"].lower()
            
            is_applicable = False
            
            # 시나리오 매칭
            if "공정성_이슈" in scenarios and any(word in situation_lower for word in ["공정", "경쟁"]):
                is_applicable = True
            elif "갈등_상황" in scenarios and any(word in situation_lower for word in ["문제", "불만"]):
                is_applicable = True
            elif "소통_상황" in scenarios:
                is_applicable = True
            
            # 키워드 매칭
            if any(word in content for word in ["공정", "투명", "객관"]) and "공정" in situation_lower:
                is_applicable = True
            
            if is_applicable:
                applicable.append(instruction)
        
        return applicable[:3]  # 상위 3개만
    
    def _generate_base_message(self, situation: str) -> str:
        """기본 메시지 생성"""
        
        situation_lower = situation.lower()
        
        if "공정" in situation_lower and "경쟁" in situation_lower:
            return "말씀하신 공정성 우려에 대해 깊이 공감합니다. 모든 참여업체에게 동등한 기회가 보장되어야 하며, 투명하고 객관적인 평가가 이루어져야 합니다."
        elif "문제" in situation_lower or "불만" in situation_lower:
            return "제기해주신 문제에 대해 신중히 검토하겠습니다. 관련된 모든 사항을 종합적으로 분석하여 적절한 해결방안을 모색하겠습니다."
        else:
            return "말씀해주신 사안에 대해 충분히 검토하겠습니다. 최선의 방향으로 진행될 수 있도록 노력하겠습니다."
    
    def _apply_instructions_to_message(self, message: str, instructions: List[Dict]) -> str:
        """지침을 메시지에 적용"""
        
        enhanced_message = message
        
        for instruction in instructions:
            category = instruction["rule_category"]
            tone_indicators = instruction.get("tone_indicators", [])
            content = instruction["rule_content"]
            
            # 톤 적용
            if "정중함" in tone_indicators:
                if not enhanced_message.startswith("정중히"):
                    enhanced_message = f"정중히 말씀드리면, {enhanced_message}"
            
            if "격식" in tone_indicators:
                enhanced_message = enhanced_message.replace("하겠습니다", "하도록 하겠습니다")
            
            # 논리 구조 적용
            logic_type = instruction.get("logic_analysis", {}).get("type", "")
            if logic_type == "인과관계":
                if "근거" in content.lower():
                    enhanced_message += " 이는 객관적 근거와 투명한 절차에 기반한 판단입니다."
            
            # 강조 요소 추가
            if "강조" in tone_indicators:
                enhanced_message += " 이 점을 특별히 강조하고 싶습니다."
        
        return enhanced_message
    
    def _add_media_references(self, message: str, media_files: List[Dict]) -> str:
        """미디어 참조 추가"""
        
        document_count = len([m for m in media_files if m["file_category"] == "document"])
        image_count = len([m for m in media_files if m["file_category"] == "image"])
        
        if document_count > 0:
            message += f" 관련 문서 {document_count}건을 종합 검토한 결과입니다."
        
        if image_count > 0:
            message += f" 현장 자료 {image_count}건도 함께 참고하였습니다."
        
        return message
    
    def _verify_consistency(self, message: str, instructions: List[Dict]) -> float:
        """일관성 검증"""
        
        score = 0.5  # 기본 점수
        
        # 지침 적용 확인
        applied_count = 0
        for instruction in instructions:
            content = instruction["rule_content"].lower()
            
            if "정중" in content and "정중" in message:
                applied_count += 1
            if "객관" in content and "객관" in message:
                applied_count += 1
            if "투명" in content and "투명" in message:
                applied_count += 1
        
        if instructions:
            score += (applied_count / len(instructions)) * 0.3
        
        # 메시지 품질 확인
        if len(message) > 50:
            score += 0.1
        if any(word in message for word in ["검토", "분석", "판단"]):
            score += 0.1
        
        return min(score, 1.0)
    
    def display_project_overview(self, project_id: str):
        """프로젝트 현황 표시"""
        
        if project_id not in self.projects:
            print("❌ 프로젝트를 찾을 수 없습니다.")
            return
        
        project = self.projects[project_id]
        
        print(f"\n📊 프로젝트 현황: {project['project_name']}")
        print("=" * 50)
        print(f"🗂️ 프로젝트 타입: {project['project_type']}")
        print(f"📁 미디어 파일: {project['media_count']}개")
        print(f"📋 등록된 지침: {project['instruction_count']}개")
        print(f"🗂️ 자동생성 폴더: {', '.join(project['auto_folders'])}")
        
        # 미디어 파일 현황
        project_media = [m for m in self.media_files.values() if m["project_id"] == project_id]
        if project_media:
            print(f"\n📁 미디어 파일 자동분류 현황:")
            category_count = {}
            for media in project_media:
                category = media["file_category"]
                category_count[category] = category_count.get(category, 0) + 1
            
            for category, count in category_count.items():
                print(f"   📂 {category}: {count}개")
        
        # 지침 현황
        project_instructions = [i for i in self.instructions.values() if i["project_id"] == project_id]
        if project_instructions:
            print(f"\n📋 지침 자동분류 현황:")
            category_count = {}
            for instruction in project_instructions:
                category = instruction["rule_category"]
                category_count[category] = category_count.get(category, 0) + 1
            
            for category, count in category_count.items():
                print(f"   📝 {category}: {count}개")

def main():
    """메인 데모 실행"""
    
    print("🚀 프로젝트별 미디어 자동분류 + 지침 통합 시스템 데모")
    print("=" * 60)
    
    demo = ProjectAutoSystemDemo()
    
    # 1. 프로젝트 생성 및 자동분류
    print("\n📁 1. 프로젝트 생성 및 자동분류")
    print("-" * 40)
    
    project1 = demo.create_project_with_auto_classification(
        "샘플 프로젝트 재개발 프로젝트",
        "재개발 조합 시공사 선정 및 관리 프로젝트입니다. 공정한 경쟁과 투명한 절차가 중요합니다."
    )
    
    # 2. 미디어 파일 업로드 및 자동분류
    print(f"\n📂 2. 미디어 파일 업로드 및 자동분류")
    print("-" * 40)
    
    # 샘플 미디어 파일들
    sample_files = [
        {
            "filename": "20250125_시공사_제안서_비교분석.pdf",
            "content": "삼성물산과 기타 시공사들의 제안서를 비교 분석한 문서입니다. 설계 방식과 시공 계획을 객관적으로 검토하였습니다."
        },
        {
            "filename": "현장_진행상황_사진_20250125.jpg",
            "content": "현장 진행 상황을 촬영한 사진입니다."
        },
        {
            "filename": "조합총회_회의록_20250120.docx",
            "content": "조합총회에서 시공사 선정에 대한 논의 내용을 정리한 회의록입니다. 조합원들의 다양한 의견이 수록되어 있습니다."
        }
    ]
    
    for file_info in sample_files:
        demo.upload_media_with_auto_classification(
            project1["project_id"],
            file_info["filename"],
            file_info["content"]
        )
    
    # 3. 지침 등록 및 자동분류
    print(f"\n📋 3. 지침 등록 및 자동분류")
    print("-" * 40)
    
    sample_instructions = [
        {
            "title": "공정성 강조 지침",
            "content": "시공사 선정 과정에서는 항상 공정하고 투명한 절차를 강조해야 합니다. 모든 조합원의 이익을 최우선으로 고려하며, 객관적인 평가 기준을 적용해야 합니다. 특히 경쟁업체 간의 공정한 경쟁 환경 조성이 중요합니다."
        },
        {
            "title": "정중한 소통 지침",
            "content": "모든 소통에서는 정중하고 격식있는 톤을 사용해야 합니다. 정중히 말씀드리며, 상대방의 의견을 존중하는 자세를 보여야 합니다. 따라서 감정적인 표현보다는 논리적인 근거를 제시하는 것이 중요합니다."
        },
        {
            "title": "논리적 대응 지침",
            "content": "문제 상황에 대응할 때는 감정보다는 논리를 우선해야 합니다. 왜냐하면 객관적 근거가 있어야 설득력이 높아지기 때문입니다. 따라서 데이터와 사실에 기반한 분석을 제시하고, 그러므로 합리적인 결론에 도달할 수 있습니다."
        }
    ]
    
    for instr in sample_instructions:
        demo.register_instruction_with_auto_classification(
            project1["project_id"],
            instr["title"],
            instr["content"]
        )
    
    # 4. 일관된 메시지 생성 테스트
    print(f"\n🤖 4. 일관된 메시지 생성 테스트")
    print("-" * 40)
    
    test_situation = "삼성은 경쟁사 설계에 없는 것을 이유로 '허가 불가'라고 몰아붙이는데, 이건 공정 경쟁이 아닙니다. 조합원들이 다 지켜보고 있습니다."
    
    result = demo.generate_consistent_message(project1["project_id"], test_situation)
    
    print(f"📝 입력 상황: {test_situation}")
    print(f"\n🎯 생성된 메시지:")
    print("━" * 50)
    print(result["generated_message"])
    print("━" * 50)
    print(f"📊 일관성 점수: {result['consistency_score']:.1%}")
    print(f"📋 적용된 지침: {', '.join(result['applied_instructions'])}")
    print(f"📁 참조된 미디어: {result['referenced_media_count']}개")
    
    # 5. 프로젝트 현황 종합
    print(f"\n📊 5. 프로젝트 현황 종합")
    print("-" * 40)
    
    demo.display_project_overview(project1["project_id"])
    
    # 6. 시스템 통계
    print(f"\n📈 6. 시스템 전체 통계")
    print("-" * 40)
    print(f"🗂️ 생성된 프로젝트: {len(demo.projects)}개")
    print(f"📁 업로드된 미디어: {len(demo.media_files)}개")
    print(f"📋 등록된 지침: {len(demo.instructions)}개")
    print(f"🤖 생성된 메시지: {len(demo.message_history)}개")
    
    if demo.message_history:
        avg_consistency = sum(msg["consistency_score"] for msg in demo.message_history) / len(demo.message_history)
        print(f"⭐ 평균 일관성 점수: {avg_consistency:.1%}")
    
    print(f"\n🎉 데모 완료!")
    print("=" * 60)

if __name__ == "__main__":
    main() 