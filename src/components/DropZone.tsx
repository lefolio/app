import { useCallback, useRef, useState } from 'react';
import type { DroppedItem } from '@/lib/types';

function makeId() {
  return Math.random().toString(36).slice(2);
}

export function DropZone({
  items,
  onAdd,
  onRemove,
}: {
  items: DroppedItem[];
  onAdd: (item: DroppedItem) => void;
  onRemove: (id: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (files: File[]) => {
      files.forEach((file) => {
        const isImage = file.type.startsWith('image/');
        const item: DroppedItem = {
          id: makeId(),
          name: file.name,
          type: isImage ? 'image' : 'file',
        };
        if (isImage) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            onAdd({ ...item, preview: ev.target?.result as string });
          };
          reader.readAsDataURL(file);
        } else {
          onAdd(item);
        }
      });
    },
    [onAdd],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files);
      const urlText =
        e.dataTransfer.getData('text/uri-list') ||
        e.dataTransfer.getData('text/plain');

      if (files.length > 0) {
        addFiles(files);
      } else if (urlText && urlText.startsWith('http')) {
        onAdd({
          id: makeId(),
          name: urlText.length > 40 ? `${urlText.slice(0, 40)}…` : urlText,
          type: 'link',
          url: urlText,
        });
      }
    },
    [addFiles, onAdd],
  );

  const addLink = () => {
    const url = linkInput.trim();
    if (!url) return;
    onAdd({
      id: makeId(),
      name: url.length > 40 ? `${url.slice(0, 40)}…` : url,
      type: 'link',
      url,
    });
    setLinkInput('');
  };

  const isEmpty = items.length === 0;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className="overflow-hidden rounded-xl border transition-all duration-200"
      style={{
        borderColor: dragging ? 'var(--color-accent)' : 'var(--color-border)',
        background: dragging ? 'var(--color-accent-dim)' : 'var(--color-surface)',
        borderStyle: isEmpty ? 'dashed' : 'solid',
        minHeight: 120,
      }}
    >
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ color: dragging ? 'var(--color-accent)' : 'var(--color-muted)' }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p
            className="text-sm leading-snug"
            style={{ color: dragging ? 'var(--color-accent)' : 'var(--color-muted)' }}
          >
            Drop reference images, branding,
            <br />
            logos, inspirations and links
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-1 rounded-md border px-3 py-1.5 text-xs transition-all duration-150"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-muted)',
              borderColor: 'var(--color-border)',
              background: 'transparent',
            }}
          >
            browse files
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.zip,.svg"
            className="hidden"
            onChange={(e) => {
              addFiles(Array.from(e.target.files || []));
              e.target.value = '';
            }}
          />
        </div>
      ) : (
        <div className="p-3">
          <div className="mb-2 flex flex-wrap gap-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative flex max-w-40 items-center gap-1.5 rounded-md px-2 py-1.5 text-xs"
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text)',
                }}
              >
                {item.type === 'image' && item.preview ? (
                  <img
                    src={item.preview}
                    alt=""
                    className="h-4 w-4 shrink-0 rounded object-cover"
                  />
                ) : item.type === 'link' ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ color: 'var(--color-accent)', flexShrink: 0 }}
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                ) : (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ color: 'var(--color-muted)', flexShrink: 0 }}
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                )}
                <span className="truncate" style={{ maxWidth: 100 }}>
                  {item.name}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="ml-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ color: 'var(--color-muted)' }}
                  aria-label={`Remove ${item.name}`}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1 rounded-md border border-dashed px-2 py-1.5 text-xs transition-all duration-150"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-muted)',
                borderColor: 'var(--color-border)',
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              add
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.zip,.svg"
            className="hidden"
            onChange={(e) => {
              addFiles(Array.from(e.target.files || []));
              e.target.value = '';
            }}
          />
        </div>
      )}

      <div
        className="flex gap-2 border-t px-3 py-2"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <input
          value={linkInput}
          onChange={(e) => setLinkInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addLink();
          }}
          placeholder="paste a link and press enter"
          className="flex-1 bg-transparent text-xs outline-none"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text)',
            caretColor: 'var(--color-accent)',
          }}
        />
        {linkInput ? (
          <button
            type="button"
            onClick={addLink}
            className="rounded px-2 py-0.5 text-xs"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-accent)',
              background: 'var(--color-accent-dim)',
            }}
          >
            add
          </button>
        ) : null}
      </div>
    </div>
  );
}
