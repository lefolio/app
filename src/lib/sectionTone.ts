import type { Node as PMNode } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

type Fence = { pos: number; node: PMNode };

/**
 * Subtle alternating backgrounds for each paired `::: name` … `:::` section.
 */
export function lefolioSectionTonePlugin() {
  return new Plugin({
    props: {
      decorations(state) {
        const decorations: Decoration[] = [];
        const doc = state.doc;
        const fences: Fence[] = [];

        doc.forEach((node, offset) => {
          if (node.type.name === 'lefolio_fence') {
            fences.push({ pos: offset, node });
          }
        });

        let sectionIndex = 0;

        for (let i = 0; i < fences.length; i++) {
          const open = fences[i];
          if (!open.node.attrs.info) continue;

          let closeIndex = -1;
          for (let j = i + 1; j < fences.length; j++) {
            if (!fences[j].node.attrs.info) {
              closeIndex = j;
              break;
            }
          }
          if (closeIndex < 0) continue;

          const close = fences[closeIndex];
          const tone = sectionIndex % 2 === 0 ? 'a' : 'b';
          const toneClass = `lf-section-tone lf-section-tone-${tone}`;

          decorations.push(
            Decoration.node(open.pos, open.pos + open.node.nodeSize, {
              class: `${toneClass} lf-section-start`,
            }),
          );

          doc.forEach((node, offset) => {
            if (offset <= open.pos || offset >= close.pos) return;
            decorations.push(
              Decoration.node(offset, offset + node.nodeSize, {
                class: toneClass,
              }),
            );
          });

          decorations.push(
            Decoration.node(close.pos, close.pos + close.node.nodeSize, {
              class: `${toneClass} lf-section-end`,
            }),
          );

          sectionIndex += 1;
          i = closeIndex;
        }

        return DecorationSet.create(doc, decorations);
      },
    },
  });
}
