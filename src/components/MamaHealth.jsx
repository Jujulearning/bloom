import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAppState, useAppDispatch } from "../hooks/useAppState";
import PregnancyProfile from "./PregnancyProfile";

const MOODS = [
  {score:1,emoji:"😔",label:"Struggling"},
  {score:2,emoji:"😟",label:"Low"},
  {score:3,emoji:"😐",label:"Okay"},
  {score:4,emoji:"🙂",label:"Good"},
  {score:5,emoji:"😊",label:"Great"},
];

const PREGNANCY_SYMPTOMS = ["Nausea","Swelling","Headache","Back pain","Heartburn","Fatigue","Shortness of breath","Reduced fetal movement"];
const POSTPARTUM_SYMPTOMS = ["Heavy lochia","Perineal pain","Breast pain","Night sweats","Hair loss","Mood swings","Anxiety"];

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

export default function MamaHealth() {
  const { mama, baby, currentDay } = useAppState();
  const dispatch = useAppDispatch();

  const [bpSys, setBpSys]       = useState("");
  const [bpDia, setBpDia]       = useState("");
  const [sleep, setSleep]       = useState(7);
  const [showEpds, setShowEpds] = useState(false);
  const [epdsStep, setEpdsStep] = useState(0);
  const [epdsAnswers, setEpdsAnswers] = useState([]);
  const [epdsResult, setEpdsResult]  = useState(null);
  const [selected, setSelected] = useState(null);
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

  // Check for 3-day low mood → Flora alert
  useEffect(() => {
    const recent = mama.moodLog.slice(-3);
    if (recent.length === 3 && recent.every((l) => l.score <= 2)) {
      dispatch({
        type: "ADD_FLORA_MESSAGE",
        message: {
          id: Date.now(),
          role: "flora",
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

  const toggleSymptom = (symptom) => {
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

  return (
    <div className="p-5">
      {/* Profile onboarding */}
      {!mama.heightCm && <PregnancyProfile/>}

      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {mama.name ? `${mama.name}'s Health` : "Mama's Health"}
      </h2>

      {/* Mood */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
        <h3 className="font-semibold text-gray-700 mb-3">How are you feeling today?</h3>
        <div className="flex justify-around mb-3">
          {MOODS.map((m)=>(
            <button key={m.score} onClick={()=>dispatch({type:"LOG_MOOD",score:m.score})}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${todayMood?.score===m.score?"bg-[#EEEDFE] scale-110":""}`}>
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[10px] text-gray-400">{m.label}</span>
            </button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={55}>
          <LineChart data={moodData}>
            <XAxis dataKey="day" tick={{fontSize:9,fill:"#D1D5DB"}} axisLine={false} tickLine={false}/>
            <YAxis domain={[1,5]} hide/>
            <Tooltip formatter={(v)=>[`${v}/5`,"Mood"]} contentStyle={{borderRadius:10,fontSize:11}}/>
            <Line type="monotone" dataKey="score" stroke="#7F77DD" strokeWidth={2}
              dot={{r:3,fill:"#7F77DD"}} connectNulls/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Blood pressure */}
      <div className={`rounded-2xl shadow-sm border p-5 mb-4 ${
        bpHigh?"bg-red-50 border-red-200":bpBorder?"bg-amber-50 border-amber-200":"bg-white border-gray-100"
      }`}>
        <h3 className="font-semibold text-gray-700 mb-3">Blood Pressure</h3>
        {latestBP && (
          <div className={`text-3xl font-bold mb-2 ${bpHigh?"text-red-600":bpBorder?"text-amber-600":"text-[#1D9E75]"}`}>
            {latestBP.systolic}/{latestBP.diastolic}
            <span className="text-sm font-normal text-gray-400 ml-2">mmHg</span>
          </div>
        )}
        {bpHigh && <div className="bg-red-100 border border-red-200 rounded-xl p-3 mb-3 text-sm text-red-800">⚠️ This reading is high. Please contact your provider today.</div>}
        {bpBorder && <div className="bg-amber-100 border border-amber-200 rounded-xl p-3 mb-3 text-sm text-amber-800">Worth watching. Flora has noted this.</div>}
        <div className="flex gap-2">
          <input type="number" placeholder="Systolic" value={bpSys} onChange={(e)=>setBpSys(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#7F77DD]"/>
          <input type="number" placeholder="Diastolic" value={bpDia} onChange={(e)=>setBpDia(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#7F77DD]"/>
          <button onClick={logBP} className="bg-[#7F77DD] text-white px-4 rounded-xl text-sm font-medium">Log</button>
        </div>
      </div>

      {/* Sleep */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-700">Sleep</h3>
          {avgSleep && <span className="text-xs text-gray-400">7-day avg: {avgSleep}h</span>}
        </div>
        {lowSleepDays >= 3 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 text-xs text-amber-800">
            Low sleep for {lowSleepDays} days is a PPD risk factor. Flora is watching. 💜
          </div>
        )}
        <div className="flex items-center gap-3 mb-3">
          <input type="range" min="0" max="12" step="0.5" value={sleep}
            onChange={(e)=>setSleep(parseFloat(e.target.value))} className="flex-1 accent-[#7F77DD]"/>
          <span className="text-lg font-bold text-[#7F77DD] w-12 text-right">{sleep}h</span>
        </div>
        <button onClick={()=>dispatch({type:"LOG_SLEEP",hours:sleep})}
          className="w-full bg-[#7F77DD] text-white py-2.5 rounded-xl text-sm font-medium">
          Log sleep
        </button>
      </div>

      {/* Symptoms */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
        <h3 className="font-semibold text-gray-700 mb-3">
          {isPostBirth ? "Postpartum" : "Pregnancy"} symptoms
        </h3>
        <div className="flex flex-wrap gap-2">
          {symptoms.map((s)=>(
            <button key={s} onClick={()=>toggleSymptom(s)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                loggedSymptoms.includes(s)
                  ? (s==="Reduced fetal movement"||s==="Heavy lochia")
                    ? "bg-red-100 border-red-400 text-red-800"
                    : "bg-[#EEEDFE] border-[#7F77DD] text-[#534AB7]"
                  : "bg-gray-50 border-gray-200 text-gray-600"
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Edinburgh PPD */}
      <div className="bg-[#EEEDFE] border border-[#C5C2F5] rounded-2xl p-5">
        <h3 className="font-semibold text-[#3C3489] mb-1">Edinburgh Check-in</h3>
        <p className="text-xs text-[#534AB7] mb-3">10 questions about how you're really doing. Takes 3 minutes.</p>
        {mama.epdsResults.length > 0 && (
          <p className="text-xs text-[#7F77DD] mb-3">
            Last score: {mama.epdsResults.at(-1).score}/30 · {new Date(mama.epdsResults.at(-1).date).toLocaleDateString()}
          </p>
        )}
        <button onClick={()=>setShowEpds(true)}
          className="bg-[#534AB7] text-white px-4 py-2.5 rounded-xl text-sm font-medium">
          Take the 2-week check-in
        </button>
      </div>

      {/* EPDS modal */}
      {showEpds && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
            {epdsResult===null ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-semibold text-gray-700">Question {epdsStep+1} of {EPDS_QUESTIONS.length}</span>
                  <button onClick={resetEpds} className="text-gray-300 text-xl hover:text-gray-500">✕</button>
                </div>
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
                  className="w-full bg-[#7F77DD] text-white py-3 rounded-xl font-medium disabled:opacity-40">
                  {epdsStep<EPDS_QUESTIONS.length-1?"Next":"See results"}
                </button>
              </>
            ) : (
              <div className="text-center py-2">
                <div className="text-6xl font-bold text-[#7F77DD] mb-1">{epdsResult}</div>
                <div className="text-sm text-gray-400 mb-5">out of 30</div>
                <div className={`rounded-2xl p-4 mb-4 text-left ${epdsResult>=13?"bg-amber-50":"bg-[#E1F5EE]"}`}>
                  <p className={`text-sm leading-relaxed italic ${epdsResult>=13?"text-amber-800":"text-[#0F6E56]"}`}>
                    {epdsResult>=13
                      ? '"Your answers suggest you may be struggling. This is common and treatable — please tell your midwife or provider." — Flora'
                      : '"You\'re doing well. We\'re here if anything changes." — Flora'}
                  </p>
                </div>
                {epdsResult>=13 && (
                  <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl p-3 mb-4 text-left">
                    📞 <strong>988</strong> Suicide & Crisis Lifeline — call or text anytime, 24/7
                  </div>
                )}
                <button onClick={resetEpds} className="w-full bg-[#534AB7] text-white py-3 rounded-xl font-medium">Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
