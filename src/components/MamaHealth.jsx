import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Heart, Moon, Activity, Thermometer, ClipboardList } from "lucide-react";
import { useAppState, useAppDispatch } from "../hooks/useAppState";
import PregnancyProfile from "./PregnancyProfile";

const MOODS = [
  {score:1,emoji:"😔",label:"Struggling"},
  {score:2,emoji:"😟",label:"Low"},
  {score:3,emoji:"😐",label:"Okay"},
  {score:4,emoji:"🙂",label:"Good"},
  {score:5,emoji:"😊",label:"Great"},
];

const PREGNANCY_SYMPTOMS = [
  {label:"Nausea",           emoji:"🤢"},
  {label:"Swelling",         emoji:"🦵"},
  {label:"Headache",         emoji:"🤕"},
  {label:"Back pain",        emoji:"😓"},
  {label:"Heartburn",        emoji:"🔥"},
  {label:"Fatigue",          emoji:"😴"},
  {label:"Shortness of breath", emoji:"💨"},
  {label:"Reduced fetal movement", emoji:"⚠️", urgent: true},
];

const POSTPARTUM_SYMPTOMS = [
  {label:"Heavy lochia",     emoji:"⚠️", urgent: true},
  {label:"Perineal pain",    emoji:"😣"},
  {label:"Breast pain",      emoji:"💙"},
  {label:"Night sweats",     emoji:"💧"},
  {label:"Hair loss",        emoji:"🌿"},
  {label:"Mood swings",      emoji:"🎢"},
  {label:"Anxiety",          emoji:"😰"},
];

const EPDS_QUESTIONS = [
  {text:"I have been able to laugh and see the funny side of things",options:["As much as I always could","Not quite so much now","Definitely not so much now","Not at all"],scores:[0,1,2,3]},
  {text:"I have looked forward with enjoyment to things",options:["As much as I ever did","Rather less than I used to","Definitely less than I used to","Hardly at all"],scores:[0,1,2,3]},
  {text:"I have blamed myself unnecessarily when things went wrong",options:["Yes, most of the time","Yes, some of the time","Not very often","No, never"],scores:[3,2,1,0]},
  {text:"I have been anxious or worried for no good reason",options:["No, not at all","Hardly ever","Yes, sometimes","Yes, very often"],scores:[0,1,2,3]},
  {text:"I have felt scared or panicky for no very good reason",options:["Yes, quite a lot","Yes, sometimes","No, not much","No, not at all"],scores:[3,2,1,0]},
  {text:"Things have been getting on top of me",options:["Yes, most of the time I haven't been able to cope","Yes, sometimes I haven't been coping as well as usual","No, most of the time I have coped quite well","No, I have been coping as well as ever"],scores:[3,2,1,0]},
  {text:"I have been so unhappy that I have had difficulty sleeping",options:["Yes, most of the time","Yes, sometimes","Not very often","No, not at all"],scores:[3,2,1,0]},
  {text:"I have felt sad or miserable",options:["Yes, most of the time","Yes, quite often","Not very often","No, not at all"],scores:[3,2,1,0]},
  {text:"I have been so unhappy that I have been crying",options:["Yes, most of the time","Yes, quite often","Only occasionally","No, never"],scores:[3,2,1,0]},
  {text:"The thought of harming myself has occurred to me",options:["Yes, quite often","Sometimes","Hardly ever","Never"],scores:[3,2,1,0]},
];

