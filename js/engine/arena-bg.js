/* ============================================================
   ARENA-BG ENGINE — inject animated parallax layers into arena
   Usage: ArenaBg.attach(arenaEl, { mode: 'battle' | 'crisis' | 'victory' | 'defeat' });
   Auto-applies the arena-<mode> class and adds animated children.
   ============================================================ */
(function (global) {
  'use strict';

  function attach(arenaEl, opts = {}) {
    if (!arenaEl) return;
    const mode = opts.mode || 'battle';

    // Apply modifier class
    arenaEl.classList.remove('arena-battle','arena-crisis','arena-victory','arena-defeat');
    arenaEl.classList.add('arena-' + mode);

    // Remove any prior background layers
    arenaEl.querySelectorAll('.arena-bg, .arena-mote').forEach(n => n.remove());

    // Inject background container
    const bg = document.createElement('div');
    bg.className = 'arena-bg';
    bg.innerHTML = `
      <div class="arena-bg-clouds"></div>
      <div class="arena-bg-beam"></div>
    `;
    arenaEl.insertBefore(bg, arenaEl.firstChild);

    // Spawn 6-10 floating motes (color depends on mode)
    const moteColors = {
      battle:  ['m-red','m-gold','m-red'],
      crisis:  ['m-green','','m-green'],
      victory: ['m-gold','m-gold','m-green'],
      defeat:  ['','m-red','m-red'],
    }[mode] || [''];
    const count = 8;
    for (let i = 0; i < count; i++) {
      const m = document.createElement('div');
      m.className = 'arena-mote ' + moteColors[i % moteColors.length];
      m.style.left = (Math.random() * 90 + 5) + '%';
      m.style.animationDuration = (4 + Math.random() * 4) + 's';
      m.style.animationDelay = (-Math.random() * 6) + 's';
      bg.appendChild(m);
    }
  }

  global.ArenaBg = { attach };
})(window);
