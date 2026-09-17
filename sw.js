/* ============================================================
   RCP Study Game — Service Worker
   Cache-first strategy: game is fully playable offline after
   the first load.
   ============================================================ */
const CACHE = 'rcp-study-v12-fresh-precache';

const PRECACHE = [
  '/RCPStudyGame/',
  '/RCPStudyGame/index.html',
  '/RCPStudyGame/css/style.css',
  '/RCPStudyGame/css/theme-storybook.css',
  '/RCPStudyGame/img/m_sky.png',
  '/RCPStudyGame/img/m_far.png',
  '/RCPStudyGame/img/m_mid.png',
  '/RCPStudyGame/img/m_near.png',
  '/RCPStudyGame/img/m_fg.png',
  '/RCPStudyGame/img/b_bg.png',
  '/RCPStudyGame/js/engine/state.js',
  '/RCPStudyGame/js/engine/audio.js',
  '/RCPStudyGame/js/engine/fx.js',
  '/RCPStudyGame/js/engine/arena-bg.js',
  '/RCPStudyGame/js/engine/battle.js',
  '/RCPStudyGame/js/engine/crisis.js',
  '/RCPStudyGame/js/engine/shop.js',
  '/RCPStudyGame/js/engine/superboss.js',
  '/RCPStudyGame/js/app.js',
  '/RCPStudyGame/js/screens/home.js',
  '/RCPStudyGame/js/screens/course-mode.js',
  '/RCPStudyGame/js/screens/boss-select.js',
  '/RCPStudyGame/js/screens/prep-camp.js',
  '/RCPStudyGame/js/screens/training.js',
  '/RCPStudyGame/js/screens/battle.js',
  '/RCPStudyGame/js/screens/results.js',
  '/RCPStudyGame/js/screens/scenario-select.js',
  '/RCPStudyGame/js/screens/crisis.js',
  '/RCPStudyGame/js/screens/outcome.js',
  '/RCPStudyGame/js/screens/settings.js',
  '/RCPStudyGame/js/screens/level-up.js',
  '/RCPStudyGame/js/screens/survival.js',
  '/RCPStudyGame/js/screens/review-answers.js',
  '/RCPStudyGame/js/screens/superboss-briefing.js',
  '/RCPStudyGame/js/screens/superboss.js',
  '/RCPStudyGame/content/stub.js',
  '/RCPStudyGame/content/boss-sprites.js',
  '/RCPStudyGame/content/rcp103-bosses.js',
  '/RCPStudyGame/content/rcp104-bosses.js',
  '/RCPStudyGame/content/rcp103-q-a.js',
  '/RCPStudyGame/content/rcp103-q-b.js',
  '/RCPStudyGame/content/rcp103-q-training.js',
  '/RCPStudyGame/content/rcp103-q-battle-extras.js',
  '/RCPStudyGame/content/rcp104-q-a.js',
  '/RCPStudyGame/content/rcp104-q-b.js',
  '/RCPStudyGame/content/rcp104-q-training.js',
  '/RCPStudyGame/content/rcp104-q-battle-extras.js',
  '/RCPStudyGame/content/rcp103-scenarios.js',
  '/RCPStudyGame/content/rcp104-scenarios.js',
  '/RCPStudyGame/content/rcp2xx-superboss.js',
  '/RCPStudyGame/content/rcp202-values.js',
  '/RCPStudyGame/content/rcp203-values.js',
  '/RCPStudyGame/icons/icon-192.png',
  '/RCPStudyGame/icons/icon-512.png',
  '/RCPStudyGame/icons/apple-touch-icon.png',
  'https://fonts.googleapis.com/css2?family=Cormorant+SC:wght@500;600;700&family=Crimson+Pro:ital,wght@0,400;0,500;0,600;1,400&family=Pixelify+Sans:wght@500;600&family=JetBrains+Mono:wght@400;500;700&display=swap'
];

// Install — precache all game assets.
//
// GitHub Pages' CDN keeps each file for ~10 minutes, and a new worker installs
// right after a deploy -- while the CDN may still be serving the PREVIOUS
// version. A plain addAll() would pin that stale copy under the fresh cache
// name, and bumping CACHE would not help. So each same-origin file is fetched
// with a per-deploy query string (a URL the CDN has never cached) and
// `cache: 'reload'` (skips the browser's HTTP cache), then stored under its
// plain URL.
function freshCopy(url) {
  const sameOrigin = url.startsWith('/');
  const target = sameOrigin
    ? url + (url.includes('?') ? '&' : '?') + 'sw=' + encodeURIComponent(CACHE)
    : url;
  return fetch(target, { cache: 'reload' }).then(resp => {
    if (!resp.ok) throw new Error('precache failed for ' + url + ': ' + resp.status);
    return resp;
  });
}

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(PRECACHE.map(url =>
        freshCopy(url).then(resp => c.put(url, resp)))))
      .then(() => self.skipWaiting())
  );
});

// Activate — delete old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — cache-first, fall back to network
self.addEventListener('fetch', e => {
  // Don't intercept non-GET or chrome-extension requests
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith('http')) return;

  // Our own files are requested with cache-busting queries (?v=...), but the
  // precache stores them under their plain URL, so ignore the query when
  // matching. Cross-origin URLs (fonts) keep theirs -- the query IS the request.
  const sameOrigin = new URL(e.request.url).origin === self.location.origin;

  e.respondWith(
    caches.match(e.request, { ignoreSearch: sameOrigin }).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        // Cache successful responses for our own origin (under the plain URL)
        if (resp.ok && (sameOrigin || e.request.url.includes('fonts.g'))) {
          const key = sameOrigin ? e.request.url.split('?')[0] : e.request;
          caches.open(CACHE).then(c => c.put(key, resp.clone()));
        }
        return resp;
      });
    })
  );
});
