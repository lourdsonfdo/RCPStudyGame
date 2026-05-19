/* ============================================================
   FX ENGINE — particles, floating damage numbers, screen flash,
   screen shake, streak fire. All DOM-based for simplicity.
   ============================================================ */
(function (global) {
  'use strict';

  // ── Floating damage number ──────────────────────────────────
  function damageNumber(targetEl, text, opts = {}) {
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'fx-dmg' + (opts.crit ? ' crit' : '') + (opts.heal ? ' heal' : '') + (opts.miss ? ' miss' : '');
    el.textContent = text;
    // Random horizontal jitter so multiple numbers don't stack
    const jitter = (Math.random() - 0.5) * 40;
    el.style.left = (rect.left + rect.width / 2 + jitter) + 'px';
    el.style.top  = (rect.top  + rect.height * 0.35) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }

  // ── Particle burst from element center ──────────────────────
  // color: 'green'|'red'|'gold'|'blue'|'fire'
  function particles(targetEl, opts = {}) {
    if (!targetEl) return;
    const count = opts.count || 14;
    const color = opts.color || 'gold';
    const rect = targetEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'fx-particle fx-' + color;
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const dist  = 40 + Math.random() * 60;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      p.style.left = (cx - 3) + 'px';
      p.style.top  = (cy - 3) + 'px';
      p.style.setProperty('--dx', dx + 'px');
      p.style.setProperty('--dy', dy + 'px');
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 900);
    }
  }

  // ── Full-screen color flash ─────────────────────────────────
  function flash(color = 'white', dur = 200) {
    const f = document.createElement('div');
    f.className = 'fx-flash';
    f.style.background = color;
    f.style.animationDuration = dur + 'ms';
    document.body.appendChild(f);
    setTimeout(() => f.remove(), dur + 50);
  }

  // ── Screen shake (intensity 1-5) ────────────────────────────
  function shake(intensity = 2) {
    const app = document.getElementById('app') || document.body;
    app.classList.remove('fx-shake-1','fx-shake-2','fx-shake-3','fx-shake-4','fx-shake-5');
    void app.offsetWidth; // force reflow
    app.classList.add('fx-shake-' + Math.max(1, Math.min(5, intensity)));
    setTimeout(() => {
      app.classList.remove('fx-shake-' + Math.max(1, Math.min(5, intensity)));
    }, 500);
  }

  // ── Streak fire — attaches flames behind an element ─────────
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

  // ── Crit / Combo banner ────────────────────────────────────
  function banner(text, type = 'crit') {
    const b = document.createElement('div');
    b.className = 'fx-banner fx-banner-' + type;
    b.textContent = text;
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 900);
  }

  // ── Boss lunge — quick translate + rotate then settle ──────
  function bossLunge(bossEl, dir = 1) {
    if (!bossEl) return;
    bossEl.classList.remove('fx-lunge');
    void bossEl.offsetWidth;
    bossEl.style.setProperty('--lunge-dir', dir);
    bossEl.classList.add('fx-lunge');
    setTimeout(() => bossEl.classList.remove('fx-lunge'), 500);
  }

  // ── Boss hit reaction — flash white + brief shrink ─────────
  function bossHit(bossEl) {
    if (!bossEl) return;
    bossEl.classList.remove('fx-bosshit');
    void bossEl.offsetWidth;
    bossEl.classList.add('fx-bosshit');
    setTimeout(() => bossEl.classList.remove('fx-bosshit'), 400);
  }

  global.Fx = { damageNumber, particles, flash, shake, attachFire, clearFire, banner, bossLunge, bossHit };
})(window);
