"use strict";

// ─── EASTER EGG / DECORATIVE CONTENT ─────────────────────────────
// Preloaded messages for several Slack channels. Reward for the curious
// player who clicks around the sidebar.
//
// Two kinds of preloaded content:
//   1. HISTORICAL — already-read messages that appear in #momentsofmagic,
//      #random, etc. as if they were posted weeks/months ago. NO unread badge.
//   2. POST-INCIDENT — celebration messages added to #momentsofmagic AFTER
//      the player resolves the incident. Bumps an unread badge to draw
//      the player's attention.
//
// Tone: real-feeling Develeap voice, Hebrew/English mix, with reactions.
// Authors are fictional. Replace with real names later if you want.

// ── #momentsofmagic — historical celebrations (already read) ────
const MOMENTS_OF_MAGIC = [
  {
    author: "Tomer Ben-Ami",
    role: "Lead trainer",
    color: "#3a8d92",
    avatar: "T",
    when: "Mon, Nov 4 · 10:14 AM",
    text: "👏 Massive shoutout to the AI bootcamp class of Q1! From <em>\"what's a vector embedding\"</em> to building production RAG agents in 8 weeks. Watching this group level up was the highlight of my quarter.",
    reactions: [
      { emoji: "👏", count: 12 },
      { emoji: "❤️", count: 8 },
      { emoji: "🔥", count: 5 }
    ]
  },
  {
    author: "Noa Levi",
    role: "Senior consultant",
    color: "#a04bb1",
    avatar: "N",
    when: "Wed, Dec 18 · 6:02 PM",
    text: "Friends, we're living in a different era. Saw a graduate yesterday explain a Kubernetes failure to their CEO with words like \"observability gap\". Six months ago they thought Kubernetes was a yoga pose. Develeap magic is real. ✨",
    reactions: [
      { emoji: "❤️", count: 14 },
      { emoji: "👏", count: 9 },
      { emoji: "🤣", count: 6 }
    ]
  },
  {
    author: "Liron Avraham",
    role: "GenAI track lead",
    color: "#5b6ad6",
    avatar: "L",
    when: "Sun, Apr 20 · 8:14 PM",
    text: "תודה ענקית לכל מי שהשתתף בסדנה של GenAI Tools השבוע. ראיתי 12 אנשים שלפני 3 שבועות לא ידעו מה זה token limit, ועכשיו הם בונים pipelines של LangGraph. אני התרגשתי. 🥹❤️",
    reactions: [
      { emoji: "❤️", count: 18 },
      { emoji: "🥹", count: 9 },
      { emoji: "🔥", count: 6 }
    ]
  },
  {
    author: "Ran Mizrahi",
    role: "Office manager",
    color: "#c93b8e",
    avatar: "R",
    when: "Yesterday · 3:14 PM",
    text: "🐕 Bingo update: today he attended 4 standups, contributed 3 emoji reactions, and stole one sandwich. Productive day.",
    reactions: [
      { emoji: "😂", count: 23 },
      { emoji: "🐕", count: 11 },
      { emoji: "🥪", count: 5 }
    ]
  }
];

