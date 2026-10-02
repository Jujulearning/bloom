import { useState } from "react";
import { ArrowRight, Check, ClipboardList, CalendarDays, Sprout, Droplet, Plus, Trash2, Share2, FileText, Lock, ChevronRight, MapPin, Phone, ShoppingBasket, Stethoscope, Bus, HeartHandshake, Baby, Building2, HandHeart, Sparkles, HeartPulse, CalendarRange } from "lucide-react";
import { bpStatus } from "./helpers";
import { useStore } from "./useStore";
import { TopBar, Nutrient, SectionHead, Disclaimer, AfyaMark, Photo, Sheet, Empty } from "./ui";
import { RESOURCES, FOODS, CHECKIN } from "./data";
import { trimester } from "./helpers";
import { SDOH_QUESTIONS } from "./data";

const ICONS = { ShoppingBasket, Stethoscope, Bus, HeartHandshake, Baby, Building2, HandHeart };
const FOCUS = ["Explore iron-rich foods", "Try 3 different vegetables", "Prepare one freezer-friendly meal", "Ask provider about fatigue"];
const moodEmoji = (m) => CHECKIN.find((c) => c.id === m)?.emoji || "🤍";

export function Journey() {
  const { state, dispatch, nav } = useStore();
  const p = state.profile;
  const done = FOCUS.filter((f) => state.focusDone[f]).length;
  const plantFoods = 7 + Math.max(0, state.explored.length - 7);

  return (
    <div>
      <header className="journey-head">
        <p className="eyebrow light">My Journey</p>
        <h1 className="display">Week {p.week}</h1>
        <p>Your baby is growing quickly, and nutrients including iron, protein, and calcium continue to play important roles.</p>
        <div className="timeline">
          {["Pregnancy", "Birth", "Postpartum", "First foods", "Year two"].map((s, k) => (
            <span key={s} className={k === 0 ? "now" : ""}><i />{s}</span>
          ))}
        </div>
        <div className="tri-bar light"><i style={{ width: `${(p.week / 40) * 100}%` }} /></div>
        <small>{trimester(p.week)} · {40 - p.week} weeks to go</small>
      </header>

      <div className="pad">
        <div className="card">
          <div className="sec-head tight"><h3>This week's focus</h3><span className="count-pill">{done}/{FOCUS.length}</span></div>
          <ul className="focus-list">
            {FOCUS.map((f) => (
              <li key={f}>
                <button className={state.focusDone[f] ? "on" : ""} onClick={() => dispatch({ type: "focus", item: f })}>
                  <span className="box">{state.focusDone[f] && <Check size={14} />}</span>{f}
                </button>
                {f === "Ask provider about fatigue" && <button className="link" onClick={() => { dispatch({ type: "addQ", text: "I've been more tired than usual. Should we check my iron?", from: "Journey" }); nav.go("visit"); }}>Add <ChevronRight size={13} /></button>}
                {f === "Explore iron-rich foods" && <button className="link" onClick={() => nav.go("library", { nutrient: "Iron" })}>Go <ChevronRight size={13} /></button>}
              </li>
            ))}
          </ul>
        </div>

        <div className="stat-grid">
          <button className="stat" onClick={() => nav.go("reflection")}><Sprout size={18} /><b>{plantFoods}</b><span>plant foods explored this week</span></button>
          <button className="stat" onClick={() => nav.tab("home")}><Droplet size={18} /><b>{state.water}/10</b><span>cups of water today</span></button>
          <button className="stat" onClick={() => nav.go("recipes", { saved: true })}><Sparkles size={18} /><b>{state.savedRecipes.length + state.plates.length}</b><span>saved meals & plates</span></button>
          <button className="stat" onClick={() => nav.go("visit")}><ClipboardList size={18} /><b>{state.visitQs.length}</b><span>questions for your visit</span></button>
        </div>

        <button className="card reflect-cta" onClick={() => nav.go("reflection")}>
          <div><p className="eyebrow">Weekly reflection</p><h3 className="serif-lg">Your week in food</h3><p className="muted small">You explored {plantFoods} different plant foods this week.</p></div>
          <ArrowRight size={20} />
        </button>

        <SectionHead title="Check-ins" />
        <div className="checkin-strip">
          {state.checkins.slice(-7).map((c, k) => <span key={k}><b>{moodEmoji(c.mood)}</b><small>{c.day}</small></span>)}
        </div>

        <SectionHead title="Coming up" />
        <div className="card appt">
          <CalendarDays size={20} />
          <div><b>Prenatal visit</b><p className="muted small">Next Thursday · 10:30 AM · with your OB</p></div>
          <button className="btn btn-sm btn-soft" onClick={() => nav.go("visit")}>Prepare</button>
        </div>
        <div className="card appt">
          <Stethoscope size={20} />
          <div><b>Glucose screening</b><p className="muted small">Usually between 24 and 28 weeks. Ask your provider when.</p></div>
        </div>

        <SectionHead title="Saved plates" />
        {state.plates.slice(-3).reverse().map((pl) => (
          <div key={pl.id} className="plate-row">
            <span className="plate-dot" />
            <div><b>{pl.base}</b><small>{Object.values(pl.picks).join(" · ")}</small></div>
          </div>
        ))}

        <SectionHead title="Over time" />
        <div className="tools">
          <button onClick={() => nav.go("health")}><HeartPulse size={20} /><b>Blood pressure</b><small>Latest {state.bp[state.bp.length - 1].s}/{state.bp[state.bp.length - 1].d} · see trend</small></button>
          <button onClick={() => nav.go("timeline")}><CalendarRange size={20} /><b>My 1,000 days</b><small>Pregnancy to age two</small></button>
          <button onClick={() => nav.go("baby")}><Baby size={20} /><b>Baby & growth</b><small>Growth, milestones, feeding</small></button>
          <button onClick={() => nav.go("postpartum")}><HeartHandshake size={20} /><b>Postpartum care</b><small>Recovery, mood and BP</small></button>
        </div>
      </div>
    </div>
  );
}

