/**
 * quiz.js — Quiz engine: render, grade, record score
 */


/**
 * Render a quiz into the app container.
 * @param {HTMLElement} container - The #app element
 * @param {Object} quiz - Quiz data object
 * @param {number} chapterId
 */
function renderQuiz(container, quiz, chapterId) {
  const state = {
    current: 0,
    answers: {},   // questionId -> optionId
    correct: 0
  };

  function showQuestion() {
    const q = quiz.questions[state.current];
    const total = quiz.questions.length;
    const pct = Math.round((state.current / total) * 100);
    const answered = state.answers[q.id];

    container.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-header">
          <div class="chapter-meta">
            <span class="chapter-num-badge">Chapter ${chapterId} Quiz</span>
          </div>
          <h1 class="quiz-title">Chapter ${chapterId} Quiz</h1>
          <p class="quiz-subtitle">Test your understanding</p>
        </div>

        <div class="quiz-progress-bar">
          <div class="quiz-progress-label">
            <span>Question ${state.current + 1} of ${total}</span>
            <span>${Object.keys(state.answers).length} answered</span>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>

        <div class="question-card ${answered ? (isCorrect(q, state.answers[q.id]) ? 'correct' : 'wrong') : ''}">
          <div class="question-body">
            <div class="question-num">Question ${state.current + 1}</div>
            <div class="question-text">${q.text}</div>
          </div>

          <div class="options-list">
            ${q.options.map((opt, i) => {
              let cls = '';
              if (answered) {
                if (opt.id === answered && opt.correct) cls = 'selected-correct';
                else if (opt.id === answered && !opt.correct) cls = 'selected-wrong';
                else if (opt.correct) cls = 'show-correct';
              }
              const letters = 'ABCD';
              return `<button
                class="option-btn ${cls}"
                data-opt-id="${opt.id}"
                ${answered ? 'disabled' : ''}
                aria-label="Option ${letters[i]}: ${opt.text}"
              >
                <span class="option-indicator">${letters[i]}</span>
                <span class="option-text">${opt.text}</span>
              </button>`;
            }).join('')}
          </div>

          ${answered ? `
            <div class="explanation-box ${isCorrect(q, answered) ? 'correct' : 'wrong'}">
              <span class="explanation-label ${isCorrect(q, answered) ? 'correct' : 'wrong'}">
                ${isCorrect(q, answered) ? '✓ Correct' : '✗ Incorrect'}
              </span>
              ${escapeHTML(q.explanation)}
            </div>` : ''}
        </div>

        <div class="quiz-nav">
          ${state.current > 0 ? '<button class="btn" id="quiz-prev">← Previous</button>' : ''}
          ${answered && state.current < total - 1
            ? '<button class="btn btn-primary" id="quiz-next">Next Question →</button>'
            : ''}
          ${answered && state.current === total - 1
            ? '<button class="btn btn-primary" id="quiz-finish">See Results</button>'
            : ''}
        </div>
      </div>`;

    // Bind option buttons
    if (!answered) {
      container.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const optId = btn.dataset.optId;
          state.answers[q.id] = optId;
          if (isCorrect(q, optId)) state.correct++;
          showQuestion();
        });
      });
    }

    // Bind nav buttons
    container.querySelector('#quiz-prev')?.addEventListener('click', () => {
      state.current--;
      showQuestion();
    });
    container.querySelector('#quiz-next')?.addEventListener('click', () => {
      state.current++;
      showQuestion();
    });
    container.querySelector('#quiz-finish')?.addEventListener('click', showResults);

    // Re-highlight
    if (window.Prism) Prism.highlightAll();
  }

  function showResults() {
    const total = quiz.questions.length;
    const score = Math.round((state.correct / total) * 100);
    const pass = score >= (quiz.passingScore || 70);

    // Save score
    recordQuizScore(chapterId, score);

    const nextChapterId = chapterId + 1;

    container.innerHTML = `
      <div class="quiz-results">
        <div class="results-score-circle ${pass ? 'pass' : 'fail'}">
          <div class="results-score-num">${score}%</div>
          <div class="results-score-label">Score</div>
        </div>

        <h1 class="results-title">${pass ? 'Well done!' : 'Keep studying!'}</h1>
        <p class="results-summary">
          ${pass
            ? `You passed with ${score}% (needed ${quiz.passingScore || 70}%).`
            : `You scored ${score}% — aim for ${quiz.passingScore || 70}% to pass.`}
        </p>
        <span class="badge ${pass ? 'badge-success' : 'badge-danger'}" style="margin:0 auto var(--space-6);display:flex;width:fit-content">
          ${pass ? '✓ PASSED' : '✗ FAILED'}
        </span>

        <div class="results-stats">
          <div class="results-stat">
            <div class="results-stat-num correct">${state.correct}</div>
            <div class="results-stat-label">Correct</div>
          </div>
          <div class="results-stat">
            <div class="results-stat-num wrong">${total - state.correct}</div>
            <div class="results-stat-label">Wrong</div>
          </div>
          <div class="results-stat">
            <div class="results-stat-num" style="color:var(--text-secondary)">${total}</div>
            <div class="results-stat-label">Total</div>
          </div>
        </div>

        <div class="results-actions">
          <button class="btn" id="quiz-retry">↺ Retry Quiz</button>
          <a href="#chapter/${chapterId}" class="btn">← Back to Chapter</a>
          ${nextChapterId <= 5
            ? `<a href="#chapter/${nextChapterId}" class="btn btn-primary">Next Chapter →</a>`
            : `<a href="#home" class="btn btn-primary">⌂ Home</a>`}
        </div>
      </div>`;

    container.querySelector('#quiz-retry')?.addEventListener('click', () => {
      renderQuiz(container, quiz, chapterId);
    });
  }

  showQuestion();
}

function isCorrect(question, optionId) {
  const opt = question.options.find(o => o.id === optionId);
  return opt ? Boolean(opt.correct) : false;
}
