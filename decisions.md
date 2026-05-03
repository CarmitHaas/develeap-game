# Decisions

Locked decisions are at the top. Full plan is in [PLAN.md](PLAN.md).

## Locked

- **Theme**: A revised. Customer prod is down (NOT bootcamp env). Develeap consultants embedded at fictional customer "FastShip" (or another name we pick). **Thursday 17:23**, not Friday. Demo to FastShip CEO at 17:30. Fix or fail.
- **NPCs**: 6 fictional characters. Aviv, Maya, Segev, Inbar, Keren, Bingo. Comic intro note "characters are based on real Develeapers, can you guess?" - players may or may not see real-people resemblance. We don't confirm.
- **Tracking**: simple Google Form link at the end. Opt-in. No Apps Script, no email gate, no public/internal split. Internal-only deployment.
- **Tone**: samples in this file landed. Use as voice anchor.
- **Drafts** going into `npc-bible.md` and `scenario.md` next.

---

## 1. Scenario theme (pick one)

### Option A: "Production is on fire and so is the microwave" (my pick)
**Setup:** Friday 11:47. The bootcamp env crashed mid-cohort. The next class is at 09:00 Sunday. Simultaneously: someone left fish in the microwave, Bingo (office dog) is barking, Inbar (newest grad) deleted a Terraform state file "to clean up". You navigate the fix while keeping team relationships intact.
**True ending:** You fix prod, calm Maya down, get Roy to actually type words for once, and earn Bingo's forgiveness with a treat.
**Why it works:** Strongest opening (real crisis), cleanest mix of DevOps + office absurdity, the true ending feels earned.

### Option B: "The Yogurt Detective"
**Setup:** Maya's yogurt has been stolen for 3 weeks. She's threatened to quit. You're appointed unofficial detective. Suspects: Aviv, Roy, Inbar, Bingo, the cleaning crew, and an AI agent that gained sentience.
**True ending:** Catch the culprit, surface a deeper truth about the office.
**Why it could work:** Detective structure makes the branching feel natural (interview each suspect = branch). More room for absurdity, less DevOps content.

### Option C: "Booth Wars: The Reckoning"
**Setup:** 3 booths, 12 people, double-booked at 14:00. You have a candidate interview but Maya has been "in a meeting" for 4 hours watching K-dramas.
**True ending:** Reclaim your booth without making enemies, and uncover that Bingo has been booking booths via Aviv's calendar.
**Why it could work:** Most relatable to anyone who's worked in an open office. Lower DevOps density.

### Option D: Your own
Tell me what scenario you've been imagining and I'll structure it the same way.

---

## 2. NPC roster (pick one approach)

### Approach 1: Fictional archetypes (recommended for safety)
5 made-up characters with strong recognizable voices. Anyone can play without knowing real Develeap people. Cleaner for public version of the game.

| NPC      | Role                                | Voice / running gag                                                |
|----------|-------------------------------------|--------------------------------------------------------------------|
| **Aviv** | Over-documented PM                  | Sends 14-page Notion docs for every decision. "ראיתם את הדף ההוא?" |
| **Maya** | Senior trainer, perpetually angry   | ALL CAPS, 3+ exclamation marks, blames everyone                    |
| **Roy**  | Senior DevOps, replies only in emoji| 🔥 / 👍 / 💀 / 🚀. Never words.                                     |
| **Inbar**| Newest bootcamp grad                | Asks 100% basic questions in `#general`, accidentally helpful      |
| **Bingo**| The office dog, somehow on Slack    | Posts only 🦴 / 🐾 / barking emojis. Owns one channel: `#bingo`.   |

### Approach 2: Real Develeap people (funnier, riskier)
Map the same archetypes to real colleagues. You'd need to clear it with each person. Pros: massive in-joke value, recognition laughs. Cons: someone might feel caricatured, doesn't work for the public version of the game.

### Approach 3: Hybrid
1-2 real people (the well-known ones who love the bit) + 3-4 fictional. Best of both for the internal version. The public version uses all-fictional.

---

## 3. Tracking backend (pick one)

### Option X: Apps Script + Sheets (matches connections-game, recommended)
Same pattern as `connections-game/`. Player clicks "Submit my run" at the true ending, POSTs timestamp + email + completion-time + choice-path to a Google Sheet. You see who finished, in what order, with what path. Pick winner from Sheet.

### Option Y: Plain Google Form
Simpler. Just code + name. Less data to pick a winner from.

### Option Z: Both versions
Internal HTML (`index.html`) uses Apps Script tracking. Public HTML (`index-public.html`) shows code only, no tracking. Mirrors the connections-game dual pattern exactly.

---

## 4. Tone-sample preview (just to set the bar)

Three sample exchanges in the proposed voice. If these don't make you smile, tell me what's off and I'll recalibrate.

**Sample 1: Maya panic**
```
maya 11:48
מה זאת אומרת קרסה??? אני בדיוק שלחתי להם DM!!!
maya 11:48
אני לא הולכת לשבת מול 24 בוגרים ב-09:00 ולהגיד להם שאין סביבה!!!!!
roy 11:48
🔥
```

**Sample 2: Inbar trying to help**
```
inbar 11:51
היי אני אולי טעיתי
inbar 11:52
אתמול ראיתי קובץ שנקרא terraform.tfstate על השרת ומחקתי אותו כי חשבתי שזה temp file
inbar 11:52
זה היה רע?
aviv 11:52
שלחתי לך את המסמך של ה-DevOps onboarding ב-30 לאוקטובר. עמוד 7.
```

**Sample 3: Bingo**
```
bingo 12:03
🐾🐾🐾🐾
bingo 12:03
🦴
maya 12:04
מישהו יכול להוציא את הכלב מ-#prod-down בבקשה
roy 12:04
😂
```

---

## What I need from you next

A one-line answer to each:

1. Scenario: **A / B / C / D-(my idea is...)**
2. NPCs: **Approach 1 / 2 / 3** (and if 2 or 3, which real people)
3. Tracking: **X / Y / Z**
4. Tone: **good / change this: ...**

Once you answer, I'll draft the full Phase 0 deliverable in this `game/` directory:
- `npc-bible.md` (full character voices, 5 sample lines each, running gags)
- `scenario.md` (10-12 beat outline, choice tree, all endings, true-ending path traced)
- `tone-samples.md` (more samples, expanded if needed)

Then we iterate on those before any code gets written.
