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

| File | Global name |
|---|---|
| `data/chapters/01-stl-containers.js` | `var ch1` |
| `data/chapters/02-virtual-functions.js` | `var ch2` |
| `data/chapters/03-templates.js` | `var ch3` |
| `data/chapters/04-lvalue-rvalue.js` | `var ch4` |
| `data/chapters/05-atomic-mutex.js` | `var ch5` |
| `data/quizzes/quiz-01.js` | `var q1` |
| `data/quizzes/quiz-02.js` | `var q2` |
| `data/quizzes/quiz-03.js` | `var q3` |
| `data/quizzes/quiz-04.js` | `var q4` |
| `data/quizzes/quiz-05.js` | `var q5` |
| `data/search-index.js` | `var searchIndex` |
| `js/storage.js` | `var storage` |
| `js/renderer.js` internal chapter list | `var _chapterList` |
| `js/main.js` chapter array | `var _mainChapters` |
| `js/main.js` quiz map | `var _mainQuizzes` |

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
2. `layout.css` — sidebar, main content grid, responsive breakpoints
3. `components.css` — buttons, badges, cards, home page
4. `chapter.css` — prose, code blocks, complexity tables
5. `quiz.css` — quiz cards and results
6. `search.css` — search overlay

### localStorage

Namespaced with `cpp_tutorial__` prefix:
- `cpp_tutorial__progress` — `{ "1": { read, quizScore, quizAttempts, completedAt } }`
- `cpp_tutorial__notes` — `[{ id, chapterId, sectionId, text, createdAt, updatedAt }]`
- `cpp_tutorial__settings` — `{ lastVisited: "#chapter/2" }`

All access goes through `js/storage.js` (`storage.get()`, `storage.set()`, `storage.update()`).

## Adding Content

### New Chapter

1. Create `data/chapters/0N-name.js` with `var chN = { id, slug, title, estimatedMinutes, tags, sections: [...] }`
2. Add `<script src="data/chapters/0N-name.js"></script>` to `index.html` before app scripts
3. Add `chN` to `_mainChapters` array in `js/main.js`
4. Create matching quiz `data/quizzes/quiz-0N.js` with `var qN = { chapterId, passingScore, questions: [...] }`
5. Add quiz script tag to `index.html` and `qN` to `_mainQuizzes` in `js/main.js`
6. Add section entries to `data/search-index.js`

### Chapter Data Schema

```js
var chN = {
  id: N,
  slug: "kebab-case-slug",
  title: "Chapter Title",
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
