import { useState } from 'react';
import { DropZone } from '@/components/DropZone';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { DEFAULT_AGENT_PROMPT, STARTER_HOME_MD } from '@/lib/starter';
import type { DroppedItem } from '@/lib/types';

type SendState = 'idle' | 'sending' | 'sent';

export default function App() {
  const [markdown, setMarkdown] = useState(STARTER_HOME_MD);
  const [context, setContext] = useState(
    'This home page is for a service business with a decade of experience, it values trust and partnership, the style should be clean and professional but also warm.',
  );
  const [refs, setRefs] = useState<DroppedItem[]>([]);
  const [prompt, setPrompt] = useState(DEFAULT_AGENT_PROMPT);
  const [sendState, setSendState] = useState<SendState>('idle');

  const handleSend = () => {
    if (sendState !== 'idle') return;
    setSendState('sending');
    // Prototype: package is ready for a real agent bridge (clipboard / MCP / IDE).
    const payload = {
      file: 'Home.md',
      markdown,
      context,
      references: refs.map(({ name, type, url }) => ({ name, type, url })),
      prompt,
    };
    void navigator.clipboard?.writeText(JSON.stringify(payload, null, 2)).catch(() => undefined);
    window.setTimeout(() => {
      setSendState('sent');
      window.setTimeout(() => setSendState('idle'), 2800);
    }, 900);
  };

  return (
    <div className="flex h-full flex-col" style={{ background: 'var(--color-bg)' }}>
      <div className="flex min-h-0 flex-1">
        <div
          className="flex flex-col border-r"
          style={{
            flex: '0 0 55%',
            borderColor: 'var(--color-border)',
            background: 'var(--color-surface)',
          }}
        >
          <MarkdownEditor value={markdown} onChange={setMarkdown} />
        </div>

        <div
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5"
          style={{ background: 'var(--color-bg)' }}
        >
          <div>
            <label
              className="mb-2 block text-xs font-medium tracking-widest uppercase"
              style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}
            >
              Contex
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Write some context about your site and business..."
              className="min-h-[100px] w-full resize-none rounded-xl p-4 outline-none transition-all duration-200"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                lineHeight: 1.65,
                caretColor: 'var(--color-accent)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            />
          </div>

          <div>
            <label
              className="mb-2 block text-xs font-medium tracking-widest uppercase"
              style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}
            >
              References
            </label>
            <DropZone
              items={refs}
              onAdd={(item) => setRefs((r) => [...r, item])}
              onRemove={(id) => setRefs((r) => r.filter((x) => x.id !== id))}
            />
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <label
              className="mb-2 block text-xs font-medium tracking-widest uppercase"
              style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}
            >
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Write the prompt for your coding agent…"
              className="min-h-[160px] flex-1 resize-none rounded-xl p-4 outline-none transition-all duration-200"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                lineHeight: 1.65,
                caretColor: 'var(--color-accent)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            />
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={handleSend}
              disabled={sendState === 'sending'}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-semibold transition-all duration-200"
              style={{
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.03em',
                background:
                  sendState === 'sent' ? 'var(--color-accent-dim)' : 'var(--color-accent)',
                color: sendState === 'sent' ? 'var(--color-accent)' : 'var(--color-on-accent)',
                border:
                  sendState === 'sent'
                    ? '1px solid var(--color-accent)'
                    : '1px solid transparent',
                opacity: sendState === 'sending' ? 0.7 : 1,
                cursor: sendState === 'sending' ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (sendState === 'idle') {
                  e.currentTarget.style.background = 'var(--color-accent-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (sendState === 'idle') {
                  e.currentTarget.style.background = 'var(--color-accent)';
                }
              }}
            >
              {sendState === 'sending' ? (
                <>
                  <svg
                    className="animate-spin"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Packaging for agent…
                </>
              ) : sendState === 'sent' ? (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied agent package
                </>
              ) : (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  Send to my coding Agent
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
