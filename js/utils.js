/**
 * utils.js — Small utility functions
 */

/** Shorthand querySelector */
function $(selector, root = document) {
  return root.querySelector(selector);
}

/** Shorthand querySelectorAll (returns Array) */
function $$(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

/** Debounce a function */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Scroll to an element by id, with smooth behavior */
function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Basic HTML sanitizer: strips script/event-handler injection.
 * For content we fully author this is belt-and-suspenders.
 */
function sanitizeHTML(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+\s*=/gi, 'data-blocked=');
}

/** Format a date string to readable form */
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Generate a simple unique id */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/** Extract a short text snippet (n words) from HTML body text */
function snippet(html, words = 15) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.split(' ').slice(0, words).join(' ') + (text.split(' ').length > words ? '…' : '');
}

/** Escape HTML special characters */
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Check if user has scrolled near bottom of page */
function isNearBottom(threshold = 200) {
  return (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - threshold);
}
