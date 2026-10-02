import { useState } from "react";
import { HeartPulse, Scale, Plus, AlertTriangle, Phone, ClipboardList, ArrowRight, Check, Baby, Lock, ShieldCheck, Sparkles, CalendarDays, Activity, Home as HomeIcon, Bus, ShoppingBasket, Users, Zap, Briefcase, HeartHandshake } from "lucide-react";
import { useStore } from "./useStore";
import { TopBar, SectionHead, Disclaimer, Chip, Toggle } from "./ui";
import { BABY_GROWTH, MILESTONES, SDOH_QUESTIONS } from "./data";
import { bpStatus, weightBand, trimester } from "./helpers";

/* ---------- Small SVG line chart ---------- */
function LineChart({ series, xKey = "week", h = 170, yMin, yMax, bands = [], refs = [], xLabel = "Week", unit = "" }) {
  const W = 320, H = h, L = 34, R = 10, T = 12, B = 26;
  const xs = series.flatMap((s) => s.data.map((d) => d[xKey])).concat(bands.flatMap((b) => b.data.map((d) => d[xKey])));
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const X = (v) => L + ((v - x0) / Math.max(1, x1 - x0)) * (W - L - R);
  const Y = (v) => T + (1 - (v - yMin) / (yMax - yMin)) * (H - T - B);
  const ticks = 4;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label={series.map((s) => s.label).join(", ") + " over time"}>
      {Array.from({ length: ticks + 1 }).map((_, i) => {
        const v = yMin + ((yMax - yMin) * i) / ticks;
        return <g key={i}><line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} className="grid" /><text x={L - 6} y={Y(v) + 3} className="axis" textAnchor="end">{Math.round(v)}</text></g>;
      })}
      {bands.map((b) => (
        <path key={b.label} className="band" style={{ fill: b.color }} d={`M${b.data.map((d) => `${X(d[xKey])},${Y(d.hi)}`).join(" L")} L${[...b.data].reverse().map((d) => `${X(d[xKey])},${Y(d.lo)}`).join(" L")} Z`} />
      ))}
      {refs.map((r) => (
        <g key={r.label}><line x1={L} x2={W - R} y1={Y(r.v)} y2={Y(r.v)} className="ref" style={{ stroke: r.color }} /><text x={W - R} y={Y(r.v) - 4} textAnchor="end" className="ref-lbl" style={{ fill: r.color }}>{r.label}</text></g>
      ))}
      {series.map((s) => (
        <g key={s.label}>
          <polyline fill="none" stroke={s.color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" points={s.data.map((d) => `${X(d[xKey])},${Y(d[s.key])}`).join(" ")} />
          {s.data.map((d, i) => <circle key={i} cx={X(d[xKey])} cy={Y(d[s.key])} r="3.5" fill="#FFFDF9" stroke={s.color} strokeWidth="2"><title>{`${xLabel} ${d[xKey]}: ${d[s.key]}${unit}`}</title></circle>)}
        </g>
      ))}
      <text x={(W + L) / 2} y={H - 4} textAnchor="middle" className="axis">{xLabel}</text>
      {[x0, Math.round((x0 + x1) / 2), x1].map((v) => <text key={v} x={X(v)} y={H - 14} textAnchor="middle" className="axis">{v}</text>)}
    </svg>
  );
}

function Legend({ items }) {
  return <div className="legend">{items.map(([c, l]) => <span key={l}><i style={{ background: c }} />{l}</span>)}</div>;
}

