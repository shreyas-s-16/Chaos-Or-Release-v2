// ═══════════════════════════════════════════════════════
//  CHAOS OR RELEASE v2 — Frontend Client
//  5 Phases · 4 Level Types · Redis-backed server
// ═══════════════════════════════════════════════════════

const socket = io({ transports: ['websocket', 'polling'] });

// ═══════════════════════════════════════════════════════
//  AUDIO ENGINE
// ═══════════════════════════════════════════════════════
let audioCtx = null;
function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function tone(freq, type = 'sine', dur = 0.15, vol = 0.3, delay = 0) {
  try {
    const ctx = getAudio();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    g.gain.setValueAtTime(0, ctx.currentTime + delay);
    g.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
    o.start(ctx.currentTime + delay);
    o.stop(ctx.currentTime + delay + dur + 0.05);
  } catch (e) { }
}

const SFX = {
  click() { tone(440, 'square', 0.06, 0.12); },
  // Deploy: ascending confident chord
  deploy() { [0, 0.07, 0.15, 0.25].forEach((d, i) => tone([523, 659, 784, 1047][i], 'sine', 0.18, 0.3, d)); },
  // Delay: descending warning tones
  delay() { [0, 0.1, 0.2].forEach((d, i) => tone([440, 330, 220][i], 'sawtooth', 0.15, 0.3, d)); },
  // Briefing: calm but attentive beep sequence
  briefing() { [0, 0.2, 0.4, 0.6].forEach((d, i) => tone([400, 500, 400, 600][i], 'sine', 0.15, 0.2, d)); },
  // Breach: dramatic 5-tone alarm burst — HIGH ENERGY
  breach() {
    [0, 0.06, 0.12, 0.18, 0.24, 0.3].forEach((d, i) => tone(180 + i * 80, 'square', 0.12, 0.35, d));
    [0.35, 0.42, 0.49].forEach((d, i) => tone(800 + i * 100, 'square', 0.08, 0.25, d));
  },
  // Sabotage: war-room alarm — RED ALERT feeling
  sabotage() {
    [0, 0.08, 0.16, 0.24, 0.32, 0.4, 0.48, 0.56].forEach(d => tone(880, 'sawtooth', 0.07, 0.45, d));
    [0.04, 0.12, 0.20, 0.28, 0.36, 0.44, 0.52].forEach(d => tone(660, 'sawtooth', 0.05, 0.35, d));
    [0, 0.16, 0.32, 0.48].forEach(d => tone(440, 'sawtooth', 0.04, 0.25, d));
  },
  // Aftermath: reveal fanfare
  aftermath() {
    [0, 0.08, 0.16, 0.28, 0.42].forEach((d, i) => tone([660, 784, 880, 1047, 1320][i], 'sine', 0.12, 0.35, d));
  },
  // Recon: victory ascending arpeggio
  recon() { [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 'sine', 0.18, 0.35, i * 0.1)); },
  // Correct: triumphant 3-chord 
  correct() {
    [0, 0.1, 0.2, 0.35].forEach((d, i) => tone([784, 880, 1047, 1320][i], 'sine', 0.15, 0.4, d));
    tone(523, 'sine', 0.3, 0.2, 0);
  },
  // Wrong: harsh buzzer
  wrong() {
    tone(180, 'sawtooth', 0.25, 0.5);
    tone(140, 'sawtooth', 0.2, 0.4, 0.1);
    tone(100, 'sawtooth', 0.15, 0.35, 0.22);
  },
  // Timer ticks — escalating urgency
  tick() { tone(900, 'square', 0.03, 0.08); },
  urgentTick() { tone(1300, 'square', 0.05, 0.18); tone(1000, 'square', 0.03, 0.12, 0.06); },
  finalTick() { tone(1600, 'square', 0.06, 0.25); tone(1200, 'square', 0.05, 0.2, 0.04); tone(800, 'square', 0.03, 0.15, 0.08); },
  sabotageTick() { tone(1500, 'sawtooth', 0.05, 0.22); tone(750, 'sawtooth', 0.04, 0.18, 0.04); },
  // Card sounds
  freeze() { [0, 0.06, 0.12, 0.18, 0.24].forEach((d, i) => tone(1400 - i * 200, 'sine', 0.08, 0.25, d)); },
  doubleRisk() { [0, 0.08, 0.16].forEach((d, i) => tone([440, 550, 880][i], 'sawtooth', 0.1, 0.3, d)); },
  rollback() { [0, 0.08, 0.16, 0.26].forEach((d, i) => tone([440, 550, 660, 784][i], 'triangle', 0.1, 0.3, d)); },
  // Quiz
  quizCorrect() { tone(880, 'sine', 0.12, 0.4); tone(1100, 'sine', 0.12, 0.38, 0.1); tone(1320, 'sine', 0.1, 0.32, 0.22); },
  quizWrong() { tone(250, 'sawtooth', 0.12, 0.3); tone(200, 'sawtooth', 0.1, 0.25, 0.1); },
  decoderUnlock() { [440, 550, 660, 880, 1047].forEach((f, i) => tone(f, 'sine', 0.12, 0.32, i * 0.07)); },
  levelUp() { [523, 659, 784, 880, 1047, 1319].forEach((f, i) => tone(f, 'sine', 0.18, 0.35, i * 0.09)); },
  // Countdown last 10s
  countdown10() { tone(1000, 'square', 0.04, 0.15); },
  countdown5() { tone(1400, 'square', 0.06, 0.2); },
};

// ═══════════════════════════════════════════════════════
//  PROJECTOR MUSIC ENGINE — Techno/Electronic background
//  Only plays when screen === 'projector'
// ═══════════════════════════════════════════════════════
let musicCtx = null;
let musicNodes = [];
let musicPhase = null;
let musicScheduler = null;
let musicStep = 0;

function getMusicCtx() {
  if (!musicCtx) musicCtx = new (window.AudioContext || window.webkitAudioContext)();
  return musicCtx;
}

function stopMusic() {
  if (musicScheduler) { clearInterval(musicScheduler); musicScheduler = null; }
  musicNodes.forEach(n => { try { n.stop(); } catch (e) { } });
  musicNodes = [];
  musicPhase = null;
  musicStep = 0;
}

function musicTone(freq, type, startTime, duration, vol, ctx, dest) {
  try {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(dest);
    o.type = type;
    o.frequency.setValueAtTime(freq, startTime);
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(vol, startTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    o.start(startTime);
    o.stop(startTime + duration + 0.05);
    musicNodes.push(o);
  } catch (e) { }
}

// ── LOBBY MUSIC — Ambient chill, waiting vibe ──
function playLobbyMusic() {
  if (L.screen !== 'projector') return;
  stopMusic();
  musicPhase = 'LOBBY';
  const ctx = getMusicCtx();
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.3, ctx.currentTime);
  master.connect(ctx.destination);

  // Slow ambient pad — chord progression Am → F → C → G
  const chords = [[220, 277, 330], [175, 220, 262], [261, 330, 392], [196, 247, 294]];
  let beat = 0;
  musicScheduler = setInterval(() => {
    if (L.screen !== 'projector' || musicPhase !== 'LOBBY') { stopMusic(); return; }
    const chord = chords[beat % chords.length];
    const t = ctx.currentTime;
    chord.forEach(f => musicTone(f, 'sine', t, 1.8, 0.06, ctx, master));
    // Soft hi-hat
    musicTone(8000, 'square', t, 0.04, 0.02, ctx, master);
    musicTone(8000, 'square', t + 0.5, 0.04, 0.015, ctx, master);
    beat++;
  }, 2000);
}

// ── BRIEFING MUSIC — Tense scanner, mission incoming vibe ──
function playBriefingMusic() {
  if (L.screen !== 'projector') return;
  stopMusic();
  musicPhase = 'BRIEFING';
  const ctx = getMusicCtx();
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.25, ctx.currentTime);
  master.connect(ctx.destination);

  let step = 0;
  const melody = [220, 246, 261, 246, 220, 196, 220, 246];
  musicScheduler = setInterval(() => {
    if (L.screen !== 'projector' || musicPhase !== 'BRIEFING') { stopMusic(); return; }
    const t = ctx.currentTime;
    // Scanner melody
    musicTone(melody[step % melody.length], 'sine', t, 0.3, 0.08, ctx, master);
    // Low drone
    musicTone(55, 'sawtooth', t, 0.4, 0.04, ctx, master);
    // Tick
    musicTone(2000, 'square', t, 0.02, 0.03, ctx, master);
    step++;
  }, 500);
}

