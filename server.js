// ═══════════════════════════════════════════════════════
//  CHAOS OR RELEASE v2 — Server (Master Handbook Edition)
//  Correct phase timings, scoring, Double Risk +10, hoarding penalty
// ═══════════════════════════════════════════════════════

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const admin = require('firebase-admin');
const Redis = require('ioredis');
const path = require('path');
const SCENARIOS = require('./scenarios');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(express.json());
// ── STATIC FILES — always serve from /public ──
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// ── FIREBASE ──
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});
const db = admin.database();
const gameRef = db.ref('game');
const stateRef = db.ref('game/state');
const teamsRef = db.ref('game/teams');
const decsRef = db.ref('game/decisions');
const quizRef = db.ref('game/quizAnswers');

// ── REDIS ──
let redis;
try {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  redis.on('connect', () => console.log('✅ Redis connected'));
  redis.on('error', (e) => console.warn('⚠️  Redis error:', e.message));
} catch (e) {
  console.warn('⚠️  Redis unavailable, using in-memory fallback');
  redis = null;
}
const memLocks = new Map();
async function acquireLock(lockKey, ttlMs = 5000) {
  if (redis) {
    const result = await redis.set(lockKey, '1', 'PX', ttlMs, 'NX');
    return result === 'OK';
  }
  if (memLocks.has(lockKey)) return false;
  memLocks.set(lockKey, true);
  setTimeout(() => memLocks.delete(lockKey), ttlMs);
  return true;
}
async function releaseLock(lockKey) {
  if (redis) await redis.del(lockKey);
  else memLocks.delete(lockKey);
}

// ── PASSWORDS ──
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const PROJECTOR_PASSWORD = process.env.PROJECTOR_PASSWORD || 'projector123';

// ── PHASE TIMINGS (per handbook) ──
// Analysis time per level: L1=45s, L2=60s, L3=90s, L4=180s
// Sabotage = last 15s of analysis (runs concurrently, not added after)
// Briefing = 60s
const BRIEFING_DURATION = 20; // Reduced from 60s — enough to read scenario
const SABOTAGE_DURATION = 15;
const ROLLBACK_WINDOW = 7;
const RECON_DURATION = 15;

const BREACH_DURATION_BY_LEVEL = { 1: 45, 2: 60, 3: 90, 4: 180 };

function getBreachDuration(level) {
  return BREACH_DURATION_BY_LEVEL[level] || 45;
}

// ── HELPERS ──
const clean = obj => JSON.parse(JSON.stringify(obj));
const key = n => String(n).replace(/[^a-zA-Z0-9_]/g, '_');
const byLevel = l => SCENARIOS.filter(s => s.level === l);
const scByIdx = (l, i) => byLevel(l)[i] || null;
const getRound = gs => {
  let r = 0;
  for (let l = 1; l < gs.currentLevel; l++) r += byLevel(l).length;
  return r + gs.currentScenarioIdx + 1;
};

// ── SERVER TIMERS ──
let phaseTimers = [];
let tickInterval = null;

function clearAllTimers() {
  phaseTimers.forEach(t => clearTimeout(t));
  phaseTimers = [];
  clearTick();
}
function addTimer(fn, ms) {
  const t = setTimeout(fn, ms);
  phaseTimers.push(t);
  return t;
}
function clearTick() {
  if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
}
function startTicking(duration, phase) {
  clearTick();
  let left = duration;
  io.emit('timerTick', { left, max: duration, phase });
  tickInterval = setInterval(() => {
    left--;
    io.emit('timerTick', { left: Math.max(0, left), max: duration, phase });
    if (left <= 0) clearTick();
  }, 1000);
}

