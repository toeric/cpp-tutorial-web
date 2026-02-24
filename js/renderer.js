/**
 * renderer.js — Converts chapter/quiz data into DOM
 */


// Chapter manifest (populated by main.js)
var _chapterList = [];

function setChapters(list) {
  _chapterList = list;
}

/* ========================================================== */
/*  SIDEBAR                                                    */
/* ========================================================== */

function renderSidebar() {
  const list = document.getElementById('chapter-list');
  if (!list) return;

  list.innerHTML = _chapterList.map(ch => {
    const cp = getChapterProgress(ch.id);
    return `
      <a href="#chapter/${ch.id}" class="chapter-nav-item" data-chapter-id="${ch.id}">
        <span class="chapter-num">${String(ch.id).padStart(2, '0')}</span>
        <span class="chapter-title-text">${escapeHTML(ch.title)}</span>
        <span
          class="chapter-progress-dot ${cp.read ? 'complete' : ''}"
          data-chapter-dot="${ch.id}"
          title="${cp.read ? 'Read' : 'Not read'}"
          aria-label="${cp.read ? 'Read' : 'Not read'}"
        ></span>
      </a>`;
  }).join('');

  // Set active on click
  list.querySelectorAll('.chapter-nav-item').forEach(a => {
    a.addEventListener('click', () => setActiveSidebarItem(a));
  });
}

function setActiveSidebarItem(el) {
  document.querySelectorAll('.chapter-nav-item').forEach(a => a.classList.remove('active'));
  if (typeof el === 'string') {
    document.querySelector(`[data-chapter-id="${el}"]`)?.classList.add('active');
  } else {
    el?.classList.add('active');
  }
}

/* ========================================================== */
/*  HOME PAGE                                                  */
/* ========================================================== */

function renderHome(container) {
  document.querySelectorAll('.chapter-nav-item').forEach(a => a.classList.remove('active'));
  const stats = getOverallStats(_chapterList.length);

  container.innerHTML = `
    <div class="home-hero">
      <h1 class="chapter-title">C++ Reference</h1>
      <p>Concise, interactive reference for core C++ concepts — STL containers, templates, move semantics, concurrency, and more.</p>
    </div>

    <div class="home-progress-section">
      <h2>Your Progress</h2>
      <div class="progress-meta">
        <span>${stats.read} of ${stats.total} chapters read</span>
        <span>${stats.pct}%</span>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill" style="width:${stats.pct}%"></div>
      </div>
    </div>

    <h2 style="font-size:var(--font-size-lg);font-weight:600;margin-bottom:var(--space-4)">Chapters</h2>
    <div class="chapter-grid">
      ${_chapterList.map(ch => {
        const cp = getChapterProgress(ch.id);
        const tags = (ch.tags || []).slice(0, 3).map(t => `<span class="tag">${escapeHTML(t)}</span>`).join('');
        return `
          <a href="#chapter/${ch.id}" class="chapter-card" tabindex="0">
            <div class="chapter-card-num">Chapter ${ch.id}</div>
            <div class="chapter-card-title">${escapeHTML(ch.title)}</div>
            <div class="chapter-card-desc">${escapeHTML(ch.description || '')}</div>
            <div class="chapter-card-meta">
              ${cp.read ? '<span class="read-badge">✓ Read</span>' : ''}
              ${cp.quizScore != null ? `<span class="badge badge-info">Quiz: ${cp.quizScore}%</span>` : ''}
              <span class="chapter-card-time">~${ch.estimatedMinutes} min</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:4px">${tags}</div>
          </a>`;
      }).join('')}
    </div>`;
}

/* ========================================================== */
/*  CHAPTER                                                    */
/* ========================================================== */

