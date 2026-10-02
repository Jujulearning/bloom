import { useEffect, useState } from "react";
import { Search as SearchIcon, ArrowRight, Clock, Wallet, Utensils, BookOpen, ChevronRight, Check, Minus, Plus, SlidersHorizontal, Sparkles, ShoppingBasket, X, RefreshCw } from "lucide-react";
import { useStore } from "./useStore";
import { makePlan } from "./helpers";
import { TopBar, Photo, Chip, Nutrient, SaveBtn, Disclaimer, SectionHead, AfyaButton, Empty } from "./ui";
import { FOODS, CUISINES, RECIPES, RECIPE_FILTERS, QA, NUTRIENTS, PLATE_BASES, PLATE_OPTIONS } from "./data";

const cuisineName = (id) => CUISINES.find((c) => c.id === id)?.name || id;

function FoodCard({ f, wide }) {
  const { state, dispatch, nav, notify } = useStore();
  const on = state.savedFoods.includes(f.id);
  return (
    <div className={"food-card" + (wide ? " wide" : "")}>
      <button className="food-hit" onClick={() => nav.go("food", { id: f.id })}>
        <Photo name={f.img} pos={f.pos} h={wide ? 150 : 118} r={18} />
        <div className="food-meta">
          <h4>{f.name}</h4>
          <p>{f.origin}</p>
          <div className="tags">{f.nutrients.slice(0, wide ? 4 : 2).map((n) => <Nutrient key={n} n={n} />)}</div>
        </div>
      </button>
      <span className="card-save"><SaveBtn label={false} on={on} onClick={() => { dispatch({ type: "toggleIn", key: "savedFoods", id: f.id }); notify(on ? "Removed from saved" : `${f.name} saved`); }} /></span>
    </div>
  );
}

export function Explore() {
  const { nav } = useStore();
  return (
    <div>
      <div className="pad explore-head">
        <p className="eyebrow">Food Library</p>
        <h1 className="display">Food that feels like home. Guidance you can trust.</h1>
        <button className="search-bar" onClick={() => nav.go("search")}>
          <SearchIcon size={18} /><span>Search foods, dishes, ingredients, or nutrients</span>
        </button>
        <div className="chips scroll">
          {["Can I eat sushi?", "Is hibiscus tea okay?", "Is jollof rice okay during pregnancy?"].map((q) => (
            <Chip small key={q} onClick={() => nav.go("search", { q, submit: true })}>{q}</Chip>
          ))}
        </div>
      </div>

      <SectionHead title="Cultural collections" action="All foods" onAction={() => nav.go("library")} />
      <div className="h-scroll">
        {CUISINES.map((c) => (
          <button key={c.id} className="collection" onClick={() => nav.go("library", { cuisine: c.id })}>
            <Photo name={c.img} pos={c.pos} h={150} r={18}><h4>{c.name}</h4></Photo>
          </button>
        ))}
      </div>

      <SectionHead title="Browse by what you need" />
      <div className="browse pad-x">
        <p className="field-label">Nutrient</p>
        <div className="chips">{["Iron", "Folate", "Protein", "Calcium", "Omega-3", "Fiber"].map((n) => <Chip small key={n} onClick={() => nav.go("library", { nutrient: n })}>{n}</Chip>)}</div>
        <p className="field-label">How you're feeling</p>
        <div className="chips">{["Tired", "Nauseous", "Hungry"].map((n) => <Chip small key={n} onClick={() => nav.go("library", { symptom: n })}>{n}</Chip>)}</div>
        <p className="field-label">Real life</p>
        <div className="chips">
          <Chip small onClick={() => nav.go("library", { budget: true })}>Budget friendly</Chip>
          <Chip small onClick={() => nav.go("library", { quick: true })}>20 minutes or less</Chip>
          <Chip small onClick={() => nav.go("library", { veg: true })}>Vegetarian</Chip>
          <Chip small onClick={() => nav.go("library", { stage: "Postpartum" })}>Postpartum</Chip>
        </div>
      </div>

      <SectionHead title="Plan & cook" />
      <div className="tools pad-x">
        <button onClick={() => nav.go("recipes")}><BookOpen size={20} /><b>Recipes</b><small>Everyday meals from many kitchens</small></button>
        <button onClick={() => nav.go("plate")}><Utensils size={20} /><b>Build my plate</b><small>Start with what you eat</small></button>
        <button onClick={() => nav.go("budget")}><Wallet size={20} /><b>Nourish on a budget</b><small>A simple grocery plan</small></button>
        <button onClick={() => nav.go("grocery")}><ShoppingBasket size={20} /><b>Grocery list</b><small>Your list, ready to shop</small></button>
      </div>

      <SectionHead title="Familiar favorites" action="See all" onAction={() => nav.go("library")} />
      <div className="grid2 pad-x">
        {FOODS.slice(0, 6).map((f) => <FoodCard key={f.id} f={f} />)}
      </div>
      <div className="pad"><Disclaimer /></div>
    </div>
  );
}

