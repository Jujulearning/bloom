import { useState, useRef } from "react";
import { Camera, ChevronDown, ChevronUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip } from "recharts";
import { useAppState, useAppDispatch } from "../hooks/useAppState";
import { CULTURAL_FOODS, NUTRIENT_META, DAILY_TARGETS_PREGNANCY, DAILY_TARGETS_POSTPARTUM } from "../data/nutritionData";
import { useNavigate } from "react-router-dom";

function Ring({ pct, label, unit, value, target, color }) {
  const r = 28, circ = 2 * Math.PI * r;
  const filled = Math.min(pct, 100) / 100 * circ;
  const c = pct >= 80 ? "#1D9E75" : pct >= 50 ? "#F59E0B" : "#EF4444";
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="68" height="68" viewBox="0 0 68 68">
        <circle cx="34" cy="34" r={r} fill="none" stroke="#F3F4F6" strokeWidth="6"/>
        <circle cx="34" cy="34" r={r} fill="none" stroke={c} strokeWidth="6"
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 34 34)" style={{transition:"stroke-dasharray 0.5s"}}/>
        <text x="34" y="31" textAnchor="middle" fontSize="11" fontWeight="700" fill={c} fontFamily="DM Sans, system-ui">
          {Math.round(pct)}%
        </text>
        <text x="34" y="42" textAnchor="middle" fontSize="8.5" fill="#9CA3AF" fontFamily="DM Sans, system-ui">
          {unit}
        </text>
      </svg>
      <span className="text-[10px] text-gray-500 font-medium">{label}</span>
      <span className="text-[9px] text-gray-400">{Math.round(value)}/{target}</span>
    </div>
  );
}

const FEED_TYPES = ["Breast", "Formula", "Solid"];
const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack"];

