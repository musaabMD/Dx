import { EXAMS } from "./exams";

export type Message = {
  id: string;
  examSlug: string;
  channelKey?: string;
  userId: string;
  username: string;
  avatarColor: string;
  text: string;
  dmToUserId?: string;
  dmToUsername?: string;
  replyTo?: {
    id: string;
    username: string;
    text: string;
  };
  createdAt: number;
};

type Subscriber = (msg: Message) => void;

type Store = {
  messages: Map<string, Message[]>;
  subscribers: Map<string, Set<Subscriber>>;
  liveOffsets: Map<string, number>;
  liveTickStart: number;
};

declare global {
  var __examchat_store: Store | undefined;
}

function seed(): Map<string, Message[]> {
  const map = new Map<string, Message[]>();
  const now = Date.now();
  // t = minutes ago. Designed to feel like a live, ongoing conversation.
  const seedMessages: Record<
    string,
    { user: string; color: string; text: string; t: number }[]
  > = {
    "usmle-step-2-ck": [
      { user: "Priya", color: "#E11D48", text: "anyone else getting destroyed by the ethics qs on UW?", t: 96 },
      { user: "Marco", color: "#7C3AED", text: "ethics is the worst. always between 2 right answers", t: 94 },
      { user: "Marco", color: "#7C3AED", text: "the trick is always pick the most patient-centered option, even if it sounds weak", t: 93 },
      { user: "Aisha", color: "#0891B2", text: "got a 252 on NBME 12 today. exam in 9 days, send help", t: 78 },
      { user: "Jake", color: "#16A34A", text: "@Aisha that's a great score, you're more than fine", t: 76 },
      { user: "Lin", color: "#EA580C", text: "is anyone making a biostats cheat sheet? willing to trade for IM mnemonics", t: 60 },
      { user: "Sam", color: "#DB2777", text: "I have one, dm me", t: 58 },
      { user: "Ben", color: "#2563EB", text: "is amboss worth it for the last 2 weeks?", t: 42 },
      { user: "Aisha", color: "#0891B2", text: "@Ben yes, especially the high yield IM and surgery blocks", t: 41 },
      { user: "Tariq", color: "#DC2626", text: "free 120 only 70%, exam in 3 days, panicking", t: 22 },
      { user: "Marco", color: "#7C3AED", text: "free 120 historically underpredicts. take a breath", t: 21 },
      { user: "Priya", color: "#E11D48", text: "literally every NBME has been within 5 points of free 120 for me though", t: 20 },
      { user: "Lin", color: "#EA580C", text: "what's everyone's plan for the day before? full rest or a few qs?", t: 8 },
      { user: "Jake", color: "#16A34A", text: "rest day. brain dump anything you forget onto a sheet then close the books", t: 6 },
      { user: "Sam", color: "#DB2777", text: "this is the way", t: 5 },
    ],
    "usmle-step-1": [
      { user: "Tariq", color: "#DC2626", text: "biochem pathways are killing me", t: 80 },
      { user: "Maya", color: "#9333EA", text: "sketchy micro is the only thing keeping me alive", t: 78 },
      { user: "Owen", color: "#059669", text: "anyone scoring above 240 on NBME 30?", t: 64 },
      { user: "Rita", color: "#0EA5E9", text: "got a 248 last week. mostly UW + anki", t: 60 },
      { user: "Owen", color: "#059669", text: "@Rita how many UW passes?", t: 58 },
      { user: "Rita", color: "#0EA5E9", text: "1.5 passes, second one was incorrects only", t: 57 },
      { user: "Maya", color: "#9333EA", text: "anki addicts unite. 600 reviews a day", t: 33 },
      { user: "Sami", color: "#F59E0B", text: "is pixorize worth it for biochem?", t: 12 },
      { user: "Tariq", color: "#DC2626", text: "@Sami yes if you have time. life saver for vitamins", t: 10 },
      { user: "Rita", color: "#0EA5E9", text: "test in 5 days. nervous but ready I think", t: 3 },
    ],
    "usmle-step-3": [
      { user: "Hassan", color: "#2563EB", text: "CCS cases are not as scary as people make them out to be", t: 70 },
      { user: "Maya", color: "#9333EA", text: "depends. the OB ones got me", t: 68 },
      { user: "Daniel", color: "#16A34A", text: "uworld step 3 + ccs scoring algorithm + nbmes is enough imo", t: 55 },
      { user: "Hassan", color: "#2563EB", text: "+1, didn't touch divine", t: 54 },
      { user: "Liam", color: "#EA580C", text: "anyone else taking it during intern year? feeling so cooked", t: 30 },
      { user: "Daniel", color: "#16A34A", text: "@Liam i did, just block out one weekend per week. you'll survive", t: 28 },
      { user: "Maya", color: "#9333EA", text: "the biostats and ethics actually overlap a lot with step 2 ck so dust off those notes", t: 9 },
    ],
    mcat: [
      { user: "Riley", color: "#0EA5E9", text: "CARS curve was brutal on FL5", t: 88 },
      { user: "Devon", color: "#F59E0B", text: "anyone else feel like the AAMC psych is half memorization", t: 70 },
      { user: "Ines", color: "#EC4899", text: "psych/soc is honestly free points if you grind 86 page document + uworld", t: 68 },
      { user: "Devon", color: "#F59E0B", text: "@Ines noted. starting tonight", t: 67 },
      { user: "Riley", color: "#0EA5E9", text: "FL3 was my best. still don't trust it", t: 50 },
      { user: "Alex", color: "#10B981", text: "took the real thing yesterday. timing on bio/biochem was tight, manage your minutes", t: 25 },
      { user: "Ines", color: "#EC4899", text: "@Alex congrats on being done!! enjoy the void", t: 24 },
      { user: "Mira", color: "#7C3AED", text: "is the jack westin CARS daily worth doing", t: 6 },
      { user: "Riley", color: "#0EA5E9", text: "@Mira yes, free, takes 10 min a day, builds the habit", t: 4 },
    ],
    "nclex-rn": [
      { user: "Grace", color: "#EC4899", text: "SATA questions destroyed me on UW today", t: 75 },
      { user: "Alex", color: "#10B981", text: "priority q's are tricky but I'm getting better", t: 60 },
      { user: "Naomi", color: "#0891B2", text: "ABC and Maslow then most acute → most stable. it's a formula", t: 58 },
      { user: "Grace", color: "#EC4899", text: "@Naomi thank you, that reframes it for me", t: 57 },
      { user: "Devin", color: "#F59E0B", text: "passed in 85 last month. UW + Mark Klimek lectures was my whole prep", t: 22 },
      { user: "Alex", color: "#10B981", text: "@Devin congrats. how many days off Mark Klimek per day?", t: 21 },
      { user: "Devin", color: "#F59E0B", text: "@Alex 1-2 lectures per day for the last 2 weeks. didn't watch all 12", t: 20 },
      { user: "Lina", color: "#7C3AED", text: "feeling super defeated, scoring 55% on UW. test in 3 weeks", t: 4 },
      { user: "Naomi", color: "#0891B2", text: "@Lina that's actually fine for this stage. trend up matters more than absolute", t: 2 },
    ],
    "comlex-level-2": [
      { user: "Aiden", color: "#16A34A", text: "OMM is a free 5-10% if you just memorize the chapman points", t: 50 },
      { user: "Hannah", color: "#DB2777", text: "combank 2 was way harder than the real thing for me", t: 38 },
      { user: "Aiden", color: "#16A34A", text: "@Hannah good to hear, comquest has been kinder to me", t: 36 },
      { user: "Kai", color: "#0EA5E9", text: "anyone else taking step 2 ck and comlex 2 within 2 weeks?", t: 12 },
      { user: "Hannah", color: "#DB2777", text: "@Kai yes, focus on step 2 ck content + 1 OMM resource and you'll be fine", t: 10 },
    ],
    lsat: [
      { user: "Sara", color: "#2563EB", text: "logic games used to crush me. now they're my fav section", t: 90 },
      { user: "Mark", color: "#9333EA", text: "what flipped it for you?", t: 88 },
      { user: "Sara", color: "#2563EB", text: "redoing the same 4 games every day for a month. muscle memory", t: 86 },
      { user: "Tina", color: "#EA580C", text: "RC is my weakness. averaging -7", t: 50 },
      { user: "Mark", color: "#9333EA", text: "@Tina passage map: identify thesis, scope, structure in <1 min before any qs", t: 48 },
      { user: "Lily", color: "#10B981", text: "PT 90 felt fair. took it cold yesterday", t: 18 },
      { user: "Sara", color: "#2563EB", text: "diagnostic was 153, now hitting 168 consistent. 4 months of work", t: 4 },
    ],
    "bar-exam": [
      { user: "Adrian", color: "#7C3AED", text: "themis vs barbri debate again. take both? no. pick one and finish it", t: 72 },
      { user: "Beth", color: "#EC4899", text: "barbri here. the lectures are dry but the outlines are tight", t: 70 },
      { user: "Cole", color: "#16A34A", text: "MEE is where I keep losing points. anyone do AdaptiBar essays?", t: 38 },
      { user: "Beth", color: "#EC4899", text: "@Cole crushendo MEE was the move for me", t: 36 },
      { user: "Adrian", color: "#7C3AED", text: "MBE goal is 135+. real thing was easier than barbri sims", t: 7 },
    ],
    gre: [
      { user: "Henry", color: "#0891B2", text: "quant is straightforward if you know the tricks. magoosh + manhattan 5lb", t: 58 },
      { user: "Yuki", color: "#DB2777", text: "vocab is killing me. quizlet decks are not enough", t: 50 },
      { user: "Henry", color: "#0891B2", text: "@Yuki try magoosh's flashcards + reading the economist daily", t: 48 },
      { user: "Asha", color: "#F59E0B", text: "got 168Q 162V last week. felt prepared", t: 19 },
      { user: "Yuki", color: "#DB2777", text: "@Asha congrats. how long studying?", t: 18 },
      { user: "Asha", color: "#F59E0B", text: "@Yuki 6 weeks pretty intense", t: 17 },
      { user: "Tom", color: "#10B981", text: "is the AWA worth grinding? programs say they barely look at it", t: 4 },
    ],
    gmat: [
      { user: "Nora", color: "#2563EB", text: "Focus Edition is so much shorter, mental endurance matters less now", t: 62 },
      { user: "Pavel", color: "#7C3AED", text: "DI section threw me off. anyone have prep tips?", t: 55 },
      { user: "Nora", color: "#2563EB", text: "@Pavel the official guides + TTP if you can afford it", t: 53 },
      { user: "Diya", color: "#EC4899", text: "705 last weekend. happy to answer questions", t: 16 },
      { user: "Pavel", color: "#7C3AED", text: "@Diya what's your mental routine on test day?", t: 15 },
      { user: "Diya", color: "#EC4899", text: "@Pavel light breakfast, no caffeine spike, 10 min walk before. don't read forums day-of", t: 14 },
    ],
    "cfa-level-1": [
      { user: "Felipe", color: "#F59E0B", text: "ethics is half the battle. read the code+standards twice cover to cover", t: 70 },
      { user: "Hana", color: "#0EA5E9", text: "schweser notes + kaplan qbank got me through L1 last year", t: 60 },
      { user: "Felipe", color: "#F59E0B", text: "@Hana mock exam scores at the end?", t: 58 },
      { user: "Hana", color: "#0EA5E9", text: "@Felipe consistent 70+, real thing landed in 70-90 band", t: 56 },
      { user: "Owen", color: "#16A34A", text: "FRA terminology destroys me. any plain-english resources?", t: 9 },
    ],
    "cpa-exam": [
      { user: "Jordan", color: "#EA580C", text: "FAR is the boss fight, save it for when your study habits are dialed in", t: 66 },
      { user: "Megan", color: "#DB2777", text: "I disagree, take FAR first while motivation is high", t: 64 },
      { user: "Jordan", color: "#EA580C", text: "@Megan fair, depends on the person", t: 62 },
      { user: "Sasha", color: "#7C3AED", text: "Becker SIMs >>> any other vendor for FAR", t: 30 },
      { user: "Megan", color: "#DB2777", text: "passed REG yesterday. tax memorization was brutal but doable", t: 5 },
    ],
  };
  for (const exam of EXAMS) {
    const list = (seedMessages[exam.slug] ?? []).map((m, idx) => ({
      id: `${exam.slug}-seed-${idx}`,
      examSlug: exam.slug,
      channelKey: "main",
      userId: `seed-${m.user}`,
      username: m.user,
      avatarColor: m.color,
      text: m.text,
      createdAt: now - m.t * 60_000,
    }));
    map.set(storeKey(exam.slug, "main"), list);
    map.set(storeKey(exam.slug, "discussion"), [
      {
        id: `${exam.slug}-discussion-seed-0`,
        examSlug: exam.slug,
        channelKey: "discussion",
        userId: "seed-Discussion",
        username: "Discussion",
        avatarColor: "#2563EB",
        text: `What topic is everyone prioritizing for ${exam.shortName} this week?`,
        createdAt: now - 44 * 60_000,
      },
      {
        id: `${exam.slug}-discussion-seed-1`,
        examSlug: exam.slug,
        channelKey: "discussion",
        userId: "seed-Review",
        username: "Review",
        avatarColor: "#16A34A",
        text: "I am doing weak blocks first, then reviewing missed concepts at night.",
        createdAt: now - 31 * 60_000,
      },
    ]);
    map.set(storeKey(exam.slug, "experience"), [
      {
        id: `${exam.slug}-experience-seed-0`,
        examSlug: exam.slug,
        channelKey: "experience",
        userId: "seed-Experience",
        username: "Experience",
        avatarColor: "#DB2777",
        text: `Recent test takers: what felt most different from practice for ${exam.shortName}?`,
        createdAt: now - 63 * 60_000,
      },
      {
        id: `${exam.slug}-experience-seed-1`,
        examSlug: exam.slug,
        channelKey: "experience",
        userId: "seed-Calm",
        username: "Calm",
        avatarColor: "#7C3AED",
        text: "Timing felt tighter than practice, but the stems were fair.",
        createdAt: now - 47 * 60_000,
      },
    ]);
    map.set(storeKey(exam.slug, "files"), [
      {
        id: `${exam.slug}-files-seed-0`,
        examSlug: exam.slug,
        channelKey: "files",
        userId: "seed-Files",
        username: "Files",
        avatarColor: "#EA580C",
        text: "Use this channel to discuss shared files and request summaries.",
        createdAt: now - 28 * 60_000,
      },
    ]);
  }
  return map;
}