export function Library(params) {
  const { state } = useStore();
  const [cuisine, setCuisine] = useState(params.cuisine || null);
  const [nutrient, setNutrient] = useState(params.nutrient || null);
  const [symptom, setSymptom] = useState(params.symptom || null);
  const [budget, setBudget] = useState(!!params.budget);
  const [quick, setQuick] = useState(!!params.quick);
  const [veg, setVeg] = useState(!!params.veg);
  const [saved, setSaved] = useState(!!params.saved);
  const [stage, setStage] = useState(params.stage || null);
  const [showFilters, setShowFilters] = useState(false);

  const list = FOODS.filter((f) =>
    (!cuisine || f.cuisine === cuisine) && (!nutrient || f.nutrients.includes(nutrient)) && (!symptom || f.symptoms.includes(symptom)) &&
    (!budget || f.budget) && (!quick || f.time <= 20) && (!veg || f.diet.some((d) => d.startsWith("Veg"))) && (!saved || state.savedFoods.includes(f.id)) && (!stage || f.stages.includes(stage)));

  const title = cuisine ? cuisineName(cuisine) : nutrient ? `Rich in ${nutrient.toLowerCase()}` : symptom ? `When you're feeling ${symptom.toLowerCase()}` : saved ? "Saved foods" : "All foods";
  const clear = () => { setCuisine(null); setNutrient(null); setSymptom(null); setBudget(false); setQuick(false); setVeg(false); setSaved(false); setStage(null); };

  return (
    <div>
      <TopBar title="Food Library" right={<button className="icon-btn" onClick={() => setShowFilters((v) => !v)} aria-label="Filters"><SlidersHorizontal size={19} /></button>} />
      <div className="pad">
        <h1 className="display-sm">{title}</h1>
        {nutrient && <p className="muted">{NUTRIENTS[nutrient]?.why}</p>}
        <div className="chips scroll">
          <Chip small active={!cuisine} onClick={() => setCuisine(null)}>All cuisines</Chip>
          {CUISINES.map((c) => <Chip small key={c.id} active={cuisine === c.id} onClick={() => setCuisine(cuisine === c.id ? null : c.id)}>{c.name}</Chip>)}
        </div>
        {showFilters && (
          <div className="card filters">
            <p className="field-label">Nutrient</p>
            <div className="chips">{Object.keys(NUTRIENTS).slice(0, 8).map((n) => <Chip small key={n} active={nutrient === n} onClick={() => setNutrient(nutrient === n ? null : n)}>{n}</Chip>)}</div>
            <p className="field-label">Symptom</p>
            <div className="chips">{["Tired", "Nauseous", "Hungry"].map((n) => <Chip small key={n} active={symptom === n} onClick={() => setSymptom(symptom === n ? null : n)}>{n}</Chip>)}</div>
            <p className="field-label">Stage</p>
            <div className="chips">{["Planning", "Pregnancy", "Postpartum"].map((n) => <Chip small key={n} active={stage === n} onClick={() => setStage(stage === n ? null : n)}>{n}</Chip>)}</div>
            <p className="field-label">Practical</p>
            <div className="chips">
              <Chip small active={budget} onClick={() => setBudget(!budget)}>Budget friendly</Chip>
              <Chip small active={quick} onClick={() => setQuick(!quick)}>20 min or less</Chip>
              <Chip small active={veg} onClick={() => setVeg(!veg)}>Vegetarian</Chip>
              <Chip small active={saved} onClick={() => setSaved(!saved)}>Saved</Chip>
            </div>
          </div>
        )}
        <div className="active-filters">
          {[nutrient, symptom && `Feeling ${symptom.toLowerCase()}`, stage, budget && "Budget", quick && "Quick", veg && "Vegetarian", saved && "Saved"].filter(Boolean).map((t) => <span key={t} className="af">{t}</span>)}
          {(nutrient || symptom || budget || quick || veg || saved || stage || cuisine) && <button className="link" onClick={clear}>Clear</button>}
        </div>
        <p className="count">{list.length} food{list.length === 1 ? "" : "s"}. Every food here can be part of a nourishing pregnancy.</p>
        <div className="grid2">{list.map((f) => <FoodCard key={f.id} f={f} />)}</div>
        {!list.length && <Empty>No matches yet. Try removing a filter, or ask Afya.</Empty>}
      </div>
    </div>
  );
}