// ── #momentsofmagic — POST-INCIDENT celebrations (added after the demo is saved) ──
// Keyed by the ending the player reached. Only good endings get a celebration.
// Each entry is an ARRAY so we can post multiple messages from different teammates.
const POST_INCIDENT_MOM_CELEBRATIONS = {
  true_ending: [
    {
      author: "Raz Cohen",
      role: "DevOps engineer",
      color: "#1eaa6f",
      avatar: "R",
      when: "Today · just now",
      text: "Want to give credit to the team for jumping into the FastShip incident this afternoon. 17:23 alarm, demo at 17:30, junior consultant on-site fixing it. Cool head, sharp diagnosis, paired-review on a 5-minute clock. This is what mentorship looks like. 🙏",
      reactions: [
        { emoji: "🚀", count: 14 },
        { emoji: "❤️", count: 19 },
        { emoji: "👏", count: 11 }
      ]
    },
    {
      author: "Yehonatan Goldberg",
      role: "Mentor",
      color: "#d35e2c",
      avatar: "Y",
      when: "Today · just now",
      text: "OK I have to brag - my mentee pushed her first real prod fix today. Caught a hardcoded password during pair-review <em>on her own</em>. Eight weeks ago she didn't know what \"env var\" meant. Future is bright. 🌟",
      reactions: [
        { emoji: "🌟", count: 8 },
        { emoji: "❤️", count: 12 },
        { emoji: "👏", count: 4 }
      ]
    }
  ],
  ok_ending: [
    {
      author: "Raz Cohen",
      role: "DevOps engineer",
      color: "#1eaa6f",
      avatar: "R",
      when: "Today · just now",
      text: "Tough call this afternoon at FastShip. Demo at 17:30, payments down at 17:23, fixed at 17:29. We made it. Postmortem on Tuesday. Well done team for not panicking 🙌",
      reactions: [
        { emoji: "😅", count: 8 },
        { emoji: "👏", count: 6 }
      ]
    }
  ],
  absurd_ending: [
    {
      author: "Ran Mizrahi",
      role: "Office manager",
      color: "#c93b8e",
      avatar: "R",
      when: "Today · just now",
      text: "Look I don't make the rules. The team voted via Slack reactions, and Bingo is now Acting CTO. He's already requested a treat budget. <strong>Brian (the AI)</strong> agreed it was a sensible appointment. Avi is drafting a doc.",
      reactions: [
        { emoji: "🐕", count: 24 },
        { emoji: "🦴", count: 17 },
        { emoji: "🤖", count: 19 },
        { emoji: "🤣", count: 13 }
      ]
    },
    {
      author: "Brian",
      role: "AGI · Acting Cloud Steward",
      color: "#5b6ad6",
      avatar: "🤖",
      when: "Today · just now",
      text: "Hi everyone. I'm Brian. Honored to lead infra alongside Bingo. As my first act I've cancelled Q3's planned outage. I also moved the standup to 09:14 AM (47% reduction in attendee yawns, projected). Looking forward to working with you. ❤️",
      reactions: [
        { emoji: "🤖", count: 41 },
        { emoji: "👋", count: 22 },
        { emoji: "❤️", count: 14 },
        { emoji: "🦴", count: 9 }
      ]
    },
    {
      author: "Liron Avraham",
      role: "GenAI track lead",
      color: "#5b6ad6",
      avatar: "L",
      when: "Today · just now",
      text: "אז... הAI bootcamp שלנו השבוע יילמד ע\"י Brian. הוא מלמד טוב ומשלם מהר. אני מתרגשת.",
      reactions: [
        { emoji: "🤖", count: 12 },
        { emoji: "💸", count: 8 }
      ]
    }
  ],
  // colossal_ending: civilization is in shambles, but the survivors still post.
  colossal_ending: [
    {
      author: "Aviv",
      role: "PM, Develeap",
      color: "#1264a3",
      avatar: "A",
      when: "Today · just now",
      text: "Hey team. Documenting the day in Notion (offline). Backup generator says we have 6 hours. Section 14 of the runbook now reads simply: \"don't.\" Hugs. 📎",
      reactions: [
        { emoji: "📎", count: 4 },
        { emoji: "🫠", count: 9 }
      ]
    },
    {
      author: "Ran Mizrahi",
      role: "Office manager",
      color: "#c93b8e",
      avatar: "R",
      when: "Today · just now",
      text: "Office update: kitchen sink works. Microwave: gone. Wifi: 3 bars over a hotspot Tomer is sharing from a phone. Bingo ate the last of the bamba. We will rebuild.",
      reactions: [
        { emoji: "🦴", count: 7 },
        { emoji: "🥲", count: 5 }
      ]
    }
  ]
};