// ── BREACH MUSIC — Hard techno, high energy, driving beat ──
function playBreachMusic() {
  if (L.screen !== 'projector') return;
  stopMusic();
  musicPhase = 'BREACH';
  const ctx = getMusicCtx();
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.4, ctx.currentTime);
  master.connect(ctx.destination);

  // Techno kick pattern: 4-on-the-floor
  const kickFreqs = [80, 60, 50, 45];
  // Bass synth pattern
  const bassNotes = [55, 55, 73, 55, 55, 82, 55, 73];
  // Lead melody
  const leadNotes = [440, 0, 440, 494, 440, 0, 392, 0];
  let step = 0;

  musicScheduler = setInterval(() => {
    if (L.screen !== 'projector' || musicPhase !== 'BREACH') { stopMusic(); return; }
    const t = ctx.currentTime;
    const bar = step % 8;

    // Kick drum (every beat = every 2 steps of 16th notes at 130bpm)
    if (bar % 2 === 0) {
      kickFreqs.forEach((f, i) => musicTone(f, 'sine', t + i * 0.015, 0.15, 0.5, ctx, master));
    }
    // Snare on 2 and 4
    if (bar === 2 || bar === 6) {
      musicTone(200, 'square', t, 0.08, 0.2, ctx, master);
      musicTone(400, 'sawtooth', t, 0.06, 0.15, ctx, master);
    }
    // Hi-hat 16th notes
    musicTone(8000, 'square', t, 0.03, 0.04, ctx, master);

    // Bass synth
    const bass = bassNotes[bar];
    if (bass) musicTone(bass, 'sawtooth', t, 0.18, 0.12, ctx, master);

    // Lead synth
    const lead = leadNotes[bar];
    if (lead) {
      musicTone(lead, 'square', t, 0.1, 0.08, ctx, master);
      musicTone(lead * 2, 'sine', t, 0.08, 0.04, ctx, master);
    }

    step++;
  }, 115); // ~130 BPM (16th notes)
}

// ── SABOTAGE MUSIC — Alarm rave, intense, chaotic ──
function playSabotageMusic() {
  if (L.screen !== 'projector') return;
  stopMusic();
  musicPhase = 'SABOTAGE_PULSE';
  const ctx = getMusicCtx();
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.5, ctx.currentTime);
  master.connect(ctx.destination);

  let step = 0;
  const alarmFreqs = [880, 1100, 880, 1100, 660, 880, 660, 880];

  musicScheduler = setInterval(() => {
    if (L.screen !== 'projector' || musicPhase !== 'SABOTAGE_PULSE') { stopMusic(); return; }
    const t = ctx.currentTime;
    const bar = step % 8;

    // FAST kick
    [80, 60, 50].forEach((f, i) => musicTone(f, 'sine', t + i * 0.01, 0.1, 0.6, ctx, master));
    // Alarm siren
    musicTone(alarmFreqs[bar], 'sawtooth', t, 0.12, 0.3, ctx, master);
    // Rapid hi-hat
    musicTone(8000, 'square', t, 0.02, 0.06, ctx, master);
    musicTone(6000, 'square', t + 0.05, 0.02, 0.04, ctx, master);
    // Low bass stab
    if (bar % 2 === 0) musicTone(55, 'sawtooth', t, 0.08, 0.2, ctx, master);

    step++;
  }, 80); // ~180 BPM — frantic
}

// ── AFTERMATH MUSIC — Reveal fanfare then ambient ──
function playAftermathMusic() {
  if (L.screen !== 'projector') return;
  stopMusic();
  musicPhase = 'AFTERMATH';
  const ctx = getMusicCtx();
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.35, ctx.currentTime);
  master.connect(ctx.destination);

  // Triumphant arpeggio then settle into slow pulse
  const fanfare = [523, 659, 784, 1047, 1319, 1047, 784, 659];
  let step = 0;
  musicScheduler = setInterval(() => {
    if (L.screen !== 'projector' || musicPhase !== 'AFTERMATH') { stopMusic(); return; }
    const t = ctx.currentTime;
    if (step < fanfare.length) {
      musicTone(fanfare[step], 'sine', t, 0.25, 0.15, ctx, master);
    } else {
      // Slow ambient pulse after fanfare
      musicTone(220, 'sine', t, 0.8, 0.05, ctx, master);
      musicTone(330, 'sine', t, 0.6, 0.04, ctx, master);
    }
    step++;
  }, 200);
}

// ── RECON MUSIC — Victory leaderboard music ──
function playReconMusic() {
  if (L.screen !== 'projector') return;
  stopMusic();
  musicPhase = 'RECON';
  const ctx = getMusicCtx();
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.35, ctx.currentTime);
  master.connect(ctx.destination);

  const melody = [523, 523, 659, 784, 784, 659, 523, 392, 440, 523];
  let step = 0;
  musicScheduler = setInterval(() => {
    if (L.screen !== 'projector' || musicPhase !== 'RECON') { stopMusic(); return; }
    const t = ctx.currentTime;
    const note = melody[step % melody.length];
    musicTone(note, 'sine', t, 0.2, 0.12, ctx, master);
    musicTone(note / 2, 'triangle', t, 0.18, 0.06, ctx, master);
    // Soft beat
    if (step % 4 === 0) {
      [80, 60].forEach((f, i) => musicTone(f, 'sine', t + i * 0.01, 0.12, 0.25, ctx, master));
    }
    step++;
  }, 300);
}

function startProjectorMusic(phase) {
  if (L.screen !== 'projector') return;
  switch (phase) {
    case 'LOBBY': playLobbyMusic(); break;
    case 'BRIEFING': playBriefingMusic(); break;
    case 'BREACH': playBreachMusic(); break;
    case 'SABOTAGE_PULSE': playSabotageMusic(); break;
    case 'AFTERMATH': playAftermathMusic(); break;
    case 'RECON': playReconMusic(); break;
    default: stopMusic();
  }
}

// ═══════════════════════════════════════════════════════
//  PARTICLES
// ═══════════════════════════════════════════════════════
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  class P {
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.5 + 0.3;
      this.sx = (Math.random() - 0.5) * 0.3;
      this.sy = -Math.random() * 0.4 - 0.1;
      this.op = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.85 ? '#e5341a' : Math.random() > 0.7 ? '#28c840' : '#ffffff';
    }
    constructor() { this.reset(); }
    update() { this.x += this.sx; this.y += this.sy; this.op -= 0.0015; if (this.op <= 0 || this.y < -10) this.reset(); }
    draw() { ctx.globalAlpha = this.op; ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
  }
  const parts = Array.from({ length: 100 }, () => new P());
  (function loop() { ctx.clearRect(0, 0, canvas.width, canvas.height); parts.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(loop); })();
}

// ═══════════════════════════════════════════════════════
//  LOCAL STATE
// ═══════════════════════════════════════════════════════
let L = {
  screen: 'login', teamName: null, isAdmin: false,
  gameState: null, teams: {}, decisions: {}, quizAnswers: {},
  timerLeft: 0, timerMax: 60, timerInterval: null,
  prevPhase: null,
  revealedAnswer: null,  // set by server during AFTERMATH
  quizUnlocked: false,
  quizAnswered: {},
  selectedTarget: null,
  overrideTeam: null,
  rollbackInterval: null,
};

const $ = id => document.getElementById(id);
const key = n => String(n).replace(/[^a-zA-Z0-9_]/g, '_');
const onlineTeams = () => Object.values(L.teams).filter(t => t.online).sort((a, b) => a.name.localeCompare(b.name));
const leaderboard = () => Object.values(L.teams).filter(t => t.online).sort((a, b) => (b.score || 0) - (a.score || 0));
const allTeams = () => Object.values(L.teams).sort((a, b) => a.name.localeCompare(b.name));
const myTeam = () => L.teams[key(L.teamName)] || null;
const getScenario = (level, idx) => SCENARIOS.filter(s => s.level === level)[idx] || null;

// ═══════════════════════════════════════════════════════
//  SOCKET EVENTS
// ═══════════════════════════════════════════════════════
socket.on('connect', () => { setConnIndicators(true); });
socket.on('disconnect', () => { setConnIndicators(false); });

