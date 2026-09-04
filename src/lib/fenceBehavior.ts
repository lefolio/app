import { keymap } from 'prosemirror-keymap';
import { Plugin, TextSelection } from 'prosemirror-state';
import type { EditorState, Transaction } from 'prosemirror-state';
import { editorSchema } from '@/lib/pmMarkdown';

function isFenceLine(text: string) {
  return /^:::/.test(text.trim());
}

function infoFromFenceText(text: string) {
  const match = text.trim().match(/^:::\s*(.*)$/);
  return match ? match[1].trim() : '';
}

/** Enter inside a fence creates a normal paragraph (does not keep fence styling). */
function exitFence(state: EditorState, dispatch?: (tr: Transaction) => void) {
  const { $from, empty } = state.selection;
  if (!empty || $from.parent.type.name !== 'lefolio_fence') return false;

  const paragraph = editorSchema.nodes.paragraph;
  if (!paragraph) return false;

  if (dispatch) {
    const atEnd = $from.parentOffset >= $from.parent.content.size;
    if (atEnd) {
      const pos = $from.after();
      const tr = state.tr.insert(pos, paragraph.create());
      tr.setSelection(TextSelection.near(tr.doc.resolve(pos + 1), 1));
      dispatch(tr.scrollIntoView());
    } else {
      const splitPos = $from.pos;
      let tr = state.tr.split(splitPos);
      const afterStart = splitPos + 1;
      const $after = tr.doc.resolve(afterStart);
      const afterNode = $after.parent;
      if (afterNode.type.name === 'lefolio_fence') {
        const blockStart = $after.before();
        tr = tr.setBlockType(
          blockStart + 1,
          blockStart + afterNode.nodeSize - 1,
          paragraph,
        );
      }
      tr.setSelection(TextSelection.near(tr.doc.resolve(afterStart + 1), 1));
      dispatch(tr.scrollIntoView());
    }
  }
  return true;
}

/**
 * Promote paragraphs that look like `:::` fences, and demote fence blocks
 * that no longer do — so accent styling tracks the text.
 */
function normalizeFenceBlocks() {
  return new Plugin({
    appendTransaction(transactions, _oldState, newState) {
      if (!transactions.some((tr) => tr.docChanged)) return null;

      const paragraph = editorSchema.nodes.paragraph;
      const fence = editorSchema.nodes.lefolio_fence;
      if (!paragraph || !fence) return null;

      type Change =
        | { kind: 'to-fence'; from: number; to: number; info: string }
        | { kind: 'to-paragraph'; from: number; to: number }
        | { kind: 'set-info'; pos: number; info: string };

      const changes: Change[] = [];

      newState.doc.forEach((node, offset) => {
        const text = node.textContent;
        const from = offset + 1;
        const to = offset + node.nodeSize - 1;

        if (node.type.name === 'paragraph' && isFenceLine(text)) {
          changes.push({
            kind: 'to-fence',
            from,
            to,
            info: infoFromFenceText(text),
          });
          return;
        }

        if (node.type.name !== 'lefolio_fence') return;

        if (!isFenceLine(text)) {
          changes.push({ kind: 'to-paragraph', from, to });
          return;
        }

        const info = infoFromFenceText(text);
        if (info !== (node.attrs.info || '')) {
          changes.push({ kind: 'set-info', pos: offset, info });
        }
      });

      if (changes.length === 0) return null;

      let tr = newState.tr;
      for (const change of changes) {
        if (change.kind === 'to-fence') {
          tr = tr.setBlockType(change.from, change.to, fence, {
            info: change.info,
          });
        } else if (change.kind === 'to-paragraph') {
          tr = tr.setBlockType(change.from, change.to, paragraph);
        } else {
          tr = tr.setNodeMarkup(change.pos, undefined, { info: change.info });
        }
      }

      return tr;
    },
  });
}

export function lefolioFencePlugins() {
  return [
    keymap({
      Enter: exitFence,
    }),
    normalizeFenceBlocks(),
  ];
}
