# Develeap Slack-Themed Mini-Game

A browser-based branching narrative game styled as a fake Develeap Slack workspace. Players read a Develeap-flavored scenario unfold across multiple Slack channels and DMs, pick from labelled choice cards at each decision point, and branch toward different endings. One ending reveals a secret code that can be submitted to a Google Form.

For the design, see [`PLAN.md`](PLAN.md), [`scenario.md`](scenario.md), and [`npc-bible.md`](npc-bible.md).

## Status

- Phases 1 and 2 done: scaffold + Slack reskin.
- Episode 1 wired up through beat 3 with a placeholder ending. Beats 4-11 still in draft (see `scenario.md`).
- Code reveal logic in place. Google Form URL not yet configured (placeholder in `js/reveal.js`).

## Run locally

```bash
cd game/
python3 -m http.server 8765
# open http://localhost:8765/
```

No build step. Pure vanilla JS.

## File layout

```
game/
├── index.html              Slack UI shell + episode registry
├── characters.js           NPC roster (Aviv, Maya, Segev, Inbar, Keren, Bingo, player)
├── episodes/
│   └── episode-1.js        "The Demo is in 90 Minutes" scenario (beats 1-3 wired, rest WIP)
├── css/
│   └── slack.css           Slack-styled CSS (aubergine sidebar, message list, right rail)
├── js/
│   ├── engine.js           Beat-graph runner: queues messages, switches channels,
│                          handles path-aware branchMessages and choice routing.
│   ├── state.js            localStorage persistence (mostly inactive in single-episode mode)
│   ├── audio.js            Web Audio SFX (notification pop, choice beep)
│   ├── ui.js               Slack-style rendering (addMsg, renderSidebar, renderChoices, etc.)
│   └── reveal.js           True-ending code reveal + Google Form prefill link
├── PLAN.md                 Full design plan
├── decisions.md            Decision log
├── npc-bible.md            Character voices and sample lines
├── scenario.md             Beat-by-beat outline with choice tables
└── README.md               This file
```

## Engine contract

The engine in `js/engine.js` calls these globals (defined in `ui.js`):

- `addMsg({ charId, text, isPlayer, isEmoji })` - render a message
- `renderSidebar(activeChars, scores)` - update right rail
- `flashCard(id, positive)` - flash a meter
- `setGoalBar(pct)`, `notify(text)` - misc
- `showTyping(name)` / `hideTyping()` - typing indicator
- `renderChoices(choices)` / `hideChoices()` - choice buttons
- `showEnd(endingData, activeChars, scores)` - final screen

Episode data shape (see `episodes/episode-1.js`):

```js
{
  id, title, emoji, subtitle, goal,
  startTime: { h: 17, m: 23 },          // game-clock start
  activeChars: ['aviv', 'maya', ...],   // shown in right rail
  initialScores: { aviv: 50, ... },
  beats: [
    {
      id: "beat_1",
      messages: [{ from, text, typingMs, isEmoji }, ...],
      choices:  [{ text, effects, goalDelta, next, path }, ...]
    },
    {
      id: "beat_2",
      branchMessages: {                 // keyed by `path` from a previous choice
        lead:        [...],
        maya_first:  [...],
        blame:       [...]
      },
      choices: [...]
    },
    {
      id: "ending_beat",
      messages: [...],
      ending: "true_ending"             // key into `endings`
    }
  ],
  endings: {
    true_ending: {
      headline, sub, badgeIcon, badgeLabel,
      goalScore: 100,
      revealsCode: true                  // shows code + form button
    },
    ...
  }
}
```

## Configuring the Google Form

Edit `js/reveal.js`:

1. To change the winner code: in your browser console run `btoa('YOUR-NEW-CODE')`, paste the result into `_CODE_B64`.
2. Build the Google Form (Code field required, Name optional, etc.).
3. In the form's three-dot menu, choose "Get pre-filled link", fill the Code field with a placeholder like `XXXX`, submit.
4. Copy the resulting URL. It will look like `https://docs.google.com/forms/d/e/FORM_ID/viewform?usp=pp_url&entry.123456=XXXX`.
5. Replace `FORM_PREFILL_URL_TEMPLATE` in `js/reveal.js`. Keep the `{CODE}` placeholder where the code value should land.

## Deploy

1. Push this directory to a GitHub repo.
2. Enable Pages on the default branch.
3. In WordPress, add a Custom HTML block with:

   ```html
   <iframe src="https://CarmitHaas.github.io/REPO_NAME/"
           style="width:100%;height:780px;border:0;border-radius:8px;"
           title="Develeap Mini-Game"></iframe>
   ```