socket.on('gameState', data => {
  const prevPhase = L.gameState ? L.gameState.phase : null;
  L.gameState = data.state || {};
  L.teams = data.teams || {};
  L.decisions = data.decisions || {};
  L.quizAnswers = data.quizAnswers || {};
  // Store revealedAnswer from top-level payload — never rely on s.answer which is absent on client
  if (data.revealedAnswer) L.revealedAnswer = data.revealedAnswer;

  // Sync timer from gameState so reconnecting clients get correct timer immediately
  if (data.timerLeft !== undefined && data.timerMax > 0) {
    L.timerLeft = data.timerLeft;
    L.timerMax = data.timerMax;
    updateTimerUI(data.timerLeft, data.timerMax, data.timerPhase || L.gameState.phase);
  }

  // Phase change sounds + animations
  if (prevPhase !== L.gameState.phase) {
    // Reset revealedAnswer when a new round starts
    if (L.gameState.phase === 'LOBBY' || L.gameState.phase === 'BRIEFING') {
      L.revealedAnswer = null;
    }
    handlePhaseChange(prevPhase, L.gameState.phase);
  }
  rerender();
});

socket.on('phase', ({ phase, duration, message, revealedAnswer }) => {
  if (revealedAnswer) L.revealedAnswer = revealedAnswer;
  showPhaseOverlay(phase, message);
});

socket.on('timerTick', ({ left, max, phase }) => {
  L.timerLeft = left; L.timerMax = max;
  const p = phase || L.gameState?.phase;
  updateTimerUI(left, max, p);
  // Play tick sounds based on urgency
  if (p === 'SABOTAGE_PULSE') {
    SFX.sabotageTick();
  } else if (p === 'BREACH') {
    if (left <= 5) SFX.finalTick();
    else if (left <= 10) SFX.urgentTick();
    else if (left % 10 === 0 && left > 0) SFX.tick();
  } else if (p === 'BRIEFING') {
    if (left <= 10) SFX.countdown10();
    if (left <= 5) SFX.countdown5();
  }
});

function handlePhaseChange(from, to) {
  console.log(`Phase: ${from} → ${to}`);
  // Start projector music for this phase
  if (L.screen === 'projector') startProjectorMusic(to);
  switch (to) {
    case 'BRIEFING':
      SFX.briefing();
      showPhaseOverlay('BRIEFING', 'Incoming transmission…');
      document.body.classList.remove('sabotage-pulse');
      break;
    case 'BREACH':
      SFX.breach();
      setTimeout(() => SFX.breach(), 500);
      showPhaseOverlay('BREACH', 'Decision window open — Deploy or Delay?');
      document.body.classList.remove('sabotage-pulse');
      L.quizUnlocked = false;
      L.quizAnswered = {};
      startBgAtmosphere('BREACH');
      break;
    case 'SABOTAGE_PULSE':
      SFX.sabotage();
      showPhaseOverlay('SABOTAGE_PULSE', '⚠ SABOTAGE PULSE — Cards unlocked!', 'red');
      document.body.classList.add('sabotage-pulse');
      startBgAtmosphere('SABOTAGE_PULSE');
      break;
    case 'AFTERMATH':
      SFX.aftermath();
      stopBgAtmosphere();
      showPhaseOverlay('AFTERMATH', 'Results incoming…', 'amber');
      document.body.classList.remove('sabotage-pulse');
      startRollbackWindow();
      break;
    case 'RECON':
      SFX.recon();
      showPhaseOverlay('RECON', 'Leaderboard updating…', 'amber');
      stopRollbackWindow();
      break;
    case 'LOBBY':
      document.body.classList.remove('sabotage-pulse');
      stopRollbackWindow();
      stopBgAtmosphere();
      break;
  }
}

function showPhaseOverlay(phase, sub = '', colorClass = '') {
  const overlay = $('phase-overlay');
  const name = $('phase-overlay-name');
  const label = $('phase-overlay-label');
  const subEl = $('phase-overlay-sub');

  const phaseNames = {
    BRIEFING: 'THE BRIEFING',
    BREACH: 'BREACH WINDOW',
    SABOTAGE_PULSE: 'SABOTAGE PULSE',
    AFTERMATH: 'THE AFTERMATH',
    RECON: 'RECON',
    LOBBY: 'STANDBY',
  };

  label.textContent = 'PHASE INITIATED';
  name.textContent = phaseNames[phase] || phase;
  name.className = 'phase-overlay-name ' + colorClass;
  subEl.textContent = sub;

  overlay.classList.add('active');
  setTimeout(() => overlay.classList.remove('active'), 2500);
}

function setConnIndicators(ok) {
  ['team-conn-indicator', 'admin-conn-indicator', 'proj-conn-indicator'].forEach(id => {
    const el = $(id); if (!el) return;
    el.className = 'conn-indicator ' + (ok ? 'connected' : 'disconnected');
  });
}

// ═══════════════════════════════════════════════════════
//  TIMER
// ═══════════════════════════════════════════════════════
function updateTimerUI(left, max, phase) {
  if (!max || max <= 0) return; // don't render if max is 0 or undefined
  const pct = Math.max(0, Math.min(100, (left / max) * 100));
  const isSab = phase === 'SABOTAGE_PULSE';
  // Only go red/amber near the end — never red just because left is small on first tick
  const urgent = !isSab && left <= 10 && max > 10;
  const color = isSab ? 'var(--red)' : urgent ? (left <= 5 ? 'var(--red)' : 'var(--amber)') : 'var(--green)';

  ['admin-timer-bar', 'team-timer-bar', 'proj-timer-fill'].forEach(id => {
    const el = $(id); if (!el) return; el.style.width = pct + '%'; el.style.background = color;
  });

  const atb = $('admin-timer-big');
  if (atb) { atb.textContent = left; atb.className = 'big-timer' + (urgent ? ' urgent' : ''); }

  const pt = $('proj-timer');
  if (pt) { pt.textContent = left || '—'; pt.className = 'proj-timer' + (urgent ? ' urgent' : ''); }

  const pl = $('proj-phase-label');
  if (pl) pl.textContent = isSab ? '⚠ SABOTAGE PULSE' : phase === 'BREACH' ? 'BREACH WINDOW' : '';

  const ttn = $('team-timer-text');
  if (ttn) { ttn.textContent = left; ttn.className = 'ctf-timer-num' + (urgent ? ' urgent' : ''); }

  const ring = $('ctf-ring');
  if (ring) {
    const c = 326.73;
    ring.style.strokeDashoffset = c - (pct / 100) * c;
    ring.className = 'ctf-ring-fill' + (urgent ? ' urgent' : '');
    // Always explicitly set stroke so it resets correctly between rounds
    ring.style.stroke = isSab ? 'var(--red)' : urgent ? (left <= 5 ? 'var(--red)' : 'var(--amber)') : 'var(--green)';
  }

  // Status text
  const statusText = $('ctf-status-text');
  const statusDot = $('ctf-status-dot');
  const barLabel = $('ctf-bar-label');
  const hint = $('ctf-timer-hint');
  if (isSab) {
    if (statusText) statusText.textContent = '⚠ SABOTAGE PULSE';
    if (statusDot) statusDot.style.background = 'var(--red)';
    if (barLabel) barLabel.textContent = 'CARD WINDOW CLOSING';
    if (hint) hint.innerHTML = 'Use your cards NOW — window closes in <span style="color:var(--red)">' + left + 's</span>';
  } else {
    if (statusText) statusText.textContent = 'BREACH WINDOW';
    if (statusDot) statusDot.style.background = '#28c840';
    if (barLabel) barLabel.textContent = 'TIME REMAINING';
    if (hint) hint.innerHTML = 'Submit before time runs out or lose <span style="color:var(--red)">−1 pt</span>';
  }

  // Admin phase indicator
  const api = $('admin-phase-indicator');
  if (api) {
    api.textContent = phase || '—';
    api.style.color = isSab ? 'var(--red)' : phase === 'BREACH' ? 'var(--green)' : 'var(--muted)';
    api.style.background = isSab ? 'rgba(229,52,26,0.1)' : '';
  }
}