export function Search({ q: q0 = "", submit = false }) {
  const { nav } = useStore();
  const [q, setQ] = useState(q0);
  const [done, setDone] = useState(submit ? q0 : "");
  const term = (done || "").toLowerCase();
  const qa = term ? QA.find((x) => x.match.some((m) => term.includes(m))) : null;
  const live = q.trim().toLowerCase();
  const foods = (done ? FOODS.filter((f) => [f.name, f.origin, ...f.nutrients, cuisineName(f.cuisine)].join(" ").toLowerCase().split(/\s+/).some((w) => term.split(/\W+/).filter((t) => t.length > 2).some((t) => w.startsWith(t)))) : live.length > 1 ? FOODS.filter((f) => (f.name + " " + f.nutrients.join(" ") + " " + cuisineName(f.cuisine)).toLowerCase().includes(live)) : []);
  const recipes = done ? RECIPES.filter((r) => (r.name + " " + r.cuisine + " " + r.highlights.join(" ")).toLowerCase().split(/\s+/).some((w) => term.split(/\W+/).filter((t) => t.length > 2).some((t) => w.startsWith(t)))) : [];

  return (
    <div>
      <div className="search-top">
        <button className="icon-btn" onClick={nav.back} aria-label="Back"><X size={20} /></button>
        <form className="search-input" onSubmit={(e) => { e.preventDefault(); setDone(q); }}>
          <SearchIcon size={18} />
          <input autoFocus value={q} onChange={(e) => { setQ(e.target.value); setDone(""); }} placeholder="Ask anything, like 'Can I eat sushi?'" aria-label="Search" />
        </form>
      </div>
      <div className="pad">
        {!done && !live && (
          <>
            <p className="eyebrow">What can I eat?</p>
            <div className="suggest">
              {["Can I eat sushi?", "Is hibiscus tea okay?", "What can I eat when I'm nauseous?", "I don't eat meat. How do I get iron?", "Is jollof rice okay during pregnancy?", "How much coffee can I have?"].map((s) => (
                <button key={s} onClick={() => { setQ(s); setDone(s); }}><SearchIcon size={15} /> {s}</button>
              ))}
            </div>
          </>
        )}
        {!done && live && (
          <div className="suggest">
            {foods.slice(0, 5).map((f) => <button key={f.id} onClick={() => nav.go("food", { id: f.id })}><ChevronRight size={15} /> {f.name} <small>{f.origin}</small></button>)}
            <button onClick={() => setDone(q)}><SearchIcon size={15} /> Search for “{q}”</button>
          </div>
        )}
        {done && (
          <>
            {qa ? (
              <div className="answer card">
                <p className="eyebrow">{qa.q}</p>
                <h2 className="serif-lg">{qa.answer}</h2>
                <h5>Why</h5><p>{qa.why}</p>
                <h5>Pregnancy considerations</h5>
                <ul>{qa.considerations.map((c) => <li key={c}>{c}</li>)}</ul>
                <h5>Try instead</h5>
                <div className="chips">{qa.alternatives.map((a) => <span key={a} className="alt">{a}</span>)}</div>
                <h5>Relevant nutrients</h5>
                <div className="tags">{qa.nutrients.map((n) => <Nutrient key={n} n={n} />)}</div>
                <p className="source">Source: {qa.source}</p>
                <AfyaButton q={qa.q}>Ask Afya</AfyaButton>
              </div>
            ) : (
              <div className="answer card soft">
                <p className="eyebrow">Results for “{done}”</p>
                <p>Afya can give you a personal answer to this.</p>
                <AfyaButton q={done}>Ask Afya</AfyaButton>
              </div>
            )}
            {!!foods.length && <><SectionHead title="Foods" /><div className="grid2">{foods.slice(0, 6).map((f) => <FoodCard key={f.id} f={f} />)}</div></>}
            {!!recipes.length && <><SectionHead title="Recipes" />{recipes.slice(0, 3).map((r) => <RecipeRow key={r.id} r={r} />)}</>}
            <Disclaimer />
          </>
        )}
      </div>
    </div>
  );
}

