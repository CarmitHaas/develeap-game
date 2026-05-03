"use strict";

// ─── GAME STATE ─────────────────────────────────────────────────
// Persists relationship scores and completed episodes across sessions
const GameState = (() => {
  const KEY = 'develeap_game_v1';

  function _load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e) { return {}; }
  }

  let _d = _load();
  if (!_d.completed) _d.completed = [];
  if (!_d.rels)      _d.rels      = {};
  if (!_d.badges)    _d.badges    = {};

  function _save() {
    try { localStorage.setItem(KEY, JSON.stringify(_d)); } catch(e) {}
  }

  return {
    // Episode unlock/completion
    isUnlocked:  (id) => id === 1 || _d.completed.includes(id - 1),
    isCompleted: (id) => _d.completed.includes(id),
    getBadge:    (id) => _d.badges[id],

    // Relationship memory
    hasHistory:     (charId) => charId in _d.rels,
    getCarried:     (charId) => _d.rels[charId],

    // Blend: 60% carried-over score + 40% episode default → continuity without dominating
    getStartingScore(charId, fallback) {
      return charId in _d.rels
        ? Math.round(_d.rels[charId] * 0.6 + fallback * 0.4)
        : fallback;
    },

    completeEpisode(id, finalScores, badge) {
      if (!_d.completed.includes(id)) _d.completed.push(id);
      Object.assign(_d.rels, finalScores);
      if (badge) _d.badges[id] = badge;
      _save();
    },

    reset() {
      _d = { completed: [], rels: {}, badges: {} };
      _save();
    }
  };
})();
