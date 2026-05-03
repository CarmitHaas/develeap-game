# Develeap Slack-Themed Mini-Game - Plan

## Context

You want a browser-based mini-game embedded on the Develeap WordPress site, styled as a fake **Slack workspace**. Players read a Develeap-flavored scenario unfolding as Slack messages across multiple channels and DMs, pick from labelled choices per beat, and branch toward different endings. Only one ending (the "true" ending) reveals a secret code. Players who find it can submit the code to a **Google Form** to be entered into the prize drawing. Submission is optional, so people who just want to play for fun can do that too.

Architecture: pure static HTML/CSS/JS, no backend, hosted as a static site (GitHub Pages) and iframe-embedded into a WordPress page.

## Personalization context (what I'm bringing into this)

From earlier sessions and existing project memory:

- **You** are Carmit Shaemesh Haas, DevOps engineer and lead instructor at Develeap. You teach Docker / DevOps to bootcamp students. GitHub: `CarmitHaas`. You build public teaching tools and want a portfolio.
- You have **closely related ideas already on the roadmap**: `bash-quest` (HTML5 Canvas shooter that teaches bash) and `infradventure` (choose-your-own-architecture branching game with Cost / Reliability / Security / DX / Scalability / Observability meters). This Slack mini-game shares DNA with `infradventure` and could either live as its own repo or be the lighter "social" prequel to it.
- **Voice rules** I'm applying to all written output (scenario dialogue, README, in-game text, this plan):
  - No em-dashes anywhere. Hyphens or sentence breaks instead.
  - First person and plain declarative. No "robust / leverage / delve / comprehensive / in conclusion".
  - Real specifics, not generic claims. If a number exists, say it.
  - Hebrew, when used, in feminine forms (את, כתבי, בחרי) for the player-facing copy that addresses the player. NPC dialogue can use any voice that fits the character.
- **Precedent at Develeap**: the "DevOps Connections" game already used a Google Form to collect answers. We're reusing that pattern.
- **Develeap context** visible from screenshots: Slack workspace has channels like `#general` (140 members), `#bootcamps_dept`, `#training_department`, `#ai-bootcamp-aws`, `#biz-news`, `#announcements`, `#momentsofmagic`, `#newsletter-team`, `#transition-team`, `#it`, `#support`, `#linkedin_publications`, `#today-i-learned`, `#mindspace`, `#botboys`, `#random`. Real members include Ronen Zohar (recent IT-channel post), Ben (event-driven observability article author).

If any of this is wrong or stale, flag it and I'll fix the plan.

## Decisions locked in

- **Tech**: static web game embedded as iframe into the WordPress site. Slack visuals are theming only, not real Slack integration.
- **Winner mechanic**: true ending reveals a code; player optionally submits the code via Google Form. First valid submission wins (or however you want to pick a winner from the form responses).
- **Language**: mixed Hebrew dialogue with English DevOps terms.
- **Scope**: one scenario, one-time event. ~10-12 beats, 3-5 endings, 5-10 min playtime.

## Approach

1. Build the engine: a beat-graph runner that queues messages, handles path-aware `branchMessages`, supports per-channel routing, and triggers endings.
2. Build a Slack-styled UI in `js/ui.js`, `index.html`, and CSS (channels sidebar, threads, message formatting, Block-Kit-style choice buttons).
3. Define `characters.js` with the Develeap NPC roster.
4. Define `episodes/episode-1.js` with the scenario beats and choice tree.
5. Add a code-reveal block at the true ending that includes a "Submit to claim your spot" button linking to your Google Form (with the code prefilled if possible).
6. Host as a static site on GitHub Pages and iframe-embed into a WordPress page.

## Files to create or modify

```
develeap-game/  (new repo under CarmitHaas)
├── index.html              Slack UI shell.
├── css/slack.css           Slack theming.
├── js/
│   ├── engine.js           Beat-graph runner.
│   ├── state.js            localStorage persistence.
│   ├── audio.js            Slack-style notification synth.
│   ├── channels.js         CHANNELS registry, switch logic, unread state.
│   ├── ui.js               Slack-style rendering.
│   └── reveal.js           Code reveal + Google Form link.
├── characters.js           Develeap NPC roster.
├── episodes/
│   └── episode-1.js        The scenario.
├── assets/
│   ├── avatars/            NPC avatar images (or initials).
│   └── slack-logo.svg
└── README.md
```

The engine in `js/engine.js` (beat graph, path-aware branching, scoring, endings) is the core game loop. The data schema below is what each episode file produces.

## Data model

