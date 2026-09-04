function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineMarkdown(text: string) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="md-code">$1</code>')
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a class="md-link" href="$2">$1</a>',
    );
}

/** Plain markdown preview (headings, lists, links, images, emphasis). */
export function renderMarkdownPreview(md: string) {
  const lines = md.split('\n');
  const html: string[] = [];
  let listOpen = false;

  const closeList = () => {
    if (listOpen) {
      html.push('</ul>');
      listOpen = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      closeList();
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (image) {
      closeList();
      html.push(
        `<img class="md-img" src="${escapeHtml(image[2])}" alt="${escapeHtml(image[1])}" />`,
      );
      continue;
    }

    // Keep ::: fences visible as plain text lines in preview.
    if (/^:::/.test(line.trim())) {
      closeList();
      html.push(`<p class="md-fence">${inlineMarkdown(line.trim())}</p>`);
      continue;
    }

    if (/^### /.test(line)) {
      closeList();
      html.push(`<h3 class="md-h3">${inlineMarkdown(line.slice(4))}</h3>`);
      continue;
    }
    if (/^## /.test(line)) {
      closeList();
      html.push(`<h2 class="md-h2">${inlineMarkdown(line.slice(3))}</h2>`);
      continue;
    }
    if (/^# /.test(line)) {
      closeList();
      html.push(`<h1 class="md-h1">${inlineMarkdown(line.slice(2))}</h1>`);
      continue;
    }
    if (/^- /.test(line)) {
      if (!listOpen) {
        html.push('<ul class="md-ul">');
        listOpen = true;
      }
      html.push(`<li class="md-li">${inlineMarkdown(line.slice(2))}</li>`);
      continue;
    }

    closeList();
    html.push(`<p class="md-p">${inlineMarkdown(line)}</p>`);
  }

  closeList();
  return html.join('\n');
}
