#!/usr/bin/env node
"""
프론트엔드와 백엔드 연결 테스트 스크립트
"""

const http = require('http');

class ConnectionTester {
    constructor() {
        this.frontendUrl = 'http://localhost:3000';
        this.backendUrl = 'http://localhost:8000';
        this.testResults = [];
    }

    async testFrontend() {
        return new Promise((resolve) => {
            const req = http.get(this.frontendUrl, (res) => {
                if (res.statusCode === 200) {
                    console.log('✅ 프론트엔드 서버 정상 작동 (포트 3000)');
                    resolve(true);
                } else {
                    console.log(`❌ 프론트엔드 서버 오류: ${res.statusCode}`);
                    resolve(false);
                }
            });

            req.on('error', (err) => {
                console.log(`❌ 프론트엔드 서버 연결 실패: ${err.message}`);
                resolve(false);
            });

            req.setTimeout(5000, () => {
                console.log('❌ 프론트엔드 서버 연결 시간 초과');
                req.destroy();
                resolve(false);
            });
        });
    }

    async testBackend() {
        return new Promise((resolve) => {
            const req = http.get(`${this.backendUrl}/health`, (res) => {
                if (res.statusCode === 200) {
                    console.log('✅ 백엔드 서버 정상 작동 (포트 8000)');
                    resolve(true);
                } else {
                    console.log(`❌ 백엔드 서버 오류: ${res.statusCode}`);
                    resolve(false);
                }
            });

            req.on('error', (err) => {
                console.log(`❌ 백엔드 서버 연결 실패: ${err.message}`);
                resolve(false);
            });

            req.setTimeout(5000, () => {
                console.log('❌ 백엔드 서버 연결 시간 초과');
                req.destroy();
                resolve(false);
            });
        });
    }

    async testBackendAPI() {
        return new Promise((resolve) => {
            const req = http.get(`${this.backendUrl}/api/v7/status`, (res) => {
                if (res.statusCode === 200) {
                    console.log('✅ 백엔드 API 엔드포인트 정상 작동');
                    resolve(true);
                } else {
                    console.log(`❌ 백엔드 API 엔드포인트 오류: ${res.statusCode}`);
                    resolve(false);
                }
            });

            req.on('error', (err) => {
                console.log(`❌ 백엔드 API 연결 실패: ${err.message}`);
                resolve(false);
            });

            req.setTimeout(5000, () => {
                console.log('❌ 백엔드 API 연결 시간 초과');
                req.destroy();
                resolve(false);
            });
        });
    }

    async runAllTests() {
        console.log('🚀 프론트엔드-백엔드 연결 테스트 시작');
        console.log('=' * 50);

        // 프론트엔드 테스트
        console.log('\n🔍 프론트엔드 서버 테스트...');
        const frontendResult = await this.testFrontend();
        this.testResults.push(('프론트엔드 서버', frontendResult));

        // 백엔드 테스트
        console.log('\n🔍 백엔드 서버 테스트...');
        const backendResult = await this.testBackend();
        this.testResults.push(('백엔드 서버', backendResult));

        // 백엔드 API 테스트
        console.log('\n🔍 백엔드 API 테스트...');
        const apiResult = await this.testBackendAPI();
        this.testResults.push(('백엔드 API', apiResult));

        // 결과 요약
        this.printSummary();
    }

    printSummary() {
        console.log('\n' + '=' * 50);
        console.log('📊 연결 테스트 결과 요약:');
        console.log('=' * 50);

        let successfulTests = 0;
        for (const [testName, success] of this.testResults) {
            const status = success ? '✅ 성공' : '❌ 실패';
            console.log(`   ${testName}: ${status}`);
            if (success) {
                successfulTests++;
            }
        }

        const totalTests = this.testResults.length;
        const successRate = (successfulTests / totalTests) * 100;

        console.log(`\n📈 전체 성공률: ${successRate.toFixed(1)}% (${successfulTests}/${totalTests})`);

        if (successRate === 100) {
            console.log('🎉 프론트엔드와 백엔드가 완벽하게 연결되었습니다!');
            console.log('🌐 웹 브라우저에서 http://localhost:3000 으로 접속하세요.');
        } else if (successRate >= 66) {
            console.log('⚠️ 일부 연결에 문제가 있습니다.');
        } else {
            console.log('❌ 연결에 심각한 문제가 있습니다.');
        }
    }
}

// 테스트 실행
const tester = new ConnectionTester();
tester.runAllTests(); 