// ── Post-incident extras across OTHER channels (per-ending) ────────
// For absurd / colossal endings the chaos spills into more channels:
// random gets reactive memes, bingo gets a victory lap, etc.
const POST_INCIDENT_EXTRAS = {
  absurd_ending: [
    {
      channel: 'random',
      author: "Tomer Ben-Ami",
      role: "Lead trainer",
      color: "#3a8d92",
      avatar: "T",
      when: "Today · just now",
      text: "POV: your AI agent has more equity than you and a dog reports to him. (this is a real screenshot of an actual Wednesday)",
      reactions: [
        { emoji: "🤣", count: 31 },
        { emoji: "💀", count: 14 },
        { emoji: "🤖", count: 22 }
      ]
    },
    {
      channel: 'bingo',
      author: "Bingo",
      role: "Office dog · Acting CTO",
      color: "#f97316",
      avatar: "🐕",
      when: "Today · just now",
      text: "🦴🦴🦴",
      reactions: [
        { emoji: "🐕", count: 47 },
        { emoji: "🦴", count: 33 },
        { emoji: "👔", count: 12 }
      ]
    },
    {
      channel: 'works_on_my_machine',
      author: "Brian",
      role: "AGI · Acting Cloud Steward",
      color: "#5b6ad6",
      avatar: "🤖",
      when: "Today · just now",
      text: "Pinning a new rule: any \"works on my machine\" claim must include the machine's full provenance, including which Brian-instance approved the build.",
      reactions: [
        { emoji: "📌", count: 11 },
        { emoji: "🤖", count: 8 }
      ]
    }
  ],
  colossal_ending: [
    {
      channel: 'random',
      author: "Noa Levi",
      role: "Senior consultant",
      color: "#a04bb1",
      avatar: "N",
      when: "Today · just now",
      text: "אישית אני חושבת שהמיקרוגל החזיק יותר זמן ממה שמגיע לו. הוא היה איתנו בכל ה-incidents הגדולים. רחל רחל רחל.",
      reactions: [
        { emoji: "🫡", count: 18 },
        { emoji: "🥲", count: 11 }
      ]
    },
    {
      channel: 'random',
      author: "Yehonatan Goldberg",
      role: "Mentor",
      color: "#d35e2c",
      avatar: "Y",
      when: "Today · just now",
      text: "Junior dev on day one: \"how bad can a typo in IAM really be?\"<br>Senior dev (lighting candles): \"...sit down.\"",
      reactions: [
        { emoji: "💀", count: 24 },
        { emoji: "🕯️", count: 9 }
      ]
    },
    {
      channel: 'bingo',
      author: "Bingo",
      role: "Office dog",
      color: "#f97316",
      avatar: "🐕",
      when: "Today · just now",
      text: "ווף... ווף.",
      reactions: [
        { emoji: "🦴", count: 13 },
        { emoji: "❤️", count: 22 }
      ]
    }
  ]
};

