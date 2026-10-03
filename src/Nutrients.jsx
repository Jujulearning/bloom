import { useState } from "react";
import { Plus, Minus, ShoppingBag, ClipboardList, Pill, Info, Search, Check, ExternalLink, ShieldCheck } from "lucide-react";
import { useStore } from "./useStore";
import { TopBar, Chip, Sheet, Disclaimer } from "./ui";
import { FOODS } from "./data";
import { NUTRI_DB, DAYS, byId, analyzeNutrients, topFoods, SUPPLEMENTS, amazonLink, AMAZON_DISCLOSURE } from "./nutrition";

const STATUS = { met: "On track", close: "Almost there", low: "Running low" };

export function Nutrients() {
  const { state, dispatch, nav, notify } = useStore();
  const [day, setDay] = useState("d2");
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState("");
  const a = analyzeNutrients(state);
  const log = state.foodLog?.[day] || {};
  const bump = (id, delta) => dispatch({ type: "foodLog", day, id, delta });
  const ask = (text) => { dispatch({ type: "addQ", text, from: "Nutrient check" }); notify("Added to For My Visit"); };
  const results = NUTRI_DB.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()));
  const hasPage = (id) => FOODS.some((f) => f.id === id);

  return (
    <div>
      <TopBar title="Nutrient check" />
      <div className="pad">
        <p className="eyebrow">Based on your last {a.days || 0} day{a.days === 1 ? "" : "s"} of meals</p>
        <h1 className="display-sm">{a.gaps.length ? `You might be running low on ${a.gaps.slice(0, 3).map((g) => g.short).join(", ").replace(/, ([^,]*)$/, " and $1")}.` : "Your plate is covering the basics."}</h1>
        <p className="muted">A rough estimate from what you've logged, compared with what's recommended {a.stage === "Postpartum" ? "after birth" : "in pregnancy"}. It's a starting point for a conversation, not a test result.</p>

        <div className="card">
          <p className="eyebrow"><Pill size={12} /> Are you taking a prenatal vitamin?</p>
          <div className="chips">
            {[["yes", "Yes"], ["no", "No"], ["unsure", "Not sure"]].map(([v, l]) => <Chip small key={v} active={a.prenatal === v} onClick={() => dispatch({ type: "set", patch: { prenatal: v } })}>{l}</Chip>)}
          </div>
          {a.prenatal === "yes" && <p className="muted small" style={{ marginTop: 8 }}>Most prenatals cover folate, iron and vitamin D. Many have little or no choline, calcium or DHA, so check your label.</p>}
        </div>

        <div className="nut-bars">
          {a.rows.map((r) => (
            <div key={r.k} className={"nc-row st-" + (r.covered ? "covered" : r.status)}>
              <div className="nut-top">
                <b>{r.label}</b>
                <span>{r.covered ? "Likely covered by your prenatal" : STATUS[r.status]}</span>
              </div>
              <div className="nut-track"><i style={{ width: Math.min(100, Math.round(r.pct * 100)) + "%" }} /></div>
              <small>From food: about {r.avg >= 100 ? Math.round(r.avg) : r.avg} of {r.target} {r.unit} a day ({Math.round(r.pct * 100)}%)</small>
            </div>
          ))}
        </div>

        {a.gaps.length > 0 && (
          <>
            <p className="eyebrow" style={{ margin: "22px 0 8px" }}>Food first, from your table</p>
            {a.gaps.map((g) => (
              <div key={g.k} className="card gap-card">
                <b>{g.label}</b>
                <p className="muted small">{g.why}</p>
                <div className="chips">
                  {topFoods(g.k, state.profile.loves).map((f) => (
                    <Chip small key={f.id} onClick={() => { if (hasPage(f.id)) nav.go("food", { id: f.id }); else { dispatch({ type: "foodLog", day: "d2", id: f.id, delta: 1 }); notify(`Added ${f.name} to today`); } }}>{f.name} · {Math.round(f.v[g.k] * 10) / 10} {g.unit}</Chip>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {a.shop.length > 0 && (
          <div className="card supp">
            <p className="eyebrow"><ShieldCheck size={12} /> If your provider recommends a supplement</p>
            <p className="small">Food comes first. Supplements can help fill a gap, but the right one, and how much, is a decision for you and your provider. Amara never recommends doses.</p>
            {a.shop.map((k) => {
              const s = SUPPLEMENTS[k];
              return (
                <div key={k} className="supp-item">
                  <div><b>{s.label}</b><small>{s.note}</small></div>
                  <div className="supp-acts">
                    <button className="link" onClick={() => ask(`Should I take a ${s.label.toLowerCase()} supplement? My food log looks low.`)}><ClipboardList size={13} /> Ask my provider</button>
                    <a className="amz" href={amazonLink(s.q)} target="_blank" rel="sponsored noopener noreferrer"><ShoppingBag size={13} /> Shop on Amazon <ExternalLink size={11} /></a>
                  </div>
                </div>
              );
            })}
            <p className="muted small disclosure">{AMAZON_DISCLOSURE} Links are search results, not endorsements. Don't take vitamin A supplements in pregnancy unless your provider says to.</p>
          </div>
        )}

        <p className="eyebrow" style={{ margin: "24px 0 8px" }}>My food log</p>
        <div className="chips">{DAYS.map(([d, l]) => <Chip small key={d} active={day === d} onClick={() => setDay(d)}>{l}</Chip>)}</div>
        <div className="log-list">
          {Object.entries(log).filter(([, sv]) => sv > 0).map(([id, sv]) => {
            const f = byId(id);
            if (!f) return null;
            return (
              <div key={id} className="log-item">
                <div><b>{f.name}</b><small>{sv} × {f.serving}</small></div>
                <div className="stepper">
                  <button aria-label={`Less ${f.name}`} onClick={() => bump(id, -0.5)}><Minus size={14} /></button>
                  <button aria-label={`More ${f.name}`} onClick={() => bump(id, 0.5)}><Plus size={14} /></button>
                </div>
              </div>
            );
          })}
          {!Object.values(log).some((x) => x > 0) && <p className="muted small">Nothing logged for this day yet.</p>}
        </div>
        <button className="btn btn-soft btn-block" onClick={() => setAdding(true)}><Plus size={16} /> Add a food</button>

        <div className="card soft" style={{ marginTop: 16 }}>
          <p className="small"><Info size={13} /> Values are approximate, per serving, from USDA FoodData Central. Targets are the recommended daily amounts {a.stage === "Postpartum" ? "while breastfeeding" : "in pregnancy"} (National Academies; DHA per ACOG guidance). If you have a condition like anemia, your provider may set different goals.</p>
        </div>
        <Disclaimer />
      </div>

      <Sheet open={adding} onClose={() => { setAdding(false); setQ(""); }} title="Add a food">
        <div className="search-input"><Search size={16} /><input placeholder="Search foods" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="add-list">
          {results.map((f) => (
            <button key={f.id} onClick={() => { bump(f.id, 1); notify(`Added ${f.name}`); }}>
              <span><b>{f.name}</b><small>{f.serving} · {f.group}</small></span>
              {log[f.id] > 0 ? <Check size={16} /> : <Plus size={16} />}
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