// ── BROADCAST ──
async function broadcastState() {
  const snap = await gameRef.once('value');
  const data = snap.val() || {};
  const gs = data.state || {};

  let timerLeft = 0, timerMax = 0, timerPhase = gs.phase;
  if (gs.phase === 'BRIEFING' && gs.briefingStartedAt) {
    const elapsed = Math.floor((Date.now() - gs.briefingStartedAt) / 1000);
    timerLeft = Math.max(0, BRIEFING_DURATION - elapsed);
    timerMax = BRIEFING_DURATION;
  } else if (gs.phase === 'BREACH' && gs.breachStartedAt) {
    const elapsed = Math.floor((Date.now() - gs.breachStartedAt) / 1000);
    timerLeft = Math.max(0, (gs.breachDuration || 45) - elapsed);
    timerMax = gs.breachDuration || 45;
  } else if (gs.phase === 'SABOTAGE_PULSE' && gs.sabotageStartedAt) {
    const elapsed = Math.floor((Date.now() - gs.sabotageStartedAt) / 1000);
    timerLeft = Math.max(0, SABOTAGE_DURATION - elapsed);
    timerMax = SABOTAGE_DURATION;
  }

  io.emit('gameState', {
    state: gs,
    teams: data.teams || {},
    decisions: data.decisions || {},
    quizAnswers: data.quizAnswers || {},
    timerLeft,
    timerMax,
    timerPhase,
    revealedAnswer: gs.revealedAnswer || '',
  });
}

// ── SEED ──
async function seedIfEmpty() {
  const snap = await stateRef.once('value');
  if (snap.exists()) return;
  console.log('Seeding database…');
  const defaultTeams = {};
  ['Alpha', 'Beta', 'Gamma', 'Delta'].forEach(n => {
    const name = `Team ${n}`;
    defaultTeams[key(name)] = {
      name, pass: n.toLowerCase(), score: 0,
      cards: { rollback: true, freeze: true, doublerisk: true },
      frozen: false, frozenNextRound: false, targeted: false, history: [], online: false,
    };
  });
  await gameRef.set({
    state: {
      phase: 'LOBBY',
      currentLevel: 1,
      currentScenarioIdx: 0,
      briefingStartedAt: 0,
      breachStartedAt: 0,
      sabotageStartedAt: 0,
      breachDuration: 45,
      revealedAnswer: '',
    },
    teams: defaultTeams,
    decisions: null,
    quizAnswers: null,
  });
  console.log('Database seeded.');
}

// ── HOARDING PENALTY — called at end of Level 4 ──
async function applyHoardingPenalty() {
  const snap = await teamsRef.once('value');
  const teams = snap.val() || {};
  const updates = {};

  Object.values(teams).forEach(t => {
    if (!t.online) return;
    const k = key(t.name);
    const cards = t.cards || {};
    let penalty = 0;
    if (cards.rollback !== false) penalty += 2;
    if (cards.freeze !== false) penalty += 2;
    if (cards.doublerisk !== false) penalty += 2;
    if (penalty > 0) {
      updates[`game/teams/${k}/score`] = (t.score || 0) - penalty;
      const history = (t.history || []).map(h => clean(h));
      history.push({ round: 'END', decision: 'hoarding', pts: -penalty, phase: 'END' });
      updates[`game/teams/${k}/history`] = history;
    }
  });

  if (Object.keys(updates).length > 0) {
    await db.ref().update(updates);
    console.log('Hoarding penalties applied');
  }
}