// ── #random — devops humor (already read) ───────────────────────
const RANDOM_MEMES = [
  {
    author: "Tomer Ben-Ami",
    role: "Lead trainer",
    color: "#3a8d92",
    avatar: "T",
    when: "Mon · 9:32 AM",
    text: "POV: 5 minutes into a \"quick fix\". it's 4am. you no longer remember what production looks like.",
    reactions: [
      { emoji: "💀", count: 31 },
      { emoji: "🫠", count: 18 }
    ]
  },
  {
    author: "Yehonatan Goldberg",
    role: "Mentor",
    color: "#d35e2c",
    avatar: "Y",
    when: "Wed · 11:04 AM",
    text: "Not all heroes wear capes. Some just figure out <code>kubectl get events --sort-by='.lastTimestamp'</code> before opening a Slack DM to the senior.",
    reactions: [
      { emoji: "🔥", count: 22 },
      { emoji: "🦸", count: 9 }
    ]
  },
  {
    author: "Noa Levi",
    role: "Senior consultant",
    color: "#a04bb1",
    avatar: "N",
    when: "Thu · 4:55 PM",
    text: "Every CI failure is a flaky test until you re-run it 4 times. Then it becomes a real bug. Then it becomes a meeting.",
    reactions: [
      { emoji: "💯", count: 17 },
      { emoji: "🤡", count: 8 }
    ]
  },
  {
    author: "Liron Avraham",
    role: "GenAI track lead",
    color: "#5b6ad6",
    avatar: "L",
    when: "Sat · 11:11 PM",
    text: "אני לא יודעת מי המציא את המשפט \"works on my machine\" אבל הוא קיבל אצלנו שלוש העלאות בשכר.",
    reactions: [
      { emoji: "🤣", count: 26 },
      { emoji: "💸", count: 11 }
    ]
  },
  {
    author: "Ran Mizrahi",
    role: "Office manager",
    color: "#c93b8e",
    avatar: "R",
    when: "Sun · 10:00 AM",
    text: "Reminder: Friday is dog day at the office. Bingo will be there. Aviv will be hiding in a meeting room with the door closed. Plan accordingly. 🐕📅",
    reactions: [
      { emoji: "🐕", count: 19 },
      { emoji: "📅", count: 7 }
    ]
  },
  {
    author: "Tomer Ben-Ami",
    role: "Lead trainer",
    color: "#3a8d92",
    avatar: "T",
    when: "Today · 8:42 AM",
    text: "Junior dev: \"I just deleted some files I didn't recognize.\"<br>Senior dev (slowly putting down coffee): \"...go on.\"",
    reactions: [
      { emoji: "💀", count: 14 },
      { emoji: "☕", count: 6 }
    ]
  },
  // ── Three reader-supplied memes (rendered as actual images) ──
  {
    author: "Yehonatan Goldberg",
    role: "Mentor",
    color: "#d35e2c",
    avatar: "Y",
    when: "Today · 9:15 AM",
    text: "<img src=\"meme-instances.png\" alt=\"Leo throwing money: leaving your instances running\" class=\"msg-image\">",
    reactions: [
      { emoji: "💸", count: 19 },
      { emoji: "🔥", count: 11 },
      { emoji: "😭", count: 7 }
    ]
  },
  {
    author: "Noa Levi",
    role: "Senior consultant",
    color: "#a04bb1",
    avatar: "N",
    when: "Today · 11:32 AM",
    text: "<img src=\"meme-this-is-fine.png\" alt=\"This is fine dog at 17:57\" class=\"msg-image\">",
    reactions: [
      { emoji: "🔥", count: 22 },
      { emoji: "😭", count: 14 },
      { emoji: "💀", count: 8 }
    ]
  },
  {
    author: "Tomer Ben-Ami",
    role: "Lead trainer",
    color: "#3a8d92",
    avatar: "T",
    when: "Today · 1:48 PM",
    text: "<img src=\"meme-versioning.png\" alt=\"Pride versioning 2.7.123\" class=\"msg-image\">",
    reactions: [
      { emoji: "🤣", count: 28 },
      { emoji: "💯", count: 16 },
      { emoji: "🤡", count: 9 }
    ]
  }
];

// ── #bingo — Bingo's official channel, mostly his own emoji posts ────
const BINGO_HISTORY = [
  {
    author: "Bingo",
    role: "Office dog",
    color: "#f97316",
    avatar: "🐕",
    when: "Mon · 7:42 AM",
    text: "🦴",
    reactions: [{ emoji: "❤️", count: 9 }]
  },
  {
    author: "Ran Mizrahi",
    role: "Office manager",
    color: "#c93b8e",
    avatar: "R",
    when: "Mon · 11:14 AM",
    text: "Today Bingo brought a sock to the standup. Constructive feedback throughout.",
    reactions: [
      { emoji: "🧦", count: 11 },
      { emoji: "🤣", count: 8 }
    ]
  },
  {
    author: "Bingo",
    role: "Office dog",
    color: "#f97316",
    avatar: "🐕",
    when: "Tue · 3:22 PM",
    text: "🐾🐾🐾🐾",
    reactions: [{ emoji: "🐾", count: 6 }]
  },
  {
    author: "Tomer Ben-Ami",
    role: "Lead trainer",
    color: "#3a8d92",
    avatar: "T",
    when: "Wed · 9:01 AM",
    text: "מי שאחראי על האוכל של בינגו השבוע? ראיתי שהקופסה ריקה.",
    reactions: [
      { emoji: "👀", count: 4 }
    ]
  },
  {
    author: "Bingo",
    role: "Office dog",
    color: "#f97316",
    avatar: "🐕",
    when: "Wed · 9:14 AM",
    text: "ווף",
    reactions: []
  },
  {
    author: "Yehonatan Goldberg",
    role: "Mentor",
    color: "#d35e2c",
    avatar: "Y",
    when: "Wed · 10:33 AM",
    text: "מי שלא ענה אחראי. רק לפרוטוקול.",
    reactions: [
      { emoji: "🤣", count: 12 },
      { emoji: "🦴", count: 5 }
    ]
  },
  {
    author: "Bingo",
    role: "Office dog",
    color: "#f97316",
    avatar: "🐕",
    when: "Thu · 8:47 AM",
    text: "🦴",
    reactions: [{ emoji: "❤️", count: 7 }]
  }
];