export function FoodPage({ id }) {
  const { state, dispatch, nav, notify } = useStore();
  const f = FOODS.find((x) => x.id === id) || FOODS[0];
  const on = state.savedFoods.includes(f.id);
  const p = state.profile;
  const [open, setOpen] = useState(null);
  useEffect(() => { dispatch({ type: "addTo", key: "explored", id: f.id }); }, [f.id, dispatch]);

  return (
    <div className="food-page">
      <Photo name={f.img} pos={f.pos} h={300} r={0} size={1400}>
        <TopBar over right={<SaveBtn label={false} on={on} onClick={() => { dispatch({ type: "toggleIn", key: "savedFoods", id: f.id }); notify(on ? "Removed from saved" : `${f.name} saved`); }} />} />
      </Photo>
      <div className="sheet-body">
        <p className="eyebrow">{cuisineName(f.cuisine)} · {f.origin}</p>
        <h1 className="display">{f.name}</h1>
        <p className="nut-line">{f.nutrients.join(" • ")}</p>

        <h5>At the table</h5>
        <p>{f.context}</p>

        <h5>Why it matters right now</h5>
        <p>{f.why}</p>
        <div className="nutrient-list">
          {f.nutrients.map((n) => (
            <button key={n} className={"nut-row" + (open === n ? " open" : "")} onClick={() => setOpen(open === n ? null : n)}>
              <Nutrient n={n} /><ChevronRight size={16} />
              {open === n && <p>{NUTRIENTS[n]?.why}</p>}
            </button>
          ))}
        </div>

        <h5>Pregnancy considerations</h5>
        <ul>{f.considerations.map((c) => <li key={c}>{c}</li>)}</ul>

        <h5>Pair it with</h5>
        <ul className="pairs">{f.pairings.map((c) => <li key={c}>{c}</li>)}</ul>

        <h5>Easy swaps</h5>
        <div className="chips">{f.swaps.map((s) => <span key={s} className="alt">{s}</span>)}</div>

        <div className="card make-it">
          <p className="eyebrow">Make it work for me</p>
          <p>{f.makeItWork}</p>
          <p className="muted small">Based on your preferences: {p.cookTime.toLowerCase()}, {p.budget.toLowerCase()}, cooking for {p.household}.</p>
          <button className="link" onClick={() => nav.go("plate", { base: f.name })}>Build a plate with {f.name} <ArrowRight size={14} /></button>
        </div>

        <div className="actions">
          <AfyaButton q={`Tell me more about ${f.name} during pregnancy`} />
          <SaveBtn on={on} onClick={() => { dispatch({ type: "toggleIn", key: "savedFoods", id: f.id }); notify(on ? "Removed from saved" : `${f.name} saved`); }} />
        </div>
        <Disclaimer />
      </div>
    </div>
  );
}

function RecipeRow({ r }) {
  const { state, nav } = useStore();
  return (
    <button className="recipe-row" onClick={() => nav.go("recipe", { id: r.id })}>
      <Photo name={r.img} pos={r.pos} h={96} r={16} />
      <div>
        <p className="eyebrow">{r.cuisine}</p>
        <h4>{r.name}</h4>
        <p className="meta"><Clock size={13} /> {r.time} min · {r.cost} · {r.difficulty}{state.savedRecipes.includes(r.id) && " · Saved"}</p>
        <div className="tags">{r.highlights.slice(0, 3).map((n) => <Nutrient key={n} n={n} />)}</div>
      </div>
    </button>
  );
}

