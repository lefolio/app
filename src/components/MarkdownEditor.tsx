import { useState } from 'react';
import { renderMarkdownPreview } from '@/lib/preview';

export function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const lineCount = value.split('\n').length;

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
          {(['write', 'preview'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="rounded px-3 py-1 text-xs transition-all duration-150"
              style={{
                fontFamily: 'var(--font-mono)',
                background: tab === t ? 'var(--color-surface-2)' : 'transparent',
                color: tab === t ? 'var(--color-text)' : 'var(--color-muted)',
                border:
                  tab === t
                    ? '1px solid var(--color-border)'
                    : '1px solid transparent',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {tab === 'write' ? (
          <>
            <div
              className="shrink-0 select-none pt-3 pr-1 pb-3 pl-3 text-right"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                lineHeight: '22px',
                color: 'var(--color-border-2)',
                minWidth: 36,
              }}
            >
              {Array.from({ length: lineCount }, (_, i) => (
                <span key={i} className="block">
                  {i + 1}
                </span>
              ))}
            </div>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              spellCheck={false}
              className="flex-1 resize-none bg-transparent py-3 pr-4 pl-2 outline-none"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                lineHeight: '22px',
                color: 'var(--color-text)',
                caretColor: 'var(--color-accent)',
              }}
            />
          </>
        ) : (
          <div
            className="prose-md flex-1 overflow-y-auto px-5 py-5"
            dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(value) }}
          />
        )}
      </div>

      <div
        className="flex shrink-0 items-center gap-4 border-t px-4 py-2"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span
          className="text-xs"
          style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {lineCount} lines
        </span>
        <span
          className="text-xs"
          style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {value.length} chars
        </span>
        <span
          className="text-xs"
          style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {(value.match(/^::: /gm) || []).length} blocks
        </span>
      </div>
    </div>
  );
}
