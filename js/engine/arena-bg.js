/* ============================================================
   ARENA-BG ENGINE — inject animated parallax layers into arena
   Usage: ArenaBg.attach(arenaEl, { mode, course });
     mode:   'battle' | 'crisis' | 'victory' | 'defeat'
     course: 'rcp103' | 'rcp104' | 'rcp201' | 'rcp202' | 'rcp203' | 'rcp2xx' | 'rcp202f' | 'rcp203f' | 'rcptmc'
   In battle mode with an allowed course, stamps data-battle-world
   and resolves --battle-world-art for CSS art selection.
   ============================================================ */
(function (global) {
  'use strict';

  const BATTLE_COURSES = new Set(['rcp103','rcp104','rcp201','rcp202','rcp203','rcp2xx','rcp202f','rcp203f','rcptmc']);

  function attach(arenaEl, opts) {
    if (!arenaEl) return;
    opts = opts || {};
    const mode   = opts.mode   || 'battle';
    const course = opts.course || null;

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

    // Battle-world art: stamp data attribute and CSS custom property
    // A course without its own backdrop borrows one through Academy.COURSES[].arena.
    const info = course && global.Academy ? global.Academy.course(course) : null;
    const world = BATTLE_COURSES.has(course) ? course : (info && info.arena) || null;
    if (mode === 'battle' && world && BATTLE_COURSES.has(world)) {
      arenaEl.setAttribute('data-battle-world', world);
      const artPath = 'img/arenas/' + world + '.webp';
      const base = (typeof document !== 'undefined' && document.baseURI) || '';
      const artUrl = base ? new URL(artPath, base).href : artPath;
      arenaEl.style.setProperty('--battle-world-art', 'url("' + artUrl + '")');
    } else {
      arenaEl.removeAttribute('data-battle-world');
      arenaEl.style.removeProperty('--battle-world-art');
    }
  }

  global.ArenaBg = { attach };
})(window);
