/* Nutrient check: a simple, explainable gap estimate from a 3-day food log.
   Values are approximate per serving (USDA FoodData Central); recipes vary.
   This is guidance, not a diagnosis. Supplements are always provider-first. */

// Amazon Associates tracking ID. Set VITE_AMAZON_TAG in Vercel (or edit here), e.g. "amarahealth-20".
export const AMAZON_TAG = (import.meta.env && import.meta.env.VITE_AMAZON_TAG) || "";
export const AMAZON_DISCLOSURE = "As an Amazon Associate, Amara earns from qualifying purchases.";
export const amazonLink = (q) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}${AMAZON_TAG ? `&tag=${encodeURIComponent(AMAZON_TAG)}` : ""}`;

export const NUTRIENTS = [
  { k: "iron", short: "iron", label: "Iron", unit: "mg", why: "Carries oxygen to you and your baby. Needs rise by half in pregnancy." },
  { k: "folate", short: "folate", label: "Folate", unit: "mcg", why: "Builds your baby's brain and spine, and new blood cells." },
  { k: "calcium", short: "calcium", label: "Calcium", unit: "mg", why: "Builds your baby's bones and protects your own." },
  { k: "vitD", short: "vitamin D", label: "Vitamin D", unit: "mcg", why: "Helps your body use calcium. Hard to get from food alone." },
  { k: "choline", short: "choline", label: "Choline", unit: "mg", why: "Supports your baby's brain and memory. Most prenatals have little." },
  { k: "dha", short: "DHA", label: "DHA (omega-3)", unit: "mg", why: "A fat that builds your baby's brain and eyes. Found mostly in fish." },
  { k: "protein", short: "protein", label: "Protein", unit: "g", why: "Grows your baby, placenta and your own changing body." },
];

// Daily targets (National Academies DRIs, ages 19–50). DHA: ACOG / expert guidance of at least 200 mg.
export const TARGETS = {
  Pregnant: { iron: 27, folate: 600, calcium: 1000, vitD: 15, choline: 450, dha: 200, protein: 71 },
  Breastfeeding: { iron: 9, folate: 500, calcium: 1000, vitD: 15, choline: 550, dha: 200, protein: 71 },
  Postpartum: { iron: 18, folate: 400, calcium: 1000, vitD: 15, choline: 425, dha: 200, protein: 46 },
};

// What most prenatal vitamins cover. Many have little or no choline or calcium, and some have no DHA.
export const PRENATAL_COVERS = ["folate", "iron", "vitD"];

// Per serving: iron mg, folate mcg DFE, calcium mg, vitD mcg, choline mg, dha mg, protein g, calories
const n = (iron, folate, calcium, vitD, choline, dha, protein, kcal) => ({ iron, folate, calcium, vitD, choline, dha, protein, kcal });
export const NUTRI_DB = [
  { id: "waakye", name: "Waakye", serving: "1 cup", group: "Meals", v: n(2.5, 120, 40, 0, 30, 0, 9, 300) },
  { id: "jollof", name: "Jollof rice", serving: "1 cup", group: "Meals", v: n(1.5, 60, 30, 0, 25, 0, 5, 300) },
  { id: "egusi", name: "Egusi soup", serving: "1 cup", group: "Meals", v: n(3, 60, 80, 0, 40, 0, 14, 350) },
  { id: "ugali", name: "Ugali", serving: "1 cup", group: "Meals", v: n(1.5, 50, 5, 0, 15, 0, 4, 200) },
  { id: "black-eyed-peas", name: "Black-eyed peas", serving: "½ cup", group: "Beans", v: n(2.2, 180, 20, 0, 30, 0, 7, 100) },
  { id: "lentils", name: "Lentils", serving: "½ cup", group: "Beans", v: n(3.3, 180, 19, 0, 32, 0, 9, 115) },
  { id: "beans", name: "Kidney beans", serving: "½ cup", group: "Beans", v: n(2, 115, 30, 0, 27, 0, 7.7, 110) },
  { id: "collards", name: "Collard greens", serving: "½ cup cooked", group: "Greens & veg", v: n(1.1, 90, 135, 0, 30, 0, 2.5, 30) },
  { id: "callaloo", name: "Callaloo", serving: "1 cup cooked", group: "Greens & veg", v: n(3, 55, 275, 0, 30, 0, 5, 30) },
  { id: "mchicha", name: "Mchicha", serving: "1 cup cooked", group: "Greens & veg", v: n(3, 55, 275, 0, 30, 0, 5, 30) },
  { id: "spinach", name: "Spinach", serving: "½ cup cooked", group: "Greens & veg", v: n(3.2, 130, 120, 0, 15, 0, 2.7, 20) },
  { id: "okra", name: "Okra", serving: "½ cup", group: "Greens & veg", v: n(0.2, 37, 62, 0, 15, 0, 1.5, 18) },
  { id: "sweet-potato", name: "Sweet potato", serving: "1 medium", group: "Greens & veg", v: n(0.8, 7, 40, 0, 15, 0, 2, 105) },
  { id: "plantain", name: "Plantain", serving: "1 cup cooked", group: "Fruit & starch", v: n(0.8, 40, 3, 0, 15, 0, 1.2, 215) },
  { id: "avocado", name: "Avocado", serving: "½ fruit", group: "Fruit & starch", v: n(0.6, 80, 12, 0, 14, 0, 2, 120) },
  { id: "oj", name: "Orange juice, fortified", serving: "1 cup", group: "Fruit & starch", v: n(0.5, 74, 350, 2.5, 15, 0, 2, 110) },
  { id: "bread", name: "Bread, enriched", serving: "2 slices", group: "Fruit & starch", v: n(1.8, 100, 80, 0, 10, 0, 5, 150) },
  { id: "oatmeal", name: "Oatmeal", serving: "1 cup cooked", group: "Fruit & starch", v: n(2.1, 14, 20, 0, 17, 0, 6, 160) },
  { id: "cereal", name: "Fortified cereal", serving: "1 bowl", group: "Fruit & starch", v: n(8, 170, 100, 1, 10, 0, 3, 150) },
  { id: "salmon", name: "Salmon", serving: "3 oz", group: "Protein", v: n(0.3, 20, 10, 12, 90, 900, 22, 175) },
  { id: "sardines", name: "Sardines, canned", serving: "3 oz", group: "Protein", v: n(2.5, 10, 325, 4.1, 65, 430, 21, 180) },
  { id: "eggs", name: "Egg", serving: "1 large", group: "Protein", v: n(0.9, 22, 28, 1.1, 147, 30, 6, 70) },
  { id: "chicken", name: "Chicken", serving: "3 oz", group: "Protein", v: n(0.9, 4, 13, 0.1, 72, 20, 26, 140) },
  { id: "beef", name: "Beef, lean", serving: "3 oz", group: "Protein", v: n(2.6, 8, 10, 0.1, 85, 0, 22, 180) },
  { id: "greek-yogurt", name: "Greek yogurt", serving: "¾ cup", group: "Dairy", v: n(0.1, 12, 190, 0, 25, 0, 17, 120) },
  { id: "milk", name: "Milk, fortified", serving: "1 cup", group: "Dairy", v: n(0, 12, 300, 2.9, 40, 0, 8, 120) },
];
export const byId = (id) => NUTRI_DB.find((f) => f.id === id);
// Logged foods are either from NUTRI_DB or her own entries (from a photo or description).
export const foodFor = (id, state) => byId(id) || state.customFoods?.[id];

// Logs are keyed by real local dates, so "Today" is always today.
export const dayKey = (offset = 0) => { const d = new Date(); d.setDate(d.getDate() - offset); return d.toLocaleDateString("en-CA"); };
export const lastDays = () => [2, 1, 0].map((o) => [dayKey(o), o === 0 ? "Today" : o === 1 ? "Yesterday" : new Date(Date.now() - o * 864e5).toLocaleDateString("en-US", { weekday: "long" })]);

// Shopping options, shown only as "if your provider recommends it". No doses, never vitamin A.
export const SUPPLEMENTS = {
  prenatal: { label: "Prenatal vitamin with DHA & choline", q: "prenatal vitamin with DHA and choline", note: "If you're not taking one, ask your provider which prenatal is right for you." },
  choline: { label: "Choline", q: "choline supplement prenatal", note: "Most prenatals have little or no choline." },
  dha: { label: "DHA omega-3 (fish or algae)", q: "prenatal DHA omega-3 algae", note: "Algae-based DHA works if you don't eat fish." },
  calcium: { label: "Calcium", q: "calcium citrate supplement", note: "Best taken at a different time than iron." },
  vitD: { label: "Vitamin D3", q: "vitamin D3 supplement", note: "Many people need more vitamin D than food provides." },
  iron: { label: "Iron", q: "gentle iron supplement pregnancy", note: "Only if your provider recommends it. Too much iron can cause side effects." },
  folate: { label: "Folate (in a prenatal)", q: "prenatal vitamin with folate", note: "Usually covered by a prenatal vitamin." },
};

const r1 = (x) => Math.round(x * 10) / 10;

export const dayTotals = (state, key) => {
  const t = Object.fromEntries([...NUTRIENTS.map((x) => x.k), "kcal"].map((k) => [k, 0]));
  Object.entries(state.foodLog?.[key] || {}).forEach(([id, sv]) => {
    const f = foodFor(id, state);
    if (f) Object.keys(t).forEach((k) => { t[k] += (f.v[k] || 0) * sv; });
  });
  return t;
};

export function analyzeNutrients(state) {
  const log = state.foodLog || {};
  const p = state.profile;
  const stage = p.stage !== "Postpartum" ? "Pregnant" : (p.feeding || "Breastfeeding") !== "Formula" ? "Breastfeeding" : "Postpartum";
  const target = TARGETS[stage];
  const keys = lastDays().map(([d]) => d).filter((d) => Object.values(log[d] || {}).some((x) => x > 0));
  const days = keys;
  const totals = Object.fromEntries(NUTRIENTS.map((x) => [x.k, 0]));
  keys.forEach((d) => { const t = dayTotals(state, d); NUTRIENTS.forEach(({ k }) => { totals[k] += t[k]; }); });
  const prenatal = state.prenatal || "unsure";
  const rows = NUTRIENTS.map((x) => {
    const avg = days.length ? totals[x.k] / days.length : 0;
    const pct = avg / target[x.k];
    const covered = prenatal === "yes" && PRENATAL_COVERS.includes(x.k);
    const status = pct >= 0.9 ? "met" : pct >= 0.7 ? "close" : "low";
    return { ...x, avg: r1(avg), target: target[x.k], pct, status, covered, gap: status === "low" && !covered };
  });
  const gaps = rows.filter((r) => r.gap);
  const shop = [];
  if (prenatal !== "yes") shop.push("prenatal");
  gaps.forEach((g) => { if (SUPPLEMENTS[g.k] && !(prenatal !== "yes" && PRENATAL_COVERS.includes(g.k))) shop.push(g.k); });
  return { stage, days: days.length, rows, gaps, prenatal, shop, kcalToday: Math.round(dayTotals(state, dayKey(0)).kcal) };
}

// Best food sources for a nutrient, favoring foods from her own table.
export function topFoods(k, loves = []) {
  const lov = loves.map((x) => x.toLowerCase());
  return [...NUTRI_DB]
    .map((f) => ({ ...f, score: f.v[k] * (lov.some((l) => f.name.toLowerCase().includes(l.split(" ")[0])) ? 1.4 : 1) }))
    .filter((f) => f.v[k] > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

const SEED = [
  { oatmeal: 1, milk: 1, jollof: 1.5, chicken: 1.5, plantain: 1, collards: 1, "greek-yogurt": 1 },
  { bread: 1, eggs: 1, waakye: 1.5, chicken: 1, spinach: 1, oj: 1, avocado: 1 },
  { oatmeal: 1, milk: 1, "black-eyed-peas": 1, plantain: 1, beef: 1, "sweet-potato": 1, callaloo: 1 },
];
export const seedLog = () => ({ [dayKey(2)]: SEED[0], [dayKey(1)]: SEED[1], [dayKey(0)]: SEED[2] });
// Older saved logs used "d0/d1/d2" for 2 days ago / yesterday / today.
export function migrateLog(log = {}) {
  if (!("d0" in log || "d1" in log || "d2" in log)) return log;
  const { d0, d1, d2, ...rest } = log;
  return { ...rest, [dayKey(2)]: d0 || {}, [dayKey(1)]: d1 || {}, [dayKey(0)]: d2 || {} };
}
