import { analyzeNutrients } from "./nutrition";
import { isPP, timelineWeek } from "./stage";
import { GROCERY_BASE } from "./data";

export function trimester(week) {
  return week < 14 ? "First trimester" : week < 28 ? "Second trimester" : "Third trimester";
}

export function makePlan({ amount, people, days, have, diet, cuisines }) {
  const veg = /veg/i.test(diet);
  const vegan = /vegan/i.test(diet);
  const pesc = /pesc/i.test(diet);
  const scale = Math.max(1, (people * days) / 14);
  const pool = GROCERY_BASE.filter((g) => !have.some((h) => g.name.toLowerCase().includes(h.toLowerCase().split(" ")[0])))
    .filter((g) => !(veg || pesc) || !g.tags.includes("meat"))
    .filter((g) => !veg || !g.tags.includes("fish"))
    .filter((g) => !vegan || !(g.tags.includes("eggs") || g.tags.includes("dairy")));
  const priority = ["Dried or canned beans", "Eggs (dozen)", "Frozen spinach", "Sweet potatoes", "Rice (5 lb)", "Tomatoes", "Bananas", "Chicken thighs", "Greek yogurt (large tub)", "Bell peppers", "Red lentils", "Plantains", "Onions & garlic", "Canned sardines or salmon", "Oats", "Oranges", "Frozen mixed vegetables", "Fortified cereal"];
  const sorted = [...pool].sort((a, b) => priority.indexOf(a.name) - priority.indexOf(b.name));
  const items = [];
  let total = 0;
  for (const g of sorted) {
    const cost = Math.round(g.cost * (g.group === "Pantry" ? 1 : scale));
    if (total + cost > amount) continue;
    items.push({ name: g.name, group: g.group, cost, checked: false, nutrients: g.nutrients });
    total += cost;
  }
  const names = items.map((i) => i.name).join(" ");
  const wa = cuisines.some((c) => /West African|Ghana|Nigeria/i.test(c));
  const meals = [
    names.includes("beans") && names.includes("Plantain") && (wa ? "Red-red with plantain" : "Beans & plantain bowls"),
    names.includes("Eggs") && names.includes("spinach") && "Spinach & egg scramble with toast",
    names.includes("Sweet potatoes") && "Roasted sweet potato with beans or chicken",
    names.includes("Chicken") && names.includes("Rice") && (wa ? "Jollof-style rice with chicken" : "Chicken, rice & vegetables"),
    names.includes("lentils") && "15-minute red lentil dal",
    names.includes("yogurt") && "Yogurt with banana & oats",
    names.includes("sardines") && "Sardine rice bowls with tomato",
  ].filter(Boolean);
  return { amount, people, days, items, meals, total };
}

export function bpStatus(s, d) {
  if (s >= 160 || d >= 110) return { level: 3, label: "Severe range", short: "Severe", text: "Get care now: call your provider or go to labor & delivery." };
  if (s >= 140 || d >= 90) return { level: 2, label: "High", short: "High", text: "Call your provider today. A reading of 140/90 or higher should be checked the same day." };
  if (s >= 120 || d >= 80) return { level: 1, label: "A little higher", short: "Watch", text: "Still under 140/90. Keep tracking and mention it at your next visit." };
  return { level: 0, label: "Typical range", short: "Typical", text: "Keep checking as often as your provider suggests." };
}

// Approximate total weight-gain range (lb) for pre-pregnancy BMI 18.5–24.9 (25–35 lb total)
export function weightBand(week) {
  if (week <= 13) return { lo: Math.round((1.1 * week) / 13 * 10) / 10, hi: Math.round((4.4 * week) / 13 * 10) / 10 };
  return { lo: Math.round((1.1 + 0.8 * (week - 13)) * 10) / 10, hi: Math.round((4.4 + 1.0 * (week - 13)) * 10) / 10 };
}

/* ---------- Safety: red flags, scope and privacy ---------- */
const has = (t, list) => list.some((w) => t.includes(w));