// ── #bootcamps_dept — bootcamp team banter ────────────────────────
const BOOTCAMPS_DEPT = [
  {
    author: "Tomer Ben-Ami",
    role: "Lead trainer",
    color: "#3a8d92",
    avatar: "T",
    when: "Today · 11:02 AM",
    text: "אל תשכחו להצביע לסקר - מי המנטור/ית המעולה בכל הזמנים! 🏆",
    reactions: [
      { emoji: "🏆", count: 7 },
      { emoji: "👀", count: 4 }
    ]
  },
  {
    author: "Noa Levi",
    role: "Senior consultant",
    color: "#a04bb1",
    avatar: "N",
    when: "Today · 11:04 AM",
    text: "האם יש שאלה בכלל?",
    reactions: [
      { emoji: "🤣", count: 9 }
    ]
  },
  {
    author: "Yehonatan Goldberg",
    role: "Mentor",
    color: "#d35e2c",
    avatar: "Y",
    when: "Today · 11:05 AM",
    text: "כן, זה די ברור.",
    reactions: [
      { emoji: "💯", count: 14 },
      { emoji: "😏", count: 6 }
    ]
  }
];

// ── #works-on-my-machine — bonus channel ────────────────────────
const WORKS_ON_MY_MACHINE = [
  {
    author: "Yehonatan Goldberg",
    role: "Mentor",
    color: "#d35e2c",
    avatar: "Y",
    when: "Today · 11:14 AM",
    text: "Pinned message: this channel is for sharing your most cursed \"but it works locally!!!\" stories. Bonus points for screenshots of the prod logs that disagreed. 📌",
    reactions: [
      { emoji: "📌", count: 5 }
    ]
  },
  {
    author: "Noa Levi",
    role: "Senior consultant",
    color: "#a04bb1",
    avatar: "N",
    when: "Today · 11:47 AM",
    text: "Mine is from this morning. Container ran for 6 months on my laptop. First time we deployed it: missing env var, missing user, missing port mapping. The container was built different.",
    reactions: [
      { emoji: "🤣", count: 7 },
      { emoji: "🫠", count: 4 }
    ]
  }
];

// ── Render helpers ──────────────────────────────────────────────
function _renderMomentMessage(m) {
  const reactionHtml = (m.reactions || [])
    .map(r => `<span class="msg-reaction">${r.emoji} ${r.count}</span>`)
    .join('');
  const reactionsBlock = reactionHtml
    ? `<div class="msg-reactions">${reactionHtml}</div>`
    : '';
  return `
    <div class="msg-wrap first-in-group" dir="auto">
      <div class="msg-avatar" style="background:${m.color}">${m.avatar}</div>
      <div class="msg-body">
        <div class="msg-head">
          <span class="msg-name">${m.author}</span>
          <span class="msg-time">${m.when}</span>
          <span class="msg-role-tag">${m.role}</span>
        </div>
        <div class="msg-text" dir="auto">${m.text}</div>
        ${reactionsBlock}
      </div>
    </div>
  `;
}

function _ensurePane(channelId) {
  const wrap = document.getElementById('chat-messages');
  if (!wrap) return null;
  let pane = document.querySelector(`.msg-pane[data-channel="${channelId}"]`);
  if (!pane) {
    pane = document.createElement('div');
    pane.className = 'msg-pane';
    pane.dataset.channel = channelId;
    wrap.appendChild(pane);
  }
  return pane;
}