export function Recipes({ filter, saved: savedOnly }) {
  const { state } = useStore();
  const [filters, setFilters] = useState(filter ? [filter] : []);
  const [saved, setSaved] = useState(!!savedOnly);
  const list = RECIPES.filter((r) => filters.every((f) => r.tags.includes(f) || (f === "Under 30 min" && r.time <= 30) || (f === "Under 15 min" && r.time <= 15)) && (!saved || state.savedRecipes.includes(r.id)));
  const toggle = (f) => setFilters((x) => (x.includes(f) ? x.filter((y) => y !== f) : [...x, f]));
  return (
    <div>
      <TopBar title="Recipes" />
      <div className="pad">
        <h1 className="display-sm">Everyday meals from many kitchens.</h1>
        <div className="chips scroll">
          <Chip small active={saved} onClick={() => setSaved(!saved)}>Saved</Chip>
          {RECIPE_FILTERS.map((f) => <Chip small key={f} active={filters.includes(f)} onClick={() => toggle(f)}>{f}</Chip>)}
        </div>
        {list.map((r) => <RecipeRow key={r.id} r={r} />)}
        {!list.length && <Empty>No recipes match all of those. Try removing one filter.</Empty>}
      </div>
    </div>
  );
}

export function RecipePage({ id }) {
  const { state, dispatch, notify } = useStore();
  const r = RECIPES.find((x) => x.id === id) || RECIPES[0];
  const on = state.savedRecipes.includes(r.id);
  const [have, setHave] = useState([]);
  const addToList = () => {
    const g = state.grocery || { items: [], meals: [], budget: null };
    const extra = r.ingredients.filter((i) => !g.items.some((x) => x.name === i)).map((name) => ({ name, group: "From recipes", cost: null, checked: false }));
    dispatch({ type: "set", patch: { grocery: { ...g, items: [...g.items, ...extra] } } });
    notify(`${extra.length} ingredients added to your grocery list`);
  };
  return (
    <div className="food-page">
      <Photo name={r.img} pos={r.pos} h={280} r={0} size={1400}>
        <TopBar over right={<SaveBtn label={false} on={on} onClick={() => { dispatch({ type: "toggleIn", key: "savedRecipes", id: r.id }); notify(on ? "Removed from saved" : "Recipe saved"); }} />} />
      </Photo>
      <div className="sheet-body">
        <p className="eyebrow">{r.cuisine}</p>
        <h1 className="display">{r.name}</h1>
        <div className="recipe-stats">
          <span><Clock size={15} /><b>{r.time} min</b></span>
          <span><Wallet size={15} /><b>{r.costEst}</b></span>
          <span><Sparkles size={15} /><b>{r.difficulty}</b></span>
        </div>
        <div className="tags">{r.highlights.map((n) => <Nutrient key={n} n={n} />)}</div>
        <p className="context-note">{r.context}</p>
        <h5>Ingredients</h5>
        <ul className="checklist">
          {r.ingredients.map((i) => (
            <li key={i}><button className={have.includes(i) ? "on" : ""} onClick={() => setHave((h) => (h.includes(i) ? h.filter((x) => x !== i) : [...h, i]))}><span className="box">{have.includes(i) && <Check size={13} />}</span>{i}</button></li>
          ))}
        </ul>
        <h5>Steps</h5>
        <ol className="steps">{r.steps.map((s, k) => <li key={k}><span>{k + 1}</span>{s}</li>)}</ol>
        <h5>Swaps</h5>
        <div className="chips">{r.swaps.map((s) => <span key={s} className="alt">{s}</span>)}</div>
        <div className="actions col">
          <button className="btn btn-primary btn-block" onClick={addToList}><ShoppingBasket size={17} /> Add to grocery list</button>
          <div className="actions">
            <AfyaButton q={`Can you adapt ${r.name} for me?`}>Ask Afya</AfyaButton>
            <SaveBtn on={on} onClick={() => { dispatch({ type: "toggleIn", key: "savedRecipes", id: r.id }); notify(on ? "Removed from saved" : "Recipe saved"); }} />
          </div>
        </div>
        <p className="muted small">Costs are rough estimates and vary by store and location.</p>
      </div>
    </div>
  );
}

