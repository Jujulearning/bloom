import { useState } from "react";
import { useAppDispatch } from "../hooks/useAppState";

const IOM_GAIN = (bmi) => {
  if (bmi < 18.5) return "28–40 lbs (12.5–18 kg)";
  if (bmi < 25)   return "25–35 lbs (11.5–16 kg)";
  if (bmi < 30)   return "15–25 lbs (7–11.5 kg)";
  return "11–20 lbs (5–9 kg)";
};

export default function PregnancyProfile({ onSave }) {
  const dispatch = useAppDispatch();
  const [name, setName]         = useState("");
  const [weeks, setWeeks]       = useState("");
  const [unit, setUnit]         = useState("imperial");
  const [heightFt, setHtFt]     = useState("");
  const [heightIn, setHtIn]     = useState("");
  const [heightCm, setHtCm]     = useState("");
  const [weightLbs, setWtLbs]   = useState("");
  const [weightKg, setWtKg]     = useState("");
  const [saved, setSaved]       = useState(false);

  const computedHeightCm = unit === "imperial"
    ? (parseInt(heightFt || 0) * 12 + parseInt(heightIn || 0)) * 2.54
    : parseFloat(heightCm || 0);

  const computedWeightKg = unit === "imperial"
    ? parseFloat(weightLbs || 0) * 0.453592
    : parseFloat(weightKg || 0);

  const bmi = computedHeightCm > 0 && computedWeightKg > 0
    ? (computedWeightKg / ((computedHeightCm / 100) ** 2)).toFixed(1)
    : null;

  const save = () => {
    if (!name.trim()) return;
    dispatch({
      type: "SET_MAMA_PROFILE",
      name: name.trim(),
      weeksPregnant: parseInt(weeks) || 0,
      heightCm: computedHeightCm || null,
      weightKg: computedWeightKg || null,
    });
    setSaved(true);
    onSave?.();
  };

  if (saved) {
    return (
      <div className="bg-[#E1F5EE] border border-[#A7DFC9] rounded-2xl p-5 mb-5 text-center">
        <div className="text-3xl mb-2">🌱</div>
        <p className="font-semibold text-[#0F6E56]">Welcome, {name}!</p>
        <p className="text-sm text-[#1D9E75] mt-1">Your garden is ready.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
      <h3 className="font-semibold text-gray-800 mb-1">Let's set up your garden 🌱</h3>
      <p className="text-xs text-gray-400 mb-4">This helps Bloom personalize your experience.</p>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Your name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Maya"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7F77DD]"/>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">How far along are you?</label>
          <div className="flex items-center gap-2">
            <input type="number" min="0" max="42" value={weeks} onChange={(e) => setWeeks(e.target.value)}
              placeholder="Weeks pregnant"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7F77DD]"/>
            <span className="text-xs text-gray-400 flex-shrink-0">wks (0 = postpartum)</span>
          </div>
        </div>

        {/* Unit toggle */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200">
          {["imperial", "metric"].map((u) => (
            <button key={u} onClick={() => setUnit(u)}
              className={`flex-1 py-2 text-xs font-medium transition-colors capitalize ${
                unit === u ? "bg-[#7F77DD] text-white" : "text-gray-500"
              }`}>
              {u === "imperial" ? "ft / lbs" : "cm / kg"}
            </button>
          ))}
        </div>

        {unit === "imperial" ? (
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Height</label>
              <div className="flex gap-1">
                <input type="number" placeholder="ft" value={heightFt} onChange={(e) => setHtFt(e.target.value)}
                  className="w-16 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#7F77DD]"/>
                <input type="number" placeholder="in" value={heightIn} onChange={(e) => setHtIn(e.target.value)}
                  className="w-16 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#7F77DD]"/>
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Weight (lbs)</label>
              <input type="number" placeholder="lbs" value={weightLbs} onChange={(e) => setWtLbs(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#7F77DD]"/>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Height (cm)</label>
              <input type="number" placeholder="cm" value={heightCm} onChange={(e) => setHtCm(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#7F77DD]"/>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Weight (kg)</label>
              <input type="number" placeholder="kg" value={weightKg} onChange={(e) => setWtKg(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#7F77DD]"/>
            </div>
          </div>
        )}

        {/* BMI & weight gain recommendation */}
        {bmi && (
          <div className="bg-[#EEEDFE] border border-[#C5C2F5] rounded-xl p-3">
            <div className="text-xs font-semibold text-[#3C3489] mb-1">Your BMI: {bmi}</div>
            <div className="text-xs text-[#534AB7]">
              Recommended pregnancy weight gain: <strong>{IOM_GAIN(parseFloat(bmi))}</strong>
            </div>
            <div className="text-[10px] text-[#7F77DD] mt-1">Based on IOM guidelines · Talk to your provider for personalized guidance</div>
          </div>
        )}

        <button onClick={save} disabled={!name.trim()}
          className="w-full bg-[#7F77DD] text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-40 transition-opacity">
          Start my garden
        </button>
      </div>
    </div>
  );
}
