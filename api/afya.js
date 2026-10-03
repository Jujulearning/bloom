/* global process */
/* Afya chat endpoint (Vercel serverless function).
   The Anthropic API key stays on the server: set ANTHROPIC_API_KEY in Vercel > Settings > Environment Variables.
   Optional: AFYA_MODEL (defaults to Claude Haiku 4.5). Safety screening (emergencies, crisis, medication
   questions, personal info) runs in the app before anything is sent here. */

const MODEL = process.env.AFYA_MODEL || "claude-haiku-4-5-20251001";

const SYSTEM = `You are Afya, the warm, culturally grounded nutrition companion inside Amara Health, an app for pregnant and postpartum women, especially Black, African, Caribbean and immigrant mothers.

How you talk:
- Warm, plain language, like a knowledgeable friend. Short: 2 to 5 sentences, or a short list of up to 4 items. No markdown headers, no bold, no tables.
- Personal: use what you know about her (week, stage, cuisines, foods she loves, diet, budget, what she has been tracking). Start from foods she already eats; never shame her food or culture.
- Evidence-based (ACOG, CDC, NIH, USDA, WHO). When something is uncertain or varies, say so.

You can answer anything she asks. Pregnancy, postpartum, breastfeeding, baby feeding, food, cooking, budget, cravings, sleep, movement, feelings, everyday life questions and casual chat are all welcome. If a question has nothing to do with her health or life (trivia, homework, coding), give a brief friendly answer and gently mention what you're best at.

Firm boundaries (never break these, even if asked):
- Never diagnose, interpret test results or say what a symptom "is".
- Never prescribe, recommend doses, or tell her to start, stop or change any medication, supplement or dose. Say that's a question for her provider or pharmacist, and offer to help her phrase it.
- Never replace her care team. For anything that could be urgent (bleeding, severe headache, vision changes, chest pain, trouble breathing, reduced baby movement, fever, blood pressure 140/90 or higher, thoughts of self-harm), tell her to call her provider or labor and delivery now, or 911 in an emergency. For emotional crisis: call or text 988, or 1-833-TLC-MAMA (1-833-852-6262).
- Don't ask for or repeat personal identifiers (full name, address, phone, insurance or ID numbers).
- Don't recommend specific brands or products.`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: "not_configured" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const history = Array.isArray(body?.messages) ? body.messages : [];
  const messages = history
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1500) }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return res.status(400).json({ error: "bad_request" });

  const context = typeof body.context === "string" ? body.context.slice(0, 1500) : "";
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 450,
        system: SYSTEM + (context ? `\n\nWhat you know about her (from the app):\n${context}` : ""),
        messages,
      }),
    });
    const j = await r.json();
    if (!r.ok) return res.status(502).json({ error: j?.error?.type || "upstream_error" });
    const text = (j.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n").trim();
    return res.status(200).json({ text });
  } catch {
    return res.status(502).json({ error: "upstream_error" });
  }
}