function storeKey(slug: string, channelKey = "main"): string {
  return `${slug}:${channelKey || "main"}`;
}

function defaultChannelMessages(slug: string, channelKey: string): Message[] {
  const exam = EXAMS.find((item) => item.slug === slug);
  if (!exam) return [];
  const now = Date.now();
  if (channelKey === "discussion") {
    return [
      {
        id: `${slug}-discussion-seed-0`,
        examSlug: slug,
        channelKey,
        userId: "seed-Discussion",
        username: "Discussion",
        avatarColor: "#2563EB",
        text: `What topic is everyone prioritizing for ${exam.shortName} this week?`,
        createdAt: now - 44 * 60_000,
      },
      {
        id: `${slug}-discussion-seed-1`,
        examSlug: slug,
        channelKey,
        userId: "seed-Review",
        username: "Review",
        avatarColor: "#16A34A",
        text: "I am doing weak blocks first, then reviewing missed concepts at night.",
        createdAt: now - 31 * 60_000,
      },
    ];
  }
  if (channelKey === "experience") {
    return [
      {
        id: `${slug}-experience-seed-0`,
        examSlug: slug,
        channelKey,
        userId: "seed-Experience",
        username: "Experience",
        avatarColor: "#DB2777",
        text: `Recent test takers: what felt most different from practice for ${exam.shortName}?`,
        createdAt: now - 63 * 60_000,
      },
      {
        id: `${slug}-experience-seed-1`,
        examSlug: slug,
        channelKey,
        userId: "seed-Calm",
        username: "Calm",
        avatarColor: "#7C3AED",
        text: "Timing felt tighter than practice, but the stems were fair.",
        createdAt: now - 47 * 60_000,
      },
    ];
  }
  if (channelKey === "files") {
    return [
      {
        id: `${slug}-files-seed-0`,
        examSlug: slug,
        channelKey,
        userId: "seed-Files",
        username: "Files",
        avatarColor: "#EA580C",
        text: "Use this channel to discuss shared files and request summaries.",
        createdAt: now - 28 * 60_000,
      },
    ];
  }
  return [];
}