export function Reflection() {
  const { state, nav } = useStore();
  const explored = FOODS.filter((f) => state.explored.includes(f.id));
  const nutrients = [...new Set(explored.flatMap((f) => f.nutrients))];
  const counts = state.checkins.reduce((a, c) => ({ ...a, [c.mood]: (a[c.mood] || 0) + 1 }), {});
  return (
    <div>
      <TopBar title="Weekly reflection" />
      <div className="pad">
        <p className="eyebrow">Week {state.profile.week}</p>
        <h1 className="display-sm">Your week in food</h1>
        <div className="card big-stat">
          <Sprout size={22} />
          <p className="serif-lg">You explored <b>{Math.max(7, explored.length)}</b> different plant foods this week.</p>
          <p className="muted small">Variety helps you get a wider range of nutrients. That's a lovely mix.</p>
        </div>
        <p className="field-label">Foods you explored</p>
        <div className="chips">{explored.map((f) => <button key={f.id} className="chip sm" onClick={() => nav.go("food", { id: f.id })}>{f.name}</button>)}</div>
        <p className="field-label">Nutrients you leaned into</p>
        <div className="tags">{nutrients.map((n) => <Nutrient key={n} n={n} />)}</div>
        <p className="field-label">How you've been feeling</p>
        <div className="mood-bars">
          {Object.entries(counts).map(([m, c]) => (
            <div key={m}><span>{moodEmoji(m)} {m}</span><i style={{ width: `${(c / state.checkins.length) * 100}%` }} /><b>{c}</b></div>
          ))}
        </div>
        {(counts.Tired || 0) >= 2 && (
          <div className="card soft">
            <p>You've felt tired on several days. That's really common in pregnancy, and worth mentioning at your next visit.</p>
            <button className="link" onClick={() => nav.go("visit")}>Add it to For My Visit <ArrowRight size={14} /></button>
          </div>
        )}
        <div className="card">
          <p className="eyebrow">For next week</p>
          <p>Try one new iron-rich food from home, like mchicha or callaloo, with something bright like tomato or orange.</p>
        </div>
      </div>
    </div>
  );
}