function renderChapter(container, chapter) {
  setActiveSidebarItem(String(chapter.id));

  const cp = getChapterProgress(chapter.id);
  const tags = (chapter.tags || []).map(t => `<span class="tag">${escapeHTML(t)}</span>`).join('');

  // TOC
  const tocItems = chapter.sections.map((s, i) =>
    `<li class="toc-item">
      <a href="#${s.id}">
        <span class="toc-num">${i + 1}.</span>
        ${escapeHTML(s.title)}
      </a>
    </li>`
  ).join('');

  // Sections
  const sectionsHTML = chapter.sections.map(s => renderSection(s, chapter)).join('');

  // Prev/next
  const prevId = chapter.id - 1;
  const nextId = chapter.id + 1;

  container.innerHTML = `
    <article class="chapter-article">
      <header class="chapter-header">
        <div class="chapter-meta">
          <span class="chapter-num-badge">Chapter ${chapter.id}</span>
          <span class="chapter-time">~${chapter.estimatedMinutes} min read</span>
          ${cp.read ? '<span class="read-badge">✓ Read</span>' : ''}
        </div>
        <h1 class="chapter-title">${escapeHTML(chapter.title)}</h1>
        <div class="chapter-tags">${tags}</div>
      </header>

      <div class="chapter-actions">
        <div class="chapter-action-group">
          ${prevId >= 1 ? `<a href="#chapter/${prevId}" class="btn">← Ch.${prevId}</a>` : ''}
          ${nextId <= _chapterList.length ? `<a href="#chapter/${nextId}" class="btn">Ch.${nextId} →</a>` : ''}
        </div>
        <div class="chapter-action-group">
          ${!cp.read ? `<button class="btn btn-primary" id="btn-mark-read">✓ Mark as Read</button>` : ''}
          <button class="btn" id="btn-open-notes-panel">✎ Notes</button>
          <a href="#quiz/${chapter.id}" class="btn">Take Quiz →</a>
        </div>
      </div>

      <nav class="toc" aria-label="Table of contents">
        <div class="toc-title">Contents</div>
        <ol class="toc-list">${tocItems}</ol>
      </nav>

      ${sectionsHTML}

      <div class="quiz-start-card">
        <div class="quiz-start-text">
          <h3>Ready to test your knowledge?</h3>
          <p>Take the Chapter ${chapter.id} quiz to reinforce what you've learned.</p>
        </div>
        <a href="#quiz/${chapter.id}" class="btn btn-primary btn-lg">Take Quiz →</a>
      </div>

      <footer class="chapter-footer">
        ${prevId >= 1 ? `<a href="#chapter/${prevId}" class="btn">← Chapter ${prevId}</a>` : '<div></div>'}
        ${nextId <= _chapterList.length ? `<a href="#chapter/${nextId}" class="btn btn-primary">Chapter ${nextId} →</a>` : `<a href="#home" class="btn btn-primary">⌂ Home</a>`}
      </footer>
    </article>`;

  // Mark as read button
  container.querySelector('#btn-mark-read')?.addEventListener('click', () => {
    markRead(chapter.id);
    const btn = container.querySelector('#btn-mark-read');
    if (btn) {
      btn.textContent = '✓ Marked as Read';
      btn.disabled = true;
      btn.classList.remove('btn-primary');
    }
    updateAllSidebarDots();
  });

  // Notes panel button
  container.querySelector('#btn-open-notes-panel')?.addEventListener('click', () => {
    renderNotesPanel();
    document.getElementById('notes-panel')?.classList.add('open');
    document.getElementById('notes-panel')?.setAttribute('aria-hidden', 'false');
  });

  // Add-note buttons
  container.querySelectorAll('.btn-add-note').forEach(btn => {
    btn.addEventListener('click', () => {
      const sectionEl = btn.closest('.chapter-section');
      const sectionId = sectionEl?.dataset.sectionId || '';
      const sectionTitle = sectionEl?.dataset.sectionTitle || '';
      renderNoteSaveForm(sectionEl, {
        chapterId: chapter.id,
        sectionId,
        chapterTitle: chapter.title,
        sectionTitle,
        text: ''
      });
    });
  });

  // TOC smooth scroll
  container.querySelectorAll('.toc-list a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      scrollToId(id);
    });
  });

  // Section anchor copy
  container.querySelectorAll('.section-anchor').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      scrollToId(id);
      history.replaceState(null, '', `#chapter/${chapter.id}/${id}`);
    });
  });

  // Copy code buttons
  container.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const pre = btn.closest('.code-block-wrap')?.querySelector('code');
      if (pre) {
        navigator.clipboard?.writeText(pre.textContent).then(() => {
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
        }).catch(() => {
          // Fallback: select text
          const range = document.createRange();
          range.selectNode(pre);
          window.getSelection()?.removeAllRanges();
          window.getSelection()?.addRange(range);
        });
      }
    });
  });

  // Auto-scroll read detection
  setupScrollReadDetection(chapter.id, container);

  // Prism highlight
  if (window.Prism) {
    setTimeout(() => Prism.highlightAllUnder(container), 50);
  }
}

function renderSection(section, chapter) {
  const codeBlocks = (section.codeBlocks || []).map(renderCodeBlock).join('');
  const diagrams = (section.diagrams || []).map(renderDiagram).join('');
  const table = section.complexityTable ? renderComplexityTable(section.complexityTable) : '';

  return `
    <section
      id="${section.id}"
      class="chapter-section"
      data-section-id="${section.id}"
      data-section-title="${escapeHTML(section.title)}"
    >
      <div class="section-header">
        <h2 class="section-title">${escapeHTML(section.title)}</h2>
        <a href="#${section.id}" class="section-anchor" title="Link to section">#</a>
        <button class="btn-add-note" aria-label="Add note to this section">+ Note</button>
      </div>
      <div class="prose">
        ${section.content}
      </div>
      ${diagrams}
      ${codeBlocks}
      ${table}
    </section>`;
}

function renderCodeBlock(block) {
  return `
    <div class="code-block-wrap">
      <div class="code-block-header">
        <span class="code-block-lang">${escapeHTML(block.language || 'cpp')}</span>
        ${block.caption ? `<span class="code-block-caption">${escapeHTML(block.caption)}</span>` : ''}
        <button class="btn-copy" aria-label="Copy code">Copy</button>
      </div>
      <pre class="language-${block.language || 'cpp'}"><code class="language-${block.language || 'cpp'}">${escapeHTML(block.code)}</code></pre>
    </div>`;
}

