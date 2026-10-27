/* Six drawn poses per guardian. No transform-based whole-portrait bobbing.
   3x2 atlas: neutral, inhale, wind-up, strike, recoil, recovery. */
(function (global) {
  'use strict';
  const mounted = new Map();
  const media = global.matchMedia('(prefers-reduced-motion: reduce)');
  const durations = { attack: 1000, hit: 480, defeat: 900 };
  function paused() {
    return media.matches || document.hidden ||
      document.body.classList.contains('academy-motion-paused');
  }
  function attach(portrait, { bossId } = {}) {
    if (!portrait || !bossId) return () => {};
    if (mounted.has(portrait)) mounted.get(portrait).dispose();
    let timer = null, disposed = false, ready = false;
    const layer = document.createElement('span');
    layer.className = 'boss-pose';
    layer.setAttribute('aria-hidden', 'true');
    const sheet = new Image();
    const source = new URL(`img/boss-motion/${encodeURIComponent(bossId)}.webp`, document.baseURI).href;
    function cancel() { if (timer !== null) clearTimeout(timer); timer = null; }
    function pose(index) {
      portrait.dataset.pose = String(index);
      layer.style.backgroundPosition = `${(index % 3) * 50}% ${Math.floor(index / 3) * 100}%`;
    }
    function later(callback, delay) {
      cancel();
      timer = setTimeout(() => {
        timer = null;
        if (disposed || !portrait.isConnected) { dispose(); return; }
        if (paused()) { idle(); return; }
        callback();
      }, delay);
    }
    function idle(index = 0) {
      cancel();
      if (disposed || !ready) return;
      portrait.dataset.motionState = 'idle';
      pose(index);
      if (!paused()) later(() => idle(index ? 0 : 1), 1250);
    }
    function play(state) {
      if (!ready || disposed) return false;
      cancel();
      if (paused()) { idle(); return true; }
      portrait.dataset.motionState = state;
      if (state === 'attack') {
        pose(2);
        later(() => { pose(3); later(() => { pose(5); later(idle, 300); }, 350); }, 350);
      } else if (state === 'hit') {
        pose(4);
        later(() => { pose(5); later(idle, 260); }, 220);
      } else if (state === 'defeat') {
        pose(4);
        later(() => { pose(5); portrait.dataset.motionState = 'defeat'; }, 900);
      } else idle();
      return true;
    }
    function dispose() {
      if (disposed) return;
      disposed = true;
      cancel();
      layer.remove();
      delete portrait.dataset.motionReady;
      delete portrait.dataset.motionState;
      delete portrait.dataset.pose;
      mounted.delete(portrait);
    }
    mounted.set(portrait, { play, dispose, sync: () => idle() });
    sheet.onload = () => {
      if (disposed || !portrait.isConnected) return;
      layer.style.backgroundImage = `url("${source}")`;
      portrait.appendChild(layer);
      ready = true;
      portrait.dataset.motionReady = 'true';
      idle();
    };
    sheet.onerror = dispose;
    sheet.src = source;
    return dispose;
  }
  function sync() { mounted.forEach(controller => controller.sync()); }
  media.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  global.BossMotion = {
    attach,
    play: (portrait, state) => mounted.get(portrait)?.play(state) || false,
    reset: () => [...mounted.values()].forEach(controller => controller.dispose()),
    duration: state => durations[state] || 0,
  };
})(window);
