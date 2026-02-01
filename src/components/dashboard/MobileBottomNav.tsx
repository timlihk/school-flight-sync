import { Calendar, Home, Settings, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type MainNavTab = "today" | "todo" | "calendar" | "settings";

interface MobileBottomNavProps {
  activeTab: MainNavTab;
  onSelect: (tab: MainNavTab) => void;
}

const navItems: Array<{ key: MainNavTab; label: string; icon: typeof Home }> = [
  { key: "today", label: "Today", icon: Home },
  { key: "todo", label: "To Do", icon: CheckCircle2 },
  { key: "calendar", label: "Calendar", icon: Calendar },
  { key: "settings", label: "Settings", icon: Settings },
];

export function MobileBottomNav({ activeTab, onSelect }: MobileBottomNavProps) {
  return (
    <div className="lg:hidden fixed inset-x-4 bottom-4 z-40" data-nav-touch="true">
      <div className="rounded-[28px] border border-white/15 bg-white/5 px-3 pb-[calc(env(safe-area-inset-bottom)+0.85rem)] pt-3 backdrop-blur-xl shadow-[0_25px_60px_rgba(2,6,23,0.35)]">
        <div className="grid grid-cols-4 gap-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                aria-pressed={active}
                data-nav-touch="true"
                onClick={() => onSelect(item.key)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-2xl py-3 text-[11px] font-medium tracking-tight transition border",
                  active
                    ? "bg-white/25 text-slate-900 border-white/40 shadow-[0_12px_30px_rgba(15,23,42,0.35)]"
                    : "bg-white/10 text-white/80 border-white/20 hover:text-white"
                )}
              >
                <Icon className={cn("h-5 w-5", active ? "text-slate-900" : "text-white")} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
