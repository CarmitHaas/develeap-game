# Scenario: "The Demo is in 90 Minutes"

**Setup**: Thursday 17:23. You are a senior Develeap consultant, sitting at **Brainspace** (the coworking space Develeap rents). Your junior, **Inbar**, is embedded at customer **FastShip** this week and just broke their payments service. FastShip's CEO has a board demo at **17:30**. You have 7 minutes to fix it without nuking the customer relationship.

**Two parallel Slack contexts the player jumps between**:
- `#fastship-prod` - shared channel with FastShip. Keren is here. Posture: professional.
- Develeap internal Slack - `#general`, `#bingo`, DMs. Posture: chaos.

**Antagonist clarity**: Keren is the external pressure source. Maya is your loud-but-loyal ally; redirected well, she saves the day. Inbar is the apprentice you can save or abandon. Bingo is comic relief. Aviv is the documentation guy.

**Goal meter labels** (right rail): `Trust` per character. `Demo countdown` as the goal bar (fills toward 100 = saved the demo).

**Working customer name**: FastShip. Replace with anything that fits a fictional Israeli e-commerce startup. Pick something with playful specificity (a name that reads as "obviously fake but recognizable").

**Player gender is unknown.** All player choices written in plural/impersonal Hebrew (`בואו נסתכל`, `בודקים את הלוגים`, `נחזור עם update`) or English. NPCs never use gendered terms toward the player.

---

## Beat 1: The Page

**Channel**: `#fastship-prod`

```
keren 17:23
Hi everyone - payments service returning 500s for 6 minutes.
CEO demo at 17:30. Can someone take a look?

inbar (DM to you) 17:23
תקשיבו אני חושבת ששברתי את זה אתמול 😬

maya (#general at Develeap) 17:24
מי הג'וניור הזאת שאתם שלחתם ל-FastShip??
אני רואה את ה-Sentry alerts פה!!!
```

**Choices**:

| # | Text | Path | aviv | maya | segev | inbar | keren | bingo | goalΔ |
|---|------|------|------|------|-------|-------|-------|-------|-------|
| A | "On it Keren. Inbar איתי, נחזור עם update תוך 5 דק׳." | `lead` | 0 | -3 | +5 | +10 | +12 | 0 | +25 |
| B | "Maya רגע, בודקים את הלוגים. 3 דקות." | `maya_first` | +5 | +15 | 0 | 0 | -5 | 0 | +10 |
| C | "Inbar, מה בדיוק היה אתמול בערב על השרת?" | `blame` | 0 | +10 | -5 | -20 | -5 | 0 | +5 |

**True-ending requirement**: pick A.

---

## Beat 2: First diagnosis

`branchMessages.lead`:
```
inbar 17:25
שולחת deploy log של אתמול. הרצתי terraform apply בסביבה של staging
אבל המודולים נמשכו מ-prod-config. נראה לי שזה דרס env var

segev 17:25
💀
```

`branchMessages.maya_first`:
```
maya (#general) 17:25
אני בעצם רואה ב-Sentry שהבעיה התחילה ב-23:14 אתמול.
מי היה connected?

aviv 17:25
@channel ראיתם את ה-runbook? עמוד 7 - Customer Production Incidents.
```

`branchMessages.blame`:
```
inbar 17:25
אני... לא יודעת. נראה לי שעשיתי משהו רע.
מסתכלת בלוגים.

(small ⚫ status icon next to her name)
```

All paths converge on the next decision:

**Choices**:

| # | Text | Path | aviv | maya | segev | inbar | keren | bingo | goalΔ |
|---|------|------|------|------|-------|-------|-------|-------|-------|
| A | "Quick rollback. נחזיר ל-deploy של 2 ימים אחורה." | `rollback` | 0 | 0 | +12 | 0 | +8 | 0 | +20 |
| B | "Forward fix. Inbar, איפה ה-state file?" | `fix` | +8 | 0 | +5 | +12 | 0 | 0 | +15 |
| C | "Page Avi (Develeap leadership)." | `escalate` | 0 | +10 | -5 | -5 | -10 | 0 | +5 |

