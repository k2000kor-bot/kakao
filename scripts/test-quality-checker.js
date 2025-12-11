#!/usr/bin/env node
/**
 * 혁신적인 테스트 품질 체크 시스템
 * 테스트 커버리지, 품질, 성능을 종합적으로 분석
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const QUALITY_THRESHOLDS = {
  coverage: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80,
  },
  testCount: 200,
  testExecutionTime: 30000, // 30초
};

class TestQualityChecker {
  constructor() {
    this.results = {
      coverage: {},
      testMetrics: {},
      qualityScore: 0,
      recommendations: [],
    };
  }

  async run() {
    console.log('🔍 혁신적인 테스트 품질 분석 시작...\n');

    try {
      // 1. 테스트 실행 및 커버리지 측정
      await this.runTests();
      
      // 2. 커버리지 분석
      await this.analyzeCoverage();
      
      // 3. 테스트 메트릭 분석
      await this.analyzeTestMetrics();
      
      // 4. 품질 점수 계산
      this.calculateQualityScore();
      
      // 5. 개선 권장사항 생성
      this.generateRecommendations();
      
      // 6. 리포트 생성
      this.generateReport();
      
      console.log('\n✅ 테스트 품질 분석 완료!');
      console.log(`📊 종합 품질 점수: ${this.results.qualityScore.toFixed(1)}/100`);
      
      return this.results;
    } catch (error) {
      console.error('❌ 분석 실패:', error.message);
      process.exit(1);
    }
  }

  async runTests() {
    console.log('📊 테스트 실행 중...');
    const startTime = Date.now();
    
    try {
      execSync('npm test -- --coverage --watchAll=false --testPathIgnorePatterns="App.test" --coverageReporters=json-summary', {
        stdio: 'pipe',
        cwd: path.join(__dirname, '..'),
      });
      
      const executionTime = Date.now() - startTime;
      this.results.testMetrics.executionTime = executionTime;
      console.log(`⏱️  테스트 실행 시간: ${executionTime}ms`);
      
      // 커버리지 파일이 생성될 때까지 대기
      await this.waitForCoverageFile();
    } catch (error) {
      // 테스트 실패는 무시하고 계속 진행
      console.warn('⚠️  일부 테스트 실패 (계속 진행)');
      const executionTime = Date.now() - startTime;
      this.results.testMetrics.executionTime = executionTime;
    }
  }

  async waitForCoverageFile() {
    const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json');
    for (let i = 0; i < 10; i++) {
      if (fs.existsSync(coveragePath)) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  async analyzeCoverage() {
    const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json');
    
    if (!fs.existsSync(coveragePath)) {
      console.warn('⚠️  커버리지 파일을 찾을 수 없습니다. 기본값을 사용합니다.');
      this.results.coverage = {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
      };
      return;
    }

    const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    const total = coverage.total || {};

    this.results.coverage = {
      statements: total.statements?.pct || 0,
      branches: total.branches?.pct || 0,
      functions: total.functions?.pct || 0,
      lines: total.lines?.pct || 0,
    };

    console.log('\n📈 커버리지 분석:');
    console.log(`   Statements: ${this.results.coverage.statements.toFixed(2)}%`);
    console.log(`   Branches: ${this.results.coverage.branches.toFixed(2)}%`);
    console.log(`   Functions: ${this.results.coverage.functions.toFixed(2)}%`);
    console.log(`   Lines: ${this.results.coverage.lines.toFixed(2)}%`);
  }

  async analyzeTestMetrics() {
    // 테스트 파일 수 계산
    const testFiles = this.findTestFiles();
    this.results.testMetrics.testFileCount = testFiles.length;
    
    // 주요 파일 커버리지 확인
    const criticalFiles = this.findCriticalFiles();
    this.results.testMetrics.criticalFilesCoverage = criticalFiles;
    
    console.log(`\n📁 테스트 파일 수: ${testFiles.length}개`);
  }

  findTestFiles() {
    const testDir = path.join(__dirname, '../src');
    const testFiles = [];
    
    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.includes('node_modules')) {
          walkDir(filePath);
        } else if (file.includes('.test.') || file.includes('.spec.')) {
          testFiles.push(filePath);
        }
      });
    };
    
    walkDir(testDir);
    return testFiles;
  }

  findCriticalFiles() {
    const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json');
    if (!fs.existsSync(coveragePath)) return [];

    try {
      const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      const criticalPatterns = [
        'errorHandler',
        'errorLogger',
        'retryHandler',
        'chatGPTProjectService',
      ];

      return Object.keys(coverage)
        .filter(key => key !== 'total')
        .filter(key => criticalPatterns.some(pattern => key.includes(pattern)))
        .map(key => {
          const fileCoverage = coverage[key] || {};
          const avgCoverage = (
            (fileCoverage.statements?.pct || 0) +
            (fileCoverage.branches?.pct || 0) +
            (fileCoverage.functions?.pct || 0) +
            (fileCoverage.lines?.pct || 0)
          ) / 4;
          return {
            file: key,
            coverage: avgCoverage,
          };
        })
        .filter(f => f.coverage < 80);
    } catch (error) {
      console.warn('⚠️  커버리지 파일 파싱 실패:', error.message);
      return [];
    }
  }

  calculateQualityScore() {
    let score = 0;
    const weights = {
      coverage: 0.5,
      testCount: 0.2,
      executionTime: 0.1,
      criticalFiles: 0.2,
    };

    // 커버리지 점수
    const coverageScore = (
      (this.results.coverage.statements || 0) * 0.25 +
      (this.results.coverage.branches || 0) * 0.25 +
      (this.results.coverage.functions || 0) * 0.25 +
      (this.results.coverage.lines || 0) * 0.25
    );
    score += (coverageScore / 100) * 100 * weights.coverage;

    // 테스트 수 점수
    const testCountScore = Math.min((this.results.testMetrics.testFileCount || 0) / QUALITY_THRESHOLDS.testCount, 1) * 100;
    score += testCountScore * weights.testCount;

    // 실행 시간 점수
    const executionTime = this.results.testMetrics.executionTime || 0;
    const timeScore = executionTime < QUALITY_THRESHOLDS.testExecutionTime ? 100 : Math.max(0, 100 - (executionTime - QUALITY_THRESHOLDS.testExecutionTime) / 100);
    score += timeScore * weights.executionTime;

    // 중요 파일 커버리지 점수
    const criticalFiles = this.results.testMetrics.criticalFilesCoverage || [];
    const criticalScore = criticalFiles.length === 0 ? 100 : Math.max(0, 100 - criticalFiles.length * 10);
    score += criticalScore * weights.criticalFiles;

    this.results.qualityScore = Math.min(100, Math.max(0, score));
  }

  generateRecommendations() {
    const recommendations = [];

    // 커버리지 권장사항
    if (this.results.coverage.statements < QUALITY_THRESHOLDS.coverage.statements) {
      recommendations.push({
        priority: 'high',
        category: 'coverage',
        message: `Statements 커버리지를 ${QUALITY_THRESHOLDS.coverage.statements}% 이상으로 향상시키세요. (현재: ${this.results.coverage.statements.toFixed(2)}%)`,
      });
    }

    // 중요 파일 커버리지 권장사항
    const criticalFiles = this.results.testMetrics.criticalFilesCoverage || [];
    if (criticalFiles.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'critical-files',
        message: `${criticalFiles.length}개의 중요 파일의 커버리지가 80% 미만입니다.`,
        files: criticalFiles.map(f => f.file),
      });
    }

    // 테스트 수 권장사항
    if (this.results.testMetrics.testFileCount < QUALITY_THRESHOLDS.testCount) {
      recommendations.push({
        priority: 'medium',
        category: 'test-count',
        message: `테스트 파일 수를 늘려주세요. (현재: ${this.results.testMetrics.testFileCount}개, 목표: ${QUALITY_THRESHOLDS.testCount}개 이상)`,
      });
    }

    this.results.recommendations = recommendations;
  }

  generateReport() {
    const reportPath = path.join(__dirname, '../TEST_QUALITY_REPORT.md');
    const report = `# 🚀 테스트 품질 리포트

생성 시간: ${new Date().toLocaleString('ko-KR')}

## 📊 종합 품질 점수

**${this.results.qualityScore.toFixed(1)}/100** ${this.getQualityEmoji(this.results.qualityScore)}

## 📈 커버리지 현황

| 항목 | 커버리지 | 목표 | 상태 |
|------|----------|------|------|
| Statements | ${this.results.coverage.statements.toFixed(2)}% | ${QUALITY_THRESHOLDS.coverage.statements}% | ${this.getStatusEmoji(this.results.coverage.statements, QUALITY_THRESHOLDS.coverage.statements)} |
| Branches | ${this.results.coverage.branches.toFixed(2)}% | ${QUALITY_THRESHOLDS.coverage.branches}% | ${this.getStatusEmoji(this.results.coverage.branches, QUALITY_THRESHOLDS.coverage.branches)} |
| Functions | ${this.results.coverage.functions.toFixed(2)}% | ${QUALITY_THRESHOLDS.coverage.functions}% | ${this.getStatusEmoji(this.results.coverage.functions, QUALITY_THRESHOLDS.coverage.functions)} |
| Lines | ${this.results.coverage.lines.toFixed(2)}% | ${QUALITY_THRESHOLDS.coverage.lines}% | ${this.getStatusEmoji(this.results.coverage.lines, QUALITY_THRESHOLDS.coverage.lines)} |

## 📁 테스트 메트릭

- 테스트 파일 수: ${this.results.testMetrics.testFileCount}개
- 테스트 실행 시간: ${(this.results.testMetrics.executionTime / 1000).toFixed(2)}초
- 중요 파일 커버리지 부족: ${this.results.testMetrics.criticalFilesCoverage?.length || 0}개

## 🎯 개선 권장사항

${this.results.recommendations.length > 0 
  ? this.results.recommendations.map((rec, i) => 
    `${i + 1}. **${rec.priority === 'high' ? '🔴 높은 우선순위' : '🟡 중간 우선순위'}**: ${rec.message}`
  ).join('\n\n')
  : '✅ 모든 목표를 달성했습니다!'
}

## 📋 다음 단계

1. 우선순위가 높은 권장사항부터 개선
2. 커버리지 목표 달성
3. 테스트 실행 시간 최적화
4. 지속적인 모니터링
`;

    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`\n📄 품질 리포트 생성: ${reportPath}`);
  }

  getQualityEmoji(score) {
    if (score >= 90) return '🟢 우수';
    if (score >= 70) return '🟡 양호';
    if (score >= 50) return '🟠 개선 필요';
    return '🔴 개선 시급';
  }

  getStatusEmoji(value, threshold) {
    return value >= threshold ? '✅' : '⚠️';
  }
}

// 실행
if (require.main === module) {
  const checker = new TestQualityChecker();
  checker.run().catch(console.error);
}

module.exports = TestQualityChecker;

