#!/usr/bin/env python3
"""
CORBU.AI 테스트 파일
이 파일은 파일 분석 기능을 테스트하기 위한 Python 코드입니다.
"""

def hello_world():
    """간단한 인사 함수"""
    print("Hello, CORBU.AI!")
    return "안녕하세요!"

def calculate_fibonacci(n):
    """피보나치 수열 계산"""
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

class TestClass:
    """테스트 클래스"""
    def __init__(self, name):
        self.name = name
    
    def greet(self):
        return f"안녕하세요, {self.name}님!"

if __name__ == "__main__":
    hello_world()
    print(f"피보나치 5: {calculate_fibonacci(5)}")
    test = TestClass("CORBU")
    print(test.greet())