---

## Beat 3: Maya enters the customer channel

```
maya (#fastship-prod) 17:27
Hi Keren! Just to update - we're on it.
Inbar is junior but she's GREAT actually.
We're so sorry. SO so sorry.

keren 17:27
...ok thanks Maya.

maya (DM to you) 17:27
חשבתי שאני עוזרת. עשיתי טעות?
```

**Choices**:

| # | Text | Path | aviv | maya | segev | inbar | keren | bingo | goalΔ |
|---|------|------|------|------|-------|-------|-------|-------|-------|
| A | "Maya, צאי מהערוץ של הלקוח. תרימי טלפון ל-CTO שלהם - את מכירה אותו." | `redirect_maya` | +5 | +12 | +8 | +5 | +12 | 0 | +20 |
| B | "Maya, דברי איתי ב-DM. אני מנהל את הערוץ." | `contain_maya` | +5 | -3 | +5 | +5 | +10 | 0 | +10 |
| C | (silent. focus on prod.) | `focused` | +3 | -10 | +5 | +5 | 0 | 0 | +10 |

**True-ending requirement**: pick A.

Why A is the win: Maya wandering into the customer Slack is a problem. Maya calling FastShip's CTO (whom she actually knows from a 2023 engagement) is a save. Same energy, redirected. This is the lesson - manage your loud teammates, don't sideline them.

---

## Beat 4: The Bingo Interlude

**Channel**: `#bingo`

```
bingo 17:29
🦴🦴🦴

aviv (#general) 17:29
מישהו שם פה דג ב-microwave? אני לא מצליח להתרכז.

bingo 17:29
👀🦴

maya 17:29
?????? עכשיו????

bingo 17:29
🐾
```

**Choices** (low stakes, comic):

