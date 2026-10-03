import { useState } from "react";
import { HeartHandshake, Phone, ArrowRight, ArrowLeft, ClipboardList, Users, ExternalLink, Lock, ChevronDown, AlertTriangle, Sun, CloudRain, Brain } from "lucide-react";
import { useStore } from "./useStore";
import { TopBar } from "./ui";
import { EscalationCard } from "./Safety";

/* Edinburgh Postnatal Depression Scale (EPDS).
   Cox, J.L., Holden, J.M., & Sagovsky, R. (1987). Detection of postnatal depression: development of the
   10-item Edinburgh Postnatal Depression Scale. British Journal of Psychiatry, 150, 782–786.
   Validated in pregnancy and after birth. Options are listed in the original order; `rev` items score 3→0. */
const EPDS = [
  { q: "I have been able to laugh and see the funny side of things", o: ["As much as I always could", "Not quite so much now", "Definitely not so much now", "Not at all"] },
  { q: "I have looked forward with enjoyment to things", o: ["As much as I ever did", "Rather less than I used to", "Definitely less than I used to", "Hardly at all"] },
  { q: "I have blamed myself unnecessarily when things went wrong", o: ["Yes, most of the time", "Yes, some of the time", "Not very often", "No, never"], rev: true },
  { q: "I have been anxious or worried for no good reason", o: ["No, not at all", "Hardly ever", "Yes, sometimes", "Yes, very often"] },
  { q: "I have felt scared or panicky for no very good reason", o: ["Yes, quite a lot", "Yes, sometimes", "No, not much", "No, not at all"], rev: true },
  { q: "Things have been getting on top of me", o: ["Yes, most of the time I haven't been able to cope at all", "Yes, sometimes I haven't been coping as well as usual", "No, most of the time I have coped quite well", "No, I have been coping as well as ever"], rev: true },
  { q: "I have been so unhappy that I have had difficulty sleeping", o: ["Yes, most of the time", "Yes, sometimes", "Not very often", "No, not at all"], rev: true },
  { q: "I have felt sad or miserable", o: ["Yes, most of the time", "Yes, quite often", "Not very often", "No, not at all"], rev: true },
  { q: "I have been so unhappy that I have been crying", o: ["Yes, most of the time", "Yes, quite often", "Only occasionally", "No, never"], rev: true },
  { q: "The thought of harming myself has occurred to me", o: ["Yes, quite often", "Sometimes", "Hardly ever", "Never"], rev: true },
];
const pts = (i, choice) => (EPDS[i].rev ? 3 - choice : choice);

function epdsBand(score) {
  if (score >= 13) return { level: "high", title: "Your answers suggest you may be living with depression.", body: "This isn't a diagnosis, but it's a strong sign to talk with your provider soon, ideally this week. Depression in pregnancy and after birth is common and very treatable." };
  if (score >= 10) return { level: "watch", title: "Your answers suggest some symptoms of depression.", body: "This isn't a diagnosis. It's worth talking with your provider, and checking in again in 2 weeks. You don't have to wait until it gets worse." };
  return { level: "ok", title: "Your answers don't suggest depression right now.", body: "Keep checking in, especially in the first year after birth. If anything changes, or you just don't feel like yourself, reach out anytime." };
}

const SIGNS = [
  { icon: Sun, t: "Baby blues", b: "Up to 4 in 5 new parents have weepy, moody or overwhelmed days in the first 2 weeks after birth. It eases on its own with rest and support." },
  { icon: CloudRain, t: "Perinatal depression & anxiety", b: "About 1 in 8. Lasts longer than 2 weeks, and can start during pregnancy or anytime in the first year. Sadness, numbness, constant worry, trouble sleeping even when you can, or not feeling like yourself. It's treatable with support, therapy and sometimes medication your provider can talk through with you." },
  { icon: Brain, t: "Postpartum psychosis: an emergency", b: "Rare (1 to 2 in 1,000 births), usually in the first weeks. Confusion, seeing or hearing things others don't, paranoia, or very little sleep with racing thoughts. Call 911 or go to the emergency room right away." },
];

