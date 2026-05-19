/* ============================================================
   AUDIO ENGINE — background music with MP3 + procedural fallback
   Global is `Audio_` (trailing underscore) to avoid clobbering
   the native window.Audio constructor.
   ============================================================ */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'rcpsg_audio';

  const TRACKS = [
    { id: 'off',  label: 'Off',  emoji: '🔇' },
    { id: 'calm', label: 'Calm', emoji: '🌙', file: 'audio/calm.mp3' },
    { id: 'fast', label: 'Fast', emoji: '⚡', file: 'audio/fast.mp3' },
  ];

  let state = loadState();
  let audioEl = null;
  let proceduralCtx = null;
  let proceduralNodes = [];
  let proceduralInterval = null;
  let usingProcedural = false;
  let listeners = [];

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { track: 'off', volume: 0.6 };
      const p = JSON.parse(raw);
      return { track: p.track || 'off', volume: typeof p.volume === 'number' ? p.volume : 0.6 };
    } catch { return { track: 'off', volume: 0.6 }; }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function stop() {
    if (audioEl) {
      try { audioEl.pause(); } catch {}
      audioEl.src = '';
      audioEl = null;
    }
    if (proceduralInterval) {
      clearInterval(proceduralInterval);
      proceduralInterval = null;
    }
    if (proceduralCtx) {
      proceduralNodes.forEach(n => { try { n.stop(); } catch {} try { n.disconnect(); } catch {} });
      proceduralNodes = [];
      try { proceduralCtx.close(); } catch {}
      proceduralCtx = null;
    }
    usingProcedural = false;
  }

  function play(trackId) {
    stop();
    state.track = trackId;
    saveState();
    notify();
    if (trackId === 'off') return;
    const t = TRACKS.find(t => t.id === trackId);
    if (!t || !t.file) return;

    audioEl = new global.Audio(t.file);
    audioEl.loop = true;
    audioEl.volume = state.volume;
    audioEl.addEventListener('error', () => {
      audioEl = null;
      startProcedural(trackId);
    });
    const p = audioEl.play();
    if (p && p.catch) {
      p.catch(() => {
        audioEl = null;
        startProcedural(trackId);
      });
    }
  }

  function startProcedural(trackId) {
    try {
      const AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return;
      proceduralCtx = new AC();
      usingProcedural = true;

      const master = proceduralCtx.createGain();
      master.gain.value = state.volume * 0.25;
      master.connect(proceduralCtx.destination);

      if (trackId === 'calm') buildCalmLoop(proceduralCtx, master);
      else if (trackId === 'fast') buildFastLoop(proceduralCtx, master);
      notify();
    } catch (e) {
      console.warn('Procedural audio failed:', e);
      usingProcedural = false;
    }
  }

  // ────────────────────────────────────────────────────────────
  // SHARED INSTRUMENT / DRUM HELPERS (used by both procedural loops)
  // ────────────────────────────────────────────────────────────

  function _noiseBuffer(ctx, durSec) {
    const len = Math.floor(ctx.sampleRate * durSec);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  function kick(ctx, master, t, vol = 1) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.32 * vol, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(env); env.connect(master);
    osc.start(t); osc.stop(t + 0.22);
    proceduralNodes.push(osc);
  }

  function snare(ctx, master, t, vol = 1, bright = true) {
    const noise = ctx.createBufferSource();
    noise.buffer = _noiseBuffer(ctx, 0.18);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = bright ? 1800 : 900;
    bp.Q.value = 0.8;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.18 * vol, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    noise.connect(bp); bp.connect(env); env.connect(master);
    noise.start(t); noise.stop(t + 0.18);
    proceduralNodes.push(noise);
  }

  function hihat(ctx, master, t, vol = 1, dur = 0.04) {
    const noise = ctx.createBufferSource();
    noise.buffer = _noiseBuffer(ctx, 0.08);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.07 * vol, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + dur);
    noise.connect(hp); hp.connect(env); env.connect(master);
    noise.start(t); noise.stop(t + dur + 0.02);
    proceduralNodes.push(noise);
  }

  function tone(ctx, master, t, freq, dur, opts = {}) {
    // opts: { type, vol, attack, sustain, release, lpHz }
    const type    = opts.type    || 'square';
    const vol     = opts.vol     ?? 0.1;
    const attack  = opts.attack  ?? 0.005;
    const sustain = opts.sustain ?? vol * 0.7;
    const release = opts.release ?? dur * 0.3;
    const lpHz    = opts.lpHz    || null;

    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;

    let chain = osc;
    let lp = null;
    if (lpHz) {
      lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = lpHz;
      osc.connect(lp);
      chain = lp;
    }

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(vol, t + attack);
    env.gain.linearRampToValueAtTime(sustain, t + Math.max(attack + 0.01, dur - release));
    env.gain.linearRampToValueAtTime(0, t + dur);
    chain.connect(env); env.connect(master);
    osc.start(t); osc.stop(t + dur + 0.01);
    proceduralNodes.push(osc);
  }

  function vinylCrackle(ctx, master) {
    // 2-sec looping buffer of sparse pops + hiss
    const sec = 2;
    const len = Math.floor(ctx.sampleRate * sec);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      // Sparse pops layered with thin hiss
      const pop  = (Math.random() < 0.004) ? (Math.random() * 2 - 1) * 0.7 : 0;
      const hiss = (Math.random() * 2 - 1) * 0.04;
      data[i] = pop + hiss;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1500;
    const g = ctx.createGain();
    g.gain.value = 0.06;
    noise.connect(hp); hp.connect(g); g.connect(master);
    noise.start();
    proceduralNodes.push(noise);
  }

  // ────────────────────────────────────────────────────────────
  // CALM — Lo-fi (jazz 7th chords, soft piano lead, brushed drums, vinyl)
  // ────────────────────────────────────────────────────────────

  function buildCalmLoop(ctx, master) {
    // ~75 BPM. Quarter = 0.8s. 4 beats per chord. 4 chords per loop = 12.8s.
    const BEAT = 0.8;
    const CHORD = 4 * BEAT;

    // Fmaj7 → Em7 → Dm7 → G7 — classic lofi
    const progression = [
      {
        pad:    [87.31, 110.00, 130.81, 164.81],   // F3 A3 C4 E4
        bass:   [87.31, 87.31, 130.81, 87.31],     // F2-ish walks: F3-F3-C4-F3 (root + 5th flavor)
        melody: [440.00, 523.25, 440.00, 349.23],  // A4-C5-A4-F4
      },
      {
        pad:    [82.41, 98.00, 123.47, 146.83],    // E3 G3 B3 D4
        bass:   [82.41, 82.41, 123.47, 82.41],
        melody: [392.00, 493.88, 392.00, 329.63],  // G4-B4-G4-E4
      },
      {
        pad:    [73.42, 87.31, 110.00, 130.81],    // D3 F3 A3 C4
        bass:   [73.42, 73.42, 110.00, 73.42],
        melody: [349.23, 440.00, 349.23, 293.66],  // F4-A4-F4-D4
      },
      {
        pad:    [98.00, 123.47, 146.83, 174.61],   // G3 B3 D4 F4
        bass:   [98.00, 98.00, 146.83, 98.00],
        melody: [493.88, 587.33, 493.88, 349.23],  // B4-D5-B4-F4
      },
    ];

    const loopDur = progression.length * CHORD;

    function schedule(start) {
      progression.forEach((chord, ci) => {
        const t0 = start + ci * CHORD;

        // Soft pad — slow attack sine cluster, lasts full chord
        chord.pad.forEach(f => {
          tone(ctx, master, t0, f, CHORD, {
            type: 'sine', vol: 0.06, attack: 0.5, sustain: 0.04, release: 0.6, lpHz: 1400,
          });
        });

        // Quarter-note bass (warm sine, gentle)
        chord.bass.forEach((bf, bi) => {
          const t = t0 + bi * BEAT;
          tone(ctx, master, t, bf * 0.5, BEAT * 0.9, {  // octave down for bass
            type: 'sine', vol: 0.15, attack: 0.03, sustain: 0.08, release: BEAT * 0.4, lpHz: 700,
          });
        });

        // Quarter-note melody (warm triangle, piano-like)
        chord.melody.forEach((mf, mi) => {
          const t = t0 + mi * BEAT;
          tone(ctx, master, t, mf, BEAT * 0.85, {
            type: 'triangle', vol: 0.11, attack: 0.02, sustain: 0.035, release: BEAT * 0.5, lpHz: 2200,
          });
        });

        // Brushed drums — boom-bap pattern with swing
        kick  (ctx, master, t0 + 0 * BEAT, 0.7);          // beat 1 — soft kick
        snare (ctx, master, t0 + 1 * BEAT, 0.4, false);   // beat 2 — muffled snare
        kick  (ctx, master, t0 + 2 * BEAT + 0.15, 0.5);   // beat 3.2 — syncopated ghost kick
        snare (ctx, master, t0 + 3 * BEAT, 0.45, false);  // beat 4 — muffled snare
        // Soft hi-hat on every 8th
        for (let i = 0; i < 8; i++) {
          hihat(ctx, master, t0 + i * (BEAT / 2), 0.35, 0.03);
        }
      });
    }

    // Continuous vinyl crackle texture
    vinylCrackle(ctx, master);

    schedule(ctx.currentTime + 0.1);
    schedule(ctx.currentTime + 0.1 + loopDur);
    proceduralInterval = setInterval(() => {
      if (!proceduralCtx) { clearInterval(proceduralInterval); return; }
      schedule(proceduralCtx.currentTime + 0.05);
    }, loopDur * 1000);
  }

  // ────────────────────────────────────────────────────────────
  // FAST — Final Fantasy battle (Andalusian minor, arpeggio lead, walking bass, drums)
  // ────────────────────────────────────────────────────────────

  function buildFastLoop(ctx, master) {
    // ~150 BPM. Beat = 0.4s. 4 beats per chord. 4 chords = 6.4s loop.
    const BEAT = 0.4;
    const EIGHTH = BEAT / 2;
    const CHORD = 4 * BEAT;

    // Andalusian cadence: Am → G → F → E (very FF battle)
    const progression = [
      {
        // Am: A-C-E
        arp:  [440.00, 523.25, 659.25, 880.00, 659.25, 523.25, 440.00, 523.25],
        bass: [110.00, 110.00, 82.41,  110.00],   // A2-A2-E2-A2
      },
      {
        // G: G-B-D
        arp:  [392.00, 493.88, 587.33, 783.99, 587.33, 493.88, 392.00, 493.88],
        bass: [ 98.00,  98.00, 73.42,   98.00],   // G2-G2-D2-G2
      },
      {
        // F: F-A-C
        arp:  [349.23, 440.00, 523.25, 698.46, 523.25, 440.00, 349.23, 440.00],
        bass: [ 87.31,  87.31, 65.41,   87.31],   // F2-F2-C2-F2
      },
      {
        // E (major, dominant for cadence back to Am): E-G#-B
        arp:  [329.63, 415.30, 493.88, 659.25, 493.88, 415.30, 329.63, 415.30],
        bass: [ 82.41,  82.41, 61.74,   82.41],   // E2-E2-B1-E2
      },
    ];

    const loopDur = progression.length * CHORD;

    function schedule(start) {
      progression.forEach((chord, ci) => {
        const t0 = start + ci * CHORD;

        // Lead arpeggio — 8 eighth-notes (NES square-wave lead)
        chord.arp.forEach((f, i) => {
          const t = t0 + i * EIGHTH;
          tone(ctx, master, t, f, EIGHTH * 0.92, {
            type: 'square', vol: 0.10, attack: 0.005, sustain: 0.07, release: EIGHTH * 0.3,
          });
        });

        // Walking bass — quarter notes, triangle wave for warmth
        chord.bass.forEach((bf, bi) => {
          const t = t0 + bi * BEAT;
          tone(ctx, master, t, bf, BEAT * 0.95, {
            type: 'triangle', vol: 0.20, attack: 0.005, sustain: 0.13, release: BEAT * 0.4,
          });
        });

        // Sub-octave bass pulse on beats 1 and 3 for thickness
        for (const bi of [0, 2]) {
          const t = t0 + bi * BEAT;
          tone(ctx, master, t, chord.bass[bi] * 0.5, BEAT * 0.5, {
            type: 'sawtooth', vol: 0.08, attack: 0.005, sustain: 0.05, release: BEAT * 0.2, lpHz: 200,
          });
        }

        // Drum kit — driving rock beat
        kick (ctx, master, t0 + 0 * BEAT, 1);           // 1
        snare(ctx, master, t0 + 1 * BEAT, 0.9, true);   // 2
        kick (ctx, master, t0 + 2 * BEAT, 1);           // 3
        snare(ctx, master, t0 + 3 * BEAT, 0.9, true);   // 4
        // 16th-note hi-hat for energy
        for (let i = 0; i < 16; i++) {
          hihat(ctx, master, t0 + i * (BEAT / 4), 0.45, 0.025);
        }
        // Extra kick on the and-of-3 for syncopation
        kick(ctx, master, t0 + 2.5 * BEAT, 0.6);
      });
    }

    schedule(ctx.currentTime + 0.1);
    schedule(ctx.currentTime + 0.1 + loopDur);
    proceduralInterval = setInterval(() => {
      if (!proceduralCtx) { clearInterval(proceduralInterval); return; }
      schedule(proceduralCtx.currentTime + 0.05);
    }, loopDur * 1000);
  }

  function setVolume(v) {
    state.volume = Math.max(0, Math.min(1, v));
    saveState();
    if (audioEl) audioEl.volume = state.volume;
    if (usingProcedural) {
      const track = state.track;
      stop();
      play(track);
    }
    notify();
  }

  function get() { return { track: state.track, volume: state.volume, usingProcedural }; }
  function tracks() { return TRACKS.slice(); }

  function subscribe(fn) {
    listeners.push(fn);
    return () => { listeners = listeners.filter(f => f !== fn); };
  }
  function notify() { listeners.forEach(f => { try { f(get()); } catch {} }); }

  global.Audio_ = { play, stop, setVolume, get, tracks, subscribe };
})(window);
