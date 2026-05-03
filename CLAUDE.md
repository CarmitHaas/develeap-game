# Develeap Slack-Themed Mini-Game

A browser-based branching narrative game styled as a fake Develeap Slack workspace. Embedded as iframe in WordPress for a one-time engagement event in an upcoming newsletter edition.

## Run locally

```bash
cd /home/develeap/Education/newsletter/game
python3 -m http.server 8765
# open http://localhost:8765/
```

Pure vanilla JS. No build step. Headless smoke tests via Playwright (already installed at `~/.local/bin/playwright`).

## File layout

```
game/
├── index.html              Slack UI shell + desktop frame (laptop bezel + browser tabs background + dock)
├── characters.js           CHARACTERS object (NPC + player)
├── episodes/
│   └── episode-1.js        EPISODE_1 with all beats
├── css/slack.css           single CSS file, all styling
├── ping.mp3                Slack notification sound (32KB, 128kbps stereo)
├── js/
│   ├── state.js            localStorage persistence, key 'develeap_game_v1'
│   ├── audio.js            Plays ping.mp3 on each new message; also has retro intro music
│   ├── channels.js         CHANNELS registry, switchToChannel, unread tracking, channel header rendering
│   ├── ui.js               renders messages, sidebar, choices, status banner, end screen
│   ├── engine.js           beat-graph runner: qMsg, qSwitchChannel, makeChoice, runBeat, loadEpisode
│   ├── easter-eggs.js      preloaded #momentsofmagic celebration content
│   └── reveal.js           true-ending code reveal + Google Form prefill link
├── PLAN.md                 full implementation plan
├── scenario.md             beat-by-beat outline (single source of truth for content)
├── npc-bible.md            NPC voices, sample lines, running gags
├── decisions.md            locked decisions
└── README.md               public-facing readme
```

## Engine contract

### Episode shape

```js
EPISODE_1 = {
  id: 1,
  title, emoji, subtitle, goal,
  startTime: { h: 17, m: 23 },        // game-clock start
  activeChars: ["aviv", ...],         // NPCs shown in right rail
  initialScores: { aviv: 50, ... },
  dateLabel: "Today, Thursday",
  beats: [...],
  endings: { true_ending: { headline, sub, badgeIcon, badgeLabel, goalScore, revealsCode }, ... }
}
```

### Beat shape

```js
{
  id: "beat_1",
  channel: "fastship_prod",            // optional. Auto-switches view to here when beat starts.
  messages: [
    { from, channel, text, typingMs, isEmoji }, ...
  ],
  branchMessages: {                    // alternative to `messages`. Keyed by path value.
    lead:        [...],
    maya_first:  [...],
    blame:       [...],
    default:     [...]                 // fallback
  },
  branchOnPath: "maya_path",           // optional. Which path key to look up. Defaults to "default".
  choices: [...],                      // see below
  ending: "true_ending",               // exclusive with choices/autoNext
  endingFn: ({ paths, scores, goalPct, currentPath }) => "true_ending",  // alternative to ending
  autoNext: "beat_x"                   // silent advance to next beat
}
```

