import { useEffect, useRef } from 'react';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { exampleSetup } from 'prosemirror-example-setup';
import {
  editorSchema,
  parseMarkdown,
  serializeMarkdown,
} from '@/lib/pmMarkdown';
import { lefolioFencePlugins } from '@/lib/fenceBehavior';
import 'prosemirror-view/style/prosemirror.css';
import 'prosemirror-example-setup/style/style.css';

export function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);

  onChangeRef.current = onChange;

  useEffect(() => {
    if (!hostRef.current || viewRef.current) return;

    const state = EditorState.create({
      doc: parseMarkdown(value),
      plugins: [
        ...exampleSetup({
          schema: editorSchema,
          menuBar: false,
        }),
        ...lefolioFencePlugins(),
      ],
    });

    const view = new EditorView(hostRef.current, {
      state,
      attributes: {
        class: 'lf-pm-content',
        spellcheck: 'false',
      },
      dispatchTransaction(tr) {
        const next = view.state.apply(tr);
        view.updateState(next);
        if (tr.docChanged) {
          onChangeRef.current(serializeMarkdown(next.doc));
        }
      },
    });

    viewRef.current = view;
    view.focus();

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Mount once with the initial starter markdown.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex shrink-0 items-center border-b px-4 py-2.5"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span
          className="text-xs font-medium tracking-widest uppercase"
          style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}
        >
          Home.md
        </span>
      </div>

      <div className="lf-pm-shell min-h-0 flex-1 overflow-y-auto">
        <div ref={hostRef} className="lf-pm-host h-full" />
      </div>
    </div>
  );
}
