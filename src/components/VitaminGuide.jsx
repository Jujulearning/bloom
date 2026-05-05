import { useNavigate, useParams } from "react-router-dom";
import { ExternalLink, MapPin, MessageCircle } from "lucide-react";
import { VITAMINS, STORE_LINKS } from "../data/vitaminData";

const TABS = ["iron", "folate", "calcium", "vitaminD", "omega3", "prenatal"];

export default function VitaminGuide() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = TABS.includes(tab) ? tab : "iron";
  const vit = VITAMINS[activeTab];

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Vitamins & Nutrition</h2>
      </div>

      {/* Tab strip */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1" style={{scrollbarWidth:"none"}}>
        {TABS.map((t) => (
          <button key={t} onClick={() => navigate(`/vitamins/${t}`)}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold transition-colors capitalize ${
              activeTab === t ? "bg-[#1D9E75] text-white" : "bg-white border border-gray-200 text-gray-500"
            }`}>
            {VITAMINS[t].label}
          </button>
        ))}
      </div>

      {/* Why it matters */}
      <div className="bg-[#E1F5EE] border border-[#A7DFC9] rounded-2xl p-4 mb-4">
        <h3 className="font-semibold text-[#0F6E56] mb-1.5">Why {vit.label} matters</h3>
        <p className="text-sm text-[#0F6E56] leading-relaxed">{vit.why}</p>
      </div>

      {/* Food sources */}
      {vit.foods.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">Food sources first</h3>
          <div className="space-y-2.5">
            {vit.foods.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{f.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800">{f.name}</div>
                  <div className="text-xs text-gray-400">{f.amount} · <span className="text-[#1D9E75] font-semibold">{f.nutrient}</span></div>
                </div>
              </div>
            ))}
          </div>
          {vit.tip && (
            <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
              <p className="text-xs text-amber-800">💡 {vit.tip}</p>
            </div>
          )}
        </div>
      )}

      {/* Supplements */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-700 mb-3 text-sm">
          {vit.foods.length > 0 ? "If food isn't enough — supplements" : "Recommended supplements"}
        </h3>
        <div className="space-y-3">
          {vit.supplements.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{s.brand}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.form} · {s.dose}</div>
                  {s.note && <div className="text-xs text-[#1D9E75] mt-0.5 italic">{s.note}</div>}
                </div>
                <span className="text-sm font-bold text-[#1D9E75] flex-shrink-0">{s.price}</span>
              </div>
              <div className="flex gap-2">
                <a href={s.url} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#FF9900] text-white py-2 rounded-xl text-xs font-semibold">
                  <ExternalLink size={12}/> Order on Amazon
                </a>
                <a href="https://www.google.com/maps/search/pharmacy+near+me" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 bg-gray-100 text-gray-700 py-2 px-3 rounded-xl text-xs font-medium">
                  <MapPin size={12}/> Near me
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Find stores near me */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-700 mb-2 text-sm">Find stores near you</h3>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{scrollbarWidth:"none"}}>
          {STORE_LINKS.map((s) => (
            <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
              className="flex-shrink-0 text-xs bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-xl font-medium hover:border-[#1D9E75] transition-colors flex items-center gap-1.5">
              <MapPin size={11} className="text-[#1D9E75]"/>{s.name}
            </a>
          ))}
        </div>
      </div>

      {/* Flora CTA */}
      <button onClick={() => navigate("/flora")}
        className="w-full flex items-center justify-center gap-2 bg-[#EEEDFE] text-[#534AB7] py-3 rounded-xl text-sm font-semibold">
        <MessageCircle size={16}/> Talk to Flora about my nutrition
      </button>
    </div>
  );
}