export function Visit() {
  const { state, dispatch, nav, notify } = useStore();
  const [text, setText] = useState("");
  const suggestions = ["I've been more tired than usual. Should we check my iron?", "I'm struggling to eat enough because of nausea.", "Are there nutrients I should prioritize this trimester?"].filter((q) => !state.visitQs.some((v) => v.text === q));
  return (
    <div>
      <TopBar title="For My Visit" />
      <div className="pad">
        <h1 className="display-sm">Bring your everyday life into the exam room.</h1>
        <p className="muted">Save questions from Afya or write your own. You choose what to bring and share.</p>

        <div className="qs">
          {state.visitQs.map((q) => (
            <div key={q.id} className={"q" + (q.share ? " on" : "")}>
              <button className="q-check" onClick={() => dispatch({ type: "toggleQ", id: q.id })} aria-label={q.share ? "Exclude from summary" : "Include in summary"}>{q.share && <Check size={14} />}</button>
              <div><p>{q.text}</p><small>{q.from === "Afya" ? "Saved from Afya" : q.from === "Journey" ? "From your Journey" : "Your question"}</small></div>
              <button className="icon-btn" onClick={() => dispatch({ type: "removeQ", id: q.id })} aria-label="Remove question"><Trash2 size={16} /></button>
            </div>
          ))}
          {!state.visitQs.length && <Empty>No questions yet.</Empty>}
        </div>

        <form className="add-q" onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; dispatch({ type: "addQ", text: text.trim() }); setText(""); notify("Question added"); }}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your own question…" aria-label="New question" />
          <button className="round-btn" aria-label="Add"><Plus size={18} /></button>
        </form>

        {!!suggestions.length && (
          <>
            <p className="field-label">Suggested for week {state.profile.week}</p>
            {suggestions.map((q) => <button key={q} className="suggest-q" onClick={() => { dispatch({ type: "addQ", text: q, from: "Afya" }); notify("Question added"); }}><Plus size={15} /> {q}</button>)}
          </>
        )}

        <button className="btn btn-primary btn-block" onClick={() => nav.go("summary")}><FileText size={17} /> Generate visit summary</button>
        <p className="muted small center"><Lock size={12} /> Nothing is shared unless you choose to share it.</p>
      </div>
    </div>
  );
}

function Sec({ k, label, children, inc, setInc }) {
  return (
    <div className={"sum-sec" + (inc[k] ? "" : " off")}>
      <div className="sum-head"><span>{label}</span><button className="link" onClick={() => setInc({ ...inc, [k]: !inc[k] })}>{inc[k] ? "Hide" : "Include"}</button></div>
      {inc[k] && children}
    </div>
  );
}

