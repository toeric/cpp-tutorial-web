/**
 * progress.js — Track read status and quiz scores
 * All data stored in localStorage under 'progress' key.
 *
 * Schema:
 * {
 *   "1": { read: bool, quizScore: number|null, quizAttempts: number, completedAt: string|null }
 * }
 */




function getProgress() {
  return storage.get('progress', {});
}

function getChapterProgress(chapterId) {
  const all = getProgress();
  return all[String(chapterId)] || { read: false, quizScore: null, quizAttempts: 0, completedAt: null };
}

function markRead(chapterId) {
  storage.update('progress', p => ({
    ...p,
    [String(chapterId)]: {
      ...getChapterProgress(chapterId),
      read: true,
      completedAt: new Date().toISOString()
    }
  }));
  updateSidebarDot(chapterId);
}

function recordQuizScore(chapterId, score) {
  const current = getChapterProgress(chapterId);
  storage.update('progress', p => ({
    ...p,
    [String(chapterId)]: {
      ...current,
      quizScore: Math.max(score, current.quizScore || 0),
      quizAttempts: (current.quizAttempts || 0) + 1
    }
  }));
  updateSidebarDot(chapterId);
}

function getOverallStats(totalChapters) {
  const progress = getProgress();
  let read = 0, passed = 0;
  for (let i = 1; i <= totalChapters; i++) {
    const cp = progress[String(i)];
    if (cp?.read) read++;
    if (cp?.quizScore != null && cp.quizScore >= 70) passed++;
  }
  return { read, passed, total: totalChapters, pct: Math.round((read / totalChapters) * 100) };
}

/** Update the sidebar dot indicator for a chapter */
function updateSidebarDot(chapterId) {
  const dot = document.querySelector(`[data-chapter-dot="${chapterId}"]`);
  if (!dot) return;

  const cp = getChapterProgress(chapterId);
  dot.classList.remove('complete', 'in-progress');

  if (cp.read) {
    dot.classList.add('complete');
    dot.setAttribute('title', 'Read');
  } else if (cp.quizAttempts > 0) {
    dot.classList.add('in-progress');
    dot.setAttribute('title', 'Quiz attempted');
  }
}

/** Re-render all sidebar dots */
function updateAllSidebarDots() {
  const dots = document.querySelectorAll('[data-chapter-dot]');
  dots.forEach(dot => {
    const id = dot.getAttribute('data-chapter-dot');
    updateSidebarDot(id);
  });
}
