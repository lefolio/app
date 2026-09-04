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

function renderLooseMarkdown(md: string) {
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

function renderHero(body: string) {
  const links = [...body.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];
  const withoutLinks = body.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '');
  const ctas = links
    .map((match, index) => {
      const cls = index === 0 ? 'lf-cta lf-cta-primary' : 'lf-cta lf-cta-secondary';
      return `<a class="${cls}" href="${escapeHtml(match[2])}">${escapeHtml(match[1])}</a>`;
    })
    .join('');

  return `
    <section class="lf-block lf-block-hero">
      <span class="block-chip">::: hero</span>
      ${renderLooseMarkdown(withoutLinks)}
      ${ctas ? `<div class="lf-cta-row">${ctas}</div>` : ''}
    </section>
  `;
}

function renderAbout(body: string) {
  const image = body.match(/!\[([^\]]*)\]\(([^)]+)\)/);
  const text = body.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '').trim();
  return `
    <section class="lf-block">
      <span class="block-chip">::: about</span>
      <div class="lf-about">
        <div>${renderLooseMarkdown(text)}</div>
        ${
          image
            ? `<img class="md-img" src="${escapeHtml(image[2])}" alt="${escapeHtml(image[1])}" />`
            : ''
        }
      </div>
    </section>
  `;
}

function renderTestimonials(body: string) {
  const chunks = body
    .split(/^## /gm)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const cards = chunks
    .map((chunk) => {
      const lines = chunk.split('\n');
      const name = lines[0]?.trim() ?? 'Customer';
      const rest = lines.slice(1).join('\n');
      const roleMatch = rest.match(/^### (.+)$/m);
      const role = roleMatch?.[1] ?? '';
      const quote = rest.replace(/^### .+$/m, '').trim();
      return `
        <article class="lf-quote">
          <h2 class="md-h2">${inlineMarkdown(name)}</h2>
          ${role ? `<h3 class="md-h3">${inlineMarkdown(role)}</h3>` : ''}
          <p>${inlineMarkdown(quote)}</p>
        </article>
      `;
    })
    .join('');

  return `
    <section class="lf-block">
      <span class="block-chip">::: testimonials</span>
      <div class="lf-testimonials">${cards}</div>
    </section>
  `;
}

function renderGenericBlock(name: string, body: string) {
  return `
    <section class="lf-block">
      <span class="block-chip">::: ${escapeHtml(name)}</span>
      ${renderLooseMarkdown(body)}
    </section>
  `;
}

/** Preview renderer that understands lefolio ::: component fences. */
export function renderLefolioPreview(markdown: string) {
  const fence = /^::: *([a-z0-9_-]+)[^\n]*\n([\s\S]*?)^:::/gm;
  let html = '';
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = fence.exec(markdown)) !== null) {
    const before = markdown.slice(cursor, match.index).trim();
    if (before) html += renderLooseMarkdown(before);

    const name = match[1].toLowerCase();
    const body = match[2].trim();
    if (name === 'hero') html += renderHero(body);
    else if (name === 'about') html += renderAbout(body);
    else if (name === 'testimonials') html += renderTestimonials(body);
    else html += renderGenericBlock(name, body);

    cursor = match.index + match[0].length;
  }

  const after = markdown.slice(cursor).trim();
  if (after) html += renderLooseMarkdown(after);
  if (!html) html = renderLooseMarkdown(markdown);
  return html;
}