export function Summary() {
  const { state, dispatch, notify } = useStore();
  const p = state.profile;
  const [inc, setInc] = useState({ bp: true, concern: true, focus: true, foods: true, checkins: true, social: true, questions: true });
  const [share, setShare] = useState(false);
  const recentTired = state.checkins.filter((c) => c.mood === "Tired").length;
  const qs = state.visitQs.filter((q) => q.share);
  return (
    <div>
      <TopBar title="Visit summary" />
      <div className="pad">
        <div className="summary">
          <div className="sum-top">
            <AfyaMark size={34} />
            <div><p className="eyebrow">Amara · prepared by {p.name}</p><h2 className="display-sm">{p.name}'s Nutrition Snapshot</h2></div>
          </div>
          <div className="sum-meta"><span><b>Week {p.week}</b>{trimester(p.week)}</span><span><b>{p.diet}</b>Eating pattern</span><span><b>{p.cuisines[0]}</b>Food traditions</span></div>
          <Sec inc={inc} setInc={setInc} k="bp" label="Blood pressure"><p>{state.bp.slice(-4).map((r) => `Wk ${r.week}: ${r.s}/${r.d}`).join(" · ")}</p><p className="small muted">Latest: {bpStatus(state.bp[state.bp.length - 1].s, state.bp[state.bp.length - 1].d).label.toLowerCase()} · gradual rise since week 12</p></Sec>
          <Sec inc={inc} setInc={setInc} k="concern" label="Recent concern"><p>Fatigue {recentTired ? `(reported tired on ${recentTired} of the last ${state.checkins.length} check-ins)` : ""}</p></Sec>
          <Sec inc={inc} setInc={setInc} k="focus" label="Nutrition focus"><p>Iron, with protein and folate</p></Sec>
          <Sec inc={inc} setInc={setInc} k="foods" label="Foods frequently eaten"><div className="chips">{["Beans", "Chicken", "Plantain", "Spinach", "Jollof rice"].map((f) => <span key={f} className="alt">{f}</span>)}</div></Sec>
          <Sec inc={inc} setInc={setInc} k="checkins" label="Check-ins this week"><p>{state.checkins.map((c) => `${c.day}: ${c.mood}`).join(" · ")}</p></Sec>
          {state.sdoh.done && state.sdoh.share && <Sec inc={inc} setInc={setInc} k="social" label="Life & resources (shared by Maya)"><p>{SDOH_QUESTIONS.filter((q) => !["safety", "stress"].includes(q.id) && q.need.includes(state.sdoh.answers[q.id])).map((q) => q.topic).join(" · ") || "No needs flagged"}</p></Sec>}
          <Sec inc={inc} setInc={setInc} k="questions" label={`Questions for my provider (${qs.length})`}><ol>{qs.map((q) => <li key={q.id}>“{q.text}”</li>)}</ol></Sec>
          <p className="sum-foot">Self-reported by the patient through Amara for discussion. Not a clinical record.</p>
        </div>

        <div className="card control">
          <p className="eyebrow"><Lock size={12} /> You control what's shared</p>
          <p className="muted small">Hide any section above. Show this on your phone at your visit, or share it with your care team. It's only sent when you say so.</p>
        </div>
        <div className="actions col">
          <button className="btn btn-primary btn-block" onClick={() => setShare(true)}><Share2 size={17} /> Share with my care team</button>
          <button className="btn btn-soft btn-block" onClick={() => notify("Saved to show at your visit")}>Save to show at my visit</button>
        </div>
      </div>
      <Sheet open={share} onClose={() => setShare(false)} title="Share your snapshot?">
        <p className="muted">This sends only the sections you've included to your care team. You can stop sharing anytime in My data.</p>
        <div className="share-opts">
          <button onClick={() => { dispatch({ type: "set", patch: { privacy: { ...state.privacy, shareWithProvider: true } } }); setShare(false); notify("Shared securely with your care team (demo)"); }}><Stethoscope size={18} /> Send through patient portal <small>Coming later</small></button>
          <button onClick={() => { setShare(false); notify("PDF ready to download (demo)"); }}><FileText size={18} /> Download as PDF</button>
        </div>
        <button className="btn btn-ghost btn-block" onClick={() => setShare(false)}>Not now</button>
      </Sheet>
    </div>
  );
}

export function Support({ open: open0 = null }) {
  const { notify } = useStore();
  const [open, setOpen] = useState(open0);
  const cat = RESOURCES.find((r) => r.id === open);
  return (
    <div>
      <TopBar title="Support Near You" />
      <div className="pad">
        <Photo name="g-community-meal" pos="50% 30%" h={150} />
        <h1 className="display-sm" style={{ marginTop: 18 }}>Need a little extra support?</h1>
        <p className="muted">Pregnancy comes with enough to think about. Amara can help you find resources in your community.</p>
        <div className="loc"><MapPin size={15} /> Showing resources near <b>Baltimore, MD</b> <button className="link" onClick={() => notify("Location updated")}>Change</button></div>
        <div className="res-grid">
          {RESOURCES.map((r) => {
            const I = ICONS[r.icon] || HandHeart;
            return <button key={r.id} onClick={() => setOpen(r.id)}><I size={20} /><span>{r.label}</span></button>;
          })}
        </div>
        <div className="card soft">
          <p className="eyebrow"><Phone size={12} /> Anytime, day or night</p>
          <p><b>National Maternal Mental Health Hotline</b><br />Call or text 1-833-TLC-MAMA (1-833-852-6262)</p>
          <p className="muted small">If you are in crisis, call or text 988. In an emergency, call 911.</p>
        </div>
        <Disclaimer text="Resource details are examples for this prototype. Availability and eligibility vary by location." />
      </div>
      <Sheet open={!!cat} onClose={() => setOpen(null)} title={cat?.label}>
        {cat?.items.map((it) => (
          <div key={it.name} className="res-item">
            <b>{it.name}</b>
            <p className="muted small">{it.detail}</p>
            <button className="link" onClick={() => notify(`${it.action} (demo)`)}>{it.action} <ChevronRight size={14} /></button>
          </div>
        ))}
      </Sheet>
    </div>
  );
}

