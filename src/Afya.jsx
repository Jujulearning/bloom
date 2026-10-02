import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, ArrowRight, ClipboardList, Phone, Clock, ShoppingBasket, Utensils } from "lucide-react";
import { useStore } from "./useStore";
import { AfyaMark, Nutrient, Photo, Disclaimer, TopBar, SaveBtn } from "./ui";
import { AFYA_PROMPTS, RED_FLAGS, FOODS, QA, RECIPES } from "./data";
import { makePlan, trimester } from "./helpers";

const ACTIONS = ["Find foods I already eat", "Build a meal", "Create a grocery list", "Help me prepare a question for my provider"];

function respond(raw, p) {
  const t = raw.toLowerCase();
  const name = p.name;
  const homeFoods = p.cuisines.slice(0, 2).join(" and ");

  if (RED_FLAGS.some((f) => t.includes(f))) {
    const mental = ["suicid", "hurt myself", "harm myself"].some((f) => t.includes(f));
    return mental
      ? { urgent: true, text: `${name}, thank you for telling me. You deserve support right now. Please call or text 988 (Suicide & Crisis Lifeline), or the National Maternal Mental Health Hotline at 1-833-TLC-MAMA (1-833-852-6262), any time, day or night. If you're in immediate danger, call 911.` }
      : { urgent: true, text: `I'm glad you told me. What you're describing should be checked by a professional right away, not managed with food. Please call your prenatal care provider or labor & delivery now. If it feels like an emergency, call 911.`, actions: ["Help me prepare a question for my provider"] };
  }

  if (t.includes("another combination")) {
    const base = raw.split("with").pop().trim();
    return { text: `Here's another way to build around ${base}: try it with grilled fish for protein and omega-3s, sautéed okra and spinach for folate, and sliced tomatoes and peppers for vitamin C, which helps you absorb iron. It works well for week ${p.week}, when your iron and protein needs are climbing.`, nutrients: ["Protein", "Omega-3", "Folate", "Vitamin C"], actions: ["Build a meal", "Create a grocery list"] };
  }

  if (/tired|exhausted|fatigue|no energy|sleepy/.test(t)) {
    return {
      text: `Pregnancy itself can leave you tired. Since you're ${p.week} weeks, we can also look at foods rich in iron, folate, protein, and other nutrients that support you during this stage. You already love ${p.loves.slice(0, 3).join(", ").toLowerCase()}, which is a great start.`,
      nutrients: ["Iron", "Folate", "Protein"],
      ask: "Would you like me to…",
      actions: ACTIONS,
    };
  }

  if (/ghana|ghanaian/.test(t) && /dinner|meal|quick/.test(t)) {
    return {
      text: `Here are three quick Ghanaian-inspired dinners that fit your ${p.cookTime.toLowerCase()} weeknights:`,
      list: [
        ["Red-red with plantain", "25 min · black-eyed peas in a tomato-palm oil stew. Iron, folate, protein."],
        ["Weeknight waakye bowl", "35 min · rice and beans with a boiled egg and tomato stew. Protein, choline."],
        ["Kontomire stew with boiled yam or rice", "30 min · cocoyam leaves (or spinach) with egg or fish. Folate, vitamin A."],
      ],
      recipes: ["red-red", "waakye-bowl"],
      actions: ["Build a meal", "Create a grocery list"],
    };
  }

  if (/iron/.test(t) && !/doctor|provider|levels|ask/.test(t)) {
    return {
      text: `Your iron needs rise to about 27 mg a day in pregnancy. Here are iron-rich foods that already fit how you eat. Pair them with tomatoes, peppers or citrus, since vitamin C helps your body absorb plant iron.`,
      foods: ["black-eyed-peas", "waakye", "lentils", "callaloo"],
      nutrients: ["Iron", "Vitamin C"],
      actions: ["Build a meal", "Help me prepare a question for my provider"],
    };
  }

  const money = t.match(/\$\s?(\d+)/);
  if (money || /budget|grocer|money|afford/.test(t)) {
    const amt = money ? Number(money[1]) : 40;
    return { text: `$${amt} can go a long way. I'd build around beans, eggs, frozen spinach, rice, sweet potatoes, tomatoes and plantain. They're affordable, filling, and rich in iron, folate and protein, and they work for ${homeFoods || "your"} favorites. Want me to turn that into a list for ${p.household} people?`, amount: amt, actions: ["Create a grocery list", "Build a meal"] };
  }

  if (/nause|sick|queasy|throw up|vomit/.test(t)) {
    return {
      text: `I'm sorry, ${name}. Mornings like this are hard. Try something small every couple of hours: plain rice or ugali, plantain, crackers, cold yogurt or fruit, or ginger tea. Sip fluids between bites instead of with meals.`,
      foods: ["plantain", "greek-yogurt", "ugali"],
      note: "If you can't keep fluids down for a day, feel dizzy, or are losing weight, please call your provider.",
      actions: ["Find foods I already eat", "Help me prepare a question for my provider"],
    };
  }

  if (/doctor|provider|midwife|ask .*(about|my)|appointment|iron levels/.test(t)) {
    return {
      text: `Good thinking. Questions like these help you and your care team make decisions together. Here are a few you could bring:`,
      questions: ["I've been more tired than usual. Should we check my iron?", "Should my prenatal vitamin change based on my iron levels?", "Are there nutrients I should prioritize this trimester?"],
    };
  }

  if (/cook|lazy|no energy to make|takeout|easy/.test(t)) {
    return {
      text: `Totally fair. Some days are no-cook days. A few assemble-and-eat ideas:`,
      list: [
        ["Greek yogurt bowl", "Yogurt, banana or mango, and oats. Protein and calcium."],
        ["Bean & avocado wrap", "Canned beans, avocado and salsa in a tortilla. Folate and fiber."],
        ["Rotisserie chicken plate", "Reheat until steaming, then add microwave rice and bagged spinach. Protein and iron."],
        ["Leftover waakye or jollof", "Reheated until hot, with a boiled egg."],
      ],
      actions: ["Create a grocery list"],
    };
  }

  const food = FOODS.find((f) => t.includes(f.name.toLowerCase()));
  if (food) {
    return { text: `${food.name} (${food.origin}): ${food.why} ${food.considerations[0]}`, foods: [food.id], nutrients: food.nutrients, actions: ["Build a meal", "Find foods I already eat"] };
  }

  const recipe = RECIPES.find((r) => t.includes(r.name.toLowerCase()));
  if (recipe) {
    return { text: `Here's how I'd adapt ${recipe.name} for you: keep it under 30 minutes by using canned or frozen shortcuts, make enough for ${p.household} plus leftovers for lunch, and add a vitamin C side to help with iron. ${recipe.swaps[0]} also works.`, recipes: [recipe.id] };
  }

  const qa = QA.find((x) => x.match.some((m) => t.includes(m)));
  if (qa) return { text: `${qa.answer} ${qa.why}`, note: qa.considerations[0], nutrients: qa.nutrients, source: qa.source };

  return {
    text: `I'm here for food questions, big and small. At ${p.week} weeks (${trimester(p.week).toLowerCase()}), I'm keeping an eye on iron, protein, folate and calcium, and I'll always start from the ${homeFoods || "foods you"} love.`,
    ask: "Would you like me to…",
    actions: ACTIONS,
  };
}

