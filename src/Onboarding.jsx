import { useState } from "react";
import { ArrowRight, ChevronLeft, Minus, Plus, Sparkles } from "lucide-react";
import { useStore } from "./useStore";
import { Chip, Photo, AmaraLogo, AfyaMark } from "./ui";
import { ONBOARD_CUISINES, DIET_PATTERNS, ALLERGIES, CONCERNS } from "./data";

const STEPS = ["welcome", "stage", "week", "cuisines", "foods", "life", "concerns", "ready"];

function dueDateFor(week) {
  const d = new Date();
  d.setDate(d.getDate() + (40 - week) * 7);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function Onboarding() {
  const { state, dispatch } = useStore();
  const p = state.profile;
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const set = (patch) => dispatch({ type: "profile", patch });
  const toggle = (key, v) => set({ [key]: p[key].includes(v) ? p[key].filter((x) => x !== v) : [...p[key], v] });
  const next = () => setI((n) => Math.min(n + 1, STEPS.length - 1));
  const back = () => setI((n) => Math.max(n - 1, 0));
  const finish = () => dispatch({ type: "set", patch: { onboarded: true } });

  if (step === "welcome") {
    return (
      <div className="welcome">
        <Photo name="g-pregnant-cooking" pos="50% 35%" h={430} r={0} size={1400}>
          <div className="welcome-top"><AmaraLogo light /></div>
        </Photo>
        <div className="welcome-body">
          <p className="eyebrow">Every kitchen tells a story</p>
          <h1 className="display">Food that feels like home. Guidance you can trust.</h1>
          <p className="muted">Amara helps you nourish yourself and your baby with the foods, traditions and routines already in your life.</p>
          <button className="btn btn-primary btn-block" onClick={next}>Get started <ArrowRight size={18} /></button>
          <button className="btn btn-ghost btn-block" onClick={finish}>Explore as Maya (demo)</button>
        </div>
      </div>
    );
  }

  const progress = (i / (STEPS.length - 2)) * 100;

  return (
    <div className="onb">
      {step !== "ready" && (
        <div className="onb-top">
          <button className="icon-btn" onClick={back} aria-label="Back"><ChevronLeft size={22} /></button>
          <div className="progress"><i style={{ width: progress + "%" }} /></div>
          <button className="link" onClick={finish}>Skip</button>
        </div>
      )}

      {step === "stage" && (
        <Step title="Where are you in your journey?" sub="We'll shape everything around this. You can change it anytime.">
          {[["Pregnant", "Expecting a baby"], ["Postpartum", "My baby is here"], ["Planning for pregnancy", "Getting ready"]].map(([v, d]) => (
            <button key={v} className={"choice" + (p.stage === v ? " on" : "")} onClick={() => set({ stage: v })}>
              <b>{v}</b><small>{d}</small>
            </button>
          ))}
        </Step>
      )}

      {step === "week" && (
        <Step title={p.stage === "Postpartum" ? "How old is your baby?" : "How far along are you?"} sub="An estimate is fine.">
          <div className="week-picker">
            <button className="round-btn" onClick={() => set({ week: Math.max(4, p.week - 1) })} aria-label="Fewer weeks"><Minus size={20} /></button>
            <div><span className="week-num">{p.week}</span><span className="week-lbl">weeks</span></div>
            <button className="round-btn" onClick={() => set({ week: Math.min(41, p.week + 1) })} aria-label="More weeks"><Plus size={20} /></button>
          </div>
          {p.stage !== "Postpartum" && <p className="center muted">Estimated due date · <b>{dueDateFor(p.week)}</b></p>}
          <div className="stage-bar"><i style={{ width: `${(p.week / 40) * 100}%` }} /><span>1st</span><span>2nd</span><span>3rd</span></div>
        </Step>
      )}

      {step === "cuisines" && (
        <Step title="What foods feel like home to you?" sub="Choose as many as you'd like.">
          <div className="chips">
            {ONBOARD_CUISINES.map((c) => <Chip key={c} active={p.cuisines.includes(c)} onClick={() => toggle("cuisines", c)}>{c}</Chip>)}
          </div>
          <label className="field"><span>Anything else? Tell us in your own words</span><input placeholder="e.g. my grandmother's Trinidadian cooking" /></label>
        </Step>
      )}

      {step === "foods" && (
        <Step title="Tell us how you like to eat" sub="This helps Afya suggest foods you'll actually enjoy.">
          <p className="field-label">Foods you love</p>
          <div className="chips">
            {["Plantain", "Jollof rice", "Beans", "Spinach", "Chicken", "Fish", "Rice", "Eggs", "Okra", "Lentils", "Tortillas", "Yogurt"].map((c) => <Chip small key={c} active={p.loves.includes(c)} onClick={() => toggle("loves", c)}>{c}</Chip>)}
          </div>
          <p className="field-label">Eating pattern</p>
          <div className="chips">
            {DIET_PATTERNS.map((c) => <Chip small key={c} active={p.diet === c} onClick={() => set({ diet: c })}>{c}</Chip>)}
          </div>
          <p className="field-label">Allergies</p>
          <div className="chips">
            {ALLERGIES.map((c) => <Chip small key={c} active={p.allergies.includes(c)} onClick={() => set({ allergies: c === "None" ? ["None"] : (p.allergies.includes(c) ? p.allergies.filter((x) => x !== c) : [...p.allergies.filter((x) => x !== "None"), c]) })}>{c}</Chip>)}
          </div>
        </Step>
      )}

      {step === "life" && (
        <Step title="Make it fit your real life" sub="No judgment. We'll work with what you have.">
          <p className="field-label">Weekly grocery budget</p>
          <div className="chips">{["Under $50", "$50–75 a week", "$75–125", "Prefer not to say"].map((c) => <Chip small key={c} active={p.budget === c} onClick={() => set({ budget: c })}>{c}</Chip>)}</div>
          <p className="field-label">Time to cook on a typical day</p>
          <div className="chips">{["Under 15 minutes", "Under 30 minutes", "30–60 minutes", "I love to cook"].map((c) => <Chip small key={c} active={p.cookTime === c} onClick={() => set({ cookTime: c })}>{c}</Chip>)}</div>
          <p className="field-label">How often do you cook?</p>
          <div className="chips">{["Rarely", "2–3 nights a week", "4–5 nights a week", "Most days"].map((c) => <Chip small key={c} active={p.cookFreq === c} onClick={() => set({ cookFreq: c })}>{c}</Chip>)}</div>
          <p className="field-label">Kitchen</p>
          <div className="chips">{["Full kitchen", "Microwave & fridge", "Limited fridge space", "Shared kitchen"].map((c) => <Chip small key={c} active={p.kitchen === c} onClick={() => set({ kitchen: c })}>{c}</Chip>)}</div>
          <p className="field-label">People you feed</p>
          <div className="week-picker small">
            <button className="round-btn" onClick={() => set({ household: Math.max(1, p.household - 1) })} aria-label="Fewer"><Minus size={18} /></button>
            <span className="week-num">{p.household}</span>
            <button className="round-btn" onClick={() => set({ household: p.household + 1 })} aria-label="More"><Plus size={18} /></button>
          </div>
        </Step>
      )}

      {step === "concerns" && (
        <Step title="Anything on your mind?" sub="Optional. Choose what you'd like support with.">
          <div className="chips">{CONCERNS.map((c) => <Chip small key={c} active={p.concerns.includes(c)} onClick={() => toggle("concerns", c)}>{c}</Chip>)}</div>
          <div className="note-card">We only ask what helps us personalize your food guidance. No last name, birth date, address or insurance details, ever. You can skip anything and change it later.</div>
        </Step>
      )}

      {step === "ready" && (
        <div className="ready">
          <AfyaMark size={72} />
          <div className="ready-scope">Afya offers food and nutrition guidance. It never diagnoses, prescribes or changes medications, and urgent warning signs always point you to real care.</div>
          <h1 className="display">Your Amara is ready, {p.name}.</h1>
          <p className="muted">We've gathered foods from {p.cuisines.slice(0, 2).join(" and ") || "your kitchen"}, guidance for week {p.week}, and a Village of mamas who get it.</p>
          <div className="ready-list">
            <span><Sparkles size={16} /> Afya knows your foods and your week</span>
            <span><Sparkles size={16} /> Today's focus: {p.concerns.includes("Iron & energy") ? "iron & energy" : "steady nourishment"}</span>
            <span><Sparkles size={16} /> {p.household > 1 ? `Meals sized for ${p.household}` : "Meals sized for one"}</span>
          </div>
          <button className="btn btn-primary btn-block" onClick={finish}>Take me home <ArrowRight size={18} /></button>
        </div>
      )}

      {step !== "ready" && (
        <div className="onb-foot">
          <button className="btn btn-primary btn-block" onClick={next}>Continue <ArrowRight size={18} /></button>
        </div>
      )}
    </div>
  );
}

function Step({ title, sub, children }) {
  return (
    <div className="onb-step">
      <h1 className="display-sm">{title}</h1>
      {sub && <p className="muted">{sub}</p>}
      <div className="onb-body">{children}</div>
    </div>
  );
}
