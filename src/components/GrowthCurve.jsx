import { useState } from "react";
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAppState, useAppDispatch } from "../hooks/useAppState";
import { whoWeightGirls, whoHeightGirls, whoHeadGirls } from "../data/whoGrowthData";

const METRICS = [
  { key: "weight", label: "Weight", unit: "kg",  whoData: whoWeightGirls, logAction: "LOG_WEIGHT" },
  { key: "height", label: "Height", unit: "cm",  whoData: whoHeightGirls, logAction: "LOG_HEIGHT" },
  { key: "head",   label: "Head",   unit: "cm",  whoData: whoHeadGirls,   logAction: "LOG_HEAD"   },
];

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  const baby = payload.find((p) => p.dataKey === "babyVal");
  if (!baby?.value) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-md text-xs">
      <div className="font-semibold text-gray-700">Week {label}</div>
      <div className="text-[#1D9E75] font-bold mt-0.5">{baby.value} {unit}</div>
    </div>
  );
}

function pctileLabel(val, who) {
  if (!who) return "—";
  if (val >= who.p95) return ">95th";
  if (val >= who.p50) return "50–95th";
  if (val >= who.p5)  return "5–50th";
  return "<5th";
}

export default function GrowthCurve() {
  const { baby } = useAppState();
  const dispatch = useAppDispatch();
  const [activeMetric, setActiveMetric] = useState("weight");
  const [showModal, setShowModal]       = useState(false);
  const [newVal, setNewVal]             = useState("");
  const [newWeek, setNewWeek]           = useState("");

  const metric = METRICS.find((m) => m.key === activeMetric);
  const log    = baby[`${activeMetric === "head" ? "head" : activeMetric}Log`] || [];

  const chartData = metric.whoData.map((pt) => {
    const entry = log.find((w) => w.week === pt.week);
    return { week: pt.week, p5: pt.p5, p50: pt.p50, p95: pt.p95, babyVal: entry?.value ?? null };
  });

  const belowP5 = log.filter((e) => {
    const who = metric.whoData.find((w) => w.week === e.week);
    return who && e.value < who.p5;
  }).length;

  const save = () => {
    if (!newVal || !newWeek) return;
    dispatch({ type: metric.logAction, week: parseInt(newWeek), value: parseFloat(newVal) });
    setNewVal(""); setNewWeek(""); setShowModal(false);
  };

  return (
    <div className="p-5">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Growth Curves</h2>

      {belowP5 >= 2 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 text-sm text-red-800">
          🚨 {baby.name}'s {metric.label.toLowerCase()} needs attention — Flora has been notified.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {METRICS.map((m) => (
          <button key={m.key} onClick={() => setActiveMetric(m.key)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeMetric === m.key ? "bg-[#1D9E75] text-white" : "bg-white border border-gray-100 text-gray-600 shadow-sm"
            }`}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={chartData} margin={{top:5,right:5,bottom:15,left:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6"/>
            <XAxis dataKey="week" tick={{fontSize:10,fill:"#9CA3AF"}}
              label={{value:"Age (weeks)",position:"insideBottom",offset:-8,fontSize:10,fill:"#9CA3AF"}}/>
            <YAxis tick={{fontSize:10,fill:"#9CA3AF"}} axisLine={false} tickLine={false}/>
            <Tooltip content={<CustomTooltip unit={metric.unit}/>}/>
            <Area dataKey="p95" fill="#E1F5EE" stroke="none" isAnimationActive={false}/>
            <Area dataKey="p5"  fill="#F9F8F5" stroke="none" isAnimationActive={false}/>
            <Line dataKey="p50" stroke="#D1D5DB" strokeDasharray="5 3" strokeWidth={1.5} dot={false}/>
            <Line dataKey="babyVal" stroke="#1D9E75" strokeWidth={2.5}
              dot={{r:5,fill:"#1D9E75",strokeWidth:0}}
              activeDot={{r:7,fill:"#1D9E75"}}
              connectNulls={false} name={baby.name}/>
          </ComposedChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-400 text-center mt-1">
          Shaded = WHO 5th–95th percentile · Dashed = 50th
        </p>
      </div>

      <button onClick={() => setShowModal(true)}
        className="w-full bg-[#1D9E75] text-white py-3 rounded-xl font-medium text-sm mb-4">
        + Add measurement
      </button>

      {/* Entry list */}
      {log.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent entries</h3>
          <div className="space-y-2.5">
            {[...log].sort((a,b)=>b.week-a.week).slice(0,6).map((entry,i)=>{
              const who = metric.whoData.find((w) => w.week === entry.week);
              const pct = pctileLabel(entry.value, who);
              const color = who && entry.value < who.p5 ? "text-red-500" : "text-[#1D9E75]";
              return (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Week {entry.week}</span>
                  <span className={`font-semibold ${color}`}>{entry.value} {metric.unit}</span>
                  <span className="text-xs text-gray-400">{pct}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Understanding growth section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Understanding the chart</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-3 rounded-full bg-[#E1F5EE] flex-shrink-0 mt-1"/>
            <div>
              <p className="text-xs font-semibold text-gray-700">Shaded band = WHO 5th–95th percentile</p>
              <p className="text-[10px] text-gray-400 mt-0.5">This is the healthy range for most babies. Being anywhere inside is great. Percentiles describe where your baby falls relative to others — not a grade.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 flex-shrink-0 mt-1 border-t-2 border-dashed border-gray-300"/>
            <div>
              <p className="text-xs font-semibold text-gray-700">Dashed line = 50th percentile</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Exactly half of babies are above this line, half below. Being above or below the 50th is completely normal.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-[#1D9E75] flex-shrink-0 mt-1 ml-3"/>
            <div>
              <p className="text-xs font-semibold text-gray-700">Green dots = {baby.name}'s measurements</p>
              <p className="text-[10px] text-gray-400 mt-0.5">What matters most is that the curve follows a steady, consistent trend — not which percentile they're in.</p>
            </div>
          </div>
        </div>
      </div>

      {/* When to reach out */}
      <div className="bg-[#EEEDFE] border border-[#C5C2F5] rounded-2xl p-4 mb-4">
        <h3 className="text-sm font-semibold text-[#3C3489] mb-2">When to talk to your pediatrician</h3>
        <ul className="space-y-1.5">
          {[
            "Weight below the 5th percentile on two consecutive visits",
            "A sudden drop across two percentile lines (e.g., 75th → 25th)",
            "Head circumference growing very slowly — can be worth checking",
            "Length/height far below weight percentile, or vice versa",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-[#7F77DD] text-xs mt-0.5">•</span>
              <p className="text-[10px] text-[#534AB7] leading-relaxed">{item}</p>
            </li>
          ))}
        </ul>
        <p className="text-[10px] text-[#7F77DD] mt-2">A single low reading is rarely concerning — it's the trend over time that matters most.</p>
      </div>

      {/* Growth tips by stage */}
      <div className="bg-[#E1F5EE] border border-[#A7DFC9] rounded-2xl p-4 mb-4">
        <h3 className="text-sm font-semibold text-[#0F6E56] mb-2">Supporting healthy growth</h3>
        <ul className="space-y-1.5">
          {[
            "Breast milk or formula provides everything needed for the first 6 months",
            "Responsive feeding (on demand) supports both weight and development",
            "Iron-rich foods matter when starting solids around 6 months",
            "Tummy time builds neck and shoulder strength that supports motor milestones",
            "Talk, sing, and read — language exposure directly supports brain growth",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-[#1D9E75] text-xs mt-0.5">🌿</span>
              <p className="text-[10px] text-[#0F6E56] leading-relaxed">{item}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-t-2xl w-full max-w-[430px] mx-auto p-5"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-800 mb-4">Add {metric.label} ({metric.unit})</h3>
            <div className="flex gap-3 mb-4">
              <input type="number" placeholder="Age (weeks)" value={newWeek}
                onChange={(e) => setNewWeek(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1D9E75]"/>
              <input type="number" step="0.1" placeholder={`Value (${metric.unit})`} value={newVal}
                onChange={(e) => setNewVal(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1D9E75]"/>
            </div>
            <button onClick={save} className="w-full bg-[#1D9E75] text-white py-3 rounded-xl font-medium">
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