// ═══════════════════════════════════════════════════════
//  ROLLBACK WINDOW (7 seconds flashing)
// ═══════════════════════════════════════════════════════
function startRollbackWindow() {
  const team = myTeam(); if (!team) return;
  const correctAnswer = L.revealedAnswer || L.gameState.revealedAnswer;
  if (!correctAnswer) return;

  const myDec = L.decisions[key(L.teamName)];
  const cards = team.cards || {};
  // Only show rollback if: deployed wrong AND rollback card still available
  if (myDec !== 'deploy' || myDec === correctAnswer || cards.rollback === false) return;

  // DRAMATIC ROLLBACK ALERT — can't miss it
  SFX.rollback();
  setTimeout(() => SFX.rollback(), 400);
  setTimeout(() => SFX.rollback(), 800);
  // Flash the screen red briefly
  const flash = document.createElement('div');
  flash.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(229,52,26,0.25);z-index:998;pointer-events:none;animation:rollbackFlash 0.4s ease-out forwards;';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 800);

  const rollbackBtn = $('rollback-btn');
  if (!rollbackBtn) return;
  rollbackBtn.style.display = 'block';

  let timeLeft = 7;
  const timerSpan = $('rollback-timer');
  if (timerSpan) timerSpan.textContent = `(${timeLeft}s)`;

  SFX.rollback();

  L.rollbackInterval = setInterval(() => {
    timeLeft--;
    if (timerSpan) timerSpan.textContent = `(${timeLeft}s)`;
    if (timeLeft <= 0) {
      stopRollbackWindow();
    }
  }, 1000);
}

function stopRollbackWindow() {
  clearInterval(L.rollbackInterval);
  const btn = $('rollback-btn');
  if (btn) btn.style.display = 'none';
}

// ═══════════════════════════════════════════════════════
//  SCREEN MANAGEMENT
// ═══════════════════════════════════════════════════════
function setScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
  L.screen = id.replace('-screen', '');
}
function showLogin() { setScreen('login-screen'); }
function showTeam() { setScreen('team-screen'); rerender(); }
function showAdmin() { L.isAdmin = true; stopMusic(); setScreen('admin-screen'); rerender(); }
function showProjector() {
  setScreen('projector-screen');
  rerender();
  // Start music for current phase when projector opens
  const phase = L.gameState ? L.gameState.phase : 'LOBBY';
  startProjectorMusic(phase || 'LOBBY');
}
function showProjectorFromAdmin() { showProjector(); }
function showAdminFromProjector() { if (L.isAdmin) showAdmin(); else promptAdmin(); }

function rerender() {
  switch (L.screen) {
    case 'team': renderTeam(); break;
    case 'admin': renderAdmin(); break;
    case 'projector': renderProjector(); break;
  }
}

function logout() {
  socket.emit('logout');
  L.teamName = null; L.isAdmin = false;
  document.body.classList.remove('sabotage-pulse');
  showLogin();
}

// ═══════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════
function promptAdmin() {
  const p = prompt('Enter Admin password:'); if (!p) return;
  socket.emit('adminAuth', { pass: p }, res => {
    if (res.ok) showAdmin(); else alert('Wrong password.');
  });
}
function promptProjector() {
  const p = prompt('Enter Projector password:'); if (!p) return;
  socket.emit('projectorAuth', { pass: p }, res => {
    if (res.ok) showProjector(); else alert('Wrong password.');
  });
}
function doLogin() {
  const name = $('login-team').value.trim();
  const pass = $('login-pass').value.trim();
  if (!name || !pass) return;
  socket.emit('login', { name, pass }, res => {
    if (res.ok) {
      SFX.breach();
      L.teamName = res.name;
      $('login-err').style.display = 'none';
      showTeam();
    } else {
      SFX.wrong();
      $('login-err').style.display = 'flex';
      $('login-team').style.borderColor = 'var(--red)';
      setTimeout(() => { $('login-team').style.borderColor = ''; }, 1500);
    }
  });
}

// ═══════════════════════════════════════════════════════
//  TEAM DASHBOARD
// ═══════════════════════════════════════════════════════
function renderTeam() {
  if (L.screen !== 'team') return;
  let team = myTeam();
  // If team not found by key, try matching by name directly (handles special char edge cases)
  if (!team && L.teamName) {
    team = Object.values(L.teams).find(t =>
      t.name === L.teamName ||
      t.name.toLowerCase() === L.teamName.toLowerCase()
    ) || null;
  }
  if (!team) return;
  const gs = L.gameState || {};
  const phase = gs.phase || 'LOBBY';
  const s = getScenario(gs.currentLevel, gs.currentScenarioIdx);

  $('team-name-badge').textContent = team.name;
  const pb = $('phase-badge');
  pb.textContent = phase;
  pb.className = 'nav-badge ' + (
    phase === 'BREACH' ? 'green' : phase === 'SABOTAGE_PULSE' ? 'red' : phase === 'AFTERMATH' || phase === 'RECON' ? 'amber' : ''
  );
  $('nav-round-info').textContent = s ? `Level ${s.level} · ${s.levelName} · Round ${s.round}` : '';

  // Phase banner
  const banner = $('phase-banner');
  if (phase !== 'LOBBY') {
    banner.style.display = 'block';
    banner.className = 'phase-banner ' + phase;
    const bannerText = {
      BRIEFING: '📡 THE BRIEFING — Read the mission carefully',
      BREACH: '⚡ BREACH WINDOW — Submit your decision',
      SABOTAGE_PULSE: '💀 SABOTAGE PULSE — Use your cards NOW',
      AFTERMATH: '📊 THE AFTERMATH — Results revealed',
      RECON: '🏆 RECON — Leaderboard updating',
    };
    banner.textContent = bannerText[phase] || phase;
  } else {
    banner.style.display = 'none';
  }

  // Score + rank
  $('team-score-disp').textContent = team.score || 0;
  const lb = leaderboard();
  const rank = lb.findIndex(t => t.name === team.name) + 1;
  $('team-rank-disp').innerHTML = `Rank <b style="color:var(--amber)">#${rank}</b> / ${lb.length}`;

  renderCards(team, phase);
  renderHistory(team);
  renderTeamScenario(team, s, phase);
}

function renderCards(team, phase) {
  const c = team.cards || { rollback: true, freeze: true, doublerisk: true };
  const inSab = phase === 'SABOTAGE_PULSE';
  const inBreach = phase === 'BREACH';
  const canUseCards = inSab || inBreach;

  const note = $('cards-phase-note');
  if (note) {
    if (inSab) { note.textContent = '⚠ SABOTAGE PULSE ACTIVE — Use cards now!'; note.style.color = 'var(--red)'; note.style.borderColor = 'rgba(229,52,26,0.3)'; }
    else if (inBreach) { note.textContent = 'Cards available during Sabotage Pulse (last 15s)'; note.style.color = 'var(--muted)'; note.style.borderColor = ''; }
    else { note.textContent = 'Cards unlock during Sabotage Pulse'; note.style.color = 'var(--dim)'; note.style.borderColor = ''; }
  }

  const cards = [
    { key: 'freeze', name: '❄ FREEZE', desc: 'Lock a team out next round', color: 'var(--blue)' },
    { key: 'doublerisk', name: '⚡ DOUBLE RISK', desc: 'Target takes -8 if wrong', color: 'var(--red)' },
    { key: 'rollback', name: '⏪ ROLLBACK', desc: 'Reduce penalty to -2', color: 'var(--green)' },
  ];
  let unused = 0;
  $('team-cards-list').innerHTML = cards.map(card => {
    const avail = c[card.key] !== false;
    if (avail) unused++;
    const canUse = avail && canUseCards && card.key !== 'rollback';
    return `<div class="card-item ${card.key} ${avail ? '' : 'used'}">
      <div>
        <div class="card-name" style="color:${card.color}">${card.name}</div>
        <div class="card-desc">${avail ? card.desc : '— USED —'}</div>
      </div>
      ${canUse ? `<button class="btn-use-card" onclick="openCardModal('${card.key}')">USE</button>` : ''}
    </div>`;
  }).join('');
  $('unused-warning').style.display = unused > 0 ? 'block' : 'none';
}

