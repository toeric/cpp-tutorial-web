/**
 * notes.js — Notes CRUD (create/read/update/delete)
 * Schema: [{ id, chapterId, sectionId, chapterTitle, sectionTitle, text, createdAt, updatedAt }]
 */




function getNotes() {
  return storage.get('notes', []);
}

function getNotesForChapter(chapterId) {
  return getNotes().filter(n => n.chapterId === chapterId);
}

function addNote({ chapterId, sectionId, chapterTitle, sectionTitle, text }) {
  const note = {
    id: uid(),
    chapterId,
    sectionId,
    chapterTitle,
    sectionTitle,
    text: text.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  storage.update('notes', notes => [note, ...notes], []);
  return note;
}

function updateNote(id, text) {
  storage.update('notes', notes =>
    notes.map(n => n.id === id ? { ...n, text: text.trim(), updatedAt: new Date().toISOString() } : n),
    []
  );
}

function deleteNote(id) {
  storage.update('notes', notes => notes.filter(n => n.id !== id), []);
}

function exportNotes() {
  const notes = getNotes();
  const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cpp_tutorial_notes.json';
  a.click();
  URL.revokeObjectURL(url);
}

/** Render the notes panel content */
function renderNotesPanel() {
  const panel = document.getElementById('notes-panel-body');
  if (!panel) return;

  const notes = getNotes();
  if (notes.length === 0) {
    panel.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">✎</div>
        <h3>No notes yet</h3>
        <p>Click "Add Note" in any section<br>to save your thoughts.</p>
      </div>`;
    return;
  }

  // Group by chapter
  const grouped = {};
  notes.forEach(n => {
    const k = n.chapterId;
    if (!grouped[k]) grouped[k] = { title: n.chapterTitle, notes: [] };
    grouped[k].notes.push(n);
  });

  let html = '';
  Object.entries(grouped).forEach(([, group]) => {
    html += `<div class="notes-chapter-group">
      <div class="notes-group-header">
        <span class="note-chapter-badge">${escapeHTML(group.title)}</span>
      </div>`;
    group.notes.forEach(n => {
      html += renderNoteItem(n);
    });
    html += '</div>';
  });

  panel.innerHTML = html;
  attachNoteHandlers(panel);
}

function renderNoteItem(note) {
  return `
    <div class="note-item" data-note-id="${note.id}">
      <div class="note-item-header">
        <span class="note-location">${escapeHTML(note.sectionTitle || '')}</span>
        <span class="note-date">${formatDate(note.updatedAt)}</span>
      </div>
      <div class="note-text note-display">${escapeHTML(note.text)}</div>
      <div class="note-edit-area" style="display:none">
        <textarea class="note-textarea">${escapeHTML(note.text)}</textarea>
        <div class="note-save-actions">
          <button class="btn btn-sm btn-primary note-save-btn">Save</button>
          <button class="btn btn-sm note-cancel-btn">Cancel</button>
        </div>
      </div>
      <div class="note-actions">
        <button class="btn btn-sm note-edit-btn">Edit</button>
        <button class="btn btn-sm btn-danger note-delete-btn">Delete</button>
      </div>
    </div>`;
}

function attachNoteHandlers(root) {
  root.querySelectorAll('.note-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.note-item');
      item.querySelector('.note-display').style.display = 'none';
      item.querySelector('.note-edit-area').style.display = 'block';
      item.querySelector('.note-actions').style.display = 'none';
      item.querySelector('.note-textarea').focus();
    });
  });

  root.querySelectorAll('.note-cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.note-item');
      item.querySelector('.note-display').style.display = 'block';
      item.querySelector('.note-edit-area').style.display = 'none';
      item.querySelector('.note-actions').style.display = 'flex';
    });
  });

  root.querySelectorAll('.note-save-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.note-item');
      const id = item.dataset.noteId;
      const text = item.querySelector('.note-textarea').value;
      if (!text.trim()) return;
      updateNote(id, text);
      item.querySelector('.note-display').textContent = text;
      item.querySelector('.note-display').style.display = 'block';
      item.querySelector('.note-edit-area').style.display = 'none';
      item.querySelector('.note-actions').style.display = 'flex';
    });
  });

  root.querySelectorAll('.note-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.note-item');
      const id = item.dataset.noteId;
      if (confirm('Delete this note?')) {
        deleteNote(id);
        item.remove();
        // Show empty state if no notes left
        if (!root.querySelector('.note-item')) renderNotesPanel();
      }
    });
  });
}

/** Render the inline note-save form for a section */
function renderNoteSaveForm(sectionEl, meta) {
  // Remove any existing form first
  const existing = sectionEl.querySelector('.note-save-form');
  if (existing) { existing.remove(); return; }

  const form = document.createElement('div');
  form.className = 'note-save-form';
  form.innerHTML = `
    <label class="note-save-label">Note for: <em>${escapeHTML(meta.sectionTitle)}</em></label>
    <textarea class="note-textarea" placeholder="Write your note here…" rows="3"></textarea>
    <div class="note-save-actions">
      <button class="btn btn-sm btn-primary save-note-submit">Save Note</button>
      <button class="btn btn-sm save-note-cancel">Cancel</button>
    </div>`;

  const textarea = form.querySelector('.note-textarea');
  form.querySelector('.save-note-cancel').addEventListener('click', () => form.remove());
  form.querySelector('.save-note-submit').addEventListener('click', () => {
    const text = textarea.value.trim();
    if (!text) return;
    addNote({ ...meta, text });
    form.remove();
    // Refresh panel if open
    const panel = document.getElementById('notes-panel');
    if (panel?.classList.contains('open')) renderNotesPanel();
  });

  sectionEl.appendChild(form);
  textarea.focus();
}

/** Full notes page */
function renderNotesPage(container) {
  const notes = getNotes();
  let html = `<div class="chapter-header">
    <h1 class="chapter-title">My Notes</h1>
    <div class="chapter-actions">
      <div class="chapter-action-group">
        <button class="btn" id="page-export-notes">Export JSON</button>
      </div>
    </div>
  </div>`;

  if (notes.length === 0) {
    html += `<div class="empty-state">
      <div class="empty-state-icon">✎</div>
      <h3>No notes yet</h3>
      <p>Open any chapter and click "Add Note" in a section to get started.</p>
    </div>`;
  } else {
    const grouped = {};
    notes.forEach(n => {
      const k = n.chapterId;
      if (!grouped[k]) grouped[k] = { title: n.chapterTitle, notes: [] };
      grouped[k].notes.push(n);
    });

    html += '<div class="notes-page-list">';
    Object.entries(grouped).forEach(([, group]) => {
      html += `<h2 style="margin:var(--space-8) 0 var(--space-4);font-size:var(--font-size-xl)">${escapeHTML(group.title)}</h2>`;
      group.notes.forEach(n => { html += renderNoteItem(n); });
    });
    html += '</div>';
  }

  container.innerHTML = html;
  container.querySelector('#page-export-notes')?.addEventListener('click', exportNotes);
  attachNoteHandlers(container);
}