const PARTNER = [
  "Watch for changes that last more than 2 weeks: withdrawing, crying often, not sleeping or eating, saying she's a bad mother, or seeming numb.",
  "Take night feeds or early mornings so she can get one stretch of 4 to 5 hours of sleep.",
  "Say it plainly: \"This isn't your fault, and you're not alone. Let's call together.\"",
  "Help make the call to her provider or 1-833-TLC-MAMA, and go with her to the appointment if she wants.",
  "If she talks about harming herself or the baby, or seems confused or out of touch with reality, call 911.",
];

export function Mood() {
  const { state, dispatch, nav, notify } = useStore();
  const [step, setStep] = useState(-1); // -1 intro, 0..9 questions, 10 result
  const [answers, setAnswers] = useState(Array(10).fill(null));
  const [saved, setSaved] = useState(false);
  const [partner, setPartner] = useState(false);
  const last = state.epds?.[state.epds.length - 1];
  const score = answers.reduce((s, c, i) => s + (c === null ? 0 : pts(i, c)), 0);
  const selfHarm = answers[9] !== null && pts(9, answers[9]) > 0;
  const band = epdsBand(score);
  const choose = (c) => { const a = [...answers]; a[step] = c; setAnswers(a); };
  const askVisit = () => { dispatch({ type: "addQ", text: "I've been struggling with my mood. Can we talk about how I'm feeling and what support is available?", from: "Mood check" }); notify("Added to For My Visit"); };
  const restart = () => { setAnswers(Array(10).fill(null)); setSaved(false); setStep(0); };

  if (step >= 0 && step < 10) {
    const item = EPDS[step];
    return (
      <div>
        <TopBar title="Mood check" sub={`Question ${step + 1} of 10`} />
        <div className="pad">
          <div className="epds-progress"><i style={{ width: `${((step + 1) / 10) * 100}%` }} /></div>
          <p className="eyebrow">In the past 7 days</p>
          <h1 className="display-sm epds-q">{item.q}</h1>
          <div className="epds-opts" role="radiogroup" aria-label={item.q}>
            {item.o.map((o, c) => (
              <button key={o} role="radio" aria-checked={answers[step] === c} className={answers[step] === c ? "on" : ""} onClick={() => choose(c)}>{o}</button>
            ))}
          </div>
          {step === 9 && selfHarm && <EscalationCard kind="crisis" />}
          <div className="epds-nav">
            <button className="btn btn-ghost" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Back</button>
            <button className="btn btn-primary" disabled={answers[step] === null} onClick={() => setStep(step + 1)}>{step === 9 ? "See my results" : "Next"} <ArrowRight size={16} /></button>
          </div>
          <p className="muted small center"><Lock size={11} /> Your answers stay on this device and aren't shared with anyone.</p>
        </div>
      </div>
    );
  }

  if (step === 10) {
    return (
      <div>
        <TopBar title="Your mood check" />
        <div className="pad">
          {selfHarm && <EscalationCard kind="crisis" />}
          <div className={"epds-result r-" + band.level}>
            <p className="eyebrow">Score {score} of 30</p>
            <h1 className="display-sm">{band.title}</h1>
            <p>{band.body}</p>
          </div>
          {band.level !== "ok" && !selfHarm && <EscalationCard kind="mood" />}
          <div className="stack-btns">
            <button className="btn btn-primary btn-block" onClick={askVisit}><ClipboardList size={16} /> Add to For My Visit</button>
            {!saved ? (
              <div className="save-choice">
                <p className="small">Save this score to track how you feel over time? Amara keeps only the number and the date, never your answers.</p>
                <div>
                  <button className="btn btn-soft btn-sm" onClick={() => { dispatch({ type: "epds", score }); setSaved(true); notify("Score saved on this device"); }}>Save score</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setSaved(true); notify("Not saved"); }}>Don't save</button>
                </div>
              </div>
            ) : null}
            <button className="btn btn-ghost btn-block" onClick={() => setStep(-1)}>Support & resources <ArrowRight size={16} /></button>
          </div>
          <p className="muted small cite">Edinburgh Postnatal Depression Scale: Cox, Holden & Sagovsky, British Journal of Psychiatry, 1987;150:782–786. A screening tool, not a diagnosis.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar title="Mood & wellbeing" />
      <div className="pad">
        <p className="eyebrow"><HeartHandshake size={12} /> For pregnancy and the year after birth</p>
        <h1 className="display-sm">How are you, really?</h1>
        <p className="muted">Your mind matters as much as your body. 1 in 8 people have depression during pregnancy or after birth, and help works.</p>

        <div className="card mood-start">
          <b>2-minute mood check</b>
          <p className="small">10 questions about the past week, from the Edinburgh scale that providers use. Private to you, and never a diagnosis.</p>
          {last && <p className="small last-score">Last check: score {last.score} on {new Date(last.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {epdsBand(last.score).level === "ok" ? "no signs of depression" : "worth talking with your provider"}</p>}
          <button className="btn btn-primary btn-block" onClick={restart}>{last ? "Check in again" : "Start the mood check"} <ArrowRight size={16} /></button>
        </div>

        <div className="card soft">
          <p className="eyebrow"><Phone size={12} /> Talk to someone today</p>
          <div className="esc-actions">
            <a className="esc-call" href="tel:18338526262"><Phone size={14} /> 1-833-TLC-MAMA</a>
            <a className="esc-call" href="tel:18009444773"><Phone size={14} /> PSI HelpLine</a>
            <a className="esc-call" href="tel:988"><Phone size={14} /> 988</a>
          </div>
          <p className="muted small">The National Maternal Mental Health Hotline (call or text, 24/7, English and Spanish). Postpartum Support International: call or text 1-800-944-4773. In crisis: call or text 988. Emergency: 911.</p>
        </div>

        <p className="eyebrow" style={{ margin: "22px 0 10px" }}>Is it the baby blues, or something more?</p>
        <div className="signs">
          {SIGNS.map(({ icon: I, t, b }, i) => (
            <div key={t} className={"sign" + (i === 2 ? " danger" : "")}><I size={18} /><div><b>{t}</b><p>{b}</p></div></div>
          ))}
        </div>

        <p className="eyebrow" style={{ margin: "22px 0 10px" }}>Support that helps</p>
        <div className="mood-links">
          <a href="https://postpartum.net/get-help/psi-online-support-meetings/" target="_blank" rel="noopener noreferrer"><Users size={18} /><span><b>Free online support groups</b><small>Postpartum Support International, many languages and communities</small></span><ExternalLink size={14} /></a>
          <a href="https://psidirectory.com/" target="_blank" rel="noopener noreferrer"><HeartHandshake size={18} /><span><b>Find a perinatal mental health provider</b><small>PSI's directory of trained therapists and prescribers</small></span><ExternalLink size={14} /></a>
          <button onClick={() => nav.go("room", { id: "postpartum" })}><Users size={18} /><span><b>Postpartum Table in the Village</b><small>Moms who get it, moderated and kind</small></span><ArrowRight size={14} /></button>
          <button onClick={askVisit}><ClipboardList size={18} /><span><b>Bring it to your next visit</b><small>Add a question about your mood to For My Visit</small></span><ArrowRight size={14} /></button>
        </div>

        <button className="card partner-toggle" onClick={() => setPartner(!partner)} aria-expanded={partner}>
          <span><b>For partners & family</b><small>What to watch for and how to help</small></span><ChevronDown size={18} style={{ transform: partner ? "rotate(180deg)" : "none" }} />
        </button>
        {partner && <ul className="partner-list">{PARTNER.map((p) => <li key={p}>{p}</li>)}</ul>}

        <div className="tier tier-red" style={{ marginTop: 16 }}>
          <div className="tier-head"><AlertTriangle size={18} /><b>Call 911 if you</b></div>
          <ul><li>Have thoughts of harming yourself or your baby and might act on them</li><li>See or hear things others don't, or feel confused or out of touch</li></ul>
        </div>
        <p className="muted small cite">Sources: ACOG Clinical Practice Guideline No. 4 (2023), Screening and Diagnosis of Mental Health Conditions During Pregnancy and Postpartum; CDC; Postpartum Support International; HRSA.</p>
      </div>
    </div>
  );
}