function renderHistory(team) {
  const hist = team.history || [];
  $('team-history').innerHTML = hist.length
    ? [...hist].reverse().map(h => `<div class="history-row">
        <span>Rd ${h.round} — ${h.decision.toUpperCase()}</span>
        <span class="history-pts ${h.pts > 0 ? 'pos' : 'neg'}">${h.pts > 0 ? '+' : ''}${h.pts}</span>
      </div>`).join('')
    : '<div style="color:var(--dim);font-size:11px">No rounds yet.</div>';
}

function renderTeamScenario(team, s, phase) {
  // Frozen THIS round — show banner + full-screen ice overlay
  const isFrozen = !!team.frozen;
  $('frozen-banner').style.display = isFrozen ? 'flex' : 'none';
  const iceOverlay = $('ice-overlay');
  if (iceOverlay) iceOverlay.style.display = isFrozen ? 'flex' : 'none';
  // Frozen NEXT round — show warning banner
  const frozenNextEl = $('frozen-next-banner');
  if (frozenNextEl) frozenNextEl.style.display = team.frozenNextRound ? 'flex' : 'none';
  $('targeted-banner').style.display = team.targeted ? 'flex' : 'none';
  $('result-banner').style.display = 'none';

  // Hide all level-specific panels first
  ['image-quiz-panel', 'forensic-panel', 'decoder-panel'].forEach(id => $(id).style.display = 'none');
  // Remove scenario diagram if present
  const existingDiagram = document.getElementById('scenario-diagram');
  if (existingDiagram && s && s.type !== 'image_quiz') existingDiagram.remove();

  const timerRow = $('timer-row');
  const decRow = $('decision-row');

  if (phase === 'LOBBY' || !s) {
    timerRow.style.display = 'none'; decRow.style.display = 'none';
    $('scenario-display').innerHTML = `<div class="scenario-waiting">
      <div class="waiting-animation"><div class="waiting-line"></div><div class="waiting-line"></div><div class="waiting-line"></div></div>
      <p>Awaiting mission briefing…</p><p class="dim">$ standby for incoming transmission_</p></div>`;
    return;
  }

  // Show scenario text + images
  $("scenario-display").classList.add("active");
  const imgsHtml = (s.images && s.images.length)
    ? s.images.map(img => `<img src="${img}" class="scenario-img" alt="scenario" onerror="this.style.display='none'" />`).join("")
    : "";
  $("scenario-display").innerHTML = `
    <div class="scenario-level-tag">LEVEL ${s.level} · ${s.levelName.toUpperCase()} · ROUND ${s.round}</div>
    <div class="scenario-title">${s.title}</div>
    ${imgsHtml ? '<div class="scenario-images">' + imgsHtml + '</div>' : ""}
    <div class="scenario-body">${s.body}</div>`;
  const inActive = phase === 'BREACH' || phase === 'SABOTAGE_PULSE';
  timerRow.style.display = inActive ? 'flex' : 'none';

  if (phase === 'BRIEFING') {
    decRow.style.display = 'none';
    return;
  }

  if (inActive) {
    // Render level-specific interaction
    if (s.type === "text" || s.type === "image_scenario" || s.type === "story_hunt") {
      renderTextLevel(team, s, phase);
    } else if (s.type === "image_quiz") {
      renderImageQuizLevel(team, s, phase);
    } else if (s.type === "forensic_trail") {
      renderForensicLevel(team, s, phase);
    } else if (s.type === "decoder" || s.type === "caesar_cipher") {
      renderDecoderLevel(team, s, phase);
    }
  }

  if (phase === 'AFTERMATH' || phase === 'RECON') {
    decRow.style.display = 'none';
    renderResults(team, s);
  }
}

function renderTextLevel(team, s, phase) {
  if (team.frozen) { $('decision-row').style.display = 'none'; return; }
  $('decision-row').style.display = 'grid';
  const myDec = L.decisions[key(L.teamName)] ||
    L.decisions[key(L.teamName?.toLowerCase())] || null;
  $('btn-deploy').className = 'btn-decision btn-deploy' + (myDec === 'deploy' ? ' selected' : '');
  $('btn-delay').className = 'btn-decision btn-delay' + (myDec === 'delay' ? ' selected' : '');
  $('btn-deploy').disabled = !!myDec;
  $('btn-delay').disabled = !!myDec;
}

function renderImageQuizLevel(team, s, phase) {
  const myDec = L.decisions[key(L.teamName)];
  // Show quiz panel
  const panel = $('image-quiz-panel');
  panel.style.display = 'block';

  // Render the diagram — try inline fetch first, fallback to img tag
  if (s.imageUrl) {
    let existing = document.getElementById('scenario-diagram');
    if (!existing) {
      const imgWrap = document.createElement('div');
      imgWrap.id = 'scenario-diagram';
      imgWrap.style.cssText = 'margin:12px 0;border:0.5px solid #1a2e10;border-radius:4px;overflow:hidden;background:#060d04;';
      panel.parentNode.insertBefore(imgWrap, panel);

      // Try fetch+inline first (preserves SVG styles)
      fetch(s.imageUrl + '?v=' + Date.now())
        .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
        .then(svgText => {
          const wrap = document.getElementById('scenario-diagram');
          if (!wrap) return;
          wrap.innerHTML = svgText;
          const svgEl = wrap.querySelector('svg');
          if (svgEl) { svgEl.style.width = '100%'; svgEl.style.height = 'auto'; svgEl.style.display = 'block'; svgEl.removeAttribute('width'); }
        })
        .catch(() => {
          // Fallback: img tag
          const wrap = document.getElementById('scenario-diagram');
          if (!wrap) return;
          wrap.innerHTML = '<img src="' + s.imageUrl + '" style="width:100%;display:block;" alt="System diagram" />';
        });
    }
  }

  const myQuiz = (L.quizAnswers[key(L.teamName)] || {});
  const answered = myQuiz.quiz !== undefined;
  const isCorrect = answered && myQuiz.quiz === s.quiz.correct;

  $('image-quiz-options').innerHTML = s.quiz.options.map((opt, i) => {
    let cls = 'quiz-option';
    if (answered) {
      if (i === s.quiz.correct) cls += ' selected-correct';
      else if (i === myQuiz.quiz && !isCorrect) cls += ' selected-wrong';
      cls += ' disabled';
    }
    return `<div class="${cls}" onclick="submitQuizAnswer('quiz', ${i})">
      <span class="quiz-option-key">${String.fromCharCode(65 + i)}</span> ${opt}
    </div>`;
  }).join('');

  const fb = $('image-quiz-feedback');
  if (answered) {
    fb.className = 'quiz-feedback ' + (isCorrect ? 'correct' : 'wrong');
    fb.textContent = isCorrect ? '✓ Correct! Deploy/Delay buttons unlocked.' : '✗ Wrong — Deploy/Delay still locked.';
  } else {
    fb.className = 'quiz-feedback'; fb.textContent = '';
  }

  // Unlock deploy/delay only if quiz correct
  if (isCorrect && !myDec && !team.frozen) {
    $('decision-row').style.display = 'grid';
    $('btn-deploy').disabled = false; $('btn-delay').disabled = false;
  } else if (myDec) {
    $('decision-row').style.display = 'grid';
    $('btn-deploy').className = 'btn-decision btn-deploy' + (myDec === 'deploy' ? ' selected' : '');
    $('btn-delay').className = 'btn-decision btn-delay' + (myDec === 'delay' ? ' selected' : '');
    $('btn-deploy').disabled = true; $('btn-delay').disabled = true;
  } else {
    $('decision-row').style.display = 'none';
  }
}

