import { useEffect, useMemo, useReducer, useRef, useState, useCallback } from "react";
import { POSTS, MAYA } from "./data";
import { SEED_LOG } from "./nutrition";
import { Ctx } from "./useStore";

const KEY = "amara-demo-v2";


const initial = {
  onboarded: false,
  profile: MAYA,
  checkin: null,
  checkins: [
    { day: "Mon", mood: "Tired" }, { day: "Tue", mood: "Energized" }, { day: "Wed", mood: "Tired" },
    { day: "Thu", mood: "Hungry" }, { day: "Fri", mood: "Tired" },
  ],
  savedFoods: ["waakye"],
  savedRecipes: ["red-red"],
  plates: [{ id: "pl0", base: "Jollof rice", picks: { Protein: "Fish", Vegetable: "Spinach", "Vitamin C": "Peppers" } }],
  explored: ["plantain", "black-eyed-peas", "collards", "jollof", "waakye", "sweet-potato", "callaloo"],
  visitQs: [
    { id: "q1", text: "Are there nutrients I should prioritize this trimester?", from: "Mine", share: true },
  ],
  focusDone: { "Try 3 different vegetables": true },
  water: 5,
  posts: POSTS,
  myReactions: {},
  following: ["p2"],
  joined: ["working-mamas", "around-the-table", "second-tri"],
  rsvps: ["e1"],
  chat: [],
  afya: [],
  grocery: null,
  bp: [
    { week: 12, s: 112, d: 70, when: "Clinic" }, { week: 16, s: 114, d: 72, when: "Clinic" }, { week: 19, s: 116, d: 72 },
    { week: 20, s: 118, d: 74, when: "Clinic" }, { week: 22, s: 121, d: 76 }, { week: 23, s: 124, d: 78 }, { week: 24, s: 126, d: 80 },
  ],
  weight: [{ week: 8, gain: 1 }, { week: 12, gain: 2 }, { week: 16, gain: 5 }, { week: 20, gain: 9 }, { week: 24, gain: 13 }],
  symptoms: [
    { week: 22, day: "Mon", list: ["Fatigue", "Heartburn"] }, { week: 22, day: "Thu", list: ["Fatigue"] }, { week: 23, day: "Tue", list: ["Fatigue", "Trouble sleeping"] },
    { week: 23, day: "Sat", list: ["Heartburn"] }, { week: 24, day: "Mon", list: ["Fatigue"] }, { week: 24, day: "Wed", list: ["Fatigue", "Constipation"] },
  ],
  weekly: [
    { week: 18, energy: 4, foods: 5 }, { week: 19, energy: 4, foods: 6 }, { week: 20, energy: 3.5, foods: 6 }, { week: 21, energy: 3, foods: 7 },
    { week: 22, energy: 2.5, foods: 8 }, { week: 23, energy: 2.5, foods: 9 }, { week: 24, energy: 3, foods: 10 },
  ],
  visits: [
    { week: 8, title: "First prenatal visit", note: "Confirmed pregnancy, started prenatal vitamin" },
    { week: 12, title: "First-trimester visit", note: "BP 112/70 · labs drawn" },
    { week: 16, title: "Routine visit", note: "BP 114/72 · feeling good" },
    { week: 20, title: "Anatomy scan", note: "BP 118/74 · baby growing well" },
    { week: 25, title: "Next visit & glucose screening", note: "Bring: fatigue, iron question, BP trend", upcoming: true },
  ],
  baby: {
    name: "Ama", age: "4 months (sample)", feeding: "breastfeeding + some bottles",
    weights: [{ month: 0, kg: 3.3 }, { month: 1, kg: 4.3 }, { month: 2, kg: 5.3 }, { month: 3, kg: 6.0 }, { month: 4, kg: 6.6 }],
    milestones: [1, 2],
    feeds: [{ time: "6:10", type: "Breastfeed" }, { time: "9:30", type: "Breastfeed" }, { time: "12:45", type: "Bottle" }],
  },
  sdoh: { done: false, share: false, chw: false, answers: { food: "Sometimes", transport: "Yes", housing: "No", utilities: "No", support: "Sometimes", stress: "Several days", safety: "Yes", work: "Yes" } },
  privacy: { shareWithProvider: false, anonymousDefault: false, showWeek: true, personalization: true, research: false },
  notifications: { checkins: true, village: true, tips: true, appointments: true },
  community: { dms: false, showInRooms: true },
  zip: "",
  prenatal: "yes",
  foodLog: SEED_LOG,
  epds: [],
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    const s = { ...initial, ...JSON.parse(raw) };
    if (!["Pregnant", "Postpartum"].includes(s.profile?.stage)) s.profile = { ...s.profile, stage: "Pregnant" };
    return s;
  } catch {
    return initial;
  }
}

