import { useRef, useState } from "react";
import { Camera, PenLine, ListPlus, Loader2, Check, Lock, RefreshCw, Sparkles, X } from "lucide-react";
import { useStore } from "./useStore";
import { Sheet, Chip } from "./ui";
import { dayKey } from "./nutrition";
import { stageLabel, phase } from "./stage";

const NUM = ["kcal", "protein", "iron", "folate", "calcium", "vitD", "choline", "dha"];
const r0 = (x) => Math.round(x);

// Shrink the photo on the phone before sending: faster, cheaper, and nothing extra leaves the device.
function shrink(file, max = 896) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("bad image")); };
    img.src = url;
  });
}

export function MealCapture({ onPick, compact }) {
  const { state, dispatch, notify } = useStore();
  const p = state.profile;
  const fileRef = useRef();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(null); // "photo" | "text"
  const [photo, setPhoto] = useState(null);
  const [desc, setDesc] = useState("");
  const [res, setRes] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error | off
  const [answers, setAnswers] = useState({});
  const [meal, setMeal] = useState(() => { const h = new Date().getHours(); return h < 11 ? "Breakfast" : h < 15 ? "Lunch" : h < 21 ? "Dinner" : "Snack"; });

  const reset = () => { setOpen(false); setMode(null); setPhoto(null); setDesc(""); setRes(null); setStatus("idle"); setAnswers({}); };

  const analyze = async (img = photo, text = desc, ans = []) => {
    setStatus("loading");
    try {
      const r = await fetch("/api/meal", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ image: img || undefined, text: text || undefined, answers: ans, stage: `${stageLabel(p).toLowerCase()} (${phase(p).toLowerCase()})` }),
      });
      if (r.status === 503 || r.status === 404) { setStatus("off"); return; }
      if (!r.ok) throw new Error("failed");
      const j = await r.json();
      setRes(j);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setOpen(true); setMode("photo"); setRes(null); setAnswers({});
    try {
      const img = await shrink(f);
      setPhoto(img);
      analyze(img, "");
    } catch {
      setStatus("error");
    }
  };

  const refine = () => {
    const ans = Object.entries(answers).map(([q, a]) => ({ q, a }));
    analyze(photo, desc, ans);
  };

  const totals = res?.items?.reduce((t, it) => { NUM.forEach((k) => { t[k] += it[k]; }); return t; }, Object.fromEntries(NUM.map((k) => [k, 0])));

  const save = () => {
    const base = Object.keys(state.customFoods || {}).length;
    const items = res.items.map((it, i) => ({
      id: `c-${dayKey(0)}-${base + i}`,
      food: { name: it.name, serving: it.portion || "1 portion", group: meal, source: mode, v: Object.fromEntries(NUM.map((k) => [k, it[k]])) },
    }));
    dispatch({ type: "logMeal", day: dayKey(0), items });
    notify(`${meal} logged · about ${r0(totals.kcal)} calories`);
    reset();
  };

  return (
    <>
      <div className={"meal-capture" + (compact ? " compact" : "")}>
        <label className="mc-btn primary">
          <Camera size={18} /> <span>Snap my plate</span>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFile} hidden />
        </label>
        <button className="mc-btn" onClick={() => { setOpen(true); setMode("text"); setStatus("idle"); setRes(null); }}><PenLine size={18} /> <span>Describe it</span></button>
        {onPick && <button className="mc-btn" onClick={onPick}><ListPlus size={18} /> <span>Pick foods</span></button>}
      </div>

      <Sheet open={open} onClose={reset} title={mode === "photo" ? "Your plate" : "Describe your meal"}>
        {photo && <img className="mc-photo" src={photo} alt="Your meal" />}
        {mode === "text" && status !== "done" && (
          <div className="mc-text">
            <textarea rows={3} placeholder="e.g. 1 cup jollof rice, fried plantain and grilled chicken thigh" value={desc} onChange={(e) => setDesc(e.target.value)} />
            <button className="btn btn-primary btn-block" disabled={desc.trim().length < 3 || status === "loading"} onClick={() => analyze(null, desc.trim())}><Sparkles size={16} /> Estimate my meal</button>
          </div>
        )}
        {status === "loading" && <div className="live-loading"><Loader2 size={18} className="spin" /> Looking at your meal…</div>}
        {status === "off" && (
          <div className="card soft">
            <p className="small">Photo and description estimates turn on once Afya's AI is connected. For now you can pick foods from the list.</p>
            {onPick && <button className="btn btn-soft btn-block" onClick={() => { reset(); onPick(); }}><ListPlus size={16} /> Pick foods instead</button>}
          </div>
        )}
        {status === "error" && <div className="card soft"><p className="small">That didn't work this time. Try again, or pick foods from the list.</p><button className="link" onClick={() => analyze()}><RefreshCw size={13} /> Try again</button></div>}

        {status === "done" && res?.notFood && <div className="card soft"><p className="small">I couldn't spot food in that photo. Try again with your plate in good light.</p></div>}
        {status === "done" && res && !res.notFood && (
          <>
            <div className="mc-total">
              <div><b>{r0(totals.kcal)}</b><small>calories</small></div>
              <div><b>{r0(totals.protein)} g</b><small>protein</small></div>
              <div><b>{totals.iron.toFixed(1)} mg</b><small>iron</small></div>
              <div><b>{r0(totals.folate)}</b><small>folate mcg</small></div>
            </div>
            <ul className="mc-items">
              {res.items.map((it, i) => (
                <li key={i}>
                  <span><b>{it.name}</b><small>{it.portion}</small></span>
                  <span className="mc-kcal">{r0(it.kcal)} cal</span>
                  <button aria-label={`Remove ${it.name}`} onClick={() => setRes({ ...res, items: res.items.filter((_, k) => k !== i) })}><X size={14} /></button>
                </li>
              ))}
            </ul>
            {res.questions?.length > 0 && (
              <div className="mc-qs">
                <p className="eyebrow">A couple of questions to make it more accurate (optional)</p>
                {res.questions.map((q) => (
                  <div key={q.q}>
                    <p className="small">{q.q}</p>
                    <div className="chips">{q.options.map((o) => <Chip small key={o} active={answers[q.q] === o} onClick={() => setAnswers({ ...answers, [q.q]: o })}>{o}</Chip>)}</div>
                  </div>
                ))}
                <button className="btn btn-soft btn-sm" disabled={!Object.keys(answers).length} onClick={refine}><RefreshCw size={14} /> Update estimate</button>
              </div>
            )}
            {res.tip && <p className="afya-note">{res.tip}</p>}
            <p className="eyebrow" style={{ marginTop: 12 }}>Which meal?</p>
            <div className="chips">{["Breakfast", "Lunch", "Dinner", "Snack"].map((m) => <Chip small key={m} active={meal === m} onClick={() => setMeal(m)}>{m}</Chip>)}</div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} disabled={!res.items.length} onClick={save}><Check size={16} /> Add to today's log</button>
            <p className="muted small">Estimates from a photo can be off by 20% or more ({res.confidence} confidence). They're a guide, not a measurement.</p>
          </>
        )}
        <p className="muted small mc-privacy"><Lock size={11} /> Snap just your plate. Your photo is analyzed and then discarded. Amara saves only the food list.</p>
      </Sheet>
    </>
  );
}
