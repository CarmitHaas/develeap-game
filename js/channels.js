"use strict";

// ─── CHANNELS ────────────────────────────────────────────────────
// Registry of fake Develeap Slack channels and DMs.
// Keeps active-channel state, unread counts, and the click-to-switch logic.

const CHANNELS = {
  fastship_prod: {
    id: "fastship_prod",
    name: "fastship-prod",
    kind: "channel",
    external: true,         // shared with the customer
    members: 6,
    purpose: "Develeap ↔ FastShip live ops"
  },
  general: {
    id: "general",
    name: "general",
    kind: "channel",
    members: 14,
    purpose: "Develeap internal"
  },
  bingo: {
    id: "bingo",
    name: "bingo",
    kind: "channel",
    members: 8,
    purpose: "🐕"
  },
  momentsofmagic: {
    id: "momentsofmagic",
    name: "momentsofmagic",
    kind: "channel",
    members: 23,
    purpose: "Celebrate the wins",
    easterEgg: true
  },
  bootcamps_dept: {
    id: "bootcamps_dept",
    name: "bootcamps_dept",
    kind: "channel",
    members: 9,
    decorative: true        // not used by story, just window dressing
  },
  works_on_my_machine: {
    id: "works_on_my_machine",
    name: "works-on-my-machine",
    kind: "channel",
    members: 14,
    decorative: true
  },
  random: {
    id: "random",
    name: "random",
    kind: "channel",
    members: 14,
    decorative: true
  },
  // Direct messages with each NPC
  dm_aviv:   { id: "dm_aviv",   name: "Aviv",   kind: "dm", with: "aviv"   },
  dm_maya:   { id: "dm_maya",   name: "Maya",   kind: "dm", with: "maya"   },
  dm_inbar:  { id: "dm_inbar",  name: "Inbar",  kind: "dm", with: "inbar"  },
  dm_yarden: { id: "dm_yarden", name: "Yarden", kind: "dm", with: "yarden" },
  dm_bingo:  { id: "dm_bingo",  name: "Bingo",  kind: "dm", with: "bingo"  }
};

// Display order in the sidebar (first list = channels, second list = DMs).
const CHANNEL_ORDER = [
  "general",
  "fastship_prod",
  "bootcamps_dept",
  "works_on_my_machine",
  "momentsofmagic",
  "bingo",
  "random"
];
const DM_ORDER = ["dm_aviv", "dm_maya", "dm_inbar", "dm_yarden", "dm_bingo"];

// ── State ────────────────────────────────────────────────────────
let activeChannel = "fastship_prod";
const unread = {};   // { channelId: count }

// ── Lookup ───────────────────────────────────────────────────────
function getChannel(id) { return CHANNELS[id] || null; }
function getActiveChannel() { return activeChannel; }
function getActiveChannelObj() { return CHANNELS[activeChannel]; }

// ── Switching ────────────────────────────────────────────────────
function switchToChannel(id, opts) {
  if (!CHANNELS[id]) return;
  if (id === activeChannel) return;
  opts = opts || {};

  // Hide the current pane
  const oldPane = document.querySelector('.msg-pane.active');
  if (oldPane) oldPane.classList.remove('active');

  // Show the target pane (create one if it doesn't yet exist)
  let newPane = document.querySelector(`.msg-pane[data-channel="${id}"]`);
  if (!newPane) newPane = createPane(id);
  newPane.classList.add('active');

  activeChannel = id;
  unread[id] = 0;

  renderChannelHeader();
  renderUnreadBadges();
  renderActiveSidebar();
  renderFakeInputPlaceholder();

  // Anchor scroll to bottom of new pane
  requestAnimationFrame(() => {
    if (newPane) newPane.scrollTop = newPane.scrollHeight;
  });
}

function createPane(channelId) {
  const wrap = document.getElementById('chat-messages');
  if (!wrap) return null;
  const pane = document.createElement('div');
  pane.className = 'msg-pane';
  pane.dataset.channel = channelId;
  // First-time visit: show a date divider (so the player has a reference point)
  pane.innerHTML = '<div class="date-divider"><span>Today</span></div>';
  wrap.appendChild(pane);
  return pane;
}

