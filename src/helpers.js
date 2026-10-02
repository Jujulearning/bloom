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
