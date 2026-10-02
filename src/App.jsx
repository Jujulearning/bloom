import { useEffect, useRef, useState } from "react";
import { House, Compass, Users, Route, Check } from "lucide-react";
import { StoreProvider } from "./store";
import { useStore } from "./useStore";
import { AfyaMark, AmaraLogo } from "./ui";
import Onboarding from "./Onboarding";
import { Home, Profile, MyData } from "./Home";
import { Explore, Library, Search, FoodPage, Recipes, RecipePage, BuildPlate, Budget, Grocery } from "./Explore";
import { Afya, AfyaPlan } from "./Afya";
import { Village, Rooms, Room, Thread, Compose, Events, Guidelines } from "./Village";
import { Journey, Reflection, Visit, Summary, Support } from "./Journey";

const SCREENS = {
  home: Home, profile: Profile, mydata: MyData,
  explore: Explore, library: Library, search: Search, food: FoodPage, recipes: Recipes, recipe: RecipePage, plate: BuildPlate, budget: Budget, grocery: Grocery,
  afya: Afya, "afya-plan": AfyaPlan,
  village: Village, rooms: Rooms, room: Room, thread: Thread, compose: Compose, events: Events, guidelines: Guidelines,
  journey: Journey, reflection: Reflection, visit: Visit, summary: Summary, support: Support,
};

const TABS = [
  { id: "home", label: "Home", Icon: House },
  { id: "explore", label: "Explore", Icon: Compass },
  { id: "afya", label: "Afya" },
  { id: "village", label: "Village", Icon: Users },
  { id: "journey", label: "Journey", Icon: Route },
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

function Screen() {
  const { stack } = useStore();
  const top = stack[stack.length - 1];
  const Comp = SCREENS[top.name] || Home;
  const ref = useRef();
  useEffect(() => { ref.current?.scrollTo(0, 0); }, [stack.length, top.name]);
  const hideNav = ["room", "compose"].includes(top.name);
  return (
    <>
      <main className={"screen" + (hideNav ? " no-nav" : "")} ref={ref} key={stack.length + top.name}>
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

function Phone() {
  const { state } = useStore();
  const [splash, setSplash] = useState(true);
  useEffect(() => { const t = setTimeout(() => setSplash(false), 1700); return () => clearTimeout(t); }, []);
  return (
    <div className="phone">
      <div className="phone-inner">
        {splash ? (
          <div className="splash" onClick={() => setSplash(false)}>
            <div className="splash-mark"><AfyaMark size={64} /></div>
            <AmaraLogo light size={1.6} />
            <p>Nourished by culture. Rooted in science.</p>
          </div>
        ) : !state.onboarded ? <Onboarding /> : <Screen />}
        <Toast />
      </div>
    </div>
  );
}

function SidePanel() {
  return (
    <aside className="side">
      <AmaraLogo size={1.3} />
      <h1>Every kitchen tells a story.</h1>
      <p className="side-lede">An interactive prototype of Amara Health, a culturally responsive maternal nutrition companion for the first 1,000 days. Follow Maya, 24 weeks pregnant, through her day.</p>
      <div className="side-roadmap">
        <div><span className="dot mvp" /><b>MVP</b><p>Culturally responsive Food Library + personalized Afya guidance</p></div>
        <div><span className="dot early" /><b>Early expansion</b><p>The Village, recipes, Build My Plate, saved foods, grocery planning, Journey check-ins</p></div>
        <div><span className="dot later" /><b>Long-term platform</b><p>Provider tools, clinical integration, postpartum & infant feeding, resource integration, health-system partnerships</p></div>
      </div>
      <p className="side-note">Concept prototype with sample content and illustrative images. Educational only, not medical advice.</p>
    </aside>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <div className="stage">
        <SidePanel />
        <Phone />
      </div>
    </StoreProvider>
  );
}
