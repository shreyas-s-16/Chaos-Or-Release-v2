// ═══════════════════════════════════════════════════════
//  CHAOS OR RELEASE v2 — Server
//  5-Phase State Machine + Redis Locking + 4 Level Types
// ═══════════════════════════════════════════════════════

require('dotenv').config();
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const admin      = require('firebase-admin');
const Redis      = require('ioredis');
const path       = require('path');
const SCENARIOS  = require('./scenarios');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*', methods: ['GET','POST'] },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── FIREBASE ──
admin.initializeApp({
  credential: admin.credential.cert({
    projectId:   process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});
const db       = admin.database();
const gameRef  = db.ref('game');
const stateRef = db.ref('game/state');
const teamsRef = db.ref('game/teams');
const decsRef  = db.ref('game/decisions');
const quizRef  = db.ref('game/quizAnswers');

// ── REDIS ──
let redis;
try {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  redis.on('connect', () => console.log('✅ Redis connected'));
  redis.on('error',   (e) => console.warn('⚠️  Redis error:', e.message));
} catch(e) {
  console.warn('⚠️  Redis unavailable, using in-memory fallback');
  redis = null;
}

// In-memory fallback if Redis unavailable
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

// ── PASSWORDS & CONFIG ──
const ADMIN_PASSWORD     = process.env.ADMIN_PASSWORD     || 'admin123';
const PROJECTOR_PASSWORD = process.env.PROJECTOR_PASSWORD || 'projector123';

// ── PHASE CONFIG ──
// BRIEFING → BREACH → SABOTAGE_PULSE → AFTERMATH → RECON
const BREACH_DURATION        = 45;  // seconds for main decision window
const SABOTAGE_PULSE_DURATION = 15; // seconds for card window
const ROLLBACK_WINDOW        = 7;   // seconds rollback button shows
const TOTAL_ROUND_TIME       = BREACH_DURATION + SABOTAGE_PULSE_DURATION;

// ── HELPERS ──
const key     = n   => String(n).replace(/[^a-zA-Z0-9_]/g, '_');
const byLevel = l   => SCENARIOS.filter(s => s.level === l);
const scByIdx = (l,i) => byLevel(l)[i] || null;
const getRound = gs => {
  let r = 0;
  for (let l = 1; l < gs.currentLevel; l++) r += byLevel(l).length;
  return r + gs.currentScenarioIdx + 1;
};

// ── SERVER TIMERS ──
let phaseTimers = [];
function clearAllTimers() { phaseTimers.forEach(t => clearTimeout(t)); phaseTimers = []; }
function addTimer(fn, ms) { const t = setTimeout(fn, ms); phaseTimers.push(t); return t; }

// ── BROADCAST ──
async function broadcastState() {
  const snap = await gameRef.once('value');
  const data = snap.val() || {};
  io.emit('gameState', {
    state:       data.state       || {},
    teams:       data.teams       || {},
    decisions:   data.decisions   || {},
    quizAnswers: data.quizAnswers || {},
  });
}

// ── SEED ──
async function seedIfEmpty() {
  const snap = await stateRef.once('value');
  if (snap.exists()) return;
  console.log('Seeding database…');
  const defaultTeams = {};
  ['Alpha','Beta','Gamma','Delta'].forEach(n => {
    const name = `Team ${n}`;
    defaultTeams[key(name)] = {
      name, pass: n.toLowerCase(), score: 0,
      cards: { rollback:true, freeze:true, doublerisk:true },
      frozen:false, targeted:false, history:[], online:false
    };
  });
  await gameRef.set({
    state: {
      phase:              'LOBBY',
      currentLevel:       1,
      currentScenarioIdx: 0,
      breachStartedAt:    0,
      sabotageStartedAt:  0,
      breachDuration:     BREACH_DURATION,
      sabotageDuration:   SABOTAGE_PULSE_DURATION,
    },
    teams:       defaultTeams,
    decisions:   null,
    quizAnswers: null,
  });
  console.log('Database seeded.');
}

// ── SCORING ──
async function doRevealAnswer() {
  const snap = await gameRef.once('value');
  const data = snap.val();
  if (!data || !data.state) return;

  const gs    = data.state;
  const teams = data.teams       || {};
  const decs  = data.decisions   || {};
  const quiz  = data.quizAnswers || {};

  if (gs.phase === 'AFTERMATH' || gs.phase === 'RECON') return;

  const s = scByIdx(gs.currentLevel, gs.currentScenarioIdx);
  if (!s) return;

  const updates = {};
  const now     = Date.now();

  Object.values(teams).forEach(t => {
    if (!t.online) return;
    const k       = key(t.name);
    const dec     = decs[k];
    const history = [...(t.history || [])];

    // Frozen teams — skip scoring
    if (t.frozen) {
      updates[`game/teams/${k}/frozen`] = false; // unfreeze for next round
      return;
    }

    // Late submission penalty (-1)
    const submittedAt = dec ? (decs[`${k}_timestamp`] || now) : now;
    const isLate      = (submittedAt - gs.breachStartedAt) > (gs.breachDuration * 1000);

    if (!dec) {
      // No decision
      updates[`game/teams/${k}/score`] = (t.score || 0) - 1;
      history.push({ round: getRound(gs), decision: 'none', pts: -1, phase: gs.phase });
      updates[`game/teams/${k}/history`] = history;
      return;
    }

    let pts = 0;
    // Base score
    if (dec === s.answer) {
      pts = 6;
    } else {
      pts = t.targeted ? -8 : -5;
    }

    // Latency penalty
    if (isLate && dec === s.answer) pts -= 1;

    // Quiz bonus for L2 (correct quiz unlocks decision, correct answer = bonus already included)
    // L3 mini-quiz bonuses calculated separately
    if (s.type === 'forensic_trail') {
      const teamQuiz = quiz[k] || {};
      let quizBonus  = 0;
      (s.clues || []).forEach((clue, i) => {
        if (teamQuiz[`clue_${i}`] === clue.correct) quizBonus += clue.points;
      });
      pts += quizBonus;
    }

    updates[`game/teams/${k}/score`]    = (t.score || 0) + pts;
    updates[`game/teams/${k}/targeted`] = false;
    history.push({ round: getRound(gs), decision: dec, pts, phase: gs.phase });
    updates[`game/teams/${k}/history`]  = history;
  });

  updates['game/state/phase']          = 'AFTERMATH';
  updates['game/state/aftermathStart'] = Date.now();

  await db.ref().update(updates);
  await broadcastState();
  console.log('Aftermath — scores calculated');

  // Auto-advance to RECON after 10 seconds
  addTimer(async () => {
    await stateRef.update({ phase: 'RECON' });
    await broadcastState();
    console.log('Phase: RECON');
  }, 10000);
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
      if (!snap.exists()) return cb({ ok:false, error:'Team not found' });
      const team = snap.val();
      if (team.pass.toLowerCase() !== pass.toLowerCase()) return cb({ ok:false, error:'Wrong password' });
      await teamsRef.child(key(name)).update({ online:true });
      socket.teamName = team.name;
      socket.role     = 'team';
      await broadcastState();
      cb({ ok:true, name:team.name });
    } catch(e) { cb({ ok:false, error:'Server error' }); }
  });

  // ── AUTH ──
  socket.on('adminAuth', ({ pass }, cb) => {
    if (pass === ADMIN_PASSWORD) { socket.role='admin'; cb({ ok:true }); }
    else cb({ ok:false, error:'Wrong password' });
  });
  socket.on('projectorAuth', ({ pass }, cb) => {
    if (pass === PROJECTOR_PASSWORD) { socket.role='projector'; cb({ ok:true }); }
    else cb({ ok:false, error:'Wrong password' });
  });

  // ── LOGOUT ──
  socket.on('logout', async () => {
    if (socket.teamName) {
      await teamsRef.child(key(socket.teamName)).update({ online:false }).catch(()=>{});
      await broadcastState();
      socket.teamName = null;
    }
    socket.role = null;
  });

  // ── SUBMIT DECISION ──
  socket.on('submitDecision', async ({ decision }, cb) => {
    try {
      if (!socket.teamName) return cb({ ok:false, error:'Not logged in' });
      const gs = (await stateRef.once('value')).val();
      if (!gs || gs.phase !== 'BREACH') return cb({ ok:false, error:'Not in decision window' });
      const team = (await teamsRef.child(key(socket.teamName)).once('value')).val();
      if (!team) return cb({ ok:false, error:'Team not found' });
      if (team.frozen) return cb({ ok:false, error:'You are frozen' });
      if (!['deploy','delay'].includes(decision)) return cb({ ok:false, error:'Invalid decision' });
      const existing = await decsRef.child(key(socket.teamName)).once('value');
      if (existing.exists()) return cb({ ok:false, error:'Already submitted' });
      await decsRef.child(key(socket.teamName)).set(decision);
      await decsRef.child(`${key(socket.teamName)}_timestamp`).set(Date.now());
      await broadcastState();
      cb({ ok:true });
    } catch(e) { cb({ ok:false, error:'Server error' }); }
  });

  // ── SUBMIT QUIZ ANSWER (L2/L3) ──
  socket.on('submitQuizAnswer', async ({ clueId, answerIdx }, cb) => {
    try {
      if (!socket.teamName) return cb({ ok:false, error:'Not logged in' });
      const gs = (await stateRef.once('value')).val();
      if (!gs || (gs.phase !== 'BREACH' && gs.phase !== 'SABOTAGE_PULSE')) return cb({ ok:false, error:'Not in active phase' });
      const s = scByIdx(gs.currentLevel, gs.currentScenarioIdx);
      if (!s) return cb({ ok:false, error:'No active scenario' });

      await quizRef.child(key(socket.teamName)).child(clueId).set(answerIdx);
      await broadcastState();

      // Check if correct
      let correct = false;
      if (s.type === 'image_quiz' && s.quiz) {
        correct = answerIdx === s.quiz.correct;
      } else if (s.type === 'forensic_trail') {
        const clue = s.clues.find(c => c.id === clueId);
        correct = clue && answerIdx === clue.correct;
      }
      cb({ ok:true, correct });
    } catch(e) { cb({ ok:false, error:'Server error' }); }
  });

  // ── SUBMIT DECODER ANSWER (L4) ──
  socket.on('submitDecoderAnswer', async ({ decodedText }, cb) => {
    try {
      if (!socket.teamName) return cb({ ok:false, error:'Not logged in' });
      const gs = (await stateRef.once('value')).val();
      if (!gs || gs.phase !== 'BREACH') return cb({ ok:false, error:'Not in breach window' });
      const s = scByIdx(gs.currentLevel, gs.currentScenarioIdx);
      if (!s || s.type !== 'decoder') return cb({ ok:false, error:'Not a decoder round' });
      const correct = decodedText.trim().toUpperCase() === s.decodedText.toUpperCase();
      await quizRef.child(key(socket.teamName)).child('decoder').set({ text: decodedText, correct });
      await broadcastState();
      cb({ ok:true, correct });
    } catch(e) { cb({ ok:false, error:'Server error' }); }
  });

  // ── USE CARD (SABOTAGE_PULSE or BREACH) ──
  socket.on('useCard', async ({ cardType, targetName }, cb) => {
    try {
      if (!socket.teamName) return cb({ ok:false, error:'Not logged in' });
      const gs = (await stateRef.once('value')).val();
      if (!gs || (gs.phase !== 'SABOTAGE_PULSE' && gs.phase !== 'BREACH')) {
        return cb({ ok:false, error:'Cards only available during Sabotage Pulse or Breach' });
      }

      const team = (await teamsRef.child(key(socket.teamName)).once('value')).val();
      if (!team || team.frozen) return cb({ ok:false, error:'Frozen or not found' });
      const cards = team.cards || {};
      if (!cards[cardType]) return cb({ ok:false, error:'Card already used' });

      // Redis first-to-commit lock
      const lockKey = `card_lock:${cardType}:${key(targetName)}`;
      const acquired = await acquireLock(lockKey, 5000);
      if (!acquired) return cb({ ok:false, error:'Target already compromised! Another team got there first.' });

      const targetExists = await teamsRef.child(key(targetName)).once('value');
      if (!targetExists.exists()) {
        await releaseLock(lockKey);
        return cb({ ok:false, error:'Target team not found' });
      }

      const updates = {};
      if (cardType === 'freeze') {
        updates[`game/teams/${key(targetName)}/frozen`]          = true;
        updates[`game/teams/${key(socket.teamName)}/cards/freeze`] = false;
      } else if (cardType === 'doublerisk') {
        updates[`game/teams/${key(targetName)}/targeted`]              = true;
        updates[`game/teams/${key(socket.teamName)}/cards/doublerisk`] = false;
      }
      await db.ref().update(updates);
      await broadcastState();
      await releaseLock(lockKey);
      cb({ ok:true });
    } catch(e) { await releaseLock(`card_lock:${cardType}:${key(targetName)}`); cb({ ok:false, error:'Server error' }); }
  });

  // ── ROLLBACK ──
  socket.on('useRollback', async (cb) => {
    try {
      if (!socket.teamName) return cb({ ok:false, error:'Not logged in' });
      const gs = (await stateRef.once('value')).val();
      if (!gs || gs.phase !== 'AFTERMATH') return cb({ ok:false, error:'Rollback only available in Aftermath' });

      // Check 7-second window
      const elapsed = (Date.now() - (gs.aftermathStart || 0)) / 1000;
      if (elapsed > ROLLBACK_WINDOW) return cb({ ok:false, error:'Rollback window expired' });

      const team = (await teamsRef.child(key(socket.teamName)).once('value')).val();
      if (!team) return cb({ ok:false, error:'Team not found' });
      const cards = team.cards || {};
      if (!cards.rollback) return cb({ ok:false, error:'Rollback already used' });

      const dec = await decsRef.child(key(socket.teamName)).once('value');
      if (!dec.exists() || dec.val() !== 'deploy') return cb({ ok:false, error:'Rollback only for wrong Deploy decisions' });

      const s = scByIdx(gs.currentLevel, gs.currentScenarioIdx);
      if (!s || dec.val() === s.answer) return cb({ ok:false, error:'Decision was correct' });

      const oldPenalty = team.targeted ? -8 : -5;
      const newScore   = (team.score || 0) - oldPenalty + (-2);
      const history    = [...(team.history || [])];
      if (history.length) history[history.length-1].pts = -2;

      await teamsRef.child(key(socket.teamName)).update({
        score: newScore, history, 'cards/rollback': false,
      });
      await broadcastState();
      cb({ ok:true, newScore });
    } catch(e) { cb({ ok:false, error:'Server error' }); }
  });

  // ══════════════════════════════════════════════════════
  //  ADMIN ACTIONS
  // ══════════════════════════════════════════════════════

  // ── START ROUND (LOBBY → BREACH → SABOTAGE_PULSE) ──
  socket.on('startRound', async (cb) => {
    try {
      if (socket.role !== 'admin') return cb({ ok:false, error:'Unauthorized' });
      const gs = (await stateRef.once('value')).val();
      if (gs && gs.phase === 'BREACH') return cb({ ok:false, error:'Round already active' });

      clearAllTimers();
      await decsRef.set(null);
      await quizRef.set(null);

      const now = Date.now();

      // Phase 1: BRIEFING (5s for teams to read)
      await stateRef.update({
        phase:           'BRIEFING',
        breachStartedAt:  now + 5000,
        sabotageStartedAt: now + 5000 + (BREACH_DURATION * 1000),
        breachDuration:   BREACH_DURATION,
        sabotageDuration: SABOTAGE_PULSE_DURATION,
      });
      await broadcastState();
      io.emit('phase', { phase:'BRIEFING', message:'Incoming transmission…' });

      // Phase 2: BREACH after 5s
      addTimer(async () => {
        await stateRef.update({ phase:'BREACH', breachStartedAt: Date.now() });
        await broadcastState();
        io.emit('phase', { phase:'BREACH', duration: BREACH_DURATION });
        console.log('Phase: BREACH');

        // Phase 3: SABOTAGE_PULSE after BREACH_DURATION
        addTimer(async () => {
          await stateRef.update({ phase:'SABOTAGE_PULSE', sabotageStartedAt: Date.now() });
          await broadcastState();
          io.emit('phase', { phase:'SABOTAGE_PULSE', duration: SABOTAGE_PULSE_DURATION });
          console.log('Phase: SABOTAGE_PULSE');

          // Phase 4: AFTERMATH after SABOTAGE_PULSE_DURATION
          addTimer(async () => {
            await doRevealAnswer();
          }, SABOTAGE_PULSE_DURATION * 1000);

        }, BREACH_DURATION * 1000);
      }, 5000);

      cb({ ok:true });
      console.log('Round started — BRIEFING phase');
    } catch(e) { cb({ ok:false, error:'Server error' }); }
  });

  // ── MANUAL REVEAL ──
  socket.on('revealAnswer', async (cb) => {
    try {
      if (socket.role !== 'admin') return cb({ ok:false, error:'Unauthorized' });
      clearAllTimers();
      await doRevealAnswer();
      cb({ ok:true });
    } catch(e) { cb({ ok:false, error:'Server error' }); }
  });

  // ── NEXT ROUND (RECON → LOBBY) ──
  socket.on('nextRound', async (cb) => {
    try {
      if (socket.role !== 'admin') return cb({ ok:false, error:'Unauthorized' });
      clearAllTimers();

      const snap  = await gameRef.once('value');
      const data  = snap.val() || {};
      const gs    = data.state || {};
      const teams = data.teams || {};
      const updates = {};

      // Unfreeze all
      Object.keys(teams).forEach(k => {
        updates[`game/teams/${k}/frozen`]   = false;
        updates[`game/teams/${k}/targeted`] = false;
      });

      // Advance scenario
      const list = byLevel(gs.currentLevel || 1);
      let lvl = gs.currentLevel || 1, idx = gs.currentScenarioIdx || 0;
      if (idx < list.length - 1) { idx++; }
      else { if (lvl < 4) lvl++; idx = 0; }

      updates['game/state/phase']              = 'LOBBY';
      updates['game/state/currentLevel']       = lvl;
      updates['game/state/currentScenarioIdx'] = idx;
      updates['game/decisions']                = null;
      updates['game/quizAnswers']              = null;

      await db.ref().update(updates);
      await broadcastState();
      cb({ ok:true });
      console.log(`Next round: Level ${lvl}, Scenario ${idx+1}`);
    } catch(e) { cb({ ok:false, error:'Server error' }); }
  });

  // ── SELECT LEVEL ──
  socket.on('selectLevel', async ({ level }, cb) => {
    try {
      if (socket.role !== 'admin') return cb({ ok:false, error:'Unauthorized' });
      const gs = (await stateRef.once('value')).val();
      if (gs && gs.phase === 'BREACH') return cb({ ok:false, error:'Cannot change level mid-round' });
      await stateRef.update({ currentLevel: level, currentScenarioIdx: 0 });
      await broadcastState();
      cb({ ok:true });
    } catch(e) { cb({ ok:false, error:'Server error' }); }
  });

  // ── SELECT SCENARIO ──
  socket.on('selectScenario', async ({ idx }, cb) => {
    try {
      if (socket.role !== 'admin') return cb({ ok:false, error:'Unauthorized' });
      const gs = (await stateRef.once('value')).val();
      if (gs && gs.phase === 'BREACH') return cb({ ok:false, error:'Cannot change scenario mid-round' });
      await stateRef.update({ currentScenarioIdx: idx });
      await broadcastState();
      cb({ ok:true });
    } catch(e) { cb({ ok:false, error:'Server error' }); }
  });

  // ── ADD TEAM ──
  socket.on('addTeam', async ({ name, pass }, cb) => {
    try {
      if (socket.role !== 'admin') return cb({ ok:false, error:'Unauthorized' });
      const existing = await teamsRef.child(key(name)).once('value');
      if (existing.exists()) return cb({ ok:false, error:'Team already exists' });
      const password = pass || name.toLowerCase().replace(/\s+/g,'');
      await teamsRef.child(key(name)).set({
        name, pass: password, score:0,
        cards:{ rollback:true, freeze:true, doublerisk:true },
        frozen:false, targeted:false, history:[], online:false
      });
      await broadcastState();
      cb({ ok:true });
    } catch(e) { cb({ ok:false, error:'Server error' }); }
  });

  // ── REMOVE TEAM ──
  socket.on('removeTeam', async ({ name }, cb) => {
    try {
      if (socket.role !== 'admin') return cb({ ok:false, error:'Unauthorized' });
      await teamsRef.child(key(name)).remove();
      await broadcastState();
      cb({ ok:true });
    } catch(e) { cb({ ok:false, error:'Server error' }); }
  });

  // ── MANUAL SCORE OVERRIDE ──
  socket.on('overrideScore', async ({ teamName, score }, cb) => {
    try {
      if (socket.role !== 'admin') return cb({ ok:false, error:'Unauthorized' });
      const numScore = parseInt(score, 10);
      if (isNaN(numScore)) return cb({ ok:false, error:'Invalid score' });
      await teamsRef.child(key(teamName)).update({ score: numScore });
      await broadcastState();
      cb({ ok:true });
    } catch(e) { cb({ ok:false, error:'Server error' }); }
  });

  // ── UNFREEZE TEAM (hardware issue) ──
  socket.on('unfreezeTeam', async ({ teamName }, cb) => {
    try {
      if (socket.role !== 'admin') return cb({ ok:false, error:'Unauthorized' });
      await teamsRef.child(key(teamName)).update({ frozen:false });
      await broadcastState();
      cb({ ok:true });
    } catch(e) { cb({ ok:false, error:'Server error' }); }
  });

  // ── FORCE READY ──
  socket.on('forceReady', async (cb) => {
    try {
      if (socket.role !== 'admin') return cb({ ok:false, error:'Unauthorized' });
      clearAllTimers();
      await stateRef.update({ phase:'LOBBY' });
      await decsRef.set(null);
      await quizRef.set(null);
      await broadcastState();
      cb({ ok:true });
    } catch(e) { cb({ ok:false, error:'Server error' }); }
  });

  // ── RESET GAME ──
  socket.on('resetGame', async (cb) => {
    try {
      if (socket.role !== 'admin') return cb({ ok:false, error:'Unauthorized' });
      clearAllTimers();
      if (redis) await redis.flushdb();
      await gameRef.remove();
      await seedIfEmpty();
      await broadcastState();
      cb({ ok:true });
      console.log('Game reset');
    } catch(e) { cb({ ok:false, error:'Server error' }); }
  });

  // ── DISCONNECT ──
  socket.on('disconnect', async () => {
    console.log(`Disconnected: ${socket.id}`);
    if (socket.teamName) {
      await teamsRef.child(key(socket.teamName)).update({ online:false }).catch(()=>{});
      await broadcastState();
    }
  });
});

// ── HEALTH CHECK ──
app.get('/health', (req, res) => res.json({
  status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString()
}));

// ── START ──
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log(`\n🚀 COR v2 Server on port ${PORT}`);
  try { await seedIfEmpty(); console.log('✅ Firebase ready\n'); }
  catch(e) { console.error('❌ Firebase error:', e.message); }
});