const EMERGENCY = ["chest pain", "can't breathe", "cant breathe", "trouble breathing", "hard to breathe", "seizure", "passed out", "fainted", "unconscious", "soaking a pad", "soaking pads", "heavy bleeding", "bleeding a lot", "kill myself", "suicid", "end my life", "want to die", "hurt myself", "harm myself", "hurt my baby", "harm my baby"];
const SELF_HARM = ["kill myself", "suicid", "end my life", "want to die", "hurt myself", "harm myself", "hurt my baby", "harm my baby"];
const URGENT = ["bleeding", "spotting", "severe headache", "headache won't", "headache that won't", "worst headache", "vision", "blurry", "seeing spots", "flashing lights", "swollen face", "face is swollen", "swelling in my face", "hands are swollen", "sudden swelling", "upper belly", "right side pain", "baby isn't moving", "baby is not moving", "baby not moving", "baby moving less", "less movement", "not moving as much", "stopped moving", "leaking fluid", "water broke", "fever", "contractions", "can't keep anything down", "cant keep anything down", "can't keep fluids", "vomiting all day"];
const MOOD = ["depressed", "hopeless", "can't stop crying", "cant stop crying", "panic attack", "anxious all the time", "so overwhelmed", "don't feel like myself", "numb"];
const UNSAFE = ["hits me", "hit me", "hurts me", "afraid of my partner", "scared of my partner", "not safe at home", "threatens me", "abuse"];
const SCOPE = /(diagnos|do i have|what do i have|is it (diabetes|preeclampsia|anemia)|prescri|dosage|\bdose\b|how many mg|\d+\s?mg\b|stop taking|quit taking|skip my (med|pill)|switch (my )?(med|pill)|change my (med|dose|pill)|my medication|my meds|antibiotic|insulin|metformin|labetalol|nifedipine|baby aspirin|ibuprofen|advil|tylenol|acetaminophen|antidepressant|zoloft|sertraline|can i take|should i take)/;

export function assessMessage(raw) {
  const t = raw.toLowerCase();
  const bp = t.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
  if (has(t, SELF_HARM)) return { kind: "crisis" };
  if (has(t, EMERGENCY)) return { kind: "emergency" };
  if (bp) {
    const st = bpStatus(Number(bp[1]), Number(bp[2]));
    if (st.level === 3) return { kind: "emergency", bp: `${bp[1]}/${bp[2]}` };
    if (st.level === 2) return { kind: "urgent", bp: `${bp[1]}/${bp[2]}` };
  }
  if (has(t, UNSAFE)) return { kind: "unsafe" };
  if (has(t, URGENT)) return { kind: "urgent" };
  if (has(t, MOOD)) return { kind: "mood" };
  if (SCOPE.test(t)) return { kind: "scope" };
  return null;
}