export function Afya({ ask }) {
  const { state, dispatch, nav, notify } = useStore();
  const p = state.profile;
  const msgs = state.afya;
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef();
  const asked = useRef(false);

  const add = (m) => dispatch({ type: "afyaAdd", msg: m });

  const send = (q) => {
    const body = (q ?? text).trim();
    if (!body) return;
    setText("");
    add({ from: "me", text: body });
    setTyping(true);
    setTimeout(() => {
      add({ from: "afya", ...respond(body, p) });
      setTyping(false);
    }, 900 + Math.min(body.length * 10, 600));
  };

  const doAction = (a, m) => {
    if (a === "Find foods I already eat") {
      const ids = FOODS.filter((f) => p.loves.some((l) => f.name.toLowerCase().includes(l.toLowerCase().replace(/s$/, "")) || (l === "Beans" && f.id === "black-eyed-peas") || (l === "Spinach" && f.id === "mchicha"))).map((f) => f.id);
      add({ from: "me", text: a });
      add({ from: "afya", text: `These are already in your kitchen. Here's what each brings right now:`, foods: ids.length ? ids : ["plantain", "jollof", "black-eyed-peas"] });
    } else if (a === "Build a meal") {
      nav.go("afya-plan");
    } else if (a === "Create a grocery list") {
      dispatch({ type: "set", patch: { grocery: makePlan({ amount: m?.amount || 50, people: p.household, days: 7, have: ["Rice"], diet: p.diet, cuisines: p.cuisines }) } });
      notify("Grocery list created");
      nav.go("grocery");
    } else if (a === "Help me prepare a question for my provider") {
      add({ from: "me", text: a });
      add({ from: "afya", text: "Here's a question you could bring. Tap to save it to For My Visit:", questions: ["I've been more tired than usual. Should we check my iron?"] });
    }
  };

  useEffect(() => {
    if (ask && !asked.current) { asked.current = true; send(ask); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ask]);

  useEffect(() => { const sc = endRef.current?.closest(".screen"); if (sc && (msgs.length || typing)) sc.scrollTo({ top: sc.scrollHeight, behavior: "smooth" }); }, [msgs.length, typing]);

  return (
    <div className="afya">
      <header className="afya-head">
        <AfyaMark size={44} />
        <div>
          <h1 className="display-sm">Afya</h1>
          <p>Nutrition guidance that starts with you.</p>
        </div>
        {!!msgs.length && <button className="link" onClick={() => dispatch({ type: "set", patch: { afya: [] } })}>New chat</button>}
      </header>
      <div className="afya-context">
        <span>Week {p.week}</span><span>{p.cuisines.slice(0, 2).join(" · ")}</span><span>{p.cookTime}</span><span>{p.budget}</span>
      </div>

      <div className="afya-thread">
        <div className="bubble afya-b">
          <p>Hi {p.name} 🌿 What are you thinking about today?</p>
        </div>
        {!msgs.length && (
          <div className="prompts">
            {AFYA_PROMPTS.map((q) => <button key={q} onClick={() => send(q)}>{q}</button>)}
          </div>
        )}
        {msgs.map((m, k) => (m.from === "me" ? (
          <div key={k} className="bubble me-b"><p>{m.text}</p></div>
        ) : (
          <div key={k} className={"bubble afya-b" + (m.urgent ? " urgent" : "")}>
            {m.urgent && <p className="urgent-tag"><Phone size={14} /> Please reach out for care</p>}
            <p>{m.text}</p>
            {m.list && <ol className="afya-list">{m.list.map(([a, b]) => <li key={a}><b>{a}</b><span>{b}</span></li>)}</ol>}
            {m.foods && (
              <div className="afya-foods">
                {m.foods.map((id) => { const f = FOODS.find((x) => x.id === id); return f && (
                  <button key={id} onClick={() => nav.go("food", { id })}>
                    <Photo name={f.img} pos={f.pos} h={64} r={12} />
                    <span><b>{f.name}</b><small>{f.nutrients.slice(0, 2).join(" · ")}</small></span>
                  </button>
                ); })}
              </div>
            )}
            {m.recipes && <div className="afya-recipes">{m.recipes.map((id) => { const r = RECIPES.find((x) => x.id === id); return <button key={id} className="link" onClick={() => nav.go("recipe", { id })}><Utensils size={14} /> {r.name} <ArrowRight size={14} /></button>; })}</div>}
            {m.nutrients && <div className="tags">{m.nutrients.map((n) => <Nutrient key={n} n={n} />)}</div>}
            {m.note && <p className="afya-note">{m.note}</p>}
            {m.source && <p className="source">Source: {m.source}</p>}
            {m.questions && (
              <div className="afya-qs">
                {m.questions.map((q) => {
                  const saved = state.visitQs.some((v) => v.text === q);
                  return (
                    <button key={q} className={saved ? "on" : ""} onClick={() => { dispatch({ type: "addQ", text: q, from: "Afya" }); notify("Saved to For My Visit"); }}>
                      <ClipboardList size={15} /> <span>{q}</span> <small>{saved ? "Saved" : "Save"}</small>
                    </button>
                  );
                })}
                <button className="link" onClick={() => nav.go("visit")}>Open For My Visit <ArrowRight size={14} /></button>
              </div>
            )}
            {m.ask && <p className="afya-ask">{m.ask}</p>}
            {m.actions && <div className="afya-actions">{m.actions.map((a) => <button key={a} onClick={() => doAction(a, m)}>{a}</button>)}</div>}
          </div>
        )))}
        {typing && <div className="bubble afya-b typing"><i /><i /><i /></div>}
        <div ref={endRef} />
      </div>

      <div className="afya-foot">
        <p className="afya-disc">Afya shares educational guidance, not diagnosis. For urgent symptoms, contact your provider.</p>
        <form className="composer" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask Afya anything about food…" aria-label="Message Afya" />
          <button className="send" disabled={!text.trim()} aria-label="Send"><Send size={18} /></button>
        </form>
      </div>
    </div>
  );
}

export function AfyaPlan() {
  const { state, dispatch, nav, notify } = useStore();
  const p = state.profile;
  const r = RECIPES.find((x) => x.id === "red-red");
  const saved = state.savedRecipes.includes(r.id);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 1100); return () => clearTimeout(t); }, []);

  if (loading) {
    return (
      <div className="plan-loading">
        <AfyaMark size={60} />
        <p className="serif-lg">Building a dinner around what you love…</p>
        <div className="dots"><i /><i /><i /></div>
      </div>
    );
  }

  return (
    <div>
      <TopBar title="Afya's suggestion" />
      <div className="pad">
        <div className="plan-card">
          <Photo name={r.img} pos={r.pos} h={190}>
            <span className="pill"><Sparkles size={13} /> Made for {p.name}</span>
          </Photo>
          <div className="plan-body">
            <p className="eyebrow">Tonight · {r.time} minutes</p>
            <h1 className="display-sm">Red-red with plantain & wilted spinach</h1>
            <p>Built from foods you already love: <b>beans, plantain and spinach</b>. It fits your {p.cookTime.toLowerCase()} evenings and costs {r.costEst}.</p>
            <div className="why-box">
              <p className="eyebrow">Why this, at week {p.week}</p>
              <ul>
                <li><b>Iron + vitamin C</b> · black-eyed peas and spinach bring iron, and the tomatoes help you absorb it.</li>
                <li><b>Folate</b> · beans and greens support your baby's growth.</li>
                <li><b>Steady energy</b> · plantain gives you slow-release carbs for tired evenings.</li>
              </ul>
            </div>
            <div className="tags">{["Iron", "Folate", "Protein", "Vitamin C", "Potassium"].map((n) => <Nutrient key={n} n={n} />)}</div>
            <p className="muted small"><Clock size={13} /> Make a double batch. It keeps 3 days and freezes well.</p>
          </div>
        </div>
        <div className="actions col">
          <button className="btn btn-primary btn-block" onClick={() => { if (!saved) dispatch({ type: "toggleIn", key: "savedRecipes", id: r.id }); dispatch({ type: "plate", plate: { id: "pl" + Date.now(), base: "Red-red", picks: { Protein: "Beans", Vegetable: "Spinach", "Vitamin C": "Tomatoes" } } }); notify("Meal saved"); }}>{saved ? "Meal saved ✓" : "Save this meal"}</button>
          <button className="btn btn-soft btn-block" onClick={() => nav.go("recipe", { id: r.id })}>See the full recipe <ArrowRight size={16} /></button>
          <div className="actions">
            <button className="btn btn-ghost" onClick={() => { dispatch({ type: "set", patch: { grocery: { items: r.ingredients.map((name) => ({ name, group: "From recipes", cost: null, checked: false })), meals: [r.name], amount: null } } }); nav.go("grocery"); }}><ShoppingBasket size={16} /> Grocery list</button>
            <SaveBtn on={saved} onClick={() => { dispatch({ type: "toggleIn", key: "savedRecipes", id: r.id }); notify(saved ? "Removed" : "Saved"); }} />
          </div>
        </div>
        <Disclaimer />
      </div>
    </div>
  );
}
