/**
 * router.js — Hash-based SPA router (file:// compatible)
 * Routes: #home | #chapter/:id | #quiz/:id | #notes | #progress
 */


var routes = {};
var currentHash = '';

/** Register a route handler.
 *  pattern: 'home' | 'chapter' | 'quiz' | 'notes' | 'progress'
 */
function route(pattern, handler) {
  routes[pattern] = handler;
}

/** Parse the current location.hash into { name, params } */
function parseHash(hash) {
  const h = (hash || window.location.hash).replace(/^#\/?/, '');
  if (!h || h === 'home' || h === '') return { name: 'home', params: {} };

  const parts = h.split('/');
  const name = parts[0];
  const params = {};

  if (parts[1]) params.id = isNaN(parts[1]) ? parts[1] : Number(parts[1]);

  return { name, params };
}

/** Navigate to a given hash string (without #) */
function navigate(hashPath) {
  window.location.hash = hashPath;
}

/** Trigger current route (re-render) */
function refresh() {
  dispatch(window.location.hash);
}

function dispatch(hash) {
  if (hash === currentHash && hash !== '') return; // avoid re-render on same route
  currentHash = hash;

  const { name, params } = parseHash(hash);

  // Save last visited
  if (hash) storage.update('settings', s => ({ ...s, lastVisited: hash }));

  const handler = routes[name] || routes['404'];
  if (handler) {
    handler(params);
  } else {
    console.warn('[router] No handler for route:', name);
    const fallback = routes['home'];
    if (fallback) fallback({});
  }
}

/** Initialize the router */
function initRouter() {
  window.addEventListener('hashchange', () => dispatch(window.location.hash));

  // Handle initial load — restore last visited page if no hash in URL
  const settings = storage.get('settings', {});
  const initialHash = window.location.hash || settings.lastVisited || '#home';
  dispatch(initialHash);
}