// ── SCORING ──
async function doRevealAnswer() {
  const snap = await gameRef.once('value');
  const data = snap.val();
  if (!data || !data.state) return;

  const gs = data.state;
  const teams = data.teams || {};
  const decs = data.decisions || {};
  const quiz = data.quizAnswers || {};

  if (gs.phase === 'AFTERMATH' || gs.phase === 'RECON') return;

  const s = scByIdx(gs.currentLevel, gs.currentScenarioIdx);
  if (!s) return;

  const updates = {};
  const now = Date.now();
  const breachDuration = gs.breachDuration || getBreachDuration(gs.currentLevel);

  Object.values(teams).forEach(t => {
    if (!t.online) return;
    const k = key(t.name);
    const dec = decs[k] || null;
    const history = (t.history || []).map(h => clean(h));

    // Frozen THIS round — skip scoring (frozen was set at start of this round by startRound)
    if (t.frozen) {
      history.push({ round: getRound(gs), decision: 'frozen', pts: 0, phase: gs.phase });
      updates[`game/teams/${k}/history`] = history;
      // DO NOT unfreeze here — keep frozen=true, unfreeze happens in nextRound
      return;
    }

    // Late check — based on breach window start
    const submittedAt = dec ? (decs[`${k}_timestamp`] || now) : now;
    const isLate = (submittedAt - (gs.breachStartedAt || 0)) > (breachDuration * 1000);

    // No submission: -5 (wrong) + -1 (late) = -6
    if (!dec) {
      const pts = -6;
      history.push({ round: getRound(gs), decision: 'none', pts, phase: gs.phase });
      updates[`game/teams/${k}/score`] = (t.score || 0) + pts;
      updates[`game/teams/${k}/history`] = history;
      return;
    }

    let pts = 0;
    const isCorrect = dec === s.answer;

    if (isCorrect) {
      // Correct: +6, or +10 if Double Risk was played against them
      pts = t.targeted ? 10 : 6;
    } else {
      // Wrong: -5, or -8 if Double Risk was played against them
      pts = t.targeted ? -8 : -5;
    }

    // Latency penalty: -1 if submitted after timer hit 0
    if (isLate) pts -= 1;

    // L2 image_quiz: +2 bonus if quiz answered correctly (independent of decision)
    if (s.type === 'image_quiz' && s.quiz) {
      const teamQuiz = quiz[k] || {};
      const stored = teamQuiz['quiz'];
      // eslint-disable-next-line eqeqeq
      if (stored != null && stored == s.quiz.correct) {
        pts += 2;
      }
    }

    // L3 forensic trail: +2 per correct clue (independent of final decision)
    if (s.type === 'forensic_trail') {
      const teamQuiz = quiz[k] || {};
      (s.clues || []).forEach((clue, i) => {
        const stored = teamQuiz[`clue_${i}`];
        // eslint-disable-next-line eqeqeq
        if (stored != null && stored == clue.correct) {
          pts += (clue.points || 2);
        }
      });
    }

    history.push({ round: getRound(gs), decision: dec, pts, phase: gs.phase });
    updates[`game/teams/${k}/score`] = (t.score || 0) + pts;
    updates[`game/teams/${k}/targeted`] = false;
    updates[`game/teams/${k}/history`] = history;
  });

  updates['game/state/phase'] = 'AFTERMATH';
  updates['game/state/aftermathStart'] = now;
  updates['game/state/revealedAnswer'] = s.answer || '';

  // Strip any undefined values before writing to Firebase
  Object.keys(updates).forEach(k => { if (updates[k] === undefined) delete updates[k]; });

  await db.ref().update(updates);
  io.emit('phase', { phase: 'AFTERMATH', revealedAnswer: s.answer || '' });
  await broadcastState();
  console.log(`Aftermath — answer: ${s.answer}`);

  // Auto-advance to RECON after 20s — guard against double-fire
  addTimer(async () => {
    const snap2 = await stateRef.once('value');
    const curGs = snap2.val() || {};
    // Only advance if still in AFTERMATH (prevent double-fire from manual reveal)
    if (curGs.phase !== 'AFTERMATH') return;
    await stateRef.update({ phase: 'RECON' });
    io.emit('phase', { phase: 'RECON', revealedAnswer: curGs.revealedAnswer || '' });
    await broadcastState();
    console.log('Phase: RECON');
  }, 20000);
}