export default function NutritionTracker() {
  const { mama, baby, currentDay } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [showFoodModal, setShowFoodModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState("West African");
  const [activeMeal, setActiveMeal]         = useState("Breakfast");
  const [showChart, setShowChart]           = useState(false);
  const [photoResult, setPhotoResult]       = useState(null);
  const [photoLoading, setPhotoLoading]     = useState(false);

  const isPostBirth  = currentDay >= baby.birthDay;
  const targets      = isPostBirth ? DAILY_TARGETS_POSTPARTUM : DAILY_TARGETS_PREGNANCY;
  const todayLog     = mama.nutritionLog.find((l) => l.day === currentDay) || {};

  const nutrients = NUTRIENT_META.map((n) => {
    const value = todayLog[n.key] || 0;
    const target = targets[n.key];
    return { ...n, value, target, pct: target ? (value / target) * 100 : 0 };
  });

  const lowNutrients = nutrients.filter((n) => n.pct < 50 && n.key !== "calories");

  const addFood = (food) => {
    dispatch({ type: "LOG_NUTRITION", iron: food.iron, folate: food.folate,
      calcium: food.calcium, vitaminD: food.vitaminD, omega3: food.omega3, calories: food.calories });
  };

  const addPhotoFood = () => {
    if (!photoResult) return;
    dispatch({ type: "LOG_NUTRITION", ...photoResult });
    setPhotoResult(null);
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    setPhotoResult(null);
    try {
      const base64 = await new Promise((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result.split(",")[1]);
        reader.readAsDataURL(file);
      });
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const key = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!key) throw new Error("no key");
      const client = new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true });
      const resp = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: file.type, data: base64 } },
          { type: "text", text: `Identify the food and estimate nutrition for one serving. Return ONLY valid JSON: {"name":"Food Name","serving":"1 cup","iron":3,"folate":40,"calcium":80,"vitaminD":0,"omega3":0,"calories":220}` },
        ]}],
      });
      const json = JSON.parse(resp.content[0].text.match(/\{[\s\S]*\}/)[0]);
      setPhotoResult(json);
    } catch {
      setShowFoodModal(true);
    } finally {
      setPhotoLoading(false);
      e.target.value = "";
    }
  };

  // Weekly chart data
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const day  = currentDay - 6 + i;
    const log  = mama.nutritionLog.find((l) => l.day === day);
    return { label: `D${day}`, calories: log?.calories || 0 };
  });

  // Last feed
  const todayFeeds = baby.feedLog.filter((f) => {
    const d = new Date(f.timestamp);
    return d.toDateString() === new Date().toDateString();
  });
  const lastFeed = baby.feedLog.at(-1);

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Nutrition</h2>
        <div className="flex gap-2">
          <button onClick={() => fileRef.current?.click()}
            disabled={photoLoading}
            className="flex items-center gap-1.5 bg-[#E1F5EE] text-[#0F6E56] text-xs px-3 py-1.5 rounded-xl font-medium">
            <Camera size={14}/> {photoLoading ? "Scanning…" : "Photo"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment"
            className="hidden" onChange={handlePhoto}/>
        </div>
      </div>

      {/* Photo result card */}
      {photoResult && (
        <div className="bg-[#E1F5EE] border border-[#A7DFC9] rounded-2xl p-4 mb-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-semibold text-gray-800 text-sm">{photoResult.name}</div>
              <div className="text-xs text-gray-500">{photoResult.serving}</div>
            </div>
            <button onClick={() => setPhotoResult(null)} className="text-gray-400 text-lg leading-none">✕</button>
          </div>
          <div className="flex gap-3 text-xs text-gray-600 mb-3 flex-wrap">
            <span>🩸 {photoResult.iron}mg iron</span>
            <span>🌿 {photoResult.folate}mcg folate</span>
            <span>🦴 {photoResult.calcium}mg calcium</span>
            <span>⚡ {photoResult.calories} cal</span>
          </div>
          <button onClick={addPhotoFood}
            className="w-full bg-[#1D9E75] text-white py-2 rounded-xl text-sm font-medium">
            Add to today's log
          </button>
        </div>
      )}

      {/* Low nutrient banners */}
      {lowNutrients.length > 0 && (
        <div className="space-y-1.5 mb-4">
          {lowNutrients.map((n) => (
            <button key={n.key} onClick={() => navigate(`/vitamins/${n.key}`)}
              className="w-full text-left bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 flex items-center justify-between">
              <span className="text-xs text-red-700 font-medium">{n.label} looks low — see recommendations</span>
              <span className="text-xs text-red-400">→</span>
            </button>
          ))}
        </div>
      )}

      {/* Nutrient rings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700">Today's nutrients</span>
          <span className="text-xs text-gray-400">{activeMeal}</span>
        </div>
        {/* Meal selector */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto" style={{scrollbarWidth:"none"}}>
          {MEALS.map((m) => (
            <button key={m} onClick={() => setActiveMeal(m)}
              className={`flex-shrink-0 text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                activeMeal === m ? "bg-[#1D9E75] text-white" : "bg-gray-100 text-gray-500"
              }`}>
              {m}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 justify-items-center">
          {nutrients.map((n) => <Ring key={n.key} {...n}/>)}
        </div>
      </div>

      {/* Add food button */}
      <button onClick={() => setShowFoodModal(true)}
        className="w-full bg-[#1D9E75] text-white py-3 rounded-xl font-medium text-sm mb-4">
        + Add food from cultural library
      </button>

      {/* Weekly chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4">
        <button onClick={() => setShowChart(!showChart)}
          className="w-full flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold text-gray-700">Weekly calories</span>
          {showChart ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
        </button>
        {showChart && (
          <div className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={chartData} margin={{top:5,right:5,bottom:0,left:0}}>
                <XAxis dataKey="label" tick={{fontSize:9,fill:"#9CA3AF"}} axisLine={false} tickLine={false}/>
                <YAxis hide/>
                <Tooltip formatter={(v)=>[`${v} cal`]} contentStyle={{borderRadius:10,fontSize:11}}/>
                <ReferenceLine y={targets.calories} stroke="#1D9E75" strokeDasharray="5 3" strokeOpacity={0.5}/>
                <Bar dataKey="calories" fill="#1D9E75" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Baby feeding (postpartum) */}
      {isPostBirth && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <h3 className="font-semibold text-gray-700 text-sm mb-3">
            {baby.name}'s feeds today · {todayFeeds.length} logged
          </h3>
          {lastFeed && (
            <p className="text-xs text-gray-400 mb-3">
              Last: {lastFeed.type} · {new Date(lastFeed.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
            </p>
          )}
          <div className="flex gap-2">
            {FEED_TYPES.map((t) => (
              <button key={t} onClick={() => dispatch({type:"LOG_FEED",feedType:t})}
                className="flex-1 py-2 rounded-xl text-sm font-medium bg-[#E1F5EE] text-[#0F6E56] hover:bg-[#C6EDD9] transition-colors">
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Food modal */}
      {showFoodModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col" onClick={() => setShowFoodModal(false)}>
          <div className="mt-auto bg-white rounded-t-2xl w-full max-w-[430px] mx-auto max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h3 className="font-semibold text-gray-800">Cultural Foods</h3>
              <button onClick={() => setShowFoodModal(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            {/* Category tabs */}
            <div className="flex gap-2 px-4 pb-2 overflow-x-auto" style={{scrollbarWidth:"none"}}>
              {Object.keys(CULTURAL_FOODS).map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    activeCategory === cat ? "bg-[#1D9E75] text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
            {/* Food grid */}
            <div className="overflow-y-auto px-4 pb-5 flex-1">
              <div className="grid grid-cols-2 gap-2 pt-1">
                {CULTURAL_FOODS[activeCategory].map((food) => (
                  <button key={food.name} onClick={() => { addFood(food); setShowFoodModal(false); }}
                    className="bg-gray-50 border border-gray-100 rounded-2xl p-3 text-left hover:border-[#1D9E75] transition-colors">
                    <div className="text-2xl mb-1">{food.emoji}</div>
                    <div className="text-xs font-semibold text-gray-800 leading-tight mb-1">{food.name}</div>
                    <div className="text-[10px] text-gray-400">{food.serving}</div>
                    <div className="text-[10px] text-[#1D9E75] mt-1">
                      {food.iron > 0 && `🩸${food.iron}mg `}
                      {food.calcium > 80 && `🦴`}
                      {food.calories}cal
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