/* ---------- My health: blood pressure + weight ---------- */
export function Health({ tab: tab0 = "Blood pressure" }) {
  const { state, dispatch, notify } = useStore();
  const [tab, setTab] = useState(tab0);
  const [sys, setSys] = useState("");
  const [dia, setDia] = useState("");
  const [lb, setLb] = useState("");
  const [warn, setWarn] = useState(null);
  const p = state.profile;
  const bp = state.bp;
  const last = bp[bp.length - 1];
  const st = last ? bpStatus(last.s, last.d) : null;
  const wt = state.weight;
  const lastW = wt[wt.length - 1];
  const band = weightBand(p.week);

  const logBP = (e) => {
    e.preventDefault();
    const s = Number(sys), d = Number(dia);
    if (!s || !d || s < 60 || s > 250 || d < 30 || d > 160) { notify("Please check the numbers"); return; }
    dispatch({ type: "bp", reading: { week: p.week, s, d, when: "Today" } });
    setSys(""); setDia("");
    const status = bpStatus(s, d);
    setWarn(status.level >= 2 ? status : null);
    notify("Reading saved");
  };
  const logW = (e) => {
    e.preventDefault();
    const g = Number(lb);
    if (isNaN(g) || lb === "") return;
    dispatch({ type: "weight", entry: { week: p.week, gain: g } });
    setLb("");
    notify("Weight saved");
  };

  return (
    <div>
      <TopBar title="My health" />
      <div className="pad">
        <h1 className="display-sm">Your health, week by week.</h1>
        <p className="muted">Simple tracking you can bring to every visit. You decide what's shared.</p>
        <div className="seg-light">
          {["Blood pressure", "Weight", "Symptoms"].map((t) => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}
        </div>

        {tab === "Blood pressure" && (
          <>
            {last && (
              <div className={"card bp-hero lvl" + st.level}>
                <HeartPulse size={22} />
                <div>
                  <p className="eyebrow">Latest reading · week {last.week}</p>
                  <p className="bp-num">{last.s}<span>/</span>{last.d} <small>mmHg</small></p>
                  <p className="bp-status"><b>{st.label}.</b> {st.text}</p>
                </div>
              </div>
            )}
            {warn && (
              <div className="alert">
                <AlertTriangle size={18} />
                <div>
                  <b>{warn.level === 3 ? "Please get care now." : "Please call your provider today."}</b>
                  <p>{warn.level === 3 ? "A reading this high in pregnancy needs urgent attention. Call your provider or go to labor & delivery now. If you have severe symptoms, call 911." : "A reading of 140/90 or higher in pregnancy should be checked the same day."}</p>
                </div>
              </div>
            )}
            <form className="card log-form" onSubmit={logBP}>
              <p className="eyebrow">Log a reading</p>
              <div className="bp-inputs">
                <label><span>Systolic (top)</span><input inputMode="numeric" value={sys} onChange={(e) => setSys(e.target.value.replace(/\D/g, ""))} placeholder="118" /></label>
                <span className="slash">/</span>
                <label><span>Diastolic (bottom)</span><input inputMode="numeric" value={dia} onChange={(e) => setDia(e.target.value.replace(/\D/g, ""))} placeholder="76" /></label>
              </div>
              <button className="btn btn-primary btn-block" disabled={!sys || !dia}><Plus size={16} /> Save reading</button>
              <p className="muted small">Sit quietly for 5 minutes, feet flat, arm at heart level. Use the same arm each time.</p>
            </form>
            <SectionHead title="Your trend" />
            <div className="card">
              <LineChart
                series={[{ label: "Systolic", key: "s", color: "#C7613A", data: bp }, { label: "Diastolic", key: "d", color: "#3E4A2E", data: bp }]}
                yMin={50} yMax={170} unit=" mmHg"
                refs={[{ v: 140, label: "140", color: "#C7613A" }, { v: 90, label: "90", color: "#7A8A5A" }]}
              />
              <Legend items={[["#C7613A", "Systolic"], ["#3E4A2E", "Diastolic"]]} />
              {bp.length > 2 && bp[bp.length - 1].s - bp[0].s >= 10 && <p className="small trend-note">Your top number has risen {bp[bp.length - 1].s - bp[0].s} points since week {bp[0].week}. It's still under 140/90, and worth mentioning at your next visit.</p>}
              <button className="link" onClick={() => { dispatch({ type: "addQ", text: `My blood pressure went from ${bp[0].s}/${bp[0].d} to ${last.s}/${last.d}. Is that something to watch?`, from: "Health" }); notify("Added to For My Visit"); }}><ClipboardList size={14} /> Add to For My Visit</button>
            </div>
            <div className="history">
              {[...bp].reverse().map((r, i) => { const s2 = bpStatus(r.s, r.d); return <div key={i}><span>Week {r.week}{r.when ? ` · ${r.when}` : ""}</span><b>{r.s}/{r.d}</b><i className={"dot-lvl lvl" + s2.level} title={s2.label} /></div>; })}
            </div>
            <div className="card warn-signs">
              <p className="eyebrow"><AlertTriangle size={13} /> Call right away if you notice</p>
              <ul>
                <li>A severe headache that won't go away</li>
                <li>Changes in vision: blurring, spots or flashing lights</li>
                <li>Pain in the upper belly or right side</li>
                <li>Sudden swelling of the face or hands</li>
                <li>Trouble breathing</li>
              </ul>
              <p className="muted small">These can be signs of preeclampsia, which can happen during pregnancy and up to 6 weeks after birth.</p>
            </div>
          </>
        )}

        {tab === "Weight" && (
          <>
            <div className="card bp-hero lvl1">
              <Scale size={22} />
              <div>
                <p className="eyebrow">Gained so far · week {lastW?.week}</p>
                <p className="bp-num">{lastW?.gain}<small> lb</small></p>
                <p className="bp-status">{lastW && lastW.gain >= band.lo && lastW.gain <= band.hi ? <><b>Right on track.</b> A typical range at week {p.week} is about {band.lo}–{band.hi} lb.</> : <>A typical range at week {p.week} is about {band.lo}–{band.hi} lb. Every body is different, so talk with your provider about what's right for you.</>}</p>
              </div>
            </div>
            <div className="card">
              <LineChart
                series={[{ label: "Your gain", key: "gain", color: "#3E4A2E", data: wt }]}
                bands={[{ label: "Typical range", color: "rgba(224,177,76,.22)", data: [8, 12, 16, 20, 24, 28, 32, 36, 40].map((w) => ({ week: w, ...weightBand(w) })) }]}
                yMin={0} yMax={40} unit=" lb"
              />
              <Legend items={[["#3E4A2E", "Your gain"], ["rgba(224,177,76,.5)", "Typical range (pre-pregnancy BMI 18.5–24.9)"]]} />
            </div>
            <form className="card log-form row-form" onSubmit={logW}>
              <label><span>Total gained so far (lb)</span><input inputMode="decimal" value={lb} onChange={(e) => setLb(e.target.value.replace(/[^\d.]/g, ""))} placeholder="14" /></label>
              <button className="btn btn-primary" disabled={!lb}><Plus size={16} /> Save</button>
            </form>
            <p className="muted small">Ranges follow National Academy of Medicine guidance and depend on your pre-pregnancy BMI. This is never about a "perfect" number.</p>
          </>
        )}

        {tab === "Symptoms" && <SymptomLog />}

        <Disclaimer text="Tracking is for your own awareness and conversations with your care team. It does not replace medical care." />
      </div>
    </div>
  );
}

function SymptomLog() {
  const { state, dispatch, notify } = useStore();
  const opts = ["Fatigue", "Nausea", "Heartburn", "Headache", "Swelling", "Trouble sleeping", "Constipation", "Feeling low", "Cramps", "Dizziness"];
  const [pick, setPick] = useState([]);
  const toggle = (o) => setPick((x) => (x.includes(o) ? x.filter((y) => y !== o) : [...x, o]));
  const counts = state.symptoms.reduce((a, e) => { e.list.forEach((s) => { a[s] = (a[s] || 0) + 1; }); return a; }, {});
  return (
    <>
      <div className="card">
        <p className="eyebrow">How's your body today?</p>
        <div className="chips">{opts.map((o) => <Chip small key={o} active={pick.includes(o)} onClick={() => toggle(o)}>{o}</Chip>)}</div>
        {pick.some((p) => ["Headache", "Swelling", "Dizziness"].includes(p)) && <div className="alert soft"><AlertTriangle size={16} /><p>Headaches, swelling or dizziness can sometimes be linked to blood pressure. Check your blood pressure, and call your provider if it's 140/90 or higher or the symptom is severe.</p></div>}
        {pick.includes("Feeling low") && <div className="alert soft"><HeartHandshake size={16} /><p>You're not alone. The National Maternal Mental Health Hotline is free and confidential 24/7: call or text 1-833-TLC-MAMA.</p></div>}
        <button className="btn btn-primary btn-block" disabled={!pick.length} onClick={() => { dispatch({ type: "symptom", entry: { week: state.profile.week, day: "Today", list: pick } }); setPick([]); notify("Symptoms saved"); }}>Save today</button>
      </div>
      <SectionHead title="Patterns over time" />
      <div className="card">
        <div className="mood-bars">
          {Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([s, c]) => <div key={s}><span>{s}</span><i style={{ width: `${(c / state.symptoms.length) * 100}%` }} /><b>{c}</b></div>)}
        </div>
        <p className="muted small" style={{ marginTop: 10 }}>Based on {state.symptoms.length} days logged since week {state.symptoms[0]?.week}.</p>
      </div>
    </>
  );
}

/* ---------- 1,000 days: longitudinal view ---------- */
export function Timeline() {
  const { state, nav } = useStore();
  const p = state.profile;
  const day = p.stage === "Postpartum" ? 280 + p.week * 7 : p.week * 7;
  const phases = [
    { id: "preg", name: "Pregnancy", range: "Days 1–280", from: 0, to: 280 },
    { id: "fourth", name: "Fourth trimester", range: "Birth to 12 weeks", from: 280, to: 364 },
    { id: "infant", name: "Infancy", range: "3 to 12 months", from: 364, to: 645 },
    { id: "toddler", name: "Toddlerhood", range: "12 to 24 months", from: 645, to: 1000 },
  ];
  const weekly = state.weekly;
  return (
    <div>
      <TopBar title="Your 1,000 days" />
      <div className="pad">
        <div className="thousand">
          <p className="eyebrow light">From pregnancy to age two</p>
          <p className="t-day">Day {day}<small> of 1,000</small></p>
          <div className="t-bar">
            {phases.map((ph) => <span key={ph.id} style={{ flex: ph.to - ph.from }} className={day >= ph.to ? "done" : day >= ph.from ? "now" : ""} />)}
            <i style={{ left: `${(day / 1000) * 100}%` }} />
          </div>
          <div className="t-phases">{phases.map((ph) => <span key={ph.id}><b>{ph.name}</b>{ph.range}</span>)}</div>
        </div>

        <SectionHead title="Blood pressure over time" action="Open" onAction={() => nav.go("health")} />
        <div className="card">
          <LineChart series={[{ label: "Systolic", key: "s", color: "#C7613A", data: state.bp }, { label: "Diastolic", key: "d", color: "#3E4A2E", data: state.bp }]} yMin={50} yMax={170} refs={[{ v: 140, label: "140", color: "#C7613A" }]} unit=" mmHg" />
          <Legend items={[["#C7613A", "Systolic"], ["#3E4A2E", "Diastolic"]]} />
        </div>

        <SectionHead title="Weight gain" action="Open" onAction={() => nav.go("health", { tab: "Weight" })} />
        <div className="card">
          <LineChart series={[{ label: "Gain", key: "gain", color: "#3E4A2E", data: state.weight }]} bands={[{ label: "Typical", color: "rgba(224,177,76,.22)", data: [8, 12, 16, 20, 24, 28].map((w) => ({ week: w, ...weightBand(w) })) }]} yMin={0} yMax={25} unit=" lb" />
        </div>

        <SectionHead title="Energy & food variety by week" />
        <div className="card">
          <div className="bars">
            {weekly.map((w) => (
              <div key={w.week} className="bar-col">
                <div className="bar-pair">
                  <i className="b1" style={{ height: `${w.energy * 20}%` }} title={`Energy ${w.energy}/5`} />
                  <i className="b2" style={{ height: `${(w.foods / 12) * 100}%` }} title={`${w.foods} plant foods`} />
                </div>
                <small>Wk {w.week}</small>
              </div>
            ))}
          </div>
          <Legend items={[["#E0B14C", "Average energy (1–5)"], ["#7A8A5A", "Plant foods explored"]]} />
          <p className="small trend-note">Energy dipped around weeks 21–23 as your iron needs climbed, and your food variety kept growing. That's a pattern worth sharing at your visit.</p>
        </div>

        <SectionHead title="Care along the way" />
        <div className="visits">
          {state.visits.map((v) => (
            <div key={v.week} className={"visit-row" + (v.upcoming ? " upcoming" : "")}>
              <span className="v-week">Wk {v.week}</span>
              <div><b>{v.title}</b><small>{v.note}</small></div>
              {v.upcoming ? <CalendarDays size={16} /> : <Check size={16} />}
            </div>
          ))}
        </div>

        <SectionHead title="After birth" />
        <div className="tools">
          <button onClick={() => nav.go("baby")}><Baby size={20} /><b>Baby & growth</b><small>Growth, milestones and feeding</small></button>
          <button onClick={() => nav.go("postpartum")}><HeartPulse size={20} /><b>Postpartum care</b><small>Recovery, mood and blood pressure</small></button>
        </div>
        <Disclaimer text="Sample data shown for Maya. Trends help conversations with your care team. They are not a diagnosis." />
      </div>
    </div>
  );
}

/* ---------- Baby & growth ---------- */
export function BabyScreen() {
  const { state, dispatch, notify } = useStore();
  const [tab, setTab] = useState("Growth");
  const [kg, setKg] = useState("");
  const baby = state.baby;
  return (
    <div>
      <TopBar title="Baby & growth" />
      <div className="pad">
        <div className="preview-note"><Sparkles size={14} /> Preview with sample data. This opens up once your baby arrives.</div>
        <h1 className="display-sm">Growing together, {baby.name}.</h1>
        <p className="muted">{baby.age} · feeding: {baby.feeding}</p>
        <div className="seg-light">
          {["Growth", "Milestones", "Feeding"].map((t) => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}
        </div>

        {tab === "Growth" && (
          <>
            <div className="card">
              <p className="eyebrow">Weight for age</p>
              <LineChart
                xKey="month" xLabel="Month"
                series={[{ label: baby.name, key: "kg", color: "#C7613A", data: baby.weights }]}
                bands={[{ label: "Typical", color: "rgba(122,138,90,.18)", data: BABY_GROWTH.map((g) => ({ month: g.month, lo: g.lo, hi: g.hi })) }]}
                yMin={2} yMax={15} unit=" kg"
              />
              <Legend items={[["#C7613A", baby.name], ["rgba(122,138,90,.4)", "Typical range (WHO, approx.)"]]} />
              <p className="small trend-note">{baby.name} is following her own curve steadily. Steady growth along a curve matters more than any single number.</p>
            </div>
            <form className="card log-form row-form" onSubmit={(e) => { e.preventDefault(); if (!kg) return; dispatch({ type: "babyWeight", kg: Number(kg) }); setKg(""); notify("Weight added"); }}>
              <label><span>Add a weight (kg)</span><input inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value.replace(/[^\d.]/g, ""))} placeholder="6.4" /></label>
              <button className="btn btn-primary" disabled={!kg}><Plus size={16} /> Save</button>
            </form>
          </>
        )}

        {tab === "Milestones" && (
          <div className="card">
            <ul className="focus-list">
              {MILESTONES.map((m) => {
                const on = baby.milestones.includes(m.id);
                return (
                  <li key={m.id}>
                    <button className={on ? "on" : ""} onClick={() => dispatch({ type: "milestone", id: m.id })}>
                      <span className="box">{on && <Check size={14} />}</span>{m.name}
                    </button>
                    <small className="m-age">~{m.age}</small>
                  </li>
                );
              })}
            </ul>
            <p className="muted small" style={{ marginTop: 10 }}>Every baby develops at their own pace. Ask your pediatrician if you have concerns.</p>
          </div>
        )}

        {tab === "Feeding" && (
          <>
            <div className="card">
              <p className="eyebrow">Today</p>
              <div className="feed-log">{baby.feeds.map((f, i) => <span key={i}><b>{f.time}</b>{f.type}</span>)}</div>
              <div className="actions">
                {["Breastfeed", "Bottle", "Solids"].map((t) => <button key={t} className="btn btn-soft btn-sm" onClick={() => { dispatch({ type: "feed", feed: { time: "Now", type: t } }); notify(`${t} logged`); }}><Plus size={14} /> {t}</button>)}
              </div>
            </div>
            <div className="card soft">
              <p className="eyebrow">First foods, from your kitchen</p>
              <p>Around 6 months, many families start with soft, iron-rich foods: mashed beans, well-cooked egg, soft-cooked greens, or a smooth version of a family stew without added salt. Offer peanut and egg early, as your pediatrician recommends.</p>
            </div>
          </>
        )}
        <Disclaimer text="Growth ranges are approximate and for illustration. Your pediatrician uses official WHO growth charts." />
      </div>
    </div>
  );
}

/* ---------- Postpartum ---------- */
export function Postpartum() {
  const { nav } = useStore();
  const items = [
    ["Blood pressure keeps mattering", "Preeclampsia can appear up to 6 weeks after birth. Amara keeps your BP tracking going and reminds you to check."],
    ["Mood check-ins", "Gentle weekly check-ins, with support close by if you're feeling low or anxious."],
    ["Recovery nourishment", "Warm, iron- and protein-rich foods from your traditions: soups, stews, congee, light soups and more."],
    ["Feeding support", "Breastfeeding, formula or both, with lactation resources near you."],
    ["Your 6-week visit", "A snapshot of your recovery, BP and mood to share with your provider."],
  ];
  return (
    <div>
      <TopBar title="Postpartum care" />
      <div className="pad">
        <div className="preview-note"><Sparkles size={14} /> Preview of what continues after birth.</div>
        <h1 className="display-sm">The fourth trimester, cared for.</h1>
        <div className="guide">
          {items.map(([a, b]) => <div key={a}><HeartPulse size={18} /><p><b>{a}</b>{b}</p></div>)}
        </div>
        <div className="card soft" style={{ marginTop: 18 }}>
          <p className="eyebrow"><Phone size={12} /> Anytime</p>
          <p>National Maternal Mental Health Hotline: call or text 1-833-TLC-MAMA (1-833-852-6262).</p>
        </div>
        <button className="btn btn-primary btn-block" onClick={() => nav.go("baby")}>See Baby & growth <ArrowRight size={16} /></button>
      </div>
    </div>
  );
}

/* ---------- Life & resources (social needs) ---------- */
const ICON = { food: ShoppingBasket, housing: HomeIcon, transport: Bus, utilities: Zap, support: Users, safety: ShieldCheck, stress: HeartHandshake, work: Briefcase };

export function Life() {
  const { state, dispatch, nav, notify } = useStore();
  const answers = state.sdoh.answers;
  const [step, setStep] = useState(state.sdoh.done ? "plan" : "intro");
  const set = (id, v) => dispatch({ type: "sdoh", patch: { answers: { ...answers, [id]: v } } });
  const needs = SDOH_QUESTIONS.filter((q) => q.need.includes(answers[q.id]));

  if (step === "intro") {
    return (
      <div>
        <TopBar title="Life & resources" />
        <div className="pad">
          <h1 className="display-sm">Life outside the kitchen matters too.</h1>
          <p className="muted">Money, housing, rides to appointments and support at home all shape how you eat and feel. A few optional questions help Amara point you to real help.</p>
          <div className="card soft"><Lock size={14} /> Your answers are private. Nothing is shared unless you choose to, and you can skip any question.</div>
          <button className="btn btn-primary btn-block" onClick={() => setStep("q")}>Start (about 2 minutes) <ArrowRight size={16} /></button>
          <button className="btn btn-ghost btn-block" style={{ marginTop: 10 }} onClick={() => nav.go("support")}>Just browse resources</button>
        </div>
      </div>
    );
  }

  if (step === "q") {
    return (
      <div>
        <TopBar title="A few questions" />
        <div className="pad">
          {SDOH_QUESTIONS.map((q) => {
            const I = ICON[q.id] || HeartHandshake;
            return (
              <div key={q.id} className="card sdoh-q">
                <p className="eyebrow"><I size={13} /> {q.topic}</p>
                <p className="q-text">{q.q}</p>
                <div className="chips">{q.options.map((o) => <Chip small key={o} active={answers[q.id] === o} onClick={() => set(q.id, o)}>{o}</Chip>)}</div>
              </div>
            );
          })}
          <button className="btn btn-primary btn-block" onClick={() => { dispatch({ type: "sdoh", patch: { done: true } }); setStep("plan"); }}>See my support plan</button>
          <p className="muted small center">Questions adapted from widely used screening tools, including the Hunger Vital Sign™.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar title="Your support plan" />
      <div className="pad">
        <h1 className="display-sm">{needs.length ? "Here's where a little help could go a long way." : "Thanks for sharing. You're well supported right now."}</h1>
        <p className="muted">Based on your answers. You can update them anytime.</p>
        {needs.map((q) => {
          const I = ICON[q.id] || HeartHandshake;
          return (
            <div key={q.id} className="card plan-need">
              <div className="need-head"><span className="need-ic"><I size={18} /></span><b>{q.topic}</b></div>
              <p>{q.help}</p>
              <button className="link" onClick={() => nav.go("support", { open: q.resource })}>{q.cta} <ArrowRight size={14} /></button>
            </div>
          );
        })}
        <div className="list">
          <Toggle label="Let a community health worker reach out" desc="Optional. A trained navigator can help with applications" on={state.sdoh.chw} onClick={() => { dispatch({ type: "sdoh", patch: { chw: !state.sdoh.chw } }); notify(state.sdoh.chw ? "Turned off" : "A navigator will reach out (demo)"); }} />
          <Toggle label="Include in my visit summary" desc="Helps your care team connect you with support" on={state.sdoh.share} onClick={() => dispatch({ type: "sdoh", patch: { share: !state.sdoh.share } })} />
        </div>
        <div className="actions">
          <button className="btn btn-soft" onClick={() => setStep("q")}>Update answers</button>
          <button className="btn btn-ghost" onClick={() => nav.go("support")}>All resources</button>
        </div>
        <Disclaimer text="If you're in danger, call 911. For confidential support with relationship safety, call the National Domestic Violence Hotline at 1-800-799-7233 or text START to 88788." />
      </div>
    </div>
  );
}

export function HealthSnapshot() {
  const { state, nav } = useStore();
  const last = state.bp[state.bp.length - 1];
  const st = bpStatus(last.s, last.d);
  return (
    <button className="card health-snap" onClick={() => nav.go("health")}>
      <div className="hs-item"><HeartPulse size={18} /><span><b>{last.s}/{last.d}</b><small>BP · {st.short}</small></span></div>
      <div className="hs-item"><Scale size={18} /><span><b>+{state.weight[state.weight.length - 1].gain} lb</b><small>On track</small></span></div>
      <div className="hs-item"><Activity size={18} /><span><b>{trimester(state.profile.week).split(" ")[0]}</b><small>Trimester</small></span></div>
      <ArrowRight size={18} />
    </button>
  );
}
