"use strict";

// ─── GAME ENGINE ─────────────────────────────────────────────────
// Queue system, beat runner, score changes, episode loading

let currentEpisode = null;
let currentBeat    = null;
let scores         = {};
let goalPct        = 0;
let currentPath    = null;        // legacy: most recent choice's path value
let paths          = {};          // multi-axis paths: { pathKey: pathValue }
let queue          = [];
let busy           = false;
let choiceDone     = null;

// ── Score management ──────────────────────────────────────────────
function changeScore(id, delta) {
  if (!(id in scores)) return;
  scores[id] = Math.max(0, Math.min(100, scores[id] + delta));
  renderSidebar(currentEpisode.activeChars, scores);
  flashCard(id, delta > 0);
  const c = CHARACTERS[id];
  notify((delta > 0 ? '📈 +' : '📉 ') + Math.abs(delta) + ' עם ' + c.name);
}

function setGoal(pct) {
  goalPct = Math.max(0, Math.min(100, pct));
  setGoalBar(goalPct);
}

// ── Message queue ─────────────────────────────────────────────────
function enq(fn) { queue.push(fn); pump(); }

function pump() {
  if (busy || queue.length === 0) return;
  busy = true;
  queue.shift()(() => { busy = false; pump(); });
}

function qMsg(charId, text, typingMs, pauseMs, isEmoji, channel) {
  enq((done) => {
    const c = CHARACTERS[charId];
    // Show typing indicator only when the upcoming message is for the channel
    // the player is currently viewing. Otherwise we silently wait the same time
    // so message pacing stays intact, then drop it into the right channel
    // (where it shows up as an unread badge).
    const targetCh = channel || (typeof getActiveChannel === 'function' ? getActiveChannel() : null);
    const isForActive = (typeof getActiveChannel === 'function') && targetCh === getActiveChannel();
    if (isForActive) showTyping(c.name);
    const actualTyping = Math.max(typingMs || 1200, 1400);
    const actualPause  = Math.max(pauseMs  || 250,  600);
    setTimeout(() => {
      if (isForActive) hideTyping();
      addMsg({ charId, text, isEmoji: !!isEmoji, channel: targetCh, isPlayer: charId === 'player' });
      setTimeout(done, actualPause);
    }, actualTyping);
  });
}

// Queue a channel switch (animated handoff to where the action is)
function qSwitchChannel(channelId) {
  enq((done) => {
    if (typeof switchToChannel === 'function') switchToChannel(channelId);
    setTimeout(done, 300);   // small pause so the player sees the switch
  });
}

function qNotify(text, delayMs) {
  enq((done) => {
    setTimeout(() => { notify(text); done(); }, delayMs || 600);
  });
}

function qWait(ms) {
  enq((done) => setTimeout(done, ms));
}

function qChoicePrompt(choices) {
  enq((done) => {
    renderChoices(choices);
    choiceDone = done;
  });
}

// ── Choice handler (called from rendered HTML) ────────────────────
function makeChoice(i) {
  const choice = window._pendingChoices[i];
  hideChoices();

  // Resolve which channel the player's response goes into.
  // Order: explicit choice.channel > current beat's default channel > active channel.
  const choiceCh = choice.channel
    || (currentBeat && currentBeat.channel)
    || (typeof getActiveChannel === 'function' ? getActiveChannel() : null);

  // Switch the view to that channel BEFORE posting, so the player sees their message land.
  if (choiceCh && typeof switchToChannel === 'function' && choiceCh !== getActiveChannel()) {
    switchToChannel(choiceCh);
  }

  // Choices without `text` are silent actions (e.g. "stay focused, say nothing").
  // Show a small system note in the active channel instead of a posted player message.
  if (choice.text) {
    addMsg({ text: choice.text, isPlayer: true, isEmoji: !!choice.isEmoji, channel: choiceCh });
  } else if (choice.label) {
    addSystemMsg('You stayed silent. (' + choice.label.replace(/\s*\(no message\)\s*$/i, '').toLowerCase() + ')', choiceCh);
  }
  GameAudio.beep(660, 0.08);

  if (choice.effects) {
    Object.entries(choice.effects).forEach(([id, v]) => changeScore(id, v));
  }

  if (choice.goalDelta) setGoal(goalPct + choice.goalDelta);

  if (choice.path !== undefined && choice.path !== null) {
    const key = choice.pathKey || 'default';
    paths[key] = choice.path;
    currentPath = choice.path;        // legacy fallback for engine code
  }

  const cb = choiceDone;
  choiceDone = null;

  if (choice.next) {
    if (cb) cb();
    // Pause so the player can see their message land in the channel they
    // chose, before the next beat auto-switches them somewhere else.
    qWait(1500);
    runBeat(choice.next);
  } else {
    if (cb) cb();
  }
}

