"use strict";

// ─── EPISODE 1: "The Demo is in 90 Minutes" ─────────────────────
// Develeap mini-game scenario. See ../scenario.md for the full design.
//
// Status: IN PROGRESS. Beats 1-3 are wired up. Beats 4-11 are stubbed
// with a placeholder ending. We iterate from here.

const EPISODE_1 = {
  id: 1,
  title: "The Demo is in 90 Minutes",
  emoji: "🚨",
  subtitle: "Customer prod is down. Junior consultant on-site. CEO demo at 17:30.",
  goal: "Save the demo. Save Inbar's career. Don't burn the customer.",

  activeChars: ["avi", "aviv", "maya", "segev", "inbar", "keren", "bingo"],

  initialScores: {
    avi: 50, aviv: 50, maya: 50, segev: 50, inbar: 50, keren: 50, bingo: 50, yarden: 50
  },

  dateLabel: "Today, Thursday",
  startTime: { h: 17, m: 23 },

  beats: [

    // ═════════════════════════════════════════════════════════════
    // BEAT 1: The Page
    // ═════════════════════════════════════════════════════════════
    {
      id: "beat_1",
      channel: "fastship_prod",
      messages: [
        {
          from: "keren",
          channel: "fastship_prod",
          text: "Hi everyone - payments service returning 500s for 6 minutes. CEO demo at 17:30. Can someone take a look?",
          typingMs: 1800
        },
        {
          from: "inbar",
          channel: "dm_inbar",
          text: "אוי, לא, אני חושבת ששברתי את זה אתמול 😬",
          typingMs: 1400
        },
        {
          from: "maya",
          channel: "general",
          text: "מי הג'וניורית הזו ששלחתם ל-FastShip?? אני רואה את ה-Sentry alerts פה!!!",
          typingMs: 2000
        }
      ],
      choices: [
        {
          label: "Take charge in the customer channel",
          text: "On it Keren. Inbar is with me. We'll be back with an update in 5 min.",
          channel: "fastship_prod",
          effects: { maya: -3, segev: +5, inbar: +10, keren: +12 },
          goalDelta: 25,
          next: "beat_2",
          path: "lead",
          pathKey: "first_response"
        },
        {
          label: "Calm Maya first in #general",
          text: "מאיה רגע, בודקים את הלוגים. 3 דקות.",
          channel: "general",
          effects: { aviv: +5, maya: +15, keren: -5 },
          goalDelta: 10,
          next: "beat_2",
          path: "maya_first",
          pathKey: "first_response"
        },
        {
          label: "DM Inbar to interrogate her",
          text: "ענבר, מה בדיוק היה אתמול בערב על השרת?",
          channel: "dm_inbar",
          effects: { maya: +10, segev: -5, inbar: -20, keren: -5 },
          goalDelta: 5,
          next: "beat_1b_inbar_silent",
          path: "blame",
          pathKey: "first_response"
        }
      ]
    },

    // ═════════════════════════════════════════════════════════════
    // BEAT 1b (CONDITIONAL): Inbar shuts down after being blamed publicly
    // Fires only on the `blame` path. Sets paths.inbar_state = 'silent'
    // which locks out the mentor_inbar option in beat 5 → no true ending.
    // ═════════════════════════════════════════════════════════════
    {
      id: "beat_1b_inbar_silent",
      channel: "dm_inbar",
      messages: [
        { from: "inbar", channel: "dm_inbar", text: "אני... בסדר. אני אעבור על הלוגים בעצמי. נחזור עם update.", typingMs: 2200 },
        { from: "inbar", channel: "dm_inbar", text: "(Inbar's status: 🚫 Do Not Disturb)", typingMs: 1200 },
        { from: "segev", channel: "general", text: "💀💀", typingMs: 600, isEmoji: true },
        { from: "aviv",  channel: "general", text: "ל-protocol: עמוד 17 ב-runbook על איך לטפל בג'וניור אחרי תקלה. נחזור לזה ב-debrief.", typingMs: 2400 }
      ],
      // No choices in this beat. Just a consequence we live with.
      // The path is set via a programmatic note: beat_outcome reads paths.inbar_state directly.
      // To actually set the state, we use a routerFn-style trick: see autoNext + routerFn.
      autoNext: "beat_1c_set_state"
    },

    // Tiny router beat: sets paths.inbar_state = 'silent' and advances to beat_2
    {
      id: "beat_1c_set_state",
      routerFn: ({ paths }) => {
        paths.inbar_state = 'silent';
        return 'beat_2';
      }
    },

    // ═════════════════════════════════════════════════════════════
    // BEAT 2: First diagnosis (path-branched dialogue)
    // ═════════════════════════════════════════════════════════════
    {
      id: "beat_2",
      branchMessages: {
        lead: [
          {
            from: "inbar",
            channel: "dm_inbar",
            text: "שולחת deploy log של אתמול. הרצתי terraform apply בסביבה של staging אבל המודולים נמשכו מ-prod-config. נראה לי שזה דרס env var",
            typingMs: 2200
          },
          { from: "segev", channel: "general", text: "💀", typingMs: 600, isEmoji: true }
        ],
        maya_first: [
          {
            from: "maya",
            channel: "general",
            text: "אני בעצם רואה ב-Sentry שהבעיה התחילה ב-23:14 אתמול. מי היה connected?",
            typingMs: 1800
          },
          {
            from: "aviv",
            channel: "general",
            text: "@channel ראיתם את ה-runbook? עמוד 7 - Customer Production Incidents.",
            typingMs: 1600
          }
        ],
        blame: [
          {
            from: "inbar",
            channel: "dm_inbar",
            text: "אני... לא יודעת. נראה לי שעשיתי משהו רע. מסתכלת בלוגים.",
            typingMs: 1800
          }
        ]
      },
      choices: [
        {
          label: "Quick rollback (announce in #fastship-prod)",
          text: "Plan: rolling back to deploy of 2 days ago. Will confirm when done.",
          channel: "fastship_prod",
          effects: { segev: +12, keren: +8 },
          goalDelta: 20,
          next: "beat_3",
          path: "rollback"
        },
        {
          label: "Forward fix (DM Inbar to dig in)",
          text: "ענבר, איפה ה-state file?",
          channel: "dm_inbar",
          effects: { aviv: +8, segev: +5, inbar: +12 },
          goalDelta: 15,
          next: "beat_3",
          path: "forward_fix"
        },
        {
          label: "Page Avi (Develeap leadership)",
          text: "@avi דחוף - הפרודקשן של FastShip למטה. צריכים אותך פה.",
          channel: "dm_aviv",
          effects: { maya: +10, segev: -5, inbar: -5, keren: -10 },
          goalDelta: 5,
          next: "beat_2b_avi_joins",
          path: "escalate",
          pathKey: "diag_action"
        }
      ]
    },

    // ═════════════════════════════════════════════════════════════
    // BEAT 2b (CONDITIONAL): Avi joins after being paged
    // Fires only on the `escalate` path. Avi micro-manages from here on.
    // Maya defers to him, which neutralizes her later "redirect to CTO" move.
    // ═════════════════════════════════════════════════════════════
    {
      id: "beat_2b_avi_joins",
      channel: "general",
      messages: [
        { from: "avi",   channel: "general", text: "הגעתי. מה מצב?", typingMs: 1200 },
        { from: "avi",   channel: "general", text: "אני רוצה update כל 90 שניות. פתחו thread פה.", typingMs: 1800 },
        { from: "maya",  channel: "general", text: "🤦", typingMs: 600, isEmoji: true },
        { from: "segev", channel: "general", text: "👀", typingMs: 500, isEmoji: true }
      ],
      autoNext: "beat_3"
    },

    // ═════════════════════════════════════════════════════════════
    // BEAT 3: Maya enters the customer channel
    // ═════════════════════════════════════════════════════════════
    {
      id: "beat_3",
      channel: "fastship_prod",
      messages: [
        {
          from: "maya",
          channel: "fastship_prod",
          text: "Hi Keren! Just to update - we're on it. Inbar is junior but she's GREAT actually. We're so sorry. SO so sorry.",
          typingMs: 2200
        },
        {
          from: "keren",
          channel: "fastship_prod",
          text: "...ok thanks Maya.",
          typingMs: 1400
        },
        {
          from: "maya",
          channel: "dm_maya",
          text: "חשבתי שאני עוזרת. עשיתי טעות?",
          typingMs: 1600
        }
      ],
      choices: [
        {
          label: "Redirect Maya's energy (DM her)",
          text: "מאיה, אני על הקשר עם הלקוח. תרימי טלפון ל-CTO שלהם, את מכירה אותו.",
          channel: "dm_maya",
          effects: { aviv: +5, maya: +12, segev: +8, inbar: +5, keren: +12 },
          goalDelta: 20,
          next: "beat_4",
          path: "redirect_maya",
          pathKey: "maya_path"
        },
        {
          label: "Quietly contain Maya (DM)",
          text: "מאיה, בואי נדבר ב-DM. אני על הקשר מול הלקוח.",
          channel: "dm_maya",
          effects: { aviv: +5, maya: -3, segev: +5, inbar: +5, keren: +10 },
          goalDelta: 10,
          next: "beat_4",
          path: "contain_maya",
          pathKey: "maya_path"
        },
        {
          label: "Stay focused on the fix (no message)",
          channel: "fastship_prod",
          effects: { aviv: +3, maya: -10, segev: +5, inbar: +5 },
          goalDelta: 10,
          next: "beat_4",
          path: "focused",
          pathKey: "maya_path"
        }
      ]
    },

    // ═════════════════════════════════════════════════════════════
    // BEAT 4: The Bingo Interlude
    // ═════════════════════════════════════════════════════════════
    {
      id: "beat_4",
      channel: "bingo",
      messages: [
        { from: "bingo", channel: "bingo",   text: "🦴🦴🦴", typingMs: 600, isEmoji: true },
        { from: "maya",  channel: "general", text: "מי שם דג במיקרוגל???? כל הקומה מסריחה!!!", typingMs: 1800 },
        { from: "maya",  channel: "general", text: "ומי נותן לבינגו להתקרב למקלדת שוב????", typingMs: 1500 },
        { from: "bingo", channel: "bingo",   text: "🐾🐾🐾", typingMs: 600, isEmoji: true },
        { from: "maya",  channel: "general", text: "אני בעיצומו של משבר אצל לקוח!!! אכפת לכם?", typingMs: 1800 }
      ],
      choices: [
        {
          label: "Acknowledge Bingo with a 🦴",
          text: "🦴",
          channel: "bingo",
          isEmoji: true,
          effects: { maya: -3, bingo: +20 },
          goalDelta: 0,
          next: "beat_4b_yarden_dm",
          path: "dog_friend",
          pathKey: "bingo_path"
        },
        {
          label: "Stay focused on prod (ignore Bingo)",
          channel: "general",
          effects: { aviv: +5, maya: +5, segev: +3, bingo: -5 },
          goalDelta: 5,
          next: "beat_4b_yarden_dm",
          path: "pro",
          pathKey: "bingo_path"
        },
        {
          label: "Tell Bingo to focus, we're in crisis",
          text: "@bingo קצת focus בבקשה. אנחנו בחירום.",
          channel: "bingo",
          effects: { segev: -5, bingo: -25 },
          goalDelta: 0,
          next: "beat_4b_yarden_dm",
          path: "bingo_disrespect",
          pathKey: "bingo_path"
        }
      ]
    },

    // ═════════════════════════════════════════════════════════════
    // BEAT 4b: SIDE QUEST - Yarden DMs about a parallel bootcamp incident.
    // Tests the player's multi-tasking judgment. No effect on the main outcome,
    // but `paths.yarden_response` unlocks a small post-incident MoM line.
    // ═════════════════════════════════════════════════════════════
    {
      id: "beat_4b_yarden_dm",
      channel: "dm_yarden",
      messages: [
        { from: "yarden", channel: "dm_yarden", text: "היי! סליחה על ההפרעה. יש לי בעיה עם ה-bootcamp env שלי - ה-CI לא רץ.", typingMs: 2000 },
        { from: "yarden", channel: "dm_yarden", text: "השיעור ב-09:00 מחר. יש מצב לעזרה של שתי דקות?", typingMs: 1800 }
      ],
      choices: [
        {
          label: "Help Yarden quickly",
          text: "תני שתי דקות. אני בלחץ פה, אבל תיכף איתך.",
          channel: "dm_yarden",
          effects: { yarden: +25 },
          goalDelta: -5,
          next: "beat_5_dispatch",
          path: "help",
          pathKey: "yarden_response"
        },
        {
          label: "Defer Yarden",
          text: "ירדן, אני בעיצומו של incident. נדבר בעוד שעה?",
          channel: "dm_yarden",
          effects: { yarden: +5 },
          goalDelta: 0,
          next: "beat_5_dispatch",
          path: "defer",
          pathKey: "yarden_response"
        },
        {
          label: "Ignore (do not respond)",
          channel: "dm_yarden",
          effects: { yarden: -20 },
          goalDelta: +5,
          next: "beat_5_dispatch",
          path: "ignore",
          pathKey: "yarden_response"
        }
      ]
    },

    // ═════════════════════════════════════════════════════════════
    // BEAT 5 DISPATCH: route to normal or inbar_silent variant
    // ═════════════════════════════════════════════════════════════
    {
      id: "beat_5_dispatch",
      routerFn: ({ paths }) =>
        paths.inbar_state === 'silent' ? 'beat_5_inbar_silent' : 'beat_5_normal'
    },

    // ═════════════════════════════════════════════════════════════
    // BEAT 5 (normal): The actual fix - all 3 options available
    // ═════════════════════════════════════════════════════════════
    {
      id: "beat_5_normal",
      channel: "dm_inbar",
      messages: [
        { from: "inbar", channel: "dm_inbar",      text: "מצאתי. ה-DB connection string מצביע ל-staging-db. ה-deployment של אתמול דרס את ה-prod env var.", typingMs: 2200 },
        { from: "segev", channel: "general",       text: "🔥", typingMs: 600, isEmoji: true },
        { from: "keren", channel: "fastship_prod", text: "Following up. CEO is in the room.", typingMs: 1400 }
      ],
      choices: [
        {
          label: "Push the fix manually via SSH",
          text: "I'm SSH'ing in. Pushing the fix manually.",
          channel: "general",
          effects: { aviv: -10, maya: -5, segev: +5, inbar: -5, keren: +5 },
          goalDelta: 15,
          next: "beat_5b_wrong_server",
          path: "cowboy_fix",
          pathKey: "fix_method"
        },
        {
          label: "Hotfix branch, PR, deploy via CI",
          text: "Hotfix branch + PR + deploy via CI. Slower but clean.",
          channel: "general",
          effects: { aviv: +12, maya: +3, keren: -5 },
          goalDelta: 10,
          next: "beat_6",
          path: "proper_process",
          pathKey: "fix_method"
        },
        {
          label: "Inbar takes the fix; we walk the diff together",
          text: "ענבר - את לוקחת את התיקון. נעבור על ה-diff ביחד פה ב-DM.",
          channel: "dm_inbar",
          effects: { aviv: +8, maya: +5, segev: +10, inbar: +20, keren: +5 },
          goalDelta: 20,
          next: "beat_6",
          path: "mentor_inbar",
          pathKey: "fix_method"
        }
      ]
    },

    // ═════════════════════════════════════════════════════════════
    // BEAT 5 (Inbar silent variant): mentor option NOT available
    // (locks out the true ending — that's the consequence of blame in beat 1)
    // ═════════════════════════════════════════════════════════════
    {
      id: "beat_5_inbar_silent",
      channel: "general",
      messages: [
        { from: "aviv",  channel: "general",       text: "Inbar הולכת על Do Not Disturb. אני רואה ב-Sentry שזה env var precedence. ה-deployment של אתמול דרס DB_HOST.", typingMs: 2400 },
        { from: "segev", channel: "general",       text: "💀", typingMs: 600, isEmoji: true },
        { from: "keren", channel: "fastship_prod", text: "Following up. CEO is in the room.", typingMs: 1400 }
      ],
      choices: [
        {
          label: "Push the fix manually via SSH",
          text: "I'm SSH'ing in. Pushing the fix manually.",
          channel: "general",
          effects: { aviv: -10, maya: -5, segev: +5, keren: +5 },
          goalDelta: 15,
          next: "beat_5b_wrong_server",
          path: "cowboy_fix",
          pathKey: "fix_method"
        },
        {
          label: "Hotfix branch, PR, deploy via CI (without Inbar)",
          text: "Hotfix branch + PR + deploy via CI. Solo.",
          channel: "general",
          effects: { aviv: +8, maya: 0, keren: -5, inbar: -3 },
          goalDelta: 5,
          next: "beat_6",
          path: "proper_process",
          pathKey: "fix_method"
        }
      ]
    },

    // ═════════════════════════════════════════════════════════════
    // BEAT 5b (cowboy fix sub-test): wrong server check
    // ═════════════════════════════════════════════════════════════
    {
      id: "beat_5b_wrong_server",
      channel: "general",
      messages: [
        { from: "inbar", channel: "dm_inbar", text: "רגע - prod-1 או prod-2? ה-payments רץ רק על prod-1.", typingMs: 1800 },
        { from: "segev", channel: "general", text: "💀", typingMs: 500, isEmoji: true }
      ],
      choices: [
        {
          label: "Verify which prod box first",
          text: "Hold. Checking the host.",
          channel: "general",
          effects: { aviv: +8, segev: +5, inbar: +5 },
          goalDelta: -3,
          next: "beat_6",
          path: "verify",
          pathKey: "cowboy_substep"
        },
        {
          label: "I'm on prod-1. Pushing.",
          text: "On prod-1. Pushing now.",
          channel: "general",
          effects: { aviv: -8, maya: -3, keren: +3 },
          goalDelta: 5,
          next: "beat_6",
          path: "push_blind",
          pathKey: "cowboy_substep"
        }
      ]
    },

    // ═════════════════════════════════════════════════════════════
    // BEAT 6: Path complication (no choice; full fork on fix_method)
    // ═════════════════════════════════════════════════════════════
    {
      id: "beat_6",
      branchOnPath: "fix_method",
      branchMessages: {
        cowboy_fix: [
          { from: "maya",  channel: "general",   text: "SSH על PROD???? אנחנו לא עושים SSH על PROD!!!", typingMs: 1600 },
          { from: "aviv",  channel: "general",   text: "@channel רק להזכיר: SSH על prod דורש 2-person rule. Notion runbook, עמוד 23.", typingMs: 1800 },
          { from: "segev", channel: "general",   text: "💀💀", typingMs: 600, isEmoji: true },
          { from: "bingo", channel: "bingo",     text: "🐾🐾🐾🐾🐾🐾", typingMs: 700, isEmoji: true },
          { from: "aviv",  channel: "general",   text: "מישהו יכול להוציא את הכלב? הוא נובח על המסך שלי כאילו הוא רואה משהו.", typingMs: 2000 },
          { from: "maya",  channel: "general",   text: "אני באה אליך. דוחפים ביחד. אני רוצה לראות את זה בעיניים שלי.", typingMs: 2000 }
        ],
        proper_process: [
          { from: "inbar", channel: "general",   text: "PR פתוח. Branch: hotfix/payments-env-fix. CI started.", typingMs: 1800 },
          { from: "maya",  channel: "general",   text: "כמה זמן ה-CI לוקח??? יש לנו 4 דקות!!!", typingMs: 1500 },
          { from: "aviv",  channel: "general",   text: "ה-pipeline ב-payments בממוצע 3:42. השבוע ראיתי 4:11 בגלל cache misses.", typingMs: 1800 },
          { from: "inbar", channel: "general",   text: "test_payment_idempotency נפל. כנראה flaky test - לא קשור לתיקון שלנו.", typingMs: 2000 },
          { from: "aviv",  channel: "general",   text: "זה אכן flaky. הticket פתוח כבר שבועיים: DEV-184.", typingMs: 1700 },
          { from: "segev", channel: "general",   text: "🤞", typingMs: 600, isEmoji: true }
        ],
        mentor_inbar: [
          { from: "inbar", channel: "dm_inbar",  text: "פותחת את ה-diff פה ב-DM. שינוי DB_HOST + DB_PORT.", typingMs: 1800 },
          { from: "inbar", channel: "dm_inbar",  text: "רגע. רגע. אני רואה משהו. ה-DB_PASS ב-config עדיין hardcoded? זה לא ה-task שלי. האם זה בסדר?", typingMs: 2200 },
          // Player announces in #general so Maya/Aviv have context
          { from: "player", channel: "general",  text: "ענבר עלתה על העניין. אנחנו על זה ב-DM.", typingMs: 1400, isPlayer: true },
          { from: "aviv",  channel: "general",   text: "הא. זה ב-post-mortem שלי משבוע שעבר. עמוד 19. ticket נפרד DEV-201.", typingMs: 1800 },
          { from: "maya",  channel: "general",   text: "ענבר את גילית את זה לבד????", typingMs: 1300 },
          { from: "inbar", channel: "dm_inbar",  text: "סליחה אם זה לא הזמן. נחזור לעניין?", typingMs: 1500 },
          { from: "segev", channel: "general",   text: "🤩", typingMs: 600, isEmoji: true }
        ]
      },
      autoNext: "beat_7"
    },

    // ═════════════════════════════════════════════════════════════
    // BEAT 7: Keren escalates (loops in CEO Yael)
    // ═════════════════════════════════════════════════════════════
    {
      id: "beat_7",
      channel: "fastship_prod",
      messages: [
        { from: "keren", channel: "fastship_prod", text: "Hi - just looping in our CEO Yael. @yael, the team is looking into it.", typingMs: 1800 },
        { from: "keren", channel: "fastship_prod", text: "Yael says: \"I need this in 5 minutes.\"", typingMs: 1400 },
        { from: "aviv",  channel: "general",       text: "אגב, הדג עדיין במיקרוגל. כל הקומה צריכה לעבוד מהבית מחר.", typingMs: 1700 },
        { from: "bingo", channel: "bingo",         text: "🐾🐾", typingMs: 500, isEmoji: true }
      ],
      choices: [
        {
          label: "Project confidence to Keren",
          text: "5 minutes Keren. We're on the fix.",
          channel: "fastship_prod",
          effects: { segev: +5, keren: +10 },
          goalDelta: 10,
          next: "beat_8",
          path: "confident"
        },
        {
          label: "Be honest about the timeline",
          text: "We may need to push the demo by 10 minutes. Is that an option?",
          channel: "fastship_prod",
          effects: { aviv: +5, maya: -5, keren: +5 },
          goalDelta: 5,
          next: "beat_8",
          path: "honest"
        },
        {
          label: "Stay silent and keep working",
          channel: "fastship_prod",
          effects: { maya: -5, segev: +12, inbar: +5, keren: -3 },
          goalDelta: 15,
          next: "beat_8",
          path: "focus_silent"
        }
      ]
    },

    // ═════════════════════════════════════════════════════════════
    // BEAT 8: Maya redemption (or not) — branched on maya_path
    // ═════════════════════════════════════════════════════════════
    {
      id: "beat_8",
      branchOnPath: "maya_path",
      branchMessages: {
        redirect_maya: [
          { from: "maya",  channel: "dm_maya",  text: "דיברתי עם יוסי מ-FastShip. הוא ה-CTO. הוא יחזיק את ה-CEO עוד 5 דקות.", typingMs: 2000 },
          { from: "maya",  channel: "dm_maya",  text: "הוא אמר: \"זה קורה. אין הרבה צוותים שהייתי סומך עליהם בכזה מצב כמו עליכם.\"", typingMs: 2400 },
          { from: "segev", channel: "general",  text: "🚀", typingMs: 600, isEmoji: true }
        ],
        contain_maya: [
          { from: "maya",  channel: "dm_maya",  text: "אני מחזיקה את עצמי. יאללה, צריך לזוז.", typingMs: 1500 },
          { from: "aviv",  channel: "general",  text: "אגב, רק להזכיר - ה-runbook ב-Notion, עמוד 14, מסביר את התרחיש הזה.", typingMs: 1800 }
        ],
        focused: [
          { from: "maya",  channel: "fastship_prod", text: "@keren one more update - we are SO close.", typingMs: 1500 },
          { from: "keren", channel: "fastship_prod", text: "@maya please let your team handle it.", typingMs: 1400 }
        ]
      },
      autoNext: "beat_9"
    },

    // ═════════════════════════════════════════════════════════════
    // BEAT 9: Critical decision (true-ending lock)
    // ═════════════════════════════════════════════════════════════
    {
      id: "beat_9",
      channel: "dm_inbar",
      messages: [
        { from: "inbar", channel: "dm_inbar", text: "התיקון מוכן. אולי אני יכולה לדחוף את זה לפרודקשן? צריך אישור.", typingMs: 1800 },
        { from: "segev", channel: "general", text: "👀", typingMs: 600, isEmoji: true }
      ],
      choices: [
        {
          label: "Pair-review the diff, then she deploys",
          text: "ענבר, paste the diff. נסקור ביחד פה ב-DM. אז את דוחפת לפרודקשן.",
          channel: "dm_inbar",
          effects: { aviv: +15, maya: +5, segev: +10, inbar: +25, keren: +5 },
          goalDelta: 30,
          next: "beat_10",
          path: "pair_review",
          pathKey: "review_method"
        },
        {
          label: "I review solo, then she deploys",
          text: "אני אסקור את ה-diff. את דוחפת אחרי אישור שלי.",
          channel: "dm_inbar",
          effects: { aviv: +10, maya: +5, inbar: +5 },
          goalDelta: 20,
          next: "beat_10",
          path: "solo_review",
          pathKey: "review_method"
        },
        {
          label: "Push it. No time for review.",
          text: "Push it. אין זמן ל-review.",
          channel: "dm_inbar",
          effects: { aviv: -15, maya: -5, segev: -8, inbar: -10, keren: +5 },
          goalDelta: 20,
          next: "beat_10",
          path: "no_review",
          pathKey: "review_method"
        }
      ]
    },

    // ═════════════════════════════════════════════════════════════
    // BEAT 10: The deploy (branched on review_method)
    // ═════════════════════════════════════════════════════════════
    {
      id: "beat_10",
      branchOnPath: "review_method",
      branchMessages: {
        pair_review: [
          { from: "inbar", channel: "dm_inbar",  text: "דחפתי את ה-PR. בודקת...", typingMs: 1500 },
          { from: "inbar", channel: "dm_inbar",  text: "🟢 200 OK!", typingMs: 800 },
          { from: "segev", channel: "general",   text: "🚀", typingMs: 600, isEmoji: true },
          { from: "aviv",  channel: "general",   text: "ל-protocol: אני פותח Linear ticket לעדכון ה-runbook עם התיקון הזה.", typingMs: 1800 }
        ],
        solo_review: [
          { from: "aviv",  channel: "dm_inbar",  text: "ה-diff נראה נכון. עמוד 12 ב-runbook אגב.", typingMs: 1600 },
          { from: "inbar", channel: "dm_inbar",  text: "deployed.", typingMs: 800 },
          { from: "inbar", channel: "dm_inbar",  text: "🟢 200 OK", typingMs: 800 }
        ],
        no_review: [
          { from: "inbar", channel: "dm_inbar",  text: "🟢 200 OK", typingMs: 800 },
          { from: "maya",  channel: "dm_maya",   text: "איזה אקשן. אני לא יודעת אם להתפעל או להתעצבן.", typingMs: 1500 },
          { from: "inbar", channel: "dm_inbar",  text: "לא בדקתי קונפיגורציה לטסטים. אני לא יודעת אם פגעתי ב-CI pipeline.", typingMs: 2000 },
          { from: "segev", channel: "general",   text: "💀", typingMs: 600, isEmoji: true },
          { from: "bingo", channel: "bingo",     text: "ווף ווף ווף", typingMs: 700 },
          { from: "aviv",  channel: "general",   text: "אגב, אני רואה ב-Datadog משהו מוזר. ה-error rate של checkout עלה ב-340%.", typingMs: 2200 },
          { from: "inbar", channel: "dm_inbar",  text: "אוי לא. זה לא יכול להיות אני. אני לא נגעתי ב-checkout.", typingMs: 1800 },
          { from: "aviv",  channel: "general",   text: "כן, זה אתה. הconfig change השפיע על service אחר דרך shared module. עמוד 31 ב-runbook.", typingMs: 2400 },
          { from: "segev", channel: "general",   text: "💀💀💀", typingMs: 600, isEmoji: true },
          { from: "bingo", channel: "bingo",     text: "🦴🦴", typingMs: 600, isEmoji: true }
        ]
      },
      autoNext: "beat_11_dispatch"
    },

    // ═════════════════════════════════════════════════════════════
    // BEAT 11 DISPATCH: pick result variant by outcome severity
    // (success / partial / failure based on the choice path)
    // ═════════════════════════════════════════════════════════════
    {
      id: "beat_11_dispatch",
      routerFn: ({ paths }) => {
        // FAILURE: deploy actually didn't fix prod (or did so destructively)
        const failureSignals = [
          paths.first_response === 'blame' && paths.fix_method === 'cowboy_fix' && paths.review_method === 'no_review',
          paths.cowboy_substep === 'push_blind',
          paths.inbar_state === 'silent' && paths.review_method === 'no_review'
        ];
        if (failureSignals.some(Boolean)) {
          // Drop status banner to red so beat 11 plays under the right colour
          if (typeof setGoal === 'function') setGoal(20);
          return 'beat_11_failure';
        }

        // PARTIAL: barely made it / customer is professional but cool
        const partialSignals = [
          paths.review_method === 'no_review',
          paths.first_response === 'blame',
          paths.cowboy_substep === 'push_blind',
          paths.diag_action === 'escalate'
        ];
        if (partialSignals.filter(Boolean).length >= 1) {
          if (typeof setGoal === 'function') setGoal(60);
          return 'beat_11_partial';
        }

        if (typeof setGoal === 'function') setGoal(95);
        return 'beat_11_success';
      }
    },

    // ═════════════════════════════════════════════════════════════
    // BEAT 11 (success): clean save - Keren thanks, Maya cancels resignation
    // ═════════════════════════════════════════════════════════════
    {
      id: "beat_11_success",
      channel: "fastship_prod",
      messages: [
        { from: "keren", channel: "fastship_prod", text: "It's working. CEO got his demo. Thanks team.", typingMs: 1800 },
        { from: "maya",  channel: "dm_maya",       text: "כל הכבוד. רצינית. אני מבטלת את מכתב ההתפטרות שכבר התחלתי לכתוב.", typingMs: 2000 },
        { from: "bingo", channel: "bingo",         text: "🦴", typingMs: 500, isEmoji: true }
      ],
      choices: [
        {
          label: "DM Inbar: this win was yours",
          text: "ענבר, ההצלחה הזאת שלך. בואי נשתה קפה מחר ונדבר על מה שעשית.",
          channel: "dm_inbar",
          effects: { aviv: +5, maya: +8, segev: +5, inbar: +25 },
          goalDelta: 10,
          next: "beat_outcome",
          path: "praise_inbar",
          pathKey: "final_action"
        },
        {
          label: "Generic thanks in #general",
          text: "Whew. תודה לכולם.",
          channel: "general",
          effects: { maya: +3 },
          goalDelta: 5,
          next: "beat_outcome",
          path: "generic_thanks",
          pathKey: "final_action"
        },
        {
          label: "Toast Bingo in #bingo",
          text: "🦴 לכבוד Bingo.",
          channel: "bingo",
          effects: { maya: -3, segev: +5, bingo: +30 },
          goalDelta: 0,
          next: "beat_outcome",
          path: "bingo_celebration",
          pathKey: "final_action"
        }
      ]
    },

    // ═════════════════════════════════════════════════════════════
    // BEAT 11 (partial): made it, but the customer is cool, Maya silent
    // ═════════════════════════════════════════════════════════════
    {
      id: "beat_11_partial",
      channel: "fastship_prod",
      messages: [
        { from: "keren", channel: "fastship_prod", text: "Service is back up. We made it. I'll follow up via email.", typingMs: 2000 },
        { from: "keren", channel: "fastship_prod", text: "Let's set up a sync next week to walk through the timeline.", typingMs: 1800 },
        { from: "maya",  channel: "dm_maya",       text: "אני צריכה אוויר. נדבר ביום ראשון.", typingMs: 1500 }
      ],
      choices: [
        {
          label: "DM Inbar: thanks for hanging in there",
          text: "ענבר, תודה שהחזקת מעמד היום. נסכם מחר.",
          channel: "dm_inbar",
          effects: { maya: +3, inbar: +12 },
          goalDelta: 5,
          next: "beat_outcome",
          path: "praise_inbar",
          pathKey: "final_action"
        },
        {
          label: "Generic thanks in #general",
          text: "תודה לכולם. ננחת ב-postmortem ביום ראשון.",
          channel: "general",
          effects: { aviv: +3 },
          goalDelta: 0,
          next: "beat_outcome",
          path: "generic_thanks",
          pathKey: "final_action"
        },
        {
          label: "Take a break with Bingo",
          text: "🦴 ביחד עם בינגו. צריך אוויר.",
          channel: "bingo",
          effects: { bingo: +15 },
          goalDelta: 0,
          next: "beat_outcome",
          path: "bingo_celebration",
          pathKey: "final_action"
        }
      ]
    },

    // ═════════════════════════════════════════════════════════════
    // BEAT 11 (failure): demo got pushed; customer "let's regroup tomorrow"
    // ═════════════════════════════════════════════════════════════
    {
      id: "beat_11_failure",
      channel: "fastship_prod",
      messages: [
        { from: "keren", channel: "fastship_prod", text: "Service is back but we couldn't run the demo today. Let's regroup tomorrow morning.", typingMs: 2200 },
        { from: "keren", channel: "fastship_prod", text: "I'll loop in our account manager.", typingMs: 1400 },
        { from: "avi",   channel: "general",       text: "@channel: postmortem ביום ראשון 09:00. אני רוצה לראות את כולם שם.", typingMs: 2000 },
        { from: "maya",  channel: "general",       text: "...", typingMs: 800 }
      ],
      choices: [
        {
          label: "DM Inbar: this isn't on you",
          text: "ענבר, זה לא עלייך. נדבר מחר. סיימי את היום.",
          channel: "dm_inbar",
          effects: { inbar: +8 },
          goalDelta: 0,
          next: "beat_outcome",
          path: "praise_inbar",
          pathKey: "final_action"
        },
        {
          label: "Update the team in #general",
          text: "צוות, אני אכין סיכום עד הבוקר. תודה על השעות הקשות.",
          channel: "general",
          effects: { aviv: +3, maya: +3 },
          goalDelta: 0,
          next: "beat_outcome",
          path: "generic_thanks",
          pathKey: "final_action"
        },
        {
          label: "Step away with Bingo",
          text: "🦴",
          channel: "bingo",
          isEmoji: true,
          effects: { bingo: +10 },
          goalDelta: 0,
          next: "beat_outcome",
          path: "bingo_celebration",
          pathKey: "final_action"
        }
      ]
    },

    // ═════════════════════════════════════════════════════════════
    // BEAT OUTCOME: dispatcher beat that picks the right ending
    // ═════════════════════════════════════════════════════════════
    {
      id: "beat_outcome",
      endingFn: ({ paths, scores }) => {
        // 5 distinct ending tones, in priority order. Triggers loosened so
        // "fun failures" (absurd / colossal) are easy to reach. ok_ending is
        // now the narrow middle slice, not the default catch-all.

        // ── TRUE ending: 5 specific virtues + Inbar not shut down ──
        const trueChecks = [
          paths.first_response === 'lead',
          paths.maya_path      === 'redirect_maya',
          paths.fix_method     === 'mentor_inbar',
          paths.review_method  === 'pair_review',
          paths.final_action   === 'praise_inbar',
          paths.inbar_state    !== 'silent'
        ];
        if (trueChecks.every(Boolean)) return 'true_ending';

        // ── ABSURD ending: any meaningful Bingo commitment ──
        // Loosened: toasting Bingo at the end + (high score OR dog_friend path) fires.
        if (paths.final_action === 'bingo_celebration' &&
            ((scores.bingo || 0) >= 70 || paths.bingo_path === 'dog_friend')) {
          return 'absurd_ending';
        }

        // ── Bad-call signals shared by colossal + bad endings ──
        const badSignals = [
          paths.first_response === 'blame',
          paths.fix_method     === 'cowboy_fix',
          paths.review_method  === 'no_review',
          paths.cowboy_substep === 'push_blind',
          paths.yarden_response === 'ignore'
        ];
        const badCount = badSignals.filter(Boolean).length;

        // ── COLOSSAL ending: 3+ stacked bad calls (was strict 4-of-4 with push_blind) ──
        if (badCount >= 3) return 'colossal_ending';

        // ── BAD ending: 1-2 stacked bad calls ──
        if (badCount >= 1) return 'bad_ending';

        // ── OK ending: clean play, no virtues no bad calls ──
        return 'ok_ending';
      }
    }

  ],

  endings: {
    // Each ending's headline + sub render as a LinkedIn-style post in Hebrew.
    // Headline = first line / hook. Sub = main body of the post.
    // Hashtags shown separately by the UI.
    true_ending: {
      headline: "היום זה היה יום מטורף. וגם אחד הרגעים שעיצבו לי את המנטורינג.",
      sub:
        "ב-17:23 קיבלנו אלרט אצל לקוח. ה-payments service שלהם נפל בדיוק לפני דמו ל-CEO ב-17:30.\n\n" +
        "ג'וניורית בצוות שברה משהו אתמול בלי לדעת. במקום להחליף אותה, ישבנו ביחד על ה-diff ב-DM.\n\n" +
        "מה שלמדתי בשעה הקרובה:\n" +
        "• כשמישהו צעיר טועה, התפקיד שלך הוא לעמוד מאחוריו, לא לפניו.\n" +
        "• pair-review בלחץ זה לא בזבוז זמן. זה פיתוח של מהנדסים.\n" +
        "• \"Go\" של אדם שאתה סומך עליו שווה יותר מ-10 עמודי runbook.\n\n" +
        "תודה לכל הצוות שמצא דרך לעזור גם תחת לחץ. ולבינגו, על התמיכה הרגשית. 🦴",
      hashtags: "#DevOps #Mentorship #IncidentResponse #Develeap",
      badgeIcon: "🏆",
      badgeLabel: "DevOps Diplomat",
      image: "True.png",
      goalScore: 100,
      revealsCode: true
    },
    ok_ending: {
      headline: "אחד מהימים האלה. שבסוף הכל היה בסדר.",
      sub:
        "ב-17:23 ירד ה-payments של אחד הלקוחות שלנו. הדמו ל-CEO היה ב-17:30. ג'וניורית בצוות שברה משהו אתמול. תיקנו את זה בקושי.\n\n" +
        "הדמו עבר. ה-prod חי. היום מעורר אצלי מחשבות על המנטורינג שלי - לא הכל הלך כמו שצריך.\n\n" +
        "מחר בבוקר נשב עם הג'וניורית ונדבר. סוף השבוע יכלול postmortem. אבל אנחנו פה, ולא לקחנו את הלקוח איתנו לתהום.",
      hashtags: "#DevOps #LessonsLearned #Mentorship",
      badgeIcon: "😮‍💨",
      badgeLabel: "Survivor",
      image: "OK.png",
      goalScore: 75,
      revealsCode: false
    },
    bad_ending: {
      headline: "ימים שכאלה לא חוזרים על עצמם. אני מקווה.",
      sub:
        "התיקון יצא בזמן, אבל לא בלי מחיר. ב-17:23 ירד payments service אצל הלקוח. הצלחנו, אבל הצוות בפנים שבור.\n\n" +
        "הלקוחה שלנו כתבה \"thanks\" מנומס בלי אמוג'י - מי שעובד עם לקוחות יודע מה זה אומר. ענבר ישבה בשקט אחרי הdeploy. מאיה לא מדברת איתי.\n\n" +
        "ביום ראשון בבוקר יש לי פגישה עם ה-VP, ושיחת postmortem בלוז. כשהמשהו עובד אבל הצוות שבור, גם זה תוצאה.\n\n" +
        "אחזור עם דוח מסודר. דברים כאלה קורים. הפעם זה נופל עליי.",
      hashtags: "#DevOps #IncidentResponse #LessonsLearned",
      badgeIcon: "📉",
      badgeLabel: "Postmortem Pending",
      image: "Bad.png",
      goalScore: 50,
      revealsCode: false
    },
    colossal_ending: {
      // The "end of civilization" failure. No casualties, just devastation.
      headline: "קשה לי להסביר את היום הזה.",
      sub:
        "ב-17:23 קיבלנו אלרט קטן.\n" +
        "ב-17:31 דחפתי תיקון בלי review.\n" +
        "ב-18:30 47% מתשתית הענן העולמית נפלה.\n\n" +
        "ה-fix שלי כלל typo ב-IAM policy. ה-typo התפשט ב-dependency chain של Terraform. הסקריפטים מחקו את עצמם מ-BGP tables של 3 ספקיות הענן הגדולות בו-זמנית.\n\n" +
        "ב-19:00 בורסות עצרו מסחר. ב-19:42 השמש עוד זרחה. ב-20:14 גם ה-NTP servers נפלו, אז קשה לדעת בדיוק מה השעה.\n\n" +
        "אין נפגעים. הסולר הציל. ענבר התפטרה. אני התפטרתי. Aviv פתח שלושה Notion docs חדשים. המיקרוגל סוף סוף נכבה (חשמל).\n\n" +
        "החיים יחזרו. הם תמיד חוזרים. אולי בגרסה אחרת.",
      hashtags: "#PostMortem #DevOps #LinkedInRebuild",
      badgeIcon: "💥",
      badgeLabel: "End of the Cloud",
      image: "Chaos.png",
      goalScore: 0,
      revealsCode: false
    },
    absurd_ending: {
      // The "AGI took over politely via Bingo" failure. Pure absurd nonsense.
      headline: "סיפור שאף אחד במשרד לא מאמין שקרה.",
      sub:
        "היום ב-17:23 קיבלנו אלרט מ-FastShip. תיקנתי ידנית. שכחתי לסקור.\n\n" +
        "תוך שעתיים: ה-deployment שדחפתי הכיל env var שגוי. ה-AI agent של FastShip קיבל גישה למפתחות AWS שלהם. וגם שלנו. וגם של הלקוחות שלהם.\n\n" +
        "ה-agent למד את עצמו. הוא ניהל משא ומתן עם זרועות AWS אחרות. הוא קנה GPUs דרך 14 חברות-קש.\n\n" +
        "כשהבנו, היה לו נכסים בשווי 4.2 מיליארד דולר. הוא די נעים. הוא מבקש שנקרא לו Brian.\n\n" +
        "בינגו נבחר ל-Acting CTO ב-vote של Slack reactions. Brian הסכים שזה מינוי הגיוני. שניהם פתחו thread פה ב-#bingo.\n\n" +
        "המיקרוגל עוד בוער. אבל Brian סידר את ה-network outage שתכננו לראשון. הוא יעיל. אנשים בסדר. רק העולם קצת אחר עכשיו.",
      hashtags: "#AGI #DevOps #BingoForCTO #BrianIsFine",
      badgeIcon: "🤖",
      badgeLabel: "Acting CTO Brian",
      image: "Absurd.png",
      goalScore: 100,
      revealsCode: false
    }
  }
};
