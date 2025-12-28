import { Button } from "@/components/ui/button";
import { CalendarDays, Home, Plane, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export type MainNavTab = "today" | "trips" | "calendar" | "settings";

interface MobileBottomNavProps {
  activeTab: MainNavTab;
  onSelect: (tab: MainNavTab) => void;
}

const navItems: Array<{ key: MainNavTab; label: string; icon: typeof Home }> = [
  { key: "today", label: "Today", icon: Home },
  { key: "trips", label: "Trips", icon: Plane },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "settings", label: "Settings", icon: Settings },
];

export function MobileBottomNav({ activeTab, onSelect }: MobileBottomNavProps) {
  return (
    <div className="lg:hidden fixed inset-x-4 bottom-4 z-40" data-nav-touch="true">
      <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-card via-card to-muted/30 px-3 pb-[calc(env(safe-area-inset-bottom)+0.85rem)] pt-3 backdrop-blur">
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
                  "flex flex-col items-center justify-center gap-1 rounded-2xl py-3 text-[11px] font-medium tracking-tight transition",
                  active
                    ? "bg-white text-card-foreground shadow-[0_12px_30px_rgba(15,23,42,0.15)]"
                    : "text-white/70 hover:text-white"
                )}
              >
                <Icon className={cn("h-5 w-5", active ? "text-card-foreground" : "text-white/80")} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
