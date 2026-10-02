import { useEffect, useMemo, useReducer, useRef, useState, useCallback } from "react";
import { POSTS, MAYA } from "./data";
import { Ctx } from "./useStore";

const KEY = "amara-demo-v1";


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
  privacy: { shareWithProvider: false, anonymousDefault: false, showWeek: true, personalization: true, research: false },
  notifications: { checkins: true, village: true, tips: true, appointments: true },
  community: { dms: false, showInRooms: true },
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    return { ...initial, ...JSON.parse(raw) };
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