// ── Beat runner ───────────────────────────────────────────────────
function runBeat(beatId) {
  const beat = currentEpisode.beats.find(b => b.id === beatId);
  if (!beat) { console.warn('Beat not found:', beatId); return; }
  currentBeat = beat;

  // Router beat: a beat with `routerFn` decides which beat to run next based on
  // current state (paths/scores/goalPct). Has no messages of its own.
  if (typeof beat.routerFn === 'function') {
    const targetId = beat.routerFn({ paths, scores, goalPct, currentPath });
    enq((done) => { done(); runBeat(targetId); });
    return;
  }

  // Determine the channel the player's view should be on for this beat.
  // Priority: beat.channel > first message's channel > current active.
  let beatChannel = beat.channel;
  if (!beatChannel && beat.messages && beat.messages.length) {
    beatChannel = beat.messages[0].channel;
  }
  if (!beatChannel && beat.branchMessages) {
    const msgs = beat.branchMessages[currentPath] || beat.branchMessages['default'] || [];
    if (msgs.length) beatChannel = msgs[0].channel;
  }
  // Auto-switch the view to where this beat's action starts (if different from current)
  if (beatChannel && typeof getActiveChannel === 'function' && beatChannel !== getActiveChannel()) {
    qSwitchChannel(beatChannel);
  }

  if (beat.branchMessages) {
    // Look up the path value via the named axis (defaults to legacy 'default' key)
    const axis = beat.branchOnPath || 'default';
    const pathVal = paths[axis] !== undefined ? paths[axis] : currentPath;
    const msgs = beat.branchMessages[pathVal] || beat.branchMessages['default'] || [];
    msgs.forEach(m => {
      const ch = m.channel || beat.channel;
      qMsg(m.from, m.text, m.typingMs, m.delay, m.isEmoji, ch);
    });
    // fall through so a beat can mix branchMessages with choices, ending, or autoNext
  }

  if (beat.messages) {
    beat.messages.forEach(m => {
      if (m.from === '_notify') {
        qNotify(m.text, m.delay);
      } else {
        const ch = m.channel || beat.channel;
        qMsg(m.from, m.text, m.typingMs, m.delay, m.isEmoji, ch);
      }
    });
  }

  // Static ending OR dynamic dispatcher. If endingFn is provided, the beat
  // computes the ending key from current state (paths/scores/goalPct).
  const endingKey = beat.ending
    || (typeof beat.endingFn === 'function'
          ? beat.endingFn({ paths, scores, goalPct, currentPath })
          : null);
  if (endingKey) {
    enq((done) => {
      const endData = currentEpisode.endings[endingKey];
      if (!endData) { console.warn('Ending not found:', endingKey); done(); return; }
      setGoal(endData.goalScore != null ? endData.goalScore : 100);
      GameState.completeEpisode(currentEpisode.id, scores, endData.badgeIcon);
      // Good endings: drop a celebration message into #momentsofmagic before showing the end screen
      if (typeof postIncidentCelebration === 'function') {
        postIncidentCelebration(endingKey);
      }
      setTimeout(() => showEnd(endData, currentEpisode.activeChars, scores, endingKey), 1200);
      done();
    });
    return;
  }

  if (beat.choices) {
    qChoicePrompt(beat.choices);
    return;
  }

  if (beat.autoNext) {
    enq((done) => { done(); runBeat(beat.autoNext); });
  }
}

