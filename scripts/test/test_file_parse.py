import re

def test_file_parse():
    file_path = "chat_rooms/sample_chat_room/sample_chat_room.txt"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    pattern = r'^(\d{4}년 \d{1,2}월 \d{1,2}일 오[전후] \d{1,2}:\d{2}), (.+?) : (.+)$'
    
    messages = []
    for i, line in enumerate(lines[:50]):  # 처음 50줄만 테스트
        line = line.strip()
        if not line:
            continue
            
        match = re.match(pattern, line)
        if match:
            full_time, user_id, message_content = match.groups()
            messages.append({
                'timestamp': full_time,
                'user_id': user_id,
                'content': message_content
            })
            print(f"라인 {i+1}: {user_id} - {message_content[:30]}...")
        else:
            if line and not line.startswith('[') and not line.startswith('저장한 날짜') and not line.startswith('2025년'):
                print(f"파싱 실패 라인 {i+1}: {line[:50]}...")
    
    print(f"\n총 {len(messages)}개 메시지 파싱됨")

if __name__ == "__main__":
    test_file_parse() 