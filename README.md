# C++ Reference — Interactive Tutorial

A fully static, interactive C++ reference website. No installation, no server, no build tools required.

## Quick Start

1. Clone or download this repository
2. Open `index.html` directly in your browser (`File → Open` or double-click)
3. Start reading!

> **Note:** Use a modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+). The site works from `file://` without any local server.

## Features

- **6 Chapters** covering core C++ topics with concise explanations and code examples
- **Interactive Quizzes** — 8–13 questions per chapter with instant feedback and explanations
- **Fuzzy Search** — press `/` or `Ctrl+K` to search across all chapters and sections
- **Personal Notes** — add notes to any section; stored locally in your browser
- **Progress Tracking** — read status and quiz scores saved to `localStorage`
- **Syntax Highlighting** — Prism.js highlights all C++ code examples
- **Mobile Friendly** — responsive layout with collapsible sidebar

## Chapters

| # | Level | Topic | Key Concepts |
|---|---|---|---|
| 1 | Basic | STL Containers | `vector`, `array`, `string`, `string_view`, `set`, `unordered_set`, `deque`, `queue`, `map`, `unordered_map`, `emplace` |
| 2 | Basic | Virtual Functions | why virtual, vtable, dynamic dispatch, `override`, pure virtual, CRTP, `std::variant` + `std::visit` |
| 3 | Basic | Templates | type deduction, CTAD, function/class templates, variadic templates, fold expressions, concepts |
| 4 | Basic | Lambda Expressions & std::function | lambda syntax, captures, `mutable`, `std::function`, type erasure, higher-order functions, STL algorithms |
| 5 | Basic | Atomics & Mutexes | `std::atomic`, `mutex`, `lock_guard`, deadlock prevention |
| 6 | Advanced | Value Categories & Move Semantics | lvalue/rvalue, move semantics, `std::move` (with examples), `std::forward`, perfect forwarding |

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `/` | Open search |
| `Ctrl+K` | Open search |
| `Esc` | Close search / notes panel |
| `↑` `↓` | Navigate search results |
| `Enter` | Open selected search result |

## Notes & Progress

All data is stored in your browser's `localStorage` under the `cpp_tutorial__` namespace. Nothing is sent to any server.

- **Notes** can be exported as JSON via the "Export JSON" button in the Notes panel
- **Progress** resets if you clear browser data for the site

## Project Structure

```
02_cpp_tutorial/
├── index.html              # App entry point
├── css/
│   ├── theme.css           # Colors, fonts, spacing variables
│   ├── layout.css          # Sidebar + main grid
│   ├── components.css      # Buttons, cards, badges
│   ├── chapter.css         # Prose, code blocks, tables
│   ├── quiz.css            # Quiz UI
│   └── search.css          # Search overlay
├── js/
│   ├── main.js             # App entry: wires everything together
│   ├── router.js           # Hash-based SPA router (#chapter/1)
│   ├── renderer.js         # Converts chapter data to DOM
│   ├── quiz.js             # Quiz engine
│   ├── search.js           # Fuse.js fuzzy search
│   ├── notes.js            # Notes CRUD
│   ├── progress.js         # Read/quiz progress tracking
│   ├── storage.js          # localStorage wrapper
│   └── utils.js            # Helpers (escapeHTML, debounce, etc.)
├── data/
│   ├── chapters/           # Chapter content (01–06)
│   ├── quizzes/            # Quiz questions (01–06)
│   └── search-index.js     # Pre-built Fuse.js index
└── assets/
    └── diagrams/           # SVG diagrams
```

## Technical Notes

- **No build step** — vanilla JS with no modules (`import`/`export` blocked by Chrome under `file://`)
- **No frameworks** — pure HTML/CSS/JS
- **CDN only** — Prism.js and Fuse.js loaded from cdnjs.cloudflare.com

For development details and architecture notes, see [CLAUDE.md](CLAUDE.md).
