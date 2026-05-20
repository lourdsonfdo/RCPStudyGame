/* ============================================================
   AUDIO ENGINE — background music with MP3 + procedural fallback
   Global is `Audio_` (trailing underscore) to avoid clobbering
   the native window.Audio constructor.
   ============================================================ */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'rcpsg_audio';

  const TRACKS = [
    { id: 'off',     label: 'Off',           emoji: '🔇' },
    { id: 'calm',    label: 'Lo-fi',         emoji: '🌙', file: 'audio/calm.mp3' },
    { id: 'fast',    label: 'Battle Hymn',   emoji: '⚡', file: 'audio/fast.mp3' },
    { id: 'fast2',   label: 'Boss Approach', emoji: '⚔️', file: 'audio/fast2.mp3' },
    { id: 'fast3',   label: 'Final Stand',   emoji: '🔥', file: 'audio/fast3.mp3' },
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

      if (trackId === 'calm')       buildCalmLoop(proceduralCtx, master);
      else if (trackId === 'fast')  buildBattleHymn(proceduralCtx, master);
      else if (trackId === 'fast2') buildBossApproach(proceduralCtx, master);
      else if (trackId === 'fast3') buildFinalStand(proceduralCtx, master);
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
  // CALM — Lo-fi (cleaned up: pure sine waves, master low-pass,
  // no vinyl crackle, no hi-hat, soft sine-tom instead of snare)
  // ────────────────────────────────────────────────────────────

  function softTom(ctx, master, t, freq = 110, vol = 0.18, dur = 0.22) {
    // Soft sine tom — replaces noise-based snare for smoother feel
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.6, t);
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.08);
    const env = ctx.createGain();
    env.gain.setValueAtTime(vol, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(env); env.connect(master);
    osc.start(t); osc.stop(t + dur + 0.02);
    proceduralNodes.push(osc);
  }

  function buildCalmLoop(ctx, master) {
    // ~75 BPM. Quarter = 0.8s. 4 beats per chord. 4 chords per loop = 12.8s.
    const BEAT = 0.8;
    const CHORD = 4 * BEAT;

    // Insert a master low-pass between the loop and the destination for warmth
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3500;
    lp.Q.value = 0.7;
    // Re-route: build a sub-bus that the rest of the loop writes to
    const calmBus = ctx.createGain();
    calmBus.gain.value = 1;
    calmBus.connect(lp);
    lp.connect(master);
    const out = calmBus;

    // Fmaj7 → Em7 → Dm7 → G7 — classic lofi progression
    const progression = [
      { pad: [87.31, 110.00, 130.81, 164.81], bass: [87.31, 87.31, 130.81, 87.31], melody: [440.00, 523.25, 440.00, 349.23] },
      { pad: [82.41,  98.00, 123.47, 146.83], bass: [82.41, 82.41, 123.47, 82.41], melody: [392.00, 493.88, 392.00, 329.63] },
      { pad: [73.42,  87.31, 110.00, 130.81], bass: [73.42, 73.42, 110.00, 73.42], melody: [349.23, 440.00, 349.23, 293.66] },
      { pad: [98.00, 123.47, 146.83, 174.61], bass: [98.00, 98.00, 146.83, 98.00], melody: [493.88, 587.33, 493.88, 349.23] },
    ];

    const loopDur = progression.length * CHORD;

    function schedule(start) {
      progression.forEach((chord, ci) => {
        const t0 = start + ci * CHORD;

        // Soft pad — slow-attack sine cluster, lasts full chord
        chord.pad.forEach(f => {
          tone(ctx, out, t0, f, CHORD, {
            type: 'sine', vol: 0.06, attack: 0.6, sustain: 0.04, release: 0.7, lpHz: 1200,
          });
        });

        // Quarter-note bass — pure sine, deep low-pass
        chord.bass.forEach((bf, bi) => {
          const t = t0 + bi * BEAT;
          tone(ctx, out, t, bf * 0.5, BEAT * 0.95, {
            type: 'sine', vol: 0.18, attack: 0.04, sustain: 0.10, release: BEAT * 0.45, lpHz: 500,
          });
        });

        // Quarter-note melody — pure sine for maximum smoothness
        chord.melody.forEach((mf, mi) => {
          const t = t0 + mi * BEAT;
          tone(ctx, out, t, mf, BEAT * 0.85, {
            type: 'sine', vol: 0.10, attack: 0.05, sustain: 0.04, release: BEAT * 0.55, lpHz: 2000,
          });
        });

        // Drums — only a deep kick + soft sine-tom on the off-beats. NO hi-hat, NO snare-noise.
        kick   (ctx, out, t0 + 0 * BEAT, 0.55);
        softTom(ctx, out, t0 + 1 * BEAT, 180, 0.10);
        kick   (ctx, out, t0 + 2 * BEAT + 0.12, 0.42);
        softTom(ctx, out, t0 + 3 * BEAT, 180, 0.10);
      });
    }

    schedule(ctx.currentTime + 0.1);
    schedule(ctx.currentTime + 0.1 + loopDur);
    proceduralInterval = setInterval(() => {
      if (!proceduralCtx) { clearInterval(proceduralInterval); return; }
      schedule(proceduralCtx.currentTime + 0.05);
    }, loopDur * 1000);
  }

  // ────────────────────────────────────────────────────────────
  // FAST 1 — "Battle Hymn" — Andalusian Am-G-F-E, classic FF battle
  // ────────────────────────────────────────────────────────────

  function buildBattleHymn(ctx, master) {
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

  // ────────────────────────────────────────────────────────────
  // FAST 2 — "Boss Approach" — slower (~125 BPM), darker, menacing.
  // Em → D → C → B7 (Phrygian-flavored descent), sawtooth bass for grit.
  // ────────────────────────────────────────────────────────────

  function buildBossApproach(ctx, master) {
    const BEAT = 60 / 125;        // ~0.48s
    const EIGHTH = BEAT / 2;
    const CHORD = 4 * BEAT;

    const progression = [
      // Em: E-G-B
      { arp:  [329.63, 392.00, 493.88, 659.25, 493.88, 392.00, 329.63, 392.00],
        bass: [82.41,  82.41,  41.20,  82.41] },  // E2-E2-E1-E2
      // D: D-F#-A
      { arp:  [293.66, 369.99, 440.00, 587.33, 440.00, 369.99, 293.66, 369.99],
        bass: [73.42,  73.42,  36.71,  73.42] },  // D2-D2-D1-D2
      // C: C-E-G
      { arp:  [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63, 329.63],
        bass: [65.41,  65.41,  32.70,  65.41] },  // C2-C2-C1-C2
      // B (major dom7): B-D#-F#
      { arp:  [246.94, 311.13, 369.99, 493.88, 369.99, 311.13, 246.94, 311.13],
        bass: [61.74,  61.74,  30.87,  61.74] },  // B1-B1-B0-B1
    ];

    const loopDur = progression.length * CHORD;

    function schedule(start) {
      progression.forEach((chord, ci) => {
        const t0 = start + ci * CHORD;

        // Lead arpeggio — square wave, slightly softer than Battle Hymn
        chord.arp.forEach((f, i) => {
          const t = t0 + i * EIGHTH;
          tone(ctx, master, t, f, EIGHTH * 0.85, {
            type: 'square', vol: 0.085, attack: 0.008, sustain: 0.06, release: EIGHTH * 0.35,
          });
        });

        // Sawtooth bass — darker, grittier
        chord.bass.forEach((bf, bi) => {
          const t = t0 + bi * BEAT;
          tone(ctx, master, t, bf, BEAT * 0.95, {
            type: 'sawtooth', vol: 0.16, attack: 0.005, sustain: 0.10, release: BEAT * 0.4, lpHz: 500,
          });
        });

        // Sparse drums — half-time feel for menacing pacing
        kick (ctx, master, t0 + 0 * BEAT, 1);
        snare(ctx, master, t0 + 2 * BEAT, 0.85, true);   // backbeat on 3 only
        // 8th-note hi-hat (less busy than Battle Hymn)
        for (let i = 0; i < 8; i++) {
          hihat(ctx, master, t0 + i * (BEAT / 2), 0.35, 0.03);
        }
      });
    }

    schedule(ctx.currentTime + 0.1);
    schedule(ctx.currentTime + 0.1 + loopDur);
    proceduralInterval = setInterval(() => {
      if (!proceduralCtx) { clearInterval(proceduralInterval); return; }
      schedule(proceduralCtx.currentTime + 0.05);
    }, loopDur * 1000);
  }

  // ────────────────────────────────────────────────────────────
  // FAST 3 — "Final Stand" — fastest (~175 BPM), frantic 16th-note arp,
  // Dm → Bb → F → A7 (dramatic minor turnaround), double-time drums.
  // ────────────────────────────────────────────────────────────

  function buildFinalStand(ctx, master) {
    const BEAT = 60 / 175;        // ~0.343s
    const SIXTEENTH = BEAT / 4;
    const CHORD = 4 * BEAT;

    // 16 sixteenth-notes per chord — twice the density of Battle Hymn's 8th notes
    const progression = [
      // Dm: D-F-A
      { arp:  [293.66, 349.23, 440.00, 587.33, 440.00, 349.23, 293.66, 349.23,
               293.66, 349.23, 440.00, 587.33, 698.46, 587.33, 440.00, 349.23],
        bass: [73.42, 73.42, 73.42, 73.42, 110.00, 110.00, 73.42, 73.42] },  // D2/D2/A2 walking
      // Bb: Bb-D-F
      { arp:  [233.08, 293.66, 349.23, 466.16, 349.23, 293.66, 233.08, 293.66,
               233.08, 293.66, 349.23, 466.16, 587.33, 466.16, 349.23, 293.66],
        bass: [58.27, 58.27, 58.27, 58.27, 87.31, 87.31, 58.27, 58.27] },     // Bb1/Bb1/F2
      // F: F-A-C
      { arp:  [349.23, 440.00, 523.25, 698.46, 523.25, 440.00, 349.23, 440.00,
               349.23, 440.00, 523.25, 698.46, 880.00, 698.46, 523.25, 440.00],
        bass: [87.31, 87.31, 87.31, 87.31, 130.81, 130.81, 87.31, 87.31] },   // F2/F2/C3
      // A7: A-C#-E
      { arp:  [440.00, 554.37, 659.25, 880.00, 659.25, 554.37, 440.00, 554.37,
               440.00, 554.37, 659.25, 880.00, 1108.73, 880.00, 659.25, 554.37],
        bass: [110.00, 110.00, 82.41, 110.00, 82.41, 82.41, 110.00, 82.41] }, // A2 + E2 alternation
    ];

    const loopDur = progression.length * CHORD;

    function schedule(start) {
      progression.forEach((chord, ci) => {
        const t0 = start + ci * CHORD;

        // 16th-note arpeggio — driving square wave
        chord.arp.forEach((f, i) => {
          const t = t0 + i * SIXTEENTH;
          tone(ctx, master, t, f, SIXTEENTH * 0.9, {
            type: 'square', vol: 0.085, attack: 0.003, sustain: 0.06, release: SIXTEENTH * 0.3,
          });
        });

        // 8th-note walking bass — triangle for warmth, sub-octave for thickness
        chord.bass.forEach((bf, bi) => {
          const t = t0 + bi * (BEAT / 2);
          tone(ctx, master, t, bf, (BEAT / 2) * 0.95, {
            type: 'triangle', vol: 0.18, attack: 0.005, sustain: 0.12, release: (BEAT / 2) * 0.4,
          });
        });

        // Driving drums — double-time kick pattern
        kick (ctx, master, t0 + 0   * BEAT, 1);
        kick (ctx, master, t0 + 0.5 * BEAT, 0.5);  // syncopation
        snare(ctx, master, t0 + 1   * BEAT, 0.9, true);
        kick (ctx, master, t0 + 2   * BEAT, 1);
        kick (ctx, master, t0 + 2.5 * BEAT, 0.5);
        snare(ctx, master, t0 + 3   * BEAT, 0.9, true);
        // 16th-note hi-hat for relentless energy
        for (let i = 0; i < 16; i++) {
          hihat(ctx, master, t0 + i * SIXTEENTH, 0.45, 0.02);
        }
        // Crash-style hit on beat 1 (low-volume noise burst)
        snare(ctx, master, t0, 0.45, true);
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
