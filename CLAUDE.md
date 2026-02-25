# CLAUDE.md — C++ Tutorial Website

## Project Overview

A fully static, interactive C++ reference website. No build tools, no bundlers, no server required — works directly from `file://` in any modern browser.

## Architecture

### No-Build Constraint

**Critical**: Chrome blocks ES module `import` from `file://` URLs (CORS/null-origin restriction). All JS files use plain `var` globals — no `import`/`export` anywhere.

`index.html` loads every file as a regular `<script>` tag in dependency order:
1. Data files first (`data/chapters/*.js`, `data/quizzes/*.js`, `data/search-index.js`)
2. Then app scripts (`js/storage.js` → `js/utils.js` → `js/router.js` → ... → `js/main.js`)

### Global Variable Naming

To avoid collisions in the shared global scope:

| File | Global name | Chapter `id` |
|---|---|---|
| `data/chapters/01-stl-containers.js` | `var ch1` | 1 |
| `data/chapters/02-virtual-functions.js` | `var ch2` | 2 |
| `data/chapters/03-templates.js` | `var ch3` | 3 |
| `data/chapters/06-lambdas.js` | `var ch6` | **4** |
| `data/chapters/05-atomic-mutex.js` | `var ch5` | 5 |
| `data/chapters/04-lvalue-rvalue.js` | `var ch4` | **6** |
| `data/quizzes/quiz-01.js` | `var q1` | chapterId 1 |
| `data/quizzes/quiz-02.js` | `var q2` | chapterId 2 |
| `data/quizzes/quiz-03.js` | `var q3` | chapterId 3 |
| `data/quizzes/quiz-06.js` | `var q6` | chapterId **4** |
| `data/quizzes/quiz-05.js` | `var q5` | chapterId 5 |
| `data/quizzes/quiz-04.js` | `var q4` | chapterId **6** |
| `data/search-index.js` | `var searchIndex` | — |
| `js/storage.js` | `var storage` | — |
| `js/renderer.js` internal chapter list | `var _chapterList` | — |
| `js/main.js` chapter array | `var _mainChapters` | — |
| `js/main.js` quiz map | `var _mainQuizzes` | — |

> **Important:** Filenames and variable names do NOT necessarily match the chapter `id`. The `id` field inside the data object is the authoritative chapter number (used for URLs, routing, and quiz linking). The `_mainChapters` array order in `main.js` controls the sidebar display order; `_mainQuizzes` is keyed by `id`. When chapters are reordered, update the `id` fields, the array order, the quiz map keys, and all `chapterId`/`hash` entries in `search-index.js`.

**Never** use `const KEY` at the top level — it caused a duplicate identifier error between `progress.js` and `notes.js`. Use inline string literals instead.

### Routing

Hash-based SPA. `router.js` listens to `hashchange` and dispatches to:
- `#home` → `renderHome()`
- `#chapter/:id` → `renderChapter()`
- `#chapter/:id/:sectionId` → `renderChapter()` + scroll to section
- `#quiz/:id` → `renderQuiz()`
- `#notes` → `renderNotesPage()`
- `#progress` → `renderProgressPage()`

### CSS Architecture

All colors, spacing, radii, and shadows are CSS custom properties in `css/theme.css`. Never hardcode dark-mode specific values (e.g., `rgba(255,255,255,0.02)`) in component files.

Theme is **light only** (soft indigo/lavender palette). Prism.js uses `prism-one-light` theme.

CSS load order in `index.html`:
1. `theme.css` — variables and reset
2. `layout.css` — sidebar, main content grid, responsive breakpoints (also defines `.sidebar-level-badge` for compact badges in the nav)
3. `components.css` — buttons, badges, cards, home page (defines `.badge-basic` / `.badge-advanced`)
4. `chapter.css` — prose, code blocks, complexity tables
5. `quiz.css` — quiz cards and results
6. `search.css` — search overlay

The `level` field on a chapter drives `badge-basic` (green) / `badge-advanced` (orange) badges in three places: sidebar nav (`.sidebar-level-badge` shrinks them to 9 px), chapter header, and home page cards.

### localStorage

Namespaced with `cpp_tutorial__` prefix:
- `cpp_tutorial__progress` — `{ "1": { read, quizScore, quizAttempts, completedAt } }`
- `cpp_tutorial__notes` — `[{ id, chapterId, sectionId, text, createdAt, updatedAt }]`
- `cpp_tutorial__settings` — `{ lastVisited: "#chapter/2" }`

All access goes through `js/storage.js` (`storage.get()`, `storage.set()`, `storage.update()`).

## Adding Content

### New Chapter

1. Create `data/chapters/0N-name.js` with `var chN = { id, slug, title, level, estimatedMinutes, tags, sections: [...] }`
2. Add `<script src="data/chapters/0N-name.js"></script>` to `index.html` before app scripts
3. Add `chN` at the correct position in `_mainChapters` array in `js/main.js` (array order = sidebar display order)
4. Create matching quiz `data/quizzes/quiz-0N.js` with `var qN = { chapterId, passingScore, questions: [...] }`
5. Add quiz script tag to `index.html` and add `qN` to `_mainQuizzes` keyed by the chapter's `id` in `js/main.js`
6. Add section entries to `data/search-index.js` with correct `chapterId` and `hash: '#chapter/<id>/...'`

### Chapter Data Schema

```js
var chN = {
  id: N,                      // authoritative chapter number — drives URLs, routing, quiz linking
  slug: "kebab-case-slug",
  title: "Chapter Title",
  level: "basic",             // "basic" or "advanced" — shown as badge in sidebar and chapter header
  estimatedMinutes: 12,
  tags: ["tag1", "tag2"],
  sections: [{
    id: "section-id",           // used for anchor links
    title: "Section Title",
    content: `<p>HTML content here...</p>`,
    codeBlocks: [{
      language: "cpp",
      caption: "Optional caption",
      code: `// C++ code here`
    }],
    diagrams: [{
      type: "ascii",            // or "svg"
      content: `diagram text`,  // for ascii
      src: "assets/diagrams/x.svg",  // for svg
      caption: "Caption"
    }],
    complexityTable: {          // optional
      rows: [{ operation, complexity, notes }]
    }
  }]
};
```

### Quiz Data Schema

```js
var qN = {
  chapterId: N,
  passingScore: 70,
  questions: [{
    id: "q1",
    text: "Question text?",
    options: [
      { id: "a", text: "Option A" },
      { id: "b", text: "Option B", correct: true },
      { id: "c", text: "Option C" },
      { id: "d", text: "Option D" }
    ],
    explanation: "Explanation shown after answering."
  }]
};
```

## SVG Diagrams

Located in `assets/diagrams/`. Referenced from chapter data as `"assets/diagrams/name.svg"`.

## CDN Dependencies

- **Prism.js** 1.29.0 (syntax highlighting) — light theme: `prism-one-light.min.css`
- **Fuse.js** 7.0.0 (fuzzy search)