```js
const episode = {
  id: 1,
  title: "פרויקט בסיכון: יום שישי בערב",
  channel: "#prod-down",
  participants: ["aviv", "maya", "roy", "inbar", "bingo"],
  goalLabel: "תפסל את הבאג, תרגיע את הצוות, תשמור על הקריירה",
  initialScores: { aviv: 50, maya: 50, roy: 50, inbar: 50, bingo: 50 },
  beats: [
    {
      id: "beat_1",
      messages: [
        { from: "aviv", text: "@channel הסביבה של bootcamp-23 קרסה. השיעור הבא ב-09:00.", typingMs: 1800 },
        { from: "maya", text: "מה זאת אומרת קרסה??? אני בדיוק שלחתי להם DM!!!", typingMs: 1400 },
        { from: "roy",  text: "🔥", typingMs: 600 }
      ],
      choices: [
        { text: "I'll take it. Spinning up a new env now.",                   effects: { aviv: +10, maya: +5 },  goalDelta: 25, next: "beat_2_fix",   path: "fix" },
        { text: "Let's first understand what broke. Pulling logs.",           effects: { aviv: +5,  roy: +8 },   goalDelta: 15, next: "beat_2_diag",  path: "diag" },
        { text: "@inbar אתה זוכר מה עשית אתמול בערב על הסביבה?",                effects: { inbar: -15, maya: +12 }, goalDelta: 5,  next: "beat_2_blame", path: "blame" }
      ]
    }
    // more beats. branchMessages[path] for path-aware dialogue without forking the graph.
  ],
  endings: {
    "true_ending": {
      headline: "Develeap Saved Friday Night",
      sub: "Bingo got a treat. Bootcamp continued. The microwave is still on fire but that's a Q3 problem.",
      badgeIcon: "🏆",
      badgeLabel: "DevOps Diplomat",
      goalScore: 100,
      revealsCode: true
    },
    "ok_ending": { /* good but not the secret one */ },
    "disaster_ending": { /* you broke prod and your career */ }
  }
}
```

**One added field versus the original**: `revealsCode: true` on the true ending. Reveal logic lives in `js/reveal.js`.

## Slack UI redesign

Replace the WhatsApp look with a Slack workspace look. The mockup below matches the visual you sent of the real Develeap Slack:

```
┌─────────────────────────────────────────────────────────────────┐
│ Develeap ▾                              🔍 Search       [@you]  │
├──────────┬──────────────────────────────────────────────────────┤
│ Channels │ # prod-down                                          │
│ # general│ ─────────────────────────────────────────────────── │
│ # prod-  │  aviv 11:47                                          │
│   down ●│  @channel הסביבה של bootcamp-23 קרסה. השיעור הבא ב…│
│ # random │                                                      │
│ # ai-    │  maya 11:48                                          │
│   bootcm│  מה זאת אומרת קרסה??? אני בדיוק שלחתי להם DM!!!    │
│ # bingo  │                                                      │
│          │  roy 11:48                                           │
│ DMs      │  🔥                                                  │
│ • aviv   │                                                      │
│ • bingo🐕│  ┌──────────────────────────────────────┐            │
│          │  │ Reply with…                          │            │
│          │  └──────────────────────────────────────┘            │
│          │   [I'll take it. Spinning up new env]               │
│          │   [Let's pull logs first]                            │
│          │   [@inbar what did you do last night?]               │
└──────────┴──────────────────────────────────────────────────────┘
```

Specifics for `js/ui.js`:

- Channels sidebar (left): static list of fake Develeap channels (mirror real ones for in-joke value: `#general`, `#bootcamps_dept`, `#training_department`, `#ai-bootcamp-aws`, `#momentsofmagic`, `#bingo`, plus the scenario-specific one like `#prod-down`). Active channel highlighted Slack aubergine (`#1164a3` accent on `#350d36` sidebar).
- Channel header: `# prod-down`, member count, ⭐ icon.
- Messages: avatar (32px rounded square), bold name, gray timestamp, then text on the next line. Vertical list, no chat bubbles.
- Typing indicator: `aviv is typing…` italic gray text at the bottom of the active channel.
- Reactions row under some messages (decorative): `🔥 3   👀 2   😱 1`.
- Choice buttons: rendered as Block-Kit-style outlined buttons inside a yellow "your turn" panel, visually distinct from messages.
- Right rail: incident-response panel - severity, status, started, customer, on-call, people involved (with sentiment emoji per NPC), pinned files.
- Color palette: aubergine sidebar, white message area, Lato or Inter font, `#1d1c1d` body text.
- No real Slack assets. Recreate visually with CSS and emoji to avoid trademark issues.

