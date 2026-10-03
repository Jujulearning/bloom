/* One source of truth for where she is in her 1,000 days, so every screen agrees.
   - Pregnant: gestational week 4–42 (counted from the last menstrual period, as clinicians do).
     Trimesters (ACOG): 1st through 13w6d, 2nd 14w0d–27w6d, 3rd from 28w0d. Full term from 39 weeks.
   - Postpartum: weeks since birth, 0–104. The "fourth trimester" is the first 12 weeks.
   - A continuous "timeline week" (gestational week, then birth week + weeks since birth) keeps BP,
     weight and symptom logs on one axis across pregnancy and postpartum. */

export const PREG_MIN = 4, PREG_MAX = 42, PP_MAX = 104;

export const isPP = (p) => p.stage === "Postpartum";
export const birthWeek = (p) => Math.min(PREG_MAX, Math.max(37, p.birthWeek || 40));
export const timelineWeek = (p) => (isPP(p) ? birthWeek(p) + (p.ppWeek ?? 0) : p.week);

export function trimesterOf(week) {
  return week < 14 ? "First trimester" : week < 28 ? "Second trimester" : "Third trimester";
}

export function phase(p) {
  if (!isPP(p)) return trimesterOf(p.week);
  const w = p.ppWeek ?? 0;
  return w < 12 ? "Fourth trimester" : w < 52 ? "Baby's first year" : "Toddler year";
}

// Short label used across the app: "Week 24" or "6 weeks postpartum"
export function stageLabel(p) {
  if (!isPP(p)) return `Week ${p.week}`;
  const w = p.ppWeek ?? 0;
  return w === 0 ? "Newborn week" : `${w} week${w === 1 ? "" : "s"} postpartum`;
}

// Label for a logged entry on the timeline axis
export function entryLabel(entry, p) {
  if (entry.pp != null) return `${entry.pp} wk postpartum`;
  if (isPP(p) && entry.week > birthWeek(p)) return `${entry.week - birthWeek(p)} wk postpartum`;
  return `week ${entry.week}`;
}

// Stamp a new log entry with the right time fields
export const stamp = (p) => (isPP(p) ? { week: timelineWeek(p), pp: p.ppWeek ?? 0 } : { week: p.week });

// Day of the 1,000 days (conception to age 2). Conception is ~2 weeks after the LMP.
export function dayOf1000(p) {
  const d = isPP(p) ? (birthWeek(p) - 2) * 7 + (p.ppWeek ?? 0) * 7 : (p.week - 2) * 7;
  return Math.max(1, Math.min(1000, d));
}

export function dueDateFor(week) {
  const d = new Date();
  d.setDate(d.getDate() + (40 - week) * 7);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// Baby's size and development by gestational week (approximate; common clinical references).
const SIZES = [
  [4, "a poppy seed", "The neural tube, which becomes the brain and spine, is forming. Folate matters most right now."],
  [6, "a lentil", "A tiny heart has started beating."],
  [8, "a kidney bean", "Arms, legs, fingers and toes are forming."],
  [10, "a strawberry", "All the major organs are in place and starting to work."],
  [12, "a lime", "Your baby can open and close their fingers."],
  [14, "a lemon", "Your baby can make facial expressions, and bones are hardening."],
  [16, "an avocado", "Many people start to feel the first flutters of movement between now and week 22."],
  [18, "a sweet potato", "Your baby is starting to hear sounds, including your voice."],
  [20, "a ripe plantain", "Halfway there. This is when the anatomy scan usually happens."],
  [22, "a papaya", "Your baby's senses of touch and taste are developing."],
  [24, "an ear of corn", "Lungs are developing, and your baby has regular sleep and wake cycles."],
  [26, "a head of lettuce", "Your baby is practicing breathing movements and reacts to sound."],
  [28, "an eggplant", "Third trimester. Eyes can open, and the brain is growing fast, so DHA and iron matter."],
  [30, "a cabbage", "Your baby is gaining weight quickly and can follow light."],
  [32, "a large squash", "Bones are fully formed but still soft, so calcium keeps mattering."],
  [34, "a pineapple", "Lungs and the nervous system are maturing."],
  [36, "a honeydew melon", "Your baby is gaining fat that helps keep them warm after birth."],
  [37, "a big bunch of collard greens", "Early term. Your baby is getting ready to meet you."],
  [39, "a small watermelon", "Full term. Most babies arrive between 39 and 41 weeks."],
  [41, "a watermelon", "Late term. Your provider will be keeping a close eye on you and your baby."],
];
export function comingUp(week, n = 3) {
  return SIZES.filter((r) => r[0] > week).slice(0, n).map(([w, size, note]) => ({ week: w, size, note }));
}

export function babyAge(ppWeek) {
  if (ppWeek < 13) return `${ppWeek} week${ppWeek === 1 ? "" : "s"} old`;
  const m = Math.floor(ppWeek / 4.345);
  return m < 24 ? `${m} months old` : "2 years old";
}

export function babyThisWeek(week) {
  let row = SIZES[0];
  for (const r of SIZES) if (week >= r[0]) row = r;
  return { size: row[1], note: row[2] };
}

// Postpartum guidance by weeks since birth (ACOG Committee Opinion 736; AAP).
export function postpartumThisWeek(w) {
  if (w < 2) return "Rest, fluids and warm, iron-rich foods. Your milk is coming in, and most babies regain their birth weight by about 2 weeks.";
  if (w < 3) return "Keep checking your blood pressure: preeclampsia can still appear up to 6 weeks after birth. Talk with your provider within the first 3 weeks.";
  if (w < 6) return "Baby blues should be fading. If low mood lasts beyond 2 weeks, take the mood check and tell your provider.";
  if (w < 12) return "Your full postpartum visit should happen by 12 weeks. It's a good time to talk about mood, feeding, sleep and birth spacing.";
  if (w < 26) return "Around 6 months, many babies are ready for first foods. Iron-rich ones from your kitchen are perfect.";
  if (w < 52) return "Keep nourishing yourself too: iron, protein and DHA still matter, especially if you're breastfeeding.";
  return "Your toddler can share most family foods now, with less salt and cut into safe sizes.";
}

// Extra calories over pre-pregnancy needs (National Academies EER).
export function extraCalories(p, lactating) {
  if (isPP(p)) return lactating ? ((p.ppWeek ?? 0) < 26 ? 330 : 400) : 0;
  return p.week < 14 ? 0 : p.week < 28 ? 340 : 452;
}

export const isLactating = (p) => isPP(p) && (p.feeding || "Breastfeeding") !== "Formula";
