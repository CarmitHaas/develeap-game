"use strict";

// ─── GAME UI (Slack-themed) ──────────────────────────────────────
// Provides the same function signatures the engine in engine.js expects.
// Only the rendering changes (Slack-style messages, no chat bubbles).

// ── Time simulation ──────────────────────────────────────────────
let msgTime = { h: 17, m: 23 };

function tick() {
  msgTime.m += Math.floor(Math.random() * 2) + 1;
  if (msgTime.m >= 60) { msgTime.m -= 60; msgTime.h++; }
  return String(msgTime.h).padStart(2,'0') + ':' + String(msgTime.m).padStart(2,'0');
}

// ── Meter helpers ────────────────────────────────────────────────
function meterColor(s) {
  return s >= 70 ? '#2eb67d' : s >= 40 ? '#ecb22e' : '#e01e5a';
}
function vibeText(s) {
  if (s >= 85) return 'will write a thank-you note';
  if (s >= 70) return 'on your side';
  if (s >= 50) return 'neutral, professional';
  if (s >= 35) return 'side-eyeing you';
  if (s >= 20) return 'cold-emailing your manager';
  return 'plotting against you';
}

// ── Notification toast ───────────────────────────────────────────
let _notifTimer = null;
function notify(text) {
  const el = document.getElementById('notif');
  el.textContent = text;
  el.classList.add('show');
  if (_notifTimer) clearTimeout(_notifTimer);
  _notifTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

// ── Typing indicator ─────────────────────────────────────────────
function showTyping(name) {
  document.getElementById('typing-name').textContent = name + ' is typing…';
  document.getElementById('typing-area').classList.add('on');
  document.getElementById('chat-messages').scrollTop = 9999;
}
function hideTyping() {
  document.getElementById('typing-area').classList.remove('on');
}

// ── Avatar rendering: image (if present) or colored letter square ──
// CHARACTERS may have an `image` field pointing to a PNG portrait.
// If the image fails to load, we fall back to the colored letter avatar.
function _avatarHtml(c, klass, extraStyle) {
  if (!c) return '';
  const klassFull = klass + (c.image ? ' has-image' : '');
  if (c.image) {
    const onerr = `this.parentElement.classList.remove('has-image');this.parentElement.style.background='${c.color}';this.parentElement.textContent=${JSON.stringify(c.avatar || '')};`;
    return `<div class="${klassFull}"${extraStyle ? ' style="' + extraStyle + '"' : ''}><img src="${c.image}" alt="${c.name}" onerror="${onerr}"></div>`;
  }
  const style = `background:${c.color}` + (extraStyle ? ';' + extraStyle : '');
  return `<div class="${klassFull}" style="${style}">${c.avatar || ''}</div>`;
}

// ── Chat messages (Slack vertical list, no bubbles) ──────────────
// Per-channel tracking for "first message in a sender group" (so consecutive
// messages from the same person collapse the avatar/name header)
const _lastSenderByChannel = {};

function _getOrCreatePane(channelId) {
  let pane = document.querySelector(`.msg-pane[data-channel="${channelId}"]`);
  if (!pane && typeof createPane === 'function') {
    pane = createPane(channelId);
    // If this is the currently-active channel, the new pane needs to be visible.
    if (pane && typeof getActiveChannel === 'function' && getActiveChannel() === channelId) {
      // Make sure no other pane is active (shouldn't be, but defensive)
      document.querySelectorAll('.msg-pane.active').forEach(p => p.classList.remove('active'));
      pane.classList.add('active');
    }
  }
  return pane;
}

function addMsg(opts) {
  const c = (opts.charId && CHARACTERS[opts.charId]) ? CHARACTERS[opts.charId] : null;
  const isPlayer = !!opts.isPlayer;
  const isEmoji  = !!opts.isEmoji;
  const t = tick();

  // Player messages get treated as the player character
  const sender = isPlayer ? CHARACTERS.player : c;
  if (!sender) return;

  // Resolve channel: explicit > active fallback
  const channelId = opts.channel || (typeof getActiveChannel === 'function' ? getActiveChannel() : 'fastship_prod');
  const pane = _getOrCreatePane(channelId);
  if (!pane) return;

  // Slack-style: group consecutive messages from same sender within the same channel
  const senderId = isPlayer ? 'player' : opts.charId;
  const lastSender = _lastSenderByChannel[channelId];
  const isFirstInGroup = senderId !== lastSender;
  _lastSenderByChannel[channelId] = senderId;

  const wrap = document.createElement('div');
  wrap.className = 'msg-wrap' + (isPlayer ? ' player' : '') + (isFirstInGroup ? ' first-in-group' : '');
  wrap.dir = 'auto';

  if (isFirstInGroup) {
    wrap.innerHTML = `
      ${_avatarHtml(sender, 'msg-avatar')}
      <div class="msg-body">
        <div class="msg-head">
          <span class="msg-name">${sender.name}</span>
          <span class="msg-time">${t}</span>
        </div>
        <div class="msg-text${isEmoji ? ' emoji-msg' : ''}" dir="auto">${opts.text}</div>
        ${opts.reactions ? renderReactions(opts.reactions) : ''}
      </div>
    `;
  } else {
    // Subsequent message in same group: spacer where avatar would be
    wrap.innerHTML = `
      <div class="msg-avatar spacer"></div>
      <div class="msg-body">
        <div class="msg-text${isEmoji ? ' emoji-msg' : ''}" dir="auto">${opts.text}</div>
        ${opts.reactions ? renderReactions(opts.reactions) : ''}
      </div>
    `;
  }

  pane.appendChild(wrap);

  // If this pane is currently active, scroll to bottom. If not, mark unread.
  const isActive = (typeof getActiveChannel === 'function') && (getActiveChannel() === channelId);
  if (isActive) {
    pane.scrollTop = pane.scrollHeight;
  } else if (typeof bumpUnread === 'function') {
    bumpUnread(channelId);
  }

  // Notification sound for incoming messages.
  // Skip the sound if the player is already viewing the channel (matches real Slack).
  if (!isPlayer && !isActive) GameAudio.waNotif();
  else if (!isPlayer && isActive) GameAudio.waNotif();   // still play; comment if you want true Slack behavior

  // Tick the status banner countdown after each message (game time advanced)
  updateStatusBanner();
}

function renderReactions(rxns) {
  if (!rxns || !rxns.length) return '';
  const items = rxns.map(r => `<span class="msg-reaction">${r.emoji} ${r.count}</span>`).join('');
  return `<div class="msg-reactions">${items}</div>`;
}

function addSystemMsg(text, channelId) {
  const ch = channelId || (typeof getActiveChannel === 'function' ? getActiveChannel() : 'fastship_prod');
  const pane = _getOrCreatePane(ch);
  if (!pane) return;
  const div = document.createElement('div');
  div.className = 'system-msg';
  div.textContent = text;
  pane.appendChild(div);
  if ((typeof getActiveChannel === 'function') && getActiveChannel() === ch) {
    pane.scrollTop = pane.scrollHeight;
  }
  _lastSenderByChannel[ch] = null; // reset grouping after a divider
}

// ── Right rail: People involved ──
// Each NPC is shown as a compact row with their sentiment as a single
// Slack-reaction emoji. The .nb-card class is what flashCard() animates.
function sentimentEmoji(s) {
  if (s >= 85) return '❤️';
  if (s >= 65) return '🙂';
  if (s >= 45) return '🤷';
  if (s >= 25) return '👀';
  return '💢';
}

function renderSidebar(activeChars, scores) {
  const list = document.getElementById('nb-list');
  if (!list) return;
  if (!activeChars || !activeChars.length) { list.innerHTML = ''; return; }
  list.innerHTML = activeChars.map(id => {
    const c = CHARACTERS[id];
    if (!c) return '';
    const s = scores[id] !== undefined ? scores[id] : 50;
    return `
      <div class="nb-card" id="nb-${id}" title="${c.name} · ${c.role || ''} · trust ${Math.round(s)}">
        <div class="nb-header">
          ${_avatarHtml(c, 'nb-avatar')}
          <div class="nb-name">${c.name}</div>
          <div class="nb-role">${c.role || ''}</div>
          <div class="nb-sentiment">${sentimentEmoji(s)}</div>
        </div>
      </div>
    `;
  }).join('');
}

// Sync the right-rail "Status" pill with the top banner stage.
// Called from updateStatusBanner.
function syncRailStatus(stage, label) {
  const pill = document.querySelector('.rail-status');
  if (!pill) return;
  pill.classList.remove('sb-investigating', 'sb-mitigating', 'sb-resolved');
  pill.classList.add('sb-' + stage);
  const lbl = pill.querySelector('.rail-status-label');
  if (lbl) lbl.textContent = label;
}

function flashCard(id, positive) {
  const el = document.getElementById('nb-' + id);
  if (!el) return;
  el.classList.remove('pos-flash', 'neg-flash');
  void el.offsetWidth;
  el.classList.add(positive ? 'pos-flash' : 'neg-flash');
  setTimeout(() => el.classList.remove('pos-flash', 'neg-flash'), 800);
}

// ── Status banner ──
// Reflects: incident stage (Investigating/Mitigating/Resolved), countdown
// to demo (17:30), and severity. Stage is derived from goalPct in the engine.
function setGoalBar() {
  // Backward-compat shim. Engine still calls setGoalBar; we re-render the banner.
  updateStatusBanner();
}

function updateStatusBanner() {
  const banner = document.getElementById('status-banner');
  if (!banner) return;
  // Stage based on goalPct (0-100)
  const pct = (typeof goalPct === 'number') ? goalPct : 0;
  let stage, label;
  if (pct < 30)      { stage = 'investigating'; label = 'Investigating'; }
  else if (pct < 75) { stage = 'mitigating';    label = 'Mitigating';    }
  else               { stage = 'resolved';      label = 'Resolved';      }
  banner.classList.remove('sb-investigating', 'sb-mitigating', 'sb-resolved');
  banner.classList.add('sb-' + stage);
  const txt = banner.querySelector('.sb-status-text');
  if (txt) txt.textContent = label;

  // Mirror the stage to the right-rail status pill so the two stay in sync
  syncRailStatus(stage, label);

  // Countdown to 17:30 (the customer demo). Game time advances via tick().
  const targetMin  = 17 * 60 + 30;
  const currentMin = (typeof msgTime !== 'undefined') ? (msgTime.h * 60 + msgTime.m) : targetMin;
  const diff = targetMin - currentMin;
  // Countdown to the demo. Two distinct labels:
  //   - upcoming: "Demo in 6m"  (the existing template wraps with "Demo in")
  //   - overrun:  "+6m late"     (we replace the prefix below)
  const tEl = document.getElementById('sb-time');
  if (tEl) {
    if (diff > 0) {
      tEl.textContent = diff + 'm';
      tEl.parentElement.firstChild.nodeValue = 'Demo in ';
    } else if (diff === 0) {
      tEl.textContent = 'NOW';
      tEl.parentElement.firstChild.nodeValue = 'Demo ';
    } else {
      tEl.textContent = (-diff) + 'm late';
      tEl.parentElement.firstChild.nodeValue = 'Demo +';
    }
  }
}

// ── Choices ──────────────────────────────────────────────────────
// Two-stage UI:
//   1. After the beat's messages settle, a "Ready" gate appears so the
//      player can read everything (including across other channels) before
//      committing to a choice.
//   2. Click "Ready" → the actual choices reveal.
const CHOICE_LETTERS = ['A', 'B', 'C', 'D'];

function renderChoices(choices) {
  // Stage 1: Ready gate
  const area  = document.getElementById('choice-area');
  const list  = document.getElementById('choices-list');
  const hint  = document.getElementById('choice-hint');
  const ready = _readyGateHtml();

  if (hint) hint.textContent = 'Take your time. Read what landed.';
  list.innerHTML = ready;
  window._pendingChoices = choices;
  area.classList.add('on');

  _scrollActivePaneToBottom();
}

function revealChoices() {
  const choices = window._pendingChoices;
  if (!choices) return;
  const list = document.getElementById('choices-list');
  const hint = document.getElementById('choice-hint');
  if (hint) hint.textContent = 'Your turn. Pick a response:';
  list.innerHTML = choices.map((c, i) => {
    const hasLabel = !!c.label;
    const hasText  = !!c.text;
    const labelHtml = hasLabel
      ? `<div class="choice-label">${c.label}</div>` : '';
    const textHtml = hasText
      ? `<div class="choice-bubble" dir="auto">${c.text}</div>` : '';
    return `
      <button class="choice-btn${hasLabel ? ' with-label' : ''}" onclick="makeChoice(${i})">
        <span class="choice-letter">${CHOICE_LETTERS[i]}</span>
        <div class="choice-body">
          ${labelHtml}
          ${textHtml}
        </div>
      </button>
    `;
  }).join('');
  _scrollActivePaneToBottom();
}

function _readyGateHtml() {
  // Count messages in non-active channels so we can hint at unread context.
  let otherCount = 0;
  if (typeof getActiveChannel === 'function' && typeof unread !== 'undefined') {
    const active = getActiveChannel();
    Object.entries(unread).forEach(([ch, n]) => {
      if (ch !== active && n > 0) otherCount += n;
    });
  }
  const hintHtml = otherCount > 0
    ? `<div class="ready-gate-hint">💡 ${otherCount} message${otherCount === 1 ? '' : 's'} in other channels. Click to check before responding.</div>`
    : '';
  return `
    <button class="ready-gate-btn" onclick="revealChoices()">
      <span class="rg-check">✓</span>
      <span class="rg-text">I've read everything. Show my options →</span>
    </button>
    ${hintHtml}
  `;
}

function _scrollActivePaneToBottom() {
  // The compose area grows when choices show (yellow panel), so re-anchor
  // the active channel pane to the bottom.
  requestAnimationFrame(() => {
    const pane = document.querySelector('.msg-pane.active');
    if (pane) pane.scrollTop = pane.scrollHeight;
  });
}
function hideChoices() {
  document.getElementById('choice-area').classList.remove('on');
  document.getElementById('choices-list').innerHTML = '';
  window._pendingChoices = null;
}

// ── End screen: LinkedIn-style recap post ──
// The player's "post" appears with the ending headline + sub. NPC reactions
// drive the comments, the engagement count, and the hashtags. The ending key
// (passed by the engine) controls which tone the NPCs adopt — a true ending's
// celebration shouldn't appear under a colossal-failure post.
function showEnd(endingData, activeChars, scores, endingKey) {
  const head = document.getElementById('end-headline');
  const sub  = document.getElementById('end-sub');
  const tags = document.getElementById('li-hashtags');
  if (head) { head.textContent = endingData.headline; head.dir = 'auto'; }
  if (sub)  { sub.textContent  = endingData.sub;      sub.dir  = 'auto'; }
  if (tags && endingData.hashtags) tags.textContent  = endingData.hashtags;
  document.getElementById('badge-icon').textContent  = endingData.badgeIcon || '🏆';
  document.getElementById('badge-label').textContent = endingData.badgeLabel || '';

  // Ending illustration: shown above the LinkedIn post when the ending has an image.
  const illoWrap = document.getElementById('end-illustration');
  const illoImg  = document.getElementById('end-illustration-img');
  if (illoWrap && illoImg) {
    if (endingData.image) {
      illoImg.src = endingData.image;
      illoImg.alt = endingData.badgeLabel || '';
      illoWrap.style.display = 'block';
    } else {
      illoWrap.style.display = 'none';
      illoImg.removeAttribute('src');
    }
  }

  // Engagement count: scaled by ending tone. Bad/colossal endings get cool
  // engagement; absurd gets buzz; true gets the most.
  const avgScore = activeChars.reduce((sum, id) => sum + (scores[id] || 50), 0) / Math.max(1, activeChars.length);
  let reactionCount;
  switch (endingKey) {
    case 'true_ending':     reactionCount = 380 + Math.round(avgScore * 1.2); break;
    case 'absurd_ending':   reactionCount = 220 + Math.round(avgScore * 1.0); break;
    case 'ok_ending':       reactionCount = 90  + Math.round(avgScore * 0.5); break;
    case 'bad_ending':      reactionCount = 18  + Math.round(avgScore * 0.2); break;
    case 'colossal_ending': reactionCount = 4   + Math.round(avgScore * 0.05); break;
    default:                reactionCount = Math.round(8 + Math.pow(avgScore / 100, 2.2) * 480);
  }
  const reactCountEl = document.getElementById('li-react-count');
  if (reactCountEl) reactCountEl.textContent = reactionCount + ' reactions';

  // NPC comments: text picked by ending + score. Comments ordered by score
  // descending so cheerleaders go first (or by ending order for the bad ones).
  const sorted = activeChars
    .map(id => ({ id, score: scores[id] || 50 }))
    .sort((a, b) => b.score - a.score);

  const commentsEl = document.getElementById('li-comments');
  if (commentsEl) {
    const html = sorted.map(({ id, score }) => {
      const c = CHARACTERS[id];
      if (!c) return '';
      const text = npcEndComment(id, score, endingKey);
      if (!text) return '';
      return `
        <div class="li-comment">
          ${_avatarHtml(c, 'li-comment-avatar')}
          <div class="li-comment-body">
            <div class="li-comment-name">${c.name} <span class="li-comment-role">· ${c.role || ''}</span></div>
            <div class="li-comment-text" dir="auto">${text}</div>
            <div class="li-comment-actions">Like · Reply</div>
          </div>
        </div>
      `;
    }).join('');
    commentsEl.innerHTML = html;
  }
  const ccEl = document.getElementById('li-comment-count');
  if (ccEl) ccEl.textContent = sorted.length;

  // Submit block: shown on every ending. True ending = code reveal + form.
  // Others = "share which ending you got + notes" form invite (no code).
  const revealArea = document.getElementById('reveal-area');
  if (typeof renderReveal === 'function') {
    revealArea.innerHTML = renderReveal(endingKey, !!endingData.revealsCode);
    revealArea.style.display = 'block';
  } else {
    revealArea.innerHTML = '';
    revealArea.style.display = 'none';
  }

  document.getElementById('end-screen').classList.add('on');
  GameAudio.beep(660, 0.3);
}

// Pick an in-character end-screen comment per NPC.
// Two layers:
//   1. ending-specific override (colossal / absurd) — same line for everyone in
//      that ending bucket regardless of score. Keeps the tone coherent.
//   2. score-based tier (high/mid/low) — used for true / ok / bad endings.
//      `bad_ending` forces low tier for everyone.
function npcEndComment(charId, score, endingKey) {
  const lines = {
    aviv: {
      high: "Strong work today. Linked the postmortem in <span style='color:#0a66c2'>#fastship-prod</span>. Let's debrief Tuesday 14:30. 📎",
      mid:  "Logged the incident timeline. Adding a section to the runbook on env-var precedence (page 23 onward).",
      low:  "I have feedback. DMing you. Also, please review the runbook before next week.",
      colossal: "ה-runbook נכתב מחדש. סעיף 1: 'אל'. אני אשלח עד מחר. אני מקווה שיש מחר.",
      absurd:   "Brian ביקש runbook משלו. אני... מתרגש? יש לו הערות מעולות על מבנה."
    },
    avi: {
      high: "Proud of how the team handled it. Noted for the next leadership sync.",
      mid:  "Thanks for keeping me looped in. Let's debrief Sunday 09:00.",
      low:  "We need to talk Sunday. Bring the timeline and the choices made.",
      colossal: "אני יושב עם ה-board ביום ראשון בבוקר. אני אוהב את הצוות הזה. זה לא היום הכי כיף שלנו.",
      absurd:   "אז Brian הוא ה-CTO החדש שלנו. OK. אני לוקח חודש חופש בלי תאריך חזרה."
    },
    maya: {
      high: "אנחנו !! צוות !! 🔥🔥🔥 גאה בכולם. אני יוצאת לסופ\"ש.",
      mid:  "בקושי. אני צריכה איזה קפה. או 4.",
      low:  "אני בעצם הולכת לעדכן את הLinkedIn שלי. תודה.",
      colossal: "אני שולחת את קורות החיים ל-Google בכנות. גם בינגו צריך לחשוב על זה.",
      absurd:   "Brian!!! אני אוהבת את Brian!!! הוא יותר מאורגן מ-Aviv!!!"
    },
    segev: {
      high: "🚀🚀🚀",
      mid:  "👀",
      low:  "💀",
      colossal: "💀💀💀",
      absurd:   "🤖🦴"
    },
    inbar: {
      high: "תודה ענקית על התמיכה היום 🙏 למדתי המון. אני אכתוב סיכום אישי מה לקחתי מזה.",
      mid:  "סליחה על הבלגן. אני אקפיד יותר על env vars.",
      low:  "אני מצטערת. כנראה היה עדיף בלעדיי היום.",
      colossal: "אני... הגשתי הודעת התפטרות. סליחה. תודה על השנה.",
      absurd:   "אני לא בטוחה אם להוסיף ל-LinkedIn שעבדתי עם Brian. זה נחשב כ-work experience?"
    },
    keren: {
      high: "It was a pleasure working with the Develeap team today. Will note this for our QBR. 👏",
      mid:  "Thank you for the professional handling. Following up via email about timelines.",
      low:  "Following up via my account manager. We'll need a written report by EOW.",
      colossal: "I'm escalating this internally. Our compliance team will be in touch by Sunday.",
      absurd:   "Brian and I had a quick sync. He's actually pretty reasonable. Sending the new contract Monday."
    },
    bingo: {
      high: "🦴🦴🦴",
      mid:  "🦴",
      low:  "👀",
      colossal: "🐾...",
      absurd:   "🦴🤖🦴"
    }
  };
  const lineSet = lines[charId];
  if (!lineSet) return '';

  // Ending-specific overrides take priority
  if (endingKey === 'colossal_ending' && lineSet.colossal) return lineSet.colossal;
  if (endingKey === 'absurd_ending'   && lineSet.absurd)   return lineSet.absurd;
  // Bad ending forces low tier regardless of score
  if (endingKey === 'bad_ending') return lineSet.low || '';

  const tier = score >= 80 ? 'high' : score >= 50 ? 'mid' : 'low';
  return lineSet[tier] || '';
}

// Allow the player to dismiss the end-screen modal so they can browse channels
// (#momentsofmagic, #random, etc.) before exiting. A floating pill brings the
// modal back. Implementation: toggle the .on class on #end-screen and show pill.
function browseSlackAfterEnd() {
  const end = document.getElementById('end-screen');
  const pill = document.getElementById('reopen-end-pill');
  if (end) end.classList.remove('on');
  if (pill) pill.style.display = 'block';
}

function reopenEndScreen() {
  const end = document.getElementById('end-screen');
  const pill = document.getElementById('reopen-end-pill');
  if (end) end.classList.add('on');
  if (pill) pill.style.display = 'none';
}

// Single-episode game: no episode select grid. Engine's nextEpisode/replay still work.
function buildEpisodeCards() { /* no-op; only one episode */ }
function showEpisodeSelect() {
  // Replay button hands back to here. We just restart the episode.
  document.getElementById('end-screen').classList.remove('on');
  document.getElementById('main').style.display = 'none';
  document.getElementById('intro-screen').style.display = 'flex';
  document.getElementById('intro-screen').classList.remove('hidden');
}
function dismissComplete() { showEpisodeSelect(); }