function renderForensicLevel(team, s, phase) {
  const panel = $('forensic-panel');
  const cluesDiv = $('forensic-clues');
  panel.style.display = 'block';

  const myQuiz = L.quizAnswers[key(L.teamName)] || {};
  let allSolved = true;

  cluesDiv.innerHTML = s.clues.map((clue, i) => {
    const prevSolved = i === 0 || myQuiz[`clue_${i - 1}`] !== undefined;
    const myAnswer = myQuiz[`clue_${i}`];
    const answered = myAnswer !== undefined;
    const correct = answered && myAnswer === clue.correct;
    if (!answered) allSolved = false;

    const statusBadge = answered
      ? (correct ? '<span class="clue-solved">+' + clue.points + ' pts ✓</span>' : '<span style="color:var(--red)">✗</span>')
      : '<span class="clue-pts">+' + clue.points + ' pts</span>';

    const options = prevSolved ? clue.options.map((opt, j) => {
      let cls = 'forensic-option';
      if (answered) {
        if (j === clue.correct) cls += ' correct';
        else if (j === myAnswer) cls += ' wrong';
        cls += ' locked';
      }
      return `<div class="${cls}" onclick="submitQuizAnswer('clue_${i}', ${j})">${opt}</div>`;
    }).join('') : '<div style="color:var(--dim);font-size:11px;padding:8px">Complete previous clue to unlock</div>';

    return `<div class="forensic-clue ${answered ? (correct ? 'solved' : 'unlocked') : (prevSolved ? 'unlocked' : '')}">
      <div class="forensic-clue-header">
        <span>${clue.label}</span>${statusBadge}
      </div>
      ${prevSolved ? `<div class="forensic-clue-body">
        <div class="forensic-clue-text">${clue.text}</div>
        <div class="forensic-clue-question">${clue.question}</div>
        <div class="forensic-options">${options}</div>
      </div>` : ''}
    </div>`;
  }).join('');

  // Show Deploy/Delay after all clues
  const myDec = L.decisions[key(L.teamName)];
  if (allSolved && !team.frozen) {
    $('decision-row').style.display = 'grid';
    const dec = myDec;
    $('btn-deploy').className = 'btn-decision btn-deploy' + (dec === 'deploy' ? ' selected' : '');
    $('btn-delay').className = 'btn-decision btn-delay' + (dec === 'delay' ? ' selected' : '');
    $('btn-deploy').disabled = !!dec; $('btn-delay').disabled = !!dec;
  } else if (myDec) {
    $('decision-row').style.display = 'grid';
    $('btn-deploy').className = 'btn-decision btn-deploy' + (myDec === 'deploy' ? ' selected' : '');
    $('btn-delay').className = 'btn-decision btn-delay' + (myDec === 'delay' ? ' selected' : '');
    $('btn-deploy').disabled = true; $('btn-delay').disabled = true;
  } else {
    $('decision-row').style.display = 'none';
  }
}

function renderDecoderLevel(team, s, phase) {
  const panel = $('decoder-panel');
  panel.style.display = 'block';

  $('decoder-encoded').textContent = s.encodedText || '';
  $('decoder-shift').textContent = s.shiftValue || '3';
  $('decoder-hint').textContent = '💡 Hint: ' + (s.hint || 'Caesar Cipher — shift back by the shown number');
  const ctx = $('decoder-context');
  if (ctx) {
    if (s.contextualExplanation) {
      ctx.style.display = 'block';
      ctx.textContent = '📋 Context: ' + s.contextualExplanation;
    } else {
      ctx.style.display = 'none';
    }
  }

  const myQuiz = L.quizAnswers[key(L.teamName)] || {};
  const decoded = myQuiz.decoder;
  const answered = !!decoded;
  const correct = answered && decoded.correct;

  const fb = $('decoder-feedback');
  const input = $('decoder-text');

  if (answered) {
    fb.className = 'decoder-feedback ' + (correct ? 'correct' : 'wrong');
    fb.textContent = correct ? '✓ Decoded correctly! Deploy/Delay unlocked.' : `✗ Incorrect. Try again. Submitted: "${decoded.text}"`;
    if (!correct) {
      // allow retry
      input.disabled = false;
    } else {
      input.disabled = true;
    }
  } else {
    fb.className = ''; fb.textContent = '';
    input.disabled = false;
  }

  // Show deploy/delay if decoded correctly
  const myDec = L.decisions[key(L.teamName)];
  if (correct && !team.frozen) {
    $('decision-row').style.display = 'grid';
    $('btn-deploy').className = 'btn-decision btn-deploy' + (myDec === 'deploy' ? ' selected' : '');
    $('btn-delay').className = 'btn-decision btn-delay' + (myDec === 'delay' ? ' selected' : '');
    $('btn-deploy').disabled = !!myDec; $('btn-delay').disabled = !!myDec;
  } else if (myDec) {
    $('decision-row').style.display = 'grid';
    $('btn-deploy').disabled = true; $('btn-delay').disabled = true;
  } else {
    $('decision-row').style.display = 'none';
  }
}

function renderResults(team, s) {
  const correctAnswer = L.revealedAnswer || L.gameState.revealedAnswer || '';
  const myDec = L.decisions[key(L.teamName)];
  if (team.frozen) {
    showBanner('wrong', '❄ You were frozen this round. 0 pts.');
    return;
  }
  if (!correctAnswer) {
    showBanner('wrong', '⏳ Calculating results…');
    return;
  }
  if (!myDec) {
    // No submission: -5 wrong + -1 late = -6
    showBanner('wrong', `⏱ No decision submitted — −6 pts. Correct was: ${correctAnswer.toUpperCase()}`);
    SFX.wrong();
    return;
  }
  const isCorrect = myDec === correctAnswer;
  if (isCorrect) {
    // Double Risk success = +10, normal = +6
    const pts = team.targeted ? 10 : 6;
    const bonus = team.targeted ? ' ⚡ Double Risk bonus!' : '';
    showBanner('correct', `✓ CORRECT! +${pts} pts.${bonus}`);
    SFX.correct();
  } else {
    const pen = team.targeted ? -8 : -5;
    showBanner('wrong', `✗ WRONG — ${pen} pts. Correct: ${correctAnswer.toUpperCase()}. ${s ? (s.explanation || '') : ''}`);
    SFX.wrong();
  }
  if (s && s.learning) {
    const b = $('result-banner');
    b.innerHTML += `<br><span style="color:var(--amber);font-size:11px;margin-top:6px;display:block">🎯 ${s.learning}</span>`;
  }
}

function showBanner(type, msg) {
  const b = $('result-banner');
  b.style.display = 'flex'; b.className = 'status-banner ' + type;
  b.innerHTML = `<span class="blink-dot ${type === 'correct' ? 'green' : 'red'}"></span>${msg}`;
}

function submitDecision(choice) {
  const team = myTeam(); if (!team || team.frozen) return;
  const gs = L.gameState;
  if (!gs || (gs.phase !== 'BREACH' && gs.phase !== 'SABOTAGE_PULSE')) return;
  if (L.decisions[key(L.teamName)]) return;
  SFX[choice]();
  socket.emit('submitDecision', { decision: choice }, res => { if (!res.ok) alert(res.error); });
}

function submitQuizAnswer(clueId, answerIdx) {
  const myQuiz = L.quizAnswers[key(L.teamName)] || {};
  if (myQuiz[clueId] !== undefined) return; // already answered
  socket.emit('submitQuizAnswer', { clueId, answerIdx }, res => {
    if (res.ok) {
      if (res.correct) SFX.quizCorrect();
      else SFX.quizWrong();
    }
  });
}

function submitDecoderAnswer() {
  const text = $('decoder-text').value.trim();
  if (!text) return;
  socket.emit('submitDecoderAnswer', { decodedText: text }, res => {
    if (res.ok) {
      if (res.correct) SFX.decoderUnlock();
      else SFX.quizWrong();
    }
  });
}

function useRollback() {
  socket.emit('useRollback', res => {
    if (res.ok) {
      stopRollbackWindow();
      showBanner('wrong', '⏪ ROLLBACK! Penalty reduced to −2 pts.');
      SFX.rollback();
    } else { alert(res.error); }
  });
}

// ═══════════════════════════════════════════════════════
//  CARD MODAL — 55-cell targeting grid
// ═══════════════════════════════════════════════════════
let pendingCard = null;
L.selectedTarget = null;

function openCardModal(cardType) {
  const gs = L.gameState;
  if (!gs || (gs.phase !== 'SABOTAGE_PULSE' && gs.phase !== 'BREACH')) {
    alert('Cards are only available during the Sabotage Pulse!'); return;
  }
  SFX.click();
  pendingCard = cardType;
  L.selectedTarget = null;
  $('modal-title').textContent = cardType === 'freeze' ? '❄ FREEZE — Select Target' : '⚡ DOUBLE RISK — Select Target';
  $('modal-sub').textContent = cardType === 'freeze'
    ? 'Target team is locked out of the entire next round.'
    : 'If target answers wrong, they lose −8 pts instead of −5.';

  // Build 55-cell targeting grid
  const others = onlineTeams().filter(t => t.name !== L.teamName);
  $('targeting-grid').innerHTML = others.map(t => {
    let cls = 'target-cell';
    if (t.frozen) cls += ' frozen';
    if (t.targeted) cls += ' targeted';
    return `<div class="${cls}" data-name="${t.name}" onclick="selectTarget('${t.name}')">
      <div class="target-cell-name">${t.name}</div>
      <div class="target-cell-status">${t.frozen ? '❄ FROZEN' : t.targeted ? '⚡ TARGETED' : ''}</div>
    </div>`;
  }).join('');

  $('modal-confirm-btn').disabled = true;
  $('card-modal').classList.add('open');
}

