/**
 * search.js — Fuse.js fuzzy search integration + overlay UI
 */


let fuse = null;
let index = [];

/** Initialize search with the pre-built index */
function initSearch(searchIndex) {
  index = searchIndex;
  fuse = new Fuse(index, {
    threshold: 0.4,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
    keys: [
      { name: 'sectionTitle',  weight: 0.5 },
      { name: 'chapterTitle',  weight: 0.3 },
      { name: 'tags',          weight: 0.3 },
      { name: 'body',          weight: 0.2 }
    ]
  });
}

/** Show the search overlay */
function openSearch() {
  const overlay = document.getElementById('search-overlay');
  const input   = document.getElementById('search-input');
  if (!overlay) return;

  overlay.classList.add('visible');
  overlay.setAttribute('aria-hidden', 'false');
  input?.focus();
  input?.select();
}

/** Hide the search overlay */
function closeSearch() {
  const overlay = document.getElementById('search-overlay');
  if (!overlay) return;
  overlay.classList.remove('visible');
  overlay.setAttribute('aria-hidden', 'true');
}

/** Perform a search and render results */
function doSearch(query) {
  const resultsEl = document.getElementById('search-results');
  if (!resultsEl || !fuse) return;

  const q = query.trim();
  if (!q) {
    resultsEl.innerHTML = '<p class="search-empty">Start typing to search…</p>';
    return;
  }

  const results = fuse.search(q, { limit: 12 });

  if (results.length === 0) {
    resultsEl.innerHTML = `<p class="search-no-results">No results for "<strong>${escapeHTML(q)}</strong>"</p>`;
    return;
  }

  const html = results.map((r, i) => {
    const item = r.item;
    const bodySnippet = getSnippet(item.body, q);
    return `
      <button
        class="search-result-item"
        data-hash="${escapeHTML(item.hash)}"
        role="option"
        tabindex="-1"
        aria-selected="${i === 0}"
      >
        <div class="search-result-icon">C${item.chapterId}</div>
        <div class="search-result-content">
          <div class="search-result-breadcrumb">${escapeHTML(item.chapterTitle)}</div>
          <div class="search-result-title">${highlightMatch(item.sectionTitle, q)}</div>
          <div class="search-result-snippet">${highlightMatch(bodySnippet, q)}</div>
        </div>
      </button>`;
  }).join('');

  resultsEl.innerHTML = html + `
    <div class="search-footer">
      <span><kbd>↑↓</kbd> navigate</span>
      <span><kbd>Enter</kbd> select</span>
      <span><kbd>Esc</kbd> close</span>
    </div>`;

  // Click handlers
  resultsEl.querySelectorAll('.search-result-item').forEach(btn => {
    btn.addEventListener('click', () => {
      closeSearch();
      const hash = btn.dataset.hash;
      navigate(hash.replace(/^#/, ''));
      // After navigation, scroll to section (small delay for render)
      setTimeout(() => {
        const sectionId = hash.split('/')[2];
        if (sectionId) {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
    });
  });
}

/** Keyboard navigation within results */
function handleResultsKeyboard(e) {
  const results = document.querySelectorAll('.search-result-item');
  if (!results.length) return;

  const focused = document.querySelector('.search-result-item.focused');
  let idx = focused ? Array.from(results).indexOf(focused) : -1;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    idx = Math.min(idx + 1, results.length - 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    idx = Math.max(idx - 1, 0);
  } else if (e.key === 'Enter') {
    if (focused) { focused.click(); return; }
    results[0]?.click();
    return;
  } else {
    return;
  }

  results.forEach(r => r.classList.remove('focused'));
  results[idx]?.classList.add('focused');
  results[idx]?.scrollIntoView({ block: 'nearest' });
}

/** Initialize all search UI bindings */
function initSearchUI() {
  const overlay  = document.getElementById('search-overlay');
  const input    = document.getElementById('search-input');
  const btnOpen  = document.getElementById('btn-search');
  const btnOpenM = document.getElementById('btn-search-mobile');

  if (!overlay || !input) return;

  const debouncedSearch = debounce(doSearch, 150);

  // Input handler
  input.addEventListener('input', () => debouncedSearch(input.value));
  input.addEventListener('keydown', handleResultsKeyboard);

  // Open triggers
  [btnOpen, btnOpenM].forEach(btn => {
    btn?.addEventListener('click', openSearch);
  });

  // Keyboard shortcut: / or Ctrl+K
  document.addEventListener('keydown', e => {
    if (overlay.classList.contains('visible')) {
      if (e.key === 'Escape') closeSearch();
      return;
    }
    const tag = document.activeElement?.tagName?.toLowerCase();
    const isEditable = tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable;
    if (!isEditable && e.key === '/') {
      e.preventDefault();
      openSearch();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
  });

  // Close on backdrop click
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeSearch();
  });
}

/* ===== Helpers ===== */

function getSnippet(text, query) {
  if (!text) return '';
  const clean = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = clean.split(' ');
  const qLower = query.toLowerCase();

  // Find position of query term
  const idx = words.findIndex(w => w.toLowerCase().includes(qLower));
  const start = idx === -1 ? 0 : Math.max(0, idx - 5);
  const end = Math.min(words.length, start + 20);
  return (start > 0 ? '…' : '') + words.slice(start, end).join(' ') + (end < words.length ? '…' : '');
}

function highlightMatch(text, query) {
  if (!query || !text) return escapeHTML(text || '');
  const safe = escapeHTML(text);
  const q = escapeHTML(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  try {
    return safe.replace(new RegExp(`(${q})`, 'gi'), '<span class="search-highlight">$1</span>');
  } catch {
    return safe;
  }
}
