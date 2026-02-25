/**
 * main.js — Entry point: init router, restore last page, wire sidebar
 */




var _mainChapters = [ch1, ch2, ch3, ch6, ch5, ch4];
var _mainQuizzes  = { 1: q1, 2: q2, 3: q3, 4: q6, 5: q5, 6: q4 };

const app = document.getElementById('app');

// ── Wire up routes ──────────────────────────────────────────
route('home', () => renderHome(app));

route('chapter', ({ id }) => {
  const ch = _mainChapters.find(c => c.id === id);
  if (ch) {
    renderChapter(app, ch);
    window.scrollTo({ top: 0, behavior: 'instant' });
  } else {
    app.innerHTML = `<div class="empty-state"><h2>Chapter ${id} not found</h2><a href="#home" class="btn">← Home</a></div>`;
  }
});

route('quiz', ({ id }) => {
  const qz = _mainQuizzes[id];
  const ch = _mainChapters.find(c => c.id === id);
  if (qz && ch) {
    renderQuiz(app, qz, id);
    window.scrollTo({ top: 0, behavior: 'instant' });
  } else {
    app.innerHTML = `<div class="empty-state"><h2>Quiz ${id} not found</h2><a href="#home" class="btn">← Home</a></div>`;
  }
});

route('notes', () => {
  renderNotesPage(app);
  window.scrollTo({ top: 0, behavior: 'instant' });
});

route('progress', () => {
  renderProgressPage(app);
  window.scrollTo({ top: 0, behavior: 'instant' });
});

route('404', () => {
  app.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">404</div>
      <h3>Page not found</h3>
      <p><a href="#home" class="btn">← Home</a></p>
    </div>`;
});

// ── Bootstrap ──────────────────────────────────────────────
function init() {
  // Provide chapter list to renderer
  setChapters(_mainChapters);

  // Render sidebar navigation
  renderSidebar();
  updateAllSidebarDots();

  // Initialize search
  initSearch(searchIndex);
  initSearchUI();

  // Mobile sidebar toggle
  const sidebar        = document.getElementById('sidebar');
  const overlay        = document.getElementById('sidebar-overlay');
  const btnOpen        = document.getElementById('btn-open-sidebar');
  const btnClose       = document.getElementById('btn-close-sidebar');

  btnOpen?.addEventListener('click', () => {
    sidebar?.classList.add('open');
    overlay?.classList.add('visible');
  });

  const closeSidebar = () => {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('visible');
  };

  btnClose?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', closeSidebar);

  // Close sidebar on nav item click (mobile)
  document.querySelectorAll('.chapter-nav-item, .nav-link').forEach(el => {
    el.addEventListener('click', () => {
      if (window.innerWidth <= 900) closeSidebar();
    });
  });

  // Notes panel close
  document.getElementById('btn-close-notes')?.addEventListener('click', () => {
    document.getElementById('notes-panel')?.classList.remove('open');
    document.getElementById('notes-panel')?.setAttribute('aria-hidden', 'true');
  });

  // Notes panel from sidebar link
  document.querySelector('a[href="#notes"]')?.addEventListener('click', e => {
    // Let router handle it (renderNotesPage in app container)
  });

  // Export notes
  document.getElementById('btn-export-notes')?.addEventListener('click', exportNotes);

  // Start router (dispatches to initial route)
  initRouter();
}

init();
