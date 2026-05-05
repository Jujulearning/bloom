import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState, useAppDispatch, STAGE_LABEL, mamaStageFor, babyStageFor } from "../hooks/useAppState";
import { getProfile, getCelebrationsShown, markCelebrationShown } from "../lib/profile";
import { getDayOf1000, getGestationalWeeks, getStageLabel } from "../lib/gestationalAge";
import ReminderBanner from "./ReminderBanner";
import MilestoneCelebration from "./MilestoneCelebration";

const GRASS = Array.from({ length: 32 }, (_, i) => ({
  x: i * 11.5 + 4, h: 6 + ((i * 7 + 3) % 9), dark: i % 4 === 0,
}));
const SOIL_PEBBLES = [
  {x:30,y:238},{x:70,y:248},{x:120,y:235},{x:160,y:245},{x:200,y:237},
  {x:240,y:250},{x:285,y:240},{x:330,y:246},{x:50,y:255},{x:185,y:258},{x:310,y:253},
];
const WILDFLOWERS = [
  {x:35,y:213,color:"#F472B6"},{x:130,y:211,color:"#FCD34D"},
  {x:210,y:213,color:"#F472B6"},{x:310,y:211,color:"#FB923C"},{x:175,y:214,color:"#A78BFA"},
];
const STEM_H = [0, 38, 72, 108, 148];

function Leaf({ cx, cy, rx, ry, angle, color, opacity = 0.88 }) {
  return (
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={color} opacity={opacity}
      transform={`rotate(${angle}, ${cx}, ${cy})`} />
  );
}

function Flower({ cx, cy, color, size }) {
  return (
    <g>
      {[0,60,120,180,240,300].map((a) => {
        const r = (a * Math.PI) / 180;
        const px = cx + Math.cos(r) * size * 0.65;
        const py = cy + Math.sin(r) * size * 0.65;
        return <ellipse key={a} cx={px} cy={py} rx={size*0.5} ry={size*0.27} fill={color}
          opacity={0.92} transform={`rotate(${a}, ${px}, ${py})`} />;
      })}
      <circle cx={cx} cy={cy} r={size * 0.3} fill="#FCD34D" />
    </g>
  );
}

function GardenPlant({ x, stage, color }) {
  const ground = 210, sh = STEM_H[Math.min(stage, 4)], topY = ground - sh;
  if (stage === 0) return (
    <g>
      <ellipse cx={x} cy={ground+4} rx={11} ry={6} fill="#92713A" opacity={0.45} />
      <ellipse cx={x} cy={ground+2} rx={5}  ry={4} fill={color}   opacity={0.5}  />
    </g>
  );
  return (
    <g>
      <path d={`M ${x} ${ground} Q ${x-6} ${ground-sh*0.38} ${x} ${topY}`}
        stroke={color} strokeWidth={2.5+stage*0.45} fill="none" strokeLinecap="round" />
      {stage>=1&&<><Leaf cx={x-11} cy={topY+14} rx={5} ry={10} angle={-42} color={color}/><Leaf cx={x+11} cy={topY+14} rx={5} ry={10} angle={42} color={color}/></>}
      {stage>=2&&<><Leaf cx={x-17} cy={topY+sh*0.48} rx={6} ry={13} angle={-48} color={color}/><Leaf cx={x+17} cy={topY+sh*0.48} rx={6} ry={13} angle={48} color={color}/></>}
      {stage>=3&&<><Leaf cx={x-19} cy={topY+sh*0.67} rx={7} ry={14} angle={-44} color={color}/><Leaf cx={x+19} cy={topY+sh*0.67} rx={7} ry={14} angle={44} color={color}/><ellipse cx={x} cy={topY+3} rx={5} ry={9} fill={color} opacity={0.9}/></>}
      {stage>=4&&<><Leaf cx={x-17} cy={topY+sh*0.83} rx={6} ry={12} angle={-38} color={color}/><Leaf cx={x+17} cy={topY+sh*0.83} rx={6} ry={12} angle={38} color={color}/><Flower cx={x} cy={topY} color={color} size={20}/><Flower cx={x-28} cy={topY+sh*0.28} color={color} size={10}/><Flower cx={x+26} cy={topY+sh*0.48} color={color} size={8}/></>}
    </g>
  );
}

function Wildflower({ x, y, color }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y+8} stroke="#4CAF50" strokeWidth={1}/>
      {[0,72,144,216,288].map((a)=>{
        const r=(a*Math.PI)/180;
        return <circle key={a} cx={x+Math.cos(r)*4} cy={y+Math.sin(r)*4} r={2.5} fill={color} opacity={0.85}/>;
      })}
      <circle cx={x} cy={y} r={1.8} fill="#FCD34D"/>
    </g>
  );
}

const MILESTONES_MARKERS = [
  {day:0,   label:"T1"},
  {day:270, label:"Birth"},
  {day:540, label:"6 mo"},
  {day:730, label:"Toddler"},
  {day:999, label:"2yr"},
];

