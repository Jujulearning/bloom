import { NavLink } from "react-router-dom";
import { Leaf, MessageCircle, Utensils, TrendingUp, Heart } from "lucide-react";
import { useAppState } from "../hooks/useAppState";

const TABS = [
  { path: "/",          icon: Leaf,          label: "Garden"    },
  { path: "/flora",     icon: MessageCircle, label: "Flora"     },
  { path: "/nutrition", icon: Utensils,      label: "Nutrition" },
  { path: "/growth",    icon: TrendingUp,    label: "Growth"    },
  { path: "/mama",      icon: Heart,         label: "Mama"      },
];

export default function BottomNav() {
  const { floraUnread } = useAppState();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex h-16">
        {TABS.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
                isActive ? "text-[#1D9E75]" : "text-gray-400"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                  {label === "Flora" && floraUnread && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </div>
                {isActive && (
                  <span className="text-[10px] font-semibold leading-none">{label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
