import { Phone, AlertTriangle, ShieldCheck, Lock, HeartHandshake, Hospital, MessageCircle, Check, X, ArrowRight, Info } from "lucide-react";
import { useStore } from "./useStore";
import { TopBar } from "./ui";

/* What to do, by how urgent it is. Plain language, never a diagnosis. */
const TIERS = [
  {
    id: "emergency", tone: "red", title: "Call 911 now", icon: AlertTriangle,
    items: ["Chest pain or trouble breathing", "A seizure, fainting or being hard to wake", "Heavy bleeding (soaking a pad in an hour)", "Thoughts of harming yourself or your baby"],
    actions: [["Call 911", "tel:911"]],
  },
  {
    id: "urgent", tone: "clay", title: "Call your provider or go to labor & delivery today",
    icon: Hospital,
    items: ["Blood pressure 140/90 or higher (160/110 or higher: go now)", "A headache that won't go away, or vision changes", "Sudden swelling of your face or hands", "Pain in your upper belly", "Your baby is moving less than usual", "Any vaginal bleeding, or fluid leaking", "Fever of 100.4°F (38°C) or higher", "Regular contractions before 37 weeks", "You can't keep food or fluids down for a day"],
    actions: [["Call my provider", "tel:"], ["Labor & delivery", "tel:"]],
  },
  {
    id: "mind", tone: "sage", title: "If you're struggling emotionally", icon: HeartHandshake,
    items: ["Feeling hopeless, numb, or not like yourself", "Anxiety or panic that won't settle", "Thoughts that scare you"],
    actions: [["Call or text 988", "tel:988"], ["1-833-TLC-MAMA", "tel:18338526262"]],
  },
];