Pacing: enforced delays of 1400ms typing minimum, 600ms pause minimum between messages, so the drama lands.

## Develeap NPC roster (proposed, adjust freely)

Each NPC needs a strong, recognizable voice. The archetype distribution (documenter / screamer / silent emoji-only / naive newbie / Karen-coded customer / absurd) is what makes the humor work.

| NPC      | Role                                | Voice / running gag                                                |
|----------|-------------------------------------|--------------------------------------------------------------------|
| **Aviv** | Over-documented PM                  | Sends 14-page Notion docs for every decision. "ראיתם את הדף ההוא?" |
| **Maya** | Senior trainer, perpetually angry   | ALL CAPS, 3+ exclamation marks, blames everyone                    |
| **Roy**  | Senior DevOps, replies only in emoji| 🔥 / 👍 / 💀 / 🚀. Never words. Yossi-energy.                       |
| **Inbar**| Newest bootcamp grad                | Asks 100% basic questions in `#general`, accidentally helpful      |
| **Bingo**| The office dog, somehow on Slack    | Posts only 🦴 / 🐾 / barking emojis. Owns one channel: `#bingo`.   |

Swap any of these for real Develeap personas (with their consent) but keep the archetype distribution: documenter, screamer, silent one, newbie, absurd one.

## Scenario theme: pick one

All three hit the themes you mentioned (DevOps + AI + office absurdity, yogurt fridge, dog, booths, headphones).

### Option A: "Production is on fire and so is the microwave" (recommended)
Friday 11:47. The bootcamp env crashed mid-cohort. Simultaneously: someone left fish in the microwave, Bingo is barking, Inbar deleted a Terraform state file "to clean up". You navigate the fix while keeping team relationships intact. **True ending**: you fix prod, calm Maya, get Roy to actually type words for once, and earn Bingo's forgiveness with a treat.

### Option B: "The Yogurt Detective"
Maya's yogurt has been stolen for 3 weeks. She's threatened to quit. You're appointed unofficial detective. Interview suspects: Aviv, Roy, Inbar, Bingo, the cleaning crew, an AI agent that gained sentience. **True ending**: catch the culprit, surface a deeper truth about the office.

### Option C: "Booth Wars: The Reckoning"
3 booths, 12 people, double-booked at 14:00. You have a candidate interview but Maya has been "in a meeting" for 4 hours watching K-dramas. **True ending**: reclaim your booth without making enemies, and uncover that Bingo has been booking booths via Aviv's calendar.

My pick: **Option A**. Strongest opening, easiest comedic mix of DevOps + absurdity, most natural place for a true ending to feel earned.

## Code reveal and Google Form submission

The win condition is discoverable but not trivially gameable.

When the player reaches the ending with `revealsCode: true`, the ending screen renders something like:

```
🏆 You found the true ending!

Your code:  ┌─────────────────────────────┐
            │  DEVELEAP-FRI-PROD-7K3M     │   [📋 Copy]
            └─────────────────────────────┘

Want to enter the prize drawing?
[ Submit to Google Form ]      (or just keep playing - your call)
```

`js/reveal.js` is responsible for:
- Detecting `revealsCode: true` on the reached ending.
- Rendering the code with a copy-to-clipboard button.
- Rendering a "Submit to Google Form" button that opens the form in a new tab. **Prefill the code field** via Google Forms' `?entry.<id>=<code>` URL parameter so the user just adds their name and submits.
- An optional "skip" message making it clear that submitting is opt-in.

### Google Form setup

- Form fields: Name (optional), Slack handle (optional), Code (required), "How did you find the true ending?" (optional, free text, fun for you to read).
- Settings: do not require sign-in. Allow one response per session (off, since no auth). Collect timestamps.
- Responses go to a Google Sheet. Pick the winner by first valid code submission, or by lottery among valid submissions, whichever feels right.

### Anti-cheat (light)

The code lives in JS and someone determined could find it via devtools. For a one-time event with a small, friendly audience this is fine, but to keep it honest:

- Store the code XOR-encoded or base64-encoded in `reveal.js`. Decode at reveal time. Stops casual scrollers, not attackers.
- The Google Form provides a natural validation point. Only **one** correct code exists. If you want stronger guarantees, the Sheet can use `=IF(B2="DEVELEAP-FRI-PROD-7K3M", "valid", "invalid")` to flag entries.

If you want true anti-cheat later, that's a Cloudflare Worker that returns the code only when given the correct choice path. Out of scope for v1.

## WordPress integration

