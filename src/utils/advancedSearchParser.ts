/**
 * 고급 검색 파서
 * 정규식 검색, 부울 연산자 (AND, OR, NOT) 지원
 * 
 * Task-D3: 검색 고도화
 */

import { errorLogger } from './errorLogger';

export interface SearchQuery {
  type: 'simple' | 'regex' | 'boolean';
  query: string;
  regex?: RegExp;
  booleanTree?: BooleanNode;
}

export interface BooleanNode {
  operator: 'AND' | 'OR' | 'NOT';
  left?: BooleanNode | string;
  right?: BooleanNode | string;
  value?: string;
}

export interface SearchOptions {
  useRegex?: boolean;
  caseSensitive?: boolean;
}

class AdvancedSearchParser {
  /**
   * 검색어 파싱
   */
  parseQuery(query: string, options: SearchOptions = {}): SearchQuery {
    const trimmed = query.trim();
    
    if (!trimmed) {
      return { type: 'simple', query: '' };
    }

    // 부울 연산자 감지
    if (this.hasBooleanOperators(trimmed)) {
      return {
        type: 'boolean',
        query: trimmed,
        booleanTree: this.parseBooleanQuery(trimmed),
      };
    }

    // 정규식 감지 (슬래시로 감싸진 경우)
    if (options.useRegex || this.isRegexPattern(trimmed)) {
      const regexPattern = this.extractRegexPattern(trimmed);
      try {
        const flags = options.caseSensitive ? 'g' : 'gi';
        const regex = new RegExp(regexPattern, flags);
        return {
          type: 'regex',
          query: trimmed,
          regex,
        };
      } catch (error) {
        // 정규식 오류 시 일반 검색으로 폴백
        errorLogger.warn('정규식 파싱 실패, 일반 검색으로 전환', { component: 'advancedSearchParser', action: 'parseQuery', error: error instanceof Error ? error.message : String(error) });
        return { type: 'simple', query: trimmed };
      }
    }

    // 일반 검색
    return { type: 'simple', query: trimmed };
  }

  /**
   * 부울 연산자 포함 여부 확인
   */
  private hasBooleanOperators(query: string): boolean {
    // AND, OR, NOT 키워드 확인 (대소문자 구분 없음)
    const booleanPattern = /\b(AND|OR|NOT)\b/i;
    return booleanPattern.test(query);
  }

  /**
   * 정규식 패턴인지 확인
   */
  private isRegexPattern(query: string): boolean {
    // 슬래시로 시작하고 끝나는 경우
    return query.startsWith('/') && query.endsWith('/') && query.length > 2;
  }

  /**
   * 정규식 패턴 추출
   */
  private extractRegexPattern(query: string): string {
    if (query.startsWith('/') && query.endsWith('/')) {
      return query.slice(1, -1);
    }
    return query;
  }

  /**
   * 부울 쿼리 파싱
   */
  private parseBooleanQuery(query: string): BooleanNode {
    // 공백으로 분리하되, 따옴표로 감싸진 부분은 유지
    const tokens = this.tokenize(query);
    return this.buildBooleanTree(tokens);
  }

  /**
   * 쿼리를 토큰으로 분리
   */
  private tokenize(query: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < query.length; i++) {
      const char = query[i];
      const nextChar = query[i + 1];

      // 따옴표 처리
      if ((char === '"' || char === "'") && (i === 0 || query[i - 1] === ' ' || query[i - 1] === '(')) {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
          continue;
        } else if (char === quoteChar) {
          inQuotes = false;
          quoteChar = '';
          if (current.trim()) {
            tokens.push(current.trim());
            current = '';
          }
          continue;
        }
      }

      if (inQuotes) {
        current += char;
        continue;
      }

      // 연산자 감지
      if (char === ' ' && (nextChar === ' ' || i === query.length - 1)) {
        if (current.trim()) {
          tokens.push(current.trim());
          current = '';
        }
        continue;
      }

      // AND, OR, NOT 키워드
      const remaining = query.substring(i);
      const andMatch = remaining.match(/^\s*AND\s+/i);
      const orMatch = remaining.match(/^\s*OR\s+/i);
      const notMatch = remaining.match(/^\s*NOT\s+/i);

      if (andMatch) {
        if (current.trim()) {
          tokens.push(current.trim());
          current = '';
        }
        tokens.push('AND');
        i += andMatch[0].length - 1;
        continue;
      } else if (orMatch) {
        if (current.trim()) {
          tokens.push(current.trim());
          current = '';
        }
        tokens.push('OR');
        i += orMatch[0].length - 1;
        continue;
      } else if (notMatch) {
        if (current.trim()) {
          tokens.push(current.trim());
          current = '';
        }
        tokens.push('NOT');
        i += notMatch[0].length - 1;
        continue;
      }

