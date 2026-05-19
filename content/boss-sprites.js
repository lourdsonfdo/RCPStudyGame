/* ============================================================
   BOSS SPRITES — pixel-art SVGs keyed by boss id.
   Wrapped at render time in <div class="boss-portrait">.
   ============================================================ */
(function () {
  const sprites = {
    // COPD — The Blue Bloater: barrel-chested cyanotic figure, small head, pursed lips, smog wisp.
    copd: `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="1" width="4" height="3" fill="#6a8caa"/>
      <rect x="7" y="2" width="1" height="1" fill="#1a2030"/>
      <rect x="9" y="2" width="1" height="1" fill="#1a2030"/>
      <rect x="7" y="3" width="2" height="1" fill="#3a5070"/>
      <rect x="3" y="4" width="10" height="7" fill="#4a78a8"/>
      <rect x="4" y="5" width="2" height="2" fill="#6aa0d0"/>
      <rect x="10" y="5" width="2" height="2" fill="#6aa0d0"/>
      <rect x="5" y="8" width="6" height="1" fill="#2a4868"/>
      <rect x="5" y="10" width="6" height="1" fill="#2a4868"/>
      <rect x="2" y="11" width="2" height="3" fill="#4a78a8"/>
      <rect x="12" y="11" width="2" height="3" fill="#4a78a8"/>
      <rect x="4" y="11" width="8" height="3" fill="#3a6090"/>
      <rect x="5" y="14" width="2" height="2" fill="#1a2030"/>
      <rect x="9" y="14" width="2" height="2" fill="#1a2030"/>
      <rect x="0" y="0" width="2" height="1" fill="#888888aa"/>
      <rect x="1" y="1" width="2" height="1" fill="#aaaaaaaa"/>
      <rect x="13" y="1" width="3" height="1" fill="#888888aa"/>
      <rect x="14" y="2" width="2" height="1" fill="#aaaaaaaa"/>
    </svg>`,

    // ASTHMA — The Hyperresponsive: constricted Y-shaped bronchial tubes, spiky inflammation, lightning.
    asthma: `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="2" width="3" height="3" fill="#d04040"/>
      <rect x="10" y="2" width="3" height="3" fill="#d04040"/>
      <rect x="4" y="5" width="2" height="2" fill="#a02020"/>
      <rect x="10" y="5" width="2" height="2" fill="#a02020"/>
      <rect x="5" y="7" width="2" height="1" fill="#a02020"/>
      <rect x="9" y="7" width="2" height="1" fill="#a02020"/>
      <rect x="6" y="8" width="4" height="2" fill="#a02020"/>
      <rect x="7" y="10" width="2" height="5" fill="#a02020"/>
      <rect x="7" y="3" width="1" height="1" fill="#ff8080"/>
      <rect x="11" y="3" width="1" height="1" fill="#ff8080"/>
      <rect x="2" y="1" width="1" height="2" fill="#ffcc00"/>
      <rect x="1" y="3" width="2" height="1" fill="#ffcc00"/>
      <rect x="13" y="1" width="1" height="2" fill="#ffcc00"/>
      <rect x="13" y="3" width="2" height="1" fill="#ffcc00"/>
      <rect x="0" y="8" width="2" height="1" fill="#ff8000"/>
      <rect x="14" y="8" width="2" height="1" fill="#ff8000"/>
      <rect x="6" y="14" width="1" height="2" fill="#ff8000"/>
      <rect x="9" y="14" width="1" height="2" fill="#ff8000"/>
      <rect x="7" y="12" width="2" height="1" fill="#ffffff88"/>
    </svg>`,

    // ABG — The Acid-Base Specter: floating ghost split green/blue, pH balance scale eyes.
    abg: `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="1" width="6" height="1" fill="#40c060"/>
      <rect x="4" y="2" width="4" height="10" fill="#40c060"/>
      <rect x="8" y="2" width="4" height="10" fill="#3080d0"/>
      <rect x="3" y="3" width="1" height="8" fill="#40c060"/>
      <rect x="12" y="3" width="1" height="8" fill="#3080d0"/>
      <rect x="5" y="2" width="3" height="1" fill="#80e0a0"/>
      <rect x="8" y="2" width="3" height="1" fill="#70b0e0"/>
      <rect x="6" y="5" width="1" height="2" fill="#ffffff"/>
      <rect x="9" y="5" width="1" height="2" fill="#ffffff"/>
      <rect x="6" y="6" width="1" height="1" fill="#1a2030"/>
      <rect x="9" y="6" width="1" height="1" fill="#1a2030"/>
      <rect x="6" y="9" width="4" height="1" fill="#1a2030"/>
      <rect x="3" y="12" width="2" height="1" fill="#40c060"/>
      <rect x="7" y="12" width="2" height="1" fill="#60a098"/>
      <rect x="11" y="12" width="2" height="1" fill="#3080d0"/>
      <rect x="3" y="13" width="1" height="1" fill="#40c06088"/>
      <rect x="11" y="13" width="2" height="1" fill="#3080d088"/>
      <rect x="7" y="14" width="2" height="1" fill="#60a09888"/>
    </svg>`,

    // PLEURAL — Tension Wraith: hourglass body squeezed in middle, air bubble escaping, grey/silver+red.
    pleural: `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="1" width="10" height="3" fill="#a0a0b0"/>
      <rect x="4" y="2" width="2" height="1" fill="#d0d0e0"/>
      <rect x="10" y="2" width="2" height="1" fill="#d0d0e0"/>
      <rect x="4" y="4" width="8" height="1" fill="#808090"/>
      <rect x="5" y="5" width="6" height="1" fill="#606070"/>
      <rect x="6" y="6" width="4" height="2" fill="#404050"/>
      <rect x="5" y="8" width="6" height="1" fill="#606070"/>
      <rect x="4" y="9" width="8" height="1" fill="#808090"/>
      <rect x="3" y="10" width="10" height="4" fill="#a0a0b0"/>
      <rect x="4" y="11" width="2" height="1" fill="#d0d0e0"/>
      <rect x="10" y="11" width="2" height="1" fill="#d0d0e0"/>
      <rect x="3" y="14" width="3" height="2" fill="#606070"/>
      <rect x="10" y="14" width="3" height="2" fill="#606070"/>
      <rect x="5" y="2" width="1" height="1" fill="#d04040"/>
      <rect x="10" y="2" width="1" height="1" fill="#d04040"/>
      <rect x="13" y="7" width="2" height="1" fill="#e0e0f0"/>
      <rect x="14" y="6" width="1" height="2" fill="#e0e0f088"/>
      <rect x="15" y="5" width="1" height="1" fill="#e0e0f088"/>
    </svg>`,

    // INFECTIOUS — The Consolidation King: bloated spotted germ-king with crown, sickly green/yellow.
    infectious: `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="0" width="1" height="2" fill="#ffd040"/>
      <rect x="7" y="0" width="2" height="2" fill="#ffd040"/>
      <rect x="11" y="0" width="1" height="2" fill="#ffd040"/>
      <rect x="4" y="2" width="8" height="1" fill="#ffd040"/>
      <rect x="4" y="3" width="1" height="1" fill="#d04040"/>
      <rect x="10" y="3" width="1" height="1" fill="#d04040"/>
      <rect x="7" y="3" width="1" height="1" fill="#40c060"/>
      <rect x="3" y="4" width="10" height="9" fill="#90b040"/>
      <rect x="3" y="5" width="1" height="6" fill="#70a020"/>
      <rect x="12" y="5" width="1" height="6" fill="#70a020"/>
      <rect x="5" y="6" width="2" height="2" fill="#ffffff"/>
      <rect x="9" y="6" width="2" height="2" fill="#ffffff"/>
      <rect x="6" y="7" width="1" height="1" fill="#1a2030"/>
      <rect x="9" y="7" width="1" height="1" fill="#1a2030"/>
      <rect x="6" y="10" width="4" height="1" fill="#1a2030"/>
      <rect x="7" y="11" width="2" height="2" fill="#d04040"/>
      <rect x="5" y="5" width="1" height="1" fill="#ffd84088"/>
      <rect x="10" y="9" width="1" height="1" fill="#ffd84088"/>
      <rect x="4" y="9" width="1" height="1" fill="#ffd84088"/>
      <rect x="11" y="6" width="1" height="1" fill="#ffd84088"/>
      <rect x="2" y="13" width="3" height="2" fill="#70a020"/>
      <rect x="11" y="13" width="3" height="2" fill="#70a020"/>
    </svg>`,

    // ARDS — Hyaline Hydra: 3-headed serpent, glassy blue+purple+white highlights.
    ards: `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="2" width="3" height="3" fill="#6040a0"/>
      <rect x="7" y="1" width="3" height="3" fill="#6040a0"/>
      <rect x="12" y="2" width="3" height="3" fill="#6040a0"/>
      <rect x="2" y="3" width="1" height="1" fill="#ffffff"/>
      <rect x="8" y="2" width="1" height="1" fill="#ffffff"/>
      <rect x="13" y="3" width="1" height="1" fill="#ffffff"/>
      <rect x="1" y="5" width="3" height="1" fill="#6040a0"/>
      <rect x="7" y="4" width="3" height="1" fill="#6040a0"/>
      <rect x="12" y="5" width="3" height="1" fill="#6040a0"/>
      <rect x="2" y="6" width="2" height="2" fill="#4080d0"/>
      <rect x="7" y="5" width="3" height="3" fill="#4080d0"/>
      <rect x="12" y="6" width="2" height="2" fill="#4080d0"/>
      <rect x="3" y="8" width="10" height="5" fill="#4080d0"/>
      <rect x="3" y="9" width="10" height="1" fill="#80c0e0"/>
      <rect x="5" y="10" width="2" height="2" fill="#6040a0"/>
      <rect x="9" y="10" width="2" height="2" fill="#6040a0"/>
      <rect x="4" y="13" width="8" height="1" fill="#4080d0"/>
      <rect x="5" y="14" width="6" height="1" fill="#3060a0"/>
      <rect x="3" y="9" width="1" height="1" fill="#ffffff88"/>
      <rect x="12" y="9" width="1" height="1" fill="#ffffff88"/>
    </svg>`,

    // ILD — The Honeycomb Husk: skeletal dried figure with honeycomb pattern, tan/brown palette.
    ild: `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="1" width="4" height="3" fill="#a07040"/>
      <rect x="7" y="2" width="1" height="1" fill="#1a1010"/>
      <rect x="9" y="2" width="1" height="1" fill="#1a1010"/>
      <rect x="7" y="3" width="2" height="1" fill="#604020"/>
      <rect x="4" y="4" width="8" height="9" fill="#806040"/>
      <rect x="5" y="5" width="2" height="1" fill="#403020"/>
      <rect x="9" y="5" width="2" height="1" fill="#403020"/>
      <rect x="6" y="6" width="1" height="1" fill="#a08060"/>
      <rect x="9" y="6" width="1" height="1" fill="#a08060"/>
      <rect x="5" y="7" width="2" height="1" fill="#403020"/>
      <rect x="9" y="7" width="2" height="1" fill="#403020"/>
      <rect x="7" y="7" width="2" height="1" fill="#403020"/>
      <rect x="6" y="8" width="1" height="1" fill="#a08060"/>
      <rect x="9" y="8" width="1" height="1" fill="#a08060"/>
      <rect x="5" y="9" width="2" height="1" fill="#403020"/>
      <rect x="9" y="9" width="2" height="1" fill="#403020"/>
      <rect x="7" y="9" width="2" height="1" fill="#403020"/>
      <rect x="6" y="10" width="1" height="1" fill="#a08060"/>
      <rect x="9" y="10" width="1" height="1" fill="#a08060"/>
      <rect x="5" y="11" width="2" height="1" fill="#403020"/>
      <rect x="9" y="11" width="2" height="1" fill="#403020"/>
      <rect x="3" y="13" width="3" height="3" fill="#604020"/>
      <rect x="10" y="13" width="3" height="3" fill="#604020"/>
      <rect x="6" y="13" width="4" height="2" fill="#806040"/>
    </svg>`,

    // SLEEP — Apnea Phantom: drowsy ghost, sagging eyelids, Zzz trail, dark indigo.
    sleep: `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="2" width="8" height="1" fill="#3020a0"/>
      <rect x="3" y="3" width="10" height="9" fill="#3020a0"/>
      <rect x="2" y="5" width="1" height="6" fill="#3020a0"/>
      <rect x="13" y="5" width="1" height="6" fill="#3020a0"/>
      <rect x="5" y="6" width="2" height="1" fill="#ffffff"/>
      <rect x="9" y="6" width="2" height="1" fill="#ffffff"/>
      <rect x="5" y="7" width="2" height="1" fill="#604080"/>
      <rect x="9" y="7" width="2" height="1" fill="#604080"/>
      <rect x="6" y="10" width="4" height="1" fill="#1a1030"/>
      <rect x="3" y="12" width="2" height="1" fill="#3020a0"/>
      <rect x="6" y="12" width="2" height="1" fill="#3020a0"/>
      <rect x="9" y="12" width="2" height="1" fill="#3020a0"/>
      <rect x="12" y="12" width="2" height="1" fill="#3020a0"/>
      <rect x="2" y="13" width="12" height="2" fill="#604080"/>
      <rect x="1" y="14" width="14" height="2" fill="#806090"/>
      <rect x="12" y="1" width="2" height="1" fill="#80c0ff"/>
      <rect x="13" y="2" width="1" height="1" fill="#80c0ff"/>
      <rect x="14" y="3" width="1" height="1" fill="#80c0ff"/>
      <rect x="13" y="4" width="2" height="1" fill="#80c0ff"/>
      <rect x="11" y="0" width="1" height="1" fill="#80c0ff88"/>
    </svg>`,

    // NEURO — The Paralytic: wilting humanoid, hanging arms, fade-out extremities, pale yellow-green.
    neuro: `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="1" width="4" height="3" fill="#c0d080"/>
      <rect x="7" y="2" width="1" height="1" fill="#1a2030"/>
      <rect x="9" y="2" width="1" height="1" fill="#1a2030"/>
      <rect x="7" y="3" width="2" height="1" fill="#608040"/>
      <rect x="5" y="4" width="6" height="6" fill="#a0b070"/>
      <rect x="4" y="5" width="1" height="3" fill="#a0b070"/>
      <rect x="11" y="5" width="1" height="3" fill="#a0b070"/>
      <rect x="3" y="8" width="1" height="3" fill="#a0b07088"/>
      <rect x="12" y="8" width="1" height="3" fill="#a0b07088"/>
      <rect x="2" y="11" width="1" height="2" fill="#a0b07055"/>
      <rect x="13" y="11" width="1" height="2" fill="#a0b07055"/>
      <rect x="6" y="10" width="4" height="3" fill="#a0b070"/>
      <rect x="5" y="13" width="2" height="2" fill="#a0b07088"/>
      <rect x="9" y="13" width="2" height="2" fill="#a0b07088"/>
      <rect x="6" y="15" width="1" height="1" fill="#a0b07055"/>
      <rect x="9" y="15" width="1" height="1" fill="#a0b07055"/>
      <rect x="0" y="6" width="1" height="1" fill="#608040"/>
      <rect x="2" y="7" width="1" height="1" fill="#608040"/>
      <rect x="13" y="6" width="1" height="1" fill="#608040"/>
      <rect x="15" y="9" width="1" height="1" fill="#608040"/>
      <rect x="1" y="14" width="1" height="1" fill="#608040"/>
    </svg>`,

    // PVD — The Drowning Heart: heart shape with water rising, bubbles, red+blue, dark clot.
    pvd: `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="2" width="3" height="2" fill="#d04040"/>
      <rect x="10" y="2" width="3" height="2" fill="#d04040"/>
      <rect x="2" y="3" width="5" height="3" fill="#d04040"/>
      <rect x="9" y="3" width="5" height="3" fill="#d04040"/>
      <rect x="2" y="6" width="12" height="3" fill="#d04040"/>
      <rect x="3" y="9" width="10" height="2" fill="#d04040"/>
      <rect x="4" y="11" width="8" height="1" fill="#d04040"/>
      <rect x="5" y="12" width="6" height="1" fill="#d04040"/>
      <rect x="6" y="13" width="4" height="1" fill="#d04040"/>
      <rect x="7" y="14" width="2" height="1" fill="#d04040"/>
      <rect x="3" y="3" width="1" height="1" fill="#ff8080"/>
      <rect x="10" y="3" width="1" height="1" fill="#ff8080"/>
      <rect x="2" y="9" width="12" height="1" fill="#3080d0aa"/>
      <rect x="3" y="10" width="10" height="1" fill="#3080d0aa"/>
      <rect x="4" y="11" width="8" height="1" fill="#3080d0aa"/>
      <rect x="5" y="12" width="6" height="1" fill="#3080d0aa"/>
      <rect x="0" y="11" width="2" height="5" fill="#3080d0"/>
      <rect x="14" y="11" width="2" height="5" fill="#3080d0"/>
      <rect x="1" y="8" width="1" height="1" fill="#80c0e0"/>
      <rect x="14" y="7" width="1" height="1" fill="#80c0e0"/>
      <rect x="6" y="5" width="1" height="1" fill="#80c0e0"/>
      <rect x="8" y="7" width="2" height="2" fill="#1a1010"/>
    </svg>`,
  };
  window.BOSS_SPRITES = Object.assign(window.BOSS_SPRITES || {}, sprites);
})();
