/* global process */
/* Meal estimate endpoint (Vercel serverless function).
   Takes a photo of a plate (or a short description) and returns estimated foods, portions, calories and
   pregnancy-relevant nutrients, plus up to 2 follow-up questions when an answer would change the estimate.
   The photo is used for this request only and is never stored. Uses ANTHROPIC_API_KEY (same as /api/afya). */

const MODEL = process.env.AFYA_MEAL_MODEL || process.env.AFYA_MODEL || "claude-haiku-4-5-20251001";
const NUM = ["kcal", "protein", "iron", "folate", "calcium", "vitD", "choline", "dha"];

const SYSTEM = `You estimate the nutrition of a meal for a pregnant or postpartum woman's food log, from a photo and/or her description.
Use USDA FoodData Central values. Recognize West African, East African, Caribbean, South Asian, Latin American and other home cooking by name (for example jollof, waakye, egusi, fufu, ugali, sukuma wiki, callaloo, rice and peas, dal, pupusas).

Return ONLY a JSON object, no other text:
{
  "notFood": false,
  "items": [{ "name": "Jollof rice", "portion": "about 1½ cups", "kcal": 0, "protein": 0, "iron": 0, "folate": 0, "calcium": 0, "vitD": 0, "choline": 0, "dha": 0 }],
  "questions": [{ "q": "How was the plantain cooked?", "options": ["Fried", "Boiled", "Roasted"] }],
  "confidence": "low" | "medium" | "high",
  "tip": "one short, warm sentence"
}

Rules:
- Each item's numbers are totals for the estimated portion: kcal, protein g, iron mg, folate mcg DFE, calcium mg, vitD mcg, choline mg, dha mg.
- Split mixed plates into their main components (rice, stew, protein, sides). At most 8 items.
- Ask at most 2 questions, only when the answer would change the estimate by roughly 20% or more (portion size, frying vs boiling, oil, hidden ingredients). Give 2 to 4 short options. If her answers are provided, use them and return no questions.
- If the photo isn't food, set notFood to true and return empty items.
- The tip may mention one helpful pairing (for example vitamin C with plant iron) or a food-safety point relevant to pregnancy (for example fish cooked through). Never comment on her body, weight or how much she ate, and never suggest eating less.
- Be honest about uncertainty through "confidence".`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: "not_configured" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const content = [];
  const img = typeof body?.image === "string" ? body.image.match(/^data:(image\/(jpeg|png|webp));base64,(.+)$/) : null;
  if (img) {
    if (img[3].length > 5_000_000) return res.status(413).json({ error: "image_too_large" });
    content.push({ type: "image", source: { type: "base64", media_type: img[1], data: img[3] } });
  }
  const text = typeof body?.text === "string" ? body.text.slice(0, 600).trim() : "";
  const answers = Array.isArray(body?.answers) ? body.answers.slice(0, 4).filter((a) => a && typeof a.q === "string" && typeof a.a === "string") : [];
  if (!img && !text) return res.status(400).json({ error: "bad_request" });
  const stage = typeof body?.stage === "string" ? body.stage.slice(0, 80) : "";
  content.push({
    type: "text",
    text: [
      img ? "Here is a photo of my meal." : "",
      text ? `My description: ${text}` : "",
      answers.length ? `My answers: ${answers.map((a) => `${a.q.slice(0, 120)} → ${a.a.slice(0, 80)}`).join("; ")}` : "",
      stage ? `(I'm ${stage}.)` : "",
    ].filter(Boolean).join("\n"),
  });

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 900, system: SYSTEM, messages: [{ role: "user", content }] }),
    });
    const j = await r.json();
    if (!r.ok) return res.status(502).json({ error: j?.error?.type || "upstream_error" });
    const out = (j.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
    const json = JSON.parse(out.slice(out.indexOf("{"), out.lastIndexOf("}") + 1));
    const clamp = (v, max) => Math.max(0, Math.min(max, Number(v) || 0));
    const items = (Array.isArray(json.items) ? json.items : []).slice(0, 8).map((it) => ({
      name: String(it.name || "Food").slice(0, 60),
      portion: String(it.portion || "").slice(0, 40),
      ...Object.fromEntries(NUM.map((k) => [k, clamp(it[k], k === "kcal" ? 3000 : k === "folate" || k === "calcium" || k === "choline" || k === "dha" ? 3000 : 200)])),
    }));
    const questions = answers.length ? [] : (Array.isArray(json.questions) ? json.questions : []).slice(0, 2)
      .filter((q) => q && q.q && Array.isArray(q.options))
      .map((q) => ({ q: String(q.q).slice(0, 120), options: q.options.slice(0, 4).map((o) => String(o).slice(0, 40)) }));
    return res.status(200).json({
      notFood: !!json.notFood,
      items,
      questions,
      confidence: ["low", "medium", "high"].includes(json.confidence) ? json.confidence : "medium",
      tip: typeof json.tip === "string" ? json.tip.slice(0, 240) : "",
    });
  } catch {
    return res.status(502).json({ error: "upstream_error" });
  }
}