      current += char;
    }

    if (current.trim()) {
      tokens.push(current.trim());
    }

    return tokens.filter(t => t.length > 0);
  }

  /**
   * 부울 트리 구축
   */
  private buildBooleanTree(tokens: string[]): BooleanNode {
    // NOT 우선 처리
    let processedTokens: (string | BooleanNode)[] = [];
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].toUpperCase() === 'NOT') {
        if (i + 1 < tokens.length) {
          processedTokens.push({
            operator: 'NOT',
            value: tokens[i + 1],
          });
          i++; // 다음 토큰 건너뛰기
        }
      } else {
        processedTokens.push(tokens[i]);
      }
    }

    // AND 우선 처리
    let andProcessed: (string | BooleanNode)[] = [];
    for (let i = 0; i < processedTokens.length; i++) {
      const token = processedTokens[i];
      if (typeof token === 'string' && token.toUpperCase() === 'AND') {
        if (i > 0 && i + 1 < processedTokens.length) {
          const left = andProcessed[andProcessed.length - 1];
          const right = processedTokens[i + 1];
          andProcessed[andProcessed.length - 1] = {
            operator: 'AND',
            left: typeof left === 'string' ? left : left,
            right: typeof right === 'string' ? right : right,
          };
          i++; // 다음 토큰 건너뛰기
        }
      } else {
        andProcessed.push(token);
      }
    }

    // OR 처리
    let result: BooleanNode | string = andProcessed[0];
    for (let i = 1; i < andProcessed.length; i++) {
      const token = andProcessed[i];
      if (typeof token === 'string' && token.toUpperCase() === 'OR') {
        if (i + 1 < andProcessed.length) {
          const right = andProcessed[i + 1];
          result = {
            operator: 'OR',
            left: result,
            right: typeof right === 'string' ? right : right,
          };
          i++; // 다음 토큰 건너뛰기
        }
      }
    }

    // 최종 결과가 문자열인 경우 래핑
    if (typeof result === 'string') {
      return { operator: 'AND', value: result };
    }

    return result;
  }

  /**
   * 텍스트가 검색 쿼리와 일치하는지 확인
   */
  matches(text: string, searchQuery: SearchQuery): boolean {
    if (!searchQuery.query) return true;

    switch (searchQuery.type) {
      case 'simple':
        return text.toLowerCase().includes(searchQuery.query.toLowerCase());

      case 'regex':
        if (searchQuery.regex) {
          return searchQuery.regex.test(text);
        }
        return false;

      case 'boolean':
        if (searchQuery.booleanTree) {
          return this.evaluateBooleanTree(text, searchQuery.booleanTree);
        }
        return false;

      default:
        return false;
    }
  }

  /**
   * 부울 트리 평가
   */
  private evaluateBooleanTree(text: string, node: BooleanNode): boolean {
    const lowerText = text.toLowerCase();

    // 리프 노드 (값만 있는 경우)
    if (node.value) {
      return lowerText.includes(node.value.toLowerCase());
    }

    // 단항 연산자 (NOT)
    if (node.operator === 'NOT') {
      if (typeof node.left === 'string') {
        return !lowerText.includes(node.left.toLowerCase());
      } else if (node.left) {
        return !this.evaluateBooleanTree(text, node.left);
      }
      return false;
    }

    // 이항 연산자 (AND, OR)
    let leftResult = false;
    let rightResult = false;

    if (typeof node.left === 'string') {
      leftResult = lowerText.includes(node.left.toLowerCase());
    } else if (node.left) {
      leftResult = this.evaluateBooleanTree(text, node.left);
    }

    if (typeof node.right === 'string') {
      rightResult = lowerText.includes(node.right.toLowerCase());
    } else if (node.right) {
      rightResult = this.evaluateBooleanTree(text, node.right);
    }

    if (node.operator === 'AND') {
      return leftResult && rightResult;
    } else if (node.operator === 'OR') {
      return leftResult || rightResult;
    }

    return false;
  }

  /**
   * 검색어 하이라이팅을 위한 매치 위치 찾기
   */
  findMatches(text: string, searchQuery: SearchQuery): Array<{ start: number; end: number }> {
    const matches: Array<{ start: number; end: number }> = [];

    if (!searchQuery.query) return matches;

    switch (searchQuery.type) {
      case 'simple':
        const lowerText = text.toLowerCase();
        const lowerQuery = searchQuery.query.toLowerCase();
        let index = 0;
        while ((index = lowerText.indexOf(lowerQuery, index)) !== -1) {
          matches.push({
            start: index,
            end: index + searchQuery.query.length,
          });
          index += searchQuery.query.length;
        }
        break;

      case 'regex':
        if (searchQuery.regex) {
          const regex = new RegExp(searchQuery.regex.source, searchQuery.regex.flags);
          let match;
          while ((match = regex.exec(text)) !== null) {
            matches.push({
              start: match.index,
              end: match.index + match[0].length,
            });
            // 무한 루프 방지
            if (regex.lastIndex === match.index) {
              regex.lastIndex++;
            }
          }
        }
        break;

      case 'boolean':
        // 부울 쿼리의 경우 모든 키워드 찾기
        if (searchQuery.booleanTree) {
          const keywords = this.extractKeywords(searchQuery.booleanTree);
          keywords.forEach(keyword => {
            const lowerText = text.toLowerCase();
            const lowerKeyword = keyword.toLowerCase();
            let index = 0;
            while ((index = lowerText.indexOf(lowerKeyword, index)) !== -1) {
              matches.push({
                start: index,
                end: index + keyword.length,
              });
              index += keyword.length;
            }
          });
        }
        break;
    }

    return matches;
  }

  /**
   * 부울 트리에서 키워드 추출
   */
  private extractKeywords(node: BooleanNode): string[] {
    const keywords: string[] = [];

    if (node.value) {
      keywords.push(node.value);
    }

    if (typeof node.left === 'string') {
      keywords.push(node.left);
    } else if (node.left) {
      keywords.push(...this.extractKeywords(node.left));
    }

    if (typeof node.right === 'string') {
      keywords.push(node.right);
    } else if (node.right) {
      keywords.push(...this.extractKeywords(node.right));
    }

    return keywords;
  }
}

// 싱글톤 인스턴스
const advancedSearchParser = new AdvancedSearchParser();

export default advancedSearchParser;