// ── Unread tracking ─────────────────────────────────────────────
function bumpUnread(channelId) {
  if (channelId === activeChannel) return;
  unread[channelId] = (unread[channelId] || 0) + 1;
  renderUnreadBadges();
}

function renderUnreadBadges() {
  document.querySelectorAll('.ch-row[data-channel]').forEach(row => {
    const id = row.dataset.channel;
    const count = unread[id] || 0;
    const badge = row.querySelector('.ch-unread-badge');
    if (count > 0) {
      row.classList.add('unread');
      if (badge) badge.textContent = count > 9 ? '9+' : String(count);
    } else {
      row.classList.remove('unread');
      if (badge) badge.textContent = '';
    }
  });
}

function renderActiveSidebar() {
  document.querySelectorAll('.ch-row[data-channel]').forEach(row => {
    row.classList.toggle('active', row.dataset.channel === activeChannel);
  });
}

// ── Channel header (top of the chat column) ─────────────────────
function renderChannelHeader() {
  const ch = CHANNELS[activeChannel];
  if (!ch) return;
  const nameEl = document.getElementById('ch-name');
  const membersEl = document.getElementById('ch-members');
  const headerWrap = document.getElementById('channel-header');
  if (!nameEl) return;

  if (ch.kind === 'dm') {
    const npc = (typeof CHARACTERS !== 'undefined') ? CHARACTERS[ch.with] : null;
    if (npc) {
      nameEl.innerHTML = `<span class="dm-avatar" style="background:${npc.color}">${npc.avatar}</span> <span class="dm-name">${npc.name}</span>`;
    } else {
      nameEl.textContent = ch.name;
    }
    if (membersEl) membersEl.textContent = '🟢 active';
    if (headerWrap) headerWrap.classList.add('is-dm');
  } else {
    nameEl.textContent = '# ' + ch.name;
    if (membersEl) membersEl.textContent = '👥 ' + (ch.members || '');
    if (headerWrap) headerWrap.classList.remove('is-dm');
  }
}

// ── Sidebar build (regenerated from CHANNEL_ORDER/DM_ORDER) ─────
function renderChannelsSidebar() {
  const sb = document.getElementById('channels-sidebar');
  if (!sb) return;
  const channelRows = CHANNEL_ORDER.map(id => renderRow(id, '#')).join('');
  const dmRows = DM_ORDER.map(id => renderRow(id, '●')).join('');
  sb.innerHTML = `
    <div class="ch-section">Channels</div>
    ${channelRows}
    <div class="ch-section" style="margin-top: 12px">Direct messages</div>
    ${dmRows}
  `;
}
function renderRow(id, prefix) {
  const ch = CHANNELS[id];
  if (!ch) return '';
  const display = ch.kind === 'dm' ? ch.name : ch.name;
  const dotIcon = ch.kind === 'dm' ? `<span class="dm-tag" style="background:${(typeof CHARACTERS !== 'undefined' && CHARACTERS[ch.with]) ? CHARACTERS[ch.with].color : '#888'}"></span>` : '<span class="ch-prefix">#</span>';
  return `
    <div class="ch-row" data-channel="${id}" onclick="switchToChannel('${id}')">
      ${dotIcon}
      <span class="ch-label">${display}</span>
      <span class="ch-unread-badge"></span>
    </div>
  `;
}

// ── Fake input placeholder ("Message #channel" or "Message Inbar") ─
function renderFakeInputPlaceholder() {
  const fi = document.getElementById('fake-input-placeholder');
  if (!fi) return;
  const ch = CHANNELS[activeChannel];
  if (!ch) return;
  fi.textContent = ch.kind === 'dm' ? 'Message ' + ch.name : 'Message #' + ch.name;
}

// ── Initial render (called once at game start) ──────────────────
function initChannels() {
  renderChannelsSidebar();
  renderActiveSidebar();
  renderChannelHeader();
  renderUnreadBadges();
  renderFakeInputPlaceholder();
}
