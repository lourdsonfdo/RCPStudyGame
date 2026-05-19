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

  function buildCalmLoop(ctx, master) {
    const chords = [
      [220, 261.63, 329.63],
      [174.61, 220, 261.63],
      [261.63, 329.63, 392],
      [196, 246.94, 293.66],
    ];
    const beatDur = 2.0;
    const loopDur = chords.length * beatDur;

    function schedule(start) {
      chords.forEach((chord, i) => {
        const t = start + i * beatDur;
        chord.forEach(freq => {
          const osc = ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          const env = ctx.createGain();
          env.gain.setValueAtTime(0, t);
          env.gain.linearRampToValueAtTime(0.15, t + 0.3);
          env.gain.linearRampToValueAtTime(0.1,  t + beatDur * 0.7);
          env.gain.linearRampToValueAtTime(0,    t + beatDur);
          osc.connect(env);
          env.connect(master);
          osc.start(t);
          osc.stop(t + beatDur + 0.05);
          proceduralNodes.push(osc);
        });
      });
    }

    schedule(ctx.currentTime);
    schedule(ctx.currentTime + loopDur);
    proceduralInterval = setInterval(() => {
      if (!proceduralCtx) { clearInterval(proceduralInterval); return; }
      schedule(proceduralCtx.currentTime + 0.05);
    }, loopDur * 1000);
  }

  function buildFastLoop(ctx, master) {
    const notes = [261.63, 329.63, 392, 523.25, 392, 329.63, 261.63, 196];
    const beatDur = 0.18;
    const loopDur = notes.length * beatDur;

    function schedule(start) {
      notes.forEach((freq, i) => {
        const t = start + i * beatDur;
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = freq;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0,    t);
        env.gain.linearRampToValueAtTime(0.12, t + 0.01);
        env.gain.linearRampToValueAtTime(0,    t + beatDur * 0.9);
        osc.connect(env);
        env.connect(master);
        osc.start(t);
        osc.stop(t + beatDur);
        proceduralNodes.push(osc);

        if (i % 2 === 0) {
          const bass = ctx.createOscillator();
          bass.type = 'sawtooth';
          bass.frequency.value = freq * 0.5;
          const benv = ctx.createGain();
          benv.gain.setValueAtTime(0,   t);
          benv.gain.linearRampToValueAtTime(0.08, t + 0.02);
          benv.gain.linearRampToValueAtTime(0,    t + beatDur * 1.5);
          bass.connect(benv);
          benv.connect(master);
          bass.start(t);
          bass.stop(t + beatDur * 1.6);
          proceduralNodes.push(bass);
        }
      });
    }

    schedule(ctx.currentTime);
    schedule(ctx.currentTime + loopDur);
    proceduralInterval = setInterval(() => {
      if (!proceduralCtx) { clearInterval(proceduralInterval); return; }
      schedule(proceduralCtx.currentTime + 0.02);
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
