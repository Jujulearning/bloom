import { useEffect, useRef, useState } from "react";
import { House, Compass, Users, Route, Check, HeartPulse, CalendarRange, Baby, ClipboardList, HandHeart, MapPin, User, Apple, Smile } from "lucide-react";
import { StoreProvider } from "./store";
import { useStore } from "./useStore";
import { AfyaMark, AmaraLogo, Avatar } from "./ui";
import Onboarding from "./Onboarding";
import { Home, Profile, MyData } from "./Home";
import { Explore, Library, Search, FoodPage, Recipes, RecipePage, BuildPlate, Budget, Grocery } from "./Explore";
import { Afya, AfyaPlan } from "./Afya";
import { Village, Rooms, Room, Thread, Compose, Events, Guidelines } from "./Village";
import { Journey, Reflection, Visit, Summary } from "./Journey";
import { Support } from "./Support";
import { Nutrients } from "./Nutrients";
import { Mood } from "./Mood";
import { Health, Timeline, BabyScreen, Postpartum, Life } from "./Health";
import { GetHelp, HelpButton } from "./Safety";
import { stageLabel } from "./stage";

const SCREENS = {
  home: Home, profile: Profile, mydata: MyData,
  explore: Explore, library: Library, search: Search, food: FoodPage, recipes: Recipes, recipe: RecipePage, plate: BuildPlate, budget: Budget, grocery: Grocery,
  afya: Afya, "afya-plan": AfyaPlan,
  village: Village, rooms: Rooms, room: Room, thread: Thread, compose: Compose, events: Events, guidelines: Guidelines,
  journey: Journey, reflection: Reflection, visit: Visit, summary: Summary, support: Support,
  health: Health, timeline: Timeline, baby: BabyScreen, postpartum: Postpartum, life: Life, urgent: GetHelp,
  nutrients: Nutrients, mood: Mood,
};

const TABS = [
  { id: "home", label: "Home", Icon: House },
  { id: "explore", label: "Explore", Icon: Compass },
  { id: "afya", label: "Afya" },
  { id: "village", label: "Village", Icon: Users },
  { id: "journey", label: "Journey", Icon: Route },
];

const SIDE = [
  { group: null, items: [
    { id: "home", label: "Today", Icon: House },
    { id: "explore", label: "Food Library", Icon: Compass },
    { id: "afya", label: "Afya", afya: true },
    { id: "village", label: "The Village", Icon: Users },
    { id: "journey", label: "My Journey", Icon: Route },
  ] },
  { group: "My health", items: [
    { id: "health", label: "Blood pressure & tracking", Icon: HeartPulse },
    { id: "nutrients", label: "Nutrient check", Icon: Apple },
    { id: "mood", label: "Mood & wellbeing", Icon: Smile },
    { id: "timeline", label: "My 1,000 days", Icon: CalendarRange },
    { id: "baby", label: "Baby & growth", Icon: Baby },
    { id: "visit", label: "For My Visit", Icon: ClipboardList },
  ] },
  { group: "Life & support", items: [
    { id: "life", label: "Life & resources", Icon: HandHeart },
    { id: "support", label: "Support near you", Icon: MapPin },
    { id: "profile", label: "Profile & privacy", Icon: User },
  ] },
];

function BottomNav() {
  const { stack, nav } = useStore();
  const root = stack[0].name;
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {TABS.map(({ id, label, Icon }) => (
        <button key={id} className={"nav-item" + (root === id ? " on" : "") + (id === "afya" ? " nav-afya" : "")} onClick={() => nav.tab(id)} aria-current={root === id ? "page" : undefined}>
          {id === "afya" ? <AfyaMark size={40} /> : <Icon size={21} strokeWidth={root === id ? 2.2 : 1.7} />}
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function Sidebar() {
  const { state, stack, nav } = useStore();
  const root = stack[0].name;
  const p = state.profile;
  return (
    <aside className="sidebar" aria-label="Main navigation">
      <div className="sb-brand"><AmaraLogo size={1.05} /></div>
      <button className="sb-me" onClick={() => nav.tab("profile")}>
        <Avatar who="maya" size={38} />
        <span><b>{p.name}</b><small>{p.stage === "Postpartum" ? stageLabel(p) : `Week ${p.week} · pregnant`}</small></span>
      </button>
      <nav>
        {SIDE.map((g) => (
          <div key={g.group || "main"} className="sb-group">
            {g.group && <p className="sb-label">{g.group}</p>}
            {g.items.map(({ id, label, Icon, afya }) => (
              <button key={id} className={"sb-item" + (root === id ? " on" : "")} onClick={() => nav.tab(id)} aria-current={root === id ? "page" : undefined}>
                {afya ? <AfyaMark size={24} /> : <Icon size={19} strokeWidth={1.8} />}
                <span>{label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="sb-help"><HelpButton /><small>Urgent warning signs & who to call</small></div>
      <p className="sb-foot">Nourished by culture.<br />Rooted in science.</p>
    </aside>
  );
}

function Screen() {
  const { stack } = useStore();
  const top = stack[stack.length - 1];
  const Comp = SCREENS[top.name] || Home;
  const ref = useRef();
  useEffect(() => { ref.current?.scrollTo(0, 0); }, [stack.length, top.name]);
  const hideNav = ["room", "compose"].includes(top.name);
  return (
    <>
      <main className={"screen" + (hideNav ? " no-nav" : "") + " s-" + top.name} ref={ref} key={stack.length + top.name}>
        <Comp {...(top.params || {})} />
      </main>
      {!hideNav && <BottomNav />}
    </>
  );
}

function Toast() {
  const { toast } = useStore();
  return toast ? <div className="toast" role="status"><Check size={16} /> {toast}</div> : null;
}

function Shell() {
  const { state } = useStore();
  const [splash, setSplash] = useState(true);
  useEffect(() => { const t = setTimeout(() => setSplash(false), 1600); return () => clearTimeout(t); }, []);
  if (splash) {
    return (
      <div className="splash" onClick={() => setSplash(false)}>
        <div className="splash-mark"><AfyaMark size={64} /></div>
        <AmaraLogo light size={1.6} />
        <p>Nourished by culture. Rooted in science.</p>
      </div>
    );
  }
  if (!state.onboarded) {
    return <div className="onb-shell"><div className="onb-frame"><Onboarding /><Toast /></div></div>;
  }
  return (
    <div className="app">
      <Sidebar />
      <div className="app-main">
        <Screen />
        <Toast />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
