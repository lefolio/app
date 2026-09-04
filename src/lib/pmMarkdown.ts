import MarkdownIt from 'markdown-it';
import { Schema, type Node as PMNode } from 'prosemirror-model';
import {
  MarkdownParser,
  MarkdownSerializer,
  defaultMarkdownParser,
  defaultMarkdownSerializer,
  schema as markdownSchema,
} from 'prosemirror-markdown';

function fenceLabel(info: string) {
  return info ? `::: ${info}` : ':::';
}

function infoFromFenceText(text: string) {
  const match = text.trim().match(/^:::\s*(.*)$/);
  if (!match) return '';
  return match[1].trim();
}

/** Lefolio `:::` lines as editable textblocks (cursor, not node selection). */
export const editorSchema = new Schema({
  nodes: markdownSchema.spec.nodes.addBefore('paragraph', 'lefolio_fence', {
    content: 'text*',
    group: 'block',
    attrs: {
      info: { default: '' },
    },
    parseDOM: [
      {
        tag: 'div[data-lefolio-fence]',
        getAttrs: (dom) => ({
          info: (dom as HTMLElement).getAttribute('data-info') || '',
        }),
      },
    ],
    toDOM(node) {
      return [
        'div',
        {
          'data-lefolio-fence': '',
          'data-info': node.attrs.info || '',
          class: 'lf-fence-node',
        },
        0,
      ];
    },
  }),
  marks: markdownSchema.spec.marks,
});

function lefolioFencePlugin(md: MarkdownIt) {
  md.block.ruler.before(
    'fence',
    'lefolio_fence',
    (state, startLine, _endLine, silent) => {
      const pos = state.bMarks[startLine] + state.tShift[startLine];
      const max = state.eMarks[startLine];
      if (pos + 3 > max) return false;
      if (state.src.slice(pos, pos + 3) !== ':::') return false;

      // Only treat a full-line fence (::: or ::: name), not :::inline:::
      const info = state.src.slice(pos + 3, max).trim();
      if (info.includes(':::')) return false;

      if (silent) return true;

      const token = state.push('lefolio_fence', 'div', 0);
      token.info = info;
      token.map = [startLine, startLine + 1];
      token.markup = ':::';
      state.line = startLine + 1;
      return true;
    },
    { alt: ['paragraph', 'reference', 'blockquote', 'list'] },
  );
}

const tokenizer = MarkdownIt('commonmark', { html: false });
lefolioFencePlugin(tokenizer);

export const markdownParser = new MarkdownParser(editorSchema, tokenizer, {
  ...defaultMarkdownParser.tokens,
  lefolio_fence: {
    node: 'lefolio_fence',
    getAttrs: (tok) => ({ info: tok.info || '' }),
  },
});

export const markdownSerializer = new MarkdownSerializer(
  {
    ...defaultMarkdownSerializer.nodes,
    lefolio_fence(state, node) {
      const text = node.textContent.trim();
      state.write(text || fenceLabel(node.attrs.info || ''));
      state.closeBlock(node);
    },
  },
  defaultMarkdownSerializer.marks,
);

/** Parser creates empty fence nodes; fill them with visible `:::` text. */
function hydrateFenceText(doc: PMNode): PMNode {
  const children: PMNode[] = [];
  doc.forEach((node) => {
    if (node.type.name !== 'lefolio_fence') {
      children.push(node);
      return;
    }
    const info = node.attrs.info || infoFromFenceText(node.textContent);
    const label = fenceLabel(info);
    children.push(
      editorSchema.node(
        'lefolio_fence',
        { info },
        label ? [editorSchema.text(label)] : [],
      ),
    );
  });
  return editorSchema.node('doc', null, children);
}

export function parseMarkdown(markdown: string) {
  try {
    const parsed =
      markdownParser.parse(markdown) ??
      editorSchema.node('doc', null, [editorSchema.node('paragraph')]);
    return hydrateFenceText(parsed);
  } catch {
    return editorSchema.node('doc', null, [editorSchema.node('paragraph')]);
  }
}

export function serializeMarkdown(doc: Parameters<typeof markdownSerializer.serialize>[0]) {
  return markdownSerializer.serialize(doc);
}
