/**
 * rehypeHighlightSearch 플러그인 테스트
 * 검색어 하이라이트(마크) 적용 검증
 * unist-util-visit는 ESM이라 Jest에서 모킹(동일 동작 구현)
 */
import type { Root, Text, Element } from 'hast';

jest.mock('unist-util-visit', () => ({
  visit(
    tree: { children?: Array<{ type?: string; value?: string; children?: unknown[] }> },
    _test: string,
    fn: (node: Text, index: number, parent: Element | Root) => void
  ) {
    function walk(node: unknown, index: number, parent: Element | Root): void {
      if (!node || typeof node !== 'object') return;
      const n = node as { type?: string; children?: unknown[] };
      if (n.type === 'text') {
        fn(node as Text, index, parent);
        return;
      }
      if (Array.isArray(n.children)) {
        n.children.forEach((child, i) => walk(child, i, n as Element | Root));
      }
    }
    tree.children?.forEach((child, i) => walk(child, i, tree as Root));
  },
}));

// mock 적용 후 로드해야 하므로 import 순서 유지
// eslint-disable-next-line import/first
import { rehypeHighlightSearch } from '../rehypeHighlightSearch';

function createTextNode(value: string): Text {
  return { type: 'text', value };
}

function createElement(tagName: string, children: (Text | Element)[]): Element {
  return { type: 'element', tagName, properties: {}, children };
}

describe('rehypeHighlightSearch', () => {
  describe('빈/무효 검색어', () => {
    it('searchTerm이 비어 있으면 no-op 함수를 반환해야 함', () => {
      const transform = rehypeHighlightSearch({ searchTerm: '' });
      expect(typeof transform).toBe('function');
      const tree: Root = { type: 'root', children: [{ type: 'text', value: 'hello' }] };
      const before = JSON.stringify(tree);
      transform(tree);
      expect(JSON.stringify(tree)).toBe(before);
    });

    it('searchTerm이 공백만 있으면 no-op 함수를 반환해야 함', () => {
      const transform = rehypeHighlightSearch({ searchTerm: '   ' });
      const tree: Root = { type: 'root', children: [createTextNode('hello')] };
      const before = JSON.stringify(tree);
      transform(tree);
      expect(JSON.stringify(tree)).toBe(before);
    });

    it('searchTerm이 없으면 no-op 함수를 반환해야 함', () => {
      const transform = rehypeHighlightSearch({ searchTerm: '' });
      expect(transform).toBeDefined();
    });
  });

  describe('텍스트 노드 하이라이트', () => {
    it('일치하는 텍스트를 <mark>로 감싸야 함', () => {
      const tree: Root = {
        type: 'root',
        children: [
          createElement('p', [createTextNode('Hello World')]),
        ],
      };
      const transform = rehypeHighlightSearch({ searchTerm: 'World' });
      transform(tree);

      const p = tree.children[0] as Element;
      expect(p.children).toHaveLength(2);
      expect(p.children[0]).toEqual({ type: 'text', value: 'Hello ' });
      const mark = p.children[1] as Element;
      expect(mark.type).toBe('element');
      expect(mark.tagName).toBe('mark');
      expect((mark.properties as { className?: string }).className).toBe('search-highlight');
      expect(mark.children).toHaveLength(1);
      expect((mark.children[0] as Text).value).toBe('World');
    });

    it('대소문자 구분 없이 매칭해야 함 (gi 플래그)', () => {
      const tree: Root = {
        type: 'root',
        children: [
          createElement('p', [createTextNode('REACT react React')]),
        ],
      };
      const transform = rehypeHighlightSearch({ searchTerm: 'react' });
      transform(tree);

      const p = tree.children[0] as Element;
      expect(p.children.length).toBeGreaterThan(1);
      const marks = p.children.filter((n): n is Element => (n as Element).type === 'element' && (n as Element).tagName === 'mark');
      expect(marks.length).toBe(3);
    });

    it('검색어에 정규식 특수문자가 있으면 이스케이프해서 매칭해야 함', () => {
      const tree: Root = {
        type: 'root',
        children: [
          createElement('p', [createTextNode('(test) [value]')]),
        ],
      };
      const transform = rehypeHighlightSearch({ searchTerm: '(test)' });
      transform(tree);

      const p = tree.children[0] as Element;
      const mark = p.children[0] as Element;
      expect(mark.tagName).toBe('mark');
      expect((mark.children[0] as Text).value).toBe('(test)');
    });
  });
});
