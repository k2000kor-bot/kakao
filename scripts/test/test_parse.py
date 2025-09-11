import re

def test_parse():
    test_line = "2025년 6월 24일 오전 9:25, 0124우성 : 환급금 3억 받은걸로 알고 있습니다!"
    
    # 정규식 테스트
    pattern = r'^(\d{4}년 \d{1,2}월 \d{1,2}일 오[전후] \d{1,2}:\d{2}), (.+?) : (.+)$'
    match = re.match(pattern, test_line)
    
    if match:
        print("매치 성공!")
        print(f"전체: {match.group(0)}")
        print(f"시간: {match.group(1)}")
        print(f"사용자: {match.group(2)}")
        print(f"메시지: {match.group(3)}")
    else:
        print("매치 실패!")
        print(f"테스트 라인: {test_line}")
        print(f"패턴: {pattern}")

if __name__ == "__main__":
    test_parse() 