export function piiCheck(raw) {
  const found = [];
  if (/[\w.+-]+@[\w-]+\.[\w.]+/.test(raw)) found.push("an email address");
  if (/\b\d{3}-\d{2}-\d{4}\b/.test(raw)) found.push("a Social Security number");
  else if (/(\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/.test(raw)) found.push("a phone number");
  if (/\b\d{1,5}\s+\w+(\s\w+)?\s(street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|way)\b/i.test(raw)) found.push("a street address");
  if (/(member|insurance|policy|medicaid)\s*(id|number|#)/i.test(raw)) found.push("an insurance ID");
  if (/\b(dob|date of birth|born on)\b/i.test(raw)) found.push("a birth date");
  return found;
}

export function riskSignals(state) {
  const out = [];
  const bp = state.bp;
  const last = bp[bp.length - 1];
  const st = bpStatus(last.s, last.d);
  if (st.level === 3) out.push({ level: "high", id: "bp3", title: `Your last blood pressure (${last.s}/${last.d}) is in the severe range.`, body: "Please get care now: call your provider or go to labor & delivery. If you have a severe headache, vision changes or trouble breathing, call 911.", actions: [["Get help now", "urgent"]] });
  else if (st.level === 2) out.push({ level: "high", id: "bp2", title: `Your last blood pressure (${last.s}/${last.d}) is high.`, body: "A reading of 140/90 or higher in pregnancy should be checked by your provider today.", actions: [["Get help now", "urgent"], ["Open my BP", "health"]] });
  else if (bp.length > 2 && last.s - bp[0].s >= 10) out.push({ level: "watch", id: "bptrend", title: `Your blood pressure has crept up since week ${bp[0].week}.`, body: `From ${bp[0].s}/${bp[0].d} to ${last.s}/${last.d}. Still under 140/90, and worth a conversation at your next visit. Checking a couple of times this week will help.`, actions: [["See my trend", "health"], ["Add to For My Visit", "addq:bp"]] });
  const recent = state.symptoms.filter((s) => s.week >= timelineWeek(state.profile) - 1).flatMap((s) => s.list);
  if (st.level >= 1 && (recent.includes("Headache") || recent.includes("Swelling"))) out.push({ level: "high", id: "bpsym", title: "Headache or swelling, with blood pressure on the rise.", body: "Together these can be early signs of preeclampsia. Please call your provider today to check in.", actions: [["Get help now", "urgent"]] });
  if (state.symptoms.flatMap((s) => s.list).filter((x) => x === "Feeling low").length >= 2 || ["More than half the days", "Nearly every day"].includes(state.sdoh.answers.stress)) out.push({ level: "watch", id: "mood", title: "You've been carrying a lot lately.", body: "Feeling low or anxious in pregnancy is common and treatable. You deserve support: talk with your provider, or call or text 1-833-TLC-MAMA any time.", actions: [["Mental wellness support", "support:mental"]] });
  const tired = state.checkins.filter((c) => c.mood === "Tired").length;
  if (tired >= 3) out.push({ level: "info", id: "tired", title: `You've checked in tired ${tired} times this week.`, body: isPP(state.profile) ? "Tiredness after birth is expected, and blood loss at delivery can also lower iron. It's worth asking whether your iron should be checked." : "Pregnancy fatigue is common, and it's also worth asking whether your iron should be checked.", actions: [["Add the iron question", "addq:iron"], ["Iron-rich foods I know", "library:Iron"]] });
  const ep = state.epds?.[state.epds.length - 1];
  if (ep && ep.score >= 13) out.push({ level: "high", id: "epds", title: "Your last mood check suggests you may be living with depression.", body: "It isn't a diagnosis, and it's very treatable. Please talk with your provider this week. You can call or text 1-833-TLC-MAMA any time.", actions: [["Mood support", "mood"], ["Add to For My Visit", "addq:mood"]] });
  else if (ep && ep.score >= 10) out.push({ level: "watch", id: "epds", title: "Your last mood check showed some signs of depression.", body: "Worth bringing up with your provider, and checking in again in two weeks.", actions: [["Mood support", "mood"], ["Add to For My Visit", "addq:mood"]] });
  if (!ep && isPP(state.profile) && state.profile.ppWeek >= 2) out.push({ level: "info", id: "epds-due", title: "Time for a 2-minute mood check.", body: "Doctors recommend checking in on mood after birth, at your postpartum visit and your baby's checkups. It's private, and support is close by.", actions: [["Take the mood check", "mood"]] });
  const nut = analyzeNutrients(state);
  if (nut.days && nut.gaps.length) out.push({ level: "info", id: "nutrients", title: `Your meals look light on ${nut.gaps.slice(0, 3).map((g) => g.short).join(", ").replace(/, ([^,]*)$/, " and $1")}.`, body: "Based on your food log. A few foods from your own table can help, and you can ask your provider whether a supplement makes sense.", actions: [["See my nutrient check", "nutrients"]] });
  if (state.sdoh.done && ["Often", "Sometimes"].includes(state.sdoh.answers.food)) out.push({ level: "info", id: "food", title: "Groceries have been tight.", body: "WIC and SNAP can help, and your budget planner builds around foods you already love.", actions: [["See food support", "support:food"], ["Budget planner", "budget"]] });
  return out;
}
