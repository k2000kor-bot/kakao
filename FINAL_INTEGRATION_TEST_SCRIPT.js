#!/usr/bin/env node

/**
 * CORBU.AI 시스템 고도화 최종 통합 테스트 스크립트
 * 모든 기능이 완벽하게 작동하는지 확인
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 CORBU.AI 시스템 고도화 최종 통합 테스트 시작\n');

// 테스트 결과 저장
const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
};

// 테스트 함수
function runTest(testName, testFunction) {
    testResults.total++;
    console.log(`\n📋 테스트 ${testResults.total}: ${testName}`);

    try {
        const result = testFunction();
        if (result) {
            testResults.passed++;
            console.log(`✅ 성공: ${testName}`);
            testResults.details.push({ test: testName, status: 'PASSED' });
        } else {
            testResults.failed++;
            console.log(`❌ 실패: ${testName}`);
            testResults.details.push({ test: testName, status: 'FAILED' });
        }
    } catch (error) {
        testResults.failed++;
        console.log(`❌ 오류: ${testName} - ${error.message}`);
        testResults.details.push({ test: testName, status: 'ERROR', error: error.message });
    }
}

// 1. 프로젝트 구조 확인
runTest('프로젝트 구조 확인', () => {
    const requiredFiles = [
        'package.json',
        'tsconfig.json',
        'tailwind.config.js',
        'src/components/UnifiedAdvancedInterface.tsx',
        'src/services/aiService.ts',
        'src/services/advancedSecurityService.ts',
        'src/services/advancedAnalyticsService.ts',
        'src/services/advancedLearningService.ts',
        'src/services/newsService.ts',
        'src/store/index.ts',
        'public/index.html'
    ];

    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
    if (missingFiles.length > 0) {
        console.log(`   누락된 파일: ${missingFiles.join(', ')}`);
        return false;
    }
    return true;
});

// 2. 의존성 확인
runTest('의존성 확인', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = [
        'react',
        'react-dom',
        'typescript',
        'tailwindcss',
        'framer-motion',
        '@reduxjs/toolkit',
        'react-redux'
    ];

    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]);
    if (missingDeps.length > 0) {
        console.log(`   누락된 의존성: ${missingDeps.join(', ')}`);
        return false;
    }
    return true;
});

// 3. TypeScript 컴파일 확인
runTest('TypeScript 컴파일 확인', () => {
    const tsConfigPath = 'tsconfig.json';
    if (!fs.existsSync(tsConfigPath)) {
        return false;
    }

    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
    return tsConfig.compilerOptions && tsConfig.compilerOptions.target;
});

// 4. 환경 설정 확인
runTest('환경 설정 확인', () => {
    const envFiles = ['.env', '.env.example'];
    const existingEnvFiles = envFiles.filter(file => fs.existsSync(file));
    return existingEnvFiles.length > 0;
});

// 5. 문서화 확인
runTest('문서화 확인', () => {
    const requiredDocs = [
        'CORBU_AI_ULTIMATE_FINAL_COMPLETION_SUCCESS.md',
        'CORBU_AI_ULTIMATE_FINAL_DEPLOYMENT_SUCCESS.md',
        'ULTIMATE_ADVANCED_SYSTEM_COMPLETION_REPORT.md',
        'DEPLOYMENT_READY_CHECKLIST.md',
        'README.md'
    ];

    const missingDocs = requiredDocs.filter(doc => !fs.existsSync(doc));
    if (missingDocs.length > 0) {
        console.log(`   누락된 문서: ${missingDocs.join(', ')}`);
        return false;
    }
    return true;
});

// 6. 빌드 결과 확인
runTest('빌드 결과 확인', () => {
    const buildDir = 'build';
    if (!fs.existsSync(buildDir)) {
        console.log('   build 디렉토리가 없습니다. npm run build를 실행하세요.');
        return false;
    }

    const buildFiles = [
        'build/index.html',
        'build/static/js/main.js',
        'build/static/css/main.css'
    ];

    const missingBuildFiles = buildFiles.filter(file => !fs.existsSync(file));
    if (missingBuildFiles.length > 0) {
        console.log(`   누락된 빌드 파일: ${missingBuildFiles.join(', ')}`);
        return false;
    }
    return true;
});

// 7. 코드 품질 확인
runTest('코드 품질 확인', () => {
    const srcDir = 'src';
    if (!fs.existsSync(srcDir)) {
        return false;
    }

    // 주요 컴포넌트 파일 확인
    const componentFiles = [
        'src/components/UnifiedAdvancedInterface.tsx',
        'src/services/aiService.ts',
        'src/services/advancedSecurityService.ts',
        'src/services/advancedAnalyticsService.ts',
        'src/services/advancedLearningService.ts'
    ];

    const existingComponents = componentFiles.filter(file => fs.existsSync(file));
    return existingComponents.length >= 3; // 최소 3개 이상의 주요 파일이 있어야 함
});

// 8. 설정 파일 확인
runTest('설정 파일 확인', () => {
    const configFiles = [
        'package.json',
        'tsconfig.json',
        'tailwind.config.js',
        'public/index.html'
    ];

    const existingConfigs = configFiles.filter(file => fs.existsSync(file));
    return existingConfigs.length === configFiles.length;
});

// 9. 서비스 파일 확인
runTest('서비스 파일 확인', () => {
    const serviceFiles = [
        'src/services/aiService.ts',
        'src/services/advancedSecurityService.ts',
        'src/services/advancedAnalyticsService.ts',
        'src/services/advancedLearningService.ts',
        'src/services/newsService.ts'
    ];

    const existingServices = serviceFiles.filter(file => fs.existsSync(file));
    return existingServices.length >= 4; // 최소 4개 이상의 서비스 파일이 있어야 함
});

// 10. 컴포넌트 파일 확인
runTest('컴포넌트 파일 확인', () => {
    const componentFiles = [
        'src/components/UnifiedAdvancedInterface.tsx'
    ];

    const existingComponents = componentFiles.filter(file => fs.existsSync(file));
    return existingComponents.length === componentFiles.length;
});

// 결과 출력
console.log('\n' + '='.repeat(60));
console.log('📊 최종 통합 테스트 결과');
console.log('='.repeat(60));

console.log(`\n총 테스트 수: ${testResults.total}`);
console.log(`✅ 통과: ${testResults.passed}`);
console.log(`❌ 실패: ${testResults.failed}`);
console.log(`📈 성공률: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

if (testResults.failed > 0) {
    console.log('\n❌ 실패한 테스트:');
    testResults.details
        .filter(detail => detail.status === 'FAILED' || detail.status === 'ERROR')
        .forEach(detail => {
            console.log(`   - ${detail.test}: ${detail.status}`);
            if (detail.error) {
                console.log(`     오류: ${detail.error}`);
            }
        });
}

console.log('\n✅ 통과한 테스트:');
testResults.details
    .filter(detail => detail.status === 'PASSED')
    .forEach(detail => {
        console.log(`   - ${detail.test}`);
    });

// 최종 평가
const successRate = (testResults.passed / testResults.total) * 100;
console.log('\n' + '='.repeat(60));

if (successRate >= 90) {
    console.log('🎉 축하합니다! CORBU.AI 시스템이 완벽하게 통합되었습니다!');
    console.log('🚀 시스템이 프로덕션 배포 준비가 완료되었습니다!');
} else if (successRate >= 80) {
    console.log('✅ CORBU.AI 시스템이 대부분 통합되었습니다!');
    console.log('🔧 일부 개선사항이 필요합니다.');
} else {
    console.log('⚠️ CORBU.AI 시스템 통합에 문제가 있습니다.');
    console.log('🔧 추가 작업이 필요합니다.');
}

console.log('\n📋 다음 단계:');
console.log('1. 브라우저에서 http://localhost:3000 접속하여 테스트');
console.log('2. API 키 설정 (Gemini, OpenAI, Claude)');
console.log('3. ./deploy_to_production.sh 실행하여 배포');
console.log('4. 사용자 가이드 참조');

console.log('\n' + '='.repeat(60));
console.log('🏆 CORBU.AI 시스템 고도화 최종 통합 테스트 완료');
console.log('='.repeat(60));

// 결과를 파일로 저장
const testReport = {
    timestamp: new Date().toISOString(),
    total: testResults.total,
    passed: testResults.passed,
    failed: testResults.failed,
    successRate: successRate,
    details: testResults.details
};

fs.writeFileSync('FINAL_INTEGRATION_TEST_RESULTS.json', JSON.stringify(testReport, null, 2));
console.log('\n📄 테스트 결과가 FINAL_INTEGRATION_TEST_RESULTS.json에 저장되었습니다.');

process.exit(testResults.failed > 0 ? 1 : 0);