function reducer(s, a) {
  switch (a.type) {
    case "set": return { ...s, ...a.patch };
    case "profile": return { ...s, profile: { ...s.profile, ...a.patch } };
    case "toggleIn": {
      const list = s[a.key];
      return { ...s, [a.key]: list.includes(a.id) ? list.filter((x) => x !== a.id) : [...list, a.id] };
    }
    case "addTo": return s[a.key].includes(a.id) ? s : { ...s, [a.key]: [...s[a.key], a.id] };
    case "checkin": {
      const checkins = [...s.checkins.filter((c) => c.day !== "Today"), { day: "Today", mood: a.mood }];
      return { ...s, checkin: a.mood, checkins };
    }
    case "addQ": return s.visitQs.some((q) => q.text === a.text) ? s : { ...s, visitQs: [...s.visitQs, { id: "q" + Date.now(), text: a.text, from: a.from || "Mine", share: true }] };
    case "toggleQ": return { ...s, visitQs: s.visitQs.map((q) => (q.id === a.id ? { ...q, share: !q.share } : q)) };
    case "removeQ": return { ...s, visitQs: s.visitQs.filter((q) => q.id !== a.id) };
    case "react": {
      const k = a.post + a.emoji;
      const on = !s.myReactions[k];
      return {
        ...s,
        myReactions: { ...s.myReactions, [k]: on },
        posts: s.posts.map((p) => p.id === a.post ? { ...p, reactions: { ...p.reactions, [a.emoji]: (p.reactions[a.emoji] || 0) + (on ? 1 : -1) } } : p),
      };
    }
    case "reply": return { ...s, posts: s.posts.map((p) => (p.id === a.post ? { ...p, replies: [...p.replies, a.reply] } : p)) };
    case "post": return { ...s, posts: [a.post, ...s.posts] };
    case "afyaAdd": return { ...s, afya: [...s.afya, a.msg] };
    case "chat": return { ...s, chat: [...s.chat, a.msg] };
    case "plate": return { ...s, plates: [...s.plates, a.plate] };
    case "focus": return { ...s, focusDone: { ...s.focusDone, [a.item]: !s.focusDone[a.item] } };
    case "privacy": return { ...s, privacy: { ...s.privacy, [a.k]: !s.privacy[a.k] } };
    case "notifications": return { ...s, notifications: { ...s.notifications, [a.k]: !s.notifications[a.k] } };
    case "community": return { ...s, community: { ...s.community, [a.k]: !s.community[a.k] } };
    case "bp": return { ...s, bp: [...s.bp, a.reading] };
    case "weight": return { ...s, weight: [...s.weight.filter((w) => w.week !== a.entry.week), a.entry] };
    case "symptom": return { ...s, symptoms: [...s.symptoms, a.entry] };
    case "babyWeight": { const w = s.baby.weights; return { ...s, baby: { ...s.baby, weights: [...w, { month: w[w.length - 1].month + 1, kg: a.kg }] } }; }
    case "milestone": { const m = s.baby.milestones; return { ...s, baby: { ...s.baby, milestones: m.includes(a.id) ? m.filter((x) => x !== a.id) : [...m, a.id] } }; }
    case "feed": return { ...s, baby: { ...s.baby, feeds: [...s.baby.feeds, a.feed] } };
    case "foodLog": {
      const d = { ...(s.foodLog[a.day] || {}) };
      d[a.id] = Math.max(0, (d[a.id] || 0) + a.delta);
      if (!d[a.id]) delete d[a.id];
      return { ...s, foodLog: { ...s.foodLog, [a.day]: d } };
    }
    case "epds": return { ...s, epds: [...s.epds, { date: new Date().toISOString().slice(0, 10), score: a.score }] };
    case "sdoh": return { ...s, sdoh: { ...s.sdoh, ...a.patch } };
    case "reset": return { ...initial };
    default: return s;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const [stack, setStack] = useState([{ name: "home" }]);
  const [toast, setToast] = useState(null);
  const timer = useRef();

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
  }, [state]);

  const notify = useCallback((msg) => {
    clearTimeout(timer.current);
    setToast(msg);
    timer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const nav = useMemo(() => ({
    go: (name, params = {}) => setStack((st) => [...st, { name, params }]),
    tab: (name, params = {}) => setStack([{ name, params }]),
    back: () => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st)),
    replace: (name, params = {}) => setStack((st) => [...st.slice(0, -1), { name, params }]),
  }), []);

  const value = useMemo(() => ({ state, dispatch, stack, nav, notify, toast }), [state, stack, nav, notify, toast]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