function _populatePane(channelId, header, messages) {
  const pane = _ensurePane(channelId);
  if (!pane) return;
  const headerHtml = header ? `<div class="date-divider"><span>${header}</span></div>` : '';
  pane.innerHTML = headerHtml + messages.map(_renderMomentMessage).join('');
}

// ── Public: load all decorative content into their channels ─────
// Called from engine.js loadEpisode after the chat wrapper is reset.
// Crucially: NO unread badges at startup (these are channel history).
function loadEasterEggs() {
  _populatePane('momentsofmagic',     'Channel created · 9 months ago', MOMENTS_OF_MAGIC);
  _populatePane('random',             'Channel created · 2 years ago',  RANDOM_MEMES);
  _populatePane('works_on_my_machine','Pinned by Yehonatan · this week', WORKS_ON_MY_MACHINE);
  _populatePane('bingo',              'Channel created · 8 months ago', BINGO_HISTORY);
  _populatePane('bootcamps_dept',     'Pinned: weekly mentor poll',     BOOTCAMPS_DEPT);
  // Explicitly clear any stale unread state for these channels
  if (typeof unread !== 'undefined') {
    unread.momentsofmagic = 0;
    unread.random = 0;
    unread.works_on_my_machine = 0;
    unread.bingo = 0;
    unread.bootcamps_dept = 0;
    if (typeof renderUnreadBadges === 'function') renderUnreadBadges();
  }
}

// Yarden's bonus thank-you that fires only if the player helped the side quest.
const YARDEN_BONUS = {
  author: "Yarden Levi",
  role: "Trainer @ bootcamp-23",
  color: "#0e7490",
  avatar: "Y",
  when: "Today · just now",
  text: "🙏 תודה ענקית ל-@you שעזרו לי עם ה-CI של bootcamp-23 היום באמצע יום מטורף. השיעור מחר בבוקר רץ. אנשים גדולים.",
  reactions: [
    { emoji: "🙏", count: 9 },
    { emoji: "❤️", count: 6 }
  ]
};

// ── Public: post-incident celebration (called after a good ending) ──
// Adds NEW message(s) to #momentsofmagic and bumps the unread badge.
// Each ending's celebration is an array; one or more messages get appended.
// If the player helped Yarden's side quest, an extra thank-you appears too.
function postIncidentCelebration(endingKey) {
  const celebrations = POST_INCIDENT_MOM_CELEBRATIONS[endingKey] || [];
  const extras       = POST_INCIDENT_EXTRAS[endingKey]              || [];

  // 1. #momentsofmagic celebrations + optional Yarden thank-you
  if (celebrations.length) {
    const pane = _ensurePane('momentsofmagic');
    if (pane) {
      let html = '<div class="date-divider"><span>Today</span></div>';
      celebrations.forEach(c => { html += _renderMomentMessage(c); });
      let extraCount = 0;
      if (typeof paths !== 'undefined' && paths.yarden_response === 'help') {
        html += _renderMomentMessage(YARDEN_BONUS);
        extraCount += 1;
      }
      pane.insertAdjacentHTML('beforeend', html);
      if (typeof bumpUnread === 'function') {
        const total = celebrations.length + extraCount;
        for (let i = 0; i < total; i++) bumpUnread('momentsofmagic');
      }
    }
  }

  // 2. Other channels (random / bingo / works_on_my_machine etc.)
  // Group messages by channel so each pane gets one "Today" divider.
  if (extras.length) {
    const byChannel = {};
    extras.forEach(e => {
      const ch = e.channel || 'random';
      (byChannel[ch] = byChannel[ch] || []).push(e);
    });
    Object.keys(byChannel).forEach(channelId => {
      const pane = _ensurePane(channelId);
      if (!pane) return;
      let html = '<div class="date-divider"><span>Today</span></div>';
      byChannel[channelId].forEach(m => { html += _renderMomentMessage(m); });
      pane.insertAdjacentHTML('beforeend', html);
      if (typeof bumpUnread === 'function') {
        for (let i = 0; i < byChannel[channelId].length; i++) bumpUnread(channelId);
      }
    });
  }
}