export function EscalationCard({ kind, bp }) {
  const { nav, notify } = useStore();
  const copy = {
    crisis: { t: "You deserve support right now.", b: "If you might act on thoughts of harming yourself or your baby, call 911. You can also call or text 988, or the National Maternal Mental Health Hotline at 1-833-TLC-MAMA (1-833-852-6262), any time.", a: [["Call or text 988", "tel:988"], ["Call 911", "tel:911"], ["1-833-TLC-MAMA", "tel:18338526262"]] },
    emergency: { t: bp ? `A reading of ${bp} needs care right now.` : "This could be an emergency.", b: "Please call 911 or go to the nearest labor & delivery unit now. Don't wait to see if it passes.", a: [["Call 911", "tel:911"], ["What to watch for", "urgent"]] },
    urgent: { t: bp ? `A reading of ${bp} should be checked today.` : "Please check in with your care team today.", b: "What you're describing should be looked at by a professional, not managed with food. Call your provider or labor & delivery. If it gets worse or you're worried, call 911.", a: [["Call my provider", "tel:"], ["What to watch for", "urgent"]] },
    unsafe: { t: "Your safety matters.", b: "Confidential help is available 24/7 from the National Domestic Violence Hotline: 1-800-799-7233, or text START to 88788. If you're in danger now, call 911.", a: [["Call the hotline", "tel:18007997233"], ["Call 911", "tel:911"]] },
    mood: { t: "Thank you for telling me.", b: "Feeling this way in pregnancy is common, and it's treatable. Please let your provider know. You can also call or text 1-833-TLC-MAMA any time to talk with a counselor.", a: [["1-833-TLC-MAMA", "tel:18338526262"], ["More support", "support:mental"]] },
  }[kind];
  if (!copy) return null;
  const go = (to) => {
    if (to.startsWith("tel:")) { if (to.length > 4) window.open(to, "_self"); else notify("Call your provider's office or labor & delivery line"); return; }
    if (to.startsWith("support:")) return nav.go("support", { open: to.split(":")[1] });
    nav.go(to);
  };
  return (
    <div className={"escalate esc-" + kind}>
      <p className="esc-tag"><AlertTriangle size={14} /> {kind === "mood" ? "Support is here" : "Safety first"}</p>
      <b>{copy.t}</b>
      <p>{copy.b}</p>
      <div className="esc-actions">
        {copy.a.map(([l, to]) => (
          <button key={l} className={to.startsWith("tel:") ? "esc-call" : "esc-link"} onClick={() => go(to)}>
            {to.startsWith("tel:") ? <Phone size={14} /> : <ArrowRight size={14} />} {l}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ScopeNote({ compact }) {
  return (
    <div className={"scope-note" + (compact ? " compact" : "")}>
      <ShieldCheck size={16} />
      <p>Afya shares food and nutrition guidance. It can't diagnose, prescribe, or change or stop any medication or supplement. Those decisions belong with your care team.</p>
    </div>
  );
}

export function ScopeList() {
  return (
    <div className="scope-grid">
      <div>
        <p className="eyebrow"><Check size={13} /> Afya can</p>
        <ul>
          <li>Suggest foods and meals that fit your culture, budget and week</li>
          <li>Explain why nutrients matter in pregnancy</li>
          <li>Help you prepare questions for your visit</li>
          <li>Point you to support and resources</li>
        </ul>
      </div>
      <div>
        <p className="eyebrow"><X size={13} /> Afya can't</p>
        <ul>
          <li>Diagnose a condition or read your test results</li>
          <li>Prescribe, or tell you to start, stop or change a medication, dose or supplement</li>
          <li>Replace your provider or handle an emergency</li>
        </ul>
      </div>
    </div>
  );
}

export function GetHelp() {
  const { nav, notify } = useStore();
  return (
    <div>
      <TopBar title="Get help now" />
      <div className="pad">
        <h1 className="display-sm">Know when to reach out.</h1>
        <p className="muted">Trust yourself. If something feels wrong, it's always okay to call. You will never be a bother.</p>
        {TIERS.map((t) => {
          const I = t.icon;
          return (
            <div key={t.id} className={"tier tier-" + t.tone}>
              <div className="tier-head"><I size={18} /><b>{t.title}</b></div>
              <ul>{t.items.map((i) => <li key={i}>{i}</li>)}</ul>
              <div className="esc-actions">
                {t.actions.map(([l, to]) => <a key={l} className="esc-call" href={to.length > 4 ? to : undefined} onClick={(e) => { if (to.length <= 4) { e.preventDefault(); notify("Use the number your care team gave you"); } }}><Phone size={14} /> {l}</a>)}
              </div>
            </div>
          );
        })}
        <div className="card soft">
          <p className="eyebrow"><Info size={12} /> Save your numbers</p>
          <p className="small">Add your provider's office and your hospital's labor & delivery line to your phone now, so they're ready when you need them.</p>
        </div>
        <button className="btn btn-ghost btn-block" onClick={() => nav.go("support", { open: "mental" })}><MessageCircle size={16} /> Emotional support resources</button>
        <p className="muted small center" style={{ marginTop: 14 }}>Based on ACOG and AWHONN urgent maternal warning signs. Amara does not monitor messages in real time.</p>
      </div>
    </div>
  );
}

export function RiskCards({ signals, max = 3 }) {
  const { dispatch, nav, notify } = useStore();
  if (!signals.length) return null;
  const act = (to) => {
    if (to === "urgent" || to === "health" || to === "budget") return nav.go(to);
    if (to.startsWith("support:")) return nav.go("support", { open: to.split(":")[1] });
    if (to.startsWith("library:")) return nav.go("library", { nutrient: to.split(":")[1] });
    if (to === "addq:iron") { dispatch({ type: "addQ", text: "I've been more tired than usual. Should we check my iron?", from: "Afya" }); return notify("Added to For My Visit"); }
    if (to === "addq:bp") { dispatch({ type: "addQ", text: "My blood pressure has been creeping up. Is that something to watch?", from: "Health" }); return notify("Added to For My Visit"); }
  };
  return (
    <div className="risk-list">
      {signals.slice(0, max).map((s) => (
        <div key={s.id} className={"risk risk-" + s.level}>
          <div className="risk-head">{s.level === "high" ? <AlertTriangle size={16} /> : s.level === "watch" ? <Info size={16} /> : <HeartHandshake size={16} />}<b>{s.title}</b></div>
          <p>{s.body}</p>
          <div className="risk-actions">{s.actions.map(([l, to]) => <button key={l} onClick={() => act(to)}>{l} <ArrowRight size={13} /></button>)}</div>
        </div>
      ))}
    </div>
  );
}

export function PrivacyNote({ items }) {
  if (!items.length) return null;
  return (
    <div className="pii-note">
      <Lock size={15} />
      <p>It looks like this includes {items.join(" and ")}. Amara doesn't need that, so please remove it. Your care team can collect it securely.</p>
    </div>
  );
}

export function HelpButton({ light }) {
  const { nav } = useStore();
  return (
    <button className={"help-btn" + (light ? " light" : "")} onClick={() => nav.go("urgent")} aria-label="Get help now">
      <Phone size={15} /> <span>Get help</span>
    </button>
  );
}
