import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./hooks/useAppState";
import BottomNav from "./components/BottomNav";
import Garden from "./components/Garden";
import FloraAdvisor from "./components/FloraAdvisor";
import NutritionTracker from "./components/NutritionTracker";
import GrowthCurve from "./components/GrowthCurve";
import MamaHealth from "./components/MamaHealth";
import Milestones from "./components/Milestones";
import VitaminGuide from "./components/VitaminGuide";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="pb-20">
          <Routes>
            <Route path="/"           element={<Garden />}          />
            <Route path="/flora"      element={<FloraAdvisor />}    />
            <Route path="/nutrition"  element={<NutritionTracker />}/>
            <Route path="/growth"     element={<GrowthCurve />}     />
            <Route path="/mama"       element={<MamaHealth />}      />
            <Route path="/milestones" element={<Milestones />}      />
            <Route path="/vitamins"   element={<VitaminGuide />}    />
            <Route path="/vitamins/:tab" element={<VitaminGuide />} />
          </Routes>
        </div>
        <BottomNav />
      </BrowserRouter>
    </AppProvider>
  );
}
