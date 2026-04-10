/**
 * Rehype plugin to highlight search terms in text nodes.
 * Wraps matching text in <mark> elements.
 */
import type { Root, Text, Element } from 'hast';
import { visit } from 'unist-util-visit';
import { coerceTrimmedString } from './chatInputUtils';

export interface RehypeHighlightSearchOptions {
  searchTerm: string;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function rehypeHighlightSearch(options: RehypeHighlightSearchOptions) {
  const { searchTerm } = options;
  const term = typeof searchTerm === 'string' ? coerceTrimmedString(searchTerm, '') : '';
  if (!term) {
    return (_tree: Root) => {
      /* no-op */
    };
  }

  const escaped = escapeRegex(term);
  const regex = new RegExp(`(${escaped})`, 'gi');

  return (tree: Root) => {
    const toReplace: Array<{ parent: Element | Root; index: number; node: Text }> = [];

    const searchLower = term.toLowerCase();
    visit(tree, 'text', (node: Text, index, parent) => {
      if (index === undefined || !parent || node.type !== 'text' || !node.value) return;
      if (!String(node.value).toLowerCase().includes(searchLower)) return;
      toReplace.push({ parent: parent as Element | Root, index, node });
    });

    // Replace from highest index first to preserve indices
    toReplace
      .sort((a, b) => b.index - a.index)
      .forEach(({ parent, index, node }) => {
      const parts = node.value.split(regex);
      const newNodes: (Text | Element)[] = [];

      parts.forEach((part) => {
        if (!part) return;
        const testRegex = new RegExp(`^${escaped}$`, 'i');
        if (testRegex.test(part)) {
          newNodes.push({
            type: 'element',
            tagName: 'mark',
            properties: { className: 'search-highlight' },
            children: [{ type: 'text', value: part }],
          } as Element);
        } else {
          newNodes.push({ type: 'text', value: part } as Text);
        }
      });

      const children = parent.children as (Text | Element)[];
      children.splice(index, 1, ...newNodes);
    });
  };
}