| # | Text | Path | aviv | maya | segev | inbar | keren | bingo | goalΔ |
|---|------|------|------|------|-------|-------|-------|-------|-------|
| A | (post 🦴 in #bingo) | `dog_friend` | 0 | -3 | 0 | 0 | 0 | +20 | 0 |
| B | (ignore, stay focused) | `pro` | +5 | +5 | +3 | 0 | 0 | -5 | +5 |
| C | "@bingo work hours please" | `bingo_disrespect` | 0 | 0 | -5 | 0 | 0 | -25 | 0 |

(Bingo score affects the easter-egg ending only.)

---

## Beat 5: The actual fix

```
inbar 17:30
מצאתי. ה-DB connection string מצביע ל-staging-db.
ה-deployment של אתמול דרס את ה-prod env var.

segev 17:30
🔥

keren (#fastship-prod) 17:30
Following up. CEO is in the room.
```

**Choices**:

| # | Text | Path | aviv | maya | segev | inbar | keren | bingo | goalΔ |
|---|------|------|------|------|-------|-------|-------|-------|-------|
| A | "אני נכנס ל-SSH ודוחף את התיקון ידני." | `cowboy_fix` | -10 | -5 | +5 | -5 | +5 | 0 | +15 |
| B | "Hotfix branch, PR, deploy via CI." | `proper_process` | +12 | +3 | 0 | 0 | -5 | 0 | +10 |
| C | "Inbar - את לוקחת את התיקון. נעבור על ה-diff ביחד פה ב-Slack." | `mentor_inbar` | +8 | +5 | +10 | +20 | +5 | 0 | +20 |

**True-ending requirement**: pick C.

Why C is the win: she broke it, she fixes it, with you reviewing alongside. Mentoring + process. The cowboy fix is faster but trains nobody. The proper-CI path is slow when the demo is in 5 minutes.

---

## Beat 6: Path complication (full fork)

No choice in this beat. Pure consequence of the beat-5 path. Each path runs its own ~3-line scene.

`branchMessages.cowboy_fix`:
```
maya (#general) 17:31
SSH על PROD???? אנחנו לא עושים SSH על PROD!!!

aviv 17:31
@channel רק להזכיר: SSH על prod דורש 2-person rule. Notion runbook, עמוד 23.

inbar (DM to you) 17:32
האם זה prod-1 או prod-2? ה-payment service רץ רק על prod-1.

(you check. it's prod-1. fix is in.)

segev 17:32
🚀

maya 17:32
פאקינג גאון. אני מתעצבנת על העובדה שעשית את זה אבל זה עבד.
```

`branchMessages.proper_process`:
```
inbar 17:31
PR פתוח. Branch: hotfix/payments-env-fix. CI started.

maya 17:32
כמה זמן ה-CI לוקח??? יש לנו 4 דקות!!!

aviv 17:32
ה-pipeline ב-payments בממוצע 3:42. השבוע ראיתי 4:11 בגלל cache misses.

inbar 17:33
test_payment_idempotency נפל. אני חושבת שזה flaky.

aviv 17:33
זה flaky. Linear ticket DEV-184. אני יודע.

inbar 17:33
מנסה rerun.

segev 17:33
🤞
```

`branchMessages.mentor_inbar`:
```
inbar 17:31
פותחת את ה-diff פה ב-Slack. Snippet:

  - DB_HOST: staging.db.fastship.io
  + DB_HOST: prod.db.fastship.io
  - DB_PORT: 5433
  + DB_PORT: 5432

inbar 17:32
רגע. רגע. אני רואה משהו. ה-DB_PASS ב-config עדיין hardcoded?
זה לא ה-task שלי. האם זה בסדר?

aviv 17:33
הא. זה ב-post-mortem שלי משבוע שעבר. עמוד 19. ticket נפרד DEV-201.

maya 17:33
INBAR את גילית את זה לבד????

inbar 17:33
סליחה אם זה לא הזמן. נחזור לעניין?

segev 17:33
🤩
```

**Goal effect by path** (no choice, fixed): cowboy_fix +10, proper_process +5, mentor_inbar +10.

---

## Beat 7: Keren escalates

```
keren (#fastship-prod) 17:32
Hi - just looping in our CEO Yael.
Yael, the team is looking into it.
Yael says: "I need this in 5 minutes."
```

**Choices**:

| # | Text | Path | aviv | maya | segev | inbar | keren | bingo | goalΔ |
|---|------|------|------|------|-------|-------|-------|-------|-------|
| A | "5 minutes Keren. We're on the fix." | `confident` | 0 | 0 | +5 | 0 | +10 | 0 | +10 |
| B | "We may need to push the demo by 10 minutes. Is that an option?" | `honest` | +5 | -5 | 0 | 0 | +5 | 0 | +5 |
| C | (silent. fix in progress.) | `focus_silent` | 0 | -5 | +12 | +5 | -3 | 0 | +15 |

---

## Beat 8: Maya's redemption (or not)

`branchMessages.redirect_maya` (player picked A in beat 3):
```
maya (DM to you) 17:33
דיברתי עם Yossi מ-FastShip. הוא ה-CTO. הוא יחזיק את ה-CEO 5 דקות נוספות.
"זה קורה ככה לפעמים, ולפעמים זה דווקא ה-vendor שאני סומך עליהם הכי הרבה."

segev (#general) 17:33
🚀
```

`branchMessages.contain_maya` (player picked B in beat 3):
```
maya (DM to you) 17:33
אני יושבת על הידיים. תתקדם/י.

aviv (#general) 17:33
אגב, רק להזכיר - ה-runbook ב-Notion, עמוד 14, מסביר את התרחיש הזה.
```

`branchMessages.focused` (player picked C in beat 3):
```
maya (#fastship-prod) 17:33
@keren one more update - we are SO close.

keren (#fastship-prod) 17:33
@maya please let your team handle it.
```

(No choice in this beat. Pure payoff for beat 3.)

**Goal effect by path**: redirect_maya: +25, contain_maya: +5, focused: -10.

---

## Beat 9: Critical decision (true-ending lock)

```
inbar 17:34
התיקון מוכן. אולי אני יכולה לדחוף את זה לפרודקשן? צריך אישור.

segev 17:34
👀
```

**Choices**:

| # | Text | Path | aviv | maya | segev | inbar | keren | bingo | goalΔ |
|---|------|------|------|------|-------|-------|-------|-------|-------|
| A | "Inbar, paste the diff. נסקור ביחד. אז את דוחפת לפרודקשן." | `pair_review` | +15 | +5 | +10 | +25 | +5 | 0 | +30 |
| B | "אני אסקור את ה-diff. את דוחפת אחרי שאני מאשר." | `solo_review` | +10 | +5 | 0 | +5 | 0 | 0 | +20 |
| C | "Push it. אין זמן ל-review." | `no_review` | -15 | -5 | -8 | -10 | +5 | 0 | +20 |

**True-ending requirement**: pick A.

Why A is the win: review is non-negotiable, and pair-reviewing live is both the safe move and the teaching move. C is the cowboy choice that gets you a fast 200 OK and a postmortem on Sunday. B is fine but doesn't pull Inbar into the review.

---

## Beat 10: The deploy (branched)

`branchMessages.pair_review`:
```
inbar 17:35
דחיתי את ה-PR. בודקת...

inbar 17:35
🟢 200 OK!

segev 17:35
🚀

aviv 17:35
ל-protocol: אני פותח Linear ticket לעדכון ה-runbook עם התיקון הזה.
```

`branchMessages.solo_review`:
```
aviv 17:35
ה-diff נראה נכון. עמוד 12 ב-runbook אגב.

inbar 17:36
deployed.
inbar 17:36
🟢 200 OK
```

`branchMessages.no_review`:
```
(deploy goes out fast.)
🟢 200 OK
maya (DM) 17:36
איזה rush.
inbar (DM) 17:36
לא בדקתי קונפיגורציה לטסטים. אני לא יודעת אם פגעתי ב-CI pipeline.
segev 17:37
💀
```

---

## Beat 11: The result

```
keren (#fastship-prod) 17:37
It's working. CEO got his demo. Thanks team.

maya (DM to you) 17:38
כל הכבוד. רצינית. אני מבטלת את שיחת LinkedIn.
```

**Choices** (final):

| # | Text | Path | aviv | maya | segev | inbar | keren | bingo | goalΔ |
|---|------|------|------|------|-------|-------|-------|-------|-------|
| A | "Inbar - this was you. נשתה קפה מחר ל-debrief." | `praise_inbar` | +5 | +8 | +5 | +25 | 0 | 0 | +10 |
| B | "Whew. תודה לכולם." | `generic_thanks` | 0 | +3 | 0 | 0 | 0 | 0 | +5 |
| C | (post in #bingo): "🦴 לכבוד Bingo." | `bingo_celebration` | 0 | -3 | +5 | 0 | 0 | +30 | 0 |

**True-ending requirement**: pick A.

---

## Endings

### True ending: "DevOps Diplomat"

**Trigger**: paths `lead` + `redirect_maya` + `mentor_inbar` + `pair_review` + `praise_inbar`. All 5 must hit.

**Headline**: `הצלת את הדמו, את הקריירה של Inbar, ואת סוף השבוע של Maya`

**Sub**: `Keren שלחה note למנהל החשבון שלכם. Inbar בכתה קצת. Maya כבר מספרת את הסיפור על ה-CTO של FastShip לכל מי שמוכן להקשיב. Bingo קיבל פינוק. ה-microwave עדיין עולה באש אבל זה Q3 problem.`

**Badge**: 🏆 "DevOps Diplomat"

**`revealsCode: true`**.

---

### OK ending: "We made it (barely)"

**Trigger**: prod fixed, but missed at least 2 of the 5 true-path choices. Goal score 70-99.

**Headline**: `הדמו עבר. בקושי.`

**Sub**: `Keren אמרה "thanks". Maya עוד לא מדברת איתכם. Inbar מתביישת. אבל ה-prod חי.`

**Badge**: 😮‍💨 "Survivor"

---

### Bad ending: "The Customer Slack Goes Quiet"

**Trigger**: missed 3+ true-path choices, OR escalated to Avi early. Goal score 40-69.

**Headline**: `הדמו נדחה למחר.`

**Sub**: `Keren כתבה "let's regroup tomorrow". זה אף פעם לא טוב. Avi רוצה שיחה ביום ראשון.`

**Badge**: 📉 "Postmortem Pending"

---

### Disaster ending: "Career-defining Thursday"

**Trigger**: blame in beat 1 + cowboy_fix in beat 5 + no_review in beat 9 + Maya not redirected.

**Headline**: `Inbar שלחה הודעת התפטרות ב-19:43.`

**Sub**: `FastShip שולחים מייל ל-Avi בשבוע הבא. ה-presentation על "lessons learned" כבר ב-calendar שלכם.`

**Badge**: 💀 "Friday Morning Postmortem"

---

### Easter egg ending: "Bingo for CTO"

**Trigger**: Bingo score >= 80 AND `bingo_celebration` in beat 11.

**Headline**: `Bingo נבחר ל-Acting CTO ב-vote של Slack reactions.`

**Sub**: `איש לא יודע איך זה קרה. Keren בעצם בסדר עם זה. Aviv פותח Notion doc על "Canine Leadership Principles".`

**Badge**: 🐶 "Good Boy"

**`revealsCode: false`** (no winning code, but a fun reward for absurd play).

---

## True-ending path summary

5 specific choices in 5 specific beats:

1. Beat 1 → A (`lead`) - take charge in customer channel
2. Beat 3 → A (`redirect_maya`) - aim Maya at FastShip's CTO, don't sideline her
3. Beat 5 → C (`mentor_inbar`) - Inbar fixes, you watch (this also locks in beat 6 path content)
4. Beat 9 → A (`pair_review`) - review the diff together, then she deploys
5. Beat 11 → A (`praise_inbar`) - publicly credit her

Beats 2, 4, 7, 8, 10 are flexible (no required choice). The player has room to make non-true-path choices and still reach the true ending if they hit the 5 above. Beat 6 has no choice (pure narrative consequence of beat 5).

**11 beats total. 3 strong fork points** (beat 1 → divergent beat 2, beat 3 → divergent beat 8, beat 5 → divergent beat 6). Replay value: about 35% different content per playthrough depending on path picks.

The lessons baked in: take ownership early, redirect chaos into useful work, mentor instead of taking over, never skip review, share credit. All things you'd want a Develeap consultant to actually do.

---

## Open creative questions

1. **Customer name**. FastShip is a placeholder. Want something funnier or more pointed? "DataKind", "ZipMe", "Petakl", whatever fits the satire.
2. **CEO name**. I used "Yael" as Keren's CEO. Replace if there's a better stock name or in-joke.
3. **Avi as Develeap leadership**. I made him up as the offstage authority. Real Develeap leader name? Or keep Avi as the abstract "we don't want to escalate to Avi" figure.
4. **FastShip CTO name**. I used "Yossi" for the CTO Maya knows from 2023. Replace if you want.
5. **Inbar's terraform mistake**. Currently: ran terraform apply with wrong env vars + the modules pulled prod-config. Plausible enough? Alternatives: committed `.env` to GitHub, ran `kubectl delete -f` on prod, force-pushed to main, deleted state file directly.
6. **Endings count**. We have 5. That feels generous for a one-time event - trim one (bad + disaster could merge)?
7. **Length**. 11 beats, ~5-10 minute playtime. Trim anywhere if it feels long when read aloud?