// ── Episode loader ────────────────────────────────────────────────
function loadEpisode(episode) {
  currentEpisode = episode;

  // Build starting scores: blend carried history with episode defaults
  scores = {};
  const carried = [];
  Object.entries(episode.initialScores).forEach(([charId, defaultScore]) => {
    const startScore = GameState.getStartingScore(charId, defaultScore);
    scores[charId] = startScore;
    if (GameState.hasHistory(charId) && startScore !== defaultScore) {
      carried.push({ charId, score: startScore, default: defaultScore });
    }
  });

  goalPct      = 0;
  currentPath  = null;
  paths        = {};
  // Use the episode's startTime if provided, otherwise default to 10:28
  msgTime      = episode.startTime ? { ...episode.startTime } : { h: 10, m: 28 };
  queue        = [];
  busy         = false;
  choiceDone   = null;
  window._pendingChoices = null;

  // Reset UI: empty all per-channel panes (channels.js owns the panes;
  // we just clear their contents and re-seed each with a date divider).
  const wrap = document.getElementById('chat-messages');
  if (wrap) wrap.innerHTML = '';
  hideChoices();
  hideTyping();
  // Optional easter-egg pre-load hook (Phase 2c will define this)
  if (typeof loadEasterEggs === 'function') loadEasterEggs();
  // Update the status banner (it now replaces the old #goal-text element)
  if (typeof updateStatusBanner === 'function') updateStatusBanner();
  setGoal(0);

  renderSidebar(episode.activeChars, scores);

  // Show relationship memory notice if characters have history
  if (carried.length > 0 && episode.id > 1) {
    setTimeout(() => {
      const names = carried.map(c => CHARACTERS[c.charId].name);
      const avg = carried.reduce((s,c) => s + c.score, 0) / carried.length;
      const tone = avg >= 60 ? 'זוכרים את הפרקים הקודמים 💚' : avg >= 45 ? 'זוכרים אותך מהפרק הקודם' : 'עדיין זוכרים... 🫤';
      addSystemMsg(`${names.slice(0,3).join(', ')} ${tone}`);
    }, 400);
  }

  runBeat(episode.beats[0].id);
}

// ── Episode start (from episode select cards) ─────────────────────
function startEpisode(id) {
  GameAudio.beep(660, 0.1);
  const episode = EPISODES.find(e => e.id === id);
  if (!episode) return;
  if (!GameState.isUnlocked(id)) return;

  const intro = document.getElementById('intro-screen');
  intro.classList.add('hidden');
  setTimeout(() => { intro.style.display = 'none'; }, 600);

  document.getElementById('main').style.display = 'flex';
  loadEpisode(episode);
}

// ── Go to next episode ────────────────────────────────────────────
function nextEpisode() {
  if (!currentEpisode) return;
  const nextId = currentEpisode.id + 1;
  const nextEp = EPISODES.find(e => e.id === nextId);
  if (!nextEp || !GameState.isUnlocked(nextId)) return;
  document.getElementById('end-screen').classList.remove('on');
  document.getElementById('main').style.display = 'flex';
  loadEpisode(nextEp);
}

// ── Replay current episode ────────────────────────────────────────
function replayEpisode() {
  document.getElementById('end-screen').classList.remove('on');
  if (currentEpisode) loadEpisode(currentEpisode);
}

// ── Go back to retro intro ────────────────────────────────────────
function goBackToIntro() {
  document.getElementById('main').style.display = 'none';
  const ri = document.getElementById('retro-intro');
  ri.style.display = 'flex';
  ri.style.opacity = '1';
  const menu  = ri.querySelector('.ri-menu');
  const press = ri.querySelector('.ri-press');
  if (menu)  menu.classList.add('visible');
  if (press) press.style.display = 'none';
  GameAudio.stopMusic();
  GameAudio.startMusic();
  document.getElementById('ri-music-btn').textContent = '♫ מוזיקה: ON';
}