function selectTarget(name) {
  L.selectedTarget = name;
  document.querySelectorAll('.target-cell').forEach(el => {
    el.classList.toggle('selected', el.dataset.name === name);
  });
  $('modal-confirm-btn').disabled = false;
}

function closeModal() { $('card-modal').classList.remove('open'); pendingCard = null; L.selectedTarget = null; }

function confirmCard() {
  if (!L.selectedTarget) return;
  socket.emit('useCard', { cardType: pendingCard, targetName: L.selectedTarget }, res => {
    if (res.ok) {
      if (pendingCard === 'freeze') SFX.freeze();
      else if (pendingCard === 'doublerisk') SFX.doubleRisk();
      else SFX.click();
      closeModal();
    } else { alert(res.error); }
  });
}

// ═══════════════════════════════════════════════════════
//  ADMIN PANEL
// ═══════════════════════════════════════════════════════
function renderAdmin() {
  if (L.screen !== 'admin') return;
  const gs = L.gameState || {};
  const phase = gs.phase || 'LOBBY';
  const s = getScenario(gs.currentLevel, gs.currentScenarioIdx);

  // Update BOTH pill elements
  const pill = $('admin-state-pill');
  if (pill) { pill.textContent = phase; pill.className = 'admin-state-pill ' + phase; }
  const navPill = $('admin-phase-indicator');
  if (navPill) { navPill.textContent = phase; }

  const inRound = phase === 'BREACH' || phase === 'SABOTAGE_PULSE' || phase === 'BRIEFING';
  $('btn-start-round').disabled = inRound;
  // Reveal is available any time a round is active OR in aftermath/recon (manual override)
  $('btn-reveal').disabled = (phase === 'LOBBY' || phase === 'RECON');
  $('btn-next').disabled = phase !== 'RECON' && phase !== 'AFTERMATH';

  const ad = $('admin-answer-display');
  if (s && (phase === 'AFTERMATH' || phase === 'RECON')) {
    const revAns = L.revealedAnswer || gs.revealedAnswer || '?';
    ad.className = `answer-${revAns}`; ad.textContent = revAns.toUpperCase() + ' — ' + (s.explanation || '');
  } else {
    ad.className = 'answer-hidden'; ad.textContent = 'Hidden until reveal';
  }

  // Levels
  const names = ['The Deployment Trenches', "The Architect's Anatomy", 'Digital Forensic Trail', 'The BlackBox Protocol'];
  $('level-list').innerHTML = [1, 2, 3, 4].map(l => `
    <button class="level-btn ${gs.currentLevel === l ? 'active' : ''}" onclick="adminSelectLevel(${l})">
      <span class="level-num">${l}</span><span class="level-name">${names[l - 1]}</span>
    </button>`).join('');

  // Scenarios
  const curLevel = gs.currentLevel || 1;
  const curIdx = gs.currentScenarioIdx || 0;
  const list = SCENARIOS.filter(sc => sc.level === curLevel);
  $('scenario-list').innerHTML = list.map((sc, i) => `
    <button class="scenario-btn ${curIdx === i ? 'active' : ''}" onclick="adminSelectScenario(${i})">
      <div class="scenario-btn-num">Rd ${sc.round} · ${sc.type.toUpperCase()}</div>
      <div class="scenario-btn-title">${sc.title.length > 36 ? sc.title.substring(0, 36) + '…' : sc.title}</div>
    </button>`).join('');

  if (s) { $('admin-scenario-preview').textContent = s.body; $('admin-scenario-preview').className = 'scenario-preview-text'; }

  // Decisions
  const online = onlineTeams();
  const voted = online.filter(t => L.decisions[key(t.name)]).length;
  $('voted-count').textContent = voted;
  $('total-count').textContent = online.filter(t => !t.frozen).length;
  $('admin-decisions').innerHTML = online.map(t => {
    const dec = L.decisions[key(t.name)];
    return `<div class="admin-decision-row">
      <span class="dec-team-name">${t.name}</span>
      <span class="${t.frozen ? '' : 'dec-choice-' + (dec || 'pending')}">${t.frozen ? '❄ FROZEN' : dec ? dec.toUpperCase() : 'pending…'}</span>
      <span class="dec-score-val ${(t.score || 0) >= 0 ? 'pos' : 'neg'}">${(t.score || 0) >= 0 ? '+' : ''}${t.score || 0}</span>
    </div>`;
  }).join('');

  // All teams (with override + unfreeze)
  $('admin-teams-list').innerHTML = allTeams().map(t => {
    const c = t.cards || {};
    return `<div class="team-admin-row" onclick="openOverrideModal('${t.name}',${t.score || 0})">
      <div class="team-admin-name">${t.name}
        <span class="card-dots">
          <span class="card-dot ${c.rollback !== false ? 'active-rollback' : 'used'}"></span>
          <span class="card-dot ${c.freeze !== false ? 'active-freeze' : 'used'}"></span>
          <span class="card-dot ${c.doublerisk !== false ? 'active-doublerisk' : 'used'}"></span>
        </span>
      </div>
      <div class="team-admin-meta">
        ${t.online ? '<span style="color:var(--green)">● online</span>' : '<span style="color:var(--dim)">○ offline</span>'}
        · ${(t.score || 0) >= 0 ? '+' : ''}${t.score || 0} pts
        ${t.frozen ? `· <button class="btn-ctrl blue" style="padding:2px 8px;font-size:10px" onclick="event.stopPropagation();unfreezeTeam('${t.name}')">Unfreeze</button>` : ''}
      </div>
    </div>`;
  }).join('');

  // Leaderboard
  $('admin-leaderboard').innerHTML = leaderboard().map((t, i) => {
    const rc = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    return `<div class="lb-row-admin">
      <div class="lb-rank ${rc}">${i + 1}</div>
      <div class="lb-name-admin">${t.name}</div>
      <div class="lb-score-admin ${(t.score || 0) >= 0 ? 'pos' : 'neg'}">${(t.score || 0) >= 0 ? '+' : ''}${t.score || 0}</div>
    </div>`;
  }).join('');
}

function adminSelectLevel(l) {
  const gs = L.gameState;
  if (gs && ['BREACH', 'SABOTAGE_PULSE', 'BRIEFING'].includes(gs.phase)) return;
  SFX.click();
  socket.emit('selectLevel', { level: l }, res => { if (!res.ok) alert(res.error); });
}
function adminSelectScenario(i) {
  const gs = L.gameState;
  if (gs && ['BREACH', 'SABOTAGE_PULSE', 'BRIEFING'].includes(gs.phase)) return;
  SFX.click();
  socket.emit('selectScenario', { idx: i }, res => { if (!res.ok) alert(res.error); });
}
function startRound() { socket.emit('startRound', res => { if (!res.ok) alert(res.error); }); }
function revealAnswer() { socket.emit('revealAnswer', res => { if (!res.ok) alert(res.error); }); }
function nextRound() { socket.emit('nextRound', res => { if (!res.ok) alert(res.error); }); }
function forceReady() { socket.emit('forceReady', res => { if (!res.ok) alert(res.error); }); }
function resetGame() {
  if (!confirm('Reset the entire game?')) return;
  if (!confirm('Are you sure? Cannot be undone.')) return;
  SFX.wrong();
  socket.emit('resetGame', res => { if (res.ok) alert('Game reset!'); else alert(res.error); });
}
function unfreezeTeam(name) {
  socket.emit('unfreezeTeam', { teamName: name }, res => { if (!res.ok) alert(res.error); });
}

