/* ============================================================
   RCP Study Game — Service Worker
   Cache-first strategy: game is fully playable offline after
   the first load.
   ============================================================ */
const CACHE = 'rcp-study-v22-battle-worlds';

const PRECACHE = [
  '/RCPStudyGame/css/battle-world.css',
  '/RCPStudyGame/js/engine/boss-motion.js',
  '/RCPStudyGame/img/arenas/rcp103.webp',
  '/RCPStudyGame/img/arenas/rcp104.webp',
  '/RCPStudyGame/img/arenas/rcp201.webp',
  '/RCPStudyGame/img/arenas/rcp202.webp',
  '/RCPStudyGame/img/arenas/rcp203.webp',
  '/RCPStudyGame/img/arenas/rcp2xx.webp',
  '/RCPStudyGame/img/boss-motion/copd.webp',
  '/RCPStudyGame/img/boss-motion/asthma.webp',
  '/RCPStudyGame/img/boss-motion/abg.webp',
  '/RCPStudyGame/img/boss-motion/pleural.webp',
  '/RCPStudyGame/img/boss-motion/infectious.webp',
  '/RCPStudyGame/img/boss-motion/ards.webp',
  '/RCPStudyGame/img/boss-motion/ild.webp',
  '/RCPStudyGame/img/boss-motion/sleep.webp',
  '/RCPStudyGame/img/boss-motion/neuro.webp',
  '/RCPStudyGame/img/boss-motion/pvd.webp',
  '/RCPStudyGame/img/boss-motion/corticosteroids.webp',
  '/RCPStudyGame/img/boss-motion/nonsteroidal.webp',
  '/RCPStudyGame/img/boss-motion/antiinfective.webp',
  '/RCPStudyGame/img/boss-motion/antimicrobial.webp',
  '/RCPStudyGame/img/boss-motion/cold-cough.webp',
  '/RCPStudyGame/img/boss-motion/emphysema-no.webp',
  '/RCPStudyGame/img/boss-motion/nmba.webp',
  '/RCPStudyGame/img/boss-motion/diuretics.webp',
  '/RCPStudyGame/img/boss-motion/cns-drugs.webp',
  '/RCPStudyGame/img/boss-motion/vasopressors.webp',
  '/RCPStudyGame/img/boss-motion/antihypertensives.webp',
  '/RCPStudyGame/img/boss-motion/sleep-pharm.webp',
  '/RCPStudyGame/img/boss-motion/m201-s01.webp',
  '/RCPStudyGame/img/boss-motion/m201-s02.webp',
  '/RCPStudyGame/img/boss-motion/m201-s03.webp',
  '/RCPStudyGame/img/boss-motion/m201-s04.webp',
  '/RCPStudyGame/img/boss-motion/m201-s05.webp',
  '/RCPStudyGame/img/boss-motion/m201-s06.webp',
  '/RCPStudyGame/img/boss-motion/m201-s07.webp',
  '/RCPStudyGame/img/boss-motion/m201-s08.webp',
  '/RCPStudyGame/img/boss-motion/m201-s09.webp',
  '/RCPStudyGame/img/boss-motion/m201-s10.webp',
  '/RCPStudyGame/img/boss-motion/m202-s01.webp',
  '/RCPStudyGame/img/boss-motion/m202-s02.webp',
  '/RCPStudyGame/img/boss-motion/m202-s03.webp',
  '/RCPStudyGame/img/boss-motion/m202-s04.webp',
  '/RCPStudyGame/img/boss-motion/m202-s05.webp',
  '/RCPStudyGame/img/boss-motion/m202-s06.webp',
  '/RCPStudyGame/img/boss-motion/m202-s07.webp',
  '/RCPStudyGame/img/boss-motion/m202-s08.webp',
  '/RCPStudyGame/img/boss-motion/m202-s09.webp',
  '/RCPStudyGame/img/boss-motion/m202-s10.webp',
  '/RCPStudyGame/img/boss-motion/m202-s11.webp',
  '/RCPStudyGame/img/boss-motion/m202-s12.webp',
  '/RCPStudyGame/img/boss-motion/m202-s14.webp',
  '/RCPStudyGame/img/boss-motion/m203-s01.webp',
  '/RCPStudyGame/img/boss-motion/m203-s02.webp',
  '/RCPStudyGame/img/boss-motion/m203-s03.webp',
  '/RCPStudyGame/img/boss-motion/m203-s04.webp',
  '/RCPStudyGame/img/boss-motion/m203-s05.webp',
  '/RCPStudyGame/img/boss-motion/m203-s06.webp',
  '/RCPStudyGame/img/boss-motion/m203-s07.webp',
  '/RCPStudyGame/img/boss-motion/m203-s08.webp',
  '/RCPStudyGame/img/boss-motion/m203-s09.webp',
  '/RCPStudyGame/img/boss-motion/m203-s10.webp',
  '/RCPStudyGame/img/boss-motion/m203-s12.webp',
  '/RCPStudyGame/img/boss-motion/vitals-titan.webp',

  '/RCPStudyGame/',
  '/RCPStudyGame/index.html',
  '/RCPStudyGame/css/style.css',
  '/RCPStudyGame/css/theme-storybook.css',
  '/RCPStudyGame/css/theme-academy.css',
  '/RCPStudyGame/css/theme-academy-screens.css',
  '/RCPStudyGame/img/academy-room.webp',
  '/RCPStudyGame/img/academy-room-mobile.webp',
  '/RCPStudyGame/img/academy-pulmonary.webp',
  '/RCPStudyGame/img/academy-pharmacology.webp',
  '/RCPStudyGame/img/academy-clinical.webp',
  '/RCPStudyGame/img/academy-neonatal.webp',
  '/RCPStudyGame/img/academy-critical-care.webp',
  '/RCPStudyGame/img/academy-diagnostics.webp',
  '/RCPStudyGame/img/m_sky.png',
  '/RCPStudyGame/img/m_far.png',
  '/RCPStudyGame/img/m_mid.png',
  '/RCPStudyGame/img/m_near.png',
  '/RCPStudyGame/img/m_fg.png',
  '/RCPStudyGame/img/b_bg.png',
  '/RCPStudyGame/js/engine/state.js',
  '/RCPStudyGame/js/engine/academy.js',
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
  '/RCPStudyGame/img/bosses/copd.webp',
  '/RCPStudyGame/img/bosses/asthma.webp',
  '/RCPStudyGame/img/bosses/abg.webp',
  '/RCPStudyGame/img/bosses/pleural.webp',
  '/RCPStudyGame/img/bosses/infectious.webp',
  '/RCPStudyGame/img/bosses/ards.webp',
  '/RCPStudyGame/img/bosses/ild.webp',
  '/RCPStudyGame/img/bosses/sleep.webp',
  '/RCPStudyGame/img/bosses/neuro.webp',
  '/RCPStudyGame/img/bosses/pvd.webp',
  '/RCPStudyGame/img/bosses/corticosteroids.webp',
  '/RCPStudyGame/img/bosses/nonsteroidal.webp',
  '/RCPStudyGame/img/bosses/antiinfective.webp',
  '/RCPStudyGame/img/bosses/antimicrobial.webp',
  '/RCPStudyGame/img/bosses/cold-cough.webp',
  '/RCPStudyGame/img/bosses/emphysema-no.webp',
  '/RCPStudyGame/img/bosses/nmba.webp',
  '/RCPStudyGame/img/bosses/diuretics.webp',
  '/RCPStudyGame/img/bosses/cns-drugs.webp',
  '/RCPStudyGame/img/bosses/vasopressors.webp',
  '/RCPStudyGame/img/bosses/antihypertensives.webp',
  '/RCPStudyGame/img/bosses/sleep-pharm.webp',
  '/RCPStudyGame/img/bosses/m201-s01.webp',
  '/RCPStudyGame/img/bosses/m201-s02.webp',
  '/RCPStudyGame/img/bosses/m201-s03.webp',
  '/RCPStudyGame/img/bosses/m201-s04.webp',
  '/RCPStudyGame/img/bosses/m201-s05.webp',
  '/RCPStudyGame/img/bosses/m201-s06.webp',
  '/RCPStudyGame/img/bosses/m201-s07.webp',
  '/RCPStudyGame/img/bosses/m201-s08.webp',
  '/RCPStudyGame/img/bosses/m201-s09.webp',
  '/RCPStudyGame/img/bosses/m201-s10.webp',
  '/RCPStudyGame/img/bosses/m202-s01.webp',
  '/RCPStudyGame/img/bosses/m202-s02.webp',
  '/RCPStudyGame/img/bosses/m202-s03.webp',
  '/RCPStudyGame/img/bosses/m202-s04.webp',
  '/RCPStudyGame/img/bosses/m202-s05.webp',
  '/RCPStudyGame/img/bosses/m202-s06.webp',
  '/RCPStudyGame/img/bosses/m202-s07.webp',
  '/RCPStudyGame/img/bosses/m202-s08.webp',
  '/RCPStudyGame/img/bosses/m202-s09.webp',
  '/RCPStudyGame/img/bosses/m202-s10.webp',
  '/RCPStudyGame/img/bosses/m202-s11.webp',
  '/RCPStudyGame/img/bosses/m202-s12.webp',
  '/RCPStudyGame/img/bosses/m202-s14.webp',
  '/RCPStudyGame/img/bosses/m203-s01.webp',
  '/RCPStudyGame/img/bosses/m203-s02.webp',
  '/RCPStudyGame/img/bosses/m203-s03.webp',
  '/RCPStudyGame/img/bosses/m203-s04.webp',
  '/RCPStudyGame/img/bosses/m203-s05.webp',
  '/RCPStudyGame/img/bosses/m203-s06.webp',
  '/RCPStudyGame/img/bosses/m203-s07.webp',
  '/RCPStudyGame/img/bosses/m203-s08.webp',
  '/RCPStudyGame/img/bosses/m203-s09.webp',
  '/RCPStudyGame/img/bosses/m203-s10.webp',
  '/RCPStudyGame/img/bosses/m203-s12.webp',
  '/RCPStudyGame/img/bosses/vitals-titan.webp',
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
  '/RCPStudyGame/content/rcp201-midterm.js',
  '/RCPStudyGame/content/rcp202-midterm.js',
  '/RCPStudyGame/content/rcp203-midterm.js',
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
        freshCopy(url).then(resp => c.put(url, resp)).catch(error => {
          // Font providers may be unavailable; local game assets remain required.
          if (url.startsWith('/')) throw error;
        }))))
      .then(() => self.skipWaiting())
  );
});

// Activate — delete old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k.startsWith('rcp-study-') && k !== CACHE).map(k => caches.delete(k)))
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
    caches.open(CACHE).then(cache => cache.match(e.request, { ignoreSearch: sameOrigin })).then(cached => {
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