const QUICK_LINKS = [
  {label:"Nutrition", emoji:"🥗", path:"/nutrition", color:"baby"},
  {label:"Mama",      emoji:"💜", path:"/mama",      color:"mama"},
  {label:"Growth",    emoji:"📈", path:"/growth",    color:"baby"},
  {label:"Milestones",emoji:"⭐", path:"/milestones",color:"mama"},
];

function checkPendingCelebration(profile, currentDay) {
  const shown = getCelebrationsShown();
  const weeks = getGestationalWeeks(profile.confirmedPregnancyDate);
  if (weeks !== null) {
    if (weeks >= 13 && !shown.includes('t2')) return 't2';
    if (weeks >= 27 && !shown.includes('t3')) return 't3';
  }
  if (currentDay >= 270 && !shown.includes('birth')) return 'birth';
  if (currentDay >= 999 && !shown.includes('day1000')) return 'day1000';
  return null;
}

export default function Garden() {
  const { currentDay, baby, mama, floraUnread } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [toast, setToast] = useState("");

  const profile = useMemo(() => getProfile(), []);
  const displayDay = useMemo(
    () => profile.confirmedPregnancyDate
      ? (getDayOf1000(profile.confirmedPregnancyDate) ?? currentDay)
      : currentDay,
    [profile, currentDay],
  );
  const stageLabel = useMemo(
    () => getStageLabel(profile.confirmedPregnancyDate, profile.birthDate) || STAGE_LABEL(currentDay),
    [profile, currentDay],
  );
  const motherName = profile.motherName || mama.name || null;
  const babyName   = profile.babyName   || baby.name  || null;

  const [pendingCelebration, setPendingCelebration] = useState(() =>
    checkPendingCelebration(profile, displayDay)
  );

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const isPostBirth = currentDay >= baby.birthDay;
  const ms = mamaStageFor(currentDay);
  const bs = babyStageFor(currentDay, baby.birthDay);
  const vineColor = (ms >= 2 && bs >= 2) ? "#1D9E75" : "#CBD5E1";
  const mamaAnchorY = 210 - STEM_H[ms] * 0.45;
  const babyAnchorY = 210 - STEM_H[bs] * 0.45;

  return (
    <div className="px-4 pt-4 pb-2">
      {pendingCelebration && (
        <MilestoneCelebration
          celebrationId={pendingCelebration}
          onDismiss={() => {
            markCelebrationShown(pendingCelebration);
            setPendingCelebration(null);
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F6E56] tracking-tight leading-none">bloom</h1>
          <p className="text-xs text-gray-400 mt-0.5">Day {displayDay} of your 1,000-day journey</p>
        </div>
        <span className="text-xs bg-[#E1F5EE] text-[#0F6E56] px-3 py-1 rounded-full font-semibold">
          {stageLabel}
        </span>
      </div>

      {motherName && (
        <h2
          className="text-xl font-bold text-[#0F6E56] mb-3 leading-tight"
          style={{ fontFamily: 'Lora, Georgia, serif', fontSize: '20px' }}
        >
          {motherName}'s Garden
        </h2>
      )}

      {/* Garden scene */}
      <div className="rounded-2xl overflow-hidden shadow-md mb-3 border border-gray-100" style={{height:290}}>
        <svg width="100%" height="290" viewBox="0 0 360 290" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="bg-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#7EC8E3"/>
              <stop offset="60%"  stopColor="#C8E9F5"/>
              <stop offset="100%" stopColor="#D9F2E0"/>
            </linearGradient>
            <linearGradient id="bg-soil" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#8B6F3A"/>
              <stop offset="100%" stopColor="#5C4220"/>
            </linearGradient>
            <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#FDE68A" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#FDE68A" stopOpacity="0"/>
            </radialGradient>
            <filter id="drop-shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.12"/>
            </filter>
          </defs>

          <rect width="360" height="290" fill="url(#bg-sky)"/>

          {/* Sun */}
          <circle cx="318" cy="42" r="40" fill="url(#sun-glow)"/>
          <circle cx="318" cy="42" r="24" fill="#FBBF24"/>
          {Array.from({length:8},(_,i)=>{
            const a=(i/8)*360, r=(a*Math.PI)/180;
            return <line key={i} x1={318+Math.cos(r)*30} y1={42+Math.sin(r)*30}
              x2={318+Math.cos(r)*42} y2={42+Math.sin(r)*42}
              stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>;
          })}

          {/* Clouds */}
          <g opacity="0.88">
            <ellipse cx="62"  cy="55" rx="22" ry="13" fill="white"/>
            <ellipse cx="80"  cy="55" rx="20" ry="12" fill="white"/>
            <ellipse cx="71"  cy="46" rx="15" ry="11" fill="white"/>
            <ellipse cx="48"  cy="58" rx="13" ry="10" fill="white"/>
          </g>
          <g opacity="0.72">
            <ellipse cx="196" cy="38" rx="16" ry="9"  fill="white"/>
            <ellipse cx="210" cy="38" rx="14" ry="8"  fill="white"/>
            <ellipse cx="202" cy="31" rx="11" ry="8"  fill="white"/>
          </g>

          {/* Ground */}
          <rect x="0" y="215" width="360" height="75" fill="url(#bg-soil)"/>
          <path d="M 0 218 Q 18 208 36 218 Q 54 208 72 218 Q 90 210 108 218 Q 126 208 144 218 Q 162 210 180 218 Q 198 208 216 218 Q 234 210 252 218 Q 270 208 288 218 Q 306 210 324 218 Q 342 208 360 218 L 360 215 L 0 215 Z" fill="#4CAF50"/>
          {GRASS.map(({x,h,dark},i)=>(
            <path key={i} d={`M ${x} 218 Q ${x-2} ${218-h*0.55} ${x+2.5} ${218-h}`}
              stroke={dark?"#388E3C":"#52B85A"} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          ))}
          {WILDFLOWERS.map((f,i)=><Wildflower key={i} {...f}/>)}
          {SOIL_PEBBLES.map((p,i)=>(
            <ellipse key={i} cx={p.x} cy={p.y} rx={3} ry={2} fill="#7A5C2E" opacity={0.3}/>
          ))}

          {/* Vine */}
          {(ms>0||bs>0)&&(
            <path d={`M 90 ${mamaAnchorY} Q 180 ${Math.min(mamaAnchorY,babyAnchorY)-28} 270 ${babyAnchorY}`}
              stroke={vineColor} strokeWidth="1.8" fill="none" strokeDasharray="7 4" opacity={0.75}/>
          )}

          {/* Plants */}
          <GardenPlant x={90}  stage={ms} color="#7F77DD"/>
          <GardenPlant x={270} stage={bs} color="#1D9E75"/>

          <g filter="url(#drop-shadow)">
            <rect x="40" y="261" width="100" height="18" rx="9" fill="#7F77DD" opacity="0.85"/>
            <text x="90" y="274" textAnchor="middle" fontSize="11"
              fill="white" fontFamily="Lora, Georgia, serif" fontWeight="600">
              {motherName || "Mama"}
            </text>
            <rect x="205" y="261" width="130" height="18" rx="9" fill="#1D9E75" opacity="0.85"/>
            <text x="270" y="274" textAnchor="middle" fontSize="11"
              fill="white" fontFamily="Lora, Georgia, serif" fontWeight="600">
              {isPostBirth ? (babyName || "Your baby 🌱") : "· · ·"}
            </text>
          </g>
        </svg>
      </div>

      {!isPostBirth && (
        <div className="flex justify-end mb-2">
          <span className="text-xs text-[#1D9E75] bg-[#E1F5EE] px-3 py-1 rounded-full font-medium">
            {babyName ? `${babyName} · growing 🌱` : "Your baby 🌱 · growing"}
          </span>
        </div>
      )}

      {/* Day slider */}
      <div className="mb-4 px-1">
        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
          <span>Day 0</span>
          <span className="font-semibold text-[#1D9E75] text-xs">Day {currentDay} · {STAGE_LABEL(currentDay)}</span>
          <span>Day 999</span>
        </div>
        <input type="range" min="0" max="999" value={currentDay}
          onChange={(e) => dispatch({type:"SET_DAY", day:+e.target.value})}
          className="w-full accent-[#1D9E75]"/>
        <div className="flex justify-between mt-1.5 px-0.5">
          {MILESTONES_MARKERS.map(({day,label})=>(
            <button key={day} onClick={()=>dispatch({type:"SET_DAY",day})}
              className={`text-[9px] transition-colors ${Math.abs(currentDay-day)<30?"text-[#1D9E75] font-bold":"text-gray-300 hover:text-gray-400"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <ReminderBanner />

      {/* Quick nav */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        {QUICK_LINKS.map(({label,emoji,path,color})=>(
          <button key={label} onClick={()=>navigate(path)}
            className={`rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-95 ${
              color==="baby"?"bg-[#E1F5EE] text-[#0F6E56] hover:bg-[#C6EDD9]":"bg-[#EEEDFE] text-[#534AB7] hover:bg-[#DCD9FC]"
            }`}>
            <span>{emoji}</span> {label}
          </button>
        ))}
      </div>

      {/* Flora nudge */}
      {floraUnread&&(
        <button onClick={()=>{dispatch({type:"MARK_FLORA_READ"});navigate("/flora");}}
          className="w-full bg-[#534AB7] text-white rounded-xl p-3.5 text-left mb-3 active:scale-95 transition-all">
          <div className="text-sm font-semibold">Flora noticed something — tap to see 🌿</div>
          <div className="text-purple-200 text-xs mt-0.5">Your garden needs attention</div>
        </button>
      )}

      {/* Toast */}
      {toast&&(
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800/90 text-white text-sm px-5 py-2.5 rounded-full z-50 pointer-events-none shadow-lg">
          {toast}
        </div>
      )}

      {/* Demo button */}
      <button onClick={()=>{dispatch({type:"LOAD_DEMO"});showToast("Demo loaded ✓");}}
        className="fixed bottom-[88px] right-4 bg-gray-100 border border-gray-200 text-gray-500 text-xs px-3 py-1.5 rounded-full z-30 shadow-sm">
        Demo
      </button>
    </div>
  );
}
