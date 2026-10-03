import { useState } from "react";
import { ArrowRight, Bell, ChevronRight, Utensils, Wallet, ClipboardList, MapPin, Droplet, Minus, Plus, Lock, Download, Trash2, RefreshCw, Sparkles, HeartPulse, HandHeart, CalendarRange, Apple, Smile } from "lucide-react";
import { HealthSnapshot } from "./Health";
import { RiskCards, HelpButton } from "./Safety";
import { riskSignals } from "./helpers";
import { useStore } from "./useStore";
import { trimester } from "./helpers";
import { TopBar, Photo, Chip, Nutrient, SectionHead, Avatar, Disclaimer, Toggle, AfyaMark, Sheet } from "./ui";
import { CHECKIN, CHECKIN_FOCUS, NUTRIENTS, RECIPES, FOODS, ONBOARD_CUISINES, DIET_PATTERNS, ALLERGIES } from "./data";

const greet = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};


function WeekRing({ week }) {
  const r = 34, c = 2 * Math.PI * r, pct = Math.min(week / 40, 1);
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="week-ring" aria-hidden="true">
      <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(250,246,239,.18)" strokeWidth="5" />
      <circle cx="44" cy="44" r={r} fill="none" stroke="#E0B14C" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${c * pct} ${c}`} transform="rotate(-90 44 44)" />
      <text x="44" y="42" textAnchor="middle" className="ring-num">{week}</text>
      <text x="44" y="58" textAnchor="middle" className="ring-lbl">WEEKS</text>
    </svg>
  );
}

export function Home() {
  const { state, dispatch, nav, notify } = useStore();
  const p = state.profile;
  const mood = state.checkin;
  const focus = CHECKIN_FOCUS[mood || "Tired"];
  const [nutrient, setNutrient] = useState(focus.nutrient);
  const saved = RECIPES.find((r) => r.id === state.savedRecipes[state.savedRecipes.length - 1]) || RECIPES[0];
  const villagePosts = state.posts.filter((x) => ["p2", "p3"].includes(x.id));

  const doCheckin = (m) => {
    dispatch({ type: "checkin", mood: m });
    setNutrient(CHECKIN_FOCUS[m].nutrient);
    notify("Check-in saved. Afya will keep it in mind");
  };

  return (
    <div className="home">
      <header className="home-head">
        <div>
          <p className="eyebrow">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1 className="display-sm">{greet()}, {p.name}</h1>
        </div>
        <div className="head-actions">
          <span className="mobile-only"><HelpButton /></span>
          <button className="icon-btn soft" aria-label="Notifications" onClick={() => notify("You're all caught up")}><Bell size={19} /></button>
          <button className="avatar-btn" onClick={() => nav.go("profile")} aria-label="Profile"><Avatar who="maya" size={38} /></button>
        </div>
      </header>

      <section className="week-card" onClick={() => nav.tab("journey")}>
        <WeekRing week={p.week} />
        <div>
          <p className="eyebrow light">{trimester(p.week)}</p>
          <h2>Week {p.week}</h2>
          <p>Your baby is about the size of an ear of corn, and growing quickly.</p>
          <div className="tri-bar"><i style={{ width: `${(p.week / 40) * 100}%` }} /></div>
        </div>
      </section>

      <HealthSnapshot />

      {riskSignals(state).length > 0 && (
        <>
          <SectionHead title="For you this week" eyebrow="Based on your check-ins and tracking" />
          <RiskCards signals={riskSignals(state)} />
        </>
      )}

      <section className="card checkin">
        <div className="checkin-head">
          <AfyaMark size={32} />
          <div><p className="eyebrow">Afya check-in</p><h3>How are you feeling today?</h3></div>
        </div>
        <div className="mood-row">
          {CHECKIN.map((c) => (
            <button key={c.id} className={"mood" + (mood === c.id ? " on" : "")} onClick={() => doCheckin(c.id)}>
              <span>{c.emoji}</span>{c.id}
            </button>
          ))}
        </div>
        {mood && <p className="checkin-note">Thanks, {p.name}. Today's suggestions are tuned for feeling <b>{mood.toLowerCase()}</b>.</p>}
      </section>

      <section className="card today">
        <p className="eyebrow">Today for you</p>
        <p className="why-you">{mood ? `Because you're feeling ${mood.toLowerCase()} today` : `Because you've checked in tired ${state.checkins.filter((c) => c.mood === "Tired").length} times this week`} · week {p.week}</p>
        <h3 className="serif-lg">{focus.title}</h3>
        <p className="muted">{focus.body}</p>
        <button className="btn btn-primary" onClick={() => nav.go(...focus.to)}>{focus.cta} <ArrowRight size={16} /></button>
      </section>

      <SectionHead title="Today's nutrition focus" eyebrow="Nourishment, not numbers" />
      <div className="chips scroll">
        {["Iron", "Protein", "Folate", "Calcium", "Hydration"].map((n) => (
          <Chip key={n} active={nutrient === n} onClick={() => setNutrient(n)}>{n}</Chip>
        ))}
      </div>
      <div className="card focus-card">
        <Nutrient n={nutrient} />
        <p>{NUTRIENTS[nutrient].why}</p>
        {nutrient === "Hydration" ? (
          <div className="water">
            <div className="glasses">{Array.from({ length: 10 }).map((_, k) => <Droplet key={k} size={20} className={k < state.water ? "full" : ""} />)}</div>
            <div className="water-ctrl">
              <button className="round-btn sm" onClick={() => dispatch({ type: "set", patch: { water: Math.max(0, state.water - 1) } })} aria-label="Remove a glass"><Minus size={16} /></button>
              <span>{state.water} of 10 cups</span>
              <button className="round-btn sm" onClick={() => dispatch({ type: "set", patch: { water: Math.min(12, state.water + 1) } })} aria-label="Add a glass"><Plus size={16} /></button>
            </div>
          </div>
        ) : (
          <div className="mini-foods">
            {FOODS.filter((f) => f.nutrients.includes(nutrient)).slice(0, 4).map((f) => (
              <button key={f.id} onClick={() => nav.go("food", { id: f.id })}>{f.name}</button>
            ))}
            <button className="link" onClick={() => nav.go("library", { nutrient })}>See all <ChevronRight size={14} /></button>
          </div>
        )}
      </div>

      <SectionHead title="Continue exploring" />
      <button className="explore-card" onClick={() => nav.go("library", { cuisine: "west-african", nutrient: "Iron" })}>
        <Photo name="g-west-african-stew" pos="50% 40%" h={170}>
          <span className="pill">Collection</span>
          <h3>West African foods rich in iron</h3>
          <span className="sub">Waakye · Egusi · Black-eyed peas</span>
        </Photo>
      </button>

      <SectionHead title="Saved meal" action="All saved" onAction={() => nav.go("recipes", { saved: true })} />
      <button className="meal-card" onClick={() => nav.go("recipe", { id: saved.id })}>
        <Photo name={saved.img} pos={saved.pos} h={92} r={16} />
        <div>
          <p className="eyebrow">{saved.cuisine}</p>
          <h4>{saved.name}</h4>
          <div className="tags">{saved.highlights.slice(0, 3).map((n) => <Nutrient key={n} n={n} />)}</div>
        </div>
      </button>

      <SectionHead title="From the Village" action="Visit the Village" onAction={() => nav.tab("village")} />
      <div className="village-peek">
        {villagePosts.map((post) => (
          <button key={post.id} className="peek" onClick={() => nav.go("thread", { id: post.id })}>
            <Avatar who={post.by} size={28} />
            <span>“{post.text}”</span>
            <small>{post.replies.length} replies</small>
          </button>
        ))}
        <button className="btn btn-soft btn-block" onClick={() => nav.tab("village")}>Visit the Village <ArrowRight size={16} /></button>
      </div>

      <SectionHead title="Tools for real life" />
      <div className="tools">
        <button onClick={() => nav.go("plate")}><Utensils size={20} /><b>Build my plate</b><small>Start with what you eat</small></button>
        <button onClick={() => nav.go("budget")}><Wallet size={20} /><b>Nourish on a budget</b><small>A simple grocery plan</small></button>
        <button onClick={() => nav.go("visit")}><ClipboardList size={20} /><b>For my visit</b><small>{state.visitQs.length} question{state.visitQs.length === 1 ? "" : "s"} saved</small></button>
        <button onClick={() => nav.go("support")}><MapPin size={20} /><b>Support near you</b><small>A little extra support</small></button>
        <button onClick={() => nav.go("health")}><HeartPulse size={20} /><b>Blood pressure</b><small>Log a reading, see your trend</small></button>
        <button onClick={() => nav.go("timeline")}><CalendarRange size={20} /><b>My 1,000 days</b><small>Your journey over time</small></button>
        <button onClick={() => nav.go("nutrients")}><Apple size={20} /><b>Nutrient check</b><small>Am I getting enough?</small></button>
        <button onClick={() => nav.go("mood")}><Smile size={20} /><b>Mood check</b><small>2 minutes, just for you</small></button>
      </div>

      <button className="card support-card" onClick={() => nav.go("life")}>
        <HandHeart size={22} />
        <div><p className="eyebrow">Life & resources</p><p>{state.sdoh.done ? "See your support plan for food, rides and more." : "Food, rides, housing, stress: a few private questions can point you to real help."}</p></div>
        <ArrowRight size={18} />
      </button>

      <Disclaimer />
    </div>
  );
}

function Row({ label, value, onClick }) {
  return (
    <button className="row" onClick={onClick}>
      <span>{label}</span><b>{value}</b><ChevronRight size={16} />
    </button>
  );
}

export function Profile() {
  const { state, dispatch, nav, notify } = useStore();
  const p = state.profile;
  const [edit, setEdit] = useState(null);
  const set = (patch) => dispatch({ type: "profile", patch });
  const toggle = (key, v) => set({ [key]: p[key].includes(v) ? p[key].filter((x) => x !== v) : [...p[key], v] });

  return (
    <div>
      <TopBar title="Profile & preferences" />
      <div className="pad">
        <div className="profile-head">
          <Avatar who="maya" size={64} />
          <div>
            <h2 className="display-sm">{p.name}</h2>
            <p className="muted">{p.stage} · week {p.week} · {trimester(p.week)}</p>
          </div>
        </div>

        <div className="card stage-edit">
          <p className="eyebrow">Pregnancy stage</p>
          <div className="week-picker small">
            <button className="round-btn" onClick={() => set({ week: Math.max(4, p.week - 1) })} aria-label="Previous week"><Minus size={18} /></button>
            <div><span className="week-num">{p.week}</span><span className="week-lbl">weeks</span></div>
            <button className="round-btn" onClick={() => set({ week: Math.min(41, p.week + 1) })} aria-label="Next week"><Plus size={18} /></button>
          </div>
          <div className="chips center-chips">
            {["Pregnant", "Postpartum"].map((s) => <Chip small key={s} active={p.stage === s} onClick={() => set({ stage: s })}>{s}</Chip>)}
          </div>
        </div>

        <h4 className="group-title">Food & culture</h4>
        <div className="list">
          <Row label="Cultural cuisines" value={p.cuisines.join(", ")} onClick={() => setEdit("cuisines")} />
          <Row label="Eating pattern" value={p.diet} onClick={() => setEdit("diet")} />
          <Row label="Allergies" value={p.allergies.join(", ")} onClick={() => setEdit("allergies")} />
          <Row label="Foods I love" value={p.loves.join(", ")} onClick={() => setEdit("loves")} />
          <Row label="Foods I avoid" value={p.avoids.join(", ") || "None"} onClick={() => notify("Editing coming soon in this demo")} />
        </div>

        <h4 className="group-title">Everyday life</h4>
        <div className="list">
          <Row label="Cooking time" value={p.cookTime} onClick={() => setEdit("cookTime")} />
          <Row label="Grocery budget" value={p.budget} onClick={() => setEdit("budget")} />
          <Row label="Household" value={`${p.household} people`} onClick={() => set({ household: p.household === 6 ? 1 : p.household + 1 })} />
          <Row label="Goals" value={p.goals.join(" · ")} onClick={() => notify("Goals update from your check-ins")} />
        </div>

        <h4 className="group-title">Care team (optional)</h4>
        <div className="list">
          <Row label="Provider's office" value="Add number" onClick={() => notify("Saved on this device only (demo)")} />
          <Row label="Labor & delivery" value="Add number" onClick={() => notify("Saved on this device only (demo)")} />
        </div>

        <h4 className="group-title">Notifications</h4>
        <div className="list">
          <Toggle label="Daily check-in" on={state.notifications.checkins} onClick={() => dispatch({ type: "notifications", k: "checkins" })} />
          <Toggle label="Village replies" on={state.notifications.village} onClick={() => dispatch({ type: "notifications", k: "village" })} />
          <Toggle label="Weekly nutrition tips" on={state.notifications.tips} onClick={() => dispatch({ type: "notifications", k: "tips" })} />
          <Toggle label="Appointment reminders" on={state.notifications.appointments} onClick={() => dispatch({ type: "notifications", k: "appointments" })} />
        </div>

        <h4 className="group-title">Community</h4>
        <div className="list">
          <Toggle label="Post anonymously by default" on={state.privacy.anonymousDefault} onClick={() => dispatch({ type: "privacy", k: "anonymousDefault" })} />
          <Toggle label="Show my pregnancy week in the Village" on={state.privacy.showWeek} onClick={() => dispatch({ type: "privacy", k: "showWeek" })} />
          <Toggle label="Allow direct messages" on={state.community.dms} onClick={() => dispatch({ type: "community", k: "dms" })} />
        </div>

        <h4 className="group-title">Privacy</h4>
        <div className="list">
          <button className="row" onClick={() => nav.go("mydata")}><span><Lock size={15} /> My data & privacy</span><b>You're in control</b><ChevronRight size={16} /></button>
        </div>

        <div className="card about">
          <p className="eyebrow">About this demo</p>
          <p className="muted">An interactive Amara Health demo with sample content for Maya. Try anything, then reset to start fresh.</p>
          <div className="about-actions">
            <button className="btn btn-soft" onClick={() => { dispatch({ type: "set", patch: { onboarded: false } }); nav.tab("home"); }}><Sparkles size={16} /> Replay onboarding</button>
            <button className="btn btn-ghost" onClick={() => { dispatch({ type: "reset" }); nav.tab("home"); }}><RefreshCw size={16} /> Reset demo</button>
          </div>
        </div>
      </div>

      <Sheet open={!!edit} onClose={() => setEdit(null)} title="Update your preferences">
        <div className="chips">
          {edit === "cuisines" && ONBOARD_CUISINES.map((c) => <Chip small key={c} active={p.cuisines.includes(c)} onClick={() => toggle("cuisines", c)}>{c}</Chip>)}
          {edit === "diet" && DIET_PATTERNS.map((c) => <Chip small key={c} active={p.diet === c} onClick={() => set({ diet: c })}>{c}</Chip>)}
          {edit === "allergies" && ALLERGIES.map((c) => <Chip small key={c} active={p.allergies.includes(c)} onClick={() => toggle("allergies", c)}>{c}</Chip>)}
          {edit === "loves" && ["Plantain", "Jollof rice", "Beans", "Spinach", "Chicken", "Fish", "Rice", "Eggs", "Okra", "Lentils", "Tortillas", "Yogurt"].map((c) => <Chip small key={c} active={p.loves.includes(c)} onClick={() => toggle("loves", c)}>{c}</Chip>)}
          {edit === "cookTime" && ["Under 15 minutes", "Under 30 minutes", "30–60 minutes", "I love to cook"].map((c) => <Chip small key={c} active={p.cookTime === c} onClick={() => set({ cookTime: c })}>{c}</Chip>)}
          {edit === "budget" && ["Under $50", "$50–75 a week", "$75–125", "Prefer not to say"].map((c) => <Chip small key={c} active={p.budget === c} onClick={() => set({ budget: c })}>{c}</Chip>)}
        </div>
        <button className="btn btn-primary btn-block" onClick={() => { setEdit(null); notify("Preferences updated"); }}>Done</button>
      </Sheet>
    </div>
  );
}

export function MyData() {
  const { state, dispatch, notify } = useStore();
  const pv = state.privacy;
  const [confirm, setConfirm] = useState(false);
  return (
    <div>
      <TopBar title="My data" />
      <div className="pad">
        <h1 className="display-sm">Your information belongs to you.</h1>
        <p className="muted">Here's exactly what Amara keeps, why, and what you control.</p>

        <div className="card data-card">
          <h4>What Amara stores</h4>
          <ul className="data-list">
            <li><b>Your profile</b><span>Stage, week, cuisines, preferences and allergies, so guidance fits you.</span></li>
            <li><b>Check-ins</b><span>How you've been feeling, to tune suggestions. Never shared by default.</span></li>
            <li><b>Saved foods, recipes & plates</b><span>So you can find them again.</span></li>
            <li><b>Questions for your visit</b><span>Shared only when you choose to.</span></li>
            <li><b>Village posts</b><span>Visible to members of the room you post in. Anonymous posts are not linked to your name.</span></li>
          </ul>
        </div>

        <div className="card data-card">
          <h4>What Amara never asks for</h4>
          <ul className="data-list never">
            <li><b>Your full name, birth date or address</b><span>A first name and an approximate area are enough.</span></li>
            <li><b>Social Security, insurance or Medicaid numbers</b><span>Your care team collects these securely, not Amara.</span></li>
            <li><b>Immigration status</b><span>Never asked, never needed for any feature.</span></li>
            <li><b>Medical records or test results</b><span>You share only what you choose, in your own words.</span></li>
          </ul>
          <p className="muted small">Sensitive answers, like the Life & resources check-in, are optional, can be skipped, and are never shared unless you turn sharing on.</p>
        </div>

        <h4 className="group-title">You control</h4>
        <div className="list">
          <Toggle label="Personalize with my check-ins" desc="Afya uses your check-ins to tailor suggestions" on={pv.personalization} onClick={() => dispatch({ type: "privacy", k: "personalization" })} />
          <Toggle label="Share summaries with my care team" desc="Off until you turn it on for a specific visit" on={pv.shareWithProvider} onClick={() => dispatch({ type: "privacy", k: "shareWithProvider" })} />
          <Toggle label="Contribute to de-identified research" desc="Optional. Helps improve maternal nutrition care" on={pv.research} onClick={() => dispatch({ type: "privacy", k: "research" })} />
        </div>

        <div className="card">
          <p className="muted small">Amara never sells your personal data. Health information is encrypted and you can export or delete it at any time.</p>
          <div className="about-actions">
            <button className="btn btn-soft" onClick={() => notify("Your data export is being prepared")}><Download size={16} /> Download my data</button>
            <button className="btn btn-ghost danger" onClick={() => setConfirm(true)}><Trash2 size={16} /> Delete my data</button>
          </div>
        </div>
      </div>
      <Sheet open={confirm} onClose={() => setConfirm(false)} title="Delete your data?">
        <p className="muted">In the real app, this permanently removes your profile, check-ins and saved items. In this demo it simply resets Maya's sample data.</p>
        <button className="btn btn-primary btn-block" onClick={() => { setConfirm(false); notify("Demo data reset"); dispatch({ type: "reset" }); }}>Reset demo data</button>
        <button className="btn btn-ghost btn-block" onClick={() => setConfirm(false)}>Keep my data</button>
      </Sheet>
    </div>
  );
}
