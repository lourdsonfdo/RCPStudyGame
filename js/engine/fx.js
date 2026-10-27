/* ============================================================
   FX ENGINE — Octopath-style battle effects
   - Preserves old API (damageNumber, particles, flash, shake,
     attachFire, clearFire, banner, bossLunge, bossHit)
   - Adds: slash, beam, divineColumn, magicCircle, shockwave,
     attackBanner, chargeUp, lightning, bgDim, judgement (full
     finisher), comboStrike (multi-slash crit)
   - Adds: reset() — cancels all tracked timers and WAAPI,
     removes host/dim overlay, calls BossMotion.reset.
   - GPU-only animations (transform/opacity). No layout writes.
   - Particle pooling + position caching to keep mobile smooth.
   - Reduced-motion / paused / hidden: motion fx are suppressed
     but text feedback (damage numbers) is always shown.
   ============================================================ */
(function (global) {
  'use strict';

  // ─── Timer tracking (for reset) ────────────────────────────────
  const _timers = new Set();
  const _animations = new Set();
  function _after(ms, fn) {
    const id = setTimeout(() => { _timers.delete(id); fn(); }, ms);
    _timers.add(id);
    return id;
  }

  // ─── Reduced-motion / paused / hidden guard ─────────────────────
  function _motionOk() {
    try {
      if (global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches)
        return false;
    } catch (e) { /* ignore */ }
    if (document.body && document.body.classList &&
        document.body.classList.contains('academy-motion-paused'))
      return false;
    if (typeof document !== 'undefined' && document.hidden)
      return false;
    return true;
  }

  // ─── Shared host (single fixed overlay above everything) ───
  let host = null;
  function ensureHost() {
    if (host) return host;
    host = document.createElement('div');
    host.className = 'fx-host';
    document.body.appendChild(host);
    return host;
  }

  // ─── Particle pool (avoid GC churn during heavy bursts) ───
  const POOL_SIZE = 48;
  const pool = [];
  function getParticle() {
    let p = pool.pop();
    if (!p) p = document.createElement('div');
    p.style.cssText = '';
    p.className = '';
    return p;
  }
  function releaseParticle(p) {
    if (pool.length < POOL_SIZE) {
      p.style.cssText = 'display:none';
      pool.push(p);
    } else {
      p.remove();
    }
  }

  // ─── Position cache for current attack (cleared each tick) ───
  let cache = {};
  function rect(el, key) {
    if (!el) return null;
    if (key && cache[key]) return cache[key];
    const r = el.getBoundingClientRect();
    if (key) cache[key] = r;
    return r;
  }
  function clearCache() { cache = {}; }

  // ─── Single live banner — new one replaces the old ──────────
  let activeBanner = null;

  // ─── Background dim ref ─────────────────────────────────────
  let dimEl = null;

  // ============================================================
  // EXISTING API — kept compatible
  // ============================================================

  function damageNumber(targetEl, text, opts) {
    opts = opts || {};
    if (!targetEl) return;
    const r = rect(targetEl);
    const el = document.createElement('div');
    let cls = 'fx-dmg';
    if (opts.crit)    cls += ' crit';
    if (opts.heal)    cls += ' heal';
    if (opts.miss)    cls += ' miss';
    if (opts.bigCrit) cls += ' big-crit';
    el.className = cls;
    el.textContent = text;
    const jitter = (Math.random() - 0.5) * 40;
    el.style.left = (r.left + r.width / 2 + jitter) + 'px';
    el.style.top  = (r.top  + r.height * 0.35) + 'px';
    ensureHost().appendChild(el);
    _after(1500, () => el.remove());
  }

  function particles(targetEl, opts) {
    if (!targetEl || !_motionOk()) return;
    opts = opts || {};
    const count = opts.count || 14;
    const color = opts.color || 'gold';
    const r = rect(targetEl);
    const cx = r.left + r.width / 2;
    const cy = r.top  + r.height / 2;
    const root = ensureHost();

    for (let i = 0; i < count; i++) {
      const p = getParticle();
      p.className = 'fx-particle fx-' + color;
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const dist  = 40 + Math.random() * 60;
      p.style.cssText =
        'left:' + (cx - 3) + 'px;' +
        'top:'  + (cy - 3) + 'px;' +
        '--dx:' + (Math.cos(angle) * dist) + 'px;' +
        '--dy:' + (Math.sin(angle) * dist) + 'px;';
      root.appendChild(p);
      _after(900, () => releaseParticle(p));
    }
  }

  function flash(color, dur) {
    color = color || 'white';
    dur = dur || 200;
    if (!_motionOk()) return;
    const f = document.createElement('div');
    f.className = 'fx-flash';
    f.style.background = color;
    f.style.animationDuration = dur + 'ms';
    ensureHost().appendChild(f);
    _after(dur + 50, () => f.remove());
  }

  function shake(intensity) {
    intensity = intensity || 2;
    if (!_motionOk()) return;
    const app = document.getElementById('app') || document.body;
    const cls = 'fx-shake-' + Math.max(1, Math.min(5, intensity));
    app.classList.remove('fx-shake-1','fx-shake-2','fx-shake-3','fx-shake-4','fx-shake-5');
    void app.offsetWidth;
    app.classList.add(cls);
    _after(600, () => app.classList.remove(cls));
  }

  function attachFire(el) {
    if (!el || el.querySelector('.fx-fire')) return;
    const fire = document.createElement('div');
    fire.className = 'fx-fire';
    fire.innerHTML = '<span>🔥</span><span>🔥</span><span>🔥</span>';
    el.appendChild(fire);
  }
  function clearFire(el) {
    if (!el) return;
    const f = el.querySelector('.fx-fire');
    if (f) f.remove();
  }

  function banner(text, type) {
    type = type || 'crit';
    if (activeBanner) activeBanner.remove();
    const b = document.createElement('div');
    b.className = 'fx-banner fx-banner-' + type;
    b.textContent = text;
    activeBanner = b;
    ensureHost().appendChild(b);
    _after(900, () => { if (activeBanner === b) activeBanner = null; b.remove(); });
  }

  function bossLunge(bossEl, dir) {
    dir = dir || 1;
    if (!bossEl || !_motionOk()) return;
    bossEl.classList.remove('fx-lunge');
    void bossEl.offsetWidth;
    bossEl.style.setProperty('--lunge-dir', dir);
    bossEl.classList.add('fx-lunge');
    _after(500, () => bossEl.classList.remove('fx-lunge'));
  }

  function bossHit(bossEl) {
    if (!bossEl) return;
    // Request hit pose from atlas if mounted
    if (global.BossMotion && global.BossMotion.play) {
      global.BossMotion.play(bossEl, 'hit');
    }
    if (!_motionOk()) return;
    bossEl.classList.remove('fx-bosshit');
    void bossEl.offsetWidth;
    bossEl.classList.add('fx-bosshit');
    _after(400, () => bossEl.classList.remove('fx-bosshit'));
  }

  // ============================================================
  // NEW OCTOPATH-STYLE EFFECTS
  // ============================================================

  // ─── Slash arc at a point ───────────────────────────────────
  function slash(targetEl, opts) {
    if (!targetEl || !_motionOk()) return;
    opts = opts || {};
    const r = rect(targetEl);
    const cx = r.left + r.width / 2;
    const cy = r.top  + r.height / 2;
    const angle = opts.angle != null ? opts.angle : (-25 + (Math.random() - 0.5) * 30);
    const size  = opts.size  || 520;
    const color = opts.color || '#fff';
    const s = document.createElement('div');
    s.className = 'fx-slash';
    s.style.cssText =
      'left:' + (cx - size/2) + 'px;' +
      'top:'  + (cy - size/2) + 'px;' +
      'width:' + size + 'px;' +
      'height:' + size + 'px;' +
      '--ang:' + angle + 'deg;';
    s.innerHTML = `
      <svg viewBox="0 0 ${size} ${size}">
        <path d="M ${size*0.05},${size*0.52} Q ${size*0.5},${size*0.43} ${size*0.95},${size*0.48} Q ${size*0.5},${size*0.49} ${size*0.05},${size*0.52}"
              fill="${color}" opacity="0.95"
              style="filter: drop-shadow(0 0 12px ${color}) drop-shadow(0 0 24px ${color});"/>
        <path d="M ${size*0.05},${size*0.52} Q ${size*0.5},${size*0.43} ${size*0.95},${size*0.48}"
              fill="none" stroke="#fff" stroke-width="3"
              style="filter: drop-shadow(0 0 8px #fff);"/>
      </svg>`;
    ensureHost().appendChild(s);
    _after(500, () => s.remove());
  }

  // ─── Beam attack from player to target ──────────────────────
  function beam(fromEl, toEl, opts) {
    if (!_motionOk()) return;
    opts = opts || {};
    const a = rect(fromEl);
    const b = rect(toEl);
    if (!a || !b) return;
    const x1 = a.left + a.width / 2;
    const y1 = a.top  + a.height / 2;
    const x2 = b.left + b.width / 2;
    const y2 = b.top  + b.height / 2;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const ang = Math.atan2(dy, dx) * 180 / Math.PI;
    const el = document.createElement('div');
    el.className = 'fx-beam';
    el.style.left   = x1 + 'px';
    el.style.top    = (y1 - 6) + 'px';
    el.style.width  = len + 'px';
    el.style.transform = 'rotate(' + ang + 'deg)';
    if (opts.color) el.style.background = opts.color;
    ensureHost().appendChild(el);
    _after(600, () => el.remove());
  }

  // ─── Divine column of light over target ─────────────────────
  function divineColumn(targetEl) {
    if (!targetEl || !_motionOk()) return;
    const r = rect(targetEl);
    const cx = r.left + r.width / 2;
    const c = document.createElement('div');
    c.className = 'fx-divine-column';
    c.style.left = cx + 'px';
    ensureHost().appendChild(c);
    _after(1500, () => c.remove());
  }

  // ─── Magic circle rune at point ─────────────────────────────
  function magicCircle(targetEl, opts) {
    if (!targetEl || !_motionOk()) return;
    opts = opts || {};
    const r = rect(targetEl);
    const cx = r.left + r.width / 2;
    const cy = r.top  + r.height * (opts.atFeet ? 0.95 : 0.5);
    const size  = opts.size  || 260;
    const color = opts.color || '#ffd060';
    const m = document.createElement('div');
    m.className = 'fx-magic-circle';
    m.style.left  = cx + 'px';
    m.style.top   = cy + 'px';
    m.style.width  = size + 'px';
    m.style.height = size + 'px';
    m.innerHTML = `
      <svg viewBox="0 0 280 280" width="${size}" height="${size}">
        <g stroke="${color}" fill="none" style="filter: drop-shadow(0 0 8px ${color});">
          <circle cx="140" cy="140" r="130" stroke-width="2"/>
          <circle cx="140" cy="140" r="110" stroke-width="1" stroke-dasharray="4,6"/>
          <circle cx="140" cy="140" r="80"  stroke-width="2"/>
          <circle cx="140" cy="140" r="50"  stroke-width="1.5" stroke-dasharray="2,4"/>
          <polygon points="140,30 195,225 50,100 230,100 85,225" stroke-width="1.5" opacity="0.8"/>
          <polygon points="140,250 85,55 230,180 50,180 195,55" stroke-width="1" opacity="0.5"/>
        </g>
      </svg>`;
    ensureHost().appendChild(m);
    _after(1600, () => m.remove());
  }

  // ─── Shockwave ring at point ────────────────────────────────
  function shockwave(targetEl, opts) {
    if (!targetEl || !_motionOk()) return;
    opts = opts || {};
    const r = rect(targetEl);
    const cx = r.left + r.width / 2;
    const cy = r.top  + r.height / 2;
    const scale = opts.scale || 1;
    const s = document.createElement('div');
    s.className = 'fx-shockwave';
    s.style.left = cx + 'px';
    s.style.top  = cy + 'px';
    if (scale !== 1) s.style.setProperty('--shock-scale', scale);
    ensureHost().appendChild(s);
    _after(700, () => s.remove());
  }

  // ─── Attack banner (large Octopath name banner) ─────────────
  function attackBanner(eyebrow, name) {
    if (activeBanner) activeBanner.remove();
    const b = document.createElement('div');
    b.className = 'fx-attack-banner';
    b.innerHTML = `
      <div class="ab-eyebrow">${eyebrow}</div>
      <div class="ab-name">${name}</div>
    `;
    activeBanner = b;
    ensureHost().appendChild(b);
    _after(1300, () => { if (activeBanner === b) activeBanner = null; b.remove(); });
  }

  // ─── Charge up — particles converge on caster ───────────────
  function chargeUp(playerEl, opts) {
    if (!playerEl || !_motionOk()) return;
    opts = opts || {};
    const r = rect(playerEl);
    const cx = r.left + r.width / 2;
    const cy = r.top  + r.height / 2;
    const count = opts.count || 14;
    const dur   = opts.duration || 800;
    const root  = ensureHost();

    // aura halo
    const aura = document.createElement('div');
    aura.className = 'fx-charge-aura';
    aura.style.left = cx + 'px';
    aura.style.top  = cy + 'px';
    aura.style.animationDuration = (dur + 200) + 'ms';
    root.appendChild(aura);
    _after(dur + 250, () => aura.remove());

    // converging particles
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'fx-charge-particle';
      const ang = (Math.PI * 2 * i) / count;
      const dist = 180 + Math.random() * 60;
      const sx = cx + Math.cos(ang) * dist;
      const sy = cy + Math.sin(ang) * dist;
      p.style.left = sx + 'px';
      p.style.top  = sy + 'px';
      const anim = p.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 0 },
        { transform: 'translate(0, 0) scale(1)', opacity: 1, offset: 0.2 },
        { transform: `translate(${cx - sx}px, ${cy - sy}px) scale(0.3)`, opacity: 1 }
      ], { duration: dur, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'forwards' });
      _animations.add(anim);
      anim.onfinish = () => { _animations.delete(anim); anim.cancel(); };
      root.appendChild(p);
      _after(dur + 50, () => { _animations.delete(anim); anim.cancel(); p.remove(); });
    }
  }

  // ─── Lightning bolts (boss counter) ─────────────────────────
  function lightning(opts) {
    if (!_motionOk()) return;
    opts = opts || {};
    const strikes = opts.strikes || 3;
    const W = global.innerWidth  || 400;
    const H = global.innerHeight || 700;
    let paths = '';
    for (let i = 0; i < strikes; i++) {
      const x = 100 + Math.random() * (W - 200);
      let d = `M ${x},0`;
      let cy = 0;
      while (cy < H * 0.55) {
        cy += 30 + Math.random() * 50;
        const nx = x + (Math.random() * 60 - 30);
        d += ` L ${nx},${cy}`;
      }
      paths += `<path d="${d}" stroke="#fff" stroke-width="3" fill="none"
                  style="filter: drop-shadow(0 0 8px #aef) drop-shadow(0 0 16px #6cf);"/>`;
    }
    const l = document.createElement('div');
    l.className = 'fx-lightning';
    l.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${paths}</svg>`;
    ensureHost().appendChild(l);
    _after(500, () => l.remove());
  }

  // ─── Background dim toggle ──────────────────────────────────
  function bgDim(on) {
    if (on && !_motionOk()) return;
    if (!dimEl) {
      dimEl = document.createElement('div');
      dimEl.className = 'fx-bg-dim';
      ensureHost().appendChild(dimEl);
    }
    if (on) dimEl.classList.add('on');
    else    dimEl.classList.remove('on');
  }

  // ============================================================
  // COMPOSITE ATTACK SEQUENCES (the actual choreography)
  // ============================================================

  /**
   * Strike — basic correct answer.
   */
  function strike({ target, dmg }) {
    clearCache();
    slash(target, { angle: -25 + (Math.random() - 0.5) * 20, color: '#fff' });
    flash('rgba(255,255,255,.35)', 200);
    shake(1);
    bossHit(target);
    _after(100, () => damageNumber(target, '-' + dmg, {}));
  }

  /**
   * Lance of Light — crit (streak 3-4). Beam attack.
   */
  function lanceOfLight({ caster, target, dmg }) {
    clearCache();
    attackBanner('~ a piercing radiance ~', 'LANCE OF LIGHT');
    chargeUp(caster, { duration: 500, count: 10 });
    _after(500, () => {
      beam(caster, target);
      flash('rgba(120,240,255,.5)', 280);
      shake(2);
      bossHit(target);
      shockwave(target, { scale: 1.2 });
      particles(target, { color: 'blue', count: 16 });
      damageNumber(target, '-' + dmg, { crit: true });
    });
  }

  /**
   * Combo Strike — heavy crit (streak 5+). Multi-slash.
   */
  function comboStrike({ target, dmg }) {
    clearCache();
    attackBanner('~ a perfect strike ~', 'CRITICAL!');
    _after(250, () => {
      slash(target, { angle: -30, color: '#fff' });
      flash('rgba(255,255,255,.35)', 150);
      shockwave(target, { scale: 0.8 });
      bossHit(target);
    });
    _after(450, () => {
      slash(target, { angle: 20, color: '#ffe080' });
      flash('rgba(255,220,120,.4)', 150);
      shockwave(target, { scale: 1 });
      bossHit(target);
    });
    _after(650, () => {
      slash(target, { angle: -10, color: '#fff' });
      slash(target, { angle: 15, color: '#ffe080' });
      flash('rgba(255,255,255,.5)', 200);
      shake(3);
      shockwave(target, { scale: 1.4 });
      particles(target, { color: 'gold', count: 22 });
      bossHit(target);
      damageNumber(target, '-' + dmg, { bigCrit: true });
    });
  }

  /**
   * Judgement — finisher (killing blow). Magic circle + divine column.
   */
  function judgement({ caster, target, dmg }) {
    clearCache();
    bgDim(true);
    attackBanner('~ the heavens descend ~', 'JUDGEMENT');
    magicCircle(target, { atFeet: true, color: '#ffd060' });
    chargeUp(caster, { duration: 700, count: 14 });
    _after(900, () => {
      divineColumn(target);
    });
    _after(1500, () => {
      flash('rgba(255,220,120,.7)', 450);
      shake(4);
      bossHit(target);
      shockwave(target, { scale: 1.6 });
      particles(target, { color: 'gold', count: 24 });
      damageNumber(target, '-' + dmg, { bigCrit: true });
      bgDim(false);
    });
  }

  /**
   * Boss Counter — wrong answer.
   * opts: { playerArea, bossPortrait, bossName, dmg }
   * When BossMotion atlas is active (play returns true), skips old
   * whole-image lunge. Impact at ~600ms matches attack duration.
   * Reduced-motion: skips visual FX but still shows damage number.
   */
  function bossCounter(opts) {
    opts = opts || {};
    const { playerArea, bossPortrait, bossName, dmg } = opts;
    clearCache();

    // Boss-specific or generic counter label — never hardcoded
    const attackLabel = bossName ? bossName + ' STRIKES' : 'COUNTERATTACK';
    const eyebrow     = bossName ? '~ ' + bossName.toLowerCase() + ' retaliates ~'
                                 : '~ the guardian retaliates ~';
    attackBanner(eyebrow, attackLabel);

    // Begin attack-pose windup immediately if atlas is mounted
    const atlasActive = global.BossMotion && global.BossMotion.play
      ? global.BossMotion.play(bossPortrait, 'attack')
      : false;

    // Impact at ~600ms
    _after(600, () => {
      if (!_motionOk()) {
        // Suppressed mode: still show text feedback
        if (playerArea) damageNumber(playerArea, '-' + (dmg || 15), {});
        return;
      }
      lightning({ strikes: 4 });
      flash('rgba(255,56,85,.55)', 350);
      shake(4);
      // Skip the old whole-image lunge when atlas is active
      if (!atlasActive) bossLunge(bossPortrait, 1);
      if (playerArea) {
        particles(playerArea, { color: 'red', count: 14 });
        damageNumber(playerArea, '-' + (dmg || 15), {});
      }
    });
  }

  // ============================================================
  // RESET — cancel all FX (called on router navigate/re-render)
  // ============================================================

  function cancelVisuals() {
    // Cancel all tracked timeouts
    _timers.forEach(id => clearTimeout(id));
    _timers.clear();

    _animations.forEach(anim => anim.cancel());
    _animations.clear();
    const app = document.getElementById('app') || document.body;
    app.classList.remove('fx-shake-1','fx-shake-2','fx-shake-3','fx-shake-4','fx-shake-5');

    // Remove the FX overlay after explicitly cancelling its WAAPI animations
    if (host) {
      try { host.remove(); } catch (e) { /* ignore */ }
      host = null;
    }

    // Clear dim ref (element already removed with host)
    dimEl = null;

    // Clear banner ref
    activeBanner = null;

    // Clear position cache
    clearCache();

  }

  function reset() {
    cancelVisuals();
    // Delegate to BossMotion if available
    if (global.BossMotion && global.BossMotion.reset) {
      try { global.BossMotion.reset(); } catch (e) { /* ignore */ }
    }
  }

  // Preference changes stop effects already in flight, not only future ones.
  function syncMotion() { if (!_motionOk()) cancelVisuals(); }
  const media = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)');
  if (media && media.addEventListener) media.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(syncMotion).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  // ============================================================
  // EXPORT
  // ============================================================
  global.Fx = {
    // legacy
    damageNumber, particles, flash, shake, attachFire, clearFire,
    banner, bossLunge, bossHit,
    // primitives
    slash, beam, divineColumn, magicCircle, shockwave,
    attackBanner, chargeUp, lightning, bgDim,
    // composite sequences
    strike, lanceOfLight, comboStrike, judgement, bossCounter,
    // lifecycle
    reset,
    // utility
    clearCache,
  };
})(window);
