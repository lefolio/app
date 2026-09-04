import { useEffect, useRef, useState } from 'react';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { exampleSetup } from 'prosemirror-example-setup';
import {
  editorSchema,
  parseMarkdown,
  serializeMarkdown,
} from '@/lib/pmMarkdown';
import { lefolioFencePlugins } from '@/lib/fenceBehavior';
import { lefolioSectionTonePlugin } from '@/lib/sectionTone';
import 'prosemirror-view/style/prosemirror.css';
import 'prosemirror-example-setup/style/style.css';

type EditorMode = 'preview' | 'raw';

export function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [mode, setMode] = useState<EditorMode>('preview');
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);

  onChangeRef.current = onChange;
  valueRef.current = value;

  useEffect(() => {
    if (mode !== 'preview') {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
      return;
    }

    if (!hostRef.current) return;

    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }

    const state = EditorState.create({
      doc: parseMarkdown(valueRef.current),
      plugins: [
        ...exampleSetup({
          schema: editorSchema,
          menuBar: false,
        }),
        ...lefolioFencePlugins(),
        lefolioSectionTonePlugin(),
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
  }, [mode]);

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex shrink-0 items-center justify-between border-b px-4 py-2.5"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span
          className="text-xs font-medium tracking-widest uppercase"
          style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}
        >
          Home.md
        </span>
        <div
          className="flex gap-0.5 rounded-md p-0.5"
          style={{ background: 'var(--color-bg)' }}
        >
          {([
            { id: 'preview', label: 'preview' },
            { id: 'raw', label: 'raw' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMode(tab.id)}
              className="rounded px-3 py-1 text-xs transition-all duration-150"
              style={{
                fontFamily: 'var(--font-mono)',
                background: mode === tab.id ? 'var(--color-surface-2)' : 'transparent',
                color: mode === tab.id ? 'var(--color-text)' : 'var(--color-muted)',
                border:
                  mode === tab.id
                    ? '1px solid var(--color-border)'
                    : '1px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'preview' ? (
        <div className="lf-pm-shell min-h-0 flex-1 overflow-y-auto">
          <div ref={hostRef} className="lf-pm-host h-full" />
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="lf-raw-editor min-h-0 flex-1 resize-none overflow-y-auto border-0 bg-transparent px-5 py-4 outline-none"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            lineHeight: '22px',
            color: 'var(--color-text)',
            caretColor: 'var(--color-accent)',
          }}
        />
      )}
    </div>
  );
}