A beat can mix branchMessages with choices (the engine falls through). Auto-switch fires at beat start to `beat.channel` (or first message's channel) if different from current active channel.

### Choice shape

```js
{
  label: "Take charge in the customer channel",   // approach name (English heading on the button)
  text:  "On it Keren. Inbar is with me. ...",    // the actual message that gets posted to chat
  channel: "fastship_prod",                       // where the message lands
  effects: { aviv: +5, maya: -3, ... },           // per-character score deltas (-100..+100)
  goalDelta: 25,                                   // 0..100 progress shift
  next: "beat_2",                                  // ID of next beat
  path: "lead",                                    // value that propagates into next beat's branchMessages
  pathKey: "maya_path"                             // optional. Stores under paths[pathKey]. Defaults to "default".
}
```

Choices without `text` are silent (no posted message — engine renders a system note instead).

### Multi-axis paths

The engine tracks an object `paths` (keyed by `pathKey`) so multiple branching axes can coexist. Beat 3's choice can set `pathKey: "maya_path"`; beat 8's `branchOnPath: "maya_path"` then keys on it without being clobbered by intermediate choices. The legacy `currentPath` (string) is still set to the most recent value for backward compatibility.

Reset on every `loadEpisode`.

### Channels

Defined in `js/channels.js` `CHANNELS` registry:

| ID                | Name              | Kind    | Notes                                   |
|-------------------|-------------------|---------|-----------------------------------------|
| `fastship_prod`   | fastship-prod     | channel | shared with customer. **English-only.** |
| `general`         | general           | channel | Develeap internal                       |
| `bingo`           | bingo             | channel | dog channel                             |
| `momentsofmagic`  | momentsofmagic    | channel | easter-egg, preloaded                   |
| `bootcamps_dept`  | bootcamps_dept    | channel | decorative                              |
| `ai_bootcamp_aws` | ai-bootcamp-aws   | channel | decorative                              |
| `random`          | random            | channel | decorative                              |
| `dm_aviv`         | Aviv              | dm      |                                         |
| `dm_maya`         | Maya              | dm      |                                         |
| `dm_inbar`        | Inbar             | dm      |                                         |
| `dm_bingo`        | Bingo             | dm      |                                         |

Each message and each choice declares its `channel`. The engine auto-switches the player's view to the channel where each beat begins, then waits 1.5s after a player choice before auto-switching to the next beat (so the player sees their message land).

## Voice rules (apply everywhere written content goes)

- **No em-dashes anywhere.** Hyphens or sentence breaks instead.
- **Gender-neutral player phrasing.** No "אני מנהל" / "אני סומך". Use plural/impersonal forms (`בודקים`, `נחזור`, `אני על זה`).
- First person and plain declarative. No "robust / leverage / delve / comprehensive / in conclusion".
- Hebrew, when used in copy that addresses the player, takes feminine forms (את, כתבי, בחרי). NPC dialogue uses whatever fits the character.
- **`fastship_prod` channel is English-only** (it is shared with the customer). Other channels are Hebrew/English mix per character voice.
- **No external-game references** in code, comments, or docs. The game stands on its own.

## NPC roster

| NPC      | Channel home    | Voice                                                   |
|----------|-----------------|---------------------------------------------------------|
| **Aviv** | general, DMs    | Over-documents. Sends 14-page Notion docs, cites pages. |
| **Maya** | general, DMs    | ALL CAPS Hebrew, exclamation marks, loud but loyal.     |
| **Segev**| general         | Emoji-only (`🔥 / 💀 / 🚀 / 👀`). Never types words.    |
| **Inbar**| dm_inbar        | Junior, anxious, technically right, doesn't trust herself. |
| **Keren**| fastship_prod   | Customer PM. English. Polite-aggressive Karen-coded.    |
| **Bingo**| bingo           | Office dog. `🦴 / 🐾 / ווף ווף`. Posts at chaotic times.|

Full bios and sample lines: `npc-bible.md`.

## Scenario summary

"The Demo is in 90 Minutes" — Thursday 17:23. A Develeap junior consultant (Inbar) just broke FastShip's payments service. CEO demo at 17:30. Player is a senior consultant who has to fix prod without burning the customer relationship. ~11 beats, 5 endings. Full beat-by-beat in `scenario.md`.

True-ending path:
1. Beat 1 → A (`lead`) — take charge in customer channel
2. Beat 3 → A (`redirect_maya`, pathKey `maya_path`) — give Maya something useful
3. Beat 5 → C (`mentor_inbar`) — Inbar fixes, you walk the diff
4. Beat 9 → A (`pair_review`) — review the diff together, then she deploys
5. Beat 11 → A (`praise_inbar`) — publicly credit her

## Verification

Smoke test pattern (browser-level):

```python
import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await (await browser.new_context()).new_page()
        await page.goto("http://localhost:8765/", wait_until="networkidle")
        await page.click(".intro-start-btn")
        await page.wait_for_selector(".ready-gate-btn", timeout=20000)
        # ... etc
```

Per-feature acceptance checks live in `scenario.md` (Verification section in `PLAN.md`).

## Memory location

Project memory lives outside this directory at:
`/home/develeap/.claude/projects/-home-develeap-Education-newsletter/memory/`

Index in `MEMORY.md`. Files of note:
- `user_role.md` — Carmit's role at Develeap, GitHub, related repos
- `feedback_voice.md` — voice rules (no em-dashes, etc)
- `project_slack_minigame.md` — project context
- `reference_devops_connections.md` — Apps Script + Sheets pattern from prior newsletter game

## Status (as of 2026-05-01)

Phases done: 1 scaffold, 2 Slack reskin, 2a polish, 2b multi-channel, 2c easter egg, 2d UI redesign (status banner / incident rail / LinkedIn end screen), 2e voice + scrub.

Pending:
- **Phase 3**: encode beats 4-11 from `scenario.md` into `episodes/episode-1.js` with channel routing.
- **Phase 4**: Google Form. Build form, paste prefill URL into `js/reveal.js` (look for `FORM_PREFILL_URL_TEMPLATE`).
- **Phase 5**: deploy to GitHub Pages, embed iframe in WordPress.
