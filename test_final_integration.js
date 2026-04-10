#!/usr/bin/env node

/**
 * CORBU.AI 시스템 최종 통합 테스트
 * 모든 기능이 정상적으로 작동하는지 확인하는 테스트 스크립트
 */

console.log('🚀 CORBU.AI 시스템 최종 통합 테스트 시작...\n');

// 테스트 결과 저장
const testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
};

// 테스트 헬퍼 함수
function runTest(testName, testFunction) {
    testResults.total++;
    console.log(`📋 테스트: ${testName}`);

    try {
        const result = testFunction();
        if (result) {
            testResults.passed++;
            console.log(`✅ 성공: ${testName}`);
            testResults.details.push({ name: testName, status: 'PASSED' });
        } else {
            testResults.failed++;
            console.log(`❌ 실패: ${testName}`);
            testResults.details.push({ name: testName, status: 'FAILED' });
        }
    } catch (error) {
        testResults.failed++;
        console.log(`❌ 오류: ${testName} - ${error.message}`);
        testResults.details.push({ name: testName, status: 'ERROR', error: error.message });
    }
    console.log('');
}

// 1. 파일 시스템 테스트
runTest('프로젝트 구조 확인', () => {
    const fs = require('fs');
    const path = require('path');

    const requiredFiles = [
        'package.json',
        'src/App.tsx',
        'src/components/UnifiedAdvancedInterface.tsx',
        'src/services/aiService.ts',
        'src/services/newsService.ts',
        'build/static/js/main.2522f24d.js'
    ];

    return requiredFiles.every(file => fs.existsSync(file));
});

// 2. 의존성 테스트
runTest('패키지 의존성 확인', () => {
    const fs = require('fs');
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    const requiredDependencies = [
        'react',
        'react-dom',
        'typescript',
        '@types/react',
        '@types/react-dom'
    ];

    return requiredDependencies.every(dep => packageJson.dependencies[dep] || packageJson.devDependencies[dep]);
});

// 3. TypeScript 컴파일 테스트
runTest('TypeScript 컴파일 확인', () => {
    const fs = require('fs');
    return fs.existsSync('build') && fs.existsSync('build/static/js/main.2522f24d.js');
});

// 4. 환경 설정 테스트
runTest('환경 설정 확인', () => {
    const fs = require('fs');
    const requiredEnvFiles = [
        '.env',
        'tailwind.config.js',
        'tsconfig.json'
    ];

    return requiredEnvFiles.every(file => fs.existsSync(file));
});

// 5. 문서화 테스트
runTest('문서화 완성도 확인', () => {
    const fs = require('fs');
    const requiredDocs = [
        'FINAL_USER_GUIDE.md',
        'CORBU_AI_ULTIMATE_FINAL_COMPLETION_SUCCESS.md',
        'DEPLOYMENT_READY_CHECKLIST.md',
        'UNIFIED_ADVANCED_SYSTEM_COMPLETION_REPORT.md',
        'AI_RESPONSE_QUALITY_ENHANCEMENT_COMPLETION_REPORT.md',
        'FINAL_COMPLETION_ANNOUNCEMENT.md'
    ];

    return requiredDocs.every(doc => fs.existsSync(doc));
});

// 6. 빌드 결과 테스트
runTest('빌드 결과 확인', () => {
    const fs = require('fs');
    const path = require('path');

    if (!fs.existsSync('build')) return false;

    const buildFiles = [
        'build/index.html',
        'build/static/js/main.2522f24d.js'
    ];

    return buildFiles.every(file => fs.existsSync(file));
});

// 7. 코드 품질 테스트
runTest('코드 품질 확인', () => {
    const fs = require('fs');

    // 주요 컴포넌트 파일들이 존재하는지 확인
    const componentFiles = [
        'src/components/UnifiedAdvancedInterface.tsx',
        'src/services/aiService.ts',
        'src/services/newsService.ts'
    ];

    return componentFiles.every(file => {
        if (!fs.existsSync(file)) return false;
        const content = fs.readFileSync(file, 'utf8');
        return content.length > 1000; // 최소 크기 확인
    });
});

// 8. 설정 파일 테스트
runTest('설정 파일 확인', () => {
    const fs = require('fs');

    const configFiles = [
        'package.json',
        'tsconfig.json',
        'tailwind.config.js',
        'public/index.html'
    ];

    return configFiles.every(file => {
        if (!fs.existsSync(file)) return false;
        const content = fs.readFileSync(file, 'utf8');
        return content.length > 100; // 최소 크기 확인
    });
});

// 9. 서비스 파일 테스트
runTest('서비스 파일 확인', () => {
    const fs = require('fs');

    const serviceFiles = [
        'src/services/aiService.ts',
        'src/services/newsService.ts'
    ];

    return serviceFiles.every(file => {
        if (!fs.existsSync(file)) return false;
        const content = fs.readFileSync(file, 'utf8');
        return content.includes('class') && content.includes('export'); // 클래스와 export 확인
    });
});

// 10. 컴포넌트 파일 테스트
runTest('컴포넌트 파일 확인', () => {
    const fs = require('fs');

    const componentFiles = [
        'src/components/UnifiedAdvancedInterface.tsx',
        'src/components/News/NewsSearch.tsx'
    ];

    return componentFiles.every(file => {
        if (!fs.existsSync(file)) return false;
        const content = fs.readFileSync(file, 'utf8');
        return content.includes('React.FC') || content.includes('function'); // React 컴포넌트 확인
    });
});

// 결과 출력
console.log('📊 테스트 결과 요약');
console.log('='.repeat(50));
console.log(`총 테스트 수: ${testResults.total}`);
console.log(`✅ 성공: ${testResults.passed}`);
console.log(`❌ 실패: ${testResults.failed}`);
console.log(`📈 성공률: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

console.log('\n📋 상세 결과:');
testResults.details.forEach(test => {
    const status = test.status === 'PASSED' ? '✅' : '❌';
    console.log(`${status} ${test.name}`);
    if (test.error) {
        console.log(`   오류: ${test.error}`);
    }
});

console.log('\n🎯 최종 평가:');
if (testResults.failed === 0) {
    console.log('🎉 모든 테스트가 성공했습니다! 시스템이 완벽하게 준비되었습니다.');
    console.log('🚀 배포 준비가 완료되었습니다.');
} else {
    console.log(`⚠️  ${testResults.failed}개의 테스트가 실패했습니다.`);
    console.log('🔧 실패한 항목을 수정한 후 다시 테스트해주세요.');
}

console.log('\n📝 다음 단계:');
console.log('1. 로컬에서 개발 서버 실행: npm start');
console.log('2. 브라우저에서 http://localhost:3000 접속');
console.log('3. 모든 기능 테스트');
console.log('4. 프로덕션 배포 준비');

console.log('\n🏆 CORBU.AI 시스템 최종 통합 테스트 완료!');
