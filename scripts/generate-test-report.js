#!/usr/bin/env node
/**
 * 테스트 커버리지 리포트 생성 및 분석 스크립트
 * 혁신적인 테스트 인사이트 제공
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPORT_DIR = path.join(__dirname, '../coverage');
const HTML_REPORT_DIR = path.join(REPORT_DIR, 'lcov-report');

console.log('🚀 혁신적인 테스트 커버리지 리포트 생성 중...\n');

try {
  // 테스트 커버리지 실행
  console.log('📊 테스트 커버리지 측정 중...');
  execSync('npm test -- --coverage --watchAll=false --testPathIgnorePatterns="App.test"', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });

  // 커버리지 데이터 읽기
  const coverageSummaryPath = path.join(REPORT_DIR, 'coverage-summary.json');
  if (fs.existsSync(coverageSummaryPath)) {
    const coverage = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
    
    // 커버리지 분석
    const analysis = analyzeCoverage(coverage);
    
    // 리포트 생성
    generateReport(analysis, coverage);
    
    console.log('\n✅ 테스트 커버리지 리포트 생성 완료!');
    console.log(`📁 리포트 위치: ${HTML_REPORT_DIR}/index.html`);
    console.log(`\n📈 주요 지표:`);
    console.log(`   전체 커버리지: ${analysis.total.percentage}%`);
    console.log(`   Statements: ${analysis.total.statements}%`);
    console.log(`   Branches: ${analysis.total.branches}%`);
    console.log(`   Functions: ${analysis.total.functions}%`);
    console.log(`   Lines: ${analysis.total.lines}%`);
  }
} catch (error) {
  console.error('❌ 리포트 생성 실패:', error.message);
  process.exit(1);
}

function analyzeCoverage(coverage) {
  const total = coverage.total;
  const files = Object.keys(coverage).filter(key => key !== 'total');
  
  // 파일별 커버리지 분석
  const fileAnalysis = files.map(file => ({
    file,
    statements: coverage[file].statements.pct,
    branches: coverage[file].branches.pct,
    functions: coverage[file].functions.pct,
    lines: coverage[file].lines.pct,
    total: (
      coverage[file].statements.pct +
      coverage[file].branches.pct +
      coverage[file].functions.pct +
      coverage[file].lines.pct
    ) / 4,
  })).sort((a, b) => b.total - a.total);

  // 우선순위 파일 (커버리지가 낮은 중요 파일)
  const priorityFiles = fileAnalysis
    .filter(f => f.total < 50 && !f.file.includes('node_modules'))
    .slice(0, 10);

  return {
    total: {
      statements: total.statements.pct,
      branches: total.branches.pct,
      functions: total.functions.pct,
      lines: total.lines.pct,
      percentage: (total.statements.pct + total.branches.pct + total.functions.pct + total.lines.pct) / 4,
    },
    fileAnalysis,
    priorityFiles,
    highCoverage: fileAnalysis.filter(f => f.total >= 80).length,
    mediumCoverage: fileAnalysis.filter(f => f.total >= 50 && f.total < 80).length,
    lowCoverage: fileAnalysis.filter(f => f.total < 50).length,
  };
}

function generateReport(analysis, coverage) {
  const reportPath = path.join(__dirname, '../TEST_COVERAGE_REPORT.md');
  const report = `# 테스트 커버리지 리포트

생성 시간: ${new Date().toLocaleString('ko-KR')}

## 📊 전체 커버리지

| 항목 | 커버리지 |
|------|----------|
| Statements | ${analysis.total.statements.toFixed(2)}% |
| Branches | ${analysis.total.branches.toFixed(2)}% |
| Functions | ${analysis.total.functions.toFixed(2)}% |
| Lines | ${analysis.total.lines.toFixed(2)}% |
| **평균** | **${analysis.total.percentage.toFixed(2)}%** |

## 📈 커버리지 분포

- 🟢 높은 커버리지 (80% 이상): ${analysis.highCoverage}개 파일
- 🟡 중간 커버리지 (50-79%): ${analysis.mediumCoverage}개 파일
- 🔴 낮은 커버리지 (50% 미만): ${analysis.lowCoverage}개 파일

## 🎯 우선순위 개선 파일 (Top 10)

다음 파일들의 테스트 커버리지를 개선하면 전체 품질이 크게 향상됩니다:

${analysis.priorityFiles.map((f, i) => 
  `${i + 1}. **${f.file}** - ${f.total.toFixed(2)}%`
).join('\n')}

## 📋 상세 리포트

전체 상세 리포트는 다음 위치에서 확인할 수 있습니다:
\`\`\`
${HTML_REPORT_DIR}/index.html
\`\`\`

## 🚀 다음 단계

1. 우선순위 파일에 대한 테스트 작성
2. 커버리지 80% 이상 목표 달성
3. 지속적인 테스트 커버리지 모니터링
`;

  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`\n📄 마크다운 리포트 생성: ${reportPath}`);
}