// Score override
function openOverrideModal(name, score) {
  L.overrideTeam = name;
  $('override-team-label').textContent = `Override score for: ${name} (current: ${score >= 0 ? '+' : ''}${score})`;
  $('override-score-input').value = score;
  $('override-modal').classList.add('open');
}
function closeOverrideModal() { $('override-modal').classList.remove('open'); L.overrideTeam = null; }
function confirmOverride() {
  const score = parseInt($('override-score-input').value, 10);
  if (isNaN(score)) return;
  socket.emit('overrideScore', { teamName: L.overrideTeam, score }, res => {
    if (res.ok) { closeOverrideModal(); SFX.click(); }
    else alert(res.error);
  });
}

// Team management
function openAddTeamModal() { renderModalTeamList(); $('add-team-modal').classList.add('open'); }
function renderModalTeamList() {
  $('modal-team-list').innerHTML = allTeams().map(t => `
    <div class="team-list-row">
      <span>${t.name} <span style="color:var(--muted);font-size:10px">(${t.pass})</span></span>
      <button class="btn-remove-team" onclick="removeTeam('${t.name}')">✕</button>
    </div>`).join('');
}
function addTeamFromModal() {
  const name = document.getElementById('new-team-name').value.trim();
  const pass = document.getElementById('new-team-pass').value.trim() || name.toLowerCase().replace(/\s+/g, '');
  if (!name) return;
  SFX.click();
  socket.emit('addTeam', { name, pass }, res => {
    if (res.ok) { document.getElementById('new-team-name').value = ''; document.getElementById('new-team-pass').value = ''; renderModalTeamList(); }
    else alert(res.error);
  });
}
function removeTeam(name) {
  socket.emit('removeTeam', { name }, res => { if (res.ok) renderModalTeamList(); else alert(res.error); });
}

// ═══════════════════════════════════════════════════════
//  PROJECTOR
// ═══════════════════════════════════════════════════════
function renderProjector() {
  if (L.screen !== 'projector') return;
  const gs = L.gameState || {};
  const phase = gs.phase || 'LOBBY';
  const s = getScenario(gs.currentLevel, gs.currentScenarioIdx);

  const pill = $('proj-state-pill');
  if (pill) { pill.textContent = phase; pill.className = 'admin-state-pill ' + phase; }

  if (!s || phase === 'LOBBY') {
    $('proj-level-tag').textContent = 'STANDBY — AWAITING MISSION';
    $('proj-title').textContent = 'Chaos or Release?';
    $('proj-body').textContent = 'Guide FlowPay from a scrappy startup to a global payment platform.\nEvery DevOps decision your team makes shapes the company\'s fate.';
    $('proj-timer').textContent = '—';
    $('proj-timer').className = 'proj-timer';
    $('proj-answer-reveal').style.display = 'none';
    $('proj-decisions').innerHTML = '';
  } else {
    $('proj-level-tag').textContent = `LEVEL ${s.level} — ROUND ${s.round}/34 — ${s.levelName.toUpperCase()} — ${s.type.toUpperCase()}`;
    $('proj-title').textContent = s.title;
    $('proj-body').textContent = s.body;

    if (phase === 'AFTERMATH' || phase === 'RECON') {
      $('proj-answer-reveal').style.display = 'block';
      const b = $('proj-answer-banner');
      const revAns = L.revealedAnswer || gs.revealedAnswer || '?';
      b.className = 'proj-answer-banner ' + (revAns === 'deploy' ? 'correct' : 'wrong');
      b.textContent = `✓ ${revAns.toUpperCase()} — ${s ? s.explanation : ''}`;
    } else {
      $('proj-answer-reveal').style.display = 'none';
    }

    $('proj-decisions').innerHTML = onlineTeams().map(t => {
      const dec = L.decisions[key(t.name)];
      let cls = 'proj-dec-chip', label = '…';
      if (t.frozen) { cls += ' frozen'; label = '❄'; }
      else if (dec) { cls += (phase === 'AFTERMATH' || phase === 'RECON') ? ` voted-${dec}` : ' voted'; label = (phase === 'AFTERMATH' || phase === 'RECON') ? dec.toUpperCase() : '✓'; }
      return `<div class="${cls}"><div class="proj-dec-team">${t.name}</div><div class="proj-dec-choice">${label}</div></div>`;
    }).join('');
  }

  $('proj-leaderboard').innerHTML = leaderboard().map((t, i) => {
    const rc = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    const c = t.cards || {};
    return `<div class="lb-row-proj ${i === 0 ? 'top1' : ''} ${t.frozen ? 'frozen-row' : ''}">
      <div class="lb-rank-big ${rc}">${i + 1}</div>
      <div class="lb-info">
        <div class="lb-team-name">${t.name}</div>
        <div class="lb-team-cards"><span class="card-dots">
          <span class="card-dot ${c.rollback !== false ? 'active-rollback' : 'used'}"></span>
          <span class="card-dot ${c.freeze !== false ? 'active-freeze' : 'used'}"></span>
          <span class="card-dot ${c.doublerisk !== false ? 'active-doublerisk' : 'used'}"></span>
        </span></div>
      </div>
      <div class="lb-score-big ${(t.score || 0) >= 0 ? 'pos' : 'neg'}">${(t.score || 0) >= 0 ? '+' : ''}${t.score || 0}</div>
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════
//  BACKGROUND MUSIC ENGINE
// ═══════════════════════════════════════════════════════
let bgMusicInterval = null;
function startBgAtmosphere(phase) {
  stopBgAtmosphere();
  if (phase === 'BREACH') {
    // Tense low pulse every 2s
    bgMusicInterval = setInterval(() => {
      tone(60, 'sawtooth', 0.4, 0.06);
      tone(80, 'sawtooth', 0.35, 0.05, 0.05);
    }, 2000);
  } else if (phase === 'SABOTAGE_PULSE') {
    // Rapid urgent pulse
    bgMusicInterval = setInterval(() => {
      tone(880, 'sawtooth', 0.06, 0.15);
      tone(660, 'sawtooth', 0.04, 0.12, 0.1);
    }, 600);
  } else if (phase === 'BRIEFING') {
    // Calm scanning beeps
    bgMusicInterval = setInterval(() => {
      tone(400, 'sine', 0.1, 0.05);
    }, 3000);
  }
}
function stopBgAtmosphere() {
  if (bgMusicInterval) { clearInterval(bgMusicInterval); bgMusicInterval = null; }
}

// ═══════════════════════════════════════════════════════
//  COPY-PASTE DISABLE
// ═══════════════════════════════════════════════════════
function disableCopyPaste() {
  document.addEventListener('copy', e => { e.preventDefault(); return false; });
  document.addEventListener('cut', e => { e.preventDefault(); return false; });
  document.addEventListener('paste', e => { e.preventDefault(); return false; });
  document.addEventListener('contextmenu', e => { e.preventDefault(); return false; });
  document.addEventListener('selectstart', e => {
    // Allow selection in input fields only
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return true;
    e.preventDefault(); return false;
  });
  // CSS to prevent selection
  const style = document.createElement('style');
  style.textContent = `
    body { -webkit-user-select: none; -moz-user-select: none; user-select: none; }
    input, textarea { -webkit-user-select: text; -moz-user-select: text; user-select: text; }
    @keyframes rollbackFlash { 0%{opacity:1} 100%{opacity:0} }
    @keyframes rollbackPulse {
      0%{transform:scale(1);box-shadow:0 0 0 0 rgba(229,52,26,0.7)}
      50%{transform:scale(1.04);box-shadow:0 0 0 12px rgba(229,52,26,0)}
      100%{transform:scale(1);box-shadow:0 0 0 0 rgba(229,52,26,0)}
    }
    #rollback-btn { animation: rollbackPulse 0.8s ease-in-out infinite !important; border:2px solid #e5341a !important; font-weight:700 !important; }
  `;
  document.head.appendChild(style);
}

function boot() {
  initParticles();
  disableCopyPaste();
  const overlay = document.getElementById('connecting-overlay');
  socket.on('connect', () => {
    setTimeout(() => {
      if (overlay) { overlay.classList.add('hidden'); setTimeout(() => { if (overlay) overlay.style.display = 'none'; }, 600); }
      setScreen('login-screen');
    }, 800);
  });
  if (socket.connected) {
    setTimeout(() => {
      if (overlay) { overlay.classList.add('hidden'); setTimeout(() => { if (overlay) overlay.style.display = 'none'; }, 600); }
      setScreen('login-screen');
    }, 800);
  }
}
document.addEventListener('DOMContentLoaded', boot);