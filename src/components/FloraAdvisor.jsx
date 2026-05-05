import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { useAppState, useAppDispatch, STAGE_LABEL } from "../hooks/useAppState";

let AnthropicClient = null;
try {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  if (import.meta.env.VITE_ANTHROPIC_API_KEY) {
    AnthropicClient = new Anthropic({
      apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }
} catch {}

const QUICK_REPLIES = [
  "I'm exhausted and don't know if it's normal",
  "My baby isn't eating well",
  "I think I might have postpartum depression",
  "What vitamins should I be taking?",
  "I have a bad headache that won't go away",
];

const STATIC_RESPONSES = {
  "I'm exhausted and don't know if it's normal":
    "Yes — this kind of exhaustion is extremely common, especially in the first year. Interrupted sleep compounds over time in ways that hit harder than any single all-nighter. That said, exhaustion that feels crushing or doesn't improve with rest can be a sign of anemia or thyroid issues, both common postpartum. When did you last have bloodwork done? If it's been more than 6 weeks since delivery, it's worth asking your provider for a postpartum panel.",
  "My baby isn't eating well":
    "That's one of the most stressful things to watch. Can you tell me a bit more — is this about refusing breast or bottle, or about solids? How old is your baby? Feeding issues look really different at 6 weeks vs 6 months. In the meantime: wet diapers are the best indicator that enough is getting in. If you're seeing fewer than 6 wet diapers a day, call your pediatrician today.",
  "I think I might have postpartum depression":
    "I'm really glad you said that out loud — that takes courage. What you're feeling is real, it's common (1 in 5 mothers), and it's treatable. PPD doesn't mean you're a bad mother. It means your brain chemistry shifted after birth and needs support. The Edinburgh check-in in Mama's Health can give you a starting score to share with your provider. Would you like to take it now? And if you ever feel like harming yourself, please text or call 988 — they're available 24/7.",
  "What vitamins should I be taking?":
    "Great question — and the answer depends on where you are in your journey. If you're pregnant: iron (27mg), folate (600mcg, ideally as methylfolate), Vitamin D (1000–2000 IU), and DHA omega-3. If you're postpartum and breastfeeding: keep everything up, bump calories by ~300, add a good prenatal or postnatal multi. The Vitamins tab has specific brands with Amazon links if you want to compare options. What stage are you in?",
  "I have a bad headache that won't go away":
    "A persistent headache after delivery — especially if it's severe, or comes with vision changes, swelling, or upper abdominal pain — is something I take seriously. Those can be signs of postpartum preeclampsia, which can develop up to 6 weeks after birth. If any of those symptoms are present alongside your headache, please contact your provider or go to the ER today. If it's more of a tension headache, check your water intake and sleep first. How long has it been going on?",
};

export default function FloraAdvisor() {
  const { mama, baby, currentDay, floraMessages } = useAppState();
  const dispatch = useAppDispatch();
  const [input, setInput]       = useState("");
  const [streaming, setStreaming]= useState(false);
  const [streamText, setStreamText]= useState("");
  const [isDemo, setIsDemo]     = useState(!AnthropicClient);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [floraMessages, streamText]);

  const lastMood   = mama.moodLog.at(-1);
  const latestBP   = mama.bpLog.at(-1);
  const avgSleep   = mama.sleepLog.length
    ? (mama.sleepLog.slice(-7).reduce((s,l)=>s+l.hours,0)/Math.min(mama.sleepLog.length,7)).toFixed(1)
    : null;
  const babyAge    = baby.birthDay > 0 ? Math.max(0, currentDay - baby.birthDay) : 0;
  const doneCount  = baby.milestones.length;

  const SYSTEM_PROMPT = `You are Flora, a maternal health companion built into the Bloom app. You support mothers through pregnancy and the first two years of their baby's life. You are warm, direct, and clinically informed — not clinical in tone. You speak like a trusted friend who happens to know a lot about maternal health.

Context about this mother:
- Name: ${mama.name || "Mama"}
- Day ${currentDay} of 1,000 (${STAGE_LABEL(currentDay)})
- Weeks pregnant: ${mama.weeksPregnant || 0} (0 = postpartum)
- Recent mood: ${lastMood ? `${lastMood.score}/5` : "not logged"}
- Latest BP: ${latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : "not logged"}
- Average sleep: ${avgSleep ? `${avgSleep}h` : "not logged"}
- Baby name: ${baby.name}
- Baby age: ${babyAge} days old
- Milestones completed: ${doneCount}

Rules:
- Never diagnose. Triage toward care: "This is worth mentioning to your provider."
- For BP ≥ 140/90 or preeclampsia signs (headache + swelling + vision changes): "Please contact your provider or go to the ER today."
- For any suicidal ideation: immediately provide 988 and affirm help is available.
- Keep responses under 150 words unless asked for detail.
- Always end with one gentle question or next step.
- Reference specific data you can see — don't give generic advice.`;

  const sendMessage = async (text) => {
    if (!text.trim() || streaming) return;
    const userMsg = { id: Date.now(), role: "user", text, timestamp: new Date().toISOString() };
    dispatch({ type: "ADD_FLORA_MESSAGE", message: userMsg, unread: false });
    setInput("");
    setStreaming(true);
    setStreamText("");

    if (!AnthropicClient) {
      // Demo mode — static response
      const response = STATIC_RESPONSES[text] ||
        `I hear you, ${mama.name || "Mama"}. That's worth paying attention to. Can you tell me a bit more about what's going on?`;
      let i = 0;
      const interval = setInterval(() => {
        setStreamText(response.slice(0, i));
        i += 4;
        if (i > response.length) {
          clearInterval(interval);
          setStreamText("");
          setStreaming(false);
          dispatch({ type: "ADD_FLORA_MESSAGE", message: { id: Date.now()+1, role: "flora", text: response, timestamp: new Date().toISOString() } });
        }
      }, 18);
      return;
    }

    try {
      const history = [...floraMessages, userMsg]
        .filter(m => m.role === "user" || m.role === "flora")
        .map(m => ({ role: m.role === "flora" ? "assistant" : "user", content: m.text }));

      const stream = AnthropicClient.messages.stream({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: history,
      });

      let full = "";
      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta?.text) {
          full += chunk.delta.text;
          setStreamText(full);
        }
      }
      setStreamText("");
      setStreaming(false);
      dispatch({ type: "ADD_FLORA_MESSAGE", message: { id: Date.now()+1, role: "flora", text: full, timestamp: new Date().toISOString() } });
    } catch (err) {
      console.error(err);
      setStreaming(false);
      setStreamText("");
    }
  };

  const allMessages = streaming && streamText
    ? [...floraMessages, { id: "streaming", role: "flora", text: streamText, streaming: true }]
    : floraMessages;

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)]">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              Flora 🌿
            </h2>
            <p className="text-xs text-gray-400">Your health companion</p>
          </div>
          {isDemo && (
            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              Demo mode
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {allMessages.length === 0 && (
          <div className="text-center pt-8">
            <div className="text-4xl mb-3">🌿</div>
            <p className="text-sm text-gray-500 font-medium">Hi {mama.name || "there"}!</p>
            <p className="text-xs text-gray-400 mt-1">I'm watching your garden. What's on your mind?</p>
          </div>
        )}
        {allMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-[#7F77DD] text-white rounded-br-sm"
                : "bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-sm"
            }`}>
              {msg.text}
              {msg.streaming && <span className="inline-block w-1.5 h-4 bg-[#7F77DD] rounded-sm ml-1 animate-pulse align-middle"/>}
            </div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      {/* Quick replies */}
      {!streaming && floraMessages.length === 0 && (
        <div className="px-4 pb-2 overflow-x-auto">
          <div className="flex gap-2 pb-1" style={{scrollbarWidth:"none"}}>
            {QUICK_REPLIES.map((q) => (
              <button key={q} onClick={() => sendMessage(q)}
                className="flex-shrink-0 text-xs bg-[#EEEDFE] text-[#534AB7] px-3 py-2 rounded-xl border border-[#C5C2F5] hover:bg-[#DCD9FC] transition-colors">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-white">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="Ask Flora anything…"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7F77DD]"
            disabled={streaming}
          />
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || streaming}
            className="bg-[#7F77DD] text-white rounded-xl px-4 disabled:opacity-40 transition-opacity">
            {streaming
              ? <span className="flex gap-1 items-center"><span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"/><span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay:"0.15s"}}/><span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay:"0.3s"}}/></span>
              : <Send size={16}/>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