export function BuildPlate({ base: base0 }) {
  const { dispatch, nav, notify } = useStore();
  const [base, setBase] = useState(base0 || null);
  const [picks, setPicks] = useState({});
  const baseObj = PLATE_BASES.find((b) => b.name === base) || { name: base, nutrients: FOODS.find((f) => f.name === base)?.nutrients || ["Energy"] };
  const all = new Set([...(baseObj.nutrients || [])]);
  Object.entries(picks).forEach(([cat, name]) => PLATE_OPTIONS[cat].find((o) => o.name === name)?.adds.forEach((n) => all.add(n)));
  const complete = Object.keys(picks).length === 3;

  return (
    <div>
      <TopBar title="Build My Plate" />
      <div className="pad">
        {!base ? (
          <>
            <h1 className="display-sm">What are you starting with?</h1>
            <p className="muted">Start with a meal you already love. We'll build around it.</p>
            <div className="base-grid">
              {PLATE_BASES.map((b) => <button key={b.id} className="base" onClick={() => setBase(b.name)}><Utensils size={18} />{b.name}</button>)}
            </div>
          </>
        ) : (
          <>
            <p className="eyebrow">Starting with</p>
            <div className="plate-head">
              <h1 className="display-sm">{base}</h1>
              <button className="link" onClick={() => { setBase(null); setPicks({}); }}>Change</button>
            </div>
            <p className="muted">Let's build around it.</p>
            <div className="plate-visual" aria-hidden="true">
              <div className="plate">
                <span className="seg base-seg">{base}</span>
                {["Protein", "Vegetable", "Vitamin C"].map((c) => <span key={c} className={"seg seg-" + c.replace(" ", "")}>{picks[c] || "+"}</span>)}
              </div>
            </div>
            {Object.keys(PLATE_OPTIONS).map((cat) => (
              <div key={cat} className="plate-cat">
                <p className="field-label">{cat === "Vitamin C" ? "Something with vitamin C" : cat}</p>
                <div className="chips">{PLATE_OPTIONS[cat].map((o) => <Chip small key={o.name} active={picks[cat] === o.name} onClick={() => setPicks((pk) => ({ ...pk, [cat]: o.name }))}>{o.name}</Chip>)}</div>
                {picks[cat] && <p className="pick-note">{PLATE_OPTIONS[cat].find((o) => o.name === picks[cat]).note}</p>}
              </div>
            ))}
            <div className="card plate-sum">
              <p className="eyebrow">What your plate brings</p>
              <div className="tags">{[...all].map((n) => <Nutrient key={n} n={n} />)}</div>
              {picks["Vitamin C"] && (picks.Protein === "Beans" || picks.Vegetable === "Spinach") && <p className="small">Nice pairing: the {picks["Vitamin C"].toLowerCase()} helps your body absorb the plant iron.</p>}
            </div>
            <div className="actions col">
              <button className="btn btn-primary btn-block" disabled={!complete} onClick={() => { dispatch({ type: "plate", plate: { id: "pl" + Date.now(), base, picks } }); notify("Plate saved to your Journey"); }}>Save this plate</button>
              <button className="btn btn-afya btn-block" onClick={() => nav.tab("afya", { ask: `Give me another combination with ${base}` })}><Sparkles size={16} /> Ask Afya for another combination</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


export function Budget() {
  const { state, dispatch, nav } = useStore();
  const p = state.profile;
  const [amount, setAmount] = useState(50);
  const [custom, setCustom] = useState("");
  const [people, setPeople] = useState(p.household);
  const [days, setDays] = useState(7);
  const [have, setHave] = useState(["Rice"]);
  const [loading, setLoading] = useState(false);
  const toggleHave = (h) => setHave((x) => (x.includes(h) ? x.filter((y) => y !== h) : [...x, h]));
  const amt = amount === "custom" ? Number(custom) || 0 : amount;

  const go = () => {
    setLoading(true);
    setTimeout(() => {
      dispatch({ type: "set", patch: { grocery: makePlan({ amount: amt, people, days, have, diet: p.diet, cuisines: p.cuisines }) } });
      nav.go("grocery");
    }, 900);
  };

  return (
    <div>
      <TopBar title="Nourish on a Budget" />
      <div className="pad">
        <h1 className="display-sm">What are we working with?</h1>
        <div className="chips">
          {[25, 50, 75].map((a) => <Chip key={a} active={amount === a} onClick={() => setAmount(a)}>${a}</Chip>)}
          <Chip active={amount === "custom"} onClick={() => setAmount("custom")}>Custom</Chip>
        </div>
        {amount === "custom" && <label className="field"><span>Amount</span><input inputMode="numeric" value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))} placeholder="$40" /></label>}
        <div className="steppers">
          <div><p className="field-label">People</p><div className="week-picker small"><button className="round-btn" onClick={() => setPeople(Math.max(1, people - 1))} aria-label="Fewer people"><Minus size={16} /></button><span className="week-num">{people}</span><button className="round-btn" onClick={() => setPeople(people + 1)} aria-label="More people"><Plus size={16} /></button></div></div>
          <div><p className="field-label">Days</p><div className="week-picker small"><button className="round-btn" onClick={() => setDays(Math.max(1, days - 1))} aria-label="Fewer days"><Minus size={16} /></button><span className="week-num">{days}</span><button className="round-btn" onClick={() => setDays(Math.min(14, days + 1))} aria-label="More days"><Plus size={16} /></button></div></div>
        </div>
        <p className="field-label">Already at home</p>
        <div className="chips">{["Rice", "Beans", "Eggs", "Oats", "Onions", "Frozen spinach", "Oranges"].map((h) => <Chip small key={h} active={have.includes(h)} onClick={() => toggleHave(h)}>{h}</Chip>)}</div>
        <p className="field-label">From your profile</p>
        <div className="chips">
          {p.cuisines.map((c) => <span key={c} className="af">{c}</span>)}
          <span className="af">{p.diet}</span>
          {!p.allergies.includes("None") && p.allergies.map((a) => <span key={a} className="af">No {a.toLowerCase()}</span>)}
        </div>
        <button className="btn btn-primary btn-block" disabled={!amt || loading} onClick={go}>{loading ? <><RefreshCw size={16} className="spin" /> Building your plan…</> : <>Create my grocery plan <ArrowRight size={16} /></>}</button>
        <p className="muted small center">Prices are rough estimates, not live store prices.</p>
      </div>
    </div>
  );
}

export function Grocery() {
  const { state, dispatch, nav, notify } = useStore();
  const g = state.grocery;
  if (!g || !g.items.length) {
    return (
      <div>
        <TopBar title="Grocery list" />
        <div className="pad">
          <Empty>Your list is empty. Create a budget plan or add ingredients from a recipe.</Empty>
          <button className="btn btn-primary btn-block" onClick={() => nav.go("budget")}>Plan on a budget</button>
        </div>
      </div>
    );
  }
  const groups = [...new Set(g.items.map((i) => i.group))];
  const total = g.items.reduce((s, i) => s + (i.cost || 0), 0);
  const highlights = [...new Set(g.items.flatMap((i) => i.nutrients || []))].filter((n) => NUTRIENTS[n]).slice(0, 7);
  const toggle = (name) => dispatch({ type: "set", patch: { grocery: { ...g, items: g.items.map((i) => (i.name === name ? { ...i, checked: !i.checked } : i)) } } });

  return (
    <div>
      <TopBar title="Grocery list" right={<button className="link" onClick={() => notify("List copied to share")}>Share</button>} />
      <div className="pad">
        {g.amount ? (
          <>
            <p className="eyebrow">Your plan</p>
            <h1 className="display-sm">${g.amount} Grocery Plan</h1>
            <div className="plan-stats">
              <span><b>~${total}</b>estimated total</span>
              <span><b>{g.meals.length || "–"}</b>meal ideas</span>
              <span><b>{g.people}×{g.days}</b>people × days</span>
            </div>
          </>
        ) : <h1 className="display-sm">Your grocery list</h1>}
        {!!highlights.length && <div className="card"><p className="eyebrow">Nutrition highlights</p><div className="tags">{highlights.map((n) => <Nutrient key={n} n={n} />)}</div></div>}
        {groups.map((grp) => (
          <div key={grp}>
            <p className="field-label">{grp}</p>
            <ul className="checklist">
              {g.items.filter((i) => i.group === grp).map((i) => (
                <li key={i.name}><button className={i.checked ? "on" : ""} onClick={() => toggle(i.name)}><span className="box">{i.checked && <Check size={13} />}</span>{i.name}{i.cost ? <small>~${i.cost}</small> : null}</button></li>
              ))}
            </ul>
          </div>
        ))}
        {!!g.meals.length && (
          <div className="card">
            <p className="eyebrow">Meals this makes possible</p>
            <ul className="pairs">{g.meals.map((m) => <li key={m}>{m}</li>)}</ul>
          </div>
        )}
        <p className="muted small">Estimates only. Prices vary by store, region and season. Check WIC or SNAP eligibility in Support Near You.</p>
        <div className="actions">
          <button className="btn btn-soft" onClick={() => nav.go("budget")}>New plan</button>
          <button className="btn btn-ghost" onClick={() => { dispatch({ type: "set", patch: { grocery: null } }); notify("List cleared"); }}>Clear list</button>
        </div>
      </div>
    </div>
  );
}
