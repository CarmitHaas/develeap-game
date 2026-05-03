"use strict";

// ─── GAME AUDIO ─────────────────────────────────────────────────
// SFX beeps + retro chip-music for the intro screen
const GameAudio = (() => {
  // ── SFX ──────────────────────────────────────────────────────
  let _sfxCtx = null;

  function beep(freq, dur) {
    try {
      if (!_sfxCtx) _sfxCtx = new (window.AudioContext || window.webkitAudioContext)();
      const o = _sfxCtx.createOscillator(), g = _sfxCtx.createGain();
      o.connect(g); g.connect(_sfxCtx.destination);
      o.frequency.value = freq || 880;
      g.gain.setValueAtTime(0.08, _sfxCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, _sfxCtx.currentTime + (dur || 0.12));
      o.start(); o.stop(_sfxCtx.currentTime + (dur || 0.12));
    } catch(e) {}
  }

  // Slack-style notification: plays the bundled ping.mp3.
  // Function name kept as waNotif() so the engine doesn't need touching.
  // We preload one Audio element and clone it on each play so overlapping
  // notifications don't cut each other off.
  let _pingTemplate = null;
  const PING_VOLUME = 0.45;
  function _initPing() {
    if (_pingTemplate) return;
    try {
      _pingTemplate = new Audio('ping.mp3');
      _pingTemplate.preload = 'auto';
      _pingTemplate.volume = PING_VOLUME;
    } catch (e) { _pingTemplate = null; }
  }
  function waNotif() {
    try {
      _initPing();
      if (!_pingTemplate) return;
      const clip = _pingTemplate.cloneNode();
      clip.volume = PING_VOLUME;
      const p = clip.play();
      // Modern browsers return a promise; ignore autoplay-blocked rejections silently
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch (e) {}
  }

  // ── RETRO MUSIC ───────────────────────────────────────────────
  const RN = {
    B2:123.47, D3:146.83, E3:164.81, G3:196.00, A3:220.00, B3:246.94,
    D4:293.66, E4:329.63, G4:392.00, A4:440.00, B4:493.88, D5:587.33, E5:659.25,
  };
  const RB = 60 / 130;

  const MELODY = [
    [RN.E4,.5],[RN.G4,.25],[RN.A4,.25],[RN.B4,.5],[RN.A4,.25],[RN.G4,.25],
    [RN.E4,.5],[RN.G4,.5],[RN.A4,1],
    [RN.A4,.5],[RN.B4,.25],[RN.D5,.25],[RN.E5,.5],[RN.D5,.25],[RN.B4,.25],
    [RN.A4,.5],[RN.G4,.5],[RN.E4,1],
    [RN.B4,.5],[RN.D5,.5],[RN.E5,.5],[RN.D5,.5],
    [RN.B4,.5],[RN.A4,.5],[RN.G4,1],
    [RN.D5,.5],[RN.B4,.25],[RN.A4,.25],[RN.G4,.5],[RN.E4,.5],
    [RN.A4,.5],[RN.B4,.5],[RN.E4,1],
  ];
  const BASS = [
    [RN.E3,.5],[0,.25],[RN.E3,.25],[RN.E3,.5],[RN.B2,.5],
    [RN.A3,.5],[0,.25],[RN.A3,.25],[RN.B3,.5],[RN.B3,.5],
    [RN.E3,.5],[0,.25],[RN.E3,.25],[RN.E3,.5],[RN.B2,.5],
    [RN.A3,.5],[0,.25],[RN.A3,.25],[RN.B3,.5],[RN.B3,.5],
    [RN.E3,.5],[0,.25],[RN.E3,.25],[RN.G3,.5],[RN.G3,.5],
    [RN.D3,.5],[0,.25],[RN.D3,.25],[RN.A3,.5],[RN.A3,.5],
    [RN.E3,.5],[0,.25],[RN.E3,.25],[RN.B2,.5],[RN.B2,.5],
    [RN.A3,.25],[RN.B3,.25],[RN.E3,.5],[RN.E3,1],
  ];

  let _rCtx = null, _musicOn = true, _rTimer = null;

  function _note(ctx, freq, t, dur, type, gain) {
    if (!freq) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.012);
    g.gain.setValueAtTime(gain, t + dur * 0.78);
    g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function _loop(start) {
    if (!_musicOn || !_rCtx) return;
    const ctx = _rCtx;
    let t = start, bt = start;
    MELODY.forEach(([f,b]) => { _note(ctx, f, t, b*RB*0.88, 'square',   0.11); t  += b*RB; });
    BASS.forEach(  ([f,b]) => { _note(ctx, f, bt,b*RB*0.72, 'triangle', 0.18); bt += b*RB; });
    const total = MELODY.reduce((s,[,b]) => s+b, 0);
    for (let i = 0; i < total*2; i++)
      _note(ctx, i%2 ? 880 : 660, start + i*RB*0.5, 0.04, 'sine', 0.035);
    _rTimer = setTimeout(() => _loop(start + total*RB), (total*RB - 0.15)*1000);
  }

  function startMusic() {
    if (!_rCtx) _rCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (_rCtx.state === 'suspended') _rCtx.resume();
    _musicOn = true;
    _loop(_rCtx.currentTime + 0.05);
  }

  function stopMusic() {
    _musicOn = false;
    if (_rTimer) clearTimeout(_rTimer);
    if (_rCtx) { _rCtx.close().catch(()=>{}); _rCtx = null; }
  }

  function isMusicOn() { return _musicOn; }

  return { beep, waNotif, startMusic, stopMusic, isMusicOn };
})();