Iframe from GitHub Pages. Two-line change in WP.

1. Push the static site to a GitHub repo (suggest `develeap-game` or under `CarmitHaas/develeap-game`), enable Pages on `master`.
2. In WordPress, add a Custom HTML block to the page:

```html
<iframe src="https://carmithaas.github.io/develeap-game/"
        style="width:100%;height:780px;border:0;border-radius:8px;"
        title="Develeap Mini-Game"></iframe>
```

3. Done.

Iterate on the game by pushing to GitHub. WordPress doesn't need to change again.

## Build phases

### Phase 0: Content workshop (you and me, before any code)

This is what you meant by "work and adjust the content ahead of time", and it should come before everything else. Output is a fully-written scenario in a single Google Doc or Markdown file we both edit.

What we produce in this phase:
- **NPC bible**: 1 paragraph per NPC. Voice rules, 5 sample lines each, running gags. Lock the archetypes.
- **Scenario outline**: 10-12 beat titles, what happens in each beat, what the 3 choices are at each branching beat, how branches converge.
- **Endings**: 3-5 ending titles with one paragraph each. One marked as the true ending.
- **The true-ending path**: explicitly trace which choices a player must make to reach it. This is what we encode as the win condition.
- **Tone samples**: 5-10 representative funny lines that set the bar. We use these as the voice anchor when writing the rest.
- **Easter eggs**: optional one-line jokes embedded in non-true paths. They're what makes the game replayable.

How we work in this phase:
- I draft, you cut and rewrite. You know Develeap's actual humor and which jokes will land. I'll keep proposing and you'll filter.
- We co-write the dialogue in plain prose, then I convert to the beat-schema JSON in Phase 3.
- We test by reading it aloud. If a beat doesn't make us laugh or tense up at least once, we rewrite it.
- Estimated calendar time: 2-3 working sessions of ~60 minutes each.

### Phase 1: Scaffold (half day)
- Set up the repo with `engine.js`, `state.js`, `audio.js`.
- Verify the engine runs with a single stub episode.

### Phase 2: Slack reskin (1 day)
- `index.html` shell: sidebar, main, right rail.
- `css/slack.css` matching the mockup above.
- `js/ui.js` `addMsg()` and choice rendering.
- Synthesize a Slack-style "knock" notification via Web Audio.

### Phase 3: Encode the content (half to 1 day)
- Convert the Phase 0 outline into `characters.js` and `episodes/episode-1.js`.
- Wire up `branchMessages[path]` for divergent dialogue.
- Tag the true ending with `revealsCode: true`.

### Phase 4: Code reveal and form (half day)
- `js/reveal.js`: render code with copy button, prefilled Google Form link, opt-out message.
- Build the Google Form, get the prefill URL, get the form-field IDs.
- Light obfuscation on the code in `reveal.js`.

### Phase 5: Deploy and embed (half hour)
- Push to GitHub, enable Pages.
- Add iframe block in WordPress.
- Pre-launch test: full play-through on desktop and mobile.
- Announce in `#general` with the WP page link.

**Total**: 4-5 working days, with Phase 0 (content) being the load-bearing one.

## Verification

- Local: open `index.html` in a browser, click through every choice combination at least once. Confirm:
  - Each beat advances correctly via `next` IDs.
  - `branchMessages[path]` shows different dialogue depending on prior choice.
  - Score meters change on each choice.
  - Each ending fires correctly.
  - True ending shows the code; other endings do not.
  - Google Form button opens with the code prefilled.
- Cross-device: test on mobile. Iframe height should adapt; consider `height: min(780px, 90vh)`.
- WP embed: confirm iframe loads inside the WP page on desktop and mobile.
- End-to-end winner flow: have one teammate play, find the true ending, submit the form. Confirm the response lands in the Sheet correctly with the prefilled code.

## What I need from you to start

1. **Pick a scenario theme** (A, B, C, or a different one).
2. **Confirm the NPC roster**. Real Develeap personas (with their consent) vs. fictional, names you want to use.
3. **Pick the unique winner code** or let me generate one (suggestion: `DEVELEAP-FRI-PROD-7K3M`).
4. **Google Form access**. Confirm you can create the form on a Develeap-owned account and that you have somewhere to send the responses.
5. **Repo target**. New `CarmitHaas/develeap-game` repo, or under a Develeap GitHub org? GitHub Pages enabled on master.
6. **WordPress access**. Confirm you can add a Custom HTML block, or know who can paste the iframe in.

Once those are settled we kick off Phase 0 (content workshop) and the implementation phases follow naturally from the scenario we write together.