// ══════════════════════════════════════════════════════
//  SOCKET HANDLERS
// ══════════════════════════════════════════════════════
io.on('connection', async (socket) => {
  console.log(`Client connected: ${socket.id}`);
  broadcastState();

  // ── LOGIN ──
  socket.on('login', async ({ name, pass }, cb) => {
    try {
      const snap = await teamsRef.child(key(name)).once('value');
      if (!snap.exists()) return cb({ ok: false, error: 'Team not found' });
      const team = snap.val();
      if (team.pass.toLowerCase() !== pass.toLowerCase()) return cb({ ok: false, error: 'Wrong password' });
      await teamsRef.child(key(name)).update({ online: true });
      socket.teamName = team.name;
      socket.role = 'team';
      await broadcastState();
      cb({ ok: true, name: team.name });
    } catch (e) { cb({ ok: false, error: 'Server error' }); }
  });

  // ── AUTH ──
  socket.on('adminAuth', ({ pass }, cb) => {
    if (pass === ADMIN_PASSWORD) { socket.role = 'admin'; cb({ ok: true }); }
    else cb({ ok: false, error: 'Wrong password' });
  });
  socket.on('projectorAuth', ({ pass }, cb) => {
    if (pass === PROJECTOR_PASSWORD) { socket.role = 'projector'; cb({ ok: true }); }
    else cb({ ok: false, error: 'Wrong password' });
  });

  // ── LOGOUT ──
  socket.on('logout', async () => {
    if (socket.teamName) {
      await teamsRef.child(key(socket.teamName)).update({ online: false }).catch(() => { });
      await broadcastState();
      socket.teamName = null;
    }
    socket.role = null;
  });

  // ── SUBMIT DECISION ──
  socket.on('submitDecision', async ({ decision }, cb) => {
    try {
      if (!socket.teamName) return cb({ ok: false, error: 'Not logged in' });
      const gs = (await stateRef.once('value')).val();
      // Allow decisions during both BREACH and SABOTAGE_PULSE (last 15s of breach)
      if (!gs || (gs.phase !== 'BREACH' && gs.phase !== 'SABOTAGE_PULSE')) return cb({ ok: false, error: 'Not in decision window' });
      const team = (await teamsRef.child(key(socket.teamName)).once('value')).val();
      if (!team) return cb({ ok: false, error: 'Team not found' });
      if (team.frozen) return cb({ ok: false, error: 'You are frozen' });
      if (!['deploy', 'delay'].includes(decision)) return cb({ ok: false, error: 'Invalid decision' });
      const existing = await decsRef.child(key(socket.teamName)).once('value');
      if (existing.exists()) return cb({ ok: false, error: 'Already submitted' });
      await decsRef.child(key(socket.teamName)).set(decision);
      await decsRef.child(`${key(socket.teamName)}_timestamp`).set(Date.now());
      await broadcastState();
      cb({ ok: true });
    } catch (e) { cb({ ok: false, error: 'Server error' }); }
  });

  // ── SUBMIT QUIZ ANSWER (L2/L3) ──
  socket.on('submitQuizAnswer', async ({ clueId, answerIdx }, cb) => {
    try {
      if (!socket.teamName) return cb({ ok: false, error: 'Not logged in' });
      const gs = (await stateRef.once('value')).val();
      if (!gs || (gs.phase !== 'BREACH' && gs.phase !== 'SABOTAGE_PULSE')) return cb({ ok: false, error: 'Not in active phase' });
      const s = scByIdx(gs.currentLevel, gs.currentScenarioIdx);
      if (!s) return cb({ ok: false, error: 'No active scenario' });

      await quizRef.child(key(socket.teamName)).child(clueId).set(answerIdx);
      await broadcastState();

      let correct = false;
      if (s.type === 'image_quiz' && s.quiz) {
        // eslint-disable-next-line eqeqeq
        correct = answerIdx == s.quiz.correct;
      } else if (s.type === 'forensic_trail') {
        const clue = s.clues.find(c => c.id === clueId);
        // eslint-disable-next-line eqeqeq
        correct = clue && answerIdx == clue.correct;
      }
      cb({ ok: true, correct });
    } catch (e) { cb({ ok: false, error: 'Server error' }); }
  });

  // ── SUBMIT DECODER ANSWER (L4) ──
  socket.on('submitDecoderAnswer', async ({ decodedText }, cb) => {
    try {
      if (!socket.teamName) return cb({ ok: false, error: 'Not logged in' });
      const gs = (await stateRef.once('value')).val();
      if (!gs || gs.phase !== 'BREACH') return cb({ ok: false, error: 'Not in breach window' });
      const s = scByIdx(gs.currentLevel, gs.currentScenarioIdx);
      if (!s || (s.type !== 'decoder' && s.type !== 'caesar_cipher')) return cb({ ok: false, error: 'Not a decoder round' });
      // Normalize: trim, uppercase, collapse multiple spaces, ignore punctuation differences
      const normalize = str => str.trim().toUpperCase().replace(/\s+/g, ' ').replace(/[^A-Z0-9 ]/g, '');
      const correct = normalize(decodedText) === normalize(s.decodedText || '');
      await quizRef.child(key(socket.teamName)).child('decoder').set({ text: decodedText, correct });
      await broadcastState();
      cb({ ok: true, correct });
    } catch (e) { cb({ ok: false, error: 'Server error' }); }
  });

  // ── USE CARD (SABOTAGE_PULSE only per handbook) ──
  socket.on('useCard', async ({ cardType, targetName }, cb) => {
    try {
      if (!socket.teamName) return cb({ ok: false, error: 'Not logged in' });
      const gs = (await stateRef.once('value')).val();
      if (!gs || gs.phase !== 'SABOTAGE_PULSE') {
        return cb({ ok: false, error: 'Cards only available during the Sabotage Pulse (last 15s)' });
      }

      // Cannot target yourself
      if (targetName === socket.teamName) {
        return cb({ ok: false, error: 'You cannot target yourself' });
      }

      const team = (await teamsRef.child(key(socket.teamName)).once('value')).val();
      if (!team || team.frozen) return cb({ ok: false, error: 'Frozen or not found' });
      const cards = team.cards || {};
      if (!cards[cardType]) return cb({ ok: false, error: 'Card already used' });

      // Redis first-to-commit lock
      const lockKey = `card_lock:${cardType}:${key(targetName)}`;
      const acquired = await acquireLock(lockKey, 5000);
      if (!acquired) return cb({ ok: false, error: 'Target already compromised! Another team got there first.' });

      const targetSnap = await teamsRef.child(key(targetName)).once('value');
      if (!targetSnap.exists()) {
        await releaseLock(lockKey);
        return cb({ ok: false, error: 'Target team not found' });
      }

      const updates = {};
      if (cardType === 'freeze') {
        // frozenNextRound = true means skip scoring in the NEXT round
        // frozen = false still so current round is unaffected
        updates[`game/teams/${key(targetName)}/frozenNextRound`] = true;
        updates[`game/teams/${key(socket.teamName)}/cards/freeze`] = false;
      } else if (cardType === 'doublerisk') {
        updates[`game/teams/${key(targetName)}/targeted`] = true;
        updates[`game/teams/${key(socket.teamName)}/cards/doublerisk`] = false;
      }

      await db.ref().update(updates);
      await broadcastState();
      await releaseLock(lockKey);
      cb({ ok: true });
    } catch (e) {
      await releaseLock(`card_lock:${cardType}:${key(targetName)}`);
      cb({ ok: false, error: 'Server error' });
    }
  });

  // ── ROLLBACK ──
  socket.on('useRollback', async (cb) => {
    try {
      if (!socket.teamName) return cb({ ok: false, error: 'Not logged in' });
      const gs = (await stateRef.once('value')).val();
      if (!gs || gs.phase !== 'AFTERMATH') return cb({ ok: false, error: 'Rollback only available in Aftermath' });

      const elapsed = (Date.now() - (gs.aftermathStart || 0)) / 1000;
      if (elapsed > ROLLBACK_WINDOW) return cb({ ok: false, error: 'Rollback window expired' });

      const team = (await teamsRef.child(key(socket.teamName)).once('value')).val();
      if (!team) return cb({ ok: false, error: 'Team not found' });
      if (!team.cards || !team.cards.rollback) return cb({ ok: false, error: 'Rollback already used' });

      const dec = await decsRef.child(key(socket.teamName)).once('value');
      if (!dec.exists() || dec.val() !== 'deploy') return cb({ ok: false, error: 'Rollback only for wrong Deploy decisions' });

      const s = scByIdx(gs.currentLevel, gs.currentScenarioIdx);
      if (!s || dec.val() === s.answer) return cb({ ok: false, error: 'Decision was correct — no rollback needed' });

      // Rollback: change -5 or -8 penalty to -2 (per handbook)
      const oldPenalty = team.targeted ? -8 : -5;
      const latePenalty = (team.history && team.history.length && team.history[team.history.length - 1].pts < oldPenalty) ? -1 : 0;
      const newScore = (team.score || 0) - (oldPenalty + latePenalty) + (-2);
      const history = (team.history || []).map(h => clean(h));
      if (history.length) history[history.length - 1].pts = -2;

      await teamsRef.child(key(socket.teamName)).update({
        score: newScore, history, 'cards/rollback': false,
      });
      await broadcastState();
      cb({ ok: true, newScore });
    } catch (e) { cb({ ok: false, error: 'Server error' }); }
  });

  // ══════════════════════════════════════════════════════
  //  ADMIN ACTIONS
  // ══════════════════════════════════════════════════════

  // ── START ROUND ──
  socket.on('startRound', async (cb) => {
    try {
      if (socket.role !== 'admin') return cb({ ok: false, error: 'Unauthorized' });
      const gs = (await stateRef.once('value')).val();
      if (gs && (gs.phase === 'BREACH' || gs.phase === 'BRIEFING' || gs.phase === 'SABOTAGE_PULSE')) {
        return cb({ ok: false, error: 'Round already active' });
      }

      clearAllTimers();
      await decsRef.set(null);
      await quizRef.set(null);

      // Promote frozenNextRound → frozen for this round
      const teamsSnap = await teamsRef.once('value');
      const teamsData = teamsSnap.val() || {};
      const freezeUpdates = {};
      Object.values(teamsData).forEach(t => {
        const k = key(t.name);
        if (t.frozenNextRound) {
          freezeUpdates[`game/teams/${k}/frozen`] = true;
          freezeUpdates[`game/teams/${k}/frozenNextRound`] = false;
          console.log(`Team ${t.name} is FROZEN this round`);
        }
      });
      if (Object.keys(freezeUpdates).length > 0) {
        await db.ref().update(freezeUpdates);
      }

      const level = gs ? (gs.currentLevel || 1) : 1;
      const breachDur = getBreachDuration(level);
      // Sabotage runs during the last 15s of breach (starts when breach has breachDur - 15s elapsed)
      const sabotageMsIn = Math.max(0, (breachDur - SABOTAGE_DURATION) * 1000);
      const now = Date.now();

      // Phase 1: BRIEFING — 60 seconds
      await stateRef.update({
        phase: 'BRIEFING',
        briefingStartedAt: now,
        breachDuration: breachDur,
        revealedAnswer: '',
      });
      await broadcastState();
      io.emit('phase', { phase: 'BRIEFING', message: 'Incoming transmission…', duration: BRIEFING_DURATION });
      startTicking(BRIEFING_DURATION, 'BRIEFING');
      console.log(`Round started — BRIEFING (${BRIEFING_DURATION}s)`);

      // Phase 2: BREACH after BRIEFING
      addTimer(async () => {
        const breachNow = Date.now();
        await stateRef.update({ phase: 'BREACH', breachStartedAt: breachNow });
        await broadcastState();
        io.emit('phase', { phase: 'BREACH', duration: breachDur });
        startTicking(breachDur, 'BREACH');
        console.log(`Phase: BREACH (${breachDur}s)`);

        // Phase 3: SABOTAGE_PULSE — last 15s of breach window
        addTimer(async () => {
          const sabNow = Date.now();
          await stateRef.update({ phase: 'SABOTAGE_PULSE', sabotageStartedAt: sabNow });
          await broadcastState();
          io.emit('phase', { phase: 'SABOTAGE_PULSE', duration: SABOTAGE_DURATION });
          startTicking(SABOTAGE_DURATION, 'SABOTAGE_PULSE');
          console.log('Phase: SABOTAGE_PULSE (15s)');

          // Phase 4: AFTERMATH after sabotage ends
          addTimer(async () => {
            await doRevealAnswer();
          }, SABOTAGE_DURATION * 1000);

        }, sabotageMsIn);
      }, BRIEFING_DURATION * 1000);

      cb({ ok: true });
    } catch (e) { cb({ ok: false, error: 'Server error' }); }
  });

  // ── MANUAL REVEAL ──
  socket.on('revealAnswer', async (cb) => {
    try {
      if (socket.role !== 'admin') return cb({ ok: false, error: 'Unauthorized' });
      clearAllTimers();
      await doRevealAnswer();
      cb({ ok: true });
    } catch (e) { cb({ ok: false, error: 'Server error' }); }
  });

  // ── NEXT ROUND ──
  socket.on('nextRound', async (cb) => {
    try {
      if (socket.role !== 'admin') return cb({ ok: false, error: 'Unauthorized' });
      clearAllTimers();

      const snap = await gameRef.once('value');
      const data = snap.val() || {};
      const gs = data.state || {};
      const teams = data.teams || {};
      const updates = {};

      // Check if this is the last round of Level 4 — apply hoarding penalty
      const list = byLevel(gs.currentLevel || 1);
      const isLastL4 = gs.currentLevel === 4 && gs.currentScenarioIdx >= list.length - 1;
      if (isLastL4) {
        await applyHoardingPenalty();
        console.log('Game complete — hoarding penalties applied');
      }

      // Un-target all teams, reset frozen (startRound will re-apply frozenNextRound)
      Object.keys(teams).forEach(k => {
        updates[`game/teams/${k}/frozen`] = false;
        updates[`game/teams/${k}/targeted`] = false;
        // frozenNextRound is preserved — startRound will promote it to frozen
      });

      // Advance scenario/level
      let lvl = gs.currentLevel || 1;
      let idx = gs.currentScenarioIdx || 0;
      if (idx < list.length - 1) { idx++; }
      else { if (lvl < 4) { lvl++; idx = 0; } }

      updates['game/state/phase'] = 'LOBBY';
      updates['game/state/currentLevel'] = lvl;
      updates['game/state/currentScenarioIdx'] = idx;
      updates['game/state/revealedAnswer'] = '';
      updates['game/decisions'] = null;
      updates['game/quizAnswers'] = null;

      await db.ref().update(updates);
      await broadcastState();
      cb({ ok: true });
      console.log(`Next round: Level ${lvl}, Scenario ${idx + 1}`);
    } catch (e) { cb({ ok: false, error: 'Server error' }); }
  });

  // ── SELECT LEVEL ──
  socket.on('selectLevel', async ({ level }, cb) => {
    try {
      if (socket.role !== 'admin') return cb({ ok: false, error: 'Unauthorized' });
      const gs = (await stateRef.once('value')).val();
      if (gs && ['BREACH', 'SABOTAGE_PULSE', 'BRIEFING'].includes(gs.phase)) {
        return cb({ ok: false, error: 'Cannot change level during active round' });
      }
      await stateRef.update({ currentLevel: level, currentScenarioIdx: 0 });
      await broadcastState();
      cb({ ok: true });
    } catch (e) { cb({ ok: false, error: 'Server error' }); }
  });

  // ── SELECT SCENARIO ──
  socket.on('selectScenario', async ({ idx }, cb) => {
    try {
      if (socket.role !== 'admin') return cb({ ok: false, error: 'Unauthorized' });
      const gs = (await stateRef.once('value')).val();
      if (gs && ['BREACH', 'SABOTAGE_PULSE', 'BRIEFING'].includes(gs.phase)) {
        return cb({ ok: false, error: 'Cannot change scenario during active round' });
      }
      await stateRef.update({ currentScenarioIdx: idx });
      await broadcastState();
      cb({ ok: true });
    } catch (e) { cb({ ok: false, error: 'Server error' }); }
  });

  // ── ADD TEAM ──
  socket.on('addTeam', async ({ name, pass }, cb) => {
    try {
      if (socket.role !== 'admin') return cb({ ok: false, error: 'Unauthorized' });
      const existing = await teamsRef.child(key(name)).once('value');
      if (existing.exists()) return cb({ ok: false, error: 'Team already exists' });
      const password = pass || name.toLowerCase().replace(/\s+/g, '');
      await teamsRef.child(key(name)).set({
        name, pass: password, score: 0,
        cards: { rollback: true, freeze: true, doublerisk: true },
        frozen: false, frozenNextRound: false, targeted: false, history: [], online: false,
      });
      await broadcastState();
      cb({ ok: true });
    } catch (e) { cb({ ok: false, error: 'Server error' }); }
  });

  // ── REMOVE TEAM ──
  socket.on('removeTeam', async ({ name }, cb) => {
    try {
      if (socket.role !== 'admin') return cb({ ok: false, error: 'Unauthorized' });
      await teamsRef.child(key(name)).remove();
      await broadcastState();
      cb({ ok: true });
    } catch (e) { cb({ ok: false, error: 'Server error' }); }
  });

  // ── OVERRIDE SCORE ──
  socket.on('overrideScore', async ({ teamName, score }, cb) => {
    try {
      if (socket.role !== 'admin') return cb({ ok: false, error: 'Unauthorized' });
      const numScore = parseInt(score, 10);
      if (isNaN(numScore)) return cb({ ok: false, error: 'Invalid score' });
      await teamsRef.child(key(teamName)).update({ score: numScore });
      await broadcastState();
      cb({ ok: true });
    } catch (e) { cb({ ok: false, error: 'Server error' }); }
  });

  // ── UNFREEZE TEAM ──
  socket.on('unfreezeTeam', async ({ teamName }, cb) => {
    try {
      if (socket.role !== 'admin') return cb({ ok: false, error: 'Unauthorized' });
      await teamsRef.child(key(teamName)).update({ frozen: false });
      await broadcastState();
      cb({ ok: true });
    } catch (e) { cb({ ok: false, error: 'Server error' }); }
  });

  // ── FORCE READY ──
  socket.on('forceReady', async (cb) => {
    try {
      if (socket.role !== 'admin') return cb({ ok: false, error: 'Unauthorized' });
      clearAllTimers();
      await stateRef.update({ phase: 'LOBBY', revealedAnswer: '' });
      await decsRef.set(null);
      await quizRef.set(null);
      await broadcastState();
      cb({ ok: true });
    } catch (e) { cb({ ok: false, error: 'Server error' }); }
  });

  // ── RESET GAME ──
  socket.on('resetGame', async (cb) => {
    try {
      if (socket.role !== 'admin') return cb({ ok: false, error: 'Unauthorized' });
      clearAllTimers();
      if (redis) await redis.flushdb();
      await gameRef.remove();
      await seedIfEmpty();
      await broadcastState();
      cb({ ok: true });
      console.log('Game reset');
    } catch (e) { cb({ ok: false, error: 'Server error' }); }
  });

  // ── DISCONNECT ──
  socket.on('disconnect', async () => {
    console.log(`Disconnected: ${socket.id}`);
    if (socket.teamName) {
      await teamsRef.child(key(socket.teamName)).update({ online: false }).catch(() => { });
      await broadcastState();
    }
  });
});

// ── HEALTH CHECK ──
app.get('/health', (req, res) => res.json({
  status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString(),
}));

// ── START ──
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log(`\n🚀 COR v2 Server on port ${PORT}`);
  try {
    await db.ref('.info/connected').once('value');
    console.log('✅ Firebase connected');
    await seedIfEmpty();
    console.log('✅ Firebase ready\n');
  } catch (e) {
    console.error('❌ Firebase error:', e.message);
    console.error('   Check: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_DATABASE_URL');
    process.exit(1);
  }
});