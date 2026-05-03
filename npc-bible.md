# NPC Bible

Six characters. Each has a strong distinct voice. Player encounters them across two parallel Slack contexts:

- **Develeap internal Slack**: `#general`, `#bingo`, DMs.
- **Shared customer Slack channel**: `#fastship-prod` (the Develeap-FastShip war room channel).

The player is a senior Develeap consultant. Player name is rendered as `@you` or whatever Slack handle the WP page passes in. Most of the action happens while the player is physically at **Brainspace**, the coworking space Develeap rents from.

**Player gender**: unknown. Players can be any gender. NPCs never use gendered terms when addressing the player. No "אחי" or "אחותי", no gendered second-person verbs without a gender-neutral alternative. Address by name (`@you`), use plural ("חברים", "צוות"), or skip the address entirely. Player choices, when written in Hebrew, use plural/impersonal forms (`בואו נדפלוי`, `בודקים את הלוגים`, `נחזור עם update`) - never `אני סומך/ת` or other gendered first-person verbs. English fallback is always allowed.

**Antagonist clarity**: Keren (customer-side PM) is the antagonist. She's the external pressure. Maya is your chaotic ally - she screams in your face but DMs Avi to make sure you don't get blamed. Inbar is the apprentice you can save or abandon. Bingo is comic relief.

> Comic note for game intro screen: "הדמויות מבוססות על Develeapers אמיתיים. או לא. תנחשו."

---

## Aviv - The over-documenter

**Role**: PM at Develeap. Coordinates customer engagements. Lives in Notion.

**Voice rules**:
- Speaks in calm, formal Hebrew with English DevOps terms.
- Always references a doc he wrote 4-6 months ago.
- Cites page numbers. Tags Linear/Notion items in messages.
- Never panics. Treats every fire as an opportunity to update the runbook.

**Running gag**: every problem already has a doc. Nobody read it. He sends the link mid-crisis.

**5 sample lines**:
1. `ראיתם את המסמך של ה-customer onboarding? עמוד 12 מסביר בדיוק את התרחיש הזה.`
2. `אני מצרף את ה-doc המעודכן (last edit: לפני 4 חודשים).`
3. `Inbar, יש לי slot ביומן ביום שלישי הבא ב-14:30 לסקירה.`
4. `זה כתוב ב-wiki תחת tag #customer-emergencies. אני מוסיף עכשיו action item.`
5. `נסכם בpostmortem. אני אפתח Linear ticket.`

---

## Maya - The screamer

**Role**: Senior consultant at Develeap. Veteran, sharp, loud. Loyal under the chaos. She'll yell at you in `#general` and quietly DM Avi (Develeap leadership) ten minutes later to make sure nobody's blaming you. She's not the bad guy. She's the chaotic ally with a long network.

**Voice rules**:
- ALL CAPS in Hebrew, multiple exclamation marks (3+).
- Threatens dramatic actions she will not actually take ("אני מתקשרת ל-CEO", "אני יוצאת לסופ"ש בעוד 90 דקות!!!").
- Always finds out about problems through the wrong channel first ("ראיתי ב-Sentry!!!").
- Switches between Hebrew and English mid-sentence when really angry.
- Has a moment of unexpected competence in every crisis. She knows somebody who knows somebody.

**Running gag**: she keeps wandering into the customer's Slack channel uninvited. The skill is redirecting that energy. Aimed at the customer Slack: disaster. Aimed at her old contact at FastShip: career-saving.

**6 sample lines**:
1. `מי הג'וניור הזאת שאתם שלחתם ל-FastShip?? אני רואה את ה-Sentry alerts פה!!!`
2. `אני יוצאת לסופ"ש בעוד 90 דקות!!!! זה לא קורה!!!!`
3. `אני אתקשר ל-Avi עכשיו. ZE LO ITAKEN.`
4. `Inbar את חמודה אבל את לא יכולה למחוק קבצים שאת לא מבינה!!!!!!!`
5. `אם זה לא נסגר עד 17:25 אני personally posting ב-LinkedIn.`
6. `רגע. רגע. אני בעצם מכירה את ה-CTO שלהם מהפרויקט של אקטרה ב-2023. רוצים שאני אכתוב לו?`

---

## Segev - The emoji-only

**Role**: Senior DevOps consultant at Develeap. Knows everything. Says nothing.

**Voice rules**:
- Never uses words. Only emoji and emoji combinations.
- Always exactly right about the situation.
- Active in every channel. Reacts within 4 seconds.
- Single emoji is judgment. Multi-emoji is a longer thought.

**Running gag**: someone eventually demands he respond in words. He sends `📝➡️🔥`.

**5 sample lines**:
1. `💀`
2. `🔥🔥🔥`
3. `👀`
4. `🚀`
5. `🤡` (specifically when Inbar asks if she should panic)

---

## Inbar - The newest grad on-site

**Role**: Junior consultant. Bootcamp grad. 4 months in. Embedded at FastShip this week. Caused the outage by accident yesterday.

**Voice rules**:
- Hebrew with frequent self-doubt. Lowercase, no caps.
- Asks "סליחה, רגע, האם..." before every technical statement.
- Sends apology DMs to people who weren't involved.
- Often technically right, doesn't trust herself.
- Side-comments observations that turn out to be the actual fix.

**Running gag**: she's right about the fix from beat 3 onward, but only the player believes her.

**5 sample lines**:
1. `תקשיבו אני חושבת ששברתי את זה אתמול 😬`
2. `סליחה, אולי טעיתי. ראיתי קובץ שנקרא terraform.tfstate על השרת ומחקתי אותו כי חשבתי שזה temp file. זה היה רע?`
3. `אני נכנסת לעוד פאניקה אבל`
4. `האם זה רגע טוב להגיד שאני חושבת שיש פה race condition?`
5. `סליחה. בלי קשר. שמתי לב שה-CI build לוקח 47 דקות. נראה לי שצריך cache layer ב-Dockerfile.`

---

## Keren - The customer-side PM

**Role**: PM at FastShip (customer). Manages the integration with Develeap. Polite. Aggressive. Karen-coded.

**Voice rules**:
- English first, occasional Hebrew. Polished, professional, slightly clipped.
- "I'd like to understand..." / "I'm sure your team is doing their best, but..." / "Just want to confirm the timeline."
- Loops in her CEO when she wants to apply pressure.
- Sends time-checks every 4 minutes once a deadline is in sight.

**Running gag**: she will absolutely write a thank-you note if you save her, AND a pointed feedback email to her account manager if you don't. Both are professionally drafted.

**5 sample lines**:
1. `Hi - just checking in on the timeline. CEO demo at 17:30.`
2. `I'm sure you're working on it. Just let me know what to tell the board.`
3. `I'd like to understand how this got past your QA process.`
4. `@you can we get on a quick call?`
5. `Following up. It's 17:18.`

---

## Bingo - The office dog

**Role**: Develeap office dog. Has somehow had a Slack account for 8 months. Owns the channel `#bingo`.

**Voice rules**:
- Only emoji, dog noises, single Hebrew syllables ("ווף ווף").
- Posts at chaotic times.
- Never replies in threads. Always top-level.
- His message timestamps suggest he sometimes posts at 03:00.

**Running gag**: somebody updated his Slack avatar to be a tiny suit and tie.

**5 sample lines**:
1. `🦴`
2. `🐾🐾🐾🐾`
3. `ווף ווף`
4. `👀🦴` (when food is mentioned in any channel)
5. `🐶❤️` (random, no context)