function getStore(): Store {
  if (!globalThis.__examchat_store) {
    globalThis.__examchat_store = {
      messages: seed(),
      subscribers: new Map(),
      liveOffsets: new Map(),
      liveTickStart: Date.now(),
    };
  }
  return globalThis.__examchat_store;
}

export function getMessages(slug: string, channelKey = "main"): Message[] {
  const store = getStore();
  const key = storeKey(slug, channelKey);
  const existing = store.messages.get(key);
  if (existing) return existing;
  const legacyMain = channelKey === "main" ? store.messages.get(slug) : undefined;
  if (legacyMain) {
    store.messages.set(key, legacyMain);
    return legacyMain;
  }
  const seeded = defaultChannelMessages(slug, channelKey);
  store.messages.set(key, seeded);
  return seeded;
}

export function addMessage(msg: Message): void {
  const store = getStore();
  const key = storeKey(msg.examSlug, msg.channelKey);
  const list = store.messages.get(key) ?? [];
  list.push(msg);
  // Keep last 200 messages in memory.
  if (list.length > 200) list.splice(0, list.length - 200);
  store.messages.set(key, list);
  const subs = store.subscribers.get(key);
  if (subs) {
    for (const fn of subs) {
      try {
        fn(msg);
      } catch {
        // ignore broken subscribers
      }
    }
  }
}

export function subscribe(slug: string, channelKey: string, fn: Subscriber): () => void {
  const store = getStore();
  const key = storeKey(slug, channelKey);
  let set = store.subscribers.get(key);
  if (!set) {
    set = new Set();
    store.subscribers.set(key, set);
  }
  set.add(fn);
  return () => {
    set!.delete(fn);
  };
}

// Pseudo-live member counts that drift gently around base values so the homepage
// feels alive without needing a real presence backend.
export function getLiveCount(slug: string, baseMembers: number): number {
  const store = getStore();
  const seconds = Math.floor((Date.now() - store.liveTickStart) / 1000);
  // Two slow sine waves so the number is always changing but believable.
  const hashSeed = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const drift =
    Math.sin((seconds + hashSeed) / 17) * Math.sqrt(baseMembers) * 0.4 +
    Math.sin((seconds + hashSeed) / 53) * Math.sqrt(baseMembers) * 0.6;
  const onlinePct = 0.018 + (Math.sin((seconds + hashSeed) / 89) + 1) * 0.004; // 1.8%–2.6%
  const live = Math.round(baseMembers * onlinePct + drift);
  return Math.max(50, live);
}

export function formatMembers(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, "") + "K";
  return String(n);
}