// Section wrapper for consistent card style
function Section({ icon: Icon, title, subtitle, color = "#1D9E75", bg = "white", children }) {
  return (
    <div className={`rounded-2xl shadow-sm border border-gray-100 p-5 mb-4`} style={{background: bg}}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{background: color + "20"}}>
          <Icon size={16} style={{color}}/>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          {subtitle && <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function MamaHealth() {
  const { mama, baby, currentDay } = useAppState();
  const dispatch = useAppDispatch();

  const [bpSys, setBpSys]             = useState("");
  const [bpDia, setBpDia]             = useState("");
  const [sleep, setSleep]             = useState(7);
  const [showEpds, setShowEpds]       = useState(false);
  const [epdsStep, setEpdsStep]       = useState(0);
  const [epdsAnswers, setEpdsAnswers] = useState([]);
  const [epdsResult, setEpdsResult]   = useState(null);
  const [selected, setSelected]       = useState(null);
  const [loggedSymptoms, setLoggedSymptoms] = useState([]);

  const isPostBirth = currentDay >= baby.birthDay;
  const todayMood   = mama.moodLog.find((l) => l.day === currentDay);
  const latestBP    = mama.bpLog.at(-1);
  const bpHigh      = latestBP && (latestBP.systolic >= 140 || latestBP.diastolic >= 90);
  const bpBorder    = latestBP && !bpHigh && (latestBP.systolic >= 120 || latestBP.diastolic >= 80);

  const recentSleep = mama.sleepLog.slice(-7);
  const avgSleep    = recentSleep.length
    ? (recentSleep.reduce((s,l)=>s+l.hours,0)/recentSleep.length).toFixed(1) : null;
  const lowSleepDays = recentSleep.filter((l)=>l.hours<7).length;

  // Watch mood for 3-day low → Flora check-in
  useEffect(() => {
    const recent = mama.moodLog.slice(-3);
    if (recent.length === 3 && recent.every((l) => l.score <= 2)) {
      dispatch({
        type: "ADD_FLORA_MESSAGE",
        message: {
          id: Date.now(), role: "flora",
          text: `I noticed your mood has been low for three days in a row, ${mama.name || "Mama"}. That's something I want to check in on. How are you really doing right now? You don't have to be okay.`,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }, [mama.moodLog.length]);

  const moodData = Array.from({length:7},(_,i)=>{
    const day = currentDay - 6 + i;
    const log = mama.moodLog.find((l)=>l.day===day);
    return {day:`D${day}`,score:log?.score??null};
  });

  const logBP = () => {
    if (!bpSys || !bpDia) return;
    const s = parseInt(bpSys), d = parseInt(bpDia);
    dispatch({type:"LOG_BP",systolic:s,diastolic:d});
    if (s>=140||d>=90) {
      dispatch({type:"ADD_FLORA_MESSAGE",message:{id:Date.now(),role:"flora",
        text:"I saw your BP reading — that's high. Please contact your provider today. This is important and worth mentioning to your midwife or OB.",
        timestamp:new Date().toISOString()}});
    }
    setBpSys(""); setBpDia("");
  };

  const toggleSymptom = (symptom, urgent) => {
    setLoggedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s)=>s!==symptom) : [...prev, symptom]
    );
    dispatch({type:"LOG_SYMPTOM",symptom,severity:1});
    if (symptom === "Reduced fetal movement") {
      dispatch({type:"ADD_FLORA_MESSAGE",message:{id:Date.now(),role:"flora",
        text:"⚠️ Reduced fetal movement needs attention right away. Please contact your provider or go to Labor & Delivery now. Do not wait.",
        timestamp:new Date().toISOString()}});
    }
    if (symptom === "Heavy lochia") {
      dispatch({type:"ADD_FLORA_MESSAGE",message:{id:Date.now(),role:"flora",
        text:"Heavy lochia — more than a pad per hour — is a medical concern. Please contact your provider or go to the ER today.",
        timestamp:new Date().toISOString()}});
    }
  };

  const handleEpdsNext = () => {
    if (selected === null) return;
    const ans = [...epdsAnswers, selected];
    setSelected(null);
    if (epdsStep < EPDS_QUESTIONS.length - 1) {
      setEpdsAnswers(ans); setEpdsStep(epdsStep+1);
    } else {
      const score = ans.reduce((s,v)=>s+v,0);
      setEpdsResult(score);
      dispatch({type:"SAVE_EPDS",score});
      if (score>=13) {
        dispatch({type:"ADD_FLORA_MESSAGE",message:{id:Date.now(),role:"flora",
          text:`Your Edinburgh score today was ${score}/30. That suggests you may be struggling. This is common and treatable — please tell your midwife or provider. If you ever feel like harming yourself, call or text 988 right now. You matter.`,
          timestamp:new Date().toISOString()}});
      }
    }
  };

  const resetEpds = () => {setShowEpds(false);setEpdsStep(0);setEpdsAnswers([]);setEpdsResult(null);setSelected(null);};

  const symptoms = isPostBirth ? POSTPARTUM_SYMPTOMS : PREGNANCY_SYMPTOMS;

  // Wellness summary
  const hasData   = todayMood || latestBP || avgSleep;
  const wellScore = [
    todayMood && todayMood.score >= 3,
    latestBP  && !bpHigh && !bpBorder,
    avgSleep  && parseFloat(avgSleep) >= 6,
  ].filter(Boolean).length;

  return (
    <div className="p-5">

      {/* Profile setup (if not done) */}
      {!mama.heightCm && <PregnancyProfile/>}

      {/* Header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-800">
          {mama.name ? `${mama.name}'s Health` : "Your Health"}
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {isPostBirth ? "Postpartum wellness" : "Pregnancy wellness"} · Day {currentDay}
        </p>
      </div>

      {/* Wellness summary card */}
      {hasData && (
        <div className="bg-gradient-to-br from-[#E1F5EE] to-[#EEEDFE] border border-gray-100 rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Today's wellness</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {wellScore === 3 ? "You're doing great 🌟" : wellScore === 2 ? "Most things look good 🌿" : "Let's keep an eye on a few things 💜"}
              </p>
            </div>
            <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center">
              <span className="text-xl font-bold text-[#1D9E75]">{wellScore}/3</span>
            </div>
          </div>
          <div className="flex gap-3 mt-3">
            {[
              {label:"Mood",  ok: todayMood && todayMood.score >= 3, val: todayMood ? ["😔","😟","😐","🙂","😊"][todayMood.score-1] : "—"},
              {label:"BP",    ok: latestBP && !bpHigh && !bpBorder,  val: latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : "—"},
              {label:"Sleep", ok: avgSleep && parseFloat(avgSleep) >= 6, val: avgSleep ? `${avgSleep}h` : "—"},
            ].map(({label,ok,val}) => (
              <div key={label} className="flex-1 bg-white rounded-xl p-2 text-center">
                <p className="text-sm font-bold" style={{color: val === "—" ? "#9CA3AF" : ok ? "#1D9E75" : "#F59E0B"}}>{val}</p>
                <p className="text-[9px] text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. How are you feeling? */}
      <Section icon={Heart} title="How are you feeling today?" subtitle="Tap to log your mood" color="#7F77DD">
        <div className="flex justify-around mb-4">
          {MOODS.map((m)=>(
            <button key={m.score} onClick={()=>dispatch({type:"LOG_MOOD",score:m.score})}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${todayMood?.score===m.score?"bg-[#EEEDFE] scale-110 shadow-sm":""}`}>
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[10px] text-gray-400">{m.label}</span>
            </button>
          ))}
        </div>
        {moodData.some((d) => d.score) && (
          <ResponsiveContainer width="100%" height={55}>
            <LineChart data={moodData}>
              <XAxis dataKey="day" tick={{fontSize:9,fill:"#D1D5DB"}} axisLine={false} tickLine={false}/>
              <YAxis domain={[1,5]} hide/>
              <Tooltip formatter={(v)=>[`${v}/5`,"Mood"]} contentStyle={{borderRadius:10,fontSize:11}}/>
              <Line type="monotone" dataKey="score" stroke="#7F77DD" strokeWidth={2}
                dot={{r:3,fill:"#7F77DD"}} connectNulls/>
            </LineChart>
          </ResponsiveContainer>
        )}
      </Section>

      {/* 2. Sleep */}
      <Section icon={Moon} title="Sleep last night" subtitle="Slide to log — your rest matters" color="#534AB7">
        {lowSleepDays >= 3 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 text-xs text-amber-800">
            Low sleep for {lowSleepDays} days in a row is worth watching. Flora has been notified. 💜
          </div>
        )}
        <div className="flex items-center gap-3 mb-4">
          <input type="range" min="0" max="12" step="0.5" value={sleep}
            onChange={(e)=>setSleep(parseFloat(e.target.value))} className="flex-1 accent-[#534AB7]"/>
          <span className="text-2xl font-bold text-[#534AB7] w-14 text-right">{sleep}h</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            {avgSleep && <p className="text-xs text-gray-500">7-day average: <span className="font-semibold">{avgSleep}h</span></p>}
            <p className="text-[10px] text-gray-400 mt-0.5">Most adults need 7–9h. With a newborn, every hour counts.</p>
          </div>
          <button onClick={()=>dispatch({type:"LOG_SLEEP",hours:sleep})}
            className="bg-[#534AB7] text-white px-5 py-2.5 rounded-xl text-sm font-medium">
            Log
          </button>
        </div>
      </Section>

      {/* 3. Blood Pressure */}
      <Section
        icon={Activity}
        title="Blood Pressure"
        subtitle={latestBP ? `Last reading: ${latestBP.systolic}/${latestBP.diastolic} mmHg` : "Log a new reading below"}
        color={bpHigh ? "#EF4444" : bpBorder ? "#F59E0B" : "#1D9E75"}
        bg={bpHigh ? "#FEF2F2" : bpBorder ? "#FFFBEB" : "white"}>
        {latestBP && (
          <div className={`text-3xl font-bold mb-3 ${bpHigh?"text-red-600":bpBorder?"text-amber-600":"text-[#1D9E75]"}`}>
            {latestBP.systolic}/{latestBP.diastolic}
            <span className="text-sm font-normal text-gray-400 ml-2">mmHg</span>
          </div>
        )}
        {bpHigh && (
          <div className="bg-red-100 border border-red-200 rounded-xl p-3 mb-3 text-sm text-red-800">
            ⚠️ This is in the high range (≥140/90). Please contact your provider today — don't wait.
          </div>
        )}
        {bpBorder && (
          <div className="bg-amber-100 border border-amber-200 rounded-xl p-3 mb-3 text-xs text-amber-800">
            This reading (≥120/80) is borderline. Keep logging and mention it at your next appointment.
          </div>
        )}
        {!bpHigh && !bpBorder && latestBP && (
          <div className="bg-[#E1F5EE] rounded-xl p-3 mb-3 text-xs text-[#0F6E56]">
            Looking good! Normal range is &lt;120/80. Log consistently for the best picture.
          </div>
        )}
        <div className="flex gap-2">
          <input type="number" placeholder="Systolic (top)" value={bpSys} onChange={(e)=>setBpSys(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#7F77DD]"/>
          <input type="number" placeholder="Diastolic (bottom)" value={bpDia} onChange={(e)=>setBpDia(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#7F77DD]"/>
          <button onClick={logBP} className="bg-[#1D9E75] text-white px-4 rounded-xl text-sm font-medium">Log</button>
        </div>
        <p className="text-[9px] text-gray-400 mt-2">Tip: sit quietly for 5 minutes before measuring for the most accurate reading.</p>
      </Section>

      {/* 4. Symptoms */}
      <Section
        icon={Thermometer}
        title={isPostBirth ? "Postpartum symptoms" : "Pregnancy symptoms"}
        subtitle="Tap anything you're experiencing today"
        color="#F59E0B">
        <div className="flex flex-wrap gap-2">
          {symptoms.map((s)=>(
            <button key={s.label} onClick={()=>toggleSymptom(s.label, s.urgent)}
              className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-full border font-medium transition-all ${
                loggedSymptoms.includes(s.label)
                  ? s.urgent
                    ? "bg-red-100 border-red-400 text-red-800"
                    : "bg-[#EEEDFE] border-[#7F77DD] text-[#534AB7]"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
              }`}>
              <span>{s.emoji}</span>{s.label}
            </button>
          ))}
        </div>
        {loggedSymptoms.some((s) => ["Reduced fetal movement","Heavy lochia"].includes(s)) && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800">
            ⚠️ Flora has been alerted about your urgent symptom. Please contact your provider or go to the ER now.
          </div>
        )}
      </Section>

      {/* 5. Mental health check-in */}
      <Section
        icon={ClipboardList}
        title="Mental health check-in"
        subtitle="Edinburgh Postnatal Depression Scale · 3 minutes"
        color="#534AB7"
        bg="#FAFAFE">
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          The Edinburgh scale is a trusted, clinically-validated tool used by healthcare providers worldwide. It helps spot signs of anxiety and depression early, so you can get support sooner. There are no wrong answers — just honest ones.
        </p>
        {mama.epdsResults.length > 0 && (
          <div className="bg-white border border-[#C5C2F5] rounded-xl p-3 mb-3">
            <p className="text-xs text-[#534AB7] font-semibold">
              Last check-in: {mama.epdsResults.at(-1).score}/30
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {new Date(mama.epdsResults.at(-1).date).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              {mama.epdsResults.at(-1).score < 10 ? "Score looks healthy — keep checking in." : "Score suggests some difficulty. Talk to your provider about what you're experiencing."}
            </p>
          </div>
        )}
        <button onClick={()=>setShowEpds(true)}
          className="w-full bg-[#534AB7] text-white py-3 rounded-xl text-sm font-semibold">
          {mama.epdsResults.length > 0 ? "Take it again" : "Start check-in"}
        </button>
        <p className="text-[9px] text-center text-gray-400 mt-2">
          If you're in crisis right now, call or text <strong>988</strong> — available 24/7.
        </p>
      </Section>

      {/* EPDS modal */}
      {showEpds && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
            {epdsResult===null ? (
              <>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-gray-700">Question {epdsStep+1} of {EPDS_QUESTIONS.length}</span>
                  <button onClick={resetEpds} className="text-gray-300 text-xl hover:text-gray-500">✕</button>
                </div>
                <p className="text-[10px] text-gray-400 mb-3">Think about how you've felt in the last 7 days.</p>
                <div className="h-1.5 bg-gray-100 rounded-full mb-5">
                  <div className="h-1.5 bg-[#7F77DD] rounded-full transition-all duration-300"
                    style={{width:`${((epdsStep+1)/EPDS_QUESTIONS.length)*100}%`}}/>
                </div>
                <p className="text-sm font-medium text-gray-800 mb-4 leading-relaxed">{EPDS_QUESTIONS[epdsStep].text}</p>
                <div className="space-y-2 mb-5">
                  {EPDS_QUESTIONS[epdsStep].options.map((opt,i)=>{
                    const score=EPDS_QUESTIONS[epdsStep].scores[i];
                    return (
                      <button key={i} onClick={()=>setSelected(score)}
                        className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all ${
                          selected===score?"bg-[#EEEDFE] border-[#7F77DD] text-[#3C3489]":"border-gray-200 text-gray-600 hover:border-[#C5C2F5]"
                        }`}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                <button onClick={handleEpdsNext} disabled={selected===null}
                  className="w-full bg-[#7F77DD] text-white py-3 rounded-xl font-semibold disabled:opacity-40">
                  {epdsStep<EPDS_QUESTIONS.length-1?"Next question →":"See my results"}
                </button>
              </>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-gray-500 mb-2">Your result</p>
                <div className="text-6xl font-bold text-[#7F77DD] mb-1">{epdsResult}</div>
                <div className="text-sm text-gray-400 mb-5">out of 30</div>
                <div className={`rounded-2xl p-4 mb-4 text-left ${epdsResult>=13?"bg-amber-50 border border-amber-200":"bg-[#E1F5EE] border border-[#A7DFC9]"}`}>
                  <p className={`text-sm leading-relaxed ${epdsResult>=13?"text-amber-800":"text-[#0F6E56]"}`}>
                    {epdsResult<10
                      ? `A score under 10 suggests you're coping well. Keep checking in — things can shift. Flora is here whenever you need to talk. 💚`
                      : epdsResult<13
                      ? `Your score suggests you may be experiencing some difficulty. That's worth naming. Please bring this up at your next appointment. You don't have to feel this way. 💜`
                      : `Your score suggests you may be struggling. This is common — 1 in 5 mothers experience this — and it is treatable. Please tell your midwife or provider. You deserve support. 💜`
                    }
                  </p>
                </div>
                {epdsResult>=10 && (
                  <div className="text-sm bg-[#EEEDFE] border border-[#C5C2F5] rounded-xl p-3 mb-4 text-left text-[#3C3489]">
                    📞 <strong>988</strong> Suicide & Crisis Lifeline — call or text, 24/7, free
                  </div>
                )}
                <button onClick={resetEpds} className="w-full bg-[#534AB7] text-white py-3 rounded-xl font-semibold">Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