function renderDiagram(diagram) {
  if (diagram.type === 'svg') {
    return `
      <div class="diagram-wrap">
        <img src="${diagram.src}" alt="${escapeHTML(diagram.caption || '')}" loading="lazy" />
        ${diagram.caption ? `<p class="diagram-caption">${escapeHTML(diagram.caption)}</p>` : ''}
      </div>`;
  }
  if (diagram.type === 'ascii') {
    return `
      <div class="diagram-wrap">
        <div class="ascii-diagram" role="img" aria-label="${escapeHTML(diagram.caption || 'Diagram')}">${escapeHTML(diagram.content)}</div>
        ${diagram.caption ? `<p class="diagram-caption">${escapeHTML(diagram.caption)}</p>` : ''}
      </div>`;
  }
  return '';
}

function renderComplexityTable(table) {
  const colorsMap = {
    'O(1)': 'complexity-O1',
    'O(n)': 'complexity-On',
    'O(log n)': 'complexity-Ologn',
    'O(n²)': 'complexity-On2',
    'amortized O(1)': 'complexity-amort',
    'O(log n) amortized': 'complexity-amort',
  };

  const rows = table.rows.map(row => {
    const cls = colorsMap[row.complexity] || '';
    return `<tr>
      <td><code>${escapeHTML(row.operation)}</code></td>
      <td class="${cls}">${escapeHTML(row.complexity)}</td>
      ${row.notes ? `<td>${escapeHTML(row.notes)}</td>` : ''}
    </tr>`;
  }).join('');

  const hasNotes = table.rows.some(r => r.notes);

  return `
    <div class="complexity-table-wrap">
      <div class="complexity-table-title">Time Complexity</div>
      <table class="complexity-table">
        <thead>
          <tr>
            <th>Operation</th>
            <th>Complexity</th>
            ${hasNotes ? '<th>Notes</th>' : ''}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function setupScrollReadDetection(chapterId, container) {
  const cp = getChapterProgress(chapterId);
  if (cp.read) return; // Already read

  let marked = false;
  const handler = () => {
    if (!marked && isNearBottom(300)) {
      marked = true;
      markRead(chapterId);
      updateAllSidebarDots();
      // Update button if present
      const btn = container.querySelector('#btn-mark-read');
      if (btn) {
        btn.textContent = '✓ Auto-marked as Read';
        btn.disabled = true;
        btn.classList.remove('btn-primary');
      }
      window.removeEventListener('scroll', handler);
    }
  };
  window.addEventListener('scroll', handler, { passive: true });
}

/* ========================================================== */
/*  PROGRESS PAGE                                              */
/* ========================================================== */

function renderProgressPage(container) {
  document.querySelectorAll('.chapter-nav-item').forEach(a => a.classList.remove('active'));

  const stats = getOverallStats(_chapterList.length);

  let chaptersHTML = _chapterList.map(ch => {
    const cp = getChapterProgress(ch.id);
    const status = cp.read ? 'complete' : (cp.quizAttempts > 0 ? 'in-progress' : '');
    const scoreClass = cp.quizScore >= 70 ? 'good' : cp.quizScore != null ? 'warn' : '';

    return `
      <div class="progress-page-chapter">
        <div class="progress-chapter-header">
          <span class="chapter-progress-dot ${status}"></span>
          <span class="progress-chapter-title">
            <a href="#chapter/${ch.id}" style="color:inherit">${escapeHTML(ch.title)}</a>
          </span>
          ${cp.read ? '<span class="badge badge-success">Read</span>' : '<span class="badge badge-neutral">Not Read</span>'}
        </div>
        <div class="progress-chapter-body">
          <div class="progress-stat">
            <span class="progress-stat-label">Quiz Score</span>
            <span class="progress-stat-value ${scoreClass}">${cp.quizScore != null ? cp.quizScore + '%' : '—'}</span>
          </div>
          <div class="progress-stat">
            <span class="progress-stat-label">Attempts</span>
            <span class="progress-stat-value">${cp.quizAttempts || 0}</span>
          </div>
          <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
            <a href="#chapter/${ch.id}" class="btn btn-sm">Read</a>
            <a href="#quiz/${ch.id}" class="btn btn-sm">Quiz</a>
          </div>
        </div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="chapter-header">
      <h1 class="chapter-title">Progress</h1>
    </div>

    <div class="home-progress-section">
      <div class="progress-meta">
        <span>${stats.read} of ${stats.total} chapters read · ${stats.passed} quizzes passed</span>
        <span>${stats.pct}%</span>
      </div>
      <div class="progress-bar-wrap" style="height:12px">
        <div class="progress-bar-fill" style="width:${stats.pct}%"></div>
      </div>
    </div>

    <div style="margin-top:var(--space-8)">
      ${chaptersHTML}
    </div>`;
}
